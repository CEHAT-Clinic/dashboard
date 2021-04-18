import React from 'react';
import {Box, Heading, Tbody, Table, Thead, Th, Tr, Td} from '@chakra-ui/react';
import {useTranslation} from 'react-i18next';
import {numberToString, timestampToDateString} from '../Util/Util';
import {Sensor} from '../Util/Types';
import {MoreInfoHeading} from './MoreInfoHeading';

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
                heading={t('readingTime')}
                message={t('lastReadingTimeNote')}
              />
            </Th>
            <Th>
              <MoreInfoHeading
                heading={t('readingTime')}
                message={t('lastReadingTimeNote')}
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
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export {SensorTable};
