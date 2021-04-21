import React from 'react';
import {firestore} from '../../firebase/firebase';
import {createSensorIcon} from './markerStyle';
import {Box} from '@chakra-ui/react';
import {ColorScheme} from '../Util/Colors';
import {SelectedSensor} from '../../util';

/**
 * Interface for the props of the Map component
 * The updateCurrentSensor function allows the Home screen to display
 * information about a sensor when it is selected.
 */
interface MapProps {
  updateSelectedSensor: (selectedSensor: SelectedSensor) => void;
  isMobile: boolean;
  currentColorScheme: ColorScheme;
}

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
class Map extends React.Component<MapProps> {
  mapRef = React.createRef<HTMLDivElement>();

  state = {
    map: null as H.Map | null, // Instance of the HERE map to display
    selectedSensor: null as H.map.Marker | null, // Selected marker
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
        center: {lat: 33.957, lng: -118.2}, // South Gate coordinates
        pixelRatio: window.devicePixelRatio || defaultPixelRatio,
      }
    );

    /**
     * Registers when a marker is selected on the map. This function updates
     * the current sensor (stored in the state of the Home page) to be
     * displayed in the sensor box on the home page.
     *
     * Additionally, this function changes the styling of the selected marker and
     * undoes the styling of the previously selected marker.
     * @param evt - tap event
     */
    const registerClick = (evt: H.util.Event) => {
      const prevSensor: H.map.Marker | null = this.state.selectedSensor;
      const newSensor: H.map.Marker = evt.target;
      // Update sensor icons only if we are selecting a different sensor
      if (prevSensor !== newSensor) {
        // Update state of home to display selected sensor
        const data = newSensor.getData();
        const selectedSensor: SelectedSensor = {
          purpleAirId: data.purpleAirId,
          sensorDocId: data.sensorDocId,
          name: data.name,
          aqi: data.aqi,
          isValid: data.isValid,
          lastValidAqiTime: data.lastValidAqiTime,
        };
        this.props.updateSelectedSensor(selectedSensor);

        // Update icon of currently selected sensor
        const newIcon = createSensorIcon(
          newSensor.getData().aqi,
          false,
          true,
          this.props.currentColorScheme,
          newSensor.getData().isValid
        );
        newSensor.setIcon(newIcon);

        // Update icon of previously selected sensor
        if (prevSensor !== null) {
          const prevIcon = createSensorIcon(
            prevSensor.getData().aqi,
            false,
            false,
            this.props.currentColorScheme,
            prevSensor.getData().isValid
          );
          prevSensor.setIcon(prevIcon);
        }

        // Update the state of the selected Sensor
        this.setState({selectedSensor: newSensor});
      }
    };

    /**
     * Registers when a cursor enters a marker (cursor is hovered over marker).
     * This function enlarges the marker from the standard size to a
     * larger, hover size
     * @param evt - pointerenter event
     */
    const registerHoverStart = (evt: H.util.Event) => {
      const marker: H.map.Marker = evt.target;
      if (marker !== this.state.selectedSensor) {
        const icon = createSensorIcon(
          evt.target.getData().aqi,
          true,
          false,
          this.props.currentColorScheme,
          evt.target.getData().isValid
        );
        marker.setIcon(icon);
      }
    };

    /**
     * Registers when a cursor leaves a marker (no longer hovered over marker).
     * This function changes the enlarged marker to go back to the standard size
     * @param evt - pointerleave event
     */
    const registerHoverEnd = (evt: H.util.Event) => {
      const marker: H.map.Marker = evt.target;
      if (marker !== this.state.selectedSensor) {
        const icon = createSensorIcon(
          marker.getData().aqi,
          false,
          false,
          this.props.currentColorScheme,
          marker.getData().isValid
        );
        marker.setIcon(icon);
      }
    };

    /**
     * This function is called after all the markers have been placed on the map.
     * It uses the `updateSelectedSensor` function from the props to set a default
     * starting sensor for the home page to display.
     */
    const setDefaultSensor = () => {
      // By default, select a sensor to display:
      if (map) {
        const markers = map.getObjects();
        // If there is an object in the list
        if (markers.length > 0) {
          const firstSensor = markers[0];
          if (firstSensor instanceof H.map.Marker) {
            const data = firstSensor.getData();
            const selectedSensor: SelectedSensor = {
              purpleAirId: data.purpleAirId,
              sensorDocId: data.sensorDocId,
              name: data.name,
              aqi: data.aqi,
              isValid: data.isValid,
              lastValidAqiTime: data.lastValidAqiTime,
            };
            this.props.updateSelectedSensor(selectedSensor);
          }
        }
      }
    };

    // Add the Sensor Markers to the map
    const docRef = firestore.collection('current-reading').doc('sensors');
    docRef
      .get()
      .then(doc => {
        if (doc.exists) {
          const data = doc.data();
          if (data) {
            // Map of sensorID to readings and properties stored in data field
            const sensorMap = data.data;

            for (const sensorID in sensorMap) {
              const sensorVal = sensorMap[sensorID];
              // Default values for invalid sensors
              let aqi = '';
              let icon = createSensorIcon(
                aqi,
                false,
                false,
                this.props.currentColorScheme,
                false
              );
              const sensorDocId: string = sensorVal.readingDocId;
              if (sensorVal.isValid) {
                // The label for this sensor is the most recent hour average
                // We strip to round to the ones place
                aqi = sensorVal.aqi.toString().split('.')[0];
                icon = createSensorIcon(
                  aqi,
                  false,
                  false,
                  this.props.currentColorScheme,
                  true
                );
              }
              // Create marker
              const marker = new H.map.Marker(
                {
                  lat: sensorVal.latitude,
                  lng: sensorVal.longitude,
                },
                {icon: icon}
              );
              marker.setData({
                purpleAirId: sensorVal.purpleAirId,
                sensorDocId: sensorDocId,
                name: sensorVal.name,
                aqi: aqi,
                isValid: sensorVal.isValid,
                lastValidAqiTime: sensorVal.lastValidAqiTime,
              }); // Data for marker events
              marker.addEventListener('tap', registerClick); // Tap event
              marker.addEventListener('pointerenter', registerHoverStart); // Begin hover
              marker.addEventListener('pointerleave', registerHoverEnd); // End hover

              // Add marker to the map
              map.addObject(marker);
            }
          }
        }
      })
      .finally(setDefaultSensor);

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
    this.setState({map: map});
  }

  componentWillUnmount(): void {
    // Cleanup state
    if (this.state.map !== null) {
      this.state.map.dispose();
    }
  }

  // Update map markers on color scheme change
  componentDidUpdate(prevProps: MapProps): void {
    if (prevProps.currentColorScheme !== this.props.currentColorScheme) {
      const markers = this.state.map?.getObjects();
      if (markers) {
        for (const marker of markers) {
          // Our only objects are markers, but we need to check for type
          if (marker instanceof H.map.Marker) {
            const icon = createSensorIcon(
              marker.getData().aqi,
              true,
              false,
              this.props.currentColorScheme,
              marker.getData().isValid
            );
            marker.setIcon(icon);
          }
        }
      }
    }
  }

  render(): JSX.Element {
    return (
      <Box height={['450px', null, '83vh', null]}>
        <Box ref={this.mapRef} style={{height: '100%'}} />
      </Box>
    );
  }
}

export default Map;
