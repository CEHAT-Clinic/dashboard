import React from 'react';
import {arc} from 'd3-shape';
import {scaleLinear} from 'd3-scale';
import {DialProps} from './AqiDial';

const GaugeSvg: ({currentAqi}: DialProps) => JSX.Element = ({
  currentAqi,
}: DialProps) => {
  /* eslint-disable no-magic-numbers */
  // Arc properties
  const innerRadius = 0.5;
  const outerRadius = 1;
  const initialAngle = -Math.PI / 2;
  const finalAngle = Math.PI / 2;

  // AQI category cutoff values
  const good = 50; // Air quality is good (0-50)
  const moderate = 100; // Air quality is acceptable (51-100)
  const sensitive = 150; // Health risk for sensitive groups (101-150)
  const unhealthy = 200; // Health risk for all individuals (151-200)
  const veryUnhealthy = 300; // Very unhealthy for all individuals (201-300)

  // Values to display
  const min = 0;
  const max = 300;
  const aqi: number = +currentAqi;
  /* eslint-enable no-magic-numbers */

  /**
   * Convert AQI reading on scale [min,max] to [0,1] scale
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
    .range([initialAngle, finalAngle])
    .clamp(true);

  const arcGenerator = arc(); // Used to make arcs

  // Draw background arcs
  const arcs: string[] = [];
  const categories = [good, moderate, sensitive, unhealthy, veryUnhealthy];
  let startAngle = initialAngle;
  for (const category of categories) {
    const endAngle = convertToAngle(convertToPercent(category, min, max));
    const arc =
      arcGenerator({
        innerRadius: innerRadius,
        outerRadius: outerRadius,
        startAngle: startAngle,
        endAngle: endAngle,
      }) ?? '';
    arcs.push(arc);
    startAngle = endAngle;
  }

  // Filled arc to overlay the background arcs
  const filledAngle = convertToAngle(convertToPercent(aqi, min, max));

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
  const aqiColor = assignColor(aqi); // Color that needle points to
  const pathObjects = [];
  for (let i = 0; i < arcs.length; i++) {
    const arcColor = assignColor(categories[i]);
    /* eslint-disable no-magic-numbers */
    let opacity = 0.3;
    if (arcColor === aqiColor) {
      opacity = 1;
    } else {
      opacity = 0.3;
    }
    /* eslint-enable no-magic-numbers */
    pathObjects.push(
      <path
        d={arcs[i]}
        fill={arcColor}
        stroke="black"
        strokeWidth={0.002}
        fillOpacity={opacity}
        key={i}
      />
    );
  }

  /**
   * Note: the path d="M0.84 5.961e-08L0...." is svg code to create the triangle
   * that acts as the needle in our gauge. This was created in Figma and exported
   * as svg code.
   */
  return (
    <div className="svg">
      <svg height="150" width="300" viewBox={' -1.05 -1.05 2.1 1.15'}>
        {pathObjects.map(pathObject => pathObject)}
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

export default GaugeSvg;
