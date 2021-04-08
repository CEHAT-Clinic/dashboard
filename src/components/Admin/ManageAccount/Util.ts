import {TFunction} from 'i18next';
import firebase, {firebaseAuth} from '../../../firebase';

/**
 * Handles reauthentication of a password-based user before account update operations.
 * @returns error message or empty string if no error
 */
function handleReauthenticationWithPassword(
  password: string,
  t: TFunction
): Promise<string> {
  if (!firebaseAuth.currentUser) throw new Error(t('noUser'));
  if (!firebaseAuth.currentUser.email) throw new Error(t('noEmail'));
  const credential = firebase.auth.EmailAuthProvider.credential(
    firebaseAuth.currentUser.email,
    password
  );

  return firebaseAuth.currentUser
    .reauthenticateWithCredential(credential)
    .then(() => {
      return '';
    })
    .catch(error => {
      // Error codes from Firebase documentation
      // For fatal errors, user will be signed out and redirected to sign in
      const fatalErrors = [
        'auth/user-mismatch',
        'auth/user-not-found',
        'auth/invalid-credential',
        'auth/invalid-email',
      ];
      if (fatalErrors.includes(error.code)) firebaseAuth.signOut();

      if (error.code === 'auth/wrong-password') {
        return t('incorrectPassword');
      } else {
        return t('unknownError') + error.message;
      }
    });
}

export {handleReauthenticationWithPassword};
