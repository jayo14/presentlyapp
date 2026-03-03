/**
 * Component unit tests for ProtectedRoute.
 *
 * Tests:
 *  - Shows a loading spinner while auth is in flight
 *  - Redirects to /login when no user is authenticated
 *  - Renders children when user is present
 *  - Redirects to /unauthorized for wrong role
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserRole } from '../../types';

// ─── Mock useCurrentUser ──────────────────────────────────────────────────────
const mockUseCurrentUser = vi.fn();
vi.mock('../../hooks/useAuth', () => ({
  useCurrentUser: () => mockUseCurrentUser(),
}));

import { ProtectedRoute } from '../../components/ProtectedRoute';

function renderWithRouter(ui: React.ReactElement, initialPath = '/protected') {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/protected" element={ui} />
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/unauthorized" element={<div>Unauthorized Page</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('ProtectedRoute', () => {
  it('shows loading spinner while auth is loading', () => {
    mockUseCurrentUser.mockReturnValue({ data: undefined, isLoading: true });
    renderWithRouter(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );
    // Spinner div is present (the animate-spin class)
    expect(document.querySelector('.animate-spin')).toBeTruthy();
    expect(screen.queryByText('Protected Content')).toBeNull();
  });

  it('redirects to /login when user is not authenticated', () => {
    mockUseCurrentUser.mockReturnValue({ data: undefined, isLoading: false });
    renderWithRouter(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );
    expect(screen.getByText('Login Page')).toBeTruthy();
    expect(screen.queryByText('Protected Content')).toBeNull();
  });

  it('renders children when user is authenticated', () => {
    mockUseCurrentUser.mockReturnValue({
      data: { id: '1', email: 'u@u.com', full_name: 'U', role: UserRole.STUDENT, onboarding_complete: true },
      isLoading: false,
    });
    renderWithRouter(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );
    expect(screen.getByText('Protected Content')).toBeTruthy();
  });

  it('redirects to /unauthorized when role is not allowed', () => {
    mockUseCurrentUser.mockReturnValue({
      data: { id: '1', email: 'u@u.com', full_name: 'U', role: UserRole.STUDENT, onboarding_complete: true },
      isLoading: false,
    });
    renderWithRouter(
      <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
        <div>Admin Only Content</div>
      </ProtectedRoute>
    );
    expect(screen.getByText('Unauthorized Page')).toBeTruthy();
    expect(screen.queryByText('Admin Only Content')).toBeNull();
  });

  it('renders children when user has allowed role', () => {
    mockUseCurrentUser.mockReturnValue({
      data: { id: '1', email: 'a@a.com', full_name: 'Admin', role: UserRole.ADMIN, onboarding_complete: true },
      isLoading: false,
    });
    renderWithRouter(
      <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.LECTURER]}>
        <div>Admin Content</div>
      </ProtectedRoute>
    );
    expect(screen.getByText('Admin Content')).toBeTruthy();
  });
});
