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
import {useTranslation} from 'react-i18next';

/**
 * Interface for MoreInfoPopover used for type safety
 */
 interface MoreInfoHeadingProps {
  message: string;
  heading: string;
}

/**
 * Table heading that includes a clickable question mark icon.
 * When the question mark icon is clicked, a popover appears that explains the
 * table field.
 * @param heading - heading for the column with the help icon
 * @param message - help message displayed in popover when help icon clicked
 */
const MoreInfoHeading: ({
  message,
  heading,
}: MoreInfoHeadingProps) => JSX.Element = ({
  message,
  heading,
}: MoreInfoHeadingProps) => {
  const {t} = useTranslation(['administration', 'common']);
  return (
    <Flex alignItems="center">
      <Text>{heading}</Text>
      <Popover>
        <PopoverTrigger>
          <IconButton
            size="xs"
            variant="unstyled"
            isRound
            aria-label={t('common:moreInformation')}
            icon={<QuestionOutlineIcon />}
          />
        </PopoverTrigger>
        <PopoverContent>
          <PopoverArrow />
          <PopoverCloseButton />
          <PopoverHeader>
            <Heading fontSize="medium">{t('common:moreInformation')}</Heading>
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

export {MoreInfoHeading};
