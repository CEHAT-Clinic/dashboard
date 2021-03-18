import CleanedReadings from './cleaned-reading';
import SensorReading from './sensor-reading';
import {Pm25BufferElement, bufferStatus} from './buffer';

const readingsSubcollection: (docId: string) => string = (docId: string) =>
  `/sensors/${docId}/readings`;

/**
 * Gets the hourly averages for the past 12 hours for a single sensor. If less than
 * 90% of the readings are available for a time period, it leaves the data for that hour
 * as undefined per the EPA guidance to ignore hours without 90% of the data.
 *
 * Note: In the event that a sensor is moved, this function will report meaningless data for
 * the twelve hour period after the sensor is moved. This is because data from both locations
 * will be treated as if they came from the same location because the function assumes a sensor
 * is stationary.
 *
 * @param status - the status of the pm25Buffer (exists, does not exist, in progress)
 * @param bufferIndex - the next index to write to in the buffer
 * @param buffer - the pm25Buffer with the last 12 hours of data
 * @returns - a SensorReading array of length 12 with the average PM 2.5 value for each of the last 12 hours
 */
function getHourlyAverages(
  status: bufferStatus,
  bufferIndex: number,
  buffer: Array<Pm25BufferElement>
): SensorReading[] {
  const LOOKBACK_PERIOD_HOURS = 12;
  const ELEMENTS_PER_HOUR = 30;
  const averages = new Array<SensorReading>(LOOKBACK_PERIOD_HOURS);

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

      // If we have 1 reading every two minutes, there are 30 readings in an hour.
      // 75% of 30 readings is 23 (22.5) readings. As suggested by the EPA, we use
      // 75% instead of 90% so that sensors are more likely to have enough valid
      // data. The acceptability of 75% instead of 95% can be found in the additional
      // slides of the PDF located at the following URL:
      // https://cfpub.epa.gov/si/si_public_file_download.cfm?p_download_id=540979&Lab=CEMM
      // Expressed this way to avoid imprecision of floating point arithmetic.
      const MEASUREMENT_COUNT_THRESHOLD = 23;
      // Remove all invalid readings
      readings.filter(element => element.timestamp !== null);
      if (readings.length >= MEASUREMENT_COUNT_THRESHOLD) {
        averages[hoursAgo] = SensorReading.averageReadings(readings);
      }
    }
  }
  return averages;
}

/**
 * Cleans hourly averages of PM 2.5 readings using the published EPA formula,
 * excluding thoses data points that indicate sensor malfunction. Those
 * data points are represented by NaN.
 *
 * @param averages - array containing sensor readings representing hourly averages
 * @returns an array of numbers representing the corrected PM 2.5 values pursuant
 *          to the EPA formula
 */
function cleanAverages(averages: SensorReading[]): CleanedReadings {
  // These thresholds for the EPA indicate when diverging sensor readings
  // indicate malfunction. The EPA requires that the raw difference between
  // the readings be less than 5 and the percent difference be less than 70%
  const RAW_THRESHOLD = 5;
  const PERCENT_THRESHOLD = 0.7;

  const cleanedAverages = new Array<number>(averages.length);
  let latitude = NaN;
  let longitude = NaN;
  for (let i = 0; i < cleanedAverages.length; i++) {
    const reading = averages[i];
    if (reading !== undefined) {
      // Use first hour's location
      if (isNaN(latitude) || isNaN(longitude)) {
        latitude = reading.latitude;
        longitude = reading.longitude;
      }

      if (
        !(
          reading.percentDifference > PERCENT_THRESHOLD
        )
      ) {
        // Formula from EPA to correct PurpleAir PM 2.5 readings
        // https://cfpub.epa.gov/si/si_public_record_report.cfm?dirEntryId=349513&Lab=CEMM&simplesearch=0&showcriteria=2&sortby=pubDate&timstype=&datebeginpublishedpresented=08/25/2018
        /* eslint-disable no-magic-numbers */
        cleanedAverages[i] =
          0.534 * reading.pm25 - 0.0844 * reading.humidity + 5.604;
        /* eslint-enable no-magic-numbers */
      } else {
        // If reading exceeds thresholds above
        cleanedAverages[i] = Number.NaN;
      }
    } else {
      // If less than 27 data points were available for that hour, the reading
      // would have been undefined
      cleanedAverages[i] = Number.NaN;
    }
  }
  return new CleanedReadings(latitude, longitude, cleanedAverages);
}

/**
 * Interface for the structure of a sensor's data, used in the current-reading
 * collection.
 * - `purpleAirId` - PurpleAir sensor ID
 * - `name` - PurpleAir sensor name
 * - `latitude` - latitude of sensor
 * - `longitude` - longitude of sensor
 * - `isValid` - if the current NowCast PM 2.5 and AQI value are valid
 * - `isActive` - if we should be actively gathering data for the sensor
 * - `aqi` - the current AQI for the sensor, or `NaN` if not enough valid data
 * - `nowCastPm25` - the current NowCast corrected PM 2.5, or `NaN` if not enough valid data
 * - `readingDocId` - document ID of the for the sensor in the sensors collection in Firestore
 * - `lastValidAqiTime` - the last time the AQI was valid, or null if unknown
 * - `lastSensorReadingTime` - the last time the sensor gave a reading, or null if unknown
 */
interface SensorData {
  purpleAirId: string;
  name: string;
  latitude: number;
  longitude: number;
  isValid: boolean;
  isActive: boolean;
  aqi: number;
  nowCastPm25: number;
  readingDocId: string;
  lastValidAqiTime: FirebaseFirestore.Timestamp | null;
  lastSensorReadingTime: FirebaseFirestore.Timestamp | null;
}

export {
  readingsSubcollection,
  getHourlyAverages,
  cleanAverages,
};

export type {SensorData};
