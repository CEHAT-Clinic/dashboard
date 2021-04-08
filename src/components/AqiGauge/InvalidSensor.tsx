import React, {useState} from 'react';
import {Box, Text, Link} from '@chakra-ui/react';
import {firestore} from '../../firebase';
import {formatDate, formatTime} from '../Util/Dates';
import {useTranslation} from 'react-i18next';

/**
 * Props for the InvalidSensor component that displays in the AQI Gauge box
 * when a gray "invalid" sensor is selected
 * - `purpleAirId` is the PurpleAir ID of the selected sensor
 */
interface InvalidSensorProps {
  purpleAirId: string;
}

/**
 * This component is used in the AQI Gauge UI component. When a gray "invalid"
 * sensor is clicked, instead of showing the AQI Gauge we display a message
 * that the sensor is down and give the last time of valid reading
 */
const InvalidSensor: ({purpleAirId}: InvalidSensorProps) => JSX.Element = ({
  purpleAirId,
}: InvalidSensorProps) => {
  const [lastValidDate, setLastValidDate] = useState('');
  const [lastValidTime, setLastValidTime] = useState('');

  const {t} = useTranslation('dial');

  if (purpleAirId) {
    const docRef = firestore.collection('current-reading').doc('sensors');

    docRef.get().then(doc => {
      if (doc.exists) {
        const data = doc.data()?.data ?? {};
        const sensorData = data[purpleAirId];
        if (sensorData) {
          // Get time of last valid AQI reading
          const lastValidAqiTime: Date = sensorData[
            'lastValidAqiTime'
          ].toDate();
          // Format date
          const year: number = lastValidAqiTime.getFullYear();
          const month: number = lastValidAqiTime.getMonth() + 1;
          const day: number = lastValidAqiTime.getDate();
          const hour: number = lastValidAqiTime.getHours();
          const minutes: number = lastValidAqiTime.getMinutes();
          setLastValidDate(formatDate(year, month, day));
          setLastValidTime(formatTime(hour, minutes));
        }
      }
    });
  }

  return (
    <Box>
      <Text fontSize="lg">
        {t('invalid.lastTime')}
        {lastValidDate} {t('invalid.at')} {lastValidTime}
        {t('invalid.learnMore')}
        <Link color="#32bfd1" href="/about">
          {t('invalid.aboutPage')}
        </Link>
      </Text>
    </Box>
  );
};

export {InvalidSensor};
