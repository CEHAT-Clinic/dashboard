/**
 * Creates the SVG icon for a particular sensor given the AQI reading
 * @param aqiReading - current AQI reading, rounded to nearest one's place
 */
export function createSensorIcon(aqiReading: string): H.map.Icon {
  /** Thresholds for AQI categories are taken
   * from https://www.purpleair.com/map. Anything above 250 is considered a
   * "Health Alert"
   */
  const satisfactory = 50; // Air quality is satisfactory for all groups
  const moderateConcern = 100; // Moderate health concern
  const sensitiveGroups = 150; // Health risk for sensitive groups
  const healthRiskForAll = 200; // Health risk for all individuals

  let color = '"white"'; // Initialize color
  const aqi = Number(aqiReading);
  if (aqi < satisfactory) {
    color = '"#1B8DFF"'; // Light blue
  } else if (aqi < moderateConcern) {
    color = '"#304ACC"'; // Dark blue
  } else if (aqi < sensitiveGroups) {
    color = '"#852199"'; // Purple
  } else if (aqi < healthRiskForAll) {
    color = '"#CC244B"'; // Pink-red
  } else {
    color = '"#FF3628"'; // Red
  }

  // SVG Marker Image
  /* eslint-disable spellcheck/spell-checker */
  const svgMarkup =
    '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40">' +
    '<circle cx="20" cy="20" r="20" fill=' +
    color +
    '/>' +
    '<text x="20" y="20" alignment-baseline="middle" text-anchor="middle"' +
    ' font-size="20" font-family="Arial">' +
    aqiReading +
    '</text></svg>';
  /* eslint-enable spellcheck/spell-checker */

  const icon = new H.map.Icon(svgMarkup);
  return icon;
}
