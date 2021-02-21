import React from 'react';
import {
  Box,
  Heading,
  Text,
  Link,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from '@chakra-ui/react';

const Health: React.FC = () => {
  return (
    <Box padding={8}>
      <Heading textAlign="center">What is AQI?</Heading>
      <Text>Insert text here describing AQI</Text>
      <Box
        padding={8}
        margin={8}
        borderWidth={1}
        borderRadius={8}
        boxShadow="lg"
        textAlign="center"
      >
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Level of Concern</Th>
              <Th>AQI Range</Th>
              <Th>What This Means</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr bg="#08E400">
              <Td>Good</Td>
              <Td>0 to 50</Td>
              <Td>
                Air quality is satisfactory, and air pollution poses little or
                no risk.
              </Td>
            </Tr>
            <Tr bg="#FEFF00">
              <Td>Moderate</Td>
              <Td>51 to 100</Td>
              <Td>
                Air quality is acceptable. However, there may be a risk for some
                people, particularly those who are unusually sensitive to air
                pollution.
              </Td>
            </Tr>
            <Tr bg="#FF7E02" textColor="white">
              <Td>Unhealthy For Sensitive Groups</Td>
              <Td>101 to 150</Td>
              <Td>
                Members of sensitive groups may experience health effects. The
                general public is less likely to be affected.
              </Td>
            </Tr>
            <Tr bg="#FF0202" textColor="white">
              <Td>Unhealthy</Td>
              <Td>151 to 200</Td>
              <Td>
                Some members of the general public may experience health
                effects; members of sensitive groups may experience more serious
                health effects.
              </Td>
            </Tr>
            <Tr bg="#8F3F97" textColor="white">
              <Td>Very Unhealthy</Td>
              <Td>201 to 300</Td>
              <Td>
                Health alert: The risk of health effects is increased for
                everyone.
              </Td>
            </Tr>
            <Tr bg="#7E0224" textColor="white">
              <Td>Hazardous</Td>
              <Td>301+</Td>
              <Td>
                Health warning of emergency conditions: everyone is more likely
                to be affected.
              </Td>
            </Tr>
          </Tbody>
        </Table>
        <Text>
          This table is adapted from the EPA air quality website. For even more
          information, you can visit the{' '}
          <Link color="#32bfd1" href="https://www.airnow.gov/aqi/aqi-basics/">
            Airnow website
          </Link>
        </Text>
      </Box>
      <Heading textAlign="center">
        What Are The Health Effects of Poor Air Quality
      </Heading>
      <Text>Insert more helpful information here</Text>
      <Heading textAlign="center">How To Respond To Poor Air Quality</Heading>
      <Text>Insert even more helpful information here</Text>
    </Box>
  );
};

export default Health;
