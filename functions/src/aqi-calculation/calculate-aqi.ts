import {firestore, FieldValue, Timestamp} from '../admin';
import {
  BufferStatus,
  populateDefaultBuffer,
  AqiBufferElement,
  Pm25BufferElement,
  getDefaultAqiBufferElement,
} from '../buffer';
import {CurrentReadingSensorData} from './types';
import {InvalidAqiError} from './invalid-aqi-errors';
import {
  getCleanedAverages,
  cleanedReadingsToNowCastPm25,
} from './cleaned-reading';
import {
  CURRENT_READING_COLLECTION,
  SENSORS_COLLECTION,
  SENSORS_DOC,
} from '../firestore';

/**
 * Computes the AQI for PM2.5 given the appropriate AQI breakpoints.
 * In most use cases, this function will be called from a function which knows those breakpoints.
 *
 * Adapted from EPA function available at https://www.airnow.gov/sites/default/files/custom-js/conc-aqi.js
 *
 * @param pm25Concentration - the PM2.5 concentration (in micrograms per cubic meter) to calculate the AQI for
 * @param lowConcentrationBreakpoint - the low breakpoint for PM2.5 that the concentration falls within
 * @param highConcentrationBreakpoint - the high breakpoint for PM2.5 that the concentration falls within
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
 * Computes the AQI for a given PM2.5 concentration in micrograms per cubic meter.
 *
 * Adapted from EPA functions available at https://www.airnow.gov/sites/default/files/custom-js/conc-aqi.js
 * @param pm25Concentration - the PM2.5 concentration (in micrograms per cubic meter) to calculate the AQI for
 * @returns the AQI for a given PM2.5 concentration
 * @remarks The value is rounded to the nearest integer for valid AQI ranges. If the PM2.5 concentration is less than zero, the reported AQI is negative infinity. If the PM2.5 concentration is too high ("beyond the AQI" in EPA parlance), positive infinity is reported.
 */
function aqiFromPm25(pm25Concentration: number): number {
  // Source of bound values is Table 6 of the paper at
  // https://www.airnow.gov/sites/default/files/2018-05/aqi-technical-assistance-document-may2016.pdf
  /* eslint-disable no-magic-numbers */
  // EPA formulas require PM2.5 to be truncated to one decimal place
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
 * Using the Pm25Buffer, calculates the AQI if there is enough readings and
 * updates the `current-readings` AQI data and AQI-validity status. Also updates
 * the aqiBuffer in each sensor doc.
 */
async function calculateAqi(): Promise<void> {
  // Initialize the currentData map
  const currentData = Object.create(null);

  // Get all currently active sensors
  const activeSensorDocsSnapshot = await firestore
    .collection(SENSORS_COLLECTION)
    .where('isActive', '==', true)
    .get();

  for (const sensorDoc of activeSensorDocsSnapshot.docs) {
    const sensorDocData = sensorDoc.data();

    // Data sent to the current-readings collection
    // Initially the previous data's value or the default values
    const currentSensorData: CurrentReadingSensorData = {
      purpleAirId: sensorDocData.purpleAirId ?? Number.NaN,
      name: sensorDocData.name ?? '',
      latitude: sensorDocData.latitude ?? Number.NaN,
      longitude: sensorDocData.longitude ?? Number.NaN,
      readingDocId: sensorDoc.id,
      lastValidAqiTime: sensorDocData.lastValidAqiTime ?? null,
      lastSensorReadingTime: sensorDocData.lastSensorReadingTime ?? null,
      isActive: sensorDocData.isActive ?? true,
      nowCastPm25: Number.NaN,
      aqi: Number.NaN,
      isValid: false,
    };

    // Data used to calculate hourly averages
    const pm25BufferStatus: BufferStatus =
      sensorDocData.pm25BufferStatus ?? BufferStatus.DoesNotExist;
    const pm25BufferIndex: number = sensorDocData.pm25BufferIndex ?? 0;
    const pm25Buffer: Pm25BufferElement[] = sensorDocData.pm25Buffer ?? [];

    // Get cleaned hourly averages from the PM2.5 Buffer for the last 12 hours
    // If an hour lacks enough data, the entry for the hour is `NaN`.
    // Note that we only use the dataCleaningErrors if the errors result in an
    // invalid AQI, since one hour can have errors and the AQI can still be valid.
    const [cleanedAverages, dataCleaningErrors] = getCleanedAverages(
      pm25BufferStatus,
      pm25BufferIndex,
      pm25Buffer
    );

    // NowCast formula from the EPA requires 2 out of the last 3 hours
    // to be available
    let validEntriesLastThreeHours = 0;
    const THREE_HOURS = 3;
    for (let hoursAgo = 0; hoursAgo < THREE_HOURS; hoursAgo++) {
      if (!Number.isNaN(cleanedAverages[hoursAgo])) {
        validEntriesLastThreeHours++;
      }
    }

    // If there's enough info, the sensor's data is updated
    // If there isn't, we send the AQI buffer element with default values
    let aqiBufferElement: AqiBufferElement = getDefaultAqiBufferElement();

    // Initialize the invalid AQI errors
    let invalidAqiErrors: InvalidAqiError[] = [];

    // If there is not enough info, the sensor's status is not valid
    const NOWCAST_RECENT_DATA_THRESHOLD = 2;
    if (validEntriesLastThreeHours >= NOWCAST_RECENT_DATA_THRESHOLD) {
      // If the calculated AQI is infinity, then the sensor value is not valid
      // Only calculate the NowCast PM2.5 value and the AQI if there is enough data
      const nowCastPm25 = cleanedReadingsToNowCastPm25(cleanedAverages);
      const aqi = aqiFromPm25(nowCastPm25);
      if (Number.isFinite(aqi)) {
        currentSensorData.aqi = aqi;
        currentSensorData.nowCastPm25 = nowCastPm25;
        currentSensorData.isValid = true;
        currentSensorData.lastValidAqiTime = Timestamp.fromDate(new Date());

        aqiBufferElement = {
          aqi: currentSensorData.aqi,
          timestamp: currentSensorData.lastValidAqiTime,
        };
      } else {
        // Infinite AQI
        invalidAqiErrors.push(InvalidAqiError.InfiniteAqi);
      }
    } else {
      // There weren't enough valid readings in the last 3 hours, so we propagate
      // the errors from the data cleaning step.
      invalidAqiErrors = dataCleaningErrors;
    }

    // Set data in map of sensor's PurpleAir ID to the sensor's most recent data
    currentData[currentSensorData.purpleAirId] = currentSensorData;

    // Data to update in the sensor doc
    const sensorDocUpdate = Object.create(null);
    sensorDocUpdate.lastUpdated = FieldValue.serverTimestamp();
    sensorDocUpdate.lastValidAqiTime = currentSensorData.lastValidAqiTime;
    sensorDocUpdate.isValid = currentSensorData.isValid;
    sensorDocUpdate.invalidAqiErrors = invalidAqiErrors;

    // Update the AQI circular buffer for this element
    const status = sensorDocData.aqiBufferStatus ?? BufferStatus.DoesNotExist;
    if (status === BufferStatus.Exists) {
      // The buffer exists, proceed with normal update
      const aqiBuffer: AqiBufferElement[] = sensorDocData.aqiBuffer;
      aqiBuffer[sensorDocData.aqiBufferIndex] = aqiBufferElement;
      sensorDocUpdate.aqiBufferIndex =
        (sensorDocData.aqiBufferIndex + 1) % aqiBuffer.length;
      sensorDocUpdate.aqiBuffer = aqiBuffer;
    } else if (status === BufferStatus.DoesNotExist) {
      // Initialize populating the buffer with default values, don't update
      // any values until the buffer status is Exists
      sensorDocUpdate.aqiBufferStatus = BufferStatus.InProgress;
    }

    // Send the updated data to the database
    await firestore
      .collection(SENSORS_COLLECTION)
      .doc(sensorDoc.id)
      .update(sensorDocUpdate);

    // If the buffer didn't exist, use another write to initialize the buffer.
    // Since the buffer is large, this can be timely and this function ensures
    // that the buffer is not re-created while the buffer is being created.
    if (status === BufferStatus.DoesNotExist) {
      // This function updates the bufferStatus once the buffer has been
      // fully initialized, which uses an additional write to the database
      populateDefaultBuffer(true, sensorDoc.id);
    }
  }

  // Send AQI readings to current-reading to be displayed on the map
  await firestore.collection(CURRENT_READING_COLLECTION).doc(SENSORS_DOC).set({
    lastUpdated: FieldValue.serverTimestamp(),
    data: currentData,
  });
}

export {calculateAqi};
