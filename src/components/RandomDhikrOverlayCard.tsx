import React, { useEffect, useState } from 'react';
import { CheckCircle2, Layers } from 'lucide-react';
import {
  canShowOverOtherApps,
  isRandomDhikrNativeAvailable,
  openOverOtherAppsSettings,
} from '../services/randomDhikrNative';

/**
 * Random dhikr settings: whether the card may appear over other apps. Android
 * only; re-checked whenever the user comes back from the system screen.
 */
export function RandomDhikrOverlayCard({ t }: { t: (key: string, fallback: string) => string }) {
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isRandomDhikrNativeAvailable()) return;
    let active = true;
    const refresh = () => {
      if (document.visibilityState !== 'visible') return;
      canShowOverOtherApps().then(value => { if (active) setAllowed(value); });
    };
    refresh();
    document.addEventListener('visibilitychange', refresh);
    return () => {
      active = false;
      document.removeEventListener('visibilitychange', refresh);
    };
  }, []);

  if (!isRandomDhikrNativeAvailable() || allowed === null) return null;

  return (
    <div className="bg-white/5 p-3.5 rounded-xl border border-white/5 space-y-2.5">
      <div className="flex items-center gap-2.5">
        <Layers size={16} className="text-pink-400 shrink-0" />
        <span className="text-xs sm:text-sm font-black text-white/95">
          {t('random_overlay_title', 'إظهار البطاقة فوق التطبيقات الأخرى')}
        </span>
      </div>
      <p className="text-[11px] font-bold text-white/70 leading-relaxed">
        {t('random_overlay_desc', 'تظهر بطاقة الذكر على شاشة الهاتف 3 ثوانٍ ثم تختفي، بدون صوت، حتى والتطبيق مغلق. بدون هذا الإذن يظهر إشعار صامت يختفي بعد 3 ثوانٍ.')}
      </p>
      {allowed ? (
        <div className="flex items-center gap-1.5 text-[11px] font-black text-emerald-300">
          <CheckCircle2 size={14} />
          {t('random_overlay_allowed', 'الإذن مفعّل')}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => openOverOtherAppsSettings()}
          className="w-full text-xs font-black text-white bg-pink-500/80 hover:bg-pink-500 px-3 py-2.5 rounded-xl border border-pink-300/30 transition-all active:scale-[0.98]"
        >
          {t('random_overlay_allow', 'السماح بالظهور فوق التطبيقات')}
        </button>
      )}
    </div>
  );
}
