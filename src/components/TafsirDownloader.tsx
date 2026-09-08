
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Download, Check, Trash2, RefreshCw, AlertCircle, BookOpen } from 'lucide-react';
import { tafsirService, TAFSIR_EDITIONS } from '../services/tafsirService';
import { cn } from '../lib/utils';
import { useQuranSettings } from '../context/QuranSettingsContext';
import { useTranslation } from '../i18n';
import { useAppContext } from '../AppContext';

export const TafsirDownloader: React.FC = () => {
  const { tafsirType, setTafsirType } = useQuranSettings();
  const { settings } = useAppContext();
  const { t } = useTranslation(settings.appLanguage);
  const [downloadStates, setDownloadStates] = useState<Record<string, {
    isDownloaded: boolean,
    isDownloading: boolean,
    progress: number
  }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAllEditions();
  }, []);

  const checkAllEditions = async () => {
    setLoading(true);
    const states: Record<string, any> = {};
    for (const key of Object.keys(TAFSIR_EDITIONS)) {
      const isDownloaded = await tafsirService.isEditionDownloaded(key);
      const progress = await tafsirService.getDownloadProgress(key);
      states[key] = {
        isDownloaded,
        isDownloading: false,
        progress: progress
      };
    }
    setDownloadStates(states);
    setLoading(false);
  };

  const handleDownload = async (editionId: string) => {
    setDownloadStates(prev => ({
      ...prev,
      [editionId]: { ...prev[editionId], isDownloading: true }
    }));

    try {
      await tafsirService.downloadEdition(editionId, (progress) => {
        setDownloadStates(prev => ({
          ...prev,
          [editionId]: { ...prev[editionId], progress }
        }));
      });
      
      setDownloadStates(prev => ({
        ...prev,
        [editionId]: { ...prev[editionId], isDownloading: false, isDownloaded: true }
      }));
    } catch (error) {
      console.error(error);
      setDownloadStates(prev => ({
        ...prev,
        [editionId]: { ...prev[editionId], isDownloading: false }
      }));
      alert(t('download_failed', 'فشل التحميل. يرجى التحقق من الاتصال بالإنترنت.'));
    }
  };

  const handleRemove = async (editionId: string) => {
    if (window.confirm(t('confirm_delete_tafsir', 'هل أنت متأكد من حذف هذا التفسير؟'))) {
      await tafsirService.removeEdition(editionId);
      await checkAllEditions();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="animate-spin text-teal-500/40" />
      </div>
    );
  }

  const getEditionDisplayName = (id: string, fallback: string) => {
    const map: Record<string, string> = {
      'ar.muyassar': t('tafsir_muyassar', 'التفسير الميسر'),
      'ar.jalalayn': t('tafsir_jalalayn', 'تفسير الجلالين'),
      'ar.waseet': t('tafsir_waseet', 'التفسير الوسيط'),
      'ar.qurtubi': t('tafsir_qurtubi', 'تفسير القرطبي'),
      'ar.baghawi': t('tafsir_baghawi', 'تفسير البغوي'),
      'ar.miqbas': t('tafsir_miqbas', 'تفسير ابن عباس'),
      'en.sahih': t('tafsir_en_sahih', 'English: Sahih International'),
      'fr.hamidullah': t('tafsir_fr_hamidullah', 'Français: Hamidullah'),
      'tr.ates': t('tafsir_tr_ates', 'Türkçe: Süleyman Ateş'),
      'ur.ahmedali': t('tafsir_ur_ahmedali', 'اردو: احمد علی'),
      'id.indonesian': t('tafsir_id_indonesian', 'Bahasa Indonesia: Kemenag')
    };
    return map[id] || fallback;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <BookOpen size={14} className="text-teal-500/40" />
        <p className="text-[10px] font-bold text-teal-500/40 uppercase tracking-widest">{t('tafsir_download_manager', 'مدير تحميل التفاسير')}</p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {Object.values(TAFSIR_EDITIONS).map((edition) => {
          const state = downloadStates[edition.id] || { isDownloaded: false, isDownloading: false, progress: 0 };
          const isSelected = tafsirType === edition.id;
          const progressPercent = Math.round((state.progress / 114) * 100);
          const editionName = getEditionDisplayName(edition.id, edition.name);

          return (
            <div 
              key={edition.id}
              className={cn(
                "relative bg-white dark:bg-slate-800/40 border rounded-2xl p-4 transition-all overflow-hidden",
                isSelected ? "border-teal-500/50 bg-teal-500/5" : "border-slate-200 dark:border-white/10"
              )}
            >
              <div className="flex items-center justify-between mb-2 relative z-10">
                <div className="flex items-center gap-3">
                  <div 
                    onClick={() => setTafsirType(edition.id as any)}
                    className={cn(
                      "w-4 h-4 rounded-full border-2 cursor-pointer flex items-center justify-center transition-all",
                      isSelected ? "border-teal-500 bg-teal-500" : "border-slate-300 dark:border-white/20 hover:border-teal-400"
                    )}
                  >
                    {isSelected && <Check size={10} className="text-white" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-800 dark:text-white">{editionName}</h4>
                    <p className="text-[10px] text-slate-500 dark:text-white/40 font-bold">{edition.totalSurahs} {t('surah', 'سورة')} • {t('text_edition', 'نسخة نصية')}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {state.isDownloaded ? (
                    <button 
                      onClick={() => handleRemove(edition.id)}
                      className="p-2 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500/20 transition-all"
                      title={t('delete', 'حذف')}
                    >
                      <Trash2 size={16} />
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleDownload(edition.id)}
                      disabled={state.isDownloading}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all transform duration-75 active:scale-[0.95] active:opacity-80",
                        state.isDownloading 
                          ? "bg-slate-100 dark:bg-white/10 text-slate-400 dark:text-white/40 cursor-not-allowed" 
                          : "bg-teal-600 text-white shadow-lg shadow-teal-600/20 hover:scale-105 duration-75 active:scale-[0.85] active:opacity-70"
                      )}
                    >
                      {state.isDownloading ? (
                        <RefreshCw size={14} className="animate-spin" />
                      ) : (
                        <Download size={14} />
                      )}
                      {state.isDownloading ? `${Math.round(progressPercent)}%` : t('download', 'تحميل')}
                    </button>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              {state.isDownloading && (
                <div className="relative h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden mt-2">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    className="absolute inset-y-0 left-0 bg-teal-500"
                  />
                </div>
              )}

              {state.isDownloaded && !state.isDownloading && (
                <div className="flex items-center gap-1.5 text-[9px] font-black text-emerald-600 dark:text-emerald-400/80 mt-1 uppercase tracking-tighter">
                  <Check size={10} />
                  {t('tafsir_offline_ready', 'جاهز للقراءة بدون إنترنت')}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl flex gap-3 items-start">
        <AlertCircle size={14} className="text-amber-500 shrink-0 mt-0.5" />
        <p className="text-[10px] text-amber-900/70 dark:text-amber-200/80 leading-relaxed font-bold">
          {t('tafsir_download_desc', 'تحميل التفسير يتيح لك تصفحه حتى في حال انقطاع الإنترنت. يتم تخزين النصوص محلياً في متصفحك.')}
        </p>
      </div>
    </div>
  );
};
