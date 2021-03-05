import {ExternalLinkIcon} from '@chakra-ui/icons';
import {
  Box,
  Text,
  Link,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from '@chakra-ui/react';
import React from 'react';
import {useTranslation} from 'react-i18next';

const AqiTable: React.FC = () => {
  const {t} = useTranslation('aqiTable');

  return (
    <Box
      padding={8}
      margin={8}
      borderWidth={1}
      borderRadius={8}
      boxShadow="lg"
      textAlign="center"
    >
      <Box overflowX="auto">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>{t('heading.level')}</Th>
              <Th>{t('heading.range')}</Th>
              <Th>{t('heading.meaning')}</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr bg="#08E400">
              <Td>{t('good.level')}</Td>
              <Td>{t('good.range')}</Td>
              <Td>{t('good.meaning')}</Td>
            </Tr>
            <Tr bg="#FEFF00">
              <Td>{t('moderate.level')}</Td>
              <Td>{t('moderate.range')}</Td>
              <Td>{t('moderate.meaning')}</Td>
            </Tr>
            <Tr bg="#FF7E02" textColor="white">
              <Td>{t('sensitive.level')}</Td>
              <Td>{t('sensitive.range')}</Td>
              <Td>{t('sensitive.meaning')}</Td>
            </Tr>
            <Tr bg="#FF0202" textColor="white">
              <Td>{t('unhealthy.level')}</Td>
              <Td>{t('unhealthy.range')}</Td>
              <Td>{t('unhealthy.meaning')}</Td>
            </Tr>
            <Tr bg="#8F3F97" textColor="white">
              <Td>{t('very.level')}</Td>
              <Td>{t('very.range')}</Td>
              <Td>{t('very.meaning')}</Td>
            </Tr>
            <Tr bg="#7E0224" textColor="white">
              <Td>{t('hazardous.level')}</Td>
              <Td>{t('hazardous.range')}</Td>
              <Td>{t('hazardous.meaning')}</Td>
            </Tr>
          </Tbody>
        </Table>
      </Box>
      <Text>
        {t('source.lead')}
        <Link color="#32bfd1" href={t('source.link')} isExternal>
          {t('source.text')}
          <ExternalLinkIcon />
        </Link>
      </Text>
    </Box>
  );
};

export default AqiTable;
