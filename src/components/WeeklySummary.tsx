import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell, 
  ComposedChart, 
  Line, 
  Area, 
  AreaChart, 
  Legend,
  ReferenceLine
} from 'recharts';
import {  Calendar, 
  BookOpen, 
  Activity, 
  TrendingUp, 
  Award, 
   
  Sparkles, 
  Sun, 
  Sunset, 
  Moon, 
  Sunrise, 
   
  Flame,
  
  ChevronDown , CheckCircle2 } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { cn } from '../lib/utils';

interface WeeklySummaryProps {
  className?: string;
  showDetailsToggle?: boolean;
}

interface DaySummary {
  name: string;
  shortName: string;
  dateStr: string;
  displayDate: string;
  adhkarCount: number;
  adhkarRate: number; // 0-100%
  hasMorning: boolean;
  hasEvening: boolean;
  hasSleep: boolean;
  hasWaking: boolean;
  quranPages: number;
  quranGoal: number;
  quranRate: number; // 0-100%
  tasbihCount: number;
  isGoalAchieved: boolean;
}

const CustomWeeklyTooltip = ({ active, payload, label, isRTL }: any) => {
  if (active && payload && payload.length) {
    const data: DaySummary = payload[0].payload;
    return (
      <div className="bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-xl p-4 rounded-2xl border border-white/15 shadow-2xl text-white space-y-2 text-right min-w-[210px]" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <span className="text-xs font-black text-emerald-400">{data.name}</span>
          <span className="text-[10px] text-slate-400 font-bold">{data.displayDate}</span>
        </div>

        {/* Adhkar Info */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-emerald-300 flex items-center gap-1.5">
              <Sparkles size={13} className="text-emerald-400" />
              معدل الأذكار:
            </span>
            <span className="font-extrabold text-white">{data.adhkarRate}%</span>
          </div>
          <div className="text-[10px] text-slate-300 flex items-center justify-between font-medium">
            <span>أوراد مكتملة:</span>
            <span className="font-bold text-emerald-300">{data.adhkarCount} من 4</span>
          </div>
        </div>

        {/* Quran Info */}
        <div className="space-y-1 pt-1 border-t border-white/5">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-indigo-300 flex items-center gap-1.5">
              <BookOpen size={13} className="text-indigo-400" />
              الورد القرآني:
            </span>
            <span className="font-extrabold text-indigo-300">{data.quranPages} صفحة</span>
          </div>
          <div className="text-[10px] text-slate-300 flex items-center justify-between font-medium">
            <span>الهدف اليومي:</span>
            <span className="font-bold text-indigo-200">{data.quranGoal} صفحة ({data.quranRate}%)</span>
          </div>
        </div>

        {/* Goal Badge */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-center">
          {data.isGoalAchieved ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-400 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              <CheckCircle2 size={11} /> إنجاز ممتاز متكامل
            </span>
          ) : (data.adhkarRate > 0 || data.quranPages > 0) ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/30">
              <Flame size={11} /> نشاط طيب ومستمر
            </span>
          ) : (
            <span className="text-[10px] text-slate-400 font-medium">لم يتم تسجيل أوراد</span>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export const WeeklySummary: React.FC<WeeklySummaryProps> = ({ 
  className,
  showDetailsToggle = true
}) => {
  const { progress, settings } = useAppContext();
  const [chartMode, setChartMode] = useState<'combined' | 'adhkar' | 'quran'>('combined');
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(6); // Default to today (last element)
  const [expandedDetails, setExpandedDetails] = useState<boolean>(false);

  const isRTL = settings.appLanguage !== 'en';
  const quranGoal = progress.quranProgress?.dailyGoal || 5;

  // Process 7 Days Data
  const { weeklyData, stats } = useMemo(() => {
    const dailyStats = progress.dailyStats || {};
    const days: DaySummary[] = [];

    let totalAdhkarRateSum = 0;
    let totalQuranPagesSum = 0;
    let adhkarGoalDays = 0;
    let quranGoalDays = 0;
    let perfectDays = 0;
    let bestDayIndex = 0;
    let maxCombinedScore = -1;

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayData = dailyStats[dateStr] || { adhkar: [], quran: 0, tasbih: 0 };

      const weekdaysAR = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
      const weekdaysShortAR = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];
      const weekdaysEN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const weekdaysShortEN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

      const dayIdx = date.getDay();
      const name = isRTL ? weekdaysAR[dayIdx] : weekdaysEN[dayIdx];
      const shortName = isRTL ? weekdaysShortAR[dayIdx] : weekdaysShortEN[dayIdx];

      // Formatted date string (e.g. 28 يوليو)
      const monthsAR = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
      const displayDate = `${date.getDate()} ${isRTL ? monthsAR[date.getMonth()] : date.toLocaleString('en', { month: 'short' })}`;

      const adhkarList = dayData.adhkar || [];
      const hasMorning = adhkarList.some((x: string) => x.includes('morning') || x.includes('الصباح'));
      const hasEvening = adhkarList.some((x: string) => x.includes('evening') || x.includes('المساء'));
      const hasSleep = adhkarList.some((x: string) => x.includes('sleeping') || x.includes('sleep') || x.includes('النوم'));
      const hasWaking = adhkarList.some((x: string) => x.includes('waking') || x.includes('الاستيقاظ'));

      const adhkarCount = (hasMorning ? 1 : 0) + (hasEvening ? 1 : 0) + (hasSleep ? 1 : 0) + (hasWaking ? 1 : 0);
      const adhkarRate = Math.round((adhkarCount / 4) * 100);

      const quranPages = dayData.quran || 0;
      const quranRate = Math.min(100, Math.round((quranPages / Math.max(1, quranGoal)) * 100));

      const isGoalAchieved = adhkarRate >= 75 && quranPages >= quranGoal;

      if (adhkarRate >= 75) adhkarGoalDays++;
      if (quranPages >= quranGoal) quranGoalDays++;
      if (isGoalAchieved) perfectDays++;

      totalAdhkarRateSum += adhkarRate;
      totalQuranPagesSum += quranPages;

      const combinedScore = adhkarRate + quranRate;
      if (combinedScore > maxCombinedScore) {
        maxCombinedScore = combinedScore;
        bestDayIndex = 6 - i;
      }

      days.push({
        name,
        shortName,
        dateStr,
        displayDate,
        adhkarCount,
        adhkarRate,
        hasMorning,
        hasEvening,
        hasSleep,
        hasWaking,
        quranPages,
        quranGoal,
        quranRate,
        tasbihCount: dayData.tasbih || 0,
        isGoalAchieved
      });
    }

    const avgAdhkarRate = Math.round(totalAdhkarRateSum / 7);
    const avgQuranPages = Math.round((totalQuranPagesSum / 7) * 10) / 10;

    return {
      weeklyData: days,
      stats: {
        avgAdhkarRate,
        totalQuranPages: totalQuranPagesSum,
        avgQuranPages,
        adhkarGoalDays,
        quranGoalDays,
        perfectDays,
        bestDay: days[bestDayIndex] || days[6]
      }
    };
  }, [progress.dailyStats, quranGoal, isRTL]);

  const selectedDay = weeklyData[selectedDayIndex] || weeklyData[6];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-white dark:bg-slate-900 rounded-[2.5rem] p-5 sm:p-6 border border-black/5 dark:border-white/10 shadow-sm space-y-5 overflow-hidden relative",
        className
      )}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Subtle Background Glow */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-[90px] -mr-20 -mt-20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-[80px] -ml-20 -mb-20 pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-md shadow-emerald-500/20">
              <Activity size={18} />
            </div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              ملخص الأسبوع
            </h2>
            <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              آخر 7 أيام
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            معدل إنجاز الأذكار اليومية والورد القرآني على مدار الأسبوع
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl border border-black/5 dark:border-white/5 self-start sm:self-auto">
          <button 
            onClick={() => setChartMode('combined')} 
            className={cn(
              "text-xs font-black px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5",
              chartMode === 'combined' 
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" 
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            )}
          >
            <Sparkles size={13} className="text-emerald-500" />
            مدمج
          </button>
          <button 
            onClick={() => setChartMode('adhkar')} 
            className={cn(
              "text-xs font-black px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5",
              chartMode === 'adhkar' 
                ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm" 
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            )}
          >
            <Activity size={13} className="text-emerald-500" />
            الأذكار
          </button>
          <button 
            onClick={() => setChartMode('quran')} 
            className={cn(
              "text-xs font-black px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5",
              chartMode === 'quran' 
                ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm" 
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            )}
          >
            <BookOpen size={13} className="text-indigo-500" />
            القرآن
          </button>
        </div>
      </div>

      {/* KPI Cards Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative z-10">
        {/* Adhkar Average */}
        <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[10px] font-black uppercase tracking-wider">معدل الأذكار</span>
            <Sparkles size={14} className="text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black text-slate-900 dark:text-white">{stats.avgAdhkarRate}%</span>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">أسبوعياً</span>
          </div>
          <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${stats.avgAdhkarRate}%` }} />
          </div>
        </div>

        {/* Total Quran Pages */}
        <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[10px] font-black uppercase tracking-wider">إجمالي القرآن</span>
            <BookOpen size={14} className="text-indigo-500" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black text-slate-900 dark:text-white">{stats.totalQuranPages}</span>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">صفحة</span>
          </div>
          <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 truncate">
            معدل {stats.avgQuranPages} ص/يومياً
          </div>
        </div>

        {/* Goal Met Days */}
        <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[10px] font-black uppercase tracking-wider">التزام تام</span>
            <Award size={14} className="text-amber-500" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black text-slate-900 dark:text-white">{stats.perfectDays}</span>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">من 7 أيام</span>
          </div>
          <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400 truncate">
            أيام الإنجاز المتكامل
          </div>
        </div>

        {/* Best Day */}
        <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[10px] font-black uppercase tracking-wider">أفضل يوم</span>
            <TrendingUp size={14} className="text-teal-500" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-black text-slate-900 dark:text-white truncate">{stats.bestDay?.name}</span>
          </div>
          <div className="text-[10px] font-bold text-teal-600 dark:text-teal-400 truncate">
            {stats.bestDay?.adhkarRate}% أذكار • {stats.bestDay?.quranPages} ص
          </div>
        </div>
      </div>

      {/* Main Recharts Visualizer */}
      <div className="relative z-10 space-y-2">
        <div className="h-60 sm:h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {chartMode === 'combined' ? (
              <ComposedChart 
                data={weeklyData}
                onClick={(state) => {
                  if (state && state.activeTooltipIndex !== undefined) {
                    setSelectedDayIndex(Number(state.activeTooltipIndex));
                  }
                }}
                className="cursor-pointer"
              >
                <defs>
                  <linearGradient id="adhkarBarGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#059669" stopOpacity={0.7} />
                  </linearGradient>
                  <linearGradient id="adhkarBarGradientInactive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#059669" stopOpacity={0.25} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" opacity={0.15} />
                <XAxis 
                  dataKey="shortName" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fontWeight: 800, fill: '#64748b' }} 
                  reversed={isRTL}
                />
                <YAxis 
                  yAxisId="left"
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`}
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 9, fontWeight: 800, fill: '#10b981' }}
                  orientation={isRTL ? 'right' : 'left'}
                />
                <YAxis 
                  yAxisId="right"
                  domain={[0, 'dataMax + 2']}
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 9, fontWeight: 800, fill: '#6366f1' }}
                  orientation={isRTL ? 'left' : 'right'}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(16, 185, 129, 0.06)', radius: 12 }}
                  content={<CustomWeeklyTooltip isRTL={isRTL} />}
                />
                <Bar 
                  yAxisId="left"
                  dataKey="adhkarRate" 
                  name="معدل الأذكار (%)"
                  radius={[8, 8, 8, 8]} 
                  barSize={22}
                >
                  {weeklyData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={index === selectedDayIndex ? 'url(#adhkarBarGradient)' : 'url(#adhkarBarGradientInactive)'} 
                    />
                  ))}
                </Bar>
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="quranPages" 
                  name="صفحات القرآن"
                  stroke="#6366f1" 
                  strokeWidth={3.5}
                  dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 7, fill: '#4f46e5', strokeWidth: 3, stroke: '#fff' }}
                />
              </ComposedChart>
            ) : chartMode === 'adhkar' ? (
              <BarChart 
                data={weeklyData}
                onClick={(state) => {
                  if (state && state.activeTooltipIndex !== undefined) {
                    setSelectedDayIndex(Number(state.activeTooltipIndex));
                  }
                }}
                className="cursor-pointer"
              >
                <defs>
                  <linearGradient id="adhkarOnlyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#047857" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" opacity={0.15} />
                <XAxis 
                  dataKey="shortName" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fontWeight: 800, fill: '#64748b' }} 
                  reversed={isRTL}
                />
                <YAxis 
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`}
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 9, fontWeight: 800, fill: '#10b981' }}
                  orientation={isRTL ? 'right' : 'left'}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(16, 185, 129, 0.08)', radius: 12 }}
                  content={<CustomWeeklyTooltip isRTL={isRTL} />}
                />
                <Bar 
                  dataKey="adhkarRate" 
                  radius={[10, 10, 10, 10]} 
                  barSize={26}
                >
                  {weeklyData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill="url(#adhkarOnlyGradient)" 
                      opacity={index === selectedDayIndex ? 1 : 0.45}
                    />
                  ))}
                </Bar>
              </BarChart>
            ) : (
              <AreaChart 
                data={weeklyData}
                onClick={(state) => {
                  if (state && state.activeTooltipIndex !== undefined) {
                    setSelectedDayIndex(Number(state.activeTooltipIndex));
                  }
                }}
                className="cursor-pointer"
              >
                <defs>
                  <linearGradient id="quranAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" opacity={0.15} />
                <XAxis 
                  dataKey="shortName" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fontWeight: 800, fill: '#64748b' }} 
                  reversed={isRTL}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 9, fontWeight: 800, fill: '#6366f1' }}
                  orientation={isRTL ? 'right' : 'left'}
                />
                <ReferenceLine 
                  y={quranGoal} 
                  label={{ value: `الهدف (${quranGoal} ص)`, fill: '#818cf8', fontSize: 10, position: 'insideTopRight' }} 
                  stroke="#818cf8" 
                  strokeDasharray="4 4" 
                />
                <Tooltip 
                  cursor={{ stroke: 'rgba(99, 102, 241, 0.3)', strokeWidth: 2 }}
                  content={<CustomWeeklyTooltip isRTL={isRTL} />}
                />
                <Area 
                  type="monotone" 
                  dataKey="quranPages" 
                  stroke="#6366f1" 
                  strokeWidth={3.5}
                  fillOpacity={1} 
                  fill="url(#quranAreaGradient)" 
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Legend Indicator */}
        <div className="flex items-center justify-center gap-6 text-[11px] font-black text-slate-500 dark:text-slate-400 pt-1">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-md bg-emerald-500 inline-block shadow-sm" />
            <span>الأذكار اليومية (نسبة مئوية)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-1.5 rounded-full bg-indigo-500 inline-block shadow-sm" />
            <span>الورد القرآني (صفحات)</span>
          </div>
        </div>
      </div>

      {/* Selected Day Interactive Details Card */}
      {selectedDay && (
        <motion.div 
          key={selectedDay.dateStr}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 space-y-3 relative z-10"
        >
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700/50 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="text-xs font-black text-slate-900 dark:text-white">
                تفاصيل يوم {selectedDay.name} ({selectedDay.displayDate})
              </h3>
            </div>
            {selectedDay.isGoalAchieved && (
              <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                <CheckCircle2 size={11} /> تم تحقيق الهدف اليومي كامل
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {/* Morning */}
            <div className={cn(
              "p-2.5 rounded-xl border flex items-center justify-between transition-colors",
              selectedDay.hasMorning 
                ? "bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200" 
                : "bg-white/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-700 text-slate-400"
            )}>
              <span className="font-bold flex items-center gap-1.5">
                <Sunrise size={14} className={selectedDay.hasMorning ? "text-amber-500" : ""} />
                الصباح
              </span>
              <span className="text-[10px] font-black">
                {selectedDay.hasMorning ? "مكتمل" : "غير مكتمل"}
              </span>
            </div>

            {/* Evening */}
            <div className={cn(
              "p-2.5 rounded-xl border flex items-center justify-between transition-colors",
              selectedDay.hasEvening 
                ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-900 dark:text-indigo-200" 
                : "bg-white/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-700 text-slate-400"
            )}>
              <span className="font-bold flex items-center gap-1.5">
                <Sunset size={14} className={selectedDay.hasEvening ? "text-indigo-500" : ""} />
                المساء
              </span>
              <span className="text-[10px] font-black">
                {selectedDay.hasEvening ? "مكتمل" : "غير مكتمل"}
              </span>
            </div>

            {/* Sleep */}
            <div className={cn(
              "p-2.5 rounded-xl border flex items-center justify-between transition-colors",
              selectedDay.hasSleep 
                ? "bg-purple-500/10 border-purple-500/30 text-purple-900 dark:text-purple-200" 
                : "bg-white/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-700 text-slate-400"
            )}>
              <span className="font-bold flex items-center gap-1.5">
                <Moon size={14} className={selectedDay.hasSleep ? "text-purple-500" : ""} />
                النوم
              </span>
              <span className="text-[10px] font-black">
                {selectedDay.hasSleep ? "مكتمل" : "غير مكتمل"}
              </span>
            </div>

            {/* Quran */}
            <div className={cn(
              "p-2.5 rounded-xl border flex items-center justify-between transition-colors",
              selectedDay.quranPages >= selectedDay.quranGoal 
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200" 
                : selectedDay.quranPages > 0 
                  ? "bg-blue-500/10 border-blue-500/30 text-blue-900 dark:text-blue-200" 
                  : "bg-white/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-700 text-slate-400"
            )}>
              <span className="font-bold flex items-center gap-1.5">
                <BookOpen size={14} className="text-emerald-500" />
                القرآن
              </span>
              <span className="text-[10px] font-black">
                {selectedDay.quranPages} / {selectedDay.quranGoal} ص
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Expandable 7-Day List Breakdown */}
      {showDetailsToggle && (
        <div className="pt-2 relative z-10">
          <button 
            onClick={() => setExpandedDetails(!expandedDetails)} 
            className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-xs font-black text-slate-700 dark:text-slate-300 cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Calendar size={15} className="text-emerald-500" />
              سجل الإنجاز التفصيلي للأيام الـ 7 الماضية
            </span>
            <ChevronDown size={16} className={cn("transition-transform duration-200", expandedDetails ? "rotate-180" : "")} />
          </button>

          <AnimatePresence>
            {expandedDetails && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 mt-3 overflow-hidden"
              >
                {weeklyData.map((day, idx) => (
                  <div 
                    key={day.dateStr}
                    onClick={() => setSelectedDayIndex(idx)}
                    className={cn(
                      "p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer",
                      idx === selectedDayIndex 
                        ? "bg-emerald-500/10 border-emerald-500/40 shadow-sm" 
                        : "bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0",
                        day.isGoalAchieved 
                          ? "bg-emerald-500 text-white shadow-sm" 
                          : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                      )}>
                        {day.shortName}
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
                          <span>{day.name}</span>
                          <span className="text-[10px] text-slate-400 font-bold">({day.displayDate})</span>
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
                          <span>{day.adhkarCount} من 4 أوراد</span>
                          <span>•</span>
                          <span>{day.quranPages} صفحة قرآن</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {/* Progress Bars */}
                      <div className="w-20 hidden sm:block space-y-1">
                        <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${day.adhkarRate}%` }} />
                        </div>
                        <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${day.quranRate}%` }} />
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                          {day.adhkarRate}%
                        </div>
                        <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                          {day.quranPages} ص
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};
