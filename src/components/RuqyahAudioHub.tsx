import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useSmartNavigation } from '../lib/navigation';
import {  PlayCircle, Clock, PauseCircle, Loader2, CloudDownload,  Star, 
  Settings, SlidersHorizontal, X, FastForward, Timer, SkipForward, Info, Play, Search, ShieldCheck , Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAppContext } from '../AppContext';
import { BackButton } from './ui/BackButton';
import { EmptyStatePlaceholder } from './EmptyStatePlaceholder';
import { lectureCacheService } from '../services/lectureCacheService';
import { useGlobalAudio } from '../context/GlobalAudioContext';
import { useDownloadManager } from '../context/DownloadContext';
import { smartArabicMatch } from '../lib/arabicSearch';
import { preloadAudioLibraryRoutes } from '../lib/preloadLibrary';

interface RuqyahTrack {
  id: string;
  title: string;
  reciterName: string;
  duration: string;
  audioUrl: string;
  description: string;
}

const RUQYAH_TRACKS: RuqyahTrack[] = [
  {
    id: "ruqyah-ahmad-alajmy",
    title: "الرقية الشرعية بصوت القارئ أحمد العجمي",
    reciterName: "القارئ أحمد العجمي",
    duration: "25:21",
    audioUrl: "https://server10.mp3quran.net/ajm/Rokaia.mp3",
    description: "الرقية الشرعية للحسد والسحر والعين، تلاوة خاشعة بصوت القارئ أحمد العجمي."
  },
  {
    id: "ruqyah-alaa-aqel-new",
    title: "سورة البقرة كاملة رقية للبيت وعلاج للسحر",
    reciterName: "القارئ علاء عقل",
    duration: "139:07",
    audioUrl: "https://ia800506.us.archive.org/13/items/surah-al-baqarah-mp-3-160-k/%D8%B3%D9%88%D8%B1%D8%A9%20%D8%A7%D9%84%D8%A8%D9%82%D8%B1%D8%A9%20%D9%83%D8%A7%D9%85%D9%84%D8%A9_%20%D8%B1%D9%82%D9%8A%D8%A9%20%D9%84%D9%84%D8%A8%D9%8A%D8%AA_%20%D9%88%D8%B9%D9%84%D8%A7%D8%AC%20%D9%84%D9%84%D8%B3%D8%AD%D8%B1%20_%20%D8%A7%D9%84%D9%82%D8%A7%D8%B1%D8%A6%20%D8%B9%D9%84%D8%A7%D8%A1%20%D8%B9%D9%82%D9%84%20-%20Surah%20Al%20Baqarah(MP3_160K).mp3",
    description: "قراءة هادئة وجميلة لآيات السكينة والرقية الشرعية الشاملة لتسهيل الشفاء بإذن الله."
  },
  {
    id: "ruqyah-mishary-alafasy",
    title: "الرقية الشرعية المطولة للتحصين والشفاء",
    reciterName: "الشيخ مشاري بن راشد العفاسي",
    duration: "35:00",
    audioUrl: "https://ia800909.us.archive.org/15/items/rokia-alafacy/rokia07.mp3",
    description: "قراءة هادئة وجميلة لآيات السكينة والرقية الشرعية الشاملة لتسهيل الشفاء بإذن الله."
  },
  {
    id: "ruqyah-nabil-alawadi",
    title: "الرقية الشرعية بصوت الشيخ نبيل العوضي",
    reciterName: "الشيخ نبيل العوضي",
    duration: "42:15",
    audioUrl: "https://ia801804.us.archive.org/6/items/al-roqia/al-roqia.mp3",
    description: "قراءة هادئة وجميلة لآيات السكينة والرقية الشرعية الشاملة لتسهيل الشفاء بإذن الله.",
  },
  {
    id: "ruqyah-ass-985",
    title: "الرقية الشرعية الشاملة لفك السحر والمس والعين وعلاج الضيق",
    reciterName: "الرقية الشاملة - تلاوة خاشعة",
    duration: "40:00",
    audioUrl: "https://ia801802.us.archive.org/26/items/ass_985/%D8%A7%D9%84%D8%B1%D9%82%D9%8A%D8%A9%20%D8%A7%D9%84%D8%B4%D8%B1%D8%B9%D9%8A%D8%A9%20%D9%83%D8%A7%D9%85%D9%84%D8%A9%20%D8%A8%D8%B5%D9%88%D8%AA%20%D8%B9%D8%B0%D8%A8%20%D8%AC%D9%85%D9%8A%D9%84.mp3",
    description: "تلاوة قوية ومؤثرة لآيات إبطال السحر والحسد، مفيدة جداً لبث الطمأنينة والسكينة في المنزل."
  },
  {
    id: "ruqyah-albara2",
    title: "الرقية الشرعية الشافية الكافية",
    reciterName: "رقية التحصين",
    duration: "45:00",
    audioUrl: "https://ia801804.us.archive.org/6/items/al-roqia/al-roqia.mp3",
    description: "تلاوة خاشعة مميزة لآيات الشفاء والرقية والتحصين من عين وحسد وسحر."
  },
  {
    id: "ruqyah-saud-alfayez",
    title: "الرقية الشرعية مع الدعاء بصوت سعود الفايز",
    reciterName: "القارئ سعود الفايز",
    duration: "39:59",
    audioUrl: "https://ia601805.us.archive.org/29/items/alfirdwsiy2018_gwwwwwwwwwwwwwwwwwwwwww111wwww1/%D8%A7%D9%84%D8%B1%D9%82%D9%8A%D8%A9%20%D8%A7%D9%84%D8%B4%D8%B1%D8%B9%D9%8A%D8%A9%20%D9%85%D8%B9%20%D8%A7%D9%84%D8%AF%D8%B9%D8%A7%D8%A1%20%D8%A8%D8%B5%D9%88%D8%AA%20%D8%B3%D8%B9%D9%88%D8%AF%20%D8%A7%D9%84%D9%81%D8%A7%D9%8A%D8%B2.mp3",
    description: "تلاوة قوية ومؤثرة لآيات إبطال السحر والحسد، مفيدة جداً لبث الطمأنينة والسكينة في المنزل."
  },
  {
    id: "ruqyah-suleiman-alkhamsan",
    title: "الرقية الشرعية بصوت الشيخ سليمان الخمسان",
    reciterName: "الشيخ سليمان الخمسان",
    duration: "21:50",
    audioUrl: "https://archive.org/download/way2sona_20160320_1433/Riqya-Khamsan.mp3",
    description: "الرقية الشرعية الكاملة للتحصين والاستشفاء بتلاوة خاشعة وهادئة تريح النفوس بصوت الشيخ سليمان الخمسان."
  },
  {
    id: "ruqyah-ayman-alzahrani",
    title: "الرقية الشرعية بصوت الشيخ أيمن الزهراني",
    reciterName: "الشيخ أيمن الزهراني",
    duration: "20:47",
    audioUrl: "https://archive.org/download/way2sona_20160320_1433/Roqia-Zahrany.mp3",
    description: "تلاوة هادئة ومؤثرة للرقية الشرعية للعين والحسد والسحر بصوت الشيخ أيمن الزهراني."
  }
];

export function RuqyahAudioHub() {
  const { navigate, goBack } = useSmartNavigation();

  useEffect(() => {
    preloadAudioLibraryRoutes();
  }, []);
  const { settings, progress, toggleLectureFavorite, updateSettings } = useAppContext();
  const isDarkTheme = settings.theme === 'dark';

  const { currentTrack, isPlaying, playTrack, pauseTrack, resumeTrack } = useGlobalAudio();
  const playingTrackId = currentTrack?.type === 'lecture' ? currentTrack.id : null;

  const [isLoading, setIsLoading] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [cacheSize, setCacheSize] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [cachedTracks, setCachedTracks] = useState<Set<string>>(new Set());

  const { downloads, startDownloadLecture, cancelDownload } = useDownloadManager();

  const downloading = React.useMemo(() => {
    const map: Record<string, boolean> = {};
    downloads.forEach(d => {
      if (d.type === 'lecture') {
        map[d.lectureId || d.id] = d.status === 'downloading' || d.status === 'pending';
      }
    });
    return map;
  }, [downloads]);

  const [savingDeviceTrack, setSavingDeviceTrack] = useState<Record<string, 'loading' | 'success' | null>>({});

  // Filters using smart Arabic matching
  const filteredTracks = RUQYAH_TRACKS.filter(track => {
    const combined = `${track.reciterName} ${track.title} ${track.description}`;
    const matchesSearch = smartArabicMatch(combined, searchQuery);
    
    const isFavorite = (progress.favoriteLectures || []).includes(track.id);
    return matchesSearch && (!showFavoritesOnly || isFavorite);
  });

  // Calculate Cache Size
  useEffect(() => {
    const loadCacheSize = async () => {
      const size = await lectureCacheService.getTotalCacheSize();
      setCacheSize(size);
    };
    loadCacheSize();
  }, [cachedTracks]);

  // Sync caches
  useEffect(() => {
    const checkCacheStatus = () => {
      const cached = new Set<string>();
      
      const metadataList = lectureCacheService.getMetadataList();
      metadataList.forEach(meta => {
        if (meta.lectureId) {
          cached.add(meta.lectureId);
        }
      });

      downloads.forEach(d => {
        if (d.type === 'lecture' && d.status === 'completed' && d.lectureId) {
          cached.add(d.lectureId);
        }
      });
      setCachedTracks(cached);
    };
    checkCacheStatus();
    lectureCacheService.getTotalCacheSize().then(size => setCacheSize(size));
  }, [downloads]);

  const handleDownloadToggle = async (track: RuqyahTrack) => {
    const downloadId = `lecture-${track.id}`;

    if (downloading[track.id]) {
      cancelDownload(downloadId);
      return;
    }

    if (cachedTracks.has(track.id)) {
      await lectureCacheService.removeCachedAudio(track.audioUrl);
      setCachedTracks(prev => {
        const next = new Set(prev);
        next.delete(track.id);
        return next;
      });
      return;
    }

    startDownloadLecture(track.id, track.title, track.reciterName, track.audioUrl, 'lecture');
  };

  const handlePlay = async (track: RuqyahTrack) => {
    if (playingTrackId === track.id) {
      if (isPlaying) {
        pauseTrack();
      } else {
        resumeTrack();
      }
      return;
    }

    setIsLoading(true);
    let srcUrl = track.audioUrl;

    if (cachedTracks.has(track.id)) {
      const cachedUrl = await lectureCacheService.getCachedAudioUrl(track.audioUrl);
      if (cachedUrl) {
        srcUrl = cachedUrl;
      }
    }

    try {
      await playTrack({
        id: track.id,
        title: track.title,
        subtitle: track.reciterName,
        audioUrl: srcUrl,
        originalUrl: track.audioUrl,
        type: 'lecture'
      });
    } catch (err) {
      console.error("Audio Setup Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToDevice = async (track: RuqyahTrack) => {
    setSavingDeviceTrack(prev => ({ ...prev, [track.id]: 'loading' }));
    
    try {
      let blob: Blob | null = null;
      try {
        const cache = await caches.open('lectures-offline-audio-v1');
        const response = await cache.match(track.audioUrl);
        if (response) {
          blob = await response.blob();
        }
      } catch (cacheErr) {
        console.warn('Cache lookup failed:', cacheErr);
      }

      if (!blob) {
        try {
          const response = await fetch(track.audioUrl, { mode: 'cors' });
          if (!response.ok) throw new Error();
          blob = await response.blob();
        } catch (e) {
          const proxyUrl = `/api/proxy-download?url=${encodeURIComponent(track.audioUrl)}&filename=${encodeURIComponent(`${track.reciterName} - الرقية الشرعية.mp3`)}`;
          const link = document.createElement('a');
          link.href = proxyUrl;
          link.download = `${track.reciterName} - الرقية الشرعية.mp3`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setSavingDeviceTrack(prev => ({ ...prev, [track.id]: 'success' }));
          setTimeout(() => setSavingDeviceTrack(prev => ({ ...prev, [track.id]: null })), 2000);
          return;
        }
      }

      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${track.reciterName} - الرقية الشرعية.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);

      setSavingDeviceTrack(prev => ({ ...prev, [track.id]: 'success' }));
      setTimeout(() => setSavingDeviceTrack(prev => ({ ...prev, [track.id]: null })), 2000);
    } catch (err) {
      console.error('Download device fail:', err);
      try {
        const proxyUrl = `/api/proxy-download?url=${encodeURIComponent(track.audioUrl)}&filename=${encodeURIComponent(`${track.reciterName} - الرقية الشرعية.mp3`)}`;
        window.open(proxyUrl, '_blank', 'noopener,noreferrer');
      } catch (e) {}
      setSavingDeviceTrack(prev => ({ ...prev, [track.id]: null }));
    }
  };

  const clearAllCache = async () => {
    const confirmed = window.confirm('هل أنت متأكد من حذف الملفات الصوتية للرقية الشرعية المحملة؟');
    if (confirmed) {
      await lectureCacheService.clearAllCache();
      setCachedTracks(new Set());
      setCacheSize(0);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 ميجابايت';
    const mb = bytes / (1024 * 1024);
    return mb.toFixed(1) + ' م.ب';
  };

  return (
    <div className="flex flex-col h-full flex-1 overflow-y-auto px-4 pb-24 w-full max-w-lg mx-auto bg-slate-100 dark:bg-slate-950">
      
      {/* Settings Bottom Sheet */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
        {isSettingsOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSettingsOpen(false)}
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white dark:bg-slate-900 rounded-t-[32px] p-8 z-[70] shadow-2xl border-t border-slate-200 dark:border-slate-800"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#10b981]/10 dark:bg-[#10b981]/20 flex items-center justify-center text-[#10b981]">
                    <Settings size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">إعدادات الصوت والتحميل</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">تخصيص تجربة الاستماع والذاكرة</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-1">
                {/* Playback speed options */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-black text-slate-700 dark:text-slate-200">
                    <FastForward size={18} className="text-[#10b981]" />
                    <span>سرعة التشغيل</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                      <button
                        key={speed}
                        onClick={() => updateSettings({ audioPlaybackSpeed: speed })}
                        className={cn(
                          "px-4 py-2 rounded-xl text-sm font-bold transition-all transform duration-75 active:scale-[0.95]",
                          settings.audioPlaybackSpeed === speed
                            ? "bg-[#10b981] text-white shadow-lg shadow-[#10b981]/30"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                        )}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* Auto Play */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#10b981]/10 dark:bg-[#10b981]/20 flex items-center justify-center text-[#10b981]">
                      <SkipForward size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white">التشغيل التلقائي</h4>
                      <p className="text-[10px] text-slate-500 font-bold">تشغيل الرقية التالية تلقائياً</p>
                    </div>
                  </div>
                  <button
                    onClick={() => updateSettings({ audioAutoAdvance: !settings.audioAutoAdvance })}
                    className={cn(
                      "w-12 h-6 rounded-full transition-colors relative",
                      settings.audioAutoAdvance ? "bg-[#10b981]" : "bg-slate-300 dark:bg-slate-700"
                    )}
                  >
                    <motion.div
                      animate={{ x: settings.audioAutoAdvance ? 24 : 4 }}
                      className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-sm"
                    />
                  </button>
                </div>

                {/* Local Storage details */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-black text-slate-700 dark:text-slate-200">
                    <CloudDownload size={18} className="text-[#10b981]" />
                    <span>إرسال وإدارة التخزين للتشغيل بدون انترنت</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">المساحة المستهلكة</p>
                        <p className="text-lg font-black text-slate-900 dark:text-white">{formatSize(cacheSize)}</p>
                      </div>
                      <button
                        onClick={clearAllCache}
                        disabled={cacheSize === 0}
                        className={cn(
                          "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 transform active:scale-[0.95]",
                          cacheSize > 0 
                            ? "bg-rose-50 text-rose-600 hover:bg-rose-100" 
                            : "bg-slate-100 text-slate-400 cursor-not-allowed"
                        )}
                      >
                        <Trash2 size={14} />
                        مسح الذاكرة مؤقتاً
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
        </AnimatePresence>,
        document.body
      )}

      {/* Header Sticky Bar */}
      <div className="flex items-center justify-between mb-4 sticky top-0 bg-slate-100/95 dark:bg-slate-950/95 backdrop-blur-xl py-4 z-40 -mx-4 px-4 border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm">
        <div className="flex items-center gap-4">
          <BackButton onClick={() => goBack('/audio-library')} />
          <div>
            <h1 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-l from-[#10b981] to-[#047857] mr-1">
              الرقية الشرعية
            </h1>
            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mr-1">
              تلاوة خاشعة للتحصين والعلاج والشفاء
            </p>
          </div>
        </div>

        <button 
          onClick={() => setIsSettingsOpen(true)}
          className={cn(
            "p-2.5 rounded-2xl transition-all duration-300 relative group overflow-hidden border",
            isDarkTheme ? "bg-slate-900 border-slate-800 text-slate-400" : "bg-white border-slate-200 text-slate-500 shadow-sm"
          )}
        >
          <SlidersHorizontal size={20} />
        </button>
      </div>

      {/* Main card representing Al Ruqya */}
      <div className="mb-6 rounded-3xl bg-gradient-to-tr from-[#047857] to-[#10b981] p-6 text-white relative overflow-hidden shadow-lg shadow-teal-500/10">
        <div className="absolute inset-0 opacity-15 mix-blend-overlay" style={{ backgroundImage: "url('/images/arabesque.png')" }} />
        <div className="absolute top-0 left-0 w-24 h-full bg-white/5 rotate-12 translate-x-3 pointer-events-none" />
        <div className="relative z-10 flex items-center justify-between">
          <div className="text-right flex-1">
            <span className="bg-white/20 text-white text-[9px] font-black px-2.5 py-1 rounded-full border border-white/10 uppercase tracking-wider mb-2 inline-flex items-center gap-1">
              <ShieldCheck size={11} className="text-amber-300" />
              تحصين ونور للقلوب
            </span>
            <h2 className="text-xl font-black mb-1.5 leading-tight">رقية التحصين والشفاء</h2>
            <p className="text-xs text-white/95 leading-relaxed font-bold">
              استمع لآيات التحصين من السحر والحسد والمس بأرق وأعذب الأصوات وأقواها تأثيراً لتهدئة القلوب وطرد الشياطين ونشر البركة في بيتك.
            </p>
          </div>
        </div>
      </div>

      {/* Search Filter Controls */}
      <div className="flex flex-col gap-4 mb-5">
        <div className="relative group">
          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#10b981] transition-colors">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="ابحث عن قارئ أو كلمة في الوصف..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "w-full h-12 pr-12 pl-4 rounded-2xl text-sm font-bold transition-all focus:ring-2 focus:ring-[#10b981]/20 outline-none border",
              isDarkTheme 
                ? "bg-slate-900 border-slate-800 text-white placeholder:text-slate-600" 
                : "bg-white border-slate-200 text-slate-900 shadow-sm placeholder:text-slate-400"
            )}
          />
        </div>

        {/* Favorite filter badge */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-slate-500">ماتم اختياره ({filteredTracks.length} رقى)</span>
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black transition-all",
              showFavoritesOnly
                ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                : "bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-450 hover:bg-slate-100"
            )}
          >
            <Star size={13} className={showFavoritesOnly ? "fill-current" : ""} />
            <span>عرض المفضلة فقط</span>
          </button>
        </div>
      </div>

      {/* Tracks List */}
      <div className="space-y-4">
        {filteredTracks.map((track, index) => {
          const isThisPlaying = playingTrackId === track.id;
          const isDownloaded = cachedTracks.has(track.id);
          const isFavorite = (progress.favoriteLectures || []).includes(track.id);

          return (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "rounded-2xl border px-4.5 py-4 transition-all relative overflow-hidden flex flex-col justify-between",
                isDarkTheme ? "bg-slate-900 border-slate-850" : "bg-white border-slate-200/80 shadow-sm",
                isThisPlaying ? "ring-2 ring-[#10b981] border-transparent" : ""
              )}
            >
              {/* Shimmer on active track */}
              {isThisPlaying && (
                <div className="absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-teal-400 via-[#10b981] to-emerald-400" />
              )}

              {/* Top Row: Info and Play/Pause */}
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div className="flex items-start gap-4">
                  {/* Play Button Icon */}
                  <button
                    onClick={() => handlePlay(track)}
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center transform active:scale-95 shrink-0 transition-all",
                      isThisPlaying
                        ? "bg-[#10b981] text-white shadow-lg shadow-[#10b981]/20"
                        : "bg-teal-50 dark:bg-teal-950/20 text-[#10b981] hover:bg-[#10b981]/15"
                    )}
                  >
                    {isThisPlaying && isLoading ? (
                      <Loader2 size={24} className="animate-spin" />
                    ) : isThisPlaying && isPlaying ? (
                      <PauseCircle size={24} className="fill-current" />
                    ) : (
                      <PlayCircle size={24} className="ml-0.5" />
                    )}
                  </button>

                  <div className="text-right">
                    <h3 className={cn(
                      "font-black text-base text-slate-900 dark:text-white leading-snug",
                      isThisPlaying && "text-[#10b981]"
                    )}>
                      {track.reciterName}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-0.5">
                      {track.title}
                    </p>
                  </div>
                </div>
              </div>

              {/* Middle Row: Description */}
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed mb-4 text-right pr-1 border-r-2 border-slate-200 dark:border-slate-800">
                {track.description}
              </p>

              {/* Bottom Row: Metadata and Action Button Panel */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500">
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    <span>{track.duration}</span>
                  </div>
                  {isDownloaded && (
                    <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded">
                      محملة وجاهزة офлайн
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Favorite star */}
                  <button
                    onClick={() => toggleLectureFavorite(track.id)}
                    className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center border transition-all active:scale-90",
                      isFavorite 
                        ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-500"
                        : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-amber-400"
                    )}
                  >
                    <Star size={16} className={isFavorite ? "fill-current" : ""} />
                  </button>

                  {/* Cache / Download to storage */}
                  <button
                    onClick={() => handleDownloadToggle(track)}
                    disabled={downloading[track.id]}
                    className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center border transition-all active:scale-95",
                      isDownloaded
                        ? "bg-emerald-50 dark:bg-emerald-990/20 border-emerald-200 dark:border-emerald-800 text-emerald-600"
                        : downloading[track.id]
                        ? "bg-slate-100 dark:bg-slate-800 border-transparent text-slate-400 cursor-wait"
                        : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-[#10b981]"
                    )}
                  >
                    {downloading[track.id] ? (
                      <Loader2 size={16} className="animate-spin text-[#10b981]" />
                    ) : isDownloaded ? (
                      <Trash2 size={16} className="text-rose-500" />
                    ) : (
                      <CloudDownload size={16} />
                    )}
                  </button>

                  {/* Device file download */}
                  <button
                    onClick={() => handleSaveToDevice(track)}
                    disabled={savingDeviceTrack[track.id] === 'loading'}
                    className={cn(
                      "px-3 h-9 rounded-xl border flex items-center gap-1.5 text-[11px] font-black transition-all active:scale-95 shadow-sm",
                      savingDeviceTrack[track.id] === 'success'
                        ? "bg-[#10b981] border-[#10b981] text-white"
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-50"
                    )}
                  >
                    {savingDeviceTrack[track.id] === 'loading' ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <>
                        <CloudDownload size={13} />
                        <span>تحميل للهاتف</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}

        {filteredTracks.length === 0 && (
          <EmptyStatePlaceholder
            title="لا توجد نتائج"
            description="لا توجد رقى مطابقة للبحث حاليا"
            variant="empty"
          />
        )}
      </div>

      {/* Security Tip block */}
      <div className="bg-[#10b981]/5 dark:bg-[#10b981]/10 p-5 rounded-2xl border border-[#10b981]/15 mt-6 flex gap-3 text-right">
        <div className="w-9 h-9 rounded-xl bg-[#10b981]/10 flex items-center justify-center shrink-0 text-[#10b981]">
          <Info size={16} />
        </div>
        <div>
          <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 mb-1">نصيحة لحفظ الرقية والتحصين</h4>
          <p className="text-xs text-slate-650 dark:text-slate-400 font-medium leading-relaxed">
            الرقية الشرعية تؤثر بالاستماع الخاشع وتكرارها باستمرار وثبات النية والإخلاص لله عز وجل. يمكنك تحميل ملفات الرقية بالكامل لتشغيلها والاستماع في أي وقت دون اتصال بالإنترنت.
          </p>
        </div>
      </div>
      
    </div>
  );
}
