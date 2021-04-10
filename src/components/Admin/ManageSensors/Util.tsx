import React from 'react';
import firebase from '../../../firebase';
import {
  Box,
  Heading,
  Flex,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverHeader,
  PopoverBody,
  Text,
  IconButton,
  Select,
} from '@chakra-ui/react';
import {QuestionOutlineIcon} from '@chakra-ui/icons';
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
  setPurpleAirId: React.Dispatch<React.SetStateAction<string>>;
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
  const docIdToPurpleAirId = new Map<string, string>();
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
          setPurpleAirId(docIdToPurpleAirId.get(event.target.value) ?? '');
        }}
      >
        {options}
      </Select>
    </Box>
  );
};

/**
 * Interface for MoreInfoPopover used for type safety
 */
interface MoreInfoHeadingProps {
  message: string;
  heading: string;
}

/**
 * Table heading that includes a clickable question mark icon.
 * When the question mark icon is clicked, a popover appears that explains the
 * table field.
 * @param heading - heading for the column with the help icon
 * @param message - help message displayed in popover when help icon clicked
 */
const MoreInfoHeading: ({
  message,
  heading,
}: MoreInfoHeadingProps) => JSX.Element = ({
  message,
  heading,
}: MoreInfoHeadingProps) => {
  const {t} = useTranslation(['administration', 'common']);
  return (
    <Flex alignItems="center">
      <Text>{heading}</Text>
      <Popover>
        <PopoverTrigger>
          <IconButton
            size="xs"
            variant="unstyled"
            isRound
            aria-label={t('common:moreInformation')}
            icon={<QuestionOutlineIcon />}
          />
        </PopoverTrigger>
        <PopoverContent>
          <PopoverArrow />
          <PopoverCloseButton />
          <PopoverHeader>
            <Heading fontSize="medium">{t('common:moreInformation')}</Heading>
          </PopoverHeader>
          <PopoverBody>
            <Text fontWeight="normal" fontSize="md" textTransform="none">
              {message}
            </Text>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </Flex>
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

export type {Sensor, PurpleAirGroupMember};
export {LabelValue, SensorInput, MoreInfoHeading};
