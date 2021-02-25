import PurpleAirResponse from './purple-air-response';
import CleanedReadings from './cleaned-reading';
import axios from 'axios';
import SensorReading from './sensor-reading';
import {firestore, Timestamp} from '../admin';

const thingspeakUrl: (channelId: string) => string = (channelId: string) =>
  `https://api.thingspeak.com/channels/${channelId}/feeds.json`;

const readingsSubcollection: (docId: string) => string = (docId: string) =>
  `/sensors/${docId}/readings`;

/**
 * Fetches the Thingspeak API key from PurpleAir using the PurpleAir sensor ID
 * @param purpleAirId - PurpleAir sensor ID
 */
async function getThingspeakKeysFromPurpleAir(
  purpleAirId: string
): Promise<PurpleAirResponse> {
  const PURPLE_AIR_API_ADDRESS = 'https://www.purpleair.com/json';

  const purpleAirApiResponse = await axios({
    url: PURPLE_AIR_API_ADDRESS,
    params: {
      show: purpleAirId,
    },
  });

  return new PurpleAirResponse(purpleAirApiResponse);
}

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
 * @param docId - Firestore document id for the sensor to be getting averages for
 * @param purpleAirId - PurpleAir ID for the sensor
 */
async function getHourlyAverages(docId: string): Promise<SensorReading[]> {
  const LOOKBACK_PERIOD_HOURS = 12;
  const averages = new Array<SensorReading>(LOOKBACK_PERIOD_HOURS);
  const currentHour: Date = new Date();
  const previousHour = new Date(currentHour);
  // Only modifies the hour field, keeps minutes field constant
  previousHour.setUTCHours(previousHour.getUTCHours() - 1); // eslint-disable-line no-magic-numbers

  const resolvedPath = readingsSubcollection(docId);

  for (let i = 0; i < averages.length; i++) {
    const readings = (
      await firestore
        .collection(resolvedPath)
        .where('timestamp', '>', Timestamp.fromDate(previousHour))
        .where('timestamp', '<=', Timestamp.fromDate(currentHour))
        .get()
    ).docs;

    // If we have 1 reading every two minutes, there are 30 readings in an hour
    // 90% of 30 readings is 27 readings. We must have 90% of the readings from
    // a given hour in order to compute the AQI per the EPA.
    // Expressed this way to avoid imprecision of floating point arithmetic.
    const MEASUREMENT_COUNT_THRESHOLD = 27;
    if (readings.length >= MEASUREMENT_COUNT_THRESHOLD) {
      const reading = SensorReading.averageDocuments(readings);
      averages[i] = reading;
    }

    /* eslint-disable no-magic-numbers */
    currentHour.setUTCHours(currentHour.getUTCHours() - 1);
    previousHour.setUTCHours(previousHour.getUTCHours() - 1);
    /* eslint-enable no-magic-numbers */
  }

  return averages;
}

/**
 * Cleans hourly averages of PM2.5 readings using the published EPA formula,
 * excluding thoses data points that indicate sensor malfunction. Those
 * data points are represented by NaN.
 *
 * @param averages - array containing sensor readings representing hourly averages
 * @returns an array of numbers representing the corrected PM2.5 values pursuant
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

      const averagePmReading =
        (reading.channelAPm25 + reading.channelBPm25) / 2; // eslint-disable-line no-magic-numbers
      const difference = Math.abs(reading.channelAPm25 - reading.channelBPm25);
      if (
        !(
          difference > RAW_THRESHOLD &&
          difference / averagePmReading > PERCENT_THRESHOLD
        )
      ) {
        // Formula from EPA to correct PurpleAir PM 2.5 readings
        // https://cfpub.epa.gov/si/si_public_record_report.cfm?dirEntryId=349513&Lab=CEMM&simplesearch=0&showcriteria=2&sortby=pubDate&timstype=&datebeginpublishedpresented=08/25/2018
        /* eslint-disable no-magic-numbers */
        cleanedAverages[i] =
          0.534 * averagePmReading - 0.0844 * reading.humidity + 5.604;
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

export {
  thingspeakUrl,
  readingsSubcollection,
  getThingspeakKeysFromPurpleAir,
  getHourlyAverages,
  cleanAverages,
};
