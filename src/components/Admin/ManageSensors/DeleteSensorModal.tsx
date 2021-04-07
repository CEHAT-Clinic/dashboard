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
  FormErrorMessage,
  Checkbox,
} from '@chakra-ui/react';
import {CheckCircleIcon} from '@chakra-ui/icons';
import {useTranslation} from 'react-i18next';
import {useAuth} from '../../../contexts/AuthContext';
import {Sensor} from './ManageSensors';

// TODO: Convert to const component and pass sensors as parameter
// make dropdown select for sensor
// handle state for checkboxes
// Add loading
// Add complete page

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
  const [sensorName, setSensorName] = useState('');

  const [confirmPurpleAirId, setConfirmPurpleAirId] = useState('');
  const [confirmDownload, setConfirmDownload] = useState(false);
  const [acknowledgeDeletion, setAcknowledgeDeletion] = useState(false);
  const [acknowledgePermanent, setAcknowledgePermanent] = useState(false);

  // Modal state
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [complete, setComplete] = useState(false);
  // --------------- End state maintenance variables ------------------------

  const disableSubmit =
    purpleAirId === '' || purpleAirId !== confirmPurpleAirId || error !== '';

  const {t} = useTranslation(['administration', 'common']);

  /**
   * Resets modal state values before closing the modal.
   */
  function handleClose(): void {
    // Sensor state
    setPurpleAirId('');

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

    if (isAdmin) {
      // TODO: determine how to delete readings subcollection
      // firestore
      //   .collection('deletion')
      //   .doc('todo')
      //   .update({
      //     isActive: !currentSensor.isActive,
      //   })
      //   .catch(() => {
      //     setError(
      //       t('sensors.changeActiveSensorError') + currentSensor.name ??
      //         currentSensor.purpleAirId
      //     );
      //   });
    }
  }

  /**
   * Interface for LabelValue props, used for type safety
   */
  interface LabelValueProps {
    label: string;
    value: string;
  }

  /**
   * Component that shows a label and a value in the same line.
   * The label is bold and a colon and space separate the label and value.
   */
  const LabelValue: ({label, value}: LabelValueProps) => JSX.Element = ({
    label,
    value,
  }: LabelValueProps) => {
    return (
      <Box>
        <Text as="span" fontWeight="bold">
          {label}
        </Text>
        <Text display="inline">{': ' + value}</Text>
      </Box>
    );
  };

  return (
    <Box marginY={2}>
      <Button colorScheme="teal" onClick={onOpen}>
        {t('sensors.delete')}
      </Button>
      <Modal isOpen={isOpen} onClose={handleClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t('sensors.delete')}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {complete ? (
              <Flex></Flex>
            ) : (
              <Box>
                <Box>
                  <LabelValue
                    label={t('sensors.purpleAirId')}
                    value={purpleAirId}
                  />
                  <LabelValue label={t('sensors.name')} value={sensorName} />
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
                  onChange={() =>
                    setAcknowledgePermanent(!acknowledgePermanent)
                  }
                >
                  {t('sensors.cannotBeUndone')}
                </Checkbox>
                <FormControl isRequired isInvalid={error !== ''} marginTop={4}>
                  <FormLabel>{t('sensors.purpleAirId')}</FormLabel>
                  <Input
                    placeholder="30971"
                    size="md"
                    onChange={event => {
                      setConfirmPurpleAirId(event.target.value);
                      setError('');
                    }}
                    value={confirmPurpleAirId}
                    type="number"
                  />
                  <FormErrorMessage>{error}</FormErrorMessage>
                </FormControl>
                <Button onClick={handleDeleteSensor} isDisabled={disableSubmit}>
                  {t('common:submit')}
                </Button>
              </Box>
            )}
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
