import * as functions from 'firebase-functions';
import axios from 'axios';
import PurpleAirResponse from './purple-air-response';
import * as  admin from 'firebase-admin'
import SensorReading from './sensor-reading';

admin.initializeApp();
const db = admin.firestore();

const THINGSPEAK_URL_TEMPLATE = "https://api.thingspeak.com/channels/<channel_id>/feeds.json";
const CHANNEL_FIELD = "<channel_id>";

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

exports.thingspeakToFirestore = functions.pubsub.schedule("every 2 minutes").onRun(async (context) => {
    const sensorList =  (await db.collection("/sensors").get()).docs;
    for (const knownSensor of sensorList) {
        knownSensor.data
        const thingspeakInfo: PurpleAirResponse  = await getThingspeakKeysFromPurpleAir(knownSensor.data()["purpleAirId"]);
    
        const channelAPrimaryData = await axios({
            url: THINGSPEAK_URL_TEMPLATE.replace(CHANNEL_FIELD, thingspeakInfo.channelAPrimaryId),
            params: {
                apiKey: thingspeakInfo.channelAPrimaryKey,
                results: 1
            }
        })
        const channelBPrimaryData = await axios({
            url: THINGSPEAK_URL_TEMPLATE.replace(CHANNEL_FIELD, thingspeakInfo.channelBPrimaryId),
            params: {
                apiKey: thingspeakInfo.channelBPrimaryKey,
                results: 1
            }
        })
        
        const reading = new SensorReading(channelAPrimaryData,channelBPrimaryData, thingspeakInfo);
        console.log(reading);
    }
});
