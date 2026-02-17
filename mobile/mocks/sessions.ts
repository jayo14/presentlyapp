import type { Session, AttendanceRecord, Course } from '@/types';

export const mockActiveSessions: Session[] = [
  {
    id: '1',
    courseId: 'course-1',
    courseCode: 'CS 402',
    courseName: 'Database Management Systems',
    lecturerId: 'lecturer-1',
    lecturerName: 'Prof. Adeleke',
    startTime: new Date(Date.now() - 30 * 60000).toISOString(),
    endTime: new Date(Date.now() + 30 * 60000).toISOString(),
    duration: 60,
    location: {
      latitude: 6.5244,
      longitude: 3.3792,
      radius: 50,
    },
    qrCode: 'QR_CS402_SESSION_001',
    sessionCode: 'ABC123XY',
    status: 'active',
    date: new Date().toISOString().split('T')[0],
  },
];

export const mockAttendanceHistory: AttendanceRecord[] = [
  {
    id: '1',
    sessionId: '1',
    studentId: '1',
    courseCode: 'CS 402',
    courseName: 'Database Management Systems',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60000).toISOString(),
    method: 'qr',
    status: 'PRESENT',
  },
  {
    id: '2',
    sessionId: '2',
    studentId: '1',
    courseCode: 'CS 401',
    courseName: 'Software Engineering',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60000).toISOString(),
    method: 'gps',
    status: 'PRESENT',
  },
  {
    id: '3',
    sessionId: '3',
    studentId: '1',
    courseCode: 'CS 403',
    courseName: 'Computer Networks',
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60000).toISOString(),
    method: 'qr',
    status: 'PRESENT',
  },
];

export const mockCourses: Course[] = [
  {
    id: '1',
    code: 'CS 402',
    name: 'Database Management Systems',
    totalSessions: 12,
    attendedSessions: 10,
    percentage: 83,
  },
  {
    id: '2',
    code: 'CS 401',
    name: 'Software Engineering',
    totalSessions: 10,
    attendedSessions: 9,
    percentage: 90,
  },
  {
    id: '3',
    code: 'CS 403',
    name: 'Computer Networks',
    totalSessions: 11,
    attendedSessions: 8,
    percentage: 73,
  },
  {
    id: '4',
    code: 'CS 404',
    name: 'Artificial Intelligence',
    totalSessions: 9,
    attendedSessions: 7,
    percentage: 78,
  },
];
