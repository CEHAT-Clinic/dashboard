export default class CleanedReadings {
  latitude: number;
  longitude: number;
  readings: number[];

  constructor(latitude: number, longitude: number, readings: number[]) {
    this.latitude = latitude;
    this.longitude = longitude;
    this.readings = readings;
  }
}
