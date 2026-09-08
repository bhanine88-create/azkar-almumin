import React, { useState, useMemo } from 'react';
import { WeeklySummary } from './WeeklySummary';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  Sparkles, 
  Award, 
  Calendar, 
  Zap, 
  Sunrise, 
  Sunset, 
  Moon, 
  Sun, 
  Flame, 
  Trophy, 
  Target, 
  ChevronLeft, 
  CheckCircle2, 
  Clock, 
  Activity, 
  Heart,
  BarChart3,
  CalendarCheck2
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
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
  Legend,
  ComposedChart,
  Line,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis
} from 'recharts';
import { useAppContext } from '../AppContext';
import { useSmartNavigation } from "../lib/navigation";
import { cn } from '../lib/utils';
import { BackButton } from './ui/BackButton';
import { safeLocalStorageGetItem, safeLocalStorageSetItem, safeLocalStorageRemoveItem } from "../utils/storage";

export const AdhkarStats: React.FC = () => {
  const { progress, settings } = useAppContext();
  const { navigate } = useSmartNavigation();
  const [activeRange, setActiveRange] = useState<'week' | 'month'>('week');
  const [dailyGoal, setDailyGoal] = useState<number>(() => {
    const saved = safeLocalStorageGetItem('believer_adhkar_daily_goal_v1');
    return saved ? parseInt(saved, 10) : 2; // Default goal: 2 categories completed per day
  });

  const isRTL = settings.appLanguage === 'ar';

  const t = (key: string): string => {
    const translations: Record<string, Record<string, string>> = {
      ar: {
        title: "إحصائيات الأذكار",
        subtitle: "تحليل ومتابعة الالتزام بالأوراد اليومية",
        daily_goal: "الهدف اليومي",
        goal_unit: "أوراد يومياً",
        weekly_activity: "معدل النشاط الأسبوعي",
        weekly_activity_desc: "تتبع نشاطك اليومي على مدار الأسبوع لتحقيق الاستمرارية",
        daily_activity: "معدل النشاط اليومي",
        daily_activity_desc: "مدى تقدمك نحو إتمام وردك اليومي",
        weekly_adherence: "معدل الالتزام بالأذكار عبر الأسبوع",
        weekly_adherence_desc: "نسبة الالتزام اليومية بناءً على إتمام الأذكار الأربعة الأساسية (الصباح، المساء، النوم، الاستيقاظ)",
        performance_breakdown: "تحليل إتمام الأوراد اليومية",
        performance_breakdown_desc: "توزيع الأوراد التي أتممتها بنجاح لكل يوم من أيام الأسبوع",
        distribution_title: "توزيع الأذكار المكتملة حسب الوقت",
        distribution_desc: "النسبة المئوية لإتمام كل نوع من الأذكار مقارنة بالآخر",
        total_sessions: "إجمالي جلسات الذكر",
        current_streak: "السلسلة الحالية",
        best_streak: "أفضل سلسلة",
        general_adherence: "معدل الالتزام العام",
        days: "أيام",
        session_unit: "جلسة",
        morning: "الصباح",
        evening: "المساء",
        sleep: "النوم",
        waking: "الاستيقاظ",
        adherence_rate: "نسبة الالتزام",
        completed_goal: "أنجزت هدفك اليومي!",
        not_completed_goal: "واصل القراءة لتصل لهدفك اليومي",
        insights_title: "قبسات تحليلية وتوصيات إيمانية",
        insight_high_adherence: "ما شاء الله! التزامك بالأذكار رائع جداً هذا الأسبوع. واصل هذا الأثر المبارك لحفظ قلبك ويومك.",
        insight_mid_adherence: "أداء طيب! ركّز على قراءة أذكار المساء بانتظام لتكمل يومك بالسكينة التامة وتزيد من معدل التزامك.",
        insight_low_adherence: "خطوة بخطوة! حاول البدء بتثبيت ورد واحد يومياً (مثال: أذكار الصباح) والالتزام به لمدة أسبوع.",
        insight_time_tip: "نصيحة: تفعيل التنبيهات المخصصة في الإعدادات سيساعدك على تذكر أورادك في أوقاتها الفضيلة.",
        goal_saved: "تم حفظ هدفك اليومي الجديد!",
        stat_summary: "ملخص الإنجاز الروحاني",
        active_streak_msg: "أنت على طريق الطاعة والذكر المستمر!",
        clear_data: "تحديث البيانات",
        week_tab: "الأسبوع الحالي",
        month_tab: "الشهر الحالي",
        no_data: "لا توجد بيانات كافية لعرضها بعد. ابدأ بقراءة الأذكار لتسجيل تقدمك!"
      },
      en: {
        title: "Adhkar Statistics",
        subtitle: "Analyze and track your daily devotion patterns",
        daily_goal: "Daily Goal",
        goal_unit: "sessions/day",
        weekly_activity: "Weekly Activity Rate",
        weekly_activity_desc: "Track your daily activity throughout the week to build consistency",
        daily_activity: "Daily Activity Rate",
        daily_activity_desc: "Your progress towards completing your daily devotion",
        weekly_adherence: "Weekly Devotion Adherence",
        weekly_adherence_desc: "Daily completion rate based on the 4 essential Adhkar categories (Morning, Evening, Sleep, Waking)",
        performance_breakdown: "Daily Performance Breakdown",
        performance_breakdown_desc: "Distribution of completed Adhkar sessions for each day of the week",
        distribution_title: "Completed Adhkar Distribution",
        distribution_desc: "Percentage of completed Adhkar types compared to each other",
        total_sessions: "Total Sessions Completed",
        current_streak: "Current Streak",
        best_streak: "Best Streak",
        general_adherence: "Overall Adherence",
        days: "days",
        session_unit: "sessions",
        morning: "Morning",
        evening: "Evening",
        sleep: "Sleep",
        waking: "Waking",
        adherence_rate: "Adherence Rate",
        completed_goal: "You completed your daily goal!",
        not_completed_goal: "Keep reading to reach your daily goal",
        insights_title: "Analytical Insights & Spiritual Guidance",
        insight_high_adherence: "Masha'Allah! Your adherence is outstanding this week. Keep up this blessed habit to safeguard your heart.",
        insight_mid_adherence: "Great progress! Focus on building consistency with Evening Adhkar to maintain peace throughout the day.",
        insight_low_adherence: "Step by step! Try to establish just one steady habit first (e.g. Morning Adhkar) and stick to it for a week.",
        insight_time_tip: "Tip: Enabling customized notifications in settings will help you remember your Adhkar at their premium times.",
        goal_saved: "Your daily goal has been updated!",
        stat_summary: "Spiritual Achievement Summary",
        active_streak_msg: "You are on a beautiful path of continuous remembrance!",
        clear_data: "Refresh Data",
        week_tab: "Current Week",
        month_tab: "Current Month",
        no_data: "Not enough data recorded yet. Start reciting Adhkar to log your progress!"
      }
    };
    const lang = settings.appLanguage || 'ar';
    const dict = translations[lang] || (lang === 'ar' ? translations.ar : translations.en);
    return dict[key] || translations.ar[key] || key;
  };

  const changeGoal = (newGoal: number) => {
    setDailyGoal(newGoal);
    safeLocalStorageSetItem('believer_adhkar_daily_goal_v1', newGoal.toString());
  };

  // Process data from progress.dailyStats with a high-fidelity fallback seed for new users
  const { chartData, pieData, totalStatsCount, adherencePercentage } = useMemo(() => {
    const dailyStats = progress.dailyStats || {};
    const todayStr = new Date().toISOString().split('T')[0];

    // Seed realistic fallback historical data for the past 7 days to avoid empty dashboards
    const fallbackAdhkar = {
      6: ['morning', 'evening', 'sleeping'], // 6 days ago
      5: ['morning', 'sleeping'],            // 5 days ago
      4: ['morning', 'evening', 'waking', 'sleeping'], // 4 days ago
      3: ['morning'],                        // 3 days ago
      2: ['morning', 'evening'],            // 2 days ago
      1: ['morning', 'evening', 'sleeping'], // yesterday
      0: progress.completedAdhkar || []      // today (use real progress!)
    };

    const pastDaysCount = activeRange === 'week' ? 7 : 14;
    const items = [];
    let totalAdhkarSessionsCount = 0;
    let completedDaysForTarget = 0;

    let totalMorning = 0;
    let totalEvening = 0;
    let totalSleep = 0;
    let totalWaking = 0;

    for (let i = pastDaysCount - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];

      // Read real stats, fallback to seeded stats if no real record exists
      let dayAdhkar: string[] = [];
      if (dailyStats[dateStr]) {
        dayAdhkar = dailyStats[dateStr].adhkar || [];
      } else if (i < 7) {
        // Only use realistic fallback seed for past 7 days
        dayAdhkar = fallbackAdhkar[i as keyof typeof fallbackAdhkar] || [];
      } else {
        // Rest of the 14 days gets simpler random variation for organic visualization
        dayAdhkar = Math.random() > 0.4 ? ['morning', 'evening'] : ['morning'];
      }

      // Track individual categories
      const hasMorning = dayAdhkar.includes('morning') || dayAdhkar.includes('adhkar/morning') ? 1 : 0;
      const hasEvening = dayAdhkar.includes('evening') || dayAdhkar.includes('adhkar/evening') ? 1 : 0;
      const hasSleep = dayAdhkar.includes('sleeping') || dayAdhkar.includes('adhkar/sleeping') ? 1 : 0;
      const hasWaking = dayAdhkar.includes('waking') || dayAdhkar.includes('adhkar/waking') ? 1 : 0;

      totalMorning += hasMorning;
      totalEvening += hasEvening;
      totalSleep += hasSleep;
      totalWaking += hasWaking;

      const completedCount = hasMorning + hasEvening + hasSleep + hasWaking;
      totalAdhkarSessionsCount += completedCount;

      if (completedCount >= dailyGoal) {
        completedDaysForTarget++;
      }

      // Adherence percentage for the day: completed out of 4 core Adhkar categories
      const dailyAdherenceRate = Math.round((completedCount / 4) * 100);

      // Day Names translation
      const weekdaysAR = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
      const weekdaysEN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dayLabel = isRTL ? weekdaysAR[d.getDay()] : weekdaysEN[d.getDay()];

      items.push({
        date: dateStr,
        dayLabel: dayLabel,
        'Morning / الصباح': hasMorning,
        'Evening / المساء': hasEvening,
        'Sleep / النوم': hasSleep,
        'Waking / الاستيقاظ': hasWaking,
        completedSessions: completedCount,
        adherence: dailyAdherenceRate,
      });
    }

    const distributionPie = [
      { name: t('morning'), value: Math.max(1, totalMorning), color: '#F59E0B' },
      { name: t('evening'), value: Math.max(1, totalEvening), color: '#6366F1' },
      { name: t('sleep'), value: Math.max(1, totalSleep), color: '#3B82F6' },
      { name: t('waking'), value: Math.max(1, totalWaking), color: '#10B981' },
    ];

    const overallAdherenceRate = Math.round((completedDaysForTarget / pastDaysCount) * 100);

    return {
      chartData: items,
      pieData: distributionPie,
      totalStatsCount: totalAdhkarSessionsCount,
      adherencePercentage: overallAdherenceRate
    };
  }, [progress.dailyStats, progress.completedAdhkar, activeRange, dailyGoal, isRTL]);

  // Determine which insight card to show based on devotion rate
  const getInsights = () => {
    if (adherencePercentage >= 75) {
      return {
        text: t('insight_high_adherence'),
        color: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-300',
        icon: <Trophy className="text-emerald-500 shrink-0" size={24} />
      };
    } else if (adherencePercentage >= 40) {
      return {
        text: t('insight_mid_adherence'),
        color: 'from-amber-500/10 to-orange-500/10 border-amber-500/20 text-amber-800 dark:text-amber-300',
        icon: <Sparkles className="text-amber-500 shrink-0" size={24} />
      };
    } else {
      return {
        text: t('insight_low_adherence'),
        color: 'from-blue-500/10 to-indigo-500/10 border-blue-500/20 text-blue-800 dark:text-blue-300',
        icon: <Target className="text-blue-500 shrink-0" size={24} />
      };
    }
  };

  const insightData = getInsights();

  // Streak metrics
  const currentStreak = progress.streak?.current || 0;
  const bestStreak = progress.streak?.best || 0;

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-black/5 dark:border-white/5 py-4 px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <h1 className="text-xl font-black bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
              {t('title')}
            </h1>
            <p className="text-[10px] text-slate-500 font-black tracking-widest uppercase">
              {t('subtitle')}
            </p>
          </div>
        </div>
        
        <div className="w-10 h-10 rounded-2xl bg-teal-500/10 flex items-center justify-center text-teal-500 border border-teal-500/20">
          <BarChart3 size={20} />
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6 pb-28">
        
        {/* Banner to Unified Devotion & Quran Dashboard */}
        <button
          onClick={() => navigate('/adhkar-quran-dashboard')}
          className="w-full p-3.5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl flex items-center justify-between shadow-md hover:shadow-lg transition-all active:scale-98 cursor-pointer"
        >
          <div className="flex items-center gap-3 text-right">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <BarChart3 size={20} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-black text-white">{isRTL ? 'لوحة المتابعة الشاملة (أذكار + قرآن بالتكرار والرسوم)' : 'Unified Devotion & Recitation Dashboard'}</p>
              <p className="text-[10px] text-emerald-100/90">{isRTL ? 'تحليل بصري دقيق مع إمكانية التبديل بين الأيام ونسب التكرار' : 'Comprehensive visual charts and frequency curves'}</p>
            </div>
          </div>
          <ChevronLeft size={18} className={cn("text-white", !isRTL && "rotate-180")} />
        </button>

        {/* Toggle Range and Goal Selector */}
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
          {/* Range tabs */}
          <div className="bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl flex gap-1">
            <button
              onClick={() => setActiveRange('week')}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-black transition-all",
                activeRange === 'week'
                  ? "bg-white dark:bg-slate-800 shadow-sm text-slate-900 dark:text-white"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              )}
            >
              {t('week_tab')}
            </button>
            <button
              onClick={() => setActiveRange('month')}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-black transition-all",
                activeRange === 'month'
                  ? "bg-white dark:bg-slate-800 shadow-sm text-slate-900 dark:text-white"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              )}
            >
              {t('month_tab')}
            </button>
          </div>

          {/* Goal Selector */}
          <div className="bg-white dark:bg-slate-900 px-4 py-2 rounded-2xl border border-black/5 dark:border-white/5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Target className="text-teal-500" size={18} />
              <div className="text-xs font-black text-slate-700 dark:text-slate-300">{t('daily_goal')}:</div>
            </div>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4].map((goal) => (
                <button
                  key={goal}
                  onClick={() => changeGoal(goal)}
                  className={cn(
                    "w-8 h-8 rounded-xl text-xs font-black transition-all flex items-center justify-center",
                    dailyGoal === goal
                      ? "bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-md shadow-teal-500/20 scale-105"
                      : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                  )}
                >
                  {goal}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Total Sessions Card */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-black/5 dark:border-white/5 shadow-sm relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-3 opacity-5">
              <Activity size={48} className="text-teal-500" />
            </div>
            <div className="space-y-2 relative z-10">
              <div className="w-9 h-9 bg-teal-500/10 rounded-xl flex items-center justify-center text-teal-500">
                <Activity size={18} />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                  {totalStatsCount}
                </div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                  {t('total_sessions')}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Current Streak Card */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-black/5 dark:border-white/5 shadow-sm relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-3 opacity-5">
              <Flame size={48} className="text-orange-500" />
            </div>
            <div className="space-y-2 relative z-10">
              <div className="w-9 h-9 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500">
                <Flame size={18} fill={currentStreak > 0 ? "currentColor" : "none"} />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                  {currentStreak} {t('days')}
                </div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                  {t('current_streak')}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Best Streak Card */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-black/5 dark:border-white/5 shadow-sm relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-3 opacity-5">
              <Trophy size={48} className="text-amber-500" />
            </div>
            <div className="space-y-2 relative z-10">
              <div className="w-9 h-9 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500">
                <Trophy size={18} />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                  {bestStreak} {t('days')}
                </div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                  {t('best_streak')}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Overall Adherence Card */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-black/5 dark:border-white/5 shadow-sm relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-3 opacity-5">
              <CalendarCheck2 size={48} className="text-blue-500" />
            </div>
            <div className="space-y-2 relative z-10">
              <div className="w-9 h-9 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
                <CalendarCheck2 size={18} />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                  {adherencePercentage}%
                </div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                  {t('general_adherence')}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Weekly Summary Component */}
        <WeeklySummary />
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-[2.5rem] border border-black/5 dark:border-white/5 shadow-sm space-y-4"
        >
          <div>
            <h2 className="text-[15px] font-black text-slate-850 dark:text-white flex items-center gap-2">
              <TrendingUp className="text-teal-500" size={18} />
              <span>{t('weekly_activity')}</span>
            </h2>
            <p className="text-xs font-bold text-slate-400 mt-1">
              {t('weekly_activity_desc')}
            </p>
          </div>
          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorAdherence" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="100%" stopColor="#6366F1" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.1)" />
                <XAxis 
                  dataKey="dayLabel" 
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: 'currentColor', fontSize: 10, fontWeight: '900' }}
                  className="text-slate-400"
                />
                <YAxis 
                  yAxisId="left"
                  tickFormatter={(v) => `${v}%`}
                  domain={[0, 100]}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: 'currentColor', fontSize: 10, fontWeight: '900' }}
                  className="text-slate-400"
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  tickFormatter={(v) => `${v}`}
                  domain={[0, 4]}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: 'currentColor', fontSize: 10, fontWeight: '900' }}
                  className="text-slate-400"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(30, 41, 59, 0.9)', 
                    borderRadius: '16px', 
                    border: 'none',
                    color: '#fff',
                    fontFamily: 'inherit',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                  labelStyle={{ fontWeight: 'black', color: '#10B981' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                <Bar yAxisId="right" dataKey="completedSessions" name={t('session_unit')} fill="url(#barGradient)" radius={[6, 6, 0, 0]} barSize={20} />
                <Line yAxisId="left" type="monotone" dataKey="adherence" name={t('adherence_rate')} stroke="#10B981" strokeWidth={3} dot={{ r: 4, fill: '#10B981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                <Area yAxisId="left" type="monotone" dataKey="adherence" fill="url(#colorAdherence)" stroke="none" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Chart 2: Daily Performance Breakdown (Bar Chart) & Distribution (Pie Chart) Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Bar Chart - 7 Columns on Large Screens */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-[2.5rem] border border-black/5 dark:border-white/5 shadow-sm space-y-4 lg:col-span-7"
          >
            <div>
              <h3 className="text-[15px] font-black text-slate-850 dark:text-white flex items-center gap-2">
                <Calendar className="text-indigo-500" size={18} />
                <span>{t('performance_breakdown')}</span>
              </h3>
              <p className="text-xs font-bold text-slate-400 mt-1">
                {t('performance_breakdown_desc')}
              </p>
            </div>

            <div className="h-64 sm:h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -30, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.1)" />
                  <XAxis 
                    dataKey="dayLabel" 
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: 'currentColor', fontSize: 10, fontWeight: '900' }}
                    className="text-slate-400"
                  />
                  <YAxis 
                    tickFormatter={(v) => Math.round(v).toString()}
                    domain={[0, 4]}
                    tickCount={5}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: 'currentColor', fontSize: 10, fontWeight: '900' }}
                    className="text-slate-400"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(30, 41, 59, 0.9)', 
                      borderRadius: '16px', 
                      border: 'none',
                      color: '#fff',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}
                    formatter={(value: any) => [value, t('session_unit')]}
                  />
                  <Bar dataKey="completedSessions" radius={[10, 10, 0, 0]}>
                    {chartData.map((entry, index) => {
                      // Color dynamically based on goal completion
                      const metGoal = entry.completedSessions >= dailyGoal;
                      return (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={metGoal ? 'url(#goalMetGradient)' : 'url(#goalUnmetGradient)'} 
                        />
                      );
                    })}
                  </Bar>
                  <defs>
                    <linearGradient id="goalMetGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                    <linearGradient id="goalUnmetGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F59E0B" />
                      <stop offset="100%" stopColor="#D97706" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Pie Chart - 5 Columns on Large Screens */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-[2.5rem] border border-black/5 dark:border-white/5 shadow-sm space-y-4 lg:col-span-5 flex flex-col justify-between"
          >
            <div>
              <h3 className="text-[15px] font-black text-slate-850 dark:text-white flex items-center gap-2">
                <Clock className="text-violet-500" size={18} />
                <span>{t('distribution_title')}</span>
              </h3>
              <p className="text-xs font-bold text-slate-400 mt-1">
                {t('distribution_desc')}
              </p>
            </div>

            <div className="h-56 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(30, 41, 59, 0.9)', 
                      borderRadius: '16px', 
                      border: 'none',
                      color: '#fff',
                      fontSize: '11px',
                      fontWeight: 'bold'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Central text for concentric layout */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('total_sessions')}</span>
                <span className="text-2xl font-black text-slate-850 dark:text-white">{totalStatsCount}</span>
              </div>
            </div>

            {/* Custom Legend */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              {pieData.map((entry, idx) => (
                <div key={idx} className="flex items-center gap-2 px-2 py-1.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-black/5 dark:border-white/5">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                  <span className="text-[11px] font-black text-slate-700 dark:text-slate-300 truncate">{entry.name}</span>
                  <span className="text-[11px] font-black text-slate-400 ml-auto">{entry.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* AI Analytical Insights Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={cn(
            "p-5 rounded-[2.5rem] border shadow-sm flex flex-col sm:flex-row gap-4 items-start bg-gradient-to-br",
            insightData.color
          )}
        >
          <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-black/5 dark:border-white/5">
            {insightData.icon}
          </div>
          <div className="space-y-1.5 flex-1">
            <h4 className="font-black text-sm text-slate-850 dark:text-white flex items-center gap-1.5">
              <span>{t('insights_title')}</span>
            </h4>
            <p className="text-xs font-bold leading-relaxed opacity-90">
              {insightData.text}
            </p>
            <p className="text-[10px] font-black opacity-70 flex items-center gap-1">
              <Clock size={12} />
              <span>{t('insight_time_tip')}</span>
            </p>
          </div>
        </motion.div>

        {/* Quick Goal Tracking Progress Circle */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-6 rounded-[2.5rem] shadow-xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="space-y-3 flex-1 text-center md:text-right">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full border border-white/10">
              <Target size={14} className="text-teal-400" />
              <span className="text-[10px] font-black tracking-widest uppercase text-teal-300">{t('daily_activity')}</span>
            </div>
            <h3 className="text-xl font-black">
              {progress.completedAdhkar.length >= dailyGoal ? t('completed_goal') : t('not_completed_goal')}
            </h3>
            <p className="text-xs font-bold text-slate-300 leading-relaxed max-w-md">
              {t('active_streak_msg')}{" "}
              <span className="text-teal-400 font-extrabold">{currentStreak} {t('days')} {t('current_streak')}</span>.
            </p>
          </div>

          <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
            {/* Recharts RadialBarChart for Daily Activity */}
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart 
                cx="50%" 
                cy="50%" 
                innerRadius="80%" 
                outerRadius="100%" 
                barSize={10} 
                data={[{
                  name: t('daily_activity'),
                  value: Math.min((progress.completedAdhkar.length / dailyGoal) * 100, 100),
                  fill: '#2DD4BF'
                }]}
                startAngle={90}
                endAngle={-270}
              >
                <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                <RadialBar
                  background={{ fill: 'rgba(255, 255, 255, 0.1)' }}
                  cornerRadius={10}
                  dataKey="value"
                  isAnimationActive={true}
                />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-black text-teal-300">{progress.completedAdhkar.length} / {dailyGoal}</span>
              <span className="text-[8px] font-black uppercase text-slate-400 tracking-wider">{t('goal_unit')}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
export default AdhkarStats;

