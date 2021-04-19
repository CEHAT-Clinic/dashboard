import React from 'react';
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
  Center,
} from '@chakra-ui/react';
import {User, DeleteUserPopoverProps} from './Types';
import firebase, {firebaseAuth, firestore} from '../../../firebase';
import {useTranslation} from 'react-i18next';
import {useAuth} from '../../../contexts/AuthContext';

/**
 * Creates a button that when clicked, creates a confirmation popup to delete a
 * user. Only non-admin users can be deleted.
 * @param user - The current user for a row
 * @param setError - the setter for an error state
 * @returns button that when clicked, creates a popover where an admin user can click to toggle that user's admin status
 */
const DeleteUserPopover: ({
  user,
  setError,
}: DeleteUserPopoverProps) => JSX.Element = ({
  user,
  setError,
}: DeleteUserPopoverProps) => {
  const {isAdmin} = useAuth();
  const {t} = useTranslation(['administration', 'common']);

  /**
   * Marks a user's document in the `USERS_COLLECTION` and the user's
   * Firebase Authentication account for deletion
   * @param event - click button event
   * @param user - user to mark for deletion
   */
  function handleDeletion(
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    user: User
  ): Promise<void> {
    event.preventDefault();

    if (isAdmin) {
      return markUserDocAsDeleted(user)
        .then(() => markUserForDeletion(user))
        .catch(() => {
          setError('Unable to mark user for deletion');
        });
    } else {
      return firebaseAuth.signOut();
    }
  }

  /**
   * Marks a user's Firebase Authentication account and user document for
   * deletion.
   * @param user - user to mark for deletion
   * @returns a promise that when resolved means that the user's account and document have been marked for deletion
   */
  function markUserForDeletion(user: User): Promise<void> {
    if (isAdmin) {
      return firestore
        .collection('deletion')
        .doc('users')
        .update({
          userDocs: firebase.firestore.FieldValue.arrayUnion(user.userId),
          firebaseUsers: firebase.firestore.FieldValue.arrayUnion(user.userId),
        });
    } else {
      return firebaseAuth.signOut();
    }
  }

  /**
   * Marks a user's doc as deleted
   * @param user - user doc to mark as deleted
   * @returns a promise that when resolved
   */
  function markUserDocAsDeleted(user: User): Promise<void> {
    if (isAdmin) {
      return firestore.collection('users').doc(user.userId).update({
        isDeleted: true,
      });
    } else {
      return firebaseAuth.signOut();
    }
  }

  const popoverMessage =
    'Once you confirm deletion, this action cannot be undone. The user will be deleted in the next 24 hours. Until then, the user will still be able to use their account.';

  return (
    <Popover>
      <PopoverTrigger>
        <Button colorScheme="red" width="full">
          {'Delete User'}
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverHeader>
          <Heading fontSize="medium">{'Confirm User Deletion'}</Heading>
        </PopoverHeader>
        <PopoverBody>
          <Text>{popoverMessage}</Text>
          <Center>
            <Button
              paddingY={2}
              colorScheme="red"
              onClick={event => handleDeletion(event, user)}
            >
              {t('common:confirm')}
            </Button>
          </Center>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export {DeleteUserPopover};
