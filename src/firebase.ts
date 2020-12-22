import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

const config = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DB,
  projectId: 'sg-cehat-air-quality',
  storageBucket: process.env.REACT_APP_FIREBASE_SB,
  messagingSenderId: process.env.REACT_APP_FIREBASE_SID,
  appId: process.env.REACT_APP_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MID,
};

// Avoid re-initializing Firebase if already initialized
if (!firebase.apps.length) {
  firebase.initializeApp(config);
} else {
  // Use existing app if Firebase already initialized
  firebase.app();
}

export const firestore = firebase.firestore();
export const firebaseAuth = firebase.auth();

export default firebase;
