import {AxiosResponse} from 'axios';
import PurpleAirResponse from './purple-air-response';

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
   * Creates a SensorReading object from Thingspeak response
   * @param channelAPrimaryResponse - Channel A response from ThingSpeak
   * @param channelBPrimaryResponse - Channel B response from ThingSpeak
   * @param purpleAirResponse - PurpleAirResponse metadata
   *
   * @returns SensorReading object
   */
  static fromThingspeak(
    channelAPrimaryResponse: AxiosResponse,
    channelBPrimaryResponse: AxiosResponse,
    purpleAirResponse: PurpleAirResponse
  ): SensorReading {
    // PurpleAir stores two different types of PM_2.5 readings.
    // The EPA wants us to use the higher one.
    const channelAData = channelAPrimaryResponse.data.feeds[0];
    const channelAAtmPm: number = +channelAData.field2;
    const channelACf1Pm: number = +channelAData.field8;
    console.log('A CF_1', channelACf1Pm);
    console.log('A CF_ATM', channelAAtmPm);

    const channelBData = channelBPrimaryResponse.data.feeds[0];
    const channelBAtmPm: number = +channelBData.field2;
    const channelBCf1Pm: number = +channelBData.field8;
    console.log('B CF_1', channelBCf1Pm);
    console.log('B CF_ATM', channelBAtmPm);

    const humidity = +channelAData.field7;

    const timestamp = new Date(channelAData.created_at);

    return new this(
      timestamp,
      Math.max(channelAAtmPm, channelACf1Pm),
      Math.max(channelBAtmPm, channelBCf1Pm),
      humidity,
      +purpleAirResponse.latitude,
      +purpleAirResponse.longitude
    );
  }

  /**
   * Creates single line of CSV code, used for exporting data.
   * Values should be in same order as getCsvHeader.
   */
  toCsvLine(): string {
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
    return (
      'timestamp, ' +
      'channelAPm25, ' +
      'channelBPm25, ' +
      'humidity, ' +
      'latitude, ' +
      'longitude\n'
    );
  }
}
