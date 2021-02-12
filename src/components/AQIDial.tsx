import React from 'react';
import GaugeChart from 'react-gauge-chart';
import {Text, Box, Tag, Grid, GridItem, Link} from '@chakra-ui/react';

/**
 * Interface for the props of the dial
 * - currentReading is the AQI value that the dial should display
 */
interface DialProps {
  currentReading: string;
}

/**
 * AQI Dial Display Component
 * This component displays the dial representation of the AQI as well as the AQI
 * reading for the currently selected sensor. Additionally, there is a key below
 * the dial to label each color on the dial with how sever the health risk is.
 */
const AQIDial: ({currentReading}: DialProps) => JSX.Element = ({
  currentReading,
}: DialProps) => {
  /**
   * The dial takes a percentage (in range 0 to 1). This function
   * converts our AQI readings to the appropriate number between 0 and 1 that
   * the dial should display
   * @param currentReading - the AQI value to be displayed
   */
  const convertToPercent = (currentReading: string): number => {
    // The maximum AQI value for the dial (corresponds to Health Alert for all)

    // Note: the true maximum AQI is 500 (not 300), but anything over 300 is
    // considered hazardous, so any readings over 300 will be displayed
    // as maxing out the dial in the "hazardous" category.
    const aqiMax = 300; // Max AQI to be displayed normally
    const dialMax1Scale = 1; // Maximum value of dial
    const dialMax300Scale = 312.5; // Number to convert from 0-1 scale to 0-300 scale
    const aqi: number = +currentReading; // Convert from string to number
    let dialReading = 0; // Initialize dial reading
    if (aqi <= aqiMax) {
      dialReading = aqi / dialMax300Scale; // Convert to something between 0 and 1
    } else {
      // AQI is above health alert
      dialReading = dialMax1Scale; // Set dial to 1 (max)
    }
    return dialReading;
  };

  // eslint-disable-next-line
  const arcLengths = [0.16, 0.16, 0.16, 0.16, 0.32, 0.04];

  return (
    <Box>
      <GaugeChart
        id="currentSensorAQI"
        nrOfLevels={6}
        colors={[
          '#08E400',
          '#FEFF00',
          '#FF7E02',
          '#FF0202',
          '#8F3F97',
          '#7E0224',
        ]}
        arcsLength={arcLengths}
        arcPadding={0.01}
        percent={convertToPercent(currentReading)}
        textColor={'black'}
        hideText={true}
        animate={false}
        arcWidth={0.45}
      />
      <Text fontSize={30}>Air Quality Index: {currentReading}</Text>
      <Text fontSize={14} mb={2}>
        For more information on air quality and the Air Quality Index (AQI),
        check out our
        <Link fontSize={14} color="#32bfd1" href="/health">
          {' '}
          health information.
        </Link>
      </Text>
      <Grid gap={1} px={2} alignItems="center" justifyItems="center">
        <GridItem>
          <Tag fontSize={16} px={5} py={1} bg="#08E400" textColor="black">
            Good (0-50)
          </Tag>
        </GridItem>
        <GridItem>
          <Tag fontSize={16} px={2} py={1} bg="#FEFF00" textColor="black">
            Moderate (51-100)
          </Tag>
        </GridItem>
        <GridItem>
          <Tag fontSize={16} px={2} py={1} bg="#FF7E02" textColor="white">
            Unhealthy For Sensitive Groups (101-150)
          </Tag>
        </GridItem>
        <GridItem>
          <Tag fontSize={16} px={2} py={1} bg="#FF0202" textColor="white">
            Unhealthy (151-200)
          </Tag>
        </GridItem>
        <GridItem>
          <Tag fontSize={16} px={2} py={1} bg="#8F3F97" textColor="white">
            Very Unhealthy (201-300)
          </Tag>
        </GridItem>
        <GridItem>
          <Tag fontSize={16} px={2} py={1} bg="#7E0224" textColor="white">
            {' '}
            Hazardous (301+)
          </Tag>
        </GridItem>
      </Grid>
    </Box>
  );
};

export default AQIDial;
