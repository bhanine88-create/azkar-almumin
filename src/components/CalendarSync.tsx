import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, CheckCircle2, RefreshCw, LogOut, ShieldAlert, ArrowLeft, ToggleLeft, ToggleRight, Check, AlertCircle } from 'lucide-react';
import { BackButton } from './ui/BackButton';
import { useAppContext } from '../AppContext';
import { calendarService, CalendarEventPayload } from '../services/calendarService';
import { useSmartNavigation } from '../lib/navigation';
import moment from 'moment-hijri';

// Major Islamic occasions to populate calendar with
const SYNC_ISLAMIC_EVENTS = [
  { name: 'رأس السنة الهجرية', month: 1, day: 1, type: 'spiritual', desc: 'بداية العام الهجري الجديد وذكرى هجرة النبي ﷺ.' },
  { name: 'صيام تاسوعاء', month: 1, day: 9, type: 'fasting', desc: 'اليوم التاسع من شهر محرم الحرام ويستحب صيامه.' },
  { name: 'صيام عاشوراء', month: 1, day: 10, type: 'fasting', desc: 'اليوم الذي نجى الله فيه موسى وصيامه يكفر سنة ماضية.' },
  { name: 'المولد النبوي الشريف', month: 3, day: 12, type: 'spiritual', desc: 'ذكرى ميلاد خاتم الأنبياء والمرسلين نبينا محمد ﷺ.' },
  { name: 'ليلة الإسراء والمعراج', month: 7, day: 27, type: 'spiritual', desc: 'الرحلة الإعجازية للنبي ﷺ وفرض الصلوات الخمس.' },
  { name: 'ليلة النصف من شعبان', month: 8, day: 15, type: 'spiritual', desc: 'ليلة مباركة تم فيها تحويل القبلة إلى الكعبة المشرفة.' },
  { name: 'بداية شهر رمضان المبارك', month: 9, day: 1, type: 'fasting', desc: 'بداية شهر الصيام والقيام والقرآن والتقرب إلى الله.' },
  { name: 'غزوة بدر الكبرى (١٧ رمضان)', month: 9, day: 17, type: 'spiritual', desc: 'ذكرى المعركة الحاسمة الأولى التي انتصر فيها الحق.' },
  { name: 'عيد الفطر المبارك', month: 10, day: 1, type: 'holiday', desc: 'يوم بهجة وسرور للمسلمين بعد إتمام صيام رمضان المبارك.' },
  { name: 'يوم عرفة (٩ ذو الحجة)', month: 12, day: 9, type: 'fasting', desc: 'أعظم أيام العام وصيامه لغير الحاج يكفر ذنوب سنتين.' },
  { name: 'عيد الأضحى المبارك', month: 12, day: 10, type: 'holiday', desc: 'يوم النحر الأكبر وتأدية مناسك الحج وذبح الأضاحي.' }
];

export const CalendarSync: React.FC = () => {
  const { progress, settings } = useAppContext();
  const { navigate, goBack } = useSmartNavigation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Selection States
  const [syncMorningAdhkar, setSyncMorningAdhkar] = useState(true);
  const [syncEveningAdhkar, setSyncEveningAdhkar] = useState(true);
  const [syncGoals, setSyncGoals] = useState(true);
  const [syncOccasions, setSyncOccasions] = useState(true);

  const isRTL = settings.appLanguage === 'ar';

  useEffect(() => {
    // Check if user is already signed in
    const authState = calendarService.isAuthenticated();
    setIsAuthenticated(authState);
    if (authState) {
      setCurrentUser(calendarService.getAccessToken());
    }
  }, []);

  const handleConnect = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const result = await calendarService.signIn();
      setIsAuthenticated(true);
      setCurrentUser(result.user);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/popup-closed-by-user' || (err.message && err.message.includes('popup-closed-by-user'))) {
        setErrorMessage(
          settings.appLanguage === 'ar' 
            ? "تم إغلاق نافذة تسجيل الدخول المنبثقة قبل إتمام العملية. يرجى المحاولة مرة أخرى."
            : settings.appLanguage === 'fr'
            ? "La fenêtre de connexion a été fermée avant la fin du processus. Veuillez réessayer."
            : "The sign-in popup was closed before completion. Please try again."
        );
      } else {
        setErrorMessage(
          settings.appLanguage === 'ar'
            ? 'فشل في الاتصال بحساب Google.'
            : settings.appLanguage === 'fr'
            ? 'Échec de la connexion au compte Google.'
            : 'Failed to connect to Google account.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    calendarService.clearToken();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setSyncStatus('idle');
  };

  const handleSync = async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    setSyncStatus('syncing');
    setErrorMessage('');

    try {
      // 1. Clear previously synced events first to prevent clutter or duplicates
      await calendarService.clearSyncedEvents();

      // 2. Add Morning Adhkar daily recurring event if selected
      if (syncMorningAdhkar) {
        const time = settings.morningAdhkarTime || '06:00';
        const [hours, minutes] = time.split(':');
        const endHour = String((Number(hours) + 1) % 24).padStart(2, '0');
        const endTime = `${endHour}:${minutes}`;

        await calendarService.addEvent({
          summary: '🌅 أذكار الصباح [أذكار المؤمن]',
          description: 'موعد قراءة أذكار الصباح اليومية المباركة لتطهير القلب وتحصين النفس اليومي. رطب لسانك بذكر الله.\n\n[أذكار المؤمن]',
          startTime: time,
          endTime: endTime,
          isRecurring: true,
          recurrenceRule: 'RRULE:FREQ=DAILY',
          colorId: '5' // Yellow/Banana color in Google Calendar
        });
      }

      // 3. Add Evening Adhkar daily recurring event if selected
      if (syncEveningAdhkar) {
        const time = settings.eveningAdhkarTime || '17:00';
        const [hours, minutes] = time.split(':');
        const endHour = String((Number(hours) + 1) % 24).padStart(2, '0');
        const endTime = `${endHour}:${minutes}`;

        await calendarService.addEvent({
          summary: '🌇 أذكار المساء [أذكار المؤمن]',
          description: 'موعد قراءة أذكار المساء اليومية للسكينة وحفظ الله تبارك وتعالى.\n\n[أذكار المؤمن]',
          startTime: time,
          endTime: endTime,
          isRecurring: true,
          recurrenceRule: 'RRULE:FREQ=DAILY',
          colorId: '6' // Tangerine color in Google Calendar
        });
      }

      // 4. Add Active Spiritual Goals
      if (syncGoals && progress.spiritualGoals && progress.spiritualGoals.length > 0) {
        for (let i = 0; i < progress.spiritualGoals.length; i++) {
          const goal = progress.spiritualGoals[i];
          // Distribute goals through different hours of the day
          const hour = 9 + (i * 2); 
          const startTime = `${String(hour).padStart(2, '0')}:00`;
          const endTime = `${String(hour).padStart(2, '0')}:45`;

          await calendarService.addEvent({
            summary: `🎯 هدف روحي: ${goal.title} [أذكار المؤمن]`,
            description: `هدف روحي يومي مخصص لمساعدتك على الحفاظ على وردك الإيماني والنمو الروحي.\nنوع الهدف: ${goal.type}\nالهدف اليومي المطلوب: ${goal.target}\n\n[أذكار المؤمن]`,
            startTime,
            endTime,
            isRecurring: true,
            recurrenceRule: 'RRULE:FREQ=DAILY',
            colorId: '9' // Blueberry color in Google Calendar
          });
        }
      }

      // 5. Add Islamic Events converted to Gregorian for the current Hijri year
      if (syncOccasions) {
        // Find current Hijri year
        const currentHijriYear = moment().iYear();
        
        for (const ev of SYNC_ISLAMIC_EVENTS) {
          try {
            // Find the Gregorian date for this occurrence
            const occasionMoment = moment()
              .iYear(currentHijriYear)
              .iMonth(ev.month - 1)
              .iDate(ev.day);

            const gregDateStr = occasionMoment.format('YYYY-MM-DD');
            const summary = ev.type === 'fasting' 
              ? `🌙 ${ev.name} [أذكار المؤمن]` 
              : `🕌 ${ev.name} [أذكار المؤمن]`;

            // Google Calendar All-Day Event setup
            const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Riyadh';
            const body = {
              summary,
              description: `${ev.desc}\n\n[أذكار المؤمن]`,
              start: { date: gregDateStr, timeZone },
              end: { date: gregDateStr, timeZone }, // Same day for all day
              colorId: ev.type === 'fasting' ? '10' : '2' // Basil or Sage green
            };

            await calendarService.apiRequest('calendars/primary/events', {
              method: 'POST',
              body: JSON.stringify(body)
            });
          } catch (hijriErr) {
            console.warn(`Could not compute date for ${ev.name}:`, hijriErr);
          }
        }
      }

      setSyncStatus('success');
    } catch (err: any) {
      console.error('Synchronization failure:', err);
      setSyncStatus('error');
      setErrorMessage(err.message || 'فشل في ترحيل ومزامنة الأحداث.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearSync = async () => {
    if (!isAuthenticated) return;
    const confirmed = window.confirm(
      isRTL 
        ? 'هل أنت متأكد من رغبتك في مسح وإزالة جميع الأحداث والمواعيد التي تمت مزامنتها مسبقاً من تقويم جهازك؟'
        : 'Are you sure you want to clear all previously synced events from your calendar?'
    );
    if (!confirmed) return;

    setIsLoading(true);
    setErrorMessage('');
    try {
      const removedCount = await calendarService.clearSyncedEvents();
      alert(
        isRTL 
          ? `تمت إزالة ${removedCount} حدث من تقويمك بنجاح.` 
          : `Successfully removed ${removedCount} events from your calendar.`
      );
      setSyncStatus('idle');
    } catch (err: any) {
      setErrorMessage(err.message || 'حدث خطأ أثناء مسح الأحداث.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-y-auto pb-12" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-black/5 dark:border-white/5 py-4 px-4 flex items-center gap-4">
        <BackButton />
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white">
            {isRTL ? 'مزامنة تقويم جهازك' : 'Device Calendar Sync'}
          </h1>
          <p className="text-[10px] text-slate-500 font-black tracking-widest uppercase">
            {isRTL ? 'تكامل ذكي مع تقويم Google' : 'Smart Google Calendar Integration'}
          </p>
        </div>
      </header>

      <div className="p-4 space-y-6 max-w-md mx-auto w-full">
        {/* Connection Box */}
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-black/5 dark:border-white/5 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-500 shadow-inner shrink-0">
              <Calendar size={24} />
            </div>
            <div>
              <h3 className="font-black text-slate-800 dark:text-white text-sm">
                {isRTL ? 'ربط الحساب والمزامنة' : 'Connect & Sync'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isAuthenticated 
                  ? (isRTL ? 'تم الربط بالتقويم بنجاح' : 'Successfully connected to calendar')
                  : (isRTL ? 'اربط حساب Google للبدء' : 'Connect Google account to begin')
                }
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed text-right">
            {isRTL 
              ? 'مزامنة تقويم "أذكار المؤمن" تساعدك على تنسيق يومك الإيماني والروحي حول أشغالك ومواعيدك الدنيوية. يتم إنشاء الأحداث والصلوات والأوراد بدقة تامة وبصورة مخصصة.'
              : 'Syncing keeps you consistent by time-blocking your spiritual tasks and morning/evening adhkar in your default device calendar alongside other daily tasks.'
            }
          </p>

          {errorMessage && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-500 text-xs">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Connect Action Button */}
          {!isAuthenticated ? (
            <button
              onClick={handleConnect}
              disabled={isLoading}
              className="w-full py-4 bg-white dark:bg-slate-800 text-slate-700 dark:text-white rounded-2xl font-black text-xs flex items-center justify-center gap-3 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-850 shadow-sm active:scale-[0.98] transition-all cursor-pointer"
            >
              {isLoading ? (
                <RefreshCw size={16} className="animate-spin text-blue-500" />
              ) : (
                <>
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5 shrink-0">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  </svg>
                  <span>{isRTL ? 'ربط الحساب عبر Google' : 'Sign in with Google'}</span>
                </>
              )}
            </button>
          ) : (
            <div className="flex items-center gap-3 w-full">
              <div className="flex-1 bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400 rounded-2xl py-3 px-4 text-xs font-black flex items-center gap-2">
                <Check size={16} />
                <span>{isRTL ? 'الحساب متصل وجاهز' : 'Connected & Ready'}</span>
              </div>
              <button
                onClick={handleDisconnect}
                className="p-3.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl hover:bg-rose-500/10 hover:text-rose-500 transition-all outline-none"
                title={isRTL ? 'قطع الاتصال' : 'Disconnect'}
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Sync Settings/Options panel */}
        <AnimatePresence>
          {isAuthenticated && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="space-y-4"
            >
              <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-black/5 dark:border-white/5 p-6 shadow-sm space-y-5">
                <h3 className="font-black text-slate-800 dark:text-white text-sm">
                  {isRTL ? 'تخصيص بنود المزامنة' : 'Configure Sync Elements'}
                </h3>

                {/* Morning Athkar Toggle */}
                <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-black/5 dark:border-white/5">
                  <div>
                    <h4 className="font-bold text-xs text-slate-800 dark:text-white mb-0.5">
                      {isRTL ? 'أذكار الصباح اليومية' : 'Daily Morning Athkar'}
                    </h4>
                    <p className="text-[10px] text-slate-500">
                      {isRTL ? `الموعد الحالي: ${settings.morningAdhkarTime || '06:00'}` : `Time: ${settings.morningAdhkarTime || '06:00'}`}
                    </p>
                  </div>
                  <button 
                    onClick={() => setSyncMorningAdhkar(!syncMorningAdhkar)}
                    className="text-teal-500 outline-none hover:opacity-80 transition-opacity"
                  >
                    {syncMorningAdhkar ? <ToggleRight size={36} className="fill-current" /> : <ToggleLeft size={36} className="text-slate-300" />}
                  </button>
                </div>

                {/* Evening Athkar Toggle */}
                <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-black/5 dark:border-white/5">
                  <div>
                    <h4 className="font-bold text-xs text-slate-800 dark:text-white mb-0.5">
                      {isRTL ? 'أذكار المساء اليومية' : 'Daily Evening Athkar'}
                    </h4>
                    <p className="text-[10px] text-slate-500">
                      {isRTL ? `الموعد الحالي: ${settings.eveningAdhkarTime || '17:00'}` : `Time: ${settings.eveningAdhkarTime || '17:00'}`}
                    </p>
                  </div>
                  <button 
                    onClick={() => setSyncEveningAdhkar(!syncEveningAdhkar)}
                    className="text-teal-500 outline-none hover:opacity-80 transition-opacity"
                  >
                    {syncEveningAdhkar ? <ToggleRight size={36} className="fill-current" /> : <ToggleLeft size={36} className="text-slate-300" />}
                  </button>
                </div>

                {/* Spiritual Goals Toggle */}
                <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-black/5 dark:border-white/5">
                  <div>
                    <h4 className="font-bold text-xs text-slate-800 dark:text-white mb-0.5">
                      {isRTL ? 'أهدافي الروحية النشطة' : 'Active Spiritual Goals'}
                    </h4>
                    <p className="text-[10px] text-slate-500">
                      {isRTL 
                        ? `عدد الأهداف الروحية المخصصة: ${progress.spiritualGoals?.length || 0}` 
                        : `Found ${progress.spiritualGoals?.length || 0} customized goals`
                      }
                    </p>
                  </div>
                  <button 
                    disabled={!progress.spiritualGoals || progress.spiritualGoals.length === 0}
                    onClick={() => setSyncGoals(!syncGoals)}
                    className="text-teal-500 outline-none hover:opacity-80 transition-opacity disabled:opacity-30"
                  >
                    {syncGoals && progress.spiritualGoals && progress.spiritualGoals.length > 0 ? <ToggleRight size={36} className="fill-current" /> : <ToggleLeft size={36} className="text-slate-300" />}
                  </button>
                </div>

                {/* Seasonal/Fasting Occasions Toggle */}
                <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-black/5 dark:border-white/5">
                  <div>
                    <h4 className="font-bold text-xs text-slate-800 dark:text-white mb-0.5">
                      {isRTL ? 'المناسبات وأيام الصيام المستحبة' : 'Recommended Fasting & Occasions'}
                    </h4>
                    <p className="text-[10px] text-slate-500">
                      {isRTL ? 'مزامنة عاشوراء، يوم عرفة، ليلة القدر، والمناسبات الكبرى' : 'Ashura, Arafat, Laylat al-Qadr, etc.'}
                    </p>
                  </div>
                  <button 
                    onClick={() => setSyncOccasions(!syncOccasions)}
                    className="text-teal-500 outline-none hover:opacity-80 transition-opacity"
                  >
                    {syncOccasions ? <ToggleRight size={36} className="fill-current" /> : <ToggleLeft size={36} className="text-slate-300" />}
                  </button>
                </div>
              </div>

              {/* Sync Controls */}
              <div className="space-y-3">
                <button
                  onClick={handleSync}
                  disabled={isLoading || (!syncMorningAdhkar && !syncEveningAdhkar && !syncGoals && !syncOccasions)}
                  className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-[0.98] hover:shadow-blue-500/40 transition-all cursor-pointer"
                >
                  {syncStatus === 'syncing' ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" />
                      <span>{isRTL ? 'جاري تصدير الأحداث للتقويم...' : 'Syncing with calendar...'}</span>
                    </>
                  ) : (
                    <>
                      <Calendar size={18} />
                      <span>{isRTL ? 'مزامنة التقويم الآن' : 'Start Syncing Now'}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleClearSync}
                  disabled={isLoading}
                  className="w-full py-3.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/20 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <ShieldAlert size={16} />
                  <span>{isRTL ? 'حذف جميع الأحداث المزامنة مسبقاً' : 'Clear All Synced Events'}</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sync Success screen / Modal details */}
        <AnimatePresence>
          {syncStatus === 'success' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-emerald-500/10 border border-emerald-500/20 rounded-[2rem] p-6 text-center space-y-4"
            >
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 size={36} />
              </div>
              <div>
                <h4 className="font-black text-slate-800 dark:text-white text-base mb-1">
                  {isRTL ? 'تمت المزامنة بنجاح!' : 'Successfully Synced!'}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {isRTL 
                    ? 'لقد تم ترحيل أذكارك وأهدافك الروحية بنجاح إلى تقويم جهازك. ستتلقى التذكارات الإيمانية بصورة ذكية وجميلة لمساعدتك على الحفاظ والثبات.'
                    : 'Your selected spiritual activities have been added to your primary calendar. You will receive elegant system notifications to aid consistency.'
                  }
                </p>
              </div>
              <button
                onClick={() => setSyncStatus('idle')}
                className="px-6 py-2 bg-emerald-500 text-white font-black text-xs rounded-xl hover:bg-emerald-600 active:scale-95 transition-all outline-none"
              >
                {isRTL ? 'موافق' : 'Okay'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
