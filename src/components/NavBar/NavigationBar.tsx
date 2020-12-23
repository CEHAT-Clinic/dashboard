import React, {useState, useEffect} from 'react';
import './NavigationBar.css';
import cehat_logo from './CEHAT_logo.png';
import menu_icon from './menu-icon.png';

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
    if (screenSize) {
      screenSize.addEventListener('change', handleScreenChange);
    }

    return function (): void {
      if (screenSize) {
        screenSize.removeEventListener('change', handleScreenChange);
      }
    };
  }, []);

  // toggles the navigation
  function toggleNav(): void {
    setIsNavVisible(!isNavVisible);
  }

  return (
    <div>
      <header className="Navigation_Header">
        <img src={cehat_logo} className="Logo" alt="logo" />
        {/* CEHAT logo */}
        {isNavVisible && (
          <nav className="Nav">
            <a href="/">Home</a>
            <a href="/about">About</a>
            <a href="/health">Health Information</a>
            <a href="/involved">Get Involved</a>
            <a href="/admin">Admin</a>
          </nav>
        )}
        <button onClick={toggleNav} className="Burger">
          <img src={menu_icon} className="menu-icon" alt="menu button" />
        </button>
      </header>
    </div>
  );
}

export default NavigationBar;
