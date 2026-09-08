import { getAnalytics, isSupported } from 'firebase/analytics';
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, getFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

let db: any;
try {
  // 1. Try initializing with both local cache and long polling
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
    experimentalForceLongPolling: true
  }, (firebaseConfig as any).firestoreDatabaseId);
} catch (e: any) {
  console.warn("Firestore initialization with persistent local cache failed/warned. Trying fallback...", e);
  // If the error is because it's already initialized, get the existing instance
  if (e.code === 'failed-precondition' || String(e).includes('already exist') || String(e).includes('already initialized')) {
    try {
      db = getFirestore(app);
    } catch (errGet) {
      db = getFirestore();
    }
  } else {
    // 2. Try initializing with long polling but without persistent cache (e.g. iframe issues)
    try {
      db = initializeFirestore(app, {
        experimentalForceLongPolling: true
      }, (firebaseConfig as any).firestoreDatabaseId);
    } catch (e2: any) {
      console.warn("Firestore basic initializeFirestore failed. Getting existing or default instance.", e2);
      try {
        db = getFirestore(app);
      } catch (e3) {
        db = getFirestore();
      }
    }
  }
}

export { db };
export const auth = getAuth(app);


let analytics: any = null;
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});
export { analytics };