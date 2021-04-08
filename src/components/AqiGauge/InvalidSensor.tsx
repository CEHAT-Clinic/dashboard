import React, {useState} from 'react';
import {Box, Flex, Text, Link} from '@chakra-ui/react';
import {firestore} from '../../firebase';
import {formatDate, formatTime} from '../Util/Dates';
import {useTranslation} from 'react-i18next';

/**
 * TODO: label this
 */
interface InvalidSensorProps {
  sensorDocId: string;
}

/**
 * TODO: label this
 */
const InvalidSensor: ({sensorDocId}: InvalidSensorProps) => JSX.Element = ({
  sensorDocId,
}: InvalidSensorProps) => {
  const [lastValidDate, setLastValidDate] = useState('');
  const [lastValidTime, setLastValidTime] = useState('');

  const {t} = useTranslation('graph');

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
  if (sensorDocId) {
    return (
      <Flex
        height="100%"
        width="100%"
        justifyContent="center"
        align="center"
        flexDir="column"
        fontSize={20}
        paddingX={2}
      >
        <Text fontSize="lg">
          {t('inValid.lastTime')}
          {lastValidDate} {t('inValid.at')} {lastValidTime}{' '}
          {t('inValid.learnMore')}
          <Link color="#32bfd1" href="/about">
            {t('inValid.aboutPage')}
          </Link>
        </Text>
      </Flex>
    );
  } else {
    return <Box></Box>;
  }
};

export {InvalidSensor};
