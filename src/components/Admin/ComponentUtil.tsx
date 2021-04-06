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
  Box,
  FormHelperText,
} from '@chakra-ui/react';
import {useTranslation} from 'react-i18next';

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
  const {t} = useTranslation('administration');
  return (
    <InputRightElement width="4.5rem">
      <Button height="1.75rem" size="sm" onClick={handlePasswordVisibility}>
        {showPassword
          ? t('passwordVisibility.hide')
          : t('passwordVisibility.show')}
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
  const {t} = useTranslation('administration');
  return (
    <FormControl isRequired marginTop={4} isInvalid={error !== ''}>
      <FormLabel>{t('email')}</FormLabel>
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
  helpMessage?: string;
}

/**
 * Component for password input field in authentication forms.
 * @param props - label, showPassword, handlePasswordChange, handlePasswordVisibility, error
 * - `label` (optional) label for password input. Defaults to t('password')
 * - `showPassword` (optional) if password is hidden or not. Defaults to false
 * - `handlePasswordChange` handles change in password input field
 * - `value` value that tracks the form value
 * - `handlePasswordVisibility` (optional) changes showPassword. Defaults to toggle showPassword.
 * - `error` (optional) error message to be displayed. Defaults to ''
 * - `helpMessage` (optional) message to explain the form field to users
 */
const PasswordFormInput: ({
  label,
  showPassword,
  handlePasswordChange,
  value,
  handlePasswordVisibility,
  error,
  helpMessage,
}: PasswordFormInputProps) => JSX.Element = ({
  label,
  showPassword = false,
  handlePasswordChange,
  value,
  handlePasswordVisibility = () => !showPassword,
  error = '',
  helpMessage = '',
}: PasswordFormInputProps) => {
  const {t} = useTranslation('administration');
  const safeLabel = label ? label : t('password');
  return (
    <FormControl isRequired marginTop={4} isInvalid={error !== ''}>
      <FormLabel>{safeLabel}</FormLabel>
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
      <FormHelperText>{helpMessage}</FormHelperText>
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
 * - `label` (optional) label for button. Defaults to t('submit')
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
  label,
  isLoading = false,
  color = 'teal',
  error = '',
  isDisabled = false,
}: SubmitButtonProps) => {
  const {t} = useTranslation('common');
  const safeLabel = label ? label : t('submit');
  return (
    <Box align="center">
      <FormControl isInvalid={error !== ''}>
        <Button
          colorScheme={color}
          variant="solid"
          type="submit"
          minWidth="50%"
          marginY={4}
          isDisabled={isDisabled}
        >
          {isLoading ? (
            <CircularProgress isIndeterminate size="24px" color={color} />
          ) : (
            safeLabel
          )}
        </Button>
        <FormErrorMessage>{error}</FormErrorMessage>
      </FormControl>
    </Box>
  );
};

export {SubmitButton, EmailFormInput, PasswordFormInput};
