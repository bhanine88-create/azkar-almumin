import { BackButton } from './ui/BackButton';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Book, BookOpen, Quote, Filter, ChevronRight, ChevronLeft, Share2, Palette, X, Type, SlidersHorizontal, Plus, Save, Trash2 } from 'lucide-react';
import { INSPIRATIONS, Inspiration } from '../data/inspirations';
import { cn, copyTextToClipboard, shareContent } from '../lib/utils';
import { useAppContext } from '../AppContext';
import { useTranslation } from '../i18n';
import { safeLocalStorageGetItem, safeLocalStorageSetItem, safeLocalStorageRemoveItem } from "../utils/storage";


const filters = [
  { id: 'all', name: 'الكل', icon: <Filter size={16} /> },
  { id: 'verse', name: 'قرآن كريم', icon: <Book size={16} /> },
  { id: 'hadith', name: 'حديث شريف', icon: <BookOpen size={16} /> },
  { id: 'wisdom', name: 'حكمة وموعظة', icon: <Quote size={16} /> }
] as const;

const FONTS = [
  { id: 'Amiri, serif', name: 'أميري' },
  { id: 'Cairo, sans-serif', name: 'كايرو' },
  { id: 'Tajawal, sans-serif', name: 'تجوّال' },
  { id: 'Aref Ruqaa, serif', name: 'رقعة' },
  { id: 'Reem Kufi, sans-serif', name: 'كوفي' },
  { id: 'Noto Naskh Arabic, serif', name: 'نسخ' },
  { id: 'Zain, sans-serif', name: 'زين' },
  { id: 'Alexandria, sans-serif', name: 'الإسكندرية' },
  { id: 'Scheherazade New, serif', name: 'شهرزاد' },
  { id: 'Lateef, serif', name: 'لطيف' },
  { id: 'El Messiri, sans-serif', name: 'المسيري' },
  { id: 'Lalezar, sans-serif', name: 'لاليزار' },
  { id: 'Marhey, sans-serif', name: 'مرحي' },
  { id: 'Rakkas, sans-serif', name: 'رقاص' },
  { id: 'Baloo Bhaijaan 2, sans-serif', name: 'بالو' },
  { id: 'Beiruti, sans-serif', name: 'بيروتي' }
];

const THEMES = [
  { id: 'dynamic', name: 'سحاب المساء', colors: 'from-slate-800 to-slate-900', accent: 'bg-slate-700' },
  { id: 'amber-rose', name: 'دفء الخريف', colors: 'from-amber-700 to-rose-900', accent: 'bg-rose-500' },
  { id: 'blue-indigo', name: 'أعماق المحيط', colors: 'from-blue-800 to-indigo-900', accent: 'bg-indigo-500' },
  { id: 'emerald-teal', name: 'خضرة الغابة', colors: 'from-emerald-800 to-teal-900', accent: 'bg-emerald-500' },
  { id: 'purple-fuchsia', name: 'سحر الأرجوان', colors: 'from-purple-800 to-fuchsia-900', accent: 'bg-fuchsia-500' },
  { id: 'rose-orange', name: 'شفق الغروب', colors: 'from-rose-800 to-orange-900', accent: 'bg-orange-500' }
];

interface CustomInspiration extends Inspiration {
  id: string;
  isCustom: boolean;
}

export const Inspirations: React.FC = () => {
  const { settings, updateSettings } = useAppContext();
  const { t } = useTranslation(settings.appLanguage);
  const [activeFilter, setActiveFilter] = useState<'all' | 'verse' | 'hadith' | 'wisdom'>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  
  const [customInspirations, setCustomInspirations] = useState<CustomInspiration[]>(() => {
    const saved = safeLocalStorageGetItem('believer_custom_inspirations_v2');
    return saved ? JSON.parse(saved) : [];
  });

  const [newEntry, setNewEntry] = useState<{text: string, source: string, type: 'verse' | 'hadith' | 'wisdom'}>({
    text: '',
    source: '',
    type: 'wisdom'
  });

  const allInspirations = React.useMemo(() => {
    const base = INSPIRATIONS.map((i, idx) => ({ ...i, id: `base-${idx}`, isCustom: false }));
    
    const verses = base.filter(item => item.type === 'verse');
    const hadiths = base.filter(item => item.type === 'hadith');
    const wisdoms = base.filter(item => item.type === 'wisdom');
    
    const interleavedBase: typeof base = [];
    const maxLength = Math.max(verses.length, hadiths.length, wisdoms.length);
    for (let i = 0; i < maxLength; i++) {
      if (i < verses.length) interleavedBase.push(verses[i]);
      if (i < hadiths.length) interleavedBase.push(hadiths[i]);
      if (i < wisdoms.length) interleavedBase.push(wisdoms[i]);
    }
    
    return [...customInspirations, ...interleavedBase];
  }, [customInspirations]);

  const filteredInspirations = React.useMemo(() => 
    activeFilter === 'all' 
      ? allInspirations 
      : allInspirations.filter(i => i.type === activeFilter),
    [allInspirations, activeFilter]
  );

  const [animationKey, setAnimationKey] = useState(0);

  // Reset index when filter changes
  useEffect(() => {
    setCurrentIndex(0);
    setAnimationKey(prev => prev + 1);
  }, [activeFilter]);

  const handleNext = () => {
    if (currentIndex < filteredInspirations.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setAnimationKey(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setAnimationKey(prev => prev + 1);
    }
  };

  const handleAddEntry = () => {
    if (!newEntry.text.trim() || !newEntry.source.trim()) return;
    
    const newItem: CustomInspiration = {
      ...newEntry,
      id: `custom-${Date.now()}`,
      isCustom: true
    };
    
    const updated = [newItem, ...customInspirations];
    setCustomInspirations(updated);
    safeLocalStorageSetItem('believer_custom_inspirations_v2', JSON.stringify(updated));
    
    setNewEntry({ text: '', source: '', type: 'wisdom' });
    setIsAddOpen(false);
    setCurrentIndex(0);
    setActiveFilter('all');
  };

  const handleDeleteCustom = (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا القبس؟')) return;
    const updated = customInspirations.filter(i => i.id !== id);
    setCustomInspirations(updated);
    safeLocalStorageSetItem('believer_custom_inspirations_v2', JSON.stringify(updated));
    if (currentIndex >= updated.length + (INSPIRATIONS.length)) {
        setCurrentIndex(0);
    }
  };

  const handleShare = async () => {
    const item = filteredInspirations[currentIndex];
    if (!item) return;

    const shareText = `✨ *قبس إيماني* ✨\n\n"${item.text}"\n\n— ${item.source}\n\n— تطبيق أذكار المؤمن`;
    
    await shareContent('قبس إيماني', shareText);
  };

  const currentItem = filteredInspirations[currentIndex];

  const selectedTheme = THEMES.find(t => t.id === (settings.inspirationTheme || 'dynamic')) || THEMES[0];
  const cardGradient = selectedTheme.colors;

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col overflow-hidden">
      {/* Header Area */}
      <div className="relative bg-slate-900 pt-6 pb-20 px-6 shrink-0 rounded-b-3xl shadow-xl">
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/arabesque.png')" }} />
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 blur-[100px] -mr-32 -mt-32 rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-fuchsia-600/10 blur-[100px] -ml-32 -mb-32 rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-row-reverse items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex flex-col text-right">
              <h1 className="text-2xl font-black text-white drop-shadow-md">قبسات إيمانية</h1>
              <p className="text-rose-300 text-xs font-bold mt-1 uppercase tracking-widest opacity-80">إضاءات لروحك وعقلك</p>
            </div>
            
            <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsAddOpen(true)}
                  className="group w-10 h-10 rounded-full bg-rose-500/20 hover:bg-rose-500/40 transform transition-all duration-75 active:scale-[0.85] active:opacity-70 flex items-center justify-center text-rose-300 border border-rose-500/30 backdrop-blur-md shadow-lg"
                  title="إضافة قبس جديد"
                >
                  <Plus size={20} className="transition-transform duration-200 group-hover:rotate-90" />
                </button>
                <button 
                  onClick={() => setIsSettingsOpen(true)}
                  className="group w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transform transition-all duration-75 active:scale-[0.85] active:opacity-70 flex items-center justify-center text-white border border-white/10 backdrop-blur-md shadow-lg"
                >
                  <SlidersHorizontal size={20} className="transition-transform duration-500 group-hover:rotate-90 group-hover:scale-110" />
                </button>
            </div>
          </div>
          
          <BackButton />
        </div>
      </div>

      {/* Filters Overlay */}
      <div className="relative -mt-10 px-4 z-20 shrink-0">
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl p-2 shadow-lg border border-slate-200 dark:border-slate-800 flex justify-between gap-1 rtl">
          {filters.map((filter) => {
            const isActive = activeFilter === filter.id;
            return (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id as any)}
                className={cn(
                  "flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-xl transition-all duration-300 relative overflow-hidden",
                  isActive ? "text-white shadow-md" : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-inspiration-tab"
                    className="absolute inset-0 bg-gradient-to-br from-amber-500 to-amber-700"
                    initial={false}
                    transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                  />
                )}
                <div className="relative z-10">
                  {filter.icon}
                </div>
                <span className="relative z-10 text-[10px] sm:text-xs font-bold">{filter.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Cards Area */}
      <div className="flex-1 px-5 pt-8 pb-10 flex flex-col relative z-10 h-full justify-center">
        {filteredInspirations.length > 0 ? (
          <div className="w-full max-w-sm mx-auto relative flex-1 min-h-[350px] sm:min-h-[400px] flex items-center justify-center mt-4">
            
            {/* Background Stack Illusion */}
            {currentIndex < filteredInspirations.length - 1 && (
              <div className={cn("absolute inset-0 top-[20px] scale-95 opacity-50 bg-gradient-to-br rounded-[2rem] shadow-xl border border-white/10 blur-[2px] -z-10", cardGradient)} />
            )}
            {currentIndex < filteredInspirations.length - 2 && (
              <div className={cn("absolute inset-0 top-[40px] scale-90 opacity-20 bg-gradient-to-br rounded-[2rem] shadow-lg border border-white/10 blur-[4px] -z-20", cardGradient)} />
            )}

            {/* Main Interactive Card */}
            <AnimatePresence>
              {currentItem && (
                <motion.div
                  key={`${currentItem.id}-${currentIndex}-${animationKey}`}
                  initial={{ opacity: 0, x: 50, scale: 0.9, rotateY: -10 }}
                  animate={{ opacity: 1, x: 0, scale: 1, rotateY: 0 }}
                  exit={{ opacity: 0, x: -50, scale: 0.9, rotateY: 10 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className={cn(
                    "w-full absolute inset-0 bg-gradient-to-br rounded-[2rem] p-8 shadow-2xl border border-white/10 flex flex-col justify-between overflow-hidden",
                    cardGradient
                  )}
                >
                  {/* Decorative Elements */}
                  <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                  <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                  <Quote size={80} className="text-white/10 absolute top-4 right-4 rotate-12" />

                  <div className="flex-1 flex flex-col items-center justify-center relative z-10">
                    <p 
                        className="text-2xl sm:text-3xl font-bold text-white shadow-sm leading-[1.8] text-center" 
                        style={{ fontFamily: settings.inspirationFont || 'Amiri, serif' }}
                    >
                      "{currentItem.text}"
                    </p>
                  </div>

                  <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between relative z-10 w-full">
                    <div className="flex items-center gap-2">
                        <button 
                          onClick={handleShare}
                          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                        >
                          <Share2 size={18} />
                        </button>
                        {(currentItem as CustomInspiration).isCustom && (
                            <button 
                                onClick={() => handleDeleteCustom(currentItem.id)}
                                className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-200 hover:bg-rose-500/40 transition-colors"
                            >
                                <Trash2 size={18} />
                            </button>
                        )}
                    </div>

                    <div className="bg-white/15 backdrop-blur-md px-4 py-2 rounded-full inline-flex items-center gap-2 border border-white/10 shadow-sm transform transition-all duration-75 active:scale-[0.95] active:opacity-80">
                      {currentItem.type === 'verse' && (
                        <>
                          <Book size={14} className="text-amber-300" />
                          <span className="text-[10px] sm:text-xs font-black text-amber-300">قرآن كريم • </span>
                        </>
                      )}
                      {currentItem.type === 'hadith' && (
                        <>
                          <BookOpen size={14} className="text-blue-300" />
                          <span className="text-[10px] sm:text-xs font-black text-blue-300">حديث شريف • </span>
                        </>
                      )}
                      {currentItem.type === 'wisdom' && (
                        <>
                          <Quote size={14} className="text-emerald-300" />
                          <span className="text-[10px] sm:text-xs font-black text-emerald-300">حكمة وموعظة • </span>
                        </>
                      )}
                      <span className="text-xs font-black tracking-wide text-white">
                        {currentItem.source}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Smart Navigation Arrows */}
            <button
              onClick={handleNext}
              disabled={currentIndex >= filteredInspirations.length - 1}
              aria-label="التالي"
              className="absolute -left-4 sm:-left-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/95 dark:bg-slate-800/95 backdrop-blur-md flex items-center justify-center text-slate-800 dark:text-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white dark:border-slate-700 disabled:opacity-30 disabled:scale-95 disabled:hover:scale-95 hover:scale-110 transform transition-all duration-75 active:scale-[0.85] active:opacity-70 z-30 cursor-pointer"
            >
              <ChevronLeft size={28} />
            </button>
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              aria-label="السابق"
              className="absolute -right-4 sm:-right-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/95 dark:bg-slate-800/95 backdrop-blur-md flex items-center justify-center text-slate-800 dark:text-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white dark:border-slate-700 disabled:opacity-30 disabled:scale-95 disabled:hover:scale-95 hover:scale-110 transform transition-all duration-75 active:scale-[0.85] active:opacity-70 z-30 cursor-pointer"
            >
              <ChevronRight size={28} />
            </button>

          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-slate-400">
              <Sparkles size={48} className="mb-4 opacity-50" />
              <p className="font-bold text-center">لا توجد قبسات إيمانية في هذا القسم. أضف قبسك الخاص الآن!</p>
              <button 
                onClick={() => setIsAddOpen(true)}
                className="mt-4 px-6 py-2 rounded-full bg-rose-600 hover:bg-rose-500 transition-colors text-white font-bold flex items-center gap-2 shadow-lg shadow-rose-600/30"
              >
                <Plus size={18} /> إضافة قبس
              </button>
          </div>
        )}

        {/* Pagination Indicator */}
        {filteredInspirations.length > 0 && (
          <div className="flex items-center justify-center mt-8 shrink-0 relative z-20">
            <div className="text-sm font-bold text-slate-500 dark:text-slate-400 font-mono tracking-widest bg-white/50 dark:bg-slate-800/50 px-4 py-2 rounded-full backdrop-blur-sm border border-slate-200 dark:border-slate-700 transform transition-all duration-75 active:scale-[0.95] active:opacity-80">
              {currentIndex + 1} / {filteredInspirations.length}
            </div>
          </div>
        )}
      </div>

      {typeof document !== 'undefined' && createPortal(
        <>
          {/* Add Inspiration Modal */}
          <AnimatePresence>
        {isAddOpen && (
            <>
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsAddOpen(false)}
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100]"
                />
                <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                    className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-950 rounded-t-[2.5rem] p-8 pb-12 z-[101] shadow-2xl border-t border-slate-200 dark:border-slate-800 overflow-y-auto max-h-[90vh]"
                >
                    <div className="w-12 h-1.2 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mb-8" />
                    
                    <div className="flex items-center justify-between rtl mb-8">
                        <button onClick={() => setIsAddOpen(false)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500">
                            <X size={20} />
                        </button>
                        <div className="text-right">
                            <h3 className="font-black text-2xl dark:text-white">إضافة قبس جديد</h3>
                            <p className="text-xs text-slate-400 font-bold mt-1">شاركنا ما يلامس قلبك</p>
                        </div>
                    </div>

                    <div className="space-y-6 rtl">
                        <div className="grid grid-cols-3 gap-2">
                            {filters.filter(f => f.id !== 'all').map(category => (
                                <button
                                    key={category.id}
                                    onClick={() => setNewEntry(prev => ({ ...prev, type: category.id as any }))}
                                    className={cn(
                                        "flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all",
                                        newEntry.type === category.id 
                                            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400" 
                                            : "border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-400"
                                    )}
                                >
                                    {category.icon}
                                    <span className="text-xs font-bold">{category.name}</span>
                                </button>
                            ))}
                        </div>

                        <div className="space-y-2">
                             <label className="text-xs font-black text-slate-500 uppercase tracking-widest mr-2">نص القبس</label>
                             <textarea 
                                value={newEntry.text}
                                onChange={(e) => setNewEntry(prev => ({ ...prev, text: e.target.value }))}
                                placeholder="اكتب القبس هنا..."
                                className="w-full h-32 px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 focus:border-emerald-500 outline-none transition-all text-slate-800 dark:text-white font-bold resize-none"
                             />
                        </div>

                        <div className="space-y-2">
                             <label className="text-xs font-black text-slate-500 uppercase tracking-widest mr-2">المصدر أو الكاتب</label>
                             <input 
                                type="text"
                                value={newEntry.source}
                                onChange={(e) => setNewEntry(prev => ({ ...prev, source: e.target.value }))}
                                placeholder="مثال: سورة البقرة، حديث شريف، ابن القيم..."
                                className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 focus:border-emerald-500 outline-none transition-all text-slate-800 dark:text-white font-bold"
                             />
                        </div>

                        <button
                            onClick={handleAddEntry}
                            disabled={!newEntry.text.trim() || !newEntry.source.trim()}
                            className="w-full py-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:grayscale transition-all text-white font-black text-lg shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 mt-4"
                        >
                            <Save size={20} />
                            حفظ القبس
                        </button>
                    </div>
                </motion.div>
            </>
        )}
      </AnimatePresence>

      {/* Settings Modal (Appearance) */}
      <AnimatePresence>
        {isSettingsOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSettingsOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-950 rounded-t-[2.5rem] p-8 pb-12 z-[101] shadow-2xl border-t border-slate-200 dark:border-slate-800 overflow-y-auto max-h-[90vh]"
            >
              <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mb-6 shrink-0" />
              
              <div className="flex items-center justify-between mb-6 border-b border-slate-100 dark:border-slate-800/60 pb-4 shrink-0" dir="rtl">
                <button 
                  onClick={() => setIsSettingsOpen(false)} 
                  className="p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer outline-none border border-slate-200/60 dark:border-slate-800/80 shadow-sm"
                  aria-label="إغلاق"
                >
                  <X size={20} />
                </button>
                <h3 className="font-black text-xl text-slate-800 dark:text-white">تخصيص المظهر</h3>
              </div>
              
              <div className="space-y-6 rtl">
                {/* Themes */}
                <div>
                  <h4 className="flex items-center gap-2 font-bold mb-3 text-slate-700 dark:text-slate-300">
                    <Palette size={16} /> سمة الألوان
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                    {THEMES.map(theme => (
                      <button
                        key={theme.id}
                        onClick={() => updateSettings({ inspirationTheme: theme.id })}
                        className={cn(
                          "py-2 sm:py-3 px-3 rounded-xl border flex flex-col items-center gap-2 sm:gap-3 transition-all",
                          settings.inspirationTheme === theme.id 
                            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 shadow-md ring-1 ring-emerald-500" 
                            : "border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 shadow-sm"
                        )}
                      >
                        <div className={cn("w-6 sm:w-8 h-6 sm:h-8 rounded-full shadow-inner", theme.accent)} />
                        <span className="text-xs sm:text-sm font-bold truncate max-w-full">{theme.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fonts */}
                <div>
                  <h4 className="flex items-center gap-2 font-bold mb-3 text-slate-700 dark:text-slate-300">
                    <Type size={16} /> نوع الخط
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                    {FONTS.map(font => (
                      <button
                        key={font.id}
                        onClick={() => updateSettings({ inspirationFont: font.id })}
                        className={cn(
                          "py-3 sm:py-4 px-2 rounded-xl border transition-all text-sm sm:text-base font-bold shadow-sm",
                          settings.inspirationFont === font.id 
                            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 shadow-md ring-1 ring-emerald-500" 
                            : "border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400"
                        )}
                        style={{ fontFamily: font.id }}
                      >
                        {font.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      </>,
      document.body
    )}

    </div>
  );
};
