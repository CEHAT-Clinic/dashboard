import React, {useState, useEffect} from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Text,
  Button,
  Box,
  Flex,
} from '@chakra-ui/react';
import {CheckCircleIcon} from '@chakra-ui/icons';
import {PasswordFormInput, SubmitButton} from '../ComponentUtil';
import {firebaseAuth} from '../../../firebase/firebase';
import {useTranslation} from 'react-i18next';
import {Reauthentication} from './Reauthentication';

/**
 * Component for changing an authenticated user's password. Includes button that
 * opens modal to update the user's password.
 */
function ChangePasswordModal(): JSX.Element {
  // --------------- State maintenance variables ------------------------
  const {isOpen, onOpen, onClose} = useDisclosure();

  const [reauthenticated, setReauthenticated] = useState(false);

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

  // General state
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordResetComplete, setPasswordResetComplete] = useState(false);
  // --------------- End state maintenance variables ------------------------

  const passwordsMatch = newPassword === confirmNewPassword;
  const readyToSubmit = reauthenticated && passwordsMatch && newPassword !== '';
  const {t} = useTranslation(['administration', 'common']);

  useEffect(() => {
    if (!passwordsMatch) {
      setConfirmNewPasswordError(t('passwordsMismatch'));
    }
  }, [passwordsMatch, t]);

  /**
   * Resets modal state values before closing the modal.
   */
  function handleClose() {
    resetErrors();
    resetFormFields();
    setReauthenticated(false);
    setIsLoading(false);
    setPasswordResetComplete(false);
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

  /**
   * Updates an authenticated user using Firebase authentication
   * @param event - submit form event
   */
  function handlePasswordUpdate(
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> {
    // Prevents submission before call to Firebase is complete
    event.preventDefault();

    setIsLoading(true);
    if (!firebaseAuth.currentUser) throw Error(t('userUndefined'));

    return firebaseAuth.currentUser
      .updatePassword(newPassword)
      .then(() => {
        resetFormFields();
        resetErrors();
        setPasswordResetComplete(true);
      })
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
        resetFormFields();
        setIsLoading(false);
      });
  }

  return (
    <Box marginY={2}>
      <Button colorScheme="teal" onClick={onOpen} minWidth="50%">
        {t('passwordModalLaunch.change')}
      </Button>
      <Modal isOpen={isOpen} onClose={handleClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t('passwordModalHeader.change')}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {passwordResetComplete ? (
              <Flex alignItems="center" justifyContent="center" marginY={2}>
                <CheckCircleIcon color="green.500" />
                <Text marginLeft={2} fontSize="lg">
                  {t('passwordModalSuccess.change')}
                </Text>
              </Flex>
            ) : (
              <Box>
                <Reauthentication
                  setReauthenticated={setReauthenticated}
                  reauthenticated={reauthenticated}
                />
                <form onSubmit={handlePasswordUpdate}>
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
                    label={t('passwordSubmitLabel.change')}
                    isLoading={isLoading}
                    error={error}
                    isDisabled={!readyToSubmit}
                  />
                </form>
              </Box>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default ChangePasswordModal;
