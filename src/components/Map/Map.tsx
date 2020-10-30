// src/DisplayMapClass.js
import * as React from 'react';
import Helmet from 'react-helmet';
import "./Map.css";

export default class Map extends React.Component {
  mapRef = React.createRef<HTMLDivElement>();

  state = {
    // The map instance to use during cleanup
    map: null as any
  };

  componentDidMount() { 

    const H = (window as any).H;        // H is used to make API calls
    var platform = new H.service.Platform({ 
        //apikey: "{HERE-API-KEY}"      // default HERE credentials
    });

    var defaultLayers = platform.createDefaultLayers();

    var sgMarker = new H.map.Marker({lat:33.9575, lng:-118.2106 }) // Marker for south gate

    // Create an instance of the map
    var map = new H.Map(
      this.mapRef.current,                  // Reference for Map
      defaultLayers.vector.normal.map, 
      {
        zoom: 2,
        // center: { lat: 52.5, lng: 13.4 },             //Europe
        // zoom: 3,
        center: { lat: 33.9575, lng: -118.2106 },    //South Gate
        pixelRatio: window.devicePixelRatio || 1
      }
    );
    //window.addEventListener('resize', () => map.getViewPort().resize());
 
    map.addObject(sgMarker);
    map.setZoom(10);

    // const test = H.ui.createDefault(map,defaultLayers);

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
      <div>
        <div ref={this.mapRef} style={{ height: "400px", width: "800px" }} className = "here-maps"/>
      </div>
    );
  }
}