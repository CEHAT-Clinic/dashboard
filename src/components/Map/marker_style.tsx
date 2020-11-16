// Creates the svg icon for a particular sensor given the label
// for the sensor (i.e. the current reading at that sensor)

export function createIcon(label: string): H.map.Icon {
  //svg Marker Image
  const svgMarkup =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0' +
    ' 0 24 24" fill="black" width="60px" height="60px"><path d="M0 0h24v' +
    '24H0z" fill="none"/><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7' +
    ' 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1' +
    '.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/><text x="12"' +
    ' y="18" font-size="4pt" font-family="Arial" font-weight="bold" ' +
    'text-anchor="middle" fill="white">' +
    label +
    '</text></svg>';

  const icon = new H.map.Icon(svgMarkup);
  return icon;
}
