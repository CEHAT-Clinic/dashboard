import React, {useState, FunctionComponent} from 'react';
import GaugeChart from 'react-gauge-chart';

/**
 * Interface for the props of the dial
 * - currentReading is the aqi value thatthe dial should display
 */
interface DialProps {
  currentReading: string;
}

/**
 * AQI Dial Display Component
 */
const AQIDial: ({currentReading}: DialProps) => JSX.Element = ({
  currentReading,
}: DialProps) => {
  const [displayDial, setDisplayDial] = useState(false);

  /**
   * The graphics package displays a percentage (in range 0 to 1). This function
   * converts our AQI readings to the appropriate number between 0 and 1 that
   * the dial should display
   * @param currentReading - the aqi value to be displayed
   */
  const convertToPercent = (currentReading: string): number => {
    const aqi: number = +currentReading; // Convert from string to number
    let dialReading = 0; // Initialize dial reading
    if (aqi <= 50) {
      dialReading = (aqi / 50) * 0.2;
    } else if (aqi <= 100) {
      dialReading = (aqi / 100) * 0.4;
    } else if (aqi <= 150) {
      dialReading = (aqi / 150) * 0.6;
    } else if (aqi <= 200) {
      dialReading = (aqi / 200) * 0.8;
    } else if (aqi <= 250) {
      dialReading = aqi / 250;
    } else {
      dialReading = 1;
    }
    return dialReading;
  };

  return (
    <>
      <GaugeChart
        id="currentSensorAQI"
        nrOfLevels={5}
        colors={['#1B8DFF', '#4765f5', '#9247a1', '#cc2475', '#FF3628']}
        arcPadding={0.02}
        percent={convertToPercent(currentReading)}
        textColor={'black'}
        hideText={true}
        animate={false}
      />
    </>
  );
};

export default AQIDial;
