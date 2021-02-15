import React, {useState} from 'react';
import Map from '../components/Map/Map';
import {Text, Heading, Box, Flex, Spacer} from '@chakra-ui/react';
import AQIDial from '../components/AQIDial';

/**
 * Home screen component
 */
const Home: () => JSX.Element = () => {
  // State for which sensor to display in the current sensor box
  const [currentSensor, setCurrentSensor] = useState('');

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
            {currentSensor ? (
              <AQIDial currentReading={currentSensor} />
            ) : (
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
