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
import {useTranslation} from 'react-i18next';

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
  // --------------- State maintenance variables ------------------------
  const {isOpen, onOpen, onClose} = useDisclosure();
  const [modalEmail, setModalEmail] = useState('');
  const [modalError, setModalError] = useState('');
  const [modalIsLoading, setModalIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  // --------------- End state maintenance variables ------------------------

  const {t} = useTranslation(['administration', 'common']);

  /**
   * Resets modal state values before closing the modal.
   */
  function handleClose() {
    setModalEmail('');
    setModalError('');
    setModalIsLoading(false);
    setEmailSent(false);
    onClose();
  }

  /**
   * Sends a user a password reset email using Firebase authentication
   * @param event - submit form event
   *
   * @remarks
   *
   * If a user created their account through Google authentication, they can
   * still "reset" their password. If they reset their password through the email
   * sent, then this will create a password and the user will be able to sign in
   * via Google authentication or email/password authentication in the future.
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
          setModalError('Email address is not valid');
          break;
        }
        case 'auth/user-not-found': {
          setModalError(t('userNotFound') + modalEmail);
          break;
        }
        default: {
          setModalError(t('emailSendFailure'));
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
        {t('passwordModalLaunch.forgot.text')}
        <Link color="teal.500" onClick={onOpen}>
          {t('passwordModalLaunch.forgot.link')}
        </Link>
      </Text>
      <Modal isOpen={isOpen} onClose={handleClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t('passwordModalHeader.forgot')}</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handlePasswordReset}>
            {emailSent ? (
              <Flex alignItems="center" justifyContent="center" marginTop="1em">
                <CheckCircleIcon color="green.500" />
                <Text fontSize="lg">{t('passwordModalSuccess.forgot')}</Text>
              </Flex>
            ) : (
              <ModalBody>
                <EmailFormInput
                  handleEmailChange={event => {
                    setModalEmail(event.target.value);
                    setModalError('');
                  }}
                  error={modalError}
                  value={modalEmail}
                />
              </ModalBody>
            )}
            <ModalFooter>
              {!emailSent && (
                <SubmitButton
                  label={t('passwordSubmitLabel.forgot')}
                  isLoading={modalIsLoading}
                />
              )}
              <Button colorScheme="red" margin={4} onClick={handleClose}>
                {t('common:close')}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default ForgotPasswordModal;
