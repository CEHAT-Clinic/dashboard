import React from 'react';
import {
  ListItem,
  HStack,
  Code,
  Text,
  UnorderedList,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
  Button,
} from '@chakra-ui/react';
import {useTranslation} from 'react-i18next';

/**
 * Props for the `CodeDescription` component
 */
interface CodeDescriptionProps {
  heading: string;
  description: string;
}

const CodeDescription: ({
  heading,
  description,
}: CodeDescriptionProps) => JSX.Element = ({
  heading,
  description,
}: CodeDescriptionProps) => {
  return (
    <ListItem>
      <HStack>
        <Code>{heading}</Code>
        <Text>{description}</Text>
      </HStack>
    </ListItem>
  );
};

const FileDescriptionPopover: () => JSX.Element = () => {
  const {t} = useTranslation('sensors');
  return (
    <Popover>
      <PopoverTrigger>
        <Button>{t('downloadData.description.heading')}</Button>
      </PopoverTrigger>
      <PopoverContent preventOverflow>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverHeader>{t('downloadData.description.heading')}</PopoverHeader>
        <PopoverBody>
          <Text marginBottom={2}>{t('downloadData.description.part1')}</Text>
          <UnorderedList>
            <CodeDescription
              heading={t('downloadData.description.timestamp.heading')}
              description={t('downloadData.description.timestamp.description')}
            />
            <CodeDescription
              heading={t('downloadData.description.name.heading')}
              description={t('downloadData.description.name.description')}
            />
            <CodeDescription
              heading={t('downloadData.description.pm25.heading')}
              description={t('downloadData.description.pm25.description')}
            />
            <CodeDescription
              heading={t('downloadData.description.percentDiff.heading')}
              description={t(
                'downloadData.description.percentDiff.description'
              )}
            />
            <CodeDescription
              heading={t('downloadData.description.humidity.heading')}
              description={t('downloadData.description.humidity.description')}
            />
            <CodeDescription
              heading={t('downloadData.description.latitude.heading')}
              description={t('downloadData.description.latitude.description')}
            />
            <CodeDescription
              heading={t('downloadData.description.longitude.heading')}
              description={t('downloadData.description.longitude.description')}
            />
          </UnorderedList>
          <Text marginY={2}>{t('downloadData.description.part2')}</Text>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export {FileDescriptionPopover};
