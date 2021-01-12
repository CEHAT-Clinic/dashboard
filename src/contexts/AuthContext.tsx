import React, {createContext, useState, useContext, useEffect} from 'react';
import {firebaseAuth, firestore} from '../firebase';
import {Props} from './AppProviders';

/**
 * Interface for AuthContext used for type safety
 *
 * - `isAuthenticated` if user is signed in
 * - `isAdmin` if user is an admin
 */
interface AuthInterface {
  isAuthenticated: boolean;
  isAdmin: boolean;
}

/**
 * Auth context with default values
 */
const AuthContext = createContext<AuthInterface>({} as AuthInterface);

/**
 * Authentication Provider that wraps App to provide authentication status
 * throughout the entire app.
 * @param props - child React components that will consume the context
 */
const AuthProvider: React.FC<Props> = ({children}: Props) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = firebaseAuth.onAuthStateChanged(user => {
      if (user) {
        setIsAuthenticated(true);

        // Check if user is an admin user
        firestore
          .collection('admin')
          .doc('users')
          .get()
          .then(doc => {
            if (doc.exists) {
              const userData = doc.data();
              if (userData) {
                const adminUserIds: string[] = userData.userId ?? [];
                if (adminUserIds.includes(user.uid)) setIsAdmin(true);
              }
            }
          })
          .catch(error => {
            throw new Error(error);
          });
      } else {
        setIsAuthenticated(false);
        setIsAdmin(false);
      }
    });
    return unsubscribe;
  });

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: isAuthenticated,
        isAdmin: isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to allow other components to use and set authentication status
 * @returns `{isAuthenticated, isAdmin}`
 */
const useAuth: () => AuthInterface = () => useContext(AuthContext);

export {useAuth, AuthContext, AuthProvider};
