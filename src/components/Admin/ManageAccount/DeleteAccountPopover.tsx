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
 * Props for DeleteAccountPopover component. Used for type safety.
 * - `passwordUser` - whether or not the user is password-based
 */
interface DeleteAccountPopoverProps {
  passwordUser: boolean;
}

/**
 * Creates a button that when clicked allows a non-admin user to delete their account.
 * @returns a button that when clicked allows a user to delete their account
 */
const DeleteAccountPopover: ({
  passwordUser,
}: DeleteAccountPopoverProps) => JSX.Element = ({
  passwordUser,
}: DeleteAccountPopoverProps) => {
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const {isAdmin} = useAuth();

  const [error, setError] = useState('');
  const {t} = useTranslation(['administration', 'common']);

  // For a password user, do not allow submission until they have entered a
  // a password and there is no current password error. If the user enters the
  // wrong password, the reauthenticate function will set the password error.
  const passwordUserReadyToSubmit: boolean =
    password !== '' && passwordError === '';

  // Admins are not allowed to delete their account, so an admin user must
  // remove themself as an admin before deleting their account. This prevents
  // the last admin user from deleting their account since an admin cannot
  // remove their admin status if they are the last admin.
  const readyToDelete: boolean =
    error === '' &&
    !isAdmin &&
    (passwordUser ? passwordUserReadyToSubmit : true);

  /**
   * Marks a user's `isDeleted` field as true in a user's doc so that the user
   * does not show up on the ManageUsers page for admins.
   * @returns a promise that when resolved means a user's doc has been marked as deleted
   */
  function markUserDocAsDeleted(): Promise<void> {
    if (firebaseAuth.currentUser) {
      return firestore
        .collection('users')
        .doc(firebaseAuth.currentUser.uid)
        .update({
          isDeleted: true,
        });
    } else {
      return firebaseAuth.signOut();
    }
  }

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
          lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        })
        .catch(() => setError(t('deleteAccount.error')));
    } else {
      return firebaseAuth.signOut();
    }
  }

  /**
   * Deletes the user's Firebase Authentication account
   * @returns a promise that when resolved means that a user's Firebase Authentication account has been deleted and the user is signed out
   */
  function deleteFirebaseAuthAccount(): Promise<void> {
    if (firebaseAuth.currentUser) {
      return firebaseAuth.currentUser.delete();
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
      .then(markUserDocAsDeleted)
      .then(deleteFirebaseAuthAccount)
      .catch(() => {
        setError(t('deleteAccount.error'));
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
        <Button colorScheme="red">{t('deleteAccount.heading')}</Button>
      </PopoverTrigger>
      <Portal>
        <PopoverContent>
          <PopoverArrow />
          <PopoverHeader>
            <Flex alignItems="center" justifyContent="center">
              <HStack>
                <WarningTwoIcon color="red.500" />
                <Heading size="md" textAlign="center">
                  {t('deleteAccount.heading')}
                </Heading>
                <WarningTwoIcon color="red.500" />
              </HStack>
            </Flex>
          </PopoverHeader>
          <PopoverCloseButton />
          <PopoverBody>
            {isAdmin ? (
              <Text textColor="red.500">
                {t('deleteAccount.noAdminDelete')}
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
                  {t('deleteAccount.confirmQuestion')}
                </Text>
                <Center>
                  <Button
                    isDisabled={!readyToDelete}
                    colorScheme="red"
                    onClick={handleDeleteAccount}
                  >
                    {t('common:confirm')}
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

export {DeleteAccountPopover};
