import React from 'react';
import {Text, Heading, Box, Link, Button, Divider} from '@chakra-ui/react';
import {useAuth} from '../../../contexts/AuthContext';

/**
 * Props for SignIn component. Used for type safety.
 */
interface SignInProps {
  setIsNewUser: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * Component to sign in.
 */
const SignIn: ({setIsNewUser}: SignInProps) => JSX.Element = ({
  setIsNewUser,
}: SignInProps) => {
  const {setIsAuthenticated} = useAuth();

  /**
   * Handles user sign in. Sets user status to authenticated.
   */
  function handleSignIn() {
    setIsAuthenticated(true);
  }

  return (
    <>
      <Box textAlign="center">
        <Heading>Sign In</Heading>
      </Box>
      <Button
        onClick={handleSignIn}
        colorScheme="teal"
        variant="solid"
        width="full"
        mt={4}
      >
        Sign In
      </Button>
      <Box my={4}>
        <Divider orientation="horizontal" />
      </Box>
      <Text fontSize="md">
        Need an account?{' '}
        <Link color="teal.500" onClick={() => setIsNewUser(true)}>
          Sign up
        </Link>
      </Text>
    </>
  );
};

export default SignIn;
