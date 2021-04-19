import React from 'react';
import {Button, Box} from '@chakra-ui/react';
import {firebaseAuth} from '../../../firebase/firebase';
import {useTranslation} from 'react-i18next';

/**
 * Button that signs the user out
 */
const SignOut: () => JSX.Element = () => {
  const {t} = useTranslation('administration');
  /**
   * Signs out the user and sets authentication status to false.
   * @param event - submit form event
   */
  function handleSignOut(): Promise<void> {
    return firebaseAuth.signOut();
  }

  return (
    <Box justifyContent="center">
      <Button
        minWidth="50%"
        marginY={4}
        onClick={handleSignOut}
        colorScheme="red"
      >
        {t('signOut')}
      </Button>
    </Box>
  );
};

export default SignOut;
