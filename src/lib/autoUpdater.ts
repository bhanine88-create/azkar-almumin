import { Capacitor } from '@capacitor/core';
import { registerSW } from 'virtual:pwa-register';

const LIVE_APP_URL = 'https://ais-pre-6lmcwdbxwli4qmb6fr6hbn-194075133835.europe-west3.run.app';

// Store client session initial build time
let currentBuildTime: number | null = null;
let updateSWHandler: ((reloadPage?: boolean) => Promise<void>) | null = null;
let swRegistration: ServiceWorkerRegistration | null = null;
let isRefreshing = false;

// Detect if running inside preview iframe
const isInsideIframe = typeof window !== 'undefined' && window.self !== window.top;
const isDevMode = import.meta.env.DEV;

export async function checkServerVersion(): Promise<{ hasUpdate: boolean; version?: string; serverBuildTime?: number }> {
  try {
    const isLocalAPK = typeof window !== 'undefined' && Capacitor.isNativePlatform() && (window.location.hostname === 'localhost' || window.location.protocol === 'file:');
    let fetchUrl = `/api/app-version?t=${Date.now()}`;
    if (isLocalAPK) {
       fetchUrl = `${LIVE_APP_URL}/api/app-version?t=${Date.now()}`;
    }
    const res = await fetch(fetchUrl, {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    if (!res.ok) return { hasUpdate: false };
    const data = await res.json();
    const serverBuild = Number(data.buildTime) || 0;

    if (isLocalAPK) {
        return { hasUpdate: true, version: data.version, serverBuildTime: serverBuild };
    }

    if (currentBuildTime === null) {
      currentBuildTime = serverBuild;
      return { hasUpdate: false, version: data.version, serverBuildTime: serverBuild };
    }

    if (serverBuild > currentBuildTime) {
      console.log(`[AutoUpdater] New deployment detected on server (${serverBuild} > ${currentBuildTime}).`);
      return { hasUpdate: true, version: data.version, serverBuildTime: serverBuild };
    }

    return { hasUpdate: false, version: data.version, serverBuildTime: serverBuild };
  } catch (err) {
    return { hasUpdate: false };
  }
}

export async function triggerImmediateUpdate(): Promise<void> {
  if (isRefreshing) return;
  isRefreshing = true;

  console.log('[AutoUpdater] Applying instant update...');

  if (typeof window !== 'undefined' && Capacitor.isNativePlatform()) {
    const isLocalAPK = window.location.hostname === 'localhost' || window.location.protocol === 'file:';
    if (isLocalAPK) {
        localStorage.setItem('use_live_update', 'true');
        window.location.href = LIVE_APP_URL;
        return;
    }
  }

  // Unregister existing workers to force fresh installation if needed
  if ('serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const reg of registrations) {
        await reg.update();
      }
    } catch (e) {
      // ignore
    }
  }

  // If we have updateSW handler, execute it
  if (updateSWHandler) {
    try {
      await updateSWHandler(true);
    } catch (e) {
      console.warn('[AutoUpdater] updateSW failed, falling back to reload', e);
    }
  }

  // Small delay to ensure caches flush, then reload
  setTimeout(() => {
    window.location.reload();
  }, 150);
}

export function initAutoUpdater() {
  if (typeof window === 'undefined') return () => {};

  // Clean up legacy image caches immediately so new official icons appear without delay
  if ('caches' in window) {
    caches.keys().then((keys) => {
      keys.forEach((key) => {
        if (
          key.includes('static-images-cache-v4') ||
          key.includes('static-images-cache-v3') ||
          key.includes('static-images-cache-v2') ||
          key.includes('static-images-cache-v1') ||
          key.includes('athkar-mumin-v4') ||
          key.includes('athkar-mumin-v3') ||
          key.includes('static-code-cache-v3') ||
          key.includes('static-code-cache-v4')
        ) {
          console.log('[AutoUpdater] Purging legacy cache:', key);
          caches.delete(key);
        }
      });
    }).catch(() => {});
  }

  // In development mode or inside iframe preview, unregister all SWs to avoid intercepting on-demand Vite modules
  if (isDevMode || isInsideIframe) {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const reg of registrations) {
          console.log('[AutoUpdater] Unregistering service worker in dev/iframe mode:', reg.scope);
          reg.unregister();
        }
      }).catch(() => {});
    }
    return () => {};
  }

  // Handle service worker controller change (instant activation when new worker claims clients in production)
  if ('serviceWorker' in navigator) {
    let initialController = navigator.serviceWorker.controller;
    
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (initialController && !isRefreshing) {
        isRefreshing = true;
        console.log('[AutoUpdater] Controller changed. Reloading immediately for instant update.');
        window.location.reload();
      } else if (!initialController) {
        initialController = navigator.serviceWorker.controller;
        console.log('[AutoUpdater] Initial SW claimed client. No reload needed.');
      }
    });

    try {
      updateSWHandler = registerSW({
        immediate: true,
        onNeedRefresh() {
          console.log('[AutoUpdater] SW onNeedRefresh fired - updating now...');
          if (updateSWHandler) {
            updateSWHandler(true);
          } else {
            window.location.reload();
          }
        },
        onOfflineReady() {
          console.log('[AutoUpdater] App is ready for offline usage.');
        },
        onRegistered(registration) {
          swRegistration = registration || null;
          if (registration) {
            // Check for update immediately on registration
            registration.update().catch(() => {});
          }
        },
        onRegisterError(error) {
          console.warn('[AutoUpdater] SW register error:', error);
        }
      });
    } catch (e) {
      console.warn('[AutoUpdater] Failed to register SW:', e);
    }
  }

  // Initial server version check
  checkServerVersion();

  // Periodic heartbeat: check every 30 seconds for new server deployments or SW updates
  const intervalId = setInterval(async () => {
    if (document.visibilityState === 'visible') {
      if (swRegistration) {
        swRegistration.update().catch(() => {});
      }
      
      const status = await checkServerVersion();
      if (status.hasUpdate) {
        triggerImmediateUpdate();
      }
    }
  }, 30000);

  // Check whenever user switches back to the tab, focuses, or reconnects online
  const handleVisibilityOrFocus = async () => {
    if (document.visibilityState === 'visible') {
      if (swRegistration) {
        swRegistration.update().catch(() => {});
      }
      const status = await checkServerVersion();
      if (status.hasUpdate) {
        triggerImmediateUpdate();
      }
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityOrFocus);
  window.addEventListener('focus', handleVisibilityOrFocus);
  window.addEventListener('online', handleVisibilityOrFocus);

  return () => {
    clearInterval(intervalId);
    document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
    window.removeEventListener('focus', handleVisibilityOrFocus);
    window.removeEventListener('online', handleVisibilityOrFocus);
  };
}
