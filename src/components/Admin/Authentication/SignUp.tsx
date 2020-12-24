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
 * Props for SignUp component. Used for type safety.
 */
interface SignUpProps {
  setIsNewUser: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * Component to sign up.
 */
const SignUp: ({setIsNewUser}: SignUpProps) => JSX.Element = ({
  setIsNewUser,
}: SignUpProps) => {
  const {setIsAuthenticated} = useAuth();

  /**
   * Handles user sign up. Sets user status to authenticated.
   */
  function handleSignUp() {
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
          <Heading>Sign Up</Heading>
        </Box>
        <Button
          onClick={handleSignUp}
          colorScheme="teal"
          variant="solid"
          width="full"
          mt={4}
        >
          Sign Up
        </Button>
        <Box my={4}>
          <Divider orientation="horizontal" />
        </Box>
        <Text fontSize="md">
          Already have an account?{' '}
          <Link color="teal.500" onClick={() => setIsNewUser(false)}>
            Sign in
          </Link>
        </Text>
      </Box>
    </Flex>
  );
};

export default SignUp;
