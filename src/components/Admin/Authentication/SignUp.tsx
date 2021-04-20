import React, {useState} from 'react';
import {Text, Heading, Link, Divider} from '@chakra-ui/react';
import {
  SubmitButton,
  EmailFormInput,
  PasswordFormInput,
} from '../ComponentUtil';
import {firebaseAuth} from '../../../firebase/firebase';
import {UnauthenticatedPageProps} from '../UnauthenticatedAdmin';
import {useTranslation} from 'react-i18next';
import {signInWithGoogle} from './Util';
import {LinkColor} from '../../Util/Colors';

/**
 * Component to sign up.
 */
const SignUp: ({setIsNewUser}: UnauthenticatedPageProps) => JSX.Element = ({
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

  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const [generalEmailError, setGeneralEmailError] = useState('');
  const [isLoadingEmail, setIsLoadingEmail] = useState(false);
  // -------------- End state maintenance variables -------------------------

  const {t} = useTranslation(['administration', 'common']);

  /**
   * Signs up a user with email in Firebase and handles any errors
   * @param event - submit form event
   */
  function handleSignUpWithEmail(event: React.FormEvent<HTMLFormElement>) {
    // Prevents submission before call to Firebase is complete
    event.preventDefault();

    setIsLoadingEmail(true);
    if (password !== confirmPassword) {
      setConfirmPasswordError(t('passwordMismatch'));
      setPassword('');
      setConfirmPassword('');
      setIsLoadingEmail(false);
    } else {
      firebaseAuth
        .createUserWithEmailAndPassword(email, password)
        .catch(error => {
          // Error codes from Firebase documentation
          switch (error.code) {
            case 'auth/email-already-in-use': {
              setEmailError(t('accountExists'));
              break;
            }
            case 'auth/invalid-email': {
              setEmailError(t('invalidEmail'));
              break;
            }
            case 'auth/weak-password': {
              setPasswordError(t('notStrongEnough'));
              break;
            }
            default: {
              setGeneralEmailError(t('common:generalError'));
              break;
            }
          }
          setPassword('');
          setConfirmPassword('');
          setIsLoadingEmail(false);
        });
    }
  }

  return (
    <>
      <Heading textAlign="center">{t('pageHeader.signUp')}</Heading>
      <form
        onSubmit={event => {
          signInWithGoogle(event, setGoogleError, setIsLoadingGoogle, t);
        }}
      >
        <SubmitButton
          color={'blue'}
          label={t('signUp.google')}
          error={googleError}
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
          label={t('password')}
        ></PasswordFormInput>
        <PasswordFormInput
          label={t('confirmPassword')}
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
          label={t('signUp.email')}
          error={generalEmailError}
          isLoading={isLoadingEmail}
        ></SubmitButton>
      </form>
      <Divider my={4} orientation="horizontal" />
      <Text fontSize="md">
        {t('haveAccount.text')}
        <Link color={LinkColor} onClick={() => setIsNewUser(false)}>
          {t('haveAccount.link')}
        </Link>
      </Text>
    </>
  );
};

export default SignUp;
