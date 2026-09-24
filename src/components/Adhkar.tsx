import { BackButton } from './ui/BackButton';
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useAdhkarCounts } from '../context/AdhkarCountsContext';
import { ChevronRight, RotateCcw, CheckCircle2, Edit3, Plus, Trash2, ArrowUp, ArrowDown, X, Save, Info, BookOpen, Settings2, Type, Palette, SlidersHorizontal, ChevronDown, Search, Check, Sparkles, Droplets, Building, Bell, Milestone, Award, Heart, Scroll, Play, Pause, Clock, Timer, Hourglass, Pen, ListRestart, Share2, HardDrive } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { useChallengeTracker } from '../hooks/useChallengeTracker';
import { ChallengeCategory } from '../challengesData';
import { cn, shareContent, triggerHaptic } from '../lib/utils';
import { Dhikr } from '../types';
import { useTranslation } from '../i18n';
import { useSmartNavigation } from "../lib/navigation";
import { getLocalizedDhikr } from '../i18n/dhikrTranslations';


const ADHKAR_THEMES: Record<string, any> = {
  emerald: {
    name: 'الزمرد الملكي الفاخر 🌿',
    pageBg: 'bg-[#eaf8f1]',
    pageDeco: 'from-emerald-200/40 to-transparent',
    cardBg: 'from-[#ffffff] to-[#eaf8f1]',
    cardBorder: 'border-emerald-300/60 dark:border-emerald-700/50',
    cardHoverShadow: 'hover:shadow-xl hover:shadow-emerald-300/30',
    bgPreview: 'bg-[#eaf8f1] border-2 border-[#006A4E]',
    noteIcon: 'text-emerald-700',
    isLight: true,
    textColor: 'text-[#064E3B]',
    subTextColor: 'text-[#047857]',
    titleColor: 'text-[#006A4E]',
    rawBg: '#eaf8f1',
    rawCard: '#ffffff',
    rawCardGradient: 'linear-gradient(135deg, #ffffff 0%, #eaf8f1 100%)'
  },
  classicGold: {
    name: 'الثيم الكلاسيكي الرائع 📜',
    pageBg: 'bg-[#FAF3E5]',
    pageDeco: 'from-[#D2B48C]/30 to-transparent',
    cardBg: 'from-[#FFFDF9] to-[#FAF3E5]',
    cardBorder: 'border-[#C19A6B]/40 dark:border-[#C19A6B]/40',
    cardHoverShadow: 'hover:shadow-xl hover:shadow-[#C19A6B]/25',
    bgPreview: 'bg-[#F2E3C6] border-2 border-[#B8860B]',
    noteIcon: 'text-[#8B5A2B]',
    isLight: true,
    textColor: 'text-[#2C1A04]',
    subTextColor: 'text-[#5C4033]',
    titleColor: 'text-[#8B6508]',
    rawBg: '#FAF3E5',
    rawCard: '#FFFDF9',
    rawCardGradient: 'linear-gradient(135deg, #FFFDF9 0%, #FAF3E5 100%)'
  },
  attractivePink: {
    name: 'الثيم الوردي الجذاب 🌸',
    pageBg: 'bg-[#FFF0F5]',
    pageDeco: 'from-[#FFC0CB]/35 to-transparent',
    cardBg: 'from-[#FFFDFD] to-[#FFF0F5]',
    cardBorder: 'border-[#FFB6C1]/50 dark:border-[#FFB6C1]/40',
    cardHoverShadow: 'hover:shadow-xl hover:shadow-[#FFC0CB]/30',
    bgPreview: 'bg-[#FFE4E1] border-2 border-[#FF69B4]',
    noteIcon: 'text-[#E0115F]',
    isLight: true,
    textColor: 'text-[#4A0E17]',
    subTextColor: 'text-[#800020]',
    titleColor: 'text-[#C71585]',
    rawBg: '#FFF0F5',
    rawCard: '#FFFDFD',
    rawCardGradient: 'linear-gradient(135deg, #FFFDFD 0%, #FFF0F5 100%)'
  },
  softMint: {
    name: 'أخضر ناصع فاخر 🌱',
    pageBg: 'bg-[#e3fbec]',
    pageDeco: 'from-emerald-200/40 to-transparent',
    cardBg: 'from-[#f4fdf8] to-[#e3fbec]',
    cardBorder: 'border-emerald-300/60 dark:border-emerald-700/50',
    cardHoverShadow: 'hover:shadow-xl hover:shadow-emerald-200/40',
    bgPreview: 'bg-[#e3fbec] border-2 border-emerald-400',
    noteIcon: 'text-emerald-700',
    isLight: true,
    textColor: 'text-[#064E3B]',
    subTextColor: 'text-[#047857]',
    titleColor: 'text-[#047857]',
    rawBg: '#e3fbec',
    rawCard: '#f4fdf8',
    rawCardGradient: 'linear-gradient(135deg, #f4fdf8 0%, #e3fbec 100%)'
  },
  dreamyLavender: {
    name: 'بنفسجي ناصع فاخر 🪻',
    pageBg: 'bg-[#f4ebff]',
    pageDeco: 'from-purple-200/40 to-transparent',
    cardBg: 'from-[#faf5ff] to-[#f4ebff]',
    cardBorder: 'border-purple-300/60 dark:border-purple-700/50',
    cardHoverShadow: 'hover:shadow-xl hover:shadow-purple-200/40',
    bgPreview: 'bg-[#f4ebff] border-2 border-purple-400',
    noteIcon: 'text-purple-700',
    isLight: true,
    textColor: 'text-[#3b0764]',
    subTextColor: 'text-[#6b21a8]',
    titleColor: 'text-[#7e22ce]',
    rawBg: '#f4ebff',
    rawCard: '#faf5ff',
    rawCardGradient: 'linear-gradient(135deg, #faf5ff 0%, #f4ebff 100%)'
  },
  royalGold: {
    name: 'ذهبي ناصع فاخر 👑',
    pageBg: 'bg-[#fdf6db]',
    pageDeco: 'from-amber-200/40 to-transparent',
    cardBg: 'from-[#fffbeb] to-[#fdf6db]',
    cardBorder: 'border-amber-300/60 dark:border-amber-700/50',
    cardHoverShadow: 'hover:shadow-xl hover:shadow-amber-200/40',
    bgPreview: 'bg-[#fdf6db] border-2 border-amber-400',
    noteIcon: 'text-amber-700',
    isLight: true,
    textColor: 'text-[#451a03]',
    subTextColor: 'text-[#78350f]',
    titleColor: 'text-[#b45309]',
    rawBg: '#fdf6db',
    rawCard: '#fffbeb',
    rawCardGradient: 'linear-gradient(135deg, #fffbeb 0%, #fdf6db 100%)'
  },
  oceanBreeze: {
    name: 'نسيم المحيط 🌊',
    pageBg: 'bg-[#e0f7fa]',
    pageDeco: 'from-cyan-200/40 to-transparent',
    cardBg: 'from-[#f0fdfa] to-[#ccfbf1]',
    cardBorder: 'border-cyan-300/60 dark:border-cyan-700/50',
    cardHoverShadow: 'hover:shadow-xl hover:shadow-cyan-200/40',
    bgPreview: 'bg-[#e0f7fa] border-2 border-cyan-400',
    noteIcon: 'text-cyan-700',
    isLight: true,
    textColor: 'text-[#134e4a]',
    subTextColor: 'text-[#0f766e]',
    titleColor: 'text-[#0f766e]',
    rawBg: '#e0f7fa',
    rawCard: '#f0fdfa',
    rawCardGradient: 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)'
  },
  clearSky: {
    name: 'سماء صافية 🌤️',
    pageBg: 'bg-[#e3f2fd]',
    pageDeco: 'from-sky-200/40 to-transparent',
    cardBg: 'from-[#f0f9ff] to-[#e0f2fe]',
    cardBorder: 'border-sky-300/60 dark:border-sky-700/50',
    cardHoverShadow: 'hover:shadow-xl hover:shadow-sky-200/40',
    bgPreview: 'bg-[#e3f2fd] border-2 border-sky-400',
    noteIcon: 'text-sky-700',
    isLight: true,
    textColor: 'text-[#0c4a6e]',
    subTextColor: 'text-[#0369a1]',
    titleColor: 'text-[#0284c7]',
    rawBg: '#e3f2fd',
    rawCard: '#f0f9ff',
    rawCardGradient: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)'
  },
  lavenderFields: {
    name: 'حقول اللافندر 💜',
    pageBg: 'bg-[#f3e5f5]',
    pageDeco: 'from-purple-200/40 to-transparent',
    cardBg: 'from-[#faf5ff] to-[#f3e8ff]',
    cardBorder: 'border-purple-300/60 dark:border-purple-700/50',
    cardHoverShadow: 'hover:shadow-xl hover:shadow-purple-200/40',
    bgPreview: 'bg-[#f3e5f5] border-2 border-purple-400',
    noteIcon: 'text-purple-700',
    isLight: true,
    textColor: 'text-[#581c87]',
    subTextColor: 'text-[#7e22ce]',
    titleColor: 'text-[#7e22ce]',
    rawBg: '#f3e5f5',
    rawCard: '#faf5ff',
    rawCardGradient: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)'
  },
  jouriRose: {
    name: 'زهرة الجوري 🌹',
    pageBg: 'bg-[#fce4ec]',
    pageDeco: 'from-rose-200/40 to-transparent',
    cardBg: 'from-[#fff1f2] to-[#ffe4e6]',
    cardBorder: 'border-rose-300/60 dark:border-rose-700/50',
    cardHoverShadow: 'hover:shadow-xl hover:shadow-rose-200/40',
    bgPreview: 'bg-[#fce4ec] border-2 border-rose-400',
    noteIcon: 'text-rose-700',
    isLight: true,
    textColor: 'text-[#881337]',
    subTextColor: 'text-[#be123c]',
    titleColor: 'text-[#be123c]',
    rawBg: '#fce4ec',
    rawCard: '#fff1f2',
    rawCardGradient: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)'
  },
  offWhite: {
    name: 'أبيض ناصع فاخر ⚪',
    pageBg: 'bg-[#f8fafc]',
    pageDeco: 'from-slate-200/40 to-transparent',
    cardBg: 'from-[#ffffff] to-[#ffffff]',
    cardBorder: 'border-slate-200 dark:border-slate-700',
    cardHoverShadow: 'hover:shadow-xl hover:shadow-slate-200/50',
    bgPreview: 'bg-white border-2 border-slate-300',
    noteIcon: 'text-slate-600',
    isLight: true,
    textColor: 'text-[#0f172a]',
    subTextColor: 'text-[#475569]',
    titleColor: 'text-[#0f766e]',
    rawBg: '#f8fafc',
    rawCard: '#ffffff',
    rawCardGradient: 'linear-gradient(135deg, #ffffff 0%, #ffffff 100%)'
  },
  luxuryBrown: {
    name: 'بني غامق فاخر 🪵',
    pageBg: 'bg-[#1e140d]',
    pageDeco: 'from-[#3c2819]/50 to-transparent',
    cardBg: 'from-[#2a1c12] to-[#1e140d]',
    cardBorder: 'border-[#4a3220] dark:border-[#4a3220]',
    cardHoverShadow: 'hover:shadow-xl hover:shadow-[#0d0703]/80',
    bgPreview: 'bg-[#1e140d] border-2 border-[#8B5A2B]',
    noteIcon: 'text-amber-400',
    isLight: false,
    textColor: 'text-[#fdf6ee]',
    subTextColor: 'text-[#e2d5c8]',
    titleColor: 'text-[#fbbf24]',
    rawBg: '#1e140d',
    rawCard: '#2a1c12',
    rawCardGradient: 'linear-gradient(135deg, #2a1c12 0%, #1e140d 100%)'
  },
  rawdahGlow: {
    name: 'الروضة الشريفة 🕌',
    pageBg: 'bg-[#032e1e]',
    pageDeco: 'from-emerald-900/50 to-transparent',
    cardBg: 'from-[#064e3b] to-[#032e1e]',
    cardBorder: 'border-emerald-600/60 dark:border-emerald-600/60',
    cardHoverShadow: 'hover:shadow-xl hover:shadow-emerald-950/80',
    bgPreview: 'bg-[#032e1e] border-2 border-[#10b981]',
    noteIcon: 'text-emerald-300',
    isLight: false,
    textColor: 'text-[#ecfdf5]',
    subTextColor: 'text-[#a7f3d0]',
    titleColor: 'text-[#fde047]',
    rawBg: '#032e1e',
    rawCard: '#064e3b',
    rawCardGradient: 'linear-gradient(135deg, #064e3b 0%, #032e1e 100%)'
  },
  seharIndigo: {
    name: 'سماء السحر 🌌',
    pageBg: 'bg-[#0b1021]',
    pageDeco: 'from-indigo-900/50 to-transparent',
    cardBg: 'from-[#172042] to-[#0b1021]',
    cardBorder: 'border-indigo-600/60 dark:border-indigo-600/60',
    cardHoverShadow: 'hover:shadow-xl hover:shadow-indigo-950/80',
    bgPreview: 'bg-[#0b1021] border-2 border-indigo-500',
    noteIcon: 'text-indigo-300',
    isLight: false,
    textColor: 'text-[#eef2ff]',
    subTextColor: 'text-[#c7d2fe]',
    titleColor: 'text-[#5eead4]',
    rawBg: '#0b1021',
    rawCard: '#172042',
    rawCardGradient: 'linear-gradient(135deg, #172042 0%, #0b1021 100%)'
  },
  auroraHeaven: {
    name: 'أورورا السماء ✨',
    pageBg: 'bg-[#062529]',
    pageDeco: 'from-teal-900/50 to-transparent',
    cardBg: 'from-[#0c3c42] to-[#062529]',
    cardBorder: 'border-teal-600/60 dark:border-teal-600/60',
    cardHoverShadow: 'hover:shadow-xl hover:shadow-teal-950/80',
    bgPreview: 'bg-[#062529] border-2 border-teal-400',
    noteIcon: 'text-teal-300',
    isLight: false,
    textColor: 'text-[#f0fdfa]',
    subTextColor: 'text-[#99f6e4]',
    titleColor: 'text-[#67e8f9]',
    rawBg: '#062529',
    rawCard: '#0c3c42',
    rawCardGradient: 'linear-gradient(135deg, #0c3c42 0%, #062529 100%)'
  },
  heavenlyRose: {
    name: 'شفق الجنة 🌺',
    pageBg: 'bg-[#29131b]',
    pageDeco: 'from-rose-900/50 to-transparent',
    cardBg: 'from-[#421d2b] to-[#29131b]',
    cardBorder: 'border-rose-600/60 dark:border-rose-600/60',
    cardHoverShadow: 'hover:shadow-xl hover:shadow-rose-950/80',
    bgPreview: 'bg-[#29131b] border-2 border-rose-400',
    noteIcon: 'text-pink-300',
    isLight: false,
    textColor: 'text-[#fff1f2]',
    subTextColor: 'text-[#fecdd3]',
    titleColor: 'text-[#fda4af]',
    rawBg: '#29131b',
    rawCard: '#421d2b',
    rawCardGradient: 'linear-gradient(135deg, #421d2b 0%, #29131b 100%)'
  }
};

const AestheticParticles = ({ themeKey }: { themeKey: string }) => {
  const [particles, setParticles] = React.useState<{ id: number; left: number; top: number; size: number; delay: number; duration: number }[]>([]);

  React.useEffect(() => {
    const newParticles = Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 6 + 2,
      delay: Math.random() * 5,
      duration: Math.random() * 10 + 12,
    }));
    setParticles(newParticles);
  }, []);

  const particleColor = themeKey === 'rawdahGlow' ? 'bg-amber-300/40 shadow-[0_0_8px_#fcd34d]' :
                        themeKey === 'seharIndigo' ? 'bg-indigo-300/40 shadow-[0_0_8px_#a5b4fc]' :
                        themeKey === 'auroraHeaven' ? 'bg-teal-300/40 shadow-[0_0_8px_#99f6e4]' :
                        themeKey === 'heavenlyRose' ? 'bg-pink-300/40 shadow-[0_0_8px_#fbcfe8]' :
                        'bg-teal-500/20';

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-[-12]">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className={`absolute rounded-full ${particleColor}`}
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
          }}
          animate={{
            y: [0, -120, 0],
            x: [0, Math.sin(p.id) * 20, 0],
            opacity: [0.1, 0.7, 0.1],
            scale: [1, 1.4, 1],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

const getPatternStyle = (settings: any, currentTheme: any) => {
  const isDark = !currentTheme.isLight;
  const stroke = isDark ? '%23ffffff' : encodeURIComponent(settings.primaryColor || '#006A4E');
  const opacity = isDark ? '0.06' : '0.05';

  if (settings.adhkarWallpaperPattern === 'islamic') {
    return {
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Cpath d='M24 0 L48 24 L24 48 L0 24 Z M24 8 L40 24 L24 40 L8 24 Z M24 16 L32 24 L24 32 L16 24 Z' fill='none' stroke='${stroke}' stroke-width='0.5' stroke-opacity='${opacity}'/%3E%3C/svg%3E")`,
      backgroundSize: '48px 48px'
    };
  }
  if (settings.adhkarWallpaperPattern === 'grid') {
    return {
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='30' height='30' viewBox='0 0 30 30'%3E%3Crect width='30' height='30' fill='none' stroke='${stroke}' stroke-width='0.5' stroke-opacity='${opacity}'/%3E%3C/svg%3E")`,
      backgroundSize: '30px 30px'
    };
  }
  if (settings.adhkarWallpaperPattern === 'dots') {
    return {
      backgroundImage: `radial-gradient(${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,106,78,0.06)'} 1.5px, transparent 1.5px)`,
      backgroundSize: '24px 24px'
    };
  }
  return {};
};

const FONTS_LIST = [
  { id: 'Amiri', name: 'الخط الأميري (كلاسيكي تراثي وقرآني)' },
  { id: 'Scheherazade New', name: 'خط شهرزاد (نسخي تقليدي ممتاز)' },
  { id: 'Lateef', name: 'خط لطيف (نسخي ناعم مقروء)' },
  { id: 'Aref Ruqaa', name: 'خط الرقعة (فني كلاسيكي)' },
  { id: 'Noto Naskh Arabic', name: 'خط النسخ (واضح ومثالي للقراءة)' },
  { id: 'El Messiri', name: 'خط المسيري (ديواني انسيابي)' },
  { id: 'Cairo', name: 'خط القاهرة (هندسي عريض عصري)' },
  { id: 'Tajawal', name: 'خط تجوال (ناعم وسلس)' },
  { id: 'Zain', name: 'خط زين (أنيق ونحيف جداً)' },
  { id: 'Beiruti', name: 'خط بيروتي (تصميم مبتكر فاخر)' },
  { id: 'Noto Kufi Arabic', name: 'الخط الكوفي (تراثي عريق هندسي)' },
  { id: 'Alexandria', name: 'خط الإسكندرية (عريض وفخم)' },
  { id: 'Lalezar', name: 'خط لاليزار (فني عريض وجذاب)' },
  { id: 'Marhey', name: 'خط مرحي (إبداعي وممتع)' },
  { id: 'Baloo Bhaijaan 2', name: 'خط بالو (دائري ناعم وجميل)' },
  { id: 'Reem Kufi', name: 'خط ريم كوفي (فني مزخرف وبسيط)' },
  { id: 'Rakkas', name: 'خط رقاص (مزخرف فني فريد)' },
  { id: 'Changa', name: 'خط شانجا (هندسي مسطح)' },
  { id: 'Lemonada', name: 'خط ليمونادة (انسيابي حديث)' },
  { id: 'Harmattan', name: 'خط هرمتان (بسيط وناعم)' },
  { id: 'Katibeh', name: 'خط كتيبة (قديم الطراز)' },
  { id: 'IBM Plex Sans Arabic', name: 'خط IBM بلكس (شكل تقني نقي)' }
];

// Memoized Dhikr Card Component for Better Performance
const DhikrCard = React.memo(({ 
  item, 
  idx, 
  count, 
  settings, 
  theme, 
  updateCount, 
  addPoints,
  className,
  categoryTitle
}: { 
  item: Dhikr, 
  idx: number, 
  count: number, 
  settings: any, 
  theme: any, 
  updateCount: any, 
  addPoints: any,
  className?: string,
  categoryTitle?: string
}) => {
  const { t, isRtl } = useTranslation(settings.appLanguage);
  const [isShared, setIsShared] = useState(false);
  const isFinished = count >= item.count;
  const progressPercent = (count / item.count) * 100;

  const cardRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!cardRef.current || settings.hapticTasbihEnabled === false) return;
    
    let isReady = false;
    // Delay activating haptic feedback to avoid buzzing during initial page load/animations
    const timeoutId = setTimeout(() => {
      isReady = true;
    }, 1200); 

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Trigger a light haptic tap when the card enters the view for a tactile scroll feel
          if (entry.isIntersecting && isReady) {
            triggerHaptic('light');
          }
        });
      },
      { threshold: 0.6 }
    );

    observer.observe(cardRef.current);

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [settings.hapticTasbihEnabled]);

  const isDuaItem = React.useMemo(() => {
    const cTitle = categoryTitle || '';
    if (
      cTitle.includes('دعاء') || 
      cTitle.includes('أدعية') || 
      cTitle.includes('سفر') || 
      cTitle.includes('كرب') || 
      cTitle.includes('هم') || 
      cTitle.includes('حزن') || 
      cTitle.includes('مرض') || 
      cTitle.includes('استخارة')
    ) {
      return true;
    }

    const itemTitle = item.title || '';
    if (
      itemTitle.includes('دعاء') || 
      itemTitle.includes('استعاذة') ||
      itemTitle.includes('طلب')
    ) {
      return true;
    }

    const text = item.text || '';
    if (
      text.includes('اللهم') || 
      text.includes('ربنا') || 
      text.includes('ربِّ') || 
      text.includes('ربي') || 
      text.includes('رب ') || 
      text.includes('أعوذ') || 
      text.includes('أستعيذ') || 
      text.includes('يا رب') || 
      text.includes('آتنا') || 
      text.includes('اغفر') || 
      text.includes('ارحم') || 
      text.includes('اهدني') || 
      text.includes('عافني') || 
      text.includes('ارزقني')
    ) {
      return true;
    }

    return false;
  }, [categoryTitle, item.title, item.text]);
  
  // Royal Ink Colors
  const startColor = { r: 0, g: 106, b: 78 }; // #006A4E
  const endColor = { r: 139, g: 0, b: 0 }; // #8B0000
  
  const r = Math.round(startColor.r + (endColor.r - startColor.r) * (progressPercent / 100));
  const g = Math.round(startColor.g + (endColor.g - startColor.g) * (progressPercent / 100));
  const b = Math.round(startColor.b + (endColor.b - startColor.b) * (progressPercent / 100));
  
  const borderColor = isFinished ? '#8B0000' : `rgb(${r}, ${g}, ${b})`;
  const ROYAL_RED = "#8B0000"; 
  
  const { localizedTitle, localizedDescription, localizedTranslation } = getLocalizedDhikr(item, settings.appLanguage);

  let title = localizedTitle || item.title || '';
  let description = localizedDescription || item.description || '';
  let cleanText = item.text || '';
  
  const BASMALA = 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ';
  const ISTIAZA = 'أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ';

  if (!title && cleanText) {
    if (cleanText.startsWith('أعوذ بالله من الشيطان الرجيم:')) {
        title = ISTIAZA;
        cleanText = cleanText.replace('أعوذ بالله من الشيطان الرجيم:', '').trim();
    } else if (cleanText.startsWith('بسم الله الرحمن الرحيم:')) {
        title = BASMALA;
        cleanText = cleanText.replace('بسم الله الرحمن الرحيم:', '').trim();
    }
  }

  const isSpecialTitle = title === BASMALA || title === ISTIAZA;

  return (
    <motion.div
      ref={cardRef}
      initial={settings.adhkarViewMode === 'single' ? false : { opacity: 0, y: 40 }}
      animate={settings.adhkarViewMode === 'single' ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
      transition={{ 
        duration: 1.2,
        delay: settings.adhkarViewMode === 'single' ? 0 : Math.min(idx * 0.1, 1.0),
        ease: "easeOut"
      }}
      className={cn(
        "relative w-full rounded-2xl transition-all duration-300 transform hover:-translate-y-0.5 border-[2px] overflow-hidden scroll-my-10 flex flex-col shadow-md",
        isFinished && "opacity-90",
        className
      )}
      style={{ 
        borderColor: borderColor, 
        borderStyle: 'solid',
        background: theme.rawCardGradient || theme.rawCard || theme.rawBg || '#ffffff'
      }}
    >
      {/* Progress Border */}
      {count > 0 && (
        <div 
          className="absolute -inset-[3px] rounded-3xl pointer-events-none z-10"
          style={{
            padding: '3px',
            background: `conic-gradient(${ROYAL_RED} ${Math.min(progressPercent, 100) * 3.6}deg, transparent 0deg)`,
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
          }}
        />
      )}
      <div className={cn(
        "px-4 py-3 pb-2.5 border-b/[0.3] flex items-center justify-between rounded-t-2xl relative",
        "bg-transparent border-black/[0.06] dark:border-white/[0.06]"
      )}>
        <div className={cn("flex items-center gap-3", isSpecialTitle && "w-full justify-center")}>
          <div className={cn(
            "w-9 h-9 rounded-full flex items-center justify-center font-bold text-base shrink-0 transition-all border border-white/20 text-white",
            isFinished 
              ? "bg-[#8B0000] dark:bg-[#8B0000] shadow-[0_4px_15px_rgba(139,0,0,0.3)]" 
              : "bg-[#006A4E] dark:bg-[#006A4E] shadow-[0_4px_15px_rgba(0,106,78,0.3)]",
            isSpecialTitle && "absolute right-4"
          )}>
            <span className="relative top-px">{idx + 1}</span>
          </div>
          {title && (
            <h3 className={cn(
              "font-bold drop-shadow-sm transition-all",
              isSpecialTitle ? "text-lg text-center" : "text-sm",
              theme.titleColor || (theme.isLight ? "text-slate-800" : "text-teal-800 dark:text-teal-400")
            )}>{title}</h3>
          )}
        </div>
        <div className={cn("flex items-center gap-2", isSpecialTitle && "absolute left-4")}>
          <button
            onClick={async (e) => {
              e.stopPropagation();
              
              triggerHaptic('light');
              
              setIsShared(true);
              setTimeout(() => setIsShared(false), 2000);

              // Improved formatting for WhatsApp, Telegram, etc.
              const textToShare = `﷽\n\n${title && !isSpecialTitle ? `*【 ${title} 】*\n\n` : ''}${cleanText}\n\n${description ? `💡 _${description}_\n\n` : ''}— تمت المشاركة عبر تطبيق أذكار المؤمن`;
              
              await shareContent('أذكار المؤمن', textToShare);
            }}
            className={cn(
              "h-8 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer overflow-hidden whitespace-nowrap",
              isShared 
                ? "w-28 bg-emerald-500 text-white shadow-[0_2px_12px_rgba(16,185,129,0.4)] px-3 gap-1.5 border-2 border-emerald-400" 
                : "w-8 bg-emerald-50/80 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 border-[2.5px] border-emerald-700 hover:border-emerald-800 dark:border-emerald-500 dark:hover:border-emerald-400 shadow-sm active:scale-[0.95] text-emerald-700 hover:text-emerald-800 dark:text-emerald-500 dark:hover:text-emerald-400"
            )}
            title={isRtl ? "مشاركة" : "Share"}
            disabled={isShared}
          >
            {isShared ? (
              <>
                <Check size={14} strokeWidth={3} className="animate-[ping_0.3s_ease-out_reverse] shrink-0" />
                <span className="text-[10px] font-bold animate-[fadeIn_0.3s_ease-out]">تمت المشاركة</span>
              </>
            ) : (
              <Share2 size={15} strokeWidth={2.5} className="shrink-0" />
            )}
          </button>
          {isFinished && (
            <CheckCircle2 size={20} className="text-teal-500 drop-shadow-sm" />
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative overflow-y-auto custom-scrollbar">
        <div className="px-3 md:px-6 py-6 relative w-full h-full flex items-center justify-center">
          <p 
            style={{ fontSize: settings.adhkarFontSize }}
            className={cn(
              "font-adhkar font-extrabold tracking-widest leading-loose text-center drop-shadow-sm transition-all duration-300 w-full",
              theme.textColor || (theme.isLight ? "text-slate-800" : "text-slate-800 dark:text-slate-200")
            )}
          >
            {cleanText}
          </p>
        </div>
      </div>

      {localizedTranslation && (
        <div className="w-full px-4 py-2.5 bg-emerald-500/10 dark:bg-emerald-500/15 border-t border-emerald-500/20 text-center">
          <p className="text-xs md:text-sm font-semibold text-emerald-900 dark:text-emerald-200 italic">
            "{localizedTranslation}"
          </p>
        </div>
      )}

      {description && (
        <div className={cn(
          "w-full border-t/[0.3] px-3 md:px-6 py-2 flex items-start gap-3",
          "bg-transparent border-black/[0.06] dark:border-white/[0.06]"
        )}>
          <Info size={18} className={`mt-0.5 shrink-0 ${theme.noteIcon}`} />
          <p className={cn(
            "text-xs md:text-sm leading-relaxed font-black whitespace-pre-line",
            theme.subTextColor || (theme.isLight ? "text-slate-500" : "text-slate-500 dark:text-slate-400")
          )}>
            {description}
          </p>
        </div>
      )}



      <div className="w-full">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            if (isFinished) return;
            const newCount = count + 1;
            updateCount(item.id, newCount);
            addPoints(2);
            if (newCount >= item.count) {
              triggerHaptic('success');
            } else if (settings.hapticTasbihEnabled !== false) {
              triggerHaptic('light');
            }
          }}
          disabled={isFinished}
          className={cn(
            "block w-full relative overflow-hidden rounded-b-2xl transition-all duration-200",
            isFinished
              ? "bg-[#8B0000] text-white shadow-none cursor-default"
              : "bg-gradient-to-b from-[#006A4E] to-[#00523C] dark:from-[#006A4E] dark:to-[#00523C] text-white shadow-[0_6px_0_0_#003B2C] active:shadow-[0_0px_0_0_#003B2C] active:translate-y-[6px]"
          )}
        >
          {!isFinished && (
            <div 
              className="absolute top-0 right-0 h-full transition-all duration-300 bg-[#8B0000]"
              style={{ width: `${progressPercent}%` }}
            />
          )}
          
          <div className="relative z-10 flex items-center justify-between px-3 md:px-6 py-3">
            <span className="font-bold text-base md:text-lg drop-shadow-md text-white">
              {isFinished ? t('dhikr_completed') : count === 0 ? t('press_to_start') : `${t('remaining')}: ${item.count - count}`}
            </span>

            <div className="flex items-center gap-3 px-3 py-2 rounded-xl backdrop-blur-md shadow-inner bg-black/20 text-white">
              <span className="text-2xl font-bold">{count}</span>
              <span className="text-base opacity-90">/ {item.count}</span>
            </div>
          </div>
        </motion.button>
      </div>
    </motion.div>
  );
});

export const Adhkar: React.FC = () => {
  const { category } = useParams<{ category?: string }>();
  const { navigate, goBack } = useSmartNavigation();
  const location = useLocation();
  const { adhkarData, addPoints, markCategoryCompleted, addDhikr, updateDhikr, deleteDhikr, reorderDhikr, resetCategory, settings, updateSettings } = useAppContext();
  const { counts, updateCount, resetCounts } = useAdhkarCounts();
  const { updateChallengeProgress, updateSpecificChallenge } = useChallengeTracker();
  const { t, isRtl } = useTranslation(settings.appLanguage);

  const [activeDhikrIdx, setActiveDhikrIdx] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'forward' | 'backward'>('forward');

  React.useEffect(() => {
    setActiveDhikrIdx(0);
  }, [category]);
  
  const categories = adhkarData.map(c => c.category);
  const currentIndex = categories.findIndex(c => c === category);
  
  const touchStartX = React.useRef(0);
  const touchStartY = React.useRef(0);
  const touchEndX = React.useRef(0);
  const touchEndY = React.useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchStartY.current = e.targetTouches[0].clientY;
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
    touchEndY.current = e.targetTouches[0].clientY;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const distanceX = touchStartX.current - touchEndX.current;
    const distanceY = touchStartY.current - touchEndY.current;
    const minSwipeDistance = 50;
    
    // Check if horizontal movement dominates vertical movement
    if (Math.abs(distanceX) > minSwipeDistance && Math.abs(distanceX) > Math.abs(distanceY) * 1.3) {
      if (distanceX > minSwipeDistance) {
        // Finger dragged Left -> Next category in RTL
        const targetIndex = isRtl ? currentIndex + 1 : currentIndex - 1;
        if (targetIndex >= 0 && targetIndex < categories.length) {
          navigate(`/adhkar/${categories[targetIndex]}`);
          triggerHaptic('light');
        }
      } else if (distanceX < -minSwipeDistance) {
        // Finger dragged Right -> Previous category in RTL
        const targetIndex = isRtl ? currentIndex - 1 : currentIndex + 1;
        if (targetIndex >= 0 && targetIndex < categories.length) {
          navigate(`/adhkar/${categories[targetIndex]}`);
          triggerHaptic('light');
        }
      }
    }
    
    touchStartX.current = 0;
    touchEndX.current = 0;
    touchStartY.current = 0;
    touchEndY.current = 0;
  };

  const currentCategory = adhkarData.find(c => c.category === category);

  // --- Interactive Modern Prayer Steps Layout Logic ---
  const [activePrayerStep, setActivePrayerStep] = useState<string>(() => {
    const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const stepParam = searchParams.get('step');
    return (stepParam && ['all', 'wudu', 'mosque', 'adhan', 'salat', 'after'].includes(stepParam)) ? stepParam : 'all';
  });

  React.useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const stepParam = searchParams.get('step');
    if (stepParam && ['all', 'wudu', 'mosque', 'adhan', 'salat', 'after'].includes(stepParam)) {
      setActivePrayerStep(stepParam);
    }
  }, [location.search]);

  const PRAYER_STEPS_DEFINITION = React.useMemo(() => [
    { id: 'all', title: t('step_all_title'), description: t('step_all_desc'), icon: Scroll, color: 'text-teal-600 border-teal-500 bg-teal-50 dark:bg-teal-950/20' },
    { id: 'wudu', title: t('step_wudu_title'), description: t('step_wudu_desc'), icon: Droplets, color: 'text-sky-600 border-sky-500 bg-sky-50 dark:bg-sky-950/20' },
    { id: 'mosque', title: t('step_mosque_title'), description: t('step_mosque_desc'), icon: Building, color: 'text-emerald-600 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' },
    { id: 'adhan', title: t('step_adhan_title'), description: t('step_adhan_desc'), icon: Bell, color: 'text-amber-600 border-amber-500 bg-amber-50 dark:bg-amber-950/20' },
    { id: 'salat', title: t('step_salat_title'), description: t('step_salat_desc'), icon: Award, color: 'text-violet-600 border-violet-500 bg-violet-50 dark:bg-violet-950/20' },
    { id: 'after', title: t('step_after_title'), description: t('step_after_desc'), icon: Heart, color: 'text-rose-600 border-rose-500 bg-rose-50 dark:bg-rose-950/20' }
  ], [t]);

  const getItemPrayerStep = React.useCallback((itemText: string, itemDesc: string = '') => {
    const normalizedDesc = itemDesc || '';
    if (normalizedDesc.includes('أذكار الوضوء') || normalizedDesc.includes('الوضوء')) return 'wudu';
    if (normalizedDesc.includes('أذكار المسجد') || normalizedDesc.includes('المسجد')) return 'mosque';
    if (normalizedDesc.includes('الأذان والإقامة') || normalizedDesc.includes('أذكار الأذان') || normalizedDesc.includes('الأذان')) return 'adhan';
    if (normalizedDesc.includes('داخل الصلاة') || normalizedDesc.includes('في الصلاة') || normalizedDesc.includes('الاستفتاح') || normalizedDesc.includes('الركوع') || normalizedDesc.includes('السجود') || normalizedDesc.includes('التشهد')) return 'salat';
    if (normalizedDesc.includes('بعد الصلاة') || normalizedDesc.includes('دبر كل صلاة') || normalizedDesc.includes('بعد السلام')) return 'after';
    return 'all'; // Standard fallback or user custom items
  }, []);

  const filteredItems = React.useMemo(() => {
    if (!currentCategory || !currentCategory.items) return [];
    if (category !== 'prayer' || activePrayerStep === 'all') return currentCategory.items;
    
    return currentCategory.items.filter(item => {
      const step = getItemPrayerStep(item.text, item.description || '');
      return step === activePrayerStep;
    });
  }, [currentCategory, category, activePrayerStep, getItemPrayerStep]);

  const categoryTranslationKeys: Record<string, string> = {
    morning: 'morning_adhkar',
    evening: 'evening_adhkar',
    sleeping: 'adhkar_sleeping',
    waking: 'adhkar_waking',
    prayer: 'adhkar_prayer',
    eating: 'adhkar_eating',
    'home-bathroom': 'adhkar_home_bathroom',
    clothes: 'adhkar_clothes',
    travel: 'adhkar_travel',
    sadness: 'adhkar_sadness',
    ruqyah: 'adhkar_ruqyah',
    sickness: 'adhkar_sickness',
    nature: 'adhkar_nature',
    favorites: 'adhkar_favorites'
  };
  const categoryTranslationKey = category ? categoryTranslationKeys[category] : undefined;
  const categoryTitle = categoryTranslationKey ? t(categoryTranslationKey as any) : currentCategory?.title || "الأذكار";

  const [isManageMode, setIsManageMode] = useState(false);
  const [manageSearchQuery, setManageSearchQuery] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFontDropdownOpen, setIsFontDropdownOpen] = useState(false);
  const [fontSearchQuery, setFontSearchQuery] = useState('');
  const [editingDhikr, setEditingDhikr] = useState<Dhikr | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [exitCardTiltX, setExitCardTiltX] = useState(8);
  const [exitCardTiltY, setExitCardTiltY] = useState(-4);
  const hasRewarded = React.useRef(false);
  const initializedCategory = React.useRef<string | null>(null);

  const handleBackAttempt = () => {
    // Check if category is not fully completed yet
    const isCategoryFullCompleted = catProgress.total > 0 && catProgress.completed === catProgress.total;

    // If they spent at least 2 seconds on the page or have counted, and category is not fully completed, show the exit modal
    if (!isCategoryFullCompleted && (secondsElapsed >= 2 || catProgress.completed > 0) && currentCategory && currentCategory.items && currentCategory.items.length > 0) {
      setShowExitModal(true);
    } else {
      // Just go back immediately
      goBack();
    }
  };

  // --- Live Reading Timer Session States & Logic ---
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [hasActiveCountingStarted, setHasActiveCountingStarted] = useState(false);

  // Restart timer when category shifts
  React.useEffect(() => {
    setSecondsElapsed(0);
    setHasActiveCountingStarted(false);
    setIsTimerRunning(true);
  }, [category]);

  // Keep incrementing seconds if timer is active and not finished
  React.useEffect(() => {
    if (!isTimerRunning || showReward) return;
    
    const intervalId = setInterval(() => {
      setSecondsElapsed(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [isTimerRunning, showReward]);

  // Handle active count action when user clicks Dhikr Counter button
  const handleUpdateCountWithTimer = React.useCallback((id: string, newCount: number) => {
    updateCount(id, newCount);
    if (!hasActiveCountingStarted) {
      setHasActiveCountingStarted(true);
    }

    // Auto-advance logic for Single Card view
    const activeItem = filteredItems[activeDhikrIdx];
    if (
      settings.adhkarViewMode === 'single' &&
      settings.adhkarAutoAdvance !== false &&
      activeItem &&
      id === activeItem.id &&
      newCount >= activeItem.count &&
      activeDhikrIdx < filteredItems.length - 1
    ) {
      setTimeout(() => {
        setSlideDirection('forward');
        setActiveDhikrIdx(prev => {
          if (prev < filteredItems.length - 1) {
            triggerHaptic('light');
            return prev + 1;
          }
          return prev;
        });
      }, 350);
    }
  }, [updateCount, hasActiveCountingStarted, filteredItems, activeDhikrIdx, settings.adhkarViewMode, settings.adhkarAutoAdvance]);

  const formatTime = React.useCallback((totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const formatTimePhrase = React.useCallback((totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    
    if (settings.appLanguage === 'fr') {
      const parts = [];
      if (mins > 0) parts.push(`${mins} minute${mins > 1 ? 's' : ''}`);
      if (secs > 0) parts.push(`${secs} seconde${secs > 1 ? 's' : ''}`);
      return parts.join(' et ');
    } else if (settings.appLanguage === 'en') {
      const parts = [];
      if (mins > 0) parts.push(`${mins} minute${mins > 1 ? 's' : ''}`);
      if (secs > 0) parts.push(`${secs} second${secs > 1 ? 's' : ''}`);
      return parts.join(' and ');
    } else {
      let mPhrase = '';
      if (mins === 1) mPhrase = 'دقيقة واحدة';
      else if (mins === 2) mPhrase = 'دقيقتين';
      else if (mins > 2 && mins <= 10) mPhrase = `${mins} دقائق`;
      else if (mins > 10) mPhrase = `${mins} دقيقة`;

      let sPhrase = '';
      if (secs === 1) sPhrase = 'ثانية واحدة';
      else if (secs === 2) sPhrase = 'ثانيتين';
      else if (secs > 2 && secs <= 10) sPhrase = `${secs} ثوانٍ`;
      else if (secs > 10) sPhrase = `${secs} ثانية`;

      if (mins > 0 && secs > 0) {
        return `${mPhrase} و ${sPhrase}`;
      } else if (mins > 0) {
        return mPhrase;
      } else {
        return sPhrase;
      }
    }
  }, [settings.appLanguage]);

  // Compute estimated reading time based on item target repetitions count
  const estimatedReadingTimeMinutes = React.useMemo(() => {
    if (!currentCategory || !currentCategory.items) return 0;
    let totalReps = 0;
    currentCategory.items.forEach(item => {
      totalReps += item.count;
    });
    // Let's assume on average, each count of dhikr takes about 3.5 seconds
    const estimatedSeconds = (totalReps * 3.5) + (currentCategory.items.length * 1.5);
    return Math.max(1, Math.round(estimatedSeconds / 60));
  }, [currentCategory]);

  const catProgress = React.useMemo(() => {
    if (!currentCategory || !currentCategory.items || currentCategory.items.length === 0) {
      return { total: 0, completed: 0, percent: 0 };
    }
    const total = currentCategory.items.length;
    let completed = 0;
    currentCategory.items.forEach(item => {
      if ((counts[item.id] || 0) >= item.count) {
        completed += 1;
      }
    });
    const percent = Math.round((completed / total) * 100);
    return { total, completed, percent };
  }, [currentCategory, counts]);

  const readingSpeedRate = React.useMemo(() => {
    if (settings.appLanguage === 'fr') {
      if (secondsElapsed < 10) return "Début du voyage de l'évocation 🌟";
      const estimatedSecs = estimatedReadingTimeMinutes * 60;
      const ratio = secondsElapsed / estimatedSecs;
      if (ratio < 0.3) return "Vitesse excellente et grande énergie ⚡";
      if (ratio >= 0.3 && ratio <= 1.2) return "Récitation sereine et méditation équilibrée 🌸";
      return "Humilité totale, sérénité et méditation profonde 💎";
    } else if (settings.appLanguage === 'en') {
      if (secondsElapsed < 10) return "Beginning of the dhikr journey 🌟";
      const estimatedSecs = estimatedReadingTimeMinutes * 60;
      const ratio = secondsElapsed / estimatedSecs;
      if (ratio < 0.3) return "Excellent speed and great energy ⚡";
      if (ratio >= 0.3 && ratio <= 1.2) return "Serene recitation and contemplation 🌸";
      return "Total humility, serenity and deep contemplation 💎";
    } else {
      if (secondsElapsed < 10) return "بداية رحلة الذكر 🌟";
      const estimatedSecs = estimatedReadingTimeMinutes * 60;
      const ratio = secondsElapsed / estimatedSecs;
      if (ratio < 0.3) return "سرعة ممتازة ونشاط فائق ⚡";
      if (ratio >= 0.3 && ratio <= 1.2) return "ترتيل هادئ وتدبر متزن 🌸";
      return "خشوع تام وسكينة وتأمل عميق 💎";
    }
  }, [secondsElapsed, estimatedReadingTimeMinutes, settings.appLanguage]);



  const stepsProgress = React.useMemo(() => {
    if (category !== 'prayer' || !currentCategory || !currentCategory.items) return {};
    
    const stats: Record<string, { total: number; completed: number; percent: number }> = {
      all: { total: 0, completed: 0, percent: 0 }
    };

    // Initialize stats
    PRAYER_STEPS_DEFINITION.forEach(step => {
      stats[step.id] = { total: 0, completed: 0, percent: 0 };
    });

    currentCategory.items.forEach(item => {
      const stepId = getItemPrayerStep(item.text, item.description || '');
      const isFin = (counts[item.id] || 0) >= item.count;
      
      // Update specific step
      if (stats[stepId]) {
        stats[stepId].total += 1;
        if (isFin) stats[stepId].completed += 1;
      }
      
      // Update 'all'
      stats.all.total += 1;
      if (isFin) stats.all.completed += 1;
    });

    // Calculate percent for each
    Object.keys(stats).forEach(key => {
      const s = stats[key];
      s.percent = s.total > 0 ? Math.round((s.completed / s.total) * 100) : 0;
    });

    return stats;
  }, [currentCategory, counts, getItemPrayerStep, PRAYER_STEPS_DEFINITION, category]);
  // ----------------------------------------------------

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formText, setFormText] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCount, setFormCount] = useState(1);

  React.useEffect(() => {
    if (!category || !currentCategory) return;
    
    // 1. Initialize reward state when entering a category
    if (initializedCategory.current !== category) {
      const isAlreadyFinished = currentCategory.items.length > 0 && 
        currentCategory.items.every(item => (counts[item.id] || 0) >= item.count);
      
      hasRewarded.current = isAlreadyFinished;
      initializedCategory.current = category;
      setShowReward(false);
      return;
    }

    // 2. Check for completion during active interaction
    const allFinished = currentCategory.items.length > 0 && 
      currentCategory.items.every(item => (counts[item.id] || 0) >= item.count);
    
    if (allFinished && !hasRewarded.current) {
      hasRewarded.current = true;
      setShowReward(true);
      if (category) {
        markCategoryCompleted(category);
        if (category === 'morning') {
          updateSpecificChallenge('daily_adhkar_morning', 1);
          updateSpecificChallenge('weekly_adhkar_streak', 1);
        } else if (category === 'evening') {
          updateSpecificChallenge('daily_adhkar_evening', 1);
          updateSpecificChallenge('weekly_adhkar_streak', 1);
        } else if (category === 'sleeping') {
          // Add reward for sleeping adhkar
          addPoints(10);
        } else {
          updateChallengeProgress(ChallengeCategory.ADHKAR);
        }
      }
      triggerHaptic('success');
    } else if (!allFinished) {
      hasRewarded.current = false;
    }
  }, [category, currentCategory, counts, markCategoryCompleted, updateSpecificChallenge, updateChallengeProgress, addPoints]);

  React.useEffect(() => {
    // Left intentionally empty as logic was moved to AdhkarHub handling
  }, [category, navigate]);

  if (!currentCategory) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }
  
  const handleSaveDhikr = () => {
    if (!formText.trim()) return;

    const dhikrData = {
      title: formTitle.trim(),
      text: formText.trim(),
      description: formDescription.trim(),
      count: formCount
    };

    if (editingDhikr) {
      updateDhikr(currentCategory.category, { ...editingDhikr, ...dhikrData });
      setEditingDhikr(null);
    } else if (isAdding) {
      addDhikr(currentCategory.category, dhikrData);
      setIsAdding(false);
    }
    setFormTitle('');
    setFormText('');
    setFormDescription('');
    setFormCount(1);
  };

  const startEdit = (dhikr: Dhikr) => {
    setEditingDhikr(dhikr);
    setFormTitle(dhikr.title || '');
    setFormText(dhikr.text);
    setFormDescription(dhikr.description || '');
    setFormCount(dhikr.count);
    setIsAdding(false);
  };

  const startAdd = () => {
    setIsAdding(true);
    setEditingDhikr(null);
    setFormTitle('');
    setFormText('');
    setFormDescription('');
    setFormCount(1);
  };



  // We will inline the modals below inside the render tree to avoid recreating component types on every render tick
  const renderResetConfirmModal = () => {
    if (typeof document === 'undefined') return null;
    return createPortal(
      <AnimatePresence>
        {showResetConfirm && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowResetConfirm(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 text-center z-10"
            >
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <ListRestart size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">{t('reset_confirm_title')}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">
                {t('reset_confirm_desc')}
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-2xl cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (currentCategory) resetCategory(currentCategory.category);
                    setShowResetConfirm(false);
                  }}
                  className="flex-1 py-3.5 bg-red-600 text-white font-bold rounded-2xl shadow-lg shadow-red-600/20 cursor-pointer"
                >
                  {t('yes_reset')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>,
      document.body
    );
  };

  const renderExitSessionModal = () => {
    if (typeof document === 'undefined') return null;

    const isMorning = category === 'morning';
    const isEvening = category === 'evening';

    // Theme values tailored for morning, evening, or others
    let themeTitle = t('exit_modal_default_title', 'إنهاء الورد المبارك؟');
    let themeSubtitle = t('exit_modal_default_subtitle', 'حالة جلسة الذكر الحالية ✨');
    let themeCardBg = "bg-gradient-to-b from-[#0e291e] via-[#081b13] to-[#040e0a] text-white";
    let themeBorder = "border-emerald-500/40 shadow-[0_25px_60px_rgba(5,150,105,0.35)]";
    let themeTitleColor = "text-emerald-300";
    let themeHighlightColor = "text-emerald-400";
    let themeBtnPrimary = "bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-500/30";
    let themeBtnSecondary = "bg-white/10 text-slate-200 hover:bg-white/20 border border-white/15";
    let themeIcon = "📿";

    if (isMorning) {
      themeTitle = t('exit_modal_morning_title', 'حفظ ورد الصباح؟');
      themeSubtitle = t('exit_modal_morning_subtitle', 'نور الضحى وضياء اليوم 🌤️');
      themeCardBg = "bg-gradient-to-b from-[#2e1805] via-[#1c0e03] to-[#0d0601] text-white";
      themeBorder = "border-amber-500/40 shadow-[0_25px_60px_rgba(245,158,11,0.3)]";
      themeTitleColor = "text-amber-300";
      themeHighlightColor = "text-amber-400";
      themeBtnPrimary = "bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-400 hover:to-orange-500 shadow-lg shadow-amber-500/30";
      themeBtnSecondary = "bg-white/10 text-amber-100 hover:bg-white/20 border border-white/15";
      themeIcon = "🌤️";
    } else if (isEvening) {
      themeTitle = t('exit_modal_evening_title', 'حفظ ورد المساء؟');
      themeSubtitle = t('exit_modal_evening_subtitle', 'سكينة الليل وحراسة الرحمن 🌙');
      themeCardBg = "bg-gradient-to-b from-[#0f1433] via-[#090d24] to-[#040612] text-white";
      themeBorder = "border-indigo-500/40 shadow-[0_25px_60px_rgba(99,102,241,0.3)]";
      themeTitleColor = "text-indigo-300";
      themeHighlightColor = "text-indigo-400";
      themeBtnPrimary = "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/30";
      themeBtnSecondary = "bg-white/10 text-indigo-100 hover:bg-white/20 border border-white/15";
      themeIcon = "🌙";
    }

    return createPortal(
      <AnimatePresence>
        {showExitModal && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 overflow-y-auto">
            {/* Dark translucent backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowExitModal(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-all"
            />

            {/* Modal Card with crisp high-contrast layout */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: "spring", damping: 26, stiffness: 320 }}
              className={cn(
                "relative w-full max-w-[360px] rounded-[28px] p-5 sm:p-6 text-center shadow-2xl border select-none z-10",
                themeCardBg,
                themeBorder
              )}
              dir={isRtl ? "rtl" : "ltr"}
            >
              {/* Floating Decorative Icon */}
              <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-3 shadow-inner text-2xl">
                <span>{themeIcon}</span>
              </div>

              {/* Header Title & Subtitle */}
              <h3 className={cn("text-lg sm:text-xl font-black tracking-tight leading-tight mb-1", themeTitleColor)}>
                {themeTitle}
              </h3>
              <p className="text-xs text-white/70 font-bold mb-4">
                {themeSubtitle}
              </p>

              {/* Time Spent in Session Card */}
              <div className="rounded-2xl p-4 mb-3.5 border border-white/15 bg-black/45 text-center shadow-inner relative overflow-hidden">
                <span className="text-xs text-white/80 font-black mb-1 flex items-center justify-center gap-1.5">
                  <Timer size={15} className="text-amber-400 animate-pulse" />
                  <span>{t('dhikr_timer_label', 'الميقات الذي قضيته في الذِّكْر')}</span>
                </span>
                
                <div className="text-3xl sm:text-4xl font-black font-mono tracking-widest text-white drop-shadow-sm my-1.5">
                  {formatTime(secondsElapsed)}
                </div>

                {secondsElapsed > 0 && (
                  <p className="text-xs text-white/90 font-bold mt-1.5 leading-relaxed">
                    {t('may_allah_accept', 'تقبل الله طاعتك!')} قضيت <span className={cn("font-black underline decoration-2 decoration-teal-400", themeHighlightColor)}>{formatTimePhrase(secondsElapsed)}</span> {t('in_this_blessed_ward', 'في هذا الورد المبارك. ✨')}
                  </p>
                )}
              </div>

              {/* Completed Wards & Completion Percentage */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-center">
                  <span className="text-[10px] text-white/60 block font-bold mb-0.5">{t('completed_wards', 'الأوراد المنجزة')}</span>
                  <span className="text-sm font-black text-white font-mono leading-none">
                    {catProgress.completed} / {catProgress.total}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-center">
                  <span className="text-[10px] text-white/60 block font-bold mb-0.5">{t('completion_percent', 'نسبة الإتمام')}</span>
                  <span className="text-sm font-black text-emerald-400 font-mono leading-none">
                    {catProgress.percent}%
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setShowExitModal(false);
                    goBack();
                  }}
                  className={cn(
                    "py-3 font-black rounded-xl text-center text-xs sm:text-sm transition-all duration-150 active:scale-95 outline-none cursor-pointer",
                    themeBtnSecondary
                  )}
                >
                  {t('confirm_exit', 'تأكيد الخروج')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowExitModal(false)}
                  className={cn(
                    "py-3 font-black rounded-xl text-center text-xs sm:text-sm transition-all duration-150 active:scale-95 outline-none cursor-pointer",
                    themeBtnPrimary
                  )}
                >
                  {t('continue_dhikr', 'حسناً، استمر في الذكر')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>,
      document.body
    );
  };


  if (isManageMode) {
    const filteredItems = currentCategory.items.filter(item => {
      if (!manageSearchQuery) return true;
      const q = manageSearchQuery.toLowerCase();
      return (item.title || '').toLowerCase().includes(q) || 
             (item.text || '').toLowerCase().includes(q) || 
             (item.description || '').toLowerCase().includes(q);
    });

    return (
      <div className="h-full flex flex-col space-y-5 pb-8 animate-[fadeIn_0.2s_ease-out]" dir={isRtl ? "rtl" : "ltr"}>
        {/* Modern Header Premium Dashboard Panel */}
        <div className="relative overflow-hidden rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-teal-600 to-emerald-700 text-white shadow-xl shadow-teal-900/10 dark:shadow-none">
          {/* Subtle geometric overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.08)_0%,transparent_60%)] pointer-events-none" />
          
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className={cn("space-y-1.5", isRtl ? "text-right" : "text-left")}>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    setIsManageMode(false);
                    setManageSearchQuery('');
                  }} 
                  className="py-2 px-4 bg-white text-teal-800 hover:bg-teal-50 dark:bg-slate-900 dark:text-teal-400 dark:hover:bg-slate-800 active:scale-95 transition-all rounded-2xl flex items-center gap-2 text-xs font-black shadow-md shadow-black/5 shrink-0"
                >
                  <ChevronRight size={16} strokeWidth={3.5} className={cn("inline", !isRtl && "rotate-180")} />
                  <span>{t('go_back_to_adhkar')}</span>
                </button>
                <span className="text-[10px] bg-emerald-500/30 text-emerald-100 px-2 py-0.5 rounded-full font-black font-sans">
                  {t('control_panel')}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight mt-1">{t('customize_adhkar')}</h1>
              <p className="text-teal-100/90 text-[11px] sm:text-xs font-medium max-w-xl leading-relaxed">
                {t('dhikr_customize_desc')}
              </p>
            </div>

            {/* Quick Stat Counter */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 px-4 flex items-center gap-3 self-start sm:self-center border border-white/10">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                <BookOpen size={20} className="text-teal-100" />
              </div>
              <div>
                <span className="text-[10px] text-teal-200 block font-bold leading-tight">{t('total_adhkar')}</span>
                <span className="text-lg font-black font-mono leading-none">{currentCategory.items.length} {settings.appLanguage === 'ar' ? 'ذِكر' : 'dhikr'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Smart Search & Tool Actions Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1">
            <Search className={cn("absolute top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500", isRtl ? "right-3.5" : "left-3.5")} size={16} />
            <input
              type="text"
              value={manageSearchQuery}
              onChange={(e) => setManageSearchQuery(e.target.value)}
              placeholder={t('search_dhikr_placeholder')}
              className={cn(
                "w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none shadow-sm dark:text-slate-200 transition-all placeholder:text-slate-400",
                isRtl ? "pr-10 pl-4" : "pl-10 pr-4"
              )}
            />
            {manageSearchQuery && (
              <button 
                onClick={() => setManageSearchQuery('')}
                className={cn("absolute top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500", isRtl ? "left-3" : "right-3")}
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div className="flex items-stretch gap-2 shrink-0">
            <button 
              onClick={() => setShowResetConfirm(true)}
              className="px-3.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 hover:dark:bg-rose-900/30 text-rose-600 dark:text-rose-450 rounded-2xl transition-all border border-rose-100/50 dark:border-rose-950/50 flex items-center justify-center gap-1.5 text-xs font-black active:scale-[0.98]"
              title={t('reset_confirm_desc')}
            >
              <ListRestart size={15} strokeWidth={2.5} />
              <span>{t('factory_reset_section')}</span>
            </button>

            <button 
              onClick={startAdd}
              type="button"
              className="p-3 sm:px-5 text-white rounded-2xl flex items-center justify-center gap-1.5 font-bold text-xs sm:text-sm shadow-md transition-all active:scale-[0.98]"
              style={{ backgroundColor: settings.primaryColor, boxShadow: `0 4px 14px 0 ${settings.primaryColor}30` }}
            >
              <Plus size={16} strokeWidth={3} />
              <span>{t('add_new_dhikr')}</span>
            </button>
          </div>
        </div>

        {renderResetConfirmModal()}

        {/* Smart Builder Form Panel (Add/Edit) */}
        <AnimatePresence>
          {(isAdding || editingDhikr) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -10 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-lg space-y-4 relative overflow-hidden"
            >
              {/* Subtle top decoration */}
              <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-teal-500 to-emerald-500" />
              
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 flex items-center justify-center">
                    <Sparkles size={16} />
                  </div>
                  <h3 className="font-black text-slate-850 dark:text-slate-100 text-sm sm:text-base">
                    {isAdding ? t('build_new_dhikr') : t('edit_current_dhikr')}
                  </h3>
                </div>
                <button 
                  onClick={() => { setIsAdding(false); setEditingDhikr(null); }} 
                  className="w-8 h-8 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 dark:bg-slate-800 dark:hover:bg-rose-950/40 text-slate-500 rounded-full flex items-center justify-center transition-all active:scale-90"
                >
                  <X size={16} />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-xs sm:text-sm font-black text-slate-600 dark:text-slate-300 mb-1.5 block">{t('dhikr_title_label')}</label>
                    <input
                      type="text"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder={t('dhikr_title_placeholder')}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm sm:text-base font-bold focus:ring-2 focus:ring-teal-500 focus:bg-white dark:focus:bg-slate-900 outline-none dark:text-slate-100 transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-xs sm:text-sm font-black text-slate-600 dark:text-slate-300 mb-1.5 block">{t('dhikr_desc_label')}</label>
                    <input
                      type="text"
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder={t('dhikr_desc_placeholder')}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm sm:text-base font-bold focus:ring-2 focus:ring-teal-500 focus:bg-white dark:focus:bg-slate-900 outline-none dark:text-slate-100 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs sm:text-sm font-black text-slate-600 dark:text-slate-300 mb-1.5 block">{t('dhikr_text_label')}</label>
                    <textarea
                      value={formText}
                      onChange={(e) => setFormText(e.target.value)}
                      placeholder={t('dhikr_text_placeholder')}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-base sm:text-lg font-black font-adhkar text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all leading-loose"
                      rows={5}
                    />
                  </div>
                </div>
              </div>

              {/* Advanced Count Helper / Smart Repetitions Tool */}
              <div className="bg-slate-50 dark:bg-slate-950/30 rounded-2xl p-4 border border-slate-100 dark:border-slate-850 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-black text-slate-600 dark:text-slate-350 block">{t('dhikr_count_label')}</span>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">
                    {settings.appLanguage === 'ar' ? "اختر أحد التكرارات السريعة الموصى بها في السنة أو اكتب التكرار يدوياً" : settings.appLanguage === 'fr' ? "Choisissez une répétition rapide recommandée dans la Sunnah ou saisissez-la manuellement" : "Choose a quick repetition recommended in Sunnah or enter it manually"}
                  </p>
                  
                  {/* Quick Select Chips */}
                  <div className="flex flex-wrap gap-1.5 pt-1.5">
                    {[1, 3, 7, 10, 33, 100].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setFormCount(num)}
                        className={cn(
                          "px-3 py-1 text-xs font-black rounded-lg transition-all active:scale-95 border",
                          formCount === num
                            ? "bg-teal-600 border-teal-600 text-white shadow-sm"
                            : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-teal-500"
                        )}
                      >
                        {num} {settings.appLanguage === 'ar' ? (num >= 3 && num <= 10 ? 'مرات' : 'مرة') : (settings.appLanguage === 'fr' ? 'fois' : 'times')}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="w-24">
                    <input
                      type="number"
                      value={formCount}
                      onChange={(e) => setFormCount(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center font-black font-mono rounded-xl p-3 text-sm focus:ring-2 focus:ring-teal-500 outline-none dark:text-slate-200"
                      min="1"
                    />
                  </div>
                  <button
                    onClick={handleSaveDhikr}
                    type="button"
                    className="flex-1 md:flex-initial text-white px-6 py-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md hover:brightness-105 active:scale-95 transition-all"
                    style={{ backgroundColor: settings.primaryColor, boxShadow: `0 4px 14px 0 ${settings.primaryColor}30` }}
                  >
                    <Save size={16} />
                    <span>{t('save')}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Beautiful & Highly Interactive Reorderable List */}
        <div className="flex-1 overflow-y-auto space-y-3.5 max-h-[60vh] pr-1">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl space-y-3">
              <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800/60 text-slate-400 dark:text-slate-500 rounded-2xl flex items-center justify-center mx-auto">
                <Search size={22} />
              </div>
              <div>
                <p className="text-slate-700 dark:text-slate-350 font-black text-sm">{t('no_results_found')}</p>
                <p className="text-xs text-slate-400 mt-1">{t('try_different_search')}</p>
              </div>
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const actualIdx = currentCategory.items.findIndex(original => original.id === item.id);
              return (
                <motion.div
                   key={item.id}
                   layout
                   className="group bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-150/80 dark:border-slate-850 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col gap-3 relative overflow-hidden"
                >
                  {/* Subtle decorative left/right light colored stripe on focus */}
                  <div className={cn("absolute top-0 bottom-0 w-[4px] bg-teal-500 opacity-0 group-hover:opacity-100 transition-opacity", isRtl ? "right-0" : "left-0")} />

                  {/* Top Bar: Controls & Meta Information */}
                  <div className="flex items-center justify-between gap-2.5 border-b border-slate-100 dark:border-slate-800/80 pb-3 flex-wrap">
                    {/* Info & Badges */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-black text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-md">
                        #{actualIdx + 1}
                      </span>
                      <span className="text-xs sm:text-sm font-black text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/50 px-3 py-1 rounded-lg border border-teal-100 dark:border-teal-900/30">
                        {item.title || t('general_dhikr')}
                      </span>
                      {/* Repetition Count Badge */}
                      <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-950 px-2.5 py-1 rounded-xl text-xs font-black text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800">
                        <span>{item.count}</span>
                        <span className="text-slate-400 text-[10px] font-bold font-sans">{t('repetition_count_label')}</span>
                      </div>
                    </div>

                    {/* Action Buttons & Reorder Controller */}
                    <div className="flex items-center gap-2">
                      {/* Dual Position Controller - Reordering Buttons Pill */}
                      <div className="flex items-center bg-slate-50 dark:bg-slate-950 p-0.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
                        <button 
                          onClick={() => reorderDhikr(currentCategory.category, actualIdx, actualIdx - 1)}
                          disabled={actualIdx === 0}
                          className="p-1.5 text-slate-500 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-white dark:hover:bg-slate-850 rounded-lg transition-all disabled:opacity-20 disabled:hover:bg-transparent"
                          title={isRtl ? "تقديم الترتيب للأعلى" : "Move up"}
                        >
                          <ArrowUp size={16} strokeWidth={2.5} />
                        </button>
                        <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-800 mx-0.5" />
                        <button 
                          onClick={() => reorderDhikr(currentCategory.category, actualIdx, actualIdx + 1)}
                          disabled={actualIdx === currentCategory.items.length - 1}
                          className="p-1.5 text-slate-500 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-white dark:hover:bg-slate-850 rounded-lg transition-all disabled:opacity-20 disabled:hover:bg-transparent"
                          title={isRtl ? "تأخير الترتيب للأسفل" : "Move down"}
                        >
                          <ArrowDown size={16} strokeWidth={2.5} />
                        </button>
                      </div>

                      {/* Edit Button */}
                      <button 
                        onClick={() => startEdit(item)} 
                        className="w-9 h-9 flex items-center justify-center text-teal-600 dark:text-teal-400 bg-teal-50/80 hover:bg-teal-100 dark:bg-teal-950/40 dark:hover:bg-teal-950/70 rounded-xl transition-all active:scale-90 border border-teal-100 dark:border-teal-900/40 shadow-sm"
                        title={t('edit_this_dhikr')}
                      >
                        <Pen size={16} strokeWidth={2.5} />
                      </button>

                      {/* Delete Button */}
                      <button 
                        onClick={() => deleteDhikr(currentCategory.category, item.id)} 
                        className="w-9 h-9 flex items-center justify-center text-rose-600 dark:text-rose-450 bg-rose-50/80 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-950/70 rounded-xl transition-all active:scale-90 border border-rose-100 dark:border-rose-950/30 shadow-sm"
                        title={t('delete_this_dhikr')}
                      >
                        <Trash2 size={16} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                  
                  {/* Full Width Text Content Block */}
                  <div className={cn("w-full space-y-2 pt-0.5", isRtl ? "text-right" : "text-left")}>
                    <p className="text-base sm:text-lg md:text-xl font-black font-adhkar text-slate-900 dark:text-slate-50 leading-[2.2] break-words tracking-wide">
                      {item.text}
                    </p>

                    {item.description && (
                      <div className="flex items-start gap-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 pt-2 font-bold leading-relaxed border-t border-slate-100/80 dark:border-slate-800/50 mt-2">
                        <Info size={14} className="shrink-0 text-teal-600 dark:text-teal-400 mt-0.5" />
                        <span>{item.description}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  if (currentCategory.items.length === 0 && !isManageMode) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-6 relative bg-slate-50 dark:bg-slate-900" dir={isRtl ? "rtl" : "ltr"}>
        <div className={cn("absolute top-4 z-50", isRtl ? "right-4" : "left-4")}>
          <BackButton forceFallback={true} />
        </div>
        <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/30 text-teal-600 rounded-2xl flex items-center justify-center">
          <BookOpen size={32} />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-black text-slate-800 dark:text-white mb-2">{categoryTitle}</h2>
          <p className="text-slate-500 font-bold text-sm px-4">{t('empty_custom_section')}</p>
        </div>
        <button 
          onClick={() => setIsManageMode(true)}
          className="bg-teal-600 hover:bg-teal-700 active:scale-95 transition-all text-white px-8 py-3 rounded-2xl font-black shadow-lg shadow-teal-500/20 flex items-center gap-2"
        >
          <Plus size={20} />
          {t('add_supplication_or_dhikr')}
        </button>
      </div>
    );
  }

  const activeCategory = category || 'default';
  
  const categoryThemeKey = (
    settings.adhkarCategoryThemes?.[activeCategory] && ADHKAR_THEMES[settings.adhkarCategoryThemes[activeCategory]]
      ? settings.adhkarCategoryThemes[activeCategory]
      : (activeCategory === 'morning' ? (settings.adhkarCategoryThemes?.morning || (settings.adhkarTheme && ADHKAR_THEMES[settings.adhkarTheme] ? settings.adhkarTheme : 'classicGold')) : 
         activeCategory === 'evening' ? (settings.adhkarCategoryThemes?.evening || (settings.adhkarTheme && ADHKAR_THEMES[settings.adhkarTheme] ? settings.adhkarTheme : 'emerald')) : 
         activeCategory === 'sleeping' ? (settings.adhkarCategoryThemes?.sleeping || (settings.adhkarTheme && ADHKAR_THEMES[settings.adhkarTheme] ? settings.adhkarTheme : 'dreamyLavender')) : 
         (settings.adhkarTheme && ADHKAR_THEMES[settings.adhkarTheme] ? settings.adhkarTheme : 'offWhite'))
  );

  const currentTheme = ADHKAR_THEMES[categoryThemeKey] || ADHKAR_THEMES.classicGold || ADHKAR_THEMES.offWhite;

  return (
    <div 
      className={cn("min-h-full flex flex-col space-y-3 relative max-w-[1600px] mx-auto w-full px-2 md:px-4 pb-4 transition-colors duration-500", currentTheme.pageBg)}
      style={{ backgroundColor: currentTheme.rawBg }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Full Page Background - Fixed for total coverage */}
      <div 
        className={cn("fixed inset-0 -z-20 transition-colors duration-500", currentTheme.pageBg)} 
        style={{ backgroundColor: currentTheme.rawBg }}
      />
      
      {/* Decorative Background Element */}
      <div className={cn(
        "fixed top-0 left-0 right-0 h-screen bg-gradient-to-b -z-10 pointer-events-none transition-colors duration-500 opacity-40",
        currentTheme.pageDeco
      )} />

      {/* Repeating Aesthetic Pattern Overlays */}
      <div 
        className="fixed inset-0 -z-18 opacity-[0.2] pointer-events-none transition-all duration-500" 
        style={getPatternStyle(settings, currentTheme)}
      />

      {/* Floating Relaxing Particle System */}
      {settings.adhkarParticlesEnabled !== false && (
        <AestheticParticles themeKey={categoryThemeKey} />
      )}

      {/* Header */}
      <div 
        className={cn(
          "flex items-center justify-between p-2 md:p-3 rounded-2xl gap-3 transition-all duration-300 w-full mx-auto sticky top-0 z-30",
          settings.visualTheme === 'glass' ? "bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-white/20 shadow-lg" :
          settings.visualTheme === 'minimal' ? "bg-transparent border-none shadow-none" :
          settings.visualTheme === 'clear' ? "bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-none" :
          currentTheme.isLight 
            ? "border-b border-black/5 dark:border-white/10 shadow-sm backdrop-blur-md -mx-2 px-4 rounded-b-2xl"
            : "border-b shadow-sm backdrop-blur-md -mx-2 px-4 rounded-b-2xl border-white/10"
        )}
        style={{ backgroundColor: currentTheme.isLight ? `${currentTheme.rawBg}f2` : `${currentTheme.rawBg}f6` }}
      >
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <BackButton onClick={handleBackAttempt} />
          <div className="flex flex-col text-right">
            <h2 
              className="text-sm sm:text-base md:text-lg font-black leading-tight transition-all duration-500 flex items-center gap-2"
              style={{ color: settings.primaryColor.includes('gradient') ? settings.primaryColor.match(/#[a-fA-F0-9]{6}/)?.[0] || '#0d9488' : settings.primaryColor }}
            >
              {categoryTitle}
              <div className="flex items-center gap-1 text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-md" title="مدمج ومتاح للاستخدام بدون إنترنت">
                <HardDrive size={10} strokeWidth={3} />
                <span className="text-[8px] font-black hidden sm:inline">أوفلاين</span>
              </div>
            </h2>
          </div>
        </div>

        <div className="fit-narrow flex items-center shrink-0 bg-white dark:bg-slate-800 p-1 md:p-1.5 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm gap-1 transition-all hover:shadow-md">
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="h-9 md:h-10 px-3 md:px-4 flex items-center justify-center gap-1.5 md:gap-2 rounded-full bg-[#006A4E] hover:bg-[#00523C] dark:bg-[#006A4E] dark:hover:bg-[#00523C] text-white shadow-[0_4px_15px_rgba(0,106,78,0.3)] hover:shadow-[0_6px_20px_rgba(0,106,78,0.4)] transition-all hover:-translate-y-0.5 active:translate-y-0 duration-200 active:scale-[0.95] group outline-none overflow-hidden relative"
              title="إعدادات الأذكار"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 dark:via-white/5 to-transparent -translate-x-[150%] group-hover:animate-[shimmer_2s_infinite]" />
              <Settings2 size={16} className="md:w-[18px] md:h-[18px] transition-transform duration-700 group-hover:rotate-180 text-white" />
              <span className="text-[11px] md:text-[12px] font-black tracking-wide hidden sm:inline-block">إعدادات</span>
            </button>

            <div className="w-[1px] h-5 md:h-6 bg-slate-200 dark:bg-slate-600 mx-0.5 md:mx-1 rounded-full" />

            <div className="flex items-center gap-1 px-1">
              <button 
                onClick={() => setShowResetConfirm(true)}
                className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-[#006A4E] hover:bg-[#00523C] dark:bg-[#006A4E] dark:hover:bg-[#00523C] text-white shadow-[0_4px_15px_rgba(0,106,78,0.3)] hover:shadow-[0_6px_20px_rgba(0,106,78,0.4)] transition-all hover:-translate-y-0.5 active:translate-y-0 duration-200 active:scale-[0.95] group outline-none"
                title="الرجوع إلى الأذكار الافتراضية"
              >
                <ListRestart size={17} strokeWidth={2.5} className="transition-transform duration-500 group-hover:-rotate-180" />
              </button>
              <button 
                onClick={() => {
                  if (category) {
                    resetCounts(category);
                    setSecondsElapsed(0);
                    setHasActiveCountingStarted(false);
                    setIsTimerRunning(false);
                  }
                }}
                className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-[#006A4E] hover:bg-[#00523C] dark:bg-[#006A4E] dark:hover:bg-[#00523C] text-white shadow-[0_4px_15px_rgba(0,106,78,0.3)] hover:shadow-[0_6px_20px_rgba(0,106,78,0.4)] transition-all hover:-translate-y-0.5 active:translate-y-0 duration-200 active:scale-[0.95] group outline-none"
                title="تصفير العدادات"
              >
                <RotateCcw size={16} className="transition-transform duration-500 group-hover:-rotate-180" />
              </button>
            </div>

            <div className="w-[1px] h-5 md:h-6 bg-slate-200 dark:bg-slate-600 mx-0.5 md:mx-1 rounded-full hidden sm:block" />

            <button 
              onClick={() => setIsManageMode(true)}
              className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-[#006A4E] hover:bg-[#00523C] dark:bg-[#006A4E] dark:hover:bg-[#00523C] text-white shadow-[0_4px_15px_rgba(0,106,78,0.3)] hover:shadow-[0_6px_20px_rgba(0,106,78,0.4)] transition-all hover:-translate-y-0.5 active:translate-y-0 duration-200 active:scale-[0.95] outline-none"
              title="تعديل الأذكار"
            >
              <Pen size={17} strokeWidth={3} className="text-white relative right-0.5" />
            </button>
          </div>
      </div>

      {renderResetConfirmModal()}
      {renderExitSessionModal()}



      {/* Settings Side Drawer - Ultra modern and premium panel sliding beautifully from the left side of the screen */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-[120] overflow-hidden pointer-events-auto">
            {/* Soft backdrop blur with click-out capability */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsSettingsOpen(false);
                setIsFontDropdownOpen(false);
              }}
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-[6px]"
            />

            {/* Premium Side Drawer Sheet (Slides smoothly from the left) */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="fixed left-0 top-0 bottom-0 h-full w-full sm:max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border-r border-slate-100 dark:border-slate-800 shadow-[25px_0_60px_-15px_rgba(0,0,0,0.25)] flex flex-col z-10 text-right"
              dir="rtl"
            >
              {/* Sticky Elegant Drawer Header */}
              <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                <h3 className="font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Settings2 size={18} className="text-teal-600 animate-spin-slow" />
                  تخصيص مظهر الأذكار
                </h3>
                <button 
                  onClick={() => {
                    setIsSettingsOpen(false);
                    setIsFontDropdownOpen(false);
                  }} 
                  className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-250 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-300 transform transition-all duration-75 active:scale-[0.85] active:opacity-70"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable Content Box */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 custom-scrollbar pb-10">
                
                {/* 1. Font Size Section with interactive controller */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase flex items-center gap-1.5">
                    <Type size={14} className="text-teal-500" />
                    حجم الخط للأذكار
                  </h4>
                  <div className="flex bg-slate-50 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 gap-1">
                    {(['15px', '18px', '20px', '25px', '30px'] as const).map((size) => (
                      <button
                        key={size}
                        onClick={() => updateSettings({ adhkarFontSize: size })}
                        className={cn(
                          "flex-1 py-2.5 rounded-xl text-xs font-black transition-all",
                          settings.adhkarFontSize === size 
                            ? "text-white shadow-sm" 
                            : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-900/50"
                        )}
                        style={{ backgroundColor: settings.adhkarFontSize === size ? settings.primaryColor : undefined }}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Custom Searchable Font Family Dropdown Selector */}
                <div className="space-y-3 relative z-40">
                  <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase flex items-center gap-1.5">
                    <Type size={14} className="text-teal-500" />
                    نوع خط الآيات والأذكار
                  </h4>
                  
                  <div className="relative">
                    {/* Collapsed select-like Button */}
                    <button
                      type="button"
                      onClick={() => setIsFontDropdownOpen(!isFontDropdownOpen)}
                      className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 hover:border-teal-500/50 dark:hover:border-teal-400/50 focus:outline-none transition-all group"
                    >
                      <div className="flex flex-col items-start gap-1 text-right">
                        <span className="text-[10px] text-slate-400 font-bold">الخط المفعّل حالياً</span>
                        <span className="text-sm font-black text-slate-800 dark:text-slate-100" style={{ fontFamily: settings.adhkarFontFamily }}>
                          {FONTS_LIST.find(f => f.id === settings.adhkarFontFamily)?.name || settings.adhkarFontFamily}
                        </span>
                      </div>
                      <ChevronDown size={18} className={cn("text-slate-400 group-hover:text-teal-500 font-black transition-transform duration-300", isFontDropdownOpen ? "rotate-180" : "")} />
                    </button>

                    {/* Exploding Dropdown Frame */}
                    <AnimatePresence>
                      {isFontDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -8, scale: 0.98 }}
                          animate={{ opacity: 1, y: 4, scale: 1 }}
                          exit={{ opacity: 0, y: -8, scale: 0.98 }}
                          className="absolute left-0 right-0 z-50 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-[0_20px_50px_rgba(0,0,0,0.15)] p-3.5 flex flex-col gap-3 max-h-[290px]"
                        >
                          {/* Search Input Bar */}
                          <div className="relative">
                            <Search size={14} className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" />
                            <input
                              type="text"
                              placeholder="ابحث عن خط محدد (مثال: كوفي)..."
                              value={fontSearchQuery}
                              onChange={(e) => setFontSearchQuery(e.target.value)}
                              className="w-full pr-10 pl-8 py-2.5 text-xs text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-500/50 focus:border-teal-500 text-right"
                            />
                            {fontSearchQuery && (
                              <button
                                onClick={() => setFontSearchQuery('')}
                                className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold"
                              >
                                مسح
                              </button>
                            )}
                          </div>

                          {/* Filtered scrollable list of font options (Touch friendly) */}
                          <div className="overflow-y-auto max-h-[200px] custom-scrollbar space-y-1 pr-1">
                            {FONTS_LIST.filter(f => f.name.includes(fontSearchQuery) || f.id.toLowerCase().includes(fontSearchQuery.toLowerCase()))
                              .map((font) => (
                                <button
                                  key={font.id}
                                  onClick={() => {
                                    updateSettings({ adhkarFontFamily: font.id });
                                    setIsFontDropdownOpen(false);
                                  }}
                                  className={cn(
                                    "w-full flex items-center justify-between p-3 rounded-xl transition-all text-right group",
                                    settings.adhkarFontFamily === font.id
                                      ? "bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 font-bold"
                                      : "hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 hover:translate-x-[-2px] duration-150"
                                  )}
                                >
                                  <div className="flex flex-col gap-0.5">
                                    <span className="text-[10px] opacity-70 font-semibold">{font.name}</span>
                                    <span className="text-base font-medium truncate max-w-[200px]" style={{ fontFamily: font.id }}>بِسْمِ اللَّهِ</span>
                                  </div>
                                  {settings.adhkarFontFamily === font.id && (
                                    <Check size={16} className="text-teal-500 shrink-0 ml-1" />
                                  )}
                                </button>
                              ))}

                            {FONTS_LIST.filter(f => f.name.includes(fontSearchQuery) || f.id.toLowerCase().includes(fontSearchQuery.toLowerCase())).length === 0 && (
                              <div className="text-center py-8 text-xs text-slate-400 dark:text-slate-550 font-bold">عذراً، لم نجد خطاً بهذا الاسم</div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* 3. Modern Interactive Live Preview Panel */}
                <div className="p-4 bg-slate-50/50 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-800/80 text-center relative overflow-hidden group">
                  <div className="absolute top-2.5 right-2.5 opacity-20 group-hover:opacity-40 transition-opacity">
                    <Sparkles size={14} className="text-teal-500" />
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-550 font-bold block mb-2">معاينة حيّة لحجم المظهر ونوع الخط الحالي:</span>
                  <p
                    className="leading-relaxed transition-all duration-300 text-slate-800 dark:text-slate-200"
                    style={{
                      fontFamily: settings.adhkarFontFamily,
                      fontSize: settings.adhkarFontSize,
                    }}
                  >
                    اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا
                  </p>
                </div>

                {/* 4. Beautiful Categorized Theme Selection Bento */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-black">
                      <Palette size={14} className="text-teal-500" />
                      ألوان ومظهر الخلفية ({Object.keys(ADHKAR_THEMES).length})
                    </span>
                    <span className="text-[11px] font-bold text-teal-600 dark:text-teal-400">
                      {currentTheme.name}
                    </span>
                  </h4>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar p-1">
                    {Object.entries(ADHKAR_THEMES).map(([themeKey, themeData]) => {
                      const isSelected = categoryThemeKey === themeKey;
                      return (
                        <button
                          key={themeKey}
                          onClick={() => {
                            const currentCatThemes = settings.adhkarCategoryThemes || {};
                            updateSettings({
                              adhkarTheme: themeKey,
                              adhkarCategoryThemes: {
                                ...currentCatThemes,
                                [activeCategory]: themeKey
                              }
                            });
                          }}
                          className={cn(
                            "relative flex flex-col items-center justify-between p-2 rounded-xl border-2 transition-all duration-150 active:scale-95 text-center min-h-[85px] cursor-pointer",
                            isSelected
                              ? "border-teal-500 bg-teal-50/50 dark:bg-teal-950/30 shadow-md scale-[1.02]"
                              : "border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 hover:border-slate-300 dark:hover:border-slate-700"
                          )}
                        >
                          {/* Color Swatch / Preview Thumbnail */}
                          <div 
                            className={cn(
                              "w-10 h-7 rounded-lg shadow-inner flex items-center justify-center transition-transform relative overflow-hidden border",
                              isSelected ? "ring-2 ring-teal-500 ring-offset-1 dark:ring-offset-slate-900" : ""
                            )}
                            style={{ 
                              background: themeData.rawCardGradient || themeData.rawCard || themeData.rawBg || '#ffffff',
                              borderColor: themeData.isLight ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.2)'
                            }}
                          >
                            {isSelected && (
                              <div className="w-3.5 h-3.5 rounded-full bg-teal-600 text-white flex items-center justify-center shadow-sm">
                                <Check size={10} strokeWidth={4} />
                              </div>
                            )}
                          </div>
                          
                          <span className={cn(
                            "text-[10px] font-black leading-tight truncate max-w-full block mt-1.5",
                            isSelected ? "text-teal-700 dark:text-teal-300" : "text-slate-700 dark:text-slate-300"
                          )}>
                            {themeData.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 5. Adhkar View Mode Selector */}
                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                  <h4 className="text-xs font-black text-slate-400 dark:text-slate-550 uppercase flex items-center gap-1.5">
                    <SlidersHorizontal size={14} className="text-teal-500" />
                    طريقة عرض الأذكار والتركيز
                  </h4>
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-800/80">
                    <button
                      onClick={() => updateSettings({ adhkarViewMode: 'list' })}
                      className={cn(
                        "py-3 rounded-xl text-xs font-black transition-all flex flex-col items-center justify-center gap-1 cursor-pointer",
                        settings.adhkarViewMode !== 'single'
                          ? "bg-teal-600 text-white shadow-md shadow-teal-600/15"
                          : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-900/50"
                      )}
                    >
                      <span className="font-black text-xs">قائمة متتالية (الافتراضي)</span>
                      <span className="text-[9px] opacity-75 font-normal">عرض الأذكار متتالية تحت بعضها</span>
                    </button>
                    <button
                      onClick={() => updateSettings({ adhkarViewMode: 'single' })}
                      className={cn(
                        "py-3 rounded-xl text-xs font-black transition-all flex flex-col items-center justify-center gap-1 cursor-pointer",
                        settings.adhkarViewMode === 'single'
                          ? "bg-teal-600 text-white shadow-md shadow-teal-600/15"
                          : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-900/50"
                      )}
                    >
                      <span className="font-black text-xs">بطاقة منفردة</span>
                      <span className="text-[9px] opacity-75 font-normal">وضع التركيز (بطاقة تلو الأخرى)</span>
                    </button>
                  </div>
                </div>

                {/* 6. Aesthetic Wallpaper Pattern Selector */}
                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                  <h4 className="text-xs font-black text-slate-400 dark:text-slate-550 uppercase flex items-center gap-1.5">
                    <Scroll size={14} className="text-teal-500" />
                    النقوش الخلفية الجمالية
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'none', label: 'بدون نقوش' },
                      { id: 'islamic', label: 'زخرفة إسلامية' },
                      { id: 'grid', label: 'شبكة هندسية' },
                      { id: 'dots', label: 'نقاط ناعمة' }
                    ].map((pattern) => (
                      <button
                        key={pattern.id}
                        onClick={() => updateSettings({ adhkarWallpaperPattern: pattern.id as any })}
                        className={cn(
                          "py-2.5 px-1 rounded-xl text-[10px] font-black transition-all border cursor-pointer text-center flex flex-col items-center justify-center",
                          (settings.adhkarWallpaperPattern || 'none') === pattern.id
                            ? "bg-teal-500/10 border-teal-500 text-teal-600 dark:text-teal-400 font-bold"
                            : "bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 border-slate-200/50 dark:border-slate-800/80 text-slate-500 dark:text-slate-400"
                        )}
                      >
                        {pattern.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 7. Calming Floating Particles Selector */}
                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800/60 pb-2">
                  <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/80">
                    <div className="flex flex-col gap-1 text-right">
                      <span className="text-xs font-black text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                        <Sparkles size={14} className="text-amber-400 animate-pulse" />
                        المؤثرات الحركية المهدئة
                      </span>
                      <span className="text-[9px] text-slate-400 dark:text-slate-550 font-normal">تفعيل جزيئات ونجوم عائمة في الخلفية لتعزيز الهدوء والتركيز</span>
                    </div>
                    <div className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.adhkarParticlesEnabled !== false}
                        onChange={(e) => updateSettings({ adhkarParticlesEnabled: e.target.checked })}
                        className="sr-only peer"
                        id="particles-toggle-chk"
                      />
                      <label htmlFor="particles-toggle-chk" className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-650 peer-checked:bg-teal-600 cursor-pointer"></label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sticky Footer Actions */}
              <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex flex-col sm:flex-row gap-2.5">
                <button
                  onClick={() => {
                    const currentCatThemes = settings.adhkarCategoryThemes || {};
                    const updatedThemes = { ...currentCatThemes };
                    delete updatedThemes[activeCategory];
                    updateSettings({
                      adhkarFontFamily: 'Noto Sans Arabic',
                      adhkarFontSize: '18px',
                      adhkarCategoryThemes: updatedThemes
                    });
                  }}
                  className="flex-1 py-3 px-4 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/25 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-black rounded-xl border border-rose-100 dark:border-rose-950/30 flex items-center justify-center gap-1.5 transition-all"
                >
                  <RotateCcw size={14} />
                  إعادة ضبط المظهر
                </button>
                <button
                  onClick={() => {
                    setIsSettingsOpen(false);
                    setIsFontDropdownOpen(false);
                  }}
                  className="flex-1 py-3 px-6 text-white text-xs font-black rounded-xl shadow-md transition-all hover:opacity-90 flex items-center justify-center"
                  style={{ backgroundColor: settings.primaryColor, boxShadow: `0 4px 14px 0 ${settings.primaryColor}30` }}
                >
                  حفظ وإغلاق
                </button>
              </div>
            </motion.div>
          </div>
        )}
        </AnimatePresence>,
        document.body
      )}

      {category === 'prayer' && (
        <div className="w-full flex flex-col gap-4 animate-[fadeIn_0.5s_ease-out] mb-1">
          {/* Pill navigation tab list */}
          <div className="w-full flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none" dir="rtl">
            {PRAYER_STEPS_DEFINITION.map((step) => {
              const isSelected = activePrayerStep === step.id;
              const progress = stepsProgress[step.id] || { total: 0, completed: 0, percent: 0 };
              const StepIcon = step.icon;

              return (
                <button
                  key={step.id}
                  onClick={() => {
                    setActivePrayerStep(step.id);
                    triggerHaptic('light');
                  }}
                  className={cn(
                    "h-10 px-3.5 flex items-center gap-1.5 rounded-full border text-xs font-black shrink-0 transition-all duration-300 relative overflow-hidden cursor-pointer shadow-sm",
                    isSelected 
                      ? "bg-teal-600 border-teal-600 text-white shadow-md shadow-teal-600/30"
                      : currentTheme.isLight
                        ? "bg-white/90 hover:bg-white border-black/10 text-slate-800"
                        : "bg-slate-900/80 hover:bg-slate-900 border-white/20 text-slate-100"
                  )}
                >
                  <StepIcon size={13} className={isSelected ? 'text-white' : currentTheme.isLight ? 'text-slate-500' : 'text-slate-400'} />
                  <span>{step.title}</span>

                  <span className={cn(
                    "text-[9px] px-1.5 py-0.5 rounded-full font-bold",
                    isSelected
                      ? "bg-white/20 text-white"
                      : progress.percent === 100
                        ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                        : currentTheme.isLight ? "bg-slate-200 text-slate-700" : "bg-slate-800 text-slate-300"
                  )}>
                    {progress.completed}/{progress.total}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Step Progress Card */}
          {(() => {
            const selectedStep = PRAYER_STEPS_DEFINITION.find(s => s.id === activePrayerStep);
            const progress = stepsProgress[activePrayerStep] || { total: 0, completed: 0, percent: 0 };
            
            if (!selectedStep) return null;

            return (
              <div 
                className="w-full rounded-2xl p-4 space-y-3 shadow-inner border transition-all duration-300"
                style={{
                  backgroundColor: currentTheme.isLight ? 'rgba(255, 255, 255, 0.7)' : 'rgba(15, 23, 42, 0.6)',
                  borderColor: currentTheme.isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.15)'
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <h4 className={cn("text-xs sm:text-sm font-black", currentTheme.isLight ? "text-slate-900" : "text-white")}>{selectedStep.title}</h4>
                    <p className={cn("text-[10px] sm:text-[11px] font-bold mt-0.5", currentTheme.isLight ? "text-slate-600" : "text-slate-300")}>{selectedStep.description}</p>
                  </div>
                  <div className="flex flex-col items-end shrink-0">
                    <span className={cn("text-xs sm:text-sm font-black", currentTheme.isLight ? "text-slate-800" : "text-slate-100")}>{progress.percent}%</span>
                    <span className={cn("text-[9px] sm:text-[10px] font-bold mt-0.5", currentTheme.isLight ? "text-slate-500" : "text-slate-400")}>مكتمل</span>
                  </div>
                </div>

                {/* Progress bar line */}
                <div className={cn("w-full h-1.5 rounded-full overflow-hidden", currentTheme.isLight ? "bg-slate-200" : "bg-slate-700")}>
                  <motion.div 
                    className="h-full bg-gradient-to-r from-teal-500 to-emerald-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress.percent}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>

                {/* Success Banner and Quick Action */}
                {progress.percent === 100 && activePrayerStep !== 'all' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 p-3 rounded-xl flex flex-col items-center justify-center text-center gap-1.5"
                  >
                    <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-black text-xs">
                      <CheckCircle2 size={13} />
                      <span>{t('congrats_adhkar_completed', { title: selectedStep?.title || '' })}</span>
                    </div>

                    {(() => {
                      const currentIdx = PRAYER_STEPS_DEFINITION.findIndex(s => s.id === activePrayerStep);
                      const nextStep = currentIdx !== -1 && currentIdx < PRAYER_STEPS_DEFINITION.length - 1 ? PRAYER_STEPS_DEFINITION[currentIdx + 1] : null;

                      if (nextStep) {
                        return (
                          <button
                            onClick={() => {
                              setActivePrayerStep(nextStep.id);
                              triggerHaptic('light');
                            }}
                            className="mt-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <span>انتقل إلى مأثورات {nextStep.title}</span>
                            <Sparkles size={11} className="animate-spin" />
                          </button>
                        );
                      }
                      return (
                        <p className={cn("text-[10px]", currentTheme.isLight ? "text-slate-600" : "text-slate-300")}>تقبل الله طاعتك ورزقك الخشوع والقبول!</p>
                      );
                    })()}
                  </motion.div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* Cards List container */}
      <div className="flex flex-col items-center gap-3 pb-4 w-full">
        {filteredItems.length === 0 ? (
          <div 
            className="w-full py-12 text-center rounded-2xl border border-dashed flex flex-col items-center justify-center gap-2 animate-[fadeIn_0.4s_ease-out]"
            style={{
              backgroundColor: currentTheme.isLight ? 'rgba(255, 255, 255, 0.5)' : 'rgba(15, 23, 42, 0.4)',
              borderColor: currentTheme.isLight ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.15)'
            }}
          >
            <Scroll size={32} className={currentTheme.isLight ? "text-slate-400" : "text-slate-500"} />
            <p className={cn("text-xs font-black", currentTheme.isLight ? "text-slate-700" : "text-slate-200")}>لا توجد أذكار في هذا القسم حالياً.</p>
          </div>
        ) : settings.adhkarViewMode === 'single' ? (
          (() => {
            const activeIdx = Math.min(activeDhikrIdx, filteredItems.length - 1);
            const item = filteredItems[activeIdx];
            if (!item) return null;
            const originalIdx = currentCategory.items.findIndex(i => i.id === item.id);
            return (
              <div className="w-full max-w-xl relative h-full flex flex-col">
                <AnimatePresence mode="popLayout">
                  <motion.div
                    key={item.id}
                    initial={{
                      opacity: 0,
                      x: slideDirection === 'forward' ? (isRtl ? -60 : 60) : (isRtl ? 60 : -60),
                      scale: 0.97
                    }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{
                      opacity: 0,
                      x: slideDirection === 'forward' ? (isRtl ? 60 : -60) : (isRtl ? -60 : 60),
                      scale: 0.97
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 420,
                      damping: 32,
                      mass: 0.9
                    }}
                    drag="x"
                    dragDirectionLock={true}
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={{
                      left: (isRtl ? activeIdx > 0 : activeIdx < filteredItems.length - 1) ? 0.7 : 0,
                      right: (isRtl ? activeIdx < filteredItems.length - 1 : activeIdx > 0) ? 0.7 : 0
                    }}
                    onDragEnd={(e, { offset, velocity }) => {
                      const swipe = offset.x;
                      const swipeThreshold = 50;
                      const velocityThreshold = 400;

                      if (swipe > swipeThreshold || velocity.x > velocityThreshold) {
                        // Swiped right
                        if (isRtl) {
                          if (activeIdx < filteredItems.length - 1) {
                            setSlideDirection('forward');
                            setActiveDhikrIdx(activeIdx + 1);
                            triggerHaptic('light');
                          }
                        } else {
                          if (activeIdx > 0) {
                            setSlideDirection('backward');
                            setActiveDhikrIdx(activeIdx - 1);
                            triggerHaptic('light');
                          }
                        }
                      } else if (swipe < -swipeThreshold || velocity.x < -velocityThreshold) {
                        // Swiped left
                        if (isRtl) {
                          if (activeIdx > 0) {
                            setSlideDirection('backward');
                            setActiveDhikrIdx(activeIdx - 1);
                            triggerHaptic('light');
                          }
                        } else {
                          if (activeIdx < filteredItems.length - 1) {
                            setSlideDirection('forward');
                            setActiveDhikrIdx(activeIdx + 1);
                            triggerHaptic('light');
                          }
                        }
                      }
                    }}
                    className="w-full touch-none select-none flex-1 flex flex-col"
                  >
                    <DhikrCard 
                      item={item}
                      idx={originalIdx !== -1 ? originalIdx : activeIdx}
                      count={counts[item.id] || 0}
                      settings={settings}
                      theme={currentTheme}
                      updateCount={handleUpdateCountWithTimer}
                      addPoints={addPoints}
                      className="h-full flex-1"
                      categoryTitle={currentCategory?.title}
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Aesthetic Interactive Single Controller */}
                <div className="w-full flex flex-col items-center gap-3 mt-5 px-1" dir="rtl">
                  <div 
                    className="flex items-center justify-between w-full rounded-2xl p-3 border shadow-md backdrop-blur-md transition-all duration-300"
                    style={{
                      backgroundColor: currentTheme.isLight ? 'rgba(255, 255, 255, 0.9)' : 'rgba(15, 23, 42, 0.85)',
                      borderColor: currentTheme.isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.15)'
                    }}
                  >
                    <button
                      onClick={() => {
                        if (activeIdx > 0) {
                          setSlideDirection('backward');
                          setActiveDhikrIdx(activeIdx - 1);
                          triggerHaptic('light');
                        }
                      }}
                      disabled={activeIdx === 0}
                      className={cn(
                        "px-5 py-3 text-sm font-black rounded-xl border flex items-center gap-2 transition-all duration-100 cursor-pointer shadow-md",
                        activeIdx === 0
                          ? (currentTheme.isLight 
                              ? "bg-slate-100/70 text-slate-400 border-slate-200/50 cursor-not-allowed shadow-none" 
                              : "bg-slate-800/40 text-slate-600 border-white/5 cursor-not-allowed shadow-none")
                          : (currentTheme.isLight
                              ? "bg-white text-teal-700 border-teal-500/30 hover:border-teal-600 hover:scale-[1.03] active:scale-95 hover:bg-teal-50/50"
                              : "bg-slate-800 text-teal-300 border-teal-500/40 hover:border-teal-400 hover:scale-[1.03] active:scale-95 hover:bg-slate-700")
                      )}
                    >
                      <ChevronRight size={18} strokeWidth={3.5} />
                      <span className="font-black text-sm">السابق</span>
                    </button>

                    <div className="flex flex-col items-center">
                      <span className={cn(
                        "text-xs font-mono font-black transition-colors duration-300",
                        currentTheme.isLight ? "text-slate-800" : "text-slate-100"
                      )}>
                        الذكر {activeIdx + 1} من {filteredItems.length}
                      </span>
                      <div className={cn(
                        "w-24 h-1.5 rounded-full mt-1.5 overflow-hidden border",
                        currentTheme.isLight ? "bg-slate-200 border-black/5" : "bg-slate-700 border-white/10"
                      )}>
                        <div 
                          className="h-full rounded-full transition-all duration-300"
                          style={{ 
                            width: `${((activeIdx + 1) / filteredItems.length) * 100}%`,
                            backgroundColor: settings.primaryColor.includes('gradient') 
                              ? (settings.primaryColor.match(/#[a-fA-F0-9]{6}/)?.[0] || '#0d9488') 
                              : settings.primaryColor
                          }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (activeIdx < filteredItems.length - 1) {
                          setSlideDirection('forward');
                          setActiveDhikrIdx(activeIdx + 1);
                          triggerHaptic('light');
                        }
                      }}
                      disabled={activeIdx === filteredItems.length - 1}
                      className={cn(
                        "px-5 py-3 text-sm font-black rounded-xl border flex items-center gap-2 transition-all duration-100 cursor-pointer shadow-md",
                        activeIdx === filteredItems.length - 1
                          ? (currentTheme.isLight 
                              ? "bg-slate-100/70 text-slate-400 border-slate-200/50 cursor-not-allowed shadow-none" 
                              : "bg-slate-800/40 text-slate-600 border-white/5 cursor-not-allowed shadow-none")
                          : (currentTheme.isLight
                              ? "bg-white text-teal-700 border-teal-500/30 hover:border-teal-600 hover:scale-[1.03] active:scale-95 hover:bg-teal-50/50"
                              : "bg-slate-800 text-teal-300 border-teal-500/40 hover:border-teal-400 hover:scale-[1.03] active:scale-95 hover:bg-slate-700")
                      )}
                    >
                      <span className="font-black text-sm">التالي</span>
                      <ChevronRight size={18} strokeWidth={3.5} className="rotate-180" />
                    </button>
                  </div>

                  {/* Auto-advance helper checkbox */}
                  <div 
                    className={cn(
                      "flex items-center gap-2 self-center md:self-start px-4 py-2 rounded-full border backdrop-blur-md shadow-sm transition-all duration-300",
                      currentTheme.isLight 
                        ? "bg-white/90 border-black/10 shadow-slate-200/50" 
                        : "bg-slate-900/85 border-white/20 shadow-black/40"
                    )}
                  >
                    <input
                      type="checkbox"
                      id="auto-advance-chk"
                      checked={settings.adhkarAutoAdvance !== false}
                      onChange={(e) => updateSettings({ adhkarAutoAdvance: e.target.checked })}
                      className={cn(
                        "w-4 h-4 rounded text-teal-600 focus:ring-teal-500/20 cursor-pointer transition-colors",
                        currentTheme.isLight 
                          ? "bg-slate-100 border-slate-300" 
                          : "bg-slate-800 border-slate-600"
                      )}
                    />
                    <label 
                      htmlFor="auto-advance-chk" 
                      className={cn(
                        "text-xs font-black cursor-pointer select-none transition-colors duration-300 leading-none",
                        currentTheme.isLight ? "text-slate-800" : "text-white"
                      )}
                    >
                      الانتقال تلقائياً للذكر التالي عند اكتمال العداد
                    </label>
                  </div>
                </div>
              </div>
            );
          })()
        ) : (
          filteredItems.map((item, idx) => {
            const originalIdx = currentCategory.items.findIndex(i => i.id === item.id);
            return (
              <DhikrCard 
                key={item.id}
                item={item}
                idx={originalIdx !== -1 ? originalIdx : idx}
                count={counts[item.id] || 0}
                settings={settings}
                theme={currentTheme}
                updateCount={handleUpdateCountWithTimer}
                addPoints={addPoints}
                categoryTitle={currentCategory?.title}
              />
            );
          })
        )}
      </div>

      <AnimatePresence>
        {showReward && (() => {
          const isMorning = category === 'morning';
          const isEvening = category === 'evening';

          // 3D Color Configurations for a gorgeous celestial plaque
          const cardStyles = isMorning
            ? {
                bg: "bg-gradient-to-b from-[#151c35] via-[#1b254a] to-[#0d1226] border-[4px] border-[#fbbf24]",
                shadow: "shadow-[0_25px_60px_rgba(245,158,11,0.35),inset_0_4px_12px_rgba(255,255,255,0.15)]",
                badgeBg: "from-[#fff3c4] via-[#f59e0b] to-[#78350f] border-[#ffed97]",
                badgeGlow: "shadow-[0_0_25px_rgba(245,158,11,0.6)]",
                accentText: "text-[#fbbf24]",
                icon: "☀️",
                title: "تقبل الله طاعتك صباحاً! 🌅",
                buttonBg: "from-[#fcd34d] via-[#f59e0b] to-[#b45309]",
                buttonBorder: "border-[#fef3c7]",
                buttonShadow: "shadow-[0_5px_0_#92400e]",
                pillBg: "bg-amber-500/10 border-amber-500/20 text-[#fde047]",
              }
            : isEvening
            ? {
                bg: "bg-gradient-to-b from-[#0c0f1e] via-[#121631] to-[#060812] border-[4px] border-[#60a5fa]",
                shadow: "shadow-[0_25px_60px_rgba(37,99,235,0.35),inset_0_4px_12px_rgba(255,255,255,0.15)]",
                badgeBg: "from-[#dbeafe] via-[#2563eb] to-[#1e3a8a] border-[#60a5fa]",
                badgeGlow: "shadow-[0_0_25px_rgba(37,99,235,0.6)]",
                accentText: "text-[#60a5fa]",
                icon: "🌙",
                title: "تقبل الله طاعتك مساءً! 🌌",
                buttonBg: "from-[#93c5fd] via-[#2563eb] to-[#1e40af]",
                buttonBorder: "border-[#eff6ff]",
                buttonShadow: "shadow-[0_5px_0_#1e3a8a]",
                pillBg: "bg-blue-500/10 border-blue-500/20 text-[#93c5fd]",
              }
            : {
                bg: "bg-gradient-to-b from-[#0d1f16] via-[#112d1f] to-[#050e09] border-[4px] border-[#34d399]",
                shadow: "shadow-[0_25px_60px_rgba(16,185,129,0.35),inset_0_4px_12px_rgba(255,255,255,0.15)]",
                badgeBg: "from-[#d1fae5] via-[#059669] to-[#064e3b] border-[#34d399]",
                badgeGlow: "shadow-[0_0_25px_rgba(16,185,129,0.6)]",
                accentText: "text-[#34d399]",
                icon: "⭐",
                title: "تقبل الله طاعتك! ✨",
                buttonBg: "from-[#6ee7b7] via-[#059669] to-[#065f46]",
                buttonBorder: "border-[#ecfdf5]",
                buttonShadow: "shadow-[0_5px_0_#064e3b]",
                pillBg: "bg-emerald-500/10 border-emerald-500/20 text-[#6ee7b7]",
              };

          if (typeof document === 'undefined') return null;
          return createPortal(
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
              dir="rtl"
            >
              <motion.div
                initial={{ scale: 0.9, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 30 }}
                transition={{ type: "spring", stiffness: 320, damping: 24 }}
                className={cn(
                  "rounded-[36px] p-6 max-w-[340px] sm:max-w-[350px] w-full text-center relative overflow-visible transition-all select-none border-[3.5px]",
                  cardStyles.bg,
                  cardStyles.shadow
                )}
              >
                {/* 3D Sheen highlight sweep overlay */}
                <div className="absolute top-1 left-4 w-48 h-40 bg-gradient-to-tr from-transparent via-white/[0.04] to-white/[0.08] rounded-full blur-2xl pointer-events-none" />
                
                {/* Sparkles decoration */}
                <div className="absolute -top-6 -left-4 text-yellow-300 animate-pulse pointer-events-none">
                  <Sparkles size={24} className="opacity-90 animate-bounce" />
                </div>
                <div className="absolute -bottom-2 -right-2 text-sky-300 animate-pulse pointer-events-none">
                  <Sparkles size={20} className="opacity-80" />
                </div>

                {/* Rotating Glowing 3D-Look Sphere Badge / Trophy */}
                <div className="relative -mt-16 sm:-mt-20 mb-4 flex justify-center">
                  <motion.div 
                    animate={{ 
                      y: [0, -6, 0],
                      rotate: [0, 4, -4, 0]
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className={cn(
                      "w-20 h-20 rounded-full bg-gradient-to-b border-[3.5px] flex items-center justify-center relative select-none z-10",
                      cardStyles.badgeBg,
                      cardStyles.badgeGlow
                    )}
                  >
                    {/* Glass sheen overlay */}
                    <div className="absolute inset-[1px] rounded-full bg-gradient-to-tr from-transparent via-white/35 to-transparent pointer-events-none" />
                    <div className="absolute inset-[3px] rounded-full border border-white/20" />
                    
                    <span className="text-3xl drop-shadow-[0_3px_6px_rgba(0,0,0,0.45)] select-none pointer-events-none">
                      {cardStyles.icon}
                    </span>
                  </motion.div>
                </div>

                {/* Core Title */}
                <h3 className="text-xl font-black text-white/95 leading-tight mb-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]" style={{ fontFamily: "'Tajawal', sans-serif" }}>
                  {cardStyles.title}
                </h3>
                
                {/* Descriptive subheader */}
                <p className="text-[13px] text-slate-300 leading-relaxed px-1 mb-4">
                  {t('congrats_category_completed', { title: categoryTitle })}
                </p>

                {/* 3D Compact Stat Pills Row Grid */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {/* Time Spent Pill */}
                  <div className={cn("rounded-2xl border p-2.5 flex flex-col justify-center items-center gap-1 bg-white/5 backdrop-blur-sm shadow-[inset_0_2px_4px_rgba(255,255,255,0.04)]", cardStyles.pillBg)}>
                    <span className="text-[9px] uppercase tracking-wider font-extrabold opacity-70">الوقت المستغرق</span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Timer size={12} className="opacity-85 animate-pulse" />
                      <span className="text-[12px] font-bold tracking-wide font-mono leading-none text-white">{formatTime(secondsElapsed)}</span>
                    </div>
                  </div>

                  {/* Level / Reading Style Pill */}
                  <div className={cn("rounded-2xl border p-2.5 flex flex-col justify-center items-center gap-1 bg-white/5 backdrop-blur-sm shadow-[inset_0_2px_4px_rgba(255,255,255,0.04)]", cardStyles.pillBg)}>
                    <span className="text-[9px] uppercase tracking-wider font-extrabold opacity-70">نمط الذكر والتدبر</span>
                    <span className="text-[11px] font-black truncate max-w-full leading-none mt-1 text-white">{readingSpeedRate}</span>
                  </div>
                </div>

                {/* Simple highly compact descriptions box */}
                <div className="bg-black/35 text-slate-300 border border-white/[0.03] rounded-2xl p-3 mb-5 text-[11px] leading-relaxed text-center shadow-inner font-bold font-sans">
                  قضيت <span className="text-white font-black">{formatTimePhrase(secondsElapsed)}</span> في تسابيح الطهر وتحصين النفس واليقين بالله تعالى. ✨
                </div>

                {/* High-fidelity 3D Tactile Action Button */}
                <div className="relative pt-1 font-bold">
                  <button
                    onClick={() => setShowReward(false)}
                    className={cn(
                      "w-full py-3.5 px-6 rounded-2xl font-black text-sm text-white tracking-wide transition-all duration-75 flex items-center justify-center gap-2 border bg-gradient-to-b active:translate-y-1 active:scale-[0.98] select-none cursor-pointer",
                      cardStyles.buttonBg,
                      cardStyles.buttonBorder,
                      cardStyles.buttonShadow,
                      "active:shadow-[0_1px_0_rgba(0,0,0,0.2)]"
                    )}
                  >
                    <span>الحمد لله رب العالمين</span>
                    <CheckCircle2 size={16} className="stroke-[3]" />
                  </button>
                </div>
              </motion.div>
            </motion.div>,
            document.body
          );
        })()}
      </AnimatePresence>
    </div>
  );
};

export default Adhkar;
