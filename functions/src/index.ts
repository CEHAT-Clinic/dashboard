import * as functions from 'firebase-functions';
import axios from 'axios';
import PurpleAirResponse from './aqi-calculation/purple-air-response';
import SensorReading from './aqi-calculation/sensor-reading';
import NowCastConcentration from './aqi-calculation/nowcast-concentration';
import {
  generateReadingsCsv,
  generateAverageReadingsCsv,
} from './download-readings';
import {firestore, Timestamp, FieldValue} from './admin';
import {aqiFromPm25} from './aqi-calculation/calculate-aqi';
import {
  thingspeakUrl,
  readingsSubcollection,
  getThingspeakKeysFromPurpleAir,
  getHourlyAverages,
  cleanAverages,
  SensorData,
} from './aqi-calculation/util';
import {
  pm25BufferElement,
  AqiBufferElement,
  bufferStatus,
  defaultPm25BufferElement,
  defaultAqiBufferElement,
} from './buffer-types';

const thingspeakToFirestoreRuntimeOpts: functions.RuntimeOptions = {
  timeoutSeconds: 120,
};

exports.thingspeakToFirestore = functions
  .runWith(thingspeakToFirestoreRuntimeOpts)
  .pubsub.schedule('every 2 minutes')
  .onRun(async () => {
    const sensorList = (await firestore.collection('/sensors').get()).docs;

    for (const knownSensor of sensorList) {
      const thingspeakInfo: PurpleAirResponse = await getThingspeakKeysFromPurpleAir(
        knownSensor.data()['purpleAirId']
      );
      const channelAPrimaryData = await axios({
        url: thingspeakUrl(thingspeakInfo.channelAPrimaryId),
        params: {
          api_key: thingspeakInfo.channelAPrimaryKey, // eslint-disable-line camelcase
          results: 1,
        },
      });
      const channelBPrimaryData = await axios({
        url: thingspeakUrl(thingspeakInfo.channelBPrimaryId),
        params: {
          api_key: thingspeakInfo.channelBPrimaryKey, // eslint-disable-line camelcase
          results: 1,
        },
      });
      const reading = SensorReading.fromThingspeak(
        channelAPrimaryData,
        channelBPrimaryData,
        thingspeakInfo
      );

      const resolvedPath = readingsSubcollection(knownSensor.id);
      const readingsRef = firestore.collection(resolvedPath);

      // If data is not already present in the database add
      // it to the historical readings
      let firestoreSafeReading = defaultPm25BufferElement;
      if (
        (
          await readingsRef
            .where('timestamp', '==', Timestamp.fromDate(reading.timestamp))
            .get()
        ).empty
      ) {
        // Update reading with values
        firestoreSafeReading = {
          timestamp: Timestamp.fromDate(reading.timestamp),
          channelAPm25: reading.channelAPm25,
          channelBPm25: reading.channelBPm25,
          humidity: reading.humidity,
          latitude: reading.latitude,
          longitude: reading.longitude,
        };
        // Add to historical readings
        await readingsRef.add(firestoreSafeReading);
      }

      // Add readings to the pm25 buffer
      const docRef = firestore.collection('sensors').doc(knownSensor.id);

      await docRef.get().then(doc => {
        if (doc.exists) {
          const status = doc.get('pm25BufferStatus');
          if (status === bufferStatus.Exists) {
            // If the buffer exists, update normally
            let pm25BufferIndex = doc.get('pm25BufferIndex');
            const pm25Buffer = doc.get('pm25Buffer');

            pm25Buffer[pm25BufferIndex] = firestoreSafeReading;
            /* eslint-disable-next-line no-magic-numbers */
            pm25BufferIndex = (pm25BufferIndex + 1) % pm25Buffer.length;

            docRef.update({
              pm25BufferIndex: pm25BufferIndex,
              pm25Buffer: pm25Buffer,
            });
          } else if (
            status === bufferStatus.DoesNotExist ||
            status === undefined
          ) {
            // If the buffer does not exist, populate it with default values so
            // it can be updated in the future
            docRef.update({
              pm25BufferStatus: bufferStatus.InProgress,
            });
            populateDefaultBuffer(false, docRef);
          }
        }
      });

      // Delays the loop so that we hopefully don't overload Thingspeak, avoiding
      // our program from getting blocked.
      // Allocates up to a minute of the two minute runtime for delaying
      const oneMinuteInMilliseconds = 60000;
      const delayBetweenSensors = oneMinuteInMilliseconds / sensorList.length;
      await new Promise(resolve => setTimeout(resolve, delayBetweenSensors));
    }
  });

exports.calculateAqi = functions.pubsub
  .schedule('every 10 minutes')
  .onRun(async () => {
    const sensorList = (await firestore.collection('sensors').get()).docs;
    const currentData = Object.create(null);
    for (const knownSensor of sensorList) {
      // Get sensor metadata
      const sensorName: string = knownSensor.data()?.name ?? '';
      const purpleAirId: string = knownSensor.data()?.purpleAirId ?? '';
      const docId = knownSensor.id;

      // Get current sensor readings
      const hourlyAverages = await getHourlyAverages(docId);
      const cleanedAverages = cleanAverages(hourlyAverages);

      // NowCast formula from the EPA requires 2 out of the last 3 hours
      // to be available
      let validEntriesLastThreeHours = 0;
      const THREE_HOURS = 3;
      for (
        let i = 0;
        i < Math.min(THREE_HOURS, cleanedAverages.readings.length);
        i++
      ) {
        if (!Number.isNaN(cleanedAverages.readings[i])) {
          validEntriesLastThreeHours++;
        }
      }
      const NOWCAST_RECENT_DATA_THRESHOLD = 2;
      const containsEnoughInfo =
        validEntriesLastThreeHours >= NOWCAST_RECENT_DATA_THRESHOLD;

      // If there's enough info, the sensor's data is updated
      // If there isn't, we send the default AQI buffer element
      let aqiBufferData = defaultAqiBufferElement; // New data to add

      // TODO: Use the most recent latitude and longitude values from the previous
      // current-reading collection's doc
      let latitude = NaN;
      let longitude = NaN;
      let nowCastPm25 = NaN;
      let aqi = NaN;
      let isValid = false;

      // If there is not enough info, the sensor's status is not valid
      if (containsEnoughInfo) {
        // Only calculate the NowCast PM 2.5 value and the AQI if there is enough data
        const nowCastPm25Result = NowCastConcentration.fromCleanedAverages(
          cleanedAverages
        );
        const currentSensorData: SensorData = {
          purpleAirId: purpleAirId,
          name: sensorName,
          latitude: latitude,
          longitude: longitude,
          nowCastPm25: nowCastPm25,
          aqi: aqi,
          isValid: isValid,
        };

        currentData[purpleAirId] = currentSensorData;

        aqiBufferData = {
          aqi: aqi,
          timestamp: FieldValue.serverTimestamp(),
        };
      }

      // Send AQI reading to current-readings to be displayed on the map
      await firestore.collection('current-reading').doc('pm25').set({
        lastUpdated: FieldValue.serverTimestamp(),
        data: currentData,
      });

      /* -------- Update the AQI Circular Buffer -------- */

      // Document reference for current sensor
      const sensorDocRef = firestore.collection('/sensors').doc(docId);

      await sensorDocRef.get().then(doc => {
        if (doc.exists) {
          const status = doc.get('aqiBufferStatus');
          if (status === bufferStatus.Exists) {
            // The buffer exists, proceed with normal update
            let aqiBufferIndex = doc.get('aqiBufferIndex');
            const aqiBuffer = doc.get('aqiBuffer');
            aqiBuffer[aqiBufferIndex] = aqiBufferData;
            /* eslint-disable-next-line no-magic-numbers */
            aqiBufferIndex = (aqiBufferIndex + 1) % aqiBuffer.length;

            sensorDocRef.update({
              aqiBufferIndex: aqiBufferIndex,
              aqiBuffer: aqiBuffer,
            });
          } else if (
            status === bufferStatus.DoesNotExist ||
            status === undefined
          ) {
            // Populate the buffer with default values, skip this sensor
            sensorDocRef.update({
              aqiBufferStatus: bufferStatus.InProgress,
            });
            populateDefaultBuffer(true, sensorDocRef);
          }
        }
      });
    }
  });

// When there are many readings to get, extra time beyond the default 120 seconds
// may be necessary. 540 seconds is the maximum allowed value.
const generateReadingsCsvRuntimeOptions: functions.RuntimeOptions = {
  timeoutSeconds: 540,
};

/**
 * This function populates the given sensor doc with a default circular buffer
 * for either AQI or PM 2.5
 * @param aqiBuffer - true if AQI buffer, false if PM25 buffer
 * @param docRef - document reference for the sensor to update
 */
async function populateDefaultBuffer(
  aqiBuffer: boolean,
  docRef: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>
) {
  const bufferIndex = 0;
  if (aqiBuffer) {
    // 144 = (6 calls/hour * 24 hours) is the amount of entries we need to
    // create a graph with 24 hours of data
    const bufferSize = 144; /* eslint-disable-line no-magic-numbers */
    const aqiBuffer: Array<AqiBufferElement> = Array(bufferSize).fill(
      defaultAqiBufferElement
    );
    // Update document
    await docRef.get().then(doc => {
      if (doc.exists) {
        docRef.update({
          aqiBufferIndex: bufferIndex,
          aqiBuffer: aqiBuffer,
          aqiBufferStatus: bufferStatus.Exists,
        });
      }
    });
  } else {
    // 3600 = (30 calls/ hour * 12 hours) is the amount of data needed for
    // the AQI nowcast calculation
    const bufferSize = 3600; /* eslint-disable-line no-magic-numbers */
    const pm25Buffer: Array<pm25BufferElement> = Array(bufferSize).fill(
      defaultPm25BufferElement
    );

    // Update document
    await docRef.get().then(doc => {
      if (doc.exists) {
        docRef.update({
          pm25BufferIndex: bufferIndex,
          pm25Buffer: pm25Buffer,
          pm25BufferStatus: bufferStatus.Exists,
        });
      }
    });
  }
}

exports.generateReadingsCsv = functions
  .runWith(generateReadingsCsvRuntimeOptions)
  .pubsub.topic('generate-readings-csv')
  .onPublish(generateReadingsCsv);

exports.generateAverageReadingsCsv = functions.pubsub
  .topic('generate-average-readings-csv')
  .onPublish(generateAverageReadingsCsv);
