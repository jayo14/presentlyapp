# Geolocation Feature Documentation

## Overview

The geolocation feature enables secure and accurate attendance marking by verifying that students are physically present at the venue during check-in. The system supports both simple radius-based verification and precise polygon boundary mapping for irregular venue shapes.

## Key Features

### 1. Venue Management
- **Precise Location**: Define venue locations with latitude, longitude, and elevation
- **Boundary Mapping**: Use polygon coordinates to map exact venue boundaries
- **Multi-Floor Support**: Elevation tracking for multi-story buildings
- **Flexible Verification**: Choose between radius-based or polygon-based location verification

### 2. Geolocation Verification
- **3D Distance Calculation**: Includes elevation for accurate distance measurement
- **Point-in-Polygon**: Ray casting algorithm for boundary verification
- **Real-time Location**: HTML5 Geolocation API for high-accuracy positioning
- **Privacy-Focused**: Location data used only for attendance verification

### 3. Admin Dashboard
- **Venue Management**: Full CRUD operations for venues
- **User Management**: Manage users, roles, and permissions
- **Department Management**: Hierarchical management of academic structures
- **Analytics**: Distance tracking and location verification reports

## Architecture

### Backend (Django/DRF)

#### Models

**Venue Model** (`backend/institutions/models.py`)
```python
class Venue(models.Model):
    institution = ForeignKey(Institution)
    name = CharField(max_length=200)
    code = CharField(max_length=50)
    
    # Geolocation
    latitude = DecimalField(max_digits=10, decimal_places=8)
    longitude = DecimalField(max_digits=11, decimal_places=8)
    elevation = DecimalField(max_digits=8, decimal_places=2)
    
    # Boundary mapping
    boundary_coordinates = JSONField()  # [[lat, lng], ...]
    verification_radius = IntegerField(default=100)
```

**AttendanceSession Model** (Updated)
```python
class AttendanceSession(models.Model):
    venue = ForeignKey(Venue, null=True, blank=True)
    # Legacy fields for backward compatibility
    latitude = DecimalField(...)
    longitude = DecimalField(...)
    
    def get_location_coords(self):
        """Returns location data, preferring venue over legacy fields"""
```

**Attendance Model** (Updated)
```python
class Attendance(models.Model):
    latitude = DecimalField(...)
    longitude = DecimalField(...)
    elevation = DecimalField(...)
    distance_from_venue = DecimalField(...)
    location_verified = BooleanField()
```

#### Geolocation Utilities (`backend/institutions/geolocation_utils.py`)

```python
def calculate_distance(lat1, lon1, lat2, lon2, elevation1=None, elevation2=None):
    """Calculate 2D or 3D distance using haversine formula"""

def point_in_polygon(point, polygon):
    """Ray casting algorithm for point-in-polygon test"""

def verify_location(student_coords, venue_coords, boundary, radius):
    """Verify if student is within venue boundaries"""
```

#### API Endpoints

**Venues**
- `GET /api/venues/` - List all venues
- `POST /api/venues/` - Create venue (admin only)
- `GET /api/venues/{id}/` - Get venue details
- `PATCH /api/venues/{id}/` - Update venue (admin only)
- `DELETE /api/venues/{id}/` - Delete venue (admin only)
- `GET /api/venues/{id}/sessions/` - Get sessions for venue

**Sessions**
- `POST /api/sessions/{id}/check_in/` - Check in with location verification

**Check-in Request**
```json
{
  "latitude": 7.5629,
  "longitude": 4.5200,
  "elevation": 250.5
}
```

**Check-in Response**
```json
{
  "success": true,
  "message": "Check-in successful",
  "attendance": { ... },
  "location_verified": true,
  "distance_from_venue": 45.2,
  "warning": "..."  // Optional if verification failed
}
```

### Frontend (React/TypeScript)

#### Services

**Geolocation Service** (`frontend/services/geolocation.ts`)
```typescript
getCurrentPosition(): Promise<GeolocationPosition>
calculateDistance(lat1, lon1, lat2, lon2): number
pointInPolygon(point, polygon): boolean
verifyVenueLocation(...): { verified, distance, message }
```

**Venue API** (`frontend/services/api/venues.ts`)
```typescript
venueApi.getAll(filters?): Promise<Venue[]>
venueApi.create(data): Promise<Venue>
venueApi.update(id, data): Promise<Venue>
venueApi.delete(id): Promise<void>
```

#### Components

**VenueManagement** (`frontend/components/Admin/VenueManagement.tsx`)
- List venues with filtering by institution
- Create/edit venues with geolocation modal
- View venue details including boundary mapping
- Delete venues

**VenueModal** (`frontend/components/Admin/VenueModal.tsx`)
- Form for venue creation/editing
- Geolocation input with "Use Current Location" button
- Boundary coordinates input (JSON format)
- Validation for coordinates and boundary format

**AttendanceCheckIn** (`frontend/components/Attendance/AttendanceCheckIn.tsx`)
- Session code input
- Real-time location acquisition
- Location verification with visual feedback
- Error handling and retry logic

## Usage Guide

### For Administrators

#### Creating a Venue

1. Navigate to Admin Dashboard → Venue Management
2. Click "Add Venue"
3. Fill in basic information:
   - Name (e.g., "Main Lecture Hall")
   - Code (e.g., "MLH-101")
   - Building, floor, room details
   - Capacity

4. Set geolocation:
   - Enter latitude, longitude, elevation
   - OR click "Use Current Location" if at venue
   - Set verification radius (default: 100m)

5. Optional: Add boundary coordinates
   - Use tools like geojson.io to draw polygon
   - Copy coordinates as JSON array
   - Format: `[[lat1, lng1], [lat2, lng2], ...]`
   - Ensure first and last points match (closed polygon)

6. Save venue

#### Mapping Venue Boundaries

**Using geojson.io:**
1. Go to https://geojson.io
2. Draw polygon around your venue
3. Click on the polygon to select it
4. Copy the coordinates from the JSON on the right
5. Extract just the coordinate array
6. Paste into venue boundary field

**Example Boundary:**
```json
[
  [7.5629, 4.5200],
  [7.5630, 4.5201],
  [7.5631, 4.5199],
  [7.5629, 4.5200]
]
```

### For Lecturers

#### Creating a Session with Venue

1. Navigate to Lecturer Dashboard
2. Click "Create Session"
3. Select course
4. Select venue from dropdown
5. Set start/end times
6. Generate session code
7. Share code with students

**Note:** If venue is selected, students will be automatically verified against venue boundaries. If no venue is selected, legacy lat/lng fields will be used.

### For Students

#### Checking In

1. Navigate to Student Dashboard
2. Click "Check In"
3. Enter session code
4. Allow location access when prompted
5. Wait for verification
6. Receive confirmation

**Location Requirements:**
- GPS/location services must be enabled
- Must grant location permission to browser
- Must be within venue radius or boundary
- Elevation should match (±10m tolerance)

## Security Considerations

### Location Privacy
- Location data is only collected during check-in
- Data is used solely for attendance verification
- Student locations are not tracked continuously
- Distance from venue center is logged for analytics only

### Verification Integrity
- Server-side verification prevents client-side manipulation
- Elevation checks prevent check-ins from different floors
- Boundary polygons prevent check-ins from outside venue
- Grace period (15 minutes) for late arrivals

### Permission Model
- Only admins can create/edit/delete venues
- All authenticated users can view active venues
- Students can only check in to active sessions
- Lecturers can only manage their own sessions

## Database Schema

### Venues Table
```sql
CREATE TABLE venues (
  id BIGSERIAL PRIMARY KEY,
  institution_id BIGINT REFERENCES institutions(id),
  name VARCHAR(200) NOT NULL,
  code VARCHAR(50) NOT NULL,
  
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  elevation DECIMAL(8, 2),
  
  boundary_coordinates JSONB,
  verification_radius INTEGER DEFAULT 100,
  
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(institution_id, code)
);
```

### Migration
Run migration: `frontend/supabase/migrations/20260101000000_create_venues_table.sql`

## Testing

### Unit Tests

**Backend:**
```python
# Test geolocation utilities
def test_calculate_distance():
    distance = calculate_distance(0, 0, 0, 1)
    assert 110000 < distance < 112000  # ~111km

def test_point_in_polygon():
    square = [[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]
    assert point_in_polygon((0.5, 0.5), square) == True
    assert point_in_polygon((1.5, 1.5), square) == False
```

**Frontend:**
```typescript
// Test frontend geolocation
describe('pointInPolygon', () => {
  it('should detect point inside polygon', () => {
    const polygon = [[0, 0], [0, 1], [1, 1], [1, 0]];
    expect(pointInPolygon([0.5, 0.5], polygon)).toBe(true);
  });
});
```

### Integration Tests

1. Create a test venue with known coordinates
2. Mock geolocation to return coordinates inside boundary
3. Attempt check-in
4. Verify attendance record has correct location data
5. Verify `location_verified` is true

## Troubleshooting

### Common Issues

**"Location permission denied"**
- Solution: Enable location services in browser settings
- Check if HTTPS is enabled (required for geolocation API)

**"You are too far from venue"**
- Solution: Move closer to venue
- Check if correct venue is selected for session
- Verify venue coordinates are correct

**"Elevation mismatch"**
- Solution: Check if on correct floor
- Verify venue elevation is set correctly
- Tolerance is ±10m

**"Invalid boundary coordinates"**
- Solution: Ensure JSON format is correct
- At least 3 coordinate pairs required
- First and last points should match
- Check latitude (-90 to 90) and longitude (-180 to 180) ranges

### Debug Mode

Enable debug logging:
```typescript
// Frontend
localStorage.setItem('debug', 'geolocation:*');

// Backend
LOGGING = {
    'loggers': {
        'institutions.geolocation_utils': {
            'level': 'DEBUG',
        }
    }
}
```

## Future Enhancements

1. **Interactive Map Editor**: Visual polygon drawing in admin interface
2. **Batch Venue Import**: CSV/Excel import for multiple venues
3. **Geo-fencing Alerts**: Notify when student is outside venue
4. **Location History**: Track student movement patterns (with consent)
5. **Indoor Positioning**: WiFi/Bluetooth-based positioning for indoor venues
6. **Multi-Venue Sessions**: Support sessions spanning multiple venues
7. **Attendance Zones**: Define different verification radii for different areas

## API Reference

See [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for complete API reference.

## Contributing

When contributing geolocation features:
1. Test with real GPS coordinates
2. Verify polygon algorithms with edge cases
3. Consider privacy implications
4. Document coordinate systems used
5. Test on mobile devices
6. Consider battery impact of location services

## License

See [LICENSE](LICENSE) file for details.
