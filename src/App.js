import {json as requestJson} from 'd3-request';
import {fromJS} from 'immutable';
import React, {Component} from 'react';
import MapGL, {Popup, NavigationControl, LinearInterpolator} from 'react-map-gl';
import Geocoder from 'react-map-gl-geocoder';
import bbox from '@turf/bbox';
import WebMercatorViewport from 'viewport-mercator-project';

import './App.css';
import InfoPanel from './info-panel';
import {defaultMapStyle, polyLayer} from './map-style.js';

export default class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      mapStyle: defaultMapStyle,
      viewport: {
        latitude: 38,
        longitude: -79,
        zoom: 7,
        bearing: 0,
        pitch: 0
      },
      data: {},
      popupInfo: [],
      interactiveLayerIds: ['nps', 'vsf', 'wma']
    };
  }

  mapRef = React.createRef()

  componentDidMount() {
    requestJson('https://s3.amazonaws.com/eseglem-public/NPS.geojson', (error, response) => {
      if (!error) {
        this._loadData(response, 'nps', '#00ffff', this.state.mapStyle, this.state.data);
      }
    });
    requestJson('https://s3.amazonaws.com/eseglem-public/VA_State_Forest.geojson', (error, response) => {
      if (!error) {
        this._loadData(response, 'vsf', '#ffff00', this.state.mapStyle, this.state.data);
      }
    });
    requestJson('https://s3.amazonaws.com/eseglem-public/VDGIF_WMA.geojson', (error, response) => {
      if (!error) {
        this._loadData(response, 'wma', '#ffffff', this.state.mapStyle, this.state.data);
      }
    });
  }

  _loadData = (sourceData, name, color, currentMapStyle, data) => {
    var layer = polyLayer;
    layer.id = name;
    layer.source = name;
    layer.paint["fill-color"] = color;
    layer.paint["fill-outline-color"] = color;

    const mapStyle = currentMapStyle
    // Add geojson source to map
    .setIn(['sources', name], fromJS({type: 'geojson', data: sourceData}))
    // Add point layer to map
    .set('layers', currentMapStyle.get('layers').push(fromJS(layer)));

    // Save Data for use elsewhere...
    //data[name] = sourceData

    this.setState({mapStyle, data});
  }

  _updateViewport = (viewport) => {
    this.setState({viewport});
  }

  _locateUser() {
    navigator.geolocation.getCurrentPosition(position => {
      this._updateViewport({
        longitude: position.coords.longitude,
        latitude: position.coords.latitude
      });
    });
  }

  _onHover = event => {
    let hoverInfo = null;

    const nps = event.features && event.features.find(f => f.layer.id === 'nps');
    const wma = event.features && event.features.find(f => f.layer.id === 'wma');
    const vsf = event.features && event.features.find(f => f.layer.id === 'vsf');

    if (nps) {
        hoverInfo = {
          lngLat: event.lngLat,
          name: nps.properties.UNIT_NAME + " National Park"
        };
    } else if (wma) {
      hoverInfo = {
        lngLat: event.lngLat,
        name: wma.properties.WMA_NAME + " Wildlife Management Area"
      };
    } else if (vsf) {
      hoverInfo = {
        lngLat: event.lngLat,
        name: vsf.properties.STFOR
      };
    }

    this.setState({hoverInfo});
  };

  _onClick = (event) => {
    const feature = event.features[0];
    if (feature) {
      // calculate the bounding box of the feature
      const [minLng, minLat, maxLng, maxLat] = bbox(feature);
      // construct a viewport instance from the current state
      const viewport = new WebMercatorViewport(this.state.viewport);
      const {longitude, latitude, zoom} = viewport.fitBounds(
        [[minLng, minLat], [maxLng, maxLat]],
        {padding: 40}
      );

      this.setState({viewport: {
        ...this.state.viewport,
        longitude,
        latitude,
        zoom,
        transitionInterpolator: new LinearInterpolator({
          around: [event.offsetCenter.x, event.offsetCenter.y]
        }),
        transitionDuration: 1000
      }});
    }
  }

  _renderPopup() {
    const {hoverInfo} = this.state;
    if (hoverInfo) {
      return (
        <Popup longitude={hoverInfo.lngLat[0]} latitude={hoverInfo.lngLat[1]} closeButton={false}>
          <div className="hover-info">{hoverInfo.name}</div>
        </Popup>
      );
    }
    return null;
  }

  _getCursor = ({isHovering, isDragging}) => {
    return isHovering ? 'pointer' : 'default';
  };

  render() {
    const {viewport, interactiveLayerIds} = this.state;
    var accessToken = 'pk.eyJ1IjoiZXNlZ2xlbSIsImEiOiJjanA5MmUxYWcwM2xvM2pwbHRteGp2bTE4In0.bFJlxXQRF34f8GGX8dPG9Q';
    return (
      <MapGL
        ref={this.mapRef}
        mapboxApiAccessToken={accessToken}
        {...viewport}
        width="100%"
        height="100%"
        mapStyle={this.state.mapStyle}
        onHover={this._onHover}
        onClick={this._onClick}
        getCursor={this._getCursor}
        interactiveLayerIds={interactiveLayerIds}
        onViewportChange={this._updateViewport} >

        { this._renderPopup() }

        <div className="nav">
          <NavigationControl onViewportChange={this._updateViewport} />
        </div>

        <Geocoder
          mapRef={this.mapRef}
          mapboxApiAccessToken={accessToken}
          onViewportChange={this._updateViewport}
          zoom={12}
        />

        <InfoPanel containerComponent={this.props.containerComponent} />

      </MapGL>
    );
  }
}
