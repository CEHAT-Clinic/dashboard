import firebase from '../../../firebase';
import {TFunction} from 'react-i18next';

/**
 *
 * @param timestamp - the time to convert
 * @returns human readable date time string, unknown if null
 */
function timestampToDateString(
  timestamp: firebase.firestore.Timestamp | null,
  t: TFunction<string[]>
): string {
  if (timestamp === null) {
    return t('sensors.unknown');
  } else {
    const date: Date = timestamp.toDate();
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }
}

/**
 *
 * @param number - a number that can be NaN
 * @returns human readable string for a number, 'unknown' if `NaN`
 */
function numberToString(number: number, t: TFunction<string[]>): string {
  if (isNaN(number)) {
    return t('sensors.unknown');
  } else {
    return String(number);
  }
}

export {timestampToDateString, numberToString};
