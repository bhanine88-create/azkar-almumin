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
