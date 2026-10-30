import { Capacitor, PluginListenerHandle, registerPlugin } from '@capacitor/core';
import type { LocalNotificationSchema } from '@capacitor/local-notifications';

/**
 * Morning / evening adhkar reminders as a floating card over other apps
 * (android/.../ReminderCardPopup.java), next to the notification posted at the
 * same minute. The card needs "Display over other apps", the same permission
 * the random dhikr card uses (RandomDhikrOverlayCard).
 */
interface ReminderCardItem {
  at: number;
  title: string;
  body: string;
  route: string;
  kind: 'morning' | 'evening';
}

interface ReminderCardPlugin {
  schedule(options: { items: ReminderCardItem[] }): Promise<{ count: number; next: number }>;
  addListener(event: 'openRoute', listener: (data: { route: string }) => void): Promise<PluginListenerHandle>;
}

export const ReminderCard = registerPlugin<ReminderCardPlugin>('ReminderCard');

const available = () => Capacitor.getPlatform() === 'android';

/** Hands the adhkar reminders of a notification plan to the native card. */
export async function scheduleReminderCards(plan: LocalNotificationSchema[]): Promise<void> {
  if (!available()) return;
  const items: ReminderCardItem[] = plan
    .filter(n => n.extra?.type === 'adhkar' && n.schedule?.at)
    .map(n => {
      const route = String(n.extra?.route || '/adhkar/morning');
      return {
        at: new Date(n.schedule!.at as Date).getTime(),
        title: n.title || '',
        body: n.body || '',
        route,
        kind: route.includes('evening') ? 'evening' : 'morning',
      };
    });
  try {
    await ReminderCard.schedule({ items });
  } catch (err) {
    console.warn('[ReminderCard] schedule failed:', err);
  }
}

/** Calls back with the page a card's "Read now" asked for. */
export function onReminderCardRoute(open: (route: string) => void): () => void {
  if (!available()) return () => {};
  const handle = ReminderCard.addListener('openRoute', ({ route }) => open(route));
  return () => { handle.then(h => h.remove()).catch(() => {}); };
}
