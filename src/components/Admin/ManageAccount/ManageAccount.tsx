import React from 'react';
import {Box, Heading, Text, Flex, Button, Divider} from '@chakra-ui/react';
import {useAuth} from '../../../contexts/AuthContext';
import AccessDenied from '../AccessDenied';
import ChangePasswordModal from './ChangePassword';
import Loading from '../../Util/Loading';
import ChangeNameModal from './ChangeName';
import {useTranslation} from 'react-i18next';
import {AccountDeleted} from '../AccountDeleted';
import {DeleteAccountPopover} from './DeleteAccountPopover';
import {AddPasswordModal} from './AddPassword';

/**
 * Component for a user to manage their own account information.
 * If a user is not signed in, access is denied.
 */
const ManageAccount: () => JSX.Element = () => {
  // --------------- State maintenance variables ------------------------
  const {
    isAuthenticated,
    isLoading: fetchingAuthContext,
    name,
    email,
    isDeleted,
    googleUser,
    passwordUser,
  } = useAuth();
  // --------------- End state maintenance variables ------------------------

  const {t} = useTranslation('administration');

  if (fetchingAuthContext) {
    return <Loading />;
  } else if (!isAuthenticated) {
    return <AccessDenied reason={t('notSignedIn')} />;
  } else if (isDeleted) {
    return <AccountDeleted />;
  } else {
    return (
      <Flex width="full" align="center" justifyContent="center">
        <Box
          padding={8}
          marginX={8}
          width="full"
          maxWidth="500px"
          borderWidth={1}
          borderRadius={8}
          boxShadow="lg"
          textAlign="center"
        >
          <Heading marginBottom={2}>{t('manageAccount.heading')}</Heading>
          <Heading textAlign="left" fontSize="lg" as="h2">
            {t('email')}
          </Heading>
          <Text textAlign="left" fontSize="md">
            {email}
          </Text>
          <Divider marginY={2} />
          <Heading textAlign="left" fontSize="lg" as="h2">
            {t('name')}
          </Heading>
          <Text
            color={name ? 'black.500' : 'red.500'}
            textAlign="left"
            fontSize="md"
          >
            {name ? name : t('noName')}
          </Text>
          <ChangeNameModal />
          <Divider marginY={2} />
          <Heading marginTop={2} fontSize="lg" as="h2" textAlign="left">
            {t('manageAccount.manageSignInMethodsHeader')}
          </Heading>
          {passwordUser && <ChangePasswordModal />}
          {googleUser && <Text>{t('manageAccount.connectedToGoogle')}</Text>}
          {!passwordUser && <AddPasswordModal />}
          <Divider marginY={2} />
          <Heading fontSize="lg" as="h2" textAlign="left">
            {t('deleteAccount.heading')}
          </Heading>
          <DeleteAccountPopover />
          <Divider marginY={2} />
          <Button as="a" href="/admin" margin={1}>
            {t('returnAdmin')}
          </Button>
        </Box>
      </Flex>
    );
  }
};

export default ManageAccount;
