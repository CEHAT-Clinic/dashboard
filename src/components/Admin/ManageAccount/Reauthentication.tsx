import {
  Box,
  Text,
  Heading,
  Button,
  Divider,
  CircularProgress,
  Center,
} from '@chakra-ui/react';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import firebase, {firebaseAuth} from '../../../firebase/firebase';
import {PasswordFormInput} from '../ComponentUtil';
import {useAuth} from '../../../contexts/AuthContext';

/**
 * Props for ReauthenticationProps component. Used for type safety.
 * - `reauthenticated` - if a user has been reauthenticated
 * - `setReauthenticated` - state setter for `reauthenticated`
 */
interface ReauthenticationProps {
  reauthenticated: boolean;
  setReauthenticated: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * Creates a component for a user for reauthentication. This is used before
 * security sensitive operations such as password updates or account deletion.
 * @param reauthenticated - if a user has been reauthenticated
 * @param setReauthenticated - state setter for `reauthenticated`
 * @returns depending if the user is password-based or Google-based, either a password field input or a button to click that creates a popup to sign in with Google
 *
 * @remarks Use this as a standalone component before any account update operations. Create a state variable for `reauthenticated` and don't let a user submit any changes to their account until `reauthenticated` has been set to `true` by this component.
 *
 * @example
 * ```
 * <Reauthenticated
 *   reauthenticated={reauthenticated}
 *   setReauthenticated={setReauthenticated}
 * />
 * ```
 */
const Reauthentication: ({
  reauthenticated,
  setReauthenticated,
}: ReauthenticationProps) => JSX.Element = ({
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
  const {passwordUser, googleUser} = useAuth();

  /**
   * Handles reauthentication of a password-based user before account update
   * operations.
   * @param event - submit form event
   * @returns error message or empty string if no error
   */
  function handleReauthenticationWithPassword(
    event: React.FormEvent<HTMLFormElement>
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
      {reauthenticated ? (
        <Text>{t('reauthenticate.success')}</Text>
      ) : (
        <Box>
          <Text marginY={2}>{t('reauthenticate.explanation')}</Text>
          {passwordUser && googleUser && (
            <Text marginY={2}>{t('reauthenticate.choose')}</Text>
          )}
          {passwordUser && (
            <Box>
              <form onSubmit={handleReauthenticationWithPassword}>
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
                <Center>
                  <Button type="submit" colorScheme="teal">
                    {passwordIsLoading ? (
                      <CircularProgress
                        isIndeterminate
                        size="24px"
                        color="teal"
                      />
                    ) : (
                      t('common:submit')
                    )}
                  </Button>
                </Center>
              </form>
            </Box>
          )}
          {passwordUser && googleUser && <Divider marginY={4} />}
          {googleUser && (
            <Center>
              <Button
                onClick={handleReauthenticateWithGoogle}
                colorScheme="red"
              >
                {googleIsLoading ? (
                  <CircularProgress isIndeterminate size="24px" color="red" />
                ) : (
                  t('signIn.google')
                )}
              </Button>
            </Center>
          )}
          <Text textColor="red.500">{googleError}</Text>
        </Box>
      )}
    </Box>
  );
};

export {Reauthentication};
