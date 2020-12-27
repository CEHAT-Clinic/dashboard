import React from 'react';
import SignOut from './Authentication/SignOut';
import {Heading, Box, Flex, Text} from '@chakra-ui/react';
import {firebaseAuth} from '../../firebase';

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
    }
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
        <Heading>Admin Page</Heading>
        <Text>User ID: {userId}</Text>
        <Text>Email: {email}</Text>
        <SignOut></SignOut>
      </Box>
    </Flex>
  );
};

export default AuthenticatedAdmin;
