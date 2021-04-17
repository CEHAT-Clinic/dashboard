import firebase from './firebase';
import {AqiBufferElement, Pm25BufferElement, BufferStatus} from './buffer';

const SENSORS = 'sensors';

interface SensorDoc {
  purpleAirId: number;
  name: string;
  latitude: number;
  longitude: number;
  isActive: boolean;
  isValid: boolean;
  lastSensorReadingTime: firebase.firestore.Timestamp | null;
  lastValidAqiTime: firebase.firestore.Timestamp | null;
  aqiBuffer?: AqiBufferElement[];
  aqiBufferIndex?: number;
  aqiBufferStatus: BufferStatus;
  pm25Buffer?: Pm25BufferElement[];
  pm25BufferIndex?: number;
  pm25BufferStatus: BufferStatus;
  lastUpdated: firebase.firestore.Timestamp;
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

interface ReadingsDoc {
  humidity: number;
  latitude: number;
  longitude: number;
  meanPercentDifference: number;
  pm25: number;
  timestamp: firebase.firestore.Timestamp;
}

const USERS = 'users';

interface UserDoc {
  admin: boolean;
  email: string;
  name: string;
}

const CURRENT_READINGS = 'current-reading';

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
  lastValidAqiTime: firebase.firestore.Timestamp | null;
  lastSensorReadingTime: firebase.firestore.Timestamp | null;
}

interface CurrentReadingMap {
  [purpleAirId: number]: CurrentSensorData;
}

interface CurrentReadingSensorDoc {
  data: CurrentReadingMap;
  lastUpdated: firebase.firestore.Timestamp;
}

const DELETION = 'deletion';

interface DeletionMap {
  [sensorDocId: string]: firebase.firestore.Timestamp;
}

interface DeletionTodoDoc {
  deletionMap: DeletionMap;
  lastUpdated: firebase.firestore.Timestamp;
}

export {
  READINGS,
  SENSORS,
  readingsSubcollection,
  USERS,
  CURRENT_READINGS,
  DELETION,
};

export type {
  SensorDoc,
  ReadingsDoc,
  CurrentSensorData,
  CurrentReadingSensorDoc,
  DeletionTodoDoc,
  UserDoc,
};
