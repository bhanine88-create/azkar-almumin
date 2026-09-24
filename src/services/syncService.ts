import { db, auth } from '../firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { sanitizeForFirestore } from '../lib/utils';
import { UserProgress, AppSettings } from '../types';
import { safeLocalStorageGetItem, safeLocalStorageSetItem, STORAGE_KEYS, readFirstStored } from "../utils/storage";

export interface SyncState {
  lastSyncedAt: string | null;
  status: 'idle' | 'syncing' | 'error' | 'offline';
  pendingChanges: boolean;
}

type SyncCallback = (state: SyncState) => void;

class SyncManager {
  private listeners: Set<SyncCallback> = new Set();
  private isSyncing = false;
  private syncTimeout: any = null;
  private pendingChanges = false;
  private lastSyncedTime: string | null = null;

  constructor() {
    this.lastSyncedTime = safeLocalStorageGetItem('believer_last_sync_time');
    this.pendingChanges = safeLocalStorageGetItem('believer_sync_pending') === 'true';

    // Register network online listener to trigger immediate sync when connection is restored
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        console.log('[SyncManager] Network online. Triggering sync...');
        this.triggerSync();
      });

      // Periodic Background Sync: run every 5 minutes when the tab is active/idle
      this.startPeriodicSync();
    }
  }

  public subscribe(callback: SyncCallback): () => void {
    this.listeners.add(callback);
    callback(this.getSyncState());
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notify() {
    const state = this.getSyncState();
    this.listeners.forEach(cb => cb(state));
  }

  public getSyncState(): SyncState {
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    return {
      lastSyncedAt: this.lastSyncedTime,
      status: this.isSyncing 
        ? 'syncing' 
        : !isOnline 
          ? 'offline' 
          : 'idle',
      pendingChanges: this.pendingChanges,
    };
  }

  /**
   * Marks that some local changes occurred and need to be synchronized with the cloud.
   */
  public markDirty() {
    this.pendingChanges = true;
    safeLocalStorageSetItem('believer_sync_pending', 'true');
    this.notify();

    // Debounce the sync call slightly (10 seconds) so that consecutive local actions (e.g., clicking several tasbihs)
    // do not trigger a barrage of firestore writes.
    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout);
    }
    this.syncTimeout = setTimeout(() => {
      this.triggerSync();
    }, 10000);
  }

  /**
   * Starts periodic sync checker (runs every 5 minutes).
   * Runs inside requestIdleCallback if supported to avoid layout thrashing/lagging the main thread.
   */
  private startPeriodicSync() {
    const intervalTime = 5 * 60 * 1000; // 5 minutes

    const performCheck = () => {
      const runner = () => {
        if (this.pendingChanges) {
          console.log('[SyncManager] Periodic background sync check: changes pending. Syncing...');
          this.triggerSync();
        } else if (auth.currentUser) {
          // If no local changes, pull latest cloud data once in a while to keep other devices in sync
          console.log('[SyncManager] Periodic background sync check: pulling latest profile...');
          this.pullLatestCloudProfile();
        }
      };

      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        (window as any).requestIdleCallback(() => runner(), { timeout: 2000 });
      } else {
        setTimeout(runner, 0);
      }
    };

    setInterval(performCheck, intervalTime);
  }

  /**
   * Pulls profile updates from the cloud when no local modifications are dirty.
   */
  private async pullLatestCloudProfile() {
    const user = auth.currentUser;
    if (!user || this.isSyncing || this.pendingChanges) return;

    try {
      const userDocRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        const cloudData = docSnap.data();
        
        // Dispatch an event so AppContext can load and apply updates
        const syncEvent = new CustomEvent('believer_cloud_sync_received', {
          detail: {
            progress: cloudData.progress,
            settings: cloudData.settings,
            counts: cloudData.counts
          }
        });
        window.dispatchEvent(syncEvent);

        this.lastSyncedTime = new Date().toISOString();
        safeLocalStorageSetItem('believer_last_sync_time', this.lastSyncedTime);
        this.notify();
      }
    } catch (err) {
      console.warn('[SyncManager] Failed to pull latest profile in background:', err);
    }
  }

  /**
   * Triggers the synchronization process (uploads local progress/settings/counts to Firestore).
   */
  public async triggerSync(): Promise<boolean> {
    const user = auth.currentUser;
    if (!user) {
      return false;
    }

    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    if (!isOnline) {
      console.warn('[SyncManager] Cannot sync: Network is offline.');
      return false;
    }

    if (this.isSyncing) return false;

    this.isSyncing = true;
    this.notify();

    try {
      // Fetch latest values directly from localStorage to prevent thread blocking
      const progressRaw = readFirstStored(STORAGE_KEYS.progress);
      const settingsRaw = readFirstStored(STORAGE_KEYS.settings);
      const countsRaw = readFirstStored(STORAGE_KEYS.counts);

      const progress = progressRaw ? JSON.parse(progressRaw) : null;
      const settings = settingsRaw ? JSON.parse(settingsRaw) : null;
      const counts = countsRaw ? JSON.parse(countsRaw) : null;

      if (!progress && !settings && !counts) {
        this.isSyncing = false;
        this.pendingChanges = false;
        safeLocalStorageSetItem('believer_sync_pending', 'false');
        this.notify();
        return true;
      }

      const userDocRef = doc(db, 'users', user.uid);

      // Perform deep merge or update
      const sanitizedProgress = progress ? sanitizeForFirestore(progress) : null;
      const sanitizedSettings = settings ? sanitizeForFirestore(settings) : null;
      const sanitizedCounts = counts ? sanitizeForFirestore(counts) : null;

      const profileUpdate: any = {
        uid: user.uid,
        email: user.email || '',
        updatedAt: serverTimestamp(),
      };

      if (sanitizedProgress) profileUpdate.progress = sanitizedProgress;
      if (sanitizedSettings) profileUpdate.settings = sanitizedSettings;
      if (sanitizedCounts) profileUpdate.counts = sanitizedCounts;

      await setDoc(userDocRef, profileUpdate, { merge: true });

      // Successful sync!
      this.pendingChanges = false;
      safeLocalStorageSetItem('believer_sync_pending', 'false');
      
      this.lastSyncedTime = new Date().toISOString();
      safeLocalStorageSetItem('believer_last_sync_time', this.lastSyncedTime);
      
      console.log('[SyncManager] Periodic Background Sync completed successfully!');
      this.isSyncing = false;
      this.notify();
      return true;
    } catch (error) {
      console.error('[SyncManager] Background sync failed:', error);
      this.isSyncing = false;
      this.notify();
      return false;
    }
  }
}

export const syncService = new SyncManager();
