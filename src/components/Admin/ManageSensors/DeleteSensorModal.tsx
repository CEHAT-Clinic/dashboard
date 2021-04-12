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
import firebase, {firestore} from '../../../firebase';
import {useTranslation} from 'react-i18next';
import {useAuth} from '../../../contexts/AuthContext';
import {Sensor, LabelValue, SensorInput, PurpleAirGroupMember} from './Util';
import {FaTrash} from 'react-icons/fa';
import axios, {AxiosResponse} from 'axios';

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
   * Gets the member ID for a sensor in PurpleAir group 490
   * @returns the member ID of the sensor to be deleted in PurpleAir group 490, or `NaN` if the sensor was not in the group
   */
  function getPurpleAirMemberId(): Promise<number> {
    const purpleAirGroupApiUrl = 'https://api.purpleair.com/v1/groups/490';

    return axios({
      method: 'GET',
      url: purpleAirGroupApiUrl,
      headers: {
        'X-API-Key': process.env.REACT_APP_PURPLEAIR_READ_API_KEY,
      },
    }).then(purpleAirResponse => {
      const purpleAirData = purpleAirResponse.data;
      const groupMembers: Array<PurpleAirGroupMember> = purpleAirData.members;

      // Find the member ID of group 490 for the sensor to be deleted
      for (const member of groupMembers) {
        if (member.sensor_index === +purpleAirId) {
          return member.id;
        }
      }
      // If the sensor was not in the members list, then we don't need to delete
      // that sensor from the group, which is marked with NaN
      return Number.NaN;
    });
  }

  /**
   * Deletes a given member from the PurpleAir group 490
   * @param memberId - the member ID of the sensor to be deleted in PurpleAir group 490, or `NaN` if the sensor was not in the group
   * @returns Either an empty Promise if the sensor does not need to be deleted or the axios response from PurpleAir, which returns no data from PurpleAir upon success to delete the member from the group.
   */
  function deleteFromPurpleAirGroup(
    memberId: number
  ): Promise<AxiosResponse | void> {
    if (Number.isNaN(memberId)) {
      // If memberId is NaN, then the sensor to be deleted is already not a member
      // of the PurpleAir group 490
      return Promise.resolve();
    } else {
      const purpleAirApiDeleteGroupMemberUrl = `https://api.purpleair.com/v1/groups/490/members/${memberId}`;

      return axios({
        method: 'DELETE',
        url: purpleAirApiDeleteGroupMemberUrl,
        headers: {
          'X-API-Key': process.env.REACT_APP_PURPLEAIR_WRITE_API_KEY,
        },
      });
    }
  }

  /**
   * Deletes a sensor's doc in the sensors collection
   * @returns Promise that resolves when a sensor doc is deleted
   */
  function deleteSensorDoc(): Promise<void> {
    return firestore.collection('sensors').doc(sensorDocId).delete();
  }

  /**
   * Updates the deletion map with the current time for the sensor being deleted
   * @param deleteDoc - document snapshot of the deletion document that stores the deletion map
   * @returns Promise that resolves when the deletion map is updated
   */
  function updateDeletionMap(
    deleteDoc: firebase.firestore.DocumentSnapshot<firebase.firestore.DocumentData>
  ) {
    const newDeletionMap = deleteDoc.data()?.deletionMap ?? Object.create(null);

    newDeletionMap[sensorDocId] = new Date();

    return firestore
      .collection('deletion')
      .doc('todo')
      .update({deletionMap: newDeletionMap});
  }

  /**
   * Fetches the todo deletion document that includes with the map of sensor doc
   * ID to the timestamp for which to delete readings before
   * @returns Promise that when resolved contains the todo deletion document
   */
  function getDeletionToDoDoc(): Promise<
    firebase.firestore.DocumentSnapshot<firebase.firestore.DocumentData>
  > {
    return firestore.collection('deletion').doc('todo').get();
  }

  /**
   * This function adds the sensor to the deletion map with the current time,
   * meaning that all readings in the readings subcollection will be deleted.
   * If the deletion map is successfully updated, the sensor is removed from
   * PurpleAir group 490 so we stop getting data for the sensor, and the
   * sensor's doc is deleted in the sensors collection.
   * @param event - click button event
   */
  function handleDeleteSensor(event: React.MouseEvent) {
    event.preventDefault();

    if (isAdmin && readyToSubmit) {
      setIsLoading(true);

      // First, delete the sensor from the PurpleAir group, if needed.
      // Then get the current deletion mapping or default to empty map.
      // Then update the deletion map to include the deleted sensor.
      // Finally, delete the sensor doc, and close the modal upon success.
      getPurpleAirMemberId()
        .then(memberId => deleteFromPurpleAirGroup(memberId))
        .then(getDeletionToDoDoc)
        .then(deleteDoc => updateDeletionMap(deleteDoc))
        .then(deleteSensorDoc)
        .then(handleClose)
        .catch(() => {
          setError('deleteSensor.deleteSensorError');
          setIsLoading(false);
        });
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