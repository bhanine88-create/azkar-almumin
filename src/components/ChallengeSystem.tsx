import { BackButton } from './ui/BackButton';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronRight, 
  Target, 
  Award, 
  Calendar, 
  Zap, 
  Star, 
  BookOpen, 
  Sun, 
  Moon, 
  Activity,
  Trophy,
  CheckCircle2,
  Clock,
  ArrowRight,
  ChevronLeft,
  Crown,
  Medal,
  Flame,
  Shield,
  Heart
} from 'lucide-react';
import { cn } from '../lib/utils';
import { auth } from '../firebase';
import { useChallengeTracker } from '../hooks/useChallengeTracker';
import { useAppContext } from '../AppContext';
import { useSmartNavigation } from "../lib/navigation";
import { useTranslation } from '../i18n';
import { 
  CHALLENGES, 
  BADGES, 
  ChallengeType, 
  ChallengeCategory 
} from '../challengesData';

// Helper to get Lucide icon by name string
const getIcon = (name: string, size = 24, className = "") => {
  const icons: Record<string, any> = {
    Sun: <Sun size={size} className={className} />,
    Moon: <Moon size={size} className={className} />,
    Zap: <Zap size={size} className={className} />,
    BookOpen: <BookOpen size={size} className={className} />,
    Activity: <Activity size={size} className={className} />,
    Award: <Award size={size} className={className} />,
    Target: <Target size={size} className={className} />,
    Star: <Star size={size} className={className} />,
    Trophy: <Trophy size={size} className={className} />
  };
  return icons[name] || <Target size={size} className={className} />;
};

export const ChallengesHub: React.FC = () => {
  const { navigate, goBack } = useSmartNavigation();
  const { progress, points, earnedBadges } = useChallengeTracker();
  const [activeTab, setActiveTab] = useState<ChallengeType>(ChallengeType.DAILY);
  const { settings } = useAppContext();
  const { t, isRtl } = useTranslation(settings.appLanguage);

  const filteredChallenges = CHALLENGES.filter(c => c.type === activeTab);

  const getProgressForChallenge = (id: string) => {
    return progress[id] || {
      challengeId: id,
      currentCount: 0,
      completed: false,
      lastUpdated: new Date().toISOString(),
      streakCount: 0,
      history: []
    };
  };

  const getActionLabel = (label?: string) => {
    if (!label) return t('go_to_execute');
    if (label === 'اقرأ الآن') return t('challenge_action_read_now');
    if (label === 'افتح المصحف') return t('challenge_action_open_mushaf');
    if (label === 'ابدأ التسبيح') return t('challenge_action_start_tasbih');
    if (label === 'اقرأ الحديث') return t('challenge_action_read_hadith');
    return label;
  };

  return (
    <div className={cn("flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans", isRtl ? "text-right" : "text-left")} dir={isRtl ? "rtl" : "ltr"}>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-black/5 dark:border-white/5 py-4 px-4 flex items-center justify-between">
        <div className={cn("flex items-center gap-4", isRtl ? "flex-row" : "flex-row-reverse")}>
          <BackButton />
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white">{t('challenges_hub_title')}</h1>
            <p className="text-[10px] text-slate-500 font-black tracking-widest uppercase">{t('challenges_steps_to_jannah')}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className={cn("flex flex-col", isRtl ? "items-end" : "items-start")}>
            <span className="text-[10px] font-black text-slate-400 uppercase">{t('total_points_sub')}</span>
            <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
              <Star size={14} fill="currentColor" />
              <span className="text-lg font-black">{points}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar pt-4">
        {/* Believer's Persistence Level Card */}
        <div className="px-4 mb-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 text-white p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] border border-white/10 group"
          >
            {/* Premium Animated Background */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/30 rounded-full blur-[90px] -mr-40 -mt-40 group-hover:bg-indigo-500/40 transition-all duration-1000" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/20 rounded-full blur-[70px] -ml-32 -mb-32 group-hover:bg-purple-500/30 transition-all duration-1000" />
            <div className="absolute inset-0 bg-[url('/images/arabesque.png')] opacity-[0.05] pointer-events-none mix-blend-overlay" />
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-8">
                <div className="space-y-2">
                  <div className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg text-[10px] font-black uppercase tracking-[0.2em] border border-white/10 inline-flex items-center gap-2">
                    <Crown size={10} className="text-amber-400" />
                    {t('believer_card_tag')}
                  </div>
                  <h2 className="text-4xl font-black tracking-tight drop-shadow-lg flex items-center gap-3">
                    {points > 1000 ? t('status_good_seeker') : t('status_persistent_believer')}
                    <div className="flex items-center gap-1 opacity-60">
                      <Medal size={16} className="text-amber-300" />
                      {points > 2000 && <Crown size={16} className="text-yellow-400" />}
                    </div>
                  </h2>
                  <div className="flex items-center gap-3 px-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[10px] font-bold text-white/60 tracking-widest uppercase">ID: BLV-{auth.currentUser?.uid?.substring(0, 5).toUpperCase() || 'ST-7X'}</span>
                    </div>
                  </div>
                </div>
                
                <motion.div 
                  whileHover={{ scale: 1.1, y: -5, rotate: 0 }}
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 0 }}
                  className="w-16 h-16 bg-gradient-to-tr from-amber-400 via-yellow-500 to-amber-600 rounded-[1.5rem] flex items-center justify-center shadow-[0_15px_40px_rgba(245,158,11,0.5)] border border-white/30 relative"
                >
                  <div className="absolute inset-0 bg-white/20 rounded-[1.5rem] animate-pulse" />
                  <Crown size={32} className="text-white drop-shadow-md relative z-10" style={{ transform: 'none' }} />
                </motion.div>
              </div>

              <div className="space-y-4 bg-black/30 p-6 rounded-[2rem] border border-white/10 backdrop-blur-xl mb-6 shadow-2xl">
                <div className="flex justify-between items-end">
                  <div className="space-y-1 text-right">
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] block">{t('total_points')}</span>
                    <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500 flex items-center gap-2">
                      <Star size={20} className="text-amber-400" fill="currentColor" />
                      {points.toLocaleString()}
                    </div>
                  </div>
                  <div className={isRtl ? "text-left" : "text-right"}>
                     <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] block mb-1">{t('next_level')}</span>
                     <span className="font-black text-white text-xl">{Math.min(100, Math.floor((points / 5000) * 100))}%</span>
                  </div>
                </div>
                
                <div className="h-3.5 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/10">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (points / 5000) * 100)}%` }}
                    transition={{ duration: 1.5, ease: [0.32, 0.72, 0, 1] }}
                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.6)]"
                  />
                </div>
              </div>

              {/* Badges Section */}
              <div className="flex items-center gap-3 px-2">
                <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">{t('earned_badges_label')}:</span>
                <div className="flex items-center gap-2">
                  <motion.div whileHover={{ scale: 1.15, y: -2 }} title={t('badge_app_ambassador_name')} className="w-9 h-9 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 text-rose-400 shadow-xl backdrop-blur-md"><Heart size={16} /></motion.div>
                  <motion.div whileHover={{ scale: 1.15, y: -2 }} title={t('badge_friday_kahf_name')} className="w-9 h-9 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 text-teal-400 shadow-xl backdrop-blur-md"><Zap size={16} /></motion.div>
                  <motion.div whileHover={{ scale: 1.15, y: -2 }} title={t('badge_streak_30_days_name')} className="w-9 h-9 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 text-amber-400 shadow-xl backdrop-blur-md"><Flame size={16} /></motion.div>
                  {points > 500 && <motion.div whileHover={{ scale: 1.15, y: -2 }} title={t('badge_streak_7_days_name')} className="w-9 h-9 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 text-indigo-400 shadow-xl backdrop-blur-md"><Shield size={16} /></motion.div>}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="px-4 mb-6 sticky top-0 z-30 py-2 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-200/50 dark:bg-white/5 p-1.5 rounded-2xl flex gap-1 border border-black/5 dark:border-white/5">
            {[
              { id: ChallengeType.DAILY, label: t('challenges_nav') },
              { id: ChallengeType.WEEKLY, label: t('weekly_goals') },
              { id: ChallengeType.SPECIAL, label: t('special_missions') }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ChallengeType)}
                className={cn(
                  "flex-1 py-2.5 rounded-xl text-sm font-black transition-all duration-300",
                  activeTab === tab.id 
                    ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-md scale-[1.02]"
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-white/5"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Challenges List */}
        <div className="px-4 space-y-4 pb-8">
          <AnimatePresence >
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {filteredChallenges.length > 0 ? (
                filteredChallenges.map((challenge, index) => {
                  const prog = getProgressForChallenge(challenge.id);
                  const percent = Math.min(100, (prog.currentCount / challenge.targetCount) * 100);
                  const isDone = prog.completed;

                  return (
                    <motion.div
                      key={challenge.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={cn(
                        "relative overflow-hidden p-6 rounded-[2rem] border transition-all duration-200 group",
                        isDone 
                          ? "bg-slate-100 dark:bg-slate-900/50 border-emerald-500/20 shadow-lg shadow-emerald-500/5" 
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1"
                      )}
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner transition-transform duration-500 group-hover:scale-110",
                            isDone 
                              ? "bg-emerald-500 text-white shadow-emerald-500/20" 
                              : "bg-indigo-500/10 text-indigo-500"
                          )}>
                            {getIcon(challenge.icon, 28)}
                          </div>
                          <div className={isRtl ? "text-right" : "text-left"}>
                            <div className="flex items-center gap-2">
                              <h3 className="font-black text-slate-800 dark:text-white leading-tight">
                                {t(('challenge_' + challenge.id + '_title') as any) || challenge.title}
                              </h3>
                              {isDone && <CheckCircle2 size={16} className="text-emerald-500" />}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-1 line-clamp-1">
                              {t(('challenge_' + challenge.id + '_desc') as any) || challenge.description}
                            </p>
                          </div>
                        </div>
                        <div className="bg-indigo-500/10 dark:bg-indigo-500/20 px-3 py-1.5 rounded-xl border border-indigo-500/10 dark:border-indigo-500/20 transform transition-all duration-75 active:scale-[0.95] active:opacity-80">
                          <div className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 leading-none">+{challenge.points}</div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-widest px-1">
                          <span className={isDone ? "text-emerald-500" : "text-slate-400"}>
                            {isDone ? t('completed_success') : t('in_progress')}
                          </span>
                          <span className={isDone ? "text-emerald-600" : "text-slate-900 dark:text-white"}>
                            {prog.currentCount} / {challenge.targetCount}
                          </span>
                        </div>
                        
                        <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${percent}%` }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className={cn(
                              "h-full rounded-full transition-all duration-1000",
                              isDone ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]" : "bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.3)]"
                            )}
                          />
                        </div>
                      </div>

                      {!isDone && challenge.actionPath && (
                        <button 
                          onClick={() => navigate(challenge.actionPath!)}
                          className="mt-6 w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black rounded-2xl transition-all duration-75 active:scale-[0.85] active:opacity-70 shadow-lg shadow-black/10 flex items-center justify-center gap-2"
                        >
                          {getActionLabel(challenge.actionLabel)}
                          {isRtl ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                        </button>
                      )}
                    </motion.div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-24 h-24 bg-slate-100 dark:bg-slate-900 rounded-[2rem] flex items-center justify-center text-slate-300 dark:text-slate-700 mb-6 rotate-3 border border-black/5 dark:border-white/5">
                    <Clock size={48} />
                  </div>
                  <h3 className="text-slate-900 dark:text-white font-black text-xl">{t('no_challenges')}</h3>
                  <p className="text-slate-500 font-bold text-sm mt-2 max-w-[200px]">{t('no_challenges_desc')}</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Badges Section */}
        <div className="px-4 py-8 bg-slate-100/50 dark:bg-white/5 rounded-t-[3rem]">
          <div className="flex justify-between items-center mb-6">
            <div className={cn("flex items-center gap-3", isRtl ? "flex-row" : "flex-row-reverse")}>
              <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500">
                <Award size={24} />
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">{t('my_badges')}</h2>
            </div>
            <span className="text-xs font-black text-slate-400">{earnedBadges.length} / {BADGES.length}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {BADGES.map((badge, idx) => {
              const isEarned = earnedBadges.includes(badge.id);

              return (
                <motion.div 
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className={cn(
                    "relative p-5 rounded-[2.5rem] border flex flex-col items-center text-center gap-3 transition-all duration-500 overflow-hidden",
                    isEarned 
                      ? "bg-white dark:bg-slate-900 border-amber-500/30 shadow-xl shadow-amber-500/5" 
                      : "bg-slate-200/50 dark:bg-slate-900/50 border-slate-300/30 dark:border-white/5 opacity-60 grayscale"
                  )}
                >
                  {isEarned && (
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full -mr-12 -mt-12 blur-2xl" />
                  )}
                  
                  <div className={cn(
                    "w-16 h-16 rounded-3xl flex items-center justify-center shadow-lg transform transition-transform duration-500 group-hover:scale-110",
                    isEarned 
                      ? "bg-gradient-to-tr from-amber-400 to-yellow-600 text-white shadow-amber-500/30" 
                      : "bg-slate-200 dark:bg-slate-800 text-slate-400 shadow-none border border-slate-300 dark:border-white/5"
                  )}>
                    {getIcon(badge.iconName, 32)}
                  </div>
                  
                  <div className="space-y-1">
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">
                      {t(('badge_' + badge.id + '_name') as any) || badge.name}
                    </h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold leading-tight">
                      {t(('badge_' + badge.id + '_desc') as any) || badge.description}
                    </p>
                  </div>

                  {!isEarned && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/10 backdrop-blur-[1px]">
                      <div className="bg-white/90 dark:bg-slate-800/90 p-2 rounded-full shadow-lg">
                        <Clock size={16} className="text-slate-400" />
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
