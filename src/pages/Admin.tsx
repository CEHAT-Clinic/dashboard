import React from 'react';
import {useAuth} from '../contexts/AuthContext';
import Loading from '../components/Util/Loading';

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
    return <Loading />;
  } else {
    return isAuthenticated ? <AuthenticatedAdmin /> : <UnauthenticatedAdmin />;
  }
};

export default Admin;
