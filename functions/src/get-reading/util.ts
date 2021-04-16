import {PurpleAirReading} from './types';

/**
 * Converts PurpleAir's confidence value into percent difference
 * @param confidence - confidence value from PurpleAir, between 0 and 100
 * @returns meanPercentDifference value, or 2 (the maximum possible percent difference ) if the value is lost in calculation.
 *
 * @remarks
 * Any input that results in 2 means that the meanPercentDifference is high
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
      // If the confidence is zero, then we return the maximum possible percent difference
      return 2;
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
  data: Array<(string | number)>,
  fieldNames: Array<string>
): [number, [PurpleAirReading | null, Array<number>]] {
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
  const sensorErrors = getDefaultSensorReadingErrors();

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

    const epaPercentDifferenceThreshold = 0.7
    if (meanPercentDifference > epaPercentDifferenceThreshold) {
      sensorErrors[SensorReadingErrors.ChannelsDiverged] = true;
    }
    return [
      id,
      ,
    ];
  } else {
    if (humidity === undefined) {
      // TODO: set humidity issue
      sensorErrors[SensorReadingErrors.NoHumidityReading] = true;
      sensorErrors[SensorReadingErrors.IncompleteSensorReading] = true;
    } else {
      // TODO: Add channel down check
    }
    return [id, null];
  }
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
 * Errors that can occur with a single sensor reading. Since these errors only
 * affect a given sensor reading, these errors can occur and a sensor can still
 * have a valid AQI if enough of the other readings are valid.
 *
 * - `ReadingNotReceived` - In the most recent recent call to PurpleAir, no
 *   reading was received for this sensor.
 * - `NoHumidityReading` - No humidity reading was received for a sensor that
 *   had a reading from PurpleAir. For this error, `IncompleteSensorReading` is
 *   also true.
 * - `IncompleteSensorReading` - Some value for a sensor reading was not received.
 * - `ChannelsDiverged` - Channel A and Channel B of a PurpleAir sensor have
 *   diverged enough that the most recent sensor reading should not be used.
 *   We determine if the channels have diverged by calculating the mean percent
 *   difference between the readings for the channels from the confidence value
 *   from PurpleAir. The EPA recommends using a maximum mean percent difference
 *   of 0.7 for valid sensor readings.
 * - `ChannelADowngraded` - If PurpleAir has downgraded Channel A of a sensor.
 * - `ChannelBDowngraded` - If PurpleAir has downgraded Channel B of a sensor.
 */
enum SensorReadingErrors {
  ReadingNotReceived,
  NoHumidityReading,
  IncompleteSensorReading,
  ChannelsDiverged,
  ChannelADowngraded,
  ChannelBDowngraded,
}

/**
 * Returns a default error array for sensor errors
 * @returns an array for each `SensorReadingError` with the error set to `false`.
 */
function getDefaultSensorReadingErrors(): Array<boolean> {
  // TypeScript does not provide a way to get the number of elements in an enum,
  // so this gets the number of elements using the enum reverse mapping.
  const sensorReadingErrorCount = Object.keys(SensorReadingErrors).length / 2;
  return new Array<boolean>(sensorReadingErrorCount).fill(false);
}

export {
  getLastSensorReadingTime,
  getReading,
  getMeanPercentDifference,
  SensorReadingErrors,
  getDefaultSensorReadingErrors,
};
