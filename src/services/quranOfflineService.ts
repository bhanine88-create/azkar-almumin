import { audioCacheService } from './audioCacheService';
import { RECITERS } from '../reciters';
import { quranIndexedDbService } from './quranIndexedDbService';

export const OFFLINE_TEXT_CACHE_NAME = 'quran-offline-surahs-v1';

export interface DownloadProgress {
  surahNumber: number;
  isDownloading: boolean;
  progress: number; // 0 to 100
  type: 'text' | 'audio' | 'both';
  error?: string;
}

export interface DownloadedSurahInfo {
  surahNumber: number;
  surahName: string;
  hasText: boolean;
  hasAudio: boolean;
  reciterId?: number;
  reciterName?: string;
}

export const quranOfflineService = {
  async getCache() {
    return await caches.open(OFFLINE_TEXT_CACHE_NAME);
  },

  getCacheKey(surahNumber: number, tafsirType: string, recitation: string = 'hafs') {
    return `surah-text-${surahNumber}-${recitation}-${tafsirType}`;
  },

  async isSurahTextDownloaded(
    surahNumber: number, 
    tafsirType: string, 
    recitation: string = 'hafs'
  ): Promise<boolean> {
    try {
      const inDb = await quranIndexedDbService.isSurahDownloaded(surahNumber, recitation, tafsirType);
      if (inDb) return true;

      const cache = await this.getCache();
      const cacheKey = this.getCacheKey(surahNumber, tafsirType, recitation);
      const response = await cache.match(cacheKey);
      return !!response;
    } catch {
      return false;
    }
  },

  async getDownloadedSurahText(
    surahNumber: number, 
    tafsirType: string, 
    recitation: string = 'hafs'
  ): Promise<any | null> {
    try {
      const dbData = await quranIndexedDbService.getSurah(surahNumber, recitation, tafsirType);
      if (dbData) return dbData;

      const cache = await this.getCache();
      const cacheKey = this.getCacheKey(surahNumber, tafsirType, recitation);
      const response = await cache.match(cacheKey);
      if (response) {
        return await response.json();
      }
      return null;
    } catch (e) {
      console.error('Failed to read downloaded surah text from storage', e);
      return null;
    }
  },

  async isSurahAudioDownloaded(surahNumber: number, reciterId: number): Promise<boolean> {
    try {
      const metadata = audioCacheService.getMetadataList();
      return metadata.some(item => item.surahNumber === surahNumber && item.reciterId === reciterId);
    } catch {
      return false;
    }
  },

  /**
   * Fetches, merges, and caches the Surah text with translation/tafsir
   */
  async downloadSurahText(
    surahNumber: number,
    surahName: string,
    tafsirType: string,
    secondaryTafsirType: string = 'en.sahih',
    recitation: string = 'hafs'
  ): Promise<void> {
    const isDownloaded = await this.isSurahTextDownloaded(surahNumber, tafsirType, recitation);
    if (isDownloaded) return;

    const fetchWithTimeout = async (url: string, timeout = 12000): Promise<Response> => {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);
      try {
        const response = await fetch(url, {
          signal: controller.signal,
          mode: 'cors',
          credentials: 'omit',
          referrerPolicy: 'no-referrer',
        });
        clearTimeout(id);
        if (!response.ok) throw new Error(`HTTP error ${response.status}`);
        return response;
      } catch (err) {
        clearTimeout(id);
        throw err;
      }
    };

    let quranData: any = null;

    // 1. Fetch main verses
    if (recitation === 'warsh') {
      try {
        const res = await fetchWithTimeout(`https://api.alquran.cloud/v1/surah/${surahNumber}/quran-warsh`);
        const json = await res.json();
        if (json.code === 200 && json.data) {
          quranData = json.data;
        }
      } catch (e) {
        console.warn('Offline Warsh download failed, trying fallback:', e);
      }
    }

    if (!quranData) {
      const res = await fetchWithTimeout(`https://api.alquran.cloud/v1/surah/${surahNumber}/quran-uthmani`);
      const json = await res.json();
      if (json.code === 200 && json.data) {
        quranData = json.data;
      }
    }

    if (!quranData) {
      throw new Error('فشل تحميل نص السورة من الخادم الرئيسي');
    }

    // 2. Fetch primary tafsir/translation
    let tafsirData: any = null;
    try {
      const res = await fetchWithTimeout(`https://api.alquran.cloud/v1/surah/${surahNumber}/${tafsirType}`);
      const json = await res.json();
      if (json.code === 200 && json.data) {
        tafsirData = json.data;
      }
    } catch (e) {
      console.warn('Failed to fetch primary tafsir during download, using defaults:', e);
    }

    // Merge tafsir data exactly like SurahDetail.tsx
    const mergedAyahs = quranData.ayahs.map((ayah: any) => {
      let tafsirText = '';
      if (tafsirData && tafsirData.ayahs) {
        const tAyah = tafsirData.ayahs.find((a: any) => a.numberInSurah === ayah.numberInSurah);
        tafsirText = tAyah?.text || '';
      }

      const isFallbackQuran = tafsirData?.edition?.type === 'quran' || tafsirData?.edition?.identifier === 'quran-simple';
      const isIdentical = tafsirText && tafsirText.trim() === ayah.text.trim();

      return {
        ...ayah,
        tafsir: tafsirText && !isIdentical && !isFallbackQuran ? tafsirText : 'التفسير غير متوفر حالياً بدون إنترنت',
      };
    });

    const fullData = { ...quranData, ayahs: mergedAyahs };

    // 3. Save to IndexedDB
    try {
      await quranIndexedDbService.saveSurah(surahNumber, surahName, recitation, tafsirType, fullData);
    } catch (dbErr) {
      console.warn('Failed to save surah to IndexedDB, using cache storage fallback:', dbErr);
    }

    // 4. Put into Cache Storage
    const cache = await this.getCache();
    const cacheKey = this.getCacheKey(surahNumber, tafsirType, recitation);
    
    await cache.put(
      cacheKey,
      new Response(JSON.stringify(fullData), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'max-age=31536000'
        }
      })
    );
  },

  /**
   * Resolves, downloads, and caches the Surah audio
   */
  async downloadSurahAudio(
    surahNumber: number,
    surahName: string,
    reciterId: number,
    onProgress?: (progress: number) => void,
    signal?: AbortSignal
  ): Promise<void> {
    const reciterData = RECITERS.find((r) => r.id === reciterId);
    if (!reciterData) {
      throw new Error('القارئ المحدد غير موجود في قاعدة البيانات');
    }

    const surahNumPadded = String(surahNumber).padStart(3, '0');
    const sources: string[] = [];

    // Resolve exactly the same source URLs logic as SurahDetail
    if (reciterData.surahUrls && (reciterData.surahUrls as any)[surahNumber]) {
      sources.push((reciterData.surahUrls as any)[surahNumber]);
    }

    if ((reciterData as any).serverUrl) {
      sources.push(`${(reciterData as any).serverUrl}${surahNumPadded}.mp3`);
    }

    if (reciterData.alquranCloudId) {
      sources.push(`https://cdn.islamic.network/quran/audio-surah/128/${reciterData.alquranCloudId}/${surahNumber}.mp3`);
    }

    if ((reciterData as any).audioPath) {
      sources.push(`https://mirrors.quranicaudio.com/quran/${(reciterData as any).audioPath}/${surahNumPadded}.mp3`);
      sources.push(`https://download.quranicaudio.com/quran/${(reciterData as any).audioPath}/${surahNumPadded}.mp3`);
    }

    if (sources.length === 0) {
      throw new Error('لا تتوفر روابط تحميل صالحة لهذا القارئ');
    }

    const primaryUrl = sources[0];
    const fallbacks = sources.slice(1);

    await audioCacheService.downloadAndCacheAudio(
      primaryUrl,
      surahNumber,
      surahName,
      reciterId,
      reciterData.name,
      fallbacks,
      {
        signal,
        onProgress
      }
    );
  },

  async deleteSurahText(
    surahNumber: number, 
    tafsirType: string, 
    recitation: string = 'hafs'
  ): Promise<void> {
    try {
      await quranIndexedDbService.deleteSurah(surahNumber, recitation, tafsirType);
      const cache = await this.getCache();
      const cacheKey = this.getCacheKey(surahNumber, tafsirType, recitation);
      await cache.delete(cacheKey);
    } catch (e) {
      console.error('Failed to delete offline surah text', e);
    }
  },

  async deleteSurahAudio(surahNumber: number, reciterId: number): Promise<void> {
    try {
      const metadata = audioCacheService.getMetadataList();
      const matched = metadata.find(item => item.surahNumber === surahNumber && item.reciterId === reciterId);
      if (matched) {
        await audioCacheService.removeCachedAudio(matched.url);
      }
    } catch (e) {
      console.error('Failed to delete offline surah audio', e);
    }
  },

  /**
   * Returns metadata list of all downloaded content
   */
  async getDownloadedSurahsList(
    tafsirType: string,
    reciterId: number,
    recitation: string = 'hafs'
  ): Promise<DownloadedSurahInfo[]> {
    const list: DownloadedSurahInfo[] = [];
    const cache = await this.getCache();
    
    const audioMeta = audioCacheService.getMetadataList();

    // Loop through all 114 surahs to construct status
    for (let s = 1; s <= 114; s++) {
      const hasText = await this.isSurahTextDownloaded(s, tafsirType, recitation);
      const matchedAudio = audioMeta.find(item => item.surahNumber === s && item.reciterId === reciterId);
      const hasAudio = !!matchedAudio;

      if (hasText || hasAudio) {
        list.push({
          surahNumber: s,
          surahName: matchedAudio?.surahName || `سورة رقم ${s}`,
          hasText,
          hasAudio,
          reciterId: matchedAudio?.reciterId,
          reciterName: matchedAudio?.reciterName
        });
      }
    }

    return list;
  },

  async clearAllOfflineQuranContent(): Promise<void> {
    try {
      await quranIndexedDbService.clearAll();
      await caches.delete(OFFLINE_TEXT_CACHE_NAME);
      await audioCacheService.clearAllCache();
    } catch (e) {
      console.error('Failed to clear offline Quran database:', e);
    }
  },

  /**
   * Downloads the entire Quran text and tafsir in bulk
   */
  async downloadFullQuranText(
    tafsirType: string,
    recitation: string = 'hafs',
    onProgress?: (progress: number) => void,
    signal?: AbortSignal
  ): Promise<void> {
    const fetchWithTimeout = async (url: string, timeout = 30000): Promise<Response> => {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);
      try {
        const response = await fetch(url, {
          signal: signal || controller.signal,
          mode: 'cors',
          credentials: 'omit',
          referrerPolicy: 'no-referrer',
        });
        clearTimeout(id);
        if (!response.ok) throw new Error(`HTTP error ${response.status}`);
        return response;
      } catch (err) {
        clearTimeout(id);
        throw err;
      }
    };

    try {
      onProgress?.(5); // Start
      
      // 1. Fetch entire Quran
      const quranEdition = recitation === 'warsh' ? 'quran-warsh' : 'quran-uthmani';
      const quranRes = await fetchWithTimeout(`https://api.alquran.cloud/v1/quran/${quranEdition}`);
      const quranJson = await quranRes.json();
      if (quranJson.code !== 200 || !quranJson.data || !quranJson.data.surahs) {
        throw new Error('فشل تحميل نص القرآن الكريم');
      }
      onProgress?.(30);

      // 2. Fetch entire Tafsir
      let tafsirSurahs: any[] = [];
      try {
        const tafsirRes = await fetchWithTimeout(`https://api.alquran.cloud/v1/quran/${tafsirType}`);
        const tafsirJson = await tafsirRes.json();
        if (tafsirJson.code === 200 && tafsirJson.data && tafsirJson.data.surahs) {
          tafsirSurahs = tafsirJson.data.surahs;
        }
      } catch (e) {
        console.warn('Failed to fetch full tafsir, falling back to empty tafsir', e);
      }
      onProgress?.(60);

      // 3. Cache each surah individually
      const cache = await this.getCache();
      const surahs = quranJson.data.surahs;
      
      for (let i = 0; i < surahs.length; i++) {
        if (signal?.aborted) throw new Error("تم إلغاء التحميل");
        
        const surah = surahs[i];
        const tafsirSurah = tafsirSurahs.find((s: any) => s.number === surah.number);
        
        const mergedAyahs = surah.ayahs.map((ayah: any) => {
          let tafsirText = '';
          if (tafsirSurah && tafsirSurah.ayahs) {
            const tAyah = tafsirSurah.ayahs.find((a: any) => a.numberInSurah === ayah.numberInSurah);
            tafsirText = tAyah?.text || '';
          }
          const isIdentical = tafsirText && tafsirText.trim() === ayah.text.trim();
          return {
            ...ayah,
            tafsir: tafsirText && !isIdentical ? tafsirText : 'التفسير غير متوفر حالياً بدون إنترنت',
          };
        });

        const fullData = { ...surah, ayahs: mergedAyahs };
        
        try {
          await quranIndexedDbService.saveSurah(surah.number, surah.name || `سورة ${surah.number}`, recitation, tafsirType, fullData);
        } catch (dbErr) {
          console.warn(`Failed saving surah ${surah.number} to IndexedDB during bulk download`, dbErr);
        }

        const cacheKey = this.getCacheKey(surah.number, tafsirType, recitation);
        
        await cache.put(
          cacheKey,
          new Response(JSON.stringify(fullData), {
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'max-age=31536000'
            }
          })
        );
        
        onProgress?.(60 + Math.floor(((i + 1) / surahs.length) * 40));
      }
      
      onProgress?.(100);
    } catch (e) {
      console.error("Bulk download failed", e);
      throw e;
    }
  },

  async downloadFullQuranAudio(
    reciterId: number,
    onProgress?: (progress: number) => void,
    signal?: AbortSignal
  ): Promise<void> {
    const totalSurahs = 114;
    let downloaded = 0;
    
    for (let s = 1; s <= totalSurahs; s++) {
      if (signal?.aborted) {
        throw new Error('تم إلغاء التحميل');
      }
      
      const isDownloaded = await this.isSurahAudioDownloaded(s, reciterId);
      if (!isDownloaded) {
        try {
          await this.downloadSurahAudio(s, `سورة ${s}`, reciterId, undefined, signal);
        } catch (e: any) {
           console.error(`Failed to download audio for surah ${s}`, e);
        }
      }
      
      downloaded++;
      if (onProgress) {
        onProgress(Math.round((downloaded / totalSurahs) * 100));
      }
    }
  },
  
  async removeFullQuranAudio(
    reciterId: number,
    onProgress?: (progress: number) => void
  ): Promise<void> {
    const totalSurahs = 114;
    let removed = 0;
    
    for (let s = 1; s <= totalSurahs; s++) {
      try {
        await this.deleteSurahAudio(s, reciterId);
      } catch (e: any) {
         console.error(`Failed to delete audio for surah ${s}`, e);
      }
      removed++;
      if (onProgress) {
        onProgress(Math.round((removed / totalSurahs) * 100));
      }
    }
  }
};
