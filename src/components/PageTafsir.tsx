import React, { useState, useEffect } from 'react';
import { BookOpen, ChevronUp, Loader2, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export const PageTafsir = ({ pageNum, theme = "light", compact = false }: { pageNum: number; theme?: string; compact?: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tafsir, setTafsir] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('large');

  const sizeClasses = {
    normal: {
      title: "text-xs font-bold",
      body: "text-sm sm:text-base leading-relaxed",
    },
    large: {
      title: "text-sm sm:text-base font-bold",
      body: "text-base sm:text-lg md:text-xl leading-loose",
    },
    xlarge: {
      title: "text-base sm:text-lg font-bold",
      body: "text-lg sm:text-xl md:text-2xl leading-loose",
    },
  };

  // Match the exact page color palette of the Quran mushaf page for flawless visual consistency
  const themeColors = {
    creamyNight: {
      bg: "bg-[#25211d]",
      cardBg: "bg-[#1f1b17]",
      text: "text-[#e8dac1]",
      heading: "text-amber-500",
      subtext: "text-[#e8dac1]/70",
      border: "border-[#3d332a]",
      btnHover: "hover:bg-white/5",
    },
    sepia: {
      bg: "bg-[#f4ebd0]",
      cardBg: "bg-[#ede2c4]",
      text: "text-[#5b4636]",
      heading: "text-[#8c6d4f]",
      subtext: "text-[#5b4636]/70",
      border: "border-[#e2d5b5]",
      btnHover: "hover:bg-black/5",
    },
    parchment: {
      bg: "bg-[#e8dcc4]",
      cardBg: "bg-[#dfd1b6]",
      text: "text-[#4a3b2c]",
      heading: "text-[#7c5b3f]",
      subtext: "text-[#4a3b2c]/70",
      border: "border-[#d4c1a5]",
      btnHover: "hover:bg-black/5",
    },
    sand: {
      bg: "bg-[#f3ead3]",
      cardBg: "bg-[#eadebf]",
      text: "text-[#5c4d3c]",
      heading: "text-[#8d7155]",
      subtext: "text-[#5c4d3c]/70",
      border: "border-[#e2d5b5]",
      btnHover: "hover:bg-black/5",
    },
    slate: {
      bg: "bg-[#1e293b]",
      cardBg: "bg-[#0f172a]",
      text: "text-[#cbd5e1]",
      heading: "text-teal-400",
      subtext: "text-slate-400",
      border: "border-slate-800",
      btnHover: "hover:bg-white/5",
    },
    dark: {
      bg: "bg-slate-900",
      cardBg: "bg-slate-950",
      text: "text-slate-100",
      heading: "text-teal-400",
      subtext: "text-slate-400",
      border: "border-slate-800",
      btnHover: "hover:bg-white/5",
    },
    light: {
      bg: "bg-white",
      cardBg: "bg-slate-50",
      text: "text-slate-800",
      heading: "text-teal-600",
      subtext: "text-slate-500",
      border: "border-slate-200",
      btnHover: "hover:bg-black/5",
    },
  };

  const currentTheme = themeColors[theme as keyof typeof themeColors] || themeColors.light;

  useEffect(() => {
    if (isOpen && !tafsir) {
      setLoading(true);
      fetch(`https://api.alquran.cloud/v1/page/${pageNum}/ar.muyassar`)
        .then(res => res.json())
        .then(data => {
          if (data.code === 200) {
            setTafsir(data.data.ayahs);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, pageNum, tafsir]);

  return (
    <>
      {/* Inline Trigger Button under page */}
      {compact ? (
        <div className="flex items-center justify-center my-0.5">
          <button
            onClick={() => setIsOpen(true)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border shadow-xs transition-all hover:scale-105 active:scale-95",
              currentTheme.cardBg,
              currentTheme.border,
              currentTheme.heading,
              currentTheme.btnHover
            )}
          >
            <BookOpen size={13} />
            <span>تفسير ص {pageNum}</span>
            <ChevronUp size={13} />
          </button>
        </div>
      ) : (
        <div className={cn(
          "w-full rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-300 border shadow-xs",
          currentTheme.cardBg,
          currentTheme.border
        )}>
          <button 
            onClick={() => setIsOpen(true)}
            className={cn(
              "w-full flex items-center justify-between px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-bold transition-colors",
              currentTheme.heading,
              currentTheme.btnHover
            )}
          >
            <div className="flex items-center gap-2">
              <BookOpen size={16} />
              <span>شرح ومعاني كلمات الصفحة {pageNum}</span>
            </div>
            <ChevronUp size={16} />
          </button>
        </div>
      )}

      {/* Floating Bottom Sheet Overlay (Appears on top of / فوق the page) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            key="page-tafsir-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4" 
            dir="rtl"
          >
            {/* Backdrop */}
            <div 
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Bottom Sheet Card */}
            <motion.div 
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 26, stiffness: 280 }}
              className={cn(
                "relative z-10 w-full max-w-2xl rounded-t-3xl sm:rounded-3xl border shadow-2xl overflow-hidden max-h-[82vh] sm:max-h-[80vh] flex flex-col",
                currentTheme.bg,
                currentTheme.border,
                currentTheme.text
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className={cn(
                "flex items-center justify-between px-5 py-3.5 border-b shrink-0",
                currentTheme.border
              )}>
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <h3 className={cn("font-bold text-base sm:text-lg", currentTheme.heading)}>
                      شرح ومعاني كلمات الصفحة {pageNum}
                    </h3>
                  </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "p-2 rounded-full transition-colors",
                    currentTheme.btnHover,
                    currentTheme.subtext
                  )}
                  aria-label="إغلاق"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Font Controls & Scrollable Tafsir Content */}
              <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar flex-1 space-y-4">
                {/* Font Size Switcher */}
                <div className={cn("flex items-center justify-between pb-3 border-b border-dashed border-slate-500/20 text-xs", currentTheme.border)}>
                  <span className={cn("font-medium", currentTheme.subtext)}>حجم الخط:</span>
                  <div className="flex items-center gap-1.5" dir="ltr">
                    <button 
                      onClick={() => setFontSize('normal')}
                      className={cn(
                        "px-3 py-1 rounded-lg text-xs font-semibold transition-all border",
                        fontSize === 'normal' 
                          ? "bg-teal-500/10 border-teal-500/40 text-teal-600 dark:text-teal-400 font-bold" 
                          : cn(currentTheme.border, currentTheme.subtext, currentTheme.btnHover)
                      )}
                    >
                      A
                    </button>
                    <button 
                      onClick={() => setFontSize('large')}
                      className={cn(
                        "px-3 py-1 rounded-lg text-sm font-semibold transition-all border",
                        fontSize === 'large' 
                          ? "bg-teal-500/15 border-teal-500/50 text-teal-600 dark:text-teal-400 font-bold" 
                          : cn(currentTheme.border, currentTheme.subtext, currentTheme.btnHover)
                      )}
                    >
                      A+
                    </button>
                    <button 
                      onClick={() => setFontSize('xlarge')}
                      className={cn(
                        "px-3 py-1 rounded-lg text-base font-semibold transition-all border",
                        fontSize === 'xlarge' 
                          ? "bg-teal-500/20 border-teal-500/60 text-teal-600 dark:text-teal-400 font-bold" 
                          : cn(currentTheme.border, currentTheme.subtext, currentTheme.btnHover)
                      )}
                    >
                      A++
                    </button>
                  </div>
                </div>

                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12 text-teal-500 gap-3">
                    <Loader2 size={32} className="animate-spin" />
                    <p className="text-sm font-medium">جاري تحميل الشرح والكلمات...</p>
                  </div>
                ) : tafsir ? (
                  <div className="space-y-4 text-right">
                    {tafsir.map((ayah, idx) => (
                      <div key={idx} className="space-y-1.5 pb-3 border-b border-slate-500/10 last:border-0 last:pb-0">
                        <div className={cn("font-black text-red-600 dark:text-red-400", sizeClasses[fontSize].title)}>
                          {ayah.surah.name} - الآية {ayah.numberInSurah}
                        </div>
                        <p className={cn("font-medium", sizeClasses[fontSize].body, currentTheme.text)}>
                          {ayah.text}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={cn("text-center text-sm py-8", currentTheme.subtext)}>تعذر تحميل التفسير.</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
