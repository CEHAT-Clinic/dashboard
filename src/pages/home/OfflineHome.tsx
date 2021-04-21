import React from 'react';
import {Text, Heading, Box, Flex} from '@chakra-ui/react';
import {useTranslation} from 'react-i18next';

/**
 * Offline Home screen component
 */
const OfflineHome: () => JSX.Element = () => {
  const {t} = useTranslation('home');

  return (
    <Box>
      <Flex
        direction="column"
        textAlign="center"
        fontFamily="Oxygen"
        alignItems="center"
        marginY={4}
      >
        <Heading>{t('offline.heading')}</Heading>
        <Text marginY={5} marginX={4}>
          {t('offline.body')}
        </Text>
      </Flex>
    </Box>
  );
};

export default OfflineHome;
