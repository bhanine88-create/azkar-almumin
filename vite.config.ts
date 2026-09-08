import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    base: '/',
    plugins: [
      react(), 
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'inline',
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
          'images/islamic-art.png',
          'images/watermark_clean.jpg'
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
          screenshots: [
            {
              src: "/screenshot-mobile.png",
              sizes: "720x1280",
              type: "image/png",
              form_factor: "narrow",
              label: "شاشة الهاتف لتطبيق أذكار المؤمن"
            },
            {
              src: "/screenshot-desktop.png",
              sizes: "1280x720",
              type: "image/png",
              form_factor: "wide",
              label: "واجهة الحاسوب واللوحي لتطبيق أذكار المؤمن"
            }
          ]
        },
        workbox: {
          cacheId: 'athkar-mumin-v5',
          maximumFileSizeToCacheInBytes: 6000000,
          globPatterns: [
            '**/*.{js,css,html,ico,png,jpg,jpeg,svg,webp,woff,woff2,ttf,json,webmanifest}'
          ],
          navigateFallback: '/index.html',
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          skipWaiting: true,
          runtimeCaching: [
            {
              urlPattern: /\.(?:mp3|wav|m4a|aac)(?:\?.*)?$/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'audio-cache-v5',
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
                cacheName: 'quran-audio-external-cache-v5',
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
              urlPattern: /\.(?:png|jpg|jpeg|svg|webp|gif|ico)(?:\?.*)?$/i,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'static-images-cache-v5',
                expiration: {
                  maxEntries: 200,
                  maxAgeSeconds: 60 * 60 * 24 * 60 // 60 days
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
                cacheName: 'static-fonts-cache-v5',
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
              urlPattern: /\.(?:js|css)(?:\?.*)?$/i,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'static-code-cache-v5',
                expiration: {
                  maxEntries: 150,
                  maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache-v5',
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
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache-v5',
                expiration: {
                  maxEntries: 20,
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
                cacheName: 'cdn-fonts-cache-v5',
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
              urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/.*/i,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'jsdelivr-cache-v5',
                expiration: {
                  maxEntries: 120,
                  maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              urlPattern: /^https:\/\/www\.transparenttextures\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'texture-cache-v5',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              urlPattern: /^https:\/\/cdn-icons-png\.flaticon\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'flaticon-cache-v5',
                expiration: {
                  maxEntries: 20,
                  maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              urlPattern: /^https:\/\/(api\.quran\.com|api\.alquran\.cloud)\/.*/i,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'quran-api-cache-v5',
                expiration: {
                  maxEntries: 150,
                  maxAgeSeconds: 60 * 60 * 24 * 14 // 14 days
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              urlPattern: /^https:\/\/(api\.aladhan\.com|nominatim\.openstreetmap\.org|geocoding-api\.open-meteo\.com|freeipapi\.com|ipapi\.co|ipinfo\.io)\/.*/i,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'location-prayer-api-cache-v5',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24 * 7 // 1 week
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
              if (id.includes('recharts') || id.includes('d3-') || id.includes('victory-vendor')) {
                return 'vendor-charts';
              }
              if (id.includes('city-timezones') || id.includes('adhan') || id.includes('moment-hijri') || id.includes('moment')) {
                return 'vendor-prayer-geo';
              }
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
              if (id.includes('canvas-confetti') || id.includes('html-to-image') || id.includes('jszip') || id.includes('downloadjs')) {
                return 'vendor-export-tools';
              }
              if (id.includes('@capacitor')) {
                return 'vendor-capacitor';
              }
              if (id.includes('react-router-dom') || id.includes('@remix-run')) {
                return 'vendor-router';
              }
            }
          }
        }
      }
    },
  };
});
