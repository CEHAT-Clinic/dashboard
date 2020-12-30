import React, {useState} from 'react';
import SignIn from './Authentication/SignIn';
import SignUp from './Authentication/SignUp';
import {Box, Flex} from '@chakra-ui/react';

/**
 * Props for SignIn and SignUp component. Used for type safety.
 */
interface UnauthenticatedPageProps {
  setIsNewUser: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * Admin page when a user is not authenticated/signed in.
 */
const UnauthenticatedAdmin: () => JSX.Element = () => {
  const [isNewUser, setIsNewUser] = useState(false);
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
      >
        {isNewUser ? (
          <SignUp setIsNewUser={setIsNewUser} />
        ) : (
          <SignIn setIsNewUser={setIsNewUser} />
        )}
      </Box>
    </Flex>
  );
};

export type {UnauthenticatedPageProps};
export default UnauthenticatedAdmin;
