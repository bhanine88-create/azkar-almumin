import { useState, useCallback, useEffect } from 'react';
import { CHALLENGES, UserChallengeProgress, ChallengeCategory, ChallengeType,  } from '../challengesData';
import { useAppContext } from '../AppContext';
import { evaluateAllBadges, VISUAL_BADGES, getBadgeStatus, VisualBadge } from '../services/badgeService';
import { safeLocalStorageGetItem, safeLocalStorageSetItem,  } from "../utils/storage";

export const useChallengeTracker = () => {
  const { progress: userProgress, addPoints: addLevelPoints } = useAppContext();
  const [progress, setProgressState] = useState<Record<string, UserChallengeProgress>>(() => {
    const saved = safeLocalStorageGetItem('believer_challenges_progress_v2');
    return saved ? JSON.parse(saved) : {};
  });

  const [earnedBadges, setEarnedBadges] = useState<string[]>(() => {
    const saved = safeLocalStorageGetItem('believer_earned_badges_v2');
    return saved ? JSON.parse(saved) : [];
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
      const savedProgress = safeLocalStorageGetItem('believer_challenges_progress_v2');
      let currentProgress: Record<string, UserChallengeProgress> = savedProgress ? JSON.parse(savedProgress) : {};
      
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
        safeLocalStorageSetItem('believer_challenges_progress_v2', JSON.stringify(currentProgress));
        setProgressState(currentProgress);
        
        if (newlyCompletedPoints > 0) {
          addLevelPoints(newlyCompletedPoints);
        }
        
        // Check for badges
        const savedBadges = safeLocalStorageGetItem('believer_earned_badges_v2');
        let badges: string[] = savedBadges ? JSON.parse(savedBadges) : [];
        
        syncBadges(currentProgress, badges);

        window.dispatchEvent(new CustomEvent('challenge-updated'));
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
    const handleUpdate = () => {
      const saved = safeLocalStorageGetItem('believer_challenges_progress_v2');
      if (saved) setProgressState(JSON.parse(saved));
      
      const savedBadges = safeLocalStorageGetItem('believer_earned_badges_v2');
      if (savedBadges) setEarnedBadges(JSON.parse(savedBadges));
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
