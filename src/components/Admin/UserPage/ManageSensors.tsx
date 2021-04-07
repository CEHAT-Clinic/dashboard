import React, {useState, useEffect} from 'react';
import {
  Box,
  Heading,
  Flex,
  Button,
  Tbody,
  Table,
  Thead,
  Th,
  Tr,
  Td,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverHeader,
  PopoverBody,
  Center,
  Text,
  Divider,
  IconButton,
  HStack,
} from '@chakra-ui/react';
import {QuestionOutlineIcon} from '@chakra-ui/icons';
import {useAuth} from '../../../contexts/AuthContext';
import AccessDenied from './AccessDenied';
import Loading from '../../Util/Loading';
import {useTranslation} from 'react-i18next';
import firebase, {firestore} from '../../../firebase';
import {DownloadCSVModal} from './DownloadData/DownloadCSVModal';
import {AddSensorModal} from './AddSensorModal';
import DeleteOldDataModal from './DeleteOldDataModal';

/**
 * Interface for a PurpleAir sensor
 */
interface Sensor {
  name: string;
  purpleAirId: string;
  latitude: number;
  longitude: number;
  isActive: boolean;
  isValid: boolean;
  lastValidAqiTime: firebase.firestore.Timestamp | null;
  lastSensorReadingTime: firebase.firestore.Timestamp | null;
  readingDocId: string;
}

/**
 * Component for administrative page to manage the sensors.
 * If a user is not signed in or an admin user, access is denied.
 */
const ManageSensors: () => JSX.Element = () => {
  const {isAuthenticated, isAdmin, isLoading: fetchingAuthInfo} = useAuth();
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const {t} = useTranslation(['administration', 'common']);

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      setIsLoading(true);

      // Create listener that updates on any data changes
      const unsubscribe = firestore
        .collection('sensors')
        .onSnapshot(querySnapshot => {
          const sensorList: Sensor[] = [];
          querySnapshot.docs.forEach(doc => {
            if (doc.data()) {
              const sensorData = doc.data();
              sensorList.push({
                purpleAirId: sensorData.purpleAirId ?? '',
                name: sensorData.name ?? '',
                latitude: sensorData.latitude ?? NaN,
                longitude: sensorData.longitude ?? NaN,
                isActive: sensorData.isActive ?? true,
                isValid: sensorData.isValid ?? false,
                lastValidAqiTime: sensorData.lastValidAqiTime ?? null,
                lastSensorReadingTime: sensorData.lastSensorReadingTime ?? null,
                readingDocId: doc.id,
              });
            }
          });
          setSensors(sensorList);
        });
      setIsLoading(false);
      return unsubscribe;
    }
    return;
  }, [isAuthenticated, isAdmin]);

  /**
   *
   * @param event - click button event
   * @param currentSensor - sensor for which to toggle isActive status
   */
  function toggleActiveSensorStatus(
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    currentSensor: Sensor
  ) {
    event.preventDefault();

    if (isAdmin) {
      firestore
        .collection('sensors')
        .doc(currentSensor.readingDocId)
        .update({
          isActive: !currentSensor.isActive,
        })
        .catch(() => {
          setError(
            t('sensors.changeActiveSensorError') + currentSensor.name ??
              currentSensor.purpleAirId
          );
        });
    }
  }

  /**
   * Interface for ToggleActiveSensorPopover used for type safety
   */
  interface ToggleActiveSensorPopoverProps {
    sensor: Sensor;
  }

  /**
   * Creates a button that when clicked, creates a confirmation popup to change
   * a sensor's active status. Active means that data for the sensor will be
   * collected and shown on the map, but does not change anything in PurpleAir.
   * @param sensor - sensor for a row
   */
  const ToggleActiveSensorPopover: ({
    sensor,
  }: ToggleActiveSensorPopoverProps) => JSX.Element = ({
    sensor,
  }: ToggleActiveSensorPopoverProps) => {
    const name = sensor.name ? sensor.name : sensor.purpleAirId;

    const popoverMessage =
      (sensor.isActive
        ? t('sensors.confirmDeactivate')
        : t('sensors.confirmActivate')) + name;
    const popoverNote = sensor.isActive
      ? t('sensors.deactivateNote')
      : t('sensors.activateNote');

    return (
      <Popover>
        <PopoverTrigger>
          <Button colorScheme={sensor.isActive ? 'red' : 'green'} width="full">
            {sensor.isActive ? t('sensors.deactivate') : t('sensors.activate')}
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <PopoverArrow />
          <PopoverCloseButton />
          <PopoverHeader>
            <Heading fontSize="medium">{t('common:confirm')}</Heading>
          </PopoverHeader>
          <PopoverBody>
            <Text>{popoverMessage}</Text>
            <Divider marginY={1} />
            <Text marginBottom={1}>{popoverNote}</Text>
            <Center>
              <Button
                paddingY={2}
                colorScheme={sensor.isActive ? 'red' : 'green'}
                onClick={event => toggleActiveSensorStatus(event, sensor)}
              >
                {t('common:confirm')}
              </Button>
            </Center>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    );
  };

  /**
   * Interface for MoreInfoPopover used for type safety
   */
  interface MoreInfoHeadingProps {
    message: string;
    heading: string;
  }

  /**
   * Table heading that includes a clickable question mark icon.
   * When the question mark icon is clicked, a popover appears that explains the
   * table field.
   * @param heading - heading for the column with the help icon
   * @param message - help message displayed in popover when help icon clicked
   */
  const MoreInfoHeading: ({
    message,
    heading,
  }: MoreInfoHeadingProps) => JSX.Element = ({
    message,
    heading,
  }: MoreInfoHeadingProps) => {
    return (
      <Flex alignItems="center">
        <Text>{heading}</Text>
        <Popover>
          <PopoverTrigger>
            <IconButton
              size="xs"
              variant="unstyled"
              isRound
              aria-label={t('common:moreInformation')}
              icon={<QuestionOutlineIcon />}
            />
          </PopoverTrigger>
          <PopoverContent>
            <PopoverArrow />
            <PopoverCloseButton />
            <PopoverHeader>
              <Heading fontSize="medium">{t('common:moreInformation')}</Heading>
            </PopoverHeader>
            <PopoverBody>
              <Text fontWeight="normal" fontSize="md" textTransform="none">
                {message}
              </Text>
            </PopoverBody>
          </PopoverContent>
        </Popover>
      </Flex>
    );
  };

  /**
   *
   * @param timestamp - the time to convert
   * @returns human readable date time string, unknown if null
   */
  function timestampToDateString(
    timestamp: firebase.firestore.Timestamp | null
  ) {
    if (timestamp === null) {
      return t('sensors.unknown');
    } else {
      const date: Date = timestamp.toDate();
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    }
  }

  /**
   *
   * @param number - a number that can be NaN
   * @returns human readable string for a number, 'unknown' if NaN
   */
  function numberToString(number: number) {
    if (isNaN(number)) {
      return t('sensors.unknown');
    } else {
      return String(number);
    }
  }

  if (isLoading || fetchingAuthInfo) {
    return <Loading />;
  } else if (!isAuthenticated) {
    return <AccessDenied reason={t('notSignedIn')} />;
  } else if (!isAdmin) {
    return <AccessDenied reason={t('notAdmin')} />;
  } else {
    return (
      <Flex width="full" align="center" justifyContent="center">
        <Box
          padding={8}
          margin={8}
          width="full"
          maxWidth="1400px"
          borderWidth={1}
          borderRadius={8}
          boxShadow="lg"
          textAlign="center"
        >
          <Heading marginY={2}>{t('manageSensors')}</Heading>
          <Center>
            <HStack>
              <AddSensorModal />
              <DownloadCSVModal />
              <DeleteOldDataModal />
            </HStack>
          </Center>
          <Box maxWidth="100%" overflowX="auto">
            <Heading textAlign="justify" fontSize="2xl">
              {t('sensors.heading')}
            </Heading>
            <Table>
              <Thead>
                <Tr>
                  <Th>{t('sensors.name')}</Th>
                  <Th>{t('sensors.purpleAirId')}</Th>
                  <Th>{t('sensors.latitude')}</Th>
                  <Th>{t('sensors.longitude')}</Th>
                  <Th>
                    <MoreInfoHeading
                      heading={t('sensors.status')}
                      message={t('sensors.activeNote')}
                    />
                  </Th>
                  <Th>
                    <MoreInfoHeading
                      heading={t('sensors.validAqiTime')}
                      message={t('sensors.lastValidAqiTimeNote')}
                    />
                  </Th>
                  <Th>
                    <MoreInfoHeading
                      heading={t('sensors.readingTime')}
                      message={t('sensors.lastReadingTimeNote')}
                    />
                  </Th>
                  <Th>{t('sensors.activeHeading')}</Th>
                </Tr>
              </Thead>
              <Tbody>
                {sensors.map((sensor, id) => (
                  <Tr key={id}>
                    <Td>{sensor.name}</Td>
                    <Td>{sensor.purpleAirId}</Td>
                    <Td>{numberToString(sensor.latitude)}</Td>
                    <Td>{numberToString(sensor.longitude)}</Td>
                    <Td>
                      {sensor.isActive
                        ? t('sensors.active')
                        : t('sensors.inactive')}
                    </Td>
                    <Td>{timestampToDateString(sensor.lastValidAqiTime)}</Td>
                    <Td>
                      {timestampToDateString(sensor.lastSensorReadingTime)}
                    </Td>
                    <Td>
                      <ToggleActiveSensorPopover sensor={sensor} />
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
          {error && <Text textColor="red.500">{error}</Text>}
          <Button as="a" href="/admin" margin={1}>
            {t('returnAdmin')}
          </Button>
        </Box>
      </Flex>
    );
  }
};

export default ManageSensors;
