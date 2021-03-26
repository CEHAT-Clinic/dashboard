import React, {useState, useEffect} from 'react';
import {Box, Button} from '@chakra-ui/react';
import {firestore} from '../../../firebase';
import {CSVLink} from 'react-csv';

interface BodyElement {
  timestamp: Date;
  channelAPm25: number;
  channelBPm25: number;
  humidity: number;
  latitude: number;
  longitude: number;
}
interface HeaderElement {
  label: string;
  key: string;
}

/**
 * Component for administrative page to manage the sensors.
 * If a user is not signed in or an admin user, access is denied.
 */
const DownloadCSV: () => JSX.Element = () => {
  const [fetchingData, setFetchingData] = useState(true);
  const [body, setBody] = useState<BodyElement[]>([]);
  const [header, setHeader] = useState<HeaderElement[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setFetchingData(true);

    const startDate = new Date();
    startDate.setHours(startDate.getHours() - 1);
    const newBody: BodyElement[] = [];
    const newHeaders: HeaderElement[] = [
      {label: 'Timestamp', key: 'timestamp'},
      {label: 'Channel A PM 2.5', key: 'channelAPm25'},
      {label: 'Channel B PM 2.5', key: 'channelBPm25'},
      {label: 'Humidity', key: 'humidity'},
      {label: 'Latitude', key: 'latitude'},
      {label: 'Longitude', key: 'longitude'},
    ];

    async function getData(body: BodyElement[]) {
      // Readings subcollection
      /* eslint-disable-next-line spellcheck/spell-checker */
      const testDocId = '0o4SOasIk6fPXPSV1Ahk';
      const readingsRef = firestore
        .collection('sensors')
        .doc(testDocId)
        .collection('readings');

      console.log('before snapshot');
      // Get values from readings subcollection
      const querySnapshot = await readingsRef
        .where('timestamp', '>', startDate)
        .limit(10)
        .get();

      const querySize = querySnapshot.size;
      console.log('after snapshot:', {querySize});

      const documentList = querySnapshot.docs;
      for (let index = 0; index < documentList.length; index++) {
        const data = documentList[index].data();
        // Get field values
        const timestamp = data['timestamp'];
        const channelAPm25 = data['channelAPm25'];
        const channelBPm25 = data['channelBPm25'];
        const humidity = data['humidity'];
        const latitude = data['latitude'];
        const longitude = data['longitude'];
        // Create output instance
        const outputValue: BodyElement = {
          timestamp: timestamp,
          channelAPm25: channelAPm25,
          channelBPm25: channelBPm25,
          humidity: humidity,
          latitude: latitude,
          longitude: longitude,
        };
        newBody.push(outputValue);
      }
      return newBody;
    }

    // Get data from firestore
    getData(newBody);

    setBody(newBody);
    setHeader(newHeaders);
    setIsLoading(false);
    setFetchingData(false);
  }, [fetchingData]);

  return (
    <Box>
      <Button>
        Fetch:{'' + fetchingData} Data:{'' + body.length}
      </Button>
      <Button onClick={() => setFetchingData(true)}>Fetch Data</Button>
      {fetchingData ? (
        <Button>Still fetchiing data</Button>
      ) : (
        <CSVLink data={body} headers={header} filename={'ASYNC.csv'}>
          <Button>Download me</Button>
        </CSVLink>
      )}
    </Box>
  );
};

export default DownloadCSV;
