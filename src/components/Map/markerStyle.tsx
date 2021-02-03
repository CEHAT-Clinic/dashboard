/**
 * Creates the SVG icon for a particular sensor given the AQI reading
 * @param aqiReading - current AQI reading, rounded to nearest one's place
 * @param size - size of marker ('small' if normal, 'large' if hovered)
 */
export function createSensorIcon(aqiReading: string, size: string): H.map.Icon {
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
    color = '"#4765f5"'; // Dark blue
  } else if (aqi < sensitiveGroups) {
    color = '"#9247a1"'; // Purple
  } else if (aqi < healthRiskForAll) {
    color = '"#cc2475"'; // Pink-red
  } else {
    color = '"#FF3628"'; // Red
  }

  // Set marker size
  const normalMarkerSize = 20;
  const hoverMarkerSize = 22;
  const ms = size === 'small' ? normalMarkerSize : hoverMarkerSize;

  // SVG Marker Image
  /* eslint-disable spellcheck/spell-checker */
  const svgMarkup =
    '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80">' +
    '<circle stroke="black" stroke-width="0.5" cx="40" cy="40" r="' +
    ms +
    '" fill=' +
    color +
    '/>' +
    '<text x="50%" y="50%" dominant-baseline="central" text-anchor="middle"' +
    ' font-size="' +
    ms +
    '" font-family="DroidSerif">' +
    aqiReading +
    '</text></svg>';
  /* eslint-enable spellcheck/spell-checker */

  const icon = new H.map.Icon(svgMarkup);
  return icon;
}
