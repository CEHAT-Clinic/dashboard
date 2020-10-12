import { AxiosResponse } from 'axios';
import PurpleAirResponse from './purple-air-response';

export default class SensorReading {
    timestamp: Date;
    channelAPmReading: number;
    channelBPmReading: number;
    humidity: number;
    latitude: string;
    longitude: string;

    constructor(channelAPrimaryResponse: AxiosResponse, channelBPrimaryResponse: AxiosResponse, purpleAirResponse: PurpleAirResponse) {
        this.latitude = purpleAirResponse.latitude;
        this.longitude = purpleAirResponse.longitude;

        const channelAData = channelAPrimaryResponse.data.feeds[0];
        this.timestamp = channelAData.created_at;
        this.humidity = +channelAData.field7;
        
        // PurpleAir stores two different types of PM_2.5 readings.
        // The EPA wants us to use the higher one.
        const channelAAtmPm: number = +channelAData.field2
        const channelACf1Pm: number = +channelAData.field8

        this.channelAPmReading = Math.max(channelAAtmPm, channelACf1Pm);

        const channelBData = channelBPrimaryResponse.data.feeds[0];
        const channelBAtmPm: number = +channelBData.field2
        const channelBCf1Pm: number = +channelBData.field8

        this.channelBPmReading = Math.max(channelBAtmPm, channelBCf1Pm);
    }
}
