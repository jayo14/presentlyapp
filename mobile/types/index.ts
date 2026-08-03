export interface User {
  id: string;
  fullName: string;
  email: string;
  matricNumber: string;
  department: string;
  level: string;
  deviceId: string;
  emailVerified: boolean;
  createdAt: string;
  role?: 'student' | 'lecturer' | 'admin';
  phoneNumber?: string;
  profilePicture?: string;
  school?: string;
  college?: string;
  institutionId?: string;
  onboardingCompleted?: boolean;
}

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

export interface Department {
  id: string;
  name: string;
}

export interface College {
  id: string;
  name: string;
  departments: string[];
}

export interface School {
  id: string;
  name: string;
  colleges: College[];
}

export interface LecturerCourse {
  id: string;
  code: string;
  title: string;
  college: string;
  departments: string[];
  units: number;
  level: string;
  creatorId: string;
  createdAt: string;
}

export interface Session {
  id: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  lecturerId: string;
  lecturerName: string;
  venueId?: string;
  venueName?: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  duration: number; // in minutes
  location: {
    latitude: number;
    longitude: number;
    radius: number;
  };
  qrCode?: string;
  sessionCode?: string;
  status: 'active' | 'ended' | 'upcoming';
  date: string; // ISO date string YYYY-MM-DD
}

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE';

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  studentId: string;
  studentName?: string;
  studentMatric?: string;
  courseId?: string;
  courseCode: string;
  courseName: string;
  timestamp: string;
  method: 'qr' | 'gps' | 'code';
  status: AttendanceStatus;
}

export interface AttendanceStats {
  totalSessions: number;
  attended: number;
  percentage: number;
  status: 'eligible' | 'at-risk' | 'not-eligible';
}

export interface Course {
  id: string;
  code: string;
  name: string;
  totalSessions: number;
  attendedSessions: number;
  percentage: number;
}
