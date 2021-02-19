import React, {useState, useEffect} from 'react';
import {Box, Heading, Text, Flex, Button, Divider} from '@chakra-ui/react';
import {useAuth} from '../../../contexts/AuthContext';
import AccessDenied from './AccessDenied';
import ChangePasswordModal from '../Authentication/ChangePassword';
import {firebaseAuth} from '../../../firebase';
import Loading from '../../Util/Loading';
import ChangeNameModal from '../Authentication/ChangeName';
import {useTranslation} from 'react-i18next';

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
  } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [passwordUser, setPasswordUser] = useState(false);
  const [googleUser, setGoogleUser] = useState(false);
  const [error, setError] = useState('');
  // --------------- End state maintenance variables ------------------------

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
              setError(`Invalid email ${email}`);
            } else {
              setError(
                `Error occurred when fetching user sign in methods: ${error}, ${error.code}, ${error.message}`
              );
            }
          })
          .finally(() => setIsLoading(false));
      }
    }
  }, [isAuthenticated, email]);
  const {t} = useTranslation('administration');

  // Runs on mount
  useEffect(() => {
    if (isAuthenticated) {
      if (!firebaseAuth.currentUser) throw new Error(t('noUser'));
      if (!firebaseAuth.currentUser.email) throw new Error(t('noEmail'));
      setEmail(firebaseAuth.currentUser.email);
    }
  }, [isAuthenticated, t]);

  // When email is populated, fetches sign in methods
  useEffect(() => {
    /**
     * Gets sign in methods for the signed in user and sets signInMethods.
     * In own function to be able to make async calls from within useEffect
     */
    async function getSignInMethods() {
      try {
        const methods = await firebaseAuth.fetchSignInMethodsForEmail(email);
        setSignInMethods(methods);
      } catch (error) {
        if (error.code === 'auth/invalid-email') {
          setError(t('invalidEmail'));
        } else {
          setError(
            `${t('manageAccount.methodFetchError')}: ${error}, ${error.code}, ${
              error.message
            }`
          );
        }
      }
    }
    if (email) {
      getSignInMethods();
    }
  }, [email, t]);

  // When signInMethods is populated, sets user type state maintenance variables
  useEffect(() => {
    if (signInMethods.includes('password')) setPasswordUser(true);
    if (signInMethods.includes('google.com')) setGoogleUser(true);
  }, [signInMethods]);

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
<<<<<<< HEAD
          <Heading marginBottom={2}>Manage Your Account</Heading>
          <Text textAlign="left" fontSize="lg" fontWeight="bold">
            Email
          </Text>
          <Text textAlign="left" fontSize="md">
            {email}
          </Text>
          <Divider marginY={2} />
          <Text textAlign="left" fontSize="lg" fontWeight="bold">
            Name
          </Text>
          <Text
            color={name ? 'black.500' : 'red.500'}
            textAlign="left"
            fontSize="md"
          >
            {name ? name : 'Please add a name to your account'}
          </Text>
          <ChangeNameModal passwordUser={passwordUser} />
          <Divider marginY={2} />
          <Text marginTop={2} fontSize="lg" fontWeight="bold" textAlign="left">
            Manage Sign In Methods
          </Text>
          {passwordUser && <ChangePasswordModal />}
          {googleUser && <Text>Account connected to Google</Text>}
          <Divider marginY={2} />
          <Text color="red.500">{error}</Text>
=======
          <Heading>{t('manageAccount.heading')}</Heading>
          <Text>
            {t('email')}: {email}
          </Text>
          {passwordUser && <ChangePasswordModal />}
          {googleUser && <Text>{t('manageAccount.connectedToGoogle')}</Text>}
          <Text>{error}</Text>
>>>>>>> main
          <Button as="a" href="/admin" margin={1}>
            {t('returnAdmin')}
          </Button>
        </Box>
      </Flex>
    );
  }
};

export default ManageAccount;
