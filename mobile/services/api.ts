import { authService } from './auth';
import { lecturerService } from './lecturer';
import { analyticsService } from './analytics';
import { coursesService } from './courses';
import { sessionsService } from './sessions';
import { notificationsService } from './notifications';
import { reportsService } from './reports';
import { examClearanceService } from './exam-clearance';
import { venuesService } from './venues';
import { enrollmentsService } from './enrollments';
import { studentsService } from './students';
import { institutionsService, collegesService, departmentsService } from './institutions';
import { timetablesService } from './timetables';
import { checkInService } from './checkin';
import { adminService } from './admin';
import { usersService } from './users';
import { systemService } from './system';
import { blogService } from './blog';
import { staffService, rbacService } from './staff';

// Re-export services under a single api object for compatibility
export const api = {
  auth: authService,
  lecturer: lecturerService,
  analytics: analyticsService,
  courses: coursesService,
  sessions: sessionsService,
  notifications: notificationsService,
  reports: reportsService,
  examClearance: examClearanceService,
  venues: venuesService,
  enrollments: enrollmentsService,
  students: studentsService,
  institutions: institutionsService,
  colleges: collegesService,
  departments: departmentsService,
  timetables: timetablesService,
  admin: adminService,
  users: usersService,
  checkIn: checkInService,
  system: systemService,
  blog: blogService,
  staff: staffService,
  rbac: rbacService,
  // Backward compatibility mappings
  attendance: analyticsService,
};

export default api;
