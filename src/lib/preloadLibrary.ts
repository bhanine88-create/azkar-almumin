/**
 * Utility to preload all Library and Audio Library route chunks in the background.
 * Prevents white screen flashes and loading delays when users enter library or audio sections.
 */
let isLibraryPreloaded = false;
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

export function preloadLibraryRoutes() {
  if (isLibraryPreloaded || typeof window === 'undefined') return;
  isLibraryPreloaded = true;

  // Idle preloading using requestIdleCallback or setTimeout
  const triggerPreload = () => {
    import('../components/IndependentHadith').catch(() => {});
    import('../components/HadithQudsi').catch(() => {});
    import('../components/Inspirations').catch(() => {});
    import('../components/ScholarSayings').catch(() => {});
    import('../components/BelieverInsights').catch(() => {});
    import('../components/Prophet').catch(() => {});
    import('../components/Istighfar').catch(() => {});
    import('../components/IslamicQuiz').catch(() => {});
    import('../components/IslamicStoriesList').catch(() => {});
    import('../components/IslamicStoryDetail').catch(() => {});
    import('../components/Tasbih').catch(() => {});
    import('../components/NamesOfAllah').catch(() => {});
    import('../components/SadaqahJariyah').catch(() => {});
    
    // Also preload audio routes
    preloadAudioLibraryRoutes();
  };

  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(triggerPreload, { timeout: 2000 });
  } else {
    setTimeout(triggerPreload, 200);
  }
}

