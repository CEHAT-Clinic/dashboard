import axios from 'axios';
import SensorReading, { PurpleAirReading } from './aqi-calculation/sensor-reading';
import NowCastConcentration from './aqi-calculation/nowcast-concentration';
import {
  generateReadingsCsv,
  generateAverageReadingsCsv,
} from './download-readings';
import { firestore, Timestamp, FieldValue, functions, config } from './admin';
import { aqiFromPm25 } from './aqi-calculation/calculate-aqi';
import {
  readingsSubcollection,
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

exports.purpleAirToFirestore = functions.pubsub
  .schedule('every 2 minutes')
  .onRun(async () => {
    const fieldList = [
      'sensor_index',
      'name',
      'latitude',
      'longitude',
      'confidence',
      'pm2.5',
      'humidity',
      'last_seen'
    ];

    // Fetch data from PurpleAir API
    // The Group ID for the CEHAT's sensors is 490
    const purpleAirApiUrl = 'https://api.purpleair.com/v1/groups/490/members';
    try {
      const purpleAirResponse = await axios
        .get(purpleAirApiUrl, {
          headers: {
            'X-API-Key': config.purpleair.read_key,
          },
          params: {
            fields: fieldList.join(),
          },
        });
      const readingsMap: Map<number, PurpleAirReading> = new Map();
      const purpleAirData = purpleAirResponse.data;

      // Create index map
      const fields: string[] = purpleAirData.fields;

      function addReadingToMap(data: (string | number)[]): void {
        const reading = {} as PurpleAirReading;
        data.forEach((value, index) => {
          const fieldName = fields[index];
          switch (fieldName) {
            case ('sensor_index'): {
              if (typeof value === 'number') {
                reading.id = value;
              }
              break;
            }
            case ('name'): {
              if (typeof value === 'string') {
                reading.name = value;
              }
              break;
            }
            case ('latitude'): {
              if (typeof value === 'number') {
                reading.latitude = value;
              }
              break;
            }
            case ('longitude'): {
              if (typeof value === 'number') {
                reading.longitude = value;
              }
              break;
            }
            case ('confidence'): {
              if (typeof value === 'number') {
                // TODO: convert to percent difference
                reading.percentDifference = value;
              }
              break;
            }
            case ('pm2.5'): {
              if (typeof value === 'number') {
                reading.pm25 = value;
              }
              break;
            }
            case ('humidity'): {
              if (typeof value === 'number') {
                reading.humidity = value;
              }
              break;
            }
            case ('last_seen'): {
              if (typeof value === 'number') {
                // TODO: verify that this is the correct number
                reading.timestamp = new Date(value);
              }
              break;
            }
            default: {
              // Unknown field
              break;
            }
          }
        })
        if (reading && reading.id) {
          readingsMap.set(reading.id, reading);
        }
      }

      // Use the fields indices to get the data
      const readingList: (string | number)[][] = purpleAirData.data;
      readingList.forEach(reading => addReadingToMap(reading));

      // TODO: determine if this or last_seen should be used
      const dataTimeStamp: number = purpleAirData.data_time_stamp;

      // Add the readings to the historical database
      for (const [purpleAirId, reading] of readingsMap) {
        // TODO: get docId from current-readings using purpleAirId
        const docId = '';
        const resolvedPath = readingsSubcollection(docId);
        const sensorDocRef = firestore.collection('sensors').doc(docId);
        const readingsCollectionRef = firestore.collection(resolvedPath);

        const sensorDocData = (await sensorDocRef.get()).data() ?? {};

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

        const readingTimestamp = Timestamp.fromDate(reading.timestamp);
        // Before adding the reading to the historical database, check that it doesn't
        // already exist in the database
        if (lastSensorReadingTime !== readingTimestamp) {
          // Update reading with values
          firestoreSafeReading = {
            timestamp: Timestamp.fromDate(reading.timestamp),
            pm25: reading.pm25,
            percentDifference: reading.percentDifference,
            humidity: reading.humidity,
            latitude: reading.latitude,
            longitude: reading.longitude,
          };
          // Add to historical readings
          await readingsCollectionRef.add(firestoreSafeReading);
        }

        // Add readings to the PM 2.5 buffer
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
          populateDefaultBuffer(false, docId);
        }
      }
    } catch (error) {
      // TODO: handle error codes from Firestore and PurpleAir
    }
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
