import * as functions from 'firebase-functions';
import axios from 'axios';
import PurpleAirResponse from './aqi-calculation/purple-air-response';
import SensorReading from './aqi-calculation/sensor-reading';
import {
  generateReadingsCsv,
  generateAverageReadingsCsv,
} from './download-readings';
import {firestore, Timestamp} from './admin';
import {calculateAqi} from './aqi-calculation/calculate-aqi';
import {
  thingspeakUrl,
  readingsSubcollection,
  getThingspeakKeysFromPurpleAir,
  getLastSensorReadingTime,
  HistoricalSensorReading,
} from './aqi-calculation/util';
import {
  bufferStatus,
  defaultPm25BufferElement,
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
    const sensorDocQuerySnapshot = await firestore
      .collection('sensors')
      .where('isActive', '==', true)
      .get();

    for (const sensorDoc of sensorDocQuerySnapshot.docs) {
      const sensorDocData = sensorDoc.data();
      if (sensorDocData.purpleAirId) {
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

        const readingsCollectionRef = firestore.collection(
          readingsSubcollection(sensorDoc.id)
        );

        // Initialize the buffer element to the default value
        let pm25BufferElement: Pm25BufferElement = defaultPm25BufferElement;

        // If the lastSensorReadingTime field isn't set, query the readings
        // collection to find the timestamp of the most recent reading.
        const lastSensorReadingTime: FirebaseFirestore.Timestamp | null =
          sensorDocData.lastSensorReadingTime ??
          (await getLastSensorReadingTime(readingsCollectionRef));

        // Timestamp of the current reading
        const readingTimestamp: FirebaseFirestore.Timestamp | null = Timestamp.fromDate(
          reading.timestamp
        );

        // Before adding the reading to the historical database, check that it doesn't
        // already exist in the database
        if (lastSensorReadingTime !== readingTimestamp) {
          // Update the buffer element from the default element
          pm25BufferElement = {
            timestamp: Timestamp.fromDate(reading.timestamp),
            channelAPm25: reading.channelAPm25,
            channelBPm25: reading.channelBPm25,
            humidity: reading.humidity,
          };

          // Add to historical readings
          const historicalSensorReading: HistoricalSensorReading = {
            timestamp: Timestamp.fromDate(reading.timestamp),
            channelAPm25: reading.channelAPm25,
            channelBPm25: reading.channelBPm25,
            humidity: reading.humidity,
            latitude: reading.latitude,
            longitude: reading.longitude,
          };
          await readingsCollectionRef.add(historicalSensorReading);
        }

        // Add readings to the PM 2.5 buffer
        const sensorDocRef = firestore.collection('sensors').doc(sensorDoc.id);
        const status =
          sensorDocData.pm25BufferStatus ?? bufferStatus.DoesNotExist;
        switch (status) {
          case bufferStatus.Exists: {
            // If the buffer exists, update normally
            const pm25Buffer = sensorDocData.pm25Buffer;
            pm25Buffer[sensorDocData.pm25BufferIndex] = pm25BufferElement;
            // Update the sensor doc buffer and metadata
            await sensorDocRef.update({
              pm25BufferIndex:
                (sensorDocData.pm25BufferIndex + 1) % pm25Buffer.length, // eslint-disable-line no-magic-numbers
              pm25Buffer: pm25Buffer,
              lastSensorReadingTime: readingTimestamp,
              latitude: reading.latitude,
              longitude: reading.longitude,
            });
            break;
          }
          case bufferStatus.DoesNotExist: {
            // If the buffer does not exist, populate it with default values so
            // it can be updated in the future. This is done separately since
            // initializing the buffer is time consuming
            await sensorDocRef.update({
              pm25BufferStatus: bufferStatus.InProgress,
              lastSensorReadingTime: readingTimestamp,
              latitude: reading.latitude,
              longitude: reading.longitude,
            });

            // This function updates the bufferStatus once the buffer has been
            // fully initialized, which uses an additional write to the database
            populateDefaultBuffer(false, sensorDoc.id);
            break;
          }
          default:
            // If the buffer status is In Progress we don't update the buffer
            // because the buffer is still being initialized
            break;
        }
      }
    }

    // Delays the loop so that we hopefully don't overload Thingspeak, avoiding
    // our program from getting blocked.
    // Allocates up to a minute of the two minute runtime for delaying
    const oneMinuteInMilliseconds = 60000;
    const delayBetweenSensors =
      oneMinuteInMilliseconds / sensorDocQuerySnapshot.docs.length;
    await new Promise(resolve => setTimeout(resolve, delayBetweenSensors));
  });

exports.calculateAqi = functions.pubsub
  .schedule('every 10 minutes')
  .onRun(calculateAqi);

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
