/**
 * Get the readings subcollection path from a sensor's doc ID
 * @param docId - document ID of the sensor in the sensors collection
 * @returns the path to the readings subcollection for a sensor
 *
 */
const readingsSubcollection: (docId: string) => string = (docId: string) =>
  `/sensors/${docId}/readings`;


/**
 * Errors that can occur with a sensor. All error types except `ReadingNotReceived`
 * result in a sensor being invalid.
 * - `ReadingNotRecieved` - In the most recent recent call to PurpleAir, no
 *   reading was received for this sensor.
 * - `NoHumidityReading` - No humidity reading was received for a sensor that
 *   had a reading from PurpleAir. For this error, `IncompleteSensorReading` is
 *   also true.
 * - `ChannelsDiverged` - Channel A and Channel B of a PurpleAir sensor have
 *   diverged enough that the sensor values are not used. We determine if the
 *   channels have diverged by calculating the mean percent difference between
 *   the readings for the channels from the confidence value from PurpleAir.
 * - `SensorDowngraded` - If PurpleAir has downgraded Channel A, Channel B, or
 *   both channels of a sensor.
 * - `InfiniteAqi`- If the calculated AQI for a sensor is infinite.
 * - `NotEnoughNewReadings` - If not enough new readings were received for a
 *   sensor in the last 3 hours. Two of the three most recent hours must have at
 *   least 23 new and valid readings. A reading is not valid if the mean percent
 *   difference between Channel A and Channel B is larger than 0.7, the threshold
 *   recommended by the EPA for PurpleAir sensors.
 * - `NotEnoughValidReadings` - If not enough valid readings were received for a
 *   sensor in the last 3 hours. A reading is not valid if the mean percent
 *   difference between Channel A and Channel B is larger than 0.7, the threshold
 *   recommended by the EPA for PurpleAir sensors.
 */
enum SensorErrors {
ReadingNotReceived,
NoHumidityReading,
IncompleteSensorReading,
ChannelsDiverged,
SensorDowngraded,
InfiniteAqi,
NotEnoughNewReadings,
NotEnoughValidReadings
}

export {readingsSubcollection};

export type {SensorErrors};
