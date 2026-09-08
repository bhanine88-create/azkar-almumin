import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Star, Mic2, ChevronLeft, Search } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { SCHOLARS } from '../data/lectures';
import { cn } from '../lib/utils';
import { BackButton } from './ui/BackButton';
import { EmptyStatePlaceholder } from './EmptyStatePlaceholder';
import { smartScholarMatch } from '../lib/arabicSearch';
import { preloadAudioLibraryRoutes } from '../lib/preloadLibrary';

export const FavoriteScholarsPage: React.FC = () => {
  const navigate = useNavigate();
  const { progress, toggleScholarFavorite } = useAppContext();
  const [searchQuery, setSearchQuery] = React.useState('');

  React.useEffect(() => {
    preloadAudioLibraryRoutes();
  }, []);

  const favoriteIds = progress.favoriteScholars || [];
  const favoriteScholars = SCHOLARS.filter(s => favoriteIds.includes(s.id))
    .filter(s => smartScholarMatch(s, searchQuery));

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-black/5 dark:border-white/5 px-4 py-4 mb-6">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton />
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                الشيوخ المفضلون ({favoriteScholars.length})
                <Star size={18} className="text-amber-500 fill-current" />
              </h1>
              <p className="text-[10px] font-bold text-slate-500">قائمة شيوخك ودعاتك المفضلين</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 w-full">
        {/* Search within favorites */}
        {favoriteIds.length > 0 && (
          <div className="relative mb-6">
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
              <Search size={16} />
            </div>
            <input
              type="text"
              placeholder="البحث في المفضلين..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pr-11 pl-4 rounded-2xl text-sm font-bold bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 outline-none focus:ring-2 focus:ring-fuchsia-500/20 transition-all"
            />
          </div>
        )}

        {favoriteScholars.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {favoriteScholars.map((s, idx) => (
              <motion.div
                key={`fav-scholar-page-${s.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group p-4 bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-3xl shadow-sm hover:shadow-md transition-all flex items-center justify-between cursor-pointer"
                onClick={() => navigate('/lectures-audio', { state: { scholarId: s.id } })}
              >
                <div className="flex items-center gap-4">
                  <div className="relative w-12 h-12 rounded-2xl bg-fuchsia-50 dark:bg-fuchsia-900/30 flex items-center justify-center text-fuchsia-600 dark:text-fuchsia-400 group-hover:scale-110 transition-transform">
                    <span className="absolute -top-1.5 -right-1.5 bg-slate-900/90 dark:bg-white text-white dark:text-slate-900 rounded-lg px-2 py-0.5 text-[8px] font-black z-20 flex items-center justify-center shadow-lg border border-white/20 dark:border-slate-800">
                      {idx + 1}
                    </span>
                    <Mic2 size={24} />
                  </div>
                  <div className="text-right">
                    <h3 className="font-black text-slate-900 dark:text-white text-base">{s.name}</h3>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.series.length} سلسلة</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleScholarFavorite(s.id);
                    }}
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-amber-50 dark:bg-amber-900/20 text-amber-500"
                  >
                    <Star size={18} className="fill-current" />
                  </button>
                  <ChevronLeft size={18} className="text-slate-300 group-hover:-translate-x-1 transition-transform" />
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <EmptyStatePlaceholder
            title={searchQuery ? "لا توجد نتائج بحث" : "لم تضف أي شيوخ بعد"}
            description={searchQuery 
              ? "جرب البحث بكلمة أخرى أو عرض القائمة كاملة" 
              : "يمكنك إضافة الشيوخ المفضلين عن طريق الضغط على زر النجمة في قسم المحاضرات"}
            variant="empty"
            action={!searchQuery ? (
              <button
                onClick={() => navigate('/lectures-audio')}
                className="px-8 py-3 bg-fuchsia-600 text-white font-black rounded-2xl shadow-lg shadow-fuchsia-600/30 hover:bg-fuchsia-700 transition-colors"
              >
                تصفح الشيوخ
              </button>
            ) : undefined}
          />
        )}
      </div>
    </div>
  );
};
