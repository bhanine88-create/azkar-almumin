import React, { useEffect, useState } from 'react';
import { BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { getNativeMushafState, isNativeMushafAvailable, Mushaf, openNativeMushaf } from '../services/mushafNative';
import { SURAH_NAMES, SURAH_START_PAGES } from '../utils/quranUtils';
import { useQuranSettings } from '../context/QuranSettingsContext';
import { cn } from '../lib/utils';

/**
 * Top of the surah list on Android: opens the native page-by-page mushaf,
 * continuing from the last page read, and chooses how a tapped surah opens:
 * in the mushaf (native reader) or as text.
 */
export function MushafOpenCard({ t, language, isRtl }: {
  t: (key: string, fallback: string, params?: Record<string, string | number>) => string;
  language: string;
  isRtl: boolean;
}) {
  const [lastPage, setLastPage] = useState(0);
  const { viewMode, setViewMode } = useQuranSettings();

  useEffect(() => {
    if (!isNativeMushafAvailable()) return;
    let active = true;
    getNativeMushafState().then(state => { if (active && state) setLastPage(state.lastPage); });
    const handle = Mushaf.addListener('closed', ({ lastPage: page }) => { if (active) setLastPage(page); });
    return () => {
      active = false;
      handle.then(h => h.remove()).catch(() => {});
    };
  }, []);

  if (!isNativeMushafAvailable()) return null;

  const surahIndex = lastPage > 0 ? SURAH_START_PAGES.filter(start => start <= lastPage).length - 1 : -1;
  const Arrow = isRtl ? ChevronLeft : ChevronRight;

  return (
    <div className="max-w-2xl mx-auto w-full px-4 mb-3">
      <button
        type="button"
        onClick={() => openNativeMushaf(lastPage || undefined, t, language, isRtl).catch(() => {})}
        className="w-full flex items-center gap-3.5 p-4 rounded-3xl text-start text-white bg-gradient-to-br from-[#006A4E] to-[#052418] border border-amber-300/40 shadow-[0_10px_30px_-10px_rgba(0,106,78,0.6)] active:scale-[0.98] transition-transform"
      >
        <span className="w-12 h-12 shrink-0 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center">
          <BookOpen size={24} className="text-amber-300" />
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-base font-black">{t('mushaf_card_title', 'المصحف الشريف بالصفحات')}</span>
          <span className="block text-xs font-bold text-emerald-100/80 mt-0.5 truncate">
            {lastPage > 0
              ? t('mushaf_card_continue', 'متابعة من صفحة {{page}} · سورة {{surah}}', { page: lastPage, surah: SURAH_NAMES[surahIndex] })
              : t('mushaf_card_desc', 'مصحف المدينة بصفحاته، بالسحب والتكبير')}
          </span>
        </span>
        <Arrow size={20} className="text-amber-300 shrink-0" />
      </button>
      <div className="mt-2 flex items-center justify-center gap-2 text-[11px] font-bold text-slate-500 dark:text-slate-400">
        <span>{t('mushaf_open_mode_label', 'فتح السور:')}</span>
        {([['mushaf', t('mushaf_open_mode_pages', 'بالمصحف')], ['vertical', t('mushaf_open_mode_text', 'نصياً')]] as const).map(([mode, text]) => (
          <button
            key={mode}
            type="button"
            onClick={() => setViewMode(mode)}
            aria-pressed={viewMode === mode}
            className={cn(
              "px-3 py-1 rounded-full border transition-colors",
              viewMode === mode
                ? "bg-[#006A4E] text-white border-[#006A4E]"
                : "border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400"
            )}
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  );
}
