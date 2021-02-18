import React from 'react';
import {arc} from 'd3-shape';

interface GaugeProps {
    value: number;
    min: number;
    max: number;
  }

const AQIGauge = () => {
    const backgroundArc = arc()
    .innerRadius(0.65)
    .outerRadius(1)
    .startAngle(-Math.PI / 2)
    .endAngle(Math.PI / 2)
    .cornerRadius(1)

    return(
        <div>
            <svg width="9em"
                style={{border: "1px solid pink"}}
                viewBox={[-1,-1,2,1].join("")}>
            </svg>
        </div>
    )
}

export default AQIGauge
