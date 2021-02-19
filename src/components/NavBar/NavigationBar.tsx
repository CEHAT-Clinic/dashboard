import React, {useState, useEffect} from 'react';
import './NavigationBar.css';
import cehatLogo from './CEHATLogo.png';
import {useTranslation} from 'react-i18next';
import {FaBars, FaGlobeAmericas} from 'react-icons/fa';

function NavigationBar(): JSX.Element {
  // State for whether to use globe or text, must be kept
  // separate because mobile should always be text, even
  // when nav bar is hidden
  const [isMobile, setIsMobile] = useState(window.matchMedia('(max-width: 700px)')?.matches
  );

  // State of nav bar (always visible in large screen)
  const [isNavVisible, setIsNavVisible] = useState(!isMobile);

  function handleScreenChange(this: MediaQueryList): void {
    if (this.matches) {
      setIsNavVisible(false);
      setIsMobile(true);
    } else {
      setIsNavVisible(true);
      setIsMobile(false);
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

  function toggleLanguage(): void {
    i18n.changeLanguage(i18n.language === 'en' ? 'es' : 'en');
  }

  const {t, i18n} = useTranslation('menu');
  return (
    <div>
      <header className="Navigation_Header">
        {/* Logo in Spanish and English are the same */}
        <img src={cehatLogo} className="Logo" alt="Logo" />
        {isNavVisible && (
          <nav>
            <a href="/">{t('home')}</a>
            <a href="/health">{t('healthInfo')}</a>
            <a href="/about">{t('about')}</a>
            <a href="/admin">{t('admin')}</a>
            <button id="changeLanguage" onClick={toggleLanguage}>
              {/* Display globe on desktop, but text in menu bard on mobile */}
              {isMobile ? (
                'Change Language/Cambia Idioma'
              ) : (
                <FaGlobeAmericas
                  aria-label="Change Language/Cambia Idioma"
                  title="Change Language/Cambia Idioma"
                />
              )}
            </button>
          </nav>
        )}
        <button onClick={toggleNav} className="Burger">
          <FaBars className="menu-icon" aria-label={t('menuButton')} />
        </button>
      </header>
    </div>
  );
}

export default NavigationBar;
