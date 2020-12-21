import {ChakraProvider} from '@chakra-ui/react';
import React from 'react';

/**
 * Interface to type the children components of the Providers.
 * Used for type safety of parameters of React.FC
 */
interface Props {
  children?: React.ReactNode;
}

/**
 * Provider to combine all app providers, used in index.tsx
 * @param props React components wrapped by the providers
 */
const AppProviders: React.FC<Props> = ({children}: Props) => {
  return <ChakraProvider>{children}</ChakraProvider>;
};

export type {Props};

export default AppProviders;
