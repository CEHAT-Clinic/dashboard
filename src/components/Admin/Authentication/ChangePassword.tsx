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
import {PasswordFormInput, PasswordInputState, SubmitButton} from './Util';
import {useAuth} from '../../../contexts/AuthContext';

/**
 * Component for changing an authenticated user's password. Includes button that
 * opens modal to update the user's password.
 */
function ChangePasswordModal(): JSX.Element {
  const {isOpen, onOpen, onClose} = useDisclosure();
  const {user} = useAuth();

  const [currentPasswordState, setCurrentPasswordState] = useState<PasswordInputState>({
    password: '',
    visible: false,
    error: ''
  });
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [newPasswordVisible, setModalPasswordVisible] = useState(false);

  const [modalConfirmPassword, setModalConfirmPassword] = useState('');
  const [modalConfirmPasswordError, setModalConfirmPasswordError] = useState(
    ''
  );
  const [
    modalConfirmPasswordVisible,
    setModalConfirmPasswordVisible,
  ] = useState(false);

  const [generalModalError, setGeneralModalError] = useState('');
  const [modalIsLoading, setModalIsLoading] = useState(false);
  const [passwordResetComplete, setPasswordResetComplete] = useState(false);

  /**
   * Resets modal state values before closing the modal.
   */
  function handleClose() {
    setNewPassword('');
    setNewPasswordError('');
    setModalConfirmPassword('');
    setModalConfirmPasswordError('');
    setGeneralModalError('');
    setModalIsLoading(false);
    setPasswordResetComplete(false);
    onClose();
  }

  /**
   * Updates an authenticated user using Firebase authentication
   * @param event - submit form event
   */
  async function handlePasswordUpdate(event: React.FormEvent<HTMLFormElement>) {
    // Prevents submission before call to Firebase is complete
    event.preventDefault();

    setModalIsLoading(true);
    if (user) {
      if (newPassword === modalConfirmPassword) {
      try {
        await user.updatePassword('');
        setNewPassword('');
        setModalConfirmPassword('');
        setPasswordResetComplete(true);
      } catch (error) {
        // Error codes from Firebase documentation
        switch (error.code) {
          case 'auth/weak-password': {
            setNewPasswordError('Password is not strong enough. Please enter a password longer than six characters');
            break;
          }
          case 'auth/requires-recent-login': {
            // TODO: recertify code needed
            break;
          }
          default: {
            setGeneralModalError(
              'Error occurred when trying to update password. Please try again'
            );
            break;
          }
        }
      } finally {
        setModalIsLoading(false);
      }
    } else {
      setModalConfirmPasswordError('Passwords do not match');
      setModalIsLoading(false);
    }
    } else {
      throw Error('User was undefined');
    }
  }

  return (
    <Box>
      <Button color="teal.500" onClick={onOpen}>
        Update your password
      </Button>
      <Modal isOpen={isOpen} onClose={handleClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Send Password Reset Email</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handlePasswordUpdate}>
            {passwordResetComplete ? (
              <Flex alignItems="center" justifyContent="center" marginTop="1em">
                <CheckCircleIcon color="green.500" />
                <Text fontSize="lg">Password reset email sent</Text>
              </Flex>
            ) : (
              <ModalBody>
                <PasswordFormInput
                  label="New Password"
                  handlePasswordChange={event => {
                    setNewPassword(event.target.value);
                    setNewPasswordError('');
                    setModalConfirmPasswordError('');
                    setGeneralModalError('');
                  }}
                  handlePasswordVisibility={() =>
                    setModalPasswordVisible(!newPasswordVisible)
                  }
                  error={newPasswordError}
                  value={newPassword}
                />
                <PasswordFormInput
                  label="Confirm New Password"
                  handlePasswordChange={event => {
                    setModalConfirmPassword(event.target.value);
                    setNewPasswordError('');
                    setModalConfirmPasswordError('');
                    setGeneralModalError('');
                  }}
                  handlePasswordVisibility={() =>
                    setModalConfirmPasswordVisible(!modalConfirmPasswordVisible)
                  }
                  error={modalConfirmPasswordError}
                  value={modalConfirmPassword}
                />
              </ModalBody>
            )}
            <ModalFooter>
              {passwordResetComplete ? (
                <> </>
              ) : (
                <SubmitButton
                  label="Update password"
                  isLoading={modalIsLoading}
                  error={generalModalError}
                />
              )}
              <Button colorScheme="red" margin={4} onClick={handleClose}>
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
