import React from 'react';
import {Box, Text} from '@chakra-ui/react';

/**
 * Interface for LabelValue props, used for type safety
 * - `label` - the text for the label to be displayed in bold font
 * - `value` - the text for the value for that label, in normal font and after a colon
 */
interface LabelValueProps {
  label: string;
  value: string;
}

/**
 * Component that shows a label and a value in the same line.
 * The label is bold and a colon and space separate the label and value.
 * @param label - text to be in the bold font
 * @param value - text to be after the label, in normal font
 * @returns a single line of text where the `label` is in bold and the `value` is after the label and a colon
 */
const LabelValue: ({label, value}: LabelValueProps) => JSX.Element = ({
  label,
  value,
}: LabelValueProps) => {
  return (
    <Box>
      <Text as="span" fontWeight="bold">
        {label}
      </Text>
      <Text display="inline">{': ' + value}</Text>
    </Box>
  );
};

export {LabelValue};
