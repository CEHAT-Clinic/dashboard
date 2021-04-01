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

  // Sensor state
  const [purpleAirId, setPurpleAirId] = useState('');
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [sensorName, setSensorName] = useState('');

  // Modal state
  const [showHelp, setShowHelp] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmPage, setShowConfirmPage] = useState(false);
  const [sensorAdded, setSensorAdded] = useState(false);
  // --------------- End state maintenance variables ------------------------

  const {t} = useTranslation(['administration', 'common']);

  /**
   * Resets modal state values before closing the modal.
   */
  function handleClose() {
    // Sensor state
    setPurpleAirId('');
    setLatitude(0);
    setLongitude(0);
    setSensorName('');

    // Modal state
    setShowHelp(false);
    setError('');
    setIsLoading(false);
    setShowConfirmPage(false);
    setSensorAdded(false);
    onClose();
  }

  /**
   * Verifies a new sensor after the sensor ID is submitted
   * @param event - submit form event
   */
  async function handleSubmitSensorId(
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> {
    // Prevents submission before function is complete
    event.preventDefault();

    if (isAdmin) {
      // TODO: parse the PurpleAir website's link for select=purpleAirId#
      const purpleAirIdNumber = +purpleAirId;
      try {
        // Make sure that no sensor with this ID already exists in Firestore
        const querySnapshot = await firestore
          .collection('sensors')
          .where('purpleAirId', '==', purpleAirIdNumber)
          .get();

        if (querySnapshot.empty) {
          const purpleAirApiUrl = `https://api.purpleair.com/v1/sensors/${purpleAirIdNumber}`;
          const purpleAirResponse = await axios({
            method: 'GET',
            url: purpleAirApiUrl,
            headers: {
              'X-API-Key': process.env.REACT_APP_PURPLEAIR_READ_API_KEY,
            },
            params: {
              sensor_index: purpleAirIdNumber, // eslint-disable-line camelcase
            },
          });

          const sensorData = purpleAirResponse.data.sensor;
          setLatitude(sensorData.latitude);
          setLongitude(sensorData.longitude);
          setSensorName(sensorData.name);
          setShowConfirmPage(true);
        } else {
          setError(t('sensors.sensorAlreadyExists'));
        }
      } catch (error) {
        // TODO: this isn't working, not catching error and not catching the error code
        console.log(error);
        setError('Unable to add sensor. Please check that the PurpleAir ID is correct');
        // if (error.error === 'NotFoundError') {
        //   console.log('No sensor exists');
        //   setError('No sensor with that ID exists');
        // } else {
        //   setError(error.description);
        // }
      }
    }
  }

  function goBackToStart() {
    // Modal state
    setShowHelp(false);
    setError('');
    setIsLoading(false);
    setShowConfirmPage(false);
    setSensorAdded(false);

    // Sensor state
    setPurpleAirId('');
    setLatitude(0);
    setLongitude(0);
    setSensorName('');
  }

  /**
   * Adds a new sensor by creating a sensor doc in the sensors collection in
   * Firestore and adding the sensor to the PurpleAir group used by the backend
   * @param event - submit form event
   */
  function finishAddSensor() {
    if (isAdmin) {
      setIsLoading(true);
      const purpleAirIdNumber = +purpleAirId;
      // Add to PurpleAir Group
      const purpleAirGroupApiUrl =
        'https://api.purpleair.com/v1/groups/490/members';

      // Add the sensor to the sensor group 490
      axios({
        method: 'POST',
        url: purpleAirGroupApiUrl,
        headers: {
          'X-API-Key': process.env.REACT_APP_PURPLEAIR_WRITE_API_KEY,
        },
        params: {
          sensor_index: purpleAirIdNumber, // eslint-disable-line camelcase
        },
      })
        .then(() => {
          // Add document with initial values to Firestore
          firestore
            .collection('sensors')
            .add({
              name: sensorName,
              purpleAirId: purpleAirIdNumber,
              latitude: latitude,
              longitude: longitude,
              isActive: true,
              isValid: false,
              lastValidAqiTime: null,
              lastSensorReadingTime: null,
            })
            .then(() => setSensorAdded(true))
            .catch(error => setError(error.message));
        })
        .catch(error => setError(error.data))
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
          {sensorAdded ? (
            <Flex alignItems="center" justifyContent="center" marginTop="1em">
              <CheckCircleIcon color="green.500" />
              <Text fontSize="lg">{t('sensors.addComplete')}</Text>
            </Flex>
          ) : (
            <ModalBody>
              {showConfirmPage ? (
                <Box>
                  <Text>{latitude}</Text>
                  <Text>{longitude}</Text>
                  <Text>{sensorName}</Text>
                  <Button onClick={goBackToStart}>Go Back</Button>
                  <Button onClick={finishAddSensor}>Confirm</Button>
                </Box>
              ) : (
                <Box>
                  {/* TODO: component re-renders and loses focus with each edit */}
                  <form onSubmit={handleSubmitSensorId}>
                    <FormControl
                      isRequired
                      isInvalid={error !== ''}
                      marginTop={4}
                    >
                      <FormLabel>{t('sensors.purpleAirId')}</FormLabel>
                      <Input
                        placeholder="30971"
                        size="md"
                        onChange={event => {
                          setPurpleAirId(event.target.value);
                          setError('');
                        }}
                        value={purpleAirId}
                      />
                      <FormErrorMessage>{error}</FormErrorMessage>
                    </FormControl>
                    {!sensorAdded && (
                      <SubmitButton
                        label={t('common:submit')}
                        isLoading={isLoading}
                      />
                    )}
                    <Divider marginY={3} />
                    <Button onClick={() => setShowHelp(!showHelp)}>
                      {showHelp
                        ? t('sensors.hideAddHelp')
                        : t('sensors.showAddHelp')}
                    </Button>
                    {showHelp && (
                      <Box marginTop={2}>
                        <Heading fontSize="md">
                          {t('sensors.purpleAirId')}
                        </Heading>
                        <Text>{t('sensors.addHelpPurpleAirId')}</Text>
                      </Box>
                    )}
                  </form>
                </Box>
              )}
            </ModalBody>
          )}
          <ModalFooter>
            <Button colorScheme="red" marginLeft={4} onClick={handleClose}>
              {t('common:close')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export {AddSensorModal};
