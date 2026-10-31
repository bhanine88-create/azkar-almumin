/**
 * Firebase (~570 KB of script: Auth + Firestore) loads once the first screen is
 * up, instead of with it. Every start used to parse it before anything showed,
 * though only a signed-in user's sync needs it, and never in the first second.
 *
 * Code on the start-up path reaches Firebase through these helpers only; a
 * static `import ... from '../firebase'` there would pull it back in.
 */
type FirebaseModule = typeof import('../firebase');

let loading: Promise<FirebaseModule> | null = null;

/** Loads Firebase now (once; later calls share the same load). */
export function loadFirebase(): Promise<FirebaseModule> {
  if (!loading) {
    loading = import('../firebase').catch((err) => {
      loading = null; // a failed chunk fetch may succeed on the next call
      throw err;
    });
  }
  return loading;
}

/** Loads Firebase when the app is idle, and after `maxDelayMs` at the latest. */
export function loadFirebaseWhenIdle(maxDelayMs = 2500): Promise<FirebaseModule> {
  if (loading) return loading;
  return new Promise((resolve, reject) => {
    const start = () => loadFirebase().then(resolve, reject);
    const idle = (window as Window & { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number }).requestIdleCallback;
    if (idle) idle(start, { timeout: maxDelayMs });
    else setTimeout(start, Math.min(maxDelayMs, 1200));
  });
}

/** The signed-in user right now, or null while Firebase has not loaded yet. */
export async function currentFirebaseUser() {
  if (!loading) return null;
  try {
    return (await loading).auth.currentUser;
  } catch {
    return null;
  }
}
