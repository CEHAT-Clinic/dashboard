import React, {createContext, useState, useContext, useEffect} from 'react';
import {firebaseAuth} from '../firebase';
import {Props} from './AppProviders';

/**
 * Interface for AuthContext used for type safety
 *
 * - `isAuthenticated` if user is signed in
 */
interface AuthInterface {
  isAuthenticated: boolean;
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

  useEffect(() => {
    const unsubscribe = firebaseAuth.onAuthStateChanged(user => {
      if (user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    });
    return unsubscribe;
  });

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to allow other components to use and set authentication status
 * @returns `{isAuthenticated}`
 */
const useAuth: () => AuthInterface = () => useContext(AuthContext);

export {useAuth, AuthContext, AuthProvider};
