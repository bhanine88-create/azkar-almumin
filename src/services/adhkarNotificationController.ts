import { AppSettings } from '../types';
import { safeLocalStorageGetItem, safeLocalStorageSetItem, safeLocalStorageRemoveItem } from '../utils/storage';
import { 
  isLocalNotificationsAvailable, 
  syncAllLocalNotifications, 
  CHANNELS, 
  initializeNotificationChannels 
} from './localNotificationService';
import { LocalNotifications } from '@capacitor/local-notifications';

export interface AdhkarTriggerStatus {
  category: 'morning' | 'evening';
  scheduledTime: string;
  endTime: string;
  isEnabled: boolean;
  isFollowupEnabled: boolean;
  isWithinWindow: boolean;
  isWindowPassed: boolean;
  isCompletedToday: boolean;
  isTriggerSuppressedToday: boolean;
  isMissed: boolean;
}

export interface StartupVerificationResult {
  timestamp: number;
  dateStr: string; // YYYY-MM-DD
  defaultsEnforced: boolean;
  missedTriggersReset: string[];
  osNotificationsRescheduled: boolean;
  pendingOsNotificationCount: number;
  morningStatus: AdhkarTriggerStatus;
  eveningStatus: AdhkarTriggerStatus;
}

const DEFAULTS_ENFORCEMENT_KEY = 'believer_adhkar_defaults_v5_active';
const LAST_VERIFIED_DATE_KEY = 'believer_adhkar_last_verified_date';
const SUPPRESSION_PREFIX = 'believer_adhkar_suppress_';

// Default configuration constants
export const DEFAULT_MORNING_TIME = '06:00';
export const DEFAULT_MORNING_END_TIME = '10:00';
export const DEFAULT_EVENING_TIME = '17:30';
export const DEFAULT_EVENING_END_TIME = '22:00';

/**
 * Normalizes 'HH:mm' time strings (pads with leading zeros)
 */
export function normalizeTimeStr(t?: string, defaultVal: string = '00:00'): string {
  if (!t || typeof t !== 'string') return defaultVal;
  const parts = t.trim().split(':');
  if (parts.length < 2) return defaultVal;
  const h = parts[0].padStart(2, '0');
  const m = parts[1].padStart(2, '0');
  return `${h}:${m}`;
}

/**
 * Converts 'HH:mm' string to total minutes since midnight
 */
export function timeStrToMinutes(timeStr?: string, defaultMinutes: number = 0): number {
  if (!timeStr) return defaultMinutes;
  const [h, m] = normalizeTimeStr(timeStr).split(':').map(Number);
  return (isNaN(h) ? 0 : h) * 60 + (isNaN(m) ? 0 : m);
}

/**
 * Gets formatted current date string YYYY-MM-DD in local time
 */
export function getLocalDateString(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Central Controller for Morning and Evening Adhkar Notifications
 */
export class AdhkarNotificationController {
  private static instance: AdhkarNotificationController;
  private memorySuppression: Record<string, string> = {};
  private isVerifying: boolean = false;
  private lastVerificationTime: number = 0;

  private constructor() {
    // Singleton
  }

  public static getInstance(): AdhkarNotificationController {
    if (!AdhkarNotificationController.instance) {
      AdhkarNotificationController.instance = new AdhkarNotificationController();
    }
    return AdhkarNotificationController.instance;
  }

  /**
   * 1. ENSURES MORNING & EVENING ADHKAR NOTIFICATIONS ARE ACTIVE BY DEFAULT
   * 
   * Enforces that notification settings are guaranteed enabled by default for all users,
   * setting default morning (06:00) and evening (17:30) times, follow-ups, and master toggles.
   */
  public ensureDefaultsActive(settings: AppSettings): { updatedSettings: AppSettings; wasChanged: boolean } {
    let wasChanged = false;
    const isEnforcedBefore = safeLocalStorageGetItem(DEFAULTS_ENFORCEMENT_KEY) === 'true';

    const updated: AppSettings = { ...settings };

    // Master notifications enabled check
    if (updated.notificationsEnabled === undefined || (!isEnforcedBefore && updated.notificationsEnabled === false)) {
      updated.notificationsEnabled = true;
      wasChanged = true;
    }

    // Morning notifications enabled check
    if (updated.morningNotificationsEnabled === undefined || (!isEnforcedBefore && updated.morningNotificationsEnabled === false)) {
      updated.morningNotificationsEnabled = true;
      wasChanged = true;
    }

    // Evening notifications enabled check
    if (updated.eveningNotificationsEnabled === undefined || (!isEnforcedBefore && updated.eveningNotificationsEnabled === false)) {
      updated.eveningNotificationsEnabled = true;
      wasChanged = true;
    }

    // Morning follow-up enabled check
    if (updated.morningAdhkarFollowupEnabled === undefined) {
      updated.morningAdhkarFollowupEnabled = true;
      wasChanged = true;
    }

    // Evening follow-up enabled check
    if (updated.eveningAdhkarFollowupEnabled === undefined) {
      updated.eveningAdhkarFollowupEnabled = true;
      wasChanged = true;
    }

    // Ensure valid scheduled times
    if (!updated.morningAdhkarTime) {
      updated.morningAdhkarTime = DEFAULT_MORNING_TIME;
      wasChanged = true;
    }
    if (!updated.morningAdhkarEndTime) {
      updated.morningAdhkarEndTime = DEFAULT_MORNING_END_TIME;
      wasChanged = true;
    }
    if (!updated.eveningAdhkarTime) {
      updated.eveningAdhkarTime = DEFAULT_EVENING_TIME;
      wasChanged = true;
    }
    if (!updated.eveningAdhkarEndTime) {
      updated.eveningAdhkarEndTime = DEFAULT_EVENING_END_TIME;
      wasChanged = true;
    }

    // Mark enforcement done
    if (!isEnforcedBefore || wasChanged) {
      safeLocalStorageSetItem(DEFAULTS_ENFORCEMENT_KEY, 'true');
    }

    return { updatedSettings: updated, wasChanged };
  }

  /**
   * 2. CHECKS IF CURRENT TIME IS WITHIN THE ACTIVE ADHKAR WINDOW
   */
  public isWithinWindow(category: 'morning' | 'evening', settings: AppSettings, now: Date = new Date()): boolean {
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    if (category === 'morning') {
      const start = timeStrToMinutes(settings.morningAdhkarTime, timeStrToMinutes(DEFAULT_MORNING_TIME));
      const end = timeStrToMinutes(settings.morningAdhkarEndTime, timeStrToMinutes(DEFAULT_MORNING_END_TIME));
      return nowMinutes >= start && nowMinutes <= end;
    } else {
      const start = timeStrToMinutes(settings.eveningAdhkarTime, timeStrToMinutes(DEFAULT_EVENING_TIME));
      const end = timeStrToMinutes(settings.eveningAdhkarEndTime, timeStrToMinutes(DEFAULT_EVENING_END_TIME));
      return nowMinutes >= start && nowMinutes <= end;
    }
  }

  /**
   * 3. CHECKS IF ADHKAR WINDOW HAS PASSED FOR TODAY
   */
  public isWindowPassed(category: 'morning' | 'evening', settings: AppSettings, now: Date = new Date()): boolean {
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    if (category === 'morning') {
      const end = timeStrToMinutes(settings.morningAdhkarEndTime, timeStrToMinutes(DEFAULT_MORNING_END_TIME));
      return nowMinutes > end;
    } else {
      const end = timeStrToMinutes(settings.eveningAdhkarEndTime, timeStrToMinutes(DEFAULT_EVENING_END_TIME));
      return nowMinutes > end;
    }
  }

  /**
   * 4. EVALUATES WHETHER A TRIGGER WAS MISSED
   * 
   * A trigger is considered missed if:
   * - Notifications are enabled for this category
   * - User has NOT completed the category today
   * - The scheduled notification start time has already passed
   * - The active window is still open (or was missed earlier during sleep/closed app)
   */
  public isTriggerMissed(
    category: 'morning' | 'evening', 
    settings: AppSettings, 
    isCompletedToday: boolean,
    now: Date = new Date()
  ): boolean {
    const isEnabled = category === 'morning' 
      ? (settings.notificationsEnabled && settings.morningNotificationsEnabled)
      : (settings.notificationsEnabled && settings.eveningNotificationsEnabled);

    if (!isEnabled || isCompletedToday) return false;

    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const startTimeStr = category === 'morning' ? settings.morningAdhkarTime : settings.eveningAdhkarTime;
    const startMinutes = timeStrToMinutes(startTimeStr, category === 'morning' ? 360 : 1050);

    // If current time is past the start time and within the window
    const inWindow = this.isWithinWindow(category, settings, now);
    return inWindow && nowMinutes > startMinutes;
  }

  /**
   * 5. RESETS MISSED TRIGGER SUPPRESSION KEYS
   * 
   * Clears any stored suppression flags in local storage and in-memory cache
   * so the notification trigger is immediately armed and eligible to notify the user.
   */
  public resetTriggerSuppression(category?: 'morning' | 'evening'): string[] {
    const resetKeys: string[] = [];
    const today = getLocalDateString();

    const keysToClear = category === 'morning' 
      ? ['morning-adhkar', 'morning-adhkar-followup', 'morning-session-alert']
      : category === 'evening'
      ? ['evening-adhkar', 'evening-adhkar-followup', 'evening-session-alert']
      : [
          'morning-adhkar', 'morning-adhkar-followup', 'morning-session-alert',
          'evening-adhkar', 'evening-adhkar-followup', 'evening-session-alert'
        ];

    keysToClear.forEach(k => {
      // Clear memory cache
      if (this.memorySuppression[k]) {
        delete this.memorySuppression[k];
        resetKeys.push(k);
      }
      // Clear persistent storage
      const storeKey = `${SUPPRESSION_PREFIX}${k}`;
      const storedVal = safeLocalStorageGetItem(storeKey);
      if (storedVal) {
        safeLocalStorageRemoveItem(storeKey);
        if (!resetKeys.includes(k)) resetKeys.push(k);
      }
    });

    // Also clear user progress notification markers if from previous days
    const lastResetDate = safeLocalStorageGetItem(LAST_VERIFIED_DATE_KEY);
    if (lastResetDate !== today) {
      safeLocalStorageRemoveItem('believer_last_notified_morning');
      safeLocalStorageRemoveItem('believer_last_notified_evening');
      safeLocalStorageSetItem(LAST_VERIFIED_DATE_KEY, today);
    }

    return resetKeys;
  }

  /**
   * 6. MARKS A TRIGGER AS FIRED FOR TODAY
   */
  public markTriggerFired(key: string, dateStr: string = getLocalDateString()): void {
    this.memorySuppression[key] = dateStr;
    safeLocalStorageSetItem(`${SUPPRESSION_PREFIX}${key}`, dateStr);
  }

  /**
   * 7. CHECKS IF A TRIGGER IS SUPPRESSED TODAY
   */
  public isTriggerSuppressed(key: string, dateStr: string = getLocalDateString()): boolean {
    if (this.memorySuppression[key] === dateStr) return true;
    const stored = safeLocalStorageGetItem(`${SUPPRESSION_PREFIX}${key}`);
    if (stored === dateStr) {
      this.memorySuppression[key] = dateStr;
      return true;
    }
    return false;
  }

  /**
   * 8. GET DETAILED ADHKAR TRIGGER STATUS
   */
  public getTriggerStatus(
    category: 'morning' | 'evening',
    settings: AppSettings,
    isCompletedToday: boolean = false,
    now: Date = new Date()
  ): AdhkarTriggerStatus {
    const isMorning = category === 'morning';
    const scheduledTime = isMorning ? (settings.morningAdhkarTime || DEFAULT_MORNING_TIME) : (settings.eveningAdhkarTime || DEFAULT_EVENING_TIME);
    const endTime = isMorning ? (settings.morningAdhkarEndTime || DEFAULT_MORNING_END_TIME) : (settings.eveningAdhkarEndTime || DEFAULT_EVENING_END_TIME);
    const isEnabled = isMorning ? (!!settings.morningNotificationsEnabled) : (!!settings.eveningNotificationsEnabled);
    const isFollowupEnabled = isMorning ? (!!settings.morningAdhkarFollowupEnabled) : (!!settings.eveningAdhkarFollowupEnabled);

    const isWithin = this.isWithinWindow(category, settings, now);
    const isPassed = this.isWindowPassed(category, settings, now);
    const isSuppressed = this.isTriggerSuppressed(`${category}-session-alert`);
    const isMissed = this.isTriggerMissed(category, settings, isCompletedToday, now);

    return {
      category,
      scheduledTime,
      endTime,
      isEnabled,
      isFollowupEnabled,
      isWithinWindow: isWithin,
      isWindowPassed: isPassed,
      isCompletedToday,
      isTriggerSuppressedToday: isSuppressed,
      isMissed
    };
  }

  /**
   * 9. SILENT VERIFICATION LOGIC AT STARTUP
   * 
   * Runs completely silently when the app mounts or resumes:
   * 1. Guarantees Morning and Evening notifications defaults are active
   * 2. Detects day rollovers and wipes stale suppression markers
   * 3. Detects missed notification triggers in the active window and resets them
   * 4. Silently verifies that OS LocalNotifications (Capacitor) are scheduled for the next 7 days
   * 5. Returns a detailed verification result without throwing or alerting the user
   */
  public async verifyAndResetAtStartup(
    settings: AppSettings,
    options?: {
      isCategoryCompleted?: (category: string) => boolean;
      onTriggerRecovery?: (category: 'morning' | 'evening', reason: string) => void;
      updateSettings?: (newSettings: Partial<AppSettings>) => void;
      forceResync?: boolean;
    }
  ): Promise<StartupVerificationResult> {
    if (this.isVerifying) {
      // Debounce concurrent runs within 2 seconds
      if (Date.now() - this.lastVerificationTime < 2000) {
        return this.generateVerificationReport(settings, false, [], false, 0, options?.isCategoryCompleted);
      }
    }

    this.isVerifying = true;
    this.lastVerificationTime = Date.now();

    try {
      const now = new Date();
      const today = getLocalDateString(now);
      const lastVerifiedDate = safeLocalStorageGetItem(LAST_VERIFIED_DATE_KEY);
      const isNewDay = lastVerifiedDate !== today;

      // 1. Ensure defaults are active
      const { updatedSettings, wasChanged } = this.ensureDefaultsActive(settings);
      if (wasChanged && options?.updateSettings) {
        try {
          options.updateSettings({
            notificationsEnabled: updatedSettings.notificationsEnabled,
            morningNotificationsEnabled: updatedSettings.morningNotificationsEnabled,
            eveningNotificationsEnabled: updatedSettings.eveningNotificationsEnabled,
            morningAdhkarFollowupEnabled: updatedSettings.morningAdhkarFollowupEnabled,
            eveningAdhkarFollowupEnabled: updatedSettings.eveningAdhkarFollowupEnabled,
            morningAdhkarTime: updatedSettings.morningAdhkarTime,
            morningAdhkarEndTime: updatedSettings.morningAdhkarEndTime,
            eveningAdhkarTime: updatedSettings.eveningAdhkarTime,
            eveningAdhkarEndTime: updatedSettings.eveningAdhkarEndTime,
          });
        } catch (e) {
          console.debug('[AdhkarNotificationController] updateSettings silent error:', e);
        }
      }

      // 2. Day Rollover: Clear suppression from previous days
      const resetTriggers: string[] = [];
      if (isNewDay) {
        const cleared = this.resetTriggerSuppression();
        resetTriggers.push(...cleared);
        safeLocalStorageSetItem(LAST_VERIFIED_DATE_KEY, today);
      }

      // 3. Status check for active window (without firing retroactive disruptive alarms)
      const isMorningCompleted = options?.isCategoryCompleted ? options.isCategoryCompleted('morning') : false;
      const isEveningCompleted = options?.isCategoryCompleted ? options.isCategoryCompleted('evening') : false;

      const isMorningMissed = this.isTriggerMissed('morning', updatedSettings, isMorningCompleted, now);
      const isEveningMissed = this.isTriggerMissed('evening', updatedSettings, isEveningCompleted, now);

      if (isMorningMissed) {
        resetTriggers.push('morning-status-missed');
      }

      if (isEveningMissed) {
        resetTriggers.push('evening-status-missed');
      }

      // 4. Verify OS Background Local Notifications
      let osRescheduled = false;
      let pendingCount = 0;

      if (isLocalNotificationsAvailable()) {
        try {
          await initializeNotificationChannels();
          const pending = await LocalNotifications.getPending();
          pendingCount = pending.notifications.length;

          // Check if morning IDs (1000..1006) and evening IDs (1200..1206) exist in pending queue
          const hasMorningScheduled = pending.notifications.some(n => n.id >= 1000 && n.id <= 1006);
          const hasEveningScheduled = pending.notifications.some(n => n.id >= 1200 && n.id <= 1206);

          const needsReschedule = options?.forceResync || 
            pendingCount === 0 || 
            !hasMorningScheduled || 
            !hasEveningScheduled;

          if (needsReschedule && updatedSettings.notificationsEnabled) {
            // Silently reschedule for next 7 days without popping permission prompt
            const syncResult = await syncAllLocalNotifications(updatedSettings, { mayRequestPermission: false });
            if (syncResult.success) {
              osRescheduled = true;
              pendingCount = syncResult.scheduledCount;
            }
          }
        } catch (osErr) {
          console.debug('[AdhkarNotificationController] Silent OS verification check:', osErr);
        }
      }

      return this.generateVerificationReport(
        updatedSettings, 
        wasChanged, 
        resetTriggers, 
        osRescheduled, 
        pendingCount, 
        options?.isCategoryCompleted,
        now
      );
    } finally {
      this.isVerifying = false;
    }
  }

  private generateVerificationReport(
    settings: AppSettings,
    defaultsEnforced: boolean,
    missedTriggersReset: string[],
    osNotificationsRescheduled: boolean,
    pendingOsNotificationCount: number,
    isCategoryCompletedFn?: (category: string) => boolean,
    now: Date = new Date()
  ): StartupVerificationResult {
    const isMorningCompleted = isCategoryCompletedFn ? isCategoryCompletedFn('morning') : false;
    const isEveningCompleted = isCategoryCompletedFn ? isCategoryCompletedFn('evening') : false;

    return {
      timestamp: Date.now(),
      dateStr: getLocalDateString(now),
      defaultsEnforced,
      missedTriggersReset,
      osNotificationsRescheduled,
      pendingOsNotificationCount,
      morningStatus: this.getTriggerStatus('morning', settings, isMorningCompleted, now),
      eveningStatus: this.getTriggerStatus('evening', settings, isEveningCompleted, now)
    };
  }
}

export const adhkarNotificationController = AdhkarNotificationController.getInstance();
