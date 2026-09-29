import { useState, useCallback, useEffect, useRef } from 'react';
import { CHALLENGES, UserChallengeProgress, ChallengeCategory, ChallengeType } from '../challengesData';
import { useAppContext } from '../AppContext';
import { evaluateAllBadges, VISUAL_BADGES, getBadgeStatus, VisualBadge } from '../services/badgeService';
import { safeLocalStorageGetItem, safeLocalStorageSetItem } from "../utils/storage";

// In-memory module-level caches to avoid synchronous disk thrashing on rapid taps
let memoryProgressCache: Record<string, UserChallengeProgress> | null = null;
let saveDebounceTimer: any = null;

export const useChallengeTracker = () => {
  const instanceId = useRef(Math.random().toString(36).substring(7));
  const { progress: userProgress, addPoints: addLevelPoints } = useAppContext();

  const [progress, setProgressState] = useState<Record<string, UserChallengeProgress>>(() => {
    if (memoryProgressCache) return memoryProgressCache;
    try {
      const saved = safeLocalStorageGetItem('believer_challenges_progress_v2');
      memoryProgressCache = saved ? JSON.parse(saved) : {};
      return memoryProgressCache || {};
    } catch {
      return {};
    }
  });

  const [earnedBadges, setEarnedBadges] = useState<string[]>(() => {
    try {
      const saved = safeLocalStorageGetItem('believer_earned_badges_v2');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const getPoints = useCallback(() => {
    return Object.values(progress).reduce((acc, curr) => {
      if (curr.completed) {
        const challenge = CHALLENGES.find(c => c.id === curr.challengeId);
        return acc + (challenge?.points || 0);
      }
      return acc;
    }, 0);
  }, [progress]);

  // Evaluate badges whenever user progress or challenge progress updates
  const syncBadges = useCallback((currentProgress: Record<string, UserChallengeProgress>, existingBadges: string[]) => {
    if (!userProgress) return existingBadges;
    const { newlyUnlocked, updatedEarnedIds } = evaluateAllBadges(userProgress, currentProgress, existingBadges);
    
    if (newlyUnlocked.length > 0) {
      safeLocalStorageSetItem('believer_earned_badges_v2', JSON.stringify(updatedEarnedIds));
      setEarnedBadges(updatedEarnedIds);
      
      // Dispatch celebration event for the latest newly unlocked badge
      newlyUnlocked.forEach(badge => {
        window.dispatchEvent(new CustomEvent('new-badge-unlocked', { detail: { badge } }));
      });
    }
    return updatedEarnedIds;
  }, [userProgress]);

  const updateProgress = useCallback((challengeIds: string[], amount: number = 1) => {
    try {
      let currentProgress: Record<string, UserChallengeProgress> = memoryProgressCache 
        ? { ...memoryProgressCache }
        : (() => {
            const saved = safeLocalStorageGetItem('believer_challenges_progress_v2');
            return saved ? JSON.parse(saved) : {};
          })();
      
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      
      // Get current week identifier (Year-WeekNumber)
      const getWeekId = (d: Date) => {
        const date = new Date(d.getTime());
        date.setHours(0, 0, 0, 0);
        date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
        const week1 = new Date(date.getFullYear(), 0, 4);
        return `${date.getFullYear()}-W${1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7)}`;
      };
      
      const currentWeek = getWeekId(now);
      let changed = false;
      let newlyCompletedPoints = 0;
      
      challengeIds.forEach(id => {
        const challenge = CHALLENGES.find(c => c.id === id);
        if (!challenge) return;

        let p = currentProgress[challenge.id] || {
          challengeId: challenge.id,
          currentCount: 0,
          completed: false,
          lastUpdated: new Date(0).toISOString(),
          streakCount: 0,
          history: []
        };
        
        const lastUpdateDate = p.lastUpdated.split('T')[0];
        const lastUpdateWeek = getWeekId(new Date(p.lastUpdated));
        
        // Handle Resets
        if (challenge.type === ChallengeType.DAILY && lastUpdateDate !== today) {
          p.currentCount = 0;
          p.completed = false;
        } else if (challenge.type === ChallengeType.WEEKLY && lastUpdateWeek !== currentWeek) {
          p.currentCount = 0;
          p.completed = false;
        }
        
        if (!p.completed) {
          p.currentCount += amount;
          p.lastUpdated = now.toISOString();
          
          if (p.currentCount >= challenge.targetCount) {
            p.completed = true;
            p.streakCount += 1;
            newlyCompletedPoints += challenge.points;
            if (!p.history.includes(today)) {
              p.history.push(today);
            }
          }
          
          currentProgress[challenge.id] = p;
          changed = true;
        }
      });
      
      if (changed) {
        memoryProgressCache = currentProgress;
        setProgressState(currentProgress);
        
        if (newlyCompletedPoints > 0) {
          addLevelPoints(newlyCompletedPoints);
        }
        
        // Debounce writing to localStorage to prevent UI stutter during intensive clicking
        if (saveDebounceTimer) clearTimeout(saveDebounceTimer);
        saveDebounceTimer = setTimeout(() => {
          if (memoryProgressCache) {
            safeLocalStorageSetItem('believer_challenges_progress_v2', JSON.stringify(memoryProgressCache));
          }
        }, 500);

        // Check for badges
        const savedBadges = safeLocalStorageGetItem('believer_earned_badges_v2');
        let badges: string[] = savedBadges ? JSON.parse(savedBadges) : [];
        syncBadges(currentProgress, badges);

        // Dispatch update with sourceId so current instance skips redundant parsing
        window.dispatchEvent(new CustomEvent('challenge-updated', { detail: { sourceId: instanceId.current } }));
      }
    } catch (error) {
      console.error('Failed to update challenge progress:', error);
    }
  }, [addLevelPoints, syncBadges]);

  const updateChallengeProgress = useCallback((categoryId: ChallengeCategory, amount: number = 1) => {
    const activeChallenges = CHALLENGES.filter(c => c.category === categoryId).map(c => c.id);
    updateProgress(activeChallenges, amount);
  }, [updateProgress]);

  const updateSpecificChallenge = useCallback((challengeId: string, amount: number = 1) => {
    updateProgress([challengeId], amount);
  }, [updateProgress]);

  // Synchronize on mount and when userProgress changes
  useEffect(() => {
    const savedBadges = safeLocalStorageGetItem('believer_earned_badges_v2');
    const badges: string[] = savedBadges ? JSON.parse(savedBadges) : [];
    syncBadges(progress, badges);
  }, [userProgress, syncBadges, progress]);

  useEffect(() => {
    const handleUpdate = (e: any) => {
      // Ignore self-dispatched events to avoid redundant parse/render cycles
      if (e?.detail?.sourceId === instanceId.current) return;
      try {
        const saved = safeLocalStorageGetItem('believer_challenges_progress_v2');
        if (saved) {
          const parsed = JSON.parse(saved);
          memoryProgressCache = parsed;
          setProgressState(parsed);
        }
        
        const savedBadges = safeLocalStorageGetItem('believer_earned_badges_v2');
        if (savedBadges) setEarnedBadges(JSON.parse(savedBadges));
      } catch (err) {
        // ignore
      }
    };

    window.addEventListener('challenge-updated', handleUpdate);
    return () => window.removeEventListener('challenge-updated', handleUpdate);
  }, []);

  return { 
    progress, 
    updateChallengeProgress, 
    updateSpecificChallenge,
    earnedBadges, 
    points: getPoints(),
    visualBadges: VISUAL_BADGES,
    getBadgeStatus: (badge: VisualBadge) => getBadgeStatus(badge, userProgress, progress, earnedBadges)
  };
};
