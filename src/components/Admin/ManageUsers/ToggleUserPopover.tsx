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
import {User, ToggleUserPopoverProps} from './Types';
import {firebaseAuth, firestore} from '../../../firebase/firebase';
import {useTranslation} from 'react-i18next';
import {useAuth} from '../../../contexts/AuthContext';
import {USERS_COLLECTION} from '../../../firebase/firestore';

/**
 * Creates a button that when clicked, creates a confirmation popup to change
 * a user's status. If a user tries to remove their own admin status, a
 * warning is shown that the action cannot be undone without another admin
 * user changing their status back.
 * @param user - The current user for a row
 * @param isLastAdmin - if there is only one remaining admin user
 * @param setError - the setter for an error state
 * @returns button that when clicked, creates a popover where an admin user can click to toggle that user's admin status
 */
const ToggleUserPopover: ({
  user,
  isLastAdmin,
  setError,
}: ToggleUserPopoverProps) => JSX.Element = ({
  user,
  isLastAdmin,
  setError,
}: ToggleUserPopoverProps) => {
  const {isAdmin} = useAuth();
  const {t} = useTranslation(['administration', 'common']);

  /**
   *
   * @param event - click button event
   * @param user - user for which to toggle admin status
   */
  function toggleAdminStatus(
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    user: User
  ) {
    event.preventDefault();

    if (isAdmin) {
      firestore
        .collection(USERS_COLLECTION)
        .doc(user.userId)
        .update({
          admin: !user.admin,
        })
        .catch(() => {
          setError(t('users.changeAdminError') + user.name);
        });
    }
  }
  const popoverMessage = user.admin
    ? t('users.removeAdmin.confirmStart') +
      user.name +
      t('users.removeAdmin.confirmEnd')
    : t('users.makeAdmin.confirmStart') +
      user.name +
      t('users.makeAdmin.confirmEnd');

  const isSelf = user.userId === firebaseAuth.currentUser?.uid;

  return (
    <Popover>
      <PopoverTrigger>
        <Button
          colorScheme={user.admin ? 'red' : 'green'}
          width="full"
          isDisabled={isLastAdmin && user.admin}
        >
          {user.admin
            ? t('users.removeAdmin.button')
            : t('users.makeAdmin.button')}
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverHeader>
          <Heading fontSize="medium">{t('users.confirmChange')}</Heading>
        </PopoverHeader>
        <PopoverBody>
          <Text>{popoverMessage}</Text>
          {isSelf && (
            <Text color="red.500">{t('users.removeAdmin.cannotBeUndone')}</Text>
          )}
          <Center>
            <Button
              paddingY={2}
              colorScheme={user.admin ? 'red' : 'green'}
              onClick={event => toggleAdminStatus(event, user)}
            >
              {t('common:confirm')}
            </Button>
          </Center>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export {ToggleUserPopover};
