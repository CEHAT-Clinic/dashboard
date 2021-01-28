import * as admin from 'firebase-admin';

admin.initializeApp();
const firestore = admin.firestore();
const Timestamp = admin.firestore.Timestamp;
const FieldValue = admin.firestore.FieldValue;

export {firestore, Timestamp, FieldValue};
