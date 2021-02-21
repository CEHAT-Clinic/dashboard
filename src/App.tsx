import React, {Suspense} from 'react';
import NavigationBar from './components/NavBar/NavigationBar';
import Loading from './components/Util/Loading';
import Routes from './Routes';

const App: React.FC = () => (
  <div>
    <Suspense fallback={<Loading />}>
      <NavigationBar />
    </Suspense>
    <Routes />
  </div>
);

export default App;
