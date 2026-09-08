import React, { useState, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  RadialBarChart, 
  RadialBar, 
  PolarAngleAxis, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend, 
  ComposedChart,
  ReferenceLine
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  BookOpen, 
  Sunrise, 
  Sunset, 
  Moon, 
  Sun, 
  Flame, 
  Trophy, 
  Target, 
  Calendar, 
  Sparkles, 
  Clock, 
  Activity, 
  Heart, 
  CheckCircle2, 
  Plus, 
  BarChart3, 
  Zap, 
  RotateCcw,
  Layers,
  Award,
  ChevronRight,
  Info,
  CalendarCheck2
} from 'lucide-react';
import { useAppContext } from '../AppContext';
import { useTranslation } from '../i18n';
import { BackButton } from './ui/BackButton';
import { cn } from '../lib/utils';
import { useSmartNavigation } from '../lib/navigation';

type TimeRange = '7d' | '14d' | '30d' | 'all';
type FocusMode = 'all' | 'adhkar' | 'quran';

interface DayDataPoint {
  date: string;
  dayName: string;
  shortDate: string;
  adhkarCompletionRate: number; // 0 - 100%
  completedAdhkarCount: number; // 0 - 4+
  hasMorning: boolean;
  hasEvening: boolean;
  hasSleep: boolean;
  hasWaking: boolean;
  quranPages: number;
  tasbihCount: number;
  isToday: boolean;
}

// Sample fallback data generator to showcase rich charts if user is new
const generateSampleHistory = (daysCount: number, isRtl: boolean): DayDataPoint[] => {
  const points: DayDataPoint[] = [];
  const weekdaysAR = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const weekdaysEN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayOfWeek = d.getDay();
    const isFriday = dayOfWeek === 5;
    
    // Simulate natural devotion patterns (Fridays higher quran, morning/evening usually completed)
    const baseQuran = isFriday ? 16 + Math.floor(Math.random() * 8) : 4 + Math.floor(Math.random() * 8);
    const hasM = Math.random() > 0.15;
    const hasE = Math.random() > 0.25;
    const hasS = Math.random() > 0.35;
    const hasW = Math.random() > 0.4;
    const count = (hasM ? 1 : 0) + (hasE ? 1 : 0) + (hasS ? 1 : 0) + (hasW ? 1 : 0);

    points.push({
      date: d.toISOString().split('T')[0],
      dayName: isRtl ? weekdaysAR[dayOfWeek] : weekdaysEN[dayOfWeek],
      shortDate: `${d.getDate()}/${d.getMonth() + 1}`,
      adhkarCompletionRate: Math.round((count / 4) * 100),
      completedAdhkarCount: count,
      hasMorning: hasM,
      hasEvening: hasE,
      hasSleep: hasS,
      hasWaking: hasW,
      quranPages: baseQuran,
      tasbihCount: 33 * (1 + Math.floor(Math.random() * 6)),
      isToday: i === 0
    });
  }
  return points;
};

// Custom Chart Tooltip with glass styling and high readability
const CustomDashboardTooltip = React.memo(({ active, payload, label, isRtl }: any) => {
  if (active && payload && payload.length) {
    const data: DayDataPoint = payload[0]?.payload || {};
    return (
      <div 
        className="bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md p-3.5 rounded-2xl border border-slate-700/60 shadow-2xl text-white text-right space-y-2 min-w-[200px]"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        <div className="flex items-center justify-between border-b border-slate-700/50 pb-1.5">
          <span className="text-xs font-black text-emerald-400">{label || data.dayName}</span>
          <span className="text-[10px] text-slate-400 font-mono">{data.shortDate || data.date}</span>
        </div>

        <div className="space-y-1 text-xs">
          {/* Adhkar Info */}
          <div className="flex items-center justify-between gap-3 text-amber-300">
            <span className="flex items-center gap-1.5">
              <Sunrise size={13} className="text-amber-400" />
              <span>{isRtl ? 'التزام الأذكار' : 'Adhkar Rate'}:</span>
            </span>
            <span className="font-black text-white">{data.adhkarCompletionRate}%</span>
          </div>

          {/* Quran Info */}
          <div className="flex items-center justify-between gap-3 text-teal-300">
            <span className="flex items-center gap-1.5">
              <BookOpen size={13} className="text-teal-400" />
              <span>{isRtl ? 'تلاوة القرآن' : 'Quran Recited'}:</span>
            </span>
            <span className="font-black text-white">
              {data.quranPages} {isRtl ? 'صفحة' : 'pages'}
            </span>
          </div>

          {/* Tasbih Info */}
          {data.tasbihCount > 0 && (
            <div className="flex items-center justify-between gap-3 text-cyan-300">
              <span className="flex items-center gap-1.5">
                <Zap size={13} className="text-cyan-400" />
                <span>{isRtl ? 'التسبيح' : 'Tasbih'}:</span>
              </span>
              <span className="font-black text-white">{data.tasbihCount}</span>
            </div>
          )}
        </div>

        {/* Sessions Tags */}
        <div className="pt-1.5 border-t border-slate-700/50 flex flex-wrap gap-1">
          {data.hasMorning && (
            <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[9px] font-bold">
              {isRtl ? 'الصباح' : 'Morning'}
            </span>
          )}
          {data.hasEvening && (
            <span className="px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-[9px] font-bold">
              {isRtl ? 'المساء' : 'Evening'}
            </span>
          )}
          {data.hasSleep && (
            <span className="px-1.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 text-[9px] font-bold">
              {isRtl ? 'النوم' : 'Sleep'}
            </span>
          )}
          {data.hasWaking && (
            <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[9px] font-bold">
              {isRtl ? 'الاستيقاظ' : 'Waking'}
            </span>
          )}
        </div>
      </div>
    );
  }
  return null;
});

export const AdhkarQuranVisualDashboard: React.FC = () => {
  const { progress, settings, markCategoryCompleted, addQuranLog } = useAppContext();
  const { isRtl } = useTranslation(settings.appLanguage);
  const { navigate } = useSmartNavigation();

  // State controls
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [focusMode, setFocusMode] = useState<FocusMode>('all');
  const [useSampleData, setUseSampleData] = useState<boolean>(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);

  // Quick Action notification
  const [quickActionSuccess, setQuickActionSuccess] = useState<string | null>(null);

  const daysCount = useMemo(() => {
    switch (timeRange) {
      case '7d': return 7;
      case '14d': return 14;
      case '30d': return 30;
      case 'all': return 30;
      default: return 7;
    }
  }, [timeRange]);

  // Check if user has recorded stats
  const hasRealData = useMemo(() => {
    const dailyStats = progress.dailyStats || {};
    const quranLogs = progress.quranProgress?.logs || [];
    return Object.keys(dailyStats).length > 0 || quranLogs.length > 0 || (progress.totalAdhkarRecited || 0) > 0;
  }, [progress.dailyStats, progress.quranProgress, progress.totalAdhkarRecited]);

  // If user has zero stats and didn't manually toggle, we offer demo view
  const isViewingSample = useSampleData || (!hasRealData && useSampleData);

  // Build DayDataPoints from AppContext progress
  const chartData = useMemo<DayDataPoint[]>(() => {
    if (useSampleData) {
      return generateSampleHistory(daysCount, isRtl);
    }

    const points: DayDataPoint[] = [];
    const dailyStats = progress.dailyStats || {};
    const weekdaysAR = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const weekdaysEN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const stats = dailyStats[dateStr] || { adhkar: [], quran: 0, tasbih: 0 };

      const dayOfWeek = d.getDay();
      const dayName = isRtl ? weekdaysAR[dayOfWeek] : weekdaysEN[dayOfWeek];
      const shortDate = `${d.getDate()}/${d.getMonth() + 1}`;

      const adhkarList = stats.adhkar || [];
      const hasMorning = adhkarList.some(k => k.includes('morning') || k.includes('الصباح'));
      const hasEvening = adhkarList.some(k => k.includes('evening') || k.includes('المساء'));
      const hasSleep = adhkarList.some(k => k.includes('sleep') || k.includes('النوم'));
      const hasWaking = adhkarList.some(k => k.includes('waking') || k.includes('الاستيقاظ'));

      const completedCount = (hasMorning ? 1 : 0) + (hasEvening ? 1 : 0) + (hasSleep ? 1 : 0) + (hasWaking ? 1 : 0);
      const completionRate = Math.round((completedCount / 4) * 100);

      // Also gather quran logs on that specific date if any
      let dayQuranPages = stats.quran || 0;
      if (progress.quranProgress?.logs) {
        const matchingLogs = progress.quranProgress.logs.filter(l => l.date && l.date.startsWith(dateStr));
        if (matchingLogs.length > 0) {
          const logSum = matchingLogs.reduce((acc, curr) => acc + (curr.amount || 0), 0);
          dayQuranPages = Math.max(dayQuranPages, logSum);
        }
      }

      points.push({
        date: dateStr,
        dayName,
        shortDate,
        adhkarCompletionRate: completionRate,
        completedAdhkarCount: completedCount,
        hasMorning,
        hasEvening,
        hasSleep,
        hasWaking,
        quranPages: dayQuranPages,
        tasbihCount: stats.tasbih || 0,
        isToday: i === 0
      });
    }

    return points;
  }, [useSampleData, daysCount, isRtl, progress.dailyStats, progress.quranProgress]);

  // Aggregate Key Statistics
  const aggregatedStats = useMemo(() => {
    const totalQuranPages = chartData.reduce((acc, p) => acc + p.quranPages, 0);
    const avgQuranDaily = Math.round((totalQuranPages / chartData.length) * 10) / 10;
    
    const totalAdhkarCompleted = chartData.reduce((acc, p) => acc + p.completedAdhkarCount, 0);
    const avgAdhkarRate = Math.round(chartData.reduce((acc, p) => acc + p.adhkarCompletionRate, 0) / chartData.length);
    
    // Overall consistency score (combined weight of adherence and recitation)
    const activeDaysCount = chartData.filter(p => p.completedAdhkarCount > 0 || p.quranPages > 0).length;
    const consistencyScore = Math.round((activeDaysCount / chartData.length) * 100);

    // Khatma Projection (604 total pages in mushaf)
    const totalPagesReadOverall = Object.values(progress.dailyStats || {}).reduce((acc, curr) => acc + (curr.quran || 0), 0) + (isViewingSample ? 180 : 0);
    const dailyPace = avgQuranDaily > 0 ? avgQuranDaily : 4;
    const remainingPages = Math.max(0, 604 - (totalPagesReadOverall % 604));
    const estimatedDaysToKhatma = Math.ceil(remainingPages / dailyPace);

    return {
      totalQuranPages,
      avgQuranDaily,
      totalAdhkarCompleted,
      avgAdhkarRate,
      consistencyScore,
      activeDaysCount,
      totalPagesReadOverall,
      estimatedDaysToKhatma,
      streak: progress.streak?.current || (isViewingSample ? 5 : 0),
      bestStreak: progress.streak?.best || (isViewingSample ? 12 : 0),
      dailyGoalQuran: progress.quranProgress?.dailyGoal || 10
    };
  }, [chartData, progress.dailyStats, progress.quranProgress, progress.streak, isViewingSample]);

  // Distribution Data for Pie/Donut Chart (Morning, Evening, Sleep, Waking, Others)
  const categoryDistribution = useMemo(() => {
    let morning = 0;
    let evening = 0;
    let sleep = 0;
    let waking = 0;

    chartData.forEach(p => {
      if (p.hasMorning) morning++;
      if (p.hasEvening) evening++;
      if (p.hasSleep) sleep++;
      if (p.hasWaking) waking++;
    });

    const total = morning + evening + sleep + waking;
    if (total === 0) {
      return [
        { name: isRtl ? 'الصباح' : 'Morning', value: 1, color: '#f59e0b', count: 0 },
        { name: isRtl ? 'المساء' : 'Evening', value: 1, color: '#6366f1', count: 0 },
        { name: isRtl ? 'النوم' : 'Sleep', value: 1, color: '#8b5cf6', count: 0 },
        { name: isRtl ? 'الاستيقاظ' : 'Waking', value: 1, color: '#10b981', count: 0 },
      ];
    }

    return [
      { name: isRtl ? 'أذكار الصباح' : 'Morning', value: morning, color: '#f59e0b', count: morning },
      { name: isRtl ? 'أذكار المساء' : 'Evening', value: evening, color: '#6366f1', count: evening },
      { name: isRtl ? 'أذكار النوم' : 'Sleep', value: sleep, color: '#8b5cf6', count: sleep },
      { name: isRtl ? 'أذكار الاستيقاظ' : 'Waking', value: waking, color: '#10b981', count: waking },
    ];
  }, [chartData, isRtl]);

  // Weekday Frequency Comparison Data (Sun-Sat average)
  const weekdayFrequency = useMemo(() => {
    const daysMapAR = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const daysMapEN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const summary = [0, 1, 2, 3, 4, 5, 6].map(idx => {
      const matching = chartData.filter(d => {
        const dt = new Date(d.date);
        return dt.getDay() === idx;
      });
      const quranSum = matching.reduce((acc, curr) => acc + curr.quranPages, 0);
      const adhkarSum = matching.reduce((acc, curr) => acc + curr.completedAdhkarCount, 0);
      const count = Math.max(1, matching.length);

      return {
        day: isRtl ? daysMapAR[idx] : daysMapEN[idx],
        avgQuran: Math.round((quranSum / count) * 10) / 10,
        avgAdhkar: Math.round((adhkarSum / count) * 10) / 10,
        frequencyRate: Math.round(((quranSum + (adhkarSum * 2.5)) / (count * 15)) * 100)
      };
    });

    return summary;
  }, [chartData, isRtl]);

  // Radial Gauge Data for Khatma & Daily Goals
  const radialGaugeData = useMemo(() => {
    const todayData = chartData[chartData.length - 1] || { adhkarCompletionRate: 0, quranPages: 0 };
    const quranDailyGoal = progress.quranProgress?.dailyGoal || 10;
    const quranDailyPercent = Math.min(100, Math.round((todayData.quranPages / quranDailyGoal) * 100));
    const khatmaPercent = Math.min(100, Math.round(((aggregatedStats.totalPagesReadOverall % 604) / 604) * 100));

    return [
      {
        name: isRtl ? 'الختمة العامة' : 'Khatma',
        value: khatmaPercent || 15,
        fill: '#059669', // Emerald
      },
      {
        name: isRtl ? 'ورد القرآن اليومي' : 'Daily Quran',
        value: quranDailyPercent || (isViewingSample ? 70 : 0),
        fill: '#0d9488', // Teal
      },
      {
        name: isRtl ? 'أوراد الأذكار' : 'Adhkar Goal',
        value: todayData.adhkarCompletionRate || (isViewingSample ? 75 : 0),
        fill: '#f59e0b', // Amber
      }
    ];
  }, [chartData, progress.quranProgress, aggregatedStats, isRtl, isViewingSample]);

  // Handler for Quick Logging Actions
  const handleQuickAddQuran = (pages: number) => {
    addQuranLog({ amount: pages, unit: 'page' });
    setQuickActionSuccess(isRtl ? `تم تسجيل قراءة ${pages} صفحة بنجاح!` : `Logged ${pages} pages!`);
    setTimeout(() => setQuickActionSuccess(null), 3000);
  };

  const handleQuickCompleteAdhkar = (category: string, title: string) => {
    markCategoryCompleted(category);
    setQuickActionSuccess(isRtl ? `تم إتمام ${title} بنجاح!` : `Completed ${title}!`);
    setTimeout(() => setQuickActionSuccess(null), 3000);
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 font-sans pb-16" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Sticky Header with Actions */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 py-3.5 px-4 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <BackButton />
            <div>
              <h1 className="text-lg md:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{isRtl ? 'لوحة متابعة الأذكار والقرآن' : 'Devotion & Quran Analytics'}</span>
              </h1>
              <p className="text-[10px] md:text-xs font-bold text-slate-500 dark:text-slate-400">
                {isRtl ? 'تحليل بصري وتكرار الأوراد اليومية والتلاوة' : 'Visual progress and frequency tracking'}
              </p>
            </div>
          </div>

          {/* Sample Data Toggle Button */}
          <button
            onClick={() => setUseSampleData(!useSampleData)}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 shadow-xs",
              useSampleData 
                ? "bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-300"
                : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
            )}
            title={isRtl ? 'تبديل بين البيانات الفعلية والتجريبية' : 'Toggle sample demo data'}
          >
            <Sparkles size={13} className={useSampleData ? "text-amber-500 animate-spin" : "text-slate-400"} />
            <span className="hidden sm:inline">{useSampleData ? (isRtl ? 'معاينة تجريبية نشطة' : 'Demo Mode Active') : (isRtl ? 'عرض بيانات تجريبية' : 'Sample Data')}</span>
            <span className="sm:hidden">{useSampleData ? 'تجريبي' : 'عينة'}</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        
        {/* Quick Action Toast */}
        <AnimatePresence>
          {quickActionSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3 bg-emerald-600 text-white rounded-2xl flex items-center justify-between shadow-lg text-xs font-bold"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>{quickActionSuccess}</span>
              </div>
              <span className="text-[10px] opacity-80">{isRtl ? 'تم تحديث المخططات مباشرة' : 'Charts updated'}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Demo Notice Banner (if enabled) */}
        {useSampleData && (
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between text-amber-800 dark:text-amber-200 text-xs">
            <div className="flex items-center gap-2">
              <Info size={16} className="text-amber-600 shrink-0" />
              <span>{isRtl ? 'أنت تشاهد حالياً بيانات ورسوم توضيحية تجريبية لاستعراض التحليلات. يمكنك العودة لبياناتك بالضغط على الزر أعلاه.' : 'Viewing sample data demonstration. Click Sample Data to toggle back.'}</span>
            </div>
            <button 
              onClick={() => setUseSampleData(false)}
              className="px-2.5 py-1 bg-amber-500 text-white rounded-lg font-bold hover:bg-amber-600 shrink-0"
            >
              {isRtl ? 'بياناتي' : 'My Data'}
            </button>
          </div>
        )}

        {/* Filter Controls Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          {/* Time Range Selector */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
            {(['7d', '14d', '30d'] as TimeRange[]).map((range) => {
              const labels: Record<TimeRange, { ar: string; en: string }> = {
                '7d': { ar: '7 أيام', en: '7 Days' },
                '14d': { ar: '14 يوماً', en: '14 Days' },
                '30d': { ar: '30 يوماً', en: '30 Days' },
                'all': { ar: 'الكل', en: 'All' }
              };
              const active = timeRange === range;
              return (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={cn(
                    "flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                    active 
                      ? "bg-emerald-600 text-white shadow-xs" 
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  {isRtl ? labels[range].ar : labels[range].en}
                </button>
              );
            })}
          </div>

          {/* Focus Mode Selector */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
            {[
              { id: 'all', nameAr: 'المجمل', nameEn: 'Combined', icon: <Layers size={13} /> },
              { id: 'adhkar', nameAr: 'الأذكار', nameEn: 'Adhkar', icon: <Sunrise size={13} /> },
              { id: 'quran', nameAr: 'القرآن', nameEn: 'Quran', icon: <BookOpen size={13} /> },
            ].map((tab) => {
              const active = focusMode === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setFocusMode(tab.id as FocusMode)}
                  className={cn(
                    "flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5",
                    active 
                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs" 
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  {tab.icon}
                  <span>{isRtl ? tab.nameAr : tab.nameEn}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* High-Level Key Metrics Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Card 1: Consistency Score */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">{isRtl ? 'معدل الانتظام' : 'Consistency'}</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Activity size={16} />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {aggregatedStats.consistencyScore}%
              </div>
              <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                <TrendingUp size={12} />
                <span>{aggregatedStats.activeDaysCount} {isRtl ? `من أصل ${daysCount} أيام نشطة` : `of ${daysCount} active days`}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Quran Pages Recited */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">{isRtl ? 'صفحات القرآن' : 'Quran Recited'}</span>
              <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                <BookOpen size={16} />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {aggregatedStats.totalQuranPages} <span className="text-xs font-bold text-slate-400">{isRtl ? 'صفحة' : 'pages'}</span>
              </div>
              <div className="text-[11px] font-bold text-teal-600 dark:text-teal-400 mt-0.5">
                {isRtl ? `معدل ${aggregatedStats.avgQuranDaily} صفحة/يوم` : `${aggregatedStats.avgQuranDaily} pages/day avg`}
              </div>
            </div>
          </div>

          {/* Card 3: Adhkar Completion Sessions */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">{isRtl ? 'جلسات الأذكار' : 'Adhkar Completed'}</span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Sunrise size={16} />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {aggregatedStats.totalAdhkarCompleted} <span className="text-xs font-bold text-slate-400">{isRtl ? 'ورد' : 'sessions'}</span>
              </div>
              <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                {isRtl ? `التزام بنسبة ${aggregatedStats.avgAdhkarRate}%` : `${aggregatedStats.avgAdhkarRate}% adherence`}
              </div>
            </div>
          </div>

          {/* Card 4: Devotion Streak */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">{isRtl ? 'سلسلة الاستمرار' : 'Active Streak'}</span>
              <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                <Flame size={16} />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>{aggregatedStats.streak}</span>
                <span className="text-xs font-bold text-slate-400">{isRtl ? 'أيام متتالية' : 'days'}</span>
              </div>
              <div className="text-[11px] font-bold text-orange-600 dark:text-orange-400 mt-0.5">
                {isRtl ? `أفضل إنجاز: ${aggregatedStats.bestStreak} يوم` : `Best: ${aggregatedStats.bestStreak} days`}
              </div>
            </div>
          </div>
        </div>

        {/* PRIMARY CHART 1: Dual-Track Daily Recitation & Adhkar Progress (ComposedChart with Area + Bar) */}
        {(focusMode === 'all' || focusMode === 'adhkar' || focusMode === 'quran') && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 md:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Activity size={18} className="text-emerald-500" />
                  <span>{isRtl ? 'مسار التقدم والتكرار اليومي' : 'Daily Progress & Recitation Trajectory'}</span>
                </h3>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {isRtl ? 'مقارنة تلاوة صفحات القرآن مع نسبة إتمام الأوراد اليومية' : 'Comparison of Quran pages recited and daily Adhkar completion rate'}
                </p>
              </div>

              {/* Chart Legend Summary */}
              <div className="flex items-center gap-3 text-xs font-bold">
                {(focusMode === 'all' || focusMode === 'quran') && (
                  <div className="flex items-center gap-1.5 text-teal-600 dark:text-teal-400">
                    <div className="w-3 h-3 rounded-md bg-teal-500" />
                    <span>{isRtl ? 'صفحات القرآن' : 'Quran Pages'}</span>
                  </div>
                )}
                {(focusMode === 'all' || focusMode === 'adhkar') && (
                  <div className="flex items-center gap-1.5 text-amber-500">
                    <div className="w-3 h-3 rounded-md bg-amber-500" />
                    <span>{isRtl ? 'نسبة الأذكار %' : 'Adhkar %'}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Recharts Container */}
            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="quranAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="adhkarBarGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#d97706" stopOpacity={0.7} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" vertical={false} />
                  
                  <XAxis 
                    dataKey="shortDate" 
                    tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} 
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />
                  
                  {/* Left Y Axis for Pages */}
                  <YAxis 
                    yAxisId="quranAxis"
                    orientation={isRtl ? 'right' : 'left'}
                    tick={{ fontSize: 11, fill: '#0d9488', fontWeight: 700 }}
                    axisLine={false}
                    tickLine={false}
                    domain={[0, 'dataMax + 4']}
                  />

                  {/* Right Y Axis for Adhkar % */}
                  <YAxis 
                    yAxisId="adhkarAxis"
                    orientation={isRtl ? 'left' : 'right'}
                    tick={{ fontSize: 11, fill: '#f59e0b', fontWeight: 700 }}
                    axisLine={false}
                    tickLine={false}
                    domain={[0, 100]}
                    unit="%"
                  />

                  <Tooltip content={<CustomDashboardTooltip isRtl={isRtl} />} />

                  {/* Target Goal Line for Quran */}
                  <ReferenceLine 
                    yAxisId="quranAxis" 
                    y={aggregatedStats.dailyGoalQuran} 
                    stroke="#059669" 
                    strokeDasharray="4 4" 
                    strokeWidth={1.5}
                    label={{
                      value: isRtl ? `الهدف: ${aggregatedStats.dailyGoalQuran} ص` : `Goal: ${aggregatedStats.dailyGoalQuran}p`,
                      fill: '#059669',
                      fontSize: 10,
                      fontWeight: 700,
                      position: 'insideTopLeft'
                    }}
                  />

                  {/* Quran Recitation Area */}
                  {(focusMode === 'all' || focusMode === 'quran') && (
                    <Area 
                      yAxisId="quranAxis"
                      type="monotone" 
                      dataKey="quranPages" 
                      stroke="#0d9488" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#quranAreaGrad)" 
                    />
                  )}

                  {/* Adhkar Completion Bar */}
                  {(focusMode === 'all' || focusMode === 'adhkar') && (
                    <Bar 
                      yAxisId="adhkarAxis"
                      dataKey="adhkarCompletionRate" 
                      fill="url(#adhkarBarGrad)" 
                      radius={[6, 6, 0, 0]} 
                      maxBarSize={28}
                    />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* TWO-COLUMN METRICS: Category Distribution Donut & Khatma Radial Gauge */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Chart 2: Adhkar Category Breakdown (Donut Chart) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-3">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Sunrise size={18} className="text-amber-500" />
                <span>{isRtl ? 'توزيع الأذكار حسب الوقت' : 'Adhkar Sessions Distribution'}</span>
              </h3>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {isRtl ? 'نسبة الإتمام لكل نوع من الأوراد اليومية الأساسية' : 'Completed sessions across 4 main categories'}
              </p>
            </div>

            <div className="h-56 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryDistribution}
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(val: any, name: any) => [`${val} ${isRtl ? 'جلسة' : 'sessions'}`, name]}
                    contentStyle={{ 
                      backgroundColor: '#0f172a', 
                      borderColor: '#334155', 
                      borderRadius: '1rem', 
                      color: '#fff',
                      fontSize: '12px',
                      fontWeight: 'bold' 
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Center Donut Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-black text-slate-900 dark:text-white">{aggregatedStats.totalAdhkarCompleted}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">{isRtl ? 'جلسة مكتملة' : 'Total'}</span>
              </div>
            </div>

            {/* Custom Category Legend Chips */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              {categoryDistribution.map((cat, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="font-bold text-slate-700 dark:text-slate-300">{cat.name}</span>
                  </div>
                  <span className="font-black text-slate-900 dark:text-white">{cat.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Chart 3: Khatma & Goal Achievement (Radial Gauge) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-3">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Trophy size={18} className="text-emerald-500" />
                <span>{isRtl ? 'مقياس إنجاز الأهداف والختمة' : 'Goals & Khatma Gauge'}</span>
              </h3>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {isRtl ? 'نسبة التقدم نحو ختم المصحف والأهداف اليومية' : 'Progress toward full Khatma and daily goals'}
              </p>
            </div>

            <div className="h-56 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart 
                  cx="50%" 
                  cy="50%" 
                  innerRadius="30%" 
                  outerRadius="100%" 
                  barSize={12} 
                  data={radialGaugeData}
                  startAngle={180}
                  endAngle={-180}
                >
                  <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                  <RadialBar
                    background={{ fill: '#e2e8f0' }}
                    dataKey="value"
                    cornerRadius={10}
                  />
                  <Tooltip 
                    formatter={(val: any, name: any) => [`${val}%`, name]}
                    contentStyle={{ 
                      backgroundColor: '#0f172a', 
                      borderColor: '#334155', 
                      borderRadius: '1rem', 
                      color: '#fff',
                      fontSize: '12px',
                      fontWeight: 'bold' 
                    }} 
                  />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>

            {/* Gauge Legend Summary */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex items-center justify-between p-1.5 rounded-xl bg-emerald-500/10 text-emerald-800 dark:text-emerald-200">
                <span className="font-bold flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                  {isRtl ? 'ختمة المصحف الشريف (604 ص)' : 'Quran Khatma (604 pages)'}
                </span>
                <span className="font-black">{Math.round(((aggregatedStats.totalPagesReadOverall % 604) / 604) * 100)}%</span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded-xl bg-teal-500/10 text-teal-800 dark:text-teal-200">
                <span className="font-bold flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                  {isRtl ? 'الورد القرآني اليومي' : 'Daily Quran Goal'}
                </span>
                <span className="font-black">{radialGaugeData[1].value}%</span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded-xl bg-amber-500/10 text-amber-800 dark:text-amber-200">
                <span className="font-bold flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  {isRtl ? 'أوراد الأذكار الأساسية' : 'Daily Adhkar Completion'}
                </span>
                <span className="font-black">{radialGaugeData[2].value}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* CHART 4: Weekday Recitation & Frequency Heat (BarChart) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 md:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarCheck2 size={18} className="text-teal-500" />
              <span>{isRtl ? 'وتيرة التكرار عبر أيام الأسبوع' : 'Recitation & Devotion Frequency by Weekday'}</span>
            </h3>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {isRtl ? 'تحديد الأيام الأكثر نشاطاً في قراءة القرآن والمواظبة على الأذكار' : 'Identifies your peak devotion days (e.g. Friday Quran recitation surge)'}
            </p>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekdayFrequency} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" vertical={false} />
                <XAxis 
                  dataKey="day" 
                  tick={{ fontSize: 11, fill: '#64748b', fontWeight: 700 }} 
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  formatter={(val: any, name: any) => [
                    name === 'avgQuran' ? `${val} ${isRtl ? 'صفحة' : 'pages'}` : `${val} ${isRtl ? 'أوراد' : 'sessions'}`,
                    name === 'avgQuran' ? (isRtl ? 'متوسط صفحات القرآن' : 'Avg Quran Pages') : (isRtl ? 'متوسط أوراد الأذكار' : 'Avg Adhkar')
                  ]}
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderColor: '#334155', 
                    borderRadius: '1rem', 
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: 'bold' 
                  }} 
                />
                <Bar dataKey="avgQuran" name="avgQuran" fill="#0d9488" radius={[6, 6, 0, 0]} />
                <Bar dataKey="avgAdhkar" name="avgAdhkar" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* QUICK INTERACTIVE RECORDING / LOGGING PANEL */}
        <div className="bg-gradient-to-br from-emerald-900 to-teal-950 text-white rounded-3xl p-5 md:p-6 shadow-xl space-y-4 border border-emerald-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-emerald-300">
                <Zap size={18} />
              </div>
              <div>
                <h3 className="text-base font-black">{isRtl ? 'تسجيل سريع وتحديث مباشر للوحة' : 'Quick Devotion Log'}</h3>
                <p className="text-xs text-emerald-200/80">{isRtl ? 'سجل وردك اليومي لتحديث الرسم البياني فوراً' : 'Log your reading to see charts update immediately'}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Quick Quran Log buttons */}
            <div className="bg-black/20 p-3.5 rounded-2xl border border-white/10 space-y-2">
              <span className="text-xs font-bold text-teal-300 flex items-center gap-1.5">
                <BookOpen size={14} />
                {isRtl ? 'تلاوة سريعة للقرآن' : 'Add Quran Reading'}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleQuickAddQuran(1)}
                  className="flex-1 py-2 bg-teal-600/60 hover:bg-teal-600 text-white font-black text-xs rounded-xl transition-all active:scale-95 cursor-pointer shadow-xs"
                >
                  +1 {isRtl ? 'صفحة' : 'page'}
                </button>
                <button
                  onClick={() => handleQuickAddQuran(5)}
                  className="flex-1 py-2 bg-teal-600/60 hover:bg-teal-600 text-white font-black text-xs rounded-xl transition-all active:scale-95 cursor-pointer shadow-xs"
                >
                  +5 {isRtl ? 'صفحات' : 'pages'}
                </button>
                <button
                  onClick={() => handleQuickAddQuran(20)}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl transition-all active:scale-95 cursor-pointer shadow-xs"
                >
                  +1 {isRtl ? 'جزء' : 'Juz'}
                </button>
              </div>
            </div>

            {/* Quick Adhkar Check-off buttons */}
            <div className="bg-black/20 p-3.5 rounded-2xl border border-white/10 space-y-2">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Sunrise size={14} />
                {isRtl ? 'إتمام ورد الأذكار' : 'Complete Adhkar'}
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleQuickCompleteAdhkar('morning', isRtl ? 'أذكار الصباح' : 'Morning Adhkar')}
                  className="py-2 px-2 bg-amber-500/30 hover:bg-amber-500 text-amber-200 hover:text-white font-black text-xs rounded-xl transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1"
                >
                  <Sun size={12} />
                  <span>{isRtl ? 'الصباح' : 'Morning'}</span>
                </button>
                <button
                  onClick={() => handleQuickCompleteAdhkar('evening', isRtl ? 'أذكار المساء' : 'Evening Adhkar')}
                  className="py-2 px-2 bg-indigo-500/30 hover:bg-indigo-500 text-indigo-200 hover:text-white font-black text-xs rounded-xl transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1"
                >
                  <Sunset size={12} />
                  <span>{isRtl ? 'المساء' : 'Evening'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* PROPHETIC WISDOM & KHATMA PROJECTION CARD */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
            <Sparkles size={14} />
            <span>{isRtl ? 'قبسات وبشائر الاستمرارية' : 'Spiritual Trajectory & Encouragement'}</span>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/60 text-slate-700 dark:text-slate-200 text-xs sm:text-sm leading-relaxed space-y-2">
            <p className="font-semibold text-emerald-700 dark:text-emerald-400">
              {isRtl 
                ? `وفقاً لمعدل تلاوتك الحالي (${aggregatedStats.avgQuranDaily} صفحة يومياً)، من المتوقع بإذن الله إتمام ختمتك المباركة القادمة خلال قرابة ${aggregatedStats.estimatedDaysToKhatma} يوماً.`
                : `Based on your current pace (${aggregatedStats.avgQuranDaily} pages/day), you are projected to complete your next Quran Khatma in approximately ${aggregatedStats.estimatedDaysToKhatma} days.`}
            </p>
            <p className="text-slate-500 dark:text-slate-400 text-xs italic">
              {isRtl
                ? 'قال رسول الله ﷺ: «أَحَبُّ الأَعْمَالِ إِلَى اللهِ أَدْوَمُهَا وَإِنْ قَلَّ» — داوم على قليل تسعد بكثيره في ميزانك.'
                : 'The Prophet ﷺ said: "The most beloved of deeds to Allah are those that are most consistent, even if they are small."'}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdhkarQuranVisualDashboard;
