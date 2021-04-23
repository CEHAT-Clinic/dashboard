import {AqiBufferElement, Pm25BufferElement, BufferStatus} from './buffer';
import {InvalidAqiError} from './aqi-calculation/invalid-aqi-errors';
import {SensorReadingError} from './get-reading/sensor-errors';

/**
 * Name of the collection in Firestore where sensor data is stored for each
 * PurpleAir sensor.
 */
const SENSORS_COLLECTION = 'sensors';

/**
 * Interface for the structure of a sensor's data, used in `SENSORS_COLLECTION`.
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
 * - `aqiBufferIndex` - the index of the oldest AQI in the `aqiBuffer`, i.e.
 *   the next index of the `aqiBuffer` to write new data to.
 * - `aqiBufferStatus` - if the `aqiBuffer` exists, does not exist, or is in the
 *   process of being initialized
 * - `pm25Buffer` - a circular buffer of the last 12 hours of PM2.5 readings for
 *   a sensor, which is updated every 2 minutes. Each entry is a map of an index
 *   in the buffer to a `Pm25BufferElement`
 * - `pm25BufferIndex` - the index of the oldest PM2.5 reading in the
 *   `pm25Buffer`, i.e. the next index of the `pm25Buffer` to write to.
 * - `pm25BufferStatus` - if the `pm25Buffer` exists, does not exist, or is in
 *   the process of being initialized
 * - `sensorReadingErrors` - array of `SensorReadingError` that represent errors
 *   from the most recent time the Cloud Functions attempted to receive an error
 *   from PurpleAir
 * - `invalidAqiErrors` - array of `InvalidAqiError` that represent errors that
 *   can indicate why a sensor does not have a valid AQI, or why the sensor is
 *   invalid.
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
  sensorReadingErrors: SensorReadingError[];
  invalidAqiErrors: InvalidAqiError[];
  lastUpdated: FirebaseFirestore.Timestamp;
}

/**
 * Name of the collection in Firestore where a sensor's readings are stored.
 * `READINGS` exists as a subcollection for each `SENSORS_COLLECTION`'s
 * document, so use `readingsSubcollection` to get the full subcollection name
 * for a sensor.
 */
const READINGS_COLLECTION = 'readings';

/**
 * Gets the name of the readings subcollection given the sensor doc ID
 * @param sensorDocId - Firestore document ID for the sensor
 * @returns the name of the readings subcollection for a sensor
 */
const readingsSubcollection: (sensorDocId: string) => string = (
  sensorDocId: string
) => `${SENSORS_COLLECTION}/${sensorDocId}/${READINGS_COLLECTION}`;

/**
 * Sensor reading data that is stored in `READINGS_COLLECTION` for a sensor
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

/**
 * Name of the collection in Firestore where data for each user is stored.
 * Each document ID in `USERS_COLLECTION` is the corresponding user's `uid` from
 * Firebase Authentication.
 */
const USERS_COLLECTION = 'users';

/**
 * Data that is stored in a user's doc in `USERS_COLLECTION`
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

/**
 * Name of the collection in Firestore where the most recent data is stored.
 * This collection is used to display data for any user of the website.
 */
const CURRENT_READING_COLLECTION = 'current-reading';

/**
 * Name of the document in the `CURRENT_READING_COLLECTION` that stores the
 * most recent information for each sensor.
 */
const SENSORS_DOC = 'sensors';

/**
 * Interface for the structure of a sensor's data, used in the
 * `CURRENT_READING_COLLECTION` in `SENSORS_DOC`.
 * - `purpleAirId` - PurpleAir sensor ID
 * - `name` - PurpleAir sensor name
 * - `latitude` - latitude of sensor
 * - `longitude` - longitude of sensor
 * - `isValid` - if the current NowCast PM2.5 and AQI value are valid
 * - `isActive` - if we should be actively gathering data for the sensor
 * - `aqi` - the current AQI for the sensor, or `NaN` if not enough valid data
 * - `nowCastPm25` - the current NowCast corrected PM2.5, or `NaN` if not enough
 *   valid data
 * - `readingDocId` - document ID of the for the sensor in `SENSORS_COLLECTION`
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
 * The map of a sensor's PurpleAir ID to the sensor's current data in the
 * `SENSORS_DOC` in `CURRENT_READING_COLLECTION`. Each entry in the map is a
 * sensor's PurpleAir ID to that sensor's `CurrentSensorData`.
 */
interface CurrentReadingMap {
  [purpleAirId: number]: CurrentSensorData;
}

/**
 * Interface for the structure of `SENSORS_DOC` in `CURRENT_READING_COLLECTION`.
 * - `data` - map of a sensor's PurpleAir ID to that sensor's `CurrentSensorData`
 * - `lastUpdated` - when `SENSORS_DOC` was last updated
 */
interface CurrentReadingSensorDoc {
  data: CurrentReadingMap;
  lastUpdated: FirebaseFirestore.Timestamp;
}

/**
 * Name of the collection in Firestore where the information about which data
 * should be deleted by the Cloud Functions is stored.
 */
const DELETION_COLLECTION = 'deletion';

/**
 * Name of the document in `DELETION_COLLECTION` where the information about
 * which sensor readings should be deleted by the Cloud Functions is stored.
 */
const READINGS_DELETION_DOC = 'readings';

/**
 * Name of the document in `DELETION_COLLECTION` where the information about
 * which sensor readings should be deleted by the Cloud Functions is stored.
 */
const USER_DELETION_DOC = 'users';

/**
 * The map of the documents to be deleted in `READINGS_DELETION_DOC` in the
 * `DELETION_COLLECTION`. Each entry in the map is a sensor's document ID in
 * `SENSORS_COLLECTION` to the timestamp for which data before that timestamp
 * should be deleted.
 */
interface ReadingDeletion {
  [sensorDocId: string]: FirebaseFirestore.Timestamp;
}

/**
 * Interface for the structure of `READING_DELETION_DOC` in `DELETION_COLLECTION`.
 * - `deletionMap` - map of a sensor's doc ID in `SENSORS_COLLECTION` to the
 *   timestamp for which data before that timestamp should be deleted
 * - `lastUpdated` - when `READING_DELETION_DOC` was last updated
 */
interface ReadingDeletionDoc {
  deletionMap: ReadingDeletion;
  lastUpdated: FirebaseFirestore.Timestamp;
}

/**
 * Interface for the structure of `USER_DELETION_DOC` in `DELETION_COLLECTION`.
 * - `firebaseUsers` - array of user IDs that should be deleted from Firebase
 *   Authentication
 * - `userDocs` - array of user IDs that should be deleted from
 *   `USERS_COLLECTION`, where each user ID is the doc ID of that user's doc in
 *   `USERS_COLLECTION`
 * - `lastUpdated` - when `USER_DELETION_DOC` was last updated
 */
interface UserDeletionDoc {
  firebaseUsers: string[];
  userDocs: string[];
  lastUpdated: FirebaseFirestore.Timestamp;
}

export {
  READINGS_COLLECTION,
  SENSORS_COLLECTION,
  readingsSubcollection,
  USERS_COLLECTION,
  CURRENT_READING_COLLECTION,
  SENSORS_DOC,
  DELETION_COLLECTION,
  READINGS_DELETION_DOC,
  USER_DELETION_DOC,
};

export type {
  SensorDoc,
  ReadingsDoc,
  CurrentSensorData,
  CurrentReadingSensorDoc,
  ReadingDeletionDoc,
  UserDeletionDoc,
  UserDoc,
};
