import React, {useState, useEffect} from 'react';
import {Box, Heading, Text, Flex, Button, Divider} from '@chakra-ui/react';
import {useAuth} from '../../../contexts/AuthContext';
import AccessDenied from '../AccessDenied';
import ChangePasswordModal from './ChangePassword';
import {firebaseAuth} from '../../../firebase/firebase';
import Loading from '../../Util/Loading';
import ChangeNameModal from './ChangeName';
import {useTranslation} from 'react-i18next';
import {DeletePopover} from './DeletePopover';
import {AccountDeleted} from '../AccountDeleted';

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
  } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [passwordUser, setPasswordUser] = useState(false);
  const [googleUser, setGoogleUser] = useState(false);
  const [error, setError] = useState('');
  // --------------- End state maintenance variables ------------------------

  const {t} = useTranslation('administration');

  // Runs on mount and on authentication status change
  useEffect(() => {
    if (isAuthenticated && firebaseAuth.currentUser) {
      // Fetch sign in methods
      if (email) {
        setIsLoading(true);
        firebaseAuth
          .fetchSignInMethodsForEmail(email)
          .then(methods => {
            if (methods.includes('password')) setPasswordUser(true);
            if (methods.includes('google.com')) setGoogleUser(true);
          })
          .catch(error => {
            if (error.code === 'auth/invalid-email' && email) {
              setError(t('invalidEmailShort') + email);
            } else {
              setError(`${t('manageAccount.methodFetchError')}: ${error}`);
            }
          })
          .finally(() => setIsLoading(false));
      }
    }
  }, [isAuthenticated, email, t]);

  if (isLoading || fetchingAuthContext) {
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
          margin={8}
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
          <ChangeNameModal passwordUser={passwordUser} />
          <Divider marginY={2} />
          <Heading marginTop={2} fontSize="lg" as="h2" textAlign="left">
            {t('manageAccount.manageSignInMethodsHeader')}
          </Heading>
          {passwordUser && <ChangePasswordModal />}
          {googleUser && <Text>{t('manageAccount.connectedToGoogle')}</Text>}
          <Divider marginY={2} />
          <Heading fontSize="lg" as="h2" textAlign="left">
            {'Delete Account'}
          </Heading>
          <DeletePopover passwordUser={passwordUser} />
          <Divider marginY={2} />
          <Text color="red.500">{error}</Text>
          <Button as="a" href="/admin" margin={1}>
            {t('returnAdmin')}
          </Button>
        </Box>
      </Flex>
    );
  }
};

export default ManageAccount;
