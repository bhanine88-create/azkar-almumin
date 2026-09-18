import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BackButton } from './ui/BackButton';
import {
  Type,
  Download,
  CheckCircle2,
  Sparkles,
  BookOpen,
  HeartHandshake,
  LayoutGrid,
  Search,
  Sliders,
  X,
  Check,
  RefreshCw,
  Palette,
  Info
} from 'lucide-react';
import { cn } from '../lib/utils';
import {
  CURATED_ISLAMIC_FONTS,
  IslamicFont,
  getDownloadedFontIds,
  downloadFontWithProgress,
  loadFontStylesheet
} from '../services/fontService';
import { useQuranSettings } from '../context/QuranSettingsContext';
import { useAppContext } from '../AppContext';

interface IslamicFontStudioProps {
  isOpen?: boolean;
  onClose?: () => void;
  standalonePage?: boolean;
}

const SAMPLE_PRESETS = [
  { label: 'سورة الفاتحة', text: 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ ﴿١﴾ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ﴿٢﴾' },
  { label: 'آية الكرسي', text: 'اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ' },
  { label: 'دعاء طلب العلم', text: 'وَقُل رَّبِّ زِدْنِي عِلْمًا' },
  { label: 'التسبيح والتحميد', text: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ سُبْحَانَ اللَّهِ الْعَظِيمِ' },
  { label: 'الصلاة على النبي', text: 'الْلَّهُمَّ صَلِّ وَسَلِّمْ وَبَارِكْ عَلَى نَبِيِّنَا مُحَمَّدٍ' },
  { label: 'أستغفر الله', text: 'أَسْتَغْفِرُ اللَّهَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيَّ الْقَيُّومَ وَأَتُوبُ إِلَيْهِ' }
];

export const IslamicFontStudio: React.FC<IslamicFontStudioProps> = ({
  isOpen = true,
  onClose,
  standalonePage = false
}) => {
  const { fontFamily: quranFont, setFontFamily: setQuranFont } = useQuranSettings();
  const { settings, updateSettings } = useAppContext();

  const triggerHaptic = (_type?: string) => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate(10); } catch (e) {}
    }
  };

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [customSampleText, setCustomSampleText] = useState<string>(SAMPLE_PRESETS[0].text);
  const [sampleFontSize, setSampleFontSize] = useState<number>(24);
  const [downloadedIds, setDownloadedIds] = useState<string[]>([]);
  const [downloadProgress, setDownloadProgress] = useState<Record<string, number>>({});
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    // Sync downloaded font IDs on mount
    const loaded = getDownloadedFontIds();
    setDownloadedIds(loaded);

    // Preload downloaded fonts into DOM
    CURATED_ISLAMIC_FONTS.filter(f => loaded.includes(f.id)).forEach(f => {
      loadFontStylesheet(f);
    });
  }, []);

  const handleDownloadFont = async (font: IslamicFont) => {
    if (downloadingId) return;
    triggerHaptic('medium');
    setDownloadingId(font.id);
    setDownloadProgress(prev => ({ ...prev, [font.id]: 10 }));

    const success = await downloadFontWithProgress(font, (pct) => {
      setDownloadProgress(prev => ({ ...prev, [font.id]: pct }));
    });

    setDownloadingId(null);

    if (success) {
      triggerHaptic('success');
      const updated = getDownloadedFontIds();
      setDownloadedIds(updated);
      showToast(`تم تنزيل وتثبيت ${font.name} بنجاح!`);
    } else {
      triggerHaptic('error');
      showToast(`عذراً، تعذر تنزيل ${font.name}. يرجى التحقق من الاتصال.`);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleApplyToQuran = (font: IslamicFont) => {
    triggerHaptic('light');
    setQuranFont(font.fontFamily);
    document.documentElement.style.setProperty('--quran-font', `"${font.fontFamily}"`);
    showToast(`تم تطبيق ${font.name} لقراءة القرآن الكريم`);
  };

  const handleApplyToAdhkar = (font: IslamicFont) => {
    triggerHaptic('light');
    updateSettings({ adhkarFontFamily: font.fontFamily });
    document.documentElement.style.setProperty('--adhkar-font', `"${font.fontFamily}"`);
    showToast(`تم تطبيق ${font.name} لنصوص الأذكار والأدعية`);
  };

  const handleApplyToApp = (font: IslamicFont) => {
    triggerHaptic('light');
    updateSettings({ fontFamily: font.fontFamily });
    document.documentElement.style.setProperty('--app-font', `"${font.fontFamily}"`);
    showToast(`تم تطبيق ${font.name} كالخط الرئيسي للتطبيق`);
  };

  const filteredFonts = CURATED_ISLAMIC_FONTS.filter(font => {
    const matchesCategory = activeCategory === 'all' || font.category === activeCategory;
    const matchesQuery = font.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         font.designer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         font.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const categories = [
    { id: 'all', label: 'الكل' },
    { id: 'quranic', label: 'عثماني وقرآني' },
    { id: 'kufi', label: 'خطوط كوفية' },
    { id: 'naskh_ruqaa', label: 'رقعة ونسخ' },
    { id: 'modern', label: 'حديث وعرض' }
  ];

  if (!isOpen && !standalonePage) return null;

  const content = (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-12">
      {/* Sticky Top Header Bar with Back Button */}
      <div className="sticky top-0 z-30 bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-slate-200/70 dark:border-slate-800/80 rounded-2xl p-3 sm:px-4 shadow-sm flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <BackButton fallbackPath="/library" onClick={onClose} />
          <div>
            <h1 className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
              <Type size={16} className="text-teal-600 dark:text-teal-400" />
              <span>مكتبة الخطوط والخط العربي</span>
            </h1>
            <p className="text-[10px] sm:text-[11px] font-bold text-teal-600 dark:text-teal-400">
              استوديو الخطوط الإسلامية والزخرفة
            </p>
          </div>
        </div>

        {!standalonePage && onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            title="إغلاق"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 p-6 sm:p-8 text-white shadow-2xl border border-teal-500/30">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#14b8a6_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-black">
              <Sparkles size={14} className="animate-pulse" />
              <span>استوديو الخطوط الإسلامية والزخرفة</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
              مكتبة الخطوط والخط العربي
            </h2>
            <p className="text-xs sm:text-sm text-teal-100/80 font-bold max-w-xl leading-relaxed">
              اختر ونزّل خطك المفضل من نخبة الخطوط القرآنية والعثمانية والكوفية لإضفاء جمال وإحساس إيماني فريد على قراءة آيات المصحف الشريف والأذكار.
            </p>
          </div>
        </div>
      </div>

      {/* Toast Banner Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="p-4 rounded-2xl bg-teal-600 text-white shadow-xl flex items-center gap-3 border border-teal-400/40"
          >
            <CheckCircle2 size={20} className="text-teal-200 shrink-0" />
            <span className="text-xs sm:text-sm font-black">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive Live Font Preview Customizer */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-white/10 shadow-xl space-y-4">
        <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2 text-teal-400 font-black text-sm">
            <Palette size={18} />
            <span>معاينة النص الحي المخصص</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/60 font-bold">حجم الخط: {sampleFontSize}px</span>
            <input
              type="range"
              min={16}
              max={44}
              value={sampleFontSize}
              onChange={(e) => setSampleFontSize(Number(e.target.value))}
              className="w-24 sm:w-32 accent-teal-400 cursor-pointer"
            />
          </div>
        </div>

        {/* Input Custom Sample Text */}
        <div className="space-y-2">
          <input
            type="text"
            value={customSampleText}
            onChange={(e) => setCustomSampleText(e.target.value)}
            placeholder="اكتب أي آية قرآنية أو ذكر لمعاينتها بجميع الخطوط..."
            className="w-full p-3.5 rounded-2xl bg-black/40 border border-white/15 text-white placeholder-white/40 text-sm font-bold focus:outline-none focus:border-teal-400/60 transition-colors"
          />

          {/* Quick Preset Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            <span className="text-[11px] font-black text-white/50 shrink-0 pl-1">نماذج سريعة:</span>
            {SAMPLE_PRESETS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  triggerHaptic('selection');
                  setCustomSampleText(p.text);
                }}
                className={cn(
                  "px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shrink-0",
                  customSampleText === p.text
                    ? "bg-teal-500/20 text-teal-300 border-teal-500/40"
                    : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Category Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                triggerHaptic('selection');
                setActiveCategory(cat.id);
              }}
              className={cn(
                "px-4 py-2 rounded-2xl text-xs sm:text-sm font-black whitespace-nowrap transition-all border",
                activeCategory === cat.id
                  ? "bg-teal-500 text-white border-teal-400 shadow-lg shadow-teal-900/40"
                  : "bg-slate-900/80 text-white/70 border-white/10 hover:bg-white/10 hover:text-white"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث عن خط أو خطاط..."
            className="w-full pr-9 pl-4 py-2 rounded-2xl bg-slate-900/80 border border-white/10 text-white text-xs sm:text-sm font-bold placeholder-white/40 focus:outline-none focus:border-teal-400/50"
          />
        </div>
      </div>

      {/* Fonts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredFonts.map((font) => {
          const isDownloaded = downloadedIds.includes(font.id) || font.isBuiltIn;
          const isQuranActive = quranFont === font.fontFamily;
          const isAdhkarActive = settings.adhkarFontFamily === font.fontFamily;
          const isAppActive = settings.fontFamily === font.fontFamily;
          const isDownloading = downloadingId === font.id;
          const currentProgress = downloadProgress[font.id] || 0;

          return (
            <motion.div
              key={font.id}
              layout
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "p-5 rounded-3xl transition-all border relative overflow-hidden flex flex-col justify-between gap-4",
                isQuranActive || isAdhkarActive || isAppActive
                  ? "bg-slate-900/95 border-teal-500/50 shadow-xl shadow-teal-950/40 ring-1 ring-teal-500/30"
                  : "bg-slate-900/70 border-white/10 hover:border-white/20 shadow-md"
              )}
            >
              {/* Top Meta info */}
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black text-white">{font.name}</h3>
                      <span className="px-2 py-0.5 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 text-[10px] font-black">
                        {font.categoryLabel}
                      </span>
                    </div>
                    <p className="text-[11px] text-white/50 font-bold mt-0.5">{font.designer}</p>
                  </div>

                  {/* Size / Status Badge */}
                  <div className="text-left shrink-0">
                    {font.isBuiltIn ? (
                      <span className="text-[10px] font-black text-amber-300 bg-amber-500/15 px-2.5 py-1 rounded-full border border-amber-500/30">
                        مدمج بالنظام
                      </span>
                    ) : (
                      <span className="text-[10px] font-black text-white/60 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
                        {font.sizeKb} KB
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-white/70 font-bold leading-relaxed line-clamp-2">
                  {font.description}
                </p>

                {/* Active Usage Badges */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {isQuranActive && (
                    <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black flex items-center gap-1">
                      <BookOpen size={12} />
                      <span>الخط الحالي للقرآن</span>
                    </span>
                  )}
                  {isAdhkarActive && (
                    <span className="px-2.5 py-1 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/40 text-[10px] font-black flex items-center gap-1">
                      <HeartHandshake size={12} />
                      <span>الخط الحالي للأذكار</span>
                    </span>
                  )}
                  {isAppActive && (
                    <span className="px-2.5 py-1 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[10px] font-black flex items-center gap-1">
                      <Type size={12} />
                      <span>الخط الرئيسي للتطبيق</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Sample Render Box */}
              <div
                className="p-4 rounded-2xl bg-black/40 border border-white/10 text-teal-100 text-center leading-loose overflow-x-auto my-1 select-text transition-all"
                style={{
                  fontFamily: font.fontFamily,
                  fontSize: `${sampleFontSize}px`
                }}
              >
                {customSampleText || font.sampleVerse}
              </div>

              {/* Action Footer */}
              <div className="pt-2 border-t border-white/10">
                {!isDownloaded ? (
                  <div className="space-y-2">
                    {isDownloading ? (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-black text-teal-300">
                          <span className="flex items-center gap-1.5">
                            <RefreshCw size={14} className="animate-spin" />
                            <span>جاري تنزيل الخط...</span>
                          </span>
                          <span>{currentProgress}%</span>
                        </div>
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden p-0.5">
                          <motion.div
                            className="h-full bg-teal-400 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${currentProgress}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleDownloadFont(font)}
                        className="w-full py-3 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-950/50 transition-all cursor-pointer active:scale-95"
                      >
                        <Download size={16} />
                        <span>تنزيل وتثبيت الخط ({font.sizeKb} KB)</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApplyToQuran(font)}
                      className={cn(
                        "flex-1 py-2.5 px-2 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all border cursor-pointer",
                        isQuranActive
                          ? "bg-emerald-500 text-white border-emerald-400 shadow-md"
                          : "bg-white/5 text-white/80 border-white/10 hover:bg-emerald-500/20 hover:text-emerald-300"
                      )}
                    >
                      <BookOpen size={14} />
                      <span>للقرآن</span>
                    </button>

                    <button
                      onClick={() => handleApplyToAdhkar(font)}
                      className={cn(
                        "flex-1 py-2.5 px-2 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all border cursor-pointer",
                        isAdhkarActive
                          ? "bg-teal-500 text-white border-teal-400 shadow-md"
                          : "bg-white/5 text-white/80 border-white/10 hover:bg-teal-500/20 hover:text-teal-300"
                      )}
                    >
                      <HeartHandshake size={14} />
                      <span>للأذكار</span>
                    </button>

                    <button
                      onClick={() => handleApplyToApp(font)}
                      className={cn(
                        "flex-1 py-2.5 px-2 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all border cursor-pointer",
                        isAppActive
                          ? "bg-blue-500 text-white border-blue-400 shadow-md"
                          : "bg-white/5 text-white/80 border-white/10 hover:bg-blue-500/20 hover:text-blue-300"
                      )}
                    >
                      <Type size={14} />
                      <span>للتطبيق</span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );

  if (standalonePage) {
    return content;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md overflow-y-auto p-4 sm:p-6 custom-scrollbar">
      {content}
    </div>
  );
};
