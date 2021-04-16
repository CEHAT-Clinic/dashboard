import axios, {AxiosResponse} from 'axios';
import {firestore, config, Timestamp, FieldValue} from '../admin';
import {
  populateDefaultBuffer,
  bufferStatus,
  Pm25BufferElement,
  getDefaultPm25BufferElement,
} from '../aqi-calculation/buffer';
import {HistoricalSensorReading, PurpleAirReading} from './types';
import {readingsSubcollection} from '../util';
import {
  getMeanPercentDifference,
  getLastSensorReadingTime,
  getDefaultSensorReadingErrors,
  SensorReadingErrors,
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
 * Converts a PurpleAir reading returned from the group API query into a PurpleAirReading
 * @param data - list of data from PurpleAir for a given sensor
 * @param fieldNames - list of field names from PurpleAir that match the order of the data fields
 * @returns
 */
function getReading(
  data: (string | number)[],
  fieldNames: string[]
): [number, [PurpleAirReading | null, boolean[]]] {
  // Initialize all values
  let id: number = Number.NaN;
  let name: string | undefined = undefined;
  let latitude: number | undefined = undefined;
  let longitude: number | undefined = undefined;
  let meanPercentDifference: number | undefined = undefined;
  let pm25: number | undefined = undefined;
  let humidity: number | undefined = undefined;
  let timestamp: Date | undefined = undefined;

  // Initialize the error array
  const sensorErrors: boolean[] = getDefaultSensorReadingErrors();

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
    const reading: PurpleAirReading = {
      id: id,
      name: name,
      latitude: latitude,
      longitude: longitude,
      meanPercentDifference: meanPercentDifference,
      pm25: pm25,
      humidity: humidity,
      timestamp: timestamp,
    };

    const percentDifferenceThreshold = 0.7;
    if (meanPercentDifference > percentDifferenceThreshold) {
      sensorErrors[SensorReadingErrors.ChannelsDiverged] = true;
    }
    return [id, [reading, sensorErrors]];
  } else {
    if (humidity === undefined) {
      sensorErrors[SensorReadingErrors.NoHumidityReading] = true;
      sensorErrors[SensorReadingErrors.IncompleteSensorReading] = true;
    } else {
      // TODO: Add channel down check
    }
    return [id, [null, sensorErrors]];
  }
}

/**
 * Translates PurpleAir response into map of sensor ID to PurpleAirReading
 * @returns map of sensor ID to PurpleAirReading
 */
async function getReadingsMap(): Promise<
  Map<number, [PurpleAirReading | null, boolean[]]>
> {
  const purpleAirResponse = await fetchPurpleAirResponse();
  const readings: Map<number, [PurpleAirReading | null, boolean[]]> = new Map();
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

    // Get the existing data from Firestore for this sensor
    const sensorDocData: FirebaseFirestore.DocumentData =
      sensorDoc.data() ?? {};
    const purpleAirId: number = sensorDocData.purpleAirId;

    // If the lastSensorReadingTime field isn't set, query the readings
    // collection to find the timestamp of the most recent reading.
    const lastSensorReadingTime: FirebaseFirestore.Timestamp | null =
      sensorDocData.lastSensorReadingTime ??
      (await getLastSensorReadingTime(readingsCollectionRef));

    // Initialize sensor errors
    let errors: boolean[] = getDefaultSensorReadingErrors();
    let reading: PurpleAirReading | null = null;

    // If a reading for this sensor was not in the group query, then it did not
    // receive a new reading recently enough
    const purpleAirResult = readingsMap.get(purpleAirId);

    if (typeof purpleAirResult === 'undefined') {
      // No reading was received from PurpleAir
      errors[SensorReadingErrors.ReadingNotReceived] = true;
    } else {
      // If the reading was invalid or incomplete, the errors will be propagated
      [reading, errors] = purpleAirResult;
    }

    const readingTimestamp: FirebaseFirestore.Timestamp | null = reading
      ? Timestamp.fromDate(reading.timestamp)
      : null;

    // Initialize the buffer element to the default value
    let pm25BufferElement: Pm25BufferElement = getDefaultPm25BufferElement();

    // Initialize the sensor doc update data
    const sensorDocUpdate = Object.create(null);
    sensorDocUpdate.lastUpdated = FieldValue.serverTimestamp();
    sensorDocUpdate.sensorReadingErrors = errors;

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

        // Update the sensor doc's data
        sensorDocUpdate.lastSensorReadingTime = readingTimestamp;
        sensorDocUpdate.latitude = reading.latitude;
        sensorDocUpdate.longitude = reading.longitude;
        sensorDocUpdate.name = reading.name;

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

    // Update the PM2.5 buffer
    const status = sensorDocData.pm25BufferStatus ?? bufferStatus.DoesNotExist;
    if (status === bufferStatus.Exists) {
      // If the buffer exists, update normally
      const pm25Buffer = sensorDocData.pm25Buffer;
      pm25Buffer[sensorDocData.pm25BufferIndex] = pm25BufferElement;

      sensorDocUpdate.pm25BufferIndex =
        (sensorDocData.pm25BufferIndex + 1) % pm25Buffer.length; // eslint-disable-line no-magic-numbers
      sensorDocUpdate.pm25Buffer = pm25Buffer;
    } else if (status === bufferStatus.DoesNotExist) {
      // Initialize populating the buffer with default values, don't update
      // any values until the buffer status is Exists
      sensorDocUpdate.pm25BufferStatus = bufferStatus.InProgress;
    }

    // Send the updated data to the database
    await firestore
      .collection('sensors')
      .doc(sensorDoc.id)
      .update(sensorDocUpdate);

    // If the buffer didn't exist, use another write to initialize the buffer.
    // Since the buffer is large, this can be timely and this function ensures
    // that the buffer is not re-created while the buffer is being created.
    if (status === bufferStatus.DoesNotExist) {
      // This function updates the bufferStatus once the buffer has been
      // fully initialized, which uses an additional write to the database
      populateDefaultBuffer(false, sensorDoc.id);
    }
  }
}

export {purpleAirToFirestore};
