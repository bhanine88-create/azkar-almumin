const DB_NAME = 'quran_offline_db';
const DB_VERSION = 1;
const SURAH_STORE = 'surahs';

export interface IndexedDbSurahData {
  id: string; // e.g. "1_hafs_ar.muyassar"
  surahNumber: number;
  surahName: string;
  recitation: string;
  tafsirType: string;
  data: any;
  downloadedAt: number;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this browser'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(SURAH_STORE)) {
        const store = db.createObjectStore(SURAH_STORE, { keyPath: 'id' });
        store.createIndex('surahNumber', 'surahNumber', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export const quranIndexedDbService = {
  getSurahKey(surahNumber: number, recitation: string = 'hafs', tafsirType: string = 'ar.muyassar') {
    return `${surahNumber}_${recitation}_${tafsirType}`;
  },

  async saveSurah(
    surahNumber: number,
    surahName: string,
    recitation: string,
    tafsirType: string,
    data: any
  ): Promise<void> {
    const db = await openDb();
    const id = this.getSurahKey(surahNumber, recitation, tafsirType);
    const item: IndexedDbSurahData = {
      id,
      surahNumber,
      surahName,
      recitation,
      tafsirType,
      data,
      downloadedAt: Date.now()
    };

    return new Promise((resolve, reject) => {
      const tx = db.transaction(SURAH_STORE, 'readwrite');
      const store = tx.objectStore(SURAH_STORE);
      const req = store.put(item);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  },

  async getSurah(surahNumber: number, recitation: string = 'hafs', tafsirType: string = 'ar.muyassar'): Promise<any | null> {
    try {
      const db = await openDb();
      const id = this.getSurahKey(surahNumber, recitation, tafsirType);

      return new Promise((resolve) => {
        const tx = db.transaction(SURAH_STORE, 'readonly');
        const store = tx.objectStore(SURAH_STORE);
        const req = store.get(id);
        req.onsuccess = () => {
          if (req.result && req.result.data) {
            resolve(req.result.data);
          } else {
            resolve(null);
          }
        };
        req.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  },

  async isSurahDownloaded(surahNumber: number, recitation: string = 'hafs', tafsirType: string = 'ar.muyassar'): Promise<boolean> {
    try {
      const db = await openDb();
      const id = this.getSurahKey(surahNumber, recitation, tafsirType);

      return new Promise((resolve) => {
        const tx = db.transaction(SURAH_STORE, 'readonly');
        const store = tx.objectStore(SURAH_STORE);
        const req = store.getKey(id);
        req.onsuccess = () => resolve(req.result !== undefined);
        req.onerror = () => resolve(false);
      });
    } catch {
      return false;
    }
  },

  async deleteSurah(surahNumber: number, recitation: string = 'hafs', tafsirType: string = 'ar.muyassar'): Promise<void> {
    try {
      const db = await openDb();
      const id = this.getSurahKey(surahNumber, recitation, tafsirType);

      return new Promise((resolve, reject) => {
        const tx = db.transaction(SURAH_STORE, 'readwrite');
        const store = tx.objectStore(SURAH_STORE);
        const req = store.delete(id);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.error('Error deleting surah from IndexedDB', e);
    }
  },

  async getDownloadedSurahsMap(recitation: string = 'hafs', tafsirType: string = 'ar.muyassar'): Promise<Record<number, boolean>> {
    const result: Record<number, boolean> = {};
    try {
      const db = await openDb();
      return new Promise((resolve) => {
        const tx = db.transaction(SURAH_STORE, 'readonly');
        const store = tx.objectStore(SURAH_STORE);
        const req = store.getAllKeys();
        req.onsuccess = () => {
          const keys = req.result as string[];
          keys.forEach((key) => {
            const parts = String(key).split('_');
            if (parts.length >= 3) {
              const num = parseInt(parts[0], 10);
              const rec = parts[1];
              const taf = parts.slice(2).join('_');
              if (rec === recitation && taf === tafsirType) {
                result[num] = true;
              }
            }
          });
          resolve(result);
        };
        req.onerror = () => resolve(result);
      });
    } catch {
      return result;
    }
  },

  async clearAll(): Promise<void> {
    try {
      const db = await openDb();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(SURAH_STORE, 'readwrite');
        const store = tx.objectStore(SURAH_STORE);
        const req = store.clear();
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.error('Failed to clear IndexedDB surahs', e);
    }
  }
};
