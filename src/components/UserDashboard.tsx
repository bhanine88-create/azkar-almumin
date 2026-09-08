import React from 'react';
import { WeeklySummary } from './WeeklySummary';
import {  Trophy, 
  Flame, 
  Target, 
  Calendar, 
  Zap, 
  Star, 
  TrendingUp, 
  Award,
  BookOpen,
  
  Heart,
  ChevronLeft,
  Sun,
  Sunset,
  Sunrise,
  
  Sparkles,
  Info,
  CheckCircle2,
  Lock,
  BarChart3 , Activity, Moon } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie,
  AreaChart,
  Area,
  Line
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../AppContext';
import { useTranslation } from '../i18n';
import { useChallengeTracker } from '../hooks/useChallengeTracker';
import { CHALLENGES, ChallengeType } from '../challengesData';
import { BackButton } from './ui/BackButton';
import { cn } from '../lib/utils';
import { useSmartNavigation } from "../lib/navigation";

const CustomTooltip = React.memo(({ active, payload, label, isRTL, t, activeChartTab }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-xl text-white space-y-1.5 text-right" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="text-[11px] font-black text-emerald-450 dark:text-emerald-400 uppercase tracking-widest">{label}</div>
        
        {activeChartTab === 'adhkar' && (
          <>
            <div className="text-sm font-black flex items-center gap-4 justify-between">
              <span className="opacity-80">{t('dhikr_completion_rate')}:</span>
              <span className="text-emerald-400 font-extrabold">{payload[0].value}%</span>
            </div>
            <div className="text-[10px] font-bold text-slate-300">
              {data.completedCount} / 4 {t('adhkar_completed')}
            </div>
          </>
        )}
        
        {activeChartTab === 'tasbih' && (
          <div className="text-sm font-black flex items-center gap-4 justify-between">
            <span className="opacity-80 flex items-center gap-1.5"><Zap size={14} className="text-sky-400" /> {t('tasbih_completed')}</span>
            <span className="text-sky-400 font-extrabold">{payload[0].value}</span>
          </div>
        )}
        
        {activeChartTab === 'quran' && (
          <div className="text-sm font-black flex items-center gap-4 justify-between">
            <span className="opacity-80 flex items-center gap-1.5"><BookOpen size={14} className="text-indigo-400" /> {t('quran_read')}</span>
            <span className="text-indigo-400 font-extrabold">{payload[0].value}</span>
          </div>
        )}

        {(data.quran > 0 || data.tasbih > 0) && activeChartTab === 'adhkar' && (
          <div className="pt-2 mt-2 border-t border-white/5 space-y-1">
            {data.quran > 0 && (
              <div className="text-[10px] font-bold text-slate-350 flex items-center gap-1.5 justify-between">
                <span className="flex items-center gap-1"><BookOpen size={10} className="text-indigo-400" /> {t('quran_read')}</span>
                <span className="font-extrabold text-white">{data.quran}</span>
              </div>
            )}
            {data.tasbih > 0 && (
              <div className="text-[10px] font-bold text-slate-350 flex items-center gap-1.5 justify-between">
                <span className="flex items-center gap-1"><Zap size={10} className="text-emerald-400" /> {t('tasbih_completed')}</span>
                <span className="font-extrabold text-white">{data.tasbih}</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
  return null;
});

export const UserDashboard: React.FC = () => {
  const { progress, settings } = useAppContext();
  const { progress: challengeProgress, points: challengePoints } = useChallengeTracker();
  const { navigate } = useSmartNavigation();
  const { t, isRtl: isRTL } = useTranslation(settings.appLanguage);

  // State for interactive charts and day details selection (0-6)
  const [selectedDayIndex, setSelectedDayIndex] = React.useState<number>(6);
  const [activeChartTab, setActiveChartTab] = React.useState<'adhkar' | 'tasbih' | 'quran'>('adhkar');

  // Calculate stats
  const totalPoints = progress.points;
  const level = progress.level;
  const nextLevelPoints = level * 100;
  const pointsInCurrentLevel = totalPoints % 100;
  const progressToNextLevel = (pointsInCurrentLevel / 100) * 100;

  const currentStreak = progress.streak?.current || 0;
  const bestStreak = progress.streak?.best || 0;
  const totalAdhkar = progress.totalAdhkarRecited || 0;
  const tasbihCount = progress.tasbihCount || 0;

  // Calculate total quran time based on pages (estimated 3 mins per page)
  const totalQuranPages = Object.values(progress.dailyStats || {}).reduce((acc, stat) => acc + (stat.quran || 0), 0);
  const totalQuranMinutes = Math.floor(totalQuranPages * 3);
  const quranHours = Math.floor(totalQuranMinutes / 60);
  const quranMins = totalQuranMinutes % 60;

  // Prepare chart data dynamically from dailyStats
  const { activityData, distributionData } = React.useMemo(() => {
    const actData = [];
    const dailyStats = progress.dailyStats || {};
    
    // For Distribution Total
    let morningTotal = 0;
    let eveningTotal = 0;
    let sleepingTotal = 0;
    let wakingTotal = 0;

    Object.values(dailyStats).forEach(stat => {
      const dayAdhkars = stat.adhkar || [];
      if (dayAdhkars.includes('morning') || dayAdhkars.includes('adhkar/morning')) morningTotal++;
      if (dayAdhkars.includes('evening') || dayAdhkars.includes('adhkar/evening')) eveningTotal++;
      if (dayAdhkars.includes('sleeping') || dayAdhkars.includes('sleep') || dayAdhkars.includes('adhkar/sleeping')) sleepingTotal++;
      if (dayAdhkars.includes('waking') || dayAdhkars.includes('adhkar/waking')) wakingTotal++;
    });

    // Determine past 7 days activity
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const stats = dailyStats[dateStr] || { adhkar: [], quran: 0, tasbih: 0 };
      
      const weekdaysAR = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
      const weekdaysEN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dayName = isRTL ? weekdaysAR[d.getDay()] : weekdaysEN[d.getDay()];
      
      const hasMorning = stats.adhkar.includes('morning') || stats.adhkar.includes('adhkar/morning') || stats.adhkar.some((x: string) => x.toLowerCase().includes('morning') || x.includes('الصباح'));
      const hasEvening = stats.adhkar.includes('evening') || stats.adhkar.includes('adhkar/evening') || stats.adhkar.some((x: string) => x.toLowerCase().includes('evening') || x.includes('المساء'));
      const hasSleep = stats.adhkar.includes('sleeping') || stats.adhkar.includes('sleep') || stats.adhkar.includes('adhkar/sleeping') || stats.adhkar.some((x: string) => x.toLowerCase().includes('sleep') || x.includes('النوم'));
      const hasWaking = stats.adhkar.includes('waking') || stats.adhkar.includes('adhkar/waking') || stats.adhkar.some((x: string) => x.toLowerCase().includes('waking') || x.includes('الاستيقاظ'));
      
      const completedCount = (hasMorning ? 1 : 0) + (hasEvening ? 1 : 0) + (hasSleep ? 1 : 0) + (hasWaking ? 1 : 0);
      const completionRate = Math.round((completedCount / 4) * 100);
      
      actData.push({
        name: dayName,
        value: completionRate, // Adhkar Completion Rate (0% - 100%)
        completedCount,
        hasMorning,
        hasEvening,
        hasSleep,
        hasWaking,
        quran: stats.quran || 0,
        tasbih: stats.tasbih || 0,
        date: dateStr,
      });
    }

    const distData = [
      { name: t('morning'), value: Math.max(0, morningTotal), color: '#f59e0b' },
      { name: t('evening'), value: Math.max(0, eveningTotal), color: '#6366f1' },
      { name: t('sleep'), value: Math.max(0, sleepingTotal), color: '#8b5cf6' },
      { name: t('waking'), value: Math.max(0, wakingTotal), color: '#10b981' },
    ];

    return { activityData: actData, distributionData: distData };
  }, [progress.dailyStats, isRTL]);

  // Retrieve the selected day details from chart data
  const selectedDay = React.useMemo(() => {
    if (selectedDayIndex !== null && activityData[selectedDayIndex]) {
      return activityData[selectedDayIndex];
    }
    return activityData[6] || null;
  }, [activityData, selectedDayIndex]);

  const dailyChallenges = CHALLENGES.filter(c => c.type === ChallengeType.DAILY);
  const completedDailyCount = dailyChallenges.filter(c => challengeProgress[c.id]?.completed).length;

  const badges = [
    { id: '1', name: isRTL ? 'المبتدئ' : 'Beginner', icon: <Star size={16} />, earned: totalPoints > 50, color: 'bg-blue-500' },
    { id: '2', name: isRTL ? 'المواظب' : 'Consistent', icon: <Flame size={16} />, earned: currentStreak >= 3, color: 'bg-orange-500' },
    { id: '3', name: isRTL ? 'الذاكر' : 'The Dhakir', icon: <Zap size={16} />, earned: totalAdhkar >= 5, color: 'bg-yellow-500' },
    { id: '4', name: isRTL ? 'المسبّح' : 'Tasbih Pro', icon: <Trophy size={16} />, earned: tasbihCount >= 100, color: 'bg-emerald-500' },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-black/5 dark:border-white/5 py-4 px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white">
              {isRTL ? 'لوحة الإنجازات' : 'Achievement Dashboard'}
            </h1>
            <p className="text-[10px] text-slate-500 font-black tracking-widest uppercase">
              {isRTL ? 'تتبع تقدمك الروحاني' : 'Track your spiritual journey'}
            </p>
          </div>
        </div>
        
        <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
          <Trophy size={20} />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6 pb-24">
        
        {/* Level & Points Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 text-white p-6 shadow-2xl border border-white/10"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/20 rounded-full blur-[80px] -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-[60px] -ml-24 -mb-24" />
          
          <div className="relative z-10 space-y-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="flex items-center gap-2 px-2 py-1 bg-white/10 rounded-lg w-fit border border-white/10">
                  <Star size={12} className="text-amber-400" fill="currentColor" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{isRTL ? 'المستوى' : 'Level'} {level}</span>
                </div>
                <h2 className="text-3xl font-black">{isRTL ? 'بطاقة المؤمن الكادح' : 'Devoted Believer'}</h2>
              </div>
              <div className="w-14 h-14 bg-gradient-to-tr from-amber-400 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg border border-white/20">
                <Star size={28} className="text-white" fill="currentColor" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{isRTL ? 'النقاط الكلية' : 'Total Points'}</span>
                  <div className="text-2xl font-black text-amber-400">{totalPoints.toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1 block">{isRTL ? 'للترقية' : 'Next Level'}</span>
                  <span className="font-black text-sm">{pointsInCurrentLevel} / 100</span>
                </div>
              </div>
              <div className="h-2.5 w-full bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progressToNextLevel}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-teal-400 to-emerald-500 rounded-full shadow-[0_0_15px_rgba(45,212,191,0.5)]"
                />
              </div>
            </div>

            {/* Link to Visual Analytics Dashboard */}
            <div className="pt-2 border-t border-white/10">
              <button
                onClick={() => navigate('/adhkar-quran-dashboard')}
                className="w-full py-2.5 px-4 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/30 rounded-2xl flex items-center justify-between text-emerald-300 transition-all active:scale-98 cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <BarChart3 size={16} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-white">{isRTL ? 'لوحة التحليل البياني للأذكار والقرآن (Recharts)' : 'Visual Devotion & Quran Analytics'}</span>
                </div>
                <ChevronLeft size={16} className={cn("text-emerald-400 transition-transform group-hover:-translate-x-1", !isRTL && "rotate-180 group-hover:translate-x-1")} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Streak Card */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-black/5 dark:border-white/5 shadow-sm relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <Flame size={48} className="text-orange-500" />
            </div>
            <div className="space-y-3 relative z-10">
              <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500">
                <Flame size={20} fill={currentStreak > 0 ? "currentColor" : "none"} />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900 dark:text-white leading-none">{currentStreak}</div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                  {isRTL ? 'يوم متواصل' : 'Day Streak'}
                </div>
              </div>
              <div className="pt-2 border-t border-black/5 dark:border-white/5 flex items-center gap-2">
                <TrendingUp size={12} className="text-emerald-500" />
                <span className="text-[9px] font-black text-slate-500 uppercase">{isRTL ? 'أفضل رقم:' : 'Best:'} {bestStreak}</span>
              </div>
            </div>
          </motion.div>

          {/* Adhkar Total Card */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-black/5 dark:border-white/5 shadow-sm relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <Heart size={48} className="text-rose-500" />
            </div>
            <div className="space-y-3 relative z-10">
              <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-500">
                <Heart size={20} fill="currentColor" />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900 dark:text-white leading-none">{totalAdhkar}</div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                  {isRTL ? 'ذكر مكتمل' : 'Total Adhkar'}
                </div>
              </div>
              <div className="pt-2 border-t border-black/5 dark:border-white/5 flex items-center gap-2">
                <Award size={12} className="text-amber-500" />
                <span className="text-[9px] font-black text-slate-500 uppercase">{isRTL ? 'مستوى الفضل' : 'Merit Level'}</span>
              </div>
            </div>
          </motion.div>

          {/* Quran Recitation Card */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-black/5 dark:border-white/5 shadow-sm relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <BookOpen size={48} className="text-indigo-500" />
            </div>
            <div className="space-y-3 relative z-10">
              <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500">
                <BookOpen size={20} fill="currentColor" />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                  {quranHours > 0 ? `${quranHours}h ${quranMins}m` : `${quranMins}m`}
                </div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                  {isRTL ? 'تلاوة القرآن' : 'Quran Recitation'}
                </div>
              </div>
              <div className="pt-2 border-t border-black/5 dark:border-white/5 flex items-center gap-2">
                <Info size={12} className="text-indigo-500" />
                <span className="text-[9px] font-black text-slate-500 uppercase">{isRTL ? 'الوقت المقدر' : 'Estimated Time'}</span>
              </div>
            </div>
          </motion.div>

          {/* Tasbih Count Card */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-black/5 dark:border-white/5 shadow-sm relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <Zap size={48} className="text-sky-500" />
            </div>
            <div className="space-y-3 relative z-10">
              <div className="w-10 h-10 bg-sky-500/10 rounded-xl flex items-center justify-center text-sky-500">
                <Zap size={20} fill="currentColor" />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900 dark:text-white leading-none">{tasbihCount.toLocaleString()}</div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                  {isRTL ? 'إجمالي التسبيح' : 'Total Tasbih'}
                </div>
              </div>
              <div className="pt-2 border-t border-black/5 dark:border-white/5 flex items-center gap-2">
                <Sparkles size={12} className="text-sky-500" />
                <span className="text-[9px] font-black text-slate-500 uppercase">{isRTL ? 'ميزان الحسنات' : 'Good Deeds'}</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Weekly Summary Component */}
        <WeeklySummary />

        {/* Activity, Interactive Harvest, & Distribution Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Redesigned Interactive Weekly Adhkar Completion Chart */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-black/5 dark:border-white/5 shadow-sm space-y-4"
          >
            <div className="flex justify-between items-start flex-wrap gap-4">
              <div className="space-y-3 flex-1 min-w-[200px]">
                <div className="space-y-1">
                  <h3 className="font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Activity size={18} className="text-emerald-500" />
                    <span>{t('weekly_activity')}</span>
                  </h3>
                  <p className="text-[10px] font-black text-slate-400">
                    {t('weekly_activity_desc')}
                  </p>
                </div>
                
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl max-w-sm">
                  <button onClick={() => setActiveChartTab('adhkar')} className={cn("flex-1 text-[10px] font-black py-1.5 rounded-lg transition-colors", activeChartTab === 'adhkar' ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:text-slate-400")}>
                    {isRTL ? 'الأذكار' : 'Adhkar'}
                  </button>
                  <button onClick={() => setActiveChartTab('tasbih')} className={cn("flex-1 text-[10px] font-black py-1.5 rounded-lg transition-colors", activeChartTab === 'tasbih' ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:text-slate-400")}>
                    {isRTL ? 'التسبيح' : 'Tasbih'}
                  </button>
                  <button onClick={() => setActiveChartTab('quran')} className={cn("flex-1 text-[10px] font-black py-1.5 rounded-lg transition-colors", activeChartTab === 'quran' ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:text-slate-400")}>
                    {isRTL ? 'القرآن' : 'Quran'}
                  </button>
                </div>
              </div>
              <div className="text-[10px] font-black text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-xl shrink-0 uppercase tracking-widest">
                {isRTL ? 'تفاعلي' : 'Interactive'}
              </div>
            </div>

            <div className="h-52 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                {activeChartTab === 'adhkar' ? (
                  <BarChart 
                    data={activityData}
                    onClick={(state) => {
                      if (state && state.activeTooltipIndex !== undefined) {
                        setSelectedDayIndex(Number(state.activeTooltipIndex));
                      }
                    }}
                    className="cursor-pointer"
                  >
                    <defs>
                      <linearGradient id="activeBarGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" />
                        <stop offset="100%" stopColor="#059669" />
                      </linearGradient>
                      <linearGradient id="inactiveBarGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#94A3B8" />
                        <stop offset="100%" stopColor="#64748B" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.15} />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} 
                      reversed={isRTL}
                    />
                    <YAxis 
                      domain={[0, 100]}
                      tickFormatter={(tick) => `${tick}%`}
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 9, fontWeight: 900, fill: '#94a3b8' }}
                      orientation={isRTL ? 'right' : 'left'}
                    />
                    <Tooltip 
                      cursor={{ fill: 'rgba(16, 185, 129, 0.05)' }}
                      content={
                        <CustomTooltip isRTL={isRTL} t={t} activeChartTab={activeChartTab} />
                      }
                    />
                    <Bar 
                      dataKey="value" 
                      radius={[8, 8, 8, 8]} 
                      barSize={24}
                    >
                      {activityData.map((entry, index) => {
                        const isSelected = index === selectedDayIndex;
                        return (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={isSelected ? 'url(#activeBarGradient)' : 'url(#inactiveBarGradient)'} 
                            opacity={isSelected ? 1 : 0.4}
                          />
                        );
                      })}
                    </Bar>
                  </BarChart>
                ) : activeChartTab === 'tasbih' ? (
                  <AreaChart
                    data={activityData}
                    onClick={(state) => {
                      if (state && state.activeTooltipIndex !== undefined) {
                        setSelectedDayIndex(Number(state.activeTooltipIndex));
                      }
                    }}
                    className="cursor-pointer"
                  >
                    <defs>
                      <linearGradient id="colorTasbih" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.15} />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} 
                      reversed={isRTL}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 9, fontWeight: 900, fill: '#94a3b8' }}
                      orientation={isRTL ? 'right' : 'left'}
                    />
                    <Tooltip 
                      cursor={{ stroke: 'rgba(14, 165, 233, 0.2)', strokeWidth: 2 }}
                      content={<CustomTooltip isRTL={isRTL} t={t} activeChartTab={activeChartTab} />}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="tasbih" 
                      stroke="#0ea5e9" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorTasbih)" 
                    />
                  </AreaChart>
                ) : (
                  <BarChart 
                    data={activityData}
                    onClick={(state) => {
                      if (state && state.activeTooltipIndex !== undefined) {
                        setSelectedDayIndex(Number(state.activeTooltipIndex));
                      }
                    }}
                    className="cursor-pointer"
                  >
                    <defs>
                      <linearGradient id="activeQuranGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#6d28d9" />
                      </linearGradient>
                      <linearGradient id="inactiveQuranGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#94A3B8" />
                        <stop offset="100%" stopColor="#64748B" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.15} />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} 
                      reversed={isRTL}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 9, fontWeight: 900, fill: '#94a3b8' }}
                      orientation={isRTL ? 'right' : 'left'}
                    />
                    <Tooltip 
                      cursor={{ fill: 'rgba(139, 92, 246, 0.05)' }}
                      content={
                        <CustomTooltip isRTL={isRTL} t={t} activeChartTab={activeChartTab} />
                      }
                    />
                    <Bar 
                      dataKey="quran" 
                      radius={[8, 8, 8, 8]} 
                      barSize={24}
                    >
                      {activityData.map((entry, index) => {
                        const isSelected = index === selectedDayIndex;
                        return (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={isSelected ? 'url(#activeQuranGradient)' : 'url(#inactiveQuranGradient)'} 
                            opacity={isSelected ? 1 : 0.4}
                          />
                        );
                      })}
                    </Bar>
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
            
            <div className="flex items-center justify-between text-[10px] font-black text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-white/5 p-3 rounded-2xl">
              <span className="flex items-center gap-1.5">
                <Info size={12} className="text-teal-500" />
                <span>{t('tap_hint')}</span>
              </span>
              {selectedDay && (
                <span className="text-teal-500">
                  {t('active_day_selected')}: {selectedDay.name}
                </span>
              )}
            </div>
          </motion.div>

          {/* New Interactive Spiritual Harvest Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-black/5 dark:border-white/5 shadow-sm space-y-5 flex flex-col justify-between"
          >
            <div className="space-y-1">
              <h3 className="font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles size={18} className="text-amber-500" />
                <span>
                  {selectedDayIndex === 6 
                    ? t('today_details') 
                    : t('selected_day_details').replace('{day}', selectedDay?.name || '')}
                </span>
              </h3>
              <p className="text-xs font-bold text-slate-400">
                {selectedDay?.value === 100 
                  ? t('all_completed') 
                  : selectedDay?.value && selectedDay.value > 0 
                  ? t('some_completed') 
                  : t('none_completed')}
              </p>
            </div>

            {/* Adhkar Categories Grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* Morning Adhkar */}
              <div className={cn(
                "p-3 rounded-2xl border transition-all flex items-center gap-3",
                selectedDay?.hasMorning 
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-500" 
                  : "bg-slate-50 dark:bg-white/5 border-black/5 dark:border-white/5 text-slate-400 opacity-60"
              )}>
                <div className={cn(
                  "w-8 h-8 rounded-xl flex items-center justify-center shrink-0",
                  selectedDay?.hasMorning ? "bg-amber-500/20" : "bg-slate-200 dark:bg-white/10"
                )}>
                  <Sun size={16} fill={selectedDay?.hasMorning ? "currentColor" : "none"} />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-black truncate">{t('morning')}</div>
                  <div className="text-[9px] font-black opacity-80">
                    {selectedDay?.hasMorning ? (isRTL ? "مكتمل" : "Completed") : (isRTL ? "غير مكتمل" : "Not Done")}
                  </div>
                </div>
              </div>

              {/* Evening Adhkar */}
              <div className={cn(
                "p-3 rounded-2xl border transition-all flex items-center gap-3",
                selectedDay?.hasEvening 
                  ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-500" 
                  : "bg-slate-50 dark:bg-white/5 border-black/5 dark:border-white/5 text-slate-400 opacity-60"
              )}>
                <div className={cn(
                  "w-8 h-8 rounded-xl flex items-center justify-center shrink-0",
                  selectedDay?.hasEvening ? "bg-indigo-500/20" : "bg-slate-200 dark:bg-white/10"
                )}>
                  <Sunset size={16} fill={selectedDay?.hasEvening ? "currentColor" : "none"} />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-black truncate">{t('evening')}</div>
                  <div className="text-[9px] font-black opacity-80">
                    {selectedDay?.hasEvening ? (isRTL ? "مكتمل" : "Completed") : (isRTL ? "غير مكتمل" : "Not Done")}
                  </div>
                </div>
              </div>

              {/* Sleep Adhkar */}
              <div className={cn(
                "p-3 rounded-2xl border transition-all flex items-center gap-3",
                selectedDay?.hasSleep 
                  ? "bg-purple-500/10 border-purple-500/30 text-purple-500" 
                  : "bg-slate-50 dark:bg-white/5 border-black/5 dark:border-white/5 text-slate-400 opacity-60"
              )}>
                <div className={cn(
                  "w-8 h-8 rounded-xl flex items-center justify-center shrink-0",
                  selectedDay?.hasSleep ? "bg-purple-500/20" : "bg-slate-200 dark:bg-white/10"
                )}>
                  <Moon size={16} fill={selectedDay?.hasSleep ? "currentColor" : "none"} />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-black truncate">{t('sleep')}</div>
                  <div className="text-[9px] font-black opacity-80">
                    {selectedDay?.hasSleep ? (isRTL ? "مكتمل" : "Completed") : (isRTL ? "غير مكتمل" : "Not Done")}
                  </div>
                </div>
              </div>

              {/* Waking Adhkar */}
              <div className={cn(
                "p-3 rounded-2xl border transition-all flex items-center gap-3",
                selectedDay?.hasWaking 
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500" 
                  : "bg-slate-50 dark:bg-white/5 border-black/5 dark:border-white/5 text-slate-400 opacity-60"
              )}>
                <div className={cn(
                  "w-8 h-8 rounded-xl flex items-center justify-center shrink-0",
                  selectedDay?.hasWaking ? "bg-emerald-500/20" : "bg-slate-200 dark:bg-white/10"
                )}>
                  <Sunrise size={16} fill={selectedDay?.hasWaking ? "currentColor" : "none"} />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-black truncate">{t('waking')}</div>
                  <div className="text-[9px] font-black opacity-80">
                    {selectedDay?.hasWaking ? (isRTL ? "مكتمل" : "Completed") : (isRTL ? "غير مكتمل" : "Not Done")}
                  </div>
                </div>
              </div>
            </div>

            {/* Sub-achievements (Quran & Tasbih) progress indicators */}
            <div className="pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-indigo-500/10 text-indigo-500 rounded-lg flex items-center justify-center">
                  <BookOpen size={14} />
                </div>
                <div>
                  <div className="text-[9px] font-black text-slate-400 uppercase leading-none">{t('quran_read')}</div>
                  <div className="font-extrabold text-slate-800 dark:text-white mt-0.5">
                    {selectedDay?.quran || 0} {isRTL ? t('pages') : t('pages')}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-emerald-500/10 text-emerald-500 rounded-lg flex items-center justify-center">
                  <Zap size={14} />
                </div>
                <div>
                  <div className="text-[9px] font-black text-slate-400 uppercase leading-none">{t('tasbih_completed')}</div>
                  <div className="font-extrabold text-slate-800 dark:text-white mt-0.5">
                    {selectedDay?.tasbih || 0} {isRTL ? t('tasbiha') : t('tasbiha')}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Overall Distribution Chart Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-black/5 dark:border-white/5 shadow-sm"
        >
          <div className="flex justify-between items-center mb-6">
            <div className="space-y-1">
              <h3 className="font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Target size={18} className="text-indigo-600" />
                <span>{t('dhikr_distribution')}</span>
              </h3>
              <p className="text-[10px] font-black text-slate-400">
                {t('dhikr_distribution_desc')}
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative h-44 w-44 shrink-0 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      borderRadius: '16px',
                      border: 'none',
                      color: '#fff',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Center text of the donut */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">
                  {isRTL ? 'إجمالي الأوراد' : 'TOTAL DHIKR'}
                </span>
                <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 leading-none">
                  {totalAdhkar}
                </span>
              </div>
            </div>
            
            <div className="flex-1 w-full grid grid-cols-2 gap-4">
              {distributionData.map((item) => (
                <div key={item.name} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-black/5 dark:border-white/5">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-xs font-black text-slate-600 dark:text-slate-400 truncate">{item.name}</span>
                  </div>
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white shrink-0 ml-2">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Badges Section */}
        <div className="space-y-4">
          <h3 className="font-black text-slate-900 dark:text-white px-2 flex items-center gap-2">
            <Award size={18} className="text-amber-500" />
            {isRTL ? 'الأوسمة والجوائز' : 'Badges & Awards'}
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none px-2">
            {badges.map((badge) => (
              <motion.div 
                key={badge.id}
                whileHover={{ y: -5 }}
                className={cn(
                  "shrink-0 w-24 h-24 rounded-3xl flex flex-col items-center justify-center p-3 text-center border-2 transition-all duration-300",
                  badge.earned 
                    ? cn("border-black/5 dark:border-white/10 shadow-lg", badge.color, "text-white")
                    : "bg-slate-100 dark:bg-white/5 border-dashed border-slate-300 dark:border-slate-800 text-slate-400 opacity-50"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-2xl flex items-center justify-center mb-1.5",
                  badge.earned ? "bg-white/20" : "bg-slate-200 dark:bg-white/10"
                )}>
                  {badge.icon}
                </div>
                <span className="text-[9px] font-black uppercase tracking-tighter leading-tight">{badge.name}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Daily Challenges Progress */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <h3 className="font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Target size={18} className="text-indigo-600" />
              {isRTL ? 'تحديات اليوم' : 'Daily Challenges'}
            </h3>
            <span className="text-[10px] font-black text-emerald-600 bg-emerald-500/10 px-2 py-1 rounded-lg">
              {completedDailyCount} / {dailyChallenges.length} {isRTL ? 'مكتمل' : 'Done'}
            </span>
          </div>

          <div className="space-y-3">
            {dailyChallenges.slice(0, 3).map((challenge, idx) => {
              const prog = challengeProgress[challenge.id];
              const isDone = prog?.completed;
              const percent = Math.min(100, ((prog?.currentCount || 0) / challenge.targetCount) * 100);

              return (
                <motion.div 
                  key={challenge.id}
                  initial={{ opacity: 0, x: idx % 2 === 0 ? -10 : 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * idx }}
                  className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-black/5 dark:border-white/5 flex items-center gap-4"
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                    isDone ? "bg-emerald-500/10 text-emerald-500" : "bg-slate-100 dark:bg-white/5 text-slate-400"
                  )}>
                    <Zap size={18} fill={isDone ? "currentColor" : "none"} />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-slate-800 dark:text-white truncate">{challenge.title}</span>
                      <span className="text-[9px] font-black text-slate-400">{Math.round(percent)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        className={cn(
                          "h-full rounded-full",
                          isDone ? "bg-emerald-500" : "bg-teal-600"
                        )}
                      />
                    </div>
                  </div>
                  <ChevronLeft 
                    size={16} 
                    className="text-slate-300 dark:text-slate-700 cursor-pointer" 
                    onClick={() => navigate(challenge.actionPath || '/challenges')}
                  />
                </motion.div>
              );
            })}
            
            <button 
              onClick={() => navigate('/challenges')}
              className="w-full py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-teal-600 transition-colors"
            >
              {isRTL ? 'عرض جميع التحديات' : 'View All Challenges'}
            </button>
          </div>
        </div>

        {/* Other Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-4 rounded-3xl text-white shadow-lg space-y-2 relative overflow-hidden group cursor-pointer" onClick={() => navigate('/spiritual-goals')}>
            <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:scale-110 transition-transform"><Target size={48} /></div>
            <div className="flex justify-between relative z-10">
              <Target size={20} />
              <span className="text-[10px] font-black opacity-60 uppercase">{isRTL ? 'الأهداف' : 'Goals'}</span>
            </div>
            <div className="relative z-10">
              <div className="text-xl font-black">{progress.spiritualGoals ? progress.spiritualGoals.filter((g: any) => g.progress >= g.target).length : 0}</div>
              <div className="text-[9px] font-black opacity-80 uppercase">{isRTL ? 'هدف مكتمل' : 'Goals Completed'}</div>
            </div>
            <div className="absolute bottom-2 left-2 bg-white/20 p-1.5 rounded-full"><ChevronLeft size={14} className="text-white rtl:rotate-180" /></div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-4 rounded-3xl text-white shadow-lg space-y-2 text-right relative overflow-hidden group cursor-pointer" onClick={() => navigate('/tasbih')}>
            <div className="flex items-center justify-between mb-4">
              <Zap size={20} />
              <span className="text-[10px] font-black opacity-60">TASBIH</span>
            </div>
            <div>
              <div className="text-xl font-black">{tasbihCount.toLocaleString()}</div>
              <div className="text-[9px] font-black opacity-80 uppercase">{isRTL ? 'تسبيحة' : 'Tasbih count'}</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
