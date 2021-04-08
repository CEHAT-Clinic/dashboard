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
} from '@chakra-ui/react';
import firebase, {firestore} from '../../../firebase';
import {useTranslation} from 'react-i18next';
import {useAuth} from '../../../contexts/AuthContext';
import {Sensor, LabelValue, SensorInput} from './Util';

// TODO: get drop down select for sensor
// TODO: test deleting test document

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
  // --------------- State maintenance variables ------------------------
  const {isOpen, onOpen, onClose} = useDisclosure();
  const {isAdmin} = useAuth();

  const [purpleAirId, setPurpleAirId] = useState('');
  const [sensorDocId, setSensorDocId] = useState('');

  const [confirmPurpleAirId, setConfirmPurpleAirId] = useState('');
  const [confirmDownload, setConfirmDownload] = useState(false);
  const [acknowledgeDeletion, setAcknowledgeDeletion] = useState(false);
  const [acknowledgePermanent, setAcknowledgePermanent] = useState(false);

  // Modal state
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // --------------- End state maintenance variables ------------------------

  const allConditionsMet =
    purpleAirId === '' || purpleAirId !== confirmPurpleAirId || error !== '';

  const {t} = useTranslation(['administration', 'common']);

  /**
   * Resets modal state values before closing the modal.
   */
  function handleClose(): void {
    // Sensor state
    setPurpleAirId('');
    setSensorDocId('');
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
   *
   * @param event - click button event
   * @param currentSensor - sensor to delete
   */
  function handleDeleteSensor(event: React.MouseEvent) {
    event.preventDefault();

    if (isAdmin && allConditionsMet) {
      setIsLoading(true);

      const deletionDocRef = firestore.collection('deletion').doc('todo');

      // Get current mapping or set to empty
      deletionDocRef
        .get()
        .then(deleteDoc => {
          const newDeletionMap =
            deleteDoc.data()?.deletionMap ?? Object.create(null);

          newDeletionMap[sensorDocId] = firebase.firestore.Timestamp.fromDate(
            new Date()
          );

          deletionDocRef
            .update({deletionMap: newDeletionMap})
            .then(() =>
              firestore
                .collection('sensors')
                .doc(sensorDocId)
                .delete()
                .then(handleClose)
            );
        })
        .catch(error => setError(error)) // TODO: Fix
        .finally(() => setIsLoading(false));
    }
  }

  return (
    <Box>
      <Button colorScheme="red" onClick={onOpen}>
        {t('sensors.delete')}
      </Button>
      <Modal isOpen={isOpen} onClose={handleClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t('sensors.delete')}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box>
              <Text>{t('downloadData.whichSensor')}</Text>
              <SensorInput
                sensors={sensors}
                docId={sensorDocId}
                setDocId={setSensorDocId}
                setPurpleAirId={setPurpleAirId}
              />
            </Box>
            <Box>
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
                {t('sensors.confirmDownload')}
              </Checkbox>
              <Checkbox
                isChecked={acknowledgeDeletion}
                onChange={() => setAcknowledgeDeletion(!acknowledgeDeletion)}
              >
                {t('sensors.acknowledgeDelete')}
              </Checkbox>
              <Checkbox
                isChecked={acknowledgePermanent}
                onChange={() => setAcknowledgePermanent(!acknowledgePermanent)}
              >
                {t('sensors.cannotBeUndone')}
              </Checkbox>
              <FormControl isRequired isInvalid={error !== ''} marginTop={4}>
                <FormLabel>{t('sensors.confirmPurpleAirId')}</FormLabel>
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
              <Button
                onClick={handleDeleteSensor}
                isDisabled={!allConditionsMet}
                marginTop={4}
                colorScheme="teal"
              >
                {isLoading ? (
                  <CircularProgress isIndeterminate size="24px" color="red" />
                ) : (
                  t('common:submit')
                )}
              </Button>
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
