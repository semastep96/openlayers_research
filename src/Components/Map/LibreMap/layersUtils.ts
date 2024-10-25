import {FeaturesData, LMap} from './types.ts';

export const SOURCE_IDS = {
  isolineSource: 'isoline-source',
};
export const LAYERS_IDS = {
  isolineLayer: 'isoline-layer',
  isolinePointLayer: 'isoline-point-layer',
  isolineLabels: 'isoline-labels',
};

export const setLayers = (
  map: LMap,
  featuresData: FeaturesData | null,
  opts: {withLabels: boolean; withLabelsDeclutter: boolean}
) => {
  removeAllLayers(map);
  removeAllSources(map);
  const features = featuresData?.features;
  if (!map || !features?.length || !featuresData) return;
  map.addSource(SOURCE_IDS.isolineSource, {
    type: 'geojson',
    data: featuresData,
    generateId: true,
  });

  map.addLayer({
    id: LAYERS_IDS.isolineLayer,
    type: 'fill',
    source: SOURCE_IDS.isolineSource,
    filter: ['==', ['geometry-type'], 'Polygon'],
    paint: {
      'fill-color': [
        'case',
        ['==', ['feature-state', 'hover'], true],
        'purple',
        ['get', 'color'],
      ],
      'fill-opacity': [
        'case',
        ['==', ['feature-state', 'hover'], true],
        0.5,
        1,
      ],
      'fill-outline-color': 'black',
    },
  });

  map.addLayer({
    id: LAYERS_IDS.isolinePointLayer,
    type: 'circle',
    source: SOURCE_IDS.isolineSource,
    filter: ['==', ['geometry-type'], 'Point'],
    paint: {
      'circle-radius': 5,
      'circle-color': [
        'case',
        ['==', ['feature-state', 'hover'], true],
        'purple',
        ['get', 'color'],
      ],
      'circle-stroke-color': 'white',
      'circle-stroke-width': 1,
    },
  });

  if (opts.withLabels) {
    map.addLayer({
      id: LAYERS_IDS.isolineLabels,
      type: 'symbol',
      source: SOURCE_IDS.isolineSource,
      layout: {
        'text-field': [
          'format',
          ['upcase', ['get', 'name']],
          {'font-scale': 0.8},
        ],
        'text-offset': [0, 0.6],
        'text-anchor': 'top',
        'text-allow-overlap': !opts.withLabelsDeclutter,
      },
      paint: {
        'text-color': 'white',
        'text-halo-color': '#000000',
        'text-halo-width': 1,
      },
    });
  }
};

export const removeAllLayers = (map: LMap) => {
  const removeLayersIds = Object.values(LAYERS_IDS);
  removeLayersIds.forEach(lId => {
    if (!map.getLayer(lId)) return;
    map.removeLayer(lId);
  });
};

export const removeAllSources = (map: LMap) => {
  const removeLayersIds = Object.values(SOURCE_IDS);
  removeLayersIds.forEach(lId => {
    if (!map.getSource(lId)) return;
    map.removeSource(lId);
  });
};
