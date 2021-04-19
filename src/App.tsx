import React, {Suspense} from 'react';
import NavigationBar from './components/NavBar/NavigationBar';
import LoadingNavBar from './components/NavBar/LoadingNavBar';
import Routes from './Routes';
import {Box} from '@chakra-ui/react';
import AppProviders from './contexts/AppProviders';

const App: React.FC = () => (
  // The overflowX and position prevent horizontal scrolling
  <Box overflowX="hidden" position="relative" maxWidth="100%">
    <AppProviders>
      <Suspense fallback={<LoadingNavBar />}>
        <NavigationBar />
      </Suspense>
      <Routes />
    </AppProviders>
  </Box>
);

export default App;
