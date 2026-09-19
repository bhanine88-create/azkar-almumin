import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Compass,
  Scroll,
  Share2,
  Search,
  X,
  Bookmark,
  BookmarkCheck,
  Headphones,
  Radio,
  Copy,
  Check,
  BookOpen,
  Quote,
  ChevronLeft,
  ChevronRight,
  Eye,
  Type,
  Maximize2,
  SlidersHorizontal,
  Download,
  Flame,
  ArrowRight,
  CheckCircle2,
  Heart,
  BookMarked,
  ExternalLink,
  Layers,
  FileText,
  Library,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { BackButton } from './ui/BackButton';
import {
  AQEEDAH_CATEGORIES,
  AQEEDAH_ARTICLES,
  SALAF_QUOTES,
  QUICK_CARDS,
  AQEEDAH_BOOKS_LIBRARY,
  AqeedahArticle,
  AqeedahSalafQuote,
  AqeedahQuickCard,
  AqeedahBookSummary
} from '../data/aqeedahData';
import { UsoolSittahSection } from './UsoolSittahSection';
import { cn, shareContent } from '../lib/utils';
import { useAppContext } from '../AppContext';
import { useTranslation } from '../i18n';
import { safeLocalStorageGetItem, safeLocalStorageSetItem } from '../utils/storage';
import { toPng } from 'html-to-image';

type ActiveCategory =
  | 'all'
  | 'usool_thalatha'
  | 'qawaid_arbaa'
  | 'kitab_tawheed'
  | 'kashf_shubuhat'
  | 'usool_sittah'
  | 'aqeedah_wasitiyyah'
  | 'tahawiyyah_lumaa'
  | 'heart_purification'
  | 'books_library'
  | 'pillars'
  | 'nullifiers'
  | 'names_attributes'
  | 'contemporary_issues'
  | 'salaf_quotes'
  | 'quick_cards'
  | 'favorites';

export const AqeedahHub: React.FC = () => {
  const { settings } = useAppContext();
  const { t, isRtl } = useTranslation(settings.appLanguage);

  // States
  const [activeTab, setActiveTab] = useState<ActiveCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<AqeedahArticle | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [selectedBookCategory, setSelectedBookCategory] = useState<'all' | 'tawheed' | 'major_aqeedah' | 'heart_purification' | 'complementary_sciences'>('all');
  const [expandedBookId, setExpandedBookId] = useState<string | null>(null);
  const [readerFontSize, setReaderFontSize] = useState<'sm' | 'md' | 'lg' | 'xl'>(() => {
    return (safeLocalStorageGetItem('aqeedah_font_size') as any) || 'md';
  });
  const [readerFontFamily, setReaderFontFamily] = useState<'amiri' | 'naskh' | 'tajawal' | 'cairo'>(() => {
    return (safeLocalStorageGetItem('aqeedah_font_family') as any) || 'amiri';
  });

  // Favorites stored in localStorage
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = safeLocalStorageGetItem('aqeedah_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const cardRefMap = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [downloadingCardId, setDownloadingCardId] = useState<string | null>(null);

  // Show toast utility
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  }, []);

  // Toggle favorite
  const toggleFavorite = useCallback((id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      safeLocalStorageSetItem('aqeedah_favorites', JSON.stringify(next));
      return next;
    });
    showToast(favorites.includes(id) ? 'تمت الإزالة من المفضلة' : 'تمت الإضافة إلى المفضلة');
  }, [favorites, showToast]);

  // Audio information helper (external listen and download links)
  const getArticleAudioInfo = useCallback((article: AqeedahArticle) => {
    if (article.audioListenUrl) {
      return {
        listenUrl: article.audioListenUrl,
        downloadUrl: article.audioDownloadUrl || 'https://binbaz.org.sa/audios',
        label: article.audioSourceLabel || 'شرح صوتي مسموع لكبار أهل العلم'
      };
    }
    switch (article.category) {
      case 'usool_sittah':
        return {
          listenUrl: 'https://binbaz.org.sa/audios',
          downloadUrl: 'https://ar.islamway.net/collection/4252/%D8%B4%D8%B1%D8%AD-%D8%A7%D9%84%D8%A3%D8%B5%D9%88%D9%84-%D8%A7%D9%84%D8%B3%D8%AA%D8%A9-%D8%A7%D9%84%D8%B4%D9%8A%D8%AE-%D8%A7%D8%A8%D9%86-%D8%A8%D8%A7%D8%B2',
          label: 'شرح الأصول الستة - سماحة الشيخ عبد العزيز بن باز رحمه الله'
        };
      case 'usool_thalatha':
        return {
          listenUrl: 'https://ar.islamway.net/collection/274/%D8%B4%D8%B1%D8%AD-%D8%A7%D9%84%D8%A3%D8%B5%D9%88%D9%84-%D8%A7%D9%84%D8%AB%D9%84%D8%A7%D8%AB%D8%A9-%D8%A7%D9%84%D8%B4%D9%8A%D8%AE-%D8%A7%D8%A8%D9%86-%D8%A8%D8%A7%D8%B2',
          downloadUrl: 'https://binbaz.org.sa/audios',
          label: 'شرح الأصول الثلاثة وأدلتها - سماحة الشيخ ابن باز رحمه الله'
        };
      case 'qawaid_arbaa':
        return {
          listenUrl: 'https://ar.islamway.net/collection/343/%D8%B4%D8%B1%D8%AD-%D8%A7%D9%84%D9%82%D9%88%D8%A7%D8%B9%D8%AF-%D8%A7%D9%84%D8%A3%D8%B1%D8%A8%D8%B9-%D8%A7%D9%84%D8%B4%D9%8A%D8%AE-%D8%A7%D8%A8%D9%86-%D8%A8%D8%A7%D8%B2',
          downloadUrl: 'https://binbaz.org.sa/audios',
          label: 'شرح القواعد الأربع في التوحيد - سماحة الشيخ ابن باز رحمه الله'
        };
      case 'kitab_tawheed':
        return {
          listenUrl: 'https://ar.islamway.net/collection/275/%D8%B4%D8%B1%D8%AD-%D9%83%D8%AA%D8%A7%D8%A8-%D8%A7%D9%84%D8%AA%D9%88%D8%AD%D9%8A%D8%AF-%D8%A7%D9%84%D8%B4%D9%8A%D8%AE-%D8%A7%D8%A8%D9%86-%D8%A8%D8%A7%D8%B2',
          downloadUrl: 'https://binbaz.org.sa/audios',
          label: 'شرح كتاب التوحيد - سماحة الشيخ عبد العزيز بن باز رحمه الله'
        };
      case 'aqeedah_wasitiyyah':
        return {
          listenUrl: 'https://ar.islamway.net/collection/276/%D8%B4%D8%B1%D8%AD-%D8%A7%D9%84%D8%B9%D9%82%D9%8A%D8%AF%D8%A9-%D8%A7%D9%84%D9%88%D8%A7%D8%B3%D8%B7%D9%8A%D8%A9-%D8%A7%D9%84%D8%B4%D9%8A%D8%AE-%D8%A7%D8%A8%D9%86-%D8%A8%D8%A7%D8%B2',
          downloadUrl: 'https://binbaz.org.sa/audios',
          label: 'شرح العقيدة الواسطية - سماحة الشيخ ابن باز والشيخ ابن عثيمين'
        };
      case 'tahawiyyah_lumaa':
        return {
          listenUrl: 'https://ar.islamway.net/collection/344/%D8%B4%D8%B1%D8%AD-%D8%A7%D9%84%D8%B9%D9%82%D9%8A%D8%AF%D8%A9-%D8%A7%D9%84%D8%B7%D8%AD%D8%A7%D9%88%D9%8A%D8%A9-%D8%A7%D9%84%D8%B4%D9%8A%D8%AE-%D8%B5%D8%A7%D9%84%D8%AD-%D8%A7%D9%84%D9%81%D9%88%D8%B2%D8%A7%D9%86',
          downloadUrl: 'https://ar.islamway.net/collection/344',
          label: 'شروح الطحاوية ولمعة الاعتقاد - الشيخ الفوزان والشيخ ابن عثيمين'
        };
      case 'heart_purification':
        return {
          listenUrl: 'https://ar.islamway.net/collection/14022/%D8%B4%D8%B1%D8%AD-%D9%83%D8%AA%D8%A7%D8%A8-%D8%A7%D9%84%D8%AF%D8%A7%D8%A1-%D9%88%D8%A7%D9%84%D8%AF%D9%88%D8%A7%D8%A1-%D8%A7%D9%84%D8%B4%D9%8A%D8%AE-%D8%B9%D8%A8%D8%AF-%D8%A7%D9%84%D8%B1%D8%B2%D8%A7%D9%82-%D8%A7%D9%84%D8%A8%D8%AF%D8%B1',
          downloadUrl: 'https://ar.islamway.net/collection/14022',
          label: 'أعمال القلوب والداء والدواء - الشيخ عبد الرزاق البدر'
        };
      case 'usool_sittah':
        return {
          listenUrl: 'https://ar.islamway.net/collection/4252/%D8%B4%D8%B1%D8%AD-%D8%A7%D9%84%D8%A3%D8%B5%D9%88%D9%84-%D8%A7%D9%84%D8%B3%D8%AA%D8%A9-%D8%A7%D9%84%D8%B4%D9%8A%D8%AE-%D8%A7%D8%A8%D9%86-%D8%A8%D8%A7%D8%B2',
          downloadUrl: 'https://binbaz.org.sa/audios',
          label: 'شرح الأصول الستة - سماحة الشيخ عبد العزيز بن باز رحمه الله'
        };
      case 'nullifiers':
        return {
          listenUrl: 'https://ar.islamway.net/collection/341/%D8%B4%D8%B1%D8%AD-%D9%86%D9%88%D8%A7%D9%82%D8%B6-%D8%A7%D9%84%D8%A5%D8%B3%D9%84%D8%A7%D9%85-%D8%A7%D9%84%D8%B4%D9%8A%D8%AE-%D8%A7%D8%A8%D9%86-%D8%A8%D8%A7%D8%B2',
          downloadUrl: 'https://binbaz.org.sa/audios',
          label: 'شرح نواقض الإسلام - سماحة الشيخ عبد العزيز بن باز رحمه الله'
        };
      case 'names_attributes':
        return {
          listenUrl: 'https://ar.islamway.net/collection/279/%D8%A7%D9%84%D9%82%D9%88%D8%A7%D8%B9%D8%AF-%D8%A7%D9%84%D9%85%D8%AB%D9%84%D9%89-%D9%81%D9%8A-%D8%B5%D9%81%D8%A7%D8%AA-%D8%A7%D9%84%D9%84%D9%87-%D9%88%D8%A3%D8%B3%D9%85%D8%A7%D8%A6%D9%87-%D8%A7%D9%84%D8%AD%D8%B3%D9%86%D9%89-%D8%A7%D9%84%D8%B4%D9%8A%D8%AE-%D8%A7%D8%A8%D9%86-%D8%B9%D8%AB%D9%8A%D9%85%D9%8A%D9%86',
          downloadUrl: 'https://ibnothaimeen.net',
          label: 'القواعد المثلى في أسماء الله وصفاته - فضيلة الشيخ ابن عثيمين'
        };
      default:
        return {
          listenUrl: 'https://ar.islamway.net/lessons/category/53/%D8%A7%D9%84%D8%B9%D9%82%D9%8A%D8%AF%D8%A9-%D8%A7%D9%84%D8%A5%D8%B3%D9%84%D8%A7%D9%85%D9%8A%D8%A9',
          downloadUrl: 'https://ar.islamway.net',
          label: 'شروح ودروس العقيدة والتوحيد - كبار العلماء (طريق الإسلام)'
        };
    }
  }, []);

  // Close modal
  const handleCloseArticle = useCallback(() => {
    setSelectedArticle(null);
  }, []);

  // Lock body scroll and listen for Escape key when article modal is open
  useEffect(() => {
    if (selectedArticle) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          handleCloseArticle();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [selectedArticle, handleCloseArticle]);

  // Filtered articles
  const filteredArticles = useMemo(() => {
    let list = AQEEDAH_ARTICLES;

    if (activeTab === 'favorites') {
      list = list.filter((item) => favorites.includes(item.id));
    } else if (activeTab === 'books_library') {
      list = [];
    } else if (activeTab !== 'all' && activeTab !== 'salaf_quotes' && activeTab !== 'quick_cards') {
      list = list.filter((item) => item.category === activeTab);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (art) =>
          art.title.toLowerCase().includes(q) ||
          art.subtitle.toLowerCase().includes(q) ||
          art.summary.toLowerCase().includes(q) ||
          art.tags.some((tag) => tag.toLowerCase().includes(q)) ||
          art.detailedSections.some((sec) => sec.heading.toLowerCase().includes(q) || sec.content.some((c) => c.toLowerCase().includes(q)))
      );
    }

    return list;
  }, [activeTab, searchQuery, favorites]);

  // Filtered books library
  const filteredBooks = useMemo(() => {
    let list = AQEEDAH_BOOKS_LIBRARY;
    if (selectedBookCategory !== 'all') {
      list = list.filter((b) => b.category === selectedBookCategory);
    }
    if (activeTab === 'favorites') {
      list = list.filter((b) => favorites.includes(b.id));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.summary.toLowerCase().includes(q) ||
          b.importance.toLowerCase().includes(q) ||
          b.keyTopics.some((t) => t.toLowerCase().includes(q)) ||
          b.goldenGems.some((g) => g.toLowerCase().includes(q)) ||
          b.chapterHighlights.some((ch) => ch.title.toLowerCase().includes(q) || ch.benefit.toLowerCase().includes(q))
      );
    }
    return list;
  }, [selectedBookCategory, activeTab, searchQuery, favorites]);

  // Filtered quotes
  const filteredQuotes = useMemo(() => {
    let list = SALAF_QUOTES;
    if (activeTab === 'favorites') {
      list = list.filter((q) => favorites.includes(q.id));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (quote) =>
          quote.scholar.toLowerCase().includes(q) ||
          quote.quote.toLowerCase().includes(q) ||
          quote.theme.toLowerCase().includes(q) ||
          quote.source.toLowerCase().includes(q)
      );
    }
    return list;
  }, [activeTab, searchQuery, favorites]);

  // Filtered quick cards
  const filteredQuickCards = useMemo(() => {
    let list = QUICK_CARDS;
    if (activeTab === 'favorites') {
      list = list.filter((c) => favorites.includes(c.id));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (card) =>
          card.title.toLowerCase().includes(q) ||
          card.text.toLowerCase().includes(q) ||
          card.authorOrSource.toLowerCase().includes(q) ||
          card.badge.toLowerCase().includes(q)
      );
    }
    return list;
  }, [activeTab, searchQuery, favorites]);

  // Share card image
  const handleShareCardImage = async (card: AqeedahQuickCard) => {
    const cardEl = cardRefMap.current[card.id];
    if (!cardEl) return;
    try {
      setDownloadingCardId(card.id);
      const dataUrl = await toPng(cardEl, {
        cacheBust: true,
        quality: 0.95,
        pixelRatio: 2
      });

      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], `aqeedah-benefit-${card.id}.png`, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: card.title,
          text: `${card.title} - ${card.authorOrSource}\n\n${card.text}`,
          files: [file]
        });
        showToast('تمت مشاركة البطاقة بنجاح');
      } else {
        // Fallback to image download
        const link = document.createElement('a');
        link.download = `aqeedah-${card.id}.png`;
        link.href = dataUrl;
        link.click();
        showToast('تم تحميل صورة البطاقة');
      }
    } catch {
      // Fallback to text share
      await shareContent(card.title, `﴿ ${card.title} ﴾\n\n${card.text}\n\n— المصدر: ${card.authorOrSource}`);
    } finally {
      setDownloadingCardId(null);
    }
  };

  // Font size classes
  const getFontSizeClass = (size: 'sm' | 'md' | 'lg' | 'xl') => {
    switch (size) {
      case 'sm':
        return 'text-base leading-relaxed';
      case 'lg':
        return 'text-xl leading-loose';
      case 'xl':
        return 'text-2xl leading-loose';
      case 'md':
      default:
        return 'text-lg leading-relaxed';
    }
  };

  const getFontFamilyClass = (family: 'amiri' | 'naskh' | 'tajawal' | 'cairo') => {
    switch (family) {
      case 'naskh':
        return 'font-naskh';
      case 'tajawal':
        return 'font-tajawal';
      case 'cairo':
        return 'font-cairo';
      case 'amiri':
      default:
        return 'font-amiri';
    }
  };

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="min-h-screen bg-slate-50 dark:bg-[#07130e] text-slate-900 dark:text-slate-100 pb-24 transition-colors duration-300"
    >
      {/* Toast Notification */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="fixed top-5 left-1/2 -translate-x-1/2 z-[100000] bg-[#0d4f37] text-white px-5 py-2.5 rounded-full shadow-2xl border border-[#feb10b]/50 flex items-center gap-2.5 text-sm font-bold backdrop-blur-md pointer-events-none"
            >
              <Check className="w-4 h-4 text-[#feb10b]" />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Top Header with Integrated Sticky Category Tabs */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#042418]/95 backdrop-blur-xl border-b border-emerald-900/10 dark:border-emerald-500/20 pt-3 pb-2.5 px-4 shadow-xs transition-all">
        <div className="max-w-6xl mx-auto flex flex-col gap-2.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <BackButton />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    <ShieldCheck className="w-6 h-6 text-[#feb10b]" />
                    <span>العقيدة الصحيحة</span>
                  </h1>
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#feb10b]/15 text-[#feb10b] border border-[#feb10b]/30">
                    منهج أهل السنة والجماعة
                  </span>
                </div>
                <p className="text-xs text-emerald-800 dark:text-emerald-300/80 font-medium">
                  الأساس المتين: أركان الإيمان، حماية التوحيد، وفقه الأسماء والصفات
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('favorites')}
                className={cn(
                  'relative p-2 rounded-xl border transition-all duration-200 flex items-center justify-center',
                  activeTab === 'favorites'
                    ? 'bg-[#feb10b] text-[#042418] border-[#feb10b] shadow-md'
                    : 'bg-white/80 dark:bg-emerald-950/40 text-slate-700 dark:text-emerald-300 border-emerald-900/10 dark:border-emerald-500/20 hover:border-[#feb10b]/50'
                )}
                title="المفضلة"
              >
                <Bookmark className="w-5 h-5" />
                {favorites.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[#feb10b] text-[#042418] text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                    {favorites.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Sticky Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0 pt-0.5">
            <button
              onClick={() => setActiveTab('all')}
              className={cn(
                'px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 shrink-0 border',
                activeTab === 'all'
                  ? 'bg-[#0d4f37] dark:bg-[#feb10b] text-white dark:text-[#042418] border-[#0d4f37] dark:border-[#feb10b] shadow-sm'
                  : 'bg-slate-100/90 dark:bg-[#0a2318] text-slate-700 dark:text-emerald-200/80 border-slate-200/80 dark:border-emerald-500/20 hover:border-[#feb10b]/50'
              )}
            >
              الكل
            </button>

            {AQEEDAH_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id as ActiveCategory)}
                className={cn(
                  'px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 shrink-0 border flex items-center gap-1.5',
                  activeTab === cat.id
                    ? 'bg-[#0d4f37] dark:bg-[#feb10b] text-white dark:text-[#042418] border-[#0d4f37] dark:border-[#feb10b] shadow-sm'
                    : 'bg-slate-100/90 dark:bg-[#0a2318] text-slate-700 dark:text-emerald-200/80 border-slate-200/80 dark:border-emerald-500/20 hover:border-[#feb10b]/50'
                )}
              >
                <span>{cat.shortTitle}</span>
              </button>
            ))}

            <button
              onClick={() => setActiveTab('favorites')}
              className={cn(
                'px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 shrink-0 border flex items-center gap-1.5',
                activeTab === 'favorites'
                  ? 'bg-[#feb10b] text-[#042418] border-[#feb10b] shadow-sm'
                  : 'bg-slate-100/90 dark:bg-[#0a2318] text-slate-700 dark:text-emerald-200/80 border-slate-200/80 dark:border-emerald-500/20 hover:border-[#feb10b]/50'
              )}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>المفضلة ({favorites.length})</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-6xl mx-auto px-4 pt-4">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-3xl p-5 sm:p-7 mb-6 border border-[#145d41]/70 dark:border-[#10b981]/30 bg-gradient-to-br from-[#0d4f37] via-[#083a28] to-[#042418] text-white shadow-xl shadow-emerald-950/20">
          <div className="absolute inset-0 opacity-10 bg-[url('/images/arabesque.png')] pointer-events-none" />
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#feb10b]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-[#feb10b]/20 text-[#feb10b] border border-[#feb10b]/40 mb-2.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>أصل الأصول وقاعدة كل عمل صالح</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black mb-2 text-white">
                العقيدة الصحيحة: أركان الإيمان وتحقيق التوحيد
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                العقيدة هي الأساس الذي تبنى عليه صحة صلاتك وصيامك وعباداتك. تعرّف على أركان الإيمان الستة، كيف تحمي توحيدك من الشرك والبدع، وتتعبد بأسمائه الحسنى، وتثبت في زمن الفتن.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 self-stretch md:self-auto justify-end">
              <button
                onClick={() => setActiveTab('usool_sittah')}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-black text-sm border border-white/25 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm"
              >
                <Scroll className="w-4 h-4 text-[#feb10b]" />
                <span>الأصول الستة لابن باز</span>
              </button>
              <button
                onClick={() => {
                  const firstPillar = AQEEDAH_ARTICLES[0];
                  if (firstPillar) setSelectedArticle(firstPillar);
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#feb10b] hover:bg-[#fec84b] text-[#042418] font-black text-sm shadow-lg shadow-[#feb10b]/20 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <BookOpen className="w-4 h-4" />
                <span>ابدأ التعلم الآن</span>
              </button>
            </div>
          </div>
        </section>

        {/* Search Bar */}
        <div className="relative mb-5">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-emerald-400/60" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث في العقيدة (مثال: مراتب القدر، التوكل، الشرك، أسماء الله، الفتن)..."
            className="w-full pr-10 pl-10 py-3 rounded-2xl bg-white dark:bg-[#0b281c] border border-slate-200 dark:border-emerald-500/20 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-emerald-300/40 text-sm focus:outline-none focus:ring-2 focus:ring-[#feb10b] shadow-sm transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Section 1: Detailed Articles Grid */}
        {(activeTab !== 'salaf_quotes' && activeTab !== 'quick_cards' && activeTab !== 'books_library' && activeTab !== 'usool_sittah') && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#feb10b]" />
                  <span>
                    {activeTab === 'favorites'
                      ? 'المقالات المحفوظة في المفضلة'
                      : activeTab === 'all'
                      ? 'مقالات ودراسات العقيدة الميسرة'
                      : AQEEDAH_CATEGORIES.find((c) => c.id === activeTab)?.title}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-emerald-300/70 mt-0.5">
                  اضغط على أي بطاقة لفتح الشرح المفصل، الأدلة، والوقفات القلبية
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30">
                {filteredArticles.length} موضوع
              </span>
            </div>

            {filteredArticles.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-[#0b281c] rounded-2xl border border-dashed border-slate-300 dark:border-emerald-500/20 text-slate-500 dark:text-emerald-200/60">
                {activeTab === 'favorites' ? 'لم تقم بحفظ أي مقالة في المفضلة بعد.' : 'لا توجد نتائج مطابقة لبحثك.'}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredArticles.map((article) => {
                  const isFav = favorites.includes(article.id);
                  return (
                    <motion.div
                      key={article.id}
                      whileHover={{ y: -4, scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setSelectedArticle(article)}
                      className="group cursor-pointer rounded-2xl p-4 bg-white dark:bg-gradient-to-br dark:from-[#0d4f37] dark:via-[#083a28] dark:to-[#042418] border border-slate-200 dark:border-[#145d41]/70 hover:border-[#feb10b] dark:hover:border-[#feb10b]/80 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-[#feb10b]/5 rounded-full blur-xl group-hover:bg-[#feb10b]/15 transition-all" />

                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2.5">
                          <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-[#feb10b]/15 text-emerald-800 dark:text-[#feb10b] border border-emerald-200 dark:border-[#feb10b]/30">
                            {article.subCategoryTitle || 'العقيدة'}
                          </span>
                          <div className="flex items-center gap-1.5">
                            {(() => {
                              const audioInfo = getArticleAudioInfo(article);
                              return (
                                <a
                                  href={audioInfo.listenUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-[#feb10b] dark:text-emerald-300/60 dark:hover:text-[#feb10b] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                                  title={`استماع خارجي: ${audioInfo.label}`}
                                >
                                  <Headphones className="w-3.5 h-3.5 text-[#feb10b]" />
                                </a>
                              );
                            })()}
                            <span className="text-[11px] text-slate-400 dark:text-emerald-300/60 font-medium flex items-center gap-1">
                              <BookOpen className="w-3 h-3 text-emerald-500" />
                              <span>{article.readTime}</span>
                            </span>
                            <button
                              onClick={(e) => toggleFavorite(article.id, e)}
                              className="p-1.5 text-slate-400 hover:text-rose-500 dark:text-emerald-300/50 dark:hover:text-[#feb10b] transition-colors"
                              title={isFav ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
                            >
                              <Bookmark className={cn('w-4 h-4', isFav && 'fill-rose-500 text-rose-500 dark:fill-[#feb10b] dark:text-[#feb10b]')} />
                            </button>
                          </div>
                        </div>

                        <h4 className="text-base font-black text-slate-900 dark:text-white mb-1.5 group-hover:text-[#0d4f37] dark:group-hover:text-[#feb10b] transition-colors line-clamp-1">
                          {article.title}
                        </h4>

                        <p className="text-xs text-slate-600 dark:text-emerald-100/80 leading-relaxed mb-3 line-clamp-2">
                          {article.subtitle}
                        </p>

                        {article.quranVerse && (
                          <div className="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-black/30 border border-emerald-200/60 dark:border-emerald-500/20 mb-3 text-right">
                            <p className="font-amiri text-xs text-emerald-950 dark:text-emerald-200 font-bold leading-relaxed line-clamp-1">
                              ﴿ {article.quranVerse.arabic} ﴾
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-xs">
                        <span className="text-[#0d4f37] dark:text-[#feb10b] font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          <span>اقرأ بالتفصيل</span>
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </span>
                        <span className="text-[11px] text-slate-400 dark:text-emerald-300/50">
                          {article.keyTakeaways.length} محاور رئيسية
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* Section: Usool Sittah (الأصول الستة للشيخ ابن باز مع الشرح الميسر) */}
        {(activeTab === 'usool_sittah' || activeTab === 'all') && (
          <section className="mb-12">
            {activeTab === 'all' && (
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Scroll className="w-5 h-5 text-[#feb10b]" />
                    <span>الأصول الستة للشيخ ابن باز (مع الشرح الميسر)</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-emerald-300/70 mt-0.5">
                    بطاقات تفاعلية مميزة تجمع بين المتن الأصلي والشرح الميسر والأدلة
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('usool_sittah')}
                  className="text-xs font-bold text-[#0d4f37] dark:text-[#feb10b] flex items-center gap-1 hover:underline shrink-0"
                >
                  <span>عرض التبويب المخصص</span>
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <UsoolSittahSection
              onSelectArticle={(article) => setSelectedArticle(article)}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
              showToast={(msg) => setToastMessage(msg)}
            />
          </section>
        )}

        {/* Section: Books Library & Summaries (مكتبة وخلاصات أمهات كتب العقيدة والتزكية) */}
        {(activeTab === 'all' || activeTab === 'books_library' || activeTab === 'favorites') && (
          <section className="mb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Library className="w-5 h-5 text-[#feb10b]" />
                  <span>مكتبة وخلاصات أمهات كتب العقيدة والتزكية</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-emerald-300/70 mt-1">
                  خلاصات مركزة، بطاقات فوائد، ودليل التصفح لأهم كتب التوحيد وشروح العقيدة وأعمال القلوب
                </p>
              </div>
              <span className="self-start sm:self-auto text-xs font-bold px-3 py-1.5 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-900 dark:text-purple-300 border border-purple-300 dark:border-purple-500/30">
                {filteredBooks.length} مؤلّف معتمد
              </span>
            </div>

            {/* Sub-Category Filter Chips for Books */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-5 no-scrollbar">
              {[
                { id: 'all', label: 'جميع الكتب' },
                { id: 'tawheed', label: 'متون التوحيد الأساسية' },
                { id: 'major_aqeedah', label: 'شروح العقيدة الكبرى' },
                { id: 'heart_purification', label: 'أعمال القلوب والتزكية' },
                { id: 'complementary_sciences', label: 'العلوم الشرعية المعينة' }
              ].map((subCat) => (
                <button
                  key={subCat.id}
                  onClick={() => setSelectedBookCategory(subCat.id as any)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all border shrink-0',
                    selectedBookCategory === subCat.id
                      ? 'bg-purple-800 dark:bg-purple-500 text-white dark:text-slate-950 border-purple-800 dark:border-purple-400 shadow-sm'
                      : 'bg-white dark:bg-[#072418] text-slate-600 dark:text-emerald-200/80 border-slate-200 dark:border-emerald-500/20 hover:border-purple-400'
                  )}
                >
                  {subCat.label}
                </button>
              ))}
            </div>

            {filteredBooks.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-[#0b281c] rounded-2xl border border-dashed border-slate-300 dark:border-emerald-500/20 text-slate-500 dark:text-emerald-200/60">
                لا توجد كتب مطابقة لبحثك في هذا القسم.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredBooks.map((book) => {
                  const isExpanded = expandedBookId === book.id;
                  const isFav = favorites.includes(book.id);

                  return (
                    <div
                      key={book.id}
                      className="rounded-2xl p-5 bg-white dark:bg-gradient-to-br dark:from-[#0d4f37] dark:via-[#083a28] dark:to-[#042418] border border-slate-200 dark:border-emerald-500/25 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                    >
                      <div>
                        {/* Header: badge + actions */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-900 dark:text-purple-300 border border-purple-200 dark:border-purple-700/40">
                            {book.categoryLabel}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => toggleFavorite(book.id)}
                              className="p-1.5 text-slate-400 hover:text-[#feb10b] dark:text-emerald-400/50 dark:hover:text-[#feb10b] transition-colors"
                              title={isFav ? 'إزالة من المفضلة' : 'حفظ في المفضلة'}
                            >
                              <Bookmark className={cn('w-4 h-4', isFav && 'fill-[#feb10b] text-[#feb10b]')} />
                            </button>
                            {book.audioListenUrl && (
                              <a
                                href={book.audioListenUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-[#feb10b] dark:text-emerald-400/50 dark:hover:text-[#feb10b] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                                title={`استماع خارجي: ${book.audioSourceLabel || book.title}`}
                              >
                                <Headphones className="w-4 h-4 text-[#feb10b]" />
                              </a>
                            )}
                            {book.audioDownloadUrl && (
                              <a
                                href={book.audioDownloadUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-[#feb10b] dark:text-emerald-400/50 dark:hover:text-[#feb10b] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                                title="تحميل الدرس (خارجي)"
                              >
                                <Download className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                              </a>
                            )}
                            <button
                              onClick={async () => {
                                await shareContent(
                                  book.title,
                                  `خلاصة كتاب: ${book.title}\nالمؤلف: ${book.author}\n\n${book.summary}\n\n— أهم الدرر:\n${book.goldenGems.map(g => '• ' + g).join('\n')}`
                                );
                                showToast('تم نسخ ومشاركة خلاصة الكتاب');
                              }}
                              className="p-1.5 text-slate-400 hover:text-[#feb10b] dark:text-emerald-400/50 dark:hover:text-[#feb10b] transition-colors"
                              title="مشاركة"
                            >
                              <Share2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Title & Author */}
                        <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-[#feb10b] mb-1">
                          {book.title}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-emerald-200/90 font-bold mb-2">
                          {book.author} <span className="text-[10px] text-slate-400 dark:text-emerald-300/60 font-normal">({book.era})</span>
                        </p>

                        {/* Importance Pill */}
                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-100 dark:border-white/5 mb-3 text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                          <span className="font-black text-[#0d4f37] dark:text-[#feb10b] ml-1">الأهمية والمنزلة:</span>
                          {book.importance}
                        </div>

                        {/* Key Topics Badges */}
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {book.keyTopics.slice(0, isExpanded ? book.keyTopics.length : 3).map((topic, i) => (
                            <span
                              key={i}
                              className="text-[10.5px] px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20"
                            >
                              {topic}
                            </span>
                          ))}
                          {!isExpanded && book.keyTopics.length > 3 && (
                            <span className="text-[10px] text-slate-400 dark:text-emerald-300/50 self-center">
                              +{book.keyTopics.length - 3} محاور أخرى
                            </span>
                          )}
                        </div>

                        {/* Summary / Expandable Content */}
                        <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-100 leading-relaxed font-tajawal mb-3">
                          <p className={cn(!isExpanded && 'line-clamp-2')}>
                            {book.summary}
                          </p>
                        </div>

                        {/* Expanded Details */}
                        {isExpanded && (
                          <div className="space-y-4 pt-3 border-t border-slate-100 dark:border-white/10 mt-3">
                            {/* Chapter Highlights */}
                            {book.chapterHighlights && book.chapterHighlights.length > 0 && (
                              <div>
                                <h5 className="text-xs font-black text-[#0d4f37] dark:text-[#feb10b] mb-2 flex items-center gap-1.5">
                                  <Layers className="w-3.5 h-3.5" />
                                  <span>أبرز فوائد أبواب الكتاب:</span>
                                </h5>
                                <div className="space-y-1.5">
                                  {book.chapterHighlights.map((ch, idx) => (
                                    <div key={idx} className="p-2 rounded-lg bg-slate-50 dark:bg-black/25 text-xs text-slate-700 dark:text-slate-200">
                                      <span className="font-bold text-slate-900 dark:text-white ml-1">• {ch.title}:</span>
                                      <span>{ch.benefit}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Golden Gems */}
                            <div>
                              <h5 className="text-xs font-black text-amber-700 dark:text-amber-400 mb-2 flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>درر وفوائد ذهبية مستخلصة:</span>
                              </h5>
                              <div className="space-y-1.5">
                                {book.goldenGems.map((gem, idx) => (
                                  <div key={idx} className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-500/20 text-xs font-amiri font-bold text-slate-800 dark:text-amber-100 leading-relaxed">
                                    «{gem}»
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Actionable Step */}
                            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-500/30 text-xs text-emerald-900 dark:text-emerald-100 flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-black ml-1">تطبيق عملي من الكتاب:</span>
                                <span>{book.actionableStep}</span>
                              </div>
                            </div>

                            {/* External Audio Bar */}
                            {(book.audioListenUrl || book.audioDownloadUrl) && (
                              <div className="p-3.5 rounded-xl bg-amber-500/10 dark:bg-amber-950/30 border border-amber-500/30 flex flex-wrap items-center justify-between gap-3 text-xs">
                                <div className="flex items-center gap-2 text-slate-800 dark:text-amber-200">
                                  <Headphones className="w-4 h-4 text-[#feb10b] shrink-0" />
                                  <div>
                                    <span className="font-bold block">{book.audioSourceLabel || 'تسجيلات وشروح صوتية موثوقة لكبار العلماء'}</span>
                                    <span className="text-[10px] text-slate-500 dark:text-amber-300/70">فتح بروابط خارجية مباشرة بدون استهلاك لموارد التطبيق</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {book.audioListenUrl && (
                                    <a
                                      href={book.audioListenUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0d4f37] hover:bg-[#083a28] text-white font-bold text-xs shadow transition-colors"
                                      title="فتح رابط الاستماع الخارجي"
                                    >
                                      <Headphones className="w-3.5 h-3.5 text-[#feb10b]" />
                                      <span>استماع خارجي</span>
                                      <ExternalLink className="w-3 h-3 opacity-70" />
                                    </a>
                                  )}
                                  {book.audioDownloadUrl && (
                                    <a
                                      href={book.audioDownloadUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-emerald-950 border border-slate-300 dark:border-emerald-500/30 text-slate-800 dark:text-emerald-200 font-bold text-xs hover:border-[#feb10b] transition-colors"
                                      title="فتح رابط تحميل الدرس الخارجي"
                                    >
                                      <Download className="w-3.5 h-3.5 text-[#feb10b]" />
                                      <span>تحميل خارجي (MP3)</span>
                                      <ExternalLink className="w-3 h-3 opacity-70" />
                                    </a>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Footer Actions */}
                      <div className="pt-3 border-t border-slate-100 dark:border-white/10 flex items-center justify-between gap-2 mt-2">
                        <button
                          onClick={() => setExpandedBookId(isExpanded ? null : book.id)}
                          className="text-xs font-bold text-[#0d4f37] dark:text-[#feb10b] hover:underline flex items-center gap-1"
                        >
                          <span>{isExpanded ? 'طي التفاصيل' : 'قراءة خلاصة الكتاب والدرر'}</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>

                        {book.readOnlineUrl && (
                          <a
                            href={book.readOnlineUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                          >
                            <span>تصفح وقراءة</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* Section 2: Salaf Quotes (درر السلف) */}
        {(activeTab === 'all' || activeTab === 'salaf_quotes' || activeTab === 'favorites') && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Scroll className="w-5 h-5 text-[#feb10b]" />
                  <span>مكتبة درر السلف والأئمة في العقيدة</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-emerald-300/70 mt-0.5">
                  أقوال ذهبية عن الصحابة والتابعين والأئمة الأربعة في تعظيم التوحيد
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30">
                {filteredQuotes.length} درّة
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredQuotes.map((q) => {
                const isFav = favorites.includes(q.id);
                return (
                  <div
                    key={q.id}
                    className="p-4 rounded-2xl bg-white dark:bg-gradient-to-br dark:from-[#083a28] dark:to-[#042418] border border-slate-200 dark:border-emerald-500/20 shadow-sm relative overflow-hidden flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-[#0d4f37] dark:text-[#feb10b]">
                          {q.scholar}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-black/40 text-slate-600 dark:text-emerald-300/70 border border-slate-200 dark:border-emerald-500/20">
                          {q.era}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleFavorite(q.id)}
                          className="p-1.5 text-slate-400 hover:text-[#feb10b] dark:text-emerald-400/50 dark:hover:text-[#feb10b]"
                          title="حفظ"
                        >
                          <Bookmark className={cn('w-4 h-4', isFav && 'fill-[#feb10b] text-[#feb10b]')} />
                        </button>
                        <button
                          onClick={async () => {
                            await shareContent(q.scholar, `قال ${q.scholar} (${q.era}):\n\n"${q.quote}"\n\n— المصدر: ${q.source}`);
                            showToast('تم نسخ ومشاركة القول');
                          }}
                          className="p-1.5 text-slate-400 hover:text-[#feb10b] dark:text-emerald-400/50 dark:hover:text-[#feb10b]"
                          title="مشاركة"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="relative my-2 pl-2">
                      <Quote className="w-6 h-6 text-[#feb10b]/20 absolute -top-1 right-0 pointer-events-none" />
                      <p className="font-amiri text-base sm:text-lg font-bold text-slate-800 dark:text-white leading-loose pr-3">
                        «{q.quote}»
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-[11px] text-slate-500 dark:text-emerald-300/60">
                      <span>المصدر: {q.source}</span>
                      <span className="text-emerald-800 dark:text-[#feb10b] font-medium">{q.theme}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Section 3: Quick Shareable Cards (بطاقات الفوائد) */}
        {(activeTab === 'all' || activeTab === 'quick_cards' || activeTab === 'favorites') && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-[#feb10b]" />
                  <span>بطاقات عقدية سريعة للنشر والمشاركة</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-emerald-300/70 mt-0.5">
                  قواعد إيمانية موجزة مصممة لمشاركتها كصور أنيقة في وسائل التواصل
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-teal-100 dark:bg-teal-950/60 text-teal-900 dark:text-teal-300 border border-teal-300 dark:border-teal-500/30">
                {filteredQuickCards.length} بطاقة
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredQuickCards.map((card) => {
                const isDownloading = downloadingCardId === card.id;
                return (
                  <div
                    key={card.id}
                    className="flex flex-col justify-between rounded-2xl bg-white dark:bg-[#072418] border border-slate-200 dark:border-emerald-500/25 shadow-md p-4 transition-all duration-300 hover:shadow-xl hover:border-[#feb10b]/70"
                  >
                    {/* Rendered Container for Image Export */}
                    <div
                      ref={(el) => {
                        cardRefMap.current[card.id] = el;
                      }}
                      className="p-4 rounded-xl bg-gradient-to-br from-[#0d4f37] via-[#083a28] to-[#042418] text-white border border-[#feb10b]/30 shadow-inner mb-3 relative overflow-hidden"
                    >
                      <div className="flex items-center justify-between gap-1 mb-2">
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#feb10b] text-[#042418]">
                          {card.badge}
                        </span>
                        <span className="text-[10px] text-emerald-200/80 font-bold">
                          العقيدة الصحيحة
                        </span>
                      </div>

                      <h5 className="text-sm font-black text-[#feb10b] mb-2">{card.title}</h5>

                      <p className="font-amiri text-sm sm:text-base font-bold text-white/95 leading-relaxed mb-3">
                        {card.text}
                      </p>

                      <div className="pt-2 border-t border-white/15 flex items-center justify-between text-[9.5px] text-emerald-200/70">
                        <span>{card.authorOrSource}</span>
                        <span>تطبيق أذكار المؤمن</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleShareCardImage(card)}
                        disabled={isDownloading}
                        className="flex-1 py-2 px-3 rounded-xl bg-[#0d4f37] hover:bg-[#145d41] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{isDownloading ? 'جارِ التحميل...' : 'مشاركة كصورة'}</span>
                      </button>

                      <button
                        onClick={async () => {
                          await shareContent(card.title, `﴿ ${card.title} ﴾\n\n${card.text}\n\n— ${card.authorOrSource}`);
                          showToast('تم نسخ نص البطاقة');
                        }}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-black/40 dark:hover:bg-black/60 text-slate-700 dark:text-emerald-300 text-xs transition-colors"
                        title="نسخ النص"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>

      {/* Reading View Modal (صفحة القراءة المريحة للتفاصيل) */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {selectedArticle && (
            <div
              className="fixed inset-0 z-[99999] flex items-center justify-center p-2.5 sm:p-5 bg-black/75 overflow-y-auto"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  handleCloseArticle();
                }
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="w-full max-w-3xl max-h-[90vh] sm:max-h-[92vh] bg-white dark:bg-[#071d14] rounded-3xl shadow-2xl border border-slate-200 dark:border-emerald-500/30 flex flex-col overflow-hidden text-slate-900 dark:text-slate-100 relative my-auto"
                onClick={(e) => e.stopPropagation()}
                dir={isRtl ? 'rtl' : 'ltr'}
              >
                {/* Reader Top Bar */}
                <div className="px-5 py-3.5 border-b border-slate-200 dark:border-emerald-500/20 bg-slate-50 dark:bg-[#042418] flex items-center justify-between gap-3 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black px-2.5 py-1 rounded-full bg-[#feb10b]/20 text-[#0d4f37] dark:text-[#feb10b] border border-[#feb10b]/40">
                      {selectedArticle.subCategoryTitle || 'العقيدة الصحيحة'}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-emerald-300/60 font-medium">
                      {selectedArticle.readTime}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* External Audio link button */}
                    {(() => {
                      const audioInfo = getArticleAudioInfo(selectedArticle);
                      return (
                        <a
                          href={audioInfo.listenUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-emerald-950/50 text-slate-700 dark:text-[#feb10b] border border-slate-200 dark:border-emerald-500/20 hover:border-[#feb10b] flex items-center gap-1.5 transition-colors text-xs font-bold"
                          title={`استماع خارجي: ${audioInfo.label}`}
                        >
                          <Headphones className="w-3.5 h-3.5 text-[#feb10b]" />
                          <span className="hidden sm:inline">استماع خارجي</span>
                          <ExternalLink className="w-3 h-3 opacity-60" />
                        </a>
                      );
                    })()}

                    {/* Font Size Selector */}
                    <div className="flex items-center bg-white dark:bg-emerald-950/50 rounded-xl border border-slate-200 dark:border-emerald-500/20 p-0.5">
                      <button
                        onClick={() => {
                          const sizes: ('sm' | 'md' | 'lg' | 'xl')[] = ['sm', 'md', 'lg', 'xl'];
                          const nextIdx = Math.max(0, sizes.indexOf(readerFontSize) - 1);
                          setReaderFontSize(sizes[nextIdx]);
                          safeLocalStorageSetItem('aqeedah_font_size', sizes[nextIdx]);
                        }}
                        className="px-2 py-1 text-xs font-bold hover:text-[#feb10b]"
                        title="تصغير الخط"
                      >
                        A-
                      </button>
                      <span className="w-px h-3 bg-slate-200 dark:bg-emerald-500/20" />
                      <button
                        onClick={() => {
                          const sizes: ('sm' | 'md' | 'lg' | 'xl')[] = ['sm', 'md', 'lg', 'xl'];
                          const nextIdx = Math.min(sizes.length - 1, sizes.indexOf(readerFontSize) + 1);
                          setReaderFontSize(sizes[nextIdx]);
                          safeLocalStorageSetItem('aqeedah_font_size', sizes[nextIdx]);
                        }}
                        className="px-2 py-1 text-xs font-bold hover:text-[#feb10b]"
                        title="تكبير الخط"
                      >
                        A+
                      </button>
                    </div>

                    {/* Bookmark Toggle */}
                    <button
                      onClick={() => toggleFavorite(selectedArticle.id)}
                      className="p-2 rounded-xl bg-white dark:bg-emerald-950/50 text-slate-700 dark:text-emerald-300 border border-slate-200 dark:border-emerald-500/20 hover:border-[#feb10b] transition-colors"
                      title="حفظ في المفضلة"
                    >
                      <Bookmark
                        className={cn(
                          'w-4 h-4',
                          favorites.includes(selectedArticle.id) && 'fill-[#feb10b] text-[#feb10b]'
                        )}
                      />
                    </button>

                    {/* Close Modal */}
                    <button
                      onClick={handleCloseArticle}
                      className="p-2 rounded-xl bg-slate-200 dark:bg-black/50 text-slate-700 dark:text-white hover:bg-slate-300 dark:hover:bg-black/80 transition-colors"
                      title="إغلاق"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              {/* Reader Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6">
                {/* Title & Subtitle */}
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white leading-tight mb-2">
                    {selectedArticle.title}
                  </h2>
                  <p className="text-sm sm:text-base text-emerald-800 dark:text-emerald-300/90 font-medium">
                    {selectedArticle.subtitle}
                  </p>
                </div>

                {/* Summary Card */}
                <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-500/20">
                  <h4 className="text-xs font-black text-[#0d4f37] dark:text-[#feb10b] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>خلاصة المقال</span>
                  </h4>
                  <p className={cn('text-slate-800 dark:text-emerald-100 font-medium', getFontSizeClass(readerFontSize))}>
                    {selectedArticle.summary}
                  </p>
                </div>

                {/* Quranic Verse Box (if present) */}
                {selectedArticle.quranVerse && (
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-900/10 via-amber-500/10 to-emerald-900/10 dark:from-[#083a28] dark:to-[#042418] border-2 border-[#feb10b]/50 text-center relative overflow-hidden">
                    <div className="absolute top-2 right-2 text-[#feb10b]/20 text-3xl font-serif select-none">
                      ۞
                    </div>
                    <div className="text-[11px] font-bold text-amber-700 dark:text-[#feb10b] mb-2">
                      شاهد من القرآن العظيم
                    </div>
                    <p className="font-amiri text-lg sm:text-2xl font-black text-emerald-950 dark:text-emerald-100 leading-loose mb-2 px-3">
                      ﴿ {selectedArticle.quranVerse.arabic} ﴾
                    </p>
                    <span className="inline-block text-xs font-bold text-slate-600 dark:text-emerald-300/80 bg-white/70 dark:bg-black/40 px-3 py-0.5 rounded-full border border-slate-200 dark:border-emerald-500/20">
                      {selectedArticle.quranVerse.surah}
                    </span>
                  </div>
                )}

                {/* Hadith Box (if present) */}
                {selectedArticle.hadith && (
                  <div className="p-4 rounded-2xl bg-white dark:bg-[#062015] border border-slate-200 dark:border-emerald-500/20 shadow-sm text-right">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-[#0d4f37] dark:text-[#feb10b] flex items-center gap-1.5">
                        <Quote className="w-3.5 h-3.5" />
                        <span>من السنة النبوية الشريفة</span>
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-emerald-300/60 font-medium">
                        {selectedArticle.hadith.source}
                      </span>
                    </div>
                    <p className="font-amiri text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed mb-2">
                      «{selectedArticle.hadith.text}»
                    </p>
                    <div className="text-xs text-slate-500 dark:text-emerald-300/70">
                      عن {selectedArticle.hadith.narrator}
                    </div>
                  </div>
                )}

                {/* Key Takeaways */}
                <div className="p-4 rounded-2xl bg-white dark:bg-[#092b1e] border border-slate-200 dark:border-emerald-500/20">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#feb10b]" />
                    <span>الركائز والمحاور الأساسية</span>
                  </h4>
                  <ul className="space-y-2">
                    {selectedArticle.keyTakeaways.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-emerald-100/90 leading-relaxed">
                        <span className="w-5 h-5 rounded-full bg-[#feb10b]/20 text-[#0d4f37] dark:text-[#feb10b] font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Detailed Sections */}
                <div className="space-y-5">
                  <h3 className="text-base font-black text-slate-900 dark:text-white border-b border-slate-200 dark:border-emerald-500/20 pb-2">
                    الشرح المفصل والأدلة الشرعية
                  </h3>

                  {selectedArticle.detailedSections.map((sec, idx) => (
                    <div
                      key={idx}
                      className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#09261a] border border-slate-200 dark:border-emerald-500/20 space-y-3"
                    >
                      <h4 className="text-sm sm:text-base font-black text-[#0d4f37] dark:text-[#feb10b]">
                        {sec.heading}
                      </h4>

                      <div className="space-y-2">
                        {sec.content.map((p, pIdx) => (
                          <p
                            key={pIdx}
                            className={cn('text-slate-800 dark:text-emerald-100/90 leading-relaxed', getFontSizeClass(readerFontSize))}
                          >
                            {p}
                          </p>
                        ))}
                      </div>

                      {sec.evidence && (
                        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-black/30 border border-emerald-200 dark:border-emerald-500/20 text-xs font-bold text-emerald-950 dark:text-emerald-200">
                          {sec.evidence}
                        </div>
                      )}

                      {sec.practicalLifeExample && (
                        <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-500/30 text-xs text-amber-950 dark:text-amber-200">
                          <span className="font-black text-amber-800 dark:text-[#feb10b] ml-1">
                            💡 كيف تعيش بها في واقعك:
                          </span>
                          <span>{sec.practicalLifeExample}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* External Audio Box */}
                {(() => {
                  const audioInfo = getArticleAudioInfo(selectedArticle);
                  return (
                    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-emerald-900/10 to-transparent dark:from-amber-950/30 dark:via-[#083a28] dark:to-black/30 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-amber-700 dark:text-[#feb10b] font-black text-xs">
                          <Headphones className="w-4 h-4 text-[#feb10b]" />
                          <span>الشروحات والتسجيلات الصوتية المعتمدة (استماع وتحميل خارجي)</span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-bold">
                          {audioInfo.label}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-emerald-300/70">
                          * فتح مباشر في المتصفح أو تطبيق الصوتيات الافتراضي لتوفير البطارية وموارد التطبيق بالكامل.
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={audioInfo.listenUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-2 rounded-xl bg-[#0d4f37] hover:bg-[#083a28] text-white font-bold text-xs flex items-center gap-1.5 shadow transition-colors"
                          title="فتح رابط الاستماع الخارجي"
                        >
                          <Headphones className="w-3.5 h-3.5 text-[#feb10b]" />
                          <span>استماع خارجي</span>
                          <ExternalLink className="w-3 h-3 opacity-70" />
                        </a>
                        <a
                          href={audioInfo.downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-2 rounded-xl bg-white dark:bg-emerald-950/60 border border-slate-300 dark:border-emerald-500/30 text-slate-800 dark:text-emerald-200 font-bold text-xs flex items-center gap-1.5 hover:border-[#feb10b] transition-colors"
                          title="فتح رابط تحميل الدرس الخارجي"
                        >
                          <Download className="w-3.5 h-3.5 text-emerald-500 dark:text-[#feb10b]" />
                          <span>تحميل خارجي (MP3)</span>
                          <ExternalLink className="w-3 h-3 opacity-70" />
                        </a>
                      </div>
                    </div>
                  );
                })()}

                {/* Heart Reflection (وقفة قلبية) */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0d4f37] to-[#042418] text-white border border-[#feb10b]/40 shadow-lg relative overflow-hidden">
                  <div className="flex items-center gap-2 text-[#feb10b] text-xs font-black mb-2">
                    <Heart className="w-4 h-4 fill-[#feb10b]" />
                    <span>وقفة قلبية وأثر الإيمان في الروح</span>
                  </div>
                  <p className="font-amiri text-base sm:text-lg font-bold text-white/95 leading-relaxed">
                    {selectedArticle.heartReflection}
                  </p>
                </div>
              </div>

              {/* Reader Bottom Actions */}
              <div className="px-5 py-3.5 border-t border-slate-200 dark:border-emerald-500/20 bg-slate-50 dark:bg-[#042418] flex items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-2">
                  <button
                    onClick={async () => {
                      const shareText = `﴿ ${selectedArticle.title} ﴾\n${selectedArticle.subtitle}\n\nخلاصة:\n${selectedArticle.summary}\n\n— من قسم العقيدة الصحيحة في تطبيق أذكار المؤمن`;
                      await shareContent(selectedArticle.title, shareText);
                      showToast('تم نسخ ومشاركة المقال');
                    }}
                    className="px-4 py-2 rounded-xl bg-[#0d4f37] hover:bg-[#145d41] text-white text-xs font-black flex items-center gap-2 transition-all active:scale-95"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>مشاركة المقال</span>
                  </button>

                  <button
                    onClick={() => {
                      const text = `${selectedArticle.title}\n\n${selectedArticle.summary}`;
                      navigator.clipboard.writeText(text);
                      showToast('تم نسخ خلاصة المقال');
                    }}
                    className="p-2 rounded-xl bg-white dark:bg-black/40 text-slate-700 dark:text-emerald-300 border border-slate-200 dark:border-emerald-500/20 hover:border-[#feb10b] transition-colors"
                    title="نسخ النص"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={handleCloseArticle}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-black/50 text-slate-700 dark:text-white text-xs font-bold hover:bg-slate-300 dark:hover:bg-black/80 transition-colors"
                >
                  إغلاق
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

export default AqeedahHub;
