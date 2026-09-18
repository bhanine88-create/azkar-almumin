import { BackButton } from "./ui/BackButton";
import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {  Fingerprint,
  RotateCcw,
  Plus,
  Settings,
  X,
  ChevronRight,
  ChevronLeft,
  Target,
  Trophy,
  Trash2,
  CheckCircle2,
  Watch,
  Palette,
  Type,
  Moon,
  
  ListTodo,
  Activity , Volume2 } from "lucide-react";
import { progressService, TasbeehGoal } from "../services/progressService";
import { auth } from "../firebase";
import { useAppContext } from "../AppContext";
import { useChallengeTracker } from "../hooks/useChallengeTracker";
import { ChallengeCategory } from "../challengesData";
import { cn, checkInputSafety, sanitizeString, triggerHaptic } from "../lib/utils";
import { useTranslation } from "../i18n";
import { useSmartNavigation } from "../lib/navigation";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { safeLocalStorageGetItem, safeLocalStorageSetItem, safeLocalStorageRemoveItem } from "../utils/storage";
import { playTasbihClickSound } from "../lib/sounds";

const DIGITAL_THEMES: Record<
  string,
  {
    bg: string;
    border: string;
    texture: string;
    lcdFrameBg: string;
    lcdFrameBorder: string;
    lcdInnerBg: string;
    lcdText: string;
    buttonOuter: string;
    buttonInner: string;
    buttonIcon: string;
    buttonGlow: string;
    resetBtn: string;
  }
> = {
  golden: {
    bg: "bg-gradient-to-b from-[#1b1b19] via-[#282925] to-[#10100f]",
    border:
      "border-[5px] border-[#cca43b] shadow-[0_30px_60px_rgba(0,0,0,0.9),inset_0_3px_8px_rgba(255,255,255,0.06),0_0_20px_rgba(204,164,59,0.15)]",
    texture: "/images/arabesque.png",
    lcdFrameBg:
      "bg-gradient-to-tr from-[#9e761c] via-[#ffe895] via-[#ffffff] to-[#aa801a]",
    lcdFrameBorder:
      "border border-[#5a4209]/40 shadow-[0_8px_16px_rgba(0,0,0,0.55),inset_0_2px_4px_rgba(255,255,255,0.65)]",
    lcdInnerBg: "bg-gradient-to-b from-[#f5ebd2] to-[#cdc1a3]",
    lcdText: "text-[#231b0a]",
    buttonOuter:
      "bg-[linear-gradient(135deg,#7e5f14_0%,#fff5c0_25%,#ffffff_45%,#b08722_65%,#543e06_100%)] shadow-[0_12px_24px_rgba(0,0,0,0.7),inset_0_2.5px_5px_rgba(255,255,255,0.65)] active:scale-95 transition-all cursor-pointer relative p-[3px]",
    buttonInner:
      "bg-gradient-to-b from-[#ffd35b] via-[#fff5c0] to-[#b08722] border-[#fcd565]/40 shadow-[inset_0_1.5px_3.5px_rgba(255,255,255,0.85)]",
    buttonIcon: "text-[#4d3a0c] drop-shadow-[0_1px_2px_rgba(255,255,255,0.6)]",
    buttonGlow: "shadow-[0_0_25px_rgba(245,158,11,0.6)] border-yellow-400/80",
    resetBtn:
      "bg-[linear-gradient(135deg,#7e5f14_0%,#fff5c0_25%,#ffffff_45%,#b08722_65%,#543e06_100%)] border border-black/20 text-[#302404] shadow-[0_5px_12px_rgba(0,0,0,0.5),inset_0_1.5px_3px_rgba(255,255,255,0.7)] hover:brightness-105 active:scale-90 transition-all",
  },
  silver: {
    bg: "bg-gradient-to-b from-[#f3f4f6] via-[#e5e7eb] to-[#cbd5e1]",
    border:
      "border-[5px] border-[#94a3b8] shadow-[0_30px_60px_rgba(0,0,0,0.8),inset_0_3px_10px_rgba(255,255,255,0.9),0_0_20px_rgba(148,163,184,0.15)]",
    texture: "/images/arabesque.png",
    lcdFrameBg:
      "bg-gradient-to-tr from-[#475569] via-[#94a3b8] via-[#ffffff] to-[#64748b]",
    lcdFrameBorder:
      "border border-slate-600/40 shadow-[0_8px_16px_rgba(0,0,0,0.45),inset_0_2px_4px_rgba(255,255,255,0.75)]",
    lcdInnerBg: "bg-gradient-to-b from-[#0F2D37] to-[#05141B]",
    lcdText: "text-[#3BF0FF] drop-shadow-[0_0_4px_rgba(59,240,255,0.75)]",
    buttonOuter:
      "bg-[linear-gradient(135deg,#475569_0%,#cbd5e1_25%,#ffffff_45%,#64748b_65%,#334155_100%)] shadow-[0_12px_24px_rgba(0,0,0,0.55),inset_0_2.5px_5px_rgba(255,255,255,0.65)] active:scale-95 transition-all cursor-pointer relative p-[3px]",
    buttonInner:
      "bg-gradient-to-b from-[#ffffff] via-[#f1f5f9] to-[#cbd5e1] border-slate-300 shadow-[inset_0_1.5px_3.5px_rgba(255,255,255,0.95)]",
    buttonIcon: "text-[#1e293b] drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]",
    buttonGlow: "shadow-[0_0_20px_rgba(148,163,184,0.5)] border-slate-300",
    resetBtn:
      "bg-[linear-gradient(135deg,#475569_0%,#cbd5e1_25%,#ffffff_45%,#64748b_65%,#334155_100%)] border border-black/20 text-[#1e293b] shadow-[0_5px_12px_rgba(0,0,0,0.4),inset_0_1.5px_3px_rgba(255,255,255,0.8)] hover:brightness-105 active:scale-90 transition-all",
  },
  emerald: {
    bg: "bg-gradient-to-b from-[#023126] via-[#054a3c] to-[#011e17]",
    border:
      "border-[5px] border-[#cca43b] shadow-[0_30px_60px_rgba(0,0,0,0.9),inset_0_3px_8px_rgba(255,255,255,0.06),0_0_20px_rgba(204,164,59,0.15)]",
    texture: "/images/arabesque.png",
    lcdFrameBg:
      "bg-gradient-to-tr from-[#9e761c] via-[#ffe895] via-[#ffffff] to-[#aa801a]",
    lcdFrameBorder:
      "border border-[#5a4209]/40 shadow-[0_8px_16px_rgba(0,0,0,0.55),inset_0_2px_4px_rgba(255,255,255,0.65)]",
    lcdInnerBg: "bg-gradient-to-b from-[#FFF2CC] to-[#FFD066]",
    lcdText: "text-[#211703]",
    buttonOuter:
      "bg-[linear-gradient(135deg,#064e3b_0%,#a7f3d0_25%,#ffffff_45%,#10b981_65%,#022c22_100%)] shadow-[0_12px_24px_rgba(0,0,0,0.7),inset_0_2.5px_5px_rgba(255,255,255,0.65)] active:scale-95 transition-all cursor-pointer relative p-[3px]",
    buttonInner:
      "bg-gradient-to-b from-[#34d399] via-[#a7f3d0] to-[#047857] border-[#6ee7b7]/40 shadow-[inset_0_1.5px_3.5px_rgba(255,255,255,0.85)]",
    buttonIcon: "text-[#022c22] drop-shadow-[0_1px_2px_rgba(255,255,255,0.6)]",
    buttonGlow: "shadow-[0_0_25px_rgba(16,185,129,0.65)] border-emerald-400/80",
    resetBtn:
      "bg-[linear-gradient(135deg,#064e3b_0%,#a7f3d0_25%,#ffffff_45%,#10b981_65%,#022c22_100%)] border border-black/20 text-[#022c22] shadow-[0_5px_12px_rgba(0,0,0,0.5),inset_0_1.5px_3px_rgba(255,255,255,0.7)] hover:brightness-105 active:scale-90 transition-all",
  },
  sapphire: {
    bg: "bg-gradient-to-b from-[#0a1224] via-[#12193b] to-[#05081c]",
    border:
      "border-[5px] border-[#38bdf8] shadow-[0_30px_60px_rgba(0,0,0,0.9),inset_0_3px_8px_rgba(255,255,255,0.06),0_0_20px_rgba(56,189,248,0.2)]",
    texture: "/images/arabesque.png",
    lcdFrameBg:
      "bg-gradient-to-tr from-[#0284c7] via-[#38bdf8] via-[#ffffff] to-[#0369a1]",
    lcdFrameBorder:
      "border border-sky-600/40 shadow-[0_8px_16px_rgba(0,0,0,0.5),inset_0_2px_4px_rgba(255,255,255,0.75)]",
    lcdInnerBg: "bg-gradient-to-b from-[#E6FBF4] to-[#BDECE0]",
    lcdText: "text-[#032e26]",
    buttonOuter:
      "bg-[linear-gradient(135deg,#0369a1_0%,#38bdf8_25%,#ffffff_45%,#0284c7_65%,#0c4a6e_100%)] shadow-[0_12px_24px_rgba(0,0,0,0.6),inset_0_2.5px_5px_rgba(255,255,255,0.65)] active:scale-95 transition-all cursor-pointer relative p-[3px]",
    buttonInner:
      "bg-gradient-to-b from-[#e0f2fe] via-[#38bdf8] to-[#0284c7] border-sky-300 shadow-[inset_0_1.5px_3.5px_rgba(255,255,255,0.85)]",
    buttonIcon: "text-[#0c4a6e] drop-shadow-[0_1px_1px_rgba(255,255,255,0.7)]",
    buttonGlow: "shadow-[0_0_25px_rgba(14,165,233,0.65)] border-sky-400/80",
    resetBtn:
      "bg-[linear-gradient(135deg,#0369a1_0%,#38bdf8_25%,#ffffff_45%,#0284c7_65%,#0c4a6e_100%)] border border-black/20 text-[#0c4a6e] shadow-[0_5px_12px_rgba(0,0,0,0.4),inset_0_1.5px_3px_rgba(255,255,255,0.8)] hover:brightness-105 active:scale-90 transition-all",
  },
  ruby: {
    bg: "bg-gradient-to-b from-[#3b0413] via-[#50061c] to-[#1c0007]",
    border:
      "border-[5px] border-[#fda4af] shadow-[0_30px_60px_rgba(0,0,0,0.9),inset_0_3px_8px_rgba(255,255,255,0.06),0_0_20px_rgba(253,164,175,0.2)]",
    texture: "/images/arabesque.png",
    lcdFrameBg:
      "bg-gradient-to-tr from-[#be123c] via-[#fda4af] via-[#ffffff] to-[#e11d48]",
    lcdFrameBorder:
      "border border-rose-600/40 shadow-[0_8px_16px_rgba(0,0,0,0.5),inset_0_2px_4px_rgba(255,255,255,0.75)]",
    lcdInnerBg: "bg-gradient-to-b from-[#E0F8FF] to-[#AEEBFC]",
    lcdText: "text-[#420412]",
    buttonOuter:
      "bg-[linear-gradient(135deg,#be123c_0%,#fda4af_25%,#ffffff_45%,#e11d48_65%,#4c0519_100%)] shadow-[0_12px_24px_rgba(0,0,0,0.6),inset_0_2.5px_5px_rgba(255,255,255,0.65)] active:scale-95 transition-all cursor-pointer relative p-[3px]",
    buttonInner:
      "bg-gradient-to-b from-[#ffe4e6] via-[#fb7185] to-[#e11d48] border-rose-300 shadow-[inset_0_1.5px_3.5px_rgba(255,255,255,0.85)]",
    buttonIcon: "text-[#4c0519] drop-shadow-[0_1px_1px_rgba(255,255,255,0.7)]",
    buttonGlow: "shadow-[0_0_25px_rgba(244,63,94,0.65)] border-rose-400/80",
    resetBtn:
      "bg-[linear-gradient(135deg,#be123c_0%,#fda4af_25%,#ffffff_45%,#e11d48_65%,#4c0519_100%)] border border-black/20 text-[#4c0519] shadow-[0_5px_12px_rgba(0,0,0,0.4),inset_0_1.5px_3px_rgba(255,255,255,0.8)] hover:brightness-105 active:scale-90 transition-all",
  },
};

const HANDHELD_THEMES: Record<
  string,
  {
    name: string;
    bodyBg: string;
    borderCol: string;
    strokeCol: string;
    highlightCol: string;
    bezelBg: string;
    bezelInnerBorder: string;
    lcdOn: string;
    lcdOff: string;
    lcdTextOn: string;
    lcdTextOff: string;
    smallButtonBg: string;
    smallButtonInner: string;
    countButtonBg: string;
    countButtonInner: string;
    labelTextCol: string;
  }
> = {
  golden: {
    name: "الأسود المذهب",
    bodyBg: "bg-gradient-to-b from-[#151614] via-[#21211e] to-[#0a0a09]",
    borderCol: "border-[#cfab41]",
    strokeCol: "stroke-[#cfab41]",
    highlightCol: "border-[#cfab41]/12",
    bezelBg: "bg-gradient-to-tr from-[#8a6a1a] via-[#ffe895] to-[#8a6a1a]",
    bezelInnerBorder: "border-black/20",
    lcdOn: "from-[#2cf6f0] to-[#14c3bd]",
    lcdOff: "from-[#9fa5ab] to-[#b1b7ba]",
    lcdTextOn: "text-[#052423]",
    lcdTextOff: "text-[#232422]",
    smallButtonBg: "bg-gradient-to-br from-white via-[#ffe895] to-[#543e06]",
    smallButtonInner:
      "bg-gradient-to-b from-[#ffdb73] via-[#fff5c0] to-[#b08722]",
    countButtonBg: "bg-gradient-to-br from-white via-[#ffe895] to-[#403002]",
    countButtonInner: "from-[#ffd35b] via-[#fff5c0] to-[#9c781d]",
    labelTextCol: "text-white/95",
  },
  silver: {
    name: "الفضي اللؤلؤي",
    bodyBg: "bg-gradient-to-b from-[#e2e8f0] via-[#f1f5f9] to-[#cbd5e1]",
    borderCol: "border-[#94a3b8]",
    strokeCol: "stroke-[#94a3b8]",
    highlightCol: "border-white/40",
    bezelBg: "bg-gradient-to-tr from-[#475569] via-[#cbd5e1] to-[#64748b]",
    bezelInnerBorder: "border-slate-400/20",
    lcdOn: "from-[#4facfe] to-[#00f2fe]",
    lcdOff: "from-[#b8ccd2] to-[#cddde2]",
    lcdTextOn: "text-[#081b40]",
    lcdTextOff: "text-[#212933]",
    smallButtonBg: "bg-gradient-to-br from-white via-[#f1f5f9] to-[#334155]",
    smallButtonInner:
      "bg-gradient-to-b from-[#ffffff] via-[#e2e8f0] to-[#94a3b8]",
    countButtonBg: "bg-gradient-to-br from-white via-[#e2e8f0] to-[#1e293b]",
    countButtonInner: "from-[#ffffff] via-[#f1f5f9] to-[#64748b]",
    labelTextCol: "text-slate-700 font-bold",
  },
  emerald: {
    name: "الأخضر الزمردي",
    bodyBg: "bg-gradient-to-b from-[#022c22] via-[#043d31] to-[#01140e]",
    borderCol: "border-[#cca43b]",
    strokeCol: "stroke-[#cca43b]",
    highlightCol: "border-[#ffd700]/15",
    bezelBg: "bg-gradient-to-tr from-[#9e761c] via-[#ffe895] to-[#aa801a]",
    bezelInnerBorder: "border-black/20",
    lcdOn: "from-[#FFEA9F] to-[#EFA62B]",
    lcdOff: "from-[#a0ada0] to-[#b1bdb1]",
    lcdTextOn: "text-[#231502]",
    lcdTextOff: "text-[#1d2b1d]",
    smallButtonBg: "bg-gradient-to-br from-white via-[#ffe895] to-[#543e06]",
    smallButtonInner:
      "bg-gradient-to-b from-[#ffdb73] via-[#fff5c0] to-[#b08722]",
    countButtonBg: "bg-gradient-to-br from-white via-[#ffe895] to-[#403002]",
    countButtonInner: "from-[#ffd35b] via-[#fff5c0] to-[#9c781d]",
    labelTextCol: "text-white/95",
  },
  sapphire: {
    name: "الأزرق الملكي",
    bodyBg: "bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-[#090d16]",
    borderCol: "border-[#38bdf8]",
    strokeCol: "stroke-[#38bdf8]",
    highlightCol: "border-sky-400/20",
    bezelBg: "bg-gradient-to-tr from-[#0284c7] via-[#38bdf8] to-[#0369a1]",
    bezelInnerBorder: "border-sky-900/30",
    lcdOn: "from-[#E3FCF2] to-[#8EEAD2]",
    lcdOff: "from-[#abb9cc] to-[#bdcbde]",
    lcdTextOn: "text-[#032e23]",
    lcdTextOff: "text-[#1e293b]",
    smallButtonBg:
      "bg-gradient-to-br from-[#e0f2fe] via-[#38bdf8] to-[#0b3147]",
    smallButtonInner:
      "bg-gradient-to-b from-[#bae6fd] via-[#38bdf8] to-[#0369a1]",
    countButtonBg: "bg-gradient-to-br from-white via-[#38bdf8] to-[#0d3043]",
    countButtonInner: "from-[#e0f2fe] via-[#38bdf8] to-[#075985]",
    labelTextCol: "text-sky-300 font-bold",
  },
  ruby: {
    name: "العقيق الأحمر",
    bodyBg: "bg-gradient-to-b from-[#4c0519] via-[#5c0720] to-[#240008]",
    borderCol: "border-[#fda4af]",
    strokeCol: "stroke-[#fda4af]",
    highlightCol: "border-rose-400/20",
    bezelBg: "bg-gradient-to-tr from-[#be123c] via-[#fda4af] to-[#e11d48]",
    bezelInnerBorder: "border-rose-900/30",
    lcdOn: "from-[#E0FAF9] to-[#97DFEA]",
    lcdOff: "from-[#cca8ad] to-[#e0b8bd]",
    lcdTextOn: "text-[#03212b]",
    lcdTextOff: "text-[#2e1518]",
    smallButtonBg:
      "bg-gradient-to-br from-[#ffe4e6] via-[#fd92a3] to-[#580315]",
    smallButtonInner:
      "bg-gradient-to-b from-[#fecdd3] via-[#ff6b8b] to-[#be123c]",
    countButtonBg: "bg-gradient-to-br from-white via-[#fda4af] to-[#4c0519]",
    countButtonInner: "from-[#ffe4e6] via-[#fb7185] to-[#9f1239]",
    labelTextCol: "text-rose-300 font-bold",
  },
};

const PRO_THEMES: Record<
  string,
  {
    name: string;
    bodyBg: string;
    bodyOuterBorder: string;
    bodyInnerRing: string;
    screenBg: string;
    screenText: string;
    screenAccent: string;
    goldText: string;
    buttonRing: string;
    buttonBg: string;
    buttonIcon: string;
  }
> = {
  golden: {
    name: "الأسود الملكي",
    bodyBg: "bg-gradient-to-b from-[#141613] via-[#0a0a09] to-[#010101]",
    bodyOuterBorder: "border-[#cca028]",
    bodyInnerRing: "ring-[#efc648]",
    screenBg: "bg-[#eedfb3]",
    screenText: "text-[#1c1202]",
    screenAccent: "text-[#1c1202]",
    goldText: "text-[#efc648]",
    buttonRing: "ring-[#efc648]",
    buttonBg: "bg-gradient-to-tr from-[#0a0b09] to-[#161813]",
    buttonIcon: "text-[#efc648]",
  },
  emerald: {
    name: "الأخضر الزمردي",
    bodyBg: "bg-gradient-to-b from-[#0e3b23] via-[#052111] to-[#011208]",
    bodyOuterBorder: "border-[#d9a838]",
    bodyInnerRing: "ring-[#f2cb55]",
    screenBg: "bg-[#fff0c2]",
    screenText: "text-[#381c03]",
    screenAccent: "text-[#381c03]",
    goldText: "text-[#f2cb55]",
    buttonRing: "ring-[#f2cb55]",
    buttonBg: "bg-gradient-to-tr from-[#041f10] to-[#124225]",
    buttonIcon: "text-[#f2cb55]",
  },
  sapphire: {
    name: "الأزرق العميق",
    bodyBg: "bg-gradient-to-b from-[#071933] via-[#020d1c] to-[#00040d]",
    bodyOuterBorder: "border-[#a3c9f2]",
    bodyInnerRing: "ring-[#caddfc]",
    screenBg: "bg-[#e0fbec]",
    screenText: "text-[#062e1a]",
    screenAccent: "text-[#062e1a]",
    goldText: "text-[#caddfc]",
    buttonRing: "ring-[#caddfc]",
    buttonBg: "bg-gradient-to-tr from-[#041526] to-[#0f2c4a]",
    buttonIcon: "text-[#caddfc]",
  },
  ruby: {
    name: "العقيق الأحمر",
    bodyBg: "bg-gradient-to-b from-[#3a0713] via-[#210208] to-[#120003]",
    bodyOuterBorder: "border-[#e0899a]",
    bodyInnerRing: "ring-[#fabbc7]",
    screenBg: "bg-[#e0f8ff]",
    screenText: "text-[#022b3a]",
    screenAccent: "text-[#022b3a]",
    goldText: "text-[#fabbc7]",
    buttonRing: "ring-[#fabbc7]",
    buttonBg: "bg-gradient-to-tr from-[#24030a] to-[#4f0c1c]",
    buttonIcon: "text-[#fabbc7]",
  },
  silver: {
    name: "البلاتينيوم",
    bodyBg: "bg-gradient-to-b from-[#242930] via-[#101317] to-[#050608]",
    bodyOuterBorder: "border-[#96a4b3]",
    bodyInnerRing: "ring-[#dae3ec]",
    screenBg: "bg-[#e6fcff]",
    screenText: "text-[#012f38]",
    screenAccent: "text-[#012f38]",
    goldText: "text-[#dae3ec]",
    buttonRing: "ring-[#dae3ec]",
    buttonBg: "bg-gradient-to-tr from-[#13171c] to-[#272e38]",
    buttonIcon: "text-[#dae3ec]",
  },
};

const EGG_THEMES: Record<
  string,
  {
    name: string;
    outerFrame: string;
    outerBorder: string;
    innerShell: string;
    innerBorder: string;
    topHalfBg: string;
    topHalfBorder: string;
    textColorTop: string;
    textColorBottom: string;
    ringGlowMain: string;
    ringGlowSub: string;
    buttonMainBg: string;
    buttonSubBg: string;
    buttonIconColor: string;
    stop0: string;
    stop50: string;
    stop100: string;
    svgDecor: string;
  }
> = {
  golden: {
    name: "ذهبي ملكي",
    outerFrame: "from-[#eab308] via-[#ca8a04] to-[#713f12]",
    outerBorder: "border-[#fde047]",
    innerShell: "from-[#ca8a04] via-[#a16207] to-[#854d0e]",
    innerBorder: "border-[#facc15]/40",
    topHalfBg: "bg-gradient-to-br from-[#12100e] to-[#000000]",
    topHalfBorder: "border-[#eab308]/30",
    textColorTop: "text-[#fef08a]",
    textColorBottom: "text-[#fbbf24]",
    ringGlowMain:
      "border-yellow-400 shadow-[0_0_20px_#eab308,inset_0_0_12px_#eab308]",
    ringGlowSub: "border-slate-300",
    buttonMainBg: "from-[#fef08a] via-[#f59e0b] to-[#78350f]",
    buttonSubBg: "from-[#fefbeb] via-[#d97706] to-[#451a03]",
    buttonIconColor: "text-amber-950",
    stop0: "#fef08a",
    stop50: "#f59e0b",
    stop100: "#fff",
    svgDecor: "text-[#f59e0b]",
  },
  sapphire: {
    name: "أزرق ياقوتي",
    outerFrame: "from-[#2563eb] via-[#1d4ed8] to-[#1e3a8a]",
    outerBorder: "border-[#60a5fa]",
    innerShell: "from-[#1d4ed8] via-[#1e40af] to-[#1e3a8a]",
    innerBorder: "border-[#60a5fa]/40",
    topHalfBg: "bg-gradient-to-br from-[#0c0f1b] to-[#000000]",
    topHalfBorder: "border-[#38bdf8]/30",
    textColorTop: "text-[#38bdf8]",
    textColorBottom: "text-[#0ea5e9]",
    ringGlowMain:
      "border-sky-400 shadow-[0_0_20px_#22d3ee,inset_0_0_12px_#22d3ee]",
    ringGlowSub: "border-slate-300",
    buttonMainBg: "from-[#bae6fd] via-[#0284c7] to-[#0c4a6e]",
    buttonSubBg: "from-[#e0f2fe] via-[#0369a1] to-[#082f49]",
    buttonIconColor: "text-sky-950",
    stop0: "#bae6fd",
    stop50: "#0284c7",
    stop100: "#fff",
    svgDecor: "text-[#0284c7]",
  },
  ruby: {
    name: "أحمر عقيقي",
    outerFrame: "from-[#e11d48] via-[#be123c] to-[#881337]",
    outerBorder: "border-[#fb7185]",
    innerShell: "from-[#be123c] via-[#9f1239] to-[#881337]",
    innerBorder: "border-[#fb7185]/40",
    topHalfBg: "bg-gradient-to-br from-[#100103] to-[#000000]",
    topHalfBorder: "border-[#f43f5e]/30",
    textColorTop: "text-[#fb7185]",
    textColorBottom: "text-[#e11d48]",
    ringGlowMain:
      "border-rose-400 shadow-[0_0_20px_#f43f5e,inset_0_0_12px_#f43f5e]",
    ringGlowSub: "border-slate-300",
    buttonMainBg: "from-[#fecdd3] via-[#e11d48] to-[#881337]",
    buttonSubBg: "from-[#fff1f2] via-[#be123c] to-[#4c0519]",
    buttonIconColor: "text-rose-950",
    stop0: "#fecdd3",
    stop50: "#e11d48",
    stop100: "#fff",
    svgDecor: "text-[#e11d48]",
  },
  silver: {
    name: "فضي بلاتيني",
    outerFrame: "from-[#94a3b8] via-[#64748b] to-[#334155]",
    outerBorder: "border-[#cbd5e1]",
    innerShell: "from-[#64748b] via-[#475569] to-[#334155]",
    innerBorder: "border-[#cbd5e1]/40",
    topHalfBg: "bg-gradient-to-br from-[#0c0f16] to-[#000000]",
    topHalfBorder: "border-[#cbd5e1]/30",
    textColorTop: "text-slate-250",
    textColorBottom: "text-[#cbd5e1]",
    ringGlowMain:
      "border-slate-300 shadow-[0_0_20px_#94a3b8,inset_0_0_12px_#94a3b8]",
    ringGlowSub: "border-slate-300",
    buttonMainBg: "from-[#f1f5f9] via-[#64748b] to-[#334155]",
    buttonSubBg: "from-[#cbd5e1] via-[#475569] to-[#1e293b]",
    buttonIconColor: "text-slate-950",
    stop0: "#f1f5f9",
    stop50: "#64748b",
    stop100: "#fff",
    svgDecor: "text-[#64748b]",
  },
  emerald: {
    name: "أخضر زمردي",
    outerFrame: "from-[#10b981] via-[#059669] to-[#064e3b]",
    outerBorder: "border-[#6ee7b7]",
    innerShell: "from-[#059669] via-[#047857] to-[#064e3b]",
    innerBorder: "border-[#6ee7b7]/40",
    topHalfBg: "bg-gradient-to-br from-[#02180c] to-[#000000]",
    topHalfBorder: "border-[#10b981]/30",
    textColorTop: "text-[#34d399]",
    textColorBottom: "text-[#10b981]",
    ringGlowMain:
      "border-emerald-400 shadow-[0_0_20px_#10b981,inset_0_0_12px_#10b981]",
    ringGlowSub: "border-slate-300",
    buttonMainBg: "from-[#a7f3d0] via-[#059669] to-[#065f46]",
    buttonSubBg: "from-[#f0fdf4] via-[#047857] to-[#022c22]",
    buttonIconColor: "text-emerald-950",
    stop0: "#a7f3d0",
    stop50: "#059669",
    stop100: "#fff",
    svgDecor: "text-[#059669]",
  },
};

const HEX_THEMES: Record<
  string,
  {
    name: string;
    outerHexFrame: string;
    innerHexFrame: string;
    shellBg: string;
    textureAccent: string;
    textureOpacity: string;
    marbleRing: string;
    marbleInner: string;
    marbleVeinsColor: string;
    progressGlowGrad: string[];
    progressRingTrack: string;
    solarFlare: string;
    textColorPrimary: string;
    flowerDivider: string;
    dividerDotFill: string;
    percentText: string;
    subBtnGrad: string;
    subBtnBorder: string;
    subBtnTextLabel: string;
    subBtnIcon: string;
    mainBtnPulse: string;
    mainBtnGrad: string;
    mainBtnBorder: string;
    mainBtnIcon: string;
  }
> = {
  golden: {
    name: "ذهبي نحاسي",
    outerHexFrame: "from-[#ffdcd0] via-[#c28359] to-[#3a1a08]",
    innerHexFrame: "from-[#3a1a08] via-[#e2a884] to-[#fde1cd]",
    shellBg: "#03221E",
    textureAccent: "%23ce9676",
    textureOpacity: "0.1",
    marbleRing: "from-[#f0d4bc] via-[#ffd5bf] to-[#7f3912]",
    marbleInner: "from-[#efe9dd] via-[#e5dec9] to-[#dcd0b7]",
    marbleVeinsColor: "%23705a46",
    progressGlowGrad: ["#ffdcc0", "#ffb066", "#e89344", "#804212"],
    progressRingTrack: "#8a6142",
    solarFlare: "#ffa34d",
    textColorPrimary: "text-[#07241e]",
    flowerDivider: "text-[#a57855]",
    dividerDotFill: "#e5dec9",
    percentText: "text-[#445b56]/90",
    subBtnGrad: "from-[#f2b388] via-[#af673b] to-[#5a2307]",
    subBtnBorder: "border-[#220f04]",
    subBtnTextLabel: "text-[#ce9676]",
    subBtnIcon: "text-[#ffe0cc]",
    mainBtnPulse: "border-[#ffa34d]/40 shadow-[0_0_12px_rgba(255,163,77,0.55),inset_0_0_8px_rgba(255,163,77,0.4)]",
    mainBtnGrad: "from-[#ffd5bf] via-[#c68962] to-[#6c2e0b]",
    mainBtnBorder: "border-[#220f04]",
    mainBtnIcon: "text-[#ffebdf]",
  },
  silver: {
    name: "فضي بلاتيني",
    outerHexFrame: "from-[#f0f4f8] via-[#94a3b8] to-[#1e293b]",
    innerHexFrame: "from-[#1e293b] via-[#cbd5e1] to-[#f8fafc]",
    shellBg: "#111827",
    textureAccent: "%2394a3b8",
    textureOpacity: "0.15",
    marbleRing: "from-[#e2e8f0] via-[#cbd5e1] to-[#475569]",
    marbleInner: "from-[#f1f5f9] via-[#e2e8f0] to-[#cbd5e1]",
    marbleVeinsColor: "%23475569",
    progressGlowGrad: ["#e0f2fe", "#7dd3fc", "#0284c7", "#1e3a8a"],
    progressRingTrack: "#475569",
    solarFlare: "#38bdf8",
    textColorPrimary: "text-[#0f172a]",
    flowerDivider: "text-[#64748b]",
    dividerDotFill: "#e2e8f0",
    percentText: "text-[#475569]/90",
    subBtnGrad: "from-[#cbd5e1] via-[#94a3b8] to-[#334155]",
    subBtnBorder: "border-[#0f172a]",
    subBtnTextLabel: "text-[#94a3b8]",
    subBtnIcon: "text-[#f1f5f9]",
    mainBtnPulse: "border-[#38bdf8]/40 shadow-[0_0_12px_rgba(56,189,248,0.55),inset_0_0_8px_rgba(56,189,248,0.4)]",
    mainBtnGrad: "from-[#f1f5f9] via-[#cbd5e1] to-[#475569]",
    mainBtnBorder: "border-[#0f172a]",
    mainBtnIcon: "text-[#f8fafc]",
  },
  emerald: {
    name: "أخضر زمردي",
    outerHexFrame: "from-[#d1fae5] via-[#10b981] to-[#064e3b]",
    innerHexFrame: "from-[#064e3b] via-[#34d399] to-[#ecfdf5]",
    shellBg: "#022c22",
    textureAccent: "%23a7f3d0",
    textureOpacity: "0.1",
    marbleRing: "from-[#a7f3d0] via-[#6ee7b7] to-[#047857]",
    marbleInner: "from-[#fdfcf7] via-[#f7f2d5] to-[#ece1b4]",
    marbleVeinsColor: "%23a57855",
    progressGlowGrad: ["#d1fae5", "#34d399", "#059669", "#064e3b"],
    progressRingTrack: "#065f46",
    solarFlare: "#34d399",
    textColorPrimary: "text-[#382603]",
    flowerDivider: "text-[#059669]",
    dividerDotFill: "#d1fae5",
    percentText: "text-[#065f46]/90",
    subBtnGrad: "from-[#a7f3d0] via-[#34d399] to-[#064e3b]",
    subBtnBorder: "border-[#022c22]",
    subBtnTextLabel: "text-[#34d399]",
    subBtnIcon: "text-[#ecfdf5]",
    mainBtnPulse: "border-[#34d399]/40 shadow-[0_0_12px_rgba(52,211,153,0.55),inset_0_0_8px_rgba(52,211,153,0.4)]",
    mainBtnGrad: "from-[#d1fae5] via-[#34d399] to-[#065f46]",
    mainBtnBorder: "border-[#022c22]",
    mainBtnIcon: "text-[#ecfdf5]",
  },
  sapphire: {
    name: "أزرق ياقوتي",
    outerHexFrame: "from-[#dbeafe] via-[#3b82f6] to-[#1e3a8a]",
    innerHexFrame: "from-[#1e3a8a] via-[#60a5fa] to-[#eff6ff]",
    shellBg: "#03102d",
    textureAccent: "%2393c5fd",
    textureOpacity: "0.12",
    marbleRing: "from-[#bfdbfe] via-[#93c5fd] to-[#2563eb]",
    marbleInner: "from-[#ffffff] via-[#fbf8f0] to-[#f4ebd0]",
    marbleVeinsColor: "%23a67b2d",
    progressGlowGrad: ["#bfdbfe", "#60a5fa", "#2563eb", "#1e3a8a"],
    progressRingTrack: "#1d4ed8",
    solarFlare: "#60a5fa",
    textColorPrimary: "text-[#10243d]",
    flowerDivider: "text-[#2563eb]",
    dividerDotFill: "#dbeafe",
    percentText: "text-[#1d4ed8]/95",
    subBtnGrad: "from-[#93c5fd] via-[#3b82f6] to-[#1d4ed8]",
    subBtnBorder: "border-[#1e3a8a]",
    subBtnTextLabel: "text-[#60a5fa]",
    subBtnIcon: "text-[#eff6ff]",
    mainBtnPulse: "border-[#60a5fa]/45 shadow-[0_0_12px_rgba(96,165,250,0.55),inset_0_0_8px_rgba(96,165,250,0.4)]",
    mainBtnGrad: "from-[#eff6ff] via-[#60a5fa] to-[#1e40af]",
    mainBtnBorder: "border-[#1e3a8a]",
    mainBtnIcon: "text-[#eff6ff]",
  },
  ruby: {
    name: "أحمر عقيقي",
    outerHexFrame: "from-[#ffe4e6] via-[#f43f5e] to-[#4c0519]",
    innerHexFrame: "from-[#4c0519] via-[#fb7185] to-[#fff1f2]",
    shellBg: "#270505",
    textureAccent: "%23fecdd3",
    textureOpacity: "0.1",
    marbleRing: "from-[#fecdd3] via-[#fda4af] to-[#be123c]",
    marbleInner: "from-[#f0fbf7] via-[#daf2e7] to-[#beeade]",
    marbleVeinsColor: "%23059669",
    progressGlowGrad: ["#ffe4e6", "#fb7185", "#e11d48", "#4c0519"],
    progressRingTrack: "#9f1239",
    solarFlare: "#fb7185",
    textColorPrimary: "text-[#032e26]",
    flowerDivider: "text-[#be123c]",
    dividerDotFill: "#ffe4e6",
    percentText: "text-[#9f1239]/90",
    subBtnGrad: "from-[#fda4af] via-[#f43f5e] to-[#881337]",
    subBtnBorder: "border-[#4c0519]",
    subBtnTextLabel: "text-[#fb7185]",
    subBtnIcon: "text-[#fff1f2]",
    mainBtnPulse: "border-[#fb7185]/40 shadow-[0_0_12px_rgba(251,113,133,0.55),inset_0_0_8px_rgba(251,113,133,0.4)]",
    mainBtnGrad: "from-[#fff1f2] via-[#fb7185] to-[#9f1239]",
    mainBtnBorder: "border-[#4c0519]",
    mainBtnIcon: "text-[#fff1f2]",
  },
};


const THEMES = [
  { id: "default", name: "كلاسيكي", bg: "bg-teal-700", text: "text-white" },
  {
    id: "sunset",
    name: "غروب",
    bg: "bg-gradient-to-br from-orange-500 to-red-600",
    text: "text-white",
  },
  {
    id: "ocean",
    name: "محيط",
    bg: "bg-gradient-to-br from-blue-500 to-cyan-600",
    text: "text-white",
  },
  {
    id: "royal",
    name: "ملكي",
    bg: "bg-gradient-to-br from-violet-600 to-purple-800",
    text: "text-white",
  },
  {
    id: "forest",
    name: "غابة",
    bg: "bg-gradient-to-br from-emerald-600 to-green-800",
    text: "text-white",
  },
  {
    id: "desert",
    name: "صحراء",
    bg: "bg-gradient-to-br from-amber-700 to-yellow-900",
    text: "text-white",
  },
  {
    id: "night",
    name: "ليل",
    bg: "bg-gradient-to-br from-slate-800 to-slate-950",
    text: "text-white",
  },
  {
    id: "rose",
    name: "ورد",
    bg: "bg-gradient-to-br from-rose-500 to-pink-600",
    text: "text-white",
  },
  {
    id: "aurora",
    name: "شفق",
    bg: "bg-gradient-to-tr from-emerald-400 via-cyan-500 to-blue-600",
    text: "text-white",
  },
  {
    id: "fire",
    name: "نار",
    bg: "bg-gradient-to-tr from-red-500 via-orange-500 to-yellow-500",
    text: "text-white",
  },
  {
    id: "galaxy",
    name: "مجرة",
    bg: "bg-gradient-to-tr from-indigo-900 via-purple-900 to-pink-900",
    text: "text-white",
  },
  {
    id: "gold",
    name: "ذهبي",
    bg: "bg-gradient-to-tr from-yellow-600 to-amber-400",
    text: "text-white",
  },
];

const PRESET_ADHKAR = [
  {
    text: "سُبْحَانَ اللهِ",
    target: 100,
    desc: "تسبيح",
    virtue: "تُمحى بها الخطايا وتُكتب بها الحسنات",
  },
  {
    text: "الحَمْدُ للهِ",
    target: 100,
    desc: "تحميد",
    virtue: "تملأ الميزان بالخير والبركة",
  },
  {
    text: "اللهُ أَكْبَرُ",
    target: 100,
    desc: "تكبير",
    virtue: "إقرار بعظمة الله وجلاله",
  },
  {
    text: "لَا إِلَهَ إِلَّا اللهُ",
    target: 100,
    desc: "تهليل",
    virtue: "أفضل الذكر ومفتاح الجنة",
  },
  {
    text: "سُبْحَانَ اللهِ وَبِحَمْدِهِ",
    target: 100,
    desc: "تسبيح وبحمد",
    virtue: "غراس الجنة وتمحو الذنوب وإن كانت مثل زبد البحر",
  },
  {
    text: "سُبْحَانَ اللهِ وَبِحَمْدِهِ، سُبْحَانَ اللهِ العَظِيمِ",
    target: 100,
    desc: "الكلمتان الحبيبتان",
    virtue: "كلمتان خفيفتان على اللسان ثقيلتان في الميزان حبيبتان للرحمن",
  },
  {
    text: "أَسْتَغْفِرُ اللهَ وَأَتُوبُ إِلَيْهِ",
    target: 100,
    desc: "استغفار",
    virtue: "جالبة للرزق ومفرجة للهموم والكروب",
  },
  {
    text: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللهِ",
    target: 100,
    desc: "الحوقلة",
    virtue: "كنز من كنوز الجنة ودواء لـ 99 داء",
  },
  {
    text: "لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ المُلْكُ وَلَهُ الحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    target: 100,
    desc: "الذكر الأعظم",
    virtue: "حرز من الشيطان يومه ذلك وحسنة مضاعفة كعتق 10 رقاب",
  },
  {
    text: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ",
    target: 100,
    desc: "الصلاة على النبي",
    virtue: "من صلى عليه صلاة واحدة صلى الله عليه بها عشراً",
  },
  {
    text: "لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ",
    target: 100,
    desc: "دعاء ذي النون",
    virtue: "ما دعا بها رجل مسلم في شيء قط إلا استجاب الله له",
  },
  {
    text: "حَسْبُنَا اللهُ وَنِعْمَ الوَكِيلُ",
    target: 100,
    desc: "حسبنة",
    virtue: "دفع السوء والهم والظلم والأحزان",
  },
  {
    text: "أَسْتَغْفِرُ اللهَ العَظِيمَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الحَيَّ القَيُّومَ وَأَتُوبُ إِلَيْهِ",
    target: 100,
    desc: "استغفار مأثور",
    virtue: "يوجب المغفرة حتى وإن فر من الزحف",
  },
  {
    text: "سُبْحَانَ اللهِ، وَالحَمْدُ للهِ، وَلَا إِلَهَ إِلَّا اللهُ، وَاللهُ أَكْبَرُ",
    target: 100,
    desc: "الباقيات الصالحات",
    virtue: "أحب الكلام إلى الله وصلاح الشأن كله",
  },
  {
    text: "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ، أَصْلِحْ لِي شَأْنِي كُلَّهُ وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ",
    target: 100,
    desc: "استغاثة الشأن",
    virtue: "وصية رسول الله ﷺ لفاطمة رضي الله عنها لكشف الضر",
  },
  {
    text: "اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ العَفْوَ فَاعْفُ عَنِّي",
    target: 100,
    desc: "دعاء العفو",
    virtue: "أشرف الأدعية التي تُسأل في أوقات العبادة والقبول",
  },
];

const INITIAL_ADHKAR = PRESET_ADHKAR.map((p) => ({
  text: p.text,
  target: p.target,
}));

const DIGITAL_FONTS = [
  {
    id: "digital7",
    nameKey: "font_digital7",
    className: "font-digital",
    skew: true,
  },
  {
    id: "bebas",
    nameKey: "font_bebas",
    className: "font-bebas tracking-[0.02em]",
    skew: false,
  },
  {
    id: "teko",
    nameKey: "font_teko",
    className: "font-teko tracking-[0.02em]",
    skew: false,
  },
  {
    id: "russo",
    nameKey: "font_russo",
    className: "font-russo tracking-normal",
    skew: false,
  },
  {
    id: "chakra",
    nameKey: "font_chakra",
    className: "font-chakra tracking-normal",
    skew: true,
  },
  {
    id: "orbitron",
    nameKey: "font_orbitron",
    className: "font-orbitron tracking-normal",
    skew: false,
  },
];

export const Tasbih: React.FC = () => {
  const { navigate, goBack } = useSmartNavigation();
  const {
    progress,
    incrementTasbih,
    settings,
    updateSettings,
    addTasbihGoal,
    incrementTasbihGoal,
    deleteTasbihGoal,
  } = useAppContext();
  const { updateChallengeProgress } = useChallengeTracker();
  const { t } = useTranslation(settings.appLanguage);

  const appContextGoals = useMemo(() => progress.tasbihGoals || [], [progress.tasbihGoals]);
  const [dhikrCounts, setDhikrCounts] = useState<Record<string, number>>(() => {
    try {
      const saved = safeLocalStorageGetItem("believer_dhikr_counts");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      safeLocalStorageSetItem("believer_dhikr_counts", JSON.stringify(dhikrCounts));
    } catch (e) {
      // Ignore quota errors here
    }
  }, [dhikrCounts]);
  const [target, setTarget] = useState(100);
  const [showSettings, setShowSettings] = useState(false);
  const [theme, setTheme] = useState(THEMES[0]);
  const [remoteGoals, setRemoteGoals] = useState<TasbeehGoal[]>([]);
  const [activeGoalId, setActiveGoalId] = useState<string | null>(null);
  const [activeGoalSource, setActiveGoalSource] = useState<
    "remote" | "appContext"
  >("remote");
  const [rosaryMode, setRosaryMode] = useState<
    | "minimal"
    | "handheld"
    | "pro_device"
    | "egg_modern"
    | "hex_modern"
  >(() => {
    const saved = safeLocalStorageGetItem("believer_tasbih_mode");
    if (saved === "wooden_ring" || saved === "royal" || saved === "smart_ring" || saved === "digital") return "minimal";
    return (
      (saved as
        | "minimal"
        | "handheld"
        | "pro_device"
        | "egg_modern"
        | "hex_modern") || "minimal"
    );
  });
  const [digitalTheme, setDigitalTheme] = useState<
    "golden" | "silver" | "emerald" | "sapphire" | "ruby"
  >(() => {
    return (
      (safeLocalStorageGetItem("believer_tasbih_digital_theme") as any) || "golden"
    );
  });
  const [hexScreenMode, setHexScreenMode] = useState<
    "default" | "cyber_cyan" | "sunset_amber" | "royal_emerald" | "cosmic_purple"
  >(() => {
    return (
      (safeLocalStorageGetItem("believer_tasbih_hex_screen_mode") as any) ||
      "default"
    );
  });

  useEffect(() => {
    safeLocalStorageSetItem("believer_tasbih_hex_screen_mode", hexScreenMode);
  }, [hexScreenMode]);
  const [digitalFont, setDigitalFont] = useState<
    "digital7" | "bebas" | "teko" | "russo" | "chakra" | "orbitron"
  >(() => {
    return (
      (safeLocalStorageGetItem("believer_tasbih_digital_font") as any) ||
      "digital7"
    );
  });
  const [lcdBacklight, setLcdBacklight] = useState(false);
  const [timeString, setTimeString] = useState("");

  const [sessionCount, setSessionCount] = useState<number>(() => {
    try {
      const saved = sessionStorage.getItem("believer_tasbih_session_count");
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    try {
      sessionStorage.setItem("believer_tasbih_session_count", sessionCount.toString());
    } catch {}
  }, [sessionCount]);

  const [pressEffects, setPressEffects] = useState<{ id: number; x: number }[]>([]);

  const renderPressAnimation = () => (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-visible z-50">
      <AnimatePresence>
        {pressEffects.map((eff) => (
          <React.Fragment key={eff.id}>
            <motion.div
              initial={{ opacity: 1, scale: 0.5, y: 0, x: eff.x }}
              animate={{ opacity: 0, scale: 1.6, y: -70, x: eff.x * 1.4 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.65, ease: "easeOut" }}
              className="absolute font-black text-2xl sm:text-3xl text-emerald-300 drop-shadow-[0_3px_12px_rgba(0,0,0,0.9)] pointer-events-none select-none flex items-center gap-0.5 tracking-tight z-50"
            >
              <span className="text-amber-300 text-lg sm:text-xl font-bold">+</span>1
            </motion.div>
            <motion.div
              initial={{ opacity: 0.9, scale: 0.6 }}
              animate={{ opacity: 0, scale: 2.1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              className="absolute w-28 h-28 sm:w-36 sm:h-36 rounded-full border-2 border-emerald-400/90 shadow-[0_0_25px_rgba(52,211,153,0.85)] pointer-events-none select-none z-40"
            />
          </React.Fragment>
        ))}
      </AnimatePresence>
    </div>
  );

  useEffect(() => {
    safeLocalStorageSetItem("believer_tasbih_digital_font", digitalFont);
  }, [digitalFont]);

  const activeFontObj =
    DIGITAL_FONTS.find((f) => f.id === digitalFont) || DIGITAL_FONTS[0];

  const cycleDigitalFont = () => {
    const currentIndex = DIGITAL_FONTS.findIndex((f) => f.id === digitalFont);
    const nextIndex = (currentIndex + 1) % DIGITAL_FONTS.length;
    setDigitalFont(DIGITAL_FONTS[nextIndex].id as any);

    // Tiny vibrate to provide tactile click when switching font
    if (settings.hapticTasbihEnabled !== false) {
      triggerHaptic('light');
    }
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hrs = now.getHours().toString().padStart(2, "0");
      const mins = now.getMinutes().toString().padStart(2, "0");
      setTimeString(`${hrs}:${mins}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    safeLocalStorageSetItem("believer_tasbih_mode", rosaryMode);
  }, [rosaryMode]);

  useEffect(() => {
    safeLocalStorageSetItem("believer_tasbih_digital_theme", digitalTheme);
  }, [digitalTheme]);

  const appContextGoalsRef = useRef(appContextGoals);
  useEffect(() => {
    appContextGoalsRef.current = appContextGoals;
  }, [appContextGoals]);

  const activeGoalIdRef = useRef(activeGoalId);
  useEffect(() => {
    activeGoalIdRef.current = activeGoalId;
  }, [activeGoalId]);

  // Load remote goals
  useEffect(() => {
    if (auth.currentUser) {
      const unsubscribe = progressService.onTasbeehGoals(
        auth.currentUser.uid,
        (goals) => {
          setRemoteGoals(goals);
          // Preference for appContext goals if they exist
          const uncompletedAppGoal = appContextGoalsRef.current.find(
            (g) => !g.isCompleted,
          );
          if (uncompletedAppGoal && !activeGoalIdRef.current) {
            setActiveGoalId(uncompletedAppGoal.id);
            setActiveGoalSource("appContext");
          } else if (!activeGoalIdRef.current && goals.length > 0) {
            // Find first uncompleted goal
            const firstUncompleted = goals.find((g) => !g.isCompleted);
            if (firstUncompleted) {
              setActiveGoalId(firstUncompleted.id!);
              setActiveGoalSource("remote");
            }
          }
        },
      );
      return unsubscribe;
    }
  }, [auth.currentUser]);

  const activeGoal =
    activeGoalSource === "remote"
      ? remoteGoals.find((g) => g.id === activeGoalId)
      : appContextGoals.find((g) => g.id === activeGoalId);

  // Custom Lists State
  const [lists, setLists] = useState<
    { id: string; name: string; adhkar: { text: string; target: number }[] }[]
  >(() => {
    const saved = safeLocalStorageGetItem("believer_tasbih_lists");
    if (!saved) {
      return [{ id: "default", name: "قائمتي", adhkar: INITIAL_ADHKAR }];
    }
    try {
      const parsed = JSON.parse(saved);
      const defaultList = parsed.find((l: any) => l.id === "default");
      if (defaultList && defaultList.adhkar.length <= 4) {
        defaultList.adhkar = INITIAL_ADHKAR;
        safeLocalStorageSetItem("believer_tasbih_lists", JSON.stringify(parsed));
      }
      return parsed;
    } catch (e) {
      return [{ id: "default", name: "قائمتي", adhkar: INITIAL_ADHKAR }];
    }
  });
  const [activeListId, setActiveListId] = useState<string>(() => {
    const saved = safeLocalStorageGetItem("believer_tasbih_active_list_id");
    return saved || "default";
  });

  // Derived state
  const activeList = lists.find((l) => l.id === activeListId) || lists[0];
  const [currentDhikr, setCurrentDhikr] = useState(
    activeList.adhkar[0] || { text: "لا يوجد ذكر", target: 100 },
  );
  const localCount = dhikrCounts[`${rosaryMode}_${currentDhikr.text}`] || 0;
  const [newDhikrText, setNewDhikrText] = useState("");
  const [newDhikrTarget, setNewDhikrTarget] = useState<number>(100);
  const [newListName, setNewListName] = useState("");
  const [newGoalText, setNewGoalText] = useState("");
  const [newGoalTarget, setNewGoalTarget] = useState<number>(100);
  const [tasbihError, setTasbihError] = useState<string | null>(null);

  // Daily goal
  useEffect(() => {
    // Reset local count at start of day? No, just keep track of daily progress
  }, []);

  const progressPercentage = Math.min(
    (localCount / (settings.tasbihDailyGoal || 100)) * 100,
    100,
  );

  const playClickSound = () => {
    if (settings.tasbihSoundEnabled) {
      playTasbihClickSound();
    }
  };

  // Persist lists
  useEffect(() => {
    safeLocalStorageSetItem("believer_tasbih_lists", JSON.stringify(lists));
    safeLocalStorageSetItem("believer_tasbih_active_list_id", activeListId);
  }, [lists, activeListId]);

  const handlePress = () => {
    setSessionCount((prev) => prev + 1);

    const effectId = Date.now() + Math.random();
    const offsetX = (Math.random() - 0.5) * 40;
    setPressEffects((prev) => [...prev.slice(-4), { id: effectId, x: offsetX }]);
    setTimeout(() => {
      setPressEffects((prev) => prev.filter((e) => e.id !== effectId));
    }, 750);

    const newCount = localCount + 1;

    if (activeGoal) {
      if (activeGoalSource === "remote") {
        progressService.updateTasbeehGoalCount(
          auth.currentUser!.uid,
          activeGoalId!,
          1,
        );
      } else {
        incrementTasbihGoal(activeGoalId!);
      }
    } else {
      setDhikrCounts((prev) => ({ ...prev, [`${rosaryMode}_${currentDhikr.text}`]: newCount }));
      incrementTasbih();
    }

    updateChallengeProgress(ChallengeCategory.TASBIH, 1);

    playClickSound();

    // Immersive Tactile feedback (Haptic Tasbih)
    const currentVal = activeGoal ? activeGoal.currentCount + 1 : newCount;
    const currentTarget = activeGoal ? activeGoal.targetCount : (currentDhikr.target || target || 100);

    // Goal reached requirements:
    // - Goal reached MUST appear at 100, 200, 300, 400... up to 1000 and beyond.
    // - Goal reached MUST NOT appear at 33 or 66.
    const isExcluded = currentVal === 33 || currentVal === 66;
    const isHundredMilestone = currentVal > 0 && currentVal % 100 === 0;
    const isActiveGoalComplete = activeGoal && currentVal === activeGoal.targetCount && !isExcluded;

    if (!isExcluded && (isHundredMilestone || isActiveGoalComplete)) {
      const messages = [
        "ما شاء الله، واصل مسيرتك!",
        "أحسنت، ذكر الله يطمئن القلب.",
        "بارك الله في وقتك وجهدك.",
        "استمر، فكل تسبيحة غراس في الجنة.",
        "رائع! حافظ على هذا النور.",
        "زادك الله فضلاً وقرباً.",
        "تقبل الله منك صالح الأعمال."
      ];
      const randomMsg = messages[Math.floor(Math.random() * messages.length)];
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `🎯 تم بلوغ الهدف (${currentVal} تسبيحة)! ${randomMsg}`, type: 'success' } 
      }));
    }

    if (settings.hapticTasbihEnabled !== false) {
      const isCelebration = !isExcluded && (isHundredMilestone || isActiveGoalComplete);
      if (isCelebration) {
        triggerHaptic('success');
      } else {
        triggerHaptic('light');
      }
    }
  };

  const cycleHexScreenMode = () => {
    const modes = ["default", "cyber_cyan", "sunset_amber", "royal_emerald", "cosmic_purple"];
    const currentIndex = modes.indexOf(hexScreenMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setHexScreenMode(modes[nextIndex] as any);
    if (settings.hapticTasbihEnabled !== false) {
      triggerHaptic('light');
    }
  };

  const cycleDigitalTheme = () => {
    const keys = Object.keys(DIGITAL_THEMES) as Array<
      "golden" | "silver" | "emerald" | "sapphire" | "ruby"
    >;
    const currentIndex = keys.indexOf(digitalTheme);
    const nextIndex = (currentIndex + 1) % keys.length;
    setDigitalTheme(keys[nextIndex]);
    if (settings.hapticTasbihEnabled !== false) {
      triggerHaptic('light');
    }
  };

  const reset = () => {
    if (settings.hapticTasbihEnabled !== false) {
      triggerHaptic('medium');
    }
    if (activeGoal) {
      if (activeGoalSource === "remote") {
        progressService.resetTasbeehGoal(auth.currentUser!.uid, activeGoalId!);
      } else {
        // Local reset not explicitly implemented in AppContext yet, but we can set localCount 0
        setDhikrCounts((prev) => ({ ...prev, [`${rosaryMode}_${currentDhikr.text}`]: 0 }));
      }
    } else {
      setDhikrCounts((prev) => ({ ...prev, [`${rosaryMode}_${currentDhikr.text}`]: 0 }));
    }
  };

  const cycleDhikr = (direction: "next" | "prev") => {
    const currentIndex = activeList.adhkar.findIndex(
      (d) => d.text === currentDhikr.text,
    );
    if (currentIndex !== -1) {
      let nextIndex =
        direction === "next" ? currentIndex + 1 : currentIndex - 1;
      if (nextIndex >= activeList.adhkar.length) nextIndex = 0;
      if (nextIndex < 0) nextIndex = activeList.adhkar.length - 1;

      const selected = activeList.adhkar[nextIndex];
      setCurrentDhikr(selected);
      setTarget(selected.target);

      if (settings.hapticTasbihEnabled !== false) {
        triggerHaptic('light');
      }
    }
  };

  const addDhikr = () => {
    const trimmed = newDhikrText.trim();
    if (!trimmed) {
      setTasbihError("يرجى كتابة نص الذكر أولاً قبل الإضافة.");
      return;
    }
    const safety = checkInputSafety(trimmed);
    if (!safety.isSafe) {
      setTasbihError(safety.reasonAr || "النص المضاف غير آمن.");
      return;
    }
    setTasbihError(null);
    const cleaned = sanitizeString(trimmed);
    const validTarget = Number(newDhikrTarget) > 0 ? Number(newDhikrTarget) : 100;
    const newDhikrObj = { text: cleaned, target: validTarget };

    setLists((prev) => {
      const hasActive = prev.some((l) => l.id === activeListId);
      if (!hasActive && prev.length > 0) {
        return prev.map((l, idx) =>
          idx === 0 ? { ...l, adhkar: [...l.adhkar, newDhikrObj] } : l
        );
      }
      return prev.map((list) => {
        if (list.id === activeListId) {
          const exists = list.adhkar.some((d) => d.text === cleaned);
          if (exists) {
            return {
              ...list,
              adhkar: list.adhkar.map((d) =>
                d.text === cleaned ? { ...d, target: validTarget } : d
              ),
            };
          }
          return {
            ...list,
            adhkar: [...list.adhkar, newDhikrObj],
          };
        }
        return list;
      });
    });

    setCurrentDhikr(newDhikrObj);
    setTarget(validTarget);
    setNewDhikrText("");

    if (settings.hapticTasbihEnabled !== false) {
      triggerHaptic("success");
    }

    window.dispatchEvent(
      new CustomEvent("show-toast", {
        detail: {
          message: `✨ تمت إضافة الذكر "${cleaned}" بنجاح!`,
          type: "success",
        },
      }),
    );
  };

  const deleteDhikrFromList = (dhikrText: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setLists((prev) =>
      prev.map((list) => {
        if (list.id === activeListId) {
          return {
            ...list,
            adhkar: list.adhkar.filter((d) => d.text !== dhikrText),
          };
        }
        return list;
      })
    );
    if (currentDhikr.text === dhikrText) {
      const currentListAdhkar = activeList.adhkar.filter((d) => d.text !== dhikrText);
      if (currentListAdhkar.length > 0) {
        setCurrentDhikr(currentListAdhkar[0]);
        setTarget(currentListAdhkar[0].target);
      } else {
        setCurrentDhikr({ text: "لا يوجد ذكر", target: 100 });
        setTarget(100);
      }
    }
  };

  const createList = () => {
    const trimmed = newListName.trim();
    if (!trimmed) {
      setTasbihError("يرجى كتابة اسم القائمة أولاً.");
      return;
    }
    const safety = checkInputSafety(trimmed);
    if (!safety.isSafe) {
      setTasbihError(safety.reasonAr || "النص المضاف غير آمن.");
      return;
    }
    setTasbihError(null);
    const cleaned = sanitizeString(trimmed);
    const newList = {
      id: Math.random().toString(36).substr(2, 9),
      name: cleaned,
      adhkar: [],
    };
    setLists((prev) => [...prev, newList]);
    setActiveListId(newList.id);
    setNewListName("");
    window.dispatchEvent(
      new CustomEvent("show-toast", {
        detail: {
          message: `📁 تم إنشاء القائمة "${cleaned}" بنجاح!`,
          type: "success",
        },
      }),
    );
  };

  const deleteList = (listId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (listId === "default" || lists.length <= 1) {
      setTasbihError("لا يمكن حذف القائمة الرئيسية الافتراضية.");
      return;
    }
    const filtered = lists.filter((l) => l.id !== listId);
    setLists(filtered);
    if (activeListId === listId) {
      const nextList = filtered[0] || { id: "default", name: "قائمتي", adhkar: INITIAL_ADHKAR };
      setActiveListId(nextList.id);
      if (nextList.adhkar.length > 0) {
        setCurrentDhikr(nextList.adhkar[0]);
        setTarget(nextList.adhkar[0].target);
      }
    }
  };

  const handleAddGoal = () => {
    const trimmed = newGoalText.trim();
    if (!trimmed) {
      setTasbihError("يرجى كتابة نص الهدف أولاً.");
      return;
    }
    const safety = checkInputSafety(trimmed);
    if (!safety.isSafe) {
      setTasbihError(safety.reasonAr || "النص المضاف غير آمن.");
      return;
    }
    setTasbihError(null);
    const cleaned = sanitizeString(trimmed);
    const parsedTarget = Number(newGoalTarget) > 0 ? Number(newGoalTarget) : 100;
    
    if (auth.currentUser) {
      addNewGoal(cleaned, parsedTarget);
    } else {
      addTasbihGoal(cleaned, parsedTarget);
    }
    
    setNewGoalText("");
    window.dispatchEvent(
      new CustomEvent("show-toast", {
        detail: {
          message: `🎯 تم إضافة الهدف "${cleaned}" بنجاح!`,
          type: "success",
        },
      }),
    );
  };

  const addNewGoal = async (dhikrText: string, targetValue: number = 33) => {
    if (!auth.currentUser || !dhikrText) return;
    const goalId = await progressService.addTasbeehGoal(auth.currentUser.uid, {
      dhikrId: Math.random().toString(36).substr(2, 6),
      titleAr: dhikrText,
      targetCount: targetValue,
      currentCount: 0,
      isCompleted: false,
    });
    setActiveGoalId(goalId);
    setShowSettings(false);
  };

  const handheldThemeConfig =
    HANDHELD_THEMES[digitalTheme] || HANDHELD_THEMES.golden;
  const proThemeConfig = PRO_THEMES[digitalTheme] || PRO_THEMES.golden;
  const eggThemeConfig = EGG_THEMES[digitalTheme] || EGG_THEMES.golden;
  const hexThemeConfig = HEX_THEMES[digitalTheme] || HEX_THEMES.golden;


  return (
    <div
      className={cn(
        "h-full flex flex-col items-center justify-between py-8 transition-colors duration-200 overflow-hidden",
        !showSettings && "touch-none",
        theme.bg,
      )}
    >
      <div className="w-full px-6 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <BackButton />
          <h2 className="text-xl font-black text-white tracking-tight drop-shadow-sm">
            {t("tasbihNav")}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {[
            "handheld",
            "pro_device",
            "egg_modern",
            "hex_modern",
          ].includes(rosaryMode) && (
            <button
              onClick={cycleDigitalTheme}
              className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm text-amber-300 hover:bg-white/20 transition-all duration-75 active:scale-[0.85] active:opacity-70 flex items-center gap-1.5"
              title={t("change_theme")}
            >
              <Palette size={20} />
              <span className="text-[11px] font-black hidden xs:inline-block leading-none">
                {t("change_theme")}
              </span>
            </button>
          )}
          <button
            onClick={() =>
              setRosaryMode((prev) =>
                prev === "minimal"
                  ? "handheld"
                  : prev === "handheld"
                    ? "pro_device"
                    : prev === "pro_device"
                      ? "egg_modern"
                      : prev === "egg_modern"
                        ? "hex_modern"
                        : "minimal",
              )
            }
            className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all duration-75 active:scale-[0.85] active:opacity-70"
            title={t("change_device_shape")}
          >
            <Watch size={22} />
          </button>
          <button
            onClick={reset}
            className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all duration-75 active:scale-[0.85] active:opacity-70"
            title={t("reset")}
          >
            <RotateCcw size={22} />
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all duration-75 active:scale-[0.85] active:opacity-70"
            title={t("settings")}
          >
            <Settings size={22} />
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center flex-1 w-full max-w-md px-6">
        {/* Subha Style Segmented Selector */}
        <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md p-1 rounded-2xl border border-white/10 mb-6 relative z-10 shrink-0 select-none shadow-sm flex-wrap justify-center">
          <button
            onClick={() => setRosaryMode("minimal")}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-black transition-all duration-200",
              rosaryMode === "minimal"
                ? "bg-white text-slate-900 shadow-md font-extrabold"
                : "text-white/70 hover:text-white hover:bg-white/5",
            )}
          >
            {t("tasbih_mode_classic")}
          </button>
          <button
            onClick={() => setRosaryMode("handheld")}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-black transition-all duration-300 flex items-center gap-1",
              rosaryMode === "handheld"
                ? "bg-white text-slate-900 shadow-md font-extrabold"
                : "text-white/70 hover:text-white hover:bg-white/5",
            )}
          >
            {t("tasbih_mode_handheld")} ✨
          </button>
          <button
            onClick={() => setRosaryMode("pro_device")}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-black transition-all duration-300 flex items-center gap-1",
              rosaryMode === "pro_device"
                ? "bg-white text-slate-900 shadow-md font-extrabold"
                : "text-white/70 hover:text-white hover:bg-white/5",
            )}
          >
            {t("tasbih_mode_pro")} 🏆
          </button>
          <button
            onClick={() => setRosaryMode("egg_modern")}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-black transition-all duration-300 flex items-center gap-1",
              rosaryMode === "egg_modern"
                ? "bg-white text-slate-900 shadow-md font-extrabold"
                : "text-white/70 hover:text-white hover:bg-white/5",
            )}
          >
            {t("tasbih_mode_oval")} 🥚
          </button>
          <button
            onClick={() => setRosaryMode("hex_modern")}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-black transition-all duration-300 flex items-center gap-1",
              rosaryMode === "hex_modern"
                ? "bg-white text-slate-900 shadow-md font-extrabold"
                : "text-white/70 hover:text-white hover:bg-white/5",
            )}
          >
            {t("tasbih_mode_hex")} 🔲
          </button>
        </div>

        {/* Session Total Tasbih Badge */}
        <div className="flex items-center justify-between w-full max-w-sm px-2 mb-4 select-none shrink-0 z-10">
          <div className="flex items-center gap-2 bg-slate-900/50 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-white/15 text-white shadow-md">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
            <span className="text-xs font-extrabold text-white/90">إجمالي الجلسة:</span>
            <span className="text-sm font-black text-amber-300 font-digital tracking-wide drop-shadow-sm">{sessionCount}</span>
          </div>

          {sessionCount > 0 && (
            <button
              onClick={() => setSessionCount(0)}
              className="text-[10px] font-bold text-amber-200/80 hover:text-white bg-white/10 hover:bg-white/20 px-2.5 py-1.5 rounded-xl transition-all border border-white/10 active:scale-95 flex items-center gap-1 cursor-pointer"
              title="تصفير عداد الجلسة الحالية"
            >
              <RotateCcw size={11} />
              <span>تصفير الجلسة</span>
            </button>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 w-full"
        >
          {activeGoal ? (
            <div className="flex flex-col items-center mb-2">
              <div className="flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full mb-2">
                <Target size={14} className="text-white" />
                <span className="text-[10px] font-black text-white/90 uppercase tracking-widest">
                  {t("active_goal")}
                </span>
              </div>
              <p className="text-white/90 font-bold text-lg mb-2 drop-shadow-sm">
                {activeGoalSource === "remote"
                  ? (activeGoal as any).titleAr
                  : (activeGoal as any).text}
              </p>
            </div>
          ) : (
            <p className="text-white/90 font-bold text-lg mb-2 drop-shadow-sm">
              {currentDhikr.text}
            </p>
          )}

          {rosaryMode === "minimal" && (
            <>
              <div className="text-[110px] leading-none font-black text-white tabular-nums drop-shadow-lg tracking-tighter transition-all duration-300">
                {activeGoal ? activeGoal.currentCount : localCount}
              </div>
              <div className="w-full bg-black/20 rounded-full h-2 mt-4 overflow-hidden">
                <motion.div
                  className="bg-white/80 h-full"
                  initial={{ width: 0 }}
                  animate={{
                    width: activeGoal
                      ? `${Math.min((activeGoal.currentCount / activeGoal.targetCount) * 100, 100)}%`
                      : `${progressPercentage}%`,
                  }}
                />
              </div>
              {activeGoal ? (
                <p className="text-white/80 font-bold mt-2 text-sm">
                  {t("remaining_of", {
                    remaining: Math.max(
                      activeGoal.targetCount - activeGoal.currentCount,
                      0,
                    ),
                    target: activeGoal.targetCount,
                  })}
                </p>
              ) : (
                <p className="text-white/80 font-bold mt-2 text-sm">
                  {t("daily_goal_count", {
                    count: settings.tasbihDailyGoal || 100,
                  })}
                </p>
              )}
            </>
          )}
        </motion.div>

        {rosaryMode === "minimal" && (
          <button
            onClick={handlePress}
            className={cn(
              "w-64 h-64 rounded-full backdrop-blur-md border-8 flex items-center justify-center active:scale-90 transition-all shadow-2xl relative group duration-500 overflow-visible",
              localCount > 0 && localCount % 100 === 0
                ? "bg-white border-white hover:bg-slate-100"
                : "bg-white/10 border-white/10 hover:bg-white/20",
              settings.tasbihBeadStyle === "pearl"
                ? "border-amber-100 bg-gradient-to-br from-white to-amber-50"
                : settings.tasbihBeadStyle === "wood"
                  ? "border-amber-800 bg-amber-700"
                  : settings.tasbihBeadStyle === "metal"
                    ? "border-slate-400 bg-slate-300"
                    : settings.tasbihBeadStyle === "crystal"
                      ? "border-sky-300 bg-sky-100/50"
                      : settings.tasbihBeadStyle === "onyx"
                        ? "border-slate-900 bg-slate-950"
                        : settings.tasbihBeadStyle === "marble"
                          ? "border-slate-200 bg-slate-50"
                          : settings.tasbihBeadStyle === "silver"
                              ? "border-slate-300 bg-slate-200"
                              : settings.tasbihBeadStyle === "emerald"
                                ? "border-emerald-700 bg-emerald-600"
                                : settings.tasbihBeadStyle === "sapphire"
                                  ? "border-blue-700 bg-blue-600"
                                  : settings.tasbihBeadStyle === "ruby"
                                    ? "border-red-700 bg-red-600"
                                    : "",
            )}
          >
            {renderPressAnimation()}
            <div className="absolute inset-0 rounded-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse" />
            <Fingerprint
              size={90}
              className={cn(
                "relative z-10 transition-colors duration-500",
                localCount > 0 && localCount % 100 === 0
                  ? "text-slate-800"
                  : "text-white",
              )}
            />
          </button>
        )}


        {rosaryMode === "handheld" && (
          <div className="relative w-[285px] h-[385px] sm:w-[310px] sm:h-[415px] flex flex-col items-center select-none pt-[22px] sm:pt-[24px]">
            {/* Invisible SVG to define clipPath */}
            <svg width="0" height="0" className="absolute">
              <defs>
                <clipPath id="hourglass-clip" clipPathUnits="objectBoundingBox">
                  <path d="M 0.29 0 L 0.71 0 C 0.871 0, 1 0.096, 1 0.217 C 1 0.337, 0.919 0.386, 0.919 0.5 C 0.919 0.614, 1 0.663, 1 0.783 C 1 0.904, 0.871 1, 0.71 1 L 0.29 1 C 0.129 1, 0 0.904, 0 0.783 C 0 0.663, 0.081 0.614, 0.081 0.5 C 0.081 0.386, 0 0.337, 0 0.217 C 0 0.096, 0.129 0, 0.29 0 Z" />
                </clipPath>
              </defs>
            </svg>

            {/* Base body with drop shadow trick (since clip-path removes shadows) */}
            <div className="absolute inset-0 w-full h-full filter drop-shadow-[0_25px_35px_rgba(0,0,0,0.8)] pointer-events-none z-0">
              <div
                className={cn(
                  "w-full h-full bg-gradient-to-b shadow-[inset_0_3px_8px_rgba(255,255,255,0.08)]",
                  handheldThemeConfig.bodyBg,
                )}
                style={{ clipPath: "url(#hourglass-clip)" }}
              >
                {/* Realistically glossy highlight sweep inside the clipped shape */}
                <div className="absolute top-2 left-6 w-20 sm:w-24 h-28 sm:h-32 bg-gradient-to-tr from-transparent via-white/[0.04] to-white/[0.08] rounded-full blur-xl transform -rotate-45 pointer-events-none" />
              </div>
            </div>

            {/* The golden frames (outer and inner) */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-10"
              viewBox="0 0 310 415"
              preserveAspectRatio="none"
            >
              {/* Base exact path for the golden border stroke */}
              <path
                d="M 90 2 L 220 2 C 270 2, 308 40, 308 90 C 308 140, 285 160, 285 207.5 C 285 255, 308 275, 308 325 C 308 375, 270 413, 220 413 L 90 413 C 40 413, 2 375, 2 325 C 2 275, 25 255, 25 207.5 C 25 160, 2 140, 2 90 C 2 40, 40 2, 90 2 Z"
                className={cn(
                  "fill-transparent",
                  handheldThemeConfig.strokeCol,
                )}
                strokeWidth="4"
              />
              {/* Inner thinner golden stroke */}
              <path
                d="M 90 8 L 220 8 C 260 8, 300 45, 300 90 C 300 140, 275 160, 275 207.5 C 275 255, 300 275, 300 325 C 300 370, 260 407, 220 407 L 90 407 C 50 407, 10 370, 10 325 C 10 275, 35 255, 35 207.5 C 35 160, 10 140, 10 90 C 10 45, 50 8, 90 8 Z"
                className={cn(
                  "fill-transparent opacity-[0.65]",
                  handheldThemeConfig.strokeCol,
                )}
                strokeWidth="1.5"
              />
            </svg>

            {/* Premium Gilded Frame for LCD screen - stretched downward and optimized gap spacing */}
            <div
              className={cn(
                "relative w-[80%] h-[142px] sm:h-[156px] rounded-[24px] sm:rounded-[28px] p-[4.5px] sm:p-[5.5px] mb-1.5 z-15 transition-all duration-500",
                handheldThemeConfig.bezelBg,
                lcdBacklight
                  ? "shadow-[0_10px_20px_rgba(0,0,0,0.65),inset_0_2px_4px_rgba(255,255,255,0.65),0_0_12px_rgba(50,242,236,0.2)]"
                  : "shadow-[0_10px_20px_rgba(0,0,0,0.6)]",
              )}
            >
              <div
                className={cn(
                  "absolute inset-[1.5px] rounded-[20px] sm:rounded-[23px] border pointer-events-none",
                  handheldThemeConfig.bezelInnerBorder,
                )}
              />

              {/* LCD Inner Screen Core - Click to change Font, and realistic style colors */}
              <div
                onClick={() => cycleDigitalFont()}
                className={cn(
                  "w-full h-full rounded-[18px] sm:rounded-[21px] p-3 sm:p-3.5 flex flex-col justify-between transition-all duration-500 overflow-hidden relative shadow-[inset_0_8px_15px_rgba(0,0,0,0.8)] border border-black/30 cursor-pointer",
                  lcdBacklight
                    ? "bg-gradient-to-b " +
                        handheldThemeConfig.lcdOn +
                        " " +
                        handheldThemeConfig.lcdTextOn
                    : "bg-gradient-to-b " +
                        handheldThemeConfig.lcdOff +
                        " " +
                        handheldThemeConfig.lcdTextOff,
                )}
                title={t("counter_font")}
              >
                {/* Simulated Glass Reflection */}
                <div className="absolute -top-12 -left-12 w-48 h-32 bg-gradient-to-b from-white/12 to-transparent rounded-full blur-xs transform -rotate-15 pointer-events-none" />

                {/* Authentic tiny digital LCD grid pattern overlay */}
                <div className="absolute inset-0 opacity-[0.045] bg-[linear-gradient(rgba(0,0,0,1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,1)_1px,transparent_1px)] bg-[size:3px_3px] pointer-events-none" />

                {/* Left/Right Hotspots for interactive, invisible Dhikr selection inside screen */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    cycleDhikr("prev");
                  }}
                  className="absolute left-0 top-0 bottom-0 w-6 flex items-center justify-center text-black/5 hover:text-black/25 transition-colors z-20 cursor-pointer text-xs"
                  title={t("prev_dhikr")}
                >
                  <ChevronRight size={12} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    cycleDhikr("next");
                  }}
                  className="absolute right-0 top-0 bottom-0 w-6 flex items-center justify-center text-black/5 hover:text-black/25 transition-colors z-20 cursor-pointer text-xs"
                  title={t("next_dhikr")}
                >
                  <ChevronLeft size={12} />
                </button>

                {/* Digits and Centered Active Dhikr inside LCD Screen */}
                <div className="relative w-full flex-1 flex flex-col justify-center items-center select-none pt-1">
                  {/* LCD Segment Matrix Shadow placeholder (replicates physical 7-segment display) */}
                  <div className="absolute inset-0 flex justify-center items-center pointer-events-none select-none">
                    <span
                      className={cn(
                        "text-[52px] sm:text-[62px] font-bold opacity-[0.035] transition-colors duration-500",
                        activeFontObj.className,
                        lcdBacklight
                          ? "text-[#052423]/15"
                          : "text-[#232422]/15",
                      )}
                      style={{
                        transform: activeFontObj.skew ? "skewX(-3deg)" : "none",
                      }}
                    >
                      8888
                    </span>
                  </div>

                  {/* Actual Main counter display digits - chunky, bold digital numbers */}
                  <span
                    className={cn(
                      "font-black leading-none transition-all duration-300 relative z-10 select-none",
                      activeFontObj.className,
                      lcdBacklight
                        ? "text-[#052423] drop-shadow-[0_0_6px_rgba(44,246,240,0.55)]"
                        : "text-[#232422] drop-shadow-[0.5px_0.5px_0_rgba(255,255,255,0.25)]",
                    )}
                    style={{
                      transform: activeFontObj.skew ? "skewX(-3deg)" : "none",
                      fontSize: `calc(${settings.adhkarFontSize || '20px'} * 3)`
                    }}
                  >
                    {(activeGoal ? activeGoal.currentCount : localCount)
                      .toString()
                      .padStart(4, "0")}
                  </span>

                  {/* Centered Dhikr name inside LCD screen - EXACTLY "وسط الشاشة" */}
                  <span
                    className={cn(
                      "font-sans text-[11px] sm:text-[12px] font-extrabold leading-none mt-1 animate-fade-in relative z-10 select-none text-center px-1 max-w-[150px] truncate",
                      lcdBacklight ? "text-[#052423]" : "text-[#232422]",
                    )}
                    dir="rtl"
                  >
                    {activeGoal
                      ? activeGoalSource === "remote"
                        ? (activeGoal as any).titleAr
                        : (activeGoal as any).text
                      : currentDhikr.text}
                  </span>
                </div>

                {/* Bottom LCD Row - Clock on Left, and goal summary on Right */}
                <div className="flex flex-row justify-between items-end w-full px-2 pb-0.5 shrink-0 relative z-10 select-none">
                  {/* Real-time CLOCK clock looking like physical device */}
                  <span
                    className={cn(
                      "text-[10px] sm:text-[11px] font-digital font-bold tracking-[0.04em] leading-none mb-[1px]",
                      lcdBacklight ? "text-[#052423]" : "text-[#232422]",
                    )}
                    style={{ transform: "skewX(-2deg)" }}
                  >
                    {timeString}
                  </span>

                  {/* Track target number */}
                  <span
                    className={cn(
                      "font-sans text-[10px] sm:text-[11px] font-bold leading-none opacity-85",
                      lcdBacklight ? "text-[#052423]" : "text-[#232422]",
                    )}
                  >
                    {t("target_label")}: {activeGoal ? activeGoal.targetCount : "100"}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Buttons Deck: Golden spherical domes with dynamic coordinates */}
            <div className="relative w-full h-[120px] mt-auto select-none z-15">
              {/* Labeled 'Light' button (Left) */}
              <div className="absolute left-[12%] top-[8px] flex flex-col items-center gap-1.5 w-14">
                <button
                  onClick={() => setLcdBacklight((prev) => !prev)}
                  className={cn(
                    "w-[34px] h-[34px] sm:w-[38px] sm:h-[38px] rounded-full active:scale-90 transition-all cursor-pointer flex items-center justify-center relative p-[1.5px]",
                    handheldThemeConfig.smallButtonBg,
                    "shadow-[0_4px_8px_rgba(0,0,0,0.55),inset_0_1px_2px_rgba(255,255,255,0.7)]",
                  )}
                  title={t("light")}
                >
                  <div
                    className={cn(
                      "absolute inset-[1.5px] rounded-full shadow-[inset_0_1.5px_3px_rgba(255,255,255,0.7)]",
                      handheldThemeConfig.smallButtonInner,
                    )}
                  />
                  {/* Glow indicator if light is Active */}
                  {lcdBacklight && (
                    <div className="absolute inset-[3px] rounded-full bg-white/40 blur-[1px] animate-pulse" />
                  )}
                </button>
                <span
                  className={cn(
                    "text-[10px] sm:text-[11px] font-sans font-extrabold uppercase tracking-wider leading-none drop-shadow-sm select-none",
                    handheldThemeConfig.labelTextCol,
                  )}
                >
                  {t("light")}
                </span>
              </div>

              {/* GIANT COUNT BUTTON (Center, Lower-triangular Position) */}
              <div className="absolute left-1/2 top-[12px] sm:top-[14px] -translate-x-1/2 flex flex-col items-center">
                <button
                  onClick={handlePress}
                  className={cn(
                    "w-[115px] h-[85px] sm:w-[130px] sm:h-[95px] rounded-full active:scale-[0.93] active:translate-y-[2px] transition-all duration-100 flex items-center justify-center relative p-[2px] cursor-pointer z-20 overflow-visible",
                    handheldThemeConfig.countButtonBg,
                    "shadow-[0_12px_24px_rgba(0,0,0,0.8),inset_0_3px_6px_rgba(255,255,255,0.7)]",
                    DIGITAL_THEMES[digitalTheme].buttonGlow,
                  )}
                  title={t("tasbih_counter")}
                >
                  {renderPressAnimation()}
                  {/* Metallic reflections bevel edges */}
                  <div
                    className={cn(
                      "absolute inset-[2.5px] rounded-full shadow-[inset_0_2px_4px_rgba(255,255,255,0.85)] bg-gradient-to-b",
                      handheldThemeConfig.countButtonInner,
                    )}
                  />
                  {/* Inner core dome shading */}
                  <div
                    className={cn(
                      "absolute inset-[5.5px] sm:inset-[7px] rounded-full shadow-[inset_0_-2px_5px_rgba(0,0,0,0.55),0_0_12px_rgba(255,255,255,0.15)] flex flex-col items-center justify-center overflow-hidden",
                      handheldThemeConfig.smallButtonBg,
                    )}
                  >
                    <Fingerprint
                      className={cn(
                        "w-6 h-6 sm:w-7 sm:h-7 opacity-75 mb-0.5 transition-colors duration-500",
                        DIGITAL_THEMES[digitalTheme].buttonIcon,
                      )}
                    />
                  </div>
                  {/* Mirror light shine sweep */}
                  <div className="absolute inset-x-3 top-2.5 h-[25%] bg-gradient-to-b from-white/30 to-transparent rounded-full pointer-events-none filter blur-[0.5px]" />
                </button>
              </div>

              {/* Labeled 'Reset' button (Right) */}
              <div className="absolute right-[12%] top-[8px] flex flex-col items-center gap-1.5 w-14">
                <button
                  onClick={reset}
                  className={cn(
                    "w-[34px] h-[34px] sm:w-[38px] sm:h-[38px] rounded-full active:scale-90 transition-all cursor-pointer flex items-center justify-center relative p-[1.5px]",
                    handheldThemeConfig.smallButtonBg,
                    "shadow-[0_4px_8px_rgba(0,0,0,0.55),inset_0_1px_2px_rgba(255,255,255,0.7)]",
                  )}
                  title={t("reset")}
                >
                  <div
                    className={cn(
                      "absolute inset-[1.5px] rounded-full shadow-[inset_0_1.5px_3px_rgba(255,255,255,0.7)]",
                      handheldThemeConfig.smallButtonInner,
                    )}
                  />
                </button>
                <span
                  className={cn(
                    "text-[10px] sm:text-[11px] font-sans font-extrabold uppercase tracking-wider leading-none drop-shadow-sm select-none",
                    handheldThemeConfig.labelTextCol,
                  )}
                >
                  {t("reset")}
                </span>
              </div>
            </div>
          </div>
        )}

        {rosaryMode === "pro_device" && (
          <div className="relative w-[280px] h-[390px] sm:w-[315px] sm:h-[435px] flex items-center justify-center select-none mt-2 sm:mt-4 shrink-0 transition-all duration-300">
            <div
              className={cn(
                "w-full h-full rounded-[90px_90px_120px_120px] sm:rounded-[100px_100px_130px_130px] shadow-[0_30px_60px_rgba(0,0,0,0.8),inset_0_5px_15px_rgba(255,255,255,0.15)] flex flex-col items-center relative overflow-hidden border-[2px]",
                proThemeConfig.bodyBg,
                proThemeConfig.bodyOuterBorder,
              )}
            >
              {/* Subtle Outer Metal Ring */}
              <div
                className={cn(
                  "absolute inset-2 sm:inset-[8px] rounded-[80px_80px_110px_110px] sm:rounded-[90px_90px_120px_120px] border-[2px] sm:border-[3px] pointer-events-none opacity-80",
                  proThemeConfig.bodyInnerRing,
                  "bg-gradient-to-br from-white/10 to-transparent",
                )}
              />

              {/* Deep Device Shadows to create the recessed center effect */}
              <div className="absolute inset-4 rounded-[75px_75px_100px_100px] sm:rounded-[80px_80px_110px_110px] shadow-[inset_0_20px_40px_rgba(0,0,0,0.6),0_2px_4px_rgba(255,255,255,0.1)] pointer-events-none" />

              <div className="flex-1 w-full flex flex-col items-center pt-[25px] sm:pt-[30px] px-5 relative z-10 gap-3 sm:gap-4">
                {/* Battery and Progress panel above screen */}
                <div className="w-[140px] h-[16px] flex items-center justify-center gap-2">
                  <div className="flex gap-[3px] items-center px-2 py-0.5 rounded-full">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "h-[6px] rounded-sm transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]",
                          i <
                            (localCount >= 100
                              ? 6
                              : localCount >= 66
                                ? 4
                                : localCount >= 33
                                  ? 2
                                  : 0)
                            ? proThemeConfig.goldText +
                                " w-[10px] bg-current opacity-100 shadow-[0_0_5px_currentColor]"
                            : "w-[10px] bg-black/40",
                        )}
                      />
                    ))}
                  </div>
                  <div
                    className={cn(
                      "w-[22px] h-[10px] rounded-[2px] border flex items-center p-[1.5px] relative",
                      proThemeConfig.bodyOuterBorder,
                    )}
                  >
                    <div
                      className={cn(
                        "absolute -left-[2px] top-[20%] h-[60%] w-[1.5px] rounded-l-sm",
                        proThemeConfig.bodyOuterBorder,
                        "bg-current",
                      )}
                    />
                    <div
                      className={cn(
                        "h-full rounded-[1px] transition-all",
                        "bg-current opacity-80 w-[85%]",
                      )}
                    />
                  </div>
                </div>

                {/* Premium Curved OLED Screen */}
                <div
                  onClick={cycleDigitalFont}
                  className={cn(
                    "w-[220px] sm:w-[245px] h-[115px] sm:h-[130px] rounded-[50px_50px_24px_24px] sm:rounded-[60px_60px_28px_28px] shadow-[inset_0_6px_15px_rgba(0,0,0,0.25),0_8px_15px_rgba(0,0,0,0.4),0_0_2px_rgba(255,255,255,0.5)] p-3 sm:p-4 pb-2 flex flex-col justify-between relative overflow-hidden cursor-pointer",
                    proThemeConfig.screenBg,
                  )}
                  title={t("counter_font")}
                >
                  {/* Cyber Grid SVG background */}
                  <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                      backgroundImage:
                        'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 100 100"><path d="M0 0 L100 100 M100 0 L0 100 M50 0 L50 100 M0 50 L100 50" stroke="%23000" stroke-width="0.5" fill="none"/></svg>\')',
                      backgroundSize: "30px 30px",
                    }}
                  />
                  {/* Screen inner top shadow/glare */}
                  <div className="absolute inset-x-2 top-0 h-1/2 bg-gradient-to-b from-white/50 to-transparent blur-md rounded-[50%] transform -translate-y-1/2 pointer-events-none" />

                  {/* Upper display: Count */}
                  <div className="w-full flex-1 flex items-center justify-center -mt-1 pt-2 z-10">
                    <span
                      className={cn(
                        "text-[52px] sm:text-[60px] drop-shadow-sm font-bold leading-none tracking-tight",
                        proThemeConfig.screenText,
                        activeFontObj.className,
                      )}
                      style={{
                        transform: activeFontObj.skew ? "skewX(-2deg)" : "none",
                      }}
                    >
                      {(activeGoal ? activeGoal.currentCount : localCount)
                        .toString()
                        .padStart(4, "0")}
                    </span>
                  </div>

                  {/* Middle display: Dhikr Text on screen - like the image */}
                  <div
                    className={cn(
                      "text-center font-bold text-[11px] sm:text-xs z-10 px-1 truncate leading-tight drop-shadow-sm -mt-1",
                      proThemeConfig.screenText,
                    )}
                  >
                    {activeGoal
                      ? activeGoalSource === "remote"
                        ? (activeGoal as any).titleAr
                        : (activeGoal as any).text
                      : currentDhikr.text}
                  </div>

                  {/* Bottom info row with divider line */}
                  <div
                    className={cn(
                      "flex justify-between items-center w-full text-[9px] sm:text-[10px] z-10 pt-1.5 mt-1 border-t border-black/10 relative",
                      proThemeConfig.screenText,
                    )}
                  >
                    <span className="font-sans font-medium tracking-wide">
                      {t("target_label")}:{" "}
                      {activeGoal
                        ? activeGoal.targetCount
                        : currentDhikr.target}
                    </span>
                    <span className="tracking-wider font-digital font-bold">
                      {timeString}
                    </span>
                  </div>
                </div>

                {/* Engraved Beautiful Gold Dhikr */}
                <div
                  className={cn(
                    "w-full text-center flex-1 flex items-center justify-center relative z-10 px-2 mt-1 -mb-1",
                    proThemeConfig.goldText,
                  )}
                >
                  <p className="text-[22px] sm:text-[26px] font-black drop-shadow-[0_2px_2px_rgba(0,0,0,0.8),0_1px_0px_rgba(255,255,255,0.1)] leading-tight text-balance font-sans">
                    {activeGoal
                      ? activeGoalSource === "remote"
                        ? (activeGoal as any).titleAr
                        : (activeGoal as any).text
                      : currentDhikr.text}
                  </p>
                </div>

                {/* Controls Section */}
                <div className="w-full pl-6 pr-6 pb-6 sm:pb-7 flex justify-between items-center relative z-10 mt-auto">
                  {/* L Indicator */}
                  <button
                    onClick={reset}
                    className={cn(
                      "relative w-9 h-9 flex flex-col items-center justify-center group pointer-events-auto active:scale-90 transition-transform",
                      proThemeConfig.goldText,
                    )}
                    title={t("reset")}
                  >
                    {/* Marker bracket shape */}
                    <div className="absolute top-0 right-[4px] w-2.5 h-[1.5px] bg-current rounded-full shadow-[0_1px_1px_rgba(0,0,0,0.5)]" />
                    <div className="absolute top-0 right-[4px] w-[1.5px] h-2.5 bg-current rounded-full shadow-[0_1px_1px_rgba(0,0,0,0.5)]" />
                    <span className="text-[15px] font-light translate-y-1 translate-x-1 opacity-90 drop-shadow-md">
                      L
                    </span>
                  </button>

                  {/* Center Giant Button - beautiful futuristic horizontal oval with bright fluorescent ring */}
                  <button
                    onClick={handlePress}
                    className={cn(
                      "w-[98px] h-[78px] sm:w-[115px] sm:h-[92px] rounded-full border-[2.5px] sm:border-[3px] p-[2px] sm:p-[3px] flex items-center justify-center shadow-[0_15px_30px_rgba(0,0,0,0.65),inset_0_2px_6px_rgba(0,0,0,0.8),inset_0_1px_2px_rgba(255,255,255,0.45),0_0_14px_currentColor] active:scale-[0.96] active:translate-y-1 transition-all relative overflow-visible",
                      proThemeConfig.buttonRing,
                      proThemeConfig.bodyBg,
                    )}
                  >
                    {renderPressAnimation()}
                    <div
                      className={cn(
                        "w-full h-full rounded-full shadow-[inset_0_8px_16px_rgba(0,0,0,0.7),inset_0_1px_3px_rgba(255,255,255,0.3)] flex items-center justify-center relative group overflow-hidden border border-black/50",
                        proThemeConfig.buttonBg,
                      )}
                    >
                      {/* Metallic glow inside */}
                      <div className="absolute inset-x-2 top-1 h-1/3 bg-white/10 rounded-full blur-[2px] pointer-events-none transition-opacity group-active:opacity-30" />
                      <div className="absolute inset-x-0 bottom-0 h-1/4 bg-black/30 rounded-full blur-md pointer-events-none" />

                      <Fingerprint
                        size={30}
                        className={cn(
                          "opacity-95 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] transform group-active:scale-95 transition-transform",
                          proThemeConfig.buttonIcon,
                        )}
                      />
                    </div>
                  </button>

                  {/* R Indicator */}
                  <button
                    onClick={cycleDigitalTheme}
                    className={cn(
                      "relative w-9 h-9 flex flex-col items-center justify-center group pointer-events-auto active:scale-90 transition-transform",
                      proThemeConfig.goldText,
                    )}
                    title={t("change_theme")}
                  >
                    <span className="text-[15px] font-light translate-y-1 -translate-x-1 opacity-90 drop-shadow-md">
                      R
                    </span>
                    <div className="absolute top-0 left-[4px] w-2.5 h-[1.5px] bg-current rounded-full shadow-[0_1px_1px_rgba(0,0,0,0.5)]" />
                    <div className="absolute top-0 left-[4px] w-[1.5px] h-2.5 bg-current rounded-full shadow-[0_1px_1px_rgba(0,0,0,0.5)]" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {rosaryMode === "egg_modern" && (() => {
          const validProgressEgg = isNaN(progressPercentage) ? 0 : progressPercentage;
          const circEgg = 2 * Math.PI * 45;
          const strokeDashoffsetValueEgg = circEgg - (Math.min(validProgressEgg, 100) / 100) * circEgg;

          // Determine theme-specific custom screen properties
          let screenBgClass = "";
          let screenTextClass = "";
          let ringStrokeColor = "";
          let ringGlowColor = "";

          if (lcdBacklight) {
            // Luminous Backlight On (Highly-vibrant pure fluorescent backplane with intense glow)
            if (digitalTheme === "golden") {
              screenBgClass = "bg-[#ffd54f] bg-gradient-to-br from-[#ffd54f] via-[#fbbf24] to-[#f59e0b] shadow-[0_0_22px_rgba(245,158,11,0.85),inset_0_4px_12px_rgba(255,255,255,0.7)]";
              screenTextClass = "text-[#3a1a01] drop-shadow-[0_1px_1.5px_rgba(255,255,255,0.5)] font-black";
              ringStrokeColor = "url(#goldBacklightGrad)";
              ringGlowColor = "rgba(245, 158, 11, 0.95)";
            } else if (digitalTheme === "sapphire") {
              screenBgClass = "bg-[#00f2fe] bg-gradient-to-br from-[#00f2fe] via-[#00c6ff] to-[#0072ff] shadow-[0_0_22px_rgba(0,198,255,0.85),inset_0_4px_12px_rgba(255,255,255,0.7)]";
              screenTextClass = "text-[#031d44] drop-shadow-[0_1px_1.5px_rgba(255,255,255,0.5)] font-black";
              ringStrokeColor = "url(#sapphireBacklightGrad)";
              ringGlowColor = "rgba(0, 198, 255, 0.95)";
            } else if (digitalTheme === "ruby") {
              screenBgClass = "bg-[#ff3366] bg-gradient-to-br from-[#ff3366] via-[#e11d48] to-[#990022] shadow-[0_0_22px_rgba(225,29,72,0.85),inset_0_4px_12px_rgba(255,255,255,0.7)]";
              screenTextClass = "text-[#2c0008] drop-shadow-[0_1px_1.5px_rgba(255,255,255,0.5)] font-black";
              ringStrokeColor = "url(#rubyBacklightGrad)";
              ringGlowColor = "rgba(225, 29, 72, 0.95)";
            } else if (digitalTheme === "emerald") {
              screenBgClass = "bg-[#00ff87] bg-gradient-to-br from-[#00ff87] via-[#059669] to-[#015235] shadow-[0_0_22px_rgba(16,185,129,0.85),inset_0_4px_12px_rgba(255,255,255,0.7)]";
              screenTextClass = "text-[#012211] drop-shadow-[0_1px_1.5px_rgba(255,255,255,0.5)] font-black";
              ringStrokeColor = "url(#emeraldBacklightGrad)";
              ringGlowColor = "rgba(16, 185, 129, 0.95)";
            } else { // silver / platinum
              screenBgClass = "bg-[#e2e8f0] bg-gradient-to-br from-[#e2e8f0] via-[#cbd5e1] to-[#64748b] shadow-[0_0_22px_rgba(148,163,184,0.65),inset_0_4px_12px_rgba(255,255,255,0.7)]";
              screenTextClass = "text-[#0f172a] drop-shadow-[0_1px_1.5px_rgba(255,255,255,0.5)] font-black";
              ringStrokeColor = "url(#silverBacklightGrad)";
              ringGlowColor = "rgba(148, 163, 184, 0.9)";
            }
          } else {
            // Luminous Backlight Off - High Contrast AMOLED black screen with themed gradient depth
            if (digitalTheme === "golden") {
              screenBgClass = "bg-gradient-to-b from-[#110c00] via-[#1a1403] to-[#000000] border-b-2 border-yellow-500/20 shadow-[inset_0_6px_18px_rgba(0,0,0,0.95)]";
              screenTextClass = "text-[#fef08a] drop-shadow-[0_0_12px_rgba(254,240,138,0.95)] font-black";
              ringStrokeColor = "#fef08a";
              ringGlowColor = "rgba(254, 240, 138, 0.8)";
            } else if (digitalTheme === "sapphire") {
              screenBgClass = "bg-gradient-to-b from-[#010816] via-[#03112c] to-[#000000] border-b-2 border-sky-500/20 shadow-[inset_0_6px_18px_rgba(0,0,0,0.95)]";
              screenTextClass = "text-[#38bdf8] drop-shadow-[0_0_12px_rgba(56,189,248,0.95)] font-black";
              ringStrokeColor = "#38bdf8";
              ringGlowColor = "rgba(56, 189, 248, 0.8)";
            } else if (digitalTheme === "ruby") {
              screenBgClass = "bg-gradient-to-b from-[#140003] via-[#2d0006] to-[#000000] border-b-2 border-rose-500/20 shadow-[inset_0_6px_18px_rgba(0,0,0,0.95)]";
              screenTextClass = "text-[#fb7185] drop-shadow-[0_0_12px_rgba(251,113,133,0.95)] font-black";
              ringStrokeColor = "#fb7185";
              ringGlowColor = "rgba(251, 113, 133, 0.8)";
            } else if (digitalTheme === "emerald") {
              screenBgClass = "bg-gradient-to-b from-[#011409] via-[#022a14] to-[#000000] border-b-2 border-emerald-500/20 shadow-[inset_0_6px_18px_rgba(0,0,0,0.95)]";
              screenTextClass = "text-[#34d399] drop-shadow-[0_0_12px_rgba(52,211,153,0.95)] font-black";
              ringStrokeColor = "#34d399";
              ringGlowColor = "rgba(52, 211, 153, 0.8)";
            } else { // silver
              screenBgClass = "bg-gradient-to-b from-[#080d16] via-[#10192a] to-[#000000] border-b-2 border-slate-400/20 shadow-[inset_0_6px_18px_rgba(0,0,0,0.95)]";
              screenTextClass = "text-[#cbd5e1] drop-shadow-[0_0_12px_rgba(203,213,225,0.9)] font-black";
              ringStrokeColor = "#cbd5e1";
              ringGlowColor = "rgba(203, 213, 225, 0.75)";
            }
          }

          return (
            <div className="relative w-[275px] h-[395px] sm:w-[315px] sm:h-[450px] flex flex-col items-center justify-between select-none mt-4 shrink-0 pb-3 transition-all duration-300">
              
              {/* 1. Realistic Deep 3D Shadow Cast underneath */}
              <div
                style={{ borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%" }}
                className="absolute inset-[3px] bg-black/85 blur-[16px] translate-y-7 pointer-events-none scale-[0.98]"
              />

              {/* 2. 3D Body Extrusion (Vertical chassis depth layer) */}
              <div
                style={{ borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%" }}
                className="absolute inset-[0.5px] translate-y-[8px] bg-gradient-to-b from-[#2a2a2a] via-[#0d0d0d] to-[#000] pointer-events-none rounded-[50%_50%_50%_50%_/_60%_60%_40%_40%]"
              />

              {/* Stationary Device Wrapper */}
              <div className="w-full h-[95%] relative z-10">
                {/* Main Egg Container (Thicker, premium dual-beveled chassis frame) */}
                <div
                  style={{ borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%" }}
                  className={cn(
                    "w-full h-full border-[8px] sm:border-[10px] shadow-[inset_0_12px_24px_rgba(255,255,255,0.45),inset_0_-15px_30px_rgba(0,0,0,0.95)] flex flex-col items-center relative overflow-hidden p-[7px] sm:p-[10px] bg-gradient-to-br transition-colors duration-500",
                    eggThemeConfig.outerBorder,
                    eggThemeConfig.outerFrame,
                  )}
                >
                  {/* 3D Curved Glass Highlight Overlays */}
                  <div className="absolute inset-x-0 top-0 h-full bg-gradient-to-tr from-white/0 via-white/5 to-white/20 pointer-events-none mix-blend-overlay z-35" />
                  <div
                    className="absolute top-0 inset-x-[10%] h-[35%] bg-gradient-to-b from-white/30 via-white/10 to-transparent pointer-events-none z-35"
                    style={{ borderRadius: "50% 50% 0 0 / 100% 100% 0 0", mixBlendMode: "overlay" }}
                  />

                  {/* Inner Dark Shell with Luxury Pattern */}
                  <div
                    style={{ borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%" }}
                    className={cn(
                      "w-full h-full shadow-[0_12px_32px_rgba(0,0,0,1),inset_0_12px_24px_rgba(0,0,0,0.95)] relative overflow-hidden border-[4px] sm:border-[5px] bg-gradient-to-b transition-colors duration-500",
                      eggThemeConfig.innerShell,
                      eggThemeConfig.innerBorder,
                    )}
                  >
                    {/* Top Screen Half (Elegant floating design with active backlight styles) */}
                    <div
                      style={{ borderRadius: "0 0 50% 50% / 0 0 45% 45%" }}
                      className={cn(
                        "absolute top-0 left-0 right-0 h-[59%] shadow-[0_12px_24px_rgba(0,0,0,0.85)] border-b-[4px] overflow-hidden transition-all duration-500 p-[8px]",
                        screenBgClass,
                        eggThemeConfig.topHalfBorder,
                      )}
                    >
                      <div
                        className="absolute inset-0 opacity-[0.05] mix-blend-overlay pointer-events-none"
                        style={{
                          backgroundImage:
                            'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E")',
                        }}
                      />

                      {/* Top reflection glare shield */}
                      <div className="absolute inset-x-0 -top-[30%] h-[100%] bg-gradient-to-b from-white/10 to-transparent rotate-12 transform pointer-events-none z-20" />

                      {/* Centered Content in Top Half */}
                      <div className="absolute inset-x-0 bottom-0 top-[4%] flex flex-col items-center justify-center z-10 p-2">
                        
                        {/* Circular glowing progress ring */}
                        <div className="relative w-[165px] h-[165px] sm:w-[195px] sm:h-[195px] flex flex-col items-center justify-center -mt-1 rounded-full border-[5px] sm:border-[8px] shadow-[inset_0_4px_16px_rgba(0,0,0,0.3)] transition-all duration-300"
                             style={{ 
                               borderColor: ringGlowColor.replace(/[\d.]+\)$/, lcdBacklight ? '1)' : '0.9)'),
                               backgroundColor: lcdBacklight 
                                  ? (digitalTheme === "golden" ? "#fbbf24" 
                                     : digitalTheme === "sapphire" ? "#06b6d4" 
                                     : digitalTheme === "ruby" ? "#f43f5e" 
                                     : digitalTheme === "emerald" ? "#10b881" 
                                     : "#cbd5e1")
                                  : (digitalTheme === "golden" ? "#050401" 
                                     : digitalTheme === "sapphire" ? "#01040a" 
                                     : digitalTheme === "ruby" ? "#050001" 
                                     : digitalTheme === "emerald" ? "#000301" 
                                     : "#080c14"),
                               boxShadow: `0 0 15px ${ringGlowColor.replace(/[\d.]+\)$/, lcdBacklight ? '0.4)' : '0.2)')}, inset 0 4px 16px rgba(0,0,0,0.3)`
                             }}>
                          <svg
                            className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
                            viewBox="0 0 100 100"
                          >
                            <defs>
                              <linearGradient id="goldBacklightGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#fef08a" />
                                <stop offset="100%" stopColor="#ffb300" />
                              </linearGradient>
                              <linearGradient id="sapphireBacklightGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#38bdf8" />
                                <stop offset="100%" stopColor="#0288d1" />
                              </linearGradient>
                              <linearGradient id="rubyBacklightGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#fb7185" />
                                <stop offset="100%" stopColor="#e53935" />
                              </linearGradient>
                              <linearGradient id="emeraldBacklightGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#00ff87" />
                                <stop offset="100%" stopColor="#00e676" />
                              </linearGradient>
                              <linearGradient id="silverBacklightGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#cbd5e1" />
                                <stop offset="100%" stopColor="#64748b" />
                              </linearGradient>
                            </defs>

                            {/* Ring Underlay Track */}
                            <circle
                              cx="50"
                              cy="50"
                              r="45"
                              fill="none"
                              stroke={ringStrokeColor}
                              strokeOpacity={lcdBacklight ? 0.35 : 0.25}
                              strokeWidth="3.5"
                            />

                            {/* Interactive progress circle */}
                            <circle
                              cx="50"
                              cy="50"
                              r="45"
                              fill="none"
                              stroke={ringStrokeColor}
                              strokeWidth="5.5"
                              strokeDasharray={circEgg}
                              strokeDashoffset={strokeDashoffsetValueEgg}
                              strokeLinecap="round"
                              style={{
                                filter: `drop-shadow(0 0 8px ${ringGlowColor})`,
                              }}
                              className="transition-all duration-300 ease-out"
                            />
                          </svg>

                          {/* Luminous Counter Digits */}
                          <div
                            className={cn(
                              "leading-none transition-all duration-300 tracking-wider -mt-1.5",
                              activeFontObj.className,
                              activeFontObj.skew && "skew-x-[-7deg]",
                              screenTextClass,
                            )}
                            style={{ fontSize: `calc(${settings.adhkarFontSize || '20px'} * 2.2)` }}
                          >
                            {String(activeGoal ? activeGoal.currentCount : localCount).padStart(4, "0")}
                          </div>

                          {/* Percentage Complete Indicators */}
                          <div
                            className={cn(
                              "text-[8px] sm:text-[9.5px] font-sans font-black mt-2.5 z-10 opacity-75 tracking-wider uppercase",
                              screenTextClass,
                            )}
                          >
                            {Math.round(validProgressEgg)}%
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Bottom Half Dark Section */}
                    <div className="absolute top-[62%] left-0 right-0 bottom-0 flex flex-col items-center justify-center pb-3 z-10 px-4">
                      {/* Three Buttons */}
                      <div className="flex items-center justify-between w-full max-w-[185px] sm:max-w-[215px] relative z-20">
                        {/* Light/backlight toggle dial */}
                        <div className="flex flex-col items-center gap-1.5">
                          <button
                            onClick={() => {
                              setLcdBacklight((prev) => !prev);
                              if (settings.hapticTasbihEnabled !== false) {
                                triggerHaptic('light');
                              }
                            }}
                            className={cn(
                              "w-[38px] h-[38px] sm:w-[44px] sm:h-[44px] rounded-full border-[2.5px] bg-gradient-to-br shadow-[0_8px_15px_rgba(0,0,0,0.65),inset_0_3px_6px_rgba(255,255,255,0.4)] flex items-center justify-center transition-transform active:scale-90 duration-300 cursor-pointer hover:brightness-110",
                              eggThemeConfig.buttonSubBg,
                              eggThemeConfig.ringGlowSub,
                            )}
                          >
                            <Moon
                              size={16}
                              strokeWidth={2.5}
                              className={cn(
                                "mr-0.5 mt-0.5 opacity-90 transition-transform duration-300",
                                lcdBacklight ? "rotate-[15deg] scale-110" : "scale-100",
                                eggThemeConfig.buttonIconColor,
                              )}
                            />
                          </button>
                          <span
                            className={cn(
                              "text-[9px] tracking-wider font-black text-center transition-colors duration-500",
                              eggThemeConfig.svgDecor,
                            )}
                          >
                            {t("light")}
                          </span>
                        </div>

                        {/* Main Tactile Fingerprint Pushbutton - beautifully custom oval and larger with rich pulsative glow */}
                        <div className="relative w-[76px] h-[64px] sm:w-[86px] sm:h-[72px] flex items-center justify-center">
                          {/* Pulsative copper glowing rim wrapper */}
                          <div
                            className={cn(
                              "absolute inset-0 rounded-full border-[3px] transition-colors duration-500 animate-pulse",
                              eggThemeConfig.ringGlowMain,
                            )}
                          />
                          <button
                            onClick={handlePress}
                            className={cn(
                              "w-[62px] h-[50px] sm:w-[72px] sm:h-[58px] z-10 rounded-full border-[2.5px] bg-gradient-to-br shadow-[0_12px_22px_rgba(0,0,0,0.8),inset_0_4px_8px_rgba(255,255,255,0.6)] flex items-center justify-center transition-all cursor-pointer hover:brightness-110 hover:scale-[1.02] active:scale-[0.9] duration-75 relative overflow-visible",
                              eggThemeConfig.buttonMainBg,
                              eggThemeConfig.ringGlowSub,
                            )}
                          >
                            {renderPressAnimation()}
                            <Fingerprint
                              size={26}
                              strokeWidth={2.5}
                              className={cn(
                                "opacity-[0.95] transition-colors duration-500 drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.5)]",
                                eggThemeConfig.buttonIconColor,
                              )}
                            />
                          </button>
                        </div>

                        {/* Reset button dial */}
                        <div className="flex flex-col items-center gap-1.5">
                          <button
                            onClick={() => {
                              reset();
                            }}
                            className={cn(
                              "w-[38px] h-[38px] sm:w-[44px] sm:h-[44px] rounded-full border-[2.5px] bg-gradient-to-br shadow-[0_8px_15px_rgba(0,0,0,0.65),inset_0_3px_6px_rgba(255,255,255,0.4)] flex items-center justify-center transition-transform active:scale-90 duration-300 cursor-pointer hover:brightness-110",
                              eggThemeConfig.buttonSubBg,
                              eggThemeConfig.ringGlowSub,
                            )}
                          >
                            <RotateCcw
                              size={16}
                              strokeWidth={2.5}
                              className={cn(
                                "opacity-90 transition-colors duration-500",
                                eggThemeConfig.buttonIconColor,
                              )}
                            />
                          </button>
                          <span
                            className={cn(
                              "text-[9px] tracking-wider font-black text-center transition-colors duration-500",
                              eggThemeConfig.svgDecor,
                            )}
                          >
                            {t("reset")}
                          </span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>

              {/* Static Realistic Ground Shadow */}
              <div className="w-[72%] h-[10px] bg-black/55 rounded-full blur-[6px] mix-blend-multiply pointer-events-none mt-1 z-0" />
            </div>
          );
        })()}
      </div>


      {rosaryMode === "hex_modern" && (() => {
        const validProgressHex = isNaN(progressPercentage) ? 0 : progressPercentage;
        const circ = 276; // Approx perimeter for the hex standard track
        const strokeDashoffsetValue = circ - (validProgressHex / 100) * circ;

        const flatHexPolygon = "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)";
        const innerHexPolygon = "polygon(26% 2%, 74% 2%, 98% 50%, 74% 98%, 26% 98%, 2% 50%)";

        // Map colors for ultra clear text based on the active digitalTheme
        let clearTextColor = "text-[#38bdf8]";
        let clearScreenBg = "bg-gradient-to-b from-[#000] via-[#050505] to-[#0a0a0a]";
        let clearShadow = "rgba(56,189,248,0.9)";
        let glowBright = "brightness(1.5)";
        
        if (digitalTheme === "golden") {
          clearTextColor = "text-[#fbbf24]";
          clearShadow = "rgba(251,191,36,0.9)";
        } else if (digitalTheme === "emerald") {
          clearTextColor = "text-[#34d399]";
          clearShadow = "rgba(52,211,153,0.9)";
        } else if (digitalTheme === "sapphire") {
          clearTextColor = "text-[#60a5fa]";
          clearShadow = "rgba(96,165,250,0.9)";
        } else if (digitalTheme === "ruby") {
          clearTextColor = "text-[#fb7185]";
          clearShadow = "rgba(251,113,133,0.9)";
        } else if (digitalTheme === "silver") {
          clearTextColor = "text-[#f8fafc]";
          clearShadow = "rgba(248,250,252,0.9)";
        }

        return (
          <div className="relative w-[340px] h-[380px] sm:w-[400px] sm:h-[450px] flex flex-col items-center justify-center select-none pt-2">
            
            {/* 1. Deep 3D Cast Shadow */}
            <div
              style={{ clipPath: flatHexPolygon }}
              className="absolute inset-[15px] bg-black/60 blur-[18px] translate-y-[25px] pointer-events-none scale-[0.96] z-0"
            />

            {/* 2. 3D Body Extrusion - Solid depth for Hexagon */}
            <div
              style={{ clipPath: flatHexPolygon }}
              className="absolute inset-[0px] translate-y-[12px] bg-gradient-to-b from-[#1a1a1a] via-[#050505] to-[#000] pointer-events-none z-0 border-b-2 border-black/80"
            />

            {/* 3. Main Base Plate Frame (Outer Metallic Hex) */}
            <div
              style={{ clipPath: flatHexPolygon }}
              className={cn(
                "w-full h-full bg-gradient-to-br p-[4px] sm:p-[5px] relative transition-transform duration-300 hover:-translate-y-[1px] shadow-[inset_0_-8px_20px_rgba(0,0,0,0.9)] z-10 border-t border-white/20 border-b border-black/80",
                hexThemeConfig.outerHexFrame
              )}
            >
              {/* 4. Chrome / Glowing Inner Bezel */}
              <div
                style={{ clipPath: flatHexPolygon }}
                className={cn(
                  "w-full h-full bg-gradient-to-tr p-[6px] sm:p-[8px] relative shadow-[inset_0_4px_15px_rgba(255,255,255,0.3),0_8px_20px_rgba(0,0,0,0.9)] opacity-[0.98]",
                  hexThemeConfig.innerHexFrame
                )}
              >
                {/* 5. Deep Main Cavity Sub-Plate */}
                <div
                  style={{ 
                    clipPath: flatHexPolygon,
                    backgroundColor: hexThemeConfig.shellBg,
                    // Intricate Islamic Geometric Pattern
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0l20 20-20 20L0 20z M20 4l16 16-16 16L4 20z M20 8l12 12-12 12L8 20z' fill='${hexThemeConfig.textureAccent}' fill-opacity='${hexThemeConfig.textureOpacity}' fill-rule='evenodd'/%3E%3C/svg%3E")`
                  }}
                  className="w-full h-full relative overflow-hidden flex flex-col items-center justify-start shadow-[inset_0_30px_50px_rgba(0,0,0,0.95),inset_0_-10px_30px_rgba(0,0,0,0.8)] z-10 border border-black/40"
                >
                  {/* Radial spotlight effect behind the screen */}
                  <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[80%] h-[50%] bg-white/[0.03] rounded-full blur-[40px] pointer-events-none" />

                  {/* Sharp Glass Sweep Reflection */}
                  <div className="absolute inset-x-0 -top-[40%] h-[180%] bg-gradient-to-b from-white/[0.12] via-white/[0.03] to-transparent pointer-events-none -rotate-[30deg] transform origin-top-left flex-shrink-0" />

                  {/* Central AMOLED display module */}
                  <div className="mt-[10%] sm:mt-[12%] relative flex flex-col items-center justify-center p-[4px] drop-shadow-[0_15px_35px_rgba(0,0,0,0.85)] z-20 w-[190px] h-[190px] sm:w-[230px] sm:h-[230px]">
                    
                    {/* Ring glowing track overlay */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none filter drop-shadow-[0_0_12px_rgba(0,0,0,0.8)] z-30" viewBox="0 0 100 100" style={{ overflow: "visible" }}>
                      <defs>
                        <linearGradient id="hexProgressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor={hexThemeConfig.progressGlowGrad[0]} />
                          <stop offset="33%" stopColor={hexThemeConfig.progressGlowGrad[1]} />
                          <stop offset="66%" stopColor={hexThemeConfig.progressGlowGrad[2]} />
                          <stop offset="100%" stopColor={hexThemeConfig.progressGlowGrad[3]} />
                        </linearGradient>
                        <filter id="glowHex">
                           <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                           <feMerge>
                              <feMergeNode in="coloredBlur"/>
                              <feMergeNode in="SourceGraphic"/>
                           </feMerge>
                        </filter>
                      </defs>
                      {/* Track background */}
                      <circle
                        cx="50" cy="50" r="46"
                        fill="none"
                        stroke={hexThemeConfig.progressRingTrack}
                        strokeWidth="3.5"
                        strokeOpacity="0.7"
                      />
                      {/* Progress glowing stroke */}
                      <circle
                        cx="50" cy="50" r="46"
                        fill="none"
                        stroke="url(#hexProgressGrad)"
                        strokeWidth="4.5"
                        strokeDasharray="289"
                        strokeDashoffset={289 - (validProgressHex / 100) * 289}
                        className="transition-all duration-300 ease-out"
                        strokeLinecap="round"
                        filter="url(#glowHex)"
                        transform="rotate(-90 50 50)"
                      />
                    </svg>

                    {/* LCD / AMOLED display plate PROTRUDING 3D */}
                    <div className="absolute inset-[16px] sm:inset-[20px] z-20 transition-all duration-300 pointer-events-auto rounded-full" style={{ filter: "drop-shadow(0px 10px 15px rgba(0,0,0,0.95)) drop-shadow(0px 5px 8px rgba(0,0,0,0.8))" }}>
                      {/* Physical Raised Bezel */}
                      <div
                        className={cn("w-full h-full rounded-full relative p-[4px] bg-gradient-to-br shadow-[inset_0_2px_6px_rgba(255,255,255,0.5)] border-t border-white/30", hexThemeConfig.outerHexFrame)}
                      >
                         <div
                            className={cn("w-full h-full rounded-full relative p-[2px] bg-gradient-to-bl", hexThemeConfig.innerHexFrame)}
                         >
                            {/* Glass screen */}
                            <div
                              className={cn("w-full h-full rounded-full relative flex flex-col items-center justify-center shadow-[inset_0_15px_30px_rgba(0,0,0,1)] border border-black/70 overflow-hidden", clearScreenBg)}
                            >
                              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/60 pointer-events-none" />
                              <div className="absolute inset-0 shadow-[inset_0_6px_18px_rgba(0,0,0,1)] pointer-events-none" />
                              {/* CRT Scanline effect */}
                              <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.5)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none opacity-40 mix-blend-overlay" />
                              
                              <div className="z-30 flex flex-col items-center justify-center mt-[-4px]">
                                <div 
                                  onClick={cycleDigitalFont}
                                  className={cn(
                                    "tracking-widest leading-none pb-1 mt-4 cursor-pointer transition-all duration-300 font-bold",
                                    activeFontObj.className,
                                    activeFontObj.skew && "skew-x-[-7deg]",
                                    clearTextColor
                                  )}
                                  style={{
                                     fontSize: `calc(${settings.adhkarFontSize || '20px'} * 2.5)`,
                                     textShadow: `0 0 8px ${clearShadow}`,
                                  }}
                                  title={t("counter_font")}
                                >
                                  {String(activeGoal ? activeGoal.currentCount : localCount).padStart(4, "0")}
                                </div>
                                
                                <div 
                                  className={cn("text-[13px] sm:text-[15px] font-black tracking-widest mt-1.5 opacity-90", clearTextColor)}
                                  style={{
                                     textShadow: `0 0 6px ${clearShadow}`,
                                  }}
                                >
                                   {validProgressHex}%
                                </div>
                              </div>
                            </div>
                         </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex-grow" />

                  {/* Buttons */}
                  <div className="relative w-full max-w-[280px] sm:max-w-[320px] flex flex-row items-center justify-between mb-[9%] sm:mb-[11%] px-5 z-20">
                    {/* Theme Button */}
                    <div className="flex flex-col items-center justify-center">
                      <div className="relative p-[3px] bg-gradient-to-t from-black/90 to-white/20 rounded-full shadow-[0_8px_16px_rgba(0,0,0,0.9)]">
                        <button
                          onClick={cycleDigitalTheme}
                          className={cn(
                            "w-[48px] h-[48px] sm:w-[54px] sm:h-[54px] rounded-full bg-gradient-to-b flex items-center justify-center cursor-pointer transition-transform active:scale-[0.9] border border-white/10",
                            hexThemeConfig.subBtnGrad,
                            hexThemeConfig.subBtnIcon
                          )}
                          title={t("change_theme")}
                        >
                          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
                          <Palette size={20} className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] z-10" strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>

                    {/* Main Counter Hub */}
                    <div className="flex flex-col items-center mt-4 relative group">
                      <div className={cn("absolute inset-0 rounded-full blur-[25px] z-0 transition-opacity duration-300 group-hover:opacity-100 opacity-80", hexThemeConfig.mainBtnPulse.split(" ")[0].replace("border-", "bg-").replace("/40", "/50"))} />
                      <div className="relative p-[5px] bg-gradient-to-b from-white/20 via-black/50 to-black/95 rounded-full shadow-[0_15px_30px_rgba(0,0,0,1)] z-10">
                          <button
                            onClick={handlePress}
                            className={cn(
                              "w-[80px] h-[80px] sm:w-[92px] sm:h-[92px] rounded-full z-10 relative bg-gradient-to-br flex items-center justify-center cursor-pointer transition-all duration-75 ease-out hover:brightness-110 active:scale-[0.92] active:translate-y-[2px] border border-white/20 overflow-visible",
                              hexThemeConfig.mainBtnGrad,
                              hexThemeConfig.mainBtnIcon
                            )}
                          >
                              {renderPressAnimation()}
                              {/* Jewel inner reflection */}
                              <div className="absolute inset-x-0 top-0 h-1/2 rounded-t-full bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
                              <Fingerprint
                                size={40}
                                strokeWidth={1.5}
                                className="drop-shadow-[0_3px_6px_rgba(0,0,0,0.9)] opacity-[0.98] z-10"
                              />
                          </button>
                      </div>
                    </div>

                    {/* Reset Button */}
                    <div className="flex flex-col items-center justify-center">
                      <div className="relative p-[3px] bg-gradient-to-t from-black/90 to-white/20 rounded-full shadow-[0_8px_16px_rgba(0,0,0,0.9)]">
                        <button
                          onClick={reset}
                          className={cn(
                            "w-[48px] h-[48px] sm:w-[54px] sm:h-[54px] rounded-full bg-gradient-to-b flex items-center justify-center cursor-pointer transition-transform active:scale-[0.9] border border-white/10",
                            hexThemeConfig.subBtnGrad,
                            hexThemeConfig.subBtnIcon
                          )}
                          title={t("reset")}
                        >
                           <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
                           <RotateCcw size={20} strokeWidth={2.5} className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] z-10" />
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        );

      })()}

      <AnimatePresence>
        {showSettings && (
          <div
            className="absolute inset-0 z-[200] bg-black/60 dark:bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="w-full sm:max-w-md h-[90vh] sm:h-auto sm:max-h-[85vh] bg-slate-50 dark:bg-slate-900 rounded-t-[2.5rem] sm:rounded-[2.5rem] flex flex-col shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-center px-6 py-5 border-b border-black/5 dark:border-white/5 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-t-[2.5rem] shrink-0">
                <h3 className="font-black text-xl text-slate-800 dark:text-slate-100">{t("tasbih_settings_title")}</h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="w-8 h-8 rounded-full bg-slate-200/60 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar pb-10">

                 {/* Group 1: General Preferences */}
                 <div className="space-y-3">
                   <p className="px-3 text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t("smart_customization")}</p>
                   <div className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700/50">
                     {/* Row: Haptic */}
                     <div className="flex items-center justify-between p-4 border-b border-slate-50 dark:border-slate-700/50">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-500/10 flex items-center justify-center text-teal-600 dark:text-teal-400 shrink-0">
                             <Activity size={20} />
                           </div>
                           <div>
                             <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">{t("haptic_feedback")}</p>
                             <p className="text-[10px] text-slate-500 mt-0.5">{t("haptic_feedback_desc")}</p>
                           </div>
                        </div>
                        <button
                          onClick={() => {
                            const newValue = settings.hapticTasbihEnabled === false ? true : false;
                            updateSettings({ hapticTasbihEnabled: newValue });
                            if (newValue) triggerHaptic('medium');
                          }}
                          className={cn("w-12 h-7 rounded-full relative transition-colors duration-300 shrink-0", settings.hapticTasbihEnabled !== false ? "bg-teal-500" : "bg-slate-200 dark:bg-slate-700")}
                        >
                          <motion.div animate={{ x: settings.hapticTasbihEnabled !== false ? 20 : 2 }} className="w-6 h-6 bg-white rounded-full shadow-md absolute top-0.5" />
                        </button>
                     </div>
                     {/* Row: Sound */}
                     <div className="flex items-center justify-between p-4 border-b border-slate-50 dark:border-slate-700/50">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                             <Volume2 size={20} />
                           </div>
                           <div>
                             <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">{t("sound_effect")}</p>
                             <p className="text-[10px] text-slate-500 mt-0.5">{t("sound_effect_desc")}</p>
                           </div>
                        </div>
                        <button
                          onClick={() => updateSettings({ tasbihSoundEnabled: !settings.tasbihSoundEnabled })}
                          className={cn("w-12 h-7 rounded-full relative transition-colors duration-300 shrink-0", settings.tasbihSoundEnabled ? "bg-blue-500" : "bg-slate-200 dark:bg-slate-700")}
                        >
                          <motion.div animate={{ x: settings.tasbihSoundEnabled ? 20 : 2 }} className="w-6 h-6 bg-white rounded-full shadow-md absolute top-0.5" />
                        </button>
                     </div>
                     {/* Row: Daily Goal */}
                     <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                             <Target size={20} />
                           </div>
                           <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">{t("daily_goal")}</p>
                        </div>
                        <input
                          type="number"
                          value={settings.tasbihDailyGoal || 100}
                          onChange={(e) => updateSettings({ tasbihDailyGoal: parseInt(e.target.value) || 100 })}
                          className="w-20 text-center p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border-none font-black text-sm outline-none focus:ring-2 focus:ring-teal-500"
                        />
                     </div>
                   </div>
                 </div>


                  <div className="space-y-3">
                    <p className="px-3 text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t("dhikr_library")}</p>


                 

                   {tasbihError && (
                     <div className="mx-3 p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-[11px] font-bold text-rose-600 dark:text-rose-400 flex items-start gap-1.5 leading-snug">
                       <span>⚠️</span>
                       <span>{tasbihError}</span>
                     </div>
                   )}
                   
                   <div className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700/50 p-4 space-y-4">
                     
                     <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400">القوائم المتوفرة</label>
                        <div className="grid grid-cols-2 gap-2">
                          {lists.map((list) => (
                            <div
                              key={list.id}
                              className={cn(
                                "p-2.5 rounded-2xl flex items-center justify-between gap-1 transition-all border-2",
                                activeListId === list.id
                                  ? "bg-teal-50 dark:bg-teal-900/30 border-teal-500 text-teal-700 dark:text-teal-300"
                                  : "bg-slate-50 dark:bg-slate-900 border-transparent text-slate-600 dark:text-slate-400 hover:border-slate-200"
                              )}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveListId(list.id);
                                  setCurrentDhikr(list.adhkar[0] || { text: "لا يوجد ذكر", target: 100 });
                                  setTarget(list.adhkar[0]?.target || 100);
                                  setShowSettings(false);
                                }}
                                className="flex-1 text-right text-xs font-bold truncate"
                              >
                                {list.name}
                              </button>
                              {list.id !== "default" && lists.length > 1 && (
                                <button
                                  type="button"
                                  title="حذف القائمة"
                                  onClick={(e) => deleteList(list.id, e)}
                                  className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors shrink-0"
                                >
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                        {/* Add List */}
                        <div className="flex gap-2 pt-2">
                          <input
                            value={newListName}
                            onChange={(e) => {
                              setNewListName(e.target.value);
                              setTasbihError(null);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                createList();
                              }
                            }}
                            placeholder="اسم قائمة جديدة..."
                            className="flex-1 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs font-bold outline-none focus:ring-2 focus:ring-teal-500 border border-slate-200/60 dark:border-slate-700/60"
                          />
                          <button
                            type="button"
                            onClick={createList}
                            className="px-3 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white flex items-center justify-center gap-1 text-xs font-bold transition-all shrink-0"
                          >
                            <Plus size={16} />
                            <span>قائمة</span>
                          </button>
                        </div>
                      </div>

                      <div className="h-px bg-slate-100 dark:bg-slate-700 w-full" />

                      {/* Adhkar in Array */}
                      <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400">أذكار قائمة ({activeList.name})</label>
                        <div className="max-h-[220px] overflow-y-auto pr-1 space-y-2 custom-scrollbar">
                          {activeList.adhkar.map((d, index) => (
                            <div
                              key={index}
                              className={cn(
                                "w-full p-2.5 rounded-2xl text-right transition-all flex items-center justify-between gap-2 border-2",
                                currentDhikr.text === d.text
                                  ? "bg-teal-50 dark:bg-teal-900/20 border-teal-500"
                                  : "bg-slate-50 dark:bg-slate-900 border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                              )}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setCurrentDhikr(d);
                                  setTarget(d.target);
                                  setShowSettings(false);
                                }}
                                className="flex-1 text-right flex flex-col gap-1 min-w-0"
                              >
                                <span className={cn("font-bold text-xs leading-snug line-clamp-2", currentDhikr.text === d.text ? "text-teal-900 dark:text-teal-100" : "text-slate-700 dark:text-slate-200")}>{d.text}</span>
                                <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                                   <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-bold border", currentDhikr.text === d.text ? "bg-teal-600/10 text-teal-700 dark:text-teal-300 border-teal-500/20" : "bg-slate-100 dark:bg-slate-800 text-slate-500 border-transparent")}>
                                     العداد: {dhikrCounts[`${rosaryMode}_${d.text}`] || 0}
                                   </span>
                                   <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-black border", currentDhikr.text === d.text ? "bg-teal-600 text-white border-teal-500" : "bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700")}>
                                     الهدف: {d.target}
                                   </span>
                                 </div>
                              </button>

                              <button
                                type="button"
                                title="حذف الذكر من القائمة"
                                onClick={(e) => deleteDhikrFromList(d.text, e)}
                                className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors shrink-0"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                        
                        {/* Add Dhikr Box */}
                        <div className="p-3 bg-slate-50 dark:bg-slate-900/80 rounded-2xl border border-slate-200/70 dark:border-slate-700/70 space-y-2.5">
                          <p className="text-[11px] font-black text-teal-700 dark:text-teal-400">إضافة ذكر جديد إلى القائمة</p>
                          
                          <input
                            value={newDhikrText}
                            onChange={(e) => {
                              setNewDhikrText(e.target.value);
                              setTasbihError(null);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                addDhikr();
                              }
                            }}
                            placeholder="اكتب نص الذكر هنا (مثل: سبحان الله وبحمده)..."
                            className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 text-xs font-bold outline-none focus:ring-2 focus:ring-teal-500 border border-slate-200 dark:border-slate-700"
                          />

                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] font-bold text-slate-500">الهدف:</span>
                              {[33, 100, 300, 1000].map((val) => (
                                <button
                                  type="button"
                                  key={val}
                                  onClick={() => setNewDhikrTarget(val)}
                                  className={cn(
                                    "px-2 py-1 rounded-lg text-[10px] font-black transition-all",
                                    newDhikrTarget === val
                                      ? "bg-teal-600 text-white shadow-sm"
                                      : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                                  )}
                                >
                                  {val}
                                </button>
                              ))}
                            </div>

                            <input
                              type="number"
                              min={1}
                              value={newDhikrTarget}
                              onChange={(e) => setNewDhikrTarget(parseInt(e.target.value) || 100)}
                              className="w-16 text-center p-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold outline-none focus:ring-2 focus:ring-teal-500"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={addDhikr}
                            className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-[0.98] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                          >
                            <Plus size={16} />
                            <span>إضافة الذكر للقائمة</span>
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Group 3: Goals */}
                  <div className="space-y-3">
                    <p className="px-3 text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">أهدافي الخاصة</p>
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 shadow-sm border border-slate-100 dark:border-slate-700/50 space-y-4">
                      <div className="space-y-3">
                        {[...appContextGoals.map(g => ({...g, src: 'appContext'})), ...remoteGoals.map(g => ({...g, text: g.titleAr, src: 'remote'}))].map(goal => (
                           <div key={goal.id} className={cn("flex flex-col gap-2 p-3 rounded-2xl border", activeGoalId === goal.id ? "bg-amber-50 dark:bg-amber-900/20 border-amber-500/50" : "bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800")}>
                              <div className="flex justify-between items-start gap-2 cursor-pointer" onClick={() => { setActiveGoalId(goal.id!); setActiveGoalSource(goal.src as any); setShowSettings(false); }}>
                                 <span className={cn("font-bold text-sm", goal.isCompleted && "line-through opacity-50")}>{goal.text}</span>
                                 {goal.isCompleted && <CheckCircle2 size={16} className="text-amber-500 shrink-0" />}
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="flex-grow h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(goal.currentCount / goal.targetCount) * 100}%` }} />
                                </div>
                                <span className="text-[10px] font-black text-slate-500">{goal.currentCount}/{goal.targetCount}</span>
                                {goal.src === 'appContext' ? (
                                   <button onClick={() => deleteTasbihGoal(goal.id!)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"><Trash2 size={14}/></button>
                                ) : (
                                   <div className="flex gap-1">
                                     <button onClick={() => progressService.resetTasbeehGoal(auth.currentUser!.uid, goal.id!)} className="p-1.5 text-slate-400 hover:bg-slate-200 rounded-lg"><RotateCcw size={14}/></button>
                                     <button onClick={() => progressService.deleteTasbeehGoal(auth.currentUser!.uid, goal.id!)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"><Trash2 size={14}/></button>
                                   </div>
                                )}
                              </div>
                           </div>
                        ))}
                        {appContextGoals.length === 0 && remoteGoals.length === 0 && (
                           <p className="text-xs text-center text-slate-400 dark:text-slate-500 py-2 font-bold">لا توجد أهداف حالية</p>
                        )}
                      </div>

                      {/* Add Goal Box */}
                      <div className="p-3 bg-slate-50 dark:bg-slate-900/80 rounded-2xl border border-slate-200/70 dark:border-slate-700/70 space-y-2.5">
                        <p className="text-[11px] font-black text-amber-700 dark:text-amber-400">إضافة هدف جديد</p>
                        
                        <input
                          value={newGoalText}
                          onChange={(e) => {
                            setNewGoalText(e.target.value);
                            setTasbihError(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddGoal();
                            }
                          }}
                          placeholder="أضف نص الهدف الخاص (مثل: الاستغفار 1000 مرة)..."
                          className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500 border border-slate-200 dark:border-slate-700"
                        />

                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] font-bold text-slate-500">العدد:</span>
                            {[33, 100, 500, 1000].map((val) => (
                              <button
                                type="button"
                                key={val}
                                onClick={() => setNewGoalTarget(val)}
                                className={cn(
                                  "px-2 py-1 rounded-lg text-[10px] font-black transition-all",
                                  newGoalTarget === val
                                    ? "bg-amber-600 text-white shadow-sm"
                                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                                )}
                              >
                                {val}
                              </button>
                            ))}
                          </div>

                          <input
                            type="number"
                            min={1}
                            value={newGoalTarget}
                            onChange={(e) => setNewGoalTarget(parseInt(e.target.value) || 100)}
                            className="w-16 text-center p-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={handleAddGoal}
                          className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-[0.98] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                        >
                          <Plus size={16} />
                          <span>إضافة الهدف</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Group 4: Aesthetics */}
                 <div className="space-y-3">
                   <p className="px-3 text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">تخصيص المظهر</p>
                   <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700/50 p-4 space-y-6">
                     
                     {/* Theme */}
                     <div className="space-y-2">
                       <label className="text-sm font-bold text-slate-700 dark:text-slate-300">لون الثيم الأساسي</label>
                       <div className="flex flex-wrap gap-2">
                         {THEMES.map((t) => (
                           <button key={t.id} onClick={() => setTheme(t)} className={cn("w-9 h-9 rounded-full border-4 transition-all", t.bg, theme.id === t.id ? "border-slate-400/50 scale-110 shadow-md" : "border-slate-100 dark:border-slate-700")} />
                         ))}
                       </div>
                     </div>

                     {/* Digital Fonts */}
                     <div className="space-y-3">
                       <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"><Type size={14}/>خط العداد الرقمي</label>
                       <div className="grid grid-cols-3 gap-2">
                         {DIGITAL_FONTS.map((f) => (
                           <button key={f.id} onClick={() => setDigitalFont(f.id as any)} className={cn("p-2 rounded-xl text-center border-2 flex flex-col items-center justify-center transition-all", digitalFont === f.id ? "border-teal-500 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 shadow-sm" : "border-slate-100 dark:border-slate-700 text-slate-500 bg-slate-50 dark:bg-slate-900")}>
                             <span className={cn("text-lg font-bold leading-none", f.className)} style={{ transform: f.skew ? "skewX(-5deg)" : "none" }}>88</span>
                             <span className="text-[9px] font-black mt-1.5 opacity-70 leading-none">{t(f.nameKey)}</span>
                           </button>
                         ))}
                       </div>
                     </div>

                     {/* Bead Style */}
                     <div className="space-y-3">
                       <label className="text-sm font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">شكل خرز المسبحة</label>
                       <div className="flex overflow-x-auto gap-2 pb-2 custom-scrollbar">
                         {(["basic","pearl","wood","metal","crystal","onyx","marble","silver","emerald","sapphire","ruby"] as const).map(style => (
                           <button key={style} onClick={() => updateSettings({ tasbihBeadStyle: style })} className={cn("px-4 py-2 rounded-xl text-xs font-bold border-2 whitespace-nowrap transition-all", settings.tasbihBeadStyle === style ? "border-teal-500 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 shadow-sm" : "border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-200")}>
                             {style === "basic" ? "عادي" : style === "pearl" ? "لؤلؤ" : style === "wood" ? "خشب" : style === "metal" ? "معدن" : style === "crystal" ? "كريستال" : style === "onyx" ? "أونيكس" : style === "marble" ? "رخام" : style === "silver" ? "فضة" : style === "emerald" ? "زمرد" : style === "sapphire" ? "ياقوت" : "روبي"}
                           </button>
                         ))}
                       </div>
                     </div>

                   </div>
                 </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tasbih;
