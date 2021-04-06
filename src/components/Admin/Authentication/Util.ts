import {TFunction} from 'i18next';
import firebase, {firebaseAuth} from '../../../firebase';

/**
 * Signs in or signs up a user with Google authentication through a pop up.
 * @param event - submit form event
 * @param setError - function to set error state for any errors from Google
 * @param setIsLoading - function to set loading state
 * @param translate - function to translate text using i18n-next
 */
async function signInWithGoogle(
  event: React.FormEvent<HTMLFormElement>,
  setError: React.Dispatch<React.SetStateAction<string>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  translate: TFunction
): Promise<void> {
  // Prevents submission before sign in is complete
  event.preventDefault();

  setIsLoading(true);
  try {
    await firebaseAuth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
  } catch (error) {
    // Error codes from Firebase documentation
    switch (error.code) {
      case 'auth/account-exists-with-different-credential': {
        firebaseAuth
          .fetchSignInMethodsForEmail(error.email)
          .then(signInMethodArray => {
            const errorMessageTemplate = translate('wrongMethod');
            const methods = signInMethodArray.join(', ');
            setError(errorMessageTemplate + methods);
          })
          .catch(error => {
            switch (error.code) {
              case 'auth/invalid-email': {
                setError(translate('invalidEmail'));
                break;
              }
              default: {
                setError(translate('tryAgain'));
                break;
              }
            }
          });
        break;
      }
      case 'auth/cancelled-popup-request': {
        // No error
        break;
      }
      case 'auth/popup-closed-by-user': {
        // No error
        break;
      }
      case 'auth/popup-blocked': {
        setError(translate('popUpsBlocked'));
        break;
      }
      default: {
        setError(translate('common:error'));
        break;
      }
    }
    setIsLoading(false);
  }
}

export {signInWithGoogle};
