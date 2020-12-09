/**
 * Creates the SVG icon for a particular sensor given the AQI reading
 * @param aqiReading
 */
export function createSensorIcon(aqiReading: string): H.map.Icon {
  /** Thresholds for AQI categories are taken
   * from https://www.purpleair.com/map. Anything above 250 is considered a
   * "Health Alert"
   */
  const satisfactory = 50; // air quality is satisfactory for all groups
  const moderateConcern = 100; // moderate health concern
  const sensitiveGroups = 150; // health risk for sensitive groups
  const healthRiskForAll = 200; // health risk for all individuals

  let color = '"white"'; // initialize color
  const aqi = Number(aqiReading);
  if (aqi < satisfactory) {
    color = '"#1B8DFF"'; // light blue
  } else if (aqi < moderateConcern) {
    color = '"#304ACC"'; // dark blue
  } else if (aqi < sensitiveGroups) {
    color = '"#852199"'; // purple
  } else if (aqi < healthRiskForAll) {
    color = '"#CC244B"'; // pink-ish red
  } else {
    color = '"#FF3628"'; //red
  }

  //svg Marker Image
  const svgMarkup =
    '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40">' +
    '<circle cx="20" cy="20" r="20" fill=' +
    color +
    '/>' +
    '<text x="20" y="20" alignment-baseline="middle" text-anchor="middle"' +
    ' font-size="20" font-family="Arial">' +
    aqiReading +
    '</text></svg>';

  const icon = new H.map.Icon(svgMarkup);
  return icon;
}
