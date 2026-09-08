
import { TafsirType } from '../context/QuranSettingsContext';
import { safeLocalStorageGetItem, safeLocalStorageSetItem, safeLocalStorageRemoveItem } from "../utils/storage";

const CACHE_NAME_PREFIX = 'quran-tafsir-cache-';

export interface TafsirEdition {
  id: TafsirType;
  name: string;
  totalSurahs: number;
}

export const TAFSIR_EDITIONS: Record<string, TafsirEdition> = {
  'ar.muyassar': { id: 'ar.muyassar', name: 'التفسير الميسر', totalSurahs: 114 },
  'ar.jalalayn': { id: 'ar.jalalayn', name: 'تفسير الجلالين', totalSurahs: 114 },
  'ar.waseet': { id: 'ar.waseet', name: 'التفسير الوسيط', totalSurahs: 114 },
  'ar.qurtubi': { id: 'ar.qurtubi', name: 'تفسير القرطبي', totalSurahs: 114 },
  'ar.baghawi': { id: 'ar.baghawi', name: 'تفسير البغوي', totalSurahs: 114 },
  'ar.miqbas': { id: 'ar.miqbas', name: 'تفسير ابن عباس', totalSurahs: 114 },
  'en.sahih': { id: 'en.sahih', name: 'إنجليزي: صحيح انترناشونال', totalSurahs: 114 },
  'fr.hamidullah': { id: 'fr.hamidullah', name: 'فرنسي: حميد الله', totalSurahs: 114 },
  'tr.ates': { id: 'tr.ates', name: 'تركي: سليمان أتش', totalSurahs: 114 },
  'ur.ahmedali': { id: 'ur.ahmedali', name: 'أوردو: أحمد علي', totalSurahs: 114 },
  'id.indonesian': { id: 'id.indonesian', name: 'إندونيسي: الوزارة', totalSurahs: 114 }
};

export const tafsirService = {
  async isEditionDownloaded(editionId: string): Promise<boolean> {
    try {
      if (editionId === 'ar.razi') {
        return true; // Razi Tafsir is cloud-native, ready instantly
      }
      if (safeLocalStorageGetItem(`tafsir_downloaded_${editionId}`) === 'true') {
        return true;
      }
      const cache = await caches.open(`${CACHE_NAME_PREFIX}${editionId}`);
      const keys = await cache.keys();
      // If at least 100 out of 114 surahs are cached, we consider it downloaded to handle minor failures.
      if (keys.length >= 100) {
        safeLocalStorageSetItem(`tafsir_downloaded_${editionId}`, 'true');
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  },

  async getDownloadProgress(editionId: string): Promise<number> {
    try {
      if (editionId === 'ar.razi') {
        return 114; // Always fully online / interactive
      }
      const cache = await caches.open(`${CACHE_NAME_PREFIX}${editionId}`);
      const keys = await cache.keys();
      return keys.length;
    } catch (e) {
      return 0;
    }
  },

  async downloadEdition(editionId: string, onProgress: (progress: number) => void): Promise<void> {
    const cache = await caches.open(`${CACHE_NAME_PREFIX}${editionId}`);
    let completed = 0;
    const CONCURRENCY = 15;

    const surahs = Array.from({ length: 114 }, (_, i) => i + 1);

    for (let i = 0; i < surahs.length; i += CONCURRENCY) {
      const chunk = surahs.slice(i, i + CONCURRENCY);
      
      await Promise.all(chunk.map(async (j) => {
        const url = `https://api.alquran.cloud/v1/surah/${j}/${editionId}`;
        const cacheKey = `surah-${j}`;
        
        let success = false;
        // Check if already cached
        const existing = await cache.match(cacheKey);
        if (existing) {
          completed++;
          onProgress(completed);
          return;
        }

        for (let retry = 0; retry < 2; retry++) {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);
            
            const response = await fetch(url, { 
              signal: controller.signal,
              mode: 'cors',
              credentials: 'omit',
              referrerPolicy: 'no-referrer'
            });
            clearTimeout(timeoutId);

            if (response.ok) {
              await cache.put(cacheKey, response.clone());
              success = true;
              break;
            }
          } catch (e) {
            await new Promise(resolve => setTimeout(resolve, 300));
          }
        }
        
        if (success) {
          completed++;
          onProgress(completed);
        }
      }));
    }

    // Save persistent downloaded indicator to localStorage
    try {
      safeLocalStorageSetItem(`tafsir_downloaded_${editionId}`, 'true');
    } catch (e) {
      console.error('Failed to save tafsir download status:', e);
    }
  },

  async removeEdition(editionId: string): Promise<void> {
    try {
      safeLocalStorageRemoveItem(`tafsir_downloaded_${editionId}`);
    } catch (e) {
      // Ignore
    }
    await caches.delete(`${CACHE_NAME_PREFIX}${editionId}`);
  },

  async getCachedSurahTafsir(surahNum: number, editionId: string): Promise<any | null> {
    try {
      const cache = await caches.open(`${CACHE_NAME_PREFIX}${editionId}`);
      const response = await cache.match(`surah-${surahNum}`);
      if (response) {
        const data = await response.json();
        return data.data || null;
      }
    } catch (e) {
      console.error('Error reading tafsir from cache:', e);
    }
    return null;
  }
};
