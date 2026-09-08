import { BackButton } from './ui/BackButton';
import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Lightbulb, Droplets, MessageCircle, Gem, Star, History, Scroll, Sparkles, Activity, UserCircle, Quote, Users, Rocket, Fingerprint, Crown, Moon } from 'lucide-react';
import { useTranslation } from '../i18n';
import { useAppContext } from '../AppContext';
import { cn } from '../lib/utils';
import { useSmartNavigation } from '../lib/navigation';
import { preloadLibraryRoutes } from '../lib/preloadLibrary';

interface LibraryItem {
  to: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  shadow: string;
  fullWidth?: boolean;
}

const Library: React.FC = () => {
  const { settings } = useAppContext();
  const { t, isRtl } = useTranslation(settings.appLanguage);
  const { navigate, goBack } = useSmartNavigation();

  // Preload all library routes as soon as Library screen mounts
  useEffect(() => {
    preloadLibraryRoutes();
  }, []);

  const libraryItems: LibraryItem[] = [
    {
      to: "/sunnah-hadith/daily",
      title: t('hadith_of_day'),
      subtitle: t('subtitle_hadith'),
      icon: <MessageCircle size={24} />,
      color: "from-slate-800 via-slate-900 to-slate-950",
      shadow: "shadow-lg shadow-slate-900/30",
    },
    {
      to: "/hadith-qudsi",
      title: t('home_qudsi_title') || "الأحاديث القدسية",
      subtitle: t('home_qudsi_subtitle') || "شرح موسع وبطاقات واسعة",
      icon: <Crown size={24} />,
      color: "from-slate-800 via-slate-900 to-slate-950",
      shadow: "shadow-lg shadow-slate-900/30",
    },
    {
      to: "/inspiration",
      title: t('inspiration_title'),
      subtitle: t('inspiration_subtitle'),
      icon: <Quote size={24} />,
      color: "from-slate-800 via-slate-900 to-slate-950",
      shadow: "shadow-lg shadow-slate-900/30",
    },
    {
      to: "/scholar-sayings",
      title: t('sayings_title'),
      subtitle: t('sayings_subtitle'),
      icon: <Scroll size={24} />,
      color: "from-slate-800 via-slate-900 to-slate-950",
      shadow: "shadow-lg shadow-slate-900/30",
    },
    {
      to: "/insights",
      title: t('insights_title'),
      subtitle: t('insights_subtitle'),
      icon: <Activity size={24} />,
      color: "from-slate-800 via-slate-900 to-slate-950",
      shadow: "shadow-lg shadow-slate-900/30",
    },
    {
      to: "/sunnah-hadith/fadael",
      title: t('fadael'),
      subtitle: t('subtitle_fadael'),
      icon: <Star size={24} />,
      color: "from-slate-800 via-slate-900 to-slate-950",
      shadow: "shadow-lg shadow-slate-900/30",
    },
    {
      to: "/prophet",
      title: t('seerah'),
      subtitle: t('subtitle_seerah'),
      icon: <History size={24} />,
      color: "from-slate-800 via-slate-900 to-slate-950",
      shadow: "shadow-lg shadow-slate-900/30",
    },
    {
      to: "/istighfar",
      title: t('istighfar_title') || "ركن التوبة والاستغفار",
      subtitle: t('istighfar_subtitle') || "الاستغفار اليومي والندم",
      icon: <Droplets size={24} />,
      color: "from-slate-800 via-slate-900 to-slate-950",
      shadow: "shadow-lg shadow-slate-900/30",
    },
    {
      to: "/quiz",
      title: t('quiz_title') || "اختبر معلوماتك",
      subtitle: t('quiz_subtitle') || "مسابقات واختبارات إسلامية",
      icon: <Lightbulb size={24} />,
      color: "from-slate-800 via-slate-900 to-slate-950",
      shadow: "shadow-lg shadow-slate-900/30",
    },
    {
      to: "/stories",
      title: t('islamic_stories'),
      subtitle: t('islamic_stories_subtitle'),
      icon: <BookOpen size={24} />,
      color: "from-slate-800 via-slate-900 to-slate-950",
      shadow: "shadow-lg shadow-slate-900/30",
    },
    {
      to: "/tasbih",
      title: t('tasbih_card'),
      subtitle: t('subtitle_tasbih'),
      icon: <Fingerprint size={24} />,
      color: "from-slate-800 via-slate-900 to-slate-950",
      shadow: "shadow-lg shadow-slate-900/30",
    },
    {
      to: "/fasting-tracker",
      title: t('fasting_tracker_title') || "عداد الصيام",
      subtitle: t('fasting_tracker_subtitle') || "صيام النافلة والأيام البيض",
      icon: <Moon size={24} />,
      color: "from-slate-800 via-slate-900 to-slate-950",
      shadow: "shadow-lg shadow-slate-900/30",
    },
    {
      to: "/font-studio",
      title: "استوديو الخطوط",
      subtitle: "تنزيل وتخصيص خطوط القرآن والأذكار",
      icon: <Sparkles size={24} className="text-teal-300" />,
      color: "from-teal-800 via-emerald-900 to-slate-950",
      shadow: "shadow-lg shadow-teal-950/40",
    }
  ];

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: {
            staggerChildren: 0.05,
            delayChildren: 0.02
          }
        }
      }}
      dir={isRtl ? "rtl" : "ltr"}
      className="flex flex-col gap-5 py-6 px-0 -mx-3 sm:mx-0 sm:px-4 pb-12"
    >
      <div className="flex items-center justify-between mb-2 sticky top-0 z-30 bg-white/60 dark:bg-slate-950/60 backdrop-blur-xl py-4 px-4 border-b border-white/20 dark:border-slate-800/20">
        <div className={cn("flex items-center gap-4", isRtl ? "flex-row" : "flex-row-reverse")}>
          <BackButton />
          <div className={isRtl ? "text-right" : "text-left"}>
            <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight mb-1">
              {t('library')}
            </h2>
            <p className="text-sm font-bold text-teal-600 dark:text-teal-400 opacity-80">
              {t('library_subtitle')}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-x-2.5 gap-y-4 relative z-10 px-1">
        {libraryItems.map((item) => (
          <motion.button
            key={item.to}
            variants={{
              hidden: { opacity: 0, y: 15, scale: 0.95 },
              show: { opacity: 1, y: 0, scale: 1 }
            }}
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onMouseEnter={() => preloadLibraryRoutes()}
            onTouchStart={() => preloadLibraryRoutes()}
            onClick={() => navigate(item.to)}
            className={cn(
              "relative group flex overflow-hidden rounded-2xl transition-all duration-300 border border-white/10 text-center outline-none cursor-pointer",
              item.fullWidth ? cn("col-span-full h-[90px] p-4 items-center gap-4", isRtl ? "flex-row text-right" : "flex-row-reverse text-left") : "col-span-1 flex-col h-[120px] justify-between p-3",
              item.shadow
            )}
          >
            <div className={cn("absolute inset-0 transition-colors duration-500", item.color && item.color.startsWith('bg-') ? item.color : "bg-gradient-to-br " + item.color)} />
            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute inset-0 opacity-15 mix-blend-overlay pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]" />
            <div className="absolute top-2 right-2 w-1 h-1 rounded-full bg-white/20 shadow-sm z-10" />
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-300 pointer-events-none" />
            
            <div className={cn(
              "relative z-10 flex",
              item.fullWidth ? "flex-row items-center w-full gap-4" : "flex-col items-center justify-between w-full h-full"
            )}>
              {item.fullWidth ? (
                <>
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20 shadow-inner group-hover:rotate-6 transition-transform duration-200 shrink-0 w-14 h-14">
                    {React.cloneElement(item.icon as React.ReactElement<any>, { size: 26, className: "text-white" })}
                  </div>
                  <div className="min-w-0 w-full flex-1">
                    <h3 className="font-black text-white drop-shadow-sm text-lg mb-0.5 truncate">
                      {item.title}
                    </h3>
                    <p className="text-white/80 font-bold uppercase tracking-widest text-[9px] line-clamp-1">
                      {item.subtitle}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex-1 flex items-center justify-center w-full pt-1">
                    <div className="w-11 h-11 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20 shadow-inner group-hover:scale-110 group-hover:-rotate-12 transition-all duration-500 shrink-0">
                      {React.cloneElement(item.icon as React.ReactElement<any>, { size: 24, className: "text-white opacity-100" })}
                    </div>
                  </div>
                  <div className="min-w-0 w-full shrink-0 flex flex-col justify-center items-center">
                    <h3 className="font-black text-white drop-shadow-sm text-[11px] sm:text-[12px] leading-tight line-clamp-2 px-0.5 mb-1">
                      {item.title}
                    </h3>
                    <div className="w-4 h-0.5 bg-white/30 rounded-full group-hover:w-8 transition-all duration-300" />
                  </div>
                </>
              )}
            </div>
            
            {/* Glossy Effect */}
            <div className="absolute top-0 right-0 w-full h-[35%] bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-full h-[15%] bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

export default Library;
