export type FeatureData = {
  type: 'Feature';
  properties: {value: number; color?: string; name?: string};
  geometry: {type: string; coordinates: unknown[]};
};

export type FeaturesData = {
  type: 'FeatureCollection';
  properties: {description: string};
  features: FeatureData[];
};
