import React from 'react';
import SignOut from './Authentication/SignOut';
import {Heading, Box, Flex, Text} from '@chakra-ui/react';
import {useAuth} from '../../contexts/AuthContext';

/**
 * Admin component for authenticated users.
 */
const AuthenticatedAdmin: () => JSX.Element = () => {
  const {userId, email} = useAuth();
  return (
    <Flex width="full" align="center" justifyContent="center">
      <Box
        padding={8}
        margin={8}
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
