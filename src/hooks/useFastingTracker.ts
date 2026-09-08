import { useState, useEffect, useCallback } from 'react';
import { safeLocalStorageGetItem, safeLocalStorageSetItem } from '../utils/storage';

export type FastingType = 
  | 'monday' 
  | 'thursday' 
  | 'white_day' 
  | 'ashura' 
  | 'arafah' 
  | 'shawal' 
  | 'ramadan' 
  | 'qadaa' 
  | 'kaffarah' 
  | 'nadr' 
  | 'voluntary'
  | 'custom';

export interface FastingRecord {
  date: string; // YYYY-MM-DD
  type: FastingType;
  notes?: string;
  completed: boolean;
}

const STORAGE_KEY = 'athkar_believer_fasting_tracker';
const QADAA_GOAL_KEY = 'athkar_believer_qadaa_goal';
const MONTHLY_GOAL_KEY = 'athkar_believer_monthly_fasting_goal';

export const useFastingTracker = () => {
  const [fastingRecords, setFastingRecords] = useState<Record<string, FastingRecord>>({});
  const [qadaaGoal, setQadaaGoal] = useState<number>(0);
  const [monthlyGoal, setMonthlyGoal] = useState<number>(4);

  // Load from local storage
  useEffect(() => {
    try {
      const stored = safeLocalStorageGetItem(STORAGE_KEY);
      if (stored) {
        setFastingRecords(JSON.parse(stored));
      }
      const storedQadaa = safeLocalStorageGetItem(QADAA_GOAL_KEY);
      if (storedQadaa) {
        setQadaaGoal(Number(storedQadaa) || 0);
      }
      const storedMonthly = safeLocalStorageGetItem(MONTHLY_GOAL_KEY);
      if (storedMonthly) {
        setMonthlyGoal(Number(storedMonthly) || 4);
      }
    } catch (error) {
      console.error('Error loading fasting records', error);
    }
  }, []);

  const updateQadaaGoal = useCallback((count: number) => {
    const valid = Math.max(0, count);
    setQadaaGoal(valid);
    safeLocalStorageSetItem(QADAA_GOAL_KEY, valid.toString());
  }, []);

  const updateMonthlyGoal = useCallback((count: number) => {
    const valid = Math.max(1, count);
    setMonthlyGoal(valid);
    safeLocalStorageSetItem(MONTHLY_GOAL_KEY, valid.toString());
  }, []);

  // Save to local storage
  const saveRecords = (newRecords: Record<string, FastingRecord>) => {
    setFastingRecords(newRecords);
    safeLocalStorageSetItem(STORAGE_KEY, JSON.stringify(newRecords));
  };

  const addFastingDay = useCallback((date: string, type: FastingType, completed: boolean = true, notes?: string) => {
    setFastingRecords(prev => {
      const newRecords = {
        ...prev,
        [date]: { date, type, completed, notes }
      };
      safeLocalStorageSetItem(STORAGE_KEY, JSON.stringify(newRecords));
      return newRecords;
    });
  }, []);

  const removeFastingDay = useCallback((date: string) => {
    setFastingRecords(prev => {
      const newRecords = { ...prev };
      delete newRecords[date];
      safeLocalStorageSetItem(STORAGE_KEY, JSON.stringify(newRecords));
      return newRecords;
    });
  }, []);

  const toggleFastingDay = useCallback((date: string, type: FastingType = 'custom') => {
    setFastingRecords(prev => {
      const newRecords = { ...prev };
      if (newRecords[date]) {
        delete newRecords[date];
      } else {
        newRecords[date] = { date, type, completed: true };
      }
      safeLocalStorageSetItem(STORAGE_KEY, JSON.stringify(newRecords));
      return newRecords;
    });
  }, []);

  const setFastingDetails = useCallback((date: string, type: FastingType, notes?: string) => {
    setFastingRecords(prev => {
      const newRecords = {
        ...prev,
        [date]: { date, type, completed: true, notes }
      };
      safeLocalStorageSetItem(STORAGE_KEY, JSON.stringify(newRecords));
      return newRecords;
    });
  }, []);

  const getFastingCount = useCallback((month?: number, year?: number) => {
    return Object.values(fastingRecords).filter(record => {
      if (!record.completed) return false;
      if (month !== undefined && year !== undefined) {
        const d = new Date(record.date);
        return d.getMonth() === month && d.getFullYear() === year;
      }
      return true;
    }).length;
  }, [fastingRecords]);

  const getQadaaCount = useCallback(() => {
    return Object.values(fastingRecords).filter(record => record.completed && record.type === 'qadaa').length;
  }, [fastingRecords]);

  return {
    fastingRecords,
    qadaaGoal,
    monthlyGoal,
    updateQadaaGoal,
    updateMonthlyGoal,
    addFastingDay,
    removeFastingDay,
    toggleFastingDay,
    setFastingDetails,
    getFastingCount,
    getQadaaCount
  };
};
