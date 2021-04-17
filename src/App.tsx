import React, {Suspense} from 'react';
import NavigationBar from './components/NavBar/NavigationBar';
import Loading from './components/Util/Loading';
import Routes from './Routes';
import {Box} from '@chakra-ui/react';

const App: React.FC = () => (
  // The overflowX and position prevent horizontal scrolling
  <Box overflowX="hidden" position="relative">
    <Suspense fallback={<Loading />}>
      <NavigationBar />
    </Suspense>
    <Routes />
  </Box>
);

export default App;
