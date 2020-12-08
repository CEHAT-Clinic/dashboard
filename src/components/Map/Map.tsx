import React from 'react';
import {db} from '../../firebase';
import {createIcon} from './marker_style';

/**
 * This function restricts the movement of the map so that it is always
 * centered around the rectangle specified by the top and bottom latitudes
 * and the left and right longitudes
 */
function restrictMovement(
  map: H.Map,
  top: number,
  left: number,
  bottom: number,
  right: number
) {
  // Center bounds: 4 corners of rectangle that must contain the center
  const bounds = new H.geo.Rect(top, left, bottom, right);

  map.getViewModel().addEventListener('sync', () => {
    const center = map.getCenter();

    // if center is out of bounds
    if (!bounds.containsPoint(center)) {
      if (center.lat > bounds.getTop()) {
        center.lat = bounds.getTop(); // move center down
      } else if (center.lat < bounds.getBottom()) {
        center.lat = bounds.getBottom(); // move center up
      }
      if (center.lng < bounds.getLeft()) {
        center.lng = bounds.getLeft(); // move center right
      } else if (center.lng > bounds.getRight()) {
        center.lng = bounds.getRight(); // move center left
      }
      map.setCenter(center);
    }
  });
}

class Map extends React.Component {
  /**
   * Generates a HERE map centered around South Gate with restricted movement
   * and markers for each of the sensors in the database
   */
  mapRef = React.createRef<HTMLDivElement>();

  // State contains the instance of the HERE map to display
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
    const minZoom = 13; // restricts zoom out to >= minZoom
    const maxZoom = 16; // restricts zoom in to <= maxZoom
    defaultLayers.vector.normal.map.setMin(minZoom); // restrict minimum zoom
    defaultLayers.vector.normal.map.setMax(maxZoom); // restrict maximum zoom

    // Create a safe map reference (if it is null, throw an error)
    const safeMapRef = this.mapRef.current ? this.mapRef.current : null;
    if (safeMapRef === null) {
      throw new Error('Map reference is null');
    }

    // Create an instance of the map
    const map = new H.Map(
      safeMapRef, // Reference for Map
      defaultLayers.vector.normal.map,
      {
        zoom: 13,
        center: {lat: 33.957, lng: -118.2106}, // South Gate coordinates
        pixelRatio: window.devicePixelRatio || 1,
      }
    );

    // Add the Sensor Markers to the map
    const docRef = db.collection('current-reading').doc('pm25');
    docRef.get().then(doc => {
      if (doc.exists) {
        const data = doc.data();
        if (data) {
          // Map of sensorID to readings and properties stored in data field
          const sensorMap = data.data;

          for (const sensorID in sensorMap) {
            const sensorVal = sensorMap[sensorID];
            // The label for this sensor is the most recent hour average
            // We strip to round to the ones place
            const label = sensorVal.nowCastPm25.toString().split('.')[0];
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
          // If doc.data() does not exist
          throw new Error('No data in the pm25 document');
        }
      } else {
        // If doc does not exist
        throw new Error('No pm25 document in current-reading collection');
      }
    });

    // Create the default UI which allows for zooming
    new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
    const ui = H.ui.UI.createDefault(map, defaultLayers);
    ui.getControl('mapsettings').setDisabled(true); // remove traffic options

    // Resize map on screen resize
    window.addEventListener('resize', () => map.getViewPort().resize());

    //const bounds = new H.geo.Rect(33.974, -118.288, 33.92, -118.165);
    // Restrict map movement
    restrictMovement(map, 33.974, -118.288, 33.92, -118.165);

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
