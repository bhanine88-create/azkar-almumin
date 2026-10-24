import { lazy, LazyExoticComponent, ComponentType } from 'react';

export type PreloadableComponent<T extends ComponentType<any>> = LazyExoticComponent<T> & {
  preload: () => Promise<any>;
};

/**
 * A robust lazy loading wrapper that retries importing a module on failure (e.g., due to network glitch or server restart).
 * Also attaches a .preload() method to enable background preloading of critical routes during idle time or hover.
 */
export function lazyRetry<T extends ComponentType<any>>(
  importFn: () => Promise<any>,
  name?: string
): PreloadableComponent<T> {
  let cachedPromise: Promise<{ default: ComponentType<any> }> | null = null;

  const loadModule = (isPreload = false): Promise<{ default: ComponentType<any> }> => {
    let retries = 5;
    let lastError: any = null;

    const executeLoad = async (): Promise<{ default: ComponentType<any> }> => {
      while (retries > 0) {
        try {
          const module = await importFn();
          
          if (module) {
            // Direct function/component default export
            if (typeof module.default === 'function' || (module.default && module.default.$$typeof)) {
              return { default: module.default };
            }
            
            // Named export matching component name
            if (name && module[name] && (typeof module[name] === 'function' || module[name].$$typeof)) {
              return { default: module[name] };
            }
            
            // Double default wrapped export (e.g. from transpilers)
            if (module.default && typeof module.default === 'object' && module.default.default) {
              return { default: module.default.default };
            }
            
            // General default export fallback
            if ('default' in module && module.default) {
              return { default: module.default };
            }
            
            // Fallback: look for first exported React component or function
            for (const key of Object.keys(module)) {
              if (typeof module[key] === 'function' || (module[key] && module[key].$$typeof)) {
                return { default: module[key] };
              }
            }
          }
          
          throw new Error(`Module has no valid exports`);
        } catch (error) {
          retries -= 1;
          lastError = error;
          console.warn(`lazyRetry: failed to load module${name ? ` (${name})` : ''}, attempts left: ${retries}`, error);
          
          if (retries === 0) {
            console.error(`lazyRetry: final failure loading module${name ? ` (${name})` : ''}:`, error);
            // Clear cache so subsequent renders/clicks can retry
            cachedPromise = null;

            if (isPreload) {
              // Preloads should fail gracefully without throwing or triggering full page reloads
              return { default: (() => null) as any };
            }

            // Unregister any active service worker that might be intercepting source module fetches
            if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
              navigator.serviceWorker.getRegistrations().then(regs => {
                regs.forEach(r => r.unregister());
              }).catch(() => {});
            }

            throw error;
          }
          
          // Progressive backoff: 400ms, 800ms, 1200ms, 1600ms...
          const delay = (5 - retries) * 400;
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
      cachedPromise = null;
      throw lastError || new Error('Failed to load component');
    };

    return executeLoad();
  };

  const Component = lazy(() => {
    if (!cachedPromise) {
      cachedPromise = loadModule(false);
    }
    return cachedPromise;
  }) as PreloadableComponent<T>;

  Component.preload = () => {
    if (!cachedPromise) {
      cachedPromise = loadModule(true);
    }
    return cachedPromise;
  };

  return Component;
}

