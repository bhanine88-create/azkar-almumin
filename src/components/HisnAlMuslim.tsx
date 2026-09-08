import { BackButton } from './ui/BackButton';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {  Shield, ChevronDown , BookOpen } from 'lucide-react';
import {} from 'react-router-dom';
import { hisnAlMuslim } from '../data/hisnAlMuslim';
import { useSmartNavigation } from "../lib/navigation";
import { triggerHaptic } from '../lib/utils';


export const HisnAlMuslim: React.FC = () => {
  const { navigate, goBack } = useSmartNavigation();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const touchStartX = React.useRef<number>(0);
  const touchStartY = React.useRef<number>(0);
  const touchEndX = React.useRef<number>(0);
  const touchEndY = React.useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchEndX.current = e.touches[0].clientX;
    touchEndY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
    touchEndY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = () => {
    const deltaX = touchEndX.current - touchStartX.current;
    const deltaY = touchEndY.current - touchStartY.current;
    const minSwipeDistance = 50;

    if (Math.abs(deltaX) > minSwipeDistance && Math.abs(deltaX) > Math.abs(deltaY) * 1.3) {
      if (expandedId === null) {
        // Expand first category if none expanded
        if (hisnAlMuslim.length > 0) setExpandedId(hisnAlMuslim[0].id);
      } else {
        const currentIdx = hisnAlMuslim.findIndex(c => c.id === expandedId);
        if (currentIdx !== -1) {
          if (deltaX < 0) {
            // Dragged left -> Next chapter
            const nextIdx = currentIdx + 1;
            if (nextIdx < hisnAlMuslim.length) {
              setExpandedId(hisnAlMuslim[nextIdx].id);
              triggerHaptic('light');
            }
          } else {
            // Dragged right -> Prev chapter
            const prevIdx = currentIdx - 1;
            if (prevIdx >= 0) {
              setExpandedId(hisnAlMuslim[prevIdx].id);
              triggerHaptic('light');
            }
          }
        }
      }
    }

    touchStartX.current = 0;
    touchEndX.current = 0;
    touchStartY.current = 0;
    touchEndY.current = 0;
  };

  return (
    <div 
      className="space-y-4 pb-8"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <BackButton />
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">حصن المسلم</h2>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">أذكار وأدعية بالشرح</p>
        </div>
      </div>

      {/* Categories List */}
      <div className="space-y-3">
        {hisnAlMuslim.map((category) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 overflow-hidden"
          >
            <button
              onClick={() => setExpandedId(expandedId === category.id ? null : category.id)}
              className="w-full p-4 flex items-center justify-between text-right"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-md">
                  <Shield size={24} />
                </div>
                <h3 className="font-black text-lg sm:text-xl text-blue-800 dark:text-blue-300">{category.title}</h3>
              </div>
              <motion.div
                animate={{ rotate: expandedId === category.id ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="w-8 h-8 flex items-center justify-center text-slate-400"
              >
                <ChevronDown size={18} />
              </motion.div>
            </button>

            <AnimatePresence>
              {expandedId === category.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                >
                  <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-700/50 space-y-4">
                    {category.adhkar.map((dhikr) => (
                      <div key={dhikr.id} className="bg-slate-50 dark:bg-slate-900/50 p-6 sm:p-8 rounded-3xl mt-4 border border-slate-100 dark:border-slate-800">
                        <p className="text-slate-800 dark:text-slate-200 leading-[2.2] font-extrabold tracking-widest text-2xl sm:text-3xl text-center mb-6 font-adhkar" style={{ fontFamily: "var(--font-adhkar)" }}>
                          {dhikr.text}
                        </p>
                        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700">
                          <div className="flex items-center gap-2 mb-3 text-blue-600 dark:text-blue-400">
                            <BookOpen size={24} />
                            <h4 className="font-black text-base sm:text-lg">الشرح والفضل:</h4>
                          </div>
                          <p className="text-slate-950 dark:text-slate-100 font-black leading-relaxed text-base sm:text-lg mb-4">
                            {dhikr.explanation}
                          </p>
                          <div className="text-sm text-slate-500 dark:text-slate-400 font-bold bg-slate-100 dark:bg-slate-900 inline-block px-3 py-1.5 rounded-lg transform transition-all duration-75 active:scale-[0.95] active:opacity-80">
                            المرجع: {dhikr.reference}
                          </div>
                        </div>


                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
