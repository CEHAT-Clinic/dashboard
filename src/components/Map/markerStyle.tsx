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
   * from https://www.airnow.gov/aqi/aqi-basics/
   * Anything above 300 is considered "Hazardous"
   */
  const good = 50; // Air quality is good (0-50)
  const moderate = 100; // Air quality is acceptable (51-100)
  const sensitiveGroups = 150; // Health risk for sensitive groups (101-150)
  const unhealthy = 200; // Health risk for all individuals (151-200)
  const veryUnhealthy = 300; // Very unhealthy for all individuals (201-300)

  let color = '"white"'; // Initialize color
  const aqi = Number(aqiReading);
  if (aqi < good) {
    color = '"#08E400"'; // Green
  } else if (aqi < moderate) {
    color = '"#FEFF00"'; // Yellow
  } else if (aqi < sensitiveGroups) {
    color = '"#FF7E02"'; // Orange
  } else if (aqi < unhealthy) {
    color = '"#FF0202"'; // Red
  } else if (aqi < veryUnhealthy) {
    color = '"#8F3F97"'; // Purple
  } else {
    color = '"#7E0224"'; // Maroon
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
