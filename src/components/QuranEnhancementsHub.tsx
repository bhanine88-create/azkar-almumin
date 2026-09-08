import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, Sparkles, X, Compass, Info, HelpCircle, 
  Layers, Search, BookMarked, MessageSquareText, Shield, 
  CheckCircle, Play, ChevronLeft, Volume2, Highlighter
} from 'lucide-react';
import { useQuranSettings } from '../context/QuranSettingsContext';
import { useAppContext } from '../AppContext';
import { cn } from '../lib/utils';
import { useTranslation } from '../i18n';
import { 
  quranVocabulary, quranicThemes, tajweedRules, 
  VocabularyWord, QuranicTheme, TajweedRule 
} from '../data/quranInteractions';
import { getLocalizedVocab } from '../data/quranVocabularyTranslations';

interface QuranEnhancementsHubProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToVerse?: (surahNumber: number, ayahNumber: number) => void;
}

export const QuranEnhancementsHub: React.FC<QuranEnhancementsHubProps> = ({ 
  isOpen, 
  onClose, 
  onNavigateToVerse 
}) => {
  const [activeTab, setActiveTab] = useState<'themes' | 'vocabulary' | 'tajweed'>('themes');
  const { theme, fontSize, fontFamily } = useQuranSettings();
  const { settings } = useAppContext();
  
  // Search state for vocabulary
  const [vocabSearch, setVocabSearch] = useState('');
  
  // Selected detail modal states
  const [selectedVocab, setSelectedVocab] = useState<VocabularyWord | null>(null);
  const [activeTajweedId, setActiveTajweedId] = useState<string | null>('tajweed-md');
  const [selectedTheme, setSelectedTheme] = useState<QuranicTheme | null>(null);
  const { t, isRtl } = useTranslation(settings.appLanguage);

  if (!isOpen) return null;

  const isDark = theme === 'dark' || theme === 'slate';
  const isSepia = theme === 'sepia';
  
  const bgClasses = cn(
    "fixed inset-0 z-[220] flex items-center justify-center p-4 md:p-6",
    "bg-black/40 backdrop-blur-sm"
  );

  const containerClasses = cn(
    "relative w-full max-w-4xl h-[90vh] md:h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border transition-all duration-300",
    theme === 'light' ? 'bg-white border-slate-150 text-slate-900' :
    theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-100' :
    theme === 'sepia' ? 'bg-[#f4ecd8] border-[#e2d5b5] text-[#5b4636]' :
    theme === 'parchment' ? 'bg-[#e8dcc4] border-[#d4c1a5] text-[#4a3b2c]' :
    'bg-[#1e293b] border-slate-800 text-slate-100'
  );

  // Filter vocabulary
  const filteredVocab = quranVocabulary.filter(item => 
    item.word.includes(vocabSearch) || 
    item.meaning.includes(vocabSearch) || 
    item.surahName.includes(vocabSearch)
  );

  return (
    <div className={bgClasses} onClick={onClose} dir={isRtl ? 'rtl' : 'ltr'}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: "spring", damping: 25, stiffness: 220 }}
        className={containerClasses}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hub Header */}
        <div className="p-6 border-b border-black/5 dark:border-white/5 flex items-center justify-between shrink-0 bg-teal-600/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-600 dark:text-teal-400">
              <Sparkles size={22} className="animate-pulse" />
            </div>
            <div>
              <h2 className="font-black text-lg md:text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-teal-600 via-emerald-500 to-amber-500">
                {t('quran_vocab_hub_title')}
              </h2>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">
                {t('quran_vocab_hub_sub')}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Dynamic Navigation Tabs */}
        <div className="flex border-b border-black/5 dark:border-white/5 bg-slate-50/50 dark:bg-slate-950/20 px-6 pt-3 gap-2 shrink-0 overflow-x-auto scrollbar-none">
          {[
            { id: 'themes', label: t('thematic_index_tab'), icon: Compass, color: 'text-blue-500' },
            { id: 'vocabulary', label: t('quran_vocab_title'), icon: BookMarked, color: 'text-amber-500' },
            { id: 'tajweed', label: t('tajweed_guide_tab'), icon: Highlighter, color: 'text-emerald-500' }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-2 px-5 py-3.5 border-b-2 font-black text-sm transition-all whitespace-nowrap",
                  isActive 
                    ? "border-teal-600 text-teal-600 dark:text-teal-400 bg-teal-500/5 rounded-t-2xl" 
                    : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                )}
              >
                <Icon size={16} className={isActive ? tab.color : 'text-slate-400'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Master Content Area */}
        <div className="flex-grow overflow-y-auto p-6 custom-scrollbar">
          
          {/* TAB 1: Themes (الفهرس الموضوعي) */}
          {activeTab === 'themes' && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {!selectedTheme ? (
                <>
                  <div className="bg-gradient-to-br from-teal-500/10 to-emerald-500/5 rounded-2xl p-4 border border-teal-500/10">
                    <h3 className="font-black text-sm text-teal-700 dark:text-teal-400 flex items-center gap-2 mb-1">
                      <Compass size={16} />
                      التدبر عبر المحاور الكبرى للقرآن
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                      اختر أحد المواضيع الكبرى في القرآن الكريم لتستكشف الآيات الموصولة مباشرة بالمحور والتبحر في المقاصد السامية والدلالات التوحيدية والعملية.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {quranicThemes.map((themeItem) => {
                      return (
                        <div
                          key={themeItem.id}
                          onClick={() => setSelectedTheme(themeItem)}
                          className={cn(
                            "p-5 rounded-2xl border cursor-pointer transition-all duration-300 group relative overflow-hidden",
                            "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-teal-500/30 hover:shadow-xl hover:shadow-teal-500/5 hover:scale-[1.01]"
                          )}
                        >
                          <div className={cn("absolute top-0 right-0 w-24 h-24 bg-gradient-to-br opacity-5 rounded-full -mr-8 -mt-8")} />
                          <div className="flex items-start gap-4">
                            <div className={cn(
                              "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0 shadow-md",
                              themeItem.color
                            )}>
                              {themeItem.title.includes('العقيدة') && <Shield size={20} />}
                              {themeItem.title.includes('قصص') && <BookOpen size={20} />}
                              {themeItem.title.includes('الأخلاق') && <Layers size={20} />}
                              {themeItem.title.includes('اليوم') && <Compass size={20} />}
                              {themeItem.title.includes('العبادات') && <Compass size={20} />}
                            </div>
                            <div className="space-y-1.5 flex-grow">
                              <h4 className="font-black text-base group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">{themeItem.title}</h4>
                              <p className="text-xs text-slate-400 dark:text-slate-500 font-bold leading-relaxed">{themeItem.description}</p>
                              <div className="flex items-center gap-1.5 text-[10px] text-teal-600 dark:text-teal-400 font-black pt-2">
                                <span>عرض {themeItem.verses.length} آيات تدبرية</span>
                                <ChevronLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="space-y-6">
                  {/* Selected Theme Details */}
                  <div className="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/5">
                    <button 
                      onClick={() => setSelectedTheme(null)}
                      className="flex items-center gap-1 text-xs font-black text-slate-500 hover:text-teal-500 transition-colors bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-xl"
                    >
                      <ChevronLeft className="rotate-180" size={14} />
                      <span>العودة للمحاور الرئيسية</span>
                    </button>
                    <h3 className="font-black text-lg text-teal-600 dark:text-teal-400">{selectedTheme.title}</h3>
                  </div>

                  <div className="space-y-4">
                    {selectedTheme.verses.map((v, i) => (
                      <div 
                        key={i}
                        className="p-5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 relative group"
                      >
                        <div className="flex items-center justify-between mb-3 text-xs font-black">
                          <span className="text-teal-600 dark:text-teal-400 bg-teal-500/10 px-3 py-1 rounded-lg">
                            سورة {v.surahName} • آية {v.ayahNumber}
                          </span>
                          
                          {onNavigateToVerse && (
                            <button
                              onClick={() => {
                                onNavigateToVerse(v.surahNumber, v.ayahNumber);
                                onClose();
                              }}
                              className="text-[10px] text-white bg-teal-600 hover:bg-teal-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-md shadow-teal-600/10 cursor-pointer"
                            >
                              <BookOpen size={12} />
                              <span>انتقال للمصحف</span>
                            </button>
                          )}
                        </div>

                        {/* Verse Text */}
                        <p 
                          className="text-right text-lg md:text-xl font-bold leading-relaxed text-[#c2410c] dark:text-[#ff7a3b] py-3 border-b border-dashed border-black/5 dark:border-white/5"
                          style={{ fontFamily: fontFamily }}
                        >
                          {v.text}
                        </p>

                        {/* Theme Note (التدبر والتبويب الموضوعي) */}
                        {v.themeNote && (
                          <div className="mt-3 flex items-start gap-2.5 text-xs text-slate-500 dark:text-slate-400 font-bold leading-relaxed bg-white dark:bg-slate-800 p-3 rounded-xl border border-teal-500/5">
                            <div className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                            <div>
                              <span className="text-teal-600 dark:text-teal-400 font-black block mb-0.5">البيان والتدبر:</span>
                              {v.themeNote}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 2: Vocabulary (غريب ومفردات القرآن) */}
          {activeTab === 'vocabulary' && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 rounded-2xl p-4 border border-amber-500/10">
                <h3 className="font-black text-sm text-amber-700 dark:text-amber-400 flex items-center gap-2 mb-1">
                  <BookMarked size={16} />
                  {t('vocab_dictionary_title')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                  {t('vocab_dictionary_desc')}
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                  <Search size={18} />
                </div>
                <input 
                  type="text" 
                  placeholder={t('vocab_search_placeholder')} 
                  value={vocabSearch}
                  onChange={(e) => setVocabSearch(e.target.value)}
                  className="w-full p-3.5 pr-11 rounded-2xl outline-none border transition-all text-sm font-bold bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 focus:border-amber-500/50"
                />
              </div>

              {/* Vocabulary Bento Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {filteredVocab.map((item) => {
                  const localized = getLocalizedVocab(item.id, settings.appLanguage);
                  const displayMeaning = (settings.appLanguage !== 'ar' && localized) ? localized.meaning : item.meaning;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedVocab(item)}
                      className={cn(
                        "p-4 rounded-2xl border text-right transition-all group relative overflow-hidden transform duration-75 active:scale-[0.98]",
                        "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-amber-500/30 hover:shadow-lg hover:shadow-amber-500/5"
                      )}
                    >
                      <div className="absolute top-0 left-0 w-8 h-8 bg-amber-500/5 rounded-full -ml-3 -mt-3 group-hover:scale-150 transition-transform" />
                      <span className="text-[10px] font-black text-slate-400 block mb-1">سورة {item.surahName} : {item.ayahNumber}</span>
                      <span className="text-base font-black text-amber-600 dark:text-amber-400 block mb-1 group-hover:scale-105 transition-transform">{item.word}</span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold line-clamp-2 leading-relaxed">{displayMeaning}</span>
                    </button>
                  );
                })}

                {filteredVocab.length === 0 && (
                  <div className="col-span-full py-12 text-center text-slate-400">
                    {t('vocab_not_found')}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 3: Tajweed Guide (دليل قواعد التجويد التفاعلي) */}
          {activeTab === 'tajweed' && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 rounded-2xl p-4 border border-emerald-500/10">
                <h3 className="font-black text-sm text-emerald-700 dark:text-emerald-400 flex items-center gap-2 mb-1">
                  <Highlighter size={16} />
                  دليل دلالات الألوان في مصحف التجويد
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                  يساعدك مصحف التجويد الملون على تطبيق قواعد التلاوة الصحيحة تلقائياً بفضل تشفير القواعد بالألوان. انقر على أي قاعدة لفهم معناها ونطقها الصحيح مع أمثلة تفاعلية.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Left side list of rules */}
                <div className="space-y-2.5">
                  {tajweedRules.map((rule) => {
                    const isActive = activeTajweedId === rule.id;
                    return (
                      <button
                        key={rule.id}
                        onClick={() => setActiveTajweedId(rule.id)}
                        className={cn(
                          "w-full p-4 rounded-2xl border text-right transition-all duration-300 flex items-center justify-between group",
                          isActive 
                            ? "bg-emerald-500/10 border-emerald-500 text-emerald-800 dark:text-emerald-300 scale-[1.02] shadow-sm"
                            : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-emerald-500/30"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full border border-black/10 shrink-0 shadow-inner"
                            style={{ backgroundColor: rule.hexColor }}
                          />
                          <div>
                            <span className="font-black text-sm block leading-none">{rule.name}</span>
                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-1 block">اللون {rule.colorName}</span>
                          </div>
                        </div>
                        <ChevronLeft size={16} className={cn("text-slate-300 transition-transform", isActive && "translate-x-1 text-emerald-500")} />
                      </button>
                    );
                  })}
                </div>

                {/* Right side interactive playground detailing rule */}
                <div className="md:col-span-2 bg-black/5 dark:bg-white/5 p-6 rounded-3xl border border-black/5 dark:border-white/5 flex flex-col justify-between">
                  {(() => {
                    const rule = tajweedRules.find(r => r.id === activeTajweedId);
                    if (!rule) return null;
                    return (
                      <div className="space-y-6 flex-grow flex flex-col justify-between">
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                              style={{ backgroundColor: rule.hexColor }}
                            >
                              آ
                            </div>
                            <div>
                              <h4 className="font-black text-base">{rule.name}</h4>
                              <p className="text-xs font-bold text-slate-400">تطبيق تفاعلي بلون {rule.colorName}</p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 block uppercase tracking-widest">تعريف القاعدة</span>
                            <p className="text-xs text-slate-500 dark:text-slate-300 font-bold leading-relaxed">{rule.description}</p>
                          </div>

                          <div className="space-y-2 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-teal-500/5">
                            <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 block uppercase tracking-widest mb-1">كيفية تطبيقها وتتبع اللون</span>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{rule.explanation}</p>
                          </div>
                        </div>

                        {/* Interactive Examples */}
                        <div className="space-y-3 pt-4 border-t border-dashed border-black/5 dark:border-white/5">
                          <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 block uppercase tracking-widest">أمثلة نطق توضيحية</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {rule.examples.map((ex, idx) => (
                              <div 
                                key={idx}
                                className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-black/5 dark:border-white/5 flex items-center justify-between group/ex"
                              >
                                <div>
                                  <span className="text-sm font-black text-right block mb-0.5 text-orange-600 dark:text-orange-400">{ex.phrase}</span>
                                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block">{ex.explanation}</span>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 group-hover/ex:scale-110 transition-transform">
                                  <Volume2 size={14} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

              </div>
            </motion.div>
          )}

        </div>

        {/* Modal-overlay for Vocabulary Words Detail */}
        <AnimatePresence>
          {selectedVocab && (
            <div className="absolute inset-0 z-[230] bg-black/50 backdrop-blur-md flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                className={cn(
                  "w-full max-w-lg p-6 rounded-3xl border shadow-2xl relative",
                  theme === 'light' ? 'bg-white border-slate-100 text-slate-900' :
                  theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-100' :
                  theme === 'sepia' ? 'bg-[#f4ecd8] border-[#e2d5b5] text-[#5b4636]' :
                  theme === 'parchment' ? 'bg-[#e8dcc4] border-[#d4c1a5] text-[#4a3b2c]' :
                  'bg-[#1e293b] border-slate-800 text-slate-100'
                )}
              >
                <button 
                  onClick={() => setSelectedVocab(null)}
                  className="absolute top-4 left-4 p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>

                <div className="space-y-5">
                  {(() => {
                    const localized = getLocalizedVocab(selectedVocab.id, settings.appLanguage);
                    const meaning = (settings.appLanguage !== 'ar' && localized) ? localized.meaning : selectedVocab.meaning;
                    const impact = (settings.appLanguage !== 'ar' && localized) ? localized.impact : selectedVocab.impact;

                    return (
                      <>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                            <BookMarked size={18} />
                          </div>
                          <div>
                            <span className="text-[10px] font-black text-slate-400 block">{t('quran_vocab_title')}</span>
                            <h4 className="text-xl font-black text-amber-600 dark:text-amber-400">
                              {t('vocab_explanation_title')}: {selectedVocab.word}
                            </h4>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="p-4 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/5">
                            <span className="text-[10px] font-black text-slate-400 block mb-1">{t('vocab_context_ayah')}</span>
                            <p className="text-right text-base font-bold leading-relaxed text-[#c2410c] dark:text-[#ff7a3b]" style={{ fontFamily: fontFamily }}>
                              {selectedVocab.context}
                            </p>
                            <span className="text-[10px] text-teal-600 dark:text-teal-400 font-black block mt-1.5">
                              {t('surah_label') || 'سورة'} {selectedVocab.surahName} : {selectedVocab.ayahNumber}
                            </span>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[11px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest block">
                              {t('vocab_meaning_direct')}
                            </span>
                            <p className="text-xs text-slate-600 dark:text-slate-200 font-bold leading-relaxed">{meaning}</p>
                          </div>

                          <div className="space-y-1 pt-3 border-t border-dashed border-black/5 dark:border-white/5">
                            <span className="text-[11px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest block">
                              {t('vocab_spiritual_impact')}
                            </span>
                            <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold leading-relaxed">{impact}</p>
                          </div>
                        </div>

                        <div className="pt-2 flex justify-end gap-2">
                          {onNavigateToVerse && (
                            <button
                              onClick={() => {
                                onNavigateToVerse(selectedVocab.surahNumber, selectedVocab.ayahNumber);
                                setSelectedVocab(null);
                                onClose();
                              }}
                              className="w-full text-xs font-black py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-lg shadow-teal-600/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                              <BookOpen size={14} />
                              {t('vocab_navigate_read')}
                            </button>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </motion.div>
    </div>
  );
};
