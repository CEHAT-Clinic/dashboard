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
import {
  handleReauthenticationWithPassword,
  PasswordFormInput,
  SubmitButton,
} from './Util';
import {firebaseAuth} from '../../../firebase';

/**
 * Component for changing an authenticated user's password. Includes button that
 * opens modal to update the user's password.
 */
function ChangePasswordModal(): JSX.Element {
  const {isOpen, onOpen, onClose} = useDisclosure();

  const [currentPassword, setCurrentPassword] = useState('');
  const [currentPasswordError, setCurrentPasswordError] = useState('');
  const [currentPasswordVisible, setCurrentPasswordVisible] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [newPasswordVisible, setNewPasswordVisible] = useState(false);

  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [confirmNewPasswordError, setConfirmNewPasswordError] = useState('');
  const [confirmNewPasswordVisible, setConfirmNewPasswordVisible] = useState(
    false
  );

  const [generalModalError, setGeneralModalError] = useState('');
  const [modalIsLoading, setModalIsLoading] = useState(false);
  const [passwordResetComplete, setPasswordResetComplete] = useState(false);

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
  async function handlePasswordUpdate(event: React.FormEvent<HTMLFormElement>) {
    // Prevents submission before call to Firebase is complete
    event.preventDefault();

    setModalIsLoading(true);
    if (!firebaseAuth.currentUser) throw Error('User undefined');

    if (newPassword !== confirmNewPassword) {
      setConfirmNewPasswordError('Passwords do not match');
      setModalIsLoading(false);
    } else {
      try {
        await handleReauthenticationWithPassword(currentPassword);
        await firebaseAuth.currentUser.updatePassword(newPassword);
        resetFormFields();
        resetErrors();
        setPasswordResetComplete(true);
      } catch (error) {
        // Error codes from Firebase documentation
        const fatalErrors = [
          'auth/user-mismatch',
          'auth/user-not-found',
          'auth/invalid-credential',
          'auth/invalid-email',
          'auth/requires-recent-login',
        ];
        if (fatalErrors.includes(error.code)) firebaseAuth.signOut();

        // Recoverable errors
        switch (error.code) {
          // Error from reauthentication
          case 'auth/wrong-password': {
            setCurrentPasswordError(
              'Wrong current password. Please try again.'
            );
            break;
          }
          // Error from password reset
          case 'auth/weak-password': {
            setNewPasswordError(
              'Password is not strong enough. ' +
                'Please enter a password longer than six characters'
            );
            break;
          }
          default: {
            setGeneralModalError(
              'Error occurred when trying to update password. Please try again'
            );
            break;
          }
        }
      }
      resetFormFields();
      setModalIsLoading(false);
    }
  }

  return (
    <Box>
      <Button colorScheme="teal" onClick={onOpen}>
        Update your password
      </Button>
      <Modal isOpen={isOpen} onClose={handleClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Update Password</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handlePasswordUpdate}>
            {passwordResetComplete ? (
              <Flex alignItems="center" justifyContent="center" marginTop="1em">
                <CheckCircleIcon color="green.500" />
                <Text fontSize="lg">Password updated</Text>
              </Flex>
            ) : (
              <ModalBody>
                <PasswordFormInput
                  label="Current Password"
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
                  label="New Password"
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
                  label="Confirm New Password"
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
                  label="Update password"
                  isLoading={modalIsLoading}
                  error={generalModalError}
                />
              )}
              <Button
                colorScheme="red"
                marginLeft={4}
                marginTop={4}
                onClick={handleClose}
              >
                Close
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default ChangePasswordModal;
