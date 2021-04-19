import React, {useState, MouseEvent} from 'react';
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
  CircularProgress,
} from '@chakra-ui/react';
import {CheckCircleIcon, WarningIcon} from '@chakra-ui/icons';
import {useTranslation} from 'react-i18next';
import {SubmitButton} from '../ComponentUtil';
import firebase, {firestore} from '../../../firebase/firebase';
import {useAuth} from '../../../contexts/AuthContext';
import axios from 'axios';
import {LabelValue} from './Util/LabelValue';

/**
 * Component to add a new sensor. Includes a button to make the modal pop up
 * and a modal to add a new sensor.
 *
 * The modal has three pages: the initial page has a form field to add a PurpleAir
 * ID, and a helper message about how to find this ID. The next page is a
 * confirm page that allows the user to confirm the details of the sensor that
 * will be added. The final page shows either a confirmation message or an error
 * message, if the sensor was not able to be added.
 */
function AddSensorModal(): JSX.Element {
  // --------------- State maintenance variables ------------------------
  const {isOpen, onOpen, onClose} = useDisclosure();
  const {isAdmin} = useAuth();

  // Sensor state
  const [purpleAirIdString, setPurpleAirIdString] = useState('');
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [sensorName, setSensorName] = useState('');

  // Modal state
  const [showHelp, setShowHelp] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmPage, setShowConfirmPage] = useState(false);
  const [showFinalPage, setShowFinalPage] = useState(false);
  const [sensorAdded, setSensorAdded] = useState(false);
  // --------------- End state maintenance variables ------------------------

  const {t} = useTranslation(['sensors', 'common']);

  /**
   * Resets modal state values before closing the modal.
   */
  function handleClose(): void {
    // Sensor state
    setPurpleAirIdString('');
    setLatitude(0);
    setLongitude(0);
    setSensorName('');

    // Modal state
    setShowHelp(false);
    setError('');
    setIsLoading(false);
    setShowConfirmPage(false);
    setShowFinalPage(false);
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
      setIsLoading(true);
      try {
        const purpleAirId = +purpleAirIdString;
        // Make sure that no sensor with this ID already exists in Firestore
        const querySnapshot = await firestore
          .collection('sensors')
          .where('purpleAirId', '==', purpleAirId)
          .get();

        // If the query snapshot is not empty, a sensor doc with this PurpleAir ID
        // already exists in Firestore
        if (querySnapshot.empty) {
          const purpleAirApiUrl = `https://api.purpleair.com/v1/sensors/${purpleAirIdString}`;
          const purpleAirResponse = await axios({
            method: 'GET',
            url: purpleAirApiUrl,
            headers: {
              'X-API-Key': process.env.REACT_APP_PURPLEAIR_READ_API_KEY,
            },
          });

          const sensorData = purpleAirResponse.data.sensor;
          setLatitude(sensorData.latitude);
          setLongitude(sensorData.longitude);
          setSensorName(sensorData.name);
          setShowConfirmPage(true);
        } else {
          setError(t('add.sensorAlreadyExists'));
        }
      } catch (error) {
        setError(t('add.unableToAddSensor'));
      } finally {
        setIsLoading(false);
      }
    }
  }

  /**
   * Allows a user to go back to the first form page from the confirm sensor page.
   * @param event - click button event
   */
  function goBackToStart(event: MouseEvent): void {
    event.preventDefault();

    // Modal state
    setShowHelp(false);
    setError('');
    setIsLoading(false);
    setShowConfirmPage(false);
    setShowFinalPage(false);
    setSensorAdded(false);

    // Sensor state
    setLatitude(0);
    setLongitude(0);
    setSensorName('');
  }

  /**
   * Adds a new sensor by creating a sensor doc in the sensors collection in
   * Firestore and adding the sensor to the PurpleAir group used by the backend
   * @param event - click button event
   */
  async function finishAddSensor(event: MouseEvent): Promise<void> {
    event.preventDefault();

    if (isAdmin) {
      setIsLoading(true);
      const purpleAirId = +purpleAirIdString;
      // Add to PurpleAir Group
      const purpleAirGroupApiUrl =
        'https://api.purpleair.com/v1/groups/490/members';

      try {
        // Add the sensor to the sensor group 490
        await axios({
          method: 'POST',
          url: purpleAirGroupApiUrl,
          headers: {
            'X-API-Key': process.env.REACT_APP_PURPLEAIR_WRITE_API_KEY,
          },
          params: {
            sensor_index: purpleAirId, // eslint-disable-line camelcase
          },
        });

        // Value for AQI and PM2.5 buffer, from bufferStatus in backend
        const bufferDoesNotExist = 2;

        // Create a sensor doc for the added sensor
        await firestore.collection('sensors').add({
          name: sensorName,
          purpleAirId: purpleAirId,
          latitude: latitude,
          longitude: longitude,
          isActive: true,
          isValid: false,
          lastValidAqiTime: null,
          lastSensorReadingTime: null,
          lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
          aqiBufferStatus: bufferDoesNotExist,
          pm25BufferStatus: bufferDoesNotExist,
        });
        setSensorAdded(true);
      } catch {
        // The default value should be false, so this should do nothing
        setSensorAdded(false);
      } finally {
        setShowFinalPage(true);
        setIsLoading(false);
      }
    }
  }

  return (
    <Box>
      <Button minWidth="80%" colorScheme="teal" onClick={onOpen}>
        {t('add.heading')}
      </Button>
      <Modal isOpen={isOpen} onClose={handleClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t('add.heading')}</ModalHeader>
          <ModalCloseButton />
          {showFinalPage ? (
            <Box>
              {/* Show success or failure to add sensor */}
              {sensorAdded ? (
                <Flex
                  alignItems="center"
                  justifyContent="center"
                  marginTop="1em"
                >
                  <CheckCircleIcon color="green.500" />
                  <Text fontSize="lg">{t('add.complete')}</Text>
                </Flex>
              ) : (
                <Flex
                  alignItems="center"
                  justifyContent="center"
                  marginTop="1em"
                >
                  <WarningIcon color="red.500" />
                  <Text fontSize="lg">{t('add.failure')}</Text>
                </Flex>
              )}
              {/* End show success or failure to add a sensor */}
            </Box>
          ) : (
            <ModalBody>
              {showConfirmPage ? (
                <Flex>
                  {/* Start confirm sensor details page */}
                  <Box>
                    <LabelValue label={t('name')} value={sensorName} />
                    <LabelValue
                      label={t('purpleAirId')}
                      value={purpleAirIdString}
                    />
                    <LabelValue
                      label={t('latitude')}
                      value={latitude.toString()}
                    />
                    <LabelValue
                      label={t('longitude')}
                      value={longitude.toString()}
                    />
                    <Box>
                      <Button
                        margin={1}
                        marginRight={3}
                        onClick={goBackToStart}
                      >
                        {t('add.goBack')}
                      </Button>
                      {/* Start confirm sensor button */}
                      <Button
                        margin={1}
                        marginX={3}
                        colorScheme="green"
                        onClick={finishAddSensor}
                      >
                        {isLoading ? (
                          <CircularProgress
                            isIndeterminate
                            size="24px"
                            color="green"
                          />
                        ) : (
                          t('common:confirm')
                        )}
                      </Button>
                      {/* End confirm sensor button */}
                    </Box>
                  </Box>
                  {/* End confirm sensor details page */}
                </Flex>
              ) : (
                <Box>
                  {/* Begin add sensor form */}
                  <form onSubmit={handleSubmitSensorId}>
                    <FormControl
                      isRequired
                      isInvalid={error !== ''}
                      marginTop={4}
                    >
                      <FormLabel>{t('purpleAirId')}</FormLabel>
                      <Input
                        placeholder="30971"
                        size="md"
                        onChange={event => {
                          setPurpleAirIdString(event.target.value);
                          setError('');
                        }}
                        value={purpleAirIdString}
                        type="number"
                      />
                      <FormErrorMessage>{error}</FormErrorMessage>
                    </FormControl>
                    <SubmitButton
                      label={t('common:submit')}
                      isLoading={isLoading}
                      isDisabled={purpleAirIdString === '' || error !== ''}
                    />
                    <Divider marginY={3} />
                    {/* Being helper message */}
                    <Button onClick={() => setShowHelp(!showHelp)}>
                      {showHelp ? t('add.hideHelp') : t('add.showHelp')}
                    </Button>
                    {showHelp && (
                      <Box marginTop={2}>
                        <Heading fontSize="md">{t('purpleAirId')}</Heading>
                        <Text>{t('add.helpMessage')}</Text>
                      </Box>
                    )}
                    {/* End helper message */}
                  </form>
                  {/* End add sensor form */}
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
