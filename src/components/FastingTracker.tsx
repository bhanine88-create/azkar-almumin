import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from '../i18n';
import { BackButton } from './ui/BackButton';
import { useFastingTracker, FastingType } from '../hooks/useFastingTracker';
import { useAppContext } from '../AppContext';
import { cn, triggerHaptic, getHijriDate, getDayName, getShortDayName } from '../lib/utils';
import { FastingStatsVisuals } from './FastingStatsVisuals';
import { 
  Calendar, 
  CheckCircle2, 
  Moon, 
  Sun, 
  Award, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Star, 
  Heart, 
  Sparkles, 
  Flame, 
  BookOpen, 
  Clock, 
  Target, 
  Plus, 
  Minus, 
  X, 
  Layers, 
  Info,
  CalendarDays,
  CheckCheck,
  TrendingUp,
  BookmarkCheck,
  Copy
} from 'lucide-react';
import moment from 'moment-hijri';

type TabKey = 'calendar' | 'upcoming' | 'qadaa' | 'stats' | 'virtues';

const FASTING_TYPES_INFO: Record<FastingType, { label: string; color: string; badgeBg: string }> = {
  'monday': { label: 'سُنّة الاثنين', color: 'text-teal-600 dark:text-teal-400', badgeBg: 'bg-teal-500' },
  'thursday': { label: 'سُنّة الخميس', color: 'text-teal-600 dark:text-teal-400', badgeBg: 'bg-teal-500' },
  'white_day': { label: 'الأيام البيض (١٣-١٤-١٥)', color: 'text-amber-600 dark:text-amber-400', badgeBg: 'bg-amber-500' },
  'ashura': { label: 'يوم عاشوراء', color: 'text-purple-600 dark:text-purple-400', badgeBg: 'bg-purple-600' },
  'arafah': { label: 'يوم عرفة', color: 'text-emerald-600 dark:text-emerald-400', badgeBg: 'bg-emerald-600' },
  'shawal': { label: 'الست من شوال', color: 'text-blue-600 dark:text-blue-400', badgeBg: 'bg-blue-600' },
  'ramadan': { label: 'شهر رمضان المبارك', color: 'text-emerald-600 dark:text-emerald-400', badgeBg: 'bg-emerald-700' },
  'qadaa': { label: 'قضاء رمضان', color: 'text-rose-600 dark:text-rose-400', badgeBg: 'bg-rose-500' },
  'kaffarah': { label: 'كفارة', color: 'text-indigo-600 dark:text-indigo-400', badgeBg: 'bg-indigo-500' },
  'nadr': { label: 'صيام نذر', color: 'text-violet-600 dark:text-violet-400', badgeBg: 'bg-violet-500' },
  'voluntary': { label: 'صيام تطوع عام', color: 'text-emerald-600 dark:text-emerald-400', badgeBg: 'bg-emerald-500' },
  'custom': { label: 'صيام نافلة', color: 'text-teal-600 dark:text-teal-400', badgeBg: 'bg-teal-500' },
};

const FASTING_VIRTUES = [
  {
    title: 'باعد الله وجهه عن النار',
    hadith: 'قال رسول الله ﷺ: «مَنْ صَامَ يَوْمًا فِي سَبِيلِ اللَّهِ، بَاعَدَ اللَّهُ وَجْهَهُ عَنِ النَّارِ سَبْعِينَ خَرِيفًا».',
    source: 'متفق عليه'
  },
  {
    title: 'باب الريان للصائمين',
    hadith: 'قال رسول الله ﷺ: «إِنَّ فِي الْجَنَّةِ بَابًا يُقَالُ لَهُ الرَّيَّانُ، يَدْخُلُ مِنْهُ الصَّائِمُونَ يَوْمَ الْقِيَامَةِ، لاَ يَدْخُلُ مِنْهُ أَحَدٌ غَيْرُهُمْ».',
    source: 'صحيح البخاري'
  },
  {
    title: 'دعوة الصائم المستجابة',
    hadith: 'قال رسول الله ﷺ: «ثَلَاثُ دَعَوَاتٍ لَا تُرَدُّ: دَعْوَةُ الْوَالِدِ، وَدَعْوَةُ الصَّائِمِ، وَدَعْوَةُ الْمُسَافِرِ».',
    source: 'صحيح الجامع'
  },
  {
    title: 'فرحتان للصائم',
    hadith: 'قال رسول الله ﷺ: «لِلصَّائِمِ فَرْحَتَانِ يَفْرَحُهُمَا: إِذَا أَفْطَرَ فَرِحَ، وَإِذَا لَقِيَ رَبَّهُ فَرِحَ بِصَوْمِهِ».',
    source: 'صحيح مسلم'
  }
];

export const FastingTracker: React.FC = () => {
  const { settings } = useAppContext();
  const { t, isRtl } = useTranslation(settings.appLanguage);
  const { 
    fastingRecords, 
    toggleFastingDay, 
    setFastingDetails, 
    removeFastingDay, 
    getFastingCount,
    getQadaaCount,
    qadaaGoal,
    updateQadaaGoal,
    monthlyGoal,
    updateMonthlyGoal
  } = useFastingTracker();

  const [activeTab, setActiveTab] = useState<TabKey>('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Selected day for modal
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<FastingType>('monday');
  const [selectedNotes, setSelectedNotes] = useState<string>('');
  const [showDayModal, setShowDayModal] = useState<boolean>(false);
  const [showIftarDuaModal, setShowIftarDuaModal] = useState<boolean>(false);
  const [copiedDuaIndex, setCopiedDuaIndex] = useState<number | null>(null);

  const handleCopyDua = (text: string, index: number) => {
    triggerHaptic('success');
    navigator.clipboard.writeText(text);
    setCopiedDuaIndex(index);
    setTimeout(() => setCopiedDuaIndex(null), 2000);
  };

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const isTodayFasted = !!fastingRecords[todayStr];

  // Helper to get days in month
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());

  const prevMonth = () => {
    triggerHaptic('light');
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    triggerHaptic('light');
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const resetToTodayMonth = () => {
    triggerHaptic('light');
    setCurrentDate(new Date());
  };

  const getDayType = (dateObj: Date): FastingType => {
    const dayOfWeek = dateObj.getDay();
    if (dayOfWeek === 1) return 'monday';
    if (dayOfWeek === 4) return 'thursday';
    
    // Convert to Hijri with user offset to check for white days (13, 14, 15)
    try {
      const hMoment = moment(dateObj).add(settings.hijriOffset || 0, 'days');
      const hDay = Number(hMoment.format('iD'));
      const hMonth = Number(hMoment.format('iM'));

      // Check special islamic days
      if (hMonth === 1 && hDay === 10) return 'ashura';
      if (hMonth === 12 && hDay === 9) return 'arafah';
      if (hMonth === 10 && hDay >= 2 && hDay <= 7) return 'shawal';
      if (hDay === 13 || hDay === 14 || hDay === 15) return 'white_day';
    } catch {
      // fallback
    }
    
    return 'voluntary';
  };

  const todayType = useMemo(() => getDayType(new Date()), [settings.hijriOffset]);

  const openDayDialog = (day: number) => {
    triggerHaptic('light');
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateStr = clickedDate.toISOString().split('T')[0];
    const existing = fastingRecords[dateStr];
    
    setSelectedDateStr(dateStr);
    if (existing) {
      setSelectedType(existing.type || getDayType(clickedDate));
      setSelectedNotes(existing.notes || '');
    } else {
      setSelectedType(getDayType(clickedDate));
      setSelectedNotes('');
    }
    setShowDayModal(true);
  };

  const handleSaveDayDetails = () => {
    if (!selectedDateStr) return;
    triggerHaptic('success');
    setFastingDetails(selectedDateStr, selectedType, selectedNotes);
    setShowDayModal(false);
  };

  const handleRemoveDayRecord = () => {
    if (!selectedDateStr) return;
    triggerHaptic('medium');
    removeFastingDay(selectedDateStr);
    setShowDayModal(false);
  };

  const monthName = new Intl.DateTimeFormat(isRtl ? 'ar' : 'en', { month: 'long', year: 'numeric' }).format(currentDate);
  const totalThisMonth = getFastingCount(currentDate.getMonth(), currentDate.getFullYear());
  const totalAllTime = Object.keys(fastingRecords).length;
  const qadaaCompletedCount = getQadaaCount();
  const qadaaRemaining = Math.max(0, qadaaGoal - qadaaCompletedCount);

  const getFastingTypeLabel = (type: FastingType): string => {
    switch (type) {
      case 'monday': return t('sunnah_monday') || 'سُنّة الاثنين';
      case 'thursday': return t('sunnah_thursday') || 'سُنّة الخميس';
      case 'white_day': return t('fasting_white_days') || 'الأيام البيض (١٣-١٤-١٥)';
      case 'ashura': return t('fasting_ashura') || 'يوم عاشوراء';
      case 'arafah': return t('fasting_arafah') || 'يوم عرفة';
      case 'shawal': return t('fasting_shawal') || 'الست من شوال';
      case 'ramadan': return t('fasting_ramadan') || 'شهر رمضان المبارك';
      case 'qadaa': return t('fasting_qadaa') || 'قضاء رمضان';
      case 'kaffarah': return t('fasting_kaffarah') || 'كفارة';
      case 'nadr': return t('fasting_nadr') || 'صيام نذر';
      case 'voluntary': return t('fasting_voluntary') || 'صيام تطوع عام';
      case 'custom': return t('fasting_custom') || 'صيام نافلة';
      default: return 'نافلة';
    }
  };

  // 7 days of the calendar week (Sunday to Saturday) localized
  const calendarWeekDayHeaders = useMemo(() => {
    // 2026-01-04 was a Sunday
    const baseSunday = new Date(2026, 0, 4);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(baseSunday);
      d.setDate(baseSunday.getDate() + i);
      return {
        full: getDayName(d, settings.appLanguage),
        short: getShortDayName(d, settings.appLanguage)
      };
    });
  }, [settings.appLanguage]);

  // Calculate upcoming Sunnah days list
  const upcomingSunnahDays = useMemo(() => {
    const list: Array<{ date: Date; dateStr: string; type: FastingType; label: string; daysLeft: number; hijriFormatted: string }> = [];
    const now = new Date();
    
    for (let i = 1; i <= 30; i++) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
      const type = getDayType(d);
      if (type !== 'voluntary') {
        const dateStr = d.toISOString().split('T')[0];
        let label = getFastingTypeLabel(type);
        
        try {
          const hMoment = moment(d).add(settings.hijriOffset || 0, 'days');
          const hijriFormatted = `${hMoment.format('iD')} ${hMoment.format('iMMMM')}`;
          list.push({
            date: d,
            dateStr,
            type,
            label,
            daysLeft: i,
            hijriFormatted
          });
        } catch {
          list.push({
            date: d,
            dateStr,
            type,
            label,
            daysLeft: i,
            hijriFormatted: ''
          });
        }
      }
      if (list.length >= 8) break;
    }
    return list;
  }, [settings.hijriOffset, settings.appLanguage]);

  const todayHijriString = useMemo(() => {
    return getHijriDate(new Date(), settings.hijriOffset, settings.appLanguage);
  }, [settings.hijriOffset, settings.appLanguage]);

  // Compute the 7 days of the current week (Saturday to Friday)
  const weekDays = useMemo(() => {
    const now = new Date();
    const currentDayOfWeek = now.getDay(); // 0 is Sunday, 6 is Saturday
    // In Arab/Islamic calendar, Saturday is first day: diff from Saturday
    const diffToSaturday = (currentDayOfWeek + 1) % 7;
    const saturday = new Date(now);
    saturday.setDate(now.getDate() - diffToSaturday);

    const days = [];
    let weekFastedCount = 0;

    for (let i = 0; i < 7; i++) {
      const d = new Date(saturday);
      d.setDate(saturday.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const isToday = dateStr === todayStr;
      const type = getDayType(d);
      const isSunnah = type === 'monday' || type === 'thursday' || type === 'white_day';
      const isWhite = type === 'white_day';
      const record = fastingRecords[dateStr];
      const isFasted = !!record;
      if (isFasted) weekFastedCount++;

      let hijriDay = '';
      try {
        const hM = moment(d).add(settings.hijriOffset || 0, 'days');
        hijriDay = hM.format('iD');
      } catch {}

      days.push({
        date: d,
        dateStr,
        dayName: getDayName(d, settings.appLanguage),
        shortName: getShortDayName(d, settings.appLanguage),
        dayNumber: d.getDate(),
        hijriDay,
        isToday,
        type,
        isSunnah,
        isWhite,
        isFasted,
        record
      });
    }

    return { days, weekFastedCount };
  }, [todayStr, fastingRecords, settings.hijriOffset, settings.appLanguage]);

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 pb-28 selection:bg-teal-500 selection:text-white" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl py-3.5 px-3 sm:px-6 lg:px-8 border-b border-slate-200/80 dark:border-slate-800/80 shadow-xs">
        <div className="w-full max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BackButton />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {t('fasting_tracker_title') || "عداد الصيام"}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-300 text-[10px] sm:text-xs font-extrabold border border-teal-500/20">
                  {todayHijriString}
                </span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
                {t('fasting_tracker_desc') || "تتبع صيام النوافل والأيام البيض وقضاء الفوائت"}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowIftarDuaModal(true)}
            className="p-2.5 sm:px-4 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 transition-all active:scale-95 border border-amber-500/20 flex items-center gap-2 text-xs sm:text-sm font-bold"
            title={t('iftar_dua_modal_title') || "دعاء الصائم والإفطار"}
          >
            <Sparkles size={16} />
            <span>{t('iftar_dua_btn') || "دعاء الإفطار"}</span>
          </button>
        </div>
      </div>

      <div className="p-3 sm:p-5 md:p-6 lg:p-8 w-full max-w-[1600px] mx-auto space-y-5 md:space-y-6">
        {/* Today's Hero Fasting Card */}
        <motion.div 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "rounded-3xl p-5 md:p-6 shadow-xl relative overflow-hidden transition-all duration-500 border",
            isTodayFasted 
              ? "bg-gradient-to-br from-emerald-600 via-teal-600 to-teal-800 text-white border-emerald-400/30 shadow-teal-950/20"
              : "bg-white dark:bg-slate-900 shadow-slate-200/60 dark:shadow-none border-slate-200/90 dark:border-slate-800"
          )}
        >
          {/* Subtle Arabesque Pattern */}
          <div 
            className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06] pointer-events-none mix-blend-overlay"
            style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/arabesque.png')" }}
          />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner transition-transform duration-500",
                isTodayFasted 
                  ? "bg-white/20 text-white backdrop-blur-md rotate-3" 
                  : "bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 border border-teal-200/40 dark:border-teal-800/40"
              )}>
                {isTodayFasted ? (
                  <CheckCircle2 size={32} className="stroke-[2.5]" />
                ) : (
                  <Moon size={28} className="stroke-[2]" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h2 className={cn("font-black text-xl tracking-tight", isTodayFasted ? "text-white" : "text-slate-900 dark:text-white")}>
                    {isTodayFasted 
                      ? (t('today_fasting_recorded') || "هنيئاً لك.. صيامك مسجل اليوم") 
                      : (t('today_fasting_card') || "صيام اليوم")}
                  </h2>
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-[11px] font-bold",
                    isTodayFasted 
                      ? "bg-emerald-400/25 text-white border border-white/20" 
                      : "bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300"
                  )}>
                    {getFastingTypeLabel(todayType)}
                  </span>
                </div>

                <p className={cn("text-xs leading-relaxed max-w-md", isTodayFasted ? "text-teal-50" : "text-slate-500 dark:text-slate-400")}>
                  {isTodayFasted 
                    ? "تقبّل الله طاعتك وأثابك الفردوس الأعلى، قال ﷺ: «للصائم فرحتان: فرحة حين يفطر، وفرحة حين يلقى ربه»."
                    : "«مَنْ صَامَ يَوْمًا فِي سَبِيلِ اللَّهِ، بَاعَدَ اللَّهُ وَجْهَهُ عَنِ النَّارِ سَبْعِينَ خَرِيفًا». هل نويت الصيام اليوم؟"
                  }
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-stretch md:self-auto shrink-0">
              <button 
                onClick={() => {
                  triggerHaptic('success');
                  toggleFastingDay(todayStr, todayType);
                }}
                className={cn(
                  "flex-1 md:flex-initial h-12 px-6 rounded-2xl font-bold flex items-center justify-center gap-2.5 transition-all duration-300 active:scale-95 shadow-md",
                  isTodayFasted 
                    ? "bg-white text-teal-700 hover:bg-slate-100 shadow-teal-950/20" 
                    : "bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white shadow-teal-500/25"
                )}
              >
                {isTodayFasted ? (
                  <>
                    <CheckCheck size={20} />
                    <span>{t('i_am_fasting_checked') || "أنا صائم اليوم ✓"}</span>
                  </>
                ) : (
                  <>
                    <Heart size={20} />
                    <span>{t('i_am_fasting_yes') || "نعم، أنا صائم اليوم"}</span>
                  </>
                )}
              </button>

              {isTodayFasted && (
                <button
                  onClick={() => openDayDialog(new Date().getDate())}
                  className="w-12 h-12 rounded-2xl bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-all active:scale-90 border border-white/20 shrink-0"
                  title={t('edit_fasting_type_note') || "تعديل نوع الصيام أو إضافة ملاحظة"}
                >
                  <Layers size={18} />
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Smart Weekly Days Capsule Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden"
        >
          {/* Header info */}
          <div className="flex items-center justify-between gap-2 mb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <CalendarDays size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {t('weekly_days_capsules') || "كبسولات أيام الأسبوع"}
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-extrabold border border-emerald-200/60 dark:border-emerald-800/60">
                    {weekDays.weekFastedCount} / 7
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {t('weekly_capsules_desc') || "تتبع أسبوعي ذكي مع تمييز اليوم الحالي وسنن الصيام"}
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-xl border border-emerald-200/50 dark:border-emerald-800/50">
              <Sparkles size={13} />
              <span>{getDayName(new Date(), settings.appLanguage)}</span>
            </div>
          </div>

          {/* 7 Days Capsules Grid */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-3 lg:gap-4">
            {weekDays.days.map((item, idx) => {
              const isToday = item.isToday;
              const isFasted = item.isFasted;
              const isSunnah = item.isSunnah;

              return (
                <button
                  key={idx}
                  onClick={() => {
                    triggerHaptic('light');
                    openDayDialog(item.date.getDate());
                  }}
                  className={cn(
                    "group relative rounded-2xl sm:rounded-3xl p-1.5 sm:p-3 flex flex-col items-center justify-between transition-all duration-300 active:scale-95 text-center min-h-[120px] sm:min-h-[140px] md:min-h-[155px] border cursor-pointer",
                    isToday 
                      ? "bg-gradient-to-b from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-600/30 border-emerald-400 ring-2 sm:ring-4 ring-emerald-400 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 z-10 scale-[1.03]" 
                      : isFasted
                        ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 border-emerald-300/80 dark:border-emerald-700 hover:bg-emerald-100/70"
                        : isSunnah
                          ? "bg-emerald-50/40 dark:bg-slate-800/60 border-emerald-200/70 dark:border-emerald-800/50 text-slate-700 dark:text-slate-200 hover:bg-emerald-50/80 hover:border-emerald-300"
                          : "bg-slate-50/80 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                  title={`${item.dayName} - ${item.dayNumber} (${isToday ? (t('today') || 'اليوم') : isFasted ? (t('fasted_badge') || 'صائم') : isSunnah ? (t('recommended_fast') || 'صيام مستحب') : (t('log_now') || 'انقر للتسجيل')})`}
                >
                  {/* Top Pill / Today Badge */}
                  {isToday ? (
                    <div className="px-2 py-0.5 rounded-full bg-white text-emerald-800 text-[9px] sm:text-[10px] font-black tracking-tight shadow-xs flex items-center gap-1 mb-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
                      <span>{t('today') || 'اليوم'}</span>
                    </div>
                  ) : isSunnah ? (
                    <span className={cn(
                      "text-[8px] sm:text-[10px] font-extrabold px-1.5 rounded-md leading-none py-0.5 mb-0.5",
                      item.isWhite 
                        ? "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300" 
                        : "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
                    )}>
                      {item.isWhite ? (t('white_days_badge') || 'بيض') : (t('sunnah_badge') || 'سُنّة')}
                    </span>
                  ) : (
                    <span className="text-[8px] sm:text-[10px] font-semibold text-slate-400 dark:text-slate-500 py-0.5 mb-0.5">
                      {item.hijriDay ? `${item.hijriDay}هـ` : '—'}
                    </span>
                  )}

                  {/* Day Name */}
                  <span className={cn(
                    "text-[11px] sm:text-sm font-black tracking-tight leading-tight",
                    isToday ? "text-white drop-shadow-xs" : "text-slate-800 dark:text-slate-200"
                  )}>
                    <span className="hidden sm:inline">{item.dayName}</span>
                    <span className="sm:hidden">{item.shortName}</span>
                  </span>

                  {/* Circular Date Badge */}
                  <div className={cn(
                    "w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center my-1 text-xs sm:text-base md:text-lg font-black transition-transform shadow-xs",
                    isToday 
                      ? "bg-white text-emerald-700 shadow-md group-hover:scale-110" 
                      : isFasted 
                        ? "bg-emerald-500 text-white shadow-xs" 
                        : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 group-hover:border-emerald-400"
                  )}>
                    {isFasted && !isToday ? (
                      <Check size={16} className="stroke-[3]" />
                    ) : (
                      item.dayNumber
                    )}
                  </div>

                  {/* Bottom Fasting Indicator */}
                  <div className="w-full flex items-center justify-center pt-0.5">
                    {isFasted ? (
                      <span className={cn(
                        "text-[9px] sm:text-xs font-bold flex items-center gap-1",
                        isToday ? "text-emerald-100" : "text-emerald-600 dark:text-emerald-400"
                      )}>
                        <CheckCircle2 size={12} className={isToday ? "fill-white text-emerald-600" : ""} />
                        <span>{t('fasted_badge') || 'صائم'}</span>
                      </span>
                    ) : isToday ? (
                      <span className="text-[9px] sm:text-xs font-bold text-emerald-100 opacity-90">
                        {t('log_now') || 'سجّل الآن'}
                      </span>
                    ) : isSunnah ? (
                      <span className="text-[9px] sm:text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {t('recommended_fast') || 'مستحب'}
                      </span>
                    ) : (
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 opacity-60">
                        —
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Quick Navigation Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5 p-1.5 bg-slate-200/60 dark:bg-slate-900/80 rounded-2xl border border-slate-200/60 dark:border-slate-800/80">
          {[
            { key: 'calendar', label: t('monthly_calendar') || 'التقويم الشهري', icon: CalendarDays },
            { key: 'upcoming', label: t('upcoming_sunnahs') || 'السنن القادمة', icon: Calendar },
            { key: 'qadaa', label: t('qadaa_tab') || 'قضاء الفوائت', icon: Target },
            { key: 'stats', label: t('fasting_stats_tab') || 'الإحصائيات', icon: TrendingUp },
            { key: 'virtues', label: t('fasting_virtues_tab') || 'فضائل الصيام', icon: BookOpen },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => {
                  triggerHaptic('light');
                  setActiveTab(tab.key as TabKey);
                }}
                className={cn(
                  "py-3 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all duration-200",
                  isActive 
                    ? "bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-sm" 
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Interactive Calendar */}
        {activeTab === 'calendar' && (
          <motion.div
            key="calendar-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    {t('fasting_this_month') || 'صيام هذا الشهر'}
                  </p>
                  <p className="text-xl font-black text-slate-900 dark:text-white">
                    {totalThisMonth} <span className="text-xs font-normal text-slate-400">أيام</span>
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Award size={20} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    {t('total_fasting_days') || 'إجمالي الأيام'}
                  </p>
                  <p className="text-xl font-black text-slate-900 dark:text-white">
                    {totalAllTime} <span className="text-xs font-normal text-slate-400">يوماً</span>
                  </p>
                </div>
              </div>

              <div className="col-span-2 sm:col-span-1 bg-white dark:bg-slate-900 rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Target size={20} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    {t('monthly_fasting_target') || 'الهدف الشهري'}
                  </p>
                  <p className="text-xl font-black text-slate-900 dark:text-white">
                    {totalThisMonth} / {monthlyGoal} <span className="text-xs font-normal text-slate-400">أيام</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Calendar View Box */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-200/80 dark:border-slate-800">
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-lg text-slate-900 dark:text-white">{monthName}</h3>
                  <button 
                    onClick={resetToTodayMonth}
                    className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 font-bold"
                  >
                    اليوم
                  </button>
                </div>

                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <button 
                    onClick={prevMonth} 
                    className="w-9 h-9 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all"
                  >
                    {isRtl ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                  </button>
                  <button 
                    onClick={nextMonth} 
                    className="w-9 h-9 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all"
                  >
                    {isRtl ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                  </button>
                </div>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 text-center mb-2.5 text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase">
                {calendarWeekDayHeaders.map((day, i) => (
                  <div key={i} className="py-1" title={day.full}>
                    <span className="hidden sm:inline">{day.full}</span>
                    <span className="sm:hidden">{day.short}</span>
                  </div>
                ))}
              </div>
              
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5 md:gap-3">
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                  <div key={`empty-${i}`} className="min-h-[56px] sm:min-h-[72px] md:min-h-[86px] lg:min-h-[96px] rounded-2xl bg-slate-50/50 dark:bg-slate-900/30"></div>
                ))}
                
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                  const dateStr = dateObj.toISOString().split('T')[0];
                  const record = fastingRecords[dateStr];
                  const isFasted = !!record;
                  const isToday = dateStr === todayStr;
                  const recommendedType = getDayType(dateObj);
                  const isRecommended = recommendedType !== 'voluntary';
                  const isWhiteDay = recommendedType === 'white_day';

                  return (
                    <button
                      key={day}
                      onClick={() => openDayDialog(day)}
                      className={cn(
                        "relative min-h-[56px] sm:min-h-[72px] md:min-h-[86px] lg:min-h-[96px] rounded-2xl sm:rounded-3xl flex flex-col items-center justify-between p-1.5 sm:p-2.5 transition-all active:scale-95 group border cursor-pointer",
                        isFasted 
                          ? "bg-gradient-to-br from-teal-500 to-emerald-600 text-white font-bold border-teal-400/40 shadow-sm" 
                          : isToday 
                            ? "bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-200 font-extrabold border-2 sm:border-[3px] border-teal-500 shadow-sm" 
                            : isRecommended
                              ? "bg-amber-50/60 dark:bg-amber-950/20 text-slate-700 dark:text-slate-200 border-amber-300/40 dark:border-amber-700/40 hover:border-amber-400"
                              : "bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800"
                      )}
                    >
                      <div className="w-full flex items-center justify-between text-[10px] sm:text-xs leading-none opacity-85">
                        <span className={cn(
                          "w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold",
                          isFasted ? "bg-white/20 text-white" : "text-slate-500 dark:text-slate-400"
                        )}>
                          {day}
                        </span>
                        
                        {isWhiteDay && !isFasted && (
                          <Star size={12} className="fill-amber-400 text-amber-500" />
                        )}
                      </div>

                      {/* Fasted Check Icon or indicator */}
                      <div className="my-auto flex items-center justify-center">
                        {isFasted ? (
                          <CheckCircle2 size={18} className="text-white fill-emerald-500 stroke-[2.5]" />
                        ) : isRecommended ? (
                          <div className="w-2 h-2 rounded-full bg-amber-500 dark:bg-amber-400 animate-pulse" />
                        ) : (
                          <span className="text-[10px] opacity-0 group-hover:opacity-60 transition-opacity font-bold">+</span>
                        )}
                      </div>

                      {/* Micro Label */}
                      <span className={cn(
                        "text-[9px] sm:text-[11px] font-bold truncate max-w-full leading-none",
                        isFasted ? "text-teal-100" : isRecommended ? "text-amber-600 dark:text-amber-400" : "text-transparent"
                      )}>
                        {isFasted 
                          ? (record.type === 'qadaa' ? (t('fasting_qadaa') || 'قضاء') : (t('fasted_badge') || 'صائم'))
                          : (isWhiteDay ? (t('white_days_badge') || 'بيض') : isRecommended ? (t('sunnah_badge') || 'سُنّة') : '')}
                      </span>
                    </button>
                  );
                })}
              </div>
              
              {/* Legend */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400 justify-center">
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded-lg bg-teal-500"></div>
                  <span>{t('fasted_done') || 'تم الصيام'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded-lg bg-amber-100 dark:bg-amber-900/40 border border-amber-300 dark:border-amber-700 flex items-center justify-center">
                    <Star size={9} className="fill-amber-400 text-amber-500" />
                  </div>
                  <span>{t('fasting_white_days') || 'الأيام البيض (١٣-١٤-١٥)'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-300 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                  </div>
                  <span>{t('sunnah_monday_thursday') || 'سُنّة الاثنين والخميس'}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 2: Upcoming Sunnah Days */}
        {activeTab === 'upcoming' && (
          <motion.div
            key="upcoming-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Calendar size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">مواعيد السُنن القادمة</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">فرص الصيام المستحبة خلال الثلاثين يوماً القادمة</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
                {upcomingSunnahDays.map((item, idx) => {
                  const isFasted = !!fastingRecords[item.dateStr];
                  const isWhite = item.type === 'white_day';

                  return (
                    <div 
                      key={idx}
                      className={cn(
                        "p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 shadow-xs",
                        isFasted 
                          ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300/60 dark:border-emerald-800/60"
                          : "bg-slate-50/70 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex flex-col items-center justify-center text-center shrink-0 border shadow-xs",
                          isFasted
                            ? "bg-emerald-500 text-white border-emerald-400"
                            : isWhite 
                              ? "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700"
                              : "bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 border-teal-300 dark:border-teal-700"
                        )}>
                          <span className="text-sm font-black leading-none">{item.date.getDate()}</span>
                          <span className="text-[10px] font-bold leading-none mt-0.5">
                            {new Intl.DateTimeFormat(isRtl ? 'ar' : 'en', { month: 'short' }).format(item.date)}
                          </span>
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                              {getDayName(item.date, settings.appLanguage)}: {item.label}
                            </h4>
                            {isWhite && (
                              <span className="px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-300 text-[9px] font-extrabold flex items-center gap-0.5">
                                <Star size={10} className="fill-amber-400" /> البيض
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                            {item.hijriFormatted && `${item.hijriFormatted} • `}
                            {item.daysLeft === 1 ? 'غداً إن شاء الله' : `متبقي ${item.daysLeft} أيام`}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          triggerHaptic('success');
                          toggleFastingDay(item.dateStr, item.type);
                        }}
                        className={cn(
                          "px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 shrink-0 shadow-xs",
                          isFasted 
                            ? "bg-emerald-600 text-white hover:bg-emerald-700"
                            : "bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 hover:bg-teal-50 dark:hover:bg-slate-600"
                        )}
                      >
                        {isFasted ? (
                          <>
                            <Check size={14} className="stroke-[2.5]" />
                            <span>مسجّل</span>
                          </>
                        ) : (
                          <>
                            <Plus size={14} />
                            <span>سجّل</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 3: Qadaa & Goals Tracker */}
        {activeTab === 'qadaa' && (
          <motion.div
            key="qadaa-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Qadaa Ramadan Box */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                    <Target size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">متابعة قضاء رمضان والأهداف</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">حدد عدد الأيام الواجب قضاؤها وتابع إنجازك الشهري</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Goal Counter Control */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 sm:p-5 border border-slate-200/60 dark:border-slate-700/60 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200">أيام القضاء المطلوبة:</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            triggerHaptic('light');
                            updateQadaaGoal(qadaaGoal - 1);
                          }}
                          className="w-9 h-9 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-700 dark:text-slate-200 active:scale-95 shadow-xs"
                        >
                          <Minus size={15} />
                        </button>
                        <span className="w-10 text-center font-black text-xl text-slate-900 dark:text-white">
                          {qadaaGoal}
                        </span>
                        <button
                          onClick={() => {
                            triggerHaptic('light');
                            updateQadaaGoal(qadaaGoal + 1);
                          }}
                          className="w-9 h-9 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-700 dark:text-slate-200 active:scale-95 shadow-xs"
                        >
                          <Plus size={15} />
                        </button>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
                      سجل الأيام التي فاتتك في رمضان لتوثيق قضائها تباعاً
                    </p>
                  </div>

                  {qadaaGoal > 0 && (
                    <div className="pt-3 border-t border-slate-200/70 dark:border-slate-700/70">
                      <div className="flex justify-between text-xs font-bold mb-2">
                        <span className="text-emerald-600 dark:text-emerald-400">تم قضاء: {qadaaCompletedCount} أيام</span>
                        <span className="text-rose-600 dark:text-rose-400">المتبقي: {qadaaRemaining} أيام</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, (qadaaCompletedCount / (qadaaGoal || 1)) * 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Monthly Fasting Target */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 sm:p-5 border border-slate-200/60 dark:border-slate-700/60 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200 block">الهدف الشهري لصيام النوافل:</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">مثال: صيام ٤ أو ٦ أيام شهرياً</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            triggerHaptic('light');
                            updateMonthlyGoal(monthlyGoal - 1);
                          }}
                          className="w-9 h-9 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-700 dark:text-slate-200 active:scale-95 shadow-xs"
                        >
                          <Minus size={15} />
                        </button>
                        <span className="w-10 text-center font-black text-xl text-slate-900 dark:text-white">
                          {monthlyGoal}
                        </span>
                        <button
                          onClick={() => {
                            triggerHaptic('light');
                            updateMonthlyGoal(monthlyGoal + 1);
                          }}
                          className="w-9 h-9 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-700 dark:text-slate-200 active:scale-95 shadow-xs"
                        >
                          <Plus size={15} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200/70 dark:border-slate-700/70">
                    <div className="flex justify-between text-xs font-bold mb-2">
                      <span className="text-teal-600 dark:text-teal-400">المنجز هذا الشهر: {totalThisMonth} أيام</span>
                      <span className="text-slate-500 dark:text-slate-400">المستهدف: {monthlyGoal} أيام</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-teal-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (totalThisMonth / (monthlyGoal || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 4: Stats & Visuals */}
        {activeTab === 'stats' && (
          <motion.div
            key="stats-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {totalAllTime > 0 ? (
              <FastingStatsVisuals 
                fastingRecords={fastingRecords} 
                currentYear={currentDate.getFullYear()} 
                isRtl={isRtl}
                monthlyGoal={monthlyGoal}
                qadaaGoal={qadaaGoal}
              />
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 text-center border border-slate-200/80 dark:border-slate-800">
                <div className="w-16 h-16 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto mb-3">
                  <TrendingUp size={28} />
                </div>
                <h4 className="font-bold text-base text-slate-800 dark:text-white mb-1">لا توجد سجلات صيام بعد</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  قم بتسجيل صيامك في التقويم لتظهر لك الرسوم البيانية، ونسبة صيام السنن، والأوسمة الإيمانية.
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* Tab 5: Virtues & Authentic Duas */}
        {activeTab === 'virtues' && (
          <motion.div
            key="virtues-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Duas Box */}
            <div className="bg-gradient-to-br from-teal-600 to-emerald-700 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
              <div className="relative z-10 space-y-3">
                <div className="flex items-center gap-2 text-teal-200">
                  <Sparkles size={20} />
                  <h3 className="font-bold text-base">دعاء الإفطار المأثور</h3>
                </div>
                <p className="font-arabic text-xl sm:text-2xl font-black leading-loose text-white text-center py-3 bg-white/10 rounded-2xl border border-white/20">
                  «ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ، وَثَبَتَ الأَجْرُ إِنْ شَاءَ اللَّهُ»
                </p>
                <p className="text-xs text-teal-100 text-center">
                  رواه أبو داود وحسنه الألباني • يقال عند الإفطار مباشرة
                </p>
              </div>
            </div>

            {/* Virtues Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 md:gap-4">
              {FASTING_VIRTUES.map((item, idx) => (
                <div 
                  key={idx}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <h4 className="font-bold text-sm text-teal-600 dark:text-teal-400 mb-2 flex items-center gap-1.5">
                      <BookmarkCheck size={16} />
                      <span>{item.title}</span>
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-3 font-medium">
                      {item.hadith}
                    </p>
                  </div>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold block pt-2 border-t border-slate-100 dark:border-slate-800">
                    المصدر: {item.source}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Day Details / Edit Modal */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showDayModal && selectedDateStr && (
            <div 
              className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm overflow-y-auto"
              dir={isRtl ? 'rtl' : 'ltr'}
              onClick={(e) => {
                if (e.target === e.currentTarget) setShowDayModal(false);
              }}
            >
              <motion.div
                initial={{ scale: 0.92, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.92, opacity: 0, y: 15 }}
                className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[28px] sm:rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[85vh] my-auto overflow-hidden text-right relative z-10"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                      <Calendar size={20} />
                    </div>
                    <div>
                      <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-white">
                        تسجيل صيام {selectedDateStr}
                      </h3>
                      <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">اختر نية الصيام المناسبة لهذا اليوم</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      triggerHaptic('light');
                      setShowDayModal(false);
                    }}
                    className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="overflow-y-auto py-3 space-y-4 pr-1 max-h-[calc(85vh-150px)]">
                  {/* Fasting Type Selector */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 block">
                      نوع الصيام / النية:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(Object.keys(FASTING_TYPES_INFO) as FastingType[]).map((typeKey) => {
                        const info = FASTING_TYPES_INFO[typeKey];
                        const isSelected = selectedType === typeKey;
                        return (
                          <button
                            key={typeKey}
                            onClick={() => {
                              triggerHaptic('light');
                              setSelectedType(typeKey);
                            }}
                            className={cn(
                              "p-2.5 sm:p-3 rounded-2xl text-xs font-bold border transition-all text-right flex items-center gap-2 cursor-pointer",
                              isSelected 
                                ? "bg-teal-50 dark:bg-teal-950/60 border-teal-500 text-teal-700 dark:text-teal-300 shadow-xs ring-1 ring-teal-500/50"
                                : "bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                            )}
                          >
                            <div className={cn("w-2.5 h-2.5 rounded-full shrink-0", info.badgeBg)} />
                            <span className="truncate">{getFastingTypeLabel(typeKey)}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Optional Notes */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                      ملاحظة إيمانية (اختياري):
                    </label>
                    <input 
                      type="text"
                      placeholder="مثال: صيام بنية الشفاء، دعاء لإخواننا..."
                      value={selectedNotes}
                      onChange={(e) => setSelectedNotes(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-slate-100 outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 shrink-0">
                  <button
                    onClick={handleSaveDayDetails}
                    className="flex-1 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm"
                  >
                    <Check size={16} />
                    <span>حفظ الصيام</span>
                  </button>

                  {fastingRecords[selectedDateStr] && (
                    <button
                      onClick={handleRemoveDayRecord}
                      className="py-3 px-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 font-bold text-xs sm:text-sm active:scale-95 transition-all border border-rose-200 dark:border-rose-800"
                    >
                      إلغاء التسجيل
                    </button>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Iftar Dua Modal */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showIftarDuaModal && (
            <div 
              className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm overflow-y-auto"
              dir={isRtl ? 'rtl' : 'ltr'}
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setShowIftarDuaModal(false);
                }
              }}
            >
              <motion.div
                initial={{ scale: 0.92, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.92, opacity: 0, y: 15 }}
                className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[28px] sm:rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[85vh] my-auto overflow-hidden text-center relative z-10"
              >
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
                  <div className="flex items-center gap-2.5 text-right">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                      <Sparkles size={22} />
                    </div>
                    <div>
                      <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-white">
                        أدعية الإفطار المأثورة
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">سُنّة النبي ﷺ وأدعية الصائم المستجابة</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      triggerHaptic('light');
                      setShowIftarDuaModal(false);
                    }}
                    className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Scrollable Body */}
                <div className="overflow-y-auto py-3 space-y-3.5 text-right pr-1 max-h-[calc(85vh-160px)]">
                  {/* Dua 1 */}
                  <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 relative group">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                        <BookmarkCheck size={14} />
                        الدعاء الأول (الصحيح الثابت):
                      </span>
                      <button
                        onClick={() => handleCopyDua('ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ، وَثَبَتَ الأَجْرُ إِنْ شَاءَ اللَّهُ', 1)}
                        className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-700 flex items-center gap-1 hover:bg-emerald-50 active:scale-95 transition-all"
                      >
                        {copiedDuaIndex === 1 ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                        <span>{copiedDuaIndex === 1 ? 'تم النسخ' : 'نسخ'}</span>
                      </button>
                    </div>
                    <p className="font-arabic font-black text-lg sm:text-xl text-slate-900 dark:text-white leading-loose text-center py-2 bg-white/70 dark:bg-slate-900/60 rounded-xl border border-emerald-100 dark:border-emerald-900/50">
                      «ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ، وَثَبَتَ الأَجْرُ إِنْ شَاءَ اللَّهُ»
                    </p>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold block mt-2">
                      المصدر: رواه أبو داود والنسائي وحسنه الألباني
                    </span>
                  </div>

                  {/* Dua 2 */}
                  <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-extrabold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                        <BookmarkCheck size={14} />
                        الدعاء الثاني (المشهور):
                      </span>
                      <button
                        onClick={() => handleCopyDua('اللَّهُمَّ إِنِّي لَكَ صُمْتُ، وَعَلَى رِزْقِكَ أَفْطَرْتُ', 2)}
                        className="text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-700 flex items-center gap-1 hover:bg-amber-50 active:scale-95 transition-all"
                      >
                        {copiedDuaIndex === 2 ? <Check size={12} className="text-amber-600" /> : <Copy size={12} />}
                        <span>{copiedDuaIndex === 2 ? 'تم النسخ' : 'نسخ'}</span>
                      </button>
                    </div>
                    <p className="font-arabic font-black text-lg sm:text-xl text-slate-900 dark:text-white leading-loose text-center py-2 bg-white/70 dark:bg-slate-900/60 rounded-xl border border-amber-100 dark:border-amber-900/50">
                      «اللَّهُمَّ إِنِّي لَكَ صُمْتُ، وَعَلَى رِزْقِكَ أَفْطَرْتُ»
                    </p>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold block mt-2">
                      المصدر: رواه أبو داود مرسلاً
                    </span>
                  </div>

                  {/* Dua 3: وعند الإفطار عند قوم */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-extrabold text-teal-600 dark:text-teal-400 flex items-center gap-1.5">
                        <BookmarkCheck size={14} />
                        دعاء إذا أفطر عند قوم:
                      </span>
                      <button
                        onClick={() => handleCopyDua('أَفْطَرَ عِنْدَكُمُ الصَّائِمُونَ، وَأَكَلَ طَعَامَكُمُ الأَبْرَارُ، وَصَلَّتْ عَلَيْكُمُ الْمَلائِكَةُ', 3)}
                        className="text-[11px] font-bold text-teal-600 dark:text-teal-400 bg-white dark:bg-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-600 flex items-center gap-1 active:scale-95 transition-all"
                      >
                        {copiedDuaIndex === 3 ? <Check size={12} className="text-teal-600" /> : <Copy size={12} />}
                        <span>{copiedDuaIndex === 3 ? 'تم النسخ' : 'نسخ'}</span>
                      </button>
                    </div>
                    <p className="font-arabic font-black text-base sm:text-lg text-slate-900 dark:text-white leading-loose text-center py-2 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-700">
                      «أَفْطَرَ عِنْدَكُمُ الصَّائِمُونَ، وَأَكَلَ طَعَامَكُمُ الأَبْرَارُ، وَصَلَّتْ عَلَيْكُمُ الْمَلائِكَةُ»
                    </p>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold block mt-2">
                      المصدر: رواه أبو داود وأحمد وصححه الألباني
                    </span>
                  </div>

                  {/* Virtue reminder */}
                  <div className="p-3 bg-teal-500/10 rounded-xl border border-teal-500/20 text-center">
                    <p className="text-xs text-teal-800 dark:text-teal-300 leading-relaxed font-medium">
                      قال رسول الله ﷺ: «ثَلَاثُ دَعَوَاتٍ لَا تُرَدُّ: دَعْوَةُ الْوَالِدِ، وَدَعْوَةُ الصَّائِمِ، وَدَعْوَةُ الْمُسَافِرِ».
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 shrink-0">
                  <button
                    onClick={() => {
                      triggerHaptic('light');
                      setShowIftarDuaModal(false);
                    }}
                    className="w-full py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm transition-all active:scale-95 shadow-sm"
                  >
                    تقبل الله طاعتكم وكتب أجركم
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

export default FastingTracker;
