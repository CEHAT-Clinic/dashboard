import * as functions from 'firebase-functions';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as admin from 'firebase-admin';
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
 * @param message - PubSub message that includes JSON with start and end fields
 *
 * @remarks
 * The start and end values represent the non-inclusive interval of time to fetch
 * readings for. The start and end values should be numbers that are the number
 * of milliseconds since EPOCH.
 *
 * @example
 * ```
 * // Gets readings for the month of December (in PST)
 * generateReadingsCsv(
 *   {data: Buffer.from('{"start": 1606809599000, "end": 1609488000000}')}
 * )
 * ```
 */
async function generateReadingsCsv(
  message?: functions.pubsub.Message
): Promise<void> {
  let startMilliseconds: number | undefined = undefined;
  let endMilliseconds: number | undefined = undefined;

  // Get the `start` and `end` attributes of the PubSub message JSON body.
  if (message) {
    try {
      startMilliseconds = message.json.start;
      endMilliseconds = message.json.end;
    } catch (error) {
      // No error, use default values
    }
  }

  let startDate: Date | undefined = undefined;
  let endDate: Date | undefined = undefined;

  // Validate start and end dates, or set defaults
  if (
    startMilliseconds &&
    endMilliseconds &&
    startMilliseconds < endMilliseconds
  ) {
    startDate = new Date(startMilliseconds);
    endDate = new Date(endMilliseconds);
  } else {
    // Default to the most recent month
    startDate = new Date();
    endDate = new Date(startDate);
    endDate.setMonth(startDate.getMonth() - 1); // eslint-disable-line no-magic-numbers
  }

  // Initialize csv with headers
  const headings =
    'name, ' +
    'timestamp, ' +
    'channelAPm25, ' +
    'channelBPm25, ' +
    'humidity, ' +
    'latitude, ' +
    'longitude\n';

  const sensorList = (await firestore.collection('/sensors').get()).docs;
  const readingsArrays = new Array<Array<string>>(sensorList.length);
  for (let sensorIndex = 0; sensorIndex < sensorList.length; sensorIndex++) {
    const name: string = sensorList[sensorIndex].data().name ?? '';
    const safeName: string = name.replace(/\//g, '-').replace(/\\/g, '-');
    const resolvedPath = `/sensors/${sensorList[sensorIndex].id}/readings`;

    // Only fetch readings within the start and end bounds
    const readingsList = (
      await firestore
        .collection(resolvedPath)
        .where('timestamp', '>', startDate)
        .where('timestamp', '<', endDate)
        .get()
    ).docs;

    // Contains readings for this sensor
    const readingsArray = new Array<string>();

    const timestampStringSet = new Set();

    for (
      let readingIndex = 0;
      readingIndex < readingsList.length;
      readingIndex++
    ) {
      const data = readingsList[readingIndex].data();
      const timestamp: FirebaseFirestore.Timestamp = data.timestamp;
      const dateString: string = timestamp.toDate().toISOString();

      // Ensure that it's the old reading format and that we don't already have
      // that reading in the file
      if (
        typeof data.channelBPm25 !== 'undefined' &&
        !timestampStringSet.has(dateString)
      ) {
        const reading = `${safeName}, ${dateString}, ${
          data.channelAPm25
        }, ${data.channelBPm25}, ${data.humidity}, ${data.latitude}, ${
          data.longitude
        }\n`;
  
        readingsArray.push(reading);
        timestampStringSet.add(dateString);
      } else {
        const reason = typeof data.channelBPm25 !== 'undefined' ? 'duplicate' : 'undefined';
        console.log('Bad reading :o', reason);
      }
    }
    readingsArrays[sensorIndex] = readingsArray;
    timestampStringSet.clear();
  }

  // Combine the data into one string to be written in the CSV file
  const readings = readingsArrays.map(stringArray => stringArray.join(''));
  const readingsCsv = headings + readings.join('');

  // Generate filename
  // Put timestamp into human-readable, computer friendly for
  // Regex removes all non-word characters in the date string
  const startDateISOString = startDate.toISOString().replace(/\W/g, '-');
  const endDateISOString = endDate.toISOString().replace(/\W/g, '-');
  const filename = `pm25_${startDateISOString}_to_${endDateISOString}.csv`;
  return uploadFileToFirebaseBucket(filename, readingsCsv);
}

export {generateReadingsCsv};
