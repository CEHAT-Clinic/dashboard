import { AxiosResponse } from "axios";

export default class PurpleAirResponse {
    thingspeakPrimaryId: string;
    thingspeakPrimaryKey: string;
    thingspeakSecondaryId: string;
    thingspeakSecondaryKey: string;

    constructor(response: AxiosResponse<any>) {
        const data = response.data;

        this.thingspeakPrimaryId = data.results[0]["THINGSPEAK_PRIMARY_ID"];
        this.thingspeakPrimaryKey = data.results[0]["THINGSPEAK_PRIMARY_ID_READ_KEY"];
        this.thingspeakSecondaryId = data.results[1]["THINGSPEAK_SECONDARY_ID"];
        this.thingspeakSecondaryKey = data.results[1]["THINGSPEAK_SECONDARY_ID_READ_KEY"];

    }
}