import * as functions from 'firebase-functions';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as admin from 'firebase-admin';
import SensorReading from './sensor-reading';
import {firestore} from './admin';

/**
 * Uploads a file with name filename and specified data to the default storage
 * bucket of the Firebase project.
 * @param filename - name of file to be uploaded to Firebase bucket
 * @param data - data to write to file
 */
function uploadFileToFirebaseBucket(filename: string, data: string) {
  const tempLocalFile = path.join(os.tmpdir(), filename);
  return new Promise<void>((resolve, reject) => {
    // Write data into the temp file
    fs.writeFile(tempLocalFile, data, error => {
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
}

/**
 * @param message - JSON message with start and end fields, which are in
 *                  milliseconds since EPOC and represent the interval of times
 *                  for which readings will be fetched
 */
async function generateReadingsCsv(
  message: functions.pubsub.Message
): Promise<void> {
  let start: number | undefined = undefined;
  let end: number | undefined = undefined;

  // Get the `start` and `end` attributes of the PubSub message JSON body.
  try {
    start = message.json.start;
    end = message.json.end;
  } catch (error) {
    console.log(`PubSub message was not JSON: ${error}`);
  }

  // Default to the most recent month
  let startDate = new Date();
  let endDate = new Date(startDate);
  endDate.setMonth(startDate.getMonth() - 1); // eslint-disable-line no-magic-numbers

  // Validate start and end dates, or set defaults
  if (start && end && (start < end)) {
    startDate = new Date(start);
    endDate = new Date(end);
  }
  console.log(`Start date: ${startDate}, End date: ${endDate}`);

  // Initialize csv with headers
  const headings =
    'timestamp, ' +
    'channelAPm25, ' +
    'channelBPm25, ' +
    'humidity, ' +
    'latitude, ' +
    'longitude\n';

  const sensorList = (await firestore.collection('/sensors').get()).docs;
  const readingsArrays = new Array<Array<string>>(sensorList.length);
  for (let sensorIndex = 0; sensorIndex < sensorList.length; sensorIndex++) {
    const resolvedPath = `/sensors/${sensorList[sensorIndex].id}/readings`;
    const readingsList = (
      await firestore
        .collection(resolvedPath)
        .where('timestamp', '>', startDate)
        .where('timestamp', '<', endDate)
        .get()
    ).docs;
    console.log(`Number of readings: ${readingsList.length}`);
    const readingsArray = new Array<string>(readingsList.length);

    for (
      let readingIndex = 0;
      readingIndex < readingsList.length;
      readingIndex++
    ) {
      const reading = SensorReading.fromFirestore(
        readingsList[readingIndex].data()
      );

      // The toCsvLine function generates the values in the same order as the
      // headings variable.
      readingsArray[readingIndex] = reading.toCsvLine();
    }

    readingsArrays[sensorIndex] = readingsArray;
  }

  // Combine the data into one string
  const readings = readingsArrays.map(stringArray => stringArray.join(''));
  const readingsCsv = headings + readings.join('');

  // Generate filename
  // Put timestamp into human-readable, computer friendly for
  // Regex removes all non-word characters in the date string
  const startDateISOString = startDate.toISOString().replace(/\W/g, '_');
  const endDateISOString = endDate.toISOString().replace(/\W/g, '_');
  const filename = `pm25_${startDateISOString}_to_${endDateISOString}.csv`;

  return uploadFileToFirebaseBucket(filename, readingsCsv);
}

function generateAverageReadingsCsv(): void {
  // Initialize csv with headers
  let csvData = 'latitude, longitude, corrected_hour_average_pm25 \n';

  // Current-reading collection has single doc
  const currentReadingDocRef = firestore
    .collection('/current-reading')
    .doc('pm25');
  currentReadingDocRef.get().then(doc => {
    if (doc.exists) {
      const docData = doc.data();
      if (docData) {
        const sensorMap = docData.data;
        for (const sensorId in sensorMap) {
          const sensorData = sensorMap[sensorId];
          csvData += `${sensorData.latitude}, ${sensorData.longitude}, ${sensorData.nowCastPm25}\n`;
        }

        // Generate filename
        const timestamp: FirebaseFirestore.Timestamp = docData.lastUpdated;

        // Put timestamp into human-readable, computer friendly form
        // Regex removes all non-word characters in the date string
        const dateTime = timestamp.toDate().toISOString().replace(/\W/g, '_');
        const filename = `hour_averages_pm25_${dateTime}.csv`;

        return uploadFileToFirebaseBucket(filename, csvData);
      } else {
        throw new Error('Document does not contain data');
      }
    } else {
      throw new Error('pm25 document does not exist');
    }
  });
}

export {generateReadingsCsv, generateAverageReadingsCsv};
