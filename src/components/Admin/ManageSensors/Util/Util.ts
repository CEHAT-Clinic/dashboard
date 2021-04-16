import firebase from '../../../../firebase';

/**
 * Converts a Firestore timestamp to a human readable date and time string
 * @param timestamp - the time to convert
 * @param unknownMessage - message displayed when the inputted `timestamp` is `null`
 * @returns human readable date time string, `unknownMessage` if `null`
 */
function timestampToDateString(
  timestamp: firebase.firestore.Timestamp | null,
  unknownMessage: string
): string {
  if (timestamp === null) {
    return unknownMessage;
  } else {
    const date: Date = timestamp.toDate();
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }
}

/**
 * Converts a (possibly `NaN`) number to a human-readable string
 * @param number - a number that can be NaN
 * @param unknownMessage - message displayed when the inputted `number` is `NaN`
 * @returns human readable string for a number, `unknownMessage` if `NaN`
 */
function numberToString(number: number, unknownMessage: string): string {
  if (Number.isNaN(number)) {
    return unknownMessage;
  } else {
    return String(number);
  }
}

export {timestampToDateString, numberToString};
