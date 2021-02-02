import React, {useEffect, useState} from 'react';
import SignOut from './Authentication/SignOut';
import {Heading, Box, Flex, Text, Button} from '@chakra-ui/react';
import {firebaseAuth} from '../../firebase';
import {useAuth} from '../../contexts/AuthContext';
import ChangePasswordModal from './Authentication/ChangePassword';

/**
 * Admin component for authenticated users.
 */
const AuthenticatedAdmin: () => JSX.Element = () => {
  // --------------- State maintenance variables ------------------------
  const {isAdmin} = useAuth();
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
        <Heading>Admin Page</Heading>
        {isAdmin && <Text>You are an admin user</Text>}
        <Button>Manage Account Information</Button>
        <Text>Email: {email}</Text>
        {passwordUser && <ChangePasswordModal />}
        {googleUser && <Text>Account connected to Google</Text>}
        <Text>{error}</Text>
        <SignOut></SignOut>
      </Box>
    </Flex>
  );
};

export default AuthenticatedAdmin;
