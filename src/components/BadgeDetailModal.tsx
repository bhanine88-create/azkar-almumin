import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Trophy, 
  Award, 
  BookOpen, 
  Sparkles, 
  Crown, 
  Zap, 
  Star, 
  Heart, 
  Activity, 
  Sun, 
  Moon, 
  Flame, 
  Share2, 
  Check, 
  Lock, 
  ArrowRight,
  ShieldCheck,
  Flame as FireIcon
} from 'lucide-react';
import { VisualBadge } from '../services/badgeService';
import { cn, copyTextToClipboard, shareContent } from '../lib/utils';
import { useSmartNavigation } from '../lib/navigation';

interface BadgeDetailModalProps {
  badge: VisualBadge | null;
  isOpen: boolean;
  onClose: () => void;
  status: {
    isEarned: boolean;
    current: number;
    target: number;
    percent: number;
    unit: string;
  } | null;
}

export const BadgeDetailModal: React.FC<BadgeDetailModalProps> = ({
  badge,
  isOpen,
  onClose,
  status
}) => {
  const { navigate } = useSmartNavigation();
  const [copied, setCopied] = useState(false);

  if (!badge || !status) return null;

  const getBadgeIcon = (iconName: string, size = 36) => {
    switch (iconName) {
      case 'BookOpen': return <BookOpen size={size} />;
      case 'Sparkles': return <Sparkles size={size} />;
      case 'Crown': return <Crown size={size} />;
      case 'Zap': return <Zap size={size} />;
      case 'Star': return <Star size={size} />;
      case 'Heart': return <Heart size={size} />;
      case 'Activity': return <Activity size={size} />;
      case 'Sun': return <Sun size={size} />;
      case 'Moon': return <Moon size={size} />;
      case 'Flame': return <Flame size={size} />;
      case 'Share2': return <Share2 size={size} />;
      case 'Award': return <Award size={size} />;
      default: return <Trophy size={size} />;
    }
  };

  const handleShare = async () => {
    const text = `🌟 لقد حصلت على «${badge.name}» في تطبيق أذكار المؤمن!\n${badge.description}\n\n${badge.spiritualQuote}\n\nتطبيق أذكار المؤمن - رفيقك اليومي للذكر والقرآن 🤍`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `وسام ${badge.name}`,
          text: text,
        });
        return;
      } catch (e) {
        // Fallback to copy
      }
    }

    copyTextToClipboard(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleAction = () => {
    onClose();
    if (badge.actionPath) {
      navigate(badge.actionPath);
    }
  };

  const getRarityBadge = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return {
          label: 'وسام أسطوري ✨',
          bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          glow: 'from-amber-400 to-yellow-600'
        };
      case 'epic':
        return {
          label: 'وسام ملحمي 💎',
          bg: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
          glow: 'from-purple-400 to-indigo-600'
        };
      case 'rare':
        return {
          label: 'وسام نادر 💠',
          bg: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
          glow: 'from-teal-400 to-emerald-600'
        };
      default:
        return {
          label: 'وسام شائع 🌱',
          bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          glow: 'from-emerald-400 to-teal-600'
        };
    }
  };

  const rarityInfo = getRarityBadge(badge.rarity);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-slate-900 border border-white/15 rounded-[2.5rem] shadow-2xl p-6 overflow-hidden z-10 text-white font-sans text-right"
            dir="rtl"
          >
            {/* Ambient Background Glow */}
            <div className={cn(
              "absolute -top-24 -right-24 w-56 h-56 rounded-full blur-[90px] opacity-40 pointer-events-none bg-gradient-to-br",
              rarityInfo.glow
            )} />
            <div className="absolute -bottom-24 -left-24 w-56 h-56 rounded-full blur-[90px] opacity-20 pointer-events-none bg-indigo-500" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-5 left-5 w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-white/80 transition-all z-20"
              aria-label="إغلاق"
            >
              <X size={20} />
            </button>

            {/* Top Badge Visual Showcase */}
            <div className="flex flex-col items-center text-center mt-2 mb-6">
              <div className="relative mb-4">
                {/* Outer Rotating Glowing Ring */}
                {status.isEarned && (
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                    className={cn(
                      "absolute -inset-3 rounded-full border-2 border-dashed opacity-50",
                      badge.rarity === 'legendary' ? 'border-amber-400' : 'border-emerald-400'
                    )}
                  />
                )}

                {/* Badge Icon Capsule */}
                <div className={cn(
                  "w-24 h-24 rounded-3xl flex items-center justify-center shadow-2xl border-2 transition-all duration-300 relative",
                  status.isEarned 
                    ? cn("bg-gradient-to-tr text-white shadow-lg", badge.gradient, badge.borderGlow)
                    : "bg-slate-800 border-white/10 text-slate-400 grayscale opacity-80"
                )}>
                  {getBadgeIcon(badge.iconName, 44)}
                  
                  {/* Status Tag on Icon */}
                  {status.isEarned ? (
                    <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-xl shadow-md border-2 border-slate-900">
                      <Check size={14} className="stroke-[3]" />
                    </div>
                  ) : (
                    <div className="absolute -bottom-2 -right-2 bg-slate-700 text-slate-300 p-1.5 rounded-xl shadow-md border-2 border-slate-900">
                      <Lock size={14} />
                    </div>
                  )}
                </div>
              </div>

              {/* Rarity & Category Pill */}
              <div className="flex items-center gap-2 mb-2">
                <span className={cn("text-[11px] font-black px-3 py-1 rounded-full border", rarityInfo.bg)}>
                  {rarityInfo.label}
                </span>
                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
                  {badge.category === 'quran' ? '📖 القرآن الكريم' : badge.category === 'adhkar' ? '📿 الأذكار' : badge.category === 'tasbih' ? '⚡ التسبيح' : '🔥 الثبات والهمة'}
                </span>
              </div>

              {/* Title & Description */}
              <h3 className="text-2xl font-black text-white tracking-tight mb-2">
                {badge.name}
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed max-w-xs">
                {badge.description}
              </p>
            </div>

            {/* Spiritual Quote / Hadith */}
            {badge.spiritualQuote && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-5 text-center relative overflow-hidden">
                <div className="absolute top-1 right-2 text-white/10 text-3xl font-serif">❝</div>
                <p className="text-xs text-amber-200/90 font-medium leading-relaxed italic relative z-10 px-3">
                  {badge.spiritualQuote}
                </p>
                <div className="absolute bottom-1 left-2 text-white/10 text-3xl font-serif">❞</div>
              </div>
            )}

            {/* Progress Meter */}
            <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-4 mb-6">
              <div className="flex items-center justify-between text-xs font-bold mb-2">
                <span className="text-slate-400">حالة التقدم نحو الهدف:</span>
                <span className={status.isEarned ? "text-emerald-400 font-black" : "text-amber-400 font-black"}>
                  {status.isEarned ? "مكتسب بنجاح 🎉" : `${status.percent}% مكتمل`}
                </span>
              </div>

              {/* Progress Bar Track */}
              <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden p-0.5 relative">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${status.percent}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className={cn(
                    "h-full rounded-full bg-gradient-to-r",
                    status.isEarned 
                      ? "from-emerald-400 to-teal-400 shadow-md shadow-emerald-500/50" 
                      : "from-amber-400 to-orange-500"
                  )}
                />
              </div>

              <div className="flex justify-between items-center text-[11px] text-slate-400 mt-2 font-medium">
                <span>المتحقق: <strong className="text-white font-extrabold">{status.current.toLocaleString()}</strong> {status.unit}</span>
                <span>المطلوب: <strong className="text-white font-extrabold">{status.target.toLocaleString()}</strong> {status.unit}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {status.isEarned ? (
                <button
                  type="button"
                  onClick={handleShare}
                  className="flex-1 py-3.5 px-4 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 active:scale-95 text-slate-950 font-black text-sm rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all"
                >
                  {copied ? <Check size={18} /> : <Share2 size={18} />}
                  <span>{copied ? 'تم نسخ نص الوسام!' : 'مشاركة الوسام الإيماني'}</span>
                </button>
              ) : (
                <>
                  {badge.actionPath && (
                    <button
                      type="button"
                      onClick={handleAction}
                      className="flex-1 py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white font-black text-sm rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all"
                    >
                      <span>{badge.actionLabel || 'انتقل للإنجاز'}</span>
                      <ArrowRight size={16} className="rotate-180" />
                    </button>
                  )}
                </>
              )}

              <button
                type="button"
                onClick={onClose}
                className="py-3.5 px-5 bg-white/10 hover:bg-white/15 active:scale-95 text-white font-black text-sm rounded-2xl transition-all"
              >
                إغلاق
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
