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
  Center,
  Text,
  HStack,
} from '@chakra-ui/react';
import {useAuth} from '../../../contexts/AuthContext';
import AccessDenied from '../AccessDenied';
import Loading from '../../Util/Loading';
import {useTranslation} from 'react-i18next';
import {firestore} from '../../../firebase';
import {DownloadCSVModal} from './DownloadData/DownloadCSVModal';
import {AddSensorModal} from './AddSensorModal';
import {DeleteSensorModal} from './DeleteSensorModal';
import DeleteOldDataModal from './DeleteOldDataModal';
import {numberToString, timestampToDateString} from './Util';
import {Sensor} from './Types';
import {MoreInfoHeading} from './MoreInfoHeading';
import {ToggleActiveSensorPopover} from './ToggleActivePopover';

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
                purpleAirId: sensorData.purpleAirId,
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
            {/* TODO: change this to active and inactive sensors */}
            <Heading textAlign="justify" fontSize="2xl">
              {t('sensors.heading')}
            </Heading>
            {/* TODO: make component for table of sensors */}
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
                    <Td>{numberToString(sensor.latitude, t)}</Td>
                    <Td>{numberToString(sensor.longitude, t)}</Td>
                    <Td>
                      {sensor.isActive
                        ? t('sensors.active')
                        : t('sensors.inactive')}
                    </Td>
                    <Td>{timestampToDateString(sensor.lastValidAqiTime, t)}</Td>
                    <Td>
                      {timestampToDateString(sensor.lastSensorReadingTime, t)}
                    </Td>
                    <Td>
                      <ToggleActiveSensorPopover
                        sensor={sensor}
                        setError={setError}
                      />
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
