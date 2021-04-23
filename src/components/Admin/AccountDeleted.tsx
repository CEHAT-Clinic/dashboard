import React from 'react';
import {Box, Flex, Button, Text, Heading} from '@chakra-ui/react';
import firebase, {firebaseAuth, firestore} from '../../firebase/firebase';
import SignOut from './Authentication/SignOut';
import {useTranslation} from 'react-i18next';
import {DELETION_COLLECTION, USER_DELETION_DOC} from '../../firebase/firestore';

const AccountDeleted: () => JSX.Element = () => {
  const {t} = useTranslation('administration');

  /**
   * Removes a user's ID from the `firebaseUsers` array in `DELETION_COLLECTION`
   * in the `USER_DOC` so that the deletion Cloud Function does not attempt to
   * delete a user's account that does not exist, since the user is deleting their
   * own Firebase Authentication account.
   * @returns a promise that when resolved removes a user from the firebaseUsers array
   */
  function removeFromDeletion(): Promise<void> {
    if (firebaseAuth.currentUser) {
      return firestore
        .collection(DELETION_COLLECTION)
        .doc(USER_DELETION_DOC)
        .update({
          firebaseUsers: firebase.firestore.FieldValue.arrayRemove(
            firebaseAuth.currentUser.uid
          ),
        });
    } else {
      return firebaseAuth.signOut();
    }
  }

  /**
   * Deletes a user in Firebase Authentication
   * @returns a promise that when resolved deletes a user's Firebase Authentication account
   */
  function deleteAccount(): Promise<void> {
    if (firebaseAuth.currentUser) {
      return firebaseAuth.currentUser.delete();
    } else {
      return firebaseAuth.signOut();
    }
  }

  /**
   * Handles account deletion by removing the user's uid from scheduled account
   * deletion and then deleting their Firebase Authentication account
   * @param event - a button click event
   * @returns a promise that when resolved removes a user's uid from the scheduled deletion doc and deletes a user's Firebase Authentication account
   */
  function handleAccountDeletion(
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): Promise<void> {
    event.preventDefault();
    return removeFromDeletion().then(deleteAccount);
  }

  return (
    <Flex width="full" align="center" justifyContent="center">
      <Box
        padding={8}
        marginX={8}
        width="full"
        maxWidth="500px"
        borderWidth={1}
        borderRadius={8}
        boxShadow="lg"
        textAlign="center"
      >
        <Heading>{t('deletedAccount.heading')}</Heading>
        <Text>{t('deletedAccount.explanation')}</Text>
        <Button onClick={handleAccountDeletion} marginTop={2} colorScheme="red">
          {t('deletedAccount.deleteNow')}
        </Button>
        <SignOut />
      </Box>
    </Flex>
  );
};

export {AccountDeleted};
