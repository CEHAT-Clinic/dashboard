/**
 * Full reading information for a PurpleAir sensor from the PurpleAir API
 * - `name` - name of the sensor
 * - `id` - PurpleAir ID of the sensor, also called the sensor_index. This is
 *   the main identifier for a sensor.
 * - `latitude` - latitude of a sensor
 * - `longitude` - longitude of a sensor
 * - `pm25` - PM 2.5 reading for a sensor. This value is the average of the
 *   PM 2.5 reading for channelA and channelB
 * - `humidity` - humidity reading for a sensor
 * - `meanPercentDifference` - mean percent difference between the pseudo averages
 *   of the readings for channelA and channelB, as calculated from the confidence
 *   value returned by the PurpleAir API
 * - `timestamp` - the timestamp of the current reading
 */
interface PurpleAirReading {
  name: string;
  id: number;
  latitude: number;
  longitude: number;
  pm25: number;
  humidity: number;
  meanPercentDifference: number;
  timestamp: Date;
}

/**
 * Sensor reading data that is stored in the readings subcollection
 * - `latitude` - latitude of a sensor
 * - `longitude` - longitude of a sensor
 * - `pm25` - PM 2.5 reading for a sensor. This value is the average of the
 *   PM 2.5 reading for channelA and channelB
 * - `humidity` - humidity reading for a sensor
 * - `meanPercentDifference` - mean percent difference between the pseudo averages
 *   of the readings for channelA and channelB, as calculated from the confidence
 *   value returned by the PurpleAir API
 * - `timestamp` - the timestamp of the current reading
 */
interface HistoricalSensorReading {
  latitude: number;
  longitude: number;
  pm25: number;
  humidity: number;
  meanPercentDifference: number;
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
 * - `downReason` - reason that a sensor is down
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
  downReason: string; // TODO: have booleans for each possible reason
}

export type {
  CurrentReadingSensorData,
  PurpleAirReading,
  HistoricalSensorReading,
};
