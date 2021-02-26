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
} from '@chakra-ui/react';
import {useAuth} from '../../../contexts/AuthContext';
import AccessDenied from './AccessDenied';
import Loading from '../../Util/Loading';
import {useTranslation} from 'react-i18next';
import {firestore} from '../../../firebase';

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
  mostRecentReading: Date;
}

/**
 * Component for administrative page to manage the sensors.
 * If a user is not signed in or an admin user, access is denied.
 */
const ManageSensors: () => JSX.Element = () => {
  const {isAuthenticated, isAdmin, isLoading: fetchingAuthInfo} = useAuth();
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const {t} = useTranslation('administration');

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      setIsLoading(true);

      // Create listener that updates on any data changes
      // TODO: update cloud function to edit the sensors doc
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
              const now = new Date();

              if (sensorData) {
                sensorList.push({
                  purpleAirId: sensorData.purpleAirId ?? '',
                  name: sensorData.name ?? '',
                  latitude: sensorData.latitude ?? NaN,
                  longitude: sensorData.longitude ?? NaN,
                  isActive: true, // TODO: update cloud function with this value
                  isValid: sensorData.isValid ?? false,
                  mostRecentReading: now, // TODO: update cloud function
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
          maxWidth="1000px"
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
                  <Th>{t('sensors.recentReading')}</Th>
                  <Th>{t('sensors.remove')}</Th>
                </Tr>
              </Thead>
              <Tbody>
                {sensors.map((sensor, id) => (
                  <Tr key={id}>
                    <Td>{sensor.name}</Td>
                    <Td>{sensor.purpleAirId}</Td>
                    <Td>{String(sensor.latitude)}</Td>
                    <Td>{String(sensor.longitude)}</Td>
                    <Td>
                      {sensor.isActive
                        ? t('sensors.active')
                        : t('sensors.inactive')}
                    </Td>
                    <Td>
                      {sensor.mostRecentReading.toLocaleDateString() +
                        ' ' +
                        sensor.mostRecentReading.toLocaleTimeString()}
                    </Td>
                    <Td>
                      {/* TODO: Add confirmation pop up that explains this is not connected to PurpleAir */}
                      <Button>{t('sensors.deactivate')}</Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
          <Button as="a" href="/admin" margin={1}>
            {t('returnAdmin')}
          </Button>
        </Box>
      </Flex>
    );
  }
};

export default ManageSensors;
