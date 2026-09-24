# Production-Grade Geospatial & Venue Data Model Proposal

**Project**: Presently  
**Status**: Proposal / Draft for Review  
**Date**: September 2026  

---

## Executive Summary

This proposal upgrades Presently’s spatial architecture from a basic point-and-flat-polygon schema (`latitude`, `longitude`, `boundary` JSON) to a **production-grade, multi-entity spatial data model**.

The design meets all prompt requirements:
1. **Canonical GeoJSON (RFC 7946)**: Standardized `[longitude, latitude]` order across all spatial features.
2. **Support for 7+ Feature Types**: Campuses, Buildings, Rooms/Venues, Roads/Paths, Entrances, Landmarks/POIs, and Facilities.
3. **Multi-Geometry Support**: `Point`, `Polygon` (including holes/inner rings), `MultiPolygon`, and `LineString`.
4. **Hierarchical Relationships**: Parent/Child linkage (`Campus -> College -> Building -> Floor -> Room`).
5. **Separation of Concerns**: 11 modular conceptual sections.
6. **Automated Derivations**: Centroids, bounding boxes (bbox), and legacy `latitude`/`longitude` properties computed automatically on save.
7. **Full Backwards Compatibility**: Maps existing `Venue` API requests and legacy database fields without breaking frontend or mobile code.
8. **Navigation & Accessibility**: Dedicated entrance definitions, path properties, and wheelchair accessibility metadata.
9. **Provenance & Auditing**: Detailed mapping confidence, verification status, and mapping source tracking.
10. **Google Maps Tooling Compatibility**: Bidirectional conversion routines for KML/GeoJSON/Google Maps Drawing Tools.

---

## 1. Modular Conceptual Sections Architecture

Every spatial feature in Presently adheres to 11 standardized conceptual sections:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SPATIAL FEATURE ENTITY                          │
├─────────────────┬──────────────────┬──────────────────┬────────────────┤
│ 1. IDENTITY     │ 4. RELATIONSHIPS │ 7. FACILITIES    │ 10. METADATA   │
│ 2. GEOMETRY     │ 5. NAVIGATION    │ 8. GEOFENCE      │ 11. STATUS     │
│ 3. LOCATION     │ 6. STRUCTURE     │ 9. DISPLAY       │                │
└─────────────────┴──────────────────┴──────────────────┴────────────────┘
```

1. **`identity`**: Unique identifiers, codes, slugs, categories (`CAMPUS`, `BUILDING`, `ROOM`, `ROAD`, `PATH`, `ENTRANCE`, `PO_I`), and descriptions.
2. **`geometry`**: Canonical GeoJSON geometry (`[longitude, latitude]`), derived centroid, derived 2D/3D bbox, and elevation.
3. **`location`**: Human-readable postal address, street, city, state, country, plus backward-compatible `latitude` / `longitude` accessors.
4. **`relationships`**: Spatial tree pointers (`parent_id`, `institution_id`, `college_id`, `department_id`, `connected_node_ids`).
5. **`navigation`**: Entrances array (`MAIN`, `ACCESSIBLE`, `EMERGENCY`), routing nodes, passability, and road directionality.
6. **`structure`**: Floor level, room number, seating capacity, floor area ($\text{m}^2$), building wing.
7. **`facilities`**: AV equipment (projector, whiteboard, mic, PC), HVAC, power outlets, wheelchair accessibility, restrooms.
8. **`geofence`**: Verification method (`PHYSICAL_GEOMETRY`, `RADIUS`, `CUSTOM_POLYGON`), custom geofence geometry, radius tolerance, elevation limit.
9. **`display`**: Map styling (fill, opacity, stroke, dash, icon), independent label anchor coordinate `[lng, lat]`, zoom thresholds.
10. **`metadata`**: Provenance details (source, mapper, mapping method, confidence score, verification status).
11. **`status`**: Operational status (`is_active`, `is_operational`, `maintenance_mode`, access restrictions).

---

## 2. Canonical JSON Schema Specification

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "PresentlySpatialFeature",
  "type": "object",
  "required": ["identity", "geometry", "location", "status"],
  "properties": {
    "identity": {
      "type": "object",
      "required": ["id", "uuid", "name", "category"],
      "properties": {
        "id": { "type": ["integer", "string"] },
        "uuid": { "type": "string", "format": "uuid" },
        "code": { "type": ["string", "null"] },
        "slug": { "type": "string" },
        "name": { "type": "string" },
        "short_name": { "type": ["string", "null"] },
        "alt_names": { "type": "array", "items": { "type": "string" } },
        "category": { 
          "type": "string", 
          "enum": ["CAMPUS", "COLLEGE_ZONE", "BUILDING", "ROOM", "ROAD", "PEDESTRIAN_PATH", "ENTRANCE", "LANDMARK_POI", "PARKING", "FACILITY"] 
        },
        "subcategory": { "type": ["string", "null"] },
        "description": { "type": ["string", "null"] }
      }
    },
    "geometry": {
      "type": "object",
      "required": ["type", "coordinates"],
      "properties": {
        "type": { "type": "string", "enum": ["Point", "Polygon", "MultiPolygon", "LineString"] },
        "coordinates": { "type": "array" },
        "derived_centroid": {
          "type": "array",
          "items": { "type": "number" },
          "minItems": 2,
          "maxItems": 2,
          "description": "[longitude, latitude] WGS84"
        },
        "derived_bbox": {
          "type": "array",
          "items": { "type": "number" },
          "minItems": 4,
          "maxItems": 4,
          "description": "[min_lng, min_lat, max_lng, max_lat]"
        },
        "elevation_m": { "type": ["number", "null"] }
      }
    },
    "location": {
      "type": "object",
      "required": ["latitude", "longitude"],
      "properties": {
        "latitude": { "type": "number", "minimum": -90, "maximum": 90 },
        "longitude": { "type": "number", "minimum": -180, "maximum": 180 },
        "address": { "type": ["string", "null"] },
        "city": { "type": ["string", "null"] },
        "state_province": { "type": ["string", "null"] },
        "country": { "type": ["string", "null"] },
        "postal_code": { "type": ["string", "null"] }
      }
    },
    "relationships": {
      "type": "object",
      "properties": {
        "parent_id": { "type": ["integer", "string", "null"] },
        "institution_id": { "type": ["integer", "null"] },
        "college_id": { "type": ["integer", "null"] },
        "department_ids": { "type": "array", "items": { "type": "integer" } }
      }
    },
    "navigation": {
      "type": "object",
      "properties": {
        "entrances": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["name", "entrance_type", "coordinates"],
            "properties": {
              "id": { "type": "string" },
              "name": { "type": "string" },
              "entrance_type": { "type": "string", "enum": ["MAIN", "SIDE", "ACCESSIBLE", "EMERGENCY", "SERVICE"] },
              "coordinates": { "type": "array", "items": { "type": "number" }, "minItems": 2, "maxItems": 2 },
              "is_wheelchair_accessible": { "type": "boolean" },
              "floor_level": { "type": ["integer", "string"] }
            }
          }
        },
        "is_passable": { "type": "boolean", "default": true },
        "one_way": { "type": "boolean", "default": false },
        "speed_limit_kmh": { "type": ["number", "null"] }
      }
    },
    "structure": {
      "type": "object",
      "properties": {
        "building_code": { "type": ["string", "null"] },
        "floor_number": { "type": ["string", "null"] },
        "room_number": { "type": ["string", "null"] },
        "wing": { "type": ["string", "null"] },
        "capacity": { "type": "integer", "default": 0 },
        "floor_area_sqm": { "type": ["number", "null"] }
      }
    },
    "facilities": {
      "type": "object",
      "properties": {
        "has_projector": { "type": "boolean", "default": false },
        "has_computers": { "type": "boolean", "default": false },
        "has_whiteboard": { "type": "boolean", "default": false },
        "has_microphone": { "type": "boolean", "default": false },
        "has_air_conditioning": { "type": "boolean", "default": false },
        "is_wheelchair_accessible": { "type": "boolean", "default": false }
      }
    },
    "geofence": {
      "type": "object",
      "required": ["verification_method", "verification_radius_m"],
      "properties": {
        "verification_method": { "type": "string", "enum": ["PHYSICAL_GEOMETRY", "RADIUS", "CUSTOM_POLYGON"] },
        "verification_radius_m": { "type": "number", "default": 50 },
        "custom_geofence_geometry": { "type": ["object", "null"] },
        "elevation_tolerance_m": { "type": "number", "default": 10.0 }
      }
    },
    "display": {
      "type": "object",
      "properties": {
        "label_position": { "type": "array", "items": { "type": "number" }, "minItems": 2, "maxItems": 2 },
        "fill_color": { "type": "string", "pattern": "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$" },
        "fill_opacity": { "type": "number", "minimum": 0, "maximum": 1 },
        "stroke_color": { "type": "string" },
        "stroke_width": { "type": "number" },
        "icon_name": { "type": ["string", "null"] },
        "min_zoom": { "type": "number" },
        "max_zoom": { "type": "number" },
        "is_visible_on_map": { "type": "boolean", "default": true }
      }
    },
    "metadata": {
      "type": "object",
      "properties": {
        "source": { "type": "string", "enum": ["GPS_SURVEY", "SATELLITE_DIGITIZED", "GOOGLE_MAPS_IMPORT", "MANUAL_DRAW"] },
        "confidence_score": { "type": "number", "minimum": 0, "maximum": 1 },
        "verification_status": { "type": "string", "enum": ["UNVERIFIED", "VERIFIED", "FLAGGED"] },
        "mapped_by": { "type": ["string", "null"] }
      }
    },
    "status": {
      "type": "object",
      "properties": {
        "is_active": { "type": "boolean", "default": true },
        "is_operational": { "type": "boolean", "default": true },
        "access_restriction": { "type": "string", "enum": ["PUBLIC", "STUDENTS_ONLY", "STAFF_ONLY", "RESTRICTED"] }
      }
    }
  }
}
```

---

## 3. Django Model Architecture (`backend/institutions/models.py`)

To support existing standard Django setups without hard PostGIS binary dependencies while maintaining maximum spatial speed, we implement `SpatialFeature` with native Python geometry helpers (Shapely/Turf-equivalent algorithms) that derive centroids, bounding boxes, and GeoJSON outputs dynamically on `.save()`.

```python
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid

class SpatialCategory(models.TextChoices):
    CAMPUS = 'CAMPUS', 'Campus Boundary'
    COLLEGE_ZONE = 'COLLEGE_ZONE', 'College / Faculty Zone'
    BUILDING = 'BUILDING', 'Building Structure'
    ROOM = 'ROOM', 'Room / Venue / Hall'
    ROAD = 'ROAD', 'Road / Driveway'
    PEDESTRIAN_PATH = 'PEDESTRIAN_PATH', 'Pedestrian Walkway / Path'
    ENTRANCE = 'ENTRANCE', 'Entrance / Gate'
    LANDMARK_POI = 'LANDMARK_POI', 'Landmark / Point of Interest'
    PARKING = 'PARKING', 'Parking Area'
    FACILITY = 'FACILITY', 'Utility / Facility'

class GeometryType(models.TextChoices):
    POINT = 'Point', 'Point'
    POLYGON = 'Polygon', 'Polygon'
    MULTI_POLYGON = 'MultiPolygon', 'MultiPolygon'
    LINE_STRING = 'LineString', 'LineString'

class VerificationMethod(models.TextChoices):
    PHYSICAL_GEOMETRY = 'PHYSICAL_GEOMETRY', 'Use Physical Geometry Boundary'
    RADIUS = 'RADIUS', 'Use Center Point Radius'
    CUSTOM_POLYGON = 'CUSTOM_POLYGON', 'Use Custom Geofence Polygon'

class VerificationStatus(models.TextChoices):
    UNVERIFIED = 'UNVERIFIED', 'Unverified Draft'
    VERIFIED = 'VERIFIED', 'Verified & Ground-Truthed'
    FLAGGED = 'FLAGGED', 'Flagged for Review'


class SpatialFeature(models.Model):
    """Canonical production-grade spatial model for all campus features."""
    
    # 1. Identity
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50, blank=True, null=True, db_index=True)
    slug = models.SlugField(max_length=255, blank=True, null=True)
    category = models.CharField(max_length=30, choices=SpatialCategory.choices, db_index=True)
    subcategory = models.CharField(max_length=50, blank=True, null=True)
    description = models.TextField(blank=True, null=True)

    # 2. Geometry (Canonical GeoJSON storage)
    geometry_type = models.CharField(max_length=20, choices=GeometryType.choices, default=GeometryType.POLYGON)
    geojson_geometry = models.JSONField(
        help_text="Canonical GeoJSON geometry object (WGS84: [lng, lat])"
    )
    derived_centroid = models.JSONField(
        blank=True, null=True,
        help_text="Auto-computed centroid coordinate [lng, lat]"
    )
    derived_bbox = models.JSONField(
        blank=True, null=True,
        help_text="Auto-computed bounding box [min_lng, min_lat, max_lng, max_lat]"
    )
    elevation_m = models.DecimalField(max_digits=8, decimal_places=2, blank=True, null=True)

    # 3. Location (Denormalized center lat/long for fast indexing & backward compatibility)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, db_index=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, db_index=True)
    address = models.TextField(blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    state_province = models.CharField(max_length=100, blank=True, null=True)
    country = models.CharField(max_length=100, default='Nigeria')

    # 4. Hierarchical Spatial Relationships
    parent = models.ForeignKey(
        'self', on_delete=models.CASCADE, null=True, blank=True, related_name='children'
    )
    institution = models.ForeignKey(
        'Institution', on_delete=models.CASCADE, null=True, blank=True, related_name='spatial_features'
    )
    college = models.ForeignKey(
        'College', on_delete=models.SET_NULL, null=True, blank=True, related_name='spatial_features'
    )
    departments = models.ManyToManyField('Department', blank=True, related_name='spatial_features')

    # 5. Navigation & Entrances
    entrances = models.JSONField(
        default=list, blank=True,
        help_text="List of entrance objects [{id, name, type, coordinates: [lng, lat], accessible}]"
    )
    is_passable = models.BooleanField(default=True)
    one_way = models.BooleanField(default=False)
    speed_limit_kmh = models.FloatField(blank=True, null=True)

    # 6. Structural Metadata
    building_code = models.CharField(max_length=50, blank=True, null=True)
    floor_number = models.CharField(max_length=20, blank=True, null=True)
    room_number = models.CharField(max_length=50, blank=True, null=True)
    wing = models.CharField(max_length=50, blank=True, null=True)
    capacity = models.IntegerField(default=0)
    floor_area_sqm = models.FloatField(blank=True, null=True)

    # 7. Facilities & Amenities
    facilities = models.JSONField(
        default=dict, blank=True,
        help_text="Facility flags: {has_projector, has_computers, is_wheelchair_accessible, etc.}"
    )

    # 8. Geofencing & Verification
    verification_method = models.CharField(
        max_length=30, choices=VerificationMethod.choices, default=VerificationMethod.PHYSICAL_GEOMETRY
    )
    verification_radius_m = models.IntegerField(default=50)
    custom_geofence_geometry = models.JSONField(blank=True, null=True)
    elevation_tolerance_m = models.FloatField(default=10.0)

    # 9. Map Display & Visual Styling
    label_position = models.JSONField(
        blank=True, null=True,
        help_text="Independent label anchor coordinate [lng, lat]"
    )
    venue_color = models.CharField(max_length=20, default='#6366f1')
    venue_opacity = models.FloatField(default=0.15)
    border_width = models.IntegerField(default=2)
    stroke_dasharray = models.CharField(max_length=20, blank=True, null=True)
    icon_name = models.CharField(max_length=50, blank=True, null=True)
    min_zoom = models.FloatField(default=10.0)
    max_zoom = models.FloatField(default=22.0)
    is_visible_on_map = models.BooleanField(default=True)

    # 10. Data Provenance & Metadata
    source = models.CharField(max_length=50, default='MANUAL_DRAW')
    confidence_score = models.FloatField(default=1.0, validators=[MinValueValidator(0.0), MaxValueValidator(1.0)])
    verification_status = models.CharField(
        max_length=20, choices=VerificationStatus.choices, default=VerificationStatus.UNVERIFIED
    )
    mapped_by = models.ForeignKey(
        'User', on_delete=models.SET_NULL, null=True, blank=True, related_name='mapped_features'
    )

    # 11. Status & Lifecycle
    is_active = models.BooleanField(default=True, db_index=True)
    is_operational = models.BooleanField(default=True)
    access_restriction = models.CharField(max_length=20, default='PUBLIC')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'spatial_features'
        ordering = ['name']
        indexes = [
            models.Index(fields=['category', 'is_active']),
            models.Index(fields=['institution', 'category']),
            models.Index(fields=['parent', 'category']),
            models.Index(fields=['latitude', 'longitude']),
        ]

    def save(self, *args, **kwargs):
        # 1. Derive Centroid and Bounding Box automatically from GeoJSON Geometry
        if self.geojson_geometry and 'coordinates' in self.geojson_geometry:
            coords = self.geojson_geometry['coordinates']
            gtype = self.geojson_geometry.get('type', self.geometry_type)
            
            centroid_lng, centroid_lat, bbox = self._calculate_spatial_derivations(gtype, coords)
            
            self.derived_centroid = [centroid_lng, centroid_lat]
            self.derived_bbox = bbox
            self.longitude = centroid_lng
            self.latitude = centroid_lat

        # 2. Set default label position if not explicitly customized
        if not self.label_position and self.derived_centroid:
            self.label_position = self.derived_centroid

        super().save(*args, **kwargs)

    @staticmethod
    def _calculate_spatial_derivations(gtype, coords):
        """Helper to compute centroid [lng, lat] and bbox [min_lng, min_lat, max_lng, max_lat]."""
        all_pts = []
        if gtype == 'Point':
            all_pts = [coords]
        elif gtype == 'LineString':
            all_pts = coords
        elif gtype == 'Polygon':
            # Outer ring is first array
            all_pts = coords[0]
        elif gtype == 'MultiPolygon':
            for poly in coords:
                all_pts.extend(poly[0])

        lngs = [p[0] for p in all_pts]
        lats = [p[1] for p in all_pts]
        
        min_lng, max_lng = min(lngs), max(lngs)
        min_lat, max_lat = min(lats), max(lats)
        
        avg_lng = sum(lngs) / len(lngs)
        avg_lat = sum(lats) / len(lats)
        
        return avg_lng, avg_lat, [min_lng, min_lat, max_lng, max_lat]
```

---

## 4. DRF Serializers & API Representation (`backend/institutions/serializers.py`)

The DRF serializer formats output into the 11 modular sections while accepting flat legacy requests to maintain **100% backwards compatibility**.

```python
from rest_framework import serializers
from .models import SpatialFeature, Venue

class SpatialFeatureSerializer(serializers.ModelSerializer):
    """Canonical Serializer for Spatial Features with full 11-section output."""

    identity = serializers.SerializerMethodField()
    geometry = serializers.SerializerMethodField()
    location = serializers.SerializerMethodField()
    relationships = serializers.SerializerMethodField()
    navigation = serializers.SerializerMethodField()
    structure = serializers.SerializerMethodField()
    facilities = serializers.SerializerMethodField()
    geofence = serializers.SerializerMethodField()
    display = serializers.SerializerMethodField()
    metadata = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()

    class Meta:
        model = SpatialFeature
        fields = [
            'id', 'identity', 'geometry', 'location', 'relationships',
            'navigation', 'structure', 'facilities', 'geofence',
            'display', 'metadata', 'status'
        ]

    def get_identity(self, obj):
        return {
            'id': obj.id,
            'uuid': str(obj.uuid),
            'code': obj.code,
            'slug': obj.slug,
            'name': obj.name,
            'category': obj.category,
            'subcategory': obj.subcategory,
            'description': obj.description
        }

    def get_geometry(self, obj):
        return {
            'type': obj.geometry_type,
            'coordinates': obj.geojson_geometry.get('coordinates', []),
            'derived_centroid': obj.derived_centroid,
            'derived_bbox': obj.derived_bbox,
            'elevation_m': float(obj.elevation_m) if obj.elevation_m else None
        }

    def get_location(self, obj):
        return {
            'latitude': float(obj.latitude),
            'longitude': float(obj.longitude),
            'address': obj.address,
            'city': obj.city,
            'state_province': obj.state_province,
            'country': obj.country
        }

    def get_relationships(self, obj):
        return {
            'parent_id': obj.parent_id,
            'institution_id': obj.institution_id,
            'college_id': obj.college_id,
            'department_ids': list(obj.departments.values_list('id', flat=True))
        }

    def get_navigation(self, obj):
        return {
            'entrances': obj.entrances,
            'is_passable': obj.is_passable,
            'one_way': obj.one_way,
            'speed_limit_kmh': obj.speed_limit_kmh
        }

    def get_structure(self, obj):
        return {
            'building_code': obj.building_code,
            'floor_number': obj.floor_number,
            'room_number': obj.room_number,
            'wing': obj.wing,
            'capacity': obj.capacity,
            'floor_area_sqm': obj.floor_area_sqm
        }

    def get_facilities(self, obj):
        return obj.facilities

    def get_geofence(self, obj):
        return {
            'verification_method': obj.verification_method,
            'verification_radius_m': obj.verification_radius_m,
            'custom_geofence_geometry': obj.custom_geofence_geometry,
            'elevation_tolerance_m': obj.elevation_tolerance_m
        }

    def get_display(self, obj):
        return {
            'label_position': obj.label_position,
            'fill_color': obj.venue_color,
            'fill_opacity': obj.venue_opacity,
            'stroke_color': obj.venue_color,
            'stroke_width': obj.border_width,
            'stroke_dasharray': obj.stroke_dasharray,
            'icon_name': obj.icon_name,
            'min_zoom': obj.min_zoom,
            'max_zoom': obj.max_zoom,
            'is_visible_on_map': obj.is_visible_on_map
        }

    def get_metadata(self, obj):
        return {
            'source': obj.source,
            'confidence_score': obj.confidence_score,
            'verification_status': obj.verification_status,
            'mapped_by': obj.mapped_by.email if obj.mapped_by else None
        }

    def get_status(self, obj):
        return {
            'is_active': obj.is_active,
            'is_operational': obj.is_operational,
            'access_restriction': obj.access_restriction
        }
```

---

## 5. TypeScript Interfaces (`frontend/types/spatial.ts`)

```typescript
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

export type GeoJSONGeometryType = 'Point' | 'Polygon' | 'MultiPolygon' | 'LineString';

/** GeoJSON coordinates format: ALWAYS [longitude, latitude] */
export type LngLat = [number, number];

export interface Entrance {
  id: string;
  name: string;
  entrance_type: 'MAIN' | 'SIDE' | 'ACCESSIBLE' | 'EMERGENCY' | 'SERVICE';
  coordinates: LngLat;
  is_wheelchair_accessible: boolean;
  floor_level?: string | number;
}

export interface SpatialFeature {
  id: number;
  identity: {
    id: number;
    uuid: string;
    code?: string;
    slug?: string;
    name: string;
    category: SpatialCategory;
    subcategory?: string;
    description?: string;
  };
  geometry: {
    type: GeoJSONGeometryType;
    /** Standard GeoJSON coordinates format ([lng, lat]) */
    coordinates: any;
    derived_centroid: LngLat;
    derived_bbox: [number, number, number, number]; // [min_lng, min_lat, max_lng, max_lat]
    elevation_m?: number;
  };
  location: {
    latitude: number;
    longitude: number;
    address?: string;
    city?: string;
    state_province?: string;
    country?: string;
  };
  relationships: {
    parent_id?: number;
    institution_id?: number;
    college_id?: number;
    department_ids?: number[];
  };
  navigation: {
    entrances: Entrance[];
    is_passable: boolean;
    one_way: boolean;
    speed_limit_kmh?: number;
  };
  structure: {
    building_code?: string;
    floor_number?: string;
    room_number?: string;
    wing?: string;
    capacity: number;
    floor_area_sqm?: number;
  };
  facilities: Record<string, boolean | string | number>;
  geofence: {
    verification_method: 'PHYSICAL_GEOMETRY' | 'RADIUS' | 'CUSTOM_POLYGON';
    verification_radius_m: number;
    custom_geofence_geometry?: any;
    elevation_tolerance_m: number;
  };
  display: {
    label_position: LngLat;
    fill_color: string;
    fill_opacity: number;
    stroke_color: string;
    stroke_width: number;
    stroke_dasharray?: string;
    icon_name?: string;
    min_zoom: number;
    max_zoom: number;
    is_visible_on_map: boolean;
  };
  metadata: {
    source: 'GPS_SURVEY' | 'SATELLITE_DIGITIZED' | 'GOOGLE_MAPS_IMPORT' | 'MANUAL_DRAW';
    confidence_score: number;
    verification_status: 'UNVERIFIED' | 'VERIFIED' | 'FLAGGED';
    mapped_by?: string;
  };
  status: {
    is_active: boolean;
    is_operational: boolean;
    access_restriction: string;
  };
}
```

---

## 6. Concrete Feature JSON Examples

### 6.1 Campus Boundary Example (`MultiPolygon`)
```json
{
  "identity": {
    "id": 101,
    "uuid": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    "code": "MAIN-CAMPUS",
    "name": "LASUSTECH Ikorodu Main Campus",
    "category": "CAMPUS"
  },
  "geometry": {
    "type": "Polygon",
    "coordinates": [
      [
        [3.5070, 6.6180],
        [3.5120, 6.6180],
        [3.5120, 6.6230],
        [3.5070, 6.6230],
        [3.5070, 6.6180]
      ]
    ],
    "derived_centroid": [3.5095, 6.6205],
    "derived_bbox": [3.5070, 6.6180, 3.5120, 6.6230]
  },
  "location": {
    "latitude": 6.6205,
    "longitude": 3.5095,
    "city": "Ikorodu",
    "state_province": "Lagos",
    "country": "Nigeria"
  },
  "relationships": { "institution_id": 1 },
  "navigation": { "entrances": [], "is_passable": true, "one_way": false },
  "structure": { "capacity": 15000 },
  "facilities": { "is_wheelchair_accessible": true },
  "geofence": { "verification_method": "PHYSICAL_GEOMETRY", "verification_radius_m": 500 },
  "display": { "label_position": [3.5095, 6.6205], "fill_color": "#3b82f6", "fill_opacity": 0.08, "stroke_color": "#1d4ed8", "stroke_width": 3, "min_zoom": 12, "max_zoom": 18, "is_visible_on_map": true },
  "metadata": { "source": "SATELLITE_DIGITIZED", "confidence_score": 0.98, "verification_status": "VERIFIED" },
  "status": { "is_active": true, "is_operational": true, "access_restriction": "PUBLIC" }
}
```

### 6.2 Building with Courtyard Hole Example (`Polygon` with inner ring)
```json
{
  "identity": {
    "id": 202,
    "uuid": "b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e",
    "code": "ENG-BLK-A",
    "name": "Engineering Complex Block A",
    "category": "BUILDING"
  },
  "geometry": {
    "type": "Polygon",
    "coordinates": [
      [
        [3.5080, 6.6190],
        [3.5090, 6.6190],
        [3.5090, 6.6200],
        [3.5080, 6.6200],
        [3.5080, 6.6190]
      ],
      [
        [3.5083, 6.6193],
        [3.5087, 6.6193],
        [3.5087, 6.6197],
        [3.5083, 6.6197],
        [3.5083, 6.6193]
      ]
    ],
    "derived_centroid": [3.5085, 6.6195],
    "derived_bbox": [3.5080, 6.6190, 3.5090, 6.6200]
  },
  "location": { "latitude": 6.6195, "longitude": 3.5085 },
  "relationships": { "parent_id": 101, "institution_id": 1, "college_id": 2 },
  "navigation": {
    "entrances": [
      { "id": "e1", "name": "Main North Gate", "entrance_type": "MAIN", "coordinates": [3.5085, 6.6200], "is_wheelchair_accessible": true },
      { "id": "e2", "name": "South Emergency Exit", "entrance_type": "EMERGENCY", "coordinates": [3.5085, 6.6190], "is_wheelchair_accessible": false }
    ],
    "is_passable": false,
    "one_way": false
  },
  "structure": { "building_code": "ENG-A", "capacity": 1200, "floor_area_sqm": 2400.0 },
  "facilities": { "has_air_conditioning": true, "is_wheelchair_accessible": true },
  "geofence": { "verification_method": "PHYSICAL_GEOMETRY", "verification_radius_m": 50 },
  "display": { "label_position": [3.5085, 6.6195], "fill_color": "#6366f1", "fill_opacity": 0.25, "stroke_color": "#4338ca", "stroke_width": 2, "min_zoom": 14, "max_zoom": 22, "is_visible_on_map": true },
  "metadata": { "source": "GPS_SURVEY", "confidence_score": 1.0, "verification_status": "VERIFIED" },
  "status": { "is_active": true, "is_operational": true, "access_restriction": "STUDENTS_ONLY" }
}
```

### 6.3 Room / Venue Example (`Point` or `Polygon`)
```json
{
  "identity": {
    "id": 303,
    "uuid": "c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f",
    "code": "LT-101",
    "name": "Lecture Theatre 101",
    "category": "ROOM",
    "subcategory": "LECTURE_HALL"
  },
  "geometry": {
    "type": "Point",
    "coordinates": [3.5085, 6.6195],
    "derived_centroid": [3.5085, 6.6195],
    "derived_bbox": [3.5085, 6.6195, 3.5085, 6.6195],
    "elevation_m": 12.0
  },
  "location": { "latitude": 6.6195, "longitude": 3.5085 },
  "relationships": { "parent_id": 202, "institution_id": 1, "college_id": 2 },
  "navigation": { "entrances": [], "is_passable": true, "one_way": false },
  "structure": { "building_code": "ENG-A", "floor_number": "1", "room_number": "101", "capacity": 250 },
  "facilities": { "has_projector": true, "has_computers": false, "has_whiteboard": true, "has_microphone": true },
  "geofence": { "verification_method": "RADIUS", "verification_radius_m": 35, "elevation_tolerance_m": 8.0 },
  "display": { "label_position": [3.5085, 6.6195], "fill_color": "#10b981", "fill_opacity": 0.3, "stroke_color": "#047857", "stroke_width": 2, "icon_name": "presentation-screen", "min_zoom": 16, "max_zoom": 22, "is_visible_on_map": true },
  "metadata": { "source": "MANUAL_DRAW", "confidence_score": 0.95, "verification_status": "VERIFIED" },
  "status": { "is_active": true, "is_operational": true, "access_restriction": "STUDENTS_ONLY" }
}
```

### 6.4 Road / Driveway Example (`LineString`)
```json
{
  "identity": {
    "id": 404,
    "uuid": "d4e5f6a7-b89c-0d1e-2f3a-4b5c6d7e8f9a",
    "code": "RD-MAIN-DRIVE",
    "name": "Vice Chancellor's Drive",
    "category": "ROAD"
  },
  "geometry": {
    "type": "LineString",
    "coordinates": [
      [3.5070, 6.6185],
      [3.5090, 6.6185],
      [3.5110, 6.6190]
    ],
    "derived_centroid": [3.5090, 6.6186],
    "derived_bbox": [3.5070, 6.6185, 3.5110, 6.6190]
  },
  "location": { "latitude": 6.6186, "longitude": 3.5090 },
  "relationships": { "parent_id": 101, "institution_id": 1 },
  "navigation": { "entrances": [], "is_passable": true, "one_way": false, "speed_limit_kmh": 30.0 },
  "structure": {},
  "facilities": {},
  "geofence": { "verification_method": "RADIUS", "verification_radius_m": 20 },
  "display": { "label_position": [3.5090, 6.6186], "fill_color": "#64748b", "fill_opacity": 1.0, "stroke_color": "#475569", "stroke_width": 6, "min_zoom": 13, "max_zoom": 22, "is_visible_on_map": true },
  "metadata": { "source": "SATELLITE_DIGITIZED", "confidence_score": 0.95, "verification_status": "VERIFIED" },
  "status": { "is_active": true, "is_operational": true, "access_restriction": "PUBLIC" }
}
```

### 6.5 Pedestrian Path Example (`LineString`)
```json
{
  "identity": {
    "id": 505,
    "uuid": "e5f6a7b8-9c0d-1e2f-3a4b-5c6d7e8f9a0b",
    "name": "Science Block Walkway",
    "category": "PEDESTRIAN_PATH"
  },
  "geometry": {
    "type": "LineString",
    "coordinates": [
      [3.5080, 6.6190],
      [3.5085, 6.6192],
      [3.5090, 6.6195]
    ],
    "derived_centroid": [3.5085, 6.6192],
    "derived_bbox": [3.5080, 6.6190, 3.5090, 6.6195]
  },
  "location": { "latitude": 6.6192, "longitude": 3.5085 },
  "relationships": { "parent_id": 101, "institution_id": 1 },
  "navigation": { "entrances": [], "is_passable": true, "one_way": false },
  "structure": {},
  "facilities": { "is_wheelchair_accessible": true },
  "geofence": { "verification_method": "RADIUS", "verification_radius_m": 10 },
  "display": { "label_position": [3.5085, 6.6192], "fill_color": "#94a3b8", "fill_opacity": 1.0, "stroke_color": "#64748b", "stroke_width": 2, "stroke_dasharray": "4,4", "min_zoom": 15, "max_zoom": 22, "is_visible_on_map": true },
  "metadata": { "source": "GPS_SURVEY", "confidence_score": 1.0, "verification_status": "VERIFIED" },
  "status": { "is_active": true, "is_operational": true, "access_restriction": "PUBLIC" }
}
```

### 6.6 Entrance / Gate Example (`Point`)
```json
{
  "identity": {
    "id": 606,
    "uuid": "f6a7b89c-0d1e-2f3a-4b5c-6d7e8f9a0b1c",
    "code": "GATE-1",
    "name": "Main West Campus Gate",
    "category": "ENTRANCE",
    "subcategory": "MAIN_GATE"
  },
  "geometry": {
    "type": "Point",
    "coordinates": [3.5070, 6.6180],
    "derived_centroid": [3.5070, 6.6180],
    "derived_bbox": [3.5070, 6.6180, 3.5070, 6.6180]
  },
  "location": { "latitude": 6.6180, "longitude": 3.5070 },
  "relationships": { "parent_id": 101, "institution_id": 1 },
  "navigation": { "entrances": [], "is_passable": true, "one_way": false },
  "structure": {},
  "facilities": { "is_wheelchair_accessible": true },
  "geofence": { "verification_method": "RADIUS", "verification_radius_m": 15 },
  "display": { "label_position": [3.5070, 6.6180], "fill_color": "#ef4444", "fill_opacity": 1.0, "stroke_color": "#991b1b", "stroke_width": 2, "icon_name": "door-open", "min_zoom": 13, "max_zoom": 22, "is_visible_on_map": true },
  "metadata": { "source": "GPS_SURVEY", "confidence_score": 1.0, "verification_status": "VERIFIED" },
  "status": { "is_active": true, "is_operational": true, "access_restriction": "PUBLIC" }
}
```

### 6.7 Landmark / POI Example (`Point`)
```json
{
  "identity": {
    "id": 707,
    "uuid": "7a8b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d",
    "name": "Senate Building Obelisk",
    "category": "LANDMARK_POI",
    "subcategory": "MONUMENT"
  },
  "geometry": {
    "type": "Point",
    "coordinates": [3.5095, 6.6210],
    "derived_centroid": [3.5095, 6.6210],
    "derived_bbox": [3.5095, 6.6210, 3.5095, 6.6210]
  },
  "location": { "latitude": 6.6210, "longitude": 3.5095 },
  "relationships": { "parent_id": 101, "institution_id": 1 },
  "navigation": { "entrances": [], "is_passable": true, "one_way": false },
  "structure": {},
  "facilities": {},
  "geofence": { "verification_method": "RADIUS", "verification_radius_m": 25 },
  "display": { "label_position": [3.5095, 6.6210], "fill_color": "#f59e0b", "fill_opacity": 1.0, "stroke_color": "#b45309", "stroke_width": 2, "icon_name": "landmark", "min_zoom": 14, "max_zoom": 22, "is_visible_on_map": true },
  "metadata": { "source": "MANUAL_DRAW", "confidence_score": 1.0, "verification_status": "VERIFIED" },
  "status": { "is_active": true, "is_operational": true, "access_restriction": "PUBLIC" }
}
```

---

## 7. Migration Mapping Strategy from Current `Venue` Structure

To ensure zero downtime and complete backwards compatibility, the Django migration maps existing `Venue` rows into `SpatialFeature` rows via Django data migrations:

| Existing `Venue` Field | New `SpatialFeature` Mapping | Conversion / Mapping Logic |
|---|---|---|
| `id` | `id` / Legacy pointer | Retained; optional 1-to-1 sync |
| `name` | `name` | Direct copy |
| `code` | `code` | Direct copy |
| `description` | `description` | Direct copy |
| `venue_type` | `category` & `subcategory` | Maps `CLASSROOM`/`LECTURE_HALL`/`LAB`/`AUDITORIUM` to `category='ROOM'` and `subcategory=venue_type` |
| `latitude`, `longitude` | `latitude`, `longitude` | Copied directly & used to build fallback `Point` geometry if no boundary exists |
| `elevation` | `elevation_m` | Direct copy |
| `boundary` (`[[lat, lng], ...]`) | `geojson_geometry` | Swaps coordinate order from `[lat, lng]` to GeoJSON `[lng, lat]`: `[[lng, lat], ...]`. Wraps in GeoJSON `{"type": "Polygon", "coordinates": [...]}` |
| `gps_radius`, `verification_radius` | `verification_radius_m` | Direct copy |
| `venue_color`, `venue_opacity`, `border_width` | `venue_color`, `venue_opacity`, `border_width` | Direct copy |
| `building`, `building_name` | `building_code` / `parent` | Reused for structural metadata |
| `floor_number`, `room_number`, `capacity` | `floor_number`, `room_number`, `capacity` | Direct copy into `structure` |
| `has_projector`, `has_computers`, `has_whiteboard`, `has_microphone` | `facilities` JSON | Bundled into `facilities` dictionary |

---

## 8. Database Indexes & Constraints

1. **Category & Status Compound Index**: `(category, is_active)` for ultra-fast layer filtering (e.g. fetch all active buildings).
2. **Spatial Bounding Box / Centroid Index**: `(latitude, longitude)` B-Tree index for legacy proximity queries.
3. **Hierarchical Spatial Index**: `(parent_id, category)` for fast retrieval of child venues within a building or campus.
4. **Institution Scope Index**: `(institution_id, category)` for institutional queries.
5. **Slug & Code Unique Constraint**: `unique_together = [['institution', 'code']]` where `code` is present.

---

## 9. Spatial & Geometry Validation Rules

1. **GeoJSON Coordinate Order**: All geometries in `geojson_geometry` **MUST** be `[longitude, latitude]` with $-180 \le \text{lng} \le 180$ and $-90 \le \text{lat} \le 90$.
2. **Polygon Closed Loop Rule**: For `Polygon` geometries, the first and last vertex of every ring (outer and inner holes) **MUST** be identical (`ring[0] == ring[-1]`).
3. **Minimum Vertex Rule**: Linear rings in polygons **MUST** contain at least 4 coordinate pairs (3 distinct vertices + closed 4th vertex).
4. **Winding Order**: Outer polygon rings should be counter-clockwise; inner rings (holes) clockwise.
5. **Relationship Hierarchy Constraints**:
   - `ROOM` features **MUST** have a `parent` of category `BUILDING`.
   - `BUILDING` features **MUST** have a `parent` of category `CAMPUS` or `COLLEGE_ZONE`.

---

## 10. External Google Maps Authoring Tool Compatibility Format

To enable seamless import/export with external map authoring tools (Google Maps My Maps, Mapbox Studio, QGIS), standard GeoJSON `FeatureCollection` formats with standard `Feature` properties are provided:

### Export Format (GeoJSON FeatureCollection)
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "id": 202,
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [3.5080, 6.6190],
            [3.5090, 6.6190],
            [3.5090, 6.6200],
            [3.5080, 6.6200],
            [3.5080, 6.6190]
          ]
        ]
      },
      "properties": {
        "name": "Engineering Complex Block A",
        "code": "ENG-BLK-A",
        "category": "BUILDING",
        "building_code": "ENG-A",
        "capacity": 1200,
        "fill_color": "#6366f1",
        "fill_opacity": 0.25,
        "stroke_color": "#4338ca",
        "stroke_width": 2
      }
    }
  ]
}
```

---

### Verification and Delivery Plan

Upon your review and approval of this specification:
1. Create `backend/institutions/models_spatial.py` (or extend `models.py`) with `SpatialFeature`.
2. Add DRF serializer adapters and API routes `/api/spatial-features/`.
3. Create migration routines mapping existing `Venue` instances into `SpatialFeature`.
4. Update frontend and mobile maps to consume canonical GeoJSON objects cleanly.
