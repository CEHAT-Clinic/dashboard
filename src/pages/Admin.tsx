import React from 'react';
import {useAuth} from '../contexts/AuthContext';
import {Text} from '@chakra-ui/react';

const AuthenticatedAdmin = React.lazy(
  () => import('../components/Admin/AuthenticatedAdmin')
);
const UnauthenticatedAdmin = React.lazy(
  () => import('../components/Admin/UnauthenticatedAdmin')
);

/**
 * Component for the Admin page
 */
const Admin: () => JSX.Element = () => {
  const {isAuthenticated, isLoading} = useAuth();

  if (isLoading) {
    // TODO: Replace Loading text with loading component
    return <Text>Loading...</Text>;
  } else {
    return isAuthenticated ? <AuthenticatedAdmin /> : <UnauthenticatedAdmin />;
  }
};

export default Admin;
