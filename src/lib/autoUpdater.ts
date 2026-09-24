import { Capacitor } from '@capacitor/core';
import { registerSW } from 'virtual:pwa-register';

/**
 * Update pipeline for the web / PWA build.
 *
 * Caching model is cache-first, network-fallback: Workbox precaches the whole
 * app shell at install time, so every later launch is served from disk and the
 * app opens instantly with no network at all. Freshness is handled out of band
 * — we poll `/version.json` and ask the service worker to re-check — and a new
 * build is swapped in only at a moment where a reload will not interrupt the
 * user.
 *
 * On native builds this module deliberately does almost nothing. The assets
 * there are already local files inside the APK, so a service worker adds no
 * speed, and worse: it would keep serving its own precached copies from the
 * `https://localhost` cache after `otaUpdater` swaps the served directory,
 * silently pinning the app to the old build. Native freshness is owned by
 * `src/lib/otaUpdater.ts` alone.
 */

const VERSION_URL = '/version.json';

/** How often to ask whether a new deployment exists. */
const CHECK_INTERVAL_MS = 15 * 60 * 1000;
const FETCH_TIMEOUT_MS = 8000;

/** Build stamp compiled into the running bundle (injected by Vite). */
const BUILD_TIME = Number(__APP_BUILD_TIME__) || 0;
export const APP_VERSION = __APP_VERSION__;

const isNative = Capacitor.isNativePlatform();
const isDevMode = import.meta.env.DEV;
/** AI Studio and similar previews run the app inside an iframe. */
const isInsideIframe = typeof window !== 'undefined' && window.self !== window.top;

let updateSW: ((reloadPage?: boolean) => Promise<void>) | null = null;
let swRegistration: ServiceWorkerRegistration | null = null;
let updateReady = false;
let isReloading = false;

export interface VersionInfo {
  version: string;
  buildTime: number;
}

function withTimeout(ms: number): { signal: AbortSignal; done: () => void } {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, done: () => clearTimeout(timer) };
}

/** True when a reload right now would visibly interrupt the user. */
function isBusy(): boolean {
  if (document.visibilityState !== 'visible') return false;

  // Never cut off Quran recitation, a lecture or an adhan mid-playback.
  const media = Array.from(document.querySelectorAll('audio, video'));
  if (media.some((el) => !(el as HTMLMediaElement).paused)) return true;

  // Don't yank the page out from under someone who is typing.
  const active = document.activeElement;
  if (active) {
    const tag = active.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || (active as HTMLElement).isContentEditable) {
      return true;
    }
  }

  return false;
}

function applyUpdate() {
  if (isReloading) return;
  isReloading = true;

  if (updateSW) {
    // Activates the waiting worker and reloads once it has taken control.
    updateSW(true).catch(() => window.location.reload());
  } else {
    window.location.reload();
  }
}

/**
 * Reloads into the new build at the first moment it won't be disruptive:
 * right away if the app is idle, otherwise the next time it regains focus.
 */
function applyUpdateWhenIdle() {
  updateReady = true;

  if (!isBusy()) {
    applyUpdate();
    return;
  }

  const retry = () => {
    if (!updateReady || isReloading) return;
    if (!isBusy()) {
      document.removeEventListener('visibilitychange', retry);
      applyUpdate();
    }
  };

  document.addEventListener('visibilitychange', retry);
  const poll = setInterval(() => {
    if (isReloading) {
      clearInterval(poll);
      return;
    }
    retry();
  }, 20_000);
}

/** Reads the deployed build stamp. Returns null when offline or unavailable. */
export async function fetchDeployedVersion(): Promise<VersionInfo | null> {
  const { signal, done } = withTimeout(FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(`${VERSION_URL}?t=${Date.now()}`, {
      cache: 'no-store',
      signal,
      headers: { 'Cache-Control': 'no-cache' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const buildTime = Number(data?.buildTime);
    if (!Number.isFinite(buildTime) || buildTime <= 0) return null;
    return { version: String(data.version ?? ''), buildTime };
  } catch {
    return null;
  } finally {
    done();
  }
}

/** True when Netlify is serving a build newer than the one running. */
export async function hasNewerDeployment(): Promise<boolean> {
  const deployed = await fetchDeployedVersion();
  return !!deployed && BUILD_TIME > 0 && deployed.buildTime > BUILD_TIME;
}

export function isUpdateReady(): boolean {
  return updateReady;
}

/**
 * Applies a waiting update right now. Used by the explicit "check for updates"
 * button, where the user has asked for the interruption.
 */
export function applyUpdateNow() {
  applyUpdate();
}

/** Lets a settings screen force the check instead of waiting for the poll. */
export async function checkForUpdateNow(): Promise<boolean> {
  if (swRegistration) {
    await swRegistration.update().catch(() => {});
  }
  return hasNewerDeployment();
}

/** Removes any service worker and cache left behind by an earlier build. */
async function purgeServiceWorkers(reason: string) {
  if (!('serviceWorker' in navigator)) return;
  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const reg of registrations) {
      console.info(`[AutoUpdater] Unregistering service worker (${reason}):`, reg.scope);
      await reg.unregister();
    }
  } catch {
    /* ignore */
  }
}

export function initAutoUpdater(): () => void {
  if (typeof window === 'undefined') return () => {};

  // A service worker here would fight the OTA updater for control of
  // https://localhost, so make sure none survives from an older build.
  if (isNative) {
    void purgeServiceWorkers('native build serves local assets directly');
    return () => {};
  }

  // A worker would intercept Vite's on-demand module requests in dev, and in an
  // iframe preview it caches a URL the user never visits again.
  if (isDevMode || isInsideIframe) {
    void purgeServiceWorkers('dev / iframe preview');
    return () => {};
  }

  if ('serviceWorker' in navigator) {
    try {
      updateSW = registerSW({
        immediate: true,
        onNeedRefresh() {
          applyUpdateWhenIdle();
        },
        onOfflineReady() {
          console.info('[AutoUpdater] App shell cached — offline launches are ready.');
        },
        onRegisteredSW(_url, registration) {
          swRegistration = registration || null;
        },
        onRegisterError(error) {
          console.warn('[AutoUpdater] Service worker registration failed:', error);
        },
      });
    } catch (err) {
      console.warn('[AutoUpdater] Could not register the service worker:', err);
    }
  }

  const poll = async () => {
    if (document.visibilityState !== 'visible' || isReloading) return;

    if (swRegistration) {
      await swRegistration.update().catch(() => {});
    }

    // `version.json` catches the case where Netlify has a new deploy but the
    // browser has not yet noticed a byte-level change in sw.js.
    if (await hasNewerDeployment()) {
      applyUpdateWhenIdle();
    }
  };

  const intervalId = setInterval(poll, CHECK_INTERVAL_MS);
  const onFocusOrOnline = () => void poll();

  document.addEventListener('visibilitychange', onFocusOrOnline);
  window.addEventListener('online', onFocusOrOnline);

  return () => {
    clearInterval(intervalId);
    document.removeEventListener('visibilitychange', onFocusOrOnline);
    window.removeEventListener('online', onFocusOrOnline);
  };
}
