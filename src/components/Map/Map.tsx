import React from 'react';
import {db} from '../../firebase';
import {createIcon} from './marker_style';

class Map extends React.Component {
  mapRef = React.createRef<HTMLDivElement>();

  //state contains the instance of the HERE map to display
  state = {
    map: null as H.Map | null,
  };

  // This fires every time the page is refreshed
  componentDidMount(): void {
    const H = window.H; // H is used to make HERE API calls

    // Register our API key
    const platform = new H.service.Platform({
      apikey: String(process.env.REACT_APP_HERE_API_KEY),
    });

    const defaultLayers = platform.createDefaultLayers();

    // Create a safe map reference that is guaranteed to not be null
    const safeMapRef = this.mapRef.current ? this.mapRef.current : null;
    if (safeMapRef === null) {
      throw new Error('map reference is null');
    }

    // Create an instance of the map
    const map = new H.Map(
      safeMapRef, // Reference for Map
      defaultLayers.vector.normal.map,
      {
        zoom: 13,
        center: {lat: 33.945, lng: -118.2106}, // South Gate coordinates
        pixelRatio: window.devicePixelRatio || 1,
      }
    );

    // Add the Sensor Markers to the map
    db.collection('current-reading')
      .limit(1) // Only one doc stored in current-readings
      .get()
      .then(querySnapshot =>
        querySnapshot.forEach(
          // Get doc from query
          doc => {
            if (doc.exists) {
              // Map of sensorID to readings and properties stored in data field
              const sensorMap = doc.data().data;

              for (const sensorID in sensorMap) {
                const sensorVal = sensorMap[sensorID];
                // The label for this sensor is the most recent hour average
                // We strip to round to the ones place
                const label = sensorVal.readings[0].toString().split('.')[0];
                const icon = createIcon(label);

                // Create marker
                const marker = new H.map.Marker(
                  {
                    lat: sensorVal.latitude,
                    lng: sensorVal.longitude,
                  },
                  {icon: icon}
                );
                // Add marker to the map
                map.addObject(marker);
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

    // Update state of React component to contain our map instead of null
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
        <div ref={this.mapRef} style={{height: '400px'}} />
      </div>
    );
  }
}

export default Map;
