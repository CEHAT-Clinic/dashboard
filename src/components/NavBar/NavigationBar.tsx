import React, {useState, useEffect} from 'react';
import './NavigationBar.css';
import cehatLogo from './CEHATLogo.png';
import {useTranslation} from 'react-i18next';
import {FaBars, FaGlobeAmericas} from 'react-icons/fa';
import {Icon} from '@chakra-ui/react';

/** Element for the navigation bar for use on all pages */
function NavigationBar(): JSX.Element {
  // State for whether to use globe or text, must be kept
  // separate because mobile should always be text, even
  // when nav bar is hidden
  const [isMobile, setIsMobile] = useState(
    window.matchMedia('(max-width: 47.9em)')?.matches ?? false
  );

  // State of nav bar (always visible in large screen)
  const [isNavVisible, setIsNavVisible] = useState(!isMobile);

  /** Adjust UI for switching between narrow/mobile and wide/desktop modes */
  function handleScreenChange(this: MediaQueryList): void {
    // Is the screen size mobile size
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
    const screenSize = window.matchMedia('(max-width: 47.9em)');
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

  /** Toggle the language of the website between English and Spanish. Close menu bar after toggling if on mobile. */
  function toggleLanguage(): void {
    i18n.changeLanguage(i18n.language === 'en' ? 'es' : 'en');
    if (isMobile) {
      toggleNav();
    }
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
              <Icon as={FaGlobeAmericas} id="globe" title={t('globeIcon')} />
              {t('changeLanguage')}
            </button>
          </nav>
        )}
        <button onClick={toggleNav} className="Burger">
          <Icon
            as={FaBars}
            className="menu-icon"
            aria-label={t('menuButton')}
          />
        </button>
      </header>
    </div>
  );
}

export default NavigationBar;
