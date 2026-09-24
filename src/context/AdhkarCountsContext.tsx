import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { safeLocalStorageSetItem, safeLocalStorageGetItem, STORAGE_KEYS, readFirstStored, safeJsonParse } from '../utils/storage';

interface AdhkarCountsContextType {
  counts: Record<string, number>;
  updateCount: (dhikrId: string, newCount: number) => void;
  resetCounts: (category?: string, items?: any[]) => void;
  isCategoryFinished: (categoryId: string, items: {id: string, count: number}[]) => boolean;
}

const AdhkarCountsContext = createContext<AdhkarCountsContextType | undefined>(undefined);

export const AdhkarCountsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [counts, setCounts] = useState<Record<string, number>>(() => {
    return safeJsonParse<Record<string, number>>(readFirstStored(STORAGE_KEYS.counts), {});
  });

  useEffect(() => {
    const handler = setTimeout(() => {
      safeLocalStorageSetItem('believer_adhkar_counts_v23', JSON.stringify(counts));
    }, 1000);
    return () => clearTimeout(handler);
  }, [counts]);

  useEffect(() => {
    const handleResetAll = () => setCounts({});
    const handleResetCat = (e: CustomEvent) => {
      const { category, items } = e.detail;
      if (!category || !items) return;
      setCounts(prev => {
        const updated = { ...prev };
        items.forEach((item: any) => delete updated[item.id]);
        return updated;
      });
    };
    
    window.addEventListener('believer_force_counts_reset', handleResetAll as EventListener);
    window.addEventListener('believer_reset_category_counts', handleResetCat as EventListener);
    
    return () => {
      window.removeEventListener('believer_force_counts_reset', handleResetAll as EventListener);
      window.removeEventListener('believer_reset_category_counts', handleResetCat as EventListener);
    };
  }, []);

  const updateCount = useCallback((dhikrId: string, newCount: number) => {
    setCounts(prev => {
      if (prev[dhikrId] === newCount) return prev;
      return { ...prev, [dhikrId]: newCount };
    });
  }, []);

  const resetCounts = useCallback((category?: string, items?: any[]) => {
    if (!category || !items) {
      setCounts({});
      return;
    }
    setCounts(prev => {
      const updated = { ...prev };
      items.forEach(item => delete updated[item.id]);
      return updated;
    });
  }, []);

  const isCategoryFinished = useCallback((categoryId: string, items: {id: string, count: number}[]) => {
    if (!items || items.length === 0) return false;
    return items.every(item => (counts[item.id] || 0) >= item.count);
  }, [counts]);

  const value = useMemo(() => ({ counts, updateCount, resetCounts, isCategoryFinished }), [counts, updateCount, resetCounts, isCategoryFinished]);

  return (
    <AdhkarCountsContext.Provider value={value}>
      {children}
    </AdhkarCountsContext.Provider>
  );
};

export const useAdhkarCounts = () => {
  const context = useContext(AdhkarCountsContext);
  if (!context) throw new Error('Must be used within AdhkarCountsProvider');
  return context;
};
