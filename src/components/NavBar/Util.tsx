import React from 'react';
import {Box, Link, Text, Button, Image, Stack} from '@chakra-ui/react';
import {CloseIcon} from '@chakra-ui/icons';
import {FaBars, FaGlobeAmericas} from 'react-icons/fa';
import logo512 from './logo512.png';
import {useTranslation} from 'react-i18next';

/**
 * Props for Menu Toggle Button
 */
interface MenuToggleProps {
  toggle: () => void;
  isOpen: boolean;
}

/**
 * Menu toggle button for mobile-sized screens
 * @param toggle - function that toggles whether the menu is open or closed
 * @param isOpen - boolean, is the menu open
 * @returns a button that toggles the menu when clicked
 */
const MenuToggle: ({toggle, isOpen}: MenuToggleProps) => JSX.Element = ({
  toggle,
  isOpen,
}: MenuToggleProps) => {
  return (
    <Button
      variant="ghost"
      _hover={{background: 'teal'}}
      onClick={toggle}
      width="60px"
    >
      {isOpen ? <CloseIcon size="lg" /> : <FaBars size="lg" />}
    </Button>
  );
};

/**
 * Props for the Language Toggle
 */
interface LanguageToggleProps {
  toggle: () => void;
}

/**
 * Button to change the language between English and Spanish
 * @param toggle - function that toggles the website language
 * @returns a button that toggles the language when clicked
 */
const LanguageToggle: ({toggle}: LanguageToggleProps) => JSX.Element = ({
  toggle,
}: LanguageToggleProps) => {
  const {t} = useTranslation('menu');
  return (
    <Button
      variant="ghost"
      _hover={{background: 'teal', fontWeight: 'bold'}}
      id="changeLanguage"
      onClick={toggle}
      mt={0}
    >
      <FaGlobeAmericas />
      <Text paddingLeft={2} fontSize="xl">
        {t('changeLanguage')}
      </Text>
    </Button>
  );
};

/**
 * Props for a single item in the navigation menu
 */
interface MenuItemProps {
  label: string;
  href: string;
}

/**
 * A single item in the navigation menu
 * @param label - user-facing text for the item
 * @param href - the page that this item routes to
 * @returns a navigation link
 */
const MenuItem: ({label, href}: MenuItemProps) => JSX.Element = ({
  label,
  href,
}: MenuItemProps) => {
  return (
    <Link href={href} textAlign="center">
      <Text _hover={{fontWeight: 'bold'}} fontSize="xl">
        {label}
      </Text>
    </Link>
  );
};

/**
 * @returns the logo for the top left corner of the site
 */
const Logo: () => JSX.Element = () => {
  return (
    <Box>
      <Image width="60px" src={logo512}></Image>
    </Box>
  );
};

/**
 * Props for the set of options in the navigation bar
 */
interface MenuLinksProps {
  isOpen: boolean;
  toggleLanguage: () => void;
  isMobile: boolean;
}

/**
 * The set of all options for the navigation bar
 * @param isOpen - boolean, is the navigation open (should it be displayed)
 * @param isMobile - boolean, is the screen small/mobile sized
 * @param toggleLanguage - function to toggle the website language
 * @returns a component for all options in the navigation bar
 */
const MenuLinks: ({
  isOpen,
  isMobile,
  toggleLanguage,
}: MenuLinksProps) => JSX.Element = ({
  isOpen,
  isMobile,
  toggleLanguage,
}: MenuLinksProps) => {
  const {t} = useTranslation('menu');

  return (
    <Box width={['100%', null, 'auto', null]}>
      {isOpen && (
        <Stack
          spacing={['3', null, '8', '10']}
          alignItems="center"
          justify={['center', null, 'flex-end', null]}
          direction={['column', null, 'row', null]}
          pt={['4', null, 0, null]}
        >
          <MenuItem href="/" label={t('home')} />
          <MenuItem href="/health" label={t('healthInfo')} />
          <MenuItem href="/about" label={t('about')} />
          <LanguageToggle toggle={toggleLanguage} />
        </Stack>
      )}
    </Box>
  );
};

export {MenuToggle, Logo, MenuLinks};
