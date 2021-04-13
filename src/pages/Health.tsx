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
} from '@chakra-ui/react';
import {useTranslation} from 'react-i18next';
import AqiTable from '../components/AqiTable';

const Health: React.FC = () => {
  const {t} = useTranslation(['health', 'common']);
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
            <Link gridRow={1} href="#pollution" color="#32bfd1">
              {t('pollution.heading')}
            </Link>
            <Link gridRow={2} href="#aqi" color="#32bfd1">
              {t('aqi.heading')}
            </Link>
            <Link gridRow={1} href="#protection" color="#32bfd1">
              {t('protection.heading')}
            </Link>
            <Link gridRow={2} href="#references" color="#32bfd1">
              {t('references.heading')}
            </Link>
          </Grid>
        </Box>
      )}

      <Flex
        padding={2}
        margin={2}
        width="full"
        borderWidth={1}
        borderRadius={8}
        boxShadow="lg"
        direction="column"
      >
        <Heading fontFamily="Merriweather Sans">
          {t('pollution.heading')}
        </Heading>
        <Text>{t('pollution.paragraph1')}</Text>
        <Flex
          padding={4}
          margin={['2', 'auto', '2', 'auto']}
          borderWidth={1}
          borderRadius={8}
          boxShadow="lg"
          width={['100%', null, '525px', null]}
          id="pollution"
        >
          <Flex direction="column" align="center">
            <Image
              src={t('pollution.image.fileName')}
              alt={t('pollution.image.caption')}
              maxWidth={['95%', null, '500px', null]}
            />
            <Text>
              {t('pollution.image.caption')}
              <Link
                color="#32bfd1"
                href={t('pollution.image.source.link')}
                isExternal
              >
                {t('pollution.image.source.text')}
                <ExternalLinkIcon />
              </Link>
            </Text>
          </Flex>
        </Flex>
        <Text>
          {t('pollution.paragraph2.part1')}{' '}
          <Link color="#32bfd1" href={t('references.health.link')} isExternal>
            {t('pollution.paragraph2.link')} <ExternalLinkIcon />
          </Link>
          {t('pollution.paragraph2.part2')}
        </Text>
        <Box>
          <UnorderedList paddingLeft={4}>
            <ListItem>{t('pollution.paragraph2.list.death')}</ListItem>
            <ListItem>{t('pollution.paragraph2.list.heartAttacks')}</ListItem>
            <ListItem>{t('pollution.paragraph2.list.arrhythmia')}</ListItem>
            <ListItem>{t('pollution.paragraph2.list.asthma')}</ListItem>
            <ListItem>{t('pollution.paragraph2.list.lungs')}</ListItem>
            <ListItem>{t('pollution.paragraph2.list.symptoms')}</ListItem>
          </UnorderedList>
          {t('pollution.paragraph2.part3')}
        </Box>
      </Flex>
      <Box
        padding={2}
        margin={2}
        width="full"
        borderWidth={1}
        borderRadius={8}
        boxShadow="lg"
        id="aqi"
      >
        <Heading fontFamily="Merriweather Sans">{t('aqi.heading')}</Heading>
        <Text>{t('aqi.paragraph1')}</Text>
        <Text>
          {t('aqi.paragraph2.part1')}
          <strong>{t('aqi.paragraph2.part2')}</strong>
          {t('aqi.paragraph2.part3')}
        </Text>
        <AqiTable />
      </Box>
      <Box
        padding={2}
        margin={2}
        width="full"
        borderWidth={1}
        borderRadius={8}
        boxShadow="lg"
        id="protection"
      >
        <Heading fontFamily="Merriweather Sans">
          {t('protection.heading')}
        </Heading>
        <Text>{t('protection.paragraph1')}</Text>
        <Text>{t('protection.paragraph2')}</Text>
      </Box>
      <Box
        padding={2}
        margin={2}
        width="full"
        borderWidth={1}
        borderRadius={8}
        boxShadow="lg"
        id="references"
      >
        <Heading fontFamily="Merriweather Sans">
          {t('references.heading')}
        </Heading>
        <UnorderedList paddingLeft={4}>
          <ListItem>
            <Link color="#32bfd1" href={t('references.pm25.link')} isExternal>
              {t('references.pm25.text')}
              <ExternalLinkIcon />
            </Link>
          </ListItem>
          <ListItem>
            <Link color="#32bfd1" href={t('references.health.link')} isExternal>
              {t('references.health.text')}
              <ExternalLinkIcon />
            </Link>
          </ListItem>
          <ListItem>
            <Link color="#32bfd1" href={t('references.aqi.link')} isExternal>
              {t('references.aqi.text')}
              <ExternalLinkIcon />
            </Link>
          </ListItem>
          <ListItem>
            <Link color="#32bfd1" href={t('references.fire.link')} isExternal>
              {t('references.fire.text')}
              <ExternalLinkIcon />
            </Link>
          </ListItem>
        </UnorderedList>
      </Box>
    </Flex>
  );
};

export default Health;
