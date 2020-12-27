import React, {createContext, useState, useContext, useEffect} from 'react';
import {firebaseAuth} from '../firebase';
import {Props} from './AppProviders';

/**
 * Interface for AuthContext used for type safety
 *
 * - `isAuthenticated: boolean` if user is signed in
 * - `userId: string` user ID used in Firebase
 * - `email: string` email used for account sign in
 */
interface AuthInterface {
  isAuthenticated: boolean;
  userId: string;
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const unsubscribe = firebaseAuth.onAuthStateChanged(user => {
      if (user) {
        setIsAuthenticated(true);
        setUserId(user.uid);
        if (user.email) setEmail(user.email);
      } else {
        setEmail('');
        setUserId('');
        setIsAuthenticated(false);
      }
    });
    return unsubscribe;
  });

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: isAuthenticated,
        userId: userId,
        email: email,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to allow other components to use and set authentication status
 * @returns `{isAuthenticated: boolean, userId: string, email: string}`
 */
const useAuth: () => AuthInterface = () => useContext(AuthContext);

export {useAuth, AuthContext, AuthProvider};
