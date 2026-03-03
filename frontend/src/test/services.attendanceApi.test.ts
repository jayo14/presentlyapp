/**
 * Unit tests for the attendance / session API service functions.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// ─── Hoist mocks ──────────────────────────────────────────────────────────────
const { mockPost, mockGet, mockDelete, mockPatch, mockAxiosInstance } = vi.hoisted(() => {
  const mockPost = vi.fn();
  const mockGet = vi.fn();
  const mockDelete = vi.fn();
  const mockPatch = vi.fn();
  const instance: any = {
    post: mockPost,
    get: mockGet,
    delete: mockDelete,
    patch: mockPatch,
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
    defaults: { headers: { common: {} } },
  };
  return { mockPost, mockGet, mockDelete, mockPatch, mockAxiosInstance: instance };
});

vi.mock('axios', () => ({
  default: { create: vi.fn(() => mockAxiosInstance) },
}));

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn(), info: vi.fn() },
}));

import { sessionApi, attendanceApi, courseApi } from '../../services/api/attendance';

const makeSession = (overrides = {}) => ({
  id: 1,
  course: 10,
  course_name: 'Test Course',
  course_code: 'CS101',
  session_code: 'ABCD1234',
  start_time: new Date().toISOString(),
  end_time: new Date(Date.now() + 3600000).toISOString(),
  is_active: true,
  location_radius: 100,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

describe('sessionApi', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('getAll', () => {
    it('returns array of sessions', async () => {
      const sessions = [makeSession()];
      mockGet.mockResolvedValueOnce({ data: { results: sessions } });
      const result = await sessionApi.getAll();
      expect(result).toHaveLength(1);
      expect(result[0].course_code).toBe('CS101');
    });

    it('handles response without results wrapper', async () => {
      const sessions = [makeSession()];
      mockGet.mockResolvedValueOnce({ data: sessions });
      const result = await sessionApi.getAll();
      expect(result).toHaveLength(1);
    });
  });

  describe('create', () => {
    it('creates a new session', async () => {
      const session = makeSession();
      mockPost.mockResolvedValueOnce({ data: session });
      const result = await sessionApi.create({ course: 10 });
      expect(result.id).toBe(1);
      expect(mockPost).toHaveBeenCalledWith('/sessions/', { course: 10 });
    });
  });

  describe('end', () => {
    it('ends an active session', async () => {
      const ended = makeSession({ is_active: false });
      mockPost.mockResolvedValueOnce({ data: ended });
      const result = await sessionApi.end(1);
      expect(result.is_active).toBe(false);
      expect(mockPost).toHaveBeenCalledWith('/sessions/1/end/');
    });
  });

  describe('checkIn', () => {
    it('sends check-in data and returns attendance record', async () => {
      const attendance = {
        id: 1, session: 1, student: 'student-uuid',
        checked_in_at: new Date().toISOString(),
        location_verified: true, status: 'PRESENT',
      };
      mockPost.mockResolvedValueOnce({ data: { attendance } });
      const result = await sessionApi.checkIn(1, { latitude: 10.0, longitude: 10.0 });
      expect(result.status).toBe('PRESENT');
    });
  });

  describe('checkInByCode', () => {
    it('sends check-in by session code', async () => {
      const attendance = { id: 2, session: 1, student: 'uid', status: 'PRESENT', location_verified: true, checked_in_at: '' };
      mockPost.mockResolvedValueOnce({ data: { attendance } });
      const result = await sessionApi.checkInByCode('ABCD1234', { latitude: 10.0, longitude: 10.0 });
      expect(result.status).toBe('PRESENT');
    });
  });

  describe('delete', () => {
    it('calls delete endpoint', async () => {
      mockDelete.mockResolvedValueOnce({ data: {} });
      await sessionApi.delete(1);
      expect(mockDelete).toHaveBeenCalledWith('/sessions/1/');
    });
  });
});

describe('attendanceApi', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('getAll', () => {
    it('returns filtered attendance records', async () => {
      const records = [{ id: 1, session: 1, student: 's1', status: 'PRESENT', checked_in_at: '' }];
      mockGet.mockResolvedValueOnce({ data: { results: records } });
      const result = await attendanceApi.getAll({ session: 1 });
      expect(result).toHaveLength(1);
      expect(mockGet).toHaveBeenCalledWith('/attendances/', { params: { session: 1 } });
    });
  });

  describe('update', () => {
    it('patches attendance record status', async () => {
      const updated = { id: 1, session: 1, student: 's1', status: 'EXCUSED', checked_in_at: '', location_verified: true };
      mockPatch.mockResolvedValueOnce({ data: updated });
      const result = await attendanceApi.update(1, { status: 'EXCUSED' });
      expect(result.status).toBe('EXCUSED');
    });
  });
});

describe('courseApi', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('getAll', () => {
    it('returns list of courses', async () => {
      const courses = [{ id: 1, code: 'CS101', title: 'Test', department: [], credit_units: 3, is_active: true, created_at: '', updated_at: '' }];
      mockGet.mockResolvedValueOnce({ data: { results: courses } });
      const result = await courseApi.getAll();
      expect(result[0].code).toBe('CS101');
    });
  });
});

