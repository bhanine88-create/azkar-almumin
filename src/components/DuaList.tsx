import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QURANIC_DUAS, PROPHETIC_DUAS, NAMES_OF_ALLAH_DUAS, RIGHTEOUS_DUAS, SALAWAT_DUAS, Dua } from '../data/duasData';
import { BackButton } from './ui/BackButton';
import { AppIcon } from './ui/AppIcon';
import { cn, copyTextToClipboard, shareContent, triggerHaptic } from '../lib/utils';
import { useTranslation } from '../i18n';
import { useAppContext } from '../AppContext';

import { BookOpen, Sparkles, HandHeart, Heart, SlidersHorizontal, Plus, Minus, Type, Palette, X, Star, Share2, Download, Loader2 } from 'lucide-react';
import { toPng } from 'html-to-image';
import { safeLocalStorageGetItem, safeLocalStorageSetItem, safeLocalStorageRemoveItem } from "../utils/storage";

export const DuaList: React.FC = () => {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const { settings, toggleFavoriteUnified, progress } = useAppContext();
  const { t } = useTranslation(settings?.appLanguage || 'ar');

  const { duas, title, icon } = useMemo(() => {
    switch (type) {
      case 'quranic':
        return { duas: QURANIC_DUAS, title: t('quranic_duas_title', 'أدعية قرآنية'), icon: <BookOpen size={24} /> };
      case 'names-of-allah':
        return { duas: NAMES_OF_ALLAH_DUAS, title: t('names_of_allah_duas_title', 'أدعية بأسماء الله الحسنى'), icon: <HandHeart size={24} /> };
      case 'righteous':
        return { duas: RIGHTEOUS_DUAS, title: t('righteous_duas_title', 'أدعية الصالحين والأخيار'), icon: <Heart size={24} /> };
      case 'salawat':
        return { duas: SALAWAT_DUAS, title: t('salawat_duas_title', 'الصلاة على النبي'), icon: <Star size={24} /> };
      case 'prophetic':
      default:
        return { duas: PROPHETIC_DUAS, title: t('prophetic_duas_title', 'أدعية نبوية'), icon: <Sparkles size={24} /> };
    }
  }, [type, t]);

  const categories = useMemo(() => {
    return ['الكل', ...Array.from(new Set(duas.map(d => d.category || 'أخرى')))];
  }, [duas]);

  const [activeCategory, setActiveCategory] = useState('الكل');
  
  // Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [fontSizeLevel, setFontSizeLevel] = useState(() => {
    try {
      const saved = safeLocalStorageGetItem('dua-fontSizeLevel');
      return saved ? parseInt(saved, 10) : 2;
    } catch {
      return 2;
    }
  }); // 0, 1, 2, 3, 4
  const [fontFamily, setFontFamily] = useState(() => {
    try {
      return safeLocalStorageGetItem('dua-fontFamily') || 'El Messiri';
    } catch {
      return 'El Messiri';
    }
  });
  const [currentTheme, setCurrentTheme] = useState(() => {
    try {
      return safeLocalStorageGetItem('dua-currentTheme') || 'default';
    } catch {
      return 'default';
    }
  });

  useEffect(() => {
    safeLocalStorageSetItem('dua-fontSizeLevel', fontSizeLevel.toString());
  }, [fontSizeLevel]);

  useEffect(() => {
    safeLocalStorageSetItem('dua-fontFamily', fontFamily);
  }, [fontFamily]);

  useEffect(() => {
    safeLocalStorageSetItem('dua-currentTheme', currentTheme);
  }, [currentTheme]);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Touch Swipe Gesture Handlers for Category Switching
  const touchStartX = React.useRef<number>(0);
  const touchStartY = React.useRef<number>(0);
  const touchEndX = React.useRef<number>(0);
  const touchEndY = React.useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchEndX.current = e.touches[0].clientX;
    touchEndY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
    touchEndY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = () => {
    const deltaX = touchEndX.current - touchStartX.current;
    const deltaY = touchEndY.current - touchStartY.current;
    const minSwipeDistance = 50;

    if (Math.abs(deltaX) > minSwipeDistance && Math.abs(deltaX) > Math.abs(deltaY) * 1.3) {
      const currentCatIdx = categories.indexOf(activeCategory);
      if (currentCatIdx !== -1) {
        if (deltaX < 0) {
          // Dragged finger left -> Next category
          const nextIdx = currentCatIdx + 1;
          if (nextIdx < categories.length) {
            setActiveCategory(categories[nextIdx]);
            triggerHaptic('light');
          }
        } else {
          // Dragged finger right -> Previous category
          const prevIdx = currentCatIdx - 1;
          if (prevIdx >= 0) {
            setActiveCategory(categories[prevIdx]);
            triggerHaptic('light');
          }
        }
      }
    }

    touchStartX.current = 0;
    touchEndX.current = 0;
    touchStartY.current = 0;
    touchEndY.current = 0;
  };

  const isFavorite = (id: string) => {
    return (progress.favorites || []).some(fav => fav.id === id && fav.type === 'dua');
  };

  const toggleFavorite = (dua: Dua) => {
    toggleFavoriteUnified({
      id: dua.id,
      type: 'dua',
      title: dua.title,
      subtitle: title, // Category title
      route: `/duas/${type}`
    });
  };

  const handleShare = async (dua: Dua) => {
    const appUrl = window.location.origin;
    const textToShare = `✨ *${dua.title}* ✨\n\n${dua.text}\n\n📖 المصدر: ${dua.reference}\n${dua.explanation ? `📝 فائدة: ${dua.explanation}\n` : ''}\n—\nتمت المشاركة من تطبيق *أذكار المؤمن azkar almumin*\nزيارة التطبيق: ${appUrl}`;
    await shareContent(dua.title, textToShare);
  };

  const handleDownload = async (duaId: string, title: string) => {
    const cardElement = document.getElementById(`dua-card-export-${duaId}`);
    if (!cardElement) return;

    setDownloadingId(duaId);

    // Give UI a moment to show the spinner
    await new Promise(resolve => setTimeout(resolve, 50));

    try {
      const isDark = document.documentElement.classList.contains('dark');
      
      const dataUrl = await toPng(cardElement, { 
        quality: 0.95,
        pixelRatio: 1.5,
        backgroundColor: isDark ? '#020617' : '#f8fafc',
        style: {
          transform: 'scale(1)',
          borderRadius: '1.5rem',
        },
        filter: (node) => {
          if (node.nodeType === 1) { // Node.ELEMENT_NODE
            return !(node as Element).hasAttribute('data-html2canvas-ignore');
          }
          return true;
        }
      });
      
      const link = document.createElement('a');
      link.download = `${title}.png`;
      link.href = dataUrl;
      link.click();
      
      // Delay before resetting to show success if needed
      setTimeout(() => {
        setDownloadingId(null);
      }, 500);
      
    } catch (err) {
      console.error('Failed to download image', err);
      
      // Fast fallback
      try {
        const isDark = document.documentElement.classList.contains('dark');
        const fallbackDataUrl = await toPng(cardElement, {
          quality: 0.9,
          pixelRatio: 1.2,
          backgroundColor: isDark ? '#020617' : '#f8fafc',
          skipFonts: true,
          filter: (node) => {
            if (node.nodeType === 1) {
              return !(node as Element).hasAttribute('data-html2canvas-ignore');
            }
            return true;
          }
        });
        
        const link = document.createElement('a');
        link.download = `${title}.png`;
        link.href = fallbackDataUrl;
        link.click();
        
        setTimeout(() => {
          setDownloadingId(null);
        }, 500);
        
      } catch (fallbackErr) {
        console.error('Fallback download also failed', fallbackErr);
        setDownloadingId(null);
      }
    }
  };

  const getTextSizeClass = () => {
    switch(fontSizeLevel) {
      case 0: return 'text-[18px] sm:text-[22px] leading-[1.6]';
      case 1: return 'text-[22px] sm:text-[26px] leading-[1.6]';
      case 2: return 'text-[28px] sm:text-[34px] leading-[1.6] sm:leading-[1.7]';
      case 3: return 'text-[36px] sm:text-[44px] leading-[1.5] sm:leading-[1.6]';
      case 4: return 'text-[46px] sm:text-[56px] leading-[1.4] sm:leading-[1.5]';
      default: return 'text-[28px] sm:text-[34px] leading-[1.6] sm:leading-[1.7]';
    }
  };

  const fonts = [
    { name: 'المسيري', value: 'El Messiri' },
    { name: 'أميري', value: 'Amiri' },
    { name: 'شهرزاد', value: 'Scheherazade New' },
    { name: 'لطيف', value: 'Lateef' },
    { name: 'رقعة', value: 'Aref Ruqaa' },
    { name: 'نسخ', value: 'Noto Naskh Arabic' },
    { name: 'كايرو', value: 'Cairo' },
    { name: 'تجوال', value: 'Tajawal' },
    { name: 'كوفي', value: 'Noto Kufi Arabic' },
    { name: 'الإسكندرية', value: 'Alexandria' },
    { name: 'زين', value: 'Zain' },
    { name: 'بيروتي', value: 'Beiruti' },
    { name: 'لاليزار', value: 'Lalezar' },
    { name: 'مرحي', value: 'Marhey' },
    { name: 'ريم كوفي', value: 'Reem Kufi' },
    { name: 'رقاص', value: 'Rakkas' }
  ];

  const themeNames: Record<string, string> = {
    default: 'الكلاسيكي الفاتح',
    emerald: 'الزمرد الأخضر',
    gold: 'الذهب الملكي',
    rose: 'الورد الهادئ',
    night: 'سماء الليل الداكنة',
    lavender: 'الخزامى العذب',
    sky: 'النسيم الأزرق',
    tealBreeze: 'التركواز الراقي',
    sage: 'الزيتوني الوقور',
    oud: 'العود العتيق'
  };

  const cardThemes = {
    default: {
      bg: 'bg-white dark:bg-slate-900',
      border: 'border-slate-200 dark:border-slate-800',
      title: 'text-slate-800 dark:text-white',
      text: 'text-slate-900 dark:text-slate-50',
      accentBg: 'bg-teal-50 dark:bg-teal-950/80',
      accentText: 'text-teal-700 dark:text-teal-300',
      gradient: 'from-teal-50/80 dark:from-teal-900/20',
      explanationBg: 'bg-slate-50/80 dark:bg-slate-950/50',
      icon: 'text-teal-500'
    },
    emerald: {
      bg: 'bg-emerald-950 dark:bg-emerald-950',
      border: 'border-emerald-800/60 dark:border-emerald-800/60',
      title: 'text-emerald-50 dark:text-emerald-50',
      text: 'text-emerald-100/90 dark:text-emerald-100/90',
      accentBg: 'bg-emerald-900/80 dark:bg-emerald-900/80',
      accentText: 'text-emerald-300 dark:text-emerald-300',
      gradient: 'from-emerald-900/40 dark:from-emerald-900/40',
      explanationBg: 'bg-emerald-900/30 dark:bg-emerald-900/30',
      icon: 'text-emerald-400'
    },
    gold: {
      bg: 'bg-amber-950 dark:bg-amber-950',
      border: 'border-amber-800/60 dark:border-amber-800/60',
      title: 'text-amber-50 dark:text-amber-50',
      text: 'text-amber-100/90 dark:text-amber-100/90',
      accentBg: 'bg-amber-900/80 dark:bg-amber-900/80',
      accentText: 'text-amber-300 dark:text-amber-300',
      gradient: 'from-amber-900/40 dark:from-amber-900/40',
      explanationBg: 'bg-amber-900/30 dark:bg-amber-900/30',
      icon: 'text-amber-400'
    },
    rose: {
      bg: 'bg-rose-950 dark:bg-rose-950',
      border: 'border-rose-800/60 dark:border-rose-800/60',
      title: 'text-rose-50 dark:text-rose-50',
      text: 'text-rose-100/90 dark:text-rose-100/90',
      accentBg: 'bg-rose-900/80 dark:bg-rose-900/80',
      accentText: 'text-rose-300 dark:text-rose-300',
      gradient: 'from-rose-900/40 dark:from-rose-900/40',
      explanationBg: 'bg-rose-900/30 dark:bg-rose-900/30',
      icon: 'text-rose-400'
    },
    night: {
      bg: 'bg-[#0f172a] dark:bg-[#020617]',
      border: 'border-indigo-900/50 dark:border-indigo-900/50',
      title: 'text-indigo-100 dark:text-indigo-50',
      text: 'text-white dark:text-slate-200',
      accentBg: 'bg-indigo-900/40 dark:bg-indigo-900/40',
      accentText: 'text-indigo-300 dark:text-indigo-300',
      gradient: 'from-indigo-900/30 dark:from-indigo-900/20',
      explanationBg: 'bg-indigo-900/20 dark:bg-indigo-900/20',
      icon: 'text-indigo-400'
    },
    lavender: {
      bg: 'bg-[#1e1b4b] dark:bg-[#0f0e26]',
      border: 'border-[#3730a3]/50 dark:border-[#312e81]/50',
      title: 'text-[#e0e7ff] dark:text-[#f3f4f6]',
      text: 'text-[#e0e7ff]/90 dark:text-[#c7d2fe]',
      accentBg: 'bg-[#312e81]/60 dark:bg-[#1e1b4b]/60',
      accentText: 'text-[#a5b4fc] dark:text-[#a5b4fc]',
      gradient: 'from-[#312e81]/40 dark:from-[#312e81]/20',
      explanationBg: 'bg-[#312e81]/30 dark:bg-[#1e1b4b]/30',
      icon: 'text-[#818cf8]'
    },
    sky: {
      bg: 'bg-[#0c4a6e] dark:bg-[#082f49]',
      border: 'border-[#0369a1]/50 dark:border-[#0c4a6e]/50',
      title: 'text-[#f0f9ff] dark:text-[#f8fafc]',
      text: 'text-[#e0f2fe]/90 dark:text-[#bae6fd]',
      accentBg: 'bg-[#0369a1]/60 dark:bg-[#0c4a6e]/60',
      accentText: 'text-[#7dd3fc] dark:text-[#7dd3fc]',
      gradient: 'from-[#0369a1]/40 dark:from-[#0369a1]/20',
      explanationBg: 'bg-[#0369a1]/30 dark:bg-[#0c4a6e]/30',
      icon: 'text-[#38bdf8]'
    },
    tealBreeze: {
      bg: 'bg-[#115e59] dark:bg-[#042f2e]',
      border: 'border-[#0f766e]/50 dark:border-[#115e59]/50',
      title: 'text-[#f0fdfa] dark:text-[#f9fafb]',
      text: 'text-[#ccfbf1]/90 dark:text-[#99f6e4]',
      accentBg: 'bg-[#0f766e]/60 dark:bg-[#115e59]/60',
      accentText: 'text-[#5eead4] dark:text-[#5eead4]',
      gradient: 'from-[#0f766e]/40 dark:from-[#0f766e]/20',
      explanationBg: 'bg-[#0f766e]/30 dark:bg-[#115e59]/30',
      icon: 'text-[#2dd4bf]'
    },
    sage: {
      bg: 'bg-[#14532d] dark:bg-[#064e43]',
      border: 'border-[#15802d]/50 dark:border-[#14532d]/40',
      title: 'text-[#f0fdf4] dark:text-[#f4fbf7]',
      text: 'text-[#dcfce7]/90 dark:text-[#a7f3d0]',
      accentBg: 'bg-[#15802d]/60 dark:bg-[#14532d]/60',
      accentText: 'text-[#86efac] dark:text-[#86efac]',
      gradient: 'from-[#15802d]/40 dark:from-[#15802d]/20',
      explanationBg: 'bg-[#15802d]/30 dark:bg-[#14532d]/30',
      icon: 'text-[#4ade80]'
    },
    oud: {
      bg: 'bg-[#402a11] dark:bg-[#201509]',
      border: 'border-[#5c3e1a] dark:border-[#382610]',
      title: 'text-[#fef3c7] dark:text-[#fef3c7]',
      text: 'text-[#fde68a] dark:text-[#fcd34d]',
      accentBg: 'bg-[#5c3e1a] dark:bg-[#402a11]',
      accentText: 'text-[#fcd34d] dark:text-[#fcd34d]',
      gradient: 'from-[#5c3e1a]/40 dark:from-[#382610]/40',
      explanationBg: 'bg-[#2d1e0c] dark:bg-[#191106]',
      icon: 'text-[#fbbf24]'
    }
  };

  const currentThemeClasses = cardThemes[currentTheme as keyof typeof cardThemes];

  const displayedDuas = useMemo(() => {
    let filtered = duas;
    if (activeCategory !== 'الكل') {
      filtered = duas.filter(d => (d.category || 'أخرى') === activeCategory);
    }
    
    // Sort so favorites appear at the top
    return [...filtered].sort((a, b) => {
      const aFav = isFavorite(a.id);
      const bFav = isFavorite(b.id);
      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;
      return 0; // maintain original order if both are favorited or both are not favorited
    });
  }, [activeCategory, duas, progress.favorites]);

  return (
    <div 
      className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 px-0 sm:px-4 pt-0 w-full max-w-[1600px] mx-auto relative"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Sticky Header Section */}
      <header className="sticky top-0 z-40 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-md pt-3 pb-2 px-0 mb-3 border-b border-slate-200/60 dark:border-slate-800/60 shadow-xs shrink-0 transition-all">
        <div className="flex items-center gap-4 mb-3 px-4 sm:px-2">
          <BackButton />
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight">{title}</h1>
          <div className="mr-auto flex gap-2">
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className={cn(
                "p-2.5 rounded-2xl transition-all duration-300",
                showSettings 
                  ? "bg-teal-600 text-white shadow-lg shadow-teal-500/30" 
                  : "bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-400 hover:bg-teal-100 dark:hover:bg-teal-900"
              )}
            >
              <SlidersHorizontal size={22} className={cn("transition-transform duration-500", showSettings && "rotate-90")} />
            </button>
            <div className="hidden sm:flex text-teal-600 p-2.5 bg-teal-50 dark:bg-teal-950 rounded-2xl items-center justify-center">
              {icon}
            </div>
          </div>
        </div>

        {categories.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide px-4 sm:px-2 w-full">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-5 py-2 rounded-2xl whitespace-nowrap text-[15px] sm:text-base font-bold transition-all duration-300 shrink-0",
                  activeCategory === cat
                    ? "bg-teal-600 text-white shadow-lg shadow-teal-500/30 scale-[1.02]"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </header>

      {showSettings && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 mb-6 mx-4 sm:mx-2 shadow-xl animate-in fade-in slide-in-from-top-4 duration-300 z-20">
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100 dark:border-slate-800/80">
            <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
              <SlidersHorizontal size={18} className="text-teal-500" />
              إعدادات القراءة
            </h3>
            <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 bg-slate-100 dark:bg-slate-800 rounded-full">
              <X size={18} />
            </button>
          </div>
          
          <div className="space-y-6">
            {/* Font Size */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <Type size={16} /> حجم الخط
              </label>
              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-950 p-2 rounded-2xl border border-slate-200 dark:border-slate-800">
                <button 
                  onClick={() => setFontSizeLevel(Math.min(4, fontSizeLevel + 1))}
                  disabled={fontSizeLevel >= 4}
                  className="p-3 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 rounded-xl shadow-sm hover:shadow active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 border border-slate-100 dark:border-slate-800"
                >
                  <Plus size={20} />
                </button>
                <div className="flex-1 flex justify-center gap-1.5 px-4">
                  {[0, 1, 2, 3, 4].map((level) => (
                    <div 
                      key={level} 
                      className={cn(
                        "h-2 rounded-full transition-all duration-300",
                        level <= fontSizeLevel 
                          ? "bg-teal-500 w-full" 
                          : "bg-slate-200 dark:bg-slate-800 w-1/2 opacity-50"
                      )} 
                    />
                  ))}
                </div>
                <button 
                  onClick={() => setFontSizeLevel(Math.max(0, fontSizeLevel - 1))}
                  disabled={fontSizeLevel <= 0}
                  className="p-3 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 rounded-xl shadow-sm hover:shadow active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 border border-slate-100 dark:border-slate-800"
                >
                  <Minus size={20} />
                </button>
              </div>
            </div>

            {/* Font Family */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <BookOpen size={16} /> نوع الخط
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {fonts.map((font) => (
                  <button
                    key={font.value}
                    onClick={() => setFontFamily(font.value)}
                    className={cn(
                      "py-2.5 px-1 rounded-xl text-sm font-bold transition-all border",
                      fontFamily === font.value 
                        ? "bg-teal-600 border-teal-600 text-white shadow-md" 
                        : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    )}
                    style={{ fontFamily: font.value }}
                  >
                    {font.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Themes */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  <Palette size={16} className="text-teal-500" /> ثيم الخلفية والبطاقة
                </label>
                <span className="text-xs font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-1 rounded-full border border-teal-200/20">
                  {themeNames[currentTheme as keyof typeof themeNames] || 'ثيم'}
                </span>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 pt-1 scrollbar-hide w-full">
                {Object.keys(cardThemes).map((theme) => (
                  <button
                    key={theme}
                    onClick={() => setCurrentTheme(theme)}
                    title={themeNames[theme as keyof typeof themeNames]}
                    className={cn(
                      "w-12 h-12 rounded-full shrink-0 border-4 transition-all duration-300 cursor-pointer shadow-sm relative flex items-center justify-center",
                      currentTheme === theme ? "border-teal-500 scale-110 shadow-md ring-2 ring-teal-500/15" : "border-transparent hover:scale-105"
                    )}
                  >
                    <div className={cn("w-full h-full rounded-full border border-black/5 dark:border-white/5", cardThemes[theme as keyof typeof cardThemes].bg)} />
                    {currentTheme === theme && (
                      <div className="absolute w-3 h-3 rounded-full bg-teal-500 shadow-sm" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {type === 'salawat' && (
        <div className="mx-4 sm:mx-2 mb-6 p-6 rounded-[2rem] bg-gradient-to-br from-teal-500 to-emerald-600 dark:from-teal-800 dark:to-emerald-900 border border-white/20 dark:border-teal-700/50 shadow-xl relative overflow-hidden flex flex-col items-center text-center">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 dark:bg-black/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-teal-300/20 dark:bg-teal-900/40 rounded-full blur-3xl pointer-events-none"></div>
          
          <Star className="text-teal-100 mb-3 drop-shadow-md opacity-80 fill-teal-100" size={32} />
          
          <p 
            className="text-white drop-shadow-sm font-bold leading-relaxed text-[20px] sm:text-[26px] z-10"
            style={{ fontFamily: fontFamily || "'El Messiri', sans-serif" }}
          >
            إِنَّ اللَّهَ وَمَلَائِكَتَهُ يُصَلُّونَ عَلَى النَّبِيِّ ۚ<br/>يَا أَيُّهَا الَّذِينَ آمَنُوا صَلُّوا عَلَيْهِ وَسَلِّمُوا تَسْلِيمًا
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-y-auto pb-12 w-full px-2 sm:px-1">
        {displayedDuas.map((dua) => (
          <div id={`dua-card-export-${dua.id}`} key={dua.id} className="w-full px-1 py-1.5 sm:px-3 sm:py-2.5 bg-slate-50 dark:bg-slate-950 rounded-3xl h-full">
            <div className={cn("h-full pt-5 px-4 pb-3 sm:pt-7 sm:px-7 sm:pb-4 rounded-[1.5rem] sm:rounded-[2rem] border-2 shadow-sm sm:shadow-md hover:shadow-xl transition-all duration-300 w-full relative overflow-hidden group flex flex-col justify-between", currentThemeClasses.bg, currentThemeClasses.border)}>
              
              <div className={cn("absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl to-transparent rounded-bl-[5rem] -z-0 pointer-events-none opacity-80", currentThemeClasses.gradient)} />
              
              <div className="relative z-10 w-full flex flex-col h-full">
                <div className="flex flex-col gap-2 sm:gap-3 mb-6">
                  <div className="flex justify-between items-start gap-4">
                    <h2 className={cn("text-xl sm:text-2xl font-black leading-tight transition-colors", currentThemeClasses.title)}>{dua.title}</h2>
                    <div className="flex items-center gap-2 shrink-0 z-20" data-html2canvas-ignore>
                      <button 
                        onClick={() => toggleFavorite(dua)}
                        className={cn(
                          "p-1.5 sm:p-2 rounded-full transition-all duration-250 active:scale-95 ease-out shadow-sm border",
                          isFavorite(dua.id) 
                            ? "bg-rose-500/20 text-rose-600 border-rose-300/40 hover:bg-rose-500/30 dark:bg-rose-500/25 dark:text-rose-400 dark:border-rose-500/30 dark:hover:bg-rose-500/35"
                            : "bg-rose-50 text-rose-500/70 border-rose-200/30 hover:bg-rose-100/90 hover:text-rose-600 dark:bg-rose-950/20 dark:text-rose-400/65 dark:border-rose-900/20 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
                        )}
                        title="المفضلة"
                      >
                        <Heart size={16} strokeWidth={3} className={cn("transition-transform duration-300", isFavorite(dua.id) && "scale-110")} fill={isFavorite(dua.id) ? "currentColor" : "none"} />
                      </button>
                      <button 
                        onClick={() => handleShare(dua)}
                        className="p-1.5 sm:p-2 rounded-full bg-sky-50 text-sky-600 border border-sky-100/50 hover:bg-sky-100 hover:text-sky-700 dark:bg-sky-950/30 dark:text-sky-400 dark:border-sky-900/20 dark:hover:bg-sky-950/55 dark:hover:text-sky-300 transition-all duration-250 active:scale-95 ease-out shadow-sm"
                        title="مشاركة"
                      >
                        <Share2 size={16} strokeWidth={3} />
                      </button>
                      <button 
                        onClick={() => handleDownload(dua.id, dua.title)}
                        disabled={downloadingId === dua.id}
                        className={cn(
                          "p-1.5 sm:p-2 rounded-full transition-all duration-250 active:scale-95 ease-out border shadow-sm",
                          downloadingId === dua.id
                            ? "bg-slate-700 text-white border-slate-600 dark:bg-slate-700 dark:border-slate-600 dark:text-white cursor-not-allowed opacity-80"
                            : "bg-slate-800 text-white border-slate-700 hover:bg-slate-950 dark:bg-slate-800 dark:text-white dark:border-slate-700 dark:hover:bg-slate-700 hover:shadow-md"
                        )}
                        title="تحميل"
                      >
                        {downloadingId === dua.id ? (
                          <Loader2 size={16} strokeWidth={3} className="animate-spin" />
                        ) : (
                          <Download size={16} strokeWidth={3} />
                        )}
                      </button>
                    </div>
                  </div>
                  <span className={cn("text-xs sm:text-sm font-bold px-3 py-1.5 rounded-xl w-fit transition-colors", currentThemeClasses.accentBg, currentThemeClasses.accentText)}>
                    {dua.reference}
                  </span>
                </div>
                
                <div className={cn("w-full flex-grow", !dua.explanation && "mb-2")}>
                  <span 
                    className={cn("font-bold block whitespace-pre-line text-right w-full transition-all duration-500", currentThemeClasses.title, getTextSizeClass())}
                    style={{ fontFamily: fontFamily }}
                  >
                    {dua.text}
                  </span>
                </div>
                
                {dua.explanation && (
                  <div className={cn("mt-6 p-4 sm:p-5 rounded-2xl border border-black/5 dark:border-white/5 transition-colors", currentThemeClasses.explanationBg)}>
                    <div className="flex items-start gap-4">
                      <div className={cn("mt-1 shrink-0", currentThemeClasses.icon)}>
                        <Sparkles size={22} className="opacity-80" />
                      </div>
                      <p className={cn("text-[15px] sm:text-[17px] leading-relaxed font-medium transition-colors opacity-90", currentThemeClasses.title)}>
                        {dua.explanation}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
