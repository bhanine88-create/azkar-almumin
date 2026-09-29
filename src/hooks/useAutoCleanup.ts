import { useEffect, useRef, useCallback } from 'react';
import { memoryManager } from '../services/memoryManager';

export interface UseAutoCleanupOptions {
  componentName?: string;
  onCleanup?: () => void;
}

export function useAutoCleanup(options?: UseAutoCleanupOptions) {
  const componentName = options?.componentName || 'GenericComponent';
  const customCleanupRef = useRef(options?.onCleanup);
  customCleanupRef.current = options?.onCleanup;

  const timeoutsRef = useRef<Set<any>>(new Set());
  const intervalsRef = useRef<Set<any>>(new Set());
  const mediaElementsRef = useRef<Set<HTMLMediaElement>>(new Set());
  const blobUrlsRef = useRef<Set<string>>(new Set());

  // Safe timeout registrar
  const registerTimeout = useCallback((callback: () => void, ms: number) => {
    const id = setTimeout(() => {
      timeoutsRef.current.delete(id);
      callback();
    }, ms);
    timeoutsRef.current.add(id);
    return id;
  }, []);

  // Safe interval registrar
  const registerInterval = useCallback((callback: () => void, ms: number) => {
    const id = setInterval(callback, ms);
    intervalsRef.current.add(id);
    return id;
  }, []);

  // Clear tracked timeout
  const clearRegisteredTimeout = useCallback((id: any) => {
    clearTimeout(id);
    timeoutsRef.current.delete(id);
  }, []);

  // Clear tracked interval
  const clearRegisteredInterval = useCallback((id: any) => {
    clearInterval(id);
    intervalsRef.current.delete(id);
  }, []);

  // Register HTMLMediaElement (audio/video) for auto-detachment on unmount
  const registerMedia = useCallback(<T extends HTMLMediaElement>(media: T | null): T | null => {
    if (media) {
      mediaElementsRef.current.add(media);
    }
    return media;
  }, []);

  // Register a Blob URL for automatic revocation on unmount
  const registerBlobUrl = useCallback((url: string): string => {
    if (url && url.startsWith('blob:')) {
      memoryManager.registerBlobUrl(url, componentName);
      blobUrlsRef.current.add(url);
    }
    return url;
  }, [componentName]);

  // Revoke a specific registered Blob URL
  const revokeBlobUrl = useCallback((url: string) => {
    if (url) {
      memoryManager.revokeBlobUrl(url);
      blobUrlsRef.current.delete(url);
    }
  }, []);

  useEffect(() => {
    return () => {
      // 1. Clear all registered timers
      timeoutsRef.current.forEach((id) => clearTimeout(id));
      timeoutsRef.current.clear();

      intervalsRef.current.forEach((id) => clearInterval(id));
      intervalsRef.current.clear();

      // 2. Detach all registered media elements
      mediaElementsRef.current.forEach((media) => {
        memoryManager.detachMediaElement(media);
      });
      mediaElementsRef.current.clear();

      // 3. Revoke all component-tracked blob URLs
      blobUrlsRef.current.forEach((url) => {
        memoryManager.revokeBlobUrl(url);
      });
      blobUrlsRef.current.clear();

      // 4. Trigger custom cleanup if defined
      if (customCleanupRef.current) {
        try {
          customCleanupRef.current();
        } catch (e) {
          console.error(`[useAutoCleanup] Error in custom cleanup for ${componentName}:`, e);
        }
      }

      // 5. Purge any remaining resources registered in memoryManager
      memoryManager.cleanupComponent(componentName);
    };
  }, [componentName]);

  return {
    registerTimeout,
    registerInterval,
    clearRegisteredTimeout,
    clearRegisteredInterval,
    registerMedia,
    registerBlobUrl,
    revokeBlobUrl,
  };
}
