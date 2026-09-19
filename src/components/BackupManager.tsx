import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, Upload, Cloud, RefreshCw, Clock, ShieldCheck, Database, Trash2, AlertCircle, CheckCircle2, Activity } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { backupService } from '../services/backupService';
import { cn } from '../lib/utils';
import { auth } from '../firebase';

import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { safeLocalStorageGetItem, safeLocalStorageSetItem, safeLocalStorageRemoveItem } from "../utils/storage";
import { useTranslation } from '../i18n';

export const BackupManager: React.FC = () => {
  const { progress, settings, adhkarData, updateSettings } = useAppContext();
  const { t } = useTranslation(settings.appLanguage);
  const [cloudBackups, setCloudBackups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(auth.currentUser);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [lastAutoBackup, setLastAutoBackup] = useState<string | null>(safeLocalStorageGetItem('believer_last_cloud_backup'));

  const [localBackups, setLocalBackups] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (user) {
        loadCloudBackups();
      } else {
        setCloudBackups([]);
      }
    });
    loadLocalBackups();
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      showStatus('success', t('backup_login_success', 'تم تسجيل الدخول بنجاح'));
    } catch (err: any) {
      console.error(err);
      let errMsg = '';
      if (err.code === 'auth/popup-closed-by-user') {
        errMsg = t('backup_popup_closed', 'تم إغلاق نافذة تسجيل الدخول المنبثقة قبل إتمام العملية.');
      } else {
        errMsg = t('backup_login_failed', 'فشل تسجيل الدخول');
      }
      showStatus('error', errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      showStatus('success', t('backup_logout_success', 'تم تسجيل الخروج'));
    } catch (err) {
      showStatus('error', t('backup_logout_failed', 'فشل تسجيل الخروج'));
    }
  };

  const loadLocalBackups = () => {
    const backups = [];
    const b1 = safeLocalStorageGetItem('believer_backup_v23_1') || safeLocalStorageGetItem('believer_backup_v22_1') || safeLocalStorageGetItem('believer_backup_v21_1') || safeLocalStorageGetItem('believer_backup_v20_1') || safeLocalStorageGetItem('believer_backup_v5_1');
    const b2 = safeLocalStorageGetItem('believer_backup_v23_2') || safeLocalStorageGetItem('believer_backup_v22_2') || safeLocalStorageGetItem('believer_backup_v21_2') || safeLocalStorageGetItem('believer_backup_v20_2') || safeLocalStorageGetItem('believer_backup_v5_2');
    if (b1) backups.push({ id: 'local1', ...JSON.parse(b1), type: 'local' });
    if (b2) backups.push({ id: 'local2', ...JSON.parse(b2), type: 'local' });
    setLocalBackups(backups);
  };

  const loadCloudBackups = async () => {
    try {
      setIsLoading(true);
      const backups = await backupService.getCloudBackups();
      setCloudBackups(backups);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualExport = () => {
    try {
      const countsData = JSON.parse(safeLocalStorageGetItem('believer_adhkar_counts_v23') || safeLocalStorageGetItem('believer_adhkar_counts_v22') || safeLocalStorageGetItem('believer_adhkar_counts_v21') || safeLocalStorageGetItem('believer_adhkar_counts_v20') || safeLocalStorageGetItem('believer_adhkar_counts_v6') || safeLocalStorageGetItem('believer_adhkar_counts_v5') || '{}');
      const data = { progress, settings, adhkarData, counts: countsData };
      const json = backupService.generateLocalBackup(data);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `adhkar_believer_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showStatus('success', t('backup_export_success', 'تم تصدير نسخة احتياطية بنجاح'));
    } catch (err) {
      showStatus('error', t('backup_export_failed', 'فشل تصدير النسخة الاحتياطية'));
    }
  };

  const handleCloudBackup = async () => {
    if (!auth.currentUser) {
      showStatus('error', t('backup_login_required', 'يجب تسجيل الدخول لحفظ النسخة سحابياً'));
      return;
    }

    try {
      setIsLoading(true);
      const countsData = JSON.parse(safeLocalStorageGetItem('believer_adhkar_counts_v23') || safeLocalStorageGetItem('believer_adhkar_counts_v22') || safeLocalStorageGetItem('believer_adhkar_counts_v21') || safeLocalStorageGetItem('believer_adhkar_counts_v20') || safeLocalStorageGetItem('believer_adhkar_counts_v6') || safeLocalStorageGetItem('believer_adhkar_counts_v5') || '{}');
      const data = { progress, settings, adhkarData, counts: countsData };
      await backupService.createCloudBackup(data);
      await loadCloudBackups();
      const now = new Date().toLocaleString(settings.appLanguage === 'ar' ? 'ar-EG' : 'en-US');
      setLastAutoBackup(now);
      safeLocalStorageSetItem('believer_last_cloud_backup', now);
      showStatus('success', t('backup_cloud_saved', 'تم حفظ نسخة سحابية جديدة'));
    } catch (err) {
      showStatus('error', t('backup_cloud_failed', 'فشل الحفظ السحابي'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportPrayerAndDhikr = () => {
    try {
      const countsData = JSON.parse(safeLocalStorageGetItem('believer_adhkar_counts_v23') || safeLocalStorageGetItem('believer_adhkar_counts_v22') || safeLocalStorageGetItem('believer_adhkar_counts_v21') || safeLocalStorageGetItem('believer_adhkar_counts_v20') || safeLocalStorageGetItem('believer_adhkar_counts_v6') || safeLocalStorageGetItem('believer_adhkar_counts_v5') || '{}');
      const prayerActivities = progress.worshipTracker?.activities?.filter(act => act.category === 'prayer') || [];
      const dhikrActivities = progress.worshipTracker?.activities?.filter(act => act.category === 'dhikr') || [];
      
      const backupData = {
        backupType: "prayer_and_dhikr_history",
        timestamp: new Date().toISOString(),
        prayerHistory: prayerActivities,
        dhikrHistory: dhikrActivities,
        dhikrCounts: countsData,
        tasbihCount: progress.tasbihCount || 0,
        completedAdhkar: progress.completedAdhkar || [],
        totalAdhkarRecited: progress.totalAdhkarRecited || 0,
        baqiyatSalihat: progress.baqiyatSalihat || {
          subhanAllah: 0,
          alhamdulillah: 0,
          laIlahaIllaAllah: 0,
          allahuAkbar: 0,
          lastUpdated: ''
        }
      };

      const json = JSON.stringify(backupData, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `prayer_dhikr_history_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showStatus('success', t('backup_prayer_export_success', 'تم تصدير سجل الصلوات والأذكار بنجاح'));
    } catch (err) {
      console.error(err);
      showStatus('error', t('backup_prayer_export_failed', 'فشل تصدير السجل'));
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = event.target?.result as string;
        const parsed = JSON.parse(json);

        if (parsed.backupType === "prayer_and_dhikr_history") {
          if (window.confirm(t('confirm_restore_prayer_dhikr', 'تم كشف ملف احتياطي خاص بسجل الصلوات والأذكار فقط. هل تريد استعادته ودمجه مع بياناتك الحالية؟'))) {
            const updatedProgress = { ...progress };
            
            // Merge activities
            const existingActivities = progress.worshipTracker?.activities || [];
            const otherActivities = existingActivities.filter(act => act.category !== 'prayer' && act.category !== 'dhikr');
            const newActivities = [
              ...otherActivities,
              ...(parsed.prayerHistory || []),
              ...(parsed.dhikrHistory || [])
            ];

            updatedProgress.worshipTracker = {
              ...progress.worshipTracker,
              activities: newActivities
            };

            // Restoring metrics
            updatedProgress.tasbihCount = parsed.tasbihCount !== undefined ? parsed.tasbihCount : (progress.tasbihCount || 0);
            updatedProgress.completedAdhkar = parsed.completedAdhkar || progress.completedAdhkar || [];
            updatedProgress.totalAdhkarRecited = parsed.totalAdhkarRecited !== undefined ? parsed.totalAdhkarRecited : (progress.totalAdhkarRecited || 0);
            if (parsed.baqiyatSalihat) {
              updatedProgress.baqiyatSalihat = parsed.baqiyatSalihat;
            }

            safeLocalStorageSetItem('believer_progress_v23', JSON.stringify(updatedProgress));
            
            if (parsed.dhikrCounts) {
              safeLocalStorageSetItem('believer_adhkar_counts_v23', JSON.stringify(parsed.dhikrCounts));
            }

            showStatus('success', t('backup_prayer_restore_success', 'تم استعادة سجل الصلوات والأذكار بنجاح'));
            setTimeout(() => window.location.reload(), 1000);
          }
          return;
        }

        // Default full backup restore
        const data = backupService.restoreFromJSON(json);
        if (window.confirm(t('confirm_restore_full_backup', 'هل أنت متأكد؟ سيتم استبدال جميع البيانات الحالية بالبيانات الموجودة في الملف.'))) {
          safeLocalStorageSetItem('believer_progress_v23', JSON.stringify(data.progress));
          safeLocalStorageSetItem('believer_settings_v28', JSON.stringify(data.settings));
          safeLocalStorageSetItem('believer_settings_v27', JSON.stringify(data.settings));
          safeLocalStorageSetItem('believer_settings_v23', JSON.stringify(data.settings));
          if ((data as any).adhkarData) safeLocalStorageSetItem('believer_adhkar_v23', JSON.stringify((data as any).adhkarData));
          if ((data as any).counts) safeLocalStorageSetItem('believer_adhkar_counts_v23', JSON.stringify((data as any).counts));
          
          window.location.reload();
        }
      } catch (err) {
        showStatus('error', t('backup_invalid_file', 'الملف المحدد غير صالح'));
      }
    };
    reader.readAsText(file);
  };

  const showStatus = (type: 'success' | 'error', message: string) => {
    setStatus({ type, message });
    setTimeout(() => setStatus(null), 3000);
  };

  return (
    <div className="space-y-4">
      {/* Status Overlay */}
      <AnimatePresence>
        {status && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={cn(
              "fixed top-20 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 font-bold text-sm",
              status.type === 'success' ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
            )}
          >
            {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            {status.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-2 gap-3">
        {/* Manual Export */}
        <button
          onClick={handleManualExport}
          className="bg-white/10 dark:bg-black/30 p-4 rounded-2xl border border-white/15 flex flex-col items-center gap-2.5 transition-all hover:bg-white/15 dark:hover:bg-black/40 duration-75 active:scale-[0.95] shadow-sm group"
        >
          <div className="w-11 h-11 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform shadow-inner border border-blue-500/30">
            <Download size={22} />
          </div>
          <span className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">{t('backup_export_file', 'تصدير ملف')}</span>
        </button>

        {/* Manual Import */}
        <label className="bg-white/10 dark:bg-black/30 p-4 rounded-2xl border border-white/15 flex flex-col items-center gap-2.5 transition-all hover:bg-white/15 dark:hover:bg-black/40 duration-75 active:scale-[0.95] shadow-sm group cursor-pointer">
          <input type="file" className="hidden" accept=".json" onChange={handleImport} />
          <div className="w-11 h-11 bg-purple-500/20 rounded-xl flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform shadow-inner border border-purple-500/30">
            <Upload size={22} />
          </div>
          <span className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">{t('backup_import_file', 'استيراد ملف')}</span>
        </label>
      </div>

      {/* Prayer & Dhikr History Section */}
      <div className="bg-black/25 border border-white/10 rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-teal-500/20 rounded-xl flex items-center justify-center text-teal-400 border border-teal-500/30">
            <Activity size={18} />
          </div>
          <div className="text-right flex-1">
            <h4 className="text-xs sm:text-sm font-black text-white">{t('backup_prayer_dhikr_title', 'سجل الصلوات والأذكار فقط')}</h4>
            <p className="text-[11px] text-white/70 font-bold leading-relaxed">{t('backup_prayer_dhikr_desc', 'تصدير أو استيراد سجل الطاعات، التسابيح، والتكرارات اليومية فقط في ملف JSON منفصل لسهولة النقل.')}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            onClick={handleExportPrayerAndDhikr}
            className="py-3 px-3 bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/30 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all cursor-pointer shadow-sm"
          >
            <Download size={14} />
            {t('backup_export_history_btn', 'تصدير السجل')}
          </button>
          
          <label className="py-3 px-3 bg-white/10 hover:bg-white/15 text-white border border-white/15 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all cursor-pointer shadow-sm">
            <input type="file" className="hidden" accept=".json" onChange={handleImport} />
            <Upload size={14} />
            {t('backup_import_history_btn', 'استيراد السجل')}
          </label>
        </div>
      </div>

      {/* Cloud Backup Section */}
      <div className="bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-800 rounded-2xl p-6 text-white shadow-xl shadow-teal-950/30 relative overflow-hidden border border-white/15">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-12 translate-x-12" />
        
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-black tracking-tight">{t('backup_cloud_title', 'النسخ الاحتياطي السحابي')}</h3>
            <p className="text-xs font-bold text-teal-100">
              {user ? t('welcome_user', 'مرحباً {{name}}', { name: user.displayName || '' }) : t('backup_cloud_subtitle', 'احفظ بياناتك في أمان واستعدها من أي مكان')}
            </p>
          </div>
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-md">
            {user ? (
              <img loading="lazy" src={user.photoURL || ''} alt="" className="w-8 h-8 rounded-full border-2 border-white/40" />
            ) : (
              <Cloud size={24} className="animate-pulse" />
            )}
          </div>
        </div>

        {!user ? (
          <div className="space-y-3">
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full py-3.5 bg-white text-teal-900 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-3 shadow-lg hover:shadow-xl active:scale-[0.98] transition-all cursor-pointer"
            >
              <Cloud size={18} />
              {t('backup_login_btn', 'تسجيل الدخول سحابياً')}
            </button>

            <div className="bg-black/25 p-3.5 rounded-xl border border-white/15 text-right leading-relaxed select-none">
              <p className="text-[11px] font-bold text-teal-100 flex items-start gap-1.5">
                <span>💡</span>
                <span>
                  {t('backup_preview_notice', 'إذا كنت تتصفح عبر إطار المعاينة الداخلي، قد يقوم المتصفح بحظر نافذة تسجيل الدخول المنبثقة. يرجى فتح التطبيق في علامة تبويب جديدة.')}
                </span>
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-4 bg-black/20 backdrop-blur-sm p-4 rounded-2xl border border-white/15">
              <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                <Clock size={18} />
              </div>
              <div className="flex-grow">
                <p className="text-[10px] text-teal-200 font-black uppercase tracking-widest">{t('backup_last_sync', 'آخر مزامنة')}</p>
                <p className="text-xs sm:text-sm font-black">{lastAutoBackup || t('backup_not_synced_yet', 'لم يتم النسخ بعد')}</p>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2.5 hover:bg-white/15 rounded-xl transition-colors text-white/80 hover:text-white"
                title={t('logout', 'تسجيل الخروج')}
              >
                <Trash2 size={18} />
              </button>
            </div>

            <button
              onClick={handleCloudBackup}
              disabled={isLoading}
              className="w-full py-3.5 bg-white text-teal-900 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-3 shadow-lg hover:shadow-xl active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isLoading ? <RefreshCw size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
              {isLoading ? t('backup_saving', 'جاري الحفظ...') : t('backup_save_now_btn', 'حفظ نسخة الآن')}
            </button>
          </div>
        )}
      </div>

      {/* Backup History */}
      {(cloudBackups.length > 0 || localBackups.length > 0) && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('backup_history_title', 'تاريخ النسخ الاحتياطي')}</span>
            <Database size={14} className="text-slate-300" />
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-hide">
            {/* Local Backups */}
            {localBackups.map((backup) => (
              <div 
                key={backup.id}
                className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center text-amber-600">
                    <Clock size={14} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-700 dark:text-slate-100">
                      {new Date(backup.timestamp).toLocaleString(settings.appLanguage === 'ar' ? 'ar-EG' : 'en-US')}
                    </p>
                    <p className="text-[8px] text-amber-600 font-bold uppercase tracking-tighter">{t('backup_local_auto', 'نسخة محلية تلقائية')}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (window.confirm(t('confirm_restore_local_backup', 'هل تريد استعادة هذه النسخة المحلية؟'))) {
                      if (backup.progress) safeLocalStorageSetItem('believer_progress_v23', JSON.stringify(backup.progress));
                      if (backup.settings) safeLocalStorageSetItem('believer_settings_v23', JSON.stringify(backup.settings));
                      if (backup.counts) safeLocalStorageSetItem('believer_adhkar_counts_v23', JSON.stringify(backup.counts));
                      window.location.reload();
                    }
                  }}
                  className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transform transition-all duration-75 active:scale-[0.85] active:opacity-70 hover:bg-amber-500 hover:text-white"
                >
                  <RefreshCw size={14} />
                </button>
              </div>
            ))}

            {/* Cloud Backups */}
            {cloudBackups.map((backup) => (
              <div 
                key={backup.id}
                className="bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-100 dark:border-slate-700/50 flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center text-slate-500">
                    <Database size={14} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-700 dark:text-slate-100">
                      {backup.createdAt?.toDate().toLocaleString(settings.appLanguage === 'ar' ? 'ar-EG' : 'en-US') || t('backup_old_version', 'نسخة قديمة')}
                    </p>
                    <p className="text-[8px] text-slate-400 font-bold uppercase">{backup.type === 'auto' ? t('auto', 'تلقائي') : t('manual', 'يدوي')}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (window.confirm(t('confirm_restore_cloud_backup', 'استعادة هذه النسخة؟'))) {
                      safeLocalStorageSetItem('believer_progress_v23', JSON.stringify(backup.data.progress));
                      safeLocalStorageSetItem('believer_settings_v23', JSON.stringify(backup.data.settings));
                      if (backup.data.adhkarData) safeLocalStorageSetItem('believer_adhkar_v23', JSON.stringify(backup.data.adhkarData));
                      if (backup.data.counts) safeLocalStorageSetItem('believer_adhkar_counts_v23', JSON.stringify(backup.data.counts));
                      window.location.reload();
                    }
                  }}
                  className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transform transition-all duration-75 active:scale-[0.85] active:opacity-70 hover:bg-teal-500 hover:text-white"
                >
                  <RefreshCw size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
