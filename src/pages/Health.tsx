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
} from '@chakra-ui/react';
import React from 'react';
import {useTranslation} from 'react-i18next';
import AqiTable from '../components/AqiTable';

const Health: React.FC = () => {
  const {t} = useTranslation('health');

  return (
    <Flex width="full" align="center" direction="column" padding={8}>
      <Heading as="h1">{t('pageHeading')}</Heading>
      <Flex
        padding={2}
        margin={2}
        width="full"
        borderWidth={1}
        borderRadius={8}
        boxShadow="lg"
        direction="column"
      >
        <Heading>{t('pollution.heading')}</Heading>
        <Text>{t('pollution.paragraph1')}</Text>
        <Flex
          padding={4}
          margin={['2', 'auto', '2', 'auto']}
          borderWidth={1}
          borderRadius={8}
          boxShadow="lg"
          width={['100%', null, '525px', null]}
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
      >
        <Heading>{t('aqi.heading')}</Heading>
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
      >
        <Heading>{t('protection.heading')}</Heading>
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
      >
        <Heading>{t('references.heading')}</Heading>
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
