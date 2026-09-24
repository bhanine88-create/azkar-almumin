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
/**
 * Page URLs kept in memory. Each cached page is a blob holding a full page
 * image, so an unbounded map grew with every page turned until the WebView ran
 * out of memory on long reading sessions. The pager only shows a few pages at
 * a time; the oldest entries are dropped (and their blobs freed) past this.
 */
const MEMORY_URL_CACHE_LIMIT = 48;

const rememberPageUrl = (key: string, url: string) => {
  memoryUrlCache.delete(key);
  memoryUrlCache.set(key, url);
  while (memoryUrlCache.size > MEMORY_URL_CACHE_LIMIT) {
    const [oldestKey, oldestUrl] = memoryUrlCache.entries().next().value as [string, string];
    memoryUrlCache.delete(oldestKey);
    if (oldestUrl.startsWith('blob:')) {
      // Give any <img> still decoding the old page a moment before freeing it.
      setTimeout(() => URL.revokeObjectURL(oldestUrl), 10000);
    }
  }
};

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
    
    // Read all existing keys in cache
    const existingRequests = await cache.keys();
    const cachedKeys = new Set(existingRequests.map(req => req.url));
    
    const totalPages = edition.totalPage;
    
    // Helper to determine if a page is already cached
    const isPageCached = (pageNum: number) => {
      const newKey = mushafService.getAbsoluteCacheKey(editionId, pageNum);
      const oldKey = `mushaf-${editionId}-page-${pageNum}`;
      return cachedKeys.has(newKey) || cachedKeys.has(oldKey);
    };

    // Report initial progress
    let cachedCount = existingRequests.length;
    onProgress(cachedCount);

    const getMissingPages = () => {
      const missing: number[] = [];
      for (let i = 1; i <= totalPages; i++) {
        if (!isPageCached(i)) {
          missing.push(i);
        }
      }
      return missing;
    };

    let missingPages = getMissingPages();
    if (missingPages.length === 0) {
      safeLocalStorageSetItem(`mushaf_downloaded_${editionId}`, 'true');
      onProgress(totalPages);
      return;
    }

    const CONCURRENCY = customConcurrency || 6;

    // Retry up to 3 passes for any network blips or rate limits
    for (let pass = 1; pass <= 3 && missingPages.length > 0; pass++) {
      const queue = [...missingPages];
      const failedThisPass: number[] = [];

      const worker = async () => {
        while (queue.length > 0) {
          const pageNum = queue.shift();
          if (pageNum === undefined) break;

          const newKey = mushafService.getAbsoluteCacheKey(editionId, pageNum);
          
          if (isPageCached(pageNum)) {
            continue;
          }

          const urls = edition.getUrls(pageNum);
          let success = false;

          for (const url of urls) {
            if (success) break;
            
            try {
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 12000); 

              const response = await fetch(url, { 
                mode: 'cors',
                credentials: 'omit',
                referrerPolicy: 'no-referrer',
                signal: controller.signal
              });
              
              clearTimeout(timeoutId);

              if (response.ok) {
                const contentType = response.headers.get('content-type');
                // Ensure response is not an HTML error page
                if (!contentType || !contentType.includes('text/html')) {
                  await cache.put(newKey, response.clone());
                  cachedKeys.add(newKey);
                  cachedCount++;
                  onProgress(cachedCount);
                  success = true;
                }
              }
            } catch (e) {
              // Silently try next source
            }
          }

          if (!success) {
            failedThisPass.push(pageNum);
          }
        }
      };

      const workers = Array.from({ length: CONCURRENCY }, () => worker());
      await Promise.all(workers);

      missingPages = failedThisPass;
      if (missingPages.length > 0 && pass < 3) {
        // Delay 1 second before retrying failed pages
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Final check
    const finalKeys = await cache.keys();
    const finalCount = finalKeys.length;
    onProgress(finalCount);

    if (finalCount >= 500) {
      safeLocalStorageSetItem(`mushaf_downloaded_${editionId}`, 'true');
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
            if (!contentType || !contentType.includes('text/html')) {
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
    const remembered = memoryUrlCache.get(memKey);
    if (remembered) {
      rememberPageUrl(memKey, remembered); // mark as recently used
      return remembered;
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
          rememberPageUrl(memKey, blobUrl);
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
      
      rememberPageUrl(memKey, url);

      // Cache asynchronously in background for future offline continuity without blocking current page view
      (async () => {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 12000); 

          const response = await fetch(url, { 
            mode: 'cors',
            credentials: 'omit',
            referrerPolicy: 'no-referrer',
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);

          if (response.ok) {
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('text/html')) {
              await cache.put(newKey, response.clone());
            }
          }
        } catch (e) {
          // ignore background cache failure
        }
      })();

      return url;
    }
    return null;
  },

  // Helper to revoke URLs to prevent leaks
  revokePageUrl: (url: string) => {
    // Preserve memory URL cache for smooth, jump-free page display across re-renders
  }
};
