import React from 'react';
import {Text, Heading, Box, Flex, Button} from '@chakra-ui/react';

interface AccessDeniedProps {
  reason: string;
}

/**
 *
 * @param reason - Message to be displayed to user as reason for no access to the page
 *
 * @remarks The input reason is placed after a default start message
 * @example
 * ```
 * // Displayed message: "You do not have access to this page because you are
 * // not signed in."
 * <AccessDenied reason="you are not signed in" />
 * ```
 */
const AccessDenied: ({reason}: AccessDeniedProps) => JSX.Element = ({
  reason,
}: AccessDeniedProps) => {
  return (
    <Flex width="full" align="center" justifyContent="center">
      <Box
        padding={8}
        margin={8}
        width="full"
        maxWidth="500px"
        borderWidth={1}
        borderRadius={8}
        boxShadow="lg"
        textAlign="center"
      >
        <Heading>Access Denied</Heading>
        <Text>You do not have access to this page because {reason}.</Text>
        <Button as="a" href="/" margin={1} width="50%">
          Return to Home
        </Button>
        <Button as="a" href="/admin" margin={1} width="50%">
          Return to Admin home
        </Button>
        <Text>
          If you think you should have access to this page, please contact a
          site administrator or a member of the South Gate CEHAT.
        </Text>
      </Box>
    </Flex>
  );
};

export default AccessDenied;
