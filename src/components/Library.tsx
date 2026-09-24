import { BackButton } from './ui/BackButton';
import React, { useMemo, useCallback } from 'react';
import { BookOpen, Lightbulb, Droplets, MessageCircle, Star, History, Scroll, Sparkles, Activity, Quote, Fingerprint, Crown, Moon, Headphones, ShieldCheck } from 'lucide-react';
import { useTranslation } from '../i18n';
import { useAppContext } from '../AppContext';
import { cn } from '../lib/utils';
import { useSmartNavigation } from '../lib/navigation';
import { preloadLibraryRoute } from '../lib/preloadLibrary';

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
  onNavigate: (to: string) => void;
}

const LibraryCard = React.memo<LibraryCardProps>(({ item, onNavigate }) => {
  const handleClick = useCallback(() => {
    onNavigate(item.to);
  }, [item.to, onNavigate]);
  const handlePreload = useCallback(() => {
    preloadLibraryRoute(item.to);
  }, [item.to]);

  return (
      <button
        type="button"
        onMouseEnter={handlePreload}
        onFocus={handlePreload}
        onClick={handleClick}
        className={cn(
          "navigation-card relative group flex flex-col justify-between items-center min-w-0 w-full h-full min-h-[158px] sm:min-h-[168px] p-3 sm:p-3.5 rounded-2xl sm:rounded-3xl transition-colors text-center cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#feb10b]",
          "border border-emerald-500/60 dark:border-emerald-400/50",
          "hover:border-[#feb10b] dark:hover:border-[#feb10b]",
          "bg-gradient-to-br from-[#063b28] via-[#04281b] to-[#021810]",
          "shadow-md shadow-emerald-950/30"
        )}
      >
        {/* Subtle Ambient Islamic Arabesque Pattern without color-washing overlay */}
        <div aria-hidden="true" className="absolute inset-0 rounded-[inherit] opacity-20 bg-[url('/images/arabesque.png')] pointer-events-none" />
        
        {/* A painted gradient keeps the warm glow without a blurred compositing layer per card. */}
        <div aria-hidden="true" className="absolute inset-0 rounded-[inherit] bg-[radial-gradient(circle_at_top_right,rgba(254,177,11,0.18),transparent_65%)] pointer-events-none" />
        
        {/* Card Foreground Content */}
        <div className="relative z-10 flex flex-1 flex-col items-center justify-between gap-3 min-w-0 w-full">
          {/* Icon in High-Contrast Dark Capsule with Golden Glowing Border */}
          <div aria-hidden="true" className="flex items-center justify-center w-full pt-0.5">
            <div className="w-12 h-12 rounded-2xl bg-[#061d14] flex items-center justify-center border border-[#feb10b]/60 dark:border-[#feb10b]/70 group-hover:border-[#feb10b] transition-colors shrink-0">
              {React.cloneElement(item.icon as React.ReactElement<any>, { 
                size: 24, 
                className: "text-[#feb10b]"
              })}
            </div>
          </div>

          {/* Title and Subtitle with Maximum Contrast and Legibility */}
          <div className="min-w-0 w-full shrink-0 flex flex-col justify-center items-center pb-0.5">
            <h3 className="font-black text-white group-hover:text-[#feb10b] transition-colors text-xs sm:text-[13.5px] leading-relaxed break-words w-full px-1 mb-1 tracking-tight text-center">
              {item.title}
            </h3>
            <p className="text-emerald-100 font-extrabold text-[10px] sm:text-[10.5px] leading-relaxed line-clamp-2 break-words w-full px-1 text-center mb-1.5">
              {item.subtitle}
            </p>
            <div aria-hidden="true" className="w-5 h-0.5 bg-[#feb10b] rounded-full" />
          </div>
        </div>
      </button>
  );
});

LibraryCard.displayName = 'LibraryCard';

const Library: React.FC = () => {
  const { settings } = useAppContext();
  const { t, isRtl } = useTranslation(settings.appLanguage);
  const { navigate } = useSmartNavigation();

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
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className="flex flex-col gap-5 min-w-0 pt-0 px-0 -mx-3 sm:mx-0 sm:px-4 pb-12"
    >
      <div className="flex shrink-0 items-center justify-between mb-2 sticky top-0 z-30 bg-white dark:bg-slate-950 py-4 px-4 border-b border-slate-100 dark:border-slate-800">
        <div className={cn("flex min-w-0 items-center gap-4", isRtl ? "flex-row" : "flex-row-reverse")}>
          <BackButton />
          <div className={isRtl ? "text-right" : "text-left"}>
            <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight leading-relaxed mb-1">
              {t('library')}
            </h2>
            <p className="text-sm font-bold text-teal-600 dark:text-teal-400 opacity-80">
              {t('library_subtitle')}
            </p>
          </div>
        </div>
      </div>

      <div 
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 auto-rows-fr gap-3 sm:gap-4 relative z-10 min-w-0 px-1"
      >
        {libraryItems.map((item) => (
          <LibraryCard
            key={item.to}
            item={item}
            onNavigate={handleNavigate}
          />
        ))}
      </div>
    </div>
  );
};

export default React.memo(Library);
