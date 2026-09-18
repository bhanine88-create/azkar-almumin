import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Share2, Heart, X, Check, Copy, ExternalLink, ThumbsUp } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { useTranslation } from '../i18n';
import { shareContent, copyTextToClipboard, triggerHaptic } from '../lib/utils';

interface RateAndShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RateAndShareModal: React.FC<RateAndShareModalProps> = ({ isOpen, onClose }) => {
  const { settings } = useAppContext();
  const { t } = useTranslation(settings.appLanguage);
  const isRTL = settings.appLanguage !== 'en' && settings.appLanguage !== 'fr' && settings.appLanguage !== 'es' && settings.appLanguage !== 'de' && settings.appLanguage !== 'tr' && settings.appLanguage !== 'id' && settings.appLanguage !== 'ms';

  const [selectedRating, setSelectedRating] = useState<number>(5);
  const [hasRated, setHasRated] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const appShareText = isRTL
    ? `✨ أنصحك بتحميل تطبيق "أذكار المؤمن" - رفيقك الروحي الشامل للقرآن الكريم، مواقيت الصلاة، الأذكار والمسبحة الذكية مجاناً بالكامل وبدون إعلانات: ${window.location.origin}`
    : `✨ Discover Believer Athkar - Your all-in-one Islamic companion for Quran, Prayer Times, Daily Athkar and Digital Tasbih without ads: ${window.location.origin}`;

  const handleShare = async () => {
    triggerHaptic();
    await shareContent(
      isRTL ? 'تطبيق أذكار المؤمن' : 'Believer Athkar App',
      appShareText,
      window.location.origin
    );
  };

  const handleCopyLink = async () => {
    triggerHaptic();
    const ok = await copyTextToClipboard(appShareText);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleRateSubmit = () => {
    triggerHaptic();
    setHasRated(true);
    // If user rated 5 stars, encourage opening store
    if (selectedRating >= 4) {
      setTimeout(() => {
        // Can open store or thank user
      }, 1000);
    }
  };

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
          className="relative w-full max-w-md bg-slate-900 border border-amber-500/30 rounded-3xl p-6 shadow-2xl shadow-amber-950/40 text-white overflow-hidden"
        >
          {/* Decorative glow */}
          <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 left-4 rtl:left-auto rtl:right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>

          <div className="space-y-6">
            {/* Header */}
            <div className="text-center space-y-2 pt-2">
              <div className="w-16 h-16 mx-auto bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Star size={32} className="fill-current" />
              </div>
              <h3 className="text-xl font-black text-white">
                {t('rate_and_share_app', 'تقييم ومشاركة التطبيق')}
              </h3>
              <p className="text-xs text-slate-300 font-bold max-w-xs mx-auto leading-relaxed">
                {t('rate_share_modal_desc', 'دعمك لتطبيق أذكار المؤمن ونشره صدقة جارية تساهم في وصوله لملايين المسلمين حول العالم.')}
              </p>
            </div>

            {/* Rating Stars Box */}
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-white/5 text-center space-y-3">
              {hasRated ? (
                <div className="py-2 space-y-1">
                  <div className="flex justify-center gap-1 text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={20} className={s <= selectedRating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'} />
                    ))}
                  </div>
                  <p className="text-sm font-black text-emerald-400 flex items-center justify-center gap-1.5 pt-1">
                    <ThumbsUp size={16} />
                    {t('rate_share_thank_you', 'جزاك الله خيراً على تقييمك الطيب!')}
                  </p>
                </div>
              ) : (
                <>
                  <span className="text-xs font-bold text-slate-300 block">
                    {t('rate_share_how_rate', 'ما هو تقييمك لتجربتك مع التطبيق؟')}
                  </span>
                  <div className="flex justify-center items-center gap-2 py-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => {
                          triggerHaptic();
                          setSelectedRating(star);
                        }}
                        className="p-1.5 transition-transform hover:scale-125 active:scale-95 cursor-pointer"
                      >
                        <Star
                          size={32}
                          className={`transition-colors ${
                            star <= selectedRating
                              ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                              : 'text-slate-600'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={handleRateSubmit}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    {t('rate_share_submit', 'إرسال التقييم')}
                  </button>
                </>
              )}
            </div>

            {/* Share Buttons */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleShare}
                className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-black text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-teal-950/50 transition-all cursor-pointer"
              >
                <Share2 size={18} />
                <span>{t('rate_share_btn', 'مشاركة التطبيق مع الأهل والأصدقاء')}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 border border-white/10 text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check size={16} className="text-emerald-400" />
                    <span className="text-emerald-400 font-black">{t('rate_link_copied', 'تم نسخ رابط ورسالة التطبيق')}</span>
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    <span>{t('rate_copy_link_btn', 'نسخ رابط التطبيق')}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
