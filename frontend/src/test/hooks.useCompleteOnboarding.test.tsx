/**
 * Unit tests for the useCompleteOnboarding hook.
 *
 * Verifies that:
 *  - Calling the mutation invokes authApi.completeOnboarding with the right data
 *  - On success the query cache is updated with the returned user profile
 *  - On success the user is navigated to /dashboard
 *  - On error the hook exposes isError state
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { UserRole } from '../../types';

// ─── Hoist mocks ──────────────────────────────────────────────────────────────
const { mockCompleteOnboarding, mockNavigate } = vi.hoisted(() => ({
  mockCompleteOnboarding: vi.fn(),
  mockNavigate: vi.fn(),
}));

vi.mock('../../services/api/auth', () => ({
  authApi: {
    completeOnboarding: mockCompleteOnboarding,
    isAuthenticated: () => true,
    getCurrentUser: vi.fn(),
  },
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

import { useCompleteOnboarding } from '../../hooks/useAuth';

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

const STUDENT_PROFILE = {
  id: 'uuid-student',
  email: 'student@test.com',
  full_name: 'Test Student',
  role: UserRole.STUDENT,
  onboarding_complete: true,
  notifications_enabled: true,
  location_enabled: false,
  dark_mode: false,
  timezone: 'UTC',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const LECTURER_PROFILE = {
  ...STUDENT_PROFILE,
  id: 'uuid-lecturer',
  email: 'lecturer@test.com',
  full_name: 'Dr. Lecturer',
  role: UserRole.LECTURER,
};

const ADMIN_PROFILE = {
  ...STUDENT_PROFILE,
  id: 'uuid-admin',
  email: 'admin@test.com',
  full_name: 'Admin User',
  role: UserRole.ADMIN,
};

describe('useCompleteOnboarding', () => {
  beforeEach(() => vi.clearAllMocks());

  it('calls completeOnboarding with student data and navigates to /dashboard', async () => {
    mockCompleteOnboarding.mockResolvedValueOnce(STUDENT_PROFILE);
    const { Wrapper } = makeWrapper();
    const { result } = renderHook(() => useCompleteOnboarding(), { wrapper: Wrapper });

    act(() => {
      result.current.mutate({
        role: UserRole.STUDENT,
        matric_number: 'MAT/2024/001',
        level: '300',
        institution: 1,
        college: 1,
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockCompleteOnboarding).toHaveBeenCalledWith({
      role: UserRole.STUDENT,
      matric_number: 'MAT/2024/001',
      level: '300',
      institution: 1,
      college: 1,
    });
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('navigates to /dashboard on successful lecturer onboarding', async () => {
    mockCompleteOnboarding.mockResolvedValueOnce(LECTURER_PROFILE);
    const { Wrapper } = makeWrapper();
    const { result } = renderHook(() => useCompleteOnboarding(), { wrapper: Wrapper });

    act(() => {
      result.current.mutate({
        role: UserRole.LECTURER,
        staff_id: 'STAFF/2024/001',
        institution: 1,
        college: 1,
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('navigates to /dashboard on successful admin onboarding', async () => {
    mockCompleteOnboarding.mockResolvedValueOnce(ADMIN_PROFILE);
    const { Wrapper } = makeWrapper();
    const { result } = renderHook(() => useCompleteOnboarding(), { wrapper: Wrapper });

    act(() => {
      result.current.mutate({ role: UserRole.ADMIN, institution: 1 });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('exposes isError when completeOnboarding throws', async () => {
    mockCompleteOnboarding.mockRejectedValueOnce(new Error('Validation failed'));
    const { Wrapper } = makeWrapper();
    const { result } = renderHook(() => useCompleteOnboarding(), { wrapper: Wrapper });

    act(() => {
      result.current.mutate({ role: UserRole.STUDENT });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('updates the query cache with returned user data on success', async () => {
    mockCompleteOnboarding.mockResolvedValueOnce(STUDENT_PROFILE);
    const { qc, Wrapper } = makeWrapper();
    const { result } = renderHook(() => useCompleteOnboarding(), { wrapper: Wrapper });

    act(() => {
      result.current.mutate({ role: UserRole.STUDENT, matric_number: 'MAT/001', level: '100', institution: 1, college: 1 });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const cached = qc.getQueryData(['currentUser']);
    expect(cached).toEqual(STUDENT_PROFILE);
  });
});
