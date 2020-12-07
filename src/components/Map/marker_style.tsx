// Creates the svg icon for a particular sensor given the label
// for the sensor (i.e. the current reading at that sensor)

export function createIcon(label: string): H.map.Icon {
  let color = '"white"'; // initialize color
  const aqi = Number(label);
  if (aqi < 50) {
    color = '"#3AD03A"'; // green
  } else if (aqi < 100) {
    color = '"#F5E931"'; // yellow
  } else if (aqi < 150) {
    color = '"#F5AE31"'; // orange
  } else if (aqi < 200) {
    color = '"#F54331"'; // red
  } else {
    color = '"#A843F7"'; // purple
  }

  //svg Marker Image
  const svgMarkup =
    '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40">' +
    '<circle cx="20" cy="20" r="20" fill=' +
    color +
    '/>' +
    '<text x="20" y="20" alignment-baseline="middle" text-anchor="middle"' +
    ' font-size="20" font-family="Arial" >' +
    label +
    '</text>' +
    '</svg>';

  const icon = new H.map.Icon(svgMarkup);
  return icon;
}
