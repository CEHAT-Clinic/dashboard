/**
 * Creates the SVG icon for a particular sensor given the AQI reading
 * @param aqiReading - current AQI reading, rounded to nearest one's place
 * @param hover - boolean: is the cursor hovering over this marker?
 * @param selected - boolean: is this cursor currently selected?
 */
export function createSensorIcon(
  aqiReading: string,
  hover: boolean,
  selected: boolean
): H.map.Icon {
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
  const standardMarkerSize = 20;
  const largeMarkerSize = 22;
  const markerSize = hover || selected ? largeMarkerSize : standardMarkerSize;

  // Set marker border
  const standardMarkerBorder = 0.5;
  const largeMarkerBorder = 2;
  const markerBorder = selected ? largeMarkerBorder : standardMarkerBorder;

  // SVG Marker Image
  /* eslint-disable spellcheck/spell-checker */
  const svgMarkup =
    '<svg xmlns="http://www.w3.org/2000/svg" width="46" height="46">' +
    '<circle stroke="black" stroke-width="' +
    markerBorder +
    '" cx="23" cy="23" r="' +
    markerSize +
    '" fill=' +
    color +
    '/>' +
    '<text x="50%" y="50%" dominant-baseline="central" text-anchor="middle"' +
    ' font-size="' +
    markerSize +
    '" font-family="DroidSerif">' +
    aqiReading +
    '</text></svg>';
  /* eslint-enable spellcheck/spell-checker */

  const icon = new H.map.Icon(svgMarkup);
  return icon;
}
