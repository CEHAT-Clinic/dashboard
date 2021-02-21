import React from 'react';
import {Text, Box, Tag, Link, Center} from '@chakra-ui/react';
import GaugeSVG from './GaugeSVG';
/**
 * Interface for the props of the dial
 * - currentReading is the AQI value that the dial should display
 */
interface DialProps {
  currentReading: string;
}

/**
 * AQI Dial Label Component
 * This component displays the label for the AQI displayed by the dial.
 * Ex if the AQI is less than 50, it will show the label "Good"
 */
const AQILabel: ({currentReading}: DialProps) => JSX.Element = ({
  currentReading,
}: DialProps) => {
  // Convert the AQI from a string to a number
  const aqi: number = +currentReading;
  // AQI boundary values
  const good = 50; // Air quality is good (0-50)
  const moderate = 100; // Air quality is acceptable (51-100)
  const sensitiveGroups = 150; // Health risk for sensitive groups (101-150)
  const unhealthy = 200; // Health risk for all individuals (151-200)
  const veryUnhealthy = 300; // Very unhealthy for all individuals (201-300)

  if (aqi <= good) {
    return (
      <Tag fontSize={16} px={5} py={1} bg="#08E400" textColor="white">
        Good (0-50)
      </Tag>
    );
  } else if (aqi <= moderate) {
    return (
      <Tag fontSize={16} px={2} py={1} bg="#FEFF00" textColor="black">
        Moderate (51-100)
      </Tag>
    );
  } else if (aqi <= sensitiveGroups) {
    return (
      <Tag fontSize={16} px={2} py={1} bg="#FF7E02" textColor="white">
        Unhealthy For Sensitive Groups (101-150)
      </Tag>
    );
  } else if (aqi <= unhealthy) {
    return (
      <Tag fontSize={16} px={2} py={1} bg="#FF0202" textColor="white">
        Unhealthy (151-200)
      </Tag>
    );
  } else if (aqi <= veryUnhealthy) {
    return (
      <Tag fontSize={16} px={2} py={1} bg="#8F3F97" textColor="white">
        Very Unhealthy (201-300)
      </Tag>
    );
  } else {
    // Anything greater than 300 is "Hazardous"
    return (
      <Tag fontSize={16} px={2} py={1} bg="#7E0224" textColor="white">
        Hazardous (301+)
      </Tag>
    );
  }
};

/**
 * AQI Dial Display Component
 * This component displays the dial representation of the AQI as well as the AQI
 * reading for the currently selected sensor. Additionally, there is a key below
 * the dial to label each color on the dial with how sever the health risk is.
 */
const AQIDial: ({currentReading}: DialProps) => JSX.Element = ({
  currentReading,
}: DialProps) => {
  return (
    <Box>
      <Center>
        <GaugeSVG currentReading={currentReading} />
      </Center>
      <Text fontSize={30}>Air Quality Index: {currentReading}</Text>
      <Text fontSize={14} mb={2}>
        For more information on air quality and the Air Quality Index (AQI),
        check out our
        <Link fontSize={14} color="#32bfd1" href="/health">
          {' '}
          health information.
        </Link>
      </Text>
      <AQILabel currentReading={currentReading} />
    </Box>
  );
};

export default AQIDial;

export type {DialProps};
