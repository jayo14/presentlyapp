import React, { useRef, useEffect, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import { Venue } from '../../types';
import { MapIcon, Satellite, RefreshCw, Search, X as CloseIcon, Navigation, Loader2 } from 'lucide-react';
import { getIPLocation } from '../../services/geolocation';

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

// Mapbox Token from environment
const MAPBOX_TOKEN = (import.meta as any).env?.VITE_MAPBOX_TOKEN || '';

// Premium open-source map style (Google-like)
const ROAD_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

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
  const userMarkerRef = useRef<maplibregl.Marker | null>(null);
  const userAccuracyCircleRef = useRef<maplibregl.Marker | null>(null);
  const tooltipRef = useRef<maplibregl.Popup | null>(null);
  const drawingModeRef = useRef(drawingMode);
  const [mapType, setMapType] = useState<'road' | 'satellite'>('road');
  const [mapReady, setMapReady] = useState(false);
  const [showUserLocation, setShowUserLocation] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // Real-time user location tracking
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady || !showUserLocation) {
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
      if (userAccuracyCircleRef.current) {
        userAccuracyCircleRef.current.remove();
        userAccuracyCircleRef.current = null;
      }
      setIsLocating(false);
      return;
    }

    setIsLocating(true);
    let watchId: number;
    let fetchingIP = false;
    let innerIpMarker: maplibregl.Marker | null = null;
    const samples: { lat: number; lng: number; acc: number }[] = [];
    const SAMPLE_SIZE = 5;

    const onSuccess = (position: GeolocationPosition) => {
      const { latitude, longitude, accuracy } = position.coords;
      setIsLocating(false);

      let finalLat = latitude;
      let finalLng = longitude;
      let finalAcc = accuracy;
      let isIPFallback = false;

      // Handle IP Location fetch for fallback
      const ipLoc = (map as any)._ipLoc;
      if (!ipLoc && !fetchingIP && accuracy > 100) {
        fetchingIP = true;
        getIPLocation().then((loc) => {
          if (loc && mapReady) {
            (map as any)._ipLoc = loc;
            const el = document.createElement('div');
            el.className = 'ip-location-marker';
            el.innerHTML = '<div class="ip-marker-dot"></div>';
            innerIpMarker = new maplibregl.Marker({ element: el })
              .setLngLat([loc.longitude, loc.latitude])
              .setPopup(new maplibregl.Popup().setHTML(`<div class="text-xs font-bold p-1">IP Location: ${loc.city}</div>`))
              .addTo(map);
          }
          fetchingIP = false;
        });
      }

      // GPS Fallback Logic
      if (accuracy > 100) {
        if (ipLoc) {
          finalLat = ipLoc.latitude;
          finalLng = ipLoc.longitude;
          finalAcc = 5000;
          isIPFallback = true;
        } else {
          return;
        }
      }

      // Smooth valid GPS readings
      if (!isIPFallback) {
        samples.push({ lat: finalLat, lng: finalLng, acc: finalAcc });
        if (samples.length > SAMPLE_SIZE) samples.shift();
        finalLat = samples.reduce((sum, s) => sum + s.lat, 0) / samples.length;
        finalLng = samples.reduce((sum, s) => sum + s.lng, 0) / samples.length;
        finalAcc = samples.reduce((sum, s) => sum + s.acc, 0) / samples.length;
      }

      (map as any)._lastAccuracy = finalAcc;
      (map as any)._lastLat = finalLat;

      if (!userMarkerRef.current) {
        const el = document.createElement('div');
        el.className = 'user-location-marker';
        el.innerHTML = `
          <div class="user-location-container">
            <div class="user-location-label">
              ${samples.length < SAMPLE_SIZE && !isIPFallback ? '<span class="calibrating-text">Calibrating...</span>' : isIPFallback ? '<span class="text-indigo-400">Network Location</span>' : 'You'} 
              <span class="accuracy-badge">±${Math.round(finalAcc)}m</span>
            </div>
            <div class="marker-pulse"></div>
            <div class="marker-dot"></div>
          </div>
        `;
        userMarkerRef.current = new maplibregl.Marker({ element: el })
          .setLngLat([finalLng, finalLat])
          .addTo(map);

        const circleEl = document.createElement('div');
        circleEl.className = 'user-accuracy-circle';
        userAccuracyCircleRef.current = new maplibregl.Marker({ element: circleEl, pitchAlignment: 'map' })
          .setLngLat([finalLng, finalLat])
          .addTo(map);

        map.flyTo({
          center: [finalLng, finalLat],
          zoom: isIPFallback ? 14 : 18,
          speed: 1.2
        });
      } else {
        userMarkerRef.current.setLngLat([finalLng, finalLat]);
        const labelEl = userMarkerRef.current.getElement().querySelector('.user-location-label');
        if (labelEl) {
          labelEl.innerHTML = `
            ${samples.length < SAMPLE_SIZE && !isIPFallback ? '<span class="calibrating-text">Calibrating...</span>' : isIPFallback ? '<span class="text-indigo-300">Network Location</span>' : 'You'} 
            <span class="accuracy-badge">±${Math.round(finalAcc)}m</span>
          `;
        }
        if (userAccuracyCircleRef.current) {
          userAccuracyCircleRef.current.setLngLat([finalLng, finalLat]);
          updateAccuracyCircle(map, finalLat, finalAcc);
        }
      }
    };

    const updateAccuracyCircle = (mx: maplibregl.Map, lat: number, acc: number) => {
      if (!userAccuracyCircleRef.current) return;
      const metersPerPixel = (40075016.686 * Math.cos((lat * Math.PI) / 180)) / Math.pow(2, mx.getZoom() + 8);
      const radiusPx = acc / metersPerPixel;
      const circleEl = userAccuracyCircleRef.current.getElement();
      circleEl.style.width = `${radiusPx * 2}px`;
      circleEl.style.height = `${radiusPx * 2}px`;
    };

    const handleZoom = () => {
      if (mapRef.current && (mapRef.current as any)._lastAccuracy !== undefined) {
        updateAccuracyCircle(mapRef.current, (mapRef.current as any)._lastLat, (mapRef.current as any)._lastAccuracy);
      }
    };

    map.on('zoom', handleZoom);

    const onError = (error: GeolocationPositionError) => {
      setIsLocating(false);
      console.error('Geolocation error:', error);
      setShowUserLocation(false);
      const errorMsg = error.code === 1 ? 'Location access denied.' :
        error.code === 2 ? 'Location unavailable.' :
          'Location request timed out.';
      alert(`Failed to get location: ${errorMsg}`);
    };

    watchId = navigator.geolocation.watchPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      timeout: 20000,
      maximumAge: 0
    });

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
      if (mapRef.current) {
        mapRef.current.off('zoom', handleZoom);
        (mapRef.current as any)._ipLoc = null;
      }
      if (innerIpMarker) innerIpMarker.remove();
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
      if (userAccuracyCircleRef.current) {
        userAccuracyCircleRef.current.remove();
        userAccuracyCircleRef.current = null;
      }
    };
  }, [showUserLocation, mapReady]);

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
      .filter((venue) => activeSessRef.current.has(venue.id) || selectedVenueRef.current?.id === venue.id)
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
        pin.className = `focus:outline-none ${isActive ? 'session-active-marker' : ''}`;
        pin.title = venue.name;
        pin.style.width = isSelected ? '22px' : '18px';
        pin.style.height = isSelected ? '22px' : '18px';
        pin.style.borderRadius = '9999px';
        pin.style.backgroundColor = color;
        pin.style.border = '2px solid #ffffff';
        pin.style.boxShadow = isSelected ? '0 0 0 2px rgba(249, 196, 6, 0.45)' : '0 1px 3px rgba(0,0,0,0.45)';
        pin.style.cursor = 'pointer';
        pin.style.position = 'relative';

        if (isActive) {
          const pulse = document.createElement('div');
          pulse.className = 'session-marker-pulse';
          pin.appendChild(pulse);
        }

        // Create popup for hover
        const popup = new maplibregl.Popup({
          closeButton: false,
          closeOnClick: false,
          offset: [0, -20],
          className: 'venue-tooltip'
        }).setHTML(`<div class="px-2 py-1 text-xs font-bold bg-zinc-900 text-background rounded shadow-lg">${venue.name}</div>`);

        pin.addEventListener('mouseenter', () => {
          if (!drawingModeRef.current) {
            popup.setLngLat([Number(venue.longitude), Number(venue.latitude)]).addTo(map);
          }
        });

        pin.addEventListener('mouseleave', () => {
          popup.remove();
        });

        pin.addEventListener('click', (event) => {
          event.stopPropagation();
          onVenueClickRef.current?.(venue);
        });

        // Add hover listener for marker tooltip
        pin.addEventListener('mouseenter', () => {
          if (tooltipRef.current) {
            tooltipRef.current
              .setLngLat([Number(venue.longitude), Number(venue.latitude)])
              .setHTML(`<div class="px-2 py-1 font-semibold text-sm">${venue.name}</div>`)
              .addTo(map);
          }
        });

        pin.addEventListener('mouseleave', () => {
          if (tooltipRef.current) {
            tooltipRef.current.remove();
          }
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
    map.resize();
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
          'fill-antialias': true,
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
          'line-opacity': 1,
        },
      });
    }
    if (!map.getLayer('venue-points-layer')) {
      map.addLayer({
        id: 'venue-points-layer',
        type: 'circle',
        source: 'venue-points',
        paint: {
          'circle-radius': ['case', ['boolean', ['feature-state', 'selected'], false], 10, 6],
          'circle-color': ['get', 'color'],
          'circle-stroke-width': 3,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 0.8,
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
          'text-font': ['Arial Unicode MS', 'Open Sans Regular'],
          'text-size': 14,
          'text-anchor': 'center',
          'text-offset': [0, 0],
          'text-allow-overlap': true,
          'text-ignore-placement': false,
          'text-optional': true,
          'text-max-width': 8,
        },
        paint: {
          'text-color': '#ffffff',
          'text-halo-color': '#000000',
          'text-halo-width': 3,
          'text-halo-blur': 2,
          'text-opacity': 1,
        },
      });
    }

    // Add venue point labels (for venues with points only)
    if (!map.getLayer('venue-point-labels')) {
      map.addLayer({
        id: 'venue-point-labels',
        type: 'symbol',
        source: 'venue-points',
        layout: {
          'text-field': ['get', 'name'],
          'text-font': ['Arial Unicode MS', 'Open Sans Regular'],
          'text-size': 12,
          'text-anchor': 'top',
          'text-offset': [0, 1],
          'text-allow-overlap': true,
          'text-ignore-placement': false,
          'text-max-width': 8,
        },
        paint: {
          'text-color': '#ffffff',
          'text-halo-color': '#000000',
          'text-halo-width': 2,
          'text-halo-blur': 1,
          'text-opacity': 1,
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
      map.resize();
      window.setTimeout(() => map.resize(), 180);
      setMapReady(true);
    });

    map.on('style.load', () => {
      addSourcesAndLayers(map);
      const pSrc = map.getSource('venue-points') as maplibregl.GeoJSONSource | undefined;
      const bSrc = map.getSource('venue-polygons') as maplibregl.GeoJSONSource | undefined;
      if (pSrc)
        pSrc.setData(
          buildPointGeoJSON(venuesRef.current, activeSessRef.current as Set<number>, selectedVenueRef.current?.id),
        );
      if (bSrc)
        bSrc.setData(
          buildBoundaryGeoJSON(venuesRef.current, activeSessRef.current as Set<number>, selectedVenueRef.current?.id),
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

    // Click on venue points (for venues without boundaries)
    map.on('click', 'venue-points-layer', (e) => {
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

    // Hover tooltip – point layer
    map.on('mousemove', 'venue-points-layer', (e) => {
      map.getCanvas().style.cursor = 'pointer';
      if (!e.features?.length) return;
      const name = e.features[0].properties?.name as string;
      tooltip
        .setLngLat(e.lngLat)
        .setHTML(`<div class="font-semibold text-sm">${name}</div>`)
        .addTo(map);
    });
    map.on('mouseleave', 'venue-points-layer', () => {
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

  // Keep map viewport in sync with container/layout changes
  useEffect(() => {
    const map = mapRef.current;
    const container = mapContainerRef.current;
    if (!map || !container || !mapReady) return;

    const handleResize = () => map.resize();
    const observer = new ResizeObserver(handleResize);
    observer.observe(container);
    window.addEventListener('resize', handleResize);

    const rafId = window.requestAnimationFrame(handleResize);
    const timeoutId = window.setTimeout(handleResize, 200);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(timeoutId);
    };
  }, [mapReady]);

  // Sync venue data to map
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    map.resize();

    const pSrc = map.getSource('venue-points') as maplibregl.GeoJSONSource | undefined;
    const bSrc = map.getSource('venue-polygons') as maplibregl.GeoJSONSource | undefined;

    if (pSrc) pSrc.setData(buildPointGeoJSON(venues, activeSessions as Set<number>, selectedVenue?.id));
    if (bSrc) bSrc.setData(buildBoundaryGeoJSON(venues, activeSessions as Set<number>, selectedVenue?.id));

    // Only re-render markers for a subset if the list is large, or just always for safety
    // but now renderVenueMarkers only picks active/selected ones anyway.
    renderVenueMarkers(map);

    // Fly to selected venue; otherwise fit bounds ONLY if venues changed (not on every active session update)
    const venueCountChanged = venues.length !== (map as any)._lastVenueCount;
    (map as any)._lastVenueCount = venues.length;

    if (selectedVenue?.latitude && selectedVenue?.longitude) {
      map.flyTo({
        center: [Number(selectedVenue.longitude), Number(selectedVenue.latitude)],
        zoom: 16,
        speed: 1.2,
      });
    } else if (venues.length > 0 && venueCountChanged) {
      const bounds = new maplibregl.LngLatBounds();
      venues.forEach((v) => {
        if (v.latitude && v.longitude) bounds.extend([Number(v.longitude), Number(v.latitude)]);
      });
      if (!bounds.isEmpty()) {
        try {
          map.resize();
          map.fitBounds(bounds, { padding: 60, maxZoom: 16 });
        } catch (error) {
          // If map cannot fit bounds (e.g., too small container), fall back to first venue
          const firstVenue = venues.find(v => v.latitude && v.longitude);
          if (firstVenue) {
            map.flyTo({
              center: [Number(firstVenue.longitude), Number(firstVenue.latitude)],
              zoom: 14,
            });
          }
        }
      }
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
          },
          defaultMode: 'draw_polygon',
          styles: [
            // Polygon fill (while drawing and completed)
            {
              id: 'gl-draw-polygon-fill-inactive',
              type: 'fill',
              filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
              paint: { 'fill-color': '#f9c406', 'fill-opacity': 0.25 },
            },
            {
              id: 'gl-draw-polygon-fill-active',
              type: 'fill',
              filter: ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
              paint: { 'fill-color': '#f9c406', 'fill-opacity': 0.35 },
            },
            // Polygon outline (border)
            {
              id: 'gl-draw-polygon-stroke-inactive',
              type: 'line',
              filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
              layout: { 'line-cap': 'round', 'line-join': 'round' },
              paint: { 'line-color': '#f9c406', 'line-width': 3 },
            },
            {
              id: 'gl-draw-polygon-stroke-active',
              type: 'line',
              filter: ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
              layout: { 'line-cap': 'round', 'line-join': 'round' },
              paint: { 'line-color': '#f9c406', 'line-width': 4 },
            },
            // Line string (the active drawing line connecting vertices)
            {
              id: 'gl-draw-line-inactive',
              type: 'line',
              filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'LineString'], ['!=', 'mode', 'static']],
              layout: { 'line-cap': 'round', 'line-join': 'round' },
              paint: { 'line-color': '#f9c406', 'line-width': 3 },
            },
            {
              id: 'gl-draw-line-active',
              type: 'line',
              filter: ['all', ['==', 'active', 'true'], ['==', '$type', 'LineString']],
              layout: { 'line-cap': 'round', 'line-join': 'round' },
              paint: { 'line-color': '#f9c406', 'line-width': 3 },
            },
            // Midpoints (points between vertices for adding new points)
            {
              id: 'gl-draw-polygon-midpoint',
              type: 'circle',
              filter: ['all', ['==', '$type', 'Point'], ['==', 'meta', 'midpoint']],
              paint: {
                'circle-radius': 5,
                'circle-color': '#ffffff',
                'circle-stroke-color': '#f9c406',
                'circle-stroke-width': 2,
              },
            },
            // Vertices (the actual points you click)
            {
              id: 'gl-draw-polygon-and-line-vertex-stroke-inactive',
              type: 'circle',
              filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'mode', 'static']],
              paint: { 'circle-radius': 7, 'circle-color': '#ffffff' },
            },
            {
              id: 'gl-draw-polygon-and-line-vertex-inactive',
              type: 'circle',
              filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'mode', 'static']],
              paint: { 'circle-radius': 5, 'circle-color': '#f9c406' },
            },
            // Active vertex (the one being dragged or last placed)
            {
              id: 'gl-draw-point-stroke-active',
              type: 'circle',
              filter: ['all', ['==', '$type', 'Point'], ['==', 'active', 'true'], ['!=', 'meta', 'midpoint']],
              paint: { 'circle-radius': 8, 'circle-color': '#ffffff' },
            },
            {
              id: 'gl-draw-point-active',
              type: 'circle',
              filter: ['all', ['==', '$type', 'Point'], ['==', 'active', 'true'], ['!=', 'meta', 'midpoint']],
              paint: { 'circle-radius': 6, 'circle-color': '#f9c406' },
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

  // Style switch - need to re-add sources/layers after setStyle
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    const newStyle = mapType === 'satellite' ? SATELLITE_STYLE : ROAD_STYLE;

    // When we set a new style, all sources and layers are removed
    // We need to wait for the style to load, then re-add everything
    map.once('styledata', () => {
      // Re-add sources and layers
      addSourcesAndLayers(map);

      // Re-sync venue data
      const pSrc = map.getSource('venue-points') as maplibregl.GeoJSONSource | undefined;
      const bSrc = map.getSource('venue-polygons') as maplibregl.GeoJSONSource | undefined;

      if (pSrc) pSrc.setData(buildPointGeoJSON(venues, activeSessions as Set<number>, selectedVenue?.id));
      if (bSrc) bSrc.setData(buildBoundaryGeoJSON(venues, activeSessions as Set<number>, selectedVenue?.id));

      renderVenueMarkers(map);
    });

    map.setStyle(newStyle);
  }, [mapType, mapReady, addSourcesAndLayers, venues, activeSessions, selectedVenue, renderVenueMarkers]);

  const handleReset = () =>
    mapRef.current?.flyTo({ center: DEFAULT_CENTER, zoom: DEFAULT_ZOOM });

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      <div ref={mapContainerRef} className="w-full h-full" style={{ position: 'absolute', inset: 0 }} />

      {/* Search bar (top-left, above nav controls) */}
      <div className="absolute top-4 left-14 z-10 w-56 md:w-72">
        <div className="relative">
          <Search
            size={15}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-textMuted pointer-events-none"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search venues…"
            className="w-full pl-8 pr-8 py-1.5 text-sm bg-surface text-text border border-outline rounded-lg shadow text-text focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {searchTerm && (
            <button
              onClick={() => { setSearchTerm(''); setSearchResults([]); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-textMuted hover:text-textMuted"
            >
              <CloseIcon size={14} />
            </button>
          )}
        </div>

        {/* Dropdown results */}
        {searchResults.length > 0 && (
          <ul className="mt-1 bg-surface text-text border border-outline rounded-lg shadow-lg overflow-hidden">
            {searchResults.map((v) => (
              <li key={v.id}>
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 text-sm hover:bg-surfaceLow hover:text-textMuted transition-colors flex items-center gap-2"
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
                    <p className="font-medium text-text">{v.name}</p>
                    {v.building_name && (
                      <p className="text-xs text-textMuted">{v.building_name}</p>
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
        <div className="bg-surface text-text border border-outline rounded-xl shadow-xl flex flex-col overflow-hidden">
          <button
            onClick={() => setMapType('road')}
            className={`p-2 transition-colors flex items-center justify-center ${mapType === 'road'
              ? 'bg-primary text-black'
              : 'text-secondary hover:bg-inputccent hover:text-muted-foregroundccent-foreground'
              }`}
            title="Road Map"
          >
            <MapIcon size={20} />
          </button>
          <button
            onClick={() => setMapType('satellite')}
            className={`p-2 transition-colors flex items-center justify-center ${mapType === 'satellite'
              ? 'bg-primary text-black'
              : 'text-secondary hover:bg-inputccent hover:text-muted-foregroundccent-foreground'
              }`}
            title="Satellite View"
          >
            <Satellite size={20} />
          </button>
          <button
            onClick={() => setShowUserLocation(!showUserLocation)}
            className={`p-2 transition-colors flex items-center justify-center ${showUserLocation
              ? 'bg-blue-500 text-background'
              : 'text-secondary hover:bg-inputccent hover:text-muted-foregroundccent-foreground'
              }`}
            title={showUserLocation ? "Stop Tracking Location" : "Find My Location"}
          >
            {isLocating ? <Loader2 size={20} className="animate-spin" /> : <Navigation size={20} />}
          </button>
          <div className="h-px bg-surfaceLow" />
          <button
            onClick={handleReset}
            className="p-2 text-textMuted hover:bg-surfaceLow hover:text-textMuted transition-colors flex items-center justify-center"
            title="Reset View"
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
          <span className="bg-surface text-textMuted text-xs px-3 py-1.5 rounded-lg border border-outline shadow">
            Click to add vertices • Double-click to finish • ESC to cancel
          </span>
        </div>
      )}

      {/* Map Legend */}
      <div className="absolute bottom-4 right-4 z-10 bg-black/50 backdrop-blur-sm border border-outline rounded-lg shadow-lg p-3 flex flex-col gap-2 min-w-[140px]">
        <h4 className="font-headline text-[10px] font-bold uppercase tracking-wider text-textMuted">Map Legend</h4>

        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#ef4444] border border-white shadow-sm relative overflow-visible">
            <div className="absolute inset-0 rounded-full bg-[#ef4444] animate-ping opacity-40"></div>
          </div>
          <span className="text-xs font-medium text-text">Active Session</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#f9c406] border border-white shadow-sm"></div>
          <span className="text-xs font-medium text-text">Selected Venue</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#3b82f6] border border-white shadow-sm"></div>
          <span className="text-xs font-medium text-text">Regular Venue</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#a855f7] border border-white shadow-sm transform rotate-45"></div>
          <span className="text-xs font-medium text-text">Your Location</span>
        </div>
      </div>

      <style>{`
        .venue-tooltip .maplibregl-popup-content {
          background-color: #18181b;
          color: white;
          border: 1px solid #27272a;
          border-radius: 8px;
          padding: 0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        .venue-tooltip .maplibregl-popup-tip {
          border-top-color: #18181b;
        }

        .session-marker-pulse {
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          border-radius: 9999px;
          background-color: rgba(239, 68, 68, 0.4);
          z-index: -1;
          animation: session-pulse 2s infinite;
        }

        @keyframes session-pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(3);
            opacity: 0;
          }
        }

        .user-location-marker {
          position: relative;
        }
        .user-accuracy-circle {
          background-color: rgba(168, 85, 247, 0.15);
          border: 1px solid rgba(168, 85, 247, 0.4);
          border-radius: 50%;
          pointer-events: none;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .user-location-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
        }
        .user-location-label {
          background-color: #a855f7;
          color: white;
          font-size: 10px;
          font-weight: bold;
          padding: 2px 8px;
          border-radius: 6px;
          margin-bottom: 4px;
          white-space: nowrap;
          box-shadow: 0 2px 8px rgba(0,0,0,0.4);
          border: 1px solid rgba(255,255,255,0.3);
          z-index: 3;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .calibrating-text {
          opacity: 0.8;
          font-style: italic;
          animation: pulse-op 1.5s infinite;
        }
        @keyframes pulse-op {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        .accuracy-badge {
          background-color: rgba(255,255,255,0.2);
          padding: 1px 4px;
          border-radius: 3px;
          font-size: 8px;
          opacity: 0.9;
        }
        .marker-dot {
          width: 14px;
          height: 14px;
          background-color: #a855f7;
          border: 2px solid white;
          border-radius: 2px;
          transform: rotate(45deg);
          box-shadow: 0 0 4px rgba(0,0,0,0.3);
          z-index: 2;
        }
        .marker-pulse {
          position: absolute;
          width: 20px;
          height: 20px;
          background-color: rgba(168, 85, 247, 0.4);
          border-radius: 50%;
          z-index: 1;
          bottom: -3px;
          animation: pulse-marker 2s ease-out infinite;
        }
        @keyframes pulse-marker {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(3.5);
            opacity: 0;
          }
        }

        .ip-location-marker {
          z-index: 1;
        }
        .ip-marker-dot {
          width: 10px;
          height: 10px;
          background-color: #6366f1;
          border: 2px solid white;
          border-radius: 50%;
          box-shadow: 0 0 4px rgba(0,0,0,0.3);
          opacity: 0.6;
        }
      `}</style>
    </div>
  );
});

VenueMap.displayName = 'VenueMap';

export default VenueMap;
