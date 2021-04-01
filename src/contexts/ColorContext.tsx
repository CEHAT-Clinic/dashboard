import React, {createContext, useState, useContext} from 'react';
import {Props} from './AppProviders';
import {
  AccessibleColorScheme,
  ColorScheme,
  EpaColorScheme,
} from '../components/Util/Colors';

/**
 * Interface for ColorContext used for type safety
 *
 * - `currentColorScheme` the current color scheme
 */
interface ColorInterface {
  currentColorScheme: ColorScheme;
  toggleColorScheme: VoidFunction;
}

/**
 * Color context with default values
 */
const ColorContext = createContext<ColorInterface>({} as ColorInterface);

/**
 * Color Provider that wraps App to provide color scheme
 * throughout the entire app.
 * @param props - child React components that will consume the context
 */
const ColorProvider: React.FC<Props> = ({children}: Props) => {
  // --------------- State maintenance variables ------------------------
  const [currentColorScheme, setCurrentColorScheme] = useState(EpaColorScheme);
  // --------------- End state maintenance variables ------------------------

  /**
   * Switch between EPA and accessible color schemes
   */
  function toggleColorScheme(): void {
    const newScheme =
      currentColorScheme === EpaColorScheme
        ? AccessibleColorScheme
        : EpaColorScheme;
    setCurrentColorScheme(newScheme);
  }

  return (
    <ColorContext.Provider
      value={{
        currentColorScheme: currentColorScheme,
        toggleColorScheme: toggleColorScheme,
      }}
    >
      {children}
    </ColorContext.Provider>
  );
};

/**
 * Custom hook to allow other components to use color scheme
 * @returns `{currentColorScheme, toggleColorScheme}`
 */
const useColor: () => ColorInterface = () => useContext(ColorContext);

export {useColor, ColorContext, ColorProvider};
