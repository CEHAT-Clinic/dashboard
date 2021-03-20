import {Pm25BufferElement} from './buffer';

/**
 * TODO: Fill comment
 * pm25 is the average of channels A and B
 * meanPercentDifference is calculated from PurpleAir's confidence value
 * a and b are the pseudo averages
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
   * Computes an average reading for the time block provided by the first element
   *
   * @param readings - Array of non-null Pm25BufferElements
   */
  static averageReadings(
    latitude: number,
    longitude: number,
    readings: Array<Pm25BufferElement>
  ): SensorReading {
    let pmReadingSum = 0;
    let humiditySum = 0;

    // TODO: decide how to handle meanPercentDifference
    // Perhaps don't bother here? Filter out bad readings beforehand?
    let meanPercentDifferenceSum = 0;

    // Guaranteed to be okay because this function should only be called with >= 27 items
    const firstReadingData = readings[0];

    // Force that the timestamp is not null. This function is called on an array
    // where we filter by timestamp !== null, so we know that the timestamps are
    // non-null.
    /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
    const timestamp: FirebaseFirestore.Timestamp = firstReadingData.timestamp!;

    for (const reading of readings) {
      pmReadingSum += reading.pm25;
      humiditySum += reading.humidity;
      meanPercentDifferenceSum += reading.meanPercentDifference;
    }

    const pmReadingAverage = pmReadingSum / readings.length;
    const humidityAverage = humiditySum / readings.length;
    const meanPercentDifferenceAverage =
      meanPercentDifferenceSum / readings.length;

    return new this(
      timestamp.toDate(),
      pmReadingAverage,
      meanPercentDifferenceAverage,
      humidityAverage,
      latitude,
      longitude
    );
  }

  /**
   * Creates a SensorReading object from a Firestore reading doc
   * @param data - Firestore document from sensors/sensorDocId/readings collection
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
