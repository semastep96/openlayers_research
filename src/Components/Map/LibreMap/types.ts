import maplibregl from 'maplibre-gl';
import {FeatureCollection} from 'geojson';

export type LMap = maplibregl.Map;

export type FeaturesData = FeatureCollection;

export type FeaturesGeometry = FeaturesData['features'][0]['geometry'];
