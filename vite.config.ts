import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import pkg from './package.json' with { type: 'json' };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Build stamp shared by every consumer of "is there a newer build?":
 *   - compiled into the bundle as __APP_BUILD_TIME__
 *   - written into dist/version.json by scripts/build.mjs
 *
 * scripts/build.mjs sets APP_BUILD_TIME so both agree exactly. A bare
 * `vite build` still works; it just stamps the moment it ran.
 */
const BUILD_TIME = Number(process.env.APP_BUILD_TIME) || Date.now();
const APP_VERSION = process.env.APP_VERSION || pkg.version;

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    base: '/',
    define: {
      __APP_BUILD_TIME__: JSON.stringify(BUILD_TIME),
      __APP_VERSION__: JSON.stringify(APP_VERSION),
    },
    plugins: [
      react(), 
      tailwindcss(),
      VitePWA({
        // 'prompt' (not 'autoUpdate') because src/lib/autoUpdater.ts decides
        // *when* to swap builds — it holds the reload back while Quran audio is
        // playing or a field is focused, instead of cutting the user off.
        registerType: 'prompt',
        // Registration happens once, from our own code. The injected inline
        // snippet would also register on native, where a service worker must
        // never take over the origin the OTA updater serves from.
        injectRegister: null,
        includeAssets: [
          'favicon.ico',
          'favicon.svg',
          'favicon-16.png',
          'favicon-32.png',
          'apple-touch-icon.png',
          'apple-touch-icon-180x180.png',
          'logo.svg',
          'logo.png',
          'logo-192.png',
          'logo-512.png',
          'logo-maskable-192.png',
          'logo-maskable-512.png',
          'logo-official-192.png',
          'logo-official-512.png',
          'logo-official-maskable-192.png',
          'logo-official-maskable-512.png',
          'QadasiRegular.ttf',
          'images/arabesque.png',
          'images/watermark_official.png'
        ],
        devOptions: {
          enabled: false,
          type: 'module'
        },
        manifest: {
          id: "/?source=pwa",
          scope: "/",
          short_name: "أذكار المؤمن",
          name: "أذكار المؤمن - تطبيق الأذكار والقرآن الكريم",
          description: "تطبيق أذكار المؤمن الشامل للقرآن الكريم، الأذكار، والمسبحة الإلكترونية وتتبع العبادات اليومية.",
          lang: "ar",
          dir: "rtl",
          start_url: "/?source=pwa",
          display: "standalone",
          prefer_related_applications: false,
          display_override: ["standalone", "minimal-ui", "window-controls-overlay"],
          background_color: "#052418",
          theme_color: "#052418",
          orientation: "portrait-primary",
          categories: ["lifestyle", "books", "utilities", "education"],
          icons: [
            {
              src: "/favicon-16.png",
              sizes: "16x16",
              type: "image/png",
              purpose: "any"
            },
            {
              src: "/favicon-32.png",
              sizes: "32x32",
              type: "image/png",
              purpose: "any"
            },
            {
              src: "/logo-48.png",
              sizes: "48x48",
              type: "image/png",
              purpose: "any"
            },
            {
              src: "/logo-72.png",
              sizes: "72x72",
              type: "image/png",
              purpose: "any"
            },
            {
              src: "/logo-96.png",
              sizes: "96x96",
              type: "image/png",
              purpose: "any"
            },
            {
              src: "/logo-128.png",
              sizes: "128x128",
              type: "image/png",
              purpose: "any"
            },
            {
              src: "/logo-144.png",
              sizes: "144x144",
              type: "image/png",
              purpose: "any"
            },
            {
              src: "/logo-152.png",
              sizes: "152x152",
              type: "image/png",
              purpose: "any"
            },
            {
              src: "/logo-180.png",
              sizes: "180x180",
              type: "image/png",
              purpose: "any"
            },
            {
              src: "/logo-192.png",
              type: "image/png",
              sizes: "192x192",
              purpose: "any"
            },
            {
              src: "/logo-maskable-192.png",
              type: "image/png",
              sizes: "192x192",
              purpose: "maskable"
            },
            {
              src: "/logo-384.png",
              sizes: "384x384",
              type: "image/png",
              purpose: "any"
            },
            {
              src: "/logo-maskable-384.png",
              sizes: "384x384",
              type: "image/png",
              purpose: "maskable"
            },
            {
              src: "/logo-512.png",
              type: "image/png",
              sizes: "512x512",
              purpose: "any"
            },
            {
              src: "/logo-maskable-512.png",
              type: "image/png",
              sizes: "512x512",
              purpose: "maskable"
            },
            {
              src: "/logo-official-192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "any"
            },
            {
              src: "/logo-official-512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any"
            },
            {
              src: "/logo-official-maskable-192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "maskable"
            },
            {
              src: "/logo-official-maskable-512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable"
            }
          ],
          shortcuts: [
            {
              name: "القرآن الكريم",
              short_name: "القرآن",
              description: "قراءة واستماع للقرآن الكريم",
              url: "/#/quran",
              icons: [{ src: "/logo-192.png", sizes: "192x192", type: "image/png" }]
            },
            {
              name: "أذكار الصباح والمساء",
              short_name: "الأذكار",
              description: "أذكار يومية وحصن المسلم",
              url: "/#/adhkar",
              icons: [{ src: "/logo-192.png", sizes: "192x192", type: "image/png" }]
            },
            {
              name: "المسبحة الإلكترونية",
              short_name: "المسبحة",
              description: "التسبيح والذكر والاستغفار",
              url: "/#/tasbih",
              icons: [{ src: "/logo-192.png", sizes: "192x192", type: "image/png" }]
            },
            {
              name: "مواقيت الصلاة",
              short_name: "المواقيت",
              description: "مواقيت الصلاة والأذان والقبلة",
              url: "/#/prayer-times",
              icons: [{ src: "/logo-192.png", sizes: "192x192", type: "image/png" }]
            }
          ],
        },
        workbox: {
          cacheId: 'athkar-mumin-v6',
          maximumFileSizeToCacheInBytes: 8000000,
          // Everything the app shell needs is precached at install time.
          // Workbox serves precached URLs from the cache without touching the
          // network, which is what makes a cold, offline launch instant.
          globPatterns: [
            '**/*.{js,css,html,ico,png,jpg,jpeg,svg,webp,woff,woff2,ttf,json,webmanifest}'
          ],
          // The OTA bundle is only ever fetched by the native updater with
          // `cache: 'no-store'`; precaching it would double the install size.
          globIgnores: ['**/ota/**', 'version.json'],
          navigateFallback: '/index.html',
          navigateFallbackDenylist: [/^\/api\//, /^\/version\.json$/, /^\/ota\//],
          cleanupOutdatedCaches: true,
          // A new worker waits instead of seizing control, so a page never ends
          // up running old chunks against a new precache manifest. autoUpdater
          // sends SKIP_WAITING at a safe moment.
          clientsClaim: false,
          skipWaiting: false,
          runtimeCaching: [
            {
              // The freshness probe itself must never be served from a cache,
              // or the app could never learn that a new build exists.
              urlPattern: /\/version\.json(?:\?.*)?$/i,
              handler: 'NetworkOnly'
            },
            {
              urlPattern: /\.(?:mp3|wav|m4a|aac)(?:\?.*)?$/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'audio-cache-v6',
                expiration: {
                  maxEntries: 120,
                  maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                },
                cacheableResponse: {
                  statuses: [0, 200]
                },
                rangeRequests: true
              }
            },
            {
              urlPattern: /^https:\/\/(?:cdn\.islamic\.network|everyayah\.com)\/.*(?:\.(?:mp3|wav|m4a))$/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'quran-audio-external-cache-v6',
                expiration: {
                  maxEntries: 150,
                  maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                },
                cacheableResponse: {
                  statuses: [0, 200]
                },
                rangeRequests: true
              }
            },
            {
              // Hashed build assets are immutable, so a cache hit is always
              // correct and no revalidation request is worth making.
              urlPattern: /\.(?:js|css)(?:\?.*)?$/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'static-code-cache-v6',
                expiration: {
                  maxEntries: 200,
                  maxAgeSeconds: 60 * 60 * 24 * 90 // 90 days
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              urlPattern: /\.(?:png|jpg|jpeg|svg|webp|gif|ico)(?:\?.*)?$/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'static-images-cache-v6',
                expiration: {
                  maxEntries: 300,
                  maxAgeSeconds: 60 * 60 * 24 * 180 // 180 days
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              urlPattern: /\.(?:woff|woff2|ttf|otf|eot)(?:\?.*)?$/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'static-fonts-cache-v6',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache-v6',
                expiration: {
                  maxEntries: 30,
                  maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              urlPattern: /^https:\/\/fonts\.cdnfonts\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'cdn-fonts-cache-v6',
                expiration: {
                  maxEntries: 15,
                  maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              urlPattern: /^https:\/\/(?:cdn\.jsdelivr\.net|cdn-icons-png\.flaticon\.com)\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'cdn-assets-cache-v6',
                expiration: {
                  maxEntries: 120,
                  maxAgeSeconds: 60 * 60 * 24 * 180 // 180 days
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              // Scripture text is stable, so serve the cached copy instantly
              // and refresh it behind the user's back.
              urlPattern: /^https:\/\/(api\.quran\.com|api\.alquran\.cloud)\/.*/i,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'quran-api-cache-v6',
                expiration: {
                  maxEntries: 200,
                  maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              // Prayer times depend on today's date and the user's position, so
              // prefer the network but fall back to cache quickly when offline.
              urlPattern: /^https:\/\/(api\.aladhan\.com|nominatim\.openstreetmap\.org|geocoding-api\.open-meteo\.com|freeipapi\.com|ipapi\.co|ipinfo\.io)\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'location-prayer-api-cache-v6',
                networkTimeoutSeconds: 4,
                expiration: {
                  maxEntries: 60,
                  maxAgeSeconds: 60 * 60 * 24 * 14 // 2 weeks
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            }
          ]
        }
      })
    ],
    resolve: {
      dedupe: ['react', 'react-dom'],
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      hmr: false,
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      emptyOutDir: true,
      sourcemap: false,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('city-timezones')) {
                return 'vendor-city-timezones';
              }
              if (id.includes('adhan') || id.includes('moment-hijri') || id.includes('moment')) {
                return 'vendor-prayer';
              }
              // recharts and its d3 dependencies are deliberately NOT pinned to a
              // named chunk. Every component that charts (UserDashboard,
              // AdhkarStats, FastingTracker, ...) is behind a lazy route, and
              // forcing them into one manual chunk made Rollup hoist that chunk
              // into the entry's static imports — 431 KB of charting parsed at
              // launch for a screen most users never open. Left alone, Rollup
              // keeps it in the async graph where it belongs.
              if (id.includes('firebase')) {
                return 'vendor-firebase';
              }
              if (id.includes('motion')) {
                return 'vendor-motion';
              }
              if (id.includes('lucide-react')) {
                return 'vendor-icons';
              }
              if (id.includes('i18next') || id.includes('react-i18next')) {
                return 'vendor-i18n';
              }
              if (id.includes('@dnd-kit')) {
                return 'vendor-dnd';
              }
              if (id.includes('canvas-confetti') || id.includes('html-to-image') || id.includes('jszip') || id.includes('downloadjs')) {
                return 'vendor-export-tools';
              }
              if (id.includes('@capacitor')) {
                return 'vendor-capacitor';
              }
              if (id.includes('react-router-dom') || id.includes('@remix-run')) {
                return 'vendor-router';
              }
              if (id.includes('react/') || id.includes('react-dom/') || id.includes('react-is') || id.includes('scheduler')) {
                return 'vendor-react';
              }
            }
            // Data modules are intentionally left to Rollup.
            //
            // The previous rules grouped them by filename, with a `data-misc`
            // catch-all. That made unrelated datasets share a chunk, so a single
            // eagerly-imported constant dragged the whole 487 KB group into the
            // launch path. Rollup groups modules by what actually reaches them,
            // which is the property that keeps boot small.
          }
        }
      }
    },
  };
});
