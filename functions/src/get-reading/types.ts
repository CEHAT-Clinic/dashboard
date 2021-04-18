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
 *   value returned by the PurpleAir API. This value ranges from 0 to 2.
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
 *   value returned by the PurpleAir API. This value ranges from 0 to 2.
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

export type {HistoricalSensorReading, PurpleAirReading};
