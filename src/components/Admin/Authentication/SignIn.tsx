import React, {useState} from 'react';
import {Text, Heading, Link, Divider} from '@chakra-ui/react';
import {
  SubmitButton,
  EmailFormInput,
  PasswordFormInput,
} from '../ComponentUtil';
import firebase, {firebaseAuth} from '../../../firebase/firebase';
import {UnauthenticatedPageProps} from '../UnauthenticatedAdmin';
import ForgotPasswordModal from './ForgotPassword';
import {useTranslation} from 'react-i18next';
import {signInWithGoogle} from './Util';
import {LinkColor} from '../../Util/Colors';

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
  function handleSignInWithEmail(
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void | firebase.auth.UserCredential> {
    // Prevents submission before call to Firebase is complete
    event.preventDefault();
    setIsLoadingEmail(true);

    return firebaseAuth
      .signInWithEmailAndPassword(email, password)
      .catch(error => {
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
            setEmailError(t('userNotFound') + email);
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
      });
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
        {t('needAccount')}
        <Link color={LinkColor} onClick={() => setIsNewUser(true)}>
          {t('signUpLink')}
        </Link>
      </Text>
    </>
  );
};

export default SignIn;
