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
import {SubmitButton} from '../ComponentUtil';
import {firestore, firebaseAuth} from '../../../firebase/firebase';
import {useTranslation} from 'react-i18next';
import {Reauthentication} from './Reauthentication';

/**
 * Props for ChangeNameModal component.
 * - `passwordUser` - if the user uses a password for authentication
 * - `googleUser` - if the user's account is connected to Google
 */
interface ChangeNameModalProps {
  passwordUser: boolean;
  googleUser: boolean;
}

/**
 * Component for changing an authenticated user's name. Includes button that
 * opens modal to update (or set for the first time) the user's name.
 * @param passwordUser - if the user uses a password for authentication
 * @param googleUser - if the user's account is connected to Google
 */
const ChangeNameModal: ({
  passwordUser,
  googleUser,
}: ChangeNameModalProps) => JSX.Element = ({
  passwordUser,
  googleUser,
}: ChangeNameModalProps) => {
  // --------------- State maintenance variables ------------------------
  const {isOpen, onOpen, onClose} = useDisclosure();

  const [reauthenticated, setReauthenticated] = useState(false);
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');
  const [modalIsLoading, setModalIsLoading] = useState(false);
  const [nameChangeComplete, setNameChangeComplete] = useState(false);
  // --------------- End state maintenance variables ------------------------

  const readyToSubmit = reauthenticated && error === '' && newName !== '';

  const {t} = useTranslation(['administration', 'common']);

  /**
   * Resets modal state values before closing the modal.
   */
  function handleClose() {
    setReauthenticated(false);
    setNewName('');
    setError('');
    setModalIsLoading(false);
    setNameChangeComplete(false);
    onClose();
  }

  /**
   * Updates a user's name in Firebase Authentication
   * @returns a promise that when resolved updates a user's name in Firebase Authentication
   */
  function updateFirebaseAuth(): Promise<void> {
    if (firebaseAuth.currentUser) {
      return firebaseAuth.currentUser.updateProfile({
        displayName: newName,
      });
    } else {
      return firebaseAuth.signOut();
    }
  }

  /**
   * Updates a user's name in their user doc
   * @returns a promise that when resolved updates a user's name in their user doc
   */
  function updateUserDoc(): Promise<void> {
    if (firebaseAuth.currentUser) {
      return firestore
        .collection('users')
        .doc(firebaseAuth.currentUser.uid)
        .update({
          name: newName,
        });
    } else {
      return firebaseAuth.signOut();
    }
  }

  /**
   * Updates a user's name in Firebase Authentication and their user doc
   * @param event - submit form event
   * @returns a promise that when resolved means a user's name has been updated in their user doc and in Firebase Authentication
   */
  function handleDisplayNameUpdate(
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> {
    event.preventDefault();
    setModalIsLoading(true);

    return updateFirebaseAuth()
      .then(updateUserDoc)
      .then(() => setNameChangeComplete(true))
      .catch(error => {
        setError(t('common:generalErrorTemplate') + error.message);
      })
      .finally(() => setModalIsLoading(false));
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
          <ModalBody>
            {nameChangeComplete ? (
              <Flex alignItems="center" justifyContent="center" marginTop="1em">
                <CheckCircleIcon color="green.500" />
                <Text fontSize="lg">{t('nameModal.success')}</Text>
              </Flex>
            ) : (
              <Box>
                <Reauthentication
                  setReauthenticated={setReauthenticated}
                  reauthenticated={reauthenticated}
                  googleUser={googleUser}
                  passwordUser={passwordUser}
                />
                <form onSubmit={handleDisplayNameUpdate}>
                  <Box marginY={1}>
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
                    <SubmitButton
                      label={t('nameModal.submitButton')}
                      isLoading={modalIsLoading}
                      error={error}
                      isDisabled={!readyToSubmit}
                    />
                  </Box>
                </form>
              </Box>
            )}
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

export default ChangeNameModal;
