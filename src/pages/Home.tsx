import React, {useState, useEffect} from 'react';
import Map from '../components/Map/Map';
import {Text, Heading, Box, Flex, Spacer, IconButton} from '@chakra-ui/react';
import {ChevronDownIcon, ChevronUpIcon} from '@chakra-ui/icons';
import AqiDial from '../components/AqiGauge/AqiDial';
import {useTranslation} from 'react-i18next';
import AqiGraph from '../components/AqiGraph/AqiGraph';
import {ColorContext} from '../contexts/ColorContext';
import {ColorToggle} from '../components/Util/Colors';

/**
 * Home screen component
 */
const Home: () => JSX.Element = () => {
  // State for which sensor to display in the current sensor box
  const [currentSensorReading, setCurrentSensorReading] = useState('');
  const [currentSensorDocId, setCurrentSensorDocId] = useState('');
  const [currentIsValid, setCurrentIsValid] = useState(true);
  const [currentPurpleAirId, setCurrentPurpleAirId] = useState('');
  const [isMobile, setIsMobile] = useState(
    window.matchMedia('(max-width: 47.9em)')?.matches ?? false
  );
  const [showGraphUi, setShowGraphUi] = useState(false);
  const [showGaugeUi, setShowGaugeUi] = useState(false);
  const [showMapUi, setShowMapUi] = useState(true);

  const {t} = useTranslation('home');

  // -------- Detect screen size for conditional formatting --------- //
  /**
   * Adjust UI depending on screenwidth. This function is called from event
   * listeners with a max-width match media query.
   * @param this - a media query that either matches or doesn't
   */
  function handleScreenChange(this: MediaQueryList): void {
    // Is the screen size mobile size
    if (this.matches) {
      // True when the screen-width is at most 47.9em
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
      <Heading as="h1" textAlign="center" marginBottom={1}>
        {t('heading')}
      </Heading>
      <Flex direction={['column', 'column', 'row', 'row']} textAlign="center">
        {/* Start map */}
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
                aria-label={t('toggleMap')}
                variant="ghost"
                icon={showMapUi ? <ChevronUpIcon /> : <ChevronDownIcon />}
                onClick={() => setShowMapUi(!showMapUi)}
              />
              {showMapUi ? (
                <Text paddingY={2}>{t('hideMap')}</Text>
              ) : (
                <Text paddingY={2}>{t('expandMap')}</Text>
              )}
            </Box>
            {showMapUi && (
              <Box>
                <ColorContext.Consumer>
                  {colorContext => (
                    <Map
                      updateCurrentReading={setCurrentSensorReading}
                      updateCurrentSensorDoc={setCurrentSensorDocId}
                      updateCurrentIsValid={setCurrentIsValid}
                      updateCurrentPurpleAirId={setCurrentPurpleAirId}
                      currentColorScheme={colorContext.currentColorScheme}
                      isMobile={isMobile}
                    />
                  )}
                </ColorContext.Consumer>
                <ColorToggle />
              </Box>
            )}
          </Box>
        ) : (
          <Box flex="2" marginX={4} height={['100%']}>
            <ColorContext.Consumer>
              {colorContext => (
                <Map
                  updateCurrentReading={setCurrentSensorReading}
                  updateCurrentSensorDoc={setCurrentSensorDocId}
                  updateCurrentIsValid={setCurrentIsValid}
                  updateCurrentPurpleAirId={setCurrentPurpleAirId}
                  currentColorScheme={colorContext.currentColorScheme}
                  isMobile={isMobile}
                />
              )}
            </ColorContext.Consumer>
            <ColorToggle />
          </Box>
        )}
        {/* End map */}
        {/* Start right side UI components */}
        <Flex
          direction="column"
          textAlign="center"
          width={['100%', null, '40%', null]}
          height={[null, null, '85vh', null]}
        >
          {/* Start AQI Gauge */}
          <Box
            background="#E2E8F0"
            marginX={4}
            marginBottom={2}
            paddingX={2}
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
                  aria-label={t('toggleGauge')}
                  variant="ghost"
                  icon={showGaugeUi ? <ChevronUpIcon /> : <ChevronDownIcon />}
                  onClick={() => setShowGaugeUi(!showGaugeUi)}
                />
                {showGaugeUi ? (
                  <Text paddingY={2}>{t('hideAqiGauge')}</Text>
                ) : (
                  <Text paddingY={2}>{t('expandAqiGauge')}</Text>
                )}
              </Box>
            )}
            {(!isMobile || showGaugeUi) && (
              <Flex
                height="100%"
                width="100%"
                justifyContent="center"
                alignContent="center"
              >
                {currentSensorDocId ? (
                  <AqiDial
                    currentAqi={currentSensorReading}
                    isValid={currentIsValid}
                    purpleAirId={currentPurpleAirId}
                  />
                ) : (
                  <Heading fontSize="lg" marginTop={[null, null, '20%', null]}>
                    {t('noSensorGauge')}
                  </Heading>
                )}
              </Flex>
            )}
          </Box>
          {/* End AQI gauge */}
          <Spacer />
          {/* Start last 24 hours graph */}
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
                  aria-label={t('toggleGraph')}
                  variant="ghost"
                  icon={showGraphUi ? <ChevronUpIcon /> : <ChevronDownIcon />}
                  onClick={() => setShowGraphUi(!showGraphUi)}
                />
                {showGraphUi ? (
                  <Text paddingY={2}>{t('hideAqiGraph')}</Text>
                ) : (
                  <Text paddingY={2}>{t('expandAqiGraph')}</Text>
                )}
              </Box>
            )}
            {(!isMobile || showGraphUi) && (
              <Flex height="100%" width="100%" alignContent="center">
                {currentSensorDocId ? (
                  <AqiGraph sensorDocId={currentSensorDocId} />
                ) : (
                  <Heading
                    width="100%"
                    fontSize="lg"
                    marginTop={[null, null, '20%', null]}
                  >
                    {t('noSensorGraph')}
                  </Heading>
                )}
              </Flex>
            )}
          </Box>
          {/* End last 24 hours graph */}
        </Flex>
        {/* End right side UI components */}
      </Flex>
    </Box>
  );
};

export default Home;
