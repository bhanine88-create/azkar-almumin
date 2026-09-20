import { BackButton } from './ui/BackButton';
import React, { useEffect, useMemo, useCallback } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Lightbulb, Droplets, MessageCircle, Star, History, Scroll, Sparkles, Activity, Quote, Fingerprint, Crown, Moon, Headphones, ShieldCheck } from 'lucide-react';
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

const LibraryCard = React.memo<LibraryCardProps>(({ item, onNavigate }) => {
  const handleClick = useCallback(() => {
    onNavigate(item.to);
  }, [item.to, onNavigate]);

  return (
    <div className="col-span-1">
      <motion.button
        variants={{
          hidden: { opacity: 0, y: 20, scale: 0.95 },
          show: { 
            opacity: 1, 
            y: 0, 
            scale: 1,
            transition: {
              type: "spring",
              stiffness: 260,
              damping: 24
            }
          }
        }}
        whileHover={{ 
          y: -5, 
          scale: 1.025,
          transition: { duration: 0.2, ease: "easeOut" }
        }}
        whileTap={{ scale: 0.97 }}
        onMouseEnter={preloadLibraryRoutes}
        onTouchStart={preloadLibraryRoutes}
        onClick={handleClick}
        className={cn(
          "relative group flex flex-col justify-between items-center w-full h-[142px] sm:h-[152px] p-3 sm:p-3.5 overflow-hidden rounded-2xl sm:rounded-3xl transition-all duration-300 text-center outline-none cursor-pointer",
          "border border-emerald-500/60 dark:border-emerald-400/50",
          "hover:border-[#feb10b] dark:hover:border-[#feb10b]",
          "bg-gradient-to-br from-[#063b28] via-[#04281b] to-[#021810]",
          "shadow-xl shadow-emerald-950/50 dark:shadow-[0_8px_30px_rgba(0,0,0,0.85)] hover:shadow-2xl hover:shadow-emerald-950/70"
        )}
      >
        {/* Subtle Ambient Islamic Arabesque Pattern without color-washing overlay */}
        <div className="absolute inset-0 opacity-20 bg-[url('/images/arabesque.png')] pointer-events-none" />
        
        {/* Warm Golden Corner Glow */}
        <div className="absolute -top-10 -right-10 w-28 h-28 bg-[#feb10b]/20 rounded-full blur-2xl group-hover:scale-125 group-hover:bg-[#feb10b]/35 transition-all duration-500 pointer-events-none" />
        
        {/* Card Foreground Content */}
        <div className="relative z-10 flex flex-col items-center justify-between w-full h-full">
          {/* Icon in High-Contrast Dark Capsule with Golden Glowing Border */}
          <div className="flex-1 flex items-center justify-center w-full pt-0.5">
            <div className="w-12 h-12 rounded-2xl bg-black/75 dark:bg-black/85 backdrop-blur-md flex items-center justify-center border border-[#feb10b]/60 dark:border-[#feb10b]/70 shadow-lg group-hover:scale-110 group-hover:-rotate-3 group-hover:bg-[#feb10b]/25 group-hover:border-[#feb10b] transition-all duration-300 shrink-0">
              {React.cloneElement(item.icon as React.ReactElement<any>, { 
                size: 24, 
                className: "text-[#feb10b] filter drop-shadow-[0_2px_8px_rgba(254,177,11,0.8)] group-hover:scale-110 group-hover:brightness-125 transition-all duration-300" 
              })}
            </div>
          </div>

          {/* Title and Subtitle with Maximum Contrast and Legibility */}
          <div className="min-w-0 w-full shrink-0 flex flex-col justify-center items-center pb-0.5">
            <h3 className="font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] group-hover:text-[#feb10b] transition-colors text-xs sm:text-[13.5px] leading-tight line-clamp-1 px-1 mb-1 tracking-tight text-center">
              {item.title}
            </h3>
            <p className="text-emerald-100 dark:text-emerald-100 font-extrabold text-[10px] sm:text-[10.5px] leading-tight line-clamp-1 px-1 text-center drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] opacity-90 mb-1.5">
              {item.subtitle}
            </p>
            <div className="w-5 h-0.5 bg-[#feb10b] shadow-[0_0_8px_rgba(254,177,11,1)] rounded-full group-hover:w-9 group-hover:bg-[#fec84b] transition-all duration-300" />
          </div>
        </div>
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
      icon: <ShieldCheck size={24} />,
      color: "from-[#063b28] via-[#04281b] to-[#021810]",
      shadow: "shadow-lg shadow-emerald-950/50",
    },
    {
      to: "/audio-library",
      title: t('audio_library') || "المكتبة الصوتية",
      subtitle: t('audio_library_subtitle') || "تلاوات، تفسير، دروس، ورقية",
      icon: <Headphones size={24} />,
      color: "from-[#063b28] via-[#04281b] to-[#021810]",
      shadow: "shadow-lg shadow-emerald-950/50",
    },
    {
      to: "/names",
      title: t('names_of_allah') || "أسماء الله الحسنى",
      subtitle: "٩٩ اسماً مع الشرح والدعاء",
      icon: <Sparkles size={24} />,
      color: "from-[#063b28] via-[#04281b] to-[#021810]",
      shadow: "shadow-lg shadow-emerald-950/50",
    },
    {
      to: "/sunnah-hadith/daily",
      title: t('hadith_of_day'),
      subtitle: t('subtitle_hadith'),
      icon: <MessageCircle size={24} />,
      color: "from-[#063b28] via-[#04281b] to-[#021810]",
      shadow: "shadow-lg shadow-emerald-950/50",
    },
    {
      to: "/hadith-qudsi",
      title: t('home_qudsi_title') || "الأحاديث القدسية",
      subtitle: t('home_qudsi_subtitle') || "شرح موسع وبطاقات واسعة",
      icon: <Crown size={24} />,
      color: "from-[#063b28] via-[#04281b] to-[#021810]",
      shadow: "shadow-lg shadow-emerald-950/50",
    },
    {
      to: "/inspiration",
      title: t('inspiration_title'),
      subtitle: t('inspiration_subtitle'),
      icon: <Quote size={24} />,
      color: "from-[#063b28] via-[#04281b] to-[#021810]",
      shadow: "shadow-lg shadow-emerald-950/50",
    },
    {
      to: "/scholar-sayings",
      title: t('sayings_title'),
      subtitle: t('sayings_subtitle'),
      icon: <Scroll size={24} />,
      color: "from-[#063b28] via-[#04281b] to-[#021810]",
      shadow: "shadow-lg shadow-emerald-950/50",
    },
    {
      to: "/insights",
      title: t('insights_title'),
      subtitle: t('insights_subtitle'),
      icon: <Activity size={24} />,
      color: "from-[#063b28] via-[#04281b] to-[#021810]",
      shadow: "shadow-lg shadow-emerald-950/50",
    },
    {
      to: "/sunnah-hadith/fadael",
      title: t('fadael'),
      subtitle: t('subtitle_fadael'),
      icon: <Star size={24} />,
      color: "from-[#063b28] via-[#04281b] to-[#021810]",
      shadow: "shadow-lg shadow-emerald-950/50",
    },
    {
      to: "/prophet",
      title: t('seerah'),
      subtitle: t('subtitle_seerah'),
      icon: <History size={24} />,
      color: "from-[#063b28] via-[#04281b] to-[#021810]",
      shadow: "shadow-lg shadow-emerald-950/50",
    },
    {
      to: "/istighfar",
      title: t('istighfar_title') || "ركن التوبة والاستغفار",
      subtitle: t('istighfar_subtitle') || "الاستغفار اليومي والندم",
      icon: <Droplets size={24} />,
      color: "from-[#063b28] via-[#04281b] to-[#021810]",
      shadow: "shadow-lg shadow-emerald-950/50",
    },
    {
      to: "/quiz",
      title: t('quiz_title') || "اختبر معلوماتك",
      subtitle: t('quiz_subtitle') || "مسابقات واختبارات إسلامية",
      icon: <Lightbulb size={24} />,
      color: "from-[#063b28] via-[#04281b] to-[#021810]",
      shadow: "shadow-lg shadow-emerald-950/50",
    },
    {
      to: "/stories",
      title: t('islamic_stories'),
      subtitle: t('islamic_stories_subtitle'),
      icon: <BookOpen size={24} />,
      color: "from-[#063b28] via-[#04281b] to-[#021810]",
      shadow: "shadow-lg shadow-emerald-950/50",
    },
    {
      to: "/tasbih",
      title: t('tasbih_card'),
      subtitle: t('subtitle_tasbih'),
      icon: <Fingerprint size={24} />,
      color: "from-[#063b28] via-[#04281b] to-[#021810]",
      shadow: "shadow-lg shadow-emerald-950/50",
    },
    {
      to: "/fasting-tracker",
      title: t('fasting_tracker_title') || "عداد الصيام",
      subtitle: t('fasting_tracker_subtitle') || "صيام النافلة والأيام البيض",
      icon: <Moon size={24} />,
      color: "from-[#063b28] via-[#04281b] to-[#021810]",
      shadow: "shadow-lg shadow-emerald-950/50",
    },
    {
      to: "/font-studio",
      title: t('font_studio_title', "استوديو الخطوط"),
      subtitle: t('font_studio_desc', "تنزيل وتخصيص خطوط القرآن والأذكار"),
      icon: <Sparkles size={24} />,
      color: "from-[#063b28] via-[#04281b] to-[#021810]",
      shadow: "shadow-lg shadow-emerald-950/50",
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
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4 relative z-10 px-1"
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
