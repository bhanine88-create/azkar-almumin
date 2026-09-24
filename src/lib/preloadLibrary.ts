/**
 * Utilities to preload a selected library route or the audio library's related screens.
 * Prevents white screen flashes and loading delays when users enter library or audio sections.
 */
let isAudioPreloaded = false;

export function preloadAudioLibraryRoutes() {
  if (isAudioPreloaded || typeof window === 'undefined') return;
  isAudioPreloaded = true;

  const triggerPreload = () => {
    import('../components/AudioLibraryHub').catch(() => {});
    import('../components/QuranAudioHub').catch(() => {});
    import('../components/QuranAudioReciter').catch(() => {});
    import('../components/QuranAudioDownloadsHub').catch(() => {});
    import('../components/LecturesAudioHub').catch(() => {});
    import('../components/TafsirAudioHub').catch(() => {});
    import('../components/RuqyahAudioHub').catch(() => {});
    import('../components/FavoriteRecitersPage').catch(() => {});
    import('../components/FavoriteScholarsPage').catch(() => {});
  };

  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(triggerPreload, { timeout: 2500 });
  } else {
    setTimeout(triggerPreload, 200);
  }
}

const libraryRouteLoaders: Record<string, () => Promise<unknown>> = {
  '/aqeedah': () => import('../components/AqeedahHub'),
  '/audio-library': () => import('../components/AudioLibraryHub'),
  '/names': () => import('../components/NamesOfAllah'),
  '/sunnah-hadith/daily': () => import('../components/IndependentHadith'),
  '/hadith-qudsi': () => import('../components/HadithQudsi'),
  '/inspiration': () => import('../components/Inspirations'),
  '/scholar-sayings': () => import('../components/ScholarSayings'),
  '/insights': () => import('../components/BelieverInsights'),
  '/sunnah-hadith/fadael': () => import('../components/IndependentHadith'),
  '/prophet': () => import('../components/Prophet'),
  '/istighfar': () => import('../components/Istighfar'),
  '/quiz': () => import('../components/IslamicQuiz'),
  '/stories': () => import('../components/IslamicStoriesList'),
  '/tasbih': () => import('../components/Tasbih'),
  '/fasting-tracker': () => import('../components/FastingTracker'),
  '/font-studio': () => import('../components/IslamicFontStudio'),
};

// Called on mouse hover/keyboard focus, never on touch-start: a vertical swipe
// over a card should not queue dozens of modules for parsing during the fling.
export function preloadLibraryRoute(route: string) {
  const loadRoute = libraryRouteLoaders[route];
  if (typeof window !== 'undefined' && loadRoute) void loadRoute().catch(() => {});
}

