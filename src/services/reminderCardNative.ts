import { Capacitor, PluginListenerHandle, registerPlugin } from '@capacitor/core';
import type { LocalNotificationSchema } from '@capacitor/local-notifications';

/**
 * Morning / evening adhkar reminders as a floating card over other apps
 * (android/.../ReminderCardPopup.java). The native side owns the reminder: it
 * shows the card when it can, and otherwise posts the notification itself, so
 * there is always exactly one alert. The card needs "Display over other apps",
 * the same permission the random dhikr card uses (RandomDhikrOverlayCard).
 */
interface ReminderCardItem {
  at: number;
  /** Id for the notification posted when the card cannot show. */
  notificationId: number;
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

/** On Android the card schedules the adhkar reminder, notification included. */
export const reminderCardsOwnAdhkar = available;

/** Hands the adhkar reminders of a notification plan to the native card. */
export async function scheduleReminderCards(plan: LocalNotificationSchema[]): Promise<void> {
  if (!available()) return;
  const items: ReminderCardItem[] = plan
    .filter(n => n.extra?.type === 'adhkar' && n.schedule?.at)
    .map(n => {
      const route = String(n.extra?.route || '/adhkar/morning');
      return {
        at: new Date(n.schedule!.at as Date).getTime(),
        notificationId: n.id,
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

/**
 * Only adhkar pages: the route arrives as an intent extra, and any installed app
 * can start MainActivity with one.
 */
const CARD_ROUTE = /^\/adhkar\/[a-z0-9_-]+$/i;

/** Calls back with the page a card's "Read now" asked for. */
export function onReminderCardRoute(open: (route: string) => void): () => void {
  if (!available()) return () => {};
  const handle = ReminderCard.addListener('openRoute', ({ route }) => {
    if (typeof route === 'string' && CARD_ROUTE.test(route)) open(route);
  });
  return () => { handle.then(h => h.remove()).catch(() => {}); };
}
