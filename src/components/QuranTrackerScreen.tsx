import { BackButton } from './ui/BackButton';
import React, { useState } from 'react';
import {} from 'react-router-dom';
import { 
  ChevronRight, 
  BookOpen, 
  Plus, 
  History, 
  Target, 
  CheckCircle2,
  Trophy,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../AppContext';
import { cn } from '../lib/utils';
import { useSmartNavigation } from "../lib/navigation";

export const QuranTrackerScreen: React.FC = () => {
  const { navigate, goBack } = useSmartNavigation();
  const { progress, addQuranLog, updateQuranGoal, updateLastRead, toggleSurahRead } = useAppContext();
  const [showAddLog, setShowAddLog] = useState(false);
  const [showGoalSettings, setShowGoalSettings] = useState(false);

  const quranProgress = progress.quranProgress || { logs: [], dailyGoal: 10 };
  
  const todayLogs = quranProgress.logs.filter(log => {
    const logDate = new Date(log.date).toDateString();
    return logDate === new Date().toDateString();
  });

  const todayTotal = todayLogs.reduce((sum, log) => sum + log.amount, 0);
  const progressPercent = Math.min(100, (todayTotal / quranProgress.dailyGoal) * 100);

  const khatmaProgress = React.useMemo(() => {
    const totalPages = 604;
    const readPagesCount = quranProgress.readPages?.length || 0;
    return {
      percent: (readPagesCount / totalPages) * 100,
      readPagesCount,
      totalPages
    };
  }, [quranProgress.readPages]);

  const handleAddLog = (amount: number, unit: 'page' | 'quarter' | 'eighth' | 'hizb' | 'juz') => {
    addQuranLog({ amount, unit });
    setShowAddLog(false);
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 pb-4">
      <header className="sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md py-4 px-4 flex justify-between items-center border-b border-black/5 z-20">
        <div className="flex items-center gap-3">
          <BackButton forceFallback={true} />
          <div>
            <h1 className="text-xl font-black bg-gradient-to-r from-emerald-600 to-teal-700 bg-clip-text text-transparent">متابع الورد اليومي</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">سجل قراءتك للقرآن</p>
          </div>
        </div>
        <button 
          onClick={() => setShowGoalSettings(true)}
          className="p-2.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl hover:bg-emerald-100 transition-all"
        >
          <Target size={20} />
        </button>
      </header>

      <div className="p-4 max-w-2xl mx-auto space-y-6">
        {/* Banner to Unified Devotion & Quran Dashboard */}
        <button
          onClick={() => navigate('/adhkar-quran-dashboard')}
          className="w-full p-3.5 bg-gradient-to-r from-teal-600 to-emerald-700 text-white rounded-2xl flex items-center justify-between shadow-md hover:shadow-lg transition-all active:scale-98 cursor-pointer"
        >
          <div className="flex items-center gap-3 text-right">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <TrendingUp size={20} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-black text-white">لوحة التحليل البياني وتكرار التلاوة (Recharts)</p>
              <p className="text-[10px] text-emerald-100/90">عرض رسوم بيانية لمسار التلاوة ومعدل ختم المصحف والأذكار</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-white rotate-180" />
        </button>

        {/* Progress Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm space-y-6"
        >
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase">إنجاز اليوم</p>
              <h2 className="text-4xl font-black text-slate-800 dark:text-slate-100">
                {todayTotal} <span className="text-lg font-bold text-slate-400">صفحة</span>
              </h2>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-emerald-600 uppercase">الهدف</p>
              <p className="text-lg font-black text-slate-600 dark:text-slate-400">{quranProgress.dailyGoal} صفحة</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-1">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full shadow-sm"
              />
            </div>
            <div className="flex justify-between items-center px-1">
              <span className="text-[10px] font-black text-slate-400 uppercase">التقدم</span>
              <span className="text-sm font-black text-emerald-600">{Math.round(progressPercent)}%</span>
            </div>
          </div>

          <button 
            onClick={() => setShowAddLog(true)}
            className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 transition-all flex items-center justify-center gap-3"
          >
            <Plus size={24} />
            تسجيل قراءة جديدة
          </button>
        </motion.div>

        {/* Surah Tracker */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black flex items-center gap-2">
              <BookOpen size={20} className="text-emerald-600" />
              تتبع السور المختومة
            </h3>
            <span className="text-xs font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-full">
              {quranProgress.readSurahs?.length || 0} / 114
            </span>
          </div>
          <div className="grid grid-cols-6 gap-2">
            {Array.from({ length: 114 }).map((_, i) => (
              <button
                key={i + 1}
                onClick={() => toggleSurahRead(i + 1)}
                className={cn(
                  "w-full aspect-square rounded-lg text-[10px] sm:text-xs font-black flex items-center justify-center transition-all",
                  quranProgress.readSurahs?.includes(i + 1)
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-slate-200"
                )}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/30 rounded-xl flex items-center justify-center text-amber-600 mb-4">
              <Trophy size={20} />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">إجمالي الصفحات</p>
            <p className="text-xl font-black">{quranProgress.logs.reduce((s, l) => s + l.amount, 0)}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 mb-4">
              <TrendingUp size={20} />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">آخر قراءة</p>
            <p className="text-sm font-black truncate">{quranProgress.lastRead ? `${quranProgress.lastRead.surah}${quranProgress.lastRead.aya ? ' - آية ' + quranProgress.lastRead.aya : ''}` : 'لم تسجل بعد'}</p>
          </div>
        </div>

        {/* Recent Logs */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-lg font-black flex items-center gap-2">
              <History size={20} className="text-emerald-600" />
              السجل الأخير
            </h3>
          </div>
          
          <div className="space-y-3">
            {quranProgress.logs.slice(0, 5).map((log) => (
              <div 
                key={log.id}
                className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex justify-between items-center"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-emerald-600">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-sm">تمت قراءة {log.amount} {log.unit}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">
                      {new Date(log.date).toLocaleDateString('ar-SA', { day: 'numeric', month: 'long' })}
                    </p>
                  </div>
                </div>
                <div className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-full">
                  +{log.amount * 5} نقطة
                </div>
              </div>
            ))}
            {quranProgress.logs.length === 0 && (
              <div className="text-center py-10 text-slate-400 font-bold">
                لا يوجد سجلات قراءة بعد
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Log Modal */}
      <AnimatePresence>
        {showAddLog && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddLog(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-t-2xl sm:rounded-2xl p-8 pb-12 sm:pb-8 space-y-6 shadow-2xl max-h-[85vh] overflow-y-auto"
            >
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-black">تسجيل قراءة</h2>
                <p className="text-sm text-slate-500 font-bold">اختر الكمية التي تمت قراءتها</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {(
                  [
                    { label: 'صفحة واحدة', amount: 1, unit: 'page' },
                    { label: 'ثمن حزب', amount: 1.25, unit: 'eighth' },
                    { label: 'ربع حزب', amount: 2.5, unit: 'quarter' },
                    { label: 'نصف حزب', amount: 5, unit: 'page' },
                    { label: 'حزب كامل', amount: 10, unit: 'hizb' },
                    { label: 'جزء كامل', amount: 20, unit: 'juz' },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.label}
                    onClick={() => handleAddLog(item.amount, item.unit as 'page' | 'quarter' | 'eighth' | 'hizb' | 'juz')}
                    className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-600 transition-all text-center space-y-1 group"
                  >
                    <p className="font-black text-sm group-hover:scale-105 transition-transform">{item.label}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{item.amount} صفحة تقريباً</p>
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-400 uppercase px-1">آخر ما قرأت (اختياري)</label>
                <input 
                  type="text"
                  placeholder="مثال: سورة البقرة آية 100"
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none border-2 border-transparent focus:border-emerald-500/30 font-bold"
                  onChange={(e) => updateLastRead({ surah: e.target.value, aya: 0, page: 0 })}
                />
              </div>

              <button 
                onClick={() => setShowAddLog(false)}
                className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-black"
              >
                إلغاء
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Goal Settings Modal */}
      <AnimatePresence>
        {showGoalSettings && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowGoalSettings(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-t-2xl sm:rounded-2xl p-8 pb-12 sm:pb-8 space-y-6 shadow-2xl max-h-[85vh] overflow-y-auto"
            >
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-black">تحديد الهدف اليومي</h2>
                <p className="text-sm text-slate-500 font-bold">كم صفحة تنوي قراءتها يومياً؟</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[5, 10, 20, 30, 50, 100].map((goal) => (
                  <button
                    key={goal}
                    onClick={() => {
                      updateQuranGoal(goal);
                      setShowGoalSettings(false);
                    }}
                    className={cn(
                      "p-4 rounded-2xl font-black transition-all",
                      quranProgress.dailyGoal === goal 
                        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20" 
                        : "bg-slate-50 dark:bg-slate-800 text-slate-600"
                    )}
                  >
                    {goal}
                  </button>
                ))}
              </div>

              <button 
                onClick={() => setShowGoalSettings(false)}
                className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-black"
              >
                إغلاق
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
