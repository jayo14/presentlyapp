import React, { useRef, useEffect, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
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

function buildVenueGeoJSON(
  venues: Venue[],
  activeSessions: Set<number>,
  selectedVenueId?: number
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
            : '#3b82f6',
        },
      })),
  };
}

function buildBoundaryGeoJSON(
  venues: Venue[],
  activeSessions: Set<number>,
  selectedVenueId?: number
): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: venues
      .filter((v) => v.boundary_coordinates && v.boundary_coordinates.length >= 3)
      .map((v) => ({
        type: 'Feature' as const,
        id: v.id,
        geometry: {
          type: 'Polygon' as const,
          coordinates: [v.boundary_coordinates!],
        },
        properties: {
          id: v.id,
          name: v.name,
          fillColor:
            v.id === selectedVenueId
              ? '#f9c406'
              : activeSessions.has(v.id)
              ? '#ef4444'
              : '#6366f1',
          fillOpacity: v.id === selectedVenueId ? 0.2 : 0.1,
          strokeColor:
            v.id === selectedVenueId
              ? '#f9c406'
              : activeSessions.has(v.id)
              ? '#ef4444'
              : '#6366f1',
          strokeWidth: v.id === selectedVenueId ? 3 : 2,
        },
      })),
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
  const [mapType, setMapType] = useState<'road' | 'satellite'>('road');
  const [mapReady, setMapReady] = useState(false);

  // Stable references via refs to avoid stale closures in event handlers
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

  const addSourcesAndLayers = useCallback((map: maplibregl.Map) => {
    if (!map.getSource('venue-points')) {
      map.addSource('venue-points', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
    }
    if (!map.getSource('venue-polygons')) {
      map.addSource('venue-polygons', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
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

  // Initialise map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: ROAD_STYLE,
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
    });

    map.addControl(new maplibregl.NavigationControl(), 'top-left');

    map.on('load', () => {
      addSourcesAndLayers(map);
      setMapReady(true);
    });

    // Re-add sources/layers after style change, then restore venue data
    map.on('style.load', () => {
      addSourcesAndLayers(map);
      // Restore venue data after style change
      const pSource = map.getSource('venue-points') as maplibregl.GeoJSONSource | undefined;
      const bSource = map.getSource('venue-polygons') as maplibregl.GeoJSONSource | undefined;
      if (pSource) pSource.setData(buildVenueGeoJSON(venuesRef.current, activeSessRef.current, selectedVenueRef.current?.id));
      if (bSource) bSource.setData(buildBoundaryGeoJSON(venuesRef.current, activeSessRef.current, selectedVenueRef.current?.id));
    });

    // Map click (empty area)
    map.on('click', (e) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: ['venue-points-layer', 'venue-polygon-fill'],
      });
      if (features.length === 0) {
        onMapClickRef.current?.(e.lngLat.lat, e.lngLat.lng);
      }
    });

    // Venue point click
    map.on('click', 'venue-points-layer', (e) => {
      if (!e.features || e.features.length === 0) return;
      const venueId = e.features[0].properties?.id as number;
      const venue = venuesRef.current.find((v) => v.id === venueId);
      if (venue) onVenueClickRef.current?.(venue);
    });

    // Venue polygon click
    map.on('click', 'venue-polygon-fill', (e) => {
      if (!e.features || e.features.length === 0) return;
      const venueId = e.features[0].properties?.id as number;
      const venue = venuesRef.current.find((v) => v.id === venueId);
      if (venue) onVenueClickRef.current?.(venue);
    });

    // Cursor style
    map.on('mouseenter', 'venue-points-layer', () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', 'venue-points-layer', () => { map.getCanvas().style.cursor = ''; });
    map.on('mouseenter', 'venue-polygon-fill', () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', 'venue-polygon-fill', () => { map.getCanvas().style.cursor = ''; });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      setMapReady(false);
    };
  }, [addSourcesAndLayers]); // addSourcesAndLayers is stable (useCallback with no deps)

  // Update venue data when venues / activeSessions / selectedVenue change
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    const pointsSource = map.getSource('venue-points') as maplibregl.GeoJSONSource | undefined;
    const polygonsSource = map.getSource('venue-polygons') as maplibregl.GeoJSONSource | undefined;

    if (pointsSource) {
      pointsSource.setData(buildVenueGeoJSON(venues, activeSessions, selectedVenue?.id));
    }
    if (polygonsSource) {
      polygonsSource.setData(buildBoundaryGeoJSON(venues, activeSessions, selectedVenue?.id));
    }

    // Fit bounds to venues
    if (venues.length > 0) {
      const bounds = new maplibregl.LngLatBounds();
      venues.forEach((v) => {
        if (v.latitude && v.longitude) {
          bounds.extend([Number(v.longitude), Number(v.latitude)]);
        }
      });
      if (!bounds.isEmpty()) {
        if (selectedVenue?.latitude && selectedVenue?.longitude) {
          map.flyTo({ center: [Number(selectedVenue.longitude), Number(selectedVenue.latitude)], zoom: 15 });
        } else {
          map.fitBounds(bounds, { padding: 60, maxZoom: 16 });
        }
      }
    }
  }, [venues, activeSessions, selectedVenue, mapReady]);

  // Handle drawing mode
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
          if (!e.features || e.features.length === 0) return;
          const polygon = e.features[0].geometry as GeoJSON.Polygon;
          if (polygon.type !== 'Polygon') return;
          const ring = polygon.coordinates[0];
          // Close polygon if not closed
          const coords =
            ring.length > 0 &&
            (ring[0][0] !== ring[ring.length - 1][0] || ring[0][1] !== ring[ring.length - 1][1])
              ? [...ring, ring[0]]
              : ring;
          onBoundaryCompleteRef.current?.(coords);
          draw.deleteAll();
        };

        map.on('draw.create', handleCreate as any);
      }
    } else {
      if (drawRef.current) {
        try {
          map.removeControl(drawRef.current as any);
        } catch (err) {
          console.warn('Failed to remove draw control:', err);
        }
        drawRef.current = null;
      }
    }
  }, [drawingMode, mapReady]);

  // Handle map style (road vs satellite)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.setStyle(mapType === 'satellite' ? SATELLITE_STYLE : ROAD_STYLE);
  }, [mapType]);

  const handleReset = () => {
    const map = mapRef.current;
    if (!map) return;
    map.flyTo({ center: DEFAULT_CENTER, zoom: DEFAULT_ZOOM });
  };

  return (
    <div className="relative w-full h-full group">
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      <div className="absolute top-4 right-12 z-10 flex flex-col gap-2">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl p-1 flex flex-col overflow-hidden">
          <button
            onClick={() => setMapType('road')}
            className={`p-2 rounded-lg transition-colors ${mapType === 'road' ? 'bg-primary text-black' : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
            title="Road map"
          >
            <MapIcon size={20} />
          </button>
          <button
            onClick={() => setMapType('satellite')}
            className={`p-2 rounded-lg transition-colors ${mapType === 'satellite' ? 'bg-primary text-black' : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
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
    </div>
  );
};

export default VenueMap;
