import { BackButton } from './ui/BackButton';
import { EmptyStatePlaceholder } from './EmptyStatePlaceholder';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {  Play, Pause, Trash2, Download, HardDrive, Volume2,  FileDown, Loader2, 
  CheckCircle2, Search, Filter, ShieldAlert, WifiOff,  Info, HelpCircle , X } from 'lucide-react';
import { audioCacheService, CachedAudioInfo } from '../services/audioCacheService';
import { cn } from '../lib/utils';
import { RECITERS } from '../reciters';
import { useSmartNavigation } from "../lib/navigation";

export const QuranAudioDownloadsHub: React.FC = () => {
  const { navigate, goBack } = useSmartNavigation();
  const [downloads, setDownloads] = useState<CachedAudioInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingUrl, setPlayingUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [savingUrls, setSavingUrls] = useState<Record<string, 'loading' | 'success' | null>>({});
  
  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReciterId, setSelectedReciterId] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'size-desc' | 'size-asc' | 'surah-asc'>('recent');
  const [showConfirmClearAll, setShowConfirmClearAll] = useState(false);
  
  // Storage Tracker State
  const [storageStats, setStorageStats] = useState<{
    usedBytes: number;
    estimatedAvailable: number;
    estimatedQuota: number;
    supported: boolean;
  }>({
    usedBytes: 0,
    estimatedAvailable: 0,
    estimatedQuota: 0,
    supported: false
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    loadDownloads();
    fetchStorageEstimate();
  }, []);

  const loadDownloads = () => {
    const list = audioCacheService.getMetadataList();
    // Sort by most recently downloaded by default
    list.sort((a, b) => b.downloadedAt - a.downloadedAt);
    setDownloads(list);
    setLoading(false);
  };

  const fetchStorageEstimate = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
        const estimate = await navigator.storage.estimate();
        const totalSize = audioCacheService.getMetadataList().reduce((acc, curr) => acc + (curr.size || 0), 0);
        setStorageStats({
          usedBytes: totalSize,
          estimatedAvailable: (estimate.quota || 0) - (estimate.usage || 0),
          estimatedQuota: estimate.quota || 0,
          supported: true
        });
      } else {
        const totalSize = audioCacheService.getMetadataList().reduce((acc, curr) => acc + (curr.size || 0), 0);
        setStorageStats({
          usedBytes: totalSize,
          estimatedAvailable: 1024 * 1024 * 1024 * 1.5, // 1.5 GB Estimated Free
          estimatedQuota: 1024 * 1024 * 1024 * 4, // 4 GB Estimated Total
          supported: false
        });
      }
    } catch (e) {
      const totalSize = audioCacheService.getMetadataList().reduce((acc, curr) => acc + (curr.size || 0), 0);
      setStorageStats({
        usedBytes: totalSize,
        estimatedAvailable: 1024 * 1024 * 1024 * 1.5,
        estimatedQuota: 1024 * 1024 * 1024 * 4,
        supported: false
      });
    }
  };

  const handleSaveToDevice = async (item: CachedAudioInfo, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = item.url;
    setSavingUrls(prev => ({ ...prev, [url]: 'loading' }));

    try {
      let blob: Blob | null = null;
      
      // 1. Try reading from Cache Storage (instant and offline)
      try {
        const cache = await caches.open('quran-offline-audio-v1');
        const response = await cache.match(url);
        if (response) {
          blob = await response.blob();
        }
      } catch (cacheErr) {
        console.warn('Cache fetch for device saving failed, retrying network...', cacheErr);
      }

      // 2. Fetch from source URL if not stored
      if (!blob) {
        const response = await fetch(url, { mode: 'cors' });
        if (!response.ok) throw new Error(`Fetch status ${response.status}`);
        blob = await response.blob();
      }

      // 3. Trigger standard download
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `${item.surahName} - ${item.reciterName}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);

      setSavingUrls(prev => ({ ...prev, [url]: 'success' }));
      setTimeout(() => {
        setSavingUrls(prev => ({ ...prev, [url]: null }));
      }, 2000);
    } catch (err: any) {
      console.error('Failed to download MP3 file to device', err);
      try {
        const a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        a.download = `${item.surahName} - ${item.reciterName}.mp3`;
        a.click();
      } catch (e) {}
      
      setSavingUrls(prev => ({ ...prev, [url]: null }));
    }
  };

  const handleRemove = async (url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (playingUrl === url) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingUrl(null);
      setIsPlaying(false);
    }
    const success = await audioCacheService.removeCachedAudio(url);
    if (success) {
      loadDownloads();
      fetchStorageEstimate();
    }
  };

  const handleClearAll = async () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setPlayingUrl(null);
    setIsPlaying(false);
    
    await audioCacheService.clearAllCache();
    loadDownloads();
    fetchStorageEstimate();
    setShowConfirmClearAll(false);
  };

  const handlePlayPause = async (url: string) => {
    if (playingUrl === url) {
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      } else {
        audioRef.current?.play().catch(e => console.warn('Play resumed failed:', e));
        setIsPlaying(true);
      }
    } else {
      setPlayingUrl(url);
      setIsPlaying(true);
      
      if (audioRef.current) {
        const cachedUrl = await audioCacheService.getCachedAudioUrl(url);
        if (cachedUrl) {
          audioRef.current.src = cachedUrl;
          audioRef.current.play().catch(e => {
            console.error('Failed to play cached audio', e?.message || e);
            setIsPlaying(false);
            setPlayingUrl(null);
          });
        } else {
          // File missing from cache, remove metadata to sync
          await audioCacheService.removeCachedAudio(url);
          loadDownloads();
          fetchStorageEstimate();
          setIsPlaying(false);
          setPlayingUrl(null);
        }
      }
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "00:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const formatSize = (bytes: number) => {
    if (bytes <= 0) return "0.0 MB";
    const mb = bytes / (1024 * 1024);
    if (mb >= 1024) {
      return `${(mb / 1024).toFixed(1)} GB`;
    }
    return `${mb.toFixed(1)} MB`;
  };

  // Extract unique reciters present in downloads for filtering
  const uniqueReciters = React.useMemo(() => {
    const reciterMap = new Map<number, string>();
    downloads.forEach(d => {
      if (d.reciterId && d.reciterName) {
        reciterMap.set(d.reciterId, d.reciterName);
      }
    });
    return Array.from(reciterMap.entries()).map(([id, name]) => ({ id, name }));
  }, [downloads]);

  // Combined search, filter & sorting logic
  const filteredDownloads = React.useMemo(() => {
    return downloads
      .filter(item => {
        const query = searchQuery.trim().toLowerCase();
        const matchesQuery = !query || 
          item.surahName.toLowerCase().includes(query) ||
          item.reciterName.toLowerCase().includes(query) ||
          (item.surahNumber && String(item.surahNumber).includes(query));
        const matchesReciter = selectedReciterId === 'all' || String(item.reciterId) === selectedReciterId;
        return matchesQuery && matchesReciter;
      })
      .sort((a, b) => {
        if (sortBy === 'recent') {
          return b.downloadedAt - a.downloadedAt;
        }
        if (sortBy === 'size-desc') {
          return b.size - a.size;
        }
        if (sortBy === 'size-asc') {
          return a.size - b.size;
        }
        if (sortBy === 'surah-asc') {
          return (a.surahNumber || 0) - (b.surahNumber || 0);
        }
        return 0;
      });
  }, [downloads, searchQuery, selectedReciterId, sortBy]);

  // Progress Bar for current storage consumption (Visual Limit indicator of 512MB for quick reference)
  const storageLimitReference = 1000 * 1024 * 1024; // 1 GB benchmark tracker
  const memoryUtilizationPercent = Math.min(100, (storageStats.usedBytes / storageLimitReference) * 100);

  return (
    <div className="flex flex-col gap-6 py-6 px-4 pb-20 w-full min-h-screen overflow-y-auto custom-scrollbar relative bg-slate-50 dark:bg-slate-950">
      <div className="flex items-center justify-between mb-2 sticky top-0 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-md pb-4 z-10 pt-2 -mx-4 px-4 shadow-sm border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <BackButton fallbackPath="/quran-audio" />
          <div>
            <h1 className="text-xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
              التنزيلات المحفوظة
              <HardDrive className="text-emerald-500" size={20} />
            </h1>
            <p className="text-[10px] font-bold text-[#218510]/80 mt-0.5 flex items-center gap-1">
              <WifiOff size={10} /> الاستماع بدون إنترنت نشط
            </p>
          </div>
        </div>
      </div>

      <audio 
        ref={audioRef}
        onTimeUpdate={() => {
          if (audioRef.current) {
            setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
            setDuration(audioRef.current.duration);
          }
        }}
        onError={async (e) => {
          if (playingUrl) {
            console.warn("Cached audio file is unplayable, removing...");
            await audioCacheService.removeCachedAudio(playingUrl);
            loadDownloads();
            fetchStorageEstimate();
            setIsPlaying(false);
            setPlayingUrl(null);
          }
        }}
        onEnded={() => {
          setIsPlaying(false);
          setPlayingUrl(null);
        }}
      />

      {/* STORAGE & PERSISTENCE MANAGEMENT DASHBOARD */}
      {downloads.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 rounded-[2rem] p-5 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col gap-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <HardDrive size={20} />
              </div>
              <div>
                <h2 className="font-black text-sm text-slate-800 dark:text-slate-100">إدارة مساحة التخزين هاتفياً</h2>
                <p className="text-[10px] font-semibold text-slate-500">حجم الملفات الإجمالي المخزن محلياً</p>
              </div>
            </div>

            <button
              id="clear-all-downloads-trigger"
              onClick={() => setShowConfirmClearAll(true)}
              className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-950/40 text-rose-500 dark:text-rose-400 bg-rose-500/5 hover:bg-rose-500 hover:text-white transition-all text-[11px] font-black active:scale-95 duration-100 flex items-center gap-1 shrink-0"
            >
              <Trash2 size={12} />
              حذف كافة التنزيلات
            </button>
          </div>

          <div className="space-y-2 mt-1">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-1 text-slate-800 dark:text-white font-black">
                <span className="text-sm text-emerald-600 dark:text-emerald-400">{formatSize(storageStats.usedBytes)}</span>
                <span className="text-[10px] text-slate-400 font-normal">({downloads.length} سورة محفوظة)</span>
              </div>
              <span className="text-[10px]">مستهدف التخزين المؤقت</span>
            </div>

            {/* Custom storage consumption visual progress rail */}
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-500 rounded-full"
                style={{ width: `${memoryUtilizationPercent}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-[9px] font-bold text-slate-400">
              <span>0 MB</span>
              <span className="text-emerald-600/80 font-black">1000 MB</span>
            </div>
          </div>

          <div className="text-[10px] bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800 font-bold text-slate-500 dark:text-slate-400 flex gap-2 items-start leading-relaxed">
            <Info size={14} className="text-emerald-600 shrink-0 mt-0.5" />
            <span>
              نظام التخزين محمي ذاتياً. عند اقتراب امتلاء ذاكرة الهاتف الإجمالية، سيقوم المتصفح بإفساح مساحة مؤقتاً. يمكنك تنزيل ملفات الصوت بصيغة MP3 وحفظها بشكل دائم على مدير الملفات بهاتفك في أي وقت.
            </span>
          </div>
        </motion.div>
      )}

      {/* FILTER & SEARCH BAR SECTION */}
      {downloads.length > 0 && (
        <div className="flex flex-col gap-3">
          {/* SEARCH FIELD */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 px-3 py-2 flex items-center gap-2 shadow-sm focus-within:ring-2 focus-within:ring-[#218510]/50 transition-all">
            <Search className="text-slate-400 shrink-0" size={18} />
            <input
              id="download-search-input"
              type="text"
              dir="rtl"
              placeholder="ابحث باسم السورة أو الشيخ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-sm w-full outline-none font-bold text-slate-800 dark:text-white placeholder-slate-400"
            />
            {searchQuery && (
              <button 
                id="clear-search-btn"
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* ADVANCED MULTI-FILTER DROPDOWNS */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* RECITER FILTER */}
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mr-1">تصفية حسب الشيخ</label>
              <select
                id="reciter-filter-select"
                value={selectedReciterId}
                onChange={(e) => setSelectedReciterId(e.target.value)}
                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs font-bold p-2.5 rounded-xl outline-none text-slate-700 dark:text-slate-200 shadow-sm"
              >
                <option value="all">الكل ({uniqueReciters.length})</option>
                {uniqueReciters.map(reciter => (
                  <option key={reciter.id} value={String(reciter.id)}>{reciter.name}</option>
                ))}
              </select>
            </div>

            {/* SORT BY DROPDOWN */}
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mr-1">فرز وترتيب الملفات</label>
              <select
                id="sort-by-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs font-bold p-2.5 rounded-xl outline-none text-slate-700 dark:text-slate-200 shadow-sm"
              >
                <option value="recent">الأحدث تنزيلاً</option>
                <option value="size-desc">الحجم الأكبر</option>
                <option value="size-asc">الحجم الأصغر</option>
                <option value="surah-asc">ترتيب المصحف</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 rounded-full border-4 text-emerald-500 animate-spin" />
        </div>
      ) : downloads.length === 0 ? (
        <EmptyStatePlaceholder
          title="لا توجد تنزيلات"
          description="قم بتنزيل السور من قائمة القراء وسوف تظهر هنا للاستماع إليها بدون اتصال بالإنترنت في أي وقت."
          variant="empty"
        />
      ) : filteredDownloads.length === 0 ? (
        <EmptyStatePlaceholder
          title="لا توجد نتائج"
          description="لا توجد نتائج مطابقة لبحثك في التنزيلات."
          variant="search"
        />
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-2 text-[10px] font-black text-slate-400 uppercase tracking-wider">
            <span>القائمة المصفّاة ({filteredDownloads.length})</span>
            {searchQuery || selectedReciterId !== 'all' ? (
              <button 
                id="reset-filters-btn"
                onClick={() => { setSearchQuery(''); setSelectedReciterId('all'); }}
                className="text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                إعادة ضبط للتصفية
              </button>
            ) : null}
          </div>

          {filteredDownloads.map((item, idx) => (
            <motion.div
              key={item.url}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => handlePlayPause(item.url)}
              className={cn(
                "p-4 rounded-2xl cursor-pointer transition-all border flex items-center justify-between group transform transition-all duration-75 active:scale-[0.98] active:opacity-90",
                playingUrl === item.url 
                  ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900"
                  : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-emerald-500/30 shadow-sm"
              )}
            >
              <div className="flex items-center gap-4">
                <button
                  id={`play-download-${item.surahNumber}-${item.reciterId}`}
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center transform transition-all duration-75 active:scale-[0.85] active:opacity-70",
                    playingUrl === item.url
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                      : "bg-slate-50 dark:bg-slate-850 text-slate-450 hover:text-emerald-600 group-hover:bg-emerald-500/10"
                  )}
                >
                  {playingUrl === item.url && isPlaying ? (
                    <Pause size={20} className="fill-current" />
                  ) : (
                    <Play size={20} className="fill-current ml-1" />
                  )}
                </button>
                
                <div className="flex flex-col gap-1 text-right">
                  <h3 className={cn("font-black text-base flex items-center gap-2", playingUrl === item.url ? "text-emerald-800 dark:text-emerald-400" : "text-slate-800 dark:text-slate-100")}>
                    {item.surahName}
                    {playingUrl === item.url && (
                      <Volume2 size={14} className="animate-pulse text-emerald-600" />
                    )}
                  </h3>
                  <div className="flex items-center gap-2 text-xs font-bold opacity-70">
                    <span className="text-amber-600 dark:text-amber-400">{item.reciterName}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                    <span className="text-slate-500">{formatSize(item.size)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  id={`save-download-to-device-${item.surahNumber}`}
                  onClick={(e) => handleSaveToDevice(item, e)}
                  disabled={savingUrls[item.url] === 'loading'}
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center border transform transition-all duration-75 active:scale-[0.85] active:opacity-70 shadow-sm shrink-0",
                    savingUrls[item.url] === 'success'
                      ? "bg-emerald-600 border-emerald-600 text-white"
                      : savingUrls[item.url] === 'loading'
                        ? "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-emerald-600"
                        : "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 dark:hover:bg-emerald-600 hover:text-white dark:hover:text-white hover:border-emerald-600"
                  )}
                  title="حفظ كملف MP3 على الهاتف"
                >
                  {savingUrls[item.url] === 'loading' ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : savingUrls[item.url] === 'success' ? (
                    <CheckCircle2 size={16} />
                  ) : (
                    <FileDown size={16} />
                  )}
                </button>

                <button
                  id={`delete-download-${item.surahNumber}-${item.reciterId}`}
                  onClick={(e) => handleRemove(item.url, e)}
                  className="w-10 h-10 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-400 hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/40 transform transition-all duration-75 active:scale-[0.85] active:opacity-70 opacity-80 hover:opacity-100 shadow-sm shrink-0"
                  title="حذف المقطع"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* CONFIRM BULK ERASE MODAL */}
      <AnimatePresence>
        {showConfirmClearAll && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirmClearAll(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full border border-slate-100 dark:border-slate-800 shadow-2xl relative z-10 text-center"
            >
              <div className="w-14 h-14 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldAlert size={28} />
              </div>
              <h3 className="text-lg font-black text-slate-800 dark:text-white mb-2">حذف جميع التنزيلات؟</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium leading-relaxed">
                هل أنت متأكد من رغبتك في حذف جميع السور المحملة؟ سيتعين عليك تحميلها مجدداً في حال رغبت في الاستماع إليها بدون اتصال بالإنترنت.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  id="cancel-clear-all-btn"
                  onClick={() => setShowConfirmClearAll(false)}
                  className="py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-855 text-slate-600 dark:text-slate-300 font-bold text-sm transform transition-all hover:bg-slate-200 dark:hover:bg-slate-800 active:scale-95 duration-100"
                >
                  تراجع
                </button>
                <button
                  id="confirm-clear-all-btn"
                  onClick={handleClearAll}
                  className="py-3 px-4 rounded-xl bg-rose-600 text-white font-black text-sm transform transition-all hover:bg-rose-700 active:scale-95 duration-100 shadow-lg shadow-rose-600/20"
                >
                  تأكيد الحذف
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Mini Player for Downloads */}
      {playingUrl && (
        <motion.div 
          drag
          dragMomentum={false}
          dragElastic={0.1}
          className="fixed bottom-20 right-4 z-40 flex items-center gap-2 group cursor-move transform-gpu transition-shadow duration-300"
          whileDrag={{ scale: 1.05, boxShadow: "0 20px 40px rgba(0,0,0,0.4)" }}
        >
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-850 shadow-2xl rounded-full p-1.5 flex items-center gap-2 animate-in fade-in slide-in-from-right-4">
            <div className="absolute -top-1 left-4 right-4 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden pointer-events-none shadow-sm">
              <div 
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            <button
              id="mini-player-toggle"
              onClick={() => handlePlayPause(playingUrl)}
              className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg outline-none transform transition-all duration-75 active:scale-[0.85] active:opacity-70"
            >
              {isPlaying ? <Pause size={16} className="fill-current" /> : <Play size={16} className="fill-current ml-0.5" />}
            </button>

            <div className="flex flex-col pr-1 max-w-[0px] group-hover:max-w-[120px] overflow-hidden transition-all duration-200 ease-in-out whitespace-nowrap opacity-0 group-hover:opacity-100">
              <p className="text-[10px] font-bold text-slate-800 dark:text-white leading-none">سورة {downloads.find(d => d.url === playingUrl)?.surahName || ''}</p>
              <p className="text-[8px] text-emerald-600 dark:text-emerald-450 mt-0.5 font-bold tracking-tighter">{formatTime(audioRef.current?.currentTime || 0)} / {formatTime(duration)}</p>
            </div>

            <button
              id="mini-player-close"
              onClick={() => {
                if (audioRef.current) audioRef.current.pause();
                setPlayingUrl(null);
                setIsPlaying(false);
              }}
              className="w-8 h-8 text-slate-400 hover:text-rose-500 rounded-full flex items-center justify-center transform transition-all duration-75 active:scale-[0.85] active:opacity-70 hover:bg-slate-100 dark:hover:bg-slate-800 outline-none"
            >
              <X size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
