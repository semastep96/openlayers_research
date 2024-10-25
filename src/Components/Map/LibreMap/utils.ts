import {isNil} from 'lodash';
import chroma from 'chroma-js';
import {FeaturesData} from './types.ts';

export function addColorsAndTitles(data: FeaturesData) {
  const domain = data.features.length
    ? getIsolineDomain(data.features)
    : [0, 1];
  const colorScale = chroma
    .scale(['blue', 'green', 'yellow', 'red'])
    .domain(domain);

  data.features.forEach(feature => {
    const value: number | null = feature.properties?.value;
    const color = colorScale(isNil(value) ? 0 : value).hex();
    if (!feature.properties) {
      feature.properties = {};
    }
    feature.properties.color = color;
    feature.properties.name = `test obj name ${color}`;
  });
}

export function getIsolineDomain(features: FeaturesData['features']) {
  const values = features.map(ft => ft.properties?.value);
  return [Math.min(...values), Math.max(...values)];
}
