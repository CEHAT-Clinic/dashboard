import React from 'react';
import {Button} from '@chakra-ui/react';
import {CloseIcon} from '@chakra-ui/icons';
import {FaBars} from 'react-icons/fa';

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
      _hover={{background: '#32bfd1'}}
      onClick={toggle}
      width="60px"
    >
      {isOpen ? <CloseIcon size="lg" /> : <FaBars size="lg" />}
    </Button>
  );
};

export default MenuToggle;
