/**
 * Unit tests for the token manager and auth API helper.
 *
 * These tests do NOT hit the network – they verify that the tokenManager
 * correctly reads/writes from localStorage / sessionStorage and that the
 * authApi helper functions compose the right data before calling axios.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// ─── Hoist mocks so they're available inside vi.mock factories ────────────────
const { mockAxiosInstance } = vi.hoisted(() => {
  const instance: any = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
    defaults: { headers: { common: {} } },
  };
  return { mockAxiosInstance: instance };
});

vi.mock('axios', () => ({
  default: { create: vi.fn(() => mockAxiosInstance) },
}));

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn(), info: vi.fn() },
}));

// ─── Import AFTER mocks are registered ────────────────────────────────────────
import { tokenManager } from '../../services/api/client';

// ─────────────────────────────────────────────────────────────────────────────
// tokenManager
// ─────────────────────────────────────────────────────────────────────────────
describe('tokenManager', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('setTokens / getAccessToken / getRefreshToken', () => {
    it('stores tokens in localStorage when rememberMe=true', () => {
      tokenManager.setTokens('access123', 'refresh456', true);
      expect(localStorage.getItem('access_token')).toBe('access123');
      expect(localStorage.getItem('refresh_token')).toBe('refresh456');
      expect(sessionStorage.getItem('access_token')).toBeNull();
    });

    it('stores tokens in sessionStorage when rememberMe=false', () => {
      tokenManager.setTokens('access123', 'refresh456', false);
      expect(sessionStorage.getItem('access_token')).toBe('access123');
      expect(sessionStorage.getItem('refresh_token')).toBe('refresh456');
      expect(localStorage.getItem('access_token')).toBeNull();
    });

    it('getAccessToken returns localStorage token when present', () => {
      localStorage.setItem('access_token', 'mytoken');
      expect(tokenManager.getAccessToken()).toBe('mytoken');
    });

    it('getAccessToken falls back to sessionStorage', () => {
      sessionStorage.setItem('access_token', 'sesstoken');
      expect(tokenManager.getAccessToken()).toBe('sesstoken');
    });

    it('getAccessToken returns null when no token exists', () => {
      expect(tokenManager.getAccessToken()).toBeNull();
    });

    it('getRefreshToken returns null when no token exists', () => {
      expect(tokenManager.getRefreshToken()).toBeNull();
    });
  });

  describe('clearTokens', () => {
    it('removes tokens from both storages', () => {
      localStorage.setItem('access_token', 'a');
      localStorage.setItem('refresh_token', 'r');
      sessionStorage.setItem('access_token', 'a2');
      tokenManager.clearTokens();
      expect(localStorage.getItem('access_token')).toBeNull();
      expect(localStorage.getItem('refresh_token')).toBeNull();
      expect(sessionStorage.getItem('access_token')).toBeNull();
    });
  });

  describe('isAuthenticated helper (via authApi)', () => {
    it('returns false when no access token', async () => {
      const { authApi } = await import('../../services/api/auth');
      expect(authApi.isAuthenticated()).toBe(false);
    });

    it('returns true when access token exists', async () => {
      localStorage.setItem('access_token', 'valid_token');
      const { authApi } = await import('../../services/api/auth');
      expect(authApi.isAuthenticated()).toBe(true);
    });
  });

  describe('getRememberMe', () => {
    it('defaults to true when nothing stored', () => {
      expect(tokenManager.getRememberMe()).toBe(true);
    });

    it('returns true when localStorage preference is true', () => {
      localStorage.setItem('remember_me', 'true');
      expect(tokenManager.getRememberMe()).toBe(true);
    });

    it('returns false when sessionStorage preference is false', () => {
      sessionStorage.setItem('remember_me', 'false');
      expect(tokenManager.getRememberMe()).toBe(false);
    });
  });
});
