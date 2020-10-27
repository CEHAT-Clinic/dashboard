import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { parseAsync } from 'json2csv';
import { v4 as uuidv4 } from 'uuid';
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

type DocData = FirebaseFirestore.DocumentData;
type DocDataSnapshot = FirebaseFirestore.QueryDocumentSnapshot<DocData>;
type QuerySnapshot = FirebaseFirestore.QuerySnapshot<DocData>

const db = admin.firestore();

export const generateReadingsCsv = functions.region('us-central1').pubsub
  .topic("generate-readings-csv")
  .onPublish(async () => {
    const sensorsSnapshot = await db.collection("sensors").get();

    // Initialize array to hold all readings from all sensors
    const readings: DocData[] = [];

    // Gets snapshot of readings for a sensor from its sensor doc
    async function getReadingsSnapshot(
      sensorDoc: DocDataSnapshot
      ): Promise<QuerySnapshot> {
      const TEMPLATE = "sensors/<doc_id>/readings";
      const DOC_ID_FIELD = "<doc_id>";
      const resolvedPath = TEMPLATE.replace(DOC_ID_FIELD, sensorDoc.id);
      return db.collection(resolvedPath).get();
    }

    // Adds readings from a sensor to the complete readings array
    async function addReadings(sensorDoc: DocDataSnapshot): Promise<void> {
      const readingsSnapshot = getReadingsSnapshot(sensorDoc);

      const newReadings = (await readingsSnapshot)
        .docs
        .map(reading => reading.data());

      readings.push(newReadings)
    }

    // Fill readings array with readings for all sensors
    sensorsSnapshot.forEach(sensorDoc => addReadings(sensorDoc));

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