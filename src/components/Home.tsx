import React from 'react';
import { useAppContext } from '../AppContext';
import { Link } from 'react-router-dom';
import { Sun, Moon, Calendar, Book, ShieldCheck, Fingerprint, MessageCircle, MessageSquareOff, Star, BookOpen, Sparkles, Shield, BookOpenText, CheckCircle2, Clock, ChevronRight, Navigation, Quote, Sunrise, Activity, BarChart3, TrendingUp, Trophy, X as XIcon, Zap, Scale, History, HelpCircle, Gamepad2, Share2, Handshake, Gem, Scroll, GripVertical, LayoutGrid, Award, Headphones, AudioLines, Target, Download, Mic2, HandHeart, Crown, BrainCircuit } from 'lucide-react';
import { cn, getHijriDate, getGregorianDate, getDayName, getLevelRank, triggerHaptic } from '../lib/utils';
import { Compass, Heart } from 'lucide-react';
import { DailyAyahDhikrWidget } from './DailyAyahDhikrWidget';
import { HeartFeelingsWidget } from './HeartFeelingsWidget';

import { useTranslation } from '../i18n';
import { useSmartNavigation } from '../lib/navigation';

export const Home: React.FC = () => {
  const { progress, isCategoryCompleted, settings } = useAppContext();
  const { t, isRtl, currentLang } = useTranslation(settings.appLanguage);
  const { navigate } = useSmartNavigation();
  const today = new Date();

  const isMorningCompleted = React.useMemo(() => isCategoryCompleted('morning'), [isCategoryCompleted]);
  const isEveningCompleted = React.useMemo(() => isCategoryCompleted('evening'), [isCategoryCompleted]);




  const { homeWidgets, updateHomeWidgets } = useAppContext();

  const iconMap: Record<string, any> = {
    'mushaf': BookOpenText,
    'audio_library': Headphones,
    'adhkar': Sunrise,
    'prayer_times': Clock,
    'names_qibla': Compass,
    'daily_widget': Sparkles,
    'heart_feelings': Heart,
    'khatma': Scroll,
    'hijri_calendar': Calendar,

    'adhkar_stats': BarChart3,
    'challenges': Award,
    'sadaqah': HandHeart
  };

  const widgets = React.useMemo(() => {
    return (homeWidgets || []).map(w => ({
      ...w,
      icon: iconMap[w.id] || Sparkles
    }));
  }, [homeWidgets]);

  const saveWidgets = (newWidgets: any[]) => {
    updateHomeWidgets(newWidgets.map(w => ({ id: w.id, name: w.name, isVisible: w.isVisible })));
  };


  const totalTasbihTarget = 100;
  const tasbihProgress = Math.min((progress.tasbihCount / totalTasbihTarget) * 100, 100);

  const currentHour = today.getHours();
  const isDaytime = currentHour >= 5 && currentHour < 17;

  const adhkarCategories = ['morning', 'evening'];
  const completedCategoriesCount = adhkarCategories.filter(cat => isCategoryCompleted(cat)).length;
  const adhkarProgress = (completedCategoriesCount / adhkarCategories.length) * 100;

  return (
    <div className="space-y-3 pb-8 pt-0.5 relative z-10 home-page min-w-0">
      {/* User ID Card (البطاقة التعريفية) */}
      <div className="px-1">
        <div
          className={cn(
            "rounded-2xl p-3 text-white relative overflow-visible transition-all duration-300 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] min-h-[110px] flex flex-col justify-center",
            "bg-gradient-to-br from-indigo-900 via-purple-800 to-fuchsia-900 shadow-purple-900/40",

          )}

        >
          {/* Decorative border */}
          <div className="absolute inset-0 rounded-2xl pointer-events-none border-[0.5px] border-white/20 shadow-[inset_0_2px_4px_rgba(255,255,255,0.4),inset_0_-4px_10px_rgba(0,0,0,0.4)]" />
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-50 pointer-events-none" />

          {/* Immersive Background Elements */}
          <div className="absolute inset-0 opacity-[0.15] mix-blend-overlay pointer-events-none bg-[url('/images/arabesque.png')] rounded-2xl overflow-hidden" />

          <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
            <div className="absolute -top-10 -right-10 w-48 h-48 text-white/20 rounded-full card-glow" />
            <div className="absolute -bottom-12 -left-12 w-40 h-40 text-emerald-400/20 rounded-full card-glow" />
          </div>

          {/* Header Area: Status - Centered Day Name (No Capsule) */}
          <div className="relative z-10 flex flex-col gap-1">
            <div className="flex items-center justify-center mb-1">
              <div className="flex items-center gap-3 relative">
                <div
                  className="h-[1.5px] bg-gradient-to-l from-white/60 to-transparent rounded-full shadow-[0_0_10px_rgba(255,255,255,0.4)]"
                />
                {/*
                  The wide tracking is for Latin only. Arabic is a cursive
                  script: letter-spacing pulls the glyphs apart and breaks the
                  joins, so "الاثنين" was rendering on the home screen as
                  "ا لا ث ن ي ن". `uppercase` is meaningless for Arabic too.
                */}
                <span className={cn(
                  "text-[14px] font-black text-white drop-shadow-[0_4px_12px_rgba(255,255,255,0.4)] leading-none text-shadow-sm",
                  isRtl ? "tracking-normal" : "uppercase tracking-[0.45em]"
                )}>
                  {getDayName(today, currentLang)}
                </span>
                <div
                  className="h-[1.5px] bg-gradient-to-r from-white/60 to-transparent rounded-full shadow-[0_0_10px_rgba(255,255,255,0.4)]"
                />
              </div>
            </div>

            {/* Header Area: Dates Display - Advanced Compact Glass Capsule */}
            <div
              onClick={() => navigate('/hijri-calendar')}
              role="button"
              className={cn(
                // No backdrop-blur here: both branches below set a fully opaque
                // bg-gradient, so the blur has nothing of the page showing
                // through to blur. It rendered nothing and still forced the
                // WebView to read back and blur the backdrop on every frame the
                // home screen scrolled.
                // flex-wrap: at larger system font sizes the two dates no longer
                // fit side by side. Without it each date wrapped mid-string —
                // "هـ" alone on its own line — and the divider drifted off
                // centre. Now each date stays on one line (whitespace-nowrap
                // below) and the pair stacks when it must.
                "navigation-card flex flex-wrap gap-x-5 gap-y-1.5 items-center justify-between rounded-2xl px-3.5 py-1.5 tracking-tight",
                "border relative overflow-hidden shadow-[inset_0_1.5px_6px_rgba(255,255,255,0.4)]",
                "cursor-pointer hover:opacity-95 active:scale-[0.98] transition-all select-none",
                isDaytime
                  ? "bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600 border-orange-300/60 shadow-[0_8px_30px_rgba(249,115,22,0.35)]"
                  : "bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 border-indigo-400/60 shadow-[0_8px_30px_rgba(79,70,22,0.35)]"
              )}
            >
              {/* Light Reflection */}
              <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />

              {/* Vibrant Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-300/50 to-transparent pointer-events-none opacity-90 mix-blend-overlay" />

              <div className="flex flex-col text-right relative z-10">
                <span className="text-[17px] font-black tracking-tight leading-none drop-shadow-md mb-0.5 text-white whitespace-nowrap">{getHijriDate(today, settings.hijriOffset, currentLang)}</span>
                <div className="flex items-center gap-1.5 opacity-90">
                  <div className="w-1 h-1 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,1)]" />
                  <span className="text-[10px] font-bold text-white/90 uppercase tracking-widest drop-shadow-sm">{t('hijri_date_title')}</span>
                </div>
              </div>

              {/*
                No divider element between the two dates. As a third flex item it
                had nowhere sensible to go once the dates wrapped onto two rows at
                larger font sizes: justify-between parked it alone at the far edge
                of the first row as a stray vertical line. The gap-x on the
                container keeps the dates apart when they share a row.
              */}

              <div className="flex flex-col items-end relative z-10">
                <span className="text-[15px] font-black text-white leading-none tracking-tight mb-0.5 drop-shadow-md whitespace-nowrap">{getGregorianDate(today, currentLang)}</span>
                <div className="flex items-center gap-1 text-white/90 opacity-90">
                  <Calendar size={11} className="stroke-[3] drop-shadow-sm" />
                  <span className="text-[9px] font-black uppercase tracking-widest drop-shadow-sm">{t('gregorian_title')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Adhkar Categories - Floating Smart Navigation - More Compact */}
          <div className="relative z-10 flex gap-2 mt-3 ">
            {[
              {
                to: "/adhkar/morning",
                title: t('morning_label'),
                icon: <Sunrise size={18} className="text-amber-300 drop-shadow-[0_0_8px_rgba(252,211,77,0.5)]" />,
                isCompleted: isCategoryCompleted('morning'),
                color: "from-amber-400 to-orange-500",
                borderColor: "border-amber-400/35"
              },
              {
                to: "/adhkar/evening",
                title: t('evening_label'),
                icon: <Moon size={18} className="text-indigo-300 drop-shadow-[0_0_8px_rgba(165,180,252,0.5)]" />,
                isCompleted: isCategoryCompleted('evening'),
                color: "from-indigo-900 via-purple-900 to-slate-900",
                borderColor: "border-indigo-400/35"
              }
            ].map((item) => (
              <button
                key={item.to}
                onClick={() => navigate(item.to)}
                className={cn(
                  "navigation-card min-w-0 flex-1 flex items-center justify-center gap-3 p-2.5 rounded-2xl transition-all duration-300 group",
                  // As above: item.color is an opaque gradient in both cases, so
                  // the backdrop-blur that used to sit here was invisible and
                  // paid for twice over — once per button, every frame.
                  "border shadow-lg relative overflow-hidden bg-gradient-to-br min-h-[48px] cursor-pointer outline-none",
                  item.color,
                  item.borderColor
                )}
              >
                <div className="flex items-center gap-2.5 relative z-10">
                  <div className="shrink-0 group-hover:scale-110 transition-transform duration-200">
                    {item.icon}
                  </div>
                  <span className="font-black text-[15px] tracking-tight">{item.title}</span>
                  {item.isCompleted && (
                    <div
                      className="shrink-0"
                    >
                      <CheckCircle2 size={12} className="text-emerald-400" />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Access: Continue Reading Quran */}
      {progress?.quranProgress?.lastRead && progress.quranProgress.lastRead.surah && (
        <div className="px-1 mt-1">
          <button
            onClick={() => {
              triggerHaptic('light');
              // Navigate to the surah number. Usually surah is a string name or number, we prefer surahNumber if available.
              const surahParam = progress.quranProgress!.lastRead!.surahNumber || progress.quranProgress!.lastRead!.surah;
              navigate(`/quran/${surahParam}`);
            }}
            className="navigation-card w-full relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-800 p-3 flex items-center justify-between shadow-lg shadow-emerald-900/20 border border-emerald-400/30 cursor-pointer outline-none"
          >
            <div className="absolute inset-0 bg-[url('/images/arabesque.png')] opacity-10 mix-blend-overlay"></div>
            <div className="absolute -right-10 -top-10 w-32 h-32 text-white/10 rounded-full card-glow"></div>

            <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white shadow-inner border border-white/20">
                <BookOpen size={20} className="drop-shadow-md" />
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-white font-black text-sm tracking-tight drop-shadow-md">متابعة القراءة</span>
                  <div className="px-1.5 py-0.5 rounded bg-emerald-400/30 border border-emerald-300/30 text-[9px] font-bold text-white flex items-center gap-1">
                    <span className="animate-pulse w-1.5 h-1.5 rounded-full bg-emerald-300"></span>
                    الوصول السريع
                  </div>
                </div>
                <span className="text-emerald-50 text-[11px] font-bold block opacity-90">
                  {/* Handle numeric vs string surah name cases */}
                  سورة {typeof progress.quranProgress.lastRead.surah === 'string' && !/\d/.test(progress.quranProgress.lastRead.surah) ? progress.quranProgress.lastRead.surah : (progress.quranProgress.lastRead as any).surahName || progress.quranProgress.lastRead.surah} • صفحة {progress.quranProgress.lastRead.page}
                </span>
              </div>
            </div>

            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center relative z-10 border border-white/20 text-white">
              <ChevronRight size={18} className="rtl:rotate-180" />
            </div>
          </button>
        </div>
      )}


      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
          {widgets.filter(w => w.isVisible).map(widget => {
            switch(widget.id) {
              case 'mushaf':
                return (
                  <div key={widget.id} className="min-w-0 col-span-1">
                    <div
          className="px-1"
        >
          <button
            onClick={() => {
              triggerHaptic('light');
              navigate('/quran');
            }}
            className="navigation-card w-full relative block min-h-[88px] rounded-2xl transition-all duration-300 bg-gradient-to-br from-amber-600 via-amber-700 to-yellow-900 shadow-xl shadow-amber-900/30 group overflow-hidden border border-white/10 cursor-pointer outline-none text-right"
          >
            {/* Decorative Elements */}
            <div className="absolute inset-0 opacity-15 mix-blend-overlay" style={{ backgroundImage: "url('/images/arabesque.png')" }} />
            <div className="absolute -top-10 -left-10 w-32 h-32 text-white/10 rounded-full card-glow" />

            <div className="relative min-h-[88px] py-3 flex items-center justify-between gap-3 px-4 sm:px-7 text-white">
              <div className="min-w-0 flex flex-col text-right">
                <div className="flex items-center gap-2.5 mb-0.5">
                  <BookOpenText size={20} className="text-amber-200" />
                  <h3 className="font-black text-xl sm:text-2xl drop-shadow-lg tracking-tight">{t('mushaf_title')}</h3>
                </div>
                <p className="text-[11px] text-amber-100/80 font-bold tracking-widest">{t('mushaf_subtitle')}</p>
              </div>
              <div className="w-13 h-13 shrink-0 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <Book size={28} className="text-white drop-shadow-xl" />
              </div>
            </div>
          </button>
        </div>
                  </div>
                );
              case 'audio_library':
                return (
                  <div key={widget.id} className="min-w-0 col-span-1">
                    {/* Audio Library Card - Fuchsia Theme */}
        <div
          className="px-1"
        >
          <button
            onClick={() => {
              triggerHaptic('light');
              navigate('/audio-library');
            }}
            className={cn("navigation-card w-full relative block min-h-[88px] rounded-2xl transition-all duration-300 bg-gradient-to-br from-fuchsia-500 via-pink-600 to-rose-700 shadow-xl shadow-fuchsia-900/30 group overflow-hidden border border-white/10 cursor-pointer outline-none", isRtl ? "text-right" : "text-left")}
          >
            {/* Decorative Elements */}
            <div className="absolute inset-0 opacity-15 mix-blend-overlay" style={{ backgroundImage: "url('/images/arabesque.png')" }} />
            <div className="absolute -top-10 -left-10 w-32 h-32 text-white/20 rounded-full card-glow group-hover:scale-150 transition-transform duration-700" />
            <div className="absolute -bottom-10 -right-10 w-32 h-32 text-fuchsia-400/20 rounded-full card-glow group-hover:scale-150 transition-transform duration-700" />

            <div className={cn("relative min-h-[88px] py-3 flex items-center justify-between gap-3 px-4 sm:px-7 text-white", isRtl ? "flex-row" : "flex-row-reverse")}>
              <div className={cn("min-w-0 flex flex-col", isRtl ? "text-right" : "text-left")}>
                <div className="flex items-center gap-2.5 mb-0.5">
                  <AudioLines size={20} className="text-fuchsia-200" />
                  <h3 className="font-black text-xl sm:text-2xl drop-shadow-lg tracking-tight">{t('audio_library')}</h3>
                </div>
                <p className="text-[11px] text-fuchsia-100/80 font-bold tracking-widest">{t('audio_library_subtitle')}</p>
              </div>
              <div className="w-13 h-13 shrink-0 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 shadow-inner group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500">
                <Headphones size={28} className="text-white drop-shadow-xl" />
              </div>
            </div>
          </button>
        </div>
                  </div>
                );
              case 'adhkar':
                return (
                  <div key={widget.id} className="min-w-0 col-span-1">
                    {/* Adhkar Cards Under Quran - Restored Vibrant Style */}
        <div
          className="grid grid-cols-2 gap-3 px-1"
        >
          <button
            onClick={() => {
              triggerHaptic('light');
              navigate('/adhkar/morning');
            }}
            className="navigation-card relative block min-h-[76px] rounded-2xl overflow-hidden transition-all duration-300 border border-orange-400/50 shadow-xl shadow-red-500/20 group cursor-pointer outline-none text-right"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600" />
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex flex-col items-center justify-center p-3 text-white z-10 text-center">
              <div className="flex items-center gap-1.5 mb-1">
                <h3 className="font-black text-[15px] leading-tight text-white drop-shadow-md">{t('morning_adhkar')}</h3>
                {isMorningCompleted && <CheckCircle2 size={12} className="text-emerald-100 shrink-0 drop-shadow-sm" />}
              </div>
              <p className="text-[9px] text-orange-50 font-bold uppercase tracking-widest drop-shadow-sm opacity-90">{t('subtitle_morning')}</p>
            </div>
          </button>
          <button
            onClick={() => {
              triggerHaptic('light');
              navigate('/adhkar/evening');
            }}
            className="navigation-card relative block min-h-[76px] rounded-2xl overflow-hidden transition-all duration-300 border border-indigo-500/20 shadow-xl shadow-indigo-900/40 group cursor-pointer outline-none text-right"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900" />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex flex-col items-center justify-center p-3 text-white z-10 text-center">
              <div className="flex items-center gap-1.5 mb-1">
                <h3 className="font-black text-[15px] leading-tight text-indigo-50 drop-shadow-md">{t('evening_adhkar')}</h3>
                {isEveningCompleted && <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />}
              </div>
              <p className="text-[9px] text-indigo-200/70 font-bold uppercase tracking-widest drop-shadow-sm opacity-90">{t('subtitle_evening')}</p>
            </div>
          </button>
        </div>
                  </div>
                );
              case 'prayer_times':
                return (
                  <div key={widget.id} className="min-w-0 col-span-1">
                    {/* Prayer Times Card - Architectural Style */}
        <div
          className="px-1"
        >
          <button
            onClick={() => navigate('/prayer-times')}
            className="navigation-card w-full relative block min-h-[84px] rounded-2xl transition-all duration-300 bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-900 shadow-xl shadow-teal-900/20 group overflow-hidden border border-white/10 cursor-pointer outline-none text-right"
          >
            {/* Decorative Elements */}
            <div className="absolute inset-0 opacity-10 mix-blend-overlay" style={{ backgroundImage: "url('/images/arabesque.png')" }} />
            <div className="absolute -bottom-10 -right-10 w-32 h-32 text-white/10 rounded-full card-glow" />
            <div className="absolute top-0 left-0 w-24 h-24 text-black/20 rounded-full card-glow" />

            <div className="relative min-h-[84px] py-3 flex items-center justify-between gap-3 px-4 sm:px-6 text-white">
              <div className="min-w-0 flex flex-col text-right">
                <div className="flex items-center gap-2 mb-0.5">
                  <Clock size={16} className="text-teal-200" />
                  <h3 className="font-black text-xl drop-shadow-md">{t('prayer_times_card_title')}</h3>
                </div>
                <p className="text-[10px] text-teal-100/70 font-bold uppercase tracking-widest">{t('prayer_times_card_subtitle')}</p>
              </div>
              <div className="w-12 h-12 shrink-0 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 shadow-inner group-hover:scale-110 group-hover:-rotate-3 transform transition-all duration-75 active:scale-[0.85] active:opacity-70">
                <Sunrise size={24} className="text-white drop-shadow-lg" />
              </div>
            </div>
          </button>
        </div>
                  </div>
                );
              case 'names_qibla':
                return (
                  <div key={widget.id} className="min-w-0 col-span-1 md:col-span-2 lg:col-span-1">
                    {/* Modern Dual Card: Names of Allah & Qibla - Bento Style Smart Section */}
        <div className="grid grid-cols-2 gap-3 px-1 h-full">
          <button
            onClick={() => navigate('/names')}
            className="navigation-card relative block min-h-[110px] rounded-2xl overflow-hidden transition-all duration-500 border border-orange-400/20 shadow-xl shadow-orange-900/10 group bg-gradient-to-br from-orange-400 via-orange-600 to-red-800 dark:from-orange-800 dark:via-red-900 dark:to-red-950 cursor-pointer outline-none text-right"
          >
            <div className="absolute inset-0 opacity-20 mix-blend-overlay" style={{ backgroundImage: "url('/images/arabesque.png')" }} />
            <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-white/60 shadow-sm z-10" />
            <div className="absolute -top-10 -right-10 w-24 h-24 text-white/10 rounded-full card-glow group-hover:scale-125 transition-transform duration-700" />

            <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-white dark:text-amber-100 text-center">
              <div className="w-10 h-10 bg-white/10 dark:bg-black/20 rounded-xl flex items-center justify-center border border-white/20 shadow-inner mb-1.5 group-hover:scale-110 group-hover:rotate-12 transform transition-all duration-75 active:scale-[0.85] active:opacity-70">
                <Sparkles size={22} className="text-white fill-orange-400/30" />
              </div>
              <h3 className="font-black text-[14px] leading-tight drop-shadow-md">{t('names_of_allah')}</h3>
              <p className="text-[8px] text-orange-100/70 font-bold uppercase tracking-widest mt-0.5">{t('subtitle_names')}</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/compass')}
            className="navigation-card relative block min-h-[110px] rounded-2xl overflow-hidden transition-all duration-500 border border-indigo-400/20 shadow-xl shadow-indigo-900/10 group bg-gradient-to-br from-indigo-600 via-blue-700 to-slate-900 dark:from-indigo-900 dark:via-indigo-950 dark:to-slate-950 cursor-pointer outline-none text-right"
          >
            <div className="absolute inset-0 opacity-20 mix-blend-overlay" style={{ backgroundImage: "url('/images/arabesque.png')" }} />
            <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-white/60 shadow-sm z-10" />
            <div className="absolute -bottom-10 -left-10 w-24 h-24 text-white/10 rounded-full card-glow group-hover:scale-125 transition-transform duration-700" />

            <div className="relative min-h-[110px] flex flex-col items-center justify-center p-3 text-white dark:text-blue-100 text-center">
              <div className="w-10 h-10 bg-white/10 dark:bg-black/20 rounded-xl flex items-center justify-center border border-white/20 shadow-inner mb-1.5 group-hover:scale-110 group-hover:-rotate-12 transform transition-all duration-75 active:scale-[0.85] active:opacity-70">
                <Navigation size={22} className="text-white fill-indigo-400/30" />
              </div>
              <h3 className="font-black text-[14px] leading-tight drop-shadow-md">{t('qibla')}</h3>
              <p className="text-[8px] text-indigo-100/70 font-bold uppercase tracking-widest mt-0.5">{t('subtitle_qibla')}</p>
            </div>
          </button>
        </div>
                  </div>
                );
              case 'daily_widget':
                return (
                  <div key={widget.id} className="min-w-0 col-span-1 md:col-span-2">
                    {/* Daily Ayah & Hadith Widget */}
        <div className="">
          <DailyAyahDhikrWidget />
        </div>
                  </div>
                );
              case 'heart_feelings':
                return (
                  <div key={widget.id} className="min-w-0 col-span-1 md:col-span-2">
                    {/* Heart Feelings & Duas Widget */}
                    <HeartFeelingsWidget />
                  </div>
                );
              case 'khatma':
                return (
                  <div key={widget.id} className="min-w-0 col-span-1 md:col-span-2">
                    {/* Modern Section: Khatma - Architectural Style */}
        <div
          className="px-1"
        >
          <button
            onClick={() => navigate('/khatma')}
            className="navigation-card w-full relative block min-h-[110px] rounded-2xl transition-all duration-300 bg-gradient-to-br from-indigo-700 via-purple-700 to-indigo-900 shadow-xl shadow-indigo-900/20 group overflow-hidden border border-white/10 cursor-pointer outline-none text-right"
          >
            <div className="absolute inset-0 opacity-10 mix-blend-overlay" style={{ backgroundImage: "url('/images/arabesque.png')" }} />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 text-white/10 rounded-full card-glow" />

            <div className="relative min-h-[110px] py-3 flex items-center justify-between gap-3 px-4 sm:px-6 text-white">
              <div className="min-w-0 flex flex-col text-right">
                <div className="flex items-center gap-2 mb-0.5">
                  <BookOpen size={18} className="text-indigo-200" />
                  <h3 className="font-black text-xl drop-shadow-md">{t('khatma')}</h3>
                </div>
                <p className="text-[10px] text-indigo-100/70 font-bold uppercase tracking-widest">{t('subtitle_khatma')}</p>
              </div>
              <div className="w-12 h-12 shrink-0 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 shadow-inner group-hover:scale-110 group-hover:rotate-3 transform transition-all duration-75 active:scale-[0.85] active:opacity-70">
                <BookOpenText size={24} className="text-white drop-shadow-lg" />
              </div>
            </div>
          </button>
        </div>
                  </div>
                );
              case 'hijri_calendar':
                return (
                  <div key={widget.id} className="min-w-0 col-span-1">
                    {/* Modern Section: Hijri Calendar - Architectural Style */}
        <div
          className="px-1"
        >
          <button
            onClick={() => navigate('/hijri-calendar')}
            className={cn("navigation-card w-full relative block min-h-[110px] rounded-2xl transition-all duration-300 bg-gradient-to-br from-emerald-700 via-teal-800 to-emerald-950 shadow-xl shadow-emerald-900/20 group overflow-hidden border border-white/10 cursor-pointer outline-none", isRtl ? "text-right" : "text-left")}
          >
            <div className="absolute inset-0 opacity-15 mix-blend-overlay" style={{ backgroundImage: "url('/images/arabesque.png')" }} />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 text-white/10 rounded-full card-glow" />

            <div className={cn("relative min-h-[110px] py-3 flex items-center justify-between gap-3 px-4 sm:px-6 text-white", isRtl ? "flex-row" : "flex-row-reverse")}>
              <div className={cn("min-w-0 flex flex-col", isRtl ? "text-right" : "text-left")}>
                <div className="flex items-center gap-2 mb-0.5">
                  <Calendar size={18} className="text-emerald-200" />
                  <h3 className="font-black text-xl drop-shadow-md">{t('hijri_calendar_card_title')}</h3>
                </div>
                <p className="text-[10px] text-emerald-100/70 font-bold uppercase tracking-widest">{t('hijri_calendar_card_desc')}</p>
              </div>
              <div className="w-12 h-12 shrink-0 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 shadow-inner group-hover:scale-110 group-hover:-rotate-3 transform transition-all duration-75 active:scale-[0.85] active:opacity-70">
                <Calendar size={24} className="text-white drop-shadow-lg" />
              </div>
            </div>
          </button>
        </div>
                  </div>
                );

              case 'adhkar_stats':
                return (
                  <div key={widget.id} className="min-w-0 col-span-1 md:col-span-2">
                    {/* Adhkar Commitment Stats Card */}
      <div
        className="px-1"
      >
        <button
          onClick={() => {
            triggerHaptic('light');
            navigate('/adhkar-stats');
          }}
          className={cn(
            "navigation-card w-full relative overflow-hidden min-h-[76px] rounded-2xl bg-gradient-to-r from-indigo-950 via-purple-950 to-slate-900 p-4 flex flex-wrap gap-3 items-center justify-between border border-white/10 shadow-lg shadow-purple-950/30 group transition-all outline-none cursor-pointer",
            isRtl ? "text-right" : "text-left"
          )}
        >
          <div className="absolute inset-0 opacity-10 bg-[url('/images/arabesque.png')]" />
          <div className={cn("flex items-center gap-3 relative z-10", isRtl ? "flex-row" : "flex-row-reverse")}>
            <div className="w-12 h-12 shrink-0 bg-purple-500/20 rounded-xl flex items-center justify-center shadow-md border border-purple-400/30 group-hover:scale-105 transition-transform duration-300">
              <BarChart3 size={24} className="text-purple-200 drop-shadow-md" />
            </div>
            <div className={isRtl ? "text-right" : "text-left"}>
              <h3 className="text-sm md:text-base font-black text-white leading-tight">
                {t('adhkar_commitment_stats')}
              </h3>
              <p className="text-[11px] text-purple-200/70 font-medium mt-0.5">
                {t('adhkar_commitment_stats_desc')}
              </p>
            </div>
          </div>
          <div className={cn("flex items-center gap-2 relative z-10 shrink-0", isRtl ? "flex-row" : "flex-row-reverse")}>
            <span className="text-xs font-bold bg-white/10 px-3 py-1.5 rounded-xl border border-white/15 text-purple-100 group-hover:bg-white/20 transition-colors">
              {t('view_stats_action')}
            </span>
          </div>
        </button>
      </div>
                  </div>
                );
              case 'challenges':
                return (
                  <div key={widget.id} className="min-w-0 col-span-1 md:col-span-2">
                    {/* Challenges & Badges Strip */}
      <div
        className="px-1"
      >
        <button
          onClick={() => navigate('/challenges')}
          className={cn("navigation-card w-full relative overflow-hidden min-h-[90px] rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 p-4 flex flex-wrap gap-3 items-center justify-between border border-white/10 shadow-lg shadow-indigo-50/20 group transition-all outline-none", isRtl ? "text-right" : "text-left")}
        >
          <div className="absolute inset-0 bg-[url('/images/arabesque.png')] opacity-10 mix-blend-overlay" />
          <div className={cn("flex items-center gap-3 relative z-10", isRtl ? "flex-row" : "flex-row-reverse")}>
            <div className="w-14 h-14 shrink-0 bg-white/20 rounded-2xl flex items-center justify-center shadow-lg border border-white/30 group-hover:rotate-12 transition-transform duration-500">
              <Zap size={28} className="text-amber-300 fill-amber-300/30" />
            </div>
            <div className={isRtl ? "text-right" : "text-left"}>
              <h3 className="text-lg font-black text-white dark:text-white leading-tight">{t('challenges_nav')}</h3>
              <p className="text-[10px] text-indigo-100 font-bold uppercase tracking-widest">{t('challenges_card_desc')}</p>
            </div>
          </div>
          <div className={cn("flex items-center gap-2 relative z-10", isRtl ? "flex-row" : "flex-row-reverse")}>
            <div className="flex -space-x-3 rtl:space-x-reverse">
              <div className="w-8 h-8 rounded-full border-2 border-indigo-700 bg-amber-400 flex items-center justify-center shadow-md">
                <Trophy size={14} className="text-amber-900" />
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-indigo-700 bg-emerald-400 flex items-center justify-center shadow-md">
                <Award size={14} className="text-emerald-900" />
              </div>
            </div>
            <ChevronRight size={20} className={cn("text-white/50 group-hover:text-white transition-colors", !isRtl && "rotate-180")} />
          </div>
        </button>
      </div>
                  </div>
                );
              case 'sadaqah':
                return (
                  <div key={widget.id} className="min-w-0 col-span-1 md:col-span-2">
                    {/* Sadaqah Jariyah Project Banner (مشروع الصدقة الجارية) */}
      <div
        className="px-1"
      >
        <div className="relative overflow-hidden rounded-3xl p-4 bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 border border-emerald-500/30 text-white shadow-xl group">
          <div className="absolute inset-0 opacity-15 mix-blend-overlay pointer-events-none" style={{ backgroundImage: "url('/images/arabesque.png')" }} />
          <div className="absolute -top-12 -left-12 w-32 h-32 text-emerald-500/20 rounded-full card-glow pointer-events-none" />

          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-[1_1_12rem] items-center gap-3 min-w-0">
              <div className="w-12 h-12 shrink-0 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-400/30 shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                <HandHeart size={26} className="animate-pulse" />
              </div>
              <div className="min-w-0 text-right">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[9.5px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 shrink-0">
                    {t('sadaqah_badge')}
                  </span>
                </div>
                <h3 className="text-base font-black text-white leading-tight">
                  {t('sadaqah_title')}
                </h3>
                <p className="text-[11px] text-emerald-100/80 font-semibold mt-0.5">
                  {t('sadaqah_subtitle')}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                  triggerHaptic('light');
                  navigate('/sadaqah-jariyah');
                }}
                className="shrink-0 px-3.5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg active:scale-95 transition-all"
              >
                <span>{t('sadaqah_action')}</span>
                <ChevronRight size={14} className={cn(!isRtl && "rotate-180")} />
              </button>
            </div>
          </div>
        </div>
                  </div>
                );
              default:
                return null;
            }
          })}
      </div>


    </div>
  );
};

export default React.memo(Home);
