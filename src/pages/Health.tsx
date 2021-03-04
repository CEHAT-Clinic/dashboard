import {ExternalLinkIcon} from '@chakra-ui/icons';
import {
  Box,
  Heading,
  Text,
  Link,
  UnorderedList,
  ListItem,
  Image,
} from '@chakra-ui/react';
import React from 'react';
import {useTranslation} from 'react-i18next';
import AqiTable from '../components/AqiTable';

const Health: React.FC = () => {
  const {t} = useTranslation('health');

  return (
    <Box>
      <Heading as="h1">{t('pageHeading')}</Heading>
      <Box>
        <Heading>{t('pollution.heading')}</Heading>
        <Text>{t('pollution.paragraph1')}</Text>
        <Image
          src={t('pollution.image.fileName')}
          alt={t('pollution.image.caption')}
        />
        <Text>{t('pollution.image.caption')}</Text>
        <Text>
          {t('pollution.paragraph2.part1')}{' '}
          <Link href={t('references.health.link')} isExternal>
            {t('pollution.paragraph2.link')} <ExternalLinkIcon />
          </Link>
          {t('pollution.paragraph2.part2')}
          <UnorderedList>
            <ListItem>{t('pollution.paragraph2.list.death')}</ListItem>
            <ListItem>{t('pollution.paragraph2.list.heartAttacks')}</ListItem>
            <ListItem>{t('pollution.paragraph2.list.arrhythmia')}</ListItem>
            <ListItem>{t('pollution.paragraph2.list.asthma')}</ListItem>
            <ListItem>{t('pollution.paragraph2.list.lungs')}</ListItem>
            <ListItem>{t('pollution.paragraph2.list.symptoms')}</ListItem>
          </UnorderedList>
          {t('pollution.paragraph2.part3')}
        </Text>
      </Box>
      <Box>
        <Heading>{t('aqi.heading')}</Heading>
        <Text>{t('aqi.paragraph1')}</Text>
        <Text>
          {t('aqi.paragraph2.part1')}
          <strong>{t('aqi.paragraph2.part2')}</strong>
          {t('aqi.paragraph2.part3')}
        </Text>
        <AqiTable />
      </Box>
      <Box>
        <Heading>{t('protection.heading')}</Heading>
        <Text>{t('protection.paragraph1')}</Text>
      </Box>
      <Box>
        <Heading>{t('references.heading')}</Heading>
        <UnorderedList>
          <ListItem>
            <Link href={t('references.pm25.link')} isExternal>
              {t('references.pm25.text')}
              <ExternalLinkIcon />
            </Link>
          </ListItem>
          <ListItem>
            <Link href={t('references.health.link')} isExternal>
              {t('references.health.text')}
              <ExternalLinkIcon />
            </Link>
          </ListItem>
          <ListItem>
            <Link href={t('references.aqi.link')} isExternal>
              {t('references.aqi.text')}
              <ExternalLinkIcon />
            </Link>
          </ListItem>
          <ListItem>
            <Link href={t('references.fire.link')} isExternal>
              {t('references.fire.text')}
              <ExternalLinkIcon />
            </Link>
          </ListItem>
        </UnorderedList>
      </Box>
    </Box>
  );
};

export default Health;
