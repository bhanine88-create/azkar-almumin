import { BackButton } from './ui/BackButton';
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useParams} from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, Play, Pause, Download, Volume2, ChevronRight, 
  RefreshCw, X, Check, Trash2, CloudDownload, Square, 
  CheckCircle, Trash, SlidersHorizontal, Settings2, Zap, FastForward, PlayCircle, Mic2, FileDown, Loader2
} from 'lucide-react';
import { RECITERS } from '../reciters';
import { STATIC_SURAHS } from '../utils/staticQuranData';
import { useAppContext } from '../AppContext';
import { useQuranSettings } from '../context/QuranSettingsContext';
import { cn } from '../lib/utils';
import { useTranslation } from '../i18n';
import { audioCacheService, formatBytes } from '../services/audioCacheService';
import { getSurahAudioUrl } from '../services/quranAudioUrlService';
import { useSmartNavigation } from "../lib/navigation";
import { useGlobalAudio } from '../context/GlobalAudioContext';
import { useDownloadManager } from '../context/DownloadContext';
import { preloadAudioLibraryRoutes } from '../lib/preloadLibrary';

interface Surah {
  number: number;
  name: string;
  englishName: string;
}

export const QuranAudioReciter: React.FC = () => {
  const { reciterId } = useParams<{ reciterId: string }>();
  const { navigate } = useSmartNavigation();
  const { settings } = useAppContext();
  const { 
    playbackRate, setPlaybackRate,
    autoNextSurah, setAutoNextSurah,
    autoPlay: contextAutoPlay, setAutoPlay: setContextAutoPlay
  } = useQuranSettings();
  const { t } = useTranslation(settings.appLanguage);
  
  const { currentTrack, isPlaying, progress, duration, currentTime, playTrack, pauseTrack, resumeTrack } = useGlobalAudio();
  const reciter = RECITERS.find(r => r.id === Number(reciterId));
  const playingSurah = (currentTrack?.type === 'quran' && currentTrack?.reciterId === reciter?.id) ? currentTrack.surahNumber : null;
  
  const [surahs, setSurahs] = useState<Surah[]>(() => {
    if (reciter && (reciter as any).surahUrls) {
      const available = Object.keys((reciter as any).surahUrls).map(Number);
      return STATIC_SURAHS.filter(s => available.includes(s.number));
    }
    return STATIC_SURAHS;
  });
  const [loading, setLoading] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  useEffect(() => {
    preloadAudioLibraryRoutes();
  }, []);

  const { downloads, startDownloadSurah, cancelDownload } = useDownloadManager();

  const downloading = React.useMemo(() => {
    const map: Record<number, boolean> = {};
    downloads.forEach(d => {
      if (d.type === 'quran' && d.reciterId === reciter?.id && d.surahNumber) {
        map[d.surahNumber] = d.status === 'downloading' || d.status === 'pending';
      }
    });
    return map;
  }, [downloads, reciter?.id]);

  const downloadProgress = React.useMemo(() => {
    const map: Record<number, number> = {};
    downloads.forEach(d => {
      if (d.type === 'quran' && d.reciterId === reciter?.id && d.surahNumber) {
        map[d.surahNumber] = d.progress;
      }
    });
    return map;
  }, [downloads, reciter?.id]);

  const downloadDetails = React.useMemo(() => {
    const map: Record<number, { loadedBytes?: number; totalBytes?: number; speed?: string }> = {};
    downloads.forEach(d => {
      if (d.type === 'quran' && d.reciterId === reciter?.id && d.surahNumber) {
        map[d.surahNumber] = {
          loadedBytes: d.loadedBytes,
          totalBytes: d.totalBytes,
          speed: d.speed
        };
      }
    });
    return map;
  }, [downloads, reciter?.id]);

  const reciterActiveDownloads = React.useMemo(() => {
    return downloads.filter(d => d.type === 'quran' && d.reciterId === reciter?.id && (d.status === 'downloading' || d.status === 'pending'));
  }, [downloads, reciter?.id]);

  const isDownloadingAll = reciterActiveDownloads.length > 0;

  const downloadAllProgress = React.useMemo(() => {
    if (!isDownloadingAll) return null;
    const total = surahs.length;
    const current = total - reciterActiveDownloads.length;
    return { current, total };
  }, [isDownloadingAll, surahs.length, reciterActiveDownloads.length]);

  const [cachedSurahs, setCachedSurahs] = useState<Set<number>>(new Set());
  const [showSettings, setShowSettings] = useState(false);
  const [savingDeviceSurah, setSavingDeviceSurah] = useState<Record<number, 'loading' | 'success' | null>>({});

  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];

  const handleSaveToDevice = async (surahNumber: number, surahName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavingDeviceSurah(prev => ({ ...prev, [surahNumber]: 'loading' }));
    const url = getAudioUrl(surahNumber);
    
    try {
      let blob: Blob | null = null;
      
      // 1. Try Cache match (so it is instantaneous!)
      try {
        const cache = await caches.open('quran-offline-audio-v1');
        const metadata = audioCacheService.getMetadataList();
        const meta = metadata.find(m => m.surahNumber === surahNumber && m.reciterId === reciter?.id);
        const activeUrl = meta ? meta.url : url;
        const response = await cache.match(activeUrl);
        if (response) {
          blob = await response.blob();
        }
      } catch (cacheErr) {
        console.warn('Cache lookup failed for direct save:', cacheErr);
      }

      // 2. Fetch if not cached
      if (!blob) {
        try {
          const response = await fetch(url, { mode: 'cors' });
          if (!response.ok) throw new Error(`Fetch fail status ${response.status}`);
          blob = await response.blob();
        } catch (e) {
          console.warn("Direct fetch for download failed due to CORS or network, routing through proxy-download", e);
          const proxyUrl = `/api/proxy-download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(`سورة ${surahName} - الشيخ ${reciter?.name}.mp3`)}`;
          const a = document.createElement('a');
          a.href = proxyUrl;
          a.download = `سورة ${surahName} - الشيخ ${reciter?.name}.mp3`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setSavingDeviceSurah(prev => ({ ...prev, [surahNumber]: 'success' }));
          setTimeout(() => {
            setSavingDeviceSurah(prev => ({ ...prev, [surahNumber]: null }));
          }, 2000);
          return; // Exit here, handled by proxy 
        }
      }

      // 3. Download
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `سورة ${surahName} - الشيخ ${reciter?.name}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);

      setSavingDeviceSurah(prev => ({ ...prev, [surahNumber]: 'success' }));
      setTimeout(() => {
        setSavingDeviceSurah(prev => ({ ...prev, [surahNumber]: null }));
      }, 2000);
    } catch (err) {
      console.error('Failed to save surah as MP3:', err);
      // Failsafe fallback
      try {
        const proxyUrl = `/api/proxy-download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(`سورة ${surahName} - الشيخ ${reciter?.name}.mp3`)}`;
        window.open(proxyUrl, '_blank', 'noopener,noreferrer');
      } catch (e) {}
      setSavingDeviceSurah(prev => ({ ...prev, [surahNumber]: null }));
    }
  };

  useEffect(() => {
    // Load surahs list instantly from static local database
    if (reciter && (reciter as any).surahUrls) {
      const available = Object.keys((reciter as any).surahUrls).map(Number);
      setSurahs(STATIC_SURAHS.filter(s => available.includes(s.number)));
    } else {
      setSurahs(STATIC_SURAHS);
    }
    setLoading(false);
  }, [reciter?.id]);

  // Synchronize local cached surahs state with both existing files and completed downloads
  const completedQuranSurahsKey = React.useMemo(() => {
    return downloads
      .filter(d => d.type === 'quran' && d.reciterId === reciter?.id && d.status === 'completed' && d.surahNumber)
      .map(d => d.surahNumber)
      .sort((a, b) => (a || 0) - (b || 0))
      .join(',');
  }, [downloads, reciter?.id]);

  useEffect(() => {
    if (!reciter) return;

    const metadata = audioCacheService.getMetadataList();
    const reciterCached = metadata
      .filter(m => m.reciterId === reciter.id)
      .map(m => m.surahNumber);
    const set = new Set<number>(reciterCached);

    downloads.forEach(d => {
      if (d.type === 'quran' && d.reciterId === reciter.id && d.status === 'completed' && d.surahNumber) {
        set.add(d.surahNumber);
      }
    });

    setCachedSurahs(prev => {
      if (prev.size !== set.size || Array.from(set).some(num => !prev.has(num))) {
        return set;
      }
      return prev;
    });
  }, [completedQuranSurahsKey, reciter?.id]);

  if (!reciter) {
    return <div className="p-8 text-center">القارئ غير موجود</div>;
  }

  const getAudioUrl = (surahNumber: number) => {
    return getSurahAudioUrl(reciter, surahNumber);
  };

  const handlePlayPause = async (surahNumber: number) => {
    if (playingSurah === surahNumber) {
      if (isPlaying) {
        pauseTrack();
      } else {
        resumeTrack();
      }
      return;
    }

    setAudioError(null);
    if (!reciter) return;

    const surahName = surahs.find(s => s.number === surahNumber)?.name || `${surahNumber}`;
    const url = getAudioUrl(surahNumber);
    
    // Try getting cached version first (by reciterId & surahNumber, or by url)
    const cachedUrl = (await audioCacheService.getCachedAudioUrlBySurah(reciter.id, surahNumber))
      || (await audioCacheService.getCachedAudioUrl(url));
    const finalUrl = cachedUrl || url;

    try {
      await playTrack({
        id: `quran-${reciter.id}-${surahNumber}`,
        title: `سورة ${surahName}`,
        subtitle: reciter.name,
        audioUrl: finalUrl,
        originalUrl: url,
        type: 'quran',
        reciterId: reciter.id,
        surahNumber: surahNumber
      });
    } catch (e: any) {
      console.warn("Audio playback failed", e);
      setAudioError("عذراً، فشل تشغيل ملف الصوت.");
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "00:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleDownloadAll = () => {
    if (!reciter) return;

    if (isDownloadingAll) {
      // Cancel all active and pending downloads for this reciter
      downloads.forEach(d => {
        if (d.type === 'quran' && d.reciterId === reciter.id && (d.status === 'downloading' || d.status === 'pending')) {
          cancelDownload(d.id);
        }
      });
      return;
    }

    const toDownload = surahs.filter(s => !cachedSurahs.has(s.number));
    if (toDownload.length === 0) return;

    toDownload.forEach(surah => {
      const url = getAudioUrl(surah.number);
      startDownloadSurah(surah.number, surah.name, reciter.id, reciter.name, url);
    });
  };

  const handleDownloadToggle = async (surahNumber: number, surahName: string) => {
    if (!reciter) return;

    const downloadId = `quran-${reciter.id}-${surahNumber}`;
    const url = getAudioUrl(surahNumber);

    if (downloading[surahNumber]) {
      // Cancel download in global manager
      cancelDownload(downloadId);
      return;
    }

    if (cachedSurahs.has(surahNumber)) {
      // Remove from cache
      const meta = audioCacheService.getMetadataList().find(m => m.surahNumber === surahNumber && m.reciterId === reciter?.id);
      const urlToRemove = meta ? meta.url : url;
      const success = await audioCacheService.removeCachedAudio(urlToRemove);
      if (success) {
        setCachedSurahs(prev => {
          const next = new Set(prev);
          next.delete(surahNumber);
          return next;
        });
      }
      return;
    }

    // Trigger download in global manager
    startDownloadSurah(surahNumber, surahName, reciter.id, reciter.name, url);
  };

  return (
    <div className="flex flex-col gap-4 py-6 px-4 pb-24 w-full h-full flex-1 overflow-y-auto custom-scrollbar relative bg-slate-50 dark:bg-slate-950">
      <div className="flex items-center justify-between mb-2 sticky top-0 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-md pb-4 z-10 pt-2 -mx-4 px-4 shadow-sm border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <BackButton forceFallback={true} fallbackPath="/quran-audio" />
          <div className="flex items-center gap-3">
             <div className="relative w-14 h-14 rounded-[1.2rem] p-[2px] transform transition-all duration-75 active:scale-[0.85] active:opacity-70 bg-gradient-to-br from-[#218510] via-[#218510]/90 to-[#186a0d] shadow-[0_0_40px_rgba(33,133,16,0.4)] shrink-0">
               <div className="w-full h-full rounded-[1.1rem] flex items-center justify-center backdrop-blur border border-white/20 relative overflow-hidden bg-[#218510]/25">
                 <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent"></div>
                 <Mic2 className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] relative z-10" size={26} strokeWidth={2.5} />
               </div>
             </div>
             <div>
               <h1 className="text-xl font-black text-slate-800 dark:text-white tracking-tight leading-tight">
                 {reciter.name}
               </h1>
               <p className="text-[10px] font-bold text-[#218510] dark:text-[#218510]/90 mt-0.5 uppercase tracking-wider">رواية {reciter.style}</p>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowSettings(true)}
            className="w-10 h-10 rounded-xl bg-[#218510]/10 dark:bg-[#218510]/20 border border-[#218510]/20 flex items-center justify-center text-[#218510] dark:text-emerald-400 hover:bg-[#218510]/20 transform transition-all duration-75 active:scale-[0.85] active:opacity-70 shadow-sm"
            title="الإعدادات والمؤقت"
          >
            <SlidersHorizontal size={20} />
          </button>
          
          <button
            onClick={handleDownloadAll}
            className={cn(
"flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black transition-all border overflow-hidden relative shadow-sm transform transition-all duration-75 active:scale-[0.95] active:opacity-80",
              isDownloadingAll 
                ? "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-900/30 dark:border-rose-800 dark:text-rose-400"
                : cachedSurahs.size === surahs.length
                  ? "bg-gradient-to-br from-[#218510] via-[#218510] to-[#186a0d] text-white border-transparent shadow-[0_4px_12px_rgba(33,133,16,0.35)]"
                  : "bg-gradient-to-br from-[#218510]/10 to-[#1c6f0d]/5 text-[#218510] dark:text-emerald-400 border border-[#218510]/20 hover:from-[#218510] hover:to-[#186a0d] hover:text-white hover:border-transparent hover:scale-105"
            )}
          >
            {isDownloadingAll ? (
              <>
                <div 
                  className="absolute inset-0 bg-rose-100 dark:bg-rose-800/50 opacity-50"
                  style={{ width: `${(downloadAllProgress?.current || 0) / (downloadAllProgress?.total || 1) * 100}%` }}
                />
                <span className="relative z-10">إيقاف</span>
                <span className="relative z-10 flex items-center gap-1 font-mono">
                  <span>{downloadAllProgress?.current}</span>
                  <span className="opacity-50">/</span>
                  <span>{downloadAllProgress?.total}</span>
                </span>
              </>
            ) : cachedSurahs.size === surahs.length ? (
              <>
                <span>تم التحميل</span>
                <CheckCircle size={14} />
              </>
            ) : (
              <>
                <span>تحميل الكل</span>
                <CloudDownload size={14} />
              </>
            )}
          </button>
        </div>
      </div>

      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
        {showSettings && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white dark:bg-slate-900 rounded-t-[40px] z-[101] shadow-2xl p-8 border-t border-slate-100 dark:border-slate-800"
            >
              <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mb-8" />
              
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">إعدادات الصوت</h2>
                  <p className="text-sm font-medium text-slate-500">للقارئ: {reciter.name}</p>
                </div>
                <button 
                  onClick={() => setShowSettings(false)}
                  className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Zap size={18} />
                    <span className="text-xs font-black uppercase tracking-widest">سرعة التشغيل</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {speeds.map(s => (
                      <button
                        key={`speed-reciter-${s}`}
                        onClick={() => setPlaybackRate(s)}
                        className={cn(
"px-4 py-2 rounded-xl text-sm font-black transition-all border transform transition-all duration-75 active:scale-[0.95] active:opacity-80",
                          playbackRate === s 
                            ? "bg-[#218510] border-[#218510] text-white shadow-lg shadow-[#218510]/30"
                            : "bg-slate-100 dark:bg-slate-800 border-transparent text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600"
                        )}
                      >
                        {s}x
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                        <FastForward size={20} />
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900 dark:text-white">تشغيل تلقائي للسور</h4>
                        <p className="text-[10px] font-bold text-slate-500">الانتقال التلقائي للسورة التالية</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setAutoNextSurah(!autoNextSurah)}
                      className={cn(
                        "w-14 h-8 rounded-full relative transition-colors duration-300",
                        autoNextSurah ? "bg-[#218510]" : "bg-slate-300 dark:bg-slate-700"
                      )}
                    >
                      <motion.div 
                        animate={{ x: autoNextSurah ? 24 : 4 }}
                        className="w-6 h-6 bg-white rounded-full absolute top-1 shadow-sm"
                      />
                    </button>
                  </div>

                  <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                        <PlayCircle size={20} />
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900 dark:text-white">تشغيل فوري</h4>
                        <p className="text-[10px] font-bold text-slate-500">بدأ الصوت تلقائياً</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setContextAutoPlay(!contextAutoPlay)}
                      className={cn(
                        "w-14 h-8 rounded-full relative transition-colors duration-300",
                        contextAutoPlay ? "bg-[#218510]" : "bg-slate-300 dark:bg-slate-700"
                      )}
                    >
                      <motion.div 
                        animate={{ x: contextAutoPlay ? 24 : 4 }}
                        className="w-6 h-6 bg-white rounded-full absolute top-1 shadow-sm"
                      />
                    </button>
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    onClick={() => setShowSettings(false)}
                    className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-950 py-4 rounded-2xl font-black shadow-xl duration-75 active:scale-[0.85] active:opacity-70 transition-transform"
                  >
                    حفظ التجربة
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
        </AnimatePresence>,
        document.body
      )}

      {audioError && (
        <div className="bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 p-4 rounded-2xl flex items-center justify-between shadow-sm border border-rose-200 dark:border-rose-800">
          <span className="text-sm font-bold">{audioError}</span>
          <button onClick={() => setAudioError(null)} className="p-1 hover:bg-rose-200 dark:hover:bg-rose-800 rounded-full">
            <X size={16} />
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-[#218510]/20 border-t-[#218510] animate-spin" />
            <Mic2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#218510]" size={24} />
          </div>
          <p className="text-sm font-black text-slate-400 animate-pulse">جاري تحميل قائمة السور...</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {surahs.map((surah) => (
            <div
              key={surah.number}
              className={cn(
                "p-4 rounded-2xl transition-all border flex items-center justify-between group",
                playingSurah === surah.number 
                  ? "bg-[#218510] text-white border-[#186a0d] shadow-xl shadow-[#218510]/25 ring-2 ring-[#218510]/50" 
                  : "bg-white dark:bg-slate-800/50 border-slate-100 dark:border-slate-700 hover:border-[#218510]/30 hover:scale-[1.01] active:scale-[0.99] hover:bg-slate-50 dark:hover:bg-slate-800"
              )}
            >
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handlePlayPause(surah.number)}
                  className={cn(
"w-12 h-12 rounded-xl flex items-center justify-center transform transition-all duration-75 active:scale-[0.85] active:opacity-70 shadow-sm",
                    playingSurah === surah.number
                      ? "bg-white text-[#218510] shadow-lg scale-105"
                      : "bg-gradient-to-br from-[#218510]/15 to-[#1c6f0d]/10 dark:from-[#218510]/25 dark:to-[#1c6f0d]/15 border border-[#218510]/20 text-[#218510] dark:text-emerald-400 group-hover:from-[#218510] group-hover:to-[#186a0d] group-hover:border-transparent group-hover:text-white group-hover:shadow-md group-hover:shadow-[#218510]/25"
                  )}
                >
                  {playingSurah === surah.number && isPlaying ? (
                    <Pause size={20} className="fill-current" />
                  ) : (
                    <Play size={20} className="fill-current ml-1" />
                  )}
                </button>
                
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <span className={cn("text-[10px] font-black opacity-40", playingSurah === surah.number ? "text-white" : "text-slate-500")}>
                      {String(surah.number).padStart(3, '0')}
                    </span>
                    <h3 className={cn("font-black text-lg", playingSurah === surah.number ? "text-white" : "text-slate-800 dark:text-slate-100")}>
                      {surah.name}
                    </h3>
                  </div>
                  {playingSurah === surah.number && (
                    <div className="flex items-center gap-2 mt-0.5 opacity-90 text-[10px] font-bold">
                      <div className="flex gap-0.5 items-end h-3">
                        <div className="w-0.5 bg-white animate-[bounce_0.6s_ease-in-out_infinite]" style={{ height: '60%' }} />
                        <div className="w-0.5 bg-white animate-[bounce_0.8s_ease-in-out_infinite]" style={{ height: '100%' }} />
                        <div className="w-0.5 bg-white animate-[bounce_0.6s_ease-in-out_infinite_0.1s]" style={{ height: '40%' }} />
                      </div>
                      <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
                      {playbackRate !== 1 && <span className="bg-white/20 px-1.5 py-0.5 rounded-md ml-1">{playbackRate}x</span>}
                    </div>
                  )}

                  {/* Accurate Inline Progress Bar for Background Download */}
                  {downloading[surah.number] && (
                    <div className="mt-2 w-full max-w-[260px]">
                      <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                        <span className={cn("flex items-center gap-1", playingSurah === surah.number ? "text-emerald-100" : "text-[#218510] dark:text-emerald-400")}>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
                          جاري التحميل في الخلفية
                        </span>
                        <span className={cn("font-mono font-black", playingSurah === surah.number ? "text-white" : "text-emerald-700 dark:text-emerald-300")}>
                          {downloadProgress[surah.number] || 0}%
                        </span>
                      </div>
                      <div className={cn("w-full h-2 rounded-full overflow-hidden relative shadow-inner", playingSurah === surah.number ? "bg-black/20" : "bg-slate-100 dark:bg-slate-700/60")}>
                        <div 
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-150"
                          style={{ width: `${downloadProgress[surah.number] || 0}%` }}
                        />
                      </div>
                      {downloadDetails[surah.number]?.loadedBytes ? (
                        <div className={cn("flex items-center justify-between text-[9px] mt-1 font-mono", playingSurah === surah.number ? "text-emerald-100/70" : "text-slate-400 dark:text-slate-500")}>
                          <span>{formatBytes(downloadDetails[surah.number].loadedBytes || 0)} / {formatBytes(downloadDetails[surah.number].totalBytes || 0)}</span>
                          {downloadDetails[surah.number].speed && <span className="text-emerald-600 dark:text-emerald-400 font-bold">⚡ {downloadDetails[surah.number].speed}</span>}
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={(e) => handleSaveToDevice(surah.number, surah.name, e)}
                  disabled={savingDeviceSurah[surah.number] === 'loading'}
                  className={cn(
                    "w-11 h-11 rounded-xl relative flex items-center justify-center transition-all border shadow-sm",
                    savingDeviceSurah[surah.number] === 'success'
                      ? "bg-gradient-to-br from-[#218510] to-[#186a0d] border-transparent text-white shadow-md shadow-[#218510]/25"
                      : savingDeviceSurah[surah.number] === 'loading'
                        ? "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-[#218510]"
                        : playingSurah === surah.number
                          ? "bg-white/20 border-white/30 text-white hover:bg-white hover:text-[#218510] hover:border-white"
                          : "bg-gradient-to-br from-[#218510]/10 to-[#1c6f0d]/5 dark:from-[#218510]/20 dark:to-[#1c6f0d]/10 border border-[#218510]/20 text-[#218510] dark:text-emerald-400 hover:from-[#218510] hover:to-[#186a0d] hover:border-transparent hover:text-white hover:scale-105"
                  )}
                  title="حفظ كملف MP3 على الهاتف"
                >
                  {savingDeviceSurah[surah.number] === 'loading' ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : savingDeviceSurah[surah.number] === 'success' ? (
                    <Check size={18} />
                  ) : (
                    <FileDown size={18} />
                  )}
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownloadToggle(surah.number, surah.name);
                  }}
                  className={cn(
                    "w-11 h-11 rounded-xl relative overflow-hidden flex items-center justify-center transition-all border shadow-sm",
                    downloading[surah.number]
                      ? "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-[#218510] hover:text-rose-500 hover:bg-rose-50"
                      : cachedSurahs.has(surah.number)
                        ? "bg-[#218510]/10 dark:bg-[#186a0d]/15 border-[#218510]/20 dark:border-[#218510]/35 text-[#218510] dark:text-emerald-400 hover:bg-rose-600 hover:text-white hover:border-transparent"
                        : playingSurah === surah.number
                          ? "bg-white/10 border-white/25 text-white/80 hover:bg-white hover:text-[#218510] hover:border-white"
                          : "bg-transparent border-slate-200 dark:border-slate-700 text-slate-400 hover:bg-gradient-to-br hover:from-[#218510]/10 hover:to-[#1c6f0d]/5 dark:hover:from-[#218510]/20 dark:hover:to-[#1c6f0d]/10 hover:text-[#218510] dark:hover:text-[#3b82f6] hover:border-[#218510]/30"
                  )}
                  title={cachedSurahs.has(surah.number) ? "مسح من الحفظ المؤقت" : "حفظ للاستماع دون إنترنت"}
                >
                  {downloading[surah.number] ? (
                    <div className="relative flex flex-col items-center justify-center w-full h-full group/btn font-sans">
                      <svg viewBox="0 0 36 36" className="w-8 h-8 absolute">
                        <circle cx="18" cy="18" r="16" fill="none" className="stroke-slate-200 dark:stroke-slate-700" strokeWidth="2.5" />
                        <circle cx="18" cy="18" r="16" fill="none" className="stroke-[#218510]" strokeWidth="2.5" strokeDasharray={`${downloadProgress[surah.number] || 0}, 100`} />
                      </svg>
                      <span className="font-mono text-[9px] font-black text-[#218510] dark:text-emerald-400 group-hover/btn:opacity-0 transition-opacity">
                        {downloadProgress[surah.number] || 0}%
                      </span>
                      <X size={14} className="absolute opacity-0 transition-opacity group-hover/btn:opacity-100 text-rose-500" />
                    </div>
                  ) : cachedSurahs.has(surah.number) ? (
                    <span className="relative group/btn flex items-center justify-center w-full h-full">
                      <CheckCircle size={22} className="absolute transition-opacity group-hover/btn:opacity-0" />
                      <Trash size={18} className="absolute opacity-0 transition-opacity group-hover/btn:opacity-100 text-rose-500" />
                    </span>
                  ) : (
                    <CloudDownload size={22} />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}


    </div>
  );
};

