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
   * Applies the NowCast PM conversion algorithm from the EPA to hourly PM readings
   * @param cleanedAverages A CleanedReadings object representing 12 hours of data,
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
    const weightFactor = Math.max(
      MINIMUM_WEIGHT_FACTOR,
      1 - scaledRateOfChange
    );

    let weightedAverageSum = 0;
    let weightSum = 0;

    for (let i = 0; i < cleanedAverages.readings.length; i++) {
      if (!Number.isNaN(cleanedAverages.readings[i])) {
        const hourScaledWeightFactor = Math.pow(weightFactor, i);
        weightedAverageSum +=
          hourScaledWeightFactor * cleanedAverages.readings[i];
        weightSum += hourScaledWeightFactor;
      }
    }

    return new this(
      cleanedAverages.latitude,
      cleanedAverages.longitude,
      weightedAverageSum / weightSum
    );
  }
}
