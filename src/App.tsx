import React, { useState, useEffect, Suspense, Profiler } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { AppProvider } from './AppContext';
import { GlobalAudioProvider } from './context/GlobalAudioContext';
import { DownloadProvider } from './context/DownloadContext';
import { Layout } from './components/Layout';
import Home from './components/Home';
import { QuranSettingsProvider } from './context/QuranSettingsContext';
const PrayerNotificationManager = lazyRetry(() => import('./components/PrayerNotificationManager'), 'PrayerNotificationManager');
import { AdhkarCountsProvider } from './context/AdhkarCountsContext';
import { Activity, Loader2 } from 'lucide-react';
import { lazyRetry } from './lib/lazyRetry';
import { SafeUnmount } from './components/SafeUnmount';
import { cn } from './lib/utils';
import { auth } from './firebase';
const IndependentHadith = lazyRetry(() => import('./components/IndependentHadith'), 'IndependentHadith');
const HadithAndSupplications = lazyRetry(() => import('./components/HadithAndSupplications'), 'HadithAndSupplications');
const Settings = lazyRetry(() => import('./components/Settings'), 'Settings');
const TermsOfUse = lazyRetry(() => import('./components/TermsOfUse'), 'TermsOfUse');
const AdhkarHub = lazyRetry(() => import('./components/AdhkarHub'), 'AdhkarHub');
const Quran = lazyRetry(() => import('./components/Quran'), 'Quran');
const Library = lazyRetry(() => import('./components/Library'), 'Library');
const Tasbih = lazyRetry(() => import('./components/Tasbih'), 'Tasbih');
const AudioLibraryHub = lazyRetry(() => import('./components/AudioLibraryHub'), 'AudioLibraryHub');
const QuranAudioHub = lazyRetry(() => import('./components/QuranAudioHub'), 'QuranAudioHub');
const QuranAudioReciter = lazyRetry(() => import('./components/QuranAudioReciter'), 'QuranAudioReciter');
const QuranAudioDownloadsHub = lazyRetry(() => import('./components/QuranAudioDownloadsHub'), 'QuranAudioDownloadsHub');
const FavoriteRecitersPage = lazyRetry(() => import('./components/FavoriteRecitersPage'), 'FavoriteRecitersPage');
const FavoriteScholarsPage = lazyRetry(() => import('./components/FavoriteScholarsPage'), 'FavoriteScholarsPage');
const LecturesAudioHub = lazyRetry(() => import('./components/LecturesAudioHub'), 'LecturesAudioHub');
const TafsirAudioHub = lazyRetry(() => import('./components/TafsirAudioHub'), 'TafsirAudioHub');
const RuqyahAudioHub = lazyRetry(() => import('./components/RuqyahAudioHub'), 'RuqyahAudioHub');
const AuthScreen = lazyRetry(() => import('./components/AuthScreen'), 'AuthScreen');
import { onAuthStateChanged, User } from 'firebase/auth';

const Adhkar = lazyRetry(() => import('./components/Adhkar'), 'Adhkar');
const DuasHub = lazyRetry(() => import('./components/DuasHub'), 'DuasHub');
const DuaList = lazyRetry(() => import('./components/DuaList'), 'DuaList');
const NamesOfAllah = lazyRetry(() => import('./components/NamesOfAllah'), 'NamesOfAllah');
const Prophet = lazyRetry(() => import('./components/Prophet'), 'Prophet');
const IslamicQuiz = lazyRetry(() => import('./components/IslamicQuiz'), 'IslamicQuiz');
const Istighfar = lazyRetry(() => import('./components/Istighfar'), 'Istighfar');
const HisnAlMuslim = lazyRetry(() => import('./components/HisnAlMuslim'), 'HisnAlMuslim');
const SurahDetail = lazyRetry(() => import('./components/SurahDetail'), 'SurahDetail');
const PrayerTimes = lazyRetry(() => import('./components/PrayerTimes'), 'PrayerTimes');
const Khatma = lazyRetry(() => import('./components/Khatma'), 'Khatma');
const Compass = lazyRetry(() => import('./components/Compass'), 'Compass');
const HijriCalendar = lazyRetry(() => import('./components/HijriCalendar'), 'HijriCalendar');
const BelieverInsights = lazyRetry(() => import('./components/BelieverInsights'), 'BelieverInsights');
const QuranTrackerScreen = lazyRetry(() => import('./components/QuranTrackerScreen'), 'QuranTrackerScreen');
const ScholarSayings = lazyRetry(() => import('./components/ScholarSayings'), 'ScholarSayings');
const ZakatCalculator = lazyRetry(() => import('./components/ZakatCalculator'), 'ZakatCalculator');
const HadithQudsi = lazyRetry(() => import('./components/HadithQudsi'), 'HadithQudsi');
const UserCard = lazyRetry(() => import('./components/UserCard'), 'UserCard');
const Inspirations = lazyRetry(() => import('./components/Inspirations'), 'Inspirations');
const IslamicStoriesList = lazyRetry(() => import('./components/IslamicStoriesList'), 'IslamicStoriesList');
const IslamicStoryDetail = lazyRetry(() => import('./components/IslamicStoryDetail'), 'IslamicStoryDetail');
const ChallengesHub = lazyRetry(() => import('./components/ChallengeSystem'), 'ChallengesHub');
const UserDashboard = lazyRetry(() => import('./components/UserDashboard'), 'UserDashboard');
const AdhkarStats = lazyRetry(() => import('./components/AdhkarStats'), 'AdhkarStats');
const AdhkarQuranVisualDashboard = lazyRetry(() => import('./components/AdhkarQuranVisualDashboard'), 'AdhkarQuranVisualDashboard');
const SpiritualGoals = lazyRetry(() => import('./components/SpiritualGoals'), 'SpiritualGoals');
const SpiritualAdvisor = lazyRetry(() => import('./components/SpiritualAdvisor').then(module => ({ default: module.SpiritualAdvisor })), 'SpiritualAdvisor');
const CalendarSync = lazyRetry(() => import('./components/CalendarSync'), 'CalendarSync');
const ContactUs = lazyRetry(() => import('./components/ContactUs'), 'ContactUs');
const SadaqahJariyah = lazyRetry(() => import('./components/SadaqahJariyah'), 'SadaqahJariyah');
const FastingTracker = lazyRetry(() => import('./components/FastingTracker'), 'FastingTracker');
const IslamicFontStudio = lazyRetry(() => import('./components/IslamicFontStudio').then(m => ({ default: m.IslamicFontStudio })), 'IslamicFontStudio');
const HeartFeelingsPage = lazyRetry(() => import('./components/HeartFeelingsPage'), 'HeartFeelingsPage');

import { PageSkeletonFallback } from './components/ui/PageSkeletonFallback';

const MemoizedLoadingFallback = React.memo(() => (
  <PageSkeletonFallback />
));

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('App Error:', error, errorInfo);
    const errorMsg = error?.message || String(error || "");
    if (
      errorMsg.includes("Failed to fetch dynamically imported module") ||
      errorMsg.includes("ChunkLoadError") ||
      errorMsg.toLowerCase().includes("dynamically imported module")
    ) {
      if (!sessionStorage.getItem('app_chunk_reload')) {
        sessionStorage.setItem('app_chunk_reload', 'true');
        console.warn("App: Dynamic chunk load failed. Triggering immediate auto-reload recovery...");
        
        // Attempt to unregister SW and clear caches before reload
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.getRegistrations().then((registrations) => {
            for (const registration of registrations) {
              registration.unregister();
            }
          });
        }
        
        window.location.reload();
      } else {
        sessionStorage.removeItem('app_chunk_reload');
      }
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100" dir="rtl">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center shadow-sm">
            <Activity size={32} />
          </div>
          <h2 className="text-xl font-bold">حدث غير متوقع</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm">
            حرصاً على استقرار التجربة، يمكنك العودة مباشرة أو إعادة تنشيط الصفحة.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <button 
              onClick={() => this.setState({ hasError: false })}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors shadow-sm"
            >
              إعادة المحاولة
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium rounded-xl transition-colors"
            >
              إعادة تحميل الصفحة
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const onRenderCallback: React.ProfilerOnRenderCallback = (
  id,
  phase,
  actualDuration,
  baseDuration,
  startTime,
  commitTime
) => {
  // Log renders that take longer than 16ms (indicates a dropped frame at 60fps)
  if (actualDuration > 16) {
    console.debug(
      `[Performance] Component: ${id} | Phase: ${phase} | Time: ${actualDuration.toFixed(2)}ms (Base: ${baseDuration.toFixed(2)}ms)`
    );
  }
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);

  // General App Performance Monitoring
  useEffect(() => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      // 1. Initial Page Load Metric
      window.addEventListener('load', () => {
        setTimeout(() => {
          const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          if (navEntry) {
             console.debug(`[Performance] Initial Page Load: ${(navEntry.loadEventEnd - navEntry.startTime).toFixed(2)}ms`);
          }
        }, 0);
      });

      // 2. Long Tasks Observer to detect UI thread blocking
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            console.debug(`[Performance] Long Task detected! Duration: ${entry.duration.toFixed(2)}ms`, entry);
          }
        });
        observer.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        // Fallback for browsers that don't support 'longtask'
      }
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser && currentUser.isAnonymous) {
        setUser(null);
      } else {
        setUser(currentUser);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  // Progressive Multi-Phase Background Preloading for Navigation Routes
  // Phase 0 (Immediate): Home & Layout are statically imported (bundled) and render instantly.
  // Phase 1 (Direct Navigation - 1.5s delay on Idle): Quran, AdhkarHub, Tasbih, PrayerTimes, DuasHub.
  // Phase 2 (Deeper Sub-pages - 4.5s delay on Idle): SurahDetail, Library, AudioLibraryHub, HadithAndSupplications, Settings.
  useEffect(() => {
    let phase1Timer: NodeJS.Timeout;
    let phase2Timer: NodeJS.Timeout;

    const runPreloadPhase1 = () => {
      const phase1Components = [Quran, AdhkarHub, Adhkar, Tasbih, PrayerTimes, DuasHub];
      phase1Components.forEach((cmp, index) => {
        setTimeout(() => {
          try {
            (cmp as any)?.preload?.();
          } catch (e) {
            // Silently swallow preload errors
          }
        }, index * 100);
      });
    };

    const runPreloadPhase2 = () => {
      const phase2Components = [
        SurahDetail,
        Library,
        AudioLibraryHub,
        HadithAndSupplications,
        Settings,
        NamesOfAllah,
        Prophet,
        Khatma
      ];
      phase2Components.forEach((cmp, index) => {
        setTimeout(() => {
          try {
            (cmp as any)?.preload?.();
          } catch (e) {
            // Silently swallow preload errors
          }
        }, index * 100);
      });
    };

    if (typeof window !== 'undefined') {
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(() => {
          phase1Timer = setTimeout(runPreloadPhase1, 1500);
          phase2Timer = setTimeout(runPreloadPhase2, 4500);
        }, { timeout: 3000 });
      } else {
        phase1Timer = setTimeout(runPreloadPhase1, 1200);
        phase2Timer = setTimeout(runPreloadPhase2, 4000);
      }
    }

    return () => {
      clearTimeout(phase1Timer);
      clearTimeout(phase2Timer);
    };
  }, []);

  const isWebVersion = (window as any).isWebVersion || false;

  return (
    <ErrorBoundary>
      <AppProvider>
        <QuranSettingsProvider>
          <AdhkarCountsProvider>
            <DownloadProvider>
              <HashRouter>
                <React.Suspense fallback={null}><PrayerNotificationManager /></React.Suspense>
                <GlobalAudioProvider>
                <div className={cn(
                  "w-full h-[100dvh] bg-slate-50 dark:bg-slate-950 flex flex-col md:items-center md:justify-center overflow-hidden relative"
                )}>
                  <div className="hidden md:block absolute inset-0 pointer-events-none z-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-950" />
                    <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] dark:opacity-[0.04]">
                      <img src="/logo-official-512.png" alt="Background Logo" className="w-[600px] h-[600px] object-contain drop-shadow-2xl grayscale dark:grayscale-0 opacity-50 dark:opacity-100" />
                    </div>
                  </div>
                  <div 
                    className={cn(
                      "w-full h-full mx-auto bg-white dark:bg-slate-900 relative overflow-hidden flex flex-col min-h-0 z-10",
                      "max-w-full md:max-w-4xl lg:max-w-5xl xl:max-w-6xl md:h-[98vh] md:max-h-[960px] md:rounded-3xl md:border md:border-slate-200/80 dark:md:border-slate-800/80 md:shadow-2xl",
                      isWebVersion && "md:max-w-none md:h-full md:max-h-none md:rounded-none md:border-0 md:shadow-none"
                    )}
                    style={{ transform: 'translateZ(0)' }}
                  >
                    
                    <Suspense fallback={<MemoizedLoadingFallback />}>
                      <Profiler id="AppRoutes" onRender={onRenderCallback}>
                        <Routes>
                          <Route path="/" element={<Layout />}>
                        <Route index element={<Home />} />
                          <Route path="adhkar" element={<AdhkarHub />} />
                          <Route path="adhkar-stats" element={<AdhkarStats />} />
                          <Route path="duas" element={<DuasHub />} />
                          <Route path="duas/:type" element={<DuaList />} />
                          <Route path="adhkar/:category" element={<SafeUnmount componentName="Adhkar"><Adhkar /></SafeUnmount>} />
                          <Route path="tasbih" element={<Tasbih />} />
                          <Route path="names" element={<NamesOfAllah />} />
                          <Route path="prophet" element={<Prophet />} />
                          <Route path="quiz" element={<IslamicQuiz />} />
                          <Route path="istighfar" element={<Istighfar />} />
                          <Route path="prophet/:subId" element={<Prophet />} />
                          <Route path="hisn-al-muslim" element={<HisnAlMuslim />} />
                          <Route path="prayer-times" element={<SafeUnmount componentName="PrayerTimes"><PrayerTimes /></SafeUnmount>} />
                          <Route path="khatma" element={<Khatma />} />
                          <Route path="compass" element={<Compass />} />
                          <Route path="hijri-calendar" element={<HijriCalendar />} />
                          <Route path="inspiration" element={<Inspirations />} />
                          <Route path="insights" element={<BelieverInsights />} />
                          <Route path="quran-tracker" element={<QuranTrackerScreen />} />
                          <Route path="quran" element={<Quran />} />
                          <Route path="quran/:number" element={<SafeUnmount componentName="SurahDetail"><SurahDetail /></SafeUnmount>} />
                          <Route path="audio-library" element={<SafeUnmount componentName="AudioLibraryHub"><AudioLibraryHub /></SafeUnmount>} />
                          <Route path="quran-audio" element={<SafeUnmount componentName="QuranAudioHub"><QuranAudioHub /></SafeUnmount>} />
                          <Route path="quran-audio/downloads" element={<QuranAudioDownloadsHub />} />
                          <Route path="quran-audio/favorites" element={<FavoriteRecitersPage />} />
                          <Route path="quran-audio/:reciterId" element={<SafeUnmount componentName="QuranAudioReciter"><QuranAudioReciter /></SafeUnmount>} />
                          <Route path="lectures-audio" element={<SafeUnmount componentName="LecturesAudioHub"><LecturesAudioHub /></SafeUnmount>} />
                          <Route path="lectures-audio/favorites" element={<FavoriteScholarsPage />} />
                          <Route path="tafsir-audio" element={<SafeUnmount componentName="TafsirAudioHub"><TafsirAudioHub /></SafeUnmount>} />
                          <Route path="ruqyah-audio" element={<SafeUnmount componentName="RuqyahAudioHub"><RuqyahAudioHub /></SafeUnmount>} />
                          <Route path="library" element={<Library />} />
                          <Route path="hadith-supplications" element={<Navigate to="/library" replace />} />
                          <Route path="hadith-qudsi" element={<HadithQudsi />} />
                          <Route path="user-card" element={<Navigate to="/library" replace />} />
                          <Route path="auth" element={<AuthScreen />} />
                          <Route path="challenges" element={<ChallengesHub />} />
                          <Route path="dashboard" element={<SafeUnmount componentName="UserDashboard"><UserDashboard /></SafeUnmount>} />
                          <Route path="adhkar-quran-dashboard" element={<AdhkarQuranVisualDashboard />} />
                          <Route path="devotion-dashboard" element={<AdhkarQuranVisualDashboard />} />
                          <Route path="visual-dashboard" element={<AdhkarQuranVisualDashboard />} />
                          <Route path="spiritual-goals" element={<SpiritualGoals />} />
                          <Route path="spiritual-advisor" element={<SpiritualAdvisor />} />
                          <Route path="calendar-sync" element={<CalendarSync />} />
                          <Route path="stories" element={<IslamicStoriesList />} />
                          <Route path="stories/:id" element={<IslamicStoryDetail />} />
                          <Route path="settings" element={<Settings />} />
                          <Route path="font-studio" element={<IslamicFontStudio standalonePage={true} />} />
                          <Route path="contact" element={<ContactUs />} />
                          <Route path="legal" element={<TermsOfUse />} />
                          <Route path="scholar-sayings" element={<ScholarSayings />} />
                          <Route path="zakat-calculator" element={<Navigate to="/library" replace />} />
                          <Route path="fasting-tracker" element={<FastingTracker />} />
                          <Route path="sunnah-hadith/:categoryId" element={<IndependentHadith />} />
                          <Route path="sunnah-hadith" element={<IndependentHadith />} />
                          <Route path="independent-hadith" element={<IndependentHadith />} />
                          <Route path="prophets-stories" element={<IslamicStoriesList />} />
                          <Route path="adhkar-hub" element={<AdhkarHub />} />
                          <Route path="worship-tracker" element={<AdhkarQuranVisualDashboard />} />
                          <Route path="qibla" element={<Compass />} />
                          <Route path="sadaqah-jariyah" element={<SadaqahJariyah />} />
                          <Route path="heart-feelings" element={<HeartFeelingsPage />} />
                          <Route path="*" element={<Home />} />
                        </Route>
                      </Routes>
                      </Profiler>
                    </Suspense>
                </div>
              </div>
              </GlobalAudioProvider>
            </HashRouter>
            </DownloadProvider>
          </AdhkarCountsProvider>
        </QuranSettingsProvider>
      </AppProvider>
    </ErrorBoundary>
  );
}
