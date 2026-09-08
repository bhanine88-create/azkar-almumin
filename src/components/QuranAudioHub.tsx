import { BackButton } from './ui/BackButton';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Headphones, ChevronRight, ChevronLeft, PlayCircle, Mic2, Heart, HardDrive, 
  SlidersHorizontal, X, Settings2, Info,  Volume2, 
  FastForward, MousePointer2, Zap, Layout, Play, Sparkles } from 'lucide-react';
import { RECITERS } from '../reciters';
import { useAppContext } from '../AppContext';
import { useQuranSettings } from '../context/QuranSettingsContext';
import { cn } from '../lib/utils';
import { useTranslation } from '../i18n';
import { audioCacheService } from '../services/audioCacheService';
import { useGlobalAudio } from '../context/GlobalAudioContext';
import { smartReciterMatch } from '../lib/arabicSearch';
import { preloadAudioLibraryRoutes } from '../lib/preloadLibrary';

import { useSmartNavigation } from '../lib/navigation';

export const QuranAudioHub: React.FC = () => {
  const { navigate } = useSmartNavigation();
  const { settings, progress, toggleFavoriteUnified } = useAppContext();
  const { currentTrack, isPlaying, playTrack } = useGlobalAudio();
  const { 
    reciter, setReciter, 
    playbackRate, setPlaybackRate,
    autoNextSurah, setAutoNextSurah,
    autoPlay, setAutoPlay
  } = useQuranSettings();
  const { t } = useTranslation(settings.appLanguage);
  const [downloadCount, setDownloadCount] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredReciters = RECITERS.filter(r => smartReciterMatch(r, searchQuery));

  useEffect(() => {
    const list = audioCacheService.getMetadataList();
    setDownloadCount(list.length);
    preloadAudioLibraryRoutes();
  }, []);

  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];

  return (
    <div className="flex flex-col gap-6 py-6 px-4 pb-20 w-full min-h-screen overflow-y-auto custom-scrollbar bg-slate-50 dark:bg-slate-950">
      <div className="flex items-center justify-between mb-4 sticky top-0 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-md pb-4 z-10 pt-2 -mx-4 px-4 shadow-sm border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <BackButton forceFallback={true} fallbackPath="/audio-library" />
          <div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
              المصحف المرتل
              <Headphones className="text-[#218510]" size={24} />
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">القراءات الصوتية</p>
          </div>
        </div>

        <motion.button 
          whileHover={{ scale: 1.05, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowSettings(true)}
          className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center text-[#218510] dark:text-[#218510] hover:border-[#218510]/50 transform transition-all duration-75 active:scale-[0.85] active:opacity-70 shadow-xl group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[#218510]/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <SlidersHorizontal size={26} className="group-hover:rotate-12 transition-transform duration-300 relative z-10" />
          <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#218510] animate-pulse shadow-[0_0_8px_rgba(33,133,16,0.6)]" />
        </motion.button>
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
                  <p className="text-sm font-medium text-slate-500">تحكم في تجربة الاستماع الخاصة بك</p>
                </div>
                <button 
                  onClick={() => setShowSettings(false)}
                  className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-8">
                {/* Playback Speed */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Zap size={18} />
                    <span className="text-xs font-black uppercase tracking-widest">سرعة التشغيل</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {speeds.map(s => (
                      <button
                        key={`speed-${s}`}
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

                {/* Toggles */}
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
                        <p className="text-[10px] font-bold text-slate-500">بدأ الصوت تلقائياً عند الدخول</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setAutoPlay(!autoPlay)}
                      className={cn(
                        "w-14 h-8 rounded-full relative transition-colors duration-300",
                        autoPlay ? "bg-[#218510]" : "bg-slate-300 dark:bg-slate-700"
                      )}
                    >
                      <motion.div 
                        animate={{ x: autoPlay ? 24 : 4 }}
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

      <div className="flex flex-col gap-3">
        {/* Favorite Reciters Navigation Entry Point */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => navigate('/quran-audio/favorites')}
          className="p-5 rounded-[32px] bg-gradient-to-r from-amber-500/10 to-amber-600/10 border border-amber-500/20 flex items-center justify-between group overflow-hidden relative shadow-sm"
        >
          <div className="absolute right-0 top-0 w-24 h-full bg-amber-500/5 rotate-12 translate-x-8 pointer-events-none" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-[1.2rem] bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-110 group-hover:rotate-6 transition-transform">
              <Heart size={18} className="fill-current" />
            </div>
            <div className="text-right">
              <h2 className="text-lg font-black text-slate-800 dark:text-white">القراء المفضلون</h2>
              <p className="text-xs font-bold text-slate-500">ادخل لعرض قائمة المقرئين المختارين</p>
            </div>
          </div>
          <div className="flex items-center gap-3 relative z-10">
            {(progress.favoriteReciters || []).length > 0 && (
              <div className="bg-amber-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-sm animate-pulse">
                {(progress.favoriteReciters || []).length} قراء
              </div>
            )}
            <div className="w-10 h-10 rounded-full bg-white/50 dark:bg-slate-800/50 flex items-center justify-center text-amber-600 group-hover:-translate-x-1 transition-transform">
              <ChevronLeft size={20} />
            </div>
          </div>
        </motion.button>

        {/* Downloads Link */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => navigate('/quran-audio/downloads')}
          className="bg-slate-800 text-white p-4 rounded-[32px] flex items-center justify-between hover:bg-slate-700 transition-all border border-slate-700 duration-75 active:scale-[0.85] active:opacity-70 shadow-lg group"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#218510]/20 text-emerald-400 flex items-center justify-center border border-[#218510]/30 group-hover:scale-110 transition-transform">
              <HardDrive size={24} />
            </div>
            <div className="text-right">
              <h3 className="font-black text-sm">التنزيلات المحفوظة</h3>
              <p className="text-[10px] font-bold text-slate-400">الاستماع بدون إنترنت</p>
            </div>
          </div>
          <div className="bg-[#218510]/20 text-emerald-400 border border-[#218510]/30 px-3 py-1 rounded-xl text-[10px] font-black">
            {downloadCount} سورة
          </div>
        </motion.button>
      </div>



      {/* Featured Selected Reciter */}
      {reciter && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-amber-500/10 border border-amber-500/20 p-5 rounded-3xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none" />
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-[1.2rem] bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30">
                <Heart size={18} className="fill-current" />
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-xl text-slate-900 dark:text-white">
                    {RECITERS.find(r => r.id === reciter)?.name}
                  </h3>
                  <span className="bg-amber-500 text-white text-[8px] px-1.5 py-0.5 rounded-md font-black uppercase tracking-tighter">Selected</span>
                </div>
                <p className="text-sm font-bold text-amber-600 dark:text-amber-400 mt-1">
                  القارئ الافتراضي المختار حالياً
                </p>
              </div>
            </div>
            <button 
              onClick={() => navigate(`/quran-audio/${reciter}`)}
              className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white w-12 h-12 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform duration-75 active:scale-[0.85] active:opacity-70"
            >
              <PlayCircle size={28} className="text-amber-500" />
            </button>
          </div>
        </motion.div>
      )}

      <div>
        {/* Search Bar */}
        <div className="relative mb-4">
          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
            <Mic2 size={18} />
          </div>
          <input
            type="text"
            placeholder="ابحث عن قارئ أو رواية..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pr-12 pl-10 rounded-2xl text-sm font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none focus:ring-2 focus:ring-[#218510]/20 transition-all shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 left-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X size={18} />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between mb-3 px-2">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            {searchQuery ? `نتائج البحث (${filteredReciters.length})` : `قائمة القراء المتاحين (${RECITERS.length})`}
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800 ml-2" />
          </h2>
          <span className="text-[10px] text-amber-500 font-bold bg-amber-500/10 px-2 py-1 rounded-lg">إختر القارئ بالضغط على النجمة</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredReciters.sort((a, b) => {
            const aFav = (progress.favorites || []).some(fav => fav.id === String(a.id) && fav.type === 'reciter');
            const bFav = (progress.favorites || []).some(fav => fav.id === String(b.id) && fav.type === 'reciter');
            if (aFav && !bFav) return -1;
            if (!aFav && bFav) return 1;
            return 0;
          }).map((r, idx) => {
            const isFavorite = (progress.favorites || []).some(fav => fav.id === String(r.id) && fav.type === 'reciter');
            return (
              <div
                key={`reciter-hub-${r.id}-${idx}`}
                onClick={() => navigate(`/quran-audio/${r.id}`)}
                className={cn(
"p-4 rounded-2xl cursor-pointer transition-all flex items-center justify-between group transform transition-all duration-75 active:scale-[0.98] active:opacity-90 hover:bg-slate-50 dark:hover:bg-slate-800/80",
                  reciter === r.id 
                    ? "bg-amber-50 dark:bg-amber-900/10 border-amber-500/30 shadow-lg shadow-amber-500/5" 
                    : "bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-[#218510]/50 hover:shadow-lg"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
"relative w-10 h-10 rounded-xl p-[2px] transform transition-all duration-75 active:scale-[0.85] active:opacity-70 group-hover:-translate-y-1 group-hover:scale-105 shrink-0",
                    reciter === r.id 
                      ? "bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 shadow-[0_8px_16px_-6px_rgba(245,158,11,0.5)] group-hover:shadow-[0_12px_20px_-6px_rgba(245,158,11,0.7)]" 
                      : "bg-gradient-to-br from-[#218510] via-[#1a6b0c] to-emerald-600 shadow-[0_8px_16px_-6px_rgba(33,133,16,0.3)] group-hover:shadow-[0_12px_20px_-6px_rgba(33,133,16,0.5)]"
                  )}>
                    <span className="absolute -top-1.5 -right-1.5 bg-slate-900/90 dark:bg-white text-white dark:text-slate-900 rounded-[6px] px-1.5 py-0.5 text-[8px] font-black z-20 flex items-center justify-center shadow-lg border border-white/20 dark:border-slate-800">
                      {idx + 1}
                    </span>
                    <div className={cn(
                      "w-full h-full rounded-[0.6rem] flex items-center justify-center backdrop-blur border border-white/20 relative overflow-hidden",
                      reciter === r.id ? "bg-amber-500/20" : "bg-[#218510]/20"
                    )}>
                      <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent"></div>
                      <Mic2 
                        className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] relative z-10 group-hover:rotate-6 transition-transform duration-500" 
                        size={16} strokeWidth={2.5} 
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <h3 className={cn(
                      "font-black text-base",
                      reciter === r.id ? "text-amber-700 dark:text-amber-300" : "text-slate-900 dark:text-slate-100"
                    )}>{r.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={cn(
                        "text-[10px] font-bold px-2.5 py-0.5 rounded-lg border inline-block",
                        reciter === r.id 
                          ? "bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400 font-black" 
                          : "bg-[#218510]/10 dark:bg-[#218510]/20 border-[#218510]/20 text-[#218510] dark:text-emerald-400 font-extrabold"
                      )}>
                        {r.style}
                      </span>
                      {isFavorite && (
                        <div className="bg-amber-400/20 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded-lg text-[8px] font-black uppercase">
                          مفضل
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavoriteUnified({
                        id: String(r.id),
                        type: 'reciter',
                        title: r.name,
                        subtitle: r.style,
                        route: `/quran-audio/${r.id}`
                      });
                    }}
                    className={cn(
"w-8 h-8 rounded-full flex items-center justify-center transform transition-all duration-75 active:scale-[0.85] active:opacity-70 animate-in fade-in zoom-in",
                      isFavorite 
                        ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30 scale-110" 
                        : "bg-slate-100 dark:bg-slate-700/50 text-slate-400 hover:bg-rose-50 hover:text-rose-500"
                    )}
                  >
                    <Heart size={14} className={isFavorite ? "fill-current" : ""} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setReciter(r.id);
                    }}
                    className={cn(
"w-8 h-8 rounded-full flex items-center justify-center transform transition-all duration-75 active:scale-[0.85] active:opacity-70 border",
                      reciter === r.id 
                        ? "bg-gradient-to-br from-[#218510] to-[#186a0d] border-transparent text-white shadow-md shadow-[#218510]/30 scale-105" 
                        : "bg-slate-100 dark:bg-slate-700/50 text-slate-400 border-transparent hover:bg-[#218510]/15 hover:border-[#218510]/30 hover:text-[#218510] hover:scale-105"
                    )}
                  >
                    <PlayCircle size={16} className={reciter === r.id ? "fill-current" : ""} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

