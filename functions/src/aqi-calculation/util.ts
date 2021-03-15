import PurpleAirResponse from './purple-air-response';
import CleanedReadings from './cleaned-reading';
import axios from 'axios';
import SensorReading from './sensor-reading';
import {firestore} from '../admin';
import {Pm25BufferElement, bufferStatus} from './buffer';

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
function getHourlyAverages(docId: string): Promise<SensorReading[]> {
  const LOOKBACK_PERIOD_HOURS = 12;
  const ELEMENTS_PER_HOUR = 30;
  const averages = new Array<SensorReading>(LOOKBACK_PERIOD_HOURS);

  const docRef = firestore.collection('sensors').doc(docId);
  docRef.get().then(doc => {
    if (doc.exists) {
      // Get buffer and buffer index
      const status = doc.get('pm25BufferStatus');
      const buffer = doc.get('pm25Buffer');
      const bufferIndex = doc.get('pm25BufferIndex');
      // If we have the relevant fields:
      if (status === bufferStatus.Exists && buffer && bufferIndex) {
        let readings: Array<Pm25BufferElement> = [];
        // Get sub-array that is relevant for each hour
        for (let i = 0; i < averages.length; i++) {
          const startIndex = bufferIndex - ELEMENTS_PER_HOUR * i;
          const endIndex = bufferIndex - ELEMENTS_PER_HOUR * (i + 1);
          if (startIndex >= 0 && endIndex >= 0) {
            readings = buffer.slice(startIndex, endIndex);
          } else if (startIndex < 0 && endIndex >= 0) {
            const leftArray = buffer.slice(
              buffer.length + startIndex,
              buffer.length
            );
            const rightArray = buffer.slice(0, endIndex);
            readings = leftArray.concat(rightArray);
          } else {
            // Start and end indices are both less than 0
            readings = buffer.slice(
              bufferIndex + startIndex,
              bufferIndex + endIndex
            );
          }

          // If we have 1 reading every two minutes, there are 30 readings in an hour
          // 90% of 30 readings is 27 readings. We must have 90% of the readings from
          // a given hour in order to compute the AQI per the EPA.
          // Expressed this way to avoid imprecision of floating point arithmetic.
          const MEASUREMENT_COUNT_THRESHOLD = 27;
          // Remove all invalid readings
          readings.filter(element => element.timestamp !== null);
          if (readings.length >= MEASUREMENT_COUNT_THRESHOLD) {
            const reading = SensorReading.averageReadings(readings);
            averages[i] = reading;
          }
        }
      }
    }
  });
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

/**
 * Interface for the structure of a sensor's data, used in the current-reading
 * collection.
 * - `purpleAirId` - PurpleAir sensor ID
 * - `name` - PurpleAir sensor name
 * - `latitude` - latitude of sensor
 * - `longitude` - longitude of sensor
 * - `isValid` - if the current NowCast PM 2.5 and AQI value are valid
 * - `aqi` - the current AQI for the sensor, or `NaN` if not enough valid data
 * - `nowCastPm25` - the current NowCast corrected PM 2.5, or `NaN` if not enough valid data
 * - `readingDocId` - document ID of the for the sensor in the sensors collection in Firestore
 * - `lastValidAqiTime` - the last time the AQI was valid, or null if unknown
 */
interface SensorData {
  purpleAirId: string;
  name: string;
  latitude: number;
  longitude: number;
  isValid: boolean;
  aqi: number;
  nowCastPm25: number;
  readingDocId: string;
  lastValidAqiTime: FirebaseFirestore.Timestamp | null;
}

export {
  thingspeakUrl,
  readingsSubcollection,
  getThingspeakKeysFromPurpleAir,
  getHourlyAverages,
  cleanAverages,
};

export type {SensorData};
