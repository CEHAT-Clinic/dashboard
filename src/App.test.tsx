import React from 'react';
import {render} from '@testing-library/react';
import App from './App';

jest.mock('react-i18next', () => ({
  // This mock makes sure any components using the translate hook can use it without a warning being shown
  useTranslation: () => {
    return {
      t: (s: string) => s,
      i18n: {
        /* eslint-disable @typescript-eslint/no-empty-function */
        changeLanguage: () => new Promise(() => {}),
        /* eslint-enable @typescript-eslint/no-empty-function */
      },
    };
  },
}));

// Temporary test to have at least one test
// Checks if appp renders without a failure
test('App renders', () => {
  render(<App />);  
});
