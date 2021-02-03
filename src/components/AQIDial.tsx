import React from 'react';
import GaugeChart from 'react-gauge-chart';

interface DialProps {
  currentReading: string;
}

class AQIDial extends React.Component<DialProps> {
  convertToPercent = (currentReading: string): number => {
    const aqi: number = +currentReading;
    let dialReading = aqi / 500;
    if (aqi <= 50) {
      dialReading = 0.2;
    } else if (aqi <= 100) {
      dialReading = 0.4;
    }
    return dialReading;
  };

  render(): JSX.Element {
    return (
      <>
        <GaugeChart
          id="currentSensorAQI"
          nrOfLevels={5}
          colors={['#1B8DFF', '#4765f5', '#9247a1', '#cc2475', '#FF3628']}
          arcPadding={0.02}
          percent={this.convertToPercent(this.props.currentReading)}
          textColor={'black'}
          hideText={true}
        />
      </>
    );
  }
}

export default AQIDial;
