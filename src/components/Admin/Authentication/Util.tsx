import React from 'react';
import {
  Button,
  FormControl,
  FormErrorMessage,
  CircularProgress,
} from '@chakra-ui/react';

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
 * - `label?: string` label for button. Defaults to "Submit"
 * - `isLoading?: boolean` if application is currently loading, used to display
 *   loading circle on button. Defaults to false
 * - `color?: string` color of button. Defaults to "teal"
 * - `error?: string` error message to be displayed. Defaults to ''
 * - `isDisabled?: boolean` if button is clickable. Defaults to false
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

export {SubmitButton};
