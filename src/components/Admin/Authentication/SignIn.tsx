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
import ForgotPasswordModal from './ForgotPassword';
import {useTranslation} from 'react-i18next/*';

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

  const {t} = useTranslation(['administration', 'common']);

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
          setEmailError(t('invalidEmail'));
          break;
        }
        case 'auth/user-disabled': {
          setGeneralEmailError(t('accountDisabled'));
          break;
        }
        case 'auth/user-not-found': {
          setEmailError(t('userNotFound' + email));
          break;
        }
        case 'auth/wrong-password': {
          setPasswordError(t('incorrectPassword'));
          break;
        }
        default: {
          setGeneralEmailError(t('common:generalError'));
          break;
        }
      }
      setPassword('');
      setIsLoadingEmail(false);
    }
  }

  return (
    <>
      <Heading textAlign="center">{t('pageHeader.signIn')}</Heading>
      <form
        onSubmit={event => {
          signInWithGoogle(event, setGoogleError, setIsLoadingGoogle, t);
        }}
      >
        <SubmitButton
          color={'blue'}
          label={t('signIn.google')}
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
          label={t('signIn.email')}
          error={generalEmailError}
          isLoading={isLoadingEmail}
        ></SubmitButton>
      </form>
      <ForgotPasswordModal />
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
