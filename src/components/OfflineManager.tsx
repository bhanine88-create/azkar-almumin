import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, Check, Trash2, RefreshCw, Wifi, WifiOff, HardDrive, ShieldCheck, Database, Info, AlertTriangle, Sparkles, BookText } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { useQuranSettings } from '../context/QuranSettingsContext';
import { mushafService, MUSHAF_EDITIONS } from '../services/mushafService';
import { quranOfflineService } from '../services/quranOfflineService';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useTranslation } from '../i18n';
import { cn } from '../lib/utils';
import { safeLocalStorageGetItem, safeLocalStorageSetItem, safeLocalStorageRemoveItem } from "../utils/storage";

export const OfflineManager: React.FC = () => {
  const isOnline = useOnlineStatus();
  const { settings, downloadProgress, startDownloadEdition } = useAppContext();
  const { tafsirType, recitation, reciter } = useQuranSettings();
  const { t } = useTranslation(settings.appLanguage);
  
  const [downloadStates, setDownloadStates] = useState<Record<string, { isDownloaded: boolean, count: number }>>({});
  const [loading, setLoading] = useState(true);
  
  const [textDownloadStatus, setTextDownloadStatus] = useState<{isDownloaded: boolean, progress: number, isDownloading: boolean}>({
    isDownloaded: false,
    progress: 0,
    isDownloading: false
  });
  const textAbortController = useRef<AbortController | null>(null);
  const [hadithDownloadStatus, setHadithDownloadStatus] = useState<{isDownloaded: boolean, progress: number, isDownloading: boolean}>({
    isDownloaded: safeLocalStorageGetItem('hadiths_offline') === 'true',
    progress: 0,
    isDownloading: false
  });
  const hadithAbortController = useRef<AbortController | null>(null);

  const [audioDownloadStatus, setAudioDownloadStatus] = useState<{isDownloaded: boolean, progress: number, isDownloading: boolean}>({
    isDownloaded: false,
    progress: 0,
    isDownloading: false
  });
  const audioAbortController = useRef<AbortController | null>(null);


  useEffect(() => {
    checkStorageStatus();
  }, [tafsirType, recitation, reciter]);

  const checkStorageStatus = async () => {
    setLoading(true);
    const states: Record<string, { isDownloaded: boolean, count: number }> = {};
    
    for (const key of Object.keys(MUSHAF_EDITIONS)) {
      const isDownloaded = await mushafService.isEditionDownloaded(key);
      const count = await mushafService.getDownloadProgress(key);
      states[key] = { isDownloaded, count };
    }
    
    // Check Quran text offline status
    let hasAllText = true;
    for (let s = 1; s <= 114; s++) {
      const hasText = await quranOfflineService.isSurahTextDownloaded(s, tafsirType || 'ar.muyassar', recitation || 'hafs');
      if (!hasText) {
        hasAllText = false;
        break;
      }
    }
    
    
    // Check Quran audio offline status
    let hasAllAudio = true;
    for (let s = 1; s <= 114; s++) {
      const hasAudio = await quranOfflineService.isSurahAudioDownloaded(s, reciter);
      if (!hasAudio) {
        hasAllAudio = false;
        break;
      }
    }
    setAudioDownloadStatus(prev => ({ ...prev, isDownloaded: hasAllAudio }));

    setTextDownloadStatus(prev => ({ ...prev, isDownloaded: hasAllText }));
    setDownloadStates(states);
    setLoading(false);
  };

  const handleRemove = async (editionId: string) => {
    if (window.confirm(t('confirm_delete_offline_data', 'هل أنت متأكد من حذف البيانات المحملة؟ ستحتاج للإنترنت لعرضها لاحقاً.'))) {
      await mushafService.removeEdition(editionId);
      await checkStorageStatus();
    }
  };

  const handleDownloadFullText = async () => {
    if (!isOnline) return;
    
    setTextDownloadStatus({ isDownloaded: false, progress: 0, isDownloading: true });
    textAbortController.current = new AbortController();
    
    try {
      await quranOfflineService.downloadFullQuranText(
        tafsirType || 'ar.muyassar',
        recitation || 'hafs',
        (progress) => {
          setTextDownloadStatus(prev => ({ ...prev, progress }));
        },
        textAbortController.current.signal
      );
      setTextDownloadStatus({ isDownloaded: true, progress: 100, isDownloading: false });
    } catch (e: any) {
      if (e.message !== 'تم إلغاء التحميل') {
        alert(t('error_download_tafsir', 'حدث خطأ أثناء تحميل النص والتفسير. يرجى المحاولة مرة أخرى.'));
      }
      setTextDownloadStatus(prev => ({ ...prev, isDownloading: false, progress: 0 }));
    }
  };

  
  const handleDownloadAllHadiths = async () => {
    if (!isOnline) return;
    setHadithDownloadStatus({ isDownloaded: false, progress: 0, isDownloading: true });
    hadithAbortController.current = new AbortController();
    
    try {
      const { hadithService } = await import('../services/hadithService');
      await hadithService.downloadAllHadiths(
        (progress) => setHadithDownloadStatus(prev => ({ ...prev, progress })),
        hadithAbortController.current.signal
      );
      setHadithDownloadStatus({ isDownloaded: true, progress: 100, isDownloading: false });
      safeLocalStorageSetItem('hadiths_offline', 'true');
    } catch (e: any) {
      if (e.message !== 'تم إلغاء التحميل') {
        alert(t('error_download_hadiths', 'حدث خطأ أثناء تحميل الأحاديث. يرجى المحاولة مرة أخرى.'));
      }
      setHadithDownloadStatus(prev => ({ ...prev, isDownloading: false, progress: 0 }));
    }
  };

  const handleDownloadFullAudio = async () => {
    if (!isOnline) return;
    
    setAudioDownloadStatus({ isDownloaded: false, progress: 0, isDownloading: true });
    audioAbortController.current = new AbortController();
    
    try {
      await quranOfflineService.downloadFullQuranAudio(
        reciter,
        (progress) => setAudioDownloadStatus(prev => ({ ...prev, progress })),
        audioAbortController.current.signal
      );
      setAudioDownloadStatus({ isDownloaded: true, progress: 100, isDownloading: false });
    } catch (e: any) {
      if (e.message !== 'تم إلغاء التحميل') {
        alert(t('error_download_audio', 'حدث خطأ أثناء تحميل التلاوة. قد تستغرق مساحة كبيرة.'));
      }
      setAudioDownloadStatus(prev => ({ ...prev, isDownloading: false, progress: 0 }));
    }
  };

  const handleRemoveFullAudio = async () => {
    if (window.confirm(t('confirm_delete_audio', 'هل أنت متأكد من حذف جميع التلاوات الصوتية المحملة؟'))) {
      await quranOfflineService.removeFullQuranAudio(reciter);
      setAudioDownloadStatus({ isDownloaded: false, progress: 0, isDownloading: false });
    }
  };

  const handleRemoveFullText = async () => {
    if (window.confirm(t('confirm_delete_text_tafsir', 'هل أنت متأكد من حذف جميع نصوص القرآن والتفاسير المحملة؟'))) {
      for (let s = 1; s <= 114; s++) {
        await quranOfflineService.deleteSurahText(s, tafsirType || 'ar.muyassar', recitation || 'hafs');
      }
      setTextDownloadStatus({ isDownloaded: false, progress: 0, isDownloading: false });
    }
  };

  return (
    <div className="space-y-6">
      {/* Network Status Banner */}
      <div className={cn(
        "p-4 rounded-2xl flex items-center gap-4 transition-all duration-500",
        isOnline 
          ? "bg-emerald-500/10 border border-emerald-500/20" 
          : "bg-amber-500/10 border border-amber-500/20"
      )}>
        <div className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500",
          isOnline ? "bg-emerald-500/20 text-emerald-500" : "bg-amber-500/20 text-amber-500"
        )}>
          {isOnline ? <Wifi size={24} /> : <WifiOff size={24} />}
        </div>
        <div>
          <h3 className="font-black text-sm text-white">
            {isOnline ? t('offline_status_online', 'أنت متصل بالإنترنت') : t('offline_status_offline', 'أنت في وضع عدم الاتصال')}
          </h3>
          <p className="text-[10px] text-white/40 font-bold leading-tight">
            {isOnline 
              ? t('offline_status_online_desc', 'يمكنك تحميل المحتوى للاستخدام لاحقاً بدون إنترنت') 
              : t('offline_status_offline_desc', 'يمكنك استخدام المحتوى الذي قمت بتحميله مسبقاً')}
          </p>
        </div>
      </div>

      {/* Main Download Manager Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database size={16} className="text-teal-500" />
            <h4 className="text-sm font-black text-white">{t('offline_mgmt_title', 'إدارة المحتوى غير المتصل')}</h4>
          </div>
          <button 
            onClick={checkStorageStatus}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
          >
            <RefreshCw size={14} className={cn("text-white/40", loading && "animate-spin")} />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {/* Adhkar Section (Always Ready) */}
          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h5 className="text-sm font-black text-white">{t('offline_adhkar_title', 'الأذكار والأدعية')}</h5>
                  <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">{t('offline_ready_label', 'جاهز للعمل بدون إنترنت')}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-xl text-[10px] font-black">
                <Check size={12} />
                {t('offline_builtin_app', 'مدمج بالتطبيق')}
              </div>
            </div>
          </div>

          
          {/* Audio Section */}
          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center">
                  <Database size={20} />
                </div>
                <div>
                  <h5 className="text-sm font-black text-white">{t('offline_audio_quran', 'التلاوة الصوتية للقرآن')}</h5>
                  <p className="text-[10px] text-white/40 font-bold">{t('offline_for_current_reciter', 'للقارئ المحدد حالياً')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {audioDownloadStatus.isDownloaded ? (
                  <button 
                    onClick={handleRemoveFullAudio}
                    className="p-2.5 bg-rose-500/10 text-rose-400 rounded-xl hover:bg-rose-500/20 transition-all shadow-sm"
                  >
                    <Trash2 size={16} />
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      if (audioDownloadStatus.isDownloading) {
                         audioAbortController.current?.abort();
                         setAudioDownloadStatus(prev => ({ ...prev, isDownloading: false, progress: 0 }));
                      } else {
                         handleDownloadFullAudio();
                      }
                    }}
                    disabled={!isOnline && !audioDownloadStatus.isDownloading}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all",
                      !isOnline && !audioDownloadStatus.isDownloading
                        ? "bg-white/5 text-white/20 cursor-not-allowed"
                        : audioDownloadStatus.isDownloading
                          ? "bg-rose-500/20 text-rose-400 hover:bg-rose-500/30"
                          : "bg-teal-600 text-white hover:bg-teal-700 shadow-lg shadow-teal-600/20 active:scale-95"
                    )}
                  >
                    {audioDownloadStatus.isDownloading ? (
                      <>
                        <WifiOff size={14} />
                        {t('btn_stop', 'إيقاف')}
                      </>
                    ) : (
                      <>
                        <Download size={14} />
                        {t('download', 'تحميل')}
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
            
            {audioDownloadStatus.isDownloading && (
              <div className="relative h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="absolute inset-y-0 left-0 bg-indigo-500 transition-all duration-300"
                  style={{ width: `${audioDownloadStatus.progress}%` }}
                />
              </div>
            )}
          </div>

          {/* Hadith Section */}
          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center">
                  <Database size={20} />
                </div>
                <div>
                  <h5 className="text-sm font-black text-white">{t('offline_hadiths_title', 'الأحاديث النبوية')}</h5>
                  <p className="text-[10px] text-white/40 font-bold">{t('offline_hadiths_desc', 'تحميل قاعدة الأحاديث الشريفة')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {hadithDownloadStatus.isDownloaded ? (
                  <button 
                    onClick={() => {
                      if(window.confirm(t('confirm_delete_hadiths', 'هل أنت متأكد من حذف قاعدة الأحاديث؟'))) {
                        safeLocalStorageRemoveItem('hadiths_offline');
                        setHadithDownloadStatus({ isDownloaded: false, progress: 0, isDownloading: false });
                      }
                    }}
                    className="p-2.5 bg-rose-500/10 text-rose-400 rounded-xl hover:bg-rose-500/20 transition-all shadow-sm"
                  >
                    <Trash2 size={16} />
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      if (hadithDownloadStatus.isDownloading) {
                         hadithAbortController.current?.abort();
                         setHadithDownloadStatus(prev => ({ ...prev, isDownloading: false, progress: 0 }));
                      } else {
                         handleDownloadAllHadiths();
                      }
                    }}
                    disabled={!isOnline && !hadithDownloadStatus.isDownloading}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all",
                      !isOnline && !hadithDownloadStatus.isDownloading
                        ? "bg-white/5 text-white/20 cursor-not-allowed"
                        : hadithDownloadStatus.isDownloading
                          ? "bg-rose-500/20 text-rose-400 hover:bg-rose-500/30"
                          : "bg-teal-600 text-white hover:bg-teal-700 shadow-lg shadow-teal-600/20 active:scale-95"
                    )}
                  >
                    {hadithDownloadStatus.isDownloading ? (
                      <>
                        <WifiOff size={14} />
                        {t('btn_stop', 'إيقاف')}
                      </>
                    ) : (
                      <>
                        <Download size={14} />
                        {t('download', 'تحميل')}
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
            
            {hadithDownloadStatus.isDownloading && (
              <div className="relative h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="absolute inset-y-0 left-0 bg-blue-500 transition-all duration-300"
                  style={{ width: `${hadithDownloadStatus.progress}%` }}
                />
              </div>
            )}
          </div>

          {/* Full Quran Text Section */}
          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center">
                  <BookText size={20} />
                </div>
                <div>
                  <h5 className="text-sm font-black text-white">{t('offline_quran_text_tafsir', 'النص والتفسير (القرآن كاملاً)')}</h5>
                  <p className="text-[10px] text-white/40 font-bold">{t('offline_quran_text_desc', 'نصوص المصحف والتفسير لـ 114 سورة')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {textDownloadStatus.isDownloaded ? (
                  <button 
                    onClick={handleRemoveFullText}
                    className="p-2.5 bg-rose-500/10 text-rose-400 rounded-xl hover:bg-rose-500/20 transition-all shadow-sm"
                  >
                    <Trash2 size={16} />
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      if (textDownloadStatus.isDownloading) {
                         textAbortController.current?.abort();
                         setTextDownloadStatus(prev => ({ ...prev, isDownloading: false, progress: 0 }));
                      } else {
                         handleDownloadFullText();
                      }
                    }}
                    disabled={!isOnline && !textDownloadStatus.isDownloading}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all",
                      !isOnline && !textDownloadStatus.isDownloading
                        ? "bg-white/5 text-white/20 cursor-not-allowed"
                        : textDownloadStatus.isDownloading
                          ? "bg-rose-500/20 text-rose-400 hover:bg-rose-500/30"
                          : "bg-teal-600 text-white hover:bg-teal-700 shadow-lg shadow-teal-600/20 active:scale-95"
                    )}
                  >
                    {textDownloadStatus.isDownloading ? (
                      <>
                        <WifiOff size={14} />
                        {t('btn_stop', 'إيقاف')}
                      </>
                    ) : (
                      <>
                        <Download size={14} />
                        {t('download', 'تحميل')}
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
            
            {textDownloadStatus.isDownloading && (
              <div className="relative h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="absolute inset-y-0 left-0 bg-emerald-500 transition-all duration-300"
                  style={{ width: `${textDownloadStatus.progress}%` }}
                />
              </div>
            )}
          </div>

          {/* Quran Editions Section */}
          {Object.values(MUSHAF_EDITIONS).map((edition) => {
            const state = downloadStates[edition.id] || { isDownloaded: false, count: 0 };
            const isDownloading = downloadProgress[edition.id]?.isDownloading;
            const progress = downloadProgress[edition.id]?.progress || 0;
            const currentCount = isDownloading ? Math.max(state.count, progress) : state.count;
            const progressPercent = Math.round((currentCount / edition.totalPage) * 100);
            const editionNameKey = edition.id === 'hafs' ? 'mushaf_hafs' : edition.id === 'warsh' ? 'mushaf_warsh' : 'mushaf_tajweed';

            return (
              <div key={edition.id} className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-500/20 text-teal-400 rounded-xl flex items-center justify-center">
                      <HardDrive size={20} />
                    </div>
                    <div>
                      <h5 className="text-sm font-black text-white">{t(editionNameKey, edition.name)}</h5>
                      <p className="text-[10px] text-white/40 font-bold">
                        {t('offline_pages_downloaded', '{{count}} / {{total}} صفحة محملة', { count: currentCount, total: edition.totalPage })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {state.isDownloaded ? (
                      <button 
                        onClick={() => handleRemove(edition.id)}
                        className="p-2.5 bg-rose-500/10 text-rose-400 rounded-xl hover:bg-rose-500/20 transition-all shadow-sm"
                      >
                        <Trash2 size={16} />
                      </button>
                    ) : (
                      <button 
                        onClick={async () => {
                          await startDownloadEdition(edition.id);
                          await checkStorageStatus();
                        }}
                        disabled={isDownloading || !isOnline}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all",
                          isDownloading 
                            ? "bg-white/10 text-white/40 cursor-wait" 
                            : !isOnline 
                              ? "bg-white/5 text-white/20 cursor-not-allowed"
                              : "bg-teal-600 text-white hover:bg-teal-700 shadow-lg shadow-teal-600/20 active:scale-95"
                        )}
                      >
                        {isDownloading ? (
                          <RefreshCw size={14} className="animate-spin" />
                        ) : (
                          <Download size={14} />
                        )}
                        {isDownloading ? `${progressPercent}%` : t('download', 'تحميل')}
                      </button>
                    )}
                  </div>
                </div>

                {isDownloading && (
                  <div className="relative h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="absolute inset-y-0 left-0 bg-teal-500 transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Info Notice */}
      <div className="bg-teal-500/10 border border-teal-500/20 p-4 rounded-2xl flex gap-3">
        <Sparkles size={16} className="text-teal-400 shrink-0 mt-0.5 animate-pulse" />
        <div className="space-y-1">
          <p className="text-xs font-black text-teal-100">{t('offline_smart_browsing_title', 'تكنولوجيا التصفح الذكي مستمرة ⚡')}</p>
          <p className="text-[10px] text-teal-200/70 leading-relaxed font-bold">
            {t('offline_smart_browsing_desc', 'حتى وإن لم يكتمل تحميل صفحات المصاحف (حفص، ورش، ومصحف التجويد) كاملةً، يمكنك البدء بقراءتها فوراً! عند انقطاع الإنترنت، سيتكفل قارئ المصحف الذكي بعرض النص الرقمي التفاعلي المطابق وتنسيق الصفحة تلقائياً دون أي مقاطعة.')}
          </p>
        </div>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl flex gap-3">
        <Info size={16} className="text-blue-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-xs font-black text-blue-100">{t('offline_about_title', 'حول الوصول دون اتصال')}</p>
          <p className="text-[10px] text-blue-200/60 leading-relaxed font-bold">
            {t('offline_about_desc', 'يتم تخزين البيانات في ذاكرة التخزين المؤقت للمتصفح. عند استخدام "وضع التصفح الخاص" أو حذف بيانات المتصفح، قد يتم حذف هذه الملفات.')}
          </p>
        </div>
      </div>

      {/* Warning Notice */}
      {!isOnline && (
        <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex gap-3">
          <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
          <p className="text-[10px] text-amber-200/80 leading-relaxed font-bold">
            {t('offline_warning_disconnected', 'أنت حالياً غير متصل. لا يمكنك بدء تحميلات جديدة حتى تعود متصلاً بالإنترنت.')}
          </p>
        </div>
      )}
    </div>
  );
};
