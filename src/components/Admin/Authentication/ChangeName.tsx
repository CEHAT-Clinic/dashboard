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
   *
   * @throws No user Thrown if the currentUser is null
   */
  function handleDisplayNameUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setModalIsLoading(true);

    if (!firebaseAuth.currentUser) throw new Error('No user');
    const user = firebaseAuth.currentUser;

    /**
     * Updates the user's name in Firebase and in their Firestore user doc
     */
    function updateName(): void {
      // Update Firebase account
      user
        .updateProfile({
          displayName: newName,
        })
        .then(() => {
          // Update Firestore user document
          firestore
            .collection('users')
            .doc(user.uid)
            .update({
              name: newName,
            })
            .then(() => setNameChangeComplete(true))
            .catch(error => setError(`Error occurred: ${error.message}`));
        })
        .catch(error => setError(`Error occurred: ${error.message}`))
        .finally(() => {
          setModalIsLoading(false);
        });
    }

    // Verify that the inputted password is correct before proceeding
    if (passwordUser) {
      handleReauthenticationWithPassword(password)
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
        Update your name
      </Button>
      <Modal isOpen={isOpen} onClose={handleClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Update Name</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleDisplayNameUpdate}>
            {nameChangeComplete ? (
              <Flex alignItems="center" justifyContent="center" marginTop="1em">
                <CheckCircleIcon color="green.500" />
                <Text fontSize="lg">Name updated</Text>
              </Flex>
            ) : (
              <ModalBody>
                <Box marginY={1}>
                  {passwordUser && (
                    <PasswordFormInput
                      label="Password"
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
                      helpMessage={
                        'Enter your current password before updating your account'
                      }
                    />
                  )}
                  <FormControl
                    isRequired
                    marginTop={4}
                    isInvalid={error !== ''}
                  >
                    <FormLabel>Name</FormLabel>
                    <Input
                      type="text"
                      placeholder="John Smith"
                      size="md"
                      onChange={event => {
                        setNewName(event.target.value);
                        setError('');
                      }}
                      value={newName}
                    />
                    <FormErrorMessage>{error}</FormErrorMessage>
                    <FormHelperText>
                      Your name is used so that site admins can identify who you
                      are.
                    </FormHelperText>
                  </FormControl>
                </Box>
              </ModalBody>
            )}
            <ModalFooter>
              {!nameChangeComplete && (
                <SubmitButton
                  label="Update name"
                  isLoading={modalIsLoading}
                  error={error}
                />
              )}
              <Button colorScheme="red" marginLeft={4} onClick={handleClose}>
                Close
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ChangeNameModal;
