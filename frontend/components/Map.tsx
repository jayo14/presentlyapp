import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default icon not showing
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Premium open-source map style (Google-like)
const ROAD_STYLE = 'https://{s}.basemaps.cartocdn.com/rastertiles/positron/{z}/{x}/{y}{r}.png';
const ROAD_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

interface MapProps {
  center: [number, number];
  zoom: number;
  markers?: { position: [number, number]; popupText: string }[];
}

const Map: React.FC<MapProps> = ({ center, zoom, markers }) => {
  return (
    <MapContainer center={center} zoom={zoom} style={{ height: '400px', width: '100%' }}>
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        maxZoom={20}
      />
      {markers &&
        markers.map((marker, idx) => (
          <Marker key={idx} position={marker.position}>
            <Popup>{marker.popupText}</Popup>
          </Marker>
        ))}
    </MapContainer>
  );
};

export default Map;
