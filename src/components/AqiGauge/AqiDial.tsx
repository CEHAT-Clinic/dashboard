import React from 'react';
import {Text, Box, Tag, Link, Center, Flex} from '@chakra-ui/react';
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
  const px = 2;

  const {t} = useTranslation('dial');

  if (aqi <= good) {
    [textColor, backgroundColor] = ['black', '#08E400'];
    label = t('good');
  } else if (aqi <= moderate) {
    [textColor, backgroundColor] = ['black', '#FEFF00'];
    label = t('moderate');
  } else if (aqi <= sensitiveGroups) {
    [textColor, backgroundColor] = ['black', '#FF7E02'];
    label = t('sensitive');
  } else if (aqi <= unhealthy) {
    backgroundColor = '#FF0202';
    label = t('unhealthy');
  } else if (aqi <= veryUnhealthy) {
    backgroundColor = '#8F3F97';
    label = t('very');
  } else {
    // Anything greater than 300 is "Hazardous"
    backgroundColor = '#7E0224';
    label = t('hazardous');
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
    <Flex height="100%" width="100%" justifyContent="center" align="center">
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
    </Flex>
  );
};

export default AqiDial;

export type {DialProps};
