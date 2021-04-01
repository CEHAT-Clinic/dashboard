/**
 *
 * @param value - the value being checked for validity, should be string or boolean
 * @param type - the valid type for the value being checked
 *
 * @returns true if the inputted value is not undefined and is of the type `type`
 */
function validData(value: string | boolean, type: string): boolean {
  return value !== undefined && typeof value === type;
}

/**
 * Upper bounds on AQI categories.
 *
 * Source: https://www.airnow.gov/aqi/aqi-basics/
 * Anything above 300 is considered "Hazardous"
 */
const aqiCutoffs = {
  good: 50, // Air quality is good (0-50)
  moderate: 100, // Air quality is acceptable (51-100)
  sensitive: 150, // Health risk for sensitive groups (101-150)
  unhealthy: 200, // Health risk for all individuals (151-200)
  veryUnhealthy: 300, // Very unhealthy for all individuals (201-300)
};

export {validData, aqiCutoffs};
