import React from 'react';
import {
  Button,
  FormControl,
  FormErrorMessage,
  CircularProgress,
  InputRightElement,
  FormLabel,
  Input,
  InputGroup,
} from '@chakra-ui/react';
import firebase, {firebaseAuth} from '../../../firebase';

/**
 * Props for PasswordVisibilityToggle component. Used for type safety.
 */
interface PasswordVisibilityProps {
  showPassword: boolean;
  handlePasswordVisibility: () => void;
}

/**
 * Component for inside password input fields that toggles if a password is
 * visible in text or hidden behind dots.
 * @param props - showPassword, handlePasswordVisibility
 * - `showPassword` whether or not password is hidden
 * - `handlePasswordVisibility` changes showPassword
 */
const PasswordVisibilityToggle: ({
  showPassword,
  handlePasswordVisibility,
}: PasswordVisibilityProps) => JSX.Element = ({
  showPassword,
  handlePasswordVisibility,
}: PasswordVisibilityProps) => {
  return (
    <InputRightElement width="4.5rem">
      <Button height="1.75rem" size="sm" onClick={handlePasswordVisibility}>
        {showPassword ? 'Hide' : 'Show'}
      </Button>
    </InputRightElement>
  );
};

/**
 * Props for EmailFormInput component. Used for type safety.
 */
interface EmailFormInputProps {
  handleEmailChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  value: string;
  error?: string;
}

/**
 * Component for email input field in authentication forms.
 * @param props - handleEmailChange, value, error
 * - `handleEmailChange` handles change in input field
 * - `value` value that tracks form value
 * - `error` (optional) error message to be displayed
 */
const EmailFormInput: ({
  handleEmailChange,
  value,
  error,
}: EmailFormInputProps) => JSX.Element = ({
  handleEmailChange,
  value,
  error = '',
}: EmailFormInputProps) => {
  return (
    <FormControl isRequired marginTop={4} isInvalid={error !== ''}>
      <FormLabel>Email</FormLabel>
      <Input
        type="email"
        placeholder="example@test.com"
        size="md"
        onChange={handleEmailChange}
        value={value}
      />
      <FormErrorMessage>{error}</FormErrorMessage>
    </FormControl>
  );
};

/**
 * Props for PasswordFormInput component. Used for type safety.
 */
interface PasswordFormInputProps {
  label?: string;
  showPassword?: boolean;
  handlePasswordChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  value: string;
  handlePasswordVisibility?: () => void;
  error?: string;
}

/**
 * Component for password input field in authentication forms.
 * @param props - label, showPassword, handlePasswordChange, handlePasswordVisibility, error
 * - `label` (optional) label for password input. Defaults to 'Password'
 * - `showPassword` (optional) if password is hidden or not. Defaults to false
 * - `handlePasswordChange` handles change in password input field
 * - `value` value that tracks the form value
 * - `handlePasswordVisibility` (optional) changes showPassword. Defaults to toggle showPassword.
 * - `error` (optional) error message to be displayed. Defaults to ''
 */
const PasswordFormInput: ({
  label,
  showPassword,
  handlePasswordChange,
  value,
  handlePasswordVisibility,
  error,
}: PasswordFormInputProps) => JSX.Element = ({
  label = 'Password',
  showPassword = false,
  handlePasswordChange,
  value,
  handlePasswordVisibility = () => !showPassword,
  error = '',
}: PasswordFormInputProps) => {
  return (
    <FormControl isRequired marginTop={4} isInvalid={error !== ''}>
      <FormLabel>{label}</FormLabel>
      <InputGroup>
        <Input
          type={showPassword ? 'text' : 'password'}
          placeholder="*******"
          size="md"
          onChange={handlePasswordChange}
          value={value}
        />
        <PasswordVisibilityToggle
          showPassword={showPassword}
          handlePasswordVisibility={handlePasswordVisibility}
        />
      </InputGroup>
      <FormErrorMessage>{error}</FormErrorMessage>
    </FormControl>
  );
};

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

export {SubmitButton, signInWithGoogle, EmailFormInput, PasswordFormInput};
