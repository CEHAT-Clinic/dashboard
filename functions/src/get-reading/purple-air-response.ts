import axios, {AxiosResponse} from 'axios';
import {config} from '../admin';
import {PurpleAirReading} from './types';
import {getMeanPercentDifference} from './util';
import {
  getDefaultSensorReadingErrors,
  SensorReadingErrors,
} from './sensor-errors';

/**
 * Make the PurpleAir API to using the group query
 * @returns PurpleAir API response
 */
async function fetchPurpleAirResponse(): Promise<AxiosResponse> {
  // The Group ID for the CEHAT's sensors is 490
  const purpleAirGroupApiUrl =
    'https://api.purpleair.com/v1/groups/490/members';

  // Fetch these data fields for each sensor. Available fields are documented
  // by the PurpleAir API
  const fieldList = [
    'sensor_index',
    'name',
    'latitude',
    'longitude',
    'confidence',
    'pm2.5',
    'humidity',
    'last_seen',
    'channel_flags',
  ];

  // Only get readings from sensors that have an updated reading in the last 4 minutes
  const maxSensorAge = 240;

  // If an error is thrown, then it will be logged in Firestore
  const purpleAirResponse = await axios.get(purpleAirGroupApiUrl, {
    headers: {
      'X-API-Key': config.purpleair.read_key,
    },
    params: {
      fields: fieldList.join(),
      max_age: maxSensorAge, // eslint-disable-line camelcase
    },
  });

  return purpleAirResponse;
}

/**
 * Gets any errors for channels being downgraded in a sensor
 * @param index - index that corresponds to a flag name in the channelFlagNames
 * @param channelFlagNames - array of flag names
 * @returns array of errors that correspond to channel downgrade errors
 */
function getChannelFlag(
  index: number,
  channelFlagNames: string[]
): SensorReadingErrors[] {
  const errors: SensorReadingErrors[] = [];
  switch (channelFlagNames[index]) {
    case 'Normal':
      // No channels were downgraded, so return no errors
      break;
    case 'A-Downgraded':
      errors.push(SensorReadingErrors.ChannelADowngraded);
      break;
    case 'B-Downgraded':
      errors.push(SensorReadingErrors.ChannelBDowngraded);
      break;
    case 'A+B-Downgraded':
      errors.push(
        SensorReadingErrors.ChannelADowngraded,
        SensorReadingErrors.ChannelBDowngraded
      );
      break;
    default:
      // Unknown value, ignore
      break;
  }
  return errors;
}

/**
 * Converts a PurpleAir reading returned from the group API query into a PurpleAirReading
 * @param data - list of data from PurpleAir for a given sensor
 * @param fieldNames - list of field names from PurpleAir that match the order of the data fields
 * @param channelFlagNames - list of channel flag names from PurpleAir that correspond to an index in the sensor reading's data
 * @returns
 */
function getReading(
  data: (string | number)[],
  fieldNames: string[],
  channelFlagNames: string[]
): [number, [PurpleAirReading | null, boolean[]]] {
  // Initialize all values
  let id: number = Number.NaN;
  let name: string | undefined = undefined;
  let latitude: number | undefined = undefined;
  let longitude: number | undefined = undefined;
  let meanPercentDifference: number | undefined = undefined;
  let pm25: number | undefined = undefined;
  let humidity: number | undefined = undefined;
  let timestamp: Date | undefined = undefined;

  // Initialize the error array
  const sensorErrors: boolean[] = getDefaultSensorReadingErrors();

  data.forEach((value, index) => {
    // Check the corresponding field name to determine how to handle the value
    switch (fieldNames[index]) {
      case 'sensor_index':
        if (typeof value === 'number') id = value;
        break;
      case 'name':
        if (typeof value === 'string') name = value;
        break;
      case 'latitude': {
        if (typeof value === 'number') latitude = value;
        break;
      }
      case 'longitude':
        if (typeof value === 'number') longitude = value;
        break;
      case 'confidence':
        if (typeof value === 'number') {
          meanPercentDifference = getMeanPercentDifference(value);
        }
        break;
      case 'pm2.5':
        if (typeof value === 'number') pm25 = value;
        break;
      case 'humidity':
        if (typeof value === 'number') humidity = value;
        break;
      case 'last_seen':
        if (typeof value === 'number') {
          // PurpleAir returns seconds since EPOCH, but the Date constructor
          // takes milliseconds, so we convert from seconds to milliseconds
          timestamp = new Date(value * 1000); // eslint-disable-line no-magic-numbers
        }
        break;
      case 'channel_flags':
        if (typeof value === 'number') {
          const channelDownErrors = getChannelFlag(value, channelFlagNames);

          // Add the channel down errors to the overall sensor errors
          channelDownErrors.forEach(error => (sensorErrors[error] = true));
        }
        break;
      default:
        // Unknown field, ignore
        break;
    }
  });

  // Only return a PurpleAirReading if all fields are defined
  if (
    id &&
    name &&
    latitude !== undefined && // Can be zero
    longitude !== undefined && // Can be zero
    meanPercentDifference !== undefined && // Can be zero
    pm25 !== undefined && // Can be zero
    humidity !== undefined && // Can be zero
    timestamp
  ) {
    const reading: PurpleAirReading = {
      id: id,
      name: name,
      latitude: latitude,
      longitude: longitude,
      meanPercentDifference: meanPercentDifference,
      pm25: pm25,
      humidity: humidity,
      timestamp: timestamp,
    };

    /**
     * Sometimes PurpleAir will give a non-zero confidence value when a sensor
     * has a channel downgraded. This is not the behavior we want because we
     * need both channels' readings to be able to determine if we want to use
     * that reading in our AQI calculation since we want to be able to know how
     * confident we can be that a sensor reading is true and not an outlier.
     * Thus, if either channel of a sensor is downgraded, we set the
     * meanPercentDifference to the maximum value of 2.
     */
    if (
      sensorErrors[SensorReadingErrors.ChannelADowngraded] ||
      sensorErrors[SensorReadingErrors.ChannelADowngraded]
    ) {
      const maxPercentDifference = 2;
      meanPercentDifference = maxPercentDifference;
    }

    // If the mean percent difference is higher than the EPA threshold of 0.7,
    // then we signal that the most recent sensor reading's channels had diverged.
    const percentDifferenceThreshold = 0.7;
    if (meanPercentDifference > percentDifferenceThreshold) {
      sensorErrors[SensorReadingErrors.ChannelsDiverged] = true;
    }

    return [id, [reading, sensorErrors]];
  } else {
    if (humidity === undefined) {
      sensorErrors[SensorReadingErrors.NoHumidityReading] = true;
    }

    // If some field was undefined, then the sensor reading was incomplete
    sensorErrors[SensorReadingErrors.IncompleteSensorReading] = true;

    return [id, [null, sensorErrors]];
  }
}

/**
 * Translates PurpleAir response into map of sensor ID to PurpleAirReading and an array of sensor errors.
 * @returns map of sensor ID to a tuple of a PurpleAirReading and a list of sensor errors. If the reading received from PurpleAir is incomplete, it is then `null`.
 */
async function getReadingsMap(): Promise<
  Map<number, [PurpleAirReading | null, boolean[]]>
> {
  const purpleAirResponse = await fetchPurpleAirResponse();
  const readings: Map<number, [PurpleAirReading | null, boolean[]]> = new Map();
  const purpleAirData = purpleAirResponse.data;
  const fieldNames: string[] = purpleAirData.fields;
  const channelFlagNames: string[] = purpleAirData.channel_flags;
  const rawReadings: (string | number)[][] = purpleAirData.data;
  rawReadings.forEach(rawReading => {
    const [id, reading] = getReading(rawReading, fieldNames, channelFlagNames);
    readings.set(id, reading);
  });
  return readings;
}

export {getReadingsMap};
