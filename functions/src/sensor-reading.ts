import {AxiosResponse} from 'axios';
import PurpleAirResponse from './purple-air-response';

export default class SensorReading {
  timestamp: Date;
  channelAPmReading: number;
  channelBPmReading: number;
  humidity: number;
  latitude: string;
  longitude: string;

  constructor(
    timestamp: Date,
    channelAPmReading: number,
    channelBPmReading: number,
    humidity: number,
    latitude: string,
    longitude: string
  ) {
    this.timestamp = timestamp;
    this.channelAPmReading = channelAPmReading;
    this.channelBPmReading = channelBPmReading;
    this.humidity = humidity;
    this.latitude = latitude;
    this.longitude = longitude;
  }

  static fromFirestore(data: FirebaseFirestore.DocumentData): SensorReading {
    return new this(
      data.timestamp,
      data.channelAPmReading,
      data.channelBPmReading,
      data.humidity,
      data.latitude,
      data.longitude
    );
  }

  static fromPurpleAir(
    channelAPrimaryResponse: AxiosResponse,
    channelBPrimaryResponse: AxiosResponse,
    purpleAirResponse: PurpleAirResponse
  ): SensorReading {
    // PurpleAir stores two different types of PM_2.5 readings.
    // The EPA wants us to use the higher one.
    const channelAData = channelAPrimaryResponse.data.feeds[0];
    const channelAAtmPm: number = +channelAData.field2;
    const channelACf1Pm: number = +channelAData.field8;

    const channelBData = channelBPrimaryResponse.data.feeds[0];
    const channelBAtmPm: number = +channelBData.field2;
    const channelBCf1Pm: number = +channelBData.field8;

    const humidity = +channelAData.field7;

    return new this(
      channelAData.created_at,
      Math.max(channelAAtmPm, channelACf1Pm),
      Math.max(channelBAtmPm, channelBCf1Pm),
      humidity,
      purpleAirResponse.latitude,
      purpleAirResponse.longitude
    );
  }

    // Creates single line of CSV code, used for exporting data.
    // WARNING: If you change this code, also update the generateReadingsCSV
    // headings variable, so the CSV headings match with the data.
    toCsvLine(): string {
        return `${this.timestamp}, ` +
            `${this.channelAPmReading}, ` +
            `${this.channelBPmReading}, ` +
            `${this.humidity}, ` +
            `${this.latitude}, ` +
            `${this.longitude}\n`
    }
}

