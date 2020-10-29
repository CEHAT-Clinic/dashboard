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

const THINGSPEAK_URL_TEMPLATE = "https://api.thingspeak.com/channels/"
                                        + "<channel_id>/feeds.json";
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
        const sensorList = (await db.collection("/sensors").get()).docs;
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
            if ((await db
                .collection(resolvedPath)
                .where("timestamp", "==", reading.timestamp)
                .get())
                .empty) {
                const firestoreSafeReading = Object.assign({}, reading)
                await db.collection(resolvedPath).add(firestoreSafeReading);
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

        const readings: string[] = [];
        const sensorList = (await db.collection("/sensors").get()).docs;
        for (const knownSensor of sensorList) {
            const resolvedPath = READINGS_SUBCOLLECTION_TEMPLATE
                .replace(
                    DOC_ID_FIELD,
                    knownSensor.id
                );
        
            // Add all readings for a sensor to the CSV
            const sensorReadings = db.collection(resolvedPath)
                .get()
                .then(querySnapshot => {
                    querySnapshot.forEach(
                    readingDoc => {
                    const reading = 
                        SensorReading.fromFirestore(readingDoc.data());
                    return reading.toCsvLine();
                })
            })
            .catch(error => console.log("Error getting readings: ", error))
            readings.concat(sensorReadings);
        }

        // const readings = (await db.collection("/sensors").get()).docs.map(
        //     // .then(sensorSnapshot => {
        //     //     sensorSnapshot.forEach(
        //             async sensorDoc => {
        //             const resolvedPath = 
        //                 READINGS_SUBCOLLECTION_TEMPLATE
        //                     .replace(
        //                         DOC_ID_FIELD,
        //                         sensorDoc.id
        //                     );
        
        //             // Add all readings for a sensor to the CSV
        //             const sensorReadings = (await db.collection(resolvedPath).get()).docs.map(
        //                 // .then(querySnapshot => {
        //                 //     querySnapshot.forEach(
        //                         readingDoc => {
        //                         const reading = 
        //                             SensorReading.fromFirestore(
        //                                 readingDoc.data()
        //                                 );
        //                         return reading.toCsvLine();
        
        //                         // toCsvLine is expected to return data in the
        //                         // order specified by the headers, at 
        //                         // readingsCsv's initialization.

        //                         // readingsCsv += reading.toCsvLine();
        //                     // });
        //                 })
        //                 // .catch(error => console.log("Error getting readings: ", error));
        //             return sensorReadings.join("")
        //             })
        //     // })
        //     //.catch(error => console.log("Error getting sensors: ", error))

        const readingsCsv = headings + readings.join("");

        // generate filename
        const dateTime = new Date().toISOString().replace(/\W/g, "");
        const filename = `pm_readings_${dateTime}.csv`;

        const tempLocalFile = path.join(os.tmpdir(), filename);

        console.log("Readings: ")
        console.log(readingsCsv);

        return new Promise((resolve, reject) => {
            // write contents of csv into the temp file
            fs.writeFile(tempLocalFile, readingsCsv, error => {
                if (error) {
                    reject(error);
                    return;
                }

                // upload file into current Firebase project default bucket
                admin
                    .storage()
                    .bucket()
                    .upload(tempLocalFile)
                    .then(() => resolve())
                    .catch(error => reject(error));
            });
        });
    });
