import React from 'react';
import {
  Box,
  Link,
  Text,
  Button,
  Image,
  Stack,
  Center,
  Flex,
  LinkOverlay,
  Grid,
} from '@chakra-ui/react';
import {CloseIcon} from '@chakra-ui/icons';
import {FaBars, FaGlobeAmericas} from 'react-icons/fa';
import cehatLogo from './CEHATLogo.png';
import logo512 from './logo512.png';

// TODO: write all doc strings

interface MenuToggleProps {
  toggle: () => void;
  isOpen: boolean;
}

const MenuToggle: ({toggle, isOpen}: MenuToggleProps) => JSX.Element = ({
  toggle,
  isOpen,
}: MenuToggleProps) => {
  return (
    <Flex width="100%" justify="flex-end" align="center">
      <Button variant="ghost" _hover={{bg: 'teal'}} onClick={toggle}>
        {isOpen ? <CloseIcon size="lg" /> : <FaBars size="lg" />}
      </Button>
    </Flex>
  );
};

interface LanguageToggleProps {
  toggle: () => void;
}

// TODO: externalize strings
const LanguageToggle: ({toggle}: LanguageToggleProps) => JSX.Element = ({
  toggle,
}: LanguageToggleProps) => {
  return (
    <Button
      variant="ghost"
      _hover={{bg: 'teal', fontWeight: 'bold'}}
      id="changeLanguage"
      onClick={toggle}
    >
      <FaGlobeAmericas />
      <Text paddingLeft={2} fontSize="xl">
        English
      </Text>
    </Button>
  );
};

interface MenuItemProps {
  label: string;
  href: string;
}

// TODO: isLast?
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

// TODO pass width in as prop
const Logo: () => JSX.Element = () => {
  return (
    <Box>
      <Image width="60px" src={logo512}></Image>
    </Box>
  );
};

interface MenuLinksProps {
  isOpen: boolean;
  toggleLanguage: () => void;
  isMobile: boolean;
}

const MenuLinks: ({
  isOpen,
  toggleLanguage,
  isMobile,
}: MenuLinksProps) => JSX.Element = ({
  isOpen,
  toggleLanguage,
  isMobile,
}: MenuLinksProps) => {
  return (
    <Box width="100%">
      {isOpen && (
        <Stack
          spacing={10}
          alignItems="center"
          justify={['center', 'center', 'flex-end', null]}
          direction={['column', 'column', 'row', 'row']}
          pt={[4, 4, 0, 0]}
        >
          <MenuItem href="/" label="Home" />
          <MenuItem href="/health" label="Health Information" />
          <MenuItem href="/about" label="About" />
          <LanguageToggle toggle={toggleLanguage} />
        </Stack>
      )}
    </Box>
  );
};

export {MenuToggle, MenuItem, LanguageToggle, Logo, MenuLinks};
