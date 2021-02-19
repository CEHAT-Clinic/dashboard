import React, {createContext, useState, useContext, useEffect} from 'react';
import {firebaseAuth, firestore} from '../firebase';
import {Props} from './AppProviders';
import {User} from '../components/Admin/Authentication/Util';

/**
 * Interface for AuthContext used for type safety
 *
 * - `isAuthenticated` if user is signed in
 * - `isLoading` if authentication status is being fetched
 * - `isAdmin` if user is an admin
 * - `name` user's name or empty string
 * - `email` user's email
 */
interface AuthInterface {
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  name: string;
  email: string;
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
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  // --------------- End state maintenance variables ------------------------

  /**
   * Function to reset all state variables to default
   */
  function resetState(): void {
    setIsAuthenticated(false);
    setIsAdmin(false);
    setEmail('');
    setName('');
    setIsLoading(false);
  }

  useEffect(() => {
    setIsLoading(true);
    
    // Creates listener for authentication status
    const unsubscribe = firebaseAuth.onAuthStateChanged(user => {
      if (user) {
        setIsAuthenticated(true);
        setIsLoading(false);
      } else {
        resetState();
      }
    });
    return unsubscribe;
  }, []);

  // Watch a user's document for account updates if a user is signed in
  useEffect(() => {
    if (isAuthenticated && firebaseAuth.currentUser) {
      setIsLoading(true);
      const user = firebaseAuth.currentUser;

      // This creates a listener for changes on the document so that if a user
      // updates their account information, this change is reflected on the user's
      // account page.
      const unsubscribe = firestore
        .collection('users')
        .doc(user.uid)
        .onSnapshot(snapshot => {
          if (snapshot.exists) {
            // TODO: check for changes instead of checking for data
            const userData = snapshot.data();
            if (userData) {
              if (userData.admin !== undefined) setIsAdmin(userData.admin);
              if (userData.name) setName(userData.name);
              if (userData.email) setEmail(userData.email);
              setIsLoading(false);
            } else {
              setIsLoading(false);
            }
          } else {
            // If a user doc doesn't exist, create one using the information
            // attached to the Firebase User object
            const newUserData: User = {
              name: user.displayName ?? '',
              email: user.email ?? '',
              admin: false,
            };
            firestore
              .collection('users')
              .doc(user.uid)
              .update(newUserData)
              .then()
              .catch(error => {
                // Error thrown upon failure to create the users doc in Firestore
                throw new Error(`Unable to create users doc: ${error}`);
              })
              .finally(() => setIsLoading(false));
          }
        });
      return unsubscribe;
    }
    return;
  }, [isAuthenticated]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: isAuthenticated,
        isAdmin: isAdmin,
        isLoading: isLoading,
        name: name,
        email: email,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to allow other components to use and set authentication status
 * @returns `{isAuthenticated, isLoading, isAdmin, name, email}`
 */
const useAuth: () => AuthInterface = () => useContext(AuthContext);

export {useAuth, AuthContext, AuthProvider};
