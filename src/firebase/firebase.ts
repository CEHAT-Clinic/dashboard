import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/functions';

const config = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: 'sg-cehat-air-quality',
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
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
export const functions = firebase.functions();

export default firebase;
