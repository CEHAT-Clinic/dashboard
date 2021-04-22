import React, {useState} from 'react';
import {
  Popover,
  PopoverTrigger,
  Button,
  Portal,
  PopoverArrow,
  PopoverContent,
  PopoverHeader,
  PopoverCloseButton,
  PopoverBody,
  Text,
  Heading,
  Flex,
  HStack,
  Center,
  Box,
} from '@chakra-ui/react';
import {WarningTwoIcon} from '@chakra-ui/icons';
import firebase, {firebaseAuth} from '../../../firebase/firebase';
import {useTranslation} from 'react-i18next';
import {useAuth} from '../../../contexts/AuthContext';
import {Reauthentication} from './Reauthentication';

/**
 * Creates a button that when clicked allows a user to unlink their account from
 * Google authentication.
 * @returns a button that when clicked allows a user to unlink their account from Google Authentication
 */
const UnlinkGooglePopover: () => JSX.Element = () => {
  const {passwordUser, googleUser, setGoogleUser} = useAuth();

  const [error, setError] = useState('');
  const [reauthenticated, setReauthenticated] = useState(false);
  const {t} = useTranslation(['administration', 'common']);

  /**
   * Unlinks a user's account from Google when their email is changed, if their
   * account had been connected to Google.
   * @returns a promise that when resolved, unlinks an account from Google
   */
  function unlinkGoogle(): Promise<void | firebase.User> {
    if (googleUser && firebaseAuth.currentUser) {
      return firebaseAuth.currentUser
        .unlink('google.com')
        .then(() => setGoogleUser(false))
        .catch(() => setError(t('unlinkGoogle.error')));
    } else {
      return Promise.resolve();
    }
  }

  return (
    <Popover placement="auto">
      <PopoverTrigger>
        <Button colorScheme="red">{t('unlinkGoogle.heading')}</Button>
      </PopoverTrigger>
      <Portal>
        <PopoverContent>
          <PopoverArrow />
          <PopoverHeader>
            <Flex alignItems="center" justifyContent="center">
              <HStack>
                <WarningTwoIcon color="red.500" />
                <Heading size="md" textAlign="center">
                  {t('unlinkGoogle.heading')}
                </Heading>
                <WarningTwoIcon color="red.500" />
              </HStack>
            </Flex>
          </PopoverHeader>
          <PopoverCloseButton />
          <PopoverBody>
            {!passwordUser ? (
              <Text textColor="red.500">
                {'Add a password to your account first'}
              </Text>
            ) : (
              <Box>
                <Reauthentication
                  reauthenticated={reauthenticated}
                  setReauthenticated={setReauthenticated}
                />
                <Text marginY={2} fontWeight="bold">
                  {t('unlinkGoogle.heading')}
                </Text>
                <Center>
                  <Button
                    isDisabled={!reauthenticated}
                    colorScheme="red"
                    onClick={unlinkGoogle}
                  >
                    {t('common:confirm')}
                  </Button>
                </Center>
                <Text textColor="red.500">{error}</Text>
              </Box>
            )}
          </PopoverBody>
        </PopoverContent>
      </Portal>
    </Popover>
  );
};

export {UnlinkGooglePopover};
