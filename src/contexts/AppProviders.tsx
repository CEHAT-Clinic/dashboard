import {ChakraProvider} from '@chakra-ui/react';
import React from 'react';
import {AuthProvider} from './AuthContext';
import {ColorProvider} from './ColorContext';
// 1. Import the utilities
import {extendTheme} from '@chakra-ui/react';
import {createBreakpoints} from '@chakra-ui/theme-tools';

// 2. Update the breakpoints as key-value pairs
const breakpoints = createBreakpoints({
  sm: '30em',
  md: '55em',
  lg: '62em',
  xl: '80em',
});
// 3. Extend the theme
const theme = extendTheme({breakpoints});

/**
 * Interface to type the children components of the Providers.
 * Used for type safety of parameters of React.FC
 */
interface Props {
  children?: React.ReactNode;
}

/**
 * Provider to combine all app providers
 * - `ChakraProvider`: Provider for UI
 * - `ColorProvider`: Provider for current color scheme and to update color scheme
 * - `AuthProvider`: Provider for current authentication status and to update
 *   authentication status
 *
 * @param children - React components wrapped by the providers
 */
const AppProviders: React.FC<Props> = ({children}: Props) => {
  return (
    <ChakraProvider theme={theme}>
      <ColorProvider>
        <AuthProvider>{children}</AuthProvider>
      </ColorProvider>
    </ChakraProvider>
  );
};

export type {Props};

export default AppProviders;
