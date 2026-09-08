import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Share2, Star, Facebook, Instagram, Twitter, Shield, Heart, Send } from 'lucide-react';
import { AppIcon } from './ui/AppIcon';
import { useTranslation } from '../i18n';
import { useAppContext } from '../AppContext';

interface AppInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppInfoModal: React.FC<AppInfoModalProps> = ({ isOpen, onClose }) => {
  const { settings } = useAppContext();
  const { t, isRtl } = useTranslation(settings.appLanguage);

  const handleShare = async () => {
    const shareText = t(
      'app_share_full_text',
      'حمل تطبيق أذكار المؤمن وتمتع بتجربة إيمانية فريدة مع الأذكار، القرآن الكريم، المسبحة الإلكترونية والمزيد. تطبيق خالي من الإعلانات تماماً ومصمم براحة للمستخدم.'
    );
    const shareUrl = "https://athkar.app";
    if (navigator.share) {
      try {
        await navigator.share({
          title: t('app_name', 'أذكار المؤمن'),
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      alert(t('copied_link_success', 'تم نسخ رابط التطبيق بنجاح!'));
    }
  };

  const handleRate = () => {
    alert(t('thank_you_rating', 'شكراً لتقييمك التطبيق!'));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <React.Fragment>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 dark:bg-black/60 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl z-[101] overflow-hidden"
            dir={isRtl ? 'rtl' : 'ltr'}
          >
            {/* Header / Banner */}
            <div className="relative h-24 bg-gradient-to-r from-emerald-600 to-teal-500 overflow-hidden">
              <div className="absolute inset-0 opacity-20 islamic-pattern" />
              <button 
                onClick={onClose}
                className={`absolute top-4 ${isRtl ? 'left-4' : 'right-4'} w-8 h-8 flex items-center justify-center rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors`}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Icon & Title */}
            <div className="px-6 pt-0 pb-6 relative flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-2xl p-1.5 shadow-xl -mt-10 mb-4 border border-slate-100 dark:border-slate-700">
                <div className="w-full h-full rounded-xl overflow-hidden bg-emerald-100 flex items-center justify-center">
                  <AppIcon className="w-full h-full" />
                </div>
              </div>
              
              <h2 className="text-xl font-black text-slate-950 dark:text-white mb-2">
                {t('app_name', 'أذكار المؤمن')}
              </h2>
              <p className="text-sm font-bold text-slate-950 dark:text-slate-100 mb-6 leading-relaxed">
                {t(
                  'app_info_description',
                  'رفيقك اليومي للذكر، الدعاء، القرآن الكريم. تطبيق إسلامي متكامل خالي من الإعلانات، صُمم بعناية ليقدم لك تجربة روحانية مريحة.'
                )}
              </p>

              {/* Actions Grid */}
              <div className="grid grid-cols-2 gap-3 w-full mb-6">
                <button 
                  onClick={handleShare}
                  className="flex flex-col items-center justify-center p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:hover:bg-emerald-800/40 text-emerald-700 dark:text-emerald-300 transition-colors border border-emerald-200/80 dark:border-emerald-800/50 group"
                >
                  <Share2 size={22} className="mb-1.5 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-black text-slate-950 dark:text-emerald-200">
                    {t('share_app', 'مشاركة التطبيق')}
                  </span>
                </button>
                <button 
                  onClick={handleRate}
                  className="flex flex-col items-center justify-center p-3 rounded-2xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/30 dark:hover:bg-amber-800/40 text-amber-700 dark:text-amber-300 transition-colors border border-amber-200/80 dark:border-amber-800/50 group"
                >
                  <Star size={22} className="mb-1.5 text-amber-500 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-black text-slate-950 dark:text-amber-200">
                    {t('rate_app', 'تقييم التطبيق')}
                  </span>
                </button>
              </div>

              {/* Social Media Links */}
              <div className="w-full">
                <div className="text-xs text-slate-900 dark:text-slate-200 font-bold mb-3 flex items-center gap-2">
                  <span className="h-[1px] flex-1 bg-slate-200 dark:bg-slate-700" />
                  <span>{t('follow_us_social', 'تابعنا على الشبكات الاجتماعية')}</span>
                  <span className="h-[1px] flex-1 bg-slate-200 dark:bg-slate-700" />
                </div>
                <div className="flex justify-center gap-3">
                  <a href="https://www.facebook.com/share/18WqMm9baA/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 hover:scale-110 transition-transform shadow-sm">
                    <Facebook size={18} />
                  </a>
                  <a href="https://www.instagram.com/azkar.almumin?igsh=dzJ6dHF4d3plbWk2" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full flex items-center justify-center bg-pink-50 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400 hover:scale-110 transition-transform shadow-sm">
                    <Instagram size={18} />
                  </a>
                  <a href="https://x.com/azkaralmumelnk" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full flex items-center justify-center bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400 hover:scale-110 transition-transform shadow-sm">
                    <Twitter size={18} />
                  </a>
                  <a href="https://t.me/azkar_almumen" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full flex items-center justify-center bg-cyan-50 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400 hover:scale-110 transition-transform shadow-sm">
                    <Send size={18} className="-ml-0.5" />
                  </a>
                </div>
              </div>
              
              <div className="mt-6 flex items-center justify-center gap-1.5 text-xs font-bold text-slate-950 dark:text-slate-200 bg-slate-100 dark:bg-slate-800/80 px-4 py-1.5 rounded-full border border-slate-200/80 dark:border-slate-700 shadow-sm">
                <Shield size={13} className="text-emerald-600 dark:text-emerald-400" />
                <span>{t('safe_no_ads', 'تطبيق آمن - بدون إعلانات')}</span>
                <Heart size={11} className="text-rose-500 fill-rose-500 mx-0.5" />
              </div>
            </div>
          </motion.div>
        </React.Fragment>
      )}
    </AnimatePresence>
  );
};
