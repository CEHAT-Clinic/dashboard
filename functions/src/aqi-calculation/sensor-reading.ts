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
   * Creates a SensorReading object from a Firestore reading doc
   * @param data - Firestore document from sensors/sensorDocId/readings collection
   *
   * @remarks
   * There are two structures to the Firestore historical readings. Through
   * March 2021, the historical readings include a channelA and channelB PM 2.5
   * reading. Afterwards, there is only one PM 2.5 reading (the average of the
   * PM 2.5 readings from channelA and channelB) and the meanPercentDifference,
   * which is an estimate of the difference over the average of the pseudo averages
   * of the PM 2.5 readings from channelA and channelB.
   *
   * Thus, for data through March 2021, the `meanPercentDifference` field will
   * be the percent difference between the channelA and channelB reading. For
   * data after March 2021, the `meanPercentDifference` field will be the mean
   * percent difference between channelA and channelB, as calculated from the
   * PurpleAir confidence value.
   */
  static fromFirestore(data: FirebaseFirestore.DocumentData): SensorReading {
    if (data.channelAPm25) {
      const pm25Average = (data.channelAPm25 + data.channelBPm25) / 2; // eslint-disable-line no-magic-numbers
      const difference = Math.abs(data.channelAPm25 - data.channelBPm25);
      const meanPercentDifference = difference / pm25Average;
      return new this(
        data.timestamp.toDate(),
        pm25Average,
        meanPercentDifference,
        data.humidity,
        data.latitude,
        data.longitude
      );
    }
    return new this(
      data.timestamp.toDate(),
      data.pm25,
      data.meanPercentDifference,
      data.humidity,
      data.latitude,
      data.longitude
    );
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
