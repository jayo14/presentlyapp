import ENV from './env';

// API Configuration
export const API_CONFIG = {
  BASE_URL: ENV.API_URL,
  TIMEOUT: ENV.API_TIMEOUT,
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: 'auth/login/',
    REGISTER: 'auth/register/',
    VERIFY_EMAIL: 'auth/email-verification/verify/',
    SEND_EMAIL_VERIFICATION: 'auth/email-verification/send/',
    REQUEST_PASSWORD_RESET: 'auth/password-reset/request/',
    VERIFY_PASSWORD_RESET: 'auth/password-reset/verify/',
    CONFIRM_PASSWORD_RESET: 'auth/password-reset/confirm/',
    CHANGE_PASSWORD: 'auth/change-password/',
    GOOGLE_AUTH: 'auth/google-auth/',
    ONBOARDING: 'auth/onboarding/',
    LOGOUT: 'auth/logout/',
    ME: 'auth/me/',
    REFRESH_TOKEN: 'auth/token/refresh/',
    UPLOAD_AVATAR: 'auth/upload-avatar/',
  },
  // Check-in
  CHECK_IN: {
    GET: (code: string) => `check-in/${code}/`,
    MARK: (code: string) => `check-in/${code}/`,
  },
  // Analytics
  ANALYTICS: {
    DASHBOARD: 'analytics/dashboard/',
    STUDENT_DASHBOARD: 'analytics/dashboard/student/',
    LECTURER_DASHBOARD: 'analytics/dashboard/lecturer/',
    ADMIN_DASHBOARD: 'analytics/dashboard/admin/',
    COURSE: (courseId: string) => `analytics/attendance/course/${courseId}/`,
    COURSE_EXPORT: (courseId: string, fmt: string) => `analytics/attendance/course/${courseId}/export/${fmt}/`,
    STUDENT: (studentId: string) => `analytics/attendance/student/${studentId}/`,
    TRENDS: 'analytics/attendance/trends/',
    OVERVIEW: 'analytics/attendance/overview/',
    COLLEGE: (collegeId: string) => `analytics/college/${collegeId}/analytics/`,
    DEPARTMENT: (departmentId: string) => `analytics/department/${departmentId}/analytics/`,
    COMPARISON: 'analytics/courses/comparison/',
    STATISTICS: 'analytics/courses/statistics/',
    SESSION: (sessionId: string) => `analytics/sessions/${sessionId}/analytics/`,
    PREDICTIONS_ATTENDANCE: 'analytics/predictions/attendance/',
    PREDICTIONS_DROPOUTS: 'analytics/predictions/dropouts/',
    LIVE_SESSIONS: 'analytics/sessions/live/',
    SESSIONS_STATS: 'analytics/sessions/statistics/',
    AT_RISK_STUDENTS: 'analytics/students/at-risk/',
    ENGAGEMENT: 'analytics/students/engagement/',
    PERFORMANCE: 'analytics/students/performance/',
  },
  // Attendances
  ATTENDANCES: {
    LIST: 'attendances/',
    GET: (id: string) => `attendances/${id}/`,
    CREATE: 'attendances/',
    UPDATE: (id: string) => `attendances/${id}/`,
    DELETE: (id: string) => `attendances/${id}/`,
  },
  // Colleges
  COLLEGES: {
    LIST: 'colleges/',
    GET: (id: string) => `colleges/${id}/`,
    CREATE: 'colleges/',
    UPDATE: (id: string) => `colleges/${id}/`,
    DELETE: (id: string) => `colleges/${id}/`,
  },
  // Departments
  DEPARTMENTS: {
    LIST: 'departments/',
    GET: (id: string) => `departments/${id}/`,
    CREATE: 'departments/',
    UPDATE: (id: string) => `departments/${id}/`,
    DELETE: (id: string) => `departments/${id}/`,
    COURSES: (id: string) => `departments/${id}/courses/`,
  },
  // Courses
  COURSES: {
    LIST: 'courses/',
    GET: (id: string) => `courses/${id}/`,
    CREATE: 'courses/',
    UPDATE: (id: string) => `courses/${id}/`,
    DELETE: (id: string) => `courses/${id}/`,
    AVAILABLE: 'courses/available/',
    ENROLLED_STUDENTS: (id: string) => `courses/${id}/enrolled_students/`,
    SEARCH: 'courses/search/',
    REGISTER: (id: string) => `courses/${id}/register/`,
    DROP: (id: string) => `courses/${id}/drop/`,
  },
  // Course Enrollments
  ENROLLMENTS: {
    LIST: 'course-enrollments/',
    CREATE: 'course-enrollments/',
    ENROLL: 'course-enrollments/enroll/',
    GET: (id: string) => `course-enrollments/${id}/`,
    UPDATE: (id: string) => `course-enrollments/${id}/`,
    DELETE: (id: string) => `course-enrollments/${id}/`,
    DROP: (id: string) => `course-enrollments/${id}/drop/`,
  },
  // Institutions
  INSTITUTIONS: {
    LIST: 'institutions/',
    GET: (id: string) => `institutions/${id}/`,
    CREATE: 'institutions/',
    UPDATE: (id: string) => `institutions/${id}/`,
    DELETE: (id: string) => `institutions/${id}/`,
  },
  // Sessions
  SESSIONS: {
    LIST: 'sessions/',
    GET: (id: string) => `sessions/${id}/`,
    CREATE: 'sessions/',
    UPDATE: (id: string) => `sessions/${id}/`,
    DELETE: (id: string) => `sessions/${id}/`,
    CHECK_IN: (id: string) => `sessions/${id}/check_in/`,
    END: (id: string) => `sessions/${id}/end/`,
  },
  // Users
  USERS: {
    LIST: 'users/',
    GET: (id: string) => `users/${id}/`,
    CREATE: 'users/',
    UPDATE: (id: string) => `users/${id}/`,
    DELETE: (id: string) => `users/${id}/`,
    RESET_PASSWORD: (id: string) => `users/${id}/reset-password/`,
  },
  // Venues
  VENUES: {
    LIST: 'venues/',
    GET: (id: string) => `venues/${id}/`,
    CREATE: 'venues/',
    UPDATE: (id: string) => `venues/${id}/`,
    DELETE: (id: string) => `venues/${id}/`,
    SESSIONS: (id: string) => `venues/${id}/sessions/`,
    ACTIVE_SESSIONS: 'venues/active_sessions/',
  },
  // Notifications
  NOTIFICATIONS: {
    LIST: 'notifications/',
    BROADCAST: 'notifications/broadcast/',
    UNREAD_COUNT: 'notifications/unread-count/',
    MARK_ALL_READ: 'notifications/mark-all-read/',
    SEND: 'notifications/send/',
    READ: (id: string) => `notifications/${id}/read/`,
    PREFERENCES: 'notifications/preferences/',
    DEVICES: 'notifications/devices/',
    REGISTER_DEVICE: 'notifications/devices/register/',
    DEACTIVATE_DEVICE: (id: string) => `notifications/devices/${id}/deactivate/`,
  },
  // System
  SYSTEM: {
    ACTIVITY: 'system/activity/',
    ALERTS: 'system/alerts/',
    CONFIG: 'system/config/',
    LOGS: 'system/logs/',
    LOGS_EXPORT_CSV: 'system/logs/export/csv/',
    STATS: 'system/stats/',
  },
  // Timetables
  TIMETABLES: {
    LIST: 'timetables/',
    GET: (id: string) => `timetables/${id}/`,
  },
  // Reports
  REPORTS: {
    LIST: 'reports/',
    GENERATE: (type: string) => `reports/generate/${type}/`,
    EXPORT: (type: string) => `reports/export/${type}/`,
    DOWNLOAD: (id: string) => `reports/${id}/download/`,
    DELETE: (id: string) => `reports/${id}/delete/`,
    SCHEDULED: 'reports/scheduled/',
    CREATE_SCHEDULED: 'reports/scheduled/create/',
    TOGGLE_SCHEDULED: (id: string) => `reports/scheduled/${id}/toggle/`,
  },
  // Exam Clearance
  EXAM_CLEARANCE: {
    LIST: 'exam-clearance/',
    CALCULATE_ALL: 'exam-clearance/calculate-all/',
    GENERATE: 'exam-clearance/generate/',
    GET: (id: string) => `exam-clearance/${id}/`,
    APPROVE: (id: string) => `exam-clearance/${id}/approve/`,
    REJECT: (id: string) => `exam-clearance/${id}/reject/`,
    REPORT: 'exam-clearance/report/',
    CERTIFICATE: (id: string) => `exam-clearance/${id}/certificate/`,
    COURSE: (courseId: string) => `exam-clearance/course/${courseId}/`,
  },
  // Blog
  BLOG: {
    POSTS: 'blog/posts/',
    POST_DETAIL: (slug: string) => `blog/posts/${slug}/`,
    TAGS: 'blog/tags/',
    CATEGORIES: 'blog/categories/',
    SUBSCRIBE: 'blog/newsletter/subscribe/',
    ADMIN_POSTS: 'blog/admin/posts/',
    ADMIN_CATEGORIES: 'blog/admin/categories/',
    ADMIN_TAGS: 'blog/admin/tags/',
    ADMIN_SUBSCRIBERS: 'blog/admin/subscribers/',
  },
  // Billing
  BILLING: {
    ME: 'billing/me/',
    CHECKOUT: 'billing/checkout/',
  },
  // RBAC & Staff
  RBAC: {
    PERMISSIONS: 'rbac/permissions/',
    ROLES: 'rbac/roles/',
  },
  STAFF: {
    PROFILES: 'staff/',
    UPDATE: (id: string) => `staff/${id}/`,
    INVITATIONS: 'staff/invitations/',
    INVITE: 'staff/invitations/invite/',
    RESEND_INVITE: (id: number) => `staff/invitations/${id}/resend/`,
    REVOKE_INVITE: (id: number) => `staff/invitations/${id}/revoke/`,
    ACCEPT_INVITE: 'auth/staff-invitations/accept/',
  },
};
