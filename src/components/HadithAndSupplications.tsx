import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  ChevronDown, 
  Search, 
  Loader2, 
  Sparkles, 
  MessageCircle, 
  Download,
  Share2,
  RefreshCw,
  Library,
  ChevronLeft,
  ChevronRight,
  Filter,
  Settings2,
  Plus,
  Minus,
  Check,
  Award,
  Star,
  Heart,
  X,
  Sliders,
  SlidersHorizontal,
  Copy,
  Sparkle,
  Bookmark
} from 'lucide-react';
import { toPng } from 'html-to-image';
import { BackButton } from './ui/BackButton';
import { AppIcon } from './ui/AppIcon';
import { hadithService, HadithCategory, HadithListItem, HadithDetail, DuaCategory } from '../services/hadithService';
import { QURANIC_DUAS, PROPHETIC_DUAS, NAMES_OF_ALLAH_DUAS, RIGHTEOUS_DUAS, SALAWAT_DUAS } from '../data/duasData';
import { cn, copyTextToClipboard, shareContent } from '../lib/utils';
import { useAppContext } from '../AppContext';
import { useTranslation } from '../i18n';
import { useSmartNavigation } from '../lib/navigation';
import { safeLocalStorageGetItem, safeLocalStorageSetItem, safeLocalStorageRemoveItem } from "../utils/storage";


type TabType = 'hadith' | 'dua' | 'favorites';

interface SearchResultItem {
  type: 'hadith' | 'dua';
  id: string;
  title: string;
  content: string;
  grade?: string;
  attribution?: string;
  explanation?: string;
  categoryName: string;
  reference?: string;
  count?: string;
  description?: string;
  rawItem: any;
}

const getHadithFontFamily = (font: string) => {
  return `"${font}", 'Amiri', 'Scheherazade New', 'Tajawal', 'Cairo', 'Noto Sans Arabic', system-ui, -apple-system, sans-serif`;
};

export const HadithAndSupplications: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('hadith');
  const [categories, setCategories] = useState<HadithCategory[]>(() => [
    { id: "1", title: "القرآن الكريم وعلومه", hadeethes_count: "197" },
    { id: "2", title: "الحديث وعلومه", hadeethes_count: "16" },
    { id: "3", title: "العقيدة", hadeethes_count: "725" },
    { id: "4", title: "الفقه وأصوله", hadeethes_count: "1820" },
    { id: "5", title: "الفضائل والآداب", hadeethes_count: "1022" },
    { id: "6", title: "الدعوة والحسبة", hadeethes_count: "140" },
    { id: "7", title: "السيرة والتاريخ", hadeethes_count: "353" },
    { id: "8", title: "أحاديث الصبر", hadeethes_count: "3" }
  ]);
  const [duaCategories, setDuaCategories] = useState<DuaCategory[]>(() => {
    try {
      const mapToAdkar = (duas: any[]) => {
        return (duas || []).map(dua => ({
          content: dua.text || dua.content || '',
          description: dua.explanation || dua.title || dua.description || '',
          count: "1",
          reference: dua.reference || "",
        }));
      };
      return [
        { category: "أدعية قرآنية", count: QURANIC_DUAS.length, adkar: mapToAdkar(QURANIC_DUAS) },
        { category: "أدعية نبوية مأثورة", count: PROPHETIC_DUAS.length, adkar: mapToAdkar(PROPHETIC_DUAS) },
        { category: "أدعية بأسماء الله الحسنى", count: NAMES_OF_ALLAH_DUAS.length, adkar: mapToAdkar(NAMES_OF_ALLAH_DUAS) },
        { category: "أدعية الصالحين", count: RIGHTEOUS_DUAS.length, adkar: mapToAdkar(RIGHTEOUS_DUAS) },
        { category: "صيغ الصلاة على النبي", count: SALAWAT_DUAS.length, adkar: mapToAdkar(SALAWAT_DUAS) }
      ];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [items, setItems] = useState<HadithListItem[]>([]);
  const [duaItems, setDuaItems] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [itemDetails, setItemDetails] = useState<Record<string, HadithDetail>>({});
  const [detailLoading, setDetailLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const { settings, updateSettings } = useAppContext();
  const { t } = useTranslation(settings?.appLanguage || 'ar');
  const { navigate } = useSmartNavigation();
  
  // Modern font customization states
  const [hadithFontSize, setHadithFontSize] = useState<number>(() => {
    const saved = safeLocalStorageGetItem('hadith-font-size');
    return saved ? parseInt(saved, 10) : 22;
  });
  
  const hadithFont = settings.hadithFontFamily || 'Scheherazade New';
  
  const handleUpdateHadithFont = (font: string) => {
    updateSettings({ hadithFontFamily: font });
  };
  const [hadithCopiedId, setHadithCopiedId] = useState<string | number | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  // --- NEW STATES FOR FAVORITES ---
  const [favoriteHadiths, setFavoriteHadiths] = useState<HadithDetail[]>(() => {
    const saved = safeLocalStorageGetItem('hadith-supplications-fav-hadiths');
    return saved ? JSON.parse(saved) : [];
  });
  const [favoriteDuas, setFavoriteDuas] = useState<any[]>(() => {
    const saved = safeLocalStorageGetItem('hadith-supplications-fav-duas');
    return saved ? JSON.parse(saved) : [];
  });

  // --- NEW STATES FOR ADVANCED SEARCH ---
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [searchType, setSearchType] = useState<'all' | 'hadith' | 'dua'>('all');
  const [searchGrade, setSearchGrade] = useState<string>('all');
  const [searchSource, setSearchSource] = useState<string>('all');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  // --- NEW STATES FOR SHARE CARD CUSTOMIZER ---
  const [shareCustomizerItem, setShareCustomizerItem] = useState<{
    type: 'hadith' | 'dua';
    title: string;
    content: string;
    attribution?: string;
    grade?: string;
    explanation?: string;
    reference?: string;
    count?: string;
    rawItem: any;
  } | null>(null);

  const [cardTheme, setCardTheme] = useState<'emerald' | 'indigo' | 'rose' | 'slate'>('emerald');
  const [cardFontSize, setCardFontSize] = useState<number>(20);
  const [cardFont, setCardFont] = useState<string>('Scheherazade New');
  const [cardLogo, setCardLogo] = useState<boolean>(true);
  const [sharingStatus, setSharingStatus] = useState<string | null>(null);
  const [cardBorder, setCardBorder] = useState<boolean>(true);

  const previewCardRef = useRef<HTMLDivElement>(null);

  // Favorites helpers
  const toggleFavoriteHadith = (hadithDetail: HadithDetail, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setFavoriteHadiths(prev => {
      const exists = prev.some(h => h.id === hadithDetail.id);
      const updated = exists 
        ? prev.filter(h => h.id !== hadithDetail.id)
        : [...prev, hadithDetail];
      safeLocalStorageSetItem('hadith-supplications-fav-hadiths', JSON.stringify(updated));
      return updated;
    });
  };

  const toggleFavoriteDua = (duaItem: any, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setFavoriteDuas(prev => {
      const exists = prev.some(d => d.content === duaItem.content);
      const updated = exists
        ? prev.filter(d => d.content !== duaItem.content)
        : [...prev, { ...duaItem, id: duaItem.id || `dua-${Date.now()}-${Math.random()}` }];
      safeLocalStorageSetItem('hadith-supplications-fav-duas', JSON.stringify(updated));
      return updated;
    });
  };

  const isHadithFavorite = (id: string) => favoriteHadiths.some(h => h.id === id);
  const isDuaFavorite = (content: string) => favoriteDuas.some(d => d.content === content);

  const handleUpdateHadithFontSize = (dir: 'inc' | 'dec') => {
    setHadithFontSize(prev => {
      const newVal = dir === 'inc' ? Math.min(prev + 2, 40) : Math.max(prev - 2, 14);
      safeLocalStorageSetItem('hadith-font-size', String(newVal));
      return newVal;
    });
  };

  // Fetch both categories initially on mount so that Advanced Search can search instantly!
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setError(null);
    try {
      const cats = await hadithService.getCategories();
      if (cats && cats.length > 0) setCategories(cats);
      const dCats = await hadithService.getDuaCategories();
      if (dCats && dCats.length > 0) setDuaCategories(dCats);
    } catch (err) {
      console.warn('Initial data sync notice:', err);
      // Synchronous fallback data is already set
    }
  };

  const handleCategorySelect = async (catId: string) => {
    setSelectedCategory(catId);
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'hadith') {
        const list = await hadithService.getHadithList(catId);
        if (list && list.length > 0) {
          setItems(list);
        } else {
          throw new Error('لم يتم العثور على أحاديث في هذا القسم حالياً');
        }
      } else {
        const cat = duaCategories.find(c => c.category === catId);
        setDuaItems(cat?.adkar || []);
      }
    } catch (err) {
      console.warn('Category fetch error, applying fallback:', err);
      if (activeTab === 'hadith') {
        const fallbackList: Record<string, HadithListItem[]> = {
          "1": [
            { id: "4687", title: "اقْرَؤُوا القُرْآنَ فإنَّه يَأْتي يَومَ القِيامَةِ شَفِيعًا لأَصْحابِهِ" },
            { id: "3389", title: "خَيْرُكُمْ مَن تَعَلَّمَ القُرْآنَ وعَلَّمَهُ" },
            { id: "3393", title: "الْماهِرُ بالقُرْآنِ مع السَّفَرَةِ الكِرامِ البَرَرَةِ" },
            { id: "3487", title: "يُقَالُ لِصَاحِبِ الْقُرْآنِ: اقْرَأْ، وَارْتَقِ، وَرَتِّلْ كَمَا كُنْتَ تُرَتِّلُ فِي الدُّنْيَا" }
          ],
          "2": [
            { id: "2973", title: "بُنِيَ الإسْلامُ علَى خَمْسٍ: شَهادَةِ أنْ لا إلَهَ إلَّا اللَّهُ وأنَّ مُحَمَّدًا رَسولُ اللَّهِ" },
            { id: "2939", title: "الإيمَانُ بضْعٌ وسَبْعُونَ، أوْ بضْعٌ وسِتُّونَ شُعْبَةً" },
            { id: "3134", title: "قُل آمنتُ بِاللَّهِ، ثمَّ استقِم" }
          ],
          "3": [
            { id: "3541", title: "لا يَقْبَلُ اللَّهُ صَلاةَ أحَدِكُمْ إذا أحْدَثَ حتَّى يَتَوَضَّأَ" },
            { id: "3523", title: "صَلُّوا كَما رَأَيْتُمُونِي أُصَلِّي" }
          ],
          "4": [
            { id: "3357", title: "مَثَلُ الَّذي يَذْكُرُ رَبَّهُ وَالَّذي لا يَذْكُرُ رَبَّهُ، مَثَلُ الحَيِّ وَالمَيِّتِ" },
            { id: "3461", title: "كَلِمَتانِ خَفِيفَتانِ علَى اللِّسانِ، ثَقِيلَتانِ في المِيزانِ، حَبِيبَتانِ إلى الرَّحْمَنِ: سُبْحانَ اللَّهِ وبِحَمْدِهِ" },
            { id: "3350", title: "أَحَبُّ الكَلامِ إلى اللهِ أَرْبَعٌ: سُبْحانَ اللهِ، وَالْحَمْدُ لِلَّهِ، وَلَا إلَهَ إلَّا اللَّهُ، وَاللَّهُ أَكْبَرُ" }
          ],
          "5": [
            { id: "2989", title: "إنَّ مِن أحَبِّكُم إلَيَّ وأَقْرَبِكُم مِنِّي مَجْلِسًا يَومَ القِيامَةِ أحاسِنَكُم أخْلاقًا" },
            { id: "3046", title: "لا يَدْخُلُ الجَنَّةَ مَن لا يَأْمَنُ جارُهُ بَوائِقَهُ" },
            { id: "2979", title: "الكَلِمَةُ الطَّيِّبَةُ صَدَقَةٌ" }
          ],
          "8": [
            { id: "348", title: "مَا أُعْطِيَ أَحَدٌ عَطَاءً خَيْرًا وَأَوْسَعَ مِنَ الصَّبْرِ" },
            { id: "349", title: "عَجَبًا لأَمْرِ المُؤْمِنِ، إِنَّ أَمْرَهُ كُلَّهُ خَيْرٌ... وَإِنْ أَصَابَتْهُ ضَرَّاءُ صَبَرَ فَكَانَ خَيْرًا لَهُ" }
          ]
        };
        const selectedFallback = fallbackList[catId] || [
          { id: "1001", title: "إنَّما الأعْمالُ بالنِّيَّاتِ، وإنَّما لِكُلِّ امْرِئٍ ما نَوَى" },
          { id: "1002", title: "مِن حُسْنِ إسْلامِ المَرْءِ تَرْكُهُ ما لا يَعْنِيهِ" },
          { id: "1003", title: "الدِّينُ النَّصِيحَةُ" }
        ];
        setItems(selectedFallback);
      }
      // If we provided fallbacks, do not completely block the UI with a full-screen error
      if (activeTab !== 'hadith') {
        setError(err instanceof Error ? err.message : 'فشل تحميل المحتوى');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleHadithDetail = async (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    
    setExpandedId(id);
    if (!itemDetails[id]) {
      setDetailLoading(id);
      try {
        const detail = await hadithService.getHadithDetail(id);
        if (detail && detail.hadeeth && !detail.hadeeth.includes("حدث خطأ")) {
          setItemDetails(prev => ({ ...prev, [id]: detail }));
        } else {
          // Predefined details fallback map
          const knownDetails: Record<string, HadithDetail> = {
            "4687": { id: "4687", title: "فضل قراءة القرآن", hadeeth: "اقْرَؤُوا القُرْآنَ فإنَّه يَأْتي يَومَ القِيامَةِ شَفِيعًا لأَصْحابِهِ", attribution: "رواه مسلم", grade: "صحيح", explanation: "حث النبي صلى الله عليه وسلم على ملازمة تلاوة القرآن وتدبر آياته، وبشر بأنه يشفع لأصحابه يوم القيامة.", reference: "صحيح مسلم", hints: ["القرآن", "الشفاعة"] },
            "3389": { id: "3389", title: "تعليم القرآن", hadeeth: "خَيْرُكُمْ مَن تَعَلَّمَ القُرْآنَ وعَلَّمَهُ", attribution: "رواه البخاري", grade: "صحيح", explanation: "أفضل المسلمين وأنفعهم هم من جمعوا بين تعلم كتاب الله وتعليمه للناس احتساباً للأجر.", reference: "صحيح البخاري", hints: ["القرآن", "التعليم"] },
            "3393": { id: "3393", title: "الماهر بالقرآن", hadeeth: "الْماهِرُ بالقُرْآنِ مع السَّفَرَةِ الكِرامِ البَرَرَةِ", attribution: "متفق عليه", grade: "صحيح", explanation: "الماهر في تلاوة القرآن وحفظه في منزلة رفيعة مع الملائكة الأبرار.", reference: "البخاري ومسلم", hints: ["القرآن"] },
            "3487": { id: "3487", title: "منزلة صاحب القرآن", hadeeth: "يُقَالُ لِصَاحِبِ الْقُرْآنِ: اقْرَأْ، وَارْتَقِ، وَرَتِّلْ كَمَا كُنْتَ تُرَتِّلُ فِي الدُّنْيَا", attribution: "رواه الترمذي", grade: "حسن صحيح", explanation: "درجات الجنة تتفاضل بتفاضل حفظ العبد وتدبره لآيات الذكر الحكيم.", reference: "سنن الترمذي", hints: ["القرآن", "الجنة"] },
            "2973": { id: "2973", title: "أركان الإسلام", hadeeth: "بُنِيَ الإسْلامُ علَى خَمْسٍ: شَهادَةِ أنْ لا إلَهَ إلَّا اللَّهُ وأنَّ مُحَمَّدًا رَسولُ اللَّهِ وإقامِ الصَّلاةِ وإيتاءِ الزَّكاةِ والحَجِّ وصَوْمِ رَمَضانَ", attribution: "متفق عليه", grade: "صحيح", explanation: "شبه الإسلام ببناء عظيم يرتكز على خمسة أركان أساسية لا قيام له بدونها.", reference: "متفق عليه", hints: ["أركان الإسلام"] },
            "2939": { id: "2939", title: "شعب الإيمان", hadeeth: "الإيمَانُ بضْعٌ وسَبْعُونَ، أوْ بضْعٌ وسِتُّونَ شُعْبَةً، فأفْضَلُها قَوْلُ لا إلَهَ إلَّا اللَّهُ، وأَدْناها إماطَةُ الأذَى عَنِ الطَّرِيقِ، والْحَياءُ شُعْبَةٌ مِنَ الإيمانِ", attribution: "متفق عليه", grade: "صحيح", explanation: "الإيمان شعب وخصال تتفاوت بين القول والعمل والأخلاق كالحياء وإماطة الأذى.", reference: "متفق عليه", hints: ["الإيمان", "الحياء"] },
            "3134": { id: "3134", title: "الاستقامة", hadeeth: "قُل آمنتُ بِاللَّهِ، ثمَّ استقِم", attribution: "رواه مسلم", grade: "صحيح", explanation: "الاستقامة هي لزوم طاعة الله والوقوف عند حدوده، وهي جماع الخير وعنوان الفلاح.", reference: "صحيح مسلم", hints: ["الاستقامة", "الإيمان"] },
            "3357": { id: "3357", title: "فضل ذكر الله", hadeeth: "مَثَلُ الَّذي يَذْكُرُ رَبَّهُ وَالَّذي لا يَذْكُرُ رَبَّهُ، مَثَلُ الحَيِّ وَالمَيِّتِ", attribution: "متفق عليه", grade: "صحيح", explanation: "الذكر حياة حقيقية للقلوب والأرواح، والغفلة عنه موت وخسار.", reference: "متفق عليه", hints: ["ذكر الله"] },
            "3461": { id: "3461", title: "كلمتان خفيفتان", hadeeth: "كَلِمَتانِ خَفِيفَتانِ علَى اللِّسانِ، ثَقِيلَتانِ في المِيزانِ، حَبِيبَتانِ إلى الرَّحْمَنِ: سُبْحانَ اللَّهِ وبِحَمْدِهِ، سُبْحانَ اللَّهِ العَظِيمِ", attribution: "متفق عليه", grade: "صحيح", explanation: "حث على لزوم التسبيح والتحميد لعظم أجرهما وخفتهما على اللسان وسعتهما في الميزان.", reference: "متفق عليه", hints: ["التسبيح", "الميزان"] },
            "3350": { id: "3350", title: "أحب الكلام إلى الله", hadeeth: "أَحَبُّ الكَلامِ إلى اللهِ أَرْبَعٌ: سُبْحانَ اللهِ، وَالْحَمْدُ لِلَّهِ، وَلَا إلَهَ إلَّا اللَّهُ، وَاللَّهُ أَكْبَرُ", attribution: "رواه مسلم", grade: "صحيح", explanation: "هذه الكلمات الأربع هي الباقيات الصالحات وأحب الذكر إلى الله تعالى.", reference: "صحيح مسلم", hints: ["الأذكار", "الباقيات الصالحات"] },
            "2989": { id: "2989", title: "أحسنكم أخلاقاً", hadeeth: "إنَّ مِن أحَبِّكُم إلَيَّ وأَقْرَبِكُم مِنِّي مَجْلِسًا يَومَ القِيامَةِ أحاسِنَكُم أخْلاقًا", attribution: "رواه الترمذي", grade: "صحيح", explanation: "حسن الخلق هو أثقل ما يوضع في ميزان العبد وسبب رئيسي للقرب من النبي صلى الله عليه وسلم في الجنة.", reference: "سنن الترمذي", hints: ["الأخلاق", "الجنة"] },
            "3046": { id: "3046", title: "حق الجار", hadeeth: "لا يَدْخُلُ الجَنَّةَ مَن لا يَأْمَنُ جارُهُ بَوائِقَهُ", attribution: "متفق عليه", grade: "صحيح", explanation: "الوعيد الشديد لمن يؤذي جيرانه بالقول أو الفعل، وأهمية حفظ الجوار.", reference: "متفق عليه", hints: ["الجار", "الآداب"] },
            "2979": { id: "2979", title: "الكلمة الطيبة صدقة", hadeeth: "الكَلِمَةُ الطَّيِّبَةُ صَدَقَةٌ", attribution: "متفق عليه", grade: "صحيح", explanation: "كل كلمة حسنة تسر القلوب وتؤلف النفوس يكتب الله بها أجر الصدقة.", reference: "متفق عليه", hints: ["الكلمة الطيبة", "الصدقة"] },
            "348": { id: "348", title: "عطاء الصبر", hadeeth: "مَا أُعْطِيَ أَحَدٌ عَطَاءً خَيْرًا وَأَوْسَعَ مِنَ الصَّبْرِ", attribution: "متفق عليه", grade: "صحيح", explanation: "الصبر رأس الطاعات ومفتاح الفرج وأعظم عطاء يمن به الله على عبده لتجاوز المحن.", reference: "متفق عليه", hints: ["الصبر"] },
            "349": { id: "349", title: "عجب المؤمن", hadeeth: "عَجَبًا لأَمْرِ المُؤْمِنِ، إِنَّ أَمْرَهُ كُلَّهُ خَيْرٌ... وَإِنْ أَصَابَتْهُ ضَرَّاءُ صَبَرَ فَكَانَ خَيْرًا لَهُ", attribution: "رواه مسلم", grade: "صحيح", explanation: "المؤمن يتقلب بين الشكر في السراء والصبر في الضراء فكل أحواله خير له عند الله.", reference: "صحيح مسلم", hints: ["الصبر", "الشكر"] },
            "3541": { id: "3541", title: "وجوب الطهارة للصلاة", hadeeth: "لا يَقْبَلُ اللَّهُ صَلاةَ أحَدِكُمْ إذا أحْدَثَ حتَّى يَتَوَضَّأَ", attribution: "متفق عليه", grade: "صحيح", explanation: "الوضوء والطهارة شرط أساسي لصحة الصلاة ولا تصح الصلاة بدونهما.", reference: "متفق عليه", hints: ["الطهارة", "الصلاة"] },
            "3523": { id: "3523", title: "صفة الصلاة", hadeeth: "صَلُّوا كَما رَأَيْتُمُونِي أُصَلِّي", attribution: "رواه البخاري", grade: "صحيح", explanation: "وجوب اتباع الهدي النبوي الشريف في أداء هيئات وأركان وسنن الصلاة.", reference: "صحيح البخاري", hints: ["الصلاة", "الاتباع"] },
            "1001": { id: "1001", title: "إنما الأعمال بالنيات", hadeeth: "إنَّما الأعْمالُ بالنِّيَّاتِ، وإنَّما لِكُلِّ امْرِئٍ ما نَوَى", attribution: "متفق عليه", grade: "صحيح", explanation: "النية هي مدار قبول الأعمال وصحتها، وبها يتميز العمل الصالح لوجه الله عن غيره.", reference: "متفق عليه", hints: ["النية", "الإخلاص"] },
            "1002": { id: "1002", title: "حسن إسلام المرء", hadeeth: "مِن حُسْنِ إسْلامِ المَرْءِ تَرْكُهُ ما لا يَعْنِيهِ", attribution: "رواه الترمذي", grade: "حسن", explanation: "دليل كمال إيمان المسلم انشغاله بما ينفعه في دينه ودنياه وتركه الفضول.", reference: "سنن الترمذي", hints: ["الأخلاق", "حفظ الوقت"] },
            "1003": { id: "1003", title: "الدين النصيحة", hadeeth: "الدِّينُ النَّصِيحَةُ، قُلْنا: لِمَنْ؟ قالَ: لِلَّهِ وَلِكِتابِهِ وَلِرَسولِهِ وَلأَئِمَّةِ المُسْلِمِينَ وَعامَّتِهِمْ", attribution: "رواه مسلم", grade: "صحيح", explanation: "النصيحة لله بتوحيده ولرسوله باتباعه وللمسلمين بإرادة الخير لهم.", reference: "صحيح مسلم", hints: ["النصيحة"] }
          };

          const fallbackItem = knownDetails[id] || (detail && detail.id ? detail : {
            id,
            title: "حديث نبوي شريف",
            hadeeth: "قال رسول الله صلى الله عليه وسلم من جوامع الكلم والهدى النبوي الشريف.",
            attribution: "رواه الشيخان وغيرهما",
            grade: "صحيح",
            explanation: "أحاديث النبي صلى الله عليه وسلم نور وهداية للأمة.",
            hints: ["الحديث النبوي"],
            reference: "موسوعة السنة"
          });
          setItemDetails(prev => ({ ...prev, [id]: fallbackItem }));
        }
      } catch (err) {
        console.warn('Error fetching detail:', err);
      } finally {
        setDetailLoading(null);
      }
    }
  };

  const handleDownload = async (elementId: string, filename: string) => {
    let targetId = elementId;
    if (elementId.startsWith('hadith-card-')) {
      targetId = elementId.replace('hadith-card-', 'hadith-card-export-');
    } else if (elementId.startsWith('dua-card-')) {
      targetId = elementId.replace('dua-card-', 'dua-card-export-');
    }
    const el = document.getElementById(targetId);
    if (!el) return;
    try {
      setDownloadingId(elementId);
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const isDark = document.documentElement.classList.contains('dark');
      const dataUrl = await toPng(el, { 
        quality: 1,
        pixelRatio: 2,
        cacheBust: true, 
        backgroundColor: isDark ? '#020617' : '#f8fafc',
        filter: (node) => {
          if (node.nodeType === 1) { // Node.ELEMENT_NODE
            return !(node as Element).hasAttribute('data-html2canvas-ignore');
          }
          return true;
        }
      });
      const link = document.createElement('a');
      link.download = `${filename}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to download image', err);
    } finally {
      setDownloadingId(null);
    }
  };

  // --- ADVANCED SEARCH FILTERING ENGINE ---
  const getSearchResults = (): SearchResultItem[] => {
    let results: SearchResultItem[] = [];

    // 1. Compile Duas
    duaCategories.forEach(cat => {
      cat.adkar.forEach(dua => {
        if (!results.some(r => r.content === dua.content)) {
          results.push({
            type: 'dua',
            id: `dua-${dua.content}`,
            title: cat.category,
            content: dua.content,
            categoryName: cat.category,
            reference: dua.reference,
            count: dua.count,
            description: dua.description,
            rawItem: dua
          });
        }
      });
    });

    // Add favorite duas to ensure they are available to search even offline
    favoriteDuas.forEach(fav => {
      if (!results.some(r => r.type === 'dua' && r.content === fav.content)) {
        results.push({
          type: 'dua',
          id: fav.id || `dua-${fav.content}`,
          title: fav.categoryName || "دعاء مأثور",
          content: fav.content,
          categoryName: fav.categoryName || "المفضلة",
          reference: fav.reference,
          count: fav.count,
          description: fav.description,
          rawItem: fav
        });
      }
    });

    // 2. Compile Hadiths
    const fallbackHadithsWithDetails: HadithDetail[] = [
      { id: "4687", title: "فضل قراءة القرآن", hadeeth: "اقْرَؤُوا القُرْآنَ فإنَّه يَأْتي يَومَ القِيامَةِ شَفِيعًا لأَصْحابِهِ", attribution: "رواه مسلم", grade: "صحيح", explanation: "حث النبي صلى الله عليه وسلم على ملازمة تلاوة القرآن وتدبر آياته، وبشر بأن القرآن يشفع لأهله العاملين به يوم القيامة.", reference: "مسلم", hints: [] },
      { id: "3389", title: "تعليم القرآن", hadeeth: "خَيْرُكُمْ مَن تَعَلَّمَ القُرْآنَ وعَلَّمَهُ", attribution: "رواه البخاري", grade: "صحيح", explanation: "أفضل المسلمين وأكثرهم نفعاً هم الذين يجمعون بين تعلم القرآن الكريم وتعليمه للناس احتساباً للأجر عند الله.", reference: "البخاري", hints: [] },
      { id: "3393", title: "الماهر بالقرآن", hadeeth: "الْماهِرُ بالقُرْآنِ مع السَّفَرَةِ الكِرامِ البَرَرَةِ", attribution: "متفق عليه", grade: "صحيح", explanation: "الذي يقرأ القرآن وهو متقن لحفظه وأدائه يكون في منزلة عالية مع الملائكة المقربين.", reference: "البخاري ومسلم", hints: [] },
      { id: "3487", title: "منزلة صاحب القرآن", hadeeth: "يُقَالُ لِصَاحِبِ الْقُرْآنِ: اقْرَأْ، وَارْتَقِ، وَرَتِّلْ كَمَا كُنْتَ تُرَتِّلُ فِي الدُّنْيَا", attribution: "رواه الترمذي", grade: "حسن صحيح", explanation: "درجات الجنة تتفاضل بتفاضل حفظ العبد للقرآن وتدبره وعمله به في الدنيا.", reference: "الترمذي", hints: [] },
      { id: "2973", title: "أركان الإسلام", hadeeth: "بُنِيَ الإسْلامُ علَى خَمْسٍ: شَهادَةِ أنْ لا إلَهَ إلَّا اللَّهُ وأنَّ مُحَمَّدًا رَسولُ اللَّهِ وإقامِ الصَّلاةِ وإيتاءِ الزَّكاةِ والحَجِّ وصَوْمِ رَمَضانَ", attribution: "متفق عليه", grade: "صحيح", explanation: "شبه الإسلام ببناء عظيم يستند على خمسة أعمدة أساسية لا يستقيم البناء بدونها.", reference: "البخاري ومسلم", hints: [] },
      { id: "2939", title: "شعب الإيمان", hadeeth: "الإيمَانُ بضْعٌ وسَبْعُونَ، أوْ بضْعٌ وسِتُّونَ شُعْبَةً، فأفْضَلُها قَوْلُ لا إلَهَ إلَّا اللَّهُ، وأَدْناها إماطَةُ الأذَى عَنِ الطَّرِيقِ، والْحَياءُ شُعْبَةٌ مِنَ الإيمانِ", attribution: "متفق عليه", grade: "صحيح", explanation: "الإيمان ليس اعتقاداً مجرداً بل هو خصال وأعمال تتفاوت في الفضل وتشمل الطاعات القولية والعملية والأخلاقية كالحياء.", reference: "البخاري ومسلم", hints: [] },
      { id: "3134", title: "الاستقامة", hadeeth: "قُل آمنتُ بِاللَّهِ، ثمَّ استقِم", attribution: "رواه مسلم", grade: "صحيح", explanation: "الاستقامة هي لزوم طاعة الله والوقوف عند حدوده، وهي جماع الخير وعنوان الفلاح.", reference: "مسلم", hints: [] },
      { id: "3357", title: "فضل ذكر الله", hadeeth: "مَثَلُ الَّذي يَذْكُرُ رَبَّهُ وَالَّذي لا يَذْكُرُ رَبَّهُ، مَثَلُ الحَيِّ وَالمَيِّتِ", attribution: "متفق عليه", grade: "صحيح", explanation: "الذكر حياة للقلب والروح، والغفلة عنه موت وخسار مبين.", reference: "البخاري ومسلم", hints: [] },
      { id: "3461", title: "كلمتان خفيفتان", hadeeth: "كَلِمَتانِ خَفِيفَتانِ علَى اللِّسانِ، ثَقِيلَتانِ في المِيزانِ، حَبِيبَتانِ إلى الرَّحْمَنِ: سُبْحانَ اللَّهِ وبِحَمْدِهِ، سُبْحانَ اللَّهِ العَظِيمِ", attribution: "متفق عليه", grade: "صحيح", explanation: "حث على لزوم التسبيح والتحميد لعظم أجرهما وخفتهما على اللسان وسعتهما في الميزان.", reference: "البخاري ومسلم", hints: [] },
      { id: "3350", title: "أحب الكلام إلى الله", hadeeth: "أَحَبُّ الكَلامِ إلى اللهِ أَرْبَعٌ: سُبْحانَ اللهِ، وَالْحَمْدُ لِلَّهِ، وَلَا إلَهَ إلَّا اللَّهُ، وَاللَّهُ أَكْبَرُ", attribution: "رواه مسلم", grade: "صحيح", explanation: "هذه الكلمات الأربع هي الباقيات الصالحات وأحب الذكر إلى الله تعالى.", reference: "مسلم", hints: [] },
      { id: "2989", title: "أحسنكم أخلاقاً", hadeeth: "إنَّ مِن أحَبِّكُم إلَيَّ وأَقْرَبِكُم مِنِّي مَجْلِسًا يَومَ القِيامَةِ أحاسِنَكُم أخْلاقًا", attribution: "رواه الترمذي", grade: "صحيح", explanation: "حسن الخلق هو أثقل ما يوضع في ميزان العبد وسبب رئيسي للقرب من النبي صلى الله عليه وسلم في الجنة.", reference: "الترمذي", hints: [] },
      { id: "3046", title: "حق الجار", hadeeth: "لا يَدْخُلُ الجَنَّةَ مَن لا يَأْمَنُ جارُهُ بَوائِقَهُ", attribution: "متفق عليه", grade: "صحيح", explanation: "الوعيد الشديد لمن يؤذي جيرانه بالقول أو الفعل، وأهمية حفظ الجوار.", reference: "البخاري ومسلم", hints: [] },
      { id: "2979", title: "الكلمة الطيبة صدقة", hadeeth: "الكَلِمَةُ الطَّيِّبَةُ صدقةٌ", attribution: "متفق عليه", grade: "صحيح", explanation: "كل كلمة حسنة تسر القلوب وتؤلف النفوس يكتب الله بها أجر الصدقة.", reference: "البخاري ومسلم", hints: [] },
      { id: "348", title: "عطاء الصبر", hadeeth: "مَا أُعْطِيَ أَحَدٌ عَطَاءً خَيْرًا وَأَوْسَعَ مِنَ الصَّبْرِ", attribution: "متفق عليه", grade: "صحيح", explanation: "الصبر هو رأس الطاعات ومفتاح الفرج وأعظم عطاء يمن به الله على عبده لتجاوز المحن.", reference: "البخاري ومسلم", hints: [] },
      { id: "349", title: "عجب المؤمن", hadeeth: "عَجَبًا لأَمْرِ المُؤْمِنِ، إِنَّ أَمْرَهُ كُلَّهُ خَيْرٌ... وَإِنْ أَصَابَتْهُ ضَرَّاءُ صَبَرَ فَكَانَ خَيْرًا لَهُ", attribution: "رواه مسلم", grade: "صحيح", explanation: "المؤمن يتقلب بين الشكر في السراء والصبر في الضراء فكل أحواله خير له عند الله.", reference: "مسلم", hints: [] }
    ];

    const allHadithDetails = [...fallbackHadithsWithDetails];
    
    // Add dynamically loaded details
    Object.values(itemDetails).forEach(detail => {
      if (!allHadithDetails.some(h => h.id === detail.id)) {
        allHadithDetails.push(detail);
      }
    });

    // Add favorites to ensure they are available to search even offline
    favoriteHadiths.forEach(fav => {
      if (!allHadithDetails.some(h => h.id === fav.id)) {
        allHadithDetails.push(fav);
      }
    });

    allHadithDetails.forEach(hadith => {
      results.push({
        type: 'hadith',
        id: `hadith-${hadith.id}`,
        title: hadith.title || "حديث شريف",
        content: hadith.hadeeth,
        grade: hadith.grade,
        attribution: hadith.attribution,
        explanation: hadith.explanation,
        categoryName: "حديث نبوي",
        reference: hadith.reference,
        rawItem: hadith
      });
    });

    // Filtering logic
    // 3. Filter by type
    if (searchType === 'hadith') {
      results = results.filter(r => r.type === 'hadith');
    } else if (searchType === 'dua') {
      results = results.filter(r => r.type === 'dua');
    }

    // 4. Filter by text
    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase().trim();
      results = results.filter(r => 
        r.content.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        (r.explanation && r.explanation.toLowerCase().includes(q)) ||
        (r.description && r.description.toLowerCase().includes(q)) ||
        (r.attribution && r.attribution.toLowerCase().includes(q)) ||
        (r.reference && r.reference.toLowerCase().includes(q)) ||
        r.categoryName.toLowerCase().includes(q)
      );
    }

    // 5. Filter by Grade (رتبة الحديث)
    if (searchGrade !== 'all') {
      results = results.filter(r => r.type === 'hadith' && r.grade?.toLowerCase().includes(searchGrade.toLowerCase()));
    }

    // 6. Filter by Source/Book
    if (searchSource !== 'all') {
      results = results.filter(r => {
        const attribution = r.attribution?.toLowerCase() || '';
        const reference = r.reference?.toLowerCase() || '';
        const combined = attribution + ' ' + reference;
        if (searchSource === 'bukhari') return combined.includes('بخاري') || combined.includes('البخاري');
        if (searchSource === 'muslim') return combined.includes('مسلم');
        if (searchSource === 'tirmidhi') return combined.includes('ترمذي') || combined.includes('الترمذي');
        if (searchSource === 'quran') return r.type === 'dua' && (combined.includes('قرآن') || combined.includes('القرآن') || r.title.includes('قرآن') || r.description?.includes('سورة'));
        return true;
      });
    }

    // 7. Filter by Favorites Only
    if (showOnlyFavorites) {
      results = results.filter(r => {
        if (r.type === 'hadith') {
          return favoriteHadiths.some(f => f.id === r.rawItem.id);
        } else {
          return favoriteDuas.some(f => f.content === r.rawItem.content);
        }
      });
    }

    return results;
  };

  const isSearching = searchTerm.trim() !== '' || searchType !== 'all' || searchGrade !== 'all' || searchSource !== 'all' || showOnlyFavorites;

  // Render Category filter for basic view
  const filteredCategories = activeTab === 'hadith' 
    ? categories.filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase()))
    : activeTab === 'dua'
      ? duaCategories.filter(c => c.category.toLowerCase().includes(searchTerm.toLowerCase()))
      : [];

  // Active filters count
  const activeFiltersCount = [
    searchType !== 'all',
    searchGrade !== 'all',
    searchSource !== 'all',
    showOnlyFavorites
  ].filter(Boolean).length;

  // Reset filters
  const resetFilters = () => {
    setSearchType('all');
    setSearchGrade('all');
    setSearchSource('all');
    setShowOnlyFavorites(false);
    setSearchTerm('');
  };

  // --- ATTRACTIVE EXPORT CARD GENERATOR & SHARE SYSTEM ---
  // Session tracking for Duas
  const [sessionDuaCounts, setSessionDuaCounts] = useState<Record<string, number>>({});

  const duaProgress = React.useMemo(() => {
    if (!duaItems || duaItems.length === 0) return { total: 0, completed: 0, percent: 0 };
    const total = duaItems.length;
    let completed = 0;
    duaItems.forEach(dua => {
      const targetCount = typeof dua.count === 'string' ? parseInt(dua.count) || 1 : (dua.count || 1);
      if ((sessionDuaCounts[dua.content] || 0) >= targetCount) {
        completed += 1;
      }
    });
    const percent = Math.round((completed / total) * 100);
    return { total, completed, percent };
  }, [duaItems, sessionDuaCounts]);

  const handleDuaIncrement = (dua: any) => {
    const targetCount = typeof dua.count === 'string' ? parseInt(dua.count) || 1 : (dua.count || 1);
    const current = sessionDuaCounts[dua.content] || 0;
    if (current < targetCount) {
      setSessionDuaCounts(prev => ({
        ...prev,
        [dua.content]: current + 1
      }));
      // Optional: add haptic feedback
      try {
        if (navigator.vibrate) navigator.vibrate(50);
      } catch (e) {}
    }
  };

  const handleOpenCustomizer = (item: any, type: 'hadith' | 'dua') => {
    if (type === 'hadith') {
      setShareCustomizerItem({
        type: type,
        title: item.title || "حديث شريف",
        content: item.hadeeth || item.content,
        attribution: item.attribution,
        grade: item.grade,
        explanation: item.explanation,
        reference: item.reference,
        rawItem: item
      });
    } else {
      setShareCustomizerItem({
        type: 'dua',
        title: item.categoryName || "دعاء مبارك",
        content: item.content || item.dua,
        attribution: item.reference,
        reference: item.reference,
        count: item.count,
        rawItem: item
      });
    }
    // Default preview properties matching type
    setCardFontSize(20);
    setCardTheme(type === 'hadith' ? 'emerald' : 'emerald');
    setSharingStatus(null);
  };

  const generateCardPNG = async (): Promise<Blob | null> => {
    if (!previewCardRef.current) return null;
    try {
      await new Promise(resolve => setTimeout(resolve, 100)); // allow fonts/layout to settle
      const dataUrl = await toPng(previewCardRef.current, {
        quality: 1,
        pixelRatio: 3, // Ultra-crisp quality for high-res social media shares
        cacheBust: true,
        style: {
          transform: 'scale(1)',
        }
      });
      const response = await fetch(dataUrl);
      return await response.blob();
    } catch (err) {
      console.error('Failed to generate card image blob:', err);
      return null;
    }
  };

  const handleDownloadCustomCard = async () => {
    if (!shareCustomizerItem) return;
    setSharingStatus('generating');
    try {
      const blob = await generateCardPNG();
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `athkar-${shareCustomizerItem.type}-${Date.now()}.png`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setSharingStatus('downloaded');
        setTimeout(() => setSharingStatus(null), 2000);
      }
    } catch (err) {
      setSharingStatus('error');
      setTimeout(() => setSharingStatus(null), 2000);
    }
  };

  const handleShareCustomCardImage = async () => {
    if (!shareCustomizerItem) return;
    setSharingStatus('sharing');
    try {
      const blob = await generateCardPNG();
      if (!blob) throw new Error('Blob generation failed');

      const file = new File([blob], `athkar-${shareCustomizerItem.type}.png`, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: shareCustomizerItem.title,
          text: `✨ *${shareCustomizerItem.title}* ✨\n\n"${shareCustomizerItem.content}"\n\nتمت المشاركة من تطبيق أذكار المؤمن 💚`,
        });
        setSharingStatus('shared');
      } else {
        // Fallback to text + direct image download guide
        const imageUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `athkar-${shareCustomizerItem.type}.png`;
        link.href = imageUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(imageUrl);

        // Share text format
        await shareContent(
            shareCustomizerItem.title,
            `✨ *${shareCustomizerItem.title}* ✨\n\n"${shareCustomizerItem.content}"\n\n📖 المصدر: ${shareCustomizerItem.attribution || shareCustomizerItem.reference || ''}\n\nتم تنزيل بطاقة الصورة على جهازك، ويمكنك مشاركتها الآن!`
        );
        setSharingStatus('copied-text');
      }
    } catch (err) {
      console.warn('Sharing failed, falling back to copy:', err);
      // Fail-proof backup: copy beautifully formatted unicode text!
      const formattedText = getDecoratedText();
      await copyTextToClipboard(formattedText);
      setSharingStatus('copied-text');
    }
    setTimeout(() => setSharingStatus(null), 3000);
  };

  const getDecoratedText = () => {
    if (!shareCustomizerItem) return '';
    const item = shareCustomizerItem;
    const borderTop = "۞═════════ ❃ ۩ ❃ ═════════۞";
    const borderBottom = "۞═════════ ❃ ۩ ❃ ═════════۞";
    
    let text = `${borderTop}\n`;
    text += `✨ *${item.title}* ✨\n\n`;
    text += `"${item.content}"\n\n`;
    if (item.type === 'hadith') {
      if (item.grade) text += `⭐ رتبة الحديث: ${item.grade}\n`;
      if (item.attribution) text += `📖 المصدر: ${item.attribution}\n`;
      if (item.explanation) text += `\n📝 الشرح والفوائد:\n${item.explanation}\n`;
    } else {
      if (item.count && item.count !== "1") text += `🔁 التكرار المطلوب: ${item.count} مرات\n`;
      if (item.attribution) text += `📖 المصدر: ${item.attribution}\n`;
    }
    text += `\n—\nتمت المشاركة من تطبيق 💚 *أذكار المؤمن* 💚\n📲 رابط التطبيق الشريف: ${window.location.origin}\n${borderBottom}`;
    return text;
  };

  const handleCopyDecoratedText = async () => {
    const text = getDecoratedText();
    await copyTextToClipboard(text);
    setSharingStatus('copied-text');
    setTimeout(() => setSharingStatus(null), 2000);
  };

  const renderSkeletons = () => {
    if (selectedCategory) {
      return (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div 
              key={i} 
              className="p-5 bg-white dark:bg-slate-900/90 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-teal-500/10 rounded-lg animate-pulse" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md animate-pulse w-32" />
                </div>
                <div className="w-16 h-5 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse" />
              </div>
              <div className="space-y-2 py-2">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse w-full" />
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse w-5/6" />
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse w-2/3" />
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded animate-pulse w-24" />
                <div className="flex gap-2">
                  <div className="w-8 h-8 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
                  <div className="w-8 h-8 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div 
            key={i} 
            className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800"
          >
            <div className="flex items-center gap-3.5 w-full">
              <div className="w-11 h-11 bg-teal-500/10 dark:bg-teal-900/20 rounded-2xl animate-pulse shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse w-3/4" />
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded animate-pulse w-1/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const getCardThemeClasses = () => {
    // General visual themes globally applied
    if (settings.visualTheme === 'glass') {
      return "bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-white/40 dark:border-slate-800 shadow-sm";
    }
    if (settings.visualTheme === 'minimal' || settings.visualTheme === 'clear') {
      return "bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 shadow-none";
    }
    if (false) {
      return "bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 text-slate-100";
    }
    
    // Check specific adhkarTheme preference for Hadith/Dua cards
    const theme = settings.adhkarTheme;
    if (theme === 'luxuryBrown') {
      return "bg-gradient-to-br from-[#1e140d] to-[#1a110b] dark:from-[#1e140d] dark:to-[#1a110b] border border-[#3c2819] shadow-md text-[#f4e8df]";
    }
    if (theme === 'attractivePink' || theme === 'jouriRose') {
      return "bg-gradient-to-br from-rose-50 to-pink-50 dark:from-slate-900 dark:to-slate-800 border border-rose-100 dark:border-slate-800 shadow-sm";
    }
    if (theme === 'dreamyLavender' || theme === 'lavenderFields') {
      return "bg-gradient-to-br from-purple-50 to-fuchsia-50 dark:from-slate-900 dark:to-slate-800 border border-purple-100 dark:border-slate-800 shadow-sm";
    }
    if (theme === 'oceanBreeze' || theme === 'clearSky') {
      return "bg-gradient-to-br from-sky-50 to-cyan-50 dark:from-slate-900 dark:to-slate-800 border border-sky-100 dark:border-slate-800 shadow-sm";
    }
    if (theme === 'royalGold') {
      return "bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-slate-900 dark:to-slate-800 border border-amber-200/60 dark:border-slate-800 shadow-sm";
    }
    if (theme === 'emerald') {
      return "bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-900 dark:to-slate-800 border border-emerald-100 dark:border-slate-800 shadow-sm";
    }
    
    // Default fallback
    return "bg-gradient-to-br from-[#FDFBF7] to-[#F4F1E1] dark:from-slate-900 dark:to-slate-800 border border-amber-900/10 dark:border-slate-800 shadow-sm";
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-hidden max-w-[1600px] w-full mx-auto">
      {/* Header */}
      <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-4">
            <BackButton />
            <div>
              <h2 className="text-xl font-black text-slate-800 dark:text-white">{t('hadith_and_supplications_title', 'الأدعية والأحاديث النبوية')}</h2>
              <p className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest leading-none mt-1">
                {t('hadith_and_supplications_subtitle', 'مصدرك للأدعية المأثورة والأحاديث الصحيحة المفهرسة')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                setShowAdvancedSearch(false);
                setShowSettings(!showSettings);
              }}
              className={cn(
                "p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center",
                showSettings 
                  ? "bg-teal-500/10 border-teal-500/30 text-teal-600 dark:text-teal-400" 
                  : "bg-slate-50 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              )}
              title={t('change_font_and_size', 'تغيير الخط وحجم الكتابة')}
            >
              <Settings2 size={18} className={cn("transition-transform duration-300", showSettings && "rotate-45")} />
            </button>

            <button
              onClick={() => {
                setShowSettings(false);
                setShowAdvancedSearch(!showAdvancedSearch);
              }}
              className={cn(
                "p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center relative",
                showAdvancedSearch || activeFiltersCount > 0
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400" 
                  : "bg-slate-50 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              )}
              title={t('advanced_search_and_filters', 'البحث المتقدم والفلاتر')}
            >
              <SlidersHorizontal size={18} />
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-black flex items-center justify-center shadow">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Collapsible settings workspace */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-3"
            >
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50 space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black text-slate-500">{t('settings', 'الإعدادات')}</span>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="p-1 rounded-full bg-slate-200/50 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
                    title={t('close', 'إغلاق')}
                  >
                    <X size={14} />
                  </button>
                </div>
                <div className="flex flex-col sm:flex-row justify-between gap-3 sm:items-center">
                  
                  {/* Select font family dropdown */}
                  <div className="flex-1 flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 py-1.5 px-3 rounded-xl">
                    <span className="text-xs font-black text-slate-500 select-none whitespace-nowrap">{t('font_type_label', 'نوع الخط الشريف:')}</span>
                    <select
                      value={hadithFont}
                      onChange={(e) => handleUpdateHadithFont(e.target.value)}
                      className="w-full text-right py-1 text-xs font-black bg-transparent border-none text-slate-800 dark:text-slate-100 cursor-pointer focus:outline-none focus:ring-0 appearance-none text-ellipsis overflow-hidden"
                      style={{ fontFamily: getHadithFontFamily(hadithFont) }}
                    >
                      <option value="Scheherazade New">خط النسخ المميز (شهرزاد)</option>
                      <option value="Amiri">خط المنبر الشريف (أميري)</option>
                      <option value="Cairo">خط القاهرة الهندسي المودرن</option>
                      <option value="Tajawal">خط تجوال المبسط</option>
                      <option value="Zain">خط زين الدائري</option>
                      <option value="Alexandria">خط الإسكندرية الممتد</option>
                      <option value="Noto Kufi Arabic">خط الكوفي الهندسي</option>
                      <option value="Reem Kufi">خط ريم كوفي المطور</option>
                      <option value="El Messiri">خط الرسائل والزخرفة (المسيري)</option>
                      <option value="Lateef">خط لطيف النسخي الناعم</option>
                      <option value="Aref Ruqaa">خط الرقعة الفني التقليدي</option>
                      <option value="Noto Naskh Arabic">خط النسخ الأساسي (نوتو)</option>
                      <option value="Markazi Text">الخط المركزي للصحف والكتب</option>
                      <option value="Mirza">خط ميرزا الفارسي الأنيق</option>
                      <option value="Katibeh">خط كتيبة التراثي</option>
                      <option value="Beiruti">خط بيروتي العصري الفاخر</option>
                      <option value="Lalezar">خط لاليزار الفني العريض</option>
                      <option value="Marhey">خط مرحي الإبداعي الممتع</option>
                      <option value="Rakkas">خط رقاص المزخرف المميز</option>
                    </select>
                  </div>

                  {/* Increase / decrease font size controls */}
                  <div className="flex-none flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 py-1.5 px-3 rounded-xl">
                    <span className="text-xs font-black text-slate-500 select-none">{t('font_size_label', 'حجم النص للقرائة:')}</span>
                    <div className="flex items-center gap-1.5">
                      <button 
                        type="button"
                        onClick={() => handleUpdateHadithFontSize('dec')}
                        disabled={hadithFontSize <= 14}
                        className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold transition cursor-pointer disabled:opacity-40"
                        title={t('decrease_font', 'تصغير الخط')}
                      >
                        <Minus size={12} />
                      </button>
                      <span className="font-mono text-xs text-slate-900 dark:text-slate-100 font-extrabold w-8 text-center">{hadithFontSize}px</span>
                      <button 
                        type="button"
                        onClick={() => handleUpdateHadithFontSize('inc')}
                        disabled={hadithFontSize >= 42}
                        className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold transition cursor-pointer disabled:opacity-40"
                        title={t('increase_font', 'تكبير الخط')}
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>

                </div>

                {/* Explicit large close button at the bottom of the panel */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/50 mt-3">
                  <button
                    onClick={() => setShowSettings(false)}
                    className="w-full py-2.5 rounded-xl font-black text-sm bg-slate-200/50 hover:bg-rose-500/10 hover:text-rose-600 dark:bg-slate-800/50 dark:hover:bg-rose-500/20 text-slate-500 dark:text-slate-400 dark:hover:text-rose-400 border border-transparent transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    <X size={16} />
                    <span>{t('close_settings', 'إغلاق لوحة الإعدادات')}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapsible ADVANCED SEARCH & FILTERS workspace */}
        <AnimatePresence>
          {showAdvancedSearch && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-3"
            >
              <div className="bg-emerald-500/5 dark:bg-slate-950/40 p-4 rounded-2xl border border-emerald-500/10 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <Sliders size={14} />
                    <span>{t('advanced_search_filters', 'فلاتر البحث الذكي المتقدم')}</span>
                  </span>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={resetFilters} 
                      className="text-[10px] font-extrabold text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1"
                    >
                      <span>{t('reset_filters', 'تصفير الفلاتر')}</span>
                      <RefreshCw size={10} />
                    </button>
                    <button
                      onClick={() => setShowAdvancedSearch(false)}
                      className="p-1 rounded-full bg-slate-200/50 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
                      title={t('close', 'إغلاق')}
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Type Filter */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 block">{t('content_type', 'نوع المحتوى')}</label>
                    <select
                      value={searchType}
                      onChange={(e) => setSearchType(e.target.value as any)}
                      className="w-full text-right p-2 text-xs font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-emerald-500 text-slate-700 dark:text-slate-200"
                    >
                      <option value="all">{t('all_content', 'الكل (أحاديث وأدعية)')}</option>
                      <option value="hadith">{t('hadith_tab', 'أحاديث نبوية')}</option>
                      <option value="dua">{t('dua_tab', 'أدعية مأثورة')}</option>
                    </select>
                  </div>

                  {/* Grade Filter (Hadith Only) */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 block">{t('hadith_grade', 'رتبة وصحة الحديث')}</label>
                    <select
                      value={searchGrade}
                      onChange={(e) => setSearchGrade(e.target.value)}
                      disabled={searchType === 'dua'}
                      className="w-full text-right p-2 text-xs font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-emerald-500 text-slate-700 dark:text-slate-200 disabled:opacity-50"
                    >
                      <option value="all">{t('all_grades', 'كل الرتب')}</option>
                      <option value="صحيح">{t('grade_sahih', 'صحيح فقط')}</option>
                      <option value="حسن">{t('grade_hasan', 'حسن أو حسن صحيح')}</option>
                    </select>
                  </div>

                  {/* Source / Book Filter */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 block">{t('source_or_narrator', 'المصدر أو المخرّج')}</label>
                    <select
                      value={searchSource}
                      onChange={(e) => setSearchSource(e.target.value)}
                      className="w-full text-right p-2 text-xs font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-emerald-500 text-slate-700 dark:text-slate-200"
                    >
                      <option value="all">{t('all_sources', 'كل المصادر')}</option>
                      <option value="bukhari">البخاري</option>
                      <option value="muslim">مسلم</option>
                      <option value="tirmidhi">الترمذي</option>
                      <option value="quran">{t('quranic_duas', 'أدعية قرآنية')}</option>
                    </select>
                  </div>

                  {/* Favorites Switch */}
                  <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                      <Star size={14} className="text-amber-500 fill-amber-500" />
                      <span>{t('favorites_only', 'المفضلة فقط')}</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={showOnlyFavorites}
                      onChange={(e) => setShowOnlyFavorites(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Explicit large close button at the bottom of the panel */}
                <div className="pt-2 border-t border-emerald-500/10 mt-3">
                  <button
                    onClick={() => setShowAdvancedSearch(false)}
                    className="w-full py-2.5 rounded-xl font-black text-sm bg-emerald-500/10 hover:bg-rose-500/10 hover:text-rose-600 dark:bg-emerald-500/10 dark:hover:bg-rose-500/20 text-emerald-700 dark:text-emerald-400 dark:hover:text-rose-400 border border-transparent transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    <X size={16} />
                    <span>{t('close_settings', 'إغلاق لوحة الإعدادات')}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search & Tabs */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder={isSearching ? t('search_placeholder_detailed', 'ابحث في محتوى الحديث أو الدعاء تفصيلياً...') : t('search_placeholder', 'ابحث في الأقسام...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-10 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm font-bold border-none focus:ring-2 focus:ring-teal-500/50 outline-none transition-all placeholder-slate-450 text-right"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl gap-1 select-none">
            <button
              onClick={() => {
                setActiveTab('hadith');
                setSelectedCategory(null);
                setShowOnlyFavorites(false);
              }}
              className={cn(
                "flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 py-2 rounded-lg font-black text-[10px] sm:text-xs transition-all cursor-pointer whitespace-nowrap",
                activeTab === 'hadith' && !showOnlyFavorites
                  ? "bg-slate-50 dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-sm" 
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              )}
            >
              <MessageCircle size={15} />
              <span>{t('hadith_tab', 'أحاديث نبوية')}</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('dua');
                setSelectedCategory(null);
                setShowOnlyFavorites(false);
              }}
              className={cn(
                "flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 py-2 rounded-lg font-black text-[10px] sm:text-xs transition-all cursor-pointer whitespace-nowrap",
                activeTab === 'dua' && !showOnlyFavorites
                  ? "bg-slate-50 dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-sm" 
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              )}
            >
              <Sparkles size={15} />
              <span>{t('dua_tab', 'أدعية مأثورة')}</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('favorites');
                setShowOnlyFavorites(true);
                setSelectedCategory(null);
              }}
              className={cn(
                "flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 py-2 rounded-lg font-black text-[10px] sm:text-xs transition-all cursor-pointer whitespace-nowrap",
                activeTab === 'favorites' || (showOnlyFavorites && activeTab !== 'hadith' && activeTab !== 'dua')
                  ? "bg-slate-50 dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-sm" 
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              )}
            >
              <Star size={15} className={showOnlyFavorites ? "fill-current" : ""} />
              <span>{t('favorites_tab', 'المفضلة')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 hide-scrollbar">
        {loading ? (
          <div className="py-2">
             <div className="flex items-center gap-2 mb-4">
                <Loader2 className="w-5 h-5 text-teal-600 animate-spin" />
                <span className="text-sm font-bold text-slate-500">{t('loading', 'جاري التحميل...')}</span>
             </div>
             {renderSkeletons()}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center text-red-500">
              <RefreshCw size={32} />
            </div>
            <div>
              <p className="font-bold text-slate-800 dark:text-white">{error}</p>
              <p className="text-xs text-slate-400 mt-1">{t('check_internet_connection', 'تأكد من اتصالك بالإنترنت أو حاول مجدداً')}</p>
            </div>
            <button
              onClick={() => selectedCategory ? handleCategorySelect(selectedCategory) : loadInitialData()}
              className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-black text-sm transition-colors"
            >
              {t('retry', 'إعادة المحاولة')}
            </button>
            {selectedCategory && (
               <button 
                onClick={() => setSelectedCategory(null)}
                className="text-slate-400 font-bold text-xs hover:underline"
              >
                {t('back_to_categories', 'العودة للأقسام')}
              </button>
            )}
          </div>
        ) : isSearching || activeTab === 'favorites' ? (
          // --- NEW SEARCH RESULTS AND FAVORITES INTEGRATED SCREEN ---
          <div className="space-y-4 pb-20">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-500 bg-slate-200/50 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                  {getSearchResults().length} {t('results_matching', 'نتيجة مطابقة')}
                </span>
                {showOnlyFavorites && (
                  <span className="text-xs font-black text-amber-600 bg-amber-500/10 px-2.5 py-1 rounded-lg flex items-center gap-1">
                    <Star size={11} className="fill-current" />
                    <span>{t('favorites_only', 'المفضلة فقط')}</span>
                  </span>
                )}
              </div>
              {isSearching && (
                <button
                  onClick={resetFilters}
                  className="text-xs font-black text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
                >
                  <span>{t('cancel_search_filters', 'إلغاء فلاتر البحث')}</span>
                </button>
              )}
            </div>

            {getSearchResults().length > 0 ? (
              <div className="space-y-4">
                {getSearchResults().map((item, idx) => {
                  const isFav = item.type === 'hadith' ? isHadithFavorite(item.rawItem.id) : isDuaFavorite(item.content);
                  const isExpanded = expandedId === (item.type === 'hadith' ? item.rawItem.id : item.id);

                  return (
                    <motion.div 
                      key={item.id} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(idx * 0.04, 0.4) }}
                      className={cn("rounded-2xl overflow-hidden shadow-sm hover:shadow transition-all", getCardThemeClasses())}
                    >
                      {/* Top bar with content badges and favorites toggle */}
                      <div className="px-4 py-2 bg-white/30 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className={cn(
                            "text-[9px] font-black px-2 py-0.5 rounded-full select-none",
                            item.type === 'hadith' 
                              ? "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400" 
                              : "bg-teal-100 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400"
                          )}>
                            {item.type === 'hadith' ? t('hadith_tab', 'حديث نبوي') : t('dua_tab', 'دعاء مأثور')}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 max-w-[120px] truncate">
                            {item.categoryName}
                          </span>
                          {item.grade && (
                            <span className="text-[9px] font-black bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                              {item.grade}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          {/* Favorite toggle */}
                          <button
                            onClick={(e) => item.type === 'hadith' ? toggleFavoriteHadith(item.rawItem, e) : toggleFavoriteDua(item.rawItem, e)}
                            className="p-1.5 text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title={t('favorites_tab', 'المفضلة الشريفة')}
                          >
                            <Star size={16} className={cn("transition-all duration-300", isFav ? "text-amber-500 fill-amber-500 scale-110" : "text-slate-400")} />
                          </button>
                        </div>
                      </div>

                      {/* Content text */}
                      <div className="p-4 sm:p-5">
                        <p 
                          className="text-slate-900 dark:text-white leading-loose text-center font-bold"
                          style={{ fontFamily: getHadithFontFamily(hadithFont), fontSize: `${hadithFontSize}px` }}
                        >
                          {item.content}
                        </p>

                        {/* Description/Reference */}
                        {(item.description || item.attribution || item.reference) && (
                          <div className="mt-4 pt-3 border-t border-slate-50 dark:border-slate-800/50 flex items-center justify-between text-[11px] text-slate-400 font-bold">
                            <span className="truncate max-w-[200px]">
                              {item.type === 'hadith' ? item.attribution : item.reference}
                            </span>
                            {item.type === 'dua' && item.count && item.count !== "1" && (
                              <span className="bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 px-2 py-0.5 rounded font-black text-[10px]">
                                {t('repeat_times', 'تكرار')}: {item.count}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Hadith Explanation Expandable toggle */}
                        {item.type === 'hadith' && item.explanation && (
                          <div className="mt-3">
                            <button
                              onClick={() => toggleHadithDetail(item.rawItem.id)}
                              className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1 hover:underline"
                            >
                              <BookOpen size={13} />
                              <span>{isExpanded ? t('hide_explanation', 'إخفاء الشرح والفوائد') : t('show_explanation', 'عرض الشرح والفوائد')}</span>
                            </button>
                            
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden mt-2"
                                >
                                  <p className="text-xs font-bold leading-relaxed text-slate-600 dark:text-slate-350 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 whitespace-pre-wrap text-right">
                                    {item.explanation}
                                  </p>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )}
                      </div>

                      {/* Action buttons (Share, Download, Copy) */}
                      <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                        <button
                          onClick={async () => {
                            const appUrl = window.location.origin;
                            await copyTextToClipboard(`"${item.content}"\n\n📖 المصدر: ${item.attribution || item.reference || ''}\n—\nتم النسخ من تطبيق أذكار المؤمن: ${appUrl}`);
                            setHadithCopiedId(item.id);
                            setTimeout(() => setHadithCopiedId(null), 2000);
                          }}
                          className={cn(
                            "flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-black transition-all border cursor-pointer",
                            hadithCopiedId === item.id
                              ? "bg-emerald-500 border-emerald-400 text-white"
                              : "bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
                          )}
                        >
                          {hadithCopiedId === item.id ? <Check size={12} /> : <Copy size={12} />}
                          <span>{hadithCopiedId === item.id ? t('copied_success', 'نسخ!') : t('copy_text', 'نسخ النص')}</span>
                        </button>

                        <button
                          onClick={() => handleOpenCustomizer(item, item.type)}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-sky-50 dark:bg-sky-950/25 text-sky-600 dark:text-sky-400 border border-sky-200/20 hover:bg-sky-100 dark:hover:bg-sky-950/50 rounded-lg text-[10px] font-black cursor-pointer hover:scale-[1.02] transition-transform"
                        >
                          <Share2 size={12} />
                          <span>{t('design_and_share', 'تصميم ومشاركة')}</span>
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
                <span className="text-4xl text-slate-300 animate-bounce">🔍</span>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">{t('no_search_results', 'لم يتم العثور على أي نتائج مطابقة')}</h4>
                  <p className="text-xs text-slate-400 mt-1">{t('try_other_keywords', 'جرب كلمات أخرى أو فلاتر بحث أقل تخصصاً.')}</p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2 max-w-sm">
                  {["استغفار", "صبر", "القرآن", "سفر", "شفاء", "توبة"].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setSearchTerm(tag)}
                      className="px-3 py-1 bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/40 dark:hover:bg-teal-900/40 text-teal-600 dark:text-teal-400 rounded-full font-black text-xs border border-teal-100 dark:border-teal-900/50"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          // --- CATEGORIES LIST SCREEN ---
          <div className="space-y-4">
            {activeTab === 'hadith' && !searchTerm && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-950 dark:from-emerald-950 dark:via-teal-950 dark:to-slate-950 rounded-3xl p-4 sm:p-5.5 shadow-xl text-white relative overflow-hidden border border-emerald-500/30 shadow-emerald-950/30 group"
              >
                <div className="absolute -top-12 -left-12 w-56 h-56 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
                <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute inset-0 opacity-[0.25] mix-blend-overlay pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] scale-105" />
                <div className="absolute -bottom-8 -left-4 text-7xl sm:text-8xl font-black text-amber-300/[0.08] dark:text-amber-300/[0.12] pointer-events-none select-none">
                  حديث
                </div>
                <div className="absolute inset-3 border border-emerald-400/20 rounded-2xl pointer-events-none" />

                <div className="relative z-10 flex flex-col justify-between h-full">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 px-3.5 py-1.5 rounded-xl text-xs font-black backdrop-blur-md text-emerald-100 select-none">
                      <Sparkles size={14} className="text-amber-400 animate-pulse" />
                      <span>{t('daily_hadith_badge', 'حديث اليوم شريف')}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => toggleFavoriteHadith({
                          id: "today-hadith-id",
                          title: "حديث اليوم الشريف",
                          hadeeth: "مَن يُرِدِ اللَّهُ به خَيْرًا يُفَقِّهْهُ في الدِّينِ",
                          attribution: "رواه البخاري ومسلم",
                          grade: "صحيح",
                          explanation: "يرشد الحديث الشريف إلى أن علامة الخيرية وإرادة السعادة للعبد تكمن في فقه أحكام الشريعة وبصيرة دينه.",
                          reference: "متفق عليه",
                          hints: []
                        })}
                        className="w-9 h-9 rounded-xl flex items-center justify-center border bg-white/10 hover:bg-white/20 border-white/10 text-white cursor-pointer"
                        title="حفظ حديث اليوم"
                      >
                        <Star size={15} className={cn(isHadithFavorite("today-hadith-id") ? "text-amber-400 fill-amber-400" : "text-white")} />
                      </button>
                    </div>
                  </div>

                  <p 
                    className="leading-relaxed mb-4 text-center text-emerald-50 font-black drop-shadow-md"
                    style={{ fontFamily: getHadithFontFamily(hadithFont), fontSize: `${hadithFontSize}px` }}
                  >
                    " مَن يُرِدِ اللَّهُ به خَيْرًا يُفَقِّهْهُ في الدِّينِ "
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-emerald-500/20 pt-4" dir="rtl">
                    <div className="flex items-center gap-3">
                      <span className="font-rubik font-black italic text-[14px] sm:text-[16px] tracking-wider bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 bg-clip-text text-transparent select-none" style={{ filter: "drop-shadow(1px 1px 0px #047857) drop-shadow(2px 2px 0px #064e3b) drop-shadow(0px 4px 6px rgba(0,0,0,0.6))" }}>أذكار المؤمن</span>
                      <p className="text-xs font-bold text-emerald-100 flex items-center gap-1.5 opacity-90 select-text">
                        <BookOpen size={13} className="text-amber-400" />
                        <span>رواه البخاري ومسلم</span>
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleOpenCustomizer({
                          title: "حديث اليوم الشريف",
                          hadeeth: "مَن يُرِدِ اللَّهُ به خَيْرًا يُفَقِّهْهُ في الدِّينِ",
                          attribution: "رواه البخاري ومسلم",
                          grade: "صحيح",
                          explanation: "يرشد الحديث الشريف إلى أن علامة الخيرية وإرادة السعادة للعبد تكمن في فقه أحكام الشريعة وبصيرة دينه.",
                          reference: "متفق عليه",
                          hints: []
                        }, 'hadith')}
                        className="px-3.5 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/30 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 text-emerald-100 cursor-pointer"
                      >
                        <Share2 size={13} />
                        <span>{t('design_and_share', 'تصميم ومشاركة')}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'dua' && !searchTerm && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-emerald-600 to-emerald-900 dark:from-indigo-950 dark:to-[#1e1b4b] rounded-3xl p-6 sm:p-8 shadow-xl text-white relative overflow-hidden border border-indigo-500/20 group"
              >
                <div className="absolute inset-0 opacity-[0.06] mix-blend-overlay pointer-events-none bg-[url('/images/arabesque.png')]" />
                <div className="absolute -top-16 -left-16 w-48 h-48 bg-indigo-400/20 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-400/30 transition-all duration-500" />
                <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-violet-400/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute inset-4 border border-white/10 rounded-2xl pointer-events-none" />

                <div className="relative z-10 flex flex-col justify-between h-full">
                  <div className="flex justify-between items-center mb-5">
                    <div className="flex items-center gap-2 bg-white/10 dark:bg-black/20 border border-white/10 px-3.5 py-1.5 rounded-xl text-xs font-black backdrop-blur-md text-indigo-100 select-none">
                      <Sparkles size={14} className="text-amber-400 animate-pulse" />
                      <span>{t('daily_dua_badge', 'دعاء اليوم مأثور')}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => toggleFavoriteDua({
                          content: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
                          description: "سورة البقرة - الآية 201",
                          count: "1",
                          reference: "القرآن الكريم"
                        })}
                        className="w-9 h-9 rounded-xl flex items-center justify-center border bg-white/10 hover:bg-white/20 border-white/10 text-white cursor-pointer"
                        title={t('favorites_tab', 'المفضلة الشريفة')}
                      >
                        <Star size={15} className={cn(isDuaFavorite("رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ") ? "text-amber-400 fill-amber-400" : "text-white")} />
                      </button>
                    </div>
                  </div>

                  <p 
                    className="leading-loose mb-6 text-center text-slate-50 font-black drop-shadow"
                    style={{ fontFamily: getHadithFontFamily(hadithFont), fontSize: `${hadithFontSize}px` }}
                  >
                    " رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ "
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
                    <p className="text-xs font-bold text-indigo-100 flex items-center gap-1.5 opacity-90 select-text">
                      <BookOpen size={13} className="text-amber-400" />
                      <span>{t('quranic_duas', 'أدعية قرآنية')} - البقرة 201</span>
                    </p>
                    
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleOpenCustomizer({
                          categoryName: "أدعية قرآنية من الذكر الحكيم",
                          content: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
                          reference: "سورة البقرة - الآية 201",
                          count: "1"
                        }, 'dua')}
                        className="px-3.5 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 text-white cursor-pointer"
                      >
                        <Share2 size={13} />
                        <span>{t('design_and_share', 'تصميم ومشاركة')}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {!selectedCategory ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredCategories.length > 0 ? (
                    filteredCategories.map((cat, idx) => (
                      <button
                        key={activeTab === 'hadith' ? (cat as HadithCategory).id : (cat as DuaCategory).category}
                        onClick={() => handleCategorySelect(activeTab === 'hadith' ? (cat as HadithCategory).id : (cat as DuaCategory).category)}
                        className={cn("group relative flex items-center justify-between p-4 rounded-2xl shadow-sm text-right transition-all hover:border-teal-500/30 hover:shadow-md duration-75 active:scale-[0.98] active:opacity-70 overflow-hidden cursor-pointer", getCardThemeClasses())}
                      >
                        <div className="absolute right-0 top-0 w-1 h-full bg-teal-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-teal-50 dark:bg-teal-900/30 rounded-xl flex items-center justify-center text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform">
                            {activeTab === 'hadith' ? <BookOpen size={20} /> : <Library size={20} />}
                          </div>
                          <div>
                            <h3 className="font-black text-slate-800 dark:text-white line-clamp-1">
                              {activeTab === 'hadith' ? (cat as HadithCategory).title : (cat as DuaCategory).category}
                            </h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                              {activeTab === 'hadith' 
                                ? `${(cat as HadithCategory).hadeethes_count} ${t('hadith_unit', 'حديث')}`
                                : `${(cat as DuaCategory).count} ${t('dua_unit', 'ذكر/دعاء')}`
                              }
                            </p>
                          </div>
                        </div>
                        <ChevronLeft className="text-slate-300 group-hover:text-teal-500 transition-colors" size={20} />
                      </button>
                    ))
                  ) : (
                    <div className="text-center py-20 text-slate-400 font-bold col-span-2">{t('no_categories_found', 'لم يتم العثور على أقسام متطابقة')}</div>
                  )}
                </div>
            ) : (
              <div className="space-y-4 pb-20">
                <div className={cn("flex items-center justify-between mb-2 p-3 rounded-2xl shadow-sm", getCardThemeClasses())}>
                  <button 
                    onClick={() => setSelectedCategory(null)}
                    className="flex items-center gap-1 text-teal-600 dark:text-teal-400 font-black text-xs hover:underline cursor-pointer"
                  >
                    <ChevronRight size={14} />
                    <span>{t('back_to_main_categories', 'العودة للأقسام الرئيسية')}</span>
                  </button>
                  <span className="text-xs font-black text-slate-700 dark:text-slate-300 pr-2 border-r-2 border-teal-500">
                    {activeTab === 'hadith' 
                      ? categories.find(c => c.id === selectedCategory)?.title 
                      : selectedCategory
                    }
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeTab === 'hadith' ? (
                    items.map((hadith, idx) => {
                      const isExpanded = expandedId === hadith.id;
                      const detail = itemDetails[hadith.id];
                      const isItemLoading = detailLoading === hadith.id;
                      const isFav = isHadithFavorite(hadith.id);

                      return (
                        <div key={hadith.id} className={cn("rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow h-fit", getCardThemeClasses())}>
                          <div className="w-full p-3 sm:p-3.5 flex items-center justify-between text-right outline-none group">
                            <button
                              onClick={() => toggleHadithDetail(hadith.id)}
                              className="flex-1 font-extrabold text-xs text-slate-700 dark:text-slate-200 line-clamp-2 leading-relaxed text-right hover:text-teal-600 dark:hover:text-teal-400 transition-colors cursor-pointer"
                            >
                              {hadith.title}
                            </button>
                            <div className="flex items-center gap-1 shrink-0 mr-3">
                              {/* Quick Favorite */}
                              <button
                                onClick={() => {
                                  if (detail) {
                                    toggleFavoriteHadith(detail);
                                  } else {
                                    // If not loaded yet, fetch and save
                                    toggleHadithDetail(hadith.id).then(() => {
                                      const freshDetail = itemDetails[hadith.id];
                                      if (freshDetail) toggleFavoriteHadith(freshDetail);
                                    });
                                  }
                                }}
                                className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer text-slate-400 hover:text-amber-500"
                                title="حفظ للمفضلة"
                              >
                                <Star size={16} className={cn(isFav ? "text-amber-500 fill-amber-500 scale-110" : "text-slate-400")} />
                              </button>

                              <button
                                onClick={() => toggleHadithDetail(hadith.id)}
                                className={cn(
                                  "w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer",
                                  isExpanded ? "bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400" : "bg-slate-50 dark:bg-slate-800 text-slate-400"
                                )}
                              >
                                <ChevronDown className={cn("transition-transform duration-300", isExpanded && "rotate-180")} size={18} />
                              </button>
                            </div>
                          </div>

                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="border-t border-slate-50 dark:border-slate-800/50"
                              >
                                <div id={`hadith-card-export-${hadith.id}`} className="w-full px-1 py-2.5 sm:px-2.5 sm:py-4 bg-slate-50 dark:bg-slate-950 rounded-3xl">
                                  <div className={cn("pt-4 px-4 pb-2.5 sm:pt-4 sm:px-5 sm:pb-2.5 rounded-[1.5rem] sm:rounded-[2rem] shadow-md relative overflow-hidden", getCardThemeClasses())}>
                                  {isItemLoading ? (
                                    <div className="flex justify-center py-6">
                                      <Loader2 className="w-6 h-6 text-teal-600 animate-spin" />
                                    </div>
                                  ) : detail ? (
                                    <>
                                      <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 relative mb-3">
                                        <Sparkles className="absolute top-2 right-2 text-teal-500/10" size={40} />
                                        <p 
                                          className="text-slate-900 dark:text-white leading-relaxed text-center py-2 relative z-10 font-bold"
                                          style={{ fontFamily: getHadithFontFamily(hadithFont), fontSize: `${hadithFontSize}px` }}
                                        >
                                          {detail.hadeeth}
                                        </p>
                                        <div className="mt-4 pt-4 border-t border-slate-200/50 dark:border-slate-700/50 flex flex-wrap gap-2 text-[10px] font-black uppercase text-slate-400 relative z-10">
                                          <span className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded">
                                            {t('hadith_grade', 'رتبة الحديث')}: {detail.grade}
                                          </span>
                                          <span className="bg-slate-150 dark:bg-slate-800 text-slate-600 dark:text-slate-350 px-2 py-1 rounded">
                                            {t('source_or_narrator', 'المصدر الأصيل')}: {detail.attribution}
                                          </span>
                                        </div>
                                      </div>

                                      {detail.explanation && (
                                        <div className="space-y-2 mb-3 relative z-10 text-right">
                                          <h4 className="flex items-center gap-2 font-black text-xs text-emerald-600 dark:text-emerald-400 mb-0.5">
                                            <BookOpen size={14} />
                                            <span>{t('explanation_and_benefits', 'الشرح والفوائد الجليلة:')}</span>
                                          </h4>
                                          <p className="text-sm font-bold leading-relaxed text-slate-600 dark:text-slate-350 whitespace-pre-wrap select-text bg-slate-50 dark:bg-slate-855 p-3 sm:p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                                            {detail.explanation}
                                          </p>
                                        </div>
                                      )}

                                      <div className="flex flex-wrap sm:flex-nowrap gap-2 pt-2" data-html2canvas-ignore="true">
                                        <button 
                                          onClick={() => handleOpenCustomizer(detail, 'hadith')}
                                          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition-all shadow-md cursor-pointer hover:scale-[1.02]"
                                        >
                                          <Share2 size={14} />
                                          <span>{t('design_and_share', 'تصميم ومشاركة')}</span>
                                        </button>

                                        <button 
                                          onClick={async () => {
                                            const appUrl = window.location.origin;
                                            await copyTextToClipboard(`✨ *${detail.title}* ✨\n\n"${detail.hadeeth}"\n\n📖 المصدر: ${detail.attribution}\n—\nتم النسخ من تطبيق أذكار المؤمن: ${appUrl}`);
                                            setHadithCopiedId(hadith.id);
                                            setTimeout(() => setHadithCopiedId(null), 2000);
                                          }} 
                                          className={cn(
                                            "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer border hover:scale-[1.02]",
                                            hadithCopiedId === hadith.id
                                              ? "bg-emerald-500 border-emerald-400 text-white"
                                              : "bg-slate-100 dark:bg-slate-800 border-slate-200/50 dark:border-slate-700 text-slate-600 dark:text-slate-350 hover:bg-slate-200 dark:hover:bg-slate-700"
                                          )}
                                        >
                                          {hadithCopiedId === hadith.id ? (
                                            <Check size={14} className="animate-bounce" />
                                          ) : (
                                            <Copy size={14} />
                                          )}
                                          <span>{hadithCopiedId === hadith.id ? t('copied_success', 'تم النسخ!') : t('copy_text', 'نسخ النص')}</span>
                                        </button>
                                      </div>

                                      <div className="mt-4 pt-2.5 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px]" dir="rtl">
                                        <span className="font-rubik font-black italic text-[13px] sm:text-[15px] tracking-wider bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 bg-clip-text text-transparent select-none" style={{ filter: "drop-shadow(1px 1px 0px #047857) drop-shadow(2px 2px 0px #064e3b) drop-shadow(0px 4px 6px rgba(0,0,0,0.6))" }}>أذكار المؤمن</span>
                                        <span className="font-semibold text-slate-500 dark:text-slate-400">{t('hadith_tab', 'حديث نبوي شريف')}</span>
                                      </div>
                                    </>
                                  ) : (
                                    <div className="text-center py-4 text-xs text-red-500">فشل تحميل تفاصيل الحديث</div>
                                  )}
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })
                  ) : (
                    duaItems.map((dua, idx) => {
                      const isFav = isDuaFavorite(dua.content);
                      const targetCount = typeof dua.count === 'string' ? parseInt(dua.count) || 1 : (dua.count || 1);
                      const currentCount = sessionDuaCounts[dua.content] || 0;
                      const isCompleted = currentCount >= targetCount;

                      return (
                        <div key={idx} className="space-y-2 h-full flex flex-col">
                          <div id={`dua-card-export-${idx}`} className="w-full px-1 py-4 sm:px-3 sm:py-6 bg-slate-50 dark:bg-slate-950 rounded-3xl flex-grow">
                            <div
                              id={`dua-card-${idx}`}
                              className={cn("rounded-2xl p-5 shadow-md space-y-4 relative overflow-hidden h-full flex flex-col justify-between", getCardThemeClasses())}
                            >
                              <div className="absolute top-2 left-2 z-20">
                                <button
                                  onClick={() => toggleFavoriteDua(dua)}
                                  className="p-1.5 rounded-lg bg-slate-50/50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 transition-colors cursor-pointer text-slate-400 hover:text-amber-500"
                                  title={t('favorites_tab', 'حفظ في المفضلة')}
                                >
                                  <Star size={16} className={cn("transition-all duration-300", isFav ? "text-amber-500 fill-amber-500 scale-110" : "text-slate-400")} />
                                </button>
                              </div>

                              <Sparkles className="absolute top-2 right-2 text-teal-500/5" size={60} />
                              <p 
                                className="text-slate-900 dark:text-white leading-loose text-center relative z-10 font-bold px-4 flex-grow"
                                style={{ fontFamily: getHadithFontFamily(hadithFont), fontSize: `${hadithFontSize}px` }}
                              >
                                {dua.content}
                              </p>
                              
                              {dua.description && (
                                <div className="bg-teal-50 dark:bg-teal-900/20 p-4 rounded-xl text-[13px] font-bold text-teal-750 dark:text-teal-300 border-r-4 border-teal-500 relative z-10 text-right">
                                  {dua.description}
                                </div>
                              )}

                              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/50 relative z-10 mt-2">
                                <div className="text-[10px] font-bold text-slate-400 tracking-wide flex flex-col gap-0.5 text-right w-full">
                                  {dua.reference && <span className="text-slate-400">{t('source_or_narrator', 'المصدر')}: {dua.reference}</span>}
                                </div>
                                
                                <div className="flex items-center gap-3 shrink-0">
                                  <span className="text-[10px] font-bold text-slate-400">{t('repeat_times', 'التكرار')}: {targetCount}</span>
                                  <button
                                    onClick={() => handleDuaIncrement(dua)}
                                    className={cn(
                                      "w-10 h-10 rounded-xl flex flex-col items-center justify-center transition-all shadow-sm cursor-pointer border",
                                      isCompleted
                                        ? "bg-teal-500 border-teal-400 text-white"
                                        : "bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 border-teal-100 dark:border-teal-800/50 hover:bg-teal-100 dark:hover:bg-teal-900/50"
                                    )}
                                  >
                                    {isCompleted ? <Check size={16} /> : <span className="text-sm font-black">{currentCount}</span>}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2 px-2 pb-2 mt-auto">
                            <button 
                              onClick={() => handleOpenCustomizer(dua, 'dua')}
                              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition-all shadow-md cursor-pointer hover:scale-[1.02]"
                            >
                              <Share2 size={14} />
                              <span>{t('design_and_share', 'تصميم ومشاركة')}</span>
                            </button>

                            <button 
                              onClick={async () => {
                                const appUrl = window.location.origin; 
                                await copyTextToClipboard(`"${dua.content}"${dua.reference ? `\n\n📖 المصدر: ${dua.reference}` : ''}\n—\nتم النسخ من تطبيق أذكار المؤمن: ${appUrl}`);
                                setHadithCopiedId(`dua-${idx}`);
                                setTimeout(() => setHadithCopiedId(null), 2000);
                              }}
                              className={cn(
                                "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-black transition-all border cursor-pointer",
                                hadithCopiedId === `dua-${idx}`
                                  ? "bg-emerald-500 border-emerald-400 text-white"
                                  : "bg-slate-100 dark:bg-slate-800 border-slate-200/50 dark:border-slate-705 text-slate-600 dark:text-slate-350 hover:bg-slate-200 dark:hover:bg-slate-700"
                              )}
                             >
                                {hadithCopiedId === `dua-${idx}` ? (
                                  <Check size={14} className="animate-bounce" />
                                ) : (
                                  <Copy size={14} />
                                )}
                                <span>{hadithCopiedId === `dua-${idx}` ? t('copied_success', 'تم النسخ!') : t('copy_text', 'نسخ النص')}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* --- NEW BEAUTIFUL SHARE CARD CUSTOMIZER MODAL --- */}
      <AnimatePresence>
        {shareCustomizerItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-slate-50 dark:bg-slate-900 rounded-[28px] max-w-2xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-slate-100 dark:border-slate-800 text-right"
            >
              {/* Modal Header */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
                <button
                  onClick={() => setShareCustomizerItem(null)}
                  className="p-1.5 rounded-full bg-slate-250 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-pointer"
                >
                  <X size={18} />
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-base font-black text-slate-800 dark:text-white">{t('card_designer_title', 'صانع ومصمم بطاقة الآية والذكر')}</span>
                  <Sparkle className="text-teal-600 animate-spin" size={18} />
                </div>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6 hide-scrollbar lg:grid lg:grid-cols-12 lg:gap-6 lg:space-y-0">
                
                {/* Right / Top Side: Live Card Preview Area */}
                <div className="lg:col-span-7 flex flex-col justify-center items-center">
                  <span className="text-[10px] font-black text-slate-400 mb-2 self-start uppercase">معاينة بطاقة المشاركة الذكية:</span>
                  
                  {/* Real-time preview element target for html-to-image */}
                  <div 
                    ref={previewCardRef}
                    id="custom-share-preview-card"
                    className={cn(
                      "w-full max-w-md aspect-[4/5] rounded-[24px] p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden transition-all shadow-lg select-text",
                      cardTheme === 'emerald' && "bg-gradient-to-br from-emerald-50 to-teal-100 text-slate-900 border-2 border-emerald-300/40",
                      cardTheme === 'indigo' && "bg-gradient-to-br from-indigo-950 to-[#1e1b4b] text-white border-2 border-indigo-500/30",
                      cardTheme === 'rose' && "bg-gradient-to-br from-rose-50 to-pink-100 text-slate-900 border-2 border-rose-300/40",
                      cardTheme === 'slate' && "bg-gradient-to-br from-slate-900 to-slate-950 text-slate-100 border-2 border-slate-800"
                    )}
                  >
                    {/* Visual arabesque ornaments */}
                    <div className={cn(
                      "absolute inset-0 opacity-[0.08] mix-blend-overlay pointer-events-none bg-[url('/images/arabesque.png')]",
                      cardTheme === 'indigo' && "opacity-[0.12]"
                    )} />
                    
                    {/* Card borders/frames */}
                    {cardBorder && (
                      <div className={cn(
                        "absolute inset-3 border rounded-[18px] pointer-events-none",
                        cardTheme === 'emerald' && "border-emerald-500/10",
                        cardTheme === 'indigo' && "border-white/10",
                        cardTheme === 'rose' && "border-rose-500/10",
                        cardTheme === 'slate' && "border-slate-800"
                      )} />
                    )}

                    {/* Faint elegant background calligraphy watermark */}
                    <div className={cn(
                      "absolute -bottom-8 -left-4 text-8xl font-black pointer-events-none select-none select-text",
                      cardTheme === 'emerald' && "text-emerald-500/[0.04] dark:text-emerald-500/[0.07]",
                      cardTheme === 'indigo' && "text-indigo-400/[0.05]",
                      cardTheme === 'rose' && "text-pink-500/[0.04]",
                      cardTheme === 'slate' && "text-slate-500/[0.04]"
                    )}>
                      {shareCustomizerItem.type === 'hadith' ? 'حديث' : 'دعاء'}
                    </div>

                    {/* Card Header (Category / Type) */}
                    <div className="relative z-10 flex items-center justify-between border-b pb-3.5 border-slate-500/10">
                      <div className="flex items-center gap-1.5">
                        <span className={cn(
                          "w-2 h-2 rounded-full animate-ping",
                          cardTheme === 'indigo' ? "bg-amber-400" : "bg-emerald-500"
                        )} />
                        <span className={cn(
                          "text-[10px] font-extrabold uppercase tracking-widest",
                          cardTheme === 'indigo' ? "text-amber-300" : "text-slate-500"
                        )}>
                          {shareCustomizerItem.title}
                        </span>
                      </div>
                      
                      {shareCustomizerItem.grade && (
                        <span className={cn(
                          "text-[9px] font-black px-2 py-0.5 rounded",
                          cardTheme === 'indigo' ? "bg-amber-500/20 text-amber-300" : "bg-emerald-600/10 text-emerald-800"
                        )}>
                          {shareCustomizerItem.grade}
                        </span>
                      )}
                    </div>

                    {/* Card Content Text */}
                    <div className="my-auto py-6 relative z-10 text-center">
                      <p 
                        className="leading-loose font-bold"
                        style={{ fontFamily: cardFont, fontSize: `${cardFontSize}px` }}
                      >
                        " {shareCustomizerItem.content} "
                      </p>

                      {shareCustomizerItem.type === 'dua' && shareCustomizerItem.count && shareCustomizerItem.count !== "1" && (
                        <span className={cn(
                          "inline-block mt-3 px-3 py-1 text-[11px] font-black rounded-lg shadow-sm border",
                          cardTheme === 'indigo' ? "bg-indigo-900/50 border-indigo-500/30 text-amber-300" : "bg-teal-50 border-teal-200/40 text-teal-700"
                        )}>
                          التكرار المطلوب: {shareCustomizerItem.count} مرات
                        </span>
                      )}
                    </div>

                    {/* Card Footer (Attribution) */}
                    <div className="relative z-10 flex items-end justify-between border-t pt-3.5 border-slate-500/10">
                      <span className={cn(
                        "text-[10px] font-black max-w-[150px] truncate",
                        cardTheme === 'indigo' ? "text-slate-400" : "text-slate-500"
                      )}>
                        {shareCustomizerItem.attribution || shareCustomizerItem.reference || 'أثر مأثور'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Left / Bottom Side: Customize options controls */}
                <div className="lg:col-span-5 space-y-5 flex flex-col justify-between">
                  <div className="space-y-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase block">تخصيص جماليات البطاقة:</span>

                    {/* Theme choice selector */}
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-500 block">طابع ولون البطاقة الشريفة:</label>
                      <div className="grid grid-cols-5 gap-2">
                        {[
                          { key: 'emerald', name: 'أخضر', bg: 'bg-emerald-100 border-emerald-300 text-emerald-800' },
                          { key: 'indigo', name: 'كحلي', bg: 'bg-indigo-950 border-indigo-800 text-indigo-100' },
                          { key: 'rose', name: 'وردي', bg: 'bg-rose-150 border-rose-300 text-rose-800' },
                          { key: 'slate', name: 'فحمي', bg: 'bg-slate-900 border-slate-800 text-slate-100' }
                        ].map((theme) => (
                          <button
                            key={theme.key}
                            onClick={() => setCardTheme(theme.key as any)}
                            className={cn(
                              "py-2.5 rounded-xl border text-[10px] font-black transition-all flex flex-col items-center gap-1 cursor-pointer",
                              theme.bg,
                              cardTheme === theme.key ? "ring-2 ring-teal-500 scale-105 shadow-md" : "opacity-80 hover:opacity-100"
                            )}
                          >
                            <span className="w-4 h-4 rounded-full border border-black/10 bg-current" />
                            <span>{theme.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Font selection */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-500 block">خط الكتابة الشريفة:</label>
                      <select
                        value={cardFont}
                        onChange={(e) => setCardFont(e.target.value)}
                        className="w-full text-right p-2.5 text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                      >
                        <option value="Scheherazade New">خط النسخ المميز (شهرزاد)</option>
                        <option value="Amiri">خط المنبر الشريف (أميري)</option>
                        <option value="Cairo">خط القاهرة المودرن</option>
                        <option value="Zain">خط زين الدائري الأنيق</option>
                        <option value="El Messiri">خط الرسائل والزخرفة (المسيري)</option>
                      </select>
                    </div>

                    {/* Font Size slider */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs font-black text-slate-500">
                        <span className="font-mono">{cardFontSize}px</span>
                        <span>حجم خط الكتابة الشريفة:</span>
                      </div>
                      <input
                        type="range"
                        min="14"
                        max="32"
                        value={cardFontSize}
                        onChange={(e) => setCardFontSize(parseInt(e.target.value, 10))}
                        className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                      />
                    </div>

                    {/* Toggle watermark / Logo / Border */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => setCardLogo(!cardLogo)}
                        className={cn(
                          "py-2 px-3 rounded-xl border text-xs font-black transition-all flex items-center justify-between cursor-pointer",
                          cardLogo 
                            ? "bg-teal-500/10 border-teal-500/30 text-teal-700 dark:text-teal-400" 
                            : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500"
                        )}
                      >
                        <span className="text-[10px]">{cardLogo ? "مفعّل" : "ملغى"}</span>
                        <span>شعار التطبيق</span>
                      </button>

                      <button
                        onClick={() => setCardBorder(!cardBorder)}
                        className={cn(
                          "py-2 px-3 rounded-xl border text-xs font-black transition-all flex items-center justify-between cursor-pointer",
                          cardBorder 
                            ? "bg-teal-500/10 border-teal-500/30 text-teal-700 dark:text-teal-400" 
                            : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500"
                        )}
                      >
                        <span className="text-[10px]">{cardBorder ? "مفعّل" : "ملغى"}</span>
                        <span>إطار زخرفي</span>
                      </button>
                    </div>
                  </div>

                  {/* Actions (Share / Download / Copy Text) */}
                  <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={handleShareCustomCardImage}
                      disabled={sharingStatus === 'sharing' || sharingStatus === 'generating'}
                      className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-95 disabled:opacity-50"
                    >
                      {sharingStatus === 'sharing' ? (
                        <>
                          <Loader2 size={15} className="animate-spin" />
                          <span>جاري فتح شاشة المشاركة...</span>
                        </>
                      ) : sharingStatus === 'generating' ? (
                        <>
                          <Loader2 size={15} className="animate-spin" />
                          <span>{t('loading', 'جاري رسم البطاقة...')}</span>
                        </>
                      ) : (
                        <>
                          <Share2 size={15} />
                          <span>{t('share_as_image', 'مشاركة البطاقة كصورة الآن')}</span>
                        </>
                      )}
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={handleDownloadCustomCard}
                        disabled={sharingStatus === 'generating'}
                        className="py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-[11px] rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {sharingStatus === 'downloaded' ? (
                          <>
                            <Check size={14} className="text-emerald-400 animate-bounce" />
                            <span>{t('copied_success', 'تم التحميل!')}</span>
                          </>
                        ) : (
                          <>
                            <Download size={14} />
                            <span>{t('download_image', 'تحميل الصورة')}</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={handleCopyDecoratedText}
                        className="py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-extrabold text-[11px] rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200 dark:border-slate-700"
                      >
                        {sharingStatus === 'copied-text' ? (
                          <>
                            <Check size={14} className="text-emerald-600 dark:text-emerald-400 animate-bounce" />
                            <span>{t('copied_success', 'تم نسخ النص!')}</span>
                          </>
                        ) : (
                          <>
                            <Copy size={14} />
                            <span>{t('copy_decorated_text', 'نسخ نص مزخرف')}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
