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
  Button,
  Box,
  Text,
  Center,
} from '@chakra-ui/react';
import {Sensor} from './Util/Types';
import {SensorInput} from './Util/SensorInput';
import {LabelValue} from './Util/LabelValue';
import {numberToString} from './Util/Util';
import {useAuth} from '../../../contexts/AuthContext';
import firebase, {firestore} from '../../../firebase';
import {useTranslation} from 'react-i18next';

/**
 * Interface for ToggleActiveModalProps used for type safety
 * - `active` - if the sensors are currently active or not
 * - `sensors` - a list of sensors whose active status is `active`
 */
interface ToggleActiveModalProps {
  isActive: boolean;
  sensors: Sensor[];
}

/**
 * Creates a button that when clicked, creates a modal popup to change
 * a sensor's active status. Active means that data for the sensor will be
 * collected and shown on the map, but does not change anything in PurpleAir.
 * @param isActive - if the sensors are currently active or not
 * @param sensors - a list of sensors whose active status is `active`
 * @returns button that when clicked creates a popover to activate or deactivate a sensor
 */
const ToggleActiveModal: ({
  isActive,
  sensors,
}: ToggleActiveModalProps) => JSX.Element = ({
  isActive,
  sensors,
}: ToggleActiveModalProps) => {
  const {isOpen, onOpen, onClose} = useDisclosure();
  const {isAdmin} = useAuth();
  const {t} = useTranslation(['sensors', 'common']);

  // Sensor states
  const [purpleAirId, setPurpleAirId] = useState(Number.NaN);
  const [sensorDocId, setSensorDocId] = useState('');

  // Modal state
  const [error, setError] = useState('');

  /**
   * Resets modal state values before closing the modal.
   */
  function handleClose(): void {
    // Sensor state
    setPurpleAirId(Number.NaN);
    setSensorDocId('');

    // Modal state
    setError('');
    onClose();
  }

  /**
   * Toggles `isActive` in a sensor's doc. This also resets the AQI buffer
   * and PM2.5 buffer when activating or deactivating.
   * @param event - click button event
   * @param sensor - sensor for which to toggle isActive status
   *
   * @remarks
   * Note that when a sensor is activated or deactivated, we do not change it in
   * our PurpleAir group: 490. We will still get data from PurpleAir in our API
   * call, but the resulting data will not be used anywhere.
   */
  function toggleActiveSensorStatus(
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) {
    event.preventDefault();

    if (isAdmin) {
      // Value from bufferStatus enum in backend
      const bufferDoesNotExist = 2;

      // Toggle the isActive and remove the buffers
      firestore
        .collection('sensors')
        .doc(sensorDocId)
        .update({
          isActive: !isActive,
          lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
          aqiBufferStatus: bufferDoesNotExist,
          aqiBuffer: firebase.firestore.FieldValue.delete(),
          aqiBufferIndex: firebase.firestore.FieldValue.delete(),
          pm25BufferStatus: bufferDoesNotExist,
          pm25Buffer: firebase.firestore.FieldValue.delete(),
          pm25BufferIndex: firebase.firestore.FieldValue.delete(),
        })
        .catch(() => {
          const errorStart = isActive
            ? t('deactivate.error')
            : t('activate.error');
          setError(errorStart + purpleAirId);
        });
    }
  }

  const note = isActive ? t('deactivate.note') : t('activate.note');

  const whichSensor = isActive
    ? t('deactivate.whichSensor')
    : t('activate.whichSensor');

  return (
    <Box>
      <Button
        minWidth="80%"
        colorScheme={isActive ? 'red' : 'teal'}
        onClick={onOpen}
      >
        {isActive ? t('deactivate.heading') : t('activate.heading')}
      </Button>
      <Modal isOpen={isOpen} onClose={handleClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t('common:confirm')}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box paddingBottom={2}>
              <Text marginBottom={2}>{note}</Text>
              <Text fontWeight="bold">{whichSensor}</Text>
              <SensorInput
                sensors={sensors}
                docId={sensorDocId}
                setDocId={setSensorDocId}
                setPurpleAirId={setPurpleAirId}
              />
            </Box>
            <LabelValue
              label={t('purpleAirId')}
              value={numberToString(purpleAirId, t('unknown'))}
            />
            <Center>
              <Button
                paddingY={2}
                colorScheme={isActive ? 'red' : 'teal'}
                onClick={toggleActiveSensorStatus}
              >
                {t('common:confirm')}
              </Button>
            </Center>
            <Text textColor="red">{error}</Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="red" marginLeft={4} onClick={handleClose}>
              {t('common:close')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export {ToggleActiveModal};
