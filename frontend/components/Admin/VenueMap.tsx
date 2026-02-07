import React, { useState, useRef, useEffect } from 'react';
import L from 'leaflet';
import '@geoman-io/leaflet-geoman-free';
import 'leaflet/dist/leaflet.css';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import { MapPin, X, Save, Layers, Map as MapIcon, Satellite, RefreshCw } from 'lucide-react';
import { Venue } from '../../types';
import { Button } from '../Button';

// Fix for default marker icons in Leaflet with Webpack/Vite
// @ts-ignore
if (typeof window !== 'undefined' && L.Icon.Default) {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
}

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

  const handleRefresh = () => {
    if (mapRef.current) {
      mapRef.current.invalidateSize();
      // If no venues, reset to default view
      if (venues.length === 0) {
        mapRef.current.setView([7.3775, 3.8936], 13);
      }
    }
  };

  // Initialize Map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
        center: [7.3775, 3.8936], // Nigeria (Ibadan/Lagos area)
        zoom: 13,
        zoomControl: false,
        fadeAnimation: true,
        markerZoomAnimation: true
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
        
        // Add click handler to the newly drawn polygon
        layer.on('click', (clickEvent: L.LeafletMouseEvent) => {
          L.DomEvent.stopPropagation(clickEvent);
          // Calculate center of polygon for venue marker
          const center = layer.getBounds().getCenter();
          onMapClick?.(center.lat, center.lng);
        });
        
        // Style the temporary polygon
        layer.setStyle({
          color: '#ffca0d',
          fillColor: '#ffca0d',
          fillOpacity: 0.2,
          weight: 2
        });
        
        // Callback with coordinates
        onBoundaryComplete?.(coords);
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
          color: isActive ? '#ef4444' : (isSelected ? '#ffca0d' : '#6366f1'),
          fillColor: isActive ? '#ef4444' : (isSelected ? '#ffca0d' : '#6366f1'),
          fillOpacity: isSelected ? 0.2 : 0.1,
          weight: isSelected ? 3 : 2,
          className: 'venue-polygon'
        }).addTo(map);

        // Add hover effect
        polygon.on('mouseover', function() {
          this.setStyle({ fillOpacity: 0.3, weight: 3 });
        });
        polygon.on('mouseout', function() {
          this.setStyle({ 
            fillOpacity: isSelected ? 0.2 : 0.1,
            weight: isSelected ? 3 : 2
          });
        });

        // Add click handler to polygon
        polygon.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          onVenueClick?.(venue);
        });

        // Enable editing for the selected venue's boundary
        if (isSelected) {
            polygon.pm.enable({
                allowSelfIntersection: false,
            });
            
            // Update boundary when edited
            polygon.on('pm:edit', (e: any) => {
                const updatedCoords = polygon.getLatLngs()[0].map((latlng: any) => [latlng.lat, latlng.lng]);
                onBoundaryComplete?.(updatedCoords);
            });
            
            // Show tooltip indicating editability
            polygon.bindTooltip('Click and drag vertices to edit boundary', { 
              sticky: true,
              className: 'custom-tooltip'
            });
        }

        layersRef.current[venue.id] = polygon;
      }
      
      // 3. Render Radius Circle (if radius is defined and no boundary polygon)
      if (venue.radius && venue.radius > 0 && (!venue.boundary_coordinates || venue.boundary_coordinates.length < 3)) {
        const circle = L.circle([venue.latitude, venue.longitude], {
          radius: venue.radius, // radius in meters
          color: isActive ? '#ef4444' : (isSelected ? '#ffca0d' : '#6366f1'),
          fillColor: isActive ? '#ef4444' : (isSelected ? '#ffca0d' : '#6366f1'),
          fillOpacity: isSelected ? 0.15 : 0.08,
          weight: isSelected ? 2.5 : 1.5,
          dashArray: '5, 5', // dashed circle for radius
          className: 'venue-radius-circle'
        }).addTo(map);

        // Add hover effect
        circle.on('mouseover', function() {
          this.setStyle({ fillOpacity: 0.25, weight: 2.5 });
        });
        circle.on('mouseout', function() {
          this.setStyle({ 
            fillOpacity: isSelected ? 0.15 : 0.08,
            weight: isSelected ? 2.5 : 1.5
          });
        });

        // Add click handler to circle
        circle.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          onVenueClick?.(venue);
        });

        // Add radius label tooltip
        const radiusText = venue.radius >= 1000 
          ? `${(venue.radius / 1000).toFixed(1)}km radius`
          : `${venue.radius}m radius`;
        circle.bindTooltip(radiusText, { 
          permanent: isSelected,
          direction: 'center',
          className: 'radius-label-tooltip'
        });

        layersRef.current[`${venue.id}_circle`] = circle;
      }
    });

    // Fit bounds whenever venues list changes (filtering)
    const currentMarkers = Object.values(markersRef.current);
    if (venues.length > 0 && currentMarkers.length > 0) {
        const group = L.featureGroup(currentMarkers);
        const bounds = group.getBounds();
        
        if (bounds.isValid()) {
            // If only one venue, zoom in closer
            if (venues.length === 1) {
                map.setView([venues[0].latitude, venues[0].longitude], 16, { animate: true });
            } else {
                map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16, animate: true });
            }
        }
    } else if (map.getZoom() <= 6) {
        // Reset to default view if no venues and we are zoomed out
        map.setView([7.3775, 3.8936], 13);
    }

  }, [venues, selectedVenue, activeSessions]);

  // Center on selected venue
  useEffect(() => {
    if (!mapRef.current || !selectedVenue) return;
    mapRef.current.setView([selectedVenue.latitude, selectedVenue.longitude], 16, { animate: true });
  }, [selectedVenue]);

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
            <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-1 mx-2" />
            <button 
                onClick={handleRefresh}
                className="p-2 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                title="Refresh Map"
            >
                <RefreshCw size={20} />
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
              <div>
                <p className="text-sm font-bold tracking-tight">Drawing Mode Active</p>
                <p className="text-xs text-zinc-400 mt-1">Click map to draw polygon • Click inside polygon to create venue</p>
              </div>
          </div>
      )}
      
      {selectedVenue && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-primary/90 text-black px-6 py-3 rounded-2xl shadow-2xl border-2 border-primary flex items-center gap-4 animate-in slide-in-from-top-4">
              <div className="w-2 h-2 bg-black rounded-full animate-pulse" />
              <div>
                <p className="text-sm font-bold tracking-tight">{selectedVenue.name} Selected</p>
                <p className="text-xs text-black/70 mt-1">Click and drag vertices to edit boundary • Changes saved automatically</p>
              </div>
          </div>
      )}
      
      <style>{`
        .custom-tooltip {
          background-color: rgba(0, 0, 0, 0.8);
          border: 1px solid #ffca0d;
          border-radius: 8px;
          padding: 6px 12px;
          font-size: 12px;
          font-weight: 600;
          color: #ffca0d;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
        }
        
        .radius-label-tooltip {
          background-color: rgba(0, 0, 0, 0.75);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 6px;
          padding: 4px 8px;
          font-size: 11px;
          font-weight: 600;
          color: white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .venue-polygon {
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .venue-polygon:hover {
          filter: brightness(1.2);
        }
        
        .venue-radius-circle {
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .venue-radius-circle:hover {
          filter: brightness(1.2);
        }
      `}</style>
    </div>
  );
};

export default VenueMap;