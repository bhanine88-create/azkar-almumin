import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, ChevronRight, BookOpen, Clock, Filter, ListFilter, AlertCircle, ArrowLeft, ArrowRight, History, Sparkles, BookOpenText, Copy, Share2, Loader2, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../AppContext';
import { useQuranSettings } from '../context/QuranSettingsContext';
import { cn, copyTextToClipboard, shareContent } from '../lib/utils';
import { safeLocalStorageGetItem, safeLocalStorageSetItem, safeLocalStorageRemoveItem } from "../utils/storage";

interface SearchMatch {
  text: string;
  number: number;
  surah: {
    number: number;
    name: string;
    englishName: string;
    numberOfAyahs: number;
  };
  numberInSurah: number;
}

const SEARCH_HISTORY_KEY = 'quran-search-history';

const SEARCH_TAFSIRS = {
  'ar.muyassar': 'التفسير الميسر',
  'ar.jalalayn': 'تفسير الجلالين',
  'ar.waseet': 'التفسير الوسيط (طنطاوي)',
  'ar.qurtubi': 'تفسير القرطبي',
  'ar.baghawi': 'تفسير البغوي',
};

export const QuranAdvancedSearch: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { settings } = useAppContext();
  const { fontFamily } = useQuranSettings();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scope, setScope] = useState<'all' | number>('all'); // all or surah number
  const [surahs, setSurahs] = useState<any[]>([]);
  const [history, setHistory] = useState<string[]>([]);

  // Advanced Tafsir state
  const [expandedTafsirId, setExpandedTafsirId] = useState<number | null>(null); // absolute ayah number
  const [tafsirTexts, setTafsirTexts] = useState<Record<string, string>>({}); // key style: `${ayahNum}-${tafsirEdition}`
  const [selectedTafsirId, setSelectedTafsirId] = useState<string>('ar.muyassar');
  const [loadingTafsirId, setLoadingTafsirId] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    // Load history
    const savedHistory = safeLocalStorageGetItem(SEARCH_HISTORY_KEY);
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to parse search history', e);
      }
    }

    // Load surahs for filter
    const cachedSurahs = safeLocalStorageGetItem('quran-surahs-cache-v3');
    if (cachedSurahs) {
      try {
        setSurahs(JSON.parse(cachedSurahs));
      } catch (e) {
        console.error('Failed to parse cached surahs', e);
      }
    }
  }, []);

  const saveToHistory = (q: string) => {
    if (!q || q.trim() === '') return;
    const newHistory = [q, ...history.filter(h => h !== q)].slice(0, 10);
    setHistory(newHistory);
    try {
      safeLocalStorageSetItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
    } catch (e) {
      console.warn('Failed to save search history:', e);
    }
  };

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const convertArabicNumerals = (str: string) => {
        const arabicRules: Record<string, string> = {
          '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
          '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9'
        };
        return str.replace(/[٠-٩]/g, d => arabicRules[d] || d);
      };

      const cleanQuery = convertArabicNumerals(searchQuery.trim());
      const isArabic = /[\u0600-\u06FF]/.test(searchQuery);
      let edition = 'quran-simple-clean';
      
      if (!isArabic) {
        // Map app language to alquran.cloud translation edition
        const langMap: Record<string, string> = {
          en: 'en.sahih',
          fr: 'fr.hamidullah',
          ur: 'ur.jalandhry',
          id: 'id.indonesian',
          bn: 'bn.bengali',
          tr: 'tr.ates',
          ms: 'ms.basmeih',
          de: 'de.aburida',
          es: 'es.bornez'
        };
        edition = langMap[settings.appLanguage] || 'en.sahih';
      }

      // 1. Check if the query is a specific Surah:Ayah reference (e.g. "2:255")
      const colonMatch = cleanQuery.match(/^(\d+):(\d+)$/);
      if (colonMatch) {
        const surahNum = parseInt(colonMatch[1]);
        const ayahNum = parseInt(colonMatch[2]);
        const surah = surahs.find(s => s.number === surahNum);
        if (surah && ayahNum >= 1 && ayahNum <= surah.numberOfAyahs) {
          const response = await fetch(`https://api.alquran.cloud/v1/ayah/${surahNum}:${ayahNum}/${edition}`, {
            mode: 'cors',
            credentials: 'omit',
            referrerPolicy: 'no-referrer'
          });
          const json = await response.json();
          if (json.code === 200 && json.data) {
            const match: SearchMatch = {
              text: json.data.text,
              number: json.data.number,
              surah: {
                number: json.data.surah.number,
                name: json.data.surah.name,
                englishName: json.data.surah.englishName,
                numberOfAyahs: json.data.surah.numberOfAyahs
              },
              numberInSurah: json.data.numberInSurah
            };
            setResults([match]);
            saveToHistory(searchQuery);
            setLoading(false);
            return;
          }
        }
      }

      // 2. Check if the query is SurahName AyahNumber (e.g. "البقرة 255" or "Al-Baqara 255")
      const words = cleanQuery.split(/\s+/);
      if (words.length >= 2) {
        const lastWord = words[words.length - 1];
        const ayahNum = parseInt(lastWord);
        if (!isNaN(ayahNum)) {
          const surahNamePart = words.slice(0, -1).join(' ').replace(/سورة\s+/g, '').trim();
          const surah = surahs.find(s => 
            s.name.includes(surahNamePart) || 
            s.englishName.toLowerCase().includes(surahNamePart.toLowerCase())
          );
          if (surah && ayahNum >= 1 && ayahNum <= surah.numberOfAyahs) {
            const response = await fetch(`https://api.alquran.cloud/v1/ayah/${surah.number}:${ayahNum}/${edition}`, {
              mode: 'cors',
              credentials: 'omit',
              referrerPolicy: 'no-referrer'
            });
            const json = await response.json();
            if (json.code === 200 && json.data) {
              const match: SearchMatch = {
                text: json.data.text,
                number: json.data.number,
                surah: {
                  number: json.data.surah.number,
                  name: json.data.surah.name,
                  englishName: json.data.surah.englishName,
                  numberOfAyahs: json.data.surah.numberOfAyahs
                },
                numberInSurah: json.data.numberInSurah
              };
              setResults([match]);
              saveToHistory(searchQuery);
              setLoading(false);
              return;
            }
          }
        }
      }

      // 3. Check if query is just a single number while filtered by Surah (e.g. scope is 18 and query is "10")
      if (scope !== 'all') {
        const ayahNum = parseInt(cleanQuery);
        if (!isNaN(ayahNum)) {
          const surah = surahs.find(s => s.number === scope);
          if (surah && ayahNum >= 1 && ayahNum <= surah.numberOfAyahs) {
            const response = await fetch(`https://api.alquran.cloud/v1/ayah/${surah.number}:${ayahNum}/${edition}`, {
              mode: 'cors',
              credentials: 'omit',
              referrerPolicy: 'no-referrer'
            });
            const json = await response.json();
            if (json.code === 200 && json.data) {
              const match: SearchMatch = {
                text: json.data.text,
                number: json.data.number,
                surah: {
                  number: json.data.surah.number,
                  name: json.data.surah.name,
                  englishName: json.data.surah.englishName,
                  numberOfAyahs: json.data.surah.numberOfAyahs
                },
                numberInSurah: json.data.numberInSurah
              };
              setResults([match]);
              saveToHistory(searchQuery);
              setLoading(false);
              return;
            }
          }
        }
      }

      // 4. Check if query is just a single number while searching in All (e.g. query is "255")
      const num = parseInt(cleanQuery);
      if (scope === 'all' && !isNaN(num) && num > 0 && num <= 286) {
        const matchingSurahs = surahs.filter(s => s.numberOfAyahs >= num);
        if (matchingSurahs.length > 0) {
          const generatedMatches: SearchMatch[] = matchingSurahs.map(s => ({
            text: settings.appLanguage === 'ar' 
              ? `اضغط للانتقال إلى الآية رقم ${num} من سورة ${s.name}` 
              : settings.appLanguage === 'fr'
                ? `Cliquez pour aller à la sourate ${s.englishName} verset ${num}`
                : `Click to go to Surah ${s.englishName} verse ${num}`,
            number: s.number * 10000 + num,
            surah: {
              number: s.number,
              name: s.name,
              englishName: s.englishName,
              numberOfAyahs: s.numberOfAyahs
            },
            numberInSurah: num
          }));
          setResults(generatedMatches);
          saveToHistory(searchQuery);
          setLoading(false);
          return;
        }
      }

      // 5. Fallback: standard word/verse text search via API
      const targetScope = scope === 'all' ? 'all' : scope;
      const res = await fetch(`https://api.alquran.cloud/v1/search/${encodeURIComponent(searchQuery)}/${targetScope}/${edition}`, {
        mode: 'cors',
        credentials: 'omit',
        referrerPolicy: 'no-referrer'
      });
      const json = await res.json();
      
      if (json.code === 200 && json.data && json.data.matches) {
        setResults(json.data.matches);
        if (json.data.matches.length === 0) {
          setError('لم يتم العثور على نتائج تطابق معايير البحث.');
        } else {
          saveToHistory(searchQuery);
        }
      } else {
        setResults([]);
        setError('تعذر العثور على نتائج. حاول استخدام كلمات مختلفة.');
      }
    } catch (err) {
      console.error('Quran search failed:', err);
      setError('حدث خطأ أثناء الاتصال بخدمة البحث. يرجى المحاولة لاحقاً.');
    } finally {
      setLoading(false);
    }
  }, [scope, history, surahs, settings]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length >= 2) {
        handleSearch(query);
      } else if (query === '') {
        setResults([]);
        setError(null);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [query, handleSearch]);

  const highlightText = (text: string, term: string) => {
    if (!text) return '';
    const escapedText = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    if (!term || term.trim() === '') return escapedText;
    
    // Also escape term to match the escaped text
    const termHtmlEscaped = term.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    const escapedTerm = termHtmlEscaped.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedTerm})`, 'gi');
    
    return escapedText.replace(regex, '<span class="bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 font-black px-0.5 rounded">$1</span>');
  };

  const handleToggleTafsir = async (match: SearchMatch) => {
    const ayahNum = match.number;
    if (expandedTafsirId === ayahNum) {
      setExpandedTafsirId(null);
      return;
    }

    setExpandedTafsirId(ayahNum);

    const tafsirKey = `${ayahNum}-${selectedTafsirId}`;
    if (tafsirTexts[tafsirKey]) return; // Already cached

    setLoadingTafsirId(ayahNum);
    try {
      const res = await fetch(`https://api.alquran.cloud/v1/ayah/${ayahNum}/${selectedTafsirId}`, {
        mode: 'cors',
        credentials: 'omit',
        referrerPolicy: 'no-referrer'
      });
      const json = await res.json();
      if (json.code === 200 && json.data && json.data.text) {
        setTafsirTexts(prev => ({
          ...prev,
          [tafsirKey]: json.data.text
        }));
      } else {
        setTafsirTexts(prev => ({
          ...prev,
          [tafsirKey]: 'وقع خطأ أثناء تحميل التفسير.'
        }));
      }
    } catch (err) {
      console.error('Failed to fetch tafsir:', err);
      setTafsirTexts(prev => ({
        ...prev,
        [tafsirKey]: 'تعذر الاتصال بالخادم لتحميل التفسير.'
      }));
    } finally {
      setLoadingTafsirId(null);
    }
  };

  const handleTafsirChange = async (edition: string, match: SearchMatch) => {
    setSelectedTafsirId(edition);
    const ayahNum = match.number;
    const tafsirKey = `${ayahNum}-${edition}`;
    if (tafsirTexts[tafsirKey]) return;

    setLoadingTafsirId(ayahNum);
    try {
      const res = await fetch(`https://api.alquran.cloud/v1/ayah/${ayahNum}/${edition}`, {
        mode: 'cors',
        credentials: 'omit',
        referrerPolicy: 'no-referrer'
      });
      const json = await res.json();
      if (json.code === 200 && json.data && json.data.text) {
        setTafsirTexts(prev => ({
          ...prev,
          [tafsirKey]: json.data.text
        }));
      } else {
        setTafsirTexts(prev => ({
          ...prev,
          [tafsirKey]: 'وقع خطأ أثناء تحميل التفسير.'
        }));
      }
    } catch (err) {
      console.error('Failed to fetch tafsir:', err);
      setTafsirTexts(prev => ({
        ...prev,
        [tafsirKey]: 'تعذر الاتصال بالخادم لتحميل التفسير.'
      }));
    } finally {
      setLoadingTafsirId(null);
    }
  };

  const handleCopyText = async (text: string, id: string) => {
    await copyTextToClipboard(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShareTafsir = (match: SearchMatch, tafsirText: string) => {
    const shareText = `✨ قال تعالى: { ${match.text} } [سورة ${match.surah.name}: ${match.numberInSurah}]\n\n📖 التفسير (${SEARCH_TAFSIRS[selectedTafsirId as keyof typeof SEARCH_TAFSIRS]}):\n${tafsirText}\n\n—\nتمت المشاركة من تطبيق أذكار المؤمن azkar almumin`;
    shareContent(`تفسير آية من سورة ${match.surah.name}`, shareText, window.location.origin);
  };

  if (!isOpen) return null;

  const content = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[1000] flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden"
    >
      {/* Header */}
      <header className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm z-20">
        <div className="flex items-center gap-3 p-4">
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500"
          >
            <X size={24} />
          </button>
          <div className="flex-grow relative group">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={20} />
            <input
              autoFocus
              type="text"
              placeholder="ابحث عن آية، كلمة، أو فكرة قرآنية..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-2xl py-3 pr-12 pl-4 text-lg font-bold outline-none focus:ring-2 focus:ring-teal-500/20 transition-all"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-400"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Search Filters */}
        <div className="flex items-center gap-2 px-4 pb-4 overflow-x-auto hide-scrollbar">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 text-xs font-bold shrink-0 transform transition-all duration-75 active:scale-[0.95] active:opacity-80">
            <Filter size={14} />
            <span>نطاق البحث:</span>
          </div>
          <button
            onClick={() => setScope('all')}
            className={cn(
              "px-4 py-1.5 rounded-full text-xs font-black transition-all border",
              scope === 'all' 
                ? "bg-teal-600 text-white border-teal-600 shadow-lg shadow-teal-600/20" 
                : "bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-700 hover:border-teal-500/30"
            )}
          >
            كامل القرآن
          </button>
          
          <div className="flex items-center gap-2 overflow-x-auto">
            {surahs.length > 0 && (
              <select
                value={scope === 'all' ? '' : scope}
                onChange={(e) => setScope(e.target.value ? parseInt(e.target.value) : 'all')}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-black outline-none border transition-all appearance-none bg-white dark:bg-slate-900",
                  scope !== 'all'
                    ? "bg-teal-50 dark:bg-teal-900/30 text-teal-600 border-teal-500/50" 
                    : "text-slate-500 border-slate-200 dark:border-slate-700 hover:border-teal-500/30"
                )}
              >
                <option value="">تصفية حسب السورة</option>
                {surahs.map(s => (
                  <option key={s.number} value={s.number}>{s.name} ({s.number})</option>
                ))}
              </select>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-grow overflow-y-auto custom-scrollbar p-4">
        <AnimatePresence >
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center py-20 gap-4"
            >
              <div className="relative">
                <div className="w-16 h-16 border-4 border-teal-500/10 rounded-full" />
                <div className="absolute inset-0 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
                <Search className="absolute inset-x-0 inset-y-0 m-auto text-teal-600" size={24} />
              </div>
              <div className="text-center">
                <p className="text-slate-800 dark:text-slate-100 font-black">جاري البحث في آيات الله...</p>
                <p className="text-xs text-slate-500 font-bold mt-1">نبحث في 6236 آية مباركة</p>
              </div>
            </motion.div>
          ) : query.trim() === '' ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8 py-4"
            >
              {history.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Clock size={14} /> عمليات البحث الأخيرة
                    </h3>
                    <button 
                      onClick={() => {
                        setHistory([]);
                        safeLocalStorageRemoveItem(SEARCH_HISTORY_KEY);
                      }}
                      className="text-[10px] font-bold text-rose-500 hover:underline"
                    >
                      مسح السجل
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {history.map((h, i) => (
                      <button
                        key={h}
                        onClick={() => setQuery(h)}
                        className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:border-teal-500/30 transition-all flex items-center gap-2 transform transition-all duration-75 active:scale-[0.95] active:opacity-80"
                      >
                        <History size={14} className="text-slate-400" />
                        {h}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Sparkles size={14} /> اقتراحات البحث
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { text: 'بسم الله الرحمن الرحيم', label: 'البسملة' },
                    { text: 'يا أيها الذين آمنوا', label: 'نداء المؤمنين' },
                    { text: 'إن الله مع الصابرين', label: 'أهل الصبر' },
                    { text: 'ورحمتي وسعت كل شيء', label: 'سعة الرحمة' },
                    { text: 'يد الله فوق أيديهم', label: 'عظمة الخالق' },
                    { text: 'ألا بذكر الله تطمئن القلوب', label: 'طمأنينة القلب' }
                  ].map((item, i) => (
                    <button
                      key={i}
                      onClick={() => setQuery(item.text)}
                      className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-right hover:border-teal-500/40 hover:shadow-xl hover:shadow-teal-500/5 transition-all group"
                    >
                      <div className="flex flex-col items-start gap-1">
                        <span className="text-sm font-black text-slate-800 dark:text-slate-100">{item.text}</span>
                        <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400">{item.label}</span>
                      </div>
                      <ChevronRight size={18} className="text-slate-300 group-hover:text-teal-500 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-20 gap-4 text-center"
            >
              <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 text-rose-500 rounded-full flex items-center justify-center">
                <AlertCircle size={32} />
              </div>
              <div>
                <p className="text-slate-800 dark:text-slate-100 font-black">{error}</p>
                <p className="text-xs text-slate-500 font-bold mt-1">حاول استخدام كلمات مفتاحية أخرى أو تقليل عدد الكلمات.</p>
              </div>
              <button
                onClick={() => setQuery('')}
                className="px-6 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
              >
                إعادة ضبط البحث
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col gap-4 pb-24"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  عثرنا على {results.length} آية
                </p>
              </div>
              {results.map((match, idx) => {
                const isMatchArabic = /[\u0600-\u06FF]/.test(match.text);
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(idx * 0.05, 1) }}
                    key={`${match.number}-${idx}`}
                    onClick={() => {
                      onClose();
                      navigate(`/quran/${match.surah.number}?ayah=${match.numberInSurah}`);
                    }}
                    className="group relative p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] cursor-pointer hover:border-teal-500/40 hover:shadow-2xl hover:shadow-teal-500/10 transition-all overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-teal-500/10 transition-colors" />
                    
                    <div className={cn(
                      "relative flex flex-col gap-4",
                      isMatchArabic ? "items-end text-right" : "items-start text-left"
                    )}>
                      <p 
                        dir={isMatchArabic ? "rtl" : "ltr"}
                        className={cn(
                          "text-xl md:text-2xl leading-relaxed text-slate-900 dark:text-slate-100 w-full",
                        )}
                        style={{ fontFamily: isMatchArabic ? fontFamily : 'inherit' }}
                        dangerouslySetInnerHTML={{ __html: highlightText(match.text, query) }}
                      />
                      
                      <div className={cn(
                        "flex flex-wrap items-center gap-2 w-full pt-4 border-t border-slate-100 dark:border-slate-800 mt-2",
                        isMatchArabic ? "justify-between" : "justify-between flex-row-reverse"
                      )}>
                        {/* Surah and Ayah Badges */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <div className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl text-xs font-bold">
                            <BookOpen size={12} />
                            <span>سورة {match.surah.name}</span>
                          </div>
                          <div className="px-2.5 py-1.5 bg-teal-50 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 rounded-xl text-xs font-black border border-teal-500/10">
                            آية {match.numberInSurah}
                          </div>
                        </div>

                        {/* Interactive Utilities */}
                        <div className="flex items-center gap-1.5">
                          {/* Copy Ayah */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyText(`{ ${match.text} } [سورة ${match.surah.name}: ${match.numberInSurah}]`, `ayah-copy-${match.number}`);
                            }}
                            title="نسخ الآية الكريمة"
                            className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors transform active:scale-90"
                          >
                            {copiedId === `ayah-copy-${match.number}` ? (
                              <Check size={15} className="text-emerald-500" />
                            ) : (
                              <Copy size={15} />
                            )}
                          </button>

                          {/* Toggle Tafsir */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleTafsir(match);
                            }}
                            className={cn(
                              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all transform active:scale-[0.93] shadow-sm",
                              expandedTafsirId === match.number
                                ? "bg-amber-100 border border-amber-300 text-amber-700 dark:bg-amber-950/40 dark:border-amber-800/60 dark:text-amber-400"
                                : "bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/20 dark:hover:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-transparent"
                            )}
                          >
                            <BookOpenText size={13} />
                            <span>{expandedTafsirId === match.number ? 'إخفاء التفسير' : 'عرض التفسير'}</span>
                          </button>

                          {/* Go to Surah Card Indicator */}
                          <div className={cn(
                            "w-8 h-8 bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 rounded-xl flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transform transition-colors shadow-sm",
                            !isMatchArabic && "rotate-180"
                          )}>
                            <ArrowLeft size={16} />
                          </div>
                        </div>
                      </div>

                      {/* Expandable Tafsir Panel */}
                      <AnimatePresence>
                        {expandedTafsirId === match.number && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 text-right w-full cursor-default"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                              <span className="text-[11px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest flex items-center gap-1">
                                <BookOpenText size={12} /> مصدر التفسير:
                              </span>
                              <select
                                value={selectedTafsirId}
                                onChange={(e) => handleTafsirChange(e.target.value, match)}
                                className="text-xs bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-2.5 py-1.5 font-bold text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-teal-500/20 cursor-pointer outline-none"
                              >
                                {Object.entries(SEARCH_TAFSIRS).map(([key, value]) => (
                                  <option key={key} value={key}>{value}</option>
                                ))}
                              </select>
                            </div>

                            {loadingTafsirId === match.number ? (
                              <div className="py-6 flex flex-col items-center justify-center gap-2 text-slate-400">
                                <Loader2 size={20} className="animate-spin text-teal-600" />
                                <span className="text-xs font-bold">جاري تحميل التفسير المبارك...</span>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <div className="p-4 bg-amber-50/50 dark:bg-amber-950/10 rounded-2xl border border-amber-500/5 text-slate-700 dark:text-slate-200 text-sm md:text-base leading-relaxed font-bold font-sans">
                                  {tafsirTexts[`${match.number}-${selectedTafsirId}`] || 'التفسير غير متوفر في الوقت الحالي.'}
                                </div>

                                <div className="flex items-center gap-2 justify-end">
                                  <button
                                    onClick={() => handleCopyText(
                                      tafsirTexts[`${match.number}-${selectedTafsirId}`] || '',
                                      `tafsir-copy-${match.number}`
                                    )}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-black transition-all transform active:scale-95 cursor-pointer"
                                  >
                                    {copiedId === `tafsir-copy-${match.number}` ? (
                                      <>
                                        <Check size={12} className="text-emerald-500 animate-pulse" />
                                        <span className="text-emerald-500">تم نسخ التفسير!</span>
                                      </>
                                    ) : (
                                      <>
                                        <Copy size={12} />
                                        <span>نسخ التفسير</span>
                                      </>
                                    )}
                                  </button>

                                  <button
                                    onClick={() => handleShareTafsir(
                                      match,
                                      tafsirTexts[`${match.number}-${selectedTafsirId}`] || ''
                                    )}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-black transition-all transform active:scale-95 cursor-pointer"
                                  >
                                    {copiedId === `share-${match.number}` ? (
                                      <>
                                        <Check size={12} className="text-emerald-500" />
                                        <span className="text-emerald-500 font-bold">تم نسخ الرابط والمشاركة!</span>
                                      </>
                                    ) : (
                                      <>
                                        <Share2 size={12} />
                                        <span>مشاركة الآية والتفسير</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Info */}
      {results.length > 0 && !loading && (
        <div className="p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 flex justify-center sticky bottom-0 z-20">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">انتهت نتائج البحث</p>
        </div>
      )}
    </motion.div>
  );

  return typeof document !== 'undefined' ? createPortal(content, document.body) : content;
};
