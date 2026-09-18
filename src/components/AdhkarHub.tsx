import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { Sunrise, Sunset, Moon, Sun, Volume2, Landmark, Zap, Star, Utensils, Home, Shirt, Plane, Book, BookOpen, Quote, Heart, Wind, Stethoscope, CloudRain, Shield, Sparkles, MoonStar, Fingerprint, HandHeart, BarChart3, Settings2, LayoutGrid, List, Check, Type, EyeOff, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { BackButton } from './ui/BackButton';
import { useSmartNavigation } from "../lib/navigation";
import { useAppContext } from '../AppContext';
import { useTranslation } from '../i18n';

const AdhkarHub: React.FC = () => {
  const { navigate } = useSmartNavigation();
  const { settings, progress, toggleFavoriteUnified, updateSettings } = useAppContext();
  const { t, isRtl } = useTranslation(settings.appLanguage);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const sections = [
    {
      title: t('essential_daily_adhkar'),
      description: t('essential_daily_adhkar_desc'),
      items: [
        { to: "/adhkar/morning", title: t('morning_adhkar'), subtitle: t('sub_morning'), icon: <Sunrise size={22} />, color: "from-amber-500 to-orange-600", shadow: "shadow-lg shadow-amber-500/30" },
        { to: "/adhkar/evening", title: t('evening_adhkar'), subtitle: t('sub_evening'), icon: <Sunset size={22} />, color: "from-indigo-600 to-violet-700", shadow: "shadow-lg shadow-indigo-500/30" },
        { to: "/adhkar/sleeping", title: t('adhkar_sleeping'), subtitle: t('sub_sleeping'), icon: <Moon size={22} />, color: "from-indigo-900 to-purple-800", shadow: "shadow-lg shadow-indigo-900/30" },
        { to: "/adhkar/waking", title: t('waking_up_title'), subtitle: t('sub_waking'), icon: <Sun size={22} />, color: "from-orange-400 to-red-500", shadow: "shadow-lg shadow-orange-500/30" },
      ]
    },
    {
      title: t('prayer_mosque_section'),
      description: t('prayer_mosque_section_desc'),
      items: [
        { to: "/adhkar/prayer", title: t('adhkar_prayer'), subtitle: t('prayer_sub'), icon: <MoonStar size={20} />, color: "from-cyan-600 to-blue-700", shadow: "shadow-lg shadow-cyan-600/30" }
      ]
    },
    {
      title: t('situations_activities_section'),
      description: t('situations_activities_section_desc'),
      items: [
        { to: "/adhkar/eating", title: t('eating_and_drinking_title'), icon: <Utensils size={20} />, color: "from-orange-500 to-red-600", shadow: "shadow-lg shadow-orange-500/30" },
        { to: "/adhkar/home-bathroom", title: t('entering_exiting_title'), icon: <Home size={20} />, color: "from-teal-600 to-emerald-700", shadow: "shadow-lg shadow-teal-600/30" },
        { to: "/adhkar/clothes", title: t('adhkar_clothes'), icon: <Shirt size={20} />, color: "from-purple-600 to-fuchsia-700", shadow: "shadow-lg shadow-purple-600/30" },
        { to: "/adhkar/travel", title: t('adhkar_travel'), icon: <Plane size={20} />, color: "from-blue-600 to-sky-700", shadow: "shadow-lg shadow-blue-600/30" },
      ]
    },
    {
      title: t('duas_compilations_section'),
      description: t('duas_compilations_section_desc'),
      items: [
        { to: "/duas", title: t('duas_compilation_title'), subtitle: t('from_revelations'), icon: <HandHeart size={20} />, color: "from-teal-600 via-emerald-600 to-emerald-800", shadow: "shadow-lg shadow-emerald-700/30" },
      ]
    },
    {
      title: t('occasions_conditions_section'),
      description: t('occasions_conditions_section_desc'),
      items: [
        { to: "/adhkar/sadness", title: t('distress_anxiety_title'), icon: <Wind size={20} />, color: "from-slate-700 to-slate-900", shadow: "shadow-lg shadow-slate-700/30" },
        { to: "/adhkar/ruqyah", title: t('adhkar_ruqyah'), icon: <Shield size={20} />, color: "from-amber-400 to-amber-500", shadow: "shadow-[0_10px_40px_-5px_rgba(251,191,36,0.8)]", isDarkText: true },
        { to: "/adhkar/sickness", title: t('sickness_visitation_title'), icon: <Stethoscope size={20} />, color: "from-rose-600 to-red-700", shadow: "shadow-lg shadow-rose-600/30" },
        { to: "/adhkar/nature", title: t('natural_phenomena_title'), icon: <CloudRain size={20} />, color: "from-cyan-600 to-blue-700", shadow: "shadow-lg shadow-cyan-600/30" },
      ]
    },
    {
      title: t('my_favorites_section'),
      description: t('my_favorites_section_desc'),
      items: [
        { to: "/adhkar/favorites", title: t('adhkar_favorites'), icon: <Heart size={20} />, color: "from-pink-600 to-rose-700", shadow: "shadow-lg shadow-pink-600/30" },
      ]
    }
  ];

  return (
    <div className="h-full flex flex-col bg-slate-50/50 dark:bg-slate-950">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BackButton forceFallback={true} />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/adhkar-stats')}
            className="p-2 flex items-center justify-center rounded-full bg-teal-500/10 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 border border-teal-500/20"
          >
            <BarChart3 size={18} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 flex items-center justify-center rounded-full bg-slate-500/10 dark:bg-slate-500/20 text-slate-600 dark:text-slate-400 border border-slate-500/20"
          >
            <Settings2 size={18} />
          </motion.button>
        </div>
        <div className={cn("flex flex-col", isRtl ? "items-end" : "items-start")}>
          <h1 className="text-xl font-black bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">{t('adhkar_schedule')}</h1>
          <p className="text-xs font-bold text-slate-500">{t('fortress_of_believer')}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-12">
        <div className="p-4 space-y-8">
          {sections.map((section, sectionIdx) => (
            <motion.div 
              key={sectionIdx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: sectionIdx * 0.1 }}
            >
              <div className={cn("mb-4", isRtl ? "text-right" : "text-left")}>
                <h2 className="text-[17px] font-black text-slate-800 dark:text-white mb-1">{section.title}</h2>
                {settings.adhkarHubShowDescriptions !== false && (
                  <p className="text-xs font-bold text-slate-500">{section.description}</p>
                )}
              </div>

              <div className={cn(
                "grid gap-3",
                settings.adhkarLayout === 'list' 
                  ? "grid-cols-1 sm:grid-cols-2" 
                  : (section.items.length > 2 ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4" : "grid-cols-1 sm:grid-cols-2")
              )}>
                {section.items.map((item, itemIdx) => {
                  if (item.to === "/adhkar/prayer") {
                    return (
                      <Link
                        key={itemIdx}
                        to={item.to}
                        className={cn(
                          "relative block overflow-hidden rounded-3xl border border-teal-500/20 dark:border-teal-400/10 shadow-lg group hover:scale-[1.02] hover:-translate-y-0.5 active:scale-95 duration-200 w-full col-span-1 md:col-span-2",
                          item.shadow
                        )}
                      >
                        {/* Background Gradients */}
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-teal-950 to-cyan-950" />
                        <div className="absolute -right-16 -top-16 w-48 h-48 bg-teal-500/15 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700 pointer-events-none" />
                        <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-cyan-500/15 rounded-full blur-2xl pointer-events-none" />
                        
                        {/* Arabesque Pattern Overlay */}
                        <div className="absolute inset-0 opacity-[0.08] mix-blend-overlay pointer-events-none" style={{ backgroundImage: "url('/images/arabesque.png')" }} />
                        
                        {/* Glowing Border Line */}
                        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-teal-400 to-transparent" />

                        {/* Card Content Wrapper */}
                        <div className="relative z-10 px-6 py-6 flex flex-col justify-between h-full gap-4">
                          <div className={cn("flex items-start justify-between", isRtl ? "flex-row" : "flex-row-reverse")}>
                            {/* Title & Description */}
                            <div className={cn("flex-1 select-none", isRtl ? "text-right" : "text-left")}>
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-teal-500/15 border border-teal-500/20 text-[9px] font-black text-teal-400 mb-2 animate-pulse">
                                <Sparkles size={10} />
                                <span>{t('integrated_journey')}</span>
                              </span>
                              <h3 className="font-black text-lg text-white mb-1 tracking-tight">
                                {item.title}
                              </h3>
                              <p className="text-xs text-slate-300 font-bold leading-relaxed">
                                {t('integrated_journey_desc')}
                              </p>
                            </div>

                            {/* Main Icon Circle */}
                            <div className={cn("w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-500/30 text-teal-400 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-inner", isRtl ? "mr-4" : "ml-4")}>
                              {item.icon}
                            </div>
                          </div>

                          {/* Quick visual steps line representing the prayer journey */}
                          <div className={cn("w-full bg-white/5 dark:bg-black/20 border border-white/5 rounded-2xl p-3 flex items-center justify-between gap-1 mt-1", isRtl ? "flex-row" : "flex-row-reverse")}>
                            <div className="flex flex-col items-center justify-center flex-1">
                              <span className="text-[14px]">💧</span>
                              <span className="text-[9px] text-slate-300 font-black mt-1">{t('prayer_steps_purification')}</span>
                            </div>
                            <div className="h-4 w-[1px] bg-white/10 shrink-0" />
                            <div className="flex flex-col items-center justify-center flex-1">
                              <span className="text-[14px]">🕌</span>
                              <span className="text-[9px] text-slate-300 font-black mt-1">{t('prayer_steps_mosque')}</span>
                            </div>
                            <div className="h-4 w-[1px] bg-white/10 shrink-0" />
                            <div className="flex flex-col items-center justify-center flex-1">
                              <span className="text-[14px]">🔔</span>
                              <span className="text-[9px] text-slate-300 font-black mt-1">{t('prayer_steps_adhan')}</span>
                            </div>
                            <div className="h-4 w-[1px] bg-white/10 shrink-0" />
                            <div className="flex flex-col items-center justify-center flex-1">
                              <span className="text-[14px]">📖</span>
                              <span className="text-[9px] text-slate-300 font-black mt-1">{t('prayer_steps_insalat')}</span>
                            </div>
                            <div className="h-4 w-[1px] bg-white/10 shrink-0" />
                            <div className="flex flex-col items-center justify-center flex-1">
                              <span className="text-[14px]">💖</span>
                              <span className="text-[9px] text-slate-300 font-black mt-1">{t('prayer_steps_after')}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  }

                  if (item.to === "/duas") {
                    return (
                      <Link
                        key={itemIdx}
                        to={item.to}
                        className={cn(
                          "relative block overflow-hidden rounded-3xl border border-emerald-500/20 dark:border-emerald-400/10 shadow-lg group hover:scale-[1.02] hover:-translate-y-0.5 active:scale-95 duration-200 w-full col-span-1 md:col-span-2",
                          item.shadow
                        )}
                      >
                        {/* Background Gradients */}
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-emerald-950 to-teal-950" />
                        <div className="absolute -right-16 -top-16 w-48 h-48 bg-emerald-500/15 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700 pointer-events-none" />
                        <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-teal-500/15 rounded-full blur-2xl pointer-events-none" />
                        
                        {/* Arabesque Pattern Overlay */}
                        <div className="absolute inset-0 opacity-[0.08] mix-blend-overlay pointer-events-none" style={{ backgroundImage: "url('/images/arabesque.png')" }} />
                        
                        {/* Glowing Border Line */}
                        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />

                        {/* Card Content Wrapper */}
                        <div className="relative z-10 px-6 py-6 flex flex-col justify-between h-full gap-4">
                          <div className={cn("flex items-start justify-between", isRtl ? "flex-row" : "flex-row-reverse")}>
                            {/* Title & Description */}
                            <div className={cn("flex-1 select-none", isRtl ? "text-right" : "text-left")}>
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-[9px] font-black text-emerald-400 mb-2 animate-pulse">
                                <Sparkles size={10} />
                                <span>{t('duas_tag')}</span>
                              </span>
                              <h3 className="font-black text-lg text-white mb-1 tracking-tight">
                                {item.title}
                              </h3>
                              <p className="text-xs text-slate-300 font-bold leading-relaxed">
                                {t('duas_desc')}
                              </p>
                            </div>

                            {/* Main Icon Circle */}
                            <div className={cn("w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-inner", isRtl ? "mr-4" : "ml-4")}>
                              {item.icon}
                            </div>
                          </div>

                          {/* Quick visual steps line representing categories in Duas */}
                          <div className={cn("w-full bg-white/5 dark:bg-black/20 border border-white/5 rounded-2xl p-3 flex items-center justify-between gap-1 mt-1", isRtl ? "flex-row" : "flex-row-reverse")}>
                            <div className="flex flex-col items-center justify-center flex-1">
                              <span className="text-[14px]">📖</span>
                              <span className="text-[9px] text-slate-300 font-black mt-1">{t('quranic_duas')}</span>
                            </div>
                            <div className="h-4 w-[1px] bg-white/10 shrink-0" />
                            <div className="flex flex-col items-center justify-center flex-1">
                              <span className="text-[14px]">✨</span>
                              <span className="text-[9px] text-slate-300 font-black mt-1">{t('prophets_duas')}</span>
                            </div>
                            <div className="h-4 w-[1px] bg-white/10 shrink-0" />
                            <div className="flex flex-col items-center justify-center flex-1">
                              <span className="text-[14px]">🤲</span>
                              <span className="text-[9px] text-slate-300 font-black mt-1">{t('prophetic_duas')}</span>
                            </div>
                            <div className="h-4 w-[1px] bg-white/10 shrink-0" />
                            <div className="flex flex-col items-center justify-center flex-1">
                              <span className="text-[14px]">🌿</span>
                              <span className="text-[9px] text-slate-300 font-black mt-1">{t('seeking_forgiveness')}</span>
                            </div>
                            <div className="h-4 w-[1px] bg-white/10 shrink-0" />
                            <div className="flex flex-col items-center justify-center flex-1">
                              <span className="text-[14px]">❤️</span>
                              <span className="text-[9px] text-slate-300 font-black mt-1">{t('mercy_healing')}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  }

                  return (
                    <Link
                      key={itemIdx}
                      to={item.to}
                      className={cn(
                        "relative block overflow-hidden rounded-2xl shadow-sm transition-all duration-300 border border-white/10 dark:border-white/5 group hover:scale-[1.02] hover:-translate-y-0.5 active:scale-95 duration-200",
                        item.shadow,
                        settings.adhkarLayout === 'list' ? "h-auto p-4" : "h-28"
                      )}
                    >
                      <div className={cn("absolute inset-0 bg-gradient-to-br", item.color)} />
                      <div className="absolute inset-0 opacity-[0.15] mix-blend-overlay" style={{ backgroundImage: "url('/images/arabesque.png')" }} />
                      
                      {/* Favorite Heart Button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleFavoriteUnified({
                            id: `adhkar_${item.to.split('/').pop()}`,
                            type: 'adhkar',
                            title: item.title,
                            subtitle: item.subtitle || 'أذكار وأدعية',
                            route: item.to
                          });
                        }}
                        className={cn(
                          "absolute top-2 left-2 z-20 p-1.5 rounded-xl transition-all duration-300",
                          "hover:bg-white/20 text-white/40 hover:text-rose-500 hover:scale-110",
                          item.to.includes('ruqyah') && "text-slate-900/40 hover:text-rose-600 hover:bg-black/5",
                          progress.favorites?.some(f => f.id === `adhkar_${item.to.split('/').pop()}` && f.type === 'adhkar') && (item.to.includes('ruqyah') ? "text-rose-600 fill-rose-600 animate-pulse" : "text-rose-500 fill-rose-500 animate-pulse")
                        )}
                      >
                        <Heart size={15} className={progress.favorites?.some(f => f.id === `adhkar_${item.to.split('/').pop()}` && f.type === 'adhkar') ? "fill-current" : ""} />
                      </button>

                      {settings.adhkarLayout === 'list' ? (
                        <div className="relative z-10 flex items-center justify-start gap-4 h-full" style={{ color: item.to.includes('ruqyah') ? '#0f172a' : '#ffffff' }}>
                          {settings.adhkarHubShowIcons !== false && (
                            <div className={cn("w-12 h-12 shrink-0 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-md border group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300", item.to.includes('ruqyah') ? 'bg-black/10 border-black/10 text-slate-900' : 'bg-white/20 border-white/20 text-white')}>
                              {item.icon}
                            </div>
                          )}
                          <div className={cn("flex flex-col flex-1", isRtl ? "text-right" : "text-left")}>
                            <h3 className={cn("font-bold text-[15px] leading-tight drop-shadow-md", item.to.includes('ruqyah') ? 'text-slate-950' : 'text-white')}>{item.title}</h3>
                            {item.subtitle && settings.adhkarHubShowDescriptions !== false && (
                              <p className={cn("text-[10px] font-bold uppercase tracking-widest mt-1 opacity-90 drop-shadow-sm", item.to.includes('ruqyah') ? 'text-slate-900' : 'text-white/90')}>
                                {item.subtitle}
                              </p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center z-10" style={{ color: item.to.includes('ruqyah') ? '#0f172a' : '#ffffff' }}>
                          {settings.adhkarHubShowIcons !== false && (
                            <div className={cn("w-10 h-10 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-md border mb-2 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300", item.to.includes('ruqyah') ? 'bg-black/10 border-black/10 text-slate-900' : 'bg-white/20 border-white/20 text-white')}>
                              {item.icon}
                            </div>
                          )}
                          <h3 className={cn("font-bold text-[13px] leading-tight drop-shadow-md", item.to.includes('ruqyah') ? 'text-slate-950' : 'text-white')}>{item.title}</h3>
                          {item.subtitle && settings.adhkarHubShowDescriptions !== false && (
                            <p className={cn("text-[9px] font-bold uppercase tracking-widest mt-1 opacity-90 drop-shadow-sm", item.to.includes('ruqyah') ? 'text-slate-900' : 'text-white/90')}>
                              {item.subtitle}
                            </p>
                          )}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Settings Modal */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isSettingsOpen && (
            <motion.div
              key="settings-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSettingsOpen(false)}
              className="fixed inset-0 z-[9999] bg-slate-900/40 backdrop-blur-sm"
            />
          )}
          {isSettingsOpen && (
            <motion.div
              key="settings-modal"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 inset-x-0 z-[10000] bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl border-t border-slate-200 dark:border-slate-800 max-h-[85vh] overflow-y-auto pb-6"
            >
              <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto my-3" />
              
              <div className="px-6 pb-8 pt-2">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-black text-slate-800 dark:text-white">إعدادات العرض</h3>
                  <button
                    onClick={() => setIsSettingsOpen(false)}
                    className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Card Shape / Layout */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <LayoutGrid size={18} className="text-teal-500" />
                      <span className="font-bold text-sm">شكل البطاقات</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => updateSettings({ adhkarLayout: 'grid' })}
                        className={cn(
                          "flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all",
                          (settings.adhkarLayout || 'grid') === 'grid'
                            ? "border-teal-500 bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-300"
                            : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-500 hover:border-slate-300 dark:hover:border-slate-700"
                        )}
                      >
                        <LayoutGrid size={24} />
                        <span className="font-bold text-xs">مربعات (شبكة)</span>
                      </button>
                      <button
                        onClick={() => updateSettings({ adhkarLayout: 'list' })}
                        className={cn(
                          "flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all",
                          settings.adhkarLayout === 'list'
                            ? "border-teal-500 bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-300"
                            : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-500 hover:border-slate-300 dark:hover:border-slate-700"
                        )}
                      >
                        <List size={24} />
                        <span className="font-bold text-xs">مستطيلات (قائمة)</span>
                      </button>
                    </div>
                  </div>

                  {/* Descriptions Visibility */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <Type size={18} className="text-teal-500" />
                      <span className="font-bold text-sm">تفاصيل البطاقة</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl cursor-pointer" onClick={() => updateSettings({ adhkarHubShowDescriptions: settings.adhkarHubShowDescriptions === false ? true : false })}>
                      <div>
                        <p className="font-bold text-sm text-slate-800 dark:text-slate-200">عرض الأوصاف</p>
                        <p className="text-xs text-slate-500 mt-1">إظهار الوصف أسفل عناوين الأقسام</p>
                      </div>
                      <div className={cn("w-12 h-6 rounded-full p-1 transition-colors duration-300", settings.adhkarHubShowDescriptions !== false ? "bg-teal-500" : "bg-slate-300 dark:bg-slate-700")}>
                        <motion.div
                          layout
                          className="w-4 h-4 bg-white rounded-full shadow-sm"
                          animate={{ x: settings.adhkarHubShowDescriptions !== false ? (isRtl ? -24 : 24) : 0 }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Icons Visibility */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl cursor-pointer" onClick={() => updateSettings({ adhkarHubShowIcons: settings.adhkarHubShowIcons === false ? true : false })}>
                      <div>
                        <p className="font-bold text-sm text-slate-800 dark:text-slate-200">عرض الأيقونات</p>
                        <p className="text-xs text-slate-500 mt-1">إظهار الأيقونات التعبيرية داخل البطاقات</p>
                      </div>
                      <div className={cn("w-12 h-6 rounded-full p-1 transition-colors duration-300", settings.adhkarHubShowIcons !== false ? "bg-teal-500" : "bg-slate-300 dark:bg-slate-700")}>
                        <motion.div
                          layout
                          className="w-4 h-4 bg-white rounded-full shadow-sm"
                          animate={{ x: settings.adhkarHubShowIcons !== false ? (isRtl ? -24 : 24) : 0 }}
                        />
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>
          )}
      </AnimatePresence>,
      document.body
    )}
    </div>
  );
};

export default AdhkarHub;
