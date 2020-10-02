import * as functions from 'firebase-functions';
import axios from 'axios';
import PurpleAirResponse from './purple-air-response';

const THINGSPEAK_URL_TEMPLATE: string = "https://api.thingspeak.com/channels/<channel_id>/feeds.json";
const CHANNEL_FIELD: string = "<channel_id>";

const knownSensors = ["39193", "39011"];

exports.thingspeakToFirestore = functions.pubsub.schedule("every 2 minutes").onRun(async (context) => {
    for (const knownSensor of knownSensors) {
        const thingspeakInfo: PurpleAirResponse  = await getThingspeakKeysFromPurpleAir(knownSensor);
    
        const primary_res = await axios({
            url: THINGSPEAK_URL_TEMPLATE.replace(CHANNEL_FIELD, thingspeakInfo.thingspeakPrimaryId),
            params: {
                api_key: thingspeakInfo.thingspeakPrimaryKey,
                results: 1
            }
        })
        const secondary_res = await axios({
            url: THINGSPEAK_URL_TEMPLATE.replace(CHANNEL_FIELD, thingspeakInfo.thingspeakSecondaryId),
            params: {
                api_key: thingspeakInfo.thingspeakSecondaryKey,
                results: 1
            }
        }) //TODO: Make this better by using an actual class here
        console.log(primary_res);
        console.log(primary_res.data.feeds);

        console.log(secondary_res);
        console.log(secondary_res.data.feeds)
    }
});


async function getThingspeakKeysFromPurpleAir(purpleAirId: string): Promise<PurpleAirResponse> {
    const PURPLE_AIR_API_ADDRESS: string = "https://www.purpleair.com/json";

    const purpleAirApiResponse = await axios({
        url: PURPLE_AIR_API_ADDRESS,
        params: {
            show: purpleAirId
        }
    });
    console.log(purpleAirApiResponse);
    return new PurpleAirResponse(purpleAirApiResponse);    
}