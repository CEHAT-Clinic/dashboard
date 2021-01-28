import React from 'react';
import Map from '../components/Map/Map';
import {Text, Heading, Box, Flex, Spacer} from '@chakra-ui/react';

/**
 * Interface for the state of the home screen component
 */
interface HomeState {
  currentSensor?: string; // Most recently clicked sensor to display
}

/**
 * Component for the home screen
 */
class Home extends React.Component<unknown, HomeState> {
  // Constructor to establish state
  constructor(props: unknown) {
    super(props);
    // Bind the this context to the updateState function
    this.updateState = this.updateState.bind(this);

    // Set initial state
    this.state = {
      currentSensor: 'none', // TODO: allow for null in some way
    };
  }

  /**
   * This function updates the state (current sensor) of the home screen
   * It is sent to the Map component so that it can alter the home screen state
   */
  updateState(sensorID: string): void {
    this.setState({
      currentSensor: sensorID,
    });
  }

  render(): JSX.Element {
    return (
      <>
        <Heading>Home Page</Heading>
        <Text>
          NOTE: This Website Is Under Construction. Check Back in Spring 2021
        </Text>
        <Flex direction={['column', 'column', 'row', 'row']} marginTop={4}>
          <Box flex="2" marginX={4} height={['100%']}>
            <Map updateSensor={this.updateState} />
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
              height={['150px', null, '100%', null]}
              borderRadius={6}
            >
              <Heading>The Dial Will Go Here</Heading>
              <Text>Current Sensor Reading: {this.state.currentSensor}</Text>
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
              <Heading>The Multi Purpose Box Will Go Here</Heading>
              <Text>Hello World</Text>
            </Box>
          </Flex>
        </Flex>
      </>
    );
  }
}

export default Home;
