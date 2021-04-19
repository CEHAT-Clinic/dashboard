import React from 'react';
import {Box, Flex, Button, Text, Heading} from '@chakra-ui/react';
import {firebaseAuth} from '../../firebase/firebase';
import SignOut from './Authentication/SignOut';
import {useTranslation} from 'react-i18next';

const AccountDeleted: () => JSX.Element = () => {
  const {t} = useTranslation('administration');

  function deleteAccount(): Promise<void> {
    if (firebaseAuth.currentUser) {
      return firebaseAuth.currentUser.delete();
    } else {
      return firebaseAuth.signOut();
    }
  }

  return (
    <Flex width="full" align="center" justifyContent="center">
      <Box
        padding={8}
        marginX={8}
        width="full"
        maxWidth="500px"
        borderWidth={1}
        borderRadius={8}
        boxShadow="lg"
        textAlign="center"
      >
        <Heading>{t('deletedAccount.heading')}</Heading>
        <Text>{t('deletedAccount.explanation')}</Text>
        <Button onClick={deleteAccount} marginTop={2} colorScheme="red">
          {t('deletedAccount.deleteNow')}
        </Button>
        <SignOut />
      </Box>
    </Flex>
  );
};

export {AccountDeleted};
