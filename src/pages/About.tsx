import React from 'react';
import {Box, Flex, Heading, Text, Link} from '@chakra-ui/react';
import {useTranslation} from 'react-i18next';
import {ExternalLinkIcon} from '@chakra-ui/icons';

const About: React.FC = () => {
  const {t} = useTranslation('about');
  return (
    <Flex width="full" align="center" direction="column" padding={8}>
      <Heading as="h1">{t('pageHeading')}</Heading>
      <Box
        padding={2}
        margin={2}
        width="full"
        borderWidth={1}
        borderRadius={8}
        boxShadow="lg"
      >
        <Heading>{t('cehat.heading')}</Heading>
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
      >
        <Heading>{t('involved.heading')}</Heading>
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
      >
        <Heading>{t('sensorsDown.heading')}</Heading>
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
      >
        <Heading>{t('acknowledge.heading')}</Heading>
        <Text>{t('acknowledge.clinic')}</Text>
        <Text>{t('acknowledge.grant')}</Text>
      </Box>
      <Box
        padding={2}
        margin={2}
        width="full"
        borderWidth={1}
        borderRadius={8}
        boxShadow="lg"
      >
        <Heading>{t('admin.heading')}</Heading>
        <Text>
          <Link color="#32bfd1" href={t('admin.action.link')}>
            {t('admin.action.text')}
          </Link>
          {t('admin.purpose')}
        </Text>
      </Box>
    </Flex>
  );
};

export default About;
