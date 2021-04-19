import React, {useState} from 'react';
import {Box, Button, Text, Progress, Flex} from '@chakra-ui/react';
import firebase, {firestore} from '../../../../firebase/firebase';
import {useTranslation} from 'react-i18next';
import {CSVButtonProps, HeaderElement, BodyElement} from './Util';
import {CSVLink} from 'react-csv';

/**
 * Component for the button that can be clicked to download sensor data. Used
 * in `DownloadCSVModal` component which appear son the manage sensor page for admins.
 */
const DownloadCSVButton: ({
  startYear,
  startMonth,
  startDay,
  endYear,
  endMonth,
  endDay,
  error,
  downloadAll,
  purpleAirId,
  sensorDocId,
  resetSelectedSensor,
}: CSVButtonProps) => JSX.Element = ({
  startYear,
  startMonth,
  startDay,
  endYear,
  endMonth,
  endDay,
  error,
  downloadAll,
  purpleAirId,
  sensorDocId,
  resetSelectedSensor,
}: CSVButtonProps) => {
  const {t} = useTranslation('sensors');
  /* --------------- State maintenance variables ------------------------ */
  const [body, setBody] = useState<BodyElement[]>([]);
  const [header, setHeader] = useState<HeaderElement[]>([]);
  const [progress, setProgress] = useState(0);
  const [totalSensors, setTotalSensors] = useState(1);
  const [filename, setFilename] = useState('');
  const [fetchingData, setFetchingData] = useState(false);
  const [readyForDownload, setReadyForDownload] = useState(false);
  /* ------------------------------------------------------------------- */

  function resetAllFields() {
    // Reset download data fields
    setBody([]);
    setHeader([]);
    setProgress(0);
    setTotalSensors(1);
    setFilename('');
    setFetchingData(false);
    setReadyForDownload(false);

    // Reset selected sensor
    resetSelectedSensor();
  }

  /**
   * This function actually gets the data from firestore and populates the
   * list that represents the body of the CSV file
   * @param body - list of body elements to populate with the data
   * @param startDate - start date to fetch data for
   * @param endDate - end date to fetch data for
   * @returns the updated body with the elements from Firestore
   */
  async function getData(
    newBody: BodyElement[],
    startDate: Date,
    endDate: Date
  ) {
    setFetchingData(true);
    const sensorsRef = firestore.collection('sensors');
    let sensorDocs: (
      | firebase.firestore.QueryDocumentSnapshot<firebase.firestore.DocumentData>
      | firebase.firestore.DocumentSnapshot<firebase.firestore.DocumentData>
    )[] = [];
    if (downloadAll) {
      sensorDocs = (await sensorsRef.get()).docs;
    } else {
      const doc = await sensorsRef.doc(sensorDocId).get();
      if (doc.exists) sensorDocs.push(doc);
    }
    const numDocs = sensorDocs.length;
    setTotalSensors(numDocs);

    for (let i = 0; i < numDocs; i++) {
      const sensorData = sensorDocs[i].data() ?? {};
      // Get sensor name and doc ID
      let name: string = sensorData['name'] ?? '';
      // Forward slashes cause problems in the R shiny data analysis app
      if (name) {
        name = name.replaceAll('/', '-');
      }
      const docId = sensorDocs[i].id;

      const readingsRef = firestore
        .collection('sensors')
        .doc(docId)
        .collection('readings');

      // Get docs from readings subcollection that fall between the start
      // and end times
      const querySnapshot = await readingsRef
        .where('timestamp', '>=', startDate)
        .where('timestamp', '<=', endDate)
        .get();

      const documentList = querySnapshot.docs;
      for (let index = 0; index < documentList.length; index++) {
        const data = documentList[index].data();
        // Get field values
        const timestamp: Date = data['timestamp'].toDate();
        const pm25: number = data['pm25'];
        const percentDiff: number = data['meanPercentDifference'];
        const humidity: number = data['humidity'];
        const latitude: number = data['latitude'];
        const longitude: number = data['longitude'];

        // Create output instance
        const outputValue: BodyElement = {
          timestamp: timestamp.toISOString(),
          name: name,
          pm25: pm25,
          percentDiff: percentDiff,
          humidity: humidity,
          latitude: latitude,
          longitude: longitude,
        };
        newBody.push(outputValue);
      }
      // Update the screen to show how many sensors we have left to process
      setProgress(i + 1);
    }
    setReadyForDownload(true);
    setFetchingData(false);
    return newBody;
  }

  /**
   * This function is called when the `Fetch Data` button is clicked. It creates
   * start and end date objects, generates a filename and the headers for the CSV
   * file. It calls `getData`, which makes the calls to the database, and updates
   * the body of the CSV with the data.
   */
  function fetchData() {
    setFetchingData(true);
    // Generate Start Timestamp
    // Months are 0 indexed, so subtract 1 from the month since `startMonth` is indexed from 1
    const startDate = new Date(startYear, startMonth - 1, startDay);
    const startDateString = startDate.toISOString();

    // Generate End Timestamp
    // Months are 0 indexed, so subtract 1 from the month since `endMonth` is indexed from 1
    const endDate = new Date(endYear, endMonth - 1, endDay);
    const endDateString = endDate.toISOString();

    let newFilename =
      'pm25_' + startDateString + '_to_' + endDateString + '.csv';
    // If downloading data for one sensor, add the Purple Air ID to the output
    if (!downloadAll) {
      newFilename = purpleAirId.toString() + '_' + newFilename;
    }
    setFilename(newFilename);

    const newBody: BodyElement[] = [];
    const newHeaders: HeaderElement[] = [
      {label: 'Timestamp', key: 'timestamp'},
      {label: 'Name', key: 'name'},
      {label: 'PM2.5', key: 'pm25'},
      {label: 'Percent Difference', key: 'percentDiff'},
      {label: 'Humidity', key: 'humidity'},
      {label: 'Latitude', key: 'latitude'},
      {label: 'Longitude', key: 'longitude'},
    ];

    // If there's no error with the input, fetch data from Firestore
    if (!error) {
      setTotalSensors(0);
      setProgress(0);
      getData(newBody, startDate, endDate);
      setBody(newBody);
      setHeader(newHeaders);
    }
  }

  // Multiplier to get a fractional percentage (0.12) to a number between 1
  // and 100: (12)
  const toPercent = 100;
  return (
    <Flex
      marginTop={2}
      flexDir="column"
      textAlign="center"
      width="100%"
      alignItems="center"
    >
      {error ? (
        <Text color="red">{error}</Text>
      ) : (
        <Text color="green">{t('downloadData.error.validDates')}</Text>
      )}
      <Progress
        width="80%"
        value={(progress / totalSensors) * toPercent}
        size="md"
      />
      {!error && (
        <Box paddingTop={2}>
          {!fetchingData && !readyForDownload && (
            <Button onClick={fetchData}>{t('downloadData.fetchData')}</Button>
          )}
          {fetchingData && !readyForDownload && (
            <Text>{t('downloadData.fetching')}</Text>
          )}
          {readyForDownload && (
            <Box>
              <Text>{t('downloadData.whenReady')}</Text>
              <CSVLink data={body} headers={header} filename={filename}>
                <Button colorScheme="teal">{t('downloadData.download')}</Button>
              </CSVLink>
              <Button marginTop={2} colorScheme="red" onClick={resetAllFields}>
                {t('downloadData.anotherSensor')}
              </Button>
            </Box>
          )}
        </Box>
      )}
    </Flex>
  );
};

export default DownloadCSVButton;
