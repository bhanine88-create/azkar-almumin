import { safeLocalStorageGetItem, safeLocalStorageSetItem, safeLocalStorageRemoveItem, safeLocalStorageLength, safeLocalStorageKey,  } from "../utils/storage";
export const AUDIO_CACHE_NAME = 'quran-offline-audio-v1';

export interface CachedAudioInfo {
  url: string;
  surahNumber: number;
  surahName: string;
  reciterId: number;
  reciterName: string;
  size: number;
  downloadedAt: number;
}

export interface AudioDownloadProgressDetails {
  loaded: number;
  total: number;
  speed?: string;
  progress: number;
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes <= 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function freeUpLocalStorageSpace() {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < safeLocalStorageLength(); i++) {
      const key = safeLocalStorageKey(i);
      if (key && (key.startsWith('surah-cache-') || key.startsWith('quran-surah-'))) {
        keysToRemove.push(key);
      }
    }
    
    console.warn(`Quota exceeded. Removing ${keysToRemove.length} cached surah detail keys to free up space...`);
    keysToRemove.forEach(key => safeLocalStorageRemoveItem(key));
    
    // Also remove the surah list cache as a second priority
    safeLocalStorageRemoveItem('quran-surahs-cache-v3');
  } catch (err) {
    console.error('Error while freeing up localStorage space:', err);
  }
}

export const audioCacheService = {
  async getCache() {
    return await caches.open(AUDIO_CACHE_NAME);
  },

  async isAudioCached(url: string): Promise<boolean> {
    try {
      const cache = await this.getCache();
      const response = await cache.match(url);
      return !!response;
    } catch (e) {
      return false;
    }
  },

  async downloadAndCacheAudio(
    url: string, 
    surahNumber: number, 
    surahName: string, 
    reciterId: number, 
    reciterName: string,
    fallbackUrls: string[] = [],
    options?: { signal?: AbortSignal, onProgress?: (progress: number, details?: AudioDownloadProgressDetails) => void }
  ): Promise<void> {
    const urls = [url, ...fallbackUrls];
    let lastError = null;

    for (const currentUrl of urls) {
      if (options?.signal?.aborted) {
        throw new Error('AbortError');
      }
      
      try {
        const isCached = await this.isAudioCached(currentUrl);
        if (isCached) {
          if (options?.onProgress) {
            options.onProgress(100, { progress: 100, loaded: 1, total: 1 });
          }
          return; 
        }

        let response: Response;
        let effectiveDownloadUrl = currentUrl;

        try {
          response = await fetch(currentUrl, {
            signal: options?.signal,
            mode: 'cors',
          });
        } catch (fetchErr: any) {
          if (options?.signal?.aborted || fetchErr.name === 'AbortError') throw fetchErr;

          // If direct fetch fails (e.g. CORS restriction on CDNs without Access-Control-Allow-Origin),
          // fallback to app's backend proxy stream
          if (!currentUrl.startsWith('/api/proxy') && !currentUrl.includes('/api/proxy-download')) {
            const proxyUrl = `/api/proxy-download?url=${encodeURIComponent(currentUrl)}&filename=${surahNumber}.mp3`;
            effectiveDownloadUrl = proxyUrl;
            response = await fetch(proxyUrl, {
              signal: options?.signal,
            });
          } else {
            throw fetchErr;
          }
        }

        if (!response.ok) {
          // If 404 or other status, try backend proxy if not tried yet
          if (!effectiveDownloadUrl.includes('/api/proxy-download') && !currentUrl.startsWith('/api/proxy')) {
            const proxyUrl = `/api/proxy-download?url=${encodeURIComponent(currentUrl)}&filename=${surahNumber}.mp3`;
            effectiveDownloadUrl = proxyUrl;
            response = await fetch(proxyUrl, { signal: options?.signal });
          }
          if (!response.ok) {
            throw new Error(`Status ${response.status} for ${effectiveDownloadUrl}`);
          }
        }
        
        let blob: Blob;
        
        // Try streaming for progress if supported
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) {
          throw new Error('Server returned HTML instead of audio');
        }

        if (response.body && options?.onProgress) {
          const contentLength = response.headers.get('content-length');
          const total = contentLength ? parseInt(contentLength, 10) : 0;
          let loaded = 0;
          
          // Estimate total if Content-Length header is missing/blocked by CORS
          const estimatedTotal = surahNumber === 2 ? 60 * 1024 * 1024 :
                                 surahNumber <= 5 ? 25 * 1024 * 1024 :
                                 surahNumber >= 100 ? 900 * 1024 : 5.5 * 1024 * 1024;
          
          const startTime = Date.now();
          let lastSpeedCalcTime = startTime;
          let lastLoadedForSpeed = 0;
          let currentSpeed = '';
          let lastReportedProgress = -1;
          let lastReportedTime = 0;

          try {
            const reader = response.body.getReader();
            const chunks: Uint8Array[] = [];
            
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              if (value) {
                chunks.push(value);
                loaded += value.length;
                
                const now = Date.now();
                // Compute download speed every 250ms
                if (now - lastSpeedCalcTime >= 250) {
                  const bytesDelta = loaded - lastLoadedForSpeed;
                  const timeDeltaSec = (now - lastSpeedCalcTime) / 1000;
                  const bytesPerSec = bytesDelta / Math.max(0.1, timeDeltaSec);
                  currentSpeed = `${formatBytes(bytesPerSec)}/ث`;
                  lastSpeedCalcTime = now;
                  lastLoadedForSpeed = loaded;
                }

                const effectiveTotal = total > 0 ? total : Math.max(estimatedTotal, loaded * 1.1);
                const progress = Math.min(99, Math.max(1, Math.round((loaded / effectiveTotal) * 100)));

                // Throttle updates: report on change or every 80ms
                if (progress !== lastReportedProgress || now - lastReportedTime > 80) {
                  lastReportedProgress = progress;
                  lastReportedTime = now;
                  options.onProgress(progress, {
                    progress,
                    loaded,
                    total: total > 0 ? total : Math.round(effectiveTotal),
                    speed: currentSpeed || `${formatBytes(loaded / Math.max(0.1, (now - startTime) / 1000))}/ث`
                  });
                }
              }
            }
            blob = new Blob(chunks, { type: 'audio/mpeg' });
          } catch (streamErr) {
            // Fallback if stream reading fails
            console.warn('Stream failed, falling back to blob():', streamErr);
            blob = await fetch(effectiveDownloadUrl, { signal: options?.signal, mode: 'cors' }).then(res => res.blob());
          }
        } else {
          blob = await response.blob();
        }
        
        if (options?.onProgress) {
          options.onProgress(100, {
            progress: 100,
            loaded: blob.size,
            total: blob.size,
            speed: ''
          });
        }
        
        if (blob.size < 1000) {
          throw new Error('Downloaded file is too small, likely an error page');
        }
        
        const cache = await this.getCache();
        
        const metadata: CachedAudioInfo = {
          url: currentUrl,
          surahNumber,
          surahName,
          reciterId,
          reciterName,
          size: blob.size,
          downloadedAt: Date.now(),
        };
        
        this.saveMetadata(metadata);
        
        const cacheResponse = new Response(blob, {
          headers: {
            'Content-Type': 'audio/mpeg',
            'Cache-Control': 'max-age=31536000',
            'X-Source-Url': currentUrl
          }
        });
        
        // Put in cache under currentUrl and under primary url so matches always hit
        await cache.put(currentUrl, cacheResponse.clone());
        if (url !== currentUrl) {
          await cache.put(url, cacheResponse.clone());
        }
        if (effectiveDownloadUrl !== currentUrl && effectiveDownloadUrl !== url) {
          await cache.put(effectiveDownloadUrl, cacheResponse);
        }
        return; // Success!
      } catch (err: any) {
        if (err.name === 'AbortError' || err.message === 'AbortError') {
          throw err;
        }
        console.warn(`Failed to cache from ${currentUrl}:`, err);
        lastError = err;
      }
    }

    throw lastError || new Error('All download sources failed');
  },

  async getCachedAudioUrl(url: string): Promise<string | null> {
    try {
      const cache = await this.getCache();
      let response = await cache.match(url);
      if (!response && !url.includes('/api/proxy-download')) {
        const proxyUrl = `/api/proxy-download?url=${encodeURIComponent(url)}`;
        response = await cache.match(proxyUrl);
      }
      if (response) {
        const blob = await response.blob();
        return URL.createObjectURL(blob);
      }
      return null;
    } catch (e) {
      return null;
    }
  },

  async getCachedAudioUrlBySurah(reciterId: number, surahNumber: number): Promise<string | null> {
    try {
      const metaList = this.getMetadataList();
      const meta = metaList.find(m => m.reciterId === reciterId && m.surahNumber === surahNumber);
      if (meta) {
        return this.getCachedAudioUrl(meta.url);
      }
      return null;
    } catch (e) {
      return null;
    }
  },

  isSurahCached(reciterId: number, surahNumber: number): boolean {
    try {
      const metaList = this.getMetadataList();
      return metaList.some(m => m.reciterId === reciterId && m.surahNumber === surahNumber);
    } catch {
      return false;
    }
  },

  async removeCachedAudio(url: string): Promise<boolean> {
    try {
      const cache = await this.getCache();
      const success = await cache.delete(url);
      if (success) {
        this.removeMetadata(url);
      }
      return success;
    } catch (e) {
      return false;
    }
  },

  // Metadata management
  getMetadataList(): CachedAudioInfo[] {
    try {
      const stored = safeLocalStorageGetItem('quran-audio-cache-meta');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  saveMetadata(info: CachedAudioInfo) {
    const list = this.getMetadataList();
    const existingIndex = list.findIndex(m => m.url === info.url);
    if (existingIndex >= 0) {
      list[existingIndex] = info;
    } else {
      list.push(info);
    }
    
    try {
      safeLocalStorageSetItem('quran-audio-cache-meta', JSON.stringify(list));
    } catch (e: any) {
      if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED' || (e.message && e.message.toLowerCase().includes('quota'))) {
        // Sacrifice non-essential cached surahs to make room for metadata
        console.warn('Quota exceeded, clearing cached data to make room...');
        freeUpLocalStorageSpace();
        try {
          safeLocalStorageSetItem('quran-audio-cache-meta', JSON.stringify(list));
        } catch (retryErr) {
          console.error('Failed to save audio metadata even after clearing surah cache:', retryErr);
        }
      } else {
        console.error('Failed to save audio metadata:', e);
      }
    }
  },

  removeMetadata(url: string) {
    const list = this.getMetadataList();
    const filtered = list.filter(m => m.url !== url);
    try {
      safeLocalStorageSetItem('quran-audio-cache-meta', JSON.stringify(filtered));
    } catch (e) {
      console.error('Failed to update metadata after removal:', e);
    }
  },

  async clearAllCache(): Promise<void> {
    try {
      await caches.delete(AUDIO_CACHE_NAME);
      safeLocalStorageRemoveItem('quran-audio-cache-meta');
    } catch (e) {
      console.error('Failed to clear entire audio cache:', e);
    }
  }
};
