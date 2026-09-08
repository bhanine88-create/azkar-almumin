import { useTranslation } from '../i18n';
import { BackButton } from './ui/BackButton';
import { AppIcon } from './ui/AppIcon';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../AppContext';
import { 
  ChevronRight, 
  ChevronLeft,
  BookOpen, 
  ChevronDown, 
  Search, 
  Download, 
  Share2, 
  Volume2, 
  Pause, 
  Check, 
  Settings2, 
  Plus, 
  Minus, 
  Loader2, 
  Sparkles,
  Star,
  Eye,
  EyeOff,
  Type,
  FileText,
  Sliders,
  SlidersHorizontal,
  Layers,
  Square,
  X
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { hadithCollections } from '../data/hadithCollection';
import { cn, copyTextToClipboard, shareContent, triggerHaptic } from '../lib/utils';
import { useChallengeTracker } from '../hooks/useChallengeTracker';
import { useSmartNavigation } from "../lib/navigation";
import { toPng } from 'html-to-image';
import { safeLocalStorageGetItem, safeLocalStorageSetItem, safeLocalStorageRemoveItem } from "../utils/storage";


const themeStyles: Record<string, { bg: string; text: string; textDark: string; border: string; gradient: string; accent: string; }> = {
  emerald: {
    bg: "bg-emerald-600",
    text: "text-emerald-600 dark:text-emerald-400",
    textDark: "text-emerald-800 dark:text-emerald-400",
    border: "border-emerald-500/20",
    gradient: "from-emerald-600 to-teal-600",
    accent: "bg-emerald-500",
  },
  rose: {
    bg: "bg-rose-600",
    text: "text-rose-600 dark:text-rose-400",
    textDark: "text-rose-800 dark:text-rose-400",
    border: "border-rose-500/20",
    gradient: "from-rose-600 to-pink-600",
    accent: "bg-rose-500",
  },
  pink: {
    bg: "bg-pink-500",
    text: "text-pink-600 dark:text-pink-400",
    textDark: "text-pink-800 dark:text-pink-400",
    border: "border-pink-500/20",
    gradient: "from-pink-500 to-rose-500",
    accent: "bg-pink-400",
  },
  purple: {
    bg: "bg-purple-600",
    text: "text-purple-600 dark:text-purple-400",
    textDark: "text-purple-800 dark:text-purple-400",
    border: "border-purple-500/20",
    gradient: "from-purple-600 to-indigo-600",
    accent: "bg-purple-500",
  },
  amber: {
    bg: "bg-amber-500",
    text: "text-amber-600 dark:text-amber-400",
    textDark: "text-amber-800 dark:text-amber-400",
    border: "border-amber-500/20",
    gradient: "from-amber-500 to-orange-500",
    accent: "bg-amber-400",
  },
  blue: {
    bg: "bg-blue-600",
    text: "text-blue-600 dark:text-blue-400",
    textDark: "text-blue-800 dark:text-blue-400",
    border: "border-blue-500/20",
    gradient: "from-blue-600 to-sky-600",
    accent: "bg-blue-500",
  },
  indigo: {
    bg: "bg-indigo-600",
    text: "text-indigo-600 dark:text-indigo-400",
    textDark: "text-indigo-800 dark:text-indigo-400",
    border: "border-indigo-500/20",
    gradient: "from-indigo-600 to-blue-700",
    accent: "bg-indigo-500",
  },
  cyan: {
    bg: "bg-cyan-600",
    text: "text-cyan-600 dark:text-cyan-400",
    textDark: "text-cyan-800 dark:text-cyan-400",
    border: "border-cyan-500/20",
    gradient: "from-cyan-600 to-teal-500",
    accent: "bg-cyan-500",
  }
};

const watermarkColors: Record<string, string> = {
  emerald: "text-amber-200 drop-shadow-[0_1.5px_3.5px_rgba(0,0,0,0.75)] font-black",
  rose: "text-yellow-200 drop-shadow-[0_1.5px_3.5px_rgba(0,0,0,0.75)] font-black",
  pink: "text-white drop-shadow-[0_1.5px_3.5px_rgba(0,0,0,0.75)] font-black",
  purple: "text-amber-200 drop-shadow-[0_1.5px_3.5px_rgba(0,0,0,0.75)] font-black",
  amber: "text-amber-950 drop-shadow-[0_0.5px_1px_rgba(255,255,255,0.45)] font-black",
  blue: "text-yellow-200 drop-shadow-[0_1.5px_3.5px_rgba(0,0,0,0.75)] font-black",
  indigo: "text-amber-200 drop-shadow-[0_1.5px_3.5px_rgba(0,0,0,0.75)] font-black",
  cyan: "text-white drop-shadow-[0_1.5px_3.5px_rgba(0,0,0,0.7)] font-black",
};

const AVAILABLE_FONTS = [
  { id: 'Scheherazade New', name: 'خط النسخ (شهرزاد)' },
  { id: 'Amiri', name: 'خط المنبر (أميري)' },
  { id: 'Cairo', name: 'خط القاهرة الحديث' },
  { id: 'Tajawal', name: 'خط تجوال المبسط' },
  { id: 'Zain', name: 'خط زين الدائري' },
  { id: 'Alexandria', name: 'خط الإسكندرية الممتد' },
  { id: 'Noto Kufi Arabic', name: 'خط الكوفي الهندسي' },
  { id: 'Reem Kufi', name: 'خط ريم كوفي المطور' },
  { id: 'El Messiri', name: 'خط الرسائل والزخرفة' },
  { id: 'Lateef', name: 'خط لطيف النسخي' },
  { id: 'Aref Ruqaa', name: 'خط الرقعة الفني' },
  { id: 'Noto Naskh Arabic', name: 'خط النسخ (نوتو)' },
  { id: 'Markazi Text', name: 'الخط المركزي' },
  { id: 'Mirza', name: 'خط ميرزا' },
  { id: 'Katibeh', name: 'خط كتيبة' },
  { id: 'Beiruti', name: 'خط بيروتي الفاخر' },
  { id: 'Lalezar', name: 'خط لاليزار العريض' },
  { id: 'Marhey', name: 'خط مرحي الإبداعي' },
  { id: 'Rakkas', name: 'خط رقاص المزخرف' }
];


const getHadithFontFamily = (font: string) => {
  return `"${font}", 'Amiri', 'Scheherazade New', 'Tajawal', 'Cairo', 'Noto Sans Arabic', system-ui, -apple-system, sans-serif`;
};

export const IndependentHadith: React.FC = () => {
  const { settings, updateSettings } = useAppContext();
  const { t } = useTranslation(settings?.appLanguage);
  const { navigate, goBack } = useSmartNavigation();
  const { categoryId } = useParams();
  const { updateSpecificChallenge } = useChallengeTracker();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showEmpty, setShowEmpty] = useState(false);
  const [bgLoaded, setBgLoaded] = useState(true);

  const [activeTab, setActiveTab] = useState<string>(() => {
    if (categoryId && hadithCollections[categoryId]?.subCategories) {
      return Object.keys(hadithCollections[categoryId].subCategories)[0] || '';
    }
    return '';
  });
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modern font customization states
  const [hadithFontSize, setHadithFontSize] = useState<number>(() => {
    const saved = safeLocalStorageGetItem('hadith-font-size');
    return saved ? parseInt(saved, 10) : 22;
  });
  
  const hadithFont = settings.hadithFontFamily || 'Scheherazade New';
  
  const handleUpdateHadithFont = (font: string) => {
    updateSettings({ hadithFontFamily: font });
  };
  
  const [userTheme, setUserTheme] = useState<string>(() => {
    return safeLocalStorageGetItem('hadith-user-theme') || '';
  });

  const handleUpdateTheme = (theme: string) => {
    setUserTheme(theme);
    if (theme) {
      safeLocalStorageSetItem('hadith-user-theme', theme);
    } else {
      safeLocalStorageRemoveItem('hadith-user-theme');
    }
  };

  const [hadithCopiedId, setHadithCopiedId] = useState<number | string | null>(null);
  const [hadithPlayingId, setHadithPlayingId] = useState<number | string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [isFontDropdownOpen, setIsFontDropdownOpen] = useState(false);

  // Smart and interactive customizable states
  const [speechRate, setSpeechRate] = useState<number>(() => {
    const saved = safeLocalStorageGetItem('hadith-speech-rate');
    return saved ? parseFloat(saved) : 1.0;
  });

  const isRtl = settings.appLanguage !== 'en' && settings.appLanguage !== 'fr';
  const [slideDirection, setSlideDirection] = useState<'forward' | 'backward'>('forward');

  const [showExplanation, setShowExplanation] = useState<boolean>(() => {
    const saved = safeLocalStorageGetItem('hadith-show-explanation');
    return saved !== 'false';
  });

  const [readingMode, setReadingMode] = useState<'scroll' | 'focus'>(() => {
    if (settings.hadithViewMode === 'single') return 'focus';
    if (settings.hadithViewMode === 'list') return 'scroll';
    return (safeLocalStorageGetItem('hadith-reading-mode') as 'scroll' | 'focus') || 'focus';
  });

  const [focusIndex, setFocusIndex] = useState<number>(0);

  const [fontWeight, setFontWeight] = useState<'normal' | 'semibold' | 'bold' | 'extrabold'>(() => {
    return (safeLocalStorageGetItem('hadith-font-weight') as any) || 'extrabold';
  });

  const handleUpdateSpeechRate = (rate: number) => {
    setSpeechRate(rate);
    safeLocalStorageSetItem('hadith-speech-rate', String(rate));
  };

  const handleToggleExplanation = () => {
    setShowExplanation(prev => {
      const newVal = !prev;
      safeLocalStorageSetItem('hadith-show-explanation', String(newVal));
      return newVal;
    });
  };

  const handleUpdateReadingMode = (mode: 'scroll' | 'focus') => {
    setReadingMode(mode);
    safeLocalStorageSetItem('hadith-reading-mode', mode);
    updateSettings({ hadithViewMode: mode === 'focus' ? 'single' : 'list' });
    setFocusIndex(0); // Reset index
  };

  const handleUpdateFontWeight = (weight: 'normal' | 'semibold' | 'bold' | 'extrabold') => {
    setFontWeight(weight);
    safeLocalStorageSetItem('hadith-font-weight', weight);
  };

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = safeLocalStorageGetItem('hadith-favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // States for fetching extra hadiths (Tongue Evils & Patience)
  const [apiHadiths, setApiHadiths] = useState<any[]>([]);
  const [apiLoading, setApiLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [sliderIndex, setSliderIndex] = useState<number>(0);
  const [sliderAutoplay, setSliderAutoplay] = useState<boolean>(true);
  const [filterCategory, setFilterCategory] = useState<string>('all'); // 'all' | 'tongue' | 'patience'

  React.useEffect(() => {
    if (categoryId === 'fadael') {
      setApiLoading(true);
      fetch('/api/hadiths/tongue-and-patience')
        .then(res => {
          if (!res.ok) throw new Error('فشل جلب الأحاديث الإضافية');
          return res.json();
        })
        .then(res => {
          if (res.status === 'success' && Array.isArray(res.data)) {
            setApiHadiths(res.data);
          } else {
            throw new Error('تنسيق البيانات غير صحيح');
          }
          setApiLoading(false);
        })
        .catch(err => {
          console.error(err);
          setApiError(err.message || 'حدث خطأ أثناء تحميل الأحاديث');
          setApiLoading(false);
        });
    }
  }, [categoryId]);

  React.useEffect(() => {
    if (sliderAutoplay && apiHadiths.length > 0 && categoryId === 'fadael') {
      const filteredCount = filterCategory === 'all' 
        ? apiHadiths.length 
        : apiHadiths.filter((h: any) => h.category === filterCategory).length;
        
      if (filteredCount <= 1) return;
      
      const interval = setInterval(() => {
        setSliderIndex(prev => (prev + 1) % filteredCount);
      }, 7000); // changes every 7 seconds
      
      return () => clearInterval(interval);
    }
  }, [sliderAutoplay, apiHadiths, filterCategory, categoryId]);

  const handleCategoryFilter = (cat: string) => {
    setFilterCategory(cat);
    setSliderIndex(0);
  };

  const toggleFavorite = (uniqueId: string) => {
    setFavorites(prev => {
      let newFavs;
      if (prev.includes(uniqueId)) {
        newFavs = prev.filter(f => f !== uniqueId);
      } else {
        newFavs = [...prev, uniqueId];
      }
      safeLocalStorageSetItem('hadith-favorites', JSON.stringify(newFavs));
      return newFavs;
    });
  };

  const handleUpdateHadithFontSize = (dir: 'inc' | 'dec') => {
    setHadithFontSize(prev => {
      const newVal = dir === 'inc' ? Math.min(prev + 2, 40) : Math.max(prev - 2, 14);
      safeLocalStorageSetItem('hadith-font-size', String(newVal));
      return newVal;
    });
  };

  const handleSpeakHadith = (text: string, id: string | number) => {
    if ('speechSynthesis' in window) {
      if (hadithPlayingId === id) {
        window.speechSynthesis.cancel();
        setHadithPlayingId(null);
      } else {
        window.speechSynthesis.cancel();
        const cleanText = text.replace(/["“”«»()]/g, '');
        const utterance = new SpeechSynthesisUtterance(`قال رسول الله صلى الله عليه وسلم: ${cleanText}`);
        utterance.lang = 'ar-SA';
        utterance.rate = speechRate;
        
        const voices = window.speechSynthesis.getVoices();
        const arabicVoice = voices.find(v => v.lang.startsWith('ar')) || voices[0];
        if (arabicVoice) {
          utterance.voice = arabicVoice;
        }

        utterance.onend = () => setHadithPlayingId(null);
        utterance.onerror = () => setHadithPlayingId(null);

        setHadithPlayingId(id);
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  const handleDownload = async (elementId: string, filename: string) => {
    const el = document.getElementById(elementId);
    if (!el) return;
    setDownloadingId(elementId);
    try {
      await new Promise(resolve => setTimeout(resolve, 120));
      const dataUrl = await toPng(el, {
        cacheBust: true,
        style: {
          transform: 'scale(1)',
          borderRadius: '24px'
        },
        pixelRatio: 2,
        filter: (node) => {
          if (node.nodeType === 1) {
            return !(node as Element).hasAttribute('data-html2canvas-ignore');
          }
          return true;
        }
      });
      const link = document.createElement('a');
      link.download = `${filename}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export image:', err);
    } finally {
      setDownloadingId(null);
    }
  };

  React.useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const staticData = categoryId && hadithCollections[categoryId] ? hadithCollections[categoryId] : null;
  
  // Use localStorage cache to guarantee instant offline loading
  const data = React.useMemo(() => {
    if (staticData) return staticData;
    if (!categoryId) return null;
    try {
      const cached = safeLocalStorageGetItem(`hadith_cache_${categoryId}`);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  }, [categoryId, staticData]);

  React.useEffect(() => {
    if (categoryId && staticData) {
      safeLocalStorageSetItem(`hadith_cache_${categoryId}`, JSON.stringify(staticData));
    }
  }, [categoryId, staticData]);

  // Track daily hadith challenge
  const hasTrackedDailyRef = React.useRef(false);
  React.useEffect(() => {
    if (categoryId === 'daily' && !hasTrackedDailyRef.current) {
      hasTrackedDailyRef.current = true;
      updateSpecificChallenge('daily_hadith', 1);
    }
  }, [categoryId, updateSpecificChallenge]);

  if (!data) return <div className="text-center mt-10">{t('section_not_available', 'القسم غير متوفر حالياً')}</div>;

  const isGrouped = !(!data.subCategories);
  
  // Synchronously compute the valid active tab to prevent empty state flashes
  const currentTab = isGrouped 
    ? (activeTab && data.subCategories[activeTab] ? activeTab : Object.keys(data.subCategories)[0]) 
    : '';

  // Still update the state if it's out of sync
  React.useEffect(() => {
    if (isGrouped && activeTab !== currentTab) {
      setActiveTab(currentTab);
    }
  }, [isGrouped, activeTab, currentTab]);

  const activeData = isGrouped ? data.subCategories[currentTab] : data;
  const rawItems = activeData.items || [];
  const items = rawItems.filter((item: any) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      item.title?.toLowerCase().includes(term) ||
      item.text?.toLowerCase().includes(term) ||
      item.explanation?.toLowerCase().includes(term) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(term))
    );
  });
  
  // Safely clamp focusIndex
  React.useEffect(() => {
    if (focusIndex >= items.length && items.length > 0) {
      setFocusIndex(items.length - 1);
    } else if (items.length === 0 && focusIndex !== 0) {
      setFocusIndex(0);
    }
  }, [items.length, focusIndex]);

  // Keyboard navigation for single card mode
  React.useEffect(() => {
    if (readingMode !== 'focus') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['input', 'textarea'].includes((document.activeElement?.tagName || '').toLowerCase())) return;
      if (e.key === 'ArrowLeft') {
        if (isRtl) {
          if (focusIndex < items.length - 1) {
            setSlideDirection('forward');
            setFocusIndex(prev => prev + 1);
            triggerHaptic('light');
          }
        } else {
          if (focusIndex > 0) {
            setSlideDirection('backward');
            setFocusIndex(prev => prev - 1);
            triggerHaptic('light');
          }
        }
      } else if (e.key === 'ArrowRight') {
        if (isRtl) {
          if (focusIndex > 0) {
            setSlideDirection('backward');
            setFocusIndex(prev => prev - 1);
            triggerHaptic('light');
          }
        } else {
          if (focusIndex < items.length - 1) {
            setSlideDirection('forward');
            setFocusIndex(prev => prev + 1);
            triggerHaptic('light');
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [readingMode, focusIndex, items.length, isRtl]);
  
  React.useEffect(() => {
    let timeout: any;
    if (items.length === 0) {
      timeout = setTimeout(() => setShowEmpty(true), 300);
    } else {
      setShowEmpty(false);
    }
    return () => clearTimeout(timeout);
  }, [items.length]);
  
  const activeThemeKey = userTheme || data.theme;
  const currentTheme = themeStyles[activeThemeKey] || themeStyles['blue'];

  return (
    <div className="relative min-h-screen pb-4">
      {/* Background Tint - Fixed across entire page */}
      <div className={cn(
        "fixed inset-0 -z-30 transition-colors duration-1000 opacity-[0.03] dark:opacity-[0.07]",
        currentTheme.bg
      )} />

      {/* Ambient Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className={cn(
          "absolute -top-[10%] -right-[10%] w-[50%] h-[50%] rounded-full opacity-[0.08] dark:opacity-[0.12] blur-[120px] transition-colors duration-1000",
          currentTheme.accent
        )} />
        <div className={cn(
          "absolute top-[40%] -left-[10%] w-[40%] h-[40%] rounded-full opacity-[0.05] dark:opacity-[0.1] blur-[100px] transition-colors duration-1000",
          currentTheme.accent
        )} />
      </div>

      <div className="relative z-10 space-y-4">
        {/* Header Container - Fixed Color identity */}
        <div 
          className={cn(
            "relative overflow-hidden rounded-2xl p-5 mb-4 shadow-2xl transition-all duration-300",
            "bg-gradient-to-br", currentTheme.gradient
          )}
        >
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "url('/images/arabesque.png')" }} />
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-black/10 rounded-full blur-2xl" />
          
          <div className="relative z-10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <BackButton fallbackPath="/library" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/30 hidden sm:flex">
                  <BookOpen className="text-white drop-shadow-md" size={20} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight drop-shadow-md">{data.title}</h2>
                  <p className="text-xs font-bold text-white/80 uppercase tracking-widest mt-1">{data.subtitle}</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowSettings(!showSettings)}
              className={cn(
                "p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center",
                showSettings 
                  ? "bg-white/20 border-white/30 text-white" 
                  : "bg-white/10 border-white/10 text-white/90 hover:bg-white/20"
              )}
              title={t('customize_hadith_font', 'تخصيص شكل وحجم الخط الشريف')}
            >
              <Settings2 size={18} className={cn("transition-transform duration-300", showSettings && "rotate-45")} />
            </button>
          </div>

          {/* Collapsible settings workspace */}
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ height: 0, opacity: 0, marginTop: 0 }}
                animate={{ height: 'auto', opacity: 1, marginTop: 16 }}
                exit={{ height: 0, opacity: 0, marginTop: 0 }}
                className="overflow-hidden relative z-10 w-full"
              >
                <div className="bg-white/10 dark:bg-black/30 backdrop-blur-xl p-5 sm:p-6 rounded-[2rem] border border-white/20 space-y-6 shadow-2xl">
                  {/* Title of settings with elegant badge */}
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-white/15 border border-white/10 text-amber-300">
                        <Sliders size={16} className="animate-pulse" />
                      </div>
                      <span className="text-sm font-black text-white">{t('customize_reading_niche', 'تخصيص محراب القراءة والتدبر:')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black tracking-widest text-amber-300 bg-white/10 px-2.5 py-1 rounded-full uppercase border border-white/5 hidden sm:block">
                        {t('control_panel_hadith', 'لوحة التحكم الشريفة')}
                      </span>
                      <button
                        onClick={() => setShowSettings(false)}
                        className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                        title={t('close', 'إغلاق')}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Custom Font Family Selector */}
                    <div className="relative flex flex-col gap-2 bg-white/5 border border-white/10 p-3.5 rounded-2xl transition-all hover:bg-white/10">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-white/95 select-none whitespace-nowrap flex items-center gap-1.5">
                          <Type size={14} className="text-amber-300" />
                          {t('font_type_label', 'نوع الخط الشريف:')}
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsFontDropdownOpen(!isFontDropdownOpen)}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-black/30 hover:bg-black/45 text-white text-xs font-black transition cursor-pointer border border-white/10 shadow-sm"
                          style={{ fontFamily: getHadithFontFamily(hadithFont) }}
                        >
                          <span>{AVAILABLE_FONTS.find(f => f.id === hadithFont)?.name || hadithFont}</span>
                          <ChevronDown size={14} className={cn("transition-transform duration-300 text-amber-300", isFontDropdownOpen && "rotate-180")} />
                        </button>
                      </div>

                      <AnimatePresence>
                        {isFontDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -8, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, y: -8, height: 0 }}
                            className="overflow-hidden mt-1.5 pt-2.5 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 gap-1.5"
                          >
                            {AVAILABLE_FONTS.map((f) => {
                              const isSelected = hadithFont === f.id;
                              return (
                                <button
                                  key={f.id}
                                  type="button"
                                  onClick={() => {
                                    handleUpdateHadithFont(f.id);
                                    setIsFontDropdownOpen(false);
                                  }}
                                  className={cn(
                                    "px-2.5 py-2 text-[11px] text-center rounded-xl transition cursor-pointer font-bold select-none truncate",
                                    isSelected 
                                      ? "bg-white text-slate-900 shadow-md border border-amber-400 font-black scale-102" 
                                      : "bg-black/20 text-white/90 hover:bg-black/35 border border-white/5"
                                  )}
                                  style={{ fontFamily: getHadithFontFamily(f.id) }}
                                >
                                  {f.name}
                                </button>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Modern Font Size Controls */}
                    <div className="flex flex-col gap-2 bg-white/5 border border-white/10 p-3.5 rounded-2xl transition-all hover:bg-white/10">
                      <span className="text-xs font-black text-white/95 select-none whitespace-nowrap flex items-center gap-1.5">
                        <Type size={14} className="text-amber-300" />
                        {t('font_size_label', 'حجم وتكبير الكلمات الشريفة:')}
                      </span>
                      <div className="flex items-center justify-between gap-4 h-full">
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button 
                            type="button"
                            onClick={() => handleUpdateHadithFontSize('dec')}
                            disabled={hadithFontSize <= 14}
                            className="w-9 h-9 rounded-xl bg-black/30 hover:bg-black/45 text-white flex items-center justify-center font-bold transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed select-none border border-white/10 active:scale-95"
                            title={t('decrease_font', 'تصغير الخط')}
                          >
                            <Minus size={14} strokeWidth={2.5} />
                          </button>
                          
                          <span className="font-mono text-sm text-amber-300 font-black w-12 text-center select-none bg-black/20 py-1 px-2 rounded-lg border border-white/5">{hadithFontSize}px</span>
                          
                          <button 
                            type="button"
                            onClick={() => handleUpdateHadithFontSize('inc')}
                            disabled={hadithFontSize >= 42}
                            className="w-9 h-9 rounded-xl bg-black/30 hover:bg-black/45 text-white flex items-center justify-center font-bold transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed select-none border border-white/10 active:scale-95"
                            title={t('increase_font', 'تكبير الخط')}
                          >
                            <Plus size={14} strokeWidth={2.5} />
                          </button>
                        </div>

                        {/* Visual indicator of size */}
                        <div className="flex-1 flex gap-0.5 items-end justify-center h-5 opacity-80 max-w-[120px] mx-auto">
                          {Array.from({ length: 9 }).map((_, i) => {
                            const stepSize = 14 + i * 3.5;
                            const isActive = hadithFontSize >= stepSize;
                            return (
                              <div 
                                key={i} 
                                className={cn(
                                  "w-1 rounded-t-full transition-all duration-300", 
                                  isActive ? "bg-amber-400" : "bg-white/10"
                                )}
                                style={{ height: `${20 + i * 10}%` }}
                              />
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Modern Reading Mode - Dedicated Cards */}
                    <div className="flex flex-col gap-2.5 bg-white/5 border border-white/10 p-3.5 rounded-2xl transition-all hover:bg-white/10 md:col-span-2">
                      <span className="text-xs font-black text-white/95 select-none whitespace-nowrap flex items-center gap-1.5">
                        <FileText size={14} className="text-amber-300" />
                        {t('hadith_display_focus_mode', 'طريقة عرض الأحاديث والتركيز')}
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() => {
                            triggerHaptic('light');
                            handleUpdateReadingMode('scroll');
                          }}
                          className={cn(
                            "p-3.5 rounded-2xl border text-right transition-all cursor-pointer flex flex-col gap-1 select-none relative overflow-hidden",
                            readingMode === 'scroll' 
                              ? "bg-white text-slate-900 border-amber-400 shadow-lg scale-[1.01]" 
                              : "bg-black/25 text-white/90 hover:bg-black/40 border-white/10"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span className={cn("text-xs font-black flex items-center gap-1.5", readingMode === 'scroll' ? "text-slate-900" : "text-white")}>
                              <Layers size={15} className={readingMode === 'scroll' ? "text-amber-600" : "text-amber-300"} />
                              {t('continuous_list_mode', 'قائمة متتالية')}
                            </span>
                            {readingMode === 'scroll' && (
                              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                            )}
                          </div>
                          <span className={cn("text-[11px] font-bold", readingMode === 'scroll' ? "text-slate-600" : "text-white/60")}>
                            {t('continuous_list_desc', 'عرض الأحاديث تحت بعضها')}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            triggerHaptic('light');
                            handleUpdateReadingMode('focus');
                          }}
                          className={cn(
                            "p-3.5 rounded-2xl border text-right transition-all cursor-pointer flex flex-col gap-1 select-none relative overflow-hidden",
                            readingMode === 'focus' 
                              ? "bg-white text-slate-900 border-amber-400 shadow-lg scale-[1.01]" 
                              : "bg-black/25 text-white/90 hover:bg-black/40 border-white/10"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span className={cn("text-xs font-black flex items-center gap-1.5", readingMode === 'focus' ? "text-slate-900" : "text-white")}>
                              <Square size={15} className={readingMode === 'focus' ? "text-amber-600" : "text-amber-300"} />
                              {t('single_card_mode', 'بطاقة منفردة')}
                            </span>
                            {readingMode === 'focus' && (
                              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                            )}
                          </div>
                          <span className={cn("text-[11px] font-bold", readingMode === 'focus' ? "text-slate-600" : "text-white/60")}>
                            {t('single_card_desc', 'وضع التركيز (بطاقة تلو الأخرى)')}
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Modern Font Weight Segmented Tabs */}
                    <div className="flex flex-col gap-2.5 bg-white/5 border border-white/10 p-3.5 rounded-2xl transition-all hover:bg-white/10">
                      <span className="text-xs font-black text-white/95 select-none whitespace-nowrap flex items-center gap-1.5">
                        <Sliders size={14} className="text-amber-300" />
                        {t('font_weight_label', 'سُمك وبروز الكلمات:')}
                      </span>
                      <div className="grid grid-cols-4 gap-1 bg-black/30 p-1 rounded-xl border border-white/5 h-11 items-center">
                        {[
                          { key: 'normal', label: t('weight_normal', 'عادي') },
                          { key: 'semibold', label: t('weight_medium', 'متوسط') },
                          { key: 'bold', label: t('weight_bold', 'عريض') },
                          { key: 'extrabold', label: t('weight_featured', 'مميّز') }
                        ].map((w) => {
                          const isSelected = fontWeight === w.key;
                          return (
                            <button
                              key={w.key}
                              type="button"
                              onClick={() => handleUpdateFontWeight(w.key as any)}
                              className={cn(
                                "h-full rounded-lg text-[10px] font-black transition-all cursor-pointer text-center flex items-center justify-center select-none",
                                isSelected 
                                  ? "bg-white text-slate-900 shadow-md" 
                                  : "text-white/70 hover:text-white hover:bg-white/5"
                              )}
                            >
                              {w.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Modern Speech Rate Control */}
                    <div className="flex flex-col gap-2.5 bg-white/5 border border-white/10 p-3.5 rounded-2xl transition-all hover:bg-white/10">
                      <span className="text-xs font-black text-white/95 select-none whitespace-nowrap flex items-center gap-1.5">
                        <Volume2 size={14} className="text-amber-300" />
                        {t('recitation_speed', 'سرعة التلاوة الصوتية:')}
                      </span>
                      <div className="grid grid-cols-4 gap-1 bg-black/30 p-1 rounded-xl border border-white/5 h-11 items-center">
                        {[0.8, 1.0, 1.2, 1.4].map((rate) => {
                          const isSelected = speechRate === rate;
                          return (
                            <button
                              key={rate}
                              type="button"
                              onClick={() => handleUpdateSpeechRate(rate)}
                              className={cn(
                                "h-full rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer text-center flex items-center justify-center select-none",
                                isSelected 
                                  ? "bg-white text-slate-900 shadow-md" 
                                  : "text-white/70 hover:text-white hover:bg-white/5"
                              )}
                            >
                              {rate === 1.0 ? t('speed_normal', 'طبيعي') : `${rate}x`}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Modern Explanation Toggle with visual switch */}
                    <div className="flex flex-col gap-2.5 bg-white/5 border border-white/10 p-3.5 rounded-2xl transition-all hover:bg-white/10">
                      <span className="text-xs font-black text-white/95 select-none whitespace-nowrap flex items-center gap-1.5">
                        <Sparkles size={14} className="text-amber-300" />
                        {t('hadith_benefits_title', 'فوائد وتوجيهات الحديث:')}
                      </span>
                      <div className="flex items-center justify-between gap-3 bg-black/30 p-2 rounded-xl border border-white/5 h-11">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <div className={cn(
                            "w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-colors shrink-0",
                            showExplanation ? "bg-amber-400/20 text-amber-300" : "bg-white/5 text-white/40"
                          )}>
                            {showExplanation ? <Eye size={13} /> : <EyeOff size={13} />}
                          </div>
                          <span className="text-[11px] font-bold text-white/80 select-none truncate">
                            {showExplanation ? t('show_benefits_lessons', 'عرض التوجيه والدرس العملي') : t('hide_benefits_lessons', 'إخفاء الفوائد والدروس')}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleToggleExplanation}
                          className={cn(
                            "relative w-11 h-6 rounded-full transition-colors duration-300 cursor-pointer focus:outline-none shrink-0",
                            showExplanation ? "bg-amber-400" : "bg-white/20"
                          )}
                        >
                          <motion.div 
                            layout
                            className="w-4 h-4 rounded-full bg-slate-900 absolute top-1"
                            animate={{ left: showExplanation ? '22px' : '4px' }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          />
                        </button>
                      </div>
                    </div>

                  </div>

                  {/* Elegant Theme selector with gorgeous color bubbles */}
                  <div className="flex flex-col gap-2 bg-white/5 border border-white/10 p-3.5 rounded-2xl transition-all hover:bg-white/10">
                    <span className="text-xs font-black text-white/95 select-none whitespace-nowrap flex items-center gap-1.5">
                      <Sparkles size={14} className="text-amber-300" />
                      {t('hadith_halo_color', 'لون هالة بطاقات الأحاديث:')}
                    </span>
                    <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar py-1">
                      {Object.entries(themeStyles).map(([key, themeSettings]) => {
                        const isSelected = activeThemeKey === key;
                        return (
                          <button
                            key={key}
                            onClick={() => handleUpdateTheme(key)}
                            className={cn(
                              "w-8 h-8 rounded-full cursor-pointer transition-all duration-300 ring-offset-2 ring-offset-transparent outline-none flex items-center justify-center relative shadow-md shrink-0 hover:scale-110 active:scale-95",
                              themeSettings.bg,
                              isSelected ? "ring-2 ring-white scale-110 shadow-lg" : "opacity-60 hover:opacity-100"
                            )}
                            title={key}
                          >
                            {isSelected && <Check size={14} className="text-white drop-shadow-md font-black" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Explicit large close button at the bottom of the panel */}
                  <div className="pt-2">
                    <button
                      onClick={() => setShowSettings(false)}
                      className="w-full py-3 rounded-xl font-black text-sm bg-white/10 hover:bg-rose-500/80 text-white border border-white/20 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-rose-500/20 active:scale-[0.98]"
                    >
                      <X size={18} />
                      <span>{t('close_settings', 'إغلاق لوحة الإعدادات')}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {(() => {
          if (categoryId !== 'fadael') return null;
          const filteredHadiths = apiHadiths.filter((hadith: any) => {
            if (filterCategory === 'all') return true;
            return hadith.category === filterCategory;
          });
          const activeIndex = sliderIndex >= filteredHadiths.length ? 0 : sliderIndex;
          const currentSlide = filteredHadiths[activeIndex];

          return (
            <div className="relative overflow-hidden rounded-[2.2rem] p-5 sm:p-6 mb-6 shadow-2xl border-2 border-amber-500/10 dark:border-amber-500/20 bg-slate-900/60 dark:bg-slate-950/75 text-white transition-all duration-300">
              {/* Ambient gold glow in background */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none mix-blend-overlay" style={{ backgroundImage: "url('/images/arabesque.png')" }} />
              
              {/* Title / Header of the Slider Section */}
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                    <Sparkles className="text-white animate-pulse" size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-amber-200">{t('prophetic_wisdom_gardens', 'رياض الحكمة النبوية الشريفة')}</h3>
                    <p className="text-[11px] font-bold text-white/60 mt-0.5">{t('tongue_evils_and_patience', 'آفات اللسان ودرجات الصبر والاحتساب (مستدعاة من واجهة برمجية موثوقة)')}</p>
                  </div>
                </div>

                {/* Category Filter Chips */}
                <div className="flex flex-wrap gap-1.5 bg-black/40 p-1 rounded-xl border border-white/5 self-start md:self-auto">
                  {[
                    { key: 'all', label: t('all', 'الكل') },
                    { key: 'tongue', label: t('tongue_evils', 'آفات اللسان') },
                    { key: 'patience', label: t('degrees_of_patience', 'درجات الصبر') }
                  ].map((cat) => {
                    const isActive = filterCategory === cat.key;
                    return (
                      <button
                        key={cat.key}
                        onClick={() => handleCategoryFilter(cat.key)}
                        className={cn(
                          "px-3.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer whitespace-nowrap",
                          isActive
                            ? "bg-amber-400 text-slate-950 font-black shadow-md scale-102"
                            : "text-white/75 hover:text-white hover:bg-white/5"
                        )}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Slider Content Area */}
              {apiLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Loader2 className="animate-spin text-amber-400 mb-3" size={32} />
                  <p className="text-xs font-black text-white/70">{t('fetching_extra_hadiths', 'جاري استدعاء الأحاديث الإضافية عبر الواجهة البرمجية...')}</p>
                </div>
              ) : apiError ? (
                <div className="p-6 text-center bg-red-500/10 border border-red-500/20 rounded-2xl">
                  <p className="text-sm font-black text-red-300">{t('error_loading_data', 'حدث خطأ أثناء تحميل البيانات')}</p>
                  <p className="text-[11px] text-white/50 mt-1">{apiError}</p>
                </div>
              ) : filteredHadiths.length === 0 ? (
                <div className="p-10 text-center bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-sm font-black text-white/60">{t('no_matching_hadiths_cat', 'لا توجد أحاديث مطابقة للتصنيف حالياً')}</p>
                </div>
              ) : (
                <div className="relative z-10">
                  <AnimatePresence mode="wait">
                    {currentSlide && (
                      <motion.div
                        key={`${filterCategory}_${currentSlide.id}`}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        whileTap={{ scale: 0.98 }}
                        whileHover={{ scale: 1.005 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        onClick={() => triggerHaptic('light')}
                        className="w-full cursor-pointer"
                      >
                        {/* Active Slide Card */}
                        <div className="relative p-5 sm:p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-950/90 shadow-inner overflow-hidden">
                          
                          {/* Slide Top bar */}
                          <div className="flex items-center justify-between gap-3 mb-4">
                            <span className={cn(
                              "px-3 py-1 rounded-full text-[10px] font-black tracking-wide border shadow-sm",
                              currentSlide.category === 'tongue'
                                ? "bg-rose-400/20 text-rose-300 border-rose-500/30"
                                : "bg-emerald-400/20 text-emerald-300 border-emerald-500/30"
                            )}>
                              {currentSlide.categoryLabel}
                            </span>

                            {/* Quick Actions (Fav, Voice, Copy, Share) */}
                            <div className="flex items-center gap-1.5 z-20">
                              {/* Favorite */}
                              {(() => {
                                const uniqueId = `fadael_api_${currentSlide.id}`;
                                const isFav = favorites.includes(uniqueId);
                                return (
                                  <button
                                    onClick={() => toggleFavorite(uniqueId)}
                                    className={cn(
                                      "p-1.5 rounded-full transition-all duration-300 active:scale-90 shadow-sm border flex items-center justify-center cursor-pointer",
                                      isFav
                                        ? "bg-amber-400 border-amber-400 text-slate-950 hover:bg-amber-300"
                                        : "bg-white/5 hover:bg-white/10 border-white/10 text-white"
                                    )}
                                    title={isFav ? t('remove_from_favorites', 'إزالة من المفضلة') : t('add_to_favorites', 'إضافة للمفضلة')}
                                  >
                                    <Star size={13} strokeWidth={isFav ? 0 : 3} className={isFav ? "fill-slate-950" : ""} />
                                  </button>
                                );
                              })()}

                              {/* Voice Speak */}
                              {(() => {
                                const uniquePlayId = `api_${currentSlide.id}`;
                                const isPlaying = hadithPlayingId === uniquePlayId;
                                return (
                                  <button
                                    onClick={() => handleSpeakHadith(currentSlide.text, uniquePlayId)}
                                    className={cn(
                                      "p-1.5 rounded-full transition-all duration-300 active:scale-90 shadow-sm border flex items-center justify-center cursor-pointer",
                                      isPlaying
                                        ? "bg-white text-slate-950 border-white shadow-md"
                                        : "bg-white/5 hover:bg-white/10 border-white/10 text-white"
                                    )}
                                    title={isPlaying ? t('audio_stop', 'إيقاف الصوت') : t('listen_to_hadith', 'استمع للحديث الشريف')}
                                  >
                                    {isPlaying ? (
                                      <span className="flex items-center justify-center relative w-3.5 h-3.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                        <Pause size={13} strokeWidth={3} className="relative z-10" />
                                      </span>
                                    ) : (
                                      <Volume2 size={13} strokeWidth={3} />
                                    )}
                                  </button>
                                );
                              })()}

                              {/* Copy/Share */}
                              {(() => {
                                const uniqueCopyId = `api_${currentSlide.id}`;
                                const isCopied = hadithCopiedId === uniqueCopyId;
                                return (
                                  <button
                                    onClick={async () => {
                                      const textToCopy = `✨ *${currentSlide.title}* [${currentSlide.categoryLabel}] ✨\n\n"${currentSlide.text}"\n\n📖 المصدر: ${currentSlide.source}\n—\nتمت المشاركة من تطبيق أذكار المؤمن`;
                                      await shareContent(currentSlide.title, textToCopy, window.location.href);
                                      setHadithCopiedId(uniqueCopyId);
                                      setTimeout(() => setHadithCopiedId(null), 2000);
                                    }}
                                    className={cn(
                                      "p-1.5 rounded-full transition-all duration-300 active:scale-90 shadow-sm border flex items-center justify-center cursor-pointer",
                                      isCopied
                                        ? "bg-emerald-400 border-emerald-400 text-slate-950"
                                        : "bg-white/5 hover:bg-white/10 border-white/10 text-white"
                                    )}
                                    title={t('share', 'مشاركة الحديث')}
                                  >
                                    {isCopied ? <Check size={13} strokeWidth={3} /> : <Share2 size={13} strokeWidth={3} />}
                                  </button>
                                );
                              })()}
                            </div>
                          </div>

                          {/* Slide Title */}
                          <h4 className="text-md sm:text-lg font-black text-white leading-tight mb-2 flex items-center gap-2">
                            <span className="w-1.5 h-4 rounded-full bg-amber-400" />
                            {currentSlide.title}
                          </h4>

                          {/* Hadith Text Box */}
                          <div className="relative my-3">
                            <span className="absolute -top-6 -right-2 text-6xl font-serif opacity-[0.1] leading-none select-none pointer-events-none">«</span>
                            <p
                              className={cn(
                                "block text-right w-full leading-[1.7] px-1 relative z-10 transition-all text-amber-50/95",
                                fontWeight === 'normal' ? 'font-normal' :
                                fontWeight === 'semibold' ? 'font-semibold' :
                                fontWeight === 'bold' ? 'font-bold' : 'font-extrabold'
                              )}
                              style={{ fontFamily: getHadithFontFamily(hadithFont), fontSize: `${hadithFontSize - 2}px` }}
                            >
                              {currentSlide.text}
                            </p>
                          </div>

                          {/* Hadith Source */}
                          <div className="text-[10px] sm:text-xs text-white/50 font-bold mb-3 select-none text-left" dir="ltr">
                            — {currentSlide.source}
                          </div>

                          {/* Hadith Explanation Card */}
                          {currentSlide.explanation && showExplanation && (
                            <div className="mt-3 p-3 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-inner relative overflow-hidden">
                              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-white/5 to-transparent rounded-bl-2xl pointer-events-none" />
                              <div className="flex items-start gap-2">
                                <div className="mt-0.5 shrink-0 p-1 rounded-lg bg-white/10 text-amber-300">
                                  <Sparkles size={11} className="animate-pulse" />
                                </div>
                                <div className="text-right flex-1">
                                  <h5 className="text-[9px] font-black text-amber-300 mb-0.5 select-none">{t('hadith_faith_impact', 'الفائدة والأثر الإيماني:')}</h5>
                                  <p className="text-[11px] sm:text-[12px] leading-relaxed font-bold text-white/90">
                                    {currentSlide.explanation}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Slider Controls (Arrows and dots) */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 pt-3 border-t border-white/10">
                    
                    {/* Prev/Next buttons */}
                    <div className="flex items-center gap-2 order-2 sm:order-1">
                      <button
                        onClick={() => setSliderIndex(prev => (prev - 1 + filteredHadiths.length) % filteredHadiths.length)}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white transition active:scale-95 flex items-center justify-center cursor-pointer"
                        title={t('previous_hadith', 'الحديث السابق')}
                      >
                        <ChevronRight size={16} />
                      </button>
                      
                      <span className="text-[11px] font-black text-white/60 min-w-[60px] text-center">
                        {activeIndex + 1} / {filteredHadiths.length}
                      </span>

                      <button
                        onClick={() => setSliderIndex(prev => (prev + 1) % filteredHadiths.length)}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white transition active:scale-95 flex items-center justify-center cursor-pointer"
                        title={t('next_hadith', 'الحديث التالي')}
                      >
                        <ChevronLeft size={16} />
                      </button>
                    </div>

                    {/* Bullet Indicators */}
                    <div className="flex items-center gap-1.5 overflow-x-auto max-w-full px-2 py-1 shrink-0 order-1 sm:order-2 hide-scrollbar">
                      {filteredHadiths.map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setSliderIndex(i)}
                          className={cn(
                            "w-1.5 h-1.5 rounded-full transition-all duration-300 shrink-0 cursor-pointer",
                            activeIndex === i 
                              ? "w-4 bg-amber-400" 
                              : "bg-white/20 hover:bg-white/40"
                          )}
                          title={`الذهاب للشريحة ${i + 1}`}
                        />
                      ))}
                    </div>

                    {/* Autoplay toggle switch */}
                    <div className="flex items-center gap-2 order-3">
                      <span className="text-[10px] font-black text-white/50 select-none">{t('autoplay', 'تشغيل تلقائي')}</span>
                      <button
                        onClick={() => setSliderAutoplay(!sliderAutoplay)}
                        className={cn(
                          "relative w-9 h-5 rounded-full transition-colors duration-300 cursor-pointer focus:outline-none shrink-0",
                          sliderAutoplay ? "bg-amber-400" : "bg-white/15"
                        )}
                      >
                        <motion.div 
                          layout
                          className="w-3.5 h-3.5 rounded-full bg-slate-900 absolute top-0.75"
                          animate={{ left: sliderAutoplay ? '18px' : '3px' }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      </button>
                    </div>

                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {isGrouped && (
          <div className={cn(
            "p-2.5 rounded-[2rem] mb-4 border-2 shadow-[inset_0_2px_4px_rgba(255,255,255,0.4),0_10px_30px_-10px_rgba(0,0,0,0.1)] backdrop-blur-xl transition-all duration-700",
            "bg-white/60 dark:bg-slate-900/60 border-white/80 dark:border-slate-800"
          )}>
            <div className="flex overflow-x-auto hide-scrollbar gap-2 p-1 relative">
              {Object.keys(data.subCategories).map(key => {
                const isActive = currentTab === key;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      setActiveTab(key);
                      setExpandedId(null);
                      setSearchTerm('');
                    }}
                    className={cn(
                      "flex-1 min-w-fit px-6 py-3.5 text-sm font-black rounded-2xl transition-all duration-300 relative whitespace-nowrap overflow-hidden group border",
                      isActive
                        ? cn(
                            "text-white shadow-[0_12px_24px_-8px_rgba(0,0,0,0.25)] translate-y-[-2px] border-transparent bg-gradient-to-br",
                            currentTheme.gradient
                          )
                        : "text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white hover:bg-white/80 dark:hover:bg-slate-800/80 border-transparent bg-transparent"
                    )}
                  >
                    <span className={cn(
                      "relative z-10 flex items-center justify-center gap-2 transition-transform duration-300",
                      isActive ? "scale-105 drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]" : "scale-100 group-hover:scale-105"
                    )}>
                      {isActive && <Sparkles size={16} className="text-amber-300 animate-pulse" />}
                      {data.subCategories[key].title}
                    </span>
                    {isActive && (
                      <motion.div
                        layoutId="activeTabBg"
                        className="absolute inset-0 bg-white/10 pointer-events-none"
                      />
                    )}
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, scaleX: 0 }}
                        animate={{ opacity: 1, scaleX: 1 }}
                        className="absolute -bottom-0 left-1/2 -translate-x-1/2 w-12 h-1.5 rounded-t-full bg-white/40"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick View Mode Switcher Pill (Continuous List vs Single Card) */}
        {items.length > 0 && (
          <div className="flex items-center justify-between gap-3 px-1.5 py-1 mb-3" dir="rtl">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-xs font-black text-slate-700 dark:text-slate-200">
                {items.length} {t('hadith_count_suffix', 'حديث شريف')}
              </span>
            </div>

            <div className="flex items-center gap-1 bg-slate-200/75 dark:bg-slate-800/90 p-1 rounded-2xl border border-slate-300/50 dark:border-slate-700/60 shadow-inner">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  handleUpdateReadingMode('scroll');
                }}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer select-none",
                  readingMode !== 'focus'
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm scale-102"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                )}
                title={t('continuous_list_tooltip', 'عرض الأحاديث في قائمة متتالية')}
              >
                <Layers size={13} className={readingMode !== 'focus' ? "text-amber-500" : ""} />
                <span>{t('continuous_list', 'قائمة متتالية')}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  handleUpdateReadingMode('focus');
                }}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer select-none",
                  readingMode === 'focus'
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm scale-102"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                )}
                title={t('single_card_tooltip', 'عرض الأحاديث في بطاقات منفردة')}
              >
                <Square size={13} className={readingMode === 'focus' ? "text-amber-500" : ""} />
                <span>{t('single_card', 'بطاقة منفردة')}</span>
              </button>
            </div>
          </div>
        )}

        {/* Hadith List / Single Card Container */}
        <div className="space-y-4">
          {items.length === 0 ? (
            showEmpty ? (
              <div
                className="flex flex-col items-center justify-center p-12 text-center bg-white/40 dark:bg-slate-800/25 rounded-2xl border-2 border-dashed border-slate-200/65 dark:border-slate-700/50"
              >
                <Search size={40} className="mb-4 text-slate-400 dark:text-slate-500 animate-pulse" />
                <p className="font-black text-lg text-slate-700 dark:text-slate-300">{t('no_search_results', 'لم نجد نتائج للبحث')}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 font-bold max-w-sm leading-relaxed">
                  {t('search_hint', 'حاول البحث بكلمات أخرى، أو تصفح الأقسام والتبويبات المتاحة بالأعلى.')}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 h-40" />
            )
          ) : readingMode === 'focus' ? (
            /* Single Card Focus Mode */
            <div className="w-full flex flex-col items-center">
              <AnimatePresence mode="wait" initial={false}>
                {items[focusIndex] && (() => {
                  const hadith = items[focusIndex];
                  const uniqueId = `${categoryId}_${isGrouped ? currentTab : 'main'}_${hadith.id}`;
                  const isFavorite = favorites.includes(uniqueId);

                  return (
                    <motion.div
                      key={hadith.id}
                      initial={{ opacity: 0, x: slideDirection === 'forward' ? (isRtl ? -30 : 30) : (isRtl ? 30 : -30) }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: slideDirection === 'forward' ? (isRtl ? 30 : -30) : (isRtl ? -30 : 30) }}
                      whileTap={{ scale: 0.98 }}
                      whileHover={{ scale: 1.005 }}
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      onClick={() => triggerHaptic('light')}
                      drag="x"
                      dragDirectionLock={true}
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={{
                        left: (isRtl ? focusIndex > 0 : focusIndex < items.length - 1) ? 0.7 : 0.1,
                        right: (isRtl ? focusIndex < items.length - 1 : focusIndex > 0) ? 0.7 : 0.1
                      }}
                      onDragEnd={(_, { offset, velocity }) => {
                        const swipe = offset.x;
                        const swipeThreshold = 40;
                        const velocityThreshold = 300;

                        if (swipe > swipeThreshold || velocity.x > velocityThreshold) {
                          if (isRtl) {
                            if (focusIndex < items.length - 1) {
                              setSlideDirection('forward');
                              setFocusIndex(prev => prev + 1);
                              triggerHaptic('light');
                            }
                          } else {
                            if (focusIndex > 0) {
                              setSlideDirection('backward');
                              setFocusIndex(prev => prev - 1);
                              triggerHaptic('light');
                            }
                          }
                        } else if (swipe < -swipeThreshold || velocity.x < -velocityThreshold) {
                          if (isRtl) {
                            if (focusIndex > 0) {
                              setSlideDirection('backward');
                              setFocusIndex(prev => prev - 1);
                              triggerHaptic('light');
                            }
                          } else {
                            if (focusIndex < items.length - 1) {
                              setSlideDirection('forward');
                              setFocusIndex(prev => prev + 1);
                              triggerHaptic('light');
                            }
                          }
                        }
                      }}
                      id={`hadith-card-export-${hadith.id}`}
                      className="w-full px-0.5 py-0.5 sm:px-1 sm:py-1 bg-slate-50/50 dark:bg-slate-950/40 rounded-[1.8rem] transition-all duration-300 select-none touch-pan-y"
                    >
                      <div className={cn(
                        "pt-4 px-4 pb-3.5 sm:pt-5 sm:px-6 sm:pb-4.5 rounded-[1.6rem] sm:rounded-[2rem] border-2 shadow-[0_12px_36px_rgba(0,0,0,0.08)] hover:shadow-[0_18px_45px_rgba(0,0,0,0.18)] transition-all duration-400 w-full relative overflow-hidden text-white",
                        "bg-gradient-to-br", currentTheme.gradient, currentTheme.border
                      )}>
                        {/* Artistic Islamic background pattern watermark */}
                        {bgLoaded && <div className="absolute inset-0 opacity-[0.06] dark:opacity-[0.09] pointer-events-none mix-blend-overlay" style={{ backgroundImage: "url('/images/arabesque.png')" }} />}
                        <div className="absolute -top-12 -left-12 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                        <div className="absolute -bottom-10 -right-10 w-44 h-44 bg-black/15 rounded-full blur-2xl pointer-events-none" />

                        <div className="relative z-10 w-full">
                          <div className="flex flex-col gap-1.5 mb-2.5">
                            <div className="flex justify-between items-start gap-4">
                              <h2 className="text-lg sm:text-2xl font-black leading-tight text-white flex items-center gap-2 drop-shadow-sm">
                                <span className="w-2.5 h-6 rounded-full inline-block shrink-0 bg-white/50" />
                                {hadith.title}
                              </h2>
                              <div className="flex items-center gap-1.5 shrink-0 z-20" data-html2canvas-ignore>
                                {/* Favorite */}
                                <button 
                                  onClick={() => toggleFavorite(uniqueId)}
                                  className={cn(
                                    "p-2 rounded-full transition-all duration-300 active:scale-90 shadow-sm border flex items-center justify-center cursor-pointer",
                                    isFavorite 
                                      ? "bg-amber-400 border-amber-400 text-amber-950 hover:bg-amber-300 hover:shadow-md hover:shadow-amber-400/30" 
                                      : "bg-white/10 hover:bg-white/20 border-white/20 hover:border-white/35 text-white"
                                  )}
                                  title={isFavorite ? t('remove_from_favorites', 'إزالة من المفضلة') : t('add_to_favorites', 'إضافة للمفضلة')}
                                >
                                  <Star size={15} strokeWidth={isFavorite ? 0 : 3} className={isFavorite ? "fill-amber-950" : ""} />
                                </button>

                                {/* Speak */}
                                <button 
                                  onClick={() => handleSpeakHadith(hadith.text, hadith.id)}
                                  className={cn(
                                    "p-2 rounded-full transition-all duration-300 active:scale-90 shadow-sm border flex items-center justify-center cursor-pointer",
                                    hadithPlayingId === hadith.id 
                                      ? "bg-white text-slate-900 border-white shadow-md shadow-white/10"
                                      : "bg-white/10 hover:bg-white/20 border-white/20 hover:border-white/35 text-white"
                                  )}
                                  title={hadithPlayingId === hadith.id ? t('audio_stop', 'إيقاف الصوت') : t('listen_to_hadith', 'استمع للحديث')}
                                >
                                  {hadithPlayingId === hadith.id ? (
                                    <span className="flex items-center justify-center relative w-4 h-4">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                      <Pause size={15} strokeWidth={3} className="relative z-10" />
                                    </span>
                                  ) : (
                                    <Volume2 size={15} strokeWidth={3} />
                                  )}
                                </button>

                                {/* Share */}
                                <button 
                                  onClick={async () => {
                                    const textToShare = `✨ *${hadith.title}* ✨\n\n"${hadith.text}"\n\n📖 المصدر: ${hadith.subtitle || 'السنة المطهرة'}\n—\nتمت المشاركة من تطبيق *أذكار المؤمن azkar almumin*\nزيارة التطبيق: ${window.location.origin}`;
                                    await shareContent(hadith.title, textToShare, window.location.href);
                                    setHadithCopiedId(hadith.id);
                                    setTimeout(() => setHadithCopiedId(null), 2000);
                                  }}
                                  className={cn(
                                    "p-2 rounded-full transition-all duration-300 active:scale-90 shadow-sm border flex items-center justify-center cursor-pointer",
                                    hadithCopiedId === hadith.id 
                                      ? "bg-emerald-400 border-emerald-400 text-emerald-950 hover:bg-emerald-350" 
                                      : "bg-white/10 hover:bg-white/20 border-white/20 hover:border-white/35 text-white"
                                  )}
                                  title={t('share', 'مشاركة')}
                                >
                                  {hadithCopiedId === hadith.id ? <Check size={15} strokeWidth={3} /> : <Share2 size={15} strokeWidth={3} />}
                                </button>

                                {/* Download Card Sticker */}
                                <button 
                                  onClick={() => handleDownload(`hadith-card-export-${hadith.id}`, `hadith-${hadith.id}`)}
                                  className={cn(
                                    "p-2 rounded-full transition-all duration-300 active:scale-90 border shadow-sm flex items-center justify-center bg-black/20 border-white/20 text-white hover:bg-black/30 cursor-pointer",
                                    downloadingId === `hadith-card-export-${hadith.id}` ? "opacity-50 cursor-not-allowed" : ""
                                  )}
                                  title={t('download_card_or_sticker', 'تحميل كبطاقة أو ستيكر')}
                                  disabled={downloadingId === `hadith-card-export-${hadith.id}`}
                                >
                                  {downloadingId === `hadith-card-export-${hadith.id}` ? (
                                    <Loader2 size={15} className="animate-spin text-white" />
                                  ) : (
                                    <Download size={15} strokeWidth={3} />
                                  )}
                                </button>
                              </div>
                            </div>

                            {hadith.subtitle && (
                              <span className="text-[10px] sm:text-xs font-black px-3 py-1 rounded-full border w-fit shadow-sm transition-colors tracking-wide bg-white/15 text-white border-white/10">
                                {hadith.subtitle}
                              </span>
                            )}
                          </div>

                          {/* Hadith content with quote decoration */}
                          <div className="w-full my-2.5 sm:my-3 relative">
                            <span className="absolute -top-5 -right-3 text-7xl font-serif select-none pointer-events-none opacity-[0.14] leading-none text-white">«</span>
                            
                            <span 
                              className={cn(
                                "block whitespace-pre-line text-right w-full transition-all duration-500 text-white leading-[1.7] sm:leading-[1.85] px-1 relative z-10",
                                fontWeight === 'normal' ? 'font-normal' :
                                fontWeight === 'semibold' ? 'font-semibold' :
                                fontWeight === 'bold' ? 'font-bold' : 'font-extrabold'
                              )}
                              style={{ fontFamily: getHadithFontFamily(hadithFont), fontSize: `${hadithFontSize}px` }}
                            >
                              {hadith.text}
                            </span>
                          </div>

                          {/* Explanatory section */}
                          {hadith.explanation && showExplanation && (
                            <div className="mt-3.5 p-3 sm:p-3.5 rounded-2xl border border-white/15 transition-colors bg-white/10 dark:bg-black/20 backdrop-blur-sm shadow-inner relative overflow-hidden group/benefit">
                              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-white/5 to-transparent rounded-bl-3xl pointer-events-none" />
                              <div className="flex items-start gap-3">
                                <div className="mt-0.5 shrink-0 p-1.5 rounded-xl bg-white/10 shadow-sm border border-white/10 text-yellow-300">
                                  <Sparkles size={14} className="animate-pulse" />
                                </div>
                                <div className="text-right flex-1">
                                  <h4 className="text-[10px] font-black text-white/80 mb-0.5 select-none">{t('hadith_practical_benefit', 'الفائدة والتوجيه العملي:')}</h4>
                                  <p className="text-[13px] sm:text-[14px] leading-relaxed font-bold text-white/95">
                                    {hadith.explanation}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-xs text-white/60" dir="rtl">
                            <span className="font-rubik font-black italic text-[14px] sm:text-[16px] tracking-wider bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 bg-clip-text text-transparent select-none" style={{ filter: "drop-shadow(1px 1px 0px #047857) drop-shadow(2px 2px 0px #064e3b) drop-shadow(0px 4px 6px rgba(0,0,0,0.6))" }}>أذكار المؤمن</span>
                            <span className="text-[12px] font-bold text-white/85 select-none">{t('hadith_tab', 'حديث نبوي شريف')}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })()}
              </AnimatePresence>

              {/* Modern Single Card Navigation Controller */}
              <div className="w-full flex flex-col items-center gap-3 mt-4" dir="rtl" data-html2canvas-ignore>
                <div className="flex items-center justify-between w-full max-w-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-3 rounded-2xl border border-slate-200/70 dark:border-slate-800 shadow-md">
                  {/* Previous button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (focusIndex > 0) {
                        setSlideDirection('backward');
                        setFocusIndex(prev => prev - 1);
                        triggerHaptic('light');
                      }
                    }}
                    disabled={focusIndex === 0}
                    className={cn(
                      "px-4 py-2.5 rounded-xl border flex items-center gap-1.5 transition-all duration-200 cursor-pointer shadow-sm text-xs font-black select-none",
                      focusIndex === 0
                        ? "bg-slate-100 dark:bg-slate-800/50 text-slate-400 dark:text-slate-600 border-transparent cursor-not-allowed shadow-none"
                        : "bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 border-teal-500/30 hover:border-teal-500 hover:scale-[1.03] active:scale-95"
                    )}
                  >
                    <ChevronRight size={16} strokeWidth={3} />
                    <span>{t('previous', 'السابق')}</span>
                  </button>

                  {/* Center Counter Badge */}
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                      {t('hadith_num_of_total', 'الحديث {{current}} من {{total}}', { current: focusIndex + 1, total: items.length })}
                    </span>
                    {/* Mini Progress Bar */}
                    <div className="w-24 sm:w-32 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-400 to-teal-500 transition-all duration-300 rounded-full"
                        style={{ width: `${((focusIndex + 1) / items.length) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Next button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (focusIndex < items.length - 1) {
                        setSlideDirection('forward');
                        setFocusIndex(prev => prev + 1);
                        triggerHaptic('light');
                      }
                    }}
                    disabled={focusIndex === items.length - 1}
                    className={cn(
                      "px-4 py-2.5 rounded-xl border flex items-center gap-1.5 transition-all duration-200 cursor-pointer shadow-sm text-xs font-black select-none",
                      focusIndex === items.length - 1
                        ? "bg-slate-100 dark:bg-slate-800/50 text-slate-400 dark:text-slate-600 border-transparent cursor-not-allowed shadow-none"
                        : "bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 border-teal-500/30 hover:border-teal-500 hover:scale-[1.03] active:scale-95"
                    )}
                  >
                    <span>{t('next', 'التالي')}</span>
                    <ChevronLeft size={16} strokeWidth={3} />
                  </button>
                </div>

                {/* Small dot indicators */}
                {items.length <= 40 && (
                  <div className="flex items-center gap-1.5 overflow-x-auto max-w-full px-4 py-1.5 hide-scrollbar">
                    {items.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setSlideDirection(i > focusIndex ? 'forward' : 'backward');
                          setFocusIndex(i);
                          triggerHaptic('light');
                        }}
                        className={cn(
                          "h-2 rounded-full transition-all duration-300 shrink-0 cursor-pointer",
                          focusIndex === i 
                            ? "w-6 bg-amber-400 shadow-sm" 
                            : "w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600"
                        )}
                        title={`الذهاب للحديث ${i + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Continuous List Mode */
            items.map((hadith: any) => {
              const uniqueId = `${categoryId}_${isGrouped ? currentTab : 'main'}_${hadith.id}`;
              const isFavorite = favorites.includes(uniqueId);
              
              return (
                <motion.div 
                  id={`hadith-card-export-${hadith.id}`} 
                  key={hadith.id} 
                  whileTap={{ scale: 0.98 }}
                  whileHover={{ scale: 1.006 }}
                  transition={{ type: "spring", stiffness: 400, damping: 22 }}
                  onClick={() => triggerHaptic('light')}
                  className="w-full px-0.5 py-0.5 sm:px-1 sm:py-1 bg-slate-50/50 dark:bg-slate-950/40 rounded-[1.8rem] transition-all duration-300 cursor-pointer"
                >
                  <div className={cn(
                    "pt-3 px-3.5 pb-2.5 sm:pt-4 sm:px-5 sm:pb-3.5 rounded-[1.6rem] sm:rounded-[2rem] border-2 shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.15)] transition-all duration-400 w-full relative overflow-hidden group hover:-translate-y-0.5 text-white",
                    "bg-gradient-to-br", currentTheme.gradient, currentTheme.border
                  )}>
                    
                    {/* Artistic Islamic background pattern watermark */}
                    {bgLoaded && <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.08] pointer-events-none mix-blend-overlay" style={{ backgroundImage: "url('/images/arabesque.png')" }} />}
                    <div className="absolute -top-12 -left-12 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-black/10 rounded-full blur-2xl pointer-events-none" />
                    
                    <div className="relative z-10 w-full">
                      <div className="flex flex-col gap-1 sm:gap-1.5 mb-2">
                        <div className="flex justify-between items-start gap-4">
                          <h2 className="text-lg sm:text-xl font-black leading-tight text-white flex items-center gap-2 drop-shadow-sm">
                            <span className="w-2 h-5 rounded-full inline-block shrink-0 bg-white/40" />
                            {hadith.title}
                          </h2>
                          <div className="flex items-center gap-1.5 shrink-0 z-20" data-html2canvas-ignore>
                            {/* Favorite */}
                            <button 
                              onClick={() => toggleFavorite(uniqueId)}
                              className={cn(
                                "p-1.5 rounded-full transition-all duration-300 active:scale-90 shadow-sm border flex items-center justify-center cursor-pointer",
                                isFavorite 
                                  ? "bg-amber-400 border-amber-400 text-amber-950 hover:bg-amber-300 hover:shadow-md hover:shadow-amber-400/30" 
                                  : "bg-white/10 hover:bg-white/20 border-white/20 hover:border-white/35 text-white"
                              )}
                              title={isFavorite ? t('remove_from_favorites', 'إزالة من المفضلة') : t('add_to_favorites', 'إضافة للمفضلة')}
                            >
                              <Star size={14} strokeWidth={isFavorite ? 0 : 3} className={isFavorite ? "fill-amber-950" : ""} />
                            </button>

                            {/* Speak */}
                            <button 
                              onClick={() => handleSpeakHadith(hadith.text, hadith.id)}
                              className={cn(
                                "p-1.5 rounded-full transition-all duration-300 active:scale-90 shadow-sm border flex items-center justify-center cursor-pointer hidden sm:flex",
                                hadithPlayingId === hadith.id 
                                  ? "bg-white text-slate-900 border-white shadow-md shadow-white/10"
                                  : "bg-white/10 hover:bg-white/20 border-white/20 hover:border-white/35 text-white"
                              )}
                              title={hadithPlayingId === hadith.id ? t('audio_stop', 'إيقاف الصوت') : t('listen_to_hadith', 'استمع للحديث')}
                            >
                              {hadithPlayingId === hadith.id ? (
                                <span className="flex items-center justify-center relative w-3.5 h-3.5">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                  <Pause size={14} strokeWidth={3} className="relative z-10" />
                                </span>
                              ) : (
                                <Volume2 size={14} strokeWidth={3} />
                              )}
                            </button>

                            {/* Share */}
                            <button 
                              onClick={async () => {
                                const textToShare = `✨ *${hadith.title}* ✨\n\n"${hadith.text}"\n\n📖 المصدر: ${hadith.subtitle || 'السنة المطهرة'}\n—\nتمت المشاركة من تطبيق *أذكار المؤمن azkar almumin*\nزيارة التطبيق: ${window.location.origin}`;
                                await shareContent(hadith.title, textToShare, window.location.href);
                                setHadithCopiedId(hadith.id);
                                setTimeout(() => setHadithCopiedId(null), 2000);
                              }}
                              className={cn(
                                "p-1.5 rounded-full transition-all duration-300 active:scale-90 shadow-sm border flex items-center justify-center cursor-pointer",
                                hadithCopiedId === hadith.id 
                                  ? "bg-emerald-400 border-emerald-400 text-emerald-950 hover:bg-emerald-350" 
                                  : "bg-white/10 hover:bg-white/20 border-white/20 hover:border-white/35 text-white"
                              )}
                              title={t('share', 'مشاركة')}
                            >
                              {hadithCopiedId === hadith.id ? <Check size={14} strokeWidth={3} /> : <Share2 size={14} strokeWidth={3} />}
                            </button>

                            {/* Download Card Sticker */}
                            <button 
                              onClick={() => handleDownload(`hadith-card-export-${hadith.id}`, `hadith-${hadith.id}`)}
                              className={cn(
                                "p-1.5 rounded-full transition-all duration-300 active:scale-90 border shadow-sm flex items-center justify-center bg-black/20 border-white/20 text-white hover:bg-black/30 cursor-pointer",
                                downloadingId === `hadith-card-export-${hadith.id}` ? "opacity-50 cursor-not-allowed" : ""
                              )}
                              title={t('download_card_or_sticker', 'تحميل كبطاقة أو ستيكر')}
                              disabled={downloadingId === `hadith-card-export-${hadith.id}`}
                            >
                              {downloadingId === `hadith-card-export-${hadith.id}` ? (
                                <Loader2 size={14} className="animate-spin text-white" />
                              ) : (
                                <Download size={14} strokeWidth={3} />
                              )}
                            </button>
                          </div>
                        </div>

                        {hadith.subtitle && (
                          <span className="text-[10px] sm:text-xs font-black px-2.5 py-1 rounded-full border w-fit shadow-sm transition-colors tracking-wide bg-white/15 text-white border-white/10">
                            {hadith.subtitle}
                          </span>
                        )}
                      </div>
                      
                      {/* Hadith content with quote decoration */}
                      <div className="w-full my-1.5 sm:my-2 relative">
                        <span className="absolute -top-5 -right-3 text-7xl font-serif select-none pointer-events-none opacity-[0.12] leading-none text-white">«</span>
                        
                        <span 
                          className={cn(
                            "block whitespace-pre-line text-right w-full transition-all duration-500 text-white leading-[1.65] sm:leading-[1.75] px-1 relative z-10",
                            fontWeight === 'normal' ? 'font-normal' :
                            fontWeight === 'semibold' ? 'font-semibold' :
                            fontWeight === 'bold' ? 'font-bold' : 'font-extrabold'
                          )}
                          style={{ fontFamily: getHadithFontFamily(hadithFont), fontSize: `${hadithFontSize - 1}px` }}
                        >
                          {hadith.text}
                        </span>
                      </div>
                      
                      {/* Explanatory section (smart and elegant callout) */}
                      {hadith.explanation && showExplanation && (
                        <div className="mt-2.5 p-2.5 sm:p-3 rounded-xl border border-white/10 transition-colors bg-white/10 dark:bg-black/15 backdrop-blur-sm shadow-inner relative overflow-hidden group/benefit">
                          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-white/5 to-transparent rounded-bl-3xl pointer-events-none" />
                          <div className="flex items-start gap-2.5">
                            <div className="mt-0.5 shrink-0 p-1 rounded-lg bg-white/10 shadow-sm border border-white/10 text-yellow-300">
                              <Sparkles size={12} className="animate-pulse" />
                            </div>
                            <div className="text-right flex-1">
                              <h4 className="text-[9px] font-black text-white/70 mb-0.5 select-none">{t('hadith_practical_benefit', 'الفائدة والتوجيه العملي:')}</h4>
                              <p className="text-[12px] sm:text-[13px] leading-relaxed font-bold text-white/95">
                                {hadith.explanation}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="mt-2.5 pt-1.5 border-t border-white/10 flex items-center justify-between text-xs text-white/60" dir="rtl">
                        <span className="font-rubik font-black italic text-[13px] sm:text-[15px] tracking-wider bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 bg-clip-text text-transparent select-none" style={{ filter: "drop-shadow(1px 1px 0px #047857) drop-shadow(2px 2px 0px #064e3b) drop-shadow(0px 4px 6px rgba(0,0,0,0.6))" }}>أذكار المؤمن</span>
                        <span className="text-[11px] font-semibold text-white/80 select-none">{t('hadith_tab', 'حديث نبوي شريف')}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
