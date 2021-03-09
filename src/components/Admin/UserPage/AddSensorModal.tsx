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
} from '@chakra-ui/react';
import {CheckCircleIcon} from '@chakra-ui/icons';
import {useTranslation} from 'react-i18next';
import {SubmitButton} from '../Authentication/Util';
import {firestore} from '../../../firebase';

/**
 * Component to add a new sensor. Includes a button to make the modal pop up
 * and a modal to add a new sensor.
 */
function AddSensorModal(): JSX.Element {
  // --------------- State maintenance variables ------------------------
  const {isOpen, onOpen, onClose} = useDisclosure();
  const [sensorName, setSensorName] = useState('');
  const [sensorPurpleAirId, setSensorPurpleAirId] = useState('');
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
    setSensorName('');
    setSensorPurpleAirId('');
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

    setIsLoading(true);
    firestore
      .collection('test')
      .add({
        name: sensorName,
        purpleAirId: sensorPurpleAirId,
        latitude: NaN,
        longitude: NaN,
        isActive: true,
        isValid: false,
        lastValidAqiTime: null,
        lastSensorReadingTime: null,
      })
      .then(() => {
        setSensorAdded(true);
        setSensorName('');
        setSensorPurpleAirId('');
      })
      .catch(error => {
        setError(error);
      })
      .finally(() => {
        setIsLoading(false);
      });
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
                <FormControl isRequired marginTop={4}>
                  <FormLabel>{t('sensors.name')}</FormLabel>
                  <Input
                    placeholder="CEHAT 14"
                    size="md"
                    onChange={event => {
                      setSensorName(event.target.value);
                      setError('');
                    }}
                    value={sensorName}
                  />
                </FormControl>
                <FormControl isRequired marginTop={4}>
                  <FormLabel>{t('sensors.purpleAirId')}</FormLabel>
                  <Input
                    placeholder="30971"
                    size="md"
                    onChange={event => {
                      setSensorPurpleAirId(event.target.value);
                      setError('');
                    }}
                    value={sensorPurpleAirId}
                  />
                </FormControl>
              </ModalBody>
            )}
            <ModalFooter>
              {!sensorAdded && (
                <SubmitButton
                  label={t('common:submit')}
                  isLoading={isLoading}
                  error={error}
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
