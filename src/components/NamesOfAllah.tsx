import { BackButton } from './ui/BackButton';
import { shareContent, copyTextToClipboard, triggerHaptic, cn } from '../lib/utils';
import { safeLocalStorageGetItem, safeLocalStorageSetItem } from '../utils/storage';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { NAMES_OF_ALLAH, NameOfAllah } from '../data/namesOfAllah';
import {  ChevronRight, 
  ChevronLeft, 
  X, 
  Info, 
  Sparkles, 
  BookOpen, 
  Search, 
  Share2, 
  Sliders, 
   
  SlidersHorizontal,
  Play, 
  Pause, 
   
  Copy, 
  Check, 
  Layers, 
  Palette, 
  Type, 
  Eye, 
  Compass, 
  Maximize2,
  Heart,
  Grid,
  ListFilter,
  CheckCircle2 , Star, RotateCcw } from 'lucide-react';
import { useAppContext } from '../AppContext';

// Types for Names of Allah Configuration
export type LayoutMode = 'grid4' | 'grid2' | 'horizontal' | 'list' | 'focus';
export type FrameStyle = 'rounded' | 'circle' | 'hexagon' | 'star' | 'arch' | 'squircle' | 'diamond' | 'royal';
export type ThemeColor = 'burgundy' | 'emerald' | 'navy' | 'midnight' | 'gold' | 'rose' | 'pearl' | 'amethyst';
export type FontSize = 'small' | 'medium' | 'large' | 'xlarge';

interface FontOption {
  id: string;
  name: string;
  family: string;
  preview: string;
  category: string;
}

const FONTS_LIST: FontOption[] = [
  { id: 'Amiri', name: 'خط الثلث والنسخ الملكي', family: "'Amiri', serif", preview: 'الرَّحْمَنُ الرَّحِيمُ', category: 'تراثي وأصيل' },
  { id: 'Reem Kufi', name: 'خط الكوفي المتقن', family: "'Reem Kufi', sans-serif", preview: 'الْمَلِكُ الْقُدُّوسُ', category: 'كوفي هندسي' },
  { id: 'Aref Ruqaa', name: 'خط الرقعة الفني', family: "'Aref Ruqaa', serif", preview: 'السَّلَامُ الْمُؤْمِنُ', category: 'رقعة عريق' },
  { id: 'Tajawal', name: 'خط تجوال العصري', family: "'Tajawal', sans-serif", preview: 'الْعَزِيزُ الْجَبَّارُ', category: 'عصري ناعم' },
  { id: 'Cairo', name: 'خط كايرو الجذاب', family: "'Cairo', sans-serif", preview: 'الْخَالِقُ الْبَارِئُ', category: 'عصري واضح' },
  { id: 'Almarai', name: 'خط المراعي الفاخر', family: "'Almarai', sans-serif", preview: 'الْغَفَّارُ الْقَهَّارُ', category: 'أنيق وانسيابي' },
  { id: 'Lalezar', name: 'خط لاله زار العربي', family: "'Lalezar', cursive", preview: 'الْوَهَّابُ الرَّزَّاقُ', category: 'عريض وفخم' },
  { id: 'Lateef', name: 'خط لطيف التراثي', family: "'Lateef', cursive", preview: 'الْفَتَّاحُ الْعَلِيمُ', category: 'كلاسيكي ساحر' },
  { id: 'Scheherazade New', name: 'خط شهرزاد الأصيل', family: "'Scheherazade New', serif", preview: 'الْقَابِضُ الْبَاسِطُ', category: 'عثماني قرآني' },
  { id: 'Readex Pro', name: 'خط ريدكس برو الحديث', family: "'Readex Pro', sans-serif", preview: 'السَّمِيعُ الْبَصِيرُ', category: 'رقمي حديث' },
  { id: 'El Messiri', name: 'خط المسيري المتوازن', family: "'El Messiri', sans-serif", preview: 'اللَّطِيفُ الْخَبِيرُ', category: 'هندسي متقن' },
  { id: 'Katibeh', name: 'خط الكاتبة الفني', family: "'Katibeh', cursive", preview: 'الْحَلِيمُ الْعَظِيمُ', category: 'فني رشيق' },
  { id: 'Zain', name: 'خط زين المتناغم', family: "'Zain', sans-serif", preview: 'الْغَفُورُ الشَّكُورُ', category: 'خفيف ومرن' },
  { id: 'Rakkas', name: 'خط ركّاس الزخرفي', family: "'Rakkas', cursive", preview: 'الْكَبِيرُ الْمُتَعَالِ', category: 'زخرفي مميز' }
];

const THEMES_CONFIG: Record<ThemeColor, {
  name: string;
  gradient: string;
  cardGradient: string;
  textColor: string;
  borderColor: string;
  accentColor: string;
  badgeBg: string;
  shadowColor: string;
  isLight?: boolean;
}> = {
  burgundy: {
    name: 'عنابي ملكي وذهب',
    gradient: 'from-red-800 via-rose-950 to-red-950',
    cardGradient: 'from-red-800 to-rose-950',
    textColor: 'text-amber-300',
    borderColor: 'border-red-500/40',
    accentColor: '#fbbf24',
    badgeBg: 'bg-red-900/60',
    shadowColor: 'shadow-red-950/50'
  },
  emerald: {
    name: 'الزمرد الإمبراطوري',
    gradient: 'from-emerald-800 via-teal-950 to-emerald-950',
    cardGradient: 'from-emerald-800 to-teal-950',
    textColor: 'text-emerald-300',
    borderColor: 'border-emerald-500/40',
    accentColor: '#6ee7b7',
    badgeBg: 'bg-emerald-900/60',
    shadowColor: 'shadow-emerald-950/50'
  },
  navy: {
    name: 'الأزرق النيلي الملكي',
    gradient: 'from-sky-800 via-indigo-950 to-slate-950',
    cardGradient: 'from-sky-800 to-indigo-950',
    textColor: 'text-cyan-300',
    borderColor: 'border-cyan-500/40',
    accentColor: '#67e8f9',
    badgeBg: 'bg-indigo-900/60',
    shadowColor: 'shadow-slate-950/50'
  },
  midnight: {
    name: 'الأسود والذهب الخالص',
    gradient: 'from-neutral-900 via-stone-950 to-black',
    cardGradient: 'from-neutral-900 to-neutral-950',
    textColor: 'text-amber-400',
    borderColor: 'border-amber-500/50',
    accentColor: '#f59e0b',
    badgeBg: 'bg-neutral-800/80',
    shadowColor: 'shadow-black/70'
  },
  gold: {
    name: 'العنبر والعسل الدافئ',
    gradient: 'from-amber-700 via-yellow-950 to-amber-950',
    cardGradient: 'from-amber-700 to-amber-950',
    textColor: 'text-amber-200',
    borderColor: 'border-amber-400/40',
    accentColor: '#fde68a',
    badgeBg: 'bg-amber-900/60',
    shadowColor: 'shadow-amber-950/50'
  },
  rose: {
    name: 'الياقوت الوردي الفاخر',
    gradient: 'from-pink-800 via-rose-950 to-pink-950',
    cardGradient: 'from-pink-800 to-rose-950',
    textColor: 'text-pink-200',
    borderColor: 'border-pink-500/40',
    accentColor: '#fbcfe8',
    badgeBg: 'bg-pink-900/60',
    shadowColor: 'shadow-pink-950/50'
  },
  amethyst: {
    name: 'البنفسجي الأرجواني',
    gradient: 'from-purple-800 via-violet-950 to-purple-950',
    cardGradient: 'from-purple-800 to-violet-950',
    textColor: 'text-purple-200',
    borderColor: 'border-purple-500/40',
    accentColor: '#e9d5ff',
    badgeBg: 'bg-purple-900/60',
    shadowColor: 'shadow-purple-950/50'
  },
  pearl: {
    name: 'اللؤلؤي الناصع',
    gradient: 'from-slate-100 via-amber-50 to-slate-200',
    cardGradient: 'from-white to-amber-50/90',
    textColor: 'text-slate-900',
    borderColor: 'border-amber-500/50',
    accentColor: '#b45309',
    badgeBg: 'bg-amber-100/90',
    shadowColor: 'shadow-amber-200/40',
    isLight: true
  }
};

const FRAMES_CONFIG: { id: FrameStyle; name: string; iconLabel: string; desc: string }[] = [
  { id: 'rounded', name: 'إطار مبسط هادئ', iconLabel: '▢', desc: 'حواف مستديرة ناعمة كلاسيكية' },
  { id: 'circle', name: 'إطار دائري ملكي', iconLabel: '◯', desc: 'حلقات دائرية متحدة المركز مزخرفة' },
  { id: 'hexagon', name: 'إطار سداسي إسلامي', iconLabel: '⬡', desc: 'هندسة سداسية إسلامية متقنة' },
  { id: 'star', name: 'نجمة ثمانية إسلامية', iconLabel: '۞', desc: 'نجمة إسلامية ثمانية الأطراف' },
  { id: 'arch', name: 'محراب وقبة إسلامية', iconLabel: '∩', desc: 'قوس ومحراب إسلامي أصيل' },
  { id: 'squircle', name: 'مربع منحني عصري', iconLabel: '▢', desc: 'شكل ناعم بأبعاد عصرية فائقة' },
  { id: 'diamond', name: 'ماسي هندسي', iconLabel: '◇', desc: 'شكل ماسي مذهب بزوايا دقيقة' },
  { id: 'royal', name: 'إطار ملكي مزخرف', iconLabel: '❖', desc: 'حدود مذهبة مع زوايا أرابيسك' }
];

export const NamesOfAllah: React.FC = () => {
  const { settings, updateSettings } = useAppContext();
  
  // Active settings with fallbacks
  const layout = (settings.namesOfAllahLayout || 'grid4') as LayoutMode;
  const frame = (settings.namesOfAllahFrame || 'rounded') as FrameStyle;
  const fontFamilyId = settings.namesOfAllahFontFamily || 'Amiri';
  const fontSize = (settings.namesOfAllahFontSize || 'medium') as FontSize;
  const theme = (settings.namesOfAllahTheme || 'burgundy') as ThemeColor;
  const showMeaning = settings.namesOfAllahShowMeaning !== false;
  const showNumber = settings.namesOfAllahShowNumber !== false;
  const autoPlaySpeed = settings.namesOfAllahAutoPlaySpeed || 4; // seconds

  // Local state
  const [selectedName, setSelectedName] = useState<NameOfAllah | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'layout' | 'frames' | 'fonts' | 'themes' | 'extras'>('layout');
  const [showVirtueModal, setShowVirtueModal] = useState(false);
  const [showDhikrModal, setShowDhikrModal] = useState(false);
  const [showDuaModal, setShowDuaModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Horizontal Carousel / Slide state
  const [activeHorizontalIdx, setActiveHorizontalIdx] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [tasbihCounter, setTasbihCounter] = useState(0);
  const filmstripRef = useRef<HTMLDivElement>(null);
  const autoPlayTimerRef = useRef<any>(null);

  // Read favorites from settings or localStorage fallback
  const favoriteIds: number[] = useMemo(() => {
    if (settings.namesOfAllahFavoriteIds && Array.isArray(settings.namesOfAllahFavoriteIds)) {
      return settings.namesOfAllahFavoriteIds;
    }
    try {
      const saved = safeLocalStorageGetItem('believer_names_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }, [settings.namesOfAllahFavoriteIds]);

  const toggleFavorite = (id: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    triggerHaptic('medium');
    const next = favoriteIds.includes(id) 
      ? favoriteIds.filter(item => item !== id)
      : [...favoriteIds, id];
    
    updateSettings({ namesOfAllahFavoriteIds: next });
    safeLocalStorageSetItem('believer_names_favorites', JSON.stringify(next));
  };

  // Get active font config
  const activeFont = useMemo(() => {
    return FONTS_LIST.find(f => f.id === fontFamilyId) || FONTS_LIST[0];
  }, [fontFamilyId]);

  // Get active theme config
  const activeTheme = useMemo(() => {
    return THEMES_CONFIG[theme] || THEMES_CONFIG.burgundy;
  }, [theme]);

  // Filtered names list
  const filteredNames = useMemo(() => {
    return NAMES_OF_ALLAH.filter(item => {
      const matchesSearch = 
        item.name.includes(searchQuery) || 
        item.meaning.includes(searchQuery) ||
        item.id.toString().includes(searchQuery);
      
      const matchesFav = onlyFavorites ? favoriteIds.includes(item.id) : true;
      return matchesSearch && matchesFav;
    });
  }, [searchQuery, onlyFavorites, favoriteIds]);

  // Auto-play slideshow logic for Horizontal Mode
  useEffect(() => {
    if (isAutoPlaying && layout === 'horizontal' && filteredNames.length > 0) {
      autoPlayTimerRef.current = setInterval(() => {
        setActiveHorizontalIdx(prev => (prev + 1) % filteredNames.length);
      }, autoPlaySpeed * 1000);
    } else {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    }
    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    };
  }, [isAutoPlaying, layout, filteredNames.length, autoPlaySpeed]);

  // Scroll active item into view in filmstrip
  useEffect(() => {
    if (filmstripRef.current && layout === 'horizontal') {
      const activeEl = filmstripRef.current.children[activeHorizontalIdx] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [activeHorizontalIdx, layout]);

  // Reset horizontal index when filtered list changes
  useEffect(() => {
    if (activeHorizontalIdx >= filteredNames.length) {
      setActiveHorizontalIdx(0);
    }
  }, [filteredNames.length, activeHorizontalIdx]);

  // Reset tasbih counter on active name change
  useEffect(() => {
    setTasbihCounter(0);
  }, [activeHorizontalIdx]);

  const handleCopy = (nameObj: NameOfAllah, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const text = `✨ ${nameObj.name} ✨\nالمعنى: ${nameObj.meaning}\n\n— من أسماء الله الحسنى عبر تطبيق أذكار المؤمن`;
    copyTextToClipboard(text);
    setCopiedId(nameObj.id);
    triggerHaptic('success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShare = (nameObj: NameOfAllah, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const shareText = `✨ *${nameObj.name}* ✨\n\nالمعنى: ${nameObj.meaning}\n\n— تمت المشاركة عبر تطبيق أذكار المؤمن`;
    shareContent('أسماء الله الحسنى', shareText);
    triggerHaptic('light');
  };

  // Font size classes
  const getFontSizeClass = (isTitle = true) => {
    if (isTitle) {
      switch (fontSize) {
        case 'small': return 'text-lg sm:text-xl';
        case 'large': return 'text-2xl sm:text-3xl md:text-4xl';
        case 'xlarge': return 'text-3xl sm:text-4xl md:text-5xl';
        default: return 'text-xl sm:text-2xl md:text-3xl';
      }
    }
    return 'text-xs sm:text-sm';
  };

  // Render Frame Container Styling based on selected shape
  const renderFrameClasses = (currentFrame: FrameStyle) => {
    switch (currentFrame) {
      case 'circle':
        return 'rounded-full aspect-square border-2 ring-4 ring-amber-400/20';
      case 'hexagon':
        return 'aspect-square [clip-path:polygon(50%_0%,_100%_25%,_100%_75%,_50%_100%,_0%_75%,_0%_25%)]';
      case 'star':
        return 'aspect-square [clip-path:polygon(50%_0%,_60%_15%,_85%_15%,_85%_40%,_100%_50%,_85%_60%,_85%_85%,_60%_85%,_50%_100%,_40%_85%,_15%_85%,_15%_60%,_0%_50%,_15%_40%,_15%_15%,_40%_15%)]';
      case 'arch':
        return 'rounded-t-[3.5rem] rounded-b-2xl aspect-[4/5] border-2';
      case 'squircle':
        return 'rounded-[2.2rem] aspect-square border-2';
      case 'diamond':
        return 'aspect-square [clip-path:polygon(50%_0%,_100%_50%,_50%_100%,_0%_50%)]';
      case 'royal':
        return 'rounded-2xl aspect-square border-4 border-double';
      case 'rounded':
      default:
        return 'rounded-2xl aspect-square border';
    }
  };

  const virtueContent = {
    title: "فضل أسماء الله الحسنى",
    hadith: "إنَّ للَّهِ تِسعةً وتِسعينَ اسمًا مِئةً إلَّا واحِدًا، مَن أحصاها دَخَلَ الجَنَّةَ.",
    meaning: "معنى أحصاها: حفظها، وفهم معانيها، وعمل بمقتضاها، ودعا الله بها والتعبد له بموجبها."
  };

  const dhikrContent = {
    title: "هُوَ اللَّهُ الَّذِي لَا إِلَٰهَ إِلَّا هُوَ",
    meaning: "هذه العبارة هي أصل التوحيد، وتعني أنه لا معبود بحق إلا الله وحده، المتفرد بالألوهية والربوبية والأسماء والصفات. وهي إقرار بعظمة الخالق وتفرده بالكمال المطلق."
  };

  const duaContent = {
    title: "دعاء تفريج الكرب بالأسماء الحسنى",
    meaning: "اللهمَّ إنِّي عبدُك، ابنُ عبدِك، ابنُ أمَتِك، ناصيتي بيدِك، ماضٍ فيَّ حُكمُك، عدلٌ فيَّ قضاؤُك، أسألُك اللهمَّ بكلِّ اسمٍ هو لك سمَّيتَ به نفسَك، أو أنزلته في كتابِك، أو علَّمته أحدًا مِن خلقِك، أو استأثرت به في علمِ الغيبِ عندَك، أن تجعلَ القرآنَ ربيعَ قلبِي، ونورَ صدرِي، وجلاءَ حزني، وذَهابَ همِّي وغمِّي",
    status: "خلاصة حكم المحدث : إسناده صحيح",
    virtue: "قال رسول الله صلى الله عليه وسلم: 'ما أصاب أحداً قط هم ولا حزن، فقال: اللهم إني عبدك... إلا أذهب الله همّه وحزنه، وأبدله مكانه فرجاً'. وهو من أعظم أدعية الكرب وإزالة الهموم لما فيه من كمال التذلل والالتجاء للواحد الأحد."
  };

  return (
    <div className="space-y-3 pb-8 select-none" dir="rtl">
      
      {/* 🌟 TOP HEADER CAPSULE (Modern & Smart Interactive Capsule) */}
      <div 
        className={cn(
          "bg-gradient-to-r p-2.5 sm:p-3.5 rounded-2xl sm:rounded-3xl shadow-xl border sticky top-0 z-30 mx-1 transition-all duration-300 backdrop-blur-xl relative overflow-hidden",
          activeTheme.gradient,
          activeTheme.borderColor,
          activeTheme.shadowColor
        )}
      >
        {/* Subtle Arabesque Pattern Overlay */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none" 
          style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/arabesque.png')" }}
        />

        <div className="flex items-center justify-between relative z-10 gap-2">
          
          {/* Left: Back Button & Title Details */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <BackButton />
            <div>
              <div className="flex items-center gap-2">
                <h2 
                  className={cn("text-lg sm:text-xl font-black drop-shadow-md leading-tight", activeTheme.textColor)}
                  style={{ fontFamily: activeFont.family }}
                >
                  أسماء الله الحسنى
                </h2>
                <span className={cn("text-[10px] font-black px-2 py-0.5 rounded-full border border-white/10 hidden sm:inline-block", activeTheme.badgeBg, activeTheme.textColor)}>
                  99 اسماً مباركاً
                </span>
              </div>
              <p className={cn(
                "text-[11px] font-bold tracking-wide flex items-center gap-1.5 opacity-90",
                activeTheme.isLight ? "text-slate-700" : "text-slate-200"
              )}>
                <span>{filteredNames.length} اسماً</span>
                {favoriteIds.length > 0 && (
                  <>
                    <span>•</span>
                    <span className="text-amber-400 flex items-center gap-0.5">
                      <Star size={10} className="fill-amber-400" />
                      {favoriteIds.length} مفضلة
                    </span>
                  </>
                )}
                <span>•</span>
                <span className="text-[10px] opacity-75">{activeFont.name.split(' ')[1] || activeFont.name}</span>
              </p>
            </div>
          </div>

          {/* Right: Quick Action Controls Capsule */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Quick Favorites Filter Toggle */}
            <button
              onClick={() => {
                setOnlyFavorites(!onlyFavorites);
                triggerHaptic('light');
              }}
              className={cn(
                "p-2 sm:px-3 sm:py-2 rounded-xl border flex items-center gap-1.5 transition-all duration-200 cursor-pointer shadow-sm active:scale-90",
                onlyFavorites 
                  ? "bg-amber-400 text-slate-950 border-amber-300 font-black shadow-amber-400/30"
                  : "bg-white/10 hover:bg-white/20 text-slate-100 border-white/15"
              )}
              title={onlyFavorites ? "عرض الكل" : "عرض المفضلة فقط"}
            >
              <Star size={16} className={onlyFavorites ? "fill-slate-950" : ""} />
              <span className="text-xs font-black hidden md:inline">المفضلة</span>
              {favoriteIds.length > 0 && (
                <span className={cn(
                  "text-[10px] font-mono font-black px-1.5 py-0.2 rounded-full",
                  onlyFavorites ? "bg-slate-950 text-amber-400" : "bg-amber-400 text-slate-950"
                )}>
                  {favoriteIds.length}
                </span>
              )}
            </button>

            {/* Quick Layout Switcher Button */}
            <button
              onClick={() => {
                const nextLayout: LayoutMode = layout === 'horizontal' ? 'grid4' : 'horizontal';
                updateSettings({ namesOfAllahLayout: nextLayout });
                triggerHaptic('light');
              }}
              className={cn(
                "p-2 sm:px-3 sm:py-2 rounded-xl border flex items-center gap-1.5 transition-all duration-200 cursor-pointer shadow-sm active:scale-90",
                layout === 'horizontal' 
                  ? "bg-amber-400/90 text-slate-950 border-amber-300 font-black"
                  : "bg-white/10 hover:bg-white/20 text-slate-100 border-white/15"
              )}
              title={layout === 'horizontal' ? "التبديل إلى الشبكة" : "التبديل إلى العرض الأفقي"}
            >
              {layout === 'horizontal' ? <Grid size={16} /> : <SlidersHorizontal size={16} />}
              <span className="text-xs font-black hidden sm:inline">
                {layout === 'horizontal' ? 'أفقي' : 'شبكة'}
              </span>
            </button>

            {/* Virtue Info Modal Trigger */}
            <button
              onClick={() => {
                setShowVirtueModal(true);
                triggerHaptic('light');
              }}
              className="p-2 sm:p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-amber-300 border border-white/15 transition-all cursor-pointer active:scale-90 shadow-sm"
              title="فضل أسماء الله الحسنى"
            >
              <Info size={18} />
            </button>

            {/* ⚙️ SMART SETTINGS BUTTON (Main requested feature) */}
            <button
              onClick={() => {
                setShowSettingsModal(true);
                triggerHaptic('medium');
              }}
              className="p-2 sm:px-3.5 sm:py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black border border-amber-300/80 transition-all duration-200 cursor-pointer shadow-lg shadow-amber-500/25 active:scale-90 flex items-center gap-1.5 group"
              title="إعدادات المظهر والخطوط والإطارات"
            >
              <Sliders size={18} className="group-hover:rotate-45 transition-transform duration-300" />
              <span className="text-xs font-black hidden sm:inline">الإعدادات</span>
              <Sparkles size={13} className="text-slate-950 animate-pulse hidden xs:inline" />
            </button>

          </div>
        </div>
      </div>

      {/* 🔍 Search Bar & Quick Stats */}
      <div className="mx-1 flex items-center gap-2">
        <div className="relative flex-1 group">
          <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-amber-500 transition-colors">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="ابحث عن اسم بالمعنى أو اللفظ أو الرقم (مثال: الرحمن، الحكيم، 1)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 pr-10 pl-10 text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all shadow-sm font-medium"
            dir="rtl"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 left-3 flex items-center text-slate-400 hover:text-rose-500 transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Quick layout selector popup / chip button */}
        <button
          onClick={() => {
            setShowSettingsModal(true);
            setSettingsTab('layout');
          }}
          className="px-3 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-black flex items-center gap-1.5 shrink-0 hover:border-amber-500/50 shadow-sm"
          title="تغيير طريقة العرض"
        >
          <Layers size={16} className="text-amber-500" />
          <span className="hidden sm:inline">
            {layout === 'horizontal' ? 'عرض أفقي' : layout === 'grid4' ? 'شبكة 4x' : layout === 'grid2' ? 'شبكة 2x' : layout === 'list' ? 'قائمة' : 'تدبر'}
          </span>
        </button>
      </div>

      {/* 📖 Top Dhikr Card */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          setShowDhikrModal(true);
          triggerHaptic('light');
        }}
        className={cn(
          "mx-1 bg-gradient-to-r p-4 sm:p-5 rounded-2xl sm:rounded-3xl border shadow-lg relative overflow-hidden text-center cursor-pointer group transition-all duration-300",
          activeTheme.cardGradient,
          activeTheme.borderColor,
          activeTheme.shadowColor
        )}
      >
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/arabesque.png')" }} />
        <h3 
          className={cn("text-2xl sm:text-3xl md:text-4xl font-black drop-shadow-md group-hover:scale-105 transition-transform duration-300", activeTheme.textColor)}
          style={{ 
            fontFamily: activeFont.family,
            WebkitTextStroke: "0.5px currentColor"
          }}
        >
          هُوَ اللَّهُ الَّذِي لَا إِلَٰهَ إِلَّا هُوَ
        </h3>
        <div className={cn(
          "mt-1.5 text-[11px] font-black uppercase tracking-widest drop-shadow-sm flex items-center justify-center gap-1.5",
          activeTheme.isLight ? "text-slate-700" : "text-slate-200/80"
        )}>
          <Sparkles size={13} className="text-amber-400" />
          <span>أصل التوحيد وأعظم الذكر • اضغط للتفاصيل</span>
        </div>
      </motion.div>

      {/* ========================================================================= */}
      {/* 🚀 1. HORIZONTAL CAROUSEL VIEW (عرض أسماء الله الحسنى بشكل أفقي) */}
      {/* ========================================================================= */}
      {layout === 'horizontal' && (
        <div className="mx-1 space-y-3">
          {filteredNames.length === 0 ? (
            <div className="py-16 text-center bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-6">
              <Compass size={36} className="mx-auto text-slate-400 mb-2 opacity-50" />
              <p className="text-sm font-bold text-slate-500">لا توجد أسماء مطابقة لبحثك</p>
            </div>
          ) : (
            (() => {
              const currentItem = filteredNames[activeHorizontalIdx] || filteredNames[0];
              const isFav = favoriteIds.includes(currentItem.id);

              return (
                <div className="space-y-3">
                  
                  {/* Active Featured Card with Selected Frame & High Aesthetic */}
                  <motion.div
                    key={currentItem.id}
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: "spring", damping: 20, stiffness: 260 }}
                    className={cn(
                      "bg-gradient-to-br p-6 sm:p-8 rounded-3xl border shadow-2xl relative overflow-hidden text-center transition-all duration-300",
                      activeTheme.cardGradient,
                      activeTheme.borderColor,
                      activeTheme.shadowColor
                    )}
                  >
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-15 pointer-events-none" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/arabesque.png')" }} />
                    
                    {/* Top Card Bar: Number Badge + Action Icons */}
                    <div className="flex items-center justify-between relative z-10 mb-4">
                      {/* Name Order Badge */}
                      <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-mono font-black border backdrop-blur-md",
                        activeTheme.badgeBg,
                        activeTheme.borderColor,
                        activeTheme.textColor
                      )}>
                        #{currentItem.id} من 99
                      </span>

                      {/* Controls: Favorite, Copy, Share */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => toggleFavorite(currentItem.id, e)}
                          className={cn(
                            "w-9 h-9 rounded-full flex items-center justify-center border transition-all cursor-pointer active:scale-85",
                            isFav 
                              ? "bg-amber-400 text-slate-950 border-amber-300 shadow-md shadow-amber-400/30" 
                              : "bg-white/10 hover:bg-white/20 text-white border-white/20"
                          )}
                          title={isFav ? "إزالة من المفضلة" : "إضافة للمفضلة"}
                        >
                          <Star size={16} className={isFav ? "fill-slate-950" : ""} />
                        </button>

                        <button
                          onClick={(e) => handleCopy(currentItem, e)}
                          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 flex items-center justify-center transition-all cursor-pointer active:scale-85"
                          title="نسخ"
                        >
                          {copiedId === currentItem.id ? <Check size={16} className="text-emerald-300" /> : <Copy size={16} />}
                        </button>

                        <button
                          onClick={(e) => handleShare(currentItem, e)}
                          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 flex items-center justify-center transition-all cursor-pointer active:scale-85"
                          title="مشاركة"
                        >
                          <Share2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Frame Wrapper & Name Display */}
                    <div className="py-6 flex flex-col items-center justify-center relative z-10">
                      
                      {/* Geometric Ornamental Frame Container */}
                      <div 
                        onClick={() => setSelectedName(currentItem)}
                        className={cn(
                          "w-48 h-48 sm:w-56 sm:h-56 flex flex-col items-center justify-center p-4 relative group cursor-pointer transition-all duration-300 hover:scale-105 shadow-inner",
                          renderFrameClasses(frame),
                          activeTheme.borderColor,
                          "bg-black/20 backdrop-blur-md"
                        )}
                      >
                        {/* Frame specific decorations */}
                        {frame === 'royal' && (
                          <div className="absolute inset-2 border border-amber-300/30 rounded-xl pointer-events-none" />
                        )}
                        {frame === 'circle' && (
                          <div className="absolute inset-3 border border-dashed border-amber-300/30 rounded-full pointer-events-none" />
                        )}
                        {frame === 'star' && (
                          <div className="absolute inset-2 border border-amber-300/20 rounded-2xl rotate-45 pointer-events-none" />
                        )}

                        <span className="text-[10px] font-black text-amber-300/60 uppercase tracking-wider mb-1">
                          جلّ جلاله
                        </span>

                        <h3 
                          className={cn(
                            "text-4xl sm:text-5xl md:text-6xl font-black drop-shadow-[0_4px_10px_rgba(0,0,0,0.6)] leading-tight transition-all",
                            activeTheme.textColor
                          )}
                          style={{ 
                            fontFamily: activeFont.family,
                            WebkitTextStroke: "1px currentColor"
                          }}
                        >
                          {currentItem.name}
                        </h3>

                        <div className="mt-3 w-12 h-1 bg-amber-400/40 rounded-full group-hover:w-20 transition-all duration-300" />
                        <span className="text-[9px] font-bold text-slate-300/70 mt-2">اضغط لمعرفة الشرح والتدبر</span>
                      </div>

                      {/* Direct Meaning Preview */}
                      {showMeaning && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-6 bg-black/30 backdrop-blur-md p-4 rounded-2xl border border-white/10 max-w-lg mx-auto"
                        >
                          <div className="flex items-center justify-center gap-2 mb-1 text-[11px] font-black text-amber-300">
                            <BookOpen size={13} />
                            <span>المعنى والبيان:</span>
                          </div>
                          <p className="text-sm sm:text-base font-bold text-slate-100 leading-relaxed">
                            {currentItem.meaning}
                          </p>
                        </motion.div>
                      )}

                      {/* Mini Tasbih / Repetition Counter for this Name */}
                      <div className="mt-4 flex items-center justify-center gap-3">
                        <button
                          onClick={() => {
                            setTasbihCounter(c => c + 1);
                            triggerHaptic('light');
                          }}
                          className="px-5 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-400/20 active:scale-95 transition-all cursor-pointer"
                        >
                          <Sparkles size={16} />
                          <span>تكرار الذكر بالاسم ({tasbihCounter})</span>
                        </button>
                        {tasbihCounter > 0 && (
                          <button
                            onClick={() => {
                              setTasbihCounter(0);
                              triggerHaptic('light');
                            }}
                            className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-200 border border-white/15 text-xs font-bold transition-all cursor-pointer"
                            title="إعادة تصفير العداد"
                          >
                            <RotateCcw size={16} />
                          </button>
                        )}
                      </div>

                    </div>

                    {/* Navigation Bar: Prev / Next / AutoPlay */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/15 relative z-10">
                      
                      {/* Previous Name Button */}
                      <button
                        onClick={() => {
                          setActiveHorizontalIdx(prev => (prev > 0 ? prev - 1 : filteredNames.length - 1));
                          triggerHaptic('light');
                        }}
                        className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-black text-xs flex items-center gap-1.5 border border-white/20 transition-all cursor-pointer active:scale-90"
                      >
                        <ChevronRight size={18} />
                        <span>السابق</span>
                      </button>

                      {/* Center: Slideshow Autoplay Toggle & Position */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setIsAutoPlaying(!isAutoPlaying);
                            triggerHaptic('medium');
                          }}
                          className={cn(
                            "px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 border transition-all cursor-pointer active:scale-90",
                            isAutoPlaying 
                              ? "bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-500/30"
                              : "bg-white/10 text-white border-white/20 hover:bg-white/20"
                          )}
                          title={isAutoPlaying ? "إيقاف العرض التلقائي" : "تشغيل العرض التلقائي"}
                        >
                          {isAutoPlaying ? <Pause size={15} /> : <Play size={15} />}
                          <span className="hidden xs:inline">{isAutoPlaying ? 'إيقاف تلقائي' : 'عرض تلقائي'}</span>
                        </button>

                        <span className="text-xs font-mono font-black text-amber-300">
                          {activeHorizontalIdx + 1} / {filteredNames.length}
                        </span>
                      </div>

                      {/* Next Name Button */}
                      <button
                        onClick={() => {
                          setActiveHorizontalIdx(prev => (prev < filteredNames.length - 1 ? prev + 1 : 0));
                          triggerHaptic('light');
                        }}
                        className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-black text-xs flex items-center gap-1.5 border border-white/20 transition-all cursor-pointer active:scale-90"
                      >
                        <span>التالي</span>
                        <ChevronLeft size={18} />
                      </button>

                    </div>

                  </motion.div>

                  {/* Horizontal Interactive Filmstrip / Thumbnail Bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between px-1 text-xs font-black text-slate-500 dark:text-slate-400">
                      <span>شريط التمرير السريع (انقر للانتقال لأي اسم):</span>
                      <span className="font-mono">{activeHorizontalIdx + 1} / {filteredNames.length}</span>
                    </div>

                    <div 
                      ref={filmstripRef}
                      className="flex items-center gap-2 overflow-x-auto p-2 bg-slate-100 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 custom-scrollbar scroll-smooth"
                    >
                      {filteredNames.map((item, idx) => {
                        const isActive = idx === activeHorizontalIdx;
                        const isStarred = favoriteIds.includes(item.id);

                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              setActiveHorizontalIdx(idx);
                              triggerHaptic('light');
                            }}
                            className={cn(
                              "px-3 py-2.5 rounded-xl text-xs font-black shrink-0 border transition-all duration-200 flex flex-col items-center gap-1 min-w-[70px] cursor-pointer active:scale-90 relative",
                              isActive
                                ? cn("bg-gradient-to-r shadow-lg scale-105 z-10", activeTheme.gradient, activeTheme.borderColor, activeTheme.textColor)
                                : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-400"
                            )}
                          >
                            {isStarred && (
                              <Star size={10} className="text-amber-400 fill-amber-400 absolute top-1 left-1" />
                            )}
                            <span className="text-[10px] font-mono opacity-70">#{item.id}</span>
                            <span 
                              className="text-sm font-black whitespace-nowrap"
                              style={{ fontFamily: activeFont.family }}
                            >
                              {item.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                </div>
              );
            })()
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🚀 2. GRID 4-COL VIEW (الشبكة الكلاسيكية الرباعية) */}
      {/* ========================================================================= */}
      {layout === 'grid4' && (
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2.5 px-1" style={{ perspective: '1200px' }}>
          {filteredNames.map((item, index) => {
            const isFav = favoriteIds.includes(item.id);

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  delay: Math.min(index * 0.008, 0.3),
                  type: "spring",
                  stiffness: 120
                }}
                whileHover={{ scale: 1.04, z: 10 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => {
                  setSelectedName(item);
                  triggerHaptic('light');
                }}
                className="relative group cursor-pointer"
              >
                <div 
                  className={cn(
                    "bg-gradient-to-br border shadow-md flex flex-col items-center justify-center text-center p-1 sm:p-2 relative overflow-hidden transition-all duration-300 group-hover:border-amber-400/70",
                    renderFrameClasses(frame),
                    activeTheme.cardGradient,
                    activeTheme.borderColor,
                    activeTheme.shadowColor
                  )}
                >
                  {/* Subtle Pattern */}
                  <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/arabesque.png')" }} />
                  
                  {/* Top: Star Favorite Icon if marked */}
                  {isFav && (
                    <div className="absolute top-1 left-1 bg-amber-400/90 text-slate-950 p-0.5 rounded-full z-10 shadow-sm">
                      <Star size={9} className="fill-slate-950" />
                    </div>
                  )}

                  {/* Order Number Badge */}
                  {showNumber && (
                    <span className="text-[9px] sm:text-[10px] font-mono font-bold opacity-60 mb-0.5" style={{ color: activeTheme.accentColor }}>
                      #{item.id}
                    </span>
                  )}

                  {/* Name typography */}
                  <h3 
                    className={cn(
                      "font-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] leading-tight px-0.5",
                      getFontSizeClass(true),
                      activeTheme.textColor
                    )}
                    style={{ 
                      fontFamily: activeFont.family,
                      WebkitTextStroke: "0.5px currentColor"
                    }}
                  >
                    {item.name}
                  </h3>
                  
                  <div className="mt-1.5 w-4 h-0.5 bg-amber-200/50 rounded-full group-hover:w-8 transition-all duration-300" />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🚀 3. GRID 2-COL VIEW (شبكة ثنائية مريحة مع المعاني) */}
      {/* ========================================================================= */}
      {layout === 'grid2' && (
        <div className="grid grid-cols-2 gap-2.5 px-1">
          {filteredNames.map((item, index) => {
            const isFav = favoriteIds.includes(item.id);

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: Math.min(index * 0.01, 0.3) }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  setSelectedName(item);
                  triggerHaptic('light');
                }}
                className={cn(
                  "bg-gradient-to-br p-3.5 rounded-3xl border shadow-lg relative overflow-hidden flex flex-col justify-between cursor-pointer group transition-all duration-300 hover:border-amber-400",
                  activeTheme.cardGradient,
                  activeTheme.borderColor,
                  activeTheme.shadowColor
                )}
              >
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/arabesque.png')" }} />
                
                <div className="flex items-center justify-between relative z-10 mb-2">
                  <span className={cn("text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-white/10", activeTheme.badgeBg, activeTheme.textColor)}>
                    #{item.id}
                  </span>
                  <button
                    onClick={(e) => toggleFavorite(item.id, e)}
                    className="p-1 text-amber-400 hover:scale-125 transition-transform"
                  >
                    <Star size={15} className={isFav ? "fill-amber-400" : "opacity-40"} />
                  </button>
                </div>

                <div className="py-2 text-center relative z-10">
                  <h3 
                    className={cn("text-2xl sm:text-3xl font-black drop-shadow-md", activeTheme.textColor)}
                    style={{ fontFamily: activeFont.family }}
                  >
                    {item.name}
                  </h3>
                </div>

                {showMeaning && (
                  <p className="text-[11px] font-bold text-slate-200/90 leading-snug line-clamp-2 text-center relative z-10 bg-black/20 p-2 rounded-xl border border-white/5">
                    {item.meaning}
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🚀 4. DETAILED LIST VIEW (قائمة رأسية مفصلة مع الشرح) */}
      {/* ========================================================================= */}
      {layout === 'list' && (
        <div className="space-y-2 px-1">
          {filteredNames.map((item, index) => {
            const isFav = favoriteIds.includes(item.id);

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(index * 0.01, 0.3) }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setSelectedName(item);
                  triggerHaptic('light');
                }}
                className={cn(
                  "bg-gradient-to-r p-3.5 sm:p-4 rounded-2xl border shadow-md flex items-center justify-between gap-3 cursor-pointer group transition-all duration-200 hover:border-amber-400",
                  activeTheme.cardGradient,
                  activeTheme.borderColor
                )}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border shadow-inner",
                    activeTheme.badgeBg,
                    activeTheme.borderColor
                  )}>
                    <span className={cn("text-xs font-mono font-black", activeTheme.textColor)}>
                      #{item.id}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <h3 
                      className={cn("text-xl sm:text-2xl font-black leading-tight", activeTheme.textColor)}
                      style={{ fontFamily: activeFont.family }}
                    >
                      {item.name}
                    </h3>
                    <p className="text-xs font-bold text-slate-200/90 truncate mt-0.5">
                      {item.meaning}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={(e) => toggleFavorite(item.id, e)}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-amber-400 transition-all"
                  >
                    <Star size={16} className={isFav ? "fill-amber-400" : ""} />
                  </button>
                  <ChevronLeft size={16} className="text-slate-400 group-hover:text-amber-400 group-hover:-translate-x-1 transition-all" />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🚀 5. FOCUS MEDITATION MODE (وضع التدبر والتسبيح الفردي) */}
      {/* ========================================================================= */}
      {layout === 'focus' && (
        <div className="mx-1 space-y-4">
          {(() => {
            const currentItem = filteredNames[activeHorizontalIdx] || filteredNames[0];
            if (!currentItem) return null;
            const isFav = favoriteIds.includes(currentItem.id);

            return (
              <div className="space-y-3">
                <div className={cn(
                  "bg-gradient-to-br p-6 sm:p-8 rounded-3xl border shadow-2xl text-center relative overflow-hidden",
                  activeTheme.cardGradient,
                  activeTheme.borderColor
                )}>
                  <div className="absolute inset-0 opacity-15 pointer-events-none" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/arabesque.png')" }} />
                  
                  <div className="flex items-center justify-between relative z-10 mb-6">
                    <span className={cn("px-3 py-1 rounded-full text-xs font-mono font-black border", activeTheme.badgeBg, activeTheme.borderColor, activeTheme.textColor)}>
                      الاسم المبارك #{currentItem.id}
                    </span>
                    <button
                      onClick={(e) => toggleFavorite(currentItem.id, e)}
                      className="p-2 rounded-full bg-white/10 text-amber-400"
                    >
                      <Star size={18} className={isFav ? "fill-amber-400" : ""} />
                    </button>
                  </div>

                  <div className="py-4 relative z-10">
                    <span className="text-xs font-bold text-amber-300/80 uppercase tracking-widest block mb-2">جل جلاله وتعالت أسماؤه</span>
                    <h2 
                      className={cn("text-5xl sm:text-6xl md:text-7xl font-black drop-shadow-lg", activeTheme.textColor)}
                      style={{ fontFamily: activeFont.family }}
                    >
                      {currentItem.name}
                    </h2>
                  </div>

                  <div className="bg-black/30 backdrop-blur-md p-5 rounded-2xl border border-white/10 max-w-md mx-auto my-4 relative z-10">
                    <p className="text-base sm:text-lg font-bold text-slate-100 leading-relaxed">
                      {currentItem.meaning}
                    </p>
                  </div>

                  {/* Interactive Meditation Tasbih Counter */}
                  <div className="py-2 relative z-10">
                    <button
                      onClick={() => {
                        setTasbihCounter(c => c + 1);
                        triggerHaptic('light');
                      }}
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-full mx-auto bg-gradient-to-tr from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 flex flex-col items-center justify-center shadow-xl shadow-amber-500/30 border-4 border-white/30 cursor-pointer active:scale-90 transition-transform"
                    >
                      <span className="text-2xl sm:text-3xl font-black font-mono">{tasbihCounter}</span>
                      <span className="text-[10px] font-black">سبّح بالاسم</span>
                    </button>
                  </div>

                  {/* Navigation buttons */}
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/15 relative z-10">
                    <button
                      onClick={() => {
                        setActiveHorizontalIdx(prev => (prev > 0 ? prev - 1 : filteredNames.length - 1));
                        triggerHaptic('light');
                      }}
                      className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1"
                    >
                      <ChevronRight size={16} />
                      <span>السابق</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveHorizontalIdx(prev => (prev < filteredNames.length - 1 ? prev + 1 : 0));
                        triggerHaptic('light');
                      }}
                      className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1"
                    >
                      <span>التالي</span>
                      <ChevronLeft size={16} />
                    </button>
                  </div>

                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* 🤲 Bottom Dua Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          setShowDuaModal(true);
          triggerHaptic('light');
        }}
        className={cn(
          "-mx-1 bg-gradient-to-br p-5 sm:p-6 rounded-2xl sm:rounded-3xl border shadow-xl relative overflow-hidden cursor-pointer group transition-all duration-300",
          activeTheme.cardGradient,
          activeTheme.borderColor,
          activeTheme.shadowColor
        )}
      >
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/arabesque.png')" }} />
        
        <p 
          className={cn("text-base sm:text-lg md:text-xl leading-[1.8] text-center font-bold drop-shadow-sm group-hover:scale-[1.01] transition-transform duration-300", activeTheme.textColor)}
          style={{ 
            fontFamily: activeFont.family,
            WebkitTextStroke: "0.5px currentColor"
          }}
        >
          اللهمَّ إنِّي عبدُك، ابنُ عبدِك، ابنُ أمَتِك، ناصيتي بيدِك، ماضٍ فيَّ حُكمُك، عدلٌ فيَّ قضاؤُك، أسألُك اللهمَّ بكلِّ اسمٍ هو لك سمَّيتَ به نفسَك، أو أنزلته في كتابِك، أو علَّمته أحدًا مِن خلقِك، أو استأثرت به في علمِ الغيبِ عندَك، أن تجعلَ القرآنَ ربيعَ قلبِي، ونورَ صدرِي، وجلاءَ حزني، وذَهابَ همِّي وغمِّي.
        </p>

        {/* Hadith Status Badge */}
        <div className="mt-3 flex items-center justify-center">
          <span className="text-[11px] font-black px-2.5 py-1 rounded-full bg-black/30 text-amber-300/90 border border-amber-500/20 shadow-inner">
            خلاصة حكم المحدث : إسناده صحيح
          </span>
        </div>

        <div className={cn(
          "mt-2 text-center text-[11px] font-black uppercase tracking-widest drop-shadow-sm flex items-center justify-center gap-1.5",
          activeTheme.isLight ? "text-slate-700" : "text-slate-200/80"
        )}>
          <BookOpen size={13} className="text-amber-400" />
          <span>دعاء تفريج الهم بالأسماء الحسنى • اضغط لمعرفة فضله وأثره</span>
        </div>
      </motion.div>

      {/* ========================================================================= */}
      {/* ⚙️ MODERN SMART SETTINGS MODAL / SHEET (نافذة الإعدادات الشاملة) */}
      {/* ========================================================================= */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showSettingsModal && (
            <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto overscroll-contain">
              
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowSettingsModal(false)}
                className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
              />

              {/* Settings Panel */}
              <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 100 }}
                transition={{ type: "spring", damping: 25, stiffness: 280 }}
                className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col my-auto overflow-hidden shadow-2xl relative z-10 border border-slate-200 dark:border-slate-800"
                dir="rtl"
              >
                {/* Header of Settings */}
                <div className={cn(
                  "bg-gradient-to-r p-4 sm:p-5 text-white relative flex items-center justify-between shrink-0 shadow-md",
                  activeTheme.gradient
                )}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
                      <Sliders size={20} className="text-amber-300" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-amber-300">إعدادات أسماء الله الحسنى</h3>
                      <p className="text-xs text-slate-200 font-bold">تخصيص طرق العرض، الإطارات، الخطوط والألوان</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowSettingsModal(false)}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Tabs Navigation */}
                <div className="flex items-center justify-between p-2 bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 overflow-x-auto custom-scrollbar shrink-0">
                  {[
                    { id: 'layout', label: 'العرض والتنقل', icon: Layers },
                    { id: 'frames', label: 'الإطارات والأشكال', icon: Compass },
                    { id: 'fonts', label: 'الخطوط العربية', icon: Type },
                    { id: 'themes', label: 'الألوان والمظهر', icon: Palette },
                    { id: 'extras', label: 'خيارات إضافية', icon: Eye }
                  ].map(tab => {
                    const TabIcon = tab.icon;
                    const isActive = settingsTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setSettingsTab(tab.id as any);
                          triggerHaptic('light');
                        }}
                        className={cn(
                          "px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0",
                          isActive
                            ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20 font-black"
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
                        )}
                      >
                        <TabIcon size={14} />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Tab Contents Area */}
                <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
                  
                  {/* 1. Layout & Display Mode Tab */}
                  {settingsTab === 'layout' && (
                    <div className="space-y-4">
                      <div className="text-right">
                        <h4 className="text-sm font-black text-slate-800 dark:text-slate-100">نمط عرض الأسماء</h4>
                        <p className="text-xs text-slate-500">اختر طريقة تصفح أسماء الله الحسنى المفضلة لديك</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        
                        {/* Horizontal View (Requested) */}
                        <div
                          onClick={() => {
                            updateSettings({ namesOfAllahLayout: 'horizontal' });
                            triggerHaptic('light');
                          }}
                          className={cn(
                            "p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-3 relative overflow-hidden",
                            layout === 'horizontal'
                              ? "border-amber-500 bg-amber-50 dark:bg-amber-950/30 text-slate-900 dark:text-white"
                              : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:border-slate-300"
                          )}
                        >
                          <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-500 flex items-center justify-center shrink-0">
                            <SlidersHorizontal size={20} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black">أفقي متسلسل (سلايدر)</span>
                              {layout === 'horizontal' && <CheckCircle2 size={16} className="text-amber-500" />}
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">بطاقات أفقية تفاعلية مع شريط تمرير سريع</p>
                          </div>
                        </div>

                        {/* 4-Col Grid */}
                        <div
                          onClick={() => {
                            updateSettings({ namesOfAllahLayout: 'grid4' });
                            triggerHaptic('light');
                          }}
                          className={cn(
                            "p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-3 relative overflow-hidden",
                            layout === 'grid4'
                              ? "border-amber-500 bg-amber-50 dark:bg-amber-950/30 text-slate-900 dark:text-white"
                              : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:border-slate-300"
                          )}
                        >
                          <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-500 flex items-center justify-center shrink-0">
                            <Grid size={20} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black">شبكة رباعية (4 أعمدة)</span>
                              {layout === 'grid4' && <CheckCircle2 size={16} className="text-amber-500" />}
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">عرض شامل وموجز لجميع الأسماء</p>
                          </div>
                        </div>

                        {/* 2-Col Grid */}
                        <div
                          onClick={() => {
                            updateSettings({ namesOfAllahLayout: 'grid2' });
                            triggerHaptic('light');
                          }}
                          className={cn(
                            "p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-3 relative overflow-hidden",
                            layout === 'grid2'
                              ? "border-amber-500 bg-amber-50 dark:bg-amber-950/30 text-slate-900 dark:text-white"
                              : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:border-slate-300"
                          )}
                        >
                          <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-500 flex items-center justify-center shrink-0">
                            <Layers size={20} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black">شبكة ثنائية مريحة</span>
                              {layout === 'grid2' && <CheckCircle2 size={16} className="text-amber-500" />}
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">بطاقات متوسطة تعرض الاسم والمعنى</p>
                          </div>
                        </div>

                        {/* Detailed List */}
                        <div
                          onClick={() => {
                            updateSettings({ namesOfAllahLayout: 'list' });
                            triggerHaptic('light');
                          }}
                          className={cn(
                            "p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-3 relative overflow-hidden",
                            layout === 'list'
                              ? "border-amber-500 bg-amber-50 dark:bg-amber-950/30 text-slate-900 dark:text-white"
                              : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:border-slate-300"
                          )}
                        >
                          <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-500 flex items-center justify-center shrink-0">
                            <ListFilter size={20} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black">قائمة تفصيلية</span>
                              {layout === 'list' && <CheckCircle2 size={16} className="text-amber-500" />}
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">قائمة رأسية مع المعنى الكامل وميزة الصوت</p>
                          </div>
                        </div>

                        {/* Focus / Meditation */}
                        <div
                          onClick={() => {
                            updateSettings({ namesOfAllahLayout: 'focus' });
                            triggerHaptic('light');
                          }}
                          className={cn(
                            "p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-3 relative overflow-hidden sm:col-span-2",
                            layout === 'focus'
                              ? "border-amber-500 bg-amber-50 dark:bg-amber-950/30 text-slate-900 dark:text-white"
                              : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:border-slate-300"
                          )}
                        >
                          <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-500 flex items-center justify-center shrink-0">
                            <Compass size={20} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black">وضع التدبر والتسبيح الفردي</span>
                              {layout === 'focus' && <CheckCircle2 size={16} className="text-amber-500" />}
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">بطاقة فردية واسعة مخصصة للتأمل وعداد الذكر</p>
                          </div>
                        </div>

                      </div>
                    </div>
                  )}

                  {/* 2. Frames & Geometric Shapes Tab (Requested) */}
                  {settingsTab === 'frames' && (
                    <div className="space-y-4">
                      <div className="text-right">
                        <h4 className="text-sm font-black text-slate-800 dark:text-slate-100">إطارات وأشكال بطاقات الأسماء</h4>
                        <p className="text-xs text-slate-500">اختر الشكل الهندسي المفضل لإبراز أسماء الله الحسنى</p>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {FRAMES_CONFIG.map(f => {
                          const isSelected = frame === f.id;

                          return (
                            <div
                              key={f.id}
                              onClick={() => {
                                updateSettings({ namesOfAllahFrame: f.id });
                                triggerHaptic('light');
                              }}
                              className={cn(
                                "p-3 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center text-center gap-2 relative overflow-hidden group",
                                isSelected
                                  ? "border-amber-500 bg-amber-50 dark:bg-amber-950/30 shadow-md shadow-amber-500/10"
                                  : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:border-slate-300"
                              )}
                            >
                              {/* Shape Visual Representation */}
                              <div 
                                className={cn(
                                  "w-14 h-14 flex items-center justify-center text-lg font-black transition-transform group-hover:scale-110",
                                  renderFrameClasses(f.id),
                                  isSelected ? "bg-amber-400 text-slate-950 border-amber-500 shadow-md" : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600"
                                )}
                              >
                                {f.iconLabel}
                              </div>

                              <div>
                                <span className={cn(
                                  "text-xs font-black block leading-tight",
                                  isSelected ? "text-amber-600 dark:text-amber-400" : "text-slate-800 dark:text-slate-200"
                                )}>
                                  {f.name}
                                </span>
                                <span className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                                  {f.desc}
                                </span>
                              </div>

                              {isSelected && (
                                <div className="absolute top-1.5 left-1.5 bg-amber-500 text-slate-950 rounded-full p-0.5">
                                  <Check size={12} strokeWidth={3} />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 3. Arabic Calligraphy Fonts Tab (Requested) */}
                  {settingsTab === 'fonts' && (
                    <div className="space-y-4">
                      <div className="text-right">
                        <h4 className="text-sm font-black text-slate-800 dark:text-slate-100">نوع الخط العربي لأسماء الله</h4>
                        <p className="text-xs text-slate-500">اختر من بين أجمل وأرقى الخطوط العربية المعتمدة للأسماء الحسنى</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {FONTS_LIST.map(f => {
                          const isSelected = fontFamilyId === f.id;

                          return (
                            <div
                              key={f.id}
                              onClick={() => {
                                updateSettings({ namesOfAllahFontFamily: f.id });
                                triggerHaptic('light');
                              }}
                              className={cn(
                                "p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between gap-2 relative overflow-hidden",
                                isSelected
                                  ? "border-amber-500 bg-amber-50 dark:bg-amber-950/30 shadow-md shadow-amber-500/10"
                                  : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:border-slate-300"
                              )}
                            >
                              <div className="flex items-center justify-between">
                                <span className={cn(
                                  "text-xs font-black",
                                  isSelected ? "text-amber-600 dark:text-amber-400" : "text-slate-800 dark:text-slate-200"
                                )}>
                                  {f.name}
                                </span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-200/60 dark:bg-slate-700/60 text-slate-500 dark:text-slate-400">
                                  {f.category}
                                </span>
                              </div>

                              {/* Big Font Preview */}
                              <div className="py-2 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800/60">
                                <span 
                                  className="text-2xl font-black text-slate-900 dark:text-amber-300 drop-shadow-sm block"
                                  style={{ fontFamily: f.family }}
                                >
                                  {f.preview}
                                </span>
                              </div>

                              {isSelected && (
                                <div className="absolute top-2 left-2 bg-amber-500 text-slate-950 rounded-full p-0.5">
                                  <Check size={12} strokeWidth={3} />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 4. Color Themes Tab */}
                  {settingsTab === 'themes' && (
                    <div className="space-y-4">
                      <div className="text-right">
                        <h4 className="text-sm font-black text-slate-800 dark:text-slate-100">ألوان وثيمات البطاقات</h4>
                        <p className="text-xs text-slate-500">اختر الطابع اللوني الفخم المفضل لقسم أسماء الله</p>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {(Object.keys(THEMES_CONFIG) as ThemeColor[]).map(key => {
                          const t = THEMES_CONFIG[key];
                          const isSelected = theme === key;

                          return (
                            <div
                              key={key}
                              onClick={() => {
                                updateSettings({ namesOfAllahTheme: key });
                                triggerHaptic('light');
                              }}
                              className={cn(
                                "p-3 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center gap-2 text-center relative overflow-hidden group",
                                isSelected
                                  ? "border-amber-500 shadow-lg shadow-amber-500/20 scale-102"
                                  : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                              )}
                            >
                              {/* Theme Swatch */}
                              <div className={cn(
                                "w-full h-14 rounded-xl bg-gradient-to-r flex items-center justify-center border shadow-inner transition-transform group-hover:scale-105",
                                t.gradient,
                                t.borderColor
                              )}>
                                <span 
                                  className={cn("text-base font-black drop-shadow-sm", t.textColor)}
                                  style={{ fontFamily: activeFont.family }}
                                >
                                  الرَّحْمَنُ
                                </span>
                              </div>

                              <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                                {t.name}
                              </span>

                              {isSelected && (
                                <div className="absolute top-1.5 left-1.5 bg-amber-500 text-slate-950 rounded-full p-0.5">
                                  <Check size={12} strokeWidth={3} />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 5. Extras & Advanced Tab */}
                  {settingsTab === 'extras' && (
                    <div className="space-y-4">
                      <div className="text-right">
                        <h4 className="text-sm font-black text-slate-800 dark:text-slate-100">خيارات متقدمة وذكية</h4>
                        <p className="text-xs text-slate-500">تخصيص حجم النصوص، الشروحات وسرعة العرض</p>
                      </div>

                      {/* Font Size Selector */}
                      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-slate-800 dark:text-slate-200">حجم خط أسماء الله:</span>
                          <span className="text-xs font-bold text-amber-500">
                            {fontSize === 'small' ? 'صغير' : fontSize === 'medium' ? 'متوسط' : fontSize === 'large' ? 'كبير' : 'كبير جداً'}
                          </span>
                        </div>
                        <div className="grid grid-cols-4 gap-2 pt-1">
                          {[
                            { id: 'small', label: 'صغير' },
                            { id: 'medium', label: 'متوسط' },
                            { id: 'large', label: 'كبير' },
                            { id: 'xlarge', label: 'كبير جداً' }
                          ].map(item => (
                            <button
                              key={item.id}
                              onClick={() => {
                                updateSettings({ namesOfAllahFontSize: item.id as any });
                                triggerHaptic('light');
                              }}
                              className={cn(
                                "py-2 rounded-xl text-xs font-black border transition-all cursor-pointer",
                                fontSize === item.id
                                  ? "bg-amber-400 text-slate-950 border-amber-500 shadow-sm"
                                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                              )}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Toggle: Show Meaning on Cards */}
                      <div 
                        onClick={() => {
                          updateSettings({ namesOfAllahShowMeaning: !showMeaning });
                          triggerHaptic('light');
                        }}
                        className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between cursor-pointer"
                      >
                        <div>
                          <span className="text-xs font-black text-slate-800 dark:text-slate-200 block">إظهار شرح ومعنى الاسم على البطاقات</span>
                          <span className="text-[11px] text-slate-400">عرض المعنى التفسيري مباشرة تحت الاسم</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={showMeaning}
                          onChange={() => {}}
                          className="w-5 h-5 rounded text-amber-500 focus:ring-amber-400"
                        />
                      </div>

                      {/* Toggle: Show Number */}
                      <div 
                        onClick={() => {
                          updateSettings({ namesOfAllahShowNumber: !showNumber });
                          triggerHaptic('light');
                        }}
                        className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between cursor-pointer"
                      >
                        <div>
                          <span className="text-xs font-black text-slate-800 dark:text-slate-200 block">إظهار تسلسل أرقام الأسماء (1-99)</span>
                          <span className="text-[11px] text-slate-400">عرض رقم الترتيب فوق كل بطاقة</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={showNumber}
                          onChange={() => {}}
                          className="w-5 h-5 rounded text-amber-500 focus:ring-amber-400"
                        />
                      </div>

                      {/* AutoPlay Speed Slider */}
                      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-slate-800 dark:text-slate-200">سرعة العرض التلقائي (الأفقي):</span>
                          <span className="text-xs font-mono font-bold text-amber-500">{autoPlaySpeed} ثوانٍ</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {[3, 4, 5, 7, 10].map(s => (
                            <button
                              key={s}
                              onClick={() => {
                                updateSettings({ namesOfAllahAutoPlaySpeed: s });
                                triggerHaptic('light');
                              }}
                              className={cn(
                                "flex-1 py-1.5 rounded-xl text-xs font-mono font-black border transition-all cursor-pointer",
                                autoPlaySpeed === s
                                  ? "bg-amber-400 text-slate-950 border-amber-500"
                                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                              )}
                            >
                              {s}ث
                            </button>
                          ))}
                        </div>
                      </div>

                    </div>
                  )}

                </div>

                {/* Footer of Settings */}
                <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
                  <button
                    onClick={() => {
                      updateSettings({
                        namesOfAllahLayout: 'grid4',
                        namesOfAllahFrame: 'rounded',
                        namesOfAllahFontFamily: 'Amiri',
                        namesOfAllahFontSize: 'medium',
                        namesOfAllahTheme: 'burgundy',
                        namesOfAllahShowMeaning: true,
                        namesOfAllahShowNumber: true,
                        namesOfAllahAutoPlaySpeed: 4
                      });
                      triggerHaptic('medium');
                    }}
                    className="text-xs font-black text-rose-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw size={14} />
                    <span>استعادة الافتراضي</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowSettingsModal(false);
                      triggerHaptic('success');
                    }}
                    className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-lg shadow-amber-400/20 active:scale-95 transition-all cursor-pointer"
                  >
                    حفظ وتطبيق
                  </button>
                </div>

              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* ========================================================================= */}
      {/* 🌟 EXISTING DETAILED MODALS (Virtue, Name Detail, Dhikr, Dua) */}
      {/* ========================================================================= */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          
          {/* 1. Virtue Modal */}
          {showVirtueModal && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-4 overflow-y-auto overscroll-contain">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowVirtueModal(false)}
                className="fixed inset-0 bg-slate-950/75 backdrop-blur-md"
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 15 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-[360px] max-h-[85vh] flex flex-col my-auto overflow-hidden shadow-2xl relative z-10 border border-white/20 dark:border-slate-800"
                dir="rtl"
              >
                <div className={cn("h-32 bg-gradient-to-br relative flex flex-col items-center justify-center p-4 text-center shrink-0", activeTheme.gradient)}>
                  <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/arabesque.png')" }} />
                  <button 
                    onClick={() => setShowVirtueModal(false)}
                    className="absolute top-3 left-3 w-8 h-8 bg-rose-500/90 text-white rounded-full flex items-center justify-center hover:bg-rose-600 transition-all cursor-pointer shadow-md"
                  >
                    <X size={16} />
                  </button>
                  <h3 className="text-2xl font-black text-amber-300 drop-shadow-md" style={{ fontFamily: activeFont.family }}>{virtueContent.title}</h3>
                </div>
                <div className="p-5 sm:p-6 text-center overflow-y-auto custom-scrollbar flex-1 space-y-4">
                  <div>
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                      <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">قال رسول الله ﷺ</span>
                      <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                      <p className="text-base sm:text-lg leading-relaxed text-slate-800 dark:text-slate-200 font-bold" style={{ fontFamily: activeFont.family }}>"{virtueContent.hadith}"</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                      <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">معنى أحصاها</span>
                      <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                    </div>
                    <div className="bg-rose-50 dark:bg-rose-900/20 p-4 rounded-2xl border border-rose-100 dark:border-rose-900/30">
                      <p className="text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300 font-medium">{virtueContent.meaning}</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => setShowVirtueModal(false)} 
                    className="w-full py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 rounded-2xl font-black text-sm shadow-lg shadow-amber-400/20 transition-all cursor-pointer active:scale-95"
                  >
                    سبحان الله وبحمده
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {/* 2. Name Detail Modal */}
          {selectedName && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-4 overflow-y-auto overscroll-contain">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedName(null)}
                className="fixed inset-0 bg-slate-950/75 backdrop-blur-md"
              />
              
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 15 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-[360px] max-h-[85vh] flex flex-col my-auto overflow-hidden shadow-2xl relative z-10 border border-white/20 dark:border-slate-800"
                dir="rtl"
              >
                <div className={cn("h-40 bg-gradient-to-br relative flex flex-col items-center justify-center p-4 text-center shrink-0", activeTheme.gradient)}>
                  <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/arabesque.png')" }} />
                  
                  {/* Close button */}
                  <button 
                    onClick={() => setSelectedName(null)}
                    className="absolute top-3 left-3 w-8 h-8 bg-rose-500/90 text-white rounded-full flex items-center justify-center hover:bg-rose-600 transition-all cursor-pointer shadow-md"
                  >
                    <X size={16} />
                  </button>
                  
                  {/* Share button */}
                  <button 
                    onClick={(e) => handleShare(selectedName, e)}
                    className="absolute top-3 right-3 w-8 h-8 bg-amber-400/20 text-amber-300 rounded-full flex items-center justify-center hover:bg-amber-400/30 transition-all cursor-pointer border border-amber-300/30"
                    title="مشاركة"
                  >
                    <Share2 size={16} />
                  </button>

                  <span className="text-[10px] font-mono font-bold text-amber-300/70 mb-1">الاسم #{selectedName.id}</span>
                  
                  <h3 
                    className="text-5xl sm:text-6xl font-black text-amber-300 drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]" 
                    style={{ fontFamily: activeFont.family, WebkitTextStroke: "1.5px currentColor" }}
                  >
                    {selectedName.name}
                  </h3>
                </div>

                <div className="p-5 sm:p-6 text-center overflow-y-auto custom-scrollbar flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-center gap-3 mb-3">
                      <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                      <div className="bg-amber-50 dark:bg-amber-900/30 p-1.5 rounded-xl"><Sparkles size={16} className="text-amber-500" /></div>
                      <span className="text-xs font-black text-slate-400 uppercase tracking-widest">المعنى والشرح</span>
                      <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-950/60 p-4 sm:p-5 rounded-2xl border border-slate-100 dark:border-slate-800/80 relative group min-h-[90px] flex items-center justify-center">
                      <p className="text-base sm:text-lg leading-relaxed text-slate-800 dark:text-slate-200 font-bold">{selectedName.meaning}</p>
                    </div>

                    {/* Quick Star in Modal */}
                    <div className="flex items-center justify-center gap-2 mt-3">
                      <button
                        onClick={(e) => toggleFavorite(selectedName.id, e)}
                        className={cn(
                          "px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 border transition-all cursor-pointer",
                          favoriteIds.includes(selectedName.id)
                            ? "bg-amber-400 text-slate-950 border-amber-500 font-black"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700"
                        )}
                      >
                        <Star size={15} className={favoriteIds.includes(selectedName.id) ? "fill-slate-950" : ""} />
                        <span>{favoriteIds.includes(selectedName.id) ? "في المفضلة" : "إضافة للمفضلة"}</span>
                      </button>
                    </div>
                  </div>

                  <button 
                    onClick={() => setSelectedName(null)} 
                    className="w-full py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 rounded-2xl font-black text-sm shadow-lg shadow-amber-400/20 transition-all cursor-pointer active:scale-95"
                  >
                    تأمّل عظمته.. لتزداد به يقيناً
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {/* 3. Dhikr Modal */}
          {showDhikrModal && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-4 overflow-y-auto overscroll-contain">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowDhikrModal(false)}
                className="fixed inset-0 bg-slate-950/75 backdrop-blur-md"
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 15 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-[360px] max-h-[85vh] flex flex-col my-auto overflow-hidden shadow-2xl relative z-10 border border-white/20 dark:border-slate-800"
                dir="rtl"
              >
                <div className={cn("h-36 bg-gradient-to-br relative flex flex-col items-center justify-center p-4 text-center shrink-0", activeTheme.gradient)}>
                  <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/arabesque.png')" }} />
                  <button 
                    onClick={() => setShowDhikrModal(false)}
                    className="absolute top-3 left-3 w-8 h-8 bg-rose-500/90 text-white rounded-full flex items-center justify-center hover:bg-rose-600 transition-all cursor-pointer shadow-md"
                  >
                    <X size={16} />
                  </button>
                  <h3 className="text-2xl font-black text-amber-300 drop-shadow-md leading-relaxed px-2" style={{ fontFamily: activeFont.family }}>{dhikrContent.title}</h3>
                </div>
                <div className="p-5 sm:p-6 text-center overflow-y-auto custom-scrollbar flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-center gap-3 mb-3">
                      <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                      <div className="bg-amber-50 dark:bg-amber-900/30 p-1.5 rounded-xl"><BookOpen size={16} className="text-amber-500" /></div>
                      <span className="text-xs font-black text-slate-400 uppercase tracking-widest">شرح الذكر</span>
                      <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-950/60 p-4 sm:p-5 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                      <p className="text-xs sm:text-sm leading-relaxed text-slate-800 dark:text-slate-200 font-medium">{dhikrContent.meaning}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowDhikrModal(false)} 
                    className="w-full py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 rounded-2xl font-black text-sm shadow-lg shadow-amber-400/20 transition-all cursor-pointer active:scale-95"
                  >
                    تقبل الله منا ومنكم
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {/* 4. Dua Modal */}
          {showDuaModal && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-4 overflow-y-auto overscroll-contain">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowDuaModal(false)}
                className="fixed inset-0 bg-slate-950/75 backdrop-blur-md"
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 15 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-[360px] max-h-[85vh] flex flex-col my-auto overflow-hidden shadow-2xl relative z-10 border border-white/20 dark:border-slate-800"
                dir="rtl"
              >
                <div className={cn("h-32 bg-gradient-to-br relative flex flex-col items-center justify-center p-4 text-center shrink-0", activeTheme.gradient)}>
                  <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/arabesque.png')" }} />
                  <button 
                    onClick={() => setShowDuaModal(false)}
                    className="absolute top-3 left-3 w-8 h-8 bg-rose-500/90 text-white rounded-full flex items-center justify-center hover:bg-rose-600 transition-all cursor-pointer shadow-md"
                  >
                    <X size={16} />
                  </button>
                  <h3 className="text-xl sm:text-2xl font-black text-amber-300 drop-shadow-md" style={{ fontFamily: activeFont.family }}>{duaContent.title}</h3>
                </div>
                <div className="p-5 sm:p-6 text-center overflow-y-auto custom-scrollbar flex-1 space-y-4">
                  <div>
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                      <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">نص الدعاء العظيم</span>
                      <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                      <p className="text-xs sm:text-sm leading-relaxed text-slate-800 dark:text-slate-200 font-bold" style={{ fontFamily: activeFont.family }}>"{duaContent.meaning}"</p>
                      <div className="mt-2.5 inline-block text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        {duaContent.status}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                      <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">أثر هذا الدعاء العظيم</span>
                      <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                    </div>
                    <div className="bg-rose-50 dark:bg-rose-900/20 p-4 rounded-2xl border border-rose-100 dark:border-rose-900/30">
                      <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 font-medium">{duaContent.virtue}</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => setShowDuaModal(false)} 
                    className="w-full py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 rounded-2xl font-black text-sm shadow-lg shadow-amber-400/20 transition-all cursor-pointer active:scale-95"
                  >
                    آمين، يا رب العالمين
                  </button>
                </div>
              </motion.div>
            </div>
          )}

        </AnimatePresence>,
        document.body
      )}

    </div>
  );
};
