import React, {createContext, useState, useContext} from 'react';
import {Props} from './AppProviders';

/**
 * Interface for the auth context that defines the values contained by Auth
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
 * Authentication Provider that wraps App.tsx to provide Auth
 * @param props child React components that will consume the context
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
 * Custom hook to allow other components to use values described in AuthInterface
 */
const useAuth: () => AuthInterface = () => useContext(AuthContext);

export {useAuth, AuthContext, AuthProvider};
