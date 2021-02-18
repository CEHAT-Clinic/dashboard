import React, {useState, useEffect} from 'react';
import './NavigationBar.css';
import cehatLogo from './CEHATLogo.png';
import menuIcon from './menuIcon.png';
import {useTranslation} from 'react-i18next';

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

  // Toggles the navigation
  function toggleNav(): void {
    setIsNavVisible(!isNavVisible);
  }

  const {t} = useTranslation('menu');
  return (
    <div>
      <header className="Navigation_Header">
        {}
        {/* Logo in Spanish and English are the same */}
        <img src={cehatLogo} className="Logo" alt="Logo" />
        {/* CEHAT logo */}
        {isNavVisible && (
          <nav className="Nav">
            <a href="/">{t('home')}</a>
            <a href="/health">{t('healthInfo')}</a>
            <a href="/about">{t('about')}</a>
            <a href="/admin">{t('admin')}</a>
          </nav>
        )}
        <button onClick={toggleNav} className="Burger">
          <img src={menuIcon} className="menu-icon" alt={t('menuButton')} />
        </button>
      </header>
    </div>
  );
}

export default NavigationBar;
