import React, {useState} from 'react';
import {SubmitButton} from './Util';
import {firebaseAuth} from '../../../firebase';

/**
 * Button that signs the user out
 */
const SignOut: () => JSX.Element = () => {
  const [error, setError] = useState('');
  /**
   * Signs out the user and sets authentication status to false.
   * @param event - submit form event
   */
  function handleSignOut(event: React.FormEvent<HTMLFormElement>) {
    // Prevents submission before sign out is complete
    event.preventDefault();

    try {
      firebaseAuth.signOut();
    } catch {
      setError('Error occurred. Please try again');
    }
  }

  return (
    <form onSubmit={handleSignOut}>
      <SubmitButton label={'Sign Out'} error={error}></SubmitButton>
    </form>
  );
};

export default SignOut;
