import {CallableContext} from 'firebase-functions/lib/providers/https';
import {firestore, functions, Timestamp} from './admin';
import {readingsSubcollection} from './aqi-calculation/util';

async function deleteOldReadings(
  data: any,
  context: CallableContext
): Promise<unknown[]> {
  if (!isAdmin(context)) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Must be an administrative user to initiate delete.'
    );
  }

  const batchSize = 2000;
  const sensorDocsSnapshot = await firestore.collection('sensors').get();
  const deletionPromises = new Array<Promise<unknown>>(sensorDocsSnapshot.size);
  for (const sensorDoc of sensorDocsSnapshot.docs) {
    const readingsCollectionRef = firestore.collection(
      readingsSubcollection(sensorDoc.id)
    );

    const sevenDaysAgoDate = new Date();
    sevenDaysAgoDate.setDate(sevenDaysAgoDate.getDate() - 7);
    const sevenDaysAgoTimestamp = Timestamp.fromDate(sevenDaysAgoDate);

    const query = readingsCollectionRef
      .where('timestamp', '<', sevenDaysAgoTimestamp)
      .limit(batchSize);

    deletionPromises.push(
      new Promise((resolve, reject) => {
        deleteQueryBatch(firestore, query, resolve, batchSize).catch(reject);
      })
    );
  }

  return Promise.all(deletionPromises);
}

/**
 * Given a query, delete it in batches
 */
async function deleteQueryBatch(
  db: typeof firestore,
  query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData>,
  resolve: (value?: unknown) => void,
  maxBatchSize: number
) {
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
    deleteQueryBatch(db, query, resolve, maxBatchSize);
  });
}

export default deleteOldReadings;
