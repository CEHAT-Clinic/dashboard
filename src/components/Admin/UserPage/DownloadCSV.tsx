import React, {useState, useEffect} from 'react';
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
  Center,
  Progress,
  Flex,
} from '@chakra-ui/react';
import {firestore} from '../../../firebase';
import {CSVLink} from 'react-csv';
import {useTranslation} from 'react-i18next';

/**
 * Interface for the fields of the CSV
 */
interface BodyElement {
  timestamp: string;
  name: string;
  pm25: number;
  percentDiff: number;
  humidity: number;
  latitude: number;
  longitude: number;
}

/**
 * Interface for the labels of the headers in the CSV
 * label - text to be displayed in the CSV file
 * key - string of which json data to use for the given label
 */
interface HeaderElement {
  label: string;
  key: string;
}

/**
 * Props for the CSV Button. This passes the information from the CSV modal to
 * the component that actually downloads the CSV file.
 */
interface CSVButtonProps {
  startYear: number;
  startMonth: number;
  startDay: number;
  endYear: number;
  endMonth: number;
  endDay: number;
  error: string;
}

/**
 * Props for the month and day input fields used in the `DownloadCSVModal`
 */
interface InputProps {
  value: number;
  setValue: React.Dispatch<React.SetStateAction<number>>;
}

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
}: CSVButtonProps) => JSX.Element = ({
  startYear,
  startMonth,
  startDay,
  endYear,
  endMonth,
  endDay,
  error,
}: CSVButtonProps) => {
  const {t} = useTranslation('administration');
  /* --------------- State maintenance variables ------------------------ */
  const [body, setBody] = useState<BodyElement[]>([]);
  const [header, setHeader] = useState<HeaderElement[]>([]);
  const [progress, setProgress] = useState(0);
  const [totalSensors, setTotalSensors] = useState(1);
  const [filename, setFilename] = useState('');
  const [fetchingData, setFetchingData] = useState(false);
  const [readyForDownload, setReadyForDownload] = useState(false);
  /* ------------------------------------------------------------------- */

  function fetchData() {
    setFetchingData(true);
    // Generate Start Timestamp
    const startDate = new Date(startYear, startMonth - 1, startDay);
    const startDateString = startDate.toISOString();

    // Generate End Timestamp
    const endDate = new Date(endYear, endMonth - 1, endDay);
    const endDateString = endDate.toISOString();

    setFilename('pm25_' + startDateString + '_to_' + endDateString + '.csv');

    const newBody: BodyElement[] = [];
    const newHeaders: HeaderElement[] = [
      {label: 'Timestamp', key: 'timestamp'},
      {label: 'Name', key: 'name'},
      {label: 'PM 2.5', key: 'pm25'},
      {label: 'Percent Difference', key: 'percentDiff'},
      {label: 'Humidity', key: 'humidity'},
      {label: 'Latitude', key: 'latitude'},
      {label: 'Longitude', key: 'longitude'},
    ];

    /**
     * This function actually fetches the data from firestore and populates the
     * list that represents the body of the CSV file
     * @param body - list of body elements to populate with the data
     * @returns the updated body with the elements from Firestore
     */
    async function getData(body: BodyElement[]) {
      setFetchingData(true);
      const sensorsRef = firestore.collection('sensors');
      const sensorDocs = (await sensorsRef.get()).docs;
      const numDocs = sensorDocs.length;
      setTotalSensors(numDocs);

      for (let i = 0; i < numDocs; i++) {
        const sensorData = sensorDocs[i].data();
        // Get sensor name and doc ID
        const name: string = sensorData['name'];
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

    // If there's no error with the input, fetch data from Firestore
    if (!error) {
      setTotalSensors(0);
      setProgress(0);
      getData(newBody);
      setBody(newBody);
      setHeader(newHeaders);
    }
  }

  // Multiplier to get a fractional percentage (0.12) to a number between 1
  // and 100: (12)
  const toPercent = 100;
  return (
    <Flex flexDir="column" textAlign="center" width="100%" alignItems="center">
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
      <Box paddingTop={2}>
        {!fetchingData && !readyForDownload && (
          <Button onClick={() => fetchData()}>
            {t('downloadData.fetchData')}
          </Button>
        )}
        {fetchingData && !readyForDownload && (
          <Text>{t('downloadData.fetching')}</Text>
        )}
        {readyForDownload && (
          <Box>
            <Text>{t('downloadData.whenReady')}</Text>
            <CSVLink data={body} headers={header} filename={filename}>
              <Button>{t('downloadData.download')}</Button>
            </CSVLink>
          </Box>
        )}
      </Box>
    </Flex>
  );
};

/**
 * Component for the download data modal that appears on the manage sensor page
 * in the administrative pane.
 */
const DownloadCSVModal: () => JSX.Element = () => {
  const {t} = useTranslation('administration');
  /* --------------- State maintenance variables ------------------------ */
  const {isOpen, onOpen, onClose} = useDisclosure();
  const [startYear, setStartYear] = useState(0);
  const [startMonth, setStartMonth] = useState(0);
  const [startDay, setStartDay] = useState(0);
  const [endYear, setEndYear] = useState(0); // Change to timestamp
  const [endMonth, setEndMonth] = useState(0); // Change to timestamp
  const [endDay, setEndDay] = useState(0);
  const [error, setError] = useState('');
  /* ------------------------------------------------------------------- */

  // Reset to starting state
  function clearFields() {
    setStartYear(0);
    setStartMonth(0);
    setStartDay(0);
    setEndYear(0);
    setEndMonth(0);
    setEndDay(0);
    setError('');
  }

  // Reset starting state and close modal
  function handleClose() {
    clearFields();
    onClose();
  }

  /**
   * Drop-down menu for months of the year
   * @param value - state variable this input displays and changes
   * @param setValue - function that sets the value
   */
  const MonthInput: ({value, setValue}: InputProps) => JSX.Element = ({
    value,
    setValue,
  }: InputProps) => {
    const labels = [
      '',
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
    for (let i = 1; i < labels.length; i++) {
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
          placeholder={t('downloadData.month')}
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

  /**
   * Drop-down menu for days of a month
   * @param value - state variable this input displays and changes
   * @param setValue - function that sets the value
   */
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
          placeholder={t('downloadData.day')}
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

  /**
   * Check that input dates are valid, sets error accordingly
   */
  useEffect(() => {
    const startDate = new Date(startYear, startMonth - 1, startDay);
    const endDate = new Date(endYear, endMonth - 1, endDay);
    if (startDate.getMonth() !== startMonth - 1) {
      setError(t('downloadData.error.invalidStart'));
    } else if (endDate.getMonth() !== endMonth - 1) {
      setError(t('downloadData.error.invalidEnd'));
    } else if (startDate > endDate) {
      setError(t('downloadData.error.startBeforeEnd'));
    } else {
      setError('');
    }
  }, [startYear, startMonth, startDay, endYear, endMonth, endDay, t]);

  return (
    <Box>
      <Button colorScheme="teal" onClick={onOpen}>
        {t('downloadData.download')}
      </Button>
      <Modal isOpen={isOpen} onClose={handleClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t('downloadData.header')}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box>
              <FormControl isRequired>
                {/* Start start date input fields */}
                <FormLabel>{t('downloadData.startDate')}</FormLabel>
                <HStack>
                  <NumberInput size="md" width="30%" id="startYear">
                    <NumberInputField
                      placeholder={t('downloadData.year')}
                      onChange={event => {
                        setStartYear(+event.target.value);
                      }}
                      value={startYear}
                    />
                  </NumberInput>
                  <MonthInput value={startMonth} setValue={setStartMonth} />
                  <DayInput value={startDay} setValue={setStartDay} />
                </HStack>
                <FormHelperText paddingBottom={1}>
                  {t('downloadData.startHelper')}
                </FormHelperText>
                {/* End start date input fields */}
                {/* Start end date input fields */}
                <FormLabel>{t('downloadData.endDate')}</FormLabel>
                <HStack>
                  <NumberInput size="md" width="30%" id="endYear">
                    <NumberInputField
                      onChange={event => {
                        setEndYear(+event.target.value);
                      }}
                      value={endYear}
                      placeholder={t('downloadData.year')}
                    />
                  </NumberInput>
                  <MonthInput value={endMonth} setValue={setEndMonth} />
                  <DayInput value={endDay} setValue={setEndDay} />
                </HStack>
                <FormHelperText>{t('downloadData.endHelper')}</FormHelperText>
                {/* End end date input fields */}
              </FormControl>
            </Box>
            <Center>
              <DownloadCSVButton
                startYear={startYear}
                startMonth={startMonth}
                startDay={startDay}
                endYear={endYear}
                endMonth={endMonth}
                endDay={endDay}
                error={error}
              />
            </Center>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="red" onClick={handleClose}>
              {t('downloadData.close')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export {DownloadCSVButton, DownloadCSVModal};
