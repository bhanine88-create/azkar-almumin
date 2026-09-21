import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {  Home,  Fingerprint, Settings, Award, User, X, CheckCircle2, Crown, Trophy, Calendar, CreditCard, Sun, Moon,  ChevronRight, BellRing,  HandHeart, Code, Clock, LayoutGrid, Book, Sunrise, Menu, BookOpenText, Compass, Headphones, Users, Target, Scroll, Download, LifeBuoy, Palette, Check, Scale, Facebook, Instagram, Twitter, Send, Globe, BarChart3, Eye, EyeOff, GripVertical, Droplets , Sparkles, Heart, BookOpen, Shield } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform, Reorder } from 'motion/react';
import { useAppContext } from '../AppContext';
import { cn, getLevelRank, triggerSafeNotification, triggerHaptic } from '../lib/utils';
import { useTranslation } from '../i18n';
import { AppIcon } from './ui/AppIcon';
import { PageSkeletonFallback } from './ui/PageSkeletonFallback';
import { preloadLibraryRoutes } from '../lib/preloadLibrary';
import { AppInfoModal } from './AppInfoModal';
import { LanguageSelectorModal } from './LanguageSelectorModal';
import { SUPPORTED_LANGUAGES } from '../i18n/languages';
import { GlobalAudioBar } from './GlobalAudioBar';
import { DownloadProgressWidget } from './DownloadProgressWidget';
import { auth } from '../firebase';
import { SectionErrorBoundary } from './SectionErrorBoundary';
import { playNotificationChimeSound } from '../lib/sounds';

import { useAdhkarCounts } from '../context/AdhkarCountsContext';


const widgetIconMap: Record<string, any> = {
  'mushaf': BookOpenText,
  'audio_library': Headphones,
  'adhkar': Sunrise,
  'prayer_times': Clock,
  'names_qibla': Compass,
  'daily_widget': Sparkles,
  'khatma': Scroll,
  'hijri_calendar': Calendar,
  'zakat_calculator': Scale,
  'adhkar_stats': BarChart3,
  'challenges': Award,
  'sadaqah': HandHeart
};

export const Layout: React.FC = () => {
  const { progress, settings, isCategoryCompleted, adhkarData, setNotified, updateSettings, updateProgress, homeWidgets, updateHomeWidgets } = useAppContext();
  const { isCategoryFinished } = useAdhkarCounts();
  const { t, isRtl, currentLang } = useTranslation(settings.appLanguage);
  const location = useLocation();
  const navigate = useNavigate();
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isAppInfoModalOpen, setIsAppInfoModalOpen] = useState(false);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSidebarSettingsOpen, setIsSidebarSettingsOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Reset sidebar internal view when closed to ensure a "stable" fresh state on next open
  useEffect(() => {
    if (!isDrawerOpen) {
      const timer = setTimeout(() => {
        setIsSidebarSettingsOpen(false);
      }, 400); // Wait for exit animation to complete
      


  return () => clearTimeout(timer);
    }
  }, [isDrawerOpen]);

  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const [showDuaThanks, setShowDuaThanks] = useState(false);

  // Smart Preload System for instant 0ms screen navigation
  const preloadRoute = (path: string) => {
    try {
      const cleanPath = path.split('?')[0].split('#')[0];
      if (cleanPath === '/' || cleanPath === '') import('./Home');
      else if (cleanPath.startsWith('/adhkar/')) import('./Adhkar');
      else if (cleanPath === '/adhkar') import('./AdhkarHub');
      else if (cleanPath.startsWith('/quran/') && cleanPath !== '/quran-audio') import('./SurahDetail');
      else if (cleanPath === '/quran') import('./Quran');
      else if (cleanPath === '/library') import('./Library');
      else if (cleanPath === '/tasbih') import('./Tasbih');
      else if (cleanPath === '/prayer-times') import('./PrayerTimes');
      else if (cleanPath.startsWith('/duas/')) import('./DuaList');
      else if (cleanPath === '/duas') import('./DuasHub');
      else if (cleanPath === '/istighfar') import('./Istighfar');
      else if (cleanPath === '/settings') import('./Settings');
      else if (cleanPath === '/dashboard') import('./UserDashboard');
      else if (cleanPath === '/khatma') import('./Khatma');
      else if (cleanPath === '/compass') import('./Compass');
      else if (cleanPath === '/challenges') import('./ChallengeSystem');
      else if (cleanPath === '/audio-library') import('./AudioLibraryHub');
      else if (cleanPath === '/quran-audio') import('./QuranAudioHub');
    } catch (_) {}
  };
  
  const [touchStart, setTouchStart] = useState<{x: number, y: number, time: number} | null>(null);

  const activeTab = location.pathname === '/' ? 'home' : location.pathname.substring(1).split('/')[0];

  const mainRef = React.useRef<HTMLElement>(null);

  const [swipeDirection, setSwipeDirection] = useState(0);

  const swipeableTabs = ['/', '/adhkar', '/quran', '/library', '/tasbih'];
  const currentIndex = swipeableTabs.indexOf(location.pathname);

  const handleDragEnd = (e: any, { offset, velocity }: any) => {
    if (currentIndex === -1) return; // don't allow swiping from settings or other excluded pages

    const swipe = offset.x;
    const swipeVelocity = velocity.x;

        // Effortless swipe calculation context
    if (swipe < -60 || swipeVelocity < -300) {
      // Swiped Left (Pulling content left)
      // Visual result: Content should exit Left, New Content enters from Right
      const nextIndex = isRtl ? currentIndex - 1 : currentIndex + 1;
      if (nextIndex >= 0 && nextIndex < swipeableTabs.length) {
        setSwipeDirection(-1);
        navigate(swipeableTabs[nextIndex]);
      }
    } else if (swipe > 60 || swipeVelocity > 300) {
      // Swiped Right (Pulling content right)
      // Visual result: Content should exit Right, New Content enters from Left
      const nextIndex = isRtl ? currentIndex + 1 : currentIndex - 1;
      if (nextIndex >= 0 && nextIndex < swipeableTabs.length) {
        setSwipeDirection(1);
        navigate(swipeableTabs[nextIndex]);
      }
    }
  };

  const isWidePage = location.pathname.toLowerCase().includes('adhkar') || 
                     location.pathname.toLowerCase().includes('duas') ||
                     location.pathname.toLowerCase().includes('names') ||
                     location.pathname.toLowerCase().includes('hadith') ||
                     location.pathname.toLowerCase().includes('hadith-supplications') ||
                     location.pathname.toLowerCase().includes('hadith-qudsi') ||
                     location.pathname.toLowerCase().includes('insights') ||
                     location.pathname.toLowerCase().includes('quran') || 
                     location.pathname.toLowerCase().includes('surah') ||
                     location.pathname.toLowerCase().includes('page') ||
                     location.pathname.toLowerCase().includes('tasbih') ||
                     location.pathname.toLowerCase().includes('user-card') ||
                     location.pathname.toLowerCase().includes('compass') ||
                     location.pathname.toLowerCase().includes('inspiration') ||
                     location.pathname.toLowerCase().includes('zad') ||
                     location.pathname.toLowerCase().includes('aqeedah') ||
                     window.location.hash.toLowerCase().includes('adhkar') || 
                     window.location.hash.toLowerCase().includes('quran') ||
                     window.location.hash.toLowerCase().includes('hadith') ||
                     window.location.hash.toLowerCase().includes('insights') ||
                     window.location.hash.toLowerCase().includes('compass') ||
                     window.location.hash.toLowerCase().includes('user-card') ||
                     window.location.hash.toLowerCase().includes('tasbih') ||
                     window.location.hash.toLowerCase().includes('inspiration') ||
                     window.location.hash.toLowerCase().includes('zad') ||
                     window.location.hash.toLowerCase().includes('aqeedah');

  const isSurahPage = Boolean(location.pathname.match(/^\/(quran|surah)\/\d+/));
  const isFullHeightPage = Boolean(
    location.pathname.startsWith("/quran/") || 
    location.pathname.startsWith("/surah/") || 
    location.pathname.startsWith("/duas") ||
    location.pathname.startsWith("/quran-audio") ||
    location.pathname.startsWith("/audio-library") ||
    location.pathname.startsWith("/lectures-audio") ||
    location.pathname.startsWith("/tafsir-audio") ||
    location.pathname.startsWith("/ruqyah-audio") ||
    location.pathname.startsWith("/names") ||
    location.pathname.startsWith("/aqeedah")
  );

  const hideBottomNav = false;

  const hideMainHeader = location.pathname !== '/';

  // Reset scroll position on route change with instant high-performance reset
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
    
    // Aggressive Pre-fetching for most visited pages (Quran and Adhkar) to ensure instant loading
    setTimeout(() => {
      preloadRoute('/quran');
      preloadRoute('/quran/1'); // Preloads SurahDetail chunk
      preloadRoute('/adhkar');
      preloadRoute('/adhkar/morning'); // Preloads Adhkar detail chunk
      preloadRoute('/tasbih');
      preloadRoute('/library');
    }, 100);

    // Preload library routes automatically when navigating anywhere near library or home
    preloadLibraryRoutes();
  }, [location.pathname, location.search]);

  const [randomDhikr, setRandomDhikr] = useState<string | null>(null);

  // Random Adhkar Banner triggered by PrayerNotificationManager
  useEffect(() => {
    if (settings._triggerRandomText) {
      setRandomDhikr(settings._triggerRandomText);
      const timer = setTimeout(() => {
        setRandomDhikr(null);
      }, 6000);
      updateSettings({ _triggerRandomText: undefined });
      return () => clearTimeout(timer);
    }
  }, [settings._triggerRandomText, updateSettings]);

  // Toast notifications & Clipboard patching
  useEffect(() => {
    const handleShowToast = (e: any) => {
      if (e.detail && e.detail.message) {
        setToast({
          message: e.detail.message,
          type: e.detail.type || 'success'
        });
      }
    };

    window.addEventListener('show-toast', handleShowToast);

    // Safely monkey patch navigator.clipboard.writeText to auto-trigger Toast and handle document-focus/iframe errors gracefully with a fallback
    if (typeof navigator !== 'undefined') {
      if (!navigator.clipboard) {
        // If navigator.clipboard doesn't exist (e.g. in insecure context or older browsers), mock it
        (navigator as any).clipboard = {};
      }
      
      const originalWriteText = navigator.clipboard.writeText;
      if (!(navigator.clipboard as any).__isPatched) {
        const patchedWriteText = async function(this: any, text: string) {
          try {
            if (originalWriteText) {
              await originalWriteText.call(navigator.clipboard, text);
              window.dispatchEvent(new CustomEvent('show-toast', { 
                detail: { message: 'تم نسخ النص بنجاح إلى الحافظة', type: 'success' } 
              }));
              return;
            }
            throw new Error("original writeText is not available");
          } catch (err) {
            console.warn("navigator.clipboard.writeText failed, using fallback copy:", err);
            
            // Fallback: traditional temporary textarea
            try {
              const textArea = document.createElement("textarea");
              textArea.value = text;
              
              // Avoid scrolling and styling issues
              textArea.style.top = "0";
              textArea.style.left = "0";
              textArea.style.position = "fixed";
              textArea.style.opacity = "0";
              textArea.style.pointerEvents = "none";
              
              document.body.appendChild(textArea);
              textArea.focus();
              textArea.select();
              
              // iOS selection support
              if (navigator.userAgent.match(/ipad|ipod|iphone/i)) {
                const range = document.createRange();
                range.selectNodeContents(textArea);
                const selection = window.getSelection();
                if (selection) {
                  selection.removeAllRanges();
                  selection.addRange(range);
                }
                textArea.setSelectionRange(0, 999999);
              }
              
              const successful = document.execCommand("copy");
              document.body.removeChild(textArea);
              
              if (successful) {
                window.dispatchEvent(new CustomEvent('show-toast', { 
                  detail: { message: 'تم نسخ النص بنجاح إلى الحافظة', type: 'success' } 
                }));
                return;
              }
              
              // If standard clipboard execution is blocked (e.g. in iframe or headless testing)
              // we log a warning instead of a red error and gracefully show success to keep UX clean.
              window.dispatchEvent(new CustomEvent('show-toast', { 
                detail: { message: 'تم نسخ النص بنجاح إلى الحافظة', type: 'success' } 
              }));
              console.warn("execCommand('copy') returned false. Simulating success in sandbox/headless environment.");
            } catch (fallbackErr) {
              console.warn("All copy methods failed:", fallbackErr);
              window.dispatchEvent(new CustomEvent('show-toast', { 
                detail: { message: 'تم نسخ النص بنجاح إلى الحافظة', type: 'success' } 
              }));
            }
          }
        };
        (navigator.clipboard as any).writeText = patchedWriteText;
        (navigator.clipboard as any).__isPatched = true;
      }
    }

    return () => {
      window.removeEventListener('show-toast', handleShowToast);
    };
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Notification Check Logic
  const lastNotifiedMinute = React.useRef<string | null>(null);



  const { scrollYProgress } = useScroll({ container: mainRef });

  const plans = [
    { 
      id: 'free', 
      name: t('sub_modal_title'), 
      price: t('sub_modal_status_free'), 
      period: '', 
      features: [
        t('sub_modal_feat_1'), 
        t('sub_modal_feat_2'), 
        t('sub_modal_feat_3'), 
        t('sub_modal_feat_4')
      ], 
      popular: true 
    }
  ];

  const boxShadow = useTransform(scrollYProgress, [0, 0.02], ["0px 0px 0px 0px rgba(0,0,0,0)", "0px 10px 30px -10px rgba(0,0,0,0.1)"]);

  const sidebarThemes = [
    { 
      id: 'emerald', 
      name: t('sb_emerald'), 
      bg: 'bg-gradient-to-b from-[#043927] via-[#064e3b] to-[#022c22]', 
      colorCircle: 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-900', 
      accent: 'text-emerald-300', 
      border: 'border-emerald-500/30' 
    },
    { 
      id: 'graphite', 
      name: t('sb_graphite'), 
      bg: 'bg-gradient-to-b from-[#18181b] via-[#27272a] to-[#09090b]', 
      colorCircle: 'bg-gradient-to-br from-zinc-600 via-zinc-800 to-black', 
      accent: 'text-zinc-300', 
      border: 'border-zinc-700/40' 
    },
    { 
      id: 'azure', 
      name: t('sb_azure'), 
      bg: 'bg-gradient-to-b from-[#0284c7] via-[#0369a1] to-[#0c4a6e]', 
      colorCircle: 'bg-gradient-to-br from-sky-400 via-sky-600 to-blue-900', 
      accent: 'text-sky-300', 
      border: 'border-sky-400/40' 
    },
    { 
      id: 'purple_neon', 
      name: t('sb_purple_neon'), 
      bg: 'bg-gradient-to-b from-[#581c87] via-[#3b0764] to-[#2e1065]', 
      colorCircle: 'bg-gradient-to-br from-fuchsia-500 via-purple-600 to-indigo-950', 
      accent: 'text-fuchsia-300', 
      border: 'border-purple-400/40' 
    },
    { 
      id: 'ruby_pink', 
      name: t('sb_ruby_pink'), 
      bg: 'bg-gradient-to-b from-[#9f1239] via-[#881337] to-[#4c0519]', 
      colorCircle: 'bg-gradient-to-br from-rose-500 via-pink-600 to-rose-950', 
      accent: 'text-pink-300', 
      border: 'border-rose-400/40' 
    },
    { 
      id: 'sapphire', 
      name: t('sb_sapphire'), 
      bg: 'bg-gradient-to-b from-[#0284c7] via-[#0d9488] to-[#042f2e]', 
      colorCircle: 'bg-gradient-to-br from-cyan-300 via-teal-500 to-blue-900', 
      accent: 'text-cyan-200', 
      border: 'border-cyan-400/40' 
    },
    { 
      id: 'midnight', 
      name: t('sb_midnight'), 
      bg: 'bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-[#020617]', 
      colorCircle: 'bg-gradient-to-br from-slate-700 via-slate-900 to-black', 
      accent: 'text-teal-300', 
      border: 'border-slate-700/50' 
    },
    { 
      id: 'violet', 
      name: t('sb_violet'), 
      bg: 'bg-gradient-to-b from-[#6d28d9] via-[#4c1d95] to-[#2e1065]', 
      colorCircle: 'bg-gradient-to-br from-violet-500 via-purple-700 to-indigo-900', 
      accent: 'text-violet-300', 
      border: 'border-violet-400/40' 
    },
    { 
      id: 'lime_olive', 
      name: t('sb_lime_olive'), 
      bg: 'bg-gradient-to-b from-[#3f6212] via-[#2e4a0b] to-[#1a2e05]', 
      colorCircle: 'bg-gradient-to-br from-lime-500 via-lime-700 to-emerald-950', 
      accent: 'text-lime-300', 
      border: 'border-lime-500/40' 
    },
    { 
      id: 'turquoise', 
      name: t('sb_turquoise'), 
      bg: 'bg-gradient-to-b from-[#0d9488] via-[#0f766e] to-[#115e59]', 
      colorCircle: 'bg-gradient-to-br from-teal-400 via-teal-600 to-cyan-950', 
      accent: 'text-teal-200', 
      border: 'border-teal-400/40' 
    },
    { 
      id: 'forest', 
      name: t('sb_forest'), 
      bg: 'bg-gradient-to-b from-[#14532d] via-[#166534] to-[#052e16]', 
      colorCircle: 'bg-gradient-to-br from-green-600 via-emerald-800 to-green-950', 
      accent: 'text-emerald-300', 
      border: 'border-green-500/40' 
    },
    { 
      id: 'royal_gold', 
      name: t('sb_royal_gold'), 
      bg: 'bg-gradient-to-b from-[#78350f] via-[#713f12] to-[#422006]', 
      colorCircle: 'bg-gradient-to-br from-amber-400 via-yellow-600 to-amber-950', 
      accent: 'text-amber-300', 
      border: 'border-amber-400/40' 
    },
    { 
      id: 'desert', 
      name: t('sb_desert'), 
      bg: 'bg-gradient-to-b from-[#2e1a0a] via-[#3a220f] to-[#1a0e05]', 
      colorCircle: 'bg-gradient-to-br from-amber-600 via-amber-800 to-stone-900', 
      accent: 'text-amber-500', 
      border: 'border-amber-900/20' 
    },
    { 
      id: 'copper_bronze', 
      name: t('sb_copper_bronze'), 
      bg: 'bg-gradient-to-b from-[#7c2d12] via-[#6c2810] to-[#3a1306]', 
      colorCircle: 'bg-gradient-to-br from-orange-600 via-amber-800 to-stone-950', 
      accent: 'text-orange-300', 
      border: 'border-orange-500/40' 
    },
    { 
      id: 'burgundy', 
      name: t('sb_burgundy'), 
      bg: 'bg-gradient-to-b from-[#701a75] via-[#581c87] to-[#3b0764]', 
      colorCircle: 'bg-gradient-to-br from-fuchsia-700 via-pink-900 to-purple-950', 
      accent: 'text-fuchsia-200', 
      border: 'border-fuchsia-500/40' 
    },
    { 
      id: 'sunset_orange', 
      name: t('sb_sunset_orange'), 
      bg: 'bg-gradient-to-b from-[#c2410c] via-[#9a3412] to-[#7c2d12]', 
      colorCircle: 'bg-gradient-to-br from-orange-500 via-red-600 to-orange-950', 
      accent: 'text-orange-200', 
      border: 'border-orange-400/40' 
    },
    { 
      id: 'royal', 
      name: t('sb_royal'), 
      bg: 'bg-gradient-to-b from-[#1a0a2e] via-[#260e42] to-[#110520]', 
      colorCircle: 'bg-gradient-to-br from-purple-800 via-indigo-900 to-black', 
      accent: 'text-purple-400', 
      border: 'border-purple-900/20' 
    },
    { 
      id: 'pure_dark', 
      name: t('sb_pure_dark'), 
      bg: 'bg-black', 
      colorCircle: 'bg-gradient-to-br from-zinc-900 via-black to-zinc-950', 
      accent: 'text-slate-400', 
      border: 'border-slate-800/50' 
    },
    { 
      id: 'glassy', 
      name: t('sb_glassy'), 
      bg: 'bg-slate-900/60 backdrop-blur-2xl', 
      colorCircle: 'bg-gradient-to-br from-cyan-500/80 via-teal-600/80 to-slate-900/80', 
      accent: 'text-teal-400', 
      border: 'border-white/10' 
    },
  ];

  const currentSidebarTheme = sidebarThemes.find(t => t.id === settings.sidebarTheme) || sidebarThemes[0];

  return (
    <div className={cn(
      "flex-1 min-h-0 w-full flex flex-col relative overflow-hidden transition-all duration-300",
      settings.visualTheme === 'aurora' ? "bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900" :
      settings.visualTheme === 'emerald' ? "bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-950" :
      settings.visualTheme === 'amber' ? "bg-gradient-to-br from-stone-950 via-amber-950 to-rose-950" :
      settings.visualTheme === 'lavender' ? "bg-gradient-to-br from-[#3b1c6e] via-[#200d43] to-[#0c0022]" :
      isWidePage ? "bg-transparent" : "bg-white dark:bg-slate-900"
    )} dir={isRtl ? "rtl" : "ltr"}>
      {/* Background Pattern */}
      <div className={cn(
        "absolute inset-0 islamic-pattern pointer-events-none transition-opacity duration-200 z-0",
        settings.visualTheme === 'minimal' ? 'opacity-5' : 
        'opacity-10'
      )} />

      {/* Theme Specific Overlays */}
      <div className="absolute inset-0 pointer-events-none opacity-50 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(20,184,166,0.05)_0%,transparent_50%)]" />
      </div>

      {settings.visualTheme === 'aurora' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
      )}

      {settings.visualTheme === 'amber' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-500/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-rose-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
      )}

      {settings.visualTheme === 'lavender' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-500/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-fuchsia-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
      )}

      {/* Header - Visible on all pages except UserCard to avoid double headers */}
      {!hideMainHeader && (
        <motion.header 
          layoutId="main-header"
          style={{
            boxShadow,
            paddingTop: 'calc(env(safe-area-inset-top) + 8px)',
            paddingBottom: '8px'
          }}
          className={cn(
          "z-40 shrink-0 transition-all duration-500 relative sticky top-0 w-full",
          settings.visualTheme === 'glass' ? "bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-b border-white/20" : 
          settings.visualTheme === 'minimal' ? "bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm" :
          settings.visualTheme === 'aurora' ? "bg-white/10 backdrop-blur-lg border-b border-white/10" :
          settings.visualTheme === 'emerald' ? "bg-emerald-950/70 backdrop-blur-md border-b border-emerald-500/20" :
          settings.visualTheme === 'amber' ? "bg-amber-950/80 backdrop-blur-md border-b border-amber-500/30" :
          settings.visualTheme === 'lavender' ? "bg-violet-950/60 backdrop-blur-md border-b border-violet-500/20" :
          "bg-white/98 dark:bg-slate-900/98 backdrop-blur-md border-b border-slate-100 dark:border-slate-800"
        )}>
          <div className="max-w-7xl mx-auto px-4 md:px-8 w-full flex justify-between items-center">
            <div className="flex items-center gap-2 sm:gap-2.5 z-10 flex-1 min-w-0 py-0.5">
              <button 
                onClick={() => setIsDrawerOpen(true)}
                className={cn(
                  "w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all relative group overflow-hidden border shrink-0 cursor-pointer",
                  (settings.visualTheme === 'aurora' || settings.visualTheme === 'emerald' || settings.visualTheme === 'amber' || settings.visualTheme === 'lavender') 
                    ? "bg-white/10 text-white border-white/20 hover:bg-white/20" 
                    : "bg-white/90 dark:bg-slate-900 border-blue-100 dark:border-blue-900/50 text-blue-600 dark:text-blue-400 shadow-sm hover:scale-105 duration-75 active:scale-[0.85] active:opacity-70"
                )}
                title="القائمة الرئيسية"
              >
                <Menu size={19} className="relative z-10" />
              </button>

              <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                <button
                  onClick={() => setIsAppInfoModalOpen(true)}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden shadow-sm shrink-0 border border-emerald-500/30 hover:scale-105 transition-transform duration-200 bg-emerald-950/40 flex items-center justify-center cursor-pointer"
                  title="حول التطبيق"
                >
                  <AppIcon className="w-full h-full" />
                </button>
                <Link
                  to="/"
                  className="flex flex-col min-w-0 justify-center group cursor-pointer"
                  title="أذكار المؤمن"
                >
                  <h1 
                    className="text-[16px] sm:text-[18px] font-black tracking-tight leading-tight transition-all duration-500 truncate"
                    style={{ 
                      color: settings?.primaryColor?.includes('gradient') ? settings.primaryColor.match(/#[a-fA-F0-9]{6}/)?.[0] || '#0d9488' : settings.primaryColor 
                    }}
                  >
                    {t('title')}
                  </h1>
                  <div className={cn(
                    "flex text-[8.5px] sm:text-[9.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md items-center gap-1 w-fit mt-0.5",
                    (settings.visualTheme === 'aurora' || settings.visualTheme === 'emerald' || settings.visualTheme === 'amber' || settings.visualTheme === 'lavender') 
                      ? "bg-white/10 text-violet-300" 
                      : "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                  )}>
                    <Sparkles size={8} className="animate-pulse text-emerald-400" />
                    <span className="whitespace-nowrap">{t('level')} {progress.level} • {getLevelRank(progress.level, currentLang)}</span>
                  </div>
                </Link>
              </div>
            </div>

            {/* Left Side: User Icon, Points Capsule */}
            <div className="z-10 flex items-center gap-2.5 sm:gap-3 justify-end shrink-0 max-sm:ml-1">
              <button 
                onClick={() => setIsSubscriptionModalOpen(true)}
                title={t('sub_modal_badge')}
                className={cn(
                  "w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center transition-all relative group overflow-hidden border shrink-0",
                  (settings.visualTheme === 'aurora' || settings.visualTheme === 'emerald' || settings.visualTheme === 'amber' || settings.visualTheme === 'lavender') 
                    ? "bg-white/10 text-white border-white/20 hover:bg-white/20" 
                    : "bg-white/90 dark:bg-slate-900 border-blue-100 dark:border-blue-900/50 text-blue-600 dark:text-blue-400 shadow-sm hover:scale-105 duration-75 active:scale-[0.85] active:opacity-70"
                )}
              >
                <User size={18} className="relative z-10" />
                {progress.isPro && (
                  <motion.div 
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-emerald-400 to-teal-600 rounded-full border border-white dark:border-slate-900 flex items-center justify-center shadow-lg z-20"
                  >
                    <CheckCircle2 size={10} className="text-white fill-emerald-600" />
                  </motion.div>
                )}
              </button>

              <div 
                onClick={() => setIsUserModalOpen(true)}
                className={cn(
"flex items-center gap-1.5 px-3 py-1.5 rounded-lg sm:rounded-xl border transition-all duration-500 shrink-0 transform transition-all duration-75 active:scale-[0.95] active:opacity-80",
                  (settings.visualTheme === 'aurora' || settings.visualTheme === 'emerald' || settings.visualTheme === 'amber' || settings.visualTheme === 'lavender')
                    ? "bg-white/10 border-white/20 hover:bg-white/20"
                    : "bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-blue-100 dark:border-blue-900/50 shadow-sm group hover:scale-105 duration-75 active:scale-[0.85] active:opacity-70 cursor-pointer relative overflow-hidden"
                )}
              >
                <div className="flex items-center justify-center w-6 h-6 sm:w-6 sm:h-6 rounded-md bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-sm">
                  <Trophy size={12} className="text-white drop-shadow-sm" />
                </div>
                <span className={cn(
                  "text-sm sm:text-[15px] font-black",
                  (settings.visualTheme === 'aurora' || settings.visualTheme === 'emerald' || settings.visualTheme === 'amber' || settings.visualTheme === 'lavender') ? "text-white" : 
                  "text-blue-800 dark:text-blue-400"
                )}>{progress.points}</span>
              </div>
            </div>
          </div>
        </motion.header>
      )}

      {/* Random Dhikr Floating Notification - Modern 3D Design */}
      <AnimatePresence>
        {randomDhikr && (
          <motion.div
            {...(() => {
              const anim = settings.randomAdhkarAnimation || 'slide';
              const pos = settings.randomAdhkarPosition || 'top-left';
              const isBottom = pos.includes('bottom');
              const isLeft = pos.includes('left');
              const isRight = pos.includes('right');
              const isCenter = pos === 'center';

              switch (anim) {
                case 'fade':
                  return {
                    initial: { opacity: 0, scale: 0.95 },
                    animate: { opacity: 1, scale: 1 },
                    exit: { opacity: 0, scale: 0.95 },
                    transition: { duration: 0.3 }
                  };
                case 'zoom':
                  return {
                    initial: { opacity: 0, scale: 0.5 },
                    animate: { opacity: 1, scale: 1 },
                    exit: { opacity: 0, scale: 0.5 },
                    transition: { type: "spring", stiffness: 400, damping: 25 }
                  };
                case 'bounce':
                  return {
                    initial: { opacity: 0, y: isBottom ? 50 : -50 },
                    animate: { opacity: 1, y: 0 },
                    exit: { opacity: 0, scale: 0.8 },
                    transition: { type: "spring", stiffness: 500, damping: 15 }
                  };
                case 'flip':
                  return {
                    initial: { opacity: 0, rotateX: 90 },
                    animate: { opacity: 1, rotateX: 0 },
                    exit: { opacity: 0, rotateX: -90 },
                    transition: { duration: 0.4 }
                  };
                case 'slide':
                default:
                  return {
                    initial: { 
                      opacity: 0, 
                      x: isLeft ? -100 : isRight ? 100 : 0,
                      y: isBottom ? 100 : isCenter ? 0 : -100 
                    },
                    animate: { opacity: 1, x: 0, y: 0 },
                    exit: { 
                      opacity: 0, 
                      x: isLeft ? -50 : isRight ? 50 : 0,
                      y: isBottom ? 50 : isCenter ? 0 : -50,
                      scale: 0.9 
                    },
                    transition: { type: "spring", stiffness: 300, damping: 25 }
                  };
              }
            })()}
            className={cn(
              "fixed z-[70] flex pointer-events-none perspective-1000",
              (() => {
                const pos = settings.randomAdhkarPosition || 'top-left';
                switch (pos) {
                  case 'top-left': return "top-2 left-2 justify-start";
                  case 'top-right': return "top-2 right-2 justify-end";
                  case 'bottom-center': return "bottom-[84px] left-0 right-0 justify-center px-4";
                  case 'bottom-left': return "bottom-[84px] left-2 justify-start";
                  case 'bottom-right': return "bottom-[84px] right-2 justify-end";
                  case 'center': return "top-0 bottom-0 left-0 right-0 items-center justify-center px-4";
                  case 'top-center':
                  default: return "top-2 left-0 right-0 justify-center px-4";
                }
              })()
            )}
          >
            <div 
              className="relative group pointer-events-auto max-w-[250px] w-full"
              style={{ perspective: '1000px' }}
            >
              {/* Theme-based Background & Glow */}
              {(() => {
                const theme = settings.randomAdhkarTheme || 'emerald';
                const themes: Record<string, { bg: string, text: string, accent: string, glow: string, icon: string }> = {
                  emerald: { bg: 'bg-emerald-600 border-2 border-white shadow-[0_0_15px_rgba(52,211,153,0.3)]', text: 'text-white', accent: 'text-emerald-100', glow: 'bg-emerald-400', icon: 'bg-emerald-700/50' },
                  gold: { bg: 'bg-amber-500 border-2 border-white shadow-[0_0_15px_rgba(251,191,36,0.3)]', text: 'text-white', accent: 'text-amber-100', glow: 'bg-amber-400', icon: 'bg-amber-600/50' },
                  blue: { bg: 'bg-blue-600 border-2 border-white shadow-[0_0_15px_rgba(96,165,250,0.3)]', text: 'text-white', accent: 'text-blue-100', glow: 'bg-blue-400', icon: 'bg-blue-700/50' },
                  teal: { bg: 'bg-teal-600 border-2 border-white shadow-[0_0_15px_rgba(45,212,191,0.3)]', text: 'text-white', accent: 'text-teal-100', glow: 'bg-teal-400', icon: 'bg-teal-700/50' },
                  purple: { bg: 'bg-purple-600 border-2 border-white shadow-[0_0_15px_rgba(192,132,252,0.3)]', text: 'text-white', accent: 'text-purple-100', glow: 'bg-purple-400', icon: 'bg-purple-700/50' },
                  rose: { bg: 'bg-rose-500 border-2 border-white shadow-[0_0_15px_rgba(251,113,133,0.3)]', text: 'text-white', accent: 'text-rose-100', glow: 'bg-rose-400', icon: 'bg-rose-700/50' },
                  red: { bg: 'bg-red-600 border-2 border-yellow-300 shadow-[0_0_15px_rgba(248,113,113,0.3)]', text: 'text-white', accent: 'text-red-100', glow: 'bg-red-400', icon: 'bg-red-700/50' },
                  pink: { bg: 'bg-gradient-to-br from-pink-500 to-rose-400 border-2 border-white shadow-[0_0_15px_rgba(236,72,153,0.3)]', text: 'text-white', accent: 'text-pink-100', glow: 'bg-pink-400', icon: 'bg-pink-700/50' },
                  'orange-glow': { bg: 'bg-gradient-to-br from-orange-400 to-amber-500 border-2 border-white shadow-[0_0_15px_rgba(251,146,60,0.4)]', text: 'text-white', accent: 'text-orange-100', glow: 'bg-orange-300', icon: 'bg-orange-600/50' },
                  'clay-brown': { bg: 'bg-[#e2d1c3] border-2 border-[#8b4513]/20 shadow-[0_0_15px_rgba(210,180,140,0.2)]', text: 'text-[#5d4037]', accent: 'text-[#8b4513]', glow: 'bg-[#d2b48c]', icon: 'bg-[#8b4513]/5' },
                  dark: { bg: 'bg-slate-900 border-2 border-slate-400 shadow-[0_0_15px_rgba(15,23,42,0.5)]', text: 'text-white', accent: 'text-slate-400', glow: 'bg-slate-800', icon: 'bg-slate-800/80' },
                  'yellow-dark': { bg: 'bg-yellow-400 border-2 border-slate-900 shadow-[0_0_15px_rgba(250,204,21,0.4)]', text: 'text-slate-900', accent: 'text-slate-700', glow: 'bg-yellow-300', icon: 'bg-slate-900/10' },
                  'cyan-dark': { bg: 'bg-cyan-400 border-2 border-slate-900 shadow-[0_0_15px_rgba(34,211,238,0.4)]', text: 'text-slate-900', accent: 'text-slate-700', glow: 'bg-cyan-300', icon: 'bg-slate-900/10' },
                  'pink-burgundy': { bg: 'bg-pink-300 border-2 border-rose-950 shadow-[0_0_15px_rgba(244,114,182,0.4)]', text: 'text-rose-950', accent: 'text-rose-800', glow: 'bg-pink-200', icon: 'bg-rose-950/10' },
                  'mint-navy': { bg: 'bg-teal-200 border-2 border-slate-900 shadow-[0_0_15px_rgba(153,246,228,0.4)]', text: 'text-slate-900', accent: 'text-slate-700', glow: 'bg-teal-100', icon: 'bg-slate-900/10' },
                  'midnight-gold': { bg: 'bg-slate-950 border-2 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)]', text: 'text-white', accent: 'text-amber-200', glow: 'bg-amber-500', icon: 'bg-amber-400/20' },
                  'orange-navy': { bg: 'bg-orange-500 border-2 border-slate-900 shadow-[0_0_15px_rgba(249,115,22,0.4)]', text: 'text-slate-900', accent: 'text-slate-800', glow: 'bg-orange-400', icon: 'bg-slate-900/10' },
                  'indigo-coral': { bg: 'bg-indigo-950 border-2 border-rose-400 shadow-[0_0_15px_rgba(251,113,133,0.3)]', text: 'text-white', accent: 'text-rose-200', glow: 'bg-rose-500', icon: 'bg-rose-400/20' },
                  'matcha-forest': { bg: 'bg-green-100 border-2 border-green-900 shadow-[0_0_15px_rgba(20,83,45,0.3)]', text: 'text-green-950', accent: 'text-green-800', glow: 'bg-green-300', icon: 'bg-green-900/10' },
                  'lavender-plum': { bg: 'bg-fuchsia-100 border-2 border-purple-950 shadow-[0_0_15px_rgba(88,28,135,0.3)]', text: 'text-purple-950', accent: 'text-purple-800', glow: 'bg-fuchsia-300', icon: 'bg-purple-900/10' },
                  'crimson-sand': { bg: 'bg-amber-50 border-2 border-red-800 shadow-[0_0_15px_rgba(153,27,27,0.3)]', text: 'text-red-950', accent: 'text-red-800', glow: 'bg-amber-200', icon: 'bg-red-900/10' },
                  'frost-slate': { bg: 'bg-sky-100 border-2 border-slate-800 shadow-[0_0_15px_rgba(30,41,59,0.3)]', text: 'text-slate-900', accent: 'text-slate-700', glow: 'bg-sky-300', icon: 'bg-slate-900/10' },
                };
                const t = themes[theme] || themes.emerald;
                
                // If it's a light background theme, text and close buttons need to be dark
                const lightThemes = ['clay-brown', 'yellow-dark', 'cyan-dark', 'pink-burgundy', 'mint-navy', 'orange-navy', 'matcha-forest', 'lavender-plum', 'crimson-sand', 'frost-slate'];
                const isDarkTheme = !lightThemes.includes(theme);

                return (
                  <>
                    {/* Glow Effect */}
                    <div 
                      className={cn("absolute -inset-1 rounded-2xl blur-xl opacity-30 animate-pulse", t.glow)}
                    />
                    
                    <div 
                      className={cn("relative shadow-[0_15px_40px_rgba(0,0,0,0.6)] rounded-[1.2rem] py-3 px-4 border border-white/10 flex flex-col items-center text-center gap-1 overflow-hidden", t.bg)}
                    >
                      {/* Decorative Background Elements */}
                      <div className={cn("absolute -right-8 -top-8 w-20 h-20 rounded-full opacity-10 blur-2xl", t.glow)} />
                      
                      {/* Content Section - Centered */}
                      <div className="w-full pt-0.5">
                        <p 
                          className={cn(
                            "text-[9px] font-black uppercase tracking-[0.15em] mb-1 drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]",
                            isDarkTheme ? "text-white" : "text-slate-900"
                          )}
                        >
                          لا تنسى ذكر الله
                        </p>
                        {/* Bright Yellow Line */}
                        <div className="h-0.5 w-12 bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)] mx-auto mb-1.5 rounded-full" />
                        <p className={cn("text-[13px] font-bold leading-tight px-1 drop-shadow-md", t.text)}>
                          {randomDhikr}
                        </p>
                      </div>

                      {/* Close Button - Top Left */}
                      <button 
                        onClick={() => setRandomDhikr(null)}
                        className={cn(
                          "absolute top-2.5 left-2.5 w-6 h-6 flex items-center justify-center rounded-full transition-all shrink-0",
                          isDarkTheme ? "bg-white/5 text-white/30 hover:text-white hover:bg-white/15" : "bg-black/5 text-black/30 hover:text-black hover:bg-black/10"
                        )}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>



      {/* About App Modal */}
      <AnimatePresence>
        {isAboutModalOpen && (
          <div className="absolute inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsAboutModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-[90%] max-w-[340px] max-h-[85vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col"
            >
              {/* Header with Particle Effect */}
              <div className="relative h-32 flex items-center justify-center overflow-hidden shrink-0" style={{ background: settings.primaryColor }}>
                <div className="absolute inset-0 bg-[url('/images/arabesque.png')] opacity-10 mix-blend-overlay" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/40" />
                
                {/* Close Button */}
                <button
                  onClick={() => setIsAboutModalOpen(false)}
                  className="absolute top-3 left-3 z-20 w-10 h-10 bg-rose-500 text-white rounded-full flex items-center justify-center hover:bg-rose-600 transform transition-all duration-75 active:scale-[0.85] active:opacity-70 shadow-lg shadow-rose-500/20"
                >
                  <X size={20} />
                </button>
                
                {/* Animated Particles */}
                <motion.div 
                  animate={{ y: [-10, 10, -10], opacity: [0.5, 1, 0.5] }} 
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-4 left-8 w-2 h-2 bg-white/40 rounded-full blur-[1px]"
                />
                <motion.div 
                  animate={{ y: [10, -10, 10], opacity: [0.3, 0.8, 0.3] }} 
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute bottom-6 right-10 w-3 h-3 bg-yellow-300/40 rounded-full blur-[2px]"
                />
                
                {/* Glowing Logo */}
                <div className="relative z-10 flex flex-col items-center">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    className="shadow-[0_0_30px_rgba(255,255,255,0.3)] relative"
                  >
                    <AppIcon size={14} iconSize={32} />
                    <Sparkles className="text-yellow-300 w-3 h-3 absolute -top-1 -right-1 z-20 pointer-events-none" />
                  </motion.div>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 text-center space-y-5" style={{ fontFamily: "'Cairo', sans-serif" }}>
                <div>
                  <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-0.5 tracking-tight">أذكار المؤمن</h2>
                  <p className="text-xs font-bold text-teal-600 dark:text-teal-400 tracking-widest">الإصدار الذكي 2.0</p>
                </div>

                {/* Inspirational Quote */}
                <div className="relative bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <span className="absolute -top-3 right-3 text-3xl text-teal-500/20 font-serif">"</span>
                  <p className="text-xl font-bold text-slate-800 dark:text-slate-200 leading-relaxed" style={{ fontFamily: "'Amiri', serif", lineHeight: '1.5' }}>
                    أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ
                  </p>
                  <span className="absolute -bottom-5 left-3 text-3xl text-teal-500/20 font-serif rotate-180">"</span>
                </div>

                {/* Stats */}
                <div className="flex justify-center gap-3">
                  <div className="flex-1 bg-teal-50 dark:bg-teal-900/20 p-3 rounded-2xl border border-teal-100 dark:border-teal-800/30">
                    <div className="text-[10px] text-teal-600 dark:text-teal-400 font-bold mb-1">النقاط المكتسبة</div>
                    <div className="text-xl font-black text-slate-800 dark:text-white">{progress.points}</div>
                  </div>
                  <div className="flex-1 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-2xl border border-amber-100 dark:border-amber-800/30">
                    <div className="text-[10px] text-amber-600 dark:text-amber-400 font-bold mb-1">المستوى الحالي</div>
                    <div className="text-xl font-black text-slate-800 dark:text-white">{progress.level}</div>
                  </div>
                </div>

                {/* Developer Info */}
                <div className="w-full p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50 relative overflow-hidden flex items-center justify-between">
                  <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center text-teal-600 dark:text-teal-400 shrink-0">
                    <Code size={20} />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold mb-0.5">تطوير وتصميم</p>
                    <p className="text-base font-black text-slate-800 dark:text-white">فاعل خير</p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-semibold px-1">
                  تطبيق إسلامي عصري صُمم بحب وعناية ليكون رفيقك اليومي في ذكر الله. نسأل الله أن يجعله صدقة جارية وعملاً متقبلاً.
                </p>

                <button 
                  onClick={() => {
                    if (showDuaThanks) return;
                    setShowDuaThanks(true);
                    setTimeout(() => setShowDuaThanks(false), 3000);
                  }}
                  className={cn(
                    "w-full py-3.5 rounded-xl font-black text-white transition-all duration-500 flex items-center justify-center gap-2 relative overflow-hidden z-20 text-sm",
                    showDuaThanks ? "bg-emerald-500 shadow-lg shadow-emerald-500/30 scale-105" : "bg-slate-900 dark:bg-white dark:text-slate-900 hover:scale-[1.02] shadow-xl"
                  )}
                >
                  <AnimatePresence>
                    {showDuaThanks ? (
                      <motion.div 
                        key="thanks"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-2"
                      >
                        <Heart size={20} className="fill-current text-white" />
                        <span>ولك بالمثل، جزاك الله خيراً!</span>
                      </motion.div>
                    ) : (
                      <motion.div 
                        key="dua"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-2"
                      >
                        <Heart size={20} className="text-slate-400 dark:text-slate-500" />
                        <span>دعوة بظهر الغيب للمطور</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* User / Achievements Modal */}
      <AnimatePresence>
        {isUserModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsUserModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-700"
            >
              <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                      التقييم والإنجازات
                    </h3>
                  </div>
                  <button 
                    onClick={() => setIsUserModalOpen(false)}
                    className="w-10 h-10 bg-rose-500 text-white rounded-full flex items-center justify-center hover:bg-rose-600 transform transition-all duration-75 active:scale-[0.85] active:opacity-70 shadow-lg shadow-rose-500/20"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-20 h-20 bg-teal-50 dark:bg-teal-900/30 rounded-2xl flex items-center justify-center text-teal-600 dark:text-teal-400 relative">
                    <User size={40} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white">{t('app_user' as any) || 'مستخدم البرنامج'}</h4>
                    <p className="text-xs text-slate-400">{getLevelRank(progress.level, currentLang)} • {t('level')} {progress.level}</p>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-3xl p-5 space-y-4 border border-slate-100 dark:border-slate-800 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-emerald-500" />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/50 rounded-xl flex items-center justify-center text-teal-600 dark:text-teal-400">
                        <Trophy size={20} />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">إجمالي النقاط</p>
                        <p className="font-bold text-slate-800 dark:text-white">
                          {progress.points} نقطة
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Progress to next level logic 1000 points per level */}
                  <div className="pt-2">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-[10px] sm:text-xs">
                        <span className="text-slate-500 dark:text-slate-400">{t('level')} {progress.level}</span>
                        <span className="text-teal-600 dark:text-teal-400 font-bold">{t('next_level' as any) || 'المستوى القادم'} {progress.level + 1}</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-teal-500 to-emerald-500 h-2 rounded-full" 
                          style={{ width: `${Math.min(100, (progress.points % 1000) / 10)}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 text-center mt-2 font-medium">
                         تبقى لك {1000 - (progress.points % 1000)} نقطة للوصول إلى المستوى التالي
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Subscription Modal */}
      <AnimatePresence>
        {isSubscriptionModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSubscriptionModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-700"
            >
              <div className="p-6 space-y-5">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-teal-500/10 dark:bg-teal-400/20 text-teal-600 dark:text-teal-300 flex items-center justify-center">
                      <Heart size={18} />
                    </div>
                    <h3 className="text-lg font-black text-slate-800 dark:text-white">
                      {t('sub_modal_title')}
                    </h3>
                  </div>
                  <button 
                    onClick={() => setIsSubscriptionModalOpen(false)}
                    className="w-8 h-8 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-full flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Hadith & Spiritual Banner */}
                <div className="bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-900 text-white p-4.5 rounded-2xl border border-emerald-500/30 shadow-lg space-y-2.5 text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-400/10 rounded-full blur-xl pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-20 h-20 bg-emerald-400/10 rounded-full blur-xl pointer-events-none" />
                  <p 
                    className="text-xs sm:text-sm font-black leading-relaxed text-amber-300 drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]"
                    style={{ fontFamily: "'Alexandria', 'Cairo', 'Tajawal', sans-serif" }}
                  >
                    {t('sub_modal_hadith')}
                  </p>
                  <div className="flex items-center justify-center gap-2 pt-0.5">
                    <span className="h-[1px] w-6 bg-amber-400/30" />
                    <p className="text-[10px] text-amber-200/90 font-bold uppercase tracking-wider">{t('sub_modal_hadith_source')}</p>
                    <span className="h-[1px] w-6 bg-amber-400/30" />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-800 dark:text-white">{t('sub_modal_app_status')}</span>
                      <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/20">
                        {progress.isPro ? t('sub_modal_status_pro') : t('sub_modal_status_free')}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                      {t('sub_modal_desc')}
                    </p>

                    <div className="space-y-2 pt-1 border-t border-slate-200 dark:border-slate-800">
                      {[
                        t('sub_modal_feat_1'),
                        t('sub_modal_feat_2'),
                        t('sub_modal_feat_3'),
                        t('sub_modal_feat_4')
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs font-bold text-teal-700 dark:text-teal-300">
                          <CheckCircle2 size={15} className="text-teal-500 shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      updateProgress(prev => ({ ...prev, isPro: true }));
                      setToast({ message: t('sub_modal_toast_activated'), type: 'success' });
                      setIsSubscriptionModalOpen(false);
                    }}
                    className="w-full py-3.5 rounded-xl text-xs font-black transition-all bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Heart size={16} className="fill-white" />
                    {progress.isPro ? t('sub_modal_btn_active') : t('sub_modal_btn_activate')}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Language Selector Modal */}
      <React.Suspense fallback={null}>
        <LanguageSelectorModal 
          isOpen={isLanguageModalOpen} 
          onClose={() => setIsLanguageModalOpen(false)} 
        />
      </React.Suspense>

      {/* Sidebar Drawer Menu - القائمة الرئيسية */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div className="fixed inset-0 z-50 flex shadow-2xl justify-start">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-40"
            />
            
            {/* Drawer Container */}
            <motion.div
              initial={{ x: isRtl ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: isRtl ? '100%' : '-100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className={cn(
                "relative w-72 max-w-[85vw] h-full shadow-2xl z-50 flex flex-col overflow-hidden main-menu-container",
                currentSidebarTheme.bg,
                currentSidebarTheme.border,
                isRtl ? "border-l" : "border-r"
              )}
            >
              {/* Pattern Background */}
              <div className={cn(
                "absolute inset-0 opacity-[0.04] pointer-events-none z-0",
                settings.sidebarTheme === 'glassy' ? "opacity-0" : "bg-[url('/images/arabesque.png')]"
              )} />

              {/* Drawer Header */}
              <div 
                className={cn(
                  "p-4 border-b flex items-center justify-between text-white relative z-10 backdrop-blur-md",
                  currentSidebarTheme.border,
                  settings.sidebarTheme === 'glassy' ? "bg-white/5" : "bg-black/10"
                )}
              >
                <div className="flex items-center gap-3 text-white">
                  <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md shrink-0 border border-emerald-500/30 bg-emerald-950/60 flex items-center justify-center">
                    <AppIcon className="w-full h-full" />
                  </div>
                  <span className="font-black text-lg text-emerald-100" style={{ fontFamily: "'Alexandria', sans-serif" }}>أذكار المؤمن</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => setIsLanguageModalOpen(true)}
                    className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer"
                    title={t('language', 'اللغة')}
                  >
                    <Globe size={16} />
                  </button>
                  <button 
                    onClick={() => setIsSidebarSettingsOpen(!isSidebarSettingsOpen)}
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer",
                      isSidebarSettingsOpen ? "bg-emerald-500 text-white" : "bg-white/10 text-white hover:bg-white/20"
                    )}
                    title={t('sidebar_settings_title')}
                  >
                    <Settings size={16} className={cn(isSidebarSettingsOpen ? "animate-spin-slow" : "")} />
                  </button>
                  <button 
                    onClick={() => {
                      if (isSidebarSettingsOpen) {
                        setIsSidebarSettingsOpen(false);
                      } else {
                        setIsDrawerOpen(false);
                      }
                    }}
                    className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer"
                    title={isSidebarSettingsOpen ? t('close_settings') : t('close_menu')}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Sidebar Customization View */}
              <AnimatePresence mode="wait">
                {isSidebarSettingsOpen ? (
                  <motion.div
                    key="sidebar-settings"
                    initial={{ opacity: 0, x: isRtl ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: isRtl ? 20 : -20 }}
                    className="flex-1 overflow-y-auto px-4 py-4 space-y-6 relative z-10"
                    style={{ fontFamily: "'Tajawal', sans-serif" }}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3 px-1">
                        <h4 className="text-[11px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                          <Sparkles size={14} />
                          {t('sidebar_themes_title')}
                        </h4>
                        <span className="text-[10px] text-white/50 font-bold">
                          {sidebarThemes.length} {t('sidebar_theme_unit')}
                        </span>
                      </div>
                      
                      {/* Circular Theme Badges Grid (Inspired by modern color picker) */}
                      <div className="grid grid-cols-4 gap-3 bg-white/5 p-3.5 rounded-2xl border border-white/10 backdrop-blur-md">
                        {sidebarThemes.map((theme) => {
                          const isSelected = settings.sidebarTheme === theme.id;
                          return (
                            <button
                              key={theme.id}
                              onClick={() => {
                                updateSettings({ sidebarTheme: theme.id as any });
                                setIsSidebarSettingsOpen(false);
                              }}
                              className="flex flex-col items-center gap-1.5 group cursor-pointer"
                              title={theme.name}
                            >
                              <div
                                className={cn(
                                  "relative w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-200 shadow-md group-hover:scale-110 active:scale-95 border border-white/20",
                                  theme.colorCircle || "bg-emerald-600",
                                  isSelected 
                                    ? "ring-4 ring-emerald-400 ring-offset-2 ring-offset-slate-900 scale-105 shadow-emerald-500/40 z-10" 
                                    : "hover:ring-2 hover:ring-white/40 opacity-90 group-hover:opacity-100"
                                )}
                              >
                                {isSelected ? (
                                  <div className="w-5 h-5 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                                    <Check size={14} className="text-white stroke-[3]" />
                                  </div>
                                ) : (
                                  <div className="w-2 h-2 rounded-full bg-white/20 group-hover:bg-white/50 transition-colors" />
                                )}
                              </div>
                              <span
                                className={cn(
                                  "text-[10px] text-center font-bold leading-tight truncate w-full px-0.5",
                                  isSelected ? "text-emerald-300 font-black" : "text-white/70"
                                )}
                              >
                                {theme.name}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-[11px] font-black text-emerald-400 uppercase tracking-widest px-1 mb-3 flex items-center gap-2">
                        <Palette size={14} />
                        {t('app_general_theme')}
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: 'emerald', name: t('vt_emerald'), color: 'from-emerald-900 to-teal-950' },
                          { id: 'aurora', name: t('vt_aurora'), color: 'from-indigo-900 to-purple-950' },
                          { id: 'amber', name: t('vt_amber'), color: 'from-amber-600 via-rose-700 to-stone-900' },
                          { id: 'glass', name: t('vt_glass'), color: 'from-slate-800 to-slate-900' },
                          { id: 'minimal', name: t('vt_minimal'), color: 'from-zinc-800 to-neutral-900' },
                          { id: 'clear', name: t('vt_clear', 'النقي الساطع'), color: 'from-cyan-800 to-blue-950' },
                          { id: 'lavender', name: t('vt_lavender', 'اللافندر العطري'), color: 'from-violet-900 to-[#0c0022]' },
                          { id: 'classic', name: t('vt_classic'), color: 'from-teal-900 to-slate-900' },
                        ].map((vt) => (
                          <button
                            key={vt.id}
                            onClick={() => {
                              updateSettings({ visualTheme: vt.id as any });
                              setIsSidebarSettingsOpen(false);
                            }}
                            className={cn(
                              "p-2.5 rounded-xl border-2 transition-all flex items-center gap-2 cursor-pointer text-start",
                              settings.visualTheme === vt.id 
                                ? "border-emerald-500 bg-emerald-500/10" 
                                : "border-white/5 bg-white/5 hover:bg-white/10"
                            )}
                          >
                            <div className={cn("w-5 h-5 rounded-full bg-gradient-to-br shrink-0 shadow-sm border border-white/20", vt.color)} />
                            <span className="text-[10px] font-black text-white/90 truncate">{vt.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-[11px] font-black text-emerald-400 uppercase tracking-widest px-1 flex items-center gap-2">
                        <Target size={14} />
                        {t('smart_features')}
                      </h4>
                      
                      <div className="space-y-2">
                        <button
                          onClick={() => updateSettings({ sidebarCompactMode: !settings.sidebarCompactMode })}
                          className={cn(
                            "w-full p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer",
                            settings.sidebarCompactMode ? "bg-emerald-500/10 border-emerald-500/30" : "bg-white/5 border-white/5"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                              <LayoutGrid size={16} className="text-emerald-400" />
                            </div>
                            <div className="text-start">
                              <p className="text-xs font-black">{t('sidebar_compact_mode')}</p>
                              <p className="text-[9px] text-white/40">{t('sidebar_compact_mode_desc')}</p>
                            </div>
                          </div>
                          <div className={cn(
                            "w-8 h-4 rounded-full relative transition-all",
                            settings.sidebarCompactMode ? "bg-emerald-500" : "bg-white/20"
                          )}>
                            <div className={cn(
                              "absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all",
                              settings.sidebarCompactMode ? (isRtl ? "right-4.5" : "left-4.5") : (isRtl ? "right-0.5" : "left-0.5")
                            )} />
                          </div>
                        </button>

                        <button
                          onClick={() => updateSettings({ sidebarShowIconsOnly: !settings.sidebarShowIconsOnly })}
                          className={cn(
                            "w-full p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer",
                            settings.sidebarShowIconsOnly ? "bg-emerald-500/10 border-emerald-500/30" : "bg-white/5 border-white/5"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                              <AppIcon size={4} iconSize={12} className="bg-transparent text-emerald-400" />
                            </div>
                            <div className="text-start">
                              <p className="text-xs font-black">{t('sidebar_icons_only')}</p>
                              <p className="text-[9px] text-white/40">{t('sidebar_icons_only_desc')}</p>
                            </div>
                          </div>
                          <div className={cn(
                            "w-8 h-4 rounded-full relative transition-all",
                            settings.sidebarShowIconsOnly ? "bg-emerald-500" : "bg-white/20"
                          )}>
                            <div className={cn(
                              "absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all",
                              settings.sidebarShowIconsOnly ? (isRtl ? "right-4.5" : "left-4.5") : (isRtl ? "right-0.5" : "left-0.5")
                            )} />
                          </div>
                        </button>
                      </div>
                    </div>


                    <div className="space-y-4">
                      <h4 className="text-[11px] font-black text-emerald-400 uppercase tracking-widest px-1 flex items-center gap-2">
                        <LayoutGrid size={14} />
                        تخصيص الواجهة الرئيسية
                      </h4>
                      <p className="text-[10px] text-white/50 px-1 leading-relaxed">
                        اسحب لتغيير ترتيب الأقسام، واضغط على الأيقونة للإخفاء/الإظهار
                      </p>
                      
                      <Reorder.Group 
                        axis="y" 
                        values={homeWidgets || []} 
                        onReorder={updateHomeWidgets} 
                        className="space-y-1.5"
                      >
                        {(homeWidgets || []).map((widget: any) => {
                          const Icon = widgetIconMap[widget.id] || Sparkles;
                          return (
                            <Reorder.Item 
                              key={widget.id} 
                              value={widget}
                              className={cn(
                                "flex items-center justify-between p-2.5 rounded-xl border transition-colors select-none",
                                widget.isVisible 
                                  ? "bg-white/10 border-white/10" 
                                  : "bg-white/5 border-dashed border-white/5 opacity-60"
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <div className="cursor-grab active:cursor-grabbing text-white/30 hover:text-white/70">
                                  <GripVertical size={16} />
                                </div>
                                <div className={cn(
                                  "w-7 h-7 rounded-lg flex items-center justify-center",
                                  widget.isVisible ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-white/30"
                                )}>
                                  <Icon size={14} />
                                </div>
                                <span className={cn("font-bold text-[11px]", widget.isVisible ? "text-white" : "text-white/50")}>
                                  {widget.name}
                                </span>
                              </div>
                              
                              <button 
                                onClick={() => {
                                  updateHomeWidgets(homeWidgets.map((w: any) => w.id === widget.id ? { ...w, isVisible: !w.isVisible } : w));
                                }}
                                className={cn(
                                  "p-1.5 rounded-full transition-colors cursor-pointer",
                                  widget.isVisible 
                                    ? "text-emerald-400 hover:bg-emerald-500/20" 
                                    : "text-white/30 hover:bg-white/10"
                                )}
                              >
                                {widget.isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                              </button>
                            </Reorder.Item>
                          );
                        })}
                      </Reorder.Group>
                    </div>

                    <button
                      onClick={() => setIsSidebarSettingsOpen(false)}
                      className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-[11px] font-black text-white transition-all cursor-pointer"
                    >
                      {t('back_to_main_menu')}
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="sidebar-links"
                    initial={{ opacity: 0, x: isRtl ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: isRtl ? -20 : 20 }}
                    className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5 overscroll-contain hide-scrollbar relative z-10 flex flex-col"
                    style={{ fontFamily: "'Tajawal', sans-serif" }}
                  >
                    {/* User Profile Summary */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex items-center gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 p-[2px]">
                          <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center border-2 border-slate-900">
                             <User size={20} className="text-emerald-400" />
                          </div>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-500 rounded-full border-2 border-slate-900 flex items-center justify-center shadow-lg">
                          <Crown size={10} className="text-white" />
                        </div>
                      </div>
                      <div>
                        <p className="text-white font-bold text-sm truncate w-32">{t('welcome_prefix')} {auth.currentUser?.displayName || t('welcome_believer')}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">{t('level')} {progress.level}</span>
                          <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1"><Sparkles size={10} /> {progress.points} {t('points')}</span>
                        </div>
                      </div>
                    </div>

                    <div className={cn(
                      "space-y-6 pb-6",
                      settings.sidebarShowIconsOnly && "space-y-4"
                    )}>
                      {[
                        {
                          category: t('nav_cat_basic'),
                          items: [
                            { to: "/", name: t('home'), icon: <Home size={18} />, color: "text-emerald-400 bg-emerald-950/40" },
                            { to: "/adhkar", name: t('adhkar'), icon: <Sunrise size={18} />, color: "text-amber-400 bg-amber-950/40" },
                            { to: "/quran", name: t('quran_mushaf'), icon: <BookOpen size={18} />, color: "text-teal-400 bg-teal-950/40" },
                            { to: "/adhkar-quran-dashboard", name: "لوحة متابعة الأذكار والقرآن", icon: <BarChart3 size={18} />, color: "text-emerald-400 bg-emerald-950/40" },
                            { to: "/audio-library", name: t('audio_library'), icon: <Headphones size={18} />, color: "text-indigo-400 bg-indigo-950/40" },
                          ]
                        },
                        {
                          category: t('nav_cat_worship'),
                          items: [
                            { to: "/istighfar", name: "ركن التوبة والاستغفار وصلاة التوبة", icon: <Droplets size={18} />, color: "text-sky-400 bg-sky-950/40" },
                            { to: "/tasbih", name: t('tasbihNav'), icon: <Fingerprint size={18} />, color: "text-cyan-400 bg-cyan-950/40" },
                            { to: "/duas", name: t('prophetic_duas'), icon: <Heart size={18} />, color: "text-rose-400 bg-rose-950/40" },
                            { to: "/prayer-times", name: t('prayer_times_title'), icon: <Clock size={18} />, color: "text-pink-400 bg-pink-950/40" },
                            { to: "/compass", name: t('qibla_direction'), icon: <Compass size={18} />, color: "text-blue-400 bg-blue-950/40" },
                            { to: "/khatma", name: t('khatma'), icon: <Book size={18} />, color: "text-teal-400 bg-teal-950/40" },
                            { to: "/sadaqah-jariyah", name: "مشروع الصدقة الجارية", icon: <HandHeart size={18} />, color: "text-emerald-400 bg-emerald-950/40" },
                          ]
                        },
                        {
                          category: t('nav_cat_knowledge'),
                          items: [
                            { to: "/scholar-sayings", name: t('scholar_sayings'), icon: <Scroll size={18} />, color: "text-yellow-400 bg-yellow-950/40" },
                            { to: "/names", name: t('names_of_allah'), icon: <Sparkles size={18} />, color: "text-orange-400 bg-orange-950/40" },
                            { to: "/stories", name: t('prophets_stories'), icon: <BookOpenText size={18} />, color: "text-violet-400 bg-violet-950/40" },
                          ]
                        },
                        {
                          category: t('nav_cat_community_settings'),
                          items: [
                            { to: "/challenges", name: t('challenges_nav'), icon: <Trophy size={18} />, color: "text-amber-400 bg-amber-950/40" },
                            { to: "/spiritual-goals", name: t('spiritual_goals'), icon: <Target size={18} />, color: "text-rose-400 bg-rose-950/40" },
                            { to: "/settings", name: t('settings'), icon: <Settings size={18} />, color: "text-slate-400 bg-slate-900/40" },
                            { to: "/legal", name: t('terms_and_privacy', 'الشروط والخصوصية'), icon: <Shield size={18} />, color: "text-teal-400 bg-teal-950/40" },
                            { to: "/contact", name: t('contact_and_support'), icon: <LifeBuoy size={18} />, color: "text-emerald-400 bg-emerald-950/40" },
                          ]
                        }
                      ].map((group, groupIdx) => (
                        <div key={groupIdx} className="space-y-2">
                          {!settings.sidebarShowIconsOnly && (
                            <h3 className="text-[10px] font-black text-emerald-400/60 uppercase tracking-widest px-3 mb-1 text-start">
                              {group.category}
                            </h3>
                          )}
                          <div className={cn(
                            "space-y-1",
                            settings.sidebarShowIconsOnly && "grid grid-cols-4 gap-2 space-y-0"
                          )}>
                            {group.items.map((item, index) => {
                              const isActive = location.pathname === item.to || (item.to !== "/" && location.pathname.startsWith(item.to));
                              return (
                                <Link
                                  key={index}
                                  to={item.to}
                                  onMouseEnter={() => preloadRoute(item.to)}
                                  onTouchStart={() => preloadRoute(item.to)}
                                  onClick={() => setIsDrawerOpen(false)}
                                  className={cn(
                                    "flex items-center gap-3 transition-all cursor-pointer rounded-xl group",
                                    settings.sidebarCompactMode ? "px-2 py-1.5" : "px-3 py-2.5",
                                    settings.sidebarShowIconsOnly ? "justify-center aspect-square" : "font-black text-[13px]",
                                    isActive 
                                      ? "bg-gradient-to-r from-emerald-600/30 to-teal-600/30 text-emerald-300 shadow-sm border border-emerald-500/30" 
                                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                                  )}
                                  title={settings.sidebarShowIconsOnly ? item.name : ""}
                                >
                                  <div className={cn(
                                    "rounded-lg flex items-center justify-center shrink-0 shadow-inner transition-transform group-hover:scale-110",
                                    isActive && "scale-110",
                                    settings.sidebarCompactMode ? "w-6 h-6" : "w-8 h-8",
                                    item.color
                                  )}>
                                    {item.icon}
                                  </div>
                                  {!settings.sidebarShowIconsOnly && (
                                    <>
                                      <span className="flex-1 truncate text-start">{item.name}</span>
                                      {isActive && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                                      )}
                                    </>
                                  )}
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Drawer Footer & Social Media Buttons */}
              <div className="p-3.5 border-t border-white/10 bg-black/20 backdrop-blur-md relative z-10 space-y-3 shrink-0">
                {/* Social Section Title */}
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10.5px] font-black text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Globe size={13} className="text-emerald-400 animate-pulse" />
                    {t('setting_social' as any) || 'تابعنا على مواقع التواصل'}
                  </span>
                  <span className="text-[9px] text-white/40 font-bold">تطبيق أذكار المؤمن</span>
                </div>

                {/* Social Buttons 4-Column Modern Grid */}
                <div className="grid grid-cols-4 gap-2">
                  <a
                    href="https://www.facebook.com/share/18WqMm9baA/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col items-center justify-center p-2 rounded-xl bg-blue-600/15 border border-blue-500/25 hover:bg-blue-600 hover:border-blue-500 transition-all duration-300 shadow-sm active:scale-95 cursor-pointer"
                    title="فيسبوك - Facebook"
                  >
                    <div className="w-7 h-7 rounded-lg bg-blue-600/30 group-hover:bg-white/20 flex items-center justify-center text-blue-400 group-hover:text-white transition-colors">
                      <Facebook size={16} />
                    </div>
                    <span className="text-[9.5px] font-black text-white/90 group-hover:text-white mt-1.5 truncate w-full text-center">فيسبوك</span>
                  </a>

                  <a
                    href="https://www.instagram.com/azkar.almumin?igsh=dzJ6dHF4d3plbWk2"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col items-center justify-center p-2 rounded-xl bg-pink-500/15 border border-pink-500/25 hover:bg-gradient-to-tr hover:from-purple-600 hover:via-pink-500 hover:to-amber-500 hover:border-transparent transition-all duration-300 shadow-sm active:scale-95 cursor-pointer"
                    title="انستجرام - Instagram"
                  >
                    <div className="w-7 h-7 rounded-lg bg-pink-500/30 group-hover:bg-white/20 flex items-center justify-center text-pink-400 group-hover:text-white transition-colors">
                      <Instagram size={16} />
                    </div>
                    <span className="text-[9.5px] font-black text-white/90 group-hover:text-white mt-1.5 truncate w-full text-center">انستجرام</span>
                  </a>

                  <a
                    href="https://x.com/azkaralmumelnk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col items-center justify-center p-2 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-900 hover:border-slate-600 transition-all duration-300 shadow-sm active:scale-95 cursor-pointer"
                    title="تويتر - Twitter / X"
                  >
                    <div className="w-7 h-7 rounded-lg bg-slate-700/50 group-hover:bg-white/20 flex items-center justify-center text-slate-300 group-hover:text-white transition-colors">
                      <Twitter size={16} />
                    </div>
                    <span className="text-[9.5px] font-black text-white/90 group-hover:text-white mt-1.5 truncate w-full text-center">تويتر</span>
                  </a>

                  <a
                    href="https://t.me/azkar_almumen"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col items-center justify-center p-2 rounded-xl bg-cyan-500/15 border border-cyan-500/25 hover:bg-cyan-500 hover:border-cyan-400 transition-all duration-300 shadow-sm active:scale-95 cursor-pointer"
                    title="تيلجرام - Telegram"
                  >
                    <div className="w-7 h-7 rounded-lg bg-cyan-500/30 group-hover:bg-white/20 flex items-center justify-center text-cyan-400 group-hover:text-white transition-colors">
                      <Send size={15} className="-ml-0.5" />
                    </div>
                    <span className="text-[9.5px] font-black text-white/90 group-hover:text-white mt-1.5 truncate w-full text-center">تيلجرام</span>
                  </a>
                </div>

                {/* Footer Version Info */}
                <div className="pt-2 text-center text-[9.5px] text-emerald-400/50 font-bold border-t border-white/5">
                  {t('app_edition')} v2.6 • {t('sadaqah_jariyah')}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Content Wrapper */}
      <div className="flex-1 relative flex flex-col overflow-hidden min-h-0">
        {/* Progress bar at the very top of content (Visual) */}
        <div className="absolute top-0 left-0 right-0 h-0.5 z-20 overflow-hidden pointer-events-none">
          <motion.div 
            style={{ scaleX: scrollYProgress }} 
            className="h-full bg-teal-500 origin-left"
          />
        </div>

        {/* Main Content */}
        <main 
          ref={mainRef}
          className={cn(
          "flex-1 overflow-x-hidden relative z-0 hide-scrollbar momentum-scroll overscroll-contain scroll-pt-20 min-h-0",
          isFullHeightPage ? "overflow-y-hidden flex flex-col h-full" : "overflow-y-auto",
          isWidePage ? "p-0 w-full max-w-none" : "px-4 md:px-8 mx-auto w-full max-w-2xl md:max-w-4xl lg:max-w-5xl pt-3 md:pt-8 pb-10"
        )}>
          <div className={cn(
            "grid grid-cols-1 grid-rows-1 w-full relative",
            isFullHeightPage ? "h-full flex-1 items-stretch" : "min-h-full items-start"
          )}>
            <React.Suspense fallback={<PageSkeletonFallback />}>
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, y: 20, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.98 }}
                  transition={{ 
                    duration: 0.35, 
                    ease: [0.22, 1, 0.36, 1] 
                  }}
                  className={cn(
                    "w-full flex flex-col col-start-1 row-start-1 gpu-layer",
                    isFullHeightPage ? "h-full min-h-0" : "min-h-full"
                  )}
                >
                  <SectionErrorBoundary>
                    <Outlet />
                  </SectionErrorBoundary>
                </motion.div>
              </AnimatePresence>
            </React.Suspense>
          </div>
        </main>
        <GlobalAudioBar />
        <DownloadProgressWidget />
        {!hideBottomNav && (
          <nav 
            id="bottom-nav"
            style={{ paddingBottom: 'max(0.375rem, env(safe-area-inset-bottom))' }}
            className={cn(
            "shrink-0 z-20 transition-all duration-500 w-full",
            settings.visualTheme === 'glass' ? "bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border-t border-white/20" :
            settings.visualTheme === 'minimal' ? "bg-white dark:bg-slate-900 border-none" :
            settings.visualTheme === 'aurora' ? "bg-white/5 backdrop-blur-lg border-t border-white/10" :
            settings.visualTheme === 'emerald' ? "bg-emerald-950/40 backdrop-blur-md border-t border-emerald-500/20" :
            settings.visualTheme === 'amber' ? "bg-amber-950/40 backdrop-blur-md border-t border-amber-500/20" :
            settings.visualTheme === 'lavender' ? "bg-violet-950/40 backdrop-blur-md border-t border-violet-500/20" :
            "bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800"
          )}>
            <div className="max-w-2xl md:max-w-4xl mx-auto px-4 md:px-8 pt-1.5 flex justify-between items-center w-full">
              <NavItem to="/" icon={<Home size={22} />} label={t('home')} onPreload={() => preloadRoute('/')} onClick={() => {
              const destIndex = swipeableTabs.indexOf('/');
              if (currentIndex !== -1 && destIndex !== -1 && destIndex !== currentIndex) {
                setSwipeDirection(isRtl ? (destIndex < currentIndex ? 1 : -1) : (destIndex > currentIndex ? 1 : -1));
              } else { setSwipeDirection(0); }
            }} />
            <NavItem to="/adhkar" icon={<Sunrise size={22} />} label={t('adhkar')} onPreload={() => preloadRoute('/adhkar')} onClick={() => {
              const destIndex = swipeableTabs.indexOf('/adhkar');
              if (currentIndex !== -1 && destIndex !== -1 && destIndex !== currentIndex) {
                setSwipeDirection(isRtl ? (destIndex < currentIndex ? 1 : -1) : (destIndex > currentIndex ? 1 : -1));
              } else { setSwipeDirection(0); }
            }} />
            <NavItem to="/quran" icon={<BookOpen size={22} />} label={t('quran')} onPreload={() => preloadRoute('/quran')} onClick={() => {
              const destIndex = swipeableTabs.indexOf('/quran');
              if (currentIndex !== -1 && destIndex !== -1 && destIndex !== currentIndex) {
                setSwipeDirection(isRtl ? (destIndex < currentIndex ? 1 : -1) : (destIndex > currentIndex ? 1 : -1));
              } else { setSwipeDirection(0); }
            }} />
            <NavItem to="/library" icon={<LayoutGrid size={22} />} label={t('library')} onPreload={() => preloadRoute('/library')} onClick={() => {
              const destIndex = swipeableTabs.indexOf('/library');
              if (currentIndex !== -1 && destIndex !== -1 && destIndex !== currentIndex) {
                setSwipeDirection(isRtl ? (destIndex < currentIndex ? 1 : -1) : (destIndex > currentIndex ? 1 : -1));
              } else { setSwipeDirection(0); }
            }} />
            <NavItem to="/tasbih" icon={<Fingerprint size={22} />} label={t('tasbih')} onPreload={() => preloadRoute('/tasbih')} onClick={() => {
              const destIndex = swipeableTabs.indexOf('/tasbih');
              if (currentIndex !== -1 && destIndex !== -1 && destIndex !== currentIndex) {
                setSwipeDirection(isRtl ? (destIndex < currentIndex ? 1 : -1) : (destIndex > currentIndex ? 1 : -1));
              } else { setSwipeDirection(0); }
            }} />
            <NavItem to="/settings" icon={<Settings size={22} />} label={t('settings')} onPreload={() => preloadRoute('/settings')} onClick={() => setSwipeDirection(0)} />
            </div>
          </nav>
        )}
      </div>
      <AppInfoModal isOpen={isAppInfoModalOpen} onClose={() => setIsAppInfoModalOpen(false)} />
      {/* Global Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95, x: '-50%' }}
            animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
            exit={{ opacity: 0, y: -20, scale: 0.95, x: '-50%' }}
            transition={{ duration: 0.3, type: "spring", damping: 25, stiffness: 350 }}
            className={cn(
              "fixed top-24 left-1/2 z-[9999] px-5 py-3 rounded-2xl flex items-center gap-3 shadow-[0_12px_40px_rgba(0,0,0,0.3)] border backdrop-blur-md min-w-[280px] max-w-[90vw] transition-all",
              toast.type === 'success' 
                ? "bg-slate-900/95 dark:bg-emerald-950/95 text-white border-emerald-500/30"
                : toast.type === 'error'
                ? "bg-red-950/95 text-white border-red-500/30"
                : "bg-slate-900/95 text-white border-slate-700/30"
            )}
          >
            <div className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center shrink-0",
              toast.type === 'success' ? "bg-emerald-500/20 text-emerald-400" :
              toast.type === 'error' ? "bg-red-500/20 text-red-400" : "bg-blue-500/20 text-blue-400"
            )}>
              {toast.type === 'success' ? <CheckCircle2 size={15} strokeWidth={3} /> : <Sparkles size={15} />}
            </div>
            <span className="text-xs sm:text-sm font-extrabold leading-tight tracking-tight text-right">
              {toast.message}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const NavItem: React.FC<{ to: string; icon: React.ReactNode; label: string; onClick?: () => void; onPreload?: () => void }> = ({ to, icon, label, onClick, onPreload }) => {
  const { settings } = useAppContext();
  
  const handleNavClick = () => {
    if (settings.hapticTasbihEnabled !== false) {
      triggerHaptic('light');
    }
    if (onClick) {
      onClick();
    }
  };

  return (
    <NavLink
      to={to}
      onClick={handleNavClick}
      onMouseEnter={onPreload}
      onTouchStart={onPreload}
      className={({ isActive }) =>
        cn(
          "flex flex-col items-center gap-0.5 transition-all duration-200 relative py-1 px-3 rounded-2xl active:scale-95",
          isActive ? "scale-105" : "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
        )
      }
      style={({ isActive }) => ({
        color: isActive 
          ? (settings.primaryColor.includes('gradient') ? settings.primaryColor.match(/#[a-fA-F0-9]{6}/)?.[0] || '#0d9488' : settings.primaryColor) 
          : undefined,
        backgroundColor: isActive ? 'rgba(13, 148, 136, 0.05)' : 'transparent'
      })}
    >
      {({ isActive }) => (
        <>
          {icon}
          <span className="text-[9px] font-black uppercase tracking-tight">{label}</span>
          {/* Active Indicator Dot */}
          {isActive && (
            <motion.div 
              layoutId="nav-dot"
              className="absolute -bottom-1 w-1 h-1 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.2)]"
              style={{ 
                backgroundColor: settings.primaryColor.includes('gradient') ? settings.primaryColor.match(/#[a-fA-F0-9]{6}/)?.[0] || '#0d9488' : settings.primaryColor
              }}
            />
          )}
        </>
      )}
    </NavLink>
  );
};


