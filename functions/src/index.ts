import {
  generateReadingsCsv,
  generateAverageReadingsCsv,
} from './download-readings';
import {firestore, functions} from './admin';
import {calculateAqi} from './aqi-calculation/calculate-aqi';
import {purpleAirToFirestore} from './aqi-calculation/purple-air-response';
import {CallableContext} from 'firebase-functions/lib/providers/https';

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

// Returns true if the current user is authenticated and is an admin user
async function isAdmin(context: CallableContext): Promise<boolean> {
  /* eslint-disable */
  console.log("entered isAdmin")
  console.log("context object")
  console.log(context)
  if (context && context.auth) {
    console.log("entered if branch of isAdmin")
    console.log("fetching user document")
    const userDocument = await firestore
      .doc(`/users/${context.auth.uid}`)
      .get();
    console.log("user document object")
    console.log(userDocument)
    console.log("user document data")
    console.log(userDocument.data())
    console.log("return value")
    console.log(userDocument.data()?.admin ?? false)
    return userDocument.data()?.admin ?? false;
  }
  console.log("Never entered if branch of isAdmin")
  /* eslint-enable */
  return false;
}

exports.testCallable = functions.https.onCall(
  async (data: undefined, context: CallableContext) => {
  console.log("In the testCallable") // eslint-disable-line
    if (!(await isAdmin(context))) {
    console.log('Not an admin'); // eslint-disable-line
      throw new functions.https.HttpsError(
        'permission-denied',
        'Must be an administrative user to initiate delete.'
      );
    } else {
    console.log('An admin'); // eslint-disable-line
    }

    return Promise.resolve();
  }
);
