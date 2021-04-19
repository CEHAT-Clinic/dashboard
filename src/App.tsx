import React, {Suspense} from 'react';
import NavigationBar from './components/NavBar/NavigationBar';
import LoadingNavBar from './components/NavBar/LoadingNavBar';
import Routes from './Routes';
import {Box} from '@chakra-ui/react';

const App: React.FC = () => {
  return (
    // The overflowX and position prevent horizontal scrolling
    <Box overflowX="hidden" position="relative">
      <Suspense fallback={<LoadingNavBar />}>
        <NavigationBar />
      </Suspense>
      <Routes />
    </Box>
  );
};

export default App;
