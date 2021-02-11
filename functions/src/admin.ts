import * as admin from 'firebase-admin';

// This handles all firebase initialization for Firebase Cloud functions
// To use anything from firebase-admin, import from this file in order to avoid
// initializing the app more than once.
admin.initializeApp();
const firestore: admin.firestore.Firestore = admin.firestore();
const Timestamp = admin.firestore.Timestamp;
const FieldValue = admin.firestore.FieldValue;

export {firestore, Timestamp, FieldValue};
