import {AqiBufferElement, Pm25BufferElement, BufferStatus} from './buffer';

const SENSORS = 'sensors';

/**
 * Interface for the structure of a sensor's data, used in the `sensors` collection.
 * - `purpleAirId` - PurpleAir sensor ID
 * - `name` - PurpleAir sensor name
 * - `latitude` - latitude of sensor
 * - `longitude` - longitude of sensor
 * - `isValid` - if the current NowCast PM2.5 and AQI value are valid
 * - `isActive` - if we should be actively gathering data for the sensor
 * - `lastValidAqiTime` - the last time the AQI was valid, or null if unknown
 * - `lastSensorReadingTime` - the last time the sensor gave a reading, or null
 *   if unknown
 * - `aqiBuffer` - a circular buffer of the last 24 hours of the AQI for a
 *   sensor, which is calculated every 10 minutes. Each entry is a map of an
 *   index in the buffer to an `AqiBufferElement`
 * - `aqiBufferIndex` - the index of the most recent AQI in the `aqiBuffer`
 * - `aqiBufferStatus` - if the `aqiBuffer` exists, does not exist, or is in the
 *   process of being initialized
 * - `pm25Buffer` - a circular buffer of the last 12 hours of PM2.5 readings for a
 *   sensor, which is updated every 2 minutes. Each entry is a map of an index
 *   in the buffer to a `Pm25BufferElement`
 * - `pm25BufferIndex` - the index of the most recent PM2.5 reading in the `pm25Buffer`
 * - `pm25BufferStatus` - if the `pm25Buffer` exists, does not exist, or is in the
 *   process of being initialized
 * - `lastUpdated` - the last time the sensor doc was updated
 */
interface SensorDoc {
  purpleAirId: number;
  name: string;
  latitude: number;
  longitude: number;
  isActive: boolean;
  isValid: boolean;
  lastSensorReadingTime: FirebaseFirestore.Timestamp | null;
  lastValidAqiTime: FirebaseFirestore.Timestamp | null;
  aqiBuffer?: AqiBufferElement[];
  aqiBufferIndex?: number;
  aqiBufferStatus: BufferStatus;
  pm25Buffer?: Pm25BufferElement[];
  pm25BufferIndex?: number;
  pm25BufferStatus: BufferStatus;
  lastUpdated: FirebaseFirestore.Timestamp;
}

const READINGS = 'readings';

/**
 * Gets the name of the readings subcollection given the sensor doc ID
 * @param sensorDocId - Firestore document ID for the sensor
 * @returns the name of the readings subcollection for a sensor
 */
const readingsSubcollection: (sensorDocId: string) => string = (
  sensorDocId: string
) => `${SENSORS}/${sensorDocId}/${READINGS}`;

/**
 * Sensor reading data that is stored in the readings subcollection
 * - `latitude` - latitude of a sensor
 * - `longitude` - longitude of a sensor
 * - `pm25` - PM2.5 reading for a sensor. This value is the average of the
 *   PM2.5 reading for channelA and channelB
 * - `humidity` - humidity reading for a sensor
 * - `meanPercentDifference` - mean percent difference between the pseudo averages
 *   of the readings for channelA and channelB, as calculated from the confidence
 *   value returned by the PurpleAir API. This value ranges from 0 to 2.
 * - `timestamp` - the timestamp of the current reading
 */
interface ReadingsDoc {
  humidity: number;
  latitude: number;
  longitude: number;
  meanPercentDifference: number;
  pm25: number;
  timestamp: FirebaseFirestore.Timestamp;
}

const USERS = 'users';

/**
 * Data that is stored in a user's doc
 * - `admin` - if the user is an admin user or not
 * - `email` - the user's email
 * - `name` - the user's name, or the empty string if the user has not yet added
 *   their name
 */
interface UserDoc {
  admin: boolean;
  email: string;
  name: string;
}

const CURRENT_READINGS = 'current-reading';

const SENSORS_DOC = 'sensors';

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
 * - `nowCastPm25` - the current NowCast corrected PM2.5, or `NaN` if not enough
 *   valid data
 * - `readingDocId` - document ID of the for the sensor in the sensors
 *   collection in Firestore
 * - `lastValidAqiTime` - the last time the AQI was valid, or null if unknown
 * - `lastSensorReadingTime` - the last time the sensor gave a reading, or null
 *   if unknown
 */
interface CurrentSensorData {
  purpleAirId: number;
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

/**
 * The map of current readings in the `sensors` doc in the `current-readings`
 * collection. Each entry in the map is a sensor's PurpleAir ID to that sensor's
 * `CurrentSensorData`.
 */
interface CurrentReadingMap {
  [purpleAirId: number]: CurrentSensorData;
}

/**
 * Interface for the structure of the `sensors` doc in the `current-readings`
 * collection.
 * - `data` - map of a sensor's PurpleAir ID to that sensor's `CurrentSensorData`
 * - `lastUpdated` - when the document was last updated
 */
interface CurrentReadingSensorDoc {
  data: CurrentReadingMap;
  lastUpdated: FirebaseFirestore.Timestamp;
}

const DELETION = 'deletion';

const TODO_DOC = 'todo';

/**
 * The map of the documents to be deleted in the `todo` doc in the `deletion`
 * collection. Each entry in the map is a sensor's document ID in the `sensors`
 * collection to the timestamp for which data before that timestamp should be
 * deleted.
 */
interface DeletionMap {
  [sensorDocId: string]: FirebaseFirestore.Timestamp;
}

/**
 * Interface for the structure of the `todo` doc in the `deletion` collection.
 * - `deletionMap` - map of a sensor's doc ID in the `sensors` collection to the
 *   timestamp for which data before that timestamp should be deleted
 * - `lastUpdated` - when the document was last updated
 */
interface DeletionTodoDoc {
  deletionMap: DeletionMap;
  lastUpdated: FirebaseFirestore.Timestamp;
}

export {
  READINGS,
  SENSORS,
  readingsSubcollection,
  USERS,
  CURRENT_READINGS,
  SENSORS_DOC,
  DELETION,
  TODO_DOC,
};

export type {
  SensorDoc,
  ReadingsDoc,
  CurrentSensorData,
  CurrentReadingSensorDoc,
  DeletionTodoDoc,
  UserDoc,
};
