import React, {Suspense} from 'react';
import NavigationBar from './components/NavBar/NavigationBar';
import LoadingNavBar from './components/NavBar/LoadingNavBar';
import Routes from './Routes';
import {Box} from '@chakra-ui/react';
import AppProviders from './contexts/AppProviders';

const App: React.FC = () => (
  // The overflowX and position prevent horizontal scrolling
  <AppProviders>
    <Box overflowX="hidden" position="relative" maxWidth="100%">
      <Suspense fallback={<LoadingNavBar />}>
        <NavigationBar />
      </Suspense>
      <Routes />
    </Box>
  </AppProviders>
);

export default App;
