import React, {useState, useEffect} from 'react';
import Map from '../components/Map/Map';
import {Text, Heading, Box, Flex, Spacer, IconButton} from '@chakra-ui/react';
import AqiDial from '../components/AqiGauge/AqiDial';
import {useTranslation} from 'react-i18next';
import {ChevronDownIcon, ChevronUpIcon} from '@chakra-ui/icons';

/**
 * Home screen component
 */
const Home: () => JSX.Element = () => {
  // State for which sensor to display in the current sensor box
  const [currentSensor, setCurrentSensor] = useState('');
  const [isMobile, setIsMobile] = useState(
    window.matchMedia('(max-width: 800px)')?.matches ?? false
  );
  const [showGraphUI, setShowGraphUI] = useState(false);
  const [showGaugeUI, setShowGaugeUI] = useState(false);

  const {t} = useTranslation('home');

  // -------- Start Code copied from Nav --------- //
  /** Adjust UI for switching between mobile and desktop modes */
  function handleScreenChange(this: MediaQueryList): void {
    // Is the screen size mobile size
    if (this.matches) {
      setIsMobile(true);
    } else {
      setIsMobile(false);
    }
  }

  // Updates the state and the dom when the window size is changed
  useEffect(() => {
    const screenSize = window.matchMedia('(max-width: 700px)');
    if (screenSize) {
      screenSize.addEventListener('change', handleScreenChange);
    }

    return function (): void {
      if (screenSize) {
        screenSize.removeEventListener('change', handleScreenChange);
      }
    };
  }, []);
  // -------- End Code copied from Nav --------- //

  return (
    <Box>
      <Text>{t('constructionNotice')}</Text>
      <Flex direction={['column', 'column', 'row', 'row']} marginY={5}>
        <Box flex="2" marginX={4} height={['100%']}>
          <Map updateCurrentSensor={setCurrentSensor} />
        </Box>
        <Flex
          direction="column"
          textAlign="center"
          width={['100%', null, '40%', null]}
          height={[null, null, '80vh', null]}
        >
          <Box
            background="#E2E8F0"
            marginX={4}
            marginBottom={2}
            padding={2}
            marginTop={['4', null, '0', null]}
            height={['100%', null, '100%', null]}
            borderRadius={6}
          >
            {isMobile && (
              <Box>
                <IconButton
                  position="relative"
                  float="right"
                  size="md"
                  aria-label="Toggle Aqi Gauge"
                  variant="ghost"
                  icon={showGaugeUI ? <ChevronUpIcon /> : <ChevronDownIcon />}
                  onClick={() => setShowGaugeUI(!showGaugeUI)}
                />
                {!showGaugeUI && (
                  <Text>Expand to see more about the AQI at this sensor</Text>
                )}
              </Box>
            )}
            {(!isMobile || showGaugeUI) && (
              <Box>
                {currentSensor ? (
                  <AqiDial currentAqi={currentSensor} />
                ) : (
                  <Text marginTop={[null, null, '20%', null]}>
                    {t('noActiveSensor')}
                  </Text>
                )}{' '}
              </Box>
            )}
          </Box>
          <Spacer />
          <Box
            background="#E2E8F0"
            marginX={4}
            marginTop={2}
            padding={2}
            marginBottom={['4', null, '0', null]}
            height={['100%', null, '100%', null]}
            borderRadius={6}
          >
            {isMobile && (
              <Box>
                <IconButton
                  position="relative"
                  float="right"
                  size="md"
                  aria-label="Toggle Aqi Graph"
                  variant="ghost"
                  icon={showGraphUI ? <ChevronUpIcon /> : <ChevronDownIcon />}
                  onClick={() => setShowGraphUI(!showGraphUI)}
                />
                {!showGraphUI && (
                  <Text>Expand to see a graph of the AQI at this sensor</Text>
                )}
              </Box>
            )}
            {(!isMobile || showGraphUI) && <Heading>{t('dataVizBox')}</Heading>}
          </Box>
        </Flex>
      </Flex>
    </Box>
  );
};

export default Home;
