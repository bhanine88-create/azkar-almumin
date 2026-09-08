export const storageManager = {
  async checkAndClearStorageIfNeeded() {
    try {
      if (!navigator.storage || !navigator.storage.estimate) {
        console.log('[StorageManager] Storage estimate API not supported.');
        return;
      }

      const estimate = await navigator.storage.estimate();
      if (!estimate.quota || !estimate.usage) return;

      const usageRatio = estimate.usage / estimate.quota;
      const remainingMB = (estimate.quota - estimate.usage) / (1024 * 1024);

      console.log(`[StorageManager] Usage: ${(usageRatio * 100).toFixed(2)}%, Remaining: ${remainingMB.toFixed(2)} MB`);

      // If storage is critically low (usage > 95% or < 20MB remaining)
      if (usageRatio > 0.95 || remainingMB < 20) {
        console.warn('[StorageManager] Storage is critically full. Initiating aggressive cleanup...');
        await this.clearOldCaches(true);
      } 
      // If storage is getting low (usage > 85% or < 50MB remaining)
      else if (usageRatio > 0.85 || remainingMB < 50) {
        console.warn('[StorageManager] Storage is almost full. Initiating safe cleanup...');
        await this.clearOldCaches(false);
      }
    } catch (error) {
      console.error('[StorageManager] Error checking storage:', error);
    }
  },

  async clearOldCaches(aggressive: boolean) {
    try {
      const cacheNames = await caches.keys();
      
      const cachesToDelete = cacheNames.filter(name => {
        // Never delete the main precache which runs the app offline
        if (name.includes('workbox-precache')) {
          return false;
        }

        // If aggressive, delete almost all runtime caches to save the app
        if (aggressive) {
          // Keep only static code/fonts if possible, but if aggressive, maybe delete all but precache
          if (name.includes('static-code-cache')) return false;
          return true; // Delete everything else
        }

        // Safe cleanup: Delete heavy/non-critical caches
        if (name.includes('quran-api-cache') || 
            name.includes('audio-cache') || 
            name.includes('texture-cache') ||
            name.includes('api-cache')) {
          return true;
        }
        
        return false;
      });

      for (const name of cachesToDelete) {
        console.log(`[StorageManager] Deleting cache: ${name}`);
        await caches.delete(name);
      }
      
      console.log(`[StorageManager] ${aggressive ? 'Aggressive ' : ''}Cleanup completed.`);
    } catch (error) {
      console.error('[StorageManager] Error clearing caches:', error);
    }
  }
};
