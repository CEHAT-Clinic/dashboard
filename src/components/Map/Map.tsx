import React from 'react';
import {db} from '../../firebase';

// Map Style
const mapStyle = {
  height: '400px',
};

class Map extends React.Component {
  mapRef = React.createRef<HTMLDivElement>(); // reference for div element

  state = {
    map: null as H.Map,
  };

  // This fires every time the page is refreshed
  componentDidMount(): void {
    console.log('Firing component did mount');

    const H = window.H; // H is used to make HERE API calls

    // register our API key
    const platform = new H.service.Platform({
      apikey: process.env.REACT_APP_HERE_API_KEY,
    });

    const defaultLayers = platform.createDefaultLayers();

    // Create an instance of the map
    const map = new H.Map(
      this.mapRef.current, // Reference for Map
      defaultLayers.vector.normal.map,
      {
        zoom: 13,
        center: {lat: 33.945, lng: -118.2106}, // South Gate coordinates
        pixelRatio: window.devicePixelRatio || 1,
      }
    );

    // Creates the svg icon for a particular sensor given the label
    // for the sensor (i.e. the current reading at that sensor)
    function createIcon(label: string) {
      //svg Marker Image (TODO: replace with better svg image)
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

    // Add the Sensor Markers to the map
    db.collection('current-reading')
      .limit(1) // Only one doc stored in current-readings
      .get()
      .then(querySnapshot =>
        querySnapshot.forEach(
          // get doc from query
          doc => {
            if (doc.exists) {
              // Map of sensorID to readings and properties stored in data field
              const sensorMap = doc.data().data;

              for (const sensorID in sensorMap) {
                const sensorVal = sensorMap[sensorID];
                // create label and icon for this marker
                const label: string = String(sensorVal.readings[0]).split(
                  '.'
                )[0];
                const icon = createIcon(label);

                // add marker to map:
                map.addObject(
                  new H.map.Marker(
                    {
                      lat: sensorVal.latitude,
                      lng: sensorVal.longitude,
                    },
                    {icon: icon}
                  )
                );
              }
            } else {
              // If doc.data() is undefined
              console.log('Error: current readings doc not found');
            }
          }
        )
      )
      .catch(error => {
        console.log('Error getting document:', error);
      });

    // Create the default UI which allows for zooming
    new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
    H.ui.UI.createDefault(map, defaultLayers);

    // Resize map on screen resize
    window.addEventListener('resize', () => map.getViewPort().resize());

    this.setState({map});
  }

  componentWillUnmount(): void {
    // Cleanup state
    if (this.state.map !== null) {
      this.state.map.dispose();
    }
  }

  render(): JSX.Element {
    return (
      <div>
        <div ref={this.mapRef} style={mapStyle} />
      </div>
    );
  }
}

export default Map;
