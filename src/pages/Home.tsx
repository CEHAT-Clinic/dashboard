import React from 'react';
import Map from '../components/Map/Map';

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
      <div>
        <h1> Home Page</h1>
        <h2>
          NOTE: This Website Is Under Construction. Check Back in Spring 2021
        </h2>
        <p>Current Sensor Reading: {this.state.currentSensor}</p>
        <Map updateSensor={this.updateState} />
      </div>
    );
  }
}

export default Home;
