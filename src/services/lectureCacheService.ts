import { freeUpLocalStorageSpace, formatBytes, AudioDownloadProgressDetails } from './audioCacheService';
import { safeLocalStorageGetItem, safeLocalStorageSetItem, safeLocalStorageRemoveItem } from "../utils/storage";

export const LECTURE_CACHE_NAME = 'lectures-offline-audio-v1';

export interface CachedLectureInfo {
  url: string;
  lectureId: string;
  title: string;
  speaker: string;
  size: number;
  downloadedAt: number;
}

export const lectureCacheService = {
  async getCache() {
    return await caches.open(LECTURE_CACHE_NAME);
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
    lectureId: string,
    title: string,
    speaker: string,
    options?: { signal?: AbortSignal, onProgress?: (progress: number, details?: AudioDownloadProgressDetails) => void }
  ): Promise<void> {
    if (options?.signal?.aborted) {
      throw new Error('AbortError');
    }
    
    try {
      const isCached = await this.isAudioCached(url);
      if (isCached) {
        if (options?.onProgress) {
          options.onProgress(100, { progress: 100, loaded: 1, total: 1 });
        }
        return; 
      }

      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
        signal: options?.signal
      });

      if (!response.ok) {
        throw new Error(`Status ${response.status} for ${url}`);
      }
      
      const contentLength = response.headers.get('content-length');
      const total = contentLength ? parseInt(contentLength, 10) : 0;
      let loaded = 0;
      
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to start download stream');
      }

      const chunks: Uint8Array[] = [];
      const startTime = Date.now();
      let lastSpeedCalcTime = startTime;
      let lastLoadedForSpeed = 0;
      let currentSpeed = '';
      let lastReportedProgress = -1;
      let lastReportedTime = 0;
      const estimatedTotal = 12 * 1024 * 1024; // typical lecture is ~12MB
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        if (value) {
          chunks.push(value);
          loaded += value.length;

          const now = Date.now();
          if (now - lastSpeedCalcTime >= 300) {
            const bytesDelta = loaded - lastLoadedForSpeed;
            const timeDeltaSec = (now - lastSpeedCalcTime) / 1000;
            const bytesPerSec = bytesDelta / Math.max(0.1, timeDeltaSec);
            currentSpeed = `${formatBytes(bytesPerSec)}/ث`;
            lastSpeedCalcTime = now;
            lastLoadedForSpeed = loaded;
          }

          const effectiveTotal = total > 0 ? total : Math.max(estimatedTotal, loaded * 1.15);
          const progress = Math.min(99, Math.max(1, Math.round((loaded / effectiveTotal) * 100)));

          if (options?.onProgress && (progress !== lastReportedProgress || now - lastReportedTime > 70)) {
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

      const blob = new Blob(chunks, { type: 'audio/mpeg' });
      
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
      
      const metadata: CachedLectureInfo = {
        url,
        lectureId,
        title,
        speaker,
        size: blob.size,
        downloadedAt: Date.now(),
      };
      
      this.saveMetadata(metadata);
      
      const cacheResponse = new Response(blob, {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Cache-Control': 'max-age=31536000',
          'X-Source-Url': url
        }
      });
      
      await cache.put(url, cacheResponse);
    } catch (err: any) {
      if (err.name === 'AbortError' || err.message === 'AbortError') {
        throw err;
      }
      console.warn(`Failed to cache from ${url}:`, err);
      throw err;
    }
  },

  async getCachedAudioUrl(url: string): Promise<string | null> {
    try {
      const cache = await this.getCache();
      const response = await cache.match(url);
      if (response) {
        const blob = await response.blob();
        return URL.createObjectURL(blob);
      }
      return null;
    } catch (e) {
      return null;
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

  getMetadataList(): CachedLectureInfo[] {
    try {
      const stored = safeLocalStorageGetItem('lectures-audio-cache-meta');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  saveMetadata(info: CachedLectureInfo) {
    const list = this.getMetadataList();
    const existingIndex = list.findIndex(m => m.url === info.url);
    if (existingIndex >= 0) {
      list[existingIndex] = info;
    } else {
      list.push(info);
    }
    
    try {
      safeLocalStorageSetItem('lectures-audio-cache-meta', JSON.stringify(list));
    } catch (e: any) {
      if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED' || (e.message && e.message.toLowerCase().includes('quota'))) {
        console.warn('Quota exceeded in lectureCacheService, clearing non-essential cached surahs...');
        freeUpLocalStorageSpace();
        try {
          safeLocalStorageSetItem('lectures-audio-cache-meta', JSON.stringify(list));
        } catch (retryErr) {
          console.error('Failed to save lecture metadata even after clearing surah cache:', retryErr);
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
      safeLocalStorageSetItem('lectures-audio-cache-meta', JSON.stringify(filtered));
    } catch (e) {
      console.error('Failed to update metadata after removal:', e);
    }
  },

  async clearAllCache(): Promise<boolean> {
    try {
      safeLocalStorageRemoveItem('lectures-audio-cache-meta');
      return await caches.delete(LECTURE_CACHE_NAME);
    } catch (e) {
      return false;
    }
  },

  async getTotalCacheSize(): Promise<number> {
    try {
      const list = this.getMetadataList();
      return list.reduce((acc, m) => acc + (m.size || 0), 0);
    } catch (e) {
      return 0;
    }
  }
};
