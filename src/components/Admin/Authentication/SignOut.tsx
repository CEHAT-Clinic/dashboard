import React from 'react';
import {Box, Button} from '@chakra-ui/react';
import {useAuth} from '../../../contexts/AuthContext';

/**
 * Button that signs the user out
 */
const SignOut: () => JSX.Element = () => {
  const {setIsAuthenticated} = useAuth();

  /**
   * Signs out the user and sets authentication status to false.
   */
  function handleSignOut() {
    setIsAuthenticated(false);
  }

  return (
    <Box>
      <Button
        colorScheme="teal"
        variant="solid"
        width="full"
        mt={4}
        onClick={handleSignOut}
      >
        Sign Out
      </Button>
    </Box>
  );
};

export default SignOut;
