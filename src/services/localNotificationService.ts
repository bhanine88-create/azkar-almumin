import { Capacitor } from '@capacitor/core';
import { 
  LocalNotifications, 
  LocalNotificationSchema, 
  PermissionStatus 
} from '@capacitor/local-notifications';
import { Coordinates, CalculationMethod, PrayerTimes as AdhanTimes, Madhab } from 'adhan';
import { AppSettings } from '../types';
import { safeLocalStorageGetItem } from '../utils/storage';

export const PRAYER_NAMES_AR: Record<string, string> = {
  Fajr: 'الفجر',
  Sunrise: 'الشروق',
  Dhuhr: 'الظهر',
  Asr: 'العصر',
  Maghrib: 'المغرب',
  Isha: 'العشاء'
};

const PRAYER_KEYS_ORDER = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

// Android Notification Channel IDs
export const CHANNELS = {
  PRAYER: 'prayer_times_channel',
  ADHKAR: 'adhkar_channel',
  REMINDERS: 'reminders_channel'
} as const;

let channelsInitialized = false;
let actionListenerRegistered = false;

/**
 * Checks if Capacitor LocalNotifications plugin is available on current platform
 */
export function isLocalNotificationsAvailable(): boolean {
  try {
    return Capacitor.isNativePlatform() && Capacitor.isPluginAvailable('LocalNotifications');
  } catch {
    return false;
  }
}

/**
 * Creates required notification channels on Android 8+
 */
export async function initializeNotificationChannels(): Promise<void> {
  if (!isLocalNotificationsAvailable()) return;
  if (channelsInitialized) return;

  try {
    // 1. Prayer Times Channel (High Importance / Heads-up notification)
    await LocalNotifications.createChannel({
      id: CHANNELS.PRAYER,
      name: 'مواقيت الصلاة والأذان / Prayer Times',
      description: 'تنبيهات فورية لمواقيت الصلوات الخمس وموعد الأذان',
      importance: 5, // MAX importance (pops on screen)
      visibility: 1, // Public on lock screen
      sound: 'beep.wav',
      vibration: true,
      lights: true,
      lightColor: '#10B981'
    });

    // 2. Daily Adhkar Channel (High Importance)
    await LocalNotifications.createChannel({
      id: CHANNELS.ADHKAR,
      name: 'أذكار الصباح والمساء / Daily Adhkar',
      description: 'تذكير ورد أذكار الصباح وأذكار المساء والتحصين اليومي',
      importance: 4, // HIGH importance
      visibility: 1,
      sound: 'beep.wav',
      vibration: true,
      lights: true,
      lightColor: '#0D9488'
    });

    // 3. Reminders & Sunnah Channel
    await LocalNotifications.createChannel({
      id: CHANNELS.REMINDERS,
      name: 'التذكيرات والسنن / Reminders & Sunnah',
      description: 'تذكير قيام الليل وسنن الرواتب والتذكيرات المخصصة',
      importance: 4,
      visibility: 1,
      sound: 'beep.wav',
      vibration: true,
      lights: true,
      lightColor: '#F59E0B'
    });

    channelsInitialized = true;
  } catch (err) {
    console.warn('[LocalNotifications] Failed to create notification channels:', err);
  }
}

/**
 * Checks current notification permission state
 */
export async function checkLocalNotificationPermissions(): Promise<PermissionStatus> {
  if (!isLocalNotificationsAvailable()) {
    return { display: 'denied' };
  }
  try {
    return await LocalNotifications.checkPermissions();
  } catch (err) {
    console.warn('[LocalNotifications] checkPermissions error:', err);
    return { display: 'prompt' };
  }
}

/**
 * Requests permission to schedule and display local notifications
 */
export async function requestLocalNotificationPermissions(): Promise<PermissionStatus> {
  if (!isLocalNotificationsAvailable()) {
    // Fallback to web notification permission request if available
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const webPerm = await Notification.requestPermission();
        return { display: webPerm === 'granted' ? 'granted' : 'denied' };
      } catch (e) {
        console.warn('Web notification request failed:', e);
      }
    }
    return { display: 'denied' };
  }

  try {
    await initializeNotificationChannels();
    const status = await LocalNotifications.requestPermissions();
    return status;
  } catch (err) {
    console.warn('[LocalNotifications] requestPermissions error:', err);
    return { display: 'denied' };
  }
}

/**
 * Maps method value to adhan CalculationMethod
 */
function getCalculationMethod(methodValue: string) {
  switch (methodValue) {
    case '1': return CalculationMethod.Egyptian();
    case '2': return CalculationMethod.NorthAmerica();
    case '3': return CalculationMethod.MuslimWorldLeague();
    case '4': return CalculationMethod.UmmAlQura();
    case '5': return CalculationMethod.Egyptian();
    case '8': return CalculationMethod.Dubai();
    case '9': return CalculationMethod.Kuwait();
    case '10': return CalculationMethod.Qatar();
    case '11': return CalculationMethod.Singapore();
    case '12': return CalculationMethod.Turkey();
    default: return CalculationMethod.MuslimWorldLeague();
  }
}

/**
 * Calculates exact prayer date-times for a specific day using offline Adhan library
 */
function calculatePrayerTimesForDate(
  date: Date,
  lat: number,
  lng: number,
  method: string,
  asrMethod: string,
  offsets: Record<string, number> = {},
  daylightSaving: boolean = false
): Record<string, Date> {
  const coordinates = new Coordinates(lat, lng);
  const params = getCalculationMethod(method);
  params.madhab = asrMethod === '1' ? Madhab.Hanafi : Madhab.Shafi;

  const adhan = new AdhanTimes(coordinates, date, params);

  const rawTimes: Record<string, Date> = {
    Fajr: adhan.fajr,
    Sunrise: adhan.sunrise,
    Dhuhr: adhan.dhuhr,
    Asr: adhan.asr,
    Maghrib: adhan.maghrib,
    Isha: adhan.isha,
  };

  const results: Record<string, Date> = {};

  Object.entries(rawTimes).forEach(([key, d]) => {
    if (!d || isNaN(d.getTime())) return;
    const adjusted = new Date(d.getTime());
    if (offsets[key]) {
      adjusted.setMinutes(adjusted.getMinutes() + offsets[key]);
    }
    if (daylightSaving) {
      adjusted.setHours(adjusted.getHours() + 1);
    }
    results[key] = adjusted;
  });

  return results;
}

/**
 * Parses time string 'HH:mm' to Date for a given base date
 */
function parseTimeToDate(timeStr: string, baseDate: Date): Date {
  const [h, m] = timeStr.split(':').map(Number);
  const result = new Date(baseDate);
  result.setHours(h || 0, m || 0, 0, 0);
  return result;
}

/**
 * Synchronizes and schedules all upcoming local notifications for Prayers and Daily Adhkar
 * Schedules up to 7 days in advance so notifications fire reliably even when the device is offline,
 * app is in the background, or device enters Doze mode.
 */
export async function syncAllLocalNotifications(
  settings: AppSettings
): Promise<{ success: boolean; scheduledCount: number; message?: string }> {
  if (!isLocalNotificationsAvailable()) {
    return { success: false, scheduledCount: 0, message: 'Capacitor LocalNotifications not available on this platform' };
  }

  try {
    await initializeNotificationChannels();

    // Check permissions
    const perm = await LocalNotifications.checkPermissions();
    if (perm.display !== 'granted') {
      const req = await LocalNotifications.requestPermissions();
      if (req.display !== 'granted') {
        return { success: false, scheduledCount: 0, message: 'Notification permissions not granted' };
      }
    }

    // Cancel all previously scheduled notifications to avoid duplicates and outdated times
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel({
        notifications: pending.notifications.map(n => ({ id: n.id }))
      });
    }

    // If master notifications disabled, we stop here (notifications are cleanly cancelled)
    if (!settings.notificationsEnabled) {
      return { success: true, scheduledCount: 0, message: 'Notifications are disabled by user settings' };
    }

    const now = new Date();
    const nowTime = now.getTime();
    const notificationsToSchedule: LocalNotificationSchema[] = [];

    // Coordinates for prayer calculations
    const savedLat = parseFloat(safeLocalStorageGetItem('prayer_lat') || '21.4225'); // Default: Mecca
    const savedLng = parseFloat(safeLocalStorageGetItem('prayer_lng') || '39.8262');
    const calcMethod = settings.prayerCalcMethod || safeLocalStorageGetItem('prayer_method') || '4';
    const asrMethod = settings.prayerAsrMethod || safeLocalStorageGetItem('prayer_asr_method') || '0';
    const offsets = settings.prayerOffsets || {};
    const daylightSaving = !!settings.prayerDaylightSaving;

    // Schedule for the next 7 days (day 0 = today, day 1 = tomorrow, ..., day 6)
    const DAYS_TO_SCHEDULE = 7;

    for (let dayOffset = 0; dayOffset < DAYS_TO_SCHEDULE; dayOffset++) {
      const targetDay = new Date(now);
      targetDay.setDate(targetDay.getDate() + dayOffset);

      // ==========================================
      // 1. PRAYER TIMES NOTIFICATIONS
      // ==========================================
      if (settings.prayerNotificationsEnabled) {
        const prayerDates = calculatePrayerTimesForDate(
          targetDay,
          savedLat,
          savedLng,
          calcMethod,
          asrMethod,
          offsets,
          daylightSaving
        );

        PRAYER_KEYS_ORDER.forEach((prayerKey, pIdx) => {
          // Check if enabled (defaults to true for 5 main prayers)
          const isEnabled = settings.prayerNotificationSettings 
            ? settings.prayerNotificationSettings[prayerKey] !== false
            : prayerKey !== 'Sunrise';

          if (!isEnabled) return;

          const prayerDate = prayerDates[prayerKey];
          // Only schedule if future (at least 30 seconds ahead)
          if (prayerDate && prayerDate.getTime() > nowTime + 30000) {
            const prayerNameAr = PRAYER_NAMES_AR[prayerKey] || prayerKey;
            const notifId = 10000 + (dayOffset * 10) + pIdx;

            const timeStr = `${prayerDate.getHours().toString().padStart(2, '0')}:${prayerDate.getMinutes().toString().padStart(2, '0')}`;

            notificationsToSchedule.push({
              id: notifId,
              title: `حان الآن موعد صلاة ${prayerNameAr}`,
              body: `حي على الصلاة، حي على الفلاح • بتوقيت ${timeStr} • أقم صلاتك تنعم بحياتك`,
              schedule: {
                at: prayerDate,
                allowWhileIdle: true // Crucial for Android Doze mode
              },
              channelId: CHANNELS.PRAYER,
              sound: 'beep.wav',
              autoCancel: true,
              extra: {
                route: '/prayer',
                type: 'prayer',
                prayerKey,
                time: timeStr
              }
            });
          }
        });
      }

      // ==========================================
      // 2. MORNING ADHKAR PRIMARY NOTIFICATION
      // ==========================================
      if (settings.morningNotificationsEnabled) {
        const morningTimeStr = settings.morningAdhkarTime || '06:00';
        const morningDate = parseTimeToDate(morningTimeStr, targetDay);

        if (morningDate.getTime() > nowTime + 30000) {
          notificationsToSchedule.push({
            id: 1000 + dayOffset,
            title: 'أذكار الصباح 🌅',
            body: 'أصبحنا وأصبح الملك لله ﷻ • حصّن يومك بالأذكار المأثورة وانعم بالحفظ والتوفيق',
            schedule: {
              at: morningDate,
              allowWhileIdle: true
            },
            channelId: CHANNELS.ADHKAR,
            sound: 'beep.wav',
            autoCancel: true,
            extra: {
              route: '/adhkar/morning',
              type: 'adhkar',
              category: 'morning'
            }
          });
        }

        // Morning Follow-up (if enabled)
        if (settings.morningAdhkarFollowupEnabled) {
          const morningEndTimeStr = settings.morningAdhkarEndTime || '10:00';
          const morningEndDate = parseTimeToDate(morningEndTimeStr, targetDay);

          if (morningEndDate.getTime() > nowTime + 30000) {
            notificationsToSchedule.push({
              id: 1100 + dayOffset,
              title: 'تذكير مبارك 🌿: أذكار الصباح',
              body: 'لا تفوت بركة الصباح وحفظ الله لك • اقرأ وردك من أذكار الصباح',
              schedule: {
                at: morningEndDate,
                allowWhileIdle: true
              },
              channelId: CHANNELS.ADHKAR,
              sound: 'beep.wav',
              autoCancel: true,
              extra: {
                route: '/adhkar/morning',
                type: 'adhkar',
                category: 'morning'
              }
            });
          }
        }
      }

      // ==========================================
      // 3. EVENING ADHKAR PRIMARY NOTIFICATION
      // ==========================================
      if (settings.eveningNotificationsEnabled) {
        const eveningTimeStr = settings.eveningAdhkarTime || '17:30';
        const eveningDate = parseTimeToDate(eveningTimeStr, targetDay);

        if (eveningDate.getTime() > nowTime + 30000) {
          notificationsToSchedule.push({
            id: 1200 + dayOffset,
            title: 'أذكار المساء 🌙',
            body: 'أمسينا وأمسى الملك لله ﷻ • حصّن ليلتك بأذكار المساء والتعويذات النبوية',
            schedule: {
              at: eveningDate,
              allowWhileIdle: true
            },
            channelId: CHANNELS.ADHKAR,
            sound: 'beep.wav',
            autoCancel: true,
            extra: {
              route: '/adhkar/evening',
              type: 'adhkar',
              category: 'evening'
            }
          });
        }

        // Evening Follow-up (if enabled)
        if (settings.eveningAdhkarFollowupEnabled) {
          const eveningEndTimeStr = settings.eveningAdhkarEndTime || '21:30';
          const eveningEndDate = parseTimeToDate(eveningEndTimeStr, targetDay);

          if (eveningEndDate.getTime() > nowTime + 30000) {
            notificationsToSchedule.push({
              id: 1300 + dayOffset,
              title: 'تذكير مبارك 🌙: أذكار المساء',
              body: 'اجعل ختام يومك مباركاً بذكر الله • أتمم أذكار المساء قبل النوم',
              schedule: {
                at: eveningEndDate,
                allowWhileIdle: true
              },
              channelId: CHANNELS.ADHKAR,
              sound: 'beep.wav',
              autoCancel: true,
              extra: {
                route: '/adhkar/evening',
                type: 'adhkar',
                category: 'evening'
              }
            });
          }
        }
      }

      // ==========================================
      // 4. SUNNAH / QIYAM AL-LAYL REMINDER
      // ==========================================
      if (settings.sunnahReminderEnabled) {
        const sunnahTimeStr = settings.sunnahReminderTime || '22:30';
        const sunnahDate = parseTimeToDate(sunnahTimeStr, targetDay);

        if (sunnahDate.getTime() > nowTime + 30000) {
          notificationsToSchedule.push({
            id: 1400 + dayOffset,
            title: 'قيام الليل والوتر 🌟',
            body: 'أقرب ما يكون الرب من العبد في جوف الليل الآخر • صلِّ ركعتين واختم بالوتر',
            schedule: {
              at: sunnahDate,
              allowWhileIdle: true
            },
            channelId: CHANNELS.REMINDERS,
            sound: 'beep.wav',
            autoCancel: true,
            extra: {
              route: '/insights',
              type: 'sunnah'
            }
          });
        }
      }
    }

    // ==========================================
    // 5. CUSTOM USER REMINDERS
    // ==========================================
    if (settings.reminders && settings.reminders.length > 0) {
      settings.reminders.forEach((reminder, rIdx) => {
        if (!reminder.enabled) return;

        for (let dayOffset = 0; dayOffset < DAYS_TO_SCHEDULE; dayOffset++) {
          const targetDay = new Date(now);
          targetDay.setDate(targetDay.getDate() + dayOffset);
          const dayOfWeek = targetDay.getDay();

          if (reminder.days.includes(dayOfWeek)) {
            const reminderDate = parseTimeToDate(reminder.time, targetDay);
            if (reminderDate.getTime() > nowTime + 30000) {
              notificationsToSchedule.push({
                id: 2000 + (rIdx * 10) + dayOffset,
                title: reminder.label || 'تذكير مبارك 🔔',
                body: 'موعد تذكيرك الإيماني المخصص في أذكار المؤمن',
                schedule: {
                  at: reminderDate,
                  allowWhileIdle: true
                },
                channelId: CHANNELS.REMINDERS,
                sound: 'beep.wav',
                autoCancel: true,
                extra: {
                  route: '/settings',
                  type: 'custom',
                  reminderId: reminder.id
                }
              });
            }
          }
        }
      });
    }

    // Execute scheduling in batches if necessary
    if (notificationsToSchedule.length > 0) {
      await LocalNotifications.schedule({
        notifications: notificationsToSchedule
      });
    }

    return {
      success: true,
      scheduledCount: notificationsToSchedule.length,
      message: `تمت جدولة ${notificationsToSchedule.length} إشعاراً محلياً بنجاح في نظام التشغيل للأيام القادمة.`
    };
  } catch (err: any) {
    console.error('[LocalNotifications] Error during syncAllLocalNotifications:', err);
    return {
      success: false,
      scheduledCount: 0,
      message: err?.message || 'Failed to schedule local notifications'
    };
  }
}

/**
 * Schedules an immediate test local notification (fires in X seconds)
 * Useful for users and developers to test background notification delivery
 */
export async function testLocalNotification(
  type: 'prayer' | 'adhkar' | 'sunnah' = 'prayer',
  delaySeconds: number = 3
): Promise<{ success: boolean; message: string }> {
  if (!isLocalNotificationsAvailable()) {
    // Fallback: Web Notification test
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification('اختبار إشعار أذكار المؤمن 🌟', {
          body: 'تم استلام الإشعار بنجاح! نظام التنبيهات يعمل بصورة مثالية.',
          icon: '/logo-192.png'
        });
        return { success: true, message: 'تم إرسال إشعار ويب تجريبي' };
      } catch {
        return { success: false, message: 'فشل إرسال إشعار الويب' };
      }
    }
    return { success: false, message: 'الإشعارات المحلية الخاصة بـ Capacitor غير مدعومة على متصفح الويب الحالي.' };
  }

  try {
    await initializeNotificationChannels();

    const perm = await requestLocalNotificationPermissions();
    if (perm.display !== 'granted') {
      return { success: false, message: 'لم يتم منح إذن الإشعارات من النظام.' };
    }

    const triggerAt = new Date(Date.now() + delaySeconds * 1000);
    const testId = 9999;

    let title = 'أذكار المؤمن: اختبار الإشعار المحلي 🔔';
    let body = 'هذا إشعار تجريبي للتأكد من وصول التنبيهات في الخلفية حتى عند إغلاق التطبيق!';
    let channelId: string = CHANNELS.PRAYER;
    let route = '/';

    if (type === 'prayer') {
      title = 'اختبار أذان الصلاة 🕌';
      body = 'حان الآن موعد صلاة الظهر • حي على الصلاة، حي على الفلاح';
      channelId = CHANNELS.PRAYER;
      route = '/prayer';
    } else if (type === 'adhkar') {
      title = 'اختبار أذكار الصباح والمساء 🌅';
      body = 'أصبحنا وأصبح الملك لله • لا تنسَ وردك اليومي من الأذكار';
      channelId = CHANNELS.ADHKAR;
      route = '/adhkar/morning';
    } else if (type === 'sunnah') {
      title = 'اختبار تذكير قيام الليل 🌟';
      body = 'أقرب ما يكون الرب من العبد في جوف الليل الآخر • صلاة الوتر';
      channelId = CHANNELS.REMINDERS;
      route = '/insights';
    }

    await LocalNotifications.schedule({
      notifications: [
        {
          id: testId,
          title,
          body,
          schedule: {
            at: triggerAt,
            allowWhileIdle: true
          },
          channelId,
          sound: 'beep.wav',
          autoCancel: true,
          extra: {
            route,
            type: 'test'
          }
        }
      ]
    });

    return {
      success: true,
      message: `تمت جدولة الإشعار التجريبي! سيصلك خلال ${delaySeconds} ثوانٍ (يمكنك قفل الهاتف أو تصغير التطبيق لتجربته في الخلفية).`
    };
  } catch (err: any) {
    console.error('[LocalNotifications] Test notification error:', err);
    return { success: false, message: err?.message || 'تعذر إرسال الإشعار التجريبي' };
  }
}

/**
 * Registers deep link action listener when user taps a notification
 */
export function registerNotificationActionListener(
  onNavigate: (route: string) => void
): void {
  if (!isLocalNotificationsAvailable()) return;
  if (actionListenerRegistered) return;

  try {
    LocalNotifications.addListener('localNotificationActionPerformed', (action) => {
      const route = action.notification.extra?.route;
      if (route && typeof route === 'string') {
        onNavigate(route);
      }
    });

    actionListenerRegistered = true;
  } catch (err) {
    console.warn('[LocalNotifications] Could not register action listener:', err);
  }
}

/**
 * Returns diagnostic summary of scheduled local notifications
 */
export async function getPendingNotificationsSummary(): Promise<{
  totalPending: number;
  prayerCount: number;
  adhkarCount: number;
  remindersCount: number;
  nextScheduled?: { id: number; title: string; time: string; route?: string };
}> {
  if (!isLocalNotificationsAvailable()) {
    return { totalPending: 0, prayerCount: 0, adhkarCount: 0, remindersCount: 0 };
  }

  try {
    const pending = await LocalNotifications.getPending();
    const list = pending.notifications || [];

    let prayerCount = 0;
    let adhkarCount = 0;
    let remindersCount = 0;
    let nextScheduled: any = null;

    let earliestTime = Infinity;

    list.forEach(item => {
      if (item.id >= 10000) prayerCount++;
      else if (item.id >= 1000 && item.id < 2000) adhkarCount++;
      else remindersCount++;

      const at = item.schedule?.at;
      if (at) {
        const timeMs = at instanceof Date ? at.getTime() : new Date(at).getTime();
        if (timeMs < earliestTime) {
          earliestTime = timeMs;
          nextScheduled = {
            id: item.id,
            title: item.title,
            time: new Date(timeMs).toLocaleString('ar-SA'),
            route: item.extra?.route
          };
        }
      }
    });

    return {
      totalPending: list.length,
      prayerCount,
      adhkarCount,
      remindersCount,
      nextScheduled
    };
  } catch (err) {
    console.warn('[LocalNotifications] getPending error:', err);
    return { totalPending: 0, prayerCount: 0, adhkarCount: 0, remindersCount: 0 };
  }
}
