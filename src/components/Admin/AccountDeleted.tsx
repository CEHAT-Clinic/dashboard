import React from 'react';
import {Box, Flex, Button, Text} from '@chakra-ui/react';
import {firebaseAuth} from '../../firebase/firebase';
import SignOut from './Authentication/SignOut';

const AccountDeleted: () => JSX.Element = () => {
  const deleteMessage =
    'Your account has been deleted by an administrator of the website, and the account will be deleted within the next 24 hours. If you believe this is a mistake, reach out to an administrator of the website and recreate your account after this account has been deleted. You may choose to complete account deletion at this time.';

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
        margin={8}
        width="full"
        maxWidth="500px"
        borderWidth={1}
        borderRadius={8}
        boxShadow="lg"
        textAlign="center"
      >
        <Text>{deleteMessage}</Text>
        <Button onClick={deleteAccount} marginTop={2} colorScheme="red">
          Complete Account Deletion Now
        </Button>
        <SignOut />
      </Box>
    </Flex>
  );
};

export {AccountDeleted};
