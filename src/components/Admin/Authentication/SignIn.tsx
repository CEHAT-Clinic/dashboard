import React from 'react';
import {Text, Heading, Link, Divider} from '@chakra-ui/react';
import {useAuth} from '../../../contexts/AuthContext';
import {SubmitButton} from './Util';

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
      <Heading textAlign="center">Sign In</Heading>
      <form onSubmit={handleSignIn}>
        <SubmitButton label={'Sign In'}></SubmitButton>
      </form>
      <Divider my={4} orientation="horizontal" />
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
