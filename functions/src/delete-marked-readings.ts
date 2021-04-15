import {firestore} from './admin';
import {readingsSubcollection} from './aqi-calculation/util';

/**
 * Deletes readings before date marked for sensors in the deletion list.
 * This function deletes documents in batches of 500 documents and only deletes
 * 5000 documents at a time, to avoid timing out.
 */
async function deleteMarkedReadings(): Promise<void> {
  // The max batch size for batched writes according to Firestore is 500
  const batchSize = 500;

  // Upon testing, about 5000 documents can be deleted before the function times out
  let totalRemainingDeletes = 5000;

  const deletionMap =
    (await firestore.collection('deletion').doc('todo').get()).data()
      ?.deletionMap ?? Object.create(null);

  for (const sensorDocId in deletionMap) {
    if (totalRemainingDeletes > 0) {
      const deleteBeforeDate: FirebaseFirestore.Timestamp =
        deletionMap[sensorDocId];

      const query = firestore
        .collection(readingsSubcollection(sensorDocId))
        .where('timestamp', '<', deleteBeforeDate)
        .limit(batchSize);

      totalRemainingDeletes = await deleteSensorSubcollectionBatch(
        query,
        batchSize,
        totalRemainingDeletes,
        sensorDocId
      );
    }
  }
}

/**
 * Wrapper function for `deleteQueryBatch` that uses a custom resolve function that removes the sensor from the deletion map. This query should be called with a `query` only contained within one sensor.
 * @param query - the query to match on
 * @param maxBatchSize - the maximum documents to delete in a single tick
 * @param totalDeletesRemaining - the remaining number of documents to delete in this function call
 * @param sensorDocId - the sensor doc id for the sensor who the query is on
 * @returns a promise that when resolved is the number deletes operations remaining in this function call
 */
function deleteSensorSubcollectionBatch(
  query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData>,
  maxBatchSize: number,
  totalDeletesRemaining: number,
  sensorDocId: string
): Promise<number> {
  // The resolve function will only be called when there are no documents matching the query
  const resolve = async () => {
    const deletionDocRef = firestore.collection('deletion').doc('todo');

    const deletionMap =
      (await deletionDocRef.get()).data()?.deletionMap ?? Object.create(null);

    if (sensorDocId in deletionMap) {
      delete deletionMap[sensorDocId];
      deletionDocRef.update({deletionMap: deletionMap});
    }
  };

  return deleteQueryBatch(query, resolve, maxBatchSize, totalDeletesRemaining);
}

/**
 * Deletes all documents that match a query in batches.
 *
 * @param query - the query to match on
 * @param resolve - a function to execute when there are no more matching documents
 * @param maxBatchSize - the maximum documents to delete in a single tick
 * @param totalDeletesRemaining - the remaining number of documents to delete in this function call
 * @returns a promise that when resolved is the number deletes operations remaining in this function call
 */
async function deleteQueryBatch(
  query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData>,
  resolve: (value?: unknown) => void,
  maxBatchSize: number,
  totalDeletesRemaining: number
): Promise<number> {
  if (totalDeletesRemaining < 1) {
    return totalDeletesRemaining;
  }
  const snapshot = await query.limit(maxBatchSize).get();
  const batchSize = snapshot.size;
  if (batchSize === 0) {
    // When there are no documents left, we are done
    resolve();
    return totalDeletesRemaining;
  }

  // Delete documents in a batch
  const batch = query.firestore.batch();
  snapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });
  await batch.commit();
  const remainingDeletes = totalDeletesRemaining - batchSize;

  // Recurse on the next process tick, to avoid
  // exploding the stack.
  // process.nextTick(async () => {
  //   remainingDeletes = await deleteQueryBatch(
  //     query,
  //     resolve,
  //     maxBatchSize,
  //     remainingDeletes
  //   );
  // });

  return deleteQueryBatch(query, resolve, maxBatchSize, remainingDeletes);
}

export default deleteMarkedReadings;
