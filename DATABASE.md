# Database
This is a description of the structure of the databse used in this project. We use a Google Cloud Firestore databse, which is a flexible, scalable NoSQL cloud database. To learn more about Google Cloud Firestore, check out the [documentation](https://firebase.google.com/docs/firestore). The `src/firebase/firestore.ts` file contains the global variables with all the strings we use to reference our databse in the codebase. This file is replicated in `functions/src/firestore.ts`. Those files also contain interfaces for all the fields stored in each document in our database. This markdown file is a written description of all the information contained in those two files.

The root of NoSQL database is a set of collections. Each named collection contains documents, and each document can contain fields and subcollections. The following is a description of all the collections in the root of the database and all their subcollections and documents.

## current-reading
The 'current-reading' collection, referred to as `CURRENT_READING_COLLECTION` contains a single document with the up-to-date sensor information to display on the home page. The single document is names 'sensors' and is referred to by the variable `SENSORS_DOC`. This document contains a single field, `data`, which is a map of PurpleAir ids to their current sensor data. The curent sensor data includes:
- Purple Air ID number (purpleAirId)
- The sensor's name (name)
- The latitude and longitude of the sensor placement (latitude, longitude)
- A flag for whether the sensor's current reading is valid. Invalid sensors do not have sufficient satisfactory PM 2.5 data for an AQI calculation, so an AQI is not calculated and the sensor is shown as a grey circle on the map. (isValid)
- A flag for whether the sensor is active. Active sensors are shown on the map and their data is updated every 2 minutes via API calls. Inactive sensors do not collect data and do not show up on the map. (isActive)
- The AQI value to display (aqi)
- The EPA NowCast PM 2.5 value used to calculate the current AQI (nowCastPm25)
- The ID of the document in the `sensors` collection with this sensor's data (readingDocId)
- The last time the sensor reported a valid AQI (lastValidAqiTime)
- The last time the sensor recieved a reading from the PurpleAir API (lastSensorReadingTime)

## sensors
TODO

## users
TODO

## deletion
The 'deletion' collection, referred to by `DELETION_COLLECTION` contains two documents 'readings' (`READINGS_DELETION_DOC`), and 'users' (`USER_DELETION_DOC`). Each document contains two fields, `deletionMap` and `lastUpdated`. TODO: finish this
