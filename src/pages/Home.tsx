import React, {useState} from 'react';
import Map from '../components/Map/Map';
import {Text, Heading, Box, Flex, Spacer} from '@chakra-ui/react';
import AQIDial from '../components/AQIGauge/AQIDial';
import {useTranslation} from 'react-i18next';

/**
 * Home screen component
 */
const Home: () => JSX.Element = () => {
  // State for which sensor to display in the current sensor box
  const [currentSensor, setCurrentSensor] = useState('');

  const {t} = useTranslation('home');

  return (
    <Box>
      <Text>{t('constructionNotice')}</Text>
      <Flex direction={['column', 'column', 'row', 'row']} marginTop={4}>
        <Box flex="2" marginX={4} height={['100%']}>
          <Map updateCurrentSensor={setCurrentSensor} />
        </Box>
        <Flex
          direction="column"
          textAlign="center"
          width={['100%', null, '40%', null]}
        >
          <Box
            background="#E2E8F0"
            marginX={4}
            marginBottom={2}
            padding={2}
            marginTop={['4', null, '0', null]}
            height={['100%', null, '100%', null]}
            borderRadius={6}
          >
            {currentSensor ? (
              <AQIDial currentAQI={currentSensor} />
            ) : (
              <Text marginTop={[null, null, '20%', null]}>
                {t('noActiveSensor')}
              </Text>
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
            <Heading>{t('dataVizBox')}</Heading>
          </Box>
        </Flex>
      </Flex>
    </Box>
  );
};

export default Home;
