import { AxiosResponse } from 'axios';
import PurpleAirResponse from './purple-air-response';

export default class SensorReading {
    timestamp: Date;
    channelAPmReading: number;
    channelBPmReading: number;
    humidity: number;
    latitude: string;
    longitude: string;

    static parseResponses(channelAPrimaryResponse: AxiosResponse, channelBPrimaryResponse: AxiosResponse, purpleAirResponse: PurpleAirResponse): SensorReading {
        const latitude = purpleAirResponse.latitude;
        const longitude = purpleAirResponse.longitude;
        const channelAData = channelAPrimaryResponse.data.feeds[0];
        const timestamp = channelAData.created_at;
        const humidity = +channelAData.field7;
        
        // PurpleAir stores two different types of PM_2.5 readings.
        // The EPA wants us to use the higher one.
        const channelAAtmPm: number = +channelAData.field2
        const channelACf1Pm: number = +channelAData.field8

        const channelAPmReading = Math.max(channelAAtmPm, channelACf1Pm);

        const channelBData = channelBPrimaryResponse.data.feeds[0];
        const channelBAtmPm: number = +channelBData.field2
        const channelBCf1Pm: number = +channelBData.field8

        const channelBPmReading = Math.max(channelBAtmPm, channelBCf1Pm);

        return new SensorReading(timestamp, channelAPmReading, channelBPmReading, humidity, latitude, longitude);
    }

    /**
     * Computes an average reading for the time block provided by the first element
     * 
     * @param readings Array of documents containing readings from Firestore
     */
    static averageDocuments(readings: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>[]): SensorReading {
        let channelAPmReadingSum = 0;
        let channelBPmReadingSum = 0;
        let humiditySum = 0;

        // Guaranteed to be okay because this function should only be called with >= 27 items
        const firstReadingData = readings[0].data();
        const latitude = firstReadingData["latitude"];
        const longitude = firstReadingData["longitude"];
        const timestamp = firstReadingData["timestamp"];

        for (const reading of readings) {
            const data = reading.data();

            channelAPmReadingSum += data["channelAPmReading"];
            channelBPmReadingSum += data["channelBPmReading"];
            humiditySum += data["humidity"]
        }

        const channelAPmReadingAverage = channelAPmReadingSum / readings.length;
        const channelBPmReadingAverage = channelBPmReadingSum / readings.length;
        const humidityAverage = humiditySum / readings.length;

        return new SensorReading(timestamp, channelAPmReadingAverage, channelBPmReadingAverage, humidityAverage, latitude, longitude);
    }

    constructor(timestamp: Date, channelAPmReading: number, channelBPmReading: number, humidity: number, latitude: string, longitude: string) {
        this.timestamp = timestamp;
        this.channelAPmReading = channelAPmReading;
        this.channelBPmReading = channelBPmReading;
        this.humidity = humidity;
        this.latitude = latitude;
        this.longitude = longitude;
    }
}
