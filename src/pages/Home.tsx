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
            height={['300px', null, '100%', null]}
            borderRadius={6}
          >
            <Heading>Current Sensor Box</Heading>
            <Text>AQI: {currentSensor}</Text>
            <AQIDial currentReading={currentSensor} />
          </Box>
          <Spacer />
          <Box
            background="#E2E8F0"
            marginX={4}
            marginTop={2}
            marginBottom={['4', null, '0', null]}
            height={['150px', null, '100%', null]}
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
