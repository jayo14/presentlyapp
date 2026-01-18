import React, { useState, useRef, useEffect } from 'react';
import L from 'leaflet';
import '@geoman-io/leaflet-geoman-free';
import 'leaflet/dist/leaflet.css';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import { MapPin, X, Save, Layers, Map as MapIcon, Satellite } from 'lucide-react';
import { Venue } from '../../types';
import { Button } from '../Button';

// Fix for default marker icons in Leaflet with Webpack/Vite
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface VenueMapProps {
  venues: Venue[];
  activeSessions?: Set<number>;
  onVenueClick?: (venue: Venue) => void;
  onMapClick?: (lat: number, lng: number) => void;
  selectedVenue?: Venue | null;
  drawingMode?: boolean;
  onBoundaryComplete?: (coordinates: number[][]) => void;
}

export const VenueMap: React.FC<VenueMapProps> = ({
  venues,
  activeSessions = new Set(),
  onVenueClick,
  onMapClick,
  selectedVenue,
  drawingMode = false,
  onBoundaryComplete
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mapType, setMapType] = useState<'osm' | 'satellite'>('osm');
  const layersRef = useRef<{ [key: string]: L.Layer }>({});
  const markersRef = useRef<{ [key: string]: L.Marker }>({});

  // Initialize Map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
        center: [7.3775, 3.8936], // Nigeria (Ibadan/Lagos area)
        zoom: 13,
        zoomControl: false // We'll add it in custom position
    });

    L.control.zoom({ position: 'topright' }).addTo(map);

    // Define Base Layers
    const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    });

    const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles © Esri'
    });

    osm.addTo(map);
    mapRef.current = map;

    // Trigger resize after a short delay to ensure container is fully rendered
    setTimeout(() => {
      map.invalidateSize();
    }, 250);

    // --- GEOMAN SETUP ---
    map.pm.addControls({
      position: 'topleft',
      drawCircle: false,
      drawCircleMarker: false,
      drawPolyline: false,
      drawRectangle: false,
      drawMarker: false,
      drawText: false,
      cutPolygon: false,
      rotateMode: false,
    });

    map.pm.setPathOptions({
      color: '#ffca0d',
      fillColor: '#ffca0d',
      fillOpacity: 0.2,
    });

    // Handle Creation
    map.on('pm:create', (e: any) => {
      const layer = e.layer;
      if (e.shape === 'Polygon') {
        const coords = layer.getLatLngs()[0].map((latlng: L.LatLng) => [latlng.lat, latlng.lng]);
        // Close polygon if needed by backend (usually backend expects explicit closure or handled there)
        onBoundaryComplete?.(coords);
        // Remove the temporary drawn layer, as it will be re-rendered from venues data
        map.removeLayer(layer);
      }
    });

    // Map Click for adding new venue markers
    map.on('click', (e: L.LeafletMouseEvent) => {
        if (!map.pm.globalDrawModeEnabled()) {
            onMapClick?.(e.latlng.lat, e.latlng.lng);
        }
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update Tile Layer
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    const osmUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    const satUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    L.tileLayer(mapType === 'osm' ? osmUrl : satUrl).addTo(map);
  }, [mapType]);

  // Handle Venues & Boundaries rendering
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // Clear existing markers and boundaries
    Object.values(markersRef.current).forEach(m => map.removeLayer(m));
    Object.values(layersRef.current).forEach(l => map.removeLayer(l));
    markersRef.current = {};
    layersRef.current = {};

    venues.forEach(venue => {
      const isActive = activeSessions.has(venue.id);
      const isSelected = selectedVenue?.id === venue.id;

      // 1. Render Marker
      const markerColor = isActive ? '#ef4444' : (isSelected ? '#ffca0d' : '#3b82f6');
      
      const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="
            background-color: ${markerColor}; 
            width: 32px; height: 32px; 
            border-radius: 50%; 
            border: 2px solid white; 
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
            display: flex; align-items: center; justify-content: center;
            color: white;
            position: relative;
        ">
            ${isActive ? '<span class="absolute inset-0 rounded-full animate-ping bg-red-500 opacity-75"></span>' : ''}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
        </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32]
      });

      const marker = L.marker([venue.latitude, venue.longitude], { icon: customIcon })
        .addTo(map)
        .on('click', (e) => {
            L.DomEvent.stopPropagation(e);
            onVenueClick?.(venue);
        });
      
      marker.bindTooltip(`<b>${venue.name}</b><br/>${venue.code}`, { direction: 'top', offset: [0, -32] });
      markersRef.current[venue.id] = marker;

      // 2. Render Boundary Polygon
      if (venue.boundary_coordinates && venue.boundary_coordinates.length >= 3) {
        const polygon = L.polygon(venue.boundary_coordinates as L.LatLngExpression[], {
          color: isActive ? '#ef4444' : '#6366f1',
          fillColor: isActive ? '#ef4444' : '#6366f1',
          fillOpacity: 0.1,
          weight: 2
        }).addTo(map);

        // Enable editing for the selected venue's boundary
        if (isSelected) {
            polygon.pm.enable({
                allowSelfIntersection: false,
            });
            polygon.on('pm:edit', (e: any) => {
                const updatedCoords = polygon.getLatLngs()[0].map((latlng: any) => [latlng.lat, latlng.lng]);
                onBoundaryComplete?.(updatedCoords);
            });
        }

        layersRef.current[venue.id] = polygon;
      }
    });

    // Fit bounds if we have venues and haven't zoomed in manually yet
    if (venues.length > 0 && map.getZoom() <= 6) {
        const group = L.featureGroup(Object.values(markersRef.current));
        map.fitBounds(group.getBounds().pad(0.1));
    }

  }, [venues, selectedVenue, activeSessions]);

  // Handle Drawing Mode
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    if (drawingMode) {
      map.pm.enableDraw('Polygon', {
        snappable: true,
        snapDistance: 20,
        allowSelfIntersection: false,
      });
    } else {
      map.pm.disableDraw();
    }
  }, [drawingMode]);

  // Handle Resize
  useEffect(() => {
    if (mapRef.current) {
      const timer = setTimeout(() => {
        mapRef.current?.invalidateSize();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [venues, selectedVenue]);

  return (
    <div className="relative w-full h-full group">
      <div ref={containerRef} className="w-full h-full z-0" />
      
      {/* Map Controls */}
      <div className="absolute top-4 right-12 z-[1000] flex flex-col gap-2">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl p-1 flex flex-col overflow-hidden">
            <button 
                onClick={() => setMapType('osm')}
                className={`p-2 rounded-lg transition-colors ${mapType === 'osm' ? 'bg-primary text-black' : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                title="Street Map"
            >
                <MapIcon size={20} />
            </button>
            <button 
                onClick={() => setMapType('satellite')}
                className={`p-2 rounded-lg transition-colors ${mapType === 'satellite' ? 'bg-primary text-black' : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                title="Satellite View"
            >
                <Satellite size={20} />
            </button>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-6 left-6 z-[1000] bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-4 min-w-[160px]">
        <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-3">Map Legend</h4>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-sm" />
            <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300">Venue</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-primary rounded-full border-2 border-white shadow-sm" />
            <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300">Selected</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
                <div className="w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-sm" />
                <div className="absolute -inset-1 bg-red-500/30 rounded-full animate-ping" />
            </div>
            <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300">Active Session</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-indigo-500/20 border-2 border-indigo-500 rounded-sm" />
            <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300">Boundary</span>
          </div>
        </div>
      </div>

      {drawingMode && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-zinc-900 text-white px-6 py-3 rounded-2xl shadow-2xl border border-zinc-800 flex items-center gap-4 animate-in slide-in-from-top-4">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <p className="text-sm font-bold tracking-tight">Drawing Mode Active</p>
              <div className="h-4 w-[1px] bg-zinc-700" />
              <p className="text-xs text-zinc-400">Click map to start drawing polygon</p>
          </div>
      )}
    </div>
  );
};

export default VenueMap;