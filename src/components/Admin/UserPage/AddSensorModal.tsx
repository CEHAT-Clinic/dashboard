import React, {useState} from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Text,
  Button,
  Box,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Divider,
  Heading,
  FormErrorMessage,
} from '@chakra-ui/react';
import {CheckCircleIcon} from '@chakra-ui/icons';
import {useTranslation} from 'react-i18next';
import {SubmitButton} from '../Authentication/Util';
import {firestore} from '../../../firebase';
import {useAuth} from '../../../contexts/AuthContext';
import axios from 'axios';

/**
 * Component to add a new sensor. Includes a button to make the modal pop up
 * and a modal to add a new sensor.
 */
function AddSensorModal(): JSX.Element {
  // --------------- State maintenance variables ------------------------
  const {isOpen, onOpen, onClose} = useDisclosure();
  const {isAdmin} = useAuth();
  const [sensorPurpleAirId, setSensorPurpleAirId] = useState(NaN);
  const [showHelp, setShowHelp] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sensorAdded, setSensorAdded] = useState(false);
  // --------------- End state maintenance variables ------------------------

  const {t} = useTranslation(['administration', 'common']);

  /**
   * Resets modal state values before closing the modal.
   */
  function handleClose() {
    setError('');
    setSensorPurpleAirId(NaN);
    setIsLoading(false);
    setSensorAdded(false);
    onClose();
  }

  /**
   * Adds a new sensor by creating a sensor doc in the sensors collection in Firestore
   * @param event - submit form event
   */
  function handleAddSensor(event: React.FormEvent<HTMLFormElement>) {
    // Prevents submission before call to Firebase is complete
    event.preventDefault();

    if (isAdmin) {
      setIsLoading(true);
      // Add to PurpleAir Group
      // TODO: test this
      const purpleAirGroupApiUrl =
        'https://api.purpleair.com/v1/groups/490/members';

      // Add the sensor to the sensor group 490
      axios
        .post(purpleAirGroupApiUrl, {
          headers: {
            'X-API-Key': process.env.REACT_APP_PURPLEAIR_WRITE_API_KEY,
          },
          params: {
            sensor_index: sensorPurpleAirId, // eslint-disable-line camelcase
          },
        })
        .then(purpleAirResponse => {
          const sensorData = purpleAirResponse.data.sensor;
          // Check to see that a sensor with that PurpleAir ID does not already exist
          firestore
            .collection('sensors')
            .where('purpleAirId', '==', sensorPurpleAirId)
            .get()
            .then(querySnapshot => {
              if (querySnapshot.empty) {
                firestore
                  .collection('sensors')
                  .add({
                    name: sensorData.name,
                    purpleAirId: sensorPurpleAirId,
                    latitude: sensorData.latitude,
                    longitude: sensorData.longitude,
                    isActive: true,
                    isValid: false,
                    lastValidAqiTime: null,
                    lastSensorReadingTime: null,
                  })
                  .then(() => setSensorAdded(true))
                  .catch(error => setError(error.message));
              } else {
                setError(t('sensors.sensorAlreadyExists'));
              }
            })
          .catch(error => setError(error.message));
        })
        .catch(error => setError(error.message))
        .finally(() => setIsLoading(false));
    }
  }

  return (
    <Box marginY={2}>
      <Button colorScheme="teal" onClick={onOpen}>
        {t('sensors.add')}
      </Button>
      <Modal isOpen={isOpen} onClose={handleClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t('sensors.add')}</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleAddSensor}>
            {sensorAdded ? (
              <Flex alignItems="center" justifyContent="center" marginTop="1em">
                <CheckCircleIcon color="green.500" />
                <Text fontSize="lg">{t('sensors.addComplete')}</Text>
              </Flex>
            ) : (
              <ModalBody>
                <FormControl isRequired isInvalid={error !== ''} marginTop={4}>
                  <FormLabel>{t('sensors.purpleAirId')}</FormLabel>
                  <Input
                    placeholder="30971"
                    type="number"
                    size="md"
                    onChange={event => {
                      setSensorPurpleAirId(+event.target.value);
                      setError('');
                    }}
                    value={sensorPurpleAirId}
                  />
                  <FormErrorMessage>{error}</FormErrorMessage>
                </FormControl>
                <Divider marginY={3} />
                <Button onClick={() => setShowHelp(!showHelp)}>
                  {showHelp
                    ? t('sensors.hideAddHelp')
                    : t('sensors.showAddHelp')}
                </Button>
                {showHelp && (
                  <Box marginTop={2}>
                    <Heading fontSize="md">{t('sensors.purpleAirId')}</Heading>
                    <Text>{t('sensors.addHelpPurpleAirId')}</Text>
                  </Box>
                )}
              </ModalBody>
            )}
            <ModalFooter>
              {!sensorAdded && (
                <SubmitButton
                  label={t('common:submit')}
                  isLoading={isLoading}
                />
              )}
              <Button colorScheme="red" marginLeft={4} onClick={handleClose}>
                {t('common:close')}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export {AddSensorModal};
