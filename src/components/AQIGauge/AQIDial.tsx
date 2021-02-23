import React from 'react';
import {Text, Box, Tag, Link, Center} from '@chakra-ui/react';
import GaugeSVG from './GaugeSVG';

/**
 * Interface for the props of the dial
 * - `currentAQI` is the AQI value that the dial should display
 */
interface DialProps {
  currentAQI: string;
}

/**
 * AQI Dial Label Component
 * This component displays the label for the AQI displayed by the dial.
 * @example if the AQI is less than 50, it will show the label "Good"
 */
const AQILabel: ({currentAQI}: DialProps) => JSX.Element = ({
  currentAQI,
}: DialProps) => {
  // Convert the AQI from a string to a number
  const aqi: number = +currentAQI;
  // AQI boundary values from https://www.airnow.gov/aqi/aqi-basics/
  const good = 50; // Air quality is good (0-50)
  const moderate = 100; // Air quality is acceptable (51-100)
  const sensitiveGroups = 150; // Health risk for sensitive groups (101-150)
  const unhealthy = 200; // Health risk for all individuals (151-200)
  const veryUnhealthy = 300; // Very unhealthy for all individuals (201-300)

  let textColor = 'white';
  let backgroundColor = '#08E400';
  let label = '';
  const px2 = 2;
  const px5 = 5;
  let px = px2;

  if (aqi <= good) {
    [textColor, backgroundColor] = ['black', '#08E400'];
    [label, px] = ['Good (0-50)', px5];
  } else if (aqi <= moderate) {
    [textColor, backgroundColor] = ['black', '#FEFF00'];
    [label, px] = ['Moderate (51-100)', px2];
  } else if (aqi <= sensitiveGroups) {
    [textColor, backgroundColor] = ['black', '#FF7E02'];
    [label, px] = ['Unhealthy For Sensitive Groups (101-150)', px2];
  } else if (aqi <= unhealthy) {
    [textColor, backgroundColor] = ['white', '#FF0202'];
    [label, px] = ['Unhealthy (151-200)', px2];
  } else if (aqi <= veryUnhealthy) {
    [textColor, backgroundColor] = ['white', '#8F3F97'];
    [label, px] = ['Very Unhealthy (201-300)', px2];
  } else {
    // Anything greater than 300 is "Hazardous"
    [textColor, backgroundColor] = ['white', '#7E0224'];
    [label, px] = ['Hazardous (301+)', px2];
  }
  return (
    <Tag
      fontSize={16}
      px={px}
      py={1}
      bg={backgroundColor}
      textColor={textColor}
    >
      {label}
    </Tag>
  );
};

/**
 * AQI Dial Display Component
 * This component displays the dial representation of the AQI as well as the AQI
 * reading for the currently selected sensor. Additionally, there is a key below
 * the dial to label each color on the dial with how severe the health risk is.
 */
const AQIDial: ({currentAQI}: DialProps) => JSX.Element = ({
  currentAQI,
}: DialProps) => {
  return (
    <Box>
      <Center>
        <GaugeSVG currentAQI={currentAQI} />
      </Center>
      <Text fontSize={30}>Air Quality Index: {currentAQI}</Text>
      <Text fontSize={14} mb={2}>
        For more information on air quality and the Air Quality Index (AQI),
        check out our
        <Link fontSize={14} color="#32bfd1" href="/health">
          {' '}
          health information.
        </Link>
      </Text>
      <AQILabel currentAQI={currentAQI} />
    </Box>
  );
};

export default AQIDial;

export type {DialProps};
