import firebase from './firebase';

/**
 * Interface for a single element in the `pm25Buffer`.
 * - `timestamp` - timestamp of the reading, or `null` if no complete reading
 *   exists for that entry
 * - `pm25` - PM2.5 reading for a sensor. This value is the average of the
 *   PM2.5 reading for channelA and channelB
 * - `meanPercentDifference` - mean percent difference between the pseudo averages
 *   of the readings for channelA and channelB, as calculated from the confidence
 *   value returned by the PurpleAir API. This value ranges from 0 to 2.
 * - `humidity` - humidity reading for a sensor
 */
interface Pm25BufferElement {
  timestamp: firebase.firestore.Timestamp | null;
  pm25: number;
  meanPercentDifference: number;
  humidity: number;
}

/**
 * Interface for a single element in the AQI buffer
 * - `timestamp` - when this AQI was calculated and added to the buffer, or `null` if no valid AQI
 * - `aqi` - the current aqi value, or `NaN` if no valid AQI
 */
interface AqiBufferElement {
  timestamp: firebase.firestore.Timestamp | null;
  aqi: number;
}

/**
 * Enumeration for the status of a buffer. If a buffer is 'InProgress', it is
 * currently being initialized, so we don't start to initialize it again. This
 * is necessary because initializing the entire buffer can take non-negligible
 * time, so we may initialize a buffer in a cloud function and have the same
 * cloud function called again before the buffer is finished initializing. This
 * way we avoid having a buffer that begins re-initializing indefinitely.
 */
enum BufferStatus {
  Exists,
  InProgress,
  DoesNotExist,
}

export {BufferStatus};

export type {Pm25BufferElement, AqiBufferElement};
