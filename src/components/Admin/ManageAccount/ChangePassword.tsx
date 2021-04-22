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
  Flex,
} from '@chakra-ui/react';
import {CheckCircleIcon} from '@chakra-ui/icons';
import {PasswordFormInput, SubmitButton} from '../ComponentUtil';
import {firebaseAuth} from '../../../firebase/firebase';
import {useTranslation} from 'react-i18next';
import {handleReauthenticationWithPassword} from './Util';

/**
 * Component for changing an authenticated user's password. Includes button that
 * opens modal to update the user's password.
 */
function ChangePasswordModal(): JSX.Element {
  // --------------- State maintenance variables ------------------------
  const {isOpen, onOpen, onClose} = useDisclosure();

  // Current password state variables
  const [currentPassword, setCurrentPassword] = useState('');
  const [currentPasswordError, setCurrentPasswordError] = useState('');
  const [currentPasswordVisible, setCurrentPasswordVisible] = useState(false);

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
  const [generalModalError, setGeneralModalError] = useState('');
  const [modalIsLoading, setModalIsLoading] = useState(false);
  const [passwordResetComplete, setPasswordResetComplete] = useState(false);
  // --------------- End state maintenance variables ------------------------

  const {t} = useTranslation(['administration', 'common']);

  /**
   * Resets modal state values before closing the modal.
   */
  function handleClose() {
    resetErrors();
    resetFormFields();
    setModalIsLoading(false);
    setPasswordResetComplete(false);
    onClose();
  }

  /**
   * Resets all form fields and visibility to default values
   */
  function resetFormFields() {
    setCurrentPassword('');
    setCurrentPasswordVisible(false);

    setNewPassword('');
    setNewPasswordVisible(false);

    setConfirmNewPassword('');
    setConfirmNewPasswordVisible(false);
  }

  /**
   * Resets all possible errors to no error.
   */
  function resetErrors() {
    setCurrentPasswordError('');
    setNewPasswordError('');
    setConfirmNewPasswordError('');
    setGeneralModalError('');
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

    setModalIsLoading(true);
    if (!firebaseAuth.currentUser) throw Error(t('userUndefined'));

    if (newPassword !== confirmNewPassword) {
      setConfirmNewPasswordError(t('passwordMismatch'));
      setModalIsLoading(false);
      return Promise.resolve();
    } else {
      return handleReauthenticationWithPassword(currentPassword, t).then(
        error => {
          if (error) {
            setCurrentPasswordError(error);
            return Promise.resolve();
          } else {
            if (!firebaseAuth.currentUser) throw Error(t('userUndefined'));
            // Now that user is successfully reauthenticated, attempt to update password
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
                    setGeneralModalError(t('unknownError') + error.message);
                    break;
                  }
                }
                resetFormFields();
                setModalIsLoading(false);
              });
          }
        }
      );
    }
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
          <form onSubmit={handlePasswordUpdate}>
            {passwordResetComplete ? (
              <Flex alignItems="center" justifyContent="center" marginTop="1em">
                <CheckCircleIcon color="green.500" />
                <Text fontSize="lg">{t('passwordModalSuccess.change')}</Text>
              </Flex>
            ) : (
              <ModalBody>
                <PasswordFormInput
                  label={t('currentPassword')}
                  handlePasswordChange={event => {
                    setCurrentPassword(event.target.value);
                    resetErrors();
                  }}
                  showPassword={currentPasswordVisible}
                  handlePasswordVisibility={() => {
                    setCurrentPasswordVisible(!currentPasswordVisible);
                  }}
                  error={currentPasswordError}
                  value={currentPassword}
                />
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
              </ModalBody>
            )}
            <ModalFooter>
              {!passwordResetComplete && (
                <SubmitButton
                  label={t('passwordSubmitLabel.change')}
                  isLoading={modalIsLoading}
                  error={generalModalError}
                />
              )}
              <Button colorScheme="red" marginLeft={4} onClick={handleClose}>
                {t('common:close')}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default ChangePasswordModal;
