import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, ScrollText, RefreshCw, Sparkles } from 'lucide-react';
import { useTranslation } from '../i18n';
import { useAppContext } from '../AppContext';
import { INSPIRATIONS } from '../data/inspirations';
import { cn } from '../lib/utils';

export const DailyAyahDhikrWidget: React.FC = () => {
  const { settings } = useAppContext();
  const { t, isRtl } = useTranslation(settings.appLanguage);
  
  const [ayah, setAyah] = useState<{ text: string; source: string } | null>(null);
  const [hadith, setHadith] = useState<{ text: string; source: string } | null>(null);
  
  const [activeTab, setActiveTab] = useState<'ayah' | 'hadith'>('ayah');
  const [isAnimating, setIsAnimating] = useState(false);

  const getRandomItem = (items: any[], currentText?: string) => {
    if (items.length === 0) return null;
    if (items.length === 1) return items[0];
    
    let newItem = items[Math.floor(Math.random() * items.length)];
    while (currentText && newItem.text === currentText) {
      newItem = items[Math.floor(Math.random() * items.length)];
    }
    return newItem;
  };

  const updateDailyContent = useCallback(() => {
    const verses = INSPIRATIONS.filter(item => item.type === 'verse');
    const hadiths = INSPIRATIONS.filter(item => item.type === 'hadith');
    
    if (verses.length > 0) setAyah(getRandomItem(verses));
    if (hadiths.length > 0) setHadith(getRandomItem(hadiths));
  }, []);

  const getNextContent = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsAnimating(true);
    
    setTimeout(() => {
      if (activeTab === 'ayah') {
        const verses = INSPIRATIONS.filter(item => item.type === 'verse');
        setAyah(getRandomItem(verses, ayah?.text));
      } else {
        const hadiths = INSPIRATIONS.filter(item => item.type === 'hadith');
        setHadith(getRandomItem(hadiths, hadith?.text));
      }
      setIsAnimating(false);
    }, 200); // Small delay for exit animation
  };

  useEffect(() => {
    updateDailyContent();
  }, [updateDailyContent]);

  if (!ayah || !hadith) return null;

  const currentContent = activeTab === 'ayah' ? ayah : hadith;

  return (
    <motion.div 
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
      }}
      className="px-1 relative"
    >
      <div className={cn(
        "w-full relative rounded-3xl overflow-hidden shadow-xl border p-4 transition-colors duration-700 group",
        activeTab === 'ayah' 
          ? "bg-gradient-to-br from-teal-900 via-emerald-800 to-teal-950 border-emerald-500/30 shadow-emerald-900/20"
          : "bg-gradient-to-br from-amber-900 via-orange-800 to-amber-950 border-amber-500/30 shadow-amber-900/20",
        isRtl ? "text-right" : "text-left"
      )}>
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 opacity-[0.05] mix-blend-overlay pointer-events-none" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/arabesque.png')" }} />
        
        <div className={cn(
          "absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl pointer-events-none transition-colors duration-700 mix-blend-screen opacity-50",
          activeTab === 'ayah' ? "bg-emerald-400/20" : "bg-amber-400/20"
        )} />
        <div className={cn(
          "absolute -bottom-20 -left-20 w-64 h-64 rounded-full blur-3xl pointer-events-none transition-colors duration-700 mix-blend-screen opacity-50",
          activeTab === 'ayah' ? "bg-teal-400/20" : "bg-orange-400/20"
        )} />

        <div className="relative z-10 flex flex-col h-[180px] justify-between">
          
          {/* Header Controls */}
          <div className="flex items-center justify-between mb-2">
            <div className={cn("flex items-center gap-2 bg-black/20 backdrop-blur-md p-1 rounded-2xl border border-white/10", isRtl ? "flex-row" : "flex-row-reverse")}>
              <button
                onClick={() => setActiveTab('ayah')}
                className={cn(
                  "px-4 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-1.5",
                  activeTab === 'ayah' 
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25" 
                    : "text-emerald-100/50 hover:text-emerald-100/80"
                )}
              >
                <BookOpen size={14} />
                <span>{t('quranic_verses')}</span>
              </button>
              <button
                onClick={() => setActiveTab('hadith')}
                className={cn(
                  "px-4 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-1.5",
                  activeTab === 'hadith' 
                    ? "bg-amber-500 text-white shadow-lg shadow-amber-500/25" 
                    : "text-amber-100/50 hover:text-amber-100/80"
                )}
              >
                <ScrollText size={14} />
                <span>{t('prophetic_hadiths')}</span>
              </button>
            </div>

            {/* Refresh Button */}
            <button 
              onClick={getNextContent}
              disabled={isAnimating}
              className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 transition-all duration-300 shadow-sm active:scale-95 disabled:opacity-50",
                activeTab === 'ayah' 
                  ? "bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/40 hover:border-emerald-400/50" 
                  : "bg-amber-500/20 text-amber-100 hover:bg-amber-500/40 hover:border-amber-400/50"
              )}
            >
              <RefreshCw size={16} className={cn(isAnimating && "animate-spin")} />
            </button>
          </div>
          
          {/* Content Area */}
          <div className="flex-1 flex flex-col justify-center items-center text-center relative mt-2 px-2">
            <AnimatePresence mode="wait">
              {!isAnimating && (
                <motion.div
                  key={currentContent.text}
                  initial={{ opacity: 0, y: 15, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -15, scale: 0.98 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="w-full flex flex-col items-center"
                >
                  <Sparkles size={16} className={cn(
                    "mb-3 opacity-60",
                    activeTab === 'ayah' ? "text-emerald-300" : "text-amber-300"
                  )} />
                  <p className={cn(
                    "text-lg sm:text-xl font-bold text-white leading-relaxed drop-shadow-md",
                    isRtl ? "font-amiri" : "font-sans"
                  )}>
                    "{currentContent.text}"
                  </p>
                  
                  <div className="mt-4 flex items-center justify-center w-full">
                    <div className={cn(
                      "h-px flex-1 max-w-[40px] opacity-30",
                      activeTab === 'ayah' ? "bg-emerald-200" : "bg-amber-200"
                    )} />
                    <p className={cn(
                      "px-3 text-[10px] sm:text-xs font-bold uppercase tracking-widest opacity-90",
                      activeTab === 'ayah' ? "text-emerald-200" : "text-amber-200"
                    )}>
                      {currentContent.source}
                    </p>
                    <div className={cn(
                      "h-px flex-1 max-w-[40px] opacity-30",
                      activeTab === 'ayah' ? "bg-emerald-200" : "bg-amber-200"
                    )} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </motion.div>
  );
};
