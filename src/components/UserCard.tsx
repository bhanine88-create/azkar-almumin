import { BackButton } from './ui/BackButton';
import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {  Heart, 
  Plus, 
   
  Smile, 
  Frown, 
  Zap, 
  Moon, 
  Sun,
  Trash2,
  Save,
  BookOpen,
  MessageCircle,
  Quote,
  Activity,
  HelpCircle,
  ChevronRight,
  Brain,
  Copy,
  Check,
  Lock,
  Unlock,
  ShieldCheck,
  X,
  Search,
  Filter,
  Settings,
  Star,
  Share2,
  Share,
  ArrowUpDown,
  History,
  RotateCcw,
  Delete,
  Clock,
  User,
  Edit3,
  Crown,
  Medal,
  Flame,
  CheckCircle2 , Sparkles, Layers } from 'lucide-react';
import { cn, copyTextToClipboard, shareContent } from '../lib/utils';
import { useAppContext } from '../AppContext';
import { useTranslation } from '../i18n';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { useChallengeTracker } from '../hooks/useChallengeTracker';
import { BADGES } from '../challengesData';
import { Trophy, Award } from 'lucide-react';
import { useSmartNavigation } from "../lib/navigation";
import { VISUAL_BADGES, VisualBadge, getBadgeStatus } from '../services/badgeService';
import { BadgeDetailModal } from './BadgeDetailModal';
import { BadgeCelebrationModal } from './BadgeCelebrationModal';
import { safeLocalStorageGetItem, safeLocalStorageSetItem, safeLocalStorageRemoveItem } from "../utils/storage";
import { WALLET_PRESET_ITEMS, WalletPresetItem } from '../data/walletPresets';

interface PersonalEntry {
  id: string;
  type: 'dhikr' | 'dua' | 'verse' | 'hadith' | 'thought';
  content: string;
  source?: string;
  isPinned?: boolean;
  timestamp: number;
  mood?: string;
}

export const UserCard: React.FC = () => {
  const { settings, progress: userProgress } = useAppContext();
  const { t, isRtl } = useTranslation(settings.appLanguage);
  const { navigate, goBack } = useSmartNavigation();
  const { earnedBadges, progress: challengeProgress } = useChallengeTracker();
  const [user, setUser] = useState(auth.currentUser);

  // Visual Badges State & Modals
  const [selectedBadge, setSelectedBadge] = useState<VisualBadge | null>(null);
  const [selectedBadgeStatus, setSelectedBadgeStatus] = useState<{
    isEarned: boolean;
    current: number;
    target: number;
    percent: number;
    unit: string;
  } | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [celebrationBadge, setCelebrationBadge] = useState<VisualBadge | null>(null);
  const [isCelebrationOpen, setIsCelebrationOpen] = useState(false);
  const [badgeCategoryFilter, setBadgeCategoryFilter] = useState<'all' | 'quran' | 'adhkar' | 'streak'>('all');

  useEffect(() => {
    const handleBadgeUnlocked = (e: any) => {
      if (e.detail?.badge) {
        setCelebrationBadge(e.detail.badge);
        setIsCelebrationOpen(true);
      }
    };
    window.addEventListener('new-badge-unlocked', handleBadgeUnlocked);
    return () => window.removeEventListener('new-badge-unlocked', handleBadgeUnlocked);
  }, []);

  const visualBadgesWithStatus = useMemo(() => {
    return VISUAL_BADGES.map(badge => {
      const status = getBadgeStatus(badge, userProgress, challengeProgress, earnedBadges);
      return { badge, status };
    });
  }, [userProgress, challengeProgress, earnedBadges]);

  const earnedBadgesCount = useMemo(() => {
    return visualBadgesWithStatus.filter(b => b.status.isEarned).length;
  }, [visualBadgesWithStatus]);

  const filteredBadges = useMemo(() => {
    if (badgeCategoryFilter === 'all') return visualBadgesWithStatus;
    if (badgeCategoryFilter === 'quran') return visualBadgesWithStatus.filter(b => b.badge.category === 'quran');
    if (badgeCategoryFilter === 'adhkar') return visualBadgesWithStatus.filter(b => b.badge.category === 'adhkar' || b.badge.category === 'tasbih');
    if (badgeCategoryFilter === 'streak') return visualBadgesWithStatus.filter(b => b.badge.category === 'streak' || b.badge.category === 'knowledge');
    return visualBadgesWithStatus;
  }, [visualBadgesWithStatus, badgeCategoryFilter]);

  const handleOpenBadge = (badge: VisualBadge, status: any) => {
    setSelectedBadge(badge);
    setSelectedBadgeStatus(status);
    setIsDetailModalOpen(true);
  };

  const getBadgeVisualIcon = (iconName: string, size = 28) => {
    switch (iconName) {
      case 'BookOpen': return <BookOpen size={size} />;
      case 'Sparkles': return <Sparkles size={size} />;
      case 'Crown': return <Crown size={size} />;
      case 'Zap': return <Zap size={size} />;
      case 'Star': return <Star size={size} />;
      case 'Heart': return <Heart size={size} />;
      case 'Activity': return <Activity size={size} />;
      case 'Sun': return <Sun size={size} />;
      case 'Moon': return <Moon size={size} />;
      case 'Flame': return <Flame size={size} />;
      case 'Share2': return <Share2 size={size} />;
      case 'Award': return <Award size={size} />;
      default: return <Trophy size={size} />;
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(u => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (err) {
      console.error('Failed to log out:', err);
    }
  };

  const [activeMood, setActiveMood] = useState<string | null>(null);
  const [personalEntries, setPersonalEntries] = useState<PersonalEntry[]>(() => {
    const saved = safeLocalStorageGetItem('personal_entries');
    if (saved) return JSON.parse(saved);
    
    // Default initial entries
    return [
      {
        id: 'nur-verse-default',
        type: 'verse',
        content: '﴿ ۞ اللَّهُ نُورُ السَّمَاوَاتِ وَالْأَرْضِ ۚ مَثَلُ نُورِهِ كَمِشْكَاةٍ فِيهَا مِصْبَاحٌ ۖ الْمِصْبَاحُ فِي زُجَاجَةٍ ۖ الزُّجَاجَةُ كَأَنَّهَا كَوْكَبٌ دُرِّيٌّ يُوقَدُ مِن شَجَرَةٍ مُّبَارَكَةٍ زَيْتُونَةٍ لَّا شَرْقِيَّةٍ وَلَا غَرْبِيَّةٍ يَكَادُ زَيْتُهَا يُضِيءُ وَلَوْ لَمْ تَمْسَسْهُ نَارٌ ۚ نُّورٌ عَلَىٰ نُورٍ ۗ يَهْدِي اللَّهُ لِنُورِهِ مَن يَشَاءُ ۚ وَيَضْرِبُ اللَّهُ الْأَمْثَالَ لِلنَّاسِ ۗ وَاللَّهُ بِكُلِّ شَيْءٍ عَلِيمٌ﴾ [ النور: 35]',
        timestamp: Date.now(),
      },
      {
        id: 'dua-taif-default',
        type: 'dua',
        content: 'اللّهُمّ إلَيْك أَشْكُو ضَعْفَ قُوّتِي ، وَقِلّةَ حِيلَتِي ، وَهَوَانِي عَلَى النّاسِ، يَا أَرْحَمَ الرّاحِمِينَ ! أَنْتَ رَبّ الْمُسْتَضْعَفِينَ وَأَنْتَ رَبّي ، إلَى مَنْ تَكِلُنِي ؟ إلَى بَعِيدٍ يَتَجَهّمُنِي ؟ أَمْ إلَى عَدُوّ مَلّكْتَهُ أَمْرِي ؟ إنْ لَمْ يَكُنْ بِك عَلَيّ غَضَبٌ فَلَا أُبَالِي ، وَلَكِنّ عَافِيَتَك هِيَ أَوْسَعُ لِي ، أَعُوذُ بِنُورِ وَجْهِك الّذِي أَشْرَقَتْ لَهُ الظّلُمَاتُ وَصَلُحَ عَلَيْهِ أَمْرُ الدّنْيَا وَالْآخِرَةِ مِنْ أَنْ تُنْزِلَ بِي غَضَبَك ، أَوْ يَحِلّ عَلَيّ سُخْطُكَ، لَك الْعُتْبَى حَتّى تَرْضَى ، وَلَا حَوْلَ وَلَا قُوّةَ إلّا بِك',
        timestamp: Date.now(),
      },
      {
        id: 'dua-creation-guidance-default',
        type: 'dua',
        content: 'اللَّهُمَّ أَنْتَ خَلَقْتَنِي، وَأَنْتَ تَهْدِينِي، وَأَنْتَ تُطْعِمُنِي، وَأَنْتَ تَسْقِينِي، وَأَنْتَ تُمِيتُنِي، وَأَنْتَ تُحْيِينِي،\nاللهم إني أتبرأ من حولي وقوتي والتجأ إلى حولك وقوتك. اللهم أعني ولا تعن علي، وأنصرني ولا تنصر علي، واهدني ويسّر الهدى لي.',
        timestamp: Date.now(),
      },
      {
        id: 'sayyid-istighfar-default',
        type: 'dua',
        content: 'اللَّهمَّ أنتَ ربِّي وأنا عبدُكَ لا إلهَ إلَّا أنتَ خلَقْتَني وأنا عبدُكَ أصبَحْتُ على عهدِكَ ووَعْدِكَ ما استطَعْتُ أعوذُ بكَ مِن شرِّ ما صنَعْتُ وأبوءُ لكَ بنعمتِكَ علَيَّ وأبوءُ لكَ بذُنوبي فاغفِرْ لي إنَّه لا يغفِرُ الذُّنوبَ إلَّا أنتَ',
        timestamp: Date.now(),
      },
      {
        id: 'repentance-dua-default',
        type: 'dua',
        content: 'اللَّهمَّ إِنِّي ظَلَمْتُ نَفْسِي ظُلْمًا كثِيرًا، وَلا يَغْفِر الذُّنوبَ إِلاَّ أَنْتَ، فَاغْفِر لي مغْفِرَةً مِن عِنْدِكَ، وَارحَمْني، إِنَّكَ أَنْتَ الْغَفور الرَّحِيم',
        timestamp: Date.now(),
      },
      {
        id: 'dua-1-default',
        type: 'dua',
        content: 'اللَّهُمَّ أَصْلِحْ لِي دِينِي الَّذِي هُوَ عِصْمَةُ أَمْرِي، وَأَصْلِحْ لِي دُنْيَايَ الَّتِي فِيهَا مَعَاشِي، وَأَصْلِحْ لِي آخِرَتِي الَّتِي فِيهَا مَعَادِي وَاجْعَلِ الْحَيَاةَ زِيَادَةً لِي فِي كُلِّ خَيْرٍ، وَاجْعَلِ الْمَوْتَ رَاحَةً لِي مِنْ كُلِّ شَرٍّ',
        timestamp: Date.now(),
      },
      {
        id: 'dua-2-default',
        type: 'dua',
        content: 'اللَّهُمَّ لَكَ أَسْلَمْتُ وَبِكَ آمَنْتُ، وَعَلَيْكَ تَوَكَّلْتُ وَإِلَيْكَ أَنَبْتُ وَبِكَ خَاصَمْتُ، اللَّهُمَّ إِنِّي أَعُوذُ بِعِزَّتِكَ لَا إِلَهَ إِلَّا أَنْتَ أَنْ تُضِلَّنِي، أَنْتَ الْحَيُّ الَّذِي لَا يَمُوتُ وَالْجِنُّ وَالْإِنْسُ يَمُوتُونَ',
        timestamp: Date.now(),
      },
      {
        id: 'dua-3-default',
        type: 'dua',
        content: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ زَوَالِ نِعْمَتِكَ وَتَحَوُّلِ عَافِيَتِكَ وَفُجَاءَةِ نِقْمَتِكَ وَجَمِيعِ سَخَطِكَ',
        timestamp: Date.now(),
      },
      {
        id: 'dua-4-default',
        type: 'dua',
        content: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الثَّبَاتَ فِي الأَمْرِ، وَالْعَزِيمَةَ عَلَى الرُّشْدِ، وَأَسْأَلُكَ مُوجِبَاتِ رَحْمەتِكَ، وَعَزَائِمَ مَغْفِرَتِكَ، وَأَسْأَلُكَ شُكْرَ نِعْمَتِكَ، وَحُسْنَ عِبَادَتِكَ، وَأَسْأَلُكَ قَلْبًا سَلِيمًا، وَلِسَانًا صَادِقًا، وَأَسْأَلُكَ مِنْ خَيْرِ مَا تَعْلَمُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا تَعْلَمُ، وَأَسْتَغْفِرُكَ لِمَا تَعْلَمُ، إِنَّكَ أَنْتَ عَلَّامُ الْغُيُوبِ',
        timestamp: Date.now(),
      },
      {
        id: 'dua-5-default',
        type: 'dua',
        content: 'اللَّهُمَّ اكْفِنِي بِحَلَالِكَ عَنْ حَرَامِكَ وَأَغْنِنِي بِفَضْلِكَ عَمَّنْ سِوَاكَ',
        timestamp: Date.now(),
      },
      {
        id: 'ahqaf-verse-default',
        type: 'verse',
        content: '" رَبِّ أَوْزِعْنِي أَنْ أَشْكُرَ نِعْمَتَكَ الَّتِي أَنْعَمْتَ عَلَيَّ وَعَلَى وَالِدَيَّ وَأَنْ أَعْمَلَ صَالِحًا تَرْضَاهُ وَأَصْلِحْ لِي فِي ذُرِّيَّتِي إِنِّي تُبتُ إِلَيْكَ وَإِنِّي مِنَ الْمُسْلِمِينَ " [الأحقاف: 15]',
        timestamp: Date.now(),
      },
      {
        id: 'al-imran-26-27-default',
        type: 'verse',
        content: '" اللَّهُمَّ مَالِكَ الْمُلْكِ تُؤْتِي الْمُلْكَ مَنْ تَشَاءُ وَتَنْزِعُ الْمُلْكَ مِمَّنْ تَشَاءُ وَتُعِزُّ مَنْ تَشَاءُ وَتُذِلُّ مَنْ تَشَاءُ بِيَدِكَ الْخَيْرُ إِنَّكَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ (26) تُولِجُ اللَّيْلَ فِي النَّهَارِ وَتُولِجُ النَّهَارَ فِي اللَّيْلِ وَتُخْرِجُ الْحَيَّ مِنَ الْمَيِّتِ وَتُخْرِجُ الْمَيِّتَ مِنَ الْحَيِّ وَتَرْزُقُ مَنْ تَشَاءُ بِغَيْرِ حِسَابٍ (27) " [آل عمران: 26-27]',
        timestamp: Date.now(),
      },
      {
        id: 'baqarah-286-default',
        type: 'verse',
        content: '" رَبَّنَا لاَ تُؤَاخِذْنَا إِن نَّسِينَا أَوْ أَخْطَأْنَا رَبَّنَا وَلاَ تَحْمِلْ عَلَيْنَا إِصْرًا كَمَا حَمَلْتَهُ عَلَى الَّذِينَ مِن قَبْلِنَا رَبَّنَا وَلاَ تُحَمِّلْنَا مَا لاَ طَاقَةَ لَنَا بِهِ وَاعْفُ عَنَّا وَاغْفِرْ لَنَا وَارْحَمْنَآ أَنتَ مَوْلاَنَا فَانصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ " [البقرة: 286]',
        timestamp: Date.now(),
      },
      {
        id: 'hashr-10-default',
        type: 'verse',
        content: '" رَبَّنَا اغْفِرْ لَنَا وَلِإِخْوَانِنَا الَّذِينَ سَبَقُونَا بِالْإِيمَانِ وَلَا تَجْعَلْ فِي قُلُوبِنَا غِلًّا لِلَّذِينَ آمَنُوا رَبَّنَا إِنَّكَ رَءُوفٌ رَحِيمٌ " [الحشر: 10]',
        timestamp: Date.now(),
      },
      {
        id: 'qasas-group-default',
        type: 'verse',
        content: '" رَبِّ إِنِّي ظَلَمْتُ نَفْسِي فَاغْفِرْ لِي " [القصص: 16]\n" رَبِّ نَجِّنِي مِنَ الْقَوْمِ الظَّالِمِينَ " [القصص: 21]\n" رَبِّ إِنِّي لِمَا أَنْزَلْتَ إِلَيَّ مِنْ خَيْرٍ فَقِيرٌ " [القصص: 24]',
        timestamp: Date.now(),
      },
      {
        id: 'muminun-furqan-group-default',
        type: 'verse',
        content: '" رَبَّنَا آمَنَّا فَاغْفِرْ لَنَا وَارْحَمْنَا وَأَنْتَ خَيْرُ الرَّاحِمِينَ " [المؤمنون: 109]\n" رَبِّ اغْفِرْ وَارْحَمْ وَأَنْتَ خَيْرُ الرَّاحِمِينَ " [المؤمنون: 118]\n" رَبَّنَا اصْرِفْ عَنَّا عَذَابَ جَهَنَّمَ إِنَّ عَذَابَهَا كَانَ غَرَامًا * إِنَّهَا سَاءَتْ مُسْتَقَرًّا وَمُقَامًا " [الفرقان: 65، 66]',
        timestamp: Date.now(),
      },
      {
        id: 'mixed-verses-group-default',
        type: 'verse',
        content: '" رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِنْ لَدُنْكَ رَحْمَةً إِنَّكَ أَنْتَ الْوَهَّابُ " [آل عمران: 8]\n" رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ " [البقرة: 201]\n" رَبَّنَا ظَلَمْنَا أَنْفُسَنَا وَإِنْ لَمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ الْخَاسِرِينَ " [الأعراف: 23]\n" رَبَّنَا آتِنَا مِنْ لَدُنْكَ رَحْمَةً وَهَيِّئْ لَنَا مِنْ أَمْرِنَا رَشَدًا " [الكهف: 10]',
        timestamp: Date.now(),
      }
    ];
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'dhikr' | 'dua' | 'verse' | 'hadith' | 'thought'>('all');
  const [showWalletSettings, setShowWalletSettings] = useState(false);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>(() => 
    (safeLocalStorageGetItem('wallet_sort_order') as 'newest' | 'oldest') || 'newest'
  );
  
  const [walletFont, setWalletFont] = useState<string>(() => 
    safeLocalStorageGetItem('wallet_font_family') || 'Tajawal'
  );
  
  // Wallet Lock State
  const [walletPin, setWalletPin] = useState<string | null>(() => safeLocalStorageGetItem('wallet_pin'));
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [lockError, setLockError] = useState(false);
  const [isSettingNewPin, setIsSettingNewPin] = useState(false);
  const [firstPinAttempt, setFirstPinAttempt] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [resetEmailInput, setResetEmailInput] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'presets' | 'custom'>('presets');
  const [presetCategory, setPresetCategory] = useState<'all' | 'verse' | 'hadith' | 'dua' | 'dhikr' | 'thought'>('all');
  const [presetSearch, setPresetSearch] = useState('');
  const [addedToast, setAddedToast] = useState<string | null>(null);
  const [addedPresetIds, setAddedPresetIds] = useState<Set<string>>(new Set());
  const [isMoodModal, setIsMoodModal] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [newEntry, setNewEntry] = useState<{type: PersonalEntry['type'], content: string, mood?: string}>({
    type: 'thought',
    content: ''
  });

  const filteredPresets = useMemo(() => {
    return WALLET_PRESET_ITEMS.filter(item => {
      const matchesCat = presetCategory === 'all' || item.type === presetCategory;
      const matchesSearch = !presetSearch.trim() || 
        item.title.toLowerCase().includes(presetSearch.toLowerCase()) || 
        item.content.toLowerCase().includes(presetSearch.toLowerCase()) ||
        item.category.toLowerCase().includes(presetSearch.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [presetCategory, presetSearch]);

  const handleQuickAddPreset = (preset: WalletPresetItem) => {
    const entry: PersonalEntry = {
      id: `entry-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type: preset.type,
      content: preset.content,
      timestamp: Date.now(),
    };
    const updated = [entry, ...personalEntries];
    setPersonalEntries(updated);
    saveEntries(updated);
    
    setAddedPresetIds(prev => new Set(prev).add(preset.id));
    setAddedToast(`تمت إضافة "${preset.title}" إلى محفظتك بنجاح ✓`);
    setTimeout(() => {
      setAddedToast(null);
    }, 3000);
  };

  const handleSelectPresetToCustomize = (preset: WalletPresetItem) => {
    setNewEntry({
      type: preset.type,
      content: preset.content
    });
    setEditingEntryId(null);
    setIsMoodModal(false);
    setModalTab('custom');
  };

  // Auto-lock when tab becomes hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && walletPin && isUnlocked) {
        setIsUnlocked(false);
        setPinInput('');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [walletPin, isUnlocked]);

  const filteredEntries = personalEntries
    .filter(entry => {
      const matchesSearch = entry.content.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = activeFilter === 'all' || entry.type === activeFilter;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      // Pinned items always first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      
      // Then by date
      if (sortOrder === 'newest') return b.timestamp - a.timestamp;
      return a.timestamp - b.timestamp;
    });

  const handlePinAction = (digit: string) => {
    if (pinInput.length >= 4 || isSuccess) return;
    const newPin = pinInput + digit;
    setPinInput(newPin);
    setLockError(false);

    if (newPin.length === 4) {
      if (isSettingNewPin) {
        if (!firstPinAttempt) {
          setFirstPinAttempt(newPin);
          setPinInput('');
        } else {
          if (newPin === firstPinAttempt) {
            safeLocalStorageSetItem('wallet_pin', newPin);
            setWalletPin(newPin);
            setIsSuccess(true);
            setTimeout(() => {
              setIsUnlocked(true);
              setIsSettingNewPin(false);
              setFirstPinAttempt('');
              setPinInput('');
              setIsSuccess(false);
            }, 800);
          } else {
            setLockError(true);
            setPinInput('');
            setFirstPinAttempt('');
            setTimeout(() => setLockError(false), 2000);
          }
        }
      } else if (walletPin) {
        if (newPin === walletPin) {
          setIsSuccess(true);
          setTimeout(() => {
            setIsUnlocked(true);
            setPinInput('');
            setIsSuccess(false);
          }, 800);
        } else {
          setLockError(true);
          setPinInput('');
          setTimeout(() => setLockError(false), 600);
        }
      }
    }
  };

  const handleResetPin = () => {
    // In a real app, we'd verify the cloud-saved email
    // For now, we simulate identity verification
    if (resetEmailInput.trim()) {
      setResetSuccess(true);
      setTimeout(() => {
        safeLocalStorageRemoveItem('wallet_pin');
        setWalletPin(null);
        setIsUnlocked(false);
        setIsResetting(false);
        setResetSuccess(false);
        setResetEmailInput('');
        setPinInput('');
      }, 2000);
    }
  };

  const handleAddEntry = () => {
    if (!newEntry.content.trim()) return;
    
    if (editingEntryId) {
      const updated = personalEntries.map(entry => 
        entry.id === editingEntryId 
          ? { ...entry, content: newEntry.content, type: newEntry.type, mood: newEntry.mood || entry.mood } 
          : entry
      );
      setPersonalEntries(updated);
      saveEntries(updated);
    } else {
      // If it's a mood prayer (dua), replace existing one for that mood
      let updated: PersonalEntry[];
      if (newEntry.type === 'dua' && newEntry.mood) {
        const filtered = personalEntries.filter(e => !(e.type === 'dua' && e.mood === newEntry.mood));
        const entry: PersonalEntry = {
          id: `entry-${Date.now()}`,
          type: newEntry.type,
          content: newEntry.content,
          mood: newEntry.mood,
          timestamp: Date.now(),
        };
        updated = [entry, ...filtered];
      } else {
        const entry: PersonalEntry = {
          id: `entry-${Date.now()}`,
          type: newEntry.type,
          content: newEntry.content,
          mood: newEntry.mood,
          timestamp: Date.now(),
        };
        updated = [entry, ...personalEntries];
      }
      
      setPersonalEntries(updated);
      saveEntries(updated);
    }
    
    setIsAddModalOpen(false);
    setIsMoodModal(false);
    setEditingEntryId(null);
    setNewEntry({ type: 'thought', content: '' });
  };

  const clearPin = () => {
    setPinInput('');
    setLockError(false);
  };

  const removePin = () => {
    if (window.confirm(t('wallet_remove_lock_confirm'))) {
      safeLocalStorageRemoveItem('wallet_pin');
      setWalletPin(null);
      setIsUnlocked(false);
      setIsSettingNewPin(false);
      setPinInput('');
    }
  };

  useEffect(() => {
    setPersonalEntries(prev => {
      let updated = [...prev];
      let changed = false;

      const hasAnNurVerse = prev.some(e => e.id === 'nur-verse-default' || e.content.includes('اللَّهُ نُورُ السَّمَاوَاتِ وَالْأَرْضِ'));
      if (!hasAnNurVerse) {
        updated.push({
          id: 'nur-verse-default',
          type: 'verse',
          content: '﴿ ۞ اللَّهُ نُورُ السَّمَاوَاتِ وَالْأَرْضِ ۚ مَثَلُ نُورِهِ كَمِشْكَاةٍ فِيهَا مِصْبَاحٌ ۖ الْمِصْبَاحُ فِي زُجَاجَةٍ ۖ الزُّجَاجَةُ كَأَنَّهَا كَوْكَبٌ دُرِّيٌّ يُوقَدُ مِن شَجَرَةٍ مُّبَارَكَةٍ زَيْتُونَةٍ لَّا شَرْقِيَّةٍ وَلَا غَرْبِيَّةٍ يَكَادُ زَيْتُهَا يُضِيءُ وَلَوْ لَمْ تَمْسَسْهُ نَارٌ ۚ نُّورٌ عَلَىٰ نُورٍ ۗ يَهْدِي اللَّهُ لِنُورِهِ مَن يَشَاءُ ۚ وَيَضْرِبُ اللَّهُ الْأَمْثَالَ لِلنَّاسِ ۗ وَاللَّهُ بِكُلِّ شَيْءٍ عَلِيمٌ﴾ [ النور: 35]',
          timestamp: Date.now(),
        });
        changed = true;
      }

      const hasCreationDua = prev.some(e => e.id === 'dua-creation-guidance-default' || e.content.includes('اللَّهُمَّ أَنْتَ خَلَقْتَنِي، وَأَنْتَ تَهْدِينِي'));
      if (!hasCreationDua) {
        updated.push({
          id: 'dua-creation-guidance-default',
          type: 'dua',
          content: 'اللَّهُمَّ أَنْتَ خَلَقْتَنِي، وَأَنْتَ تَهْدِينِي، وَأَنْتَ تُطْعِمُنِي، وَأَنْتَ تَسْقِينِي، وَأَنْتَ تُمِيتُنِي، وَأَنْتَ تُحْيِينِي،\nاللهم إني أتبرأ من حولي وقوتي والتجأ إلى حولك وقوتك. اللهم أعني ولا تعن علي، وأنصرني ولا تنصر علي، واهدني ويسّر الهدى لي.',
          timestamp: Date.now(),
        });
        changed = true;
      }

      const hasTaifDua = prev.some(e => e.id === 'dua-taif-default' || e.content.includes('اللّهُمّ إلَيْك أَشْكُو ضَعْفَ قُوّتِي'));
      if (!hasTaifDua) {
        updated.push({
          id: 'dua-taif-default',
          type: 'dua',
          content: 'اللّهُمّ إلَيْك أَشْكُو ضَعْفَ قُوّتِي ، وَقِلّةَ حِيلَتِي ، وَهَوَانِي عَلَى النّاسِ، يَا أَرْحَمَ الرّاحِمِينَ ! أَنْتَ رَبّ الْمُسْتَضْعَفِينَ وَأَنْتَ رَبّي ، إلَى مَنْ تَكِلُنِي ؟ إلَى بَعِيدٍ يَتَجَهّمُنِي ؟ أَمْ إلَى عَدُوّ مَلّكْتَهُ أَمْرِي ؟ إنْ لَمْ يَكُنْ بِك عَلَيّ غَضَبٌ فَلَا أُبَالِي ، وَلَكِنّ عَافِيَتَك هِيَ أَوْسَعُ لِي ، أَعُوذُ بِنُورِ وَجْهِك الّذِي أَشْرَقَتْ لَهُ الظّلُمَاتُ وَصَلُحَ عَلَيْهِ أَمْرُ الدّنْيَا وَالْآخِرَةِ مِنْ أَنْ تُنْزِلَ بِي غَضَبَك ، أَوْ يَحِلّ عَلَيّ سُخْطُكَ، لَك الْعُتْبَى حَتّى تَرْضَى ، وَلَا حَوْلَ وَلَا قُوّةَ إلّا بِك',
          timestamp: Date.now(),
        });
        changed = true;
      }

      const hasIstighfar = prev.some(e => e.id === 'sayyid-istighfar-default' || e.content.includes('اللَّهمَّ أنتَ ربِّي وأنا عبدُكَ'));
      if (!hasIstighfar) {
        updated.push({
          id: 'sayyid-istighfar-default',
          type: 'dua',
          content: 'اللَّهمَّ أنتَ ربِّي وأنا عبدُكَ لا إلهَ إلَّا أنتَ خلَقْتَني وأنا عبدُكَ أصبَحْتُ على عهدِكَ ووَعْدِكَ ما استطَعْتُ أعوذُ بكَ مِن شرِّ ما صنَعْتُ وأبوءُ لكَ بنعمتِكَ علَيَّ وأبوءُ لكَ بذُنوبي فاغفِرْ لي إنَّه لا يغفِرُ الذُّنوبَ إلَّا أنتَ',
          timestamp: Date.now(),
        });
        changed = true;
      }

      const hasRepentanceDua = prev.some(e => e.id === 'repentance-dua-default' || e.content.includes('ظَلَمْتُ نَفْسِي ظُلْمًا كثِيرًا'));
      if (!hasRepentanceDua) {
        updated.push({
          id: 'repentance-dua-default',
          type: 'dua',
          content: 'اللَّهمَّ إِنِّي ظَلَمْتُ نَفْسِي ظُلْمًا كثِيرًا، وَلا يَغْفِر الذُّنوبَ إِلاَّ أَنْتَ، فَاغْفِر لي مغْفِرَةً مِن عِنْدِكَ، وَارحَمْني، إِنَّكَ أَنْتَ الْغَفور الرَّحِيم',
          timestamp: Date.now(),
        });
        changed = true;
      }

      const hasAhqafVerse = prev.some(e => e.id === 'ahqaf-verse-default' || e.content.includes('رَبِّ أَوْزِعْنِي أَنْ أَشْكُرَ نِعْمَتَكَ'));
      if (!hasAhqafVerse) {
        updated.push({
          id: 'ahqaf-verse-default',
          type: 'verse',
          content: '" رَبِّ أَوْزِعْنِي أَنْ أَشْكُرَ نِعْمَتَكَ الَّتِي أَنْعَمْتَ عَلَيَّ وَعَلَى وَالِدَيَّ وَأَنْ أَعْمَلَ صَالِحًا تَرْضَاهُ وَأَصْلِحْ لِي فِي ذُرِّيَّتِي إِنِّي تُبتُ إِلَيْكَ وَإِنِّي مِنَ الْمُسْلِمِينَ " [الأحقاف: 15]',
          timestamp: Date.now(),
        });
        changed = true;
      }

      const newDuas = [
        { id: 'dua-1-default', content: 'اللَّهُمَّ أَصْلِحْ لِي دِينِي الَّذِي هُوَ عِصْمَةُ أَمْرِي' },
        { id: 'dua-2-default', content: 'اللَّهُمَّ لَكَ أَسْلَمْتُ وَبِكَ آمَنْتُ' },
        { id: 'dua-3-default', content: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ زَوَالِ نِعْمَتِكَ' },
        { id: 'dua-4-default', content: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الثَّبَاتَ فِي الأَمْرِ' },
        { id: 'dua-5-default', content: 'اللَّهُمَّ اكْفِنِي بِحَلَالِكَ عَنْ حَرَامِكَ' },
        { id: 'al-imran-26-27-default', content: 'اللَّهُمَّ مَالِكَ الْمُلْكِ' },
        { id: 'baqarah-286-default', content: 'رَبَّنَا لاَ تُؤَاخِذْنَا إِن نَّسِينَا' },
        { id: 'hashr-10-default', content: 'رَبَّنَا اغْفِرْ لَنَا وَلِإِخْوَانِنَا الَّذِينَ سَبَقُونَا' },
        { id: 'qasas-group-default', content: 'رَبِّ إِنِّي ظَلَمْتُ نَفْسِي فَاغْفِرْ لِي' },
        { id: 'muminun-furqan-group-default', content: 'رَبَّنَا آمَنَّا فَاغْفِرْ لَنَا وَارْحَمْنَا' },
        { id: 'mixed-verses-group-default', content: 'رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا' }
      ];

      const fullContents = [
        'اللَّهُمَّ أَصْلِحْ لِي دِينِي الَّذِي هُوَ عِصْمَةُ أَمْرِي، وَأَصْلِحْ لِي دُنْيَايَ الَّتِي فِيهَا مَعَاشِي، وَأَصْلِحْ لِي آخِرَتِي الَّتِي فِيهَا مَعَادِي وَاجْعَلِ الْحَيَاةَ زِيَادَةً لِي فِي كُلِّ خَيْرٍ، وَاجْعَلِ الْمَوْتَ رَاحَةً لِي مِنْ كُلِّ شَرٍّ',
        'اللَّهُمَّ لَكَ أَسْلَمْتُ وَبِكَ آمَنْتُ، وَعَلَيْكَ تَوَكَّلْتُ وَإِلَيْكَ أَنَبْتُ وَبِكَ خَاصَمْتُ، اللَّهُمَّ إِنِّي أَعُوذُ بِعِزَّتِكَ لَا إِلَهَ إِلَّا أَنْتَ أَنْ تُضِلَّنِي، أَنْتَ الْحَيُّ الَّذِي لَا يَمُوتُ وَالْجِنُّ وَالْإِنْسُ يَمُوتُونَ',
        'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ زَوَالِ نِعْمَتِكَ وَتَحَوُّلِ عَافِيَتِكَ وَفُجَاءَةِ نِقْمَتِكَ وَجَمِيعِ سَخَطِكَ',
        'اللَّهُمَّ إِنِّي أَسْأَلُكَ الثَّبَاتَ فِي الأَمْرِ، وَالْعَزِيمَةَ عَلَى الرُّشْدِ، وَأَسْأَلُكَ مُوجِبَاتِ رَحْمەتِكَ، وَعَزَائِمَ مَغْفِرَتِكَ، وَأَسْأَلُكَ شُكْرَ نِعْمَتِكَ، وَحُسْنَ عِبَادَتِكَ، وَأَسْأَلُكَ قَلْبًا سَلِيمًا، وَلِسَانًا صَادِقًا، وَأَسْأَلُكَ مِنْ خَيْرِ مَا تَعْلَمُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا تَعْلَمُ، وَأَسْتَغْفِرُكَ لِمَا تَعْلَمُ، إِنَّكَ أَنْتَ عَلَّامُ الْغُيُوبِ',
        'اللَّهُمَّ اكْفِنِي بِحَلَالِكَ عَنْ حَرَامِكَ وَأَغْنِنِي بِفَضْلِكَ عَمَّنْ سِوَاكَ',
        '" اللَّهُمَّ مَالِكَ الْمُلْكِ تُؤْتِي الْمُلْكَ مَنْ تَشَاءُ وَتَنْزِعُ الْمُلْكَ مِمَّنْ تَشَاءُ وَتُعِزُّ مَنْ تَشَاءُ وَتُذِلُّ مَنْ تَشَاءُ بِيَدِكَ الْخَيْرُ إِنَّكَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ (26) تُولِجُ اللَّيْلَ فِي النَّهَارِ وَتُولِجُ النَّهَارَ فِي اللَّيْلِ وَتُخْرِجُ الْحَيَّ مِنَ الْمَيِّتِ وَتُخْرِجُ الْمَيِّتَ مِنَ الْحَيِّ وَتَرْزُقُ مَنْ تَشَاءُ بِغَيْرِ حِسَابٍ (27) " [آل عمران: 26-27]',
        '" رَبَّنَا لاَ تُؤَاخِذْنَا إِن نَّسِينَا أَوْ أَخْطَأْنَا رَبَّنَا وَلاَ تَحْمِلْ عَلَيْنَا إِصْرًا كَمَا حَمَلْتَهُ عَلَى الَّذِينَ مِن قَبْلِنَا رَبَّنَا وَلاَ تُحَمِّلْنَا مَا لاَ طَاقَةَ لَنَا بِهِ وَاعْفُ عَنَّا وَاغْفِرْ لَنَا وَارْحَمْنَآ أَنتَ مَوْلاَنَا فَانصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ " [البقرة: 286]',
        '" رَبَّنَا اغْفِرْ لَنَا وَلِإِخْوَانِنَا الَّذِينَ سَبَقُونَا بِالْإِيمَانِ وَلَا تَجْعَلْ فِي قُلُوبِنَا غِلًّا لِلَّذِينَ آمَنُوا رَبَّنَا إِنَّكَ رَءُوفٌ رَحِيمٌ " [الحشر: 10]',
        '" رَبِّ إِنِّي ظَلَمْتُ نَفْسِي فَاغْفِرْ لِي " [القصص: 16]\n" رَبِّ نَجِّنِي مِنَ الْقَوْمِ الظَّالِمِينَ " [القصص: 21]\n" رَبِّ إِنِّي لِمَا أَنْزَلْتَ إِلَيَّ مِنْ خَيْرٍ فَقِيرٌ " [القصص: 24]',
        '" رَبَّنَا آمَنَّا فَاغْفِرْ لَنَا وَارْحَمْنَا وَأَنْتَ خَيْرُ الرَّاحِمِينَ " [المؤمنون: 109]\n" رَبِّ اغْفِرْ وَارْحَمْ وَأَنْتَ خَيْرُ الرَّاحِمِينَ " [المؤمنون: 118]\n" رَبَّنَا اصْرِفْ عَنَّا عَذَابَ جَهَنَّمَ إِنَّ عَذَابَهَا كَانَ غَرَامًا * إِنَّهَا سَاءَتْ مُسْتَقَرًّا وَمُقَامًا " [الفرقان: 65، 66]',
        '" رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِنْ لَدُنْكَ رَحْمَةً إِنَّكَ أَنْتَ الْوَهَّابُ " [آل عمران: 8]\n" رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ " [البقرة: 201]\n" رَبَّنَا ظَلَمْنَا أَنْفُسَنَا وَإِنْ لَمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ الْخَاسِرِينَ " [الأعراف: 23]\n" رَبَّنَا آتِنَا مِنْ لَدُنْكَ رَحْمَةً وَهَيِّئْ لَنَا مِنْ أَمْرِنَا رَشَدًا " [الكهف: 10]'
      ];

      newDuas.forEach((dua, idx) => {
        const hasDua = prev.some(e => e.id === dua.id || e.content.includes(dua.content));
        if (!hasDua) {
          updated.push({
            id: dua.id,
            type: idx >= 5 ? 'verse' : 'dua',
            content: fullContents[idx],
            timestamp: Date.now(),
          });
          changed = true;
        }
      });

      if (changed) {
        saveEntries(updated);
        return updated;
      }
      return prev;
    });
  }, []);



  const moods = [
    { id: 'tired', icon: <Moon size={24} />, label: t('wallet_mood_tired'), color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800', activeColor: 'bg-indigo-600 text-white border-indigo-600 ring-indigo-500/30', dhikr: 'اللهم إني أتبرأ من حولي وقوتي والتجأ إلى حولك وقوتك. اللهم أعني ولا تعن علي، وأنصرني ولا تنصر علي، واهدني ويسّر الهدى لي .' },
    { id: 'optimistic', icon: <Sun size={24} />, label: t('wallet_mood_optimistic'), color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800', activeColor: 'bg-amber-500 text-white border-amber-500 ring-amber-500/30', dhikr: 'الْحَمْدُ للهِ حَمْداً كَثِيراً - "لَئِنْ شَكَرْتُمْ لَأَزِيدَنَّكُمْ"' },
    { id: 'anxious', icon: <Zap size={24} />, label: t('wallet_mood_anxious'), color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800', activeColor: 'bg-rose-500 text-white border-rose-500 ring-rose-500/30', dhikr: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللهِ - "فَإِنَّ مَعَ الْعُسْرِ يُسْراً"' },
    { id: 'calm', icon: <Smile size={24} />, label: t('wallet_mood_calm'), color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800', activeColor: 'bg-emerald-500 text-white border-emerald-500 ring-emerald-500/30', dhikr: 'الحمد لله الذي بنعمته تتم الصالحات. اللهم لك الحمد كما ينبغي لجلال وجهك وعظيم سلطانك. أشكرك يا رب على نعمة الهدوء والسكينة التي تغمر قلبي، وعلى كل خير أنعمت به عليّ.' },
    { id: 'sad', icon: <Frown size={24} />, label: t('wallet_mood_sad'), color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800', activeColor: 'bg-blue-600 text-white border-blue-600 ring-blue-500/30', dhikr: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ وَأَعُوذُ مِنَ الْعَجْزِ وَالْكَسَلِ وَأَعُوذُ بِكَ مِنَ الْجُبْنِ وَالْبُخْلِ وَأَعُوذُ بِكَ مِنْ غَلَبَةِ الدَّيْنِ وَقَهْرِ الرِّجَالِ' },
    { id: 'confused', icon: <HelpCircle size={24} />, label: t('wallet_mood_confused'), color: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-800', activeColor: 'bg-violet-600 text-white border-violet-600 ring-violet-500/30', dhikr: 'اللَّهُمَّ خِرْ لِي وَاخْتَرْ لِي، وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ' }
  ];

  const saveEntries = (entries: PersonalEntry[]) => {
    safeLocalStorageSetItem('personal_entries', JSON.stringify(entries));
  };

  const togglePin = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = personalEntries.map(entry => 
      entry.id === id ? { ...entry, isPinned: !entry.isPinned } : entry
    );
    setPersonalEntries(updated);
    saveEntries(updated);
  };

  const handleDeleteEntry = (id: string) => {
    const updated = personalEntries.filter(e => e.id !== id);
    setPersonalEntries(updated);
    saveEntries(updated);
  };

  const copyToClipboard = async (text: string, id: string) => {
    await copyTextToClipboard(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleEditEntry = (entry: PersonalEntry) => {
    setNewEntry({
      type: entry.type,
      content: entry.content,
      mood: entry.mood
    });
    setEditingEntryId(entry.id);
    setIsMoodModal(!!entry.mood);
    setIsAddModalOpen(true);
  };

  const handleShare = async (text: string) => {
    await shareContent('محفظتي الخاصة - تطبيق أذكار المؤمن azkar almumin', text);
  };

  const isRTL = isRtl;

  return (
    <div className="relative pb-8 bg-slate-50 dark:bg-slate-950 min-h-full" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Search & Filter Header (Clean & Minimal) */}
      <div className="px-6 py-6 border-b border-slate-100 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md sticky top-0 z-30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-3">
              <div className="w-1.5 h-6 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
              {t('wallet_title')}
            </h1>
            <p className="text-xs font-bold text-slate-400 mt-1 px-4 font-arabic">{t('wallet_subtitle')}</p>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        
        {/* Guest Authentication Banner */}
        {!user && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl p-5 sm:p-6 bg-teal-500/10 dark:bg-teal-500/5 border border-teal-500/20 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-2xl mx-auto shadow-sm"
          >
            <div className="space-y-1 text-center sm:text-right">
              <h4 className="text-sm font-black text-teal-800 dark:text-teal-400 flex items-center justify-center sm:justify-start gap-2">
                <Sparkles size={16} className="text-teal-600 dark:text-teal-400 shrink-0" />
                {settings.appLanguage === 'ar' ? 'مزامنة وحفظ تقدمك سحابياً' : settings.appLanguage === 'fr' ? 'Sauvegarder vos progrès' : 'Save your progress to Cloud'}
              </h4>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 leading-relaxed max-w-md">
                {settings.appLanguage === 'ar' 
                  ? 'سجّل دخولك الآن لحفظ وردك اليومي، أذكارك المفضلة، ونسبة تقدمك في المسبحة وسيرفراتنا السحابية بشكل آمن وتلقائي.'
                  : settings.appLanguage === 'fr'
                    ? 'Connectez-vous pour sauvegarder en toute sécurité votre progression, vos favoris et vos objectifs de dhikr dans le cloud.'
                    : 'Sign in now to automatically sync your daily progress, favorite Azkar, and goals securely to the cloud.'}
              </p>
            </div>
            <button
              onClick={() => navigate('/auth')}
              className="px-5 py-3 bg-teal-600 hover:bg-teal-700 active:scale-[0.98] text-white font-black text-xs rounded-xl transition-all shadow-md shrink-0 cursor-pointer"
            >
              {settings.appLanguage === 'ar' ? 'تسجيل الدخول / إنشاء حساب' : settings.appLanguage === 'fr' ? 'Connexion / Inscription' : 'Sign In / Sign Up'}
            </button>
          </motion.div>
        )}

        {/* Authenticated Cloud Status & Logout Banner */}
        {user && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl p-4 sm:p-5 bg-indigo-500/10 dark:bg-indigo-500/5 border border-indigo-500/20 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-2xl mx-auto shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div className="space-y-0.5 text-center sm:text-right">
                <h4 className="text-xs font-black text-slate-700 dark:text-slate-300">
                  {settings.appLanguage === 'ar' ? 'بياناتك متصلة بالسحاب بشكل آمن' : settings.appLanguage === 'fr' ? 'Vos données sont sécurisées dans le cloud' : 'Your progress is securely backed up'}
                </h4>
                <p className="text-[10px] font-bold text-slate-400">
                  {settings.appLanguage === 'ar' 
                    ? `مرحبًا ${user.displayName || user.email?.split('@')[0]} • تقدمك ومفضلتك قيد المزامنة التلقائية`
                    : `Welcome ${user.displayName || user.email?.split('@')[0]} • Your progress is synced`}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2.5 border border-rose-500/30 hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 font-black text-[11px] rounded-xl transition-all shrink-0 cursor-pointer"
            >
              {settings.appLanguage === 'ar' ? 'تسجيل الخروج' : settings.appLanguage === 'fr' ? 'Se déconnecter' : 'Sign Out'}
            </button>
          </motion.div>
        )}
        
        {/* Believer's Persistence Card (Modern & Compact ID Card) */}
        <motion.section className="pt-1">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              "overflow-hidden rounded-[2rem] p-5 sm:p-7 text-white shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] relative group border border-white/10",
              "bg-gradient-to-br from-indigo-900 via-purple-800 to-fuchsia-900 w-full max-w-2xl mx-auto shadow-purple-900/30"
            )}
            style={{ 
              transformStyle: 'preserve-3d'
            }}
          >
            {/* Premium decorative elements */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-[0.06] pointer-events-none mix-blend-soft-light" />
            <div className="absolute -top-32 -right-32 w-80 h-80 bg-white/5 rounded-full blur-[80px] group-hover:bg-white/15 transition-all duration-1000" />
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/10 to-transparent opacity-20" />
            
            <div className="flex flex-row items-center justify-between gap-6 relative z-10">
              {/* Right Side (Name & Level) */}
              <div className="flex-1 text-right" style={{ transform: 'translateZ(20px)' }}>
                <div className="space-y-3">
                  <div className="flex flex-col gap-2 items-start">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="px-2 py-0.5 bg-amber-500/20 backdrop-blur-md rounded-md border border-amber-500/30 flex items-center gap-1.5">
                        <Crown size={10} className="text-amber-400" />
                        <span className="text-[9px] font-black text-amber-200 uppercase tracking-widest">
                          {t('wallet_card_title')}
                        </span>
                      </div>
                      
                      <div className="px-2 py-0.5 bg-white/10 backdrop-blur-md rounded-md border border-white/20 flex items-center gap-1.5">
                        <Sparkles size={10} className="text-teal-300" />
                        <span className="text-[9px] font-bold text-white uppercase tracking-widest">
                          {personalEntries.length < 10 ? t('wallet_level_1') : personalEntries.length < 30 ? t('wallet_level_2') : personalEntries.length < 60 ? t('wallet_level_3') : t('wallet_level_4')}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-0.5">
                      <h2 className="text-2xl sm:text-3xl font-black text-white leading-none drop-shadow-lg font-sans tracking-tight flex items-center gap-2">
                        { (user?.displayName || t('wallet_o_good')).split(' ')[0] }
                        <div className="flex items-center gap-1 opacity-60">
                          <Medal size={12} className="text-amber-300" />
                          <Flame size={12} className="text-orange-400" />
                        </div>
                      </h2>
                      <div className="flex flex-col gap-1 text-[8px] font-black text-white/40 uppercase tracking-widest mt-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span>ID: BLV-{user?.uid?.substring(0, 5).toUpperCase() || 'ST7X'}</span>
                          <div className="w-0.5 h-0.5 bg-white/20 rounded-full" />
                          <span>{settings.appLanguage === 'ar' ? 'عضو منذ' : settings.appLanguage === 'fr' ? 'MEMBRE DEPUIS' : 'MEMBER SINCE'} {new Date(user?.metadata?.creationTime || Date.now()).getFullYear()}</span>
                        </div>
                        {user?.email && (
                          <span className="text-white/30 lowercase font-mono">{user.email}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Compact Progress */}
                  <div className="space-y-1.5 mt-4 max-w-[200px]">
                    <div className="flex justify-between items-center text-[9px] font-black tracking-widest opacity-80">
                      <span className="flex items-center gap-1"><Zap size={9} className="text-yellow-400" /> {t('wallet_persistence_eff')}</span>
                      <span className="text-emerald-300">{Math.round((personalEntries.length / (personalEntries.length < 10 ? 10 : personalEntries.length < 30 ? 30 : personalEntries.length < 60 ? 60 : 100)) * 100)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-black/30 rounded-full overflow-hidden p-0.5 border border-white/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(personalEntries.length / (personalEntries.length < 10 ? 10 : personalEntries.length < 30 ? 30 : personalEntries.length < 60 ? 60 : 100)) * 100}%` }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className="h-full bg-gradient-to-l from-emerald-400 to-teal-500 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.3)]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Left Side (Photo/Icon) */}
              <div className="shrink-0" style={{ transform: 'translateZ(40px)' }}>
                <div className="relative">
                  <div className="absolute inset-[-10%] bg-gradient-to-tr from-amber-500/20 to-teal-500/20 rounded-full blur-xl opacity-30 animate-pulse" />
                  
                  <div className="relative p-1.5 bg-gradient-to-tr from-white/30 via-white/10 to-white/30 rounded-[1.8rem] backdrop-blur-xl shadow-2xl ring-1 ring-white/20 transform -rotate-2 group-hover:rotate-0 transition-all duration-200">
                    <div className="relative overflow-hidden rounded-[1.5rem]">
                      {user?.photoURL ? (
                        <img 
                          src={user.photoURL} 
                          alt="User" 
                          referrerPolicy="no-referrer"
                          loading="lazy"
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-[1.5rem] object-cover hover:scale-105 transition-transform duration-300" 
                        />
                      ) : (
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[1.5rem] bg-slate-900/50 flex items-center justify-center border border-white/10">
                          <User size={30} className="text-white/20" />
                        </div>
                      )}
                    </div>
                    
                    {/* Compact Status Badge */}
                    <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-gradient-to-br from-emerald-400 to-teal-600 border-2 border-slate-900 rounded-xl flex items-center justify-center shadow-lg">
                      {walletPin ? (
                        <Lock size={12} className="text-white" strokeWidth={3} />
                      ) : (
                        <ShieldCheck size={14} className="text-white" strokeWidth={2.5} />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Elevated Compact Stats Row */}
            <div className="grid grid-cols-4 gap-2 mt-6 border-t border-white/10 pt-4 relative z-10">
              {[
                { icon: BookOpen, count: personalEntries.length, label: t('wallet_stat_cards'), color: 'from-indigo-500 to-indigo-700', shadow: 'rgba(99,102,241,0.3)' },
                { icon: Heart, count: personalEntries.filter(e => e.type === 'dua').length, label: t('wallet_stat_duas'), color: 'from-rose-500 to-rose-700', shadow: 'rgba(244,63,94,0.3)' },
                { icon: Star, count: personalEntries.filter(e => e.isPinned).length, label: t('wallet_stat_favs'), color: 'from-amber-500 to-amber-600', shadow: 'rgba(245,158,11,0.3)' },
                { icon: Clock, count: personalEntries.length > 0 ? new Date(personalEntries[0].timestamp).toLocaleDateString(settings.appLanguage === 'ar' ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'numeric' }) : '--', label: t('wallet_stat_update'), color: 'from-teal-500 to-teal-700', shadow: 'rgba(20,184,166,0.3)' }
              ].map((stat, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ y: -2 }}
                  className={cn(
                    "flex flex-col items-center justify-center p-2 rounded-2xl border border-white/10",
                    "bg-gradient-to-br",
                    stat.color
                  )}
                  style={{ boxShadow: `0 8px 16px -4px ${stat.shadow}` }}
                >
                  <div className="bg-white/20 p-1 rounded-lg mb-1 shadow-inner">
                    <stat.icon size={12} className="text-white" />
                  </div>
                  <div className="text-sm font-black text-white leading-none drop-shadow-sm">{stat.count}</div>
                  <div className="text-[7px] text-white/90 font-bold uppercase tracking-widest mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.section>


        {/* Dynamic Mood Bar - Now directly under Identity Card */}
        <motion.section 
          className="relative overflow-hidden bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 rounded-[2rem] p-6 sm:p-8 border border-white/20 shadow-[0_15px_40px_-10px_rgba(245,158,11,0.4)]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Subtle colored glowing orbs in the background */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl -z-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-600/30 rounded-full blur-3xl -z-10 pointer-events-none transform -translate-x-1/4 translate-y-1/4" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.05] pointer-events-none mix-blend-overlay" />
          
          <div className="flex flex-col lg:flex-row items-center gap-6 relative z-10">
            <div className="shrink-0 text-center lg:text-right flex flex-col items-center lg:items-start gap-3">
              <div>
                <h3 className="text-sm font-bold text-amber-100 mb-1">{t('wallet_how_is_heart')}</h3>
                <p className="text-xl font-black text-white">{t('wallet_select_feeling')}</p>
              </div>
              
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setIsMoodModal(true);
                  setEditingEntryId(null);
                  setNewEntry({ type: 'dua', content: '', mood: activeMood || undefined });
                  setIsAddModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white border border-white/30 flex items-center gap-2 shadow-lg backdrop-blur-md transition-all group transform transition-all duration-75 active:scale-[0.95] active:opacity-80"
              >
                <Plus size={14} strokeWidth={3} className="group-hover:rotate-90 transition-transform" />
                <span className="text-[10px] font-black">{t('wallet_add_dua_for_feeling')}</span>
              </motion.button>
            </div>
            
            <div className="flex flex-wrap flex-1 gap-2 justify-center lg:justify-start">
              {moods.map(mood => {
                const isActive = activeMood === mood.id;
                return (
                  <button
                    key={mood.id}
                    onClick={() => setActiveMood(activeMood === mood.id ? null : mood.id)}
                    className={cn(
"flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold transition-all border backdrop-blur-md transform transition-all duration-75 active:scale-[0.95] active:opacity-80",
                      isActive 
                        ? "bg-white text-orange-600 border-white scale-105 shadow-[0_8px_20px_rgba(0,0,0,0.15)]" 
                        : "bg-white/10 text-white border-white/20 hover:bg-white/20 hover:scale-105"
                    )}
                  >
                    {React.cloneElement(mood.icon as any, { size: 16, className: isActive ? "" : "opacity-80" })}
                    {mood.label}
                  </button>
                );
              })}
            </div>
          </div>

          <AnimatePresence >
             {activeMood && (
               <motion.div
                 key={activeMood}
                 initial={{ opacity: 0, height: 0, marginTop: 0 }}
                 animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                 exit={{ opacity: 0, height: 0, marginTop: 0 }}
                 className="overflow-hidden"
               >
                  <div className={cn(
                    "p-8 rounded-[1.5rem] relative overflow-hidden transition-all duration-500",
                    "bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-xl border-2",
                    "text-slate-800 dark:text-slate-100",
                    moods.find(m => m.id === activeMood)?.id === 'tired' ? 'border-indigo-500/30 shadow-indigo-500/20' : '',
                    moods.find(m => m.id === activeMood)?.id === 'optimistic' ? 'border-amber-500/30 shadow-amber-500/20' : '',
                    moods.find(m => m.id === activeMood)?.id === 'anxious' ? 'border-rose-500/30 shadow-rose-500/20' : '',
                    moods.find(m => m.id === activeMood)?.id === 'calm' ? 'border-emerald-500/30 shadow-emerald-500/20' : '',
                    moods.find(m => m.id === activeMood)?.id === 'sad' ? 'border-blue-500/30 shadow-blue-500/20' : '',
                    moods.find(m => m.id === activeMood)?.id === 'confused' ? 'border-violet-500/30 shadow-violet-500/20' : ''
                  )}>
                    {(() => {
                      const personalDua = personalEntries.find(e => e.mood === activeMood && e.type === 'dua');
                      return (
                        <>
                          <div className="flex items-center justify-between gap-4 mb-6">
                            <div className="flex items-center gap-4">
                             <div className={cn(
"shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-sm border transform transition-all duration-75 active:scale-[0.85] active:opacity-70",
                               moods.find(m => m.id === activeMood)?.activeColor
                             )}>
                               <Quote size={18} />
                             </div>
                             <span className="text-xs font-black uppercase tracking-widest opacity-60">رسالة لقلبك</span>
                            </div>
                            
                            {personalDua && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditEntry(personalDua)}
                                  className="p-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-all shadow-sm border border-emerald-100 dark:border-emerald-500/20 active:scale-90"
                                  title={t('wallet_edit')}
                                >
                                  <Edit3 size={16} />
                                </button>
                                <button
                                  onClick={() => handleDeleteEntry(personalDua.id)}
                                  className="p-2 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-all shadow-sm border border-rose-100 dark:border-rose-500/20 active:scale-90"
                                  title={t('wallet_delete')}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            )}
                          </div>

                           <div className="w-full relative z-10">
                             {personalDua ? (
                               <p className={cn(
                                 "text-xl md:text-2xl font-bold leading-relaxed w-full whitespace-pre-line",
                                 moods.find(m => m.id === activeMood)?.id === 'tired' ? 'text-indigo-600 dark:text-indigo-400' :
                                 moods.find(m => m.id === activeMood)?.id === 'optimistic' ? 'text-amber-600 dark:text-amber-400' :
                                 moods.find(m => m.id === activeMood)?.id === 'anxious' ? 'text-rose-600 dark:text-rose-400' :
                                 moods.find(m => m.id === activeMood)?.id === 'calm' ? 'text-emerald-600 dark:text-emerald-400' :
                                 moods.find(m => m.id === activeMood)?.id === 'sad' ? 'text-blue-600 dark:text-blue-400' :
                                 'text-violet-600 dark:text-violet-400'
                               )}>
                                 {personalDua.content}
                               </p>
                             ) : (
                               <p className={cn(
                                 "text-xl md:text-2xl font-bold leading-relaxed w-full whitespace-pre-line",
                                 moods.find(m => m.id === activeMood)?.id === 'tired' ? 'text-indigo-600 dark:text-indigo-400' :
                                 moods.find(m => m.id === activeMood)?.id === 'optimistic' ? 'text-amber-700 dark:text-amber-400' :
                                 moods.find(m => m.id === activeMood)?.id === 'anxious' ? 'text-rose-600 dark:text-rose-400' :
                                 moods.find(m => m.id === activeMood)?.id === 'calm' ? 'text-emerald-600 dark:text-emerald-400' :
                                 moods.find(m => m.id === activeMood)?.id === 'sad' ? 'text-blue-600 dark:text-blue-400' :
                                 'text-violet-600 dark:text-violet-400'
                               )}>
                                 {moods.find(m => m.id === activeMood)?.dhikr}
                               </p>
                             )}
                           </div>
                         </>
                       );
                     })()}
                   </div>
                  </motion.div>
              )}
          </AnimatePresence>
        </motion.section>

        {/* Settings Module & Spiritual Vault Section */}
        <section className="space-y-6" style={{ perspective: "1500px" }}>
          
          {/* Settings Capsule */}
          <div className="flex justify-center sm:justify-start px-2">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowWalletSettings(true)}
              className="px-6 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-3 shadow-lg shadow-indigo-500/20 transition-all group"
            >
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-white group-hover:rotate-45 transition-transform duration-500">
                <Settings size={14} />
              </div>
              <span className="text-xs font-black">{t('wallet_settings_btn')}</span>
            </motion.button>
          </div>

          {/* Header Title */}
          <div className="flex items-center justify-between px-2 mb-4">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Lock className="text-indigo-500" size={24} />
              {t('wallet_title')}
            </h2>
            {isUnlocked && (
               <button 
                onClick={() => setIsUnlocked(false)}
                className="text-[10px] sm:text-xs font-bold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors uppercase tracking-widest flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full shadow-sm transform transition-all duration-75 active:scale-[0.95] active:opacity-80"
               >
                 <Lock size={12} />
                 {t('wallet_lock_btn')}
               </button>
            )}
          </div>

          {!isUnlocked && (
            <motion.div 
               whileHover={{ translateY: -2 }}
               className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6"
            >
               <div className="flex items-center gap-4 z-10">
                 <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner shrink-0">
                   <ShieldCheck size={32} />
                 </div>
                 <div>
                   <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-1">{t('wallet_spiritual_vault')}</h2>
                   <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">{t('wallet_vault_desc')}</p>
                 </div>
               </div>
               
               <div className="flex items-center gap-3 w-full md:w-auto z-10 shrink-0">
                 {!walletPin && !isSettingNewPin && (
                    <>
                      <button
                        onClick={() => setIsSettingNewPin(true)}
                        className="flex-1 md:flex-none px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
                      >
                        <Lock size={18} />
                        {t('wallet_enable_protection')}
                      </button>
                      <button
                        onClick={() => setIsUnlocked(true)}
                        className="flex-1 md:flex-none px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      >
                        {t('wallet_skip')}
                      </button>
                    </>
                 )}
               </div>
               
               <div className="absolute left-0 top-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none" />
            </motion.div>
          )}


          {/* Private Wallet Lock Screen - Modern 3D Design */}
          <AnimatePresence>
          {(isSettingNewPin || (walletPin && !isUnlocked)) && (
            <motion.div
              layoutId="wallet-lock-screen"
              initial={{ opacity: 0, scale: 0.95, y: 20, rotateX: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20, rotateX: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative overflow-hidden bg-gradient-to-b from-white/95 to-slate-50/95 dark:from-slate-900/95 dark:to-slate-950/95 backdrop-blur-3xl p-4 sm:p-5 rounded-[2rem] border border-white/60 dark:border-white/10 flex flex-col items-center justify-center space-y-3 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.2)] dark:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.7)] max-w-[260px] mx-auto z-50 mb-4 [perspective:1000px]"
            >
              {/* Unique vibrant background glow */}
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-teal-500/20 dark:bg-teal-400/10 blur-[30px] rounded-full pointer-events-none" />
              <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-purple-500/20 dark:bg-purple-400/10 blur-[30px] rounded-full pointer-events-none" />
              
              <AnimatePresence mode="wait">
                {isResetting ? (
                  <motion.div
                    key="reset"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="w-full space-y-3 flex flex-col items-center py-1 relative z-10"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl flex items-center justify-center shadow-[0_4px_10px_-2px_rgba(99,102,241,0.4)] ring-2 ring-indigo-500/20">
                      <HelpCircle size={20} />
                    </div>
                    <div className="text-center space-y-1">
                      <h3 className="text-sm font-black text-slate-800 dark:text-white">إعادة تعيين الرمز</h3>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 px-1 leading-relaxed">
                        {auth.currentUser?.email 
                          ? `سيتم إرسال التعليمات لبريدك المسجل`
                          : 'هل تود إعادة تعيين رمز القفل؟'}
                      </p>
                    </div>

                    <div className="flex gap-2 w-full mt-1">
                      <button
                        onClick={() => setIsResetting(false)}
                        className="flex-1 py-2 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-[10px] font-bold hover:bg-slate-50 border border-slate-200 dark:border-slate-700 transition-all shadow-[0_2px_0_0_rgb(226,232,240)] dark:shadow-[0_2px_0_0_rgb(51,65,85)] active:translate-y-px active:shadow-none"
                      >
                        إلغاء
                      </button>
                      <button
                        onClick={handleResetPin}
                        className="flex-[2] py-2 bg-gradient-to-r from-rose-500 to-red-600 text-white rounded-lg text-[10px] font-bold hover:brightness-110 transition-all shadow-[0_2px_0_0_rgb(159,18,57)] active:translate-y-px active:shadow-none"
                      >
                        تأكيد
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="pin"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="w-full flex flex-col items-center space-y-3 relative z-10"
                  >
                    <div className="text-center space-y-1">
                       <div className="mx-auto w-10 h-10 relative flex items-center justify-center">
                         <div className="absolute inset-0 bg-gradient-to-tr from-teal-400 to-emerald-500 rounded-xl rotate-3 opacity-20 blur-sm" />
                         <div className="w-9 h-9 bg-gradient-to-tr from-teal-500 to-emerald-400 rounded-xl flex items-center justify-center text-white shadow-[0_4px_10px_-2px_rgba(16,185,129,0.5)] ring-2 ring-white/50 dark:ring-slate-900/50 relative z-10">
                           {isSettingNewPin ? <Settings size={18} /> : <Lock size={18} className={isUnlocked ? "hidden" : "block"} />}
                         </div>
                       </div>
                       <h3 className="text-[9px] font-black tracking-widest text-teal-600 dark:text-teal-400 uppercase drop-shadow-sm mt-1">
                         {isSettingNewPin ? 'إعداد رمز جديد' : 'محفظة آمنة'}
                       </h3>
                    </div>

                    <div className="flex gap-2 my-1">
                      {[...Array(4)].map((_, i) => {
                        const filled = pinInput.length > i;
                        return (
                          <motion.div
                            key={i}
                            animate={
                              lockError ? { x: [0, -5, 5, -5, 5, 0] } : 
                              isSuccess ? { scale: [1, 1.3, 1], y: [0, -4, 0] } : 
                              filled ? { scale: [1, 1.2, 1] } : {}
                            }
                            transition={{ duration: lockError ? 0.4 : 0.2 }}
                            className={cn(
                              "w-2.5 h-2.5 rounded-full transition-all duration-300 relative",
                              isSuccess 
                                ? "bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]"
                                : filled 
                                  ? "bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.6)] scale-110" 
                                  : "bg-slate-200 dark:bg-slate-700 shadow-inner"
                            )}
                          >
                            {filled && (
                              <div className="absolute inset-0 rounded-full bg-white opacity-40 animate-pulse" />
                            )}
                          </motion.div>
                        );
                      })}
                    </div>

                    <div className="h-2 flex items-center justify-center mt-[-4px]">
                      <AnimatePresence>
                        {lockError && (
                          <motion.p 
                            initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="text-rose-500 dark:text-rose-400 text-[8px] font-black bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 rounded-full"
                          >
                            غير صحيح
                          </motion.p>
                        )}
                        {isSuccess && (
                          <motion.p 
                            initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="text-emerald-600 dark:text-emerald-400 text-[8px] font-black bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1"
                          >
                            <Check size={8} /> التحقق ناجح
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="grid grid-cols-3 gap-x-2 gap-y-2 w-full px-1 mt-1">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                        <motion.button
                          key={num}
                          whileTap={{ scale: 0.9, y: 1 }}
                          onClick={() => handlePinAction(num.toString())}
                          className="h-10 w-10 mx-auto rounded-xl bg-white dark:bg-slate-800 text-base font-black text-slate-800 dark:text-white transition-all hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-center border border-slate-200 dark:border-slate-700 focus:outline-none shadow-[0_2px_0_0_rgb(226,232,240)] dark:shadow-[0_2px_0_0_rgb(51,65,85)] active:shadow-none active:translate-y-px"
                        >
                          {num}
                        </motion.button>
                      ))}
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          if (isSettingNewPin) {
                            setIsSettingNewPin(false);
                            setFirstPinAttempt('');
                          } else {
                            setIsResetting(true);
                          }
                          setPinInput('');
                        }}
                        className="h-10 w-10 mx-auto rounded-xl text-slate-400 hover:text-rose-500 flex items-center justify-center transition-all focus:outline-none font-bold text-[9px]"
                      >
                         {isSettingNewPin ? 'إلغاء' : 'نسيت؟'}
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.9, y: 1 }}
                        onClick={() => handlePinAction('0')}
                        className="h-10 w-10 mx-auto rounded-xl bg-white dark:bg-slate-800 text-base font-black text-slate-800 dark:text-white transition-all hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-center border border-slate-200 dark:border-slate-700 focus:outline-none shadow-[0_2px_0_0_rgb(226,232,240)] dark:shadow-[0_2px_0_0_rgb(51,65,85)] active:shadow-none active:translate-y-px"
                      >
                        0
                      </motion.button>
                       <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={clearPin}
                        className="h-10 w-10 mx-auto rounded-xl flex items-center justify-center text-slate-400 hover:text-teal-500 focus:outline-none transition-colors"
                      >
                         <Delete className="w-5 h-5" />
                      </motion.button>
                    </div>

                    <div className="flex w-full justify-between items-center px-1 pt-2 border-t border-slate-100 dark:border-white/5 mt-1">
                      {walletPin && (
                        <button 
                          onClick={removePin}
                          className="text-[9px] text-slate-400 hover:text-rose-500 transition-colors uppercase font-bold tracking-widest flex items-center gap-1 mx-auto"
                        >
                          <Unlock size={10} />
                          تعطيل القفل
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
          </AnimatePresence>

          {isUnlocked && (
            <div className="space-y-4">
              {/* Wallet Controls Rack */}
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center"
              >
                {/* Search Bar */}
                <div className="relative flex-1 group">
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                    <Search size={16} />
                  </div>
                  <input
                    type="text"
                    placeholder={t('wallet_search_placeholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full h-10 pr-10 pl-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                  {searchTerm && (
                    <button 
                      onClick={() => setSearchTerm('')}
                      className="absolute inset-y-0 left-3 flex items-center text-slate-400 hover:text-rose-500"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Add Button & Filter Chips Container */}
                <div className="flex gap-2 items-center">
                  <button
                    onClick={() => {
                      setIsMoodModal(false);
                      setEditingEntryId(null);
                      setModalTab('presets');
                      setPresetSearch('');
                      setPresetCategory('all');
                      setNewEntry({ type: 'thought', content: '' });
                      setIsAddModalOpen(true);
                    }}
                    className="h-10 px-4 bg-indigo-600 text-white rounded-xl font-bold text-xs hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 shrink-0 duration-75 active:scale-[0.85] active:opacity-70"
                  >
                    <Plus size={16} strokeWidth={3} />
                    <span>{t('wallet_add_new')}</span>
                  </button>

                  {/* Filter Chips */}
                  <div className="flex gap-2 bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar whitespace-nowrap scroll-smooth">
                    {(['all', 'dhikr', 'dua', 'verse', 'hadith', 'thought'] as const).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={cn(
                          "px-4 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2",
                          activeFilter === filter
                            ? (
                                filter === 'all' ? "bg-slate-900 text-white shadow-lg dark:bg-white dark:text-slate-900" :
                                filter === 'dhikr' ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" :
                                filter === 'dua' ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20" :
                                filter === 'verse' ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20" :
                                filter === 'hadith' ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20" :
                                "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                              )
                            : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                        )}
                      >
                        {filter === 'all' && t('wallet_filter_all')}
                        {filter === 'dhikr' && t('wallet_filter_dhikr')}
                        {filter === 'dua' && t('wallet_filter_dua')}
                        {filter === 'verse' && t('wallet_filter_verse')}
                        {filter === 'hadith' && t('wallet_filter_hadith')}
                        {filter === 'thought' && t('wallet_filter_thought')}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Entries List */}
              <div className="grid grid-cols-1 gap-3 pb-6">
                <AnimatePresence mode="popLayout">
                  {filteredEntries.map((entry, index) => (
                    <motion.div
                      layout
                      key={entry.id}
                      initial={{ opacity: 0, scale: 0.9, y: 30, rotateX: 10 }}
                      whileInView={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
                      viewport={{ once: true }}
                      whileHover={{ 
                        y: -8, 
                        rotateX: 2, 
                        rotateY: -1,
                        transition: { duration: 0.3, ease: "easeOut" }
                      }}
                      className={cn(
                        "relative p-5 sm:p-6 rounded-[1.5rem] transition-all duration-500 group space-y-3 flex flex-col justify-between shadow-lg hover:shadow-xl hover:-translate-y-1 overflow-hidden border border-white/10 w-full",
                        entry.type === 'dhikr' && "bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-teal-500/20",
                        entry.type === 'dua' && "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-blue-500/20",
                        entry.type === 'verse' && "bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-amber-500/20",
                        entry.type === 'hadith' && "bg-gradient-to-br from-purple-500 to-fuchsia-600 text-white shadow-purple-500/20",
                        entry.type === 'thought' && "bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-indigo-500/20"
                      )}
                      style={{ transformStyle: "preserve-3d" }}
                    >
                      {/* Decorative Background Glow */}
                      <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/10 blur-[50px] rounded-full pointer-events-none group-hover:bg-white/20 transition-colors duration-500" />
                      <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-black/10 blur-[50px] rounded-full pointer-events-none group-hover:bg-black/20 transition-colors duration-500" />

                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-3">
                          <div className={cn(
"w-12 h-12 rounded-xl flex items-center justify-center shadow-inner transform transition-all duration-75 active:scale-[0.85] active:opacity-70 group-hover:scale-110 relative bg-white/20 backdrop-blur-md border border-white/30 text-white"
                          )}>
                             {entry.type === 'dhikr' && <Sparkles size={20} />}
                             {entry.type === 'dua' && <Heart size={20} />}
                             {entry.type === 'verse' && <BookOpen size={20} />}
                             {entry.type === 'hadith' && <MessageCircle size={20} />}
                             {entry.type === 'thought' && <Quote size={20} />}
                             
                             {entry.isPinned && (
                               <div className="absolute -top-1 -right-1 bg-yellow-400 text-yellow-900 w-5 h-5 rounded-full flex items-center justify-center shadow-sm z-20">
                                 <Star size={10} fill="currentColor" />
                               </div>
                             )}
                          </div>
                          <div className="flex items-center gap-2">
                             <button
                               onClick={(e) => togglePin(entry.id, e)}
                               className={cn(
                                 "p-2 rounded-xl transition-all duration-75 active:scale-[0.85] active:opacity-70 border",
                                 entry.isPinned 
                                   ? "bg-yellow-400 border-yellow-300 text-yellow-900 shadow-lg shadow-yellow-500/20" 
                                   : "bg-white/10 border-white/20 text-white/70 hover:bg-white/20 hover:text-white"
                               )}
                             >
                               <Star size={16} fill={entry.isPinned ? "currentColor" : "none"} />
                             </button>
                             <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/20 backdrop-blur-md border border-white/20 shadow-inner text-white">
                               {entry.type === 'dhikr' && t('wallet_type_dhikr')}
                               {entry.type === 'dua' && t('wallet_type_dua')}
                               {entry.type === 'verse' && t('wallet_type_verse')}
                               {entry.type === 'hadith' && t('wallet_type_hadith')}
                               {entry.type === 'thought' && t('wallet_type_thought')}
                             </span>
                          </div>
                        </div>
                        
                        <p 
                          className="text-lg sm:text-xl font-bold leading-relaxed text-white drop-shadow-md whitespace-pre-wrap relative z-10 w-full" 
                          dir="rtl"
                          style={{ fontFamily: walletFont }}
                        >
                          {entry.content}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-4 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 relative z-10 border-t border-white/10 mt-auto">
                        <div className="flex items-center gap-2 w-full justify-end">
                          <button
                            onClick={() => copyToClipboard(entry.content, entry.id)}
                            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white/10 text-white border border-white/20 rounded-lg text-[11px] font-bold hover:bg-white/20 transition-all backdrop-blur-sm"
                          >
                            {copiedId === entry.id ? <Check size={14} /> : <Copy size={14} />}
                            <span className="hidden sm:inline">{copiedId === entry.id ? t('wallet_copied') : t('wallet_copy')}</span>
                          </button>
                          <button
                            onClick={() => handleShare(entry.content)}
                            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white/10 text-white border border-white/20 rounded-lg text-[11px] font-bold hover:bg-white/20 transition-all backdrop-blur-sm"
                          >
                            <Share2 size={14} />
                            <span className="hidden sm:inline">{t('wallet_share')}</span>
                          </button>
                          <button
                            onClick={() => handleEditEntry(entry)}
                            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white/10 text-white border border-white/20 rounded-lg text-[11px] font-bold hover:bg-white/20 transition-all backdrop-blur-sm"
                          >
                            <Edit3 size={14} />
                            <span className="hidden sm:inline">{t('wallet_edit')}</span>
                          </button>
                          <button
                            onClick={() => handleDeleteEntry(entry.id)}
                            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-black/10 text-white border border-black/20 rounded-lg text-[11px] font-bold hover:bg-black/20 hover:text-rose-200 transition-all backdrop-blur-sm ml-auto"
                          >
                            <Trash2 size={14} />
                            <span className="hidden sm:inline">{t('wallet_delete')}</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {filteredEntries.length === 0 && (
                  <div className="col-span-full py-20 text-center space-y-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                    <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto text-slate-300 dark:text-slate-600 shadow-sm">
                      <Search size={24} />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        {searchTerm ? t('wallet_no_match') : t('wallet_empty')}
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs mx-auto">
                        {searchTerm 
                          ? t('wallet_search_try_other') 
                          : t('wallet_empty_start')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Wallet Settings Modal moved to end */}
        </section>

        {/* Badge Gallery & Achievements System */}
        <section className="space-y-6">
          {/* Header & Challenges Shortcut */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-2">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
                <div className="p-2 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  <Award size={26} />
                </div>
                <span>نظام الأوسمة والإنجازات</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                أوسمة شرفية تكافئ تقدمك في تلاوة القرآن الكريم والأذكار والمواظبة اليومية
              </p>
            </div>
            
            <button 
              onClick={() => navigate('/challenges')}
              className="self-start sm:self-auto text-xs font-black text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 px-4 py-2.5 rounded-2xl hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all active:scale-95 flex items-center gap-2 shadow-sm"
            >
              <Sparkles size={16} className="text-amber-500" />
              <span>{t('wallet_view_challenges')}</span>
            </button>
          </div>

          {/* Progress Summary Card */}
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-5 border border-indigo-500/20 shadow-xl relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-40 h-40 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-300 bg-amber-500/20 border border-amber-500/30 px-3 py-0.5 rounded-full">
                    حصيلة الأوسمة
                  </span>
                  <span className="text-xs text-slate-300">
                    تم تحقيق <strong>{earnedBadgesCount}</strong> من أصل <strong>{VISUAL_BADGES.length}</strong> وسام
                  </span>
                </div>
                <h3 className="text-lg font-black text-white">
                  {earnedBadgesCount === VISUAL_BADGES.length 
                    ? 'ما شاء الله! حققت كافة الأوسمة والإنجازات المباركة 🏆' 
                    : earnedBadgesCount > 0 
                      ? 'واصل المسير في تلاوة القرآن والذكر لنيل باقي الأوسمة ✨' 
                      : 'ابدأ اليوم بقراءة القرآن والتسبيح لنيل أول وسام إيماني 🌟'}
                </h3>
              </div>

              {/* Completion Rate Pill */}
              <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-3 min-w-[200px]">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-400 to-yellow-600 flex items-center justify-center text-slate-950 font-black text-sm shadow-md">
                  {Math.round((earnedBadgesCount / VISUAL_BADGES.length) * 100)}%
                </div>
                <div>
                  <div className="text-[11px] text-slate-400 font-bold">نسبة الإنجاز</div>
                  <div className="text-sm font-black text-white">
                    {earnedBadgesCount} / {VISUAL_BADGES.length} مكتسب
                  </div>
                </div>
              </div>
            </div>

            {/* Overall Progress Bar */}
            <div className="mt-4 pt-3 border-t border-white/10">
              <div className="h-2.5 w-full bg-white/10 rounded-full overflow-hidden p-0.5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(earnedBadgesCount / VISUAL_BADGES.length) * 100}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-300 shadow-md shadow-amber-500/40"
                />
              </div>
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {[
              { id: 'all', label: 'كافة الأوسمة', icon: '🌟', count: visualBadgesWithStatus.length },
              { id: 'quran', label: 'القرآن الكريم', icon: '📖', count: visualBadgesWithStatus.filter(b => b.badge.category === 'quran').length },
              { id: 'adhkar', label: 'الأذكار والتسبيح', icon: '📿', count: visualBadgesWithStatus.filter(b => b.badge.category === 'adhkar' || b.badge.category === 'tasbih').length },
              { id: 'streak', label: 'الثبات والإيمان', icon: '🔥', count: visualBadgesWithStatus.filter(b => b.badge.category === 'streak' || b.badge.category === 'knowledge').length },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setBadgeCategoryFilter(tab.id as any)}
                className={cn(
                  "px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap active:scale-95 shadow-sm",
                  badgeCategoryFilter === tab.id
                    ? "bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 shadow-md"
                    : "bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80"
                )}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-[10px]",
                  badgeCategoryFilter === tab.id
                    ? "bg-white/20 text-white dark:bg-slate-950/30 dark:text-slate-950"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                )}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Badges Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBadges.map(({ badge, status }) => {
              const isEarned = status.isEarned;
              return (
                <motion.div
                  key={badge.id}
                  whileHover={{ y: -4, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleOpenBadge(badge, status)}
                  className={cn(
                    "relative p-5 rounded-3xl border-2 cursor-pointer transition-all duration-300 flex flex-col justify-between gap-4 overflow-hidden group select-none text-right",
                    isEarned 
                      ? "bg-white dark:bg-slate-900/90 border-emerald-500/30 dark:border-emerald-500/30 shadow-[0_10px_25px_rgba(16,185,129,0.12)] hover:border-emerald-500/60" 
                      : "bg-slate-50/80 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700"
                  )}
                  dir="rtl"
                >
                  {/* Ambient Light for Earned */}
                  {isEarned && (
                    <div className="absolute -top-12 -right-12 w-28 h-28 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />
                  )}

                  {/* Card Header: Icon + Rarity Tag */}
                  <div className="flex items-start justify-between gap-3">
                    {/* Badge Icon Capsule */}
                    <div className="relative">
                      <div className={cn(
                        "w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300",
                        isEarned 
                          ? cn("bg-gradient-to-tr text-white", badge.gradient, badge.borderGlow)
                          : "bg-slate-200 dark:bg-slate-800 text-slate-400 grayscale opacity-75"
                      )}>
                        {getBadgeVisualIcon(badge.iconName, 30)}
                      </div>

                      {/* Earned Check / Lock Icon */}
                      {isEarned ? (
                        <div className="absolute -bottom-1.5 -left-1.5 bg-emerald-500 text-white p-1 rounded-lg shadow-md border-2 border-white dark:border-slate-900">
                          <Check size={12} className="stroke-[3]" />
                        </div>
                      ) : (
                        <div className="absolute -bottom-1.5 -left-1.5 bg-slate-400 dark:bg-slate-700 text-white p-1 rounded-lg shadow-md border-2 border-white dark:border-slate-900">
                          <Lock size={12} />
                        </div>
                      )}
                    </div>

                    {/* Rarity & Status Badges */}
                    <div className="flex flex-col items-end gap-1.5">
                      <span className={cn(
                        "text-[10px] font-black px-2.5 py-0.5 rounded-full border",
                        badge.rarity === 'legendary' 
                          ? "bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/30"
                          : badge.rarity === 'epic'
                            ? "bg-purple-500/15 text-purple-600 dark:text-purple-300 border-purple-500/30"
                            : badge.rarity === 'rare'
                              ? "bg-teal-500/15 text-teal-600 dark:text-teal-300 border-teal-500/30"
                              : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30"
                      )}>
                        {badge.rarityLabel}
                      </span>
                      
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-md",
                        isEarned 
                          ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-extrabold"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                      )}>
                        {isEarned ? "مكتسب 🎉" : "قيد الإنجاز"}
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-1 my-1">
                    <h4 className="text-base font-black text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-amber-400 transition-colors">
                      {badge.name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {badge.description}
                    </p>
                  </div>

                  {/* Progress Bar & Detailed Meter */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5">
                    <div className="flex justify-between items-center text-[11px] font-bold">
                      <span className="text-slate-500 dark:text-slate-400">
                        {status.current.toLocaleString()} / {status.target.toLocaleString()} {status.unit}
                      </span>
                      <span className={isEarned ? "text-emerald-600 dark:text-emerald-400 font-extrabold" : "text-amber-600 dark:text-amber-400"}>
                        {status.percent}%
                      </span>
                    </div>

                    <div className="h-2 w-full bg-slate-200/80 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${status.percent}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className={cn(
                          "h-full rounded-full",
                          isEarned 
                            ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                            : "bg-gradient-to-r from-amber-400 to-orange-500"
                        )}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Interactive Modals */}
          <BadgeDetailModal
            badge={selectedBadge}
            isOpen={isDetailModalOpen}
            onClose={() => setIsDetailModalOpen(false)}
            status={selectedBadgeStatus}
          />

          <BadgeCelebrationModal
            badge={celebrationBadge}
            isOpen={isCelebrationOpen}
            onClose={() => setIsCelebrationOpen(false)}
          />
        </section>

        {/* Smart Statistics Preview */}
        <motion.section 
          whileHover={{ rotateX: -2, rotateY: 1, y: -5 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-violet-950 border border-indigo-500/20 p-8 text-white mt-8 group shadow-[0_30px_70px_rgba(30,27,75,0.5)]"
          style={{ perspective: "1000px" }}
        >
          {/* Animated Background Gradients */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-[50%] -left-[10%] w-[70%] h-[150%] bg-indigo-500/20 blur-[120px] rounded-full group-hover:bg-indigo-500/30 transition-colors duration-1000" />
            <div className="absolute -bottom-[50%] -right-[10%] w-[70%] h-[150%] bg-violet-500/20 blur-[120px] rounded-full group-hover:bg-violet-500/30 transition-colors duration-1000" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] mix-blend-overlay"></div>
          </div>
          
          <div className="relative z-10 flex flex-col gap-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                  {t('wallet_smart_insight')}
                </h2>
                <p className="text-indigo-200/80 text-sm max-w-sm">{t('wallet_smart_insight_desc')}</p>
              </div>
              
              <div className="hidden sm:flex w-14 h-14 bg-white/5 border border-white/10 rounded-2xl items-center justify-center backdrop-blur-md shadow-inner">
                <Activity size={28} className="text-indigo-400 group-hover:scale-110 transition-transform duration-500" />
              </div>
            </div>
            
            <div className="flex flex-col gap-4">
              <motion.div 
                whileHover={{ scale: 1.02, translateZ: 20 }}
                className="min-h-[120px] flex items-center justify-between bg-white/5 hover:bg-white/10 transition-all border border-white/10 p-6 sm:p-8 rounded-3xl backdrop-blur-md relative overflow-hidden group/card shadow-[0_10px_30px_rgba(0,0,0,0.2)]"
                style={{ transformStyle: "preserve-3d" }}
              >
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-emerald-500/20 blur-xl rounded-full group-hover/card:bg-emerald-500/30 transition-colors" />
                <div className="relative z-10 flex items-center gap-4 sm:gap-5" style={{ transform: "translateZ(30px)" }}>
                  <div className="p-3.5 bg-emerald-500/20 text-emerald-400 rounded-2xl shadow-inner border border-emerald-500/20 hidden sm:block">
                    <BookOpen size={28} />
                  </div>
                  <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl shadow-inner border border-emerald-500/20 sm:hidden">
                    <BookOpen size={22} />
                  </div>
                  <div className="flex flex-col">
                    <div className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-wider mb-0.5 sm:mb-1">{t('wallet_collection')}</div>
                    <div className="text-base sm:text-lg font-bold text-slate-100">{t('wallet_saved_faith_items')}</div>
                  </div>
                </div>
                <div className="relative z-10 flex items-end gap-2">
                  <span className="text-4xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-emerald-500">
                    {personalEntries.length}
                  </span>
                  <span className="text-sm font-bold text-slate-400 mb-1">{t('wallet_item_unit')}</span>
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.02, translateZ: 20 }}
                className="min-h-[120px] flex items-center justify-between bg-white/5 hover:bg-white/10 transition-all border border-white/10 p-6 sm:p-8 rounded-3xl backdrop-blur-md relative overflow-hidden group/card shadow-[0_10px_30px_rgba(0,0,0,0.2)]"
                style={{ transformStyle: "preserve-3d" }}
              >
                <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-rose-500/20 blur-xl rounded-full group-hover/card:bg-rose-500/30 transition-colors" />
                <div className="relative z-10 flex items-center gap-4 sm:gap-5" style={{ transform: "translateZ(30px)" }}>
                  <div className="p-3.5 bg-rose-500/20 text-rose-400 rounded-2xl shadow-inner border border-rose-500/20 hidden sm:block">
                    <Heart size={28} className={cn(activeMood ? "animate-pulse" : "")} />
                  </div>
                  <div className="p-2.5 bg-rose-500/20 text-rose-400 rounded-xl shadow-inner border border-rose-500/20 sm:hidden">
                    <Heart size={22} className={cn(activeMood ? "animate-pulse" : "")} />
                  </div>
                  <div className="flex flex-col">
                    <div className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-wider mb-0.5 sm:mb-1">{t('wallet_now')}</div>
                    <div className="text-base sm:text-lg font-bold text-slate-100">{t('wallet_current_heart_state')}</div>
                  </div>
                </div>
                <div className="relative z-10 text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-300 to-rose-500">
                  {activeMood ? t(`wallet_mood_${activeMood}` as any) : t('wallet_not_determined')}
                </div>
              </motion.div>
            </div>
            
            <div className="bg-indigo-950/50 border border-indigo-500/30 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-4 backdrop-blur-md shadow-inner mt-2">
              <div>
                <h4 className="text-base font-bold text-indigo-100 mb-1">{t('wallet_advanced_soon')}</h4>
                <p className="text-xs text-indigo-200/70 leading-relaxed">
                  {t('wallet_advanced_soon_desc')}
                </p>
              </div>
            </div>
          </div>
        </motion.section>

      </main>

      {/* Floating Action Button (FAB) for quick add */}
      {isUnlocked && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsAddModalOpen(true)}
          className={cn(
            "fixed bottom-24 right-2 w-12 h-12 rounded-full shadow-2xl flex items-center justify-center z-[200] text-white",
            "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/40 transition-colors"
          )}
        >
          <Plus size={24} strokeWidth={3} />
        </motion.button>
      )}

      {/* Modals outside of all layout containers to avoid fixed positioning issues (black screen bug) */}
      <AnimatePresence>
        {showWalletSettings && (
            <motion.div 
              key="settings-modal"
              className="fixed inset-0 z-[110] flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowWalletSettings(false)}
                className="absolute inset-0 bg-slate-900/60 dark:bg-slate-900/80 backdrop-blur-md"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-sm max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-black/5 dark:border-white/5 overflow-hidden"
              >
                <div className="flex-none flex items-center justify-between p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center">
                      <Settings size={22} />
                    </div>
                    {t('wallet_settings_title')}
                  </h3>
                  <button 
                    onClick={() => setShowWalletSettings(false)}
                    className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center hover:bg-rose-500 hover:text-white transform transition-all duration-75 active:scale-[0.85] active:opacity-70 z-10"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-7">
                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{t('wallet_display_system')}</p>
                    <button
                      onClick={() => {
                        const nextOrder = sortOrder === 'newest' ? 'oldest' : 'newest';
                        setSortOrder(nextOrder);
                        safeLocalStorageSetItem('wallet_sort_order', nextOrder);
                      }}
                      className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl hover:border-indigo-500/30 transition-all font-black"
                    >
                      <div className="flex items-center gap-3">
                        <ArrowUpDown size={18} className="text-indigo-500" />
                        <span className="text-slate-700 dark:text-slate-300">{t('wallet_sort_order')}</span>
                      </div>
                      <span className="text-[10px] text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-full transform transition-all duration-75 active:scale-[0.95] active:opacity-80">
                        {sortOrder === 'newest' ? t('wallet_newest') : t('wallet_oldest')}
                      </span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{t('wallet_saved_font')}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { name: 'Tajawal', key: 'wallet_font_tajawal' },
                        { name: 'Cairo', key: 'wallet_font_cairo' },
                        { name: 'Alexandria', key: 'wallet_font_alexandria' },
                        { name: 'Zain', key: 'wallet_font_zain' },
                        { name: 'Almarai', key: 'wallet_font_almarai' },
                        { name: 'Amiri', key: 'wallet_font_amiri' },
                        { name: 'Reem Kufi', key: 'wallet_font_reem' },
                        { name: 'Readex Pro', key: 'wallet_font_readex' }
                      ].map((font) => (
                        <button
                          key={font.name}
                          onClick={() => {
                            setWalletFont(font.name);
                            safeLocalStorageSetItem('wallet_font_family', font.name);
                          }}
                          style={{ fontFamily: font.name }}
                          className={cn(
                            "p-3 rounded-xl border-2 text-sm transition-all font-bold",
                            walletFont === font.name 
                              ? "bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/20 scale-105" 
                              : "bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                          )}
                        >
                          {t(font.key as any)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{t('wallet_privacy')}</p>
                    <button
                      onClick={() => {
                        setShowWalletSettings(false);
                        setIsSettingNewPin(true);
                        setIsUnlocked(false);
                      }}
                      className="w-full flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl hover:border-indigo-500/30 transition-all font-black"
                    >
                      <Lock size={18} className="text-indigo-600" />
                      <span className="text-slate-700 dark:text-slate-300">{t('wallet_change_lock')}</span>
                    </button>
                  </div>

                  <div className="space-y-3 pt-4">
                    <button
                      onClick={() => {
                        if (window.confirm(t('wallet_clear_confirm'))) {
                          setPersonalEntries([]);
                          saveEntries([]);
                          setShowWalletSettings(false);
                        }
                      }}
                      className="w-full flex items-center gap-3 p-4 bg-rose-50 dark:bg-rose-950/20 border-2 border-rose-100 dark:border-rose-900/30 rounded-2xl hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-all font-black text-rose-600"
                    >
                      <RotateCcw size={18} />
                      <span>{t('wallet_clear_contents')}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      {/* Add New Entry / Presets Catalog Modal Portal */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isAddModalOpen && (
            <motion.div 
              key="wallet-add-edit-modal"
              className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6"
            >
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => {
                  setIsAddModalOpen(false);
                  setIsMoodModal(false);
                  setEditingEntryId(null);
                }}
                className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
              />

              {/* Toast Notification for Quick Add */}
              <AnimatePresence>
                {addedToast && (
                  <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.9 }}
                    className="absolute top-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-bold text-xs sm:text-sm border border-emerald-400/40 max-w-[90vw]"
                  >
                    <CheckCircle2 size={18} className="text-white shrink-0" />
                    <span>{addedToast}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Modal Container */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
                className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl sm:rounded-[2.5rem] shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col z-10"
              >
                {/* Modal Header */}
                <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex flex-col gap-4 shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-11 h-11 text-white rounded-2xl flex items-center justify-center shadow-lg shrink-0",
                        isMoodModal ? "bg-emerald-500 shadow-emerald-500/20" : "bg-indigo-600 shadow-indigo-600/25"
                      )}>
                        {editingEntryId ? <Edit3 size={20} strokeWidth={2.5} /> : <Plus size={22} strokeWidth={3} />}
                      </div>
                      <div>
                        <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                          {editingEntryId 
                            ? (isMoodModal ? t('wallet_edit_dua_feeling') : t('wallet_edit_ember'))
                            : (isMoodModal ? t('wallet_add_dua_for_feeling') : 'إضافة إلى محفظتي الخاصة')
                          }
                        </h3>
                        <p className="text-[11px] font-bold text-slate-400 mt-0.5">
                          {editingEntryId
                            ? 'تعديل النص وحفظ التغييرات في المحفظة'
                            : isMoodModal 
                              ? 'اختر شعورك واكتب أو عدل الدعاء المرتبط به' 
                              : 'اختر من لائحة الأذكار والأدعية الجاهزة أو دوّن نصاً خاصاً بك'}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        setIsAddModalOpen(false);
                        setIsMoodModal(false);
                        setEditingEntryId(null);
                      }}
                      className="w-10 h-10 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all duration-75 active:scale-[0.85] shadow-sm border border-slate-100 dark:border-slate-700"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Top Switcher Tabs (Only if not editing and not in mood mode) */}
                  {!editingEntryId && !isMoodModal && (
                    <div className="grid grid-cols-2 p-1 bg-slate-200/70 dark:bg-slate-800/80 rounded-2xl border border-slate-300/40 dark:border-slate-700/50 text-xs font-black">
                      <button
                        onClick={() => setModalTab('presets')}
                        className={cn(
                          "py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all",
                          modalTab === 'presets'
                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        )}
                      >
                        <Layers size={16} />
                        <span>لائحة الاختيار السريع (مختارات)</span>
                      </button>
                      <button
                        onClick={() => setModalTab('custom')}
                        className={cn(
                          "py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all",
                          modalTab === 'custom'
                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        )}
                      >
                        <Edit3 size={16} />
                        <span>كتابة مخصصة (نص حر)</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Modal Body */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">
                  
                  {/* TAB 1: PRESETS CATALOG */}
                  {modalTab === 'presets' && !editingEntryId && !isMoodModal && (
                    <div className="space-y-5">
                      {/* Search in Presets */}
                      <div className="relative">
                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                          <Search size={16} />
                        </div>
                        <input
                          type="text"
                          placeholder="ابحث في اللائحة (بالنص أو العنوان أو الفئة)..."
                          value={presetSearch}
                          onChange={(e) => setPresetSearch(e.target.value)}
                          className="w-full h-11 pr-10 pl-9 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        />
                        {presetSearch && (
                          <button
                            onClick={() => setPresetSearch('')}
                            className="absolute inset-y-0 left-3 flex items-center text-slate-400 hover:text-rose-500"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>

                      {/* Category Filter Chips */}
                      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                        {[
                          { id: 'all', label: 'الكل', count: WALLET_PRESET_ITEMS.length },
                          { id: 'verse', label: 'آيات قرآنية', count: WALLET_PRESET_ITEMS.filter(i => i.type === 'verse').length },
                          { id: 'hadith', label: 'أحاديث نبوية', count: WALLET_PRESET_ITEMS.filter(i => i.type === 'hadith').length },
                          { id: 'dua', label: 'أدعية مستجابة', count: WALLET_PRESET_ITEMS.filter(i => i.type === 'dua').length },
                          { id: 'dhikr', label: 'أذكار وتسبيح', count: WALLET_PRESET_ITEMS.filter(i => i.type === 'dhikr').length },
                          { id: 'thought', label: 'خواطر ودرر', count: WALLET_PRESET_ITEMS.filter(i => i.type === 'thought').length },
                        ].map((cat) => (
                          <button
                            key={cat.id}
                            onClick={() => setPresetCategory(cat.id as any)}
                            className={cn(
                              "px-3.5 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 active:scale-95",
                              presetCategory === cat.id
                                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                            )}
                          >
                            <span>{cat.label}</span>
                            <span className={cn(
                              "text-[10px] px-1.5 py-0.2 rounded-full",
                              presetCategory === cat.id
                                ? "bg-white/20 dark:bg-slate-900/20 text-white dark:text-slate-900"
                                : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                            )}>
                              {cat.count}
                            </span>
                          </button>
                        ))}
                      </div>

                      {/* Presets List Cards */}
                      <div className="space-y-3.5">
                        {filteredPresets.map((preset) => {
                          const isAlreadyAdded = addedPresetIds.has(preset.id);
                          return (
                            <motion.div
                              key={preset.id}
                              layout
                              className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 hover:border-indigo-500/30 transition-all flex flex-col gap-3 group"
                            >
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <div className="flex items-center gap-2">
                                  <span className={cn(
                                    "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider",
                                    preset.type === 'verse' ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20" :
                                    preset.type === 'hadith' ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20" :
                                    preset.type === 'dua' ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20" :
                                    preset.type === 'dhikr' ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" :
                                    "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20"
                                  )}>
                                    {preset.type === 'verse' ? 'آية قرآنية' :
                                     preset.type === 'hadith' ? 'حديث شريف' :
                                     preset.type === 'dua' ? 'دعاء مستجاب' :
                                     preset.type === 'dhikr' ? 'ذكر وتسبيح' : 'خاطرة إيمانية'}
                                  </span>
                                  <h4 className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-200">
                                    {preset.title}
                                  </h4>
                                </div>
                                {preset.source && (
                                  <span className="text-[10px] font-bold text-slate-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                                    {preset.source}
                                  </span>
                                )}
                              </div>

                              {/* Content */}
                              <p 
                                className="text-sm sm:text-base font-bold text-slate-700 dark:text-slate-300 leading-relaxed font-arabic bg-white/60 dark:bg-slate-900/40 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80" 
                                dir="rtl"
                              >
                                {preset.content}
                              </p>

                              {/* Actions */}
                              <div className="flex items-center justify-end gap-2 pt-1">
                                <button
                                  onClick={() => handleSelectPresetToCustomize(preset)}
                                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-all flex items-center gap-1.5"
                                  title="تعديل وتخصيص قبل الحفظ"
                                >
                                  <Edit3 size={13} />
                                  <span>تخصيص وتعديل</span>
                                </button>
                                <button
                                  onClick={() => handleQuickAddPreset(preset)}
                                  className={cn(
                                    "px-4 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-sm active:scale-95",
                                    isAlreadyAdded
                                      ? "bg-emerald-600 text-white shadow-emerald-600/20"
                                      : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20"
                                  )}
                                >
                                  {isAlreadyAdded ? <Check size={14} strokeWidth={3} /> : <Plus size={14} strokeWidth={3} />}
                                  <span>{isAlreadyAdded ? 'تمت الإضافة ✓' : '+ إضافة للمحفظة'}</span>
                                </button>
                              </div>
                            </motion.div>
                          );
                        })}

                        {filteredPresets.length === 0 && (
                          <div className="py-12 text-center space-y-3 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                            <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto text-slate-400 shadow-sm">
                              <Search size={20} />
                            </div>
                            <p className="text-xs font-black text-slate-600 dark:text-slate-300">
                              لا توجد نتائج مطابقة لبحثك في اللائحة
                            </p>
                            <button
                              onClick={() => {
                                setPresetSearch('');
                                setPresetCategory('all');
                              }}
                              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                            >
                              إعادة ضبط البحث
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 2: CUSTOM ENTRY WRITING / EDITING */}
                  {(modalTab === 'custom' || editingEntryId || isMoodModal) && (
                    <div className="space-y-6">
                      {/* Type or Mood Selector */}
                      <div className="space-y-3">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">
                          {isMoodModal ? t('wallet_choose_feeling') : t('wallet_ember_category')}
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                          {isMoodModal ? (
                            moods.map((m) => (
                              <button
                                key={m.id}
                                onClick={() => setNewEntry({ ...newEntry, mood: m.id, type: 'dua' })}
                                className={cn(
                                  "flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all group active:scale-95",
                                  newEntry.mood === m.id 
                                    ? m.activeColor + " shadow-lg shadow-current/20 border-transparent text-white"
                                    : "bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                                )}
                              >
                                <div className={cn(
                                  "w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
                                  newEntry.mood === m.id ? "bg-white/20 text-white" : "bg-white dark:bg-slate-700 shadow-sm"
                                )}>
                                  {React.cloneElement(m.icon as any, { size: 18 })}
                                </div>
                                <span className="text-[11px] font-black">{m.label}</span>
                              </button>
                            ))
                          ) : (
                            (['verse', 'hadith', 'dua', 'dhikr', 'thought'] as const).map((type) => (
                              <button
                                key={type}
                                onClick={() => setNewEntry({ ...newEntry, type })}
                                className={cn(
                                  "flex items-center gap-2.5 p-3 rounded-2xl border-2 transition-all group active:scale-95",
                                  newEntry.type === type 
                                    ? (
                                        type === 'verse' ? "bg-amber-500 border-amber-400 text-white shadow-lg shadow-amber-500/20" :
                                        type === 'hadith' ? "bg-purple-500 border-purple-400 text-white shadow-lg shadow-purple-500/20" :
                                        type === 'dua' ? "bg-blue-500 border-blue-400 text-white shadow-lg shadow-blue-500/20" :
                                        type === 'dhikr' ? "bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/20" :
                                        "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20"
                                      )
                                    : "bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200/70 dark:border-slate-700/80 hover:border-slate-300"
                                )}
                              >
                                <div className={cn(
                                  "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
                                  newEntry.type === type ? "bg-white/20 text-white" : "bg-white dark:bg-slate-700 shadow-sm text-slate-500 dark:text-slate-300"
                                )}>
                                  {type === 'verse' && <BookOpen size={16} />}
                                  {type === 'hadith' && <MessageCircle size={16} />}
                                  {type === 'dua' && <Heart size={16} />}
                                  {type === 'dhikr' && <Sparkles size={16} />}
                                  {type === 'thought' && <Quote size={16} />}
                                </div>
                                <span className="text-xs font-black truncate">
                                  {type === 'verse' ? t('wallet_type_quran_verse') :
                                   type === 'hadith' ? t('wallet_type_noble_hadith') :
                                   type === 'dua' ? t('wallet_type_answered_dua') :
                                   type === 'dhikr' ? t('wallet_type_mention_allah') :
                                   t('wallet_type_spiritual_thought')}
                                </span>
                              </button>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Content Area */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between px-1">
                          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                            {t('wallet_content_label')}
                          </label>
                          <span className="text-[10px] font-bold text-slate-400">
                            {newEntry.content.length} حرف
                          </span>
                        </div>
                        <textarea 
                          value={newEntry.content}
                          onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                          placeholder={isMoodModal ? "اكتب دعاءً مخصصاً يعبر عن هذه الحالة ويمنحك السكينة..." : t('wallet_content_placeholder')}
                          className="w-full h-36 sm:h-44 bg-slate-50 dark:bg-slate-800/80 border-2 border-slate-200/80 dark:border-slate-700/80 rounded-3xl p-5 text-base sm:text-lg font-bold text-slate-800 dark:text-white placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all resize-none shadow-inner font-arabic leading-relaxed"
                          dir="rtl"
                        />
                      </div>
                    </div>
                  )}

                </div>

                {/* Modal Footer */}
                <div className="p-4 sm:p-6 bg-slate-50/70 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex gap-3 shrink-0">
                  <button
                    onClick={() => {
                      setIsAddModalOpen(false);
                      setIsMoodModal(false);
                      setEditingEntryId(null);
                      setNewEntry({ type: 'thought', content: '' });
                    }}
                    className="flex-1 px-5 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl font-black text-xs sm:text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-sm active:scale-95"
                  >
                    {t('wallet_cancel')}
                  </button>

                  {(modalTab === 'custom' || editingEntryId || isMoodModal) ? (
                    <button
                      onClick={handleAddEntry}
                      disabled={!newEntry.content.trim() || (isMoodModal && !newEntry.mood)}
                      className={cn(
                        "flex-[2] px-6 py-3.5 rounded-2xl font-black text-xs sm:text-sm transition-all shadow-xl flex items-center justify-center gap-2 active:scale-95",
                        (newEntry.content.trim() && (!isMoodModal || newEntry.mood))
                          ? (isMoodModal ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/25" : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/25")
                          : "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                      )}
                    >
                      <Save size={18} />
                      <span>
                        {editingEntryId 
                          ? (isMoodModal ? t('wallet_update_dua') : t('wallet_update_ember'))
                          : (isMoodModal ? t('wallet_save_dua') : t('wallet_save_ember'))
                        }
                      </span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setModalTab('custom')}
                      className="flex-[2] px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs sm:text-sm shadow-xl shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                      <Edit3 size={18} />
                      <span>تدوين نص جديد مخصص</span>
                    </button>
                  )}
                </div>

              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

