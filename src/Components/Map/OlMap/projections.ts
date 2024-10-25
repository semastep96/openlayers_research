import proj4 from 'proj4';
import {register} from 'ol/proj/proj4';
import {Projection} from 'ol/proj';

export const getOlProjections = () => {
  proj4.defs('EPSG:32654', '+proj=utm +zone=54 +datum=WGS84 +units=m +no_defs');
  register(proj4);
  return {
    dataProjection: new Projection({code: 'EPSG:32654'}),
    mapProj: new Projection({code: 'EPSG:3857'}),
  };
};
