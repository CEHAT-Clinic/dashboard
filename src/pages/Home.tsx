import React from 'react';
import Map from '../components/Map/Map';
import './Home.css';
import {
  Text,
  Heading,
  Box,
  Flex,
  Spacer,
  Divider,
  extendTheme,
} from '@chakra-ui/react';
import {createBreakpoints} from '@chakra-ui/theme-tools';

/**
 * Interface for the state of the home screen component
 */
interface HomeState {
  currentSensor?: string; // most recently clicked sensor to display
}

/**
 * Component for the home screen
 */
class Home extends React.Component<unknown, HomeState> {
  // Constructor to establish state
  constructor(props: any) {
    super(props);
    // Bind the this context to the updateState function
    this.updateState = this.updateState.bind(this);

    // Set initialstate
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
        <Heading fontSize={['20px', '90px', '180px', '200px']}>
          Home Page
        </Heading>
        <Text>
          NOTE: This Website Is Under Construction. Check Back in Spring 2021
        </Text>
        <Flex direction={['column', 'column', 'row', 'row']}>
          <Flex flex="2">
            <div className="Map_Wrapper">
              <Map updateSensor={this.updateState} />
            </div>
          </Flex>
          <Flex
            bg="lemon"
            direction="column"
            alignItems="center"
            textAlign="center"
          >
            <Text> Testing </Text>
            <Box bg="tomato" w={['100%', '50%', '25%']}>
              <Heading>The Dial Will Go Here</Heading>
              <Text>Current Sensor Reading: {this.state.currentSensor}</Text>
            </Box>
            <Spacer />
            <Box bg="lime">
              <Heading>The Multi Purpose</Heading>
              <Text>Hello World</Text>
            </Box>
          </Flex>
        </Flex>
      </>
    );
  }
}

export default Home;
