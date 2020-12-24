import React from 'react';
import {firestore} from '../../firebase';
import {createSensorIcon} from './markerStyle';

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

    // If center is out of bounds
    if (!bounds.containsPoint(center)) {
      if (center.lat > bounds.getTop()) {
        center.lat = bounds.getTop(); // Move center down
      } else if (center.lat < bounds.getBottom()) {
        center.lat = bounds.getBottom(); // Move center up
      }
      if (center.lng < bounds.getLeft()) {
        center.lng = bounds.getLeft(); // Move center right
      } else if (center.lng > bounds.getRight()) {
        center.lng = bounds.getRight(); // Move center left
      }
      map.setCenter(center);
    }
  });
}

/**
 * Generates a HERE map centered around South Gate with restricted movement
 * and markers for each of the sensors in the database
 */
class Map extends React.Component {
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
      apikey: String(process.env.REACT_APP_HERE_API_KEY), // eslint-disable-line spellcheck/spell-checker
    });

    const defaultLayers = platform.createDefaultLayers();
    const minZoom = 13; // Restricts zoom out to >= minZoom
    const maxZoom = 16; // Restricts zoom in to <= maxZoom
    defaultLayers.vector.normal.map.setMin(minZoom); // Restrict minimum zoom
    defaultLayers.vector.normal.map.setMax(maxZoom); // Restrict maximum zoom

    // Create a safe map reference (if it is null, throw an error)
    const safeMapRef = this.mapRef.current ? this.mapRef.current : null;
    if (safeMapRef === null) {
      throw new Error('Map reference is null');
    }

    // Create an instance of the map
    const defaultPixelRatio = 1;
    const map = new H.Map(
      safeMapRef, // Reference for Map
      defaultLayers.vector.normal.map,
      {
        zoom: minZoom,
        center: {lat: 33.957, lng: -118.2106}, // South Gate coordinates
        pixelRatio: window.devicePixelRatio || defaultPixelRatio,
      }
    );

    // Add the Sensor Markers to the map
    const docRef = firestore.collection('current-reading').doc('pm25');
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
            const icon = createSensorIcon(label);

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
    ui.getControl('mapsettings').setDisabled(true); // Remove traffic options

    // Resize map on screen resize
    window.addEventListener('resize', () => map.getViewPort().resize());

    // Restrict map movement: latitude and longitude coordinates are specific
    // to the boundaries of South Gate
    /* eslint-disable no-magic-numbers */
    const [topLat, leftLong, bottomLat, rightLong] = [
      33.974,
      -118.288,
      33.92,
      -118.165,
    ];
    /* eslint-enable no-magic-numbers */
    restrictMovement(map, topLat, leftLong, bottomLat, rightLong);

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
