import React, {useEffect, useState} from 'react';
import {Text, Box, Flex} from '@chakra-ui/react';
import {
  ScatterChart,
  XAxis,
  YAxis,
  Scatter,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import firebase, {firestore} from '../../firebase';

/**
 * Interface for a single element in the AQI buffer
 * timestamp - when this AQI was calculated and added to the buffer
 * aqi - the current aqi value
 */
interface AqiBufferElement {
  timestamp: firebase.firestore.Timestamp | null;
  aqi: number;
}

interface GraphElement {
  x: number;
  y: number;
}

/**
 * Interface for the props of the graph
 * - `sensorDocId` is the document ID for the currents sensor in the
 *  sensors collection
 */
interface GraphProps {
  sensorDocId: string;
}

interface GraphData {
  good: Array<GraphElement>;
  moderate: Array<GraphElement>;
  sensitive: Array<GraphElement>;
  unhealthy: Array<GraphElement>;
  veryUnhealthy: Array<GraphElement>;
  hazardous: Array<GraphElement>;
}

/**
 * AQI Graph Display Component
 * This component displays a graph for the last 24 hours of AQI data for the
 * currently selected sensor.
 */
const AqiGraph: ({sensorDocId}: GraphProps) => JSX.Element = ({
  sensorDocId,
}: GraphProps) => {
  const defaultYLimit = 300;
  const hoursPerDay = 24;
  const minutesPerHour = 60;
  /* --------------- state maintenance variables ---------------  */
  const [data, setData] = useState<GraphData>({
    good: [],
    moderate: [],
    sensitive: [],
    unhealthy: [],
    veryUnhealthy: [],
    hazardous: [],
  });
  // Const [data, setData] = useState<GraphElement[]>([]);
  // const [displayGraph, setDisplayGraph] = useState(false);
  const [yAxisLimit, setYAxisLimit] = useState(0);
  const [yAxisTicks, setYAxisTicks] = useState<number[]>([]);
  const [horizontalFill, setHorizontalFill] = useState<string[]>([]);

  useEffect(() => {
    // Get last 24 hours AQI buffer from sensor doc
    if (sensorDocId) {
      const docRef = firestore.collection('sensors').doc(sensorDocId);
      const good = 50; // Air quality is good (0-50)
      const moderate = 100; // Air quality is acceptable (51-100)
      const sensitiveGroups = 150; // Health risk for sensitive groups (101-150)
      const unhealthy = 200; // Health risk for all individuals (151-200)
      const veryUnhealthy = 300; // Very unhealthy for all individuals (201-300)

      docRef.get().then(doc => {
        if (doc.exists) {
          const data = doc.data();
          if (data) {
            const aqiBuffer: Array<AqiBufferElement> = data.aqiBuffer ?? [];
            const aqiBufferIndex: number = data.aqiBufferIndex ?? 0;
            const allData: GraphData = {
              good: [],
              moderate: [],
              sensitive: [],
              unhealthy: [],
              veryUnhealthy: [],
              hazardous: [],
            };

            // Get the local time from the user's browser
            const currentDate = new Date();
            const currentDay = currentDate.getDay();
            const currentHour =
              currentDate.getHours() +
              currentDate.getMinutes() / minutesPerHour;
            let maxAqi = 0; // Keep track of the highest AQI value to scale the graph
            for (let i = 0; i < aqiBuffer.length; i++) {
              // Get the index starting at the oldest reading and wrapping
              // once we reach the end of the buffer
              const index = (aqiBufferIndex + i) % aqiBuffer.length;
              const element = aqiBuffer[index];
              if (element.timestamp) {
                const date = element.timestamp.toDate();
                const hour =
                  date.getHours() + date.getMinutes() / minutesPerHour;
                let hoursAgo = currentHour - hour;
                // If the reading is from yesterday
                if (date.getDay() !== currentDay) {
                  hoursAgo = currentHour + (hoursPerDay - hour);
                }
                // Limit range to [0,24]
                hoursAgo = Math.max(Math.min(hoursAgo, hoursPerDay), 0);
                if (element.aqi > maxAqi) {
                  maxAqi = element.aqi;
                }
                const newElement: GraphElement = {x: hoursAgo, y: element.aqi};
                // Add element to data
                if (element.aqi <= good) {
                  allData.good.push(newElement);
                } else if (element.aqi < moderate) {
                  allData.moderate.push(newElement);
                } else if (element.aqi < sensitiveGroups) {
                  allData.sensitive.push(newElement);
                } else if (element.aqi < unhealthy) {
                  allData.unhealthy.push(newElement);
                } else if (element.aqi < veryUnhealthy) {
                  allData.veryUnhealthy.push(newElement);
                } else {
                  allData.hazardous.push(newElement);
                }
              }
            }
            setYAxisLimit(Math.max(maxAqi, defaultYLimit));
            setData(allData);
          }
        }
      });
    }
  }, [sensorDocId]);

  // The graph doesn't include the hazardous category unless thee are data points
  // that fall in that category. Any time the maximum y-axis value changes, this effect
  // updates the styling for the graph accordingly
  useEffect(() => {
    if (yAxisLimit === defaultYLimit) {
      // Don't include hazardous color and extra grid line
      /* eslint-disable-next-line no-magic-numbers */
      setYAxisTicks([0, 50, 100, 150, 200, 300]);
      setHorizontalFill([
        '#8F3F97',
        '#8F3F97',
        '#FF0202',
        '#FF7E02',
        '#FEFF00',
        '#08E400',
      ]);
    } else {
      // Include hazardous color and extra grid line
      /* eslint-disable-next-line no-magic-numbers */
      setYAxisTicks([0, 50, 100, 150, 200, 300, yAxisLimit]);
      setHorizontalFill([
        '#7E0224',
        '#7E0224',
        '#8F3F97',
        '#FF0202',
        '#FF7E02',
        '#FEFF00',
        '#08E400',
      ]);
    }
  }, [yAxisLimit]);

  if (sensorDocId) {
    return (
      <Flex height="100%" width="100%" justifyContent="center" align="center">
        <ResponsiveContainer height={250} width="90%">
          <ScatterChart>
            <CartesianGrid horizontalFill={horizontalFill} fillOpacity={0.2} />
            <XAxis
              type="number"
              dataKey="x"
              label={{value: 'Hours Ago', position: 'Bottom', dy: 15}}
              height={40}
              name="Hours Ago"
              /* eslint-disable-next-line no-magic-numbers */
              ticks={[0, 6, 12, 18, 24]}
              reversed={true}
              padding={{left: 4, right: 4}}
              interval={0}
              domain={[0, hoursPerDay]}
            />
            <YAxis
              dataKey="y"
              name="AQI"
              unit=""
              label={{value: 'AQI', position: 'Right', dx: -20, rotate: 0}}
              ticks={yAxisTicks}
              interval={0}
              padding={{top: 1}}
              domain={[0, yAxisLimit]}
            />
            <Scatter name="Good" data={data.good} fill="#08E400" />
            <Scatter name="Moderate" data={data.moderate} fill="#FEFF00" />
            <Scatter name="Sensitive" data={data.sensitive} fill="#FF7E02" />
            <Scatter name="Unhealthy" data={data.unhealthy} fill="#FF0202" />
            <Scatter
              name="Very Unhealthy"
              data={data.veryUnhealthy}
              fill="#8F3F97"
            />
            <Scatter name="Hazardous" data={data.hazardous} fill="#7E0224" />
          </ScatterChart>
        </ResponsiveContainer>
      </Flex>
    );
  } else {
    return (
      <Box marginTop={[null, null, '20%', null]} fontSize={20}>
        <Text> Select a sensor to see its data </Text>
      </Box>
    );
  }
};

export default AqiGraph;
