// In-memory fallback map for restricted browsers (Safari Private, etc)
const memoryStorage = new Map<string, string>();

function isLocalStorageAvailable() {
  try {
    const testKey = '__test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
}

const hasLocalStorage = isLocalStorageAvailable();

export const safeLocalStorageGetItem = (key: string): string | null => {
  if (!hasLocalStorage) {
    return memoryStorage.get(key) || null;
  }
  try {
    return localStorage.getItem(key);
  } catch (e) {
    console.warn(`Failed to read key "${key}" from localStorage, falling back to memory.`);
    return memoryStorage.get(key) || null;
  }
};

export const safeLocalStorageRemoveItem = (key: string): void => {
  if (!hasLocalStorage) {
    memoryStorage.delete(key);
    return;
  }
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.warn(`Failed to remove key "${key}" from localStorage.`);
    memoryStorage.delete(key);
  }
};

export const safeLocalStorageSetItem = (key: string, value: string | null): boolean => {
  if (value === null) return false;

  if (!hasLocalStorage) {
    memoryStorage.set(key, value);
    return true;
  }
  
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e: any) {
    if (
      e.name === 'QuotaExceededError' ||
      e.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      e.code === 22 ||
      e.code === 1014
    ) {
      console.warn(`LocalStorage quota exceeded while saving key "${key}". Initiating aggressive cleanup...`);
      try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k) {
            if (
              k.includes('surah-cache-') ||
              k.includes('cache') ||
              k.includes('quran-') ||
              k.includes('tafsir-') ||
              k.includes('audio-') ||
              k.includes('mushaf_') ||
              k.includes('lectures-') ||
              k.startsWith('surah-')
            ) {
              if (!k.includes('believer_')) {
                keysToRemove.push(k);
              }
            }
          }
        }
        keysToRemove.forEach(k => {
          try {
            localStorage.removeItem(k);
          } catch (err) {}
        });
        localStorage.setItem(key, value);
        return true;
      } catch (retryError: any) {
        console.error(`Failed to save key "${key}" even after cache purge. Falling back to memory.`);
        memoryStorage.set(key, value);
        return false;
      }
    }
    console.warn(`Failed to save key "${key}". Falling back to memory.`);
    memoryStorage.set(key, value);
    return false;
  }
};

export const safeLocalStorageLength = (): number => {
  if (!hasLocalStorage) return memoryStorage.size;
  try { return localStorage.length; } catch (e) { return memoryStorage.size; }
};

export const safeLocalStorageKey = (index: number): string | null => {
  if (!hasLocalStorage) {
    const keys = Array.from(memoryStorage.keys());
    return keys[index] || null;
  }
  try { return localStorage.key(index); } catch (e) {
    const keys = Array.from(memoryStorage.keys());
    return keys[index] || null;
  }
};

export const safeLocalStorageClear = (): void => {
  if (!hasLocalStorage) {
    memoryStorage.clear();
    return;
  }
  try { localStorage.clear(); } catch (e) { memoryStorage.clear(); }
};

/**
 * The live localStorage keys for the user's core data, newest first.
 *
 * Every reader and writer must go through these. When a save moved to a new
 * version key but the loader, cloud sync and backup restore still used the old
 * one, progress rolled back on every launch and restores silently did nothing.
 */
export const STORAGE_KEYS = {
  progress: ['believer_progress_v24', 'believer_progress_v23', 'believer_progress_v22', 'believer_progress_v21', 'believer_progress_v20', 'believer_progress_v5'],
  settings: ['believer_settings_v30', 'believer_settings_v29', 'believer_settings_v28', 'believer_settings_v27', 'believer_settings_v23', 'believer_settings_v22', 'believer_settings_v21', 'believer_settings_v20'],
  adhkar: ['believer_adhkar_v24', 'believer_adhkar_v23', 'believer_adhkar_v22', 'believer_adhkar_v21', 'believer_adhkar_v20', 'believer_adhkar_v6', 'believer_adhkar_v5'],
  counts: ['believer_adhkar_counts_v23', 'believer_adhkar_counts_v22', 'believer_adhkar_counts_v21', 'believer_adhkar_counts_v20', 'believer_adhkar_counts_v6', 'believer_adhkar_counts_v5'],
} as const;

/** The first stored value among the given keys (newest first). */
export const readFirstStored = (keys: readonly string[]): string | null => {
  for (const key of keys) {
    const value = safeLocalStorageGetItem(key);
    if (value) return value;
  }
  return null;
};

/** Parses JSON, returning the fallback instead of throwing on corrupt data. */
export const safeJsonParse = <T,>(raw: string | null | undefined, fallback: T): T => {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return parsed === null || parsed === undefined ? fallback : parsed;
  } catch {
    return fallback;
  }
};
