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
  TableCaption,
} from '@chakra-ui/react';
import {useAuth} from '../../../contexts/AuthContext';
import AccessDenied from './AccessDenied';
import Loading from '../../Util/Loading';
import {firestore} from '../../../firebase';
import {User} from '../Authentication/Util';

/**
 * Component for administrative page to manage site users.
 * If a user is not signed in or an admin user, access is denied.
 */
const ManageUsers: () => JSX.Element = () => {
  const {isAuthenticated, isAdmin, isLoading: fetchingAuthInfo} = useAuth();
  const [adminUserIds, setAdminUserIds] = useState<string[]>([]);
  const [adminUsers, setAdminUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // On render, fetch all admin users
  useEffect(() => {
    if (isAdmin) {
      setIsLoading(true);
      // Get all admin users
      firestore
        .collection('admin')
        .doc('users')
        .get()
        .then(doc => {
          if (doc.exists) {
            // Get the document data that contains all admin userIds
            const userData = doc.data();
            if (userData) {
              const adminUserIds: string[] = userData.userId ?? [];
              setAdminUserIds(adminUserIds);
            }
          }
        })
        .catch(error => {
          // Error thrown upon failure to fetch admin/users doc from Firestore
          throw new Error(`Unable to fetch admin users doc: ${error}`);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isAdmin]);

  // Fetch admin documents
  useEffect(() => {
    if (adminUserIds) {
      setIsLoading(true);
      const tempAdminUsers: User[] = [];
      for (const userId of adminUserIds) {
        firestore
          .collection('users')
          .doc(userId)
          .get()
          .then(doc => {
            if (doc.exists) {
              const userData = doc.data();
              console.log(userData);
              if (
                userData &&
                userData.name &&
                userData.email &&
                userData.admin
              ) {
                const user: User = {
                  name: userData.name,
                  email: userData.email,
                  admin: userData.admin,
                };
                tempAdminUsers.push(user);
              }
            }
          })
          .catch(error => {
            // Error thrown upon failure to fetch users/userId doc from Firestore
            throw new Error(`Unable to fetch user doc: ${error}`);
          });
      }
      // TODO: this isn't staying
      setAdminUsers(tempAdminUsers);
      setIsLoading(false);
    }
  }, [adminUserIds]);

  if (isLoading || fetchingAuthInfo) {
    return <Loading />;
  } else if (!isAuthenticated) {
    return <AccessDenied reason="you are not signed in" />;
  } else if (!isAdmin) {
    return <AccessDenied reason="you are not an admin user" />;
  } else {
    console.log(adminUsers.length)
    return (
      <Flex width="full" align="center" justifyContent="center">
        <Box
          padding={8}
          margin={8}
          width="full"
          maxWidth="500px"
          borderWidth={1}
          borderRadius={8}
          boxShadow="lg"
          textAlign="center"
        >
          <Heading>Manage Users</Heading>
          <Table>
            <TableCaption placement="top">Current Admin Users</TableCaption>
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Email</Th>
              </Tr>
            </Thead>
            <Tbody>
              {adminUsers.map((user, id) => (
                <Tr key={id}>
                  <Td>{user.name}</Td>
                  <Td>{user.email}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
          <Button as="a" href="/admin" margin={1}>
            Return to admin page
          </Button>
        </Box>
      </Flex>
    );
  }
};

export default ManageUsers;
