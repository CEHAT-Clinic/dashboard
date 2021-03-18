export default class SensorReading {
  timestamp: Date;
  channelAPm25: number;
  channelBPm25: number;
  humidity: number;
  latitude: number;
  longitude: number;

  constructor(
    timestamp: Date,
    channelAPm25: number,
    channelBPm25: number,
    humidity: number,
    latitude: number,
    longitude: number
  ) {
    this.timestamp = timestamp;
    this.channelAPm25 = channelAPm25;
    this.channelBPm25 = channelBPm25;
    this.humidity = humidity;
    this.latitude = latitude;
    this.longitude = longitude;
  }
  /**
   * Computes an average reading for the time block provided by the first element
   *
   * @param readings - Array of documents containing readings from Firestore
   */
  static averageDocuments(
    readings: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>[]
  ): SensorReading {
    let channelAPmReadingSum = 0;
    let channelBPmReadingSum = 0;
    let humiditySum = 0;

    // Guaranteed to be okay because this function should only be called with >= 27 items
    const firstReadingData = readings[0].data();
    const latitude: number = firstReadingData['latitude'];
    const longitude: number = firstReadingData['longitude'];
    const timestamp: FirebaseFirestore.Timestamp =
      firstReadingData['timestamp'];

    for (const reading of readings) {
      const data = reading.data();

      channelAPmReadingSum += data['channelAPm25'];
      channelBPmReadingSum += data['channelBPm25'];
      humiditySum += data['humidity'];
    }

    const channelAPmReadingAverage = channelAPmReadingSum / readings.length;
    const channelBPmReadingAverage = channelBPmReadingSum / readings.length;
    const humidityAverage = humiditySum / readings.length;

    return new this(
      timestamp.toDate(),
      channelAPmReadingAverage,
      channelBPmReadingAverage,
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
    // TODO: update with percent difference and one channel reading
    return (
      `${this.timestamp.toISOString()}, ` +
      `${this.channelAPm25}, ` +
      `${this.channelBPm25}, ` +
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
    // TODO: update with percent difference and one channel reading
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
   * @returns confidence value
   */
  static getConfidence(a: number, b: number) {
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
  confidence: number;
  timestamp: Date;

  constructor(
    name: string,
    id: number,
    latitude: number,
    longitude: number,
    pm25: number,
    humidity: number,
    confidence: number,
    timestamp: Date
  ) {
    this.name = name;
    this.id = id;
    this.latitude = latitude;
    this.longitude = longitude;
    this.pm25 = pm25;
    this.humidity = humidity;
    this.confidence = confidence;
    this.timestamp = timestamp;
  }
}