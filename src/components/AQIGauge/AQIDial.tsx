import React from 'react';
import {Text, Box, Tag, Link, Center} from '@chakra-ui/react';
import GaugeSvg from './GaugeSvg';
import {useTranslation} from 'react-i18next';

/**
 * Interface for the props of the dial
 * - `currentAqi` is the AQI value that the dial should display
 */
interface DialProps {
  currentAqi: string;
}

/**
 * AQI Dial Label Component
 * This component displays the label for the AQI displayed by the dial.
 * @example if the AQI is less than 50, it will show the label "Good"
 */
const AqiLabel: ({currentAqi}: DialProps) => JSX.Element = ({
  currentAqi,
}: DialProps) => {
  // Convert the AQI from a string to a number
  const aqi: number = +currentAqi;
  // AQI boundary values from https://www.airnow.gov/aqi/aqi-basics/
  const good = 50; // Air quality is good (0-50)
  const moderate = 100; // Air quality is acceptable (51-100)
  const sensitiveGroups = 150; // Health risk for sensitive groups (101-150)
  const unhealthy = 200; // Health risk for all individuals (151-200)
  const veryUnhealthy = 300; // Very unhealthy for all individuals (201-300)

  let textColor = 'white';
  let backgroundColor = '#08E400';
  let label = '';
  const smallPadding = 2;
  const largePadding = 5;
  let px = smallPadding;

  const {t} = useTranslation('dial');

  if (aqi <= good) {
    [textColor, backgroundColor] = ['black', '#08E400'];
    label = t('good');
    px = largePadding;
  } else if (aqi <= moderate) {
    [textColor, backgroundColor] = ['black', '#FEFF00'];
    label = t('moderate');
    px = smallPadding;
  } else if (aqi <= sensitiveGroups) {
    [textColor, backgroundColor] = ['black', '#FF7E02'];
    label = t('sensitive');
    px = smallPadding;
  } else if (aqi <= unhealthy) {
    [textColor, backgroundColor] = ['white', '#FF0202'];
    label = t('unhealthy');
    px = smallPadding;
  } else if (aqi <= veryUnhealthy) {
    [textColor, backgroundColor] = ['white', '#8F3F97'];
    label = t('very');
    px = smallPadding;
  } else {
    // Anything greater than 300 is "Hazardous"
    [textColor, backgroundColor] = ['white', '#7E0224'];
    label = t('hazardous');
    px = smallPadding;
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
const AqiDial: ({currentAqi}: DialProps) => JSX.Element = ({
  currentAqi,
}: DialProps) => {
  const {t} = useTranslation(['dial', 'menu']);

  return (
    <Box>
      <Center>
        <GaugeSvg currentAqi={currentAqi} />
      </Center>
      <Text fontSize={30}>{t('aqi') + currentAqi}</Text>
      <Text fontSize={14} mb={2}>
        {t('moreInfo')}
        <Link fontSize={14} color="#32bfd1" href="/health">
          {' '}
          {t('menu:healthInfo')}
        </Link>
      </Text>
      <AqiLabel currentAqi={currentAqi} />
    </Box>
  );
};

export default AqiDial;

export type {DialProps};
