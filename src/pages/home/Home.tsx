import React, {useState, useEffect} from 'react';
import {Box} from '@chakra-ui/react';
import OfflineHome from './OfflineHome';
import OnlineHome from './OnlineHome';

/**
 * Home screen component
 */
const Home: () => JSX.Element = () => {
  const [onlineStatus, setOnlineStatus] = useState(window.navigator.onLine);
  function handleNetworkChange(): void {
    const status = window.navigator.onLine;
    if (status) {
      // When moving online, delay so the rest of the home page can react
      // to the network status change
      const twoSeconds = 2000;
      setTimeout(() => setOnlineStatus(status), twoSeconds);
    } else {
      setOnlineStatus(status);
    }
  }

  useEffect(() => {
    window.addEventListener('offline', handleNetworkChange);
    window.addEventListener('online', handleNetworkChange);

    return function (): void {
      window.removeEventListener('offline', handleNetworkChange);
      window.removeEventListener('online', handleNetworkChange);
    };
  }, []);

  return <Box>{onlineStatus ? <OnlineHome /> : <OfflineHome />}</Box>;
};

export default Home;
