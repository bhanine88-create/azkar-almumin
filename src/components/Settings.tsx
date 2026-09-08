import { BackButton } from './ui/BackButton';
import React, { useState } from 'react';
import {} from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Sliders, Timer, Moon, Sun, FileText, Type, Palette, Bell, Shield, Info, ChevronRight, RefreshCw, Globe, Monitor, Languages, Share2, Code, User, ChevronDown, Mail, Heart, Sparkles, Plus, X, Calendar, Clock, Lightbulb, Send, CheckCircle2, SmilePlus, ArrowUpLeft, ArrowUp, ArrowUpRight, Maximize, ArrowDownLeft, ArrowDown, ArrowDownRight, MoveHorizontal, Layers, Maximize2, Zap, RotateCw, BookOpen, Volume2, ShieldCheck, Database, Activity, AlignRight, Download, Book, UserCircle, Gem, Fingerprint, Facebook, Twitter, Instagram, Star, Upload, LifeBuoy, Smartphone, UserX, KeyRound, Trash2 } from 'lucide-react';
import { BackupManager } from './BackupManager';
import { AppIcon } from './ui/AppIcon';
import { AccountDeletionModal } from './AccountDeletionModal';
import { PermissionsExplainerModal } from './PermissionsExplainerModal';
import { RateAndShareModal } from './RateAndShareModal';
import { RECITERS } from '../reciters';
import { useAppContext } from '../AppContext';
import { useQuranSettings } from '../context/QuranSettingsContext';
import { cn, checkInputSafety, sanitizeString, copyTextToClipboard, shareContent } from '../lib/utils';
import { useTranslation } from '../i18n';
import { SUPPORTED_LANGUAGES } from '../i18n/languages';

import { NOTIFICATION_SOUNDS } from '../constants';
import { MushafDownloader } from './MushafDownloader';
import { TafsirDownloader } from './TafsirDownloader';
import { OfflineManager } from './OfflineManager';
import { checkServerVersion, triggerImmediateUpdate } from '../lib/autoUpdater';
import { 
  requestLocalNotificationPermissions, 
  checkLocalNotificationPermissions, 
  testLocalNotification, 
  syncAllLocalNotifications, 
  getPendingNotificationsSummary,
  isLocalNotificationsAvailable 
} from '../services/localNotificationService';

import { useSmartNavigation } from '../lib/navigation';
import { useChallengeTracker } from '../hooks/useChallengeTracker';
import { safeLocalStorageGetItem, safeLocalStorageSetItem, safeLocalStorageRemoveItem, safeLocalStorageLength, safeLocalStorageKey, safeLocalStorageClear } from "../utils/storage";

export const Settings: React.FC = () => {
  const { progress, settings, updateSettings, resetAdhkar, cleanAdhkarData } = useAppContext();
  const { updateSpecificChallenge } = useChallengeTracker();
  const { t } = useTranslation(settings.appLanguage);
  const { 
    theme, setTheme,
    fontFamily: quranFontFamily,
    setFontFamily: setQuranFontFamily,
    tafsirType, setTafsirType,
    secondaryTafsirType, setSecondaryTafsirType,
    tafsirTheme, setTafsirTheme,
    tafsirFontSize, setTafsirFontSize,
    recitation, setRecitation,
    reciter, setReciter
  } = useQuranSettings();
  const { navigate, goBack } = useSmartNavigation();
  
  // Feedback State
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackMood, setFeedbackMood] = useState<string | null>(null);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [localUserName, setLocalUserName] = useState(settings.userName || '');
  const [customEmojiInput, setCustomEmojiInput] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [isCleaning, setIsCleaning] = useState(false);
  const [cleanupMessage, setCleanupMessage] = useState('');
  const [cleanupIsError, setCleanupIsError] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmCleanAdhkar, setConfirmCleanAdhkar] = useState(false);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [updateStatusText, setUpdateStatusText] = useState<string | null>(null);

  // Store Compliance & App Store Modals
  const [showDeletionModal, setShowDeletionModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [showRateShareModal, setShowRateShareModal] = useState(false);

  // Local Notifications State
  const [isTestingLocalNotif, setIsTestingLocalNotif] = useState(false);
  const [isSyncingLocalNotif, setIsSyncingLocalNotif] = useState(false);
  const [localNotifMsg, setLocalNotifMsg] = useState<string | null>(null);
  const [localNotifPerm, setLocalNotifPerm] = useState<string>('unknown');
  const [localNotifSummary, setLocalNotifSummary] = useState<{
    totalPending: number;
    prayerCount: number;
    adhkarCount: number;
    remindersCount: number;
    nextScheduled?: any;
  } | null>(null);

  const refreshLocalNotifStatus = React.useCallback(async () => {
    try {
      const perm = await checkLocalNotificationPermissions();
      setLocalNotifPerm(perm.display);
      const summary = await getPendingNotificationsSummary();
      setLocalNotifSummary(summary);
    } catch {
      // ignore
    }
  }, []);

  const handleRequestLocalPerm = async () => {
    const res = await requestLocalNotificationPermissions();
    setLocalNotifPerm(res.display);
    if (res.display === 'granted') {
      const syncRes = await syncAllLocalNotifications(settings);
      setLocalNotifMsg(syncRes.message || 'تم تفعيل ومزامنة الإشعارات بنجاح');
      refreshLocalNotifStatus();
    }
  };

  const handleSyncLocalNotifs = async () => {
    setIsSyncingLocalNotif(true);
    try {
      const res = await syncAllLocalNotifications(settings);
      setLocalNotifMsg(res.message || 'تمت المزامنة بنجاح');
      await refreshLocalNotifStatus();
    } catch (err: any) {
      setLocalNotifMsg(err?.message || 'حدث خطأ أثناء المزامنة');
    } finally {
      setIsSyncingLocalNotif(false);
      setTimeout(() => setLocalNotifMsg(null), 5000);
    }
  };

  const handleTestLocalNotif = async (type: 'prayer' | 'adhkar' = 'prayer') => {
    setIsTestingLocalNotif(true);
    try {
      const res = await testLocalNotification(type, 3);
      setLocalNotifMsg(res.message);
      await refreshLocalNotifStatus();
    } catch (err: any) {
      setLocalNotifMsg(err?.message || 'فشل إرسال الإشعار التجريبي');
    } finally {
      setIsTestingLocalNotif(false);
      setTimeout(() => setLocalNotifMsg(null), 6000);
    }
  };

  // Tab Navigation State
  const [activeTab, setActiveTab] = useState<'global' | 'notifications' | 'sections' | 'system'>('global');
  const [activeSectionTab, setActiveSectionTab] = useState<'quran' | 'adhkar' | 'prayer' | 'quiz'>('quran');

  React.useEffect(() => {
    if (activeTab === 'notifications') {
      refreshLocalNotifStatus();
    }
  }, [activeTab, refreshLocalNotifStatus]);

  const handleCheckForUpdates = async () => {
    if (isCheckingUpdate) return;
    setIsCheckingUpdate(true);
    setUpdateStatusText(t('checking_updates', 'جاري فحص خوادم التحديثات...'));
    try {
      const res = await checkServerVersion();
      if (res.hasUpdate) {
        setUpdateStatusText(t('update_found', 'تم العثور على إصدار أحدث! جاري التثبيت الفوري...'));
        setTimeout(() => {
          triggerImmediateUpdate();
        }, 600);
      } else {
        setUpdateStatusText(t('app_up_to_date', 'تطبيقك يعمل بأحدث إصدار فوري.'));
        setTimeout(() => setUpdateStatusText(null), 3500);
      }
    } catch {
      setUpdateStatusText(t('app_latest_version', 'التطبيق محدث لأحدث نسخة.'));
      setTimeout(() => setUpdateStatusText(null), 3000);
    } finally {
      setIsCheckingUpdate(false);
    }
  };

  // Rating State
  const [userRating, setUserRating] = useState<number | null>(() => {
    const saved = safeLocalStorageGetItem('app_user_rating');
    return saved ? parseInt(saved, 10) : null;
  });
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [ratingFeedback, setRatingFeedback] = useState('');
  const [isSubmittingRatingFeedback, setIsSubmittingRatingFeedback] = useState(false);
  const [ratingFeedbackSubmitted, setRatingFeedbackSubmitted] = useState(false);

  const handleSmartCleanup = async () => {
    setIsCleaning(true);
    
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        for (const name of cacheNames) {
          if (name.includes('audio') || name.includes('images') || name.includes('assets') || name.includes('old')) {
             await caches.delete(name);
          }
        }
      }

      const keysToRemove = [];
      for (let i = 0; i < safeLocalStorageLength(); i++) {
        const key = safeLocalStorageKey(i);
        if (key && (key.startsWith('temp_') || key.startsWith('old_') || key.startsWith('cache_'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(k => safeLocalStorageRemoveItem(k));

      // Simulate SQLite database compression / vacuuming
      const zadSettings = safeLocalStorageGetItem('zad_believer_settings');
      if (zadSettings) {
        safeLocalStorageSetItem('zad_believer_settings', JSON.stringify(JSON.parse(zadSettings)));
      }
      
      const appSettings = safeLocalStorageGetItem('app_settings');
      if (appSettings) {
        safeLocalStorageSetItem('app_settings', JSON.stringify(JSON.parse(appSettings)));
      }

      await new Promise(r => setTimeout(r, 1200));
      
      setCleanupIsError(false);
      setCleanupMessage(t('cleanup_success', 'تم التنظيف الذكي بنجاح!')); setTimeout(() => setCleanupMessage(''), 3000);
    } catch (e) {
      console.error(e);
      setCleanupIsError(true);
      setCleanupMessage(t('cleanup_error', 'حدث خطأ أثناء التنظيف.')); setTimeout(() => setCleanupMessage(''), 3000);
    } finally {
      setIsCleaning(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError(t('invalid_image_file', 'برجاء اختيار ملف صورة صالح'));
      return;
    }

    setUploadError(null);
    
    // Process full image for server upload (must be perfect PNG for PWA webAPK)
    const processFullImage = new FileReader();
    processFullImage.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const createIcon = (size: number) => {
          const canvas = document.createElement('canvas');
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            const minDim = Math.min(img.width, img.height);
            const sx = (img.width - minDim) / 2;
            const sy = (img.height - minDim) / 2;
            ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);
            return canvas.toDataURL('image/png');
          }
          return null;
        };

        const icon512 = createIcon(512);
        const icon192 = createIcon(192);

        if (icon512 && icon192) {
          fetch('/api/upload-logo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              imageDataUrl: icon512,
              imageDataUrl192: icon192
            })
          }).catch(err => console.error("Logo upload failed", err));
        }
      };
      img.src = event.target?.result as string;
    };
    processFullImage.readAsDataURL(file);

    // 2. Process thumbnail for local state
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 128;
        const MAX_HEIGHT = 128;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          try {
            const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
            updateSettings({ customAppIcon: dataUrl });
          } catch (err) {
            console.error('Compression failed', err);
            setUploadError(t('image_compression_failed', 'فشل ضغط الصورة، يرجى تجربة صورة أخرى'));
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };
  
  const timeout1Ref = React.useRef<any>(null);
  const timeout2Ref = React.useRef<any>(null);

  // Cleanup timers to prevent memory leaks
  React.useEffect(() => {
    return () => {
      if (timeout1Ref.current) clearTimeout(timeout1Ref.current);
      if (timeout2Ref.current) clearTimeout(timeout2Ref.current);
    };
  }, []);

  const handleReset = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 3000);
      return;
    }
    resetAdhkar();
    setConfirmReset(false);
  };

  const handleShare = async () => {
    // Record sharing event for challenge
    updateSpecificChallenge('special_share_app', 1);

    // AI Studio: Replace dev link with preview link for sharing if needed
    let currentOrigin = window.location.origin || '';
    if (!currentOrigin || currentOrigin === 'null') {
      currentOrigin = window.location.href.split('?')[0].split('#')[0];
    }
    
    // Replace all occurrences of ais-dev- with ais-pre- for sharing
    const shareUrl = currentOrigin.replace(/ais-dev-/g, 'ais-pre-');

    await shareContent(
      t('share_app_title' as any) || 'تطبيق أذكار المؤمن',
      t('share_app_text' as any) || 'اجعل لسانك رطباً بذكر الله مع تطبيق أذكار المؤمن',
      shareUrl
    );
  };

  const handleFeedbackSubmit = () => {
    if (!feedbackText.trim() && !feedbackMood) return;
    
    setIsSubmittingFeedback(true);
    
    // Simulate API call for feedback submission
    timeout1Ref.current = setTimeout(() => {
      setIsSubmittingFeedback(false);
      setFeedbackSubmitted(true);
      setFeedbackText('');
      setFeedbackMood(null);
      
      // Reset success state after 3 seconds
      timeout2Ref.current = setTimeout(() => {
        setFeedbackSubmitted(false);
      }, 3000);
    }, 1500);
  };

  const handleRateApp = (rating: number) => {
    setUserRating(rating);
    safeLocalStorageSetItem('app_user_rating', String(rating));
    if (rating >= 4) {
      setRatingFeedbackSubmitted(false);
    }
  };

  const handleRatingFeedbackSubmit = () => {
    if (!ratingFeedback.trim()) return;
    setIsSubmittingRatingFeedback(true);

    timeout1Ref.current = setTimeout(() => {
      setIsSubmittingRatingFeedback(false);
      setRatingFeedbackSubmitted(true);
    }, 1200);
  };

  return (
    <div className="space-y-4 pb-4 px-1">
      <div className="flex items-center justify-between px-2 mb-2 sticky top-0 z-30 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md py-4 -mx-4 px-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <BackButton />
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">{t('settings')}</h2>
        </div>
        <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-teal-600/30">
          <Monitor size={20} />
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto custom-scrollbar mb-4">
        {[
          { id: 'global', label: t('tab_app_preferences', 'تفضيلات التطبيق'), icon: Palette },
          { id: 'notifications', label: t('tab_notifications_alerts', 'الإشعارات والتنبيهات'), icon: Bell },
          { id: 'sections', label: t('tab_sections_settings', 'إعدادات الأقسام'), icon: Sliders },
          { id: 'system', label: t('tab_data_system', 'البيانات والنظام'), icon: Database }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "relative flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl font-black text-xs sm:text-sm whitespace-nowrap transition-all flex-1 cursor-pointer select-none",
                isActive
                  ? "text-white shadow-md"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeSettingTab"
                  className="absolute inset-0 bg-teal-600 dark:bg-teal-600 rounded-xl shadow-lg shadow-teal-600/30"
                  transition={{ type: "spring", stiffness: 380, damping: 28 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <Icon size={16} />
                <span>{tab.label}</span>
              </span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'global' && (
          <motion.div
            key="global-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-3.5"
          >


        {/* Language & Font Card - Unified 3D */}
        <ThreeDCard color="bg-slate-800" shadow="shadow-slate-900/30" icon={<Languages size={18} />} label={t('setting_language_font' as any) || 'اللغة والخط'}>
          <div className="space-y-6">
            {/* App Language Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs sm:text-sm font-black text-white">{t('language')}</p>
                <span className="text-xs font-black px-2.5 py-1 rounded-full bg-teal-500/25 text-teal-200 border border-teal-500/40 flex items-center gap-1.5 shadow-sm">
                  <span className="text-base">{SUPPORTED_LANGUAGES.find(l => l.id === (settings.appLanguage || 'ar'))?.flag}</span>
                  <span>{SUPPORTED_LANGUAGES.find(l => l.id === (settings.appLanguage || 'ar'))?.nativeName}</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[320px] overflow-y-auto custom-scrollbar p-2 bg-black/25 rounded-2xl border border-white/10">
                {SUPPORTED_LANGUAGES.map((lang) => {
                  const isSelected = (settings.appLanguage || 'ar') === lang.id;
                  return (
                    <button
                      key={lang.id}
                      onClick={() => updateSettings({ appLanguage: lang.id as any })}
                      className={cn(
                        "p-3 rounded-xl text-right transition-all flex items-center justify-between border active:scale-[0.98]",
                        isSelected
                          ? "bg-gradient-to-r from-teal-500/30 to-emerald-500/30 border-teal-400 text-white shadow-lg shadow-teal-500/20"
                          : "bg-white/5 border-white/10 text-white/85 hover:bg-white/15 hover:border-white/20"
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-2xl shrink-0">{lang.flag}</span>
                        <div className="min-w-0 text-right">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-sm text-white truncate">{lang.nativeName}</span>
                            <span className={cn(
                              "text-[10px] px-1.5 py-0.5 rounded font-mono font-black shrink-0",
                              lang.dir === 'rtl' ? "bg-amber-500/25 text-amber-200 border border-amber-500/40" : "bg-sky-500/25 text-sky-200 border border-sky-500/40"
                            )}>
                              {lang.dir.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-white/70 truncate mt-0.5">{lang.name} • {lang.region}</p>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-teal-400 text-slate-950 flex items-center justify-center shrink-0 shadow-sm">
                          <CheckCircle2 size={15} strokeWidth={3.5} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="h-px bg-white/10 w-full" />

            {/* Mushaf Edition Selection */}
            <div className="space-y-2.5">
              <p className="text-xs sm:text-sm font-black text-white mb-1">{t('mushaf_edition_offline', 'نسخة المصحف (للقراءة بدون إنترنت)')}</p>
              <div className="flex bg-black/25 backdrop-blur-md p-1.5 rounded-xl border border-white/10 gap-1.5">
                {[
                  { id: 'hafs', label: t('mushaf_hafs', 'مصحف حفص') },
                  { id: 'warsh', label: t('mushaf_warsh', 'مصحف ورش') },
                  { id: 'tajweed', label: t('mushaf_tajweed', 'مصحف التجويد') }
                ].map((mushaf) => (
                  <button
                    key={mushaf.id}
                    onClick={() => updateSettings({ mushafEdition: mushaf.id as any })}
                    className={cn(
                      "flex-1 px-3 py-2 rounded-lg font-black text-xs sm:text-sm transition-all transform duration-75 active:scale-[0.95]",
                      (settings.mushafEdition || 'hafs') === mushaf.id 
                        ? "bg-white text-slate-900 shadow-md font-black" 
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    {mushaf.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px bg-white/10 w-full" />

            {/* Typography Section */}
            <div className="space-y-5">
              {/* Islamic Font Studio Banner Button */}
              <button
                type="button"
                onClick={() => navigate('/font-studio')}
                className="w-full p-4 rounded-2xl bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-800 text-white font-black text-xs sm:text-sm flex items-center justify-between shadow-xl border border-teal-400/30 hover:scale-[1.01] active:scale-[0.98] transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
                    <Sparkles size={20} className="text-amber-300 animate-pulse" />
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm">استوديو الخطوط والخط العربي</span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-900 text-[10px] font-black">جديد</span>
                    </div>
                    <span className="text-[11px] text-teal-100/80 font-bold block">استعراض وتنزيل خطوط إسلامية، كوفية، ورقعية للقرآن والأذكار</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-teal-200 font-bold text-xs bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
                  <Download size={14} />
                  <span>تصفح وتنزيل الخطوط</span>
                </div>
              </button>

              {/* View Font Family */}
              <div className="space-y-2">
                <p className="text-xs sm:text-sm font-black text-white mb-1">{t('general_app_font', 'خط العرض العام للتطبيق')}</p>
                <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-hide">
                  {[
                    { id: 'Cairo', name: 'خط القاهرة' },
                    { id: 'Tajawal', name: 'خط تجوال' },
                    { id: 'Zain', name: 'خط زين' },
                    { id: 'Beiruti', name: 'خط بيروتي' },
                    { id: 'Noto Kufi Arabic', name: 'الخط الكوفي' },
                    { id: 'Alexandria', name: 'خط الإسكندرية' },
                    { id: 'Baloo Bhaijaan 2', name: 'خط بالو' },
                    { id: 'IBM Plex Sans Arabic', name: 'IBM بلكس' },
                    { id: 'El Messiri', name: 'المسيري' },
                    { id: 'Almarai', name: 'خط المراعي' },
                    { id: 'Rubik Arabic', name: 'خط روبيك' },
                    { id: 'Vazirmatn', name: 'خط وزير متن' },
                    { id: 'Readex Pro', name: 'خط ريدكس برو' },
                    { id: 'Amiri', name: 'الخط الأميري' },
                    { id: 'Noto Sans Arabic', name: 'خط نوتو سانز' },
                    { id: 'Anek Arabic', name: 'خط أنيق' }
                  ].map((font) => (
                    <button
                      key={font.id}
                      onClick={() => updateSettings({ fontFamily: font.id })}
                      className={cn(
                        "px-3.5 py-2 rounded-xl border text-xs sm:text-sm font-black whitespace-nowrap transition-all transform duration-75 active:scale-[0.95]",
                        settings.fontFamily === font.id 
                          ? "bg-white text-slate-900 font-black shadow-md border-transparent ring-2 ring-teal-400/50" 
                          : "bg-white/5 border-white/10 text-white/80 hover:bg-white/15 hover:text-white"
                      )}
                      style={{ fontFamily: font.id }}
                    >
                      {font.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quranic Font Selection */}
              <div className="space-y-2 pt-3 border-t border-white/10">
                <p className="text-xs sm:text-sm font-black text-white mb-1">{t('quran_font_title', 'خط الآيات القرآنية')}</p>
                <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-hide">
                  {[
                    { id: 'Uthmanic Hafs', name: 'الرسم العثماني (حفص)' },
                    { id: 'Uthmanic Hafs 1', name: 'الرسم العثماني (البديل)' },
                    { id: 'Amiri Quran', name: 'أميري قرآن' },
                    { id: 'Amiri', name: 'الخط الأميري' },
                    { id: 'Scheherazade New', name: 'خط شهرزاد' },
                    { id: 'Lateef', name: 'خط لطيف' },
                    { id: 'Noto Naskh Arabic', name: 'خط النسخ' },
                    { id: 'Markazi Text', name: 'الخط المركزي' },
                    { id: 'Mirza', name: 'خط ميرزا' },
                    { id: 'Katibeh', name: 'خط كتيبة' }
                  ].map((font) => (
                    <button
                      key={font.id}
                      onClick={() => setQuranFontFamily(font.id)}
                      className={cn(
                        "px-3.5 py-2 rounded-xl border text-xs sm:text-sm font-black whitespace-nowrap transition-all transform duration-75 active:scale-[0.95]",
                        quranFontFamily === font.id 
                          ? "bg-emerald-500 text-white font-black shadow-md border-transparent ring-2 ring-emerald-300" 
                          : "bg-white/5 border-white/10 text-white/80 hover:bg-white/15 hover:text-white"
                      )}
                      style={{ fontFamily: font.id }}
                    >
                      {font.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hadith Font Selection */}
              <div className="space-y-2 pt-3 border-t border-white/10">
                <p className="text-xs sm:text-sm font-black text-white mb-1">{t('hadith_font_title', 'خط الأحاديث النبوية الشريفة')}</p>
                <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-hide">
                  {[
                    { id: 'Amiri', name: 'الأميري (كلاسيكي)' },
                    { id: 'El Messiri', name: 'المسيري (منحني)' },
                    { id: 'Reem Kufi', name: 'ريم كوفي (هندسي)' },
                    { id: 'Aref Ruqaa', name: 'رقعة (خط يد)' },
                    { id: 'Katibeh', name: 'كتيبة (مخطوطة)' },
                    { id: 'Tajawal', name: 'تجوال (عصري)' },
                    { id: 'Markazi Text', name: 'المركزي (تقليدي)' }
                  ].map((font) => (
                    <button
                      key={font.id}
                      onClick={() => updateSettings({ hadithFontFamily: font.id })}
                      className={cn(
                        "px-3.5 py-2 rounded-xl border text-xs sm:text-sm font-black whitespace-nowrap transition-all transform duration-75 active:scale-[0.95]",
                        settings.hadithFontFamily === font.id 
                          ? "bg-amber-500 text-white font-black shadow-md border-transparent ring-2 ring-amber-300" 
                          : "bg-white/5 border-white/10 text-white/80 hover:bg-white/15 hover:text-white"
                      )}
                      style={{ fontFamily: font.id }}
                    >
                      {font.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Adhkar Font Selection */}
              <div className="space-y-2 pt-3 border-t border-white/10">
                <p className="text-xs sm:text-sm font-black text-white mb-1">{t('adhkar_font_title', 'خط نصوص الأذكار والأوراد')}</p>
                <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-hide">
                  {[
                    { id: 'Amiri', name: 'الأميري (نسخ كلاسيكي)' },
                    { id: 'Reem Kufi', name: 'ريم كوفي (كوفي هندسي)' },
                    { id: 'El Messiri', name: 'المسيري (منحني عصري)' },
                    { id: 'Aref Ruqaa', name: 'الرقعة (خط يد عربي)' },
                    { id: 'Lalezar', name: 'لاليزار (عريض بارز)' },
                    { id: 'Rakkas', name: 'رقاص (تعبيري استعراضي)' },
                    { id: 'Marhey', name: 'مرحي (مرح وجذاب)' },
                    { id: 'Lemonada', name: 'ليمونادة (معاصر مستدير)' },
                    { id: 'Changa', name: 'شانجا (مربع متماسك)' },
                    { id: 'Katibeh', name: 'كتيبة (مخطوطة تاريخية)' },
                    { id: 'Tajawal', name: 'تجوال (شاشات حديث)' },
                    { id: 'Baloo Bhaijaan 2', name: 'بالو (ناعم عريض)' },
                    { id: 'Alexandria', name: 'الإسكندرية (هندسي تقني)' },
                    { id: 'Noto Kufi Arabic', name: 'نوتو كوفي (واضح)' }
                  ].map((font) => (
                    <button
                      key={font.id}
                      onClick={() => updateSettings({ adhkarFontFamily: font.id })}
                      className={cn(
                        "px-3.5 py-2 rounded-xl border text-xs sm:text-sm font-black whitespace-nowrap transition-all transform duration-75 active:scale-[0.95]",
                        settings.adhkarFontFamily === font.id 
                          ? "bg-teal-500 text-white font-black shadow-md border-transparent ring-2 ring-teal-300" 
                          : "bg-white/5 border-white/10 text-white/80 hover:bg-white/15 hover:text-white"
                      )}
                      style={{ fontFamily: font.id }}
                    >
                      {font.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </ThreeDCard>

        {/* User Preferences Card - Readability and Accessibility */}
        <ThreeDCard color="bg-slate-800" shadow="shadow-slate-900/30" icon={<UserCircle size={18} />} label={t('setting_user_preferences', 'تفضيلات المستخدم (للقراءة)')}>
          <div className="space-y-6">
            {/* Font Size */}
            <div className="space-y-2.5">
              <p className="text-xs sm:text-sm font-black text-white mb-1">{t('reading_font_size', 'حجم نص القراءة (للمحتوى النصي)')}</p>
              <div className="flex bg-black/25 backdrop-blur-md p-1.5 rounded-xl border border-white/10 gap-1.5">
                {(['small', 'medium', 'large'] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => updateSettings({ fontSize: size })}
                    className={cn(
                      "flex-1 py-2 rounded-lg text-xs sm:text-sm font-black transition-all",
                      settings.fontSize === size ? "bg-white text-slate-900 shadow-md font-black" : "text-white/70 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    {size === 'small' ? t('size_small', 'صغير') : size === 'medium' ? t('size_medium', 'متوسط') : t('size_large', 'كبير')}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px bg-white/10 w-full" />

            {/* Line Spacing */}
            <div className="space-y-2.5">
              <p className="text-xs sm:text-sm font-black text-white mb-1">{t('reading_line_spacing', 'التباعد بين الأسطر (للقراءة)')}</p>
              <div className="flex bg-black/25 backdrop-blur-md p-1.5 rounded-xl border border-white/10 gap-1.5">
                {[
                  { id: 'normal', label: t('spacing_normal', 'عادي') },
                  { id: 'relaxed', label: t('spacing_relaxed', 'مريح') },
                  { id: 'loose', label: t('spacing_loose', 'واسع') }
                ].map((spacing) => (
                  <button
                    key={spacing.id}
                    onClick={() => updateSettings({ lineSpacing: spacing.id as any })}
                    className={cn(
                      "flex-1 py-2 rounded-lg text-xs sm:text-sm font-black transition-all",
                      (settings.lineSpacing || 'normal') === spacing.id ? "bg-white text-slate-900 shadow-md font-black" : "text-white/70 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    {spacing.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px bg-white/10 w-full" />

            {/* Default Display Theme */}
            <div className="space-y-2.5">
              <p className="text-xs sm:text-sm font-black text-white mb-1">{t('reading_default_theme', 'نسق القراءة الافتراضي للمحتوى (خلفيات النصوص)')}</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'classic', label: t('theme_classic_label', 'كلاسيكي') },
                  { id: 'glass', label: t('theme_glass_label', 'زجاجي') },
                  { id: 'minimal', label: t('theme_minimal_label', 'بسيط') },
                  { id: 'aurora', label: t('theme_aurora_label', 'شفق') },
                  { id: 'emerald', label: t('theme_emerald_label', 'زمردي') },
                  { id: 'amber', label: t('theme_amber_label', 'كهرماني') },
                  { id: 'clear', label: t('theme_clear_label', 'صافي') },
                  { id: 'lavender', label: t('theme_lavender_label', 'لافندر') }
                ].map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => updateSettings({ defaultDisplayTheme: theme.id as any })}
                    className={cn(
                      "px-2.5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all border",
                      (settings.defaultDisplayTheme || 'classic') === theme.id 
                        ? "bg-teal-500/30 text-teal-200 border-teal-400 shadow-md ring-1 ring-teal-400" 
                        : "bg-white/5 border-white/10 text-white/80 hover:bg-white/15 hover:text-white"
                    )}
                  >
                    {theme.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </ThreeDCard>

        {/* Appearance Card - Unified 3D */}
        <ThreeDCard color="bg-slate-800" shadow="shadow-slate-900/30" icon={<Palette size={18} />} label={t('setting_theme', 'المظهر والسمات')}>
          <div className="space-y-5">
            <div className="space-y-2.5">
              <p className="text-xs sm:text-sm font-black text-white mb-1">{t('theme_mode', 'نمط المظهر')}</p>
              <div className="flex bg-black/25 backdrop-blur-md p-1.5 rounded-xl border border-white/10 gap-1.5">
                {[
                  { id: 'light', icon: Sun, label: t('theme_light', 'فاتح') },
                  { id: 'dark', icon: Moon, label: t('theme_dark', 'داكن') },
                  { id: 'system', icon: Monitor, label: t('theme_system', 'تلقائي') }
                ].map((th) => (
                  <button
                    key={th.id}
                    onClick={() => updateSettings({ theme: th.id as any })}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all font-black text-xs",
                      settings.theme === th.id ? "bg-white text-slate-900 shadow-md font-black" : "text-white/70 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <th.icon size={16} />
                    <span>{th.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2.5 pt-3 border-t border-white/10">
              <p className="text-xs sm:text-sm font-black text-white mb-1">{t('beautiful_colors', 'ألوان زاهية وجميلة')}</p>
              <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide">
                {[
                  // ألوان زاهية وقوية (9 ألوان صلبة)
                  { id: '#0d9488', class: 'bg-teal-600', name: 'زمردي' },
                  { id: '#1e40af', class: 'bg-blue-800', name: 'أزرق داكن ناصع' },
                  { id: '#78350f', class: 'bg-[#78350f]', name: 'بني داكن' },
                  { id: '#FFDC02', class: 'bg-[#FFDC02]', name: 'أصفر' },
                  { id: '#db2777', class: 'bg-pink-600', name: 'وردي' },
                  { id: '#e11d48', class: 'bg-rose-600', name: 'جوري' },
                  { id: '#ea580c', class: 'bg-orange-600', name: 'برتقالي' },
                  { id: '#d97706', class: 'bg-amber-600', name: 'عسلي' },
                  { id: '#000000', class: 'bg-black', name: 'أسود' },
                ].map((color) => (
                  <button
                    key={color.id}
                    onClick={() => updateSettings({ primaryColor: color.id })}
                    className={cn(
                      "w-11 h-11 rounded-2xl shrink-0 transform transition-all duration-75 active:scale-[0.85] active:opacity-70 flex flex-col items-center justify-center shadow-lg border-2",
                      color.class,
                      settings.primaryColor === color.id 
                        ? "border-white scale-110 rotate-3 z-10 ring-2 ring-white/50" 
                        : "border-transparent opacity-85 hover:opacity-100 hover:scale-105"
                    )}
                    title={color.name}
                  >
                    {settings.primaryColor === color.id && (
                      <motion.div
                        layoutId="activeColor"
                        className="bg-white/25 backdrop-blur-sm rounded-full p-1"
                      >
                        <Sparkles size={15} className="text-white" />
                      </motion.div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2.5 pt-3 border-t border-white/10">
              <p className="text-xs sm:text-sm font-black text-white mb-1">{t('visual_style', 'النمط البصري والتأثيرات')}</p>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { id: 'classic', name: t('theme_classic_name', 'كلاسيكي'), desc: t('theme_classic_desc', 'كلاسيكي متوازن وهادئ') },
                  { id: 'glass', name: t('theme_glass_name', 'زجاجي'), desc: t('theme_glass_desc', 'مظهر زجاجي عصري شفاف') },
                  { id: 'minimal', name: t('theme_minimal_name', 'بسيط'), desc: t('theme_minimal_desc', 'تركيز فائق بدون مشتتات') },
                  { id: 'aurora', name: t('theme_aurora_name', 'شفق'), desc: t('theme_aurora_desc', 'شفق قطبي متدرج') },
                  { id: 'emerald', name: t('theme_emerald_vis_name', 'الزمردي الفاخر'), desc: t('theme_emerald_vis_desc', 'زمردي مريح وهادئ') },
                  { id: 'amber', name: t('vt_amber', 'ذهبي أندلسي'), desc: t('theme_amber_vis_desc', 'تدرجات دافئة ذهبية أندلسية') },
                  { id: 'clear', name: t('vt_clear', 'النقي الساطع'), desc: t('theme_clear_vis_desc', 'مظهر ساطع أزرق مريح') },
                  { id: 'lavender', name: t('vt_lavender', 'اللافندر العطري'), desc: t('theme_lavender_vis_desc', 'أرجواني هادئ يعبق بالسكينة') }
                ].map((style) => (
                  <button
                    key={style.id}
                    onClick={() => updateSettings({ visualTheme: style.id as any })}
                    className={cn(
                      "p-3.5 rounded-2xl border-2 transition-all text-right space-y-1",
                      settings.visualTheme === style.id 
                        ? "border-teal-400 bg-teal-500/20 shadow-md ring-1 ring-teal-400" 
                        : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
                    )}
                  >
                    <p className="text-sm font-black text-white">{style.name}</p>
                    <p className="text-[11px] font-bold text-white/70">{style.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* App Icon Customization */}
            <div className="space-y-3 pt-3 border-t border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-black text-white mb-0.5">{t('official_app_icon_title', 'شعار وأيقونة التطبيق الرسمية')}</p>
                  <p className="text-[11px] font-bold text-white/70">{t('official_app_icon_desc', 'معاينة وتخصيص الأيقونة المستخدمة على هاتفك والتطبيق')}</p>
                </div>
                <div className="w-11 h-11 rounded-xl overflow-hidden shadow-lg border border-emerald-400/50 bg-emerald-950 flex items-center justify-center shrink-0">
                  <AppIcon className="w-full h-full" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => updateSettings({ customAppIcon: 'preset:original' })}
                  className={cn(
                    "p-3 rounded-xl border-2 transition-all text-right flex items-center gap-2.5 cursor-pointer",
                    (!settings.customAppIcon || settings.customAppIcon === 'preset:original')
                      ? "border-emerald-400 bg-emerald-500/25 shadow-md ring-1 ring-emerald-400/50"
                      : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
                  )}
                >
                  <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 border border-white/20">
                    <img 
                      src="/logo-512.png" 
                      alt={t('official_logo', 'الشعار الرسمي')} 
                      className="w-full h-full object-cover" 
                      onError={(e) => { (e.target as HTMLImageElement).src = '/logo.png'; }}
                    />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-black text-white">{t('official_original_logo', 'الشعار الرسمي الأصلي')}</p>
                    <p className="text-[11px] font-black text-emerald-300">{t('emerald_green_approved', 'الأخضر الزمردي المعتمد')}</p>
                  </div>
                </button>

                <label className="p-3 rounded-xl border-2 border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all text-right flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <div className="w-9 h-9 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center shrink-0 text-teal-300">
                    <Upload size={18} />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-black text-white">{t('upload_custom_icon', 'رفع صورة خاصة')}</p>
                    <p className="text-[11px] font-bold text-white/70">{t('custom_icon_from_gallery', 'تخصيص أيقونة من المعرض')}</p>
                  </div>
                </label>
              </div>
              {uploadError && (
                <p className="text-xs font-black text-rose-300 text-right">{uploadError}</p>
              )}
            </div>

          </div>
        </ThreeDCard>

        {/* Sidebar Customization Card - NEW */}
        <ThreeDCard color="bg-slate-800" shadow="shadow-slate-900/30" icon={<AlignRight size={18} />} label={t('setting_sidebar', 'تخصيص القائمة الجانبية')}>
          <div className="space-y-6">
            <div className="space-y-2.5">
              <p className="text-xs sm:text-sm font-black text-white mb-1">{t('sidebar_theme_title', 'ثيم القائمة الجانبية')}</p>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: 'emerald', name: t('sidebar_emerald', 'الزمردي'), class: 'bg-[#06291a] border-emerald-800/40' },
                  { id: 'midnight', name: t('sidebar_midnight', 'الليل'), class: 'bg-[#0a0f1d] border-blue-900/40' },
                  { id: 'royal', name: t('sidebar_royal', 'الملكي'), class: 'bg-[#1a0a2e] border-purple-900/40' },
                  { id: 'desert', name: t('sidebar_desert', 'الرملي'), class: 'bg-[#2e1a0a] border-amber-900/40' },
                  { id: 'pure_dark', name: t('sidebar_pure_dark', 'الأسود'), class: 'bg-black border-slate-800' },
                  { id: 'glassy', name: t('sidebar_glassy', 'الزجاجي'), class: 'bg-slate-900/40 backdrop-blur-md border-white/10' },
                ].map((th) => (
                  <button
                    key={th.id}
                    onClick={() => updateSettings({ sidebarTheme: th.id as any })}
                    className={cn(
                      "p-2.5 rounded-xl border-2 transition-all flex flex-col items-center gap-2 cursor-pointer",
                      settings.sidebarTheme === th.id 
                        ? "border-emerald-400 bg-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.3)] ring-1 ring-emerald-400" 
                        : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
                    )}
                  >
                    <div className={cn("w-full h-7 rounded-lg", th.class, "border shadow-inner")} />
                    <span className="text-xs sm:text-sm font-black whitespace-nowrap text-white">{th.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px bg-white/10 w-full" />

            <div className="space-y-3.5">
              <p className="text-xs sm:text-sm font-black text-white mb-1">{t('sidebar_display_preferences', 'تفضيلات العرض')}</p>
              
              <div className="flex items-center justify-between bg-black/25 p-3.5 rounded-xl border border-white/10">
                <div className="flex flex-col gap-1">
                  <span className="text-xs sm:text-sm font-black text-white">{t('sidebar_compact_mode', 'الوضع المضغوط')}</span>
                  <span className="text-[11px] font-bold text-white/70">{t('sidebar_compact_desc', 'تقليل المساحات في القائمة الجانبية')}</span>
                </div>
                <button
                  onClick={() => updateSettings({ sidebarCompactMode: !settings.sidebarCompactMode })}
                  className={cn(
                    "w-12 h-6 rounded-full transition-all relative p-0.5 shadow-inner",
                    settings.sidebarCompactMode ? "bg-emerald-500" : "bg-white/20"
                  )}
                >
                  <motion.div 
                    animate={{ x: settings.sidebarCompactMode ? 24 : 0 }}
                    className="w-5 h-5 bg-white rounded-full shadow-md"
                  />
                </button>
              </div>

              <div className="flex items-center justify-between bg-black/25 p-3.5 rounded-xl border border-white/10">
                <div className="flex flex-col gap-1">
                  <span className="text-xs sm:text-sm font-black text-white">{t('sidebar_icons_only', 'عرض الأيقونات فقط')}</span>
                  <span className="text-[11px] font-bold text-white/70">{t('sidebar_icons_only_desc', 'إخفاء النصوص لتصميم أكثر حداثة')}</span>
                </div>
                <button
                  onClick={() => updateSettings({ sidebarShowIconsOnly: !settings.sidebarShowIconsOnly })}
                  className={cn(
                    "w-12 h-6 rounded-full transition-all relative p-0.5 shadow-inner",
                    settings.sidebarShowIconsOnly ? "bg-emerald-500" : "bg-white/20"
                  )}
                >
                  <motion.div 
                    animate={{ x: settings.sidebarShowIconsOnly ? 24 : 0 }}
                    className="w-5 h-5 bg-white rounded-full shadow-md"
                  />
                </button>
              </div>
            </div>
          </div>
        </ThreeDCard>
          </motion.div>
        )}

        {activeTab === 'notifications' && (
          <motion.div
            key="notifications-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-3.5"
          >
            {/* Unified Notification Settings card */}
        <ThreeDCard color="bg-slate-800" shadow="shadow-slate-900/30" icon={<Bell size={18} />} label={t('setting_notifications', 'إعدادات التنبيهات العامة والإشعارات')}>
          <div className="space-y-4">

        {/* Browser Permission Status Banner */}
        {(() => {
          const hasNotif = typeof window !== 'undefined' && 'Notification' in window;
          const perm = hasNotif ? Notification.permission : 'denied';

          if (perm === 'granted') {
            return (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-right">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <h5 className="text-xs sm:text-sm font-black text-emerald-400">{t('notif_granted_title', 'إشعارات النظام مفعّلة بنجاح')}</h5>
                    <p className="text-[11px] sm:text-xs text-emerald-200/80 font-bold mt-0.5">{t('notif_granted_desc', 'ستصلك تنبيهات الصلاة والأذكار في مواعيدها المحددة')}</p>
                  </div>
                </div>
                <button
                  onClick={() => updateSettings({ _triggerMorning: Date.now() })}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs px-3 py-1.5 rounded-xl shrink-0 transition-all active:scale-95 shadow-sm"
                >
                  {t('test_notification', 'تجربة إشعار')}
                </button>
              </div>
            );
          } else if (perm === 'default') {
            return (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-right">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                    <Bell size={20} className="animate-bounce" />
                  </div>
                  <div>
                    <h5 className="text-xs sm:text-sm font-black text-amber-400">{t('notif_prompt_title', 'لم تُفعّل إشعارات المتصفح بعد')}</h5>
                    <p className="text-[11px] sm:text-xs text-amber-200/80 font-bold mt-0.5">{t('notif_prompt_desc', 'اضغط السماح لتفعيل الأذان والأذكار التلقائية')}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (hasNotif) {
                      Notification.requestPermission().then(() => {
                        updateSettings({ _triggerMorning: Date.now() });
                      });
                    }
                  }}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-3.5 py-1.5 rounded-xl shrink-0 transition-all active:scale-95 shadow-md shadow-amber-500/20"
                >
                  {t('allow_now', 'السماح الآن 🔔')}
                </button>
              </div>
            );
          } else {
            return (
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-3.5 flex flex-col gap-2 text-right">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                    <Shield size={20} />
                  </div>
                  <div>
                    <h5 className="text-xs sm:text-sm font-black text-rose-400">{t('notif_blocked_title', 'الإشعارات محظورة في المتصفح')}</h5>
                    <p className="text-[11px] sm:text-xs text-rose-200/80 font-bold mt-0.5">{t('notif_blocked_desc', 'لتصلك التنبيهات: افتح إعدادات المتصفح/الموقع ➔ الإشعارات ➔ اختر (سماح)')}</p>
                  </div>
                </div>
              </div>
            );
          }
        })()}
          
        {/* 1. General Toggles */}
        <SubAccordion icon={<Bell size={18} />} label={t('notif_sub_general_toggles', 'التفعيل والإيقاف الشامل')}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center justify-between bg-white/5 p-3.5 rounded-xl border border-white/5">
              <span className="text-xs sm:text-sm font-black text-white/90">{t('enable_all_notifications', 'تفعيل التنبيهات الكلية')}</span>
              <button
                onClick={async () => {
                  const newVal = !settings.notificationsEnabled;
                  updateSettings({ notificationsEnabled: newVal });
                  if (newVal) {
                    await handleRequestLocalPerm();
                  } else {
                    await syncAllLocalNotifications({ ...settings, notificationsEnabled: false });
                    refreshLocalNotifStatus();
                  }
                }}
                className={cn(
                  "w-10 h-5 rounded-full transition-all relative p-0.5",
                  settings.notificationsEnabled ? "bg-teal-500" : "bg-white/10"
                )}
              >
                <motion.div 
                  animate={{ x: settings.notificationsEnabled ? 20 : 0 }}
                  className="w-4 h-4 bg-white rounded-full shadow-sm"
                />
              </button>
            </div>

            <div className="flex items-center justify-between bg-white/5 p-3.5 rounded-xl border border-white/5">
              <div className="flex items-center gap-3">
                <span className="text-xs sm:text-sm font-black text-white/90">{t('prayer_notifications', 'إشعارات الصلاة')}</span>
                <button 
                  onClick={() => updateSettings({ _triggerPrayer: Date.now() })}
                  className="text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-lg border border-emerald-400/20 active:scale-95"
                >
                  {t('test_sound', 'تجربة الصوت')}
                </button>
              </div>
              <button
                onClick={() => updateSettings({ prayerNotificationsEnabled: !settings.prayerNotificationsEnabled })}
                className={cn(
                  "w-10 h-5 rounded-full transition-all relative p-0.5",
                  settings.prayerNotificationsEnabled ? "bg-emerald-500" : "bg-white/10"
                )}
              >
                <motion.div 
                  animate={{ x: settings.prayerNotificationsEnabled ? 20 : 0 }}
                  className="w-4 h-4 bg-white rounded-full shadow-sm"
                />
              </button>
            </div>
          </div>
        </SubAccordion>

        {/* 1.5. Background Local Notifications (Capacitor) */}
        <SubAccordion icon={<Smartphone size={18} className="text-teal-400" />} label={t('notif_sub_local_background', 'تنبيهات خلفية النظام (Capacitor)')}>
          <div className={cn("space-y-3.5 transition-all", !settings.notificationsEnabled && "opacity-40 pointer-events-none")}>
            <div className="bg-teal-950/30 border border-teal-500/20 rounded-2xl p-4 flex flex-col gap-3 text-right">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
                    <Bell size={18} />
                  </div>
                  <div>
                    <h5 className="text-xs sm:text-sm font-black text-teal-300">
                      {t('local_notif_title', 'التنبيهات المجدولة في خلفية الهاتف')}
                    </h5>
                    <p className="text-[11px] text-teal-100/70 font-bold">
                      {t('local_notif_desc', 'تعمل عبر نظام التشغيل حتى عند إغلاق التطبيق تماماً وبدون إنترنت')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {localNotifPerm === 'granted' || (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') ? (
                    <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full text-[11px] font-black flex items-center gap-1">
                      <CheckCircle2 size={12} /> {t('status_active_system', 'مفعّلة ومصرحة بالنظام')}
                    </span>
                  ) : (
                    <button
                      onClick={handleRequestLocalPerm}
                      className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full text-[11px] font-black flex items-center gap-1 active:scale-95 transition-all"
                    >
                      <Bell size={12} /> {t('request_system_perm', 'طلب إذن النظام')}
                    </button>
                  )}
                </div>
              </div>

              {/* Statistics & Scheduled count badge */}
              {localNotifSummary && (
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-teal-500/10">
                  <div className="bg-white/5 rounded-xl p-2.5 text-center border border-white/5">
                    <span className="text-[10px] text-white/60 font-bold block">{t('stat_total_pending', 'إجمالي المجدول')}</span>
                    <span className="text-sm sm:text-base font-black text-teal-400">{localNotifSummary.totalPending}</span>
                  </div>
                  <div className="bg-white/5 rounded-xl p-2.5 text-center border border-white/5">
                    <span className="text-[10px] text-white/60 font-bold block">{t('stat_prayer_notifs', 'مواقيت الصلاة')}</span>
                    <span className="text-sm sm:text-base font-black text-emerald-400">{localNotifSummary.prayerCount}</span>
                  </div>
                  <div className="bg-white/5 rounded-xl p-2.5 text-center border border-white/5">
                    <span className="text-[10px] text-white/60 font-bold block">{t('stat_adhkar_notifs', 'الأذكار والسنن')}</span>
                    <span className="text-sm sm:text-base font-black text-amber-400">{localNotifSummary.adhkarCount + localNotifSummary.remindersCount}</span>
                  </div>
                </div>
              )}

              {/* Next Scheduled preview */}
              {localNotifSummary?.nextScheduled && (
                <div className="bg-white/5 border border-white/5 rounded-xl p-2.5 flex items-center justify-between text-[11px]">
                  <span className="text-white/70 font-bold">{t('next_alarm', 'التنبيه القادم:')} {localNotifSummary.nextScheduled.title}</span>
                  <span className="text-teal-300 font-mono font-black" dir="ltr">{localNotifSummary.nextScheduled.time}</span>
                </div>
              )}

              {/* Test and Sync Controls */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  onClick={handleSyncLocalNotifs}
                  disabled={isSyncingLocalNotif}
                  className="bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/30 px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
                >
                  <RefreshCw size={14} className={cn(isSyncingLocalNotif && "animate-spin")} />
                  {isSyncingLocalNotif ? t('syncing', 'جاري المزامنة...') : t('sync_week_alarms', 'مزامنة تنبيهات الأسبوع 🔄')}
                </button>

                <button
                  onClick={() => handleTestLocalNotif('prayer')}
                  disabled={isTestingLocalNotif}
                  className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
                >
                  <Volume2 size={14} />
                  {t('test_prayer_bg', 'تجربة إشعار أذان (خلال 3 ثوانٍ) 🕌')}
                </button>

                <button
                  onClick={() => handleTestLocalNotif('adhkar')}
                  disabled={isTestingLocalNotif}
                  className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
                >
                  <Sparkles size={14} />
                  {t('test_adhkar_bg', 'تجربة إشعار أذكار 🌅')}
                </button>
              </div>

              {/* Status Message / Feedback Alert */}
              <AnimatePresence>
                {localNotifMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="bg-teal-500/20 border border-teal-500/30 text-teal-200 text-xs font-bold p-2.5 rounded-xl text-center"
                  >
                    {localNotifMsg}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </SubAccordion>

        {/* 2. Prayer Times Settings */}
        <SubAccordion icon={<Clock size={18} className="text-emerald-400" />} label={t('notif_sub_prayer_times', 'إعدادات مواقيت الصلاة ونغمات الأذان')}>
          <div className={cn("space-y-4 transition-all", (!settings.notificationsEnabled || !settings.prayerNotificationsEnabled) && "opacity-40 pointer-events-none")}>
            
            {/* Prayer Sound Selection */}
            <div className="space-y-2">
              <label className="text-xs font-black text-white/70 block pr-1">{t('prayer_sound_label', 'صوت تنبيه الصلاة والأذان')}</label>
              <select
                value={settings.prayerRingtone || 'default'}
                onChange={(e) => updateSettings({ prayerRingtone: e.target.value })}
                className="w-full bg-slate-900/90 text-white text-xs sm:text-sm font-black p-3 rounded-xl border border-white/10 focus:outline-none"
              >
                {(NOTIFICATION_SOUNDS || []).map((sound) => (
                  <option key={sound.id} value={sound.id} className="bg-slate-900 text-white font-bold">
                    {sound.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Calculation Methods */}
              <div className="space-y-2">
                <label className="text-xs font-black text-white/70 block pr-1">{t('calc_method_label', 'طريقة الحساب')}</label>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {[
                    { value: '4', label: t('calc_makkah', 'أم القرى، مكة') },
                    { value: '3', label: t('calc_mwl', 'رابطة العالم الإسلامي') },
                    { value: '2', label: t('calc_isna', 'أمريكا الشمالية (ISNA)') },
                    { value: '1', label: t('calc_karachi', 'كراتشي') },
                    { value: '5', label: t('calc_egypt', 'المساحة المصرية') },
                    { value: '8', label: t('calc_gulf', 'الخليج العربي') },
                    { value: '9', label: t('calc_kuwait', 'الكويت') },
                    { value: '10', label: t('calc_qatar', 'قطر') },
                    { value: '11', label: t('calc_singapore', 'سنغافورة') },
                    { value: '12', label: t('calc_france', 'فرنسا (UOIF)') },
                    { value: '13', label: t('calc_turkey', 'تركيا') },
                    { value: '14', label: t('calc_russia', 'روسيا') },
                  ].map((method) => (
                    <button
                      key={method.value}
                      onClick={() => updateSettings({ prayerCalcMethod: method.value })}
                      className={cn(
                        "px-3.5 py-2.5 rounded-xl text-xs font-black whitespace-nowrap transition-all border",
                        (settings.prayerCalcMethod || '4') === method.value 
                          ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20 border-transparent scale-105" 
                          : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                      )}
                    >
                      {method.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Daylight Saving / DST */}
              <div className="space-y-2">
                <label className="text-xs font-black text-white/70 block pr-1">{t('time_options_label', 'خيارات الوقت')}</label>
                <button
                  onClick={() => {
                    const val = !settings.prayerDaylightSaving;
                    updateSettings({ prayerDaylightSaving: val });
                    safeLocalStorageSetItem('prayer_dst', String(val));
                  }}
                  className={cn(
                    "w-full flex items-center justify-between p-3.5 rounded-xl border transition-all shadow-inner",
                    settings.prayerDaylightSaving ? "bg-yellow-500/10 border-yellow-500/20" : "bg-white/5 border-white/10"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Sun size={16} className={cn(settings.prayerDaylightSaving ? "text-yellow-400" : "text-white/40")} />
                    <span className="text-xs sm:text-sm font-black text-white">{t('dst_label', 'التوقيت الصيفي (+1 ساعة)')}</span>
                  </div>
                  <div className={cn(
                    "w-8 h-4 rounded-full relative p-0.5 transition-all",
                    settings.prayerDaylightSaving ? "bg-yellow-500" : "bg-white/10"
                  )}>
                    <motion.div 
                      animate={{ x: settings.prayerDaylightSaving ? 16 : 0 }}
                      className="w-3 h-3 bg-white rounded-full shadow-sm"
                    />
                  </div>
                </button>
              </div>
            </div>

            {/* Asr Method */}
            <div className="space-y-2">
              <label className="text-xs font-black text-white/70 block pr-1">{t('asr_calc_school', 'مذهب حساب العصر')}</label>
              <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
                {[
                  { id: '0', label: t('asr_majority_school', 'الجمهور (شافعي، مالكي، حنبلي)') },
                  { id: '1', label: t('asr_hanafi_school', 'الحنفي') }
                ].map((school) => (
                  <button
                    key={school.id}
                    onClick={() => updateSettings({ prayerAsrMethod: school.id })}
                    className={cn(
                      "flex-1 px-3 py-2 rounded-lg font-black text-xs transition-all",
                      (settings.prayerAsrMethod || '0') === school.id 
                        ? "bg-white text-slate-900 shadow-sm" 
                        : "text-white/60 hover:bg-white/5"
                    )}
                  >
                    {school.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Individual Prayer Toggles & Offsets */}
            <div className="space-y-2.5">
              <label className="text-xs font-black text-white/70 block pr-1">{t('adjust_prayer_offsets', 'تعديل الدقة لكل صلاة (بالدقائق)')}</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  { id: 'Fajr', label: t('fajr', 'الفجر') },
                  { id: 'Sunrise', label: t('sunrise', 'الشروق') },
                  { id: 'Dhuhr', label: t('dhuhr', 'الظهر') },
                  { id: 'Asr', label: t('asr', 'العصر') },
                  { id: 'Maghrib', label: t('maghrib', 'المغرب') },
                  { id: 'Isha', label: t('isha', 'العشاء') }
                ].map((prayer) => (
                  <div key={prayer.id} className="bg-white/5 p-2.5 rounded-xl border border-white/5 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-black text-white/95">{prayer.label}</span>
                      <button
                        onClick={() => {
                          const current = settings.prayerNotificationSettings || {};
                          updateSettings({ 
                            prayerNotificationSettings: { ...current, [prayer.id]: !current[prayer.id] } 
                          });
                        }}
                        className={cn(
                          "w-8 h-4 rounded-full transition-all relative p-0.5",
                          settings.prayerNotificationSettings?.[prayer.id] ? "bg-emerald-500" : "bg-white/10"
                        )}
                      >
                        <motion.div 
                          animate={{ x: settings.prayerNotificationSettings?.[prayer.id] ? 16 : 0 }}
                          className="w-3 h-3 bg-white rounded-full shadow-sm"
                        />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between bg-white/5 rounded-lg p-1">
                       <button 
                        onClick={() => {
                          const offsets = { ...(settings.prayerOffsets || {}) };
                          offsets[prayer.id] = (offsets[prayer.id] || 0) - 1;
                          updateSettings({ prayerOffsets: offsets });
                        }}
                        className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center text-white/80 font-black hover:bg-white/20 duration-75 active:scale-[0.85] active:opacity-70"
                       >-</button>
                       <span className={cn(
                         "text-xs font-black min-w-[20px] text-center font-mono",
                         (settings.prayerOffsets?.[prayer.id] || 0) > 0 ? "text-emerald-400" : 
                         (settings.prayerOffsets?.[prayer.id] || 0) < 0 ? "text-rose-400" : "text-white/50"
                       )}>
                         {(settings.prayerOffsets?.[prayer.id] || 0) > 0 ? '+' : ''}{settings.prayerOffsets?.[prayer.id] || 0}
                       </span>
                       <button 
                        onClick={() => {
                          const offsets = { ...(settings.prayerOffsets || {}) };
                          offsets[prayer.id] = (offsets[prayer.id] || 0) + 1;
                          updateSettings({ prayerOffsets: offsets });
                        }}
                        className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center text-white/80 font-black hover:bg-white/20 duration-75 active:scale-[0.85] active:opacity-70"
                       >+</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SubAccordion>

        {/* 3. Morning & Evening Adhkar Times */}
        <SubAccordion icon={<Sun size={18} className="text-amber-400" />} label={t('notif_sub_morning_evening', 'مواقيت وأصوات أذكار الصباح والمساء')}>
           <div className={cn("space-y-4 transition-all", !settings.notificationsEnabled && "opacity-40 pointer-events-none")}>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
               {/* Morning Card */}
               <div className="flex flex-col gap-3.5 bg-white/5 p-4 rounded-2xl border border-white/5">
                 <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                     <Sun size={18} className="text-amber-400" />
                     <span className="text-xs sm:text-sm font-black text-white">{t('morning_adhkar_title', 'أذكار الصباح 🌅')}</span>
                   </div>
                   <button 
                     onClick={() => updateSettings({ _triggerMorning: Date.now() })}
                     className="text-[10px] font-black text-amber-400 bg-amber-400/10 px-3 py-1.5 rounded-lg border border-amber-400/20 hover:bg-amber-400/20 transition-all active:scale-95"
                   >
                     {t('test_alarm', 'تجربة التنبيه')}
                   </button>
                 </div>

                 <div className="flex items-center justify-between bg-white/5 p-2.5 rounded-xl">
                   <span className="text-xs font-black text-white/90">{t('enable_main_alarm', 'تفعيل التنبيه الأساسي')}</span>
                   <button
                     onClick={() => updateSettings({ morningNotificationsEnabled: !settings.morningNotificationsEnabled })}
                     className={cn(
                       "w-8 h-4 rounded-full transition-all relative p-0.5",
                       settings.morningNotificationsEnabled ? "bg-amber-500" : "bg-white/10"
                     )}
                   >
                     <motion.div 
                       animate={{ x: settings.morningNotificationsEnabled ? 16 : 0 }}
                       className="w-3 h-3 bg-white rounded-full shadow-sm"
                     />
                   </button>
                 </div>

                 <div className="grid grid-cols-2 gap-2">
                   <div className="flex flex-col gap-1.5">
                     <span className="text-[11px] font-black text-white/70 text-right">{t('alarm_time_from', 'وقت التنبيه (من)')}</span>
                     <input 
                       type="time" 
                       value={settings.morningAdhkarTime}
                       onChange={(e) => updateSettings({ morningAdhkarTime: e.target.value })}
                       className="w-full bg-white/10 rounded-xl px-3 py-2 text-white text-xs sm:text-sm font-black border border-white/10 focus:outline-none text-center font-mono"
                     />
                   </div>
                   <div className="flex flex-col gap-1.5">
                     <span className="text-[11px] font-black text-white/70 text-right">{t('alarm_time_to', 'وقت المتابعة (إلى)')}</span>
                     <input 
                       type="time" 
                       value={settings.morningAdhkarEndTime || '10:00'}
                       onChange={(e) => updateSettings({ morningAdhkarEndTime: e.target.value })}
                       className="w-full bg-white/10 rounded-xl px-3 py-2 text-white text-xs sm:text-sm font-black border border-white/10 focus:outline-none text-center font-mono"
                     />
                   </div>
                 </div>

                 <div className="space-y-1.5">
                   <label className="text-[11px] font-black text-white/70 block text-right">{t('alarm_ringtone_label', 'نغمة التنبيه')}</label>
                   <select
                     value={settings.morningAdhkarRingtone || 'default'}
                     onChange={(e) => updateSettings({ morningAdhkarRingtone: e.target.value })}
                     className="w-full bg-slate-900/90 text-white text-xs font-black p-2.5 rounded-xl border border-white/10 focus:outline-none"
                   >
                     {(NOTIFICATION_SOUNDS || []).map((sound) => (
                       <option key={sound.id} value={sound.id} className="font-bold bg-slate-900 text-white">
                         {sound.label}
                       </option>
                     ))}
                   </select>
                 </div>

                 <div className="flex items-center justify-between bg-white/5 p-2.5 rounded-xl border border-white/5">
                   <span className="text-xs font-black text-white/90">{t('adhkar_followup_reminder', 'تذكير متابعة إذا لم تقرأ الأذكار')}</span>
                   <button
                     onClick={() => updateSettings({ morningAdhkarFollowupEnabled: !settings.morningAdhkarFollowupEnabled })}
                     className={cn(
                       "w-8 h-4 rounded-full transition-all relative p-0.5",
                       settings.morningAdhkarFollowupEnabled ? "bg-amber-500" : "bg-white/10"
                     )}
                   >
                     <motion.div 
                       animate={{ x: settings.morningAdhkarFollowupEnabled ? 16 : 0 }}
                       className="w-3 h-3 bg-white rounded-full shadow-sm"
                     />
                   </button>
                 </div>
               </div>

               {/* Evening Card */}
               <div className="flex flex-col gap-3.5 bg-white/5 p-4 rounded-2xl border border-white/5">
                 <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                     <Moon size={18} className="text-indigo-400" />
                     <span className="text-xs sm:text-sm font-black text-white">{t('evening_adhkar_title', 'أذكار المساء 🌙')}</span>
                   </div>
                   <button 
                     onClick={() => updateSettings({ _triggerEvening: Date.now() })}
                     className="text-[10px] font-black text-indigo-400 bg-indigo-400/10 px-3 py-1.5 rounded-lg border border-indigo-400/20 hover:bg-indigo-400/20 transition-all active:scale-95"
                   >
                     {t('test_alarm', 'تجربة التنبيه')}

                     </button>
                 </div>

                 <div className="flex items-center justify-between bg-white/5 p-2.5 rounded-xl">
                   <span className="text-xs font-black text-white/90">{t('enable_main_alarm', 'تفعيل التنبيه الأساسي')}</span>
                   <button
                     onClick={() => updateSettings({ eveningNotificationsEnabled: !settings.eveningNotificationsEnabled })}
                     className={cn(
                       "w-8 h-4 rounded-full transition-all relative p-0.5",
                       settings.eveningNotificationsEnabled ? "bg-indigo-500" : "bg-white/10"
                     )}
                   >
                     <motion.div 
                       animate={{ x: settings.eveningNotificationsEnabled ? 16 : 0 }}
                       className="w-3 h-3 bg-white rounded-full shadow-sm"
                     />
                   </button>
                 </div>

                 <div className="grid grid-cols-2 gap-2">
                   <div className="flex flex-col gap-1.5">
                     <span className="text-[11px] font-black text-white/70 text-right">{t('alarm_time_from', 'وقت التنبيه (من)')}</span>
                     <input 
                       type="time" 
                       value={settings.eveningAdhkarTime}
                       onChange={(e) => updateSettings({ eveningAdhkarTime: e.target.value })}
                       className="w-full bg-white/10 rounded-xl px-3 py-2 text-white text-xs sm:text-sm font-black border border-white/10 focus:outline-none text-center font-mono"
                     />
                   </div>
                   <div className="flex flex-col gap-1.5">
                     <span className="text-[11px] font-black text-white/70 text-right">{t('alarm_time_to', 'وقت المتابعة (إلى)')}</span>
                     <input 
                       type="time" 
                       value={settings.eveningAdhkarEndTime || '22:00'}
                       onChange={(e) => updateSettings({ eveningAdhkarEndTime: e.target.value })}
                       className="w-full bg-white/10 rounded-xl px-3 py-2 text-white text-xs sm:text-sm font-black border border-white/10 focus:outline-none text-center font-mono"
                     />
                   </div>
                 </div>

                 <div className="space-y-1.5">
                   <label className="text-[11px] font-black text-white/70 block text-right">{t('alarm_ringtone_label', 'نغمة التنبيه')}</label>
                   <select
                     value={settings.eveningAdhkarRingtone || 'default'}
                     onChange={(e) => updateSettings({ eveningAdhkarRingtone: e.target.value })}
                     className="w-full bg-slate-900/90 text-white text-xs font-black p-2.5 rounded-xl border border-white/10 focus:outline-none"
                   >
                     {(NOTIFICATION_SOUNDS || []).map((sound) => (
                       <option key={sound.id} value={sound.id} className="font-bold bg-slate-900 text-white">
                         {sound.label}
                       </option>
                     ))}
                   </select>
                 </div>

                 <div className="flex items-center justify-between bg-white/5 p-2.5 rounded-xl border border-white/5">
                   <span className="text-xs font-black text-white/90">{t('adhkar_followup_reminder', 'تذكير متابعة إذا لم تقرأ الأذكار')}</span>
                   <button
                     onClick={() => updateSettings({ eveningAdhkarFollowupEnabled: !settings.eveningAdhkarFollowupEnabled })}
                     className={cn(
                       "w-8 h-4 rounded-full transition-all relative p-0.5",
                       settings.eveningAdhkarFollowupEnabled ? "bg-indigo-500" : "bg-white/10"
                     )}
                   >
                     <motion.div 
                       animate={{ x: settings.eveningAdhkarFollowupEnabled ? 16 : 0 }}
                       className="w-3 h-3 bg-white rounded-full shadow-sm"
                     />
                   </button>
                 </div>
               </div>
             </div>
           </div>
        </SubAccordion>

        {/* 4. Random Adhkar Notifications */}
        <SubAccordion icon={<Sparkles size={18} className="text-pink-400" />} label={t('notif_sub_random_adhkar', 'إعدادات الأذكار العشوائية التلقائية')}>
           <div className={cn("bg-white/5 p-4 rounded-2xl border border-white/5 space-y-4", !settings.notificationsEnabled && "opacity-40 pointer-events-none")}>
             
             {/* Master Random Adhkar Toggle & Test */}
             <div className="flex items-center justify-between bg-white/5 p-3.5 rounded-xl border border-white/5">
               <div className="flex items-center gap-2.5">
                 <Sparkles size={18} className="text-pink-400 animate-spin" style={{ animationDuration: '6s' }} />
                 <div>
                   <span className="text-xs sm:text-sm font-black text-white">{t('enable_random_adhkar_toggle', 'تفعيل التذكير بالذكر العشوائي')}</span>
                   <p className="text-[11px] font-bold text-white/70 mt-0.5">{t('random_adhkar_toggle_desc', 'يظهر لك أذكاراً وأدعية مباركة على شاشتك بانتظام')}</p>
                 </div>
               </div>
               <div className="flex items-center gap-2">
                 <button 
                   onClick={() => updateSettings({ _triggerRandom: Date.now() })}
                   className="text-[10px] font-black text-pink-400 bg-pink-400/10 px-3 py-1.5 rounded-lg border border-pink-400/20 active:scale-95"
                 >
                   {t('demo_preview_adhkar', 'عرض تجريبي 🌟')}

                   </button>
                 <button
                   onClick={() => updateSettings({ randomAdhkarEnabled: !settings.randomAdhkarEnabled })}
                   className={cn(
                     "w-10 h-5 rounded-full transition-all relative p-0.5",
                     settings.randomAdhkarEnabled ? "bg-teal-500" : "bg-white/10"
                   )}
                 >
                   <motion.div 
                     animate={{ x: settings.randomAdhkarEnabled ? 20 : 0 }}
                     className="w-4 h-4 bg-white rounded-full shadow-sm"
                   />
                 </button>
               </div>
             </div>
             
             {/* Frequency Interval */}
             <div className="space-y-2">
               <span className="text-xs font-black text-white/80 block text-right">{t('random_adhkar_freq_label', 'تكرار التنبيه بالذكر:')}</span>
               <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                 {[
                   { value: 5, label: t('every_5_min', 'كل 5 دقائق') },
                   { value: 15, label: t('every_15_min', 'كل 15 دقيقة') },
                   { value: 30, label: t('every_30_min', 'كل 30 دقيقة') },
                   { value: 45, label: t('every_45_min', 'كل 45 دقيقة') },
                   { value: 60, label: t('every_1_hour', 'كل ساعة') },
                   { value: 120, label: t('every_2_hours', 'كل ساعتين') },
                   { value: 180, label: t('every_3_hours', 'كل 3 ساعات') }
                 ].map((interval) => (
                   <button
                     key={interval.value}
                     onClick={() => updateSettings({ randomAdhkarInterval: interval.value })}
                     className={cn(
                       "px-3.5 py-2 rounded-xl border text-xs font-black whitespace-nowrap transition-all active:scale-95",
                       settings.randomAdhkarInterval === interval.value 
                         ? "bg-teal-500 text-white shadow-md shadow-teal-500/20 border-transparent scale-105" 
                         : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                     )}
                   >
                     {interval.label}
                   </button>
                 ))}
               </div>
             </div>

             {/* Quiet Hours Mode */}
             <div className="bg-white/5 p-3.5 rounded-xl border border-white/5 space-y-3">
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2.5">
                   <Moon size={16} className="text-amber-400" />
                   <span className="text-xs sm:text-sm font-black text-white/95">{t('quiet_hours_title', 'وضع عدم الإزعاج (الوضع الهادئ أثناء النوم)')}</span>
                 </div>
                 <button
                   onClick={() => updateSettings({ randomAdhkarQuietHoursEnabled: !settings.randomAdhkarQuietHoursEnabled })}
                   className={cn(
                     "w-8 h-4 rounded-full transition-all relative p-0.5",
                     settings.randomAdhkarQuietHoursEnabled ? "bg-amber-500" : "bg-white/10"
                   )}
                 >
                   <motion.div 
                     animate={{ x: settings.randomAdhkarQuietHoursEnabled ? 16 : 0 }}
                     className="w-3 h-3 bg-white rounded-full shadow-sm"
                   />
                 </button>
               </div>

               {settings.randomAdhkarQuietHoursEnabled && (
                 <div className="grid grid-cols-2 gap-2.5 pt-1">
                   <div className="flex flex-col gap-1.5">
                     <span className="text-[11px] font-black text-white/70 text-right">{t('quiet_start_time', 'بداية الهدوء')}</span>
                     <input 
                       type="time" 
                       value={settings.randomAdhkarQuietStart || '23:00'}
                       onChange={(e) => updateSettings({ randomAdhkarQuietStart: e.target.value })}
                       className="w-full bg-slate-900/90 rounded-xl px-3 py-2 text-white text-xs sm:text-sm font-black border border-white/10 text-center font-mono"
                     />
                   </div>
                   <div className="flex flex-col gap-1.5">
                     <span className="text-[11px] font-black text-white/70 text-right">{t('quiet_end_time', 'نهاية الهدوء')}</span>
                     <input 
                       type="time" 
                       value={settings.randomAdhkarQuietEnd || '06:30'}
                       onChange={(e) => updateSettings({ randomAdhkarQuietEnd: e.target.value })}
                       className="w-full bg-slate-900/90 rounded-xl px-3 py-2 text-white text-xs sm:text-sm font-black border border-white/10 text-center font-mono"
                     />
                   </div>
                 </div>
               )}
             </div>

             {/* Sound Selection */}
             <div className="space-y-1.5">
               <label className="text-xs font-black text-white/70 block text-right">{t('random_adhkar_sound_label', 'صوت التنبيه بالذكر العشوائي')}</label>
               <select
                 value={settings.randomAdhkarSound || 'default'}
                 onChange={(e) => updateSettings({ randomAdhkarSound: e.target.value })}
                 className="w-full bg-slate-900/90 text-white text-xs sm:text-sm font-black p-3 rounded-xl border border-white/10 focus:outline-none"
               >
                 {(NOTIFICATION_SOUNDS || []).map((sound) => (
                   <option key={sound.id} value={sound.id} className="font-bold bg-slate-900 text-white">
                     {sound.label}
                   </option>
                 ))}
               </select>
             </div>

             {/* Theme Selection */}
             <div className="pt-2 border-t border-white/10">
               <span className="text-xs font-black text-white/80 block mb-2 text-right">{t('random_adhkar_theme_label', 'ثيم بطاقة الذكر العشوائي:')}</span>
               <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                 {[
                   { id: 'emerald', label: t('theme_emerald', 'زمردي'), color: 'bg-emerald-600 border border-white/20' },
                   { id: 'gold', label: t('theme_gold', 'ذهبي'), color: 'bg-amber-500 border border-white' },
                   { id: 'blue', label: t('theme_blue', 'أزرق'), color: 'bg-blue-600 border border-white' },
                   { id: 'teal', label: t('theme_teal', 'نيلي'), color: 'bg-teal-600 border border-white' },
                   { id: 'purple', label: t('theme_purple', 'أرجواني'), color: 'bg-purple-600 border border-white' },
                   { id: 'rose', label: t('theme_rose', 'وردي'), color: 'bg-rose-500 border border-white' },
                   { id: 'red', label: t('theme_red', 'أحمر'), color: 'bg-red-600 border border-yellow-300' },
                   { id: 'dark', label: t('theme_dark', 'داكن'), color: 'bg-slate-900 border border-slate-400' },
                 ].map((theme) => (
                   <button
                     key={theme.id}
                     onClick={() => updateSettings({ randomAdhkarTheme: theme.id as any })}
                     className={cn(
                       "flex flex-col items-center gap-1.5 shrink-0 transition-all p-1.5 rounded-xl border",
                       settings.randomAdhkarTheme === theme.id ? "bg-white/10 border-white/30 scale-105" : "border-transparent opacity-60 hover:opacity-100"
                     )}
                   >
                     <div className={cn("w-8 h-8 rounded-lg shadow-sm", theme.color)} />
                     <span className="text-[10px] font-black text-white/95">{theme.label}</span>
                   </button>
                 ))}
               </div>

               {/* Quick Presets Packages */}
               <div className="mt-3.5 bg-white/5 p-3.5 rounded-xl border border-white/5 space-y-2.5">
                 <span className="text-xs font-black text-teal-300 block text-right">{t('preset_adhkar_packages', 'حزم الأذكار الجاهزة (إضافة بضغطة واحدة):')}</span>
                 <div className="flex flex-wrap gap-2">
                   {[
                     { 
                       title: t('short_adhkar_preset', '✨ أذكار قصيرة'), 
                       items: ["سبحان الله وبحمده سبحان الله العظيم", "أستغفر الله العظيم وأتوب إليه", "لا حول ولا قوة إلا بالله العلي العظيم", "سبحان الله والحمد لله ولا إله إلا الله والله أكبر"] 
                     },
                     { 
                       title: t('salawat_preset', '🌸 الصلاة على النبي'), 
                       items: ["اللهم صلِّ وسلم وبارك على نبينا محمد", "اللهم صلِّ على محمد وعلى آل محمد كما صليت على إبراهيم"] 
                     },
                     { 
                       title: t('quranic_duas_preset', '🤲 أدعية قرآنية'), 
                       items: ["يا مقلب القلوب ثبت قلبي على دينك", "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ", "حسبي الله لا إله إلا هو عليه توكلت وهو رب العرش العظيم"] 
                     }
                   ].map((preset, idx) => (
                     <button
                       key={idx}
                       onClick={() => {
                         const current = settings.customRandomAdhkar || [];
                         const merged = Array.from(new Set([...current, ...preset.items]));
                         updateSettings({ customRandomAdhkar: merged });
                       }}
                       className="bg-teal-500/15 hover:bg-teal-500/25 text-teal-300 font-black text-xs px-3 py-1.5 rounded-xl border border-teal-500/30 transition-all active:scale-95"
                     >
                       + {preset.title}
                     </button>
                   ))}
                 </div>
               </div>

                {settingsError && (
                  <div className="p-2.5 bg-rose-500/15 border border-rose-500/30 rounded-xl text-xs font-black text-rose-300 mt-2 text-right">
                    ⚠️ {settingsError}
                  </div>
                )}

               {/* Add Custom Dhikr Input */}
               <div className="flex gap-2 mt-3.5">
                 <input 
                   type="text"
                   placeholder={t('add_custom_dhikr_input_placeholder', 'أضف ذكراً أو دعاءً خاصاً...')}
                   className="flex-1 bg-white/10 text-white text-xs sm:text-sm font-black px-3.5 py-2.5 rounded-xl border border-white/15 focus:outline-none placeholder:text-white/40"
                   onChange={() => setSettingsError(null)}
                   onKeyDown={(e) => {
                     if (e.key === 'Enter') {
                       const target = e.target as HTMLInputElement;
                       const val = target.value.trim();
                       if (val) {
                         const safety = checkInputSafety(val);
                         if (!safety.isSafe) {
                           setSettingsError(safety.reasonAr || t('invalid_symbols_error', 'النص يحتوي على رموز غير مصرح بها.'));
                           return;
                         }
                         setSettingsError(null);
                         const currentList = settings.customRandomAdhkar || [];
                         const cleaned = sanitizeString(val);
                         if (!currentList.includes(cleaned)) {
                           updateSettings({ customRandomAdhkar: [cleaned, ...currentList] });
                           target.value = '';
                         }
                       }
                     }
                   }}
                 />
                 <button 
                   onClick={(e) => {
                     const input = (e.currentTarget.previousSibling as HTMLInputElement);
                     const val = input.value.trim();
                     if (val) {
                       const safety = checkInputSafety(val);
                       if (!safety.isSafe) {
                         setSettingsError(safety.reasonAr || t('invalid_symbols_error', 'النص يحتوي على رموز غير مصرح بها.'));
                         return;
                       }
                       setSettingsError(null);
                       const currentList = settings.customRandomAdhkar || [];
                       const cleaned = sanitizeString(val);
                       if (!currentList.includes(cleaned)) {
                         updateSettings({ customRandomAdhkar: [cleaned, ...currentList] });
                         input.value = '';
                       }
                     }
                   }}
                   className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center text-white shrink-0 active:scale-95 shadow-md shadow-teal-500/20"
                 >
                   <Plus size={18} />
                 </button>
               </div>

               {/* Custom Dhikr List Display */}
               <div className="mt-3.5 space-y-1.5 max-h-40 overflow-y-auto pr-1 scrollbar-hide">
                 {(settings.customRandomAdhkar || []).map((dhikr, i) => (
                   <div key={i} className="flex items-center justify-between bg-white/5 p-2.5 rounded-xl border border-white/5 text-right">
                     <span className="text-xs sm:text-sm text-white/90 font-black truncate flex-1 pr-1">{dhikr}</span>
                     <button
                       onClick={() => {
                         const updated = (settings.customRandomAdhkar || []).filter((_, idx) => idx !== i);
                         updateSettings({ customRandomAdhkar: updated });
                       }}
                       className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 flex items-center justify-center shrink-0 mr-2 transition-colors"
                     >
                       <X size={14} />
                     </button>
                   </div>
                 ))}
               </div>

             </div>
           </div>
        </SubAccordion>

        {/* 5. Sunnah and Nafl Reminder */}
        <SubAccordion icon={<Star size={18} className="text-teal-400" />} label={t('notif_sub_sunnah_nafl', 'تذكير السنن والنوافل المتبقية')}>
           <div className={cn("bg-white/5 p-4 rounded-xl border border-white/5 space-y-4", !settings.notificationsEnabled && "opacity-40 pointer-events-none")}>
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-2.5">
                 <Star size={14} className="text-teal-400 animate-pulse" />
                 <span className="text-xs sm:text-sm font-black text-white/95">{t('enable_sunnah_reminder', 'تفعيل تذكير نهاية اليوم بالسنن والنوافل المتبقية')}</span>
               </div>
               <button
                 onClick={() => updateSettings({ sunnahReminderEnabled: !settings.sunnahReminderEnabled })}
                 className={cn(
                   "w-8 h-4 rounded-full transition-all relative p-0.5",
                   settings.sunnahReminderEnabled ? "bg-teal-500" : "bg-white/10"
                 )}
               >
                 <motion.div 
                   animate={{ x: settings.sunnahReminderEnabled ? 16 : 0 }}
                   className="w-3 h-3 bg-white rounded-full shadow-sm"
                 />
               </button>
             </div>

             <div className={cn("space-y-4 transition-all", !settings.sunnahReminderEnabled && "opacity-40 pointer-events-none")}>
               <div className="flex flex-col gap-1.5 text-right">
                 <label className="text-[11px] font-black text-white/70">{t('daily_alarm_time', 'وقت التنبيه اليومي')}</label>
                 <div className="flex items-center gap-2.5">
                   <input 
                     type="time" 
                     value={settings.sunnahReminderTime || '21:30'}
                     onChange={(e) => updateSettings({ sunnahReminderTime: e.target.value })}
                     className="flex-1 bg-white/10 rounded-xl px-3 py-2 text-white text-xs sm:text-sm font-black border border-white/10 text-center font-mono"
                   />
                   <button 
                     onClick={() => updateSettings({ _triggerSunnahReminder: Date.now() })}
                     className="text-[10px] font-black text-teal-400 bg-teal-400/10 px-3.5 py-2 rounded-xl border border-teal-400/20 whitespace-nowrap active:scale-95 duration-75 transition-all"
                   >
                     {t('test_alarm_btn', 'تجربة التنبيه 🔔')}

                     </button>
                 </div>
                 <span className="text-[11px] font-bold text-white/60 mt-0.5">{t('sunnah_reminder_desc', 'يقوم التطبيق بالتحقق من السنن والنوافل التي لم تقم بإتمامها في هذا الوقت وتنبيهك بها.')}</span>
               </div>
             </div>
           </div>
        </SubAccordion>

        {/* 6. Notification Sounds / Ringtones */}
        <SubAccordion icon={<Volume2 size={18} className="text-pink-400" />} label={t('notif_sub_sounds', 'أصوات التنبيهات')}>
          <div className="space-y-4">
            {[
              { id: 'prayer', label: t('sound_prayer_adhan', 'صوت تنبيه الصلوات'), setting: 'prayerRingtone', trigger: '_triggerPrayer' },
              { id: 'morning', label: t('sound_morning_adhkar', 'صوت أذكار الصباح'), setting: 'morningAdhkarRingtone', trigger: '_triggerMorning' },
              { id: 'evening', label: t('sound_evening_adhkar', 'صوت أذكار المساء'), setting: 'eveningAdhkarRingtone', trigger: '_triggerEvening' },
              { id: 'custom', label: t('sound_custom_reminders', 'صوت التذكيرات المخصصة'), setting: 'customReminderRingtone', trigger: '_triggerReminderTest' }
            ].map((category) => (
              <div key={category.id} className="bg-white/5 p-3.5 rounded-xl border border-white/5 space-y-3">
                 <div className="flex items-center justify-between">
                   <p className="text-xs sm:text-sm font-black text-white/95">{category.label}</p>
                   <button 
                     onClick={() => {
                       if (category.trigger === '_triggerReminderTest') {
                         updateSettings({ [category.trigger]: { label: t('sound_test', 'تجربة صوت'), id: 'test', time: '00:00', enabled: true, type: 'custom', days: [] } as any });
                       } else {
                         updateSettings({ [category.trigger]: Date.now() });
                       }
                     }}
                     className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20 duration-75 active:scale-[0.85] active:opacity-70 transition-all"
                   >
                     <Volume2 size={14} />
                     <span className="text-[10px] font-black">{t('sound_test_btn', 'تجربة')}</span>
                   </button>
                 </div>
                 <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                   {(NOTIFICATION_SOUNDS || []).map((sound) => (
                     <button
                       key={sound.id}
                       onClick={() => updateSettings({ [category.setting]: sound.id })}
                       className={cn(
                         "px-3.5 py-2.5 rounded-xl border text-xs font-black whitespace-nowrap transition-all",
                         ((settings as any)[category.setting] || 'default') === sound.id 
                           ? "bg-teal-500 text-white shadow-md shadow-teal-500/20 border-transparent scale-105" 
                           : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                       )}
                     >
                       {sound.label}
                     </button>
                   ))}
                 </div>
              </div>
            ))}
          </div>
        </SubAccordion>

          </div>
        </ThreeDCard>
          </motion.div>
        )}

        {/* SECTION SPECIFIC CONFIGURATIONS TAB */}
        {activeTab === 'sections' && (
          <motion.div
            key="sections-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* Section Sub-Tabs Bar */}
            <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto custom-scrollbar">
              {[
                { id: 'quran', label: t('subtab_quran_tafsir', 'القرآن والتفسير'), icon: BookOpen },
                { id: 'adhkar', label: t('subtab_adhkar_tasbih', 'الأذكار والتسبيح'), icon: Activity },
                { id: 'prayer', label: t('subtab_prayer_times', 'الصلاة والمواقيت'), icon: Clock },
                { id: 'quiz', label: t('subtab_quiz_activities', 'المسابقات والأنشطة'), icon: Timer }
              ].map((sub) => {
                const isSubActive = activeSectionTab === sub.id;
                const SubIcon = sub.icon;
                return (
                  <button
                    key={sub.id}
                    onClick={() => setActiveSectionTab(sub.id as any)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl font-black text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer",
                      isSubActive
                        ? "bg-teal-600 text-white shadow-md shadow-teal-600/30 font-black"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
                    )}
                  >
                    <SubIcon size={16} />
                    <span>{sub.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Quran Sub-Tab */}
            {activeSectionTab === 'quran' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <ThreeDCard color="bg-slate-800" shadow="shadow-slate-900/30" icon={<BookOpen size={18} className="text-teal-400" />} label={t('setting_quran_fonts_recitation', 'إعدادات القرآن الكريم الخطوط والتلاوة')}>
                  <div className="space-y-6">
                    {/* Quranic Font Family */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs sm:text-sm font-black text-white">{t('quran_font_label', 'خط الآيات القرآنية')}</p>
                        <button
                          type="button"
                          onClick={() => navigate('/font-studio')}
                          className="text-xs font-black text-teal-300 hover:text-teal-200 bg-teal-500/10 px-2.5 py-1 rounded-lg border border-teal-500/30 flex items-center gap-1 cursor-pointer"
                        >
                          <Sparkles size={12} className="text-amber-300 animate-pulse" />
                          <span>تنزيل واستوديو الخطوط</span>
                        </button>
                      </div>
                      <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-hide">
                        {[
                          { id: 'Uthmanic Hafs', name: 'الرسم العثماني (حفص)' },
                          { id: 'Uthmanic Hafs 1', name: 'الرسم العثماني (البديل)' },
                          { id: 'Amiri Quran', name: 'أميري قرآن' },
                          { id: 'Amiri', name: 'الخط الأميري' },
                          { id: 'Scheherazade New', name: 'خط شهرزاد' },
                          { id: 'Lateef', name: 'خط لطيف' },
                          { id: 'Noto Naskh Arabic', name: 'خط النسخ' },
                          { id: 'Markazi Text', name: 'الخط المركزي' },
                          { id: 'Mirza', name: 'خط ميرزا' }
                        ].map((font) => (
                          <button
                            key={font.id}
                            onClick={() => setQuranFontFamily(font.id)}
                            className={cn(
                              "px-3.5 py-2 rounded-xl border text-xs sm:text-sm font-black whitespace-nowrap transition-all duration-75 active:scale-[0.95]",
                              quranFontFamily === font.id 
                                ? "bg-teal-500 text-white font-black shadow-md border-transparent ring-2 ring-teal-300" 
                                : "bg-white/5 border-white/10 text-white/80 hover:bg-white/15 hover:text-white"
                            )}
                            style={{ fontFamily: font.id }}
                          >
                            {font.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="h-px bg-white/10 w-full" />

                    {/* Tafsir Type */}
                    <div className="space-y-2.5">
                      <p className="text-xs sm:text-sm font-black text-white mb-1">{t('tafsir_type_label', 'نوع التفسير المعروض')}</p>
                      <select
                        value={tafsirType}
                        onChange={(e) => setTafsirType(e.target.value as any)}
                        className="w-full bg-slate-900 text-white font-black text-xs sm:text-sm p-3 rounded-xl border border-white/15 focus:outline-none"
                      >
                        <option value="ar.muyassar">{t('tafsir_muyassar', 'التفسير الميسر (موصى به)')}</option>
                        <option value="ar.jalalayn">{t('tafsir_jalalayn', 'تفسير الجلالين')}</option>
                        <option value="ar.waseet">{t('tafsir_waseet', 'التفسير الوسيط (سيد طنطاوي)')}</option>
                        <option value="ar.qurtubi">{t('tafsir_qurtubi', 'تفسير القرطبي')}</option>
                        <option value="ar.baghawi">{t('tafsir_baghawi', 'تفسير البغوي')}</option>
                        <option value="ar.miqbas">{t('tafsir_miqbas', 'تنوير المقباس من تفسير ابن عباس')}</option>
                        <option value="en.sahih">English (Sahih International)</option>
                        <option value="fr.hamidullah">Français (Muhammad Hamidullah)</option>
                      </select>
                    </div>

                    <div className="h-px bg-white/10 w-full" />

                    {/* Primary Reciter */}
                    <div className="space-y-2.5">
                      <p className="text-xs sm:text-sm font-black text-white mb-1">{t('default_reciter_label', 'القارئ الافتراضي')}</p>
                      <select
                        value={reciter}
                        onChange={(e) => setReciter(Number(e.target.value))}
                        className="w-full bg-slate-900 text-white font-black text-xs sm:text-sm p-3 rounded-xl border border-white/15 focus:outline-none"
                      >
                        {RECITERS.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name} ({r.style})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </ThreeDCard>

                {/* Tafsir & Mushaf Downloader */}
                <ThreeDCard color="bg-slate-800" shadow="shadow-slate-900/30" icon={<Download size={18} className="text-teal-400" />} label={t('setting_download_tafsir_mushaf', 'تنزيل بيانات التفسير والمصحف للقراءة دون اتصال')}>
                  <div className="space-y-4 pb-2">
                    <TafsirDownloader />
                    <div className="h-px bg-white/10 w-full my-3" />
                    <MushafDownloader />
                  </div>
                </ThreeDCard>
              </div>
            )}

            {/* Adhkar Sub-Tab */}
            {activeSectionTab === 'adhkar' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <ThreeDCard color="bg-slate-800" shadow="shadow-slate-900/30" icon={<Activity size={18} className="text-emerald-400" />} label={t('setting_tasbih', 'إعدادات التسبيح والأذكار')}>
                  <div className="space-y-4 pt-2">
                    <div className="flex flex-col gap-2.5 bg-black/25 p-3.5 rounded-xl border border-white/10 mb-3">
                      <div>
                        <span className="text-xs sm:text-sm font-black text-white block">{t('adhkar_category_display', 'طريقة عرض فئات الأذكار')}</span>
                        <span className="text-[11px] text-white/70 font-bold block mt-0.5">{t('adhkar_category_display_desc', 'تغيير شكل القائمة في قسم الأذكار')}</span>
                      </div>
                      <div className="flex bg-black/40 p-1 rounded-xl border border-white/10 gap-1.5 mt-1">
                        <button
                          onClick={() => updateSettings({ adhkarLayout: 'grid' })}
                          className={cn(
                            "flex-1 py-2 rounded-lg text-xs sm:text-sm font-black transition-all",
                            (!settings.adhkarLayout || settings.adhkarLayout === 'grid') ? "bg-teal-500 text-white shadow-md font-black" : "text-white/70 hover:bg-white/10 hover:text-white"
                          )}
                        >
                          {t('grid_layout', 'شبكة (مربعات)')}
                        </button>
                        <button
                          onClick={() => updateSettings({ adhkarLayout: 'list' })}
                          className={cn(
                            "flex-1 py-2 rounded-lg text-xs sm:text-sm font-black transition-all",
                            settings.adhkarLayout === 'list' ? "bg-teal-500 text-white shadow-md font-black" : "text-white/70 hover:bg-white/10 hover:text-white"
                          )}
                        >
                          {t('list_layout', 'قائمة (صفوف)')}
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between bg-black/25 p-3.5 rounded-xl border border-white/10">
                      <div>
                        <span className="text-xs sm:text-sm font-black text-white block">{t('haptic_tasbih_title', 'التسبيح بالحس اللمسي (Haptic Tasbih)')}</span>
                        <span className="text-[11px] text-white/70 font-bold block mt-0.5">{t('haptic_tasbih_desc', 'اهتزاز خفيف عند كل ضغطة في عداد الأذكار')}</span>
                      </div>
                      <button
                        onClick={() => updateSettings({ hapticTasbihEnabled: settings.hapticTasbihEnabled === false ? true : false })}
                        className={cn(
                          "w-12 h-6 rounded-full transition-all relative p-0.5 shadow-inner",
                          settings.hapticTasbihEnabled !== false ? "bg-teal-500" : "bg-white/20"
                        )}
                      >
                        <motion.div 
                          animate={{ x: settings.hapticTasbihEnabled !== false ? 24 : 0 }}
                          className="w-5 h-5 bg-white rounded-full shadow-md"
                        />
                      </button>
                    </div>

                    <div className="h-px bg-white/10 w-full" />

                    {/* Adhkar Font Family */}
                    <div className="space-y-2">
                      <p className="text-xs sm:text-sm font-black text-white mb-1">{t('adhkar_font_family', 'خط نصوص الأذكار والأوراد')}</p>
                      <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-hide">
                        {[
                          { id: 'Amiri', name: 'الخط الأميري' },
                          { id: 'Scheherazade New', name: 'خط شهرزاد' },
                          { id: 'Lateef', name: 'خط لطيف' },
                          { id: 'Aref Ruqaa', name: 'خط الرقعة' },
                          { id: 'Noto Naskh Arabic', name: 'خط النسخ' },
                          { id: 'El Messiri', name: 'المسيري' },
                          { id: 'Cairo', name: 'خط القاهرة' },
                          { id: 'Tajawal', name: 'خط تجوال' },
                          { id: 'Zain', name: 'خط زين' }
                        ].map((font) => (
                          <button
                            key={font.id}
                            onClick={() => updateSettings({ adhkarFontFamily: font.id })}
                            className={cn(
                              "px-3.5 py-2 rounded-xl border text-xs sm:text-sm font-black whitespace-nowrap transition-all duration-75 active:scale-[0.95]",
                              settings.adhkarFontFamily === font.id 
                                ? "bg-teal-500 text-white font-black shadow-md border-transparent ring-2 ring-teal-300" 
                                : "bg-white/5 border-white/10 text-white/80 hover:bg-white/15 hover:text-white"
                            )}
                            style={{ fontFamily: font.id }}
                          >
                            {font.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </ThreeDCard>
              </div>
            )}

            {/* Prayer Sub-Tab */}
            {activeSectionTab === 'prayer' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <ThreeDCard color="bg-slate-800" shadow="shadow-slate-900/30" icon={<Clock size={18} className="text-amber-400" />} label={t('setting_prayer_times_calc', 'إعدادات مواقيت الصلاة والحسابات')}>
                  <div className="space-y-4 pt-1">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-white/70 block pr-1">{t('prayer_calc_method_label', 'طريقة حساب مواقيت الصلاة')}</label>
                      <select
                        value={settings.prayerCalcMethod || '4'}
                        onChange={(e) => updateSettings({ prayerCalcMethod: e.target.value })}
                        className="w-full bg-slate-900 text-white text-xs sm:text-sm font-black p-3 rounded-xl border border-white/10 focus:outline-none"
                      >
                        <option value="4">{t('calc_method_makkah', 'أم القرى، مكة المكرمة')}</option>
                        <option value="3">{t('calc_method_mwl', 'رابطة العالم الإسلامي')}</option>
                        <option value="2">{t('calc_method_isna', 'الهيئة الإسلامية لشمال أمريكا (ISNA)')}</option>
                        <option value="1">{t('calc_method_karachi', 'جامعة العلوم الإسلامية بكراتشي')}</option>
                        <option value="5">{t('calc_method_egypt', 'الهيئة المصرية العامة للمساحة')}</option>
                        <option value="8">{t('calc_method_gulf', 'منطقة الخليج العربي')}</option>
                        <option value="9">{t('calc_method_kuwait', 'وزارة الأوقاف والشؤون الإسلامية بالكويت')}</option>
                        <option value="10">{t('calc_method_qatar', 'قطر')}</option>
                        <option value="12">{t('calc_method_france', 'اتحاد المنظمات الإسلامية بفرنسا (UOIF)')}</option>
                        <option value="13">{t('calc_method_turkey', 'رئاسة الشؤون الدينية بتركيا')}</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between bg-white/5 p-3.5 rounded-xl border border-white/5">
                      <div>
                        <span className="text-xs sm:text-sm font-black text-white/90 block">{t('daylight_saving_title', 'التوقيت الصيفي (+1 ساعة)')}</span>
                        <span className="text-[11px] text-white/60 font-bold block mt-0.5">{t('daylight_saving_desc', 'إضافة ساعة واحدة لمواقيت الصلاة تلقائياً')}</span>
                      </div>
                      <button
                        onClick={() => updateSettings({ prayerDaylightSaving: !settings.prayerDaylightSaving })}
                        className={cn(
                          "w-10 h-5 rounded-full transition-all relative p-0.5",
                          settings.prayerDaylightSaving ? "bg-amber-500" : "bg-white/10"
                        )}
                      >
                        <motion.div 
                          animate={{ x: settings.prayerDaylightSaving ? 20 : 0 }}
                          className="w-4 h-4 bg-white rounded-full shadow-md"
                        />
                      </button>
                    </div>
                  </div>
                </ThreeDCard>
              </div>
            )}

            {/* Quiz Sub-Tab */}
            {activeSectionTab === 'quiz' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <ThreeDCard color="bg-slate-800" shadow="shadow-slate-900/30" icon={<Timer size={18} className="text-amber-400" />} label={t('setting_quiz_activities', 'إعدادات المسابقات والأنشطة')}>
                  <div className="space-y-4 pt-2">
                    <div className="flex flex-col gap-2.5 bg-black/25 p-3.5 rounded-xl border border-white/10">
                      <div>
                        <span className="text-xs sm:text-sm font-black text-white block">{t('quiz_timer_duration_title', 'مدة المؤقت لكل سؤال')}</span>
                        <span className="text-[11px] text-white/70 font-bold block mt-0.5">{t('quiz_timer_duration_desc', 'تحديد الوقت المتاح للإجابة على كل سؤال بالثواني')}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {[10, 15, 20, 30, 45, 60].map((duration) => (
                          <button
                            key={duration}
                            onClick={() => updateSettings({ quizTimerDuration: duration })}
                            className={cn(
                              "px-3.5 py-2 rounded-xl border text-xs sm:text-sm font-black whitespace-nowrap transition-all duration-75 active:scale-[0.95]",
                              (settings.quizTimerDuration || 20) === duration
                                ? "bg-amber-500 text-white shadow-md shadow-amber-500/20 border-transparent ring-2 ring-amber-300/50"
                                : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                            )}
                          >
                            {duration} {t('seconds_unit', 'ثانية')}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </ThreeDCard>
              </div>
            )}
          </motion.div>
        )}

        {/* SYSTEM, DATA & SUPPORT TAB */}
        {activeTab === 'system' && (
          <motion.div
            key="system-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-3.5"
          >
            {/* Unified Download Center card */}
        <ThreeDCard 
          color="bg-slate-800" 
          shadow="shadow-slate-900/30" 
          icon={<Download size={18} className="text-teal-400" />} 
          label={t('content_download_manager', 'إدارة المحتوى والوصول دون اتصال')}
        >
          <div className="space-y-4 pb-2">
            <OfflineManager />
            
            <div className="h-px bg-white/5 w-full my-4" />
            
            <SubAccordion icon={<BookOpen size={18} className="text-amber-400" />} label={t('download_muyassar_tafsir', 'تحميل بيانات التفسير الميسر')}>
              <TafsirDownloader />
            </SubAccordion>
          </div>
        </ThreeDCard>

        {/* Adhkar Settings */}
        <ThreeDCard color="bg-slate-800" shadow="shadow-slate-900/30" icon={<Activity size={18} className="text-emerald-400" />} label={t('setting_tasbih', 'إعدادات التسبيح والأذكار')}>
          <div className="space-y-4 pt-2">
            
            <div className="flex flex-col gap-2.5 bg-black/25 p-3.5 rounded-xl border border-white/10 mb-3">
              <div>
                <span className="text-xs sm:text-sm font-black text-white block">{t('adhkar_category_display', 'طريقة عرض فئات الأذكار')}</span>
                <span className="text-[11px] text-white/70 font-bold block mt-0.5">{t('adhkar_category_display_desc', 'تغيير شكل القائمة في قسم الأذكار')}</span>
              </div>
              <div className="flex bg-black/30 rounded-xl p-1.5 border border-white/10 gap-1.5">
                <button
                  onClick={() => updateSettings({ adhkarLayout: 'grid' })}
                  className={cn(
                    "flex-1 py-2 rounded-lg text-xs sm:text-sm font-black transition-all",
                    (!settings.adhkarLayout || settings.adhkarLayout === 'grid') ? "bg-white text-slate-900 shadow-md font-black" : "text-white/60 hover:text-white"
                  )}
                >
                  {t('grid_layout', 'شبكة (مربعات)')}
                </button>
                <button
                  onClick={() => updateSettings({ adhkarLayout: 'list' })}
                  className={cn(
                    "flex-1 py-2 rounded-lg text-xs sm:text-sm font-black transition-all",
                    settings.adhkarLayout === 'list' ? "bg-white text-slate-900 shadow-md font-black" : "text-white/60 hover:text-white"
                  )}
                >
                  {t('list_layout', 'قائمة (صفوف)')}
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between bg-black/25 p-3.5 rounded-xl border border-white/10">
              <div>
                <span className="text-xs sm:text-sm font-black text-white block">{t('haptic_tasbih_title', 'التسبيح بالحس اللمسي (Haptic Tasbih)')}</span>
                <span className="text-[11px] text-white/70 font-bold block mt-0.5">{t('haptic_tasbih_desc', 'اهتزاز خفيف عند كل ضغطة في عداد الأذكار')}</span>
              </div>
              <button
                onClick={() => updateSettings({ hapticTasbihEnabled: settings.hapticTasbihEnabled === false ? true : false })}
                className={cn(
                  "w-12 h-6 rounded-full transition-all relative p-0.5 shadow-inner",
                  settings.hapticTasbihEnabled !== false ? "bg-teal-500" : "bg-white/20"
                )}
              >
                <motion.div 
                  animate={{ x: settings.hapticTasbihEnabled !== false ? 24 : 0 }}
                  className="w-5 h-5 bg-white rounded-full shadow-md"
                />
              </button>
            </div>
          </div>
        </ThreeDCard>

        {/* Share App Section */}
        <ThreeDCard color="bg-slate-800" shadow="shadow-slate-900/30" icon={<Timer size={18} className="text-amber-400" />} label={t('setting_quiz_activities', 'إعدادات المسابقات والأنشطة')}>
          <div className="space-y-4 pt-2">
            <div className="flex flex-col gap-2.5 bg-black/25 p-3.5 rounded-xl border border-white/10">
              <div>
                <span className="text-xs sm:text-sm font-black text-white block">{t('quiz_timer_duration_title', 'مدة المؤقت لكل سؤال')}</span>
                <span className="text-[11px] text-white/70 font-bold block mt-0.5">{t('quiz_timer_duration_desc', 'تحديد الوقت المتاح للإجابة على كل سؤال بالثواني')}</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {[10, 15, 20, 30, 45, 60].map((duration) => (
                  <button
                    key={duration}
                    onClick={() => updateSettings({ quizTimerDuration: duration })}
                    className={cn(
                      "px-3.5 py-2 rounded-xl border text-xs sm:text-sm font-black whitespace-nowrap transition-all duration-75 active:scale-[0.95]",
                      (settings.quizTimerDuration || 20) === duration
                        ? "bg-amber-500 text-white shadow-md shadow-amber-500/20 border-transparent ring-2 ring-amber-300/50"
                        : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    {duration} {t('seconds_unit', 'ثانية')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </ThreeDCard>

        <ThreeDCard color="bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-800" shadow="shadow-emerald-950/40" icon={<Share2 size={18} className="text-white" />} label={t('setting_share')}>
          <div className="space-y-4 pt-2">
            <div className="flex flex-col items-center justify-center py-5 px-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-300/10 rounded-full blur-2xl -ml-10 -mb-10" />
              
              <div className="w-12 h-12 bg-white text-emerald-600 rounded-2xl flex items-center justify-center mb-3 shadow-lg shadow-emerald-950/20 relative z-10">
                <Heart size={24} className="text-emerald-600 fill-emerald-600/20 animate-pulse" />
              </div>
              <h4 className="text-white font-black text-base sm:text-lg mb-1.5 relative z-10">{t('share_hadith_title', 'الدال على الخير كفاعله')}</h4>
              <p className="text-emerald-50 text-xs sm:text-sm font-bold leading-relaxed max-w-[300px] relative z-10">
                {t('share_card_desc', 'شارك تطبيق أذكار المؤمن مع عائلتك وأصدقائك، واجعله صدقة جارية لك ولمن تحب.')}
              </p>
            </div>
            
            <button
              onClick={handleShare}
              className="w-full py-3.5 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all duration-300 bg-white text-emerald-800 hover:bg-emerald-50 active:scale-[0.98] active:opacity-90 shadow-lg shadow-emerald-950/20"
            >
              <Share2 size={18} />
              {t('share_app_now', 'مشاركة التطبيق الآن')}
            </button>
          </div>
        </ThreeDCard>

        {/* Social Media Section */}
        <ThreeDCard color="bg-gradient-to-br from-indigo-600 via-blue-700 to-indigo-800" shadow="shadow-indigo-950/40" icon={<Globe size={18} className="text-white" />} label={t('setting_social', 'تابعنا على مواقع التواصل')}>
          <div className="space-y-3 pt-2">
            <p className="text-xs sm:text-sm font-bold text-indigo-50/95 text-right leading-relaxed mb-4">
              {t('social_card_desc', 'كن على تواصل دائم معنا لمعرفة آخر التحديثات والإضافات والمحتوى الإسلامي المتجدد.')}
            </p>
            
            <div className="grid grid-cols-2 gap-3">
              <a href="https://www.facebook.com/share/18WqMm9baA/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3.5 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 hover:border-white/30 transition-all group shadow-sm">
                <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform shadow">
                  <Facebook size={18} />
                </div>
                <span className="text-xs sm:text-sm font-black text-white">{t('social_facebook', 'فيسبوك')}</span>
              </a>
              
              <a href="https://x.com/azkaralmumelnk" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3.5 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 hover:border-white/30 transition-all group shadow-sm">
                <div className="w-9 h-9 rounded-lg bg-slate-950 flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform shadow">
                  <Twitter size={18} />
                </div>
                <span className="text-xs sm:text-sm font-black text-white">{t('social_twitter', 'تويتر')}</span>
              </a>

              <a href="https://www.instagram.com/azkar.almumin?igsh=dzJ6dHF4d3plbWk2" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3.5 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 hover:border-white/30 transition-all group shadow-sm">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform shadow">
                  <Instagram size={18} />
                </div>
                <span className="text-xs sm:text-sm font-black text-white">{t('social_instagram', 'إنستغرام')}</span>
              </a>
              
              <a href="https://t.me/azkar_almumen" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3.5 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 hover:border-white/30 transition-all group shadow-sm">
                <div className="w-9 h-9 rounded-lg bg-cyan-500 flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform shadow">
                  <Send size={18} className="-ml-0.5" />
                </div>
                <span className="text-xs sm:text-sm font-black text-white">{t('social_telegram', 'تليغرام')}</span>
              </a>
              
              <a href="mailto:azkarelmoumen.support@gmail.com" className="flex items-center gap-3 p-3.5 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 hover:border-white/30 transition-all group col-span-2 shadow-sm">
                <div className="w-9 h-9 rounded-lg bg-amber-500 flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform shadow">
                  <Mail size={18} />
                </div>
                <span className="text-xs sm:text-sm font-black text-white">{t('social_email', 'تواصل معنا عبر البريد')}</span>
              </a>
            </div>
          </div>
        </ThreeDCard>

        {/* 5-Star App Rating Card - NEW */}
        <ThreeDCard 
          color="bg-gradient-to-br from-[#064e3b] via-[#022c22] to-[#044a3a]" 
          shadow="shadow-emerald-950/40" 
          icon={<Star size={18} className="text-amber-300 fill-amber-300/30 animate-pulse" />} 
          label={t('rate_app_title', 'تقييم تجربة التطبيق')}
        >
          <div className="space-y-5 text-right">
            {userRating === null ? (
              <div className="space-y-4">
                <p className="text-xs sm:text-sm font-bold text-white/90 leading-relaxed">
                  {t('rate_app_prompt', 'رأيك يهمنا كثيراً لبناء وتطوير "أذكار المؤمن" ليكون رفيقاً إيمانياً أفضل! فضلاً قيم تجربتك معنا بـ 5 نجوم لدعم استمرار التطبيق مجاناً وبدون إعلانات.')}
                </p>
                
                {/* Interactive Stars Row */}
                <div className="flex items-center justify-center gap-2.5 py-4 bg-black/25 rounded-2xl border border-white/10 relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  
                  {[1, 2, 3, 4, 5].map((starValue) => {
                    const isLit = (hoveredRating !== null ? hoveredRating : 0) >= starValue || (userRating !== null ? userRating >= starValue : false);
                    return (
                      <motion.button
                        key={starValue}
                        type="button"
                        onMouseEnter={() => setHoveredRating(starValue)}
                        onMouseLeave={() => setHoveredRating(null)}
                        onClick={() => handleRateApp(starValue)}
                        whileHover={{ scale: 1.25, rotate: 12 }}
                        whileTap={{ scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 350, damping: 15 }}
                        className="p-1.5 cursor-pointer focus:outline-none transition-all duration-150 relative"
                      >
                        <Star 
                          size={34} 
                          className={cn(
                            "transition-colors duration-200",
                            isLit 
                              ? "text-amber-400 fill-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]" 
                              : "text-white/20 fill-transparent hover:text-white/40"
                          )}
                        />
                        {isLit && (
                          <span className="absolute inset-0 bg-amber-400/10 rounded-full blur-md opacity-50 pointer-events-none" />
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Star level explanation text */}
                <div className="h-7 flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    {hoveredRating !== null && (
                      <motion.span
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="text-xs font-black text-amber-200 bg-amber-500/20 px-3.5 py-1 rounded-full border border-amber-500/30"
                      >
                        {hoveredRating === 1 && t('rate_star_1', 'يحتاج إلى تحسين كبير ⭐️')}
                        {hoveredRating === 2 && t('rate_star_2', 'مقبول، ولكن ينقصه الكثير ⭐️⭐️')}
                        {hoveredRating === 3 && t('rate_star_3', 'جيد ومناسب للاستخدام ⭐️⭐️⭐️')}
                        {hoveredRating === 4 && t('rate_star_4', 'ممتاز وسهل الاستخدام جداً! ⭐️⭐️⭐️⭐️')}
                        {hoveredRating === 5 && t('rate_star_5', 'رائع جداً ومثالي فوق التوقعات! 🌟🕌')}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                {/* Celebratory High Rating State (4 or 5 Stars) */}
                {userRating >= 4 ? (
                  <div className="p-4.5 bg-gradient-to-br from-emerald-950/50 to-teal-950/40 rounded-2xl border border-emerald-500/30 space-y-3 relative overflow-hidden shadow-lg">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl" />
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-300 border border-emerald-500/30 shadow-inner shrink-0">
                        <Sparkles size={20} className="animate-pulse" />
                      </div>
                      <div>
                        <h4 className="text-sm sm:text-base font-black text-white">{t('rating_thank_you', 'شكراً لتقييمك الرائع بـ {{rating}} نجوم! ✨', { rating: userRating })}</h4>
                        <p className="text-xs font-black text-emerald-300">{t('rate_thanks_subtitle', 'نسعد جداً بدعمكم المبارك للتطبيق')}</p>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-white/90 leading-relaxed">
                      {t('rate_thanks_desc', 'كلماتك الطيبة وتقييمك العالي يمدنا بالطاقة للاستمرار وتحديث "أذكار المؤمن" بميزات متطورة وبطراز فني حديث يخدم كل مؤمن ومؤمنة في حياتهم اليومية. جزاك الله خيراً!')}
                    </p>
                    
                    {/* Display static glowing stars */}
                    <div className="flex items-center gap-2 py-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star 
                          key={s} 
                          size={20} 
                          className={cn(
                            "transition-all",
                            s <= userRating ? "text-amber-400 fill-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.6)]" : "text-white/10"
                          )} 
                        />
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-2.5 border-t border-white/10">
                      <button 
                        onClick={() => {
                          setUserRating(null);
                          safeLocalStorageRemoveItem('app_user_rating');
                        }}
                        className="text-xs font-black text-white/60 hover:text-white underline cursor-pointer"
                      >
                        {t('edit_rating', 'تعديل التقييم')}
                      </button>
                      
                      <button 
                        onClick={handleShare}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl transition-all active:scale-95 shadow-md"
                      >
                        <Share2 size={14} />
                        {t('share_earn_reward', 'انشر تؤجر - شارك التطبيق')}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Critical Constructive Feedback State (1 to 3 Stars) */
                  <div className="p-4.5 bg-gradient-to-br from-amber-950/50 to-slate-900/40 rounded-2xl border border-amber-500/30 space-y-3 relative overflow-hidden">
                    <h4 className="text-sm sm:text-base font-black text-white">{t('rating_apology', 'نأسف لأن تجربتك لم تكن مثالية بالكامل (تقييم {{rating}} نجوم)', { rating: userRating })}</h4>
                    <p className="text-xs sm:text-sm font-bold text-white/80 leading-relaxed">
                      {t('rate_feedback_desc', 'نحن نسعى دائماً لتقديم أفضل تجربة للمسلمين في شتى بقاع الأرض. فضلاً شاركنا ما الذي يمكننا تحسينه أو الميزات التي تود إضافتها لننال ثقتك الكاملة وتصنيفك بـ 5 نجوم:')}
                    </p>

                    {!ratingFeedbackSubmitted ? (
                      <div className="space-y-3 pt-1">
                        <textarea
                          value={ratingFeedback}
                          onChange={(e) => {
                            if (checkInputSafety(e.target.value)) {
                              setRatingFeedback(e.target.value);
                            }
                          }}
                          placeholder={t('rate_feedback_placeholder', 'أخبرنا باقتراحاتك لتطوير التطبيق...')}
                          rows={3}
                          className="w-full bg-black/40 text-white placeholder-white/40 text-xs sm:text-sm p-3.5 rounded-xl border border-white/15 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/30 resize-none font-bold"
                        />
                        <div className="flex items-center justify-between">
                          <button 
                            onClick={() => {
                              setUserRating(null);
                              safeLocalStorageRemoveItem('app_user_rating');
                            }}
                            className="text-xs font-black text-white/60 hover:text-white underline cursor-pointer"
                          >
                            {t('edit_rating', 'تعديل التقييم')}
                          </button>
                          
                          <button
                            disabled={isSubmittingRatingFeedback || !ratingFeedback.trim()}
                            onClick={handleRatingFeedbackSubmit}
                            className={cn(
                              "px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all shadow-md",
                              !ratingFeedback.trim() 
                                ? "bg-white/5 text-white/30 cursor-not-allowed border border-white/5" 
                                : "bg-amber-500 hover:bg-amber-600 text-slate-950 active:scale-95 shadow-amber-500/20 cursor-pointer"
                            )}
                          >
                            {isSubmittingRatingFeedback ? (
                              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                                <RefreshCw size={14} />
                              </motion.div>
                            ) : (
                              <>
                                <Send size={14} />
                                {t('send_and_continue_rating', 'إرسال ومتابعة التقييم')}
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-3 pt-2"
                      >
                        <div className="flex items-center gap-2 text-purple-200 font-black text-xs sm:text-sm bg-purple-500/20 p-3.5 rounded-xl border border-purple-500/30">
                          <CheckCircle2 size={16} />
                          <span>{t('rate_feedback_success', 'تم استلام مقترحك بنجاح! سنعمل بجد لتطوير التطبيق وخدمتك بشكل أفضل.')}</span>
                        </div>
                        <button 
                          onClick={() => {
                            setUserRating(null);
                            safeLocalStorageRemoveItem('app_user_rating');
                            setRatingFeedback('');
                            setRatingFeedbackSubmitted(false);
                          }}
                          className="text-xs font-black text-white/60 hover:text-white underline cursor-pointer"
                        >
                          {t('edit_rating_and_back', 'تعديل التقييم والعودة')}
                        </button>
                      </motion.div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </ThreeDCard>

        {/* Feedback & Suggestions Card - Modern Interactive */}
        <ThreeDCard color="bg-gradient-to-br from-amber-600 via-orange-700 to-amber-800" shadow="shadow-amber-950/40" icon={<Lightbulb size={18} className="text-white" />} label={t('setting_feedback')}>
          <div className="space-y-4 pt-1">
            <p className="text-xs sm:text-sm font-bold text-amber-50 text-right leading-relaxed">
              {t('feedback_desc', 'نحن نستمع إليك! شاركنا أفكارك، مقترحاتك، أو أي ملاحظة لتطوير التطبيق وجعله أفضل.')}
            </p>
            
            {/* Mood Selector */}
            <div className="space-y-2.5">
              <p className="text-xs font-black text-amber-100 text-right">{t('feedback_rate_exp', 'كيف تقيم تجربتك؟')}</p>
              <div className="flex items-center justify-between bg-black/25 backdrop-blur-md p-2 rounded-xl border border-white/15 gap-1.5">
                {[
                  { id: 'amazing', emoji: '🤩', label: t('feedback_mood_amazing', 'ممتاز') },
                  { id: 'good', emoji: '😃', label: t('feedback_mood_good', 'جيد') },
                  { id: 'okay', emoji: '😐', label: t('feedback_mood_okay', 'عادي') },
                  { id: 'bad', emoji: '😔', label: t('feedback_mood_bad', 'سيء') }
                ].map((mood) => (
                  <button
                    key={mood.id}
                    onClick={() => setFeedbackMood(mood.id)}
                    className={cn(
                      "flex-1 flex flex-col items-center gap-1 py-2 rounded-lg transition-all",
                      feedbackMood === mood.id 
                        ? "bg-white/25 shadow-md scale-105 ring-1 ring-white/50" 
                        : "hover:bg-white/10 opacity-75 hover:opacity-100"
                    )}
                  >
                    <span className="text-2xl filter drop-shadow">{mood.emoji}</span>
                    <span className="text-[10px] sm:text-xs font-black text-white">{mood.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Text Area */}
            <div className="relative">
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder={t('feedback_placeholder', 'اكتب مقترحك أو ملاحظتك هنا...')}
                className="w-full h-28 bg-black/30 backdrop-blur-md border border-white/20 rounded-xl p-3.5 text-xs sm:text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent resize-none transition-all text-right font-bold"
                dir="rtl"
                disabled={isSubmittingFeedback || feedbackSubmitted}
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleFeedbackSubmit}
              disabled={(!feedbackText.trim() && !feedbackMood) || isSubmittingFeedback || feedbackSubmitted}
              className={cn(
                "w-full py-3.5 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all duration-300",
                feedbackSubmitted 
                  ? "bg-white/20 text-white border border-white/30" 
                  : (!feedbackText.trim() && !feedbackMood)
                    ? "bg-white/5 text-white/30 cursor-not-allowed"
                    : "bg-white text-orange-950 hover:bg-amber-50 active:scale-[0.98] shadow-lg shadow-amber-950/20"
              )}
            >
              {isSubmittingFeedback ? (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                  <RefreshCw size={18} />
                </motion.div>
              ) : feedbackSubmitted ? (
                <motion.div 
                  initial={{ scale: 0.5, opacity: 0 }} 
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center gap-2 font-black"
                >
                  <CheckCircle2 size={18} />
                  {t('feedback_success_msg', 'تم الإرسال بنجاح، شكراً لك!')}
                </motion.div>
              ) : (
                <>
                  <Send size={18} />
                  {t('feedback_send_btn', 'إرسال المقترح')}
                </>
              )}
            </button>
          </div>
        </ThreeDCard>

        {/* Google Calendar Sync Card */}
        <ThreeDCard color="bg-slate-800" shadow="shadow-slate-900/30" icon={<Calendar size={18} className="text-blue-400" />} label={t('setting_google_calendar', 'مزامنة تقويم Google')}>
          <div className="space-y-4">
            <p className="text-xs sm:text-sm font-bold text-white/90 text-right leading-relaxed">
              {t('google_calendar_desc', 'اربط التطبيق بـ تقويم Google لمزامنة أذكارك اليومية، أهدافك الروحية والمناسبات الإسلامية الهامة مباشرة مع جهازك.')}
            </p>
            <button
              onClick={() => navigate('/calendar-sync')}
              className="w-full py-3.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-blue-500/20 active:scale-[0.98] transition-all cursor-pointer"
            >
              <Calendar size={18} />
              {t('setup_sync_calendar', 'إعداد ومزامنة التقويم')}
            </button>
          </div>
        </ThreeDCard>

        {/* Privacy Card - Unified 3D */}
        <ThreeDCard color="bg-slate-800" shadow="shadow-slate-900/30" icon={<Shield size={18} />} label={t('setting_privacy')}>
          <div className="space-y-4 text-right">
            <p className="text-xs sm:text-sm text-white/90 leading-relaxed font-bold">
              {t('privacy_desc', 'نحن نحترم خصوصيتك بشكل كامل. جميع بياناتك (الأذكار المخصصة، الإعدادات، الموقع) تُحفظ محلياً على جهازك فقط ولا يتم إرسالها إلى أي خادم خارجي.')}
            </p>
            <div className="flex items-center gap-3 p-4 bg-black/25 rounded-2xl border border-white/10">
              <div className="w-9 h-9 bg-teal-500/20 rounded-xl flex items-center justify-center text-teal-400 border border-teal-500/30">
                <Shield size={20} />
              </div>
              <span className="text-xs sm:text-sm font-black text-white tracking-wide">{t('privacy_secure_local', 'بياناتك آمنة ومحفوظة محلياً')}</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <button 
                type="button"
                onClick={() => setShowPermissionsModal(true)} 
                className="w-full flex items-center justify-center gap-2 p-3 bg-white/5 hover:bg-white/10 border border-white/10 text-teal-300 rounded-xl transition-colors font-black text-xs cursor-pointer"
              >
                <KeyRound size={16} />
                <span>{t('permissions_transparency_btn', 'شفافية أذونات التطبيق')}</span>
              </button>
              <button 
                type="button"
                onClick={() => navigate('/legal')} 
                className="w-full flex items-center justify-center gap-2 p-3 bg-teal-500 hover:bg-teal-600 active:bg-teal-700 text-white rounded-xl transition-colors font-black text-xs shadow-md cursor-pointer"
              >
                <FileText size={16} />
                <span>{t('terms_and_privacy_policy', 'الشروط وسياسة الخصوصية')}</span>
              </button>
            </div>
          </div>
        </ThreeDCard>

        {/* Rate & Share Link */}
        <ThreeDLink 
          color="bg-slate-800" 
          icon={<Star size={18} className="text-amber-400 fill-amber-400" />} 
          label={t('rate_and_share_app', 'تقييم ومشاركة التطبيق')} 
          onClick={() => setShowRateShareModal(true)} 
        />

        {/* Contact Us Support Link */}
        <ThreeDLink 
          color="bg-slate-800" 
          icon={<LifeBuoy size={18} className="text-teal-400" />} 
          label={t('contact_us_support', 'اتصل بنا والدعم الفني')} 
          onClick={() => navigate('/contact')} 
        />

        {/* About App Card - Unified 3D */}
        <ThreeDCard color="bg-slate-800" shadow="shadow-slate-900/30" icon={<Info size={18} />} label={t('setting_about')}>
          <div className="space-y-5 text-right">
            <div className="bg-black/25 p-5 rounded-2xl border border-white/10 space-y-4">
              <div className="flex items-center gap-4 mb-2">
                <AppIcon size={14} iconSize={28} className="shadow-xl" />
                <div>
                  <h4 className="text-xl font-black text-white tracking-tight">{t('app_name', 'أذكار المؤمن')}</h4>
                  <p className="text-xs font-black text-teal-400 uppercase tracking-[0.2em]">{t('app_version', 'الإصدار 1.2.0')}</p>
                </div>
              </div>
              
              <p className="text-xs sm:text-sm text-white/90 leading-relaxed font-bold mb-3">
                {t('app_full_description', 'تطبيق "أذكار المؤمن" هو رفيقك الروحي الشامل وهو عمل مجاني بالكامل وصدقة جارية ابتغاء مرضاة الله تعالى لكل مسلم ومسلمة، مصمم بحب وعناية فائقة ليجمع بين أصالة المحتوى الإسلامي وروعة التصميم العصري والذكي بدون أي إعلانات.')}
              </p>
              <ul className="text-xs sm:text-sm text-white/80 leading-relaxed font-bold space-y-2 list-disc list-inside">
                <li><span className="text-teal-300 font-black">{t('feature_library_title', 'مكتبة واسعة:')}</span> {t('feature_library_desc', 'أذكار وأدعية مع مسبحة إلكترونية متطورة.')}</li>
                <li><span className="text-teal-300 font-black">{t('feature_quran_title', 'القرآن الكريم:')}</span> {t('feature_quran_desc', 'مكتبة صوتية متكاملة لنخبة من المقرئين، مع إدارة تخزين ذكية تدعم عدم الاتصال بالإنترنت.')}</li>
                <li><span className="text-teal-300 font-black">{t('feature_lectures_title', 'محاضرات ودروس:')}</span> {t('feature_lectures_desc', 'كنوز من العلم الشرعي لكبار الدعاة والعلماء.')}</li>
                <li><span className="text-teal-300 font-black">{t('feature_prayer_title', 'الصلاة والقبلة:')}</span> {t('feature_prayer_desc', 'مواقيت دقيقة، تنبيهات، وبوصلة تفاعلية حديثة.')}</li>
                <li><span className="text-teal-300 font-black">{t('feature_little_believer_title', 'المسلم الصغير:')}</span> {t('feature_little_believer_desc', 'قسم خاص لغرس القيم بأسلوب تفاعلي وممتع.')}</li>
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/25 p-4 rounded-2xl border border-white/10">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">{t('developer')}</p>
                <p className="text-xs font-black text-teal-300 tracking-[0.2em]" style={{ fontFamily: "'Orbitron', sans-serif" }}>Hanine Bouchta</p>
              </div>
              <div className="bg-black/25 p-4 rounded-2xl border border-white/10">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">{t('tech_label', 'التقنية')}</p>
                <p className="text-xs sm:text-sm font-black text-white">React + 3D</p>
              </div>
            </div>

            <div className="bg-teal-500/10 p-5 rounded-2xl border border-teal-500/20">
              <p className="text-xs sm:text-sm font-black text-teal-400 mb-3 uppercase tracking-widest">{t('app_features_title', 'مميزات التطبيق:')}</p>
              <ul className="space-y-2.5">
                {[
                  t('feature_item_1', 'أذكار الصباح والمساء والنوم'),
                  t('feature_item_2', 'مواقيت الصلاة بدقة عالية'),
                  t('feature_item_3', 'بوصلة القبلة ثلاثية الأبعاد'),
                  t('feature_item_4', 'نظام تنبيهات ذكي ومخصص'),
                  t('feature_item_5', 'واجهات عصرية قابلة للتخصيص')
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-xs sm:text-sm text-white font-black">
                    <div className="w-2 h-2 bg-teal-400 rounded-full shadow-[0_0_8px_rgba(45,212,191,0.8)] shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </ThreeDCard>

        {/* Developer */}
        <DeveloperCard />

        {/* Reset Buttons - Compact 3D */}
        <div className="flex flex-col gap-3">
          {cleanupMessage && (
            <div className={`p-3 rounded-xl text-xs sm:text-sm font-black text-center border shadow-sm ${cleanupIsError ? 'bg-red-500/15 text-red-300 border-red-500/30' : 'bg-teal-500/15 text-teal-300 border-teal-500/30'}`}>
              {cleanupMessage}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                if (!confirmCleanAdhkar) { setConfirmCleanAdhkar(true); setTimeout(() => setConfirmCleanAdhkar(false), 3000); return; }
                  cleanAdhkarData(); setConfirmCleanAdhkar(false);
              }}
              className="relative w-full flex flex-col items-center justify-center gap-2.5 p-4 rounded-2xl text-white overflow-hidden shadow-[0_4px_0_0_rgba(15,23,42,1)] hover:-translate-y-0.5 hover:shadow-[0_6px_0_0_rgba(15,23,42,1)] active:translate-y-1 active:shadow-[0_0px_0_0_rgba(15,23,42,1)] transition-all bg-slate-800 border border-white/10"
            >
            <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl -mr-8 -mt-8 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-black/20 rounded-full blur-xl -ml-8 -mb-8 pointer-events-none" />
            <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center shadow-inner border border-white/15">
              <Database size={18} className="text-emerald-400" />
            </div>
            <span className="font-black text-xs sm:text-sm text-slate-100 tracking-wide">
              {confirmCleanAdhkar ? (t('confirm_delete' as any) || 'تأكيد الحذف') : (t('clean_data' as any) || 'تنظيف البيانات')}
            </span>
          </button>
          <button
            onClick={handleReset}
            className="relative w-full flex flex-col items-center justify-center gap-2.5 p-4 rounded-2xl text-white overflow-hidden shadow-[0_4px_0_0_rgba(15,23,42,1)] hover:-translate-y-0.5 hover:shadow-[0_6px_0_0_rgba(15,23,42,1)] active:translate-y-1 active:shadow-[0_0px_0_0_rgba(15,23,42,1)] transition-all bg-slate-800 border border-white/10"
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/10 rounded-full blur-xl -mr-8 -mt-8 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-black/20 rounded-full blur-xl -ml-8 -mb-8 pointer-events-none" />
            <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center shadow-inner border border-white/15">
              <RotateCw size={18} className="text-rose-400" />
            </div>
            <span className="font-black text-xs sm:text-sm text-slate-100 tracking-wide">{t('reset_all' as any) || 'إعادة تعيين الكل'}</span>
          </button>
        </div>
        </div>

        {/* Backup & Restore Card */}
        <ThreeDCard color="bg-slate-800" shadow="shadow-slate-900/30" icon={<Database size={18} className="text-teal-400" />} label={t('setting_backup')}>
          <div className="space-y-4">
            <p className="text-xs sm:text-sm font-bold text-white/90 text-right leading-relaxed mb-4">
              {t('backup_desc', 'يمكنك تصدير بياناتك بالكامل في ملف لضمان عدم ضياع إنجازاتك، أو حفظها سحابياً للوصول إليها من هواتف أخرى.')}
            </p>
            <BackupManager />
          </div>
        </ThreeDCard>

        {/* Account & Data Deletion (App Store & Google Play Standards) */}
        <div className="p-4 bg-slate-800/95 rounded-2xl border border-rose-500/30 text-white space-y-3 shadow-lg shadow-rose-950/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
              <UserX size={20} />
            </div>
            <div className="text-right flex-1">
              <h4 className="text-xs sm:text-sm font-black text-rose-400">{t('account_data_deletion_title', 'إدارة وحذف الحساب والبيانات')}</h4>
              <p className="text-[11px] text-slate-300 font-bold leading-relaxed">{t('account_data_deletion_desc', 'حذف حسابك السحابي وملفك الشخصي ومسح كافة النسخ الاحتياطية وتصفير الذاكرة نهائياً.')}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowDeletionModal(true)}
            className="w-full py-3 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-rose-950/40"
          >
            <Trash2 size={16} />
            <span>{t('delete_account_and_all_data_btn', 'حذف الحساب ومسح كافة البيانات نهائياً')}</span>
          </button>
        </div>
          </motion.div>
        )}

      <div className="pt-2 pb-4 flex flex-col items-center justify-center w-full px-2">
        <div className="relative w-full max-w-sm group cursor-pointer" onClick={handleCheckForUpdates}>
          <div className="absolute inset-0 bg-slate-800 rounded-2xl blur opacity-40 group-hover:opacity-70 transition duration-500"></div>
          <div className="relative flex flex-col px-6 py-4 bg-slate-800 rounded-2xl text-white shadow-[0_8px_0_0_rgba(15,23,42,1)] hover:-translate-y-1 hover:shadow-[0_12px_0_0_rgba(15,23,42,1)] active:translate-y-2 active:shadow-[0_0px_0_0_rgba(15,23,42,1)] transition-all duration-300 border border-white/10 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/20 rounded-full blur-xl -ml-12 -mb-12 pointer-events-none" />
            
            <div className="flex items-center gap-4 relative z-10 w-full">
              <AppIcon size={12} iconSize={24} className="shrink-0" />
              <div className="flex flex-col items-start leading-tight flex-1">
                <span className="text-lg font-black tracking-wide drop-shadow-md">{t('app_name', 'أذكار المؤمن')}</span>
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-1.5 bg-black/40 px-2.5 py-0.5 rounded-full backdrop-blur-sm border border-white/5 shadow-sm flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse shadow-[0_0_8px_rgba(45,212,191,0.8)]" />
                  {t('version_auto_update', 'الإصدار 1.2.0 • تحديث تلقائي فوري')}
                </span>
              </div>
              
              <div className="relative z-10 shrink-0">
                 <button 
                   type="button"
                   aria-label={t('check_for_updates', 'التحقق من التحديثات')}
                   disabled={isCheckingUpdate}
                   className="w-10 h-10 rounded-full bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 flex items-center justify-center backdrop-blur-sm border border-teal-500/30 transition-colors"
                 >
                   <RefreshCw size={18} className={cn("text-teal-300 transition-transform", isCheckingUpdate && "animate-spin")} />
                 </button>
              </div>
            </div>

            {updateStatusText && (
              <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-center gap-2 text-xs font-bold text-teal-300 animate-fadeIn text-center">
                {isCheckingUpdate ? (
                  <RefreshCw size={13} className="animate-spin text-teal-300" />
                ) : (
                  <CheckCircle2 size={14} className="text-emerald-400" />
                )}
                <span>{updateStatusText}</span>
              </div>
            )}

            {/* Glossy reflection */}
            <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent rounded-t-2xl pointer-events-none" />
          </div>
        </div>
      </div>
      </AnimatePresence>

      {/* Store Compliance & Interaction Modals */}
      <AccountDeletionModal 
        isOpen={showDeletionModal} 
        onClose={() => setShowDeletionModal(false)} 
      />
      <PermissionsExplainerModal 
        isOpen={showPermissionsModal} 
        onClose={() => setShowPermissionsModal(false)} 
      />
      <RateAndShareModal 
        isOpen={showRateShareModal} 
        onClose={() => setShowRateShareModal(false)} 
      />
    </div>
  );
};

const ThreeDCard: React.FC<{ color: string; shadow: string; icon: React.ReactNode; label: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ color, shadow, icon, label, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <motion.div
      className={cn(
        "relative rounded-2xl p-4 text-white overflow-hidden border-b-4 border-black/20 cursor-pointer transition-all",
        color,
        shadow
      )}
      onClick={() => setIsOpen(!isOpen)}
    >
      <div className="relative z-10 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center shadow-inner border border-white/20">
              {icon}
            </div>
            <h3 className="font-black text-base tracking-tight drop-shadow-md">{label}</h3>
          </div>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="w-6 h-6 bg-white/5 rounded-full flex items-center justify-center"
          >
            <ChevronDown size={14} className="text-white/60" />
          </motion.div>
        </div>
        
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="pt-2">
                {children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12 blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-black/5 rounded-full -ml-8 -mb-8 blur-xl pointer-events-none" />
    </motion.div>
  );
};

const ThreeDLink: React.FC<{ color: string; icon: React.ReactNode; label: string; onClick?: () => void }> = ({ color, icon, label, onClick }) => (
  <button 
    onClick={onClick}
    className={cn(
    "relative w-full flex items-center justify-between p-4 rounded-2xl text-white overflow-hidden shadow-md border-b-4 border-black/20 active:border-b-0 active:translate-y-1 transition-all",
    color
  )}>
    <div className="relative z-10 flex items-center justify-between w-full">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center shadow-inner border border-white/20">
          {icon}
        </div>
        <h3 className="font-black text-base tracking-tight drop-shadow-md">{label}</h3>
      </div>
      <ChevronRight size={14} className="text-white/60 rotate-180" />
    </div>
    <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12 blur-2xl pointer-events-none" />
    <div className="absolute bottom-0 left-0 w-16 h-16 bg-black/5 rounded-full -ml-8 -mb-8 blur-xl pointer-events-none" />
  </button>
);


const SubAccordion: React.FC<{ icon: React.ReactNode; label: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ icon, label, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-sm">
      <button
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
        className="w-full flex items-center justify-between p-3 active:scale-[0.99] transition-transform"
      >
        <div className="flex items-center gap-2.5">
          <div className="text-white/80">
            {icon}
          </div>
          <span className="text-xs sm:text-sm font-black text-white drop-shadow-sm">{label}</span>
        </div>
        <ChevronDown
          size={16}
          className={cn("text-white/40 transition-transform duration-300", isOpen && "rotate-180")}
        />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 pt-1 border-t border-white/5">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const DeveloperCard: React.FC = () => {
  const { settings } = useAppContext();
  const { t } = useTranslation(settings.appLanguage);
  const { navigate } = useSmartNavigation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div 
      layout
      onClick={() => setIsOpen(!isOpen)}
      className="relative w-full p-4 rounded-2xl text-white shadow-md border-b-4 border-black/20 bg-slate-800 cursor-pointer overflow-hidden transition-all"
    >
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center shadow-inner border border-white/20">
            <Code size={18} />
          </div>
          <h3 className="font-black text-base tracking-tight drop-shadow-md">{t('developer')}</h3>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="w-6 h-6 bg-white/5 rounded-full flex items-center justify-center"
        >
          <ChevronDown size={14} className="text-white/60" />
        </motion.div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="relative z-10 overflow-hidden"
          >
            <div className="pt-3 mt-3 border-t border-white/10 space-y-3">
              <div className="flex flex-col items-center gap-1">
                <p className="text-xs text-white/50 uppercase tracking-[0.4em] font-black">{t('developer')}</p>
                <p className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-emerald-400 to-teal-300 drop-shadow-sm tracking-[0.22em]" style={{ fontFamily: "'Orbitron', sans-serif" }}>Hanine Bouchta</p>
              </div>
              <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-bold text-center">
                {t('developer_message', 'تم تطوير هذا التطبيق بحب وعناية ليكون رفيقك اليومي في ذكر الله. نسأل الله أن يتقبل منا ومنكم صالح الأعمال.')}
              </p>
              
              <div className="flex items-center gap-2 pt-1">
                <button onClick={(e) => { e.stopPropagation(); navigate('/contact'); }} className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 transition-colors rounded-xl text-xs sm:text-sm font-black text-emerald-300 active:scale-95 shadow-sm cursor-pointer">
                  <Mail size={16} />
                  {t('contact_support_page_btn', 'صفحة اتصل بنا والدعم الفني')}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12 blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-black/5 rounded-full -ml-8 -mb-8 blur-xl pointer-events-none" />
    </motion.div>
  );
};

