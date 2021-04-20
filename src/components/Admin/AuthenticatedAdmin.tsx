import React from 'react';
import SignOut from './Authentication/SignOut';
import {Heading, Box, Flex, Button} from '@chakra-ui/react';
import {useAuth} from '../../contexts/AuthContext';
import {useTranslation} from 'react-i18next';
import {AccountDeleted} from './AccountDeleted';

/**
 * Admin component for authenticated users.
 */
const AuthenticatedAdmin: () => JSX.Element = () => {
  // --------------- State maintenance variables ------------------------
  const {isAdmin, isDeleted} = useAuth();
  // --------------- End state maintenance variables ------------------------

  const {t} = useTranslation('administration');

  if (isDeleted) {
    return <AccountDeleted />;
  }

  return (
    <Flex width="full" align="center" justifyContent="center">
      <Box
        padding={8}
        margin={8}
        width="full"
        maxWidth="500px"
        borderWidth={1}
        borderRadius={8}
        boxShadow="lg"
        textAlign="center"
      >
        <Heading>{t('header')}</Heading>
        <Button as="a" href="/admin/account" minWidth="70%" marginY={1}>
          {/* Needs a different name because of overlap */}
          {t('manageAccountButtonText')}
        </Button>
        {isAdmin && (
          <Button as="a" href="/admin/sensors" minWidth="70%" marginY={1}>
            {t('manageSensors')}
          </Button>
        )}
        {isAdmin && (
          <Button as="a" href="/admin/users" minWidth="70%" marginY={1}>
            {t('manageUsers')}
          </Button>
        )}
        <SignOut></SignOut>
      </Box>
    </Flex>
  );
};

export default AuthenticatedAdmin;
