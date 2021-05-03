# How to Clone this Website

When creating this website, we wanted to make the code generalizable such that other communities could use the same software. We hope this document outlines the process enough that someone with sufficient experience with programming would be able to re-create this app for another community. **Make sure you read this entire document if you are copying this website.**

There is still much work to make the website cloning process simpler, and this document will not describe each step thorougly enough, so making the cloning process simpler would be a great extension of this project.

## Development and Node.js

This project uses Node.js for development. To start developing, you will need to install Node.js for your computer by going to the [Node.js website](https://nodejs.org/). We also recommend using an integrated development environment (IDE) like [Visual Studio Code](https://code.visualstudio.com/).

## Setting up Firebase

We use Firebase for hosting our website, our database, authentication for admin users, and for our back end that fetches data from PurpleAir. To use Firebase, you will first need to create a Firebase project. Create an account with on the [Firebase Console](https://console.firebase.google.com/) and follow the instructions to add a project.

You will also need to install the [Firebase CLI](https://firebase.google.com/docs/cli#setup_update_cli).

### Pricing: Blaze Plan

Since we use Cloud Functions, you will need to upgrade to the Blaze plan, where you "pay as you go" as you use different services. We find that the website costs less than \$5 per month to run as of Spring 2021. If you download or delete data in a month, this will increase the costs some, with downloading readings costing \$0.06/100K readings and deleting old readings costing \$0.08/100K (to read and then delete each reading) in Spring 2021. Firebase's updated costs can be found at their [Pricing Documentation](https://firebase.google.com/pricing).

### Firestore

From the Firestore Database panel, click "Create database" and "Start in production mode". This will create the initial Firestore security rules that denies all reads and writes to the database, but the GitHub repository includes the security rules that you will need. For the Cloud Firestore location, the default value should work, but feel free to check out the documentation.

To initialize Firestore, you will need to create the following collections and documents:

- `users` collection
- `sensors` collection
- `deletion` collection
  - `users` doc
  - `readings` doc
- `current-readings` collection

The Firestore database structure is further documented in `DATABASE.md`. Initialize the `users` doc and the `readings` doc in the `deletion` collection with empty arrays for each of the values described in `DATABASE.md`.

### Cloud Functions

From the Functions panel, click "Get started" and follow the instructions from Firebase. Once Functions are enabled, the Cloud Functions that are in the `functions` directory of the project will be automatically deployed when the Firebase project is deployed.

#### Firebase Functions Config

To use the PurpleAir read and write API keys in the Cloud Functions, you will need to set the Functions config. After installing the Firebase CLI, run the following command, using your PurpleAir read and write keys:

```bash
firebase functions:config:set purpleair.write_key="YOUR PURPLEAIR WRITE KEY" purpleair.read_key="YOUR PURPLEAIR READ KEY"
```

Before you will be able to use the config, you will need to re-deploy the Cloud Functions. For more information, see the [Firebase Functions Config Documenation](https://firebase.google.com/docs/functions/config-env).

### Authentication

From the Authentication panel, click "Get started" and enable the Email/Password and Google providers.

Note that for admin functionality of the website, it assumes that an admin user exists already. From the Firebase console, create a user for yourself that you can later use to sign into the website.

Once you have run the website and you sign in with your account through the website, you will need to go into your user doc in Firestore (`users` collection and the doc ID is your uid in Firebase Authentication) and set the `admin` field to `true`. This document will automatically be created after you sign into your account through the website, but you can also create this document. After you make yourself an admin user, you will be able to add and remove other users from the website without interacting wtih the Firestore database directly.

Another good extension of this project would be to create a process for when no admin users exist yet.

### Hosting

From the Hosting panel, click "Get started" and follow the instructions from Firebase to deploy the app. This will involve working with some of the code locally on your computer, so it's probably best to do this step last after completing the other steps described in this document.

## API Keys and Development Environment

We use API keys for Firebase, HERE maps, and PurpleAir, and it is important that these API keys are not posted publicly anywhere. See below for instructions on obtaining each API key.

For local front-end development, create a `.env` file in the root directory structured as follows, with your API keys:

```json
REACT_APP_FIREBASE_API_KEY = "YOUR_KEY"
REACT_APP_FIREBASE_AUTH_DOMAIN = "YOUR_AUTH_DOMAIN"
REACT_APP_FIREBASE_DATABASE_URL = "YOUR_DATABASE_URL"
REACT_APP_FIREBASE_PROJECT_ID = "YOUR_PROJECT_ID"
REACT_APP_FIREBASE_STORAGE_BUCKET = "YOUR_STORAGE_BUCKET"
REACT_APP_FIREBASE_MESSAGING_SENDER_ID = "YOUR_SENDER_ID"
REACT_APP_FIREBASE_APP_ID = "YOUR_APP_ID"
REACT_APP_FIREBASE_MEASUREMENT_ID = "YOUR_MEASUREMENT_ID"
REACT_APP_HERE_API_KEY = "YOUR_API_KEY"
REACT_APP_PURPLEAIR_READ_API_KEY = "YOUR_READ_KEY"
REACT_APP_PURPLEAIR_WRITE_API_KEY = "YOUR_WRITE_KEY"
```

The `.env` file is included in `.gitignore`, so the `.env` file will not be pushed to GitHub. Thus, each person working on the repository will need to have a copy of the same `.env` file on their local computer.

### Firebase

You will need to add the API keys from your Firebase setup. These API keys can be found from the [Firebase console](https://console.firebase.google.com/) for the project that you created by going to `Settings` -> `Project settings`. Under the `General` tab, scroll to `Your apps` -> `Firebase SDK snippet` and choose the `Config` selector. This will show a configuration with your project's keys:

```typescript
const firebaseConfig = {
  apiKey: "YOUR KEY",
  authDomain: "YOUR APP.firebaseapp.com",
  databaseURL: "https://YOUR APP.firebaseio.com",
  projectId: "YOUR PROJECT ID",
  storageBucket: "YOUR BUCKET",
  messagingSenderId: "YOUR ID",
  appId: "YOUR ID",
  measurementId: "YOUR ID"
};
```

Copy each of these values into the appropriate location in your local `.env` file. You will also need these values for the GitHub Secrets, as described in the Setting up GitHub section.

### HERE maps

We use HERE maps for the mapping software on the front page. Sign up for Freemium account on the [HERE maps developer website](https://developer.here.com/). The free tier for map usage is fairly large, so the free tier was more than enough for our use case. However, if you expect heavy usage of your website, you may need to upgrade to a paid version. From your account, generate a JavaScript app and then create your API key. This is the API key that the application will use. Add this API key to the `.env` file in the appropriate place and to the GitHub Secrets as described in the Setting up GitHub section.

### PurpleAir

For PurpleAir, you will need to email <contact@purpleair.com> to get a WRITE key and READ key. Add both of these API keys to the `.env` file in the appropriate place and to the GitHub Secrets as described in the Setting up GitHub section.

## Setting up GitHub

We use GitHub for development and continuous deployment.

### GitHub Secrets

We use GitHub Secrets for two purposes: to store secrets (like API keys) for the front end of the website, and for the continuous deployment of the website. Add the following secrets to GitHub secrets:

- `FIREBASE_TOKEN` - the token to use for authentication for continuous deployment. This token can be aquired through the `firebase login:ci` command. See [GitHub Actions for Firebase](https://github.com/w9jds/firebase-action) for more information
- `PURPLEAIR_READ_API_KEY` - the READ API key for PurpleAir
- `PURPLEAIR_WRITE_API_KEY` - the WRITE API key for PurpleAir
- `REACT_APP_FIREBASE_API_KEY` - same value as the value in `.env`
- `REACT_APP_FIREBASE_AUTH_DOMAIN` - same value as the value in `.env`
- `REACT_APP_FIREBASE_DATABASE_URL` - same value as the value in `.env`
- `REACT_APP_FIREBASE_PROJECT_ID` - same value as the value in `.env`
- `REACT_APP_FIREBASE_STORAGE_BUCKET` - same value as the value in `.env`
- `REACT_APP_FIREBASE_MESSAGING_SENDER_ID` - same value as the value in `.env`
- `REACT_APP_FIREBASE_APP_ID` - same value as the value in `.env`
- `REACT_APP_FIREBASE_MEASUREMENT_ID` - same value as the value in `.env`
- `REACT_APP_HERE_API_KEY` - same value as the value in `.env`

### Continuous Deployment

We use [GitHub Actions for Firebase](https://github.com/w9jds/firebase-action) to automatically re-deploy our website whenever code is pushed to the `main` branch. This re-deploys Firebase Hosting and our Firebase Cloud Functions. To use this action, you need to add an authentication token for Firebase to GitHub Secrets with the secret name `FIREBASE_TOKEN`. As the documentation describes, this token can be aquired through the `firebase login:ci` command run locally on your computer after setting up the Firebase CLI. The GitHub Secrets are also used to re-create the `.env` file for GitHub to use for deployment so that the live website has access to the API keys necessary for functionality.

In GitHub, you will also need to make sure that Actions are enabled under the repository's Settings.

### Dependabot

If you are actively developing the app, you will want to re-enable Dependabot, which automatically creates pull requests to update the libraries that the app uses. To re-enable Dependabot, remove each of the `open-pull-requests-limit: 0` lines in `.github/dependabot.yml` file.

## Local content

This app was originally developed for the community of South Gate, California. Much of the South Gate specific content was externalized to a few files so that modifying the website for use with another community. However, further externalization of content specific to South Gate would be a good extension of this project.

### Static Content

All static content is in the `public/locales/` directory.

- Most of the content in `health.json` files used by the `Health Information` page is generalizable to other communities, except for the beginning that descibes health concerns in South Gate.
- Much of the content in the `about.json` files used by the `About` page will need to be updated for other communities.
- In the `administration.json` files, the `accessDenied.shouldHaveAccess` key should be updated to say who should be contacted in case someone wants to be an administrator of the website.

### Website Metadata

- In `src/components/NavBar/Logo.tsx`, the website name needs to be updated.
- The logo file for the South Gate CEHAT `src/media/CEHATLogo.png`, which is used in the `src/pages/About.tsx` file, should be updated to the appropriate organization logo.
- `public/index.html` needs the website title and the description updated. In each of the following lines, update the content with the appropriate `CITY_NAME`:

  ```html
  <title>CITY_NAME Air Quality</title>
  ```

  ```html
  <meta
    name="description"
    content="Website for air quality information in CITY_NAME"
  />
  ```

### HERE Maps Location

In `src/components/Map/Map.tsx`, you will need to update the latitude and longitude values and borders. These values are found in the following locations in the file:

At the beginning of `componentDidMount()` when the `Map` is created:

```typescript
const map = new H.Map(
  safeMapRef, // Reference for Map
  defaultLayers.vector.normal.map,
  {
    zoom: minZoom,
    center: {lat: 33.957, lng: -118.2}, // South Gate coordinates
    pixelRatio: window.devicePixelRatio || defaultPixelRatio,
  }
);
```

At the end of `componentDidMount()` before the `restrictMovement` function is called:

```typescript
const [topLat, leftLong, bottomLat, rightLong] = [
  33.974,
  -118.288,
  33.92,
  -118.165,
];
```

### PurpleAir group

You will need to create a PurpleAir group for group queries using your PurpleAir API WRITE key. You can create a new group directly from the [PurpleAir API interface](https://api.purpleair.com/#api-groups-create-group) using your WRITE key in the X-API-Key field. Add a name to the group and send the request. Upon success, you will receive a response like this:

```json
201 success
{
  "api_version":"V1.0.6-0.0.9",
  "time_stamp":1619817726,
  "group_id": 563
}
```

The `group_id` field is the group ID that will be used by the website. In `src/purpleair.ts` and `functions/src/purpleAir.ts`, set the `GROUP_ID` variable to the value of `group_id`. In the example above, you would set the `GROUP_ID` variable to `563`.
