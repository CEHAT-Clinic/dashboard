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
import {validData} from '../../../util';

/**
 * Interface for a PurpleAir sensor
 */
interface Sensor {
  name: string;
  purpleAirId: string;
  latitude: number;
  longitude: number;
  online: boolean;
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
      // TODO: use the current-readings collection
      // TODO: update cloud function to edit the sensors doc rather than pm25
      const unsubscribe = firestore
        .collection('sensors')
        .onSnapshot(querySnapshot => {
          const sensorList: Sensor[] = [];
          querySnapshot.docs.forEach(doc => {
            if (doc.exists) {
              const sensorData = doc.data();
              const now = new Date();

              if (sensorData && validData(sensorData.purpleAirId, 'string')) {
                sensorList.push({
                  purpleAirId: sensorData.purpleAirId,
                  name: 'SG CEHAT', // TODO: add sensor name to the docs
                  latitude: 0,
                  longitude: 0,
                  online: true, // TODO: update cloud function with this value
                  mostRecentReading: now, // TODO: update cloud function
                });
              }
            }
          });
          setSensors(sensorList);
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
          <Box>
            <Button marginY={2} colorScheme="green">
              {t('sensors.add')}
            </Button>
          </Box>
          <Box maxWidth="100%" overflowX="auto">
            <Heading textAlign="justify" fontSize="2xl">
              {t('sensors.heading')}
            </Heading>
            <Table>
              <Thead>
                <Th>{t('sensors.name')}</Th>
                <Th>{t('sensors.purpleAirId')}</Th>
                <Th>{t('sensors.latitude')}</Th>
                <Th>{t('sensors.longitude')}</Th>
                <Th>{t('sensors.status')}</Th>
                <Th>{t('sensors.recentReading')}</Th>
                <Th>{t('sensors.remove')}</Th>
              </Thead>
              <Tbody>
                {sensors.map((sensor, id) => (
                  <Tr key={id}>
                    <Td>{sensor.name}</Td>
                    <Td>{sensor.purpleAirId}</Td>
                    <Td>{sensor.latitude}</Td>
                    <Td>{sensor.longitude}</Td>
                    <Td>
                      {sensor.online
                        ? t('sensors.online')
                        : t('sensors.offline')}
                    </Td>
                    <Td>
                      {sensor.mostRecentReading.toLocaleDateString() +
                        ' ' +
                        sensor.mostRecentReading.toLocaleTimeString()}
                    </Td>
                    <Td>
                      <Button>{t('sensors.remove')}</Button>
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
