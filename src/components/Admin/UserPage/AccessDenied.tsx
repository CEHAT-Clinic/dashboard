import React from 'react';
import {Text, Heading, Box, Link} from '@chakra-ui/react';

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
    <Box>
      <Heading>Access Denied</Heading>
      <Text>You do not have access to this page because {reason}.</Text>
      <Text>
        Redirect to <Link href="/">Home</Link> or{' '}
        <Link href="/admin">Admin Home</Link>
      </Text>
      <Text>
        If you think you should have access to this page, please contact a site
        administrator or a member of the South Gate CEHAT.
      </Text>
    </Box>
  );
};

export default AccessDenied;
