import React, { useState, useRef } from 'react';
import { useGlobalAudio } from '../context/GlobalAudioContext';
import { 
  Play, Pause, Square, ChevronDown, Volume2, FastForward, Rewind, 
  Timer, Moon, User, BookOpen, Check, SkipForward, SkipBack, Search, ListMusic, X, PlayCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useAppContext } from '../AppContext';
import { RECITERS } from '../reciters';
import { getSurahAudioUrl } from '../services/quranAudioUrlService';
import { SURAH_NAMES as surahNames } from '../utils/quranUtils';
import { SCHOLARS, Scholar } from '../data/lectures';
import { TAFSIR_SCHOLARS, TafsirScholar } from '../data/tafsir';

import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { safeLocalStorageGetItem, safeLocalStorageSetItem, safeLocalStorageRemoveItem } from "../utils/storage";

export const GlobalAudioBar: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    progress,
    duration,
    currentTime,
    playbackRate,
    sleepTimer,
    playTrack,
    pauseTrack,
    resumeTrack,
    stopTrack,
    seek,
    setPlaybackRate,
    setSleepTimer,
    playNextTrack,
    playPrevTrack,
    playSurahByNumber,
    autoPlayNext,
    setAutoPlayNext,
    nextTrackCountdown,
    cancelNextTrackCountdown,
    skipNextTrackCountdown
  } = useGlobalAudio();

  const { settings } = useAppContext();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showTimerMenu, setShowTimerMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<'nowplaying' | 'playlist'>('nowplaying');
  const [playlistSubTab, setPlaylistSubTab] = useState<'surahs' | 'reciters'>('surahs');
  const [searchQuery, setSearchQuery] = useState('');
  const [reciterSearchQuery, setReciterSearchQuery] = useState('');

  const [lectureSubTab, setLectureSubTab] = useState<'lectures' | 'scholars'>('lectures');
  const [tafsirSubTab, setTafsirSubTab] = useState<'tafsirs' | 'scholars'>('tafsirs');
  const [lectureSearchQuery, setLectureSearchQuery] = useState('');
  const [scholarSearchQuery, setScholarSearchQuery] = useState('');

  // Find active scholar and active series/lecture
  const activeScholar = currentTrack?.type === 'lecture'
    ? (currentTrack.scholarId 
        ? SCHOLARS.find(s => s.id === currentTrack.scholarId)
        : SCHOLARS.find(s => s.series.some(ser => ser.lectures.some(l => l.id === currentTrack.id))))
    : null;

  const activeTafsirScholar = currentTrack?.type === 'tafsir'
    ? (currentTrack.scholarId
        ? TAFSIR_SCHOLARS.find(ts => ts.id === currentTrack.scholarId)
        : TAFSIR_SCHOLARS.find(ts => ts.surahs.some(sur => sur.tracks.some(tr => tr.id === currentTrack.id))))
    : null;

  const [selectedScholarState, setSelectedScholarState] = useState<Scholar | null>(null);
  const [selectedTafsirScholarState, setSelectedTafsirScholarState] = useState<TafsirScholar | null>(null);

  React.useEffect(() => {
    if (activeScholar) {
      setSelectedScholarState(activeScholar);
    }
  }, [activeScholar, currentTrack]);

  React.useEffect(() => {
    if (activeTafsirScholar) {
      setSelectedTafsirScholarState(activeTafsirScholar);
    }
  }, [activeTafsirScholar, currentTrack]);

  // Overlay container boundaries for Framer Motion dragging constraints
  const dragContainerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  // Floating position state to persist drag coordinates (constrained to safe bounds)
  const [floatingPos, setFloatingPos] = useState<{ x: number; y: number }>(() => {
    try {
      const saved = safeLocalStorageGetItem('believer_audio_floating_pos');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          // Bounded load to prevent the floating bar from rendering offscreen
          const maxX = Math.max(0, window.innerWidth - 80);
          const maxY = 120; // safe maximum bottom push
          const minY = -Math.max(0, window.innerHeight - 160); // safe maximum top pull
          return {
            x: Math.min(Math.max(parsed.x, -20), maxX),
            y: Math.min(Math.max(parsed.y, minY), maxY)
          };
        }
      }
    } catch (e) {}
    return { x: 0, y: 0 };
  });

  const [audioError, setAudioError] = useState<string | null>(null);

  // Monitor window resize to pull the floating bar back if screen shrinks/rotates
  React.useEffect(() => {
    const handleResize = () => {
      setFloatingPos(prev => {
        const maxX = Math.max(0, window.innerWidth - 80);
        const maxY = 120;
        const minY = -Math.max(0, window.innerHeight - 160);
        
        const newX = Math.min(Math.max(prev.x, -20), maxX);
        const newY = Math.min(Math.max(prev.y, minY), maxY);
        
        if (newX !== prev.x || newY !== prev.y) {
          return { x: newX, y: newY };
        }
        return prev;
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  React.useEffect(() => {
    const handleError = (e: any) => {
      if (e.detail?.message) {
        setAudioError(e.detail.message);
        setTimeout(() => setAudioError(null), 5000);
      }
    };
    window.addEventListener('global_audio_error', handleError);
    return () => window.removeEventListener('global_audio_error', handleError);
  }, []);

  if (!currentTrack) return null;

  // Find active reciter metadata
  const activeReciter = currentTrack.type === 'quran' && currentTrack.reciterId
    ? RECITERS.find(r => r.id === Number(currentTrack.reciterId))
    : null;

  // List available surahs for active reciter
  const getAvailableSurahNumbers = () => {
    if (!activeReciter) return [];
    if ((activeReciter as any).surahUrls) {
      return Object.keys((activeReciter as any).surahUrls).map(Number).sort((a, b) => a - b);
    }
    return Array.from({ length: 114 }, (_, i) => i + 1);
  };

  const availableSurahNumbers = getAvailableSurahNumbers();

  const selectReciterAndPlay = async (newReciter: typeof RECITERS[0]) => {
    const surahNum = currentTrack?.surahNumber || 1;
    const surahName = surahNames[surahNum - 1] || `${surahNum}`;
    const url = getSurahAudioUrl(newReciter, surahNum);

    let finalUrl = url;
    try {
      const { audioCacheService } = await import('../services/audioCacheService');
      const cachedUrl = (await audioCacheService.getCachedAudioUrlBySurah(newReciter.id, surahNum))
        || (await audioCacheService.getCachedAudioUrl(url));
      if (cachedUrl) finalUrl = cachedUrl;
    } catch (err) {
      console.warn('Reciter swap offline cache resolve failed:', err);
    }

    playTrack({
      id: `quran-${newReciter.id}-${surahNum}`,
      title: `سورة ${surahName}`,
      subtitle: newReciter.name,
      audioUrl: finalUrl,
      originalUrl: url,
      type: 'quran',
      reciterId: newReciter.id,
      surahNumber: surahNum
    });
  };

  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds)) return '00:00';
    const hrs = Math.floor(timeInSeconds / 3600);
    const mins = Math.floor((timeInSeconds % 3600) / 60);
    const secs = Math.floor(timeInSeconds % 60);

    const pad = (num: number) => num.toString().padStart(2, '0');

    if (hrs > 0) {
      return `${hrs}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
  };

  const handlePlayNext = () => {
    if (settings.hapticTasbihEnabled !== false) {
      Haptics.impact({ style: ImpactStyle.Light }).catch(() => {
        if ("vibrate" in navigator) navigator.vibrate(20);
      });
    }
    playNextTrack();
  };

  const handlePlayPrev = () => {
    if (settings.hapticTasbihEnabled !== false) {
      Haptics.impact({ style: ImpactStyle.Light }).catch(() => {
        if ("vibrate" in navigator) navigator.vibrate(20);
      });
    }
    playPrevTrack();
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const clickPercent = clickX / width;
    const newTime = clickPercent * duration;
    seek(newTime);
  };

  const skipForward = () => {
    const newTime = Math.min(currentTime + 10, duration);
    seek(newTime);
  };

  const skipBackward = () => {
    const newTime = Math.max(currentTime - 10, 0);
    seek(newTime);
  };

  const sleepTimerOptions = [
    { label: 'إيقاف المؤقت', value: null },
    { label: '5 دقائق', value: 5 },
    { label: '15 دقيقة', value: 15 },
    { label: '30 دقيقة', value: 30 },
    { label: '45 دقيقة', value: 45 },
    { label: '60 دقيقة', value: 60 },
  ];

  const speedOptions = [0.75, 1, 1.25, 1.5, 2];

  // SVG circular progress ring calculations
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(Math.max(progress, 0), 100) / 100) * circumference;

  return (
    <>
      {/* 1. SELF-CONTAINED CSS STYLING FOR AUDIO ANIMATIONS */}
      <style>{`
        @keyframes soundWave {
          0%, 100% { height: 4px; }
          50% { height: 14px; }
        }
        @keyframes rotateDisk {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes ambientGlow {
          0%, 100% { opacity: 0.15; transform: scale(0.95); }
          50% { opacity: 0.35; transform: scale(1.1); }
        }
      `}</style>

      {/* 2. DRAG BOUNDS WRAP_OVERLAY */}
      <div 
        ref={dragContainerRef} 
        className="fixed inset-0 pointer-events-none overflow-hidden z-[45]"
        style={{ direction: 'rtl' }}
      >
        <motion.div
          drag
          dragConstraints={dragContainerRef}
          dragElastic={0.02}
          dragMomentum={false}
          whileHover={isExpanded ? {} : { scale: 1.05 }}
          whileTap={isExpanded ? {} : { cursor: 'grabbing' }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: isExpanded ? 0 : 1, 
            scale: isExpanded ? 0.8 : 1,
            pointerEvents: isExpanded ? 'none' as any : 'auto' as any
          }}
          transition={{ 
            opacity: { duration: 0.25, ease: "easeInOut" },
            scale: { duration: 0.25, ease: "easeInOut" }
          }}
          onDragStart={() => {
            isDraggingRef.current = true;
          }}
          onDragEnd={(_, info) => {
            const newX = floatingPos.x + info.offset.x;
            const newY = floatingPos.y + info.offset.y;

            // Only dismiss when dragged completely outside screen borders (narrow 5px threshold)
            const margin = 5;
            const isDismissed =
              info.point.x < margin ||
              info.point.x > window.innerWidth - margin ||
              info.point.y < margin ||
              info.point.y > window.innerHeight - margin;

            if (isDismissed) {
              stopTrack();
            } else {
              setFloatingPos({ x: newX, y: newY });
              try {
                safeLocalStorageSetItem('believer_audio_floating_pos', JSON.stringify({ x: newX, y: newY }));
              } catch (e) {}
              
              setTimeout(() => {
                isDraggingRef.current = false;
              }, 100);
            }
          }}
          onTap={() => {
            if (!isDraggingRef.current) {
              setIsExpanded(true);
            }
          }}
          className={cn(
            "absolute bottom-24 left-4 pointer-events-auto cursor-grab select-none z-[45]",
            isExpanded ? "pointer-events-none" : ""
          )}
          style={{ 
            x: floatingPos.x, 
            y: floatingPos.y, 
            visibility: isExpanded ? 'hidden' : 'visible' 
          }}
          title="اضغط للفتح، اسحب للنقل، أو اسحب خارج حواف الشاشة تماماً للإغلاق"
        >
          <div className="relative w-16 h-16 flex items-center justify-center">
            
            {/* Rippling Ambient Aura while playing */}
            {isPlaying && (
              <div 
                className={cn(
                  "absolute inset-[-6px] rounded-full blur-md -z-10",
                  currentTrack.type === 'quran' 
                    ? "bg-[#218510]/20" 
                    : currentTrack.type === 'lecture'
                      ? "bg-[#0b4ec2]/35 shadow-[0_0_15px_rgba(11,78,194,0.4)] animate-pulse"
                      : "bg-[#2563eb]/20"
                )}
                style={{
                  animationName: 'ambientGlow',
                  animationDuration: '3s',
                  animationTimingFunction: 'ease-in-out',
                  animationIterationCount: 'infinite'
                }}
              />
            )}

            {/* Main Orb Center Body */}
            <div className="absolute w-[48px] h-[48px] rounded-full bg-slate-950/95 dark:bg-slate-900/95 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.6),inset_0_2px_4px_rgba(255,255,255,0.05)] border border-white/10 flex flex-col items-center justify-center overflow-hidden z-10">
              
              {/* Rotating Disk Avatar */}
              <div 
                className="absolute inset-0 flex items-center justify-center opacity-40"
                style={isPlaying ? {
                  animationName: 'rotateDisk',
                  animationDuration: '12s',
                  animationTimingFunction: 'linear',
                  animationIterationCount: 'infinite'
                } : {}}
              >
                {currentTrack.type === 'quran' ? (
                  <BookOpen size={24} className="text-[#218510]" />
                ) : currentTrack.type === 'lecture' ? (
                  <User size={24} className="text-[#3b82f6]" />
                ) : (
                  <User size={24} className="text-rose-600" />
                )}
              </div>

              {/* Equalizer Wave overlay inside */}
              <div className="relative flex items-end justify-center gap-[2px] h-4 z-20 mt-1">
                <span 
                  className={cn(
                    "w-[2px] rounded-full transition-all duration-300",
                    currentTrack.type === 'quran' 
                      ? "bg-[#218510]" 
                      : currentTrack.type === 'lecture'
                        ? "bg-[#3b82f6]"
                        : "bg-rose-500",
                    isPlaying ? "h-3" : "h-1"
                  )} 
                  style={isPlaying ? {
                    animationName: 'soundWave',
                    animationDuration: '0.8s',
                    animationTimingFunction: 'ease-in-out',
                    animationIterationCount: 'infinite'
                  } : {}} 
                />
                <span 
                  className={cn(
                    "w-[2px] rounded-full transition-all duration-300",
                    currentTrack.type === 'quran' 
                      ? "bg-[#218510]" 
                      : currentTrack.type === 'lecture'
                        ? "bg-[#3b82f6]"
                        : "bg-rose-500",
                    isPlaying ? "h-4.5" : "h-1.5"
                  )} 
                  style={isPlaying ? {
                    animationName: 'soundWave',
                    animationDuration: '0.5s',
                    animationTimingFunction: 'ease-in-out',
                    animationIterationCount: 'infinite',
                    animationDelay: '0.15s'
                  } : {}} 
                />
                <span 
                  className={cn(
                    "w-[2px] rounded-full transition-all duration-300",
                    currentTrack.type === 'quran' 
                      ? "bg-[#218510]" 
                      : currentTrack.type === 'lecture'
                        ? "bg-[#3b82f6]"
                        : "bg-rose-500",
                    isPlaying ? "h-2.5" : "h-0.5"
                  )} 
                  style={isPlaying ? {
                    animationName: 'soundWave',
                    animationDuration: '0.7s',
                    animationTimingFunction: 'ease-in-out',
                    animationIterationCount: 'infinite',
                    animationDelay: '0.3s'
                  } : {}} 
                />
              </div>
            </div>

            {/* SVG Circular Progress Rim */}
            <svg className="absolute inset-0 w-16 h-16 rotate-[-90deg] z-20 pointer-events-none">
              <circle
                cx="32"
                cy="32"
                r={radius}
                className="stroke-white/10 fill-none"
                strokeWidth="2"
              />
              <circle
                cx="32"
                cy="32"
                r={radius}
                className={cn(
                  "fill-none transition-all duration-150 ease-out",
                  currentTrack.type === 'quran' 
                    ? "stroke-[#218510]" 
                    : currentTrack.type === 'lecture'
                      ? "stroke-[#0b4ec2]"
                      : "stroke-rose-600"
                )}
                strokeWidth="2.5"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>

            {/* Sleep Timer Mini HUD Badge (if active) */}
            {sleepTimer !== null && (
              <div className="absolute top-[-14px] left-1/2 transform -translate-x-1/2 bg-indigo-600 border border-indigo-400/20 text-indigo-100 text-[8px] font-bold px-1.5 py-0.5 rounded-full shadow-lg z-30 pointer-events-none flex items-center gap-0.5">
                <Moon size={8} />
                <span>{sleepTimer}د</span>
              </div>
            )}

            {/* Continuous Playback Countdown Pill */}
            {nextTrackCountdown !== null && (
              <div className={cn(
                "absolute right-18 top-1/2 -translate-y-1/2 bg-slate-900 border text-white rounded-2xl py-2 px-3 text-xs shadow-2xl flex items-center gap-2 pr-2.5 z-30 pointer-events-auto shrink-0 whitespace-nowrap",
                currentTrack.type === 'quran' 
                  ? "border-[#218510]/30" 
                  : currentTrack.type === 'lecture'
                    ? "border-[#0b4ec2]/35"
                  : "border-rose-800/30"
              )}>
                <span className={cn(
                  "w-2 h-2 rounded-full animate-pulse shrink-0",
                  currentTrack.type === 'quran' 
                    ? "bg-[#218510]" 
                    : currentTrack.type === 'lecture'
                      ? "bg-[#0b4ec2]"
                      : "bg-rose-700"
                )} />
                <span className="font-arabic font-medium">
                  {currentTrack.type === 'quran' ? 'السورة التالية خلال' : currentTrack.type === 'lecture' ? 'المحاضرة التالية خلال' : 'التفسير التالي خلال'}{' '}
                  <span className={cn(
                    "font-sans font-black text-sm",
                    currentTrack.type === 'quran' 
                      ? "text-[#218510]" 
                      : currentTrack.type === 'lecture'
                        ? "text-[#3b82f6]"
                        : "text-rose-400"
                  )}>
                    {nextTrackCountdown}
                  </span>{' '}
                  ثوانٍ
                </span>
                <div className="flex items-center gap-1 border-r border-slate-700/50 pr-1.5 mr-0.5 shrink-0">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      skipNextTrackCountdown();
                    }}
                    className={cn(
                      "transition-colors p-1",
                      currentTrack.type === 'quran' 
                        ? "text-[#218510] hover:text-[#186a0d]" 
                        : currentTrack.type === 'lecture'
                          ? "text-[#3b82f6] hover:text-blue-300"
                          : "text-rose-400 hover:text-rose-300"
                    )}
                    title="تجاوز ومتابعة الآن"
                  >
                    <FastForward size={14} />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      cancelNextTrackCountdown();
                    }}
                    className="text-rose-400 hover:text-rose-300 transition-colors p-1"
                    title="إلغاء التشغيل المتواصل"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Error Notification Toast for floating orb */}
            <AnimatePresence>
              {audioError && !isExpanded && (
                <motion.div 
                   initial={{ opacity: 0, y: -10 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, scale: 0.9 }}
                   className="absolute top-[-60px] left-1/2 -translate-x-1/2 w-48 bg-rose-600 text-white text-[10px] p-2 rounded-xl text-center shadow-lg pointer-events-none font-bold"
                >
                  {audioError}
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </motion.div>
      </div>

      {/* 3. FULL EXPANDED BOTTOM SHEET DASHBOARD */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed inset-0 bg-slate-950 text-white z-50 flex flex-col p-6 overflow-hidden select-none"
            style={{ direction: 'rtl' }}
          >
            {/* Error Overlay for Expanded state */}
            <AnimatePresence>
              {audioError && (
                 <motion.div 
                   initial={{ opacity: 0, y: -20 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -20 }}
                   className="absolute top-20 left-4 right-4 bg-rose-500/90 backdrop-blur-md text-white text-xs p-3 rounded-2xl text-center shadow-2xl z-50 font-bold border border-rose-400/30"
                 >
                   {audioError}
                 </motion.div>
              )}
            </AnimatePresence>

            {/* Header Area with Tab Switcher */}
            <div className="flex items-center justify-between mb-2 border-b border-white/5 pb-4 shrink-0">
              <button
                onClick={() => setIsExpanded(false)}
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transform transition-all duration-75 active:scale-[0.85] active:opacity-70 focus:outline-none"
              >
                <ChevronDown size={24} />
              </button>

              <div className="flex bg-slate-900 border border-white/10 p-1 rounded-full text-xs font-bold shadow-inner relative z-10">
                <button
                  onClick={() => setActiveTab('nowplaying')}
                  className={cn(
"px-4 py-2 rounded-full transition-all duration-200 transform transition-all duration-75 active:scale-[0.95] active:opacity-80",
                    activeTab === 'nowplaying' 
                      ? (currentTrack.type === 'lecture' ? "bg-[#2563eb]" : currentTrack.type === 'tafsir' ? "bg-rose-800" : "bg-[#218510]") + " text-white shadow-md font-black" 
                      : "text-slate-400 hover:text-white"
                  )}
                >
                  التشغيل الآن
                </button>
                <button
                  onClick={() => setActiveTab('playlist')}
                  className={cn(
"px-4 py-2 rounded-full transition-all duration-200 transform transition-all duration-75 active:scale-[0.95] active:opacity-80",
                    activeTab === 'playlist' 
                      ? (currentTrack.type === 'lecture' ? "bg-[#2563eb]" : currentTrack.type === 'tafsir' ? "bg-rose-800" : "bg-[#218510]") + " text-white shadow-md font-black" 
                      : "text-slate-400 hover:text-white"
                  )}
                >
                  {currentTrack.type === 'quran' ? 'قائمة السور والقرّاء' : currentTrack.type === 'lecture' ? 'قائمة الدروس والعلماء' : 'قائمة التفسير وصاحبه'}
                </button>
              </div>

              <button
                onClick={() => {
                  stopTrack();
                  setIsExpanded(false);
                }}
                className="w-10 h-10 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center transform transition-all duration-75 active:scale-[0.85] active:opacity-70 focus:outline-none"
              >
                <Square size={16} fill="currentColor" />
              </button>
            </div>

            {/* Tab: Surah List (Playlist) */}
            {activeTab === 'playlist' && currentTrack.type === 'quran' ? (
              <div className="flex-1 flex flex-col overflow-hidden my-2">
                
                {/* Mobile Sub-tab switcher */}
                <div className="flex md:hidden bg-slate-900 border border-white/5 p-1 rounded-2xl mb-3 shrink-0 relative z-10">
                  <button
                    onClick={() => setPlaylistSubTab('surahs')}
                    className={cn(
                      "flex-1 py-2.5 rounded-xl text-xs font-black transition-all",
                      playlistSubTab === 'surahs' ? "bg-[#218510] text-white shadow-md shadow-[#218510]/10" : "text-slate-400 hover:text-white"
                    )}
                  >
                    سور القارئ ({availableSurahNumbers.length})
                  </button>
                  <button
                    onClick={() => setPlaylistSubTab('reciters')}
                    className={cn(
                      "flex-1 py-2.5 rounded-xl text-xs font-black transition-all",
                      playlistSubTab === 'reciters' ? "bg-[#218510] text-white shadow-md shadow-[#218510]/10" : "text-slate-400 hover:text-white"
                    )}
                  >
                    تغيير القارئ ({RECITERS.length})
                  </button>
                </div>

                <div className="flex-1 flex md:flex-row flex-col gap-4 overflow-hidden min-h-0">
                  
                  {/* Column: Reciters List (Shown on right side in RTL, 32% wide on desktop/tablet, active on mobile if sub-tab is 'reciters') */}
                  <div className={cn(
                    "flex flex-col overflow-hidden bg-white/5 border border-white/10 rounded-3xl p-3 transition-all",
                    "w-full md:w-[32%] lg:w-[28%]",
                    playlistSubTab === 'reciters' ? "flex flex-1 md:flex-none" : "hidden md:flex"
                  )}>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-2 shrink-0">
                      <span className="text-xs font-black text-[#218510]">القُرَّاء ({RECITERS.length})</span>
                    </div>

                    {/* Reciter Search Input */}
                    <div className="relative mb-2 shrink-0">
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500">
                        <Search size={13} />
                      </span>
                      <input
                        type="text"
                        value={reciterSearchQuery}
                        onChange={(e) => setReciterSearchQuery(e.target.value)}
                        placeholder="ابحث عن قارئ..."
                        className="w-full h-8 pr-7 pl-2 bg-slate-900 border border-white/10 rounded-xl text-[11px] placeholder:text-slate-500 text-white focus:outline-none focus:border-[#218510]/50 focus:bg-white/[0.08] transition-all text-right"
                      />
                      {reciterSearchQuery && (
                        <button
                          onClick={() => setReciterSearchQuery('')}
                          className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                        >
                          <X size={11} />
                        </button>
                      )}
                    </div>

                    {/* Reciters scrollable wrapper */}
                    <div className="flex-1 overflow-y-auto space-y-1.5 custom-scrollbar pr-0.5">
                      {RECITERS.filter(r => r.name.includes(reciterSearchQuery))
                        .map((rec) => {
                          const isCurrentReciter = activeReciter?.id === rec.id;
                          return (
                            <button
                              key={`reciter-${rec.id}`}
                              onClick={() => {
                                selectReciterAndPlay(rec);
                                // On mobile, automatically swap sub-tab back to surahs to view the surahs of the newly selected reciter instantly!
                                if (window.innerWidth < 768) {
                                  setPlaylistSubTab('surahs');
                                }
                              }}
                              className={cn(
                                "w-full p-2.5 rounded-2xl text-right flex flex-col gap-0.5 transition-all outline-none border",
                                isCurrentReciter
                                  ? "bg-gradient-to-r from-[#218510]/20 to-[#218510]/10 border-[#218510]/30 text-white shadow-lg shadow-[#218510]/5"
                                  : "bg-white/[0.01] border-white/5 hover:border-white/15 text-slate-300"
                              )}
                            >
                              <div className="flex items-center justify-between w-full">
                                <span className={cn(
                                  "font-bold text-[11px] truncate leading-tight",
                                  isCurrentReciter ? "text-[#218510] font-black" : "text-slate-200"
                                )}>
                                  {rec.name}
                                </span>
                                {isCurrentReciter && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#218510] shrink-0" />
                                )}
                              </div>
                              <span className="text-[8.5px] text-slate-500 font-extrabold leading-none">
                                تلاوة {rec.style}
                              </span>
                            </button>
                          );
                        })}
                    </div>
                  </div>

                  {/* Column: Surahs List (68% width on desktop, active on mobile if sub-tab is 'surahs') */}
                  <div className={cn(
                    "flex flex-col overflow-hidden bg-white/5 border border-white/10 rounded-3xl p-3 transition-all",
                    "w-full md:w-[68%] lg:w-[72%]",
                    playlistSubTab === 'surahs' ? "flex flex-1 md:flex-none" : "hidden md:flex"
                  )}>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-2 shrink-0">
                      <span className="text-xs font-black text-[#218510]">
                        سور الشيخ {activeReciter?.name ? activeReciter.name.split(' ').slice(0, 2).join(' ') : 'القارئ'} ({availableSurahNumbers.length})
                      </span>
                    </div>

                    {/* Surah Search Bar */}
                    <div className="relative mb-2 shrink-0">
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500">
                        <Search size={13} />
                      </span>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="ابحث باسم السورة..."
                        className="w-full h-8 pr-7 pl-2 bg-slate-900 border border-white/10 rounded-xl text-[11px] placeholder:text-slate-500 text-white focus:outline-none focus:border-[#218510]/50 focus:bg-white/[0.08] transition-all text-right"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                        >
                          <X size={11} />
                        </button>
                      )}
                    </div>

                    {/* Surahs Scroll Area */}
                    <div className="flex-1 overflow-y-auto pr-0.5 space-y-1.5 custom-scrollbar">
                      {availableSurahNumbers
                        .map(num => ({ number: num, name: surahNames[num - 1] || `سورة ${num}` }))
                        .filter(surah => surah.name.includes(searchQuery) || String(surah.number).includes(searchQuery))
                        .map((surah) => {
                          const isCurrentSurah = currentTrack.surahNumber === surah.number;
                          return (
                            <button
                              key={`pl-surah-${surah.number}`}
                              onClick={() => {
                                if (isCurrentSurah) {
                                  if (isPlaying) pauseTrack();
                                  else resumeTrack();
                                } else {
                                  playSurahByNumber(surah.number);
                                }
                              }}
                              className={cn(
                                "w-full p-2.5 rounded-2xl transition-all border flex items-center justify-between text-right truncate",
                                isCurrentSurah
                                  ? "bg-gradient-to-r from-[#218510]/25 to-[#218510]/25 border-[#218510]/30 text-white shadow-lg"
                                  : "bg-white/[0.01] border-white/5 hover:border-white/15 text-slate-300"
                              )}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className={cn(
                                  "w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-mono font-black shrink-0",
                                  isCurrentSurah ? "bg-[#218510] text-white" : "bg-white/5 text-slate-400"
                                )}>
                                  {String(surah.number).padStart(3, '0')}
                                </span>
                                <div className="min-w-0">
                                  <h4 className={cn("font-bold text-xs truncate", isCurrentSurah ? "text-[#218510]" : "text-white")}>
                                    سورة {surah.name}
                                  </h4>
                                  <p className="text-[8.5px] text-slate-500 font-extrabold truncate">
                                    {isCurrentSurah ? (isPlaying ? 'تشغيل الآن' : 'موقوف') : 'انقر للتشغيل'}
                                  </p>
                                </div>
                              </div>

                              {isCurrentSurah && (
                                <div className="flex items-center gap-1 shrink-0">
                                  {isPlaying ? (
                                    <div className="flex gap-0.5 items-end h-2 px-1">
                                      <div className="w-[1.5px] bg-[#218510] animate-[bounce_0.6s_ease-in-out_infinite]" style={{ height: '60%' }} />
                                      <div className="w-[1.5px] bg-[#218510] animate-[bounce_0.8s_ease-in-out_infinite]" style={{ height: '100%' }} />
                                      <div className="w-[1.5px] bg-[#218510] animate-[bounce_0.6s_ease-in-out_infinite_0.1s]" style={{ height: '40%' }} />
                                    </div>
                                  ) : (
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                                  )}
                                </div>
                              )}
                            </button>
                          );
                        })}
                    </div>
                  </div>

                </div>
              </div>
            ) : activeTab === 'playlist' && currentTrack.type === 'lecture' ? (
              <div className="flex-1 flex flex-col overflow-hidden my-2">
                
                {/* Mobile Sub-tab switcher */}
                <div className="flex md:hidden bg-slate-900 border border-white/5 p-1 rounded-2xl mb-3 shrink-0 relative z-10">
                  <button
                    onClick={() => setLectureSubTab('lectures')}
                    className={cn(
                      "flex-1 py-2.5 rounded-xl text-xs font-black transition-all",
                      lectureSubTab === 'lectures' ? "bg-[#1d4ed8] text-white shadow-md shadow-[#2563eb]/10" : "text-slate-400 hover:text-white"
                    )}
                  >
                    دروس الشيخ ({selectedScholarState?.series.flatMap(s => s.lectures).length || 0})
                  </button>
                  <button
                    onClick={() => setLectureSubTab('scholars')}
                    className={cn(
                      "flex-1 py-2.5 rounded-xl text-xs font-black transition-all",
                      lectureSubTab === 'scholars' ? "bg-[#1d4ed8] text-white shadow-md shadow-[#2563eb]/10" : "text-slate-400 hover:text-white"
                    )}
                  >
                    تغيير الشيخ ({SCHOLARS.length})
                  </button>
                </div>

                <div className="flex-1 flex md:flex-row flex-col gap-4 overflow-hidden min-h-0">
                  
                  {/* Column 1: Scholars list */}
                  <div className={cn(
                    "flex flex-col overflow-hidden bg-white/5 border border-white/10 rounded-3xl p-3 transition-all",
                    "w-full md:w-[32%] lg:w-[28%]",
                    lectureSubTab === 'scholars' ? "flex flex-1 md:flex-none" : "hidden md:flex"
                  )}>
                    <div className="flex items-center justify-between mb-2 shrink-0">
                      <span className="text-xs font-black text-[#3b82f6]">الشيوخ والدعاة ({SCHOLARS.length})</span>
                    </div>

                    <div className="relative mb-2 shrink-0">
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                         <Search size={13} />
                      </span>
                      <input
                        type="text"
                        value={scholarSearchQuery}
                        onChange={(e) => setScholarSearchQuery(e.target.value)}
                        placeholder="ابحث عن شيخ..."
                        className="w-full h-8 pr-7 pl-2 bg-slate-900 border border-white/10 rounded-xl text-[11px] placeholder:text-slate-500 text-white focus:outline-none focus:border-[#2563eb]/50 focus:bg-white/[0.08] transition-all text-right"
                      />
                      {scholarSearchQuery && (
                        <button
                          onClick={() => setScholarSearchQuery('')}
                          className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                        >
                          <X size={11} />
                        </button>
                      )}
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-1.5 custom-scrollbar pr-0.5">
                      {SCHOLARS.filter(s => s.name.toLowerCase().includes(scholarSearchQuery.toLowerCase()))
                        .map((scholar) => {
                          const isCurrent = selectedScholarState?.id === scholar.id;
                          return (
                            <button
                              key={`scholar-${scholar.id}`}
                              onClick={() => {
                                setSelectedScholarState(scholar);
                                if (window.innerWidth < 768) {
                                  setLectureSubTab('lectures');
                                }
                              }}
                              className={cn(
                                "w-full p-2.5 rounded-2xl text-right flex flex-col gap-0.5 transition-all outline-none border",
                                isCurrent
                                  ? "bg-gradient-to-r from-[#0b4ec2]/35 to-[#3b82f6]/10 border-[#0b4ec2]/40 text-white shadow-lg shadow-[#0b4ec2]/10"
                                  : "bg-white/[0.01] border-white/5 hover:border-white/15 text-slate-300"
                              )}
                            >
                              <div className="flex items-center justify-between w-full">
                                <span className={cn(
                                  "font-bold text-[11px] truncate leading-tight",
                                  isCurrent ? "text-[#60a5fa] font-black" : "text-slate-200"
                                )}>
                                  {scholar.name}
                                </span>
                                {isCurrent && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] shrink-0" />
                                )}
                              </div>
                              <span className="text-[8.5px] text-slate-500 font-extrabold leading-none">
                                {scholar.series.length} سلسلة علمية
                              </span>
                            </button>
                          );
                        })}
                    </div>
                  </div>

                  {/* Column 2: Lectures list */}
                  <div className={cn(
                    "flex flex-col overflow-hidden bg-white/5 border border-white/10 rounded-3xl p-3 transition-all",
                    "w-full md:w-[68%] lg:w-[72%]",
                    lectureSubTab === 'lectures' ? "flex flex-1 md:flex-none" : "hidden md:flex"
                  )}>
                    <div className="flex items-center justify-between mb-2 shrink-0">
                      <span className="text-xs font-black text-[#3b82f6]">
                        دروس الشيخ {selectedScholarState?.name ? selectedScholarState.name.split(' ').slice(0, 2).join(' ') : 'العالم'} ({selectedScholarState?.series.flatMap(s => s.lectures).length || 0})
                      </span>
                    </div>

                    <div className="relative mb-2 shrink-0">
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                        <Search size={13} />
                      </span>
                      <input
                        type="text"
                        value={lectureSearchQuery}
                        onChange={(e) => setLectureSearchQuery(e.target.value)}
                        placeholder="ابحث عن درس..."
                        className="w-full h-8 pr-7 pl-2 bg-slate-900 border border-white/10 rounded-xl text-[11px] placeholder:text-slate-500 text-white focus:outline-none focus:border-[#2563eb]/50 focus:bg-white/[0.08] transition-all text-right"
                      />
                      {lectureSearchQuery && (
                        <button
                          onClick={() => setLectureSearchQuery('')}
                          className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                        >
                          <X size={11} />
                        </button>
                      )}
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-1.5 custom-scrollbar pr-0.5">
                      {(selectedScholarState?.series.flatMap(s => s.lectures) || [])
                        .filter(l => l.title.toLowerCase().includes(lectureSearchQuery.toLowerCase()))
                        .map((lecture) => {
                          const isCurrent = currentTrack.id === lecture.id;
                          return (
                            <button
                              key={`lecture-track-${lecture.id}`}
                              onClick={async () => {
                                let finalUrl = lecture.audioUrl;
                                
                                try {
                                  const { lectureCacheService } = await import('../services/lectureCacheService');
                                  const isCached = await lectureCacheService.isAudioCached(lecture.audioUrl);
                                  if (isCached) {
                                    const cachedUrl = await lectureCacheService.getCachedAudioUrl(lecture.audioUrl);
                                    if (cachedUrl) {
                                      finalUrl = cachedUrl;
                                    }
                                  }
                                } catch (e) {
                                  console.warn('Lecture Cache check failed inside bar:', e);
                                }

                                playTrack({
                                  id: lecture.id,
                                  title: lecture.title,
                                  subtitle: selectedScholarState?.name || '',
                                  audioUrl: finalUrl,
                                  originalUrl: lecture.audioUrl,
                                  type: 'lecture',
                                  scholarId: selectedScholarState?.id
                                });
                              }}
                              className={cn(
                                "w-full p-2.5 rounded-2xl transition-all border flex items-center justify-between text-right truncate",
                                isCurrent
                                  ? "bg-gradient-to-r from-[#0b4ec2]/35 to-[#3b82f6]/10 border-[#0b4ec2]/40 text-white shadow-lg shadow-[#0b4ec2]/10"
                                  : "bg-white/[0.01] border-white/5 hover:border-white/15 text-slate-300"
                              )}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className={cn(
                                  "w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-mono font-black shrink-0",
                                  isCurrent ? "bg-[#0b4ec2] text-white" : "bg-white/5 text-slate-400"
                                )}>
                                  <PlayCircle size={12} className={isCurrent ? "fill-current animate-pulse" : ""} />
                                </span>
                                <div className="min-w-0">
                                  <h4 className={cn("font-bold text-xs truncate", isCurrent ? "text-[#60a5fa]" : "text-white")}>
                                    {lecture.title}
                                  </h4>
                                  <p className="text-[8.5px] text-slate-500 font-extrabold truncate">
                                    مدة المحاضرة: {lecture.duration}
                                  </p>
                                </div>
                              </div>

                              {isCurrent && (
                                <div className="flex items-center gap-1 shrink-0">
                                  {isPlaying ? (
                                    <div className="flex gap-0.5 items-end h-2 px-1">
                                      <div className="w-[1.5px] bg-[#3b82f6] animate-[bounce_0.6s_ease-in-out_infinite]" style={{ height: '60%' }} />
                                      <div className="w-[1.5px] bg-[#3b82f6] animate-[bounce_0.8s_ease-in-out_infinite]" style={{ height: '100%' }} />
                                      <div className="w-[1.5px] bg-[#3b82f6] animate-[bounce_0.6s_ease-in-out_infinite_0.1s]" style={{ height: '40%' }} />
                                    </div>
                                  ) : (
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                                  )}
                                </div>
                              )}
                            </button>
                          );
                        })}
                    </div>
                  </div>

                </div>
              </div>
            ) : activeTab === 'playlist' && currentTrack.type === 'tafsir' ? (
              <div className="flex-1 flex flex-col overflow-hidden my-2">
                
                {/* Mobile Sub-tab switcher for Tafsir */}
                <div className="flex md:hidden bg-slate-900 border border-white/5 p-1 rounded-2xl mb-3 shrink-0 relative z-10">
                  <button
                    onClick={() => setTafsirSubTab('tafsirs')}
                    className={cn(
                      "flex-1 py-2.5 rounded-xl text-xs font-black transition-all",
                      tafsirSubTab === 'tafsirs' ? "bg-rose-800 text-white shadow-md shadow-rose-900/10" : "text-slate-400 hover:text-white"
                    )}
                  >
                    السور المفسرة ({selectedTafsirScholarState?.surahs.flatMap(s => s.tracks).length || 0})
                  </button>
                  <button
                    onClick={() => setTafsirSubTab('scholars')}
                    className={cn(
                      "flex-1 py-2.5 rounded-xl text-xs font-black transition-all",
                      tafsirSubTab === 'scholars' ? "bg-rose-800 text-white shadow-md shadow-rose-900/10" : "text-slate-400 hover:text-white"
                    )}
                  >
                    تغيير المفسر ({TAFSIR_SCHOLARS.length})
                  </button>
                </div>

                <div className="flex-1 flex md:flex-row flex-col gap-4 overflow-hidden min-h-0">
                  
                  {/* Column 1: Tafsir Scholars list */}
                  <div className={cn(
                    "flex flex-col overflow-hidden bg-white/5 border border-white/10 rounded-3xl p-3 transition-all",
                    "w-full md:w-[32%] lg:w-[28%]",
                    tafsirSubTab === 'scholars' ? "flex flex-1 md:flex-none" : "hidden md:flex"
                  )}>
                    <div className="flex items-center justify-between mb-2 shrink-0">
                      <span className="text-xs font-black text-rose-500">مشائخ التفسير ({TAFSIR_SCHOLARS.length})</span>
                    </div>

                    <div className="relative mb-2 shrink-0">
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                        <Search size={13} />
                      </span>
                      <input
                        type="text"
                        value={scholarSearchQuery}
                        onChange={(e) => setScholarSearchQuery(e.target.value)}
                        placeholder="ابحث عن مفسر..."
                        className="w-full h-8 pr-7 pl-2 bg-slate-900 border border-white/10 rounded-xl text-[11px] placeholder:text-slate-500 text-white focus:outline-none focus:border-rose-500/50 focus:bg-white/[0.08] transition-all text-right"
                      />
                      {scholarSearchQuery && (
                        <button
                          onClick={() => setScholarSearchQuery('')}
                          className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                        >
                          <X size={11} />
                        </button>
                      )}
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-1.5 custom-scrollbar pr-0.5">
                      {TAFSIR_SCHOLARS.filter(s => s.name.toLowerCase().includes(scholarSearchQuery.toLowerCase()))
                        .map((scholar) => {
                          const isCurrent = selectedTafsirScholarState?.id === scholar.id;
                          return (
                            <button
                              key={`tafsir-scholar-${scholar.id}`}
                              onClick={() => {
                                setSelectedTafsirScholarState(scholar);
                                if (window.innerWidth < 768) {
                                  setTafsirSubTab('tafsirs');
                                }
                              }}
                              className={cn(
                                "w-full p-2.5 rounded-2xl text-right flex flex-col gap-0.5 transition-all outline-none border",
                                isCurrent
                                  ? "bg-gradient-to-r from-rose-900/35 to-rose-500/10 border-rose-900/40 text-white shadow-lg shadow-rose-900/10"
                                  : "bg-white/[0.01] border-white/5 hover:border-white/15 text-slate-300"
                              )}
                            >
                              <div className="flex items-center justify-between w-full">
                                <span className={cn(
                                  "font-bold text-[11px] truncate leading-tight",
                                  isCurrent ? "text-rose-400 font-black" : "text-slate-200"
                                )}>
                                  {scholar.name}
                                </span>
                                {isCurrent && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                                )}
                              </div>
                              <span className="text-[8.5px] text-slate-500 font-extrabold leading-none">
                                {scholar.surahs.length} سورة مفسرة
                              </span>
                            </button>
                          );
                        })}
                    </div>
                  </div>

                  {/* Column 2: Tafsir list */}
                  <div className={cn(
                    "flex flex-col overflow-hidden bg-white/5 border border-white/10 rounded-3xl p-3 transition-all",
                    "w-full md:w-[68%] lg:w-[72%]",
                    tafsirSubTab === 'tafsirs' ? "flex flex-1 md:flex-none" : "hidden md:flex"
                  )}>
                    <div className="flex items-center justify-between mb-2 shrink-0">
                      <span className="text-xs font-black text-rose-500">
                        تفسير الشيخ {selectedTafsirScholarState?.name ? selectedTafsirScholarState.name.split(' ').slice(0, 2).join(' ') : 'العالم'} ({selectedTafsirScholarState?.surahs.flatMap(s => s.tracks).length || 0})
                      </span>
                    </div>

                    <div className="relative mb-2 shrink-0">
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                        <Search size={13} />
                      </span>
                      <input
                        type="text"
                        value={lectureSearchQuery}
                        onChange={(e) => setLectureSearchQuery(e.target.value)}
                        placeholder="ابحث عن سورة..."
                        className="w-full h-8 pr-7 pl-2 bg-slate-900 border border-white/10 rounded-xl text-[11px] placeholder:text-slate-500 text-white focus:outline-none focus:border-rose-500/50 focus:bg-white/[0.08] transition-all text-right"
                      />
                      {lectureSearchQuery && (
                        <button
                          onClick={() => setLectureSearchQuery('')}
                          className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                        >
                          <X size={11} />
                        </button>
                      )}
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-1.5 custom-scrollbar pr-0.5">
                      {(selectedTafsirScholarState?.surahs.flatMap(s => s.tracks) || [])
                        .filter(l => l.title.toLowerCase().includes(lectureSearchQuery.toLowerCase()))
                        .map((track) => {
                          const isCurrent = currentTrack.id === track.id;
                          return (
                            <button
                              key={`tafsir-track-${track.id}`}
                              onClick={async () => {
                                let finalUrl = track.audioUrl;
                                
                                try {
                                  const { lectureCacheService } = await import('../services/lectureCacheService');
                                  const isCached = await lectureCacheService.isAudioCached(track.audioUrl);
                                  if (isCached) {
                                    const cachedUrl = await lectureCacheService.getCachedAudioUrl(track.audioUrl);
                                    if (cachedUrl) {
                                      finalUrl = cachedUrl;
                                    }
                                  }
                                } catch (e) {
                                  console.warn('Tafsir Cache check failed inside bar:', e);
                                }

                                playTrack({
                                  id: track.id,
                                  title: track.title,
                                  subtitle: selectedTafsirScholarState?.name || '',
                                  audioUrl: finalUrl,
                                  originalUrl: track.audioUrl,
                                  type: 'tafsir',
                                  scholarId: selectedTafsirScholarState?.id
                                });
                              }}
                              className={cn(
                                "w-full p-2.5 rounded-2xl transition-all border flex items-center justify-between text-right truncate",
                                isCurrent
                                  ? "bg-gradient-to-r from-rose-900/35 to-rose-600/10 border-rose-900/40 text-white shadow-lg shadow-rose-900/10"
                                  : "bg-white/[0.01] border-white/5 hover:border-white/15 text-slate-300"
                              )}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className={cn(
                                  "w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-mono font-black shrink-0",
                                  isCurrent ? "bg-rose-600 text-white" : "bg-white/5 text-slate-400"
                                )}>
                                  <PlayCircle size={12} className={isCurrent ? "fill-current animate-pulse" : ""} />
                                </span>
                                <div className="min-w-0">
                                  <h4 className={cn("font-bold text-xs truncate", isCurrent ? "text-rose-400" : "text-white")}>
                                    {track.title}
                                  </h4>
                                  <p className="text-[8.5px] text-slate-500 font-extrabold truncate">
                                    المدة: {track.duration}
                                  </p>
                                </div>
                              </div>

                              {isCurrent && (
                                <div className="flex items-center gap-1 shrink-0">
                                  {isPlaying ? (
                                    <div className="flex gap-0.5 items-end h-2 px-1">
                                      <div className="w-[1.5px] bg-rose-400 animate-[bounce_0.6s_ease-in-out_infinite]" style={{ height: '60%' }} />
                                      <div className="w-[1.5px] bg-rose-400 animate-[bounce_0.8s_ease-in-out_infinite]" style={{ height: '100%' }} />
                                      <div className="w-[1.5px] bg-rose-400 animate-[bounce_0.6s_ease-in-out_infinite_0.1s]" style={{ height: '40%' }} />
                                    </div>
                                  ) : (
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                                  )}
                                </div>
                              )}
                            </button>
                          );
                        })}
                    </div>
                  </div>

                </div>
              </div>
            ) : (
              /* Tab: Now Playing */
              <>
                {/* Dynamic Center Artwork */}
                <div className="flex-1 flex flex-col items-center justify-center my-6">
                  <motion.div
                    animate={{ scale: isPlaying ? [1, 1.03, 1] : 1 }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                    className={cn(
                      "w-48 h-48 rounded-[32px] flex flex-col items-center justify-center shadow-2xl relative border-2 border-white/10",
                      currentTrack.type === 'quran'
                        ? "bg-gradient-to-tr from-[#218510] to-[#218510]/80"
                        : currentTrack.type === 'lecture'
                          ? "bg-gradient-to-tr from-[#0a2540] via-[#0b4ec2] to-[#3b82f6]"
                          : "bg-gradient-to-tr from-rose-950 via-rose-800 to-rose-600"
                    )}
                  >
                    {/* Glow rings */}
                    {(isPlaying || nextTrackCountdown !== null) && (
                      <span className={cn(
                        "absolute inset-0 rounded-[32px] animate-ping border opacity-30 pointer-events-none",
                        currentTrack.type === 'quran' 
                          ? "border-[#218510]/20" 
                          : currentTrack.type === 'lecture'
                            ? "border-[#3b82f6]/40"
                            : "border-rose-500/20"
                      )} />
                    )}
                    
                    {nextTrackCountdown !== null ? (
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-6xl font-black text-white font-sans animate-bounce">{nextTrackCountdown}</span>
                        <span className={cn(
                          "text-[10px] mt-2 font-bold font-arabic",
                          currentTrack.type === 'quran' 
                            ? "text-[#218510]" 
                            : currentTrack.type === 'lecture'
                              ? "text-[#3b82f6]"
                              : "text-rose-400"
                        )}>
                          {currentTrack.type === 'quran' ? 'سورة جديدة...' : 'محاضرة جديدة...'}
                        </span>
                      </div>
                    ) : currentTrack.type === 'quran' ? (
                      <BookOpen size={72} className="text-white drop-shadow-md" />
                    ) : (
                      <User size={72} className="text-white drop-shadow-md" />
                    )}

                    <span className={cn(
                      "absolute bottom-4 text-[10px] font-bold bg-black/40 px-3 py-1 rounded-full uppercase tracking-widest leading-none",
                      currentTrack.type === 'quran' 
                        ? "text-[#218510]" 
                        : currentTrack.type === 'lecture'
                          ? "text-[#3b82f6]"
                          : "text-rose-400"
                    )}>
                      {currentTrack.type === 'quran' ? 'قرآن كريم' : currentTrack.type === 'lecture' ? 'محاضرة علمية' : 'تفسير صوتي'}
                    </span>
                  </motion.div>

                  {/* Meta Data */}
                  <div className="text-center mt-6 w-full max-w-sm px-4 flex flex-col items-center">
                    <h3 className="text-xl font-bold text-white tracking-tight truncate leading-tight">{currentTrack.title}</h3>
                    <p className="text-slate-400 text-sm mt-1 truncate">{currentTrack.subtitle}</p>

                    {/* Countdown indicator in expanded mode */}
                    {nextTrackCountdown !== null && (
                      <div className={cn(
                        "mt-4 rounded-2xl p-3 w-full flex items-center justify-between text-right animate-pulse border",
                        currentTrack.type === 'quran' 
                          ? "bg-[#218510]/10 border-[#218510]/20" 
                          : currentTrack.type === 'lecture'
                            ? "bg-[#0b4ec2]/15 border-[#0b4ec2]/35"
                            : "bg-rose-500/10 border border-rose-500/20"
                      )}>
                        <div className="flex flex-col">
                          <span className="text-xs text-white font-bold font-arabic">
                            {currentTrack.type === 'quran' ? 'الانتقال إلى السورة التالية تلقائياً' : 'الانتقال إلى المحاضرة التالية تلقائياً'}
                          </span>
                          <span className="text-slate-400 text-[10px] font-arabic mt-0.5">
                            {currentTrack.type === 'quran' ? 'تلاوة متواصلة دون انقطاع' : 'تشغيل ذكي متتابع سلس'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button 
                            onClick={skipNextTrackCountdown}
                            className={cn(
                              "px-3 py-1.5 rounded-xl text-xs font-black font-arabic hover:scale-105 duration-75 active:scale-[0.85] active:opacity-70 transition-all focus:outline-none",
                              currentTrack.type === 'quran' 
                                ? "bg-[#218510] text-slate-950 hover:bg-[#186a0d]" 
                                : currentTrack.type === 'lecture'
                                  ? "bg-[#0b4ec2] text-white hover:bg-[#093d96]"
                                  : "bg-rose-800 text-white hover:bg-rose-900"
                            )}
                          >
                            تشغيل الآن
                          </button>
                          <button 
                            onClick={cancelNextTrackCountdown}
                            className="bg-white/15 hover:bg-white/20 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold font-arabic hover:scale-105 duration-75 active:scale-[0.85] active:opacity-70 transition-all focus:outline-none"
                          >
                            إلغاء
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Interactive Progress Slider & Labels */}
                <div className="w-full max-w-md mx-auto mb-6 shrink-0">
                  <div 
                    className="w-full h-2 bg-white/10 rounded-full relative cursor-pointer overflow-hidden group shadow-inner"
                    onClick={handleProgressBarClick}
                  >
                    <div 
                      className={cn(
                        "h-full transition-all rounded-full",
                        currentTrack.type === 'quran'
                          ? "bg-[#218510] group-hover:bg-[#186a0d]"
                          : currentTrack.type === 'lecture'
                            ? "bg-[#3b82f6] group-hover:bg-[#60a5fa]"
                            : "bg-rose-600 group-hover:bg-rose-500"
                      )}
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  {/* Time stamps */}
                  <div className="flex items-center justify-between text-xs font-sans font-medium text-slate-400 mt-2 px-1">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Controls with Modern 5-Button Setup */}
                <div className="flex items-center justify-center gap-4 sm:gap-6 mb-8 shrink-0">
                  {/* Previous Surah / Lecture */}
                  {(currentTrack.type === 'quran' || currentTrack.type === 'lecture' || currentTrack.type === 'tafsir') && (
                    <button 
                      onClick={handlePlayPrev}
                      className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 hover:text-white duration-75 active:scale-[0.85] active:opacity-70 transition-all focus:outline-none"
                      title={currentTrack.type === 'quran' ? "السورة السابقة" : currentTrack.type === 'lecture' ? "المحاضرة السابقة" : "التفسير السابق"}
                    >
                      <SkipBack size={18} className="scale-x-[-1]" />
                    </button>
                  )}

                  {/* Seek Backward 10s */}
                  <button 
                    onClick={skipBackward}
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 hover:text-white duration-75 active:scale-[0.85] active:opacity-70 transition-all focus:outline-none"
                    title="تراجع 10 ثوان"
                  >
                    <Rewind size={18} />
                  </button>

                  {/* Play/Pause */}
                  <button 
                    onClick={isPlaying ? pauseTrack : resumeTrack}
                    className={cn(
"w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center shadow-xl hover:scale-105 transform transition-all duration-75 active:scale-[0.85] active:opacity-70 text-white focus:outline-none",
                      currentTrack.type === 'quran'
                        ? "bg-gradient-to-r from-[#218510] to-[#1a6b0c] shadow-lg shadow-[#218510]/35 hover:from-[#1a6b0c] hover:to-[#145209]"
                        : currentTrack.type === 'lecture'
                          ? "bg-gradient-to-r from-[#0b4ec2] to-[#3b82f6] shadow-lg shadow-[#0b4ec2]/40"
                          : "bg-gradient-to-r from-rose-800 to-rose-600 shadow-lg shadow-rose-900/40 hover:from-rose-900 hover:to-rose-700"
                    )}
                  >
                    {isPlaying ? <Pause size={28} className="sm:size-8" fill="currentColor" /> : <Play size={28} className="sm:size-8 mr-1" fill="currentColor" />}
                  </button>

                  {/* Seek Forward 10s */}
                  <button 
                    onClick={skipForward}
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 hover:text-white duration-75 active:scale-[0.85] active:opacity-70 transition-all focus:outline-none"
                    title="تقديم 10 ثوان"
                  >
                    <FastForward size={18} />
                  </button>

                  {/* Next Surah / Lecture */}
                  {(currentTrack.type === 'quran' || currentTrack.type === 'lecture' || currentTrack.type === 'tafsir') && (
                    <button 
                      onClick={handlePlayNext}
                      className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 hover:text-white duration-75 active:scale-[0.85] active:opacity-70 transition-all focus:outline-none"
                      title={currentTrack.type === 'quran' ? "السورة التالية" : currentTrack.type === 'lecture' ? "المحاضرة التالية" : "التفسير التالي"}
                    >
                      <SkipForward size={18} className="scale-x-[-1]" />
                    </button>
                  )}
                </div>

                {/* Bottom Accessories Tab (Speed, Sleeper, Continuous Play) */}
                <div className="mt-auto grid grid-cols-3 gap-2 sm:gap-4 max-w-sm mx-auto w-full pb-4 shrink-0 relative">
                  {/* Speed Trigger */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setShowSpeedMenu(!showSpeedMenu);
                        setShowTimerMenu(false);
                      }}
                      className={cn(
                        "w-full flex items-center justify-center gap-1 px-1 py-3 rounded-2xl text-xs font-bold transition-all border focus:outline-none",
                        showSpeedMenu 
                          ? (currentTrack.type === 'quran' 
                              ? "bg-[#218510]/10 border-[#218510]/30 text-[#218510]" 
                              : currentTrack.type === 'lecture'
                                ? "bg-[#0b4ec2]/10 border-[#0b4ec2]/30 text-[#3b82f6]"
                                : "bg-rose-900/40 border-rose-900/60 text-rose-500")
                          : "bg-white/5 border-white/5 hover:bg-white/10 text-slate-300"
                      )}
                    >
                      <Volume2 size={14} className="shrink-0" />
                      <span className="truncate">السرعة: {playbackRate}x</span>
                    </button>

                    <AnimatePresence>
                      {showSpeedMenu && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: -5 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute bottom-full left-0 right-0 z-50 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-2 mb-2 flex flex-col gap-1 text-right"
                        >
                          <span className="text-[10px] text-slate-400 px-3 py-1 font-bold">سرعة التشغيل</span>
                          {speedOptions.map(speed => (
                            <button
                              key={speed}
                              onClick={() => {
                                setPlaybackRate(speed);
                                setShowSpeedMenu(false);
                              }}
                              className={cn(
                                "w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-right focus:outline-none",
                                playbackRate === speed 
                                  ? (currentTrack.type === 'lecture'
                                      ? "bg-[#0b4ec2]/30 text-white font-black"
                                      : currentTrack.type === 'tafsir'
                                        ? "bg-rose-800/30 text-white font-black"
                                        : "bg-[#218510]/20 text-white font-black")
                                  : "hover:bg-white/5 text-slate-300"
                              )}
                            >
                              <span>{speed}x {speed === 1 && '(طبيعي)'}</span>
                              {playbackRate === speed && <Check size={14} />}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Sleep Timer */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setShowTimerMenu(!showTimerMenu);
                        setShowSpeedMenu(false);
                      }}
                      className={cn(
                        "w-full flex items-center justify-center gap-1 px-1 py-3 rounded-2xl text-xs font-bold transition-all border focus:outline-none",
                        sleepTimer !== null ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400" : "bg-white/5 border-white/5 hover:bg-white/10 text-slate-300"
                      )}
                    >
                      <Timer size={14} className="shrink-0" />
                      <span className="truncate">
                        {sleepTimer !== null ? `المؤقت: ${sleepTimer}د` : 'مؤقت النوم'}
                      </span>
                    </button>

                    <AnimatePresence>
                      {showTimerMenu && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: -5 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute bottom-full left-0 right-0 z-50 bg-slate-950/95 border border-white/10 rounded-2xl shadow-2xl p-2 mb-2 flex flex-col gap-1 text-right"
                        >
                          <span className="text-[10px] text-slate-400 px-3 py-1 font-bold">مؤقت إيقاف التشغيل</span>
                          {sleepTimerOptions.map(option => (
                            <button
                              key={option.value === null ? 'null' : option.value}
                              onClick={() => {
                                setSleepTimer(option.value);
                                setShowTimerMenu(false);
                              }}
                              className={cn(
                                "w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-right focus:outline-none",
                                sleepTimer === option.value ? "bg-indigo-600 text-white" : "hover:bg-white/5 text-slate-300"
                              )}
                            >
                              <span>{option.label}</span>
                              {sleepTimer === option.value && <Check size={14} />}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Auto Play Next */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setAutoPlayNext(!autoPlayNext);
                        setShowSpeedMenu(false);
                        setShowTimerMenu(false);
                      }}
                      className={cn(
                        "w-full flex items-center justify-center gap-1 px-1 py-3 rounded-2xl text-xs font-bold transition-all border focus:outline-none",
                        autoPlayNext 
                          ? (currentTrack.type === 'quran' 
                              ? "bg-[#218510]/10 border-[#218510]/30 text-[#218510]" 
                              : currentTrack.type === 'lecture'
                                ? "bg-[#0b4ec2]/10 border-[#0b4ec2]/30 text-[#3b82f6]"
                                : "bg-rose-900/40 border-rose-900/60 text-rose-500")
                          : "bg-white/5 border-white/5 hover:bg-white/10 text-slate-400"
                      )}
                      title={autoPlayNext 
                        ? (currentTrack.type === 'quran' ? "التلاوة المتواصلة: مفعّلة" : "التشغيل المتواصل: مفعّل")
                        : (currentTrack.type === 'quran' ? "التلاوة المتواصلة: معطلة" : "التشغيل المتواصل: معطل")
                      }
                    >
                      <ListMusic size={14} className="shrink-0" />
                      <span className="truncate">
                        {currentTrack.type === 'quran' ? 'تلاوة متواصلة' : 'تشغيل متواصل'}
                      </span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default GlobalAudioBar;
