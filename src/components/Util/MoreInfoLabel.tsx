import React from 'react';
import {
  Heading,
  Flex,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverHeader,
  PopoverBody,
  Text,
  IconButton,
} from '@chakra-ui/react';
import {QuestionOutlineIcon} from '@chakra-ui/icons';

/**
 * Interface for MoreInfoLabel used for type safety
 */
interface MoreInfoLabelProps {
  text: string;
  popoverLabel: string;
  message: string;
  fontWeight?: string | number;
  fontSize?: number | string;
  fontFamily?: string;
}

/**
 * Text that includes a clickable question mark icon. When the question mark
 * icon is clicked, a popover appears that explains something about the content of the text.
 * @param text - the text that should be followed by a more info popover
 * @param heading - title displayed in the popover when the help icon is clicked
 * @param message - help message displayed in popover when the help icon is clicked
 * @param fontWeight - optional argument for the fontWeight of the `text`
 * @param fontSize - optional argument for the fontSize of the `text`
 * @param fontFamily - optional argument for the fontFamily of the 'text'
 * @returns a text element with a question icon that when clicked, creates a pop up with a message explaining the text
 */
const MoreInfoLabel: ({
  text,
  popoverLabel,
  message,
  fontWeight,
  fontSize,
  fontFamily,
}: MoreInfoLabelProps) => JSX.Element = ({
  message,
  text,
  fontWeight = 'regular',
  fontSize = 'lg',
  fontFamily = 'Oxygen',
  popoverLabel,
}: MoreInfoLabelProps) => {
  // Default values for optional parameters:
  fontWeight = fontWeight ?? 'regular';
  fontSize = fontSize ?? 'lg';
  fontFamily = fontFamily ?? 'Oxygen';

  return (
    <Flex alignItems="center">
      <Text fontWeight={fontWeight} fontSize={fontSize}>
        {text}
      </Text>
      <Popover>
        <PopoverTrigger>
          <IconButton
            size="md"
            variant="unstyled"
            isRound
            aria-label={popoverLabel}
            icon={<QuestionOutlineIcon />}
          />
        </PopoverTrigger>
        <PopoverContent>
          <PopoverArrow />
          <PopoverCloseButton />
          <PopoverHeader>
            <Heading fontFamily={fontFamily} fontSize="medium">
              {popoverLabel}
            </Heading>
          </PopoverHeader>
          <PopoverBody>
            <Text fontWeight="normal" fontSize="md" textTransform="none">
              {message}
            </Text>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </Flex>
  );
};

export {MoreInfoLabel};
