import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Sparkles, 
  Award, 
  BookOpen, 
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
  ArrowLeft 
} from 'lucide-react';
import { VisualBadge } from '../services/badgeService';
import { cn } from '../lib/utils';
import { useSmartNavigation } from '../lib/navigation';

interface BadgeCelebrationModalProps {
  badge: VisualBadge | null;
  isOpen: boolean;
  onClose: () => void;
}

export const BadgeCelebrationModal: React.FC<BadgeCelebrationModalProps> = ({
  badge,
  isOpen,
  onClose
}) => {
  const { navigate } = useSmartNavigation();

  if (!badge) return null;

  const getBadgeIcon = (iconName: string, size = 44) => {
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
      case 'Award': return <Award size={size} />;
      default: return <Trophy size={size} />;
    }
  };

  const handleGoToProfile = () => {
    onClose();
    navigate('/challenges');
  };

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
            className="fixed inset-0 bg-slate-950/85 backdrop-blur-md"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 30 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="relative w-full max-w-sm bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-amber-500/50 rounded-[2.5rem] shadow-[0_20px_60px_rgba(245,158,11,0.25)] p-6 overflow-hidden z-10 text-white font-sans text-center"
            dir="rtl"
          >
            {/* Animated Celebration Sparks / Rings */}
            <motion.div 
              animate={{ rotate: 360, scale: [1, 1.1, 1] }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              className="absolute -top-16 -right-16 w-52 h-52 bg-amber-500/20 rounded-full blur-3xl pointer-events-none"
            />
            <motion.div 
              animate={{ rotate: -360, scale: [1, 1.15, 1] }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute -bottom-16 -left-16 w-52 h-52 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"
            />

            {/* Sparkles Top Banner */}
            <div className="flex items-center justify-center gap-1 text-amber-400 mb-2 font-black text-xs uppercase tracking-widest">
              <Sparkles size={16} />
              <span>إنجاز إيماني جديد!</span>
              <Sparkles size={16} />
            </div>

            <h2 className="text-2xl font-black text-white mb-4">
              مبارك! لقد نلت وساماً جديداً
            </h2>

            {/* Badge Floating Animated Container */}
            <motion.div 
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="relative mx-auto my-4 w-28 h-28 flex items-center justify-center"
            >
              {/* Outer Rotating Glowing Ring */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-3xl border-2 border-dashed border-amber-400/60"
              />

              <div className={cn(
                "w-24 h-24 rounded-3xl flex items-center justify-center shadow-2xl text-white bg-gradient-to-tr",
                badge.gradient,
                badge.borderGlow
              )}>
                {getBadgeIcon(badge.iconName, 48)}
              </div>
            </motion.div>

            {/* Badge Title & Rarity */}
            <div className="space-y-1.5 mb-4">
              <span className="inline-block text-[11px] font-black px-3 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300">
                {badge.rarityLabel}
              </span>
              <h3 className="text-xl font-black text-amber-300">
                {badge.name}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-xs mx-auto">
                {badge.description}
              </p>
            </div>

            {/* Spiritual Quote */}
            {badge.spiritualQuote && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 mb-6 text-center">
                <p className="text-[11px] text-emerald-200/90 font-medium italic">
                  {badge.spiritualQuote}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleGoToProfile}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 active:scale-95 text-slate-950 font-black text-sm rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all"
              >
                <span>عرض في ملفي الشخصي</span>
                <ArrowLeft size={16} />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 px-4 bg-white/10 hover:bg-white/15 active:scale-95 text-white/80 font-bold text-xs rounded-xl transition-all"
              >
                متابعة الطاعات
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
