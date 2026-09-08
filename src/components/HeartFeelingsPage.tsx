import React from 'react';
import { BackButton } from './ui/BackButton';
import { HeartFeelingsWidget } from './HeartFeelingsWidget';
import { Sparkles, Heart, ShieldCheck } from 'lucide-react';
import { useTranslation } from '../i18n';

export const HeartFeelingsPage: React.FC = () => {
  const { t, isRtl } = useTranslation();

  return (
    <div 
      className={`flex flex-col h-full bg-slate-50 dark:bg-slate-950 px-4 sm:px-6 pt-6 w-full max-w-4xl mx-auto pb-24 ${isRtl ? 'text-right' : 'text-left'}`} 
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="flex items-center gap-4 mb-6">
        <BackButton />
        <div className="flex flex-col">
          <h1 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
            <Heart className="w-6 h-6 text-rose-500 fill-rose-500/20" />
            <span>{t('heart_feelings_title', 'كيف حال قلبك اليوم؟')}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t('heart_feelings_subtitle', 'حدد شعورك')} - {t('feeling_tagline', 'أدعية مأثورة وآيات قرآنية لطمأنينة القلب')}
          </p>
        </div>
      </div>

      {/* Main Widget */}
      <div className="mb-6">
        <HeartFeelingsWidget />
      </div>

      {/* Info Card */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
          <Sparkles className="w-4 h-4" />
          <span>{t('heart_feelings_title', 'كيف حال قلبك اليوم؟')}</span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          {t('feeling_tagline', 'أدعية مأثورة وآيات قرآنية لطمأنينة القلب')}
        </p>
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-[11px] text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>{t('feeling_tagline', 'أدعية مأثورة وآيات قرآنية لطمأنينة القلب')}</span>
        </div>
      </div>
    </div>
  );
};

export default HeartFeelingsPage;
