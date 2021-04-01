import {
  generateReadingsCsv,
  generateAverageReadingsCsv,
} from './download-readings';
import {functions} from './admin';
import {calculateAqi} from './aqi-calculation/calculate-aqi';
import {purpleAirToFirestore} from './aqi-calculation/purple-air-response';

exports.purpleAirToFirestore = functions.pubsub
  .schedule('every 2 minutes')
  .onRun(purpleAirToFirestore);

exports.calculateAqi = functions.pubsub
  .schedule('every 10 minutes')
  .onRun(calculateAqi);

// When there are many readings to get, extra time beyond the default 120 seconds
// may be necessary. 540 seconds is the maximum allowed value.
const generateReadingsCsvRuntimeOptions: functions.RuntimeOptions = {
  timeoutSeconds: 540,
};

exports.generateReadingsCsv = functions
  .runWith(generateReadingsCsvRuntimeOptions)
  .pubsub.topic('generate-readings-csv')
  .onPublish(generateReadingsCsv);

exports.generateAverageReadingsCsv = functions.pubsub
  .topic('generate-average-readings-csv')
  .onPublish(generateAverageReadingsCsv);

exports.deleteReadingCollection = functions.pubsub
  .topic('delete-reading-collections')
  .onPublish(async () => {
    const batchSize = 5000;

    const newReadingDoc = 'TOQBSNhD53Rf2t12lj5r'; // eslint-disable-line
    const newReadingsPath = readingsSubcollection(newReadingDoc);

    function deleteCollection(collectionPath: string, batchSize: number) {
      const collectionRef = firestore.collection(collectionPath);
      const query = collectionRef.limit(batchSize);

      return new Promise((resolve, reject) => {
        deleteQueryBatch(query, resolve).catch(reject);
      });
    }

    async function deleteQueryBatch(
      query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData>,
      resolve: (value?: unknown) => void
    ) {
      const snapshot = await query.get();
      if (snapshot.empty) {
        // When there are no documents left, we are done
        resolve();
        return;
      }

      // Delete documents in a batch
      const batch = firestore.batch();
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();

      // Recurse on the next process tick, to avoid
      // exploding the stack.
      process.nextTick(() => {
        deleteQueryBatch(query, resolve);
      });
    }

    return await deleteCollection(newReadingsPath, batchSize);
  });
