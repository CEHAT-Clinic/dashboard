import React, {useState, useEffect} from 'react';
import {Box, Heading, Text, Flex, Button} from '@chakra-ui/react';
import {useAuth} from '../../../contexts/AuthContext';
import AccessDenied from './AccessDenied';
import ChangePasswordModal from '../Authentication/ChangePassword';
import {firebaseAuth} from '../../../firebase';
import Loading from '../../Util/Loading';

/**
 * Component for a user to manage their own account information.
 * If a user is not signed in, access is denied.
 */
const ManageAccount: () => JSX.Element = () => {
  // --------------- State maintenance variables ------------------------
  const {isAuthenticated, isLoading} = useAuth();
  const [email, setEmail] = useState('');
  const [signInMethods, setSignInMethods] = useState<string[]>([]);
  const [passwordUser, setPasswordUser] = useState(false);
  const [googleUser, setGoogleUser] = useState(false);
  const [error, setError] = useState('');
  // --------------- End state maintenance variables ------------------------

  // Runs on mount
  useEffect(() => {
    if (isAuthenticated) {
      if (!firebaseAuth.currentUser) throw new Error('No user');
      if (!firebaseAuth.currentUser.email) throw new Error('No user email');
      setEmail(firebaseAuth.currentUser.email);
    }
  }, [isAuthenticated]);

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
          setError(`Invalid email ${email}`);
        } else {
          setError(
            `Error occurred when fetching user sign in methods: ${error}, ${error.code}, ${error.message}`
          );
        }
      }
    }
    if (email) {
      getSignInMethods();
    }
  }, [email]);

  // When signInMethods is populated, sets user type state maintenance variables
  useEffect(() => {
    if (signInMethods.includes('password')) setPasswordUser(true);
    if (signInMethods.includes('google.com')) setGoogleUser(true);
  }, [signInMethods]);

  if (isLoading) {
    return <Loading />;
  } else if (!isAuthenticated) {
    return <AccessDenied reason="you are not signed in" />;
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
          <Heading>Manage Your Account</Heading>
          <Text>Email: {email}</Text>
          {passwordUser && <ChangePasswordModal />}
          {googleUser && <Text>Account connected to Google</Text>}
          <Text>{error}</Text>
          <Button as="a" href="/admin" margin={1}>
            Return to admin page
          </Button>
        </Box>
      </Flex>
    );
  }
};

export default ManageAccount;
