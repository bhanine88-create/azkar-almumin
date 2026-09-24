import type { CapacitorConfig } from '@capacitor/cli';

/**
 * أذكار المؤمن — Capacitor configuration
 *
 * The app is packaged as a fully native WebView app:
 *   - `webDir` assets are bundled inside the APK/AAB, so the first launch works
 *     with no internet at all and there is never a browser/address bar.
 *   - There is deliberately NO `server.url`. Pointing the WebView at a remote
 *     origin would make the app unusable offline and would break the Capacitor
 *     bridge. Web-layer updates are delivered over-the-air instead, by
 *     `src/lib/otaUpdater.ts` + `WebView.setServerBasePath()`.
 *   - `androidScheme: 'https'` keeps the WebView on a secure origin
 *     (`https://localhost`), which is required for Service Workers,
 *     crypto.subtle, and persistent storage quotas.
 */
const OFFICIAL_ORIGIN = 'azkaralmumin.netlify.app';

const config: CapacitorConfig = {
  appId: 'com.azkar.almumin',
  appName: 'أذكار المؤمن',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
    hostname: 'localhost',
    // Only the official domain may be opened inside the WebView; every other
    // link is handed to the system browser.
    allowNavigation: [OFFICIAL_ORIGIN],
  },
  android: {
    // Block http:// sub-resources from being pulled into the https:// origin.
    allowMixedContent: false,
    captureInput: true,
    // Never ship a debuggable WebView to production.
    webContentsDebuggingEnabled: false,
    backgroundColor: '#052418',
    loggingBehavior: 'none',
    useLegacyBridge: false,
  },
  ios: {
    contentInset: 'always',
    backgroundColor: '#052418',
    limitsNavigationsToAppBoundDomains: true,
  },
  plugins: {
    SplashScreen: {
      // Android's launch theme, MainActivity's native cover, and inline HTML
      // splash cover startup continuously. The native cover waits for a verified
      // WebView draw; disable the plugin's independent timed launch overlay.
      // main.tsx fades the HTML cover only after the first route is ready.
      launchAutoHide: true,
      launchShowDuration: 0,
      launchFadeOutDuration: 250,
      backgroundColor: '#052418',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
      // No `layoutName`. It pointed at res/layout/launch_screen.xml, which does
      // not exist in this project, so the plugin logged "Layout not found" and
      // fell back to androidSplashResourceName every launch — and
      // `loggingBehavior: 'none'` above swallowed the warning. The fallback is
      // what we actually want, so the option is simply gone rather than being
      // propped up with a layout that would duplicate splash.png.
      useDialog: false,
    },
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#052418',
      overlaysWebView: false,
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_notify',
      iconColor: '#0D9488',
      sound: 'beep.wav',
    },
    CapacitorHttp: {
      enabled: false,
    },
  },
};

export default config;
