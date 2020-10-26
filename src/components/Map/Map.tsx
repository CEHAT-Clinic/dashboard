// src/DisplayMapClass.js
import * as React from 'react';

export default class Map extends React.Component {
  mapRef = React.createRef<HTMLDivElement>();

  state = {
    // The map instance to use during cleanup
    map: null as any
  };

  componentDidMount() {

    const H = (window as any).H;        // H is used to make API calls
    const platform = new H.service.Platform({ 
        apikey: "{HERE-API-KEY}"      // default HERE credentials
        //apikey: process.env.REACT_APP_HERE_API_KEY  // our HERE credentials
    });

    const defaultLayers = platform.createDefaultLayers();

    // Create an instance of the map
    const map = new H.Map(
      this.mapRef.current,
      defaultLayers.vector.normal.map,
      {
        // This map is centered over Europe
        center: { lat: 33.9575, lng: -118.2106 },
        zoom: 2,
        pixelRatio: window.devicePixelRatio || 1
      }
    );
 
    this.setState({ map });
  }

  componentWillUnmount() {
    // Cleanup after the map to avoid memory leaks when this component exits the page
    if(this.state.map != null){
        this.state.map.dispose();
    }
  }

  render() {
    return (
      // Set a height on the map so it will display
      <div ref={this.mapRef} style={{ height: "400px", width: "400px" }} />
    );
  }
}