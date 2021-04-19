import {firestore, FieldValue, auth} from './admin';
import {readingsSubcollection} from './util';

/**
 * Deletes readings before date marked for sensors in the deletion list.
 * Deletes any users from Firebase Authentication that an admin user has
 * deleted. Deletes any user documents from `USER_COLLECTION` that a user or
 * admin user has deleted.
 * This function deletes documents in batches of 500 documents.
 */
async function deleteMarkedData(): Promise<void> {
  // The max batch size for batched writes according to Firestore is 500
  const batchSize = 500;

  const readingsDeletionData =
    (await firestore.collection('deletion').doc('readings').get()).data() ?? {};

  const readingsMap = readingsDeletionData.deletionMap ?? Object.create(null);

  for (const sensorDocId in readingsMap) {
    const deleteBeforeDate: FirebaseFirestore.Timestamp =
      readingsMap[sensorDocId];

    const query = firestore
      .collection(readingsSubcollection(sensorDocId))
      .where('timestamp', '<', deleteBeforeDate)
      .limit(batchSize);

    await deleteSensorSubcollectionBatch(query, batchSize, sensorDocId);
  }

  // Handle any user deletion tasks
  const userDeletionData =
    (await firestore.collection('deletion').doc('users').get()).data() ?? {};

  const userDocs: string[] = userDeletionData.userDocs ?? [];
  await deleteUserDocs(userDocs);

  const firebaseUsers: string[] = userDeletionData.firebaseUsers ?? [];
  await deleteFirebaseUsers(firebaseUsers);

  // Reset arrays after docs have been deleted
  await firestore.collection('deletion').doc('users').update({
    userDocs: [],
    firebaseUsers: [],
    lastUpdated: FieldValue.serverTimestamp(),
  });
}

/**
 * Handles deletion of Firebase Authentication accounts
 * @param userIds - user IDs of the Firebase Authentication accounts to delete
 */
async function deleteFirebaseUsers(userIds: string[]): Promise<void> {
  for (const userId of userIds) {
    await auth.deleteUser(userId);
  }
}

/**
 * Handles deletion of user documents
 * @param userIds - user IDs of the documents to delete in `USERS_COLLECTION`
 */
async function deleteUserDocs(userIds: string[]): Promise<void> {
  for (const userId of userIds) {
    await firestore.collection('users').doc(userId).delete();
  }
}

/**
 * Wrapper function for `deleteQueryBatch` that uses a custom resolve function that removes the sensor from the deletion map. This query should be called with a `query` only contained within one sensor.
 * @param query - the query to match on
 * @param maxBatchSize - the maximum documents to delete in a single tick
 * @param sensorDocId - the sensor doc id for the sensor who the query is on
 */
async function deleteSensorSubcollectionBatch(
  query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData>,
  maxBatchSize: number,
  sensorDocId: string
) {
  // The resolve function will only be called when there are no documents matching the query
  const resolve = async () => {
    const updates = Object.create(null);
    updates['lastUpdated'] = FieldValue.serverTimestamp();
    updates[`deletionMap.${sensorDocId}`] = FieldValue.delete();
    await firestore.collection('deletion').doc('readings').update(updates);
  };

  await deleteQueryBatch(query, resolve, maxBatchSize);
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
): Promise<void> {
  const snapshot = await query.limit(maxBatchSize).get();

  // When there are no documents left in the query, we are done.
  if (snapshot.empty) {
    resolve();
    return;
  }

  // Delete documents in a batch
  const batch = query.firestore.batch();
  snapshot.docs.forEach(doc => batch.delete(doc.ref));
  await batch.commit();

  // Recurse on the next process tick, to avoid exploding the stack.
  process.nextTick(() => deleteQueryBatch(query, resolve, maxBatchSize));
}

export default deleteMarkedData;
