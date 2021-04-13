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

interface SelectedSensor {
  purpleAirId: number;
  sensorDocId: string;
  name: string;
  aqi: string;
  isAqiValid: boolean;
  lastValidAqi: firebase.firestore.Timestamp | null;
}

export {aqiCutoffs};
export type {SelectedSensor};
