import React, {useEffect, useState} from 'react';
import {Text, Box, Button, Flex} from '@chakra-ui/react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
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

/**
 * Interface for a coordinate pair on our graph
 */
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

/**
 * AQI Graph Display Component
 * This component displays a graph for the last 24 hours of AQI data for the
 * currently selected sensor.
 */
const AqiGraphLine: ({sensorDocId}: GraphProps) => JSX.Element = ({
  sensorDocId,
}: GraphProps) => {
  const defaultYLimit = 300;
  const minutesPerHour = 60;
  const hoursPerDay = 24;
  /* --------------- state maintenance variables ---------------  */
  const [data, setData] = useState<GraphElement[]>([]);
  const [displayGraph, setDisplayGraph] = useState(false);
  const [yAxisLimit, setYAxisLimit] = useState(defaultYLimit);
  const [yAxisTicks, setYAxisTicks] = useState<number[]>([]);
  const [horizontalFill, setHorizontalFill] = useState<string[]>([]);

  // This effect updates the data every time the user clicks on a new sensor.
  useEffect(() => {
    // Get last 24 hours AQI buffer from sensor doc
    if (sensorDocId) {
      const docRef = firestore.collection('sensors').doc(sensorDocId);

      docRef.get().then(doc => {
        if (doc.exists) {
          const data = doc.data();
          if (data) {
            const aqiBuffer: Array<AqiBufferElement> = data.aqiBuffer ?? [];
            const aqiBufferIndex: number = data.aqiBufferIndex ?? 0;
            const allData: Array<GraphElement> = [];

            // Get the local time from the user's browser
            const currentDate = new Date();
            const currentDay = currentDate.getDay();
            const currentHour =
              currentDate.getHours() +
              currentDate.getMinutes() / minutesPerHour;
            // Keep track of the highest AQI value to scale the graph
            let maxAqi = 0;
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
                allData.push(newElement);
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
      <Box>
        <Button
          paddingY={0.25}
          marginTop={0.5}
          colorScheme={'blue'}
          onClick={event => setDisplayGraph(!displayGraph)}
        >
          {displayGraph ? (
            <Text>Click to Hide Data</Text>
          ) : (
            <Text>Click to Display Data</Text>
          )}
        </Button>
        {displayGraph && (
          <Flex justifyContent="center" paddingY={3}>
            <ResponsiveContainer height={250} width="90%">
              <LineChart data={data}>
                <CartesianGrid
                  horizontalFill={horizontalFill}
                  fillOpacity={0.2}
                />
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
                <Line
                  dataKey="y"
                  type={'monotone'}
                  name="Good"
                  stroke="black"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </Flex>
        )}
      </Box>
    );
  } else {
    return (
      <Box>
        <Text marginTop={[null, null, '20%', null]} fontSize={20}>
          Select a sensor to see its data
        </Text>
      </Box>
    );
  }
};

export default AqiGraphLine;
