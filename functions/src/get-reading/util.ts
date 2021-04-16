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
      // eslint-disable-next-line no-magic-numbers
      return ((maxConfidence - confidence + 25) * 1.6) / 100;
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
function getDefaultSensorReadingErrors(): boolean[] {
  // TypeScript does not provide a way to get the number of elements in an
  // enumeration, so this gets the number of elements using the enumeration
  // reverse mapping.
  const sensorReadingErrorCount = Object.keys(SensorReadingErrors).length / 2;
  return new Array<boolean>(sensorReadingErrorCount).fill(false);
}

export {
  getLastSensorReadingTime,
  getMeanPercentDifference,
  SensorReadingErrors,
  getDefaultSensorReadingErrors,
};
