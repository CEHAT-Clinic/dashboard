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
import {PasswordFormInput, SubmitButton} from '../ComponentUtil';
import {firestore, firebaseAuth} from '../../../firebase';
import {useTranslation} from 'react-i18next';
import {handleReauthenticationWithPassword} from './Util';

/**
 * Props for ChangeNameModal component. Used for type safety.
 */
interface ChangeNameModalProps {
  passwordUser: boolean;
}

/**
 * Component for changing an authenticated user's name. Includes button that
 * opens modal to update (or set for the first time) the user's name.
 * @param props - passwordUser
 * - `passwordUser`: if user uses a password for authentication, used to
 *                   reauthenticate if necessary before updating the user's name
 */
const ChangeNameModal: ({
  passwordUser,
}: ChangeNameModalProps) => JSX.Element = ({
  passwordUser,
}: ChangeNameModalProps) => {
  // --------------- State maintenance variables ------------------------
  const {isOpen, onOpen, onClose} = useDisclosure();

  // Current password state variables
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);

  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');
  const [modalIsLoading, setModalIsLoading] = useState(false);
  const [nameChangeComplete, setNameChangeComplete] = useState(false);
  // --------------- End state maintenance variables ------------------------

  const {t} = useTranslation(['administration', 'common']);

  /**
   * Resets modal state values before closing the modal.
   */
  function handleClose() {
    setPassword('');
    setPasswordError('');
    setPasswordVisible(false);
    setNewName('');
    setError('');
    setModalIsLoading(false);
    setNameChangeComplete(false);
    onClose();
  }

  /**
   * Updates an authenticated user using Firebase authentication
   * @param event - submit form event
   */
  function handleDisplayNameUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setModalIsLoading(true);

    /**
     * Updates the user's name in Firebase and in their Firestore user doc
     */
    function updateName(): void {
      if (firebaseAuth.currentUser) {
        const user = firebaseAuth.currentUser;
        // Update Firebase account
        user
          .updateProfile({
            displayName: newName,
          })
          .then(() => {
            // Update Firestore user document
            // Any errors are caught by the following catch statement
            firestore
              .collection('users')
              .doc(user.uid)
              .update({
                name: newName,
              })
              .then(() => setNameChangeComplete(true));
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
            updateName();
          }
        })
        .catch(error => {
          // Propagate the error, since this error cannot be handled by the user
          throw new Error(error);
        });
    } else {
      // If user is not a password-based user, proceed with updating the name
      updateName();
    }
  }

  return (
    <Box marginY={2}>
      <Button colorScheme="teal" onClick={onOpen} minWidth="50%">
        {t('nameModal.header')}
      </Button>
      <Modal isOpen={isOpen} onClose={handleClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t('nameModal.header')}</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleDisplayNameUpdate}>
            {nameChangeComplete ? (
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
                        setNewName(event.target.value);
                        setError('');
                      }}
                      value={newName}
                    />
                    <FormErrorMessage>{error}</FormErrorMessage>
                    <FormHelperText>
                      {t('nameModal.formHelperMessage')}
                    </FormHelperText>
                  </FormControl>
                </Box>
              </ModalBody>
            )}
            <ModalFooter justifyContent="center">
              {!nameChangeComplete && (
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

export default ChangeNameModal;
