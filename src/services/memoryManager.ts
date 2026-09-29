/**
 * Believer Application Memory Manager (Auto-Cleanup & Resource Governor)
 * 
 * Manages client-side memory lifecycle, bounds in-memory binary caches,
 * tracks and revokes Object/Blob URLs, detaches audio/media buffers,
 * deallocates GPU canvas contexts, and runs automatic cleanups on page transitions
 * to guarantee rock-solid stability under intensive usage.
 */

interface BlobRecord {
  url: string;
  owner: string;
  createdAt: number;
}

class MemoryManager {
  private blobRegistry: Map<string, BlobRecord> = new Map();
  private cleanupRegistry: Map<string, Set<() => void>> = new Map();
  private maxTrackedBlobs = 100;
  private isCleanupRunning = false;

  constructor() {
    if (typeof window !== 'undefined') {
      // Listen to low-memory / pagehide events
      window.addEventListener('pagehide', () => this.performEmergencyCleanup());
      window.addEventListener('beforeunload', () => this.performEmergencyCleanup());
    }
  }

  /**
   * Registers a created Blob/Object URL for strict lifecycle tracking.
   * If the registry exceeds capacity, the oldest unpinned blobs are revoked automatically.
   */
  public registerBlobUrl(url: string, owner: string = 'general'): string {
    if (!url || !url.startsWith('blob:')) return url;

    // Auto-prune if too many unmanaged blobs exist
    if (this.blobRegistry.size >= this.maxTrackedBlobs) {
      this.pruneOldestBlobs(20);
    }

    this.blobRegistry.set(url, {
      url,
      owner,
      createdAt: Date.now()
    });

    return url;
  }

  /**
   * Safely revokes a specific Blob URL and removes it from tracking.
   */
  public revokeBlobUrl(url: string): void {
    if (!url || !url.startsWith('blob:')) return;

    try {
      URL.revokeObjectURL(url);
    } catch (err) {
      // Ignore already revoked URLs
    } finally {
      this.blobRegistry.delete(url);
    }
  }

  /**
   * Revokes all Blob URLs registered under a specific component/feature owner.
   */
  public revokeBlobUrlsByOwner(owner: string): number {
    let count = 0;
    for (const [url, record] of this.blobRegistry.entries()) {
      if (record.owner === owner) {
        this.revokeBlobUrl(url);
        count++;
      }
    }
    return count;
  }

  /**
   * Detaches an HTMLMediaElement (audio/video), stops buffering, and releases memory buffers.
   */
  public detachMediaElement(media: HTMLMediaElement | null): void {
    if (!media) return;

    try {
      media.pause();
      const currentSrc = media.src || media.currentSrc;
      
      // If it was a blob URL, revoke it immediately
      if (currentSrc && currentSrc.startsWith('blob:')) {
        this.revokeBlobUrl(currentSrc);
      }

      media.removeAttribute('src');
      // Empty any source child elements
      while (media.firstChild) {
        media.removeChild(media.firstChild);
      }

      // Invoking load() on an element without src forces the browser
      // to immediately release audio/video decoder buffers from RAM
      media.load();
    } catch (err) {
      console.warn('[MemoryManager] Media element detachment warning:', err);
    }
  }

  /**
   * Deallocates a Canvas element and clears its 2D context to release GPU textures.
   */
  public deallocateCanvas(canvas: HTMLCanvasElement | null): void {
    if (!canvas) return;

    try {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      canvas.width = 0;
      canvas.height = 0;
    } catch (err) {
      console.warn('[MemoryManager] Canvas deallocation warning:', err);
    }
  }

  /**
   * Registers a custom cleanup callback for a specific component name.
   */
  public registerCleanup(componentName: string, cleanupFn: () => void): () => void {
    if (!this.cleanupRegistry.has(componentName)) {
      this.cleanupRegistry.set(componentName, new Set());
    }
    const cleanups = this.cleanupRegistry.get(componentName)!;
    cleanups.add(cleanupFn);

    return () => {
      cleanups.delete(cleanupFn);
      if (cleanups.size === 0) {
        this.cleanupRegistry.delete(componentName);
      }
    };
  }

  /**
   * Executes and purges all cleanups for a specific component.
   */
  public cleanupComponent(componentName: string): void {
    const cleanups = this.cleanupRegistry.get(componentName);
    if (cleanups) {
      cleanups.forEach(fn => {
        try {
          fn();
        } catch (e) {
          console.error(`[MemoryManager] Error executing cleanup for ${componentName}:`, e);
        }
      });
      this.cleanupRegistry.delete(componentName);
    }

    // Also revoke any tracked blob URLs for this component
    this.revokeBlobUrlsByOwner(componentName);
  }

  /**
   * Automatically executes comprehensive cleanup when the user navigates between routes.
   */
  public performNavigationCleanup(fromRoute?: string, toRoute?: string): void {
    if (this.isCleanupRunning) return;
    this.isCleanupRunning = true;

    try {
      // 1. Cancel active speech synthesis to release TTS audio buffers
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
        } catch (e) {}
      }

      // 2. Scan and detach unmounted or orphaned audio/video elements in document
      if (typeof document !== 'undefined') {
        try {
          const detachedMedia = document.querySelectorAll('[data-transient-media="true"]');
          detachedMedia.forEach((el) => {
            this.detachMediaElement(el as HTMLMediaElement);
            el.remove();
          });
        } catch (e) {}
      }

      // 3. Prune oldest blob URLs if accumulated
      if (this.blobRegistry.size > 25) {
        this.pruneOldestBlobs(15);
      }

      // 4. Suggest browser garbage collection if available (Node or Chromium debug flag)
      if (typeof window !== 'undefined' && 'gc' in window && typeof (window as any).gc === 'function') {
        try {
          (window as any).gc();
        } catch (e) {}
      }

      // 5. Dispatch navigation cleanup event for specialized services (like mushafService)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('app_memory_cleaned', {
          detail: { fromRoute, toRoute, timestamp: Date.now() }
        }));
      }
    } finally {
      this.isCleanupRunning = false;
    }
  }

  /**
   * Prunes the oldest N Blob URLs to maintain a low memory footprint.
   */
  public pruneOldestBlobs(count: number): void {
    const entries = Array.from(this.blobRegistry.entries());
    entries.sort((a, b) => a[1].createdAt - b[1].createdAt);

    const toPrune = entries.slice(0, count);
    for (const [url] of toPrune) {
      this.revokeBlobUrl(url);
    }
  }

  /**
   * Emergency purge on page exit or extreme low memory condition.
   */
  public performEmergencyCleanup(): void {
    for (const url of Array.from(this.blobRegistry.keys())) {
      this.revokeBlobUrl(url);
    }
    this.blobRegistry.clear();
    this.cleanupRegistry.clear();
  }

  /**
   * Returns current JS heap usage if supported by the browser engine.
   */
  public getMemoryStats(): { usedMB?: number; totalMB?: number; limitMB?: number } | null {
    if (typeof window !== 'undefined' && (performance as any)?.memory) {
      const mem = (performance as any).memory;
      return {
        usedMB: Math.round(mem.usedJSHeapSize / (1024 * 1024)),
        totalMB: Math.round(mem.totalJSHeapSize / (1024 * 1024)),
        limitMB: Math.round(mem.jsHeapSizeLimit / (1024 * 1024)),
      };
    }
    return null;
  }
}

export const memoryManager = new MemoryManager();
