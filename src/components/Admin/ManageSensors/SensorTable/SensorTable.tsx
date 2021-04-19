import React from 'react';
import {
  Box,
  Heading,
  Tbody,
  Table,
  Thead,
  Th,
  Tr,
  Td,
  VStack,
} from '@chakra-ui/react';
import {useTranslation} from 'react-i18next';
import {numberToString, timestampToDateString} from '../Util/Util';
import {Sensor} from '../Util/Types';
import {MoreInfoHeading} from './MoreInfoHeading';
import {InvalidAqiError, SensorReadingError} from '../../../../firebase/ErrorTypes';
import {ErrorTag} from './ErrorTag';

/**
 * Interface for props for SensorTable
 * - `title` - title of the table
 * - `sensors` - sensors to be displayed in the table
 */
interface SensorTableProps {
  title: string;
  sensors: Sensor[];
}

/**
 * Table of sensors. Includes a heading for the table and a message to describe
 * what active/inactive means.
 */
const SensorTable: ({title, sensors}: SensorTableProps) => JSX.Element = ({
  title,
  sensors,
}: SensorTableProps) => {
  const {t} = useTranslation('sensors');

  /**
   * Get the human readable error name and explanation
   * @param error - the error that occurred
   * @returns a tuple of the human readable error name and explanation
   */
  function getSensorReadingErrorInfo(
    error: SensorReadingError
  ): [name: string, explanation: string] {
    switch (error) {
      case SensorReadingError.ReadingNotReceived:
        return [
          t('sensorErrors.readingNotReceived.name'),
          t('sensorErrors.readingNotReceived.explanation'),
        ];
      case SensorReadingError.NoHumidityReading:
        return [
          t('sensorErrors.noHumidity.name'),
          t('sensorErrors.noHumidity.explanation'),
        ];
      case SensorReadingError.IncompleteSensorReading:
        return [
          t('sensorErrors.incompleteReading.name'),
          t('sensorErrors.incompleteReading.explanation'),
        ];
      case SensorReadingError.ChannelsDiverged:
        return [
          t('sensorErrors.channelsDiverged.name'),
          t('sensorErrors.channelsDiverged.explanation'),
        ];
      case SensorReadingError.ChannelADowngraded:
        return [
          t('sensorErrors.channelADowngraded.name'),
          t('sensorErrors.channelADowngraded.explanation'),
        ];
      case SensorReadingError.ChannelBDowngraded:
        return [
          t('sensorErrors.channelBDowngraded.name'),
          t('sensorErrors.channelBDowngraded.explanation'),
        ];
      default:
        // Unknown error
        throw new Error('Unknown SensorReadingError');
    }
  }

  /**
   * Get the error tags for all sensor errors of a sensor
   * @param sensor - the sensor to check the sensor errors of
   * @returns an array of the error tags that are true for that sensor
   */
  function getSensorErrorTags(sensor: Sensor): JSX.Element[] {
    const errorTags: JSX.Element[] = [];
    sensor.sensorReadingErrors.forEach(error => {
      const [name, explanation] = getSensorReadingErrorInfo(error);
      errorTags.push(<ErrorTag name={name} explanation={explanation} />);
    });
    return errorTags;
  }

  /**
   * Get the human readable error name and explanation
   * @param error - the error that occurred
   * @returns a tuple of the human readable error name and explanation
   */
  function getInvalidAqiErrorInfo(
    error: InvalidAqiError
  ): [name: string, explanation: string] {
    switch (error) {
      case InvalidAqiError.InfiniteAqi:
        return [
          t('aqiErrors.tooHigh.name'),
          t('aqiErrors.tooHigh.explanation'),
        ];
      case InvalidAqiError.NotEnoughNewReadings:
        return [
          t('aqiErrors.notEnoughNew.name'),
          t('aqiErrors.notEnoughNew.explanation'),
        ];
      case InvalidAqiError.NotEnoughRecentValidReadings:
        return [
          t('aqiErrors.notEnoughValid.name'),
          t('aqiErrors.notEnoughValid.explanation'),
        ];
      default:
        // Unknown error
        throw new Error('Unknown InvalidAqiError');
    }
  }

  /**
   * Get the error tags for all invalid AQI of a sensor
   * @param sensor - the sensor to check the invalid AQI errors of
   * @returns an array of the error tags that are true for that sensor
   */
  function getInvalidAqiErrorTags(sensor: Sensor): JSX.Element[] {
    const errorTags: JSX.Element[] = [];
    sensor.invalidAqiErrors.forEach(error => {
      const [name, explanation] = getInvalidAqiErrorInfo(error);
      errorTags.push(<ErrorTag name={name} explanation={explanation} />);
    });
    return errorTags;
  }

  return (
    <Box maxWidth="100%" overflowX="auto" marginTop={3}>
      <Heading textAlign="justify" fontSize="2xl">
        <MoreInfoHeading heading={title} message={t('activeNote')} />
      </Heading>
      <Table>
        <Thead>
          <Tr>
            <Th>{t('name')}</Th>
            <Th>{t('purpleAirId')}</Th>
            <Th>{t('latitude') + ', ' + t('longitude')}</Th>
            <Th>
              <MoreInfoHeading
                heading={t('validAqiTime')}
                message={t('lastValidAqiTimeNote')}
              />
            </Th>
            <Th>
              <MoreInfoHeading
                heading={t('readingTime')}
                message={t('lastReadingTimeNote')}
              />
            </Th>
            <Th>
              <MoreInfoHeading
                heading={t('sensorErrors.heading')}
                message={t('sensorErrors.explanation')}
              />
            </Th>
            <Th>
              <MoreInfoHeading
                heading={t('aqiErrors.heading')}
                message={t('aqiErrors.explanation')}
              />
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {sensors.map((sensor, id) => (
            <Tr key={id}>
              <Td>{sensor.name}</Td>
              <Td>{sensor.purpleAirId}</Td>
              <Td>
                {numberToString(sensor.latitude, t('unknown')) +
                  ', ' +
                  numberToString(sensor.longitude, t('unknown'))}
              </Td>
              <Td>
                {timestampToDateString(sensor.lastValidAqiTime, t('unknown'))}
              </Td>
              <Td>
                {timestampToDateString(
                  sensor.lastSensorReadingTime,
                  t('unknown')
                )}
              </Td>
              <Td>
                <VStack>{getSensorErrorTags(sensor)}</VStack>
              </Td>
              <Td>
                <VStack>{getInvalidAqiErrorTags(sensor)}</VStack>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export {SensorTable};
