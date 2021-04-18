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
import {InvalidAqiErrors, SensorReadingErrors} from '../../../../ErrorsTypes';
import {ErrorTag} from './ErrorTags';

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
    error: SensorReadingErrors
  ): [name: string, explanation: string] {
    switch (error) {
      case SensorReadingErrors.ReadingNotReceived:
        return [
          t('sensorErrors.readingNotReceived.heading'),
          t('sensorErrors.readingNotReceived.explanation'),
        ];
      case SensorReadingErrors.NoHumidityReading:
        return [
          t('sensorErrors.noHumidity.heading'),
          t('sensorErrors.noHumidity.explanation'),
        ];
      case SensorReadingErrors.IncompleteSensorReading:
        return [
          t('sensorErrors.incompleteReading.heading'),
          t('sensorErrors.incompleteReading.explanation'),
        ];
      case SensorReadingErrors.ChannelsDiverged:
        return [
          t('sensorErrors.channelsDiverged.heading'),
          t('sensorErrors.channelsDiverged.explanation'),
        ];
      case SensorReadingErrors.ChannelADowngraded:
        return [
          t('sensorErrors.channelADowngraded.heading'),
          t('sensorErrors.channelADowngraded.explanation'),
        ];
      case SensorReadingErrors.ChannelBDowngraded:
        return [
          t('sensorErrors.channelBDowngraded.heading'),
          t('sensorErrors.channelBDowngraded.explanation'),
        ];
      default:
        // Unknown error
        return ['', ''];
    }
  }

  /**
   * Get the error tags for all sensor errors of a sensor
   * @param sensor - the sensor to check the sensor errors of
   * @returns an array of the error tags that are true for that sensor
   */
  function getSensorErrorTags(sensor: Sensor): JSX.Element[] {
    const errorTags: JSX.Element[] = [];
    sensor.sensorReadingErrors.forEach((value, index) => {
      if (value) {
        const [name, explanation] = getSensorReadingErrorInfo(index);
        errorTags.push(<ErrorTag name={name} explanation={explanation} />);
      }
    });
    return errorTags;
  }

  /**
   * Get the human readable error name and explanation
   * @param error - the error that occurred
   * @returns a tuple of the human readable error name and explanation
   */
  function getInvalidAqiErrorInfo(
    error: InvalidAqiErrors
  ): [name: string, explanation: string] {
    switch (error) {
      case InvalidAqiErrors.InfiniteAqi:
        return [
          t('aqiErrors.tooHigh.heading'),
          t('aqiErrors.tooHigh.explanation'),
        ];
      case InvalidAqiErrors.NotEnoughNewReadings:
        return [
          t('aqiErrors.notEnoughNew.heading'),
          t('aqiErrors.notEnoughNew.explanation'),
        ];
      case InvalidAqiErrors.NotEnoughRecentValidReadings:
        return [
          t('aqiErrors.notEnoughValid.heading'),
          t('aqiErrors.notEnoughValid.explanation'),
        ];
      default:
        // Unknown error
        return ['', ''];
    }
  }

  /**
   * Get the error tags for all invalid AQI of a sensor
   * @param sensor - the sensor to check the invalid AQI errors of
   * @returns an array of the error tags that are true for that sensor
   */
  function getInvalidAqiErrorTags(sensor: Sensor): JSX.Element[] {
    const errorTags: JSX.Element[] = [];
    sensor.aqiCalculationErrors.forEach((value, index) => {
      if (value) {
        const [name, explanation] = getInvalidAqiErrorInfo(index);
        errorTags.push(<ErrorTag name={name} explanation={explanation} />);
      }
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
