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
  HStack,
} from '@chakra-ui/react';
import {useAuth} from '../../../contexts/AuthContext';
import AccessDenied from '../AccessDenied';
import Loading from '../../Util/Loading';
import {useTranslation} from 'react-i18next';
import firebase, {firestore} from '../../../firebase';
import {DownloadCSVModal} from './DownloadData/DownloadCSVModal';
import {AddSensorModal} from './AddSensorModal';
import {DeleteSensorModal} from './DeleteSensorModal';
import DeleteOldDataModal from './DeleteOldDataModal';
import {Sensor, MoreInfoHeading} from './Util';

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
              const purpleAirId: string =
                sensorData.purpleAirId?.toString() ?? '';
              sensorList.push({
                purpleAirId: purpleAirId,
                name: sensorData.name ?? '',
                latitude: sensorData.latitude ?? NaN,
                longitude: sensorData.longitude ?? NaN,
                isActive: sensorData.isActive ?? true,
                isValid: sensorData.isValid ?? false,
                lastValidAqiTime: sensorData.lastValidAqiTime ?? null,
                lastSensorReadingTime: sensorData.lastSensorReadingTime ?? null,
                docId: doc.id,
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
   * Toggles `isActive` in a sensor's doc. This also resets the AQI buffer
   * and PM2.5 buffer when activating or deactivating.
   * @param event - click button event
   * @param currentSensor - sensor for which to toggle isActive status
   *
   * @remarks
   * Note that when a sensor is activated or deactivated, we do not change it in
   * our PurpleAir group: 490. We will still get data from PurpleAir in our API
   * call, but the resulting data will not be used anywhere.
   */
  function toggleActiveSensorStatus(
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    currentSensor: Sensor
  ) {
    event.preventDefault();

    if (isAdmin) {
      // Toggle the isActive and remove the buffers
      firestore
        .collection('sensors')
        .doc(currentSensor.docId)
        .update({
          isActive: !currentSensor.isActive,
          aqiBufferStatus: firebase.firestore.FieldValue.delete(),
          aqiBuffer: firebase.firestore.FieldValue.delete(),
          aqiBufferIndex: firebase.firestore.FieldValue.delete(),
          pm25BufferStatus: firebase.firestore.FieldValue.delete(),
          pm25Buffer: firebase.firestore.FieldValue.delete(),
          pm25BufferIndex: firebase.firestore.FieldValue.delete(),
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
   * @returns human readable string for a number, 'unknown' if `NaN`
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
              <DownloadCSVModal sensors={sensors} />
              <DeleteOldDataModal />
              <DeleteSensorModal
                sensors={sensors.filter(sensor => !sensor.isActive)}
              />
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

export type {Sensor};
