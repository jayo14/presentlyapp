import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient from '../../services/api/client';
import { venueApi } from '../../services/api/venues';

vi.mock('../../services/api/client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('venueApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getActiveSessions should return active venue IDs', async () => {
    const mockResponse = {
      data: {
        success: true,
        active_venue_ids: [1, 2, 3],
      },
    };
    (apiClient.get as any).mockResolvedValue(mockResponse);

    const result = await venueApi.getActiveSessions();

    expect(apiClient.get).toHaveBeenCalledWith('/venues/active_sessions/');
    expect(result).toEqual([1, 2, 3]);
  });

  it('getActiveSessions should return empty array on failure', async () => {
    (apiClient.get as any).mockResolvedValue({ data: {} });

    const result = await venueApi.getActiveSessions();

    expect(result).toEqual([]);
  });
});
