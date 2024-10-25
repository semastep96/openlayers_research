import React, {useEffect, useRef, useState} from 'react';
import {FeatureInfo} from '../types.ts';
import 'maplibre-gl/dist/maplibre-gl.css';
import {FeaturesData, LMap} from './types.ts';
import './style.css';
import {addColorsAndTitles} from './utils.ts';
import {convertFeaturesDataToMapProjection} from './projectionsUtils.ts';
import {LAYERS_IDS, setLayers, SOURCE_IDS} from './layersUtils.ts';
import {initMap} from './initialization.ts';

export const LibreMap: React.FC = () => {
  const mapElement = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LMap>();
  const [isLabelsVisible, setIsLabelsVisible] = useState(true);
  const [isLabelsDeclutter, setIsLabelsDeclutter] = useState(true);
  const [currentHover, setCurrentHover] = useState<
    FeaturesData['features'][0] | null
  >(null);
  const [currentInfo, setCurrentInfo] = useState<FeatureInfo | null>(null);
  const [isMapInitialized, setIsMapInitialized] = useState(false);
  const [featuresData, setFeaturesData] = useState<FeaturesData | null>(null);

  const handleLabelsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsLabelsVisible(e.target.checked);
  };

  const handleLabelsDeclutterChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setIsLabelsDeclutter(e.target.checked);
  };

  useEffect(() => {
    if (!mapRef.current && mapElement.current && !isMapInitialized) {
      mapRef.current = initMap(mapElement.current);
      setIsMapInitialized(true);
    }
  }, [isMapInitialized]);

  useEffect(() => {
    if (!isMapInitialized) return;
    fetch('/isolineData/isoline.json')
      .then(response => response.json())
      .then((data: FeaturesData) => {
        addColorsAndTitles(data);
        const converted = convertFeaturesDataToMapProjection(data);
        setFeaturesData(converted);
      })
      .catch(error => console.error('Error fetching JSON:', error));
  }, [isMapInitialized]);

  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current?.on(
      'mousemove',
      [LAYERS_IDS.isolineLayer, LAYERS_IDS.isolinePointLayer],
      e => {
        const features = e.features;
        if (!features?.length) {
          setCurrentHover(prevState => {
            if (mapRef.current && prevState) {
              mapRef.current?.removeFeatureState(
                {id: prevState?.id, source: SOURCE_IDS.isolineSource},
                'hover'
              );
            }
            return null;
          });
          return;
        }

        setCurrentHover(prevState => {
          if (mapRef.current && prevState !== features[0] && prevState?.id) {
            mapRef.current?.removeFeatureState(
              {id: prevState?.id, source: SOURCE_IDS.isolineSource},
              'hover'
            );
          }
          if (features[0].id) {
            mapRef.current?.setFeatureState(
              {id: features[0].id, source: SOURCE_IDS.isolineSource},
              {
                hover: true,
              }
            );
            return features[0];
          }
          return null;
        });
      }
    );
    mapRef.current?.on(
      'mouseleave',
      [LAYERS_IDS.isolineLayer, LAYERS_IDS.isolinePointLayer],
      () => {
        setCurrentHover(prevState => {
          if (mapRef.current && prevState) {
            mapRef.current?.removeFeatureState(
              {id: prevState?.id, source: SOURCE_IDS.isolineSource},
              'hover'
            );
          }
          return null;
        });
      }
    );
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (map) {
      setLayers(map, featuresData, {
        withLabels: isLabelsVisible,
        withLabelsDeclutter: isLabelsDeclutter,
      });
    }
  }, [featuresData, isLabelsDeclutter, isLabelsVisible]);

  useEffect(() => {
    if (currentHover?.properties && currentHover.geometry.type) {
      setCurrentInfo({
        ...currentHover.properties,
        geometry: currentHover.geometry.type,
      });
      return;
    }
    setCurrentInfo(null);
  }, [currentHover]);

  return (
    <>
      <div className={'map_menu'}>
        <h3 className={'menu_title'}>MapLibre Settings</h3>
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
          color: "{currentInfo?.color?.toString() || '-'}"
        </div>
        <div className={'menu_info'}>
          geometry: "{currentInfo?.geometry || '-'}"
        </div>
      </div>
      <div ref={mapElement} className={'map-container'}></div>
    </>
  );
};
