import axios, {AxiosResponse} from 'axios';
import {firestore, config, Timestamp} from '../admin';
import {
  populateDefaultBuffer,
  defaultPm25BufferElement,
  bufferStatus,
  Pm25BufferElement,
} from './buffer';
import {readingsSubcollection} from './util';

/**
 * Full reading information for a PurpleAir sensor from the PurpleAir API
 * - `name` - name of the sensor
 * - `id` - PurpleAir ID of the sensor, also called the sensor_index. This is
 *   the main identifier for a sensor.
 * - `latitude` - latitude of a sensor
 * - `longitude` - longitude of a sensor
 * - `pm25` - PM 2.5 reading for a sensor. This value is the average of the
 *   PM 2.5 reading for channelA and channelB
 * - `humidity` - humidity reading for a sensor
 * - `meanPercentDifference` - mean percent difference between the pseudo averages
 *   of the readings for channelA and channelB, as calculated from the confidence
 *   value returned by the PurpleAir API
 * - `timestamp` - the timestamp of the current reading
 */
interface PurpleAirReading {
  name: string;
  id: number;
  latitude: number;
  longitude: number;
  pm25: number;
  humidity: number;
  meanPercentDifference: number;
  timestamp: Date;
}

/**
 * Sensor reading data that is stored in the readings subcollection
 * - `latitude` - latitude of a sensor
 * - `longitude` - longitude of a sensor
 * - `pm25` - PM 2.5 reading for a sensor. This value is the average of the
 *   PM 2.5 reading for channelA and channelB
 * - `humidity` - humidity reading for a sensor
 * - `meanPercentDifference` - mean percent difference between the pseudo averages
 *   of the readings for channelA and channelB, as calculated from the confidence
 *   value returned by the PurpleAir API
 * - `timestamp` - the timestamp of the current reading
 */
interface HistoricalSensorReading {
  latitude: number;
  longitude: number;
  pm25: number;
  humidity: number;
  meanPercentDifference: number;
  timestamp: FirebaseFirestore.Timestamp;
}

/**
 * Make the PurpleAir API to using the group query
 * @returns PurpleAir API response
 */
async function fetchPurpleAirResponse(): Promise<AxiosResponse> {
  // The Group ID for the CEHAT's sensors is 490
  const purpleAirGroupApiUrl =
    'https://api.purpleair.com/v1/groups/490/members';
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

  // If an error is thrown, then it will be logged in Firestore
  const purpleAirResponse = await axios.get(purpleAirGroupApiUrl, {
    headers: {
      'X-API-Key': config.purpleair.read_key,
    },
    params: {
      fields: fieldList.join(),
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
 * document what `pc` means.
 * ```ts
 * // a is the pseudo average for channel A
 * // b is the pseudo average for channel B
 * function getConfidence(a: number, b: number) {
 *   const diff = Math.abs(a - b)
 *   const avg = (a + b) / 2;
 *   const meanPercentDifference = (diff / avg) * 100;
 *   const pc = Math.max(Math.round(meanPercentDifference / 1.6) - 25, 0);
 *   return Math.max(100 - pc, 0);
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
): PurpleAirReading | null {
  // Initialize all values
  let id: number | undefined = undefined;
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
    latitude &&
    longitude &&
    meanPercentDifference !== undefined && // Can be zero
    pm25 !== undefined && // Can be zero
    humidity &&
    timestamp
  ) {
    return {
      id: id,
      name: name,
      latitude: latitude,
      longitude: longitude,
      meanPercentDifference: meanPercentDifference,
      pm25: pm25,
      humidity: humidity,
      timestamp: timestamp,
    };
  } else {
    return null;
  }
}

/**
 * Translates PurpleAir response into map of sensor ID to PurpleAirReading
 * @returns map of sensor ID to PurpleAirReading
 */
async function getReadingsMap(): Promise<Map<number, PurpleAirReading>> {
  const purpleAirResponse = await fetchPurpleAirResponse();
  const readings: Map<number, PurpleAirReading> = new Map();
  const purpleAirData = purpleAirResponse.data;
  const fieldNames: string[] = purpleAirData.fields;
  const rawReadings: (string | number)[][] = purpleAirData.data;
  rawReadings.forEach(rawReading => {
    const reading = getReading(rawReading, fieldNames);
    if (reading) readings.set(reading.id, reading);
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
  querySnapshot.forEach(doc => {
    lastSensorReadingTime = doc.data().timestamp ?? null;
  });
  return lastSensorReadingTime;
}

/**
 * Get the PurpleAirReading for a single sensor
 * @param sensorId - the PurpleAir ID for the sensor
 * @returns PurpleAirReading for a sensor
 *
 * @remarks
 * This function is only called when a sensor is not in the 490 group
 */
async function getPurpleAirReading(
  sensorId: number
): Promise<PurpleAirReading> {
  const purpleAirGroupApiUrl =
    'https://api.purpleair.com/v1/groups/490/members';

  // Add the sensor to the sensor group 490
  const purpleAirResponse = await axios.post(purpleAirGroupApiUrl, {
    headers: {
      'X-API-Key': config.purpleair.write_key,
    },
    params: {
      sensor_index: sensorId, // eslint-disable-line camelcase
    },
  });

  // The response returned after adding the sensor to group 490 includes the reading
  const sensorData = purpleAirResponse.data.sensor;

  // The PM 2.5 value in the group query we usually use is an average of the
  // readings from channel A and channel B
  /* eslint-disable-next-line no-magic-numbers */
  const pm25 = (sensorData['pm2.5_a'] + sensorData['pm2.5_b']) / 2;

  // The confidence value in the group query we usually use is an average of the
  // auto and manual confidence values
  const confidence =
    (sensorData.confidence_manual + sensorData.confidence_auto) / 2; // eslint-disable-line no-magic-numbers

  // PurpleAir returns seconds since EPOCH, but the Date constructor takes
  // milliseconds, so we convert from seconds to milliseconds
  /* eslint-disable-next-line no-magic-numbers */
  const timestamp = new Date(sensorData.last_seen * 1000);

  const reading: PurpleAirReading = {
    id: sensorData.sensor_index,
    name: sensorData.name,
    latitude: sensorData.latitude,
    longitude: sensorData.longitude,
    timestamp: timestamp,
    pm25: pm25,
    meanPercentDifference: getMeanPercentDifference(confidence),
    humidity: sensorData.humidity_a,
  };

  return reading;
}

/**
 * Converts the PurpleAir ID to a number, if necessary.
 * @param id - PurpleAir ID stored as a string or number
 * @returns the PurpleAir ID as a number
 */
function getPurpleAirId(id: string | number) {
  if (typeof id === 'string') return +id;
  return id;
}

/**
 * Handles the PurpleAir API call for all active sensors,
 * storing the new data in each sensors' readings collection.
 */
async function purpleAirToFirestore(): Promise<void> {
  // Get and process PurpleAir data
  const readingsMap = await getReadingsMap();

  // Add each of the new readings to the readings subcollection and the pm25buffers
  const sensorDocQuerySnapshot = await firestore
    .collection('sensors')
    .where('isActive', '==', true)
    .get();

  for (const sensorDoc of sensorDocQuerySnapshot.docs) {
    // Initialize the buffer element to the default value
    let pm25BufferElement: Pm25BufferElement = defaultPm25BufferElement;

    // Get the reading for this sensor
    const sensorDocData = sensorDoc.data() ?? {};
    const purpleAirId = getPurpleAirId(sensorDocData.purpleAirId);
    const reading =
      readingsMap.get(purpleAirId) ?? (await getPurpleAirReading(purpleAirId));
    const readingsCollectionRef = firestore.collection(
      readingsSubcollection(sensorDoc.id)
    );

    // If the lastSensorReadingTime field isn't set, query the readings
    // collection to find the timestamp of the most recent reading.
    const lastSensorReadingTime: FirebaseFirestore.Timestamp | null =
      sensorDocData.lastSensorReadingTime ??
      (await getLastSensorReadingTime(readingsCollectionRef));

    // Timestamp of the current reading
    const readingTimestamp: FirebaseFirestore.Timestamp | null = Timestamp.fromDate(
      reading.timestamp
    );

    // Before adding the reading to the historical database, check that it
    // doesn't already exist in the database
    if (lastSensorReadingTime !== readingTimestamp) {
      // Update the buffer element from the default element
      pm25BufferElement = {
        timestamp: Timestamp.fromDate(reading.timestamp),
        pm25: reading.pm25,
        meanPercentDifference: reading.meanPercentDifference,
        humidity: reading.humidity,
      };

      // Add to historical readings
      const historicalSensorReading: HistoricalSensorReading = {
        timestamp: Timestamp.fromDate(reading.timestamp),
        pm25: reading.pm25,
        meanPercentDifference: reading.meanPercentDifference,
        humidity: reading.humidity,
        latitude: reading.latitude,
        longitude: reading.longitude,
      };
      await readingsCollectionRef.add(historicalSensorReading);
    }

    // Add readings to the PM 2.5 buffer
    const status = sensorDocData.pm25BufferStatus ?? bufferStatus.DoesNotExist;

    switch (status) {
      case bufferStatus.Exists: {
        // If the buffer exists, update normally
        const pm25Buffer = sensorDocData.pm25Buffer;
        pm25Buffer[sensorDocData.pm25BufferIndex] = pm25BufferElement;
        // Update the sensor doc buffer and metadata
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
        break;
      }
      case bufferStatus.DoesNotExist: {
        // If the buffer does not exist, populate it with default values so
        // it can be updated in the future. This is done separately since
        // initializing the buffer is time consuming
        await firestore.collection('sensors').doc(sensorDoc.id).update({
          pm25BufferStatus: bufferStatus.InProgress,
          lastSensorReadingTime: readingTimestamp,
          latitude: reading.latitude,
          longitude: reading.longitude,
          name: reading.name,
          purpleAirId: reading.id,
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

export {getReadingsMap, fetchPurpleAirResponse, purpleAirToFirestore};
