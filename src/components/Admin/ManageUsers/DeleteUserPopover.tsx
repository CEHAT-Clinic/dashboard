import React, {useState} from 'react';
import {
  Heading,
  Button,
  Text,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverHeader,
  PopoverBody,
  VStack,
} from '@chakra-ui/react';
import {DeleteUserPopoverProps} from './Types';
import firebase, {firebaseAuth, firestore} from '../../../firebase/firebase';
import {useTranslation} from 'react-i18next';
import {useAuth} from '../../../contexts/AuthContext';

/**
 * Creates a button that when clicked, creates a confirmation popup to delete a
 * user. Only non-admin users can be deleted.
 * @param user - the user to delete
 * @returns button that when clicked, creates a popover where an admin user can click to mark a user's account for deletion
 */
const DeleteUserPopover: ({user}: DeleteUserPopoverProps) => JSX.Element = ({
  user,
}: DeleteUserPopoverProps) => {
  const {isAdmin} = useAuth();
  const {t} = useTranslation(['administration', 'common']);
  const [error, setError] = useState('');

  /**
   * Marks a user's document in the `USERS_COLLECTION` and the user's
   * Firebase Authentication account for deletion
   * @param event - click button event
   * @returns a promise that when resolved means a user's doc has been marked as deleted and the user account has been marked for deletion by the Cloud Functions
   */
  function handleDeletion(
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): Promise<void> {
    event.preventDefault();

    if (isAdmin) {
      return markUserForDeletion()
        .then(markUserDocAsDeleted)
        .catch(() => setError(t('deleteUser.error')));
    } else {
      return firebaseAuth.signOut();
    }
  }

  /**
   * Marks a user's Firebase Authentication account and user document for
   * deletion.
   * @returns a promise that when resolved means that the user's account and document have been marked for deletion
   *
   * @remarks We don't delete the user's document immediately since if the user signs into their account before the Cloud Function deletes their account, their user document will be automatically recreated.
   */
  function markUserForDeletion(): Promise<void> {
    if (isAdmin) {
      return firestore
        .collection('deletion')
        .doc('users')
        .update({
          userDocs: firebase.firestore.FieldValue.arrayUnion(user.userId),
          firebaseUsers: firebase.firestore.FieldValue.arrayUnion(user.userId),
          lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
        });
    } else {
      return firebaseAuth.signOut();
    }
  }

  /**
   * Marks a user's doc as deleted so that the user no longer shows up in the
   * ManageUser's page and so that if the deleted user signs into their account
   * before their account is deleted by the Cloud Functions, they will know that
   * their account has been marked for deletion
   * @returns a promise that when resolved means a user's doc has been marked as `isDeleted`
   */
  function markUserDocAsDeleted(): Promise<void> {
    if (isAdmin) {
      return firestore.collection('users').doc(user.userId).update({
        isDeleted: true,
      });
    } else {
      return firebaseAuth.signOut();
    }
  }

  return (
    <Popover>
      <PopoverTrigger>
        <Button colorScheme="red" width="full">
          {t('deleteUser.heading')}
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverHeader>
          <Heading fontSize="medium">{t('deleteUser.heading')}</Heading>
        </PopoverHeader>
        <PopoverBody>
          {error ? (
            <Text textColor="red.500">{error}</Text>
          ) : (
            <VStack>
              <Text>{t('deleteUser.message')}</Text>
              <Button
                paddingY={2}
                colorScheme="red"
                onClick={handleDeletion}
                minWidth="50%"
              >
                {t('common:confirm')}
              </Button>
            </VStack>
          )}
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export {DeleteUserPopover};
