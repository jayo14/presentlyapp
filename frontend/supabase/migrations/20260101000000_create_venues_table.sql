-- Create venues table
CREATE TABLE IF NOT EXISTS venues (
  id BIGSERIAL PRIMARY KEY,
  institution_id BIGINT NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  code VARCHAR(50) NOT NULL,
  description TEXT,
  building_name VARCHAR(200),
  floor_number VARCHAR(20),
  room_number VARCHAR(50),
  capacity INTEGER,
  
  -- Precise geolocation with elevation
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  elevation DECIMAL(8, 2),
  
  -- Boundary/polygon for precise location mapping
  -- Stored as JSON array of coordinate pairs: [[lat, lng], [lat, lng], ...]
  boundary_coordinates JSONB,
  
  -- Location verification settings
  verification_radius INTEGER NOT NULL DEFAULT 100,
  
  -- Metadata
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Unique constraint: code must be unique within institution
  CONSTRAINT unique_venue_code_per_institution UNIQUE (institution_id, code)
);

-- Create index for venues
CREATE INDEX idx_venues_institution_id ON venues(institution_id);
CREATE INDEX idx_venues_code ON venues(code);
CREATE INDEX idx_venues_is_active ON venues(is_active);

-- Enable RLS on venues
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;

-- RLS Policies for venues
CREATE POLICY "Anyone can view active venues"
  ON venues
  FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Admins can view all venues"
  ON venues
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'ADMIN'
    )
  );

CREATE POLICY "Admins can manage venues"
  ON venues
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'ADMIN'
    )
  );

-- Add venue_id to attendance_sessions table
ALTER TABLE attendance_sessions
  ADD COLUMN venue_id BIGINT REFERENCES venues(id) ON DELETE SET NULL;

-- Create index for venue_id in attendance_sessions
CREATE INDEX idx_attendance_sessions_venue_id ON attendance_sessions(venue_id);

-- Add elevation and distance tracking to attendances table
ALTER TABLE attendances
  ADD COLUMN elevation DECIMAL(8, 2),
  ADD COLUMN distance_from_venue DECIMAL(8, 2);

-- Trigger: Update venues updated_at
CREATE TRIGGER update_venues_updated_at
  BEFORE UPDATE ON venues
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT SELECT ON venues TO authenticated;
GRANT ALL ON venues TO authenticated; -- For admins to manage venues
