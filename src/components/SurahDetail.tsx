import { BackButton } from "./ui/BackButton";
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useSmartNavigation } from "../lib/navigation";
import { progressService } from "../services/progressService";
import { auth } from "../firebase";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import {  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  Settings2,
  Settings,
  
  
  Type,
  Palette,
  Layout,
  
  
  Play,
  Pause,
  Copy,
  Share2,
  Volume2,
  Sparkles,
  BrainCircuit,
  Lightbulb,
  ZoomIn,
  ZoomOut,
  
  BookmarkCheck,
  
  Share,
  Info,
  History,
  Calendar,
  
  AlertCircle,
  Heart,
  Trash2,
  Check,
  Download,
  
  Menu,
  Clock,
  Focus,
  Moon,
  Sun , RefreshCw, BookOpen, X, CheckCircle2, Bookmark, Edit3 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn, copyTextToClipboard, shareContent } from "../lib/utils";
import { useQuranSettings } from "../context/QuranSettingsContext";
import { useAppContext } from "../AppContext";
import { useChallengeTracker } from "../hooks/useChallengeTracker";
import { ChallengeCategory } from "../challengesData";
import { QuranPager } from "./QuranPager";
import { getAIInsights } from "../services/geminiService";
import { RECITERS } from "../reciters";
import { useTranslation } from "../i18n";
import { mushafService, MUSHAF_EDITIONS } from "../services/mushafService";
import { tafsirService } from "../services/tafsirService";
import { quranOfflineService } from "../services/quranOfflineService";
import { audioCacheService } from "../services/audioCacheService";
import { SettingsModal, TafsirModal } from './quran/SurahSubComponents';
import { quranVocabulary, tajweedRules } from "../data/quranInteractions";
import { STATIC_SURAHS } from "../utils/staticQuranData";
import { SURAH_START_PAGES } from "../utils/quranUtils";
import { Highlighter } from "lucide-react";
import { PageTafsir } from "./PageTafsir";
import { safeLocalStorageGetItem, safeLocalStorageSetItem, safeLocalStorageRemoveItem } from "../utils/storage";

interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  tafsir?: string;
  page: number;
  juz?: number;
  hizb?: number;
  manzil?: number;
  ruku?: number;
  sajda?: boolean | any;
}

interface SurahDetail {
  number: number;
  name: string;
  englishName: string;
  ayahs: Ayah[];
  numberOfAyahs?: number;
  revelationType?: string;
}

const TAFSIR_NAMES: Record<string, string> = {
  "ar.muyassar": "التفسير الميسر",
  "ar.jalalayn": "تفسير الجلالين",
  "ar.waseet": "التفسير الوسيط",
  "ar.qurtubi": "تفسير القرطبي",
  "ar.baghawi": "تفسير البغوي",
  "ar.miqbas": "تفسير ابن عباس",
  "en.sahih": "إنجليزي: صحيح انترناشونال",
  "fr.hamidullah": "فرنسي: حميد الله",
  "tr.ates": "تركي: سليمان أتش",
  "ur.ahmedali": "أوردو: أحمد علي",
  "id.indonesian": "إندونيسي: الوزارة",
};

const TAFSIR_THEMES: Record<
  string,
  { name: string; classes: string; texture?: string; previewBg: string }
> = {
  default: {
    name: "الافتراضي",
    classes: "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100",
    previewBg: "bg-slate-200 dark:bg-slate-700",
  },
  sepia: {
    name: "ورق مريح للعين (Sepia)",
    classes: "bg-[#f4ecd8] text-[#5b4636]",
    previewBg: "bg-[#f4ecd8]",
  },
  slate: {
    name: "ليلي ناعم",
    classes: "bg-[#1e293b] text-[#cbd5e1]",
    previewBg: "bg-[#1e293b]",
  },
};

const QURAN_FONTS = [
  { id: "Uthmanic Hafs", name: "عثماني حفص" },
  { id: "Noto Naskh Arabic", name: "خط ورش (نسخ)" },
  { id: "Amiri", name: "أميري" },
  { id: "Scheherazade New", name: "شهرزاد" },
  { id: "Cairo", name: "كايرو" },
  { id: "Almarai", name: "المراعي" },
  { id: "Vazirmatn", name: "وزير" },
  { id: "El Messiri", name: "المسيري" },
  { id: "Noto Kufi Arabic", name: "كوفي" },
  { id: "Readex Pro", name: "ريدكس" },
  { id: "IBM Plex Sans Arabic", name: "آي بي إم" },
  { id: "Alexandria", name: "ألكسندرية" },
  { id: "Zain", name: "خط زين" },
];

const TAFSIR_FONTS = [
  { id: "Tajawal", name: "تجول (العصري)" },
  { id: "IBM Plex Sans Arabic", name: "آي بي إم" },
  { id: "Readex Pro", name: "ريدكس برو" },
  { id: "Almarai", name: "المراعي" },
  { id: "Cairo", name: "كايرو" },
  { id: "Vazirmatn", name: "وزير متن" },
  { id: "Alexandria", name: "ألكسندرية" },
  { id: "Zain", name: "خط زين" },
  { id: "Amiri", name: "أميري (كلاسيك)" },
  { id: "Noto Kufi Arabic", name: "كوفي ناعم" },
];

const MushafPage = React.memo<{
  pageNum: number;
  recitation: string;
  ayahs?: any[];
  surahName?: string;
  setSelectedAyah?: (ayah: any) => void;
  isVertical?: boolean;
  isBookmarked?: boolean;
  onBookmarkClick?: () => void;
}>(({ pageNum, recitation, ayahs = [], surahName, setSelectedAyah, isVertical, isBookmarked, onBookmarkClick }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [attemptIndex, setAttemptIndex] = useState(0);
  const [pageAspectRatio, setPageAspectRatio] = useState<number>(843 / 1140);
  const { theme, mushafEdition, mushafZoom, fontFamily, fontSize, setViewMode } = useQuranSettings();
  const { settings } = useAppContext();
  const { t } = useTranslation(settings.appLanguage);
  const isDesktop = typeof window !== "undefined" && window.innerWidth >= 640;

  // Reset attempt index and aspect ratio when page or edition changes
  useEffect(() => {
    setAttemptIndex(0);
    setPageAspectRatio(843 / 1140);
  }, [pageNum, mushafEdition]);

  useEffect(() => {
    let isMounted = true;
    let createdUrl: string | null = null;

    setLoading(true);
    setError(false);

    const loadPage = async () => {
      try {
        const url = await mushafService.getPageUrl(
          mushafEdition,
          pageNum,
          attemptIndex,
        );
        if (isMounted) {
          createdUrl = url;
          setImageUrl(url);
        } else if (url && url.startsWith("blob:")) {
          mushafService.revokePageUrl(url);
        }
      } catch (err) {
        if (isMounted) setError(true);
      }
    };

    loadPage();
    return () => {
      isMounted = false;
      if (createdUrl) mushafService.revokePageUrl(createdUrl);
    };
  }, [pageNum, mushafEdition, attemptIndex]);

  const isDarkTheme = theme === "dark" || theme === "slate" || theme === "creamyNight";
  const isSepia = theme === "sepia";
  const isCreamyNight = theme === "creamyNight";

  const handleRetry = async () => {
    setAttemptIndex((prev) => prev + 1);
  };

  const containerBg = 
    theme === "creamyNight" ? "bg-[#25211d] text-[#e8dac1]" :
    theme === "dark" ? "bg-slate-900 text-slate-100" :
    theme === "sepia" ? "bg-[#f4ebd0] text-[#5b4636]" :
    theme === "parchment" ? "bg-[#e8dcc4] text-[#4a3b2c]" :
    theme === "sand" ? "bg-[#f3ead3] text-[#5c4d3c]" :
    theme === "slate" ? "bg-[#1e293b] text-[#cbd5e1]" :
    "bg-white text-slate-900";

  const frameBorder = 
    theme === "creamyNight" ? "border-[#d8b48f]/20" :
    theme === "dark" || theme === "slate" ? "border-teal-500/20" :
    theme === "sepia" || theme === "parchment" || theme === "sand" ? "border-amber-800/20" :
    "border-teal-600/20";

  // Check if any verse on this page is the 1st verse of its Surah
  const hasBismillah = ayahs.some((a) => a.numberInSurah === 1) && surahName !== "سورة الفاتحة" && surahName !== "سورة التوبة";

  // Helper to convert to Arabic numerals
  const toArabicNumerals = (num: number | string) => {
    const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
    return String(num).replace(/[0-9]/g, (w) => arabicDigits[+w]);
  };

  if (error && ayahs.length > 0) {
    const firstAyah = ayahs[0];
    const juzNum = firstAyah?.juz;
    const hizbNum = firstAyah?.hizb;

    return (
      <div
        className={cn(
          "relative w-full flex flex-col items-center justify-between overflow-hidden p-4 sm:p-6 select-text",
          isVertical ? "rounded-none border-none" : "rounded-2xl border border-slate-150/10 dark:border-slate-850/50",
          containerBg
        )}
      >
        {/* Subtle Islamic Background Patterns */}
        <div className="absolute inset-0 bg-[radial-gradient(#00d2c4_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.015] pointer-events-none" />

        {/* Top Header info */}
        <div className="w-full flex items-center justify-between border-b border-dashed border-slate-200/40 dark:border-slate-800/60 pb-2.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 select-none">
          <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full text-[9px] font-black">
            <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
            <span>عرض تفاعلي غير متصل</span>
          </div>
          <div>
            {surahName} • صفحة {toArabicNumerals(pageNum)}
          </div>
          <div className="hidden sm:block">
            {juzNum && `الجزء ${toArabicNumerals(juzNum)}`} {hizbNum && `• الحِزْب ${toArabicNumerals(hizbNum)}`}
          </div>
        </div>

        {/* Elegant Inner Frame for reading */}
        <div className={cn(
          "w-full flex-1 my-3 p-3 sm:p-5 border-4 border-double rounded-xl flex flex-col justify-center overflow-y-auto custom-scrollbar relative",
          frameBorder
        )}>
          {/* Top Surah header block (only if we are repeating surah or page starts index 1) */}
          {ayahs.some((a) => a.numberInSurah === 1) && (
            <div className="w-full text-center py-2.5 px-4 mb-4 border-2 border-double border-teal-500/20 bg-teal-500/5 rounded-lg flex items-center justify-between relative overflow-hidden shadow-inner select-none">
              <span className="text-teal-600/25 dark:text-teal-400/25 font-bold text-base">❖</span>
              <h3 className="font-black text-xs text-teal-800 dark:text-teal-300 tracking-wider">
                {surahName || "سورة القرآن الكريمة"}
              </h3>
              <span className="text-teal-600/25 dark:text-teal-400/25 font-bold text-base">❖</span>
            </div>
          )}

          {/* Bismillah */}
          {hasBismillah && (
            <div className="text-center font-bold text-teal-600 dark:text-teal-400 my-3 text-[1.15em] tracking-normal select-none">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </div>
          )}

          {/* Verses flow block */}
          <div
            className="text-right leading-[2.5] tracking-wide text-justify select-text focus:outline-none"
            dir="rtl"
            style={{
              fontFamily: `${fontFamily}, "Amiri", serif`,
              fontSize: `${Math.max(16, fontSize * 1.12)}px`
            }}
          >
            {ayahs.map((ayah, i) => (
              <span
                key={ayah.number || i}
                className="inline group/ayah hover:bg-teal-500/15 rounded px-1.5 py-0.5 transition-all duration-150 cursor-pointer relative"
                onClick={() => {
                  if (typeof setSelectedAyah === "function") {
                    setSelectedAyah(ayah);
                  }
                }}
              >
                {ayah.text}{" "}
                <span className="inline-flex items-center justify-center w-6 h-6 mx-1 bg-teal-50/80 dark:bg-slate-800/85 text-teal-700 dark:text-teal-300 font-mono text-[9px] font-black rounded-full border border-teal-500/20 shadow-sm align-middle select-none transition-transform group-hover/ayah:scale-110">
                  {toArabicNumerals(ayah.numberInSurah)}
                </span>
              </span>
            ))}
          </div>
        </div>

        {/* Bottom Actions and Help banners */}
        <div className="w-full flex flex-col items-center gap-2 border-t border-slate-100/10 dark:border-slate-805/30 pt-2.5 select-none font-sans">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={handleRetry}
              className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-[9px] font-black transition-all flex items-center gap-1 border border-transparent active:scale-95 cursor-pointer shadow-sm shadow-teal-600/10"
            >
              <RefreshCw size={11} className="animate-pulse" />
              تحديث المحاولة والاتصال
            </button>
            <button
              onClick={() => setViewMode("vertical")}
              className="px-3.5 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-150 dark:hover:bg-slate-755 text-slate-700 dark:text-slate-300 rounded-lg text-[9px] font-black transition-all flex items-center gap-1 border border-slate-200 dark:border-slate-700 active:scale-95 cursor-pointer"
            >
              <Layout size={11} />
              تحويل للنمط الرأسي التفاعلي
            </button>
          </div>
          <p className="text-[9px] text-slate-400 dark:text-slate-500 text-center font-bold leading-normal">
            💡 يعرض النص الرقمي التفاعلي لتعذر تحميل الصفحة المصورة دون نت. قراءتك مستمرة دائماً!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative w-full flex items-center justify-center overflow-visible transition-colors duration-200 bg-transparent p-0 m-0",
        isVertical ? "h-auto min-h-0 py-0" : "h-full max-h-full"
      )}
    >
      {/* Complex Background Texture for Realism and Comfort */}
      {!isDarkTheme && (
        <div className="absolute inset-0 bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03] pointer-events-none" />
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-inherit z-20">
          <div className="relative flex items-center justify-center">
            <div className="w-12 h-12 border-2 border-teal-500/10 rounded-full" />
            <div className="absolute w-12 h-12 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
            <BookOpen className="absolute text-teal-600 scale-90" />
          </div>
          <p className="text-[10px] font-black text-teal-600/60 uppercase tracking-[0.2em] animate-pulse">
            {t("loading")}
          </p>
        </div>
      )}

        {error ? (
          <div className="flex flex-col items-center justify-center p-12 text-center gap-6 z-30">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
              <AlertCircle size={32} />
            </div>
            <div className="space-y-2">
              <p className="text-lg font-black text-slate-800 dark:text-slate-100">
                {t("page_load_failed")}
              </p>
              <p className="text-xs text-slate-500 font-bold max-w-[200px]">
                {t("mushaf_server_error")}
              </p>
            </div>
            <button
              onClick={handleRetry}
              className="px-8 py-3 bg-teal-600 text-white rounded-2xl font-black shadow-xl shadow-teal-600/20 hover:scale-105 duration-75 active:scale-[0.85] active:opacity-70 transition-all flex items-center gap-2"
            >
              <RefreshCw size={18} />
              {t("retry_alternate_server")}
            </button>
          </div>
        ) : imageUrl ? (
          <div
            id={`mushaf-page-frame-${pageNum}`}
            className={cn(
              "relative group/mushaf-page select-none cursor-pointer flex items-center justify-center transition-all duration-150 active:scale-[0.995]",
              isVertical
                ? "w-full max-w-[650px] mx-auto h-auto my-0"
                : "h-full max-h-full max-w-full my-0 p-0 mx-auto"
            )}
            style={
              isVertical
                ? {
                    aspectRatio: `${pageAspectRatio}`,
                  }
                : {
                    aspectRatio: `${pageAspectRatio}`,
                    height: "100%",
                    maxHeight: "100%",
                    maxWidth: "100%",
                  }
            }
            onClick={(e) => {
              e.stopPropagation();
              if (!loading && !error && Array.isArray(ayahs) && ayahs.length > 0 && typeof setSelectedAyah === "function") {
                setSelectedAyah(ayahs[0]);
              }
            }}
            title={t("show_tafsir") || "اضغط لعرض التفسير"}
          >
            <img
              src={imageUrl}
              alt={`${t("page")} ${pageNum}`}
              loading="eager"
              decoding="async"
              ref={(img) => {
                if (img && img.complete && img.naturalWidth > 0 && loading) {
                  setLoading(false);
                  setPageAspectRatio(img.naturalWidth / img.naturalHeight);
                }
              }}
              className={cn(
                "origin-center [image-rendering:high-quality] relative z-0 transition-opacity duration-150 block w-full h-full object-fill pointer-events-none select-none",
                loading ? "opacity-0" : "opacity-100",
                isCreamyNight
                  ? "invert hue-rotate-[160deg] contrast-125 brightness-[0.85] sepia-[0.3]"
                  : isDarkTheme
                  ? "invert hue-rotate-180 contrast-[1.25] brightness-[0.95]"
                  : "contrast-[1.05] brightness-[1.02] mix-blend-darken",
              )}
              style={{
                transform: `scale(${mushafZoom / 100})`,
                userSelect: "none",
              }}
              onLoad={(e) => {
                setLoading(false);
                const { naturalWidth, naturalHeight } = e.currentTarget;
                if (naturalWidth && naturalHeight && naturalHeight > 0) {
                  setPageAspectRatio(naturalWidth / naturalHeight);
                }
              }}
              onError={() => {
                const edition =
                  MUSHAF_EDITIONS[mushafEdition as keyof typeof MUSHAF_EDITIONS];
                const maxAttempts = edition ? edition.getUrls(pageNum).length : 8;
                if (attemptIndex < maxAttempts - 1) {
                  // Seamlessly try next server in background without breaking layout
                  setAttemptIndex((prev) => prev + 1);
                } else {
                  setError(true);
                  setLoading(false);
                }
              }}
              referrerPolicy="no-referrer"
            />

            {/* Realistic Page Fold Shadows */}
            <div className="absolute inset-y-0 left-0 w-2 bg-gradient-to-r from-black/[0.03] to-transparent pointer-events-none z-10" />
            <div className="absolute inset-y-0 right-0 w-2 bg-gradient-to-l from-black/[0.03] to-transparent pointer-events-none z-10" />
          </div>
        ) : null}

    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.pageNum === nextProps.pageNum &&
    prevProps.recitation === nextProps.recitation &&
    prevProps.isVertical === nextProps.isVertical &&
    prevProps.isBookmarked === nextProps.isBookmarked &&
    prevProps.surahName === nextProps.surahName
  );
});

export const SurahDetail: React.FC = () => {
  const { number } = useParams<{ number: string }>();
  const { navigate, goBack } = useSmartNavigation();
  const location = useLocation();
  const { settings, addPoints, progress, togglePageRead, toggleSurahRead } =
    useAppContext();
  const { updateChallengeProgress, updateSpecificChallenge } =
    useChallengeTracker();
  const { t } = useTranslation(settings.appLanguage);
  
  const getInitialPageIndex = (surahData: any) => {
    if (!surahData || !surahData.ayahs) return 0;

    // Group ayahs by page
    const grouped = new Map<number, Ayah[]>();
    surahData.ayahs.forEach((ayah: any) => {
      const page = ayah.page || 1;
      if (!grouped.has(page)) grouped.set(page, []);
      grouped.get(page)!.push(ayah);
    });
    const groupedPages = Array.from(grouped.entries()).sort((a, b) => a[0] - b[0]);

    const extPages = [...groupedPages];
    if (surahData.number < 114) {
      extPages.push([groupedPages[groupedPages.length - 1][0] + 1, "next_surah_trigger"] as any);
    }
    if (surahData.number > 1) {
      extPages.unshift([groupedPages[0][0] - 1, "prev_surah_trigger"] as any);
    }

    const searchParams = new URLSearchParams(location.search);
    const targetPageStr = searchParams.get("page");
    const targetAyahStr = searchParams.get("ayah");
    const from = searchParams.get("from");

    // Check ayah parameter first as it's more specific
    if (targetAyahStr) {
      const ayahNum = parseInt(targetAyahStr);
      const ayah = surahData.ayahs.find((a: any) => a.numberInSurah === ayahNum);
      if (ayah) {
        const page = ayah.page;
        const index = extPages.findIndex(
          (p) => p[0] === page && Array.isArray(p[1]),
        );
        if (index !== -1) {
          return index;
        }
      }
    }

    if (targetPageStr) {
      const targetPage = parseInt(targetPageStr);
      const index = extPages.findIndex(
        (p) => p[0] === targetPage && Array.isArray(p[1]),
      );
      if (index !== -1) {
        return index;
      }
    }

    if (from === "next") {
      // Came from next surah, so show the LAST page of current surah
      let lastIdx = -1;
      for (let i = extPages.length - 1; i >= 0; i--) {
        if (Array.isArray(extPages[i][1])) {
          lastIdx = i;
          break;
        }
      }
      if (lastIdx !== -1) return lastIdx;
    }

    // Came from previous surah or normal entry, show the FIRST page of current surah
    const firstIdx = extPages.findIndex((p) => Array.isArray(p[1]));
    if (firstIdx !== -1) return firstIdx;

    return 0;
  };

  const [surah, setSurah] = useState<SurahDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRetry, setShowRetry] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSideMenu, setShowSideMenu] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState("reading");
  const [selectedAyah, setSelectedAyah] = useState<Ayah | null>(null);
  const [selectedWordDetail, setSelectedWordDetail] = useState<any | null>(null);
  const [selectedTajweedRule, setSelectedTajweedRule] = useState<any | null>(null);
  const [isTajweedGuideOpen, setIsTajweedGuideOpen] = useState(false);
  const [playingExamplePhrase, setPlayingExamplePhrase] = useState<string | null>(null);

  const speakArabicWord = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
        
        // Use a slight timeout to let any active voice cancel completely
        setTimeout(() => {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = "ar-SA";
          utterance.rate = 0.5; // slow rhythmic recitation pace
          utterance.pitch = 0.95; // spiritual tone
          
          const voices = window.speechSynthesis.getVoices();
          const arabicVoice = voices.find((v) => v.lang.startsWith("ar"));
          if (arabicVoice) {
            utterance.voice = arabicVoice;
          }
          
          setPlayingExamplePhrase(text);
          utterance.onend = () => setPlayingExamplePhrase(null);
          utterance.onerror = () => setPlayingExamplePhrase(null);
          
          window.speechSynthesis.speak(utterance);
        }, 50);
      } catch (err) {
        console.warn("Speech Synthesis error:", err);
        setPlayingExamplePhrase(null);
      }
    } else {
      // Fallback visual simulation for unsupported devices
      setPlayingExamplePhrase(text);
      setTimeout(() => setPlayingExamplePhrase(null), 1500);
    }
  };
  const [showTafsirSettings, setShowTafsirSettings] = useState(false);
  const [showControls, setShowControls] = useState(true);
  
  // Auto-hide controls logic (Zen Mode) - Disabled to keep controls permanently visible
  const scrollTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  
  const handleScrollActivity = React.useCallback(() => {
    // Keep controls permanently visible
  }, []);

  // Touch Swipe Handlers for Vertical Mode Horizontal Swiping
  const verticalTouchStartX = React.useRef<number>(0);
  const verticalTouchStartY = React.useRef<number>(0);
  const verticalTouchEndX = React.useRef<number>(0);
  const verticalTouchEndY = React.useRef<number>(0);

  const handleVerticalTouchStart = (e: React.TouchEvent) => {
    verticalTouchStartX.current = e.touches[0].clientX;
    verticalTouchStartY.current = e.touches[0].clientY;
    verticalTouchEndX.current = e.touches[0].clientX;
    verticalTouchEndY.current = e.touches[0].clientY;
  };

  const handleVerticalTouchMove = (e: React.TouchEvent) => {
    verticalTouchEndX.current = e.touches[0].clientX;
    verticalTouchEndY.current = e.touches[0].clientY;
    handleScrollActivity();
  };

  const handleVerticalTouchEnd = () => {
    const deltaX = verticalTouchEndX.current - verticalTouchStartX.current;
    const deltaY = verticalTouchEndY.current - verticalTouchStartY.current;
    const minSwipeDistance = 55;

    if (Math.abs(deltaX) > minSwipeDistance && Math.abs(deltaX) > Math.abs(deltaY) * 1.3) {
      if (deltaX < 0) {
        // Dragged finger left -> Next Page/Surah
        const nextIdx = currentPageIndex + 1;
        if (nextIdx < extendedPages.length) {
          handlePageChange(nextIdx);
        }
      } else {
        // Dragged finger right -> Previous Page/Surah
        const prevIdx = currentPageIndex - 1;
        if (prevIdx >= 0) {
          handlePageChange(prevIdx);
        }
      }
    }

    verticalTouchStartX.current = 0;
    verticalTouchEndX.current = 0;
    verticalTouchStartY.current = 0;
    verticalTouchEndY.current = 0;
  };

  const toggleControls = (e?: React.MouseEvent) => {
    // Keep controls permanently visible
  };
  const [showTafsirQuickSettings, setShowTafsirQuickSettings] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAyahPlaying, setCurrentAyahPlaying] = useState<number | null>(
    null,
  );
  const [copiedAyahId, setCopiedAyahId] = useState<number | null>(null);
  const [sharedAyahId, setSharedAyahId] = useState<number | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [fullSurahPlaying, setFullSurahPlaying] = useState(false);
  const [isFullSurahPaused, setIsFullSurahPaused] = useState(false);
  const fullSurahAudioRef = React.useRef<HTMLAudioElement | null>(null);
  const isRetryingRef = React.useRef(false);

  const {
    fontSize,
    setFontSize,
    theme,
    setTheme,
    tafsirType,
    setTafsirType,
    secondaryTafsirType,
    setSecondaryTafsirType,
    tafsirTheme,
    setTafsirTheme,
    tafsirFontSize,
    setTafsirFontSize,
    tafsirFontFamily,
    setTafsirFontFamily,
    fontFamily,
    setFontFamily,
    viewMode,
    setViewMode,
    recitation,
    setRecitation,
    reciter,
    setReciter,
    autoPlay,
    setAutoPlay,
    mushafZoom,
    setMushafZoom,
    mushafEdition,
    setMushafEdition,
    mushafDisplayMode,
    setMushafDisplayMode,
    bookmark,
    setBookmark,
    bookmarks,
    setBookmarks,
    keepScreenAwake,
    setKeepScreenAwake,
    ayahRepeatCount,
    setAyahRepeatCount,
    rangeRepeatCount,
    setRangeRepeatCount,
    playbackRate,
    setPlaybackRate,
    autoNextSurah,
    setAutoNextSurah,
    ayahInterval,
    setAyahInterval,
    focusMode,
    setFocusMode,
  } = useQuranSettings();

  const [windowWidth, setWindowWidth] = useState(() => typeof window !== "undefined" ? window.innerWidth : 1024);
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isDoubleSpread = mushafDisplayMode === "double" || (mushafDisplayMode === "auto" && windowWidth >= 768);

  const getAyahsForPage = React.useCallback((pNum: number) => {
    if (!surah || !surah.ayahs) return [];
    return surah.ayahs.filter((a) => a.page === pNum);
  }, [surah]);
  const [secondaryTafsirData, setSecondaryTafsirData] = useState<any[]>([]);

  const [wakeLock, setWakeLock] = useState<any>(null);
  const [currentAyahRepeat, setCurrentAyahRepeat] = useState(1);
  const [currentRangeRepeat, setCurrentRangeRepeat] = useState(1);

  const [readAyahs, setReadAyahs] = useState<number[]>([]);
  const [isSurahCompleted, setIsSurahCompleted] = useState(false);

  // Offline caching states
  const [isOfflineTextDownloaded, setIsOfflineTextDownloaded] = useState(false);
  const [isOfflineAudioDownloaded, setIsOfflineAudioDownloaded] = useState(false);
  const [textDownloadLoading, setTextDownloadLoading] = useState(false);
  const [audioDownloadProgress, setAudioDownloadProgress] = useState<number | null>(null);
  const [audioDownloadLoading, setAudioDownloadLoading] = useState(false);

  // Focus Mode Global Body Class
  useEffect(() => {
    if (focusMode || !showControls) {
      document.body.classList.add('reading-focus-mode');
    } else {
      document.body.classList.remove('reading-focus-mode');
    }
    return () => document.body.classList.remove('reading-focus-mode');
  }, [focusMode, showControls]);

  // Check offline status on mount and settings changes
  useEffect(() => {
    if (!surah) return;
    let isMounted = true;
    const checkOfflineStatus = async () => {
      try {
        const textDown = await quranOfflineService.isSurahTextDownloaded(surah.number, tafsirType, recitation);
        const audioDown = await quranOfflineService.isSurahAudioDownloaded(surphNumberFromRef || surah.number, reciter);
        if (isMounted) {
          setIsOfflineTextDownloaded(textDown);
          setIsOfflineAudioDownloaded(audioDown);
        }
      } catch (err) {
        console.warn("Error checking offline status:", err);
      }
    };
    checkOfflineStatus();
    return () => {
      isMounted = false;
    };
  }, [surah, reciter, tafsirType, recitation]);

  const surphNumberFromRef = surah?.number;

  const handleDownloadTextOffline = async () => {
    if (!surah) return;
    setTextDownloadLoading(true);
    try {
      await quranOfflineService.downloadSurahText(surah.number, surah.name, tafsirType, secondaryTafsirType, recitation);
      setIsOfflineTextDownloaded(true);
    } catch (e) {
      console.error("Failed to download text offline", e);
    } finally {
      setTextDownloadLoading(false);
    }
  };

  const handleDownloadAudioOffline = async () => {
    if (!surah) return;
    setAudioDownloadLoading(true);
    setAudioDownloadProgress(0);
    try {
      await quranOfflineService.downloadSurahAudio(
        surah.number,
        surah.name,
        reciter,
        (progress) => {
          setAudioDownloadProgress(progress);
        }
      );
      setIsOfflineAudioDownloaded(true);
    } catch (e: any) {
      console.error("Failed to download audio offline", e);
      alert(e?.message || "فشل تحميل تلاوة السورة. يرجى التأكد من اتصال الإنترنت.");
    } finally {
      setAudioDownloadLoading(false);
      setAudioDownloadProgress(null);
    }
  };

  const handleDeleteOfflineCache = async () => {
    if (!surah) return;
    if (window.confirm("هل تريد حذف ملفات هذه السورة المخزنة أوفلاين لتوفير المساحة؟")) {
      await quranOfflineService.deleteSurahText(surah.number, tafsirType, recitation);
      await quranOfflineService.deleteSurahAudio(surah.number, reciter);
      setIsOfflineTextDownloaded(false);
      setIsOfflineAudioDownloaded(false);
    }
  };

  // Load Quran progress
  useEffect(() => {
    if (auth.currentUser && number) {
      progressService
        .getSurahProgress(auth.currentUser.uid, parseInt(number))
        .then((p) => {
          if (p) {
            setReadAyahs(p.readAyahs || []);
            setIsSurahCompleted(p.isCompleted || false);
          }
        });
    }
  }, [number]);

  // Reset parent scroll position to top when surah is loaded
  useEffect(() => {
    if (!loading) {
      const mainEl = document.querySelector('main');
      if (mainEl) {
        mainEl.scrollTop = 0;
      }
      window.scrollTo(0, 0);
    }
  }, [loading, number]);

  const toggleAyahRead = async (ayahNumberInSurah: number) => {
    if (!auth.currentUser || !surah) return;

    setReadAyahs((prev) => {
      const newReadAyahs = prev.includes(ayahNumberInSurah)
        ? prev.filter((n) => n !== ayahNumberInSurah)
        : [...prev, ayahNumberInSurah];

      const isCompleted = newReadAyahs.length === surah.ayahs.length;
      setIsSurahCompleted(isCompleted);

      progressService.saveQuranProgress(
        auth.currentUser.uid!,
        surah.number,
        newReadAyahs,
        isCompleted,
      );

      if (!prev.includes(ayahNumberInSurah)) {
        addPoints(5);
      }

      return newReadAyahs;
    });
  };

  const markSurahAsCompleted = async () => {
    if (!auth.currentUser || !surah) return;

    const allAyahs = surah.ayahs.map((a) => a.numberInSurah);
    setReadAyahs(allAyahs);
    setIsSurahCompleted(true);

    await progressService.saveQuranProgress(
      auth.currentUser.uid,
      surah.number,
      allAyahs,
      true,
    );
    addPoints(100);
  };

  // Auto-scroll list when ayah changes
  useEffect(() => {
    if (selectedAyah && currentAyahPlaying !== null && surah) {
      const ayahObj = surah.ayahs.find((a) => a.number === currentAyahPlaying);
      if (ayahObj && ayahObj.numberInSurah !== selectedAyah.numberInSurah) {
          setSelectedAyah(ayahObj);
      }
    }
  }, [currentAyahPlaying, selectedAyah, surah]);

  // WakeLock Effect
  useEffect(() => {
    let currentWakeLock: any = null;

    const requestWakeLock = async () => {
      if ("wakeLock" in navigator && keepScreenAwake) {
        try {
          currentWakeLock = await (navigator as any).wakeLock.request("screen");
          setWakeLock(currentWakeLock);
        } catch (err: any) {
          if (err.name !== "NotAllowedError") {
            console.warn(`Wake Lock error: ${err.message || err}`);
          }
        }
      }
    };

    if (keepScreenAwake) {
      requestWakeLock();
    } else if (wakeLock) {
      wakeLock.release().then(() => {
        setWakeLock(null);
      });
    }

    const handleVisibilityChange = () => {
      if (
        document.visibilityState === "visible" &&
        keepScreenAwake &&
        !currentWakeLock
      ) {
        requestWakeLock();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (currentWakeLock) {
        currentWakeLock.release();
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [keepScreenAwake]);
  const [isComparing, setIsComparing] = useState(false);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const initializedSurahNumberRef = React.useRef<number | null>(null);

  const [showBookmarksModal, setShowBookmarksModal] = useState(false);
  const [bookmarkNote, setBookmarkNote] = useState("");
  const [selectedBookmarkType, setSelectedBookmarkType] = useState<
    "general" | "wird" | "memorization" | "reflection" | "important"
  >("general");
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);

  const pages = React.useMemo(() => {
    if (!surah || !surah.ayahs) return [];

    // Group ayahs by page
    const grouped = new Map<number, Ayah[]>();
    surah.ayahs.forEach((ayah) => {
      const page = ayah.page || 1;
      if (!grouped.has(page)) grouped.set(page, []);
      grouped.get(page)!.push(ayah);
    });
    return Array.from(grouped.entries()).sort((a, b) => a[0] - b[0]);
  }, [surah]);

  const extendedPages = React.useMemo(() => {
    if (pages.length === 0) return [];

    const list = [...pages];
    // Add sentinels
    if (surah && surah.number < 114) {
      list.push([pages[pages.length - 1][0] + 1, "next_surah_trigger"] as any);
    }
    if (surah && surah.number > 1) {
      list.unshift([pages[0][0] - 1, "prev_surah_trigger"] as any);
    }
    return list;
  }, [pages, surah]);

  // Save last read position automatically
  useEffect(() => {
    if (surah && extendedPages[currentPageIndex]) {
      const pageData = extendedPages[currentPageIndex];
      if (Array.isArray(pageData[1])) {
        const pageNum = pageData[0];
        const firstAyah = pageData[1][0];
        const ayahNum = selectedAyah && surah.ayahs.some(a => a.numberInSurah === selectedAyah.numberInSurah && a.page === pageNum)
          ? selectedAyah.numberInSurah 
          : (firstAyah ? firstAyah.numberInSurah : 1);

        const lastReadData = {
          surahNumber: surah.number,
          surahName: surah.name,
          englishName: surah.englishName,
          pageNumber: pageNum,
          ayahNumber: ayahNum,
          timestamp: Date.now()
        };
        safeLocalStorageSetItem('believer_quran_last_read', JSON.stringify(lastReadData));
      }
    }
  }, [surah, currentPageIndex, selectedAyah, extendedPages]);

  // Sync current page on vertical reading scroll
  useEffect(() => {
    if (viewMode === "mushaf") return;

    const observerOption = {
      root: null,
      rootMargin: "-20% 0px -50% 0px",
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const indexAttr = entry.target.getAttribute("data-index");
          if (indexAttr !== null) {
            const idx = parseInt(indexAttr, 10);
            if (!isNaN(idx)) {
              setCurrentPageIndex(idx);
            }
          }
        }
      });
    }, observerOption);

    const elements = document.querySelectorAll(".quran-vertical-page");
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
      observer.disconnect();
    };
  }, [viewMode, extendedPages]);

  const handlePageChange = (idx: number) => {
    const pageData = extendedPages[idx];
    if (!pageData) return;

    const ayahsData = pageData[1];
    if (
      typeof ayahsData === "string" &&
      ayahsData === "next_surah_trigger" &&
      surah
    ) {
      if (initializedSurahNumberRef.current !== surah.number) return;
      if (settings.hapticTasbihEnabled !== false) {
        Haptics.impact({ style: ImpactStyle.Light }).catch(() => {
          if ("vibrate" in navigator) navigator.vibrate(20);
        });
      }
      const nextNum = surah.number + 1;
      navigate(`/quran/${nextNum}?from=prev`);
      return;
    }
    if (
      typeof ayahsData === "string" &&
      ayahsData === "prev_surah_trigger" &&
      surah
    ) {
      if (initializedSurahNumberRef.current !== surah.number) return;
      if (settings.hapticTasbihEnabled !== false) {
        Haptics.impact({ style: ImpactStyle.Light }).catch(() => {
          if ("vibrate" in navigator) navigator.vibrate(20);
        });
      }
      const prevNum = surah.number - 1;
      navigate(`/quran/${prevNum}?from=next`);
      return;
    }

    // Track Quran reading progress
    updateChallengeProgress(ChallengeCategory.QURAN, 1);

    // Special Challenge: Surah Kahf on Friday
    if (surah?.number === 18) {
      const today = new Date();
      if (today.getDay() === 5) {
        // 5 is Friday
        updateSpecificChallenge("special_kahf_friday", 1);
      }
    }

    setCurrentPageIndex(idx);

    // Sync Audio with Page Turn: If playing, jump to the first verse of the new page
    if (isPlaying && autoPlay) {
      const pageData = extendedPages[idx]?.[1];
      if (Array.isArray(pageData) && pageData.length > 0) {
        const firstAyah = pageData[0];
        if (currentAyahPlaying !== firstAyah.number) {
          toggleAudio(firstAyah);
        }
      }
    }
  };

  useEffect(() => {
    if (surah && extendedPages.length > 0) {
      if (initializedSurahNumberRef.current === surah.number) return;
      initializedSurahNumberRef.current = surah.number;

      const searchParams = new URLSearchParams(location.search);
      const targetPageStr = searchParams.get("page");
      const from = searchParams.get("from");

      if (targetPageStr) {
        const targetPage = parseInt(targetPageStr);
        const index = extendedPages.findIndex(
          (p) => p[0] === targetPage && Array.isArray(p[1]),
        );
        if (index !== -1) {
          setCurrentPageIndex(index);
          return;
        }
      }

      if (from === "next") {
        // Came from next surah, so show the LAST page of current surah
        let lastIdx = -1;
        for (let i = extendedPages.length - 1; i >= 0; i--) {
          if (Array.isArray(extendedPages[i][1])) {
            lastIdx = i;
            break;
          }
        }
        if (lastIdx !== -1) setCurrentPageIndex(lastIdx);
      } else if (from === "prev") {
        // Came from previous surah, so show the FIRST page of current surah
        const firstIdx = extendedPages.findIndex((p) => Array.isArray(p[1]));
        if (firstIdx !== -1) setCurrentPageIndex(firstIdx);
      } else {
        // Normal entry, show first page
        const firstIdx = extendedPages.findIndex((p) => Array.isArray(p[1]));
        if (firstIdx !== -1) setCurrentPageIndex(firstIdx);
      }
    }
  }, [surah?.number, extendedPages, location.search]);

  useEffect(() => {
    if (surah && !loading) {
      const searchParams = new URLSearchParams(location.search);
      const targetAyah = searchParams.get("ayah");
      if (targetAyah) {
        const ayahNum = parseInt(targetAyah);
        const ayahObj = surah.ayahs.find((a) => a.numberInSurah === ayahNum);
        if (ayahObj) {
          setSelectedAyah(ayahObj);
        }

        if (viewMode === "mushaf") {
          const ayah = surah.ayahs.find((a) => a.numberInSurah === ayahNum);
          if (ayah) {
            const page = ayah.page;
            const index = extendedPages.findIndex(
              (p) => p[0] === page && Array.isArray(p[1]),
            );
            if (index !== -1) {
              setCurrentPageIndex(index);
            }
          }
        } else {
          setTimeout(() => {
            const element = document.getElementById(`ayah-${ayahNum}`);
            if (element) {
              element.scrollIntoView({ behavior: "smooth", block: "center" });
              // Highlight effect
              element.classList.add(
                "ring-4",
                "ring-teal-500/20",
                "ring-offset-4",
              );
              setTimeout(() => {
                element.classList.remove(
                  "ring-4",
                  "ring-teal-500/20",
                  "ring-offset-4",
                );
              }, 3000);
            }
          }, 500);
        }
      }
    }
  }, [surah, loading, location.search, viewMode, extendedPages]);

  const [showSurahInfo, setShowSurahInfo] = useState(false);

  const currentPageNum = extendedPages[currentPageIndex]?.[0];

  const isPageRead = React.useMemo(() => {
    return progress.quranProgress?.readPages?.includes(currentPageNum) || false;
  }, [progress.quranProgress?.readPages, currentPageNum]);

  const toggleCurrentPageRead = () => {
    togglePageRead(currentPageNum);
  };

  const isBookmarkedOld =
    bookmark?.surah === surah?.number && bookmark?.page === currentPageNum;
  const pageBookmarks =
    bookmarks?.filter(
      (b) => b.surah === surah?.number && b.page === currentPageNum,
    ) || [];
  const isBookmarked = isBookmarkedOld || pageBookmarks.length > 0;

  const handleAddBookmark = (
    type: "general" | "wird" | "memorization" | "reflection" | "important",
  ) => {
    if (!surah) return;
    const newBookmark = {
      id: Math.random().toString(36).substr(2, 9),
      surah: surah.number,
      page: currentPageNum,
      juz: extendedPages[currentPageIndex]?.[1]?.[0]?.juz || 1,
      hizb: extendedPages[currentPageIndex]?.[1]?.[0]?.hizb || 1,
      surahName: surah.name,
      type,
      note: bookmarkNote,
      dateAdded: new Date().toISOString(),
    };
    setBookmarks([...(bookmarks || []), newBookmark]);
    setBookmarkNote("");
    setShowBookmarksModal(false);
  };

  const removePageBookmarks = () => {
    if (!surah) return;
    setBookmarks(
      (bookmarks || []).filter(
        (b) => !(b.surah === surah.number && b.page === currentPageNum),
      ),
    );
    if (isBookmarkedOld) setBookmark(null);
  };

  const toggleBookmark = () => {
    setShowBookmarksModal(true);
  };

  const handleSharePage = async () => {
    if (!surah) return;
    const currentPage = extendedPages[currentPageIndex]?.[0];
    const shareUrl = new URL(window.location.href);
    shareUrl.searchParams.set("page", currentPage.toString());
    
    const title = `${t("surah")} ${surah.name} - ${t("page")} ${currentPage}`;
    const text = `📖 *${t("surah")} ${surah.name} - ${t("page")} ${currentPage}*\n\n${t("read")} ${t("surah")} ${surah.name} ${t("from_app")}\n\n— تطبيق أذكار المؤمن`;
    
    await shareContent(title, text, shareUrl.toString());
  };

  const navigateTafsir = (direction: -1 | 1) => {
    if (!surah || !selectedAyah) return;
    const currentIndex = surah.ayahs.findIndex(
      (a) => a.numberInSurah === selectedAyah.numberInSurah,
    );
    const nextIndex = currentIndex + direction;
    if (nextIndex >= 0 && nextIndex < surah.ayahs.length) {
      setSelectedAyah(surah.ayahs[nextIndex]);
    }
  };

  const highlightQuranText = (text: string) => {
    if (!text) return "";
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  };

  const [error, setError] = useState<string | null>(null);
  const [downloadingAyahId, setDownloadingAyahId] = useState<number | null>(
    null,
  );

  useEffect(() => {
    if (!number) return;
    const surahNumber = parseInt(number);
    if (isNaN(surahNumber)) {
      setError(t("invalid_surah_number"));
      setLoading(false);
      return;
    }

    let isMounted = true;

    // Try to load from cache first
    const cacheKey = `surah-cache-v3-${number}-${tafsirType}-${recitation}`;
    const cachedData = safeLocalStorageGetItem(cacheKey);
    let hasCache = false;

    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        if (
          parsed &&
          parsed.number === surahNumber &&
          parsed.ayahs &&
          parsed.ayahs.length > 0
        ) {
          setCurrentPageIndex(getInitialPageIndex(parsed));
          setSurah(parsed);
          setLoading(false);
          hasCache = true;
        }
      } catch (e) {
        console.error("Failed to parse cached surah", e);
      }
    }

    if (!hasCache) {
      setLoading(true);
      setSurah(null);
      setCurrentPageIndex(0);
    }

    setError(null);
    setShowRetry(false);

    const retryTimeout = setTimeout(() => {
      if (isMounted && !hasCache) setShowRetry(true);
    }, 5000);

    const fetchWithTimeout = (url: string, timeout = 10000) => {
      return Promise.race([
        fetch(url, {
          mode: "cors",
          credentials: "omit",
          referrerPolicy: "no-referrer",
        }),
        new Promise<Response>((_, reject) =>
          setTimeout(() => reject(new Error("Request timeout")), timeout),
        ),
      ]);
    };

    const loadData = async () => {
      try {
        let quranData = null;

        // Try offline cache first
        try {
          const offlineData = await quranOfflineService.getDownloadedSurahText(surahNumber, tafsirType, recitation);
          if (offlineData && offlineData.ayahs && offlineData.ayahs.length > 0) {
            quranData = offlineData;
          }
        } catch (e) {
          console.warn("Offline text load failed, fetching from network:", e);
        }

        const isFromOfflineCache = Boolean(quranData && quranData.ayahs && quranData.ayahs.length > 0);

        if (isFromOfflineCache && isMounted) {
          setCurrentPageIndex(getInitialPageIndex(quranData));
          setSurah(quranData);
          setLoading(false);
          return;
        }

        // Helper to fetch surah info safely
        const fetchSurahInfo = async (num: string) => {
          try {
            const res = await fetchWithTimeout(
              `https://api.alquran.cloud/v1/surah/${num}/quran-uthmani`,
            );
            if (res.ok) {
              const d = await res.json();
              return d.data;
            }
          } catch (e) {
            console.warn("Surah info fetch failed:", e);
          }
          return null;
        };

        if (recitation === "warsh") {
          try {
            // Try alquran.cloud for Warsh first
            const res = await fetchWithTimeout(
              `https://api.alquran.cloud/v1/surah/${number}/quran-warsh`,
            );
            if (res.ok) {
              const data = await res.json();
              if (data.code === 200 && data.data) {
                quranData = data.data;
              }
            }
          } catch (e) {
            console.warn("Warsh primary failed:", e);
          }

          if (!quranData) {
            try {
              // Fallback to api.quran.com for Warsh
              const res = await fetchWithTimeout(
                `https://api.quran.com/api/v4/quran/verses/warsh?chapter_number=${number}`,
              );
              if (res.ok) {
                const data = await res.json();
                const infoData = await fetchSurahInfo(number!);

                if (data.verses && data.verses.length > 0) {
                  quranData = {
                    number: surahNumber,
                    name: infoData?.name || `${t("surah")} ${number}`,
                    englishName: infoData?.englishName || `Surah ${number}`,
                    englishNameTranslation:
                      infoData?.englishNameTranslation || "",
                    revelationType: infoData?.revelationType || "Meccan",
                    numberOfAyahs: data.verses.length,
                    ayahs: data.verses.map((v: any, idx: number) => ({
                      number: v.id,
                      text: v.text_warsh || v.text_uthmani || "",
                      numberInSurah: parseInt(
                        v.verse_key?.split(":")[1] || "0",
                      ),
                      page: v.page_number || 1,
                      juz: v.juz_number || infoData?.ayahs?.[idx]?.juz || 1,
                      hizb:
                        v.hizb_number ||
                        infoData?.ayahs?.[idx]?.hizbNumber ||
                        1,
                      manzil:
                        v.manzil_number || infoData?.ayahs?.[idx]?.manzil || 1,
                      ruku: v.ruku_number || infoData?.ayahs?.[idx]?.ruku || 1,
                      sajda: v.sajda || infoData?.ayahs?.[idx]?.sajda || false,
                    })),
                  };
                }
              }
            } catch (e) {
              console.warn("Warsh fallback failed:", e);
            }
          }
        }

        // Final fallback to Uthmani if Warsh failed or if Hafs was requested
        if (!quranData) {
          try {
            const quranRes = await fetchWithTimeout(
              `https://api.alquran.cloud/v1/surah/${number}/quran-uthmani`,
            );
            if (quranRes.ok) {
              const data = await quranRes.json();
              if (data.code === 200 && data.data) {
                quranData = data.data;
              }
            }
          } catch (e) {
            console.warn("Alquran.cloud Uthmani fetch failed:", e);
          }
        }

        // Second fallback to api.quran.com if still no data
        if (!quranData) {
          try {
            const res = await fetchWithTimeout(
              `https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${number}`,
            );
            if (res.ok) {
              const data = await res.json();
              if (data.verses && data.verses.length > 0) {
                const infoData = await fetchSurahInfo(number!);

                quranData = {
                  number: surahNumber,
                  name: infoData?.name || `سورة ${number}`,
                  englishName: infoData?.englishName || `Surah ${number}`,
                  englishNameTranslation:
                    infoData?.englishNameTranslation || "",
                  revelationType: infoData?.revelationType || "Meccan",
                  numberOfAyahs: data.verses.length,
                  ayahs: data.verses.map((v: any) => ({
                    number: v.id,
                    text: v.text_uthmani || "",
                    numberInSurah: parseInt(v.verse_key?.split(":")[1] || "0"),
                    page: v.page_number || 1,
                    juz: v.juz_number || 1,
                    hizb: v.hizb_number || 1,
                    manzil: v.manzil_number || 1,
                    ruku: v.ruku_number || 1,
                    sajda: v.sajda || false,
                  })),
                };
              }
            }
          } catch (e) {
            console.warn("Quran.com Uthmani fallback failed:", e);
          }
        }

        if (!quranData && !surah) {
          // One last attempt: try Uthmani from a different CDN if everything else failed
          try {
            const res = await fetchWithTimeout(
              `https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${number}`,
            );
            if (res.ok) {
              const data = await res.json();
              if (data.verses && data.verses.length > 0) {
                const infoData = await fetchSurahInfo(number!);
                quranData = {
                  number: surahNumber,
                  name: infoData?.name || `سورة ${number}`,
                  englishName: infoData?.englishName || `Surah ${number}`,
                  englishNameTranslation:
                    infoData?.englishNameTranslation || "",
                  revelationType: infoData?.revelationType || "Meccan",
                  numberOfAyahs: data.verses.length,
                  ayahs: data.verses.map((v: any) => ({
                    number: v.id,
                    text: v.text_uthmani || "",
                    numberInSurah: parseInt(v.verse_key?.split(":")[1] || "0"),
                    page: v.page_number || 1,
                    juz: v.juz_number || 1,
                    hizb: v.hizb_number || 1,
                    manzil: v.manzil_number || 1,
                    ruku: v.ruku_number || 1,
                    sajda: v.sajda || false,
                  })),
                };
              }
            }
          } catch (e) {
            console.error("Final fallback failed:", e);
          }
        }

        if (!quranData && !surah) {
          const staticInfo = STATIC_SURAHS.find((s) => s.number === surahNumber);
          if (staticInfo) {
            const startPage = SURAH_START_PAGES[surahNumber - 1] || 1;
            quranData = {
              number: staticInfo.number,
              name: staticInfo.name,
              englishName: staticInfo.englishName,
              englishNameTranslation: staticInfo.englishNameTranslation,
              revelationType: staticInfo.revelationType,
              numberOfAyahs: staticInfo.numberOfAyahs,
              ayahs: Array.from({ length: staticInfo.numberOfAyahs }, (_, idx) => ({
                number: idx + 1,
                numberInSurah: idx + 1,
                text: `آية ${idx + 1}`,
                page: startPage,
                juz: 1,
                hizb: 1,
                manzil: 1,
                ruku: 1,
                sajda: false,
              })),
            };
          }
        }

        if (!quranData && !surah) {
          throw new Error(t("quran_load_failed"));
        }

        if (!isMounted) return;

        // Validate that we got the correct surah
        if (!quranData || quranData.number !== surahNumber) {
          throw new Error(
            `Data mismatch or empty data: requested ${surahNumber}`,
          );
        }

        // Set initial surah data without tafsir first to show verses quickly
        if (quranData && quranData.ayahs && quranData.ayahs.length > 0) {
          setCurrentPageIndex(getInitialPageIndex(quranData));
          setSurah(quranData);
          setLoading(false);
        } else {
          throw new Error("No ayahs found in the surah data");
        }

        // Then fetch tafsir
        try {
          // Check for cached tafsir first from our new Cache API based service
          let tafsirData = await tafsirService.getCachedSurahTafsir(
            surahNumber,
            tafsirType,
          );
          let secondaryTafsirInfo = await tafsirService.getCachedSurahTafsir(
            surahNumber,
            secondaryTafsirType,
          );

          if (!tafsirData || !secondaryTafsirInfo) {
            if (!tafsirData) {
              const tafsirRes = await fetchWithTimeout(
                `https://api.alquran.cloud/v1/surah/${number}/${tafsirType}`,
              );

              if (tafsirRes && tafsirRes.ok) {
                const d = await tafsirRes.json();
                if (d.code === 200) {
                  tafsirData = d.data;
                }
              }
            }

            if (!secondaryTafsirInfo) {
              const secondaryRes = await fetchWithTimeout(
                `https://api.alquran.cloud/v1/surah/${number}/${secondaryTafsirType}`,
              );

              if (secondaryRes && secondaryRes.ok) {
                const d = await secondaryRes.json();
                if (d.code === 200) {
                  secondaryTafsirInfo = d.data;
                }
              }
            }
          }

          if (tafsirData && tafsirData.ayahs && isMounted) {
            // CRITICAL: Merge tafsir text into the existing ayahs array by matching numberInSurah
            const mergedAyahs = quranData.ayahs.map((ayah: any) => {
              // Find the corresponding tafsir ayah by numberInSurah
              const tafsirAyah = tafsirData.ayahs.find(
                (a: any) => a.numberInSurah === ayah.numberInSurah,
              );
              const tafsirText = tafsirAyah?.text;

              // Check if the tafsir text is identical to the verse text (common API fallback)
              // or if the API returned a plain quran text instead of a tafsir (e.g. edition.type === "quran")
              const isFallbackQuran = tafsirData?.edition?.type === "quran" || tafsirData?.edition?.identifier === "quran-simple";
              const isIdentical =
                tafsirText && tafsirText.trim() === ayah.text.trim();

              return {
                ...ayah,
                tafsir:
                  tafsirText && !isIdentical && !isFallbackQuran
                    ? tafsirText
                    : t("tafsir_not_available"),
              };
            });

            const fullData = { ...quranData, ayahs: mergedAyahs };
            setSurah(fullData);

            // Update selectedAyah if it's currently open to reflect the new data
            if (selectedAyah) {
              const updatedSelected = mergedAyahs.find(
                (a: any) => a.numberInSurah === selectedAyah.numberInSurah,
              );
              if (updatedSelected) setSelectedAyah(updatedSelected);
            }

            try {
              safeLocalStorageSetItem(cacheKey, JSON.stringify(fullData));
            } catch (e) {
              console.warn("Failed to cache surah data in localStorage:", e);
            }
          }

          if (secondaryTafsirInfo && isMounted) {
            const isSecFallbackQuran = secondaryTafsirInfo?.edition?.type === "quran" || secondaryTafsirInfo?.edition?.identifier === "quran-simple";
            if (isSecFallbackQuran) {
                setSecondaryTafsirData([]);
            } else {
                setSecondaryTafsirData(secondaryTafsirInfo.ayahs || []);
            }
          }
        } catch (tafsirErr) {
          console.warn("Tafsir fetch failed:", tafsirErr);
        }
      } catch (err) {
        console.error("Error fetching surah:", err);
        if (isMounted) {
          if (!surah) {
            const msg = err instanceof Error ? err.message : "Unknown error";
            setError(`${t("error")} : (${msg})`);
          }
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
      clearTimeout(retryTimeout);
    };
  }, [number, tafsirType, recitation]);

  useEffect(() => {
    if (fullSurahPlaying && fullSurahAudioRef.current && surah) {
      const reciterData = RECITERS.find((r) => r.id === reciter);
      if (reciterData) {
        // Construct multiple possible URLs for fallback
        const surahNumPadded = String(surah.number).padStart(3, "0");
        const sources = [];

        // Source 0: Custom Surah mapping (if provided)
        if (
          (reciterData as any).surahUrls &&
          (reciterData as any).surahUrls[surah.number]
        ) {
          sources.push((reciterData as any).surahUrls[surah.number]);
        }

        // Source 1: Custom Server (if provided)
        if ((reciterData as any).serverUrl) {
          sources.push(
            `${(reciterData as any).serverUrl}${surahNumPadded}.mp3`,
          );
        }

        // Source 2: AlQuran Cloud (Primary)
        if (reciterData.alquranCloudId) {
          sources.push(
            `https://cdn.islamic.network/quran/audio-surah/128/${reciterData.alquranCloudId}/${surah.number}.mp3`,
          );
        }

        // Source 3: QuranicAudio (Fallback)
        if ((reciterData as any).audioPath) {
          sources.push(
            `https://mirrors.quranicaudio.com/quran/${(reciterData as any).audioPath}/${surahNumPadded}.mp3`,
          );
          sources.push(
            `https://download.quranicaudio.com/quran/${(reciterData as any).audioPath}/${surahNumPadded}.mp3`,
          );
        }

        // Function to try to play from the list of sources
        const tryPlay = async (index: number) => {
          if (!fullSurahAudioRef.current) return;

          let currentUrl = index < sources.length ? sources[index] : null;

          if (!currentUrl) {
            setAudioError(
              "عذراً، فشل تحميل ملف الصوت الكامل من جميع المصادر المتوفرة.",
            );
            setFullSurahPlaying(false);
            return;
          }

          let playUrl = currentUrl;
          try {
            const cachedUrl = await audioCacheService.getCachedAudioUrl(currentUrl);
            if (cachedUrl) {
              playUrl = cachedUrl;
            }
          } catch (err) {
            console.warn("Error getting cached audio url:", err);
          }

          if (fullSurahAudioRef.current.src !== playUrl) {
            fullSurahAudioRef.current.src = playUrl;
          }

          try {
            await fullSurahAudioRef.current.play();
          } catch (e: any) {
            console.warn(
              `Full surah playback failed for source ${index}:`,
              currentUrl,
              e,
            );
            if (e.name !== "AbortError") {
              tryPlay(index + 1);
            }
          }
        };

        tryPlay(0);

        return () => {
          // Cleanup if needed
        };
      } else {
        setAudioError("المصحف المرتل غير متوفر لهذا القارئ");
        setFullSurahPlaying(false);
      }
    } else if (!fullSurahPlaying && fullSurahAudioRef.current) {
      fullSurahAudioRef.current.pause();
    }
  }, [fullSurahPlaying, surah, reciter]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (fullSurahAudioRef.current) {
        fullSurahAudioRef.current.pause();
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const themeClasses = {
    light: "bg-white text-slate-900",
    dark: "bg-slate-900 text-slate-100",
    sepia: "bg-[#f4ecd8] text-[#5b4636]",
    parchment: "bg-[#e8dcc4] text-[#4a3b2c]",
    sand: "bg-[#f3ead3] text-[#5c4d3c]",
    slate: "bg-[#1e293b] text-[#cbd5e1]",
    creamyNight: "bg-[#1c1815] text-[#e8dac1]",
  } as Record<string, string>;

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center gap-6">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-teal-600/20 rounded-full" />
          <div className="absolute w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
          <BookOpen className="absolute text-teal-600 scale-125" />
        </div>
        <div className="space-y-2">
          <p className="text-slate-800 dark:text-slate-100 font-black text-xl">
            {t("loading_verses")}
          </p>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {t("loading_takes_time")}
          </p>
        </div>

        {showRetry && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-3 mt-4"
          >
            <p className="text-xs text-red-500 font-bold">
              {t("loading_long_time")}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-all flex items-center gap-2"
              >
                <RefreshCw size={18} />
                {t("retry")}
              </button>
              <button
                onClick={() => {
                  safeLocalStorageRemoveItem(
                    `surah-cache-v3-${number}-${tafsirType}-${recitation}`,
                  );
                  window.location.reload();
                }}
                className="px-6 py-2 bg-red-100 text-red-600 rounded-xl font-bold hover:bg-red-200 transition-all"
              >
                {t("clear_cache")}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center gap-4">
        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-2">
          <X size={32} />
        </div>
        <p className="text-slate-800 dark:text-slate-200 font-bold text-lg">
          {error}
        </p>
        <div className="flex flex-wrap justify-center gap-3 mt-4">
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors"
          >
            {t("retry")}
          </button>
          <button
            onClick={() => {
              safeLocalStorageRemoveItem(
                `surah-cache-v3-${number}-${tafsirType}-${recitation}`,
              );
              window.location.reload();
            }}
            className="px-6 py-2 bg-red-100 text-red-600 rounded-xl font-bold hover:bg-red-200 transition-colors"
          >
            {t("clear_cache")}
          </button>
        </div>
        <BackButton fallbackPath="/quran" />
      </div>
    );

  if (!surah)
    return <div className="p-8 text-center">{t("surah_not_found")}</div>;

  const isPagerMode = viewMode === "mushaf";

  const toggleAudio = async (ayah: Ayah) => {
    if (isPlaying && currentAyahPlaying === ayah.number) {
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
      return;
    }

    if (currentAyahPlaying !== ayah.number) {
      setCurrentAyahRepeat(1);
    }

    const reciterData = RECITERS.find((r) => r.id === reciter);
    if (!reciterData) {
      setAudioError(t("invalid_reciter"));
      return;
    }

    const surahNum = String(surah?.number).padStart(3, "0");
    const ayahNum = String(ayah.numberInSurah).padStart(3, "0");

    // Multi-source primary and fallback URLs
    const sources: string[] = [];

    // Primary: AlQuran Cloud (Islamic Network) - usually the most robust
    if (reciterData.alquranCloudId) {
      sources.push(
        `https://cdn.islamic.network/quran/audio/128/${reciterData.alquranCloudId}/${ayah.number}.mp3`,
      );
      sources.push(
        `https://cdn.islamic.network/quran/audio/64/${reciterData.alquranCloudId}/${ayah.number}.mp3`,
      );
    }

    // Fallbacks: EveryAyah and its mirrors
    if (reciterData.folder) {
      sources.push(
        `https://everyayah.com/data/${reciterData.folder}/${surahNum}${ayahNum}.mp3`,
      );
      sources.push(
        `https://mirrors.quranicaudio.com/everyayah/data/${reciterData.folder}/${surahNum}${ayahNum}.mp3`,
      );
    }

    if (audioRef.current) {
      setAudioError(null);
      isRetryingRef.current = true;
      setCurrentAyahPlaying(ayah.number);
      setIsPlaying(true);

      const tryPlay = async (index: number) => {
        if (!audioRef.current || index >= sources.length) {
          console.error("All audio sources failed for ayah:", ayah.number);
          setAudioError(t("audio_play_error"));
          setIsPlaying(false);
          setCurrentAyahPlaying(null);
          isRetryingRef.current = false;
          return;
        }

        try {
          let playUrl = sources[index];
          try {
            const cachedUrl = await audioCacheService.getCachedAudioUrl(sources[index]);
            if (cachedUrl) {
              playUrl = cachedUrl;
            }
          } catch (err) {
            console.warn("Error getting cached ayah audio:", err);
          }

          audioRef.current.src = playUrl;
          audioRef.current.load();
          audioRef.current.playbackRate = playbackRate;
          await audioRef.current.play();
          isRetryingRef.current = false;
        } catch (err: any) {
          console.warn(`Audio source ${index} failed:`, sources[index], err);
          if (err.name !== "AbortError") {
            await tryPlay(index + 1);
          } else {
            isRetryingRef.current = false;
          }
        }
      };

      await tryPlay(0);
    }
  };

  const downloadAyahAudioUrl = (ayah: Ayah) => {
    const reciterData = RECITERS.find((r) => r.id === reciter);
    if (!reciterData) return "";
    if (reciterData.alquranCloudId) {
      return `https://cdn.islamic.network/quran/audio/128/${reciterData.alquranCloudId}/${ayah.number}.mp3`;
    }
    if (reciterData.folder) {
      const surahNum = String(surah?.number).padStart(3, "0");
      const ayahNum = String(ayah.numberInSurah).padStart(3, "0");
      return `https://everyayah.com/data/${reciterData.folder}/${surahNum}${ayahNum}.mp3`;
    }
    return "";
  };

  const downloadFullSurah = () => {
    const reciterData = RECITERS.find((r) => r.id === reciter);
    if (!reciterData || !surah) return;

    let url = "";
    const surahNumPadded = String(surah.number).padStart(3, "0");

    if (
      (reciterData as any).surahUrls &&
      (reciterData as any).surahUrls[surah.number]
    ) {
      url = (reciterData as any).surahUrls[surah.number];
    } else if ((reciterData as any).serverUrl) {
      url = `${(reciterData as any).serverUrl}${surahNumPadded}.mp3`;
    } else if ((reciterData as any).audioPath) {
      url = `https://mirrors.quranicaudio.com/quran/${(reciterData as any).audioPath}/${surahNumPadded}.mp3`;
    } else {
      url = `https://cdn.islamic.network/quran/audio-surah/128/${reciterData.alquranCloudId}/${surah.number}.mp3`;
    }

    // In an iframe env, programmatic a.click() with a diff origin is often blocked.
    // Use window.open for reliable behavior
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleDownloadAyah = (ayah: Ayah) => {
    setDownloadingAyahId(ayah.number);
    try {
      const url = downloadAyahAudioUrl(ayah);
      if (!url) return;
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      console.warn("Download failed:", err);
    } finally {
      setTimeout(() => setDownloadingAyahId(null), 1000);
    }
  };

  const copyAyah = async (ayah: Ayah) => {
    const text = `﷽\n\n﴿ ${ayah.text} ﴾\n\n📖 *[ سورة ${surah?.name?.replace('سورة ', '') || ''} - الآية ${ayah.numberInSurah} ]*\n\n— تمت المشاركة عبر تطبيق أذكار المؤمن`;
    await copyTextToClipboard(text);
    setCopiedAyahId(ayah.number);
    setTimeout(() => {
      setCopiedAyahId(null);
    }, 2000);
  };

  const handleAIInsights = async (ayah: Ayah) => {
    if (loadingAI) return;
    setLoadingAI(true);
    setAiInsights(null);
    setShowAIModal(true);

    try {
      const insights = await getAIInsights(
        ayah.text,
        ayah.tafsir || "",
        surah?.name || "",
        ayah.numberInSurah,
      );
      setAiInsights(insights);
    } catch (error) {
      setAiInsights(
        "عذراً، حدث خطأ أثناء جلب القبسات الذكية. يرجى المحاولة لاحقاً.",
      );
    } finally {
      setLoadingAI(false);
    }
  };

  const shareAyah = async (ayah: Ayah) => {
    const text = `﷽\n\n﴿ ${ayah.text} ﴾\n\n📖 *[ سورة ${surah?.name?.replace('سورة ', '') || ''} - الآية ${ayah.numberInSurah} ]*\n\n— تمت المشاركة عبر تطبيق أذكار المؤمن`;
    
    await shareContent(t("ayah_of_quran"), text, window.location.href);
    
    setSharedAyahId(ayah.number);
    setTimeout(() => {
      setSharedAyahId(null);
    }, 2000);
  };

  const playNextAyah = () => {
    if (!surah || currentAyahPlaying === null) return;

    const currentIndex = surah.ayahs.findIndex(
      (a) => a.number === currentAyahPlaying,
    );
    if (currentIndex !== -1 && currentIndex < surah.ayahs.length - 1) {
      const nextAyah = surah.ayahs[currentIndex + 1];

      // If it's on a different page, navigate to it visually
      const nextPage = nextAyah.page;
      if (nextPage !== extendedPages[currentPageIndex]?.[0]) {
        const nextIdx = extendedPages.findIndex(
          (p) => p[0] === nextPage && Array.isArray(p[1]),
        );
        if (nextIdx !== -1) {
          setCurrentPageIndex(nextIdx);
        }
      }

      // Handle scrolling in vertical mode
      if (viewMode === "vertical") {
        const element = document.getElementById(
          `ayah-${nextAyah.numberInSurah}`,
        );
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }

      toggleAudio(nextAyah);
    } else {
      // reached end of surah
      if (rangeRepeatCount === 0 || currentRangeRepeat < rangeRepeatCount) {
        setCurrentRangeRepeat((prev) => prev + 1);
        // restart surah
        const firstAyah = surah.ayahs[0];
        const firstPage = firstAyah.page;
        const firstIdx = extendedPages.findIndex(
          (p) => p[0] === firstPage && Array.isArray(p[1]),
        );
        if (firstIdx !== -1) setCurrentPageIndex(firstIdx);

        toggleAudio(firstAyah);
      } else {
        setCurrentRangeRepeat(1);
        if (autoNextSurah && surah.number < 114) {
          const nextNum = surah.number + 1;
          navigate(`/quran/${nextNum}?from=prev`);
        } else {
          setIsPlaying(false);
          setCurrentAyahPlaying(null);
        }
      }
    }
  };

  const handleRibbonClick = (pageNum: number) => {
    const isBookmarked = (bookmark?.surah === surah?.number && bookmark?.page === pageNum) || (bookmarks?.some(b => b.surah === surah?.number && b.page === pageNum));
    if (isBookmarked) {
      setBookmarks(
        (bookmarks || []).filter(
          (b) => !(b.surah === surah?.number && b.page === pageNum),
        ),
      );
      if (bookmark?.surah === surah?.number && bookmark?.page === pageNum) setBookmark(null);
    } else {
      if (!surah) return;
      const juzMatch = surah.ayahs.find(a => a.page === pageNum)?.juz || 1;
      const hizbMatch = surah.ayahs.find(a => a.page === pageNum)?.hizb || 1;
      const newBookmark = {
        id: Math.random().toString(36).substr(2, 9),
        surah: surah.number,
        page: pageNum,
        juz: juzMatch,
        hizb: hizbMatch,
        surahName: surah.name,
        type: "general" as const,
        note: "",
        dateAdded: new Date().toISOString(),
      };
      setBookmarks([...(bookmarks || []), newBookmark]);
    }
  };

  return (
    <div
      className={cn(
        "w-full h-full overflow-hidden flex flex-col pb-0 transition-colors duration-300",
        themeClasses[theme],
        theme === "dark" || theme === "slate" ? "force-dark" : "force-light",
      )}
      style={{
        backgroundImage:
          theme !== "light" && theme !== "dark"
            ? TAFSIR_THEMES[theme]?.texture
            : undefined,
      }}
    >
      <audio
        ref={fullSurahAudioRef}
        preload="none"
        onEnded={() => setFullSurahPlaying(false)}
        onPlay={() => {
          setIsFullSurahPaused(false);
          // Stop verse-by-verse if full surah starts
          setIsPlaying(false);
          setCurrentAyahPlaying(null);
        }}
        onPause={() => setIsFullSurahPaused(true)}
      />
      <audio
        ref={audioRef}
        preload="auto"
        onEnded={() => {
          if (currentAyahRepeat < ayahRepeatCount) {
            setCurrentAyahRepeat((prev) => prev + 1);
            if (audioRef.current) {
              audioRef.current.currentTime = 0;
              audioRef.current.playbackRate = playbackRate;
              audioRef.current.play().catch((err) => {
                if (err.name !== "AbortError")
                  console.warn("Audio repeat failed:", err);
              });
            }
          } else {
            setCurrentAyahRepeat(1);
            if (autoPlay) {
              if (ayahInterval > 0) {
                setTimeout(() => {
                  playNextAyah();
                }, ayahInterval * 1000);
              } else {
                playNextAyah();
              }
            } else {
              setIsPlaying(false);
              setCurrentAyahPlaying(null);
            }
          }
        }}
        onPlay={() => {
          // Stop full surah if verse-by-verse starts
          setFullSurahPlaying(false);
        }}
        onError={() => {
          if (isRetryingRef.current) return;
          setIsPlaying(false);
          setCurrentAyahPlaying(null);
        }}
      />
      <div
        className="w-full mx-auto relative h-full flex flex-col flex-1 min-h-0"
      >
        <AnimatePresence>
          {focusMode && (
            <motion.button
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 0.2, y: 0 }}
              whileHover={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              onClick={() => setFocusMode(false)}
              className="fixed top-6 left-6 z-[200] p-3 bg-black/40 dark:bg-white/20 text-white backdrop-blur-md rounded-full shadow-2xl hover:scale-105 transition-all"
              title="إيقاف وضع التركيز"
            >
              <Focus size={24} />
            </motion.button>
          )}
        </AnimatePresence>
        {/* Invisible trigger area at the top to show controls when they are hidden */}
        {(!showControls || focusMode) && (
          <div 
            className="fixed top-0 left-0 right-0 h-20 z-[120] cursor-pointer" 
            onClick={(e) => {
              e.stopPropagation();
              setShowControls(true);
              setFocusMode(false);
            }}
          />
        )}
        <div
          className={cn(
            "quran-viewer-header sticky top-0 transition-all duration-500 transform z-[110] shrink-0 flex flex-col w-full translate-y-0 opacity-100"
          )}
        >
          <header
            style={{ paddingTop: 'env(safe-area-inset-top)' }}
            className={cn(
              "w-full backdrop-blur-[20px] py-2 sm:py-3 px-3 sm:px-6 flex justify-between items-center border-b shadow-sm",
              isPagerMode ? "w-full" : "rounded-b-[1.5rem]",
              theme === "dark" ? "bg-slate-950/80 border-slate-800/40" :
              theme === "creamyNight" ? "bg-[#1c1815]/90 border-[#25211d]/50" :
              theme === "sepia" ? "bg-[#e8dcc4]/85 border-[#d4c5a7]/50" :
              theme === "parchment" ? "bg-[#e8dcc4]/85 border-[#d4c1a5]/50" :
              theme === "sand" ? "bg-[#f3ead3]/85 border-[#e2d5b5]/50" :
              theme === "slate" ? "bg-[#1e293b]/80 border-slate-800/45" :
              "bg-white/80 border-slate-200/50"
            )}
          >
            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 h-0.5 bg-teal-500/30 w-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${((currentPageIndex + 1) / pages.length) * 100}%`,
                }}
                className="h-full bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.5)]"
              />
            </div>
            <div className="flex items-center gap-2.5">
              <BackButton fallbackPath="/quran" />
              <div className="flex flex-col justify-center">
                <h1
                  className="text-sm sm:text-base font-black transition-all duration-500 flex items-center gap-1.5"
                  style={{
                    color: settings.primaryColor.includes("gradient")
                      ? settings.primaryColor.match(/#[a-fA-F0-9]{6}/)?.[0] ||
                        "#0d9488"
                      : settings.primaryColor,
                  }}
                >
                  {surah.name}
                  <div className="w-1 h-1 rounded-full bg-teal-500/40 animate-pulse hidden xs:block" />
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Modern Page & Juz' Badge (Moved near settings/audio) */}
              <div className="flex items-center bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 dark:border-emerald-400/20 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-2xl shadow-sm select-none mr-2">
                <div className="flex items-center gap-1.5">
                  <div className="relative w-6 h-6 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="16" fill="none" className="stroke-emerald-500/20" strokeWidth="3" />
                      <circle 
                        cx="18" cy="18" r="16" fill="none" 
                        className="stroke-emerald-600 dark:stroke-emerald-400" 
                        strokeWidth="3" 
                        strokeDasharray="100" 
                        strokeDashoffset={100 - (((currentPageIndex + 1) / pages.length) * 100)} 
                        strokeLinecap="round" 
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-emerald-700 dark:text-emerald-100">
                      {Math.round(((currentPageIndex + 1) / pages.length) * 100)}%
                    </span>
                  </div>
                  <div className="flex flex-col justify-center">
                    <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 leading-none">
                      الصفحة {pages[currentPageIndex]?.[0] || "1"}
                    </span>
                    <span className="text-[8px] font-bold text-emerald-700/70 dark:text-emerald-100/70 leading-none mt-0.5">
                      الجزء {pages[currentPageIndex]?.[1]?.[0]?.juz || "1"}
                    </span>
                  </div>
                </div>
              </div>

              {surah && (
                <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 bg-teal-500/10 dark:bg-teal-500/20 rounded-xl mr-2 transform transition-all duration-75 active:scale-[0.95] active:opacity-80">
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] font-black text-teal-600 dark:text-teal-400 leading-none">
                      الإنجاز
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 leading-none mt-0.5">
                      {readAyahs.length}/{surah.ayahs.length}
                    </span>
                  </div>
                  <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(readAyahs.length / (surah?.ayahs.length || 1)) * 100}%`,
                      }}
                      className="h-full bg-teal-500"
                    />
                  </div>
                </div>
              )}

              {/* Quick Theme Toggle */}
              <button
                onClick={() => {
                  const themes: ("light" | "creamyNight" | "dark" | "sepia")[] = ["light", "creamyNight", "dark", "sepia"];
                  let nextIndex = themes.indexOf(theme as any) + 1;
                  if (nextIndex >= themes.length) nextIndex = 0;
                  setTheme(themes[nextIndex]);
                }}
                className={cn(
                  "group p-2.5 rounded-2xl transition-all duration-75 active:scale-[0.85] active:opacity-70 duration-300 shrink-0 backdrop-blur-md border shadow-sm flex items-center justify-center",
                  theme === "dark" 
                    ? "bg-slate-800 text-slate-200 border-slate-700" 
                    : theme === "creamyNight"
                      ? "bg-[#25211d] text-[#e8dac1] border-[#38322c]"
                      : theme === "sepia" 
                        ? "bg-[#e8dcc4] text-[#7c6a46] border-[#d4c5a7]"
                        : "bg-white text-slate-800 border-slate-200"
                )}
                title="تغيير وضع القراءة (أبيض، عاجي، داكن، ورقي)"
              >
                {theme === "dark" ? (
                  <Moon size={20} className="group-hover:rotate-12 transition-transform" />
                ) : theme === "creamyNight" ? (
                  <Sparkles size={20} className="group-hover:rotate-12 transition-transform" />
                ) : theme === "sepia" ? (
                  <BookOpen size={20} className="group-hover:rotate-12 transition-transform" />
                ) : (
                  <Sun size={20} className="group-hover:rotate-12 transition-transform" />
                )}
              </button>

              {/* Quick Audio Play Button in Header */}
              {surah && (
                <button
                  id="mushaf-header-play-btn"
                  onClick={() => {
                    if (isPlaying) {
                      if (audioRef.current) {
                        audioRef.current.pause();
                        setIsPlaying(false);
                      }
                    } else {
                      let targetAyah = null;
                      if (currentAyahPlaying) {
                        targetAyah = surah.ayahs.find(
                          (a) => a.number === currentAyahPlaying,
                        );
                      }
                      if (!targetAyah) {
                        const pageData = extendedPages[currentPageIndex];
                        if (
                          pageData &&
                          Array.isArray(pageData[1]) &&
                          pageData[1].length > 0
                        ) {
                          targetAyah = pageData[1][0];
                        }
                      }
                      if (targetAyah) {
                        setAutoPlay(true);
                        toggleAudio(targetAyah);
                      }
                    }
                  }}
                  className={cn(
                    "group p-2.5 rounded-2xl transition-all duration-75 active:scale-[0.85] active:opacity-70 duration-300 shrink-0 backdrop-blur-md border shadow-sm flex items-center justify-center",
                    isPlaying
                      ? "bg-rose-500 text-white border-rose-400 hover:bg-rose-600 shadow-lg shadow-rose-500/20"
                      : "bg-teal-500 text-white border-teal-400 hover:bg-teal-600 shadow-lg shadow-teal-500/20",
                  )}
                  title={
                    isPlaying ? "إيقاف مؤقت" : "تشغيل الصوت من الصفحة الحالية"
                  }
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline px-1">
                      {isPlaying ? "إيقاف" : "استماع القارئ"}
                    </span>
                    {isPlaying ? (
                      <Pause size={20} className="animate-pulse" />
                    ) : (
                      <Volume2
                        size={20}
                        className="group-hover:scale-110 transition-transform"
                      />
                    )}
                  </div>
                </button>
              )}

              {/* Modern Side Menu Toggle - Now the primary hub */}
              <button
                onClick={() => setShowSideMenu(true)}
                className={cn(
                  "group p-2.5 rounded-2xl transition-all duration-75 active:scale-[0.85] active:opacity-70 duration-300 shrink-0 backdrop-blur-md border shadow-sm",
                  "bg-teal-500 text-white border-teal-400 hover:bg-teal-600 shadow-lg shadow-teal-500/20",
                )}
                title="خيارات القراءة"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline px-1">
                    الخيارات
                  </span>
                  <Menu
                    size={20}
                    className="group-hover:scale-110 transition-transform"
                  />
                </div>
              </button>
            </div>
          </header>

        </div>

        {/* Side Menu Drawer */}
        <AnimatePresence>
          {showSideMenu && (
            <motion.div 
              key="side-menu-drawer-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[500] overflow-hidden" 
              dir="rtl"
            >
              <div
                onClick={() => setShowSideMenu(false)}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              />

              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className={cn(
                  "absolute top-0 right-0 h-full w-[280px] sm:w-[320px] shadow-2xl flex flex-col border-l z-50",
                  themeClasses[theme] || "bg-white",
                )}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="p-6 border-b border-black/5 shrink-0">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-black text-lg">خيارات السورة</h2>
                    <button
                      onClick={() => setShowSideMenu(false)}
                      className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <div className="p-4 bg-teal-500/10 rounded-2xl">
                    <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest leading-none mb-2">
                      إنجاز القراءة
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="flex-grow h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${(readAyahs.length / (surah?.ayahs.length || 1)) * 100}%`,
                          }}
                          className="h-full bg-teal-500"
                        />
                      </div>
                      <span className="text-[10px] font-bold text-slate-500">
                        {readAyahs.length}/{surah?.ayahs.length}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-grow overflow-y-auto p-4 custom-scrollbar space-y-6 pb-20">
                  {/* Surah Quick Switcher */}
                  <div className="space-y-3">
                    <p className="px-2 text-[10px] font-black text-teal-600 uppercase tracking-widest">
                      تصفح سريع
                    </p>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => markSurahAsCompleted()}
                        className={cn(
                          "w-full flex items-center gap-3 p-3.5 rounded-2xl transition-all group text-right",
                          isSurahCompleted
                            ? "bg-green-500 text-white"
                            : "bg-green-500/10 text-green-600 hover:bg-green-500 hover:text-white",
                        )}
                      >
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                          <CheckCircle2 size={20} />
                        </div>
                        <div className="flex-grow text-right">
                          <p className="font-black text-sm">
                            ختم السورة الحالية
                          </p>
                          <p className={cn("text-[10px] font-bold opacity-70")}>
                            تحديث حالة الإنجاز
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <p className="px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      طريقة العرض
                    </p>
                    {viewMode === "mushaf" && (
                      <div className="p-2 bg-black/5 dark:bg-white/5 rounded-2xl space-y-1.5 mb-2">
                        <p className="px-1 text-[9px] font-black text-teal-600 dark:text-teal-400">
                          نظام عرض صفحات المصحف:
                        </p>
                        <div className="grid grid-cols-3 gap-1">
                          {[
                            { id: "double", label: "صفحتين" },
                            { id: "single", label: "صفحة" },
                            { id: "auto", label: "تلقائي" },
                          ].map((mode) => (
                            <button
                              key={mode.id}
                              onClick={() => setMushafDisplayMode(mode.id as any)}
                              className={cn(
                                "py-1.5 px-2 rounded-xl text-[10px] font-black transition-all text-center",
                                mushafDisplayMode === mode.id
                                  ? "bg-teal-500 text-white shadow-sm"
                                  : "bg-white/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800"
                              )}
                            >
                              {mode.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    <button
                      onClick={() => {
                        setViewMode(
                          viewMode === "mushaf" ? "vertical" : "mushaf",
                        );
                        setShowSideMenu(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 p-3.5 rounded-2xl transition-all group text-right",
                        viewMode === "mushaf"
                          ? "bg-teal-500 text-white"
                          : "hover:bg-black/5 dark:hover:bg-white/5",
                      )}
                    >
                      <div
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                          viewMode === "mushaf"
                            ? "bg-white/20"
                            : "bg-black/5 dark:bg-white/5",
                        )}
                      >
                        <Layout size={20} />
                      </div>
                      <div className="flex-grow">
                        <p className="font-black text-sm">تبديل وضع العرض</p>
                        <p
                          className={cn(
                            "text-[10px] font-bold",
                            viewMode === "mushaf"
                              ? "text-white/70"
                              : "text-slate-400",
                          )}
                        >
                          {viewMode === "mushaf"
                            ? "بدء القراءة الرأسية"
                            : "بدء القراءة بنظام المصحف"}
                        </p>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setFocusMode(!focusMode);
                        setShowSideMenu(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 p-3.5 rounded-2xl transition-all group text-right mt-2",
                        focusMode
                          ? "bg-amber-500 text-white"
                          : "hover:bg-black/5 dark:hover:bg-white/5",
                      )}
                    >
                      <div
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                          focusMode
                            ? "bg-white/20"
                            : "bg-black/5 dark:bg-white/5",
                        )}
                      >
                        <Focus size={20} />
                      </div>
                      <div className="flex-grow">
                        <p className="font-black text-sm">وضع التركيز</p>
                        <p
                          className={cn(
                            "text-[10px] font-bold",
                            focusMode
                              ? "text-white/70"
                              : "text-slate-400",
                          )}
                        >
                          {focusMode
                            ? "إيقاف وضع التركيز"
                            : "إخفاء المشتتات والتركيز على النص"}
                        </p>
                      </div>
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <p className="px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      القراءة والتتبع
                    </p>

                    <button
                      onClick={() => {
                        toggleCurrentPageRead();
                        setShowSideMenu(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 p-3.5 rounded-2xl transition-all group text-right",
                        isPageRead
                          ? "bg-emerald-500 text-white"
                          : "hover:bg-emerald-500/10 hover:text-emerald-600",
                      )}
                    >
                      <div
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                          isPageRead
                            ? "bg-white/20"
                            : "bg-emerald-500/10 text-emerald-600",
                        )}
                      >
                        {isPageRead ? (
                          <CheckCircle2 size={20} />
                        ) : (
                          <Check size={20} />
                        )}
                      </div>
                      <div className="flex-grow">
                        <p className="font-black text-sm">
                          {isPageRead
                            ? "تمت قراءة الصفحة"
                            : "تحديد الصفحة كمقروءة"}
                        </p>
                        <p
                          className={cn(
                            "text-[10px] font-bold",
                            isPageRead ? "text-white/70" : "text-slate-400",
                          )}
                        >
                          تتبع تقدمك في الختمة
                        </p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        toggleBookmark();
                        setShowSideMenu(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 p-3.5 rounded-2xl transition-all group text-right",
                        isBookmarked
                          ? "bg-amber-500 text-white"
                          : "hover:bg-amber-500/10 hover:text-amber-600",
                      )}
                    >
                      <div
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                          isBookmarked
                            ? "bg-white/20"
                            : "bg-amber-500/10 text-amber-600",
                        )}
                      >
                        {isBookmarked ? (
                          <BookmarkCheck size={20} />
                        ) : (
                          <Bookmark size={20} />
                        )}
                      </div>
                      <div className="flex-grow">
                        <p className="font-black text-sm">
                          {isBookmarked
                            ? "هذه الصفحة في المفضلة"
                            : "إضافة للمفضلة"}
                        </p>
                        <p
                          className={cn(
                            "text-[10px] font-bold",
                            isBookmarked ? "text-white/70" : "text-slate-400",
                          )}
                        >
                          الرجوع إليها لاحقاً بسهولة
                        </p>
                      </div>
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <p className="px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      الصوتيات والتحميل
                    </p>

                    <button
                      id="drawer-play-current-page-btn"
                      onClick={() => {
                        if (isPlaying) {
                          if (audioRef.current) {
                            audioRef.current.pause();
                            setIsPlaying(false);
                          }
                        } else {
                          const pageData = extendedPages[currentPageIndex];
                          if (
                            pageData &&
                            Array.isArray(pageData[1]) &&
                            pageData[1].length > 0
                          ) {
                            const firstAyah = pageData[1][0];
                            setFullSurahPlaying(false);
                            setAutoPlay(true);
                            toggleAudio(firstAyah);
                          }
                        }
                        setShowSideMenu(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 p-3.5 rounded-2xl transition-all group text-right",
                        isPlaying
                          ? "bg-teal-500 text-white shadow-lg shadow-teal-500/20"
                          : "hover:bg-indigo-500/10 hover:text-indigo-600",
                      )}
                    >
                      <div
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                          isPlaying
                            ? "bg-white/20"
                            : "bg-teal-500/10 text-teal-600",
                        )}
                      >
                        {isPlaying ? (
                          <Pause size={20} />
                        ) : (
                          <Volume2 size={20} />
                        )}
                      </div>
                      <div className="flex-grow">
                        <p className="font-black text-sm">
                          الاستماع من الصفحة الحالية
                        </p>
                        <p
                          className={cn(
                            "text-[10px] font-bold",
                            isPlaying ? "text-white/70" : "text-slate-400",
                          )}
                        >
                          تلاوة متواصلة تبدأ من القارئ
                        </p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setFullSurahPlaying(!fullSurahPlaying);
                        setShowSideMenu(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 p-3.5 rounded-2xl transition-all group text-right",
                        fullSurahPlaying
                          ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                          : "hover:bg-indigo-500/10 hover:text-indigo-600",
                      )}
                    >
                      <div
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                          fullSurahPlaying
                            ? "bg-white/20"
                            : "bg-indigo-500/10 text-indigo-600",
                        )}
                      >
                        {fullSurahPlaying ? (
                          <Pause size={20} />
                        ) : (
                          <Play size={20} />
                        )}
                      </div>
                      <div className="flex-grow">
                        <p className="font-black text-sm">الاستماع للسورة</p>
                        <p
                          className={cn(
                            "text-[10px] font-bold",
                            fullSurahPlaying
                              ? "text-white/70"
                              : "text-slate-400",
                          )}
                        >
                          بصوت {RECITERS.find((r) => r.id === reciter)?.name}
                        </p>
                      </div>
                    </button>

                    <div className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-3xl p-4 space-y-3.5 mt-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Download size={16} className="text-teal-500 animate-bounce" />
                          <h4 className="font-black text-xs text-slate-800 dark:text-slate-200">التحميل والعمل أوفلاين</h4>
                        </div>
                        {(isOfflineTextDownloaded || isOfflineAudioDownloaded) && (
                          <button
                            onClick={handleDeleteOfflineCache}
                            className="p-1.5 hover:bg-rose-500/10 text-rose-500 rounded-lg transition-colors"
                            title="حذف المحتوى المخزن"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>

                      {/* Status Badges */}
                      <div className="grid grid-cols-2 gap-2 text-[9px] font-black">
                        <div className={cn(
                          "flex items-center justify-center gap-1 p-1.5 rounded-xl border transition-all",
                          isOfflineTextDownloaded 
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
                            : "bg-slate-500/5 text-slate-400 border-transparent"
                        )}>
                          {isOfflineTextDownloaded ? <Check size={10} /> : null}
                          النص والتفسير
                        </div>
                        <div className={cn(
                          "flex items-center justify-center gap-1 p-1.5 rounded-xl border transition-all",
                          isOfflineAudioDownloaded 
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
                            : "bg-slate-500/5 text-slate-400 border-transparent"
                        )}>
                          {isOfflineAudioDownloaded ? <Check size={10} /> : null}
                          تلاوة القارئ
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="space-y-2 pt-1">
                        {!isOfflineTextDownloaded && (
                          <button
                            onClick={handleDownloadTextOffline}
                            disabled={textDownloadLoading}
                            className="w-full flex items-center justify-center gap-2 py-2.5 bg-teal-500/10 hover:bg-teal-500/20 text-teal-600 dark:text-teal-400 rounded-xl text-xs font-black transition-all"
                          >
                            {textDownloadLoading ? (
                              <RefreshCw size={14} className="animate-spin" />
                            ) : (
                              <Download size={14} />
                            )}
                            تحميل النص والتفسير أوفلاين
                          </button>
                        )}

                        {!isOfflineAudioDownloaded && (
                          <div className="space-y-2">
                            <button
                              onClick={handleDownloadAudioOffline}
                              disabled={audioDownloadLoading}
                              className="w-full flex items-center justify-center gap-2 py-2.5 bg-teal-500 text-white hover:bg-teal-600 rounded-xl text-xs font-black transition-all shadow-md shadow-teal-500/15"
                            >
                              {audioDownloadLoading ? (
                                <RefreshCw size={14} className="animate-spin" />
                              ) : (
                                <Download size={14} />
                              )}
                              تحميل التلاوة بصوت {RECITERS.find(r => r.id === reciter)?.name}
                            </button>
                            
                            {audioDownloadLoading && audioDownloadProgress !== null && (
                              <div className="space-y-1">
                                <div className="flex justify-between text-[9px] text-teal-600 dark:text-teal-400 font-bold">
                                  <span>جاري التحميل...</span>
                                  <span>{Math.round(audioDownloadProgress)}%</span>
                                </div>
                                <div className="h-1 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${audioDownloadProgress}%` }}
                                    className="h-full bg-teal-500"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {isOfflineTextDownloaded && isOfflineAudioDownloaded && (
                          <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-500 justify-center py-1">
                            <CheckCircle2 size={14} />
                            جاهز تماماً للعمل أوفلاين
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <p className="px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      أدوات إضافية
                    </p>

                    <button
                      onClick={() => {
                        setShowSurahInfo(true);
                        setShowSideMenu(false);
                      }}
                      className="w-full flex items-center gap-3 p-3.5 rounded-2xl hover:bg-slate-500/10 hover:text-slate-600 transition-all group text-right"
                    >
                      <div className="w-10 h-10 rounded-xl bg-slate-500/10 flex items-center justify-center text-slate-500 shrink-0 group-hover:scale-110 transition-transform">
                        <Info size={20} />
                      </div>
                      <div className="flex-grow">
                        <p className="font-black text-sm">معلومات السورة</p>
                        <p className="text-[10px] font-bold text-slate-400">
                          فضلها وتاريخ نزولها
                        </p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setShowSettings(true);
                        setShowSideMenu(false);
                      }}
                      className="w-full flex items-center gap-3 p-3.5 rounded-2xl hover:bg-teal-500 hover:text-white transition-all group text-right shadow-sm border border-black/5 bg-teal-50 dark:bg-teal-900/10"
                    >
                      <div className="w-10 h-10 rounded-xl bg-teal-500 text-white flex items-center justify-center shrink-0 group-hover:rotate-45 transition-transform shadow-lg shadow-teal-500/20">
                        <Settings size={20} />
                      </div>
                      <div className="flex-grow">
                        <p className="font-black text-sm">إعدادات المصحف</p>
                        <p className="text-[10px] font-bold opacity-70">
                          الخط، الألوان، والتفسير
                        </p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        handleSharePage();
                        setShowSideMenu(false);
                      }}
                      className="w-full flex items-center gap-3 p-3.5 rounded-2xl hover:bg-blue-500/10 hover:text-blue-600 transition-all group text-right"
                    >
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 shrink-0 group-hover:scale-110 transition-transform">
                        <Share size={20} />
                      </div>
                      <div className="flex-grow">
                        <p className="font-black text-sm">مشاركة الصفحة</p>
                        <p className="text-[10px] font-bold text-slate-400">
                          انشر الخير مع أصدقائك
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="flex-grow overflow-y-auto p-4 custom-scrollbar space-y-4 pt-10 border-t border-black/5">
                  <p className="px-2 text-[10px] font-black text-teal-600 uppercase tracking-widest">
                    إعدادات القراءة
                  </p>

                  {/* Recitation Selection */}
                  <div className="space-y-2">
                    <p className="px-2 text-[10px] font-bold text-slate-500">
                      نوع المصحف
                    </p>
                    <div className="flex flex-col gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-2xl">
                      {[
                        { id: "hafs", name: "مصحف حفص", recitation: "uthmani" },
                        { id: "warsh", name: "مصحف ورش", recitation: "warsh" },
                        { id: "tajweed", name: "مصحف التجويد", recitation: "uthmani" },
                      ].map((ed) => (
                        <button
                          key={ed.id}
                          onClick={() => {
                            setMushafEdition(ed.id as any);
                            setRecitation(ed.recitation as any);
                          }}
                          className={cn(
                            "py-2.5 px-4 rounded-xl text-xs font-black transition-all text-right",
                            mushafEdition === ed.id
                              ? "bg-white dark:bg-slate-700 text-teal-600 shadow-sm"
                              : "text-slate-500",
                          )}
                        >
                          {ed.name}
                        </button>
                      ))}
                    </div>
                    {mushafEdition === "tajweed" && (
                      <button
                        onClick={() => {
                          setIsTajweedGuideOpen(true);
                          setShowSideMenu(false);
                        }}
                        className="w-full mt-2 flex items-center justify-center gap-2 p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all text-xs font-black cursor-pointer border border-emerald-500/20 shadow-sm"
                      >
                        <Highlighter size={14} className="text-emerald-500" />
                        <span>فتح مساعد ومفتاح التجويد</span>
                      </button>
                    )}
                  </div>

                  {/* Font Size Slider */}
                  <div className="space-y-3 bg-black/5 dark:bg-white/5 p-4 rounded-2xl">
                    <div className="flex justify-between items-center">
                      <p className="text-[10px] font-bold text-slate-500">
                        حجم الخط
                      </p>
                      <span className="text-[10px] font-black text-teal-600 bg-white dark:bg-slate-800 px-2 py-1 rounded-lg">
                        {fontSize}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min="14"
                      max="50"
                      value={fontSize}
                      onChange={(e) => setFontSize(parseInt(e.target.value))}
                      className="w-full accent-teal-500 h-1 rounded-full cursor-pointer"
                    />
                  </div>

                  {/* Font Family */}
                  <div className="space-y-2">
                    <p className="px-2 text-[10px] font-bold text-slate-500">
                      نوع الخط
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {QURAN_FONTS.slice(0, 4).map((f) => (
                        <button
                          key={f.id}
                          onClick={() => setFontFamily(f.id)}
                          className={cn(
                            "p-3 rounded-2xl border-2 transition-all text-[11px] font-bold text-center",
                            fontFamily === f.id
                              ? "border-teal-500 bg-white dark:bg-slate-700 text-teal-600"
                              : "border-transparent bg-black/5 dark:bg-white/5 text-slate-400",
                          )}
                          style={{ fontFamily: f.id }}
                        >
                          {f.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Theme Colors */}
                  <div className="space-y-2">
                    <p className="px-2 text-[10px] font-bold text-slate-500">
                      لون الصفحة
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "light", name: "أبيض" },
                        { id: "dark", name: "ليلي" },
                        { id: "creamyNight", name: "مريح (ليلي)" },
                        { id: "sepia", name: "ورق مريح للعين" },
                        { id: "parchment", name: "مخطوط" },
                        { id: "sand", name: "صحراوي" },
                        { id: "slate", name: "داكن" },
                      ].map((th) => (
                        <button
                          key={th.id}
                          onClick={() => setTheme(th.id as any)}
                          className={cn(
                            "py-2 px-1 rounded-xl border-2 transition-all text-[10px] font-black text-center",
                            theme === th.id
                              ? "border-teal-500 bg-white dark:bg-slate-700 text-teal-600"
                              : "border-transparent bg-black/5 dark:bg-white/5 text-slate-400",
                          )}
                        >
                          {th.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-black/5 shrink-0 bg-black/5 dark:bg-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-600">
                      <Sparkles size={14} />
                    </div>
                    <p className="text-[7px] font-black uppercase text-teal-600 dark:text-teal-400 drop-shadow-md opacity-100">
                      تطبيق المؤمن - القران الكريم
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showSurahInfo && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-24 left-4 right-4 z-[400]"
            >
              <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-black/5 dark:border-white/5 max-w-md mx-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-black flex items-center gap-2">
                    <Info size={18} className="text-teal-500" />
                    عن سورة {surah.name}
                  </h3>
                  <button
                    onClick={() => setShowSurahInfo(false)}
                    className="w-10 h-10 bg-rose-500 text-white rounded-full flex items-center justify-center hover:bg-rose-600 transform transition-all duration-75 active:scale-[0.85] active:opacity-70 shadow-lg shadow-rose-500/20"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/5 dark:bg-white/5 p-4 rounded-2xl">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                      عدد الآيات
                    </p>
                    <p className="text-xl font-black">{surah.numberOfAyahs}</p>
                  </div>
                  <div className="bg-black/5 dark:bg-white/5 p-4 rounded-2xl">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                      مكان النزول
                    </p>
                    <p className="text-xl font-black">
                      {surah.revelationType === "Meccan" ? "مكية" : "مدنية"}
                    </p>
                  </div>
                  <div className="bg-black/5 dark:bg-white/5 p-4 rounded-2xl">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                      الترتيب
                    </p>
                    <p className="text-xl font-black">{surah.number}</p>
                  </div>
                  <div className="bg-black/5 dark:bg-white/5 p-4 rounded-2xl">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                      الاسم الإنجليزي
                    </p>
                    <p className="text-lg font-black">{surah.englishName}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <SettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          t={t}
          activeTab={activeSettingsTab}
          setActiveTab={setActiveSettingsTab}
          theme={theme}
          themeClasses={themeClasses}
          mushafEdition={mushafEdition}
          setMushafEdition={setMushafEdition}
          mushafDisplayMode={mushafDisplayMode}
          setMushafDisplayMode={setMushafDisplayMode}
          keepScreenAwake={keepScreenAwake}
          setKeepScreenAwake={setKeepScreenAwake}
          mushafZoom={mushafZoom}
          setMushafZoom={setMushafZoom}
          autoPlay={autoPlay}
          setAutoPlay={setAutoPlay}
          ayahRepeatCount={ayahRepeatCount}
          setAyahRepeatCount={setAyahRepeatCount}
          playbackRate={playbackRate}
          setPlaybackRate={setPlaybackRate}
          autoNextSurah={autoNextSurah}
          setAutoNextSurah={setAutoNextSurah}
          fontFamily={fontFamily}
          setFontFamily={setFontFamily}
          fontSize={fontSize}
          setFontSize={setFontSize}
          tafsirFontFamily={tafsirFontFamily}
          setTafsirFontFamily={setTafsirFontFamily}
          tafsirTheme={tafsirTheme}
          setTafsirTheme={setTafsirTheme}
          TAFSIR_THEMES={TAFSIR_THEMES}
          QURAN_FONTS={QURAN_FONTS}
          TAFSIR_FONTS={TAFSIR_FONTS}
        />

        {/* Smart & Modern Tajweed Assistant overlays */}
        <div
          className="quran-viewer-container w-full h-full p-0 relative flex-1 flex flex-col overflow-hidden min-h-0"
          style={{ contain: 'strict', willChange: 'transform' }}
        >
          {/* Interactive Tajweed Rules Panel (Bottom Sheet style) */}
          <AnimatePresence>
            {mushafEdition === "tajweed" && isTajweedGuideOpen && (
              <motion.div 
                key="tajweed-guide-modal"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-[200] flex items-end justify-center pointer-events-none"
              >
                {/* Backdrop to prevent click errors but let user scroll reader if clicked outside */}
                <div 
                  className="absolute inset-0 bg-black/15 dark:bg-black/35 pointer-events-auto cursor-pointer backdrop-blur-[1px]" 
                  onClick={() => setIsTajweedGuideOpen(false)}
                />
                
                <motion.div
                  initial={{ opacity: 0, y: 100 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 100 }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className={cn(
                    "relative w-full max-w-xl mx-auto rounded-t-[2.5rem] border-t shadow-2xl p-6 pb-8 pointer-events-auto",
                    theme === 'light' ? 'bg-white border-slate-100 text-slate-900' :
                    theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-100' :
                    theme === 'sepia' ? 'bg-[#f4ebd8] border-[#e2d5b5] text-[#5b4636]' :
                    theme === 'parchment' ? 'bg-[#e8dcc4] border-[#d4c1a5] text-[#4a3b2c]' :
                    'bg-[#1a2130] border-slate-800 text-slate-100'
                  )}
                >
                  {/* Pull bar */}
                  <div className="w-12 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-4" />

                  <div className="flex justify-between items-center mb-5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                        <Sparkles size={16} className="animate-pulse" />
                      </div>
                      <div className="text-right">
                        <h3 className="text-xs font-black text-slate-800 dark:text-white">مساعد التجويد التفاعلي الذكي</h3>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">انقر على أي قاعدة لبيان حكمها واستماع نطقها</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsTajweedGuideOpen(false)}
                      className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* Grid of Rules */}
                  <div className="grid grid-cols-2 gap-3" dir="rtl">
                    {tajweedRules.map((rule) => (
                      <button
                        key={rule.id}
                        onClick={() => setSelectedTajweedRule(rule)}
                        className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] border border-black/[0.05] dark:border-white/[0.05] transition-all duration-200 text-right flex flex-col justify-between h-[88px] group cursor-pointer shadow-sm hover:scale-[1.01]"
                      >
                        <div className="flex items-center gap-2">
                          <span 
                            className="w-3 h-3 rounded-full border border-black/10 shrink-0 shadow-sm relative" 
                            style={{ backgroundColor: rule.hexColor }}
                          >
                            <span className="absolute inset-0 rounded-full bg-inherit animate-ping opacity-30" />
                          </span>
                          <span className="text-xs font-black text-slate-800 dark:text-slate-200 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors">{rule.name}</span>
                        </div>
                        
                        <div className="flex items-center justify-between w-full mt-2">
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold truncate max-w-[100px]">{rule.colorName}</span>
                          <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg group-hover:scale-105 transition-all">تفاصيل</span>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Practice / Help Footer block */}
                  <div className="mt-5 p-3.5 rounded-2xl bg-gradient-to-r from-teal-500/5 via-emerald-500/5 to-transparent border border-emerald-500/10 flex items-center justify-between gap-4" dir="rtl">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">💡</span>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold leading-normal">
                        مصحف التجويد يحتوي على رموز لتبسيط الأحكام القرآنيّة بمجرد النظر. انقر على "تفاصيل" لأي قاعدة لاستعراض الأمثلة مع نطقها الصوتي.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}

          </AnimatePresence>
          {isPagerMode ? (
            <div 
              className={cn(
                "w-full flex-1 relative overflow-hidden flex flex-col",
                theme === "creamyNight" ? "bg-[#1c1815]" :
                theme === "dark" ? "bg-slate-950" :
                theme === "slate" ? "bg-[#0f172a]" :
                theme === "sepia" ? "bg-[#e8dcc4]" :
                theme === "parchment" ? "bg-[#d4c1a5]" :
                theme === "sand" ? "bg-[#e2d5b5]" : 
                "bg-slate-50"
              )}
              onClick={toggleControls}
            >
              <div 
                className="absolute inset-0 opacity-[0.06] pointer-events-none z-0"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M60 0l4 4-4 4-4-4 4-4zM0 60l4 4-4 4-4-4 4-4zM120 60l4 4-4 4-4-4 4-4zM60 120l4 4-4 4-4-4 4-4zM30 30l4 4-4 4-4-4 4-4zM90 30l4 4-4 4-4-4 4-4zM30 90l4 4-4 4-4-4 4-4zM90 90l4 4-4 4-4-4 4-4zM60 30l2 2-2 2-2-2 2-2zM30 60l2 2-2 2-2-2 2-2zM90 60l2 2-2 2-2-2 2-2zM60 90l2 2-2 2-2-2 2-2z' fill='%23000' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'repeat'
                }}
              />

              <QuranPager
                pages={extendedPages}
                currentPageIndex={currentPageIndex}
                onPageChange={handlePageChange}
                renderPage={(pageData) => {
                  const [pageNum, ayahs] = pageData;

                  if (typeof ayahs === "string") {
                    return (
                      <div className="flex flex-col items-center justify-center gap-4 text-teal-600 dark:text-teal-400">
                        <div className="relative">
                          <div className="w-16 h-16 border-4 border-teal-500/20 rounded-full" />
                          <div className="absolute inset-0 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                        <p className="font-black text-sm">
                          جاري الانتقال للسورة التالية...
                        </p>
                      </div>
                    );
                  }

                  const isTajweed = mushafEdition === "tajweed";
                  const heightOffset = focusMode || !showControls ? 10 : 70;
                  const cardStyle: React.CSSProperties = {
                    maxHeight: `calc(100vh - ${heightOffset}px)`,
                    height: "100%",
                    width: "100%",
                    maxWidth: "100%",
                    objectFit: "contain",
                  };

                  return (
                    <div 
                      className="w-full h-full flex flex-col items-center justify-start shrink-0 relative z-10 overflow-hidden py-0 px-0 m-0 select-none"
                      style={{ touchAction: 'pan-x' }}
                      onScroll={handleScrollActivity}
                      onTouchMove={handleScrollActivity}
                    >
                      {!focusMode && showControls && (
                        <div className={cn(
                          "w-full flex items-center justify-between px-3 sm:px-5 py-1 text-xs font-black pointer-events-none select-none shrink-0 z-20 transition-colors duration-200 border-b border-black/5 dark:border-white/5",
                          theme === "creamyNight" ? "text-[#e8dac1]" :
                          theme === "dark" ? "text-slate-200" :
                          theme === "slate" ? "text-slate-200" :
                          theme === "sepia" ? "text-[#4a3625]" :
                          theme === "parchment" ? "text-[#3c2f23]" :
                          theme === "sand" ? "text-[#4a3b2c]" :
                          "text-slate-800 dark:text-slate-100"
                        )}>
                          <div className="flex items-center gap-1.5 sm:gap-2">
                             <BookOpen size={14} className="text-teal-600 dark:text-teal-400 shrink-0 stroke-[2.5]" />
                             <span className="font-black text-xs">{surah?.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                             <span className="font-black text-xs">
                               {isDoubleSpread ? `الصفحتان ${pageNum % 2 === 0 ? pageNum : (pageNum === 1 ? 1 : pageNum - 1)} - ${pageNum % 2 === 0 ? (pageNum + 1 <= 604 ? pageNum + 1 : 604) : pageNum}` : `الصفحة ${pageNum}`}
                             </span>
                             <div className="w-1.5 h-1.5 rounded-full bg-teal-500/70 dark:bg-teal-400/70 shrink-0" />
                             <span className="font-extrabold text-xs opacity-90">الجزء {ayahs?.[0]?.juz || '...'}</span>
                          </div>
                        </div>
                      )}
                      
                      {isDoubleSpread ? (() => {
                        const isEven = pageNum % 2 === 0;
                        let rightPageNum = pageNum;
                        let leftPageNum = pageNum + 1;

                        if (pageNum === 1) {
                          rightPageNum = 1;
                          leftPageNum = 2;
                        } else if (!isEven) {
                          rightPageNum = pageNum - 1;
                          leftPageNum = pageNum;
                        }

                        const rightAyahs = getAyahsForPage(rightPageNum);
                        const leftAyahs = getAyahsForPage(leftPageNum);

                        return (
                          <div
                            className={cn(
                              "flex-1 w-full relative overflow-hidden mx-0 p-0 flex flex-row items-center justify-center transition-all duration-300 rounded-none border-none shadow-none gap-0",
                              settings.visualTheme === "glass"
                                ? "bg-white/30 backdrop-blur-md"
                                : theme === "creamyNight"
                                ? "bg-[#25211d]"
                                : theme === "dark"
                                ? "bg-slate-900"
                                : theme === "sepia"
                                ? "bg-[#f4ebd0]"
                                : theme === "parchment"
                                ? "bg-[#e8dcc4]"
                                : theme === "sand"
                                ? "bg-[#f3ead3]"
                                : theme === "slate"
                                ? "bg-[#1e293b]"
                                : "bg-white"
                            )}
                            style={cardStyle}
                            dir="rtl"
                          >
                            {/* Right Page (الصحيفة اليمنى) */}
                            <div className="flex-1 h-full w-1/2 flex items-center justify-end p-0 m-0 relative overflow-hidden">
                              <MushafPage 
                                pageNum={rightPageNum} 
                                recitation={recitation} 
                                ayahs={rightAyahs} 
                                surahName={surah?.name} 
                                setSelectedAyah={setSelectedAyah} 
                                isVertical={false} 
                                isBookmarked={(bookmark?.surah === surah?.number && bookmark?.page === rightPageNum) || (bookmarks?.some(b => b.surah === surah?.number && b.page === rightPageNum))}
                                onBookmarkClick={() => handleRibbonClick(rightPageNum)}
                              />
                            </div>

                            {/* Central Book Spine (فاصل طي المصحف الشريف المعتمد بين الصفحتين) */}
                            <div className="w-[2px] h-[98%] bg-gradient-to-b from-amber-900/10 via-amber-900/40 to-amber-900/10 dark:from-teal-400/10 dark:via-teal-400/40 dark:to-teal-400/10 shrink-0 z-30 shadow-[0_0_8px_rgba(0,0,0,0.2)] rounded-full my-auto" />

                            {/* Left Page (الصحيفة اليسرى) */}
                            {leftPageNum <= 604 ? (
                              <div className="flex-1 h-full w-1/2 flex items-center justify-start p-0 m-0 relative overflow-hidden">
                                <MushafPage 
                                  pageNum={leftPageNum} 
                                  recitation={recitation} 
                                  ayahs={leftAyahs} 
                                  surahName={surah?.name} 
                                  setSelectedAyah={setSelectedAyah} 
                                  isVertical={false} 
                                  isBookmarked={(bookmark?.surah === surah?.number && bookmark?.page === leftPageNum) || (bookmarks?.some(b => b.surah === surah?.number && b.page === leftPageNum))}
                                  onBookmarkClick={() => handleRibbonClick(leftPageNum)}
                                />
                              </div>
                            ) : (
                              <div className="flex-1 h-full w-1/2" />
                            )}
                          </div>
                        );
                      })() : (
                        <div
                          className={cn(
                            "flex-1 w-full relative overflow-hidden mx-0 p-0 flex flex-col items-center justify-center transition-all duration-300 rounded-none border-none shadow-none",
                            settings.visualTheme === "glass"
                              ? "bg-white/30 backdrop-blur-md"
                              : theme === "creamyNight"
                              ? "bg-[#25211d]"
                              : theme === "dark"
                              ? "bg-slate-900"
                              : theme === "sepia"
                              ? "bg-[#f4ebd0]"
                              : theme === "parchment"
                              ? "bg-[#e8dcc4]"
                              : theme === "sand"
                              ? "bg-[#f3ead3]"
                              : theme === "slate"
                              ? "bg-[#1e293b]"
                              : "bg-white"
                          )}
                          style={cardStyle}
                        >
                          <div className="relative w-full h-full flex flex-1 items-center justify-center p-0 m-0 overflow-hidden">
                            <MushafPage 
                              pageNum={pageNum} 
                              recitation={recitation} 
                              ayahs={Array.isArray(ayahs) ? ayahs : []} 
                              surahName={surah?.name} 
                              setSelectedAyah={setSelectedAyah} 
                              isVertical={false} 
                              isBookmarked={(bookmark?.surah === surah?.number && bookmark?.page === pageNum) || (bookmarks?.some(b => b.surah === surah?.number && b.page === pageNum))}
                              onBookmarkClick={() => handleRibbonClick(pageNum)}
                            />
                          </div>
                        </div>
                      )}

                      <div className="w-full max-w-full mx-auto px-1 pb-0.5 pt-0 shrink-0 z-20">
                        <PageTafsir pageNum={pageNum} theme={theme} />
                      </div>
                    </div>
                  );
                }}
              />
            </div>
          ) : (
            <div
              className={cn(
                "w-full flex-1 flex flex-col items-center gap-0 overflow-y-auto custom-scrollbar pb-0 relative p-0 m-0",
                theme === "creamyNight" ? "bg-[#1c1815]" :
                theme === "dark" ? "bg-slate-950" :
                theme === "slate" ? "bg-[#0f172a]" :
                theme === "sepia" ? "bg-[#e8dcc4]" :
                theme === "parchment" ? "bg-[#d4c1a5]" :
                theme === "sand" ? "bg-[#e2d5b5]" : 
                "bg-slate-50"
              )}
              dir="rtl"
              onClick={toggleControls}
              onScroll={handleScrollActivity}
            >
              {extendedPages.map((pageData, index) => {
                const [pageNum, ayahs] = pageData;
                if (typeof ayahs === "string") return null;
                
                return (
                  <div
                    key={`vertical-page-${pageNum}-${index}`}
                    data-index={index}
                    className="quran-vertical-page w-full flex flex-col items-center shrink-0 relative z-10 py-0 my-0 px-0 mx-0 border-b border-black/5 dark:border-white/5"
                  >
                    <div className="relative w-full h-auto flex items-center justify-center p-0 m-0">
                      <MushafPage 
                        pageNum={pageNum} 
                        recitation={recitation} 
                        ayahs={Array.isArray(ayahs) ? ayahs : []} 
                        surahName={surah?.name} 
                        setSelectedAyah={setSelectedAyah} 
                        isVertical={true} 
                        isBookmarked={(bookmark?.surah === surah?.number && bookmark?.page === pageNum) || (bookmarks?.some(b => b.surah === surah?.number && b.page === pageNum))}
                        onBookmarkClick={() => handleRibbonClick(pageNum)}
                      />
                    </div>
                    <div className="w-full max-w-full mx-auto px-2 py-1">
                      <PageTafsir pageNum={pageNum} theme={theme} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      
      {/* Individual Ayah Tafsir Detail View (Premium Overlay) */}
        <TafsirModal
          isOpen={!!selectedAyah}
          onClose={() => {
            setSelectedAyah(null);
            setShowTafsirQuickSettings(false);
          }}
          selectedAyah={selectedAyah}
          surah={surah}
          tafsirType={tafsirType}
          setTafsirType={setTafsirType}
          tafsirTheme={tafsirTheme}
          setTafsirTheme={setTafsirTheme}
          TAFSIR_THEMES={TAFSIR_THEMES}
          TAFSIR_NAMES={TAFSIR_NAMES}
          tafsirFontSize={tafsirFontSize}
          setTafsirFontSize={setTafsirFontSize}
          tafsirFontFamily={tafsirFontFamily}
          setTafsirFontFamily={setTafsirFontFamily}
          TAFSIR_FONTS={TAFSIR_FONTS}
          fontFamily={fontFamily}
          highlightQuranText={highlightQuranText}
          isPlaying={isPlaying}
          currentAyahPlaying={currentAyahPlaying}
          toggleAudio={toggleAudio}
          copyAyah={setCopiedAyahId}
          shareAyah={shareAyah}
          navigateTafsir={navigateTafsir}
          quranVocabulary={quranVocabulary}
          setSelectedWordDetail={setSelectedWordDetail}
          loading={loading}
          isComparing={isComparing}
          t={t}
          themeClasses={themeClasses}
          theme={theme}
          aiInsights={aiInsights}
          setShowAIModal={setShowAIModal}
        />

      {/* Smart Bookmark Redesign Modal */}
      <AnimatePresence>
        {showBookmarksModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[700] bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => {
              setShowBookmarksModal(false);
              setBookmarkNote("");
            }}
          >
            <motion.div
              initial={{ y: "100%", opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: "100%", opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-[0_20px_70px_-15px_rgba(0,0,0,0.5)] flex flex-col p-6 pb-10 will-change-transform max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Handle for Mobile Rendering */}
              <div className="w-12 h-1.5 bg-black/10 dark:bg-white/10 rounded-full mx-auto mb-6 opacity-50 sm:hidden" />

              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <Bookmark className="text-teal-600" />
                    {t("smart_bookmarks")}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                    {t("page")} {currentPageNum} • {t("surah")} {surah?.name}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowBookmarksModal(false);
                    setBookmarkNote("");
                  }}
                  className="w-10 h-10 bg-rose-500 text-white rounded-full flex items-center justify-center hover:bg-rose-600 transform transition-all duration-75 active:scale-[0.85] active:opacity-70 shadow-lg shadow-rose-500/20"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Bento Content - Page Stats & Existing Status */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-3xl border border-black/5 dark:border-white/5 flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    {t("juz")}
                  </span>
                  <p className="text-2xl font-black text-teal-600">
                    {extendedPages[currentPageIndex]?.[1]?.[0]?.juz || 1}
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-3xl border border-black/5 dark:border-white/5 flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    {t("hizb")}
                  </span>
                  <p className="text-2xl font-black text-rose-500">
                    {extendedPages[currentPageIndex]?.[1]?.[0]?.hizb || 1}
                  </p>
                </div>
              </div>

              <div className="overflow-y-auto flex-grow custom-scrollbar hide-scrollbar pr-1">
                {/* Status Indicator */}
                {isBookmarked ? (
                  <div className="mb-6 p-4 bg-emerald-500/10 dark:bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shrink-0">
                      <BookmarkCheck size={26} />
                    </div>
                    <div className="flex-grow">
                      <p className="font-black text-emerald-800 dark:text-emerald-300">
                        {t("page_already_bookmarked")}
                      </p>
                      <p className="text-xs text-emerald-600/70 font-bold">
                        {t("you_can_add_more")}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="mb-6 p-4 bg-teal-50 dark:bg-teal-900/10 border border-teal-500/10 rounded-2xl flex items-center gap-4">
                    <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shrink-0">
                      <Lightbulb size={26} className="text-teal-500" />
                    </div>
                    <div>
                      <p className="font-black text-teal-800 dark:text-teal-200">
                        {t("add_smart_bookmark")}
                      </p>
                      <p className="text-xs text-teal-600/70 font-bold">
                        {t("choose_type_and_notes")}
                      </p>
                    </div>
                  </div>
                )}

                {/* Bookmark Type Selector */}
                <div className="mb-6">
                  <h4 className="text-xs font-bold text-slate-400 uppercase ml-2 mb-3 tracking-widest">
                    {t("bookmark_type")}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {[
                      {
                        id: "wird",
                        label: t("wird_label"),
                        icon: <BookOpen size={14} />,
                        color: "teal",
                        bg: "bg-teal-50",
                        text: "text-teal-700",
                        border: "border-teal-200",
                        activeBg: "bg-teal-600",
                        shadow: "shadow-teal-500/20",
                        darkBg: "dark:bg-teal-900/20",
                        darkText: "dark:text-teal-300",
                        darkBorder: "dark:border-teal-800/50",
                      },
                      {
                        id: "memorization",
                        label: t("review_label"),
                        icon: <BrainCircuit size={14} />,
                        color: "indigo",
                        bg: "bg-indigo-50",
                        text: "text-indigo-700",
                        border: "border-indigo-200",
                        activeBg: "bg-indigo-600",
                        shadow: "shadow-indigo-500/20",
                        darkBg: "dark:bg-indigo-900/20",
                        darkText: "dark:text-indigo-300",
                        darkBorder: "dark:border-indigo-800/50",
                      },
                      {
                        id: "reflection",
                        label: t("reflection_label"),
                        icon: <Edit3 size={14} />,
                        color: "amber",
                        bg: "bg-amber-50",
                        text: "text-amber-700",
                        border: "border-amber-200",
                        activeBg: "bg-amber-600",
                        shadow: "shadow-amber-500/20",
                        darkBg: "dark:bg-amber-900/20",
                        darkText: "dark:text-amber-300",
                        darkBorder: "dark:border-amber-800/50",
                      },
                      {
                        id: "important",
                        label: t("important_label"),
                        icon: <AlertCircle size={14} />,
                        color: "rose",
                        bg: "bg-rose-50",
                        text: "text-rose-700",
                        border: "border-rose-200",
                        activeBg: "bg-rose-600",
                        shadow: "shadow-rose-500/20",
                        darkBg: "dark:bg-rose-900/20",
                        darkText: "dark:text-rose-300",
                        darkBorder: "dark:border-rose-800/50",
                      },
                      {
                        id: "general",
                        label: t("general_ref_label"),
                        icon: <Bookmark size={14} />,
                        color: "slate",
                        bg: "bg-slate-100",
                        text: "text-slate-700",
                        border: "border-slate-200",
                        activeBg: "bg-slate-600",
                        shadow: "shadow-slate-500/20",
                        darkBg: "dark:bg-slate-800",
                        darkText: "dark:text-slate-300",
                        darkBorder: "dark:border-slate-700",
                      },
                    ].map((btn) => (
                      <button
                        key={btn.id}
                        onClick={() => setSelectedBookmarkType(btn.id as any)}
                        className={cn(
                          "px-4 py-2.5 rounded-full text-[11px] font-black flex items-center gap-2 transition-all border-2 transform transition-all duration-75 active:scale-[0.95] active:opacity-80",
                          selectedBookmarkType === btn.id
                            ? `${btn.activeBg} text-white border-transparent shadow-lg ${btn.shadow} scale-105`
                            : `${btn.bg} ${btn.text} ${btn.border} ${btn.darkBg} ${btn.darkText} ${btn.darkBorder} hover:scale-102 hover:shadow-sm`,
                        )}
                      >
                        <span
                          className={cn(
                            "transition-transform",
                            selectedBookmarkType === btn.id ? "scale-110" : "",
                          )}
                        >
                          {btn.icon}
                        </span>
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Note Input */}
                <div className="mb-8">
                  <h4 className="text-xs font-bold text-slate-400 uppercase ml-2 mb-3 tracking-widest">
                    {t("your_notes")}
                  </h4>
                  <div className="relative group">
                    <textarea
                      value={bookmarkNote}
                      onChange={(e) => setBookmarkNote(e.target.value)}
                      placeholder={t("notes_placeholder")}
                      className="w-full h-24 p-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-black/5 dark:border-white/5 rounded-3xl text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-teal-500/50 transition-all placeholder:text-slate-400 resize-none shadow-inner"
                      dir={settings.appLanguage === "ar" ? "rtl" : "ltr"}
                    />
                    <Edit3
                      size={16}
                      className={cn(
                        "absolute bottom-4 text-slate-300 group-focus-within:text-teal-500 transition-colors",
                        settings.appLanguage === "ar" ? "left-4" : "right-4",
                      )}
                    />
                  </div>
                </div>

                {/* Save/Delete Buttons */}
                <div className="flex gap-3 mb-8">
                  <button
                    onClick={() => handleAddBookmark(selectedBookmarkType)}
                    className="flex-grow py-4 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-2xl font-black shadow-xl shadow-teal-600/20 duration-75 active:scale-[0.85] active:opacity-70 transition-all flex items-center justify-center gap-2"
                  >
                    <BookmarkCheck size={20} />
                    {t("save_smart_bookmark")}
                  </button>
                  {isBookmarked && (
                    <button
                      onClick={() => {
                        removePageBookmarks();
                        setShowBookmarksModal(false);
                      }}
                      className="p-4 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-2xl hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors duration-75 active:scale-[0.85] active:opacity-70 shadow-lg shadow-rose-500/5"
                    >
                      <Trash2 size={22} />
                    </button>
                  )}
                </div>

                {/* History Section - Recent Bookmarks */}
                {bookmarks && bookmarks.length > 0 && (
                  <div className="pt-6 border-t border-black/5 dark:border-white/5">
                    <div className="flex items-center justify-between mb-4 px-2">
                      <h4 className="font-black text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <History size={18} className="text-teal-500" />
                        {t("history_bookmarks")}
                      </h4>
                      <span className="text-[10px] font-bold text-slate-400">
                        {t("bookmarks_count").replace(
                          "{{count}}",
                          bookmarks.length.toString(),
                        )}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {bookmarks
                        .slice()
                        .reverse()
                        .slice(0, 5)
                        .map((b) => (
                          <div
                            key={`b-history-${b.id}`}
                            onClick={() => {
                              setShowBookmarksModal(false);
                              navigate(`/quran/${b.surah}?page=${b.page}`);
                            }}
                            className="group flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-black/5 dark:border-white/5 hover:border-teal-500/30 transition-all cursor-pointer relative overflow-hidden active:scale-[0.98]"
                          >
                            <div
                              className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110",
                                b.type === "wird"
                                  ? "bg-teal-50 dark:bg-teal-900/30 text-teal-600"
                                  : b.type === "memorization"
                                    ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600"
                                    : b.type === "reflection"
                                      ? "bg-amber-50 dark:bg-amber-900/30 text-amber-600"
                                      : b.type === "important"
                                        ? "bg-rose-50 dark:bg-rose-900/30 text-rose-600"
                                        : "bg-slate-100 dark:bg-slate-800 text-slate-500",
                              )}
                            >
                              {b.type === "wird" && <BookOpen size={20} />}
                              {b.type === "memorization" && (
                                <BrainCircuit size={20} />
                              )}
                              {b.type === "reflection" && <Edit3 size={20} />}
                              {b.type === "important" && (
                                <AlertCircle size={20} />
                              )}
                              {b.type === "general" && <Bookmark size={20} />}
                            </div>
                            <div className="flex-grow min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <p className="font-black text-slate-800 dark:text-slate-200 truncate">
                                  {t("surah")} {b.surahName}
                                </p>
                                <span className="text-[10px] font-bold text-slate-400 shrink-0">
                                  {t("page")} {b.page}
                                </span>
                              </div>
                              {b.note && (
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 italic mt-0.5 opacity-70">
                                  "{b.note}"
                                </p>
                              )}
                              <div className="flex items-center gap-3 mt-1.5 opacity-60">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter flex items-center gap-1">
                                  <Calendar size={8} />
                                  {new Date(b.dateAdded).toLocaleDateString(
                                    settings.appLanguage === "ar"
                                      ? "ar-EG"
                                      : settings.appLanguage === "fr"
                                        ? "fr-FR"
                                        : "en-US",
                                    { day: "numeric", month: "short" },
                                  )}
                                </span>
                                <span className="w-1 h-1 bg-slate-200 dark:bg-slate-700 rounded-full" />
                                <span className="text-[9px] font-bold text-slate-400">
                                  {t("juz")} {b.juz}
                                </span>
                              </div>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              {settings.appLanguage === "ar" ? (
                                <ChevronLeft
                                  size={16}
                                  className="text-teal-500"
                                />
                              ) : (
                                <ChevronRight
                                  size={16}
                                  className="text-teal-500"
                                />
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Smart Insights Modal */}
      <AnimatePresence>
        {showAIModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[800] bg-black/80 backdrop-blur-xl flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setShowAIModal(false)}
          >
            <motion.div
              initial={{ y: "100%", scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: "100%", scale: 0.95 }}
              className="w-[98vw] max-w-[1500px] bg-white dark:bg-slate-900 rounded-t-[2.5rem] sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 bg-gradient-to-br from-amber-400 to-amber-600 text-amber-900 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shadow-inner">
                    <Sparkles size={24} className="text-white animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">
                      قبسات ذكية بالذكاء الاصطناعي
                    </h3>
                    <p className="text-[10px] font-bold text-amber-100 uppercase tracking-widest">
                      تحليل تدبري عميق للآية الكريمة
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAIModal(false)}
                  className="w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transform transition-all duration-75 active:scale-[0.85] active:opacity-70"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-8 bg-white dark:bg-slate-950">
                {loadingAI ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-8">
                    <div className="relative">
                      <div className="w-20 h-20 border-4 border-amber-100 dark:border-amber-900/30 rounded-full" />
                      <div className="absolute inset-0 w-20 h-20 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                      <Sparkles
                        className="absolute inset-0 m-auto text-amber-500 animate-bounce"
                        size={24}
                      />
                    </div>
                    <div className="text-center space-y-2">
                      <p className="text-lg font-black text-slate-800 dark:text-slate-100 animate-pulse">
                        جاري الاستنباط...
                      </p>
                      <p className="text-xs text-slate-500 font-bold max-w-[200px] mx-auto">
                        يقوم الذكاء الاصطناعي الآن بربط الآية بالتفسير واستخلاص
                        الدروس العملية
                      </p>
                    </div>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                  >
                    <div className="p-5 bg-amber-500/5 rounded-3xl border border-amber-500/10 italic text-slate-700 dark:text-amber-200/80 leading-relaxed text-center font-bold">
                      "{selectedAyah?.text}"
                    </div>

                    <div className="prose prose-slate dark:prose-invert max-w-none">
                      <div
                        className="text-slate-800 dark:text-slate-200 leading-[2.2] text-right whitespace-pre-wrap font-medium text-lg"
                        style={{ fontFamily: "Tajawal, sans-serif" }}
                      >
                        {aiInsights}
                      </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-800/30">
                        <Info size={18} className="text-blue-500 shrink-0" />
                        <p className="text-[10px] font-bold text-blue-700 dark:text-blue-300">
                          هذه القبسات مستولدة آلياً بواسطة الذكاء الاصطناعي
                          (Gemini) بناءً على التفسير المختار. يرجى دائماً مراجعة
                          كتب التفسير المعتمدة.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="p-6 bg-slate-50 dark:bg-slate-900/50 flex gap-3 shrink-0">
                <button
                  onClick={async () => {
                    if (aiInsights) {
                      await copyTextToClipboard(aiInsights);
                    }
                  }}
                  className="flex-grow py-4 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-2xl font-black shadow-soft border border-black/5 flex items-center justify-center gap-2 hover:bg-slate-50 transition-all"
                >
                  <Copy size={18} />
                  نسخ القبسات
                </button>
                <button
                  onClick={() => setShowAIModal(false)}
                  className="flex-grow py-4 bg-amber-500 text-white rounded-2xl font-black shadow-lg shadow-amber-500/20 duration-75 active:scale-[0.85] active:opacity-70 transition-all"
                >
                  تم
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Vocabulary Word Detail Popup Capsule */}
      <AnimatePresence>
        {selectedWordDetail && (
          <motion.div 
            key="selected-word-detail-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" 
            dir="rtl" 
            onClick={() => setSelectedWordDetail(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className={cn(
                "relative w-full max-w-md p-6 rounded-3xl border shadow-2xl overflow-hidden",
                theme === 'light' ? 'bg-white border-slate-100 text-slate-900' :
                theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-100' :
                theme === 'sepia' ? 'bg-[#f4ecd8] border-[#e2d5b5] text-[#5b4636]' :
                theme === 'parchment' ? 'bg-[#e8dcc4] border-[#d4c1a5] text-[#4a3b2c]' :
                'bg-[#1e293b] border-slate-800 text-slate-100'
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-slate-400 block uppercase">بيان الكلمات الغامضة</span>
                    <h4 className="text-lg font-black text-amber-600 dark:text-amber-400">معنى: {selectedWordDetail.word}</h4>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedWordDetail(null)}
                  className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-3.5 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/5">
                  <span className="text-[10px] font-black text-slate-400 block mb-1">السياق القرآني:</span>
                  <p className="text-right text-base font-bold text-orange-600 dark:text-orange-400 leading-relaxed" style={{ fontFamily }}>
                    {selectedWordDetail.context}
                  </p>
                  <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold block mt-1">سورة {selectedWordDetail.surahName} • آية {selectedWordDetail.ayahNumber}</span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase block">المعنى المباشر:</span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-bold leading-relaxed">{selectedWordDetail.meaning}</p>
                </div>

                <div className="space-y-1 pt-3 border-t border-dashed border-black/5 dark:border-white/5">
                  <span className="text-[10px] font-black text-teal-600 dark:text-teal-400 uppercase block">أثر الكلمة والتدبر الروحي:</span>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold leading-relaxed">{selectedWordDetail.impact}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedWordDetail(null)}
                className="w-full mt-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-black text-xs rounded-xl shadow-md transition-colors cursor-pointer"
              >
                حسناً، فهمت المعنى
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tajweed Rule Detail Popup Capsule */}
      <AnimatePresence>
        {selectedTajweedRule && (
          <motion.div 
            key="selected-tajweed-rule-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" 
            dir="rtl" 
            onClick={() => setSelectedTajweedRule(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className={cn(
                "relative w-full max-w-lg p-6 rounded-3xl border shadow-2xl overflow-hidden",
                theme === 'light' ? 'bg-white border-slate-100 text-slate-900' :
                theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-100' :
                theme === 'sepia' ? 'bg-[#f4ecd8] border-[#e2d5b5] text-[#5b4636]' :
                theme === 'parchment' ? 'bg-[#e8dcc4] border-[#d4c1a5] text-[#4a3b2c]' :
                'bg-[#1e293b] border-slate-800 text-slate-100'
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2.5">
                  <div 
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: selectedTajweedRule.hexColor }}
                  >
                    ت
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-slate-400 block uppercase">دليل قواعد التجويد التفاعلي</span>
                    <h4 className="text-lg font-black" style={{ color: selectedTajweedRule.hexColor }}>{selectedTajweedRule.name}</h4>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedTajweedRule(null)}
                  className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl border" style={{ backgroundColor: selectedTajweedRule.bgHex, borderColor: `${selectedTajweedRule.hexColor}20` }}>
                  <span className="text-[10px] font-black block mb-1" style={{ color: selectedTajweedRule.hexColor }}>تعريف القاعدة:</span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-bold leading-relaxed">{selectedTajweedRule.description}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase block">توضيح التطبيق:</span>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{selectedTajweedRule.explanation}</p>
                </div>

                <div className="space-y-2 pt-3 border-t border-dashed border-black/5 dark:border-white/5">
                  <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase block">أمثلة نطقية:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedTajweedRule.examples.map((ex: any, idx: number) => {
                      const isCurrentlyPlaying = playingExamplePhrase === ex.phrase;
                      return (
                        <div 
                          key={idx} 
                          className="p-3.5 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5 text-right flex items-center justify-between gap-3 group/ex hover:bg-black/10 dark:hover:bg-white/10 transition-all duration-200"
                        >
                          <div className="flex-grow">
                            <span className="text-base font-black text-orange-600 dark:text-orange-400 block mb-1">{ex.phrase}</span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block">{ex.explanation}</span>
                          </div>
                          <button
                            onClick={() => speakArabicWord(ex.phrase)}
                            className={cn(
                              "w-9 h-9 rounded-xl flex items-center justify-center transition-all shadow-sm shrink-0 cursor-pointer",
                              isCurrentlyPlaying
                                ? "bg-emerald-500 text-white animate-pulse"
                                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:scale-105 active:scale-95 border border-black/5"
                            )}
                            title="استمع للنطق التجويدي"
                          >
                            {isCurrentlyPlaying ? (
                              <div className="flex items-end justify-center gap-0.5 w-4 h-4 pb-0.5">
                                <span className="w-0.5 h-2.5 bg-white animate-[bounce_0.6s_infinite_0s]" />
                                <span className="w-0.5 h-3.5 bg-white animate-[bounce_0.6s_infinite_0.15s]" />
                                <span className="w-0.5 h-1.5 bg-white animate-[bounce_0.6s_infinite_0.3s]" />
                              </div>
                            ) : (
                              <Volume2 size={15} className="group-hover/ex:scale-110 transition-transform text-teal-600 dark:text-teal-400" />
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedTajweedRule(null)}
                className="w-full mt-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition-colors cursor-pointer"
              >
                فهمت القاعدة التجويدية
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SurahDetail;
