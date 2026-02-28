import React, { useState, useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, DrawingManager, Polygon, Marker } from '@react-google-maps/api';
import { Venue } from '../../types';
import { MapIcon, Satellite, RefreshCw } from 'lucide-react';

interface VenueMapProps {
  venues: Venue[];
  activeSessions?: Set<number>;
  onVenueClick?: (venue: Venue) => void;
  onMapClick?: (lat: number, lng: number) => void;
  selectedVenue?: Venue | null;
  drawingMode?: boolean;
  onBoundaryComplete?: (coordinates: number[][]) => void;
}

const containerStyle = {
  width: '100%',
  height: '100%'
};

const center = {
  lat: 7.3775,
  lng: 3.8936
};

export const VenueMap: React.FC<VenueMapProps> = ({
  venues,
  activeSessions = new Set(),
  onVenueClick,
  onMapClick,
  selectedVenue,
  drawingMode = false,
  onBoundaryComplete
}) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries: ['drawing']
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [mapType, setMapType] = useState<google.maps.MapTypeId>(google.maps.MapTypeId.ROADMAP);
  const drawingManagerRef = useRef<google.maps.drawing.DrawingManager | null>(null);

  const onLoad = React.useCallback(function callback(map: google.maps.Map) {
    setMap(map);
  }, []);

  const onUnmount = React.useCallback(function callback(map: google.maps.Map) {
    setMap(null);
  }, []);

  const onPolygonComplete = (polygon: google.maps.Polygon) => {
    const path = polygon.getPath();
    const coordinates: number[][] = [];
    for (let i = 0; i < path.getLength(); i++) {
      const point = path.getAt(i);
      // Format: [[lng, lat], [lng, lat], ...]
      coordinates.push([point.lng(), point.lat()]);
    }
    // Close the polygon if not closed
    if (coordinates.length > 0 && (coordinates[0][0] !== coordinates[coordinates.length-1][0] || coordinates[0][1] !== coordinates[coordinates.length-1][1])) {
        coordinates.push(coordinates[0]);
    }

    if (onBoundaryComplete) {
      onBoundaryComplete(coordinates);
    }
    polygon.setMap(null); // Remove the temporary drawing
  };

  useEffect(() => {
      if (map && venues.length > 0) {
          const bounds = new google.maps.LatLngBounds();
          venues.forEach(v => {
              if (v.latitude && v.longitude) {
                  bounds.extend({ lat: Number(v.latitude), lng: Number(v.longitude) });
              }
          });
          map.fitBounds(bounds);
      }
  }, [map, venues]);

  if (!isLoaded) return <div className="w-full h-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-800">Loading Map...</div>;

  return (
    <div className="relative w-full h-full group">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={selectedVenue ? { lat: Number(selectedVenue.latitude), lng: Number(selectedVenue.longitude) } : center}
        zoom={13}
        onLoad={onLoad}
        onUnmount={onUnmount}
        mapTypeId={mapType}
        onClick={(e) => e.latLng && onMapClick?.(e.latLng.lat(), e.latLng.lng())}
        options={{
            disableDefaultUI: true,
            zoomControl: true,
            styles: [
                {
                    "featureType": "all",
                    "elementType": "labels.text.fill",
                    "stylers": [{ "color": "#ffffff" }, { "weight": "0.20" }, { "lightness": "28" }, { "saturation": "23" }, { "visibility": "off" }]
                }
            ]
        }}
      >
        {drawingMode && (
          <DrawingManager
            onLoad={manager => { drawingManagerRef.current = manager; }}
            onPolygonComplete={onPolygonComplete}
            options={{
              drawingControl: true,
              drawingControlOptions: {
                position: google.maps.ControlPosition.TOP_CENTER,
                drawingModes: [google.maps.drawing.OverlayType.POLYGON],
              },
              polygonOptions: {
                fillColor: '#f9c406',
                fillOpacity: 0.3,
                strokeWeight: 2,
                strokeColor: '#f9c406',
                clickable: true,
                editable: true,
                zIndex: 1,
              },
            }}
          />
        )}

        {venues.map(venue => (
          <React.Fragment key={venue.id}>
            {venue.latitude && venue.longitude && (
              <Marker
                position={{ lat: Number(venue.latitude), lng: Number(venue.longitude) }}
                onClick={() => onVenueClick?.(venue)}
                title={venue.name}
                icon={{
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 10,
                    fillColor: activeSessions.has(venue.id) ? '#ef4444' : (selectedVenue?.id === venue.id ? '#f9c406' : '#3b82f6'),
                    fillOpacity: 1,
                    strokeWeight: 2,
                    strokeColor: '#ffffff',
                }}
              />
            )}
            {venue.boundary_coordinates && venue.boundary_coordinates.length >= 3 && (
              <Polygon
                paths={venue.boundary_coordinates.map(coord => ({ lat: coord[1], lng: coord[0] }))}
                onClick={() => onVenueClick?.(venue)}
                options={{
                  fillColor: selectedVenue?.id === venue.id ? '#f9c406' : (activeSessions.has(venue.id) ? '#ef4444' : '#6366f1'),
                  fillOpacity: selectedVenue?.id === venue.id ? 0.2 : 0.1,
                  strokeColor: selectedVenue?.id === venue.id ? '#f9c406' : (activeSessions.has(venue.id) ? '#ef4444' : '#6366f1'),
                  strokeWeight: selectedVenue?.id === venue.id ? 3 : 2,
                }}
              />
            )}
          </React.Fragment>
        ))}
      </GoogleMap>

      <div className="absolute top-4 right-12 z-10 flex flex-col gap-2">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl p-1 flex flex-col overflow-hidden">
            <button 
                onClick={() => setMapType(google.maps.MapTypeId.ROADMAP)}
                className={`p-2 rounded-lg transition-colors ${mapType === google.maps.MapTypeId.ROADMAP ? 'bg-primary text-black' : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
            >
                <MapIcon size={20} />
            </button>
            <button 
                onClick={() => setMapType(google.maps.MapTypeId.SATELLITE)}
                className={`p-2 rounded-lg transition-colors ${mapType === google.maps.MapTypeId.SATELLITE ? 'bg-primary text-black' : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
            >
                <Satellite size={20} />
            </button>
            <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-1 mx-2" />
            <button 
                onClick={() => map?.setCenter(center)}
                className="p-2 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
                <RefreshCw size={20} />
            </button>
        </div>
      </div>
    </div>
  );
};

export default VenueMap;
