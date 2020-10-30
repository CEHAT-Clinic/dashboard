import React, {useState, useEffect} from 'react';
import './NavigationBar.css';
import Routes from '.././Routes';

function NavigationBar(): JSX.Element {
  // State of nav bar (always visible in large screen)
  const [isNavVisible, setIsNavVisible] = useState(true);

  function handleScreenChange(this: MediaQueryList): void {
    if (this.matches) {
      setIsNavVisible(false);
    } else {
      setIsNavVisible(true);
    }
  }

  // Updates the state and the dom when the window size is changed
  useEffect(() => {
    const screenSize = window.matchMedia('(max-width: 700px)');
    screenSize.addEventListener('change', handleScreenChange);

    return function (): void {
      screenSize.removeEventListener('change', handleScreenChange);
    };
  }, []);

  // toggles the navigation
  function toggleNav(): void {
    setIsNavVisible(!isNavVisible);
  }

  return (
    <div>
      <header className="Navigation_Header">
        <img src={require('./CEHAT_logo.png')} className="Logo" alt="logo" />{' '}
        {/* CEHAT logo */}
        {isNavVisible && (
          <nav className="Nav">
            <a href="/home">Home</a>
            <a href="/about">About</a>
            <a href="/health">Health Information</a>
            <a href="/involved">Get Involved</a>
            <a href="/admin">Admin</a>
          </nav>
        )}
        <button onClick={toggleNav} className="Burger">
          <img
            src={require('./menu-icon.png')}
            className="menu-icon"
            alt="menu button"
          />
        </button>
      </header>
      <Routes />
    </div>
  );
}

export default NavigationBar;
