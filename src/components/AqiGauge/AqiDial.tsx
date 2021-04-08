import React from 'react';
import {Text, Box, Tag, Link, Center, Flex} from '@chakra-ui/react';
import GaugeSvg from './GaugeSvg';
import {useTranslation} from 'react-i18next';
import {useColor} from '../../contexts/ColorContext';
import {aqiCutoffs} from '../../util';
import {InvalidSensor} from './InvalidSensor';

/**
 * Interface for the props of the dial
 * - `currentAqi` is the AQI value that the dial should display
 * - TODO: add values here
 */
interface DialProps {
  currentAqi: string;
  isValid: boolean;
  sensorDocId: string;
}

/**
 * TODO: label this
 */
interface AqiLabelProps {
  currentAqi: string;
}

/**
 * AQI Dial Label Component
 * This component displays the label for the AQI displayed by the dial.
 * @example if the AQI is less than 50, it will show the label "Good"
 */
const AqiLabel: ({currentAqi}: AqiLabelProps) => JSX.Element = ({
  currentAqi,
}: AqiLabelProps) => {
  // Convert the AQI from a string to a number
  const aqi: number = +currentAqi;

  const {currentColorScheme} = useColor();

  let label = '';
  let correctColor = currentColorScheme.good;
  const px = 2;

  const {t} = useTranslation('dial');

  if (aqi <= aqiCutoffs.good) {
    correctColor = currentColorScheme.good;
    label = t('good');
  } else if (aqi <= aqiCutoffs.moderate) {
    correctColor = currentColorScheme.moderate;
    label = t('moderate');
  } else if (aqi <= aqiCutoffs.sensitive) {
    correctColor = currentColorScheme.sensitive;
    label = t('sensitive');
  } else if (aqi <= aqiCutoffs.unhealthy) {
    correctColor = currentColorScheme.unhealthy;
    label = t('unhealthy');
  } else if (aqi <= aqiCutoffs.veryUnhealthy) {
    correctColor = currentColorScheme.veryUnhealthy;
    label = t('very');
  } else {
    // Anything greater than 300 is "Hazardous"
    correctColor = currentColorScheme.hazardous;
    label = t('hazardous');
  }

  const {textColor, backgroundColor} = correctColor;

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
const AqiDial: ({
  currentAqi,
  isValid,
  sensorDocId,
}: DialProps) => JSX.Element = ({
  currentAqi,
  isValid,
  sensorDocId,
}: DialProps) => {
  const {t} = useTranslation(['dial', 'menu']);
  if (isValid) {
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
  } else {
    return (
      <Flex height="100%" width="100%" justifyContent="center" align="center">
        <InvalidSensor sensorDocId={sensorDocId} />
      </Flex>
    );
  }
};

export default AqiDial;

export type {DialProps};
