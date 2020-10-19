import React, { Component, useEffect } from 'react';
import Plot from 'react-plotly.js';
import { Helmet } from "react-helmet";

// import ScriptTag from 'react-script-tag';

class Map extends Component {
  render() {
    return (
      <div>
        <iframe width="560" height="315" src="https://www.youtube.com/embed/N1AL2EMvVy0" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
        <Helmet>
          <script src="./map_script.js"></script>
        </Helmet>
          <h1> TESTING</h1>
      </div>
    );
  }
}

export default Map