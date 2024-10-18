import React, {useEffect, useRef, useState} from 'react';
import 'ol/ol.css';
import {Feature, Map as olMap} from 'ol';
import {initMap} from './initMapUtils.ts';
import './style.css';
import {FeatureInfo, FeaturesData} from './types.ts';
import {GeoJSON} from 'ol/format';
import {
  addIsolineOlLayer,
  addIsolineTitlesLayer,
  setColorsAndTitles,
} from './utils.ts';
import {FeatureLike} from 'ol/Feature';
import {Geometry} from 'ol/geom';

export const Map: React.FC = () => {
  const mapElement = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<olMap>();
  const [isMapInitialized, setIsMapInitialized] = useState(false);
  const [features, setFeatures] = useState<Feature<Geometry>[]>([]);
  const [isWebgl, setIsWebgl] = useState(true);
  const [isLabelsVisible, setIsLabelsVisible] = useState(false);
  const [isLabelsDeclutter, setIsLabelsDeclutter] = useState(false);
  const [currentInfo, setCurrentInfo] = useState<FeatureInfo | null>(null);

  const handleWebglChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsWebgl(e.target.checked);
  };
  const handleLabelsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsLabelsVisible(e.target.checked);
  };
  const handleLabelsDeclutterChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setIsLabelsDeclutter(e.target.checked);
  };

  useEffect(() => {
    if (isMapInitialized) return;
    mapRef.current = initMap(setCurrentInfo);
    setIsMapInitialized(true);
  }, [isMapInitialized]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapInitialized) return;
    map.setTarget(mapElement.current || '');
    map.getView().changed();
    return () => {
      map.setTarget('');
    };
  }, [isMapInitialized]);

  useEffect(() => {
    setColorsAndTitles(features);
    const map = mapRef.current;
    if (!map) return;
    addIsolineOlLayer(map, features, isWebgl);
    addIsolineTitlesLayer(map, features, isLabelsVisible, isLabelsDeclutter);
  }, [features, isWebgl, isLabelsVisible, isLabelsDeclutter]);

  useEffect(() => {
    fetch('/isolineData/isoline.json')
      .then(response => response.json())
      .then((data: FeaturesData) => {
        const featuresGeom: FeatureLike = new GeoJSON({}).readFeatures(data);
        setFeatures(featuresGeom);
      })
      .finally(() => console.log('featuresSet'))
      .catch(error => console.error('Error fetching JSON:', error));
  }, []);
  return (
    <>
      <div className={'map_menu'}>
        <h3 className={'menu_title'}>Settings</h3>
        <label className={'webgl_checkbox'}>
          webgl
          <input
            type="checkbox"
            checked={isWebgl}
            onChange={handleWebglChange}
          />
        </label>
        <label className={'labels_checkbox'}>
          labels
          <input
            type="checkbox"
            checked={isLabelsVisible}
            onChange={handleLabelsChange}
          />
        </label>
        <label className={'declutter_checkbox'}>
          labels declutter
          <input
            type="checkbox"
            checked={isLabelsDeclutter}
            onChange={handleLabelsDeclutterChange}
          />
        </label>
        <h3 className={'menu_title'}>Feature info</h3>
        <div className={'menu_info'}>value: "{currentInfo?.value || '-'}"</div>
        <div className={'menu_info'}>name: "{currentInfo?.name || '-'}"</div>
        <div className={'menu_info'}>
          color: "{currentInfo?.color.toString() || '-'}"
        </div>
        <div className={'menu_info'}>
          geometry: "{currentInfo?.geometry || '-'}"
        </div>
      </div>
      <div ref={mapElement} className={'map-container'}></div>
    </>
  );
};
