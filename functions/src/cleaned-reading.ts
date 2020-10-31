export default class CleanedReadings {
  latitude: string;
  longitude: string;
  readings: number[];

  constructor(latitude: string, longitude: string, readings: number[]) {
    this.latitude = latitude;
    this.longitude = longitude;
    this.readings = readings;
  }
}
