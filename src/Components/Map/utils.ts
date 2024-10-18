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
import {Pixel} from 'ol/pixel';
import {FeatureLike} from 'ol/Feature';
import {Source} from 'ol/source';

export const ISOLINE_LAYER_ID = 'isolineLayer';
export const ISOLINE_LABELS_LAYER_ID = 'isolineLabelsLayer';
export const HIGHLIGHT_ID = 'highlight';
export const Z_INDEX_MAX = 100;
export const OBJECTS_Z_INDEX = Z_INDEX_MAX - 2;
export const LABELS_Z_INDEX = Z_INDEX_MAX - 1;

export const getMapLayers = (map: OlMap): BaseLayer[] => {
  return map.getLayers().getArray();
};

class WebGLIsolineLayer extends Layer {
  createRenderer(): WebGLVectorLayerRenderer {
    return new WebGLVectorLayerRenderer(this, {
      style: getWebGlIsolineLayerStyle(),
    });
  }
}

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
  return (feature: FeatureLike) => {
    const color = feature.get('color');
    if (!color || !isFeatureGeom(feature)) return new Style();
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
): {layer: BaseLayer; source: Source} | null => {
  const layer =
    getMapLayers(map).find(l => l.get('id') === ISOLINE_LAYER_ID) || null;
  if (
    !layer ||
    !(layer instanceof VectorLayer || layer instanceof WebGLIsolineLayer)
  )
    return null;
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
  if (!layer || !(layer instanceof VectorLayer)) return null;
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
  const webglLayer = new WebGLIsolineLayer({
    zIndex: OBJECTS_Z_INDEX,
    source: new VectorSource({
      features,
    }),
  });
  const defaultLayer = new VectorLayer({
    zIndex: OBJECTS_Z_INDEX,
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
    zIndex: LABELS_Z_INDEX,
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

export const addHighlightLayer = (map: Map) => {
  const prevLayer = getHighlightLayerAndSource(map)?.layer;
  if (prevLayer) map.removeLayer(prevLayer);
  const highlightLayer = new VectorLayer({
    source: new VectorSource(),
    zIndex: Z_INDEX_MAX,
    style: (feature: FeatureLike) => {
      const highlightFillColor = 'rgba(95,15,150,0.8)';
      if (!feature.get('color')) return new Style();
      const geomType = feature.getGeometry()?.getType();
      if (geomType === 'Point') {
        return new Style({
          image: new Circle({
            radius: 5,
            fill: new Fill({color: highlightFillColor}),
            stroke: new Stroke({color: highlightFillColor, width: 1}),
          }),
        });
      }
      return new Style({
        stroke: new Stroke({color: highlightFillColor, width: 0.1}),
        fill: new Fill({color: highlightFillColor}),
      });
    },
  });
  highlightLayer.set('id', HIGHLIGHT_ID);
  map.addLayer(highlightLayer);
};

export const getHighlightLayerAndSource = (
  map: Map
): {layer: VectorLayer; source: VectorSource} | null => {
  const layer =
    getMapLayers(map).find(l => l.get('id') === HIGHLIGHT_ID) || null;
  if (!layer || !(layer instanceof VectorLayer)) return null;
  const source = layer?.getSource();
  return {layer, source};
};

export const addHighlight = (map: Map) => {
  const displayFeatureInfo = function (pixel: Pixel) {
    const highlightSource = getHighlightLayerAndSource(map)?.source;
    if (!highlightSource) return;
    highlightSource.clear();
    const feature = map.forEachFeatureAtPixel(
      pixel,
      function (feature: FeatureLike, layer: Layer) {
        if (layer.get('id') === HIGHLIGHT_ID || !isFeatureGeom(feature)) return;
        highlightSource.addFeature(feature);
        return feature;
      }
    );
    map.getViewport().style.cursor = feature ? 'pointer' : '';
  };

  map.on('pointermove', function (evt) {
    if (evt.dragging) {
      return;
    }
    const pixel = map.getEventPixel(evt.originalEvent);
    displayFeatureInfo(pixel);
  });
};

export const isFeatureGeom = (feature: unknown): feature is Feature<Geometry> =>
  typeof feature === 'object' &&
  feature instanceof Feature &&
  feature.getGeometry();
