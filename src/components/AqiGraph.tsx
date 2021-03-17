import React from 'react';
import {Text, Box, Tag, Link, Center} from '@chakra-ui/react';
import {ScatterChart, XAxis, YAxis, Scatter} from 'recharts';

/**
 * Interface for the props of the graph
 * - `sensorDocId` is the document ID for the currents sensor in the
 *  sensors collection
 */
interface GraphProps {
  sensorDocId: string;
}

/**
 * AQI Dial Display Component
 * This component displays the dial representation of the AQI as well as the AQI
 * reading for the currently selected sensor. Additionally, there is a key below
 * the dial to label each color on the dial with how severe the health risk is.
 */
const AqiGraph: ({sensorDocId}: GraphProps) => JSX.Element = ({
  sensorDocId,
}: GraphProps) => {
  return (
    <Box>
      <Text>{sensorDocId}</Text>
      <ScatterChart width={400} height={400}>
        <XAxis dataKey="x" name="hour" unit="hrs" />
        <YAxis dataKey="y" name="AQI" unit="" />
      </ScatterChart>
    </Box>
  );
};

export default AqiGraph;
