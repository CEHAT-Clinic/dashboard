import {firestore} from './admin';
/**
 * Interface for a single element in the pm25Buffer. All fields come from the
 * Thingspeak API
 */
interface Pm25BufferElement {
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
const defaultPm25BufferElement: Pm25BufferElement = {
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

/**
 * This function populates the given sensor doc with a default circular buffer
 * for either AQI or PM 2.5
 * @param aqiBuffer - true if AQI buffer, false if PM 2.5 buffer
 * @param docId - document ID for the sensor to update
 */
function populateDefaultBuffer(
  aqiBuffer: boolean,
  docId: string
) {
  const docRef = firestore.collection('/sensors').doc(docId)
  const bufferIndex = 0;
  if (aqiBuffer) {
    // 144 = (6 calls/hour * 24 hours) is the amount of entries we need to
    // create a graph with 24 hours of data
    const bufferSize = 144; /* eslint-disable-line no-magic-numbers */
    const aqiBuffer: Array<AqiBufferElement> = Array(bufferSize).fill(
      defaultAqiBufferElement
    );
    // Update document
    docRef.get().then(doc => {
      if (doc.exists) {
        docRef.update({
          aqiBufferIndex: bufferIndex,
          aqiBuffer: aqiBuffer,
          aqiBufferStatus: bufferStatus.Exists,
        });
      }
    });
  } else {
    // 3600 = (30 calls/ hour * 12 hours) is the amount of data needed for
    // the AQI NowCast calculation
    const bufferSize = 3600; /* eslint-disable-line no-magic-numbers */
    const pm25Buffer: Array<Pm25BufferElement> = Array(bufferSize).fill(
      defaultPm25BufferElement
    );

    // Update document
    docRef.get().then(doc => {
      if (doc.exists) {
        docRef.update({
          pm25BufferIndex: bufferIndex,
          pm25Buffer: pm25Buffer,
          pm25BufferStatus: bufferStatus.Exists,
        });
      }
    });
  }
}

export type {Pm25BufferElement, AqiBufferElement};

export {defaultPm25BufferElement, defaultAqiBufferElement,populateDefaultBuffer};
