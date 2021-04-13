import React from 'react';
import {Flex, Heading, Image, Text, Link} from '@chakra-ui/react';
import cehatLogo from '../media/CEHATLogo.png';
import {useTranslation} from 'react-i18next';

/**
 * @returns 404 Page Not Found page
 */
const Page404: React.FC = () => {
  const {t} = useTranslation('page404');
  return (
    <Flex alignItems="center" flexDir="column" margin={2} textAlign="center">
      <Heading marginBottom={1}>{t('heading')}</Heading>
      <Text>
        {t('whoops')}
        <Link color="#32bfd1" href="/">
          {t('here')}
        </Link>
        {t('redirect')}
        <Link color="#32bfd1" href="/">
          {t('home')}
        </Link>
      </Text>
      <Image marginTop={4} src={cehatLogo} alt="Logo" />
    </Flex>
  );
};

export default Page404;
