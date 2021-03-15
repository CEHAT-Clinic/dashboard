import React, {createContext, useState, useContext, useEffect} from 'react';
import {firebaseAuth, firestore} from '../firebase';
import {Props} from './AppProviders';
import {validData} from '../util';

/**
 * Interface for AuthContext used for type safety
 *
 * - `isAuthenticated` if user is signed in
 * - `isLoading` if authentication status is being fetched
 * - `isAdmin` if user is an admin
 * - `name` user's name or empty string
 * - `email` user's email
 * - `emailVerified` if a user's email has been verified
 */
interface AuthInterface {
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  name: string;
  email: string;
  emailVerified: boolean;
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
  const [emailVerified, setEmailVerified] = useState(false);
  // --------------- End state maintenance variables ------------------------

  /**
   * Function to reset all state variables to defaults
   */
  function resetState(): void {
    setIsAdmin(false);
    setEmail('');
    setName('');
    setEmailVerified(false);
  }

  useEffect(() => {
    setIsLoading(true);

    // Creates listener for authentication status
    const unsubscribe = firebaseAuth.onAuthStateChanged(user => {
      setIsLoading(true);
      if (user) {
        setIsAuthenticated(true);
      } else {
        resetState();
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  // Watch a user's document for account updates if a user is signed in
  useEffect(() => {
    if (isAuthenticated && firebaseAuth.currentUser) {
      setIsLoading(true);
      const user = firebaseAuth.currentUser;
      setEmailVerified(user.emailVerified);

      // This creates a listener for changes on the document so that if a user
      // updates their account information, this change is reflected on the user's
      // account page.
      const unsubscribe = firestore
        .collection('users')
        .doc(user.uid)
        .onSnapshot(snapshot => {
          if (snapshot.exists) {
            const userData = snapshot.data();

            if (userData) {
              if (validData(userData.admin, 'boolean'))
                setIsAdmin(userData.admin);
              if (validData(userData.name, 'string')) setName(userData.name);
              if (validData(userData.email, 'string')) setEmail(userData.email);
            }
            setIsLoading(false);
          } else {
            // If a user doc doesn't exist, create one using the information
            // attached to the Firebase User object
            const newUserData = {
              name: user.displayName ?? '',
              email: user.email ?? '',
              admin: false,
              emailVerified: user.emailVerified
            };
            firestore
              .collection('users')
              .doc(user.uid)
              .set(newUserData)
              .catch(error => {
                // Error thrown upon failure to create the users doc in Firestore
                throw new Error('Unable to create user doc: ' + error);
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
        emailVerified: emailVerified,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to allow other components to use authentication status
 * @returns `{isAuthenticated, isLoading, isAdmin, name, email, emailVerified}`
 */
const useAuth: () => AuthInterface = () => useContext(AuthContext);

export {useAuth, AuthContext, AuthProvider};
