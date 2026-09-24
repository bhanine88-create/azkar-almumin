import { BackButton } from './ui/BackButton';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { BookOpenText, Settings2, Settings, Search, ChevronLeft, ChevronRight, X, Type, Palette, AlignRight, RefreshCw, Bookmark, SlidersHorizontal, Sparkles, Headphones, SearchCode, Menu, LayoutDashboard, Database, Info, Heart, Trash2, HeartOff, CheckCircle2, TrendingUp, Compass, Highlighter, HardDrive, Download, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuranSettings } from '../context/QuranSettingsContext';
import { useAppContext } from '../AppContext';
import { cn } from '../lib/utils';
import { AnimatePresence } from 'motion/react';
import { QuranAdvancedSearch } from './QuranAdvancedSearch';
import { STATIC_SURAHS } from '../utils/staticQuranData';
import { useSmartNavigation } from '../lib/navigation';
import { progressService, QuranSurahProgress } from '../services/progressService';
import { auth } from '../firebase';
import { QuranEnhancementsHub } from './QuranEnhancementsHub';
import { useTranslation } from '../i18n';
import { quranOfflineService, DownloadedSurahInfo } from '../services/quranOfflineService';
import { quranIndexedDbService } from '../services/quranIndexedDbService';
import { safeLocalStorageGetItem, safeLocalStorageSetItem, safeLocalStorageRemoveItem } from "../utils/storage";
import { useProgressiveList } from '../lib/useProgressiveList';

const QURAN_FONTS = [
  { id: 'Uthmanic Hafs', name: 'عثماني حفص' },
  
  { id: 'Amiri', name: 'أميري' },
  { id: 'Scheherazade New', name: 'شهرزاد' },
  { id: 'Cairo', name: 'كايرو' },
  { id: 'Almarai', name: 'المراعي' },
  { id: 'Vazirmatn', name: 'وزير' },
  { id: 'El Messiri', name: 'المسيري' },
  { id: 'Noto Kufi Arabic', name: 'كوفي' },
  { id: 'Readex Pro', name: 'ريدكس' },
];

const LOCAL_TRANSLATIONS: Record<string, Record<string, string>> = {
  fr: {
    advancedSearch: "Recherche Avancée",
    thematicSearch: "Recherche Thématique",
    searchByMeaning: "Rechercher par sens et thèmes",
    appData: "Données de l'App",
    updateIndex: "Mettre à jour l'index",
    reloadSurahList: "Recharger la liste des sourates",
    version: "Version 3.0",
    praiseToAllah: "Terminé - Louange à Allah",
    meditationAssistant: "Assistant de Méditation & d'Amélioration du Moushaf",
    exploreThematic: "Explorez l'index thématique des versets, le vocabulaire du Coran et le guide de tajweed coloré interactif.",
    openMeditation: "Ouvrir l'assistant interactif",
    quickJump: "Saut rapide au verset",
    surahAndAyah: "Sourate {surah}, Verset {ayah}",
    fridaySunnah: "Sounnah du Vendredi",
    fridayReminder: "N'oubliez pas de lire la sourate Al-Kahf pour éclairer votre semaine.",
    readNow: "Lire maintenant",
    searchResultsFor: "Résultats de recherche pour \"{query}\"",
    matchingVerses: "{count} verset(s) correspondant(s)",
    searchingVerses: "Recherche dans les versets...",
    loadingSurahs: "Chargement des sourates...",
    loadingSlow: "Le chargement semble prendre du temps...",
    clearCache: "Vider le cache",
    errorLoading: "Une erreur est survenue lors du chargement des sourates. Veuillez vérifier votre connexion Internet.",
    noSurahs: "Aucune sourate",
    pleaseRefresh: "Veuillez rafraîchir la liste si le problème persiste.",
    updateData: "Mettre à jour les données",
    searchPlaceholder: "Cherche sourate ou verset...",
    noResultsFound: "Aucun résultat trouvé",
    noResultsDesc: "Nous n'avons trouvé aucune sourate ou verset correspondant à \"{query}\". Essayez d'autres mots-clés ou recherchez par numéro.",
    clearSearch: "Effacer la recherche",
    quranMenu: "Menu du Coran",
    extraOptions: "Options & Fonctionnalités",
    toolsAndTracking: "Outils & Suivi",
    reciterMushaf: "Coran Récité (Audio)",
    continuousRecitation: "Lecture continue de divers récitants",
    audioDownloads: "Téléchargements Audio",
    manageAudioFiles: "Gérer les fichiers audio",
    khatmaTracker: "Suivi de Khatma",
    trackReadingProgress: "Suivez vos progrès de lecture",
    mushafSettings: "Paramètres du Moushaf",
    mushafEditionLabel: "Édition du Moushaf",
    editionHafs: "Édition Hafs",
    editionWarsh: "Édition Warsh",
    editionTajweed: "Édition Tajweed",
    fontSizeLabel: "Taille du texte",
    fontTypeLabel: "Style de police",
    themeLabel: "Thème de lecture",
    themeLight: "Clair",
    themeDark: "Sombre",
    themeSepia: "Sépia",
    themeParchment: "Parchemin",
    themeSand: "Sable",
    themeSlate: "Ardoise Sombre",
    quickJumpTitle: "Saut Rapide au Verset",
    settingsLabel: "Paramètres",
    menuLabel: "Menu",
    audioPlayer: "Lecteur Audio",
    lastReadTitle: "Reprendre la lecture",
    lastReadDesc: "Dernière lecture : {surah} - Verset {ayah} (Page {page})",
    lastReadBtn: "Reprendre"
  },
  en: {
    advancedSearch: "Advanced Search",
    thematicSearch: "Thematic Search",
    searchByMeaning: "Search by meaning and topics",
    appData: "App Data",
    updateIndex: "Update Index",
    reloadSurahList: "Reload Surah list",
    version: "Version 3.0",
    praiseToAllah: "Completed - Praise be to Allah",
    meditationAssistant: "Interactive Meditation Assistant",
    exploreThematic: "Explore the thematic index of verses, Quranic vocabulary, and interactive color-coded Tajweed rules.",
    openMeditation: "Open Meditation Assistant",
    quickJump: "Quick Jump to Ayah",
    surahAndAyah: "Surah {surah}, Ayah {ayah}",
    fridaySunnah: "Friday Sunnah",
    fridayReminder: "Don't forget to read Surah Al-Kahf to illuminate your week.",
    readNow: "Read Now",
    searchResultsFor: "Search results for \"{query}\"",
    matchingVerses: "{count} matching verse(s)",
    searchingVerses: "Searching verses...",
    loadingSurahs: "Loading Surahs...",
    loadingSlow: "Loading seems to be taking too long...",
    clearCache: "Clear Cache",
    errorLoading: "An error occurred while loading Surahs. Please check your internet connection.",
    noSurahs: "No Surahs",
    pleaseRefresh: "Please refresh the list if this problem persists.",
    updateData: "Update Data",
    searchPlaceholder: "Search surah or ayah...",
    noResultsFound: "No results found",
    noResultsDesc: "We couldn't find any surah or verse matching \"{query}\". Try using different keywords or search by surah number.",
    clearSearch: "Clear Search",
    quranMenu: "Quran Menu",
    extraOptions: "Extra Options & Features",
    toolsAndTracking: "Tools & Tracking",
    reciterMushaf: "Audio Recitations",
    continuousRecitation: "Continuous play with multiple reciters",
    audioDownloads: "Audio Downloads",
    manageAudioFiles: "Manage audio files",
    khatmaTracker: "Khatma Tracker",
    trackReadingProgress: "Track your reading progress",
    mushafSettings: "Mushaf Settings",
    mushafEditionLabel: "Mushaf Edition",
    editionHafs: "Hafs Edition",
    editionWarsh: "Warsh Edition",
    editionTajweed: "Tajweed Edition",
    fontSizeLabel: "Font Size",
    fontTypeLabel: "Font Family",
    themeLabel: "Reading Theme",
    themeLight: "Light",
    themeDark: "Dark",
    themeSepia: "Sepia",
    themeParchment: "Parchment",
    themeSand: "Sand",
    themeSlate: "Slate Dark",
    quickJumpTitle: "Quick Jump to Verse",
    settingsLabel: "Settings",
    menuLabel: "Menu",
    audioPlayer: "Audio Player",
    lastReadTitle: "Resume Quick Reading",
    lastReadDesc: "Last read: {surah} - Ayah {ayah} (Page {page})",
    lastReadBtn: "Resume Reading"
  },
  ar: {
    advancedSearch: "البحث المتقدم",
    thematicSearch: "البحث الموضوعي",
    searchByMeaning: "ابحث بالمعنى والمواضيع",
    appData: "بيانات التطبيق",
    updateIndex: "تحديث الفهرس",
    reloadSurahList: "إعادة تحميل قائمة السور",
    version: "الإصدار 3.0",
    praiseToAllah: "مكتمل - لله الحمد والمنة",
    meditationAssistant: "مساعد التدبر وتحسين المصحف التفاعلي",
    exploreThematic: "استكشف الفهرس الموضوعي للآيات، معجم غريب المفردات، ودليل قواعد التجويد الملون التفاعلي لتحسين تلاوتك وفهمك للقرآن الكريم.",
    openMeditation: "فتح مساعد التدبر التفاعلي",
    quickJump: "انتقال سريع إلى الآية",
    surahAndAyah: "سورة {surah}، الآية {ayah}",
    fridaySunnah: "سُنّة يوم الجمعة",
    fridayReminder: "لا تنسَ قراءة سورة الكهف لتُنير لك ما بين الجمعتين",
    readNow: "اقرأ الآن",
    searchResultsFor: "نتائج البحث عن \"{query}\"",
    matchingVerses: "{count} آية مطابقة",
    searchingVerses: "جاري البحث في الآيات...",
    loadingSurahs: "جاري تحميل السور...",
    loadingSlow: "يبدو أن التحميل يستغرق وقتاً طويلاً...",
    clearCache: "مسح التخزين المؤقت",
    errorLoading: "حدث خطأ أثناء تحميل السور. يرجى التحقق من اتصالك بالإنترنت.",
    noSurahs: "لا توجد سُور",
    pleaseRefresh: "يرجى تحديث القائمة إذا كانت هذه المشكلة مستمرة.",
    updateData: "تحديث البيانات",
    searchPlaceholder: "البحث عن سورة أو آية قرآنية...",
    noResultsFound: "لم نجد ما تبحث عنه",
    noResultsDesc: "لم نتمكن من العثور على أي سورة أو آية تطابق \"{query}\". حاول استخدام كلمات مختلفة أو البحث برقم السورة.",
    clearSearch: "مسح البحث",
    quranMenu: "قائمة المصحف",
    extraOptions: "خيارات وميزات إضافية",
    toolsAndTracking: "الأدوات والتتبع",
    reciterMushaf: "المصحف المرتل",
    continuousRecitation: "قراءة متصلة لمختلف القراء",
    audioDownloads: "تحميلات الصوت",
    manageAudioFiles: "إدارة الملفات الصوتية",
    khatmaTracker: "متابع الختمة",
    trackReadingProgress: "تتبع تقدمك في القراءة",
    mushafSettings: "إعدادات المصحف",
    mushafEditionLabel: "رواية المصحف",
    editionHafs: "مصحف حفص",
    editionWarsh: "مصحف ورش",
    editionTajweed: "مصحف التجويد",
    fontSizeLabel: "حجم الخط",
    fontTypeLabel: "نوع الخط",
    themeLabel: "نمط العرض",
    themeLight: "أبيض",
    themeDark: "ليلي",
    themeSepia: "ورق مريح للعين (Sepia)",
    themeParchment: "قديم",
    themeSand: "صحراء",
    themeSlate: "ليلي ناعم",
    quickJumpTitle: "انتقال سريع إلى الآية",
    settingsLabel: "الإعدادات",
    menuLabel: "القائمة",
    audioPlayer: "مشغل الصوت",
    lastReadTitle: "متابعة القراءة السريعة",
    lastReadDesc: "آخر ما قرأت: سورة {surah} - الآية {ayah} (الصفحة {page})",
    lastReadBtn: "استئناف القراءة"
  }
};

const FRENCH_SURAH_TRANSLATIONS: Record<number, string> = {
  1: "Al-Fatiha",
  2: "Al-Baqara",
  3: "Al-Imran",
  4: "An-Nisa",
  5: "Al-Ma'ida",
  6: "Al-An'am",
  7: "Al-A'raf",
  8: "Al-Anfal",
  9: "At-Tawba",
  10: "Yunus",
  11: "Hud",
  12: "Yusuf",
  13: "Ar-Ra'd",
  14: "Ibrahim",
  15: "Al-Hijr",
  16: "An-Nahl",
  17: "Al-Isra",
  18: "Al-Kahf",
  19: "Maryam",
  20: "Ta-Ha",
  21: "Al-Anbiya",
  22: "Al-Hajj",
  23: "Al-Mu'minun",
  24: "An-Nur",
  25: "Al-Furqan",
  26: "Ash-Shu'ara",
  27: "An-Naml",
  28: "Al-Qasas",
  29: "Al-Ankabut",
  30: "Ar-Rum",
  31: "Luqman",
  32: "As-Sajda",
  33: "Al-Ahzab",
  34: "Saba",
  35: "Fatir",
  36: "Ya-Sin",
  37: "As-Saffat",
  38: "Sad",
  39: "Az-Zumar",
  40: "Ghafir",
  41: "Fussilat",
  42: "Ash-Shura",
  43: "Az-Zukhruf",
  44: "Ad-Dukhan",
  45: "Al-Jathiya",
  46: "Al-Ahqaf",
  47: "Muhammad",
  48: "Al-Fath",
  49: "Al-Hujurat",
  50: "Qaf",
  51: "Adh-Dhariyat",
  52: "At-Tur",
  53: "An-Najm",
  54: "Al-Qamar",
  55: "Ar-Rahman",
  56: "Al-Waqi'a",
  57: "Al-Hadid",
  58: "Al-Mujadila",
  59: "Al-Hashr",
  60: "Al-Mumtahana",
  61: "As-Saff",
  62: "Al-Jumu'a",
  63: "Al-Munafiqun",
  64: "At-Taghabun",
  65: "At-Talaq",
  66: "At-Tahrim",
  67: "Al-Mulk",
  68: "Al-Qalam",
  69: "Al-Haqqa",
  70: "Al-Ma'arij",
  71: "Nuh",
  72: "Al-Jinn",
  73: "Al-Muzzammil",
  74: "Al-Muddaththir",
  75: "Al-Qiyama",
  76: "Al-Insan",
  77: "Al-Mursalat",
  78: "An-Naba",
  79: "An-Nazi'at",
  80: "Abasa",
  81: "At-Takwir",
  82: "Al-Infitar",
  83: "Al-Mutaffifin",
  84: "Al-Inshiqaq",
  85: "Al-Buruj",
  86: "At-Tariq",
  87: "Al-A'la",
  88: "Al-Ghashiya",
  89: "Al-Fajr",
  90: "Al-Balad",
  91: "Ash-Shams",
  92: "Al-Layl",
  93: "Ad-Duha",
  94: "Al-Inshirah",
  95: "At-Tin",
  96: "Al-Alaq",
  97: "Al-Qadr",
  98: "Al-Bayyina",
  99: "Az-Zalzala",
  100: "Al-Adiyat",
  101: "Al-Qari'a",
  102: "At-Takathur",
  103: "Al-Asr",
  104: "Al-Humaza",
  105: "Al-Fil",
  106: "Quraysh",
  107: "Al-Ma'un",
  108: "Al-Kawthar",
  109: "Al-Kafirun",
  110: "An-Nasr",
  111: "Al-Masad",
  112: "Al-Ikhlas",
  113: "Al-Falaq",
  114: "An-Nas"
};

interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

export const Quran: React.FC = () => {
  const [surahs, setSurahs] = useState<Surah[]>(STATIC_SURAHS);
  const [loading, setLoading] = useState(false);
  const [downloadedSurahs, setDownloadedSurahs] = useState<Record<number, boolean>>({});
  const [showRetry, setShowRetry] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { fontSize, setFontSize, theme, setTheme, fontFamily, setFontFamily, recitation, setRecitation, mushafEdition, setMushafEdition, bookmark, tafsirType, reciter } = useQuranSettings();
  const { settings, progress, removeBookmark, toggleFavoriteUnified } = useAppContext();
  const [currentTab, setCurrentTab] = useState<'surahs' | 'favorites'>('surahs');
  const { t, isRtl } = useTranslation(settings.appLanguage);
  const localT = (key: keyof typeof LOCAL_TRANSLATIONS.ar, params?: Record<string, string | number>): string => {
    const lang = settings.appLanguage === 'fr' ? 'fr' : settings.appLanguage === 'en' ? 'en' : 'ar';
    let text = LOCAL_TRANSLATIONS[lang][key] || LOCAL_TRANSLATIONS['ar'][key] || String(key);
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, String(v));
      });
    }
    return text;
  };
  const [search, setSearch] = useState('');
  const [ayahResults, setAyahResults] = useState<any[]>([]);
  const [quickJumpResult, setQuickJumpResult] = useState<any | null>(null);
  const [searchingAyahs, setSearchingAyahs] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSideMenu, setShowSideMenu] = useState(false);
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  const { navigate, goBack } = useSmartNavigation();

  interface LastReadData {
    surahNumber: number;
    surahName: string;
    englishName: string;
    pageNumber: number;
    ayahNumber: number;
    timestamp: number;
  }
  const [lastRead, setLastRead] = useState<LastReadData | null>(null);

  const [allProgress, setAllProgress] = useState<QuranSurahProgress[]>([]);
  const [overallStats, setOverallStats] = useState({ totalAyahsRead: 0, completedSurahs: 0 });

  const [downloadingSurahId, setDownloadingSurahId] = useState<number | null>(null);

  const loadOfflineStatus = async () => {
    try {
      const dbMap = await quranIndexedDbService.getDownloadedSurahsMap(
        recitation || 'hafs',
        tafsirType || 'ar.muyassar'
      );
      const list = await quranOfflineService.getDownloadedSurahsList(
        tafsirType || 'ar.muyassar', 
        reciter || 1, 
        recitation || 'hafs'
      );
      const states: Record<number, boolean> = { ...dbMap };
      list.forEach(item => {
        if (item.hasText || item.hasAudio) {
          states[item.surahNumber] = true;
        }
      });
      setDownloadedSurahs(states);
    } catch (e) {
      console.warn("Error loading offline surah status", e);
    }
  };

  const handleToggleSurahDownload = async (e: React.MouseEvent, surah: Surah) => {
    e.stopPropagation();
    if (downloadingSurahId === surah.number) return;
    setDownloadingSurahId(surah.number);
    try {
      if (downloadedSurahs[surah.number]) {
        await quranOfflineService.deleteSurahText(
          surah.number, 
          tafsirType || 'ar.muyassar', 
          recitation || 'hafs'
        );
      } else {
        await quranOfflineService.downloadSurahText(
          surah.number,
          surah.name,
          tafsirType || 'ar.muyassar',
          'en.sahih',
          recitation || 'hafs'
        );
      }
      await loadOfflineStatus();
    } catch (err) {
      console.error('Failed to toggle surah download', err);
    } finally {
      setDownloadingSurahId(null);
    }
  };

  useEffect(() => {
    loadOfflineStatus();
  }, [tafsirType, reciter, recitation]);

  useEffect(() => {
    if (auth.currentUser) {
      const unsubscribe = progressService.onAllQuranProgress(auth.currentUser.uid, (data) => {
        setAllProgress(data);
        const stats = data.reduce((acc, curr) => {
          acc.totalAyahsRead += curr.readAyahs.length;
          if (acc.completedSurahs !== undefined && curr.isCompleted) {
             acc.completedSurahs += 1;
          }
          return acc;
        }, { totalAyahsRead: 0, completedSurahs: 0 });
        setOverallStats(stats);
      });
      return unsubscribe;
    }
  }, [auth.currentUser]);

  useEffect(() => {
    try {
      const saved = safeLocalStorageGetItem('believer_quran_last_read');
      if (saved) {
        setLastRead(JSON.parse(saved));
      }
    } catch (e) {
      console.warn("Failed to load last read position", e);
    }
  }, []);
  
  const totalQuranAyahs = 6236;
  const progressPercentage = (overallStats.totalAyahsRead / totalQuranAyahs) * 100;

  useEffect(() => {
    // 1. Reset results if search is small
    if (search.trim().length < 2) {
      setQuickJumpResult(null);
      setAyahResults([]);
      return;
    }

    // 2. Smart Quick Jump Logic
    const checkSmartJump = () => {
      // Pattern: Surah:Ayah (e.g. 2:255)
      const colonMatch = search.match(/^(\d+):(\d+)$/);
      if (colonMatch) {
        const surahNum = parseInt(colonMatch[1]);
        const ayahNum = parseInt(colonMatch[2]);
        const surah = surahs.find(s => s.number === surahNum);
        if (surah && ayahNum >= 1 && ayahNum <= surah.numberOfAyahs) {
          return { surah, ayahNumber: ayahNum };
        }
      }

      // Pattern: Surah Name + Number (e.g. "الفاتحة 5" or "Al-Fatihah 5")
      const words = search.trim().split(/\s+/);
      if (words.length >= 2) {
        const lastWord = words[words.length - 1];
        const ayahNum = parseInt(lastWord);
        
        if (!isNaN(ayahNum)) {
          const surahNamePart = words.slice(0, -1).join(' ');
          const surah = surahs.find(s => 
            s.name.includes(surahNamePart) || 
            s.englishName.toLowerCase().includes(surahNamePart.toLowerCase())
          );
          
          if (surah && ayahNum >= 1 && ayahNum <= surah.numberOfAyahs) {
            return { surah, ayahNumber: ayahNum };
          }
        }
      }
      return null;
    };

    setQuickJumpResult(checkSmartJump());

    // 3. Ayah Content Search (Debounced)
    const timer = setTimeout(async () => {
      // Don't search ayahs if it's just a surah number or very short
      const isSurahNumber = !isNaN(parseInt(search)) && parseInt(search) > 0 && parseInt(search) <= 114;
      if (isSurahNumber || search.trim().length < 2) return;

      setSearchingAyahs(true);
      try {
        // Use quran-simple-clean for MUCH better matching and speed
        const res = await fetch(`https://api.alquran.cloud/v1/search/${search}/all/quran-simple-clean`, {
          mode: 'cors',
          credentials: 'omit',
          referrerPolicy: 'no-referrer'
        });
        const json = await res.json();
        if (json.code === 200 && json.data && json.data.matches) {
          // Fetch uthmani text for the matches to display them beautifully
          const matches = json.data.matches.slice(0, 15);
          setAyahResults(matches);
        } else {
          setAyahResults([]);
        }
      } catch (err) {
        console.error('Ayah search failed:', err);
        setAyahResults([]);
      } finally {
        setSearchingAyahs(false);
      }
    }, 350); // Faster Debounce

    return () => clearTimeout(timer);
  }, [search, surahs]);

  const highlightQuranText = React.useCallback((text: string, term?: string) => {
    if (!text) return '';
    let processed = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    
    // Highlight search term if provided
    if (term && term.trim().length >= 2) {
      const termHtmlEscaped = term.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
      const escapedTerm = termHtmlEscaped.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchPattern = new RegExp(`(${escapedTerm})`, 'gi');
      processed = processed.replace(searchPattern, '<span class="bg-yellow-200 dark:bg-yellow-900/50 text-yellow-900 dark:text-yellow-100 px-1 rounded">$1</span>');
    }

    const d = '[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]*';
    const allahumma = `(?:[\u0648\u0641]${d})?\u0627${d}\u0644${d}\u0644${d}\u0647${d}\u0645${d}`;
    const allah = `(?:[\u0648\u0641\u0628\u062A]${d})?\u0627${d}\u0644${d}\u0644${d}\u0647${d}`;
    const lillah = `(?:[\u0648\u0641\u0628]${d})?\u0644${d}\u0644${d}\u0647${d}`;
    const rabbana = `(?:[\u0648\u0641]${d})?\u0631${d}\u0628${d}\u0646${d}\u0627${d}`;
    const pattern = new RegExp(`(${allahumma}|${allah}|${lillah}|${rabbana})`, 'g');
    return processed.replace(pattern, '<span class="text-rose-600 dark:text-rose-400 font-bold">$1</span>');
  }, []);

  useEffect(() => {
    // Loaded instantly and locally from STATIC_SURAHS! No network request or waiting is needed.
  }, []);

  const filteredSurahs = surahs.filter(s => {
    const nameMatch = s.name.includes(search);
    const engMatch = s.englishName.toLowerCase().includes(search.toLowerCase());
    const frName = FRENCH_SURAH_TRANSLATIONS[s.number] || '';
    const frMatch = frName.toLowerCase().includes(search.toLowerCase());
    return nameMatch || engMatch || frMatch;
  });

  // 114 surah cards at ~16 elements each is roughly 1,800 nodes in one commit —
  // about a second of frozen screen on entry. See useProgressiveList.
  const visibleSurahCount = useProgressiveList(filteredSurahs.length);

  const themeClasses = {
    light: 'bg-white text-slate-900',
    dark: 'bg-slate-900 text-slate-100',
    sepia: 'bg-[#f4ecd8] text-[#5b4636]',
    parchment: 'bg-[#e8dcc4] text-[#4a3b2c]',
    sand: 'bg-[#f3ead3] text-[#5c4d3c]',
    slate: 'bg-[#1e293b] text-[#cbd5e1]'
  };

  const isFriday = new Date().getDay() === 5;

  return (
    <div dir={isRtl ? "rtl" : "ltr"} className={cn("w-full min-h-screen transition-colors duration-300", themeClasses[theme], (theme === 'dark' || theme === 'slate') ? 'force-dark' : 'force-light')}>
      <div className="w-full mx-auto pb-4">
        <header className={cn("sticky top-0 backdrop-blur-md py-2 flex flex-col gap-3 border-b border-black/5 mb-3 z-10", 
          theme === 'light' ? 'bg-white/90' : 
          theme === 'dark' ? 'bg-slate-900/90' : 
          theme === 'sepia' ? 'bg-[#f4ecd8]/90' :
          theme === 'parchment' ? 'bg-[#e8dcc4]/90' :
          theme === 'slate' ? 'bg-[#1e293b]/90' :
          'bg-[#1e293b]/90'
        )}>
          <div className="flex items-center justify-between px-3 min-[360px]:px-4 gap-2 min-[360px]:gap-4 py-1">
            <div className="flex items-center gap-2 min-[360px]:gap-3 shrink-0">
              <BackButton forceFallback={true} />
              <div className="shrink-0">
                <h1 className="text-lg min-[360px]:text-xl md:text-2xl font-black tracking-tight flex items-center gap-2 bg-clip-text text-transparent bg-gradient-to-r from-orange-600 via-red-500 to-amber-500 animate-gradient whitespace-nowrap">
                  {t('surah_index')}
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
                </h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">{t('holy_quran')}</p>
              </div>
            </div>

            <div className="fit-narrow flex items-center gap-2 shrink-0">
              <button 
                onClick={() => navigate('/quran-audio')}
                className={cn(
                  "p-2.5 rounded-2xl transition-all duration-300 shrink-0 backdrop-blur-md border shadow-sm",
                  "bg-white/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 hover:bg-teal-500 hover:text-white border-slate-200/50 dark:border-slate-700/50"
                )}
                title={localT('audioPlayer')}
              >
                <Headphones size={20} />
              </button>
              <button 
                onClick={() => setShowSettings(true)}
                className={cn(
                  "p-2.5 rounded-2xl transition-all duration-300 shrink-0 backdrop-blur-md border shadow-sm",
                  "bg-white/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 hover:bg-teal-500 hover:text-white border-slate-200/50 dark:border-slate-700/50"
                )}
                title={localT('settingsLabel')}
              >
                <Settings size={20} />
              </button>
              <button 
                onClick={() => setShowSideMenu(true)} 
                className={cn(
                  "group p-2.5 md:p-3 rounded-2xl transition-all duration-75 active:scale-[0.85] active:opacity-70 duration-300 shrink-0 backdrop-blur-md border shadow-sm",
                  "bg-white/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 hover:bg-teal-500 hover:text-white border-slate-200/50 dark:border-slate-700/50"
                )}
                title={localT('menuLabel')}
              >
                <Menu size={20} className="group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>
          <div className="relative group max-w-2xl mx-auto w-full flex items-center gap-2 px-4 pb-1">
            <div className="relative flex-grow">
              <div className={cn("absolute inset-y-0 flex items-center pointer-events-none", isRtl ? "right-0 pr-4" : "left-0 pl-4")}>
                <Search className="text-slate-400 group-focus-within:text-teal-500 transition-colors" size={20} />
              </div>
              <input 
                type="text" 
                placeholder={t('search_quran')} 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={cn(
                  "w-full p-4 rounded-2xl outline-none border transition-all font-bold text-base shadow-sm",
                  isRtl ? "pr-12 pl-24" : "pl-12 pr-24",
                  "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 focus:border-teal-500/50 focus:shadow-xl focus:shadow-teal-500/5"
                )}
              />
              <div className={cn("absolute inset-y-0 flex items-center gap-1", isRtl ? "left-2" : "right-2")}>
                {search && (
                  <button 
                    onClick={() => setSearch('')}
                    className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-full text-slate-400 transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
                <div className={cn("px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-[10px] font-black text-slate-400 uppercase tracking-tighter", isRtl ? "mr-2" : "ml-2")}>
                  {surahs.length} {t('surah')}
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsAdvancedSearchOpen(true)}
              className={cn(
                "p-4 rounded-2xl border transition-all font-bold text-sm shadow-sm shrink-0 flex items-center gap-2 hover:bg-teal-500 hover:text-white hover:border-teal-500 active:scale-95 duration-150",
                "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-teal-600 dark:text-teal-400"
              )}
              title={localT('advancedSearch')}
            >
              <SearchCode size={20} className="shrink-0" />
              <span className="hidden sm:inline font-black text-xs">{localT('advancedSearch')}</span>
            </button>
          </div>

          {!search && (
            <div className="max-w-2xl mx-auto w-full px-4 mt-2 mb-1 flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Sparkles size={12} className="text-amber-500 animate-pulse shrink-0" />
                <span>{settings.appLanguage === 'ar' ? 'تبحث عن تفاسير، معاني، أو آيات مخصصة؟' : settings.appLanguage === 'fr' ? 'Cherchez-vous des tafsirs, des significations ou des versets spécifiques ?' : 'Looking for tafsir, meanings, or specific verses?'}</span>
              </span>
              <button 
                onClick={() => setIsAdvancedSearchOpen(true)}
                className="text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 shrink-0"
              >
                {settings.appLanguage === 'ar' ? 'البحث المتقدم 🔍' : settings.appLanguage === 'fr' ? 'Recherche avancée 🔍' : 'Advanced Search 🔍'}
              </button>
            </div>
          )}
        </header>

        {/* Vertical Side Menu (Drawer) */}
        {typeof document !== 'undefined' && createPortal(
          <AnimatePresence>
            {showSideMenu && (
              <div className="fixed inset-0 z-[1000] overflow-hidden" dir={isRtl ? "rtl" : "ltr"}>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowSideMenu(false)}
                  className="fixed inset-0 bg-black/40 backdrop-blur-sm shadow-2xl"
                />
                
                <motion.div
                  initial={{ x: isRtl ? '100%' : '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: isRtl ? '100%' : '-100%' }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className={cn(
                    "fixed top-0 h-full w-[280px] sm:w-[320px] shadow-2xl flex flex-col z-50",
                    isRtl ? "right-0 border-l" : "left-0 border-r",
                    theme === 'light' ? 'bg-white border-slate-100' : 
                    theme === 'dark' ? 'bg-slate-900 border-slate-800' : 
                    theme === 'sepia' ? 'bg-[#f4ecd8] border-[#e2d5b5]' :
                    theme === 'parchment' ? 'bg-[#e8dcc4] border-[#d4c1a5]' :
                    theme === 'slate' ? 'bg-[#1e293b] border-slate-800' :
                    'bg-[#1e293b] border-slate-800'
                  )}
                  onClick={(e) => e.stopPropagation()}
                >
                {/* Drawer Header */}
                <div className="p-6 border-b border-black/5 shrink-0">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="font-black text-lg">{localT('quranMenu')}</h2>
                    <button 
                      onClick={() => setShowSideMenu(false)}
                      className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{localT('extraOptions')}</p>
                </div>

                {/* Drawer Content */}
                <div className="flex-grow overflow-y-auto p-4 custom-scrollbar space-y-6 pb-20">
                   <div className="px-2">
                     <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-4">{localT('toolsAndTracking')}</p>
                     
                     <div className="space-y-1.5">
                       <button 
                          onClick={() => { navigate('/quran-audio'); setShowSideMenu(false); }}
                          className="w-full flex items-center gap-3 p-3.5 rounded-2xl hover:bg-teal-500/10 hover:text-teal-600 transition-all group text-right"
                       >
                          <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-600 shrink-0 group-hover:scale-110 transition-transform">
                            <Headphones size={20} />
                          </div>
                          <div className="flex-grow">
                            <p className="font-black text-sm">{localT('reciterMushaf')}</p>
                            <p className="text-[10px] font-bold text-slate-400">{localT('continuousRecitation')}</p>
                          </div>
                       </button>

                       <button 
                          onClick={() => { navigate('/quran-audio/downloads'); setShowSideMenu(false); }}
                          className="w-full flex items-center gap-3 p-3.5 rounded-2xl hover:bg-orange-500/10 hover:text-orange-600 transition-all group text-right"
                       >
                          <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600 shrink-0 group-hover:scale-110 transition-transform">
                            <RefreshCw size={20} />
                          </div>
                          <div className="flex-grow">
                            <p className="font-black text-sm">{localT('audioDownloads')}</p>
                            <p className="text-[10px] font-bold text-slate-400">{localT('manageAudioFiles')}</p>
                          </div>
                       </button>

                       <button 
                          onClick={() => { navigate('/quran-tracker'); setShowSideMenu(false); }}
                          className="w-full flex items-center gap-3 p-3.5 rounded-2xl hover:bg-emerald-500/10 hover:text-emerald-600 transition-all group text-right"
                       >
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0 group-hover:scale-110 transition-transform">
                            <TrendingUp size={20} />
                          </div>
                          <div className="flex-grow">
                            <p className="font-black text-sm">{localT('khatmaTracker')}</p>
                            <p className="text-[10px] font-bold text-slate-400">{localT('trackReadingProgress')}</p>
                          </div>
                       </button>
                     </div>
                   </div>

                   <div className="px-2">
                       <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-4">{localT('mushafSettings')}</p>
                       <div className="space-y-6">
                         {/* Recitation */}
                         <div className="space-y-2">
                            <p className="text-[10px] font-bold text-slate-500">{localT('mushafEditionLabel')}</p>
                            <div className="flex flex-col gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-2xl">
                              {[
                                { id: 'hafs', name: localT('editionHafs'), recitation: 'uthmani' },
                                { id: 'warsh', name: localT('editionWarsh'), recitation: 'warsh' },
                                { id: 'tajweed', name: localT('editionTajweed'), recitation: 'uthmani' }
                              ].map(ed => (
                                <button
                                  key={ed.id}
                                  onClick={() => { setMushafEdition(ed.id as any); setRecitation(ed.recitation as any); }}
                                  className={cn(
                                    "py-2.5 px-4 rounded-xl text-xs font-black transition-all text-right",
                                    mushafEdition === ed.id ? "bg-teal-500 text-white shadow-md scale-[1.02]" : "text-slate-500 hover:bg-black/5"
                                  )}
                                >
                                  {ed.name}
                                </button>
                              ))}
                            </div>
                         </div>

                         {/* Font Size */}
                         <div className="space-y-3 bg-black/5 dark:bg-white/5 p-4 rounded-2xl border border-black/5">
                            <div className="flex justify-between items-center px-1">
                              <p className="text-[10px] font-bold text-slate-500">{localT('fontSizeLabel')}</p>
                              <span className="text-[10px] font-black text-teal-600 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-teal-500/10">{fontSize}px</span>
                            </div>
                            <input 
                              type="range" min="14" max="48" value={fontSize} 
                              onChange={(e) => setFontSize(parseInt(e.target.value))}
                              className="w-full accent-teal-500 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer" 
                            />
                         </div>

                         {/* Fonts */}
                         <div className="space-y-2">
                            <p className="text-[10px] font-bold text-slate-500">{localT('fontTypeLabel')}</p>
                            <div className="grid grid-cols-2 gap-2">
                              {QURAN_FONTS.slice(0, 4).map(f => (
                                <button
                                  key={f.id}
                                  onClick={() => setFontFamily(f.id)}
                                  className={cn(
                                    "p-3 rounded-2xl border-2 transition-all text-[11px] font-bold text-center",
                                    fontFamily === f.id ? "border-teal-500 bg-white dark:bg-slate-700 text-teal-600" : "border-transparent bg-black/5 dark:bg-white/5 text-slate-400"
                                  )}
                                  style={{ fontFamily: f.id }}
                                >
                                  {f.name}
                                </button>
                              ))}
                            </div>
                         </div>

                         {/* Themes */}
                         <div className="space-y-2">
                            <p className="text-[10px] font-bold text-slate-500">{localT('themeLabel')}</p>
                            <div className="grid grid-cols-3 gap-2">
                              {[
                                { id: 'light', name: localT('themeLight') },
                                { id: 'dark', name: localT('themeDark') },
                                { id: 'sepia', name: localT('themeSepia') },
                                { id: 'parchment', name: localT('themeParchment') },
                                { id: 'sand', name: localT('themeSand') },
                                { id: 'slate', name: localT('themeSlate') }
                              ].map(th => (
                                <button
                                  key={th.id}
                                  onClick={() => setTheme(th.id as any)}
                                  className={cn(
                                    "py-2 px-1 rounded-xl border-2 transition-all text-[10px] font-black text-center",
                                    theme === th.id ? "border-teal-500 bg-white dark:bg-slate-700 text-teal-600" : "border-transparent bg-black/5 dark:bg-white/5 text-slate-400"
                                  )}
                                >
                                  {th.name}
                                </button>
                              ))}
                            </div>
                         </div>
                       </div>
                    </div>

                    <div className="px-2">
                       <p className={cn("text-[10px] font-black text-teal-600 uppercase tracking-widest mb-4", isRtl ? "text-right" : "text-left")}>{localT('advancedSearch')}</p>
                       
                       <button 
                          onClick={() => { setIsAdvancedSearchOpen(true); setShowSideMenu(false); }}
                          className={cn("w-full flex items-center gap-3 p-3.5 rounded-2xl hover:bg-indigo-500/10 hover:text-indigo-600 transition-all group", isRtl ? "text-right" : "text-left")}
                       >
                          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 shrink-0 group-hover:scale-110 transition-transform">
                            <SearchCode size={20} />
                          </div>
                          <div className="flex-grow">
                            <p className="font-black text-sm">{localT('thematicSearch')}</p>
                            <p className="text-[10px] font-bold text-slate-400">{localT('searchByMeaning')}</p>
                          </div>
                       </button>
                    </div>

                    <div className="px-2">
                      <p className={cn("text-[10px] font-black text-teal-600 uppercase tracking-widest mb-4", isRtl ? "text-right" : "text-left")}>{localT('appData')}</p>
                      <button 
                         onClick={() => {
                           safeLocalStorageRemoveItem('quran-surahs-cache-v3');
                           window.location.reload();
                         }}
                         className={cn("w-full flex items-center gap-3 p-3.5 rounded-2xl hover:bg-yellow-500/10 hover:text-yellow-600 transition-all group", isRtl ? "text-right" : "text-left")}
                      >
                         <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-600 shrink-0 group-hover:rotate-180 transition-transform duration-500">
                           <RefreshCw size={20} />
                         </div>
                         <div className="flex-grow">
                           <p className="font-black text-sm">{localT('updateIndex')}</p>
                           <p className="text-[10px] font-bold text-slate-400">{localT('reloadSurahList')}</p>
                         </div>
                      </button>
                    </div>
                 </div>

                {/* Drawer Footer */}
                <div className="p-6 border-t border-black/5 shrink-0 bg-black/5 dark:bg-white/5" dir={isRtl ? "rtl" : "ltr"}>
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-600">
                         <LayoutDashboard size={14} />
                      </div>
                      <div className={isRtl ? "text-right" : "text-left"}>
                        <p className="text-[10px] font-black uppercase text-slate-400">{localT('version')}</p>
                        <p className="text-[8px] font-bold text-slate-500">{localT('praiseToAllah')}</p>
                      </div>
                   </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}



        <AnimatePresence>
        {quickJumpResult && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="px-4 mb-4"
          >
            <div 
              onClick={() => navigate(`/quran/${quickJumpResult.surah.number}?ayah=${quickJumpResult.ayahNumber}`)}
              className="p-4 rounded-2xl bg-teal-600 text-white shadow-lg shadow-teal-600/20 cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Sparkles size={24} />
                </div>
                <div>
                  <h3 className="font-black text-lg">{localT('quickJumpTitle')}</h3>
                  <p className="text-sm opacity-90 font-bold">
                    {localT('surahAndAyah', {
                      surah: settings.appLanguage === 'ar' 
                        ? quickJumpResult.surah.name 
                        : settings.appLanguage === 'fr' 
                          ? (FRENCH_SURAH_TRANSLATIONS[quickJumpResult.surah.number] || quickJumpResult.surah.englishName)
                          : quickJumpResult.surah.englishName,
                      ayah: quickJumpResult.ayahNumber
                    })}
                  </p>
                </div>
              </div>
              <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
            </div>
          </motion.div>
        )}
        </AnimatePresence>

        <QuranAdvancedSearch 
          isOpen={isAdvancedSearchOpen} 
          onClose={() => setIsAdvancedSearchOpen(false)} 
        />

        {isFriday && !search && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-4 mb-4"
          >
            <div 
              onClick={() => navigate('/quran/18')}
              className="p-4 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-lg shadow-teal-600/20 cursor-pointer flex items-center justify-between group overflow-hidden relative"
            >
              <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mt-16 blur-2xl" />
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <BookOpenText size={24} />
                </div>
                <div className={isRtl ? "text-right" : "text-left"}>
                  <h3 className="font-black text-lg">{localT('fridaySunnah')}</h3>
                  <p className="text-sm opacity-90 font-bold">{localT('fridayReminder')}</p>
                </div>
              </div>
              <div className="relative z-10 flex flex-col items-center gap-1">
                 <div className="px-3 py-1 bg-white/20 rounded-lg text-[10px] font-black">{localT('readNow')}</div>
                 {isRtl ? (
                   <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                 ) : (
                   <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
                 )}
              </div>
            </div>
          </motion.div>
        )}

        {ayahResults.length > 0 && (
          <div className="px-4 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-600">
                  <Search size={16} />
                </div>
                <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">
                  {localT('searchResultsFor', { query: search })}
                </h3>
              </div>
              <span className="text-[10px] font-black text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                {localT('matchingVerses', { count: ayahResults.length })}
              </span>
            </div>
            <div className="flex flex-col gap-3">
              <AnimatePresence mode="popLayout">
                {ayahResults.map((ayah, idx) => (
                  <motion.div
                    key={`${ayah.number}-${idx}`}
                    layout
                    
                    
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => navigate(`/quran/${ayah.surah.number}?ayah=${ayah.numberInSurah}`)}
                    className={cn(
"p-5 rounded-3xl cursor-pointer transition-all border group relative overflow-hidden transform transition-all duration-75 active:scale-[0.98] active:opacity-90",
                      settings.visualTheme === 'glass' ? "bg-white/40 backdrop-blur-xl border-white/20 shadow-lg" :
                      "bg-white dark:bg-slate-800/80 border-slate-100 dark:border-slate-700 hover:border-teal-500/30 hover:shadow-xl hover:shadow-teal-500/5"
                    )}
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-teal-500/10 transition-colors" />
                    
                    <div className="relative flex flex-col items-end gap-3 text-right">
                      <p 
                        className="text-right text-xl leading-relaxed text-slate-900 dark:text-slate-100" 
                        style={{ fontFamily: fontFamily }}
                        dangerouslySetInnerHTML={{ __html: highlightQuranText(ayah.text, search) }}
                      />
                      
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-xl border border-teal-100/50 dark:border-teal-800/50 transform transition-all duration-75 active:scale-[0.95] active:opacity-80">
                          <BookOpenText size={12} />
                          <span className="text-xs font-black">
                            {settings.appLanguage === 'ar' 
                              ? `سورة ${ayah.surah.name}` 
                              : settings.appLanguage === 'fr' 
                                ? `${t('surah')} ${FRENCH_SURAH_TRANSLATIONS[ayah.surah.number] || ayah.surah.englishName}` 
                                : `${t('surah')} ${ayah.surah.englishName}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 rounded-xl border border-slate-100 dark:border-slate-800 transform transition-all duration-75 active:scale-[0.95] active:opacity-80">
                          <span className="text-[10px] font-black">{t('ayah')} {ayah.numberInSurah}</span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 group-hover:bg-teal-500 group-hover:text-white transform transition-all duration-75 active:scale-[0.85] active:opacity-70 shadow-sm">
                          {isRtl ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <div className="flex items-center gap-4 my-8">
              <div className="flex-grow h-px bg-slate-100 dark:bg-slate-800" />
              <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">{t('surah_index')}</div>
              <div className="flex-grow h-px bg-slate-100 dark:bg-slate-800" />
            </div>
          </div>
        )}

        {searchingAyahs && (
          <div className="flex items-center justify-center py-4 gap-2 text-teal-600">
            <RefreshCw size={16} className="animate-spin" />
            <span className="text-xs font-bold">{localT('searchingVerses')}</span>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-600 dark:text-slate-400 font-bold">{localT('loadingSurahs')}</p>
            
            {showRetry && (
              <motion.div 
                className="flex flex-col items-center gap-3 mt-4"
              >
                <p className="text-xs text-red-500 font-bold">{localT('loadingSlow')}</p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => window.location.reload()} 
                    className="px-6 py-2 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-all flex items-center gap-2"
                  >
                    <RefreshCw size={18} />
                    {t('retry')}
                  </button>                                    
                  <button 
                    onClick={() => {
                      safeLocalStorageRemoveItem('quran-surahs-cache-v3');
                      window.location.reload();
                    }} 
                    className="px-6 py-2 bg-red-100 text-red-600 rounded-xl font-bold hover:bg-red-200 transition-all"
                  >
                    {localT('clearCache')}
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-2">
              <X size={32} />
            </div>
            <p className="text-slate-800 dark:text-slate-200 font-bold text-lg">{error}</p>
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              <button 
                onClick={() => window.location.reload()} 
                className="px-6 py-2 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors"
              >
                {t('retry')}
              </button>
              <button 
                onClick={() => {
                  safeLocalStorageRemoveItem('quran-surahs-cache-v3');
                  window.location.reload();
                }} 
                className="px-6 py-2 bg-red-100 text-red-600 rounded-xl font-bold hover:bg-red-200 transition-colors"
              >
                {localT('clearCache')}
              </button>
            </div>
          </div>
        ) : filteredSurahs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-4 px-6">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 mb-2">
              <RefreshCw size={40} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 dark:text-slate-100">{localT('noSurahs')}</h3>
              <p className="text-slate-500 dark:text-slate-400 font-bold mt-2 max-w-xs">
                {localT('pleaseRefresh')}
              </p>
            </div>
            <button 
              onClick={() => {
                safeLocalStorageRemoveItem('quran-surahs-cache-v3');
                window.location.reload();
              }}
              className="px-8 py-3 bg-teal-600 text-white rounded-2xl font-black shadow-lg shadow-teal-600/20 hover:bg-teal-700 transition-all duration-75 active:scale-[0.85] active:opacity-70"
            >
              {localT('updateData')}
            </button>
          </div>
        ) : (
          <>
            {/* Tabs for switching between Surahs and Bookmarked Verses */}
            {!search && (
              <div className="flex justify-center px-4 mb-6 mt-2">
                <div className="inline-flex p-1 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/[0.03] dark:border-white/[0.03]">
                  <button
                    onClick={() => setCurrentTab('surahs')}
                    className={cn(
                      "px-6 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer",
                      currentTab === 'surahs'
                        ? "bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-md scale-[1.02]"
                        : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    )}
                  >
                    <BookOpenText size={14} />
                    فهرس السور
                  </button>
                  <button
                    onClick={() => setCurrentTab('favorites')}
                    className={cn(
                      "px-6 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 relative cursor-pointer",
                      currentTab === 'favorites'
                        ? "bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-md scale-[1.02]"
                        : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    )}
                  >
                    <Heart size={14} className={cn(currentTab === 'favorites' ? "fill-rose-500 text-rose-500" : "")} />
                    الآيات المفضلة
                    {progress.quranProgress?.bookmarks && progress.quranProgress.bookmarks.length > 0 && (
                      <span className="bg-rose-500 text-white text-[9px] font-black h-4 min-w-[16px] px-1.5 rounded-full flex items-center justify-center animate-pulse">
                        {progress.quranProgress.bookmarks.length}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            )}

            {(currentTab === 'surahs' || !!search) ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 px-4 pb-12">
                {filteredSurahs.slice(0, visibleSurahCount).map((surah) => (
                <motion.div 
                  key={surah.number}
                  onClick={() => navigate(`/quran/${surah.number}`)}
                  className={cn(
                    // No backdrop-blur on this card, or on the number badge below.
                    //
                    // This list renders all 114 surahs at once, and on the default
                    // 'glass' theme those two classes put 228 backdrop-filter
                    // elements on screen in a single commit. Each one is its own
                    // composited layer with a backdrop read-back — measured at
                    // ~1.1s of frozen screen when opening this page, and the source
                    // of "tile memory limits exceeded" in logcat.
                    //
                    // It bought nothing: what sits behind these cards is the flat
                    // page background, and blurring a flat colour returns the same
                    // flat colour. The translucency that gives the glass theme its
                    // look is bg-white/20, which is untouched.
                    "group p-3.5 rounded-2xl transition-all relative overflow-hidden cursor-pointer scroll-mt-32 border",
                    settings.visualTheme === 'glass' ? "bg-white/20 border-white/20 shadow-lg" :
                    "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700/50 shadow-sm hover:shadow-md hover:border-teal-500/20"
                  )}
                >
                  <div 
                    className="absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-300 opacity-70" 
                    style={{ background: settings.primaryColor }}
                  />
                  
                  <div className="flex items-center gap-3">
                    <div 
                      className={cn(
  "w-10 h-10 shrink-0 rounded-xl flex items-center justify-center font-black transform transition-all duration-75 active:scale-[0.85] active:opacity-70 group-hover:rounded-2xl",
                        settings.visualTheme === 'glass' ? "bg-white/30" :
                        "bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700"
                      )}
                      style={{ color: settings.primaryColor.includes('gradient') ? settings.primaryColor.match(/#[a-fA-F0-9]{6}/)?.[0] || '#0d9488' : settings.primaryColor }}
                    >
                      <span className="text-sm">{surah.number}</span>
                    </div>
                    
                    <div className="flex-grow flex justify-between items-center overflow-hidden">
                      <div className="overflow-hidden flex-grow flex flex-col justify-center">
                        <h2 
                          className="font-black text-lg transition-colors leading-tight text-slate-900 dark:text-white" 
                          style={{ 
                            fontFamily: fontFamily,
                            fontSize: `${Math.max(16, fontSize * 0.8)}px`
                          }} 
                        >
                          <span dangerouslySetInnerHTML={{ 
                            __html: highlightQuranText(
                              settings.appLanguage === 'ar' 
                                ? (surah.name || '') 
                                : settings.appLanguage === 'fr' 
                                  ? (FRENCH_SURAH_TRANSLATIONS[surah.number] || surah.englishName)
                                  : (surah.englishName || ''), 
                              search
                            ) 
                          }} />
                        </h2>
                        <p className="text-[10px] font-bold text-slate-400 truncate mt-0.5">
                          {settings.appLanguage === 'ar' 
                            ? surah.englishName 
                            : settings.appLanguage === 'fr' 
                              ? `${surah.name} • ${surah.englishName}`
                              : `${surah.name} • ${surah.englishNameTranslation}`}
                        </p>
                      </div>

                      <div className="text-right flex flex-col items-end gap-0.5 ml-2 shrink-0">
                        {allProgress.find(p => p.surahNumber === surah.number)?.isCompleted && (
                          <div className="flex items-center gap-1 text-green-500 mb-1">
                            <CheckCircle2 size={12} strokeWidth={3} />
                            <span className="text-[8px] font-black">{t('finished')}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1 mb-1">
                          <button
                            onClick={(e) => handleToggleSurahDownload(e, surah)}
                            disabled={downloadingSurahId === surah.number}
                            className={cn(
                              "flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-black transition-all",
                              downloadedSurahs[surah.number]
                                ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20"
                                : "text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/80 hover:bg-teal-500/10 hover:text-teal-600 border border-slate-200/50 dark:border-slate-700/50"
                            )}
                            title={downloadedSurahs[surah.number] ? "مخزن في IndexedDB (انقر للحذف)" : "انقر لتحميل السورة ونصوصها في IndexedDB"}
                          >
                            {downloadingSurahId === surah.number ? (
                              <Loader2 size={10} className="animate-spin text-teal-600" />
                            ) : downloadedSurahs[surah.number] ? (
                              <>
                                <HardDrive size={10} strokeWidth={2.5} />
                                <span>تم التحميل</span>
                              </>
                            ) : (
                              <>
                                <Download size={10} strokeWidth={2.5} />
                                <span>غير محمل</span>
                              </>
                            )}
                          </button>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter px-1.5 py-0.5 bg-slate-50 dark:bg-slate-800 rounded-md border border-slate-100 dark:border-slate-700/50">
                            {surah.revelationType === 'Meccan' ? t('makkiah') : t('madaniah')}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 opacity-60">
                          <span className="text-[9px] font-bold text-slate-400">{t('ayah')}:</span>
                          <span className="text-xs font-black text-slate-500">{surah.numberOfAyahs}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
              </div>
            ) : (
              <div className="max-w-3xl mx-auto px-4 pb-12 space-y-4" dir="rtl">
                {(!progress.quranProgress?.bookmarks || progress.quranProgress.bookmarks.length === 0) ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center gap-4 bg-white dark:bg-slate-800/40 rounded-3xl border border-black/5 dark:border-white/5 p-8 shadow-sm">
                    <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center text-rose-500 animate-pulse">
                      <HeartOff size={28} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">قائمتك المفضلة فارغة</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-2 max-w-sm leading-relaxed text-center">
                        يمكنك حفظ وتوسيم أي آية أثناء قراءتك من خلال النقر عليها لفتح نافذة التفسير وإضافتها للمفضلة مع تدوين ملاحظاتك الخاصة للرجوع إليها لاحقاً.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {progress.quranProgress.bookmarks.slice().reverse().map((b: any) => (
                      <motion.div
                        key={b.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-3xl shadow-sm hover:shadow-md hover:border-teal-500/20 transition-all flex flex-col gap-4 relative overflow-hidden group text-right"
                      >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full -mr-12 -mt-12 blur-xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
                        
                        {/* Header info */}
                        <div className="flex items-center justify-between relative z-10 flex-row-reverse">
                          <div 
                            onClick={() => navigate(`/quran/${b.surahNumber}?ayah=${b.aya}`)}
                            className="flex items-center gap-2 cursor-pointer hover:text-teal-600 dark:hover:text-teal-400 transition-colors flex-row-reverse"
                          >
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 fill-rose-500 shadow-sm shadow-rose-500/40" />
                            <span className="text-sm font-black text-slate-800 dark:text-slate-200">
                              {settings.appLanguage === 'ar' ? b.surah : `Sourate ${b.surahNumber}`}
                            </span>
                            <span className="text-[10px] bg-slate-100 dark:bg-slate-700/80 font-bold text-slate-500 dark:text-slate-400 px-2.5 py-0.5 rounded-md">
                              الآية {b.aya}
                            </span>
                          </div>
                          
                          <button
                            onClick={() => removeBookmark(b.id)}
                            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white transition-all duration-150 cursor-pointer active:scale-95"
                            title="حذف من المفضلة"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        {/* Ayat text */}
                        {b.text && (
                          <div 
                            onClick={() => navigate(`/quran/${b.surahNumber}?ayah=${b.aya}`)}
                            className="relative z-10 text-center py-4 px-6 bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-black/5 dark:border-white/5 cursor-pointer group-hover:bg-slate-50 dark:group-hover:bg-slate-900/50 transition-colors"
                          >
                            <p 
                              className="text-center leading-relaxed text-[#dc2626] dark:text-[#ff4d4d] font-bold text-xl"
                              style={{
                                fontFamily: 'Uthmanic Hafs, serif',
                                lineHeight: '1.8'
                              }}
                            >
                              {b.text}
                            </p>
                          </div>
                        )}

                        {/* Note area */}
                        <div className="p-4 bg-teal-500/5 dark:bg-teal-950/10 border border-teal-500/10 rounded-2xl flex flex-col gap-1 text-right">
                          <span className="text-[10px] font-black text-teal-600 dark:text-teal-400">الملاحظة المدونة:</span>
                          <p className="text-xs text-slate-700 dark:text-slate-300 font-bold leading-relaxed">
                            {b.note ? `"${b.note}"` : "لا توجد ملاحظة مدونة."}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {!loading && !error && filteredSurahs.length === 0 && ayahResults.length === 0 && !searchingAyahs && search && (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-4 px-6">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 mb-2">
              <SearchCode size={40} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 dark:text-slate-100">{localT('noResultsFound')}</h3>
              <p className="text-slate-500 dark:text-slate-400 font-bold mt-2 max-w-xs">
                {localT('noResultsDesc', { query: search })}
              </p>
            </div>
            <button 
              onClick={() => setSearch('')}
              className="px-8 py-3 bg-teal-600 text-white rounded-2xl font-black shadow-lg shadow-teal-600/20 hover:bg-teal-700 transition-all duration-75 active:scale-[0.85] active:opacity-70"
            >
              {localT('clearSearch')}
            </button>
          </div>
        )}

      </div>

      {/* Modern Settings Modal */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showSettings && (
            <div 
              dir={isRtl ? "rtl" : "ltr"}
              className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-4" 
              onClick={() => setShowSettings(false)}
            >
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "100%", opacity: 0 }}
                transition={{ type: "spring", damping: 30, stiffness: 300, bounce: 0 }}
                className={cn(
                  "w-full sm:max-w-xl max-h-[85vh] sm:max-h-[90vh] shadow-2xl overflow-hidden flex flex-col relative z-20",
                  "sm:rounded-3xl rounded-t-3xl sm:mb-8",
                  (theme === 'dark' || theme === 'slate') ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-100',
                  theme === 'dark' ? 'bg-slate-900 text-slate-100' : 
                  theme === 'sepia' ? 'bg-[#f4ecd8] text-[#5b4636]' : 
                  theme === 'parchment' ? 'bg-[#e8dcc4] text-[#4a3b2c]' :
                  theme === 'sand' ? 'bg-[#f3ead3] text-[#5c4d3c]' :
                  theme === 'slate' ? 'bg-[#1e293b] text-[#cbd5e1]' :
                  'bg-white text-slate-900'
                )} 
                onClick={e => e.stopPropagation()}
              >
                <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mt-3 mb-1 sm:hidden shrink-0" />
                
                <div className="flex justify-between items-center border-b border-black/5 p-6 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
                      <SlidersHorizontal size={20} />
                    </div>
                    <h2 className="text-xl font-black">{localT('settingsLabel')}</h2>
                  </div>
                  <button 
                    onClick={() => setShowSettings(false)} 
                    className="w-10 h-10 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full flex items-center justify-center hover:bg-rose-500 hover:text-white transform transition-all duration-75 active:scale-[0.85] active:opacity-70"
                    title={localT('close') || "إغلاق"}
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar flex-grow pb-12 space-y-8 min-h-[0]">
                {/* Recitation */}
                <div className="space-y-3">
                  <label className="text-xs font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest flex items-center gap-2">
                    <BookOpenText size={14}/> {localT('mushafEditionLabel')}
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2 bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded-2xl">
                    <button 
                      onClick={() => { setRecitation('uthmani'); setMushafEdition('hafs'); }} 
                      className={cn(
                        "flex-1 py-3 rounded-xl text-sm font-bold transition-all", 
                        mushafEdition === 'hafs' ? 'bg-white dark:bg-slate-700 shadow-md scale-[1.02] text-teal-600 dark:text-teal-400' : 'text-slate-500'
                      )}
                    >
                      {localT('editionHafs')}
                    </button>
                    <button 
                      onClick={() => { setRecitation('warsh'); setMushafEdition('warsh'); }} 
                      className={cn(
                        "flex-1 py-3 rounded-xl text-sm font-bold transition-all", 
                        mushafEdition === 'warsh' ? 'bg-white dark:bg-slate-700 shadow-md scale-[1.02] text-teal-600 dark:text-teal-400' : 'text-slate-500'
                      )}
                    >
                      {localT('editionWarsh')}
                    </button>
                    <button 
                      onClick={() => { setRecitation('uthmani'); setMushafEdition('tajweed'); }} 
                      className={cn(
                        "flex-1 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap", 
                        mushafEdition === 'tajweed' ? 'bg-white dark:bg-slate-700 shadow-md scale-[1.02] text-teal-600 dark:text-teal-400' : 'text-slate-500'
                      )}
                    >
                      {localT('editionTajweed')}
                    </button>
                  </div>
                </div>

                {/* Font Size */}
                <div className="space-y-4 bg-slate-50 dark:bg-slate-800/30 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-xs font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest flex items-center gap-2">
                      <Type size={14}/> {localT('fontSizeLabel')}
                    </label>
                    <span className="text-xs font-black text-teal-600 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg shadow-sm border border-teal-500/10 transform transition-all duration-75 active:scale-[0.95] active:opacity-80">{fontSize}px</span>
                  </div>
                  <div className="relative w-full h-8 flex items-center">
                    <input 
                      type="range" 
                      min="14" 
                      max="48" 
                      value={fontSize} 
                      onChange={(e) => setFontSize(parseInt(e.target.value))} 
                      className="w-full accent-teal-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer" 
                    />
                  </div>
                </div>

                {/* Font Selection */}
                <div className="space-y-3">
                  <label className="text-xs font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest flex items-center gap-2">
                    <AlignRight size={14}/> {localT('fontTypeLabel')}
                  </label>
                  <div className="grid grid-cols-2 gap-2 overflow-x-auto pb-1">
                    {QURAN_FONTS.slice(0, 6).map(f => (
                      <button 
                        key={f.id}
                        onClick={() => setFontFamily(f.id)}
                        className={cn(
                          "py-4 rounded-xl border-2 text-[11px] font-bold transition-all",
                          fontFamily === f.id ? "border-teal-500 bg-white dark:bg-slate-700 shadow-md text-teal-600 dark:text-teal-400" : "border-slate-100 dark:border-slate-800/50 text-slate-400 bg-slate-50/50 dark:bg-slate-900/30"
                        )}
                        style={{ fontFamily: f.id }}
                      >
                        {f.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Theme Selection */}
                <div className="space-y-3">
                  <label className="text-xs font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest flex items-center gap-2">
                    <Palette size={14}/> {localT('themeLabel')}
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'light', name: localT('themeLight'), bg: 'bg-slate-100', text: 'text-slate-600', preview: 'bg-white' },
                      { id: 'dark', name: localT('themeDark'), bg: 'bg-slate-800', text: 'text-slate-400', preview: 'bg-slate-900' },
                      { id: 'sepia', name: localT('themeSepia'), bg: 'bg-[#f4ecd8]', text: 'text-[#5b4636]', preview: 'bg-[#f4ecd8]' },
                      { id: 'parchment', name: localT('themeParchment'), bg: 'bg-[#e8dcc4]', text: 'text-[#4a3b2c]', preview: 'bg-[#e8dcc4]' },
                      { id: 'sand', name: localT('themeSand'), bg: 'bg-[#f3ead3]', text: 'text-[#5c4d3c]', preview: 'bg-[#f3ead3]' },
                      { id: 'slate', name: localT('themeSlate'), bg: 'bg-[#1e293b]', text: 'text-[#cbd5e1]', preview: 'bg-[#1e293b]' }
                    ].map(t => (
                      <button 
                        key={t.id} 
                        onClick={() => setTheme(t.id as any)} 
                        className={cn(
                          "flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all",
                          theme === t.id ? "bg-white dark:bg-slate-700 shadow-lg border-teal-500" : "border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/30"
                        )}
                      >
                        <div className={cn("w-8 h-8 rounded-full border border-black/5 shadow-inner", t.preview, theme === t.id && "ring-2 ring-teal-500 ring-offset-2 dark:ring-offset-slate-800")} />
                        <span className={cn("text-[10px] font-bold", theme === t.id ? "text-teal-600 dark:text-teal-400" : "text-slate-500")}>
                          {t.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>,
      document.body
    )}

    </div>
  );
};

export default Quran;
