import {TFunction} from 'i18next';
import firebase, {firebaseAuth} from '../../../firebase';

/**
 * Handles reauthentication of a password-based user before account update operations.
 * @returns error message or empty string if no error
 *
 * @throws No user
 * Thrown if the currentUser is null
 *
 * @throws No email
 * Thrown if the currentUser's email is null
 */
async function handleReauthenticationWithPassword(
  password: string,
  translate: TFunction
): Promise<string> {
  if (!firebaseAuth.currentUser) throw new Error(translate('noUser'));
  if (!firebaseAuth.currentUser.email) throw new Error(translate('noEmail'));
  const credential = firebase.auth.EmailAuthProvider.credential(
    firebaseAuth.currentUser.email,
    password
  );

  try {
    await firebaseAuth.currentUser.reauthenticateWithCredential(credential);
    return '';
  } catch (error) {
    // Error codes from Firebase documentation
    // For fatal errors, user will be signed out and redirected to sign in
    const fatalErrors = [
      'auth/user-mismatch',
      'auth/user-not-found',
      'auth/invalid-credential',
      'auth/invalid-email',
    ];
    if (fatalErrors.includes(error.code)) firebaseAuth.signOut();

    switch (error.code) {
      case 'auth/wrong-password': {
        return translate('incorrectPassword');
      }
      default: {
        return translate('unknownError') + error.message;
      }
    }
  }
}

export {handleReauthenticationWithPassword};
