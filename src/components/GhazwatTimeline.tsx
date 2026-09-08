import React from 'react';
import { motion } from 'motion/react';
import { GHAZWAT_DATA } from '../data/ghazwatData';
import { cn } from '../lib/utils';
import { Crosshair, Map, Shield, Sword, Trophy } from 'lucide-react';

export const GhazwatTimeline: React.FC = () => {
  return (
    <div className="space-y-6 pb-12">
      <div className="bg-gradient-to-r from-orange-800 to-rose-900 text-white rounded-3xl p-6 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Sword size={120} />
        </div>
        <div className="relative z-10 space-y-2">
          <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-wider">
            ملاحم وبطولات
          </span>
          <h2 className="text-xl font-black">غزوات الرسول ﷺ</h2>
          <p className="text-xs text-orange-100 font-bold leading-relaxed max-w-md">
            سجل تاريخي لأبرز المعارك الفاصلة التي خاضها النبي الكريم دفاعاً عن رسالة الإسلام وإرساءً لدعائم الحق والعدل.
          </p>
        </div>
      </div>

      <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 md:before:ml-[50%] before:-translate-x-px md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-orange-500 before:via-rose-500 before:to-transparent">
        {GHAZWAT_DATA.map((ghazwa, idx) => {
          const Icon = ghazwa.icon;
          const isEven = idx % 2 === 0;

          return (
            <motion.div
              key={ghazwa.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={cn("relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group", isEven ? "is-even" : "is-odd")}
            >
              {/* Timeline dot */}
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-slate-50 dark:border-slate-950 bg-white dark:bg-slate-900 shadow-md absolute left-0 md:left-1/2 -translate-x-0 md:-translate-x-1/2 z-10">
                <div className={cn("w-full h-full rounded-full flex items-center justify-center text-white bg-gradient-to-br", ghazwa.color)}>
                  <Icon size={16} />
                </div>
              </div>

              {/* Card */}
              <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] ml-auto md:ml-0 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm overflow-hidden group-hover:shadow-md transition-shadow">
                {/* Header */}
                <div className={cn("p-5 border-b border-slate-100 dark:border-slate-800 relative overflow-hidden bg-gradient-to-br", ghazwa.color.replace('from-', 'from-').replace('to-', 'to-').replace('400', '50/50').replace('500', '50/50').replace('600', '100/50').concat(' dark:from-slate-800/50 dark:to-slate-900'))}>
                  <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h3 className="font-black text-lg text-slate-800 dark:text-white flex items-center gap-2">
                      {ghazwa.name}
                    </h3>
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1 bg-white/60 dark:bg-slate-800 px-2 py-1 rounded-lg backdrop-blur-sm">
                        <Map size={14} className={ghazwa.color.split(' ')[0].replace('from-', 'text-')} /> {ghazwa.location}
                      </span>
                      <span className="flex items-center gap-1 bg-white/60 dark:bg-slate-800 px-2 py-1 rounded-lg backdrop-blur-sm">
                        <Crosshair size={14} className={ghazwa.color.split(' ')[0].replace('from-', 'text-')} /> {ghazwa.year}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Combatants Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x sm:divide-x-reverse divide-slate-100 dark:divide-slate-800">
                  {/* Muslims */}
                  <div className="p-4 space-y-3 bg-slate-50/30 dark:bg-slate-800/10 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 transition-colors">
                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-black mb-2 border-b border-emerald-100 dark:border-emerald-900/50 pb-2">
                      <Shield size={16} /> المسلمون
                    </div>
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-500 dark:text-slate-400">القيادة:</span>
                      <span className="text-slate-800 dark:text-slate-200">{ghazwa.parties.muslims.leader}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-500 dark:text-slate-400">القوة:</span>
                      <span className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-lg shadow-sm">
                        {ghazwa.parties.muslims.count}
                      </span>
                    </div>
                  </div>

                  {/* Enemy */}
                  <div className="p-4 space-y-3 bg-slate-50/30 dark:bg-slate-800/10 hover:bg-rose-50/50 dark:hover:bg-rose-900/20 transition-colors">
                    <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-black mb-2 border-b border-rose-100 dark:border-rose-900/50 pb-2">
                      <Sword size={16} /> {ghazwa.parties.enemy.name}
                    </div>
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-500 dark:text-slate-400">القيادة:</span>
                      <span className="text-slate-800 dark:text-slate-200">{ghazwa.parties.enemy.leader}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-500 dark:text-slate-400">القوة:</span>
                      <span className="bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded-lg shadow-sm">
                        {ghazwa.parties.enemy.count}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Result & Description */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <div className="mb-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 font-black text-xs shadow-sm">
                    <Trophy size={14} className={ghazwa.color.split(' ')[0].replace('from-', 'text-')} />
                    <span>النتيجة:</span>
                    <span className={ghazwa.color.split(' ')[0].replace('from-', 'text-')}>{ghazwa.result}</span>
                  </div>
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-300 leading-relaxed text-justify">
                    {ghazwa.description}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
