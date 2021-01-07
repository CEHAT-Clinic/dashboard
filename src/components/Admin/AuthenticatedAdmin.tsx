import React from 'react';
import SignOut from './Authentication/SignOut';
import {Heading, Box, Flex, Text} from '@chakra-ui/react';
import {firebaseAuth} from '../../firebase';
import ChangePasswordModal from './Authentication/ChangePassword';

/**
 * Admin component for authenticated users.
 */
const AuthenticatedAdmin: () => JSX.Element = () => {
  const user = firebaseAuth.currentUser;
  let userId = '';
  let email = '';

  // Since AuthenticatedAdmin is only accessible to authenticated users,
  // user should never be null
  if (user) {
    userId = user.uid;
    if (user.email) {
      email = user.email;
    } else {
      throw new Error('User email missing');
    }
  } else {
    throw new Error('User ID missing');
  }

  async function getSignInMethods() {
    let signInMethods: string[] = [];
    try {
      const methods = await firebaseAuth.fetchSignInMethodsForEmail(email);
      signInMethods = methods;
    } catch (error) {
      if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid user email');
      } else {
        throw new Error('Error occurred when fetching sign in methods from Firebase');
      }
    }
    return signInMethods;
  }

  const emailAuthUser = getSignInMethods();

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
        <Text>User ID: {userId}</Text>
        <Text>Email: {email}</Text>
        {<ChangePasswordModal />}
        <SignOut></SignOut>
      </Box>
    </Flex>
  );
};

export default AuthenticatedAdmin;
