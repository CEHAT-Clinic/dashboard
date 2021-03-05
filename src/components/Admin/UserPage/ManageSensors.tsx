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
} from '@chakra-ui/react';
import {useAuth} from '../../../contexts/AuthContext';
import AccessDenied from './AccessDenied';
import Loading from '../../Util/Loading';
import {useTranslation} from 'react-i18next';
import firebase, {firestore} from '../../../firebase';

/**
 * Interface for a PurpleAir sensor
 */
interface Sensor {
  name: string;
  purpleAirId: string;
  latitude: number;
  longitude: number;
  nowCastPm25: number;
  aqi: number;
  isActive: boolean;
  isValid: boolean;
  lastValidAqiTime: firebase.firestore.Timestamp | null;
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
      // TODO: use sensors docs
      const unsubscribe = firestore
        .collection('current-reading')
        .doc('sensors')
        .onSnapshot(docSnapshot => {
          const sensorList: Sensor[] = [];
          const data = docSnapshot.data();
          if (data) {
            // Map of sensorID to readings and properties stored in data field
            const sensorMap = data.data;

            // Iterate through all current sensors
            for (const sensorId in sensorMap) {
              const sensorData = sensorMap[sensorId];
              if (sensorData) {
                sensorList.push({
                  purpleAirId: sensorData.purpleAirId ?? '',
                  name: sensorData.name ?? '',
                  latitude: sensorData.latitude ?? NaN,
                  longitude: sensorData.longitude ?? NaN,
                  isActive: true, // TODO: update cloud function with this value
                  isValid: sensorData.isValid ?? false,
                  lastValidAqiTime: sensorData.lastValidAqiTime ?? null,
                  readingDocId: sensorData.readingDocId ?? '',
                  aqi: sensorData.aqi ?? NaN,
                  nowCastPm25: sensorData.nowCastPm25 ?? NaN,
                });
              }
            }
            setSensors(sensorList);
          }
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

    currentSensor.isActive = !currentSensor.isActive;

    if (isAdmin) {
      // TODO: actually do the call to the database
      // firestore
      //   .collection('sensors')
      //   .doc(currentSensor.readingDocId)
      //   .update({
      //     isActive: currentSensor.isActive,
      //   })
      //   .catch(() => {
      //     setError(
      //       t('sensors.changeActiveSensorError') + currentSensor.name ??
      //         currentSensor.purpleAirId
      //     );
      //   });
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
   * @param sensor - The current sensor for a row
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
            <Divider marginY={1}/>
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
   * @param sensor - the current sensor
   * @returns human readable date time string
   */
  function timestampToDateString(sensor: Sensor) {
    if (sensor.lastValidAqiTime == null) {
      return t('sensors.unknown');
    } else {
      const sensorData: Date = sensor.lastValidAqiTime.toDate();
      return (
        sensorData.toLocaleDateString() + ' ' + sensorData.toLocaleTimeString()
      );
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
                  <Th>{t('sensors.status')}</Th>
                  <Th>{t('sensors.validAqiTime')}</Th>
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
                    <Td>{timestampToDateString(sensor)}</Td>
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
