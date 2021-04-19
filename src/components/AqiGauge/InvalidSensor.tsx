import React, {useState, useEffect} from 'react';
import {Box, Text, Link} from '@chakra-ui/react';
import {formatDate, formatTime} from '../Util/Dates';
import {useTranslation} from 'react-i18next';
import {SelectedSensor} from '../../util';
import {LinkColor} from '../Util/Colors';

/**
 * Props for the InvalidSensor component that displays in the AQI Gauge box
 * when a gray "invalid" sensor is selected
 * - `selectedSensor` contains the information for the sensor currently selected on the map
 */
interface InvalidSensorProps {
  selectedSensor: SelectedSensor;
}

/**
 * This component is used in the AQI Gauge UI component. When a gray "invalid"
 * sensor is clicked, instead of showing the AQI Gauge we display a message
 * that the sensor is down and give the last time of valid reading
 */
const InvalidSensor: ({selectedSensor}: InvalidSensorProps) => JSX.Element = ({
  selectedSensor,
}: InvalidSensorProps) => {
  const {t} = useTranslation('dial');
  const [hasReported, setHasReported] = useState(true);
  const [lastValidDate, setLastValidDate] = useState('');
  const [lastValidTime, setLastValidTime] = useState('');
  // In Spanish, we use 'a las' for hours greater than 1 and 'a la' for 1 o'clock
  // this state variable stores which form of "at" we should use
  const [atString, setAtString] = useState('' + t('invalid.atPlural'));

  useEffect(() => {
    if (selectedSensor.lastValidAqiTime) {
      setHasReported(true);
      const lastValidAqiDate: Date = selectedSensor.lastValidAqiTime.toDate();
      // Format date
      const year: number = lastValidAqiDate.getFullYear();
      const month: number = lastValidAqiDate.getMonth() + 1;
      const day: number = lastValidAqiDate.getDate();
      const hour: number = lastValidAqiDate.getHours();
      const minutes: number = lastValidAqiDate.getMinutes();
      setLastValidDate(formatDate(year, month, day));
      setLastValidTime(formatTime(hour, minutes));
      // Determine which form of "at" to use
      const oneAM = 1;
      const onePM = 13;
      if (hour === oneAM || hour === onePM) {
        setAtString(t('invalid.atSingular'));
      } else {
        setAtString(t('invalid.atPlural'));
      }
    } else {
      setHasReported(false);
    }
  }, [selectedSensor.lastValidAqiTime, t]);

  return (
    <Box>
      {hasReported ? (
        <Box>
          <Text fontSize="lg">
            {t('invalid.lastTime')}
            {lastValidDate} {atString} {lastValidTime}
            {t('invalid.learnMore')}
            <Link color={LinkColor} href="/about">
              {t('invalid.aboutPage')}
            </Link>
          </Text>
        </Box>
      ) : (
        <Box>
          <Text fontSize="lg">
            {t('invalid.neverReported')}
            {t('invalid.learnMore')}
            <Link color={LinkColor} href="/about">
              {t('invalid.aboutPage')}
            </Link>
          </Text>
        </Box>
      )}
    </Box>
  );
};

export {InvalidSensor};
