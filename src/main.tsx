import { Capacitor } from '@capacitor/core';
import { SplashScreen } from '@capacitor/splash-screen';
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import './i18n';
import App from './App';
import './index.css';

// Global resilience handlers for async operations and audio playback interruptions
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const msg = String(reason?.message || reason || '');
    if (
      msg.includes('interrupted') ||
      msg.includes('user gesture') ||
      msg.includes('NotAllowedError') ||
      msg.includes('AbortError') ||
      msg.includes('canceled') ||
      msg.includes('Fetch')
    ) {
      event.preventDefault();
    }
  });
}

const rootElement = document.getElementById('root')!;

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);

/**
 * Keep the inline brand screen until the first route (or an error screen) has
 * visible content. The HTML controller owns the failure/retry UI, so this also
 * works when a slow first launch or a failed JS import prevents React mounting.
 * MainActivity releases its native cover after a verified WebView draw. The
 * HTML cover does not depend on a native JS event or a page-load/network gate.
 */
{
  const isNative = Capacitor.isNativePlatform();
  // Android's launch window already shows the brand. The HTML cover can leave
  // as soon as the first route has actually painted; an extra minimum makes a
  // quick reopen look like another slow launch.
  const minimumBrandMs = isNative ? 0 : 150;
  let revealQueued = false;

  const startBackgroundServices = () => {
    const start = () => {
      // Downloading update code and inspecting service workers must not hold up
      // the first route or compete with its initial paint.
      void import('./lib/autoUpdater').then(({ initAutoUpdater }) => initAutoUpdater()).catch(() => {});
      void import('./lib/otaUpdater').then(({ initOtaUpdater }) => initOtaUpdater()).catch(() => {});
    };
    if (typeof window.requestIdleCallback === 'function') {
      window.requestIdleCallback(start, { timeout: 5000 });
    } else {
      window.setTimeout(start, 1000);
    }
  };

  const appHasContent = () => {
    const content = rootElement.querySelector('main') || rootElement;
    // innerText excludes hidden nodes and the skeleton's inline <style> text.
    // The existence of <main> alone only proves that the layout shell mounted.
    return content.innerText.trim().length > 0;
  };

  const revealWhenReady = () => {
    if (revealQueued || performance.now() < minimumBrandMs || !appHasContent()) return;
    revealQueued = true;
    observer.disconnect();
    clearTimeout(minimumTimer);

    // Let the committed content reach a paint before fading the HTML cover.
    // If the app starts in the background, these frames resume on foreground.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (isNative) {
        void SplashScreen.hide({ fadeOutDuration: 200 }).catch(() => {
          // Android uses the window background; the plugin may be hidden already.
        });
      }
      window.dispatchEvent(new Event('appReady'));
      startBackgroundServices();
    }));
  };

  const observer = new MutationObserver(revealWhenReady);
  observer.observe(rootElement, { childList: true, subtree: true, characterData: true });
  const minimumTimer = window.setTimeout(revealWhenReady, Math.max(0, minimumBrandMs - performance.now()));
  revealWhenReady();
}
