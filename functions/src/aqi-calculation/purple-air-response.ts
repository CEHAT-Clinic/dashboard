import { AxiosResponse } from 'axios';

export default class PurpleAirResponse {
  latitude: string;
  longitude: string;
  channelAPrimaryId: string;
  channelAPrimaryKey: string;
  channelASecondaryId: string;
  channelASecondaryKey: string;
  channelBPrimaryId: string;
  channelBPrimaryKey: string;
  channelBSecondaryId: string;
  channelBSecondaryKey: string;

  constructor(response: AxiosResponse) {
    const data = response.data;

    this.latitude = data.results[0]['Lat'];
    this.longitude = data.results[0]['Lon'];

    this.channelAPrimaryId = data.results[0]['THINGSPEAK_PRIMARY_ID'];
    this.channelAPrimaryKey = data.results[0]['THINGSPEAK_PRIMARY_ID_READ_KEY'];
    this.channelASecondaryId = data.results[0]['THINGSPEAK_SECONDARY_ID'];
    this.channelASecondaryKey =
      data.results[0]['THINGSPEAK_SECONDARY_ID_READ_KEY'];
    this.channelBPrimaryId = data.results[1]['THINGSPEAK_PRIMARY_ID'];
    this.channelBPrimaryKey = data.results[1]['THINGSPEAK_PRIMARY_ID_READ_KEY'];
    this.channelBSecondaryId = data.results[1]['THINGSPEAK_SECONDARY_ID'];
    this.channelBSecondaryKey =
      data.results[1]['THINGSPEAK_SECONDARY_ID_READ_KEY'];
  }
}

/**
 * 
 * @param a - sum of psuedo averages for channel A
 * @param b - sum of psuedo averages for channel B
 * @returns confidence value
 */
function getConfidence(a: number, b: number) {
  const diff = Math.abs(a - b);
  const avg = (a + b) / 2;
  const meanPercentDiff = (diff / avg) * 100;
  const pc = Math.max(Math.round((meanPercentDiff) / 1.6) - 25, 0);
  return Math.max(100 - pc, 0);
}
