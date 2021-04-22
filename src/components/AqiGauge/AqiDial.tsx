import React from 'react';
import {Text, Box, Tag, Link, Center, Flex} from '@chakra-ui/react';
import GaugeSvg from './GaugeSvg';
import {useTranslation} from 'react-i18next';
import {useColor} from '../../contexts/ColorContext';
import {aqiCutoffs} from '../../util';
import {InvalidSensor} from './InvalidSensor';
import {SelectedSensor} from '../../util';
import {LinkColor} from '../Util/Colors';
import {MoreInfoLabel} from '../Util/MoreInfoLabel';

/**
 * AqiLabelProps
 * - `currentAqi` is the AQI value that the dial should display
 */
interface AqiLabelProps {
  currentAqi: string;
}

/**
 * AQI Dial Label Component
 * This component displays the label for the AQI displayed by the dial.
 * For example, if the AQI is less than 50, it will show the label "Good"
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
      fontFamily="Oxygen"
      fontWeight="bold"
    >
      {label}
    </Tag>
  );
};

/**
 * Interface for the props of the dial
 * - `selectedSensor` contains the information of the sensor currently selected on the map
 */
interface DialProps {
  selectedSensor: SelectedSensor;
}

/**
 * AQI Dial Display Component
 * This component displays the dial representation of the AQI as well as the AQI
 * reading for the currently selected sensor. Additionally, there is a key below
 * the dial to label each color on the dial with how severe the health risk is.
 */
const AqiDial: ({selectedSensor}: DialProps) => JSX.Element = ({
  selectedSensor,
}: DialProps) => {
  const {t} = useTranslation(['dial', 'menu', 'common']);
  if (selectedSensor.isValid) {
    return (
      <Flex
        height="100%"
        width="100%"
        justifyContent="center"
        align="center"
        fontFamily="Oxygen"
      >
        <Box>
          <Center flexDir="column">
            <MoreInfoLabel
              fontFamily="Oxygen"
              fontSize="lg"
              text={t('common:instructions')}
              popoverLabel={t('common:aqiHelpHeading')}
              message={t('common:aqiHelpMessage')}
            />
            <Text marginTop={1} fontWeight="semibold">
              Sensor: {selectedSensor.name}
            </Text>
            <GaugeSvg currentAqi={selectedSensor.aqi} />
            <MoreInfoLabel
              fontWeight="bold"
              fontSize="3xl"
              text={t('aqi') + selectedSensor.aqi}
              popoverLabel={t('common:aqiHelpHeading')}
              message={t('common:aqiHelpMessage')}
            />
          </Center>
          <Text fontStyle="italic" fontSize={14} mb={2}>
            {t('moreInfo')}
            <Link fontSize={14} color={LinkColor} href="/health">
              {' '}
              {t('menu:healthInfo')}
            </Link>
          </Text>
          <AqiLabel currentAqi={selectedSensor.aqi} />
        </Box>
      </Flex>
    );
  } else {
    return (
      <Flex
        height="100%"
        width="100%"
        justifyContent="center"
        align="center"
        fontFamily="Oxygen"
        flexDir="column"
      >
        <MoreInfoLabel
          fontFamily="Oxygen"
          fontSize="lg"
          text={t('common:instructions')}
          popoverLabel={t('common:aqiHelpHeading')}
          message={t('common:aqiHelpMessage')}
        />
        <Text marginTop={1} fontWeight="semibold">
          Sensor: {selectedSensor.name}
        </Text>
        <InvalidSensor selectedSensor={selectedSensor} />
      </Flex>
    );
  }
};

export default AqiDial;

export type {DialProps};
