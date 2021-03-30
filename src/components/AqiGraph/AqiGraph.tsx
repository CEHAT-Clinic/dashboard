import React, {useEffect, useState} from 'react';
import {Heading, Flex} from '@chakra-ui/react';
import {
  ScatterChart,
  XAxis,
  YAxis,
  Scatter,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import {firestore} from '../../firebase';
import {useTranslation} from 'react-i18next';
import {GraphData, GraphElement, GraphProps, AqiBufferElement} from './Util';

/**
 * AQI Graph Display Component
 * This component displays a graph for the last 24 hours of AQI data for the
 * currently selected sensor.
 */
const AqiGraph: ({sensorDocId}: GraphProps) => JSX.Element = ({
  sensorDocId,
}: GraphProps) => {
  // By default, the maximum y-axis value is 300. This is the case unless
  // a sensor value exceeds 300, in which case the y-axis goes as high as the
  // largest value
  const defaultYLimit = 300;
  const hoursPerDay = 24;
  const minutesPerHour = 60;
  /* eslint-disable-next-line no-magic-numbers */
  const hourTicks = [0, 6, 12, 18, 24];
  const good = 50; // Air quality is good (0-50)
  const moderate = 100; // Air quality is acceptable (51-100)
  const sensitiveGroups = 150; // Health risk for sensitive groups (101-150)
  const unhealthy = 200; // Health risk for all individuals (151-200)
  const veryUnhealthy = 300; // Very unhealthy for all individuals (201-300)
  /* --------------- State maintenance variables ---------------  */
  const [data, setData] = useState<GraphData>({
    good: [],
    moderate: [],
    sensitive: [],
    unhealthy: [],
    veryUnhealthy: [],
    hazardous: [],
  });
  const [yAxisLimit, setYAxisLimit] = useState(defaultYLimit);
  const [yAxisTicks, setYAxisTicks] = useState<number[]>([]);
  const [horizontalFill, setHorizontalFill] = useState<string[]>([]);

  const {t} = useTranslation(['graph', 'aqiTable']);

  useEffect(() => {
    // Get last 24 hours AQI buffer from sensor doc
    if (sensorDocId) {
      const docRef = firestore.collection('sensors').doc(sensorDocId);

      docRef.get().then(doc => {
        if (doc.exists) {
          const data = doc.data();
          if (data) {
            const aqiBuffer: Array<AqiBufferElement> = data.aqiBuffer ?? [];
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
              const element = aqiBuffer[i];
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
      setYAxisTicks([
        0,
        good,
        moderate,
        sensitiveGroups,
        unhealthy,
        veryUnhealthy,
      ]);
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
      setYAxisTicks([
        0,
        good,
        moderate,
        sensitiveGroups,
        unhealthy,
        veryUnhealthy,
        yAxisLimit,
      ]);
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

  const formatLabels = (hoursAgo: number): string => {
    const weekdays = [
      t('monday'),
      t('tuesday'),
      t('wednesday'),
      t('thursday'),
      t('friday'),
      t('saturday'),
      t('sunday'),
    ];
    const hoursPerPeriod = 12;
    const sunday = 6;
    // Get the local time from the user's browser
    const date = new Date();
    let day = date.getDay() - 1; // Subtract 1 to put in [0,6] range
    let hour = date.getHours() - hoursAgo;
    const minutes = date.getMinutes();
    // Adjust values if the label is from the previous day
    if (hour < 0) {
      if (day === 0) {
        day = sunday;
      } else {
        day -= 1;
      }
      hour = hoursPerDay + hour;
    }
    // Update AM or PM
    let period = '';
    if (hour > hoursPerPeriod) {
      hour = hour % hoursPerPeriod;
      period = ' PM';
    } else {
      period = ' AM';
    }

    // Formatting
    let minutesString = '' + minutes;
    // Convert hour 0 to 12
    if (hour === 0) {
      hour = hoursPerPeriod;
    }
    // Add leading 0 to single-digit minutes
    /* eslint-disable-next-line no-magic-numbers */
    if (minutes < 10) {
      minutesString = '0' + minutes;
    }
    return weekdays[day] + ' ' + hour + ':' + minutesString + period;
  };

  if (sensorDocId) {
    return (
      <Flex
        height="100%"
        width="100%"
        justifyContent="center"
        align="center"
        padding={1}
      >
        <ResponsiveContainer height={250} width="90%">
          <ScatterChart>
            <CartesianGrid horizontalFill={horizontalFill} fillOpacity={0.2} />
            <XAxis
              type="number"
              dataKey="x"
              height={70}
              name={t('time')}
              tick={{dy: 25, dx: -30}}
              ticks={hourTicks}
              tickFormatter={tick => formatLabels(tick)}
              angle={-40}
              reversed={true}
              padding={{left: 10, right: 10}}
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
            <Scatter
              name={t('aqiTable:good.level')}
              data={data.good}
              fill="#08E400"
            />
            <Scatter
              name={t('aqiTable:moderate.level')}
              data={data.moderate}
              fill="#FEFF00"
            />
            <Scatter
              name={t('aqiTable:sensitive.level')}
              data={data.sensitive}
              fill="#FF7E02"
            />
            <Scatter
              name={t('aqiTable:unhealthy.level')}
              data={data.unhealthy}
              fill="#FF0202"
            />
            <Scatter
              name={t('aqiTable:very.level')}
              data={data.veryUnhealthy}
              fill="#8F3F97"
            />
            <Scatter
              name={t('aqiTable:hazardous.level')}
              data={data.hazardous}
              fill="#7E0224"
            />
          </ScatterChart>
        </ResponsiveContainer>
      </Flex>
    );
  } else {
    return (
      <Flex
        height="100%"
        width="100%"
        justifyContent="center"
        align="center"
        fontSize={20}
      >
        <Heading fontSize="lg"> {t('noSensor')} </Heading>
      </Flex>
    );
  }
};

export default AqiGraph;
