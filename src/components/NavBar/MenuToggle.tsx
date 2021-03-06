import React from 'react';
import {Button} from '@chakra-ui/react';
import {CloseIcon, HamburgerIcon} from '@chakra-ui/icons';

/**
 * Props for Menu Toggle Button
 */
interface MenuToggleProps {
  menuToggle: () => void;
  isOpen: boolean;
}

/**
 * Menu toggle button for mobile-sized screens
 * @param toggle - function that toggles whether the menu is open or closed
 * @param isOpen - boolean, is the menu open
 * @returns a button that toggles the menu when clicked
 */
const MenuToggle: ({menuToggle, isOpen}: MenuToggleProps) => JSX.Element = ({
  menuToggle,
  isOpen,
}: MenuToggleProps) => {
  return (
    <Button
      variant="ghost"
      _hover={{background: '#32bfd1'}}
      onClick={menuToggle}
      width="60px"
    >
      {isOpen ? <CloseIcon size="lg" /> : <HamburgerIcon w={7} h={7} />}
    </Button>
  );
};

export default MenuToggle;
