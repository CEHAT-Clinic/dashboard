import React, {useState, useEffect} from 'react';
import {Flex} from '@chakra-ui/react';
import Logo from './Logo';
import MenuToggle from './MenuToggle';
import MenuLinks from './MenuLinks';
import {useTranslation} from 'react-i18next';

/**
 * @returns component for the navigation bar at the top of the screen
 */
function NavigationBar(): JSX.Element {
  const [isMobile, setIsMobile] = useState(
    window.matchMedia('(max-width: 47.9em)')?.matches ?? false
  );
  const [isOpen, setIsOpen] = useState(!isMobile);
  const [isScrolled, setIsScrolled] = useState(false);

  const {i18n} = useTranslation('menu');

  /**
   * Toggles the langauge of the website between English and Spanish
   * On Mobile, the menu is closed after toggling
   */
  function toggleLanguage(): void {
    i18n.changeLanguage(i18n.language === 'en' ? 'es' : 'en');
    if (isMobile) {
      setIsOpen(false);
    }
  }

  /**
   * Adjust UI for switching between mobile and desktop modes
   * @param this - a media query that either matches or doesn't
   */
  function handleScreenChange(this: MediaQueryList): void {
    // Is the screen size mobile size
    if (this.matches) {
      // True when the screen-width is at most 47.9em
      setIsOpen(false);
      setIsMobile(true);
    } else {
      setIsOpen(true);
      setIsMobile(false);
    }
  }

  /**
   * Event listener for screen size. Adjusts the state and the dom when
   * the window size is changed.
   */
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

  /**
   * Event listener for scrolling
   */
  useEffect(() => {
    /**
     * Sets isScrolled depending on how far the user has scrolled
     */
    function handleScroll(): void {
      let scrollThreshold = 120;
      if (isMobile) {
        /* eslint-disable-next-line no-magic-numbers */
        scrollThreshold = 800;
      }
      const offset = window.scrollY;
      if (offset > scrollThreshold) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    }

    window.addEventListener('scroll', handleScroll);
    return function (): void {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isMobile]);

  return (
    <Flex
      align="center"
      justify="space-between"
      wrap="wrap"
      w="100%"
      mb={2}
      p={3}
      background="#32bfd1"
      color="white"
      position={isScrolled ? 'fixed' : 'static'}
      top={isScrolled ? '0' : 'auto'}
      left={isScrolled ? '0' : 'auto'}
      zIndex="3"
    >
      <Logo />
      {isMobile && (
        <MenuToggle menuToggle={() => setIsOpen(!isOpen)} isOpen={isOpen} />
      )}
      <MenuLinks
        isOpen={isOpen}
        isMobile={isMobile}
        toggleLanguage={toggleLanguage}
      />
    </Flex>
  );
}

export default NavigationBar;
