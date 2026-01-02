import React, { useState, useRef, useCallback, useEffect } from 'react';
import Map, { Marker, Source, Layer, NavigationControl, GeolocateControl } from 'react-map-gl/maplibre';
import { MapPin, Plus, X, Save, Edit2, Trash2, Activity } from 'lucide-react';
import { Venue } from '../../types';
import 'maplibre-gl/dist/maplibre-gl.css';

interface VenueMapProps {
  venues: Venue[];
  activeSessions?: Set<number>;
  onVenueClick?: (venue: Venue) => void;
  onMapClick?: (lat: number, lng: number) => void;
  selectedVenue?: Venue | null;
  drawingMode?: boolean;
  onBoundaryComplete?: (coordinates: number[][]) => void;
}

// Pulsing animation for active sessions
const pulsingDot = {
  width: 30,
  height: 30,
  data: new Uint8Array(30 * 30 * 4),
  
  onAdd: function(this: any) {
    const canvas = document.createElement('canvas');
    canvas.width = this.width;
    canvas.height = this.height;
    this.context = canvas.getContext('2d');
  },
  
  render: function(this: any) {
    const duration = 1000;
    const t = (performance.now() % duration) / duration;
    
    const radius = (this.width / 2) * 0.3;
    const outerRadius = (this.width / 2) * 0.7 * t + radius;
    const context = this.context;
    
    // Clear
    context.clearRect(0, 0, this.width, this.height);
    
    // Outer circle (pulsing)
    context.beginPath();
    context.arc(this.width / 2, this.height / 2, outerRadius, 0, Math.PI * 2);
    context.fillStyle = `rgba(139, 92, 246, ${1 - t})`;
    context.fill();
    
    // Inner circle
    context.beginPath();
    context.arc(this.width / 2, this.height / 2, radius, 0, Math.PI * 2);
    context.fillStyle = 'rgba(139, 92, 246, 1)';
    context.strokeStyle = 'white';
    context.lineWidth = 2;
    context.fill();
    context.stroke();
    
    // Update data
    this.data = context.getImageData(0, 0, this.width, this.height).data;
    
    // Request next frame
    return true;
  }
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
  const mapRef = useRef<any>(null);
  const [viewState, setViewState] = useState({
    longitude: 3.8936, // Default to Nigeria (Lagos)
    latitude: 7.3775,
    zoom: 6
  });
  const [hoveredVenue, setHoveredVenue] = useState<Venue | null>(null);
  const [boundaryPoints, setBoundaryPoints] = useState<number[][]>([]);
  const [isDrawing, setIsDrawing] = useState(false);

  // Initialize map with pulsing animation
  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (map && !map.hasImage('pulsing-dot')) {
      map.addImage('pulsing-dot', pulsingDot, { pixelRatio: 2 });
    }
  }, [mapRef.current]);

  // Center map on first venue if available
  useEffect(() => {
    if (venues.length > 0 && viewState.zoom === 6) {
      const firstVenue = venues[0];
      setViewState({
        longitude: firstVenue.longitude,
        latitude: firstVenue.latitude,
        zoom: 15
      });
    }
  }, [venues]);

  const handleMapClick = useCallback((event: any) => {
    const { lngLat } = event;
    
    if (drawingMode) {
      // Add point to boundary polygon
      const newPoint: number[] = [lngLat.lat, lngLat.lng];
      const updatedPoints = [...boundaryPoints, newPoint];
      setBoundaryPoints(updatedPoints);
      setIsDrawing(true);
    } else if (onMapClick) {
      // Regular click - for adding venue
      onMapClick(lngLat.lat, lngLat.lng);
    }
  }, [drawingMode, boundaryPoints, onMapClick]);

  const handleCompleteBoundary = () => {
    if (boundaryPoints.length >= 3) {
      // Close the polygon by adding first point at end
      const closedPolygon = [...boundaryPoints, boundaryPoints[0]];
      onBoundaryComplete?.(closedPolygon);
      setBoundaryPoints([]);
      setIsDrawing(false);
    }
  };

  const handleCancelBoundary = () => {
    setBoundaryPoints([]);
    setIsDrawing(false);
  };

  // Generate GeoJSON for boundary polygon being drawn
  const boundaryGeoJSON = {
    type: 'FeatureCollection',
    features: boundaryPoints.length > 0 ? [{
      type: 'Feature',
      geometry: {
        type: boundaryPoints.length > 2 ? 'Polygon' : 'LineString',
        coordinates: boundaryPoints.length > 2 
          ? [[...boundaryPoints.map(p => [p[1], p[0]]), [boundaryPoints[0][1], boundaryPoints[0][0]]]]
          : boundaryPoints.map(p => [p[1], p[0]])
      },
      properties: {}
    }] : []
  };

  // Generate GeoJSON for existing venue boundaries
  const venueBoundariesGeoJSON = {
    type: 'FeatureCollection',
    features: venues
      .filter(v => v.boundary_coordinates && v.boundary_coordinates.length > 2)
      .map(venue => ({
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [venue.boundary_coordinates!.map(coord => [coord[1], coord[0]])]
        },
        properties: {
          id: venue.id,
          name: venue.name,
          isActive: activeSessions.has(venue.id)
        }
      }))
  };

  return (
    <div className="relative w-full h-full">
      <Map
        ref={mapRef}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        onClick={handleMapClick}
        mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
        // Alternative open-source map styles:
        // OpenFreeMap: "https://tiles.openfreemap.org/styles/liberty"
        // CartoDB Positron: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
        // CartoDB Voyager: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
        style={{ width: '100%', height: '100%' }}
        cursor={drawingMode ? 'crosshair' : 'auto'}
      >
        <NavigationControl position="top-right" />
        <GeolocateControl
          position="top-right"
          trackUserLocation
          showUserHeading
        />

        {/* Render venue boundaries */}
        {venueBoundariesGeoJSON.features.length > 0 && (
          <>
            <Source id="venue-boundaries" type="geojson" data={venueBoundariesGeoJSON as any}>
              <Layer
                id="venue-boundaries-fill"
                type="fill"
                paint={{
                  'fill-color': [
                    'case',
                    ['get', 'isActive'],
                    'rgba(139, 92, 246, 0.2)',
                    'rgba(99, 102, 241, 0.1)'
                  ],
                  'fill-opacity': 0.5
                }}
              />
              <Layer
                id="venue-boundaries-line"
                type="line"
                paint={{
                  'line-color': [
                    'case',
                    ['get', 'isActive'],
                    'rgba(139, 92, 246, 1)',
                    'rgba(99, 102, 241, 0.8)'
                  ],
                  'line-width': 2
                }}
              />
            </Source>
          </>
        )}

        {/* Render boundary being drawn */}
        {isDrawing && boundaryPoints.length > 0 && (
          <Source id="drawing-boundary" type="geojson" data={boundaryGeoJSON as any}>
            <Layer
              id="drawing-boundary-fill"
              type="fill"
              paint={{
                'fill-color': 'rgba(239, 68, 68, 0.2)',
                'fill-opacity': 0.5
              }}
            />
            <Layer
              id="drawing-boundary-line"
              type="line"
              paint={{
                'line-color': 'rgba(239, 68, 68, 1)',
                'line-width': 2,
                'line-dasharray': [2, 2]
              }}
            />
          </Source>
        )}

        {/* Render venue markers */}
        {venues.map((venue) => {
          const isActive = activeSessions.has(venue.id);
          const isSelected = selectedVenue?.id === venue.id;
          const isHovered = hoveredVenue?.id === venue.id;

          return (
            <Marker
              key={venue.id}
              longitude={venue.longitude}
              latitude={venue.latitude}
              anchor="bottom"
            >
              <div
                className="relative cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onVenueClick?.(venue);
                }}
                onMouseEnter={() => setHoveredVenue(venue)}
                onMouseLeave={() => setHoveredVenue(null)}
              >
                {isActive ? (
                  <div className="relative">
                    <div className="absolute -inset-2 bg-primary/30 rounded-full animate-ping" />
                    <div className="relative w-8 h-8 bg-primary rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                      <Activity className="w-4 h-4 text-white" />
                    </div>
                  </div>
                ) : (
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 shadow-lg transition-all ${
                    isSelected || isHovered
                      ? 'bg-primary border-white scale-110'
                      : 'bg-zinc-800 border-zinc-600 hover:scale-105'
                  }`}>
                    <MapPin className={`w-4 h-4 ${isSelected || isHovered ? 'text-white' : 'text-zinc-400'}`} />
                  </div>
                )}

                {/* Hover tooltip */}
                {isHovered && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl whitespace-nowrap z-50">
                    <div className="text-xs">
                      <p className="font-semibold text-white">{venue.name}</p>
                      <p className="text-zinc-400">{venue.code}</p>
                      {venue.capacity && (
                        <p className="text-zinc-500 text-[10px]">Capacity: {venue.capacity}</p>
                      )}
                      {isActive && (
                        <p className="text-primary text-[10px] font-semibold mt-1">
                          🔴 Active Session
                        </p>
                      )}
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-zinc-700" />
                  </div>
                )}
              </div>
            </Marker>
          );
        })}

        {/* Render boundary points being drawn */}
        {boundaryPoints.map((point, index) => (
          <Marker
            key={`boundary-point-${index}`}
            longitude={point[1]}
            latitude={point[0]}
            anchor="center"
          >
            <div className="w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-lg" />
          </Marker>
        ))}
      </Map>

      {/* Drawing controls */}
      {isDrawing && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl p-4 flex items-center gap-3 z-10">
          <p className="text-sm text-white">
            Click to add points ({boundaryPoints.length} added)
          </p>
          <button
            onClick={handleCompleteBoundary}
            disabled={boundaryPoints.length < 3}
            className="px-3 py-1.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Complete
          </button>
          <button
            onClick={handleCancelBoundary}
            className="px-3 py-1.5 bg-zinc-800 text-white rounded-lg text-sm font-medium hover:bg-zinc-700 flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl p-3 z-10">
        <h4 className="text-xs font-semibold text-white mb-2">Legend</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-zinc-800 rounded-full border border-zinc-600" />
            <span className="text-xs text-zinc-400">Inactive Venue</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary rounded-full" />
            <span className="text-xs text-zinc-400">Active Session</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-indigo-500/20 border border-indigo-500" />
            <span className="text-xs text-zinc-400">Boundary</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VenueMap;
