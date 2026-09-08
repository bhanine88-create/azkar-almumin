import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, Plus, CheckCircle2, ChevronLeft, Trash2, Edit2, Play, BookOpen, Heart, Zap, Award, Calendar, CalendarPlus, CalendarCheck, Loader2 } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { SpiritualGoal } from '../types';
import { BackButton } from './ui/BackButton';
import { cn } from '../lib/utils';
import { calendarService } from '../services/calendarService';

export const SpiritualGoals: React.FC = () => {
  const { progress, updateProgress, settings } = useAppContext();
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [type, setType] = useState<SpiritualGoal['type']>('quran');
  const [target, setTarget] = useState(10);
  const [syncWithCalendar, setSyncWithCalendar] = useState(false);
  const [reminderTime, setReminderTime] = useState('09:00');
  const [isSyncing, setIsSyncing] = useState(false);
  
  const isRTL = settings.appLanguage === 'ar';
  
  const goals = useMemo(() => progress.spiritualGoals || [], [progress.spiritualGoals]);

  // Reset progress daily
  useEffect(() => {
    let changed = false;
    const today = new Date().toISOString().split('T')[0];
    const updatedGoals = goals.map(g => {
      if (g.isDaily && g.lastUpdated.split('T')[0] !== today) {
        changed = true;
        return { ...g, progress: 0, lastUpdated: new Date().toISOString() };
      }
      return g;
    });
    
    if (changed) {
      updateProgress({ ...progress, spiritualGoals: updatedGoals });
    }
  }, [goals, progress, updateProgress]);

  const handleAddGoal = async () => {
    if (!title) return;
    
    setIsSyncing(true);
    let successfullySynced = false;
    
    if (syncWithCalendar) {
      try {
        if (!calendarService.isAuthenticated()) {
          await calendarService.signIn();
        }
        
        // Calculate end time (+15 mins)
        const [hours, minutes] = reminderTime.split(':').map(Number);
        const endDate = new Date();
        endDate.setHours(hours, minutes + 15);
        const endHours = String(endDate.getHours()).padStart(2, '0');
        const endMins = String(endDate.getMinutes()).padStart(2, '0');
        const endTime = `${endHours}:${endMins}`;

        await calendarService.addEvent({
          summary: `[أذكار المؤمن] ${title}`,
          description: `هدف يومي: ${title}\nالعدد المطلوب: ${target}`,
          startTime: reminderTime,
          endTime: endTime,
          isRecurring: true,
          colorId: '2' // Sage green color in GCal
        });
        successfullySynced = true;
      } catch (err) {
        console.error('Failed to sync to calendar:', err);
        alert(isRTL ? 'فشل الربط بتقويم جوجل. تأكد من تسجيل الدخول ومنح الصلاحيات.' : 'Failed to sync with Google Calendar.');
      }
    }

    const newGoal: SpiritualGoal = {
      id: Date.now().toString(),
      title,
      type,
      target,
      progress: 0,
      lastUpdated: new Date().toISOString(),
      isDaily: true,
      syncedToCalendar: successfullySynced,
      reminderTime: successfullySynced ? reminderTime : undefined,
    };
    
    updateProgress({
      ...progress,
      spiritualGoals: [...goals, newGoal]
    });
    
    setTitle('');
    setTarget(10);
    setSyncWithCalendar(false);
    setReminderTime('09:00');
    setShowAddForm(false);
    setIsSyncing(false);
  };

  const handleDeleteGoal = (id: string) => {
    updateProgress({
      ...progress,
      spiritualGoals: goals.filter(g => g.id !== id)
    });
  };

  const handleIncrement = (id: string, amount: number = 1) => {
    let completed = false;
    const updatedGoals = goals.map(g => {
      if (g.id === id) {
        const newProgress = Math.min(g.target, g.progress + amount);
        if (g.progress < g.target && newProgress >= g.target) {
          completed = true;
        }
        return { ...g, progress: newProgress, lastUpdated: new Date().toISOString() };
      }
      return g;
    });

    updateProgress({ ...progress, spiritualGoals: updatedGoals });
  };

  const handleSyncExistingGoal = async (goal: SpiritualGoal) => {
    try {
      if (!calendarService.isAuthenticated()) {
        await calendarService.signIn();
      }
      
      const time = goal.reminderTime || '09:00';
      const [hours, minutes] = time.split(':').map(Number);
      const endDate = new Date();
      endDate.setHours(hours, minutes + 15);
      const endHours = String(endDate.getHours()).padStart(2, '0');
      const endMins = String(endDate.getMinutes()).padStart(2, '0');
      const endTime = `${endHours}:${endMins}`;

      await calendarService.addEvent({
        summary: `[أذكار المؤمن] ${goal.title}`,
        description: `هدف يومي: ${goal.title}\nالعدد المطلوب: ${goal.target}`,
        startTime: time,
        endTime: endTime,
        isRecurring: true,
        colorId: '2'
      });
      
      const updatedGoals = goals.map(g => {
        if (g.id === goal.id) {
          return { ...g, syncedToCalendar: true, reminderTime: time };
        }
        return g;
      });
      updateProgress({ ...progress, spiritualGoals: updatedGoals });
      alert(isRTL ? 'تم الربط بتقويم جوجل بنجاح!' : 'Synced to Google Calendar successfully!');
    } catch (err) {
      console.error(err);
      alert(isRTL ? 'فشل الربط بتقويم جوجل.' : 'Failed to sync with Google Calendar.');
    }
  };

  const getTypeIcon = (t: string) => {
    switch (t) {
      case 'quran': return <BookOpen size={18} className="text-purple-500" />;
      case 'dhikr': return <Heart size={18} className="text-rose-500" />;
      case 'prayer': return <Award size={18} className="text-emerald-500" />;
      default: return <Target size={18} className="text-blue-500" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-y-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-black/5 dark:border-white/5 py-4 px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white">
              {isRTL ? 'أهدافي الروحية' : 'Spiritual Goals'}
            </h1>
            <p className="text-[10px] text-slate-500 font-black tracking-widest uppercase">
              {isRTL ? 'تخصيص أهدافك اليومية' : 'Set your daily goals'}
            </p>
          </div>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="w-10 h-10 rounded-2xl bg-teal-500 text-white flex items-center justify-center hover:bg-teal-600 transition-colors shadow-lg shadow-teal-500/20"
        >
          <Plus size={20} />
        </button>
      </header>

      <div className="p-4 space-y-4 pb-24">
        {/* Add Form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-black/5 dark:border-white/5 shadow-sm overflow-hidden"
            >
              <h3 className="font-black text-slate-800 dark:text-white mb-4 text-sm">
                {isRTL ? 'إضافة هدف يومي جديد' : 'Add New Daily Goal'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                    {isRTL ? 'عنوان الهدف' : 'Goal Title'}
                  </label>
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={isRTL ? 'مثال: قراءة 10 صفحات من القرآن' : 'e.g., Read 10 pages'}
                    className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                      {isRTL ? 'النوع' : 'Type'}
                    </label>
                    <select 
                      value={type}
                      onChange={(e) => setType(e.target.value as any)}
                      className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                    >
                      <option value="quran">{isRTL ? 'قرآن' : 'Quran'}</option>
                      <option value="dhikr">{isRTL ? 'ذكر' : 'Dhikr'}</option>
                      <option value="prayer">{isRTL ? 'صلاة' : 'Prayer'}</option>
                      <option value="other">{isRTL ? 'أخرى' : 'Other'}</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                      {isRTL ? 'العدد المطلوب' : 'Target'}
                    </label>
                    <input 
                      type="number" 
                      min="1"
                      value={target}
                      onChange={(e) => setTarget(parseInt(e.target.value) || 1)}
                      className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                    />
                  </div>
                </div>

                {/* Calendar Sync Toggle */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        className="sr-only"
                        checked={syncWithCalendar}
                        onChange={(e) => setSyncWithCalendar(e.target.checked)}
                      />
                      <div className={cn(
                        "w-11 h-6 rounded-full transition-colors",
                        syncWithCalendar ? "bg-teal-500" : "bg-slate-200 dark:bg-slate-700"
                      )}></div>
                      <div className={cn(
                        "absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform",
                        syncWithCalendar ? (isRTL ? "-translate-x-5" : "translate-x-5") : ""
                      )}></div>
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2">
                        <Calendar size={16} className="text-teal-500" />
                        {isRTL ? 'ربط بتقويم جوجل' : 'Sync to Google Calendar'}
                      </span>
                      <p className="text-[10px] text-slate-500">
                        {isRTL ? 'للتذكير اليومي التلقائي' : 'For automatic daily reminders'}
                      </p>
                    </div>
                  </label>
                  
                  {syncWithCalendar && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3"
                    >
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                        {isRTL ? 'وقت التذكير' : 'Reminder Time'}
                      </label>
                      <input 
                        type="time" 
                        value={reminderTime}
                        onChange={(e) => setReminderTime(e.target.value)}
                        className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                      />
                    </motion.div>
                  )}
                </div>

                <div className="pt-2 flex gap-3">
                  <button 
                    onClick={handleAddGoal}
                    disabled={isSyncing}
                    className="flex-1 bg-teal-600 text-white rounded-xl py-3 font-black text-sm hover:bg-teal-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {isSyncing ? <Loader2 size={18} className="animate-spin" /> : null}
                    {isRTL ? 'حفظ الهدف' : 'Save Goal'}
                  </button>
                  <button 
                    onClick={() => setShowAddForm(false)}
                    disabled={isSyncing}
                    className="flex-1 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl py-3 font-black text-sm hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors disabled:opacity-70"
                  >
                    {isRTL ? 'إلغاء' : 'Cancel'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Goals List */}
        {goals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
            <Target size={48} className="text-slate-400 mb-4" />
            <p className="font-black text-slate-500">
              {isRTL ? 'لم تقم بإضافة أهداف بعد.' : 'No goals added yet.'}
            </p>
            <p className="text-xs font-bold text-slate-400 mt-2">
              {isRTL ? 'اضغط على + لإضافة هدف يومي جديد.' : 'Tap + to add a new daily goal.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {goals.map(goal => {
              const percent = Math.min(100, (goal.progress / goal.target) * 100);
              const isCompleted = goal.progress >= goal.target;
              
              return (
                <motion.div 
                  key={goal.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "p-5 rounded-[2rem] border transition-all relative overflow-hidden",
                    isCompleted 
                      ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/50" 
                      : "bg-white dark:bg-slate-900 border-black/5 dark:border-white/5 shadow-sm"
                  )}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                        isCompleted ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "bg-slate-100 dark:bg-slate-800"
                      )}>
                        {isCompleted ? <CheckCircle2 size={24} /> : getTypeIcon(goal.type)}
                      </div>
                      <div>
                        <h4 className="font-black text-slate-800 dark:text-white leading-tight flex items-center gap-2">
                          {goal.title}
                          {goal.syncedToCalendar && (
                            <span title={isRTL ? 'مرتبط بالتقويم' : 'Synced to Calendar'}>
                              <CalendarCheck size={14} className="text-teal-500" />
                            </span>
                          )}
                        </h4>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          {isCompleted ? (isRTL ? 'اكتمل' : 'Completed') : (isRTL ? 'قيد الإنجاز' : 'In Progress')}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {!goal.syncedToCalendar && (
                        <button 
                          onClick={() => handleSyncExistingGoal(goal)}
                          className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-teal-600 hover:bg-teal-100 dark:hover:bg-teal-900/50 flex items-center justify-center transition-colors"
                          title={isRTL ? 'ربط بالتقويم' : 'Sync to Calendar'}
                        >
                          <CalendarPlus size={14} />
                        </button>
                      )}
                      <button 
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 flex items-center justify-center transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-end">
                      <div className="text-2xl font-black text-teal-600 dark:text-teal-400">
                        {goal.progress} <span className="text-sm text-slate-400 dark:text-slate-500">/ {goal.target}</span>
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase">{Math.round(percent)}%</span>
                    </div>
                    
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          isCompleted ? "bg-emerald-500" : "bg-teal-500"
                        )}
                      />
                    </div>
                  </div>

                  {!isCompleted && (
                    <div className="flex gap-2 mt-4">
                      <button 
                        onClick={() => handleIncrement(goal.id, 1)}
                        className="flex-1 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-xl py-2 text-sm font-black hover:bg-teal-500 hover:text-white transition-colors"
                      >
                        +1
                      </button>
                      <button 
                        onClick={() => handleIncrement(goal.id, goal.target - goal.progress)}
                        className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl py-2 text-sm font-black hover:bg-emerald-500 hover:text-white transition-colors"
                      >
                        {isRTL ? 'إكمال' : 'Complete'}
                      </button>
                    </div>
                  )}
                  {isCompleted && (
                    <div className="mt-4 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 p-3 rounded-xl text-center text-xs font-black flex items-center justify-center gap-2">
                      <Award size={16} />
                      {isRTL ? 'أحسنت! تقبل الله طاعتك.' : 'Well done! May Allah accept.'}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

