import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, Mic2, BookOpen, PlayCircle, ChevronLeft, Sparkles, Book, UserCheck } from 'lucide-react';
import { cn } from '../lib/utils';
import { SCHOLARS } from '../data/lectures';
import { RECITERS } from '../reciters';
import { TAFSIR_SCHOLARS } from '../data/tafsir';
import { smartScholarMatch, smartReciterMatch, smartLectureMatch, normalizeArabicForSearch } from '../lib/arabicSearch';
import { useGlobalAudio } from '../context/GlobalAudioContext';

interface AudioSearchAutocompleteProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  placeholder?: string;
  onSelectScholar: (scholarId: string) => void;
  onSelectReciter: (reciterId: string) => void;
  onSelectLecture?: (lecture: any) => void;
  onSelectTafsir?: (tafsirScholarId: string) => void;
  isDarkTheme?: boolean;
}

// Popular suggested search keywords for instant 1-tap autocomplete
const POPULAR_SEARCHES = [
  'عثمان الخميس',
  'مشاري الخراز',
  'محمد حسان',
  'أبو إسحاق الحويني',
  'محمد صديق المنشاوي',
  'عبد الباسط عبد الصمد',
  'تفسير ابن كثير',
  'كيف تتلذذ بالصلاة'
];

export const AudioSearchAutocomplete: React.FC<AudioSearchAutocompleteProps> = ({
  searchQuery,
  onSearchChange,
  placeholder = "ابحث بحرية عن أي شيخ، قارئ، أو محاضرة...",
  onSelectScholar,
  onSelectReciter,
  onSelectLecture,
  onSelectTafsir,
  isDarkTheme = true
}) => {
  const { playTrack } = useGlobalAudio();
  const [isFocused, setIsFocused] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'scholars' | 'reciters' | 'lectures' | 'tafsir'>('all');
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter calculations
  const filteredReciters = RECITERS.filter(r => smartReciterMatch(r, searchQuery));
  const filteredScholars = SCHOLARS.filter(s => smartScholarMatch(s, searchQuery));
  const filteredTafsir = TAFSIR_SCHOLARS.filter(ts => smartScholarMatch(ts, searchQuery));

  const allLectures = SCHOLARS.flatMap(s => 
    s.series.flatMap(sr => sr.lectures.map(l => ({ ...l, scholarName: s.name, seriesTitle: sr.title })))
  );
  const filteredLectures = allLectures.filter(l => smartLectureMatch(l, searchQuery));
  
  const hasQuery = searchQuery.trim().length > 0;

  const totalResults = 
    (activeTab === 'all' || activeTab === 'reciters' ? filteredReciters.length : 0) +
    (activeTab === 'all' || activeTab === 'scholars' ? filteredScholars.length : 0) +
    (activeTab === 'all' || activeTab === 'lectures' ? filteredLectures.length : 0) +
    (activeTab === 'all' || activeTab === 'tafsir' ? filteredTafsir.length : 0);

  const showDropdown = isFocused;

  return (
    <div ref={containerRef} className="relative w-full z-40">
      {/* Search Input Bar */}
      <div className="relative group">
        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-fuchsia-500 transition-colors">
          <Search size={18} />
        </div>

        <input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onFocus={() => setIsFocused(true)}
          onChange={(e) => {
            onSearchChange(e.target.value);
            setIsFocused(true);
          }}
          className={cn(
            "w-full h-14 pr-12 pl-12 rounded-[22px] text-sm font-bold transition-all outline-none border shadow-sm",
            isDarkTheme 
              ? "bg-slate-900 border-slate-800 text-white placeholder:text-slate-500 focus:border-fuchsia-500 focus:ring-4 focus:ring-fuchsia-500/10" 
              : "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-fuchsia-500 focus:ring-4 focus:ring-fuchsia-500/10"
          )}
        />

        {hasQuery && (
          <button
            onClick={() => {
              onSearchChange('');
              setIsFocused(true);
            }}
            className="absolute inset-y-0 left-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
            title="مسح البحث"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Instant Autocomplete Dropdown Overlay */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.99 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute top-full left-0 right-0 mt-2 rounded-[24px] border shadow-2xl backdrop-blur-xl overflow-hidden max-h-[75vh] flex flex-col z-50",
              isDarkTheme
                ? "bg-slate-900/95 border-slate-800 text-white shadow-black/60"
                : "bg-white/95 border-slate-200 text-slate-900 shadow-slate-300/60"
            )}
          >
            {/* Quick Filter Tabs if query present */}
            {hasQuery && (
              <div className="flex items-center gap-1.5 p-2 border-b border-black/5 dark:border-white/5 overflow-x-auto no-scrollbar bg-slate-100/50 dark:bg-slate-950/40">
                <button
                  onClick={() => setActiveTab('all')}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 flex items-center gap-1",
                    activeTab === 'all'
                      ? "bg-fuchsia-600 text-white shadow-md shadow-fuchsia-600/30"
                      : "text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800"
                  )}
                >
                  <Sparkles size={12} />
                  <span>الكل</span>
                </button>

                <button
                  onClick={() => setActiveTab('scholars')}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 flex items-center gap-1",
                    activeTab === 'scholars'
                      ? "bg-fuchsia-600 text-white shadow-md shadow-fuchsia-600/30"
                      : "text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800"
                  )}
                >
                  <Mic2 size={12} />
                  <span>المشايخ ({filteredScholars.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('reciters')}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 flex items-center gap-1",
                    activeTab === 'reciters'
                      ? "bg-fuchsia-600 text-white shadow-md shadow-fuchsia-600/30"
                      : "text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800"
                  )}
                >
                  <BookOpen size={12} />
                  <span>القراء ({filteredReciters.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('lectures')}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 flex items-center gap-1",
                    activeTab === 'lectures'
                      ? "bg-fuchsia-600 text-white shadow-md shadow-fuchsia-600/30"
                      : "text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800"
                  )}
                >
                  <PlayCircle size={12} />
                  <span>الدروس ({filteredLectures.length})</span>
                </button>

                {filteredTafsir.length > 0 && (
                  <button
                    onClick={() => setActiveTab('tafsir')}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 flex items-center gap-1",
                      activeTab === 'tafsir'
                        ? "bg-fuchsia-600 text-white shadow-md shadow-fuchsia-600/30"
                        : "text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800"
                    )}
                  >
                    <Book size={12} />
                    <span>التفسير ({filteredTafsir.length})</span>
                  </button>
                )}
              </div>
            )}

            {/* Dropdown Scrollable Body */}
            <div className="overflow-y-auto p-3 space-y-4 max-h-[60vh] custom-scrollbar">
              {/* Popular Searches Suggestions when query is empty */}
              {!hasQuery && (
                <div className="space-y-3 py-1">
                  <div className="flex items-center gap-2 px-1 text-xs font-black text-slate-400">
                    <Sparkles size={14} className="text-amber-500" />
                    <span>اقتراحات بحث سريعة:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_SEARCHES.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          onSearchChange(item);
                          setIsFocused(true);
                        }}
                        className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-fuchsia-50 dark:hover:bg-fuchsia-950/40 hover:text-fuchsia-600 dark:hover:text-fuchsia-300 transition-colors text-right border border-black/5 dark:border-white/5"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Scholars Section */}
              {hasQuery && (activeTab === 'all' || activeTab === 'scholars') && filteredScholars.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1 text-xs font-black text-fuchsia-600 dark:text-fuchsia-400">
                    <span className="flex items-center gap-1.5">
                      <Mic2 size={14} />
                      المشايخ والدعاة
                    </span>
                    <span className="text-[10px] bg-fuchsia-500/10 px-2 py-0.5 rounded-full">
                      {filteredScholars.length} شيخ
                    </span>
                  </div>
                  <div className="space-y-1">
                    {filteredScholars.slice(0, activeTab === 'all' ? 4 : 20).map(scholar => (
                      <button
                        key={scholar.id}
                        onClick={() => {
                          setIsFocused(false);
                          onSelectScholar(scholar.id);
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-fuchsia-500/10 transition-all text-right group border border-transparent hover:border-fuchsia-500/20"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-fuchsia-100 dark:bg-fuchsia-950/60 text-fuchsia-600 dark:text-fuchsia-300 flex items-center justify-center font-black text-sm shrink-0">
                            {scholar.name.charAt(0)}
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-black text-slate-800 dark:text-white group-hover:text-fuchsia-600 dark:group-hover:text-fuchsia-400 transition-colors">
                              {scholar.name}
                            </p>
                            <p className="text-[11px] text-slate-500 font-bold">
                              {scholar.series.length} سلاسل صوتية
                            </p>
                          </div>
                        </div>
                        <ChevronLeft size={16} className="text-slate-400 group-hover:-translate-x-1 transition-transform" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Reciters Section */}
              {hasQuery && (activeTab === 'all' || activeTab === 'reciters') && filteredReciters.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1 text-xs font-black text-teal-600 dark:text-teal-400">
                    <span className="flex items-center gap-1.5">
                      <BookOpen size={14} />
                      قراء القرآن الكريم
                    </span>
                    <span className="text-[10px] bg-teal-500/10 px-2 py-0.5 rounded-full">
                      {filteredReciters.length} قارئ
                    </span>
                  </div>
                  <div className="space-y-1">
                    {filteredReciters.slice(0, activeTab === 'all' ? 4 : 20).map(reciter => (
                      <button
                        key={reciter.id}
                        onClick={() => {
                          setIsFocused(false);
                          onSelectReciter(String(reciter.id));
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-teal-500/10 transition-all text-right group border border-transparent hover:border-teal-500/20"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-300 flex items-center justify-center font-black text-sm shrink-0">
                            <BookOpen size={16} />
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-black text-slate-800 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                              {reciter.name}
                            </p>
                            <p className="text-[11px] text-slate-500 font-bold">
                              برواية {reciter.style}
                            </p>
                          </div>
                        </div>
                        <ChevronLeft size={16} className="text-slate-400 group-hover:-translate-x-1 transition-transform" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Lectures Section */}
              {hasQuery && (activeTab === 'all' || activeTab === 'lectures') && filteredLectures.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1 text-xs font-black text-amber-600 dark:text-amber-400">
                    <span className="flex items-center gap-1.5">
                      <PlayCircle size={14} />
                      المحاضرات والدروس
                    </span>
                    <span className="text-[10px] bg-amber-500/10 px-2 py-0.5 rounded-full">
                      {filteredLectures.length} درس
                    </span>
                  </div>
                  <div className="space-y-1">
                    {filteredLectures.slice(0, activeTab === 'all' ? 5 : 25).map(lecture => (
                      <button
                        key={lecture.id}
                        onClick={() => {
                          setIsFocused(false);
                          if (onSelectLecture) {
                            onSelectLecture(lecture);
                          } else {
                            onSelectScholar(lecture.id);
                          }
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-amber-500/10 transition-all text-right group border border-transparent hover:border-amber-500/20"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300 flex items-center justify-center shrink-0">
                            <PlayCircle size={18} />
                          </div>
                          <div className="text-right truncate">
                            <p className="text-sm font-black text-slate-800 dark:text-white truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                              {lecture.title}
                            </p>
                            <p className="text-[11px] text-slate-500 font-bold truncate">
                              {lecture.scholarName} • {lecture.seriesTitle}
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg shrink-0 mr-2">
                          {lecture.duration}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tafsir Section */}
              {hasQuery && (activeTab === 'all' || activeTab === 'tafsir') && filteredTafsir.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1 text-xs font-black text-blue-600 dark:text-blue-400">
                    <span className="flex items-center gap-1.5">
                      <Book size={14} />
                      التفسير والقرآن
                    </span>
                    <span className="text-[10px] bg-blue-500/10 px-2 py-0.5 rounded-full">
                      {filteredTafsir.length} مفسر
                    </span>
                  </div>
                  <div className="space-y-1">
                    {filteredTafsir.map(ts => (
                      <button
                        key={ts.id}
                        onClick={() => {
                          setIsFocused(false);
                          if (onSelectTafsir) onSelectTafsir(ts.id);
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-blue-500/10 transition-all text-right group border border-transparent hover:border-blue-500/20"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 flex items-center justify-center font-black text-sm shrink-0">
                            <Book size={16} />
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-black text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {ts.name}
                            </p>
                            <p className="text-[11px] text-slate-500 font-bold">
                              {ts.description}
                            </p>
                          </div>
                        </div>
                        <ChevronLeft size={16} className="text-slate-400 group-hover:-translate-x-1 transition-transform" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* No results message */}
              {hasQuery && totalResults === 0 && (
                <div className="py-8 text-center space-y-2">
                  <p className="text-slate-500 font-bold text-sm">
                    لم نجد نتائج مطابقة لـ "{searchQuery}"
                  </p>
                  <p className="text-xs text-slate-400">
                    جرب البحث بكلمة أقصر (مثل: "حسان"، "العريفي"، "المنشاوي")
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
