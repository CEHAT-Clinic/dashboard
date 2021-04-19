import React from 'react';
import {Box} from '@chakra-ui/react';

/**
 * @returns component for the navigation bar at the top of the screen
 */
function LoadingNavBar(): JSX.Element {
  return <Box w="100%" h="4em" mb={2} p={3} background="#32bfd1" zIndex="3" />;
}

export default LoadingNavBar;
