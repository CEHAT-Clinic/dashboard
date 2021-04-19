import {Button} from '@chakra-ui/react';
import {useColor} from '../../contexts/ColorContext';
import React from 'react';
import {useTranslation} from 'react-i18next';

type ColorScheme = {
  good: Color;
  moderate: Color;
  sensitive: Color;
  unhealthy: Color;
  veryUnhealthy: Color;
  hazardous: Color;
  activeOpacity: number;
  inactiveOpacity: number;
};

type Color = {
  backgroundColor: string;
  textColor: string;
};

// These are the official colors from the EPA
const EpaColorScheme: ColorScheme = {
  good: {backgroundColor: '#08E400', textColor: 'black'},
  moderate: {backgroundColor: '#FEFF00', textColor: 'black'},
  sensitive: {backgroundColor: '#FF7E02', textColor: 'white'},
  unhealthy: {backgroundColor: '#FF0202', textColor: 'white'},
  veryUnhealthy: {backgroundColor: '#8F3F97', textColor: 'white'},
  hazardous: {backgroundColor: '#7E0224', textColor: 'white'},
  activeOpacity: 1,
  inactiveOpacity: 0.3,
};

// Chosen as color vision differences friendly
// based on ColorBrewer
const AccessibleColorScheme: ColorScheme = {
  good: {backgroundColor: '#4575B4', textColor: 'white'},
  moderate: {backgroundColor: '#91BFDB', textColor: 'black'},
  sensitive: {backgroundColor: '#E0F3F8', textColor: 'black'},
  unhealthy: {backgroundColor: '#FEE090', textColor: 'black'},
  veryUnhealthy: {backgroundColor: '#FC8D59', textColor: 'black'},
  hazardous: {backgroundColor: '#D73027', textColor: 'white'},
  activeOpacity: 1,
  inactiveOpacity: 0.6,
};

/**
 * Component to toggle color schemes
 */
const ColorToggle: React.FC = () => {
  const {currentColorScheme, toggleColorScheme} = useColor();
  const {t} = useTranslation('home');
  return (
    <Button
      onClick={toggleColorScheme}
      height={[null, null, '3vh', null]}
      colorScheme="green"
    >
      {currentColorScheme === EpaColorScheme ? t('useAccessible') : t('useEpa')}
    </Button>
  );
};

// Color for inactive sensors on the map in both the accessible and EPA color scheme
const InactiveSensorColor: Color = {
  backgroundColor: '#888888',
  textColor: 'black',
};

const LinkColor = '#0081de';

export type {ColorScheme, Color};
export {
  EpaColorScheme,
  AccessibleColorScheme,
  ColorToggle,
  InactiveSensorColor,
  LinkColor,
};
