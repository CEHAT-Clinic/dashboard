// Creates the svg icon for a particular sensor given the label
// for the sensor (i.e. the current reading at that sensor)

export function createSensorIcon(aqiReading: string): H.map.Icon {
  let color = '"white"'; // initialize color
  const aqi = Number(aqiReading);
  if (aqi < 50) {
    color = '"#1B8DFF"'; // light blue
  } else if (aqi < 100) {
    color = '"#304ACC"'; // dark blue
  } else if (aqi < 150) {
    color = '"#852199"'; // purple
  } else if (aqi < 200) {
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
    ' font-size="20" font-family="Arial" >' +
    aqiReading +
    '</text>' +
    '</svg>';

  const icon = new H.map.Icon(svgMarkup);
  return icon;
}
