import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Sparkles, 
  Search, 
  Share2, 
  Copy, 
  Bookmark, 
  BookmarkCheck, 
  Heart, 
  ChevronDown, 
  ChevronUp, 
  SlidersHorizontal, 
  Settings2, 
  Check, 
  Plus, 
  Minus, 
  Info, 
  Lightbulb, 
  Scale, 
  Crown, 
  ShieldCheck, 
  Download,
  X,
  Feather,
  RefreshCw,
  Sparkle,
  Grid,
  Tag,
  Filter,
  RotateCcw,
  Layers,
  FileText,
  Compass,
  CheckCircle2,
  Flame,
  Zap,
  ListFilter,
  BarChart2,
  PieChart as PieIcon,
  TrendingUp,
  Award,
  Activity,
  Circle
} from 'lucide-react';
import {
  PieChart as RePieChart,
  Pie,
  Cell,
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
  ResponsiveContainer,
  Legend as ReLegend
} from 'recharts';
import { toPng } from 'html-to-image';
import { BackButton } from './ui/BackButton';
import { QUDSI_HADITHS, QudsiHadith } from '../data/qudsiHadiths';
import { cn, copyTextToClipboard } from '../lib/utils';
import { useAppContext } from '../AppContext';
import { useTranslation } from '../i18n';
import { safeLocalStorageGetItem, safeLocalStorageSetItem, safeLocalStorageRemoveItem } from "../utils/storage";

export const HadithQudsi: React.FC = () => {
  const { settings, updateSettings } = useAppContext();
  const { t } = useTranslation(settings?.appLanguage || 'ar');

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchBarContainerRef = useRef<HTMLDivElement>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [showIndexModal, setShowIndexModal] = useState(false);
  const [indexModalTab, setIndexModalTab] = useState<'categories' | 'titles'>('categories');
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [expandedExplanationIds, setExpandedExplanationIds] = useState<Record<string, boolean>>({});

  // Close search suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchBarContainerRef.current &&
        !searchBarContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Read tracking states
  const [readHadiths, setReadHadiths] = useState<string[]>(() => {
    const saved = safeLocalStorageGetItem('qudsi-read-hadiths');
    return saved ? JSON.parse(saved) : [];
  });

  // Font customization states
  const [hadithFontSize, setHadithFontSize] = useState<number>(() => {
    const saved = safeLocalStorageGetItem('qudsi-font-size');
    return saved ? parseInt(saved, 10) : 22;
  });
  const [hadithFont, setHadithFont] = useState<string>(() => {
    return settings.hadithFontFamily || 'Scheherazade New';
  });
  const [showSettings, setShowSettings] = useState(false);

  // View layout mode: single_page (continuous document) or cards
  const [viewLayoutMode, setViewLayoutMode] = useState<'single_page' | 'cards'>(() => {
    const saved = safeLocalStorageGetItem('qudsi-view-mode');
    return (saved === 'cards' || saved === 'single_page') ? saved : 'single_page';
  });

  const handleToggleViewLayoutMode = (mode: 'single_page' | 'cards') => {
    setViewLayoutMode(mode);
    safeLocalStorageSetItem('qudsi-view-mode', mode);
  };

  // Favorites management
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = safeLocalStorageGetItem('qudsi-favorites');
    return saved ? JSON.parse(saved) : [];
  });

  // Copy feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Custom Share Card Modal State
  const [shareItem, setShareItem] = useState<QudsiHadith | null>(null);
  const [cardTheme, setCardTheme] = useState<'emerald' | 'amber' | 'indigo' | 'slate'>('emerald');
  const [sharingStatus, setSharingStatus] = useState<string | null>(null);
  const previewCardRef = useRef<HTMLDivElement>(null);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const isFav = prev.includes(id);
      const updated = isFav 
        ? prev.filter(item => item !== id) 
        : [...prev, id];
      safeLocalStorageSetItem('qudsi-favorites', JSON.stringify(updated));

      setToastMessage(isFav ? 'تمت إزالة الحديث من المفضلة' : 'تمت إضافة الحديث إلى المفضلة ❤️');
      setTimeout(() => setToastMessage(null), 2200);

      return updated;
    });
  };

  const clearAllFavorites = () => {
    if (window.confirm('هل أنت تأكد من رغبتك في إزالة جميع الأحاديث القدسية من قائمة المفضلة؟')) {
      setFavorites([]);
      safeLocalStorageSetItem('qudsi-favorites', JSON.stringify([]));
      setToastMessage('تم تفريغ قائمة المفضلة بنجاح');
      setTimeout(() => setToastMessage(null), 2200);
    }
  };

  const toggleReadHadith = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setReadHadiths(prev => {
      const isRead = prev.includes(id);
      const updated = isRead ? prev.filter(i => i !== id) : [...prev, id];
      safeLocalStorageSetItem('qudsi-read-hadiths', JSON.stringify(updated));

      setToastMessage(isRead ? 'تم إلغاء علامة القراءة' : 'تمت إضافة الحديث لقائمة المقروءة ✓');
      setTimeout(() => setToastMessage(null), 2000);

      return updated;
    });
  };

  const markAllAsRead = () => {
    const allIds = QUDSI_HADITHS.map(h => h.id);
    setReadHadiths(allIds);
    safeLocalStorageSetItem('qudsi-read-hadiths', JSON.stringify(allIds));
    setToastMessage('تم تعيين جميع الأحاديث كمقروءة 🎉');
    setTimeout(() => setToastMessage(null), 2200);
  };

  const resetReadProgress = () => {
    if (window.confirm('هل أنت متأكد من إعادة ضبط سجل الأحاديث المقروءة؟')) {
      setReadHadiths([]);
      safeLocalStorageSetItem('qudsi-read-hadiths', JSON.stringify([]));
      setToastMessage('تم إعادة ضبط سجل القراءة بنجاح');
      setTimeout(() => setToastMessage(null), 2200);
    }
  };

  // Category Colors for Visual Charts
  const CATEGORY_COLORS = [
    '#f59e0b', // amber
    '#10b981', // emerald
    '#3b82f6', // blue
    '#ec4899', // pink
    '#8b5cf6', // purple
    '#06b6d4', // cyan
    '#f97316', // orange
    '#14b8a6', // teal
    '#6366f1', // indigo
  ];

  const totalHadithsCount = QUDSI_HADITHS.length;
  const totalReadCount = readHadiths.length;
  const readPercentage = Math.round((totalReadCount / totalHadithsCount) * 100) || 0;

  // Category statistics breakdown
  const categoryStats = [
    { id: 'mercy', label: 'الرحمة والمغفرة' },
    { id: 'repentance', label: 'التوبة والاستغفار' },
    { id: 'dhikr', label: 'فضل الذكر' },
    { id: 'justice', label: 'العدل والتوحيد' },
    { id: 'worship', label: 'العبادات والدعاء' },
    { id: 'love', label: 'المحبة والولاء' },
    { id: 'paradise', label: 'الجنة والنعيم' },
    { id: 'sincerity', label: 'الإخلاص والنية' },
    { id: 'patience', label: 'الصبر والاحتساب' },
  ].map((cat, idx) => {
    const catHadiths = QUDSI_HADITHS.filter(h => h.category === cat.id);
    const totalInCat = catHadiths.length;
    const readInCat = catHadiths.filter(h => readHadiths.includes(h.id)).length;
    const catPercentage = totalInCat > 0 ? Math.round((readInCat / totalInCat) * 100) : 0;
    return {
      id: cat.id,
      name: cat.label,
      total: totalInCat,
      read: readInCat,
      unread: totalInCat - readInCat,
      percentage: catPercentage,
      color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length]
    };
  });

  const sortedByRead = [...categoryStats].sort((a, b) => b.read - a.read);
  const mostReadCategory = sortedByRead[0];

  const readPieData = categoryStats
    .filter(c => c.read > 0)
    .map(c => ({
      name: c.name,
      value: c.read,
      color: c.color
    }));

  const pieChartDisplayData = readPieData.length > 0 
    ? readPieData 
    : categoryStats.map(c => ({ name: c.name, value: c.total, color: c.color }));

  const handleUpdateFontSize = (dir: 'inc' | 'dec') => {
    setHadithFontSize(prev => {
      const newVal = dir === 'inc' ? Math.min(prev + 2, 36) : Math.max(prev - 2, 16);
      safeLocalStorageSetItem('qudsi-font-size', String(newVal));
      return newVal;
    });
  };

  const handleUpdateFont = (font: string) => {
    setHadithFont(font);
    updateSettings({ hadithFontFamily: font });
  };

  const toggleExplanation = (id: string) => {
    setExpandedExplanationIds(prev => {
      const nextState = !prev[id];
      if (nextState && !readHadiths.includes(id)) {
        setReadHadiths(current => {
          const updated = [...current, id];
          safeLocalStorageSetItem('qudsi-read-hadiths', JSON.stringify(updated));
          return updated;
        });
      }
      return {
        ...prev,
        [id]: nextState
      };
    });
  };

  // Copy Hadith with decorative unicode borders
  const handleCopyHadith = async (item: QudsiHadith) => {
    const text = `۞═════════ ❃ ۩ ❃ ═════════۞\n✨ *${item.title}* ✨\n\nقال الله تبارك وتعالى:\n"${item.hadith}"\n\n📖 المصدر والتخريج: ${item.attribution} [${item.reference}]\n⭐ رتبة الحديث: ${item.grade}\n\n📝 من الشرح والفوائد:\n${item.explanation.overview}\n\n—\nتمت المشاركة من قسم الأحاديث القدسية الشريفة - تطبيق أذكار المؤمن 💚\n۞═════════ ❃ ۩ ❃ ═════════۞`;
    
    await copyTextToClipboard(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Share image generator
  const generateCardPNG = async (): Promise<Blob | null> => {
    if (!previewCardRef.current) return null;
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      const dataUrl = await toPng(previewCardRef.current, {
        quality: 1,
        pixelRatio: 3,
        cacheBust: true,
      });
      const response = await fetch(dataUrl);
      return await response.blob();
    } catch (err) {
      console.error('Failed to generate card image blob:', err);
      return null;
    }
  };

  const handleDownloadCustomCard = async () => {
    if (!shareItem) return;
    setSharingStatus('generating');
    try {
      const blob = await generateCardPNG();
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `hadith-qudsi-${shareItem.id}.png`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setSharingStatus('downloaded');
        setTimeout(() => setSharingStatus(null), 2000);
      }
    } catch (err) {
      setSharingStatus('error');
      setTimeout(() => setSharingStatus(null), 2000);
    }
  };

  // Topic Categories definition with icons and counts
  const categories = [
    { id: 'all', label: 'جميع الأحاديث', icon: <BookOpen size={15} /> },
    { id: 'favorites', label: 'المفضلة', icon: <Heart size={15} className="text-rose-500 fill-rose-500" /> },
    { id: 'read', label: 'المقروءة', icon: <CheckCircle2 size={15} className="text-emerald-500" /> },
    { id: 'unread', label: 'غير المقروءة', icon: <Circle size={15} className="text-amber-500" /> },
    { id: 'mercy', label: 'الرحمة والمغفرة', icon: <Heart size={15} /> },
    { id: 'repentance', label: 'التوبة والاستغفار', icon: <RefreshCw size={15} /> },
    { id: 'dhikr', label: 'فضل الذكر', icon: <Sparkles size={15} /> },
    { id: 'justice', label: 'العدل والتوحيد', icon: <Scale size={15} /> },
    { id: 'worship', label: 'العبادات والدعاء', icon: <Compass size={15} /> },
    { id: 'love', label: 'المحبة والولاء', icon: <Heart size={15} /> },
    { id: 'paradise', label: 'الجنة والنعيم', icon: <Crown size={15} /> },
    { id: 'sincerity', label: 'الإخلاص والنية', icon: <ShieldCheck size={15} /> },
    { id: 'patience', label: 'الصبر والاحتساب', icon: <Feather size={15} /> },
  ];

  // Curated Popular Search Topics with badges & categories
  const POPULAR_SEARCH_TOPICS = [
    { title: "أنا عند ظن عبدي بي", query: "أنا عند ظن عبدي بي", category: "حسن الظن والرجاء", count: 18, isTrending: true },
    { title: "يا عبادي إني حرمت الظلم على نفسي", query: "إني حرمت الظلم", category: "العدل والتوحيد", count: 15, isTrending: true },
    { title: "إنك ما دعوتني ورجوتني غفرت لك", query: "إنك ما دعوتني ورجوتني", category: "التوبة والمغفرة", count: 21, isTrending: true },
    { title: "من عادى لي ولياً فقد آذنته بالحرب", query: "من عادى لي وليا", category: "المحبة والنوافل", count: 14, isTrending: false },
    { title: "الصوم لي وأنا أجزي به", query: "الصوم لي وأنا أجزي به", category: "فضل الصيام", count: 19, isTrending: true },
    { title: "تنزل الرب في ثلث الليل الآخر", query: "ثلث الليل الآخر", category: "قيام الليل والدعاء", count: 12, isTrending: false },
    { title: "فضل الذكر ومجالس العلم والسكينة", query: "فضل الذكر", category: "حلق الذكر", count: 16, isTrending: false },
    { title: "يا ابن آدم لو بلغت ذنوبك عنان السماء", query: "عنان السماء", category: "سعة المغفرة", count: 17, isTrending: true }
  ];

  // Quick search suggestions chips
  const quickSearchSuggestions = [
    "أنا عند ظن عبدي بي",
    "يا عبادي إني حرمت الظلم",
    "إنك ما دعوتني ورجوتني",
    "من عادى لي وليا",
    "ثلث الليل الآخر",
    "الصوم لي وأنا أجزي به",
    "فضل الذكر",
    "الاستغفار"
  ];

  // Live autocomplete search calculations
  const searchQueryLower = searchTerm.trim().toLowerCase();
  
  const liveHadithMatches = searchQueryLower 
    ? QUDSI_HADITHS.filter(h => 
        h.title.toLowerCase().includes(searchQueryLower) ||
        h.hadith.toLowerCase().includes(searchQueryLower) ||
        h.categoryLabel.toLowerCase().includes(searchQueryLower) ||
        h.tags.some(t => t.toLowerCase().includes(searchQueryLower)) ||
        h.explanation.overview.toLowerCase().includes(searchQueryLower)
      ).slice(0, 5)
    : [];

  const liveMatchingTags = searchQueryLower 
    ? Array.from(new Set(QUDSI_HADITHS.flatMap(h => h.tags)))
        .filter(t => t.toLowerCase().includes(searchQueryLower))
        .slice(0, 5)
    : [];

  // Helper function to highlight search matches inside text
  const renderHighlightedText = (text: string, query: string) => {
    if (!query || !query.trim()) return text;
    const qStr = query.trim().toLowerCase();
    if (!qStr) return text;

    try {
      const escaped = qStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${escaped})`, 'gi');
      const parts = text.split(regex);

      return (
        <>
          {parts.map((part, index) =>
            part.toLowerCase() === qStr ? (
              <mark
                key={index}
                className="bg-amber-300 dark:bg-amber-500/50 text-amber-950 dark:text-amber-100 font-black px-1 py-0.5 rounded border-b-2 border-amber-600 shadow-sm"
              >
                {part}
              </mark>
            ) : (
              part
            )
          )}
        </>
      );
    } catch (e) {
      return text;
    }
  };

  // Helper function to render Hadith text with "قال الله..." divine phrases highlighted in bold red
  const renderHadithTextWithDivineAndHighlight = (text: string, query: string) => {
    if (!text) return null;

    // Regex matching divine opening/attribution phrases in Qudsi Hadiths
    const divineRegex = /(قال الله تبارك وتعالى|قال الله عز وجل|قال الله تعالى|قال الله جل وعلا|قال الله سبحانه وتعالى|يقول الله تعالى|يقول الله عز وجل|قال الله|قال الرب تبارك وتعالى)/g;

    const segments = text.split(divineRegex);

    return (
      <>
        {segments.map((segment, idx) => {
          if (segment.match(divineRegex)) {
            return (
              <strong key={idx} className="text-red-600 dark:text-red-400 font-black px-0.5 inline-block">
                {renderHighlightedText(segment, query)}
              </strong>
            );
          }
          return <React.Fragment key={idx}>{renderHighlightedText(segment, query)}</React.Fragment>;
        })}
      </>
    );
  };

  // Extract all unique tags across all Hadiths
  const allTags = Array.from(
    new Set(QUDSI_HADITHS.flatMap(h => h.tags))
  );

  // Filtering Logic
  const filteredHadiths = QUDSI_HADITHS.filter(item => {
    const matchesCategory = 
      selectedCategory === 'all' ? true :
      selectedCategory === 'favorites' ? favorites.includes(item.id) :
      selectedCategory === 'read' ? readHadiths.includes(item.id) :
      selectedCategory === 'unread' ? !readHadiths.includes(item.id) :
      item.category === selectedCategory;

    const matchesTag = !selectedTag || item.tags.includes(selectedTag);
    const matchesFavorite = !onlyFavorites || favorites.includes(item.id);
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch = !q || (
      item.title.toLowerCase().includes(q) ||
      item.hadith.toLowerCase().includes(q) ||
      item.attribution.toLowerCase().includes(q) ||
      item.categoryLabel.toLowerCase().includes(q) ||
      item.reference.toLowerCase().includes(q) ||
      item.tags.some(t => t.toLowerCase().includes(q)) ||
      item.explanation.overview.toLowerCase().includes(q) ||
      item.explanation.keyLessons.some(l => l.toLowerCase().includes(q)) ||
      (item.explanation.vocabulary && item.explanation.vocabulary.some(v => v.word.toLowerCase().includes(q) || v.meaning.toLowerCase().includes(q)))
    );
    return matchesCategory && matchesTag && matchesFavorite && matchesSearch;
  });

  const resetAllFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedTag(null);
    setOnlyFavorites(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-y-auto w-full mx-auto pb-16">
      
      {/* Dynamic Header */}
      <div className="sticky top-0 z-30 p-4 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            <BackButton />
            <div>
              <div className="flex items-center gap-2">
                <Crown size={20} className="text-amber-500 animate-pulse" />
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {t('home_qudsi_title')}
                </h2>
              </div>
              <p className="text-[11px] font-bold text-teal-600 dark:text-teal-400 mt-0.5">
                كلام الله عز وجل بلفظ النبي ﷺ الشريف مع الشرح الموسع والتفصيلي
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* View Mode Toggle Button Group */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => handleToggleViewLayoutMode('single_page')}
                className={cn(
                  "px-2.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer",
                  viewLayoutMode === 'single_page'
                    ? "bg-amber-500 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400"
                )}
                title="عرض الأحاديث في صفحة موحدة متصلة"
              >
                <FileText size={15} />
                <span className="hidden sm:inline">صفحة موحدة</span>
              </button>
              <button
                onClick={() => handleToggleViewLayoutMode('cards')}
                className={cn(
                  "px-2.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer",
                  viewLayoutMode === 'cards'
                    ? "bg-amber-500 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400"
                )}
                title="عرض الأحاديث على شكل بطاقات"
              >
                <Layers size={15} />
                <span className="hidden sm:inline">بطاقات</span>
              </button>
            </div>

            {/* Statistics Dashboard Button */}
            <button
              onClick={() => setShowStatsModal(true)}
              className="p-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 transition-all flex items-center gap-1.5 text-xs font-black cursor-pointer shadow-sm"
              title="لوحة إحصائيات القراءة والتصفح"
            >
              <BarChart2 size={16} className="text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">لوحة الإحصائيات</span>
              <span className="bg-emerald-500 text-white text-[10px] px-1.5 py-0.5 rounded-md font-extrabold">
                {readPercentage}%
              </span>
            </button>

            {/* Topic Index Button */}
            <button
              onClick={() => setShowIndexModal(true)}
              className="p-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 transition-all flex items-center gap-1.5 text-xs font-black cursor-pointer shadow-sm"
              title="فهرس المواضيع"
            >
              <Grid size={16} />
              <span className="hidden sm:inline">فهرس المواضيع</span>
            </button>

            {/* Favorites filter toggle */}
            <button
              onClick={() => setOnlyFavorites(!onlyFavorites)}
              className={cn(
                "p-2.5 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer",
                onlyFavorites
                  ? "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400"
                  : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
              )}
              title="المفضلة"
            >
              <Heart size={16} className={cn(onlyFavorites && "fill-rose-500")} />
              <span className="hidden sm:inline">المفضلة ({favorites.length})</span>
            </button>

            {/* Settings button */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={cn(
                "p-2.5 rounded-xl border transition-all flex items-center justify-center cursor-pointer",
                showSettings
                  ? "bg-teal-500/10 border-teal-500/30 text-teal-600 dark:text-teal-400"
                  : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
              )}
              title="تعديل الخط والحجم"
            >
              <Settings2 size={18} />
            </button>
          </div>
        </div>

        {/* Font Customization Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ height: 0, opacity: 0, scale: 0.98 }}
              animate={{ height: 'auto', opacity: 1, scale: 1 }}
              exit={{ height: 0, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden mb-3"
            >
              <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-4 sm:p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-amber-500/5 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
                      <Settings2 size={20} />
                    </div>
                    <div>
                      <span className="block font-black text-slate-800 dark:text-slate-100 text-sm sm:text-base">إعدادات العرض والقراءة</span>
                      <span className="block text-[11px] font-bold text-slate-500 dark:text-slate-400">تخصيص مظهر الأحاديث لراحتك</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-rose-500 transition-colors cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Select font family dropdown */}
                  <div className="bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-700/50 p-4 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                      <FileText size={16} className="text-emerald-500" />
                      <span className="text-sm font-black">نوع الخط الشريف</span>
                    </div>
                    <div className="relative group">
                      <select
                        value={hadithFont}
                        onChange={(e) => handleUpdateFont(e.target.value)}
                        className="w-full appearance-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 py-3 px-4 pl-10 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500/50 shadow-sm transition-all group-hover:border-emerald-400/50"
                        style={{ fontFamily: hadithFont }}
                      >
                        <option value="Scheherazade New">خط النسخ المميز (شهرزاد)</option>
                        <option value="Amiri">خط أميري التراثي</option>
                        <option value="Cairo">خط القاهرة الحديث</option>
                        <option value="Tajawal">خط تجوال المبسط</option>
                        <option value="Zain">خط زين الناعم</option>
                        <option value="Alexandria">خط الإسكندرية</option>
                      </select>
                      <ChevronDown size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Font size adjust buttons */}
                  <div className="bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-700/50 p-4 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between text-slate-700 dark:text-slate-200">
                      <div className="flex items-center gap-2">
                        <Search size={16} className="text-blue-500" />
                        <span className="text-sm font-black">حجم الخط</span>
                      </div>
                      <span className="text-xs font-black bg-white dark:bg-slate-900 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-amber-600 dark:text-amber-400">
                        {hadithFontSize}px
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => handleUpdateFontSize('inc')}
                        disabled={hadithFontSize >= 36}
                        className="w-11 h-11 shrink-0 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-amber-400 hover:text-amber-600 flex items-center justify-center font-bold disabled:opacity-40 disabled:hover:border-slate-200 cursor-pointer shadow-sm transition-all active:scale-95"
                      >
                        <Plus size={20} />
                      </button>
                      <div className="flex-1 relative h-2.5 bg-slate-200/80 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                        <div 
                          className="absolute top-0 right-0 h-full bg-gradient-to-l from-amber-400 to-amber-600 rounded-full transition-all duration-300" 
                          style={{ width: `${((hadithFontSize - 16) / (36 - 16)) * 100}%` }}
                        />
                      </div>
                      <button 
                        onClick={() => handleUpdateFontSize('dec')}
                        disabled={hadithFontSize <= 16}
                        className="w-11 h-11 shrink-0 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-amber-400 hover:text-amber-600 flex items-center justify-center font-bold disabled:opacity-40 disabled:hover:border-slate-200 cursor-pointer shadow-sm transition-all active:scale-95"
                      >
                        <Minus size={20} />
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Reset defaults */}
                <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800/80">
                  <button
                    onClick={() => {
                      handleUpdateFont('Scheherazade New');
                      setHadithFontSize(22);
                      safeLocalStorageSetItem('qudsi-font-size', '22');
                    }}
                    className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 flex items-center gap-1.5 transition-colors cursor-pointer bg-slate-100 hover:bg-amber-50 dark:bg-slate-800 dark:hover:bg-slate-700 px-3 py-2 rounded-xl"
                  >
                    <RotateCcw size={14} />
                    <span>إعادة الضبط للافتراضي</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Live Search Bar & Interactive Autocomplete Suggestions */}
        <div ref={searchBarContainerRef} className="relative mb-2">
          <div className="relative flex items-center">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsSearchFocused(true);
              }}
              onFocus={() => setIsSearchFocused(true)}
              placeholder="بحث نصي شامل في الأحاديث، الشرح والكلمات (مثل: التوبة، الرحمة، الذكر)..."
              className={cn(
                "w-full pr-10 pl-24 py-3 text-sm font-bold bg-white dark:bg-slate-900 border rounded-2xl outline-none transition-all text-slate-800 dark:text-slate-100 shadow-sm",
                isSearchFocused 
                  ? "border-amber-500 dark:border-amber-500 ring-2 ring-amber-500/20 shadow-md" 
                  : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
              )}
            />
            <Search size={18} className="absolute right-3.5 text-amber-500 pointer-events-none" />

            {/* Live Result Count Badge & Clear Button */}
            <div className="absolute left-3 flex items-center gap-2">
              {searchTerm && (
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[10px] font-extrabold border border-amber-500/20">
                  {filteredHadiths.length} نتيجة
                </span>
              )}
              {searchTerm && (
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    setIsSearchFocused(true);
                  }} 
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                  title="مسح النص"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Autocomplete & Popular Topics Dropdown Menu */}
          <AnimatePresence>
            {isSearchFocused && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.18 }}
                className="absolute top-full right-0 left-0 z-40 mt-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-4 overflow-hidden max-h-[75vh] overflow-y-auto space-y-4"
              >
                {/* Search Header Info */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-amber-500" />
                    <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                      {searchTerm.trim() ? 'نتائج ومقترحات البحث المباشر (Live Search)' : '🔥 المواضيع والأحاديث الأكثر بحثاً وتصفحاً'}
                    </span>
                  </div>
                  {searchTerm.trim() && (
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                      {filteredHadiths.length} حديث مطابق
                    </span>
                  )}
                </div>

                {/* If search query is empty -> Show Popular Topics Grid */}
                {!searchTerm.trim() && (
                  <div className="space-y-2.5">
                    <span className="text-[11px] font-bold text-slate-400 block">اختر موضوعاً شائعاً للبحث المباشر عنه:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {POPULAR_SEARCH_TOPICS.map((topic, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setSearchTerm(topic.query);
                            setIsSearchFocused(false);
                          }}
                          className="p-3 text-right bg-slate-50 dark:bg-slate-800/60 hover:bg-amber-50 dark:hover:bg-amber-950/30 border border-slate-200/80 dark:border-slate-700/80 hover:border-amber-400/80 rounded-2xl transition-all cursor-pointer group flex flex-col justify-between"
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-xs font-black text-slate-800 dark:text-slate-100 group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors">
                              {topic.title}
                            </span>
                            {topic.isTrending && (
                              <span className="px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[9px] font-black shrink-0 border border-amber-500/20">
                                شائع 🔥
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                            <span>باب {topic.category}</span>
                            <span className="text-amber-600 dark:text-amber-400 group-hover:translate-x-[-2px] transition-transform">ابحث الآن ←</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* If search query exists -> Show Live Matching Hadith Previews & Tags */}
                {searchTerm.trim() && (
                  <div className="space-y-3">
                    {liveHadithMatches.length > 0 ? (
                      <div className="space-y-2">
                        <span className="text-[11px] font-bold text-slate-400 block">الأحاديث المطابقة لنص البحث:</span>
                        {liveHadithMatches.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => {
                              setSearchTerm(item.title);
                              setIsSearchFocused(false);
                            }}
                            className="w-full text-right p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-amber-50 dark:hover:bg-amber-950/30 border border-slate-200/80 dark:border-slate-700/80 hover:border-amber-400 transition-all cursor-pointer space-y-1 block"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-black text-amber-900 dark:text-amber-300">
                                {renderHighlightedText(item.title, searchTerm)}
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-500/10 text-amber-700 dark:text-amber-300 rounded-lg border border-amber-500/20 shrink-0">
                                {item.categoryLabel}
                              </span>
                            </div>
                            <p className="text-[11px] font-medium text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                              "{renderHighlightedText(item.hadith, searchTerm)}"
                            </p>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 space-y-2">
                        <Search size={28} className="mx-auto text-slate-300 dark:text-slate-600" />
                        <p className="text-xs font-bold text-slate-500">لم يتم العثور على حديث مطابق تماماً للعبارة "{searchTerm}"</p>
                        <p className="text-[11px] font-medium text-slate-400">جرب البحث بكلمات عامة مثل: التوبة، المغفرة، الصلاة، الذكر، الصبر</p>
                      </div>
                    )}

                    {/* Live Matching Tags Pills */}
                    {liveMatchingTags.length > 0 && (
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                        <span className="text-[10px] font-bold text-slate-400 block">وسوم متعلقة بكلمة البحث:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {liveMatchingTags.map((tag, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                setSelectedTag(tag);
                                setSearchTerm('');
                                setIsSearchFocused(false);
                              }}
                              className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 text-xs font-bold rounded-xl border border-amber-500/20 transition-all cursor-pointer flex items-center gap-1"
                            >
                              <Tag size={12} className="text-amber-500" />
                              <span>#{tag}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Autocomplete Footer */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] font-bold text-slate-400">
                  <span>💡 انقر على أي نتيجة أو موضوع للفلترة الفورية</span>
                  <button
                    onClick={() => setIsSearchFocused(false)}
                    className="text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                  >
                    إغلاق القائمة
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Quick Search Suggestion Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none text-[11px]">
          <span className="text-slate-400 font-bold shrink-0 ml-1 flex items-center gap-1">
            <Flame size={12} className="text-amber-500" />
            <span>الأكثر بحثاً:</span>
          </span>
          {quickSearchSuggestions.map((sug, idx) => (
            <button
              key={idx}
              onClick={() => setSearchTerm(sug)}
              className={cn(
                "px-2.5 py-1 rounded-xl font-bold whitespace-nowrap transition-all border shrink-0 cursor-pointer flex items-center gap-1",
                searchTerm === sug
                  ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                  : "bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-slate-700"
              )}
            >
              <span>{sug}</span>
            </button>
          ))}
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="px-2 py-1 rounded-xl font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 shrink-0 cursor-pointer text-[10px]"
            >
              مسح الفلترة
            </button>
          )}
        </div>

        {/* Categories Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 mt-1 scrollbar-none">
          {categories.map(cat => {
            const isSelected = selectedCategory === cat.id;
            const count = cat.id === 'all' 
              ? QUDSI_HADITHS.length 
              : cat.id === 'favorites'
              ? favorites.length
              : cat.id === 'read'
              ? readHadiths.length
              : cat.id === 'unread'
              ? QUDSI_HADITHS.length - readHadiths.length
              : QUDSI_HADITHS.filter(h => h.category === cat.id).length;

            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setSelectedTag(null);
                  if (cat.id === 'favorites') {
                    setOnlyFavorites(true);
                  } else {
                    setOnlyFavorites(false);
                  }
                }}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shrink-0 border",
                  isSelected
                    ? cat.id === 'favorites'
                      ? "bg-rose-500 text-white border-rose-400 shadow-md shadow-rose-500/20"
                      : "bg-gradient-to-r from-amber-500 to-amber-600 text-white border-amber-400 shadow-md shadow-amber-500/20"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
                <span className={cn(
                  "px-1.5 py-0.5 rounded-md text-[10px] font-black",
                  isSelected ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                )}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Filters Bar */}
        {(selectedTag || searchTerm || selectedCategory !== 'all' || onlyFavorites) && (
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800 text-xs font-bold text-amber-800 dark:text-amber-300">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-slate-500 dark:text-slate-400">التصفية النشطة:</span>
              
              {selectedCategory !== 'all' && (
                <span className="bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-lg flex items-center gap-1">
                  <span>القسم: {categories.find(c => c.id === selectedCategory)?.label}</span>
                  <X size={12} className="cursor-pointer hover:text-rose-500" onClick={() => setSelectedCategory('all')} />
                </span>
              )}

              {selectedTag && (
                <span className="bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-lg flex items-center gap-1">
                  <span>الموضوع: #{selectedTag}</span>
                  <X size={12} className="cursor-pointer hover:text-rose-500" onClick={() => setSelectedTag(null)} />
                </span>
              )}

              {searchTerm && (
                <span className="bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-lg flex items-center gap-1">
                  <span>البحث: "{searchTerm}"</span>
                  <X size={12} className="cursor-pointer hover:text-rose-500" onClick={() => setSearchTerm('')} />
                </span>
              )}

              {onlyFavorites && (
                <span className="bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 px-2.5 py-1 rounded-lg flex items-center gap-1">
                  <span>المفضلة فقط</span>
                  <X size={12} className="cursor-pointer hover:text-rose-500" onClick={() => setOnlyFavorites(false)} />
                </span>
              )}
            </div>

            <button
              onClick={resetAllFilters}
              className="text-[11px] font-black text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 flex items-center gap-1 cursor-pointer shrink-0"
            >
              <RotateCcw size={12} />
              <span>إعادة ضبط الكل</span>
            </button>
          </div>
        )}

      </div>

      {/* Main Content Area - Extended Maximum Width Container */}
      <div className="px-1 sm:px-3 lg:px-4 space-y-6 w-full mx-auto">

        {/* Search Results Summary Header & Favorites Banner */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-amber-500" />
              <span className="text-xs font-black text-slate-700 dark:text-slate-300">
                عرض {filteredHadiths.length} من أصل {QUDSI_HADITHS.length} حديث قدسي شريف
              </span>
            </div>
            {(selectedCategory === 'favorites' || onlyFavorites) && favorites.length > 0 && (
              <button
                onClick={clearAllFavorites}
                className="text-[11px] font-black text-rose-600 dark:text-rose-400 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
              >
                <X size={13} />
                <span>مسح المفضلة ({favorites.length})</span>
              </button>
            )}
          </div>

          {(selectedCategory === 'favorites' || onlyFavorites) && favorites.length > 0 && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-between gap-3 text-xs font-bold text-rose-700 dark:text-rose-300">
              <div className="flex items-center gap-2">
                <Heart size={16} className="fill-rose-500 text-rose-500 shrink-0" />
                <span>تعرض حالياً الأحاديث المحفوظة في قائمة المفضلة الخاصة بك.</span>
              </div>
            </div>
          )}
        </div>

        {filteredHadiths.length === 0 ? (
          (selectedCategory === 'favorites' || onlyFavorites) ? (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-rose-500/20 p-8 space-y-4 shadow-sm">
              <div className="w-16 h-16 mx-auto bg-rose-50 dark:bg-rose-950/40 text-rose-500 rounded-2xl flex items-center justify-center animate-pulse">
                <Heart size={32} className="fill-rose-500" />
              </div>
              <h3 className="text-lg font-black text-slate-800 dark:text-slate-200">
                قائمة المفضلة فارغة حالياً
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                يمكنك إضافة الأحاديث القدسية الشريفة إلى قائمة المفضلة عبر الضغط على أيقونة القلب (❤️) الموجودة في أعلى بطاقة أي حديث للوصول إليها بسرعة في أي وقت.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setOnlyFavorites(false);
                }}
                className="mt-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-black rounded-xl shadow-md cursor-pointer hover:from-amber-600 hover:to-amber-700 transition-all flex items-center gap-2 mx-auto"
              >
                <BookOpen size={16} />
                <span>استعراض جميع الأحاديث القدسية</span>
              </button>
            </div>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-4">
              <div className="w-16 h-16 mx-auto bg-amber-50 dark:bg-amber-950/40 text-amber-600 rounded-2xl flex items-center justify-center">
                <BookOpen size={32} />
              </div>
              <h3 className="text-lg font-black text-slate-800 dark:text-slate-200">لم يتم العثور على أحاديث قدسية تطابق بحثك</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                جرّب استخدام كلمات مفتاحية أخرى مثل "الرحمة"، "التوبة"، "الذكر"، "العدل"، أو اختر قسماً آخر من فهرس الموضوعات.
              </p>
              <button
                onClick={resetAllFilters}
                className="mt-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-black rounded-xl shadow-md cursor-pointer hover:from-amber-600 hover:to-amber-700"
              >
                عرض جميع الأحاديث القدسية
              </button>
            </div>
          )
        ) : viewLayoutMode === 'single_page' ? (
          /* ========================================================= */
          /* CONTINUOUS SINGLE PAGE READING MODE (الصحيفة الموحدة) */
          /* ========================================================= */
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-slate-900 rounded-[2rem] border border-amber-900/10 dark:border-slate-800 shadow-xl p-3.5 sm:p-6 lg:p-8 space-y-10 w-full relative overflow-hidden"
          >
            {/* Top Decorative Border Accent */}
            <div className="absolute top-0 right-0 left-0 h-2 bg-gradient-to-r from-amber-500 via-emerald-500 to-amber-600" />
            <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03] bg-[url('/images/arabesque.png')] pointer-events-none" />

            {/* Document Header Banner */}
            <div className="text-center pb-6 border-b border-amber-200/60 dark:border-slate-800 space-y-2">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20 text-xs font-black">
                <BookOpen size={15} className="text-amber-600 dark:text-amber-400" />
                <span>جامع الأحاديث القدسية الشريفة — صفحة متصلة موحدة</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-amber-950 dark:text-amber-200 tracking-tight">
                الأحاديث القدسية المباركة ({filteredHadiths.length} حديث)
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
                تم دمج كافة الأحاديث الشريفة في صفحة واحدة ممتدة للقراءة المتصلة مع المفهوم الشامل والفوائد التوجيهية بدون تشتيت.
              </p>
            </div>

            {/* Continuous List of Hadiths */}
            <div className="space-y-12">
              {filteredHadiths.map((item, index) => {
                const isFav = favorites.includes(item.id);
                const isRead = readHadiths.includes(item.id);
                const isExplanationExpanded = expandedExplanationIds[item.id] ?? true;

                return (
                  <div key={item.id} id={item.id} className="space-y-5 scroll-mt-24">
                    {/* Hadith Number Medallion & Category / Action Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-amber-200/50 dark:border-slate-800">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="px-3.5 py-1 bg-gradient-to-r from-amber-600 to-amber-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-sm flex items-center gap-1.5">
                          <Sparkles size={14} />
                          <span>﴿ الحديث {index + 1} ﴾</span>
                        </span>

                        <button
                          onClick={() => {
                            setSelectedCategory(item.category);
                            setSelectedTag(null);
                          }}
                          className="px-3 py-1 bg-amber-500/10 dark:bg-amber-400/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 font-black text-xs rounded-xl border border-amber-500/20 flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <span>{item.categoryLabel}</span>
                        </button>

                        <span className="px-2.5 py-1 bg-emerald-500/10 dark:bg-emerald-400/10 text-emerald-800 dark:text-emerald-300 font-bold text-xs rounded-xl border border-emerald-500/20 flex items-center gap-1">
                          <ShieldCheck size={13} className="text-emerald-500" />
                          <span>{item.grade}</span>
                        </span>

                        {isRead && (
                          <span className="px-2 py-0.5 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] rounded-lg border border-emerald-500/30 flex items-center gap-1">
                            <CheckCircle2 size={12} className="text-emerald-500" />
                            <span>تمت القراءة</span>
                          </span>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => toggleReadHadith(item.id, e)}
                          className={cn(
                            "px-2.5 py-1.5 rounded-xl transition-all border cursor-pointer flex items-center gap-1 text-xs font-bold",
                            isRead 
                              ? "bg-emerald-500 text-white border-emerald-500 shadow-sm" 
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-slate-700"
                          )}
                          title={isRead ? "مقروء" : "تعيين كمقروء"}
                        >
                          <CheckCircle2 size={15} className={cn(isRead && "fill-white text-emerald-500")} />
                          <span className="hidden sm:inline">{isRead ? "تمت القراءة" : "مقروء"}</span>
                        </button>

                        <button
                          onClick={() => handleCopyHadith(item)}
                          className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-amber-100 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700 cursor-pointer"
                          title="نسخ الحديث"
                        >
                          {copiedId === item.id ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                        </button>

                        <button
                          onClick={() => setShareItem(item)}
                          className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-amber-100 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700 cursor-pointer"
                          title="مشاركة كبطاقة"
                        >
                          <Share2 size={16} />
                        </button>

                        <button
                          onClick={() => toggleFavorite(item.id)}
                          className={cn(
                            "p-2 rounded-xl transition-all border cursor-pointer",
                            isFav 
                              ? "bg-rose-500 text-white border-rose-500" 
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-rose-100"
                          )}
                          title="المفضلة"
                        >
                          <Heart size={16} className={cn(isFav && "fill-white")} />
                        </button>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-amber-950 dark:text-amber-200 leading-snug">
                      {renderHighlightedText(item.title, searchTerm)}
                    </h3>

                    {/* Intro phrase */}
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500/10 via-amber-500/10 to-transparent px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-extrabold text-amber-900 dark:text-amber-300 border-r-4 border-red-500">
                      <Feather size={15} className="text-red-600 dark:text-red-400 shrink-0" />
                      <span>
                        <strong className="text-red-600 dark:text-red-400 font-black text-sm sm:text-base ml-1">قال الله تبارك وتعالى</strong>
                        فيما رواه عنه رسول الله ﷺ:
                      </span>
                    </div>

                    {/* Extended Wide Matn Container */}
                    <div className="p-4 sm:p-6 lg:p-7 rounded-[1.5rem] bg-amber-50/40 dark:bg-slate-950/80 border border-amber-200/60 dark:border-amber-900/30 my-2 w-full">
                      <p 
                        className="text-slate-900 dark:text-amber-50 text-right tracking-normal leading-[2.2] sm:leading-[2.5] select-text font-medium w-full block"
                        style={{ 
                          fontFamily: hadithFont, 
                          fontSize: `${hadithFontSize}px` 
                        }}
                      >
                        "{renderHadithTextWithDivineAndHighlight(item.hadith, searchTerm)}"
                      </p>
                      <div className="mt-4 pt-3 border-t border-amber-200/40 dark:border-slate-800/80 flex flex-wrap justify-between items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-amber-800/90 dark:text-amber-400/90">
                          📖 التخريج والمصدر الرئيسي: {item.attribution}
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400">
                          [{item.reference}]
                        </span>
                      </div>
                    </div>

                    {/* Explanation Accordion */}
                    <div className="pt-1">
                      <button
                        onClick={() => toggleExplanation(item.id)}
                        className="w-full py-3 px-4 sm:px-5 bg-slate-100/90 dark:bg-slate-800/80 hover:bg-amber-50 dark:hover:bg-slate-800 text-amber-950 dark:text-amber-200 font-extrabold text-xs sm:text-sm rounded-2xl border border-slate-200/80 dark:border-slate-700 flex items-center justify-between transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <BookOpen size={16} className="text-amber-600 dark:text-amber-400 shrink-0" />
                          <span>الشرح والفوائد التربوية والدروس الاستنباطية</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                          <span>{isExplanationExpanded ? 'إخفاء الشرح' : 'عرض الشرح والفوائد'}</span>
                          {isExplanationExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>
                      </button>

                      <AnimatePresence>
                        {isExplanationExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-3 p-5 sm:p-7 rounded-[2rem] bg-white dark:bg-slate-900 border border-amber-200/60 dark:border-slate-800 space-y-6 shadow-sm">
                              {/* Overview */}
                              <div className="space-y-2">
                                <h4 className="text-sm sm:text-base lg:text-lg font-black text-amber-900 dark:text-amber-400 flex items-center gap-2">
                                  <Info size={18} className="text-amber-600 dark:text-amber-400 shrink-0" />
                                  <span>شرح الحديث العام والمفهوم الإيماني:</span>
                                </h4>
                                <p className="text-base sm:text-lg lg:text-xl text-slate-900 dark:text-slate-100 leading-loose text-justify font-bold">
                                  {renderHighlightedText(item.explanation.overview, searchTerm)}
                                </p>
                              </div>

                              {/* Key Lessons */}
                              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                                <h4 className="text-sm sm:text-base lg:text-lg font-black text-amber-900 dark:text-amber-400 flex items-center gap-2">
                                  <Lightbulb size={18} className="text-amber-600 dark:text-amber-400 shrink-0" />
                                  <span>أبرز الفوائد والدروس الاستنباطية:</span>
                                </h4>
                                <ul className="space-y-3">
                                  {item.explanation.keyLessons.map((lesson, lIdx) => (
                                    <li key={lIdx} className="text-base sm:text-lg lg:text-xl text-slate-900 dark:text-slate-100 flex items-start gap-3 leading-loose font-bold">
                                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mt-2.5 shrink-0 shadow-sm" />
                                      <span>{lesson}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {/* Vocabulary */}
                              {item.explanation.vocabulary && item.explanation.vocabulary.length > 0 && (
                                <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                                  <h4 className="text-sm sm:text-base lg:text-lg font-black text-amber-900 dark:text-amber-400 flex items-center gap-2">
                                    <BookOpen size={18} className="text-amber-600 dark:text-amber-400 shrink-0" />
                                    <span>معاني الغريب والمفردات:</span>
                                  </h4>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {item.explanation.vocabulary.map((vocab, vIdx) => (
                                      <div key={vIdx} className="bg-amber-50/60 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-amber-200/50 dark:border-slate-700 text-sm sm:text-base lg:text-lg font-bold">
                                        <span className="font-black text-amber-950 dark:text-amber-300 ml-1.5">({vocab.word}):</span>
                                        <span className="text-slate-800 dark:text-slate-200 font-bold">{vocab.meaning}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Reflections */}
                              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 bg-gradient-to-r from-amber-500/10 via-emerald-500/5 to-transparent p-4 sm:p-5 rounded-2xl border-r-4 border-amber-500">
                                <span className="text-sm sm:text-base lg:text-lg font-black text-amber-950 dark:text-amber-300 block mb-1">
                                  💡 تطبيق عملي في حياتك:
                                </span>
                                <p className="text-base sm:text-lg lg:text-xl text-slate-900 dark:text-slate-100 font-bold leading-loose italic">
                                  {item.explanation.reflections}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Tags */}
                    <div className="flex items-center gap-2 flex-wrap pt-2">
                      <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                        <Tag size={13} />
                        <span>الوسوم:</span>
                      </span>
                      {item.tags.map((tag, tIdx) => {
                        const isTagActive = selectedTag === tag;
                        return (
                          <button
                            key={tIdx} 
                            onClick={() => setSelectedTag(isTagActive ? null : tag)}
                            className={cn(
                              "text-xs font-bold px-3 py-1 rounded-xl transition-all cursor-pointer border",
                              isTagActive
                                ? "bg-amber-500 text-white border-amber-400 font-black shadow-sm"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-transparent hover:border-amber-400/50 hover:bg-amber-500/10"
                            )}
                          >
                            #{tag}
                          </button>
                        );
                      })}
                    </div>

                    {/* Ornate Divider between Hadiths in Continuous Sheet */}
                    {index < filteredHadiths.length - 1 && (
                      <div className="pt-10 pb-4 flex items-center justify-center gap-4 text-amber-600/40 dark:text-amber-500/30 select-none">
                        <div className="h-[1px] bg-gradient-to-r from-transparent via-amber-400/30 to-transparent flex-1" />
                        <span className="text-sm font-serif">۞ ════════ ❃ ۩ ❃ ════════ ۞</span>
                        <div className="h-[1px] bg-gradient-to-r from-transparent via-amber-400/30 to-transparent flex-1" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        ) : (
          /* ========================================================= */
          /* SEPARATE CARDS MODE (عرض البطاقات العريضة) */
          /* ========================================================= */
          filteredHadiths.map((item, index) => {
            const isFav = favorites.includes(item.id);
            const isRead = readHadiths.includes(item.id);
            const isExplanationExpanded = expandedExplanationIds[item.id] ?? true;

            return (
              <motion.div
                key={item.id}
                id={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.03 }}
                className={cn(
                  "rounded-[2rem] transition-all duration-300 relative overflow-hidden border shadow-xl w-full scroll-mt-24",
                  "bg-white dark:bg-slate-900",
                  "border-amber-900/10 dark:border-slate-800 hover:border-amber-500/40 dark:hover:border-amber-500/40"
                )}
              >
                {/* Top Decorative Banner Gradient */}
                <div className="absolute top-0 right-0 left-0 h-2 bg-gradient-to-r from-amber-500 via-emerald-500 to-amber-600" />
                <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04] bg-[url('/images/arabesque.png')] pointer-events-none" />

                <div className="p-3.5 sm:p-6 lg:p-7 space-y-5">
                  
                  {/* Card Header: Category Badge, Grade, & Quick Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <button
                        onClick={() => {
                          setSelectedCategory(item.category);
                          setSelectedTag(null);
                        }}
                        className="px-3.5 py-1.5 bg-amber-500/10 dark:bg-amber-400/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 font-black text-xs sm:text-sm rounded-xl border border-amber-500/20 flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Sparkles size={15} className="text-amber-500" />
                        <span>{item.categoryLabel}</span>
                      </button>

                      <span className="px-3 py-1.5 bg-emerald-500/10 dark:bg-emerald-400/10 text-emerald-800 dark:text-emerald-300 font-black text-xs sm:text-sm rounded-xl border border-emerald-500/20 flex items-center gap-1.5">
                        <ShieldCheck size={15} className="text-emerald-500" />
                        <span>{item.grade}</span>
                      </span>

                      {isRead && (
                        <span className="px-2.5 py-1 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-extrabold text-xs rounded-lg border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 size={13} className="text-emerald-500" />
                          <span>تمت القراءة</span>
                        </span>
                      )}

                      <span className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400">
                        • {item.attribution}
                      </span>
                    </div>

                    {/* Quick action buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => toggleReadHadith(item.id, e)}
                        className={cn(
                          "px-3 py-2 rounded-xl transition-all border cursor-pointer flex items-center gap-1.5 text-xs font-bold",
                          isRead 
                            ? "bg-emerald-500 text-white border-emerald-500 shadow-sm" 
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-slate-700"
                        )}
                        title={isRead ? "مقروء (انقر لإلغاء التحديد)" : "تعيين كمقروء"}
                      >
                        <CheckCircle2 size={16} className={cn(isRead && "fill-white text-emerald-500")} />
                        <span className="hidden sm:inline">{isRead ? "تمت قراءته" : "مقروء"}</span>
                      </button>

                      <button
                        onClick={() => handleCopyHadith(item)}
                        className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-amber-100 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700 cursor-pointer"
                        title="نسخ الحديث الشريف"
                      >
                        {copiedId === item.id ? <Check size={18} className="text-emerald-600" /> : <Copy size={18} />}
                      </button>

                      <button
                        onClick={() => setShareItem(item)}
                        className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-amber-100 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700 cursor-pointer"
                        title="مشاركة كبطاقة مصورة"
                      >
                        <Share2 size={18} />
                      </button>

                      <button
                        onClick={() => toggleFavorite(item.id)}
                        className={cn(
                          "p-2.5 rounded-xl transition-all border cursor-pointer",
                          isFav 
                            ? "bg-rose-500 text-white border-rose-500" 
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-rose-100"
                        )}
                        title="إضافة للمفضلة"
                      >
                        <Heart size={18} className={cn(isFav && "fill-white")} />
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-amber-950 dark:text-amber-200 leading-snug tracking-tight">
                    {renderHighlightedText(item.title, searchTerm)}
                  </h3>

                  {/* Calligraphy Introduction Tag */}
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500/10 via-amber-400/5 to-transparent px-4 py-2 rounded-2xl text-xs sm:text-sm font-extrabold text-amber-900 dark:text-amber-300 border-r-4 border-red-500">
                    <Feather size={16} className="text-red-600 dark:text-red-400 shrink-0" />
                    <span>
                      <strong className="text-red-600 dark:text-red-400 font-black text-sm sm:text-base ml-1">قال الله تبارك وتعالى</strong>
                      فيما رواه عنه رسول الله ﷺ:
                    </span>
                  </div>

                  {/* Extended Maximum Width Matn Display with Dynamic Font & Comfortable Reading Layout */}
                  <div className="p-4 sm:p-6 lg:p-7 rounded-[1.5rem] bg-amber-50/50 dark:bg-slate-950/90 border border-amber-200/80 dark:border-amber-500/20 shadow-sm my-3 transition-all w-full">
                    <p 
                      className="text-slate-900 dark:text-amber-50 text-right tracking-normal leading-[2.2] sm:leading-[2.5] select-text font-medium w-full block"
                      style={{ 
                        fontFamily: hadithFont, 
                        fontSize: `${hadithFontSize}px` 
                      }}
                    >
                      "{renderHadithTextWithDivineAndHighlight(item.hadith, searchTerm)}"
                    </p>
                    <div className="mt-4 pt-3 border-t border-amber-200/40 dark:border-slate-800/80 flex justify-between items-center">
                      <span className="text-xs sm:text-sm font-bold text-amber-800/80 dark:text-amber-400/80">
                        📖 التخريج والمصدر الرئيسي: {item.attribution}
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400">
                        [{item.reference}]
                      </span>
                    </div>
                  </div>

                  {/* Detailed Explanation Accordion Header */}
                  <div className="pt-2">
                    <button
                      onClick={() => toggleExplanation(item.id)}
                      className="w-full py-3.5 px-5 sm:px-6 bg-slate-100/90 dark:bg-slate-800/80 hover:bg-amber-50 dark:hover:bg-slate-800 text-amber-950 dark:text-amber-200 font-extrabold text-xs sm:text-sm lg:text-base rounded-2xl border border-slate-200/90 dark:border-slate-700 flex items-center justify-between transition-all cursor-pointer shadow-sm"
                    >
                      <div className="flex items-center gap-2.5">
                        <BookOpen size={18} className="text-amber-600 dark:text-amber-400 shrink-0" />
                        <span>الشرح الموسع والتفصيلي والفوائد التربوية</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <span className="text-xs font-bold">{isExplanationExpanded ? 'إخفاء الشرح' : 'عرض الشرح والفوائد'}</span>
                        {isExplanationExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </div>
                    </button>

                    {/* Detailed Explanation Body */}
                    <AnimatePresence>
                      {isExplanationExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 p-6 sm:p-8 rounded-[2rem] bg-white dark:bg-slate-900 border border-amber-200/80 dark:border-slate-800 space-y-6 shadow-sm">
                            
                            {/* Overview / Commentary */}
                            <div className="space-y-2">
                              <h4 className="text-sm sm:text-base lg:text-lg font-black text-amber-900 dark:text-amber-400 flex items-center gap-2 tracking-wider">
                                <Info size={18} className="text-amber-600 dark:text-amber-400 shrink-0" />
                                <span>شرح الحديث العام والمفهوم الإيماني:</span>
                              </h4>
                              <p className="text-base sm:text-lg lg:text-xl text-slate-900 dark:text-slate-100 leading-loose text-justify font-bold">
                                {renderHighlightedText(item.explanation.overview, searchTerm)}
                              </p>
                            </div>

                            {/* Key Lessons / Benefits */}
                            <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                              <h4 className="text-sm sm:text-base lg:text-lg font-black text-amber-900 dark:text-amber-400 flex items-center gap-2 tracking-wider">
                                <Lightbulb size={18} className="text-amber-600 dark:text-amber-400 shrink-0" />
                                <span>أبرز الفوائد والدروس الاستنباطية:</span>
                              </h4>
                              <ul className="space-y-3">
                                {item.explanation.keyLessons.map((lesson, lIdx) => (
                                  <li key={lIdx} className="text-base sm:text-lg lg:text-xl text-slate-900 dark:text-slate-100 flex items-start gap-3 leading-loose font-bold">
                                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mt-2.5 shrink-0 shadow-sm" />
                                    <span>{lesson}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Vocabulary if available */}
                            {item.explanation.vocabulary && item.explanation.vocabulary.length > 0 && (
                              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                                <h4 className="text-sm sm:text-base lg:text-lg font-black text-amber-900 dark:text-amber-400 flex items-center gap-2 tracking-wider">
                                  <BookOpen size={18} className="text-amber-600 dark:text-amber-400 shrink-0" />
                                  <span>معاني غريب الكلمات والمفردات:</span>
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {item.explanation.vocabulary.map((vocab, vIdx) => (
                                    <div key={vIdx} className="bg-amber-50/60 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-amber-200/50 dark:border-slate-700 text-sm sm:text-base lg:text-lg font-bold">
                                      <span className="font-black text-amber-950 dark:text-amber-300 ml-1.5">({vocab.word}):</span>
                                      <span className="text-slate-800 dark:text-slate-200 font-bold">{vocab.meaning}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Practical Reflection */}
                            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 bg-gradient-to-r from-amber-500/10 via-emerald-500/5 to-transparent p-4 sm:p-5 rounded-2xl border-r-4 border-r-amber-500">
                              <span className="text-sm sm:text-base lg:text-lg font-black text-amber-950 dark:text-amber-300 block mb-1">
                                💡 تطبيق عملي في حياتك:
                              </span>
                              <p className="text-base sm:text-lg lg:text-xl text-slate-900 dark:text-slate-100 font-bold leading-loose italic">
                                {item.explanation.reflections}
                              </p>
                            </div>

                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Interactive Tags Bar */}
                  <div className="flex items-center gap-2 flex-wrap pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                      <Tag size={13} />
                      <span>المواضيع والوسوم:</span>
                    </span>
                    {item.tags.map((tag, tIdx) => {
                      const isTagActive = selectedTag === tag;
                      return (
                        <button
                          key={tIdx} 
                          onClick={() => setSelectedTag(isTagActive ? null : tag)}
                          className={cn(
                            "text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer border",
                            isTagActive
                              ? "bg-amber-500 text-white border-amber-400 font-black shadow-sm"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-transparent hover:border-amber-400/50 hover:bg-amber-500/10"
                          )}
                        >
                          #{tag}
                        </button>
                      );
                    })}
                  </div>

                </div>
              </motion.div>
            );
          })
        )}

      </div>

      {/* TOPICS INDEX MODAL (فهرس المواضيع الشامل) */}
      <AnimatePresence>
        {showIndexModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto"
            onClick={() => setShowIndexModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-5 shadow-2xl my-8 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Grid size={22} className="text-amber-500" />
                  <div>
                    <h3 className="font-black text-slate-900 dark:text-white text-lg">
                      فهرس الأحاديث القدسية
                    </h3>
                    <p className="text-xs text-slate-500">اختر طريقة العرض للانتقال المباشر</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowIndexModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  onClick={() => setIndexModalTab('categories')}
                  className={cn(
                    "flex-1 py-2 text-sm font-bold rounded-lg transition-all cursor-pointer",
                    indexModalTab === 'categories' ? "bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-sm" : "text-slate-600 dark:text-slate-300"
                  )}
                >
                  المواضيع والتصنيفات
                </button>
                <button
                  onClick={() => setIndexModalTab('titles')}
                  className={cn(
                    "flex-1 py-2 text-sm font-bold rounded-lg transition-all cursor-pointer",
                    indexModalTab === 'titles' ? "bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-sm" : "text-slate-600 dark:text-slate-300"
                  )}
                >
                  عناوين الأحاديث
                </button>
              </div>

              {indexModalTab === 'categories' ? (
                <>
                  {/* Category Topics Grid */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
                      <Layers size={15} />
                      <span>أبواب ومواضيع الأحاديث القدسية الرئيسية:</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {categories.map(cat => {
                        const count = cat.id === 'all' 
                          ? QUDSI_HADITHS.length 
                          : QUDSI_HADITHS.filter(h => h.category === cat.id).length;

                        return (
                          <button
                            key={cat.id}
                            onClick={() => {
                              setSelectedCategory(cat.id);
                              setSelectedTag(null);
                              setShowIndexModal(false);
                            }}
                            className={cn(
                              "p-3 rounded-2xl border text-right transition-all flex items-center justify-between cursor-pointer group",
                              selectedCategory === cat.id
                                ? "bg-amber-500/10 border-amber-500/40 text-amber-900 dark:text-amber-300 font-black"
                                : "bg-slate-50 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-800 hover:bg-amber-50/60 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
                            )}
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-amber-500/10 dark:bg-amber-400/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                                {cat.icon}
                              </div>
                              <div>
                                <span className="text-xs font-extrabold block">{cat.label}</span>
                                <span className="text-[10px] text-slate-500 font-bold">{count} أحاديث قدسية</span>
                              </div>
                            </div>

                            {selectedCategory === cat.id && (
                              <CheckCircle2 size={16} className="text-amber-500" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* All Topic Tags Cloud */}
                  <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                    <h4 className="text-xs font-black text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
                      <Tag size={15} />
                      <span>فهرس الموضوعات والكلمات الدلالية (#الوسوم):</span>
                    </h4>

                    <div className="flex flex-wrap gap-2">
                      {allTags.map((tag, idx) => {
                        const tagCount = QUDSI_HADITHS.filter(h => h.tags.includes(tag)).length;
                        const isSelected = selectedTag === tag;

                        return (
                          <button
                            key={idx}
                            onClick={() => {
                              setSelectedTag(isSelected ? null : tag);
                              setShowIndexModal(false);
                            }}
                            className={cn(
                              "px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border",
                              isSelected
                                ? "bg-amber-500 text-white border-amber-400 shadow-md"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-400 hover:bg-amber-50"
                            )}
                          >
                            <span>#{tag}</span>
                            <span className={cn(
                              "px-1.5 py-0.2 rounded-md text-[10px] font-black",
                              isSelected ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-500"
                            )}>
                              {tagCount}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-2 mt-4">
                  {QUDSI_HADITHS.map((item, idx) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        resetAllFilters();
                        setShowIndexModal(false);
                        setTimeout(() => {
                          const element = document.getElementById(item.id);
                          if (element) {
                            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }
                        }, 100);
                      }}
                      className="w-full text-right p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-amber-50 dark:bg-slate-800/50 dark:hover:bg-slate-800 transition-all flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 font-bold flex items-center justify-center shrink-0 shadow-sm">
                          {idx + 1}
                        </span>
                        <div>
                          <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                            {item.title}
                          </h4>
                          <span className="text-[10px] text-slate-500 font-bold">{item.categoryLabel}</span>
                        </div>
                      </div>
                      <ChevronDown size={16} className="text-slate-400 rotate-90 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              )}

              {/* Reset Action */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => {
                    resetAllFilters();
                    setShowIndexModal(false);
                  }}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-300 cursor-pointer"
                >
                  إلغاء وتصفح الكل
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* STATISTICS DASHBOARD MODAL */}
      <AnimatePresence>
        {showStatsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md overflow-y-auto"
            onClick={() => setShowStatsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl p-5 sm:p-7 border border-slate-200 dark:border-slate-800 space-y-6 shadow-2xl my-8 max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <BarChart2 size={22} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 dark:text-white text-lg sm:text-xl">
                      لوحة إحصائيات قراءة الأحاديث القدسية
                    </h3>
                    <p className="text-xs text-slate-500 font-bold">
                      متابعة بصرية لمعدل الإنجاز والموضوعات الأكثر تصفحاً وقراءة
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowStatsModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Overview KPI Cards Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {/* Card 1: Read Count & Progress */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-emerald-800 dark:text-emerald-300">الأحاديث المقروءة</span>
                    <CheckCircle2 size={18} className="text-emerald-500" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-slate-900 dark:text-white">{totalReadCount}</span>
                    <span className="text-xs font-bold text-slate-500">من {totalHadithsCount}</span>
                  </div>
                  <div className="w-full bg-emerald-200/50 dark:bg-slate-800 rounded-full h-2 mt-2 overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${readPercentage}%` }} />
                  </div>
                </div>

                {/* Card 2: Percentage Completion Rate */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-amber-800 dark:text-amber-300">نسبة الإنجاز الخاطر</span>
                    <TrendingUp size={18} className="text-amber-500" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-900 dark:text-white">{readPercentage}%</span>
                  </div>
                  <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400 mt-2">
                    {readPercentage === 100 ? '🎉 ختمت جميع الأحاديث القدسية!' : readPercentage > 50 ? '🌟 تجاوزت المنتصف بفضل الله!' : '🌱 واصل تدبر الكلام الشريف'}
                  </p>
                </div>

                {/* Card 3: Top Topic Category */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border border-blue-500/20">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-blue-800 dark:text-blue-300">الأكثر تصفحاً وقراءة</span>
                    <Flame size={18} className="text-blue-500" />
                  </div>
                  <div className="mt-2">
                    <span className="text-sm font-black text-slate-900 dark:text-white block truncate">
                      {mostReadCategory?.read > 0 ? mostReadCategory.name : 'لم تُحدد بعد'}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500">
                      {mostReadCategory?.read > 0 ? `${mostReadCategory.read} أحاديث مقروءة` : 'حدد أحاديث للقراءة'}
                    </span>
                  </div>
                </div>

                {/* Card 4: Favorites Saved */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-transparent border border-rose-500/20">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-rose-800 dark:text-rose-300">المفضلة المحفوظة</span>
                    <Heart size={18} className="text-rose-500 fill-rose-500" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-slate-900 dark:text-white">{favorites.length}</span>
                    <span className="text-xs font-bold text-slate-500">حديث مفضل</span>
                  </div>
                  <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400 mt-2">محفوظة للرجوع السريع</p>
                </div>
              </div>

              {/* Visual Charts Container */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                
                {/* Chart 1: Donut Chart - Read Hadiths per Category */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <PieIcon size={16} className="text-amber-500" />
                      <h4 className="text-xs font-black text-slate-800 dark:text-slate-200">
                        توزيع المقروء حسب الأبواب والموضوعات
                      </h4>
                    </div>
                    <span className="text-[10px] font-extrabold text-slate-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-800">
                      مخطط دائرى
                    </span>
                  </div>

                  <div className="h-60 w-full flex items-center justify-center dir-ltr">
                    <ResponsiveContainer width="100%" height="100%">
                      <RePieChart>
                        <Pie
                          data={pieChartDisplayData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {pieChartDisplayData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <ReTooltip 
                          contentStyle={{ 
                            backgroundColor: '#0f172a', 
                            borderColor: '#334155', 
                            borderRadius: '12px',
                            color: '#fff',
                            fontSize: '12px',
                            direction: 'rtl'
                          }} 
                        />
                        <ReLegend 
                          formatter={(value) => <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">{value}</span>}
                        />
                      </RePieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Chart 2: Bar Chart - Read vs Total */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BarChart2 size={16} className="text-emerald-500" />
                      <h4 className="text-xs font-black text-slate-800 dark:text-slate-200">
                        مقارنة المقروء والمتبقي بكل باب
                      </h4>
                    </div>
                    <span className="text-[10px] font-extrabold text-slate-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-800">
                      مخطط أعمدة
                    </span>
                  </div>

                  <div className="h-60 w-full flex items-center justify-center dir-ltr">
                    <ResponsiveContainer width="100%" height="100%">
                      <ReBarChart data={categoryStats} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                        <XAxis 
                          dataKey="name" 
                          tick={{ fontSize: 9, fill: '#64748b' }}
                          interval={0}
                          angle={-25}
                          textAnchor="end"
                        />
                        <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                        <ReTooltip 
                          contentStyle={{ 
                            backgroundColor: '#0f172a', 
                            borderColor: '#334155', 
                            borderRadius: '12px',
                            color: '#fff',
                            fontSize: '12px',
                            direction: 'rtl'
                          }} 
                        />
                        <Bar dataKey="read" fill="#10b981" name="المقروء" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="total" fill="#cbd5e1" name="الإجمالي" radius={[4, 4, 0, 0]} />
                      </ReBarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>

              {/* Detailed Category Progress Breakdown List */}
              <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Layers size={16} className="text-amber-500" />
                  <span>تفاصيل إنجاز القراءة بحسب مواضيع الأحاديث:</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {categoryStats.map(cat => (
                    <div 
                      key={cat.id} 
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs font-extrabold">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                          <span className="text-slate-800 dark:text-slate-200">{cat.name}</span>
                        </div>
                        <span className="text-[11px] font-black text-slate-500">
                          {cat.read} من {cat.total} ({cat.percentage}%)
                        </span>
                      </div>

                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-500" 
                          style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Actions Footer */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={markAllAsRead}
                    className="px-4 py-2 bg-emerald-500 text-white text-xs font-black rounded-xl shadow-md hover:bg-emerald-600 cursor-pointer flex items-center gap-1.5 transition-all"
                  >
                    <CheckCircle2 size={15} />
                    <span>تعيين جميع الأحاديث كمقروءة</span>
                  </button>

                  <button
                    onClick={resetReadProgress}
                    className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-300 dark:hover:bg-slate-700 cursor-pointer flex items-center gap-1.5 transition-all"
                  >
                    <RotateCcw size={14} />
                    <span>إعادة ضبط السجل</span>
                  </button>
                </div>

                <button
                  onClick={() => setShowStatsModal(false)}
                  className="px-5 py-2 bg-amber-500 text-white text-xs font-black rounded-xl hover:bg-amber-600 cursor-pointer shadow-md"
                >
                  إغلاق اللوحة
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CUSTOM SHARE IMAGE CARD MODAL */}
      <AnimatePresence>
        {shareItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto"
            onClick={() => setShareItem(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-4 shadow-2xl my-8"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <h3 className="font-black text-slate-800 dark:text-white text-base flex items-center gap-2">
                  <Share2 size={18} className="text-amber-500" />
                  <span>تصدير بطاقة حديث قدسي شريف</span>
                </h3>
                <button
                  onClick={() => setShareItem(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Theme selector */}
              <div className="flex items-center justify-center gap-3 py-1">
                <span className="text-xs font-bold text-slate-500">المظهر:</span>
                {(['emerald', 'amber', 'indigo', 'slate'] as const).map(th => (
                  <button
                    key={th}
                    onClick={() => setCardTheme(th)}
                    className={cn(
                      "w-7 h-7 rounded-full transition-transform border-2 cursor-pointer",
                      th === 'emerald' && "bg-emerald-600 border-emerald-400",
                      th === 'amber' && "bg-amber-600 border-amber-400",
                      th === 'indigo' && "bg-indigo-600 border-indigo-400",
                      th === 'slate' && "bg-slate-800 border-slate-600",
                      cardTheme === th && "scale-125 ring-2 ring-offset-2 ring-amber-500"
                    )}
                  />
                ))}
              </div>

              {/* Preview Card */}
              <div
                ref={previewCardRef}
                className={cn(
                  "p-6 rounded-3xl border text-center space-y-4 relative overflow-hidden text-white shadow-xl",
                  cardTheme === 'emerald' && "bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-950 border-emerald-500/30",
                  cardTheme === 'amber' && "bg-gradient-to-br from-amber-950 via-amber-900 to-stone-950 border-amber-500/30",
                  cardTheme === 'indigo' && "bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 border-indigo-500/30",
                  cardTheme === 'slate' && "bg-gradient-to-br from-slate-900 via-slate-950 to-black border-slate-700"
                )}
              >
                <div className="absolute inset-0 opacity-[0.08] bg-[url('/images/arabesque.png')]" />

                <div className="relative z-10 space-y-3">
                  <div className="inline-block px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold text-amber-300 border border-white/20">
                    ✨ حديث قدسي شريف ✨
                  </div>

                  <h4 className="font-black text-lg text-amber-200">
                    {shareItem.title}
                  </h4>

                  <p 
                    className="text-base sm:text-lg leading-relaxed text-amber-50 px-2 font-serif text-justify"
                    style={{ fontFamily: hadithFont }}
                  >
                    "{renderHadithTextWithDivineAndHighlight(shareItem.hadith, '')}"
                  </p>

                  <div className="pt-2 text-xs text-amber-200/80 font-bold border-t border-white/10 flex justify-between items-center">
                    <span>{shareItem.attribution}</span>
                    <span>{shareItem.reference}</span>
                  </div>

                  <div className="pt-2 text-[10px] text-white/50 text-center font-bold">
                    تطبيق أذكار المؤمن 💚
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleDownloadCustomCard}
                  disabled={sharingStatus === 'generating'}
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                >
                  <Download size={16} />
                  <span>{sharingStatus === 'generating' ? 'جاري التوليد...' : 'حفظ كصورة عالية الدقة'}</span>
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLOATING TOAST NOTIFICATION */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 dark:bg-slate-100/95 text-white dark:text-slate-900 px-5 py-3 rounded-2xl shadow-2xl border border-slate-700/50 dark:border-slate-300/50 text-xs font-black flex items-center gap-2.5 backdrop-blur-md"
          >
            <Heart size={16} className="text-rose-500 fill-rose-500 animate-pulse shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default HadithQudsi;

