export type FeatureData = {
  type: 'Feature';
  properties: {value: number};
  geometry: {type: string; coordinates: unknown[]};
};

export type FeaturesData = {
  type: 'FeatureCollection';
  properties: {description: string};
  features: FeatureData[];
};

export type FeatureInfo = {
  value: number;
  color: [];
  name: string;
  geometry: string;
};

export type SetInfo = (info: FeatureInfo | null) => void;
