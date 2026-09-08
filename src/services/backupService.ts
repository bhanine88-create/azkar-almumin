import { db, auth } from '../firebase';
import { doc, getDoc, setDoc, collection, query, where, getDocs, orderBy, limit, addDoc, serverTimestamp } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firestoreError';
import { sanitizeForFirestore } from '../lib/utils';

export interface AppBackupData {
  version: string;
  timestamp: string;
  progress: any;
  settings: any;
  counts: any;
  userId: string;
}

export const backupService = {
  // 1. إنشاء نسخة احتياطية كاملة وتعديلها في المتصفح (للتحميل اليدوي)
  generateLocalBackup: (data: any): string => {
    const backup: AppBackupData = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      progress: data.progress,
      settings: data.settings,
      counts: data.counts,
      userId: auth.currentUser?.uid || 'guest'
    };
    return JSON.stringify(backup, null, 2);
  },

  // 2. رفع نسخة احتياطية للسحابة (Firestore)
  createCloudBackup: async (data: any) => {
    if (!auth.currentUser) throw new Error('يجب تسجيل الدخول أولاً');
    
    const userId = auth.currentUser.uid;
    const backupPath = `users/${userId}/backups`;
    const backupRef = collection(db, backupPath);
    
    try {
      const sanitizedData = sanitizeForFirestore({
        progress: data.progress,
        settings: data.settings,
        counts: data.counts
      });

      await addDoc(backupRef, {
        data: sanitizedData,
        createdAt: serverTimestamp(),
        type: 'manual'
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, backupPath);
    }
  },

  // 3. الحصول على قائمة النسخ الاحتياطية المتوفرة
  getCloudBackups: async () => {
    if (!auth.currentUser) return [];
    
    const userId = auth.currentUser.uid;
    const backupPath = `users/${userId}/backups`;
    const backupRef = collection(db, backupPath);
    const q = query(backupRef, orderBy('createdAt', 'desc'), limit(10));
    
    try {
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, backupPath);
    }
  },

  // 4. استعادة البيانات من ملف خارجي
  restoreFromJSON: (jsonString: string) => {
    try {
      const data = JSON.parse(jsonString) as AppBackupData;
      // التحقق من صحة الملف هنا
      if (!data.progress || !data.settings) throw new Error('ملف غير صالح');
      return data;
    } catch (err) {
      console.error('فشل في استعادة البيانات:', err);
      throw err;
    }
  }
};
