import axios from 'axios';
import SensorReading, {PurpleAirReading} from './aqi-calculation/sensor-reading';
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
                reading.confidence = value;
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

      const dataTimeStamp: number = purpleAirData.data_time_stamp;

      // Add the readings to the historical database
    for (const [purpleAirId, reading] of readingsMap) {
      // TODO: get docId from current-readings
      const docId = '';
      const resolvedPath = readingsSubcollection(docId);
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
          pm25: reading.pm25,
          humidity: reading.humidity,
          latitude: reading.latitude,
          longitude: reading.longitude,
          confidence: reading.confidence
        };
        // Add to historical readings
        await readingsRef.add(firestoreSafeReading);
      }

      // Add readings to the PM 2.5 buffer
      const sensorDocRef = firestore.collection('sensors').doc(docId);
      const data = (await sensorDocRef.get()).data() ?? {};
      const status = data.pm25BufferStatus ?? bufferStatus.DoesNotExist;
      // If the buffer status is In Progress we don't update the buffer
      // because the buffer is still being initialized
      if (status === bufferStatus.Exists) {
        // If the buffer exists, update normally
        let pm25BufferIndex = data.pm25BufferIndex;
        const pm25Buffer = data.pm25Buffer;

        pm25Buffer[pm25BufferIndex] = firestoreSafeReading;
        /* eslint-disable-next-line no-magic-numbers */
        pm25BufferIndex = (pm25BufferIndex + 1) % pm25Buffer.length;

        await sensorDocRef.update({
          pm25BufferIndex: pm25BufferIndex,
          pm25Buffer: pm25Buffer,
        });
      } else if (status === bufferStatus.DoesNotExist || status === undefined) {
        // If the buffer does not exist, populate it with default values so
        // it can be updated in the future
        await sensorDocRef.update({
          pm25BufferStatus: bufferStatus.InProgress,
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
    const previousDataDoc = (
      await firestore.collection('current-reading').doc('sensors').get()
    ).data();
    const currentData = Object.create(null);
    for (const knownSensor of sensorList) {
      // Get sensor metadata
      const data = knownSensor.data();
      const sensorName: string = data?.name ?? '';
      const purpleAirId: string = data?.purpleAirId ?? '';
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

      // Defaults for a sensor
      let latitude = NaN;
      let longitude = NaN;
      let nowCastPm25 = NaN;
      let aqi = NaN;
      let isValid = false;
      let lastValidAqiTime: FirebaseFirestore.Timestamp | null = null;

      // If there is not enough info, the sensor's status is not valid
      if (containsEnoughInfo) {
        // Only calculate the NowCast PM 2.5 value and the AQI if there is enough data
        const nowCastPm25Result = NowCastConcentration.fromCleanedAverages(
          cleanedAverages
        );
        aqi = aqiFromPm25(nowCastPm25Result.reading);
        latitude = nowCastPm25Result.latitude;
        longitude = nowCastPm25Result.longitude;
        nowCastPm25 = nowCastPm25Result.reading;
        isValid = true;
        lastValidAqiTime = Timestamp.fromDate(new Date());

        aqiBufferData = {
          aqi: aqi,
          timestamp: lastValidAqiTime,
        };
      } else if (previousDataDoc) {
        const previousData = previousDataDoc.data;
        // Get the data from the previous reading, if it exists
        latitude = previousData[purpleAirId].latitude ?? latitude;
        longitude = previousData[purpleAirId].longitude ?? longitude;
        lastValidAqiTime =
          previousData[purpleAirId].lastValidAqiTime ?? lastValidAqiTime;
      }

      const currentSensorData: SensorData = {
        purpleAirId: purpleAirId,
        name: sensorName,
        latitude: latitude,
        longitude: longitude,
        nowCastPm25: nowCastPm25,
        aqi: aqi,
        isValid: isValid,
        readingDocId: docId,
        lastValidAqiTime: lastValidAqiTime,
      };

      currentData[purpleAirId] = currentSensorData;

      // Update the AQI circular buffer for this element
      const sensorDocRef = firestore.collection('/sensors').doc(docId);

      const status = data.aqiBufferStatus ?? bufferStatus.DoesNotExist;
      // If the buffer status is In Progress we don't update the buffer
      // because the buffer is still being initialized
      if (status === bufferStatus.Exists) {
        // The buffer exists, proceed with normal update
        let aqiBufferIndex: number = data.aqiBufferIndex;
        const aqiBuffer: Array<AqiBufferElement> = data.aqiBuffer;
        aqiBuffer[aqiBufferIndex] = aqiBufferData;
        /* eslint-disable-next-line no-magic-numbers */
        aqiBufferIndex = (aqiBufferIndex + 1) % aqiBuffer.length;
        await sensorDocRef.update({
          aqiBufferIndex: aqiBufferIndex,
          aqiBuffer: aqiBuffer,
        });
      } else if (status === bufferStatus.DoesNotExist) {
        // Initialize populating the buffer with default values, don't update
        // any values until the buffer status is Exists
        await sensorDocRef.update({
          aqiBufferStatus: bufferStatus.InProgress,
        });
        // This function updates the bufferStatus once the buffer has been
        // fully initialized, which uses an additional write to the database
        populateDefaultBuffer(true, docId);
      }
    }

    // Send AQI reading to current-readings to be displayed on the map
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
