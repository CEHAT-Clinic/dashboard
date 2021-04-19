import React, {useState} from 'react';
import {firebaseAuth} from '../../../firebase/firebase';
import {useTranslation} from 'react-i18next';
import {Button, Box} from '@chakra-ui/react';

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
  function handleSignOut(): Promise<void> {
    return firebaseAuth.signOut().catch(() => setError(t('signOutError')));
  }

  return (
    <Box justifyContent="center">
      <Button
        minWidth="50%"
        marginY={4}
        onClick={handleSignOut}
        colorScheme="red"
        error={error}
      >
        {t('signOut')}
      </Button>
    </Box>
  );
};

export default SignOut;
