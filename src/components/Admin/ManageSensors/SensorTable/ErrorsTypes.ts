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
 * Errors that can occur during the AQI calculation process. Any of these errors
 * will result in a sensor being invalid.
 *
 * - `InfiniteAqi`- If the calculated AQI for a sensor is infinite.
 * - `NotEnoughNewReadings` - If not enough new readings were received for a
 *   sensor in the last 3 hours. Two of the three most recent hours must have at
 *   least 23 new (and valid) readings. This error only reflects if not enough
 *   new readings are being received. This error can also occur soon after a
 *   sensor is activated if not enough new readings are stored in the PM2.5
 *   buffer yet.
 * - `NotEnoughRecentValidReadings` - If not enough valid readings were received for a
 *   sensor in the last 3 hours. A reading is not valid if the mean percent
 *   difference between Channel A and Channel B is larger than 0.7, the threshold
 *   recommended by the EPA for PurpleAir sensors.
 */
 enum InvalidAqiErrors {
  InfiniteAqi,
  NotEnoughNewReadings,
  NotEnoughRecentValidReadings,
}

export {InvalidAqiErrors, SensorReadingErrors};
