import React, {useState, useEffect} from 'react';
import {Box, Heading, Flex, Button, Text} from '@chakra-ui/react';
import {useAuth} from '../../../contexts/AuthContext';
import AccessDenied from '../AccessDenied';
import Loading from '../../Util/Loading';
import {useTranslation} from 'react-i18next';
import {firestore} from '../../../firebase';
import {DownloadCSVModal} from './DownloadData/DownloadCSVModal';
import {AddSensorModal} from './AddSensorModal';
import {DeleteSensorModal} from './DeleteSensorModal';
import DeleteOldDataModal from './DeleteOldDataModal';
import {Sensor} from './Util/Types';
import {SensorTable} from './SensorTable/SensorTable';

/**
 * Component for administrative page to manage the sensors.
 * If a user is not signed in or an admin user, access is denied.
 */
const ManageSensors: () => JSX.Element = () => {
  const {isAuthenticated, isAdmin, isLoading: fetchingAuthInfo} = useAuth();
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const {t} = useTranslation('administration');

  // Get sensors, and update sensors list as the data changes
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
                latitude: sensorData.latitude ?? Number.NaN,
                longitude: sensorData.longitude ?? Number.NaN,
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
          <Flex justifyContent="center">
            {/* TODO: add spacing and allow for movement */}
            <AddSensorModal />
            <DownloadCSVModal sensors={sensors} />
            <DeleteOldDataModal />
            <DeleteSensorModal
              sensors={sensors.filter(sensor => !sensor.isActive)}
            />
          </Flex>
          <SensorTable
            title={t('sensors.activeHeading')}
            sensors={sensors.filter(sensor => sensor.isActive)}
            setError={setError}
            activateHeading={t('sensors.active')}
            activateNote={t('sensors.activeNote')}
          />
          <SensorTable
            title={t('sensors.inactiveHeading')}
            sensors={sensors.filter(sensor => !sensor.isActive)}
            setError={setError}
            activateHeading={t('sensors.inactive')}
            activateNote={t('sensors.inactiveNote')}
          />
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
