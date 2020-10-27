import * as functions from 'firebase-functions';
import axios from 'axios';
import PurpleAirResponse from './purple-air-response';
import * as  admin from 'firebase-admin'
import SensorReading from './sensor-reading';
import { parseAsync } from 'json2csv';
import { v4 as uuidv4 } from 'uuid';
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

type DocData = FirebaseFirestore.DocumentData;
type DocDataSnapshot = FirebaseFirestore.QueryDocumentSnapshot<DocData>;
type QuerySnapshot = FirebaseFirestore.QuerySnapshot<DocData>

admin.initializeApp();
const db = admin.firestore();

const THINGSPEAK_URL_TEMPLATE = "https://api.thingspeak.com/channels/<channel_id>/feeds.json";
const CHANNEL_FIELD = "<channel_id>";

const READINGS_SUBCOLLECTION_TEMPLATE = "/sensors/<doc_id>/readings";
const DOC_ID_FIELD = "<doc_id>";

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

exports.thingspeakToFirestore = functions.pubsub.schedule("every 2 minutes").onRun(async () => {
    const sensorList = (await db.collection("/sensors").get()).docs;
    for (const knownSensor of sensorList) {
        const thingspeakInfo: PurpleAirResponse =
            await getThingspeakKeysFromPurpleAir(knownSensor.data()["purpleAirId"]);
        const channelAPrimaryData = await axios({
            url: THINGSPEAK_URL_TEMPLATE.replace(CHANNEL_FIELD, thingspeakInfo.channelAPrimaryId),
            params: {
                api_key: thingspeakInfo.channelAPrimaryKey, //eslint-disable-line @typescript-eslint/camelcase
                results: 1
            }
        })
        const channelBPrimaryData = await axios({
            url: THINGSPEAK_URL_TEMPLATE.replace(CHANNEL_FIELD, thingspeakInfo.channelBPrimaryId),
            params: {
                api_key: thingspeakInfo.channelBPrimaryKey, //eslint-disable-line @typescript-eslint/camelcase
                results: 1
            }
        })

        const reading = new SensorReading(channelAPrimaryData, channelBPrimaryData, thingspeakInfo);

        const resolvedPath = READINGS_SUBCOLLECTION_TEMPLATE.replace(DOC_ID_FIELD, knownSensor.id);
        // Firebase doesn't support objects crerated using new
        if ((await db.collection(resolvedPath).where("timestamp", "==", reading.timestamp).get()).empty) {

            const firestoreSafeReading = Object.assign({}, reading)
            await db.collection(resolvedPath).add(firestoreSafeReading);
        }
    }
});

exports.generateReadingsCsv = functions.region('us-central1').pubsub
    .topic("generate-readings-csv")
    .onPublish(async () => {
        const sensorsSnapshot = await db.collection("sensors").get();

        // Initialize array to hold all readings from all sensors
        const readings: DocData[] = [];

        // Adds readings from a sensor to the complete readings array
        async function addReadings(sensorDoc: DocDataSnapshot): Promise<void> {
            const readingsSnapshot = db.collection(
                READINGS_SUBCOLLECTION_TEMPLATE
                .replace(DOC_ID_FIELD, sensorDoc.id))
                .get();

            const newReadings = (await readingsSnapshot)
                .docs
                .map(reading => reading.data());

            readings.push(newReadings)
        }

        // Fill readings array with readings for all sensors
        sensorsSnapshot.forEach(sensorDoc => addReadings(sensorDoc));

        console.log(readings);

        // csv field headers
        const fields = [
            'channelAPmReading',
            'channelBPmReading',
            'humidity',
            'latitude',
            'longitude',
            'timestamp'
        ];

        // get csv output
        const output = await parseAsync(readings, { fields });

        // generate filename
        const dateTime = new Date().toISOString().replace(/\W/g, "");
        const filename = `readings_${dateTime}.csv`;

        const tempLocalFile = path.join(os.tmpdir(), filename);

        return new Promise((resolve, reject) => {
            //write contents of csv into the temp file
            fs.writeFile(tempLocalFile, output, error => {
                if (error) {
                    reject(error);
                    return;
                }
                const bucket = admin.storage().bucket();

                // upload the file into the current firebase project default bucket
                bucket
                    .upload(tempLocalFile, {
                        // Workaround: firebase console not generating token for files
                        // uploaded via Firebase Admin SDK
                        // https://github.com/firebase/firebase-admin-node/issues/694
                        metadata: {
                            metadata: {
                                firebaseStorageDownloadTokens: uuidv4(),
                            }
                        },
                    })
                    .then(() => resolve())
                    .catch(error => reject(error));
            });
        });
    });
