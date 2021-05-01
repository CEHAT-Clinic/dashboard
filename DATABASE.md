# Database

This is a description of the structure of the databse used in this project. We use a Google Cloud Firestore databse, which is a flexible, scalable NoSQL cloud database. To learn more about Google Cloud Firestore, check out the [documentation](https://firebase.google.com/docs/firestore). The `src/firebase/firestore.ts` file contains the global variables with all the strings we use to reference our databse in the codebase. This file is replicated in `functions/src/firestore.ts`. Those files also contain interfaces for all the fields stored in each document in our database. This markdown file is a written description of all the information contained in those two files.

The root of NoSQL database is a set of collections. Each named collection contains documents, and each document can contain fields and subcollections. The following is a description of all the collections in the root of the database and all their subcollections and documents.

## current-reading

The 'current-reading' collection, referred to as `CURRENT_READING_COLLECTION` contains a single document with the up-to-date sensor information to display on the home page. The single document is named 'sensors' and is referred to by the variable `SENSORS_DOC`. This document contains two fields, `data` and `lastUpdated`. `data` is a map of each sensor's PurpleAir ID to its current data. The current data for each sensor includes:
- `purpleAirId` - PurpleAir sensor ID
- `name` - PurpleAir sensor name
- `latitude` - latitude of sensor
- `longitude` - longitude of sensor
- `isValid` - if the current NowCast PM2.5 and AQI value are valid
- `isActive` - if we should be actively gathering data for the sensor
- `aqi` - the current AQI for the sensor, or `NaN` if not enough valid data
- `nowCastPm25` - the current NowCast corrected PM2.5, or `NaN` if not enough valid data
- `readingDocId` - document ID of the for the sensor in `SENSORS_COLLECTION`
- `lastValidAqiTime` - the last time the AQI was valid, or null if unknown
- `lastSensorReadingTime` - the last time the sensor gave a reading, or null if unknown

## sensors

The 'sensors' collection, referred to as `SENSORS_COLLECTION` contains one document for each PurpleAir sensor being used on the site. Each document contains a 'readings' subcollection (`READINGS_COLLECTION`) and several fields with current sensor data. The document's fields are:
- `purpleAirId` - PurpleAir sensor ID
- `name` - PurpleAir sensor name
- `latitude` - latitude of sensor
- `longitude` - longitude of sensor
- `isValid` - if the current NowCast PM2.5 and AQI value are valid
- `isActive` - if we should be actively gathering data for the sensor
- `lastValidAqiTime` - the last time the AQI was valid, or null if unknown
- `lastSensorReadingTime` - the last time the sensor gave a reading, or null if unknown
- `aqiBuffer` - a circular buffer of the last 24 hours of the AQI for a sensor, which is calculated every 10 minutes. Each entry is a map of an index in the buffer to an `AqiBufferElement`
- `aqiBufferIndex` - the index of the oldest AQI in the `aqiBuffer`, i.e. the next index of the `aqiBuffer` to write new data to.
- `aqiBufferStatus` - if the `aqiBuffer` exists, does not exist, or is in the process of being initialized
- `pm25Buffer` - a circular buffer of the last 12 hours of PM2.5 readings for a sensor, which is updated every 2 minutes. Each entry is a map of an index in the buffer to a `Pm25BufferElement`
- `pm25BufferIndex` - the index of the oldest PM2.5 reading in the `pm25Buffer`, i.e. the next index of the `pm25Buffer` to write to.
- `pm25BufferStatus` - if the `pm25Buffer` exists, does not exist, or is in the process of being initialized
- `sensorReadingErrors` - array of `SensorReadingError` that represent errors from the most recent time the Cloud Functions attempted to receive an error from PurpleAir
- `invalidAqiErrors` - array of `InvalidAqiError` that represent errors that can indicate why a sensor does not have a valid AQI, or why the sensor is invalid.
- `lastUpdated` - the last time the sensor doc was updated

The 'readings' subcollection contains one document for every response recieved from PurpleAir. Calls are made to the PurpleAir API every 2 minutes, so there can be as many as 30 documents per hour in this collection for a particular sensor. This data can be downloaded as a CSV and deleted from the databse using features on the administrative page. The fields in each document are:
- `latitude` - latitude of a sensor
- `longitude` - longitude of a sensor
- `pm25` - PM2.5 reading for a sensor. This value is the average of the PM2.5 reading for channelA and channelB
- `humidity` - humidity reading for a sensor
- `meanPercentDifference` - mean percent difference between the pseudo averages of the readings for channelA and channelB, as calculated from the confidence value returned by the PurpleAir API. This value ranges from 0 to 2.
- `timestamp` - the timestamp of the current reading


## users

The 'users' collection (`USERS_COLLECTION`) contains one document for every account registered from the administrative page. Account login and passwords are handled by Google Authentication. The main purpose of these documents is for managing the administrative and deletion statuses of each account as well as user names and emails for display. The fields in each user document are:
- `admin` - if the user is an admin user or not
- `email` - the user's email
- `isDeleted` - if this user has been deleted or not. We do batch deletes once per day, so after deleting account there is a period of time where the account still exists, but it should be invisible to administrators. This is handled by this flag.
- `name` - the user's name, or the empty string if the user has not yet added their name


## deletion

The 'deletion' collection, referred to by `DELETION_COLLECTION` contains two documents 'readings' (`READINGS_DELETION_DOC`), and 'users' (`USER_DELETION_DOC`). The databse does batch deletes once per day. These two documents keep track of what needs to be deleted.

The 'readings' document has two fields:
- `deletionMap` - a map of a sensor's doc ID in the `SENSORS_COLLECTION` to the timestamp for which data before that timestamp should be deleted.
- `lastUpdated` - the last time the document was updated

The 'users' document, has three fields:

- `firebaseUsers`- array of user IDs that should be deleted from Firebase Authentication
- `userDocs` - array of user IDs that should be deleted from `USERS_COLLECTION`, where each user ID is the doc ID of that user's doc in `USERS_COLLECTION`
- `lastUpdated` - the last time the document was updated
