export type MapType = 'OL' | 'LIBRE';
export type FeatureInfo = {
  value?: number;
  color?: [];
  name?: string;
  geometry?: string;
};
export type SetInfo = (info: FeatureInfo | null) => void;
