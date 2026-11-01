import { safeLocalStorageGetItem, safeLocalStorageSetItem } from '../utils/storage';

/**
 * Where the prayer location came from: detected from the network ('ip'), the
 * phone's GPS ('gps') or chosen by hand ('manual'). Unset means it was never
 * found, and the screen falls back to Makkah.
 *
 * It used to be one detection attempt on the first visit to the prayer page,
 * marked as done before it had succeeded. Opening the app offline, or a slow
 * network on that one visit, left the city on Makkah for good, and both the
 * prayer screen and every adhan notification ran on Makkah's coordinates.
 * Until a location is found, every app start now tries again.
 */
export const LOCATION_SOURCE_KEY = 'prayer_location_source';
export const PRAYER_LOCATION_EVENT = 'prayer-location-changed';

export type LocationSource = 'ip' | 'gps' | 'manual';

export interface DetectedLocation {
  city: string;
  country: string;
  lat: string;
  lng: string;
  timezone?: string;
}

export function getLocationSource(): LocationSource | null {
  const source = safeLocalStorageGetItem(LOCATION_SOURCE_KEY);
  if (source === 'ip' || source === 'gps' || source === 'manual') return source;
  // Before the source was recorded: a city other than the Makkah fallback was
  // found or chosen by the user, so keep it.
  const city = (safeLocalStorageGetItem('prayer_city') || '').trim().toLowerCase();
  if (city && !['makkah', 'mecca', 'مكة', 'مكة المكرمة'].includes(city) && safeLocalStorageGetItem('prayer_lat')) {
    return safeLocalStorageGetItem('prayer_use_gps') === 'true' ? 'gps' : 'manual';
  }
  return null;
}

export function saveLocation(location: DetectedLocation, source: LocationSource): void {
  safeLocalStorageSetItem('prayer_city', location.city);
  safeLocalStorageSetItem('prayer_country', location.country);
  safeLocalStorageSetItem('prayer_lat', location.lat);
  safeLocalStorageSetItem('prayer_lng', location.lng);
  safeLocalStorageSetItem('prayer_use_gps', source === 'gps' ? 'true' : 'false');
  if (location.timezone) safeLocalStorageSetItem('prayer_timezone', location.timezone);
  safeLocalStorageSetItem(LOCATION_SOURCE_KEY, source);
  safeLocalStorageSetItem('prayer_initialized', 'true');
  window.dispatchEvent(new CustomEvent(PRAYER_LOCATION_EVENT, { detail: { ...location, source } }));
}

async function getJson(url: string, timeoutMs = 8000): Promise<any> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal, credentials: 'omit' });
    if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

const num = (v: unknown) => (v === undefined || v === null || v === '' || isNaN(Number(v)) ? '' : String(v));

/** Several free services, each allowing requests from the app; the first good answer wins. */
const IP_PROVIDERS: (() => Promise<DetectedLocation>)[] = [
  async () => {
    const d = await getJson('https://get.geojs.io/v1/ip/geo.json');
    return { city: d.city, country: d.country, lat: num(d.latitude), lng: num(d.longitude), timezone: d.timezone };
  },
  async () => {
    const d = await getJson('https://ipwho.is/');
    if (d.success === false) throw new Error('ipwho.is refused');
    return { city: d.city, country: d.country, lat: num(d.latitude), lng: num(d.longitude), timezone: d.timezone?.id };
  },
  async () => {
    const d = await getJson('https://ipinfo.io/json');
    const [lat, lng] = String(d.loc || '').split(',');
    return { city: d.city, country: d.country, lat: num(lat), lng: num(lng), timezone: d.timezone };
  },
  async () => {
    const d = await getJson('https://ipapi.co/json/');
    return { city: d.city, country: d.country_name, lat: num(d.latitude), lng: num(d.longitude), timezone: d.timezone };
  },
  async () => {
    const d = await getJson('https://freeipapi.com/api/json');
    return { city: d.cityName, country: d.countryName, lat: num(d.latitude), lng: num(d.longitude), timezone: d.timeZone };
  },
];

/** The app language saved in settings (the city is named in it), Arabic by default. */
function appLanguage(): string {
  try {
    return JSON.parse(safeLocalStorageGetItem('believer_settings_v31') || '{}').appLanguage || 'ar';
  } catch {
    return 'ar';
  }
}

/** City and country in the app's language for these coordinates, when the map service answers. */
async function arabicNames(location: DetectedLocation): Promise<DetectedLocation> {
  try {
    const d = await getJson(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.lat}&lon=${location.lng}&zoom=11&accept-language=${appLanguage()},en`,
      6000
    );
    const a = d.address || {};
    return {
      ...location,
      city: a.city || a.town || a.village || a.suburb || a.city_district || location.city,
      country: a.country || location.country,
    };
  } catch {
    return location;
  }
}

/** The location of this network's IP address, or null if every service failed. */
export async function detectLocationByIp(): Promise<DetectedLocation | null> {
  for (const provider of IP_PROVIDERS) {
    try {
      const found = await provider();
      if (found.city && found.lat && found.lng) return arabicNames(found);
    } catch (err) {
      console.warn('[prayerLocation] provider failed:', err);
    }
  }
  return null;
}

let inFlight: Promise<boolean> | null = null;

/**
 * Detects and saves the location when none has been found yet. Resolves true
 * when a new location was saved. Safe to call often: it does nothing once a
 * location exists, and concurrent calls share one attempt.
 */
export function resolvePrayerLocationIfNeeded(): Promise<boolean> {
  if (getLocationSource()) return Promise.resolve(false);
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return Promise.resolve(false);
  if (!inFlight) {
    inFlight = detectLocationByIp()
      .then((found) => {
        if (!found) return false;
        saveLocation(found, 'ip');
        return true;
      })
      .finally(() => { inFlight = null; });
  }
  return inFlight;
}
