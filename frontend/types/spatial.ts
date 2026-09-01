export type LngLat = [number, number];

export type SpatialCategory = 
  | 'CAMPUS'
  | 'COLLEGE_ZONE'
  | 'BUILDING'
  | 'ROOM'
  | 'ROAD'
  | 'PEDESTRIAN_PATH'
  | 'ENTRANCE'
  | 'LANDMARK_POI'
  | 'PARKING'
  | 'FACILITY';

export type GeoJSONGeometryType = 'Point' | 'LineString' | 'Polygon' | 'MultiPolygon';

export interface GeoJSONPointGeometry {
  type: 'Point';
  coordinates: LngLat;
}

export interface GeoJSONLineStringGeometry {
  type: 'LineString';
  coordinates: LngLat[];
}

export interface GeoJSONPolygonGeometry {
  type: 'Polygon';
  coordinates: LngLat[][]; // outer ring + optional inner rings
}

export interface GeoJSONMultiPolygonGeometry {
  type: 'MultiPolygon';
  coordinates: LngLat[][][];
}

export type GeoJSONGeometry =
  | GeoJSONPointGeometry
  | GeoJSONLineStringGeometry
  | GeoJSONPolygonGeometry
  | GeoJSONMultiPolygonGeometry;

export interface Entrance {
  id: number;
  name: string;
  entrance_type: 'MAIN' | 'SIDE' | 'ACCESSIBLE' | 'EMERGENCY' | 'SERVICE';
  coordinates: LngLat;
  is_wheelchair_accessible: boolean;
  floor_level?: string;
}

export interface SpatialFeature {
  id: number;
  uuid: string;
  name: string;
  code?: string;
  slug?: string;
  category: SpatialCategory;
  subcategory?: string;
  description?: string;
  geometry_type: GeoJSONGeometryType;
  geojson_geometry: GeoJSONGeometry;
  derived_centroid: LngLat;
  derived_bbox: [number, number, number, number];
  derived_area_sqm?: number;
  derived_length_m?: number;
  elevation_m?: number;
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  state_province?: string;
  country?: string;
  parent?: number;
  institution?: number;
  college?: number;
  departments?: number[];

  verification_method: 'PHYSICAL_GEOMETRY' | 'RADIUS' | 'CUSTOM_POLYGON';
  verification_radius_m: number;
  custom_geofence_geometry?: GeoJSONGeometry;
  elevation_tolerance_m: number;

  label_position: LngLat;
  venue_color: string;
  venue_opacity: number;
  border_width: number;
  stroke_dasharray?: string;
  icon_name?: string;
  min_zoom: number;
  max_zoom: number;
  is_visible_on_map: boolean;

  source: string;
  source_provider?: string;
  mapping_method?: string;
  confidence_score: number;
  verification_status: 'UNVERIFIED' | 'VERIFIED' | 'FLAGGED';
  mapped_by?: string;
  mapped_at?: string;
  verified_by?: string;
  verified_at?: string;
  notes?: string;

  is_active: boolean;
  is_operational: boolean;
  access_restriction: 'PUBLIC' | 'STUDENTS_ONLY' | 'STAFF_ONLY' | 'RESTRICTED';
  created_at: string;
  updated_at: string;

  identity?: Record<string, any>;
  geometry?: Record<string, any>;
  location?: Record<string, any>;
  relationships?: Record<string, any>;
  properties?: Record<string, any>;
  navigation?: Record<string, any>;
  display?: Record<string, any>;
  geofence?: Record<string, any>;
  provenance?: Record<string, any>;
  lifecycle?: Record<string, any>;
}

export interface GeoJSONFeature {
  type: 'Feature';
  id?: number | string;
  geometry: GeoJSONGeometry;
  properties: {
    name: string;
    code?: string;
    category: SpatialCategory;
    subcategory?: string;
    description?: string;
    venue_color?: string;
    venue_opacity?: number;
    border_width?: number;
    verification_radius_m?: number;
    is_active?: boolean;
    canonical_details?: SpatialFeature;
    [key: string]: any;
  };
}

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}
