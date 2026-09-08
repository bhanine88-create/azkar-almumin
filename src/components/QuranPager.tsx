import React, { useRef, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface QuranPagerProps {
  pages: any[];
  renderPage: (page: any, index: number) => React.ReactNode;
  onPageChange?: (index: number) => void;
  currentPageIndex?: number;
}

export const QuranPager: React.FC<QuranPagerProps> = ({
  pages,
  renderPage,
  onPageChange,
  currentPageIndex = 0
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(currentPageIndex);
  
  const currentIndexRef = useRef(currentIndex);
  currentIndexRef.current = currentIndex;

  const [showSwipeHint, setShowSwipeHint] = useState<boolean>(true);

  const isProgrammaticScrollRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Helper to scroll ONLY the pager container without affecting outer window or main scroll
  const scrollToChild = (targetIndex: number, smooth: boolean = true) => {
    const container = scrollRef.current;
    if (!container) return;
    const targetChild = container.children[targetIndex] as HTMLElement;
    if (!targetChild) return;

    const diff = targetChild.getBoundingClientRect().left - container.getBoundingClientRect().left;
    if (Math.abs(diff) > 1) {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      isProgrammaticScrollRef.current = true;

      container.scrollBy({
        left: diff,
        behavior: smooth ? 'smooth' : 'auto',
      });

      const delay = smooth ? 500 : 100;
      scrollTimeoutRef.current = setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, delay);
    } else {
      isProgrammaticScrollRef.current = false;
    }
  };

  // Hide swipe hint automatically after 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSwipeHint(false);
    }, 4000);
    return () => {
      clearTimeout(timer);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  // Sync internal index if external prop changes (e.g. header navigation or button clicks)
  useEffect(() => {
    if (currentPageIndex !== currentIndexRef.current) {
      currentIndexRef.current = currentPageIndex;
      setCurrentIndex(currentPageIndex);
      scrollToChild(currentPageIndex, true);
    }
  }, [currentPageIndex]);

  // Initial scroll to correct page on mount or pages structure change
  useEffect(() => {
    scrollToChild(currentPageIndex, false);
  }, [pages]);

  // Stable IntersectionObserver to keep state in sync during user scrolling without re-entrancy jumping
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isProgrammaticScrollRef.current) return;
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute('data-index'));
            if (!isNaN(idx) && idx !== currentIndexRef.current) {
              currentIndexRef.current = idx;
              setCurrentIndex(idx);
              onPageChange?.(idx);
            }
          }
        });
      },
      {
        root: container,
        threshold: 0.6, // Require 60% visibility to trigger page transition
      }
    );

    const children = container.querySelectorAll('.quran-page-snap');
    children.forEach((child) => observer.observe(child));

    return () => observer.disconnect();
  }, [pages, onPageChange]);

  // Support keyboard navigation (ArrowLeft / ArrowRight) for desktop reading
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === 'ArrowLeft') {
        const nextIdx = currentIndexRef.current + 1;
        if (nextIdx < pages.length) {
          scrollToChild(nextIdx, true);
        }
      } else if (e.key === 'ArrowRight') {
        const prevIdx = currentIndexRef.current - 1;
        if (prevIdx >= 0) {
          scrollToChild(prevIdx, true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pages.length]);

  if (!pages || pages.length === 0) return null;

  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      {/* Visual Touch Swipe Hint Banner for Mobile UX */}
      {showSwipeHint && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 pointer-events-none transition-opacity duration-500 animate-bounce">
          <div className="bg-black/60 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5 dir-rtl">
            <ChevronRight size={12} className="text-emerald-400 animate-pulse" />
            <span>اسحب للتنقل بين الصفحات</span>
            <ChevronLeft size={12} className="text-emerald-400 animate-pulse" />
          </div>
        </div>
      )}

      {/* Scrollable / Swipeable Pager Container with Native CSS Snap */}
      <div
        ref={scrollRef}
        className="w-full h-full flex overflow-x-auto snap-x snap-mandatory hide-scrollbar"
        dir="rtl"
        style={{ 
          scrollSnapType: 'x mandatory',
          overflowY: 'hidden', 
          overscrollBehavior: 'none', 
          touchAction: 'pan-x',
          WebkitOverflowScrolling: 'touch',
          scrollPadding: '0'
        }}
      >
        {pages.map((page, index) => {
          const isVisible = Math.abs(index - currentIndex) <= 2;

          if (!isVisible) {
            return (
              <div
                key={`page-placeholder-${index}`}
                data-index={index}
                className="w-full min-w-full h-full shrink-0 snap-center quran-page-snap"
                style={{ scrollSnapAlign: 'center', scrollSnapStop: 'always' }}
              />
            );
          }

          return (
            <div
              key={`page-content-${index}`}
              data-index={index}
              className="w-full min-w-full h-full shrink-0 snap-center flex flex-col items-center justify-center quran-page-snap overflow-hidden relative p-0 m-0"
              style={{ scrollSnapAlign: 'center', scrollSnapStop: 'always' }}
            >
              {renderPage(page, index)}
            </div>
          );
        })}
      </div>
    </div>
  );
};
