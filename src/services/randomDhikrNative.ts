import { Capacitor, registerPlugin } from '@capacitor/core';
import { AppSettings } from '../types';

/**
 * Random dhikr on Android is shown by the app's own native code
 * (android/.../RandomDhikrPlugin.java): a silent card for three seconds, over
 * other apps when the user allows it, otherwise a silent notification that
 * removes itself. JS only hands it the plan and the card's colours.
 */
export interface RandomDhikrStatus {
  canDrawOverlays: boolean;
  count: number;
  /** Next armed slot (epoch ms), or -1. */
  next: number;
}

export interface RandomDhikrStyle {
  title: string;
  background: string;
  background2: string;
  border: string;
  titleColor: string;
  textColor: string;
  position: string;
  /** Skip the native card while the app is open, where the in-app card shows. */
  inAppWhenOpen: boolean;
}

interface RandomDhikrPlugin {
  schedule(options: { items: { at: number; text: string }[]; style: RandomDhikrStyle }): Promise<RandomDhikrStatus>;
  cancel(): Promise<RandomDhikrStatus>;
  getStatus(): Promise<RandomDhikrStatus>;
  openOverlaySettings(): Promise<void>;
}

export const RandomDhikr = registerPlugin<RandomDhikrPlugin>('RandomDhikr');

export const isRandomDhikrNativeAvailable = () => Capacitor.getPlatform() === 'android';

const WHITE = '#FFFFFF';
const SLATE_900 = '#0F172A';

/**
 * The in-app card's themes (Layout.tsx) as plain colours:
 * [background, background end, border, text]. Light themes use dark text.
 */
const CARD_THEMES: Record<string, [string, string, string, string]> = {
  emerald: ['#059669', '#059669', WHITE, WHITE],
  gold: ['#F59E0B', '#F59E0B', WHITE, WHITE],
  blue: ['#2563EB', '#2563EB', WHITE, WHITE],
  teal: ['#0D9488', '#0D9488', WHITE, WHITE],
  purple: ['#9333EA', '#9333EA', WHITE, WHITE],
  rose: ['#F43F5E', '#F43F5E', WHITE, WHITE],
  red: ['#DC2626', '#DC2626', '#FDE047', WHITE],
  pink: ['#EC4899', '#FB7185', WHITE, WHITE],
  'orange-glow': ['#FB923C', '#F59E0B', WHITE, WHITE],
  'clay-brown': ['#E2D1C3', '#E2D1C3', '#D9B9A0', '#5D4037'],
  dark: [SLATE_900, SLATE_900, '#94A3B8', WHITE],
  'yellow-dark': ['#FACC15', '#FACC15', SLATE_900, SLATE_900],
  'cyan-dark': ['#22D3EE', '#22D3EE', SLATE_900, SLATE_900],
  'pink-burgundy': ['#F9A8D4', '#F9A8D4', '#4C0519', '#4C0519'],
  'mint-navy': ['#99F6E4', '#99F6E4', SLATE_900, SLATE_900],
  'midnight-gold': ['#020617', '#020617', '#FBBF24', WHITE],
  'orange-navy': ['#F97316', '#F97316', SLATE_900, SLATE_900],
  'indigo-coral': ['#1E1B4B', '#1E1B4B', '#FB7185', WHITE],
  'matcha-forest': ['#DCFCE7', '#DCFCE7', '#14532D', '#052E16'],
  'lavender-plum': ['#FAE8FF', '#FAE8FF', '#3B0764', '#3B0764'],
  'crimson-sand': ['#FFFBEB', '#FFFBEB', '#991B1B', '#450A0A'],
  'frost-slate': ['#E0F2FE', '#E0F2FE', '#1E293B', SLATE_900],
};

export function randomDhikrStyle(settings: AppSettings): RandomDhikrStyle {
  const [background, background2, border, textColor] =
    CARD_THEMES[settings.randomAdhkarTheme || 'emerald'] || CARD_THEMES.emerald;
  const darkText = textColor !== WHITE;
  return {
    title: 'لا تنسى ذكر الله',
    background,
    background2,
    border,
    titleColor: darkText ? SLATE_900 : WHITE,
    textColor,
    position: settings.randomAdhkarPosition || 'top-left',
    inAppWhenOpen: (settings.randomAdhkarNotificationType || 'both') !== 'system',
  };
}

/** Whether Android lets the card be drawn over other apps. */
export async function canShowOverOtherApps(): Promise<boolean> {
  if (!isRandomDhikrNativeAvailable()) return false;
  try {
    return (await RandomDhikr.getStatus()).canDrawOverlays;
  } catch {
    return false;
  }
}

/** Opens Android's "Display over other apps" page; call only from a tap. */
export async function openOverOtherAppsSettings(): Promise<void> {
  if (!isRandomDhikrNativeAvailable()) return;
  try {
    await RandomDhikr.openOverlaySettings();
  } catch (err) {
    console.warn('[RandomDhikr] openOverlaySettings failed:', err);
  }
}
