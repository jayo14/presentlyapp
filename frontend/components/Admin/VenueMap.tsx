import React, { useRef, useEffect, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import { Venue } from '../../types';
import { MapIcon, Satellite, RefreshCw, Search, X as CloseIcon } from 'lucide-react';

interface VenueMapProps {
  venues: Venue[];
  activeSessions?: Set<number>;
  onVenueClick?: (venue: Venue) => void;
  onMapClick?: (lat: number, lng: number) => void;
  selectedVenue?: Venue | null;
  drawingMode?: boolean;
  onBoundaryComplete?: (coordinates: number[][]) => void;
}

const DEFAULT_CENTER: [number, number] = [3.8936, 7.3775]; // [lng, lat]
const DEFAULT_ZOOM = 13;
const ROAD_STYLE = 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json';

const SATELLITE_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    satellite: {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      attribution:
        'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    },
  },
  layers: [{ id: 'satellite', type: 'raster', source: 'satellite' }],
};

/** Build point GeoJSON for venues that have lat/lng but no boundary */
function buildPointGeoJSON(
  venues: Venue[],
  activeSessions: Set<number>,
  selectedVenueId?: number,
): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: venues
      .filter((v) => v.latitude && v.longitude)
      .map((v) => ({
        type: 'Feature' as const,
        id: v.id,
        geometry: {
          type: 'Point' as const,
          coordinates: [Number(v.longitude), Number(v.latitude)],
        },
        properties: {
          id: v.id,
          name: v.name,
          color: activeSessions.has(v.id)
            ? '#ef4444'
            : v.id === selectedVenueId
            ? '#f9c406'
            : v.venue_color || '#3b82f6',
        },
      })),
  };
}

/** Build polygon GeoJSON using per-venue configurable display settings.
 *
 * `boundary_coordinates` is stored as **[lat, lng]** pairs (backend convention).
 * MapLibre GeoJSON requires **[lng, lat]** — we convert here.
 */
function buildBoundaryGeoJSON(
  venues: Venue[],
  activeSessions: Set<number>,
  selectedVenueId?: number,
): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: venues
      .filter((v) => v.boundary_coordinates && v.boundary_coordinates.length >= 3)
      .map((v) => {
        const isSelected = v.id === selectedVenueId;
        const isActive = activeSessions.has(v.id);
        const baseColor = isSelected
          ? '#f9c406'
          : isActive
          ? '#ef4444'
          : v.venue_color || '#6366f1';
        return {
          type: 'Feature' as const,
          id: v.id,
          geometry: {
            type: 'Polygon' as const,
            // boundary_coordinates stored as [lat,lng] pairs – convert to [lng,lat] for MapLibre
            coordinates: [
              v.boundary_coordinates!.map(([lat, lng]) => [lng, lat] as [number, number]),
            ],
          },
          properties: {
            id: v.id,
            name: v.name,
            fillColor: baseColor,
            fillOpacity: isSelected ? 0.35 : (v.venue_opacity ?? 0.15),
            strokeColor: baseColor,
            strokeWidth: isSelected ? 4 : (v.border_width ?? 2),
          },
        };
      }),
  };
}

export const VenueMap: React.FC<VenueMapProps> = React.memo(({
  venues,
  activeSessions = new Set(),
  onVenueClick,
  onMapClick,
  selectedVenue,
  drawingMode = false,
  onBoundaryComplete,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const drawRef = useRef<MapboxDraw | null>(null);
  const drawCreateHandlerRef = useRef<((e: { features: GeoJSON.Feature[] }) => void) | null>(null);
  const venueMarkersRef = useRef<maplibregl.Marker[]>([]);
  const tooltipRef = useRef<maplibregl.Popup | null>(null);
  const drawingModeRef = useRef(drawingMode);
  const [mapType, setMapType] = useState<'road' | 'satellite'>('road');
  const [mapReady, setMapReady] = useState(false);

  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Venue[]>([]);

  // Stable refs to avoid stale closures in event handlers
  const venuesRef = useRef(venues);
  const activeSessRef = useRef(activeSessions);
  const selectedVenueRef = useRef(selectedVenue);
  const onVenueClickRef = useRef(onVenueClick);
  const onMapClickRef = useRef(onMapClick);
  const onBoundaryCompleteRef = useRef(onBoundaryComplete);
  useEffect(() => { venuesRef.current = venues; }, [venues]);
  useEffect(() => { activeSessRef.current = activeSessions; }, [activeSessions]);
  useEffect(() => { selectedVenueRef.current = selectedVenue; }, [selectedVenue]);
  useEffect(() => { onVenueClickRef.current = onVenueClick; }, [onVenueClick]);
  useEffect(() => { onMapClickRef.current = onMapClick; }, [onMapClick]);
  useEffect(() => { onBoundaryCompleteRef.current = onBoundaryComplete; }, [onBoundaryComplete]);
  useEffect(() => { drawingModeRef.current = drawingMode; }, [drawingMode]);

  const clearVenueMarkers = useCallback(() => {
    venueMarkersRef.current.forEach((marker) => marker.remove());
    venueMarkersRef.current = [];
  }, []);

  const renderVenueMarkers = useCallback((map: maplibregl.Map) => {
    clearVenueMarkers();

    venuesRef.current
      .filter((venue) => venue.latitude && venue.longitude)
      .forEach((venue) => {
        const isSelected = selectedVenueRef.current?.id === venue.id;
        const isActive = activeSessRef.current.has(venue.id);
        const color = isSelected
          ? '#f9c406'
          : isActive
          ? '#ef4444'
          : venue.venue_color || '#3b82f6';

        const pin = document.createElement('button');
        pin.type = 'button';
        pin.className = 'focus:outline-none';
        pin.title = venue.name;
        pin.style.width = isSelected ? '22px' : '18px';
        pin.style.height = isSelected ? '22px' : '18px';
        pin.style.borderRadius = '9999px';
        pin.style.backgroundColor = color;
        pin.style.border = '2px solid #ffffff';
        pin.style.boxShadow = isSelected ? '0 0 0 2px rgba(249, 196, 6, 0.45)' : '0 1px 3px rgba(0,0,0,0.45)';
        pin.style.cursor = 'pointer';

        pin.addEventListener('click', (event) => {
          event.stopPropagation();
          onVenueClickRef.current?.(venue);
        });

        const marker = new maplibregl.Marker({ element: pin, anchor: 'bottom' })
          .setLngLat([Number(venue.longitude), Number(venue.latitude)])
          .addTo(map);

        venueMarkersRef.current.push(marker);
      });
  }, [clearVenueMarkers]);

  // Update search results when term changes
  useEffect(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      setSearchResults([]);
      return;
    }
    setSearchResults(
      venues.filter(
        (v) =>
          v.name.toLowerCase().includes(term) ||
          v.code?.toLowerCase().includes(term) ||
          v.building_name?.toLowerCase().includes(term),
      ).slice(0, 8),
    );
  }, [searchTerm, venues]);

  const flyToVenue = useCallback((venue: Venue) => {
    const map = mapRef.current;
    if (!map || !venue.latitude || !venue.longitude) return;
    map.flyTo({
      center: [Number(venue.longitude), Number(venue.latitude)],
      zoom: 17,
      speed: 1.4,
    });
    onVenueClickRef.current?.(venue);
  }, []);

  const addSourcesAndLayers = useCallback((map: maplibregl.Map) => {
    if (!map.getSource('venue-points')) {
      map.addSource('venue-points', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
    }
    if (!map.getSource('venue-polygons')) {
      map.addSource('venue-polygons', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
    }

    if (!map.getLayer('venue-polygon-fill')) {
      map.addLayer({
        id: 'venue-polygon-fill',
        type: 'fill',
        source: 'venue-polygons',
        paint: {
          'fill-color': ['get', 'fillColor'],
          'fill-opacity': ['get', 'fillOpacity'],
        },
      });
    }
    if (!map.getLayer('venue-polygon-outline')) {
      map.addLayer({
        id: 'venue-polygon-outline',
        type: 'line',
        source: 'venue-polygons',
        paint: {
          'line-color': ['get', 'strokeColor'],
          'line-width': ['get', 'strokeWidth'],
        },
      });
    }
    if (!map.getLayer('venue-points-layer')) {
      map.addLayer({
        id: 'venue-points-layer',
        type: 'circle',
        source: 'venue-points',
        paint: {
          'circle-radius': 0,
          'circle-color': ['get', 'color'],
          'circle-stroke-width': 0,
          'circle-stroke-color': '#ffffff',
        },
      });
    }

    // Add venue labels layer
    if (!map.getLayer('venue-labels')) {
      map.addLayer({
        id: 'venue-labels',
        type: 'symbol',
        source: 'venue-polygons',
        layout: {
          'text-field': ['get', 'name'],
          'text-font': ['Open Sans Regular'],
          'text-size': 12,
          'text-anchor': 'center',
          'text-offset': [0, 0],
          'text-allow-overlap': false,
          'text-ignore-placement': false,
        },
        paint: {
          'text-color': '#ffffff',
          'text-halo-color': '#000000',
          'text-halo-width': 2,
          'text-halo-blur': 1,
        },
      });
    }
  }, []);

  // Initialise map once
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: ROAD_STYLE,
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
    });

    map.addControl(new maplibregl.NavigationControl(), 'top-left');

    // Shared tooltip popup (no close button needed)
    const tooltip = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      className: 'venue-tooltip',
      maxWidth: '200px',
    });
    tooltipRef.current = tooltip;

    map.on('load', () => {
      addSourcesAndLayers(map);
      renderVenueMarkers(map);
      setMapReady(true);
    });

    map.on('style.load', () => {
      addSourcesAndLayers(map);
      const pSrc = map.getSource('venue-points') as maplibregl.GeoJSONSource | undefined;
      const bSrc = map.getSource('venue-polygons') as maplibregl.GeoJSONSource | undefined;
      if (pSrc)
        pSrc.setData(
          buildPointGeoJSON(venuesRef.current, activeSessRef.current, selectedVenueRef.current?.id),
        );
      if (bSrc)
        bSrc.setData(
          buildBoundaryGeoJSON(venuesRef.current, activeSessRef.current, selectedVenueRef.current?.id),
        );
      renderVenueMarkers(map);
    });

    // Click on empty area → create venue
    map.on('click', (e) => {
      if (drawingModeRef.current) return;
      const features = map.queryRenderedFeatures(e.point, {
        layers: ['venue-polygon-fill'],
      });
      if (features.length === 0) {
        onMapClickRef.current?.(e.lngLat.lat, e.lngLat.lng);
      }
    });

    // Click on venue polygon
    map.on('click', 'venue-polygon-fill', (e) => {
      if (!e.features?.length) return;
      const venueId = e.features[0].properties?.id as number;
      const venue = venuesRef.current.find((v) => v.id === venueId);
      if (venue) onVenueClickRef.current?.(venue);
    });

    // Hover tooltip – polygon layer
    map.on('mousemove', 'venue-polygon-fill', (e) => {
      map.getCanvas().style.cursor = 'pointer';
      if (!e.features?.length) return;
      const name = e.features[0].properties?.name as string;
      tooltip
        .setLngLat(e.lngLat)
        .setHTML(`<div class="font-semibold text-sm">${name}</div>`)
        .addTo(map);
    });
    map.on('mouseleave', 'venue-polygon-fill', () => {
      map.getCanvas().style.cursor = '';
      tooltip.remove();
    });

    mapRef.current = map;

    return () => {
      tooltip.remove();
      clearVenueMarkers();
      map.remove();
      mapRef.current = null;
      setMapReady(false);
    };
  }, [addSourcesAndLayers, clearVenueMarkers, renderVenueMarkers]);

  // Sync venue data to map
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    const pSrc = map.getSource('venue-points') as maplibregl.GeoJSONSource | undefined;
    const bSrc = map.getSource('venue-polygons') as maplibregl.GeoJSONSource | undefined;

    if (pSrc) pSrc.setData(buildPointGeoJSON(venues, activeSessions, selectedVenue?.id));
    if (bSrc) bSrc.setData(buildBoundaryGeoJSON(venues, activeSessions, selectedVenue?.id));
    renderVenueMarkers(map);

    // Fly to selected venue; otherwise fit bounds
    if (selectedVenue?.latitude && selectedVenue?.longitude) {
      map.flyTo({
        center: [Number(selectedVenue.longitude), Number(selectedVenue.latitude)],
        zoom: 16,
        speed: 1.2,
      });
    } else if (venues.length > 0) {
      const bounds = new maplibregl.LngLatBounds();
      venues.forEach((v) => {
        if (v.latitude && v.longitude) bounds.extend([Number(v.longitude), Number(v.latitude)]);
      });
      if (!bounds.isEmpty()) map.fitBounds(bounds, { padding: 60, maxZoom: 16 });
    }
  }, [venues, activeSessions, selectedVenue, mapReady, renderVenueMarkers]);

  // Drawing mode
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    let escapeHandler: ((e: KeyboardEvent) => void) | null = null;

    if (drawingMode) {
      // Set crosshair cursor to indicate drawing is active
      map.getCanvas().style.cursor = 'crosshair';

      if (!drawRef.current) {
        const draw = new MapboxDraw({
          displayControlsDefault: false,
          controls: {
            polygon: true,
            trash: true,
            line_string: false,
            point: false,
            combine_features: false,
            uncombine_features: false,
          },
          defaultMode: 'draw_polygon',
          styles: [
            // Polygon fill (active drawing)
            {
              id: 'gl-draw-polygon-fill-inactive',
              type: 'fill',
              filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
              paint: { 'fill-color': '#f9c406', 'fill-opacity': 0.2 },
            },
            {
              id: 'gl-draw-polygon-fill-active',
              type: 'fill',
              filter: ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
              paint: { 'fill-color': '#f9c406', 'fill-opacity': 0.3 },
            },
            // Polygon outline
            {
              id: 'gl-draw-polygon-stroke-inactive',
              type: 'line',
              filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
              layout: { 'line-cap': 'round', 'line-join': 'round' },
              paint: { 'line-color': '#f9c406', 'line-width': 2 },
            },
            {
              id: 'gl-draw-polygon-stroke-active',
              type: 'line',
              filter: ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
              layout: { 'line-cap': 'round', 'line-join': 'round' },
              paint: { 'line-color': '#f9c406', 'line-width': 3 },
            },
            // Line string (while drawing)
            {
              id: 'gl-draw-line',
              type: 'line',
              filter: ['all', ['==', '$type', 'LineString'], ['!=', 'mode', 'static']],
              layout: { 'line-cap': 'round', 'line-join': 'round' },
              paint: { 'line-color': '#f9c406', 'line-dasharray': [0.2, 2], 'line-width': 2 },
            },
            // Polygon midpoints
            {
              id: 'gl-draw-polygon-midpoint',
              type: 'circle',
              filter: ['all', ['==', '$type', 'Point'], ['==', 'meta', 'midpoint']],
              paint: { 'circle-radius': 4, 'circle-color': '#f9c406', 'circle-opacity': 0.7 },
            },
            // Vertices
            {
              id: 'gl-draw-polygon-and-line-vertex-stroke-inactive',
              type: 'circle',
              filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'mode', 'static']],
              paint: { 'circle-radius': 6, 'circle-color': '#ffffff' },
            },
            {
              id: 'gl-draw-polygon-and-line-vertex-inactive',
              type: 'circle',
              filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'mode', 'static']],
              paint: { 'circle-radius': 4, 'circle-color': '#f9c406' },
            },
            // Active vertex
            {
              id: 'gl-draw-polygon-and-line-vertex-active',
              type: 'circle',
              filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point']],
              paint: { 'circle-radius': 5, 'circle-color': '#f9c406' },
            },
          ],
        });

        // Add the control to the map
        map.addControl(draw as any, 'top-right');
        drawRef.current = draw;

        // Start drawing mode automatically
        setTimeout(() => {
          if (drawRef.current) {
            try {
              drawRef.current.changeMode('draw_polygon');
              console.log('Drawing mode activated - click to add vertices');
            } catch (error) {
              console.error('Failed to activate drawing mode:', error);
            }
          }
        }, 100);

        const handleCreate = (e: { features: GeoJSON.Feature[] }) => {
          if (!e.features?.length) return;
          const polygon = e.features[0].geometry as GeoJSON.Polygon;
          if (polygon.type !== 'Polygon') return;
          const ring = polygon.coordinates[0];
          // Close the ring if needed (GeoJSON ring is [lng, lat])
          const closed =
            ring.length > 0 &&
            (ring[0][0] !== ring[ring.length - 1][0] || ring[0][1] !== ring[ring.length - 1][1])
              ? [...ring, ring[0]]
              : ring;
          // Convert from GeoJSON [lng, lat] to backend [lat, lng] convention
          const latlng = closed.map(([lng, lat]) => [lat, lng] as [number, number]);
          onBoundaryCompleteRef.current?.(latlng);
          draw.deleteAll();
        };

        drawCreateHandlerRef.current = handleCreate;
        map.on('draw.create', handleCreate as any);

        // Add ESC key handler to cancel drawing
        escapeHandler = (e: KeyboardEvent) => {
          if (e.key === 'Escape' && drawRef.current) {
            drawRef.current.deleteAll();
            console.log('Drawing cancelled');
          }
        };
        window.addEventListener('keydown', escapeHandler);
      } else {
        // If draw control already exists, just change mode
        drawRef.current.deleteAll();
        setTimeout(() => {
          if (drawRef.current) {
            drawRef.current.changeMode('draw_polygon');
          }
        }, 50);
      }
    } else {
      // Restore default cursor
      map.getCanvas().style.cursor = '';

      if (drawRef.current) {
        try {
          if (drawCreateHandlerRef.current) {
            map.off('draw.create', drawCreateHandlerRef.current as any);
            drawCreateHandlerRef.current = null;
          }
          map.removeControl(drawRef.current as any);
        } catch {
          // ignore
        }
        drawRef.current = null;
      }
    }

    // Cleanup function
    return () => {
      if (escapeHandler) {
        window.removeEventListener('keydown', escapeHandler);
      }
    };
  }, [drawingMode, mapReady]);

  // Style switch
  useEffect(() => {
    mapRef.current?.setStyle(mapType === 'satellite' ? SATELLITE_STYLE : ROAD_STYLE);
  }, [mapType]);

  const handleReset = () =>
    mapRef.current?.flyTo({ center: DEFAULT_CENTER, zoom: DEFAULT_ZOOM });

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Search bar (top-left, above nav controls) */}
      <div className="absolute top-4 left-14 z-10 w-56 md:w-72">
        <div className="relative">
          <Search
            size={15}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search venues…"
            className="w-full pl-8 pr-8 py-1.5 text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {searchTerm && (
            <button
              onClick={() => { setSearchTerm(''); setSearchResults([]); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
            >
              <CloseIcon size={14} />
            </button>
          )}
        </div>

        {/* Dropdown results */}
        {searchResults.length > 0 && (
          <ul className="mt-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg overflow-hidden">
            {searchResults.map((v) => (
              <li key={v.id}>
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-2"
                  onClick={() => {
                    flyToVenue(v);
                    setSearchTerm('');
                    setSearchResults([]);
                  }}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: v.venue_color || '#6366f1' }}
                  />
                  <div>
                    <p className="font-medium text-foreground">{v.name}</p>
                    {v.building_name && (
                      <p className="text-xs text-zinc-400">{v.building_name}</p>
                    )}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Map-style / reset controls (top-right) */}
      <div className="absolute top-4 right-12 z-10 flex flex-col gap-2">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl p-1 flex flex-col overflow-hidden">
          <button
            onClick={() => setMapType('road')}
            className={`p-2 rounded-lg transition-colors ${
              mapType === 'road'
                ? 'bg-primary text-black'
                : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
            title="Road map"
          >
            <MapIcon size={20} />
          </button>
          <button
            onClick={() => setMapType('satellite')}
            className={`p-2 rounded-lg transition-colors ${
              mapType === 'satellite'
                ? 'bg-primary text-black'
                : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
            title="Satellite"
          >
            <Satellite size={20} />
          </button>
          <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-1 mx-2" />
          <button
            onClick={handleReset}
            className="p-2 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Reset view"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      {/* Drawing mode badge */}
      {drawingMode && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
          <span className="bg-primary text-black text-xs font-semibold px-4 py-2 rounded-full shadow-lg animate-pulse flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Draw Mode Active
          </span>
          <span className="bg-zinc-900 text-zinc-300 text-xs px-3 py-1.5 rounded-lg border border-zinc-700 shadow">
            Click to add vertices • Double-click to finish • ESC to cancel
          </span>
        </div>
      )}
    </div>
  );
});

VenueMap.displayName = 'VenueMap';

export default VenueMap;
