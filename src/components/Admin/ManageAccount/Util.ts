import {TFunction} from 'i18next';
import firebase, {firebaseAuth} from '../../../firebase/firebase';

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

/**
 * Handles reauthentication with Google using a popup
 * @param t - translation function
 * @returns a promise of a string, where the string is either an error message for the user or the empty string if no error occurred
 */
function handleReauthenticationWithGoogle(t: TFunction): Promise<string> {
  return firebaseAuth
    .signInWithPopup(new firebase.auth.GoogleAuthProvider())
    .then(() => '')
    .catch(error => {
      // Error codes from Firebase documentation
      switch (error.code) {
        case 'auth/cancelled-popup-request': {
          // No error TODO: this is not finished
          return '';
        }
        case 'auth/popup-closed-by-user': {
          // No error
          return '';
        }
        case 'auth/popup-blocked': {
          return t('popUpsBlocked');
        }
        default: {
          return t('common:error');
        }
      }
    });
}

export {handleReauthenticationWithPassword, handleReauthenticationWithGoogle};
