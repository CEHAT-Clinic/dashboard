import React, {useState, useEffect} from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Button,
  Box,
  FormControl,
  FormLabel,
  Input,
  Text,
} from '@chakra-ui/react';
import {SubmitButton} from '../ComponentUtil';
import {firestore, firebaseAuth} from '../../../firebase/firebase';
import {useTranslation} from 'react-i18next';
import {Reauthentication} from './Reauthentication';
import {useAuth} from '../../../contexts/AuthContext';

/**
 * Component for changing an authenticated user's email. Includes button that
 * opens modal to update the user's email.
 */
const ChangeEmailModal: () => JSX.Element = () => {
  // --------------- State maintenance variables ------------------------
  const {isOpen, onOpen, onClose} = useDisclosure();

  const [newEmail, setNewEmail] = useState('');
  const [error, setError] = useState('');
  const [modalIsLoading, setModalIsLoading] = useState(false);
  const [reauthenticated, setReauthenticated] = useState(false);
  // --------------- End state maintenance variables ------------------------

  const {t} = useTranslation(['administration', 'common']);

  // If a user is not a password user or is a Google user, they cannot change
  // their email without first adding a password or unlinking their account from
  // Google, respectively.
  const {passwordUser, googleUser, email} = useAuth();

  const readyToSubmit =
    error === '' && newEmail !== '' && reauthenticated && email !== newEmail;
  const sameEmail = email === newEmail;

  useEffect(() => {
    if (sameEmail) {
      setError('You entered the same email as your current email');
    }
  }, [sameEmail]);

  /**
   * Resets modal state values before closing the modal.
   */
  function handleClose(): void {
    setNewEmail('');
    setError('');
    setModalIsLoading(false);
    setReauthenticated(false);
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
   * @param event - submit form event
   */
  function updateEmail(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    return updateEmailInFirebase()
      .then(updateUserDoc)
      .catch(error => {
        if (error.code === 'auth/email-already-in-use') {
          setError('accountExists');
        }
        setError(t('common:generalErrorTemplate') + error.message);
      });
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
          <ModalBody>
            {passwordUser && !googleUser ? (
              <Box marginY={1}>
                <Reauthentication
                  reauthenticated={reauthenticated}
                  setReauthenticated={setReauthenticated}
                />
                <form onSubmit={updateEmail}>
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
                  </FormControl>
                  <SubmitButton
                    label={t('common:submit')}
                    isLoading={modalIsLoading}
                    error={error}
                    isDisabled={!readyToSubmit}
                  />
                </form>
              </Box>
            ) : (
              <Text>{t('emailModal.addPassword')}</Text>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ChangeEmailModal;
