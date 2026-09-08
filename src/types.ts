export type AdhkarCategory = 'morning' | 'evening' | 'sleeping' | 'prayer' | 'post-prayer' | 'adhan' | 'waking' | 'travel' | 'eating' | 'mosque' | 'home-bathroom' | 'clothes' | 'sadness' | 'ruqyah' | 'sickness' | 'nature' | 'favorites' | 'other';

export interface Dhikr {
  id: string;
  title?: string;
  text: string;
  count: number;
  description?: string;
  reference?: string;
  reward?: string;
}

export interface AdhkarData {
  category: AdhkarCategory;
  title: string;
  items: Dhikr[];
}

export interface QuranLog {
  id: string;
  date: string;
  amount: number;
  unit: 'page' | 'quarter' | 'eighth' | 'hizb' | 'juz';
  surah?: string;
  aya?: number;
}

export interface Bookmark {
  id: string;
  date: string;
  surah: string;
  surahNumber: number;
  aya: number;
  note?: string;
  text?: string;
}

export interface QuranProgress {
  logs: QuranLog[];
  dailyGoal: number; // in pages
  lastRead?: {
    surah: string;
    surahNumber?: number;
    aya: number;
    page: number;
  };
  readPages?: number[];
  readSurahs?: number[];
  bookmarks?: Bookmark[];
}

export interface TasbihGoal {
  id: string;
  text: string;
  targetCount: number;
  currentCount: number;
  isCompleted: boolean;
  createdAt: string;
}

export interface BaqiyatSalihat {
  subhanAllah: number;
  alhamdulillah: number;
  laIlahaIllaAllah: number;
  allahuAkbar: number;
  lastUpdated: string;
}

export interface IslamicStory {
  id: string;
  title: string;
  category: 'prophets' | 'companions' | 'biography' | 'quran' | 'wisdom' | 'history';
  content: string;
}

export interface UnifiedFavoriteItem {
  id: string; // unique ID
  type: 'lecture' | 'surah' | 'dhikr_category' | 'adhkar' | 'scholar' | 'reciter' | 'story' | 'dua'; // type of favorite
  title: string; // title of favorite (e.g. "سورة الكهف" or "محاضرة فضل العشر")
  subtitle?: string; // subtitle (e.g. "الشيخ بدر المشاري" or "أذكار الصباح")
  route: string; // routing path to open it (e.g. "/quran/18" or "/adhkar/morning")
  addedAt: string; // ISO date string
}

export interface UserProgress {
  points: number;
  level: number;
  dailyChallengeCompleted: boolean;
  tasbihCount: number;
  completedAdhkar: string[]; // IDs of completed dhikr sessions
  totalAdhkarRecited: number;
  challengePoints: number;
  completedChallengeIds: string[];
  earnedBadgeIds: string[];
  streak: {
    current: number;
    best: number;
    lastDate: string; // ISO date
  };
  favoriteStoryIds: string[]; // Added this
  favoriteScholars?: string[];
  favoriteLectures?: string[];
  favoriteReciters?: number[];
  favorites?: UnifiedFavoriteItem[]; // Unified Favorites list
  notifiedMorning?: boolean;
  notifiedEvening?: boolean;
  isPro?: boolean;
  subscriptionExpiry?: string;
  quranProgress?: QuranProgress;
  baqiyatSalihat?: BaqiyatSalihat;
  worshipTracker?: WorshipTrackerData;
  spiritualGoals?: SpiritualGoal[];
  tasbihGoals?: TasbihGoal[];
  dailyStats?: Record<string, { adhkar: string[], quran: number, tasbih: number }>;
}

export interface Reminder {
  id: string;
  label: string;
  time: string; // HH:mm
  days: number[]; // 0-6 (Sunday-Saturday)
  enabled: boolean;
  type: 'adhkar' | 'prayer' | 'custom' | 'morning' | 'evening';
  category?: string;
  interval?: number; // in minutes (0 means no interval)
  soundId?: string; // custom sound for this reminder
}

export interface AppSettings {
  homeWidgets?: { id: string, isVisible: boolean }[];
  quizTimerDuration?: number;
  theme: 'light' | 'dark' | 'system';
  primaryColor: string;
  fontSize: 'small' | 'medium' | 'large';
  lineSpacing?: 'normal' | 'relaxed' | 'loose';
  defaultDisplayTheme?: 'classic' | 'glass' | 'minimal' | 'aurora' | 'emerald' | 'amber' | 'clear' | 'lavender';
  fontFamily: string;
  adhkarFontSize: '15px' | '18px' | '20px' | '25px' | '30px';
  adhkarFontFamily: string;
  hadithFontFamily?: string;
  adhkarTheme: string;
  adhkarCategoryThemes?: Record<string, string>;
  adhkarWallpaperPattern?: 'none' | 'islamic' | 'grid' | 'dots';
  adhkarParticlesEnabled?: boolean;
  adhkarViewMode?: 'list' | 'single';
  hadithViewMode?: 'list' | 'single';
  adhkarAutoAdvance?: boolean;
  visualTheme?: 'classic' | 'glass' | 'minimal' | 'aurora' | 'emerald' | 'amber' | 'clear' | 'lavender';
  adhkarLayout?: 'grid' | 'list';
  adhkarHubShowDescriptions?: boolean;
  adhkarHubShowIcons?: boolean;
  hijriOffset?: number;
  notificationsEnabled: boolean;
  morningAdhkarTime: string;
  morningAdhkarEndTime: string;
  eveningAdhkarTime: string;
  eveningAdhkarEndTime: string;
  morningNotificationsEnabled: boolean;
  eveningNotificationsEnabled: boolean;
  morningAdhkarFollowupEnabled?: boolean;
  eveningAdhkarFollowupEnabled?: boolean;
  randomAdhkarEnabled: boolean;
  randomAdhkarInterval: number; // in minutes
  randomAdhkarQuietHoursEnabled?: boolean;
  randomAdhkarQuietStart?: string; // e.g. '23:00'
  randomAdhkarQuietEnd?: string; // e.g. '06:30'
  randomAdhkarSound?: string;
  randomAdhkarNotificationType?: 'both' | 'banner' | 'system';
  customRandomAdhkar?: string[]; // User's custom random dhikrs
  prayerNotificationsEnabled?: boolean;
  prayerNotificationSettings?: Record<string, boolean>;
  prayerCalcMethod?: string; // e.g., '4' for Umm Al-Qura
  prayerAsrMethod?: string; // '0' for Standard, '1' for Hanafi
  prayerOffsets?: Record<string, number>; // Offsets in minutes for each prayer
  prayerDaylightSaving?: boolean;
  prayerManualMode?: boolean;
  prayerManualTimes?: Record<string, string>;
  randomAdhkarTheme?: 'emerald' | 'blue' | 'teal' | 'purple' | 'rose' | 'red' | 'dark' | 'yellow-dark' | 'cyan-dark' | 'pink-burgundy' | 'mint-navy' | 'orange-navy' | 'indigo-coral' | 'matcha-forest' | 'lavender-plum' | 'crimson-sand' | 'frost-slate' | 'pink' | 'orange-glow' | 'clay-brown';
  randomAdhkarPosition?: 'top-center' | 'top-right' | 'top-left' | 'bottom-center' | 'bottom-right' | 'bottom-left' | 'center';
  randomAdhkarAnimation?: 'slide' | 'fade' | 'zoom' | 'bounce' | 'flip';
  inspirationType?: 'verse' | 'hadith' | 'wisdom' | 'all';
  inspirationFont?: string;
  inspirationTheme?: string;
  userName?: string; // Add this
  userColor?: string; // New: Selected avatar color
  _triggerRandom?: number; // Internal trigger for testing
  _triggerRandomText?: string; // Internal trigger with specific text
  _triggerMorning?: number; // Internal trigger for testing
  _triggerEvening?: number; // Internal trigger for testing
  _triggerPrayer?: number; // Internal trigger for testing
  _triggerReminderTest?: Reminder; // Internal trigger for testing
  _triggerSunnahReminder?: number; // Internal trigger for testing
  sunnahReminderEnabled?: boolean;
  sunnahReminderTime?: string;
  appLanguage?: 'ar' | 'fr' | 'en' | 'ur' | 'id' | 'bn' | 'tr' | 'ms' | 'de' | 'es'; // Global app language
  prayerRingtone?: string;
  morningAdhkarRingtone?: string;
  eveningAdhkarRingtone?: string;
  customReminderRingtone?: string;
  customSpiritualInsights?: { type: 'verse' | 'hadith', text: string, source: string }[];
  hapticTasbihEnabled?: boolean;
  tasbihBeadStyle?: 'basic' | 'pearl' | 'wood' | 'metal' | 'crystal' | 'onyx' | 'marble' | 'silver' | 'emerald' | 'sapphire' | 'ruby';
  customAppIcon?: string;
  appIconScale?: number; // Size scale percentage e.g., 80, 100, 120, 140
  watermarkLogoScale?: number; // Sizing of emblem in cards e.g., 80, 100, 120, 140
  autoIconScale?: boolean; // Control whether smart auto-calibration governs size scaling automatically
  tasbihSoundEnabled?: boolean;
  tasbihDailyGoal?: number;
  sidebarTheme?: string;
  sidebarCompactMode?: boolean;
  sidebarShowIconsOnly?: boolean;
  sidebarBlurStrength?: 'none' | 'light' | 'medium' | 'heavy';
  mushafEdition?: 'hafs' | 'warsh' | 'tajweed';
  reminders?: Reminder[];
  // Names of Allah Settings
  namesOfAllahLayout?: 'grid4' | 'grid2' | 'horizontal' | 'list' | 'focus';
  namesOfAllahFrame?: 'rounded' | 'circle' | 'hexagon' | 'star' | 'arch' | 'squircle' | 'diamond' | 'royal';
  namesOfAllahFontFamily?: string;
  namesOfAllahFontSize?: 'small' | 'medium' | 'large' | 'xlarge';
  namesOfAllahTheme?: 'burgundy' | 'emerald' | 'navy' | 'midnight' | 'gold' | 'rose' | 'pearl' | 'amethyst';
  namesOfAllahShowMeaning?: boolean;
  namesOfAllahShowNumber?: boolean;
  namesOfAllahAutoPlay?: boolean;
  namesOfAllahAutoPlaySpeed?: number;
  namesOfAllahFavoriteIds?: number[];
  // Audio Hub Settings
  audioPlaybackSpeed?: number;
  audioAutoAdvance?: boolean;
  audioSleepTimerMinutes?: number;
}

export interface WorshipActivity {
  id: string;
  name: string;
  category: 'quran' | 'prayer' | 'dhikr' | 'other';
  date: string; // ISO date string
  value: number; // e.g., count, minutes, or 1 for done
}

export interface SpiritualGoal {
  id: string;
  title: string;
  type: 'quran' | 'dhikr' | 'prayer' | 'other';
  target: number;
  progress: number;
  lastUpdated: string;
  isDaily: boolean;
  syncedToCalendar?: boolean;
  reminderTime?: string;
}

export interface WorshipTrackerData {
  activities: WorshipActivity[];
}


export interface CommunityPost {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: any; // ServerTimestamp
  type: 'reflection' | 'dhikr' | 'dua_request' | 'hadith' | 'deed';
  likesCount: number;
  sticker?: string | null;
  userColor?: string;
  imageData?: string;
}

export interface GlobalStats {
  totalAdhkarRecited: number;
  totalKhatmas: number;
  lastUpdated: any;
}
export interface Challenge {
  id: string;
  title: string;
  description: string;
  points: number;
  type: 'adhkar' | 'quran' | 'tasbih';
  target: number; // e.g., number of tasbeehs, pages of Quran
  badgeId?: string;
}

export interface Badge {
  id: string;
  title: string;
  icon: string; // e.g., 'Award', 'Star'
  description: string;
}
