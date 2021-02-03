import React, {useState, useEffect} from 'react';
import {Box, Heading, Text} from '@chakra-ui/react';
import {useAuth} from '../../../contexts/AuthContext';
import AccessDenied from './AccessDenied';
import ChangePasswordModal from '../Authentication/ChangePassword';
import {firebaseAuth} from '../../../firebase';

const ManageAccount: () => JSX.Element = () => {
  // --------------- State maintenance variables ------------------------
  const {isAuthenticated} = useAuth();
  const [email, setEmail] = useState('');
  const [signInMethods, setSignInMethods] = useState<string[]>([]);
  const [passwordUser, setPasswordUser] = useState(false);
  const [googleUser, setGoogleUser] = useState(false);
  const [error, setError] = useState('');
  // --------------- End state maintenance variables ------------------------

  // Runs on mount
  useEffect(() => {
    if (!firebaseAuth.currentUser) throw new Error('No user');
    if (!firebaseAuth.currentUser.email) throw new Error('No user email');
    setEmail(firebaseAuth.currentUser.email);
  }, []);

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

  if (!isAuthenticated) {
    return <AccessDenied reason="you are not signed in" />;
  } else {
    return (
      <Box>
        <Heading>Manage Your Account</Heading>
        <Text>Email: {email}</Text>
        {passwordUser && <ChangePasswordModal />}
        {googleUser && <Text>Account connected to Google</Text>}
        <Text>{error}</Text>
      </Box>
    );
  }
};

export default ManageAccount;
