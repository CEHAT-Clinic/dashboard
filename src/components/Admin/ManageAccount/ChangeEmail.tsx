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
} from '@chakra-ui/react';
import {CheckCircleIcon} from '@chakra-ui/icons';
import {handleReauthenticationWithPassword} from './Util';
import {PasswordFormInput, SubmitButton} from '../ComponentUtil';
import {firestore, firebaseAuth} from '../../../firebase/firebase';
import {useTranslation} from 'react-i18next';

/**
 * Props for ChangeEmailModal component
 * - `passwordUser` - if the signed in user is a password-based user
 */
interface ChangeEmailModalProps {
  passwordUser: boolean;
}

/**
 * Component for changing an authenticated user's email. Includes button that
 * opens modal to update the user's email.
 * @param passwordUser - if user uses a password for authentication, used to reauthenticate if necessary before updating the user's email
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
   * Updates the user's doc in firestore with their new email
   * @returns A promise that when resolved means that the user doc has been updated with the new email
   */
  function updateUserDoc(): Promise<void> {
    if (firebaseAuth.currentUser) {
      return firestore
        .collection('users')
        .doc(firebaseAuth.currentUser.uid)
        .update({email: newEmail});
    } else {
      return firebaseAuth.signOut();
    }
  }

  /**
   * Updates the user's email in Firebase Authentication
   * @returns A promise that when resolved means that the user email in Firebase Authentication has been updated
   */
  function updateEmailInFirebase(): Promise<void> {
    if (firebaseAuth.currentUser) {
      return firebaseAuth.currentUser.updateEmail(newEmail);
    } else {
      return firebaseAuth.signOut();
    }
  }

  /**
   * Updates the user's email in Firebase and in their Firestore user doc
   */
  function updateEmail(): Promise<void> {
    // TODO: What happens to the user's password?
    // What happens if the user is a Google user only and they update their password?
    return updateEmailInFirebase()
      .then(updateUserDoc)
      .then(() => setEmailChangeComplete(true))
      .catch(error =>
        setError(t('common:generalErrorTemplate') + error.message)
      );
  }

  /**
   * Updates an authenticated user using Firebase authentication
   * @param event - submit form event
   */
  function handleEmailUpdate(
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> {
    event.preventDefault();
    setModalIsLoading(true);

    // Verify that the inputted password is correct before proceeding
    if (passwordUser) {
      return handleReauthenticationWithPassword(password, t)
        .then(error => {
          if (error) {
            // This error can be handled by the user
            setPasswordError(error);
            setModalIsLoading(false);
            return Promise.resolve();
          } else {
            // No error, so proceed with name update
            return updateEmail().finally(() => setModalIsLoading(false));
          }
        })
        .catch(error => {
          // Propagate the error, since this error cannot be handled by the user
          throw new Error(error);
        })
        .finally(() => setModalIsLoading(false));
    } else {
      // If user is not a password-based user, proceed with updating the name
      return updateEmail().finally(() => setModalIsLoading(false));
    }
  }

  return (
    <Box marginY={2}>
      <Button colorScheme="teal" onClick={onOpen} minWidth="50%">
        {t('emailModal.header')}
      </Button>
      <Modal isOpen={isOpen} onClose={handleClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t('emailModal.header')}</ModalHeader>
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
                    <FormLabel>{t('email')}</FormLabel>
                    <Input
                      type="email"
                      placeholder="bob@example.com"
                      size="md"
                      onChange={event => {
                        setNewEmail(event.target.value);
                        setError('');
                      }}
                      value={newEmail}
                    />
                    <FormErrorMessage>{error}</FormErrorMessage>
                  </FormControl>
                </Box>
              </ModalBody>
            )}
            <ModalFooter justifyContent="center">
              {!emailChangeComplete && (
                <SubmitButton
                  label={t('common:submit')}
                  isLoading={modalIsLoading}
                  error={error}
                />
              )}
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ChangeEmailModal;
