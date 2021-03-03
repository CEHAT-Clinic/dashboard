/**
 * Interface for a single element in the pm25Buffer. All fields come from the
 * Thingspeak API
 */
interface pm25BufferElement {
  timestamp: FirebaseFirestore.Timestamp | null;
  channelAPm25: number;
  channelBPm25: number;
  humidity: number;
  latitude: number;
  longitude: number;
}

/**
 * This is a default element for the pm25 buffer. When the buffer is initialized,
 * every element is a default element. When we get an invalid reading (i.e. a
 * reading that matches that of the last reading), we put this element in the
 * buffer
 */
const defaultPm25BufferElement: pm25BufferElement = {
  timestamp: null,
  channelAPm25: NaN,
  channelBPm25: NaN,
  humidity: NaN,
  latitude: NaN,
  longitude: NaN,
};

/**
 * Interface for a single element in the AQI buffer
 * timestamp - when this AQI was calculated and added to the buffer
 * aqi - the current aqi value
 */
interface AqiBufferElement {
  timestamp: FirebaseFirestore.FieldValue | null;
  aqi: number;
}

/**
 * This is the default element for the AQI buffer. The buffer is initialized
 * with default elements at every index. When we don't have enough valid PM 2.5
 * data to calculate AQI, we put a default element in the buffer.
 */
const defaultAqiBufferElement: AqiBufferElement = {
  timestamp: null,
  aqi: NaN,
};

/**
 * Enumeration for the status of a buffer. This is necessary because if a buffer
 * is 'InProgress', it is currently being initialized, so we don't start to
 * initialize it again.
 */
export enum bufferStatus {
  Exists,
  InProgress,
  DoesNotExist,
}

export type {pm25BufferElement, AqiBufferElement};

export {defaultPm25BufferElement, defaultAqiBufferElement};
