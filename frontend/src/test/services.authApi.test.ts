/**
 * Unit tests for the authApi service functions.
 * All HTTP calls are mocked via vi.mock so no real network traffic occurs.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// ─── Hoist mocks ──────────────────────────────────────────────────────────────
const { mockPost, mockGet, mockAxiosInstance } = vi.hoisted(() => {
  const mockPost = vi.fn();
  const mockGet = vi.fn();
  const instance: any = {
    post: mockPost,
    get: mockGet,
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
    defaults: { headers: { common: {} } },
  };
  return { mockPost, mockGet, mockAxiosInstance: instance };
});

vi.mock('axios', () => ({
  default: { create: vi.fn(() => mockAxiosInstance) },
}));

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn(), info: vi.fn() },
}));

import { authApi } from '../../services/api/auth';

describe('authApi', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  // ── login ─────────────────────────────────────────────────────────────────
  describe('login', () => {
    it('stores tokens on successful login with rememberMe=true', async () => {
      mockPost.mockResolvedValueOnce({
        data: {
          success: true,
          tokens: { access: 'acc_tok', refresh: 'ref_tok' },
          user: { id: '1', email: 'student@test.com', full_name: 'Test', role: 'STUDENT', onboarding_complete: true },
        },
      });

      const result = await authApi.login({ email: 'student@test.com', password: 'pass', rememberMe: true });

      expect(result.success).toBe(true);
      expect(localStorage.getItem('access_token')).toBe('acc_tok');
      expect(localStorage.getItem('refresh_token')).toBe('ref_tok');
    });

    it('stores tokens in sessionStorage when rememberMe=false', async () => {
      mockPost.mockResolvedValueOnce({
        data: {
          success: true,
          tokens: { access: 'acc', refresh: 'ref' },
          user: { id: '1', email: 'x@y.com', full_name: 'X', role: 'STUDENT', onboarding_complete: true },
        },
      });

      await authApi.login({ email: 'x@y.com', password: 'pass', rememberMe: false });
      expect(sessionStorage.getItem('access_token')).toBe('acc');
      expect(localStorage.getItem('access_token')).toBeNull();
    });

    it('propagates API errors', async () => {
      mockPost.mockRejectedValueOnce(new Error('Network Error'));
      await expect(authApi.login({ email: 'bad@bad.com', password: 'x' })).rejects.toThrow('Network Error');
    });
  });

  // ── register ─────────────────────────────────────────────────────────────
  describe('register', () => {
    it('stores tokens on successful registration', async () => {
      mockPost.mockResolvedValueOnce({
        data: {
          success: true,
          tokens: { access: 'racc', refresh: 'rref' },
          user: { id: '2', email: 'new@test.com', full_name: 'New', role: 'STUDENT', onboarding_complete: false },
          requires_onboarding: true,
        },
      });

      const result = await authApi.register({
        email: 'new@test.com',
        full_name: 'New User',
        password: 'password123',
        password2: 'password123',
      });

      expect(result.success).toBe(true);
      expect(result.requires_onboarding).toBe(true);
      expect(localStorage.getItem('access_token')).toBe('racc');
    });
  });

  // ── logout ────────────────────────────────────────────────────────────────
  describe('logout', () => {
    it('clears tokens after logout', async () => {
      localStorage.setItem('access_token', 'tok');
      localStorage.setItem('refresh_token', 'ref');

      mockPost.mockResolvedValueOnce({ data: {} });

      await authApi.logout();

      expect(localStorage.getItem('access_token')).toBeNull();
      expect(localStorage.getItem('refresh_token')).toBeNull();
    });

    it('clears tokens even if API call throws', async () => {
      localStorage.setItem('access_token', 'tok');
      mockPost.mockRejectedValueOnce(new Error('Server error'));

      // The error propagates (try/finally), but tokens are still cleared
      await expect(authApi.logout()).rejects.toThrow('Server error');
      expect(localStorage.getItem('access_token')).toBeNull();
    });
  });

  // ── getCurrentUser ────────────────────────────────────────────────────────
  describe('getCurrentUser', () => {
    it('returns user profile data', async () => {
      const mockUser = {
        id: '3', email: 'cur@test.com', full_name: 'Current User',
        role: 'STUDENT', onboarding_complete: true,
        notifications_enabled: true, location_enabled: false,
        dark_mode: false, timezone: 'UTC', created_at: '', updated_at: '',
      };
      mockGet.mockResolvedValueOnce({ status: 200, data: { user: mockUser } });

      const user = await authApi.getCurrentUser();
      expect(user.email).toBe('cur@test.com');
      expect(user.role).toBe('STUDENT');
    });
  });

  // ── isAuthenticated ───────────────────────────────────────────────────────
  describe('isAuthenticated', () => {
    it('returns false with no token', () => {
      expect(authApi.isAuthenticated()).toBe(false);
    });

    it('returns true when token in localStorage', () => {
      localStorage.setItem('access_token', 'valid');
      expect(authApi.isAuthenticated()).toBe(true);
    });
  });
});
