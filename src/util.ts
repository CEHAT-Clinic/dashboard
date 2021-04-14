import firebase from './firebase';

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

/**
 * Interface for a Selected Sensor. This is used in the Home page to keep track
 * of the values for the sensor that is currently selected on the map.
 * - purpleAirId: The PurpleAir ID of the sensor
 * - sensorDocId: the ID of the document for this sensor in the "sensors" collection
 * - name: The name of this sensor on PurpleAir
 * - aqi: The current AQI value of this sensor
 * - isValid: boolean, is the sensor currently displaying an AQI
 * - lastValidAqiTime: the last time this sensor reported a valid AQI
 */
interface SelectedSensor {
  purpleAirId: number;
  sensorDocId: string;
  name: string;
  aqi: string;
  isValid: boolean;
  lastValidAqiTime: firebase.firestore.Timestamp | null;
}

export {aqiCutoffs};
export type {SelectedSensor};
