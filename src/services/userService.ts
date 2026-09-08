import { db, auth } from '../firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firestoreError';
import { sanitizeForFirestore } from '../lib/utils';
import { UserProgress, AppSettings } from '../types';

export interface UserProfileCloud {
  uid: string;
  email: string;
  displayName: string;
  progress: UserProgress;
  settings: AppSettings;
  updatedAt: any;
}

export const userService = {
  /**
   * Saves or merges the user's progress and settings in Firestore.
   */
  saveUserProfile: async (
    uid: string,
    email: string,
    displayName: string,
    progress: UserProgress,
    settings: AppSettings
  ): Promise<void> => {
    const userDocRef = doc(db, 'users', uid);
    try {
      const sanitizedProgress = sanitizeForFirestore(progress);
      const sanitizedSettings = sanitizeForFirestore(settings);

      const profileData = {
        uid,
        email,
        displayName: displayName || email.split('@')[0],
        progress: sanitizedProgress,
        settings: sanitizedSettings,
        updatedAt: serverTimestamp(),
      };

      await setDoc(userDocRef, profileData, { merge: true });
    } catch (error) {
      console.error('Failed to save user profile to cloud:', error);
      handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
    }
  },

  /**
   * Retrieves the user's cloud profile from Firestore.
   */
  getUserProfile: async (uid: string): Promise<UserProfileCloud | null> => {
    const userDocRef = doc(db, 'users', uid);
    try {
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        return docSnap.data() as UserProfileCloud;
      }
      return null;
    } catch (error) {
      console.error('Failed to get user profile from cloud:', error);
      handleFirestoreError(error, OperationType.GET, `users/${uid}`);
      return null;
    }
  }
};
