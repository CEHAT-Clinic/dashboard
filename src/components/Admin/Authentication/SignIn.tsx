import React, {useState} from 'react';
import {Text, Heading, Link, Divider} from '@chakra-ui/react';
import {
  SubmitButton,
  signInWithGoogle,
  EmailFormInput,
  PasswordFormInput,
} from './Util';
import {firebaseAuth} from '../../../firebase';
import {UnauthenticatedPageProps} from '../UnauthenticatedAdmin';

/**
 * Component to sign in.
 */
const SignIn: ({setIsNewUser}: UnauthenticatedPageProps) => JSX.Element = ({
  setIsNewUser,
}: UnauthenticatedPageProps) => {
  // --------------- State maintenance variables ------------------------
  const [googleError, setGoogleError] = useState('');
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const [generalEmailError, setGeneralEmailError] = useState('');
  const [isLoadingEmail, setIsLoadingEmail] = useState(false);
  // -------------- End state maintenance variables -------------------------

  /**
   * Signs in a user with email and password using Firebase authentication
   * @param event - submit form event
   */
  async function handleSignInWithEmail(
    event: React.FormEvent<HTMLFormElement>
  ) {
    // Prevents submission before call to Firebase is complete
    event.preventDefault();
    setIsLoadingEmail(true);

    try {
      await firebaseAuth.signInWithEmailAndPassword(email, password);
    } catch (error) {
      // Error codes from Firebase documentation
      switch (error.code) {
        case 'auth/invalid-email': {
          setEmailError('Please enter a valid email');
          break;
        }
        case 'auth/user-disabled': {
          setGeneralEmailError(
            'Account has been disabled. Please contact an administrator ' +
              'if you believe this is a mistake'
          );
          break;
        }
        case 'auth/user-not-found': {
          setEmailError('No account found for the given email address');
          break;
        }
        case 'auth/wrong-password': {
          setPasswordError(
            'Wrong password. Try again or reset your password. ' +
              'You may also have created your account with a different method'
          );
          break;
        }
        default: {
          setGeneralEmailError('Error occurred. Please try again');
          break;
        }
      }
      setPassword('');
      setIsLoadingEmail(false);
    }
  }

  return (
    <>
      <Heading textAlign="center">Sign In</Heading>
      <form
        onSubmit={event => {
          signInWithGoogle(event, setGoogleError, setIsLoadingGoogle);
        }}
      >
        <SubmitButton
          color={'blue'}
          label={'Sign in with Google'}
          error={googleError}
          isLoading={isLoadingGoogle}
        ></SubmitButton>
      </form>
      <Divider my={4} orientation="horizontal" />
      <form onSubmit={handleSignInWithEmail}>
        <EmailFormInput
          handleEmailChange={event => {
            setEmail(event.target.value);
            setEmailError('');
            setGeneralEmailError('');
          }}
          error={emailError}
          value={email}
        ></EmailFormInput>
        <PasswordFormInput
          handlePasswordChange={event => {
            setPassword(event.target.value);
            setPasswordError('');
            setGeneralEmailError('');
          }}
          error={passwordError}
          showPassword={showPassword}
          handlePasswordVisibility={() => setShowPassword(!showPassword)}
          value={password}
        ></PasswordFormInput>
        <SubmitButton
          label={'Sign in with email'}
          error={generalEmailError}
          isLoading={isLoadingEmail}
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
