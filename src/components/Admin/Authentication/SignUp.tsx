import React from 'react';
import {Text, Heading, Link, Divider} from '@chakra-ui/react';
import {useAuth} from '../../../contexts/AuthContext';
import {SubmitButton} from './Util';

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
