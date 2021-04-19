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
enum InvalidAqiError {
  InfiniteAqi,
  NotEnoughNewReadings,
  NotEnoughRecentValidReadings,
}

export {InvalidAqiError};
