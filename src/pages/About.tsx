import React, {useState, useEffect} from 'react';
import {Box, Flex, Heading, Text, Link, Image, Grid} from '@chakra-ui/react';
import {useTranslation} from 'react-i18next';
import {ExternalLinkIcon} from '@chakra-ui/icons';
import cehatLogo from '../media/CEHATLogo.png';

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
    <Flex width="full" align="center" direction="column" padding={8}>
      <Heading fontSize="4xl" as="h1" fontFamily="Merriweather Sans">
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
            <Link gridRow={1} href="#cehat" color="#32bfd1">
              {t('cehat.heading')}
            </Link>
            <Link gridRow={2} href="#involved" color="#32bfd1">
              {t('involved.heading')}
            </Link>
            <Link gridRow={3} href="#sensorsDown" color="#32bfd1">
              {t('sensorsDown.heading')}
            </Link>
            <Link gridRow={1} href="#acknowledge" color="#32bfd1">
              {t('acknowledge.heading')}
            </Link>
            <Link gridRow={2} href="#admin" color="#32bfd1">
              {t('admin.heading')}
            </Link>
          </Grid>
        </Box>
      )}
      <Box
        padding={2}
        margin={2}
        width="full"
        borderWidth={1}
        borderRadius={8}
        boxShadow="lg"
        id="cehat"
      >
        <Heading fontFamily="Merriweather Sans">{t('cehat.heading')}</Heading>
        <Text>
          {t('cehat.part1')}
          <Link color="#32bfd1" href={t('cehat.pace-eh.link')} isExternal>
            {t('cehat.pace-eh.text')}
            <ExternalLinkIcon />
          </Link>
          {t('cehat.part2')}
        </Text>
      </Box>
      <Box
        padding={2}
        margin={2}
        width="full"
        borderWidth={1}
        borderRadius={8}
        boxShadow="lg"
        id="involved"
      >
        <Heading fontFamily="Merriweather Sans">
          {t('involved.heading')}
        </Heading>
        <Text>
          {t('involved.part1')}
          <Link color="#32bfd1" href={t('involved.email.link')}>
            {t('involved.email.text')}
          </Link>
          {t('involved.part2')}
          <Link color="#32bfd1" href={t('involved.instagram.link')} isExternal>
            {t('involved.instagram.text')}
            <ExternalLinkIcon />
          </Link>
          {t('involved.part3')}
        </Text>
      </Box>
      <Box
        padding={2}
        margin={2}
        width="full"
        borderWidth={1}
        borderRadius={8}
        boxShadow="lg"
        id="sensorsDown"
      >
        <Heading fontFamily="Merriweather Sans">
          {t('sensorsDown.heading')}
        </Heading>
        <Text paddingY={1}> {t('sensorsDown.part1')} </Text>
        <Text paddingY={1}> {t('sensorsDown.part2')} </Text>
        <Text paddingY={1}>{t('sensorsDown.part3')} </Text>
      </Box>
      <Box
        padding={2}
        margin={2}
        width="full"
        borderWidth={1}
        borderRadius={8}
        boxShadow="lg"
        id="acknowledge"
      >
        <Heading fontFamily="Merriweather Sans">
          {t('acknowledge.heading')}
        </Heading>
        <Text paddingY={1}>
          {t('acknowledge.clinic')} {t('acknowledge.githubPart1')}
          <Link>Github</Link> {t('acknowledge.githubPart2')}
        </Text>
        <Text paddingY={1}>{t('acknowledge.grant')}</Text>
      </Box>
      <Box
        padding={2}
        margin={2}
        width="full"
        borderWidth={1}
        borderRadius={8}
        boxShadow="lg"
        id="admin"
      >
        <Heading fontFamily="Merriweather Sans">{t('admin.heading')}</Heading>
        <Text>
          <Link color="#32bfd1" href={t('admin.action.link')}>
            {t('admin.action.text')}
          </Link>
          {t('admin.purpose')}
        </Text>
      </Box>
      <Image src={cehatLogo} alt="Logo"></Image>
    </Flex>
  );
};

export default About;
