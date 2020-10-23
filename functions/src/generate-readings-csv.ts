import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { parseAsync } from 'json2csv';
import { v4 as uuidv4 } from 'uuid';
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

const db = admin.firestore();

export const generateReadingsCsv = functions.region('us-central1').pubsub
  .topic("generate-readings-csv")
  .onPublish(async message => {

    // gets the documents from the firestore collection
    const sensorsSnapshot = await db
      .collection("sensors")
      .get();
    
    const readings = sensorsSnapshot.docs.map(
      sensorDoc => getReadings(sensorDoc)
    );

    function getReadings(sensorDoc) {
      return sensorDoc.collection('readings').docs.map(reading => reading.data())
    }

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
          .catch(errorr => reject(errorr));
      });
    });
  });