import React, {useEffect, useState} from 'react';
import {Text, Box} from '@chakra-ui/react';
import {ScatterChart, XAxis, YAxis, Scatter} from 'recharts';
import firebase, {firestore} from '../firebase';

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
    veryUnhealthy:Array<GraphElement>;
    hazardous:Array<GraphElement>;
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
  const [data, setData] = useState<GraphData>({good:[], moderate:[],sensitive:[],unhealthy:[],veryUnhealthy:[],hazardous:[]});

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
            const allData: GraphData = {good:[], moderate:[],sensitive:[],unhealthy:[],veryUnhealthy:[],hazardous:[]};
            for (let i = 0; i < aqiBuffer.length; i++) {
              const element = aqiBuffer[i];
              if (element.timestamp) {
                const date = element.timestamp.toDate();
                const hours = date.getHours();
                const newElement: GraphElement = {x: hours, y: element.aqi};
                if (element.aqi <= good){
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
            setData(allData);
          }
        }
      });
    }
  }, [sensorDocId]);
  return (
    <Box>
      <Text> See Graph below </Text>
      <Text>{sensorDocId}</Text>
      <ScatterChart width={400} height={400}>
        <XAxis dataKey="x" name="hour" unit="" />
        <YAxis dataKey="y" name="AQI" unit="" />
        <Scatter name="Good" data={data.good} fill="#08E400" />
        <Scatter name="Moderate" data={data.moderate} fill="#FEFF00" />
        <Scatter name="Sensitive" data={data.sensitive} fill="#FF7E02" />
        <Scatter name="Unhealthy" data={data.unhealthy} fill="#FF0202" />
        <Scatter name="Very Unhealthy" data={data.veryUnhealthy} fill="#8F3F97" />
        <Scatter name="Hazardous" data={data.hazardous} fill="#7E0224" />
      </ScatterChart>
    </Box>
  );
};

export default AqiGraph;
