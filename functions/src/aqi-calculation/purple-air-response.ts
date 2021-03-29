import axios, {AxiosResponse} from 'axios';
import {firestore, config, Timestamp} from '../admin';
import {
  populateDefaultBuffer,
  defaultPm25BufferElement,
  bufferStatus,
  Pm25BufferElement,
} from './buffer';
import {
  readingsSubcollection,
  PurpleAirReading,
  HistoricalSensorReading,
} from './util';

/**
 * Make the PurpleAir API to using the group query
 * @returns PurpleAir API response
 */
async function fetchPurpleAirResponse(): Promise<AxiosResponse> {
  // The Group ID for the CEHAT's sensors is 490
  const purpleAirGroupApiUrl =
    'https://api.purpleair.com/v1/groups/490/members';

  // Fetch these data fields for each sensor. Available fields are documented
  // by the PurpleAir API
  const fieldList = [
    'sensor_index',
    'name',
    'latitude',
    'longitude',
    'confidence',
    'pm2.5',
    'humidity',
    'last_seen',
  ];

  // Only get readings from sensors that have an updated reading in the last 4 minutes
  const maxSensorAge = 240;

  // If an error is thrown, then it will be logged in Firestore
  const purpleAirResponse = await axios.get(purpleAirGroupApiUrl, {
    headers: {
      'X-API-Key': config.purpleair.read_key,
    },
    params: {
      fields: fieldList.join(),
      max_age: maxSensorAge, // eslint-disable-line camelcase
    },
  });

  return purpleAirResponse;
}

/**
 * Converts PurpleAir's confidence value into percent difference
 * @param confidence - confidence value from PurpleAir, between 0 and 100
 * @returns meanPercentDifference value, or NaN if value lost in calculation.
 * Any input that results in NaN means that the meanPercentDifference is high
 * enough that the reading should be discarded anyways.
 *
 * @remarks
 * PurpleAir's confidence values is calculated as follow. PurpleAir does not
 * document what "pseudo average" means.
 * ```ts
 * // a is the pseudo average for channel A
 * // b is the pseudo average for channel B
 * function getConfidence(a: number, b: number) {
 *   const diff = Math.abs(a - b)
 *   const avg = (a + b) / 2;
 *   const meanPercentDifference = (diff / avg) * 100;
 *   const percentConfidence = Math.max(
       Math.round(meanPercentDifference / 1.6) - 25, 0
 *   );
 *   return Math.max(100 - percentConfidence, 0);
 * }
 * ```
 */
function getMeanPercentDifference(confidence: number): number {
  const minConfidence = 0;
  const maxConfidence = 100;
  /* eslint-disable no-magic-numbers */
  switch (confidence) {
    case minConfidence:
      // If the confidence is zero, then we want to discard this reading
      return NaN;
    case maxConfidence:
      // The confidence value from PurpleAir can be 100 even if channel A and
      // channel B do not completely match, but if the confidence value is 100,
      // then the value is data is good enough to meet the EPA recommendation.
      return 0;
    default:
      // Otherwise, undo the calculation from the PurpleAir confidence value
      /* eslint-disable-next-line no-magic-numbers */
      return ((maxConfidence - confidence + 25) * 1.6) / 100;
  }
}

/**
 * Converts a PurpleAir reading returned from the group API query into a PurpleAirReading
 * @param data - list of data from PurpleAir for a given sensor
 * @param fieldNames - list of field names from PurpleAir that match the order of the data fields
 * @returns
 */
function getReading(
  data: (string | number)[],
  fieldNames: string[]
): [number, PurpleAirReading | null] {
  // Initialize all values
  let id: number = Number.NaN;
  let name: string | undefined = undefined;
  let latitude: number | undefined = undefined;
  let longitude: number | undefined = undefined;
  let meanPercentDifference: number | undefined = undefined;
  let pm25: number | undefined = undefined;
  let humidity: number | undefined = undefined;
  let timestamp: Date | undefined = undefined;

  data.forEach((value, index) => {
    // Check the corresponding field name to determine how to handle the value
    switch (fieldNames[index]) {
      case 'sensor_index':
        if (typeof value === 'number') id = value;
        break;
      case 'name':
        if (typeof value === 'string') name = value;
        break;
      case 'latitude': {
        if (typeof value === 'number') latitude = value;
        break;
      }
      case 'longitude':
        if (typeof value === 'number') longitude = value;
        break;
      case 'confidence':
        if (typeof value === 'number') {
          meanPercentDifference = getMeanPercentDifference(value);
        }
        break;
      case 'pm2.5':
        if (typeof value === 'number') pm25 = value;
        break;
      case 'humidity':
        if (typeof value === 'number') humidity = value;
        break;
      case 'last_seen':
        if (typeof value === 'number') {
          // PurpleAir returns seconds since EPOCH, but the Date constructor
          // takes milliseconds, so we convert from seconds to milliseconds
          timestamp = new Date(value * 1000); // eslint-disable-line no-magic-numbers
        }
        break;
      default:
        // Unknown field, ignore
        break;
    }
  });

  // Only return a PurpleAirReading if all fields are defined
  if (
    id &&
    name &&
    latitude !== undefined && // Can be zero
    longitude !== undefined && // Can be zero
    meanPercentDifference !== undefined && // Can be zero
    pm25 !== undefined && // Can be zero
    humidity !== undefined && // Can be zero
    timestamp
  ) {
    return [
      id,
      {
        id: id,
        name: name,
        latitude: latitude,
        longitude: longitude,
        meanPercentDifference: meanPercentDifference,
        pm25: pm25,
        humidity: humidity,
        timestamp: timestamp,
      },
    ];
  } else {
    return [id, null];
  }
}

/**
 * Translates PurpleAir response into map of sensor ID to PurpleAirReading
 * @returns map of sensor ID to PurpleAirReading
 */
async function getReadingsMap(): Promise<Map<number, PurpleAirReading | null>> {
  const purpleAirResponse = await fetchPurpleAirResponse();
  const readings: Map<number, PurpleAirReading | null> = new Map();
  const purpleAirData = purpleAirResponse.data;
  const fieldNames: string[] = purpleAirData.fields;
  const rawReadings: (string | number)[][] = purpleAirData.data;
  rawReadings.forEach(rawReading => {
    const [id, reading] = getReading(rawReading, fieldNames);
    readings.set(id, reading);
  });
  return readings;
}

/**
 * For a given readings subcollection, gets the most recent reading Timestamp
 * @param readingsCollectionRef - reference to readings collection for sensor to get the most recent reading time
 * @returns a Promise of the Timestamp of the most recent sensor reading time, or null if no readings
 */
async function getLastSensorReadingTime(
  readingsCollectionRef: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>
): Promise<FirebaseFirestore.Timestamp | null> {
  let lastSensorReadingTime: FirebaseFirestore.Timestamp | null = null;
  const maxDocs = 1;
  const querySnapshot = await readingsCollectionRef
    .orderBy('timestamp', 'desc')
    .limit(maxDocs)
    .get();
  // There should only be one document in docs, but loops over docs since it's an array
  for (const sensorDoc of querySnapshot.docs) {
    if (sensorDoc.data().timestamp) {
      lastSensorReadingTime = sensorDoc.data().timestamp;
    }
  }
  return lastSensorReadingTime;
}

/**
 * Converts the PurpleAir ID to a number, if necessary.
 * @param id - PurpleAir ID stored as a string or number
 * @returns the PurpleAir ID as a number
 */
function getPurpleAirId(id: string | number): number {
  if (typeof id === 'string') return +id;
  return id;
}

/**
 * Handles the PurpleAir API call for all active sensors,
 * storing the new data in each sensors' readings collection.
 */
async function purpleAirToFirestore(): Promise<void> {
  const readingsMap = await getReadingsMap();

  // Add each of the new readings to the readings subcollection and the pm25buffers
  const activeSensorDocsSnapshot = await firestore
    .collection('sensors')
    .where('isActive', '==', true)
    .get();

  for (const sensorDoc of activeSensorDocsSnapshot.docs) {
    const readingsCollectionRef = firestore.collection(
      readingsSubcollection(sensorDoc.id)
    );

    // Initialize the buffer element to the default value
    let pm25BufferElement: Pm25BufferElement = defaultPm25BufferElement;

    // Get the data from Firestore for this sensor
    const sensorDocData = sensorDoc.data() ?? {};
    const purpleAirId = getPurpleAirId(sensorDocData.purpleAirId);

    // If the lastSensorReadingTime field isn't set, query the readings
    // collection to find the timestamp of the most recent reading.
    const lastSensorReadingTime: FirebaseFirestore.Timestamp | null =
      sensorDocData.lastSensorReadingTime ??
      (await getLastSensorReadingTime(readingsCollectionRef));

    // If a reading for this sensor was not in the group query, then it did not
    // receive a new reading recently enough
    const reading = readingsMap.get(purpleAirId) ?? null;

    const readingTimestamp: FirebaseFirestore.Timestamp | null = reading
      ? Timestamp.fromDate(reading.timestamp)
      : null;

    if (reading && readingTimestamp) {
      // Before adding the reading to the historical database, check that it
      // doesn't already exist in the database
      if (
        lastSensorReadingTime === null ||
        lastSensorReadingTime.seconds !== readingTimestamp.seconds
      ) {
        // Update the buffer element from the default element
        pm25BufferElement = {
          timestamp: readingTimestamp,
          pm25: reading.pm25,
          meanPercentDifference: reading.meanPercentDifference,
          humidity: reading.humidity,
        };

        // Add to historical readings
        const historicalSensorReading: HistoricalSensorReading = {
          timestamp: readingTimestamp,
          pm25: reading.pm25,
          meanPercentDifference: reading.meanPercentDifference,
          humidity: reading.humidity,
          latitude: reading.latitude,
          longitude: reading.longitude,
        };
        await readingsCollectionRef.add(historicalSensorReading);
      }
    }

    // Add readings to the PM 2.5 buffer
    const status = sensorDocData.pm25BufferStatus ?? bufferStatus.DoesNotExist;

    switch (status) {
      case bufferStatus.Exists: {
        // If the buffer exists, update normally
        const pm25Buffer = sensorDocData.pm25Buffer;
        pm25Buffer[sensorDocData.pm25BufferIndex] = pm25BufferElement;
        // Update the sensor doc buffer and metadata
        if (reading) {
          await firestore
            .collection('sensors')
            .doc(sensorDoc.id)
            .update({
              pm25BufferIndex:
                (sensorDocData.pm25BufferIndex + 1) % pm25Buffer.length, // eslint-disable-line no-magic-numbers
              pm25Buffer: pm25Buffer,
              lastSensorReadingTime: readingTimestamp,
              latitude: reading.latitude,
              longitude: reading.longitude,
              name: reading.name,
              purpleAirId: reading.id,
            });
        } else {
          await firestore
            .collection('sensors')
            .doc(sensorDoc.id)
            .update({
              pm25BufferIndex:
                (sensorDocData.pm25BufferIndex + 1) % pm25Buffer.length, // eslint-disable-line no-magic-numbers
              pm25Buffer: pm25Buffer,
              lastSensorReadingTime: lastSensorReadingTime,
            });
        }
        break;
      }
      case bufferStatus.DoesNotExist: {
        // If the buffer does not exist, populate it with default values so
        // it can be updated in the future. This is done separately since
        // initializing the buffer is time consuming
        if (reading) {
          await firestore.collection('sensors').doc(sensorDoc.id).update({
            pm25BufferStatus: bufferStatus.InProgress,
            lastSensorReadingTime: readingTimestamp,
            latitude: reading.latitude,
            longitude: reading.longitude,
            name: reading.name,
            purpleAirId: reading.id,
          });
        } else {
          await firestore.collection('sensors').doc(sensorDoc.id).update({
            pm25BufferStatus: bufferStatus.InProgress,
          });
        }

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

export {getReadingsMap, fetchPurpleAirResponse, purpleAirToFirestore};
