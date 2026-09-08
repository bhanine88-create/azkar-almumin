import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import moment from 'moment-hijri';
import { Sparkles, Bell, BookOpen, Quote, Star, Calendar } from 'lucide-react';
import { useTranslation } from '../i18n';
import { useAppContext } from '../AppContext';
import { cn } from '../lib/utils';

export interface Occasion {
  id: string;
  nameKey: string;
  month: number; // 1-indexed (1-12)
  day?: number; // Optional specific day
  dayRange?: [number, number]; // Optional day range
  duaKey?: string;
  dhikrKey?: string;
  type: 'festival' | 'fasting' | 'spiritual';
}

const OCCASIONS: Occasion[] = [
  { id: 'ashura', nameKey: 'occasion_ashura', month: 1, day: 10, type: 'fasting' },
  { id: 'isra_miraj', nameKey: 'occasion_isra_miraj', month: 7, day: 27, type: 'spiritual' },
  { id: 'shaban', nameKey: 'occasion_shaban', month: 8, day: 15, type: 'spiritual' },
  { id: 'ramadan', nameKey: 'occasion_ramadan', month: 9, duaKey: 'ramadan_dua', type: 'fasting' },
  { id: 'eid_fitr', nameKey: 'occasion_eid_fitr', month: 10, day: 1, dhikrKey: 'eid_takbeer', type: 'festival' },
  { id: 'hajj', nameKey: 'occasion_hajj', month: 12, dayRange: [1, 10], dhikrKey: 'hajj_talbiyah', type: 'spiritual' },
  { id: 'arafah', nameKey: 'occasion_arafah', month: 12, day: 9, dhikrKey: 'arafah_dhikr', type: 'fasting' },
  { id: 'eid_adha', nameKey: 'occasion_eid_adha', month: 12, day: 10, dhikrKey: 'eid_takbeer', type: 'festival' },
];

export const IslamicOccasions = React.memo(() => {
  const { settings } = useAppContext();
  const { t } = useTranslation(settings.appLanguage);
  const [currentOccasions, setCurrentOccasions] = React.useState<Occasion[]>([]);

  React.useEffect(() => {
    const today = moment();
    if (settings.hijriOffset) {
      today.add(settings.hijriOffset, 'days');
    }

    const currentIMonth = today.iMonth() + 1; // 1-indexed
    const currentIDay = today.iDate();

    const active = OCCASIONS.filter(occ => {
      if (occ.month !== currentIMonth) return false;
      
      if (occ.day !== undefined) {
        return occ.day === currentIDay;
      }
      
      if (occ.dayRange) {
        return currentIDay >= occ.dayRange[0] && currentIDay <= occ.dayRange[1];
      }
      
      return true; // Just the month matches (like Ramadan)
    });

    setCurrentOccasions(active);
  }, [settings.hijriOffset]);

  if (currentOccasions.length === 0) return null;

  return (
    <div className="px-1 space-y-3 mb-4">
      <AnimatePresence>
        {currentOccasions.map((occ) => (
          <motion.div
            key={occ.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={cn(
              "relative overflow-hidden rounded-2xl p-5 border shadow-xl",
              occ.type === 'festival' 
                ? "bg-gradient-to-br from-amber-400 via-orange-500 to-red-600 border-orange-400/30 text-white" 
                : occ.type === 'fasting'
                ? "bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 border-emerald-400/30 text-white"
                : "bg-gradient-to-br from-indigo-600 via-purple-700 to-slate-900 border-indigo-400/30 text-white"
            )}
          >
            {/* Background elements */}
            <div className="absolute inset-0 opacity-10 mix-blend-overlay" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/arabesque.png')" }} />
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30 shadow-inner">
                    {occ.type === 'festival' ? <Star size={20} className="fill-white" /> : <Calendar size={20} />}
                  </div>
                  <div className="text-right">
                    <h3 className="font-black text-lg drop-shadow-md leading-tight">
                      {t(occ.nameKey as any)}
                    </h3>
                    <p className="text-[10px] uppercase font-bold tracking-widest opacity-80">
                      {t('occasion_alert', { name: t(occ.nameKey as any) })}
                    </p>
                  </div>
                </div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="bg-white/20 px-2 py-1 rounded-full border border-white/30"
                >
                  <Bell size={14} />
                </motion.div>
              </div>

              <div className="space-y-4">
                {occ.duaKey && (
                  <div className="bg-black/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                    <div className="flex items-center gap-2 mb-2 text-white/70">
                      <Quote size={14} />
                      <span className="text-[10px] font-black uppercase tracking-wider">{t('special_dua_title')}</span>
                    </div>
                    <p className="text-sm font-bold leading-relaxed text-center font-adhkar">
                      {t(occ.duaKey as any)}
                    </p>
                  </div>
                )}

                {occ.dhikrKey && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                    <div className="flex items-center gap-2 mb-2 text-white/70">
                      <BookOpen size={14} />
                      <span className="text-[10px] font-black uppercase tracking-wider">{t('special_dhikr_title')}</span>
                    </div>
                    <p className="text-sm font-bold leading-relaxed text-center font-adhkar">
                      {t(occ.dhikrKey as any)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
});
