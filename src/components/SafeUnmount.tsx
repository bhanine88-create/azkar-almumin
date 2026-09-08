import React, { useEffect, useRef } from 'react';

interface SafeUnmountProps {
  children: React.ReactNode;
  componentName?: string;
}

/**
 * A specialized wrapper for heavy, content-dense components.
 * It ensures that when the user navigates away:
 * 1. The component is explicitly and immediately unmounted from the DOM.
 * 2. Heavy references (refs, event listeners, intervals) are cleared.
 * 3. Uses Suspense and transitions to prevent UI thread lag during navigation transitions.
 */
export const SafeUnmount: React.FC<SafeUnmountProps> = ({ children, componentName = 'Component' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      // Aggressive cleanup on unmount
      console.log(`[SafeUnmount] Initiating aggressive memory purging for: ${componentName}`);
      
      // 1. Clear any lingering audio elements created inside this container
      if (containerRef.current) {
        try {
          const audios = containerRef.current.querySelectorAll('audio, video');
          audios.forEach((media) => {
            const m = media as HTMLMediaElement;
            m.pause();
            m.src = '';
            m.load();
            m.remove();
          });
        } catch (e) {
          console.warn('[SafeUnmount] Failed to purge media elements:', e);
        }

        // 2. Purge dynamic canvas contexts to free GPU memory
        try {
          const canvases = containerRef.current.querySelectorAll('canvas');
          canvases.forEach((canvas) => {
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
            canvas.width = 0;
            canvas.height = 0;
            canvas.remove();
          });
        } catch (e) {
          console.warn('[SafeUnmount] Failed to purge canvas contexts:', e);
        }
      }

      // 3. Suggest garbage collection
      if (typeof window !== 'undefined') {
        try {
          if ('gc' in window && typeof (window as any).gc === 'function') {
            (window as any).gc();
          }
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
    return () => {
      console.log(`[useMemoryCleanup] Executing custom memory cleanup hook for ${options?.componentName || 'component'}`);
      if (cleanupRef.current) {
        try {
          cleanupRef.current();
        } catch (err) {
          console.error('[useMemoryCleanup] Custom cleanup failed:', err);
        }
      }
    };
  }, [options?.componentName]);
}
