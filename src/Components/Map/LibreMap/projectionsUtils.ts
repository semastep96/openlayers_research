import proj4 from 'proj4';
import {FeaturesData, FeaturesGeometry} from './types.ts';

proj4.defs('EPSG:32654', '+proj=utm +zone=54 +datum=WGS84 +units=m +no_defs');

export const convertToEPSG4326 = (
  geometry: FeaturesGeometry
): FeaturesGeometry => {
  const sourceProj = 'EPSG:32654';
  const targetProj = 'EPSG:4326';
  if (geometry.type === 'Point') {
    const [x, y] = geometry.coordinates;
    const newCoordinates: [number, number] = proj4(sourceProj, targetProj, [
      x,
      y,
    ]);
    return {type: 'Point', coordinates: newCoordinates};
  }
  if (geometry.type === 'MultiPolygon') {
    const newCoordinates: number[][][][] = geometry.coordinates.map(polygon =>
      polygon.map(ring =>
        ring.map(([x, y]) => proj4(sourceProj, targetProj, [x, y]))
      )
    );
    return {type: 'MultiPolygon', coordinates: newCoordinates};
  }
  throw new Error('fail coord translate');
};

export const convertFeaturesDataToMapProjection = (data: FeaturesData) => {
  const features = data.features.map(ft => {
    const geometry = convertToEPSG4326(ft.geometry);
    return {
      ...ft,
      geometry,
    };
  });
  return {
    ...data,
    features,
  };
};
