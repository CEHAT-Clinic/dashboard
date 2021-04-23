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
import {useTranslation} from 'react-i18next';
import {useAuth} from '../../../contexts/AuthContext';
import {Reauthentication} from './Reauthentication';
import {
  DELETION_COLLECTION,
  USERS_COLLECTION,
  USER_DELETION_DOC,
} from '../../../firebase/firestore';

/**
 * Creates a button that when clicked allows a non-admin user to delete their account.
 * @returns a button that when clicked allows a user to delete their account
 */
const DeleteAccountPopover: () => JSX.Element = () => {
  const {isAdmin} = useAuth();

  const [reauthenticated, setReauthenticated] = useState(false);
  const [error, setError] = useState('');
  const {t} = useTranslation(['administration', 'common']);

  // Admins are not allowed to delete their account, so an admin user must
  // remove themself as an admin before deleting their account. This prevents
  // the last admin user from deleting their account since an admin cannot
  // remove their admin status if they are the last admin.
  const readyToDelete: boolean = error === '' && !isAdmin && reauthenticated;

  /**
   * Marks a user's `isDeleted` field as true in a user's doc so that the user
   * does not show up on the ManageUsers page for admins.
   * @returns a promise that when resolved means a user's doc has been marked as deleted
   */
  function markUserDocAsDeleted(): Promise<void> {
    if (firebaseAuth.currentUser) {
      return firestore
        .collection(USERS_COLLECTION)
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
        .collection(DELETION_COLLECTION)
        .doc(USER_DELETION_DOC)
        .update({
          userDocs: firebase.firestore.FieldValue.arrayUnion(
            firebaseAuth.currentUser.uid
          ),
          lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
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

  return (
    <Popover placement="auto">
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
                <Reauthentication
                  setReauthenticated={setReauthenticated}
                  reauthenticated={reauthenticated}
                />
                <Text marginY={2} fontWeight="bold">
                  {t('deleteAccount.confirmQuestion')}
                </Text>
                <Center>
                  <Button
                    isDisabled={!readyToDelete}
                    colorScheme="red"
                    onClick={deleteAccount}
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
