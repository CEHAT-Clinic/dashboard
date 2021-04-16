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
 * Errors that can occur during the AQI calculation process. Any of these errors
 * will result in a sensor being invalid.
 *
 * - `InfiniteAqi`- If the calculated AQI for a sensor is infinite.
 * - `NotEnoughNewReadings` - If not enough new readings were received for a
 *   sensor in the last 3 hours. Two of the three most recent hours must have at
 *   least 23 new (and valid) readings. This error only reflects if not enough
 *   new readings are being received. This error can also occur soon after a
 *   sensor is activated if not enough new readings are stored in the PM2.5
 *   buffer yet.
 * - `NotEnoughRecentValidReadings` - If not enough valid readings were received for a
 *   sensor in the last 3 hours. A reading is not valid if the mean percent
 *   difference between Channel A and Channel B is larger than 0.7, the threshold
 *   recommended by the EPA for PurpleAir sensors.
 */
enum InvalidAqiErrors {
  InfiniteAqi,
  NotEnoughNewReadings,
  NotEnoughRecentValidReadings,
}

/**
 * Returns a default error array for AQI calculation errors
 * @returns an array for each `InvalidAqiErrors` with each error set to `false`.
 */
function getDefaultInvalidAqiErrors(): Array<boolean> {
  // TypeScript does not provide a way to get the number of elements in an enum,
  // so this gets the number of elements using the enum reverse mapping.
  // eslint-disable-next-line no-magic-numbers
  const invalidAqiErrorCount = Object.keys(InvalidAqiErrors).length / 2;
  return new Array<boolean>(invalidAqiErrorCount).fill(false);
}

export type {CurrentReadingSensorData};

export {InvalidAqiErrors, getDefaultInvalidAqiErrors};
