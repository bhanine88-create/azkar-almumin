import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BackButton } from './ui/BackButton';
import { BookOpen, Sparkles, HandHeart, Heart, Star, Droplets } from 'lucide-react';
import { cn } from '../lib/utils';
import { useTranslation } from '../i18n';
import { useAppContext } from '../AppContext';

export const DuasHub: React.FC = () => {
  const navigate = useNavigate();
  const { settings } = useAppContext();
  const { t } = useTranslation(settings?.appLanguage || 'ar');

  const sections = [
    { 
      title: 'كيف حال قلبك اليوم؟', 
      subtitle: 'أدعية المشاعر وطِبّ القلوب وسكينة النفس', 
      path: '/heart-feelings', 
      icon: <Heart size={20} />, 
      color: 'from-orange-500 to-rose-600', 
      shadow: 'shadow-lg shadow-orange-500/20' 
    },
    { 
      title: 'ركن التوبة والاستغفار', 
      subtitle: 'أدعية الاستغفار وصلاة التوبة', 
      path: '/istighfar', 
      icon: <Droplets size={20} />, 
      color: 'from-sky-600 to-teal-800', 
      shadow: 'shadow-lg shadow-sky-500/20' 
    },
    { 
      title: t('quranic_duas_title', 'أدعية قرآنية'), 
      subtitle: t('quranic_duas_sub', 'من كتاب الله'), 
      path: '/duas/quranic', 
      icon: <BookOpen size={20} />, 
      color: 'from-indigo-600 to-indigo-900', 
      shadow: 'shadow-lg shadow-indigo-500/10' 
    },
    { 
      title: t('prophetic_duas_title', 'أدعية نبوية'), 
      subtitle: t('prophetic_duas_sub', 'من صحيح السنة'), 
      path: '/duas/prophetic', 
      icon: <Sparkles size={20} />, 
      color: 'from-emerald-600 to-teal-800', 
      shadow: 'shadow-lg shadow-emerald-500/10' 
    },
    { 
      title: t('names_of_allah_duas_title', 'أدعية بأسماء الله الحسنى'), 
      subtitle: t('names_of_allah_duas_sub', 'التوسل بالأسماء الحسنى'), 
      path: '/duas/names-of-allah', 
      icon: <HandHeart size={20} />, 
      color: 'from-amber-600 to-red-800', 
      shadow: 'shadow-lg shadow-amber-500/10' 
    },
    { 
      title: t('righteous_duas_title', 'أدعية الصالحين والأخيار'), 
      subtitle: t('righteous_duas_sub', 'مأثور العلماء والحكماء'), 
      path: '/duas/righteous', 
      icon: <Heart size={20} />, 
      color: 'from-purple-600 to-indigo-900', 
      shadow: 'shadow-lg shadow-purple-500/20' 
    },
    { 
      title: t('salawat_duas_title', 'الصلاة على النبي'), 
      subtitle: t('salawat_duas_sub', 'فضائلها وصيغها'), 
      path: '/duas/salawat', 
      icon: <Star size={20} />, 
      color: 'from-pink-600 to-rose-900', 
      shadow: 'shadow-lg shadow-pink-500/20' 
    },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 px-4 sm:px-6 pt-6 w-full max-w-5xl mx-auto pb-20 flex-1 overflow-y-auto custom-scrollbar">
      <div className="flex items-center gap-4 mb-6">
        <BackButton />
        <div className="flex flex-col">
          <h1 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white tracking-tight">
            {t('duas_hub_title', 'جوامع الدعاء')}
          </h1>
          <p className="text-xs font-bold text-slate-500">
            {t('duas_hub_subtitle', 'من الوحيين وبديع التوسل')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
        {sections.map((section, idx) => (
          <Link
            key={section.path}
            to={section.path}
            className={cn(
              "relative block overflow-hidden rounded-2xl shadow-sm transition-all duration-300 border border-white/10 dark:border-white/5 group hover:scale-[1.02] hover:-translate-y-0.5 active:scale-95 duration-200 h-28 w-full",
              section.shadow
            )}
          >
            <div className={cn("absolute inset-0 bg-gradient-to-br", section.color)} />
            <div className="absolute inset-0 opacity-[0.15] mix-blend-overlay pointer-events-none" style={{ backgroundImage: "url('/images/arabesque.png')" }} />
            
            <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center text-white z-10 w-full">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-md border border-white/20 mb-2 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                {section.icon}
              </div>
              <h3 className="font-black text-[12px] sm:text-[13px] leading-tight drop-shadow-md line-clamp-2 w-full px-1">{section.title}</h3>
              {section.subtitle && (
                <p className="text-[9.5px] text-white/90 font-bold tracking-wide mt-0.5 line-clamp-1 w-full px-1">
                  {section.subtitle}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

