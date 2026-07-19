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

interface MapProps {
  center: [number, number];
  zoom: number;
  markers?: { position: [number, number]; popupText: string }[];
}

const Map: React.FC<MapProps> = ({ center, zoom, markers }) => {
  return (
    <div className="w-full h-full min-h-[400px]">
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
          maxZoom={20}
        />
        {markers &&
          markers.map((marker, idx) => (
            <Marker key={idx} position={marker.position}>
              <Popup>{marker.popupText}</Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
};

export default Map;
