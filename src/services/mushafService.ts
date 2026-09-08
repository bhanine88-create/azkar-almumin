import { safeLocalStorageGetItem, safeLocalStorageSetItem, safeLocalStorageRemoveItem } from "../utils/storage";

export const MUSHAF_EDITIONS = {
  hafs: {
    id: 'hafs',
    name: 'مصحف المدينة (حفص)',
    totalPage: 604,
    getUrls: (pageNum: number) => {
      const paddedPage = String(pageNum).padStart(3, '0');
      return [
        // JSDelivr is incredibly fast and reliable worldwide with zero CORS/referrer issues
        `https://cdn.jsdelivr.net/gh/QuranHub/quran-pages-images@main/kfgqpc/hafs-wasat/${pageNum}.jpg`,
        `https://cdn.jsdelivr.net/gh/QuranHub/quran-pages-images@main/kfgqpc/hafs-wasat/${paddedPage}.jpg`,
        
        // EveryAyah has very stable images but strictly requires 3-digit zero-padding
        `https://everyayah.com/data/images_png/${paddedPage}.png`,
        
        // Quran.com backup sources with padded page numbers
        `https://android.quran.com/data/quran/images/1260/page${paddedPage}.png`,
        `https://verses.quran.com/images/page${paddedPage}.png`,
        `https://quran.com/images/page${paddedPage}.png`,
        
        // Qurancdn.com supports both formats across different host version distributions
        `https://qurancdn.com/images/quran/hafs/madina_604/${pageNum}.png`,
        `https://qurancdn.com/images/quran/hafs/madina_604/${paddedPage}.png`,
        
        // Other GitHub mirrors
        `https://raw.githubusercontent.com/GlobalQuran/quran-images/master/images/hafs_madina_604/${paddedPage}.png`,
        `https://raw.githubusercontent.com/osamah-al-shaya/Quran-Images/master/Hafs_Madina_604/PNG/${pageNum}.png`,
        `https://raw.githubusercontent.com/osamah-al-shaya/Quran-Images/master/Hafs_Madina_604/PNG/${paddedPage}.png`,
      ];
    }
  },
  warsh: {
    id: 'warsh',
    name: 'مصحف المدينة (ورش)',
    totalPage: 604,
    getUrls: (pageNum: number) => {
      const paddedPage = String(pageNum).padStart(3, '0');
      return [
        // JSDelivr source (highly consistent, fast, and light)
        `https://cdn.jsdelivr.net/gh/QuranHub/quran-pages-images@main/kfgqpc/warsh/${pageNum}.jpg`,
        `https://cdn.jsdelivr.net/gh/QuranHub/quran-pages-images@main/kfgqpc/warsh/${paddedPage}.jpg`,
        
        // Quran.com standard android build source
        `https://android.quran.com/data/quran/images_warsh/1260/page${paddedPage}.png`,
        `https://android.quran.com/data/quran/images_warsh/1024/page${paddedPage}.png`,
        `https://verses.quran.com/images/warsh/page${paddedPage}.png`,
        
        // Qurancdn sources
        `https://qurancdn.com/images/quran/warsh/madina_604/${pageNum}.png`,
        `https://qurancdn.com/images/quran/warsh/madina_604/${paddedPage}.png`,
        
        // GlobalQuran mirror
        `https://raw.githubusercontent.com/GlobalQuran/quran-images/master/images/warsh_604/${paddedPage}.png`,
      ];
    }
  },
  tajweed: {
    id: 'tajweed',
    name: 'مصحف التجويد',
    totalPage: 604,
    getUrls: (pageNum: number) => {
      const paddedPage = String(pageNum).padStart(3, '0');
      return [
        // JSDelivr Tajweed sources (QuranHub has full side borders)
        `https://cdn.jsdelivr.net/gh/QuranHub/quran-pages-images@main/easyquran.com/hafs-tajweed/${pageNum}.jpg`,
        `https://cdn.jsdelivr.net/gh/QuranHub/quran-pages-images@main/easyquran.com/hafs-tajweed/${paddedPage}.jpg`,
        
        // Imomzoda tajweed mirrors (backup)
        `https://cdn.jsdelivr.net/gh/Imomzoda8/tajweed-quran-images@main/page_${paddedPage}.jpg`,
        `https://cdn.jsdelivr.net/gh/Imomzoda8/tajweed-quran-images@main/page_${pageNum}.jpg`,
        
        // GlobalQuran tajweed mirrors
        `https://raw.githubusercontent.com/GlobalQuran/quran-images/master/images/hafs_tadjweed/${paddedPage}.png`,
        `https://raw.githubusercontent.com/GlobalQuran/quran-images/master/images/hafs_tadjweed/${pageNum}.png`,
      ];
    }
  }
};

const CACHE_NAME_PREFIX = 'mushaf-cache-v3-';
const memoryUrlCache = new Map<string, string>();

export const mushafService = {
  getCacheName: (editionId: string) => `${CACHE_NAME_PREFIX}${editionId}`,

  getAbsoluteCacheKey: (editionId: string, pageNum: number) => {
    return `https://believer.app/mushaf/${editionId}/page-${pageNum}`;
  },

  isEditionDownloaded: async (editionId: string) => {
    try {
      const cache = await caches.open(`${CACHE_NAME_PREFIX}${editionId}`);
      const keys = await cache.keys();
      const actualCount = keys.length;

      if (actualCount >= 500) {
        safeLocalStorageSetItem(`mushaf_downloaded_${editionId}`, 'true');
        return true;
      }
      
      // If Cache API has evicted the pages but localStorage is stale, correct it
      safeLocalStorageRemoveItem(`mushaf_downloaded_${editionId}`);
      return false;
    } catch (e) {
      // Fallback to localStorage if Cache API is completely disabled/errors out
      return safeLocalStorageGetItem(`mushaf_downloaded_${editionId}`) === 'true';
    }
  },

  getDownloadProgress: async (editionId: string) => {
    try {
      const cache = await caches.open(`${CACHE_NAME_PREFIX}${editionId}`);
      const keys = await cache.keys();
      return keys.length;
    } catch (e) {
      return 0;
    }
  },

  downloadEdition: async (editionId: string, onProgress: (count: number) => void, customConcurrency?: number) => {
    const edition = MUSHAF_EDITIONS[editionId as keyof typeof MUSHAF_EDITIONS];
    if (!edition) throw new Error('Edition not found');

    const cache = await caches.open(`${CACHE_NAME_PREFIX}${editionId}`);
    
    // Concurrency limit for stability, support lower value for background silent downloading
    const CONCURRENCY = customConcurrency || 8; 
    let completed = 0;
    
    const totalPages = edition.totalPage;
    const queue = Array.from({ length: totalPages }, (_, i) => i + 1);
    
    // Progress tracker
    const reportProgress = () => {
      completed++;
      onProgress(completed);
    };

    // Worker function that pulls from the queue
    const worker = async () => {
      while (queue.length > 0) {
        const pageNum = queue.shift();
        if (pageNum === undefined) break;

        const urls = edition.getUrls(pageNum);
        const newKey = mushafService.getAbsoluteCacheKey(editionId, pageNum);
        const oldKey = `mushaf-${editionId}-page-${pageNum}`;
        
        // Quick check if already in cache (checking both absolute new key and legacy relative key)
        let existing = await cache.match(newKey);
        if (!existing) {
          existing = await cache.match(oldKey);
          if (existing) {
            // Self-heal & migrate legacy relative key to robust absolute URL key
            try {
              await cache.put(newKey, existing.clone());
              await cache.delete(oldKey);
            } catch (err) {
              console.warn('Failed to migrate relative cache key:', err);
            }
          }
        }

        if (existing) {
          reportProgress();
          continue;
        }

        let success = false;
        // Try all sources for each page
        for (const url of urls) {
          if (success) break;
          
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000); 

            const response = await fetch(url, { 
              mode: 'cors',
              credentials: 'omit',
              referrerPolicy: 'no-referrer',
              signal: controller.signal
            });
            
            clearTimeout(timeoutId);

            if (response.ok) {
              const contentType = response.headers.get('content-type');
              if (contentType && contentType.includes('image')) {
                // We keep the response object alive just enough to put it in cache
                await cache.put(newKey, response.clone());
                success = true;
              }
            }
          } catch (e) {
            // Silently try next source
          }
        }

        reportProgress();
      }
    };

    // Launch workers
    const workers = Array.from({ length: CONCURRENCY }, () => worker());
    await Promise.all(workers);

    // Save persistent downloaded indicator to localStorage so it stays downloaded forever in the UI
    try {
      safeLocalStorageSetItem(`mushaf_downloaded_${editionId}`, 'true');
    } catch (e) {
      console.error('Failed to save download status:', e);
    }
  },

  removeEdition: async (editionId: string) => {
    try {
      safeLocalStorageRemoveItem(`mushaf_downloaded_${editionId}`);
    } catch (e) {
      // Ignore
    }
    return await caches.delete(`${CACHE_NAME_PREFIX}${editionId}`);
  },

  prefetchPage: async (editionId: string, pageNum: number) => {
    if (pageNum < 1 || pageNum > 604) return;
    try {
      const cache = await caches.open(`${CACHE_NAME_PREFIX}${editionId}`);
      const newKey = mushafService.getAbsoluteCacheKey(editionId, pageNum);
      const oldKey = `mushaf-${editionId}-page-${pageNum}`;
      
      let existing = await cache.match(newKey);
      if (!existing) {
        existing = await cache.match(oldKey);
        if (existing) {
          try {
            await cache.put(newKey, existing.clone());
            await cache.delete(oldKey);
          } catch (e) {}
        }
      }

      if (existing) return;

      const edition = MUSHAF_EDITIONS[editionId as keyof typeof MUSHAF_EDITIONS];
      if (!edition) return;

      const urls = edition.getUrls(pageNum);
      for (const url of urls) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);

          const response = await fetch(url, {
            mode: 'cors',
            credentials: 'omit',
            referrerPolicy: 'no-referrer',
            signal: controller.signal
          });
          clearTimeout(timeoutId);

          if (response.ok) {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('image')) {
              await cache.put(newKey, response.clone());
              break;
            }
          }
        } catch (e) {
          // try next url
        }
      }
    } catch (e) {
      // ignore silently
    }
  },

  getPageUrl: async (editionId: string, pageNum: number, attemptIndex: number = 0) => {
    const memKey = `${editionId}_${pageNum}_${attemptIndex}`;
    if (memoryUrlCache.has(memKey)) {
      return memoryUrlCache.get(memKey)!;
    }

    // Soft prefetch surrounding pages non-blockingly
    setTimeout(() => {
      mushafService.prefetchPage(editionId, pageNum + 1);
      mushafService.prefetchPage(editionId, pageNum + 2);
      if (pageNum > 1) {
        mushafService.prefetchPage(editionId, pageNum - 1);
      }
    }, 400);

    const cache = await caches.open(`${CACHE_NAME_PREFIX}${editionId}`);
    const newKey = mushafService.getAbsoluteCacheKey(editionId, pageNum);
    const oldKey = `mushaf-${editionId}-page-${pageNum}`;
    
    let cachedResponse = await cache.match(newKey);
    if (!cachedResponse) {
      cachedResponse = await cache.match(oldKey);
      if (cachedResponse) {
        // Self-heal & migrate legacy relative key to robust absolute URL key
        try {
          await cache.put(newKey, cachedResponse.clone());
          await cache.delete(oldKey);
        } catch (e) {}
      }
    }
    
    if (cachedResponse) {
      try {
        const blob = await cachedResponse.blob();
        if (blob.size > 0) {
          const blobUrl = URL.createObjectURL(blob);
          memoryUrlCache.set(memKey, blobUrl);
          return blobUrl;
        }
      } catch (e) {
        console.warn('Failed to read blob from cache:', e);
      }
    }
    
    // Smart cache-on-demand for offline continuity
    const edition = MUSHAF_EDITIONS[editionId as keyof typeof MUSHAF_EDITIONS];
    if (edition) {
      const urls = edition.getUrls(pageNum);
      const url = urls[attemptIndex % urls.length];
      
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); 

        const response = await fetch(url, { 
          mode: 'cors',
          credentials: 'omit',
          referrerPolicy: 'no-referrer',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        if (response.ok) {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('image')) {
            await cache.put(newKey, response.clone());
            const blob = await response.blob();
            if (blob.size > 0) {
              const blobUrl = URL.createObjectURL(blob);
              memoryUrlCache.set(memKey, blobUrl);
              return blobUrl;
            }
          }
        }
      } catch (e) {
        console.warn(`Failed to auto-cache page ${pageNum}:`, e);
      }
      memoryUrlCache.set(memKey, url);
      return url;
    }
    return null;
  },

  // Helper to revoke URLs to prevent leaks
  revokePageUrl: (url: string) => {
    // Preserve memory URL cache for smooth, jump-free page display across re-renders
  }
};
