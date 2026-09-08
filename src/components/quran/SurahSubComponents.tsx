import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, Settings2, BookOpen, Volume2, BrainCircuit, Palette, AlignRight, Check,    Lightbulb,   Sparkles,  Play, Pause, Copy, Share2 } from 'lucide-react';
import { cn } from '../../lib/utils';

// Memoized Settings Modal for Surah Detail
export const SettingsModal = React.memo(({ 
  isOpen, 
  onClose, 
  t, 
  activeTab, 
  setActiveTab, 
  theme, 
  themeClasses,
  mushafEdition,
  setMushafEdition,
  keepScreenAwake,
  setKeepScreenAwake,
}: any) => {
  if (!isOpen) return null;

  const modal = (
    <div
      className="fixed inset-0 bg-black/60 z-[200] flex items-end sm:items-center justify-center overflow-hidden"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className={cn(
          "w-full sm:max-w-xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col bg-white dark:bg-slate-900",
          "sm:rounded-2xl rounded-t-2xl sm:mb-8",
          themeClasses[theme],
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-black/5 dark:border-white/5 flex justify-between items-center shrink-0 bg-white dark:bg-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
              <Settings2 size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 dark:text-slate-100">
                {t("settings")}
              </h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {t("appearance")}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-rose-500 text-white rounded-full flex items-center justify-center hover:bg-rose-600 transform transition-all duration-75 active:scale-[0.85] active:opacity-70 shadow-lg shadow-rose-500/20"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto custom-scrollbar-hide border-b border-black/5 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/50 px-4 pt-4 gap-2 shrink-0">
          {[
            { id: "reading", label: "القراءة", icon: BookOpen },
            { id: "audio", label: "الصوتيات", icon: Volume2 },
            { id: "memorization", label: "الحفظ", icon: BrainCircuit },
            { id: "appearance", label: "المظهر", icon: Palette },
            { id: "tafsir", label: "التفسير", icon: AlignRight },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 border-b-2 font-bold text-sm transition-all whitespace-nowrap",
                  activeTab === tab.id
                    ? "border-teal-600 text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 rounded-t-xl"
                    : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300",
                )}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-grow bg-white dark:bg-slate-800 min-h-[0] pb-24">
          {activeTab === "reading" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="space-y-3">
                <label className="text-xs font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest">
                  نسخة المصحف
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { id: "hafs", name: t("mushaf_hafs"), desc: "مصحف المدينة الكلاسيكي" },
                    { id: "tajweed", name: t("mushaf_tajweed"), desc: "ملون لمساعدة القارئ" },
                  ].map((ed: any) => (
                    <button
                      key={ed.id}
                      onClick={() => setMushafEdition(ed.id)}
                      className={cn(
                        "p-4 rounded-2xl border-2 transition-all flex flex-col items-start gap-1 text-right relative overflow-hidden group",
                        mushafEdition === ed.id
                          ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300"
                          : "border-slate-100 dark:border-slate-800 hover:border-teal-200 bg-white dark:bg-slate-900",
                      )}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-black text-sm">{ed.name}</span>
                        {mushafEdition === ed.id && <Check size={14} className="text-teal-600 shrink-0" />}
                      </div>
                      <span className="text-[10px] font-bold opacity-60">{ed.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-colors", keepScreenAwake ? "bg-teal-500/10 text-teal-600 dark:text-teal-400" : "bg-slate-200 dark:bg-slate-800 text-slate-500")}>
                      <Lightbulb size={20} />
                    </div>
                    <div>
                      <span className="font-black text-sm block dark:text-white">إبقاء الشاشة مضاءة</span>
                      <span className="text-[10px] font-bold text-slate-500">منع الشاشة من الانطفاء أثناء القراءة (يتطلب دعم المتصفح)</span>
                    </div>
                  </div>
                  <button onClick={() => setKeepScreenAwake(!keepScreenAwake)} className={cn("w-12 h-6 rounded-full transition-colors relative", keepScreenAwake ? "bg-teal-500" : "bg-slate-300 dark:bg-slate-700")}>
                    <div className={cn("w-4 h-4 rounded-full bg-white absolute top-1 transition-all shadow-sm", keepScreenAwake ? "left-7" : "left-1")} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
          {/* Add other tabs content here if needed, or keep it minimal for performance */}
        </div>
      </motion.div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modal, document.body) : modal;
});

export const TafsirModal = React.memo(({
  isOpen,
  onClose,
  selectedAyah,
  surah,
  tafsirType,
  setTafsirType,
  tafsirTheme,
  setTafsirTheme,
  TAFSIR_THEMES,
  TAFSIR_NAMES,
  tafsirFontSize,
  setTafsirFontSize,
  tafsirFontFamily,
  setTafsirFontFamily,
  TAFSIR_FONTS,
  fontFamily,
  highlightQuranText,
  isPlaying,
  currentAyahPlaying,
  toggleAudio,
  copyAyah,
  shareAyah,
  navigateTafsir,
  quranVocabulary,
  setSelectedWordDetail,
  loading,
  t,
  themeClasses,
  theme
}: any) => {
  if (!isOpen || !selectedAyah) return null;

  const [showSettings, setShowSettings] = React.useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[150] flex items-start justify-center p-0"
      dir="rtl"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{
          duration: 0.3,
          ease: [0.23, 1, 0.32, 1],
        }}
        className={cn(
          "relative w-full h-[100dvh] shadow-2xl overflow-hidden flex flex-col border-0 backdrop-blur-xl",
          tafsirTheme === "default"
            ? themeClasses[theme]
            : cn(
                TAFSIR_THEMES[tafsirTheme].classes,
                tafsirTheme === "slate" ? "force-dark" : "force-light",
              ),
        )}
        style={
          tafsirTheme !== "default" && TAFSIR_THEMES[tafsirTheme].texture
            ? { backgroundImage: TAFSIR_THEMES[tafsirTheme].texture }
            : undefined
        }
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Close Button */}
        <button
          onClick={onClose}
          className="fixed top-3 left-3 z-[650] w-9 h-9 rounded-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white flex items-center justify-center shadow-lg cursor-pointer transform active:scale-95 transition-all border border-red-500/50"
          style={{ top: "max(12px, env(safe-area-inset-top, 12px))" }}
          title="إغلاق التفسير"
        >
          <X size={18} strokeWidth={3} />
        </button>

        {/* Premium Top Bar */}
        <div className={cn("shrink-0 pt-12 sm:pt-4 pb-3 px-4 sm:px-6 flex flex-col items-center border-b border-white/10 relative z-30 shadow-sm transition-colors duration-500 rounded-b-xl bg-slate-900/95 dark:bg-black/90")}>
          <div className="w-8 h-1 bg-white/20 rounded-full mb-2 shrink-0 cursor-pointer hover:bg-white/40 transition-colors" />
          <div className="w-full flex justify-between items-center bg-transparent">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden sm:flex w-8 h-8 sm:w-9 sm:h-9 bg-teal-500/20 rounded-lg sm:rounded-xl items-center justify-center text-teal-400 shadow-lg shrink-0 border border-teal-500/20">
                <BookOpen size={18} />
              </div>
              <div className="flex flex-col">
                <h3 className="font-black text-sm text-white leading-none">التفسير</h3>
                <p className="text-[10px] font-bold text-teal-200 mt-1 uppercase tracking-tighter">
                  الآية {selectedAyah.numberInSurah} • {surah.name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1 bg-white/10 p-1 rounded-xl">
                <button
                  onClick={() => toggleAudio(selectedAyah)}
                  className={cn(
                    "w-8 h-8 rounded-lg transform transition-all duration-75 active:scale-[0.85] active:opacity-70 flex items-center justify-center text-white hover:bg-white/20 shadow-sm",
                    isPlaying && currentAyahPlaying === selectedAyah.number ? "bg-red-500 text-white" : ""
                  )}
                  title="استماع للآية"
                >
                  {isPlaying && currentAyahPlaying === selectedAyah.number ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                </button>
                <button 
                  onClick={() => copyAyah(selectedAyah)} 
                  className="w-8 h-8 rounded-lg text-white hover:bg-white/20 shadow-sm flex items-center justify-center transform transition-all duration-75 active:scale-[0.85] active:opacity-70"
                  title="نسخ الآية"
                >
                  <Copy size={14} />
                </button>
                <button 
                  onClick={() => shareAyah(selectedAyah)} 
                  className="w-8 h-8 rounded-lg text-white hover:bg-white/20 shadow-sm flex items-center justify-center transform transition-all duration-75 active:scale-[0.85] active:opacity-70"
                  title="مشاركة الآية"
                >
                  <Share2 size={14} />
                </button>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className={cn(
                    "w-8 h-8 rounded-lg text-white hover:bg-white/20 shadow-sm flex items-center justify-center transform transition-all duration-75 active:scale-[0.85] active:opacity-70 cursor-pointer",
                    showSettings ? "bg-teal-500 text-white" : ""
                  )}
                  title="إعدادات التفسير"
                >
                  <Settings2 size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Collapsible Tafsir Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
              className="shrink-0 bg-slate-900/95 dark:bg-black/95 text-white border-b border-white/10 overflow-hidden relative z-20 shadow-inner"
            >
              <div className="max-w-4xl mx-auto px-4 py-4 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                
                {/* Right Column: Tafsir Book and Font Family */}
                <div className="space-y-4">
                  {/* Tafsir Book Selection */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-teal-400 uppercase tracking-widest block">
                      كتاب التفسير / الترجمة
                    </label>
                    <div className="relative">
                      <select
                        value={tafsirType}
                        onChange={(e) => setTafsirType(e.target.value)}
                        className="w-full pl-8 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-teal-500/50 appearance-none cursor-pointer hover:bg-white/10 transition-all"
                        dir="rtl"
                      >
                        {Object.entries(TAFSIR_NAMES).map(([key, label]: any) => (
                          <option key={key} value={key} className="bg-slate-900 text-white text-xs font-bold py-2">
                            {label}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-white/50">
                        <BookOpen size={12} />
                      </div>
                    </div>
                  </div>

                  {/* Tafsir Font Family */}
                  {TAFSIR_FONTS && setTafsirFontFamily && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-teal-400 uppercase tracking-widest block">
                        نوع الخط للتفسير
                      </label>
                      <div className="relative">
                        <select
                          value={tafsirFontFamily}
                          onChange={(e) => setTafsirFontFamily(e.target.value)}
                          className="w-full pl-8 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-teal-500/50 appearance-none cursor-pointer hover:bg-white/10 transition-all"
                          dir="rtl"
                        >
                          {TAFSIR_FONTS.map((font: any) => (
                            <option key={font.id} value={font.id} className="bg-slate-900 text-white text-xs font-bold py-2">
                              {font.name}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-white/50">
                          <AlignRight size={12} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Left Column: Font Size and Themes */}
                <div className="space-y-4">
                  {/* Font Size controls */}
                  {setTafsirFontSize && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-teal-400 uppercase tracking-widest block">
                        حجم الخط للتفسير
                      </label>
                      <div className="flex items-center gap-3 bg-white/5 p-1 rounded-xl border border-white/10 h-[42px] px-3 justify-between">
                        <span className="text-xs font-bold text-white/60">حجم النص للتفسير</span>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setTafsirFontSize((prev: number) => Math.max(12, prev - 2))}
                            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs font-black transition-colors cursor-pointer active:scale-95 text-white"
                            title="تصغير الخط"
                          >
                            أ-
                          </button>
                          <span className="text-xs font-black min-w-[32px] text-center">{tafsirFontSize}px</span>
                          <button
                            onClick={() => setTafsirFontSize((prev: number) => Math.min(48, prev + 2))}
                            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs font-black transition-colors cursor-pointer active:scale-95 text-white"
                            title="تكبير الخط"
                          >
                            أ+
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tafsir Theme controls */}
                  {setTafsirTheme && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-teal-400 uppercase tracking-widest block">
                        مظهر الخلفية
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {Object.entries(TAFSIR_THEMES).map(([key, config]: any) => {
                          const isSelected = tafsirTheme === key;
                          return (
                            <button
                              key={key}
                              type="button"
                              onClick={() => setTafsirTheme(key)}
                              className={cn(
                                "py-2 px-1.5 rounded-xl border text-[11px] font-black transition-all flex flex-col items-center justify-center gap-1 cursor-pointer",
                                isSelected
                                  ? "border-amber-400 bg-white/10 text-amber-300"
                                  : "border-white/5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white"
                              )}
                            >
                              <div className={cn("w-4 h-4 rounded-full border border-white/10 flex items-center justify-center", config.previewBg)}>
                                {isSelected && <Check size={10} className="text-amber-500" />}
                              </div>
                              <span className="truncate w-full text-center">{config.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-grow overflow-y-auto custom-scrollbar relative z-10">
          <div className="max-w-4xl mx-auto py-8">
            {/* Ayah Display */}
            <div className="px-4 mb-8">
              <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(_e, info) => {
                  const threshold = 70;
                  if (info.offset.x > threshold) navigateTafsir(-1);
                  else if (info.offset.x < -threshold) navigateTafsir(1);
                }}
                className="w-full px-4 relative"
              >
                <p
                  className="leading-relaxed text-center font-bold tracking-normal transition-all text-[#dc2626] dark:text-[#ff4d4d] select-none"
                  style={{
                    fontSize: `${tafsirFontSize}px`,
                    lineHeight: "1.8",
                    fontFamily: `"${fontFamily}", serif`,
                  }}
                  dangerouslySetInnerHTML={{ __html: highlightQuranText(selectedAyah.text) }}
                />
              </motion.div>
            </div>

            <div className="p-4 sm:px-8 pb-10">

              {/* Vocabulary Chips */}
              {(() => {
                const matchingVocab = quranVocabulary.filter(v => v.surahNumber === surah?.number && v.ayahNumber === selectedAyah.numberInSurah);
                if (matchingVocab.length === 0) return null;
                return (
                  <div className="mb-6 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex flex-col gap-2.5">
                    <div className="flex items-center gap-2">
                      <Sparkles size={14} className="text-amber-500" />
                      <span className="text-xs font-black text-amber-700 dark:text-amber-400">{t('ayah_vocab_title')}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {matchingVocab.map((vocabItem: any) => (
                        <button key={vocabItem.id} onClick={() => setSelectedWordDetail(vocabItem)} className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-amber-500/20 text-xs font-black text-amber-700 dark:text-amber-400 hover:border-amber-500 shadow-sm transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer">
                          <span>✦</span>
                          <span>{vocabItem.word}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {loading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-6">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-teal-100 dark:border-teal-900/30 rounded-full" />
                    <div className="absolute inset-0 w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                  <p className="text-xs text-slate-500 font-black tracking-[0.2em] uppercase">{t('loading')}</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b-2 border-slate-200 dark:border-slate-800 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                      <span className="text-[11px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest">
                        {TAFSIR_NAMES[tafsirType]}
                      </span>
                    </div>
                  </div>
                  <p
                    className="leading-relaxed text-right font-bold text-slate-800 dark:text-slate-100"
                    style={{
                      fontFamily: tafsirFontFamily || fontFamily,
                      fontSize: `${tafsirFontSize}px`,
                    }}
                  >
                    {selectedAyah.tafsir || t("tafsir_not_available")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
});
