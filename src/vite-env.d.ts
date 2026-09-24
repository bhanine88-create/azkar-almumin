/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

/**
 * Build-time constants injected by `define` in vite.config.ts.
 * `scripts/build.mjs` keeps them in step with dist/version.json.
 */
declare const __APP_BUILD_TIME__: number;
declare const __APP_VERSION__: string;
