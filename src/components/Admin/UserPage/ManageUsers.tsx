import React from 'react';
import {Box, Heading, Flex, Button} from '@chakra-ui/react';
import {useAuth} from '../../../contexts/AuthContext';
import AccessDenied from './AccessDenied';
import Loading from '../../Util/Loading';

const ManageUsers: () => JSX.Element = () => {
  const {isAuthenticated, isAdmin, isLoading} = useAuth();

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
          <Button as="a" href="/admin" margin={1}>
            Return to admin page
          </Button>
        </Box>
      </Flex>
    );
  }
};

export default ManageUsers;
