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
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  FormHelperText,
} from '@chakra-ui/react';
import {CheckCircleIcon} from '@chakra-ui/icons';
import {
  handleReauthenticationWithPassword,
  PasswordFormInput,
  SubmitButton,
} from './Util';
import {firestore, firebaseAuth} from '../../../firebase';
import {useTranslation} from 'react-i18next';

/**
 * Props for ChangeEmailModal component. Used for type safety.
 */
interface ChangeEmailModalProps {
  passwordUser: boolean;
}

/**
 * Component for changing an authenticated user's email. Includes button that
 * opens modal to update the user's email.
 * @param props - passwordUser
 * - `passwordUser`: if user uses a password for authentication, used to
 *                   reauthenticate if necessary before updating the user's email
 */
const ChangeEmailModal: ({
  passwordUser,
}: ChangeEmailModalProps) => JSX.Element = ({
  passwordUser,
}: ChangeEmailModalProps) => {
  // --------------- State maintenance variables ------------------------
  const {isOpen, onOpen, onClose} = useDisclosure();

  // Current password state variables
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);

  const [newEmail, setNewEmail] = useState('');
  const [error, setError] = useState('');
  const [modalIsLoading, setModalIsLoading] = useState(false);
  const [emailChangeComplete, setEmailChangeComplete] = useState(false);
  // --------------- End state maintenance variables ------------------------

  // TODO: add translations for email modal
  const {t} = useTranslation(['administration', 'common']);

  /**
   * Resets modal state values before closing the modal.
   */
  function handleClose() {
    setPassword('');
    setPasswordError('');
    setPasswordVisible(false);
    setNewEmail('');
    setError('');
    setModalIsLoading(false);
    setEmailChangeComplete(false);
    onClose();
  }

  /**
   * Updates an authenticated user using Firebase authentication
   * @param event - submit form event
   */
  function handleEmailUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setModalIsLoading(true);

    /**
     * Updates the user's email in Firebase and in their Firestore user doc
     */
    function updateEmail(): void {
      if (firebaseAuth.currentUser) {
        const user = firebaseAuth.currentUser;
        // Update Firebase account
        user
          .updateEmail(newEmail)
          .then(() => {
            // Update Firestore user document
            // Any errors are caught by the following catch statement
            firestore
              .collection('users')
              .doc(user.uid)
              .update({
                email: newEmail,
              })
              .then(() => setEmailChangeComplete(true));
          })
          .catch(error =>
            setError(t('common:generalErrorTemplate') + error.message)
          )
          .finally(() => {
            setModalIsLoading(false);
          });
      }
    }

    // Verify that the inputted password is correct before proceeding
    if (passwordUser) {
      handleReauthenticationWithPassword(password, t)
        .then(error => {
          if (error) {
            // This error can be handled by the user
            setPasswordError(error);
            setModalIsLoading(false);
          } else {
            // No error, so proceed with name update
            updateEmail();
          }
        })
        .catch(error => {
          // Propagate the error, since this error cannot be handled by the user
          throw new Error(error);
        });
    } else {
      // If user is not a password-based user, proceed with updating the name
      updateEmail();
    }
  }

  return (
    <Box marginY={2}>
      <Button colorScheme="teal" onClick={onOpen} minWidth="50%">
        {t('nameModal.launchButton')}
      </Button>
      <Modal isOpen={isOpen} onClose={handleClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t('nameModal.header')}</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleEmailUpdate}>
            {emailChangeComplete ? (
              <Flex alignItems="center" justifyContent="center" marginTop="1em">
                <CheckCircleIcon color="green.500" />
                <Text fontSize="lg">{t('nameModal.success')}</Text>
              </Flex>
            ) : (
              <ModalBody>
                <Box marginY={1}>
                  {passwordUser && (
                    <PasswordFormInput
                      label={t('password')}
                      handlePasswordChange={event => {
                        setPassword(event.target.value);
                        setError('');
                        setPasswordError('');
                      }}
                      showPassword={passwordVisible}
                      handlePasswordVisibility={() => {
                        setPasswordVisible(!passwordVisible);
                      }}
                      error={passwordError}
                      value={password}
                      helpMessage={t('passwordHelpMessage')}
                    />
                  )}
                  <FormControl
                    isRequired
                    marginTop={4}
                    isInvalid={error !== ''}
                  >
                    <FormLabel>{t('name')}</FormLabel>
                    <Input
                      type="text"
                      placeholder="Bob"
                      size="md"
                      onChange={event => {
                        setNewEmail(event.target.value);
                        setError('');
                      }}
                      value={newEmail}
                    />
                    <FormErrorMessage>{error}</FormErrorMessage>
                    <FormHelperText>
                      {t('nameModal.formHelperMessage')}
                    </FormHelperText>
                  </FormControl>
                </Box>
              </ModalBody>
            )}
            <ModalFooter>
              {!emailChangeComplete && (
                <SubmitButton
                  label={t('nameModal.submitButton')}
                  isLoading={modalIsLoading}
                  error={error}
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
};

export default ChangeEmailModal;
