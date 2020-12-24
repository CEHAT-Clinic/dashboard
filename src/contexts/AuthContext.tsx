import React, {createContext, useState, useContext} from 'react';
import {Props} from './AppProviders';

/**
 * Interface for the auth context used for type safety
 */
interface AuthInterface {
  isAuthenticated: boolean;
  setIsAuthenticated(isAuthenticated: boolean): void;
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
  const defaultIsAuthenticated = false;
  const [isAuthenticated, setIsAuthenticated] = useState(
    defaultIsAuthenticated
  );

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: isAuthenticated,
        setIsAuthenticated: setIsAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to allow other components to use and set authentication status
 * @returns `{isAuthenticated: boolean, setIsAuthenticated: (boolean => void)}`
 */
const useAuth: () => AuthInterface = () => useContext(AuthContext);

export {useAuth, AuthContext, AuthProvider};
