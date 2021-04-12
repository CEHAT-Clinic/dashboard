import React from 'react';
import {useTranslation} from 'react-i18next';
import {Box, Stack, Link, Text} from '@chakra-ui/react';
import LanguageToggle from './LanguageToggle';

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
    <Link href={href} textAlign="center" _hover={{textDecor: 'none'}}>
      <Text _hover={{fontWeight: 'bold'}} fontSize="xl">
        {label}
      </Text>
    </Link>
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
          spacing={['3', null, '4', '12']}
          alignItems="center"
          justify={['center', null, 'flex-end', null]}
          direction={['column', null, 'row', null]}
          pt={['4', null, 0, null]}
        >
          <MenuItem href="/" label={t('map')} />
          <MenuItem href="/health" label={t('healthInfo')} />
          <MenuItem href="/about" label={t('about')} />
          <LanguageToggle toggle={toggleLanguage} />
        </Stack>
      )}
    </Box>
  );
};

export default MenuLinks;
