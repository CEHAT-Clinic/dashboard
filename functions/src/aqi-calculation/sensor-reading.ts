import {Pm25BufferElement} from './buffer';

/**
 * TODO: Fill comment
 * pm25 is the average of channels A and B
 * percentDifference is calculated from PurpleAir's confidence value
 * a and b are the psuedo averages
 */
export default class SensorReading {
  timestamp: Date;
  pm25: number;
  percentDifference: number;
  humidity: number;
  latitude: number;
  longitude: number;

  constructor(
    timestamp: Date,
    pm25: number,
    percentDifference: number,
    humidity: number,
    latitude: number,
    longitude: number
  ) {
    this.timestamp = timestamp;
    this.pm25 = pm25;
    this.percentDifference = percentDifference;
    this.humidity = humidity;
    this.latitude = latitude;
    this.longitude = longitude;
  }
  /**
   * Computes an average reading for the time block provided by the first element
   *
   * @param readings - Array of non-null Pm25BufferElements
   */
  static averageReadings(readings: Array<Pm25BufferElement>): SensorReading {
    let pmReadingSum = 0;
    let humiditySum = 0;

    // TODO: decide how to handle percentDifference
    // Perhaps don't bother here? Filter out bad readings beforehand?
    let percentDifferenceSum = 0;

    // Guaranteed to be okay because this function should only be called with >= 27 items
    const firstReadingData = readings[0];
    const latitude = firstReadingData.latitude;
    const longitude = firstReadingData.longitude;

    // Force that the timestamp is not null. This function is called on an array
    // where we filter by timestamp !== null, so we know that the timestamps are
    // non-null.
    /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
    const timestamp: FirebaseFirestore.Timestamp = firstReadingData.timestamp!;

    for (const reading of readings) {
      pmReadingSum += reading.pm25;
      humiditySum += reading.humidity;
      percentDifferenceSum += reading.percentDifference;
    }

    const pmReadingAverage = pmReadingSum / readings.length;
    const humidityAverage = humiditySum / readings.length;
    const percentDifferenceAverage = percentDifferenceSum = readings.length;

    return new this(
      timestamp.toDate(),
      pmReadingAverage,
      percentDifferenceAverage,
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
    return new this(
      data.timestamp.toDate(),
      data.channelAPm25,
      data.channelBPm25,
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
      `${this.percentDifference}, ` +
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
      'percentDifference, ' +
      'humidity, ' +
      'latitude, ' +
      'longitude\n'
    );
  }

  /**
   * TODO: invert this to getPercentDifference
   * @param a - sum of psuedo averages for channel A
   * @param b - sum of psuedo averages for channel B
   * @returns percentDifference value
   */
  static getpercentDifference(a: number, b: number) {
    const diff = Math.abs(a - b);
    const avg = (a + b) / 2;
    const meanPercentDiff = (diff / avg) * 100;
    const pc = Math.max(Math.round((meanPercentDiff) / 1.6) - 25, 0);
    return Math.max(100 - pc, 0);
  }
}

export class PurpleAirReading {
  name: string;
  id: number;
  latitude: number;
  longitude: number;
  pm25: number;
  humidity: number;
  percentDifference: number;
  timestamp: Date;

  constructor(
    name: string,
    id: number,
    latitude: number,
    longitude: number,
    pm25: number,
    humidity: number,
    percentDifference: number,
    timestamp: Date
  ) {
    this.name = name;
    this.id = id;
    this.latitude = latitude;
    this.longitude = longitude;
    this.pm25 = pm25;
    this.humidity = humidity;
    this.percentDifference = percentDifference;
    this.timestamp = timestamp;
  }
}