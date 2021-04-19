import React, {Suspense} from 'react';
import NavigationBar from './components/NavBar/NavigationBar';
import LoadingNavBar from './components/NavBar/LoadingNavBar';
import Routes from './Routes';
import {Box} from '@chakra-ui/react';

const App: React.FC = () => (
  // Box attributes used to help prevent horizontal scrolling
  <Box overflowX="hidden" position="relative" maxWidth="100vw">
    <Suspense fallback={<LoadingNavBar />}>
      <NavigationBar />
    </Suspense>
    <Routes />
  </Box>
);

export default App;
