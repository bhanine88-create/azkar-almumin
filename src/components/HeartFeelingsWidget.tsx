import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Moon, Sun, Zap, HelpCircle, Frown, Smile, Plus, 
  ChevronUp, ChevronDown, Copy, Check, Share2, Sparkles, 
  BookOpen, RotateCcw, Heart, Trash2, X, ShieldCheck
} from 'lucide-react';
import { 
  HEART_FEELINGS_LIST, FeelingItem, CustomHeartDua, 
  getCustomHeartDuas, saveCustomHeartDua, deleteCustomHeartDua 
} from '../data/heartFeelingsData';
import { triggerHaptic, checkInputSafety, shareContent } from '../lib/utils';
import { useTranslation } from '../i18n';
import { useAppContext } from '../AppContext';

const HeartFeelingsModal = React.lazy(() => import('./HeartFeelingsModal').then(m => ({ default: m.HeartFeelingsModal })));

export const HeartFeelingsWidget: React.FC = () => {
  const { settings } = useAppContext();
  const { t, isRtl } = useTranslation(settings?.appLanguage);

  // Active selected feeling: starts with 'anxious' (or last selected)
  const [selectedFeelingId, setSelectedFeelingId] = useState<string>('anxious');
  // Expandable card state: controls whether the advice and suited dhikr are revealed
  const [isCardExpanded, setIsCardExpanded] = useState<boolean>(false);
  // Controls whether to show the extra detailed tabs (full duas, quran verses, custom duas)
  const [showExtendedDetails, setShowExtendedDetails] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'duas' | 'quran' | 'tasbeeh' | 'custom'>('duas');
  
  // Modal state for full view or adding dua
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalInitialFeeling, setModalInitialFeeling] = useState<string>('anxious');
  const [modalAddMode, setModalAddMode] = useState<boolean>(false);

  // Inline custom dua state
  const [showInlineAdd, setShowInlineAdd] = useState<boolean>(false);
  const [inlineTitle, setInlineTitle] = useState<string>('');
  const [inlineText, setInlineText] = useState<string>('');
  const [inlineSource, setInlineSource] = useState<string>('');
  const [inlineError, setInlineError] = useState<string>('');

  // Copy feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Tasbeeh counter state per feeling
  const [tasbeehCounts, setTasbeehCounts] = useState<Record<string, number>>({});

  // Custom duas
  const [customDuas, setCustomDuas] = useState<CustomHeartDua[]>([]);

  // Ref to scroll smoothly when list opens
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCustomDuas(getCustomHeartDuas());
    // Load previously selected feeling if any
    try {
      const saved = localStorage.getItem('athkar_heart_feeling_selected');
      if (saved && HEART_FEELINGS_LIST.some(f => f.id === saved)) {
        setSelectedFeelingId(saved);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSelectFeeling = (id: string) => {
    triggerHaptic('medium');
    setSelectedFeelingId(id);
    setIsCardExpanded(true); // Automatically expand card to show advice and dhikr
    setShowExtendedDetails(false); // keep focused on advice & dhikr
    try {
      localStorage.setItem('athkar_heart_feeling_selected', id);
    } catch {
      // ignore
    }
    setTimeout(() => {
      listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 150);
  };

  const handleToggleExpand = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    triggerHaptic('light');
    setIsCardExpanded(prev => !prev);
    if (!isCardExpanded) {
      setTimeout(() => {
        listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 150);
    }
  };

  const handleOpenAddModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic('light');
    setModalInitialFeeling(selectedFeelingId || 'anxious');
    setModalAddMode(true);
    setIsModalOpen(true);
  };

  const handleCopy = (text: string, id: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      triggerHaptic('success');
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  const handleShare = async (title: string, text: string, source: string) => {
    triggerHaptic('light');
    const shareText = `﴿ ${title} ﴾\n\n"${text}"\n\nالمصدر: ${source}\n\nتطبيق أذكار المؤمن`;
    await shareContent(title, shareText);
  };

  const currentFeeling = HEART_FEELINGS_LIST.find(f => f.id === selectedFeelingId);
  const currentTasbeehCount = currentFeeling ? (tasbeehCounts[currentFeeling.id] || 0) : 0;
  const isTasbeehCompleted = currentFeeling ? currentTasbeehCount >= currentFeeling.tasbeeh.targetCount : false;

  const handleTasbeehClick = () => {
    if (!currentFeeling) return;
    triggerHaptic(isTasbeehCompleted ? 'double' : 'medium');
    setTasbeehCounts(prev => ({
      ...prev,
      [currentFeeling.id]: (prev[currentFeeling.id] || 0) + 1
    }));
  };

  const handleTasbeehReset = () => {
    if (!currentFeeling) return;
    triggerHaptic('light');
    setTasbeehCounts(prev => ({
      ...prev,
      [currentFeeling.id]: 0
    }));
  };

  const handleSaveInlineDua = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFeelingId) return;
    setInlineError('');

    if (!inlineText.trim()) {
      setInlineError('يرجى إدخال نص الدعاء.');
      return;
    }

    const check = checkInputSafety(inlineText);
    if (!check.isSafe) {
      setInlineError(check.reasonAr || 'النص غير صالح.');
      return;
    }

    saveCustomHeartDua(
      selectedFeelingId,
      inlineTitle.trim() || 'دعاء مخصص',
      inlineText.trim(),
      inlineSource.trim() || 'دعاء شخصي'
    );

    triggerHaptic('success');
    setCustomDuas(getCustomHeartDuas());
    setInlineTitle('');
    setInlineText('');
    setInlineSource('');
    setShowInlineAdd(false);
    setActiveTab('custom');
  };

  const handleDeleteCustomDua = (id: string) => {
    triggerHaptic('medium');
    deleteCustomHeartDua(id);
    setCustomDuas(getCustomHeartDuas());
  };

  const feelingCustomDuas = currentFeeling 
    ? customDuas.filter(d => d.feelingId === currentFeeling.id) 
    : [];

  const renderIcon = (name: string, className?: string) => {
    switch (name) {
      case 'Moon': return <Moon className={className} />;
      case 'Sun': return <Sun className={className} />;
      case 'Zap': return <Zap className={className} />;
      case 'HelpCircle': return <HelpCircle className={className} />;
      case 'Frown': return <Frown className={className} />;
      case 'Smile': return <Smile className={className} />;
      default: return <Heart className={className} />;
    }
  };

  return (
    <>
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 20 },
          show: { opacity: 1, y: 0 }
        }}
        className="px-1"
      >
        {/* Main Glowing Warm Card */}
        <div 
          id="heart-feelings-widget-card"
          dir={isRtl ? 'rtl' : 'ltr'}
          className="relative w-full rounded-[28px] sm:rounded-3xl p-5 sm:p-7 overflow-hidden shadow-xl shadow-orange-500/20 text-white bg-gradient-to-b from-[#ff8800] via-[#ff5a00] to-[#f43f5e] border border-white/20 transition-all duration-300"
        >
          {/* Subtle Arabesque & Ambient Glows */}
          <div 
            className="absolute inset-0 opacity-15 mix-blend-overlay pointer-events-none" 
            style={{ backgroundImage: "url('/images/arabesque.png')" }} 
          />
          <div className="absolute -top-16 -right-16 w-44 h-44 bg-white/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-rose-600/30 rounded-full blur-3xl pointer-events-none" />

          {/* Top Corner Quick Expand/Collapse Toggle Button */}
          <button
            type="button"
            onClick={handleToggleExpand}
            className="absolute top-4 start-4 sm:top-5 sm:start-5 z-20 w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 border border-white/25 flex items-center justify-center text-white transition-all active:scale-95 cursor-pointer shadow-sm"
            title={isCardExpanded ? t('feeling_click_to_collapse', 'إخفاء التفاصيل') : t('feeling_click_to_expand', 'توسيع البطاقة')}
          >
            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isCardExpanded ? 'rotate-180' : ''}`} />
          </button>

          {/* Card Header & Title */}
          <div className="relative z-10 flex flex-col items-center text-center space-y-1">
            <span className="text-white text-sm sm:text-base font-extrabold drop-shadow-sm">
              {t('heart_feelings_title', 'كيف حال قلبك اليوم؟')}
            </span>
            <h3 className="text-white text-2xl sm:text-3xl font-black drop-shadow-md tracking-tight pb-1">
              {t('heart_feelings_subtitle', 'حدد شعورك')}
            </h3>

            {/* "+ إضافة دعاء للحالة" Button */}
            <div className="pt-2 pb-5">
              <button
                type="button"
                id="btn-add-dua-for-heart-state"
                onClick={handleOpenAddModal}
                className="bg-white/20 hover:bg-white/30 border-2 border-white/40 text-white rounded-full px-5 py-2 text-xs sm:text-sm font-black inline-flex items-center justify-center gap-1.5 backdrop-blur-md shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>{t('heart_feelings_add_btn', 'إضافة دعاء للحالة')}</span>
              </button>
            </div>

            {/* Feeling Badges Rows (Matching Screenshot Order & Style) */}
            <div className="w-full max-w-md flex flex-col gap-2.5 sm:gap-3">
              {/* Row 1: متعب | متفائل | قلق */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full">
                {/* 1. متعب */}
                <button
                  type="button"
                  id="mood-btn-tired"
                  onClick={() => handleSelectFeeling('tired')}
                  className={`rounded-full py-2 sm:py-2.5 px-2 sm:px-4 text-sm sm:text-base font-black flex items-center justify-center gap-1.5 sm:gap-2 backdrop-blur-sm shadow-md transition-all active:scale-95 cursor-pointer border-2 ${
                    selectedFeelingId === 'tired'
                      ? 'bg-white text-orange-950 border-white shadow-xl ring-2 ring-white/80 scale-105'
                      : 'bg-white/15 hover:bg-white/25 border-white/40 text-white'
                  }`}
                >
                  <Moon className="w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0 stroke-[2.5]" />
                  <span className="whitespace-nowrap">{t('feeling_tired', 'متعب')}</span>
                </button>

                {/* 2. متفائل */}
                <button
                  type="button"
                  id="mood-btn-optimistic"
                  onClick={() => handleSelectFeeling('optimistic')}
                  className={`rounded-full py-2 sm:py-2.5 px-2 sm:px-4 text-sm sm:text-base font-black flex items-center justify-center gap-1.5 sm:gap-2 backdrop-blur-sm shadow-md transition-all active:scale-95 cursor-pointer border-2 ${
                    selectedFeelingId === 'optimistic'
                      ? 'bg-white text-orange-950 border-white shadow-xl ring-2 ring-white/80 scale-105'
                      : 'bg-white/15 hover:bg-white/25 border-white/40 text-white'
                  }`}
                >
                  <Sun className="w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0 stroke-[2.5]" />
                  <span className="whitespace-nowrap">{t('feeling_optimistic', 'متفائل')}</span>
                </button>

                {/* 3. قلق */}
                <button
                  type="button"
                  id="mood-btn-anxious"
                  onClick={() => handleSelectFeeling('anxious')}
                  className={`rounded-full py-2 sm:py-2.5 px-2 sm:px-4 text-sm sm:text-base font-black flex items-center justify-center gap-1.5 sm:gap-2 backdrop-blur-sm shadow-md transition-all active:scale-95 cursor-pointer border-2 ${
                    selectedFeelingId === 'anxious'
                      ? 'bg-white text-orange-950 border-white shadow-xl ring-2 ring-white/80 scale-105'
                      : 'bg-white/15 hover:bg-white/25 border-white/40 text-white'
                  }`}
                >
                  <Zap className="w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0 stroke-[2.5]" />
                  <span className="whitespace-nowrap">{t('feeling_anxious', 'قلق')}</span>
                </button>
              </div>

              {/* Row 2: هادئ | حزين | محتار */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full">
                {/* 4. هادئ */}
                <button
                  type="button"
                  id="mood-btn-calm"
                  onClick={() => handleSelectFeeling('calm')}
                  className={`rounded-full py-2 sm:py-2.5 px-2 sm:px-4 text-sm sm:text-base font-black flex items-center justify-center gap-1.5 sm:gap-2 backdrop-blur-sm shadow-md transition-all active:scale-95 cursor-pointer border-2 ${
                    selectedFeelingId === 'calm'
                      ? 'bg-white text-orange-950 border-white shadow-xl ring-2 ring-white/80 scale-105'
                      : 'bg-white/15 hover:bg-white/25 border-white/40 text-white'
                  }`}
                >
                  <Smile className="w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0 stroke-[2.5]" />
                  <span className="whitespace-nowrap">{t('feeling_calm', 'هادئ')}</span>
                </button>

                {/* 5. حزين */}
                <button
                  type="button"
                  id="mood-btn-sad"
                  onClick={() => handleSelectFeeling('sad')}
                  className={`rounded-full py-2 sm:py-2.5 px-2 sm:px-4 text-sm sm:text-base font-black flex items-center justify-center gap-1.5 sm:gap-2 backdrop-blur-sm shadow-md transition-all active:scale-95 cursor-pointer border-2 ${
                    selectedFeelingId === 'sad'
                      ? 'bg-white text-orange-950 border-white shadow-xl ring-2 ring-white/80 scale-105'
                      : 'bg-white/15 hover:bg-white/25 border-white/40 text-white'
                  }`}
                >
                  <Frown className="w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0 stroke-[2.5]" />
                  <span className="whitespace-nowrap">{t('feeling_sad', 'حزين')}</span>
                </button>

                {/* 6. محتار */}
                <button
                  type="button"
                  id="mood-btn-confused"
                  onClick={() => handleSelectFeeling('confused')}
                  className={`rounded-full py-2 sm:py-2.5 px-2 sm:px-4 text-sm sm:text-base font-black flex items-center justify-center gap-1.5 sm:gap-2 backdrop-blur-sm shadow-md transition-all active:scale-95 cursor-pointer border-2 ${
                    selectedFeelingId === 'confused'
                      ? 'bg-white text-orange-950 border-white shadow-xl ring-2 ring-white/80 scale-105'
                      : 'bg-white/15 hover:bg-white/25 border-white/40 text-white'
                  }`}
                >
                  <HelpCircle className="w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0 stroke-[2.5]" />
                  <span className="whitespace-nowrap">{t('feeling_confused', 'محتار')}</span>
                </button>
              </div>
            </div>

            {/* Expand / Collapse Action Bar */}
            <button
              type="button"
              id="btn-toggle-expand-heart-card"
              onClick={handleToggleExpand}
              className="mt-3.5 w-full max-w-md mx-auto py-2.5 px-4 rounded-full bg-white/20 hover:bg-white/30 border-2 border-white/40 backdrop-blur-md flex items-center justify-between transition-all active:scale-[0.99] text-white shadow-md cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-white/25 flex items-center justify-center text-amber-200 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                </div>
                <span className="text-xs sm:text-sm font-black text-white drop-shadow-sm">
                  {isCardExpanded 
                    ? t('feeling_click_to_collapse', 'إخفاء التفاصيل') 
                    : t('feeling_click_to_expand', 'انقر لعرض النصيحة والذكر المناسب')}
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 stroke-[2.5] transition-transform duration-300 ${isCardExpanded ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* INLINE EXPANDED VIEW: SPIRITUAL ADVICE & SUITED DHIKR */}
          <div ref={listRef} />
          <AnimatePresence>
            {isCardExpanded && currentFeeling && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 20 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-20 overflow-hidden"
              >
                {/* Embedded White/Dark Elevated Container */}
                <div className={`bg-slate-900/95 backdrop-blur-xl border-2 border-white/20 text-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-2xl ${isRtl ? 'text-right' : 'text-left'}`}>
                  {/* Top Bar of the Expanded List */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-orange-500/25 border border-orange-400/40 flex items-center justify-center text-orange-400 shadow-sm">
                        {renderIcon(currentFeeling.iconName, 'w-5 h-5 stroke-[2.5]')}
                      </div>
                      <div>
                        <h4 className="text-sm sm:text-base font-black text-white flex items-center gap-1.5">
                          <span>{t('feeling_when_you_feel', 'عندما تشعر أنك:')}</span>
                          <span className="text-amber-400 font-black">{t(`feeling_${currentFeeling.id}`, currentFeeling.label)}</span>
                        </h4>
                        <p className="text-xs font-bold text-slate-300 leading-tight">
                          {currentFeeling.headline}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setModalInitialFeeling(currentFeeling.id);
                          setModalAddMode(false);
                          setIsModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-black border border-slate-700 transition-colors flex items-center gap-1 shadow-sm"
                        title={t('feeling_expand_fullscreen', 'تكبير')}
                      >
                        <span>{t('feeling_expand_fullscreen', 'تكبير')}</span>
                        <span className="text-xs">⛶</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsCardExpanded(false)}
                        className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors shadow-sm"
                        title={t('feeling_click_to_collapse', 'إخفاء التفاصيل')}
                      >
                        <ChevronUp className="w-4 h-4 stroke-[2.5]" />
                      </button>
                    </div>
                  </div>

                  {/* 1. النصيحة الإيمانية القصيرة (Short Spiritual Advice with Framer Motion Animation) */}
                  <motion.div
                    key={`advice-${currentFeeling.id}`}
                    initial={{ opacity: 0, y: 16, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.98 }}
                    transition={{ duration: 0.42, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
                    className="mb-4 rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-amber-500/20 via-orange-500/15 to-slate-900/50 border-2 border-amber-400/40 relative overflow-hidden shadow-xl backdrop-blur-md"
                  >
                    {/* Ambient glowing shimmer */}
                    <motion.div 
                      animate={{ 
                        opacity: [0.25, 0.55, 0.25],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute -top-12 -right-12 w-36 h-36 bg-amber-400/15 rounded-full blur-2xl pointer-events-none"
                    />

                    <div className="flex items-center gap-2.5 text-amber-300 font-black text-sm sm:text-base mb-2.5 relative z-10">
                      <motion.div
                        initial={{ scale: 0, rotate: -30 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 350, damping: 15, delay: 0.16 }}
                        className="w-8 h-8 rounded-xl bg-amber-400/25 border border-amber-400/40 flex items-center justify-center shrink-0 shadow-sm"
                      >
                        <Sparkles className="w-4 h-4 text-amber-200 animate-pulse" />
                      </motion.div>
                      <span className="tracking-wide">{t('feeling_spiritual_advice_title', 'نصيحة إيمانية لقلبك')}</span>
                    </div>

                    <motion.p 
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: 0.14 }}
                      className="text-sm sm:text-base font-black text-amber-50 leading-relaxed select-text drop-shadow-sm relative z-10"
                    >
                      "{currentFeeling.spiritualAdvice}"
                    </motion.p>

                    {currentFeeling.description && (
                      <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.35, delay: 0.22 }}
                        className="text-xs sm:text-sm font-extrabold text-slate-200 mt-3 pt-2.5 border-t border-amber-400/25 leading-relaxed relative z-10"
                      >
                        {currentFeeling.description}
                      </motion.p>
                    )}
                  </motion.div>

                  {/* 2. الذِّكْر المناسب لهذه الحالة (Suited Dhikr & Tasbeeh with Framer Motion Animation) */}
                  <motion.div
                    key={`dhikr-${currentFeeling.id}`}
                    initial={{ opacity: 0, y: 20, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.98 }}
                    transition={{ duration: 0.45, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                    className="rounded-2xl p-4 sm:p-5 bg-slate-800/90 border-2 border-slate-700 space-y-3.5 shadow-xl mb-4 relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-orange-500/25 border border-orange-400/40 flex items-center justify-center text-orange-400 shadow-sm">
                          <Heart className="w-4.5 h-4.5 fill-orange-400/30 stroke-[2.5]" />
                        </div>
                        <div>
                          <h5 className="text-sm sm:text-base font-black text-white tracking-wide">
                            {t('feeling_suited_dhikr_title', 'الذِّكْر المناسب لهذه الحالة')}
                          </h5>
                          <span className="text-xs sm:text-sm text-orange-300 font-black">
                            {currentFeeling.tasbeeh.title}
                          </span>
                        </div>
                      </div>
                      <div className="px-3 py-1 rounded-full bg-slate-900 border border-slate-600 text-xs sm:text-sm text-amber-300 font-mono font-black shadow-inner">
                        {currentFeeling.tasbeeh.targetCount}x
                      </div>
                    </div>

                    {/* Dhikr text in clear, bold, legible typography */}
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.22, duration: 0.3 }}
                      className="bg-slate-950/90 rounded-2xl p-4 sm:p-5 border border-slate-800 text-center shadow-inner relative overflow-hidden"
                    >
                      <p className="text-base sm:text-lg lg:text-xl font-black text-amber-100 font-amiri leading-loose select-all tracking-wide drop-shadow-sm">
                        {currentFeeling.tasbeeh.dhikr}
                      </p>
                    </motion.div>

                    {/* Virtue */}
                    <div className="text-xs sm:text-sm font-extrabold text-slate-100 leading-relaxed bg-slate-900/80 p-3 rounded-xl border border-slate-700/80 flex items-start gap-2.5">
                      <ShieldCheck className="w-4.5 h-4.5 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-amber-300 font-black">{t('feeling_source', 'الفضل')}: </span>
                        {currentFeeling.tasbeeh.virtue}
                      </div>
                    </div>

                    {/* Interactive Tasbeeh Counter & Action Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-700/60">
                      <div className="flex items-center gap-2">
                        {/* Main Tap Counter Button */}
                        <motion.button
                          whileTap={{ scale: 0.93 }}
                          whileHover={{ scale: 1.02 }}
                          type="button"
                          onClick={handleTasbeehClick}
                          className={`px-4 py-2 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-md ${
                            isTasbeehCompleted
                              ? 'bg-emerald-500 text-slate-950 font-black ring-2 ring-emerald-400/60 shadow-emerald-500/20'
                              : 'bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 text-slate-950 hover:brightness-110 shadow-amber-500/20'
                          }`}
                        >
                          <span className="text-base">📿</span>
                          <span className="font-black text-sm">
                            {currentTasbeehCount} / {currentFeeling.tasbeeh.targetCount}
                          </span>
                          <span className="text-[11px] font-extrabold opacity-85">
                            ({t('feeling_tasbeeh_tap', 'اضغط للتسبيح')})
                          </span>
                        </motion.button>

                        {/* Reset button */}
                        <button
                          type="button"
                          onClick={handleTasbeehReset}
                          className="p-2 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          title={t('feeling_tasbeeh_reset', 'إعادة تعيين')}
                        >
                          <RotateCcw className="w-4 h-4 stroke-[2.5]" />
                        </button>
                      </div>

                      {/* Copy & Share Buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleCopy(currentFeeling.tasbeeh.dhikr, 'widget-tasbeeh')}
                          className="px-3 py-2 rounded-xl bg-slate-750 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-black flex items-center gap-1.5 transition-colors border border-slate-650"
                        >
                          {copiedId === 'widget-tasbeeh' ? (
                            <>
                              <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                              <span className="text-emerald-400 font-black">{t('feeling_copied', 'تم النسخ')}</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4 text-slate-300" />
                              <span>{t('feeling_copy', 'نسخ')}</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleShare(currentFeeling.tasbeeh.title, currentFeeling.tasbeeh.dhikr, currentFeeling.tasbeeh.virtue)}
                          className="px-3 py-2 rounded-xl bg-slate-750 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-black flex items-center gap-1.5 transition-colors border border-slate-650"
                        >
                          <Share2 className="w-4 h-4 text-slate-300" />
                          <span>{t('feeling_share', 'مشاركة')}</span>
                        </button>
                      </div>
                    </div>

                    {isTasbeehCompleted && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center text-xs sm:text-sm font-black text-emerald-400 bg-emerald-500/15 py-2 px-4 rounded-xl border border-emerald-500/30 shadow-inner"
                      >
                        🎉 {t('feeling_tasbeeh_completed', 'بارك الله فيك، أتممت الورد لهذا الشعور!')}
                      </motion.div>
                    )}
                  </motion.div>

                  {/* 3. Optional Extended Details: All Duas & Verses */}
                  <div className="mb-3">
                    <button
                      type="button"
                      onClick={() => setShowExtendedDetails(!showExtendedDetails)}
                      className="w-full py-2.5 px-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 text-xs sm:text-sm font-black flex items-center justify-between transition-colors shadow-sm"
                    >
                      <span className="flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-amber-400 stroke-[2.5]" />
                        <span>{t('feeling_view_all_duas', 'استعراض كافة الأدعية والآيات')}</span>
                      </span>
                      <ChevronDown className={`w-4 h-4 stroke-[2.5] transition-transform duration-300 ${showExtendedDetails ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {showExtendedDetails && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden pt-3 space-y-3"
                        >

                  {/* Sub-Tabs: Duas | Quran | Tasbeeh | Custom */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 border-b border-slate-800 no-scrollbar">
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        setActiveTab('duas');
                        setShowInlineAdd(false);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 ${
                        activeTab === 'duas' && !showInlineAdd
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-sm'
                          : 'bg-slate-800/90 text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      {t('feeling_tab_duas', 'أدعية مأثورة')} ({currentFeeling.duas.length})
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        setActiveTab('quran');
                        setShowInlineAdd(false);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 ${
                        activeTab === 'quran' && !showInlineAdd
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-sm'
                          : 'bg-slate-800/90 text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      {t('feeling_tab_quran', 'آيات السكينة')} ({currentFeeling.quranAyahs.length})
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        setActiveTab('tasbeeh');
                        setShowInlineAdd(false);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 ${
                        activeTab === 'tasbeeh' && !showInlineAdd
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-sm'
                          : 'bg-slate-800/90 text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      {t('feeling_tab_tasbeeh', 'سبحة الورد')} 📿
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        setActiveTab('custom');
                        setShowInlineAdd(false);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 ${
                        activeTab === 'custom' && !showInlineAdd
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-sm'
                          : 'bg-slate-800/90 text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      {t('feeling_tab_custom', 'أدعيتي الخاصة')} ({feelingCustomDuas.length})
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        setShowInlineAdd(!showInlineAdd);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 flex items-center gap-1 ${isRtl ? 'mr-auto' : 'ml-auto'} ${
                        showInlineAdd
                          ? 'bg-rose-500 text-white'
                          : 'bg-white/15 hover:bg-white/25 text-white border border-white/30'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{showInlineAdd ? t('feeling_cancel', 'إلغاء') : t('feeling_add_dua_now', 'إضافة دعاء')}</span>
                    </button>
                  </div>

                  {/* Inline Add Prayer Form */}
                  {showInlineAdd ? (
                    <form onSubmit={handleSaveInlineDua} className="p-4 rounded-xl bg-slate-800/90 border border-slate-700 space-y-3 mb-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-400">
                          {t('feeling_add_dua_now', 'إضافة دعاء')}: {t(`feeling_${currentFeeling.id}`, currentFeeling.label)}
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowInlineAdd(false)}
                          className="text-slate-400 hover:text-white text-xs"
                        >
                          {t('feeling_close', 'إغلاق')}
                        </button>
                      </div>

                      {inlineError && (
                        <div className="p-2 bg-rose-500/20 text-rose-300 text-xs rounded-lg">
                          {inlineError}
                        </div>
                      )}

                      <div>
                        <label className="block text-[11px] text-slate-300 mb-1 font-bold">
                          {t('feeling_dua_title_label', 'عنوان الدعاء (مثلاً: دعاء تفريج الكرب):')}
                        </label>
                        <input
                          type="text"
                          value={inlineTitle}
                          onChange={(e) => setInlineTitle(e.target.value)}
                          placeholder="..."
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-300 mb-1 font-bold">
                          {t('feeling_dua_text_label', 'نص الدعاء أو الآية:')} <span className="text-rose-400">*</span>
                        </label>
                        <textarea
                          rows={3}
                          value={inlineText}
                          onChange={(e) => setInlineText(e.target.value)}
                          placeholder="..."
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 leading-relaxed"
                          required
                        />
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setShowInlineAdd(false)}
                          className="px-3 py-1.5 rounded-lg bg-slate-700 text-slate-300 text-xs font-bold"
                        >
                          {t('feeling_cancel', 'إلغاء')}
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black"
                        >
                          {t('feeling_save_dua', 'حفظ الدعاء')}
                        </button>
                      </div>
                    </form>
                  ) : null}

                  {/* TAB 1: Prophetic Duas List */}
                  {activeTab === 'duas' && !showInlineAdd && (
                    <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
                      {currentFeeling.duas.map((dua) => (
                        <div
                          key={dua.id}
                          className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/70 hover:border-slate-600 transition-all space-y-2.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-amber-300 text-xs flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-amber-400" />
                              {dua.title}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-700 text-slate-300">
                              {dua.source}
                            </span>
                          </div>

                          <p className="text-sm sm:text-base font-bold text-white leading-relaxed font-serif-uthmani">
                            « {dua.text} »
                          </p>

                          {dua.note && (
                            <p className="text-[11px] text-slate-400 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                              {dua.note}
                            </p>
                          )}

                          <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-700/50">
                            <button
                              type="button"
                              onClick={() => handleCopy(dua.text, dua.id)}
                              className="px-2.5 py-1 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs flex items-center gap-1"
                            >
                              {copiedId === dua.id ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span className="text-emerald-400 font-bold text-[11px]">{t('feeling_copied', 'تم النسخ')}</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span className="text-[11px]">{t('feeling_copy', 'نسخ')}</span>
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleShare(dua.title, dua.text, dua.source)}
                              className="px-2.5 py-1 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs flex items-center gap-1"
                            >
                              <Share2 className="w-3 h-3" />
                              <span className="text-[11px]">{t('feeling_share', 'مشاركة')}</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* TAB 2: Quran Verses List */}
                  {activeTab === 'quran' && !showInlineAdd && (
                    <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
                      {currentFeeling.quranAyahs.map((ayah, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/70 hover:border-slate-600 transition-all space-y-2.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                              {ayah.surah}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleShare(ayah.surah, ayah.text, ayah.surah)}
                              className="text-slate-400 hover:text-white"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <p className="text-sm sm:text-base font-bold text-white text-center leading-loose font-serif-uthmani py-2 px-2 bg-slate-900/50 rounded-xl border border-slate-800">
                            ﴿ {ayah.text} ﴾
                          </p>

                          {ayah.reflection && (
                            <p className="text-[11px] text-slate-300 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                              <span className="text-amber-400 font-bold">{t('feeling_reflection', 'تأمل')}: </span>
                              {ayah.reflection}
                            </p>
                          )}

                          <div className="flex items-center justify-end">
                            <button
                              type="button"
                              onClick={() => handleCopy(ayah.text, `inline-ayah-${idx}`)}
                              className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                            >
                              {copiedId === `inline-ayah-${idx}` ? (
                                <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                                  <Check className="w-3 h-3" /> {t('feeling_copied', 'تم النسخ')}
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-[11px]">
                                  <Copy className="w-3 h-3" /> {t('feeling_copy', 'نسخ')}
                                </span>
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* TAB 3: Tasbeeh Counter */}
                  {activeTab === 'tasbeeh' && !showInlineAdd && (
                    <div className="p-4 rounded-xl bg-slate-850 border border-slate-750 text-center space-y-3">
                      <span className="text-xs font-bold text-amber-400">
                        {currentFeeling.tasbeeh.title}
                      </span>
                      <h4 className="text-base sm:text-lg font-bold text-white px-2 leading-relaxed">
                        « {currentFeeling.tasbeeh.dhikr} »
                      </h4>
                      <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                        {currentFeeling.tasbeeh.virtue}
                      </p>

                      <div className="flex flex-col items-center justify-center pt-1">
                        <motion.button
                          whileTap={{ scale: 0.92 }}
                          onClick={handleTasbeehClick}
                          className={`w-28 h-28 rounded-full flex flex-col items-center justify-center border-4 shadow-xl transition-all cursor-pointer ${
                            isTasbeehCompleted
                              ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 border-emerald-300 text-white'
                              : 'bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 border-amber-300 text-white hover:scale-105'
                          }`}
                        >
                          <span className="text-2xl font-black font-mono">
                            {currentTasbeehCount}
                          </span>
                          <span className="text-[10px] font-bold opacity-90">
                            / {currentFeeling.tasbeeh.targetCount}
                          </span>
                          <span className="text-[9px] opacity-75">
                            {t('feeling_tasbeeh_tap', 'اضغط للتسبيح')}
                          </span>
                        </motion.button>

                        {isTasbeehCompleted && (
                          <div className="mt-2.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                            🎉 {t('feeling_tasbeeh_completed', 'بارك الله فيك، أتممت الورد لهذا الشعور!')}
                          </div>
                        )}

                        <div className="mt-3">
                          <button
                            type="button"
                            onClick={handleTasbeehReset}
                            className="px-3 py-1 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-bold flex items-center gap-1 border border-slate-700"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>{t('feeling_tasbeeh_reset', 'إعادة تعيين')}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: Custom User Prayers */}
                  {activeTab === 'custom' && !showInlineAdd && (
                    <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
                      {feelingCustomDuas.length === 0 ? (
                        <div className="text-center py-6 text-slate-400 space-y-2">
                          <Heart className="w-8 h-8 text-slate-600 mx-auto" />
                          <p className="text-xs">{t('feeling_no_custom_duas', 'لم تضف أدعية خاصة لهذا الشعور حتى الآن.')}</p>
                          <button
                            type="button"
                            onClick={() => setShowInlineAdd(true)}
                            className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold hover:bg-amber-500/30"
                          >
                            {t('feeling_add_dua_now', '+ إضافة دعاء الآن')}
                          </button>
                        </div>
                      ) : (
                        feelingCustomDuas.map((item) => (
                          <div
                            key={item.id}
                            className="p-3.5 rounded-xl bg-slate-800/80 border border-amber-500/30 space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-amber-300 text-xs flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-amber-400" />
                                {item.title}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleDeleteCustomDua(item.id)}
                                className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                                title={t('delete', 'حذف')}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <p className="text-sm font-bold text-white leading-relaxed">
                              {item.text}
                            </p>

                            {item.source && (
                              <p className="text-[10px] text-slate-400">
                                {t('feeling_source', 'المصدر')}: {item.source}
                              </p>
                            )}

                            <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-700/50">
                              <button
                                type="button"
                                onClick={() => handleCopy(item.text, item.id)}
                                className="px-2.5 py-1 rounded bg-slate-700/60 text-slate-300 text-xs flex items-center gap-1"
                              >
                                {copiedId === item.id ? (
                                  <span className="text-emerald-400 text-[11px] font-bold">{t('feeling_copied', 'تم النسخ')}</span>
                                ) : (
                                  <span className="text-[11px]">{t('feeling_copy', 'نسخ')}</span>
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleShare(item.title, item.text, item.source || '')}
                                className="px-2.5 py-1 rounded bg-slate-700/60 text-slate-300 text-xs flex items-center gap-1"
                              >
                                <Share2 className="w-3 h-3" />
                                <span className="text-[11px]">{t('feeling_share', 'مشاركة')}</span>
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Bottom Footer inside the expanded box */}
                  <div className="mt-3.5 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1 text-[11px]">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                      {t('feeling_tagline', 'أدعية مأثورة وآيات قرآنية لطمأنينة القلب')}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsCardExpanded(false)}
                      className="font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                      <span>{t('feeling_click_to_collapse', 'إخفاء التفاصيل')}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Full Modal through React Portal (never clipped by navbar) */}
      {isModalOpen && (
        <React.Suspense fallback={null}>
          <HeartFeelingsModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            initialFeelingId={modalInitialFeeling}
            initialOpenAddMode={modalAddMode}
          />
        </React.Suspense>
      )}
    </>
  );
};
