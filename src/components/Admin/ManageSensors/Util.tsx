import React from 'react';
import firebase from '../../../firebase';
import {
  Box,
  Text,
  Select,
} from '@chakra-ui/react';
import {useTranslation, TFunction} from 'react-i18next';

/**
 * Interface for a PurpleAir sensor
 */
interface Sensor {
  name: string;
  purpleAirId: number;
  latitude: number;
  longitude: number;
  isActive: boolean;
  isValid: boolean;
  lastValidAqiTime: firebase.firestore.Timestamp | null;
  lastSensorReadingTime: firebase.firestore.Timestamp | null;
  docId: string;
}

/**
 * Interface for LabelValue props, used for type safety
 */
interface LabelValueProps {
  label: string;
  value: string;
}

/**
 * Component that shows a label and a value in the same line.
 * The label is bold and a colon and space separate the label and value.
 */
const LabelValue: ({label, value}: LabelValueProps) => JSX.Element = ({
  label,
  value,
}: LabelValueProps) => {
  return (
    <Box>
      <Text as="span" fontWeight="bold">
        {label}
      </Text>
      <Text display="inline">{': ' + value}</Text>
    </Box>
  );
};

/**
 * Props for sensor input fields used in `SensorInput`
 */
interface SensorInputProps {
  sensors: Sensor[];
  docId: string;
  setDocId: React.Dispatch<React.SetStateAction<string>>;
  setPurpleAirId: React.Dispatch<React.SetStateAction<number>>;
}

/**
 * Drop-down menu for the sensors in our database. This is used in the `DownloadCSVModal`
 * when downloading data for a single sensor instead of multiple sensors. This is
 * also used in `DeleteSensorModal` to choose which sensor to delete.
 * @param sensors - the list of sensors to choose from
 * @param docId - the state variable for the doc ID that should be updated by this drop-down
 * @param setDocId - a function that sets the state of the doc ID value
 * @param setPurpleAirId - a state function that sets the state of the selected PurpleAir ID
 * @returns a drop down menu with all the sensors
 */
const SensorInput: ({
  sensors,
  docId,
  setDocId,
  setPurpleAirId,
}: SensorInputProps) => JSX.Element = ({
  sensors,
  docId,
  setDocId,
  setPurpleAirId,
}: SensorInputProps) => {
  const {t} = useTranslation('administration');
  const options = [];
  const docIdToPurpleAirId = new Map<string, number>();
  for (let i = 0; i < sensors.length; i++) {
    const sensor = sensors[i];
    let label;
    if (sensor.name) {
      label = sensor.name;
    } else {
      label = sensor.purpleAirId;
    }
    options.push(
      <option value={sensor.docId} key={i}>
        {label}
      </option>
    );
    docIdToPurpleAirId.set(sensor.docId, sensor.purpleAirId);
  }
  return (
    <Box>
      <Select
        type="number"
        placeholder={t('downloadData.chooseSensor')}
        value={docId}
        onChange={event => {
          setDocId(event.target.value);
          setPurpleAirId(docIdToPurpleAirId.get(event.target.value) ?? Number.NaN);
        }}
      >
        {options}
      </Select>
    </Box>
  );
};

/**
 * Structure of a PurpleAir group member returned from the PurpleAir API GET
 * request to get all members of a PurpleAir group.
 * - `id` - the member ID for the sensor in the queried group
 * - `sensor_index` - the PurpleAir ID for the sensor in the queried group
 * - `created` - the number of milliseconds since EPOCH when the sensor was
 *   added to the queried group
 */
interface PurpleAirGroupMember {
  id: number;
  sensor_index: number; // eslint-disable-line camelcase
  created: number;
}

/**
 *
 * @param timestamp - the time to convert
 * @returns human readable date time string, unknown if null
 */
  function timestampToDateString(
  timestamp: firebase.firestore.Timestamp | null,
  t: TFunction<string[]>
) {
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
  function numberToString(number: number, t: TFunction<string[]>) {
  if (isNaN(number)) {
    return t('sensors.unknown');
  } else {
    return String(number);
  }
}

export type {Sensor, PurpleAirGroupMember};
export {LabelValue, SensorInput, timestampToDateString, numberToString};
