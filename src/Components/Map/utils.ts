import {Feature, Map, Map as OlMap} from 'ol';
import {Geometry} from 'ol/geom';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import {Layer} from 'ol/layer';
import WebGLVectorLayerRenderer from 'ol/renderer/webgl/VectorLayer';
import BaseLayer from 'ol/layer/Base';
import chroma from 'chroma-js';
import {isNil} from 'lodash';
import {WebGLStyle} from 'ol/style/webgl';
import {StyleFunction} from 'ol/style/Style';
import {Circle, Fill, Stroke, Style} from 'ol/style';

export const ISOLINE_LAYER_ID = 'isolineLayer';
export const ISOLINE_LABELS_LAYER_ID = 'isolineLabelsLayer';

export const getMapLayers = (map: OlMap): BaseLayer[] => {
  return map.getLayers().getArray();
};

export const getWebGlIsolineLayerStyle = (): WebGLStyle => {
  return {
    'stroke-color': 'black',
    'stroke-width': 0.1,
    'fill-color': ['get', 'color'],
    'circle-radius': ['case', ['==', ['geometry-type'], 'Point'], 5, 0],
    'circle-fill-color': [
      'case',
      ['==', ['geometry-type'], 'Point'],
      ['get', 'color'],
      'transparent',
    ],
    'circle-stroke-color': [
      'case',
      ['==', ['geometry-type'], 'Point'],
      'white',
      'transparent',
    ],
    'circle-stroke-width': ['case', ['==', ['geometry-type'], 'Point'], 1, 0],
  };
};

export const getDefaultIsolineLayerStyle = (): StyleFunction => {
  return (feature: Feature<Geometry>) => {
    const color = feature.get('color');
    if (!color) return new Style();
    if (feature.getGeometry()?.getType() === 'Point') {
      return new Style({
        image: new Circle({
          radius: 5,
          fill: new Fill({color}),
          stroke: new Stroke({color: 'white', width: 1}),
        }),
      });
    }
    return new Style({
      stroke: new Stroke({color: 'black', width: 0.1}),
      fill: new Fill({color}),
    });
  };
};

export const getMapFeaturesLayerAndSource = (
  map: OlMap
): {layer: VectorLayer; source: VectorSource} | null => {
  const layer =
    getMapLayers(map).find(l => l.get('id') === ISOLINE_LAYER_ID) || null;
  if (!layer || !('getSource' in layer)) return null;
  const source = layer?.getSource() || null;
  if (!source) {
    return null;
  }
  return {layer, source};
};

export const getIsolineLabelsLayerAndSource = (
  map: OlMap
): {layer: VectorLayer; source: VectorSource} | null => {
  const layer =
    getMapLayers(map).find(l => l.get('id') === ISOLINE_LABELS_LAYER_ID) ||
    null;
  if (!layer || !('getSource' in layer)) return null;
  const source = layer?.getSource() || null;
  if (!source) {
    return null;
  }
  return {layer, source};
};

export const addIsolineOlLayer = (
  map: Map,
  features: Feature<Geometry>[],
  wantWebGlLayer?: boolean
) => {
  class WebGLLayer extends Layer {
    createRenderer() {
      return new WebGLVectorLayerRenderer(this, {
        style: getWebGlIsolineLayerStyle(),
      });
    }
  }

  const webglLayer = new WebGLLayer({
    source: new VectorSource({
      features,
    }),
  });
  const defaultLayer = new VectorLayer({
    style: getDefaultIsolineLayerStyle(),
    source: new VectorSource({
      features,
    }),
  });

  const prevLayer = getMapFeaturesLayerAndSource(map)?.layer;
  if (prevLayer) map.removeLayer(prevLayer);

  const isolineLayer = wantWebGlLayer ? webglLayer : defaultLayer;
  isolineLayer.set('id', ISOLINE_LAYER_ID);
  map.addLayer(isolineLayer);
};

export function addIsolineTitlesLayer(
  map: Map,
  features: Feature<Geometry>[],
  isLabelsVisible: boolean,
  declutter: boolean
) {
  const prevLayer = getIsolineLabelsLayerAndSource(map)?.layer;
  if (prevLayer) map.removeLayer(prevLayer);

  if (!isLabelsVisible) return;
  const labelLayer = new VectorLayer({
    source: new VectorSource({
      features,
    }),
    declutter,
    style: {
      'text-value': ['get', 'name'],
      'text-font': '9px sans-serif',
      'text-fill-color': 'white',
      'text-stroke-color': 'gray',
      'text-stroke-width': 1,
    },
  });
  labelLayer.set('id', ISOLINE_LABELS_LAYER_ID);

  map.addLayer(labelLayer);
}

export function getIsolineDomain(features: Feature[]): [number, number] {
  const values = features.map(ft => ft.get('value'));
  const min = Math.min(...values);
  const max = Math.max(...values);
  return [min, max];
}

export function setColorsAndTitles(features: Feature<Geometry>[]) {
  const domain = features.length ? getIsolineDomain(features) : [0, 1];
  const colorScale = chroma
    .scale(['blue', 'green', 'yellow', 'red'])
    .domain(domain);
  features.forEach(ft => {
    const val: number | undefined = ft.get('value');
    ft.set('color', colorScale(isNil(val) ? 0 : val).rgba());
    ft.set('name', 'test obj name ' + colorScale(isNil(val) ? 0 : val).hex());
  });
}
