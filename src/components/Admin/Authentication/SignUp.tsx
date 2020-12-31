import React, {useState} from 'react';
import {Text, Heading, Link, Divider} from '@chakra-ui/react';
<<<<<<< HEAD
import {
  SubmitButton,
  signInWithGoogle,
  EmailFormInput,
  PasswordFormInput,
} from './Util';
import {firebaseAuth} from '../../../firebase';
=======
import {SubmitButton, signInWithGoogle} from './Util';
>>>>>>> master
import {UnauthenticatedPageProps} from '../UnauthenticatedAdmin';

/**
 * Component to sign up.
 */
const SignUp: ({setIsNewUser}: UnauthenticatedPageProps) => JSX.Element = ({
  setIsNewUser,
}: UnauthenticatedPageProps) => {
  const [errorGoogle, setErrorGoogle] = useState('');
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
<<<<<<< HEAD

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const [generalEmailError, setGeneralEmailError] = useState('');
  const [isLoadingEmail, setIsLoadingEmail] = useState(false);

  /**
   * Signs up a user with email in Firebase and handles any errors
   * @param event - submit form event
   */
  async function handleSignUpWithEmail(
    event: React.FormEvent<HTMLFormElement>
  ) {
    // Prevents submission before call to Firebase is complete
    event.preventDefault();

    setIsLoadingEmail(true);
    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      setPassword('');
      setConfirmPassword('');
      setIsLoadingEmail(false);
    } else {
      try {
        await firebaseAuth.createUserWithEmailAndPassword(email, password);
      } catch (error) {
        // Error codes from Firebase documentation
        switch (error.code) {
          case 'auth/email-already-in-use': {
            setEmailError(
              'Email already has an account. Please sign in or use a different email'
            );
            break;
          }
          case 'auth/invalid-email': {
            setEmailError('Invalid email. Please enter a valid email address');
            break;
          }
          case 'auth/weak-password': {
            setPasswordError(
              'Password not strong enough. Please enter a new password with at least six characters'
            );
            break;
          }
          default: {
            setGeneralEmailError(
              'Error occurred. Please try to create account again'
            );
            break;
          }
        }
        setIsLoadingEmail(false);
        setPassword('');
        setConfirmPassword('');
      }
    }
  }
=======
>>>>>>> master

  return (
    <>
      <Heading textAlign="center">Sign Up</Heading>
      <form
        onSubmit={event => {
          signInWithGoogle(event, setErrorGoogle, setIsLoadingGoogle);
        }}
      >
        <SubmitButton
          color={'blue'}
          label={'Sign up with Google'}
          error={errorGoogle}
          isLoading={isLoadingGoogle}
        ></SubmitButton>
      </form>
      <Divider my={4} orientation="horizontal" />
      <form onSubmit={handleSignUpWithEmail}>
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
        <PasswordFormInput
          label={'Confirm Password'}
          handlePasswordChange={event => {
            setConfirmPassword(event.target.value);
            setConfirmPasswordError('');
            setGeneralEmailError('');
          }}
          error={confirmPasswordError}
          showPassword={showConfirmPassword}
          handlePasswordVisibility={() =>
            setShowConfirmPassword(!showConfirmPassword)
          }
          value={confirmPassword}
        ></PasswordFormInput>
        <SubmitButton
          label={'Sign up with email'}
          error={generalEmailError}
          isLoading={isLoadingEmail}
        ></SubmitButton>
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
