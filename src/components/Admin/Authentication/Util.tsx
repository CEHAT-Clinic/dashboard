import React from 'react';
import {
  Button,
  FormControl,
  FormErrorMessage,
  CircularProgress,
} from '@chakra-ui/react';
import firebase, {firebaseAuth} from '../../../firebase';

/**
 * Props for SubmitButton component. Used for type safety.
 */
interface SubmitButtonProps {
  label?: string;
  isLoading?: boolean;
  color?: string;
  error?: string;
  isDisabled?: boolean;
}

/**
 * Component for submit button in authentication forms.
 * @param props - label, isLoading, color, error, isDisabled
 * - `label` (optional) label for button. Defaults to "Submit"
 * - `isLoading` (optional) if application is currently loading, used to display
 *   loading circle on button. Defaults to false
 * - `color` (optional) color of button. Defaults to "teal"
 * - `error` (optional) error message to be displayed. Defaults to ''
 * - `isDisabled` (optional) if button is clickable. Defaults to false
 */
const SubmitButton: ({
  label,
  isLoading,
  color,
  error,
  isDisabled,
}: SubmitButtonProps) => JSX.Element = ({
  label = 'Submit',
  isLoading = false,
  color = 'teal',
  error = '',
  isDisabled = false,
}: SubmitButtonProps) => {
  return (
    <FormControl isInvalid={error !== ''}>
      <Button
        colorScheme={color}
        variant="solid"
        type="submit"
        width="full"
        mt={4}
        isDisabled={isDisabled}
      >
        {isLoading ? (
          <CircularProgress isIndeterminate size="24px" color={color} />
        ) : (
          label
        )}
      </Button>
      <FormErrorMessage>{error}</FormErrorMessage>
    </FormControl>
  );
};

/**
 * Signs in or signs up a user with Google authentication through a pop up.
 * @param event - submit form event
 * @param setError - function to set error state for any errors from Google
 * @param setIsLoading - function to set loading state
 */
async function signInWithGoogle(
  event: React.FormEvent<HTMLFormElement>,
  setError: React.Dispatch<React.SetStateAction<string>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
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
            const errorMessageTemplate =
              'Account created with different sign in method. ' +
              'Please sign in with one of the following: ';
            const methods = signInMethodArray.join(', ');
            setError(errorMessageTemplate + methods);
          })
          .catch(error => {
            switch (error.code) {
              case 'auth/invalid-email': {
                setError(
                  'Invalid email. Please try signing in again' +
                    ' with a valid email address'
                );
                break;
              }
              default: {
                setError(
                  'Error occurred. Please try to sign in with a different method.'
                );
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
        setError(
          'Sign in pop up blocked. Enable pop ups in your browser or sign in with email'
        );
        break;
      }
      default: {
        setError('Error occurred. Please try again');
        break;
      }
    }
    setIsLoading(false);
  }
}

export {SubmitButton, signInWithGoogle};
