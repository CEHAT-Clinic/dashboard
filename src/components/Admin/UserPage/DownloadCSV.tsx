import React, {useState} from 'react';
import {
  Box,
  Button,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  FormHelperText,
  Select,
  HStack,
} from '@chakra-ui/react';
import firebase, {firestore} from '../../../firebase';
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

interface CSVButtonProps {
  startYear: number;
  startMonth: number;
  startDay: number;
  endYear: number;
  endMonth: number;
  endDay: number;
}

/**
 * Component for administrative page to manage the sensors.
 * If a user is not signed in or an admin user, access is denied.
 */
const DownloadCSVButton: ({
  startYear,
  startMonth,
  startDay,
  endYear,
  endMonth,
  endDay,
}: CSVButtonProps) => JSX.Element = ({
  startYear,
  startMonth,
  startDay,
  endYear,
  endMonth,
  endDay,
}: CSVButtonProps) => {
  const [fetchingData, setFetchingData] = useState(false);
  const [body, setBody] = useState<BodyElement[]>([]);
  const [header, setHeader] = useState<HeaderElement[]>([]);
  const [total, setTotal] = useState(0);
  const [progress, setProgress] = useState(0);

  function fetchData() {
    setFetchingData(true);

    // Generate Start Timestamp
    const startDate = new Date(startYear, startMonth, startDay);
    // TODO: don't need this? Check after convert results to timestamps
    const startTimestamp = firebase.firestore.Timestamp.fromDate(startDate);

    // Generate End Timestamp
    const endDate = new Date(endYear, endMonth, endDay);
    // TODO: don't need this? Check after convert results to timestamps
    const endTimestamp = firebase.firestore.Timestamp.fromDate(endDate);

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
        .where('timestamp', '>=', startDate)
        .where('timestamp', '<=', endDate)
        .limit(1000) /* eslint-disable-line no-magic-numbers */
        .get();

      // TODO: testing code, delete later
      const querySize = querySnapshot.size;
      console.log('after snapshot:', {querySize});
      setTotal(querySize);

      const documentList = querySnapshot.docs;
      for (let index = 0; index < documentList.length; index++) {
        if (index % 100 === 0 || index === documentList.length - 1) {
          setProgress(index + 1);
        }
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
    setFetchingData(false);
  }

  return (
    <Box>
      <Text>
        Fetch: {'' + fetchingData} Data:{'' + body.length}
      </Text>
      <Text>
        {' '}
        Progress {'' + progress} out of {'' + total}
      </Text>
      <Button onClick={() => fetchData()}>Fetch Data</Button>
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

interface InputProps {
  value: number;
  setValue: React.Dispatch<React.SetStateAction<number>>;
}

const DownloadCSVModal: () => JSX.Element = () => {
  const {isOpen, onOpen, onClose} = useDisclosure();
  const [startYear, setStartYear] = useState(0);
  const [startMonth, setStartMonth] = useState(0);
  const [startDay, setStartDay] = useState(0);
  const [endYear, setEndYear] = useState(0); // Change to timestamp
  const [endMonth, setEndMonth] = useState(0); // Change to timestamp
  const [endDay, setEndDay] = useState(0);

  function handleClose() {
    setStartYear(0);
    setStartMonth(0);
    setStartDay(0);
    setEndYear(0);
    setEndMonth(0);
    setEndDay(0);
    onClose();
  }

  const YearInput: ({value, setValue}: InputProps) => JSX.Element = ({
    value,
    setValue,
  }: InputProps) => {
    return (
      <NumberInput size="md" width="30%">
        <NumberInputField
          onChange={event => {
            setValue(+event.target.value);
          }}
          value={value}
        />
      </NumberInput>
    );
  };
  const MonthInput: ({value, setValue}: InputProps) => JSX.Element = ({
    value,
    setValue,
  }: InputProps) => {
    const labels = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const options = [];
    for (let i = 0; i < labels.length; i++) {
      options.push(
        <option value={i} key={i}>
          {labels[i]}
        </option>
      );
    }
    return (
      <Box width="30%">
        <Select
          type="number"
          placeholder="month"
          value={value}
          onChange={event => {
            setValue(+event.target.value);
          }}
        >
          {options}
        </Select>
      </Box>
    );
  };

  const DayInput: ({value, setValue}: InputProps) => JSX.Element = ({
    value,
    setValue,
  }: InputProps) => {
    const options = [];
    const maxDaysPerMonth = 31;
    for (let i = 0; i < maxDaysPerMonth; i++) {
      options.push(
        <option value={i + 1} key={i}>
          {i + 1}
        </option>
      );
    }
    return (
      <Box width="30%">
        <Select
          placeholder="day"
          size="md"
          value={value}
          onChange={event => {
            setValue(+event.target.value);
          }}
        >
          {options}
        </Select>
      </Box>
    );
  };

  return (
    <Box>
      <Button onClick={onOpen}>Open Download Modal</Button>
      <Modal isOpen={isOpen} onClose={handleClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Download Data From All Sensors</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box>
              <FormControl isRequired>
                <FormLabel>Start Date</FormLabel>
                <HStack>
                  {/* <YearInput value={startYear} setValue={setStartYear} /> */}
                  <NumberInput size="md" width="30%">
                    <NumberInputField
                      onChange={event => {
                        setStartYear(+event.target.value);
                      }}
                      value={startYear}
                    />
                  </NumberInput>
                  <MonthInput value={startMonth} setValue={setStartMonth} />
                  <DayInput value={startDay} setValue={setStartDay} />
                </HStack>
                <FormHelperText>
                  If the start date is earlier than the earliest entry, gets
                  data starting from the first entry.
                </FormHelperText>
                <FormLabel>End Date</FormLabel>
                <HStack>
                  {/* <YearInput value={endYear} setValue={setEndYear} /> */}
                  <NumberInput size="md" width="30%">
                    <NumberInputField
                      onChange={event => {
                        setEndYear(+event.target.value);
                      }}
                      value={endYear}
                    />
                  </NumberInput>
                  <MonthInput value={endMonth} setValue={setEndMonth} />
                  <DayInput value={endDay} setValue={setEndDay} />
                </HStack>
                <FormHelperText>
                  If the end date is later than the last entry, gets data until
                  the last entry.
                </FormHelperText>
              </FormControl>
            </Box>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Close</Button>
            <Button colorScheme="teal" type="submit">
              {' '}
              Submit{' '}
            </Button>
            <DownloadCSVButton
              startYear={startYear}
              startMonth={startMonth}
              startDay={startDay}
              endYear={endYear}
              endMonth={endMonth}
              endDay={endDay}
            />
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export {DownloadCSVButton, DownloadCSVModal};
