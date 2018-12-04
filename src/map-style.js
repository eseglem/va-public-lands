import {fromJS} from 'immutable';

export var polyLayer = {
  "id": "",
  "source": "",
  "type": "fill",
  "paint": {
    'fill-outline-color': '',
    'fill-color': '',
    'fill-opacity': 0.5
  },
};
  
const mapStyle = {
  "version": 8,
  "sources": {
    "CartoDB Dark": {
      'type': 'raster',
      'tiles': [
          'https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png',
          'https://cartodb-basemaps-b.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png',
          'https://cartodb-basemaps-c.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png',
          'https://cartodb-basemaps-d.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png',
      ],
      'tileSize': 256
    }
  },
  "layers": [
    {
      "id": "cartodb-dark",
      "source": "CartoDB Dark",
      "type": "raster",
      "minzoom": 0,
      "maxzoom": 20,
    }
  ],
};

export const defaultMapStyle = fromJS(mapStyle);