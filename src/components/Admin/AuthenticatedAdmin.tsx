import React from 'react';
import SignOut from './Authentication/SignOut';
import {Heading, Box, Flex} from '@chakra-ui/react';

/**
 * Admin component for authenticated users.
 */
const AuthenticatedAdmin: () => JSX.Element = () => {
  return (
    <Flex width="full" align="center" justifyContent="center">
      <Box
        padding={8}
        margin={8}
        maxWidth="500px"
        borderWidth={1}
        borderRadius={8}
        boxShadow="lg"
      >
        <Heading textAlign="center">Welcome to the admin page</Heading>
        <SignOut></SignOut>
      </Box>
    </Flex>
  );
};

export default AuthenticatedAdmin;
