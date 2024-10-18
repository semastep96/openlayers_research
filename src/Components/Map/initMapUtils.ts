import {Map} from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import View from 'ol/View';
import {ScaleLine, Zoom} from 'ol/control';
import {addHighlight, addHighlightLayer, HIGHLIGHT_ID} from './utils.ts';
import {FeatureInfo, SetInfo} from './types.ts';

export const initMap = (setInfo: SetInfo) => {
  const map = new Map({
    layers: [
      new TileLayer({
        source: new OSM(),
      }),
    ],
    view: new View({
      center: [0, 0],
      zoom: 2,
    }),
  });
  addHighlightLayer(map);
  addHighlight(map);
  addMapControls(map);
  setInfoOnPointerMove(map, setInfo);

  return map;
};

export const addMapControls = (map: Map) => {
  map.addControl(
    new Zoom({zoomInTipLabel: 'Приблизить', zoomOutTipLabel: 'Отдалить'})
  );
  map.addControl(
    new ScaleLine({
      units: 'metric',
    })
  );
};

export const setInfoOnPointerMove = (map: Map, setInfo: SetInfo) => {
  map.on('pointermove', function (evt) {
    if (evt.dragging) return;
    const pixel = map.getEventPixel(evt.originalEvent);
    const feature = map.forEachFeatureAtPixel(
      pixel,
      (feature, layer) => {
        if (layer.get('id') === HIGHLIGHT_ID) return;
        const featureGeom = feature?.getGeometry();
        const featureInfo: Omit<FeatureInfo, 'geometry'> =
          feature.getProperties();
        setInfo({...featureInfo, geometry: featureGeom?.getType()});
        return feature;
      },
      {
        hitTolerance: 5,
      }
    );
    if (!feature) {
      setInfo(null);
    }
  });
};
