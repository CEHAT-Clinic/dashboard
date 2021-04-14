import React, {useState} from 'react';
import {Box, Text, Link} from '@chakra-ui/react';
import firebase, {firestore} from '../../firebase';
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
  const {t} = useTranslation('dial');
  const [hasReported, setHasReported] = useState(true);
  const [lastValidDate, setLastValidDate] = useState('');
  const [lastValidTime, setLastValidTime] = useState('');
  // In Spanish, we use 'a las' for hours greater than 1 and 'a la' for 1 o'clock
  // this state variable stores which form of "at" we should use
  const [atString, setAtString] = useState(t('invalid.atPlural'));

  if (purpleAirId) {
    const docRef = firestore.collection('current-reading').doc('sensors');

    docRef.get().then(doc => {
      if (doc.exists) {
        const data = doc.data()?.data ?? {};
        const sensorData = data[purpleAirId];
        if (sensorData) {
          // Get time of last valid AQI reading
          const lastValidAqiTimestamp: firebase.firestore.Timestamp =
            sensorData['lastValidAqiTime'];
          if (lastValidAqiTimestamp) {
            setHasReported(true);
            const lastValidAqiDate: Date = lastValidAqiTimestamp.toDate();
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
        }
      }
    });
  }

  return (
    <Box>
      {hasReported ? (
        <Box>
          <Text fontSize="lg">
            {t('invalid.lastTime')}
            {lastValidDate} {atString} {lastValidTime}
            {t('invalid.learnMore')}
            <Link color="#32bfd1" href="/about">
              {t('invalid.aboutPage')}
            </Link>
          </Text>
        </Box>
      ) : (
        <Box>
          <Text fontSize="lg">
            {t('invalid.neverReported')}
            {t('invalid.learnMore')}
            <Link color="#32bfd1" href="/about">
              {t('invalid.aboutPage')}
            </Link>
          </Text>
        </Box>
      )}
    </Box>
  );
};

export {InvalidSensor};
