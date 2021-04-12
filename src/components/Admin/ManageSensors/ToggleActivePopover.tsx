import React from 'react';
import {
  Heading,
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverHeader,
  PopoverBody,
  Center,
  Text,
  Divider,
} from '@chakra-ui/react';
import {Sensor} from './Util';
import {useAuth} from '../../../contexts/AuthContext';
import firebase, {firestore} from '../../../firebase';
import {useTranslation} from 'react-i18next';


/**
 * Interface for ToggleActiveSensorPopover used for type safety
 * - `sensor` - the sensor for a row in the table
 * - `setError` - the state setter for errors in the activate/deactivate process
 */
interface ToggleActiveSensorPopoverProps {
  sensor: Sensor;
  setError: React.Dispatch<React.SetStateAction<string>>
}

/**
 * Creates a button that when clicked, creates a confirmation popup to change
 * a sensor's active status. Active means that data for the sensor will be
 * collected and shown on the map, but does not change anything in PurpleAir.
 * @param sensor - sensor for a row
 */
const ToggleActiveSensorPopover: ({
  sensor, setError
}: ToggleActiveSensorPopoverProps) => JSX.Element = ({
  sensor,
  setError
}: ToggleActiveSensorPopoverProps) => {
  const {isAdmin} = useAuth();
  const {t} = useTranslation(['administration', 'common']);

  /**
   * Toggles `isActive` in a sensor's doc. This also resets the AQI buffer
   * and PM2.5 buffer when activating or deactivating.
   * @param event - click button event
   * @param currentSensor - sensor for which to toggle isActive status
   *
   * @remarks
   * Note that when a sensor is activated or deactivated, we do not change it in
   * our PurpleAir group: 490. We will still get data from PurpleAir in our API
   * call, but the resulting data will not be used anywhere.
   */
    function toggleActiveSensorStatus(
      event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
      currentSensor: Sensor,
    ) {
      event.preventDefault();
    
      if (isAdmin) {
        // Value from bufferStatus enum in backend
        const bufferDoesNotExist = 2;
    
        // Toggle the isActive and remove the buffers
        firestore
          .collection('sensors')
          .doc(currentSensor.docId)
          .update({
            isActive: !currentSensor.isActive,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
            aqiBufferStatus: bufferDoesNotExist,
            aqiBuffer: firebase.firestore.FieldValue.delete(),
            aqiBufferIndex: firebase.firestore.FieldValue.delete(),
            pm25BufferStatus: bufferDoesNotExist,
            pm25Buffer: firebase.firestore.FieldValue.delete(),
            pm25BufferIndex: firebase.firestore.FieldValue.delete(),
          })
          .catch(() => {
            setError(
              t('sensors.changeActiveSensorError') + currentSensor.name ??
                currentSensor.purpleAirId
            );
          });
      }
  }

  const popoverMessage =
    (sensor.isActive
      ? t('sensors.confirmDeactivate')
      : t('sensors.confirmActivate')) + sensor.name;
  const popoverNote = sensor.isActive
    ? t('sensors.deactivateNote')
    : t('sensors.activateNote');

  return (
    <Popover>
      <PopoverTrigger>
        <Button colorScheme={sensor.isActive ? 'red' : 'green'} width="full">
          {sensor.isActive ? t('sensors.deactivate') : t('sensors.activate')}
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverHeader>
          <Heading fontSize="medium">{t('common:confirm')}</Heading>
        </PopoverHeader>
        <PopoverBody>
          <Text>{popoverMessage}</Text>
          <Divider marginY={1} />
          <Text marginBottom={1}>{popoverNote}</Text>
          <Center>
            <Button
              paddingY={2}
              colorScheme={sensor.isActive ? 'red' : 'green'}
              onClick={event => toggleActiveSensorStatus(event, sensor)}
            >
              {t('common:confirm')}
            </Button>
          </Center>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export {ToggleActiveSensorPopover};