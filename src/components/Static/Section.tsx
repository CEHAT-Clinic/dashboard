import React from 'react';
import {Box, Flex, Heading} from '@chakra-ui/react';

/**
 * Interface to type the children components of the SectionProps.
 * - `children` - React components that are a part of this section
 * - `heading` - title of this section
 * - `id` - id of this section, used for jumping to that section
 */
interface SectionProps {
  children?: React.ReactNode;
  title: string;
  id: string;
}

/**
 * A component for a section of static content
 * @param children - React components that are part of a section
 * @returns a component that wraps a section of static content
 */
const Section: React.FC<SectionProps> = ({
  children,
  title,
  id,
}: SectionProps) => {
  return (
    <Flex padding={2} margin={2} width="full" direction="column" id={id}>
      <Heading fontSize="3xl" as="h2" fontFamily="Merriweather Sans">
        {title}
      </Heading>
      <Box>{children}</Box>
    </Flex>
  );
};

export {Section};
