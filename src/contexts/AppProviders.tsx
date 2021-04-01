import {ChakraProvider} from '@chakra-ui/react';
import React from 'react';
import {AuthProvider} from './AuthContext';
import {ColorProvider} from './ColorContext';

/**
 * Interface to type the children components of the Providers.
 * Used for type safety of parameters of React.FC
 */
interface Props {
  children?: React.ReactNode;
}

/**
 * Provider to combine all app providers
 * ChakraProvider: Provider for UI
 * ColorProvider: Provider for current color scheme and to update color scheme
 * AuthProvider: Provider for current authentication status and to update
 *               authentication status
 *
 * @param props - React components wrapped by the providers
 */
const AppProviders: React.FC<Props> = ({children}: Props) => {
  return (
    <ChakraProvider>
      <ColorProvider>
        <AuthProvider>{children}</AuthProvider>
      </ColorProvider>
    </ChakraProvider>
  );
};

export type {Props};

export default AppProviders;
