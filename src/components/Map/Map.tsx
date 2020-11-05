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

    function createIcon(label: string){
      //svg Marker Image
      var svgMarkup = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black" ' +  
      'width="60px" height="60px"><path d="M0 0h24v24H0z" fill="none"/><path ' +
      'd="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7' +
      '-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 ' +
      '2.5-2.5 2.5z"/><text x="12" y="18" font-size="4pt" ' +
      'font-family="Arial" font-weight="bold" text-anchor="middle" ' +
      'fill="white">' + label + '</text></svg>'

      var icon = new H.map.Icon(svgMarkup)
      return icon
    }


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
              // make icon for marker
              const label :string = String(sensorVal.readings[0]).split(".")[0];
              const icon = createIcon(label)

              // add marker to map:
              map.addObject(
                new H.map.Marker({
                  lat: sensorVal.latitude,
                  lng: sensorVal.longitude
                }, {icon: icon})
                //marker
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

    // THIS IS AN ATTEMPT TO GET THE ZOOM BUTTONS ON THE SCREEN
    // Create the default UI:
    const behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
    var ui = H.ui.UI.createDefault(map, defaultLayers);

    // var mapSettings = ui.getControl('mapsettings');
    // var zoom = ui.getControl('zoom');
    // var scalebar = ui.getControl('scalebar');

    // mapSettings.setAlignment('top-left');
    // zoom.setAlignment('top-left');
    // scalebar.setAlignment('top-left');
    // //ui.getControl('zoom').setDisabled(true)

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