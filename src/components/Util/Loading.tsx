import React from 'react';
import {Text, Flex, Box, Spinner} from '@chakra-ui/react';

/**
 * General loading components that displays a spinner and "Loading..." text
 */
const Loading: React.FC = () => (
  <Flex width="full" align="center" justifyContent="center">
    <Box
      padding={8}
      paddingTop={16}
      margin={8}
      width="full"
      maxWidth="500px"
      borderRadius={8}
      textAlign="center"
    >
      <Spinner
        thickness="4px"
        speed="1s"
        emptyColor="gray.200"
        color="blue.500"
        size="xl"
      />
      <Text>Loading...</Text>
    </Box>
  </Flex>
);

export default Loading;
