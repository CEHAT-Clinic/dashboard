import React, {useEffect, useState} from 'react';
import {Text, Box, Button, Flex} from '@chakra-ui/react';
import {
  ScatterChart,
  XAxis,
  YAxis,
  Scatter,
  CartesianGrid,
  LineChart,
  Line,
  ResponsiveContainer,
} from 'recharts';
import firebase, {firestore} from '../../firebase';

/**
 * Enumeration for the status of a buffer. If a buffer is 'InProgress', it is
 * currently being initialized, so we don't start to initialize it again. This
 * is necessary because initializing the entire buffer can take non-negligible
 * time, so we may initialize a buffer in a cloud function and have the same
 * cloud function called again before the buffer is finished initializing. This
 * way we avoid having a buffer that begins re-initializing indefinitely.
 */
enum bufferStatus {
  Exists,
  InProgress,
  DoesNotExist,
}

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
 * AQI Dial Display Component
 * This component displays the dial representation of the AQI as well as the AQI
 * reading for the currently selected sensor. Additionally, there is a key below
 * the dial to label each color on the dial with how severe the health risk is.
 */
const AqiGraphLine: ({sensorDocId}: GraphProps) => JSX.Element = ({
  sensorDocId,
}: GraphProps) => {
  // Const [data, setData] = useState<GraphData>({
  //   good: [],
  //   moderate: [],
  //   sensitive: [],
  //   unhealthy: [],
  //   veryUnhealthy: [],
  //   hazardous: [],
  // });
  const [data, setData] = useState<GraphElement[]>([]);
  const [displayGraph, setDisplayGraph] = useState(false);
  const [yAxisLimit, setYAxisLimit] = useState(0);

  useEffect(() => {
    // Get last 24 hours AQI buffer from sensor doc
    if (sensorDocId) {
      const docRef = firestore.collection('sensors').doc(sensorDocId);
      const good = 50; // Air quality is good (0-50)
      const moderate = 100; // Air quality is acceptable (51-100)
      const sensitiveGroups = 150; // Health risk for sensitive groups (101-150)
      const unhealthy = 200; // Health risk for all individuals (151-200)
      const veryUnhealthy = 300; // Very unhealthy for all individuals (201-300)

      // GET DATA FOR GRAPHING
      docRef.get().then(doc => {
        if (doc.exists) {
          const data = doc.data();
          if (data) {
            const aqiBuffer: Array<AqiBufferElement> = data.aqiBuffer ?? [];
            const aqiBufferIndex: number = data.aqiBufferIndex ?? 0;
            const allData: Array<GraphElement> = [];

            // TODO: fix this for wrapping
            const currentDate = new Date();
            const currentDay = currentDate.getDay();
            const currentHour =
              currentDate.getHours() + currentDate.getMinutes() / 60;
            let maxAqi = 0;
            for (let i = 0; i < aqiBuffer.length; i++) {
              const index = (aqiBufferIndex + i) % aqiBuffer.length;
              const element = aqiBuffer[index];
              if (element.timestamp) {
                const date = element.timestamp.toDate();
                const hour = date.getHours() + date.getMinutes() / 60;
                let hoursAgo = 0;
                // If it's today
                if (date.getDay() === currentDay) {
                  hoursAgo = currentHour - hour;
                } else {
                  // If it's yesterday
                  hoursAgo = currentHour + (24 - hour);
                }
                hoursAgo = Math.max(Math.min(hoursAgo, 24), 0);
                if (element.aqi > maxAqi) {
                  maxAqi = element.aqi;
                }
                const newElement: GraphElement = {x: hoursAgo, y: element.aqi};
                allData.push(newElement);
              }
            }
            setYAxisLimit(Math.max(maxAqi, 300));
            setData(allData);
          }
        }
      });
    }
  }, [sensorDocId]);
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
        {displayGraph ? (
          <Flex justifyContent="center" paddingY={3}>
            <ResponsiveContainer height={250} width="90%">
              <LineChart data={data}>
                <CartesianGrid
                  horizontalFill={[
                    '#7E0224',
                    '#8F3F97',
                    '#FF0202',
                    '#FF7E02',
                    '#FEFF00',
                    '#08E400',
                  ]}
                  fillOpacity={0.2}
                />
                <XAxis
                  type="number"
                  dataKey="x"
                  label={{value: 'Hours Ago', position: 'Bottom', dy: 15}}
                  height={40}
                  name="Hours Ago"
                  ticks={[0, 6, 12, 18, 24]}
                  reversed={true}
                  padding={{left: 4, right: 4}}
                  interval={0}
                  domain={[0, 24]}
                />
                <YAxis
                  dataKey="y"
                  name="AQI"
                  unit=""
                  label={{value: 'AQI', position: 'Right', dx: -20, rotate: 0}}
                  ticks={[0, 50, 100, 150, 200, 300, 320]}
                  interval={0}
                  range={[0, yAxisLimit + 10]}
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
        ) : (
          <></>
        )}
      </Box>
    );
  } else {
    return (
      <Box marginTop={10}>
        <Text> Select a sensor to see its data </Text>
      </Box>
    );
  }
};

export default AqiGraphLine;
