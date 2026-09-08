import React, { useMemo } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { FastingRecord, FastingType } from '../hooks/useFastingTracker';
import { Trophy, TrendingUp, PieChart as PieChartIcon, Flame, Award, Sparkles, CheckCircle2, Star, Calendar } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface Props {
  fastingRecords: Record<string, FastingRecord>;
  currentYear: number;
  isRtl: boolean;
  monthlyGoal?: number;
  qadaaGoal?: number;
}

export const FastingStatsVisuals: React.FC<Props> = ({ 
  fastingRecords, 
  currentYear, 
  isRtl,
  monthlyGoal = 4,
  qadaaGoal = 0
}) => {
  const stats = useMemo(() => {
    const records = Object.values(fastingRecords);
    const thisYearRecords = records.filter(r => new Date(r.date).getFullYear() === currentYear);

    let sunnahCount = 0;
    let whiteDaysCount = 0;
    let monThuCount = 0;
    let qadaaCount = 0;
    let voluntaryCount = 0;
    let otherCount = 0;

    const currentMonth = new Date().getMonth();
    let currentMonthCount = 0;

    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      name: new Intl.DateTimeFormat(isRtl ? 'ar' : 'en', { month: 'short' }).format(new Date(currentYear, i, 1)),
      count: 0
    }));

    thisYearRecords.forEach(record => {
      const type = record.type;
      if (type === 'white_day') {
        whiteDaysCount++;
        sunnahCount++;
      } else if (type === 'monday' || type === 'thursday') {
        monThuCount++;
        sunnahCount++;
      } else if (type === 'ashura' || type === 'arafah' || type === 'shawal') {
        sunnahCount++;
      } else if (type === 'qadaa') {
        qadaaCount++;
      } else if (type === 'voluntary') {
        voluntaryCount++;
      } else {
        otherCount++;
      }

      const d = new Date(record.date);
      const monthIndex = d.getMonth();
      monthlyData[monthIndex].count++;

      if (monthIndex === currentMonth) {
        currentMonthCount++;
      }
    });

    const totalFasted = thisYearRecords.length;
    const totalAllTime = records.length;
    const sunnahPercentage = totalFasted === 0 ? 0 : Math.round((sunnahCount / totalFasted) * 100);

    // Calculate badges
    const badges = [
      {
        id: 'first_fast',
        title: 'فاتحة الخير',
        desc: 'صيام أول يوم في سجل الإيمان',
        unlocked: totalAllTime >= 1,
        icon: Star,
        color: 'from-amber-400 to-amber-600'
      },
      {
        id: 'white_days_master',
        title: 'نور الأيام البيض',
        desc: 'صيام 3 أيام بيض على الأقل',
        unlocked: whiteDaysCount >= 3,
        icon: Sparkles,
        color: 'from-teal-400 to-emerald-600'
      },
      {
        id: 'sunnah_champion',
        title: 'متبع السُنّة',
        desc: 'صيام 8 أيام من الاثنين والخميس',
        unlocked: monThuCount >= 8,
        icon: Trophy,
        color: 'from-blue-500 to-indigo-600'
      },
      {
        id: 'ten_days',
        title: 'عشرة الخير',
        desc: 'إتمام 10 أيام صيام في العام',
        unlocked: totalFasted >= 10,
        icon: Award,
        color: 'from-purple-500 to-rose-600'
      }
    ];

    return { 
      totalFasted, 
      totalAllTime,
      sunnahCount, 
      whiteDaysCount, 
      monThuCount, 
      qadaaCount,
      voluntaryCount,
      otherCount,
      sunnahPercentage, 
      monthlyData,
      currentMonthCount,
      badges
    };
  }, [fastingRecords, currentYear, isRtl]);

  if (stats.totalAllTime === 0) return null;

  return (
    <div className="space-y-4">
      {/* Advanced Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Sunnah Ratio Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-800 rounded-3xl p-4.5 text-white shadow-lg shadow-emerald-950/20 relative overflow-hidden border border-emerald-400/20"
        >
          <div className="absolute -right-6 -bottom-6 text-white/10 pointer-events-none">
            <Trophy size={110} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-1 rounded-full bg-white/15 text-[11px] font-bold tracking-wide backdrop-blur-sm">
                نسبة صيام السُنة
              </span>
              <Award size={18} className="text-emerald-200" />
            </div>

            <div className="flex items-baseline gap-1.5 my-1">
              <span className="text-4xl font-black tracking-tight">{stats.sunnahPercentage}</span>
              <span className="text-xl font-bold text-emerald-200">%</span>
            </div>

            <p className="text-xs text-emerald-100/90 font-medium mt-2 leading-relaxed">
              {stats.sunnahCount} يوم سُنّة من أصل {stats.totalFasted} يوم صمته في {currentYear}
            </p>
          </div>
        </motion.div>

        {/* Detailed Breakdown Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white dark:bg-slate-900 rounded-3xl p-4.5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                  <PieChartIcon size={15} />
                </div>
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200">توزيع الصيام</h4>
              </div>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                {currentYear}
              </span>
            </div>

            <div className="space-y-2.5 mt-1">
              {/* Monday & Thursday */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1 font-medium">
                  <span className="text-slate-600 dark:text-slate-300">الاثنين والخميس</span>
                  <span className="font-bold text-slate-900 dark:text-white">{stats.monThuCount} أيام</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-teal-500 to-emerald-500 h-full rounded-full transition-all duration-700" 
                    style={{ width: `${stats.totalFasted ? (stats.monThuCount / stats.totalFasted) * 100 : 0}%` }}
                  />
                </div>
              </div>
              
              {/* White Days */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1 font-medium">
                  <span className="text-slate-600 dark:text-slate-300">الأيام البيض (١٣-١٤-١٥)</span>
                  <span className="font-bold text-slate-900 dark:text-white">{stats.whiteDaysCount} أيام</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-amber-400 to-amber-500 h-full rounded-full transition-all duration-700" 
                    style={{ width: `${stats.totalFasted ? (stats.whiteDaysCount / stats.totalFasted) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Qadaa or other */}
              {stats.qadaaCount > 0 && (
                <div>
                  <div className="flex justify-between items-center text-xs mb-1 font-medium">
                    <span className="text-slate-600 dark:text-slate-300">القضاء والنذور</span>
                    <span className="font-bold text-slate-900 dark:text-white">{stats.qadaaCount} أيام</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full rounded-full transition-all duration-700" 
                      style={{ width: `${stats.totalFasted ? (stats.qadaaCount / stats.totalFasted) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Badges / Achievements */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Trophy size={16} />
          </div>
          <h3 className="font-bold text-sm text-slate-800 dark:text-white">أوسمة وإنجازات الصيام</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {stats.badges.map(badge => {
            const Icon = badge.icon;
            return (
              <div 
                key={badge.id}
                className={cn(
                  "p-3 rounded-2xl border transition-all duration-300 flex flex-col items-center text-center relative overflow-hidden",
                  badge.unlocked 
                    ? "bg-slate-50 dark:bg-slate-800/60 border-slate-200/90 dark:border-slate-700 shadow-sm"
                    : "bg-slate-50/40 dark:bg-slate-900/40 border-dashed border-slate-200 dark:border-slate-800 opacity-60"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-2xl flex items-center justify-center mb-2 shadow-inner transition-transform",
                  badge.unlocked 
                    ? `bg-gradient-to-br ${badge.color} text-white shadow-md scale-105` 
                    : "bg-slate-200 dark:bg-slate-800 text-slate-400"
                )}>
                  <Icon size={20} />
                </div>
                <h5 className="font-bold text-xs text-slate-800 dark:text-white mb-0.5">{badge.title}</h5>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-tight">{badge.desc}</p>
                {badge.unlocked && (
                  <span className="mt-1.5 px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[9px] font-bold flex items-center gap-0.5">
                    <CheckCircle2 size={10} /> تم الإنجاز
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Trend Chart */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-200/80 dark:border-slate-800"
      >
        <div className="flex items-center justify-between mb-4 text-slate-800 dark:text-white">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
            <h3 className="font-bold text-sm text-slate-800 dark:text-white">مسار الصيام الشهري ({currentYear})</h3>
          </div>
          <span className="text-xs font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50 px-2.5 py-1 rounded-full border border-teal-200/50 dark:border-teal-800/50">
            {stats.totalFasted} يوم خلال العام
          </span>
        </div>
        
        <div className="h-44 w-full" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.monthlyData} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
              <defs>
                <linearGradient id="fastingGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" opacity={0.15} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} 
                dy={6} 
              />
              <YAxis 
                allowDecimals={false}
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#64748b' }} 
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '16px', 
                  border: '1px solid rgba(226, 232, 240, 0.8)', 
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  textAlign: 'right'
                }}
                formatter={(value: any) => [`${value} أيام`, 'صيام']}
              />
              <Area 
                type="monotone" 
                dataKey="count" 
                stroke="#0d9488" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#fastingGradient)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
};

