import PurpleAirResponse from './purple-air-response';
import axios from 'axios';

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
 * For a given readings subcollection, gets the most recent reading Timestamp
 * @param readingsCollectionRef - reference to readings collection for sensor to get the most recent reading time
 * @returns a Promise of the Timestamp of the most recent sensor reading time, or null if no readings
 */
async function getLastSensorReadingTime(
  readingsCollectionRef: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>
): Promise<FirebaseFirestore.Timestamp | null> {
  let lastSensorReadingTime: FirebaseFirestore.Timestamp | null = null;
  const maxDocs = 1;
  const querySnapshot = await readingsCollectionRef
    .orderBy('timestamp', 'desc')
    .limit(maxDocs)
    .get();
  // There should only be one document in docs, but loops over docs since it's an array
  for (const sensorDoc of querySnapshot.docs) {
    if (sensorDoc.data().timestamp) {
      lastSensorReadingTime = sensorDoc.data().timestamp;
    }
  }
  return lastSensorReadingTime;
}

/**
 * Sensor reading data that is stored in the readings subcollection
 * - `latitude` - latitude of a sensor
 * - `longitude` - longitude of a sensor
 * - `channelAPm25` - PM2.5 reading for channel A
 * - `channelBPm25` - PM2.5 reading for channel B
 * - `humidity` - humidity reading for a sensor
 * - `timestamp` - the timestamp of the current reading
 */
interface HistoricalSensorReading {
  latitude: number;
  longitude: number;
  channelAPm25: number;
  channelBPm25: number;
  humidity: number;
  timestamp: FirebaseFirestore.Timestamp;
}

/**
 * Interface for the structure of a sensor's data, used in the `current-reading`
 * collection in the `sensors` doc.
 * - `purpleAirId` - PurpleAir sensor ID
 * - `name` - PurpleAir sensor name
 * - `latitude` - latitude of sensor
 * - `longitude` - longitude of sensor
 * - `isValid` - if the current NowCast PM2.5 and AQI value are valid
 * - `isActive` - if we should be actively gathering data for the sensor
 * - `aqi` - the current AQI for the sensor, or `NaN` if not enough valid data
 * - `nowCastPm25` - the current NowCast corrected PM2.5, or `NaN` if not enough valid data
 * - `readingDocId` - document ID of the for the sensor in the sensors collection in Firestore
 * - `lastValidAqiTime` - the last time the AQI was valid, or null if unknown
 * - `lastSensorReadingTime` - the last time the sensor gave a reading, or null if unknown
 */
interface CurrentReadingSensorData {
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
  thingspeakUrl,
  readingsSubcollection,
  getThingspeakKeysFromPurpleAir,
  getLastSensorReadingTime,
};

export type {CurrentReadingSensorData, HistoricalSensorReading};
