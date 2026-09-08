import { BackButton } from './ui/BackButton';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, BookOpen, Calendar, CheckCircle2, Plus, Trash2, Edit2, Play, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useAppContext } from '../AppContext';
import { useTranslation } from '../i18n';
import { useSmartNavigation } from "../lib/navigation";
import { doc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { handleFirestoreError, OperationType } from '../lib/firestoreError';
import { safeLocalStorageGetItem, safeLocalStorageSetItem, safeLocalStorageRemoveItem } from "../utils/storage";

interface KhatmaGoal {
  id: string;
  name: string;
  days: number;
  startDate: string;
  currentPage: number;
  totalPages: number;
}

export const Khatma: React.FC = () => {
  const { navigate, goBack } = useSmartNavigation();
  const { settings } = useAppContext();
  const { t } = useTranslation(settings.appLanguage);
  const [goals, setGoals] = useState<KhatmaGoal[]>(() => {
    const saved = safeLocalStorageGetItem('believer_khatma_v2');
    return saved ? JSON.parse(saved) : [];
  });
  const [showAdd, setShowAdd] = useState(false);

  const [newGoal, setNewGoal] = useState({ name: 'ختمة جديدة', days: 30 });

  useEffect(() => {
    safeLocalStorageSetItem('believer_khatma_v2', JSON.stringify(goals));
  }, [goals]);

  const addGoal = () => {
    const goal: KhatmaGoal = {
      id: Date.now().toString(),
      name: newGoal.name,
      days: newGoal.days,
      startDate: new Date().toISOString(),
      currentPage: 1,
      totalPages: 604
    };
    setGoals([...goals, goal]);
    setShowAdd(false);
  };

  const deleteGoal = (id: string) => {
    setGoals(goals.filter(g => g.id !== id));
  };

  const updateProgress = (id: string, page: number) => {
    const targetPage = Math.min(Math.max(1, page), 604);
    const goal = goals.find(g => g.id === id);
    
    if (goal && targetPage >= goal.totalPages && goal.currentPage < goal.totalPages) {
      // Khatma completed! Increment global stats
      if (auth.currentUser) {
        const path = 'stats/global';
        updateDoc(doc(db, 'stats', 'global'), {
          totalKhatmas: increment(1),
          lastUpdated: serverTimestamp()
        }).catch(err => {
          console.warn('Global khatma count failed:', err);
          // Optional: handleFirestoreError(err, OperationType.UPDATE, path);
        });
      }
    }

    setGoals(goals.map(g => g.id === id ? { ...g, currentPage: targetPage } : g));
  };

  const calculateDaily = (goal: KhatmaGoal) => {
    const remainingPages = goal.totalPages - goal.currentPage + 1;
    const start = new Date(goal.startDate);
    const end = new Date(start.getTime() + goal.days * 24 * 60 * 60 * 1000);
    const now = new Date();
    const remainingDays = Math.max(1, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    return Math.ceil(remainingPages / remainingDays);
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 pb-4">
      <header className="sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md py-4 px-4 flex justify-between items-center border-b border-black/5 z-20">
        <div className="flex items-center gap-3">
          <BackButton forceFallback={true} />
          <div>
            <h1 className="text-xl font-black bg-gradient-to-r from-emerald-600 to-teal-700 bg-clip-text text-transparent">{t('khatma')}</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('subtitle_khatma')}</p>
          </div>
        </div>
        <button onClick={() => setShowAdd(true)} className="p-2.5 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20">
          <Plus size={20} />
        </button>
      </header>

      <div className="p-4 max-w-2xl mx-auto space-y-6">
        {goals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-2xl flex items-center justify-center text-slate-400">
              <BookOpen size={40} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">لا توجد ختمات حالية</h3>
              <p className="text-sm text-slate-500">ابدأ بتنظيم قراءتك للقرآن الكريم اليوم</p>
            </div>
            <button 
              onClick={() => setShowAdd(true)}
              className="px-8 py-3 bg-emerald-600 text-white rounded-2xl font-bold shadow-xl shadow-emerald-500/20 hover:scale-105 transition-all"
            >
              إنشاء ختمة جديدة
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {goals.map(goal => {
              const daily = calculateDaily(goal);
              const progress = (goal.currentPage / goal.totalPages) * 100;
              return (
                <motion.div 
                  key={goal.id}
                  layout
                  className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-6"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                        <Calendar size={24} />
                      </div>
                      <div>
                        <h3 className="font-black text-lg">{goal.name}</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase">المدة: {goal.days} يوم</p>
                      </div>
                    </div>
                    <button onClick={() => deleteGoal(goal.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-500">التقدم الحالي</span>
                      <span className="text-emerald-600">{Math.round(progress)}%</span>
                    </div>
                    <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full"
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-400">
                      <span>صفحة {goal.currentPage}</span>
                      <span>صفحة {goal.totalPages}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">ورد اليوم</p>
                      <p className="text-xl font-black text-emerald-600">{daily} صفحات</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">الصفحة التالية</p>
                      <p className="text-xl font-black text-slate-800 dark:text-slate-100">{goal.currentPage}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <button 
                      onClick={() => updateProgress(goal.id, goal.currentPage + 1)}
                      className="border border-emerald-200 dark:border-emerald-800 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 py-3 rounded-xl font-bold text-xs hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all flex items-center justify-center gap-1 shadow-sm"
                    >
                      <CheckCircle2 size={14} />
                      + صفحة
                    </button>
                    <button 
                      onClick={() => updateProgress(goal.id, goal.currentPage + 10)}
                      className="border border-emerald-200 dark:border-emerald-800 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 py-3 rounded-xl font-bold text-xs hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all flex items-center justify-center gap-1 shadow-sm"
                    >
                      <CheckCircle2 size={14} />
                      + حزب
                    </button>
                    <button 
                      onClick={() => updateProgress(goal.id, goal.currentPage + 20)}
                      className="bg-emerald-600 text-white py-3 rounded-xl font-bold text-xs shadow-md shadow-emerald-500/20 hover:bg-emerald-700 transition-all flex items-center justify-center gap-1"
                    >
                      <CheckCircle2 size={14} />
                      + جزء
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-4 bg-slate-50 dark:bg-slate-800/80 p-2 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                     <span className="text-xs font-bold text-slate-500 px-2 whitespace-nowrap">وصلت لصفحة:</span>
                     <input 
                       type="number"
                       min="1"
                       max="604"
                       value={goal.currentPage}
                       onChange={(e) => updateProgress(goal.id, parseInt(e.target.value) || 1)}
                       className="w-full bg-white dark:bg-slate-900 p-2 rounded-xl text-center font-black text-emerald-700 dark:text-emerald-400 outline-none border border-black/5 dark:border-white/5 focus:border-emerald-500/50 transition-colors"
                     />
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={async () => {
                        try {
                          // Try to find the surah for this page using AlQuran Cloud API
                          const res = await fetch(`https://api.alquran.cloud/v1/page/${goal.currentPage}`);
                          const data = await res.json();
                          if (data.code === 200 && data.data && data.data.ayahs && data.data.ayahs.length > 0) {
                            const surahNumber = data.data.ayahs[0].surah.number;
                            navigate(`/quran/${surahNumber}?page=${goal.currentPage}`);
                            return;
                          }
                        } catch (err) {
                          console.error("Failed to fetch page data for routing", err);
                        }
                        // Fallback
                        navigate('/quran');
                      }}
                      className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-2xl font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                    >
                      <Play size={18} />
                      متابعة القراءة من المصحف
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAdd(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-t-2xl sm:rounded-2xl p-8 pb-12 sm:pb-8 space-y-6 shadow-2xl max-h-[85vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black">ختمة جديدة</h2>
                <button onClick={() => setShowAdd(false)} className="w-10 h-10 bg-rose-500 text-white rounded-full flex items-center justify-center hover:bg-rose-600 transform transition-all duration-75 active:scale-[0.85] active:opacity-70 shadow-lg shadow-rose-500/20">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase px-1">اسم الختمة</label>
                  <input 
                    type="text" 
                    value={newGoal.name}
                    onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none border-2 border-transparent focus:border-emerald-500/30 font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase px-1">المدة (بالأيام)</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[7, 15, 30, 60, 180, 365].map(d => (
                      <button 
                        key={d}
                        onClick={() => setNewGoal({ ...newGoal, days: d })}
                        className={cn(
                          "py-3 rounded-xl font-bold transition-all",
                          newGoal.days === d ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20" : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"
                        )}
                      >
                        {d === 365 ? 'سنة' : d === 180 ? '٦ أشهر' : d === 30 ? 'شهر' : `${d} يوم`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button 
                onClick={addGoal}
                className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 transition-all"
              >
                بدء الختمة
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

