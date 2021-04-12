import React from 'react';
import {Sensor} from './Types';
import {Box, Select} from '@chakra-ui/react';
import {useTranslation} from 'react-i18next';

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
          setPurpleAirId(
            docIdToPurpleAirId.get(event.target.value) ?? Number.NaN
          );
        }}
      >
        {options}
      </Select>
    </Box>
  );
};

export {SensorInput};
