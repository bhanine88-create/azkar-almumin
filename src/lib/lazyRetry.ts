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

  const loadModule = (): Promise<{ default: ComponentType<any> }> => {
    if (!cachedPromise) {
      cachedPromise = (async () => {
        let retries = 5;
        let lastError: any = null;
        while (retries > 0) {
          try {
            let module: any = null;
            if (retries === 5 || !lastError) {
              module = await importFn();
            } else {
              // On retry, bypass browser ESM failed promise cache using cache-busting query parameter
              const errMsg = String(lastError?.message || lastError || '');
              const urlMatch = errMsg.match(/https?:\/\/[^\s']+/);
              
              if (urlMatch) {
                const cleanUrl = urlMatch[0];
                const cacheBusted = cleanUrl + (cleanUrl.includes('?') ? '&' : '?') + 't=' + Date.now();
                module = await import(/* @vite-ignore */ cacheBusted);
              } else if (name) {
                const cacheBusted = `/src/components/${name}.tsx?t=` + Date.now();
                module = await import(/* @vite-ignore */ cacheBusted);
              } else {
                module = await importFn();
              }
            }
            
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

              // If SW is interfering with dynamic module imports in browser, unregister it
              if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(regs => {
                  regs.forEach(r => r.unregister());
                }).catch(() => {});
              }

              const lastReload = sessionStorage.getItem('last-chunk-reload');
              const now = Date.now();
              
              if (!lastReload || now - parseInt(lastReload, 10) > 8000) {
                sessionStorage.setItem('last-chunk-reload', String(now));
                window.location.reload();
                return new Promise(() => {}) as any; // Wait for reload
              }
              throw error;
            }
            // Exponential backoff
            await new Promise((resolve) => setTimeout(resolve, 300 * (6 - retries)));
          }
        }
        cachedPromise = null;
        throw new Error('Failed to load component');
      })();
    }
    return cachedPromise;
  };

  const Component = lazy(loadModule) as PreloadableComponent<T>;
  Component.preload = loadModule;
  return Component;
}
