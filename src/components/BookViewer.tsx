import React, { useState, useEffect } from 'react';
import { Book, ChevronLeft, ChevronRight, Bookmark, BookmarkCheck, List } from 'lucide-react';
import { IBN_HISHAM_BOOK } from '../data/ibnHishamData';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { safeLocalStorageGetItem, safeLocalStorageSetItem, safeLocalStorageRemoveItem } from "../utils/storage";

export function BookViewer() {
  const [currentChapter, setCurrentChapter] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [savedPage, setSavedPage] = useState<{ chapter: number; page: number } | null>(null);
  const [showIndex, setShowIndex] = useState(false);

  useEffect(() => {
    const saved = safeLocalStorageGetItem('seerah_book_progress');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.chapter === 'number' && typeof parsed.page === 'number') {
          setSavedPage(parsed);
          setCurrentChapter(parsed.chapter);
          setCurrentPage(parsed.page);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const saveProgress = () => {
    const progress = { chapter: currentChapter, page: currentPage };
    safeLocalStorageSetItem('seerah_book_progress', JSON.stringify(progress));
    setSavedPage(progress);
  };

  const isSavedPage = savedPage?.chapter === currentChapter && savedPage?.page === currentPage;

  const goToNextPage = () => {
    if (currentPage < IBN_HISHAM_BOOK[currentChapter].pages.length - 1) {
      setCurrentPage(p => p + 1);
    } else if (currentChapter < IBN_HISHAM_BOOK.length - 1) {
      setCurrentChapter(c => c + 1);
      setCurrentPage(0);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(p => p - 1);
    } else if (currentChapter > 0) {
      setCurrentChapter(c => c - 1);
      setCurrentPage(IBN_HISHAM_BOOK[currentChapter - 1].pages.length - 1);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-slate-800 p-5 sm:p-8 shadow-sm flex flex-col h-[70vh] min-h-[500px]">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 flex items-center justify-center">
            <Book size={20} />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-800 dark:text-white">سيرة ابن هشام</h2>
            <p className="text-xs text-slate-500 font-bold">لأبي محمد عبد الملك بن هشام</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowIndex(!showIndex)}
            className={cn(
              "p-2 rounded-xl transition-colors",
              showIndex ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30" : "bg-slate-50 text-slate-500 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700"
            )}
            title="الفهرس"
          >
            <List size={18} />
          </button>
          <button
            onClick={saveProgress}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black transition-colors",
              isSavedPage 
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400" 
                : "bg-slate-50 text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            )}
            title="حفظ الصفحة الحالية"
          >
            {isSavedPage ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
            <span className="hidden sm:inline">{isSavedPage ? 'تم الحفظ' : 'حفظ الصفحة'}</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden relative">
        {/* Index Sidebar */}
        <AnimatePresence>
          {showIndex && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 250, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-l border-slate-100 dark:border-slate-800 overflow-y-auto pl-4 flex-shrink-0 hidden md:block"
            >
              <h3 className="text-xs font-black text-slate-400 mb-3 uppercase tracking-wider">الفصول</h3>
              <div className="space-y-1">
                {IBN_HISHAM_BOOK.map((chapter, idx) => (
                  <button
                    key={chapter.id}
                    onClick={() => {
                      setCurrentChapter(idx);
                      setCurrentPage(0);
                    }}
                    className={cn(
                      "w-full text-right px-3 py-2 rounded-lg text-sm font-bold transition-colors line-clamp-1",
                      idx === currentChapter 
                        ? "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400" 
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    )}
                  >
                    {chapter.title}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reader Content */}
        <div className="flex-1 flex flex-col h-full bg-[#fcf9f2] dark:bg-slate-800/50 rounded-2xl border border-[#f0e6d2] dark:border-slate-700/50 relative overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 sm:p-10 text-justify">
            <h1 className="text-xl font-black text-amber-900 dark:text-amber-500 mb-8 text-center border-b border-amber-900/10 dark:border-amber-500/10 pb-4">
              {IBN_HISHAM_BOOK[currentChapter].title}
            </h1>
            
            <p className="text-lg leading-[2.2] font-semibold text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
              {IBN_HISHAM_BOOK[currentChapter].pages[currentPage]}
            </p>
          </div>

          {/* Navigation Footer */}
          <div className="bg-[#f5ecdb] dark:bg-slate-800 border-t border-[#e8dcc4] dark:border-slate-700 p-3 sm:px-6 flex items-center justify-between shrink-0">
            <button
              onClick={goToNextPage}
              disabled={currentChapter === IBN_HISHAM_BOOK.length - 1 && currentPage === IBN_HISHAM_BOOK[currentChapter].pages.length - 1}
              className="p-2 rounded-xl bg-white/60 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={20} />
            </button>
            
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              صفحة {currentPage + 1} من {IBN_HISHAM_BOOK[currentChapter].pages.length}
            </span>

            <button
              onClick={goToPrevPage}
              disabled={currentChapter === 0 && currentPage === 0}
              className="p-2 rounded-xl bg-white/60 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Index Modal Overlay if needed, but for now we just show in reader or keep it simple */}
    </div>
  );
}
