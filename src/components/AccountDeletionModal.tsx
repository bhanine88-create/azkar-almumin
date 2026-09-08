import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, AlertTriangle, X, ShieldAlert, CheckCircle2, RefreshCw, UserX } from 'lucide-react';
import { auth } from '../firebase';
import { deleteAccountAndAllData, clearAllLocalBelieverData } from '../services/accountDeletionService';
import { useAppContext } from '../AppContext';

interface AccountDeletionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccountDeletionModal: React.FC<AccountDeletionModalProps> = ({ isOpen, onClose }) => {
  const { settings } = useAppContext();
  const isRTL = settings.appLanguage !== 'en' && settings.appLanguage !== 'fr';
  const currentUser = auth.currentUser;

  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDeletedSuccess, setIsDeletedSuccess] = useState(false);

  const isConfirmed = confirmText.trim().toLowerCase() === (isRTL ? 'حذف' : 'delete');

  const handleDelete = async () => {
    if (!isConfirmed) return;
    setIsDeleting(true);
    setErrorMsg(null);

    try {
      if (currentUser) {
        const result = await deleteAccountAndAllData();
        if (!result.success) {
          setErrorMsg(result.error || 'فشلت عملية حذف الحساب، يرجى المحاولة مرة أخرى.');
          setIsDeleting(false);
          return;
        }
      } else {
        clearAllLocalBelieverData();
      }

      setIsDeletedSuccess(true);
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ غير متوقع أثناء الحذف.');
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          className="relative w-full max-w-md bg-slate-900 border border-rose-500/30 rounded-3xl p-6 shadow-2xl shadow-rose-950/40 text-white overflow-hidden"
        >
          {/* Decorative glow */}
          <div className="absolute top-0 right-0 w-36 h-36 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-36 h-36 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="absolute top-4 left-4 rtl:left-auto rtl:right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>

          {isDeletedSuccess ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-2xl flex items-center justify-center animate-bounce">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-xl font-black text-emerald-400">
                {isRTL ? 'تم حذف الحساب ومسح البيانات بنجاح' : 'Account and data successfully deleted'}
              </h3>
              <p className="text-sm text-slate-300">
                {isRTL ? 'جارٍ إعادة ضبط التطبيق للبدء من جديد...' : 'Resetting application...'}
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-2xl flex items-center justify-center shrink-0">
                  <ShieldAlert size={26} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-rose-400">
                    {isRTL ? 'حذف الحساب ومسح البيانات نهائياً' : 'Delete Account & All Data'}
                  </h3>
                  <span className="text-[11px] font-bold text-slate-400">
                    {currentUser 
                      ? (currentUser.email || currentUser.displayName || 'الحساب المسجل')
                      : (isRTL ? 'البيانات المحلية المحفوظة' : 'Local App Data')}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/20 space-y-2">
                <div className="flex items-center gap-2 text-rose-300 text-xs font-bold">
                  <AlertTriangle size={16} className="shrink-0" />
                  <span>{isRTL ? 'تحذير هام - هذا الإجراء لا رجعة فيه:' : 'Important warning - Cannot be undone:'}</span>
                </div>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside leading-relaxed pr-1">
                  {currentUser ? (
                    <>
                      <li>{isRTL ? 'حذف حسابك السحابي وملفك الشخصي نهائياً.' : 'Permanently delete your cloud account.'}</li>
                      <li>{isRTL ? 'مسح جميع النسخ الاحتياطية السحابية وأهداف التسبيح.' : 'Delete all cloud backups and tasbih goals.'}</li>
                      <li>{isRTL ? 'حذف تاريخ تقدم قراءة القرآن الكريم المحفوظ.' : 'Remove all saved Quran reading progress.'}</li>
                      <li>{isRTL ? 'تصفير كافة الإعدادات والذاكرة المحلية على جهازك.' : 'Clear all local cache & stored settings.'}</li>
                    </>
                  ) : (
                    <>
                      <li>{isRTL ? 'مسح كافة الأذكار والتسبيحات والإحصائيات المحفوظة على هذا الجهاز.' : 'Wipe all saved adhkar, tasbih counts, and stats.'}</li>
                      <li>{isRTL ? 'إعادة ضبط كافة الإعدادات إلى الحالة الافتراضية.' : 'Reset all settings to default.'}</li>
                    </>
                  )}
                </ul>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-900/40 border border-red-500/40 rounded-xl text-xs text-red-200 font-bold">
                  {errorMsg}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 block">
                  {isRTL 
                    ? 'لتأكيد الحذف النهائي، اكتب كلمة "حذف" في المربع أدناه:' 
                    : 'To confirm permanent deletion, type "delete" below:'}
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder={isRTL ? 'حذف' : 'delete'}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 focus:border-rose-500 rounded-xl text-sm text-center font-bold text-white placeholder-slate-500 outline-none transition-all"
                  disabled={isDeleting}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isDeleting}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 rounded-xl text-xs sm:text-sm font-bold text-slate-300 transition-colors cursor-pointer"
                >
                  {isRTL ? 'إلغاء والتراجع' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={!isConfirmed || isDeleting}
                  className={`flex-1 py-3 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isConfirmed && !isDeleting
                      ? 'bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white shadow-lg shadow-rose-900/40'
                      : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                  }`}
                >
                  {isDeleting ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      <span>{isRTL ? 'جارٍ الحذف...' : 'Deleting...'}</span>
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      <span>{isRTL ? 'تأكيد الحذف نهائياً' : 'Delete Permanently'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
