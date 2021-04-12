import firebase from '../../../firebase';

/**
 * Interface for a PurpleAir sensor
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
