import * as functions from 'firebase-functions';
import { request, GaxiosResponse } from  'gaxios';

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const THINGSPEAK_URL_TEMPLATE = "https://api.thingspeak.com/channels/<channel_id>/feeds.json";
const CHANNEL_FIELD = "<channel_id>";

exports.thingspeakToFirestore = functions.pubsub.schedule("every 2 minutes").onRun(async (context) => {
    const sensor_39193_primary_id = "865902";
    // This isn't actually a secret because anyone can find this on PurpleAir
    const sensor_39193_primary_key = "GKAN7GY29LRG7CLK";
    //const sensor_39193_secondary_id = "865903";
   // const sensor_39193_secondary_key = "6TNLM14BVTDHBURR";
    const primary_res = await request({
        url: THINGSPEAK_URL_TEMPLATE.replace(CHANNEL_FIELD, sensor_39193_primary_id),
        params: {
            api_key: sensor_39193_primary_key,
            results: 1
        }
    }) as GaxiosResponse<any>; //TODO: Make this better by using an actual class here
    console.log(primary_res);
    console.log(primary_res.data.feeds);
});
