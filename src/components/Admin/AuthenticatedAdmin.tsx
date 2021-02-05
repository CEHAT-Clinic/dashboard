import React from 'react';
import SignOut from './Authentication/SignOut';
import {Heading, Box, Flex, Button} from '@chakra-ui/react';
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
        <Button as="a" href="/admin/account" width="70%" marginY={1}>
          Manage Account
        </Button>
        {isAdmin && (
          <Button as="a" href="/admin/sensors" width="70%" marginY={1}>
            Manage Sensors
          </Button>
        )}
        {isAdmin && (
          <Button as="a" href="/admin/users" width="70%" marginY={1}>
            Manage Users
          </Button>
        )}
        <SignOut></SignOut>
      </Box>
    </Flex>
  );
};

export default AuthenticatedAdmin;
