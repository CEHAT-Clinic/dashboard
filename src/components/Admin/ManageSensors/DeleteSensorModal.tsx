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
  CircularProgress,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Checkbox,
  Text,
  Flex,
} from '@chakra-ui/react';
import {firestore} from '../../../firebase';
import {useTranslation} from 'react-i18next';
import {useAuth} from '../../../contexts/AuthContext';
import {Sensor, LabelValue, SensorInput} from './Util';
import {FaTrash} from 'react-icons/fa';

/**
 * Props for `DeleteSensorModal`, used for type safety
 * sensors - all current sensors
 */
interface DeleteSensorModalProps {
  sensors: Sensor[];
}

/**
 * Component to delete a sensor. Includes a button to make the modal pop up
 * and a modal to delete a sensor.
 */
const DeleteSensorModal: ({sensors}: DeleteSensorModalProps) => JSX.Element = ({
  sensors,
}: DeleteSensorModalProps) => {
  const {isOpen, onOpen, onClose} = useDisclosure();
  const {isAdmin} = useAuth();

  // --------------- State maintenance variables ------------------------
  // Sensor states
  const [purpleAirId, setPurpleAirId] = useState('');
  const [sensorDocId, setSensorDocId] = useState('');

  // Confirmation states
  const [confirmPurpleAirId, setConfirmPurpleAirId] = useState('');
  const [confirmDownload, setConfirmDownload] = useState(false);
  const [acknowledgeDeletion, setAcknowledgeDeletion] = useState(false);
  const [acknowledgePermanent, setAcknowledgePermanent] = useState(false);

  // Modal state
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // --------------- End state maintenance variables ------------------------

  const readyToSubmit =
    purpleAirId !== '' &&
    purpleAirId === confirmPurpleAirId &&
    error === '' &&
    confirmDownload &&
    acknowledgeDeletion &&
    acknowledgePermanent;

  const {t} = useTranslation(['administration', 'common']);

  /**
   * Resets modal state values before closing the modal.
   */
  function handleClose(): void {
    // Sensor state
    setPurpleAirId('');
    setSensorDocId('');

    // Confirmations
    setConfirmPurpleAirId('');
    setConfirmDownload(false);
    setAcknowledgeDeletion(false);
    setAcknowledgePermanent(false);

    // Modal state
    setError('');
    setIsLoading(false);
    onClose();
  }

  /**
   * This function adds the sensor to the deletion map with the current time,
   * meaning that all readings in the readings subcollection will be deleted.
   * If the deletion map is successfully updated, the sensor's doc is deleted in
   * the sensors collection.
   * @param event - click button event
   */
  function handleDeleteSensor(event: React.MouseEvent) {
    event.preventDefault();

    if (isAdmin && readyToSubmit) {
      setIsLoading(true);

      const deletionDocRef = firestore.collection('deletion').doc('todo');

      // Get current mapping or set to empty
      deletionDocRef
        .get()
        .then(deleteDoc => {
          const newDeletionMap =
            deleteDoc.data()?.deletionMap ?? Object.create(null);

          newDeletionMap[sensorDocId] = new Date();

          deletionDocRef
            .update({deletionMap: newDeletionMap})
            .then(() => {
              firestore.collection('sensors').doc(sensorDocId).delete();
              setIsLoading(false);
            })
            .then(handleClose);
        })
        .catch(() => setError('deleteSensor.deleteSensorError'))
        .finally(() => setIsLoading(false));
    }
  }

  return (
    <Box>
      <Button colorScheme="red" onClick={onOpen}>
        {t('deleteSensor.delete')}
      </Button>
      <Modal isOpen={isOpen} onClose={handleClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t('deleteSensor.delete')}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box>
              <Text marginBottom={2}>{t('deleteSensor.note')}</Text>
              <Text fontWeight="bold">
                {t('deleteSensor.whichSensorToDelete')}
              </Text>
              <SensorInput
                sensors={sensors}
                docId={sensorDocId}
                setDocId={setSensorDocId}
                setPurpleAirId={setPurpleAirId}
              />
            </Box>
            <Box marginTop={2}>
              <Box>
                <LabelValue
                  label={t('sensors.purpleAirId')}
                  value={purpleAirId}
                />
              </Box>
              <Checkbox
                isChecked={confirmDownload}
                onChange={() => setConfirmDownload(!confirmDownload)}
              >
                {t('deleteSensor.confirmDownload')}
              </Checkbox>
              <Checkbox
                isChecked={acknowledgeDeletion}
                onChange={() => setAcknowledgeDeletion(!acknowledgeDeletion)}
              >
                {t('deleteSensor.acknowledgeDelete')}
              </Checkbox>
              <Checkbox
                isChecked={acknowledgePermanent}
                onChange={() => setAcknowledgePermanent(!acknowledgePermanent)}
              >
                {t('deleteSensor.cannotBeUndone')}
              </Checkbox>
              <FormControl isRequired isInvalid={error !== ''} marginTop={4}>
                <FormLabel>{t('deleteSensor.confirmPurpleAirId')}</FormLabel>
                <Input
                  placeholder="30971"
                  size="md"
                  onChange={event => {
                    setConfirmPurpleAirId(event.target.value);
                    setError('');
                  }}
                  value={confirmPurpleAirId}
                />
                <FormErrorMessage>{error}</FormErrorMessage>
              </FormControl>
              <Flex justifyContent="center">
                <Button
                  onClick={handleDeleteSensor}
                  isDisabled={!readyToSubmit}
                  marginTop={4}
                  colorScheme="red"
                  leftIcon={<FaTrash />}
                >
                  {isLoading ? (
                    <CircularProgress isIndeterminate size="24px" color="red" />
                  ) : (
                    t('common:submit')
                  )}
                </Button>
              </Flex>
            </Box>
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

export {DeleteSensorModal};
