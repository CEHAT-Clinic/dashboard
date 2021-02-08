import React from 'react';
import GaugeChart from 'react-gauge-chart';
import {Text, Box, Tag, Grid, GridItem, Link} from '@chakra-ui/react';

/**
 * Interface for the props of the dial
 * - currentReading is the aqi value that the dial should display
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
  /**
   * The dial takes a percentage (in range 0 to 1). This function
   * converts our AQI readings to the appropriate number between 0 and 1 that
   * the dial should display
   * @param currentReading - the aqi value to be displayed
   */
  const convertToPercent = (currentReading: string): number => {
    // The maximum aqi value for the dial (corresponds to Health Alert for all)
    const aqiMax = 250;
    const dialMax = 1;
    const aqi: number = +currentReading; // Convert from string to number
    let dialReading = 0; // Initialize dial reading
    if (aqi <= aqiMax) {
      dialReading = aqi / aqiMax; // Convert to something between 0 and 1
    } else {
      // AQI is above health alert
      dialReading = dialMax; // Set dial to 1 (max)
    }
    return dialReading;
  };

  return (
    <Box>
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
      <Text fontSize={30}>Air Quality Index: {currentReading}</Text>
      <Text fontSize={14} mb={2}>
        For more information on air quality and the Air Quality Index (AQI), check out our
        <Link fontSize={14} color="#32bfd1" href="/health"> health information.</Link>
      </Text>
      <Grid
        templateColumns="repeat(4, 1fr)"
        templateRows="repeat(2, 1fr)"
        gap={1}
        px={2}
        alignItems="center"
        justifyItems="center"
      >
        <GridItem rowSpan={1} colSpan={1}>
          <Tag fontSize={16} px={5} py={1} bg="#1B8DFF">
            Good
          </Tag>
        </GridItem>
        <GridItem rowSpan={1} colSpan={1}>
          <Tag fontSize={16} px={2} py={1} bg="#4765f5">
            Moderate
          </Tag>
        </GridItem>
        <GridItem rowSpan={1} colSpan={2}>
          <Tag fontSize={16} px={2} py={1} bg="#9247a1">
            Unhealthy For Sensitive Groups
          </Tag>
        </GridItem>
        <GridItem rowSpan={1} colSpan={2}>
          <Tag fontSize={16} px={2} py={1} bg="#cc2475">
            Unhealthy For All
          </Tag>
        </GridItem>
        <GridItem rowSpan={1} colSpan={2}>
          <Tag fontSize={16} px={2} py={1} bg="#FF3628">
            Very Unhealthy
          </Tag>
        </GridItem>
      </Grid>
    </Box>
  );
};

export default AQIDial;
