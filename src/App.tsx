import React, {Suspense} from 'react';
import NavigationBar from './components/NavBar/NavigationBar';
import LoadingNavBar from './components/NavBar/LoadingNavBar';
import Routes from './Routes';

const App: React.FC = () => (
  <div>
    <Suspense fallback={<LoadingNavBar />}>
      <NavigationBar />
    </Suspense>
    <Routes />
  </div>
);

export default App;
