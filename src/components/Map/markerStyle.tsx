import {aqiCutoffs} from '../../util';
import {ColorScheme, InactiveSensorColor} from '../Util/Colors';

/**
 * Creates the SVG icon for a particular sensor given the AQI reading
 * @param aqiReading - current AQI reading, rounded to nearest one's place
 * @param hover - boolean: is the cursor hovering over this marker?
 * @param selected - boolean: is this cursor currently selected?
 * @param colors - the current color scheme being used
 * @param isValid - boolean: does the sensor have a valid AQI
 */
export function createSensorIcon(
  aqiReading: string,
  hover: boolean,
  selected: boolean,
  colors: ColorScheme,
  isValid: boolean
): H.map.Icon {
  let color = colors.good; // Initialize color
  if (isValid) {
    const aqi = Number(aqiReading);
    if (aqi <= aqiCutoffs.good) {
      color = colors.good;
    } else if (aqi <= aqiCutoffs.moderate) {
      color = colors.moderate;
    } else if (aqi <= aqiCutoffs.sensitive) {
      color = colors.sensitive;
    } else if (aqi <= aqiCutoffs.unhealthy) {
      color = colors.unhealthy;
    } else if (aqi <= aqiCutoffs.veryUnhealthy) {
      color = colors.veryUnhealthy;
    } else {
      color = colors.hazardous;
    }
  } else {
    color = InactiveSensorColor;
  }

  const fillColor = `"${color.backgroundColor}"`;
  const textColor = `"${color.textColor}"`;

  // Set marker size
  /* eslint-disable no-magic-numbers */
  const standardMarkerSize = isValid ? 20 : 10;
  const largeMarkerSize = isValid ? 22 : 12;
  const markerSize = hover || selected ? largeMarkerSize : standardMarkerSize;
  /* eslint-enable no-magic-numbers */

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
    fillColor +
    '/>' +
    '<text x="50%" y="50%" dominant-baseline="central" text-anchor="middle"' +
    ' font-size="' +
    markerSize +
    '" font-family="Arial" font-style="Bold" fill=' +
    textColor +
    '>' +
    aqiReading +
    '</text></svg>';
  /* eslint-enable spellcheck/spell-checker */

  const icon = new H.map.Icon(svgMarkup);
  return icon;
}
