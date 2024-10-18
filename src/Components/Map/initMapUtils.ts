import {Map} from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import View from 'ol/View';
import {ScaleLine, Zoom} from 'ol/control';

export const initMap = () => {
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
  addMapControls(map);

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
