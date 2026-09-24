import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Scroll,
  BookOpen,
  Headphones,
  Download,
  Copy,
  Check,
  Share2,
  ChevronDown,
  ChevronUp,
  Bookmark,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Quote,
  CheckCircle2,
  Search,
  X,
  Compass,
  HeartHandshake,
  Layers,
  FileText
} from 'lucide-react';
import { USOOL_SITTAH_ITEMS, UsoolSittahCardItem } from '../data/usoolSittahCardsData';
import { AQEEDAH_ARTICLES, AqeedahArticle } from '../data/aqeedahData';
import { ExternalAudioLinkModal } from './ExternalAudioLinkModal';
import { cn, shareContent } from '../lib/utils';

interface UsoolSittahSectionProps {
  onSelectArticle: (article: AqeedahArticle) => void;
  favorites: string[];
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  showToast: (msg: string) => void;
  initialSelectedId?: string;
}

export const UsoolSittahSection: React.FC<UsoolSittahSectionProps> = ({
  onSelectArticle,
  favorites,
  onToggleFavorite,
  showToast,
  initialSelectedId
}) => {
  const [selectedFilterNumber, setSelectedFilterNumber] = useState<number | 'all'>('all');
  const [displayMode, setDisplayMode] = useState<'all' | 'matn' | 'sharh'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCardIds, setExpandedCardIds] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    if (initialSelectedId) {
      initial[initialSelectedId] = true;
    } else {
      // expand first card by default for immediate engagement
      initial['usool-0-intro'] = true;
    }
    return initial;
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [externalAudioModal, setExternalAudioModal] = useState<{
    isOpen: boolean;
    title: string;
    sourceLabel: string;
    url: string;
    type: 'listen' | 'download';
  } | null>(null);

  const handleOpenExternalAudio = (
    url: string,
    title: string,
    sourceLabel: string,
    type: 'listen' | 'download',
    e?: React.MouseEvent
  ) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault(); // Prevent default anchor navigation inside iframe/webview
    }
    if (!url) return;

    // Use window.open with '_blank' and 'noopener,noreferrer' to open safely in external browser
    try {
      const win = window.open(url, '_blank', 'noopener,noreferrer');
      if (!win || win.closed || typeof win.closed === 'undefined') {
        // Fallback modal
        setExternalAudioModal({
          isOpen: true,
          title,
          sourceLabel,
          url,
          type
        });
      }
    } catch (err) {
      console.warn('Window open error:', err);
      setExternalAudioModal({
        isOpen: true,
        title,
        sourceLabel,
        url,
        type
      });
    }

    showToast(type === 'listen' ? 'جاري فتح رابط الاستماع في المتصفح الخارجي...' : 'جاري فتح رابط التحميل في المتصفح الخارجي...');
  };

  // Toggle card expansion
  const toggleCard = (id: string) => {
    setExpandedCardIds((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Expand all / Collapse all
  const expandAll = () => {
    const allExpanded: Record<string, boolean> = {};
    USOOL_SITTAH_ITEMS.forEach((item) => {
      allExpanded[item.id] = true;
    });
    setExpandedCardIds(allExpanded);
    showToast('تم توسيع جميع البطاقات');
  };

  const collapseAll = () => {
    setExpandedCardIds({});
    showToast('تم طي جميع البطاقات');
  };

  // Copy full card content (Matn + Sharh)
  const handleCopyCard = async (item: UsoolSittahCardItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const textToCopy = `【${item.badge}: ${item.title}】
━━━━━━━━━━━━━━━━━━━
📜 [النص الأصلي للمتن]:
${item.matnOriginal}

🎙️ [الشرح الميسر لسماحة الشيخ عبد العزيز بن باز رحمه الله]:
${item.simplifiedSharh.intro}
• أهم المحاور:
${item.simplifiedSharh.corePoints.map((p) => ` - ${p}`).join('\n')}

💡 كشف الشبهة:
${item.simplifiedSharh.misconceptionExposed}

✅ القاعدة العملية:
${item.simplifiedSharh.practicalRule}

📖 الدليل:
﴿${item.quranVerse.text}﴾ [${item.quranVerse.surah}]
حديث: «${item.hadith.text}» [${item.hadith.source}]

🌿 وقفة قلبية:
${item.heartPause}
━━━━━━━━━━━━━━━━━━━
من تطبيق أذكار المؤمن - قسم العقيدة الصحيحة`;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedId(item.id);
      showToast('تم نسخ المتن والشرح الميسر بنجاح');
      setTimeout(() => setCopiedId(null), 2500);
    } catch {
      showToast('تعذر النسخ إلى الحافظة');
    }
  };

  // Copy Matn only
  const handleCopyMatnOnly = async (item: UsoolSittahCardItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const textToCopy = `【${item.badge}: ${item.title}】
نص المتن الأصلي لشيخ الإسلام محمد بن عبد الوهاب رحمه الله:
${item.matnOriginal}`;

    try {
      await navigator.clipboard.writeText(textToCopy);
      showToast('تم نسخ نص المتن الأصلي');
    } catch {
      showToast('تعذر النسخ');
    }
  };

  // Share card
  const handleShareCard = async (item: UsoolSittahCardItem, e: React.MouseEvent) => {
    e.stopPropagation();
    await shareContent(
      `${item.badge}: ${item.title}`,
      `【${item.badge} - الأصول الستة بشرح الشيخ ابن باز】\n${item.matnSummaryQuote}\n\nالشرح الميسر: ${item.simplifiedSharh.practicalRule}`
    );
  };

  // Filtered items
  const filteredItems = useMemo(() => {
    return USOOL_SITTAH_ITEMS.filter((item) => {
      // Filter by number tab
      if (selectedFilterNumber !== 'all' && item.number !== selectedFilterNumber) {
        return false;
      }
      // Filter by search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = item.title.toLowerCase().includes(q) || item.subtitle.toLowerCase().includes(q);
        const matchesMatn = item.matnOriginal.toLowerCase().includes(q);
        const matchesSharh =
          item.simplifiedSharh.intro.toLowerCase().includes(q) ||
          item.simplifiedSharh.corePoints.some((p) => p.toLowerCase().includes(q)) ||
          item.simplifiedSharh.misconceptionExposed.toLowerCase().includes(q);
        const matchesTakeaways = item.takeaways.some((t) => t.toLowerCase().includes(q));
        return matchesTitle || matchesMatn || matchesSharh || matchesTakeaways;
      }
      return true;
    });
  }, [selectedFilterNumber, searchQuery]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Featured Header Banner */}
      <div className="relative overflow-hidden rounded-3xl p-5 sm:p-7 border border-[#145d41]/70 dark:border-[#feb10b]/30 bg-gradient-to-br from-[#0a3827] via-[#0d4f37] to-[#042418] text-white shadow-xl shadow-emerald-950/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#feb10b]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="max-w-2xl space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-[#feb10b]/20 text-[#feb10b] border border-[#feb10b]/40">
                <Scroll className="w-3.5 h-3.5" />
                <span>متن الأصول الستة</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-emerald-200 border border-white/15">
                <span>تأليف: الإمام المجدد محمد بن عبد الوهاب</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-400/20 text-amber-300 border border-amber-400/30">
                <Sparkles className="w-3.5 h-3.5 text-[#feb10b]" />
                <span>شرح: سماحة الشيخ ابن باز رحمه الله</span>
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
              <ShieldCheck className="w-7 h-7 text-[#feb10b] shrink-0" />
              <span>الأصول الستة للشيخ ابن باز (مع الشرح الميسر)</span>
            </h2>

            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-medium">
              أصول كلية جليلة بيّنها الله تعالى في كتابه بياناً قاطعاً يفهمه العوام قبل العلماء، ثم غلط فيها كثير من أذكياء العالم بسبب ترك الوحي والتكلف الكلامي. نعرضها لك هنا عبر بطاقات تفاعلية تجمع بين <strong>النص الأصلي للمتن</strong> و<strong>الشرح الميسر لسماحة الشيخ ابن باز</strong> مع الأدلة والوقفات التربوية.
            </p>
          </div>

          {/* Quick Audio listening card */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0 w-full md:w-auto">
            <a
              href="https://binbaz.org.sa/books/78/%D8%B4%D8%B1%D8%AD-%D8%A7%D9%84%D8%A7%D8%B5%D9%88%D9%84-%D8%A7%D9%84%D8%B3%D8%AA%D8%A9"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-[#feb10b] hover:bg-[#fec84b] text-[#042418] font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
              title="فتح الشرح الصوتي في المتصفح الخارجي"
            >
              <Headphones className="w-4 h-4" />
              <span>استماع خارجي للشرح الصوتي (ابن باز)</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>

            <div className="flex items-center gap-2">
              <button
                onClick={expandAll}
                className="flex-1 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-colors text-center"
              >
                توسيع كل البطاقات
              </button>
              <button
                onClick={collapseAll}
                className="flex-1 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-colors text-center"
              >
                طي الكل
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Controls & Tabs */}
      <div className="bg-white dark:bg-[#0b281c] p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-emerald-500/20 shadow-sm space-y-4">
        {/* Search bar within principles */}
        <div className="relative">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-emerald-400/60" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث داخل الأصول الستة وشرح الشيخ ابن باز (مثال: الإخلاص، الشرك، السمع والطاعة، العلم، الأولياء)..."
            className="w-full pr-10 pl-10 py-2.5 rounded-xl bg-slate-50 dark:bg-[#071d14] border border-slate-200 dark:border-emerald-500/30 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-emerald-300/40 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#feb10b]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters and Display Mode */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pt-1 border-t border-slate-100 dark:border-emerald-500/10">
          {/* Principles Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 no-scrollbar -mx-1 px-1">
            <button
              onClick={() => setSelectedFilterNumber('all')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all border',
                selectedFilterNumber === 'all'
                  ? 'bg-[#0d4f37] dark:bg-[#feb10b] text-white dark:text-[#042418] border-[#0d4f37] dark:border-[#feb10b]'
                  : 'bg-slate-50 dark:bg-emerald-950/40 text-slate-700 dark:text-emerald-200/80 border-slate-200 dark:border-emerald-500/20 hover:border-[#feb10b]'
              )}
            >
              الكل ({USOOL_SITTAH_ITEMS.length})
            </button>
            {USOOL_SITTAH_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedFilterNumber(item.number)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all border',
                  selectedFilterNumber === item.number
                    ? 'bg-[#0d4f37] dark:bg-[#feb10b] text-white dark:text-[#042418] border-[#0d4f37] dark:border-[#feb10b]'
                    : 'bg-slate-50 dark:bg-emerald-950/40 text-slate-700 dark:text-emerald-200/80 border-slate-200 dark:border-emerald-500/20 hover:border-[#feb10b]'
                )}
              >
                {item.shortTitle}
              </button>
            ))}
          </div>

          {/* Display Mode (Matn / Sharh / All) */}
          <div className="flex items-center self-end lg:self-auto gap-1 bg-slate-100 dark:bg-[#071d14] p-1 rounded-xl border border-slate-200 dark:border-emerald-500/20 shrink-0 text-xs">
            <span className="text-[11px] text-slate-500 dark:text-emerald-300/60 px-1 font-bold">طريقة العرض:</span>
            <button
              onClick={() => setDisplayMode('all')}
              className={cn(
                'px-2.5 py-1 rounded-lg font-bold transition-all',
                displayMode === 'all'
                  ? 'bg-[#0d4f37] dark:bg-[#feb10b] text-white dark:text-[#042418] shadow-sm'
                  : 'text-slate-600 dark:text-emerald-300/80 hover:text-[#feb10b]'
              )}
            >
              شامل (متن + شرح)
            </button>
            <button
              onClick={() => setDisplayMode('matn')}
              className={cn(
                'px-2.5 py-1 rounded-lg font-bold transition-all',
                displayMode === 'matn'
                  ? 'bg-[#0d4f37] dark:bg-[#feb10b] text-white dark:text-[#042418] shadow-sm'
                  : 'text-slate-600 dark:text-emerald-300/80 hover:text-[#feb10b]'
              )}
            >
              المتن الأصلي
            </button>
            <button
              onClick={() => setDisplayMode('sharh')}
              className={cn(
                'px-2.5 py-1 rounded-lg font-bold transition-all',
                displayMode === 'sharh'
                  ? 'bg-[#0d4f37] dark:bg-[#feb10b] text-white dark:text-[#042418] shadow-sm'
                  : 'text-slate-600 dark:text-emerald-300/80 hover:text-[#feb10b]'
              )}
            >
              الشرح الميسر
            </button>
          </div>
        </div>
      </div>

      {/* Cards List */}
      <div className="space-y-5">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-[#0b281c] rounded-2xl border border-dashed border-slate-300 dark:border-emerald-500/20 text-slate-500 dark:text-emerald-200/60">
            لا توجد نتائج تطابق بحثك في الأصول الستة.
          </div>
        ) : (
          filteredItems.map((item) => {
            const isFav = favorites.includes(item.articleId);
            const isExpanded = expandedCardIds[item.id] !== false;
            const fullArticle = AQEEDAH_ARTICLES.find((a) => a.id === item.articleId);

            return (
              <motion.article
                key={item.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl bg-white dark:bg-[#0b281c] border border-slate-200 dark:border-emerald-500/20 hover:border-[#feb10b]/70 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
              >
                {/* Card Top Banner / Bar */}
                <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-emerald-500/10 bg-slate-50/70 dark:bg-emerald-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#0d4f37] dark:bg-[#feb10b]/20 text-[#feb10b] flex items-center justify-center font-black text-sm border border-[#feb10b]/30 shrink-0">
                      {item.number === 0 ? <Scroll className="w-5 h-5" /> : `٠${item.number}`}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-black text-[#0d4f37] dark:text-[#feb10b]">
                          {item.badge}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-emerald-900/40 text-slate-600 dark:text-emerald-300 font-bold">
                          متن وشرح ميسر
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                        {item.title}
                      </h3>
                    </div>
                  </div>

                  {/* Actions toolbar */}
                  <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                    <button
                      onClick={(e) => onToggleFavorite(item.articleId, e)}
                      className={cn(
                        'p-2 rounded-xl border transition-colors',
                        isFav
                          ? 'bg-amber-500/15 text-amber-500 border-amber-500/40'
                          : 'bg-white dark:bg-emerald-950/40 text-slate-400 dark:text-emerald-300/60 border-slate-200 dark:border-emerald-500/20 hover:border-[#feb10b]'
                      )}
                      title={isFav ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
                    >
                      <Bookmark className={cn('w-4 h-4', isFav && 'fill-amber-500 text-amber-500')} />
                    </button>

                    <a
                      href={item.audioListenUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => {
                        handleOpenExternalAudio(item.audioListenUrl, item.title, item.audioLabel, 'listen', e);
                      }}
                      className="p-2 rounded-xl bg-white dark:bg-emerald-950/40 text-slate-600 dark:text-emerald-300 border border-slate-200 dark:border-emerald-500/20 hover:border-[#feb10b] hover:text-[#feb10b] transition-colors cursor-pointer"
                      title={`استماع خارجي: ${item.audioLabel}`}
                    >
                      <Headphones className="w-4 h-4 text-[#feb10b]" />
                    </a>

                    <button
                      onClick={(e) => handleCopyCard(item, e)}
                      className="p-2 rounded-xl bg-white dark:bg-emerald-950/40 text-slate-600 dark:text-emerald-300 border border-slate-200 dark:border-emerald-500/20 hover:border-[#feb10b] transition-colors"
                      title="نسخ الأصل مع الشرح الميسر"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      onClick={(e) => handleShareCard(item, e)}
                      className="p-2 rounded-xl bg-white dark:bg-emerald-950/40 text-slate-600 dark:text-emerald-300 border border-slate-200 dark:border-emerald-500/20 hover:border-[#feb10b] transition-colors"
                      title="مشاركة"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => toggleCard(item.id)}
                      className="p-2 rounded-xl bg-white dark:bg-emerald-950/40 text-slate-600 dark:text-emerald-300 border border-slate-200 dark:border-emerald-500/20 hover:border-[#feb10b] transition-colors flex items-center gap-1 text-xs font-bold"
                      title={isExpanded ? 'طي التفاصيل' : 'توسيع التفاصيل'}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Card Subtitle */}
                <div className="px-5 pt-3 text-xs text-slate-500 dark:text-emerald-300/70 font-medium">
                  {item.subtitle}
                </div>

                {/* Main Interactive Content */}
                <div className="p-4 sm:p-5 space-y-4">
                  {/* 1. ORIGINAL MATN BOX (النص الأصلي للمتن) */}
                  {(displayMode === 'all' || displayMode === 'matn') && (
                    <div className="relative rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-amber-500/10 via-amber-950/5 to-transparent dark:from-amber-950/30 dark:via-[#083a28]/60 dark:to-transparent border border-amber-500/30 shadow-inner">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-amber-800 dark:text-[#feb10b] text-xs font-black">
                          <Scroll className="w-4 h-4" />
                          <span>نص المتن الأصلي (للإمام محمد بن عبد الوهاب رحمه الله):</span>
                        </div>
                        <button
                          onClick={(e) => handleCopyMatnOnly(item, e)}
                          className="text-[11px] font-bold text-slate-500 dark:text-emerald-300 hover:text-amber-600 dark:hover:text-[#feb10b] flex items-center gap-1"
                          title="نسخ نص المتن فقط"
                        >
                          <Copy className="w-3 h-3" />
                          <span>نسخ المتن</span>
                        </button>
                      </div>

                      <blockquote className="font-amiri text-base sm:text-lg text-slate-900 dark:text-amber-100 font-bold leading-relaxed text-justify relative pr-2">
                        {item.matnOriginal}
                      </blockquote>
                    </div>
                  )}

                  {/* 2. SIMPLIFIED EXPLANATION (الشرح الميسر لسماحة الشيخ ابن باز) */}
                  {(displayMode === 'all' || displayMode === 'sharh') && (
                    <div className="rounded-2xl p-4 sm:p-5 bg-slate-50 dark:bg-[#071e15] border border-slate-200 dark:border-emerald-500/20 space-y-3.5">
                      <div className="flex items-center gap-2 text-[#0d4f37] dark:text-emerald-300 text-xs font-black">
                        <Quote className="w-4 h-4 text-[#feb10b]" />
                        <span>الشرح الميسر لسماحة الشيخ عبد العزيز بن باز رحمه الله:</span>
                      </div>

                      <p className="text-sm text-slate-800 dark:text-emerald-100 font-medium leading-relaxed">
                        {item.simplifiedSharh.intro}
                      </p>

                      {/* Core Takeaways */}
                      <div className="space-y-1.5 pt-1">
                        {item.simplifiedSharh.corePoints.map((point, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
                            <CheckCircle2 className="w-4 h-4 text-[#feb10b] shrink-0 mt-0.5" />
                            <span className="leading-relaxed">{point}</span>
                          </div>
                        ))}
                      </div>

                      {/* Misconception Exposed */}
                      <div className="p-3 rounded-xl bg-amber-500/10 dark:bg-amber-950/30 border border-amber-500/20 text-xs text-amber-950 dark:text-amber-200 leading-relaxed">
                        <strong className="text-amber-800 dark:text-[#feb10b] block mb-1">
                          ⚠️ كشف الشبهة وانقلاب المفاهيم:
                        </strong>
                        {item.simplifiedSharh.misconceptionExposed}
                      </div>

                      {/* Practical Rule in daily life */}
                      <div className="p-3 rounded-xl bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/20 text-xs text-emerald-950 dark:text-emerald-200 leading-relaxed">
                        <strong className="text-[#0d4f37] dark:text-[#feb10b] block mb-1">
                          💡 القاعدة والعمل في حياة المسلم:
                        </strong>
                        {item.simplifiedSharh.practicalRule}
                      </div>
                    </div>
                  )}

                  {/* 3. EXPANDABLE DETAILS (الأدلة والوقفات والروابط) */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4 pt-2 overflow-hidden"
                      >
                        {/* Evidence: Quran & Hadith */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-black/30 border border-emerald-200/60 dark:border-emerald-500/20">
                            <span className="text-[11px] font-black text-emerald-800 dark:text-[#feb10b] block mb-1.5">
                              📖 الشاهد من القرآن الكريم:
                            </span>
                            <p className="font-amiri text-sm text-emerald-950 dark:text-emerald-100 font-bold leading-relaxed mb-1">
                              ﴿ {item.quranVerse.text} ﴾
                            </p>
                            <span className="text-[11px] text-slate-500 dark:text-emerald-300/60 font-medium">
                              سورة {item.quranVerse.surah}
                            </span>
                          </div>

                          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-emerald-500/20">
                            <span className="text-[11px] font-black text-[#0d4f37] dark:text-[#feb10b] block mb-1.5">
                              📜 الشاهد من السنة النبوية:
                            </span>
                            <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-100 font-semibold leading-relaxed mb-1">
                              «{item.hadith.text}»
                            </p>
                            <span className="text-[11px] text-slate-500 dark:text-emerald-300/60 font-medium">
                              راويه: {item.hadith.narrator} | {item.hadith.source}
                            </span>
                          </div>
                        </div>

                        {/* Heart Reflection */}
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0d4f37] to-[#042418] text-white border border-[#feb10b]/30 flex items-center gap-3">
                          <Compass className="w-5 h-5 text-[#feb10b] shrink-0" />
                          <div className="text-xs sm:text-sm leading-relaxed text-emerald-100">
                            <strong className="text-[#feb10b] block mb-0.5">وقفة قلبية وتأمل:</strong>
                            {item.heartPause}
                          </div>
                        </div>

                        {/* Audio Bar & Detailed Modal Trigger */}
                        <div className="p-3.5 rounded-2xl bg-amber-500/10 dark:bg-amber-950/30 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-2 text-slate-800 dark:text-amber-200">
                            <Headphones className="w-4 h-4 text-[#feb10b] shrink-0" />
                            <div>
                              <span className="font-bold block">{item.audioLabel}</span>
                              <span className="text-[10px] text-slate-500 dark:text-amber-300/70">فتح بروابط خارجية مباشرة بدون استهلاك لموارد التطبيق</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                            <a
                              href={item.audioListenUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => {
                                handleOpenExternalAudio(item.audioListenUrl, item.title, item.audioLabel, 'listen', e);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-[#0d4f37] hover:bg-[#083a28] text-white font-bold text-xs flex items-center gap-1 shadow transition-colors cursor-pointer"
                              title="فتح رابط الاستماع الخارجي"
                            >
                              <Headphones className="w-3.5 h-3.5 text-[#feb10b]" />
                              <span>استماع خارجي</span>
                              <ExternalLink className="w-3 h-3 opacity-70" />
                            </a>

                            <a
                              href={item.audioDownloadUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => {
                                handleOpenExternalAudio(item.audioDownloadUrl, item.title, item.audioLabel, 'download', e);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-white dark:bg-emerald-950/60 border border-slate-300 dark:border-emerald-500/30 text-slate-800 dark:text-emerald-200 font-bold text-xs flex items-center gap-1 hover:border-[#feb10b] transition-colors cursor-pointer"
                              title="فتح رابط تحميل الدرس الخارجي"
                            >
                              <Download className="w-3.5 h-3.5 text-emerald-500 dark:text-[#feb10b]" />
                              <span>تحميل خارجي (MP3)</span>
                              <ExternalLink className="w-3 h-3 opacity-70" />
                            </a>

                            {fullArticle && (
                              <button
                                onClick={() => onSelectArticle(fullArticle)}
                                className="px-3.5 py-1.5 rounded-xl bg-[#feb10b] hover:bg-[#fec84b] text-[#042418] font-black text-xs flex items-center gap-1 shadow-sm transition-transform active:scale-95"
                              >
                                <BookOpen className="w-3.5 h-3.5" />
                                <span>قراءة الشرح المفصل</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Bottom Card Footer */}
                <div className="px-5 py-3 border-t border-slate-100 dark:border-emerald-500/10 bg-slate-50/50 dark:bg-emerald-950/10 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-slate-500 dark:text-emerald-300/60">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{item.takeaways.length} فوائد مستفادة من هذا الأصل</span>
                  </div>

                  <button
                    onClick={() => toggleCard(item.id)}
                    className="text-[#0d4f37] dark:text-[#feb10b] font-bold flex items-center gap-1 hover:underline"
                  >
                    <span>{isExpanded ? 'طي التفاصيل' : 'عرض الأدلة والشرح الموسع'}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </motion.article>
            );
          })
        )}
      </div>

      {/* Summary Recap Banner at bottom of Usool Sittah */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-emerald-900/10 via-amber-500/10 to-emerald-900/10 dark:from-[#0d4f37]/40 dark:via-[#083a28]/60 dark:to-[#042418] border border-[#feb10b]/30 text-center space-y-2">
        <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 text-[#feb10b]" />
          <span>خلاصة الأصول الستة وقاعدة النجاة</span>
        </h4>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-emerald-200/90 max-w-2xl mx-auto leading-relaxed">
          «من لزم هذه الأصول الستة مخلصاً لله متبعاً لسنة نبيه ﷺ، لزم الصراط المستقيم، وأَمِنَ من الشبهات المضلة، وكان من الفرقة الناجية والطائفة المنصورة بإذن الله تعالى».
        </p>
      </div>

      {/* External Audio Link Fallback Modal */}
      {externalAudioModal && (
        <ExternalAudioLinkModal
          isOpen={externalAudioModal.isOpen}
          onClose={() => setExternalAudioModal(null)}
          title={externalAudioModal.title}
          sourceLabel={externalAudioModal.sourceLabel}
          url={externalAudioModal.url}
          type={externalAudioModal.type}
        />
      )}
    </div>
  );
};
