import React, { useEffect, useRef } from 'react';
import { memoryManager } from '../services/memoryManager';
import { stabilityManager } from '../services/stabilityManager';

interface SafeUnmountProps {
  children: React.ReactNode;
  componentName?: string;
}

/**
 * A specialized wrapper for heavy, content-dense components.
 * It ensures that when the user navigates away:
 * 1. The component is explicitly and immediately unmounted from the DOM.
 * 2. Heavy references (refs, event listeners, intervals, blobs) are purged via MemoryManager.
 * 3. Media elements (Audio/Video) are paused, unloaded, and detached to release OS audio buffers.
 * 4. Canvas elements are deallocated to immediately free GPU texture memory.
 */
export const SafeUnmount: React.FC<SafeUnmountProps> = ({ children, componentName = 'Component' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      // 1. Clear any lingering media elements created inside this container
      if (containerRef.current) {
        try {
          const mediaList = containerRef.current.querySelectorAll('audio, video');
          mediaList.forEach((media) => {
            memoryManager.detachMediaElement(media as HTMLMediaElement);
            media.remove();
          });
        } catch (e) {
          console.warn('[SafeUnmount] Failed to purge media elements:', e);
        }

        // 2. Purge dynamic canvas contexts to free GPU memory
        try {
          const canvases = containerRef.current.querySelectorAll('canvas');
          canvases.forEach((canvas) => {
            memoryManager.deallocateCanvas(canvas);
            canvas.remove();
          });
        } catch (e) {
          console.warn('[SafeUnmount] Failed to purge canvas contexts:', e);
        }
      }

      // 3. Purge all component-scoped registrations and Blob URLs
      memoryManager.cleanupComponent(componentName);

      // 4. Trigger scheduled stability and resource recycling cycle
      stabilityManager.scheduleCleanup('idle');

      // 5. Suggest garbage collection if supported
      if (typeof window !== 'undefined' && 'gc' in window && typeof (window as any).gc === 'function') {
        try {
          (window as any).gc();
        } catch (e) {}
      }
    };
  }, [componentName]);

  return (
    <div 
      ref={containerRef} 
      data-safe-unmount={componentName}
      className="w-full h-full relative"
    >
      {children}
    </div>
  );
};

/**
 * Custom hook for heavy pages to run explicit cleanups of local states, timers, and heavy models.
 */
export function useMemoryCleanup(options?: {
  onCleanup?: () => void;
  componentName?: string;
}) {
  const cleanupRef = useRef(options?.onCleanup);
  cleanupRef.current = options?.onCleanup;

  useEffect(() => {
    const name = options?.componentName || 'GenericComponent';
    return () => {
      if (cleanupRef.current) {
        try {
          cleanupRef.current();
        } catch (err) {
          console.error('[useMemoryCleanup] Custom cleanup failed:', err);
        }
      }
      memoryManager.cleanupComponent(name);
    };
  }, [options?.componentName]);
}
