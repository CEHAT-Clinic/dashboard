import React, {createContext, useState, useContext} from 'react';
import {Props} from './AppProviders';

/**
<<<<<<< HEAD
 * Interface for the auth context used for type safety
 */
interface AuthInterface {
  isAuthenticated: boolean;
  setIsAuthenticated(isAuthenticated: boolean): void;
=======
 * Interface for the auth context that defines the values contained by Auth
 */
interface AuthInterface {
  isNewUser: boolean;
  setIsNewUser(isNewUser: boolean): void;
  authenticated: boolean;
  setAuthenticated(authenticated: boolean): void;
>>>>>>> 0198141... Add auth context
}

/**
 * Auth context with default values
 */
const AuthContext = createContext<AuthInterface>({} as AuthInterface);

/**
<<<<<<< HEAD
 * Authentication Provider that wraps App.tsx to provide authentication status
 * throughout the entire app.
 * @param props child React components that will consume the context
 */
const AuthProvider: React.FC<Props> = ({children}: Props) => {
  const defaultIsAuthenticated = false;
  const [isAuthenticated, setIsAuthenticated] = useState(
    defaultIsAuthenticated
  );
=======
 * Authentication Provider that wraps App.tsx to provide Auth
 * @param props child React components that will consume the context
 */
const AuthProvider: React.FC<Props> = ({children}: Props) => {
  const defaultIsAuthorized = false;
  const defaultIsNewUser = false;
  const [authorized, setAuthorized] = useState(defaultIsAuthorized);
  const [isNewUser, setIsNewUser] = useState(defaultIsNewUser);
>>>>>>> 0198141... Add auth context

  return (
    <AuthContext.Provider
      value={{
<<<<<<< HEAD
        isAuthenticated: isAuthenticated,
        setIsAuthenticated: setIsAuthenticated,
=======
        isNewUser: isNewUser,
        setIsNewUser: setIsNewUser,
        authenticated: authorized,
        setAuthenticated: setAuthorized,
>>>>>>> 0198141... Add auth context
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
<<<<<<< HEAD
 * Custom hook to allow other components to use and set authentication status
 * Values: isAuthenticated (boolean) and setIsAuthenticated ((boolean) => void)
=======
 * Custom hook to allow other components to use values described in AuthInterface
>>>>>>> 0198141... Add auth context
 */
const useAuth: () => AuthInterface = () => useContext(AuthContext);

export {useAuth, AuthContext, AuthProvider};
