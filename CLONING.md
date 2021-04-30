# How to Clone this App

When creating this application, we wanted to make the code general such that other communities could use the same software for their own community. We hope this document outlines the process enough that someone with sufficient experience with programming would be able to re-create this app for another community.

There is still much work to make the website cloning process simpler, and this document will not describe each step thorougly enough, so making the cloning process simpler would be a great extension of this project.

## Development and Node.js

This project uses Node.js for development. To start developing, you will need to install Node.js for your computer by going to the [Node.js website](https://nodejs.org/). We also recommend using an integrated development environment (IDE) like [Visual Studio Code](https://code.visualstudio.com/).

## Setting up Firebase

We use Firebase for hosting our website, our database, authentication for admin users, and for our backend that fetches data from PurpleAir. To use Firebase, you will first need to create a Firebase project. Create an account with on the [Firebase Console](https://console.firebase.google.com/) and follow the instructions to add a project.

You will also need to install the [Firebase CLI](https://firebase.google.com/docs/cli#setup_update_cli).

### Pricing: Blaze Plan

Since we use Cloud Functions, you will need to upgrade to the Blaze plan, where you "pay as you go" as you use different services. We find that the website costs less than \$5 per month to run as of Spring 2021. If you download or delete data in a month, this will increase the costs some, with downloading readings costing \$0.06/100K readings and deleting old readings costing \$0.08/100K (to read and then delete each reading) in Spring 2021. Firebase's updated costs can be found at their [Pricing Documentation](https://firebase.google.com/pricing).

### Firestore

From the Firestore Database panel, click "Create database" and "Start in production mode". This will create the initial Firestore security rules that denies all reads and writes to the database, but the GitHub repository includes the security rules that you will need. For the Cloud Firestore location, the default value should work, but feel free to checkout the documentation.

To initialize Firestore, you will need to create the following collections and documents:

The Firestore structure is further documented in `TODO.md`.

### Cloud Functions

### Authentication

From the Authentication panel, click "Get Started" and enable the Email/Password and Google providers.

Note that for admin functionality of the website, it assumes that an admin user exists already. From the Firebase console, create a user for yourself that you can later use to sign into the website.

Another good extension of this project would be to have a protocol in place when no admin users exist for a project.

### Hosting

From the Hosting panel, click "Get started" and follow the instructions from Firebase to deploy the app. This will involve working with some of the code locally on your computer, so it's probably best to do this step last after completing the other steps described in this document.

## API Keys and Development Environment

We use API keys for Firebase, HERE maps, and PurpleAir, and it is important that these API keys are not posted publicly anywhere. See below for instructions on obtaining each API key.

For local front-end development, create a `.env` file in the root directory structured as follows, with your API keys

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

### Firebase

You will need to add the API keys from your Firebase setup. These API keys can be found from the [Firebase console](https://console.firebase.google.com/) for the project that you created by going to `Settings` -> `Project settings`. Under the `General` tab, scroll to `Your apps` -> `Firebase SDK snippet` and choose the `Config` selector. This will show a configuration with your project's keys:

```typescript
const firebaseConfig = {
  apiKey: "AIzaSyA7bZqD_xmYBdvXeiXB46t1PR2b_sbryr8",
  authDomain: "sg-cehat-air-quality.firebaseapp.com",
  databaseURL: "https://sg-cehat-air-quality.firebaseio.com",
  projectId: "sg-cehat-air-quality",
  storageBucket: "sg-cehat-air-quality.appspot.com",
  messagingSenderId: "958397530190",
  appId: "1:958397530190:web:d3dd09bbbc2c24d81d831f",
  measurementId: "G-MSNJLPHTNR"
};
```

Copy each of these values into the appropriate location in your local `.env` file. You will also need these values for the GitHub secrets

### HERE maps

We use HERE maps for the mapping software on the front page. Sign up for Freemium account on the [HERE maps developer website](https://developer.here.com/). The free tier for map usage is fairly large, so the free tier was more than enough for our use case. However, if you expect heavy usage of your website, you may need to upgrade to a paid version. From your account, then generate a JavaScript app and then create your API key. This is the API key that the application will use.

### PurpleAir

For PurpleAir, you will need to email <contact@purpleair.com> to get a WRITE key and READ key.

## Setting up GitHub

We use GitHub for development and continuous deployment.

### GitHub Secrets

We use GitHub Secrets for two purposes: to store secrets (like API keys) for the front end of the website, and for the continuous deployment of the website.

### Continuous Deployment

In GitHub, you will also need to make sure that Actions are enabled under the repository's Settings.

#### Dependabot

If you are actively developing the app, you will want to re-enable Dependabot, which automatically creates pull requests to update the libraries that the app uses. To re-enable Dependabot, remove each of the `open-pull-requests-limit: 0` lines in `.github/dependabot.yml` file.

## Local content

This app was originally developed for the community of South Gate, California. Much of the South Gate specific content was externalized to a few files so that modifying the website for use with another community. However, further externalization of content specific to South Gate would be a good extension of this project.

### (static content, HERE maps location, PurpleAir group)

