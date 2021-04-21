import React, {useState} from 'react';
import {
  Box,
  Heading,
  Text,
  Flex,
  Button,
  Divider,
  CircularProgress,
} from '@chakra-ui/react';
import {useAuth} from '../../../contexts/AuthContext';
import AccessDenied from '../AccessDenied';
import ChangePasswordModal from './ChangePassword';
import Loading from '../../Util/Loading';
import ChangeNameModal from './ChangeName';
import {useTranslation} from 'react-i18next';
import {AccountDeleted} from '../AccountDeleted';
import {DeleteAccountPopover} from './DeleteAccountPopover';
import {AddPasswordModal} from './AddPassword';
import ChangeEmailModal from './ChangeEmail';
import {firebaseAuth} from '../../../firebase/firebase';

/**
 * Component for a user to manage their own account information.
 * If a user is not signed in, access is denied.
 */
const ManageAccount: () => JSX.Element = () => {
  // --------------- State maintenance variables ------------------------
  const {
    isAuthenticated,
    isLoading,
    name,
    email,
    isDeleted,
    emailVerified,
    googleUser,
    passwordUser,
  } = useAuth();
  const [error, setError] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [verificationEmailSent, setVerificationEmailSent] = useState(false);
  // --------------- End state maintenance variables ------------------------

  // TODO: add translations
  const {t} = useTranslation(['administration', 'common']);

  /**
   * Sends an email verification email to the user. If the user clicks on the
   * link they receive in the email, they will be verified.
   * @param event - click button event
   * @returns a promise that when resolved means the email verification has been sent to a user
   */
  function sendEmailVerificationEmail(
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): Promise<void> {
    event.preventDefault();
    if (isAuthenticated && firebaseAuth.currentUser && !verificationEmailSent) {
      setSendingEmail(true);
      return firebaseAuth.currentUser
        .sendEmailVerification()
        .then(() => {
          setSendingEmail(false);
          setVerificationEmailSent(true);
        })
        .catch(() => setError('Unable to send confirmation email'));
    } else {
      return firebaseAuth.signOut();
    }
  }

  if (isLoading) {
    return <Loading />;
  } else if (!isAuthenticated) {
    return <AccessDenied reason={t('notSignedIn')} />;
  } else if (isDeleted) {
    return <AccountDeleted />;
  } else {
    const success =
      'Verification email sent. Refresh the page to be able to re-send the email, or to check that you successfully verified your email.';

    const please = 'Please verify your email';
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
          <Heading marginBottom={2}>{t('manageAccount.heading')}</Heading>
          <Heading textAlign="left" fontSize="lg" as="h2">
            {t('email')}
          </Heading>
          <Text textAlign="left" fontSize="md" marginY={1}>
            {email}
          </Text>
          {!emailVerified && (
            <Text
              textAlign="left"
              fontSize="md"
              textColor="red.500"
              marginY={2}
            >
              {please}
            </Text>
          )}
          {!emailVerified &&
            (verificationEmailSent ? (
              <Text>{success}</Text>
            ) : (
              <Button onClick={sendEmailVerificationEmail} colorScheme="teal">
                {sendingEmail ? (
                  <CircularProgress isIndeterminate size="24px" color="teal" />
                ) : (
                  t('manageAccount.sendEmailVerificationEmail')
                )}
              </Button>
            ))}
          <Text textColor="red.500">{error}</Text>
          <ChangeEmailModal />
          <Divider marginY={2} />
          <Heading textAlign="left" fontSize="lg" as="h2">
            {t('name')}
          </Heading>
          <Text
            color={name ? 'black.500' : 'red.500'}
            textAlign="left"
            fontSize="md"
          >
            {name ? name : t('noName')}
          </Text>
          <ChangeNameModal />
          <Divider marginY={2} />
          <Heading marginTop={2} fontSize="lg" as="h2" textAlign="left">
            {t('manageAccount.manageSignInMethodsHeader')}
          </Heading>
          {passwordUser ? <ChangePasswordModal /> : <AddPasswordModal />}
          {googleUser && <Text>{t('manageAccount.connectedToGoogle')}</Text>}
          <Divider marginY={2} />
          <Heading fontSize="lg" as="h2" textAlign="left">
            {t('deleteAccount.heading')}
          </Heading>
          <DeleteAccountPopover />
          <Divider marginY={2} />
          <Button as="a" href="/admin" margin={1}>
            {t('returnAdmin')}
          </Button>
        </Box>
      </Flex>
    );
  }
};

export default ManageAccount;
