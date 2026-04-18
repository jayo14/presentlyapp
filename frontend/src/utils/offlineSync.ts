/**
 * Offline Sync Manager
 * Handles synchronization of offline data when connection is restored
 */

import { getPendingSyncItems, deleteData, STORES, addToSyncQueue } from './offlineDB';
import { toast } from 'sonner';
import apiClient from '../../services/api/client';
import { sessionApi } from '../../services/api/attendance';

export class OfflineSyncManager {
  private syncInProgress = false;
  private syncInterval: NodeJS.Timeout | null = null;
  private boundOnlineHandler = () => this.handleOnline();
  private boundOfflineHandler = () => this.handleOffline();

  /**
   * Initialize the sync manager
   */
  init() {
    // Listen for online/offline events
    window.addEventListener('online', this.boundOnlineHandler);
    window.addEventListener('offline', this.boundOfflineHandler);

    // Check initial connection status
    if (navigator.onLine) {
      this.startPeriodicSync();
    }
  }

  /**
   * Handle when device comes online
   */
  private async handleOnline() {
    console.log('[Offline Sync] Device is online');
    toast.success('Connection restored', {
      description: 'Syncing offline data...',
    });
    
    await this.syncPendingData();
    this.startPeriodicSync();
  }

  /**
   * Handle when device goes offline
   */
  private handleOffline() {
    console.log('[Offline Sync] Device is offline');
    toast.warning('You are offline', {
      description: 'Changes will be synced when connection is restored',
    });
    
    this.stopPeriodicSync();
  }

  async queueAttendanceCheckIn(payload: {
    sessionCode: string;
    location: any;
    recordedAt?: string;
    source?: string;
  }): Promise<any> {
    const sessionCode = payload.sessionCode.trim().toUpperCase();
    const queueItem = {
      type: 'attendance_check_in',
      payload: {
        sessionCode,
        location: payload.location,
        recordedAt: payload.recordedAt || new Date().toISOString(),
        source: payload.source || 'scanner',
      },
      timestamp: Date.now(),
    };

    const existingItems = await getPendingSyncItems();
    const duplicate = existingItems.find(
      (item) =>
        item.type === 'attendance_check_in' &&
        item.payload?.sessionCode === sessionCode &&
        item.payload?.source === queueItem.payload.source
    );

    if (!duplicate) {
      await addToSyncQueue(queueItem);
    }

    return {
      queued: true,
      session_code: sessionCode,
      course_code: sessionCode,
      course_name: 'Attendance queued offline',
      venue_name: navigator.onLine ? 'Will sync when connection stabilizes' : 'Offline check-in saved',
    };
  }

  /**
   * Start periodic sync (every 5 minutes)
   */
  private startPeriodicSync() {
    if (this.syncInterval) return;
    
    this.syncInterval = setInterval(() => {
      if (navigator.onLine) {
        this.syncPendingData();
      }
    }, 5 * 60 * 1000); // 5 minutes
  }

  /**
   * Stop periodic sync
   */
  private stopPeriodicSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Sync all pending data
   */
  async syncPendingData() {
    if (this.syncInProgress) {
      console.log('[Offline Sync] Sync already in progress');
      return;
    }

    if (!navigator.onLine) {
      console.log('[Offline Sync] Cannot sync while offline');
      return;
    }

    try {
      this.syncInProgress = true;
      const pendingItems = await getPendingSyncItems();

      if (pendingItems.length === 0) {
        console.log('[Offline Sync] No pending items to sync');
        return;
      }

      console.log(`[Offline Sync] Syncing ${pendingItems.length} items`);
      let successCount = 0;
      let failCount = 0;

      for (const item of pendingItems) {
        try {
          await this.syncItem(item);
          await deleteData(STORES.SYNC_QUEUE, item.id);
          successCount++;
        } catch (error) {
          console.error('[Offline Sync] Failed to sync item:', error);
          failCount++;
        }
      }

      if (successCount > 0) {
        toast.success('Sync complete', {
          description: `Synced ${successCount} item(s)${failCount > 0 ? `, ${failCount} failed` : ''}`,
        });
      }

      if (failCount > 0 && successCount === 0) {
        toast.error('Sync failed', {
          description: `Failed to sync ${failCount} item(s). Will retry later.`,
        });
      }
    } catch (error) {
      console.error('[Offline Sync] Sync error:', error);
      toast.error('Sync error', {
        description: 'Failed to sync offline data. Will retry later.',
      });
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Sync a single item based on its type
   */
  private async syncItem(item: any): Promise<void> {
    const { type, payload } = item;

    switch (type) {
      case 'attendance_check_in':
      case 'attendance':
        await this.syncAttendance(payload);
        break;
      case 'profile_update':
        await this.syncProfileUpdate(payload);
        break;
      default:
        console.warn('[Offline Sync] Unknown item type:', type);
    }
  }

  /**
   * Sync attendance record
   */
  private async syncAttendance(payload: any): Promise<void> {
    if (!payload?.sessionCode) {
      throw new Error('Missing session code for offline attendance sync');
    }

    await sessionApi.checkInByCode(payload.sessionCode, payload.location || {});
  }

  /**
   * Sync profile update
   */
  private async syncProfileUpdate(payload: any): Promise<void> {
    await apiClient.patch('/users/profile/', payload);
  }

  /**
   * Cleanup - stop all intervals
   */
  cleanup() {
    this.stopPeriodicSync();
    window.removeEventListener('online', this.boundOnlineHandler);
    window.removeEventListener('offline', this.boundOfflineHandler);
  }
}

// Create singleton instance
export const offlineSyncManager = new OfflineSyncManager();
