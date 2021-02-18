import React from 'react';
import GaugeChart from 'react-gauge-chart';
import {Text, Box, Tag, Grid, GridItem, Link} from '@chakra-ui/react';
import {useTranslation} from 'react-i18next';

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

    // Note: the true maximum AQI is 500 (not 250), but anything over 250 is
    // considered extremely hazardous, so any readings over 250 will be displayed
    // as "maxing out" the dial.
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

  const {t} = useTranslation(['dial', 'menu']);

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
        arcWidth={0.4}
      />
      <Text fontSize={30}>{t('aqi') + currentReading}</Text>
      <Text fontSize={14} mb={2}>
        {t('moreInfo')}
        <Link fontSize={14} color="#32bfd1" href="/health">
          {t('menu:healthInfo').toLowerCase()}
        </Link>
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
          <Tag fontSize={16} px={5} py={1} bg="#1B8DFF" textColor="white">
            {t('good')}
          </Tag>
        </GridItem>
        <GridItem rowSpan={1} colSpan={1}>
          <Tag fontSize={16} px={2} py={1} bg="#4765f5" textColor="white">
            {t('moderate')}
          </Tag>
        </GridItem>
        <GridItem rowSpan={1} colSpan={2}>
          <Tag fontSize={16} px={2} py={1} bg="#9247a1" textColor="white">
            {t('sensitive')}
          </Tag>
        </GridItem>
        <GridItem rowSpan={1} colSpan={2}>
          <Tag fontSize={16} px={2} py={1} bg="#cc2475" textColor="white">
            {t('all')}
          </Tag>
        </GridItem>
        <GridItem rowSpan={1} colSpan={2}>
          <Tag fontSize={16} px={2} py={1} bg="#FF3628" textColor="white">
            {t('very')}
          </Tag>
        </GridItem>
      </Grid>
    </Box>
  );
};

export default AQIDial;
