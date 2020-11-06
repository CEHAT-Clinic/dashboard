import * as functions from 'firebase-functions';
import axios from 'axios';
import PurpleAirResponse from './purple-air-response';
import * as admin from 'firebase-admin';
import SensorReading from './sensor-reading';
import CleanedReadings from './cleaned-reading';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

admin.initializeApp();
const db = admin.firestore();

const THINGSPEAK_URL_TEMPLATE =
  'https://api.thingspeak.com/channels/<channel_id>/feeds.json';
const CHANNEL_FIELD = '<channel_id>';

const READINGS_SUBCOLLECTION_TEMPLATE = '/sensors/<doc_id>/readings';
const DOC_ID_FIELD = '<doc_id>';

async function getThingspeakKeysFromPurpleAir(
  purpleAirId: string
): Promise<PurpleAirResponse> {
  const PURPLE_AIR_API_ADDRESS = 'https://www.purpleair.com/json';

  const purpleAirApiResponse = await axios({
    url: PURPLE_AIR_API_ADDRESS,
    params: {
      show: purpleAirId,
    },
  });

  return new PurpleAirResponse(purpleAirApiResponse);
}

exports.thingspeakToFirestore = functions.pubsub
  .schedule('every 2 minutes')
  .onRun(async () => {
    const sensorList = (await db.collection('/sensors').get()).docs;
    for (const knownSensor of sensorList) {
      const thingspeakInfo: PurpleAirResponse = await getThingspeakKeysFromPurpleAir(
        knownSensor.data()['purpleAirId']
      );
      const channelAPrimaryData = await axios({
        url: THINGSPEAK_URL_TEMPLATE.replace(
          CHANNEL_FIELD,
          thingspeakInfo.channelAPrimaryId
        ),
        params: {
          api_key: thingspeakInfo.channelAPrimaryKey,
          results: 1,
        },
      });
      const channelBPrimaryData = await axios({
        url: THINGSPEAK_URL_TEMPLATE.replace(
          CHANNEL_FIELD,
          thingspeakInfo.channelBPrimaryId
        ),
        params: {
          api_key: thingspeakInfo.channelBPrimaryKey,
          results: 1,
        },
      });
      const reading = SensorReading.fromThingspeak(
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
      const readingsRef = db.collection(resolvedPath);
      if (
        (
          await readingsRef
            .where(
              'timestamp',
              '==',
              FirebaseFirestore.Timestamp.fromDate(reading.timestamp)
            )
            .get()
        ).empty
      ) {
        const firestoreSafeReading = {
          timestamp: FirebaseFirestore.Timestamp.fromDate(reading.timestamp),
          channelAPm25: reading.channelAPm25,
          channelBPm25: reading.channelBPm25,
          humidity: reading.humidity,
          latitude: reading.latitude,
          longitude: reading.longitude,
        };
        await readingsRef.add(firestoreSafeReading);
      }
    }
  });

/**
 * Gets the hourly averages for the past 12 hours for a single sensor. If less than
 * 90% of the readings are available for a time period, it leaves the data for that hour
 * as undefined per the EPA guidance to ignore hours without 90% of the data.
 *
 * Note: In the event that a sensor is moved, this function will report meaningless data for
 * the twelve hour period after the sensor is moved. This is because data from both locations
 * will be treated as if they came from the same location because the function assumes a sensor
 * is stationary.
 *
 * @param docId Firestore document id for the sensor to be getting averages for
 * @param purpleAirId PurpleAir ID for the sensor
 */
async function getHourlyAverages(docId: string): Promise<SensorReading[]> {
  const LOOKBACK_PERIOD_HOURS = 12;
  const averages = new Array<SensorReading>(LOOKBACK_PERIOD_HOURS);
  const currentHour: Date = new Date();
  const previousHour = new Date(currentHour);
  previousHour.setUTCHours(previousHour.getUTCHours() - 1);

  const resolvedPath = READINGS_SUBCOLLECTION_TEMPLATE.replace(
    DOC_ID_FIELD,
    docId
  );

  for (let i = 0; i < averages.length; i++) {
    const readings = (
      await db
        .collection(resolvedPath)
        .where(
          'timestamp',
          '>',
          FirebaseFirestore.Timestamp.fromDate(previousHour)
        )
        .where(
          'timestamp',
          '<=',
          FirebaseFirestore.Timestamp.fromDate(currentHour)
        )
        .get()
    ).docs;

    // If we have 1 reading every two minutes, there are 30 readings in an hour
    // 90% of 30 readings is 27 readings. We must have 90% of the readings from
    // a given hour in order to compute the AQI per the EPA
    // Expressed this way to avoid imprecision of floating point arithmetic
    const MEASUREMENT_COUNT_THRESHOLD = 27;
    if (readings.length >= MEASUREMENT_COUNT_THRESHOLD) {
      const reading = SensorReading.averageDocuments(readings);
      averages[i] = reading;
    }

    currentHour.setUTCHours(currentHour.getUTCHours() - 1);
    previousHour.setUTCHours(previousHour.getUTCHours() - 1);
  }

  return averages;
}

/**
 * Cleans hourly averages of PM2.5 readings using the published EPA formula, excluding thoses data points
 * that indicate sensor malfunction. Those datapoints are represented by the undefined value.
 *
 * @param averages array containing sensor readings representing hourly averages
 * @returns an array of numbers representing the corrected PM2.5 values pursuant to the EPA formula
 */
function cleanAverages(averages: SensorReading[]): CleanedReadings {
  // These thresholds for the EPA indicate when diverging sensor readings
  // indicate malfulnction. The EPA requires that the raw difference between
  // the readings be less than 5 and the percent difference be less than 70%
  const RAW_THRESHOLD = 5;
  const PERCENT_THRESHOLD = 0.7;

  const cleanedAverages = new Array<number>(averages.length);
  let latitude = NaN;
  let longitude = NaN;
  for (let i = 0; i < cleanedAverages.length; i++) {
    const reading = averages[i];
    if (reading !== undefined) {
      // Use first hour's location
      if (isNaN(latitude) || isNaN(longitude)) {
        latitude = reading.latitude;
        longitude = reading.longitude;
      }

      const averagePmReading =
        (reading.channelAPm25 + reading.channelBPm25) / 2;
      const difference = Math.abs(reading.channelAPm25 - reading.channelBPm25);
      if (
        !(
          difference > RAW_THRESHOLD &&
          difference / averagePmReading > PERCENT_THRESHOLD
        )
      ) {
        // Formula from EPA to correct PurpleAir PM 2.5 readings
        cleanedAverages[i] =
          0.534 * averagePmReading - 0.0844 * reading.humidity + 5.604;
      }
    }
  }
  return new CleanedReadings(latitude, longitude, cleanedAverages);
}

exports.calculateAqi = functions.pubsub
  .schedule('every 10 minutes')
  .onRun(async () => {
    // If an hour does not have data that meets EPA requirements, the value
    // for that hour is undefined. By default, Firestore will reject API calls
    // with undefined values. This setting changes the default to ignore those
    // values instead
    db.settings({ignoreUndefinedProperties: true});
    const sensorList = (await db.collection('/sensors').get()).docs;
    const currentData = Object.create(null);
    for (const knownSensor of sensorList) {
      const docId = knownSensor.id;
      const hourlyAverages = await getHourlyAverages(docId);
      const cleanedAverages = cleanAverages(hourlyAverages);

      //TODO: Start using AQI not PM2.5

      const containsInfo = cleanedAverages.readings.some(
        reading => reading !== undefined
      );
      if (containsInfo) {
        const purpleAirId = knownSensor.data()['purpleAirId'] as string;
        currentData[purpleAirId] = Object.assign({}, cleanedAverages);
      }
    }

    // Note: There is only one document in this database, but we still get it back in
    // an array
    const currentReadingDocuments = (
      await db.collection('current-reading').get()
    ).docs;
    if (currentReadingDocuments.length !== 0) {
      const currentReadingDocId = currentReadingDocuments[0].id;

      await db.collection('current-reading').doc(currentReadingDocId).set({
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        data: currentData,
      });
    }
  });

exports.generateReadingsCsv = functions.pubsub
  .topic('generate-readings-csv')
  .onPublish(async () => {
    // Initialize csv with headers
    const headings =
      'timestamp, ' +
      'channelAPmReading, ' +
      'channelBPmReading, ' +
      'humidity, ' +
      'latitude, ' +
      'longitude\n';

    const sensorList = (await db.collection('/sensors').get()).docs;
    const readingsArrays = new Array<Array<string>>(sensorList.length);
    for (let sensorIndex = 0; sensorIndex < sensorList.length; sensorIndex++) {
      // Get readings subcollection path
      const resolvedPath = READINGS_SUBCOLLECTION_TEMPLATE.replace(
        DOC_ID_FIELD,
        sensorList[sensorIndex].id
      );

      const readingsList = (await db.collection(resolvedPath).get()).docs;
      const readingsArray = new Array<string>(readingsList.length);

      for (
        let readingIndex = 0;
        readingIndex < readingsList.length;
        readingIndex++
      ) {
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
    const readings = readingsArrays.map(strArray => strArray.join(''));
    const readingsCsv = headings + readings.join('');

    // Generate filename
    const dateTime = new Date().toISOString().replace(/\W/g, '');
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
