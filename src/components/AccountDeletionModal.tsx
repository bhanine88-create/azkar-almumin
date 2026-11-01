import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, AlertTriangle, X, ShieldAlert, CheckCircle2, RefreshCw, UserX } from 'lucide-react';
import { auth } from '../firebase';
import { deleteAccountAndAllData, clearAllLocalBelieverData } from '../services/accountDeletionService';
import { useAppContext } from '../AppContext';
import { useTranslation } from '../i18n';

interface AccountDeletionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccountDeletionModal: React.FC<AccountDeletionModalProps> = ({ isOpen, onClose }) => {
  const { settings } = useAppContext();
  const { t } = useTranslation(settings.appLanguage);
  const currentUser = auth.currentUser;

  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDeletedSuccess, setIsDeletedSuccess] = useState(false);

  const confirmWord = t('md_del_word', 'حذف');
  const typedWord = confirmText.trim().toLowerCase();
  const isConfirmed = typedWord === confirmWord.trim().toLowerCase() || typedWord === 'delete' || typedWord === 'حذف';

  const deletionErrorText = (code?: string, raw?: string) => {
    if (code === 'cloud') return t('md_del_err_cloud', 'تعذّر حذف بياناتك من السحابة. تحقّق من الاتصال بالإنترنت ثم حاول مرة أخرى، ولم يُحذف الحساب.');
    if (code === 'reauth') return t('md_del_err_reauth', 'يتطلب حذف الحساب تسجيل الدخول مجدداً لتأكيد هويتك لأسباب أمنية.');
    if (code === 'generic') return raw || t('md_del_err_generic', 'حدث خطأ أثناء محاولة حذف الحساب والبيانات.');
    return raw || t('md_del_err_failed', 'فشلت عملية حذف الحساب، يرجى المحاولة مرة أخرى.');
  };

  const handleDelete = async () => {
    if (!isConfirmed) return;
    setIsDeleting(true);
    setErrorMsg(null);

    try {
      if (currentUser) {
        const result = await deleteAccountAndAllData();
        if (!result.success) {
          setErrorMsg(deletionErrorText(result.errorCode, result.error));
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
      setErrorMsg(err.message || t('md_del_err_unexpected', 'حدث خطأ غير متوقع أثناء الحذف.'));
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
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
                {t('md_del_success_title', 'تم حذف الحساب ومسح البيانات بنجاح')}
              </h3>
              <p className="text-sm text-slate-300">
                {t('md_del_resetting', 'جارٍ إعادة ضبط التطبيق للبدء من جديد...')}
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
                    {t('md_del_title', 'حذف الحساب ومسح البيانات نهائياً')}
                  </h3>
                  <span className="text-[11px] font-bold text-slate-400">
                    {currentUser 
                      ? (currentUser.email || currentUser.displayName || t('md_del_account_fallback', 'الحساب المسجل'))
                      : (t('md_del_local_data', 'البيانات المحلية المحفوظة'))}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/20 space-y-2">
                <div className="flex items-center gap-2 text-rose-300 text-xs font-bold">
                  <AlertTriangle size={16} className="shrink-0" />
                  <span>{t('md_del_warning', 'تحذير هام - هذا الإجراء لا رجعة فيه:')}</span>
                </div>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside leading-relaxed pr-1">
                  {currentUser ? (
                    <>
                      <li>{t('md_del_li_cloud_acct', 'حذف حسابك السحابي وملفك الشخصي نهائياً.')}</li>
                      <li>{t('md_del_li_backups', 'مسح جميع النسخ الاحتياطية السحابية وأهداف التسبيح.')}</li>
                      <li>{t('md_del_li_quran', 'حذف تاريخ تقدم قراءة القرآن الكريم المحفوظ.')}</li>
                      <li>{t('md_del_li_local_cache', 'تصفير كافة الإعدادات والذاكرة المحلية على جهازك.')}</li>
                    </>
                  ) : (
                    <>
                      <li>{t('md_del_li_wipe_local', 'مسح كافة الأذكار والتسبيحات والإحصائيات المحفوظة على هذا الجهاز.')}</li>
                      <li>{t('md_del_li_reset_settings', 'إعادة ضبط كافة الإعدادات إلى الحالة الافتراضية.')}</li>
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
                  {t('md_del_confirm_label', 'لتأكيد الحذف النهائي، اكتب كلمة "{{word}}" في المربع أدناه:', { word: confirmWord })}
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder={confirmWord}
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
                  {t('md_del_cancel', 'إلغاء والتراجع')}
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
                      <span>{t('md_del_deleting', 'جارٍ الحذف...')}</span>
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      <span>{t('md_del_confirm_btn', 'تأكيد الحذف نهائياً')}</span>
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
