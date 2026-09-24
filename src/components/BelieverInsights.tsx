import { BackButton } from './ui/BackButton';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { DailyQuotesWidget, FONTS_LIST } from './DailyQuotesWidget';
import { 
 ChevronRight, ChevronUp, ChevronDown, Heart, Trash2, Plus, CheckCircle2, AlertCircle, AlertTriangle,
 TrendingUp, TrendingDown, Info, Sparkles, BookOpen, HandHeart, Users, Scale, Utensils, Home,
 MessageSquare, MessageSquareOff, Shield, ShieldOff, Book,
 ArrowDown, ArrowUp, UserX, Clock, Coins, Flame, Smile,
 CheckCircle, Circle, Trophy, Calendar, GripVertical, History, Target, 
 X, ExternalLink, Star, Zap, Layers, Settings, Bell, RotateCcw, Layout, Sun, Moon, UserCheck, Award, Volume2,
 Wind, Landmark, Stethoscope
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
 DndContext, 
 closestCenter,
 KeyboardSensor,
 PointerSensor,
 useSensor,
 useSensors,
 DragEndEvent
} from '@dnd-kit/core';
import {
 arrayMove,
 SortableContext,
 sortableKeyboardCoordinates,
 verticalListSortingStrategy,
 useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '../lib/utils';
import { useAppContext } from '../AppContext';
import { useSmartNavigation } from "../lib/navigation";
import { safeLocalStorageGetItem, safeLocalStorageSetItem, safeLocalStorageRemoveItem } from "../utils/storage";


import { INITIAL_HABITS, type Habit } from '../data/habitsData';
// Re-exported so existing importers of this module keep working.
export type { Habit } from '../data/habitsData';
export { INITIAL_HABITS } from '../data/habitsData';

export type LocalTheme = 'default' | 'emerald' | 'night' | 'ocean' | 'sunset' | 'rose' | 'midnight' | 'crimson';

export interface ThemeStyle {
  bg: string;
  headerBg: string;
  headerBorder: string;
  headerText: string;
  headerSubtext: string;
  dashboardBg: string;
  dashboardBorder: string;
  dashboardTitle: string;
  dashboardSubtitle: string;
  dashboardProgressBg: string;
  dashboardProgressFill: string;
  buttonTheme: string;
  patternOpacity: string;
  cardBg: string;
  cardBorder: string;
  cardText: string;
  cardSubtext: string;
  settingsBtn: string;
}

export const LOCAL_THEMES: { id: LocalTheme; name: string; color: string }[] = [
  { id: 'default', name: 'الافتراضي', color: 'bg-emerald-600' },
  { id: 'emerald', name: 'الزمردي', color: 'bg-emerald-500' },
  { id: 'night', name: 'الليلي', color: 'bg-indigo-900' },
  { id: 'ocean', name: 'المحيط', color: 'bg-cyan-500' },
  { id: 'sunset', name: 'الغروب', color: 'bg-orange-500' },
  { id: 'rose', name: 'الوردي', color: 'bg-rose-500' },
  { id: 'midnight', name: 'منتصف الليل', color: 'bg-slate-800' },
  { id: 'crimson', name: 'القرمزي', color: 'bg-red-600' }
];

const THEME_CONFIGS: Record<LocalTheme, { dark: ThemeStyle; light: ThemeStyle }> = {
  default: {
    dark: {
      bg: "bg-[#032112] text-white",
      headerBg: "bg-[#053d21] border-b border-[#0d5e34]",
      headerBorder: "border-[#0d5e34]",
      headerText: "text-white",
      headerSubtext: "text-amber-400 font-extrabold",
      dashboardBg: "bg-[#0a0a0a] border-2 border-[#10b981] shadow-[0_10px_30px_rgba(0,0,0,0.6)]",
      dashboardBorder: "border-[#10b981]",
      dashboardTitle: "text-amber-400 font-black",
      dashboardSubtitle: "text-emerald-100 font-bold",
      dashboardProgressBg: "bg-[#01140a]",
      dashboardProgressFill: "bg-[#eab308]",
      buttonTheme: "text-white bg-[#065f35] border border-[#10b981] hover:bg-[#087f47]",
      patternOpacity: "opacity-[0.1] bg-[url('/images/arabesque.png')]",
      cardBg: "bg-[#090909]/90 hover:bg-[#0f0f0f]/90",
      cardBorder: "border-2 border-[#10b981]",
      cardText: "text-white",
      cardSubtext: "text-emerald-100",
      settingsBtn: "bg-white/10 text-white hover:bg-white/20 border-white/10"
    },
    light: {
      bg: "bg-[#0d6e3f] text-white",
      headerBg: "bg-[#0a5430] border-b border-[#083c22]",
      headerBorder: "border-[#083c22]",
      headerText: "text-white font-black",
      headerSubtext: "text-emerald-200 font-bold",
      dashboardBg: "bg-[#084829] border-2 border-[#a7f3d0] shadow-md",
      dashboardBorder: "border-[#a7f3d0]",
      dashboardTitle: "text-amber-300 font-black",
      dashboardSubtitle: "text-emerald-100 font-bold",
      dashboardProgressBg: "bg-[#05311b]",
      dashboardProgressFill: "bg-[#10b981]",
      buttonTheme: "text-white bg-[#063c22] border border-[#34d399] hover:bg-[#08522e]",
      patternOpacity: "opacity-[0.08] bg-[url('/images/arabesque.png')]",
      cardBg: "bg-white/95 hover:bg-white",
      cardBorder: "border-2 border-[#34d399]",
      cardText: "text-white",
      cardSubtext: "text-emerald-200 font-medium",
      settingsBtn: "bg-white/10 text-white hover:bg-white/20 border-white/10"
    }
  },
  emerald: {
    dark: {
      bg: "bg-[#03241d] text-white",
      headerBg: "bg-[#064e3b] border-b border-[#0f766e]",
      headerBorder: "border-[#0f766e]",
      headerText: "text-white",
      headerSubtext: "text-emerald-300 font-extrabold",
      dashboardBg: "bg-[#070707] border-2 border-[#14b8a6] shadow-[0_10px_30px_rgba(0,0,0,0.6)]",
      dashboardBorder: "border-[#14b8a6]",
      dashboardTitle: "text-emerald-300 font-black",
      dashboardSubtitle: "text-emerald-100 font-bold",
      dashboardProgressBg: "bg-[#021814]",
      dashboardProgressFill: "bg-[#14b8a6]",
      buttonTheme: "text-emerald-100 bg-[#064e3b] border border-[#0d9488] hover:bg-[#0a5c48]",
      patternOpacity: "opacity-[0.1] bg-[url('/images/arabesque.png')]",
      cardBg: "bg-[#070707]/90 hover:bg-[#0d0d0d]/90",
      cardBorder: "border-2 border-[#0d9488]",
      cardText: "text-white",
      cardSubtext: "text-teal-100",
      settingsBtn: "bg-white/10 text-white hover:bg-white/20 border-white/10"
    },
    light: {
      bg: "bg-[#0f766e] text-white",
      headerBg: "bg-[#0d534f] border-b border-[#0b3c39]",
      headerBorder: "border-[#0b3c39]",
      headerText: "text-white font-black",
      headerSubtext: "text-teal-200 font-bold",
      dashboardBg: "bg-[#0a4844] border-2 border-[#99f6e4] shadow-md",
      dashboardBorder: "border-[#99f6e4]",
      dashboardTitle: "text-teal-200 font-black",
      dashboardSubtitle: "text-teal-100 font-bold",
      dashboardProgressBg: "bg-[#07322f]",
      dashboardProgressFill: "bg-[#2dd4bf]",
      buttonTheme: "text-white bg-[#083a37] border border-[#2dd4bf] hover:bg-[#0a4844]",
      patternOpacity: "opacity-[0.08] bg-[url('/images/arabesque.png')]",
      cardBg: "bg-white/95 hover:bg-white",
      cardBorder: "border-2 border-[#2dd4bf]",
      cardText: "text-white",
      cardSubtext: "text-teal-200 font-medium",
      settingsBtn: "bg-white/10 text-white hover:bg-white/20 border-white/10"
    }
  },
  night: {
    dark: {
      bg: "bg-[#0a0521] text-white",
      headerBg: "bg-[#1e154a] border-b border-[#31227a]",
      headerBorder: "border-[#31227a]",
      headerText: "text-white",
      headerSubtext: "text-indigo-300 font-extrabold",
      dashboardBg: "bg-[#060606] border-2 border-[#6366f1] shadow-[0_10px_30px_rgba(0,0,0,0.6)]",
      dashboardBorder: "border-[#6366f1]",
      dashboardTitle: "text-indigo-300 font-black",
      dashboardSubtitle: "text-indigo-100 font-bold",
      dashboardProgressBg: "bg-[#050212]",
      dashboardProgressFill: "bg-[#818cf8]",
      buttonTheme: "text-indigo-100 bg-[#1e154a] border border-[#4f46e5] hover:bg-[#281a6e]",
      patternOpacity: "opacity-[0.1] bg-[url('/images/arabesque.png')]",
      cardBg: "bg-[#060606]/90 hover:bg-[#0c0c0c]/90",
      cardBorder: "border-2 border-[#4f46e5]",
      cardText: "text-white",
      cardSubtext: "text-indigo-200",
      settingsBtn: "bg-white/10 text-white hover:bg-white/20 border-white/10"
    },
    light: {
      bg: "bg-[#4338ca] text-white",
      headerBg: "bg-[#31299a] border-b border-[#1e1960]",
      headerBorder: "border-[#1e1960]",
      headerText: "text-white font-black",
      headerSubtext: "text-indigo-200 font-bold",
      dashboardBg: "bg-[#2a2282] border-2 border-[#c7d2fe] shadow-md",
      dashboardBorder: "border-[#c7d2fe]",
      dashboardTitle: "text-indigo-200 font-black",
      dashboardSubtitle: "text-indigo-100 font-bold",
      dashboardProgressBg: "bg-[#1b1557]",
      dashboardProgressFill: "bg-[#818cf8]",
      buttonTheme: "text-white bg-[#1e1960] border border-[#a5b4fc] hover:bg-[#2a2282]",
      patternOpacity: "opacity-[0.08] bg-[url('/images/arabesque.png')]",
      cardBg: "bg-white/95 hover:bg-white",
      cardBorder: "border-2 border-[#a5b4fc]",
      cardText: "text-white",
      cardSubtext: "text-indigo-200 font-medium",
      settingsBtn: "bg-white/10 text-white hover:bg-white/20 border-white/10"
    }
  },
  ocean: {
    dark: {
      bg: "bg-gradient-to-br from-[#011b24] via-[#053e54] to-[#010e14] text-white",
      headerBg: "bg-transparent border-white/5",
      headerBorder: "border-white/5",
      headerText: "text-white",
      headerSubtext: "text-cyan-300/90 font-black",
      dashboardBg: "bg-gradient-to-br from-[#0c0c0c] to-[#010101] border border-[#0891b2] shadow-[0_10px_40px_rgba(0,0,0,0.6)]",
      dashboardBorder: "border-[#0891b2]",
      dashboardTitle: "text-cyan-300 font-extrabold",
      dashboardSubtitle: "text-cyan-100/80 font-bold",
      dashboardProgressBg: "bg-[#010e14]",
      dashboardProgressFill: "bg-gradient-to-r from-cyan-400 via-sky-400 to-teal-300",
      buttonTheme: "text-cyan-100 bg-[#053e54] border border-[#0891b2] hover:border-cyan-400/50",
      patternOpacity: "opacity-[0.06] bg-[url('/images/arabesque.png')]",
      cardBg: "bg-[#050505]/95 hover:bg-[#0b0b0b]/95",
      cardBorder: "border-[#0891b2]",
      cardText: "text-white",
      cardSubtext: "text-cyan-200/80",
      settingsBtn: "bg-white/10 text-white hover:bg-white/20 border-white/10"
    },
    light: {
      bg: "bg-gradient-to-br from-[#005c7a] via-[#0284c7] to-[#0369a1] text-white",
      headerBg: "bg-transparent border-white/10",
      headerBorder: "border-white/10",
      headerText: "text-white font-black",
      headerSubtext: "text-sky-200 font-bold",
      dashboardBg: "bg-[#024e78] border border-sky-300/40 shadow-lg",
      dashboardBorder: "border-sky-300/40",
      dashboardTitle: "text-sky-200 font-extrabold",
      dashboardSubtitle: "text-sky-100 font-bold",
      dashboardProgressBg: "bg-sky-950/80 border border-sky-800/50",
      dashboardProgressFill: "bg-gradient-to-r from-cyan-400 to-sky-300",
      buttonTheme: "text-white bg-[#014e75] border border-sky-400/50 hover:bg-[#025a87]",
      patternOpacity: "opacity-[0.06] bg-[url('/images/arabesque.png')] invert",
      cardBg: "bg-[#025684] hover:bg-[#026296]",
      cardBorder: "border-[#0284c7] shadow-[0_4px_14px_rgba(14,165,233,0.15)]",
      cardText: "text-white",
      cardSubtext: "text-sky-100/90 font-medium",
      settingsBtn: "bg-white/10 text-white hover:bg-white/20 border-white/10"
    }
  },
  sunset: {
    dark: {
      bg: "bg-gradient-to-br from-[#230903] via-[#431407] to-[#140401] text-white",
      headerBg: "bg-transparent border-white/5",
      headerBorder: "border-white/5",
      headerText: "text-white",
      headerSubtext: "text-orange-300/80",
      dashboardBg: "bg-gradient-to-br from-[#0a0a0a] to-[#020202] border border-[#ea580c] shadow-[0_10px_40px_rgba(0,0,0,0.5)]",
      dashboardBorder: "border-[#ea580c]",
      dashboardTitle: "text-orange-400",
      dashboardSubtitle: "text-white/70",
      dashboardProgressBg: "bg-[#2d0f05]",
      dashboardProgressFill: "bg-gradient-to-r from-orange-500 via-orange-400 to-yellow-300",
      buttonTheme: "text-orange-100 bg-[#7c2d12] border border-[#ea580c] hover:border-orange-400/50",
      patternOpacity: "opacity-[0.05] bg-[url('/images/arabesque.png')]",
      cardBg: "bg-[#040404]/90 hover:bg-[#0a0a0a]/90",
      cardBorder: "border-[#8c2a11]",
      cardText: "text-white",
      cardSubtext: "text-orange-100/75",
      settingsBtn: "bg-white/10 text-white hover:bg-white/20 border-white/10"
    },
    light: {
      bg: "bg-gradient-to-br from-[#fffaf5] via-[#ffe5d0] to-[#ffcca3] text-slate-800",
      headerBg: "bg-transparent border-orange-900/10",
      headerBorder: "border-orange-900/10",
      headerText: "text-orange-950",
      headerSubtext: "text-orange-800 font-bold",
      dashboardBg: "bg-gradient-to-br from-white via-[#fffdfa] to-[#ffe5d0] border border-orange-200 shadow-[0_10px_40px_rgba(124,45,18,0.06)]",
      dashboardBorder: "border-orange-200",
      dashboardTitle: "text-orange-850 font-extrabold",
      dashboardSubtitle: "text-orange-650/90 font-bold",
      dashboardProgressBg: "bg-orange-100 border border-orange-200/50",
      dashboardProgressFill: "bg-gradient-to-r from-orange-600 to-[#f97316]",
      buttonTheme: "text-orange-900 bg-orange-100/70 border border-orange-200 hover:bg-orange-200",
      patternOpacity: "opacity-[0.025] bg-[url('/images/arabesque.png')] invert",
      cardBg: "bg-white/95 hover:bg-white",
      cardBorder: "border-orange-200 hover:border-orange-350 shadow-[0_4px_12px_rgba(249,115,22,0.03)]",
      cardText: "text-orange-950",
      cardSubtext: "text-orange-800/80",
      settingsBtn: "bg-orange-100/60 text-orange-900 hover:bg-orange-200 border-orange-200/60"
    }
  },
  rose: {
    dark: {
      bg: "bg-gradient-to-br from-[#24020b] via-[#4c0519] to-[#120004] text-white",
      headerBg: "bg-transparent border-white/5",
      headerBorder: "border-white/5",
      headerText: "text-white",
      headerSubtext: "text-rose-300/80",
      dashboardBg: "bg-gradient-to-br from-[#0b0b0b] to-[#030303] border border-[#be123c] shadow-[0_10px_40px_rgba(0,0,0,0.5)]",
      dashboardBorder: "border-[#be123c]",
      dashboardTitle: "text-rose-400",
      dashboardSubtitle: "text-white/70",
      dashboardProgressBg: "bg-[#3b0213]",
      dashboardProgressFill: "bg-gradient-to-r from-rose-500 via-rose-400 to-pink-300",
      buttonTheme: "text-rose-100 bg-[#881337] border border-[#be123c] hover:border-rose-400/50",
      patternOpacity: "opacity-[0.05] bg-[url('/images/arabesque.png')]",
      cardBg: "bg-[#030303]/90 hover:bg-[#090909]/90",
      cardBorder: "border-[#9c153b]",
      cardText: "text-white",
      cardSubtext: "text-rose-100/75",
      settingsBtn: "bg-white/10 text-white hover:bg-white/20 border-white/10"
    },
    light: {
      bg: "bg-gradient-to-br from-[#fff5f7] via-[#ffd3de] to-[#ffaec1] text-slate-800",
      headerBg: "bg-transparent border-rose-900/10",
      headerBorder: "border-rose-900/10",
      headerText: "text-rose-950",
      headerSubtext: "text-rose-850 font-bold",
      dashboardBg: "bg-gradient-to-br from-white via-[#fff9fa] to-[#ffd3de] border border-rose-200 shadow-[0_10px_40px_rgba(136,19,55,0.06)]",
      dashboardBorder: "border-rose-200",
      dashboardTitle: "text-rose-850 font-extrabold",
      dashboardSubtitle: "text-rose-650/90 font-bold",
      dashboardProgressBg: "bg-rose-100 border border-rose-200/50",
      dashboardProgressFill: "bg-gradient-to-r from-rose-600 to-[#f43f5e]",
      buttonTheme: "text-rose-900 bg-rose-100/70 border border-rose-200 hover:bg-rose-200",
      patternOpacity: "opacity-[0.025] bg-[url('/images/arabesque.png')] invert",
      cardBg: "bg-white/95 hover:bg-white",
      cardBorder: "border-rose-200 hover:border-rose-350 shadow-[0_4px_12px_rgba(244,63,94,0.03)]",
      cardText: "text-rose-950",
      cardSubtext: "text-rose-850/80",
      settingsBtn: "bg-rose-100/60 text-rose-900 hover:bg-rose-200 border-rose-200/60"
    }
  },
  midnight: {
    dark: {
      bg: "bg-gradient-to-br from-[#020512] via-[#0f172a] to-[#020617] text-white",
      headerBg: "bg-transparent border-white/5",
      headerBorder: "border-white/5",
      headerText: "text-white",
      headerSubtext: "text-slate-300/80",
      dashboardBg: "bg-gradient-to-br from-[#090909] to-[#010101] border border-[#334155] shadow-[0_10px_40px_rgba(0,0,0,0.5)]",
      dashboardBorder: "border-[#334155]",
      dashboardTitle: "text-slate-300",
      dashboardSubtitle: "text-white/70",
      dashboardProgressBg: "bg-[#0b1329]",
      dashboardProgressFill: "bg-gradient-to-r from-slate-500 via-slate-400 to-slate-300",
      buttonTheme: "text-slate-100 bg-[#1e293b] border border-[#334155] hover:border-slate-400/50",
      patternOpacity: "opacity-[0.05] bg-[url('/images/arabesque.png')]",
      cardBg: "bg-[#020202]/95 hover:bg-[#080808]/95",
      cardBorder: "border-[#222e4a]/85",
      cardText: "text-white",
      cardSubtext: "text-slate-300/75",
      settingsBtn: "bg-white/10 text-white hover:bg-white/20 border-white/10"
    },
    light: {
      bg: "bg-gradient-to-br from-[#f8fafc] via-[#e2e8f0] to-[#cbd5e1] text-slate-800",
      headerBg: "bg-transparent border-slate-900/10",
      headerBorder: "border-slate-900/10",
      headerText: "text-slate-950",
      headerSubtext: "text-slate-700 font-bold",
      dashboardBg: "bg-gradient-to-br from-white via-[#fcfdfe] to-[#e2e8f0] border border-slate-300 shadow-[0_10px_40px_rgba(30,41,59,0.06)]",
      dashboardBorder: "border-slate-300",
      dashboardTitle: "text-slate-850 font-extrabold",
      dashboardSubtitle: "text-slate-650/90 font-bold",
      dashboardProgressBg: "bg-slate-200 border border-slate-300/50",
      dashboardProgressFill: "bg-gradient-to-r from-slate-600 to-[#64748b]",
      buttonTheme: "text-slate-900 bg-slate-100/75 border border-slate-300 hover:bg-slate-200",
      patternOpacity: "opacity-[0.025] bg-[url('/images/arabesque.png')] invert",
      cardBg: "bg-white/95 hover:bg-white",
      cardBorder: "border-slate-300 hover:border-slate-450 shadow-[0_4px_12px_rgba(100,116,139,0.03)]",
      cardText: "text-slate-950",
      cardSubtext: "text-slate-700/80",
      settingsBtn: "bg-slate-100/60 text-slate-900 hover:bg-slate-200 border-slate-200"
    }
  },
  crimson: {
    dark: {
      bg: "bg-gradient-to-br from-[#220404] via-[#450a0a] to-[#100101] text-white",
      headerBg: "bg-transparent border-white/5",
      headerBorder: "border-white/5",
      headerText: "text-white",
      headerSubtext: "text-red-300/80",
      dashboardBg: "bg-gradient-to-br from-[#080808] to-[#010101] border border-[#b91c1c] shadow-[0_10px_40px_rgba(0,0,0,0.5)]",
      dashboardBorder: "border-[#b91c1c]",
      dashboardTitle: "text-red-400",
      dashboardSubtitle: "text-white/70",
      dashboardProgressBg: "bg-[#2d0505]",
      dashboardProgressFill: "bg-gradient-to-r from-red-500 via-red-400 to-pink-400",
      buttonTheme: "text-red-100 bg-[#7f1d1d] border border-[#b91c1c] hover:border-red-400/50",
      patternOpacity: "opacity-[0.05] bg-[url('/images/arabesque.png')]",
      cardBg: "bg-[#010101]/90 hover:bg-[#070707]/90",
      cardBorder: "border-[#8c1c1c]",
      cardText: "text-white",
      cardSubtext: "text-red-100/75",
      settingsBtn: "bg-white/10 text-white hover:bg-white/20 border-white/10"
    },
    light: {
      bg: "bg-gradient-to-br from-[#fff5f5] via-[#ffccd1] to-[#ffa1ab] text-slate-800",
      headerBg: "bg-transparent border-red-900/10",
      headerBorder: "border-red-900/10",
      headerText: "text-red-950",
      headerSubtext: "text-red-800 font-bold",
      dashboardBg: "bg-gradient-to-br from-white via-[#fffafa] to-[#ffccd1] border border-red-200 shadow-[0_10px_40px_rgba(127,29,29,0.06)]",
      dashboardBorder: "border-red-200",
      dashboardTitle: "text-red-850 font-extrabold",
      dashboardSubtitle: "text-red-650/90 font-bold",
      dashboardProgressBg: "bg-red-100 border border-red-200/50",
      dashboardProgressFill: "bg-gradient-to-r from-red-600 to-[#ef4444]",
      buttonTheme: "text-red-900 bg-red-100/70 border border-red-200 hover:bg-red-200",
      patternOpacity: "opacity-[0.025] bg-[url('/images/arabesque.png')] invert",
      cardBg: "bg-white/95 hover:bg-white",
      cardBorder: "border-red-200 hover:border-red-350 shadow-[0_4px_12px_rgba(239,68,68,0.03)]",
      cardText: "text-red-950",
      cardSubtext: "text-red-850/80",
      settingsBtn: "bg-red-100/60 text-red-900 hover:bg-red-200 border-red-200/60"
    }
  }
};

interface SortableItemProps {
 habit: Habit;
 isDone: boolean;
 type: 'good' | 'bad' | 'repentance' | 'worship' | 'sunnah' | 'role_model' | 'heart';
 localTheme: LocalTheme;
 themeMode: 'light' | 'dark';
 onToggle: (id: string) => void;
 onOpenDetails: (habit: Habit) => void;
}

const SortableHabitItem = ({ habit, isDone, type, localTheme, themeMode, onToggle, onOpenDetails }: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: habit.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 0,
    opacity: isDragging ? 0.6 : 1,
  };

  const getThemeStyles = () => {
    const isDark = themeMode === 'dark';
    const config = THEME_CONFIGS[localTheme]?.[themeMode] || THEME_CONFIGS.default[themeMode];
    
    if (isDone) {
      if (isDark) {
        const bgBase = config.cardBg.split(' ').filter(c => !c.startsWith('hover:'))[0] || 'bg-[#0d3421]/40';
        const borderBase = config.cardBorder || 'border-white/10';
        return `${bgBase} ${borderBase} opacity-55 shadow-inner text-white/30 saturate-[0.6] transition-all duration-300`;
      } else {
        const bgBase = config.cardBg.split(' ').filter(c => !c.startsWith('hover:'))[0] || 'bg-white/60';
        const borderBase = config.cardBorder || 'border-slate-200';
        return `${bgBase} ${borderBase} opacity-65 shadow-inner text-slate-400 saturate-[0.6] transition-all duration-300`;
      }
    }

    return `${config.cardBg} ${config.cardBorder} ${config.cardText} shadow-md hover:shadow-xl transition-all duration-300`;
  };

  const getIconStyles = () => {
    if (isDone) {
      switch (type) {
        case 'good': return "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30";
        case 'worship': return "bg-sky-500 text-white shadow-lg shadow-sky-500/30";
        case 'sunnah': return "bg-teal-500 text-white shadow-lg shadow-teal-500/30";
        case 'repentance': return "bg-amber-500 text-white shadow-lg shadow-amber-500/30";
        case 'bad': return habit.isMajorSin ? "bg-red-700 text-white shadow-lg shadow-red-700/30" : "bg-red-400 text-white shadow-lg shadow-red-400/30";
        case 'role_model': return "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30";
        default: return "bg-slate-500 text-white";
      }
    }
    switch (type) {
      case 'good': return "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400";
      case 'worship': return "bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400";
      case 'sunnah': return "bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400";
      case 'repentance': return "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400";
      case 'bad': return habit.isMajorSin ? "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400" : "bg-red-50 dark:bg-red-900/20 text-red-400 dark:text-red-300";
      case 'role_model': return "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400";
      default: return "bg-slate-50 dark:bg-slate-800 text-slate-500";
    }
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group perspective-1000">
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.01, rotateX: 1 }}
        className={cn(
          "px-5 py-4 transition-all duration-300 relative overflow-hidden flex items-center gap-4 cursor-pointer rounded-3xl border backdrop-blur-sm",
          getThemeStyles()
        )}
      >
        {/* Toggle Checkbox - Smart Interactive Button */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onToggle(habit.id);
          }}
          className={cn(
            "w-11 h-11 rounded-2xl border-2 flex items-center justify-center transition-all duration-200 shrink-0 group/check relative overflow-hidden",
            isDone 
            ? "border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
            : themeMode === 'dark'
              ? "border-white/20 text-white/40 bg-white/5 hover:border-white/40 hover:text-white"
              : "border-slate-300 text-slate-400 bg-slate-100 hover:border-teal-500 hover:text-teal-600"
          )}
        >
          {isDone && <motion.div initial={{ scale: 0 }} animate={{ scale: 2 }} className="absolute inset-0 bg-white/10 rounded-full" />}
          <motion.div
            initial={false}
            animate={{ 
              scale: isDone ? 1 : 0.8,
              rotate: isDone ? 0 : -90,
              opacity: isDone ? 1 : 0.4
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {isDone ? <CheckCircle2 size={24} /> : <Circle size={24} className="group-hover/check:scale-110 transition-transform" />}
          </motion.div>
        </button>

        {/* Card Content */}
        <div className="flex-grow flex items-center gap-4 min-w-0" onClick={() => onOpenDetails(habit)}>
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transform transition-all duration-75 active:scale-[0.85] active:opacity-70 group-hover:scale-110 group-hover:rotate-3",
            getIconStyles()
          )}>
            {habit.icon}
          </div>
          
          <div className="flex-grow min-w-0 py-1">
            <div className="flex items-center gap-2 mb-0.5">
              <h4 className={cn("font-black text-lg truncate transition-all", 
                isDone 
                  ? themeMode === 'dark' ? "text-white/40 opacity-60" : "text-slate-400 opacity-60 line-through"
                  : themeMode === 'dark' ? "text-white" : "text-slate-900"
              )}>
                {habit.title}
              </h4>
              {habit.isMajorSin && !isDone && (
                <span className="px-1.5 py-0.5 rounded-lg bg-red-100 dark:bg-red-900/50 text-[9px] font-black text-red-600 dark:text-red-300 uppercase animate-pulse">كبيرة</span>
              )}
            </div>
            <p className={cn("text-[13px] line-clamp-1 font-medium leading-tight", 
              isDone 
                ? themeMode === 'dark' ? "text-white/30" : "text-slate-400/60"
                : themeMode === 'dark' ? "text-white/60" : "text-slate-500"
            )}>
              {habit.description}
            </p>
          </div>
        </div>

        {/* Drag Handle - Modern Style */}
        <div 
          {...attributes} 
          {...listeners}
          className={cn(
            "p-2 cursor-grab active:cursor-grabbing transition-all rounded-lg",
            "text-slate-300 hover:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800",
            "opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0"
          )}
        >
          <GripVertical size={18} />
        </div>

        {/* Completion Indicator Glow */}
        {isDone && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            className="absolute -right-4 -bottom-4 w-12 h-12 rounded-full blur-2xl pointer-events-none"
            style={{ 
              background: type === 'good' ? '#10b981' : 
                          type === 'worship' ? '#0ea5e9' : 
                          type === 'sunnah' ? '#8b5cf6' : 
                          type === 'repentance' ? '#f59e0b' : '#ef4444'
            }}
          />
        )}
      </motion.div>
    </div>
  );
};

export const BelieverInsights: React.FC = () => {
  const { navigate, goBack } = useSmartNavigation();
  const { progress, addQuranLog, updateQuranGoal, updateLastRead, incrementBaqiyatSalihat } = useAppContext();
  const [localTheme, setLocalTheme] = useState<LocalTheme>(() => {
    return (safeLocalStorageGetItem('believer_local_theme_v2') as LocalTheme) || 'default';
  });
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(() => {
    return (safeLocalStorageGetItem('believer_theme_mode') as 'light' | 'dark') || 'light';
  });
  const [quoteFont, setQuoteFont] = useState(() => {
    return safeLocalStorageGetItem('believer_quote_font') || 'Amiri';
  });
  const [quoteFontSize, setQuoteFontSize] = useState(() => {
    const saved = safeLocalStorageGetItem('believer_quote_font_size');
    return saved ? parseInt(saved, 10) : 24;
  });
  const currentTheme = THEME_CONFIGS[localTheme]?.[themeMode] || THEME_CONFIGS.default[themeMode];
 const [activeTab, setActiveTab] = useState<'good' | 'bad' | 'heart' | 'repentance' | 'worship' | 'sunnah' | 'role_model' | null>(null);
 const [habits, setHabits] = useState<Habit[]>(() => {
 const saved = safeLocalStorageGetItem('believer_habits_order_v2');
 const customSaved = safeLocalStorageGetItem('believer_custom_habits_v2');
 const customHabits = customSaved ? JSON.parse(customSaved) : [];
 const allHabits = [...INITIAL_HABITS, ...customHabits];

 if (saved) {
 const order = JSON.parse(saved);
 const orderedHabits = order.map((id: string) => allHabits.find(h => h.id === id)).filter(Boolean);
 
 // Find any habits in allHabits that are NOT in the saved order (e.g., newly added ones like Major Sins)
 const missingHabits = allHabits.filter(h => !order.includes(h.id));
 
 return [...orderedHabits, ...missingHabits];
 }
 return allHabits;
 });
 const [customHabits, setCustomHabits] = useState<Habit[]>(() => {
 const saved = safeLocalStorageGetItem('believer_custom_habits_v2');
 return saved ? JSON.parse(saved) : [];
 });
 const [completedHabits, setCompletedHabits] = useState<string[]>(() => {
 const saved = safeLocalStorageGetItem('believer_completed_habits_v2');
 return saved ? JSON.parse(saved) : [];
 });
 const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
 const [isAddingHabit, setIsAddingHabit] = useState(false);
 const [isSettingsOpen, setIsSettingsOpen] = useState(false);
 const [confirmReset, setConfirmReset] = useState(false);
 const [newHabit, setNewHabit] = useState({ title: '', description: '', impact: '' });
 const [habitCategory, setHabitCategory] = useState<'good' | 'bad' | 'worship' | 'repentance' | 'sunnah' | 'role_model'>('good');

 useEffect(() => {
   if (isAddingHabit) {
     const validCategories = ['good', 'bad', 'worship', 'repentance', 'sunnah', 'role_model'];
     if (activeTab && validCategories.includes(activeTab)) {
       setHabitCategory(activeTab as any);
     } else {
       setHabitCategory('good');
     }
   }
 }, [isAddingHabit, activeTab]);
  const [isDashboardExpanded, setIsDashboardExpanded] = useState(true);
 const [dailyWird, setDailyWird] = useState<boolean>(() => {
 const saved = safeLocalStorageGetItem('believer_daily_wird_date_v2');
 const today = new Date().toDateString();
 return saved === today;
 });

 const sensors = useSensors(
 useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
 useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
 );

 useEffect(() => {
 safeLocalStorageSetItem('believer_completed_habits_v2', JSON.stringify(completedHabits));
 }, [completedHabits]);

 useEffect(() => {
 safeLocalStorageSetItem('believer_habits_order_v2', JSON.stringify(habits.map(h => h.id)));
 }, [habits]);

 useEffect(() => {
 safeLocalStorageSetItem('believer_custom_habits_v2', JSON.stringify(customHabits));
 }, [customHabits]);

 useEffect(() => {
 safeLocalStorageSetItem('believer_local_theme_v2', localTheme);
 }, [localTheme]);

 
  const moveHabit = (id: string, direction: 'up' | 'down') => {
    setHabits(prev => {
      const habit = prev.find(h => h.id === id);
      if (!habit) return prev;
      
      const type = habit.type;
      const typeHabits = prev.filter(h => h.type === type);
      const index = typeHabits.findIndex(h => h.id === id);
      
      if (index === -1) return prev;
      if (direction === 'up' && index === 0) return prev;
      if (direction === 'down' && index === typeHabits.length - 1) return prev;
      
      const newTypeHabits = [...typeHabits];
      const targetIndex = index + (direction === 'up' ? -1 : 1);
      const temp = newTypeHabits[index];
      newTypeHabits[index] = newTypeHabits[targetIndex];
      newTypeHabits[targetIndex] = temp;
      
      const newHabits = [...prev];
      const typeIndices = prev.map((h, i) => h.type === type ? i : -1).filter(i => i !== -1);
      
      typeIndices.forEach((originalIndex, i) => {
        newHabits[originalIndex] = newTypeHabits[i];
      });
      
      return newHabits;
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
 const { active, over } = event;
 if (over && active.id !== over.id) {
 setHabits((items) => {
 const oldIndex = items.findIndex((i) => i.id === active.id);
 const newIndex = items.findIndex((i) => i.id === over.id);
 return arrayMove(items, oldIndex, newIndex);
 });
 }
 };

 const toggleHabit = (id: string) => {
 setCompletedHabits(prev => 
 prev.includes(id) ? prev.filter(h => h !== id) : [...prev, id]
 );
 };

 const addHabit = () => {
 if (!newHabit.title) return;
 const targetType = activeTab || habitCategory;
 const habit: Habit = {
 id: Date.now().toString(),
 title: newHabit.title,
 description: newHabit.description || 'عادة مخصصة',
 impact: newHabit.impact || 'تزكية للنفس وتقرب إلى الله',
 type: targetType as any,
 icon: targetType === 'good' ? <Plus size={24} /> : targetType === 'sunnah' ? <Star size={24} /> : targetType === 'worship' ? <Plus size={24} /> : targetType === 'bad' ? <Trash2 size={24} /> : targetType === 'role_model' ? <Users size={24} /> : <RotateCcw size={24} />
 };
 setCustomHabits(prev => [...prev, habit]);
 setHabits(prev => [...prev, habit]);
 setNewHabit({ title: '', description: '', impact: '' });
 setIsAddingHabit(false);
 };

 const deleteHabit = (id: string) => {
 setHabits(prev => prev.filter(h => h.id !== id));
 setCustomHabits(prev => prev.filter(h => h.id !== id));
 setCompletedHabits(prev => prev.filter(hId => hId !== id));
 setSelectedHabit(null);
 };

 const toggleWird = () => {
 const today = new Date().toDateString();
 if (dailyWird) {
 safeLocalStorageRemoveItem('believer_daily_wird_date_v2');
 setDailyWird(false);
 } else {
 safeLocalStorageSetItem('believer_daily_wird_date_v2', today);
 setDailyWird(true);
 }
 };

 const goodHabits = habits.filter(h => h.type === 'good');
 const badHabits = habits.filter(h => h.type === 'bad');
 const worshipHabits = habits.filter(h => h.type === 'worship');
 const sunnahHabits = habits.filter(h => h.type === 'sunnah');
 const repentanceHabits = habits.filter(h => h.type === 'repentance');
 const roleModelHabits = habits.filter(h => h.type === 'role_model');
 
 const completedGood = goodHabits.filter(h => completedHabits.includes(h.id)).length;
 const completedBad = badHabits.filter(h => completedHabits.includes(h.id)).length;
 const completedWorship = worshipHabits.filter(h => completedHabits.includes(h.id)).length;
 const completedSunnah = sunnahHabits.filter(h => completedHabits.includes(h.id)).length;
 const completedRepentance = repentanceHabits.filter(h => completedHabits.includes(h.id)).length;
 const completedRoleModel = roleModelHabits.filter(h => completedHabits.includes(h.id)).length;
  // Calculate total without heart habits
  const totalRelevantHabits = goodHabits.length + badHabits.length + worshipHabits.length + sunnahHabits.length + repentanceHabits.length + roleModelHabits.length;
  const totalRelevantCompleted = completedGood + completedBad + completedWorship + completedSunnah + completedRepentance + completedRoleModel;
  const totalProgress = totalRelevantHabits > 0 ? Math.round((totalRelevantCompleted / totalRelevantHabits) * 100) : 0;

  const quranProgress = progress.quranProgress || { logs: [], dailyGoal: 10 };
  const todayStr = new Date().toDateString();
  const todayLogs = quranProgress.logs.filter(log => new Date(log.date).toDateString() === todayStr);
  const todayTotalPages = todayLogs.reduce((acc, log) => {
    const multipliers = { page: 1, quarter: 2.5, eighth: 1.25, hizb: 10, juz: 20 };
    return acc + (log.amount * (multipliers[log.unit as keyof typeof multipliers] || 1));
  }, 0);
  const quranDailyProgress = Math.min(Math.round((todayTotalPages / quranProgress.dailyGoal) * 100), 100);

 return (
 <div className={cn(
 "w-full min-h-screen flex flex-col font-sans transition-all duration-300 relative",
 currentTheme.bg
 )}>
 {/* Background Pattern */}
 <div className={cn(
 "absolute inset-0 islamic-pattern pointer-events-none transition-opacity duration-500",
 currentTheme.patternOpacity
 )} />

 {/* Sticky Header - Title remains fixed at the top when scrolling or dragging cards */}
 <header className={cn(
 "sticky top-0 z-40 shrink-0 px-4 sm:px-6 py-3.5 sm:py-4.5 flex justify-between items-center transition-all duration-300 border-b backdrop-blur-xl shadow-lg",
 currentTheme.headerBg.includes('bg-transparent')
   ? (themeMode === 'dark' ? 'bg-slate-950/90 border-white/10' : 'bg-white/90 border-black/10')
   : currentTheme.headerBg
 )}>
 <div className="flex items-center gap-4">
 <BackButton forceFallback={true} />
 <div>
 <h1 className={cn(
  "text-3xl font-black tracking-tighter drop-shadow-[0_0_20px_rgba(251,191,36,0.6)]",
  currentTheme.headerText,
  "text-amber-400"
 )}>
  بصائر المؤمن
 </h1>
 <p className={cn(
  "text-[10px] font-black uppercase tracking-[0.25em] drop-shadow-[0_0_10px_rgba(251,191,36,0.4)] opacity-95",
  currentTheme.headerSubtext,
  "text-amber-300/90"
 )}>أبواب الخير وتزكية النفس</p>
 </div>
 </div>
 <div className="flex items-center gap-2">
 <button 
 onClick={() => setIsSettingsOpen(true)}
 className={cn(
 "w-10 h-10 rounded-xl flex items-center justify-center transform transition-all duration-75 active:scale-[0.85] active:opacity-70 border",
 currentTheme.settingsBtn
 )}
 >
 <Settings size={20} />
 </button>
 <button 
 onClick={() => setIsAddingHabit(true)}
 className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 transform transition-all duration-75 active:scale-[0.85] active:opacity-70"
 >
 <Plus size={20} />
 </button>
 </div>
 </header>

 <div className="flex-1 py-6 px-0 space-y-8 pb-24 relative z-10 max-w-4xl mx-auto w-full">
  {/* Character Progress Dashboard */}
  <div className={cn(
    "mx-4 sm:mx-6 p-4 sm:p-5 rounded-2xl sm:rounded-3xl relative overflow-hidden shadow-xl transition-all duration-300 border",
    currentTheme.dashboardBg
  )}>
    <div className={cn(
      "absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none",
      "bg-white/5"
    )} />
    <div className="relative z-10 space-y-3">
      {/* Compact Header Row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className={cn(
            "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-inner",
            themeMode === 'dark' ? "bg-white/10 text-amber-300" : "bg-black/5 text-amber-600"
          )}>
            <Zap size={20} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className={cn("font-black text-lg sm:text-xl leading-tight truncate", currentTheme.dashboardTitle)}>
                بناء الشخصية
              </h3>
              <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                {totalProgress}%
              </span>
            </div>
            <p className={cn("text-[10px] font-bold uppercase tracking-wider opacity-80 truncate", currentTheme.dashboardSubtitle)}>
              مستوى التزكية الحالي
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsDashboardExpanded(!isDashboardExpanded)}
          className={cn(
            "px-2.5 py-1.5 rounded-xl border transition-all duration-200 flex items-center gap-1.5 text-xs font-bold active:scale-95 shrink-0",
            themeMode === 'dark' 
              ? "bg-white/10 border-white/15 text-white/90 hover:bg-white/15" 
              : "bg-black/5 border-black/10 text-slate-700 hover:bg-black/10"
          )}
          title={isDashboardExpanded ? "إخفاء التفاصيل" : "عرض التفاصيل"}
        >
          <span className="text-[11px]">
            {isDashboardExpanded ? "موجز" : "تفاصيل"}
          </span>
          {isDashboardExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

     {/* Integrated Progress Bar */}
      <div className="space-y-1">
        <div className={cn("h-2.5 w-full rounded-full overflow-hidden p-0.5", currentTheme.dashboardProgressBg)}>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${totalProgress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={cn(
              "h-full rounded-full shadow-[0_0_10px_rgba(255,255,255,0.2)]",
              currentTheme.dashboardProgressFill === "bg-slate-850" ? "bg-slate-800 dark:bg-slate-200" : currentTheme.dashboardProgressFill
            )}
          />
        </div>
        <div className={cn("flex justify-between text-[10px] font-black uppercase tracking-tighter opacity-70", currentTheme.dashboardSubtitle)}>
          <span>بداية الطريق</span>
          <span>كمال التزكية</span>
        </div>
      </div>

      {/* Compact Categories Grid */}
      <AnimatePresence>
        {isDashboardExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden pt-1"
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {[
                { label: "العبادات", done: completedWorship, total: worshipHabits.length, color: "text-sky-300 border-sky-500/20 bg-sky-500/10" },
                { label: "الخير", done: completedGood, total: goodHabits.length, color: "text-emerald-300 border-emerald-500/20 bg-emerald-500/10" },
                { label: "السنن", done: completedSunnah, total: sunnahHabits.length, color: "text-teal-300 border-teal-500/20 bg-teal-500/10" },
                { label: "التوبة", done: completedRepentance, total: repentanceHabits.length, color: "text-amber-300 border-amber-500/20 bg-amber-500/10" },
                { label: "القدوة الحسنة", done: completedRoleModel, total: roleModelHabits.length, color: "text-indigo-300 border-indigo-500/20 bg-indigo-500/10" },
                { label: "الشر", done: completedBad, total: badHabits.length, color: "text-red-300 border-red-500/20 bg-red-500/10" },
              ].map((stat, i) => {
                const pct = stat.total > 0 ? Math.round((stat.done / stat.total) * 100) : 0;
                return (
                  <div 
                    key={i} 
                    className={cn(
                      "rounded-xl px-2.5 py-1.5 border shadow-sm flex flex-col justify-between backdrop-blur-md transition-all",
                      stat.color
                    )}
                  >
                    <div className="flex items-center justify-between text-[11px] font-black gap-1">
                      <span className="truncate">{stat.label}</span>
                      <span className="text-[10px] font-extrabold opacity-90 dir-ltr shrink-0">{stat.done}/{stat.total}</span>
                    </div>
                    <div className="w-full bg-black/20 h-1 rounded-full overflow-hidden mt-1">
                      <div 
                        className="h-full bg-current rounded-full transition-all duration-500 opacity-80"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </div>

  {/* Daily Wird Check */}
 <motion.div 
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 onClick={() => navigate('/quran-tracker')}
 className={cn(
 "mx-6 p-6 rounded-3xl border transition-all duration-500 relative overflow-hidden cursor-pointer active:scale-[0.98]",
 dailyWird 
 ? (localTheme === 'rose' ? "bg-[#0b0b0b] border-rose-500/50 text-white shadow-lg shadow-rose-500/20" :
 localTheme === 'midnight' ? "bg-[#0b0b0b] border-slate-500/50 text-white shadow-lg shadow-slate-900/50" :
 localTheme === 'crimson' ? "bg-[#0b0b0b] border-red-500/50 text-white shadow-lg shadow-red-900/50" :
 "bg-[#0b0b0b] border-indigo-500/50 text-white shadow-lg shadow-indigo-500/20")
 : themeMode === 'dark'
 ? "bg-[#0a0a0a] border-white/10 shadow-lg text-white/95 hover:bg-[#121212]"
 : "bg-white border-slate-200 shadow-md text-slate-800 hover:bg-slate-50"
 )}
 >
 <div className="flex items-center justify-between gap-4">
 <div className="flex items-center gap-4">
 <div className={cn(
"w-14 h-14 rounded-2xl flex items-center justify-center transform transition-all duration-75 active:scale-[0.85] active:opacity-70 relative",
 dailyWird ? "bg-white/20" : (themeMode === 'dark' ? "bg-white/10 text-white" : "bg-slate-100 text-slate-700")
 )}>
 {dailyWird ? (
 <div className="absolute inset-0 flex items-center justify-center">
 <svg className="w-full h-full transform -rotate-90">
 <circle
 cx="28"
 cy="28"
 r="24"
 stroke="currentColor"
 strokeWidth="3"
 fill="transparent"
 className="text-white/20"
 />
 <motion.circle
 cx="28"
 cy="28"
 r="24"
 stroke="currentColor"
 strokeWidth="3"
 strokeDasharray={150.8}
 initial={{ strokeDashoffset: 150.8 }}
 animate={{ strokeDashoffset: 150.8 - (150.8 * (quranDailyProgress / 100)) }}
 fill="transparent"
 strokeLinecap="round"
 className="text-white"
 />
 </svg>
 </div>
 ) : null}
 <BookOpen size={28} className="relative z-10" />
 </div>
 <div className="text-right">
 <h3 className={cn("font-black text-lg", themeMode === 'dark' || dailyWird ? "text-white" : "text-slate-900")}>
 الورد اليومي
 </h3>
 <div className="flex items-center gap-2">
 <p className={cn("text-xs font-bold", dailyWird ? "text-indigo-100" : (themeMode === 'dark' ? "text-white/60" : "text-slate-500"))}>
 {dailyWird ? `تم إنجاز ${quranDailyProgress}% من وردك` : "هل قرأت وردك اليوم؟"}
 </p>
 {dailyWird && (
 <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/20 font-black">
 {todayTotalPages} صفحة
 </span>
 )}
 </div>
 </div>
 </div>
 <button 
 onClick={(e) => {
 e.stopPropagation();
 toggleWird();
 }}
 className={cn(
"w-12 h-12 rounded-full flex items-center justify-center transform transition-all duration-75 active:scale-[0.85] active:opacity-70 shadow-sm",
 dailyWird ? "bg-white text-indigo-600" : (themeMode === 'dark' ? "bg-white/10 text-white/60 hover:text-white hover:bg-white/20 border border-white/10" : "bg-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-200 border border-slate-200")
 )}
 >
 {dailyWird ? <CheckCircle size={28} /> : <Circle size={28} />}
 </button>
 </div>
 </motion.div>

 {/* Al-Baqiyat Al-Salihat Card */}
 <motion.div 
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 className={cn(
   "mx-6 p-6 rounded-3xl border shadow-sm space-y-4",
   themeMode === 'dark'
     ? "bg-[#0c0c0c] border-white/20 shadow-lg text-white"
     : "bg-white border-slate-200 shadow-md text-slate-800"
 )}
 >
 <div className="flex items-center justify-between">
 <h3 className={cn("font-black text-lg flex items-center gap-2", themeMode === 'dark' ? "text-white" : "text-slate-900")}>
 <Sparkles size={20} className="text-amber-500" />
 الباقيات الصالحات
 </h3>
 <span className={cn("text-[10px] font-black uppercase tracking-widest", themeMode === 'dark' ? "text-white/60" : "text-slate-500")}>أذكار اليوم</span>
 </div>
 
 <div className="grid grid-cols-2 gap-3">
 {[
 { id: 'subhanAllah', label: 'سبحان الله', color: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-emerald-400 shadow-lg shadow-emerald-500/20' },
 { id: 'alhamdulillah', label: 'الحمد لله', color: 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-blue-400 shadow-lg shadow-blue-500/20' },
 { id: 'laIlahaIllaAllah', label: 'لا إله إلا الله', color: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white border-amber-400 shadow-lg shadow-amber-500/20' },
 { id: 'allahuAkbar', label: 'الله أكبر', color: 'bg-gradient-to-br from-rose-500 to-red-600 text-white border-rose-400 shadow-lg shadow-rose-500/20' },
 ].map((item) => (
 <button
 key={item.id}
 onClick={() => incrementBaqiyatSalihat(item.id as any)}
 className={cn(
 "p-4 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all duration-75 active:scale-[0.85] active:opacity-70",
 item.color
 )}
 >
 <span className="text-sm font-black">{item.label}</span>
 <span className="text-lg font-black">{(progress.baqiyatSalihat as any)?.[item.id] || 0}</span>
 </button>
 ))}
 </div>
 </motion.div>

 <div className="w-full px-4">
   <DailyQuotesWidget 
     localTheme={localTheme} 
     themeMode={themeMode} 
     selectedFont={quoteFont}
     setSelectedFont={setQuoteFont}
     fontSize={quoteFontSize}
     setFontSize={setQuoteFontSize}
     onOpenSettings={() => setIsSettingsOpen(true)}
   />
 </div>

 {/* Category Sections */}
 <div className="space-y-8 relative z-10 px-4">
   {/* Abwab Al-Khair (Green) */}
   <div className="space-y-4">
      <button 
       onClick={() => setActiveTab(activeTab === 'good' ? null : 'good')}
       className={cn(
         "w-full p-6 rounded-2xl text-white flex items-center justify-between shadow-2xl transition-all active:scale-[0.97] group relative overflow-hidden",
         "bg-gradient-to-br from-emerald-400 via-emerald-600 to-teal-700 shadow-emerald-500/30"
       )}
     >
       <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
       <div className="flex items-center gap-5 relative z-10">
         <div className="w-16 h-16 rounded-[1.5rem] bg-white/20 backdrop-blur-xl flex items-center justify-center shadow-inner border border-white/30 transform group-hover:rotate-6 transition-transform">
            <BookOpen size={30} className="text-white drop-shadow-lg" />
          </div>
         <div>
           <h3 className="text-2xl font-black tracking-tight text-right drop-shadow-sm">أبواب الخير</h3>
           <div className="flex items-center gap-2.5 mt-1.5 justify-end">
             <span className="text-[11px] font-black text-emerald-100 order-2">{completedGood}/{goodHabits.length} مكتمل</span>
             <div className="h-2 w-28 bg-black/20 rounded-full overflow-hidden order-1 border border-white/10">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${(completedGood / (goodHabits.length || 1)) * 100}%` }}
                 className="h-full bg-gradient-to-r from-white/60 to-white shadow-[0_0_10px_rgba(255,255,255,0.8)]"
               />
             </div>
           </div>
         </div>
       </div>
       <motion.div
         animate={{ rotate: activeTab === 'good' ? 180 : 0 }}
         className="bg-white/20 p-2 rounded-full backdrop-blur-md relative z-10"
       >
         <ChevronDown size={22} strokeWidth={3} />
       </motion.div>
     </button>
     <AnimatePresence>
       {activeTab === 'good' && (
         <motion.div
           initial={{ height: 0, opacity: 0 }}
           animate={{ height: "auto", opacity: 1 }}
           exit={{ height: 0, opacity: 0 }}
           className="overflow-hidden"
         >
           <div className="space-y-4 pt-2">
             <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
               <SortableContext items={goodHabits.map(h => h.id)} strategy={verticalListSortingStrategy}>
                 <div className="space-y-4">
                   {goodHabits.map((habit) => (
                     <SortableHabitItem 
                       key={habit.id} 
                       habit={habit} 
                       isDone={completedHabits.includes(habit.id)}
                       type="good" themeMode={themeMode}
                       localTheme={localTheme}
                       onToggle={toggleHabit}
                       onOpenDetails={setSelectedHabit}
                     />
                   ))}
                 </div>
               </SortableContext>
             </DndContext>
           </div>
         </motion.div>
       )}
     </AnimatePresence>
   </div>

      {/* Abwab Al-Shar (Red) */}
   <div className="space-y-4">
     <button 
       onClick={() => setActiveTab(activeTab === 'bad' ? null : 'bad')}
       className={cn(
         "w-full p-6 rounded-2xl text-white flex items-center justify-between shadow-2xl transition-all active:scale-[0.97] group relative overflow-hidden",
         "bg-gradient-to-br from-red-400 via-red-600 to-rose-700 shadow-red-500/30"
       )}
     >
       <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
       <div className="flex items-center gap-5 relative z-10">
         <div className="w-16 h-16 rounded-[1.5rem] bg-white/20 backdrop-blur-xl flex items-center justify-center shadow-inner border border-white/30 transform group-hover:rotate-6 transition-transform">
            <Shield size={30} className="text-white drop-shadow-lg" />
          </div>
         <div>
           <h3 className="text-2xl font-black tracking-tight text-right drop-shadow-sm">أبواب الشر</h3>
           <div className="flex items-center gap-2.5 mt-1.5 justify-end">
             <span className="text-[11px] font-black text-red-100 order-2">{completedBad}/{badHabits.length} مكتمل</span>
             <div className="h-2 w-28 bg-black/20 rounded-full overflow-hidden order-1 border border-white/10">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${(completedBad / (badHabits.length || 1)) * 100}%` }}
                 className="h-full bg-gradient-to-r from-white/60 to-white shadow-[0_0_10px_rgba(255,255,255,0.8)]"
               />
             </div>
           </div>
         </div>
       </div>
       <motion.div
         animate={{ rotate: activeTab === 'bad' ? 180 : 0 }}
         className="bg-white/20 p-2 rounded-full backdrop-blur-md relative z-10"
       >
         <ChevronDown size={22} strokeWidth={3} />
       </motion.div>
     </button>
     <AnimatePresence>
       {activeTab === 'bad' && (
         <motion.div
           initial={{ height: 0, opacity: 0 }}
           animate={{ height: "auto", opacity: 1 }}
           exit={{ height: 0, opacity: 0 }}
           className="overflow-hidden"
         >
           <div className="space-y-4 pt-2">
             <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
               <SortableContext items={badHabits.map(h => h.id)} strategy={verticalListSortingStrategy}>
                 <div className="space-y-4">
                   {badHabits.map((habit) => (
                     <SortableHabitItem 
                       key={habit.id} 
                       habit={habit} 
                       isDone={completedHabits.includes(habit.id)}
                       type="bad" themeMode={themeMode}
                       localTheme={localTheme}
                       onToggle={toggleHabit}
                       onOpenDetails={setSelectedHabit}
                     />
                   ))}
                 </div>
               </SortableContext>
             </DndContext>
           </div>
         </motion.div>
       )}
     </AnimatePresence>
   </div>

    {/* Worships (Sky) */}
    <div className="space-y-4">
      <button 
        onClick={() => setActiveTab(activeTab === 'worship' ? null : 'worship')}
        className={cn(
          "w-full p-6 rounded-2xl text-white flex items-center justify-between shadow-2xl transition-all active:scale-[0.97] group relative overflow-hidden",
          "bg-gradient-to-br from-sky-400 via-sky-600 to-blue-800 shadow-sky-500/30"
        )}
      >
        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="flex items-center gap-5 relative z-10">
          <div className="w-16 h-16 rounded-[1.5rem] bg-white/20 backdrop-blur-xl flex items-center justify-center shadow-inner border border-white/30 transform group-hover:rotate-6 transition-transform">
             <Star size={30} className="text-white drop-shadow-lg" />
           </div>
          <div>
            <h3 className="text-2xl font-black tracking-tight text-right drop-shadow-sm">العبادات</h3>
            <div className="flex items-center gap-2.5 mt-1.5 justify-end">
              <span className="text-[11px] font-black text-sky-100 order-2">{completedWorship}/{worshipHabits.length} مكتمل</span>
              <div className="h-2 w-28 bg-black/20 rounded-full overflow-hidden order-1 border border-white/10">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(completedWorship / (worshipHabits.length || 1)) * 100}%` }}
                  className="h-full bg-gradient-to-r from-white/60 to-white shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                />
              </div>
            </div>
          </div>
        </div>
        <motion.div
          animate={{ rotate: activeTab === 'worship' ? 180 : 0 }}
          className="bg-white/20 p-2 rounded-full backdrop-blur-md relative z-10"
        >
          <ChevronDown size={22} strokeWidth={3} />
        </motion.div>
      </button>
      <AnimatePresence>
        {activeTab === 'worship' && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-4 pt-2">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={worshipHabits.map(h => h.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-4">
                    {worshipHabits.map((habit) => (
                      <SortableHabitItem 
                        key={habit.id} 
                        habit={habit} 
                        isDone={completedHabits.includes(habit.id)}
                        type="worship"
                        localTheme={localTheme}
                        themeMode={themeMode}
                        onToggle={toggleHabit}
                        onOpenDetails={setSelectedHabit}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>

    {/* Repentance (Amber) */}
    <div className="space-y-4">
      <button 
        onClick={() => setActiveTab(activeTab === 'repentance' ? null : 'repentance')}
        className={cn(
          "w-full p-6 rounded-2xl text-white flex items-center justify-between shadow-2xl transition-all active:scale-[0.97] group relative overflow-hidden",
          "bg-gradient-to-br from-amber-400 via-amber-600 to-orange-700 shadow-amber-500/30"
        )}
      >
        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="flex items-center gap-5 relative z-10">
          <div className="w-16 h-16 rounded-[1.5rem] bg-white/20 backdrop-blur-xl flex items-center justify-center shadow-inner border border-white/30 transform group-hover:rotate-6 transition-transform">
             <RotateCcw size={30} className="text-white drop-shadow-lg" />
           </div>
          <div>
            <h3 className="text-2xl font-black tracking-tight text-right drop-shadow-sm">التوبة</h3>
            <div className="flex items-center gap-2.5 mt-1.5 justify-end">
              <span className="text-[11px] font-black text-amber-100 order-2">{completedRepentance}/{repentanceHabits.length} مكتمل</span>
              <div className="h-2 w-28 bg-black/20 rounded-full overflow-hidden order-1 border border-white/10">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(completedRepentance / (repentanceHabits.length || 1)) * 100}%` }}
                  className="h-full bg-gradient-to-r from-white/60 to-white shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                />
              </div>
            </div>
          </div>
        </div>
        <motion.div
          animate={{ rotate: activeTab === 'repentance' ? 180 : 0 }}
          className="bg-white/20 p-2 rounded-full backdrop-blur-md relative z-10"
        >
          <ChevronDown size={22} strokeWidth={3} />
        </motion.div>
      </button>
      <AnimatePresence>
        {activeTab === 'repentance' && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-4 pt-2">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={repentanceHabits.map(h => h.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-4">
                    {repentanceHabits.map((habit) => (
                      <SortableHabitItem 
                        key={habit.id} 
                        habit={habit} 
                        isDone={completedHabits.includes(habit.id)}
                        type="repentance"
                        localTheme={localTheme}
                        themeMode={themeMode}
                        onToggle={toggleHabit}
                        onOpenDetails={setSelectedHabit}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>

    {/* Nawafil and Sunnah (Teal) */}
    <div className="space-y-4">
      <button 
        onClick={() => setActiveTab(activeTab === 'sunnah' ? null : 'sunnah')}
        className={cn(
          "w-full p-6 rounded-2xl text-white flex items-center justify-between shadow-2xl transition-all active:scale-[0.97] group relative overflow-hidden",
          "bg-gradient-to-br from-teal-400 via-teal-600 to-emerald-800 shadow-teal-500/30"
        )}
      >
        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="flex items-center gap-5 relative z-10">
          <div className="w-16 h-16 rounded-[1.5rem] bg-white/20 backdrop-blur-xl flex items-center justify-center shadow-inner border border-white/30 transform group-hover:rotate-6 transition-transform">
             <Sparkles size={30} className="text-white drop-shadow-lg" />
           </div>
          <div>
            <h3 className="text-2xl font-black tracking-tight text-right drop-shadow-sm">النوافل والسنن</h3>
            <div className="flex items-center gap-2.5 mt-1.5 justify-end">
              <span className="text-[11px] font-black text-teal-100 order-2">{completedSunnah}/{sunnahHabits.length} مكتمل</span>
              <div className="h-2 w-28 bg-black/20 rounded-full overflow-hidden order-1 border border-white/10">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(completedSunnah / (sunnahHabits.length || 1)) * 100}%` }}
                  className="h-full bg-gradient-to-r from-white/60 to-white shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                />
              </div>
            </div>
          </div>
        </div>
        <motion.div
          animate={{ rotate: activeTab === 'sunnah' ? 180 : 0 }}
          className="bg-white/20 p-2 rounded-full backdrop-blur-md relative z-10"
        >
          <ChevronDown size={22} strokeWidth={3} />
        </motion.div>
      </button>
      <AnimatePresence>
        {activeTab === 'sunnah' && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-4 pt-2">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={sunnahHabits.map(h => h.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-4">
                    {sunnahHabits.map((habit) => (
                      <SortableHabitItem 
                        key={habit.id} 
                        habit={habit} 
                        isDone={completedHabits.includes(habit.id)}
                        type="sunnah"
                        localTheme={localTheme}
                        themeMode={themeMode}
                        onToggle={toggleHabit}
                        onOpenDetails={setSelectedHabit}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>

    {/* Role Models (Indigo) */}
    <div className="space-y-4">
      <button 
        onClick={() => setActiveTab(activeTab === 'role_model' ? null : 'role_model')}
        className={cn(
          "w-full p-6 rounded-2xl text-white flex items-center justify-between shadow-2xl transition-all active:scale-[0.97] group relative overflow-hidden",
          "bg-gradient-to-br from-indigo-400 via-indigo-600 to-blue-800 shadow-indigo-500/30"
        )}
      >
        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="flex items-center gap-5 relative z-10">
          <div className="w-16 h-16 rounded-[1.5rem] bg-white/20 backdrop-blur-xl flex items-center justify-center shadow-inner border border-white/30 transform group-hover:rotate-6 transition-transform">
            <Users size={30} className="text-white drop-shadow-lg" />
          </div>
          <div>
            <h3 className="text-2xl font-black tracking-tight text-right drop-shadow-sm">القدوة الحسنة</h3>
            <div className="flex items-center gap-2.5 mt-1.5 justify-end">
              <span className="text-[11px] font-black text-indigo-100 order-2">{completedRoleModel}/{roleModelHabits.length} مكتمل</span>
              <div className="h-2 w-28 bg-black/20 rounded-full overflow-hidden order-1 border border-white/10">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(completedRoleModel / (roleModelHabits.length || 1)) * 100}%` }}
                  className="h-full bg-gradient-to-r from-white/60 to-white shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                />
              </div>
            </div>
          </div>
        </div>
        <motion.div
          animate={{ rotate: activeTab === 'role_model' ? 180 : 0 }}
          className="bg-white/20 p-2 rounded-full backdrop-blur-md relative z-10"
        >
          <ChevronDown size={22} strokeWidth={3} />
        </motion.div>
      </button>
      <AnimatePresence>
        {activeTab === 'role_model' && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-4 pt-2">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={roleModelHabits.map(h => h.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-4">
                    {roleModelHabits.map((habit) => (
                      <SortableHabitItem 
                        key={habit.id} 
                        habit={habit} 
                        isDone={completedHabits.includes(habit.id)}
                        type="role_model"
                        localTheme={localTheme}
                        themeMode={themeMode}
                        onToggle={toggleHabit}
                        onOpenDetails={setSelectedHabit}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>

  </div>

 {/* Habits list is now integrated above */}
 </div>

 {typeof document !== 'undefined' && createPortal(
   <>
     {/* Add Habit Popup */}
     <AnimatePresence>
     {isAddingHabit && (
 <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 onClick={() => setIsAddingHabit(false)}
 className="absolute inset-0 bg-slate-900/60 "
 />
 <motion.div
 initial={{ scale: 0.9, opacity: 0 }}
 animate={{ scale: 1, opacity: 1 }}
 exit={{ scale: 0.9, opacity: 0 }}
 className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-6"
 >
 <div className="space-y-2 text-center">
 <h3 className="text-xl font-black text-slate-900 dark:text-white">إضافة باب جديد</h3>
 <p className="text-sm text-slate-500">أضف عادة مخصصة تريد تتبعها</p>
 </div>
 
 <div className="space-y-4">
 <div className="space-y-1.5 text-right">
 <label className="text-xs font-black text-slate-500">اختر القسم المناسب:</label>
 <select 
 value={habitCategory} 
 onChange={e => setHabitCategory(e.target.value as any)}
 className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-emerald-500 text-sm font-bold text-slate-850 dark:text-white"
 >
 <option value="good">أبواب الخير</option>
 <option value="bad">أبواب الشر</option>
 <option value="worship">العبادات</option>
 <option value="repentance">التوبة</option>
 <option value="sunnah">النوافل والسنن</option>
 <option value="role_model">القدوة الحسنة</option>
 </select>
 </div>
 <input 
 type="text" 
 placeholder="عنوان الباب (مثلاً: الصبر)"
 value={newHabit.title}
 onChange={e => setNewHabit({...newHabit, title: e.target.value})}
 className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-emerald-500 text-sm font-bold"
 />
 <textarea 
 placeholder="وصف مختصر..."
 value={newHabit.description}
 onChange={e => setNewHabit({...newHabit, description: e.target.value})}
 className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-emerald-500 text-sm font-bold h-24 resize-none"
 />
 </div>

 <div className="flex gap-3">
 <button 
 onClick={() => setIsAddingHabit(false)}
 className="flex-1 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-black text-sm"
 >
 إلغاء
 </button>
 <button 
 onClick={addHabit}
 className="flex-1 py-4 rounded-2xl bg-emerald-600 text-white font-black text-sm shadow-lg shadow-emerald-600/20"
 >
 إضافة
 </button>
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>

 {/* Settings Popup */}
 <AnimatePresence>
 {isSettingsOpen && (
 <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 onClick={() => setIsSettingsOpen(false)}
 className="absolute inset-0 bg-slate-900/60 "
 />
 <motion.div
 initial={{ scale: 0.9, opacity: 0, y: 20 }}
 animate={{ scale: 1, opacity: 1, y: 0 }}
 exit={{ scale: 0.9, opacity: 0, y: 20 }}
 className={cn(
 "relative w-full max-w-md rounded-2xl p-6 shadow-2xl flex flex-col max-h-[80vh]",
 "bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800"
 )}
 >
 <div className="flex justify-between items-center mb-6">
 <div>
 <h3 className={cn("text-xl font-black", "text-slate-900 dark:text-white")}>الإعدادات</h3>
 <p className={cn("text-xs", "text-slate-500")}>تخصيص تجربة بصائر المؤمن</p>
 </div>
 <button 
 onClick={() => setIsSettingsOpen(false)} 
 className="w-10 h-10 bg-rose-500 text-white rounded-full flex items-center justify-center hover:bg-rose-600 transform transition-all duration-75 active:scale-[0.85] active:opacity-70 shadow-lg shadow-rose-500/20"
 >
 <X size={20} />
 </button>
 </div>

 <div className="space-y-4 overflow-y-auto custom-scrollbar pr-2">
 {/* Setting Item: Theme Selector */}
 <div className={cn(
 "p-4 rounded-2xl border space-y-3",
 "border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50"
 )}>
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
 <Sparkles size={20} />
 </div>
 <div>
 <h4 className={cn("font-bold text-sm", "text-slate-900 dark:text-white")}>ثيم القسم</h4>
 <p className={cn("text-[10px]", "text-slate-500")}>اختر مظهراً يناسب ذوقك</p>
 </div>
 </div>
 
 <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
 {LOCAL_THEMES.map((theme) => (
 <button
 key={theme.id}
 onClick={() => setLocalTheme(theme.id)}
 className={cn(
 "shrink-0 w-16 flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all",
 localTheme === theme.id 
 ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20" 
 : "border-transparent hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
 )}
 >
 <div className={cn("w-8 h-8 rounded-full shadow-inner", theme.color)} />
 <span className={cn(
 "text-[9px] font-bold text-center",
 localTheme === theme.id 
 ? "text-emerald-700 dark:text-emerald-400"
 : "text-slate-500"
 )}>{theme.name}</span>
 </button>
 ))}
 </div>
 </div>

 
            {/* Setting Item: Quotes Typography Settings */}
            <div className={cn(
              "p-4 rounded-2xl border space-y-4",
              "border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50"
            )}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                  <BookOpen size={20} />
                </div>
                <div>
                  <h4 className={cn("font-bold text-sm", "text-slate-900 dark:text-white")}>خط بطاقة الآيات والأحاديث</h4>
                  <p className={cn("text-[10px]", "text-slate-500")}>تخصيص نوع وحجم خط البطاقات والمشاركة</p>
                </div>
              </div>

              {/* Font Family Selector */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">نوع الخط:</span>
                <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar scrollbar-none snap-x">
                  {FONTS_LIST.map((font) => (
                    <button
                      key={font.id}
                      onClick={() => setQuoteFont(font.id)}
                      className={cn(
                        "px-3.5 py-2 rounded-xl border text-xs font-bold transition-all shrink-0 snap-center flex flex-col items-center gap-1 min-w-[100px]",
                        quoteFont === font.id
                          ? "bg-teal-600 border-teal-600 text-white shadow-md shadow-teal-600/20"
                          : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-teal-500/30"
                      )}
                    >
                      <span className="text-[10px] opacity-60 font-sans">Aa</span>
                      <span style={{ fontFamily: font.family }} className="text-xs font-medium">{font.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Size Selector */}
              <div className="flex items-center justify-between gap-4 border-t border-slate-100 dark:border-slate-800 pt-3">
                <div className="flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">حجم خط الآيات والأحاديث:</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">انقر للتكبير والتصغير</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setQuoteFontSize(Math.max(16, quoteFontSize - 2))}
                    disabled={quoteFontSize <= 16}
                    className="w-9 h-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 font-bold hover:border-teal-500/30 active:scale-95 transition-all disabled:opacity-40 shadow-sm"
                    title="تصغير الخط"
                  >
                    أ-
                  </button>
                  <span className="text-xs font-black font-mono text-slate-800 dark:text-slate-200 min-w-[40px] text-center">
                    {quoteFontSize}px
                  </span>
                  <button
                    onClick={() => setQuoteFontSize(Math.min(36, quoteFontSize + 2))}
                    disabled={quoteFontSize >= 36}
                    className="w-9 h-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 font-bold hover:border-teal-500/30 active:scale-95 transition-all disabled:opacity-40 shadow-sm"
                    title="تكبير الخط"
                  >
                    أ+
                  </button>
                </div>
              </div>
            </div>

            {/* Setting Item: Reorder Good Habits */}
            <div className={cn(
              "p-4 rounded-2xl border space-y-3",
              "border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50"
            )}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h4 className={cn("font-bold text-sm", "text-slate-900 dark:text-white")}>ترتيب أبواب الخير</h4>
                  <p className={cn("text-[10px]", "text-slate-500")}>تخصيص ترتيب البطاقات حسب رغبتك</p>
                </div>
              </div>
              
              <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                {habits.filter(h => h.type === 'good').map((habit, index, array) => (
                  <div key={habit.id} className="flex items-center justify-between bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className="text-slate-400 shrink-0">{habit.icon}</div>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{habit.title}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0" dir="ltr">
                      <button 
                        onClick={() => moveHabit(habit.id, 'up')}
                        disabled={index === 0}
                        className={cn(
                          "p-2 rounded-xl transition-all duration-200",
                          "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700",
                          "shadow-[0_3px_0_0_#e2e8f0] dark:shadow-[0_3px_0_0_#1e293b]",
                          "hover:shadow-[0_2px_0_0_#e2e8f0] dark:hover:shadow-[0_2px_0_0_#1e293b] hover:translate-y-[1px]",
                          "active:shadow-none active:translate-y-[3px]",
                          "text-slate-600 dark:text-slate-300",
                          "disabled:opacity-30 disabled:shadow-none disabled:translate-y-0 disabled:hover:translate-y-0"
                        )}
                      >
                        <ChevronUp size={20} strokeWidth={3} />
                      </button>
                      <button 
                        onClick={() => moveHabit(habit.id, 'down')}
                        disabled={index === array.length - 1}
                        className={cn(
                          "p-2 rounded-xl transition-all duration-200",
                          "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700",
                          "shadow-[0_3px_0_0_#e2e8f0] dark:shadow-[0_3px_0_0_#1e293b]",
                          "hover:shadow-[0_2px_0_0_#e2e8f0] dark:hover:shadow-[0_2px_0_0_#1e293b] hover:translate-y-[1px]",
                          "active:shadow-none active:translate-y-[3px]",
                          "text-slate-600 dark:text-slate-300",
                          "disabled:opacity-30 disabled:shadow-none disabled:translate-y-0 disabled:hover:translate-y-0"
                        )}
                      >
                        <ChevronDown size={20} strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Setting Item: Reorder Bad Habits */}
            <div className={cn(
              "p-4 rounded-2xl border space-y-3",
              "border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50"
            )}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center">
                  <Layers size={20} />
                </div>
                <div>
                  <h4 className={cn("font-bold text-sm", "text-slate-900 dark:text-white")}>ترتيب أبواب الشر</h4>
                  <p className={cn("text-[10px]", "text-slate-500")}>تخصيص ترتيب البطاقات حسب رغبتك</p>
                </div>
              </div>
              
              <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                {habits.filter(h => h.type === 'bad').map((habit, index, array) => (
                  <div key={habit.id} className="flex items-center justify-between bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className="text-slate-400 shrink-0">{habit.icon}</div>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{habit.title}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0" dir="ltr">
                      <button 
                        onClick={() => moveHabit(habit.id, 'up')}
                        disabled={index === 0}
                        className={cn(
                          "p-2 rounded-xl transition-all duration-200",
                          "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700",
                          "shadow-[0_3px_0_0_#e2e8f0] dark:shadow-[0_3px_0_0_#1e293b]",
                          "hover:shadow-[0_2px_0_0_#e2e8f0] dark:hover:shadow-[0_2px_0_0_#1e293b] hover:translate-y-[1px]",
                          "active:shadow-none active:translate-y-[3px]",
                          "text-slate-600 dark:text-slate-300",
                          "disabled:opacity-30 disabled:shadow-none disabled:translate-y-0 disabled:hover:translate-y-0"
                        )}
                      >
                        <ChevronUp size={20} strokeWidth={3} />
                      </button>
                      <button 
                        onClick={() => moveHabit(habit.id, 'down')}
                        disabled={index === array.length - 1}
                        className={cn(
                          "p-2 rounded-xl transition-all duration-200",
                          "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700",
                          "shadow-[0_3px_0_0_#e2e8f0] dark:shadow-[0_3px_0_0_#1e293b]",
                          "hover:shadow-[0_2px_0_0_#e2e8f0] dark:hover:shadow-[0_2px_0_0_#1e293b] hover:translate-y-[1px]",
                          "active:shadow-none active:translate-y-[3px]",
                          "text-slate-600 dark:text-slate-300",
                          "disabled:opacity-30 disabled:shadow-none disabled:translate-y-0 disabled:hover:translate-y-0"
                        )}
                      >
                        <ChevronDown size={20} strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Setting Item: Notifications (Coming Soon) */}
 <div className={cn(
 "p-4 rounded-2xl border flex items-center justify-between opacity-70",
 "border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50"
 )}>
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
 <Bell size={20} />
 </div>
 <div>
 <h4 className={cn("font-bold text-sm", "text-slate-900 dark:text-white")}>التذكير اليومي</h4>
 <p className={cn("text-[10px]", "text-slate-500")}>تنبيه لمراجعة البصائر</p>
 </div>
 </div>
 <span className="text-[9px] font-black bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded-full">قريباً</span>
 </div>

 {/* Setting Item: Display Mode (Mock) */}
 <div className={cn(
 "p-4 rounded-2xl border flex items-center justify-between opacity-70",
 "border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50"
 )}>
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
 <Layout size={20} />
 </div>
 <div>
 <h4 className={cn("font-bold text-sm", "text-slate-900 dark:text-white")}>المظهر المدمج</h4>
 <p className={cn("text-[10px]", "text-slate-500")}>تصغير حجم البطاقات</p>
 </div>
 </div>
 <div className="w-10 h-6 bg-slate-200 dark:bg-slate-700 rounded-full relative cursor-not-allowed">
 <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1 shadow-sm"></div>
 </div>
 </div>

 {/* Setting Item: Reset Progress */}
 <div className={cn(
 "p-4 rounded-2xl border flex items-center justify-between",
 "border-rose-100 dark:border-rose-900/30 bg-rose-50/50 dark:bg-rose-900/10"
 )}>
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center">
 <RotateCcw size={20} />
 </div>
 <div>
 <h4 className="font-bold text-sm text-rose-600 dark:text-rose-400">تصفير الإنجازات</h4>
 <p className="text-[10px] text-rose-500/70">مسح جميع العادات المكتسبة</p>
 </div>
 </div>
 <button 
 onClick={() => {
 if(confirmReset) {
 setCompletedHabits([]);
 setConfirmReset(false);
 setIsSettingsOpen(false);
 } else {
 setConfirmReset(true);
 setTimeout(() => setConfirmReset(false), 3000);
 }
 }}
 className={cn(
"px-4 py-2 rounded-xl text-xs font-black transition-all transform transition-all duration-75 active:scale-[0.95] active:opacity-80", 
 confirmReset ? "bg-rose-600 text-white shadow-lg shadow-rose-600/20" : "bg-rose-200 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300"
 )}
 >
 {confirmReset ? "تأكيد؟" : "تصفير"}
 </button>
 </div>

 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>

 {/* Habit Details Popup */}
 <AnimatePresence>
 {selectedHabit && (
 <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 text-right" dir="rtl">
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 onClick={() => setSelectedHabit(null)}
 className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
 />
 <motion.div
 initial={{ scale: 0.9, opacity: 0, y: 30 }}
 animate={{ scale: 1, opacity: 1, y: 0 }}
 exit={{ scale: 0.9, opacity: 0, y: 30 }}
 className="relative w-full max-w-[340px] bg-white dark:bg-slate-900 rounded-[1.75rem] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] border border-slate-100 dark:border-slate-800 flex flex-col"
 >
 {/* Popup Header - Cinematic Style */}
 <div className={cn(
 "p-4 text-white relative overflow-hidden",
 selectedHabit.type === 'good' ? "bg-gradient-to-br from-emerald-500 to-emerald-700" : 
 selectedHabit.type === 'repentance' ? "bg-gradient-to-br from-amber-500 to-orange-700" :
 selectedHabit.type === 'sunnah' ? "bg-gradient-to-br from-teal-500 to-teal-700" :
 selectedHabit.type === 'worship' ? "bg-gradient-to-br from-sky-400 to-blue-700" :
 selectedHabit.isMajorSin ? "bg-gradient-to-br from-red-600 to-red-800" : "bg-gradient-to-br from-rose-500 to-rose-700"
 )}>
 <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 animate-pulse" />
 <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-2xl -ml-8 -mb-8" />
 
 <div className="flex justify-between items-start relative z-10">
 <div className="flex flex-col gap-4">
   <div className="w-14 h-14 rounded-[1.25rem] bg-white/20 backdrop-blur-md flex items-center justify-center shadow-xl border border-white/30">
     {React.cloneElement(selectedHabit.icon as React.ReactElement<any>, { size: 28, className: "text-white" })}
   </div>
   <div>
     <h3 className="text-2xl font-black drop-shadow-md leading-tight">{selectedHabit.title}</h3>
     <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/10 mt-2">
       <Sparkles size={10} className="text-white animate-pulse" />
       <span className="text-white/90 text-[10px] font-black uppercase tracking-widest leading-none">
       {selectedHabit.type === 'good' ? 'باب خير' : 
        selectedHabit.type === 'repentance' ? 'توبة وإنابة' :
        selectedHabit.type === 'sunnah' || selectedHabit.type === 'worship' ? 'نافلة وسنة' :
        selectedHabit.isMajorSin ? 'من الكبائر' : 'باب سيئة'}
       </span>
     </div>
   </div>
 </div>
 <button 
 onClick={() => setSelectedHabit(null)}
 className="w-10 h-10 bg-rose-500 text-white rounded-full flex items-center justify-center hover:bg-rose-600 transform transition-all duration-75 active:scale-[0.85] active:opacity-70 shadow-lg shadow-rose-500/20"
 >
 <X size={20} />
 </button>
 </div>
 </div>

 {/* Popup Content - Information Rich */}
 <div className="p-4 space-y-4 flex-1 overflow-y-auto max-h-[42vh] custom-scrollbar">
 <div className="space-y-3">
 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
   <div className="w-1 h-3 bg-indigo-500 rounded-full" />
   تعريف الباب
 </h4>
 <p className="text-[15px] text-slate-700 dark:text-slate-200 font-bold leading-relaxed pr-3">
 {selectedHabit.description}
 </p>
 </div>

 <div className="space-y-4">
 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
   <div className={cn("w-1 h-3 rounded-full", selectedHabit.type === 'good' ? "bg-emerald-500" : "bg-rose-500")} />
   الأثر الإيماني والثمرة
 </h4>
 <div className="p-5 rounded-[1.5rem] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border border-slate-200/50 dark:border-slate-800 shadow-inner group overflow-hidden relative">
   <div className="absolute top-0 right-0 w-2 h-full bg-indigo-500/10" />
   <p className="text-sm font-bold text-slate-700 dark:text-slate-200 leading-relaxed text-right">
     {selectedHabit.impact}
   </p>
 </div>
 </div>

 {selectedHabit.hadith && (
 <div className="relative p-6 rounded-[1.5rem] bg-amber-50/40 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 overflow-hidden text-right">
   <div className="absolute -top-4 -left-4 text-amber-200/50 dark:text-amber-900/30 font-serif text-8xl leading-none">"</div>
   <p className="italic text-[13px] text-amber-900 dark:text-amber-300 text-center leading-relaxed relative z-10 font-bold">
   {selectedHabit.hadith}
   </p>
 </div>
 )}

 {selectedHabit.details && (
   <div className="space-y-3">
     <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
       <div className="w-1 h-3 bg-teal-500 rounded-full" />
       تفاصيل إضافية
     </h4>
     <p className="text-[13px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed pr-3">
       {selectedHabit.details}
     </p>
   </div>
 )}
 </div>

 {/* Popup Footer - Modern Smart Actions */}
 <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-3">
 {customHabits.some(h => h.id === selectedHabit.id) && (
 <button 
 onClick={() => {
   if (confirm("هل أنت متأكد من حذف هذه العادة المخصصة؟")) {
     deleteHabit(selectedHabit.id);
   }
 }}
 className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 flex items-center justify-center transform transition-all duration-75 active:scale-[0.85] active:opacity-70"
 title="حذف العادة"
 >
 <Trash2 size={24} />
 </button>
 )}
 <button 
 onClick={() => {
 toggleHabit(selectedHabit.id);
 setSelectedHabit(null);
 }}
 className={cn(
 "flex-1 py-4 rounded-[1.5rem] font-black text-sm shadow-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-3",
 completedHabits.includes(selectedHabit.id)
 ? "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-500 shadow-none border border-slate-200 dark:border-slate-700"
 : (selectedHabit.type === 'good' ? "bg-emerald-600 text-white shadow-emerald-500/40" : 
    selectedHabit.type === 'repentance' ? "bg-amber-600 text-white shadow-amber-500/40" :
    selectedHabit.type === 'sunnah' || selectedHabit.type === 'worship' ? "bg-violet-600 text-white shadow-violet-500/40" :
    selectedHabit.isMajorSin ? "bg-red-700 text-white shadow-red-700/40" : "bg-rose-600 text-white shadow-rose-500/40")
 )}
 >
 {completedHabits.includes(selectedHabit.id) ? (
 <>
 <RotateCcw size={20} className="animate-spin-slow" />
 إلغاء الإنجاز
 </>
 ) : (
 <>
 <CheckCircle2 size={20} />
 {selectedHabit.type === 'good' || selectedHabit.type === 'repentance' || selectedHabit.type === 'sunnah' || selectedHabit.type === 'worship' ? 'تم الاكتساب' : 'تم التخلص'}
 </>
 )}
 </button>
 </div>
 </motion.div>
 </div>
 ) }
 </AnimatePresence>
 </>,
 document.body
 )}

  </div>
  );
};


