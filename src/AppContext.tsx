import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProgress, AppSettings, AdhkarData, Dhikr, QuranLog, BaqiyatSalihat, WorshipActivity, Bookmark, Challenge, Badge, UnifiedFavoriteItem } from './types';
import { ADHKAR_DATA as INITIAL_ADHKAR_DATA } from './constants';
import { backupService } from './services/backupService';
import { mushafService } from './services/mushafService';
import { quranOfflineService } from './services/quranOfflineService';
import { userService } from './services/userService';
import { syncService } from './services/syncService';
import { auth, db } from './firebase';
import { safeLocalStorageSetItem, safeLocalStorageGetItem, safeLocalStorageRemoveItem, safeLocalStorageLength, safeLocalStorageKey, safeLocalStorageClear } from './utils/storage';
import { storageManager } from './services/storageManager';
import i18n, { updateDocumentDirection } from './i18n';
import { loadAllDownloadedFontsOnStartup } from './services/fontService';
import { 
  updateDoc, 
  doc, 
  increment, 
  serverTimestamp 
} from 'firebase/firestore';

interface AppContextType {
  progress: UserProgress;
  settings: AppSettings;
  adhkarData: AdhkarData[];
  addPoints: (amount: number) => void;
  completeChallenge: (challenge: Challenge) => void;
  markCategoryCompleted: (category: string) => void;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  incrementTasbih: () => void;
  addDhikr: (category: string, dhikr: Omit<Dhikr, 'id'>) => void;
  updateDhikr: (category: string, dhikr: Dhikr) => void;
  deleteDhikr: (category: string, dhikrId: string) => void;
  reorderDhikr: (category: string, startIndex: number, endIndex: number) => void;
  resetAdhkar: () => void;
  resetCategory: (category: string) => void;
  cleanAdhkarData: () => void;
  isCategoryCompleted: (category: string) => boolean;
  setNotified: (type: 'morning' | 'evening', value: boolean) => void;
  addQuranLog: (log: Omit<QuranLog, 'id' | 'date'>) => void;
  updateQuranGoal: (goal: number) => void;
  updateLastRead: (lastRead: NonNullable<UserProgress['quranProgress']>['lastRead']) => void;
  togglePageRead: (page: number) => void;
  toggleSurahRead: (surah: number) => void;
  addBookmark: (bookmark: Omit<Bookmark, 'id' | 'date'>) => void;
  removeBookmark: (id: string) => void;
  addTasbihGoal: (text: string, target: number) => void;
  incrementTasbihGoal: (id: string) => void;
  deleteTasbihGoal: (id: string) => void;
  incrementBaqiyatSalihat: (type: keyof Omit<BaqiyatSalihat, 'lastUpdated'>) => void;
  addWorshipActivity: (activity: Omit<WorshipActivity, 'id' | 'date'>) => void;
  toggleStoryFavorite: (storyId: string) => void;
  toggleScholarFavorite: (scholarId: string) => void;
  toggleLectureFavorite: (lectureId: string) => void;
  toggleReciterFavorite: (reciterId: number) => void;
  toggleFavoriteUnified: (item: Omit<UnifiedFavoriteItem, 'addedAt'>) => void;
  toggleDhikrFavorite: (dhikr: Dhikr) => void;
  downloadProgress: Record<string, { progress: number, isDownloading: boolean }>;
  startDownloadEdition: (editionId: string) => Promise<void>;
  updateProgress: (progress: UserProgress | ((prev: UserProgress) => UserProgress)) => void;
  resetSettings: () => void;
  homeWidgets: any[];
  updateHomeWidgets: (widgets: any[]) => void;
}

// Perform garbage collection to fix quota issues and reset old cached structures
const cleanupLegacyStorage = () => {
  try {
    // 1. One-time Migration from earlier versions (v20, v21, v22) to v23
    const keysToMigrate = [
      { oldKey: 'believer_settings_v22', newKey: 'believer_settings_v23' },
      { oldKey: 'believer_progress_v22', newKey: 'believer_progress_v23' },
      { oldKey: 'believer_adhkar_v22', newKey: 'believer_adhkar_v23' },
      { oldKey: 'believer_adhkar_counts_v22', newKey: 'believer_adhkar_counts_v23' },
      { oldKey: 'believer_backup_v22_1', newKey: 'believer_backup_v23_1' },
      { oldKey: 'believer_backup_v22_2', newKey: 'believer_backup_v23_2' },
      { oldKey: 'believer_last_adhkar_reset_date_v22', newKey: 'believer_last_adhkar_reset_date_v23' },
      // Direct migration from v21
      { oldKey: 'believer_settings_v21', newKey: 'believer_settings_v23' },
      { oldKey: 'believer_progress_v21', newKey: 'believer_progress_v23' },
      { oldKey: 'believer_adhkar_v21', newKey: 'believer_adhkar_v23' },
      { oldKey: 'believer_adhkar_counts_v21', newKey: 'believer_adhkar_counts_v23' },
      { oldKey: 'believer_backup_v21_1', newKey: 'believer_backup_v23_1' },
      { oldKey: 'believer_backup_v21_2', newKey: 'believer_backup_v23_2' },
      { oldKey: 'believer_last_adhkar_reset_date_v21', newKey: 'believer_last_adhkar_reset_date_v23' },
      // Direct migration from v20
      { oldKey: 'believer_settings_v20', newKey: 'believer_settings_v23' },
      { oldKey: 'believer_progress_v20', newKey: 'believer_progress_v23' },
      { oldKey: 'believer_adhkar_v20', newKey: 'believer_adhkar_v23' },
      { oldKey: 'believer_adhkar_counts_v20', newKey: 'believer_adhkar_counts_v23' },
      { oldKey: 'believer_backup_v20_1', newKey: 'believer_backup_v23_1' },
      { oldKey: 'believer_backup_v20_2', newKey: 'believer_backup_v23_2' },
    ];

    keysToMigrate.forEach(({ oldKey, newKey }) => {
      const oldVal = safeLocalStorageGetItem(oldKey);
      if (oldVal && !safeLocalStorageGetItem(newKey)) {
        safeLocalStorageSetItem(newKey, oldVal);
      }
    });

    const keysToRemove = [];
    for (let i = 0; i < safeLocalStorageLength(); i++) {
      const key = safeLocalStorageKey(i);
      if (key && key.startsWith('believer_')) {
        // Collect old version keys (v1-v6, v18)
        if (/_v([1-6]|18)(_|$)/.test(key) || key.endsWith('_v3_1') || key.endsWith('_v3_2')) {
          keysToRemove.push(key);
        }
      }
      if (key === 'quran-surahs-cache' || key === 'quran-surahs-cache-v2' || key === 'quran-surahs-cache-v3') {
        keysToRemove.push(key);
      }
      if (key === 'believer_adhkar' || key === 'believer_progress' || key === 'believer_settings' || key === 'believer_adhkar_counts_all' || key === 'believer_khatma') {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(k => safeLocalStorageRemoveItem(k));
    
    // Integrity check: Fix invalid progress if any
    const savedProgress = safeLocalStorageGetItem('believer_progress_v23') || safeLocalStorageGetItem('believer_progress_v22') || safeLocalStorageGetItem('believer_progress_v21') || safeLocalStorageGetItem('believer_progress_v5');
    if (savedProgress) {
      const parsed = JSON.parse(savedProgress);
      if (typeof parsed.points !== 'number' || isNaN(parsed.points)) {
        parsed.points = 0;
      }
      if (typeof parsed.level !== 'number' || isNaN(parsed.level)) {
        parsed.level = Math.floor(parsed.points / 100) + 1;
      }
      safeLocalStorageSetItem('believer_progress_v23', JSON.stringify(parsed));
    }
  } catch (e) {
    // Fail silently in production
  }
};

export const OFFICIAL_DEFAULT_SETTINGS: AppSettings = {
  quizTimerDuration: 20,
  appLanguage: 'ar',
  theme: 'system',
  primaryColor: '#0f766e',
  fontSize: 'medium',
  fontFamily: 'Tajawal',
  adhkarFontSize: '25px',
  adhkarFontFamily: 'Amiri',
  hadithFontFamily: 'Amiri',
  adhkarTheme: 'emerald',
  adhkarWallpaperPattern: 'islamic',
  adhkarParticlesEnabled: true,
  adhkarViewMode: 'list',
  hadithViewMode: 'list',
  adhkarAutoAdvance: true,
  adhkarCategoryThemes: {
    morning: 'classicGold',
    evening: 'emerald'
  },
  visualTheme: 'glass',
  adhkarLayout: 'grid',
  hijriOffset: 0,
  notificationsEnabled: true,
  morningAdhkarTime: '06:00',
  morningAdhkarEndTime: '10:00',
  eveningAdhkarTime: '18:00',
  eveningAdhkarEndTime: '22:00',
  morningNotificationsEnabled: true,
  eveningNotificationsEnabled: true,
  morningAdhkarFollowupEnabled: true,
  eveningAdhkarFollowupEnabled: true,
  sunnahReminderEnabled: true,
  sunnahReminderTime: '21:30',
  randomAdhkarEnabled: true,
  randomAdhkarInterval: 30,
  randomAdhkarQuietHoursEnabled: true,
  randomAdhkarQuietStart: '23:00',
  randomAdhkarQuietEnd: '06:30',
  randomAdhkarSound: 'default',
  randomAdhkarNotificationType: 'both',
  randomAdhkarTheme: 'emerald',
  prayerNotificationsEnabled: true,
  prayerRingtone: 'default',
  morningAdhkarRingtone: 'default',
  eveningAdhkarRingtone: 'default',
  customReminderRingtone: 'default',
  mushafEdition: 'hafs',
  customAppIcon: 'preset:original',
  appIconScale: 100,
  watermarkLogoScale: 100,
  autoIconScale: true,
  reminders: [],
  userColor: 'bg-teal-500',
  prayerNotificationSettings: {
    Fajr: true,
    Sunrise: false,
    Dhuhr: true,
    Asr: true,
    Maghrib: true,
    Isha: true
  },
  prayerCalcMethod: '4',
  prayerAsrMethod: '0',
  prayerOffsets: {
    Fajr: 0,
    Sunrise: 0,
    Dhuhr: 0,
    Asr: 0,
    Maghrib: 0,
    Isha: 0
  },
  prayerDaylightSaving: false,
  prayerManualMode: false,
  prayerManualTimes: {
    Fajr: '05:00',
    Sunrise: '06:30',
    Dhuhr: '12:00',
    Asr: '15:30',
    Maghrib: '18:00',
    Isha: '19:30'
  },
  inspirationType: 'all',
  inspirationFont: 'Amiri, serif',
  inspirationTheme: 'dynamic',
  hapticTasbihEnabled: true,
  tasbihBeadStyle: 'emerald',
  tasbihSoundEnabled: true,
  tasbihDailyGoal: 100,
  sidebarTheme: 'glassy',
  sidebarCompactMode: false,
  sidebarShowIconsOnly: false,
  sidebarBlurStrength: 'light',
  audioPlaybackSpeed: 1,
  audioAutoAdvance: true,
  audioSleepTimerMinutes: 0,
  namesOfAllahLayout: 'grid4',
  namesOfAllahFrame: 'rounded',
  namesOfAllahFontFamily: 'Amiri',
  namesOfAllahFontSize: 'medium',
  namesOfAllahTheme: 'burgundy',
  namesOfAllahShowMeaning: true,
  namesOfAllahShowNumber: true,
  namesOfAllahAutoPlay: false,
  namesOfAllahAutoPlaySpeed: 4,
  namesOfAllahFavoriteIds: [],
  customRandomAdhkar: [
    "سبحان الله",
    "الحمد لله",
    "لا إله إلا الله",
    "الله أكبر",
    "لا حول ولا قوة إلا بالله",
    "اللهم صلِّ وسلم على نبينا محمد",
    "أستغفر الله العظيم وأتوب إليه",
    "سبحان الله وبحمده، سبحان الله العظيم",
    "حسبي الله ونعم الوكيل",
    "لا إله إلا أنت سبحانك إني كنت من الظالمين",
    "اللهم إنك عفو تحب العفو فاعف عني",
    "يا حي يا قيوم برحمتك أستغيث، أصلح لي شأني كله ولا تكلني إلى نفسي طرفة عين",
    "اللهم آتنا في الدنيا حسنة وفي الآخرة حسنة وقنا عذاب النار"
  ],
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Run cleanup and start low-priority background mushaf download once on mount
  useEffect(() => {
    cleanupLegacyStorage();
    storageManager.checkAndClearStorageIfNeeded();

    const timer = setTimeout(async () => {
      try {
        const isHafsDownloaded = await mushafService.isEditionDownloaded('hafs');
        if (!isHafsDownloaded) {
          // Silent pre-caching
          mushafService.downloadEdition('hafs', () => {}, 2).catch(err => {
            console.warn('[Mushaf] Silent background download was interrupted or failed:', err);
          });
        }
      } catch (err) {
        console.warn('Silent background download failed to execute:', err);
      }
    }, 6000);

    return () => clearTimeout(timer);
  }, []);

  const [progress, setProgress] = useState<UserProgress>(() => {
    const saved = safeLocalStorageGetItem('believer_progress_v23') || safeLocalStorageGetItem('believer_progress_v22') || safeLocalStorageGetItem('believer_progress_v21') || safeLocalStorageGetItem('believer_progress_v20') || safeLocalStorageGetItem('believer_progress_v5');
    const defaultProgress: UserProgress = {
      points: 0,
      level: 1,
      dailyChallengeCompleted: false,
      tasbihCount: 0,
      completedAdhkar: [],
      totalAdhkarRecited: 0,
      challengePoints: 0,
      completedChallengeIds: [],
      earnedBadgeIds: [],
      streak: {
        current: 0,
        best: 0,
        lastDate: '',
      },
      favoriteStoryIds: [],
      favoriteScholars: [],
      favoriteLectures: [],
      favoriteReciters: [],
      favorites: [],
      isPro: false,
      subscriptionExpiry: undefined,
      quranProgress: {
        logs: [],
        dailyGoal: 10, // Default 10 pages
        readPages: [],
        readSurahs: [],
        bookmarks: []
      },
      tasbihGoals: [],
      baqiyatSalihat: {
        subhanAllah: 0,
        alhamdulillah: 0,
        laIlahaIllaAllah: 0,
        allahuAkbar: 0,
        lastUpdated: new Date().toDateString(),
      }
    };
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...defaultProgress, ...parsed };
    }
    return defaultProgress;
  });

  
  const defaultWidgets = React.useMemo(() => {
    // We can't import icons here easily without circular deps or large imports, 
    // so we store just id, name, isVisible. Icons are mapped in Home.tsx.
    return [
      { id: 'mushaf', name: 'المصحف', isVisible: true },
      { id: 'audio_library', name: 'المكتبة الصوتية', isVisible: true },
      { id: 'adhkar', name: 'أذكار الصباح والمساء', isVisible: true },
      { id: 'prayer_times', name: 'مواقيت الصلاة', isVisible: true },
      { id: 'names_qibla', name: 'أسماء الله والقبلة', isVisible: true },
      { id: 'daily_widget', name: 'الآية والذكر اليومي', isVisible: true },
      { id: 'heart_feelings', name: 'كيف حال قلبك اليوم؟ (طِبّ القلوب)', isVisible: true },
      { id: 'khatma', name: 'الختمة', isVisible: true },
      { id: 'hijri_calendar', name: 'التقويم الهجري', isVisible: true },
      { id: 'adhkar_stats', name: 'إحصائيات الأذكار', isVisible: true },
      { id: 'challenges', name: 'التحديات والأوسمة', isVisible: true },
      { id: 'sadaqah', name: 'مشروع الصدقة الجارية', isVisible: true }
    ];
  }, []);

  const [homeWidgets, setHomeWidgets] = useState<any[]>(() => {
    const saved = safeLocalStorageSetItem('home_widgets_config_read_only', null); // dummy call to check
    const savedStr = safeLocalStorageGetItem('home_widgets_config');
    if (savedStr) {
      try {
        const parsed = JSON.parse(savedStr);
        const merged = parsed.filter((savedWidget: any) => savedWidget.id !== 'favorites' && savedWidget.id !== 'spiritual_advisor' && savedWidget.id !== 'zakat_calculator' && savedWidget.id !== 'daily_achievements' && savedWidget.id !== 'prophet' && savedWidget.id !== 'hadith_qudsi').map((savedWidget: any) => {
          const defaultWidget = defaultWidgets.find(w => w.id === savedWidget.id);
          return defaultWidget ? { ...defaultWidget, isVisible: savedWidget.isVisible } : null;
        }).filter(Boolean);
        defaultWidgets.forEach(dw => {
          if (!merged.find((w: any) => w.id === dw.id)) merged.push(dw);
        });
        const isUpgradedToV26Widgets = safeLocalStorageGetItem('believer_widgets_v26_upgraded');
        if (!isUpgradedToV26Widgets) {
          safeLocalStorageSetItem('believer_widgets_v26_upgraded', 'true');
          return defaultWidgets.map(dw => {
            const found = merged.find((m: any) => m.id === dw.id);
            return found ? { ...dw, isVisible: found.isVisible !== false } : dw;
          });
        }
        return merged;
      } catch (e) {}
    }
    return defaultWidgets;
  });

  const updateHomeWidgets = React.useCallback((newWidgets: any[]) => {
    setHomeWidgets(newWidgets);
    safeLocalStorageSetItem('home_widgets_config', JSON.stringify(newWidgets.map(w => ({ id: w.id, isVisible: w.isVisible }))));
  }, []);

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = safeLocalStorageGetItem('believer_settings_v30') || safeLocalStorageGetItem('believer_settings_v29') || safeLocalStorageGetItem('believer_settings_v28') || safeLocalStorageGetItem('believer_settings_v27') || safeLocalStorageGetItem('believer_settings_v23') || safeLocalStorageGetItem('believer_settings_v22') || safeLocalStorageGetItem('believer_settings_v21') || safeLocalStorageGetItem('believer_settings_v20');
    const defaultSettings: AppSettings = OFFICIAL_DEFAULT_SETTINGS;

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        
        // Scrub internal triggers to prevent them from firing on every app load
        delete parsed._triggerRandom;
        delete parsed._triggerMorning;
        delete parsed._triggerEvening;
        delete parsed._triggerPrayer;
        delete parsed._triggerReminderTest;
        // Migrate old font size values
        if (parsed.adhkarFontSize === 'small') parsed.adhkarFontSize = '15px';
        else if (parsed.adhkarFontSize === 'medium') parsed.adhkarFontSize = '20px';
        else if (parsed.adhkarFontSize === 'large') parsed.adhkarFontSize = '25px';
        else if (parsed.adhkarFontSize && !['15px', '18px', '20px', '25px', '30px'].includes(parsed.adhkarFontSize)) {
          parsed.adhkarFontSize = '25px';
        }

        // Reset heavy deleted themes to 'classic'
        const deletedThemes = ['neo', 'gold', 'pure_white', 'ocean', 'sunset', 'pure_gold'];
        if (deletedThemes.includes(parsed.visualTheme)) {
          parsed.visualTheme = 'classic';
        }

        const merged = { ...defaultSettings, ...parsed };
        
        // Force modern essential defaults (perfect integration setup) if upgrading to v23
        const isUpgradingToV24 = !safeLocalStorageGetItem('believer_settings_v24_upgraded');
        if (isUpgradingToV24) {
          merged.notificationsEnabled = true;
          merged.morningNotificationsEnabled = true;
          merged.eveningNotificationsEnabled = true;
          merged.prayerNotificationsEnabled = true;
          merged.sunnahReminderEnabled = true;
          merged.randomAdhkarEnabled = true;
          merged.prayerNotificationSettings = { Fajr: true, Sunrise: false, Dhuhr: true, Asr: true, Maghrib: true, Isha: true };
          safeLocalStorageSetItem('believer_settings_v24_upgraded', 'true');
        }

        const isUpgradingToV25 = !safeLocalStorageGetItem('believer_settings_v25_adhkar_list');
        if (isUpgradingToV25) {
          merged.adhkarViewMode = 'list';
          safeLocalStorageSetItem('believer_settings_v25_adhkar_list', 'true');
        }

        const isUpgradingToV23 = !safeLocalStorageGetItem('believer_settings_v23_upgraded');
        if (isUpgradingToV23) {
          merged.notificationsEnabled = true;
          merged.morningNotificationsEnabled = true;
          merged.eveningNotificationsEnabled = true;
          merged.prayerNotificationsEnabled = true;
          merged.sunnahReminderEnabled = true;
          merged.randomAdhkarEnabled = true;
          merged.visualTheme = 'glass';
          merged.sidebarTheme = 'glassy';
          merged.tasbihSoundEnabled = true;
          merged.tasbihBeadStyle = 'emerald';
          merged.theme = 'system';
          merged.adhkarViewMode = 'list';
          safeLocalStorageSetItem('believer_settings_v23_upgraded', 'true');
        }

        // Official App Baseline v26: Establish all new features and updates as official defaults
        const isUpgradingToOfficialV26 = !safeLocalStorageGetItem('believer_settings_v26_official');
        if (isUpgradingToOfficialV26) {
          merged.adhkarViewMode = 'list';
          merged.visualTheme = 'glass';
          merged.sidebarTheme = 'glassy';
          merged.tasbihSoundEnabled = true;
          merged.tasbihBeadStyle = 'emerald';
          merged.hapticTasbihEnabled = true;
          merged.audioAutoAdvance = true;
          merged.audioPlaybackSpeed = 1;
          merged.audioSleepTimerMinutes = 0;
          merged.namesOfAllahLayout = merged.namesOfAllahLayout || 'grid4';
          merged.namesOfAllahFrame = merged.namesOfAllahFrame || 'rounded';
          merged.namesOfAllahFontFamily = merged.namesOfAllahFontFamily || 'Amiri';
          merged.namesOfAllahFontSize = merged.namesOfAllahFontSize || 'medium';
          merged.namesOfAllahTheme = merged.namesOfAllahTheme || 'burgundy';
          merged.namesOfAllahShowMeaning = merged.namesOfAllahShowMeaning !== false;
          merged.namesOfAllahShowNumber = merged.namesOfAllahShowNumber !== false;
          merged.namesOfAllahAutoPlaySpeed = merged.namesOfAllahAutoPlaySpeed || 4;
          safeLocalStorageSetItem('believer_settings_v26_official', 'true');
        }

        // Official Defaults Synchronization v27 (believer_settings_v27_official)
        const isUpgradingToOfficialV27 = !safeLocalStorageGetItem('believer_settings_v27_official');
        if (isUpgradingToOfficialV27) {
          merged.adhkarViewMode = 'list';
          merged.visualTheme = 'glass';
          merged.sidebarTheme = 'glassy';
          merged.notificationsEnabled = true;
          merged.prayerNotificationsEnabled = true;
          merged.morningNotificationsEnabled = true;
          merged.eveningNotificationsEnabled = true;
          merged.morningAdhkarFollowupEnabled = true;
          merged.eveningAdhkarFollowupEnabled = true;
          merged.sunnahReminderEnabled = true;
          merged.randomAdhkarEnabled = true;
          merged.tasbihSoundEnabled = true;
          merged.tasbihBeadStyle = 'emerald';
          merged.hapticTasbihEnabled = true;
          merged.audioAutoAdvance = true;
          merged.audioPlaybackSpeed = 1;
          merged.audioSleepTimerMinutes = 0;
          merged.namesOfAllahLayout = merged.namesOfAllahLayout || 'grid4';
          merged.namesOfAllahFrame = merged.namesOfAllahFrame || 'rounded';
          merged.namesOfAllahFontFamily = merged.namesOfAllahFontFamily || 'Amiri';
          merged.namesOfAllahFontSize = merged.namesOfAllahFontSize || 'medium';
          merged.namesOfAllahTheme = merged.namesOfAllahTheme || 'burgundy';
          merged.namesOfAllahShowMeaning = merged.namesOfAllahShowMeaning !== false;
          merged.namesOfAllahShowNumber = merged.namesOfAllahShowNumber !== false;
          merged.namesOfAllahAutoPlaySpeed = merged.namesOfAllahAutoPlaySpeed || 4;
          merged.prayerNotificationSettings = {
            Fajr: true,
            Sunrise: false,
            Dhuhr: true,
            Asr: true,
            Maghrib: true,
            Isha: true
          };
          safeLocalStorageSetItem('believer_settings_v27_official', 'true');
          safeLocalStorageSetItem('believer_settings_v27', JSON.stringify(merged));
          safeLocalStorageSetItem('believer_settings_v23', JSON.stringify(merged));
        }

        // Migration v27: Ensure all notifications and reminders are firmly enabled by default
        const isUpgradingToNotifsEnabledV27 = !safeLocalStorageGetItem('believer_notifs_firm_enabled_v27');
        if (isUpgradingToNotifsEnabledV27) {
          merged.notificationsEnabled = true;
          merged.prayerNotificationsEnabled = true;
          merged.morningNotificationsEnabled = true;
          merged.eveningNotificationsEnabled = true;
          merged.morningAdhkarFollowupEnabled = true;
          merged.eveningAdhkarFollowupEnabled = true;
          merged.sunnahReminderEnabled = true;
          merged.randomAdhkarEnabled = true;
          merged.prayerNotificationSettings = {
            Fajr: true,
            Sunrise: false,
            Dhuhr: true,
            Asr: true,
            Maghrib: true,
            Isha: true
          };
          safeLocalStorageSetItem('believer_notifs_firm_enabled_v27', 'true');
        }

        // Official Defaults Synchronization v28 (believer_settings_v28_official)
        const isUpgradingToOfficialV28 = !safeLocalStorageGetItem('believer_settings_v28_official');
        if (isUpgradingToOfficialV28) {
          merged.adhkarViewMode = 'list';
          merged.visualTheme = 'glass';
          merged.sidebarTheme = 'glassy';
          merged.notificationsEnabled = true;
          merged.prayerNotificationsEnabled = true;
          merged.morningNotificationsEnabled = true;
          merged.eveningNotificationsEnabled = true;
          merged.morningAdhkarFollowupEnabled = true;
          merged.eveningAdhkarFollowupEnabled = true;
          merged.sunnahReminderEnabled = true;
          merged.randomAdhkarEnabled = true;
          merged.tasbihSoundEnabled = true;
          merged.tasbihBeadStyle = 'emerald';
          merged.hapticTasbihEnabled = true;
          merged.audioAutoAdvance = true;
          merged.audioPlaybackSpeed = 1;
          merged.audioSleepTimerMinutes = 0;
          merged.namesOfAllahLayout = merged.namesOfAllahLayout || 'grid4';
          merged.namesOfAllahFrame = merged.namesOfAllahFrame || 'rounded';
          merged.namesOfAllahFontFamily = merged.namesOfAllahFontFamily || 'Amiri';
          merged.namesOfAllahFontSize = merged.namesOfAllahFontSize || 'medium';
          merged.namesOfAllahTheme = merged.namesOfAllahTheme || 'burgundy';
          merged.namesOfAllahShowMeaning = merged.namesOfAllahShowMeaning !== false;
          merged.namesOfAllahShowNumber = merged.namesOfAllahShowNumber !== false;
          merged.namesOfAllahAutoPlaySpeed = merged.namesOfAllahAutoPlaySpeed || 4;
          merged.prayerNotificationSettings = {
            Fajr: true,
            Sunrise: false,
            Dhuhr: true,
            Asr: true,
            Maghrib: true,
            Isha: true
          };
          safeLocalStorageSetItem('believer_settings_v28_official', 'true');
          safeLocalStorageSetItem('believer_settings_v28', JSON.stringify(merged));
          safeLocalStorageSetItem('believer_settings_v27', JSON.stringify(merged));
          safeLocalStorageSetItem('believer_settings_v23', JSON.stringify(merged));
        }

        // Official Defaults Synchronization v29 (believer_settings_v29_official)
        const isUpgradingToOfficialV29 = !safeLocalStorageGetItem('believer_settings_v29_official');
        if (isUpgradingToOfficialV29) {
          merged.adhkarViewMode = 'list';
          merged.visualTheme = 'glass';
          merged.sidebarTheme = 'glassy';
          merged.notificationsEnabled = true;
          merged.prayerNotificationsEnabled = true;
          merged.morningNotificationsEnabled = true;
          merged.eveningNotificationsEnabled = true;
          merged.morningAdhkarFollowupEnabled = true;
          merged.eveningAdhkarFollowupEnabled = true;
          merged.sunnahReminderEnabled = true;
          merged.randomAdhkarEnabled = true;
          merged.tasbihSoundEnabled = true;
          merged.tasbihBeadStyle = 'emerald';
          merged.hapticTasbihEnabled = true;
          merged.audioAutoAdvance = true;
          merged.audioPlaybackSpeed = 1;
          merged.audioSleepTimerMinutes = 0;
          merged.namesOfAllahLayout = merged.namesOfAllahLayout || 'grid4';
          merged.namesOfAllahFrame = merged.namesOfAllahFrame || 'rounded';
          merged.namesOfAllahFontFamily = merged.namesOfAllahFontFamily || 'Amiri';
          merged.namesOfAllahFontSize = merged.namesOfAllahFontSize || 'medium';
          merged.namesOfAllahTheme = merged.namesOfAllahTheme || 'burgundy';
          merged.namesOfAllahShowMeaning = merged.namesOfAllahShowMeaning !== false;
          merged.namesOfAllahShowNumber = merged.namesOfAllahShowNumber !== false;
          merged.namesOfAllahAutoPlaySpeed = merged.namesOfAllahAutoPlaySpeed || 4;
          merged.prayerNotificationSettings = {
            Fajr: true,
            Sunrise: false,
            Dhuhr: true,
            Asr: true,
            Maghrib: true,
            Isha: true
          };
          safeLocalStorageSetItem('believer_settings_v29_official', 'true');
          safeLocalStorageSetItem('believer_settings_v29', JSON.stringify(merged));
          safeLocalStorageSetItem('believer_settings_v28', JSON.stringify(merged));
          safeLocalStorageSetItem('believer_settings_v27', JSON.stringify(merged));
          safeLocalStorageSetItem('believer_settings_v23', JSON.stringify(merged));
        }

        // Official Defaults Synchronization v30 (believer_settings_v30_official)
        const isUpgradingToOfficialV30 = !safeLocalStorageGetItem('believer_settings_v30_official');
        if (isUpgradingToOfficialV30) {
          merged.adhkarViewMode = 'list';
          merged.visualTheme = 'glass';
          merged.sidebarTheme = 'glassy';
          merged.notificationsEnabled = true;
          merged.prayerNotificationsEnabled = true;
          merged.morningNotificationsEnabled = true;
          merged.eveningNotificationsEnabled = true;
          merged.morningAdhkarFollowupEnabled = true;
          merged.eveningAdhkarFollowupEnabled = true;
          merged.sunnahReminderEnabled = true;
          merged.randomAdhkarEnabled = true;
          merged.tasbihSoundEnabled = true;
          merged.tasbihBeadStyle = 'emerald';
          merged.hapticTasbihEnabled = true;
          merged.audioAutoAdvance = true;
          merged.audioPlaybackSpeed = 1;
          merged.audioSleepTimerMinutes = 0;
          merged.namesOfAllahLayout = merged.namesOfAllahLayout || 'grid4';
          merged.namesOfAllahFrame = merged.namesOfAllahFrame || 'rounded';
          merged.namesOfAllahFontFamily = merged.namesOfAllahFontFamily || 'Amiri';
          merged.namesOfAllahFontSize = merged.namesOfAllahFontSize || 'medium';
          merged.namesOfAllahTheme = merged.namesOfAllahTheme || 'burgundy';
          merged.namesOfAllahShowMeaning = merged.namesOfAllahShowMeaning !== false;
          merged.namesOfAllahShowNumber = merged.namesOfAllahShowNumber !== false;
          merged.namesOfAllahAutoPlaySpeed = merged.namesOfAllahAutoPlaySpeed || 4;
          merged.prayerNotificationSettings = {
            Fajr: true,
            Sunrise: false,
            Dhuhr: true,
            Asr: true,
            Maghrib: true,
            Isha: true
          };
          safeLocalStorageSetItem('believer_settings_v30_official', 'true');
          safeLocalStorageSetItem('believer_settings_v30', JSON.stringify(merged));
          safeLocalStorageSetItem('believer_settings_v29', JSON.stringify(merged));
          safeLocalStorageSetItem('believer_settings_v28', JSON.stringify(merged));
          safeLocalStorageSetItem('believer_settings_v27', JSON.stringify(merged));
          safeLocalStorageSetItem('believer_settings_v23', JSON.stringify(merged));
        }

        if (!merged.adhkarViewMode) {
          merged.adhkarViewMode = 'list';
        }

        if (!merged.primaryColor || typeof merged.primaryColor !== 'string') {
          merged.primaryColor = defaultSettings.primaryColor;
        }
        return merged;
      } catch (e) {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  const [adhkarData, setAdhkarData] = useState<AdhkarData[]>(() => {
    const saved = safeLocalStorageGetItem('believer_adhkar_v24') || safeLocalStorageGetItem('believer_adhkar_v23') || safeLocalStorageGetItem('believer_adhkar_v22') || safeLocalStorageGetItem('believer_adhkar_v21') || safeLocalStorageGetItem('believer_adhkar_v20') || safeLocalStorageGetItem('believer_adhkar_v6') || safeLocalStorageGetItem('believer_adhkar_v5');
    if (saved) {
      try {
        const parsedData = JSON.parse(saved);
        if (!Array.isArray(parsedData)) return INITIAL_ADHKAR_DATA;

        const validCategories = INITIAL_ADHKAR_DATA.map(c => c.category);

        // Filter out removed categories and merge remaining ones
        const loadedData = parsedData
          .filter(cat => validCategories.includes(cat.category))
          .map(cat => {
          if (!cat || typeof cat !== 'object' || !cat.category || !Array.isArray(cat.items)) return cat;
          
          // CRITICAL: Preserve favorites category completely without stripping items
          if (cat.category === 'favorites') return cat;

          const initialCat = INITIAL_ADHKAR_DATA.find(c => c.category === cat.category);
          if (!initialCat) return cat;
          
          const prefixes: Record<string, string> = {
            morning: 'm',
            evening: 'e',
            sleeping: 's',
            waking: 'w',
            prayer: 'pr',
            eating: 'et',
            'home-bathroom': 'hb',
            clothes: 'cl',
            travel: 'tr',
            sadness: 'sd',
            ruqyah: 'rq',
            sickness: 'sk',
            nature: 'nt',
            favorites: 'fv'
          };
          
          const currentPrefix = prefixes[cat.category] || cat.category;
          const otherPrefixes = Object.values(prefixes).filter(p => p !== currentPrefix);

          let updatedItems = cat.items.map((item: any) => {
            if (!item || typeof item !== 'object' || !item.id) return item;
            const initialItem = initialCat.items.find(i => i.id === item.id);
            
            // If it's in the initial data for THIS category, strictly update it to match source
            if (initialItem) {
              return { 
                ...item, 
                text: initialItem.text, 
                description: initialItem.description, 
                // Retain the user's customized count, fallback to initialItem.count
                count: item.count !== undefined ? item.count : initialItem.count
              };
            }
            
            // If it's a standard item from ANOTHER category, remove it
            const isForeign = otherPrefixes.some(p => {
              const regex = new RegExp(`^${p}(\\d+|_new_\\d+)$`);
              return regex.test(item.id);
            });
            
            if (isForeign) return null;
            
            // If it's a standard item for THIS category but not in initial data (removed), remove it
            const isStandardForThis = new RegExp(`^${currentPrefix}(\\d+|_new_\\d+)$`).test(item.id);
            if (isStandardForThis) return null;
            
            return item;
          }).filter(Boolean);

          // Insert missing items from initial data
          initialCat.items.forEach((initialItem, index) => {
            if (!updatedItems.some((i: any) => i && i.id === initialItem.id)) {
              // Insert at the correct index to maintain the intended order
              updatedItems.splice(index, 0, initialItem);
            }
          });

          // De-duplicate items by item.id to prevent key duplication
          const seenIds = new Set<string>();
          updatedItems = updatedItems.filter((i: any) => {
            if (!i || !i.id) return false;
            if (seenIds.has(i.id)) return false;
            seenIds.add(i.id);
            return true;
          });

          return {
            ...cat,
            items: updatedItems
          };
        });
        
        // Ensure all categories from INITIAL_ADHKAR_DATA are present and in the correct order
        return INITIAL_ADHKAR_DATA.map(initial => {
          const loaded = loadedData.find((d: any) => d && d.category === initial.category);
          return loaded || initial;
        });
      } catch (e) {
        console.error("Failed to parse saved adhkar data", e);
        return INITIAL_ADHKAR_DATA;
      }
    }
    return INITIAL_ADHKAR_DATA;
  });

  const [downloadProgress, setDownloadProgress] = useState<Record<string, {
    progress: number,
    isDownloading: boolean
  }>>({});

  const startDownloadEdition = React.useCallback(async (editionId: string) => {
    setDownloadProgress(prev => ({
      ...prev,
      [editionId]: { isDownloading: true, progress: 0 }
    }));

    try {
      await mushafService.downloadEdition(editionId, (progress) => {
        setDownloadProgress(prev => ({
          ...prev,
          [editionId]: { isDownloading: true, progress }
        }));
      });

      // Also ensure full Quran text for all 114 surahs is cached offline
      try {
        await quranOfflineService.downloadFullQuranText('ar.muyassar', editionId);
      } catch (textErr) {
        console.warn("Quran text auto-caching warning:", textErr);
      }

      const finalCount = await mushafService.getDownloadProgress(editionId);
      
      setDownloadProgress(prev => ({
        ...prev,
        [editionId]: { isDownloading: false, progress: finalCount || 604 }
      }));
    } catch (error) {
      console.error(error);
      setDownloadProgress(prev => ({
        ...prev,
        [editionId]: { isDownloading: false, progress: 0 }
      }));
    }
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      safeLocalStorageSetItem('believer_progress_v24', JSON.stringify(progress));
    }, 1500); 
    return () => clearTimeout(handler);
  }, [progress]);

  useEffect(() => {
    const handler = setTimeout(() => {
      const dataToSave = JSON.stringify(adhkarData);
      if (dataToSave.length > 100000) {
        console.warn(`Huge adhkarData! Length: ${dataToSave.length}`);
      }
      safeLocalStorageSetItem('believer_adhkar_v24', dataToSave);
    }, 1500);
    return () => clearTimeout(handler);
  }, [adhkarData]);

  useEffect(() => {
    // Automated database synchronization on mount to ensure standard items reflect latest updates without touching favorites or custom adhkar
    const hasScrubbedV24 = safeLocalStorageGetItem('believer_scrubbed_v24_sync');
    if (hasScrubbedV24) return;
    
    setAdhkarData(prev => {
      const updatedData = prev.map(cat => {
        // CRITICAL: Always preserve favorites category completely untouched!
        if (cat.category === 'favorites') return cat;

        const initialCat = INITIAL_ADHKAR_DATA.find(c => c.category === cat.category);
        if (!initialCat) return cat;

        const prefixes: Record<string, string> = {
          morning: 'm',
          evening: 'e',
          sleeping: 's',
          waking: 'w',
          prayer: 'pr',
          eating: 'et',
          'home-bathroom': 'hb',
          clothes: 'cl',
          travel: 'tr',
          sadness: 'sd',
          ruqyah: 'rq',
          sickness: 'sk',
          nature: 'nt',
          favorites: 'fv'
        };

        const customItems = cat.items.filter(item => {
           if (!item || !item.id) return false;
           // Keep if it's NOT a standard ID pattern across all prefixes
           const isStandard = Object.values(prefixes).some(p => {
             const regex = new RegExp(`^${p}(\\d+|_new_\\d+)$`);
             return regex.test(item.id);
           });
           
           if (isStandard) return false;
           if (item.id === 'e_baqarah') return false;
           return true; 
        });

        // Retain user's custom count for standard items if they changed it
        const standardItemsWithPreservedCounts = initialCat.items.map(initialItem => {
          const userItem = cat.items.find(i => i && i.id === initialItem.id);
          if (userItem && userItem.count !== undefined && userItem.count !== initialItem.count) {
            return { ...initialItem, count: userItem.count };
          }
          return initialItem;
        });

        let combinedItems = [
          ...JSON.parse(JSON.stringify(standardItemsWithPreservedCounts)),
          ...customItems
        ];

        // De-duplicate standard and custom items to make sure no double keys exist
        const seenIds = new Set<string>();
        combinedItems = combinedItems.filter((i) => {
          if (!i || !i.id) return false;
          if (seenIds.has(i.id)) return false;
          seenIds.add(i.id);
          return true;
        });

        return {
           ...cat,
           items: combinedItems
        };
      });

      // Synchronize immediately to storage
      safeLocalStorageSetItem('believer_adhkar_v24', JSON.stringify(updatedData));
      return updatedData;
    });
    
    safeLocalStorageSetItem('believer_scrubbed_v24_sync', 'true');
  }, []);

  // Automated Daily Backup Logic
  useEffect(() => {
    const performAutoBackup = async () => {
      const lastBackupDate = safeLocalStorageGetItem('believer_last_auto_backup_date');
      const today = new Date().toDateString();

      if (lastBackupDate !== today) {
        try {
          const countsData = JSON.parse(safeLocalStorageGetItem('believer_adhkar_counts_v23') || safeLocalStorageGetItem('believer_adhkar_counts_v22') || safeLocalStorageGetItem('believer_adhkar_counts_v21') || safeLocalStorageGetItem('believer_adhkar_counts_v20') || safeLocalStorageGetItem('believer_adhkar_counts_v6') || safeLocalStorageGetItem('believer_adhkar_counts_v5') || '{}');
          const dataToStore = { 
            progress, 
            settings, 
            counts: countsData,
            timestamp: new Date().toISOString() 
          };
          
          const snapshot = JSON.stringify(dataToStore);
          
          try {
            // Rotate backups safely
            const b1 = safeLocalStorageGetItem('believer_backup_v23_1') || safeLocalStorageGetItem('believer_backup_v22_1') || safeLocalStorageGetItem('believer_backup_v21_1') || safeLocalStorageGetItem('believer_backup_v5_1');
            if (b1) {
              safeLocalStorageSetItem('believer_backup_v23_2', b1);
            }
            safeLocalStorageSetItem('believer_backup_v23_1', snapshot);
            safeLocalStorageSetItem('believer_last_auto_backup_date', today);
          } catch (storageErr) {
            console.warn('LocalStorage Quota Exceeded. Cleaning up older data...');
            safeLocalStorageRemoveItem('believer_backup_v23_2');
            try {
              safeLocalStorageSetItem('believer_backup_v23_1', snapshot);
            } catch (retryErr) {
              console.error('Critical storage failure: Backup too large.');
            }
          }

          // 2. Cloud Backup (If authenticated)
          if (auth.currentUser) {
            try {
              const fullData = { ...dataToStore, adhkarData };
              await backupService.createCloudBackup(fullData);
              safeLocalStorageSetItem('believer_last_cloud_backup', new Date().toLocaleString('ar-EG'));
            } catch (cloudErr) {
              console.warn('Cloud auto-backup failed');
            }
          }
        } catch (err) {
          console.error('Auto-backup failed:', err);
        }
      }
    };

    // Delay auto-backup to avoid heavy load on boot
    const timer = setTimeout(performAutoBackup, 1000 * 60 * 5); // 5 minutes after opening
    return () => clearTimeout(timer);
  }, [progress, settings, adhkarData]);

  // Debounced auto-save progress and settings to Cloud (Firestore) using syncService
  useEffect(() => {
    if (auth.currentUser) {
      // Let the syncService handle synchronization smoothly in the background
      syncService.markDirty();
    }
  }, [progress, settings]);

  // Listen for background cloud updates from the sync manager
  useEffect(() => {
    const handleCloudSync = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        const { progress: cloudProgress, settings: cloudSettings } = customEvent.detail;
        if (cloudProgress) {
          setProgress(prev => ({ ...prev, ...cloudProgress }));
        }
        if (cloudSettings) {
          setSettings(prev => ({ ...prev, ...cloudSettings }));
        }
      }
    };

    window.addEventListener('believer_cloud_sync_received', handleCloudSync);
    return () => {
      window.removeEventListener('believer_cloud_sync_received', handleCloudSync);
    };
  }, []);

  // Load cloud profile once on initial authenticated mount
  useEffect(() => {
    let active = true;
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user && active) {
        try {
          const cloudProfile = await userService.getUserProfile(user.uid);
          if (cloudProfile && active) {
            if (cloudProfile.progress) {
              setProgress(prev => ({ ...prev, ...cloudProfile.progress }));
            }
            if (cloudProfile.settings) {
              setSettings(prev => ({ ...prev, ...cloudProfile.settings }));
            }
          }
        } catch (err) {
          console.warn('[AppContext] Initial cloud profile load failed:', err);
        }
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    loadAllDownloadedFontsOnStartup();
  }, []);

  useEffect(() => {
    safeLocalStorageSetItem('believer_settings_v30', JSON.stringify(settings));
    safeLocalStorageSetItem('believer_settings_v29', JSON.stringify(settings));
    safeLocalStorageSetItem('believer_settings_v28', JSON.stringify(settings));
    safeLocalStorageSetItem('believer_settings_v27', JSON.stringify(settings));
    safeLocalStorageSetItem('believer_settings_v23', JSON.stringify(settings));
    
    // Apply theme
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (settings.theme === 'system') {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Apply primary color
    document.documentElement.style.setProperty('--primary', settings.primaryColor);
    
    // Apply font size
    const fontSizes = {
      small: '14px',
      medium: '16px',
      large: '18px'
    };
    document.documentElement.style.fontSize = fontSizes[settings.fontSize];

    // Apply line spacing
    const lineSpacings = {
      normal: '1.5',
      relaxed: '1.75',
      loose: '2'
    };
    const currentLineSpacing = settings.lineSpacing || 'normal';
    document.documentElement.style.setProperty('--app-line-spacing', lineSpacings[currentLineSpacing]);
    document.body.classList.remove('leading-normal', 'leading-relaxed', 'leading-loose');
    document.body.classList.add(`leading-${currentLineSpacing}`);

    // Apply default display theme
    const displayTheme = settings.defaultDisplayTheme || 'classic';
    document.documentElement.setAttribute('data-display-theme', displayTheme);

    // Dynamically load font if not present (Google Fonts)
    const loadDynamicFont = (fontFamily: string) => {
      if (!fontFamily) return;
      const cleanFontName = fontFamily.replace(/['"]/g, '');
      const builtInFonts = ['Tajawal', 'Amiri', 'Scheherazade New', 'Cairo', 'Inter', 'Uthmanic Hafs', 'KFGQPC Kufi Stylistic Regular', 'Qadasi Regular'];
      if (builtInFonts.includes(cleanFontName)) return;

      const elementId = `dynamic-font-${cleanFontName.replace(/\s+/g, '-')}`;
      if (document.getElementById(elementId)) return;

      const link = document.createElement('link');
      link.id = elementId;
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${cleanFontName.replace(/\s+/g, '+')}:wght@400;600;700&display=swap`;
      link.crossOrigin = 'anonymous';
      
      link.onerror = () => {
        console.warn(`Failed to dynamically load font: ${cleanFontName}`);
      };
      
      document.head.appendChild(link);
    };

    loadDynamicFont(settings.fontFamily);
    loadDynamicFont(settings.adhkarFontFamily);
    loadDynamicFont(settings.hadithFontFamily);

    // Apply font family
    document.documentElement.style.setProperty('--app-font', `"${settings.fontFamily}"`);
    document.documentElement.style.setProperty('--adhkar-font', `"${settings.adhkarFontFamily}"`);

    // Apply language and direction via i18next
    const lang = settings.appLanguage || 'ar';
    updateDocumentDirection(lang);
    if (i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
  }, [settings]);

  const addPoints = React.useCallback((amount: number) => {
    setProgress(prev => {
      const newPoints = prev.points + amount;
      const newLevel = Math.floor(newPoints / 100) + 1;
      return { ...prev, points: newPoints, level: newLevel };
    });
  }, []);

  const completeChallenge = React.useCallback((challenge: Challenge) => {
    setProgress(prev => {
      if (prev.completedChallengeIds.includes(challenge.id)) return prev;

      const newEarnedBadges = [...(prev.earnedBadgeIds || [])];
      
      // Award badge if it exists and not already earned
      if (challenge.badgeId && !newEarnedBadges.includes(challenge.badgeId)) {
        newEarnedBadges.push(challenge.badgeId);
      }

      return {
        ...prev,
        challengePoints: (prev.challengePoints || 0) + challenge.points,
        completedChallengeIds: [...(prev.completedChallengeIds || []), challenge.id],
        earnedBadgeIds: newEarnedBadges
      };
    });
    addPoints(challenge.points);
  }, [addPoints]);

  const setNotified = React.useCallback((type: 'morning' | 'evening', value: boolean) => {
    setProgress(prev => ({
      ...prev,
      [type === 'morning' ? 'notifiedMorning' : 'notifiedEvening']: value
    }));
  }, []);

  const markCategoryCompleted = React.useCallback((category: string) => {
    setProgress(prev => {
      if (!prev.completedAdhkar.includes(category)) {
        // Increment global stats if possible
        if (auth.currentUser) {
          updateDoc(doc(db, 'stats', 'global'), {
            totalAdhkarRecited: increment(1),
            lastUpdated: serverTimestamp()
          }).catch(err => console.warn('Global stats update failed:', err));
        }

        const today = new Date().toISOString().split('T')[0];
        const lastDate = prev.streak?.lastDate || '';
        let newStreak = prev.streak?.current || 0;
        let newBest = prev.streak?.best || 0;
        
        if (lastDate !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];
          
          if (lastDate === yesterdayStr) {
            newStreak += 1;
          } else {
            newStreak = 1;
          }
          newBest = Math.max(newStreak, newBest);
        }

        // Ensure dailyStats exist
        const currentDailyStats = prev.dailyStats || {};
        const todayStats = currentDailyStats[today] || { adhkar: [], quran: 0, tasbih: 0 };
        const newTodayStats = {
          ...todayStats,
          adhkar: [...todayStats.adhkar, category]
        };

        return { 
          ...prev, 
          completedAdhkar: [...prev.completedAdhkar, category],
          totalAdhkarRecited: (prev.totalAdhkarRecited || 0) + 1,
          streak: {
            current: newStreak,
            best: newBest,
            lastDate: today
          },
          dailyStats: {
            ...currentDailyStats,
            [today]: newTodayStats
          }
        };
      }
      return prev;
    });
  }, []);

  const updateSettings = React.useCallback((newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const incrementTasbih = React.useCallback(() => {
    setProgress(prev => {
      const today = new Date().toISOString().split('T')[0];
      const lastDate = prev.streak?.lastDate || '';
      let newStreak = prev.streak?.current || 0;
      let newBest = prev.streak?.best || 0;
      
      if (lastDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        if (lastDate === yesterdayStr) {
          newStreak += 1;
        } else {
          newStreak = 1;
        }
        newBest = Math.max(newStreak, newBest);
      }

      // Ensure dailyStats exist
      const currentDailyStats = prev.dailyStats || {};
      const todayStats = currentDailyStats[today] || { adhkar: [], quran: 0, tasbih: 0 };
      const newTodayStats = {
        ...todayStats,
        tasbih: todayStats.tasbih + 1
      };

      return { 
        ...prev, 
        tasbihCount: prev.tasbihCount + 1,
        streak: {
          current: newStreak,
          best: newBest,
          lastDate: today
        },
        dailyStats: {
          ...currentDailyStats,
          [today]: newTodayStats
        }
      };
    });
    addPoints(1);
  }, [addPoints]);

  const addDhikr = React.useCallback((category: string, dhikr: Omit<Dhikr, 'id'>) => {
    setAdhkarData(prev => prev.map(cat => {
      if (cat.category === category) {
        return {
          ...cat,
          items: [...cat.items, { ...dhikr, id: Math.random().toString(36).substr(2, 9) }]
        };
      }
      return cat;
    }));
  }, []);

  const updateDhikr = React.useCallback((category: string, updatedDhikr: Dhikr) => {
    setAdhkarData(prev => prev.map(cat => {
      if (cat.category === category) {
        return {
          ...cat,
          items: cat.items.map(item => item.id === updatedDhikr.id ? updatedDhikr : item)
        };
      }
      return cat;
    }));
  }, []);

  const deleteDhikr = React.useCallback((category: string, dhikrId: string) => {
    setAdhkarData(prev => prev.map(cat => {
      if (cat.category === category) {
        return {
          ...cat,
          items: cat.items.filter(item => item.id !== dhikrId)
        };
      }
      return cat;
    }));
  }, []);

  const reorderDhikr = React.useCallback((category: string, startIndex: number, endIndex: number) => {
    setAdhkarData(prev => prev.map(cat => {
      if (cat.category === category) {
        const newItems = Array.from(cat.items);
        const [removed] = newItems.splice(startIndex, 1);
        newItems.splice(endIndex, 0, removed);
        return { ...cat, items: newItems };
      }
      return cat;
    }));
  }, []);

  const resetAdhkar = React.useCallback(() => {
    setAdhkarData(INITIAL_ADHKAR_DATA);
    safeLocalStorageRemoveItem('believer_adhkar_counts_v23');
    safeLocalStorageRemoveItem('believer_adhkar_counts_v22');
    safeLocalStorageRemoveItem('believer_adhkar_counts_v6');
    safeLocalStorageRemoveItem('believer_adhkar_counts_v5');
    window.dispatchEvent(new CustomEvent('believer_force_counts_reset'));
  }, []);

  const cleanAdhkarData = React.useCallback(() => {
    setAdhkarData(prev => prev.map(cat => {
      // CRITICAL: Always preserve favorites category completely untouched!
      if (cat.category === 'favorites') return cat;

      const initialCat = INITIAL_ADHKAR_DATA.find(c => c.category === cat.category);
      if (!initialCat) return cat;

      const prefixes: Record<string, string> = {
        morning: 'm',
        evening: 'e',
        sleeping: 's',
        waking: 'w',
        prayer: 'pr',
        eating: 'et',
        'home-bathroom': 'hb',
        clothes: 'cl',
        travel: 'tr',
        sadness: 'sd',
        ruqyah: 'rq',
        sickness: 'sk',
        nature: 'nt',
        favorites: 'fv'
      };
      
      const currentPrefix = prefixes[cat.category] || cat.category;
      const otherPrefixes = Object.values(prefixes).filter(p => p !== currentPrefix);

      const filteredItems = cat.items.map(item => {
        if (!item || !item.id) return null;
        
        const initItem = initialCat.items.find(i => i.id === item.id);
        if (initItem) {
          // Sync text, count, and description from initial data to fix any existing bugs in local storage
          return { ...item, text: initItem.text, count: initItem.count, description: initItem.description };
        }
        
        // Remove if it's a standard item from another category
        const isForeign = otherPrefixes.some(p => {
          const regex = new RegExp(`^${p}(\\d+|_new_\\d+)$`);
          return regex.test(item.id);
        });
        
        if (isForeign) return null;

        // Remove if it's a standard item for THIS category but not in initial data (removed)
        const isStandardForThis = new RegExp(`^${currentPrefix}(\\d+|_new_\\d+)$`).test(item.id);
        if (isStandardForThis) return null;

        return item; // Keep custom items
      }).filter(Boolean) as any[];

      // Ensure all initial items are present
      initialCat.items.forEach((initItem, idx) => {
        if (!filteredItems.some(i => i.id === initItem.id)) {
          filteredItems.splice(idx, 0, initItem);
        }
      });

      // Remove any duplicates by ID
      const seen = new Set<string>();
      const dedupedItems = filteredItems.filter(i => {
        if (!i || !i.id || seen.has(i.id)) return false;
        seen.add(i.id);
        return true;
      });

      return { ...cat, items: dedupedItems };
    }));
  }, []);

  const resetCategory = React.useCallback((category: string) => {
    setAdhkarData(prev => prev.map(cat => {
      if (cat.category === category) {
        const initialCat = INITIAL_ADHKAR_DATA.find(c => c.category === category);
        if (!initialCat) return cat;
        
        // Deep clone the initial category to ensure it's a fresh copy
        const restoredCat = JSON.parse(JSON.stringify(initialCat));
        
        window.dispatchEvent(new CustomEvent('believer_reset_category_counts', { 
          detail: { category, items: [...cat.items, ...restoredCat.items] } 
        }));

        return restoredCat;
      }
      return cat;
    }));
  }, []);

  const isCategoryCompleted = React.useCallback((category: string) => {
    return progress.completedAdhkar.includes(category);
  }, [progress.completedAdhkar]);

  useEffect(() => {
    const checkDailyReset = () => {
      const lastReset = safeLocalStorageGetItem('believer_last_adhkar_reset_date_v23') || safeLocalStorageGetItem('believer_last_adhkar_reset_date_v22') || safeLocalStorageGetItem('believer_last_adhkar_reset_date_v21') || safeLocalStorageGetItem('believer_last_adhkar_reset_date_v5');
      const today = new Date().toDateString();

      if (lastReset !== today) {
        // Clear all counts via local storage
        safeLocalStorageRemoveItem('believer_adhkar_counts_all');
        window.dispatchEvent(new CustomEvent('believer_force_counts_reset'));
        
        // Reset completedAdhkar and notifications
        setProgress(prev => ({ 
          ...prev, 
          completedAdhkar: [],
          notifiedMorning: false,
          notifiedEvening: false,
          baqiyatSalihat: {
            subhanAllah: 0,
            alhamdulillah: 0,
            laIlahaIllaAllah: 0,
            allahuAkbar: 0,
            lastUpdated: today,
          }
        }));
        
        safeLocalStorageSetItem('believer_last_adhkar_reset_date_v23', today);
      }
    };

    // Check immediately on mount
    checkDailyReset();

    // Check every minute to handle cases where the app is kept open overnight
    const interval = setInterval(checkDailyReset, 60000);
    return () => clearInterval(interval);
  }, []); // Empty dependency array to avoid clearing interval constantly

  const addQuranLog = React.useCallback((log: Omit<QuranLog, 'id' | 'date'>) => {
    setProgress(prev => {
      const quranProgress = prev.quranProgress || { logs: [], dailyGoal: 10 };
      const newLog: QuranLog = {
        ...log,
        id: Math.random().toString(36).substr(2, 9),
        date: new Date().toISOString()
      };

      const today = new Date().toISOString().split('T')[0];
      const lastDate = prev.streak?.lastDate || '';
      let newStreak = prev.streak?.current || 0;
      let newBest = prev.streak?.best || 0;
      
      if (lastDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        if (lastDate === yesterdayStr) {
          newStreak += 1;
        } else {
          newStreak = 1;
        }
        newBest = Math.max(newStreak, newBest);
      }

      // Ensure dailyStats exist
      const currentDailyStats = prev.dailyStats || {};
      const todayStats = currentDailyStats[today] || { adhkar: [], quran: 0, tasbih: 0 };
      
      // We will only track pages for quran stat to simplify dashboard. If unit is not 'page', 
      // we might just estimate it or ignore. Let's just track amount if unit is page, quarter=2, hizb=10, juz=20...
      let addedPages = 0;
      if (log.unit === 'page') addedPages = log.amount;
      else if (log.unit === 'quarter') addedPages = log.amount * 2.5;
      else if (log.unit === 'eighth') addedPages = log.amount * 1.25;
      else if (log.unit === 'hizb') addedPages = log.amount * 10;
      else if (log.unit === 'juz') addedPages = log.amount * 20;

      const newTodayStats = {
        ...todayStats,
        quran: todayStats.quran + addedPages
      };

      return {
        ...prev,
        quranProgress: {
          ...quranProgress,
          logs: [newLog, ...quranProgress.logs]
        },
        streak: {
          current: newStreak,
          best: newBest,
          lastDate: today
        },
        dailyStats: {
          ...currentDailyStats,
          [today]: newTodayStats
        }
      };
    });
    addPoints(Math.floor(log.amount * 5)); // Reward points for reading
  }, [addPoints]);

  const updateQuranGoal = React.useCallback((goal: number) => {
    setProgress(prev => ({
      ...prev,
      quranProgress: {
        ...(prev.quranProgress || { logs: [], dailyGoal: 10 }),
        dailyGoal: goal
      }
    }));
  }, []);

  const updateLastRead = React.useCallback((lastRead: NonNullable<UserProgress['quranProgress']>['lastRead']) => {
    setProgress(prev => ({
      ...prev,
      quranProgress: {
        ...(prev.quranProgress || { logs: [], dailyGoal: 10 }),
        lastRead
      }
    }));
  }, []);

  const togglePageRead = React.useCallback((page: number) => {
    setProgress(prev => {
      const qp = prev.quranProgress || { logs: [], dailyGoal: 10, readPages: [], readSurahs: [] };
      const currentRead = qp.readPages || [];
      const newRead = currentRead.includes(page)
        ? currentRead.filter(p => p !== page)
        : [...currentRead, page];
      
      return {
        ...prev,
        quranProgress: { ...qp, readPages: newRead }
      };
    });
    addPoints(5);
  }, [addPoints]);

  const toggleSurahRead = React.useCallback((surah: number) => {
    setProgress(prev => {
      const qp = prev.quranProgress || { logs: [], dailyGoal: 10, readPages: [], readSurahs: [], bookmarks: [] };
      const currentRead = qp.readSurahs || [];
      const newRead = currentRead.includes(surah)
        ? currentRead.filter(s => s !== surah)
        : [...currentRead, surah];
      
      return {
        ...prev,
        quranProgress: { ...qp, readSurahs: newRead }
      };
    });
    addPoints(50);
  }, [addPoints]);

  const addBookmark = React.useCallback((bookmark: Omit<Bookmark, 'id' | 'date'>) => {
    setProgress(prev => {
      const qp = prev.quranProgress || { logs: [], dailyGoal: 10, readPages: [], readSurahs: [], bookmarks: [] };
      const newBookmark: Bookmark = {
        ...bookmark,
        id: Math.random().toString(36).substr(2, 9),
        date: new Date().toISOString()
      };
      
      return {
        ...prev,
        quranProgress: {
          ...qp,
          bookmarks: [...(qp.bookmarks || []), newBookmark]
        }
      };
    });
  }, []);

  const removeBookmark = React.useCallback((id: string) => {
    setProgress(prev => {
      const qp = prev.quranProgress || { logs: [], dailyGoal: 10, readPages: [], readSurahs: [], bookmarks: [] };
      return {
        ...prev,
        quranProgress: {
          ...qp,
          bookmarks: (qp.bookmarks || []).filter(b => b.id !== id)
        }
      };
    });
  }, []);

  const addTasbihGoal = React.useCallback((text: string, target: number) => {
    setProgress(prev => ({
      ...prev,
      tasbihGoals: [
        ...(prev.tasbihGoals || []),
        {
          id: Math.random().toString(36).substr(2, 9),
          text,
          targetCount: target,
          currentCount: 0,
          isCompleted: false,
          createdAt: new Date().toISOString()
        }
      ]
    }));
  }, []);

  const incrementTasbihGoal = React.useCallback((id: string) => {
    setProgress(prev => {
      const today = new Date().toISOString().split('T')[0];
      const currentDailyStats = prev.dailyStats || {};
      const todayStats = currentDailyStats[today] || { adhkar: [], quran: 0, tasbih: 0 };
      
      return {
        ...prev,
        tasbihGoals: (prev.tasbihGoals || []).map(g => {
          if (g.id === id) {
            const newCount = g.currentCount + 1;
            const isNowCompleted = newCount >= g.targetCount;
            if (isNowCompleted && !g.isCompleted) {
              addPoints(g.targetCount); // Bonus for completing goal
            }
            return { ...g, currentCount: newCount, isCompleted: isNowCompleted };
          }
          return g;
        }),
        dailyStats: {
          ...currentDailyStats,
          [today]: {
            ...todayStats,
            tasbih: todayStats.tasbih + 1
          }
        }
      };
    });
    addPoints(1);
  }, [addPoints]);

  const deleteTasbihGoal = React.useCallback((id: string) => {
    setProgress(prev => ({
      ...prev,
      tasbihGoals: (prev.tasbihGoals || []).filter(g => g.id !== id)
    }));
  }, []);

  const incrementBaqiyatSalihat = React.useCallback((type: keyof Omit<BaqiyatSalihat, 'lastUpdated'>) => {
    setProgress(prev => {
      const today = new Date().toISOString().split('T')[0];
      const baqiyat = prev.baqiyatSalihat || {
        subhanAllah: 0,
        alhamdulillah: 0,
        laIlahaIllaAllah: 0,
        allahuAkbar: 0,
        lastUpdated: new Date().toDateString(),
      };
      
      const currentDailyStats = prev.dailyStats || {};
      const todayStats = currentDailyStats[today] || { adhkar: [], quran: 0, tasbih: 0 };

      return {
        ...prev,
        baqiyatSalihat: {
          ...baqiyat,
          [type]: baqiyat[type] + 1
        },
        dailyStats: {
          ...currentDailyStats,
          [today]: {
            ...todayStats,
            tasbih: todayStats.tasbih + 1
          }
        }
      };
    });
    addPoints(1); // Small reward for each dhikr
  }, [addPoints]);

  const addWorshipActivity = React.useCallback((activity: Omit<WorshipActivity, 'id' | 'date'>) => {
    setProgress(prev => {
      const worshipTracker = prev.worshipTracker || { activities: [] };
      const newActivity: WorshipActivity = {
        ...activity,
        id: Math.random().toString(36).substr(2, 9),
        date: new Date().toISOString()
      };
      
      return {
        ...prev,
        worshipTracker: {
          ...worshipTracker,
          activities: [...worshipTracker.activities, newActivity]
        }
      };
    });
    addPoints(10); // Reward points for logging activity
  }, [addPoints]);

  const toggleStoryFavorite = React.useCallback((storyId: string) => {
    setProgress(prev => {
      const favorites = prev.favoriteStoryIds || [];
      const newFavorites = favorites.includes(storyId)
        ? favorites.filter(id => id !== storyId)
        : [...favorites, storyId];
      return { ...prev, favoriteStoryIds: newFavorites };
    });
  }, []);

  const toggleScholarFavorite = React.useCallback((scholarId: string) => {
    setProgress(prev => {
      const favorites = prev.favoriteScholars || [];
      const newFavorites = favorites.includes(scholarId)
        ? favorites.filter(id => id !== scholarId)
        : [...favorites, scholarId];
      return { ...prev, favoriteScholars: newFavorites };
    });
  }, []);

  const toggleLectureFavorite = React.useCallback((lectureId: string) => {
    setProgress(prev => {
      const favorites = prev.favoriteLectures || [];
      const newFavorites = favorites.includes(lectureId)
        ? favorites.filter(id => id !== lectureId)
        : [...favorites, lectureId];
      return { ...prev, favoriteLectures: newFavorites };
    });
  }, []);

  const toggleReciterFavorite = React.useCallback((reciterId: number) => {
    setProgress(prev => {
      const favorites = prev.favoriteReciters || [];
      const newFavorites = favorites.includes(reciterId)
        ? favorites.filter(id => id !== reciterId)
        : [...favorites, reciterId];
      return { ...prev, favoriteReciters: newFavorites };
    });
  }, []);

  const toggleFavoriteUnified = React.useCallback((item: Omit<UnifiedFavoriteItem, 'addedAt'>) => {
    import('./lib/utils').then(({ triggerHaptic }) => triggerHaptic('light'));
    setProgress(prev => {
      const favoritesList = prev.favorites || [];
      const exists = favoritesList.some(fav => fav.id === item.id && fav.type === item.type);
      let updatedFavorites;
      if (exists) {
        updatedFavorites = favoritesList.filter(fav => !(fav.id === item.id && fav.type === item.type));
      } else {
        const newItem: UnifiedFavoriteItem = {
          ...item,
          addedAt: new Date().toISOString()
        };
        updatedFavorites = [...favoritesList, newItem];
      }
      return { ...prev, favorites: updatedFavorites };
    });
  }, []);

  const toggleDhikrFavorite = React.useCallback((dhikr: Dhikr) => {
    setAdhkarData(prev => {
      const favoritesCat = prev.find(c => c.category === 'favorites');
      if (!favoritesCat) return prev;

      const exists = favoritesCat.items.some(i => i.text === dhikr.text || i.id === dhikr.id);
      let updatedItems;

      if (exists) {
        updatedItems = favoritesCat.items.filter(i => i.text !== dhikr.text && i.id !== dhikr.id);
      } else {
        const newDhikr = {
          ...dhikr,
          id: dhikr.id.startsWith('fv_') ? dhikr.id : `fv_${dhikr.id}_${Date.now()}`
        };
        updatedItems = [...favoritesCat.items, newDhikr];
      }

      const updated = prev.map(c => {
        if (c.category === 'favorites') {
          return { ...c, items: updatedItems };
        }
        return c;
      });

      safeLocalStorageSetItem('believer_adhkar_v23', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const resetSettings = React.useCallback(() => {
    setSettings(OFFICIAL_DEFAULT_SETTINGS);
    safeLocalStorageSetItem('believer_settings_v30', JSON.stringify(OFFICIAL_DEFAULT_SETTINGS));
    safeLocalStorageSetItem('believer_settings_v29', JSON.stringify(OFFICIAL_DEFAULT_SETTINGS));
    safeLocalStorageSetItem('believer_settings_v28', JSON.stringify(OFFICIAL_DEFAULT_SETTINGS));
    safeLocalStorageSetItem('believer_settings_v27', JSON.stringify(OFFICIAL_DEFAULT_SETTINGS));
    safeLocalStorageSetItem('believer_settings_v23', JSON.stringify(OFFICIAL_DEFAULT_SETTINGS));
    safeLocalStorageSetItem('believer_settings_v30_official', 'true');
    safeLocalStorageSetItem('believer_settings_v29_official', 'true');
    safeLocalStorageSetItem('believer_settings_v28_official', 'true');
    safeLocalStorageSetItem('quran-reciter', '7');
    setHomeWidgets(defaultWidgets);
    safeLocalStorageSetItem('home_widgets_config', JSON.stringify(defaultWidgets.map(w => ({ id: w.id, isVisible: w.isVisible }))));
  }, [defaultWidgets]);

  const contextValue = React.useMemo(() => ({ 
    homeWidgets, updateHomeWidgets, progress, settings, adhkarData,
    addPoints, completeChallenge, markCategoryCompleted, updateSettings, incrementTasbih,
    addDhikr, updateDhikr, deleteDhikr, reorderDhikr, resetAdhkar, resetCategory, resetSettings,
    cleanAdhkarData, isCategoryCompleted,
    addQuranLog, updateQuranGoal, updateLastRead, 
    togglePageRead, toggleSurahRead, addBookmark, removeBookmark, addTasbihGoal, incrementTasbihGoal, deleteTasbihGoal,
    incrementBaqiyatSalihat, addWorshipActivity,
    toggleStoryFavorite, toggleScholarFavorite, toggleLectureFavorite, toggleReciterFavorite,
    toggleFavoriteUnified, toggleDhikrFavorite,
    downloadProgress, startDownloadEdition, updateProgress: setProgress,
    setNotified
  }), [
    homeWidgets, updateHomeWidgets, progress, settings, adhkarData,
    addPoints, completeChallenge, markCategoryCompleted, updateSettings, incrementTasbih,
    addDhikr, updateDhikr, deleteDhikr, reorderDhikr, resetAdhkar, resetCategory, resetSettings,
    cleanAdhkarData, isCategoryCompleted,
    addQuranLog, updateQuranGoal, updateLastRead, 
    togglePageRead, toggleSurahRead, addBookmark, removeBookmark, addTasbihGoal, incrementTasbihGoal, deleteTasbihGoal,
    incrementBaqiyatSalihat, addWorshipActivity,
    toggleStoryFavorite, toggleScholarFavorite, toggleLectureFavorite, toggleReciterFavorite,
    toggleFavoriteUnified, toggleDhikrFavorite,
    downloadProgress, startDownloadEdition, setNotified
  ]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
