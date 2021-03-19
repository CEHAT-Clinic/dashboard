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
  AqiBufferElement,
  bufferStatus,
  defaultPm25BufferElement,
  defaultAqiBufferElement,
  populateDefaultBuffer,
  Pm25BufferElement,
} from './aqi-calculation/buffer';

const thingspeakToFirestoreRuntimeOpts: functions.RuntimeOptions = {
  timeoutSeconds: 120,
};

exports.thingspeakToFirestore = functions
  .runWith(thingspeakToFirestoreRuntimeOpts)
  .pubsub.schedule('every 2 minutes')
  .onRun(async () => {
    const sensorList = (await firestore.collection('/sensors').get()).docs;

    for (const sensorDoc of sensorList) {
      const sensorDocData = sensorDoc.data();
      const isActive = sensorDocData.isActive ?? true;
      if (isActive && sensorDocData.purpleAirId) {
        const thingspeakInfo: PurpleAirResponse = await getThingspeakKeysFromPurpleAir(
          sensorDocData.purpleAirId
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
        const readingTimestamp = Timestamp.fromDate(reading.timestamp);

        const readingsCollectionRef = firestore.collection(
          readingsSubcollection(sensorDoc.id)
        );
        let firestoreSafeReading: Pm25BufferElement = defaultPm25BufferElement;

        // If the lastSensorReadingTime field isn't set, query the database to find
        // the timestamp of the most recent reading. If there are no readings in
        // Firestore, then lastSensorReading is never changed from null
        let lastSensorReadingTime: FirebaseFirestore.Timestamp | null =
          sensorDocData.lastSensorReadingTime ?? null;
        if (!lastSensorReadingTime) {
          const maxDocs = 1;
          readingsCollectionRef
            .orderBy('timestamp', 'desc')
            .limit(maxDocs)
            .get()
            .then(querySnapshot => {
              querySnapshot.forEach(doc => {
                lastSensorReadingTime = doc.data().timestamp ?? null;
              });
            });
        }

        // Before adding the reading to the historical database, check that it doesn't
        // already exist in the database
        if (lastSensorReadingTime !== readingTimestamp) {
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
          await readingsCollectionRef.add(firestoreSafeReading);
        }

        // Add readings to the PM 2.5 buffer
        const sensorDocRef = firestore.collection('sensors').doc(sensorDoc.id);
        const status =
          sensorDocData.pm25BufferStatus ?? bufferStatus.DoesNotExist;
        // If the buffer status is In Progress we don't update the buffer
        // because the buffer is still being initialized
        if (status === bufferStatus.Exists) {
          // If the buffer exists, update normally
          const pm25Buffer = sensorDocData.pm25Buffer;
          pm25Buffer[sensorDocData.pm25BufferIndex] = firestoreSafeReading;
          // Update the sensor doc buffer and metadata
          await sensorDocRef.update({
            pm25BufferIndex:
              (sensorDocData.pm25BufferIndex + 1) % pm25Buffer.length, // eslint-disable-line no-magic-numbers
            pm25Buffer: pm25Buffer,
            lastSensorReadingTime: readingTimestamp,
            latitude: reading.latitude,
            longitude: reading.longitude,
          });
        } else if (status === bufferStatus.DoesNotExist) {
          // If the buffer does not exist, populate it with default values so
          // it can be updated in the future
          await sensorDocRef.update({
            pm25BufferStatus: bufferStatus.InProgress,
            lastSensorReadingTime: readingTimestamp,
            latitude: reading.latitude,
            longitude: reading.longitude,
          });
          // This function updates the bufferStatus once the buffer has been
          // fully initialized, which uses an additional write to the database
          populateDefaultBuffer(false, sensorDoc.id);
        }
      }
    }

    // Delays the loop so that we hopefully don't overload Thingspeak, avoiding
    // our program from getting blocked.
    // Allocates up to a minute of the two minute runtime for delaying
    const oneMinuteInMilliseconds = 60000;
    const delayBetweenSensors = oneMinuteInMilliseconds / sensorList.length;
    await new Promise(resolve => setTimeout(resolve, delayBetweenSensors));
  });

exports.calculateAqi = functions.pubsub
  .schedule('every 10 minutes')
  .onRun(async () => {
    const sensorList = (await firestore.collection('sensors').get()).docs;
    const currentData = Object.create(null);
    for (const sensorDoc of sensorList) {
      const sensorDocData = sensorDoc.data();

      // Data sent to the current-readings collection
      // Initially the previous data's value or the default values
      const currentSensorData: SensorData = {
        purpleAirId: sensorDocData.purpleAirId ?? '',
        name: sensorDocData.name ?? '',
        latitude: sensorDocData.latitude ?? NaN,
        longitude: sensorDocData.latitude ?? NaN,
        readingDocId: sensorDoc.id,
        lastValidAqiTime: sensorDocData.lastValidAqiTime ?? null,
        lastSensorReadingTime: sensorDocData.lastSensorReadingTime ?? null,
        isActive: sensorDocData.isActive ?? true,
        nowCastPm25: NaN,
        aqi: NaN,
        isValid: false,
      };

      if (currentSensorData.isActive) {
        // Data used to calculate hourly averages
        const pm25BufferStatus: bufferStatus =
          sensorDocData.pm25BufferStatus ?? bufferStatus.DoesNotExist;
        const pm25BufferIndex: number = sensorDocData.pm25BufferIndex ?? 0;
        const pm25Buffer: Array<Pm25BufferElement> =
          sensorDocData.pm25Buffer ?? [];

        // Get current sensor readings
        const hourlyAverages: SensorReading[] = getHourlyAverages(
          pm25BufferStatus,
          pm25BufferIndex,
          pm25Buffer
        );
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
        const aqiBufferData = defaultAqiBufferElement; // New data to add

        // If there is not enough info, the sensor's status is not valid
        if (containsEnoughInfo) {
          // Only calculate the NowCast PM 2.5 value and the AQI if there is enough data
          const nowCastPm25Result = NowCastConcentration.fromCleanedAverages(
            cleanedAverages
          );
          currentSensorData.aqi = aqiFromPm25(nowCastPm25Result.reading);
          currentSensorData.latitude = nowCastPm25Result.latitude;
          currentSensorData.longitude = nowCastPm25Result.longitude;
          currentSensorData.nowCastPm25 = nowCastPm25Result.reading;
          currentSensorData.isValid = true;
          currentSensorData.lastValidAqiTime = Timestamp.fromDate(new Date());

          aqiBufferData.aqi = currentSensorData.aqi;
          aqiBufferData.timestamp = currentSensorData.lastValidAqiTime;
        }

        // Set data in map of sensor's PurpleAir ID to the sensor's most recent data
        currentData[currentSensorData.purpleAirId] = currentSensorData;

        // Update the AQI circular buffer for this element
        const sensorDocRef = firestore.collection('sensors').doc(sensorDoc.id);
        const status =
          sensorDocData.aqiBufferStatus ?? bufferStatus.DoesNotExist;

        // If the buffer status is In Progress we don't update the buffer
        // because the buffer is still being initialized
        if (status === bufferStatus.Exists) {
          // The buffer exists, proceed with normal update
          const aqiBuffer: Array<AqiBufferElement> = sensorDocData.aqiBuffer;
          aqiBuffer[sensorDocData.aqiBufferIndex] = aqiBufferData;

          await sensorDocRef.update({
            aqiBufferIndex:
              (sensorDocData.aqiBufferIndex + 1) % aqiBuffer.length, // eslint-disable-line no-magic-numbers,
            aqiBuffer: aqiBuffer,
            lastValidAqiTime: currentSensorData.lastValidAqiTime,
          });
        } else if (status === bufferStatus.DoesNotExist) {
          // Initialize populating the buffer with default values, don't update
          // any values until the buffer status is Exists
          await sensorDocRef.update({
            aqiBufferStatus: bufferStatus.InProgress,
            lastValidAqiTime: currentSensorData.lastValidAqiTime,
          });
          // This function updates the bufferStatus once the buffer has been
          // fully initialized, which uses an additional write to the database
          populateDefaultBuffer(true, sensorDoc.id);
        }
      }
    }

    // Send AQI readings to current-reading to be displayed on the map
    await firestore.collection('current-reading').doc('sensors').set({
      lastUpdated: FieldValue.serverTimestamp(),
      data: currentData,
    });
  });

// When there are many readings to get, extra time beyond the default 120 seconds
// may be necessary. 540 seconds is the maximum allowed value.
const generateReadingsCsvRuntimeOptions: functions.RuntimeOptions = {
  timeoutSeconds: 540,
};

exports.generateReadingsCsv = functions
  .runWith(generateReadingsCsvRuntimeOptions)
  .pubsub.topic('generate-readings-csv')
  .onPublish(generateReadingsCsv);

exports.generateAverageReadingsCsv = functions.pubsub
  .topic('generate-average-readings-csv')
  .onPublish(generateAverageReadingsCsv);
