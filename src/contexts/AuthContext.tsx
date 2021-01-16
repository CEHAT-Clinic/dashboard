import React, {createContext, useState, useContext, useEffect} from 'react';
import {firebaseAuth} from '../firebase';
import {Props} from './AppProviders';

/**
 * Interface for AuthContext used for type safety
 *
 * - `isAuthenticated` if user is signed in
 * - `isLoading` if authentication status is being fetched
 */
interface AuthInterface {
  isAuthenticated: boolean;
  isLoading: boolean;
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
  const [isLoading, setIsLoading] = useState(false);
  // --------------- End state maintenance variables ------------------------

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = firebaseAuth.onAuthStateChanged(user => {
      if (user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: isAuthenticated,
        isLoading: isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to allow other components to use and set authentication status
 * @returns `{isAuthenticated, isLoading}`
 */
const useAuth: () => AuthInterface = () => useContext(AuthContext);

export {useAuth, AuthContext, AuthProvider};
