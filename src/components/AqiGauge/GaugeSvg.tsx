import React from 'react';
import {arc} from 'd3-shape';
import {scaleLinear} from 'd3-scale';
import {DialProps} from './AqiDial';
import {useColor} from '../../contexts/ColorContext';
import {aqiCutoffs} from '../../util';

const GaugeSvg: ({currentAqi}: DialProps) => JSX.Element = ({
  currentAqi,
}: DialProps) => {
  /* eslint-disable no-magic-numbers */
  // Arc properties
  const innerRadius = 0.5;
  const outerRadius = 1;
  const initialAngle = -Math.PI / 2;
  const finalAngle = Math.PI / 2;

  // Values to display
  const min = 0;
  const max = 300;
  const aqi: number = +currentAqi;
  /* eslint-enable no-magic-numbers */

  const {currentColorScheme} = useColor();

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
  let startAngle = initialAngle;
  const categories = [
    aqiCutoffs.good,
    aqiCutoffs.moderate,
    aqiCutoffs.sensitiveGroups,
    aqiCutoffs.unhealthy,
    aqiCutoffs.veryUnhealthy,
  ];
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
    let arcColor = currentColorScheme.good;
    if (aqi <= aqiCutoffs.good) {
      arcColor = currentColorScheme.good;
    } else if (aqi <= aqiCutoffs.moderate) {
      arcColor = currentColorScheme.moderate;
    } else if (aqi <= aqiCutoffs.sensitiveGroups) {
      arcColor = currentColorScheme.sensitive;
    } else if (aqi <= aqiCutoffs.unhealthy) {
      arcColor = currentColorScheme.unhealthy;
    } else if (aqi <= aqiCutoffs.veryUnhealthy) {
      arcColor = currentColorScheme.veryUnhealthy;
    } else {
      // Hazardous
      arcColor = currentColorScheme.hazardous;
    }
    return arcColor.backgroundColor;
  };

  const needleColor = '#636360';
  const aqiColor = assignColor(aqi); // Color that needle points to
  const pathObjects = [];
  for (let i = 0; i < arcs.length; i++) {
    const arcColor = assignColor(categories[i]);
    const opacity =
      arcColor === aqiColor
        ? currentColorScheme.activeOpacity
        : currentColorScheme.inactiveOpacity;
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
