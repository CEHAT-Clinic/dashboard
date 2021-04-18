import firebase from '../../../../firebase';

/**
 * Interface for a PurpleAir sensor
 * - `name` - PurpleAir sensor name
 * - `purpleAirId` - PurpleAir sensor ID
 * - `latitude` - latitude of sensor
 * - `longitude` - longitude of sensor
 * - `isActive` - if data is actively being gathered for the sensor
 * - `isValid` - if the current AQI value is valid
 * - `lastValidAqiTime` - the last time the AQI was valid, or null if unknown
 * - `lastSensorReadingTime` - the last time the sensor gave a reading, or
 *   `null` if unknown
 * - `sensorReadingErrors` - array of booleans that correspond to `SensorReadingErrors`
 *   indices
 * - `aqiCalculationErrors` - array of booleans that correspond to `InvalidAqiErrors`
 *   indices
 * - `docId` - document ID of the for the sensor in the sensors collection in
 *   Firestore
 */
interface Sensor {
  name: string;
  purpleAirId: number;
  latitude: number;
  longitude: number;
  isActive: boolean;
  isValid: boolean;
  lastValidAqiTime: firebase.firestore.Timestamp | null;
  lastSensorReadingTime: firebase.firestore.Timestamp | null;
  sensorReadingErrors: boolean[];
  aqiCalculationErrors: boolean[];
  docId: string;
}

/**
 * Structure of a PurpleAir group member returned from the PurpleAir API GET
 * request to get all members of a PurpleAir group.
 * - `id` - the member ID for the sensor in the queried group
 * - `sensor_index` - the PurpleAir ID for the sensor in the queried group
 * - `created` - the number of milliseconds since EPOCH when the sensor was
 *   added to the queried group
 */
interface PurpleAirGroupMember {
  id: number;
  sensor_index: number; // eslint-disable-line camelcase
  created: number;
}

export type {Sensor, PurpleAirGroupMember};
