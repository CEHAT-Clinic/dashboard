import React from 'react';
import {Button, Box} from '@chakra-ui/react';
import {firebaseAuth} from '../../../firebase/firebase';
import {useTranslation} from 'react-i18next';

/**
 * Button that signs the user out when clicked
 */
const SignOut: () => JSX.Element = () => {
  const {t} = useTranslation('administration');

  return (
    <Box justifyContent="center">
      <Button
        minWidth="50%"
        marginY={4}
        onClick={() => firebaseAuth.signOut()}
        colorScheme="red"
      >
        {t('signOut')}
      </Button>
    </Box>
  );
};

export default SignOut;
