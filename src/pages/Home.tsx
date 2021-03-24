import React, {useState} from 'react';
import Map from '../components/Map/Map';
import {Text, Box, Flex, Spacer} from '@chakra-ui/react';
import AqiDial from '../components/AqiGauge/AqiDial';
import {useTranslation} from 'react-i18next';
import AqiGraph from '../components/AqiGraph/AqiGraph';

/**
 * Home screen component
 */
const Home: () => JSX.Element = () => {
  // State for which sensor to display in the current sensor box
  const [currentSensorReading, setCurrentSensorReading] = useState('');
  const [currentSensorDocId, setCurrentSensorDocId] = useState('');

  const {t} = useTranslation('home');

  return (
    <Box>
      <Text>{t('constructionNotice')}</Text>
      <Flex direction={['column', 'column', 'row', 'row']} marginY={5}>
        <Box flex="2" marginX={4} height={['100%']}>
          <Map
            updateCurrentReading={setCurrentSensorReading}
            updateCurrentSensorDoc={setCurrentSensorDocId}
          />
        </Box>
        <Flex
          direction="column"
          textAlign="center"
          width={['100%', null, '40%', null]}
          height={'85vh'}
        >
          <Box
            background="#E2E8F0"
            marginX={4}
            marginBottom={2}
            paddingX={2}
            marginTop={['4', null, '0', null]}
            height={['100%', null, '100%', null]}
            borderRadius={6}
          >
            {currentSensorReading ? (
              <AqiDial currentAqi={currentSensorReading} />
            ) : (
              <Flex
                height="100%"
                width="100%"
                justifyContent="center"
                align="center"
              >
                <Text fontSize={20}>{t('noActiveSensor')}</Text>
              </Flex>
            )}
          </Box>
          <Spacer />
          <Box
            background="#E2E8F0"
            marginX={4}
            marginTop={2}
            marginBottom={['4', null, '0', null]}
            height={['100%', null, '100%', null]}
            borderRadius={6}
          >
            <Flex height="100%" width="100%" alignContent="center">
              <AqiGraph sensorDocId={currentSensorDocId} />
            </Flex>
          </Box>
        </Flex>
      </Flex>
    </Box>
  );
};

export default Home;
