import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { audioCacheService } from '../services/audioCacheService';
import { lectureCacheService } from '../services/lectureCacheService';
import { RECITERS } from '../reciters';
import { getSurahAudioUrl, getSurahAudioFallbacks } from '../services/quranAudioUrlService';

export interface DownloadItem {
  id: string; // Unique URL or ID: e.g., 'quran-{reciterId}-{surahNumber}' or 'lecture-{lectureId}'
  name: string; // e.g. "سورة البقرة"
  subName: string; // e.g. "عبد العزيز الأحمد" or "الشيخ ناصر الأحمد"
  url: string;
  type: 'quran' | 'lecture' | 'tafsir';
  progress: number; // 0 - 100
  status: 'pending' | 'downloading' | 'completed' | 'failed';
  error?: string;
  surahNumber?: number;
  reciterId?: number;
  lectureId?: string;
  completedAt?: number;
  loadedBytes?: number;
  totalBytes?: number;
  speed?: string;
}

interface DownloadContextType {
  downloads: DownloadItem[];
  startDownloadSurah: (
    surahNumber: number,
    surahName: string,
    reciterId: number,
    reciterName: string,
    url: string
  ) => void;
  startDownloadLecture: (
    lectureId: string,
    title: string,
    speaker: string,
    url: string,
    type: 'lecture' | 'tafsir'
  ) => void;
  cancelDownload: (id: string) => void;
  removeDownloadItem: (id: string) => void;
  clearCompletedDownloads: () => void;
  activeDownloadsCount: number;
  isStoragePersistent: boolean;
  requestStoragePersistence: () => Promise<boolean>;
}

const DownloadContext = createContext<DownloadContextType | undefined>(undefined);

const MAX_CONCURRENT_DOWNLOADS = 3;
const AUTO_DISMISS_DELAY_MS = 3000; // 3 seconds auto-fadeout dismiss after successful download

export const DownloadProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isStoragePersistent, setIsStoragePersistent] = useState(false);

  const requestStoragePersistence = React.useCallback(async (): Promise<boolean> => {
    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) {
      try {
        const persisted = await navigator.storage.persist();
        setIsStoragePersistent(persisted);
        return persisted;
      } catch (e) {
        console.warn('Failed to request storage persistence in DownloadProvider:', e);
        return false;
      }
    }
    return false;
  }, []);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.storage) {
      if (navigator.storage.persisted) {
        navigator.storage.persisted().then((persisted) => {
          setIsStoragePersistent(persisted);
          if (!persisted && navigator.storage.persist) {
            navigator.storage.persist().then((p) => setIsStoragePersistent(p)).catch(() => {});
          }
        }).catch(() => {});
      } else if (navigator.storage.persist) {
        navigator.storage.persist().then((p) => setIsStoragePersistent(p)).catch(() => {});
      }
    }
  }, []);

  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const downloadsRef = useRef<DownloadItem[]>([]);
  const abortControllersRef = useRef<Record<string, AbortController>>({});
  const completionTimersRef = useRef<Record<string, NodeJS.Timeout>>({});
  const activeRunningIdsRef = useRef<Set<string>>(new Set());

  // Helper to synchronously update state and ref together
  const updateDownloads = React.useCallback((updater: (prev: DownloadItem[]) => DownloadItem[]) => {
    setDownloads((prev) => {
      const next = updater(prev);
      downloadsRef.current = next;
      return next;
    });
  }, []);

  const activeDownloadsCount = downloads.filter(
    (d) => d.status === 'downloading' || d.status === 'pending'
  ).length;

  const processQueueRef = useRef<() => void>(() => {});

  const executeDownload = React.useCallback(async (item: DownloadItem) => {
    const controller = new AbortController();
    abortControllersRef.current[item.id] = controller;

    let lastProgressTime = 0;

    try {
      if (item.type === 'quran') {
        const reciter = RECITERS.find(r => r.id === item.reciterId);
        const fastUrl = reciter && item.surahNumber ? getSurahAudioUrl(reciter, item.surahNumber) : item.url;
        const targetUrl = fastUrl || item.url;
        const fallbacks = reciter && item.surahNumber ? getSurahAudioFallbacks(reciter, item.surahNumber, targetUrl) : [];

        await audioCacheService.downloadAndCacheAudio(
          targetUrl,
          item.surahNumber!,
          item.name,
          item.reciterId!,
          item.subName,
          fallbacks,
          {
            signal: controller.signal,
            onProgress: (prog, details) => {
              const now = Date.now();
              // Throttle progress state updates to max once per 120ms per item to protect render cycles
              if (now - lastProgressTime > 120 || prog === 100) {
                lastProgressTime = now;
                updateDownloads((prev) =>
                  prev.map((d) => (d.id === item.id ? { 
                    ...d, 
                    progress: prog,
                    loadedBytes: details?.loaded,
                    totalBytes: details?.total,
                    speed: details?.speed
                  } : d))
                );
              }
            },
          }
        );
      } else {
        await lectureCacheService.downloadAndCacheAudio(
          item.url,
          item.lectureId!,
          item.name,
          item.subName,
          {
            signal: controller.signal,
            onProgress: (prog, details) => {
              const now = Date.now();
              if (now - lastProgressTime > 120 || prog === 100) {
                lastProgressTime = now;
                updateDownloads((prev) =>
                  prev.map((d) => (d.id === item.id ? { 
                    ...d, 
                    progress: prog,
                    loadedBytes: details?.loaded,
                    totalBytes: details?.total,
                    speed: details?.speed
                  } : d))
                );
              }
            },
          }
        );
      }

      const completedTimestamp = Date.now();
      updateDownloads((prev) =>
        prev.map((d) => (d.id === item.id ? { 
          ...d, 
          status: 'completed', 
          progress: 100, 
          completedAt: completedTimestamp,
          speed: undefined 
        } : d))
      );

      // Automatically fade out and remove completed download after delay
      if (completionTimersRef.current[item.id]) {
        clearTimeout(completionTimersRef.current[item.id]);
      }
      completionTimersRef.current[item.id] = setTimeout(() => {
        updateDownloads((prev) => prev.filter((d) => d.id !== item.id));
        delete completionTimersRef.current[item.id];
      }, AUTO_DISMISS_DELAY_MS);

      // Award Points
      try {
        window.dispatchEvent(
          new CustomEvent('zad_points_increment', {
            detail: { points: 15, source: 'تحميل مادة صوتية' },
          })
        );
      } catch (e) {
        console.warn('Failed to increment points');
      }
    } catch (err: any) {
      if (err.name === 'AbortError' || err.message === 'AbortError') {
        return; // Handled in cancelDownload
      }
      console.error(`Downloaded queue worker failed for ${item.id}`, err);
      updateDownloads((prev) =>
        prev.map((d) => (d.id === item.id ? { ...d, status: 'failed', error: 'فشل التحميل' } : d))
      );
    } finally {
      activeRunningIdsRef.current.delete(item.id);
      delete abortControllersRef.current[item.id];
      // Safely schedule next queued item
      setTimeout(() => {
        processQueueRef.current();
      }, 0);
    }
  }, [updateDownloads]);

  // Imperative Queue Processor - completely avoids useEffect([downloads]) cycle!
  const processQueue = React.useCallback(() => {
    const runningCount = activeRunningIdsRef.current.size;
    const availableSlots = MAX_CONCURRENT_DOWNLOADS - runningCount;
    if (availableSlots <= 0) return;

    const currentDownloads = downloadsRef.current;
    const pendingItems = currentDownloads.filter(
      (d) => d.status === 'pending' && !activeRunningIdsRef.current.has(d.id)
    );
    if (pendingItems.length === 0) return;

    const itemsToStart = pendingItems.slice(0, availableSlots);
    itemsToStart.forEach((item) => {
      activeRunningIdsRef.current.add(item.id);
    });

    const startingIds = new Set(itemsToStart.map((i) => i.id));
    updateDownloads((prev) =>
      prev.map((d) => (startingIds.has(d.id) ? { ...d, status: 'downloading' } : d))
    );

    itemsToStart.forEach((item) => {
      executeDownload(item);
    });
  }, [executeDownload, updateDownloads]);

  useEffect(() => {
    processQueueRef.current = processQueue;
  }, [processQueue]);

  const cancelDownload = React.useCallback((id: string) => {
    const controller = abortControllersRef.current[id];
    if (controller) {
      controller.abort();
      delete abortControllersRef.current[id];
    }
    activeRunningIdsRef.current.delete(id);
    updateDownloads((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: 'failed', error: 'تم إلغاء التحميل' } : d))
    );
    setTimeout(() => {
      updateDownloads((prev) => prev.filter((d) => d.id !== id));
    }, 1200);
    setTimeout(() => {
      processQueueRef.current();
    }, 0);
  }, [updateDownloads]);

  const clearCompletedDownloads = React.useCallback(() => {
    Object.values(completionTimersRef.current).forEach((t) => clearTimeout(t));
    completionTimersRef.current = {};
    updateDownloads((prev) => prev.filter((d) => d.status === 'downloading' || d.status === 'pending'));
  }, [updateDownloads]);

  const removeDownloadItem = React.useCallback((id: string) => {
    if (completionTimersRef.current[id]) {
      clearTimeout(completionTimersRef.current[id]);
      delete completionTimersRef.current[id];
    }
    const controller = abortControllersRef.current[id];
    if (controller) {
      controller.abort();
      delete abortControllersRef.current[id];
    }
    activeRunningIdsRef.current.delete(id);
    updateDownloads((prev) => prev.filter((d) => d.id !== id));
    setTimeout(() => {
      processQueueRef.current();
    }, 0);
  }, [updateDownloads]);

  const startDownloadSurah = React.useCallback((
    surahNumber: number,
    surahName: string,
    reciterId: number,
    reciterName: string,
    url: string
  ) => {
    const id = `quran-${reciterId}-${surahNumber}`;
    
    // Request storage persistence from browser dynamically
    requestStoragePersistence().catch(() => {});
    
    // Check if already in queue or running using current ref
    const existing = downloadsRef.current.find((d) => d.id === id);
    if (existing && (existing.status === 'downloading' || existing.status === 'pending' || existing.status === 'completed')) {
      return;
    }

    const reciter = RECITERS.find(r => r.id === reciterId);
    const optimizedUrl = reciter ? getSurahAudioUrl(reciter, surahNumber) : url;

    const newItem: DownloadItem = {
      id,
      name: surahName,
      subName: reciterName,
      url: optimizedUrl || url,
      type: 'quran',
      progress: 0,
      status: 'pending',
      surahNumber,
      reciterId,
    };

    updateDownloads((prev) => [...prev.filter((d) => d.id !== id), newItem]);

    // Kick off queue processing in next microtask
    Promise.resolve().then(() => {
      processQueueRef.current();
    });
  }, [requestStoragePersistence, updateDownloads]);

  const startDownloadLecture = React.useCallback((
    lectureId: string,
    title: string,
    speaker: string,
    url: string,
    type: 'lecture' | 'tafsir'
  ) => {
    const id = `${type}-${lectureId}`;

    requestStoragePersistence().catch(() => {});

    const existing = downloadsRef.current.find((d) => d.id === id);
    if (existing && (existing.status === 'downloading' || existing.status === 'pending' || existing.status === 'completed')) {
      return;
    }

    const newItem: DownloadItem = {
      id,
      name: title,
      subName: speaker,
      url,
      type,
      progress: 0,
      status: 'pending',
      lectureId,
    };

    updateDownloads((prev) => [...prev.filter((d) => d.id !== id), newItem]);

    Promise.resolve().then(() => {
      processQueueRef.current();
    });
  }, [requestStoragePersistence, updateDownloads]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      Object.values(abortControllersRef.current).forEach((ctrl) => ctrl.abort());
      Object.values(completionTimersRef.current).forEach((t) => clearTimeout(t));
    };
  }, []);

  const contextValue = React.useMemo(() => ({
    downloads,
    startDownloadSurah,
    startDownloadLecture,
    cancelDownload,
    removeDownloadItem,
    clearCompletedDownloads,
    activeDownloadsCount,
    isStoragePersistent,
    requestStoragePersistence,
  }), [
    downloads,
    startDownloadSurah,
    startDownloadLecture,
    cancelDownload,
    removeDownloadItem,
    clearCompletedDownloads,
    activeDownloadsCount,
    isStoragePersistent,
    requestStoragePersistence,
  ]);

  return (
    <DownloadContext.Provider value={contextValue}>
      {children}
    </DownloadContext.Provider>
  );
};

export const useDownloadManager = () => {
  const context = useContext(DownloadContext);
  if (context === undefined) {
    throw new Error('useDownloadManager must be used within a DownloadProvider');
  }
  return context;
};
