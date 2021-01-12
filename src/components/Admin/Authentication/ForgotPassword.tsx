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
  Link,
  Button,
  Box,
  Flex,
} from '@chakra-ui/react';
import {CheckCircleIcon} from '@chakra-ui/icons';
import {EmailFormInput, SubmitButton} from './Util';
import {firebaseAuth} from '../../../firebase';

/**
 * Component for users to reset their password by email on the sign in page.
 * Includes text and a link. When link is clicked, the password reset modal
 * pops up.
 *
 * @remarks
 *
 * Since the implementation uses a form, this component should NOT be inside
 * any other component that uses an HTML form tag.
 */
function ForgotPasswordModal(): JSX.Element {
  // State maintenance variables
  const {isOpen, onOpen, onClose} = useDisclosure();
  const [modalEmail, setModalEmail] = useState('');
  const [modalEmailError, setModalEmailError] = useState('');
  const [generalModalError, setGeneralModalError] = useState('');
  const [modalIsLoading, setModalIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  // End state maintenance variables

  /**
   * Resets modal state values before closing the modal.
   */
  function handleClose() {
    setModalEmail('');
    setModalEmailError('');
    setGeneralModalError('');
    setModalIsLoading(false);
    setEmailSent(false);
    onClose();
  }

  /**
   * Sends a user a password reset email using Firebase authentication
   * @param event - submit form event
   */
  async function handlePasswordReset(event: React.FormEvent<HTMLFormElement>) {
    // Prevents submission before call to Firebase is complete
    event.preventDefault();

    setModalIsLoading(true);
    try {
      await firebaseAuth.sendPasswordResetEmail(modalEmail);
      setEmailSent(true);
      setModalEmail('');
    } catch (error) {
      // Error codes from Firebase documentation
      switch (error.code) {
        case 'auth/invalid-email': {
          setModalEmailError('Email address is not valid');
          break;
        }
        case 'auth/user-not-found': {
          setGeneralModalError(`No user found for ${modalEmail}`);
          break;
        }
        default: {
          setGeneralModalError(
            'Error occurred when trying to send email. Please try again'
          );
          break;
        }
      }
    } finally {
      setModalIsLoading(false);
    }
  }

  return (
    <Box>
      <Text>
        Forgot your password?{' '}
        <Link color="teal.500" onClick={onOpen}>
          Reset your password
        </Link>
      </Text>
      <Modal isOpen={isOpen} onClose={handleClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Send Password Reset Email</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handlePasswordReset}>
            {emailSent ? (
              <Flex alignItems="center" justifyContent="center" marginTop="1em">
                <CheckCircleIcon color="green.500" />
                <Text fontSize="lg">Password reset email sent</Text>
              </Flex>
            ) : (
              <ModalBody>
                <EmailFormInput
                  handleEmailChange={event => {
                    setModalEmail(event.target.value);
                    setModalEmailError('');
                    setGeneralModalError('');
                  }}
                  error={modalEmailError}
                  value={modalEmail}
                />
              </ModalBody>
            )}
            <ModalFooter>
              {emailSent ? (
                <> </>
              ) : (
                <SubmitButton
                  label="Send password reset email"
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

export default ForgotPasswordModal;
