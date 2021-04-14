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

/**
 * Errors that can occur with a sensor. All error types except `ReadingNotReceived`
 * result in a sensor being invalid.
 * - `ReadingNotRecieved` - In the most recent recent call to PurpleAir, no
 *   reading was received for this sensor.
 * - `NoHumidityReading` - No humidity reading was received for a sensor that
 *   had a reading from PurpleAir. For this error, `IncompleteSensorReading` is
 *   also true.
 * - `ChannelsDiverged` - Channel A and Channel B of a PurpleAir sensor have
 *   diverged enough that the sensor values are not used. We determine if the
 *   channels have diverged by calculating the mean percent difference between
 *   the readings for the channels from the confidence value from PurpleAir.
 * - `SensorDowngraded` - If PurpleAir has downgraded Channel A, Channel B, or
 *   both channels of a sensor.
 * - `InfiniteAqi`- If the calculated AQI for a sensor is infinite.
 * - `NotEnoughNewReadings` - If not enough new readings were received for a
 *   sensor in the last 3 hours. Two of the three most recent hours must have at
 *   least 23 new and valid readings. A reading is not valid if the mean percent
 *   difference between Channel A and Channel B is larger than 0.7, the threshold
 *   recommended by the EPA for PurpleAir sensors.
 * - `NotEnoughValidReadings` - If not enough valid readings were received for a
 *   sensor in the last 3 hours. A reading is not valid if the mean percent
 *   difference between Channel A and Channel B is larger than 0.7, the threshold
 *   recommended by the EPA for PurpleAir sensors.
 */
enum SensorErrors {
  ReadingNotReceived,
  NoHumidityReading,
  IncompleteSensorReading,
  ChannelsDiverged,
  SensorDowngraded,
  InfiniteAqi,
  NotEnoughNewReadings,
  NotEnoughValidReadings
}

export type {
  CurrentReadingSensorData,
  PurpleAirReading,
  HistoricalSensorReading,
  SensorErrors,
};
