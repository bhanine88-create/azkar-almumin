import { Capacitor, registerPlugin } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';

/**
 * Over-the-air updater for the web layer of the native app.
 *
 * The APK ships with a full copy of `dist` inside its assets, so the app always
 * opens instantly and offline. This module then upgrades that web layer in the
 * background from the official Netlify deployment, which means day-to-day UI and
 * content changes reach users without publishing a new APK/AAB.
 *
 * It uses Capacitor's built-in `WebView` plugin - the same mechanism Ionic's
 * Live Updates is built on:
 *
 *   1. download + verify the new bundle, unpack it into app-private storage
 *   2. `setServerBasePath()` - points the local server at it and reloads
 *   3. `persistServerBasePath()` - called ONLY after the new bundle has actually
 *      booted and executed this file
 *
 * Because step 3 happens after a successful boot, a bundle that fails to start
 * is never persisted: killing and reopening the app falls straight back to the
 * assets baked into the APK. Capacitor additionally clears the persisted path
 * whenever the native versionCode/versionName changes, so installing a newer
 * APK always wins over an older OTA bundle.
 */

interface WebViewPlugin {
  setServerBasePath(options: { path: string }): Promise<void>;
  getServerBasePath(): Promise<{ path: string }>;
  persistServerBasePath(): Promise<void>;
}

const WebViewPlugin = registerPlugin<WebViewPlugin>('WebView');

export const OFFICIAL_ORIGIN = 'https://azkaralmumin.netlify.app';

const VERSION_URL = `${OFFICIAL_ORIGIN}/version.json`;
const OTA_ROOT = 'ota';

/** Build stamp of the assets compiled into this binary (injected by Vite). */
const BINARY_BUILD_TIME = Number(__APP_BUILD_TIME__) || 0;

const KEYS = {
  installedBuild: 'ota_installed_build',
  installedPath: 'ota_installed_path',
  pendingBuild: 'ota_pending_build',
  pendingPath: 'ota_pending_path',
  failedBuilds: 'ota_failed_builds',
  lastCheck: 'ota_last_check',
  enabled: 'ota_enabled',
} as const;

/** Do not auto-download very large bundles; those wait for a manual tap. */
const MAX_AUTO_DOWNLOAD_BYTES = 40 * 1024 * 1024;
const CHECK_INTERVAL_MS = 30 * 60 * 1000;
const VERSION_FETCH_TIMEOUT_MS = 10_000;
const BUNDLE_FETCH_TIMEOUT_MS = 180_000;
/** Files written in parallel while unpacking. Keeps the UI responsive. */
const WRITE_CONCURRENCY = 6;

export interface RemoteVersion {
  version: string;
  buildTime: number;
  bundle: string;
  bundleBytes?: number;
  sha256?: string;
}

export interface OtaState {
  /** Build stamp of the web layer actually running right now. */
  activeBuild: number;
  binaryBuild: number;
  isOtaBundle: boolean;
}

export type OtaStatus = 'idle' | 'checking' | 'downloading' | 'installing' | 'ready' | 'error';

let status: OtaStatus = 'idle';
let inFlight: Promise<boolean> | null = null;
let intervalId: ReturnType<typeof setInterval> | null = null;
const STARTUP_CHECK_DELAY_MS = 30_000;

const listeners = new Set<(status: OtaStatus, progress: number) => void>();

function emit(next: OtaStatus, progress = 0) {
  status = next;
  listeners.forEach((fn) => {
    try {
      fn(next, progress);
    } catch {
      /* a broken listener must not abort an update */
    }
  });
}

export function onOtaStatus(fn: (status: OtaStatus, progress: number) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getOtaStatus(): OtaStatus {
  return status;
}

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage can be blocked; OTA just degrades to "no update" */
  }
}

function remove(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

function failedBuilds(): number[] {
  try {
    const parsed = JSON.parse(read(KEYS.failedBuilds) || '[]');
    return Array.isArray(parsed) ? parsed.filter((n) => Number.isFinite(n)) : [];
  } catch {
    return [];
  }
}

function markFailed(buildTime: number) {
  const next = Array.from(new Set([...failedBuilds(), buildTime])).slice(-10);
  write(KEYS.failedBuilds, JSON.stringify(next));
}

export function isOtaSupported(): boolean {
  return (
    Capacitor.isNativePlatform() &&
    Capacitor.getPlatform() === 'android' &&
    Capacitor.isPluginAvailable('Filesystem')
  );
}

export function isOtaEnabled(): boolean {
  return read(KEYS.enabled) !== 'false';
}

export function setOtaEnabled(enabled: boolean) {
  write(KEYS.enabled, enabled ? 'true' : 'false');
}

export function getOtaState(): OtaState {
  const installed = Number(read(KEYS.installedBuild)) || 0;
  return {
    activeBuild: Math.max(installed, BINARY_BUILD_TIME),
    binaryBuild: BINARY_BUILD_TIME,
    isOtaBundle: installed > BINARY_BUILD_TIME,
  };
}

async function currentBasePath(): Promise<string> {
  try {
    const { path } = await WebViewPlugin.getServerBasePath();
    return path || '';
  } catch {
    return '';
  }
}

/**
 * Confirms or rolls back a bundle that was installed on the previous run.
 *
 * Reaching this function means JavaScript is executing, so if the local server
 * is serving the pending bundle it booted correctly and can be persisted.
 * If we are NOT running it, that bundle broke and is blacklisted.
 */
async function settlePendingBundle(): Promise<void> {
  const pendingPath = read(KEYS.pendingPath);
  const pendingBuild = Number(read(KEYS.pendingBuild)) || 0;
  if (!pendingPath || !pendingBuild) return;

  const basePath = await currentBasePath();

  if (basePath && basePath === pendingPath) {
    try {
      await WebViewPlugin.persistServerBasePath();
      write(KEYS.installedBuild, String(pendingBuild));
      write(KEYS.installedPath, pendingPath);
      remove(KEYS.pendingBuild);
      remove(KEYS.pendingPath);
      console.info('[OTA] Bundle', pendingBuild, 'booted successfully and is now persisted.');
      void pruneOldBundles(pendingBuild);
    } catch (err) {
      console.warn('[OTA] Failed to persist a booted bundle:', err);
    }
    return;
  }

  console.warn('[OTA] Bundle', pendingBuild, 'did not boot. Rolling back to the bundled assets.');
  markFailed(pendingBuild);
  remove(KEYS.pendingBuild);
  remove(KEYS.pendingPath);
  await deleteBundleDir(pendingBuild);
}

async function deleteBundleDir(buildTime: number) {
  try {
    await Filesystem.rmdir({
      path: `${OTA_ROOT}/${buildTime}`,
      directory: Directory.Data,
      recursive: true,
    });
  } catch {
    /* already gone */
  }
}

/** Keeps only the live bundle on disk so OTA storage cannot grow without bound. */
async function pruneOldBundles(keepBuild: number) {
  try {
    const { files } = await Filesystem.readdir({ path: OTA_ROOT, directory: Directory.Data });
    for (const entry of files) {
      const name = typeof entry === 'string' ? entry : entry.name;
      if (name && name !== String(keepBuild)) {
        await deleteBundleDir(Number(name));
      }
    }
  } catch {
    /* no ota dir yet */
  }
}

async function fetchJsonWithTimeout(url: string, timeoutMs: number): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      cache: 'no-store',
      signal: controller.signal,
      headers: { 'Cache-Control': 'no-cache' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

async function sha256Hex(buffer: ArrayBuffer): Promise<string | null> {
  try {
    if (!globalThis.crypto?.subtle) return null;
    const digest = await crypto.subtle.digest('SHA-256', buffer);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  } catch {
    return null;
  }
}

function isValidRemoteVersion(data: unknown): data is RemoteVersion {
  if (!data || typeof data !== 'object') return false;
  const candidate = data as Partial<RemoteVersion>;
  return (
    typeof candidate.bundle === 'string' &&
    candidate.bundle.length > 0 &&
    Number.isFinite(Number(candidate.buildTime)) &&
    Number(candidate.buildTime) > 0
  );
}

/**
 * Downloads, verifies and unpacks a bundle, then hands the WebView over to it.
 * Returns true when the WebView has been pointed at the new bundle.
 */
async function installBundle(remote: RemoteVersion): Promise<boolean> {
  if (document.visibilityState !== 'visible') return false;
  const buildTime = Number(remote.buildTime);
  const bundleUrl = new URL(remote.bundle, OFFICIAL_ORIGIN);

  // The bundle becomes executable app code, so it may only come from our origin.
  if (bundleUrl.origin !== OFFICIAL_ORIGIN) {
    console.warn('[OTA] Refusing a bundle from an unexpected origin:', bundleUrl.origin);
    return false;
  }

  emit('downloading');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), BUNDLE_FETCH_TIMEOUT_MS);
  let payload: ArrayBuffer;
  try {
    const res = await fetch(bundleUrl.toString(), { cache: 'no-store', signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    payload = await res.arrayBuffer();
  } finally {
    clearTimeout(timer);
  }

  // Integrity check: a bundle that does not match the published digest is
  // rejected outright rather than executed.
  if (remote.sha256) {
    const actual = await sha256Hex(payload);
    if (actual && actual.toLowerCase() !== remote.sha256.toLowerCase()) {
      console.error('[OTA] Checksum mismatch - bundle rejected.');
      markFailed(buildTime);
      return false;
    }
  }

  emit('installing');
  const { default: JSZip } = await import('jszip');
  const zip = await JSZip.loadAsync(payload);

  const entries = Object.values(zip.files).filter((f) => !f.dir);
  if (!entries.some((f) => f.name === 'index.html')) {
    console.error('[OTA] Bundle has no index.html at its root - rejected.');
    markFailed(buildTime);
    return false;
  }

  const targetDir = `${OTA_ROOT}/${buildTime}`;
  await deleteBundleDir(buildTime);
  await Filesystem.mkdir({ path: targetDir, directory: Directory.Data, recursive: true });

  let written = 0;
  let cursor = 0;
  const writeNext = async (): Promise<void> => {
    while (cursor < entries.length) {
      const entry = entries[cursor++];
      // Reject traversal attempts before they can escape the bundle directory.
      if (entry.name.includes('..') || entry.name.startsWith('/')) continue;
      const data = await entry.async('base64');
      await Filesystem.writeFile({
        path: `${targetDir}/${entry.name}`,
        data,
        directory: Directory.Data,
        recursive: true,
      });
      written += 1;
      emit('installing', written / entries.length);
    }
  };
  await Promise.all(Array.from({ length: WRITE_CONCURRENCY }, writeNext));

  const { uri } = await Filesystem.getUri({ path: targetDir, directory: Directory.Data });
  const nativePath = decodeURI(uri).replace(/^file:\/\//, '');

  // Do not restart the hidden WebView: it would make the next app resume wait
  // for a full page boot. Discard this attempt and try again on a later check.
  if (document.visibilityState !== 'visible') {
    await deleteBundleDir(buildTime);
    emit('idle');
    return false;
  }

  // Mark as pending BEFORE the reload; the next boot decides keep vs. roll back.
  write(KEYS.pendingBuild, String(buildTime));
  write(KEYS.pendingPath, nativePath);

  emit('ready');
  console.info('[OTA] Activating bundle', buildTime, 'from', nativePath);
  await WebViewPlugin.setServerBasePath({ path: nativePath });
  return true;
}

/**
 * Checks Netlify for a newer web build and installs it when one exists.
 * @param manual set to true from a user-initiated "check for updates" action,
 *               which bypasses the automatic size limit.
 */
export async function checkForOtaUpdate(manual = false): Promise<boolean> {
  if (!isOtaSupported() || (!manual && !isOtaEnabled())) return false;
  if (inFlight) return inFlight;
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return false;

  inFlight = (async () => {
    try {
      emit('checking');
      write(KEYS.lastCheck, String(Date.now()));

      const data = await fetchJsonWithTimeout(
        `${VERSION_URL}?t=${Date.now()}`,
        VERSION_FETCH_TIMEOUT_MS
      );
      if (!isValidRemoteVersion(data)) {
        emit('idle');
        return false;
      }

      const remote = data;
      const remoteBuild = Number(remote.buildTime);
      const { activeBuild } = getOtaState();

      if (remoteBuild <= activeBuild) {
        emit('idle');
        return false;
      }
      if (failedBuilds().includes(remoteBuild)) {
        emit('idle');
        return false;
      }
      if (!manual && Number(remote.bundleBytes) > MAX_AUTO_DOWNLOAD_BYTES) {
        console.info('[OTA] Update available but too large for an automatic download.');
        emit('idle');
        return false;
      }

      return await installBundle(remote);
    } catch (err) {
      console.warn('[OTA] Update check failed:', err);
      emit('error');
      return false;
    } finally {
      inFlight = null;
      if (status === 'checking' || status === 'downloading' || status === 'installing') emit('idle');
    }
  })();

  return inFlight;
}

/**
 * Entry point, called once from `main.tsx`. Never blocks startup: the first
 * check is deferred until after the app has painted.
 */
export function initOtaUpdater(): () => void {
  if (!isOtaSupported()) return () => {};

  void settlePendingBundle();

  const kickCheck = () => {
    if (document.visibilityState === 'visible') void checkForOtaUpdate();
  };

  // Initial startup and foregrounding should only render the locally bundled
  // app. A version probe can involve a large download and ZIP extraction, and
  // running it immediately on resume makes reopening feel like another launch.
  // This module is loaded after the first route paints. The inline boot
  // controller removes data-booting before it dispatches appReady, so a late
  // import must recognize that readiness has already happened.
  let ready = !document.documentElement.hasAttribute('data-booting');
  let checkTimer: ReturnType<typeof setTimeout> | null = null;
  const scheduleCheck = () => {
    if (!ready || document.visibilityState !== 'visible' || checkTimer) return;
    // Android can emit "online" again when an app resumes. Respect the same
    // interval there, so every return does not start a new version probe.
    const last = Number(read(KEYS.lastCheck)) || 0;
    if (Date.now() - last < CHECK_INTERVAL_MS) return;
    checkTimer = setTimeout(() => {
      checkTimer = null;
      kickCheck();
    }, STARTUP_CHECK_DELAY_MS);
  };
  const onAppReady = () => {
    ready = true;
    scheduleCheck();
  };
  window.addEventListener('appReady', onAppReady, { once: true });
  if (ready) scheduleCheck();
  // Timer callbacks may be delivered as soon as Android resumes a suspended
  // WebView. Route them through the same delay as a foreground event.
  intervalId = setInterval(scheduleCheck, CHECK_INTERVAL_MS);

  const onVisible = () => {
    if (document.visibilityState !== 'visible') {
      if (checkTimer) clearTimeout(checkTimer);
      checkTimer = null;
      return;
    }
    scheduleCheck();
  };

  document.addEventListener('visibilitychange', onVisible);
  window.addEventListener('online', scheduleCheck);

  return () => {
    if (checkTimer) clearTimeout(checkTimer);
    if (intervalId) clearInterval(intervalId);
    window.removeEventListener('appReady', onAppReady);
    document.removeEventListener('visibilitychange', onVisible);
    window.removeEventListener('online', scheduleCheck);
  };
}
