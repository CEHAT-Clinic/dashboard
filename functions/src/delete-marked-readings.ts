import {firestore} from './admin';
import {readingsSubcollection} from './aqi-calculation/util';

/**
 * Deletes readings before date marked for sensors in the deletion list
 */
async function deleteMarkedReadings(): Promise<void> {
  const batchSize = 2000;

  const deletionMap =
    (await firestore.collection('deletion').doc('todo').get()).data()
      ?.deletionMap ?? Object.create(null);

  for (const sensorDocId in deletionMap) {
    const deleteBeforeDate = deletionMap[sensorDocId];
    const readingsCollectionRef = firestore.collection(
      readingsSubcollection(sensorDocId)
    );
    const query = readingsCollectionRef
      .where('timestamp', '<', deleteBeforeDate)
      .limit(batchSize);

    deleteSensorSubcollectionBatch(query, batchSize, sensorDocId);
  }
}

/**
 * Wrapper function for `deleteQueryBatch` that uses a custom resolve function that removes the sensor from the deletion map. This query should be called with a `query` only contained within one sensor.
 * @param query - the query to match on
 * @param maxBatchSize - the maximum documents to delete in a single tick
 * @param sensorDocId - the sensor doc id for the sensor who the query is on
 */
function deleteSensorSubcollectionBatch(
  query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData>,
  maxBatchSize: number,
  sensorDocId: string
) {
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

  deleteQueryBatch(query, resolve, maxBatchSize);
}

/**
 * Deletes all documents that match a query in batches.
 *
 * @param query - the query to match on
 * @param resolve - a function to execute when there are no more matching documents
 * @param maxBatchSize - the maximum documents to delete in a single tick
 */
async function deleteQueryBatch(
  query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData>,
  resolve: (value?: unknown) => void,
  maxBatchSize: number
) {
  const db = query.firestore;

  const snapshot = await query.limit(maxBatchSize).get();
  const batchSize = snapshot.size;
  if (batchSize === 0) {
    // When there are no documents left, we are done
    resolve();
    return;
  }

  // Delete documents in a batch
  const batch = db.batch();
  snapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });
  await batch.commit();

  // Recurse on the next process tick, to avoid
  // exploding the stack.
  process.nextTick(() => {
    deleteQueryBatch(query, resolve, maxBatchSize);
  });
}

export default deleteMarkedReadings;
