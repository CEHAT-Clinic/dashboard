import * as functions from 'firebase-functions';
import axios from 'axios';
import PurpleAirResponse from './purple-air-response';
import * as  admin from 'firebase-admin'
import SensorReading from './sensor-reading';

admin.initializeApp();
const db = admin.firestore();

const THINGSPEAK_URL_TEMPLATE = "https://api.thingspeak.com/channels/<channel_id>/feeds.json";
const CHANNEL_FIELD = "<channel_id>";

const READINGS_SUBCOLLECTION_TEMPLATE = "/sensors/<doc_id>/readings";
const DOC_ID_FIELD = "<doc_id>";

async function getThingspeakKeysFromPurpleAir(purpleAirId: string): Promise<PurpleAirResponse> {
    const PURPLE_AIR_API_ADDRESS = "https://www.purpleair.com/json";

    const purpleAirApiResponse = await axios({
        url: PURPLE_AIR_API_ADDRESS,
        params: {
            show: purpleAirId
        }
    });

    return new PurpleAirResponse(purpleAirApiResponse);    
}

exports.thingspeakToFirestore = functions.pubsub.schedule("every 2 minutes").onRun(async () => {
    const sensorList =  (await db.collection("/sensors").get()).docs;
    for (const knownSensor of sensorList) {
        const thingspeakInfo: PurpleAirResponse  = await getThingspeakKeysFromPurpleAir(knownSensor.data()["purpleAirId"]);
        const channelAPrimaryData = await axios({
            url: THINGSPEAK_URL_TEMPLATE.replace(CHANNEL_FIELD, thingspeakInfo.channelAPrimaryId),
            params: {
                api_key: thingspeakInfo.channelAPrimaryKey, //eslint-disable-line @typescript-eslint/camelcase
                results: 1
            }
        })
        const channelBPrimaryData = await axios({
            url: THINGSPEAK_URL_TEMPLATE.replace(CHANNEL_FIELD, thingspeakInfo.channelBPrimaryId),
            params: {
                api_key: thingspeakInfo.channelBPrimaryKey, //eslint-disable-line @typescript-eslint/camelcase
                results: 1
            }
        })
        
        const reading = SensorReading.parseResponses(channelAPrimaryData, channelBPrimaryData, thingspeakInfo);
        
        const resolvedPath = READINGS_SUBCOLLECTION_TEMPLATE.replace(DOC_ID_FIELD, knownSensor.id);
        // Firebase doesn't support objects crerated using new
        if((await db.collection(resolvedPath).where("timestamp", "==", reading.timestamp).get()).empty) {

            const firestoreSafeReading = Object.assign({}, reading)
            await db.collection(resolvedPath).add(firestoreSafeReading);
        }
    }
});

/**
 * Gets the hourly averages for the past 12 hours for a single sensor. If less than
 * 90% of the readings are available for a time period,  
 * 
 * Note: In the event that a sensor is moved, the numbers reported by this
 * function for the averages in all times where the look-back period includes 
 * both locations, the information reported here is meaningless.
 * 
 * @param docId Firestore document id for the sensor to be getting averages for
 * @param purpleAirId PurpleAir ID for the sensor
 */
async function getHourlyAverages(docId: string): Promise<SensorReading[]> {
    const LOOKBACK_PERIOD_HOURS = 12;
    const averages = new Array<SensorReading>(LOOKBACK_PERIOD_HOURS);
    const now: Date = new Date();

    const currentTime = now;
    const previousTime = new Date(currentTime);
    previousTime.setUTCHours(previousTime.getUTCHours() - 1);

    const resolvedPath = READINGS_SUBCOLLECTION_TEMPLATE.replace(DOC_ID_FIELD, docId);

    for (let i = 0; i < averages.length; i++) {
        const readings = (await db.collection(resolvedPath).where("timestamp", ">", previousTime.toISOString()).where("timestamp", "<=", currentTime.toISOString()).get()).docs;
        // 90% of 1 reading every two minutes for an hour
        // Expressed this way to avoid imprecision of floating point arithmetic
        const MEASUREMENT_COUNT_THRESHOLD = 27;
        if(readings.length >= MEASUREMENT_COUNT_THRESHOLD) {
            const reading = SensorReading.averageDocuments(readings);
            averages[i] = reading;
        }
        
        currentTime.setUTCHours(currentTime.getUTCHours() - 1);
        previousTime.setUTCHours(previousTime.getUTCHours() - 1);
    }

    return averages;
}

/**
 * Cleans hourly averages of PM2.5 readings using the published EPA formula, excluding thosesd data points
 * that indicate sensor malfunction. Those datapoints are represented by the undefined value.
 * 
 * @param averages array containing sensor readings representing hourly averages
 * @returns an array of numbers representing the corrected PM2.5 values pursuant to the EPA formula
 */
function cleanAverages(averages: SensorReading[]): number[] {
    const RAW_THRESHOLD = 5;
    const PERCENT_THRESHOLD = 0.70;
    
    const cleanedAverages = new Array<number>(averages.length);
    
    for(let i = 0; i < cleanedAverages.length; i++) {
        const reading = averages[i];
        if(reading != undefined) {
            const averageChannels = (reading.channelAPmReading + reading.channelBPmReading) / 2
            const difference = Math.abs(reading.channelAPmReading - reading.channelBPmReading);
            if (!(difference > RAW_THRESHOLD && (difference /averageChannels) > PERCENT_THRESHOLD)) {
                // Formula from https://cfpub.epa.gov/si/si_public_record_report.cfm?dirEntryId=349513&Lab=CEMM&simplesearch=0&showcriteria=2&sortby=pubDate&timstype=&datebeginpublishedpresented=08/25/2018
                cleanedAverages[i] = 0.534 * averageChannels - 0.0844 * reading.humidity + 5.604; 
            }
        }
    }
    return cleanedAverages;
}

exports.calculateAqi = functions.pubsub.schedule("every 10 minutes").onRun(async (context) => {
    const sensorList =  (await db.collection("/sensors").get()).docs;
    for (const knownSensor of sensorList) {
        const docId = knownSensor.id;

        const hourlyAverages = await getHourlyAverages(docId);
        const cleanedAverages = cleanAverages(hourlyAverages);
        console.log(cleanedAverages);

        // Calculate AQI NEXT!
    }
});


