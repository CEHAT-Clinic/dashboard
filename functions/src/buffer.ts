import {FieldValue, firestore} from './admin';

/**
 * Interface for a single element in the `pm25Buffer`.
 */
interface Pm25BufferElement {
  timestamp: FirebaseFirestore.Timestamp | null;
  pm25: number;
  meanPercentDifference: number;
  humidity: number;
}

/**
 * This is a default element for the pm25 buffer. When the buffer is initialized,
 * every element is a default element. When we get an invalid reading (i.e. a
 * reading that matches that of the last reading), we put this element in the
 * buffer.
 *
 * @readonly
 *
 * @remarks
 * TypeScript cannot reset a variable to this value successfully, so do not use
 * this element to add a default element when interacting with multiple pm25Buffers.
 * Instead, use `getDefaultPm25BufferElement`.
 */
const defaultPm25BufferElement: Pm25BufferElement = {
  timestamp: null,
  pm25: Number.NaN,
  meanPercentDifference: Number.NaN,
  humidity: Number.NaN,
};

/**
 * Gets the default element for the PM2.5 buffer
 * @returns Safe default PM2.5 Buffer element that can be used in calculations with multiple PM2.5 buffers
 */
function getDefaultPm25BufferElement(): Pm25BufferElement {
  return {...defaultPm25BufferElement};
}

/**
 * Interface for a single element in the AQI buffer
 * - `timestamp` - when this AQI was calculated and added to the buffer, or `null` if no valid AQI
 * - `aqi` - the current aqi value, or `NaN` if no valid AQI
 */
interface AqiBufferElement {
  timestamp: FirebaseFirestore.Timestamp | null;
  aqi: number;
}

/**
 * This is the default element for the AQI buffer. The buffer is initialized
 * with default elements at every index. When we don't have enough valid PM2.5
 * data to calculate AQI, we put a default element in the buffer.
 *
 * @readonly
 *
 * @remarks
 * TypeScript cannot reset a variable to this value successfully, so do not use
 * this element to add a default element when interacting with multiple aqiBuffers.
 * Instead, use `getDefaultAqiBufferElement`.
 */
const defaultAqiBufferElement: AqiBufferElement = {
  timestamp: null,
  aqi: Number.NaN,
};

/**
 * Gets the default element for the AQI buffer
 * @returns Safe default AQI Buffer element that can be used in calculations with multiple AQI buffers
 */
function getDefaultAqiBufferElement(): AqiBufferElement {
  return {...defaultAqiBufferElement};
}

/**
 * Enumeration for the status of a buffer. If a buffer is 'InProgress', it is
 * currently being initialized, so we don't start to initialize it again. This
 * is necessary because initializing the entire buffer can take non-negligible
 * time, so we may initialize a buffer in a cloud function and have the same
 * cloud function called again before the buffer is finished initializing. This
 * way we avoid having a buffer that begins re-initializing indefinitely.
 */
export enum bufferStatus {
  Exists,
  InProgress,
  DoesNotExist,
}

/**
 * This function populates the given sensor doc with a default circular buffer
 * for either AQI or PM2.5
 * @param aqiBuffer - true if AQI buffer, false if PM2.5 buffer
 * @param docId - document ID for the sensor to update
 */
function populateDefaultBuffer(aqiBuffer: boolean, docId: string): void {
  const docRef = firestore.collection('sensors').doc(docId);
  const bufferIndex = 0;
  if (aqiBuffer) {
    // 144 = (6 calls/hour * 24 hours) is the amount of entries we need to
    // create a graph with 24 hours of data
    const bufferSize = 144;
    const aqiBuffer: AqiBufferElement[] = new Array<AqiBufferElement>(
      bufferSize
    ).fill(defaultAqiBufferElement);
    // Update document
    docRef.get().then(doc => {
      if (doc.exists) {
        docRef.update({
          aqiBufferIndex: bufferIndex,
          aqiBuffer: aqiBuffer,
          aqiBufferStatus: bufferStatus.Exists,
          lastUpdated: FieldValue.serverTimestamp(),
        });
      }
    });
  } else {
    // 360 = (30 calls/ hour * 12 hours) is the amount of data needed for
    // the AQI NowCast calculation
    const bufferSize = 360;
    const pm25Buffer: Pm25BufferElement[] = new Array<Pm25BufferElement>(
      bufferSize
    ).fill(defaultPm25BufferElement);

    // Update document
    docRef.get().then(doc => {
      if (doc.exists) {
        docRef.update({
          pm25BufferIndex: bufferIndex,
          pm25Buffer: pm25Buffer,
          pm25BufferStatus: bufferStatus.Exists,
          lastUpdated: FieldValue.serverTimestamp(),
        });
      }
    });
  }
}

export type {Pm25BufferElement, AqiBufferElement};

export {
  populateDefaultBuffer,
  getDefaultAqiBufferElement,
  getDefaultPm25BufferElement,
};
