import React from 'react';
import {Box, Heading, Tbody, Table, Thead, Th, Tr, Td} from '@chakra-ui/react';
import {useTranslation} from 'react-i18next';
import {numberToString, timestampToDateString} from '../Util/Util';
import {Sensor} from '../Util/Types';
import {MoreInfoHeading} from './MoreInfoHeading';
import {ToggleActiveSensorPopover} from './ToggleActivePopover';

/**
 * Interface for props for SensorTable
 * - `title` - title of the table
 * - `sensors` - sensors to be displayed in the table
 * - `setError` - error state setter for the page
 * - `activateHeading` - heading for the activate/deactivate button column
 */
interface SensorTableProps {
  title: string;
  sensors: Array<Sensor>;
  setError: React.Dispatch<React.SetStateAction<string>>;
  activateHeading: string;
}

/**
 * Table of sensors. Includes a heading for the table and a message to describe
 * what active/inactive means.
 */
const SensorTable: ({
  title,
  sensors,
  setError,
  activateHeading,
}: SensorTableProps) => JSX.Element = ({
  title,
  sensors,
  setError,
  activateHeading,
}: SensorTableProps) => {
  const {t} = useTranslation('administration');

  return (
    <Box maxWidth="100%" overflowX="auto" marginTop={3}>
      <Heading textAlign="justify" fontSize="2xl">
        <MoreInfoHeading heading={title} message={t('sensors.activeNote')} />
      </Heading>
      <Table>
        <Thead>
          <Tr>
            <Th>{t('sensors.name')}</Th>
            <Th>{t('sensors.purpleAirId')}</Th>
            <Th>{t('sensors.latitude') + ', ' + t('sensors.longitude')}</Th>
            <Th>
              <MoreInfoHeading
                heading={t('sensors.validAqiTime')}
                message={t('sensors.lastValidAqiTimeNote')}
              />
            </Th>
            <Th>
              <MoreInfoHeading
                heading={t('sensors.readingTime')}
                message={t('sensors.lastReadingTimeNote')}
              />
            </Th>
            <Th>{activateHeading}</Th>
          </Tr>
        </Thead>
        <Tbody>
          {sensors.map((sensor, id) => (
            <Tr key={id}>
              <Td>{sensor.name}</Td>
              <Td>{sensor.purpleAirId}</Td>
              <Td>
                {numberToString(sensor.latitude, t('sensors.unknown')) +
                  ', ' +
                  numberToString(sensor.longitude, t('sensors.unknown'))}
              </Td>
              <Td>
                {timestampToDateString(
                  sensor.lastValidAqiTime,
                  t('sensors.unknown')
                )}
              </Td>
              <Td>
                {timestampToDateString(
                  sensor.lastSensorReadingTime,
                  t('sensors.unknown')
                )}
              </Td>
              <Td>
                <ToggleActiveSensorPopover
                  sensor={sensor}
                  setError={setError}
                />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export {SensorTable};
