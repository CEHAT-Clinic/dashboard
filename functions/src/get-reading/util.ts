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

  const minPercentDifference = 0;
  const maxPercentDifference = 2;
  switch (confidence) {
    case minConfidence:
      // If the confidence is zero, then we return the maximum possible percent difference
      return maxPercentDifference;
    case maxConfidence:
      // The confidence value from PurpleAir can be 100 even if channel A and
      // channel B do not completely match, but if the confidence value is 100,
      // then the value is data is good enough to meet the EPA recommendation.
      return minPercentDifference;
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

export {getLastSensorReadingTime, getMeanPercentDifference};
