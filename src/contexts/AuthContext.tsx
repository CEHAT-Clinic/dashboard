import React, {createContext, useState, useContext, useEffect} from 'react';
import {firebaseAuth, firestore} from '../firebase';
import {Props} from './AppProviders';

/**
 * Interface for AuthContext used for type safety
 *
 * - `isAuthenticated` if user is signed in
 * - `isLoading` if authentication status is being fetched
 * - `isAdmin` if user is an admin
 */
interface AuthInterface {
  isAuthenticated: boolean;
  isLoading: boolean;
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
  // --------------- State maintenance variables ------------------------
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // --------------- End state maintenance variables ------------------------

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = firebaseAuth.onAuthStateChanged(user => {
      if (user) {
        setIsAuthenticated(true);

        // Check if user is an admin user
        firestore
          .collection('users')
          .doc(user.uid)
          .get()
          .then(doc => {
            if (doc.exists) {
              const userData = doc.data();
              if (userData) {
                if (userData.admin) setIsAdmin(true);
              }
            }
          })
          .catch(error => {
            // Error thrown upon failure to fetch the users doc from Firestore
            throw new Error(`Unable to fetch users doc: ${error}`);
          })
          .finally(() => {
            // Loading is only finished after the async calls to Firestore complete
            setIsLoading(false);
          });
      } else {
        setIsAuthenticated(false);
        setIsAdmin(false);
        setIsLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: isAuthenticated,
        isAdmin: isAdmin,
        isLoading: isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to allow other components to use and set authentication status
 * @returns `{isAuthenticated, isLoading, isAdmin}`
 */
const useAuth: () => AuthInterface = () => useContext(AuthContext);

export {useAuth, AuthContext, AuthProvider};
