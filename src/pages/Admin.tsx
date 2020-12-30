import React from 'react';
import {useAuth} from '../contexts/AuthContext';

const AuthenticatedAdmin = React.lazy(
  () => import('../components/Admin/AuthenticatedAdmin')
);
const UnauthenticatedAdmin = React.lazy(
  () => import('../components/Admin/UnauthenticatedAdmin')
);

/**
<<<<<<< HEAD
 * Component for the Admin page
=======
 * Component for administrative page
>>>>>>> master
 */
const Admin: () => JSX.Element = () => {
  const {isAuthenticated} = useAuth();

  return isAuthenticated ? <AuthenticatedAdmin /> : <UnauthenticatedAdmin />;
};

export default Admin;
