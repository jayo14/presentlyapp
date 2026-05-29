/**
 * Shared E2E test helpers and API mock fixtures.
 *
 * All API responses are mocked via Playwright route interception so the tests
 * run without a live backend.
 */

import { Page, Route } from '@playwright/test';

// ─── Fixture data ─────────────────────────────────────────────────────────────

export const STUDENT_USER = {
  id: 'student-uuid-001',
  email: 'student@presently.test',
  full_name: 'Alice Student',
  role: 'STUDENT',
  email_verified: true,
  onboarding_complete: true,
  avatar_url: null,
  matric_number: 'MAT/2021/001',
  level: '300',
  department: 'Computer Science',
  notifications_enabled: true,
  location_enabled: false,
  dark_mode: false,
  timezone: 'UTC',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

export const LECTURER_USER = {
  id: 'lecturer-uuid-002',
  email: 'lecturer@presently.test',
  full_name: 'Dr. Bob Lecturer',
  role: 'LECTURER',
  email_verified: true,
  onboarding_complete: true,
  avatar_url: null,
  staff_id: 'STAFF/2020/001',
  notifications_enabled: true,
  location_enabled: false,
  dark_mode: false,
  timezone: 'UTC',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

export const ADMIN_USER = {
  id: 'admin-uuid-003',
  email: 'admin@presently.test',
  full_name: 'Carol Admin',
  role: 'ADMIN',
  email_verified: true,
  onboarding_complete: true,
  avatar_url: null,
  notifications_enabled: true,
  location_enabled: false,
  dark_mode: false,
  timezone: 'UTC',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

export const MOCK_COURSE = {
  id: 1,
  code: 'CS301',
  title: 'Data Structures',
  department: [1],
  department_name: 'Computer Science',
  credit_units: 3,
  lecturer: 'lecturer-uuid-002',
  lecturer_name: 'Dr. Bob Lecturer',
  is_active: true,
  enrolled_students_count: 25,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

export const MOCK_SESSION = {
  id: 1,
  course: 1,
  course_name: 'Data Structures',
  course_code: 'CS301',
  session_code: 'ABCD1234',
  start_time: new Date(Date.now() - 5 * 60000).toISOString(),
  end_time: new Date(Date.now() + 55 * 60000).toISOString(),
  is_active: true,
  location_radius: 100,
  latitude: 7.5197,
  longitude: 4.5267,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

export const MOCK_ATTENDANCE = {
  id: 1,
  session: 1,
  student: 'student-uuid-001',
  student_name: 'Alice Student',
  course_code: 'CS301',
  checked_in_at: new Date().toISOString(),
  latitude: 7.5197,
  longitude: 4.5267,
  location_verified: true,
  status: 'PRESENT',
};

export const STUDENT_DASHBOARD_DATA = {
  user: {
    id: 'student-uuid-001',
    full_name: 'Alice Student',
    email: 'student@presently.test',
    matric_number: 'MAT/2021/001',
    level: '300',
    department: 'Computer Science',
  },
  enrolled_courses: [
    {
      id: 1,
      course: 1,
      course_code: 'CS301',
      course_name: 'Data Structures',
      course_title: 'Data Structures',
      department: 1,
      credit_units: 3,
      lecturer_name: 'Dr. Bob Lecturer',
      is_active: true,
      enrolled_at: '2024-01-01T00:00:00Z',
      attendance_percentage: 85,
      sessions_attended: 17,
      total_sessions: 20,
      status: 'Good',
    },
  ],
  attendance_stats: {
    average_attendance: 85,
    total_present: 17,
    total_late: 2,
    total_absent: 3,
    total_sessions: 20,
  },
  next_class: {
    id: 1,
    course_code: 'CS301',
    course_name: 'Data Structures',
    start_time: new Date(Date.now() + 3600000).toISOString(),
    venue_name: 'Main Hall',
    venue_code: 'MH-01',
  },
  recent_activity: [
    {
      id: 1,
      type: 'attendance',
      course_code: 'CS301',
      course_name: 'Data Structures',
      timestamp: new Date().toISOString(),
      status: 'PRESENT',
      description: 'Marked present for Data Structures',
    },
  ],
};

export const LECTURER_DASHBOARD_DATA = {
  courses: [MOCK_COURSE],
  sessions: [MOCK_SESSION],
  total_students: 25,
  active_sessions: 1,
};

// ─── Auth token helpers ───────────────────────────────────────────────────────

/** Inject an access token into localStorage so ProtectedRoute passes */
export async function setAuthToken(page: Page, token = 'mock-access-token') {
  await page.evaluate((t) => localStorage.setItem('access_token', t), token);
}

export async function clearAuthToken(page: Page) {
  await page.evaluate(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
  });
}

// ─── API Mock helpers ─────────────────────────────────────────────────────────

/** Register all common API mocks for a given user */
export async function mockApiForUser(page: Page, user: typeof STUDENT_USER | typeof LECTURER_USER | typeof ADMIN_USER) {
  const API = /\/api\//;

  // /auth/me/ → current user
  await page.route('**/api/auth/me/', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ user }),
    });
  });

  // /auth/login/ → success
  await page.route('**/api/auth/login/', async (route: Route) => {
    const body = route.request().postDataJSON();
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        message: 'Login successful',
        user,
        tokens: { access: 'mock-access-token', refresh: 'mock-refresh-token' },
        requires_onboarding: false,
      }),
    });
  });

  // /auth/logout/
  await page.route('**/api/auth/logout/', async (route: Route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
  });

  // /auth/token/refresh/
  await page.route('**/api/auth/token/refresh/', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ access: 'mock-access-token', refresh: 'mock-refresh-token' }),
    });
  });

  // Analytics / dashboard
  await page.route('**/api/analytics/dashboard/student/**', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(STUDENT_DASHBOARD_DATA),
    });
  });

  // Sessions
  await page.route('**/api/sessions/**', async (route: Route) => {
    const method = route.request().method();
    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ results: [MOCK_SESSION], count: 1 }),
      });
    } else if (method === 'POST' && route.request().url().includes('/end/')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, message: 'Session ended' }),
      });
    } else if (method === 'POST' && route.request().url().includes('/check_in/')) {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, attendance: MOCK_ATTENDANCE }),
      });
    } else if (method === 'POST') {
      // Create session
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_SESSION),
      });
    } else {
      await route.continue();
    }
  });

  // Course enrollments
  await page.route('**/api/course-enrollments/**', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    });
  });

  // Courses
  await page.route('**/api/courses/**', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ results: [MOCK_COURSE], count: 1 }),
    });
  });

  // Notifications
  await page.route('**/api/notifications/**', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ results: [], count: 0 }),
    });
  });

  // Timetables
  await page.route('**/api/timetables/**', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    });
  });

  // Institutions
  await page.route('**/api/institutions/**', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ results: [], count: 0 }),
    });
  });

  // Attendances
  await page.route('**/api/attendances/**', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ results: [MOCK_ATTENDANCE], count: 1 }),
    });
  });

  // Check-in by code  
  await page.route('**/api/check-in/**', async (route: Route) => {
    const method = route.request().method();
    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ session: MOCK_SESSION }),
      });
    } else {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, attendance: MOCK_ATTENDANCE }),
      });
    }
  });

  // System stats (admin)
  await page.route('**/api/system/**', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({}),
    });
  });

  // Users (admin)
  await page.route('**/api/users/**', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ results: [user], count: 1 }),
    });
  });

  // Venues (admin)
  await page.route('**/api/venues/**', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ results: [], count: 0 }),
    });
  });

  // Reports
  await page.route('**/api/reports/**', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({}),
    });
  });

  // Analytics (lecturer/admin)
  await page.route('**/api/analytics/**', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({}),
    });
  });
}

/** Simulate a logged-in state by setting the token AND mocking /auth/me/ */
export async function loginAs(page: Page, user: typeof STUDENT_USER | typeof LECTURER_USER | typeof ADMIN_USER) {
  await mockApiForUser(page, user);
  // Set token before navigating so the app finds it on load
  await page.addInitScript((token) => {
    localStorage.setItem('access_token', token);
    localStorage.setItem('refresh_token', 'mock-refresh-token');
  }, 'mock-access-token');
}
