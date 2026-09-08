import { db } from '../firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  increment,
  onSnapshot,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firestoreError';

export interface QuranSurahProgress {
  surahNumber: number;
  readAyahs: number[];
  isCompleted: boolean;
  lastUpdated: any;
}

export interface TasbeehGoal {
  id?: string;
  dhikrId: string;
  titleAr: string;
  titleEn?: string;
  targetCount: number;
  currentCount: number;
  isCompleted: boolean;
  createdAt: any;
  lastUpdated: any;
}

export const progressService = {
  // Quran Progress
  async saveQuranProgress(userId: string, surahNumber: number, readAyahs: number[], isCompleted: boolean) {
    const path = `users/${userId}/quranProgress/${surahNumber}`;
    const docRef = doc(db, 'users', userId, 'quranProgress', surahNumber.toString());
    try {
      await setDoc(docRef, {
        surahNumber,
        readAyahs,
        isCompleted,
        lastUpdated: serverTimestamp()
      }, { merge: true });
    } catch (error: any) {
      if (error && (error.code === 'unavailable' || String(error).includes('offline') || String(error).includes('network'))) return;
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async getSurahProgress(userId: string, surahNumber: number) {
    const path = `users/${userId}/quranProgress/${surahNumber}`;
    const docRef = doc(db, 'users', userId, 'quranProgress', surahNumber.toString());
    try {
      const snap = await getDoc(docRef);
      return snap.exists() ? snap.data() as QuranSurahProgress : null;
    } catch (error: any) {
      if (error && (error.code === 'unavailable' || String(error).includes('offline') || String(error).includes('network'))) return null;
      handleFirestoreError(error, OperationType.GET, path);
    }
  },

  onAllQuranProgress(userId: string, callback: (data: QuranSurahProgress[]) => void) {
    const path = `users/${userId}/quranProgress`;
    const colRef = collection(db, 'users', userId, 'quranProgress');
    return onSnapshot(colRef, (snap) => {
      const docs = snap.docs.map(doc => doc.data() as QuranSurahProgress);
      callback(docs);
    }, (error: any) => {
      if (error && (error.code === 'unavailable' || String(error).includes('offline') || String(error).includes('network'))) return;
      handleFirestoreError(error, OperationType.LIST, path);
    });
  },

  // Tasbeeh Goals
  async addTasbeehGoal(userId: string, goal: Omit<TasbeehGoal, 'createdAt' | 'lastUpdated'>) {
    const docId = goal.id || Math.random().toString(36).substr(2, 9);
    const path = `users/${userId}/tasbeehGoals/${docId}`;
    const docRef = doc(db, 'users', userId, 'tasbeehGoals', docId);
    try {
      await setDoc(docRef, {
        ...goal,
        id: docId,
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp()
      });
      return docId;
    } catch (error: any) {
      if (error && (error.code === 'unavailable' || String(error).includes('offline') || String(error).includes('network'))) return docId;
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async updateTasbeehGoalCount(userId: string, goalId: string, incrementBy: number) {
    const path = `users/${userId}/tasbeehGoals/${goalId}`;
    const docRef = doc(db, 'users', userId, 'tasbeehGoals', goalId);
    try {
      const snap = await getDoc(docRef);
      if (!snap.exists()) return;
      
      const data = snap.data();
      const newCount = (data.currentCount || 0) + incrementBy;
      const isCompleted = newCount >= data.targetCount;
      
      await updateDoc(docRef, {
        currentCount: incrementBy === 0 ? 0 : increment(incrementBy),
        isCompleted,
        lastUpdated: serverTimestamp()
      });
    } catch (error: any) {
      if (error && (error.code === 'unavailable' || String(error).includes('offline') || String(error).includes('network'))) return;
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  onTasbeehGoals(userId: string, callback: (data: TasbeehGoal[]) => void) {
    const path = `users/${userId}/tasbeehGoals`;
    const colRef = collection(db, 'users', userId, 'tasbeehGoals');
    return onSnapshot(colRef, (snap) => {
      const docs = snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as TasbeehGoal));
      callback(docs);
    }, (error: any) => {
      if (error && (error.code === 'unavailable' || String(error).includes('offline') || String(error).includes('network'))) return;
      handleFirestoreError(error, OperationType.LIST, path);
    });
  },

  async deleteTasbeehGoal(userId: string, goalId: string) {
    const path = `users/${userId}/tasbeehGoals/${goalId}`;
    const docRef = doc(db, 'users', userId, 'tasbeehGoals', goalId);
    try {
      await deleteDoc(docRef);
    } catch (error: any) {
      if (error && (error.code === 'unavailable' || String(error).includes('offline') || String(error).includes('network'))) return;
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  async resetTasbeehGoal(userId: string, goalId: string) {
    const path = `users/${userId}/tasbeehGoals/${goalId}`;
    const docRef = doc(db, 'users', userId, 'tasbeehGoals', goalId);
    try {
      await updateDoc(docRef, {
        currentCount: 0,
        isCompleted: false,
        lastUpdated: serverTimestamp()
      });
    } catch (error: any) {
      if (error && (error.code === 'unavailable' || String(error).includes('offline') || String(error).includes('network'))) return;
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }
};
