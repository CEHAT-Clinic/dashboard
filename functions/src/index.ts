import * as functions from 'firebase-functions';
import axios from 'axios';
import PurpleAirResponse from './purple-air-response';
import * as  admin from 'firebase-admin'
import SensorReading from './sensor-reading';
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

admin.initializeApp();
const db = admin.firestore();


const THINGSPEAK_URL_TEMPLATE = 
    "https://api.thingspeak.com/channels/<channel_id>/feeds.json";
const CHANNEL_FIELD = "<channel_id>";

const READINGS_SUBCOLLECTION_TEMPLATE = "/sensors/<doc_id>/readings";
const DOC_ID_FIELD = "<doc_id>";

async function getThingspeakKeysFromPurpleAir(
      purpleAirId: string
    ): Promise<PurpleAirResponse> {
    const PURPLE_AIR_API_ADDRESS = "https://www.purpleair.com/json";

    const purpleAirApiResponse = await axios({
        url: PURPLE_AIR_API_ADDRESS,
        params: {
            show: purpleAirId
        }
    });

    return new PurpleAirResponse(purpleAirApiResponse);
}

exports.thingspeakToFirestore = functions.pubsub
    .schedule("every 2 minutes")
    .onRun(async () => {
        const sensorList =  (await db.collection("/sensors").get()).docs;
        for (const knownSensor of sensorList) {
            const thingspeakInfo: PurpleAirResponse = 
                await getThingspeakKeysFromPurpleAir(
                      knownSensor.data()["purpleAirId"]
                    );
            const channelAPrimaryData = await axios({
                url: THINGSPEAK_URL_TEMPLATE.replace(
                    CHANNEL_FIELD,
                    thingspeakInfo.channelAPrimaryId
                ),
                params: {
                    api_key: thingspeakInfo.channelAPrimaryKey, //eslint-disable-line @typescript-eslint/camelcase
                    results: 1
                }
            })
            const channelBPrimaryData = await axios({
                url: THINGSPEAK_URL_TEMPLATE.replace(
                    CHANNEL_FIELD,
                    thingspeakInfo.channelBPrimaryId
                ),
                params: {
                    api_key: thingspeakInfo.channelBPrimaryKey, //eslint-disable-line @typescript-eslint/camelcase
                    results: 1
                }
            })
            const reading = SensorReading.fromPurpleAir(
                channelAPrimaryData,
                channelBPrimaryData,
                thingspeakInfo
            );

            const resolvedPath = READINGS_SUBCOLLECTION_TEMPLATE.replace(
                DOC_ID_FIELD,
                knownSensor.id
            );
            
            // Only add data if not already present in database.
            // This happens if a sensor is down, so only old data is returned.
            const readingsRef =  db.collection(resolvedPath);
            if ((await readingsRef
                .where("timestamp", "==", reading.timestamp)
                .get())
                .empty) {

                const firestoreSafeReading = Object.assign({}, reading)
                await readingsRef.add(firestoreSafeReading);
            }
        }
    });

exports.generateReadingsCsv = functions.pubsub
    .topic("generate-readings-csv")
    .onPublish(async () => {

        // Initialize csv with headers
        const headings = "timestamp, " +
            "channelAPmReading, " +
            "channelBPmReading, " +
            "humidity, " +
            "latitude, " +
            "longitude\n";

        const sensorList = (await db.collection("/sensors").get()).docs;
        const readingsArrays = new Array<Array<string>>(sensorList.length);
        for (let sensorIndex = 0; 
             sensorIndex < sensorList.length; 
             sensorIndex++) {
            // Get readings subcollection path
            const resolvedPath = READINGS_SUBCOLLECTION_TEMPLATE
                .replace(DOC_ID_FIELD, sensorList[sensorIndex].id);
        
            const readingsList = (await db.collection(resolvedPath).get()).docs;
            const readingsArray = new Array<string>(readingsList.length);

            for (let readingIndex = 0; 
                 readingIndex < readingsList.length; 
                 readingIndex++) {
                const reading = SensorReading.fromFirestore(
                    readingsList[readingIndex].data()
                    );
                
                // toCsvLine generates the values in the same order as the
                // headings variable.
                readingsArray[readingIndex] = reading.toCsvLine();
            }

            readingsArrays[sensorIndex] = readingsArray;
        }
        
        // Combine the data into one string
        const readings = readingsArrays.map((strArray) => strArray.join(""));
        const readingsCsv = headings + readings.join("");

        // Generate filename
        const dateTime = new Date().toISOString().replace(/\W/g, "");
        const filename = `pm_readings_${dateTime}.csv`;

        const tempLocalFile = path.join(os.tmpdir(), filename);

        return new Promise((resolve, reject) => {
            // Write contents of csv into the temp file
            fs.writeFile(tempLocalFile, readingsCsv, error => {
                if (error) {
                    reject(error);
                    return;
                }

                // Upload file into current Firebase project default bucket
                admin
                    .storage()
                    .bucket()
                    .upload(tempLocalFile)
                    .then(() => resolve())
                    .catch(error => reject(error));
            });
        });
    });
