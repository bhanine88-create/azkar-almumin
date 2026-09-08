import { LucideIcon, Target, Award, Calendar, Zap, Star } from 'lucide-react';

export enum ChallengeType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  SPECIAL = 'special'
}

export enum ChallengeCategory {
  ADHKAR = 'adhkar',
  QURAN = 'quran',
  PRAYER = 'prayer',
  TASBIH = 'tasbih',
  KNOWLEDGE = 'knowledge',
  COMMUNITY = 'community'
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  icon: string; // Lucide icon name
  type: ChallengeType;
  category: ChallengeCategory;
  targetCount: number;
  points: number;
  badgeId?: string;
  isRecurring: boolean;
  actionLabel?: string;
  actionPath?: string;
}

export interface UserChallengeProgress {
  challengeId: string;
  currentCount: number;
  completed: boolean;
  lastUpdated: string; // ISO Date
  streakCount: number;
  history: string[]; // Dates of completion
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  iconName: string;
  color: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  criteria: string[]; // List of challenge IDs required
}

export const CHALLENGES: Challenge[] = [
  // --- DAILY CHALLENGES ---
  {
    id: 'daily_adhkar_morning',
    title: 'أذكار الصباح',
    description: 'أكمل أذكار الصباح في وقتها لتنال حفظ الله',
    icon: 'Sun',
    type: ChallengeType.DAILY,
    category: ChallengeCategory.ADHKAR,
    targetCount: 1,
    points: 10,
    isRecurring: true,
    actionLabel: 'اقرأ الآن',
    actionPath: '/adhkar/morning'
  },
  {
    id: 'daily_adhkar_evening',
    title: 'أذكار المساء',
    description: 'حافظ على أذكار المساء لتطمئن روحك',
    icon: 'Moon',
    type: ChallengeType.DAILY,
    category: ChallengeCategory.ADHKAR,
    targetCount: 1,
    points: 10,
    isRecurring: true,
    actionLabel: 'اقرأ الآن',
    actionPath: '/adhkar/evening'
  },
  {
    id: 'daily_quran_pages',
    title: 'ورد القرآن اليومي',
    description: 'اقرأ 5 صفحات من المصحف الشريف',
    icon: 'BookOpen',
    type: ChallengeType.DAILY,
    category: ChallengeCategory.QURAN,
    targetCount: 5,
    points: 50,
    isRecurring: true,
    actionLabel: 'افتح المصحف',
    actionPath: '/quran'
  },
  {
    id: 'daily_tasbih_300',
    title: 'الذاكرون كثيراً',
    description: 'أكمل 300 تسبيحة خلال اليوم',
    icon: 'Activity',
    type: ChallengeType.DAILY,
    category: ChallengeCategory.TASBIH,
    targetCount: 300,
    points: 30,
    isRecurring: true,
    actionLabel: 'ابدأ التسبيح',
    actionPath: '/tasbih'
  },
  {
    id: 'daily_hadith',
    title: 'حديث اليوم',
    description: 'اقرأ حديثاً واحداً وتدبر معناه',
    icon: 'Sparkles',
    type: ChallengeType.DAILY,
    category: ChallengeCategory.KNOWLEDGE,
    targetCount: 1,
    points: 15,
    isRecurring: true,
    actionLabel: 'اقرأ الحديث',
    actionPath: '/sunnah-hadith/daily'
  },

  // --- WEEKLY CHALLENGES ---
  {
    id: 'weekly_adhkar_streak',
    title: 'المداوم المثابر',
    description: 'أكمل أذكار الصباح والمساء لـ 7 أيام متواصلة',
    icon: 'Zap',
    type: ChallengeType.WEEKLY,
    category: ChallengeCategory.ADHKAR,
    targetCount: 7,
    points: 150,
    badgeId: 'streak_7_days',
    isRecurring: true
  },
  {
    id: 'weekly_quran_juz',
    title: 'ختم جزء',
    description: 'اقرأ جزءاً كاملاً من القرآن خلال الأسبوع',
    icon: 'BookOpen',
    type: ChallengeType.WEEKLY,
    category: ChallengeCategory.QURAN,
    targetCount: 20, // Approx 20 pages per Juz
    points: 200,
    badgeId: 'quran_juz_weekly',
    isRecurring: true
  },
  {
    id: 'weekly_tasbih_1000',
    title: 'ألفية التسبيح',
    description: 'أكمل 1000 تسبيحة في أسبوع واحد',
    icon: 'Trophy',
    type: ChallengeType.WEEKLY,
    category: ChallengeCategory.TASBIH,
    targetCount: 1000,
    points: 100,
    isRecurring: true
  },

  // --- SPECIAL CHALLENGES ---
  {
    id: 'special_kahf_friday',
    title: 'نور الجمعة',
    description: 'اقرأ سورة الكهف يوم الجمعة',
    icon: 'Star',
    type: ChallengeType.SPECIAL,
    category: ChallengeCategory.QURAN,
    targetCount: 1,
    points: 100,
    badgeId: 'friday_kahf',
    isRecurring: true
  },
  {
    id: 'special_share_app',
    title: 'الدال على الخير',
    description: 'شارك التطبيق مع 5 من أصدقائك',
    icon: 'Award',
    type: ChallengeType.SPECIAL,
    category: ChallengeCategory.COMMUNITY,
    targetCount: 5,
    points: 150,
    badgeId: 'app_ambassador',
    isRecurring: false
  },
  {
    id: 'special_tasbih_10000',
    title: 'عملاق التسبيح',
    description: 'أكمل 10,000 تسبيحة إجمالية',
    icon: 'Trophy',
    type: ChallengeType.SPECIAL,
    category: ChallengeCategory.TASBIH,
    targetCount: 10000,
    points: 500,
    badgeId: 'tasbih_titan',
    isRecurring: false
  },
  {
    id: 'special_streak_30',
    title: 'المواظب الأبدي',
    description: 'أكمل أذكار الصباح والمساء لـ 30 يوم متواصل',
    icon: 'Flame',
    type: ChallengeType.SPECIAL,
    category: ChallengeCategory.ADHKAR,
    targetCount: 30,
    points: 500,
    badgeId: 'streak_30_days',
    isRecurring: false
  }
];

export const BADGES: Badge[] = [
  {
    id: 'quran_starter_5',
    name: 'بداية النور',
    description: 'قراءة أول 5 صفحات من المصحف الشريف في رحلتك المباركة',
    iconName: 'BookOpen',
    color: 'emerald',
    rarity: 'common',
    criteria: ['daily_quran_pages']
  },
  {
    id: 'quran_juz_weekly',
    name: 'صاحب الجزء',
    description: 'إتمام قراءة جزء كامل (20 صفحة) من القرآن الكريم',
    iconName: 'BookOpen',
    color: 'indigo',
    rarity: 'rare',
    criteria: ['weekly_quran_juz']
  },
  {
    id: 'quran_5_ajza',
    name: 'قارئ الأجزاء الخمسة',
    description: 'قراءة 5 أجزاء مباركة (100 صفحة) من كلام الله',
    iconName: 'Sparkles',
    color: 'indigo',
    rarity: 'epic',
    criteria: []
  },
  {
    id: 'quran_half_khatma',
    name: 'حافظ النصف (15 جزءاً)',
    description: 'بلوغ منتصف المصحف الشريف بتلاوة 300 صفحة',
    iconName: 'Award',
    color: 'purple',
    rarity: 'epic',
    criteria: []
  },
  {
    id: 'quran_full_khatma',
    name: 'خاتم كتاب الله',
    description: 'إتمام ختمة المصحف الشريف كاملاً (604 صفحات)',
    iconName: 'Crown',
    color: 'amber',
    rarity: 'legendary',
    criteria: []
  },
  {
    id: 'friday_kahf',
    name: 'نور بين الجمعتين',
    description: 'المواظبة على سورة الكهف يوم الجمعة',
    iconName: 'Zap',
    color: 'amber',
    rarity: 'rare',
    criteria: ['special_kahf_friday']
  },
  {
    id: 'surah_explorer_10',
    name: 'مستكشف السور',
    description: 'تلاوة وتدبر 10 سور مختلفة من القرآن الكريم',
    iconName: 'Star',
    color: 'sky',
    rarity: 'rare',
    criteria: []
  },
  {
    id: 'tasbih_starter_100',
    name: 'رطّب لسانك',
    description: 'إتمام أول 100 تسبيحة وذكر لله تعالى',
    iconName: 'Heart',
    color: 'emerald',
    rarity: 'common',
    criteria: []
  },
  {
    id: 'tasbih_1000',
    name: 'ألفية الذاكرين',
    description: 'بلوغ 1,000 تسبيحة واستغفار وتهليل',
    iconName: 'Activity',
    color: 'cyan',
    rarity: 'rare',
    criteria: ['weekly_tasbih_1000']
  },
  {
    id: 'tasbih_titan',
    name: 'عملاق التسبيح',
    description: 'الوصول إلى 10,000 تسبيحة إجمالية',
    iconName: 'Trophy',
    color: 'emerald',
    rarity: 'legendary',
    criteria: ['special_tasbih_10000']
  },
  {
    id: 'adhkar_guardian_day',
    name: 'حارس الصباح والمساء',
    description: 'إتمام أذكار الصباح وأذكار المساء معاً في يوم واحد',
    iconName: 'Sun',
    color: 'amber',
    rarity: 'common',
    criteria: ['daily_adhkar_morning', 'daily_adhkar_evening']
  },
  {
    id: 'adhkar_master_100',
    name: 'الذاكر المثابر',
    description: 'تلاوة 100 ذكر ودعاء من أبواب الأذكار المختلفة',
    iconName: 'Zap',
    color: 'yellow',
    rarity: 'rare',
    criteria: []
  },
  {
    id: 'streak_7_days',
    name: 'وسام الثبات (7 أيام)',
    description: 'إتمام أذكار الصباح والمساء لمدة أسبوع كامل',
    iconName: 'Award',
    color: 'emerald',
    rarity: 'rare',
    criteria: ['weekly_adhkar_streak']
  },
  {
    id: 'streak_30_days',
    name: 'المواظب الأبدي (30 يوماً)',
    description: 'المحافظة على السلسلة الإيمانية والذكر لـ 30 يوماً متتالياً',
    iconName: 'Flame',
    color: 'orange',
    rarity: 'legendary',
    criteria: ['special_streak_30']
  },
  {
    id: 'full_devotion_day',
    name: 'يوم الإيمان التام',
    description: 'إتمام أذكار الصباح، المساء، النوم، والاستيقاظ في يوم واحد',
    iconName: 'Moon',
    color: 'indigo',
    rarity: 'epic',
    criteria: []
  },
  {
    id: 'faith_level_5',
    name: 'حاصد الحسنات (المستوى 5)',
    description: 'جمع 500 نقطة إيمانية وبلوغ المستوى الخامس',
    iconName: 'Star',
    color: 'purple',
    rarity: 'rare',
    criteria: []
  },
  {
    id: 'app_ambassador',
    name: 'سفير الخير',
    description: 'المساهمة في نشر التطبيق بين المسلمين والدلالة على الخير',
    iconName: 'Share2',
    color: 'purple',
    rarity: 'rare',
    criteria: ['special_share_app']
  }
];
