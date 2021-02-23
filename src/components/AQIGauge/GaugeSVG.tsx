import React from 'react';
import {arc} from 'd3-shape';
import {scaleLinear} from 'd3-scale';
import {DialProps} from './AQIDial';

const GaugeSVG: ({currentReading}: DialProps) => JSX.Element = ({
  currentReading,
}: DialProps) => {
  /* eslint-disable no-magic-numbers */
  // Arc properties
  const innerRadius = 0.65;
  const outerRadius = 1;
  const startAngle = -Math.PI / 2;
  const endAngle = Math.PI / 2;

  // AQI category cutoff values
  const good = 50; // Air quality is good (0-50)
  const moderate = 100; // Air quality is acceptable (51-100)
  const sensitive = 150; // Health risk for sensitive groups (101-150)
  const unhealthy = 200; // Health risk for all individuals (151-200)
  const veryUnhealthy = 300; // Very unhealthy for all individuals (201-300)

  // Values to display
  const min = 0;
  const max = 300;
  const aqi: number = +currentReading;
  /* eslint-enable no-magic-numbers */

  /**
   * Convert aqi reading on scale [min,max] to [0,1] scale
   * @param aqi - AQI value to convert to [0,1] scale
   * @param min - minimum value for original scale
   * @param max - maximum value for original scale
   */
  const convertToPercent = (aqi: number, min: number, max: number) => {
    let percent = 0;
    if (aqi >= min && aqi <= max) {
      percent = aqi / max;
    } else if (aqi > max) {
      percent = max;
    }
    return percent;
  };

  // Convert from percent to angle
  const convertToAngle = scaleLinear()
    .domain([0, 1]) /* eslint-disable-line no-magic-numbers */
    .range([startAngle, endAngle])
    .clamp(true);

  const arcGenerator = arc(); // Used to make arcs

  // Background Arcs
  const goodArcAngle = convertToAngle(convertToPercent(good, min, max));
  const goodArc =
    arcGenerator({
      innerRadius: innerRadius,
      outerRadius: outerRadius,
      startAngle: startAngle,
      endAngle: goodArcAngle,
    }) ?? '';
  const moderateArcAngle = convertToAngle(convertToPercent(moderate, min, max));
  const moderateArc =
    arcGenerator({
      innerRadius: innerRadius,
      outerRadius: outerRadius,
      startAngle: goodArcAngle,
      endAngle: moderateArcAngle,
    }) ?? '';
  const sensitiveArcAngle = convertToAngle(
    convertToPercent(sensitive, min, max)
  );
  const sensitiveArc =
    arcGenerator({
      innerRadius: innerRadius,
      outerRadius: outerRadius,
      startAngle: moderateArcAngle,
      endAngle: sensitiveArcAngle,
    }) ?? '';
  const unhealthyArcAngle = convertToAngle(
    convertToPercent(unhealthy, min, max)
  );
  const unhealthyArc =
    arcGenerator({
      innerRadius: innerRadius,
      outerRadius: outerRadius,
      startAngle: sensitiveArcAngle,
      endAngle: unhealthyArcAngle,
    }) ?? '';
  const veryUnhealthyArcAngle = convertToAngle(
    convertToPercent(veryUnhealthy, min, max)
  );
  const veryUnhealthyArc =
    arcGenerator({
      innerRadius: innerRadius,
      outerRadius: outerRadius,
      startAngle: unhealthyArcAngle,
      endAngle: veryUnhealthyArcAngle,
    }) ?? '';

  // Filled arc to overlay the background arcs
  const filledAngle = convertToAngle(convertToPercent(aqi, min, max));
  const filledArc =
    arcGenerator({
      innerRadius: innerRadius,
      outerRadius: outerRadius,
      startAngle: startAngle,
      endAngle: filledAngle,
    }) ?? '';

  // Assign appropriate color
  const assignColor = (aqi: number) => {
    let arcColor = 'white';
    if (aqi <= good) {
      arcColor = '#08E400';
    } else if (aqi <= moderate) {
      arcColor = '#FEFF00';
    } else if (aqi <= sensitive) {
      arcColor = '#FF7E02';
    } else if (aqi <= unhealthy) {
      arcColor = '#FF0202';
    } else if (aqi <= veryUnhealthy) {
      arcColor = '#8F3F97';
    } else {
      // Hazardous
      arcColor = '#7E0224';
    }
    return arcColor;
  };

  const needleColor = '#636360';

  return (
    <div className="svg">
      <svg height="150" width="300" viewBox={' -1.05 -1.05 2.1 1.1'}>
        <path
          d={goodArc}
          fill={assignColor(good)}
          stroke="black"
          strokeWidth={0.002}
          fillOpacity="0.3"
        />
        <path
          d={moderateArc}
          fill={assignColor(moderate)}
          stroke="black"
          strokeWidth={0.002}
          fillOpacity="0.3"
        />
        <path
          d={sensitiveArc}
          fill={assignColor(sensitive)}
          stroke="black"
          strokeWidth={0.002}
          fillOpacity="0.3"
        />
        <path
          d={unhealthyArc}
          fill={assignColor(unhealthy)}
          stroke="black"
          strokeWidth={0.002}
          fillOpacity="0.3"
        />
        <path
          d={veryUnhealthyArc}
          fill={assignColor(veryUnhealthy)}
          stroke="black"
          strokeWidth={0.002}
          fillOpacity="0.3"
        />
        <path
          d={filledArc}
          fill={assignColor(aqi)}
          stroke="black"
          strokeWidth={0.004}
        />
        <circle cx={0} cy={0} r={0.08} fill={needleColor} />
        <path
          d="M0.84 5.961e-08L0.770718 0.75L0.909282 0.75L0.84 5.961e-08Z"
          fill={needleColor}
          transform={`rotate(${
            filledAngle * (180 / Math.PI) // eslint-disable-line no-magic-numbers
          }) translate(-0.84, -0.75)`}
        />
      </svg>
    </div>
  );
};

export default GaugeSVG;
