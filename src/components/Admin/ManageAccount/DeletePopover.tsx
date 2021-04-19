import React, {useState} from 'react';
import {
  Popover,
  PopoverTrigger,
  Button,
  Portal,
  PopoverArrow,
  PopoverContent,
  PopoverHeader,
  PopoverCloseButton,
  PopoverBody,
  Text,
  Heading,
  Flex,
  HStack,
  Center,
  Box,
} from '@chakra-ui/react';
import {WarningTwoIcon} from '@chakra-ui/icons';
import firebase, {firebaseAuth, firestore} from '../../../firebase/firebase';
import {handleReauthenticationWithPassword} from './Util';
import {useTranslation} from 'react-i18next';
import {PasswordFormInput} from '../ComponentUtil';
import {useAuth} from '../../../contexts/AuthContext';

/**
 * Props for DeletePopover component. Used for type safety.
 */
interface DeletePopoverProps {
  passwordUser: boolean;
}

/**
 * @returns
 */
const DeletePopover: ({passwordUser}: DeletePopoverProps) => JSX.Element = ({
  passwordUser,
}: DeletePopoverProps) => {
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const {isAdmin} = useAuth();

  const [error, setError] = useState('');
  const {t} = useTranslation('administration'); // TODO: add translations

  const readyToDelete: boolean =
    error === '' && !isAdmin && passwordUser
      ? password !== '' && passwordError === ''
      : true;

  /**
   * Mark a user's doc for deletion in the `DELETION` collection.
   * @returns a promise that when resolved means that the user's uid has been added to the user deletion doc
   * @remarks We don't delete the user doc immediately because it will just be recreated while the user is signed in.
   */
  function markUserDocForDeletion(): Promise<void> {
    if (firebaseAuth.currentUser) {
      return firestore
        .collection('deletion')
        .doc('users')
        .update({
          userDocs: firebase.firestore.FieldValue.arrayUnion(
            firebaseAuth.currentUser.uid
          ),
        })
        .catch(() => setError('Unable to mark user document for deletion'));
    } else {
      return firebaseAuth.signOut();
    }
  }

  /**
   * Marks a user's doc in Firestore for deletion and then deletes the Firebase
   * Authentication account for the signed in user.
   * @returns a promise that when resolved means that a user's account has been deleted
   */
  function deleteAccount(): Promise<void> {
    return markUserDocForDeletion()
      .then(() => {
        if (firebaseAuth.currentUser) {
          firebaseAuth.currentUser.delete();
        }
      })
      .catch(() => {
        setError('Unable to complete account deletion');
      });
  }

  /**
   * Reauthenticate a user by password if the user is password based and then delete the user's account
   * @returns a promise that when resolved, reauthenticates a user by password if needed and then deletes the user's account
   */
  function handleDeleteAccount(): Promise<void> {
    // Verify that the inputted password is correct before proceeding
    if (passwordUser) {
      return handleReauthenticationWithPassword(password, t)
        .then(error => {
          if (error) {
            // This error can be handled by the user
            setPasswordError(error);
          } else {
            // No error, so proceed with account deletion
            deleteAccount();
          }
        })
        .catch(error => {
          // Propagate the error, since this error cannot be handled by the user
          throw new Error(error);
        });
    } else {
      // If user is not a password-based user, proceed with deleting the account
      return deleteAccount();
    }
  }

  return (
    <Popover>
      <PopoverTrigger>
        <Button colorScheme="red">{'Delete Account'}</Button>
      </PopoverTrigger>
      <Portal>
        <PopoverContent>
          <PopoverArrow />
          <PopoverHeader>
            <Flex alignItems="center" justifyContent="center">
              <HStack>
                <WarningTwoIcon color="red.500" />
                <Heading size="md" textAlign="center">
                  {'Delete Account'}
                </Heading>
                <WarningTwoIcon color="red.500" />
              </HStack>
            </Flex>
          </PopoverHeader>
          <PopoverCloseButton />
          <PopoverBody>
            {isAdmin ? (
              <Text textColor="red.500">
                {
                  'You must remove yourself as an admin before deleting your account'
                }
              </Text>
            ) : (
              <Box>
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
                <Text marginY={2} fontWeight="bold">
                  {
                    'Are you sure that you want to delete your account? This action is permanent.'
                  }
                </Text>
                <Center>
                  <Button
                    isDisabled={readyToDelete}
                    colorScheme="red"
                    onClick={handleDeleteAccount}
                  >
                    {'Confirm account deletion'}
                  </Button>
                </Center>
                <Text textColor="red.500">{error}</Text>
              </Box>
            )}
          </PopoverBody>
        </PopoverContent>
      </Portal>
    </Popover>
  );
};

export {DeletePopover};
