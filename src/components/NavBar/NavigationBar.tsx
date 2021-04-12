import React, {useState, useEffect} from 'react';
import {Box, Text, Image, Stack, Button, Flex, HStack} from '@chakra-ui/react';
import {MenuToggle, MenuItem, LanguageToggle, Logo, MenuLinks} from './Util';
import {useTranslation} from 'react-i18next';

function NavigationBar(): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(
    window.matchMedia('(max-width: 47.9em)')?.matches ?? false
  );

  const toggle = () => setIsOpen(!isOpen);
  const {t, i18n} = useTranslation('menu');

  /** Toggle the language of the website between English and Spanish. Close menu bar after toggling if on mobile. */
  function toggleLanguage(): void {
    i18n.changeLanguage(i18n.language === 'en' ? 'es' : 'en');
    setIsOpen(false);
  }

  /** Adjust UI for switching between narrow/mobile and wide/desktop modes */
  function handleScreenChange(this: MediaQueryList): void {
    // Is the screen size mobile size
    if (this.matches) {
      setIsOpen(false);
      setIsMobile(true);
    } else {
      setIsOpen(true);
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

  return (
    <Flex
      as="nav"
      align="center"
      justify="space-between"
      wrap="wrap"
      w="100%"
      mb={2}
      p={3}
      background="teal"
      color="white"
    >
      <Logo />
      {isMobile && <MenuToggle toggle={toggle} isOpen={isOpen} />}
      <MenuLinks
        isOpen={isOpen}
        isMobile={isMobile}
        toggleLanguage={toggleLanguage}
      />
    </Flex>
  );
}

export default NavigationBar;
