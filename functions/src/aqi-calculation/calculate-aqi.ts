import {firestore, FieldValue, Timestamp} from '../admin';
import {
  bufferStatus,
  defaultAqiBufferElement,
  populateDefaultBuffer,
  AqiBufferElement,
  Pm25BufferElement,
} from './buffer';
import {CurrentReadingSensorData} from './util';
import NowCastConcentration from './nowcast-concentration';
import SensorReading from './sensor-reading';
import {cleanAverages, getHourlyAverages} from './cleaned-reading';

/**
 * Computes the AQI for PM 2.5 given the appropriate AQI breakpoints.
 * In most use cases, this function will be called from a function which knows those breakpoints.
 *
 * Adapted from EPA function available at https://www.airnow.gov/sites/default/files/custom-js/conc-aqi.js
 *
 * @param pm25Concentration - the PM 2.5 concentration (in micrograms per cubic meter) to calculate the AQI for
 * @param lowConcentrationBreakpoint - the low breakpoint for PM 2.5 that the concentration falls within
 * @param highConcentrationBreakpoint - the high breakpoint for PM 2.5 that the concentration falls within
 * @param lowIndexBreakpoint - the low breakpoint for AQI that the AQI will fall between
 * @param highIndexBreakpoint - the high breakpoint for AQI that the AQI will fall between
 */
function indexCalculation(
  highIndexBreakpoint: number,
  lowIndexBreakpoint: number,
  highConcentrationBreakpoint: number,
  lowConcentrationBreakpoint: number,
  pm25Concentration: number
): number {
  const indexRange = highIndexBreakpoint - lowIndexBreakpoint;
  const concentrationRange =
    highConcentrationBreakpoint - lowConcentrationBreakpoint;
  const rangeRelativeConcentration =
    pm25Concentration - lowConcentrationBreakpoint;

  return (
    (indexRange / concentrationRange) * rangeRelativeConcentration +
    lowIndexBreakpoint
  );
}

/**
 * Computes the AQI for a given PM 2.5 concentration in micrograms per cubic meter.
 *
 * Adapted from EPA functions available at https://www.airnow.gov/sites/default/files/custom-js/conc-aqi.js
 * @param pm25Concentration - the PM 2.5 concentration (in micrograms per cubic meter) to calculate the AQI for
 * @returns the AQI for a given PM 2.5 concentration
 * @remarks The value is rounded to the nearest integer for valid AQI ranges. If the PM 2.5 concentration is less than zero, the reported AQI is negative infinity. If the PM 2.5 concentration is too high ("beyond the AQI" in EPA parlance), positive infinity is reported.
 */
function aqiFromPm25(pm25Concentration: number): number {
  // Source of bound values is Table 6 of the paper at
  // https://www.airnow.gov/sites/default/files/2018-05/aqi-technical-assistance-document-may2016.pdf
  /* eslint-disable no-magic-numbers */
  // EPA formulas require PM 2.5 to be truncated to one decimal place
  const truncatedPm25 = Math.floor(10 * pm25Concentration) / 10;

  let aqi = 0;
  let highAqiBound = 0;
  let lowAqiBound = 0;
  let highPmBound = 0;
  let lowPmBound = 0;

  // Assign appropriate bounds
  if (truncatedPm25 < 12.1) {
    [highAqiBound, lowAqiBound, highPmBound, lowPmBound] = [50, 0, 12, 0];
  } else if (truncatedPm25 < 35.5) {
    [highAqiBound, lowAqiBound, highPmBound, lowPmBound] = [
      100,
      51,
      35.4,
      12.1,
    ];
  } else if (truncatedPm25 < 55.5) {
    [highAqiBound, lowAqiBound, highPmBound, lowPmBound] = [
      150,
      101,
      55.4,
      35.5,
    ];
  } else if (truncatedPm25 < 150.5) {
    [highAqiBound, lowAqiBound, highPmBound, lowPmBound] = [
      200,
      151,
      150.4,
      55.5,
    ];
  } else if (truncatedPm25 < 250.5) {
    [highAqiBound, lowAqiBound, highPmBound, lowPmBound] = [
      300,
      201,
      250.4,
      150.5,
    ];
  } else if (truncatedPm25 < 350.5) {
    [highAqiBound, lowAqiBound, highPmBound, lowPmBound] = [
      400,
      301,
      350.4,
      250.5,
    ];
  } else if (truncatedPm25 < 500.5) {
    [highAqiBound, lowAqiBound, highPmBound, lowPmBound] = [
      500,
      401,
      500.4,
      350.5,
    ];
  }

  // Values beyond the range are indicated by infinite values
  if (truncatedPm25 < 0) {
    aqi = Number.NEGATIVE_INFINITY;
  } else if (truncatedPm25 >= 500.5) {
    aqi = Number.POSITIVE_INFINITY;
  } else {
    aqi = indexCalculation(
      highAqiBound,
      lowAqiBound,
      highPmBound,
      lowPmBound,
      truncatedPm25
    );
  }
  /* eslint-enable no-magic-numbers */
  return Math.round(aqi);
}

/**
 * Using the Pm25Buffer, calculates the AQI if there is enough readings and updates
 * the current-readings AQI data and AQI-validity status. Also updates the aqiBuffer.
 */
async function calculateAqi(): Promise<void> {
  // Initialize the currentData map
  const currentData = Object.create(null);

  // Get all currently active sensors
  const sensorDocQuerySnapshot = await firestore
    .collection('sensors')
    .where('isActive', '==', true)
    .get();
  for (const sensorDoc of sensorDocQuerySnapshot.docs) {
    const sensorDocData = sensorDoc.data();

    // Data sent to the current-readings collection
    // Initially the previous data's value or the default values
    const currentSensorData: CurrentReadingSensorData = {
      purpleAirId: sensorDocData.purpleAirId ?? '',
      name: sensorDocData.name ?? '',
      latitude: sensorDocData.latitude ?? NaN,
      longitude: sensorDocData.latitude ?? NaN,
      readingDocId: sensorDoc.id,
      lastValidAqiTime: sensorDocData.lastValidAqiTime ?? null,
      lastSensorReadingTime: sensorDocData.lastSensorReadingTime ?? null,
      isActive: sensorDocData.isActive ?? true,
      nowCastPm25: NaN,
      aqi: NaN,
      isValid: false,
    };

    // Data used to calculate hourly averages
    const pm25BufferStatus: bufferStatus =
      sensorDocData.pm25BufferStatus ?? bufferStatus.DoesNotExist;
    const pm25BufferIndex: number = sensorDocData.pm25BufferIndex ?? 0;
    const pm25Buffer: Array<Pm25BufferElement> = sensorDocData.pm25Buffer ?? [];

    // Get current sensor readings
    const hourlyAverages: SensorReading[] = getHourlyAverages(
      pm25BufferStatus,
      pm25BufferIndex,
      pm25Buffer
    );
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

    // If there's enough info, the sensor's data is updated
    // If there isn't, we send the default AQI buffer element
    const aqiBufferData = defaultAqiBufferElement; // New data to add

    // If there is not enough info, the sensor's status is not valid
    if (validEntriesLastThreeHours >= NOWCAST_RECENT_DATA_THRESHOLD) {
      // Only calculate the NowCast PM 2.5 value and the AQI if there is enough data
      const nowCastPm25Result = NowCastConcentration.fromCleanedAverages(
        cleanedAverages
      );
      currentSensorData.aqi = aqiFromPm25(nowCastPm25Result.reading);
      currentSensorData.latitude = nowCastPm25Result.latitude;
      currentSensorData.longitude = nowCastPm25Result.longitude;
      currentSensorData.nowCastPm25 = nowCastPm25Result.reading;
      currentSensorData.isValid = true;
      currentSensorData.lastValidAqiTime = Timestamp.fromDate(new Date());

      aqiBufferData.aqi = currentSensorData.aqi;
      aqiBufferData.timestamp = currentSensorData.lastValidAqiTime;
    }

    // Set data in map of sensor's PurpleAir ID to the sensor's most recent data
    currentData[currentSensorData.purpleAirId] = currentSensorData;

    // Update the AQI circular buffer for this element
    const sensorDocRef = firestore.collection('sensors').doc(sensorDoc.id);
    const status = sensorDocData.aqiBufferStatus ?? bufferStatus.DoesNotExist;

    // If the buffer status is In Progress we don't update the buffer
    // because the buffer is still being initialized
    if (status === bufferStatus.Exists) {
      // The buffer exists, proceed with normal update
      const aqiBuffer: Array<AqiBufferElement> = sensorDocData.aqiBuffer;
      aqiBuffer[sensorDocData.aqiBufferIndex] = aqiBufferData;

      await sensorDocRef.update({
        aqiBufferIndex: (sensorDocData.aqiBufferIndex + 1) % aqiBuffer.length, // eslint-disable-line no-magic-numbers,
        aqiBuffer: aqiBuffer,
        lastValidAqiTime: currentSensorData.lastValidAqiTime,
      });
    } else if (status === bufferStatus.DoesNotExist) {
      // Initialize populating the buffer with default values, don't update
      // any values until the buffer status is Exists
      await sensorDocRef.update({
        aqiBufferStatus: bufferStatus.InProgress,
        lastValidAqiTime: currentSensorData.lastValidAqiTime,
      });
      // This function updates the bufferStatus once the buffer has been
      // fully initialized, which uses an additional write to the database
      populateDefaultBuffer(true, sensorDoc.id);
    }
  }

  // Send AQI readings to current-reading to be displayed on the map
  await firestore.collection('current-reading').doc('sensors').set({
    lastUpdated: FieldValue.serverTimestamp(),
    data: currentData,
  });
}

export {calculateAqi};
