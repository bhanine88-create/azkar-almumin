import React from 'react';

export const PageSkeletonFallback: React.FC<{ title?: string }> = () => {
  return (
    <div className="w-full h-full min-h-[70vh] flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-150 relative overflow-hidden" dir="rtl">
      {/* Top Header Placeholder */}
      <div className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/80 px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-slate-200/70 dark:bg-slate-800/70 animate-pulse shrink-0" />
          <div className="space-y-1.5">
            <div className="h-5 w-32 bg-slate-200/80 dark:bg-slate-800/80 rounded-lg animate-pulse" />
            <div className="h-3 w-48 bg-slate-200/50 dark:bg-slate-800/50 rounded-md animate-pulse" />
          </div>
        </div>
        <div className="w-8 h-8 rounded-xl bg-slate-200/50 dark:bg-slate-800/50 animate-pulse" />
      </div>

      {/* Main Content Skeleton Cards */}
      <div className="p-4 space-y-4 max-w-4xl w-full mx-auto flex-1">
        {/* Banner Skeleton */}
        <div className="w-full h-32 rounded-3xl bg-gradient-to-r from-teal-500/10 via-emerald-500/5 to-teal-500/10 border border-teal-500/20 p-5 flex flex-col justify-between animate-pulse">
          <div className="flex items-center justify-between">
            <div className="h-4 w-28 bg-teal-500/20 rounded-md" />
            <div className="w-8 h-8 rounded-xl bg-teal-500/20" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-3/4 bg-teal-500/20 rounded-md" />
            <div className="h-3 w-1/2 bg-teal-500/15 rounded-md" />
          </div>
        </div>

        {/* Content Card Grid Shimmer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div 
              key={i} 
              className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/60 dark:border-slate-800/80 shadow-sm space-y-3 animate-pulse"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-slate-200 dark:bg-slate-800 shrink-0" />
                  <div className="space-y-1.5">
                    <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded-md" />
                    <div className="h-3 w-20 bg-slate-200/60 dark:bg-slate-800/60 rounded" />
                  </div>
                </div>
                <div className="w-5 h-5 rounded-full bg-slate-200/60 dark:bg-slate-800/60" />
              </div>
              <div className="space-y-2 pt-1">
                <div className="h-3.5 w-full bg-slate-200/70 dark:bg-slate-800/70 rounded" />
                <div className="h-3.5 w-4/5 bg-slate-200/50 dark:bg-slate-800/50 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
