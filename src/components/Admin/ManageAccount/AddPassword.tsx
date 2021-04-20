import React, {useState} from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Text,
  Button,
  Box,
} from '@chakra-ui/react';
import {PasswordFormInput, SubmitButton} from '../ComponentUtil';
import {firebaseAuth} from '../../../firebase/firebase';
import {useTranslation} from 'react-i18next';
import {Reauthentication} from './Reauthentication';

/**
 * Props for AddPasswordModal component.
 * - `passwordUser` - if the user uses a password for authentication
 * - `googleUser` - if the user's account is connected to Google
 */
interface AddPasswordModalProps {
  passwordUser: boolean;
  googleUser: boolean;
}

/**
 * Component for adding a password to a Google based user's account. Includes
 * a button that opens modal to add a password. This component is only for users
 * who are not password-based users.
 */
const AddPasswordModal: ({
  passwordUser,
  googleUser,
}: AddPasswordModalProps) => JSX.Element = ({
  passwordUser,
  googleUser,
}: AddPasswordModalProps) => {
  // --------------- State maintenance variables ------------------------
  const {isOpen, onOpen, onClose} = useDisclosure();

  // New password state
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [newPasswordVisible, setNewPasswordVisible] = useState(false);

  // Confirm new password state
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [confirmNewPasswordError, setConfirmNewPasswordError] = useState('');
  const [confirmNewPasswordVisible, setConfirmNewPasswordVisible] = useState(
    false
  );

  // Reauthentication state
  const [reauthenticated, setReauthenticated] = useState(false);

  // General state
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // --------------- End state maintenance variables ------------------------

  const {t} = useTranslation(['administration', 'common']);

  const cannotSubmitPassword =
    newPassword === '' || error !== '' || !reauthenticated;

  /**
   * Resets modal state values before closing the modal.
   */
  function handleClose() {
    resetErrors();
    resetFormFields();
    setIsLoading(false);
    onClose();
  }

  /**
   * Resets all form fields and visibility to default values
   */
  function resetFormFields() {
    setNewPassword('');
    setNewPasswordVisible(false);

    setConfirmNewPassword('');
    setConfirmNewPasswordVisible(false);
  }

  /**
   * Resets all possible errors to no error.
   */
  function resetErrors() {
    setNewPasswordError('');
    setConfirmNewPasswordError('');
    setError('');
  }

  function addPassword(): Promise<void> {
    if (!firebaseAuth.currentUser) {
      return firebaseAuth.signOut();
    } else {
      return firebaseAuth.currentUser.updatePassword(newPassword);
    }
  }

  /**
   * Adds a password for a user
   * @param event - submit form event
   */
  function handleAddPassword(
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> {
    // Prevents submission before call to Firebase is complete
    event.preventDefault();

    setIsLoading(true);
    if (!firebaseAuth.currentUser) return firebaseAuth.signOut();

    if (newPassword !== confirmNewPassword) {
      setConfirmNewPasswordError(t('passwordMismatch'));
      setIsLoading(false);
      return Promise.resolve();
    } else {
      return addPassword()
        .then(handleClose)
        .catch(error => {
          // Error codes from Firebase documentation
          switch (error.code) {
            case 'auth/weak-password': {
              setNewPasswordError(t('notStrongEnough'));
              break;
            }
            default: {
              setError(t('unknownError') + error.message);
              break;
            }
          }
        })
        .finally(() => {
          resetFormFields();
          setIsLoading(false);
        });
    }
  }

  return (
    <Box marginY={2}>
      <Button colorScheme="teal" onClick={onOpen} minWidth="50%">
        {t('addPassword.heading')}
      </Button>
      <Modal isOpen={isOpen} onClose={handleClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t('addPassword.heading')}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>{t('addPassword.explanation')}</Text>
            <Reauthentication
              googleUser={googleUser}
              passwordUser={passwordUser}
              reauthenticated={reauthenticated}
              setReauthenticated={setReauthenticated}
            />
            <form onSubmit={handleAddPassword}>
              <PasswordFormInput
                label={t('newPassword')}
                handlePasswordChange={event => {
                  setNewPassword(event.target.value);
                  resetErrors();
                }}
                showPassword={newPasswordVisible}
                handlePasswordVisibility={() =>
                  setNewPasswordVisible(!newPasswordVisible)
                }
                error={newPasswordError}
                value={newPassword}
              />
              <PasswordFormInput
                label={t('confirmNewPassword')}
                handlePasswordChange={event => {
                  setConfirmNewPassword(event.target.value);
                  resetErrors();
                }}
                showPassword={confirmNewPasswordVisible}
                handlePasswordVisibility={() =>
                  setConfirmNewPasswordVisible(!confirmNewPasswordVisible)
                }
                error={confirmNewPasswordError}
                value={confirmNewPassword}
              />
              <SubmitButton
                isLoading={isLoading}
                error={error}
                isDisabled={cannotSubmitPassword}
              />
            </form>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="red" marginLeft={4} onClick={handleClose}>
              {t('common:close')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export {AddPasswordModal};
