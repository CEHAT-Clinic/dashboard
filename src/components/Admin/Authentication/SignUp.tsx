import React from 'react';
import {Text, Heading, Link, Divider} from '@chakra-ui/react';
import {useAuth} from '../../../contexts/AuthContext';
import {SubmitButton} from './Util';
import {UnauthenticatedPageProps} from '../UnauthenticatedAdmin';

/**
 * Component to sign up.
 */
const SignUp: ({setIsNewUser}: UnauthenticatedPageProps) => JSX.Element = ({
  setIsNewUser,
}: UnauthenticatedPageProps) => {
  // Access AuthContext to change authentication status
  const {setIsAuthenticated} = useAuth();

  /**
   * Handles user sign up. Sets user status to authenticated.
   * @param event - submit form event
   */
  function handleSignUp(event: React.FormEvent<HTMLFormElement>) {
    // Prevents submission before sign up is complete
    event.preventDefault();

    setIsAuthenticated(true);
  }

  return (
    <>
      <Heading textAlign="center">Sign Up</Heading>
      <form onSubmit={handleSignUp}>
        <SubmitButton label={'Sign Up'}></SubmitButton>
      </form>
      <Divider my={4} orientation="horizontal" />
      <Text fontSize="md">
        Already have an account?{' '}
        <Link color="teal.500" onClick={() => setIsNewUser(false)}>
          Sign in
        </Link>
      </Text>
    </>
  );
};

export default SignUp;
