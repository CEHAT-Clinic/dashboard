import {Pm25BufferElement, bufferStatus} from './buffer';

/**
 * Basic sensor reading used in data cleaning
 * - `pm25` - PM 2.5 reading, average of channelA and channelB of PurpleAir sensor
 * - `humidity` - humidity reading
 */
interface BasicReading {
  pm25: number;
  humidity: number;
}

/**
 * Computes an average reading for the time block provided by the first element
 * @param readings - Array of non-null Pm25BufferElements
 */
function averageReadings(readings: Array<Pm25BufferElement>): BasicReading {
  let pmReadingSum = 0;
  let humiditySum = 0;

  for (const reading of readings) {
    pmReadingSum += reading.pm25;
    humiditySum += reading.humidity;
  }

  const averageReading: BasicReading = {
    pm25: pmReadingSum / readings.length,
    humidity: humiditySum / readings.length,
  };

  return averageReading;
}

/**
 * Gets the hourly averages for the past 12 hours for a single sensor. If less than
 * 90% of the readings are available for a time period, it leaves the data for that hour
 * as undefined per the EPA guidance to ignore hours without 75% of the data.
 * @param status - the status of the pm25Buffer (exists, does not exist, in progress)
 * @param bufferIndex - the next index to write to in the buffer
 * @param buffer - the pm25Buffer with the last 12 hours of data
 * @returns a BasicReading array of length 12 with the average PM2.5 value for each of the last 12 hours. If an hour lacks enough readings, then the entry for that hour is `undefined`.
 *
 * @remarks
 * In the event that a sensor is moved, this function will report meaningless data for
 * the twelve hour period after the sensor is moved. This is because data from both locations
 * will be treated as if they came from the same location because the function assumes a sensor
 * is stationary.
 *
 * @remarks
 * A sensor reading for a given slot in the circular buffer is considered invalid
 * for two possible reasons. The reading is invalid if the timestamp is null
 * because we use the null to indicate that a new reading was not available at
 * the time of the query. The reading is also invalid if the mean percent difference
 * between the readings from channelA and channelB of a sensor has gotten too
 * large, since this possibly indicates sensor malfunction.
 *
 * The EPA recommends that you only use a reading if the raw difference between
 * channel A and channel B PM2.5 readings is less than 5 units and that the mean percent
 * difference is less than 70%. Due to limitations in the PurpleAir group query API,
 * we can only access the mean percent difference for a sensor, so we do not check
 * the raw threshold.
 */
function getHourlyAverages(
  status: bufferStatus,
  bufferIndex: number,
  buffer: Array<Pm25BufferElement>
): BasicReading[] {
  const LOOKBACK_PERIOD_HOURS = 12;
  const ELEMENTS_PER_HOUR = 30;
  const averages = new Array<BasicReading>(LOOKBACK_PERIOD_HOURS);

  // If we have the relevant fields:
  if (status === bufferStatus.Exists && buffer && bufferIndex) {
    let readings: Array<Pm25BufferElement> = [];
    // Get sub-array that is relevant for each hour
    let endIndex = bufferIndex;
    let startIndex = bufferIndex - ELEMENTS_PER_HOUR;
    for (let hoursAgo = 0; hoursAgo < LOOKBACK_PERIOD_HOURS; hoursAgo++) {
      if (startIndex >= 0 && endIndex > 0) {
        readings = buffer.slice(startIndex, endIndex);
      } else if (startIndex < 0 && endIndex > 0) {
        // This case occurs when we reach the end of the circular buffer, so some
        // data is at the end of the buffer and some is at the beginning.
        // Segment from the end of the buffer
        const leftArray = buffer.slice(
          buffer.length + startIndex,
          buffer.length
        );
        // Segment from the beginning of the buffer
        const rightArray = buffer.slice(0, endIndex);
        readings = leftArray.concat(rightArray);
      } else {
        // Start and end indices are both less than 0
        readings = buffer.slice(
          buffer.length + startIndex,
          buffer.length + endIndex
        );
      }
      endIndex = startIndex;
      startIndex -= ELEMENTS_PER_HOUR;

      // This threshold for the EPA indicates when readings from the channelA and
      // channelB of a sensor have diverged. The EPA requires that the raw
      // difference between each channel be less than 5 and the percent
      // difference be less than 70%. We only check the percent threshold due to
      // the data we have access to through the PurpleAir group sensor query.
      const PERCENT_THRESHOLD = 0.7;

      // Only keep valid readings. A reading is valid if its timestamp is not
      // null, meaning that a new reading was available for that two-minute
      // time period, or if the meanPercentDifference is less than 70%.
      readings
        .filter(element => element.timestamp !== null)
        .filter(
          element =>
            !isNaN(element.meanPercentDifference) &&
            element.meanPercentDifference < PERCENT_THRESHOLD
        );

      // If we have 1 reading every two minutes, there are 30 readings in an hour.
      // 75% of 30 readings is 23 (22.5) readings. As suggested by the EPA, we use
      // 75% instead of 90% so that sensors are more likely to have enough valid
      // data. The acceptability of 75% instead of 95% can be found in the additional
      // slides of the PDF located at the following URL:
      // https://cfpub.epa.gov/si/si_public_file_download.cfm?p_download_id=540979&Lab=CEMM
      // Expressed this way to avoid imprecision of floating point arithmetic.
      const MEASUREMENT_COUNT_THRESHOLD = 23;
      if (readings.length >= MEASUREMENT_COUNT_THRESHOLD) {
        averages[hoursAgo] = averageReadings(readings);
      }
    }
  }
  return averages;
}

/**
 * Cleans hourly averages of PM2.5 readings using the published EPA formula,
 * excluding thoses data points that indicate sensor malfunction. Those
 * data points are represented by NaN.
 * @param averages - array containing sensor readings representing hourly averages. An entry in the array can be undefined if there were not enough valid readings for the corresponding hour.
 * @returns an array of numbers representing the corrected PM2.5 values pursuant to the EPA formula, `NaN` if the readings for an hour are not valid
 *
 */
function cleanAverages(averages: BasicReading[]): number[] {
  const cleanedAverages = new Array<number>(averages.length).fill(Number.NaN);
  for (let i = 0; i < cleanedAverages.length; i++) {
    const reading = averages[i];
    // If less than 23 data points were available for that hour, the reading
    // would have been undefined, and this hour is discarded (represented by NaN)
    if (reading) {
      // Formula from EPA to correct PurpleAir PM 2.5 readings
      // https://cfpub.epa.gov/si/si_public_record_report.cfm?dirEntryId=349513&Lab=CEMM&simplesearch=0&showcriteria=2&sortby=pubDate&timstype=&datebeginpublishedpresented=08/25/2018
      /* eslint-disable no-magic-numbers */
      cleanedAverages[i] =
        0.534 * reading.pm25 - 0.0844 * reading.humidity + 5.604;
      /* eslint-enable no-magic-numbers */
    }
  }
  return cleanedAverages;
}

/**
 * Wrapper function for averaging and cleaning the readings data
 * @param status - the status of the pm25Buffer (exists, does not exist, in progress)
 * @param bufferIndex - the next index to write to in the buffer
 * @param buffer - the pm25Buffer with the last 12 hours of data
 * @returns an array of numbers representing the corrected PM2.5 values pursuant to the EPA formula, `NaN` if the readings for an hour are not valid
 */
function getCleanedAverages(
  status: bufferStatus,
  bufferIndex: number,
  buffer: Array<Pm25BufferElement>
): number[] {
  // Get hourly averages from the PM2.5 Buffer, and mark any hours without enough
  // valid readings as invalid
  const hourlyAverages: BasicReading[] = getHourlyAverages(
    status,
    bufferIndex,
    buffer
  );
  // Apply EPA correction factor to the PurpleAir readings
  return cleanAverages(hourlyAverages);
}

/**
 * Applies the NowCast PM2.5 conversion algorithm from the EPA to hourly PM2.5 readings
 * Formula from AirNow by the EPA
 * https://usepa.servicenowservices.com/airnow?id=kb_article&sys_id=fed0037b1b62545040a1a7dbe54bcbd4
 * @param cleanedAverages - A list of numbers with 12 hours of data where at least two of the last three hours are valid data points
 * @returns the NowCast PM2.5 corrected value
 */
function cleanedReadingsToNowCastPm25(cleanedAverages: number[]): number {
  let minimum = Number.MAX_VALUE;
  let maximum = Number.MIN_VALUE;

  for (const reading of cleanedAverages) {
    if (!Number.isNaN(reading)) {
      minimum = Math.min(minimum, reading);
      maximum = Math.max(maximum, reading);
    }
  }

  const scaledRateOfChange = (maximum - minimum) / maximum;
  const MINIMUM_WEIGHT_FACTOR = 0.5;
  // Base weight factor to apply to each hour's reading
  // which will be raised to the power of the number of hours
  // ago the measurement is from, reducing the weight of later hours
  const weightFactor = Math.max(
    MINIMUM_WEIGHT_FACTOR,
    1 - scaledRateOfChange // eslint-disable-line no-magic-numbers
  );

  let weightedAverageSum = 0;
  let weightSum = 0;
  let currentHourWeight = 1;
  // Most recent hour has index 0, older readings have larger indices
  // Formula from the EPA at
  // https://usepa.servicenowservices.com/airnow?id=kb_article&sys_id=fed0037b1b62545040a1a7dbe54bcbd4
  for (let i = 0; i < cleanedAverages.length; i++) {
    if (!Number.isNaN(cleanedAverages[i])) {
      weightedAverageSum += currentHourWeight * cleanedAverages[i];
      weightSum += currentHourWeight;
    }
    // Implement power function without recalculating each iteration
    currentHourWeight *= weightFactor;
  }
  return weightedAverageSum / weightSum;
}

export {getCleanedAverages, cleanedReadingsToNowCastPm25};
