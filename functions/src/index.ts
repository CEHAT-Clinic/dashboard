import * as functions from 'firebase-functions';
import axios from 'axios';
import PurpleAirResponse from './purple-air-response';
import * as  admin from 'firebase-admin'

admin.initializeApp();
const db = admin.firestore();

const THINGSPEAK_URL_TEMPLATE = "https://api.thingspeak.com/channels/<channel_id>/feeds.json";
const CHANNEL_FIELD = "<channel_id>";

exports.thingspeakToFirestore = functions.pubsub.schedule("every 2 minutes").onRun(async (context) => {
    const sensorList =  (await db.collection("/sensors").get()).docs;
    for (const knownSensor of sensorList) {
        knownSensor.data
        const thingspeakInfo: PurpleAirResponse  = await getThingspeakKeysFromPurpleAir(knownSensor.data()["purpleAirId"]);
    
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
  //      console.log(primary_res);
        console.log(primary_res.data.feeds);

    //    console.log(secondary_res);
        console.log(secondary_res.data.feeds)
    }
});


async function getThingspeakKeysFromPurpleAir(purpleAirId: string): Promise<PurpleAirResponse> {
    const PURPLE_AIR_API_ADDRESS = "https://www.purpleair.com/json";

    const purpleAirApiResponse = await axios({
        url: PURPLE_AIR_API_ADDRESS,
        params: {
            show: purpleAirId
        }
    });

    return new PurpleAirResponse(purpleAirApiResponse);    
}