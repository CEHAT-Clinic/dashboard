# Community Air Quality Dashboard
This project is a collaboration between the Harvey Mudd College Clinic Program and the South Gate Community Environmental Health Action Team (CEHAT). This repository has all the code for the front and back end of a community air quality monitoring dashboard, accessible at https://sg-cehat-air-quality.web.app. All sensor data is gathered using affordable [PurpleAir](https://www2.purpleair.com) sensors owned by the CEHAT. This website is tailored for the South Gate community, but can easily be used as a template for other communities with the appropriate modifications. One important feature of the website is its availability in both English and Spanish, which is relevant to the community of South Gate, but the langauges can easily be changed.

## Disclaimer
This repository was worked on by students at Harvey Mudd College from August 2020 until May 2021 and will not be maintained afterwards. It is not likely that this project will be expanded, though it is possible if the CEHAT pursues extensions of this work in the future. Since there are no maintaners of the repository, do not attempt to make any changes, as they will never be reviewed. If you clone this repository for your own work, note that any major changes to the frameworks used in this project will not be reflected in the code.

## Scripts
See `SCRIPTS.md` for scripts that can be run with this app.

## Create React App
This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app). You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started). To learn React, check out the [React documentation](https://reactjs.org/).

## TypeScript
The main programming language used in this project is [TypeScript](https://www.typescriptlang.org). TypeScript is an object oriented langauge built on top of JavaScript, adding static type checking at compile time. To learn TypeScript, check out the [TypeScript documentation](https://www.typescriptlang.org/docs/).

## Database
See `DATABASE.md` for a description of how the Google Firestore database is structured.

## Libaries Used

### Chakra UI
[Chakra UI](https://chakra-ui.com) is an accessible component library for React applications. All the code in the `src` directory heavily depends on this components from this library. To learn how to use Chakra UI, check out the [documentation](https://chakra-ui.com/docs/getting-started) or the [GitHub](https://github.com/chakra-ui/chakra-ui/).

### Here Maps
[Here Maps](https://developer.here.com) is a mapping library that is compatible with JavaScript and TypeScript. We use this library for the map of our sensors that appears on the [home page](https://sg-cehat-air-quality.web.app) of the website. The only files with code dependent on HERE maps are `src/components/Map/Map.tsx` and `public/index.html` (where the scripts are included). We use their JavaScript API using an API key.

### i18next
[i18next](https://www.i18next.com) is an internationalization-framework for JavaScript. In our project, we use this library to write English (en) and Spanish (es) versions of all text that appears on the site. Our translations are used throughout the `src` directory, but the translations themselves are found in `public/locales/`. To learn how to use i18next, check out their [documentation](https://www.i18next.com).

### Axios
[Axios](https://axios-http.com) is a promise-based lightweight HTTP client that allows for more readable asyncronous code using the keywords `async` and `await`. We use this package in front end (`src`) and heavily in the backend (`functions`) to allow for asyncronous calls to our firestore database. For more information, check out the [documentation](https://axios-http.com/docs/intro) or the [GitHub](https://github.com/axios/axios).

### Other Packages
For a complete list of the packages used in this project check out the `package.json` file.
