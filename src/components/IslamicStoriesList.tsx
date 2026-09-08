import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  ChevronLeft, 
  Search, 
  Star, 
  Users, 
  Crown, 
  Book, 
  History, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  Bookmark, 
  Award,
  BookOpenText,
  BookmarkCheck,
  Heart
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { BackButton } from './ui/BackButton';
import { EmptyStatePlaceholder } from './EmptyStatePlaceholder';
import { ISLAMIC_STORIES } from '../data/islamicStories';
import { useTranslation } from '../i18n';
import { useAppContext } from '../AppContext';
import { safeLocalStorageGetItem, safeLocalStorageSetItem, safeLocalStorageRemoveItem } from "../utils/storage";

const CATEGORIES = [
  { id: 'all', label: 'الكل', icon: Sparkles, color: 'from-amber-500 to-orange-600' },
  { id: 'prophets', label: 'قصص الأنبياء', icon: Crown, color: 'from-emerald-500 to-teal-600' },
  { id: 'companions', label: 'قصص الصحابة', icon: Users, color: 'from-blue-500 to-indigo-600' },
  { id: 'biography', label: 'السيرة النبوية', icon: Book, color: 'from-rose-500 to-pink-600' },
  { id: 'quran', label: 'قصص القرآن', icon: BookOpen, color: 'from-purple-500 to-fuchsia-600' },
  { id: 'history', label: 'التاريخ الإسلامي', icon: History, color: 'from-cyan-500 to-blue-600' },
];

const getCategoryDetails = (categoryId: string) => {
  return CATEGORIES.find(c => c.id === categoryId) || CATEGORIES[0];
};

const getReadingTime = (text: string) => {
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 180));
  return `${minutes} دقيقة`;
};

export const IslamicStoriesList: React.FC = () => {
  const navigate = useNavigate();
  const { settings, progress } = useAppContext();
  const { t, isRtl } = useTranslation(settings.appLanguage);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [readStories, setReadStories] = useState<string[]>([]);

  // Load read stories from localStorage on mount
  useEffect(() => {
    try {
      const saved = safeLocalStorageGetItem('believer_read_stories');
      if (saved) {
        setReadStories(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Could not read read stories from localStorage', e);
    }
  }, []);

  // Compute Story of the Day (dynamically rotates based on current day of month)
  const storyOfTheDay = useMemo(() => {
    const today = new Date();
    const index = (today.getDate() + today.getMonth() * 31) % ISLAMIC_STORIES.length;
    return ISLAMIC_STORIES[index];
  }, []);

  const filteredStories = useMemo(() => {
    return ISLAMIC_STORIES.filter(story => {
      const matchesSearch = story.title.includes(searchQuery) || story.content.includes(searchQuery);
      const matchesCategory = activeCategory === 'all' || story.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  const favoritesCount = useMemo(() => {
    return (progress.favorites || []).filter(fav => fav.type === 'story').length;
  }, [progress.favorites]);

  const progressPercentage = useMemo(() => {
    if (ISLAMIC_STORIES.length === 0) return 0;
    return Math.round((readStories.length / ISLAMIC_STORIES.length) * 100);
  }, [readStories]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 text-right" dir="rtl">
      {/* Sticky Premium Header */}
      <div className="bg-white/80 dark:bg-slate-900/85 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/80 sticky top-0 z-30">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BackButton />
            <div>
              <h1 className="text-xl font-black bg-gradient-to-r from-amber-600 to-orange-700 bg-clip-text text-transparent leading-tight">{t('islamic_stories')}</h1>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wider">{t('islamic_stories_subtitle') || "عبر ومواعظ من وحي التاريخ والسلف الصالح"}</p>
            </div>
          </div>
          <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
            <BookOpen size={20} className="fill-white/20" />
          </div>
        </div>

        {/* Search Input with modern styling */}
        <div className="px-4 pb-3">
          <div className="relative group">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors" size={18} />
            <input
              type="text"
              placeholder="ابحث عن قصة، نبي، صحابي أو تفاصيل..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-800/60 border border-transparent focus:border-amber-500/30 rounded-2xl py-3.5 pr-11 pl-4 text-sm focus:ring-4 focus:ring-amber-500/10 transition-all outline-none text-slate-800 dark:text-slate-200 placeholder:text-slate-400 font-bold"
            />
          </div>
        </div>

        {/* Categories Horizontal Scroll */}
        <div className="px-4 pb-4 overflow-x-auto no-scrollbar flex gap-2 snap-x">
          {CATEGORIES.map(category => {
            const Icon = category.icon;
            const isActive = activeCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={cn(
                  "flex items-center gap-2 px-4.5 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all cursor-pointer",
                  isActive 
                    ? `bg-gradient-to-r ${category.color} text-white shadow-md shadow-amber-500/10`
                    : "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700"
                )}
              >
                <Icon size={14} className={cn(isActive ? "text-white" : "text-slate-500 dark:text-slate-400")} />
                {category.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-5 space-y-6">
        
        {/* Dynamic Story of the Day Hero Banner (Only shown when on 'All' category and no active search) */}
        {!searchQuery && activeCategory === 'all' && storyOfTheDay && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-800 via-emerald-900 to-slate-950 text-white p-6 sm:p-8 shadow-xl shadow-emerald-950/10 border border-white/5 group"
          >
            {/* Ambient pattern overlay */}
            <div className="absolute inset-0 opacity-10 mix-blend-overlay" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/arabesque.png')" }} />
            <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-3 max-w-xl">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400/20 backdrop-blur-md text-amber-300 rounded-full text-[11px] font-black tracking-wider border border-amber-400/20 uppercase">
                  <Sparkles size={12} className="animate-pulse" />
                  قصة اليوم المختارة
                </span>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight group-hover:text-amber-300 transition-colors">
                  {storyOfTheDay.title}
                </h2>
                <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed font-medium line-clamp-2">
                  {storyOfTheDay.content}
                </p>
                <div className="flex items-center gap-4 text-emerald-200 text-xs font-bold pt-1">
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    <span>وقت القراءة: {getReadingTime(storyOfTheDay.content)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TagIcon category={storyOfTheDay.category} />
                    <span>{getCategoryDetails(storyOfTheDay.category).label}</span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => navigate(`/stories/${storyOfTheDay.id}`)}
                className="shrink-0 bg-amber-400 hover:bg-amber-300 text-slate-950 px-5 py-3.5 rounded-2xl font-black text-xs shadow-lg shadow-amber-400/20 transition-all flex items-center justify-center gap-2 group-hover:scale-[1.03] cursor-pointer self-start sm:self-center"
              >
                <span>اقرأ القصة الآن</span>
                <ChevronLeft size={16} />
              </button>
            </div>
          </motion.div>
        )}

        {/* Smart Stats Dashboard Overview */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-3.5 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm">
            <span className="text-slate-400 dark:text-slate-500 font-extrabold text-[10px] mb-1">القصص الإجمالية</span>
            <span className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-1">
              <BookOpenText size={16} className="text-amber-500" />
              {ISLAMIC_STORIES.length}
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-3.5 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden">
            <span className="text-slate-400 dark:text-slate-500 font-extrabold text-[10px] mb-1">نسبة الإتمام</span>
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <BookmarkCheck size={16} className="text-emerald-500" />
              {progressPercentage}%
            </span>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100 dark:bg-slate-800">
              <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${progressPercentage}%` }} />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-3.5 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm">
            <span className="text-slate-400 dark:text-slate-500 font-extrabold text-[10px] mb-1">المفضلة لدي</span>
            <span className="text-xl font-black text-rose-600 dark:text-rose-400 flex items-center gap-1">
              <Heart size={16} className="text-rose-500 fill-rose-500/10" />
              {favoritesCount}
            </span>
          </div>
        </div>

        {/* Stories Grid */}
        <div>
          {filteredStories.length === 0 ? (
            <EmptyStatePlaceholder
              title="لا توجد نتائج تطابق البحث"
              description={`لم نجد أي قصة تطابق "${searchQuery}". حاول استخدام كلمة أخرى أو التصفح حسب التصنيفات في الأعلى.`}
              variant="search"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredStories.map((story, index) => {
                  const categoryDetails = getCategoryDetails(story.category);
                  const Icon = categoryDetails.icon;
                  const readingTime = getReadingTime(story.content);
                  const isRead = readStories.includes(story.id);
                  const preview = story.content.substring(0, 115) + '...';

                  return (
                    <motion.button
                      layout
                      key={story.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: Math.min(index * 0.04, 0.4) }}
                      onClick={() => navigate(`/stories/${story.id}`)}
                      className="group relative flex flex-col text-right overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/80 p-5.5 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 min-h-[180px] outline-none cursor-pointer"
                    >
                      {/* Interactive dynamic background tint */}
                      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-300", categoryDetails.color)} />
                      
                      <div className="flex justify-between items-center mb-3.5 relative z-10 w-full">
                        <div className={cn("flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-black text-white shadow-sm", `bg-gradient-to-r ${categoryDetails.color}`)}>
                          <Icon size={11} />
                          {categoryDetails.label}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {isRead ? (
                            <span className="flex items-center gap-1 text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 rounded-lg border border-emerald-500/10">
                              <CheckCircle2 size={10} className="stroke-[3]" />
                              تمت قراءتها
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg">
                              غير مقروءة
                            </span>
                          )}
                          <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-850 px-2 py-1 rounded-lg text-[10px] font-extrabold">
                            <Clock size={10} />
                            {readingTime}
                          </div>
                        </div>
                      </div>

                      <h3 className="text-lg font-black text-slate-800 dark:text-white mb-2 relative z-10 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors leading-snug">
                        {story.title}
                      </h3>
                      
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed relative z-10 font-bold opacity-80 line-clamp-2 mb-4">
                        {preview}
                      </p>

                      <div className="mt-auto pt-3.5 border-t border-slate-50 dark:border-slate-800/60 flex justify-end relative z-10 w-full">
                        <span className="text-amber-600 dark:text-amber-400 text-[11px] font-black flex items-center gap-1 group-hover:gap-2.5 transition-all bg-amber-50 dark:bg-amber-950/20 px-3.5 py-1.5 rounded-xl">
                          اقرأ القصة كاملة
                          <ChevronLeft size={13} className="stroke-[2.5]" />
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Internal icon picker based on category
const TagIcon: React.FC<{ category: string }> = ({ category }) => {
  switch (category) {
    case 'prophets': return <Crown size={12} />;
    case 'companions': return <Users size={12} />;
    case 'biography': return <Book size={12} />;
    case 'quran': return <BookOpen size={12} />;
    case 'history': return <History size={12} />;
    default: return <Sparkles size={12} />;
  }
};
