import React, {useState, useEffect} from 'react';
import Map from '../components/Map/Map';
import {Text, Heading, Box, Flex, Spacer} from '@chakra-ui/react';
import AQIDial from '../components/AQIDial';

/**
 * Home screen component
 */
const Home: () => JSX.Element = () => {
  // --------------- State maintenance variables ------------------------
  const [currentSensor, setCurrentSensor] = useState('');
  const [displayDial, setDisplayDial] = useState(false);
  // --------------- End state maintenance variables ------------------------

  // When currentReading is populated, show the dial. If not, don't.
  useEffect(() => {
    if (currentSensor) setDisplayDial(true);
    else setDisplayDial(false);
  }, [currentSensor]);

  return (
    <Box>
      <Text>
        NOTE: This Website Is Under Construction. Check Back in April 2021.
      </Text>
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
            marginTop={['4', null, '0', null]}
            height={['100%', null, '100%', null]}
            borderRadius={6}
          >
            {displayDial && <AQIDial currentReading={currentSensor} />}
            {!displayDial && (
              <Text marginTop={[null, null, '20%', null]}>
                Click a sensor on the map to see its AQI value here!
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
            <Heading>Data Visualizion Box</Heading>
          </Box>
        </Flex>
      </Flex>
    </Box>
  );
};

export default Home;
