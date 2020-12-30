import React, {useState} from 'react';
import {Text, Heading, Link, Divider} from '@chakra-ui/react';
import {SubmitButton, signInWithGoogle} from './Util';
import {UnauthenticatedPageProps} from '../UnauthenticatedAdmin';

/**
 * Component to sign in.
 */
const SignIn: ({setIsNewUser}: UnauthenticatedPageProps) => JSX.Element = ({
  setIsNewUser,
}: UnauthenticatedPageProps) => {
  const [errorGoogle, setErrorGoogle] = useState('');
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);

  return (
    <>
      <Heading textAlign="center">Sign In</Heading>
      <form
        onSubmit={event => {
          signInWithGoogle(event, setErrorGoogle, setIsLoadingGoogle);
        }}
      >
        <SubmitButton
          color={'red'}
          label={'Sign in with Google'}
          error={errorGoogle}
          isLoading={isLoadingGoogle}
        ></SubmitButton>
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
