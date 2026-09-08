import { UserProgress } from '../types';
import { UserChallengeProgress } from '../challengesData';

export type BadgeCategory = 'all' | 'quran' | 'adhkar' | 'tasbih' | 'streak' | 'knowledge';
export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface VisualBadge {
  id: string;
  name: string;
  description: string;
  category: 'quran' | 'adhkar' | 'tasbih' | 'streak' | 'knowledge';
  iconName: string;
  color: string;
  gradient: string;
  borderGlow: string;
  rarity: BadgeRarity;
  rarityLabel: string;
  targetValue: number;
  unit: string;
  spiritualQuote: string;
  criteria: string[];
  actionPath?: string;
  actionLabel?: string;
  calculateProgress: (progress: UserProgress, challengeProgress?: Record<string, UserChallengeProgress>) => {
    current: number;
    target: number;
    isEarned: boolean;
  };
}

export const VISUAL_BADGES: VisualBadge[] = [
  // ==================== QURAN BADGES ====================
  {
    id: 'quran_starter_5',
    name: 'بداية النور',
    description: 'قراءة أول 5 صفحات من المصحف الشريف في رحلتك المباركة',
    category: 'quran',
    iconName: 'BookOpen',
    color: 'emerald',
    gradient: 'from-emerald-500 via-teal-600 to-emerald-700',
    borderGlow: 'border-emerald-400/40 shadow-emerald-500/20',
    rarity: 'common',
    rarityLabel: 'شائع',
    targetValue: 5,
    unit: 'صفحات',
    spiritualQuote: '«اقْرَءُوا القُرْآنَ فإنَّه يَأْتي يَومَ القِيامَةِ شَفِيعًا لأَصْحابِهِ»',
    criteria: ['daily_quran_pages'],
    actionPath: '/quran',
    actionLabel: 'افتح المصحف',
    calculateProgress: (progress) => {
      const readPages = progress.quranProgress?.readPages?.length || 0;
      const logsPages = progress.quranProgress?.logs?.reduce((s, l) => s + (l.amount || 0), 0) || 0;
      const dailyPages = Object.values(progress.dailyStats || {}).reduce((s, d) => s + (d.quran || 0), 0);
      const count = Math.max(readPages, logsPages, dailyPages);
      return { current: Math.min(count, 5), target: 5, isEarned: count >= 5 };
    }
  },
  {
    id: 'quran_juz_weekly',
    name: 'صاحب الجزء',
    description: 'إتمام قراءة جزء كامل (20 صفحة) من القرآن الكريم',
    category: 'quran',
    iconName: 'BookOpen',
    color: 'teal',
    gradient: 'from-teal-500 via-emerald-600 to-teal-800',
    borderGlow: 'border-teal-400/40 shadow-teal-500/20',
    rarity: 'rare',
    rarityLabel: 'نادر',
    targetValue: 20,
    unit: 'صفحة',
    spiritualQuote: '«مَن قَرَأَ حَرْفًا مِنْ كِتَابِ اللَّهِ فَلَهُ بِهِ حَسَنَةٌ، وَالحَسَنَةُ بِعَشْرِ أَمْثَالِهَا»',
    criteria: ['weekly_quran_juz'],
    actionPath: '/quran',
    actionLabel: 'متابعة القراءة',
    calculateProgress: (progress, challengeProgress) => {
      const readPages = progress.quranProgress?.readPages?.length || 0;
      const logsPages = progress.quranProgress?.logs?.reduce((s, l) => s + (l.amount || 0), 0) || 0;
      const dailyPages = Object.values(progress.dailyStats || {}).reduce((s, d) => s + (d.quran || 0), 0);
      const count = Math.max(readPages, logsPages, dailyPages, challengeProgress?.['weekly_quran_juz']?.currentCount || 0);
      const isEarned = count >= 20 || !!challengeProgress?.['weekly_quran_juz']?.completed;
      return { current: Math.min(count, 20), target: 20, isEarned };
    }
  },
  {
    id: 'quran_5_ajza',
    name: 'قارئ الأجزاء الخمسة',
    description: 'قراءة 5 أجزاء مباركة (100 صفحة) من كلام الله عز وجل',
    category: 'quran',
    iconName: 'Sparkles',
    color: 'indigo',
    gradient: 'from-indigo-500 via-blue-600 to-indigo-800',
    borderGlow: 'border-indigo-400/40 shadow-indigo-500/20',
    rarity: 'epic',
    rarityLabel: 'ملحمي',
    targetValue: 100,
    unit: 'صفحة',
    spiritualQuote: '«الْمَاهِرُ بِالْقُرْآنِ مَعَ السَّفَرَةِ الْكِرَامِ الْبَرَرَةِ»',
    criteria: [],
    actionPath: '/quran',
    actionLabel: 'تلاوة القرآن',
    calculateProgress: (progress) => {
      const readPages = progress.quranProgress?.readPages?.length || 0;
      const logsPages = progress.quranProgress?.logs?.reduce((s, l) => s + (l.amount || 0), 0) || 0;
      const dailyPages = Object.values(progress.dailyStats || {}).reduce((s, d) => s + (d.quran || 0), 0);
      const count = Math.max(readPages, logsPages, dailyPages);
      return { current: Math.min(count, 100), target: 100, isEarned: count >= 100 };
    }
  },
  {
    id: 'quran_half_khatma',
    name: 'حافظ النصف (15 جزءاً)',
    description: 'بلوغ منتصف المصحف الشريف بتلاوة 300 صفحة',
    category: 'quran',
    iconName: 'Award',
    color: 'purple',
    gradient: 'from-purple-500 via-indigo-600 to-purple-800',
    borderGlow: 'border-purple-400/40 shadow-purple-500/20',
    rarity: 'epic',
    rarityLabel: 'ملحمي',
    targetValue: 300,
    unit: 'صفحة',
    spiritualQuote: '«يُقَالُ لِصَاحِبِ الْقُرْآنِ: اقْرَأْ وَارْتَقِ وَرَتِّلْ كَمَا كُنْتَ تُرَتِّلُ فِي الدُّنْيَا»',
    criteria: [],
    actionPath: '/quran',
    actionLabel: 'متابعة الختمة',
    calculateProgress: (progress) => {
      const readPages = progress.quranProgress?.readPages?.length || 0;
      const logsPages = progress.quranProgress?.logs?.reduce((s, l) => s + (l.amount || 0), 0) || 0;
      const dailyPages = Object.values(progress.dailyStats || {}).reduce((s, d) => s + (d.quran || 0), 0);
      const count = Math.max(readPages, logsPages, dailyPages);
      return { current: Math.min(count, 300), target: 300, isEarned: count >= 300 };
    }
  },
  {
    id: 'quran_full_khatma',
    name: 'خاتم كتاب الله',
    description: 'إتمام ختمة المصحف الشريف كاملاً (604 صفحات)',
    category: 'quran',
    iconName: 'Crown',
    color: 'amber',
    gradient: 'from-amber-400 via-yellow-500 to-amber-600',
    borderGlow: 'border-amber-400/60 shadow-amber-500/30',
    rarity: 'legendary',
    rarityLabel: 'أسطوري',
    targetValue: 604,
    unit: 'صفحة',
    spiritualQuote: '«اللَّهُمَّ ارْحَمْنِي بِالقُرْآنِ وَاجْعَلْهُ لِي إِمَاماً وَنُوراً وَهُدًى وَرَحْمَةً»',
    criteria: [],
    actionPath: '/quran-tracker',
    actionLabel: 'سجل الختمات',
    calculateProgress: (progress) => {
      const readPages = progress.quranProgress?.readPages?.length || 0;
      const logsPages = progress.quranProgress?.logs?.reduce((s, l) => s + (l.amount || 0), 0) || 0;
      const count = Math.max(readPages, logsPages);
      const isEarned = count >= 604 || (progress.quranProgress?.readSurahs?.length || 0) >= 114;
      return { current: Math.min(count, 604), target: 604, isEarned };
    }
  },
  {
    id: 'friday_kahf',
    name: 'نور بين الجمعتين',
    description: 'المواظبة على تلاوة سورة الكهف المباركة يوم الجمعة',
    category: 'quran',
    iconName: 'Zap',
    color: 'amber',
    gradient: 'from-amber-500 via-orange-500 to-yellow-600',
    borderGlow: 'border-amber-400/40 shadow-amber-500/20',
    rarity: 'rare',
    rarityLabel: 'نادر',
    targetValue: 1,
    unit: 'تلاوة',
    spiritualQuote: '«مَنْ قَرَأَ سُورَةَ الْكَهْفِ فِي يَوْمِ الْجُمُعَةِ أَضَاءَ لَهُ مِنَ النُّورِ مَا بَيْنَ الْجُمُعَتَيْنِ»',
    criteria: ['special_kahf_friday'],
    actionPath: '/quran/18',
    actionLabel: 'اقرأ الكهف',
    calculateProgress: (progress, challengeProgress) => {
      const isKahfRead = progress.quranProgress?.readSurahs?.includes(18) || !!challengeProgress?.['special_kahf_friday']?.completed;
      return { current: isKahfRead ? 1 : 0, target: 1, isEarned: isKahfRead };
    }
  },
  {
    id: 'surah_explorer_10',
    name: 'مستكشف السور',
    description: 'تلاوة وتدبر 10 سور مختلفة من القرآن الكريم',
    category: 'quran',
    iconName: 'Star',
    color: 'sky',
    gradient: 'from-sky-500 via-cyan-600 to-blue-700',
    borderGlow: 'border-sky-400/40 shadow-sky-500/20',
    rarity: 'rare',
    rarityLabel: 'نادر',
    targetValue: 10,
    unit: 'سور',
    spiritualQuote: '«كِتَابٌ أَنزَلْنَاهُ إِلَيْكَ مُبَارَكٌ لِّيَدَّبَّرُوا آيَاتِهِ»',
    criteria: [],
    actionPath: '/quran',
    actionLabel: 'فهرس السور',
    calculateProgress: (progress) => {
      const count = progress.quranProgress?.readSurahs?.length || 0;
      return { current: Math.min(count, 10), target: 10, isEarned: count >= 10 };
    }
  },

  // ==================== ADHKAR & TASBIH BADGES ====================
  {
    id: 'tasbih_starter_100',
    name: 'رطّب لسانك',
    description: 'إتمام أول 100 تسبيحة وذكر لله تعالى عبر السبحة الإلكترونية',
    category: 'tasbih',
    iconName: 'Heart',
    color: 'emerald',
    gradient: 'from-emerald-500 via-teal-600 to-emerald-700',
    borderGlow: 'border-emerald-400/40 shadow-emerald-500/20',
    rarity: 'common',
    rarityLabel: 'شائع',
    targetValue: 100,
    unit: 'تسبيحة',
    spiritualQuote: '«لا يَزَالُ لِسَانُكَ رَطْبًا مِنْ ذِكْرِ اللَّهِ»',
    criteria: [],
    actionPath: '/tasbih',
    actionLabel: 'افتح المسبحة',
    calculateProgress: (progress) => {
      const count = progress.tasbihCount || 0;
      return { current: Math.min(count, 100), target: 100, isEarned: count >= 100 };
    }
  },
  {
    id: 'tasbih_1000',
    name: 'ألفية الذاكرين',
    description: 'بلوغ 1,000 تسبيحة واستغفار وتهليل في رصيدك الإيماني',
    category: 'tasbih',
    iconName: 'Activity',
    color: 'cyan',
    gradient: 'from-cyan-500 via-sky-600 to-blue-700',
    borderGlow: 'border-cyan-400/40 shadow-cyan-500/20',
    rarity: 'rare',
    rarityLabel: 'نادر',
    targetValue: 1000,
    unit: 'تسبيحة',
    spiritualQuote: '«كَلِمَتَانِ خَفِيفَتَانِ عَلَى اللِّسَانِ، ثَقِيلَتَانِ فِي المِيزَانِ، حَبِيبَتَانِ إِلَى الرَّحْمَنِ»',
    criteria: ['weekly_tasbih_1000'],
    actionPath: '/tasbih',
    actionLabel: 'تسبيح',
    calculateProgress: (progress, challengeProgress) => {
      const count = Math.max(progress.tasbihCount || 0, challengeProgress?.['weekly_tasbih_1000']?.currentCount || 0);
      const isEarned = count >= 1000 || !!challengeProgress?.['weekly_tasbih_1000']?.completed;
      return { current: Math.min(count, 1000), target: 1000, isEarned };
    }
  },
  {
    id: 'tasbih_titan',
    name: 'عملاق التسبيح',
    description: 'الوصول إلى 10,000 تسبيحة إجمالية رفعة لدرجاتك في الجنة',
    category: 'tasbih',
    iconName: 'Trophy',
    color: 'emerald',
    gradient: 'from-emerald-400 via-teal-500 to-emerald-700',
    borderGlow: 'border-emerald-400/60 shadow-emerald-500/30',
    rarity: 'legendary',
    rarityLabel: 'أسطوري',
    targetValue: 10000,
    unit: 'تسبيحة',
    spiritualQuote: '«وَالذَّاكِرِينَ اللَّهَ كَثِيرًا وَالذَّاكِرَاتِ أَعَدَّ اللَّهُ لَهُمْ مَغْفِرَةً وَأَجْرًا عَظِيمًا»',
    criteria: ['special_tasbih_10000'],
    actionPath: '/tasbih',
    actionLabel: 'متابعة التسبيح',
    calculateProgress: (progress, challengeProgress) => {
      const count = Math.max(progress.tasbihCount || 0, challengeProgress?.['special_tasbih_10000']?.currentCount || 0);
      const isEarned = count >= 10000 || !!challengeProgress?.['special_tasbih_10000']?.completed;
      return { current: Math.min(count, 10000), target: 10000, isEarned };
    }
  },
  {
    id: 'adhkar_guardian_day',
    name: 'حارس الصباح والمساء',
    description: 'إتمام أذكار الصباح وأذكار المساء معاً في يوم واحد',
    category: 'adhkar',
    iconName: 'Sun',
    color: 'amber',
    gradient: 'from-amber-500 via-orange-500 to-yellow-600',
    borderGlow: 'border-amber-400/40 shadow-amber-500/20',
    rarity: 'common',
    rarityLabel: 'شائع',
    targetValue: 2,
    unit: 'ورد',
    spiritualQuote: '«فَسُبْحَانَ اللَّهِ حِينَ تُمْسُونَ وَحِينَ تُصْبِحُونَ»',
    criteria: ['daily_adhkar_morning', 'daily_adhkar_evening'],
    actionPath: '/adhkar/morning',
    actionLabel: 'أذكار اليوم',
    calculateProgress: (progress, challengeProgress) => {
      const dailyStats = progress.dailyStats || {};
      let hasBothInAnyDay = false;
      Object.values(dailyStats).forEach(stat => {
        const adhkars = stat.adhkar || [];
        const hasM = adhkars.some(a => a.includes('morning') || a.includes('الصباح'));
        const hasE = adhkars.some(a => a.includes('evening') || a.includes('المساء'));
        if (hasM && hasE) hasBothInAnyDay = true;
      });
      const morningDone = challengeProgress?.['daily_adhkar_morning']?.completed ? 1 : 0;
      const eveningDone = challengeProgress?.['daily_adhkar_evening']?.completed ? 1 : 0;
      const current = hasBothInAnyDay ? 2 : (morningDone + eveningDone);
      return { current, target: 2, isEarned: hasBothInAnyDay || current >= 2 };
    }
  },
  {
    id: 'adhkar_master_100',
    name: 'الذاكر المثابر',
    description: 'تلاوة 100 ذكر ودعاء من أبواب الأذكار المختلفة',
    category: 'adhkar',
    iconName: 'Zap',
    color: 'yellow',
    gradient: 'from-yellow-400 via-amber-500 to-orange-600',
    borderGlow: 'border-yellow-400/40 shadow-yellow-500/20',
    rarity: 'rare',
    rarityLabel: 'نادر',
    targetValue: 100,
    unit: 'ذكر',
    spiritualQuote: '«أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ»',
    criteria: [],
    actionPath: '/adhkar',
    actionLabel: 'جامع الأذكار',
    calculateProgress: (progress) => {
      const count = progress.totalAdhkarRecited || 0;
      return { current: Math.min(count, 100), target: 100, isEarned: count >= 100 };
    }
  },

  // ==================== STREAKS & MILESTONES ====================
  {
    id: 'streak_7_days',
    name: 'وسام الثبات (7 أيام)',
    description: 'المواظبة على الأذكار وسلسلة الطاعات لـ 7 أيام متواصلة',
    category: 'streak',
    iconName: 'Award',
    color: 'emerald',
    gradient: 'from-emerald-500 via-teal-600 to-emerald-700',
    borderGlow: 'border-emerald-400/40 shadow-emerald-500/20',
    rarity: 'rare',
    rarityLabel: 'نادر',
    targetValue: 7,
    unit: 'أيام',
    spiritualQuote: '«أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ»',
    criteria: ['weekly_adhkar_streak'],
    actionPath: '/adhkar/morning',
    actionLabel: 'حافظ على السلسلة',
    calculateProgress: (progress, challengeProgress) => {
      const streak = Math.max(progress.streak?.current || 0, progress.streak?.best || 0, challengeProgress?.['weekly_adhkar_streak']?.currentCount || 0);
      const isEarned = streak >= 7 || !!challengeProgress?.['weekly_adhkar_streak']?.completed;
      return { current: Math.min(streak, 7), target: 7, isEarned };
    }
  },
  {
    id: 'streak_30_days',
    name: 'المواظب الأبدي (30 يوماً)',
    description: 'المحافظة على السلسلة الإيمانية والذكر لـ 30 يوماً متتالياً',
    category: 'streak',
    iconName: 'Flame',
    color: 'orange',
    gradient: 'from-orange-500 via-amber-600 to-red-600',
    borderGlow: 'border-orange-400/50 shadow-orange-500/30',
    rarity: 'legendary',
    rarityLabel: 'أسطوري',
    targetValue: 30,
    unit: 'يوماً',
    spiritualQuote: '«وَاصْبِرْ نَفْسَكَ مَعَ الَّذِينَ يَدْعُونَ رَبَّهُمْ بِالْغَدَاةِ وَالْعَشِيِّ»',
    criteria: ['special_streak_30'],
    actionPath: '/dashboard',
    actionLabel: 'لوحة التقدم',
    calculateProgress: (progress, challengeProgress) => {
      const streak = Math.max(progress.streak?.current || 0, progress.streak?.best || 0, challengeProgress?.['special_streak_30']?.currentCount || 0);
      const isEarned = streak >= 30 || !!challengeProgress?.['special_streak_30']?.completed;
      return { current: Math.min(streak, 30), target: 30, isEarned };
    }
  },
  {
    id: 'full_devotion_day',
    name: 'يوم الإيمان التام',
    description: 'إتمام أذكار الصباح، المساء، النوم، والاستيقاظ في يوم واحد',
    category: 'streak',
    iconName: 'Moon',
    color: 'indigo',
    gradient: 'from-indigo-600 via-purple-600 to-slate-900',
    borderGlow: 'border-indigo-400/40 shadow-indigo-500/20',
    rarity: 'epic',
    rarityLabel: 'ملحمي',
    targetValue: 4,
    unit: 'أوراد',
    spiritualQuote: '«وَسَبِّحْ بِحَمْدِ رَبِّكَ قَبْلَ طُلُوعِ الشَّمْسِ وَقَبْلَ غُرُوبِهَا»',
    criteria: [],
    actionPath: '/adhkar',
    actionLabel: 'جامع الأوراد',
    calculateProgress: (progress) => {
      const dailyStats = progress.dailyStats || {};
      let maxAdhkarInOneDay = 0;
      Object.values(dailyStats).forEach(stat => {
        const adhkars = stat.adhkar || [];
        const hasM = adhkars.some(a => a.includes('morning') || a.includes('الصباح')) ? 1 : 0;
        const hasE = adhkars.some(a => a.includes('evening') || a.includes('المساء')) ? 1 : 0;
        const hasS = adhkars.some(a => a.includes('sleep') || a.includes('النوم')) ? 1 : 0;
        const hasW = adhkars.some(a => a.includes('waking') || a.includes('الاستيقاظ')) ? 1 : 0;
        const count = hasM + hasE + hasS + hasW;
        if (count > maxAdhkarInOneDay) maxAdhkarInOneDay = count;
      });
      return { current: maxAdhkarInOneDay, target: 4, isEarned: maxAdhkarInOneDay >= 4 };
    }
  },
  {
    id: 'faith_level_5',
    name: 'حاصد الحسنات (المستوى 5)',
    description: 'جمع 500 نقطة إيمانية والارتقاء إلى المستوى الخامس في التطبيق',
    category: 'knowledge',
    iconName: 'Star',
    color: 'purple',
    gradient: 'from-purple-500 via-violet-600 to-indigo-700',
    borderGlow: 'border-purple-400/40 shadow-purple-500/20',
    rarity: 'rare',
    rarityLabel: 'نادر',
    targetValue: 500,
    unit: 'نقطة',
    spiritualQuote: '«وَفِي ذَٰلِكَ فَلْيَتَنَافَسِ الْمُتَنَافِسُونَ»',
    criteria: [],
    actionPath: '/challenges',
    actionLabel: 'التحديات',
    calculateProgress: (progress) => {
      const points = progress.points || 0;
      return { current: Math.min(points, 500), target: 500, isEarned: points >= 500 || (progress.level || 1) >= 5 };
    }
  },
  {
    id: 'app_ambassador',
    name: 'سفير الخير',
    description: 'المساهمة في نشر التطبيق بين المسلمين والدلالة على الخير',
    category: 'knowledge',
    iconName: 'Share2',
    color: 'rose',
    gradient: 'from-rose-500 via-pink-600 to-red-600',
    borderGlow: 'border-rose-400/40 shadow-rose-500/20',
    rarity: 'rare',
    rarityLabel: 'نادر',
    targetValue: 1,
    unit: 'مشاركة',
    spiritualQuote: '«مَنْ دَلَّ عَلَى خَيْرٍ فَلَهُ مِثْلُ أَجْرِ فَاعِلِهِ»',
    criteria: ['special_share_app'],
    actionPath: '/challenges',
    actionLabel: 'شارك التطبيق',
    calculateProgress: (progress, challengeProgress) => {
      const isShared = !!challengeProgress?.['special_share_app']?.completed;
      return { current: isShared ? 1 : 0, target: 1, isEarned: isShared };
    }
  }
];

/**
 * Helper to get badge progress details
 */
export function getBadgeStatus(
  badge: VisualBadge, 
  progress: UserProgress, 
  challengeProgress?: Record<string, UserChallengeProgress>,
  earnedBadgeIds: string[] = []
) {
  const calc = badge.calculateProgress(progress, challengeProgress);
  const isDirectlyEarned = earnedBadgeIds.includes(badge.id);
  const isEarned = isDirectlyEarned || calc.isEarned;
  const current = isEarned ? badge.targetValue : calc.current;
  const percent = isEarned ? 100 : Math.min(100, Math.round((current / badge.targetValue) * 100));

  return {
    isEarned,
    current,
    target: badge.targetValue,
    percent,
    unit: badge.unit
  };
}

/**
 * Automatically evaluates all badges and returns newly unlocked badge objects.
 */
export function evaluateAllBadges(
  progress: UserProgress,
  challengeProgress?: Record<string, UserChallengeProgress>,
  currentEarnedIds: string[] = []
): { newlyUnlocked: VisualBadge[]; updatedEarnedIds: string[] } {
  const newlyUnlocked: VisualBadge[] = [];
  const updatedEarnedIds = [...currentEarnedIds];

  VISUAL_BADGES.forEach((badge) => {
    const status = getBadgeStatus(badge, progress, challengeProgress, updatedEarnedIds);
    if (status.isEarned && !updatedEarnedIds.includes(badge.id)) {
      updatedEarnedIds.push(badge.id);
      newlyUnlocked.push(badge);
    }
  });

  return { newlyUnlocked, updatedEarnedIds };
}
