import React from 'react';
import {useTranslation} from 'react-i18next';
import {Button, Text} from '@chakra-ui/react';
import {FaGlobeAmericas} from 'react-icons/fa';

/**
 * Props for the Language Toggle
 */
interface LanguageToggleProps {
  languageToggle: () => void;
}

/**
 * Button to change the language between English and Spanish
 * @param toggle - function that toggles the website language
 * @returns a button that toggles the language when clicked
 */
const LanguageToggle: ({
  languageToggle,
}: LanguageToggleProps) => JSX.Element = ({
  languageToggle,
}: LanguageToggleProps) => {
  const {t} = useTranslation('menu');
  return (
    <Button
      variant="ghost"
      _hover={{background: '#32bfd1', fontWeight: 'bold'}}
      id="changeLanguage"
      onClick={languageToggle}
      fontWeight="regular"
      mt={0}
    >
      <FaGlobeAmericas />
      <Text paddingLeft={2} fontSize="xl">
        {t('changeLanguage')}
      </Text>
    </Button>
  );
};

export default LanguageToggle;
