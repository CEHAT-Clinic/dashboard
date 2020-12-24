import CleanedReadings from './cleaned-reading';

export default class NowCastConcentration {
  latitude: number;
  longitude: number;
  reading: number;

  constructor(latitude: number, longitude: number, reading: number) {
    this.latitude = latitude;
    this.longitude = longitude;
    this.reading = reading;
  }

  /**
   * Applies the NowCast PM2.5 conversion algorithm from the EPA to hourly PM2.5 readings
   * @param cleanedAverages - A CleanedReadings object representing 12 hours of data,
   *                        where at least two of the last three hours are valid data
   *                        points
   */
  static fromCleanedAverages(
    cleanedAverages: CleanedReadings
  ): NowCastConcentration {
    let minimum = Number.MAX_VALUE;
    let maximum = Number.MIN_VALUE;

    for (const reading of cleanedAverages.readings) {
      if (!Number.isNaN(reading)) {
        minimum = Math.min(minimum, reading);
        maximum = Math.max(maximum, reading);
      }
    }

    const scaledRateOfChange = (maximum - minimum) / maximum;
    const MINIMUM_WEIGHT_FACTOR = 0.5;
    // Base weight factor to apply to each hour's reading
    // which will be raised to the power of the number of hours
    // ago the measurement is from, reducing the weight of later hours
    /* eslint-disable no-magic-numbers */
    const weightFactor = Math.max(
      MINIMUM_WEIGHT_FACTOR,
      1 - scaledRateOfChange // eslint-disable-line no-magic-numbers
    );
    /* eslint-enable no-magic-numbers */

    let weightedAverageSum = 0;
    let weightSum = 0;
    let currentHourWeight = 1;
    // Most recent hour has index 0, older readings have larger indices
    // Formula from the EPA at
    // https://www.airnow.gov/faqs/how-nowcast-algorithm-used-report/
    for (let i = 0; i < cleanedAverages.readings.length; i++) {
      if (!Number.isNaN(cleanedAverages.readings[i])) {
        weightedAverageSum += currentHourWeight * cleanedAverages.readings[i];
        weightSum += currentHourWeight;

        // Implement power function without recalculating each iteration
        currentHourWeight *= weightFactor;
      }
    }

    return new this(
      cleanedAverages.latitude,
      cleanedAverages.longitude,
      weightedAverageSum / weightSum
    );
  }
}
