import React from 'react';
import {
  Popover,
  PopoverTrigger,
  Button,
  Portal,
  PopoverArrow,
  PopoverContent,
  PopoverHeader,
  PopoverCloseButton,
  PopoverBody,
  Text,
  Heading,
  Flex,
  HStack,
} from '@chakra-ui/react';
import {WarningTwoIcon} from '@chakra-ui/icons';

/**
 * Interface for props for ErrorTag
 * - `name` - name of the error
 * - `explanation` - explanation of the error
 */
interface ErrorTagProps {
  name: string;
  explanation: string;
}

/**
 * Tag for an error for the sensor table. When clicked on, a popover appears
 * with an explanation of the error.
 * @param name - name of the error
 * @param explanation - explanation of the error
 * @returns tag for an error to be displayed in the sensor table. When clicked, the tag will show a popover with an explanation of the error.
 */
const ErrorTag: ({name, explanation}: ErrorTagProps) => JSX.Element = ({
  name,
  explanation,
}: ErrorTagProps) => {
  return (
    <Popover>
      <PopoverTrigger>
        <Button colorScheme="red" size="xs">
          {name}
        </Button>
      </PopoverTrigger>
      <Portal>
        <PopoverContent>
          <PopoverArrow />
          <PopoverHeader>
            <Flex alignItems="center" justifyContent="center" marginTop="1em">
              <HStack>
                <WarningTwoIcon color="red.500" />
                <Heading size="md" color="red.500" textAlign="center">
                  {name}
                </Heading>
                <WarningTwoIcon color="red.500" />
              </HStack>
            </Flex>
          </PopoverHeader>
          <PopoverCloseButton />
          <PopoverBody>
            <Text>{explanation}</Text>
          </PopoverBody>
        </PopoverContent>
      </Portal>
    </Popover>
  );
};

export {ErrorTag};
