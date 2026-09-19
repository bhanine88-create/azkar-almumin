import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useSmartNavigation } from '../lib/navigation';
import {  Mic2, PlayCircle, Clock, CheckCircle2, ChevronRight, PauseCircle, 
  Loader2, CloudDownload,  Heart, BookOpen, Star, Settings, SlidersHorizontal, 
  X, FastForward, Timer, SkipForward, Info, Play, RotateCcw, Search, Sparkles, ChevronLeft,
  FileDown,  ArrowUpDown , Trash2, Check } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAppContext } from '../AppContext';
import { SCHOLARS, Scholar, LectureSeries, Lecture } from '../data/lectures';
import { BackButton } from './ui/BackButton';
import { EmptyStatePlaceholder } from './EmptyStatePlaceholder';
import { lectureCacheService } from '../services/lectureCacheService';
import { 
  useGlobalAudio, 
  parseDurationToSeconds, 
  formatSecondsToTime, 
  clearTrackPlaybackPosition 
} from '../context/GlobalAudioContext';

function useTrackPlaybackPositions() {
  const [positions, setPositions] = useState<Record<string, { time: number; duration: number; completed?: boolean }>>(() => {
    try {
      const saved = safeLocalStorageGetItem('believer_audio_positions');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    const handleUpdate = () => {
      try {
        const saved = safeLocalStorageGetItem('believer_audio_positions');
        setPositions(saved ? JSON.parse(saved) : {});
      } catch (e) {}
    };

    window.addEventListener('believer_audio_positions_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('believer_audio_positions_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  return positions;
}
import { useDownloadManager } from '../context/DownloadContext';
import { smartScholarMatch } from '../lib/arabicSearch';
import { AudioSearchAutocomplete } from './AudioSearchAutocomplete';

import { useLocation } from 'react-router-dom';
import { preloadAudioLibraryRoutes } from '../lib/preloadLibrary';
import { safeLocalStorageGetItem, safeLocalStorageSetItem, safeLocalStorageRemoveItem } from "../utils/storage";

function LecturesAudioHubComponent() {
  const { navigate, goBack } = useSmartNavigation();
  const location = useLocation();
  const { settings, progress, toggleScholarFavorite, toggleLectureFavorite, updateSettings, toggleFavoriteUnified } = useAppContext();
  const isDarkTheme = settings.theme === 'dark';
  
  const totalLecturesCount = SCHOLARS.reduce((acc, s) => acc + s.series.reduce((sum, sr) => sum + sr.lectures.length, 0), 0);
  
  const [selectedScholarId, setSelectedScholarId] = useState<string | null>(null);
  const selectedScholar = SCHOLARS.find(s => s.id === selectedScholarId) || null;
  
  // Handle scholar selection from navigation state (e.g. from favorites page)
  useEffect(() => {
    if (location.state?.scholarId) {
      const scholar = SCHOLARS.find(s => s.id === location.state.scholarId);
      if (scholar) {
        setSelectedScholarId(scholar.id);
      }
      // Clean up state
      navigate(location.pathname, { replace: true, state: { ...location.state, scholarId: undefined } });
    }
  }, [location.state?.scholarId, navigate, location.pathname]);

  const { currentTrack, isPlaying, currentTime, duration: globalAudioDuration, playTrack, pauseTrack, resumeTrack, seek } = useGlobalAudio();
  const savedPositions = useTrackPlaybackPositions();
  const playingAudio = currentTrack?.type === 'lecture' ? currentTrack.id : null;
  const [selectedSeries, setSelectedSeries] = useState<string | null>(null);

  // Automatically expand the first series when a scholar is selected
  useEffect(() => {
    if (selectedScholar && selectedScholar.series.length > 0) {
      setSelectedSeries(selectedScholar.series[0].id);
    } else {
      setSelectedSeries(null);
    }
  }, [selectedScholarId]);

  useEffect(() => {
    preloadAudioLibraryRoutes();
  }, []);
  const [isLoading, setIsLoading] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  type SortOption = 'default' | 'alphabetical' | 'lectures' | 'series';
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [cacheSize, setCacheSize] = useState(0);
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState(location.state?.searchQuery || '');

  // Filter scholars using smart Arabic matching
  const filteredScholars = React.useMemo(() => {
    return SCHOLARS.filter(scholar => 
      (!showFavoritesOnly || (progress.favoriteScholars || []).includes(scholar.id)) &&
      smartScholarMatch(scholar, searchQuery)
    );
  }, [showFavoritesOnly, progress.favoriteScholars, searchQuery]);

  // Helper to get clean scholar name for alphabetical sorting
  const getCleanScholarName = (name: string) => {
    return name.replace(/^(الشيخ|الدكتور|د\.|أ\.د\.|الشيخ\s+الدكتور|الشيخ\s+د\.|فضيلة\s+الشيخ)\s+/, '').trim();
  };

  // Sort scholars based on chosen option
  const sortedScholars = React.useMemo(() => {
    return [...filteredScholars].sort((a, b) => {
      if (sortBy === 'alphabetical') {
        const nameA = getCleanScholarName(a.name);
        const nameB = getCleanScholarName(b.name);
        const cmp = nameA.localeCompare(nameB, 'ar', { sensitivity: 'base' });
        return sortOrder === 'asc' ? cmp : -cmp;
      }

      if (sortBy === 'lectures') {
        const countA = a.series.reduce((acc, s) => acc + s.lectures.length, 0);
        const countB = b.series.reduce((acc, s) => acc + s.lectures.length, 0);
        return sortOrder === 'desc' ? countB - countA : countA - countB;
      }

      if (sortBy === 'series') {
        const countA = a.series.length;
        const countB = b.series.length;
        return sortOrder === 'desc' ? countB - countA : countA - countB;
      }

      // Default sorting: Favorites first, then default catalog order
      const aFavIdx = (progress.favoriteScholars || []).indexOf(a.id);
      const bFavIdx = (progress.favoriteScholars || []).indexOf(b.id);
      const aFav = aFavIdx !== -1;
      const bFav = bFavIdx !== -1;
      
      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;
      if (aFav && bFav) return aFavIdx - bFavIdx;
      return 0;
    });
  }, [filteredScholars, sortBy, sortOrder, progress.favoriteScholars]);

  // Sync playback speed
  const [cachedLectures, setCachedLectures] = useState<Set<string>>(new Set());
  
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

  const downloadProgress = React.useMemo(() => {
    const map: Record<string, number> = {};
    downloads.forEach(d => {
      if (d.type === 'lecture') {
        map[d.lectureId || d.id] = d.progress;
      }
    });
    return map;
  }, [downloads]);

  const [savingDeviceLecture, setSavingDeviceLecture] = useState<Record<string, 'loading' | 'success' | null>>({});

  const handleSaveLectureToDevice = async (lecture: Lecture, scholarName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavingDeviceLecture(prev => ({ ...prev, [lecture.id]: 'loading' }));
    
    let url = lecture.audioUrl;

    try {
      let blob: Blob | null = null;

      // 1. Try Cache match (so it is instantaneous!)
      try {
        const cache = await caches.open('lectures-offline-audio-v1');
        const response = await cache.match(lecture.audioUrl);
        if (response) {
          blob = await response.blob();
        }
      } catch (cacheErr) {
        console.warn('Cache lookup failed for lecture direct save:', cacheErr);
      }

      // 2. Fetch if not cached
      if (!blob) {
        try {
          const response = await fetch(url, { mode: 'cors' });
          if (!response.ok) throw new Error(`Fetch fail status ${response.status}`);
          blob = await response.blob();
        } catch (e) {
          console.warn("Direct fetch for download failed due to CORS or network, routing through proxy-download", e);
          const proxyUrl = `/api/proxy-download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(`${lecture.title} - ${scholarName}.mp3`)}`;
          const a = document.createElement('a');
          a.href = proxyUrl;
          a.download = `${lecture.title} - ${scholarName}.mp3`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setSavingDeviceLecture(prev => ({ ...prev, [lecture.id]: 'success' }));
          setTimeout(() => {
            setSavingDeviceLecture(prev => ({ ...prev, [lecture.id]: null }));
          }, 2000);
          return;
        }
      }

      // 3. Download
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `${lecture.title} - ${scholarName}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);

      setSavingDeviceLecture(prev => ({ ...prev, [lecture.id]: 'success' }));
      setTimeout(() => {
        setSavingDeviceLecture(prev => ({ ...prev, [lecture.id]: null }));
      }, 2000);
    } catch (err) {
      console.error('Failed to save lecture as MP3:', err);
      // Failsafe fallback
      try {
        const proxyUrl = `/api/proxy-download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(`${lecture.title} - ${scholarName}.mp3`)}`;
        window.open(proxyUrl, '_blank', 'noopener,noreferrer');
      } catch (e) {}
      setSavingDeviceLecture(prev => ({ ...prev, [lecture.id]: null }));
    }
  };

  // Load cache size
  useEffect(() => {
    const loadCacheSize = async () => {
      const size = await lectureCacheService.getTotalCacheSize();
      setCacheSize(size);
    };
    loadCacheSize();
  }, [cachedLectures]);

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
        if (d.type === 'lecture' && d.status === 'completed' && d.lectureId) {
          cached.add(d.lectureId);
        }
      });
      setCachedLectures(prev => {
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

  const handleDownloadToggle = async (lecture: Lecture, series: LectureSeries, scholar: Scholar) => {
    const downloadId = `lecture-${lecture.id}`;

    if (downloading[lecture.id]) {
      cancelDownload(downloadId);
      return;
    }

    if (cachedLectures.has(lecture.id)) {
      // Remove from cache
      await lectureCacheService.removeCachedAudio(lecture.audioUrl);
      setCachedLectures(prev => {
        const next = new Set(prev);
        next.delete(lecture.id);
        return next;
      });
      return;
    }

    // Trigger download globally
    startDownloadLecture(lecture.id, lecture.title, scholar.name, lecture.audioUrl, 'lecture');
  };

  const handlePlay = async (lecture: Lecture) => {
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

    if (cachedLectures.has(lecture.id)) {
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
        subtitle: selectedScholar?.name || 'الشيخ محمد حسين يعقوب',
        audioUrl: srcUrl,
        originalUrl: lecture.audioUrl,
        type: 'lecture',
        scholarId: selectedScholar?.id
      });
    } catch (err) {
      console.error("Audio setup error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearAllCache = async () => {
    const confirmed = window.confirm('هل أنت متأكد من حذف جميع الملفات الصوتية المحملة؟');
    if (confirmed) {
      await lectureCacheService.clearAllCache();
      setCachedLectures(new Set());
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
                  <div className="w-10 h-10 rounded-2xl bg-[#0b4ec2]/10 dark:bg-[#0b4ec2]/20 flex items-center justify-center text-[#0b4ec2] dark:text-[#3b82f6]">
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
                    <FastForward size={18} className="text-[#3b82f6]" />
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
                            ? "bg-[#0b4ec2] text-white shadow-lg shadow-[#0b4ec2]/30"
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
                    <div className="w-10 h-10 rounded-xl bg-[#0b4ec2]/10 dark:bg-[#0b4ec2]/20 flex items-center justify-center text-[#0b4ec2] dark:text-[#3b82f6]">
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
                      settings.audioAutoAdvance ? "bg-[#0b4ec2]" : "bg-slate-300 dark:bg-slate-700"
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
                    {sleepTimerRemaining !== null && sleepTimerRemaining > 0 && (
                      <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-lg animate-pulse mr-auto">
                        متبقي: {Math.floor(sleepTimerRemaining / 60)}:{(sleepTimerRemaining % 60).toString().padStart(2, '0')}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[0, 5, 15, 30, 45, 60].map((mins) => (
                      <button
                        key={mins}
                        onClick={() => {
                          if (mins === 0) {
                            setSleepTimerRemaining(null);
                          } else {
                            setSleepTimerRemaining(mins * 60);
                          }
                        }}
                        className={cn(
"px-4 py-2 rounded-xl text-sm font-bold transition-all transform transition-all duration-75 active:scale-[0.95] active:opacity-80",
                          (mins === 0 && sleepTimerRemaining === null) || (mins > 0 && sleepTimerRemaining === mins * 60)
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
                    <CloudDownload size={18} className="text-[#3b82f6]" />
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
                        className="h-full bg-[#0b4ec2] rounded-full"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-[#0b4ec2]/5 dark:bg-[#0b4ec2]/10 p-4 rounded-2xl border border-[#0b4ec2]/20 dark:border-[#0b4ec2]/30">
                   <div className="flex items-start gap-3">
                     <Info size={18} className="text-[#3b82f6] shrink-0 mt-0.5" />
                     <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
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
            if (selectedScholarId) {
              setSelectedScholarId(null);
              setSelectedSeries(null);
              setShowFavoritesOnly(false);
            } else {
              goBack('/audio-library');
            }
          }} />
          <div>
            <h1 className={cn(
              "text-xl font-black bg-clip-text text-transparent mr-2",
              isDarkTheme ? "bg-gradient-to-l from-[#3b82f6] to-[#0b4ec2]" : "bg-gradient-to-l from-[#0b4ec2] to-[#0a2540]"
            )}>
              {selectedScholar ? "الدروس والمحاضرات" : "العلماء والدعاة"}
            </h1>
            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mr-2">
              {selectedScholar 
                ? `المكتبة الصوتية • ${selectedScholar.series.reduce((sum, sr) => sum + sr.lectures.length, 0)} درس`
                : `المكتبة الصوتية • ${SCHOLARS.length} شيوخ • ${totalLecturesCount} محاضرة`
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
          <div className="absolute inset-0 bg-gradient-to-tr from-[#0b4ec2]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <SlidersHorizontal size={22} className="relative z-10" />
        </button>
      </div>

      <AnimatePresence mode="wait">
        {!selectedScholar ? (
          <motion.div
            key="scholars"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex flex-col gap-3"
          >
            {/* Search and Favorites Bar */}
            <div className="flex flex-col gap-4 mb-4">
              {/* Favorite Scholars Navigation Entry Point */}
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => navigate('/lectures-audio/favorites')}
                className="p-5 rounded-[32px] bg-gradient-to-r from-amber-500/10 to-amber-600/10 border border-amber-500/20 flex items-center justify-between group overflow-hidden relative shadow-sm"
              >
                <div className="absolute right-0 top-0 w-24 h-full bg-amber-500/5 rotate-12 translate-x-8 pointer-events-none" />
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-110 group-hover:rotate-6 transition-transform">
                    <Sparkles size={28} className="fill-current" />
                  </div>
                  <div className="text-right">
                    <h2 className="text-lg font-black text-slate-800 dark:text-white">المفضلة</h2>
                    <p className="text-xs font-bold text-slate-500">ادخل لعرض قائمة مفضلاتك</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 relative z-10">
                  {(progress.favorites || []).length > 0 && (
                    <div className="bg-amber-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-sm animate-pulse">
                      {(progress.favorites || []).length} عنصر
                    </div>
                  )}
                  <div className="w-10 h-10 rounded-full bg-white/50 dark:bg-slate-800/50 flex items-center justify-center text-amber-600 group-hover:-translate-x-1 transition-transform">
                    <ChevronLeft size={20} />
                  </div>
                </div>
              </motion.button>

              <div>
                <AudioSearchAutocomplete
                  searchQuery={searchQuery}
                  onSearchChange={(q) => setSearchQuery(q)}
                  placeholder="ابحث باسم الشيخ، السلسلة، أو عنوان الدرس..."
                  isDarkTheme={isDarkTheme}
                  onSelectScholar={(scholarId) => {
                    const found = SCHOLARS.find(s => s.id === scholarId);
                    if (found) setSelectedScholarId(found.id);
                  }}
                  onSelectReciter={(reciterId) => navigate(`/quran-audio/${reciterId}`)}
                  onSelectLecture={(lecture) => {
                    const foundScholar = SCHOLARS.find(s => s.name === lecture.scholarName);
                    if (foundScholar) {
                      setSelectedScholarId(foundScholar.id);
                      setSearchQuery(lecture.title);
                    } else {
                      setSearchQuery(lecture.title);
                    }
                  }}
                />
              </div>
            </div>

            {/* Sorting & Filtering Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-100/90 dark:bg-slate-900/90 p-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm backdrop-blur-sm mb-3">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                <span className="text-xs font-black text-slate-500 dark:text-slate-400 flex items-center gap-1.5 px-1 shrink-0">
                  <SlidersHorizontal size={14} className="text-[#0b4ec2] dark:text-blue-400" />
                  <span>ترتيب حسب:</span>
                </span>

                <button
                  onClick={() => setSortBy('default')}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5",
                    sortBy === 'default'
                      ? "bg-[#0b4ec2] text-white shadow-sm"
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
                      ? "bg-[#0b4ec2] text-white shadow-sm"
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
                    if (sortBy === 'lectures') {
                      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortBy('lectures');
                      setSortOrder('desc');
                    }
                  }}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5",
                    sortBy === 'lectures'
                      ? "bg-[#0b4ec2] text-white shadow-sm"
                      : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  )}
                >
                  <BookOpen size={12} />
                  <span>الأكثر محاضرات</span>
                  {sortBy === 'lectures' && (
                    <span className="text-[10px] font-black bg-white/20 px-1 rounded">
                      {sortOrder === 'desc' ? '▼' : '▲'}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => {
                    if (sortBy === 'series') {
                      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortBy('series');
                      setSortOrder('desc');
                    }
                  }}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5",
                    sortBy === 'series'
                      ? "bg-[#0b4ec2] text-white shadow-sm"
                      : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  )}
                >
                  <Mic2 size={12} />
                  <span>الأكثر سلاسل</span>
                  {sortBy === 'series' && (
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
                    ? "bg-amber-500 text-white shadow-sm"
                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-amber-500 border border-slate-200/50 dark:border-slate-700/50"
                )}
              >
                <Heart size={13} className={showFavoritesOnly ? "fill-current" : ""} />
                <span>المفضلة فقط</span>
              </button>
            </div>

            {/* List Header */}
            <div className="flex items-center justify-between px-1 mt-1 mb-2">
              <h2 className="text-sm font-black text-slate-800 dark:text-slate-200">
                {searchQuery ? `نتائج البحث (${sortedScholars.length})` : `جميع الشيوخ والدعاة (${sortedScholars.length})`}
              </h2>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs font-bold text-[#0b4ec2] dark:text-blue-400 hover:underline"
                >
                  إلغاء البحث
                </button>
              )}
            </div>

            {sortedScholars.length === 0 && searchQuery && (
              <div className="flex flex-col items-center justify-center py-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 my-4">
                <Search size={32} className="text-slate-400 mb-2 opacity-50" />
                <p className="text-slate-600 dark:text-slate-400 text-sm font-bold">لم نجد نتائج مطابقة لـ "{searchQuery}"</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-3 px-4 py-2 text-xs font-black text-[#0b4ec2] bg-blue-50 dark:bg-blue-950/40 rounded-xl hover:bg-blue-100 transition-colors"
                >
                  عرض جميع الشيوخ
                </button>
              </div>
            )}

            {sortedScholars
              .map((scholar, idx) => {
                const isFavorite = (progress.favoriteScholars || []).includes(scholar.id);
                return (
              <motion.div
                key={scholar.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => setSelectedScholarId(scholar.id)}
                className={cn(
                  "group rounded-2xl border px-5 py-4 cursor-pointer flex justify-between items-center transform transition-colors active:scale-[0.98] active:bg-slate-100 dark:active:bg-slate-800",
                  isDarkTheme 
                    ? "bg-slate-900 border-slate-800 hover:bg-slate-800 hover:border-slate-700 hover:shadow-lg hover:shadow-[#172554]/10" 
                    : "bg-white border-slate-200 hover:shadow-md hover:border-[#bfdbfe]"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className="relative w-14 h-14 rounded-[1.2rem] bg-gradient-to-br from-[#0a2540] via-[#0b4ec2] to-[#3b82f6] p-[2px] shadow-[0_0_30px_rgba(11,78,194,0.6)] group-hover:shadow-[0_0_45px_rgba(11,78,194,0.8)] transform transition-all duration-75 active:scale-[0.85] active:opacity-70 group-hover:-translate-y-1 group-hover:scale-105 shrink-0">
                    <span className="absolute -top-1.5 -right-1.5 bg-slate-900/90 dark:bg-white text-white dark:text-slate-900 rounded-lg px-2 py-0.5 text-[9px] font-black z-20 flex items-center justify-center shadow-lg border border-white/20 dark:border-slate-800">
                      {idx + 1}
                    </span>
                    <div className="w-full h-full rounded-[1.1rem] bg-gradient-to-br from-white/30 to-white/5 flex items-center justify-center backdrop-blur bg-[#0b4ec2]/20 border border-white/20 relative overflow-hidden">
                       <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></div>
                       <Mic2 className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] relative z-10 group-hover:rotate-6 transition-transform duration-500" size={26} strokeWidth={2.5} />
                    </div>
                    {isFavorite && (
                      <div className="absolute -bottom-1.5 -right-1.5 bg-gradient-to-br from-amber-400 to-amber-600 border-2 border-white dark:border-slate-900 rounded-full w-5 h-5 flex items-center justify-center shadow-md shadow-amber-500/40 z-20">
                        <Sparkles size={10} className="fill-white text-white drop-shadow-sm" />
                      </div>
                    )}
                  </div>
                  <h3 className="font-bold text-[17px] text-slate-800 dark:text-slate-100 group-hover:text-[#1e40af] dark:group-hover:text-fuchsia-300 transition-colors duration-300">
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
                        subtitle: 'شيخ وداعية',
                        route: '/lectures-audio'
                      });
                    }}
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300",
                      isFavorite 
                        ? "bg-amber-100 text-amber-500 dark:bg-amber-900/30" 
                        : "bg-slate-50 text-slate-400 hover:text-amber-400 dark:bg-slate-800"
                    )}
                  >
                    <Sparkles size={16} className={isFavorite ? "fill-current" : ""} />
                  </button>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-50 dark:bg-slate-800 group-hover:bg-[#0b4ec2]/10 dark:group-hover:bg-[#0b4ec2]/25 transition-colors duration-300">
                    <ChevronRight size={18} className="text-slate-400 group-hover:text-[#0b4ec2] dark:group-hover:text-[#3b82f6] transition-colors duration-300" />
                  </div>
                </div>
              </motion.div>
            )})}
            {SCHOLARS.filter(scholar => !showFavoritesOnly || (progress.favoriteScholars || []).includes(scholar.id)).length === 0 && (
              <EmptyStatePlaceholder
                title="لا يوجد شيوخ في المفضلة"
                description="لم تقم بإضافة أي شيوخ للمفضلة بعد."
                variant="empty"
              />
            )}
          </motion.div>
        ) : (
          <motion.div
            key="series"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Scholar Information Header */}
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="relative w-14 h-14 rounded-[1.2rem] bg-gradient-to-br from-[#0a2540] via-[#0b4ec2] to-[#3b82f6] p-[2px] shadow-[0_8px_16px_-6px_rgba(11,78,194,0.5)] shrink-0">
                  <div className="w-full h-full rounded-[1.1rem] bg-gradient-to-br from-white/30 to-white/5 flex items-center justify-center backdrop-blur bg-[#0b4ec2]/20 border border-white/20 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></div>
                    <Mic2 className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] relative z-10" size={26} strokeWidth={2.5} />
                  </div>
                </div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">{selectedScholar.name}</h2>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-5">{selectedScholar.description}</p>
              
              <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-xs font-bold text-slate-600 dark:text-slate-300 transform transition-all duration-75 active:scale-[0.95] active:opacity-80">
                    <Mic2 size={14} className="text-slate-400" />
                    <span>{selectedScholar.series.length} سلسلة علمية</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0b4ec2]/5 dark:bg-[#0b4ec2]/15 text-xs font-bold text-[#0b4ec2] dark:text-[#3b82f6] border border-[#0b4ec2]/20 dark:border-[#0b4ec2]/30 transform transition-all duration-75 active:scale-[0.95] active:opacity-80">
                    <BookOpen size={14} className="text-[#3b82f6]" />
                    <span>{selectedScholar.series.reduce((acc, curr) => acc + curr.lectures.length, 0)} درس ومحاضرة</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-xs font-bold text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-800/30 transform transition-all duration-75 active:scale-[0.95] active:opacity-80">
                    <Heart size={14} className="fill-current text-rose-500" />
                    <span>{selectedScholar.likes.toLocaleString('ar-EG')} إعجاب</span>
                  </div>
                </div>
                {/* Favorites Toggle for Lectures */}
                <button
                  onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                  className={cn(
"flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 transform transition-all duration-75 active:scale-[0.95] active:opacity-80",
                    showFavoritesOnly
                      ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                  )}
                >
                  <Sparkles size={14} className={showFavoritesOnly ? "fill-current" : ""} />
                  <span>دروس مفضلة</span>
                </button>
              </div>
            </motion.div>

            {selectedScholar.series.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center opacity-70">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                  <Mic2 size={32} className="text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">قريباً</h3>
                <p className="text-sm text-slate-500 mt-2">سيتم إضافة سلاسل علمية للشيخ قريباً بإذن الله.</p>
              </div>
            ) : (
              (() => {
                const mappedSeries = selectedScholar.series.map(s => {
                  const visibleLectures = s.lectures.filter(l => 
                    !showFavoritesOnly || (progress.favoriteLectures || []).includes(l.id)
                  );
                  return { ...s, visibleLectures };
                }).filter(s => s.visibleLectures.length > 0);

                if (mappedSeries.length === 0) {
                  return (
                    <EmptyStatePlaceholder
                      title="لا يوجد دروس مفضلة"
                      description="لم تقم بإضافة أي درس للمفضلة لهذا الشيخ."
                      variant="empty"
                    />
                  );
                }

                return mappedSeries.map((series, idx) => (
                  <motion.div
                  key={series.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={cn(
                    "rounded-3xl border overflow-hidden transition-all duration-300",
                    isDarkTheme ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-xl shadow-slate-200/50",
                    selectedSeries === series.id ? "ring-2 ring-[#0b4ec2]" : ""
                  )}
                >
                  {/* Series Header */}
                  <div 
                    onClick={() => setSelectedSeries(selectedSeries === series.id ? null : series.id)}
                    className="p-5 cursor-pointer flex gap-4 items-center transform transition-all duration-75 active:scale-[0.98] active:bg-slate-100 dark:active:bg-slate-800"
                  >
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-colors",
                      selectedSeries === series.id 
                        ? "bg-[#0b4ec2] text-white" 
                        : "bg-[#0b4ec2]/10 dark:bg-[#0b4ec2]/20 text-[#3b82f6]"
                    )}>
                      <PlayCircle size={28} className={selectedSeries === series.id ? "fill-current" : ""} />
                    </div>
                    <div className="flex-1 text-right">
                      <h3 className="font-black text-lg text-slate-900 dark:text-white leading-tight">
                        {series.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                        {series.description}
                      </p>
                      <p className="text-[10px] font-bold text-[#0b4ec2] dark:text-[#3b82f6] mt-2">
                        {series.visibleLectures.length} حلقات
                      </p>
                    </div>
                  </div>

                  {/* Expanded Lectures List */}
                  <AnimatePresence>
                    {selectedSeries === series.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 pt-0 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
                          <div className="space-y-2 mt-4">
                            {series.visibleLectures.map((lecture, lIdx) => {
                              const isThisPlaying = playingAudio === lecture.id;
                              
                              let time = 0;
                              let dur = parseDurationToSeconds(lecture.duration);
                              let completed = false;

                              if (isThisPlaying) {
                                time = currentTime;
                                if (globalAudioDuration > 0) dur = globalAudioDuration;
                                completed = (dur > 0 && time >= dur - 8) || (dur > 0 && (time / dur) > 0.98);
                              } else {
                                const savedItem = savedPositions[lecture.id];
                                if (savedItem) {
                                  time = savedItem.time || 0;
                                  if (savedItem.duration) dur = savedItem.duration;
                                  completed = !!savedItem.completed || (dur > 0 && time >= dur - 8);
                                }
                              }

                              const percent = completed ? 100 : (dur > 0 && time > 0 ? Math.min(100, Math.max(0, (time / dur) * 100)) : 0);

                              return (
                                <div 
                                  key={lecture.id}
                                  className={cn(
                                    "flex flex-col p-3.5 rounded-2xl transition-all border",
                                    isThisPlaying 
                                      ? "bg-[#0b4ec2]/10 dark:bg-[#0b4ec2]/25 border-[#0b4ec2]/35 dark:border-[#0b4ec2]/50 shadow-md shadow-[#0b4ec2]/5" 
                                      : "bg-white dark:bg-slate-800/90 border-slate-100 dark:border-slate-800/80 shadow-sm hover:border-slate-200 dark:hover:border-slate-700"
                                  )}
                                >
                                  <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-3">
                                      <button
                                        onClick={() => handlePlay(lecture)}
                                        className={cn(
                                          "w-10 h-10 rounded-full flex items-center justify-center transform transition-all duration-75 active:scale-[0.85] active:opacity-70 shrink-0",
                                          isThisPlaying 
                                            ? "bg-[#0b4ec2] text-white shadow-lg shadow-[#0b4ec2]/30" 
                                            : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-[#0b4ec2]/15 hover:text-[#0b4ec2]"
                                        )}
                                      >
                                        {isThisPlaying && isLoading ? (
                                          <Loader2 size={20} className="animate-spin" />
                                        ) : isThisPlaying && isPlaying ? (
                                          <PauseCircle size={20} className="fill-current" />
                                        ) : (
                                          <PlayCircle size={20} className="ml-0.5" />
                                        )}
                                      </button>
                                      <div className="text-right">
                                        <h5 className={cn(
                                          "text-sm font-black text-slate-800 dark:text-white leading-snug",
                                          isThisPlaying && "text-[#0b4ec2] dark:text-[#3b82f6]"
                                        )}>
                                          {lIdx + 1}. {lecture.title}
                                        </h5>
                                        <div className="flex items-center gap-2 mt-1 text-[10px] font-bold text-slate-500">
                                          <Clock size={12} />
                                          <span>{lecture.duration}</span>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {isThisPlaying && isPlaying && (
                                      <div className="flex gap-1 items-end h-4 mx-2">
                                        <motion.div animate={{ height: [4, 12, 4] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1 bg-[#0b4ec2] rounded-full" />
                                        <motion.div animate={{ height: [8, 16, 8] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1 bg-[#0b4ec2] rounded-full" />
                                        <motion.div animate={{ height: [4, 10, 4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1 bg-[#0b4ec2] rounded-full" />
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
                                            subtitle: selectedScholar?.name || 'الشيخ',
                                            route: '/lectures-audio'
                                          });
                                        }}
                                        className={cn(
                                          "w-10 h-10 rounded-xl relative overflow-hidden flex items-center justify-center transform transition-all duration-75 active:scale-[0.85] active:opacity-70 border shrink-0",
                                          (progress.favoriteLectures || []).includes(lecture.id)
                                            ? "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/50 text-rose-500 shadow-sm shadow-rose-500/10"
                                            : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-rose-500 hover:border-rose-200 dark:hover:border-rose-900/50"
                                        )}
                                      >
                                        <Heart size={18} className={(progress.favoriteLectures || []).includes(lecture.id) ? "fill-current" : ""} />
                                      </button>
                                      <button
                                        onClick={(e) => handleSaveLectureToDevice(lecture, selectedScholar?.name || 'الشيخ', e)}
                                        disabled={savingDeviceLecture[lecture.id] === 'loading'}
                                         className={cn(
                                           "w-10 h-10 rounded-xl relative flex items-center justify-center transform transition-all duration-75 active:scale-[0.85] active:opacity-70 border shadow-sm shrink-0",
                                           savingDeviceLecture[lecture.id] === 'success'
                                             ? "bg-[#0b4ec2] border-[#0b4ec2] text-white"
                                             : savingDeviceLecture[lecture.id] === 'loading'
                                               ? "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-[#0b4ec2]"
                                               : "bg-[#0b4ec2]/5 dark:bg-[#0b4ec2]/15 border-[#0b4ec2]/20 dark:border-[#0b4ec2]/35 text-[#3b82f6] hover:bg-[#0b4ec2] dark:hover:bg-[#0b4ec2] hover:text-white dark:hover:text-white hover:border-[#0b4ec2]"
                                         )}
                                         title="حفظ كملف MP3 على الهاتف"
                                       >
                                         {savingDeviceLecture[lecture.id] === 'loading' ? (
                                           <Loader2 size={16} className="animate-spin" strokeWidth={2.5} />
                                         ) : savingDeviceLecture[lecture.id] === 'success' ? (
                                           <Check size={16} strokeWidth={2.5} />
                                         ) : (
                                           <FileDown size={16} strokeWidth={2.5} />
                                         )}
                                       </button>

                                       <button
                                         onClick={(e) => {
                                           e.stopPropagation();
                                           handleDownloadToggle(lecture, series, selectedScholar);
                                         }}
                                         className={cn(
                                           "w-10 h-10 rounded-xl relative overflow-hidden flex items-center justify-center transform transition-all duration-75 active:scale-[0.85] active:opacity-70 border shrink-0",
                                           downloading[lecture.id]
                                             ? "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-[#0b4ec2] hover:text-rose-500 hover:bg-rose-50"
                                             : cachedLectures.has(lecture.id)
                                               ? "bg-[#0b4ec2]/10 dark:bg-[#0b4ec2]/20 border-[#0b4ec2]/30 dark:border-[#0b4ec2]/40 text-[#0b4ec2] dark:text-[#3b82f6] hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200"
                                               : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-[#0b4ec2] hover:border-[#0b4ec2]/30 dark:hover:border-[#0b4ec2]/40"
                                         )}
                                       >
                                        {downloading[lecture.id] ? (
                                          <>
                                            <div 
                                              className="absolute bottom-0 left-0 right-0 bg-[#0b4ec2]/20 dark:bg-[#0b4ec2]/40 transition-all duration-300"
                                              style={{ height: `${downloadProgress[lecture.id] || 0}%` }}
                                            />
                                            <Trash2 size={18} className="relative z-10" />
                                          </>
                                        ) : cachedLectures.has(lecture.id) ? (
                                          <span className="relative z-10 flex items-center justify-center group-hover:hidden">
                                            <CheckCircle2 size={20} />
                                          </span>
                                        ) : (
                                          <CloudDownload size={20} />
                                        )}
                                      </button>
                                    </div>
                                  </div>

                                  {/* Progress Bar & Saved Position Indicator */}
                                  {(percent > 0 || completed) && (
                                    <div className="w-full mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
                                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1.5">
                                        <div className="flex items-center gap-1.5">
                                          {completed ? (
                                            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-black bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200/50 dark:border-emerald-800/40">
                                              <CheckCircle2 size={12} className="text-emerald-500" />
                                              مستمعة بالكامل
                                            </span>
                                          ) : (
                                            <span className="inline-flex items-center gap-1 text-[#0b4ec2] dark:text-[#3b82f6] font-black bg-[#0b4ec2]/5 dark:bg-[#0b4ec2]/20 px-2 py-0.5 rounded-md border border-[#0b4ec2]/15 dark:border-[#0b4ec2]/30">
                                              <RotateCcw size={11} className="text-[#0b4ec2] dark:text-[#3b82f6]" />
                                              موقوفة عند {formatSecondsToTime(time)}
                                            </span>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-2">

                                          <span className="text-slate-400 dark:text-slate-500 font-mono text-[10px] font-black">
                                            {Math.round(percent)}%
                                          </span>
                                          {time > 0 && (
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                clearTrackPlaybackPosition(lecture.id);
                                                if (isThisPlaying) {
                                                  seek(0);
                                                }
                                              }}
                                              className="p-1 text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                                              title="إعادة من البداية"
                                            >
                                              <RotateCcw size={11} />
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                      <div className="w-full bg-slate-100 dark:bg-slate-700/60 rounded-full h-1.5 overflow-hidden relative">
                                        <div 
                                          className={cn(
                                            "h-full transition-all duration-300 rounded-full",
                                            completed 
                                              ? "bg-emerald-500" 
                                              : "bg-gradient-to-r from-[#0b4ec2] via-[#3b82f6] to-[#60a5fa]"
                                          )}
                                          style={{ width: `${percent}%` }}
                                        />
                                      </div>
                                    </div>
                                  )}
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

export const LecturesAudioHub = React.memo(LecturesAudioHubComponent);
export default LecturesAudioHub;
