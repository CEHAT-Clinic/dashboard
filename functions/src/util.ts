/**
 * Get the readings subcollection path from a sensor's doc ID
 * @param docId - document ID of the sensor in the sensors collection
 * @returns the path to the readings subcollection for a sensor
 *
 */
const readingsSubcollection: (docId: string) => string = (docId: string) =>
  `/sensors/${docId}/readings`;

export {readingsSubcollection};
