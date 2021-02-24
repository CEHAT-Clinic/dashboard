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

exports.checkDuplicateValidity = functions.pubsub
  .topic('check-duplicate-sensor-collections')
  .onPublish(() => {
    /* eslint-disable no-magic-numbers */
    /* eslint-disable no-console */
    /* eslint-disable spellcheck/spell-checker */
    // const november11 = 1605081600000;
    // Const december1 = 1606809600000;
    const january1 = 1609488000000;
    const february1 = 1612166400000;
    // const march1 = 1614585600000;
    const startDate = new Date(january1);
    const endDate = new Date(february1);

    const oldReadingDoc = 'P88zFw3le2YKltOcFzCH';
    const oldCollectionPath = readingsSubcollection(oldReadingDoc);
    const oldCollectionRef = firestore.collection(oldCollectionPath);

    const newReadingDoc = 'TOQBSNhD53Rf2t12lj5r';
    const newReadingsPath = readingsSubcollection(newReadingDoc);
    const newCollectionRef = firestore.collection(newReadingsPath);
    newCollectionRef
      .where('timestamp', '>', Timestamp.fromDate(startDate))
      .where('timestamp', '<=', Timestamp.fromDate(endDate))
      .get()
      .then(querySnapshot => {
        if (querySnapshot.docs) {
          console.log(`Number of docs: ${querySnapshot.docs.length}`);
          querySnapshot.docs.forEach(docSnapshot => {
            // Check if each reading has the reading in the old collection
            const reading = docSnapshot.data();
            if (reading) {
              oldCollectionRef
                .where('timestamp', '==', reading.timestamp)
                .get()
                .then(smallQuerySnapshot => {
                  if (smallQuerySnapshot.empty) {
                    // If the old collection does not have the reading, add it
                    console.log('Missing reading found');
                    oldCollectionRef.add({
                      timestamp: reading.timestamp,
                      channelAPm25: reading.channelAPm25,
                      channelBPm25: reading.channelBPm25,
                      humidity: reading.humidity,
                      latitude: reading.latitude,
                      longitude: reading.longitude,
                    });
                  }
                });
            }
          });
        }
      })
      .catch(error => {
        console.log(error);
      }).finally(() => console.log('Finished'));

    return 0; // Meaningless return value to follow Firebase rules

    /* eslint-enable no-magic-numbers */
    /* eslint-enable no-console */
    /* eslint-enable spellcheck/spell-checker */
  });
