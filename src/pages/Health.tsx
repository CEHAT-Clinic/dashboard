import {Box, Heading} from '@chakra-ui/react';
import React from 'react';
import {useTranslation} from 'react-i18next';

const Health: React.FC = () => {
  const {t} = useTranslation('health');
  return (
    <Box>
      <Heading>{t('heading')}</Heading>
    </Box>
  );
};

export default Health;
