import React, {useState} from 'react';
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

/**
 * Component for administrative page to manage site users.
 * If a user is not signed in or an admin user, access is denied.
 */
const ManageUsers: () => JSX.Element = () => {
  const {isAuthenticated, isAdmin, isLoading} = useAuth();
  const [adminUsers, setAdminUsers] = useState<string[]>([]);

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
        setAdminUsers(adminUserIds);
      }
    }
  })
  .catch(error => {
    // Error thrown upon failure to fetch the admin/users doc from Firestore
    throw new Error(`Unable to fetch admin/users doc: ${error}`);
  });


  if (isLoading) {
    return <Loading />;
  } else if (!isAuthenticated) {
    return <AccessDenied reason="you are not signed in" />;
  } else if (!isAdmin) {
    return <AccessDenied reason="you are not an admin user" />;
  } else {
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
              <Tr>
                <Td>inches</Td>
                <Td>millimetres (mm)</Td>
              </Tr>
              <Tr>
                <Td>feet</Td>
                <Td>centimetres (cm)</Td>
              </Tr>
              <Tr>
                <Td>yards</Td>
                <Td>metres (m)</Td>
              </Tr>
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
