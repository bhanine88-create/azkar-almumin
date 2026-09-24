import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../AppContext';
import { Reminder } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, Clock, ArrowRight, Sparkles } from 'lucide-react';
import { cn, triggerSafeNotification } from '../lib/utils';
import { NOTIFICATION_SOUNDS } from '../constants';
import { INITIAL_HABITS } from '../data/habitsData';
import { useAdhkarCounts } from '../context/AdhkarCountsContext';
import { PermissionsExplainerModal } from './PermissionsExplainerModal';
import { safeLocalStorageGetItem, safeLocalStorageSetItem, safeLocalStorageRemoveItem } from "../utils/storage";
import { 
  syncAllLocalNotifications, 
  registerNotificationActionListener, 
  initializeNotificationChannels,
  checkLocalNotificationPermissions,
  requestLocalNotificationPermissions
} from '../services/localNotificationService';

/**
 * Marks that the permissions explainer has been shown once on this install.
 * Versioned, so a future change to what the app asks for can show it again.
 */
const PERMISSIONS_INTRO_KEY = 'believer_permissions_intro_v1';

const PRAYER_NAMES: Record<string, string> = {
  Fajr: 'الفجر',
  Sunrise: 'الشروق',
  Dhuhr: 'الظهر',
  Asr: 'العصر',
  Maghrib: 'المغرب',
  Isha: 'العشاء'
};

export const PrayerNotificationManager: React.FC = () => {
  const navigate = useNavigate();
  const { settings, updateSettings, adhkarData, isCategoryCompleted } = useAppContext();
  const { isCategoryFinished } = useAdhkarCounts();
  const [activeNotification, setActiveNotification] = useState<{ 
    name: string; 
    time: string; 
    type?: string; 
    route?: string;
    details?: string;
  } | null>(null);
  const [prayerTimes, setPrayerTimes] = useState<any>(null);
  const [showPermissionsIntro, setShowPermissionsIntro] = useState(false);
  const lastNotifiedRef = useRef<Record<string, string>>({});
  const lastRandomTimestampRef = useRef<number>(Date.now());
  const mountTimeRef = useRef<number>(Date.now());

  // Lets the permission effect below run once and still schedule with current
  // settings, instead of re-running — and re-requesting — on every settings write.
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  // 1. Initialize Capacitor notification channels and deep link navigation on mount
  useEffect(() => {
    initializeNotificationChannels();
    registerNotificationActionListener((route) => {
      if (route) {
        navigate(route);
      }
    });
  }, [navigate]);

  // 2. Guarantee Morning & Evening Adhkar notifications default state = true on initialization
  useEffect(() => {
    const initKey = 'believer_adhkar_notifs_initialized_v3';
    const isInitDone = safeLocalStorageGetItem(initKey);

    if (!isInitDone) {
      updateSettings({
        notificationsEnabled: true,
        morningNotificationsEnabled: true,
        eveningNotificationsEnabled: true,
        prayerNotificationsEnabled: true,
        morningAdhkarFollowupEnabled: true,
        eveningAdhkarFollowupEnabled: true,
      });
      safeLocalStorageSetItem(initKey, 'true');
    }
  }, [updateSettings]);

  /*
    3. Notification permission on first launch, and a re-check on every app entry.

    The user's report was that no permission dialog appears when the app is first
    opened. Three things in this effect were responsible:

      a) The guard only matched `display === 'prompt'`. Capacitor also reports
         'prompt-with-rationale' — the state Android moves to the moment a
         dialog is dismissed once — which was read as "nothing left to ask", so
         the app went permanently silent after a single stray tap.

      b) The dependency array was `[settings]`. Every settings write tore the
         effect down and rebuilt it, so at launch — where effect 2 below writes
         the notification defaults — several permission requests raced each
         other into Capacitor's single pending-call slot and the dialog could be
         dropped outright. It now runs once and reads `settingsRef` for current
         values. `requestLocalNotificationPermissions` also collapses concurrent
         callers, so the remaining paths cannot race either.

      c) Nothing ever told the user what the permissions were for. The app
         already ships PermissionsExplainerModal for precisely this, but it was
         only reachable from Settings and the Terms page. It now leads the
         first-run flow, and the system dialog follows when it is dismissed.

    The short delay before the first-run prompt is deliberate: firing the system
    dialog during mount puts it behind the splash screen, where it is either
    missed or dismissed blind.
  */
  useEffect(() => {
    let cancelled = false;

    const runPermissionFlow = async (mayPrompt: boolean) => {
      try {
        await initializeNotificationChannels();
        let perm = await checkLocalNotificationPermissions();
        if (cancelled) return;

        const canStillAsk = perm.display === 'prompt' || perm.display === 'prompt-with-rationale';

        if (canStillAsk && mayPrompt) {
          // Explain once per install, then let the modal trigger the real request.
          if (!safeLocalStorageGetItem(PERMISSIONS_INTRO_KEY)) {
            setShowPermissionsIntro(true);
            return;
          }
          perm = await requestLocalNotificationPermissions();
          if (cancelled) return;
        }

        if (perm.display === 'granted') {
          await syncAllLocalNotifications(settingsRef.current);
        }
      } catch (err) {
        console.warn('[PrayerNotificationManager] Permission verification failed on app entry:', err);
      }
    };

    const firstRunTimer = setTimeout(() => runPermissionFlow(true), 1600);

    // Returning to the app re-checks and re-syncs, but never re-prompts: the
    // user either answered the dialog or chose not to, and nagging on every
    // resume is both hostile and, once Android has recorded a denial, useless.
    const handleAppEntryFocus = () => {
      if (document.visibilityState === 'visible') {
        runPermissionFlow(false);
      }
    };

    document.addEventListener('visibilitychange', handleAppEntryFocus);
    window.addEventListener('focus', handleAppEntryFocus);

    return () => {
      cancelled = true;
      clearTimeout(firstRunTimer);
      document.removeEventListener('visibilitychange', handleAppEntryFocus);
      window.removeEventListener('focus', handleAppEntryFocus);
    };
  }, []);

  /** Dismissing the explainer is what actually asks Android for the permission. */
  const handlePermissionsIntroClose = React.useCallback(async () => {
    safeLocalStorageSetItem(PERMISSIONS_INTRO_KEY, 'true');
    setShowPermissionsIntro(false);
    try {
      const perm = await requestLocalNotificationPermissions();
      if (perm.display === 'granted') {
        await syncAllLocalNotifications(settingsRef.current);
      }
    } catch (err) {
      console.warn('[PrayerNotificationManager] Permission request after explainer failed:', err);
    }
  }, []);

  // 4. Automatically sync OS background local notifications for upcoming 7 days
  useEffect(() => {
    const timer = setTimeout(() => {
      syncAllLocalNotifications(settings).catch(err => {
        console.warn('[PrayerNotificationManager] Background local notification sync error:', err);
      });
    }, 1200);

    return () => clearTimeout(timer);
  }, [
    settings.notificationsEnabled,
    settings.prayerNotificationsEnabled,
    settings.prayerNotificationSettings,
    settings.prayerCalcMethod,
    settings.prayerAsrMethod,
    settings.prayerOffsets,
    settings.prayerDaylightSaving,
    settings.morningNotificationsEnabled,
    settings.morningAdhkarTime,
    settings.morningAdhkarEndTime,
    settings.morningAdhkarFollowupEnabled,
    settings.eveningNotificationsEnabled,
    settings.eveningAdhkarTime,
    settings.eveningAdhkarEndTime,
    settings.eveningAdhkarFollowupEnabled,
    settings.sunnahReminderEnabled,
    settings.sunnahReminderTime,
    settings.reminders
  ]);

  const getAudioUrl = (type: string, soundId?: string) => {
    const finalSoundId = soundId || (
      type === 'prayer' ? settings.prayerRingtone :
      type === 'morning' ? settings.morningAdhkarRingtone :
      type === 'evening' ? settings.eveningAdhkarRingtone :
      type === 'random' ? (settings.randomAdhkarSound || 'default') :
      settings.customReminderRingtone
    );
    
    const sound = NOTIFICATION_SOUNDS.find(s => s.id === finalSoundId) || NOTIFICATION_SOUNDS[0];
    return sound.url;
  };

  const isQuietHours = (nowH: number, nowM: number, startStr?: string, endStr?: string) => {
    if (!startStr || !endStr) return false;
    const [sH, sM] = startStr.split(':').map(Number);
    const [eH, eM] = endStr.split(':').map(Number);
    const nowTotal = nowH * 60 + nowM;
    const startTotal = sH * 60 + sM;
    const endTotal = eH * 60 + eM;

    if (startTotal > endTotal) {
      return nowTotal >= startTotal || nowTotal < endTotal;
    } else if (startTotal < endTotal) {
      return nowTotal >= startTotal && nowTotal < endTotal;
    }
    return false;
  };

  useEffect(() => {
    const fetchTimes = async () => {
      if (settings.prayerManualMode && settings.prayerManualTimes) {
        setPrayerTimes(settings.prayerManualTimes);
        return;
      }
      const savedCity = safeLocalStorageGetItem('prayer_city');
      const savedCountry = safeLocalStorageGetItem('prayer_country') || '';
      const savedLat = safeLocalStorageGetItem('prayer_lat');
      const savedLng = safeLocalStorageGetItem('prayer_lng');
      const calcMethod = settings.prayerCalcMethod || safeLocalStorageGetItem('prayer_method') || '4';
      const asrMethod = settings.prayerAsrMethod || safeLocalStorageGetItem('prayer_asr_method') || '0';

      const now = new Date();
      const dateStr = `${now.getDate()}-${now.getMonth() + 1}-${now.getFullYear()}`;

      let url = '';
      let isAddress = false;
      if (savedLat && savedLng) {
        url = `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${savedLat}&longitude=${savedLng}&method=${calcMethod}&school=${asrMethod}`;
      } else if (savedCity) {
        url = `https://api.aladhan.com/v1/timingsByAddress/${dateStr}?address=${encodeURIComponent(savedCity + ', ' + savedCountry)}&method=${calcMethod}&school=${asrMethod}`;
        isAddress = true;
      } else {
        url = `https://api.aladhan.com/v1/timings/${dateStr}?method=${calcMethod}&school=${asrMethod}`;
      }

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        let res = await fetch(url, { 
          signal: controller.signal,
          mode: 'cors',
          credentials: 'omit',
          referrerPolicy: 'no-referrer'
        });
        
        if (!res.ok && isAddress && savedCity) {
          const fallbackUrl = `https://api.aladhan.com/v1/timingsByCity/${dateStr}?city=${encodeURIComponent(savedCity)}&country=${encodeURIComponent(savedCountry)}&method=${calcMethod}&school=${asrMethod}`;
          res = await fetch(fallbackUrl, {
            signal: controller.signal,
            mode: 'cors',
            credentials: 'omit',
            referrerPolicy: 'no-referrer'
          });
        }
        clearTimeout(timeoutId);
        
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        
        const json = await res.json();
        if (json.code === 200 && json.data?.timings) {
          const timings = { ...json.data.timings };
          const offsets = settings.prayerOffsets || {};
          
          Object.keys(PRAYER_NAMES).forEach(prayerKey => {
            if (timings[prayerKey]) {
              const timePart = timings[prayerKey].split(' ')[0];
              let [h, m] = timePart.split(':').map(Number);
              
              const isPM = timings[prayerKey].toLowerCase().includes('pm');
              const isAM = timings[prayerKey].toLowerCase().includes('am');
              if (isPM && h < 12) h += 12;
              if (isAM && h === 12) h = 0;

              const date = new Date();
              date.setHours(h, m, 0, 0);
              
              if (offsets[prayerKey]) {
                date.setMinutes(date.getMinutes() + offsets[prayerKey]);
              }
              
              if (settings.prayerDaylightSaving) {
                date.setHours(date.getHours() + 1);
              }
              
              timings[prayerKey] = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
            }
          });
          
          setPrayerTimes(timings);
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.warn('Silent failure fetching prayer times:', err.message);
        }
      }
    };

    fetchTimes();
    const interval = setInterval(fetchTimes, 6 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [settings.prayerCalcMethod, settings.prayerAsrMethod, settings.prayerOffsets, settings.prayerManualMode, settings.prayerManualTimes, settings.prayerDaylightSaving]);

  useEffect(() => {
    const checkAllReminders = () => {
      if (!settings.notificationsEnabled) return;

      const tz = safeLocalStorageGetItem('prayer_timezone') || Intl.DateTimeFormat().resolvedOptions().timeZone;
      const parts = new Intl.DateTimeFormat('en-US', {
        year: 'numeric', month: 'numeric', day: 'numeric',
        hour: 'numeric', minute: 'numeric', second: 'numeric',
        hour12: false, timeZone: tz
      }).formatToParts(new Date());
      
      let pY=0, pM=0, pD=0, currentH=0, currentM=0, pS=0;
      let isPM = false;
      let isAM = false;
      parts.forEach(p => {
        if (p.type === 'year') pY = +p.value;
        if (p.type === 'month') pM = +p.value;
        if (p.type === 'day') pD = +p.value;
        if (p.type === 'hour') currentH = +p.value;
        if (p.type === 'minute') currentM = +p.value;
        if (p.type === 'second') pS = +p.value;
        if (p.type === 'dayPeriod') {
          if (p.value.toLowerCase().includes('pm')) isPM = true;
          if (p.value.toLowerCase().includes('am')) isAM = true;
        }
      });
      if (currentH === 24) currentH = 0;
      if (isPM && currentH < 12) currentH += 12;
      if (isAM && currentH === 12) currentH = 0;
      
      const now = new Date(pY, pM - 1, pD, currentH, currentM, pS);
      const currentTimeStr = `${currentH.toString().padStart(2, '0')}:${currentM.toString().padStart(2, '0')}`;
      const nowDateStr = `${pY}-${pM}-${pD} ${currentTimeStr}`;

      const shouldTriggerNow = (key: string, targetTime: string): boolean => {
        if (targetTime !== currentTimeStr) return false;
        
        // If app was opened within the last 10 seconds, mark as already notified for this minute
        // to strictly prevent notifications/alerts on app open
        if (Date.now() - mountTimeRef.current < 10000) {
          lastNotifiedRef.current[key] = nowDateStr;
          return false;
        }

        if (lastNotifiedRef.current[key] === nowDateStr) return false;

        lastNotifiedRef.current[key] = nowDateStr;
        return true;
      };

      // 1. Prayer Notifications
      if (prayerTimes && settings.prayerNotificationsEnabled) {
        Object.entries(prayerTimes).forEach(([key, time]) => {
          if (PRAYER_NAMES[key] && settings.prayerNotificationSettings?.[key]) {
            if (shouldTriggerNow(key, time as string)) {
              triggerNotification(key, time as string);
            }
          }
        });
      }

      // Check Adhkar Completion Status
      const morningItems = adhkarData.find(c => c.category === 'morning')?.items || [];
      const eveningItems = adhkarData.find(c => c.category === 'evening')?.items || [];
      const isMorningFinished = isCategoryFinished('morning', morningItems);
      const isEveningFinished = isCategoryFinished('evening', eveningItems);

      // 2. Morning Adhkar Primary Notification
      if (settings.morningNotificationsEnabled && !isCategoryCompleted('morning') && !isMorningFinished) {
        if (shouldTriggerNow('morning-adhkar', settings.morningAdhkarTime || '06:00')) {
          triggerMorningNotification();
        }
      }

      // 3. Morning Adhkar Follow-up Notification (if unread)
      const morningEndTime = settings.morningAdhkarEndTime || '10:00';
      if (settings.morningNotificationsEnabled && settings.morningAdhkarFollowupEnabled && !isCategoryCompleted('morning') && !isMorningFinished) {
        if (shouldTriggerNow('morning-adhkar-followup', morningEndTime)) {
          triggerMorningFollowupNotification();
        }
      }

      // 4. Evening Adhkar Primary Notification
      if (settings.eveningNotificationsEnabled && !isCategoryCompleted('evening') && !isEveningFinished) {
        if (shouldTriggerNow('evening-adhkar', settings.eveningAdhkarTime || '17:00')) {
          triggerEveningNotification();
        }
      }

      // 5. Evening Adhkar Follow-up Notification (if unread)
      const eveningEndTime = settings.eveningAdhkarEndTime || '22:00';
      if (settings.eveningNotificationsEnabled && settings.eveningAdhkarFollowupEnabled && !isCategoryCompleted('evening') && !isEveningFinished) {
        if (shouldTriggerNow('evening-adhkar-followup', eveningEndTime)) {
          triggerEveningFollowupNotification();
        }
      }

      // 6. Sunnah Reminder Notification
      if (settings.sunnahReminderEnabled) {
        if (shouldTriggerNow('sunnah-reminder', settings.sunnahReminderTime || '21:30')) {
          triggerSunnahReminderNotification();
        }
      }

      // 7. Custom Reminders Check
      const customReminders = settings.reminders || [];
      const currentDay = now.getDay();
      const nowTimeMinutes = currentH * 60 + currentM;

      customReminders.forEach(reminder => {
        if (reminder.enabled && reminder.days.includes(currentDay)) {
          const [startH, startM] = reminder.time.split(':').map(Number);
          const startTimeMinutes = startH * 60 + startM;

          if (reminder.interval && reminder.interval > 0) {
            const diff = nowTimeMinutes - startTimeMinutes;
            if (diff >= 0 && diff % reminder.interval === 0) {
              const notificationKey = `custom-${reminder.id}`;
              if (shouldTriggerNow(notificationKey, currentTimeStr)) {
                triggerCustomNotification(reminder);
              }
            }
          } else {
            const notificationKey = `custom-${reminder.id}`;
            if (shouldTriggerNow(notificationKey, reminder.time)) {
              triggerCustomNotification(reminder);
            }
          }
        }
      });

      // 8. Random Athkar System Loop Check
      if (settings.randomAdhkarEnabled && settings.customRandomAdhkar?.length) {
        const intervalMs = (settings.randomAdhkarInterval || 30) * 60 * 1000;
        const elapsed = Date.now() - lastRandomTimestampRef.current;

        if (elapsed >= intervalMs) {
          lastRandomTimestampRef.current = Date.now();

          // Check Quiet Hours
          if (settings.randomAdhkarQuietHoursEnabled) {
            const inQuiet = isQuietHours(currentH, currentM, settings.randomAdhkarQuietStart || '23:00', settings.randomAdhkarQuietEnd || '06:30');
            if (inQuiet) {
              return; // Silently skip during quiet hours
            }
          }

          // Trigger Random Dhikr
          triggerRandomDhikrNotification();
        }
      }
    };

    const interval = setInterval(checkAllReminders, 25000);
    return () => clearInterval(interval);
  }, [prayerTimes, settings, isCategoryCompleted, isCategoryFinished, adhkarData]);

  // Handle Manual Trigger Tests from Settings
  useEffect(() => {
    if (settings._triggerPrayer) {
      triggerNotification('Dhuhr', '12:00');
      updateSettings({ _triggerPrayer: undefined });
    }
  }, [settings._triggerPrayer, updateSettings]);

  useEffect(() => {
    if (settings._triggerMorning) {
      triggerMorningNotification();
      updateSettings({ _triggerMorning: undefined });
    }
  }, [settings._triggerMorning, updateSettings]);

  useEffect(() => {
    if (settings._triggerEvening) {
      triggerEveningNotification();
      updateSettings({ _triggerEvening: undefined });
    }
  }, [settings._triggerEvening, updateSettings]);

  useEffect(() => {
    if (settings._triggerSunnahReminder) {
      triggerSunnahReminderNotification();
      updateSettings({ _triggerSunnahReminder: undefined });
    }
  }, [settings._triggerSunnahReminder, updateSettings]);

  useEffect(() => {
    if (settings._triggerReminderTest) {
      triggerCustomNotification(settings._triggerReminderTest);
      updateSettings({ _triggerReminderTest: undefined });
    }
  }, [settings._triggerReminderTest, updateSettings]);

  useEffect(() => {
    if (settings._triggerRandom) {
      triggerRandomDhikrNotification();
      updateSettings({ _triggerRandom: undefined });
    }
  }, [settings._triggerRandom, updateSettings]);

  const triggerNotification = (key: string, time: string) => {
    setActiveNotification({ 
      name: `صلاة ${PRAYER_NAMES[key]}`, 
      time, 
      type: 'prayer',
      route: '/quran',
      details: 'اقرأ القرآن وتهيّأ للصلاة'
    });
    
    try {
      const audio = new Audio(getAudioUrl('prayer'));
      audio.volume = 0.6;
      audio.play().catch(e => console.log('Prayer audio play blocked:', e));
    } catch (e) {
      console.error('Failed to play prayer sound:', e);
    }

    if ("Notification" in window && Notification.permission === "granted") {
      triggerSafeNotification(`حان الآن موعد صلاة ${PRAYER_NAMES[key]}`, {
        body: `بتوقيت ${time} - أقم صلاتك تنعم بحياتك`,
        icon: '/logo-192.png'
      });
    }

    setTimeout(() => setActiveNotification(null), 12000);
  };

  const triggerMorningNotification = () => {
    const time = settings.morningAdhkarTime || '06:00';
    setActiveNotification({ 
      name: 'أذكار الصباح 🌅', 
      time, 
      type: 'morning',
      route: '/adhkar/morning',
      details: 'حصّن يومك بالذكر المبارك'
    });
    
    try {
      const audio = new Audio(getAudioUrl('morning'));
      audio.volume = 0.6;
      audio.play().catch(e => console.log('Morning audio play blocked:', e));
    } catch (e) {
      console.error('Failed to play morning sound:', e);
    }

    if ("Notification" in window && Notification.permission === "granted") {
      triggerSafeNotification('حان الآن موعد أذكار الصباح 🌅', {
        body: 'ابدأ يومك بالحصن الحصين والذكر المبارك',
        icon: '/logo-192.png'
      });
    }

    setTimeout(() => setActiveNotification(null), 12000);
  };

  const triggerMorningFollowupNotification = () => {
    setActiveNotification({ 
      name: 'تذكير: أذكار الصباح 🌿', 
      time: settings.morningAdhkarEndTime || '10:00', 
      type: 'morning',
      route: '/adhkar/morning',
      details: 'لم تقرأ أذكار الصباح بعد - اضغط للقراءة'
    });
    
    try {
      const audio = new Audio(getAudioUrl('morning'));
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } catch (e) {}

    if ("Notification" in window && Notification.permission === "granted") {
      triggerSafeNotification('تذكير مبارك 🌿: أذكار الصباح', {
        body: 'لم تقرأ أذكار الصباح بعد. اجعل يومك عامراً بذكر الله!',
        icon: '/logo-192.png'
      });
    }

    setTimeout(() => setActiveNotification(null), 12000);
  };

  const triggerEveningNotification = () => {
    const time = settings.eveningAdhkarTime || '17:00';
    setActiveNotification({ 
      name: 'أذكار المساء 🌙', 
      time, 
      type: 'evening',
      route: '/adhkar/evening',
      details: 'احفظ ليلتك بذكر الله'
    });
    
    try {
      const audio = new Audio(getAudioUrl('evening'));
      audio.volume = 0.6;
      audio.play().catch(e => console.log('Evening audio play blocked:', e));
    } catch (e) {
      console.error('Failed to play evening sound:', e);
    }

    if ("Notification" in window && Notification.permission === "granted") {
      triggerSafeNotification('حان الآن موعد أذكار المساء 🌙', {
        body: 'ختام يومك بالطاعات والذكر الحكيم',
        icon: '/logo-192.png'
      });
    }

    setTimeout(() => setActiveNotification(null), 12000);
  };

  const triggerEveningFollowupNotification = () => {
    setActiveNotification({ 
      name: 'تذكير: أذكار المساء 🌙', 
      time: settings.eveningAdhkarEndTime || '22:00', 
      type: 'evening',
      route: '/adhkar/evening',
      details: 'لم تقرأ أذكار المساء بعد - اضغط للقراءة'
    });
    
    try {
      const audio = new Audio(getAudioUrl('evening'));
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } catch (e) {}

    if ("Notification" in window && Notification.permission === "granted") {
      triggerSafeNotification('تذكير مبارك 🌙: أذكار المساء', {
        body: 'لم تقرأ أذكار المساء بعد. احفظ ليلتك بالطاعات والذكر!',
        icon: '/logo-192.png'
      });
    }

    setTimeout(() => setActiveNotification(null), 12000);
  };

  const triggerRandomDhikrNotification = (overrideText?: string) => {
    const list = settings.customRandomAdhkar || [];
    if (!list.length) return;
    const selectedDhikr = overrideText || list[Math.floor(Math.random() * list.length)];

    // Play Sound if enabled
    try {
      const audio = new Audio(getAudioUrl('random', settings.randomAdhkarSound));
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } catch (e) {}

    // System Native Notification
    const notifType = settings.randomAdhkarNotificationType || 'both';
    if ((notifType === 'both' || notifType === 'system') && "Notification" in window && Notification.permission === "granted") {
      triggerSafeNotification('ذكر الله 🌟', {
        body: selectedDhikr,
        icon: '/logo-192.png'
      });
    }

    // In-App Toast / Banner Modal
    if (notifType === 'both' || notifType === 'banner') {
      updateSettings({ _triggerRandomText: selectedDhikr });
    }
  };

  const triggerSunnahReminderNotification = () => {
    const completedSaved = safeLocalStorageGetItem('believer_completed_habits_v2');
    const completedHabits: string[] = completedSaved ? JSON.parse(completedSaved) : [];

    const customSaved = safeLocalStorageGetItem('believer_custom_habits_v2');
    const customHabits: any[] = customSaved ? JSON.parse(customSaved) : [];

    const defaultSunnah = INITIAL_HABITS.filter(h => h.type === 'sunnah');
    const customSunnah = customHabits.filter(h => h.type === 'sunnah');
    const allSunnah = [...defaultSunnah, ...customSunnah];

    const uncompletedSunnah = allSunnah.filter(h => !completedHabits.includes(h.id));

    if (uncompletedSunnah.length > 0) {
      const titles = uncompletedSunnah.slice(0, 3).map(h => h.title).join('، ');
      const count = uncompletedSunnah.length;
      const remainingText = count > 3 ? ` وغيرها (${count - 3} سنن أخرى)` : '';
      const bodyText = `متبقٍ لك اليوم: ${titles}${remainingText}. احرص على إتمامها!`;

      setActiveNotification({
        name: 'سنن ونوافل لم تكتمل اليوم 🌟',
        time: settings.sunnahReminderTime || '21:30',
        type: 'sunnah',
        route: '/insights',
        details: bodyText
      });

      try {
        const audio = new Audio(getAudioUrl('custom'));
        audio.volume = 0.6;
        audio.play().catch(e => console.log('Sunnah audio play blocked:', e));
      } catch (e) {
        console.error('Failed to play sunnah sound:', e);
      }

      if ("Notification" in window && Notification.permission === "granted") {
        triggerSafeNotification('سنن ونوافل لم تكتمل اليوم 🌟', {
          body: bodyText,
          icon: '/logo-192.png'
        });
      }
    } else {
      setActiveNotification({
        name: 'هنيئاً لك إتمام السنن! 🎉',
        time: settings.sunnahReminderTime || '21:30',
        type: 'sunnah',
        route: '/insights',
        details: 'لقد أتممت جميع السنن والنوافل المجدولة لليوم'
      });

      try {
        const audio = new Audio(getAudioUrl('custom'));
        audio.volume = 0.6;
        audio.play().catch(e => console.log('Sunnah audio play blocked:', e));
      } catch (e) {
        console.error('Failed to play sunnah sound:', e);
      }

      if ("Notification" in window && Notification.permission === "granted") {
        triggerSafeNotification('هنيئاً لك! 🎉', {
          body: 'لقد أتممت جميع السنن والنوافل المجدولة لليوم. تقبل الله طاعتك وزادك رفعة!',
          icon: '/logo-192.png'
        });
      }
    }

    setTimeout(() => setActiveNotification(null), 12000);
  };

  const triggerCustomNotification = (reminder: Reminder) => {
    setActiveNotification({ 
      name: reminder.label, 
      time: reminder.time, 
      type: reminder.type,
      route: '/adhkar',
      details: 'تذكيرك الشخصي المجدول'
    });
    
    try {
      const audio = new Audio(getAudioUrl(reminder.type, reminder.soundId));
      audio.volume = 0.5;
      audio.play().catch(e => console.log('Custom audio play blocked:', e));
    } catch (e) {
      console.error('Failed to play custom sound:', e);
    }

    if ("Notification" in window && Notification.permission === "granted") {
      triggerSafeNotification(reminder.label, {
        body: `تذكير: ${reminder.label} - الموعد: ${reminder.time}`,
        icon: '/logo-192.png'
      });
    }

    setTimeout(() => setActiveNotification(null), 12000);
  };

  return (
    <>
    {/*
      Shown once, shortly after the first launch, immediately before the system
      permission dialog. Closing it is what issues the real request — see
      handlePermissionsIntroClose.
    */}
    <PermissionsExplainerModal
      isOpen={showPermissionsIntro}
      onClose={handlePermissionsIntroClose}
    />
    <AnimatePresence>
      {activeNotification && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.9 }}
          animate={{ opacity: 1, y: 16, scale: 1 }}
          exit={{ opacity: 0, y: -100, scale: 0.9 }}
          className="fixed top-0 left-3 right-3 z-[100] max-w-md mx-auto"
        >
          <div className="bg-slate-900/95 backdrop-blur-2xl border border-white/20 rounded-2xl p-3.5 shadow-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className={cn(
                "w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0 animate-pulse",
                activeNotification.type === 'prayer' ? "bg-emerald-500 shadow-emerald-500/30" : 
                activeNotification.type === 'morning' ? "bg-amber-500 shadow-amber-500/30" :
                activeNotification.type === 'evening' ? "bg-indigo-500 shadow-indigo-500/30" :
                activeNotification.type === 'sunnah' ? "bg-teal-500 shadow-teal-500/30" :
                "bg-teal-500 shadow-teal-500/30"
              )}>
                <Bell size={22} />
              </div>
              <div className="text-right min-w-0 flex-1">
                <h4 className="text-white font-black text-xs tracking-tight leading-tight truncate">
                  {activeNotification.name}
                </h4>
                {activeNotification.details && (
                  <p className="text-white/70 text-[10px] font-medium truncate mt-0.5">
                    {activeNotification.details}
                  </p>
                )}
                <p className="text-teal-400 text-[9px] font-bold flex items-center gap-1 justify-end mt-0.5">
                  <Clock size={10} />
                  {activeNotification.time}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {activeNotification.route && (
                <button
                  onClick={() => {
                    const route = activeNotification.route!;
                    setActiveNotification(null);
                    navigate(route);
                  }}
                  className="bg-teal-500 hover:bg-teal-600 text-white font-bold text-[10px] px-2.5 py-1.5 rounded-xl flex items-center gap-1 shadow-md shadow-teal-500/20 active:scale-95 transition-all"
                >
                  <span>اقرأ الآن</span>
                  <ArrowRight size={12} className="rotate-180" />
                </button>
              )}
              <button 
                onClick={() => setActiveNotification(null)}
                className="w-7 h-7 bg-white/10 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
};

