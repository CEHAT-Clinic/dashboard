import React from 'react';
import {render} from '@testing-library/react';
import App from './App';

// Temporary test to have at least one test
// Checks if "Home" appears in the app
test('South Gate shows up on page', () => {
    const {getByText} = render(<App />);
    const home = getByText('Home');
    expect(home).toBeInTheDocument();
});
