import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../AppContext';
import { Reminder } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, Clock, ArrowRight, Sparkles, Sun, Moon, Sunrise, Sunset } from 'lucide-react';
import { cn, triggerSafeNotification, triggerHaptic } from '../lib/utils';
import { playNotificationChimeSound } from '../lib/sounds';
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
  const prevMorningTimeRef = useRef<string>(settings.morningAdhkarTime);
  const prevEveningTimeRef = useRef<string>(settings.eveningAdhkarTime);

  // Clear suppression when user updates adhkar times so newly chosen times take effect immediately
  useEffect(() => {
    if (prevMorningTimeRef.current !== settings.morningAdhkarTime) {
      prevMorningTimeRef.current = settings.morningAdhkarTime;
      delete lastNotifiedRef.current['morning-adhkar'];
      delete lastNotifiedRef.current['morning-adhkar-followup'];
      delete lastNotifiedRef.current['morning-session-alert'];
      syncAllLocalNotifications(settingsRef.current).catch(() => {});
    }
  }, [settings.morningAdhkarTime]);

  useEffect(() => {
    if (prevEveningTimeRef.current !== settings.eveningAdhkarTime) {
      prevEveningTimeRef.current = settings.eveningAdhkarTime;
      delete lastNotifiedRef.current['evening-adhkar'];
      delete lastNotifiedRef.current['evening-adhkar-followup'];
      delete lastNotifiedRef.current['evening-session-alert'];
      syncAllLocalNotifications(settingsRef.current).catch(() => {});
    }
  }, [settings.eveningAdhkarTime]);

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

  // 2. Guarantee Morning & Evening Adhkar notifications default state = true on first installation & initialization
  useEffect(() => {
    const initKey = 'believer_adhkar_notifs_initialized_v4';
    const isInitDone = safeLocalStorageGetItem(initKey);

    const needsDefaultActivation = !isInitDone || 
      settings.morningNotificationsEnabled === undefined || 
      settings.eveningNotificationsEnabled === undefined ||
      settings.notificationsEnabled === undefined;

    if (needsDefaultActivation) {
      updateSettings({
        notificationsEnabled: true,
        morningNotificationsEnabled: true,
        eveningNotificationsEnabled: true,
        prayerNotificationsEnabled: settings.prayerNotificationsEnabled ?? true,
        morningAdhkarFollowupEnabled: settings.morningAdhkarFollowupEnabled ?? true,
        eveningAdhkarFollowupEnabled: settings.eveningAdhkarFollowupEnabled ?? true,
      });
      safeLocalStorageSetItem(initKey, 'true');
    }
  }, [updateSettings, settings.morningNotificationsEnabled, settings.eveningNotificationsEnabled, settings.notificationsEnabled]);

  /*
    3. Silent permission verification on every app entry + explicit prompt on first install.
    - Checks required notification permissions silently on every mount, focus, pageshow, and visibilitychange.
    - If granted, silently keeps background notification alarms synchronized without popping any dialogs.
    - On very first run, introduces the permissions explainer so the user can grant notifications seamlessly.
  */
  useEffect(() => {
    let cancelled = false;

    // Silent check logic: checks permissions and synchronizes alarms if already granted without bothering the user
    const performSilentPermissionCheck = async () => {
      try {
        await initializeNotificationChannels();
        const perm = await checkLocalNotificationPermissions();
        if (cancelled) return;

        const isGranted = perm.display === 'granted' || 
          (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted');

        if (isGranted) {
          await syncAllLocalNotifications(settingsRef.current);
        }
      } catch (err) {
        // Silent fail-safe to ensure smooth experience without throwing
        console.debug('[PrayerNotificationManager] Silent permission check:', err);
      }
    };

    // Run silent check immediately on mount
    performSilentPermissionCheck();

    // First install / explainer flow with safe delay
    const firstRunTimer = setTimeout(async () => {
      if (cancelled) return;
      try {
        const perm = await checkLocalNotificationPermissions();
        const canStillAsk = perm.display === 'prompt' || perm.display === 'prompt-with-rationale';

        if (canStillAsk) {
          // Explain once per install, then let modal trigger system prompt
          if (!safeLocalStorageGetItem(PERMISSIONS_INTRO_KEY)) {
            setShowPermissionsIntro(true);
            return;
          }
          const res = await requestLocalNotificationPermissions();
          if (cancelled) return;
          if (res.display === 'granted') {
            await syncAllLocalNotifications(settingsRef.current);
          }
        }
      } catch (err) {
        console.warn('[PrayerNotificationManager] First-run permission prompt check error:', err);
      }
    }, 1600);

    // Silent check on every app open / resume / return to foreground
    const handleAppEntryResume = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        performSilentPermissionCheck();
      }
    };

    document.addEventListener('visibilitychange', handleAppEntryResume);
    window.addEventListener('focus', handleAppEntryResume);
    window.addEventListener('pageshow', handleAppEntryResume);

    return () => {
      cancelled = true;
      clearTimeout(firstRunTimer);
      document.removeEventListener('visibilitychange', handleAppEntryResume);
      window.removeEventListener('focus', handleAppEntryResume);
      window.removeEventListener('pageshow', handleAppEntryResume);
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
      // Don't lockout if user specifically enabled morning, evening or prayer alerts
      const isAnyEnabled = settings.notificationsEnabled || settings.morningNotificationsEnabled || settings.eveningNotificationsEnabled || settings.prayerNotificationsEnabled;
      if (!isAnyEnabled) return;

      // Always use the real local device time so alarms match user's phone clock precisely
      const localNow = new Date();
      const currentH = localNow.getHours();
      const currentM = localNow.getMinutes();
      const pY = localNow.getFullYear();
      const pM = localNow.getMonth() + 1;
      const pD = localNow.getDate();
      
      const currentTimeStr = `${currentH.toString().padStart(2, '0')}:${currentM.toString().padStart(2, '0')}`;
      const nowDateStr = `${pY}-${pM}-${pD} ${currentTimeStr}`;
      const nowTimeMinutes = currentH * 60 + currentM;

      const normalizeTime = (t?: string): string => {
        if (!t) return '';
        const parts = t.trim().split(':');
        if (parts.length < 2) return t.trim();
        const h = parts[0].padStart(2, '0');
        const m = parts[1].padStart(2, '0');
        return `${h}:${m}`;
      };

      const shouldTriggerNow = (key: string, targetTime: string): boolean => {
        if (!targetTime) return false;
        const normTarget = normalizeTime(targetTime);
        if (normTarget !== currentTimeStr) return false;
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

      const parseMinutes = (t?: string): number => {
        if (!t) return -1;
        const norm = normalizeTime(t);
        const [h, m] = norm.split(':').map(Number);
        return (h || 0) * 60 + (m || 0);
      };

      // 2. Morning Adhkar Primary Notification & Followup
      if (settings.morningNotificationsEnabled) {
        const morningTarget = settings.morningAdhkarTime || '06:00';
        const morningTargetMinutes = parseMinutes(morningTarget);
        const parsedEnd = parseMinutes(settings.morningAdhkarEndTime);
        const morningEndMinutes = parsedEnd > 0 
          ? parsedEnd 
          : Math.min(morningTargetMinutes + 240, 23 * 60 + 59);

        if (shouldTriggerNow('morning-adhkar', morningTarget)) {
          triggerMorningNotification();
        } else if (
          !isCategoryCompleted('morning') && 
          !isMorningFinished &&
          morningTargetMinutes > 0 &&
          nowTimeMinutes >= morningTargetMinutes && 
          nowTimeMinutes <= morningEndMinutes &&
          lastNotifiedRef.current['morning-session-alert'] !== `${pY}-${pM}-${pD}`
        ) {
          lastNotifiedRef.current['morning-session-alert'] = `${pY}-${pM}-${pD}`;
          triggerMorningNotification();
        } else if (settings.morningAdhkarFollowupEnabled && !isCategoryCompleted('morning') && !isMorningFinished && shouldTriggerNow('morning-adhkar-followup', settings.morningAdhkarEndTime || '10:00')) {
          triggerMorningFollowupNotification();
        }
      }

      // 3. Evening Adhkar Primary Notification & Followup
      if (settings.eveningNotificationsEnabled) {
        const eveningTarget = settings.eveningAdhkarTime || '17:00';
        const eveningTargetMinutes = parseMinutes(eveningTarget);
        const parsedEveningEnd = parseMinutes(settings.eveningAdhkarEndTime);
        const eveningEndMinutes = parsedEveningEnd > 0 
          ? parsedEveningEnd 
          : Math.min(eveningTargetMinutes + 300, 23 * 60 + 59);

        if (shouldTriggerNow('evening-adhkar', eveningTarget)) {
          triggerEveningNotification();
        } else if (
          !isCategoryCompleted('evening') && 
          !isEveningFinished &&
          eveningTargetMinutes > 0 &&
          nowTimeMinutes >= eveningTargetMinutes && 
          nowTimeMinutes <= eveningEndMinutes &&
          lastNotifiedRef.current['evening-session-alert'] !== `${pY}-${pM}-${pD}`
        ) {
          lastNotifiedRef.current['evening-session-alert'] = `${pY}-${pM}-${pD}`;
          triggerEveningNotification();
        } else if (settings.eveningAdhkarFollowupEnabled && !isCategoryCompleted('evening') && !isEveningFinished && shouldTriggerNow('evening-adhkar-followup', settings.eveningAdhkarEndTime || '22:00')) {
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
      const currentDay = localNow.getDay();

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

    // Run immediately on change/mount
    checkAllReminders();

    // Check frequently every 2 seconds so no minute is ever missed
    const interval = setInterval(checkAllReminders, 2000);
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

  // Global on-screen notification trigger event listener (for Adhkar page and components)
  useEffect(() => {
    const handleTriggerScreenNotif = (e: any) => {
      const type = e.detail?.type;
      if (type === 'morning') {
        triggerMorningNotification();
      } else if (type === 'evening') {
        triggerEveningNotification();
      } else if (type === 'prayer') {
        triggerNotification(e.detail?.key || 'Dhuhr', e.detail?.time || '12:00');
      }
    };
    window.addEventListener('trigger-screen-notification', handleTriggerScreenNotif);
    return () => window.removeEventListener('trigger-screen-notification', handleTriggerScreenNotif);
  }, []);

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

    try {
      triggerSafeNotification(`حان الآن موعد صلاة ${PRAYER_NAMES[key]}`, {
        body: `بتوقيت ${time} - أقم صلاتك تنعم بحياتك`,
        icon: '/logo-192.png'
      });
    } catch (e) {}

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
      playNotificationChimeSound();
      triggerHaptic('success');
      const audio = new Audio(getAudioUrl('morning'));
      audio.volume = 0.6;
      audio.play().catch(e => console.log('Morning audio play blocked:', e));
    } catch (e) {
      console.error('Failed to play morning sound:', e);
    }

    try {
      triggerSafeNotification('حان الآن موعد أذكار الصباح 🌅', {
        body: 'ابدأ يومك بالحصن الحصين والذكر المبارك',
        icon: '/logo-192.png'
      });
    } catch (e) {}

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
      playNotificationChimeSound();
      triggerHaptic('light');
      const audio = new Audio(getAudioUrl('morning'));
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } catch (e) {}

    try {
      triggerSafeNotification('تذكير مبارك 🌿: أذكار الصباح', {
        body: 'لم تقرأ أذكار الصباح بعد. اجعل يومك عامراً بذكر الله!',
        icon: '/logo-192.png'
      });
    } catch (e) {}

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
      playNotificationChimeSound();
      triggerHaptic('success');
      const audio = new Audio(getAudioUrl('evening'));
      audio.volume = 0.6;
      audio.play().catch(e => console.log('Evening audio play blocked:', e));
    } catch (e) {
      console.error('Failed to play evening sound:', e);
    }

    try {
      triggerSafeNotification('حان الآن موعد أذكار المساء 🌙', {
        body: 'ختام يومك بالطاعات والذكر الحكيم',
        icon: '/logo-192.png'
      });
    } catch (e) {}

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
      playNotificationChimeSound();
      triggerHaptic('light');
      const audio = new Audio(getAudioUrl('evening'));
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } catch (e) {}

    try {
      triggerSafeNotification('تذكير مبارك 🌙: أذكار المساء', {
        body: 'لم تقرأ أذكار المساء بعد. احفظ ليلتك بالطاعات والذكر!',
        icon: '/logo-192.png'
      });
    } catch (e) {}

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
    {typeof document !== 'undefined' && createPortal(
      <AnimatePresence>
        {activeNotification && (
          <motion.div
            initial={{ opacity: 0, y: -100, scale: 0.9 }}
            animate={{ opacity: 1, y: 16, scale: 1 }}
            exit={{ opacity: 0, y: -100, scale: 0.9 }}
            className="fixed top-0 left-3 right-3 z-[9999999] max-w-md mx-auto pointer-events-auto"
            style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 16px)' }}
          >
            <div className={cn(
              "backdrop-blur-2xl rounded-2xl p-4 shadow-2xl flex items-center justify-between gap-3 text-right border-2 transition-all select-none",
              activeNotification.type === 'morning'
                ? "bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 border-amber-100 shadow-[0_20px_60px_rgba(245,158,11,0.55)] text-slate-950"
                : activeNotification.type === 'evening'
                ? "bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-900 border-indigo-300/80 shadow-[0_20px_60px_rgba(99,102,241,0.55)] text-white"
                : activeNotification.type === 'prayer'
                ? "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 border-emerald-200/80 shadow-[0_20px_60px_rgba(16,185,129,0.55)] text-white"
                : "bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 border-teal-200/80 shadow-2xl text-white"
            )} dir="rtl">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shrink-0",
                  activeNotification.type === 'morning' 
                    ? "bg-white text-amber-600 shadow-amber-900/20" 
                    : "bg-white/20 text-white shadow-black/20"
                )}>
                  {activeNotification.type === 'morning' ? (
                    <Sunrise size={24} className="animate-pulse" />
                  ) : activeNotification.type === 'evening' ? (
                    <Sunset size={24} className="animate-pulse" />
                  ) : (
                    <Bell size={24} className="animate-bounce" />
                  )}
                </div>
                <div className="text-right min-w-0 flex-1">
                  <h4 className={cn(
                    "font-black text-sm tracking-tight leading-tight truncate",
                    activeNotification.type === 'morning' ? "text-slate-950" : "text-white"
                  )}>
                    {activeNotification.name}
                  </h4>
                  {activeNotification.details && (
                    <p className={cn(
                      "text-xs font-bold truncate mt-0.5",
                      activeNotification.type === 'morning' ? "text-slate-900/90" : "text-white/90"
                    )}>
                      {activeNotification.details}
                    </p>
                  )}
                  <p className={cn(
                    "text-[10px] font-black inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full font-mono",
                    activeNotification.type === 'morning' ? "bg-slate-950/15 text-slate-950" : "bg-black/20 text-white"
                  )} dir="ltr">
                    <Clock size={11} />
                    <span>{activeNotification.time}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {activeNotification.route && (
                  <button
                    onClick={() => {
                      const route = activeNotification.route!;
                      setActiveNotification(null);
                      navigate(route);
                    }}
                    className={cn(
                      "font-black text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-lg active:scale-95 transition-all cursor-pointer",
                      activeNotification.type === 'morning'
                        ? "bg-slate-950 hover:bg-slate-900 text-white shadow-slate-950/30"
                        : "bg-white hover:bg-white/90 text-slate-950 shadow-white/20"
                    )}
                  >
                    <span>اقرأ الآن</span>
                    <ArrowRight size={14} className="rotate-180" />
                  </button>
                )}
                <button 
                  onClick={() => setActiveNotification(null)}
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer",
                    activeNotification.type === 'morning'
                      ? "bg-slate-950/10 hover:bg-slate-950/20 text-slate-950"
                      : "bg-white/10 hover:bg-white/20 text-white/80 hover:text-white"
                  )}
                  title="إغلاق التنبيه"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
    )}
    </>
  );
};

