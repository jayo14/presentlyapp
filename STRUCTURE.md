# Geospatial & Map Data Structures Audit (Presently App)

This document contains an exact extraction of the **CURRENT** geospatial, map, and venue data structures present in the Presently codebase across backend database models, Django REST Framework serializers, frontend TypeScript interfaces, mobile components, and seed data fixtures.

---

## 1. Overview of Geospatial Implementation

- **GIS Status**: GIS/PostGIS dependencies have been removed and replaced with standard Django `DecimalField` and `JSONField` structures (`backend/institutions/models.py`).
- **Coordinate Conventions**:
  - **Backend / Django Database / Serializers**: Coordinates are stored and transmitted as `[latitude, longitude]` pairs in JSON arrays (`boundary`).
  - **Frontend Validation (`venueValidation.ts`) / `pointInPolygon`**: Expects or normalises coordinates to `[longitude, latitude]` for Turf.js calculations.
  - **Frontend Admin Map (`VenueMap.tsx`)**: Converts `[latitude, longitude]` from API into GeoJSON `[longitude, latitude]` for MapLibre GL rendering.
  - **Mobile App**: Stores point coordinates (`latitude`, `longitude`, `radius`) in single float values or nested objects `{ latitude, longitude, radius }`.

---

## 2. Model & Interface Specifications

### 2.1 Backend Database Models (`backend/institutions/models.py` & `backend/attendance/models.py`)

#### A. `Venue` Model
* **File Path**: [backend/institutions/models.py](file:///home/codegallantx/moi/presentlyapp/backend/institutions/models.py#L498-L587)
* **Model Name**: `Venue`
* **Table Name**: `venues`
* **Relationships**:
  * `institution`: ForeignKey to `Institution` (`related_name='venues'`, `on_delete=CASCADE`, `null=True`, `blank=True`)
  * `college`: ForeignKey to `College` (`related_name='venues'`, `on_delete=CASCADE`, `null=True`, `blank=True`)
* **Polygon / Geometry Storage**:
  * Centroid point is stored via `latitude` and `longitude` decimal fields.
  * Geofence polygon boundary is stored in `boundary` as a `JSONField` array of coordinate pairs (`[[lat, lng], [lat, lng], ...]`).
  * Fallback verification uses `verification_radius` / `gps_radius` in meters.

| Field Name | Field Type | Required / Optional | Example Value | Description |
|---|---|---|---|---|
| `id` | `AutoField` / `BigAutoField` | Required (Auto) | `1` | Primary key |
| `institution` | `ForeignKey(Institution)` | Optional (`null=True, blank=True`) | `1` | Owning institution |
| `college` | `ForeignKey(College)` | Optional (`null=True, blank=True`) | `2` | Owning college |
| `name` | `CharField(200)` | Required | `"Main Lecture Hall"` | Venue display name |
| `code` | `CharField(50)` | Optional (`null=True, blank=True`) | `"MLH"` | Venue short code |
| `description` | `TextField` | Optional (`null=True, blank=True`) | `"Ground floor main hall"` | Detailed description |
| `building` | `CharField(100)` | Optional (`null=True, blank=True`) | `"Science Block"` | Building name alias |
| `building_name` | `CharField(200)` | Optional (`null=True, blank=True`) | `"Science Block"` | Building name |
| `floor_number` | `CharField(20)` | Optional (`null=True, blank=True`) | `"0"` | Floor number |
| `room_number` | `CharField(50)` | Optional (`null=True, blank=True`) | `"G01"` | Room number |
| `capacity` | `IntegerField` | Optional (`default=0`) | `200` | Seating capacity |
| `venue_type` | `CharField(20)` | Optional (`default='CLASSROOM'`) | `"LECTURE_HALL"` | Choice: CLASSROOM, LECTURE_HALL, LAB, AUDITORIUM, ONLINE |
| `has_projector` | `BooleanField` | Optional (`default=False`) | `true` | Facility flag |
| `has_computers` | `BooleanField` | Optional (`default=False`) | `false` | Facility flag |
| `has_whiteboard` | `BooleanField` | Optional (`default=False`) | `true` | Facility flag |
| `has_microphone` | `BooleanField` | Optional (`default=False`) | `true` | Facility flag |
| `latitude` | `DecimalField(max_digits=9, decimal_places=6)` | Optional (`null=True, blank=True`) | `7.377500` | Center latitude coordinate |
| `longitude` | `DecimalField(max_digits=9, decimal_places=6)` | Optional (`null=True, blank=True`) | `3.893600` | Center longitude coordinate |
| `elevation` | `DecimalField(max_digits=8, decimal_places=2)` | Optional (`null=True, blank=True`) | `240.50` | Elevation in meters above sea level |
| `boundary` | `JSONField` | Optional (`null=True, blank=True`) | `[[7.3775, 3.8936], [7.3780, 3.8940], [7.3770, 3.8945], [7.3775, 3.8936]]` | Polygon boundary array of `[lat, lng]` pairs |
| `gps_radius` | `IntegerField` | Optional (`default=100`) | `50` | GPS verification radius in meters |
| `verification_radius` | `IntegerField` | Optional (`default=100`) | `50` | Radius in meters used if no boundary is set |
| `venue_color` | `CharField(20)` | Optional (`default='#6366f1'`) | `"#6366f1"` | Hex color for map boundary rendering |
| `venue_opacity` | `FloatField` | Optional (`default=0.15`) | `0.2` | Polygon fill opacity (0.0 - 1.0) |
| `border_width` | `IntegerField` | Optional (`default=2`) | `2` | Polygon stroke width in pixels |
| `is_active` | `BooleanField` | Optional (`default=True`) | `true` | Active status flag |
| `created_at` | `DateTimeField` | Required (Auto) | `"2026-01-01T12:00:00Z"` | Creation timestamp |
| `updated_at` | `DateTimeField` | Required (Auto) | `"2026-01-01T12:00:00Z"` | Last updated timestamp |

---

#### B. `Institution` Model
* **File Path**: [backend/institutions/models.py](file:///home/codegallantx/moi/presentlyapp/backend/institutions/models.py#L19-L75)
* **Model Name**: `Institution`
* **Table Name**: `institutions`
* **Relationships**: Has many `College`, `Department`, `Venue`, `User`

| Field Name | Field Type | Required / Optional | Example Value | Description |
|---|---|---|---|---|
| `id` | `AutoField` / `BigAutoField` | Required (Auto) | `1` | Primary key |
| `full_name` | `TextField` | Required (`unique=True`) | `"Lagos State University of Science and Technology"` | Institution full name |
| `short_name` | `TextField` | Required (`unique=True`) | `"LASUSTECH"` | Short name |
| `abbreviation` | `TextField` | Required (`unique=True`) | `"LASUSTECH"` | Abbreviation |
| `description` | `TextField` | Optional (`null=True, blank=True`) | `"State University"` | Description |
| `website_url` | `URLField(500)` | Optional (`null=True, blank=True`) | `"https://lasustech.edu.ng"` | Website |
| `contact_email` | `EmailField` | Optional (`null=True, blank=True`) | `"info@lasustech.edu.ng"` | Email |
| `contact_phone` | `CharField(20)` | Optional (`null=True, blank=True`) | `"+234 803 123 4567"` | Phone |
| `country` | `CharField(100)` | Required | `"Nigeria"` | Country |
| `state_province` | `CharField(100)` | Required | `"Lagos"` | State / Province |
| `city` | `CharField(100)` | Required | `"Ikorodu"` | City |
| `address` | `TextField` | Required | `"Ikorodu, Lagos, Nigeria"` | Address |
| `latitude` | `DecimalField(9, 6)` | Optional (`null=True, blank=True`) | `6.618300` | Center latitude |
| `longitude` | `DecimalField(9, 6)` | Optional (`null=True, blank=True`) | `3.508000` | Center longitude |
| `postal_code` | `CharField(20)` | Optional (`null=True, blank=True`) | `"104101"` | Postal code |
| `established_year` | `IntegerField` | Optional (`null=True, blank=True`) | `2021` | Year established |
| `institution_type` | `CharField(20)` | Optional (`null=True, blank=True`) | `"UNIVERSITY"` | Choice: UNIVERSITY, POLYTECHNIC, COLLEGE, INSTITUTE |
| `accreditation_status` | `CharField(20)` | Optional (`null=True, blank=True`) | `"ACCREDITED"` | Choice: ACCREDITED, PROVISIONAL, PENDING |
| `logo_url` | `URLField(500)` | Optional (`null=True, blank=True`) | `null` | Logo image URL |
| `cover_image_url` | `URLField(500)` | Optional (`null=True, blank=True`) | `null` | Cover image URL |
| `is_active` | `BooleanField` | Optional (`default=True`) | `true` | Active status flag |
| `created_at` | `DateTimeField` | Required (Auto) | `"2026-01-01T10:00:00Z"` | Creation timestamp |
| `updated_at` | `DateTimeField` | Required (Auto) | `"2026-01-01T10:00:00Z"` | Update timestamp |

---

#### C. `College` & `Department` Models
* **File Path**: [backend/institutions/models.py](file:///home/codegallantx/moi/presentlyapp/backend/institutions/models.py#L77-L163)
* **College Name**: `College` (`table: colleges`)
* **Department Name**: `Department` (`table: departments`)
* **Boundaries / Geospatial Data**:
  - `College` contains `building_block` (`CharField(100)`) and `office_location` (`CharField(200)`).
  - `Department` contains `office_location` (`CharField(200)`).
  - Neither `College` nor `Department` models currently contain spatial polygon or lat/long fields in the database schema. They represent organizational entities linked to `Institution` and `Venue`.

---

#### D. `AttendanceSession` Model
* **File Path**: [backend/institutions/models.py](file:///home/codegallantx/moi/presentlyapp/backend/institutions/models.py#L589-L680)
* **Model Name**: `AttendanceSession`
* **Table Name**: `attendance_sessions`
* **Relationships**:
  * `course`: ForeignKey to `Course` (`related_name='sessions'`)
  * `venue`: ForeignKey to `Venue` (`related_name='sessions'`, `null=True, blank=True`)
* **Geospatial Fields**:

| Field Name | Field Type | Required / Optional | Example Value | Description |
|---|---|---|---|---|
| `latitude` | `DecimalField(10, 8)` | Optional (`null=True, blank=True`) | `7.37750000` | Legacy/override session center latitude |
| `longitude` | `DecimalField(11, 8)` | Optional (`null=True, blank=True`) | `3.89360000` | Legacy/override session center longitude |
| `accuracy` | `DecimalField(10, 2)` | Optional (`null=True, blank=True`) | `5.00` | GPS accuracy requirement in meters |
| `location_radius` | `IntegerField` | Optional (`default=100`) | `50` | Geofence radius in meters |
| `lecturer_coordinates` | `JSONField` | Optional (`null=True, blank=True`) | `{"lat": 7.3775, "lng": 3.8936}` | Dynamic lecturer location |
| `allowed_radius_meters` | `IntegerField` | Optional (`default=50`) | `50` | Allowed distance from lecturer |

---

#### E. `Attendance` & `AttendanceSubmission` Models
* **File Path**: [backend/institutions/models.py](file:///home/codegallantx/moi/presentlyapp/backend/institutions/models.py#L732-L750) & [backend/attendance/models.py](file:///home/codegallantx/moi/presentlyapp/backend/attendance/models.py#L46-L114)
* **Geospatial Fields**:
  - `Attendance`: `latitude` (`DecimalField(10,8)`), `longitude` (`DecimalField(11,8)`), `accuracy` (`DecimalField(10,2)`), `elevation` (`DecimalField(8,2)`), `location_verified` (`BooleanField`).
  - `AttendanceSubmission`: `coordinates` (`JSONField`: `{lat, lng, accuracyMeters}`), `sample_spread` (`FloatField`), `movement_variance` (`FloatField`).
  - `AttendanceAttemptLog`: `latitude` (`DecimalField(10,8)`), `longitude` (`DecimalField(11,8)`), `accuracy`, `drift_avg`, `inside_polygon` (`BooleanField`).

---

### 2.2 API Request/Response Serializers (`backend/institutions/serializers.py`)

#### `VenueSerializer`
* **File Path**: [backend/institutions/serializers.py](file:///home/codegallantx/moi/presentlyapp/backend/institutions/serializers.py#L124-L266)
* **Class**: `VenueSerializer`
* **Fields Exposed to API**:
  - `id`, `institution`, `institution_name`, `college`, `name`, `code`, `description`
  - `building`, `building_name`, `floor_number`, `room_number`, `capacity`, `venue_type`
  - `has_projector`, `has_computers`, `has_whiteboard`, `has_microphone`
  - `latitude` (Float), `longitude` (Float), `elevation` (Float)
  - `boundary_coordinates` (Write-only request field / Serializer method output field): `Array of [lat, lng]`
  - `boundary` (Read-only model field): `Array of [lat, lng]`
  - `gps_radius`, `verification_radius`
  - `venue_color`, `venue_opacity`, `border_width`
  - `is_active`, `created_at`, `updated_at`

* **Request & Validation Logic**:
  - On write (CREATE / UPDATE): Accepts `boundary_coordinates` in JSON request payload as an array of `[lat, lng]` pairs (e.g. `[[7.3775, 3.8936], ...]`).
  - Validates min 3 points, closes loop (`boundary_coordinates[0] == boundary_coordinates[-1]`), checks numeric boundaries (`-90 <= lat <= 90`, `-180 <= lng <= 180`), and maps into internal model attribute `boundary`.
  - On read (GET): `to_representation` outputs both `boundary` and `boundary_coordinates` as `[[lat, lng], ...]`.

---

### 2.3 Frontend TypeScript Interfaces (`frontend/types.ts` & `frontend/services/api/attendance.ts`)

#### A. Frontend `Venue` Interface
* **File Path**: [frontend/types.ts](file:///home/codegallantx/moi/presentlyapp/frontend/types.ts#L118-L153)
* **Interface Name**: `Venue`

```typescript
export interface Venue {
  id: number;
  institution: number;
  institution_id?: number;
  institution_name?: string;
  name: string;
  code: string;
  description?: string;
  building_name?: string;
  floor_number?: string;
  room_number?: string;
  capacity?: number;
  
  // Precise geolocation with elevation
  latitude: number;
  longitude: number;
  elevation?: number;
  
  // Boundary/polygon for precise location mapping.
  // Coordinates are stored as **[latitude, longitude]** pairs (Python/backend convention).
  // MapLibre requires [longitude, latitude] — convert when rendering.
  boundary_coordinates?: number[][];

  // Location verification settings
  verification_radius: number;

  // Visual display settings (configurable per-venue)
  venue_color?: string;    // hex colour, e.g. "#6366f1"
  venue_opacity?: number;  // 0.0 – 1.0
  border_width?: number;   // stroke width in px
  
  // Metadata
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
```

#### B. Attendance Session Location Data
* **File Path**: [frontend/services/api/attendance.ts](file:///home/codegallantx/moi/presentlyapp/frontend/services/api/attendance.ts#L21-L46)
```typescript
export interface AttendanceSession {
  id: number;
  course: number;
  // ...
  latitude?: number;
  longitude?: number;
  location_radius: number;
  location_data?: {
    latitude: number;
    longitude: number;
    elevation?: number;
    boundary?: number[][];
    radius: number;
  };
}
```

---

### 2.4 Mobile TypeScript Interfaces (`mobile/types/index.ts` & `mobile/types/api.ts`)

#### A. Mobile `Venue` Interface
* **File Path**: [mobile/types/index.ts](file:///home/codegallantx/moi/presentlyapp/mobile/types/index.ts#L20-L29)
* **Interface Name**: `Venue`

```typescript
export interface Venue {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  radius: number; // in meters
  capacity?: number;
  image?: string;
}
```

#### B. Mobile API Request Types
* **File Path**: [mobile/types/api.ts](file:///home/codegallantx/moi/presentlyapp/mobile/types/api.ts#L117-L135)
```typescript
export interface CreateVenueRequest {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  radius: number;
  capacity?: number;
  image?: string;
}

export interface CreateSessionRequest {
  courseId: string;
  venueId?: string;
  startTime: string;
  endTime: string;
  duration: number;
  location: {
    latitude: number;
    longitude: number;
    radius: number;
  };
  qrCode?: string;
  sessionCode?: string;
  date: string;
}
```

---

## 3. Map & GeoJSON Usage Details

### 3.1 Point & Polygon GeoJSON Conversion
* **File Path**: [frontend/components/Admin/VenueMap.tsx](file:///home/codegallantx/moi/presentlyapp/frontend/components/Admin/VenueMap.tsx#L68-L146)

In `frontend/components/Admin/VenueMap.tsx`, MapLibre GL is used for map rendering.

1. **Markers / Points**: Built via `buildPointGeoJSON`:
```typescript
{
  type: 'FeatureCollection',
  features: venues
    .filter((v) => v.latitude && v.longitude)
    .map((v) => ({
      type: 'Feature',
      id: v.id,
      geometry: {
        type: 'Point',
        coordinates: [Number(v.longitude), Number(v.latitude)] // [lng, lat]
      },
      properties: {
        id: v.id,
        name: v.name,
        color: v.venue_color || '#3b82f6'
      }
    }))
}
```

2. **Polygons**: Built via `buildBoundaryGeoJSON`:
```typescript
// Converts stored [lat, lng] to MapLibre GeoJSON [lng, lat]
const raw = v.boundary_coordinates!
  .map(([lat, lng]) => [Number(lng), Number(lat)] as [number, number]);

// Ensures closed ring
if (raw.length >= 3) {
  const first = raw[0];
  const last = raw[raw.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) {
    raw.push([first[0], first[1]]);
  }
}

// GeoJSON Feature
{
  type: 'Feature',
  id: v.id,
  geometry: {
    type: 'Polygon',
    coordinates: [raw] // [[[lng, lat], [lng, lat], ...]]
  },
  properties: {
    id: v.id,
    name: v.name,
    fillColor: v.venue_color || '#6366f1',
    fillOpacity: v.venue_opacity ?? 0.4,
    strokeColor: v.venue_color || '#6366f1',
    strokeWidth: v.border_width ?? 2
  }
}
```

---

## 4. Seed Data & Fixtures

* **File Path**: [mobile/mocks/venues.ts](file:///home/codegallantx/moi/presentlyapp/mobile/mocks/venues.ts#L1-L32)

```typescript
import { Venue } from '@/types';

export const mockVenues: Venue[] = [
  {
    id: '1',
    name: 'Lecture Theatre 1',
    address: 'Science Block, Ground Floor',
    latitude: 6.5244,
    longitude: 3.3792,
    radius: 50,
    capacity: 200,
  },
  {
    id: '2',
    name: 'Engineering Hall',
    address: 'Engineering Faculty',
    latitude: 6.5180,
    longitude: 3.3970,
    radius: 75,
    capacity: 350,
  },
  {
    id: '3',
    name: 'Computer Lab 3',
    address: 'ICT Center, 2nd Floor',
    latitude: 6.5210,
    longitude: 3.3850,
    radius: 30,
    capacity: 50,
  },
];
```

---

## 5. Complete Current Venue + Geospatial Schema (JSON Example)

Below is an exact JSON representation of a `Venue` object combined with its linked institution geospatial context as returned by the REST API (`/api/venues/1/`):

```json
{
  "id": 1,
  "institution": 1,
  "institution_name": "Lagos State University of Science and Technology",
  "college": 2,
  "name": "Main Engineering Lecture Theatre",
  "code": "MELT-01",
  "description": "Primary auditorium for College of Engineering",
  "building": "Engineering Complex",
  "building_name": "Engineering Complex",
  "floor_number": "1",
  "room_number": "ET-101",
  "capacity": 350,
  "venue_type": "LECTURE_HALL",
  "has_projector": true,
  "has_computers": false,
  "has_whiteboard": true,
  "has_microphone": true,
  "latitude": 6.518,
  "longitude": 3.397,
  "elevation": 25.5,
  "boundary_coordinates": [
    [6.5182, 3.3968],
    [6.5183, 3.3973],
    [6.5178, 3.3974],
    [6.5177, 3.3969],
    [6.5182, 3.3968]
  ],
  "boundary": [
    [6.5182, 3.3968],
    [6.5183, 3.3973],
    [6.5178, 3.3974],
    [6.5177, 3.3969],
    [6.5182, 3.3968]
  ],
  "gps_radius": 50,
  "verification_radius": 50,
  "venue_color": "#6366f1",
  "venue_opacity": 0.2,
  "border_width": 2,
  "is_active": true,
  "created_at": "2026-08-15T10:30:00.000Z",
  "updated_at": "2026-08-20T14:15:00.000Z"
}
```
