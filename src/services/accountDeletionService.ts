import { auth, db } from '../firebase';
import { deleteUser, GoogleAuthProvider, reauthenticateWithPopup } from 'firebase/auth';
import { collection, getDocsFromServer, deleteDoc, doc } from 'firebase/firestore';
import { safeLocalStorageRemoveItem } from '../utils/storage';

export interface DeleteAccountResult {
  success: boolean;
  requiresReauth?: boolean;
  error?: string;
  errorCode?: 'cloud' | 'reauth' | 'generic';
}

export const deleteAccountAndAllData = async (): Promise<DeleteAccountResult> => {
  const user = auth.currentUser;

  try {
    // 1. If signed in, delete all user data from Firestore first
    if (user) {
      const uid = user.uid;

      // The cloud data must be gone before the account is: deleting the
      // account first would leave the data in Firestore with no owner able to
      // reach or delete it. The list comes from the server, not the offline
      // cache, so no document is missed and an offline attempt stops here.
      try {
        const subCollections = ['backups', 'quranProgress', 'tasbeehGoals'];
        for (const colName of subCollections) {
          const snap = await getDocsFromServer(collection(db, 'users', uid, colName));
          await Promise.all(snap.docs.map(d => deleteDoc(d.ref)));
        }
        await deleteDoc(doc(db, 'users', uid));
      } catch (e) {
        console.warn('Could not delete the cloud data; the account is kept:', e);
        return {
          success: false,
          errorCode: 'cloud'
        };
      }

      // 2. Delete the Firebase Authentication account
      try {
        await deleteUser(user);
      } catch (authError: any) {
        if (authError.code === 'auth/requires-recent-login') {
          // Attempt popup re-authentication for Google provider
          try {
            const provider = new GoogleAuthProvider();
            await reauthenticateWithPopup(user, provider);
            await deleteUser(user);
          } catch (reauthErr: any) {
            return {
              success: false,
              requiresReauth: true,
              errorCode: 'reauth'
            };
          }
        } else {
          throw authError;
        }
      }
    }

    // 3. Clear all local storage data associated with the app
    clearAllLocalBelieverData();

    return { success: true };
  } catch (err: any) {
    console.error('Failed to completely delete account & data:', err);
    return {
      success: false,
      error: err.message,
      errorCode: 'generic'
    };
  }
};

/**
 * Completely wipe local storage keys for believer app
 */
export const clearAllLocalBelieverData = () => {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.startsWith('believer_') ||
        key.startsWith('athkar_') ||
        key.startsWith('tasbih_') ||
        key.startsWith('quran_') ||
        key.startsWith('fasting_') ||
        key.startsWith('prayer_')
      )) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(k => safeLocalStorageRemoveItem(k));

    // Clear legacy explicit keys if any
    safeLocalStorageRemoveItem('believer_adhkar_counts_v23');
    safeLocalStorageRemoveItem('believer_adhkar_counts_v22');
    safeLocalStorageRemoveItem('believer_adhkar_counts_v21');
    safeLocalStorageRemoveItem('believer_adhkar_counts_v20');
    safeLocalStorageRemoveItem('believer_adhkar_counts_v6');
    safeLocalStorageRemoveItem('believer_adhkar_counts_v5');
    safeLocalStorageRemoveItem('believer_last_cloud_backup');
    safeLocalStorageRemoveItem('believer_backup_v23_1');
    safeLocalStorageRemoveItem('believer_backup_v23_2');
    safeLocalStorageRemoveItem('believer_backup_v22_1');
    safeLocalStorageRemoveItem('believer_backup_v22_2');
    safeLocalStorageRemoveItem('believer_backup_v20_1');
    safeLocalStorageRemoveItem('believer_backup_v20_2');
    safeLocalStorageRemoveItem('believer_names_favorites');
    safeLocalStorageRemoveItem('believer_fasting_records');
  } catch (e) {
    console.error('Error clearing local storage:', e);
  }
};
