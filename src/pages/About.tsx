import React from 'react';
import {Box, Heading} from '@chakra-ui/react';
import {useTranslation} from 'react-i18next';

const About: React.FC = () => {
  const {t} = useTranslation('about');
  return (
    <Box>
      <Heading>{t('heading')}</Heading>
    </Box>
  );
};

export default About;
