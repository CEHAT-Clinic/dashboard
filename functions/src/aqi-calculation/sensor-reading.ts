/**
 * Complete sensor reading from PurpleAir used for data processing
 * - `timestamp` - timestamp of the sensor reading
 * - `pm25` - PM 2.5 reading, average of the channelA and channelB PM 2.5 readings
 * - `meanPercentDifference` - mean percent difference between channelA reading
 *   and channelB reading
 * - `humidity` - humidity reading
 * - `latitude` - latitude of the sensor
 * - `longitude` - longitude of the sensor
 */
export default class SensorReading {
  timestamp: Date;
  pm25: number;
  meanPercentDifference: number;
  humidity: number;
  latitude: number;
  longitude: number;

  constructor(
    timestamp: Date,
    pm25: number,
    meanPercentDifference: number,
    humidity: number,
    latitude: number,
    longitude: number
  ) {
    this.timestamp = timestamp;
    this.pm25 = pm25;
    this.meanPercentDifference = meanPercentDifference;
    this.humidity = humidity;
    this.latitude = latitude;
    this.longitude = longitude;
  }

  /**
   * Creates single line of CSV code, used for exporting data.
   * Values should be in same order as getCsvHeader.
   */
  toCsvLine(): string {
    return (
      `${this.timestamp.toISOString()}, ` +
      `${this.pm25}, ` +
      `${this.meanPercentDifference}, ` +
      `${this.humidity}, ` +
      `${this.latitude}, ` +
      `${this.longitude}\n`
    );
  }

  /**
   * Creates the header for the CSV file generated from sensor readings.
   * Values should be in same order as toCsvLine.
   */
  static getCsvHeader(): string {
    return (
      'timestamp, ' +
      'pm25, ' +
      'meanPercentDifference, ' +
      'humidity, ' +
      'latitude, ' +
      'longitude\n'
    );
  }
}
