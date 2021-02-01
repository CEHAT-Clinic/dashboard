/**
 * Computes the AQI for PM 2.5 given the appropriate AQI breakpoints. in most use cases, this function will be called from a function which knows those breakpoints.
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
export function aqiFromPm25(pm25Concentration: number): number {
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
