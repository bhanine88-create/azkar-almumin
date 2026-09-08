import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup, User } from 'firebase/auth';

// Calendar service caching & auth flow states
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export interface CalendarEventPayload {
  summary: string;
  description: string;
  startTime: string; // ISO or HH:mm
  endTime: string;   // ISO or HH:mm
  isRecurring?: boolean;
  recurrenceRule?: string; // e.g. RRULE:FREQ=DAILY
  colorId?: string; // 1-11 for event colors in Google Calendar
}

export const calendarService = {
  /**
   * Check if we are currently authenticated with an active Google Calendar token
   */
  isAuthenticated(): boolean {
    return !!cachedAccessToken && !!auth.currentUser;
  },

  /**
   * Get the current cached access token
   */
  getAccessToken(): string | null {
    return cachedAccessToken;
  },

  /**
   * Clears the cached token (e.g. on logout)
   */
  clearToken() {
    cachedAccessToken = null;
  },

  /**
   * Sign in with Google and request Google Calendar write scopes
   */
  async signIn(): Promise<{ user: User; accessToken: string }> {
    if (isSigningIn) {
      throw new Error('عملية تسجيل الدخول جارية بالفعل.');
    }

    try {
      isSigningIn = true;
      const provider = new GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/calendar.events');
      
      // Request incremental authorization to avoid prompts if already granted
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      
      if (!credential?.accessToken) {
        throw new Error('فشل في الحصول على رمز الوصول من حساب Google.');
      }

      cachedAccessToken = credential.accessToken;
      return { user: result.user, accessToken: cachedAccessToken };
    } catch (error: any) {
      console.error('Google Sign In Error for Calendar:', error);
      throw error;
    } finally {
      isSigningIn = false;
    }
  },

  /**
   * Helper to perform a Google Calendar API request with automatic auth headers
   */
  async apiRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const token = cachedAccessToken;
    if (!token) {
      throw new Error('غير مصرح. يرجى ربط حساب Google وتقويمك أولاً.');
    }

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    const url = endpoint.startsWith('http') 
      ? endpoint 
      : `https://www.googleapis.com/calendar/v3/${endpoint}`;

    const response = await fetch(url, { ...options, headers });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Google Calendar API error response:', errorData);
      const msg = errorData?.error?.message || response.statusText;
      throw new Error(`خطأ في تقويم Google: ${msg}`);
    }

    if (response.status === 204) {
      return { success: true };
    }

    return response.json();
  },

  /**
   * Retrieve events from primary calendar, optionally filtering by query (e.g. [أذكار المؤمن])
   */
  async listEvents(q?: string): Promise<any[]> {
    try {
      let endpoint = 'calendars/primary/events?maxResults=250';
      if (q) {
        endpoint += `&q=${encodeURIComponent(q)}`;
      }
      const data = await this.apiRequest(endpoint, { method: 'GET' });
      return data.items || [];
    } catch (err) {
      console.error('Failed to list calendar events:', err);
      return [];
    }
  },

  /**
   * Add a single event to the user's primary calendar
   */
  async addEvent(event: CalendarEventPayload): Promise<any> {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Riyadh';
    
    // Format start and end times properly
    let startObj: any = {};
    let endObj: any = {};

    if (event.startTime.includes('T')) {
      // Direct ISO string
      startObj = { dateTime: event.startTime, timeZone };
      endObj = { dateTime: event.endTime, timeZone };
    } else {
      // Just HH:mm format, use today's date for starting base
      const todayStr = new Date().toISOString().split('T')[0];
      startObj = { dateTime: `${todayStr}T${event.startTime}:00`, timeZone };
      endObj = { dateTime: `${todayStr}T${event.endTime}:00`, timeZone };
    }

    const body: any = {
      summary: event.summary,
      description: event.description,
      start: startObj,
      end: endObj,
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 10 }
        ]
      }
    };

    if (event.isRecurring) {
      body.recurrence = [event.recurrenceRule || 'RRULE:FREQ=DAILY'];
    }

    if (event.colorId) {
      body.colorId = event.colorId;
    }

    return this.apiRequest('calendars/primary/events', {
      method: 'POST',
      body: JSON.stringify(body)
    });
  },

  /**
   * Delete a calendar event by its ID
   */
  async deleteEvent(eventId: string): Promise<void> {
    await this.apiRequest(`calendars/primary/events/${eventId}`, {
      method: 'DELETE'
    });
  },

  /**
   * Removes all events previously synchronized by 'أذكار المؤمن' by checking descriptions
   */
  async clearSyncedEvents(): Promise<number> {
    const events = await this.listEvents('[أذكار المؤمن]');
    let count = 0;
    for (const event of events) {
      if (event.id) {
        try {
          await this.deleteEvent(event.id);
          count++;
        } catch (e) {
          console.error(`Failed to delete event ${event.id}:`, e);
        }
      }
    }
    return count;
  }
};
