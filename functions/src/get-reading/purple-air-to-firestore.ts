import {firestore, Timestamp, FieldValue} from '../admin';
import {
  populateDefaultBuffer,
  bufferStatus,
  Pm25BufferElement,
  getDefaultPm25BufferElement,
} from '../buffer';
import {HistoricalSensorReading, PurpleAirReading} from './types';
import {readingsSubcollection} from '../util';
import {getLastSensorReadingTime} from './util';
import {getReadingsMap} from './purple-air-response';
import {SensorReadingError} from './sensor-errors';

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
    let errors: SensorReadingError[] = [];
    let reading: PurpleAirReading | null = null;

    // If a reading for this sensor was not in the group query, then it did not
    // receive a new reading recently enough
    const purpleAirResult = readingsMap.get(purpleAirId);

    if (typeof purpleAirResult === 'undefined') {
      // No reading was received from PurpleAir
      errors.push(SensorReadingError.ReadingNotReceived);
    } else {
      // If PurpleAir returned anything for a sensor, the errors will be propagated
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
