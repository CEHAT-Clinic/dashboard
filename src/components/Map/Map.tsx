import * as React from 'react';
import { db } from "../../firebase";

export default class Map extends React.Component {
  mapRef = React.createRef<HTMLDivElement>();

  state = {
    // The map instance to use during cleanup
    map: null as any
  };



  componentDidMount() { 

    const H = (window as any).H;              // H is used to make API calls
    var platform = new H.service.Platform({ 
        apikey: process.env.REACT_APP_HERE_API_KEY, 
    });

    var defaultLayers = platform.createDefaultLayers();
    // Create an instance of the map
    var map = new H.Map(
      this.mapRef.current,                      // Reference for Map
      defaultLayers.vector.normal.map, 
      {
        zoom: 13,
        center: { lat: 33.945, lng: -118.2106 },    //South Gate
        pixelRatio: window.devicePixelRatio || 1
      }
    );

    // Add the Sensor Markers
    db.collection("current-reading")
    .limit(1) // Only one doc stored in current-readings
    .get()
    .then(
      (querySnapshot) => querySnapshot.forEach(   // get doc from query
        (doc) => {          
          if (doc.exists) {
            // Map of sensorID to readings and properties stored in data field
            const sensorMap = doc.data().data;
  
            for (const sensorID in sensorMap) {
              const sensorVal = sensorMap[sensorID];
              // add marker to map:
              map.addObject(
                new H.map.Marker({
                  lat: sensorVal.latitude,
                  lng: sensorVal.longitude
                })
              )
            }
  
          } else {
              // doc.data() will be undefined in this case
              console.log("Error: current readings doc not found");
          }
        }
      )
    ).catch((error) =>
    {
      console.log("Error getting document:", error);
    })

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
      <div>
        <div ref={this.mapRef} style={{ height: "400px", width: "800px" }}/>
      </div>
    );
  }
}