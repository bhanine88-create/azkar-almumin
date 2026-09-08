import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Star, Mic2, ChevronLeft, Search } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { RECITERS } from '../reciters';
import { cn } from '../lib/utils';
import { BackButton } from './ui/BackButton';
import { EmptyStatePlaceholder } from './EmptyStatePlaceholder';
import { smartReciterMatch } from '../lib/arabicSearch';
import { preloadAudioLibraryRoutes } from '../lib/preloadLibrary';

export const FavoriteRecitersPage: React.FC = () => {
  const navigate = useNavigate();
  const { progress, toggleReciterFavorite } = useAppContext();
  const [searchQuery, setSearchQuery] = React.useState('');

  React.useEffect(() => {
    preloadAudioLibraryRoutes();
  }, []);

  const favoriteIds = progress.favoriteReciters || [];
  const favoriteReciters = RECITERS.filter(r => favoriteIds.includes(r.id))
    .filter(r => smartReciterMatch(r, searchQuery));

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-black/5 dark:border-white/5 px-4 py-4 mb-6">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton />
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                القراء المفضلون ({favoriteReciters.length})
                <Star size={18} className="text-amber-500 fill-current" />
              </h1>
              <p className="text-[10px] font-bold text-slate-500">قائمة قرائك المختارين</p>
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
              className="w-full h-12 pr-11 pl-4 rounded-2xl text-sm font-bold bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 outline-none focus:ring-2 focus:ring-teal-500/20 transition-all"
            />
          </div>
        )}

        {favoriteReciters.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {favoriteReciters.map((r, idx) => (
              <motion.div
                key={`fav-reciter-page-${r.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group p-4 bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-3xl shadow-sm hover:shadow-md transition-all flex items-center justify-between cursor-pointer"
                onClick={() => navigate(`/quran-audio/${r.id}`)}
              >
                <div className="flex items-center gap-4">
                  <div className="relative w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform">
                    <span className="absolute -top-1.5 -right-1.5 bg-slate-900/90 dark:bg-white text-white dark:text-slate-900 rounded-lg px-2 py-0.5 text-[8px] font-black z-20 flex items-center justify-center shadow-lg border border-white/20 dark:border-slate-800">
                      {idx + 1}
                    </span>
                    <Mic2 size={20} />
                  </div>
                  <div className="text-right">
                    <h3 className="font-black text-slate-900 dark:text-white text-base">{r.name}</h3>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{r.style}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleReciterFavorite(r.id);
                    }}
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-amber-50 dark:bg-amber-900/20 text-amber-500"
                  >
                    <Star size={16} className="fill-current" />
                  </button>
                  <ChevronLeft size={18} className="text-slate-300 group-hover:-translate-x-1 transition-transform" />
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <EmptyStatePlaceholder
            title={searchQuery ? "لا توجد نتائج بحث" : "لم تضف أي قراء بعد"}
            description={searchQuery 
              ? "جرب البحث بكلمة أخرى أو عرض القائمة كاملة" 
              : "يمكنك إضافة القراء المفضلين عن طريق الضغط على زر النجمة في صفحة القرآن الكريم"}
            variant="empty"
            action={!searchQuery ? (
              <button
                onClick={() => navigate('/quran-audio')}
                className="px-8 py-3 bg-teal-600 text-white font-black rounded-2xl shadow-lg shadow-teal-600/30 hover:bg-teal-700 transition-colors"
              >
                تصفح القراء
              </button>
            ) : undefined}
          />
        )}
      </div>
    </div>
  );
};
