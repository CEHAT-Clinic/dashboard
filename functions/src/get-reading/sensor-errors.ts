/**
 * Errors that can occur with a single sensor reading. Since these errors only
 * affect a given sensor reading, these errors can occur and a sensor can still
 * have a valid AQI if enough of the other readings are valid.
 *
 * - `ReadingNotReceived` - In the most recent recent call to PurpleAir, no
 *   reading was received for this sensor.
 * - `NoHumidityReading` - No humidity reading was received for a sensor that
 *   had a reading from PurpleAir. For this error, `IncompleteSensorReading` is
 *   also true.
 * - `IncompleteSensorReading` - Some value for a sensor reading was not received.
 * - `ChannelsDiverged` - Channel A and Channel B of a PurpleAir sensor have
 *   diverged enough that the most recent sensor reading should not be used.
 *   We determine if the channels have diverged by calculating the mean percent
 *   difference between the readings for the channels from the confidence value
 *   from PurpleAir. The EPA recommends using a maximum mean percent difference
 *   of 0.7 for valid sensor readings. `ChannelsDiverged` is also true if either
 *   channel of a sensor has been downgraded.
 * - `ChannelADowngraded` - If PurpleAir has downgraded Channel A of a sensor.
 * - `ChannelBDowngraded` - If PurpleAir has downgraded Channel B of a sensor.
 */
enum SensorReadingErrors {
  ReadingNotReceived,
  NoHumidityReading,
  IncompleteSensorReading,
  ChannelsDiverged,
  ChannelADowngraded,
  ChannelBDowngraded,
}

/**
 * Returns a default error array for sensor errors
 * @returns an array for each `SensorReadingError` with the error set to `false`.
 */
function getDefaultSensorReadingErrors(): boolean[] {
  // TypeScript does not provide a way to get the number of elements in an
  // enumeration, so this gets the number of elements using the enumeration
  // reverse mapping.
  // eslint-disable-next-line no-magic-numbers
  const sensorReadingErrorCount = Object.keys(SensorReadingErrors).length / 2;
  return new Array<boolean>(sensorReadingErrorCount).fill(false);
}

export {SensorReadingErrors, getDefaultSensorReadingErrors};
