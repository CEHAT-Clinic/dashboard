import React from 'react';
import firebase from '../../../firebase';
import {Select, Box, Text} from '@chakra-ui/react';
import {useTranslation} from 'react-i18next';

/**
 * Interface for a PurpleAir sensor
 */
interface Sensor {
  name: string;
  purpleAirId: string;
  latitude: number;
  longitude: number;
  isActive: boolean;
  isValid: boolean;
  lastValidAqiTime: firebase.firestore.Timestamp | null;
  lastSensorReadingTime: firebase.firestore.Timestamp | null;
  readingDocId: string;
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
}

/**
 * Props for sensor input fields used in `SensorInput`
 */
interface SensorInputProps {
  sensors: Sensor[];
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
}

/**
 * Drop-down menu for the sensors in our database. This is used in the `DownloadCSVModal`
 * when downloading data for a single sensor instead of multiple sensors
 * @param sensors - the list of sensors to choose from
 * @param value - the value (state variable) that should be updated by this drop-down
 * @param setValue - a function that sets the state of the value
 * @returns a drop down menu with all the sensors
 */
const SensorInput: ({
  sensors,
  value,
  setValue,
}: SensorInputProps) => JSX.Element = ({
  sensors,
  value,
  setValue,
}: SensorInputProps) => {
  const {t} = useTranslation('administration');
  const options = [];
  for (let i = 0; i < sensors.length; i++) {
    const sensor = sensors[i];
    let label;
    if (sensor.name) {
      label = sensor.name;
    } else {
      label = sensor.purpleAirId;
    }
    options.push(
      <option value={sensor.purpleAirId} key={i}>
        {label}
      </option>
    );
  }
  return (
    <Box>
      <Select
        type="number"
        placeholder={t('downloadData.chooseSensor')}
        value={value}
        onChange={event => {
          setValue(event.target.value);
        }}
      >
        {options}
      </Select>
    </Box>
  );
};

export type {Sensor};
export {LabelValue, SensorInput};
