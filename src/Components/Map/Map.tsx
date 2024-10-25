import React, {useState} from 'react';
import {MapOpenLayers} from './OlMap/MapOpenLayers.tsx';
import {MapType} from './types.ts';
import './style.css';
import {LibreMap} from './LibreMap/LibreMap.tsx';

export const Map: React.FC = () => {
  const [mapType, setMapType] = useState<MapType>('LIBRE');
  const buttonText = `Change on ${mapType === 'OL' ? 'LIBRE MAP' : 'OL MAP'}`;
  const toggleMapType = () => {
    setMapType(mapType === 'OL' ? 'LIBRE' : 'OL');
  };
  return (
    <>
      <button className={'map-toggle-btn'} onClick={toggleMapType}>
        {buttonText}
      </button>
      {mapType === 'OL' && <MapOpenLayers />}
      {mapType === 'LIBRE' && <LibreMap />}
    </>
  );
};
