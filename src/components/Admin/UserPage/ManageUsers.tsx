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
import AccessDenied from './AccessDenied';
import Loading from '../../Util/Loading';
import {firestore} from '../../../firebase';
import {User} from '../Authentication/Util';
import {useTranslation} from 'react-i18next';

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
      firestore
        .collection('users')
        .get()
        .then(querySnapshot => {
          const userList: User[] = [];
          querySnapshot.docs.forEach(doc => {
            if (doc.exists) {
              const userData = doc.data();

              // Make sure that the doc data and relevant fields exist
              if (
                userData &&
                userData.name !== undefined &&
                userData.email !== undefined &&
                userData.admin !== undefined
              ) {
                userList.push({
                  email: userData.email,
                  name: userData.name,
                  admin: userData.admin,
                });
              }
            }
          });
          setUsers(userList);
        })
        .catch(error => {
          // Error thrown upon failure to fetch users collection from Firestore
          setError(t('users.cantFetch') + error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isAdmin, t]);

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
                </Tr>
              </Thead>
              <Tbody>
                {users
                  .filter(user => user.admin)
                  .map((user, id) => (
                    <Tr key={id}>
                      <Td>{user.name}</Td>
                      <Td>{user.email}</Td>
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
                  <Th>{t('users.isAdmin')}</Th>
                </Tr>
              </Thead>
              <Tbody>
                {users.map((user, id) => (
                  <Tr key={id}>
                    <Td>{user.name}</Td>
                    <Td>{user.email}</Td>
                    <Td>{user.admin ? t('common:yes') : t('common:no')}</Td>
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
