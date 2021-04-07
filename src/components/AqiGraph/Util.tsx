import firebase from '../../firebase';

/**
 * Interface for a single element in the AQI buffer
 * timestamp - when this AQI was calculated and added to the buffer
 * aqi - the current AQI value
 */
interface AqiBufferElement {
  timestamp: firebase.firestore.Timestamp | null;
  aqi: number;
}

/**
 * Interface for a single point in the graph
 * x - value for x-axis
 * y - value for y-axis
 */
interface GraphElement {
  x: number;
  y: number;
}

/**
 * Interface for the props of the graph
 * - `sensorDocId` is the document ID for the currents sensor in the
 *  sensors collection
 */
interface GraphProps {
  sensorDocId: string;
  isValid: boolean;
}

/**
 * Our data is split based on which AQI category it falls into. This is
 * the interface for the data container
 * good - array of points that fall in the "good" category
 * moderate - array of points that fall in the "moderate" category
 * sensitive - array of points that fall in the "unhealthy for sensitive groups" category
 * unhealthy - array of points that fall in the "unhealthy for all" category
 * veryUnhealthy - array of points that fall in the "very unhealthy" category
 * hazardous - array of points that fall in the "hazardous" category
 */
interface GraphData {
  good: Array<GraphElement>;
  moderate: Array<GraphElement>;
  sensitive: Array<GraphElement>;
  unhealthy: Array<GraphElement>;
  veryUnhealthy: Array<GraphElement>;
  hazardous: Array<GraphElement>;
}

export type {GraphData, GraphElement, GraphProps, AqiBufferElement};
