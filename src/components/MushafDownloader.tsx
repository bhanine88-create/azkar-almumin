import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Download, Check, Trash2, RefreshCw, AlertCircle, HardDrive } from 'lucide-react';
import { mushafService, MUSHAF_EDITIONS } from '../services/mushafService';
import { cn } from '../lib/utils';
import { useQuranSettings } from '../context/QuranSettingsContext';

import { useTranslation } from '../i18n';
import { useAppContext } from '../AppContext';

export const MushafDownloader: React.FC = () => {
  const { mushafEdition, setMushafEdition } = useQuranSettings() as any;
  const { settings, downloadProgress, startDownloadEdition } = useAppContext();
  const { t } = useTranslation(settings.appLanguage);
  
  const [isDownloadedMap, setIsDownloadedMap] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAllEditions();
  }, []);

  const checkAllEditions = async () => {
    setLoading(true);
    const states: Record<string, boolean> = {};
    for (const key of Object.keys(MUSHAF_EDITIONS)) {
      states[key] = await mushafService.isEditionDownloaded(key);
    }
    setIsDownloadedMap(states);
    setLoading(false);
  };

  const handleDownload = async (editionId: string) => {
    await startDownloadEdition(editionId);
    await checkAllEditions(); // Update isDownloadedMap after download
  };

  const handleRemove = async (editionId: string) => {
    if (window.confirm(t('confirm_delete_mushaf_edition', 'هل أنت متأكد من حذف هذه النسخة؟ ستحتاج للإنترنت لعرضها لاحقاً.'))) {
      await mushafService.removeEdition(editionId);
      await checkAllEditions();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="animate-spin text-white/40" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <HardDrive size={14} className="text-white/40" />
        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{t('mushaf_download_manager')}</p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {Object.values(MUSHAF_EDITIONS).map((edition) => {
          const isDownloaded = !!isDownloadedMap[edition.id];
          const downloadState = downloadProgress[edition.id] || { isDownloading: false, progress: 0 };
          
          const isSelected = mushafEdition === edition.id;
          const progressPercent = Math.round((downloadState.progress / edition.totalPage) * 100);
          const editionName = t(`mushaf_${edition.id}` as any);

          return (
            <div 
              key={edition.id}
              className={cn(
                "relative bg-white/5 border rounded-2xl p-4 transition-all overflow-hidden",
                isSelected ? "border-teal-500/50 bg-teal-500/5" : "border-white/10"
              )}
            >
              <div className="flex items-center justify-between mb-3 relative z-10">
                <div className="flex items-center gap-3">
                  <div 
                    onClick={() => setMushafEdition(edition.id)}
                    className={cn(
                      "w-4 h-4 rounded-full border-2 cursor-pointer flex items-center justify-center transition-all",
                      isSelected ? "border-teal-500 bg-teal-500" : "border-white/20 hover:border-white/40"
                    )}
                  >
                    {isSelected && <Check size={10} className="text-white" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white">{editionName}</h4>
                    <p className="text-[10px] text-white/40 font-bold">{edition.totalPage} {t('page')} • {t('excellent')}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isDownloaded ? (
                    <button 
                      onClick={() => handleRemove(edition.id)}
                      className="p-2 bg-rose-500/10 text-rose-400 rounded-xl hover:bg-rose-500/20 transition-all"
                      title={t('delete')}
                    >
                      <Trash2 size={16} />
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleDownload(edition.id)}
                      disabled={downloadState.isDownloading}
                      className={cn(
"flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all transform transition-all duration-75 active:scale-[0.95] active:opacity-80",
                        downloadState.isDownloading 
                          ? "bg-white/10 text-white/40 cursor-not-allowed" 
                          : "bg-teal-600 text-white shadow-lg shadow-teal-600/20 hover:scale-105 duration-75 active:scale-[0.85] active:opacity-70"
                      )}
                    >
                      {downloadState.isDownloading ? (
                        <RefreshCw size={14} className="animate-spin" />
                      ) : (
                        <Download size={14} />
                      )}
                      {downloadState.isDownloading ? `${t('downloading')} ${progressPercent}%` : t('download')}
                    </button>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              {downloadState.isDownloading && (
                <div className="relative h-1.5 bg-white/5 rounded-full overflow-hidden mt-2">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    className="absolute inset-y-0 left-0 bg-teal-500"
                  />
                </div>
              )}

              {isDownloaded && !downloadState.isDownloading && (
                <div className="flex items-center gap-1.5 text-[9px] font-black text-emerald-400/80 mt-1 uppercase tracking-tighter">
                  <Check size={10} />
                  {t('mushaf_offline_ready')}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl flex gap-3 items-start">
        <AlertCircle size={14} className="text-amber-500 shrink-0 mt-0.5" />
        <p className="text-[10px] text-amber-200/80 leading-relaxed font-bold">
          {t('mushaf_download_desc')}
        </p>
      </div>
    </div>
  );
};
