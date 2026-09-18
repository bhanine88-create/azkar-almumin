import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useSmartNavigation } from '../lib/navigation';
import {  Mic2, PlayCircle, Clock, CheckCircle2, ChevronRight, PauseCircle, 
  Loader2, CloudDownload,  Heart, BookOpen, Star, Settings, SlidersHorizontal, 
  X, FastForward, Timer, SkipForward, Info, Play, RotateCcw, Search, Sparkles,
  FileDown,  ArrowUpDown , Trash2, Check } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAppContext } from '../AppContext';
import { TAFSIR_SCHOLARS, TafsirScholar, SurahTafsir, TafsirTrack } from '../data/tafsir';
import { BackButton } from './ui/BackButton';
import { EmptyStatePlaceholder } from './EmptyStatePlaceholder';
import { lectureCacheService } from '../services/lectureCacheService';
import { useGlobalAudio } from '../context/GlobalAudioContext';
import { useDownloadManager } from '../context/DownloadContext';
import { smartScholarMatch } from '../lib/arabicSearch';

import { useLocation } from 'react-router-dom';
import { preloadAudioLibraryRoutes } from '../lib/preloadLibrary';

export function TafsirAudioHub() {
  const { navigate, goBack } = useSmartNavigation();
  const location = useLocation();

  useEffect(() => {
    preloadAudioLibraryRoutes();
  }, []);
  const { settings, progress, toggleScholarFavorite, toggleLectureFavorite, updateSettings, toggleFavoriteUnified } = useAppContext();
  const isDarkTheme = settings.theme === 'dark';
  
  const [selectedTafsirScholar, setSelectedTafsirScholar] = useState<TafsirScholar | null>(null);
  const [selectedSeries, setSelectedSeries] = useState<string | null>(null);
  
  const { currentTrack, isPlaying, playTrack, pauseTrack, resumeTrack, sleepTimer, setSleepTimer } = useGlobalAudio();
  const playingAudio = currentTrack?.type === 'tafsir' ? currentTrack.id : null;
  
  const [isLoading, setIsLoading] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  type SortOption = 'default' | 'alphabetical' | 'surahs';
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [cacheSize, setCacheSize] = useState(0);
  const [searchQuery, setSearchQuery] = useState(location.state?.searchQuery || '');

  // Filter scholars using smart Arabic matching
  const filteredTafsirScholars = TAFSIR_SCHOLARS.filter(scholar => 
    (!showFavoritesOnly || (progress.favoriteScholars || []).includes(scholar.id)) &&
    smartScholarMatch(scholar, searchQuery)
  );

  const getCleanScholarName = (name: string) => {
    return name.replace(/^(الشيخ|الدكتور|د\.|أ\.د\.|الشيخ\s+الدكتور|الشيخ\s+د\.|فضيلة\s+الشيخ)\s+/, '').trim();
  };

  const sortedTafsirScholars = [...filteredTafsirScholars].sort((a, b) => {
    if (sortBy === 'alphabetical') {
      const nameA = getCleanScholarName(a.name);
      const nameB = getCleanScholarName(b.name);
      const cmp = nameA.localeCompare(nameB, 'ar', { sensitivity: 'base' });
      return sortOrder === 'asc' ? cmp : -cmp;
    }

    if (sortBy === 'surahs') {
      const countA = a.surahs.reduce((sum, s) => sum + s.tracks.length, 0);
      const countB = b.surahs.reduce((sum, s) => sum + s.tracks.length, 0);
      return sortOrder === 'desc' ? countB - countA : countA - countB;
    }

    // Default: Favorites first
    const aFavIdx = (progress.favoriteScholars || []).indexOf(a.id);
    const bFavIdx = (progress.favoriteScholars || []).indexOf(b.id);
    const aFav = aFavIdx !== -1;
    const bFav = bFavIdx !== -1;
    
    if (aFav && !bFav) return -1;
    if (!aFav && bFav) return 1;
    if (aFav && bFav) return aFavIdx - bFavIdx;
    return 0;
  });

  // Sync playback speed
  const [cachedTafsirTracks, setCachedTafsirTracks] = useState<Set<string>>(new Set());
  
  const { downloads, startDownloadLecture, cancelDownload } = useDownloadManager();

  const downloading = React.useMemo(() => {
    const map: Record<string, boolean> = {};
    downloads.forEach(d => {
      if (d.type === 'tafsir') {
        map[d.lectureId || d.id] = d.status === 'downloading' || d.status === 'pending';
      }
    });
    return map;
  }, [downloads]);

  const downloadProgress = React.useMemo(() => {
    const map: Record<string, number> = {};
    downloads.forEach(d => {
      if (d.type === 'tafsir') {
        map[d.lectureId || d.id] = d.progress;
      }
    });
    return map;
  }, [downloads]);

  const [savingDeviceTafsir, setSavingDeviceTafsir] = useState<Record<string, 'loading' | 'success' | null>>({});

  const handleSaveTafsirToDevice = async (track: TafsirTrack, scholarName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavingDeviceTafsir(prev => ({ ...prev, [track.id]: 'loading' }));
    
    let url = track.audioUrl;

    try {
      let blob: Blob | null = null;

      // 1. Try Cache match (so it is instantaneous!)
      try {
        const cache = await caches.open('lectures-offline-audio-v1');
        const response = await cache.match(track.audioUrl);
        if (response) {
          blob = await response.blob();
        }
      } catch (cacheErr) {
        console.warn('Cache lookup failed for Tafsir direct save:', cacheErr);
      }

      // 2. Fetch if not cached
      if (!blob) {
        const response = await fetch(url, { mode: 'cors' });
        if (!response.ok) throw new Error(`Fetch fail status ${response.status}`);
        blob = await response.blob();
      }

      // 3. Download
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `${track.title} - ${scholarName}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);

      setSavingDeviceTafsir(prev => ({ ...prev, [track.id]: 'success' }));
      setTimeout(() => {
        setSavingDeviceTafsir(prev => ({ ...prev, [track.id]: null }));
      }, 2000);
    } catch (err) {
      console.error('Failed to save Tafsir track as MP3:', err);
      // Fallback
      try {
        const a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        a.download = `${track.title} - ${scholarName}.mp3`;
        a.click();
      } catch (e) {}
      setSavingDeviceTafsir(prev => ({ ...prev, [track.id]: null }));
    }
  };

  // Sync playback speed
  // Handled by GlobalAudioBar now

  // Load cache size
  useEffect(() => {
    const loadCacheSize = async () => {
      const size = await lectureCacheService.getTotalCacheSize();
      setCacheSize(size);
    };
    loadCacheSize();
  }, [cachedTafsirTracks]);

  // Sleep timer logic (handled centrally now)

  useEffect(() => {
    const checkCacheStatus = () => {
      const cached = new Set<string>();
      
      const metadataList = lectureCacheService.getMetadataList();
      metadataList.forEach(meta => {
        if (meta.lectureId) {
          cached.add(meta.lectureId);
        }
      });

      // Sync completed downloads
      downloads.forEach(d => {
        if (d.type === 'tafsir' && d.status === 'completed' && d.lectureId) {
          cached.add(d.lectureId);
        }
      });
      setCachedTafsirTracks(prev => {
        if (prev.size !== cached.size || Array.from(cached).some(id => !prev.has(id))) {
          return cached;
        }
        return prev;
      });
    };
    checkCacheStatus();
    // Re-check size too
    lectureCacheService.getTotalCacheSize().then(size => setCacheSize(size));
  }, [downloads]);

  const handleDownloadToggle = async (lecture: TafsirTrack, surahs: SurahTafsir, scholar: TafsirScholar) => {
    const downloadId = `tafsir-${lecture.id}`;

    if (downloading[lecture.id]) {
      cancelDownload(downloadId);
      return;
    }

    if (cachedTafsirTracks.has(lecture.id)) {
      // Remove from cache
      await lectureCacheService.removeCachedAudio(lecture.audioUrl);
      setCachedTafsirTracks(prev => {
        const next = new Set(prev);
        next.delete(lecture.id);
        return next;
      });
      return;
    }

    // Trigger download globally
    startDownloadLecture(lecture.id, lecture.title, scholar.name, lecture.audioUrl, 'tafsir');
  };

  const handlePlay = async (lecture: TafsirTrack) => {
    if (playingAudio === lecture.id) {
      if (isPlaying) {
        pauseTrack();
      } else {
        resumeTrack();
      }
      return;
    }

    setIsLoading(true);
    let srcUrl = lecture.audioUrl;
    
    if (cachedTafsirTracks.has(lecture.id)) {
      const cachedUrl = await lectureCacheService.getCachedAudioUrl(lecture.audioUrl);
      if (cachedUrl) {
         srcUrl = cachedUrl;
      }
    }

    if (!srcUrl) {
      console.error("Audio source URL is missing");
      setIsLoading(false);
      return;
    }

    try {
      await playTrack({
        id: lecture.id,
        title: lecture.title,
        subtitle: selectedTafsirScholar?.name || 'تفسير',
        audioUrl: srcUrl,
        originalUrl: lecture.audioUrl,
        type: 'tafsir',
        scholarId: selectedTafsirScholar?.id
      });
    } catch (err) {
      console.error("Audio setup error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Playback errors and tracking are handled by useGlobalAudio!

  const clearAllCache = async () => {
    const confirmed = window.confirm('هل أنت متأكد من حذف جميع الملفات الصوتية المحملة؟');
    if (confirmed) {
      await lectureCacheService.clearAllCache();
      setCachedTafsirTracks(new Set());
      setCacheSize(0);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const totalTafsirTracksCount = TAFSIR_SCHOLARS.reduce((acc, s) => acc + s.surahs.reduce((sum, sr) => sum + sr.tracks.length, 0), 0);

  return (
    <div className="flex flex-col h-full flex-1 overflow-y-auto px-4 pb-24 w-full max-w-lg mx-auto">
      {/* Settings Panel */}
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
                  <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/40 flex items-center justify-center text-rose-800 dark:text-rose-400">
                    <Settings size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">إعدادات المكتبة</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">تخصيص تجربة الاستماع</p>
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
                {/* Playback Speed */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-black text-slate-700 dark:text-slate-200">
                    <FastForward size={18} className="text-rose-800 dark:text-rose-400" />
                    <span>سرعة التشغيل</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                      <button
                        key={speed}
                        onClick={() => updateSettings({ audioPlaybackSpeed: speed })}
                        className={cn(
"px-4 py-2 rounded-xl text-sm font-bold transition-all transform transition-all duration-75 active:scale-[0.95] active:opacity-80",
                          settings.audioPlaybackSpeed === speed
                            ? "bg-rose-800 dark:bg-rose-700 text-white shadow-lg shadow-rose-800/30"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                        )}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* Auto Play Next */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <SkipForward size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white">التشغيل التلقائي</h4>
                      <p className="text-[10px] text-slate-500 font-bold">تشغيل الحلقة التالية تلقائياً</p>
                    </div>
                  </div>
                  <button
                    onClick={() => updateSettings({ audioAutoAdvance: !settings.audioAutoAdvance })}
                    className={cn(
                      "w-12 h-6 rounded-full transition-colors relative",
                      settings.audioAutoAdvance ? "bg-rose-800 dark:bg-rose-700" : "bg-slate-300 dark:bg-slate-700"
                    )}
                  >
                    <motion.div
                      animate={{ x: settings.audioAutoAdvance ? 24 : 4 }}
                      className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-sm"
                    />
                  </button>
                </div>

                {/* Sleep Timer */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-black text-slate-700 dark:text-slate-200">
                    <Timer size={18} className="text-orange-500" />
                    <span>مؤقت النوم</span>
                    {sleepTimer !== null && (
                      <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-lg animate-pulse mr-auto">
                        متبقي: {sleepTimer} دقيقة
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[0, 5, 15, 30, 45, 60].map((mins) => (
                      <button
                        key={mins}
                        onClick={() => {
                          if (mins === 0) {
                            setSleepTimer(null);
                          } else {
                            setSleepTimer(mins);
                          }
                        }}
                        className={cn(
"px-4 py-2 rounded-xl text-sm font-bold transition-all transform transition-all duration-75 active:scale-[0.95] active:opacity-80",
                          (mins === 0 && sleepTimer === null) || (mins > 0 && sleepTimer === mins)
                            ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                        )}
                      >
                        {mins === 0 ? "إيقاف" : `${mins} د`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Storage Management */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-black text-slate-700 dark:text-slate-200">
                    <CloudDownload size={18} className="text-teal-500" />
                    <span>إدارة مساحة التخزين</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">المساحة المستخدمة</p>
                        <p className="text-lg font-black text-slate-900 dark:text-white">{formatSize(cacheSize)}</p>
                      </div>
                      <button
                        onClick={clearAllCache}
                        disabled={cacheSize === 0}
                        className={cn(
"px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 transform transition-all duration-75 active:scale-[0.95] active:opacity-80",
                          cacheSize > 0 
                            ? "bg-rose-50 text-rose-600 hover:bg-rose-100" 
                            : "bg-slate-100 text-slate-400 cursor-not-allowed"
                        )}
                      >
                        <Trash2 size={14} />
                        مسح الذاكرة
                      </button>
                    </div>
                    {/* Visual bar */}
                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: cacheSize > 0 ? '40%' : '0%' }} // Just a visual mock of percentage if we don't have total quota
                        className="h-full bg-teal-500 rounded-full"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-rose-50/50 dark:bg-rose-950/10 p-4 rounded-2xl border border-rose-100 dark:border-rose-950/30">
                   <div className="flex items-start gap-3">
                     <Info size={18} className="text-rose-800 dark:text-rose-400 shrink-0 mt-0.5" />
                     <p className="text-xs text-rose-900 dark:text-rose-300 font-medium leading-relaxed">
                       يمكنك الاستماع للدروس المحملة حتى في حال عدم توفر اتصال بالإنترنت. يتم حفظ الملفات في ذاكرة المتصفح بشكل آمن.
                     </p>
                   </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
        </AnimatePresence>,
        document.body
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4 sticky top-0 bg-slate-100/90 dark:bg-slate-950/90 backdrop-blur-xl py-4 z-40 -mx-4 px-4 border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm">
        <div className="flex items-center gap-4">
          <BackButton onClick={() => {
            if (selectedTafsirScholar) {
              setSelectedTafsirScholar(null);
              setSelectedSeries(null);
              setShowFavoritesOnly(false);
            } else {
              goBack('/audio-library');
            }
          }} />
          <div>
            <h1 className={cn(
              "text-xl font-black bg-clip-text text-transparent mr-2",
              isDarkTheme ? "bg-gradient-to-l from-red-400 via-rose-400 to-amber-300" : "bg-gradient-to-l from-red-800 via-rose-700 to-red-650"
            )}>
              {selectedTafsirScholar ? "السور والتفاسير" : "علماء التفسير"}
            </h1>
            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mr-2">
              {selectedTafsirScholar 
                ? `المكتبة الصوتية • ${selectedTafsirScholar.surahs.reduce((sum, sr) => sum + sr.tracks.length, 0)} تفاسير`
                : `المكتبة الصوتية • ${TAFSIR_SCHOLARS.length} مفسرين • ${totalTafsirTracksCount} تفسيراً`
              }
            </p>
          </div>
        </div>

        <button 
          onClick={() => setIsSettingsOpen(true)}
          className={cn(
            "p-2.5 rounded-2xl transition-all duration-300 relative group overflow-hidden",
            isDarkTheme ? "bg-slate-800/60 text-slate-400 hover:text-slate-300" : "bg-white text-slate-500 hover:text-slate-700 shadow-sm border border-slate-100"
          )}
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-rose-800/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <SlidersHorizontal size={22} className="relative z-10" />
        </button>
      </div>

      <AnimatePresence mode="wait">
        {!selectedTafsirScholar ? (
          <motion.div
            key="scholars"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex flex-col gap-3"
          >
            {/* Search and Favorites Bar */}
            <div className="flex flex-col gap-4 mb-4">
              <div className="relative group">
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-rose-800 dark:group-focus-within:text-rose-400 transition-colors">
                  <Search size={18} />
                </div>
                <input
                  type="text"
                  placeholder="ابحث عن شيخ أو عالم..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn(
                    "w-full h-12 pr-12 pl-4 rounded-2xl text-sm font-bold transition-all focus:ring-2 focus:ring-rose-800/20 outline-none border",
                    isDarkTheme 
                      ? "bg-slate-900 border-slate-800 text-white placeholder:text-slate-600" 
                      : "bg-white border-slate-200 text-slate-900 shadow-sm placeholder:text-slate-400"
                  )}
                />
              </div>

              {/* Sorting & Filter Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-100/90 dark:bg-slate-900/90 p-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm backdrop-blur-sm">
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                  <span className="text-xs font-black text-slate-500 dark:text-slate-400 flex items-center gap-1.5 px-1 shrink-0">
                    <SlidersHorizontal size={14} className="text-rose-600 dark:text-rose-400" />
                    <span>ترتيب حسب:</span>
                  </span>

                  <button
                    onClick={() => setSortBy('default')}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5",
                      sortBy === 'default'
                        ? "bg-rose-600 text-white shadow-sm"
                        : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                    )}
                  >
                    <Sparkles size={12} />
                    <span>الافتراضي</span>
                  </button>

                  <button
                    onClick={() => {
                      if (sortBy === 'alphabetical') {
                        setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortBy('alphabetical');
                        setSortOrder('asc');
                      }
                    }}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5",
                      sortBy === 'alphabetical'
                        ? "bg-rose-600 text-white shadow-sm"
                        : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                    )}
                  >
                    <ArrowUpDown size={12} />
                    <span>أبجدياً (أ - ي)</span>
                    {sortBy === 'alphabetical' && (
                      <span className="text-[10px] font-black bg-white/20 px-1 rounded dir-ltr">
                        {sortOrder === 'asc' ? 'أ←ي' : 'ي←أ'}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      if (sortBy === 'surahs') {
                        setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortBy('surahs');
                        setSortOrder('desc');
                      }
                    }}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5",
                      sortBy === 'surahs'
                        ? "bg-rose-600 text-white shadow-sm"
                        : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                    )}
                  >
                    <BookOpen size={12} />
                    <span>الأكثر تسجيلات</span>
                    {sortBy === 'surahs' && (
                      <span className="text-[10px] font-black bg-white/20 px-1 rounded">
                        {sortOrder === 'desc' ? '▼' : '▲'}
                      </span>
                    )}
                  </button>
                </div>

                <button
                  onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 self-start sm:self-auto",
                    showFavoritesOnly
                      ? "bg-rose-600 text-white shadow-sm"
                      : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-rose-600 border border-slate-200/50 dark:border-slate-700/50"
                  )}
                >
                  <Heart size={13} className={showFavoritesOnly ? "fill-current" : ""} />
                  <span>المفضلة فقط</span>
                </button>
              </div>
            </div>

            {sortedTafsirScholars
              .map((scholar, idx) => {
                const isFavorite = (progress.favoriteScholars || []).includes(scholar.id);
                return (
              <motion.div
                key={scholar.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => setSelectedTafsirScholar(scholar)}
                className={cn(
                  "group rounded-2xl border px-5 py-4 cursor-pointer flex justify-between items-center transition-all duration-300",
                  isDarkTheme 
                    ? "bg-slate-900 border-slate-800 hover:bg-slate-800 hover:border-slate-700 hover:shadow-lg hover:shadow-rose-950/10" 
                    : "bg-white border-slate-200 hover:shadow-md hover:border-rose-200"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className="relative w-14 h-14 rounded-[1.2rem] bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 p-[2px] shadow-[0_8px_16px_-6px_rgba(245,158,11,0.5)] group-hover:shadow-[0_12px_20px_-6px_rgba(245,158,11,0.7)] transform transition-all duration-75 active:scale-[0.85] active:opacity-70 group-hover:-translate-y-1 group-hover:scale-105 shrink-0">
                    <span className="absolute -top-1.5 -right-1.5 bg-slate-900/90 dark:bg-white text-white dark:text-slate-900 rounded-lg px-2 py-0.5 text-[9px] font-black z-20 flex items-center justify-center shadow-lg border border-white/20 dark:border-slate-800">
                      {idx + 1}
                    </span>
                    <div className="w-full h-full rounded-[1.1rem] bg-gradient-to-br from-white/30 to-white/5 flex items-center justify-center backdrop-blur bg-amber-600/20 border border-white/20 relative overflow-hidden">
                       <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></div>
                       <Mic2 className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] relative z-10 group-hover:rotate-6 transition-transform duration-500" size={26} strokeWidth={2.5} />
                    </div>
                    {isFavorite && (
                      <div className="absolute -top-1 -right-1 bg-gradient-to-br from-rose-400 to-rose-600 border-2 border-white dark:border-slate-900 rounded-full w-5 h-5 flex items-center justify-center shadow-md shadow-rose-500/40 z-20">
                        <Heart size={10} className="fill-white text-white drop-shadow-sm" />
                      </div>
                    )}
                  </div>
                  <h3 className="font-bold text-[17px] text-slate-800 dark:text-slate-100 group-hover:text-amber-700 dark:group-hover:text-amber-500 transition-colors duration-300">
                    {scholar.name}
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleScholarFavorite(scholar.id);
                      toggleFavoriteUnified({
                        id: scholar.id,
                        type: 'scholar',
                        title: scholar.name,
                        subtitle: 'مفسر وداعية',
                        route: '/tafsir-audio'
                      });
                    }}
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300",
                      isFavorite 
                        ? "bg-rose-100 text-rose-500 dark:bg-rose-950/30" 
                        : "bg-slate-50 text-slate-400 hover:text-rose-400 dark:bg-slate-800"
                    )}
                  >
                    <Heart size={16} className={isFavorite ? "fill-current" : ""} />
                  </button>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-50 dark:bg-slate-800 group-hover:bg-rose-100 dark:group-hover:bg-rose-950/40 transition-colors duration-300">
                    <ChevronRight size={18} className="text-slate-400 group-hover:text-rose-800 dark:group-hover:text-rose-400 transition-colors duration-300" />
                  </div>
                </div>
              </motion.div>
            )})}
            {TAFSIR_SCHOLARS.filter(scholar => !showFavoritesOnly || (progress.favoriteScholars || []).includes(scholar.id)).length === 0 && (
              <EmptyStatePlaceholder
                title="لا يوجد شيوخ في المفضلة"
                description="لم تقم بإضافة أي شيوخ للمفضلة بعد."
                variant="empty"
              />
            )}
          </motion.div>
        ) : (
          <motion.div
            key="surahs"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* TafsirScholar Information Header */}
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="relative w-14 h-14 rounded-[1.2rem] bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 p-[2px] shadow-[0_8px_16px_-6px_rgba(245,158,11,0.5)] shrink-0">
                  <div className="w-full h-full rounded-[1.1rem] bg-gradient-to-br from-white/30 to-white/5 flex items-center justify-center backdrop-blur bg-amber-600/20 border border-white/20 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></div>
                    <Mic2 className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] relative z-10" size={26} strokeWidth={2.5} />
                  </div>
                </div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">{selectedTafsirScholar.name}</h2>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-5">{selectedTafsirScholar.description}</p>
              
              <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-xs font-bold text-slate-600 dark:text-slate-300 transform transition-all duration-75 active:scale-[0.95] active:opacity-80">
                    <Mic2 size={14} className="text-slate-400" />
                    <span>{selectedTafsirScholar.surahs.length} سورة</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-xs font-bold text-rose-800 dark:text-rose-450 border border-rose-100 dark:border-rose-900/30 transform transition-all duration-75 active:scale-[0.95] active:opacity-80">
                    <BookOpen size={14} className="text-rose-700 dark:text-rose-400" />
                    <span>{selectedTafsirScholar.surahs.reduce((acc, curr) => acc + curr.tracks.length, 0)} مقطع تفسير</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-xs font-bold text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-800/30 transform transition-all duration-75 active:scale-[0.95] active:opacity-80">
                    <Heart size={14} className="fill-current text-rose-500" />
                    <span>{selectedTafsirScholar.likes.toLocaleString('ar-EG')} إعجاب</span>
                  </div>
                </div>
                {/* Favorites Toggle for TafsirTracks */}
                <button
                  onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                  className={cn(
"flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 transform transition-all duration-75 active:scale-[0.95] active:opacity-80",
                    showFavoritesOnly
                      ? "bg-rose-100 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                  )}
                >
                  <Heart size={14} className={showFavoritesOnly ? "fill-current" : ""} />
                  <span>دروس مفضلة</span>
                </button>
              </div>
            </motion.div>

            {selectedTafsirScholar.surahs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center opacity-70">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                  <Mic2 size={32} className="text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">قريباً</h3>
                <p className="text-sm text-slate-500 mt-2">سيتم إضافة سلاسل علمية للشيخ قريباً بإذن الله.</p>
              </div>
            ) : (
              (() => {
                const mappedSeries = selectedTafsirScholar.surahs.map(s => {
                  const visibleTafsirTracks = s.tracks.filter(l => 
                    !showFavoritesOnly || (progress.favoriteLectures || []).includes(l.id)
                  );
                  return { ...s, visibleTafsirTracks };
                }).filter(s => s.visibleTafsirTracks.length > 0);

                if (mappedSeries.length === 0) {
                  return (
                    <EmptyStatePlaceholder
                      title="لا يوجد دروس مفضلة"
                      description="لم تقم بإضافة أي درس للمفضلة لهذا الشيخ."
                      variant="empty"
                    />
                  );
                }

                return mappedSeries.map((surahs, idx) => (
                  <motion.div
                  key={surahs.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={cn(
                    "rounded-3xl border overflow-hidden transition-all duration-300",
                    isDarkTheme ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-xl shadow-slate-200/50",
                    selectedSeries === surahs.id ? "ring-2 ring-rose-800 dark:ring-rose-600" : ""
                  )}
                >
                  {/* Series Header */}
                  <div 
                    onClick={() => setSelectedSeries(selectedSeries === surahs.id ? null : surahs.id)}
                    className="p-5 cursor-pointer flex gap-4 items-center"
                  >
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-colors",
                      selectedSeries === surahs.id 
                        ? "bg-rose-800 dark:bg-rose-700 text-white" 
                        : "bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-400"
                    )}>
                      <PlayCircle size={28} className={selectedSeries === surahs.id ? "fill-current" : ""} />
                    </div>
                    <div className="flex-1 text-right">
                      <h3 className="font-black text-lg text-slate-900 dark:text-white leading-tight">
                        {surahs.surahName}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                        {surahs.description}
                      </p>
                      <p className="text-[10px] font-bold text-rose-800 dark:text-rose-400 mt-2">
                        {surahs.visibleTafsirTracks.length} حلقات
                      </p>
                    </div>
                  </div>

                  {/* Expanded TafsirTracks List */}
                  <AnimatePresence>
                    {selectedSeries === surahs.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 pt-0 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
                          <div className="space-y-2 mt-4">
                            {surahs.visibleTafsirTracks.map((lecture) => {
                              const isThisPlaying = playingAudio === lecture.id;
                              
                              return (
                                <div 
                                  key={lecture.id}
                                  className={cn(
                                    "flex items-center justify-between p-3 rounded-xl transition-colors",
                                    isThisPlaying 
                                      ? "bg-rose-100/70 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50" 
                                      : "bg-white dark:bg-slate-800 border border-transparent shadow-sm"
                                  )}
                                >
                                  <div className="flex items-center gap-3">
                                    <button
                                      onClick={() => handlePlay(lecture)}
                                      className={cn(
"w-10 h-10 rounded-full flex items-center justify-center transform transition-all duration-75 active:scale-[0.85] active:opacity-70",
                                        isThisPlaying 
                                          ? "bg-rose-800 dark:bg-rose-700 text-white shadow-lg shadow-rose-800/30" 
                                          : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-rose-100 dark:hover:bg-rose-950/40 hover:text-rose-800 dark:hover:text-rose-400"
                                      )}
                                    >
                                      {isThisPlaying && isLoading ? (
                                        <Loader2 size={20} className="animate-spin" />
                                      ) : isThisPlaying && isPlaying ? (
                                        <PauseCircle size={20} className="fill-current" />
                                      ) : (
                                        <PlayCircle size={20} className="ml-1" />
                                      )}
                                    </button>
                                    <div className="text-right">
                                      <h5 className={cn(
                                        "text-sm font-black text-slate-800 dark:text-white",
                                        isThisPlaying && "text-rose-700 dark:text-rose-300"
                                      )}>
                                        {lecture.title}
                                      </h5>
                                      <div className="flex items-center gap-2 mt-1 text-[10px] font-bold text-slate-500">
                                        <Clock size={12} />
                                        <span>{lecture.duration}</span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {isThisPlaying && isPlaying && (
                                    <div className="flex gap-1 items-end h-4 mx-2">
                                      <motion.div animate={{ height: [4, 12, 4] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1 bg-fuchsia-500 rounded-full" />
                                      <motion.div animate={{ height: [8, 16, 8] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1 bg-fuchsia-500 rounded-full" />
                                      <motion.div animate={{ height: [4, 10, 4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1 bg-fuchsia-500 rounded-full" />
                                    </div>
                                  )}

                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleLectureFavorite(lecture.id);
                                        toggleFavoriteUnified({
                                          id: lecture.id,
                                          type: 'lecture',
                                          title: lecture.title,
                                          subtitle: selectedTafsirScholar?.name || 'تفسير',
                                          route: '/tafsir-audio'
                                        });
                                      }}
                                      className={cn(
"w-10 h-10 rounded-xl relative overflow-hidden flex items-center justify-center transform transition-all duration-75 active:scale-[0.85] active:opacity-70 border",
                                        (progress.favoriteLectures || []).includes(lecture.id)
                                          ? "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/50 text-rose-500 shadow-sm shadow-rose-500/10"
                                          : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-rose-500 hover:border-rose-200 dark:hover:border-rose-900/50"
                                      )}
                                    >
                                      <Heart size={18} className={(progress.favoriteLectures || []).includes(lecture.id) ? "fill-current" : ""} />
                                    </button>
                                    <button
                                      onClick={(e) => handleSaveTafsirToDevice(lecture, selectedTafsirScholar?.name || 'الشيخ', e)}
                                      disabled={savingDeviceTafsir[lecture.id] === 'loading'}
                                      className={cn(
"w-10 h-10 rounded-xl relative flex items-center justify-center transform transition-all duration-75 active:scale-[0.85] active:opacity-70 border shadow-sm shrink-0",
                                        savingDeviceTafsir[lecture.id] === 'success'
                                          ? "bg-emerald-500 border-emerald-500 text-white"
                                          : savingDeviceTafsir[lecture.id] === 'loading'
                                            ? "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-teal-600"
                                            : "bg-teal-50 dark:bg-teal-950/40 border-teal-100 dark:border-teal-900/30 text-teal-600 dark:text-teal-400 hover:bg-teal-500 dark:hover:bg-teal-500 hover:text-white dark:hover:text-white hover:border-teal-500"
                                      )}
                                      title="حفظ كملف MP3 على الهاتف"
                                    >
                                      {savingDeviceTafsir[lecture.id] === 'loading' ? (
                                        <Loader2 size={16} className="animate-spin" strokeWidth={2.5} />
                                      ) : savingDeviceTafsir[lecture.id] === 'success' ? (
                                        <Check size={16} strokeWidth={2.5} />
                                      ) : (
                                        <FileDown size={16} strokeWidth={2.5} />
                                      )}
                                    </button>

                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDownloadToggle(lecture, surahs, selectedTafsirScholar);
                                      }}
                                      className={cn(
"w-10 h-10 rounded-xl relative overflow-hidden flex items-center justify-center transform transition-all duration-75 active:scale-[0.85] active:opacity-70 border",
                                        downloading[lecture.id]
                                          ? "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-teal-600 hover:text-rose-500 hover:bg-rose-50"
                                          : cachedTafsirTracks.has(lecture.id)
                                            ? "bg-teal-50 dark:bg-teal-900/30 border-teal-200 dark:border-teal-800 text-teal-600 dark:text-teal-400 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200"
                                            : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-rose-800 hover:border-rose-200 dark:hover:border-rose-900"
                                      )}
                                    >
                                      {downloading[lecture.id] ? (
                                        <>
                                          <div 
                                            className={cn(
                                              "absolute bottom-0 left-0 right-0 bg-teal-100 dark:bg-teal-900/50 transition-all duration-300",
                                            )}
                                            style={{ height: `${downloadProgress[lecture.id] || 0}%` }}
                                          />
                                          <Trash2 size={18} className="relative z-10" />
                                        </>
                                      ) : cachedTafsirTracks.has(lecture.id) ? (
                                        <span className="relative z-10 flex items-center justify-center group-hover:hidden">
                                          <CheckCircle2 size={20} />
                                        </span>
                                      ) : (
                                        <CloudDownload size={20} />
                                      )}
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ));
            })()
          )}
        </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
