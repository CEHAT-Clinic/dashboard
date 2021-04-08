import React, {useState} from 'react';
import {Box, Text, Link} from '@chakra-ui/react';
import {firestore} from '../../firebase';
import {formatDate, formatTime} from '../Util/Dates';
import {useTranslation} from 'react-i18next';

/**
 * Props for the InvalidSensor component that displays in the AQI Gauge box
 * when a gray "invalid" sensor is selected
 */
interface InvalidSensorProps {
  sensorDocId: string;
}

/**
 * This component is used in the AQI Gauge UI component. When a gray "invalid"
 * sensor is clicked, instead of showing the AQI Gauge we display a message
 * that the sensor is down and give the last time of valid reading
 */
const InvalidSensor: ({sensorDocId}: InvalidSensorProps) => JSX.Element = ({
  sensorDocId,
}: InvalidSensorProps) => {
  const [lastValidDate, setLastValidDate] = useState('');
  const [lastValidTime, setLastValidTime] = useState('');

  const {t} = useTranslation('dial');

  if (sensorDocId) {
    const docRef = firestore.collection('sensors').doc(sensorDocId);

    docRef.get().then(doc => {
      if (doc.exists) {
        const data = doc.data();
        if (data) {
          // Get time of last valid AQI reading
          const lastValidAqiTime: Date = data['lastValidAqiTime'].toDate();
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
        {t('inValid.lastTime')}
        {lastValidDate} {t('inValid.at')} {lastValidTime}{' '}
        {t('inValid.learnMore')}
        <Link color="#32bfd1" href="/about">
          {t('inValid.aboutPage')}
        </Link>
      </Text>
    </Box>
  );
};

export {InvalidSensor};
