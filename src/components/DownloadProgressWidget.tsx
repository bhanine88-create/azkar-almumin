import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useDownloadManager } from '../context/DownloadContext';
import { 
  Download, 
  X, 
  ChevronUp, 
  ChevronDown, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Trash2, 
  Radio, 
  Zap, 
  ListOrdered,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAppContext } from '../AppContext';
import { formatBytes } from '../services/audioCacheService';

export const DownloadProgressWidget: React.FC = () => {
  const { 
    downloads, 
    cancelDownload, 
    removeDownloadItem, 
    clearCompletedDownloads, 
    activeDownloadsCount 
  } = useDownloadManager();
  const { settings } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [isCompact, setIsCompact] = useState(false);

  // Active, finished and failed items
  const activeItems = downloads.filter(d => d.status === 'downloading' || d.status === 'pending');
  const currentActiveItem = downloads.find(d => d.status === 'downloading') || activeItems[0];
  const finishedItems = downloads.filter(d => d.status === 'completed');
  const failedItems = downloads.filter(d => d.status === 'failed');

  // Auto-dismiss completed capsule/card after 3 seconds (fade-out) if drawer is not open
  useEffect(() => {
    if (!isOpen && activeDownloadsCount === 0 && finishedItems.length > 0) {
      const timer = setTimeout(() => {
        clearCompletedDownloads();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, activeDownloadsCount, finishedItems.length, clearCompletedDownloads]);

  if (downloads.length === 0) return null;

  const isRtl = ['ar', 'ur'].includes(settings.appLanguage || 'ar');

  // Overall progress calculation
  const overallProgress = activeItems.length > 0
    ? Math.round(activeItems.reduce((acc, curr) => acc + curr.progress, 0) / activeItems.length)
    : 100;

  const handleClose = () => {
    setIsOpen(false);
    if (activeDownloadsCount === 0) {
      clearCompletedDownloads();
    }
  };

  const currentProgress = currentActiveItem ? currentActiveItem.progress : overallProgress;

  return (
    <div 
      className={cn(
        "fixed z-[60] bottom-[84px] md:bottom-[90px] w-full max-w-[450px] px-3.5 pointer-events-none transition-all duration-300",
        isRtl ? "left-[50%] -translate-x-[50%]" : "right-[50%] translate-x-[50%]"
      )}
    >
      <div className="w-full flex flex-col items-center gap-2">
        {/* Active Download Progress Bar & Controls */}
        <AnimatePresence>
          {!isOpen && activeDownloadsCount > 0 && (
            <motion.div
              id="active-downloads-progress-container"
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="pointer-events-auto w-full"
            >
              {isCompact ? (
                /* Compact Capsule mode if toggled */
                <div className="flex justify-end">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-full shadow-xl border border-emerald-400/30 bg-emerald-600 text-white font-bold text-xs select-none">
                    <Loader2 size={14} className="animate-spin" />
                    <span>تحميل {activeDownloadsCount} مواد ({overallProgress}%)</span>
                    <button 
                      onClick={() => setIsCompact(false)} 
                      className="p-0.5 hover:bg-white/20 rounded"
                      title="تكبير شريط التقدم"
                    >
                      <Maximize2 size={13} />
                    </button>
                    <button 
                      onClick={() => setIsOpen(true)} 
                      className="p-0.5 hover:bg-white/20 rounded"
                      title="عرض التفاصيل"
                    >
                      <ChevronUp size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                /* Full Accurate Progress Bar Card */
                <div className="w-full rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-emerald-500/25 dark:border-emerald-500/20 shadow-2xl p-3.5 transition-all text-slate-800 dark:text-white">
                  {/* Top Bar: Title, Reciter, and Percentage Badge */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/15 dark:bg-emerald-500/20 text-[#218510] dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                        <Loader2 size={16} className="animate-spin" />
                      </div>
                      <div className="min-w-0 flex-1 text-right">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-black truncate leading-tight">
                            {currentActiveItem ? currentActiveItem.name : 'جاري التحميل في الخلفية'}
                          </h4>
                          {activeDownloadsCount > 1 && (
                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 shrink-0">
                              (1 من {activeDownloadsCount})
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-extrabold truncate mt-0.5">
                          {currentActiveItem ? currentActiveItem.subName : 'المكتبة الصوتية'}
                        </p>
                      </div>
                    </div>

                    {/* Percentage and Controls */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <div className="px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-[#218510] dark:text-emerald-300 font-mono font-black text-xs shadow-xs">
                        {currentProgress}%
                      </div>
                      <button
                        onClick={() => setIsCompact(true)}
                        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title="تصغير شريط التقدم"
                      >
                        <Minimize2 size={14} />
                      </button>
                      <button
                        onClick={() => setIsOpen(true)}
                        className="p-1 text-slate-400 hover:text-[#218510] dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title="عرض قائمة التحميلات"
                      >
                        <ChevronUp size={16} />
                      </button>
                      {currentActiveItem && (
                        <button
                          onClick={() => cancelDownload(currentActiveItem.id)}
                          className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                          title="إلغاء التحميل الحالي"
                        >
                          <X size={15} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Accurate Linear Progress Bar Track */}
                  <div className="relative w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner border border-slate-200/50 dark:border-slate-700/50">
                    <motion.div
                      className="h-full bg-gradient-to-r from-[#218510] via-emerald-500 to-teal-400 rounded-full relative"
                      style={{ width: `${currentProgress}%` }}
                      transition={{ ease: 'easeOut', duration: 0.2 }}
                    >
                      {/* Subtle animated highlight stripe */}
                      <div className="absolute inset-0 bg-white/20 animate-pulse" />
                    </motion.div>
                  </div>

                  {/* Bottom Stats: Bytes, Speed, and Status */}
                  <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-bold mt-1.5 px-0.5">
                    <div className="flex items-center gap-2 font-mono">
                      {currentActiveItem?.loadedBytes ? (
                        <span>
                          {formatBytes(currentActiveItem.loadedBytes)} / {formatBytes(currentActiveItem.totalBytes || 0)}
                        </span>
                      ) : (
                        <span>جاري استقبال البيانات...</span>
                      )}
                      {currentActiveItem?.speed && (
                        <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400">
                          <Zap size={11} className="fill-current" />
                          {currentActiveItem.speed}
                        </span>
                      )}
                    </div>
                    <span className="text-[9px] text-[#218510] dark:text-emerald-400/90 font-extrabold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      تحميل في الخلفية
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Completed State Capsule / Card */}
          {!isOpen && activeDownloadsCount === 0 && finishedItems.length > 0 && (
            <motion.div
              id="completed-downloads-capsule-pill"
              initial={{ scale: 0.85, opacity: 0, y: 25 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ 
                opacity: 0, 
                scale: 0.9, 
                y: 15, 
                filter: 'blur(3px)',
                transition: { duration: 0.5, ease: "easeOut" } 
              }}
              transition={{ type: 'spring', damping: 24, stiffness: 280 }}
              className="pointer-events-auto flex items-center gap-1.5 pl-1.5 pr-3 py-2 rounded-2xl shadow-xl border border-emerald-300 dark:border-emerald-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl text-emerald-700 dark:text-emerald-300 font-bold text-xs select-none hover:shadow-2xl transition-all"
            >
              {/* Clickable section to expand drawer */}
              <button
                id="open-completed-downloads-drawer-btn"
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 cursor-pointer focus:outline-none"
                title="عرض تفاصيل التحميلات"
                aria-label="عرض تفاصيل التحميلات"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-slate-800 dark:text-white">اكتمل التحميل بنجاح (100%)</span>
                    <span className="text-[10px] bg-emerald-500 text-white font-extrabold px-1.5 py-0.5 rounded-full">+15 نقطة</span>
                  </div>
                  <p className="text-[9px] text-slate-400 dark:text-slate-500 font-medium">جاهز للاستماع أوفلاين دون إنترنت</p>
                </div>
                <ChevronUp size={14} className="shrink-0 text-emerald-600 dark:text-emerald-400 ml-1" />
              </button>

              {/* Divider */}
              <div className="h-5 w-[1px] bg-slate-200 dark:bg-slate-800 mx-1 shrink-0" />

              {/* Close Button (علامة إغلاق X) */}
              <button
                id="close-completed-capsule-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  clearCompletedDownloads();
                }}
                className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors shrink-0"
                title="إغلاق كبسولة التحميل"
                aria-label="إغلاق كبسولة التحميل"
              >
                <X size={15} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Expanded Downloads Panel / Drawer */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ y: 150, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 150, opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="pointer-events-auto w-full bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col max-h-[380px]"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 shrink-0 select-none">
                <div className="flex items-center gap-2.5">
                  <div className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-sm",
                    activeDownloadsCount > 0 ? "bg-[#218510]" : "bg-emerald-600"
                  )}>
                    {activeDownloadsCount > 0 ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Download size={16} />
                    )}
                  </div>
                  <div className="text-right">
                    <h3 className="text-xs font-black text-slate-800 dark:text-white leading-normal">
                      مدير التحميلات الصوتية
                    </h3>
                    <p className="text-[9px] text-slate-500 dark:text-slate-400 font-extrabold">
                      {activeDownloadsCount > 0 
                        ? `جاري تحميل ${activeDownloadsCount} مواد (${overallProgress}%)` 
                        : 'كل الملفات تم تنزيلها وحفظها محلياً'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {downloads.some(d => d.status === 'completed' || d.status === 'failed') && (
                    <button 
                      id="clear-all-completed-btn"
                      onClick={clearCompletedDownloads}
                      className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                      title="مسح التحميلات المكتملة"
                      aria-label="مسح التحميلات المكتملة"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                  <button 
                    id="minimize-drawer-btn"
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
                    title="تصغير إلى شريط التقدم"
                    aria-label="تصغير إلى شريط التقدم"
                  >
                    <ChevronDown size={17} />
                  </button>
                  <button 
                    id="close-drawer-btn"
                    onClick={handleClose}
                    className="p-1.5 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 rounded-lg bg-slate-200/70 hover:bg-rose-100 dark:bg-slate-800 dark:hover:bg-rose-950/50 transition-colors font-bold"
                    title="إغلاق مدير التحميلات"
                    aria-label="إغلاق مدير التحميلات"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Downloads List */}
              <div className="flex-1 overflow-y-auto px-2 py-2 space-y-2 max-h-[300px] divide-y divide-slate-100 dark:divide-slate-800/60">
                {downloads.map((item) => (
                  <div 
                    key={item.id} 
                    className="pt-2 first:pt-0 p-2 rounded-xl hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-all"
                  >
                    <div className="flex items-center justify-between gap-2.5">
                      {/* Status Icon */}
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                        {item.status === 'completed' && (
                          <CheckCircle2 size={18} className="text-emerald-500" />
                        )}
                        {item.status === 'failed' && (
                          <AlertCircle size={18} className="text-rose-500" />
                        )}
                        {(item.status === 'downloading' || item.status === 'pending') && (
                          <span className="font-mono text-[10px] font-black text-[#218510] dark:text-emerald-400">
                            {item.progress}%
                          </span>
                        )}
                      </div>

                      {/* Meta info */}
                      <div className="flex-1 min-w-0 text-right">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-[11px] font-black text-slate-800 dark:text-white truncate">
                            {item.name}
                          </h4>
                          {(item.status === 'downloading' || item.status === 'pending') && (
                            <span className="font-mono text-[10px] font-black text-[#218510] dark:text-emerald-400">
                              {item.progress}%
                            </span>
                          )}
                        </div>
                        <p className="text-[9px] text-slate-500 dark:text-slate-400 font-bold truncate mt-0.5">
                          {item.subName} • {
                            item.type === 'quran' ? 'القرآن الكريم' :
                            item.type === 'tafsir' ? 'التفسير الصوتي' : 'محاضرات ودروس'
                          }
                        </p>
                      </div>

                      {/* Controls */}
                      <div className="shrink-0 flex items-center gap-1.5">
                        {item.status === 'completed' ? (
                          <>
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md select-none font-sans bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                              جاهز
                            </span>
                            <button
                              id={`remove-item-${item.id}`}
                              onClick={() => removeDownloadItem(item.id)}
                              className="p-1 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                              title="إزالة من القائمة"
                              aria-label="إزالة من القائمة"
                            >
                              <X size={14} />
                            </button>
                          </>
                        ) : item.status === 'failed' ? (
                          <>
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md select-none font-sans bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">
                              فشل
                            </span>
                            <button
                              id={`remove-item-${item.id}`}
                              onClick={() => removeDownloadItem(item.id)}
                              className="p-1 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                              title="إزالة من القائمة"
                              aria-label="إزالة من القائمة"
                            >
                              <X size={14} />
                            </button>
                          </>
                        ) : (
                          <button
                            id={`cancel-download-${item.id}`}
                            onClick={() => cancelDownload(item.id)}
                            className="p-1 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-all"
                            title="إلغاء التحميل"
                            aria-label="إلغاء التحميل"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Accurate Progress Bar for this item if downloading */}
                    {(item.status === 'downloading' || item.status === 'pending') && (
                      <div className="mt-2 pr-10">
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-[#218510] to-teal-400 rounded-full transition-all duration-150"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                        {item.loadedBytes ? (
                          <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 dark:text-slate-500 mt-1">
                            <span>{formatBytes(item.loadedBytes)} / {formatBytes(item.totalBytes || 0)}</span>
                            {item.speed && <span className="text-emerald-600 dark:text-emerald-400">⚡ {item.speed}</span>}
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DownloadProgressWidget;
