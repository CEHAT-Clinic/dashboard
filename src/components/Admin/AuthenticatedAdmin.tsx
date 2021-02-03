import React from 'react';
import SignOut from './Authentication/SignOut';
import {Heading, Box, Flex, Text, Button} from '@chakra-ui/react';
import {useAuth} from '../../contexts/AuthContext';

/**
 * Admin component for authenticated users.
 */
const AuthenticatedAdmin: () => JSX.Element = () => {
  // --------------- State maintenance variables ------------------------
  const {isAdmin} = useAuth();
  // --------------- End state maintenance variables ------------------------

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
        <SignOut></SignOut>
      </Box>
    </Flex>
  );
};

export default AuthenticatedAdmin;
