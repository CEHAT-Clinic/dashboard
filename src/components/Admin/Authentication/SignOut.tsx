import React, {useState} from 'react';
import {SubmitButton} from './Util';
import {firebaseAuth} from '../../../firebase';
import {useTranslation} from 'react-i18next/*';

/**
 * Button that signs the user out
 */
const SignOut: () => JSX.Element = () => {
  const [error, setError] = useState('');
  const {t} = useTranslation('administration');
  /**
   * Signs out the user and sets authentication status to false.
   * @param event - submit form event
   */
  async function handleSignOut(event: React.FormEvent<HTMLFormElement>) {
    // Prevents submission before sign out is complete
    event.preventDefault();

    try {
      await firebaseAuth.signOut();
    } catch {
      setError(t('signOutError'));
    }
  }

  return (
    <form onSubmit={handleSignOut}>
      <SubmitButton
        label={t('signOut')}
        color={'red'}
        error={error}
      ></SubmitButton>
    </form>
  );
};

export default SignOut;
