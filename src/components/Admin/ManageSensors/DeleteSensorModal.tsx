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
import firebase, {firestore} from '../../../firebase/firebase';
import {useTranslation} from 'react-i18next';
import {useAuth} from '../../../contexts/AuthContext';
import {Sensor, PurpleAirGroupMember} from './Util/Types';
import {numberToString} from './Util/Util';
import {SensorInput} from './Util/SensorInput';
import {FaTrash} from 'react-icons/fa';
import axios, {AxiosResponse} from 'axios';
import {LabelValue} from './Util/LabelValue';
import {
  DELETION_COLLECTION,
  READINGS_DELETION_DOC,
  SENSORS_COLLECTION,
} from '../../../firebase/firestore';
import {GROUP_ID} from '../../../purpleair';

/**
 * Props for `DeleteSensorModal`, used for type safety
 * `sensors` - an array of inactive sensors
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
  const [purpleAirId, setPurpleAirId] = useState(Number.NaN);
  const [sensorDocId, setSensorDocId] = useState('');

  // Confirmation states
  const [confirmPurpleAirIdString, setConfirmPurpleAirIdString] = useState('');
  const [confirmDownload, setConfirmDownload] = useState(false);
  const [acknowledgeDeletion, setAcknowledgeDeletion] = useState(false);
  const [acknowledgePermanent, setAcknowledgePermanent] = useState(false);

  // Modal state
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // --------------- End state maintenance variables ------------------------

  const readyToSubmit =
    confirmPurpleAirIdString !== '' &&
    purpleAirId === +confirmPurpleAirIdString &&
    error === '' &&
    confirmDownload &&
    acknowledgeDeletion &&
    acknowledgePermanent;

  const {t} = useTranslation(['sensors', 'common']);

  /**
   * Resets modal state values before closing the modal.
   */
  function handleClose(): void {
    // Sensor state
    setPurpleAirId(Number.NaN);
    setSensorDocId('');

    // Confirmations
    setConfirmPurpleAirIdString('');
    setConfirmDownload(false);
    setAcknowledgeDeletion(false);
    setAcknowledgePermanent(false);

    // Modal state
    setError('');
    setIsLoading(false);
    onClose();
  }

  /**
   * Gets the member ID for a sensor in the PurpleAir group
   * @returns the member ID of the sensor to be deleted in PurpleAir group, or `NaN` if the sensor was not in the group
   */
  function getPurpleAirMemberId(): Promise<number> {
    const purpleAirGroupApiUrl = `https://api.purpleair.com/v1/groups/${GROUP_ID}`;

    return axios({
      method: 'GET',
      url: purpleAirGroupApiUrl,
      headers: {
        'X-API-Key': process.env.REACT_APP_PURPLEAIR_READ_API_KEY,
      },
    }).then(purpleAirResponse => {
      const purpleAirData = purpleAirResponse.data;
      const groupMembers: PurpleAirGroupMember[] = purpleAirData.members;

      // Find the member ID of the group of the sensor to be deleted
      for (const member of groupMembers) {
        if (member.sensor_index === purpleAirId) {
          return member.id;
        }
      }
      // If the sensor was not in the members list, then we don't need to delete
      // that sensor from the group, which is marked with `NaN`.
      return Number.NaN;
    });
  }

  /**
   * Deletes a given member from the PurpleAir group
   * @param memberId - the member ID of the sensor to be deleted in PurpleAir group, or `NaN` if the sensor was not in the group
   * @returns Either an empty Promise if the sensor does not need to be deleted or the axios response from PurpleAir, which returns no data from PurpleAir upon success to delete the member from the group
   */
  function deleteFromPurpleAirGroup(
    memberId: number
  ): Promise<AxiosResponse | void> {
    if (Number.isNaN(memberId)) {
      // If memberId is `NaN`, then the sensor to be deleted is already not a
      // member of the PurpleAir group
      return Promise.resolve();
    } else {
      const purpleAirApiDeleteGroupMemberUrl = `https://api.purpleair.com/v1/groups/${GROUP_ID}/members/${memberId}`;

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
    return firestore.collection(SENSORS_COLLECTION).doc(sensorDocId).delete();
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
      .collection(DELETION_COLLECTION)
      .doc(READINGS_DELETION_DOC)
      .update({
        deletionMap: newDeletionMap,
        lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
      });
  }

  /**
   * Fetches the todo deletion document that includes with the map of sensor doc
   * ID to the timestamp for which to delete readings before
   * @returns Promise that when resolved contains the todo deletion document
   */
  function getDeletionToDoDoc(): Promise<
    firebase.firestore.DocumentSnapshot<firebase.firestore.DocumentData>
  > {
    return firestore
      .collection(DELETION_COLLECTION)
      .doc(READINGS_DELETION_DOC)
      .get();
  }

  /**
   * This function adds the sensor to the deletion map with the current time,
   * meaning that all readings in the readings subcollection will be deleted.
   * If the deletion map is successfully updated, the sensor is removed from
   * the PurpleAir group so we stop getting data for the sensor, and the
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
          setError('deleteSensor.error');
          setIsLoading(false);
        });
    }
  }

  return (
    <Box>
      <Button minWidth="80%" colorScheme="red" onClick={onOpen}>
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
              <LabelValue
                label={t('purpleAirId')}
                value={numberToString(purpleAirId, t('unknown'))}
              />
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
                    setConfirmPurpleAirIdString(event.target.value);
                    setError('');
                  }}
                  value={confirmPurpleAirIdString}
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
