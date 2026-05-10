/**
 * Unit tests for React hooks: useCurrentUser, useLogin, useLogout, useRegister.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { UserRole } from '../../types';

// ─── Hoist mocks ──────────────────────────────────────────────────────────────
const { mockLogin, mockLogout, mockRegister, mockGetCurrentUser, mockNavigate } = vi.hoisted(() => ({
  mockLogin: vi.fn(),
  mockLogout: vi.fn(),
  mockRegister: vi.fn(),
  mockGetCurrentUser: vi.fn(),
  mockNavigate: vi.fn(),
}));

vi.mock('../../services/api/auth', () => ({
  authApi: {
    login: mockLogin,
    logout: mockLogout,
    register: mockRegister,
    getCurrentUser: mockGetCurrentUser,
    isAuthenticated: () => true,
    sendVerificationOTP: vi.fn(),
    verifyEmailOTP: vi.fn(),
  },
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../../services/api/institutions', () => ({
  institutionsApi: {
    getAllInstitutions: vi.fn(),
  },
}));

vi.mock('../../services/api/student', () => ({
  studentApi: {
    getDashboard: vi.fn(),
  },
}));

import { useCurrentUser, useLogin, useLogout, useRegister } from '../../hooks/useAuth';

function makeWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
  return { qc, Wrapper };
}

const STUDENT_USER = {
  id: 'uuid-student',
  email: 'student@test.com',
  full_name: 'Test Student',
  role: UserRole.STUDENT,
  onboarding_complete: true,
  email_verified: true,
  notifications_enabled: true,
  location_enabled: false,
  dark_mode: false,
  timezone: 'UTC',
  created_at: '',
  updated_at: '',
};

describe('useCurrentUser', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns user data on success', async () => {
    mockGetCurrentUser.mockResolvedValueOnce(STUDENT_USER);
    const { Wrapper } = makeWrapper();
    const { result } = renderHook(() => useCurrentUser(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.role).toBe(UserRole.STUDENT);
    expect(result.current.data?.email).toBe('student@test.com');
  });

  it('sets error state on fetch failure', async () => {
    mockGetCurrentUser.mockRejectedValueOnce(new Error('Unauthorized'));
    const { Wrapper } = makeWrapper();
    const { result } = renderHook(() => useCurrentUser(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
  });
});

describe('useLogin', () => {
  beforeEach(() => vi.clearAllMocks());

  it('navigates to /dashboard after successful login', async () => {
    mockLogin.mockResolvedValueOnce({
      success: true,
      requires_onboarding: false,
      user: STUDENT_USER,
      tokens: { access: 'a', refresh: 'r' },
    });
    const { Wrapper } = makeWrapper();
    const { result } = renderHook(() => useLogin(), { wrapper: Wrapper });

    act(() => {
      result.current.mutate({ email: 'student@test.com', password: 'pass' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    // Navigation happens inside a setTimeout(100ms) in the hook
    await new Promise((r) => setTimeout(r, 150));
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('navigates to /onboarding when onboarding is required', async () => {
    mockLogin.mockResolvedValueOnce({
      success: true,
      requires_onboarding: true,
      user: { ...STUDENT_USER, onboarding_complete: false },
      tokens: { access: 'a', refresh: 'r' },
    });
    const { Wrapper } = makeWrapper();
    const { result } = renderHook(() => useLogin(), { wrapper: Wrapper });

    act(() => {
      result.current.mutate({ email: 'new@test.com', password: 'pass' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    await new Promise((r) => setTimeout(r, 150));
    expect(mockNavigate).toHaveBeenCalledWith('/onboarding');
  });

  it('exposes error state on failed login', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Invalid credentials'));
    const { Wrapper } = makeWrapper();
    const { result } = renderHook(() => useLogin(), { wrapper: Wrapper });

    act(() => {
      result.current.mutate({ email: 'bad@bad.com', password: 'wrong' });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe('useLogout', () => {
  beforeEach(() => vi.clearAllMocks());

  it('navigates to /login after logout', async () => {
    mockLogout.mockResolvedValueOnce(undefined);
    const { Wrapper } = makeWrapper();
    const { result } = renderHook(() => useLogout(), { wrapper: Wrapper });

    act(() => {
      result.current.mutate();
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});

describe('useRegister', () => {
  beforeEach(() => vi.clearAllMocks());

  it('navigates to /onboarding after successful registration', async () => {
    mockRegister.mockResolvedValueOnce({
      success: true,
      requires_onboarding: true,
      user: { ...STUDENT_USER, onboarding_complete: false },
      tokens: { access: 'a', refresh: 'r' },
    });
    const { Wrapper } = makeWrapper();
    const { result } = renderHook(() => useRegister(), { wrapper: Wrapper });

    act(() => {
      result.current.mutate({ email: 'new@test.com', full_name: 'New User', password: 'pass123', password2: 'pass123' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockNavigate).toHaveBeenCalledWith('/onboarding');
  });

  it('navigates to /dashboard if onboarding not required', async () => {
    mockRegister.mockResolvedValueOnce({
      success: true,
      requires_onboarding: false,
      user: STUDENT_USER,
      tokens: { access: 'a', refresh: 'r' },
    });
    const { Wrapper } = makeWrapper();
    const { result } = renderHook(() => useRegister(), { wrapper: Wrapper });

    act(() => {
      result.current.mutate({ email: 's@t.com', full_name: 'Student', password: 'pass123', password2: 'pass123' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });
});
