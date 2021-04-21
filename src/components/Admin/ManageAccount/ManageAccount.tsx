import React, {useState} from 'react';
import {Box, Heading, Text, Flex, Button, Divider} from '@chakra-ui/react';
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

  const {t} = useTranslation(['administration', 'common']);

  // TODO: make this happen on click
  function sendEmailVerificationEmail() {
    if (isAuthenticated && firebaseAuth.currentUser && !verificationEmailSent) {
      const user = firebaseAuth.currentUser;
      user
        .sendEmailVerification()
        .then(() => setVerificationEmailSent(true))
        .catch(error => {
          setError('Unable to send confirmation email');
        });
    }
  }

  if (isLoading) {
    return <Loading />;
  } else if (!isAuthenticated) {
    return <AccessDenied reason={t('notSignedIn')} />;
  } else if (isDeleted) {
    return <AccountDeleted />;
  } else {
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
          <Text textAlign="left" fontSize="md">
            {email}
          </Text>
          {!emailVerified && !verificationEmailSent && (
            <Button onClick={sendEmailVerificationEmail}>
              {t('manageAccount.sendEmailVerificationEmail')}
            </Button>
          )}
          {/* TODO: add message for "Verification email sent. Refresh the page to send the email again" */}
          <ChangeEmailModal passwordUser={passwordUser} />
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
