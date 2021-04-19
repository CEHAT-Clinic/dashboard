import {functions} from './admin';
import {calculateAqi} from './aqi-calculation/calculate-aqi';
import {purpleAirToFirestore} from './get-reading/purple-air-to-firestore';
import deleteMarkedData from './deletion';

exports.purpleAirToFirestore = functions.pubsub
  .schedule('every 2 minutes')
  .onRun(purpleAirToFirestore);

exports.calculateAqi = functions.pubsub
  .schedule('every 10 minutes')
  .onRun(calculateAqi);

// When there are many readings to get, extra time beyond the default 120 seconds
// may be necessary. 540 seconds is the maximum allowed value.
const runLongOptions: functions.RuntimeOptions = {
  timeoutSeconds: 540,
};

exports.deleteMarkedReadings = functions
  .runWith(runLongOptions)
  .pubsub.schedule('every 24 hours')
  .onRun(deleteMarkedData);
