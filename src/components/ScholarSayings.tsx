import { BackButton } from './ui/BackButton';
import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronRight, 
  ChevronLeft,
  Quote, 
  BookOpen, 
  Heart, 
  Sparkles, 
  History, 
  Users, 
  Feather, 
  Library, 
  Lightbulb, 
  Search, 
  X, 
  Copy, 
  Share2, 
  Type, 
  Shuffle, 
  SlidersHorizontal,
  BookmarkCheck,
  HeartOff,
  CheckCircle2,
  Info,
  Settings,
  Download,
  Loader2
} from 'lucide-react';
import { SCHOLAR_SAYINGS, ScholarSaying } from '../data/scholarSayings';
import { cn, shareContent } from '../lib/utils';
import { useAppContext } from '../AppContext';
import { useSmartNavigation } from "../lib/navigation";
import { useTranslation } from '../i18n';
import { toPng } from 'html-to-image';
import { safeLocalStorageGetItem, safeLocalStorageSetItem, safeLocalStorageRemoveItem } from "../utils/storage";


export const ScholarSayings: React.FC = () => {
  const { navigate } = useSmartNavigation();
  const { settings } = useAppContext();
  const { t, isRtl } = useTranslation(settings.appLanguage);
  const topRef = useRef<HTMLDivElement>(null);

  // States
  const [activeTab, setActiveTab] = useState<ScholarSaying['category'] | 'favorites'>('sages');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'info'>('success');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  
  // Custom reading settings loaded from localStorage
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg' | 'xl'>(() => {
    return (safeLocalStorageGetItem('scholar_sayings_font_size') as any) || 'md';
  });
  const [fontFamily, setFontFamily] = useState<'amiri' | 'naskh' | 'tajawal' | 'cairo' | 'messiri' | 'zain' | 'beiruti' | 'kufi' | 'alexandria' | 'ruqaa' | 'lateef' | 'lalezar' | 'marhey' | 'rakkas'>(() => {
    return (safeLocalStorageGetItem('scholar_sayings_font_family') as any) || 'amiri';
  });
  const [theme, setTheme] = useState<'system' | 'cream' | 'emerald' | 'midnight' | 'lavender' | 'charcoal'>(() => {
    return (safeLocalStorageGetItem('scholar_sayings_theme') as any) || 'system';
  });

  // Favorites state persistent in localStorage
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = safeLocalStorageGetItem('scholar_sayings_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Theme styling declarations
  const themeStyles = {
    system: {
      container: "bg-[#f8fafc] dark:bg-[#09090b] text-slate-800 dark:text-slate-100",
      header: "bg-white/70 dark:bg-[#09090b]/70 border-b border-slate-200/50 dark:border-white/5",
      headerTitle: "text-slate-900 dark:text-white",
      searchBg: "bg-white/80 dark:bg-white/5 backdrop-blur-md border-slate-200/50 dark:border-white/10 text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-[#18181b]",
      categoryBtnActive: "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md",
      categoryBtnInactive: "bg-white/60 dark:bg-white/5 backdrop-blur-sm text-slate-600 dark:text-slate-400 border-slate-200/50 dark:border-white/5 hover:bg-white dark:hover:bg-white/10",
      dailyCard: "bg-gradient-to-br from-white/90 to-white/50 dark:from-[#18181b]/90 dark:to-[#18181b]/50 backdrop-blur-xl text-slate-900 dark:text-white",
      dailyCard3d: "ring-2 ring-amber-500/60 dark:ring-amber-500/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_15px_40px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_15px_40px_rgb(0,0,0,0.3)] rounded-3xl",
      dailyCardText: "text-slate-900 dark:text-white font-bold",
      dailyCardAuthor: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20",
      sayingCard: "bg-gradient-to-br from-white/80 to-white/40 dark:from-[#18181b]/80 dark:to-[#18181b]/40 backdrop-blur-xl text-slate-900 dark:text-slate-100",
      sayingCard3d: "ring-2 ring-amber-500/50 dark:ring-amber-500/50 shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgb(0,0,0,0.2)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgb(0,0,0,0.06)] dark:hover:shadow-[0_10px_30px_rgb(0,0,0,0.3)] rounded-3xl",
      sayingCardText: "text-slate-800 dark:text-slate-200",
      badgeLabel: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
      settingsBtnActive: "bg-indigo-600 text-white shadow-md",
      settingsBtnInactive: "bg-white/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 text-slate-600 dark:text-slate-300",
      settingsPanel: "bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-2xl border-b border-slate-200/50 dark:border-white/5 shadow-sm",
      activeTabBadge: "bg-black/10 dark:bg-white/10 text-slate-900 dark:text-white font-semibold",
      inactiveTabBadge: "bg-slate-200/50 dark:bg-white/5 text-slate-500",
    },
    cream: {
      container: "bg-[#FDFBF7] text-[#4A3C31]",
      header: "bg-[#FDFBF7]/80 border-b border-[#E6D5C3]/50",
      headerTitle: "text-[#2D241E]",
      searchBg: "bg-white/60 backdrop-blur-md border-[#E6D5C3]/50 text-[#4A3C31] focus:bg-white",
      categoryBtnActive: "bg-[#8C6D53] text-[#FDFBF7] shadow-md",
      categoryBtnInactive: "bg-white/40 backdrop-blur-sm text-[#735D4C] border-[#E6D5C3]/50 hover:bg-white",
      dailyCard: "bg-gradient-to-br from-white/90 to-[#F9F4EB]/80 backdrop-blur-xl text-[#2D241E]",
      dailyCard3d: "ring-2 ring-amber-500/60 shadow-[0_8px_30px_rgba(140,109,83,0.08)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(140,109,83,0.12)] rounded-3xl",
      dailyCardText: "text-[#2D241E] font-bold",
      dailyCardAuthor: "text-[#8C6D53] bg-[#8C6D53]/10 border border-[#8C6D53]/20",
      sayingCard: "bg-gradient-to-br from-white/80 to-[#F9F4EB]/60 backdrop-blur-xl text-[#4A3C31]",
      sayingCard3d: "ring-2 ring-amber-500/50 shadow-[0_4px_20px_rgba(140,109,83,0.05)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(140,109,83,0.1)] rounded-3xl",
      sayingCardText: "text-[#3D3128]",
      badgeLabel: "bg-[#8C6D53]/10 text-[#8C6D53]",
      settingsBtnActive: "bg-[#8C6D53] text-white shadow-md",
      settingsBtnInactive: "bg-white/40 hover:bg-white text-[#735D4C]",
      settingsPanel: "bg-[#FDFBF7]/90 backdrop-blur-2xl border-b border-[#E6D5C3]/50 shadow-sm",
      activeTabBadge: "bg-[#8C6D53]/15 text-[#8C6D53] font-semibold",
      inactiveTabBadge: "bg-[#E6D5C3]/30 text-[#735D4C]",
    },
    emerald: {
      container: "bg-[#061510] text-[#D1E7DD]",
      header: "bg-[#061510]/80 border-b border-emerald-900/30",
      headerTitle: "text-emerald-50",
      searchBg: "bg-emerald-950/30 backdrop-blur-md border-emerald-900/30 text-emerald-100 focus:bg-emerald-950/60",
      categoryBtnActive: "bg-emerald-600 text-white shadow-[0_4px_12px_rgba(16,185,129,0.3)]",
      categoryBtnInactive: "bg-emerald-950/20 backdrop-blur-sm text-emerald-300 border-emerald-900/30 hover:bg-emerald-950/50",
      dailyCard: "bg-gradient-to-br from-emerald-900/40 to-emerald-950/40 backdrop-blur-xl text-emerald-50",
      dailyCard3d: "ring-2 ring-emerald-500/60 shadow-[0_8px_30px_rgba(0,0,0,0.3)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(0,0,0,0.5)] rounded-3xl",
      dailyCardText: "text-emerald-50 font-bold",
      dailyCardAuthor: "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20",
      sayingCard: "bg-gradient-to-br from-emerald-900/30 to-emerald-950/30 backdrop-blur-xl text-emerald-100",
      sayingCard3d: "ring-2 ring-emerald-500/50 shadow-[0_4px_20px_rgba(0,0,0,0.2)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.4)] rounded-3xl",
      sayingCardText: "text-emerald-100",
      badgeLabel: "bg-emerald-500/20 text-emerald-300",
      settingsBtnActive: "bg-emerald-600 text-white shadow-md",
      settingsBtnInactive: "bg-emerald-950/30 hover:bg-emerald-950/60 text-emerald-300",
      settingsPanel: "bg-[#061510]/90 backdrop-blur-2xl border-b border-emerald-900/30 shadow-sm",
      activeTabBadge: "bg-emerald-500/20 text-emerald-200 font-semibold",
      inactiveTabBadge: "bg-emerald-950/40 text-emerald-400/60",
    },
    midnight: {
      container: "bg-[#040814] text-[#D5DEEF]",
      header: "bg-[#040814]/80 border-b border-indigo-900/30",
      headerTitle: "text-indigo-50",
      searchBg: "bg-indigo-950/20 backdrop-blur-md border-indigo-900/30 text-indigo-100 focus:bg-indigo-950/40",
      categoryBtnActive: "bg-indigo-600 text-white shadow-[0_4px_12px_rgba(79,70,229,0.3)]",
      categoryBtnInactive: "bg-indigo-950/20 backdrop-blur-sm text-indigo-300 border-indigo-900/30 hover:bg-indigo-950/40",
      dailyCard: "bg-gradient-to-br from-indigo-900/40 to-[#040814]/80 backdrop-blur-xl text-indigo-50",
      dailyCard3d: "ring-2 ring-indigo-500/60 shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(0,0,0,0.6)] rounded-3xl",
      dailyCardText: "text-indigo-50 font-bold",
      dailyCardAuthor: "text-indigo-400 bg-indigo-500/10 border border-indigo-500/20",
      sayingCard: "bg-gradient-to-br from-indigo-900/20 to-[#040814]/60 backdrop-blur-xl text-indigo-100",
      sayingCard3d: "ring-2 ring-indigo-500/50 shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] rounded-3xl",
      sayingCardText: "text-indigo-100",
      badgeLabel: "bg-indigo-500/20 text-indigo-300",
      settingsBtnActive: "bg-indigo-600 text-white shadow-md",
      settingsBtnInactive: "bg-indigo-950/30 hover:bg-indigo-950/50 text-indigo-300",
      settingsPanel: "bg-[#040814]/90 backdrop-blur-2xl border-b border-indigo-900/30 shadow-sm",
      activeTabBadge: "bg-indigo-500/20 text-indigo-200 font-semibold",
      inactiveTabBadge: "bg-indigo-950/40 text-indigo-400/60",
    },
    lavender: {
      container: "bg-[#F7F5FA] text-[#4A3D5B]",
      header: "bg-[#F7F5FA]/80 border-b border-[#E1D8EB]/60",
      headerTitle: "text-[#342A42]",
      searchBg: "bg-white/60 backdrop-blur-md border-[#E1D8EB]/60 text-[#4A3D5B] focus:bg-white",
      categoryBtnActive: "bg-[#7E5E9E] text-white shadow-md",
      categoryBtnInactive: "bg-white/40 backdrop-blur-sm text-[#615175] border-[#E1D8EB]/60 hover:bg-white",
      dailyCard: "bg-gradient-to-br from-white/90 to-[#EAE3F2]/80 backdrop-blur-xl text-[#342A42]",
      dailyCard3d: "ring-2 ring-[#7E5E9E]/60 shadow-[0_8px_30px_rgba(126,94,158,0.08)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(126,94,158,0.15)] rounded-3xl",
      dailyCardText: "text-[#342A42] font-bold",
      dailyCardAuthor: "text-[#7E5E9E] bg-[#7E5E9E]/10 border border-[#7E5E9E]/20",
      sayingCard: "bg-gradient-to-br from-white/80 to-[#EAE3F2]/60 backdrop-blur-xl text-[#4A3D5B]",
      sayingCard3d: "ring-2 ring-[#7E5E9E]/50 shadow-[0_4px_20px_rgba(126,94,158,0.05)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(126,94,158,0.1)] rounded-3xl",
      sayingCardText: "text-[#3C324A]",
      badgeLabel: "bg-[#7E5E9E]/10 text-[#7E5E9E]",
      settingsBtnActive: "bg-[#7E5E9E] text-white shadow-md",
      settingsBtnInactive: "bg-white/40 hover:bg-white text-[#615175]",
      settingsPanel: "bg-[#F7F5FA]/90 backdrop-blur-2xl border-b border-[#E1D8EB]/60 shadow-sm",
      activeTabBadge: "bg-[#7E5E9E]/15 text-[#7E5E9E] font-semibold",
      inactiveTabBadge: "bg-[#E1D8EB]/40 text-[#615175]",
    },
    charcoal: {
      container: "bg-[#0A0A0A] text-[#E0E0E0]",
      header: "bg-[#0A0A0A]/80 border-b border-[#262626]",
      headerTitle: "text-[#F5F5F5]",
      searchBg: "bg-[#171717]/60 backdrop-blur-md border-[#262626] text-[#E0E0E0] focus:bg-[#171717]",
      categoryBtnActive: "bg-[#FAFAFA] text-[#0A0A0A] shadow-md",
      categoryBtnInactive: "bg-[#171717]/40 backdrop-blur-sm text-[#A3A3A3] border-[#262626] hover:bg-[#171717]",
      dailyCard: "bg-gradient-to-br from-[#171717]/90 to-[#0A0A0A]/80 backdrop-blur-xl text-[#F5F5F5]",
      dailyCard3d: "ring-2 ring-zinc-500/60 shadow-[0_8px_30px_rgba(0,0,0,0.5)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(0,0,0,0.8)] rounded-3xl",
      dailyCardText: "text-[#F5F5F5] font-bold",
      dailyCardAuthor: "text-[#D4D4D4] bg-[#262626] border border-[#404040]/50",
      sayingCard: "bg-gradient-to-br from-[#171717]/70 to-[#0A0A0A]/60 backdrop-blur-xl text-[#E0E0E0]",
      sayingCard3d: "ring-2 ring-zinc-500/50 shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.6)] rounded-3xl",
      sayingCardText: "text-[#D4D4D4]",
      badgeLabel: "bg-[#262626] text-[#A3A3A3]",
      settingsBtnActive: "bg-[#FAFAFA] text-[#0A0A0A] shadow-md",
      settingsBtnInactive: "bg-[#171717]/40 hover:bg-[#171717] text-[#A3A3A3]",
      settingsPanel: "bg-[#0A0A0A]/90 backdrop-blur-2xl border-b border-[#262626] shadow-sm",
      activeTabBadge: "bg-[#262626] text-[#E0E0E0] font-semibold",
      inactiveTabBadge: "bg-[#171717] text-[#737373]",
    }
  };

  const currentStyle = themeStyles[theme];

  // Show a toast message with auto-fade
  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  // Toggle favorite quote
  const toggleFavorite = (id: string) => {
    let updated: string[];
    const isFav = favorites.includes(id);
    if (isFav) {
      updated = favorites.filter(f => f !== id);
      showToast(isRtl ? "تمت الإزالة من المفضلة" : "Removed from favorites", "info");
    } else {
      updated = [...favorites, id];
      showToast(isRtl ? "تمت الإضافة إلى المفضلة" : "Added to favorites", "success");
    }
    setFavorites(updated);
    safeLocalStorageSetItem('scholar_sayings_favorites', JSON.stringify(updated));
  };

  // Font size utilities
  const getFontSizeClass = (size: string) => {
    switch (size) {
      case 'sm': return 'text-base md:text-lg leading-[1.7]';
      case 'md': return 'text-lg md:text-xl leading-[1.8]';
      case 'lg': return 'text-xl md:text-2xl leading-[1.9]';
      case 'xl': return 'text-2xl md:text-3xl leading-[2.0]';
      default: return 'text-lg md:text-xl leading-[1.8]';
    }
  };

  // Font style utilities
  const getFontFamilyStyle = (family: string) => {
    switch (family) {
      case 'amiri': return '"Amiri", serif';
      case 'naskh': return '"Noto Naskh Arabic", serif';
      case 'tajawal': return '"Tajawal", sans-serif';
      case 'cairo': return '"Cairo", sans-serif';
      case 'messiri': return '"El Messiri", sans-serif';
      case 'zain': return '"Zain", sans-serif';
      case 'beiruti': return '"Beiruti", sans-serif';
      case 'kufi': return '"Noto Kufi Arabic", sans-serif';
      case 'alexandria': return '"Alexandria", sans-serif';
      case 'ruqaa': return '"Aref Ruqaa", serif';
      case 'lateef': return '"Lateef", serif';
      case 'lalezar': return '"Lalezar", sans-serif';
      case 'marhey': return '"Marhey", sans-serif';
      case 'rakkas': return '"Rakkas", sans-serif';
      default: return '"Amiri", serif';
    }
  };

  const changeFontSize = (size: 'sm' | 'md' | 'lg' | 'xl') => {
    setFontSize(size);
    safeLocalStorageSetItem('scholar_sayings_font_size', size);
  };

  const changeFontFamily = (family: 'amiri' | 'naskh' | 'tajawal' | 'cairo' | 'messiri' | 'zain' | 'beiruti' | 'kufi' | 'alexandria' | 'ruqaa' | 'lateef' | 'lalezar' | 'marhey' | 'rakkas') => {
    setFontFamily(family);
    safeLocalStorageSetItem('scholar_sayings_font_family', family);
  };

  const changeTheme = (newTheme: 'system' | 'cream' | 'emerald' | 'midnight' | 'lavender' | 'charcoal') => {
    setTheme(newTheme);
    safeLocalStorageSetItem('scholar_sayings_theme', newTheme);
    showToast(isRtl ? `تم تفعيل ثيم: ${t(('theme_' + newTheme) as any)}` : `Activated theme: ${t(('theme_' + newTheme) as any)}`, 'success');
  };

  // Daily Quote determination based on day of month (stable per day)
  const dailyQuote = useMemo(() => {
    const dayOfMonth = new Date().getDate();
    const idx = dayOfMonth % SCHOLAR_SAYINGS.length;
    return SCHOLAR_SAYINGS[idx];
  }, []);

  // Action: Copy Quote to Clipboard
  const handleCopy = (saying: ScholarSaying) => {
    const textToCopy = `"${saying.text}" \n— ${saying.scholarName}`;
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        showToast(t('sayings_copy_success'), 'success');
      })
      .catch(() => {
        showToast(isRtl ? "فشل النسخ" : "Copy failed", 'info');
      });
  };

  // Action: Share Quote
  const handleShare = (saying: ScholarSaying) => {
    const shareText = `"${saying.text}"\n\n✍️ *${saying.scholarName}*\n\n— تمت المشاركة عبر تطبيق أذكار المؤمن\n${window.location.origin}`;
    
    shareContent(t('sayings_title'), shareText);
  };

  // Action: Shuffle / Randomize Quote to trigger inspiration
  const handleShuffleInspiration = () => {
    const randomIdx = Math.floor(Math.random() * SCHOLAR_SAYINGS.length);
    const randomSaying = SCHOLAR_SAYINGS[randomIdx];
    // Find category of random saying
    setActiveTab(randomSaying.category);
    // Focus search on scholarName
    setSearchQuery(randomSaying.scholarName);
    showToast(isRtl ? `عرض أقوال: ${randomSaying.scholarName}` : `Showing sayings by: ${randomSaying.scholarName}`, 'info');
  };

  // Action: Export / Download card as image (Png)
  const handleDownload = async (elementId: string, filename: string) => {
    const el = document.getElementById(elementId);
    if (!el) return;
    setDownloadingId(elementId);
    try {
      await new Promise(resolve => setTimeout(resolve, 150));
      const dataUrl = await toPng(el, {
        cacheBust: true,
        style: {
          transform: 'scale(1)',
          borderRadius: '24px'
        },
        pixelRatio: 2,
        filter: (node) => {
          if (node.nodeType === 1) {
            return !(node as Element).hasAttribute('data-html2canvas-ignore');
          }
          return true;
        }
      });
      const link = document.createElement('a');
      link.download = `${filename}.png`;
      link.href = dataUrl;
      link.click();
      showToast(isRtl ? "تم تحميل البطاقة بنجاح" : "Card downloaded successfully", "success");
    } catch (err) {
      console.error('Failed to export image:', err);
      showToast(isRtl ? "فشل تحميل البطاقة" : "Failed to download card", "info");
    } finally {
      setDownloadingId(null);
    }
  };

  React.useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Tabs structure with count tracking
  const scholarTabs = useMemo(() => {
    const getCount = (cat: ScholarSaying['category'] | 'favorites') => {
      if (cat === 'favorites') return favorites.length;
      return SCHOLAR_SAYINGS.filter(s => s.category === cat).length;
    };

    return [
      { id: 'sages' as const, name: t('sayings_sages'), icon: <Lightbulb size={18} />, color: "from-amber-500 to-amber-700", count: getCount('sages') },
      { id: 'scholars' as const, name: t('sayings_scholars'), icon: <Library size={18} />, color: "from-blue-500 to-indigo-700", count: getCount('scholars') },
      { id: 'successors' as const, name: t('sayings_successors'), icon: <History size={18} />, color: "from-emerald-500 to-teal-700", count: getCount('successors') },
      { id: 'companions' as const, name: t('sayings_companions'), icon: <Users size={18} />, color: "from-orange-500 to-red-600", count: getCount('companions') },
      { id: 'thinkers' as const, name: t('sayings_thinkers'), icon: <Feather size={18} />, color: "from-purple-500 to-pink-700", count: getCount('thinkers') },
      { id: 'favorites' as const, name: t('sayings_favorites'), icon: <Heart size={18} fill="currentColor" />, color: "from-rose-500 to-red-600", count: getCount('favorites') }
    ];
  }, [favorites.length, t]);

  // Shuffled order mapping for Refresh button
  const [shuffledMap, setShuffledMap] = useState<Record<string, number>>({});
  const [refreshCount, setRefreshCount] = useState(0);

  const handleRefreshSayings = () => {
    const newMap: Record<string, number> = { ...shuffledMap };
    SCHOLAR_SAYINGS.forEach(s => {
      newMap[s.id] = Math.random();
    });
    setShuffledMap(newMap);
    setRefreshCount(prev => prev + 1);
    
    // Smooth scroll back to top of the screen/container
    setTimeout(() => {
      if (topRef.current) {
        topRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      const mainEl = document.querySelector('main');
      if (mainEl) {
        mainEl.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 50);

    showToast(isRtl ? "تم تحديث وعرض باقة جديدة من روائع الأقوال عشوائياً" : "Refreshed and displayed a new batch of sayings", "success");
  };

  // Combined Filtering: Tab Selection + Search Query
  const filteredSayings = useMemo(() => {
    let result = SCHOLAR_SAYINGS;

    // Filter by Tab
    if (activeTab === 'favorites') {
      result = SCHOLAR_SAYINGS.filter(s => favorites.includes(s.id));
    } else {
      result = SCHOLAR_SAYINGS.filter(s => s.category === activeTab);
    }

    // Filter by Search Query (Case Insensitive search inside quote text and scholar name)
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(s => 
        s.text.toLowerCase().includes(q) || 
        s.scholarName.toLowerCase().includes(q)
      );
    }

    // Sort Pinned items first, and shuffle the rest based on shuffledMap
    return [...result].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      
      const scoreA = shuffledMap[a.id] ?? 0;
      const scoreB = shuffledMap[b.id] ?? 0;
      return scoreA - scoreB;
    });
  }, [activeTab, favorites, searchQuery, shuffledMap]);

  return (
    <div 
      ref={topRef}
      className={cn("relative min-h-screen pb-16 font-sans transition-colors duration-500", currentStyle.container, isRtl ? "text-right" : "text-left")} 
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* Subtle modern dot pattern overlay for the background */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" 
        style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 2px, transparent 0)', backgroundSize: '32px 32px' }} 
      />

      {/* Dynamic Floating Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 bg-slate-900/90 dark:bg-white/90 backdrop-blur-xl text-white dark:text-slate-900 text-xs font-black rounded-full shadow-2xl border border-white/10 dark:border-black/10"
          >
            {toastType === 'success' ? (
              <CheckCircle2 size={16} className="text-emerald-400 dark:text-emerald-600 animate-pulse" />
            ) : (
              <Info size={16} className="text-amber-400 dark:text-amber-600" />
            )}
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decorative Top Background (only visible when in standard light/dark system mode) */}
      {theme === 'system' && (
        <div className="absolute top-0 inset-x-0 h-80 bg-gradient-to-b from-amber-500/10 via-transparent to-transparent pointer-events-none" />
      )}

      {/* Premium Header Bar with Integrated Sticky Category Tabs */}
      <div className={cn("sticky top-0 z-40 backdrop-blur-xl transition-all duration-500 pt-3.5 pb-2.5 px-4 sm:px-6 shadow-xs", currentStyle.header)}>
        <div className="flex items-center justify-between">
          <div className={cn("flex items-center gap-3 sm:gap-4", isRtl ? "flex-row" : "flex-row-reverse")}>
            <BackButton />
            <div>
              <div className="flex items-center gap-2">
                <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 shadow-sm", currentStyle.badgeLabel)}>
                  {t('sayings_badge')}
                </span>
              </div>
              <h1 className={cn("text-xl sm:text-2xl font-black tracking-tight mt-0.5 transition-colors duration-500", currentStyle.headerTitle)}>
                {t('sayings_title')}
              </h1>
            </div>
          </div>

          {/* Inline Action Toolbar */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleShuffleInspiration}
              title={isRtl ? "اقتباس عشوائي" : "Shuffle Wisdom"}
              className="p-2.5 sm:p-3 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 transition-all duration-300 active:scale-90"
            >
              <Shuffle size={18} />
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              title={isRtl ? "إعدادات القراءة والمظهر" : "Reading Settings & Themes"}
              className={cn(
                "p-2.5 sm:p-3 rounded-2xl transition-all duration-500 flex items-center gap-2 font-black text-xs active:scale-90 shadow-sm",
                showSettings 
                  ? currentStyle.settingsBtnActive 
                  : currentStyle.settingsBtnInactive
              )}
            >
              <SlidersHorizontal size={16} />
              <span className="hidden sm:inline">{isRtl ? "تخصيص" : "Customize"}</span>
            </button>
          </div>
        </div>

        <p className="text-[11px] opacity-60 mt-1 font-bold max-w-xl leading-relaxed tracking-wide hidden sm:block">
          {t('sayings_subtitle')}
        </p>

        {/* Sticky Category Tabs Bar */}
        <div className="relative overflow-hidden pt-2 border-t border-black/5 dark:border-white/10 mt-2">
          <div className="flex gap-2 overflow-x-auto pb-0.5 hide-scrollbar touch-pan-x snap-x scroll-smooth -mx-1 px-1">
            {scholarTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              if (tab.id === 'favorites' && tab.count === 0) return null;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "relative shrink-0 flex items-center gap-2 px-3.5 py-1.5 rounded-xl transition-all duration-300 outline-none snap-center group active:scale-95 border cursor-pointer",
                    isActive 
                      ? cn("shadow-md border-transparent", currentStyle.categoryBtnActive)
                      : cn("border-black/5 dark:border-white/5", currentStyle.categoryBtnInactive)
                  )}
                >
                  <span className={cn(
                    "transition-all duration-300 group-hover:scale-110",
                    isActive 
                      ? "text-inherit" 
                      : "text-slate-400 group-hover:text-amber-500"
                  )}>
                    {tab.icon}
                  </span>
                  
                  <span className="text-xs font-black tracking-wide whitespace-nowrap">{tab.name}</span>
                  
                  <span className={cn(
                    "text-[10px] font-black px-1.5 py-0.2 rounded-full transition-all duration-300 min-w-[1.2rem] text-center",
                    isActive 
                      ? "bg-white/20 dark:bg-black/20 text-inherit" 
                      : "bg-black/5 dark:bg-white/10 text-slate-500 dark:text-slate-400 group-hover:bg-amber-500/10 group-hover:text-amber-600"
                  )}>
                    {tab.count}
                  </span>

                  {isActive && (
                    <motion.div
                      layoutId="activeTabUnderline"
                      className="absolute inset-0 rounded-xl ring-2 ring-amber-500/50 pointer-events-none"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Expandable Typography & Visual Theme Setting Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={cn("overflow-hidden backdrop-blur-md transition-colors duration-500", currentStyle.settingsPanel)}
          >
            <div className="p-4 sm:px-6 space-y-4 max-w-[1200px] mx-auto relative">
              <div className="flex items-center justify-between pb-2 border-b border-black/5 dark:border-white/5">
                <span className="text-sm font-black opacity-80 flex items-center gap-2">
                  <SlidersHorizontal size={16} />
                  {isRtl ? "إعدادات المظهر والقراءة" : "Appearance & Reading Settings"}
                </span>
                <button
                  onClick={() => setShowSettings(false)}
                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500 text-white hover:bg-rose-600 transition-all active:scale-95 shadow-sm"
                  title={isRtl ? "إغلاق الإعدادات" : "Close settings"}
                >
                  <span className="text-xs font-bold">{isRtl ? "إغلاق" : "Close"}</span>
                  <X size={16} />
                </button>
              </div>
              
              {/* Row 1: Font Selection and Font Size */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Font Family Choose */}
                <div className="space-y-2">
                  <span className="text-xs font-black opacity-60 block">
                    {t('sayings_font_family')}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'amiri', label: 'أميري' },
                      { id: 'naskh', label: 'نسخ' },
                      { id: 'tajawal', label: 'تاجوال' },
                      { id: 'cairo', label: 'كايرو' },
                      { id: 'messiri', label: 'المسيري' },
                      { id: 'zain', label: 'زين' },
                      { id: 'beiruti', label: 'بيروتي' },
                      { id: 'kufi', label: 'كوفي' },
                      { id: 'alexandria', label: 'إسكندرية' },
                      { id: 'ruqaa', label: 'رقعة' },
                      { id: 'lateef', label: 'لطيف' },
                      { id: 'lalezar', label: 'لاليزار' },
                      { id: 'marhey', label: 'مرحي' },
                      { id: 'rakkas', label: 'رقاص' }
                    ].map((font) => (
                      <button
                        key={font.id}
                        onClick={() => changeFontFamily(font.id as any)}
                        className={cn(
                          "px-3 py-1.5 rounded-xl text-xs font-bold transition-all border",
                          fontFamily === font.id 
                            ? "bg-slate-900 dark:bg-white text-white dark:text-slate-950 border-transparent shadow-md scale-105" 
                            : "bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-black/5 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-slate-700"
                        )}
                        style={{ fontFamily: getFontFamilyStyle(font.id) }}
                      >
                        {font.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font Size Choose */}
                <div className="space-y-2">
                  <span className="text-xs font-black opacity-60 block">
                    {t('sayings_font_size')}
                  </span>
                  <div className="flex gap-2">
                    {[
                      { id: 'sm', label: 'A-', title: 'صغير' },
                      { id: 'md', label: 'A', title: 'متوسط' },
                      { id: 'lg', label: 'A+', title: 'كبير' },
                      { id: 'xl', label: 'A++', title: 'كبير جداً' }
                    ].map((sz) => (
                      <button
                        key={sz.id}
                        onClick={() => changeFontSize(sz.id as any)}
                        className={cn(
                          "flex-1 py-1.5 rounded-xl text-xs font-black transition-all border",
                          fontSize === sz.id 
                            ? "bg-slate-900 dark:bg-white text-white dark:text-slate-950 border-transparent shadow-md scale-105" 
                            : "bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-black/5 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-slate-700"
                        )}
                        title={sz.title}
                      >
                        {sz.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Row 2: Premium Color Theme Selection */}
              <div className="space-y-2 pt-2 border-t border-black/5 dark:border-white/5">
                <span className="text-xs font-black opacity-60 block">
                  {t('sayings_theme')}
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  {[
                    { id: 'system', name: t('theme_system'), colorDot: 'bg-gradient-to-r from-blue-500 to-slate-900' },
                    { id: 'cream', name: t('theme_cream'), colorDot: 'bg-[#8c6239]' },
                    { id: 'emerald', name: t('theme_emerald'), colorDot: 'bg-emerald-600' },
                    { id: 'midnight', name: t('theme_midnight'), colorDot: 'bg-indigo-950 border border-indigo-400' },
                    { id: 'lavender', name: t('theme_lavender'), colorDot: 'bg-[#6c4b91]' },
                    { id: 'charcoal', name: t('theme_charcoal'), colorDot: 'bg-zinc-800' }
                  ].map((tItem) => (
                    <button
                      key={tItem.id}
                      onClick={() => changeTheme(tItem.id as any)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all border",
                        theme === tItem.id 
                          ? "ring-2 ring-amber-500 dark:ring-amber-400 bg-white dark:bg-slate-800 border-transparent scale-105 shadow-md" 
                          : "bg-white/50 dark:bg-slate-800/30 text-slate-700 dark:text-slate-300 border-black/5 dark:border-white/5 hover:scale-[1.02]"
                      )}
                    >
                      <span className={cn("w-3.5 h-3.5 rounded-full shrink-0 shadow-inner", tItem.colorDot)} />
                      <span className="truncate">{tItem.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 w-full max-w-[2400px] mx-auto px-3 sm:px-6 py-6 space-y-6">

        {/* 1. Featured Daily Quote Card */}
        {searchQuery === '' && activeTab !== 'favorites' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full relative group"
          >
            {/* Background Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 to-orange-600/20 rounded-[3rem] blur-xl opacity-0 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
            
            <div
              id="daily-saying-card-export"
              className={cn(
                "relative overflow-hidden rounded-[2.8rem] p-7 md:p-10 w-full backdrop-blur-md",
                currentStyle.dailyCard,
                (currentStyle as any).dailyCard3d
              )}
            >
              {/* Animated Background Patterns */}
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-amber-400/10 blur-[80px] rounded-full pointer-events-none animate-pulse" />
              <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-orange-500/10 blur-[80px] rounded-full pointer-events-none animate-pulse" />
              
              <div className="relative z-10">
                {/* Header info */}
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                      <Sparkles size={20} className="text-amber-500 animate-pulse" />
                    </div>
                    <div>
                      <span className="text-xs font-black uppercase tracking-[0.2em] block leading-none text-amber-600 dark:text-amber-400 mb-1.5">
                        {t('sayings_daily_title')}
                      </span>
                      <span className="text-[10px] opacity-70 block font-bold">
                        {t('sayings_daily_subtitle')}
                      </span>
                    </div>
                  </div>
                  <Quote size={40} className="opacity-10 -rotate-12 absolute -top-2 left-6" />
                </div>

                {/* Daily text with large decorative quote */}
                <div className="relative mb-8 pt-2">
                  <span className="absolute -top-6 -right-4 text-8xl font-serif text-amber-500/10 select-none">«</span>
                  <blockquote 
                    className={cn(
                      "relative z-10 leading-relaxed block text-right transition-all duration-500 px-2", 
                      currentStyle.dailyCardText, 
                      getFontSizeClass(fontSize)
                    )}
                    style={{ fontFamily: getFontFamilyStyle(fontFamily) }}
                  >
                    {dailyQuote.text}
                  </blockquote>
                  <span className="absolute -bottom-10 -left-2 text-8xl font-serif text-amber-500/10 select-none rotate-180">«</span>
                </div>

                {/* Author details & actions */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mt-8">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-8 rounded-full bg-amber-500 shadow-md shadow-amber-500/20" />
                    <span className={cn("text-base font-black px-4 py-2 rounded-2xl transition-all duration-500 shadow-sm", currentStyle.dailyCardAuthor)}>
                      {dailyQuote.scholarName}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2.5 self-end sm:self-auto" data-html2canvas-ignore>
                    {/* Floating Fast Toolbar */}
                    <div className="flex items-center gap-1.5 p-2 rounded-[1.4rem] bg-white/30 dark:bg-black/30 backdrop-blur-md border border-black/5 dark:border-white/10 shadow-lg">
                      <button
                        onClick={() => toggleFavorite(dailyQuote.id)}
                        className={cn(
                          "p-2.5 rounded-xl transition-all duration-300 active:scale-90",
                          favorites.includes(dailyQuote.id)
                            ? "bg-rose-500 text-white shadow-md shadow-rose-500/30 scale-105"
                            : "hover:bg-white/50 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400"
                        )}
                      >
                        <Heart size={18} fill={favorites.includes(dailyQuote.id) ? "currentColor" : "none"} />
                      </button>
                      <button
                        onClick={() => handleCopy(dailyQuote)}
                        className="p-2.5 rounded-xl hover:bg-white/50 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 transition-all duration-300 active:scale-90"
                      >
                        <Copy size={18} />
                      </button>
                      <button
                        onClick={() => handleShare(dailyQuote)}
                        className="p-2.5 rounded-xl hover:bg-white/50 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 transition-all duration-300 active:scale-90"
                      >
                        <Share2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDownload('daily-saying-card-export', `daily-saying-${dailyQuote.id}`)}
                        className={cn(
                          "p-2.5 rounded-xl hover:bg-white/50 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 transition-all duration-300 active:scale-90",
                          downloadingId === 'daily-saying-card-export' ? "opacity-50" : ""
                        )}
                        disabled={downloadingId === 'daily-saying-card-export'}
                      >
                        {downloadingId === 'daily-saying-card-export' ? (
                          <Loader2 size={18} className="animate-spin text-amber-500" />
                        ) : (
                          <Download size={18} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Footer visible only on exported card */}
                <div className="mt-8 pt-5 border-t border-black/5 dark:border-white/10 flex items-center justify-between text-[12px] opacity-100 font-sans text-amber-600 dark:text-amber-400 drop-shadow-md font-bold tracking-wide" dir="rtl">
                  <span className="font-bold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    {isRtl ? "تطبيق المؤمن - روائع الأقوال" : "Believer App - Great Sayings"}
                  </span>
                  <span>{new Date().toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* 2. Interactive Search Bar */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-2xl blur-md opacity-0 group-focus-within:opacity-100 transition duration-500" />
          <div className="relative flex items-center">
            <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-amber-500 transition-colors">
              <Search size={20} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('sayings_search_placeholder')}
              className={cn(
                "w-full pr-14 pl-12 py-3.5 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50 text-sm font-bold transition-all duration-500", 
                currentStyle.searchBg
              )}
            />
            {searchQuery !== '' && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 hover:text-rose-500 transition-colors"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* 3. Sayings List with Staggered Transition Animations */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-2.5 pt-1" dir={isRtl ? "rtl" : "ltr"}>
            <div className="flex items-center gap-2">
              <Quote size={16} className="text-amber-500 animate-pulse" />
              <h2 className="text-sm font-black text-slate-800 dark:text-slate-200">
                {activeTab === 'favorites' ? t('sayings_favorites') : t('sayings_badge')}
              </h2>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 px-2 py-0.5 bg-slate-100 dark:bg-slate-900 rounded-md">
                {filteredSayings.length} {isRtl ? 'حكمة' : 'quotes'}
              </span>
            </div>

            <button
              onClick={handleRefreshSayings}
              title={isRtl ? "عرض باقة عشوائية جديدة" : "Display a new random batch"}
              className="flex items-center gap-1.5 text-[11px] font-black text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-all duration-300 bg-amber-500/5 dark:bg-amber-500/10 px-2.5 py-1.5 rounded-xl border border-amber-500/10 hover:scale-105 active:scale-95 shadow-sm"
            >
              <Shuffle size={11} className="transition-transform duration-500 hover:rotate-180" />
              <span>{isRtl ? 'تحديث المعروض' : 'Refresh List'}</span>
            </button>
          </div>

          <AnimatePresence mode="popLayout">
            {filteredSayings.length > 0 ? (
              <motion.div
                key={`${activeTab}-${searchQuery}-${theme}-${refreshCount}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 gap-4 md:gap-[18px]"
              >
                {filteredSayings.map((saying, index) => {
                  const isFav = favorites.includes(saying.id);
                  const isDownloading = downloadingId === `saying-card-export-${saying.id}`;

                  return (
                    <motion.div
                      key={saying.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(index * 0.03, 0.3) }}
                      className="w-full px-0.5 py-0.5"
                    >
                      <div
                        id={`saying-card-export-${saying.id}`}
                        className={cn(
                          "group relative p-5 sm:p-7 rounded-[1.75rem] w-full overflow-hidden bg-gradient-to-b",
                          currentStyle.sayingCard,
                          (currentStyle as any).sayingCard3d,
                          saying.isPinned
                            ? "ring-2 ring-amber-500/50 shadow-[0_8px_30px_rgba(245,158,11,0.15)] from-amber-500/[0.05] to-amber-500/[0.02]"
                            : "from-transparent to-black/[0.01] dark:to-white/[0.02]"
                        )}
                      >
                        {/* Background pattern decoration */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/5 blur-[40px] rounded-full pointer-events-none group-hover:bg-amber-400/10 transition-colors duration-500" />
                        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-400/5 blur-[40px] rounded-full pointer-events-none group-hover:bg-indigo-400/10 transition-colors duration-500" />
                        
                        {/* Large Quote decoration */}
                        <div className="absolute top-4 left-4 text-slate-200/50 dark:text-slate-700/40 pointer-events-none group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500">
                          <Quote size={28} className="transform rotate-180" />
                        </div>



                        <div className="relative z-10 pt-4">
                          {/* Saying Quote text */}
                          <blockquote 
                            className={cn(
                              "leading-[1.8] font-bold transition-all mb-8 text-right pr-2 duration-500", 
                              currentStyle.sayingCardText,
                              getFontSizeClass(fontSize)
                            )}
                            style={{ fontFamily: getFontFamilyStyle(fontFamily) }}
                          >
                            {saying.text}
                          </blockquote>

                          {/* Footer Actions Row */}
                          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-2">
                            {/* Author info */}
                            <div className="flex items-center gap-3">
                              <div className="w-1.5 h-6 rounded-full bg-amber-500 group-hover:h-8 transition-all duration-500" />
                              <span className="text-sm font-black tracking-wide opacity-90">
                                {saying.scholarName}
                              </span>
                            </div>

                            {/* Floating Fast Toolbar */}
                            <div 
                              className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 shadow-sm"
                              data-html2canvas-ignore
                            >
                              {/* Favorite toggle */}
                              <button
                                onClick={() => toggleFavorite(saying.id)}
                                className={cn(
                                  "p-2.5 rounded-xl transition-all duration-300 active:scale-90",
                                  isFav
                                    ? "text-rose-500 bg-rose-50 dark:bg-rose-500/10 scale-105"
                                    : "text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                                )}
                              >
                                <Heart size={16} fill={isFav ? "currentColor" : "none"} />
                              </button>

                              {/* Copy & Share Action Pack */}
                              <button
                                onClick={() => handleCopy(saying)}
                                className="p-2.5 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all duration-300"
                              >
                                <Copy size={16} />
                              </button>

                              <button
                                onClick={() => handleShare(saying)}
                                className="p-2.5 rounded-xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-all duration-300"
                              >
                                <Share2 size={16} />
                              </button>

                              <button
                                onClick={() => handleDownload(`saying-card-export-${saying.id}`, `saying-${saying.id}`)}
                                className={cn(
                                  "p-2.5 rounded-xl text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-all duration-300",
                                  isDownloading ? "opacity-50" : ""
                                )}
                                disabled={isDownloading}
                              >
                                {isDownloading ? (
                                  <Loader2 size={16} className="animate-spin text-amber-500" />
                                ) : (
                                  <Download size={16} />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>


                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            ) : (
              /* No Items state */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className={cn("py-16 text-center rounded-2xl p-6", currentStyle.sayingCard, (currentStyle as any).sayingCard3d)}
              >
                {activeTab === 'favorites' ? (
                  <>
                    <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                      <HeartOff size={32} />
                    </div>
                    <h3 className="font-black text-lg">
                      {t('sayings_no_favorites')}
                    </h3>
                    <p className="opacity-60 text-xs mt-2 max-w-sm mx-auto leading-relaxed">
                      {t('sayings_no_favorites_desc')}
                    </p>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BookOpen size={32} />
                    </div>
                    <h3 className="font-black text-lg">
                      {isRtl ? "لا توجد نتائج بحث مطابقة" : "No matching sayings found"}
                    </h3>
                    <p className="opacity-60 text-xs mt-2 max-w-sm mx-auto leading-relaxed">
                      {isRtl 
                        ? "جرب كتابة عبارات أخرى، أو تصفح الأقسام الأخرى للحصول على الإلهام." 
                        : "Try using different keywords, or check other categories for inspiration."}
                    </p>
                    {searchQuery !== '' && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="mt-4 px-4 py-2 bg-amber-500 text-white text-xs font-black rounded-xl hover:bg-amber-600 transition-colors"
                      >
                        {isRtl ? "عرض كل الأقوال" : "View All Sayings"}
                      </button>
                    )}
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
      </div>
    </div>
  );
};
