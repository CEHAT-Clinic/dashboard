import React from 'react';
import NavigationBar from './components/NavBar/NavigationBar';
import Routes from './Routes';

const App: React.FC = () => (
  <div>
    <NavigationBar />
    <Routes />
  </div>
);

export default App;
