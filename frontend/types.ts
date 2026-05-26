export enum UserRole {
  STUDENT = 'STUDENT',
  LECTURER = 'LECTURER',
  ADMIN = 'ADMIN',
  CLASS_REP = 'CLASS_REP'
}

export interface Institution {
  id: number;
  full_name: string;
  short_name: string;
  abbreviation: string;
  description?: string;
  website_url?: string;
  contact_email?: string;
  contact_phone?: string;
  country: string;
  state_province?: string;
  city: string;
  address: string;
  latitude?: number;
  longitude?: number;
  postal_code?: string;
  established_year?: number;
  institution_type?: string;
  accreditation_status?: string;
  logo_url?: string;
  cover_image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface College {
  id: number;
  institution: number;
  institution_id?: number;
  name: string;
  code: string;
  abbreviation: string;
  description?: string;
  dean_name?: string;
  dean_email?: string;
  contact_email?: string;
  contact_phone?: string;
  website_url?: string;
  building_block?: string;
  office_location?: string;
  established_year?: number;
  logo_url?: string;
  is_active: boolean;
  departmentCount?: number;
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: number;
  college: number;
  institution: number;
  college_id?: number;
  institution_id?: number;
  name: string;
  code: string;
  abbreviation: string;
  description?: string;
  head_of_department_name?: string;
  head_of_department_email?: string;
  contact_email?: string;
  contact_phone?: string;
  office_location?: string;
  website_url?: string;
  established_year?: number;
  accreditation_status?: string;
  logo_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Extended fields for UI
  college_name?: string;
  courses_count?: number;
}

export interface Course {
  id: number;
  department: number[];
  department_name?: string;
  code: string;
  title: string;
  name?: string; // Compatibility alias
  description?: string;
  lecturer?: number;
  lecturer_name?: string;
  credit_units: number;
  semester?: string;
  level?: string;
  is_active: boolean;
  enrolled_students_count?: number;
  created_at: string;
  updated_at: string;
}

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
  latitude: number;
  longitude: number;
  elevation?: number;
  boundary_coordinates?: number[][];
  verification_radius: number;
  venue_color?: string;
  venue_opacity?: number;
  border_width?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  name: string;
  full_name?: string;
  email: string;
  role: UserRole;
  avatar?: string;
  onboarding_complete: boolean;
  is_active?: boolean;
  matric_number?: string;
  level?: string;
  department?: string;
  institution?: number;
  institution_id?: number;
  institution_name?: string;
  college?: number;
  college_id?: number;
  email_verified?: boolean;
}

export interface Session {
  id: string;
  courseName: string;
  courseCode: string;
  startTime: Date;
  endTime: Date;
  active: boolean;
  attendees: number;
  sessionCode: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}
