import React, {useState, useEffect} from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  Link,
  Image,
  Grid,
  VStack,
  OrderedList,
  ListItem,
  HStack,
} from '@chakra-ui/react';
import {useTranslation} from 'react-i18next';
import {ExternalLinkIcon} from '@chakra-ui/icons';
import cehatLogo from '../media/CEHATLogo.png';
import {LinkColor} from '../components/Util/Colors';
import {Section} from '../components/Static/Section';
import purpleAirSensor from '../media/PurpleAir-sensor-installation.jpg';
import {FiShare} from 'react-icons/fi';
import {BiDotsVerticalRounded} from 'react-icons/bi';

const About: React.FC = () => {
  const [isMobile, setIsMobile] = useState(
    window.matchMedia('(max-width: 47.9em)')?.matches ?? false
  );
  // -------- Detect screen size for conditional formatting --------- //
  /**
   * Adjust UI depending on screenwidth. This function is called from event
   * listeners with a max-width match media query.
   * @param this - a media query that either matches or doesn't
   * @remarks media query matches when the screen-width is at most 47.9em
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

  const {t} = useTranslation(['about', 'common']);
  return (
    <Flex justifyContent="center" alignContent="center" padding={2}>
      <Box direction="column" width="full" maxWidth="1000px">
        <Heading
          textAlign="center"
          fontSize="4xl"
          as="h1"
          fontFamily="Merriweather Sans"
        >
          {t('pageHeading')}
        </Heading>
        {isMobile && (
          <Box>
            <Text textAlign="center" fontStyle="italic">
              {t('common:jumpTo')}
            </Text>
            <Grid
              width="100%"
              templateColumns="repeat(2,1fr)"
              gap={1}
              textAlign="center"
            >
              <Link gridRow={1} href="#cehat" color={LinkColor}>
                {t('cehat.heading')}
              </Link>
              <Link gridRow={1} href="#involved" color={LinkColor}>
                {t('involved.heading')}
              </Link>
              <Link gridRow={2} href="#purpleAir" color={LinkColor}>
                {t('purpleAir.heading')}
              </Link>
              <Link gridRow={2} href="#sensorsDown" color={LinkColor}>
                {t('sensorsDown.heading')}
              </Link>
              <Link gridRow={3} href="#noSensor" color={LinkColor}>
                {t('noSensorInArea.heading')}
              </Link>
              <Link gridRow={3} href="#app" color={LinkColor}>
                {t('app.heading')}
              </Link>
              <Link gridRow={4} href="#acknowledge" color={LinkColor}>
                {t('acknowledge.heading')}
              </Link>
              <Link gridRow={4} href="#admin" color={LinkColor}>
                {t('admin.heading')}
              </Link>
            </Grid>
          </Box>
        )}
        <Section id="cehat" title={t('cehat.heading')}>
          <Text>
            {t('cehat.part1')}
            <Link color={LinkColor} href={t('cehat.pace-eh.link')} isExternal>
              {t('cehat.pace-eh.text')}
              <ExternalLinkIcon />
            </Link>
            {t('cehat.part2')}
            <Link
              color={LinkColor}
              href="http://www.aqmd.gov/nav/about/initiatives/environmental-justice/ab617-134"
              isExternal
            >
              {t('cehat.ab617')}
              <ExternalLinkIcon />
            </Link>
            {t('cehat.part3')}
          </Text>
        </Section>
        <Section id="involved" title={t('involved.heading')}>
          <Text>
            {t('involved.part1')}
            <Link color={LinkColor} href={t('involved.email.link')}>
              {t('involved.email.text')}
            </Link>
            {t('involved.part2')}
            <Link
              color={LinkColor}
              href={t('involved.instagram.link')}
              isExternal
            >
              {t('involved.instagram.text')}
              <ExternalLinkIcon />
            </Link>
            {t('involved.part3')}
          </Text>
        </Section>
        <Section id="purpleAir" title={t('purpleAir.heading')}>
          <Text paddingY={1}>
            {t('purpleAir.part1a')}
            <Link
              color={LinkColor}
              href="https://www.purpleair.com/"
              isExternal
            >
              {t('purpleAir.purpleAirLink')}
              <ExternalLinkIcon />
            </Link>
            {t('purpleAir.part1b')}
            <Link color={LinkColor} href="/health" isExternal>
              {t('purpleAir.healthInfoLink')}
            </Link>
          </Text>
          <Flex direction="column" align="center">
            <Box boxShadow="md" padding={3} borderRadius={2}>
              <VStack>
                <Image
                  src={purpleAirSensor}
                  alt={t('purpleAir.image.alt')}
                  minBlockSize="200px"
                />
                <Text textAlign="center">
                  {t('purpleAir.image.caption')}
                  <Link
                    color={LinkColor}
                    href="https://www2.purpleair.com/products/purpleair-pa-ii"
                    isExternal
                  >
                    {t('purpleAir.purpleAirLink')}
                    <ExternalLinkIcon />
                  </Link>
                </Text>
              </VStack>
            </Box>
          </Flex>
          <Text paddingY={1}>{t('purpleAir.part2')}</Text>
        </Section>
        <Section id="sensorsDown" title={t('sensorsDown.heading')}>
          <Text paddingY={1}>
            {t('sensorsDown.part1a')}
            <Link
              color={LinkColor}
              href="https://usepa.servicenowservices.com/airnow?id=kb_article_view&sysparm_article=KB0011856&sys_kb_id=fed0037b1b62545040a1a7dbe54bcbd4&spa=1"
              isExternal
            >
              {t('sensorsDown.part1Link')}
              <ExternalLinkIcon />
            </Link>
            {t('sensorsDown.part1b')}
          </Text>
          <Text paddingY={1}> {t('sensorsDown.part2')} </Text>
          <Text paddingY={1}>{t('sensorsDown.part3')} </Text>
        </Section>
        <Section id="noSensor" title={t('noSensorInArea.heading')}>
          <Text paddingY={1}>
            {t('noSensorInArea.part1')}
            <Link color={LinkColor} href={t('involved.email.link')}>
              {t('involved.email.text')}
            </Link>
            {t('noSensorInArea.or')}
            <Link
              color={LinkColor}
              href={t('involved.instagram.link')}
              isExternal
            >
              {t('involved.instagram.text')}
              <ExternalLinkIcon />
            </Link>
            {t('noSensorInArea.part2')}
          </Text>
        </Section>
        <Section id="app" title={t('app.heading')}>
          <Text paddingY={1}>{t('app.body')}</Text>
          <Text paddingY={1}>{t('app.iPhone.heading')}</Text>
          <OrderedList paddingLeft={4}>
            <ListItem>{t('app.iPhone.step1')}</ListItem>
            <ListItem>
              <Flex display="inline">
                <HStack spacinig={1}>
                  <Text>{t('app.iPhone.step2')}</Text>
                  <FiShare />
                </HStack>
              </Flex>
            </ListItem>
            <ListItem>{t('app.step3')}</ListItem>
            <ListItem>{t('app.step4')}</ListItem>
          </OrderedList>
          <Text paddingY={1}>{t('app.android.heading')}</Text>
          <OrderedList paddingLeft={4}>
            <ListItem>{t('app.android.step1')}</ListItem>
            <ListItem>
              <Flex flexDir="row" alignItems="center">
                <Text>{t('app.android.step2')}</Text>
                <BiDotsVerticalRounded />
                <Text>)</Text>
              </Flex>
            </ListItem>
            <ListItem>{t('app.step3')}</ListItem>
            <ListItem>{t('app.step4')}</ListItem>
          </OrderedList>
        </Section>
        <Section id="acknowledge" title={t('acknowledge.heading')}>
          <Text paddingY={1}>
            {t('acknowledge.clinic')} {t('acknowledge.githubPart1')}
            <Link
              color={LinkColor}
              href="https://github.com/CEHAT-Clinic/dashboard"
              isExternal
            >
              GitHub
              <ExternalLinkIcon />
            </Link>
            {t('acknowledge.githubPart2')}
          </Text>
          <Text paddingY={1}>{t('acknowledge.grant')}</Text>
        </Section>
        <Section id="admin" title={t('admin.heading')}>
          <Text>
            <Link color={LinkColor} href={t('admin.action.link')}>
              {t('admin.action.text')}
            </Link>
            {t('admin.purpose')}
          </Text>
        </Section>
        <Flex justifyContent="center">
          <Image src={cehatLogo} alt="Logo"></Image>
        </Flex>
      </Box>
    </Flex>
  );
};

export default About;
