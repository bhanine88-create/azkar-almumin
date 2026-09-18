import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Sparkles, BookOpen, Share2, Copy, Check, RotateCcw, 
  Plus, Trash2, Heart, Moon, Sun, Zap, HelpCircle, Frown, Smile, 
  ChevronRight, Volume2, ShieldCheck
} from 'lucide-react';
import { 
  HEART_FEELINGS_LIST, FeelingItem, CustomHeartDua, 
  getCustomHeartDuas, saveCustomHeartDua, deleteCustomHeartDua 
} from '../data/heartFeelingsData';
import { triggerHaptic, checkInputSafety, shareContent } from '../lib/utils';

interface HeartFeelingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialFeelingId?: string;
  initialOpenAddMode?: boolean;
}

export const HeartFeelingsModal: React.FC<HeartFeelingsModalProps> = ({
  isOpen,
  onClose,
  initialFeelingId = 'anxious',
  initialOpenAddMode = false,
}) => {
  const [selectedFeelingId, setSelectedFeelingId] = useState<string>(initialFeelingId);
  const [activeTab, setActiveTab] = useState<'duas' | 'quran' | 'tasbeeh' | 'custom'>('duas');
  const [isAddMode, setIsAddMode] = useState<boolean>(initialOpenAddMode);
  
  // Custom prayer form state
  const [targetFeelingForAdd, setTargetFeelingForAdd] = useState<string>(initialFeelingId);
  const [customTitle, setCustomTitle] = useState<string>('');
  const [customText, setCustomText] = useState<string>('');
  const [customSource, setCustomSource] = useState<string>('');
  const [formError, setFormError] = useState<string>('');
  
  // Tasbeeh state for each feeling
  const [tasbeehCounts, setTasbeehCounts] = useState<Record<string, number>>({});
  
  // Copy feedback state
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Custom duas list
  const [customDuas, setCustomDuas] = useState<CustomHeartDua[]>([]);

  useEffect(() => {
    if (isOpen) {
      setSelectedFeelingId(initialFeelingId);
      setTargetFeelingForAdd(initialFeelingId);
      setIsAddMode(initialOpenAddMode);
      setCustomDuas(getCustomHeartDuas());
      setActiveTab('duas');
    }
  }, [isOpen, initialFeelingId, initialOpenAddMode]);

  const currentFeeling = HEART_FEELINGS_LIST.find(f => f.id === selectedFeelingId) || HEART_FEELINGS_LIST[0];

  const currentTasbeehCount = tasbeehCounts[currentFeeling.id] || 0;
  const isTasbeehCompleted = currentTasbeehCount >= currentFeeling.tasbeeh.targetCount;

  const handleTasbeehClick = () => {
    triggerHaptic(isTasbeehCompleted ? 'double' : 'medium');
    setTasbeehCounts(prev => {
      const current = prev[currentFeeling.id] || 0;
      return { ...prev, [currentFeeling.id]: current + 1 };
    });
  };

  const handleTasbeehReset = () => {
    triggerHaptic('light');
    setTasbeehCounts(prev => ({ ...prev, [currentFeeling.id]: 0 }));
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

  const handleSaveCustomDua = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!customText.trim()) {
      setFormError('يرجى كتابة نص الدعاء أولاً.');
      return;
    }

    const safetyCheck = checkInputSafety(customText);
    if (!safetyCheck.isSafe) {
      setFormError(safetyCheck.reasonAr || 'النص المدخل غير مسموح به.');
      return;
    }

    saveCustomHeartDua(
      targetFeelingForAdd,
      customTitle.trim() || 'دعاء مخصص',
      customText.trim(),
      customSource.trim()
    );

    triggerHaptic('success');
    setCustomDuas(getCustomHeartDuas());
    setSelectedFeelingId(targetFeelingForAdd);
    setCustomTitle('');
    setCustomText('');
    setCustomSource('');
    setIsAddMode(false);
    setActiveTab('custom');
  };

  const handleDeleteCustomDua = (id: string) => {
    triggerHaptic('medium');
    deleteCustomHeartDua(id);
    setCustomDuas(getCustomHeartDuas());
  };

  const feelingCustomDuas = customDuas.filter(d => d.feelingId === currentFeeling.id);

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

  if (!isOpen) return null;

  const content = (
    <AnimatePresence>
      <div 
        id="heart-feelings-modal-root" 
        className="fixed inset-0 z-[999999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-md"
        onClick={onClose}
        style={{ touchAction: 'pan-y' }}
      >
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 60, scale: 0.98 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-2xl h-[88vh] max-h-[88vh] sm:h-auto sm:max-h-[85vh] bg-slate-900 border border-slate-800 text-white rounded-t-[28px] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-right pb-safe"
          onClick={(e) => e.stopPropagation()}
          dir="rtl"
        >
          {/* Header with Radiant Warm Gradient */}
          <div className="relative p-5 sm:p-6 bg-gradient-to-r from-orange-600 via-amber-600 to-rose-600 overflow-hidden shrink-0">
            <div 
              className="absolute inset-0 opacity-15 mix-blend-overlay pointer-events-none" 
              style={{ backgroundImage: "url('/images/arabesque.png')" }} 
            />
            <div className="absolute -top-12 -left-12 w-36 h-36 bg-white/20 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-inner">
                  {renderIcon(currentFeeling.iconName, 'w-6 h-6')}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/20 border border-white/30 text-amber-100">
                      طِبّ القلوب ومشاعر المؤمن
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white mt-1 drop-shadow-sm">
                    {isAddMode ? 'إضافة دعاء لحالة قلبك' : `عندما تشعر أنك: ${currentFeeling.label}`}
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddMode(!isAddMode)}
                  className="px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 border border-white/30 text-white text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isAddMode ? 'الرجوع للأدعية' : 'إضافة دعاء'}</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-9 h-9 rounded-full bg-black/20 hover:bg-black/30 border border-white/20 flex items-center justify-center text-white transition-all active:scale-95"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Feelings Selector Bar inside Modal */}
            <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar pt-1">
              {HEART_FEELINGS_LIST.map((f) => {
                const isSelected = f.id === selectedFeelingId;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      setSelectedFeelingId(f.id);
                      setTargetFeelingForAdd(f.id);
                      setIsAddMode(false);
                    }}
                    className={`shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all active:scale-95 ${
                      isSelected
                        ? 'bg-white text-orange-950 shadow-md font-black scale-105'
                        : 'bg-white/15 hover:bg-white/25 text-white/90 border border-white/20'
                    }`}
                  >
                    {renderIcon(f.iconName, 'w-3.5 h-3.5')}
                    <span>{f.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Modal Body Container */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {isAddMode ? (
              /* Add Custom Prayer Form */
              <motion.form 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleSaveCustomDua}
                className="space-y-4 bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 sm:p-5"
              >
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-1">
                  <Sparkles className="w-4 h-4" />
                  <span>احتفظ بدعائك المفضل عند هذا الشعور</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  أضف أي دعاء أو آية تحب الرجوع إليها عندما يمر قلبك بحالة معينة، وسيتم حفظها على جهازك لتجدها دائماً.
                </p>

                {formError && (
                  <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-200 text-xs font-bold">
                    {formError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    اختر الحالة المناسبة للدعاء:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {HEART_FEELINGS_LIST.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => {
                          triggerHaptic('light');
                          setTargetFeelingForAdd(f.id);
                        }}
                        className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                          targetFeelingForAdd === f.id
                            ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-black'
                            : 'bg-slate-700/50 text-slate-300 border-slate-600 hover:bg-slate-700'
                        }`}
                      >
                        {renderIcon(f.iconName, 'w-3.5 h-3.5')}
                        <span>{f.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    عنوان الدعاء (مثلاً: دعاء تفريج الهم):
                  </label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="اكتب عنواناً مختصراً..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    نص الدعاء أو الآية الكريمة: <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder="اكتب الدعاء هنا بخشوع..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors leading-relaxed"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    المصدر أو المرجع (اختياري):
                  </label>
                  <input
                    type="text"
                    value={customSource}
                    onChange={(e) => setCustomSource(e.target.value)}
                    placeholder="مثال: مأثور، سورة يس، دعاء الوالدين..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddMode(false)}
                    className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold transition-all"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 text-xs font-black transition-all shadow-md active:scale-95"
                  >
                    حفظ الدعاء للحالة
                  </button>
                </div>
              </motion.form>
            ) : (
              /* Regular View with Tabs */
              <>
                {/* Spiritual Insight Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-850 border border-slate-700/80 shadow-sm relative overflow-hidden">
                  <div className="flex items-start gap-3">
                    <div className="w-2 rounded-full bg-amber-500 self-stretch shrink-0" />
                    <div>
                      <h4 className="font-bold text-sm text-amber-300 mb-1">
                        {currentFeeling.headline}
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {currentFeeling.description}
                      </p>
                      <div className="mt-2 text-[11px] text-amber-200/90 font-medium bg-amber-500/10 px-2.5 py-1.5 rounded-lg border border-amber-500/20">
                        💡 <span className="font-bold">همسة للقلب:</span> {currentFeeling.spiritualAdvice}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sub Tabs: Duas, Quran, Tasbeeh, Custom */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        setActiveTab('duas');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        activeTab === 'duas'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      أدعية السنة ({currentFeeling.duas.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        setActiveTab('quran');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        activeTab === 'quran'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      آيات السكينة ({currentFeeling.quranAyahs.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        setActiveTab('tasbeeh');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        activeTab === 'tasbeeh'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      سبحة الورد 📿
                    </button>
                    {feelingCustomDuas.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic('light');
                          setActiveTab('custom');
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          activeTab === 'custom'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        أدعيتي ({feelingCustomDuas.length})
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      setTargetFeelingForAdd(currentFeeling.id);
                      setIsAddMode(true);
                    }}
                    className="text-amber-400 hover:text-amber-300 text-xs font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">أضف دعاء</span>
                  </button>
                </div>

                {/* TAB 1: Prophetic Duas */}
                {activeTab === 'duas' && (
                  <div className="space-y-3">
                    {currentFeeling.duas.map((dua) => (
                      <div
                        key={dua.id}
                        className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700/80 hover:border-slate-600 transition-all shadow-sm space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <h5 className="font-bold text-amber-300 text-sm flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            <span>{dua.title}</span>
                          </h5>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-700 text-slate-300 font-medium">
                            {dua.source}
                          </span>
                        </div>

                        <p className="text-sm sm:text-base font-bold text-white leading-loose font-serif-uthmani">
                          « {dua.text} »
                        </p>

                        {dua.note && (
                          <div className="text-xs text-slate-400 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                            {dua.note}
                          </div>
                        )}

                        <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-700/50">
                          <button
                            type="button"
                            onClick={() => handleCopy(dua.text, dua.id)}
                            className="p-2 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs flex items-center gap-1.5"
                            title="نسخ الدعاء"
                          >
                            {copiedId === dua.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-emerald-400 font-bold">تم النسخ</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>نسخ</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleShare(dua.title, dua.text, dua.source)}
                            className="p-2 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs flex items-center gap-1.5"
                            title="مشاركة"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                            <span>مشاركة</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* TAB 2: Quran Verses */}
                {activeTab === 'quran' && (
                  <div className="space-y-3">
                    {currentFeeling.quranAyahs.map((ayah, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700/80 hover:border-slate-600 transition-all shadow-sm space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                            {ayah.surah}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleShare(ayah.surah, ayah.text, ayah.surah)}
                            className="text-slate-400 hover:text-slate-200 transition-colors"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                        </div>

                        <p className="text-base sm:text-lg font-bold text-white text-center leading-loose font-serif-uthmani py-2 px-3 bg-slate-900/40 rounded-xl border border-slate-800">
                          ﴿ {ayah.text} ﴾
                        </p>

                        {ayah.reflection && (
                          <div className="text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 leading-relaxed">
                            <span className="text-amber-400 font-bold">تأمل: </span>
                            {ayah.reflection}
                          </div>
                        )}

                        <div className="flex items-center justify-end">
                          <button
                            type="button"
                            onClick={() => handleCopy(ayah.text, `ayah-${index}`)}
                            className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                          >
                            {copiedId === `ayah-${index}` ? (
                              <span className="text-emerald-400 font-bold flex items-center gap-1">
                                <Check className="w-3.5 h-3.5" /> تم النسخ
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <Copy className="w-3.5 h-3.5" /> نسخ الآية
                              </span>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* TAB 3: Interactive Tasbeeh */}
                {activeTab === 'tasbeeh' && (
                  <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-850 to-slate-900 border border-slate-700/80 text-center space-y-4">
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-amber-400">
                        {currentFeeling.tasbeeh.title}
                      </span>
                      <h4 className="text-lg sm:text-xl font-bold text-white px-2 leading-relaxed">
                        « {currentFeeling.tasbeeh.dhikr} »
                      </h4>
                      <p className="text-xs text-slate-400 max-w-md mx-auto pt-1">
                        {currentFeeling.tasbeeh.virtue}
                      </p>
                    </div>

                    {/* Tasbeeh Button */}
                    <div className="flex flex-col items-center justify-center pt-2">
                      <motion.button
                        whileTap={{ scale: 0.92 }}
                        onClick={handleTasbeehClick}
                        className={`w-36 h-36 rounded-full flex flex-col items-center justify-center border-4 shadow-xl transition-all select-none cursor-pointer ${
                          isTasbeehCompleted
                            ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 border-emerald-300 text-white shadow-emerald-900/30'
                            : 'bg-gradient-to-tr from-amber-600 via-orange-600 to-rose-600 border-amber-300 text-white shadow-orange-900/30 hover:shadow-2xl'
                        }`}
                      >
                        <span className="text-3xl font-black font-mono">
                          {currentTasbeehCount}
                        </span>
                        <span className="text-[11px] font-bold opacity-90 mt-1">
                          من {currentFeeling.tasbeeh.targetCount}
                        </span>
                        <span className="text-[10px] opacity-75 mt-0.5">
                          اضغط للتسبيح
                        </span>
                      </motion.button>

                      {isTasbeehCompleted && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="mt-3 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20"
                        >
                          🎉 بارك الله فيك، أتممت الورد المقترح لهذا الشعور!
                        </motion.div>
                      )}

                      <div className="mt-4 flex items-center gap-3">
                        <button
                          type="button"
                          onClick={handleTasbeehReset}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>إعادة تعيين</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 4: Custom User Prayers */}
                {activeTab === 'custom' && (
                  <div className="space-y-3">
                    {feelingCustomDuas.length === 0 ? (
                      <div className="text-center py-8 text-slate-400 space-y-2">
                        <Heart className="w-10 h-10 text-slate-600 mx-auto" />
                        <p className="text-xs">لم تقم بإضافة أي دعاء مخصص لشعور "{currentFeeling.label}" حتى الآن.</p>
                        <button
                          type="button"
                          onClick={() => {
                            setTargetFeelingForAdd(currentFeeling.id);
                            setIsAddMode(true);
                          }}
                          className="px-4 py-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold hover:bg-amber-500/30 transition-colors"
                        >
                          + إضافة دعاء الآن
                        </button>
                      </div>
                    ) : (
                      feelingCustomDuas.map((item) => (
                        <div
                          key={item.id}
                          className="p-4 rounded-2xl bg-slate-800/90 border border-amber-500/30 hover:border-amber-500/50 transition-all shadow-sm space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <h5 className="font-bold text-amber-300 text-sm flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                              <span>{item.title}</span>
                            </h5>
                            <button
                              type="button"
                              onClick={() => handleDeleteCustomDua(item.id)}
                              className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                              title="حذف الدعاء"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <p className="text-sm font-bold text-white leading-relaxed">
                            {item.text}
                          </p>

                          {item.source && (
                            <div className="text-[11px] text-slate-400">
                              المصدر: {item.source}
                            </div>
                          )}

                          <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-700/50">
                            <button
                              type="button"
                              onClick={() => handleCopy(item.text, item.id)}
                              className="p-2 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs flex items-center gap-1.5"
                            >
                              {copiedId === item.id ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                  <span className="text-emerald-400 font-bold">تم النسخ</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>نسخ</span>
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleShare(item.title, item.text, item.source || '')}
                              className="p-2 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs flex items-center gap-1.5"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                              <span>مشاركة</span>
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 px-5">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              أدعية مأثورة وآيات بينات لطمأنينة القلب
            </span>
            <button
              type="button"
              onClick={onClose}
              className="font-bold text-amber-400 hover:text-amber-300"
            >
              إغلاق
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return typeof document !== 'undefined' ? createPortal(content, document.body) : content;
};
