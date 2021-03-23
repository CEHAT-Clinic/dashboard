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
    window.matchMedia('(max-width: 47.9em)')?.matches ?? false
  );
  const [showGraphUI, setShowGraphUI] = useState(false);
  const [showGaugeUI, setShowGaugeUI] = useState(false);
  const [showMapUI, setShowMapUI] = useState(true);

  const {t} = useTranslation('home');

  // -------- Detect screen size for conditional formatting --------- //
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
    const screenSize = window.matchMedia('(max-width: 47.9em)');
    if (screenSize) {
      screenSize.addEventListener('change', handleScreenChange);
    }

    return function (): void {
      if (screenSize) {
        screenSize.removeEventListener('change', handleScreenChange);
      }
    };
  }, []);
  // -----------------  End detect screen size ----------------- //

  return (
    <Box>
      <Text>{t('constructionNotice')}</Text>
      <Flex direction={['column', 'column', 'row', 'row']} textAlign="center">
        {isMobile ? (
          <Box
            background="#E2E8F0"
            flex="2"
            marginX={4}
            borderRadius={6}
            marginTop={5}
            padding={2}
          >
            <Box paddingBottom={1}>
              <IconButton
                position="relative"
                float="right"
                size="md"
                aria-label="Toggle Aqi Gauge"
                variant="ghost"
                icon={showMapUI ? <ChevronUpIcon /> : <ChevronDownIcon />}
                onClick={() => setShowMapUI(!showMapUI)}
              />
              {showMapUI ? (
                <Text paddingY={2}>{t('hideMap')}</Text>
              ) : (
                <Text paddingY={2}>{t('expandMap')}</Text>
              )}
            </Box>
            {showMapUI && (
              <Box>
                <Map
                  updateCurrentSensor={setCurrentSensor}
                  isMobile={isMobile}
                />
              </Box>
            )}
          </Box>
        ) : (
          <Box flex="2" marginX={4} height={['100%']}>
            <Map updateCurrentSensor={setCurrentSensor} isMobile={isMobile} />
          </Box>
        )}
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
                {showGaugeUI ? (
                  <Text paddingY={2}>{t('hideAqiGauge')}</Text>
                ) : (
                  <Text paddingY={2}>{t('expandAqiGauge')}</Text>
                )}
              </Box>
            )}
            {(!isMobile || showGaugeUI) && (
              <Box>
                {currentSensor ? (
                  <AqiDial currentAqi={currentSensor} />
                ) : (
                  <Heading fontSize="lg" marginTop={[null, null, '20%', null]}>
                    {t('noActiveSensor')}
                  </Heading>
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
                {showGraphUI ? (
                  <Text paddingY={2}>{t('hideAqiGraph')}</Text>
                ) : (
                  <Text paddingY={2}>{t('expandAqiGraph')}</Text>
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
