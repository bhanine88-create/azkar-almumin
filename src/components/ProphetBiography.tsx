import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Baby, 
  Heart, 
  Sparkles, 
  BookOpen, 
  Shield, 
  Crown, 
  Compass, 
  Sword, 
  Sun, 
  HeartHandshake, 
  CheckCircle2, 
  Share2, 
  Copy, 
  Check, 
  ChevronLeft, 
  ChevronDown, 
  Search, 
  Award, 
  RotateCcw, 
  Star, 
  Bookmark, 
  BookmarkCheck, 
  HelpCircle,
  Clock,
  BookMarked,
  Quote,
  Sparkle,
  Sliders,
  CheckCircle,
  X,
  Zap,
  Flame,
  ShieldCheck,
  MessageCircle,
  Users,
  List,
  MapPin,
  Type,
  Palette,
  Eye,
  Settings,
  Landmark,
  ScrollText,
  Book
} from 'lucide-react';
import { PROPHET_BIOGRAPHY_STORIES, SeerahStory } from '../data/prophetBiographyData';
import { PROPHET_DATA } from '../prophetData';
import { cn, copyTextToClipboard } from '../lib/utils';
import { useSmartNavigation } from '../lib/navigation';
import { BackButton } from './ui/BackButton';
import { useAppContext } from '../AppContext';
import { BookViewer } from './BookViewer';

import { GhazwatTimeline } from './GhazwatTimeline';
import { safeLocalStorageGetItem, safeLocalStorageSetItem, safeLocalStorageRemoveItem } from "../utils/storage";
import { useTranslation } from '../i18n';

export interface SeerahSettings {
  fontFamily: 'amiri' | 'cairo' | 'tajawal' | 'naskh' | 'kufi' | 'ruqaa';
  fontSize: 'sm' | 'base' | 'lg' | 'xl' | '2xl';
  lineHeight: 'normal' | 'relaxed' | 'loose';
  theme: 'emerald' | 'parchment' | 'comfort' | 'gold' | 'sapphire' | 'kaaba';
  showIbnHisham: boolean;
  showVerses: boolean;
  showLessons: boolean;
  showHistoricalDetails: boolean;
}

const DEFAULT_SEERAH_SETTINGS: SeerahSettings = {
  fontFamily: 'amiri',
  fontSize: 'base',
  lineHeight: 'relaxed',
  theme: 'emerald',
  showIbnHisham: true,
  showVerses: true,
  showLessons: true,
  showHistoricalDetails: true,
};

const FONT_OPTIONS = [
  { id: 'amiri', name: 'الخط الأميري', label: 'مصحفي أصيل', family: '"Amiri", serif' },
  { id: 'tajawal', name: 'خط تجوال', label: 'عصري مريح', family: '"Tajawal", sans-serif' },
  { id: 'cairo', name: 'خط القاهرة', label: 'واضح ودقيق', family: '"Cairo", sans-serif' },
  { id: 'naskh', name: 'خط النسخ', label: 'تراثي كلاسيكي', family: '"Scheherazade New", "Noto Naskh Arabic", serif' },
  { id: 'kufi', name: 'الخط الكوفي', label: 'زخرفي إسلامي', family: '"Noto Kufi Arabic", sans-serif' },
  { id: 'ruqaa', name: 'خط الرقعة', label: 'طابع المخطوطات', family: '"Aref Ruqaa", "El Messiri", serif' },
];

const FONT_SIZES = [
  { id: 'sm', label: 'صغير', sizeClass: 'text-sm' },
  { id: 'base', label: 'متوسط', sizeClass: 'text-base' },
  { id: 'lg', label: 'كبير', sizeClass: 'text-lg' },
  { id: 'xl', label: 'كبير جداً', sizeClass: 'text-xl' },
  { id: '2xl', label: 'ضخم', sizeClass: 'text-2xl' },
];

const LINE_HEIGHTS = [
  { id: 'normal', label: 'عادي', heightClass: 'leading-normal' },
  { id: 'relaxed', label: 'مريح', heightClass: 'leading-relaxed' },
  { id: 'loose', label: 'متسع جداً', heightClass: 'leading-loose' },
];

const SEERAH_THEMES = [
  { 
    id: 'emerald', 
    name: 'الزمرد الإسلامي', 
    desc: 'الخضرة الإسلامية النورانية التراثية',
    modalClass: 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100',
    cardClass: 'bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800',
    badgeClass: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300',
    headerGradient: 'from-emerald-600 via-teal-600 to-cyan-700',
    previewColor: '#0F766E'
  },
  { 
    id: 'parchment', 
    name: 'المخطوطة العتيقة', 
    desc: 'ورق المخطوطات البردي والتراث القديم',
    modalClass: 'bg-[#FDF8EE] text-[#3D2E1E]',
    cardClass: 'bg-[#F5ECD7] border-[#E2D2B4]',
    badgeClass: 'bg-[#EADCBF] text-[#523E28]',
    headerGradient: 'from-amber-800 via-amber-900 to-amber-950',
    previewColor: '#F5ECD7'
  },
  { 
    id: 'comfort', 
    name: 'مريح للعين (سيبيا)', 
    desc: 'أصفر دافئ مريح للقراءة الطويلة وتقليل الضوء الأزرق',
    modalClass: 'bg-[#FAF0D7] text-[#2C221E]',
    cardClass: 'bg-[#F2E3C6] border-[#DFCDA7]',
    badgeClass: 'bg-[#E3D1AA] text-[#3D2E1E]',
    headerGradient: 'from-amber-700 via-amber-800 to-stone-800',
    previewColor: '#FAF0D7'
  },
  { 
    id: 'gold', 
    name: 'النور الذهبي', 
    desc: 'ثيم مذهب فاخر يبعث الراحة والبهجة',
    modalClass: 'bg-[#FFFDF0] dark:bg-[#181409] text-[#423100] dark:text-[#F2E3B3]',
    cardClass: 'bg-[#FFF8CD] dark:bg-[#28210D] border-[#E5CF83] dark:border-[#52431C]',
    badgeClass: 'bg-amber-200/70 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200',
    headerGradient: 'from-amber-500 via-orange-500 to-yellow-600',
    previewColor: '#EAB308'
  },
  { 
    id: 'sapphire', 
    name: 'الليل الياقوتي', 
    desc: 'أزرق كحلي داكن ملكي للقراءة الليلية',
    modalClass: 'bg-[#0B132B] text-[#E0FBFC]',
    cardClass: 'bg-[#1C2541] border-[#2A3D66]',
    badgeClass: 'bg-[#1C2541] text-[#A5F3FC] border border-[#3A506B]',
    headerGradient: 'from-blue-500 via-indigo-600 to-sky-600',
    previewColor: '#1C2541'
  },
  { 
    id: 'kaaba', 
    name: 'كسوة الكعبة', 
    desc: 'فخامة الأسود مع حواف الذهب',
    modalClass: 'bg-[#121212] text-[#F3F4F6]',
    cardClass: 'bg-[#1E1E1E] border-amber-500/30',
    badgeClass: 'bg-amber-950/80 text-amber-300 border border-amber-500/40',
    headerGradient: 'from-amber-400 via-yellow-500 to-amber-600',
    previewColor: '#121212'
  }
];

const getFontFamilyCss = (fontId: SeerahSettings['fontFamily']) => {
  const font = FONT_OPTIONS.find(f => f.id === fontId);
  return font ? font.family : '"Amiri", serif';
};

const iconMap: Record<string, any> = {
  Baby,
  Heart,
  Sparkles,
  BookOpen,
  Shield,
  Crown,
  Compass,
  Sword,
  Sun,
  HeartHandshake,
  ShieldCheck,
  Zap,
  Flame,
  BookMarked,
  Award,
  Users,
  MapPin,
  MessageCircle
};

const PERIOD_CATEGORIES = [
  { id: 'all', label: 'كافة المحطات', icon: Sparkles, color: 'from-amber-500 to-orange-600' },
  { id: 'pre_prophethood', label: 'قبل البعثة', icon: Baby, color: 'from-emerald-500 to-teal-600' },
  { id: 'meccan', label: 'العهد المكي', icon: BookOpen, color: 'from-blue-500 to-indigo-600' },
  { id: 'medinan', label: 'العهد المدني', icon: Compass, color: 'from-rose-500 to-pink-600' },
  { id: 'conquests_final', label: 'الفتوحات والختام', icon: Sun, color: 'from-purple-500 to-fuchsia-600' }
];

export const ProphetBiography: React.FC = () => {
  const { navigate } = useSmartNavigation();
  const { settings, addPoints } = useAppContext();
  const { t } = useTranslation(settings?.appLanguage || 'ar');

  // Active Tab: 'timeline' (السيرة النبوية), 'virtues' (الشمائل والوصايا), 'ghazwat' (الغزوات), 'quiz' (تحدي السيرة), 'library' (مكتبة السيرة)
  const [activeTab, setActiveTab] = useState<'timeline' | 'virtues' | 'ghazwat' | 'quiz' | 'library'>('timeline');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Reading state & progress
  const [readStoryIds, setReadStoryIds] = useState<string[]>(() => {
    try {
      const saved = safeLocalStorageGetItem('believer_read_seerah_stories');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    try {
      const saved = safeLocalStorageGetItem('believer_bookmarked_seerah_stories');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Selected Story Modal / Reader & Settings
  const [activeStory, setActiveStory] = useState<SeerahStory | null>(null);
  const [copied, setCopied] = useState(false);
  const [showIndexModal, setShowIndexModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Interactive Seerah Event Tree states
  const [expandedPeriods, setExpandedPeriods] = useState<Record<string, boolean>>({
    pre_prophethood: true,
    meccan: true,
    medinan: true,
    conquests_final: true,
  });
  const [treeSearchQuery, setTreeSearchQuery] = useState('');
  const [treeFilter, setTreeFilter] = useState<'all' | 'read' | 'unread' | 'bookmarked'>('all');

  // Auto-expand periods when searching
  useEffect(() => {
    if (treeSearchQuery) {
      setExpandedPeriods(prev => {
        const activePeriods = { ...prev };
        PROPHET_BIOGRAPHY_STORIES.forEach(story => {
          const query = treeSearchQuery.toLowerCase().trim();
          const matches = story.title.toLowerCase().includes(query) || 
                          story.summary.toLowerCase().includes(query) ||
                          story.year.toLowerCase().includes(query) ||
                          story.keyLessons.some(l => l.toLowerCase().includes(query));
          if (matches) {
            activePeriods[story.period] = true;
          }
        });
        return activePeriods;
      });
    }
  }, [treeSearchQuery]);

  // Custom Seerah Display Settings
  const [seerahSettings, setSeerahSettings] = useState<SeerahSettings>(() => {
    try {
      const saved = safeLocalStorageGetItem('believer_seerah_custom_settings');
      return saved ? { ...DEFAULT_SEERAH_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SEERAH_SETTINGS;
    } catch {
      return DEFAULT_SEERAH_SETTINGS;
    }
  });

  // Save custom seerah settings
  useEffect(() => {
    try {
      safeLocalStorageSetItem('believer_seerah_custom_settings', JSON.stringify(seerahSettings));
    } catch (e) {
      console.error(e);
    }
  }, [seerahSettings]);

  // Quiz state
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Save read stories
  useEffect(() => {
    safeLocalStorageSetItem('believer_read_seerah_stories', JSON.stringify(readStoryIds));
  }, [readStoryIds]);

  // Save bookmarked stories
  useEffect(() => {
    safeLocalStorageSetItem('believer_bookmarked_seerah_stories', JSON.stringify(bookmarkedIds));
  }, [bookmarkedIds]);

  const toggleReadStatus = (storyId: string) => {
    setReadStoryIds(prev => {
      if (prev.includes(storyId)) {
        return prev.filter(id => id !== storyId);
      } else {
        return [...prev, storyId];
      }
    });
  };

  const toggleBookmark = (storyId: string) => {
    setBookmarkedIds(prev => {
      if (prev.includes(storyId)) {
        return prev.filter(id => id !== storyId);
      } else {
        return [...prev, storyId];
      }
    });
  };

  const handleCopyStory = (story: SeerahStory) => {
    const textToCopy = `📖 ${story.title} (${story.periodLabel})\n\n` +
      `📅 المحطة: ${story.year}\n\n` +
      `${story.paragraphs.join('\n\n')}\n\n` +
      `💡 أبرز الدروس المستفادة:\n${story.keyLessons.map(l => `• ${l}`).join('\n')}\n\n` +
      `تطبيق أذكار المؤمن - السيرة النبوية الشريفة`;

    copyTextToClipboard(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Filtered stories
  const filteredStories = useMemo(() => {
    return PROPHET_BIOGRAPHY_STORIES.filter(story => {
      const matchesSearch = 
        story.title.includes(searchQuery) || 
        story.summary.includes(searchQuery) ||
        story.paragraphs.some(p => p.includes(searchQuery)) ||
        story.keyLessons.some(l => l.includes(searchQuery));

      const matchesPeriod = selectedPeriod === 'all' || story.period === selectedPeriod;
      return matchesSearch && matchesPeriod;
    });
  }, [searchQuery, selectedPeriod]);

  // Overall reading progress percentage
  const progressPercentage = useMemo(() => {
    if (PROPHET_BIOGRAPHY_STORIES.length === 0) return 0;
    return Math.round((readStoryIds.length / PROPHET_BIOGRAPHY_STORIES.length) * 100);
  }, [readStoryIds]);

  // Quiz questions extracted from stories
  const quizQuestions = useMemo(() => {
    return PROPHET_BIOGRAPHY_STORIES
      .filter(s => s.quizQuestion !== undefined)
      .map(s => ({
        storyTitle: s.title,
        ...s.quizQuestion!
      }));
  }, []);

  const handleQuizAnswer = (index: number) => {
    if (quizSubmitted) return;
    setSelectedAnswer(index);
    setQuizSubmitted(true);
    if (index === quizQuestions[currentQuizIndex].correctIndex) {
      setScore(prev => prev + 1);
      addPoints?.(10);
    }
  };

  const handleNextQuizQuestion = () => {
    if (currentQuizIndex < quizQuestions.length - 1) {
      setCurrentQuizIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setQuizSubmitted(false);
    } else {
      setQuizCompleted(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuizIndex(0);
    setSelectedAnswer(null);
    setQuizSubmitted(false);
    setQuizCompleted(false);
    setScore(0);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 text-right" dir="rtl">
      {/* Sticky Top Header */}
      <div className="bg-white/80 dark:bg-slate-900/85 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/80 sticky top-0 z-30">
        <div className="px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BackButton />
            <div>
              <h1 className="text-xl font-black bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 bg-clip-text text-transparent leading-tight">
                {t('home_seerah_title')}
              </h1>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wider">
                حياة المصطفى ﷺ أحداث ودروس وعبر مبسطة
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettingsModal(true)}
              className="px-3 py-2 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 hover:from-emerald-500/20 hover:to-teal-500/20 border border-emerald-500/30 rounded-2xl flex items-center gap-1.5 text-xs font-black text-emerald-700 dark:text-emerald-300 transition-all cursor-pointer shadow-sm"
              title="تخصيص وإعدادات السيرة"
            >
              <Sliders size={16} className="text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">إعدادات الخط والثيم</span>
              <span className="sm:hidden">الإعدادات</span>
            </button>

            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-700 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 shrink-0">
              <Crown size={20} className="fill-white/20" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-4 pb-2 flex gap-2 border-t border-slate-100 dark:border-slate-800 pt-2 overflow-x-auto hide-scrollbar snap-x">
          <button
            onClick={() => setActiveTab('timeline')}
            className={cn(
              "flex-none py-2.5 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer snap-start whitespace-nowrap",
              activeTab === 'timeline'
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                : "bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200/60"
            )}
          >
            <BookOpen size={14} />
            <span>السيرة التفاعلية</span>
          </button>

          <button
            onClick={() => setActiveTab('virtues')}
            className={cn(
              "flex-none py-2.5 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer snap-start whitespace-nowrap",
              activeTab === 'virtues'
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                : "bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200/60"
            )}
          >
            <Sparkles size={14} />
            <span>الشمائل والوصايا</span>
          </button>

          <button
            onClick={() => setActiveTab('ghazwat')}
            className={cn(
              "flex-none py-2.5 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer snap-start whitespace-nowrap",
              activeTab === 'ghazwat'
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                : "bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200/60"
            )}
          >
            <Sword size={14} />
            <span>الغزوات والبطولات</span>
          </button>

          <button
            onClick={() => setActiveTab('quiz')}
            className={cn(
              "flex-none py-2.5 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer snap-start whitespace-nowrap",
              activeTab === 'quiz'
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                : "bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200/60"
            )}
          >
            <Award size={14} />
            <span>تحدي السيرة</span>
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={cn(
              "flex-none py-2.5 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer snap-start whitespace-nowrap",
              activeTab === 'library'
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                : "bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200/60"
            )}
          >
            <Book size={14} />
            <span>مكتبة السيرة</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-4 space-y-5">
        
        {/* Progress Tracker Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden"
        >
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <BookMarked size={16} />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-800 dark:text-white">إنجازك في قراءة السيرة</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">
                  أكملت {readStoryIds.length} من أصل {PROPHET_BIOGRAPHY_STORIES.length} محطة رئيسية
                </p>
              </div>
            </div>
            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
              {progressPercentage}%
            </span>
          </div>

          <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
            />
          </div>
        </motion.div>

        {/* TAB 1: TIMELINE & STORIES */}
        {activeTab === 'timeline' && (
          <div className="space-y-5">
            {/* Search Input and Index Button */}
            <div className="flex gap-2">
              <div className="relative group flex-1">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                <input
                  type="text"
                  placeholder="ابحث عن محطة في السيرة، حدث، أو درس مستفاد..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-full bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 focus:border-emerald-500/40 rounded-2xl py-3.5 pr-11 pl-4 text-sm focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none text-slate-800 dark:text-slate-200 placeholder:text-slate-400 font-bold"
                />
              </div>
              <button
                onClick={() => setShowIndexModal(true)}
                className="bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 p-3.5 rounded-2xl flex items-center justify-center transition-all shrink-0 cursor-pointer shadow-sm group"
                title="فهرس السيرة النبوية"
              >
                <List size={20} className="group-hover:scale-110 transition-transform" />
              </button>
            </div>

            {/* Period Filters */}
            <div className="overflow-x-auto no-scrollbar flex gap-2 pb-1 snap-x">
              {PERIOD_CATEGORIES.map(cat => {
                const Icon = cat.icon;
                const isActive = selectedPeriod === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedPeriod(cat.id)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition-all cursor-pointer",
                      isActive
                        ? `bg-gradient-to-r ${cat.color} text-white shadow-md`
                        : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                    )}
                  >
                    <Icon size={14} />
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Story List */}
            <div className="space-y-4">
              {filteredStories.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6">
                  <Search size={32} className="mx-auto text-slate-400 mb-2" />
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">لم نجد أي نتائج تطابق البحث</p>
                </div>
              ) : (
                filteredStories.map((story, idx) => {
                  const Icon = iconMap[story.icon] || BookOpen;
                  const isRead = readStoryIds.includes(story.id);
                  const isBookmarked = bookmarkedIds.includes(story.id);

                  return (
                    <motion.div
                      key={story.id}
                      id={story.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all overflow-hidden scroll-mt-32"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3.5 flex-1">
                          <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md bg-gradient-to-br", story.color)}>
                            <Icon size={22} />
                          </div>

                          <div className="space-y-1.5 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-500/10">
                                {story.periodLabel}
                              </span>
                              <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 flex items-center gap-1">
                                <Clock size={10} />
                                {story.year}
                              </span>
                            </div>

                            <h3 className="text-base font-black text-slate-800 dark:text-white leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                              {story.title}
                            </h3>

                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 font-bold">
                              {story.summary}
                            </p>
                          </div>
                        </div>

                        {/* Top controls */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => toggleBookmark(story.id)}
                            className={cn(
                              "p-2 rounded-xl transition-all cursor-pointer",
                              isBookmarked ? "text-amber-500 bg-amber-50 dark:bg-amber-950/30" : "text-slate-300 dark:text-slate-600 hover:text-amber-500"
                            )}
                            title="حفظ في المفضلة"
                          >
                            <Bookmark size={18} className={cn(isBookmarked && "fill-amber-500")} />
                          </button>

                          <button
                            onClick={() => toggleReadStatus(story.id)}
                            className={cn(
                              "p-2 rounded-xl transition-all cursor-pointer",
                              isRead ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30" : "text-slate-300 dark:text-slate-600 hover:text-emerald-500"
                            )}
                            title={isRead ? "تمت قراءتها" : "تعليم كـ مقروءة"}
                          >
                            <CheckCircle2 size={18} className={cn(isRead && "fill-emerald-500 text-white")} />
                          </button>
                        </div>
                      </div>

                      {/* Footer Actions & Interactive Icons */}
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap flex-1">
                          {story.historicalDetails && story.historicalDetails.length > 0 && (
                            <button
                              onClick={() => setActiveStory(story)}
                              className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/30 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-[10px] font-black transition-all flex items-center gap-1.5 cursor-pointer"
                              title="التفاصيل التاريخية"
                            >
                              <Landmark size={12} />
                              <span>تاريخ</span>
                            </button>
                          )}
                          
                          {story.ibnHishamExcerpt && (
                            <button
                              onClick={() => setActiveStory(story)}
                              className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/30 dark:hover:bg-amber-900/40 text-amber-700 dark:text-amber-400 text-[10px] font-black transition-all flex items-center gap-1.5 cursor-pointer"
                              title="سيرة ابن هشام"
                            >
                              <ScrollText size={12} />
                              <span>ابن هشام</span>
                            </button>
                          )}

                          {story.quranVerse && (
                            <button
                              onClick={() => setActiveStory(story)}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-[10px] font-black transition-all flex items-center gap-1.5 cursor-pointer"
                              title="آيات قرآنية مرتبطة"
                            >
                              <Book size={12} />
                              <span>قرآن</span>
                            </button>
                          )}

                          {story.keyLessons && story.keyLessons.length > 0 && (
                            <button
                              onClick={() => setActiveStory(story)}
                              className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/30 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-[10px] font-black transition-all flex items-center gap-1.5 cursor-pointer"
                              title="دروس مستفادة"
                            >
                              <Sparkle size={12} />
                              <span>{story.keyLessons.length} دروس</span>
                            </button>
                          )}
                        </div>

                        <button
                          onClick={() => setActiveStory(story)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-black hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                        >
                          <span>المحتوى</span>
                          <ChevronLeft size={14} />
                        </button>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 2: VIRTUES, MORALS & ATTRIBUTES (PROPHET_DATA) */}
        {activeTab === 'virtues' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-teal-800 to-emerald-900 text-white rounded-3xl p-6 shadow-lg relative overflow-hidden">
              <div className="relative z-10 space-y-2">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-wider">
                  شمائل النبوة
                </span>
                <h2 className="text-xl font-black">أخلاق الحبيب المصطفى ﷺ وشمائله العطرة</h2>
                <p className="text-xs text-emerald-100 font-bold leading-relaxed">
                  تعرف على خُلقه العظيم، معجزاته الباهرة، وصاياه الخالدة، ومحطاته الكبرى.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PROPHET_DATA.map((section, idx) => {
                const Icon = iconMap[section.icon] || Star;
                return (
                  <motion.div
                    key={section.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-slate-800 p-5 shadow-sm space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md bg-gradient-to-br", section.color)}>
                        <Icon size={20} />
                      </div>
                      <h3 className="font-black text-base text-slate-800 dark:text-white">
                        {section.title}
                      </h3>
                    </div>

                    <div className="space-y-2.5 pt-1">
                      {section.content.map((point, pIdx) => {
                        const colonIdx = point.indexOf(':');
                        const title = colonIdx !== -1 ? point.substring(0, colonIdx) : '';
                        const details = colonIdx !== -1 ? point.substring(colonIdx + 1) : point;

                        return (
                          <div key={pIdx} className="bg-slate-50 dark:bg-slate-850 p-3 rounded-2xl text-xs font-bold leading-relaxed space-y-1">
                            {title && (
                              <span className="text-emerald-700 dark:text-emerald-400 font-black block">
                                • {title}
                              </span>
                            )}
                            <p className="text-slate-600 dark:text-slate-300">
                              {details}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: GHAZWAT */}
        {activeTab === 'ghazwat' && (
          <GhazwatTimeline />
        )}

        {/* TAB 4: SEERAH QUIZ & CHALLENGE */}
        {activeTab === 'quiz' && (
          <div className="space-y-5">
            {!quizCompleted ? (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-slate-800 p-6 shadow-sm space-y-6">
                {/* Quiz Header Progress */}
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                      اختبر معلوماتك في السيرة
                    </span>
                    <h3 className="text-base font-black text-slate-800 dark:text-white mt-0.5">
                      السؤال {currentQuizIndex + 1} من {quizQuestions.length}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 px-3 py-1.5 rounded-2xl font-black text-xs">
                    <Star size={14} className="fill-amber-400" />
                    <span>النقاط: {score * 10}</span>
                  </div>
                </div>

                {/* Question */}
                <div className="space-y-4">
                  <span className="text-xs font-bold text-slate-400 block">
                    المحطة: {quizQuestions[currentQuizIndex]?.storyTitle}
                  </span>
                  <h2 className="text-lg font-black text-slate-800 dark:text-white leading-relaxed">
                    {quizQuestions[currentQuizIndex]?.question}
                  </h2>

                  {/* Options */}
                  <div className="space-y-2.5 pt-2">
                    {quizQuestions[currentQuizIndex]?.options.map((opt, optIdx) => {
                      const isCorrect = optIdx === quizQuestions[currentQuizIndex].correctIndex;
                      const isSelected = selectedAnswer === optIdx;

                      let buttonStyle = "bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-emerald-500/50";
                      
                      if (quizSubmitted) {
                        if (isCorrect) {
                          buttonStyle = "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-800 dark:text-emerald-300 font-black";
                        } else if (isSelected) {
                          buttonStyle = "bg-rose-50 dark:bg-rose-950/50 border-rose-500 text-rose-800 dark:text-rose-300 font-black";
                        }
                      }

                      return (
                        <button
                          key={optIdx}
                          disabled={quizSubmitted}
                          onClick={() => handleQuizAnswer(optIdx)}
                          className={cn(
                            "w-full p-4 rounded-2xl border text-right text-sm transition-all flex items-center justify-between cursor-pointer font-bold",
                            buttonStyle
                          )}
                        >
                          <span>{opt}</span>
                          {quizSubmitted && isCorrect && <CheckCircle size={18} className="text-emerald-500 shrink-0" />}
                          {quizSubmitted && isSelected && !isCorrect && <X size={18} className="text-rose-500 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation feedback */}
                  {quizSubmitted && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-500/20 rounded-2xl p-4 text-xs space-y-1"
                    >
                      <span className="font-black text-emerald-700 dark:text-emerald-400 block">💡 التوضيح الإيماني:</span>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-bold">
                        {quizQuestions[currentQuizIndex]?.explanation}
                      </p>
                    </motion.div>
                  )}
                </div>

                {/* Footer Next Button */}
                {quizSubmitted && (
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={handleNextQuizQuestion}
                      className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <span>{currentQuizIndex < quizQuestions.length - 1 ? "السؤال التالي" : "عرض النتائج والوسام"}</span>
                      <ChevronLeft size={16} />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Quiz Completion Screen */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-slate-800 p-8 text-center space-y-5 shadow-lg"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-emerald-500 rounded-3xl mx-auto flex items-center justify-center text-white shadow-xl shadow-amber-500/20">
                  <Award size={40} />
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-slate-800 dark:text-white">
                    مبارك! أتممت تحدي السيرة النبوية
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-bold">
                    حصلت على {score} إجابات صحيحة من أصل {quizQuestions.length} أسئلة
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 px-5 py-2.5 rounded-2xl font-black text-sm">
                  <Star size={18} className="fill-emerald-500" />
                  <span>كسبت {score * 10} نقطة في رصيد التحديات</span>
                </div>

                <div className="pt-4 flex justify-center gap-3">
                  <button
                    onClick={resetQuiz}
                    className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-2xl font-black text-xs hover:bg-slate-200 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <RotateCcw size={16} />
                    <span>إعادة التحدي</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('timeline')}
                    className="px-6 py-3 bg-emerald-600 text-white rounded-2xl font-black text-xs hover:bg-emerald-700 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <BookOpen size={16} />
                    <span>العودة لقراءة السيرة</span>
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* TAB 4: LIBRARY & BOOKS */}
        {activeTab === 'library' && (
          <div className="space-y-5">
            <BookViewer />
          </div>
        )}
      </div>

      {/* STORY DETAIL MODAL / READER */}
      {typeof document !== 'undefined' && createPortal(
      <AnimatePresence>
        {activeStory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[90vh] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden text-right"
              dir="rtl"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md z-10">
                <div className="flex items-center gap-3">
                  <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md bg-gradient-to-br", activeStory.color)}>
                    {React.createElement(iconMap[activeStory.icon] || BookOpen, { size: 20 })}
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-800 dark:text-white">
                      {activeStory.title}
                    </h2>
                    <span className="text-[10px] font-bold text-slate-400">
                      {activeStory.periodLabel} • {activeStory.year}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setActiveStory(null)}
                  className="p-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Toolbar: Audio TTS & Font size & Theme Settings & Copy */}
              <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-850 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs flex-wrap gap-2">
                {/* Font Size & Family Controls */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400">حجم الخط:</span>
                  <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    {FONT_SIZES.map(fs => (
                      <button
                        key={fs.id}
                        onClick={() => setSeerahSettings(s => ({ ...s, fontSize: fs.id as SeerahSettings['fontSize'] }))}
                        className={cn(
                          "px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer",
                          seerahSettings.fontSize === fs.id ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                        )}
                        title={fs.label}
                      >
                        {fs.id === 'sm' ? 'A-' : fs.id === '2xl' ? 'A++' : fs.id === 'xl' ? 'A+' : 'A'}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setShowSettingsModal(true)}
                    className="p-1.5 px-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 hover:bg-emerald-100 transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold"
                  >
                    <Type size={14} />
                    <span>{FONT_OPTIONS.find(f => f.id === seerahSettings.fontFamily)?.name || 'الخط'}</span>
                  </button>

                  {/* Theme Quick Dropdown */}
                  <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
                    <Palette size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <select
                      value={seerahSettings.theme}
                      onChange={(e) => setSeerahSettings(s => ({ ...s, theme: e.target.value as SeerahSettings['theme'] }))}
                      className="bg-transparent text-[11px] font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer py-0.5"
                      title="اختر ثيم القراءة"
                    >
                      {SEERAH_THEMES.map(t => (
                        <option key={t.id} value={t.id} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowSettingsModal(true)}
                    className="p-2 rounded-xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-600 transition-all cursor-pointer flex items-center gap-1 px-2.5 border border-slate-200 dark:border-slate-700"
                    title="إعدادات القراءة والتنسيق"
                  >
                    <Sliders size={14} className="text-emerald-600 dark:text-emerald-400" />
                    <span className="text-[11px] font-bold hidden sm:inline">تخصيص العرض</span>
                  </button>

                  <button
                    onClick={() => handleCopyStory(activeStory)}
                    className="p-2 rounded-xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-600 transition-all cursor-pointer flex items-center gap-1.5 px-3 border border-slate-200 dark:border-slate-700"
                    title="نسخ القصة"
                  >
                    {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                    <span className="text-[11px] font-bold">{copied ? 'تم النسخ' : 'نسخ'}</span>
                  </button>
                </div>
              </div>

              {/* Story Content Scrollable */}
              <div 
                className={cn(
                  "p-6 overflow-y-auto space-y-6 flex-1 transition-all duration-300",
                  SEERAH_THEMES.find(t => t.id === seerahSettings.theme)?.modalClass || ''
                )}
                style={{ fontFamily: getFontFamilyCss(seerahSettings.fontFamily) }}
              >
                {/* Quran Verse Frame if exists */}
                {seerahSettings.showVerses && activeStory.quranVerse && (
                  <div className="bg-gradient-to-br from-emerald-900 via-teal-950 to-slate-950 text-amber-100 p-5 rounded-3xl border border-amber-400/20 shadow-inner text-center space-y-2 relative overflow-hidden">
                    <Quote size={24} className="mx-auto text-amber-400/30" />
                    <p className="font-serif text-base sm:text-lg font-bold leading-loose text-amber-200" style={{ fontFamily: '"Amiri", serif' }}>
                      "{activeStory.quranVerse.text}"
                    </p>
                    <span className="text-[11px] font-black text-amber-400/80 block">
                      — {activeStory.quranVerse.surah}
                    </span>
                  </div>
                )}

                {/* Detailed Paragraphs */}
                <div className={cn(
                  "space-y-4 text-justify font-normal",
                  FONT_SIZES.find(s => s.id === seerahSettings.fontSize)?.sizeClass || 'text-base',
                  LINE_HEIGHTS.find(l => l.id === seerahSettings.lineHeight)?.heightClass || 'leading-relaxed'
                )}>
                  {activeStory.paragraphs.map((p, idx) => (
                    <p 
                      key={idx} 
                      className={cn(
                        "p-4 rounded-2xl border transition-colors",
                        SEERAH_THEMES.find(t => t.id === seerahSettings.theme)?.cardClass || "bg-slate-50/50 dark:bg-slate-850/50 border-slate-100 dark:border-slate-800/60"
                      )}
                    >
                      {p}
                    </p>
                  ))}
                </div>

                {/* Ibn Hisham Reference Excerpt */}
                {seerahSettings.showIbnHisham && activeStory.ibnHishamExcerpt && (
                  <div className="bg-gradient-to-br from-amber-50 via-orange-50/50 to-amber-100/30 dark:from-amber-950/40 dark:via-slate-900 dark:to-amber-950/20 border border-amber-300/60 dark:border-amber-700/40 p-5 rounded-3xl space-y-2.5 shadow-sm relative overflow-hidden">
                    <div className="flex items-center justify-between border-b border-amber-200/60 dark:border-amber-800/50 pb-2">
                      <span className="font-black text-xs text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                        <BookMarked size={16} className="text-amber-600 dark:text-amber-400" />
                        📜 توثيق سيرة ابن هشام (عن ابن إسحاق)
                      </span>
                      <span className="text-[10px] font-extrabold bg-amber-200/60 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 px-2 py-0.5 rounded-full">
                        مرجع تاريخي معتمد
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-amber-950 dark:text-amber-100 leading-relaxed font-serif pt-1">
                      "{activeStory.ibnHishamExcerpt}"
                    </p>
                  </div>
                )}

                {/* Historical Details & Figures */}
                {seerahSettings.showHistoricalDetails && activeStory.historicalDetails && activeStory.historicalDetails.length > 0 && (
                  <div className="bg-blue-50/60 dark:bg-blue-950/20 border border-blue-500/20 p-5 rounded-3xl space-y-3">
                    <h3 className="font-black text-sm text-blue-900 dark:text-blue-300 flex items-center gap-2">
                      <MapPin size={16} className="text-blue-500" />
                      <span>توثيقات وأعلام ومواقع المحطة (من سيرة ابن هشام):</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                      {activeStory.historicalDetails.map((detail, dIdx) => (
                        <div key={dIdx} className="bg-white/80 dark:bg-slate-800/80 p-2.5 rounded-xl border border-blue-100 dark:border-blue-900/40 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                          <span className="leading-relaxed">{detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Hadith Ref if exists */}
                {activeStory.hadithRef && (
                  <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-500/20 p-4 rounded-2xl text-xs font-bold text-amber-900 dark:text-amber-200 space-y-1">
                    <span className="font-black text-amber-700 dark:text-amber-400 block">📜 الشاهد الحديثي:</span>
                    <p className="leading-relaxed">{activeStory.hadithRef}</p>
                  </div>
                )}

                {/* Key Lessons Learned */}
                {seerahSettings.showLessons && (
                  <div className="bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-500/20 p-5 rounded-3xl space-y-3">
                    <h3 className="font-black text-sm text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                      <Sparkles size={16} className="text-emerald-500" />
                      <span>أبرز الدروس والعبر المستفادة من المحطة:</span>
                    </h3>

                    <ul className="space-y-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                      {activeStory.keyLessons.map((lesson, lIdx) => (
                        <li key={lIdx} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                          <span className="leading-relaxed">{lesson}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
                <button
                  onClick={() => {
                    toggleReadStatus(activeStory.id);
                  }}
                  className={cn(
                    "px-4 py-2.5 rounded-2xl font-black text-xs transition-all flex items-center gap-2 cursor-pointer",
                    readStoryIds.includes(activeStory.id)
                      ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400"
                      : "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                  )}
                >
                  <CheckCircle2 size={16} />
                  <span>{readStoryIds.includes(activeStory.id) ? "مكتملة القراءة ✓" : "تعليم كـ مكتملة"}</span>
                </button>

                <button
                  onClick={() => setActiveStory(null)}
                  className="px-5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-xs cursor-pointer"
                >
                  إغلاق
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      , document.body)}

      {/* Index Modal */}
      {typeof document !== 'undefined' && createPortal(
      <AnimatePresence>
        {showIndexModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" dir="rtl">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowIndexModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 sm:rounded-[2rem] rounded-t-[2rem] shadow-2xl flex flex-col max-h-[85vh] sm:max-h-[80vh] overflow-hidden"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center shadow-sm">
                    <List size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-800 dark:text-white">شجرة أحداث السيرة</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">تصفح تفاعلي، طي وتوسيع الفترات التاريخية</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowIndexModal(false)}
                  className="w-10 h-10 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Event Tree Toolbar */}
              <div className="px-6 py-4 bg-slate-50 dark:bg-slate-850/50 border-b border-slate-100 dark:border-slate-800/80 flex flex-col gap-3 shrink-0">
                {/* Search in Tree */}
                <div className="relative group">
                  <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={16} />
                  <input
                    type="text"
                    placeholder="ابحث في شجرة الأحداث، الغزوات، الشخصيات..."
                    value={treeSearchQuery}
                    onChange={(e) => setTreeSearchQuery(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-xl py-2 pr-10 pl-4 text-xs focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/50 outline-none text-slate-800 dark:text-slate-200 placeholder:text-slate-400 font-bold"
                  />
                  {treeSearchQuery && (
                    <button 
                      onClick={() => setTreeSearchQuery('')} 
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>

                {/* Tree Controls (Collapse/Expand/Filters) */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  {/* Expand/Collapse All */}
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => {
                        const allExpanded = { pre_prophethood: true, meccan: true, medinan: true, conquests_final: true };
                        setExpandedPeriods(allExpanded);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-black cursor-pointer text-[10px]"
                    >
                      توسيع الكل
                    </button>
                    <button
                      onClick={() => {
                        const allCollapsed = { pre_prophethood: false, meccan: false, medinan: false, conquests_final: false };
                        setExpandedPeriods(allCollapsed);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-black cursor-pointer text-[10px]"
                    >
                      طي الكل
                    </button>
                  </div>

                  {/* Filter Tabs */}
                  <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200/50 dark:border-slate-700/50 gap-0.5 font-bold font-black">
                    {(['all', 'read', 'unread', 'bookmarked'] as const).map((filter) => {
                      const label = 
                        filter === 'all' ? 'الكل' : 
                        filter === 'read' ? 'المقروءة' : 
                        filter === 'unread' ? 'غير المقروءة' : 'المفضلة';

                      const isActive = treeFilter === filter;
                      return (
                        <button
                          key={filter}
                          onClick={() => setTreeFilter(filter)}
                          className={cn(
                            "px-2 py-1 rounded-md text-[9px] transition-all cursor-pointer font-black",
                            isActive 
                              ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm" 
                              : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                          )}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Content (Scrollable Tree) */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 no-scrollbar">
                <div className="space-y-4">
                  {PERIOD_CATEGORIES.filter(c => c.id !== 'all').map((category) => {
                    const rawPeriodStories = PROPHET_BIOGRAPHY_STORIES.filter(s => s.period === category.id);
                    if (rawPeriodStories.length === 0) return null;

                    const filteredPeriodStories = rawPeriodStories.filter(story => {
                      // 1. Filter by Search Query
                      if (treeSearchQuery) {
                        const query = treeSearchQuery.toLowerCase().trim();
                        const matchesTitle = story.title.toLowerCase().includes(query);
                        const matchesSummary = story.summary.toLowerCase().includes(query);
                        const matchesYear = story.year.toLowerCase().includes(query);
                        const matchesLessons = story.keyLessons.some(l => l.toLowerCase().includes(query));
                        if (!matchesTitle && !matchesSummary && !matchesYear && !matchesLessons) {
                          return false;
                        }
                      }
                      // 2. Filter by Status
                      if (treeFilter === 'read' && !readStoryIds.includes(story.id)) return false;
                      if (treeFilter === 'unread' && readStoryIds.includes(story.id)) return false;
                      if (treeFilter === 'bookmarked' && !bookmarkedIds.includes(story.id)) return false;

                      return true;
                    });

                    // If filtered list is empty, don't show this category card
                    if (filteredPeriodStories.length === 0) return null;

                    const CatIcon = category.icon;
                    const isExpanded = expandedPeriods[category.id];
                    const readInPeriod = rawPeriodStories.filter(s => readStoryIds.includes(s.id)).length;
                    const totalInPeriod = rawPeriodStories.length;
                    const completionPercentage = Math.round((readInPeriod / totalInPeriod) * 100);

                    return (
                      <div key={category.id} className="relative">
                        {/* Parent Node */}
                        <button
                          onClick={() => setExpandedPeriods(prev => ({ ...prev, [category.id]: !prev[category.id] }))}
                          className={cn(
                            "w-full flex items-center justify-between p-3.5 rounded-2xl border text-right transition-all duration-200 relative group overflow-hidden shadow-sm cursor-pointer",
                            isExpanded 
                              ? "bg-gradient-to-r from-slate-50 to-slate-100/30 dark:from-slate-850 dark:to-slate-800/30 border-slate-200 dark:border-slate-800" 
                              : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-850"
                          )}
                        >
                          <div className={cn("absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b", category.color)} />

                          <div className="flex items-center gap-3 pr-1.5">
                            {/* Category Icon */}
                            <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center text-white bg-gradient-to-br shadow-sm group-hover:scale-105 transition-transform duration-200 shrink-0", category.color)}>
                              <CatIcon size={16} />
                            </div>
                            
                            <div className="flex flex-col">
                              <span className="text-xs font-black text-slate-800 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                {category.label}
                              </span>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500">
                                  {totalInPeriod} محطات
                                </span>
                                <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                                <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400/90">
                                  اكتمل {completionPercentage}%
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Linear progress */}
                            <div className="w-12 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden hidden sm:block">
                              <div 
                                className={cn("h-full bg-gradient-to-r rounded-full transition-all duration-500", category.color)} 
                                style={{ width: `${completionPercentage}%` }}
                              />
                            </div>

                            {/* Expand Chevron */}
                            <div className={cn(
                              "w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center transition-all duration-200",
                              isExpanded ? "rotate-180 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400" : ""
                            )}>
                              <ChevronDown size={14} />
                            </div>
                          </div>
                        </button>

                        {/* Child Nodes (Tree Branches) */}
                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2, ease: "easeInOut" }}
                              className="overflow-hidden"
                            >
                              <div className="relative mr-6 pr-5 border-r border-dashed border-slate-200 dark:border-slate-800/80 my-2 space-y-2.5">
                                {filteredPeriodStories.map((story, idx) => {
                                  const isRead = readStoryIds.includes(story.id);
                                  const isBookmarked = bookmarkedIds.includes(story.id);
                                  
                                  return (
                                    <motion.div
                                      key={story.id}
                                      initial={{ opacity: 0, x: 10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: idx * 0.02 }}
                                      className="relative group/item"
                                    >
                                      {/* Connector Line */}
                                      <div className="absolute right-[-21px] top-[21px] w-5 border-t border-dashed border-slate-200 dark:border-slate-800/80 group-hover/item:border-emerald-400 dark:group-hover/item:border-emerald-600 transition-colors z-0" />
                                      
                                      {/* Indicator Bubble */}
                                      <div className={cn(
                                        "absolute right-[-26px] top-[15px] w-3 h-3 rounded-full flex items-center justify-center border z-10 transition-all duration-200",
                                        isRead 
                                          ? "bg-emerald-500 border-emerald-500 text-white shadow-emerald-500/10" 
                                          : isBookmarked
                                            ? "bg-amber-400 border-amber-400 text-slate-900 shadow-amber-400/10"
                                            : "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                                      )}>
                                        {isRead ? (
                                          <Check size={8} className="stroke-[3]" />
                                        ) : isBookmarked ? (
                                          <div className="w-1 h-1 rounded-full bg-slate-900" />
                                        ) : (
                                          <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700 group-hover/item:bg-emerald-500 transition-colors" />
                                        )}
                                      </div>

                                      {/* Event Card */}
                                      <button
                                        onClick={() => {
                                          setShowIndexModal(false);
                                          setSelectedPeriod('all');
                                          setActiveTab('timeline');
                                          setSearchQuery('');
                                          setTimeout(() => {
                                            const element = document.getElementById(story.id);
                                            if (element) {
                                              element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                            }
                                          }, 300);
                                        }}
                                        className={cn(
                                          "w-full text-right p-3 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col gap-1",
                                          "bg-white dark:bg-slate-900 border-slate-100/80 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-850",
                                          "group-hover/item:-translate-x-1 group-hover/item:border-emerald-500/20 dark:group-hover/item:border-emerald-500/20 group-hover/item:shadow-sm"
                                        )}
                                      >
                                        <div className="flex items-center justify-between gap-2 w-full">
                                          <span className="text-xs font-black text-slate-700 dark:text-slate-300 group-hover/item:text-emerald-600 dark:group-hover/item:text-emerald-400 transition-colors line-clamp-1">
                                            {story.title}
                                          </span>
                                          <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 shrink-0 bg-slate-50 dark:bg-slate-850 px-2 py-0.5 rounded-md">
                                            {story.year}
                                          </span>
                                        </div>
                                        
                                        {story.summary && (
                                          <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed font-bold line-clamp-1">
                                            {story.summary}
                                          </p>
                                        )}
                                      </button>
                                    </motion.div>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      , document.body)}

      {/* SEERAH SETTINGS & FONT CUSTOMIZATION MODAL */}
      {typeof document !== 'undefined' && createPortal(
      <AnimatePresence>
        {showSettingsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md" dir="rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[90vh] rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden text-right"
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-700 rounded-2xl flex items-center justify-center text-white shadow-md">
                    <Sliders size={20} />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-800 dark:text-white">
                      إعدادات العرض وتخصيص الخطوط
                    </h2>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">
                      تخصيص خطوط وثيمات ونصوص السيرة النبوية الشريفة
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="p-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-all cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1">

                {/* Live Preview Box */}
                <div className="space-y-2">
                  <span className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Eye size={16} className="text-emerald-600" />
                    <span>المعاينة الحية المباشرة:</span>
                  </span>

                  <div 
                    className={cn(
                      "p-5 rounded-3xl border transition-all duration-300 shadow-sm space-y-2",
                      SEERAH_THEMES.find(t => t.id === seerahSettings.theme)?.cardClass || 'bg-slate-50 border-slate-200',
                      SEERAH_THEMES.find(t => t.id === seerahSettings.theme)?.modalClass || ''
                    )}
                    style={{ fontFamily: getFontFamilyCss(seerahSettings.fontFamily) }}
                  >
                    <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-2">
                      <span className="font-bold text-xs">محطة: مولد ونشأة النبي ﷺ</span>
                      <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-black", SEERAH_THEMES.find(t => t.id === seerahSettings.theme)?.badgeClass)}>
                        {FONT_OPTIONS.find(f => f.id === seerahSettings.fontFamily)?.name}
                      </span>
                    </div>

                    <p className={cn(
                      "font-normal text-justify",
                      FONT_SIZES.find(s => s.id === seerahSettings.fontSize)?.sizeClass || 'text-base',
                      LINE_HEIGHTS.find(l => l.id === seerahSettings.lineHeight)?.heightClass || 'leading-relaxed'
                    )}>
                      ولد رسول الله ﷺ في عام الفيل ببطن مكة المكرمة، ونشأ يتيماً مباركاً تحت رعاية ربه، وأفاض الله عليه الحكمة والمكرمات، فكان ﷺ بالمؤمنين رؤوفاً رحيماً.
                    </p>

                    {seerahSettings.showIbnHisham && (
                      <div className="text-xs pt-1 opacity-90 border-t border-black/5 dark:border-white/5 font-serif">
                        📜 قال ابن إسحاق: ولما ولدته أمه آمنة بنت وهب أرسلت إلى جده عبد المطلب تبشره بفرحة المولد الشريف.
                      </div>
                    )}
                  </div>
                </div>

                {/* 1. Font Family Selector */}
                <div className="space-y-3">
                  <span className="text-xs font-black text-slate-800 dark:text-white flex items-center gap-1.5">
                    <Type size={16} className="text-emerald-600" />
                    <span>اختر خط قراءة السيرة:</span>
                  </span>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {FONT_OPTIONS.map(font => {
                      const isSelected = seerahSettings.fontFamily === font.id;
                      return (
                        <button
                          key={font.id}
                          onClick={() => setSeerahSettings(s => ({ ...s, fontFamily: font.id as SeerahSettings['fontFamily'] }))}
                          className={cn(
                            "p-3 rounded-2xl border text-right transition-all cursor-pointer flex flex-col justify-between space-y-2 relative overflow-hidden",
                            isSelected
                              ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/30"
                              : "bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-emerald-500/40"
                          )}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="text-xs font-black">{font.name}</span>
                            {isSelected && <Check size={14} className="text-emerald-600 dark:text-emerald-400" />}
                          </div>
                          <p 
                            className="text-sm font-semibold text-slate-600 dark:text-slate-300 line-clamp-1"
                            style={{ fontFamily: font.family }}
                          >
                            محمد رسول الله ﷺ
                          </p>
                          <span className="text-[9px] font-bold text-slate-400 block">{font.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Font Size Selector */}
                <div className="space-y-3">
                  <span className="text-xs font-black text-slate-800 dark:text-white flex items-center gap-1.5">
                    <Type size={16} className="text-emerald-600" />
                    <span>حجم خط القراءة:</span>
                  </span>

                  <div className="grid grid-cols-5 gap-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
                    {FONT_SIZES.map(fs => {
                      const isSelected = seerahSettings.fontSize === fs.id;
                      return (
                        <button
                          key={fs.id}
                          onClick={() => setSeerahSettings(s => ({ ...s, fontSize: fs.id as SeerahSettings['fontSize'] }))}
                          className={cn(
                            "py-2 rounded-xl text-xs font-black transition-all cursor-pointer text-center",
                            isSelected
                              ? "bg-emerald-600 text-white shadow-md"
                              : "text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                          )}
                        >
                          {fs.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Line Height / Spacing Selector */}
                <div className="space-y-3">
                  <span className="text-xs font-black text-slate-800 dark:text-white flex items-center gap-1.5">
                    <Type size={16} className="text-emerald-600" />
                    <span>مسافة التباعد بين الأسطر:</span>
                  </span>

                  <div className="grid grid-cols-3 gap-2">
                    {LINE_HEIGHTS.map(lh => {
                      const isSelected = seerahSettings.lineHeight === lh.id;
                      return (
                        <button
                          key={lh.id}
                          onClick={() => setSeerahSettings(s => ({ ...s, lineHeight: lh.id as SeerahSettings['lineHeight'] }))}
                          className={cn(
                            "py-2.5 px-3 rounded-2xl border text-xs font-black transition-all cursor-pointer text-center",
                            isSelected
                              ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-800 dark:text-emerald-300"
                              : "bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-emerald-500/40"
                          )}
                        >
                          {lh.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Theme Selector */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-800 dark:text-white flex items-center gap-1.5">
                      <Palette size={16} className="text-emerald-600" />
                      <span>ثيمات وألوان القراءة المخصصة:</span>
                    </span>

                    {/* Dropdown Selector */}
                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
                      <span className="text-[11px] font-bold text-slate-500">القائمة:</span>
                      <select
                        value={seerahSettings.theme}
                        onChange={(e) => setSeerahSettings(s => ({ ...s, theme: e.target.value as SeerahSettings['theme'] }))}
                        className="bg-transparent text-xs font-black text-emerald-700 dark:text-emerald-300 focus:outline-none cursor-pointer"
                      >
                        {SEERAH_THEMES.map(t => (
                          <option key={t.id} value={t.id} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
                            {t.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {SEERAH_THEMES.map(theme => {
                      const isSelected = seerahSettings.theme === theme.id;
                      return (
                        <button
                          key={theme.id}
                          onClick={() => setSeerahSettings(s => ({ ...s, theme: theme.id as SeerahSettings['theme'] }))}
                          className={cn(
                            "p-3 rounded-2xl border text-right transition-all cursor-pointer flex items-center justify-between gap-3",
                            isSelected
                              ? "border-emerald-500 ring-2 ring-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/30"
                              : "border-slate-200 dark:border-slate-700 hover:border-emerald-500/40 bg-white dark:bg-slate-800/60"
                          )}
                        >
                          <div className="flex items-center gap-2.5">
                            <span 
                              className="w-7 h-7 rounded-full border border-black/10 shadow-xs shrink-0 flex items-center justify-center text-white text-[10px] font-black"
                              style={{ backgroundColor: theme.previewColor }}
                            >
                              ✓
                            </span>
                            <div>
                              <span className="text-xs font-black text-slate-800 dark:text-white block">{theme.name}</span>
                              <span className="text-[10px] font-bold text-slate-400 block">{theme.desc}</span>
                            </div>
                          </div>
                          {isSelected && <CheckCircle size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 5. Display Toggles */}
                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-black text-slate-800 dark:text-white block">
                    مكونات القراءة المعروضة:
                  </span>

                  <div className="space-y-2">
                    {[
                      { key: 'showIbnHisham', label: 'اقتباسات سيرة ابن هشام والتراجم التاريخية' },
                      { key: 'showVerses', label: 'الآيات القرآنية والاستشهادات الشريفة' },
                      { key: 'showLessons', label: 'الدروس والعبر المستفادة من كل محطة' },
                      { key: 'showHistoricalDetails', label: 'التوثيقات التاريخية والأعلام والمواقع' },
                    ].map(toggle => {
                      const val = seerahSettings[toggle.key as keyof SeerahSettings] as boolean;
                      return (
                        <label 
                          key={toggle.key}
                          className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 cursor-pointer hover:bg-slate-100/80 transition-all"
                        >
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            {toggle.label}
                          </span>
                          <input 
                            type="checkbox"
                            checked={val}
                            onChange={(e) => setSeerahSettings(s => ({ ...s, [toggle.key]: e.target.checked }))}
                            className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                          />
                        </label>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-3">
                <button
                  onClick={() => setSeerahSettings(DEFAULT_SEERAH_SETTINGS)}
                  className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-rose-600 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw size={14} />
                  <span>الضبط الافتراضي</span>
                </button>

                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-lg shadow-emerald-600/20 transition-all cursor-pointer flex items-center gap-2"
                >
                  <Check size={16} />
                  <span>حفظ وتطبيق</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      , document.body)}
    </div>
  );
};

