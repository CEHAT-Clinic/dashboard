import React, {useState, useEffect} from 'react';
import {
  Box,
  Heading,
  Flex,
  Button,
  Table,
  Thead,
  Tr,
  Td,
  Th,
  Tbody,
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
import {useAuth} from '../../../contexts/AuthContext';
import AccessDenied from './AccessDenied';
import Loading from '../../Util/Loading';
import {firebaseAuth, firestore} from '../../../firebase';
import {User} from '../Authentication/Util';
import {useTranslation} from 'react-i18next';
import {validData} from '../../../util';

/**
 * Component for administrative page to manage site users.
 * If a user is not signed in or an admin user, access is denied.
 */
const ManageUsers: () => JSX.Element = () => {
  // --------------- State maintenance variables ------------------------
  const {isAuthenticated, isAdmin, isLoading: fetchingAuthInfo} = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  // -------------- End state maintenance variables -------------------------

  const {t} = useTranslation(['administration', 'common']);

  // On render, fetch all users
  useEffect(() => {
    // Only fetch all user data if user is an admin user
    if (isAdmin) {
      setIsLoading(true);

      // Creates a listener that updates the data on any changes
      const unsubscribe = firestore
        .collection('users')
        .onSnapshot(querySnapshot => {
          const userList: User[] = [];
          querySnapshot.docs.forEach(doc => {
            if (doc.exists) {
              const userData = doc.data();

              // Make sure that the doc data and relevant fields exist
              if (
                userData &&
                validData(userData.name, 'string') &&
                validData(userData.email, 'string') &&
                validData(userData.admin, 'boolean')
              ) {
                userList.push({
                  email: userData.email,
                  name: userData.name,
                  admin: userData.admin,
                  userId: doc.id,
                });
              }
            }
          });
          setUsers(userList);
        });
      setIsLoading(false);
      return unsubscribe;
    }
    return;
  }, [isAdmin]);

  /**
   *
   * @param event - click button event
   * @param userId - Firebase uid of the user to toggle the admin status
   */
  function toggleAdminStatus(
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    user: User
  ) {
    event.preventDefault();

    if (isAdmin) {
      firestore
        .collection('users')
        .doc(user.userId)
        .update({
          admin: !user.admin,
        })
        .catch(() => {
          setError(t('users.changeAdminError') + user.name);
        });
    }
  }

  /**
   * Interface for ToggleUserPopover used for type safety
   */
  interface ToggleUserPopoverProps {
    user: User;
  }

  const ToggleUserPopover: ({user}: ToggleUserPopoverProps) => JSX.Element = ({
    user,
  }: ToggleUserPopoverProps) => {
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
          <Button colorScheme={user.admin ? 'red' : 'green'} width="full">
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
              <Text color="red.500">
                {t('users.removeAdmin.cannotBeUndone')}
              </Text>
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

  if (isLoading || fetchingAuthInfo) {
    return <Loading />;
  } else if (!isAuthenticated) {
    return <AccessDenied reason={t('notSignedIn')} />;
  } else if (!isAdmin) {
    return <AccessDenied reason={t('notAdmin')} />;
  } else {
    return (
      <Flex width="full" align="center" justifyContent="center">
        <Box
          padding={8}
          margin={8}
          width="full"
          maxWidth="1000px"
          borderWidth={1}
          borderRadius={8}
          boxShadow="lg"
          textAlign="center"
        >
          <Heading>{t('manageUsers')}</Heading>
          <Box marginY={5} overflowX="auto" maxWidth="100%">
            <Heading textAlign="left" fontSize="lg">
              {t('users.heading')}
            </Heading>
            <Table>
              <Thead>
                <Tr>
                  <Th>{t('users.name')}</Th>
                  <Th>{t('email')}</Th>
                  <Th>{t('users.removeAdmin.button')}</Th>
                </Tr>
              </Thead>
              <Tbody>
                {users
                  .filter(user => user.admin)
                  .map((user, id) => (
                    <Tr key={id}>
                      <Td>{user.name}</Td>
                      <Td>{user.email}</Td>
                      <Td>
                        <ToggleUserPopover user={user} />
                      </Td>
                    </Tr>
                  ))}
              </Tbody>
            </Table>
          </Box>
          <Box marginY={5} overflowX="auto" maxWidth="100%">
            <Heading textAlign="left" fontSize="lg">
              {t('users.allCurrent')}
            </Heading>
            <Table>
              <Thead>
                <Tr>
                  <Th>{t('users.name')}</Th>
                  <Th>{t('email')}</Th>
                  <Th>{t('users.adminStatus')}</Th>
                </Tr>
              </Thead>
              <Tbody>
                {users.map((user, id) => (
                  <Tr key={id}>
                    <Td>{user.name}</Td>
                    <Td>{user.email}</Td>
                    <Td>
                      <ToggleUserPopover user={user} />
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
          {error && <Text textColor="red.500">{error}</Text>}
          <Button as="a" href="/admin" margin={1}>
            {t('returnAdmin')}
          </Button>
        </Box>
      </Flex>
    );
  }
};

export default ManageUsers;
