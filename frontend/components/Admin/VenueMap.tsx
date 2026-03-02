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

export const VenueMap: React.FC<VenueMapProps> = ({
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
  const tooltipRef = useRef<maplibregl.Popup | null>(null);
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
          'circle-radius': 10,
          'circle-color': ['get', 'color'],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
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
    });

    // Click on empty area → create venue
    map.on('click', (e) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: ['venue-points-layer', 'venue-polygon-fill'],
      });
      if (features.length === 0) {
        onMapClickRef.current?.(e.lngLat.lat, e.lngLat.lng);
      }
    });

    // Click on venue point
    map.on('click', 'venue-points-layer', (e) => {
      if (!e.features?.length) return;
      const venueId = e.features[0].properties?.id as number;
      const venue = venuesRef.current.find((v) => v.id === venueId);
      if (venue) onVenueClickRef.current?.(venue);
    });

    // Click on venue polygon
    map.on('click', 'venue-polygon-fill', (e) => {
      if (!e.features?.length) return;
      const venueId = e.features[0].properties?.id as number;
      const venue = venuesRef.current.find((v) => v.id === venueId);
      if (venue) onVenueClickRef.current?.(venue);
    });

    // Hover tooltip – point layer
    map.on('mouseenter', 'venue-points-layer', (e) => {
      map.getCanvas().style.cursor = 'pointer';
      if (!e.features?.length) return;
      const name = e.features[0].properties?.name as string;
      tooltip
        .setLngLat(e.lngLat)
        .setHTML(
          `<div class="font-semibold text-sm">${name}</div>`,
        )
        .addTo(map);
    });
    map.on('mouseleave', 'venue-points-layer', () => {
      map.getCanvas().style.cursor = '';
      tooltip.remove();
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
      map.remove();
      mapRef.current = null;
      setMapReady(false);
    };
  }, [addSourcesAndLayers]);

  // Sync venue data to map
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    const pSrc = map.getSource('venue-points') as maplibregl.GeoJSONSource | undefined;
    const bSrc = map.getSource('venue-polygons') as maplibregl.GeoJSONSource | undefined;

    if (pSrc) pSrc.setData(buildPointGeoJSON(venues, activeSessions, selectedVenue?.id));
    if (bSrc) bSrc.setData(buildBoundaryGeoJSON(venues, activeSessions, selectedVenue?.id));

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
  }, [venues, activeSessions, selectedVenue, mapReady]);

  // Drawing mode
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    if (drawingMode) {
      if (!drawRef.current) {
        const draw = new MapboxDraw({
          displayControlsDefault: false,
          controls: { polygon: true, trash: true },
          defaultMode: 'draw_polygon',
          styles: [
            {
              id: 'gl-draw-polygon-fill',
              type: 'fill',
              filter: ['all', ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
              paint: { 'fill-color': '#f9c406', 'fill-opacity': 0.3 },
            },
            {
              id: 'gl-draw-polygon-stroke',
              type: 'line',
              filter: ['all', ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
              paint: { 'line-color': '#f9c406', 'line-width': 2 },
            },
            {
              id: 'gl-draw-polygon-vertex',
              type: 'circle',
              filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point']],
              paint: { 'circle-radius': 5, 'circle-color': '#f9c406' },
            },
          ],
        });

        map.addControl(draw as any);
        drawRef.current = draw;

        const handleCreate = (e: { features: GeoJSON.Feature[] }) => {
          if (!e.features?.length) return;
          const polygon = e.features[0].geometry as GeoJSON.Polygon;
          if (polygon.type !== 'Polygon') return;
          const ring = polygon.coordinates[0];
          // Close if needed, store as [[lng, lat]] (GeoJSON)
          const closed =
            ring.length > 0 &&
            (ring[0][0] !== ring[ring.length - 1][0] || ring[0][1] !== ring[ring.length - 1][1])
              ? [...ring, ring[0]]
              : ring;
          onBoundaryCompleteRef.current?.(closed);
          draw.deleteAll();
        };

        map.on('draw.create', handleCreate as any);
      }
    } else {
      if (drawRef.current) {
        try {
          map.removeControl(drawRef.current as any);
        } catch {
          // ignore
        }
        drawRef.current = null;
      }
    }
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
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
          <span className="bg-primary text-black text-xs font-semibold px-3 py-1.5 rounded-full shadow animate-pulse">
            Draw polygon on map — click to add vertices, double-click to finish
          </span>
        </div>
      )}
    </div>
  );
};

export default VenueMap;
