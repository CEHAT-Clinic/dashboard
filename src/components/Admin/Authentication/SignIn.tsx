import React from 'react';
import {
  Text,
  Heading,
  Box,
  Flex,
  Link,
  Button,
  Divider,
} from '@chakra-ui/react';
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
    <Flex width="full" align="center" justifyContent="center">
      <Box
        padding={8}
        margin={8}
        width="full"
        maxWidth="500px"
        borderWidth={1}
        borderRadius={8}
        boxShadow="lg"
      >
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
      </Box>
    </Flex>
  );
};

export default SignIn;
