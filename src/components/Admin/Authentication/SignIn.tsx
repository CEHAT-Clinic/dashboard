import React from 'react';
import {Text, Heading, Link, Divider} from '@chakra-ui/react';
import {useAuth} from '../../../contexts/AuthContext';
import {SubmitButton} from './Util';
import {UnauthenticatedPageProps} from '../UnauthenticatedAdmin';

/**
 * Component to sign in.
 */
const SignIn: ({setIsNewUser}: UnauthenticatedPageProps) => JSX.Element = ({
  setIsNewUser,
}: UnauthenticatedPageProps) => {
  // Access AuthContext to change authentication status
  const {setIsAuthenticated} = useAuth();

  /**
   * Handles user sign in. Sets user status to authenticated.
   * @param event - submit form event
   */
  function handleSignIn(event: React.ChangeEvent<HTMLFormElement>) {
    // Prevents submission before sign in is complete
    event.preventDefault();

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
