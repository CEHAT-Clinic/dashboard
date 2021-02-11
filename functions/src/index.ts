import * as functions from 'firebase-functions';
import axios from 'axios';
import PurpleAirResponse from './purple-air-response';
import SensorReading from './sensor-reading';
import CleanedReadings from './cleaned-reading';
import NowCastConcentration from './nowcast-concentration';
import {
  generateReadingsCsv,
  generateAverageReadingsCsv,
} from './download-readings';
import {firestore, Timestamp, FieldValue} from './admin';
import {aqiFromPm25} from './calculate-aqi';

const thingspeakUrl = (channelId: string) =>
  `https://api.thingspeak.com/channels/${channelId}/feeds.json`;
const readingsSubcollection = (docId: string) => `/sensors/${docId}/readings`;

interface pm25BufferElement {
  timestamp: FirebaseFirestore.Timestamp | null,
  channelAPm25: number,
  channelBPm25: number,
  humidity: number,
  latitude: number,
  longitude: number,
}

// const defaultBufferElement: pm25BufferElement = {timestamp: null,
//                                                 channelAPm25: NaN,
//                                                 channelBPm25: NaN,
//                                                 humidity: NaN,
//                                                 latitude: NaN,
//                                                 longitude:NaN}

async function getThingspeakKeysFromPurpleAir(
  purpleAirId: string
): Promise<PurpleAirResponse> {
  const PURPLE_AIR_API_ADDRESS = 'https://www.purpleair.com/json';

  const purpleAirApiResponse = await axios({
    url: PURPLE_AIR_API_ADDRESS,
    params: {
      show: purpleAirId,
    },
  });

  return new PurpleAirResponse(purpleAirApiResponse);
}


const thingspeakToFirestoreRuntimeOpts: functions.RuntimeOptions = {
  timeoutSeconds: 120,
};

exports.thingspeakToFirestore = functions
  .runWith(thingspeakToFirestoreRuntimeOpts)
  .pubsub.schedule('every 2 minutes')
  .onRun(async () => {
    const sensorList = (await firestore.collection('/sensors').get()).docs;

    for (const knownSensor of sensorList) {
      const thingspeakInfo: PurpleAirResponse = await getThingspeakKeysFromPurpleAir(
        knownSensor.data()['purpleAirId']
      );
      const channelAPrimaryData = await axios({
        url: thingspeakUrl(thingspeakInfo.channelAPrimaryId),
        params: {
          api_key: thingspeakInfo.channelAPrimaryKey, // eslint-disable-line camelcase
          results: 1,
        },
      });
      const channelBPrimaryData = await axios({
        url: thingspeakUrl(thingspeakInfo.channelBPrimaryId),
        params: {
          api_key: thingspeakInfo.channelBPrimaryKey, // eslint-disable-line camelcase
          results: 1,
        },
      });
      const reading = SensorReading.fromThingspeak(
        channelAPrimaryData,
        channelBPrimaryData,
        thingspeakInfo
      );

      const resolvedPath = readingsSubcollection(knownSensor.id);
      const readingsRef = firestore.collection(resolvedPath); 

      // my code:
      const docRef = firestore.collection('sensors').doc(knownSensor.id);

      // If the PM 2.5 circular buffer or the buffer index are not present, 
      // add them to the document with initial values
      let pm25BufferIndex = 0;
      let pm25Buffer= new Array<pm25BufferElement>(3600);

      docRef.get().then(doc => {
        if (doc.exists) {
          if ((doc.get('pm25BufferIndex') == null) || 
              (doc.get('pm25Buffer') == null)){
            // add a default array and make the buffer index 0
            docRef.update({
              pm25BufferIndex: pm25BufferIndex,
              pm25Buffer: pm25Buffer
            })
          }else{
            pm25BufferIndex = doc.get('pm25BufferIndex')
            pm25Buffer = doc.get('pm25Buffer')
          }

      // If data is not already present in the databse, add it to the historical
      // readings and to the circular buffer
      if (
        (
          await readingsRef
            .where('timestamp', '==', Timestamp.fromDate(reading.timestamp))
            .get()
        ).empty
      ) {
        const firestoreSafeReading = {
          timestamp: Timestamp.fromDate(reading.timestamp),
          channelAPm25: reading.channelAPm25,
          channelBPm25: reading.channelBPm25,
          humidity: reading.humidity,
          latitude: reading.latitude,
          longitude: reading.longitude,
        };
        await readingsRef.add(firestoreSafeReading);

        // MY CODE:
        // add to circular buffer
        
        // sensorRef.set(firestoreSafeReading).then(() => {
        //   console.log("Document successfully written!");
        // });
        // END MY CODE
      } else{
        // Else, the data is already present in the database, so don't add to 
        // the historical readings, but still add to the circular buffer.
        // This happens when a sensor is down.

        // add to circular buffer with NaN
      }

      // Delays the loop so that we hopefully don't overload Thingspeak, avoiding
      // our program from getting blocked.
      // Allocates up to a minute of the two minute runtime for delaying
      const oneMinuteInMilliseconds = 60000;
      const delayBetweenSensors = oneMinuteInMilliseconds / sensorList.length;
      await new Promise(resolve => setTimeout(resolve, delayBetweenSensors));
    }
  });

/**
 * Gets the hourly averages for the past 12 hours for a single sensor. If less than
 * 90% of the readings are available for a time period, it leaves the data for that hour
 * as undefined per the EPA guidance to ignore hours without 90% of the data.
 *
 * Note: In the event that a sensor is moved, this function will report meaningless data for
 * the twelve hour period after the sensor is moved. This is because data from both locations
 * will be treated as if they came from the same location because the function assumes a sensor
 * is stationary.
 *
 * @param docId - Firestore document id for the sensor to be getting averages for
 * @param purpleAirId - PurpleAir ID for the sensor
 */
async function getHourlyAverages(docId: string): Promise<SensorReading[]> {
  const LOOKBACK_PERIOD_HOURS = 12;
  const averages = new Array<SensorReading>(LOOKBACK_PERIOD_HOURS);
  const currentHour: Date = new Date();
  const previousHour = new Date(currentHour);
  // Only modifies the hour field, keeps minutes field constant
  previousHour.setUTCHours(previousHour.getUTCHours() - 1); // eslint-disable-line no-magic-numbers

  const resolvedPath = readingsSubcollection(docId);

  for (let i = 0; i < averages.length; i++) {
    const readings = (
      await firestore
        .collection(resolvedPath)
        .where('timestamp', '>', Timestamp.fromDate(previousHour))
        .where('timestamp', '<=', Timestamp.fromDate(currentHour))
        .get()
    ).docs;

    // If we have 1 reading every two minutes, there are 30 readings in an hour
    // 90% of 30 readings is 27 readings. We must have 90% of the readings from
    // a given hour in order to compute the AQI per the EPA.
    // Expressed this way to avoid imprecision of floating point arithmetic.
    const MEASUREMENT_COUNT_THRESHOLD = 27;
    if (readings.length >= MEASUREMENT_COUNT_THRESHOLD) {
      const reading = SensorReading.averageDocuments(readings);
      averages[i] = reading;
    }

    /* eslint-disable no-magic-numbers */
    currentHour.setUTCHours(currentHour.getUTCHours() - 1);
    previousHour.setUTCHours(previousHour.getUTCHours() - 1);
    /* eslint-enable no-magic-numbers */
  }

  return averages;
}

/**
 * Cleans hourly averages of PM2.5 readings using the published EPA formula,
 * excluding thoses data points that indicate sensor malfunction. Those
 * data points are represented by NaN.
 *
 * @param averages - array containing sensor readings representing hourly averages
 * @returns an array of numbers representing the corrected PM2.5 values pursuant
 *          to the EPA formula
 */
function cleanAverages(averages: SensorReading[]): CleanedReadings {
  // These thresholds for the EPA indicate when diverging sensor readings
  // indicate malfunction. The EPA requires that the raw difference between
  // the readings be less than 5 and the percent difference be less than 70%
  const RAW_THRESHOLD = 5;
  const PERCENT_THRESHOLD = 0.7;

  const cleanedAverages = new Array<number>(averages.length);
  let latitude = NaN;
  let longitude = NaN;
  for (let i = 0; i < cleanedAverages.length; i++) {
    const reading = averages[i];
    if (reading !== undefined) {
      // Use first hour's location
      if (isNaN(latitude) || isNaN(longitude)) {
        latitude = reading.latitude;
        longitude = reading.longitude;
      }

      const averagePmReading =
        (reading.channelAPm25 + reading.channelBPm25) / 2; // eslint-disable-line no-magic-numbers
      const difference = Math.abs(reading.channelAPm25 - reading.channelBPm25);
      if (
        !(
          difference > RAW_THRESHOLD &&
          difference / averagePmReading > PERCENT_THRESHOLD
        )
      ) {
        // Formula from EPA to correct PurpleAir PM 2.5 readings
        // https://cfpub.epa.gov/si/si_public_record_report.cfm?dirEntryId=349513&Lab=CEMM&simplesearch=0&showcriteria=2&sortby=pubDate&timstype=&datebeginpublishedpresented=08/25/2018
        /* eslint-disable no-magic-numbers */
        cleanedAverages[i] =
          0.534 * averagePmReading - 0.0844 * reading.humidity + 5.604;
        /* eslint-enable no-magic-numbers */
      } else {
        // If reading exceeds thresholds above
        cleanedAverages[i] = Number.NaN;
      }
    } else {
      // If less than 27 data points were available for that hour, the reading
      // would have been undefined
      cleanedAverages[i] = Number.NaN;
    }
  }
  return new CleanedReadings(latitude, longitude, cleanedAverages);
}

exports.calculateAqi = functions.pubsub
  .schedule('every 10 minutes')
  .onRun(async () => {
    const sensorList = (await firestore.collection('/sensors').get()).docs;
    const currentData = Object.create(null);
    for (const knownSensor of sensorList) {
      const docId = knownSensor.id;
      const hourlyAverages = await getHourlyAverages(docId);
      const cleanedAverages = cleanAverages(hourlyAverages);

      // NowCast formula from the EPA requires 2 out of the last 3 hours
      // to be available
      let validEntriesLastThreeHours = 0;
      const THREE_HOURS = 3;
      for (
        let i = 0;
        i < Math.min(THREE_HOURS, cleanedAverages.readings.length);
        i++
      ) {
        if (!Number.isNaN(cleanedAverages.readings[i])) {
          validEntriesLastThreeHours++;
        }
      }
      const NOWCAST_RECENT_DATA_THRESHOLD = 2;
      const containsEnoughInfo =
        validEntriesLastThreeHours >= NOWCAST_RECENT_DATA_THRESHOLD;
      // If there is not enough info, the sensor's data is not reported
      if (containsEnoughInfo) {
        const purpleAirId: string = knownSensor.data()['purpleAirId'];
        const nowcastPm25 = NowCastConcentration.fromCleanedAverages(
          cleanedAverages
        );
        const aqi = aqiFromPm25(nowcastPm25.reading);
        currentData[purpleAirId] = {
          latitude: nowcastPm25.latitude,
          longitude: nowcastPm25.longitude,
          nowCastPm25: nowcastPm25.reading,
          aqi: aqi,
        };
      }
    }

    await firestore.collection('current-reading').doc('pm25').set({
      lastUpdated: FieldValue.serverTimestamp(),
      data: currentData,
    });
  });

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
