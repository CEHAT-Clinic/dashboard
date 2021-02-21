import React from 'react';
import {arc} from 'd3-shape';
import {scaleLinear} from 'd3-scale';
import {DialProps} from './AQIDial';

const GaugeSVG: ({currentReading}: DialProps) => JSX.Element = ({
  currentReading,
}: DialProps) => {

  // Arc properties
  /* eslint-disable no-magic-numbers */
  const innerRadius = 0.65;
  const outerRadius = 1;
  const startAngle = -Math.PI / 2;
  const endAngle = Math.PI / 2;
  const cornerRadius = 0.1;
  /* eslint-enable no-magic-numbers */

  const arcGenerator = arc().cornerRadius(cornerRadius);

  // This is the grey arc in the background that goes from the beginning to end
  let backgroundArc = arcGenerator({
    innerRadius: innerRadius,
    outerRadius: outerRadius,
    startAngle: startAngle,
    endAngle: endAngle,
  });

  // Values to display
  const min = 0;
  const max = 300;
  const aqi: number = +currentReading;

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

  const percent = convertToPercent(aqi, min, max);

  // Convert from percent to angle
  const angleScale = scaleLinear()
    .domain([0, 1]) /* eslint-disable-line no-magic-numbers */
    .range([startAngle, endAngle])
    .clamp(true);
  const angle = angleScale(percent);

  // Make the filled arc to overlay the background arc
  let filledArc = arcGenerator({
    innerRadius: innerRadius,
    outerRadius: outerRadius,
    startAngle: startAngle,
    endAngle: angle,
  });

  // Check for null to avoid type errors
  if (!backgroundArc || !filledArc) {
    backgroundArc = '';
    filledArc = '';
  }

  // Filled arc color:
  const assignColor = (aqi: number) => {
    const good = 50; // Air quality is good (0-50)
    const moderate = 100; // Air quality is acceptable (51-100)
    const sensitiveGroups = 150; // Health risk for sensitive groups (101-150)
    const unhealthy = 200; // Health risk for all individuals (151-200)
    const veryUnhealthy = 300; // Very unhealthy for all individuals (201-300)

    let arcColor = 'white';
    if (aqi <= good) {
      arcColor = '#08E400';
    } else if (aqi <= moderate) {
      arcColor = '#FEFF00';
    } else if (aqi <= sensitiveGroups) {
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
  const filledColor = assignColor(aqi);
  const backgroundColor = "#E2E8F0"

  return (
    <div className="svg">
      <svg height="150" width="300" viewBox={' -1.05 -1.05 2.1 1.1'}>
        <path
          d={backgroundArc}
          fill={backgroundColor}
          stroke="black"
          strokeWidth={0.002}
        />
        <path d={filledArc} fill={filledColor} />
      </svg>
    </div>
  );
};

export default GaugeSVG;
