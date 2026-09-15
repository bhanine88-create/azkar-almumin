import React from 'react';
import { motion } from 'motion/react';
import { Activity } from 'lucide-react';

export const PageSkeletonFallback: React.FC<{ title?: string }> = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full h-full min-h-[70vh] flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200 relative overflow-hidden" dir="rtl">
      
      {/* Top Header Placeholder */}
      <div className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/80 px-4 py-3.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-200/70 dark:bg-slate-800/70 animate-pulse shrink-0 flex items-center justify-center">
             <Activity className="w-5 h-5 text-slate-400/50 dark:text-slate-500/50" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-32 bg-slate-200/80 dark:bg-slate-800/80 rounded-lg animate-pulse" />
            <div className="h-2.5 w-48 bg-slate-200/50 dark:bg-slate-800/50 rounded-md animate-pulse" />
          </div>
        </div>
        <div className="w-9 h-9 rounded-xl bg-slate-200/50 dark:bg-slate-800/50 animate-pulse" />
      </div>

      {/* Main Content Skeleton Cards */}
      <div className="p-4 space-y-5 max-w-4xl w-full mx-auto flex-1">
        {/* Banner Skeleton */}
        <div className="w-full h-36 rounded-3xl bg-gradient-to-br from-emerald-500/5 via-teal-500/10 to-emerald-500/5 border border-emerald-500/10 p-5 flex flex-col justify-between animate-pulse relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
          <div className="flex items-center justify-between">
            <div className="h-5 w-36 bg-emerald-500/20 rounded-lg" />
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20" />
          </div>
          <div className="space-y-2.5">
            <div className="h-4 w-3/4 bg-emerald-500/15 rounded-md" />
            <div className="h-3 w-1/2 bg-emerald-500/10 rounded-md" />
          </div>
        </div>

        {/* Content Card Grid Shimmer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div 
              key={i} 
              className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/60 dark:border-slate-800/80 shadow-sm space-y-4 animate-pulse relative overflow-hidden"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-100/50 dark:via-slate-800/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" style={{ animationDelay: `${i * 150}ms` }} />
              
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-slate-200/80 dark:bg-slate-800/80 shrink-0" />
                  <div className="space-y-2">
                    <div className="h-4 w-28 bg-slate-200/90 dark:bg-slate-700/80 rounded-md" />
                    <div className="h-3 w-20 bg-slate-200/60 dark:bg-slate-800/60 rounded" />
                  </div>
                </div>
                <div className="w-6 h-6 rounded-full bg-slate-200/60 dark:bg-slate-800/60" />
              </div>
              <div className="space-y-2.5 pt-2 relative z-10">
                <div className="h-3 w-full bg-slate-200/70 dark:bg-slate-800/70 rounded" />
                <div className="h-3 w-4/5 bg-slate-200/50 dark:bg-slate-800/50 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </motion.div>
  );
};

