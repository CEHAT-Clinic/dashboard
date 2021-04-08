import React from 'react';
import firebase from '../../../firebase';
import {Box, Text} from '@chakra-ui/react';

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
};

export {LabelValue};

export type {Sensor};
