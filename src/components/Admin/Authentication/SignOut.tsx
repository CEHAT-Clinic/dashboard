import React from 'react';
import {SubmitButton} from './Util';
import {useAuth} from '../../../contexts/AuthContext';

/**
 * Button that signs the user out
 */
const SignOut: () => JSX.Element = () => {
  const {setIsAuthenticated} = useAuth();

  /**
   * Signs out the user and sets authentication status to false.
   * @param event - submit form event
   */
  function handleSignOut(event: React.FormEvent<HTMLFormElement>) {
    // Prevents submission before sign out is complete
    event.preventDefault();

    setIsAuthenticated(false);
  }

  return (
    <form onSubmit={handleSignOut}>
      <SubmitButton label={'Sign Out'}></SubmitButton>
    </form>
  );
};

export default SignOut;
