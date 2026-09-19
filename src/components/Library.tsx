import { BackButton } from './ui/BackButton';
import React, { useEffect, useMemo, useCallback } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Lightbulb, Droplets, MessageCircle, Gem, Star, History, Scroll, Sparkles, Activity, UserCircle, Quote, Users, Rocket, Fingerprint, Crown, Moon, Headphones, ShieldCheck } from 'lucide-react';
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

interface LibraryCardProps {
  item: LibraryItem;
  isRtl: boolean;
  onNavigate: (to: string) => void;
}

const LibraryCard = React.memo<LibraryCardProps>(({ item, isRtl, onNavigate }) => {
  const handleClick = useCallback(() => {
    onNavigate(item.to);
  }, [item.to, onNavigate]);

  return (
    <div className={cn("perspective-1000 transform-gpu", item.fullWidth ? "col-span-full" : "col-span-1")}>
      <motion.button
        variants={{
          hidden: { opacity: 0, y: 28, rotateX: 18, scale: 0.92 },
          show: { 
            opacity: 1, 
            y: 0, 
            rotateX: 0, 
            scale: 1,
            transition: {
              type: "spring",
              stiffness: 240,
              damping: 22
            }
          }
        }}
        whileHover={{ 
          y: -6, 
          scale: 1.03, 
          rotateX: 6, 
          rotateY: isRtl ? -5 : 5, 
          translateZ: 18,
          transition: { duration: 0.25, ease: "easeOut" }
        }}
        whileTap={{ 
          scale: 0.97, 
          rotateX: -2,
          y: 0 
        }}
        onMouseEnter={preloadLibraryRoutes}
        onTouchStart={preloadLibraryRoutes}
        onClick={handleClick}
        className={cn(
          "relative group flex w-full overflow-visible rounded-2xl transition-all duration-300 text-center outline-none cursor-pointer",
          "preserve-3d transform-gpu",
          "border border-[#145d41]/70 dark:border-[#10b981]/30 border-t-white/25 dark:border-t-emerald-400/30",
          "hover:border-[#feb10b]/80 dark:hover:border-[#feb10b]/80",
          "bg-gradient-to-br from-[#0d4f37] via-[#083a28] to-[#042418]",
          "shadow-lg shadow-emerald-950/30 dark:shadow-[0_4px_20px_rgba(0,0,0,0.6)] hover:shadow-2xl hover:shadow-[#042418]/70",
          item.fullWidth 
            ? cn("h-[94px] p-4 items-center gap-4", isRtl ? "flex-row text-right" : "flex-row-reverse text-left") 
            : "flex-col h-[124px] justify-between p-3"
        )}
      >
        {/* 3D Chamfered Edge / Thickness Simulation */}
        <div className="absolute inset-0 rounded-2xl pointer-events-none border-[0.5px] border-white/20 shadow-[inset_0_2px_4px_rgba(255,255,255,0.25),inset_0_-2px_6px_rgba(0,0,0,0.5)] transform translate-z-10" />

        {/* Ambient 3D Shimmer & Parallax Glow */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/0 via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none transform translate-z-10" />
        <div className="absolute inset-0 rounded-2xl opacity-15 mix-blend-overlay pointer-events-none bg-[url('/images/arabesque.png')] overflow-hidden" />
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#10b981]/15 rounded-full blur-2xl group-hover:scale-125 group-hover:bg-[#10b981]/30 transition-all duration-500 pointer-events-none transform translate-z-10" />
        
        {/* Card Foreground Content with 3D Parallax Depth */}
        <div className={cn(
          "relative z-10 flex preserve-3d transform-gpu",
          item.fullWidth ? "flex-row items-center w-full gap-4" : "flex-col items-center justify-between w-full h-full"
        )}>
          {item.fullWidth ? (
            <>
              <div className="bg-[#042418]/80 dark:bg-black/50 backdrop-blur-md rounded-2xl flex items-center justify-center border border-[#feb10b]/35 dark:border-[#feb10b]/45 shadow-[inset_0_1px_2px_rgba(255,255,255,0.15),0_8px_16px_rgba(0,0,0,0.4)] group-hover:rotate-6 group-hover:bg-[#feb10b]/20 group-hover:border-[#feb10b]/80 group-hover:scale-110 transition-all duration-300 shrink-0 w-14 h-14 preserve-3d transform translate-z-30">
                {React.cloneElement(item.icon as React.ReactElement<any>, { size: 26, className: "text-[#feb10b] filter drop-shadow-[0_2px_8px_rgba(254,177,11,0.6)] group-hover:scale-110 group-hover:brightness-110 transition-all duration-300 transform translate-z-10" })}
              </div>
              <div className="min-w-0 w-full flex-1 transform translate-z-20">
                <h3 className="font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] text-lg mb-0.5 truncate">
                  {item.title}
                </h3>
                <p className="text-emerald-100 font-bold uppercase tracking-wider text-[9.5px] drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)] line-clamp-1">
                  {item.subtitle}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="flex-1 flex items-center justify-center w-full pt-1 transform translate-z-30">
                <div className="w-11 h-11 bg-[#042418]/80 dark:bg-black/50 backdrop-blur-md rounded-2xl flex items-center justify-center border border-[#feb10b]/35 dark:border-[#feb10b]/45 shadow-[inset_0_1px_2px_rgba(255,255,255,0.15),0_8px_16px_rgba(0,0,0,0.4)] group-hover:scale-110 group-hover:-rotate-6 group-hover:bg-[#feb10b]/20 group-hover:border-[#feb10b]/80 transition-all duration-500 shrink-0 preserve-3d">
                  {React.cloneElement(item.icon as React.ReactElement<any>, { size: 24, className: "text-[#feb10b] filter drop-shadow-[0_2px_8px_rgba(254,177,11,0.6)] group-hover:scale-110 group-hover:brightness-110 transition-all duration-300 transform translate-z-10" })}
                </div>
              </div>
              <div className="min-w-0 w-full shrink-0 flex flex-col justify-center items-center transform translate-z-20">
                <h3 className="font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] text-[11px] sm:text-[12px] leading-tight line-clamp-2 px-0.5 mb-1.5">
                  {item.title}
                </h3>
                <div className="w-5 h-0.5 bg-[#feb10b] shadow-[0_0_8px_rgba(254,177,11,0.8)] rounded-full group-hover:w-9 group-hover:bg-[#fec84b] transition-all duration-300 transform translate-z-10" />
              </div>
            </>
          )}
        </div>
        
        {/* 3D Glossy Specular Light Reflection */}
        <div className="absolute top-0 right-0 w-full h-[38%] rounded-t-2xl bg-gradient-to-b from-white/18 via-white/5 to-transparent pointer-events-none transform translate-z-10" />
        <div className="absolute bottom-0 left-0 w-full h-[18%] rounded-b-2xl bg-gradient-to-t from-black/25 to-transparent pointer-events-none" />
      </motion.button>
    </div>
  );
});

LibraryCard.displayName = 'LibraryCard';

const Library: React.FC = () => {
  const { settings } = useAppContext();
  const { t, isRtl } = useTranslation(settings.appLanguage);
  const { navigate } = useSmartNavigation();

  // Preload all library routes as soon as Library screen mounts
  useEffect(() => {
    preloadLibraryRoutes();
  }, []);

  const handleNavigate = useCallback((to: string) => {
    navigate(to);
  }, [navigate]);

  const libraryItems: LibraryItem[] = useMemo(() => [
    {
      to: "/aqeedah",
      title: t('aqeedah_title') || "العقيدة الصحيحة",
      subtitle: t('aqeedah_subtitle') || "أركان الإيمان، حماية التوحيد، وفقه الأسماء والصفات وفق منهج أهل السنة",
      icon: <ShieldCheck size={26} />,
      color: "from-emerald-950 via-[#083a28] to-[#042418]",
      shadow: "shadow-lg shadow-emerald-950/40",
      fullWidth: true,
    },
    {
      to: "/audio-library",
      title: t('audio_library') || "المكتبة الصوتية",
      subtitle: t('audio_library_subtitle') || "تلاوات، تفسير، دروس، ورقية",
      icon: <Headphones size={24} />,
      color: "from-fuchsia-950 via-slate-900 to-slate-950",
      shadow: "shadow-lg shadow-fuchsia-950/40",
    },
    {
      to: "/names",
      title: t('names_of_allah') || "أسماء الله الحسنى",
      subtitle: "٩٩ اسماً مع الشرح والدعاء",
      icon: <Sparkles size={24} />,
      color: "from-amber-950 via-slate-900 to-slate-950",
      shadow: "shadow-lg shadow-amber-950/40",
    },
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
      title: t('font_studio_title', "استوديو الخطوط"),
      subtitle: t('font_studio_desc', "تنزيل وتخصيص خطوط القرآن والأذكار"),
      icon: <Sparkles size={24} />,
      color: "from-teal-800 via-emerald-900 to-slate-950",
      shadow: "shadow-lg shadow-teal-950/40",
    }
  ], [t]);

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

      <div 
        className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-x-2.5 gap-y-4 relative z-10 px-1 perspective-1000 transform-gpu"
        style={{ perspective: '1200px' }}
      >
        {libraryItems.map((item) => (
          <LibraryCard
            key={item.to}
            item={item}
            isRtl={isRtl}
            onNavigate={handleNavigate}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default React.memo(Library);
