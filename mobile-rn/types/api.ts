// API Request/Response Types

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  user?: any; // Will be typed as User from main types
  message?: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  role?: 'student' | 'lecturer';
  matricNumber?: string;
  department?: string;
  level?: string;
}

export interface RegisterResponse {
  success: boolean;
  user?: any;
  message?: string;
}

export interface VerifyEmailRequest {
  email: string;
  otp: string;
}

export interface VerifyEmailResponse {
  success: boolean;
  token?: string;
  message?: string;
}

// User Types
export interface CreateUserRequest {
  fullName: string;
  email: string;
  password: string;
  role: 'student' | 'lecturer' | 'admin';
  matricNumber?: string;
  department?: string;
  level?: string;
  phoneNumber?: string;
}

export interface UpdateUserRequest {
  fullName?: string;
  email?: string;
  matricNumber?: string;
  department?: string;
  level?: string;
  phoneNumber?: string;
  profilePicture?: string;
}

// Course Types
export interface CreateCourseRequest {
  code: string;
  title: string;
  college: string;
  departments: string[];
  units: number;
  level: string;
}

export interface UpdateCourseRequest {
  code?: string;
  title?: string;
  college?: string;
  departments?: string[];
  units?: number;
  level?: string;
}

// Session Types
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

export interface UpdateSessionRequest {
  venueId?: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  location?: {
    latitude: number;
    longitude: number;
    radius: number;
  };
  qrCode?: string;
  sessionCode?: string;
  status?: 'active' | 'ended' | 'upcoming';
}

// Venue Types
export interface CreateVenueRequest {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  radius: number;
  capacity?: number;
  image?: string;
}

export interface UpdateVenueRequest {
  name?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  capacity?: number;
  image?: string;
}

// Institution Types
export interface CreateInstitutionRequest {
  name: string;
  colleges: Array<{
    id: string;
    name: string;
    departments: string[];
  }>;
}

export interface UpdateInstitutionRequest {
  name?: string;
  colleges?: Array<{
    id: string;
    name: string;
    departments: string[];
  }>;
}

// Attendance Types
export interface MarkAttendanceRequest {
  sessionId: string;
  method: 'qr' | 'gps' | 'code';
  location?: {
    latitude: number;
    longitude: number;
  };
  qrData?: string;
  sessionCode?: string;
}

export interface MarkAttendanceResponse {
  success: boolean;
  record?: any; // Will be typed as AttendanceRecord
  message?: string;
}
