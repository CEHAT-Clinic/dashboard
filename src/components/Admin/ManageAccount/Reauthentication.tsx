import {
  Box,
  Text,
  Heading,
  Button,
  Divider,
  CircularProgress,
} from '@chakra-ui/react';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import firebase, {firebaseAuth} from '../../../firebase/firebase';
import {PasswordFormInput} from '../ComponentUtil';

/**
 * Props for ReauthenticationProps component. Used for type safety.
 * - `passwordUser` - whether or not the user is password-based
 * - `googleUser` - whether or not a Google account is connected to the user
 * - `reauthenticated` - whether or not a user has been reauthenticated
 * - `setReauthenticated` - state setter for `reauthenticated`
 */
interface ReauthenticationProps {
  passwordUser: boolean;
  googleUser: boolean;
  reauthenticated: boolean;
  setReauthenticated: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * Creates a component for a user for reauthentication. This is used before
 * security sensitive operations such as password updates or account deletion.
 * @param passwordUser - whether or not the user is password-based
 * @param googleUser - whether or not a Google account is connected to the user
 * @param reauthenticated - whether or not a user has been reauthenticated
 * @param setReauthenticated - state setter for `reauthenticated`
 * @returns depending if the user is password-based or Google-based, either a password field input or a button to click that creates a popup to sign in with Google
 */
const Reauthentication: ({
  passwordUser,
  googleUser,
  reauthenticated,
  setReauthenticated,
}: ReauthenticationProps) => JSX.Element = ({
  passwordUser,
  googleUser,
  reauthenticated,
  setReauthenticated,
}: ReauthenticationProps) => {
  // Current password state variables
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordIsLoading, setPasswordIsLoading] = useState(false);

  const [googleError, setGoogleError] = useState('');
  const [googleIsLoading, setGoogleIsLoading] = useState(false);

  const {t} = useTranslation(['administration', 'common']);

  /**
   * Handles reauthentication of a password-based user before account update
   * operations.
   * @param event - click button event
   * @returns error message or empty string if no error
   */
  function handleReauthenticationWithPassword(
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): Promise<void> {
    event.preventDefault();
    setPasswordIsLoading(true);

    if (!firebaseAuth.currentUser) throw new Error('No user');
    if (!firebaseAuth.currentUser.email) throw new Error(t('No user email'));

    const credential = firebase.auth.EmailAuthProvider.credential(
      firebaseAuth.currentUser.email,
      password
    );

    return firebaseAuth.currentUser
      .reauthenticateWithCredential(credential)
      .then(() => setReauthenticated(true))
      .catch(error => {
        // Error codes from Firebase documentation
        if (error.code === 'auth/wrong-password') {
          setPasswordError(t('incorrectPassword'));
        } else {
          setPasswordError(t('unknownError') + error.message);
        }
        setPasswordIsLoading(false);
      });
  }

  /**
   * Handles reauthenticating a user with Google by creating a popup to sign in
   * with Google
   * @param event - click button event
   * @returns a promise that when resolved sets a user's reauthenticated status to true
   */
  function handleReauthenticateWithGoogle(
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): Promise<void> {
    event.preventDefault();
    setGoogleIsLoading(true);

    return firebaseAuth
      .signInWithPopup(new firebase.auth.GoogleAuthProvider())
      .then(() => setReauthenticated(true))
      .catch(error => {
        // Error codes from Firebase documentation
        switch (error.code) {
          case 'auth/cancelled-popup-request': {
            // No error
            break;
          }
          case 'auth/popup-closed-by-user': {
            // No error
            break;
          }
          case 'auth/popup-blocked': {
            setGoogleError(t('popUpsBlocked'));
            break;
          }
          default: {
            setGoogleError(t('common:error'));
            break;
          }
        }
        setGoogleIsLoading(false);
      });
  }

  return (
    <Box>
      <Heading fontSize="lg">{t('reauthenticate.heading')}</Heading>
      <Text marginY={2}>{t('reauthenticate.explanation')}</Text>
      {passwordUser && googleUser && (
        <Text marginY={2}>{t('reauthenticate.choose')}</Text>
      )}
      {passwordUser && (
        <Box>
          <PasswordFormInput
            value={password}
            showPassword={passwordVisible}
            handlePasswordVisibility={() => {
              setPasswordVisible(!passwordVisible);
            }}
            handlePasswordChange={event => {
              setPassword(event.target.value);
              setPasswordError('');
            }}
            error={passwordError}
          />
          <Button
            onClick={handleReauthenticationWithPassword}
            colorScheme="teal"
          >
            {passwordIsLoading ? (
              <CircularProgress isIndeterminate size="24px" color="teal" />
            ) : (
              t('common:submit')
            )}
          </Button>
          {passwordUser && googleUser && <Divider />}
          <Button onClick={handleReauthenticateWithGoogle} colorScheme="red">
            {googleIsLoading ? (
              <CircularProgress isIndeterminate size="24px" color="red" />
            ) : (
              t('signIn.google')
            )}
          </Button>
          <Text textColor="red.500">{googleError}</Text>
        </Box>
      )}
    </Box>
  );
};

export {Reauthentication};
