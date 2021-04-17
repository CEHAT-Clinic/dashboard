import React, {useState, useEffect} from 'react';
import {Box, Heading, Text, Flex, Button, Divider} from '@chakra-ui/react';
import {useAuth} from '../../../contexts/AuthContext';
import AccessDenied from '../AccessDenied';
import ChangePasswordModal from './ChangePassword';
import {firebaseAuth} from '../../../firebase';
import Loading from '../../Util/Loading';
import ChangeNameModal from './ChangeName';
import {useTranslation} from 'react-i18next';
import ChangeEmailModal from './ChangeEmail';

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
    emailVerified,
  } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [passwordUser, setPasswordUser] = useState(false);
  const [googleUser, setGoogleUser] = useState(false);
  const [error, setError] = useState('');
  const [verificationEmailSent, setVerificationEmailSent] = useState(false);
  // --------------- End state maintenance variables ------------------------

  const {t} = useTranslation(['administration', 'common']);

  // TODO: make this happen on click
  function sendEmailVerificationEmail() {
    if (isAuthenticated && firebaseAuth.currentUser && !verificationEmailSent) {
      const user = firebaseAuth.currentUser;
      user
        .sendEmailVerification()
        .then(() => setVerificationEmailSent(true))
        .catch(error => {
          setError(t('common:generalErrorTemplate') + error.message);
        });
    }
  }

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
          <Text textAlign="left" fontSize="lg" fontWeight="bold">
            {t('email')}
          </Text>
          <Text textAlign="left" fontSize="md">
            {email}
          </Text>
          {!emailVerified && !verificationEmailSent && (
            <Button onClick={sendEmailVerificationEmail}>
              {t('manageAccount.sendEmailVerificationEmail')}
            </Button>
          )}
          {/* TODO: add message for "Verification email sent. Refresh the page to send the email again" */}
          <ChangeEmailModal passwordUser={passwordUser} />
          <Divider marginY={2} />
          <Text textAlign="left" fontSize="lg" fontWeight="bold">
            {t('name')}
          </Text>
          <Text
            color={name ? 'black.500' : 'red.500'}
            textAlign="left"
            fontSize="md"
          >
            {name ? name : t('noName')}
          </Text>
          <ChangeNameModal passwordUser={passwordUser} />
          <Divider marginY={2} />
          <Text marginTop={2} fontSize="lg" fontWeight="bold" textAlign="left">
            {t('manageAccount.manageSignInMethodsHeader')}
          </Text>
          {passwordUser && <ChangePasswordModal />}
          {googleUser && <Text>{t('manageAccount.connectedToGoogle')}</Text>}
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
