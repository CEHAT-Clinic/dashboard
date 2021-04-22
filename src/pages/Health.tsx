import React, {useState, useEffect} from 'react';
import {ExternalLinkIcon} from '@chakra-ui/icons';
import {
  Box,
  Heading,
  Text,
  Link,
  UnorderedList,
  ListItem,
  Image,
  Flex,
  Grid,
  VStack,
} from '@chakra-ui/react';
import {useTranslation} from 'react-i18next';
import AqiTable from '../components/Static/AqiTable';
import pm25En from '../media/pm25-size-comparison-en.jpg';
import pm25Es from '../media/pm25-size-comparison-es.jpg';
import {LinkColor} from '../components/Util/Colors';
import {Section} from '../components/Static/Section';

const Health: React.FC = () => {
  const {t, i18n} = useTranslation(['health', 'common']);
  const [isMobile, setIsMobile] = useState(
    window.matchMedia('(max-width: 55em)')?.matches ?? false
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
    const screenSize = window.matchMedia('(max-width: 55em)');
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
              <Link gridRow={1} href="#pollution" color={LinkColor}>
                {t('pollution.heading')}
              </Link>
              <Link gridRow={2} href="#aqi" color={LinkColor}>
                {t('aqi.heading')}
              </Link>
              <Link gridRow={1} href="#protection" color={LinkColor}>
                {t('protection.heading')}
              </Link>
              <Link gridRow={2} href="#references" color={LinkColor}>
                {t('references.heading')}
              </Link>
            </Grid>
          </Box>
        )}
        <Section id="pollution" title={t('pollution.heading')}>
          <Text paddingY={1}>{t('pollution.paragraph1')}</Text>
          <Flex direction="column" align="center" margin={2}>
            <Box boxShadow="md" padding={3} borderRadius={2}>
              <VStack>
                <Image
                  src={i18n.language === 'en' ? pm25En : pm25Es}
                  alt={t('pollution.image.caption')}
                  minBlockSize="200px"
                  maxBlockSize="400px"
                />
                <Text textAlign="center">
                  {t('pollution.image.caption')}
                  <Link
                    color={LinkColor}
                    href={t('pollution.image.source.link')}
                    isExternal
                  >
                    {t('pollution.image.source.text')}
                    <ExternalLinkIcon />
                  </Link>
                </Text>
              </VStack>
            </Box>
          </Flex>
          <Text paddingY={1}>
            {t('pollution.paragraph2.part1')}{' '}
            <Link
              color={LinkColor}
              href={t('references.health.link')}
              isExternal
            >
              {t('pollution.paragraph2.link')} <ExternalLinkIcon />
            </Link>
            {t('pollution.paragraph2.part2')}
          </Text>
          <UnorderedList paddingLeft={4} paddingY={1}>
            <ListItem>{t('pollution.paragraph2.list.death')}</ListItem>
            <ListItem>{t('pollution.paragraph2.list.heartAttacks')}</ListItem>
            <ListItem>{t('pollution.paragraph2.list.arrhythmia')}</ListItem>
            <ListItem>{t('pollution.paragraph2.list.asthma')}</ListItem>
            <ListItem>{t('pollution.paragraph2.list.lungs')}</ListItem>
            <ListItem>{t('pollution.paragraph2.list.symptoms')}</ListItem>
          </UnorderedList>
          <Text paddingY={1}>{t('pollution.paragraph2.part3')}</Text>
        </Section>
        <Section title={t('aqi.heading')} id="aqi">
          <Text paddingY={1}>{t('aqi.paragraph1')}</Text>
          <Text paddingY={1}>
            {t('aqi.paragraph2.part1')}
            <strong>{t('aqi.paragraph2.part2')}</strong>
            {t('aqi.paragraph2.part3')}
          </Text>
          <AqiTable />
        </Section>
        <Section title={t('protection.heading')} id="protection">
          <Text paddingY={1}>{t('protection.paragraph1')}</Text>
          <Text paddingY={1}>{t('protection.paragraph2')}</Text>
        </Section>
        <Section title={t('references.heading')} id="references">
          <UnorderedList paddingLeft={4}>
            <ListItem>
              <Link
                color={LinkColor}
                href={t('references.pm25.link')}
                isExternal
              >
                {t('references.pm25.text')}
                <ExternalLinkIcon />
              </Link>
            </ListItem>
            <ListItem>
              <Link
                color={LinkColor}
                href={t('references.health.link')}
                isExternal
              >
                {t('references.health.text')}
                <ExternalLinkIcon />
              </Link>
            </ListItem>
            <ListItem>
              <Link
                color={LinkColor}
                href={t('references.aqi.link')}
                isExternal
              >
                {t('references.aqi.text')}
                <ExternalLinkIcon />
              </Link>
            </ListItem>
            <ListItem>
              <Link
                color={LinkColor}
                href={t('references.fire.link')}
                isExternal
              >
                {t('references.fire.text')}
                <ExternalLinkIcon />
              </Link>
            </ListItem>
          </UnorderedList>
        </Section>
      </Box>
    </Flex>
  );
};

export default Health;
