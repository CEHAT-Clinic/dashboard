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
} from '@chakra-ui/react';
import {useAuth} from '../../../contexts/AuthContext';
import AccessDenied from '../AccessDenied';
import Loading from '../../Util/Loading';
import {firestore} from '../../../firebase/firebase';
import {useTranslation} from 'react-i18next';
import {User} from './Types';
import {ToggleUserPopover} from './ToggleUserPopover';
import {DeleteUserPopover} from './DeleteUserPopover';

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
        .where('isDeleted', '!=', true)
        .onSnapshot(querySnapshot => {
          const userList: User[] = [];
          querySnapshot.docs.forEach(doc => {
            if (doc.exists) {
              const userData = doc.data();

              // Make sure that the doc data and relevant fields exist
              if (
                userData &&
                typeof userData.name === 'string' &&
                typeof userData.email === 'string' &&
                typeof userData.admin === 'boolean'
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

  if (isLoading || fetchingAuthInfo) {
    return <Loading />;
  } else if (!isAuthenticated) {
    return <AccessDenied reason={t('notSignedIn')} />;
  } else if (!isAdmin) {
    return <AccessDenied reason={t('notAdmin')} />;
  } else {
    const adminUsers = users.filter(user => user.admin);
    const nonAdminUsers = users.filter(user => !user.admin);

    // eslint-disable-next-line no-magic-numbers
    const isLastAdmin = adminUsers.length === 1;
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
          <Button as="a" href="/admin" margin={1}>
            {t('returnAdmin')}
          </Button>
          {/* Admin users table */}
          <Box marginY={5} overflowX="auto" maxWidth="100%">
            <Heading textAlign="left" fontSize="lg">
              {t('users.adminUsers')}
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
                {adminUsers.map((user, id) => (
                  <Tr key={id}>
                    <Td>{user.name}</Td>
                    <Td>{user.email}</Td>
                    <Td>
                      <ToggleUserPopover
                        isLastAdmin={isLastAdmin}
                        user={user}
                        setError={setError}
                      />
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
            {isLastAdmin && (
              <Text color="red.500">{t('users.removeAdmin.lastAdmin')}</Text>
            )}
          </Box>
          {/* Non Admin Users Table */}
          <Box marginY={5} overflowX="auto" maxWidth="100%">
            <Heading textAlign="left" fontSize="lg">
              {t('users.nonAdminUsers')}
            </Heading>
            <Table>
              <Thead>
                <Tr>
                  <Th>{t('users.name')}</Th>
                  <Th>{t('email')}</Th>
                  <Th>{t('users.makeAdmin.button')}</Th>
                  <Th>Delete User</Th>
                </Tr>
              </Thead>
              <Tbody>
                {nonAdminUsers.map((user, id) => (
                  <Tr key={id}>
                    <Td>{user.name}</Td>
                    <Td>{user.email}</Td>
                    <Td>
                      <ToggleUserPopover
                        isLastAdmin={isLastAdmin}
                        user={user}
                        setError={setError}
                      />
                    </Td>
                    <Td>
                      <DeleteUserPopover user={user} setError={setError} />
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
