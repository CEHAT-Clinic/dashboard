import {AqiBufferElement, Pm25BufferElement, BufferStatus} from './buffer';

const SENSORS = 'sensors';

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

interface ReadingsDoc {
  humidity: number;
  latitude: number;
  longitude: number;
  meanPercentDifference: number;
  pm25: number;
  timestamp: FirebaseFirestore.Timestamp;
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
  lastValidAqiTime: FirebaseFirestore.Timestamp | null;
  lastSensorReadingTime: FirebaseFirestore.Timestamp | null;
}

interface CurrentReadingMap {
  [purpleAirId: number]: CurrentSensorData;
}

interface CurrentReadingSensorDoc {
  data: CurrentReadingMap;
  lastUpdated: FirebaseFirestore.Timestamp;
}

const DELETION = 'deletion';

interface DeletionMap {
  [sensorDocId: string]: FirebaseFirestore.Timestamp;
}

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
