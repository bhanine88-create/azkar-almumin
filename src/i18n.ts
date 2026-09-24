import i18n from 'i18next';
import { useEffect, useCallback } from 'react';
import { initReactI18next, useTranslation as useI18NextTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from './i18n/languages';

/*
  Arabic is the only locale bundled with the app.

  The other nine used to be static imports here, which put all ten — about
  948 KB of JSON, of which 840 KB can never be used by any one person — into the
  entry chunk, to be downloaded and parsed on the main thread at every single
  launch before anything could be drawn. That was close to half the entry chunk
  and a straight tax on how fast the app feels to open.

  Arabic stays static because it is the app's own language and the fallback for
  every missing key: it has to be present the moment the first screen renders,
  and it is the locale nearly every user will actually read. The rest are
  fetched the first time someone selects them, then cached by i18next for the
  life of the session.
*/
import ar from './i18n/locales/ar.json';

/**
 * A locale file: a flat map of key to translated string.
 *
 * Deliberately NOT `typeof ar`. The translations are not all complete — fr, for
 * one, is three keys short of Arabic — and claiming otherwise would only push
 * the gap out to a runtime `undefined`. `t` already falls back to Arabic for a
 * missing key, so an incomplete locale is a supported state, not an error.
 */
type LocaleBundle = Record<string, string>;

/** Locales that are code-split. Vite turns each of these into its own chunk. */
const LAZY_LOCALES: Record<string, () => Promise<{ default: LocaleBundle }>> = {
  en: () => import('./i18n/locales/en.json'),
  fr: () => import('./i18n/locales/fr.json'),
  ur: () => import('./i18n/locales/ur.json'),
  id: () => import('./i18n/locales/id.json'),
  tr: () => import('./i18n/locales/tr.json'),
  bn: () => import('./i18n/locales/bn.json'),
  ms: () => import('./i18n/locales/ms.json'),
  de: () => import('./i18n/locales/de.json'),
  es: () => import('./i18n/locales/es.json'),
};

/**
 * Dictionaries loaded so far, always including Arabic.
 *
 * `useTranslation`'s `t` reads this directly before consulting i18next, so it
 * has to grow as locales arrive — not just i18next's own store.
 */
export const translations: Record<string, LocaleBundle> = { ar };

export const resources: Record<string, { translation: LocaleBundle }> = {
  ar: { translation: ar },
};

/** In-flight loads, so ten components asking at once cause one fetch. */
const localeLoads = new Map<string, Promise<void>>();

/**
 * Makes a locale available to i18next, fetching it if this is the first ask.
 *
 * Always resolves — a locale that cannot be fetched leaves the app on its
 * Arabic fallback, which is a degraded translation rather than a broken screen.
 * Call this before `i18n.changeLanguage`, or use `changeAppLanguage` below.
 */
export function loadLanguage(lng: string): Promise<void> {
  if (!lng || lng === 'ar' || translations[lng]) return Promise.resolve();

  const load = LAZY_LOCALES[lng];
  if (!load) return Promise.resolve();

  let pending = localeLoads.get(lng);
  if (!pending) {
    pending = load()
      .then((mod) => {
        translations[lng] = mod.default;
        resources[lng] = { translation: mod.default };
        i18n.addResourceBundle(lng, 'translation', mod.default, true, true);
      })
      .catch((err) => {
        console.warn(`[i18n] Could not load the "${lng}" locale; staying on Arabic.`, err);
        localeLoads.delete(lng);
      });
    localeLoads.set(lng, pending);
  }
  return pending;
}

/** Loads the locale, then switches to it. The only safe way to change language. */
export async function changeAppLanguage(lng: string): Promise<void> {
  await loadLanguage(lng);
  await i18n.changeLanguage(lng);
}

export const RTL_LANGUAGES = SUPPORTED_LANGUAGES.filter(l => l.dir === 'rtl').map(l => l.id);

/**
 * Returns 'rtl' or 'ltr' based on the specified language code.
 */
export function getLanguageDirection(lang: string): 'rtl' | 'ltr' {
  const matched = SUPPORTED_LANGUAGES.find(l => l.id === lang);
  if (matched) return matched.dir;
  return (RTL_LANGUAGES as string[]).includes(lang) ? 'rtl' : 'ltr';
}

/**
 * Automatically updates HTML document direction (RTL / LTR) & lang attribute
 */
export function updateDocumentDirection(lang: string) {
  if (typeof document !== 'undefined') {
    const dir = getLanguageDirection(lang);
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  }
}

// Initialize i18next instance
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'ar',
    fallbackLng: 'ar',
    interpolation: {
      escapeValue: false, // React handles XSS escaping
    },
    react: {
      useSuspense: false,
    },
  });

// Handle languageChanged event to automatically switch document direction (RTL/LTR)
i18n.on('languageChanged', (lng) => {
  updateDocumentDirection(lng);
});

// Spelled out rather than derived from `translations`, which is now a growing
// runtime map and would widen this to `string`.
export type LanguageCode = 'ar' | 'en' | 'fr' | 'ur' | 'id' | 'tr' | 'bn' | 'ms' | 'de' | 'es';
export type TranslationKey = keyof typeof ar;

/**
 * App-wide useTranslation hook bridging i18next with existing AppSettings state.
 * Uses current active i18next language or optional appLanguage override.
 */
export function useTranslation(appLanguage?: string) {
  const { t: i18nT, i18n: i18nInstance } = useI18NextTranslation();
  const currentLang = (appLanguage && appLanguage.trim()) || i18nInstance.language || 'ar';
  const isRtl = getLanguageDirection(currentLang) === 'rtl';

  const t = useCallback((
    key: TranslationKey | string,
    fallbackOrDefault?: string | Record<string, string | number>,
    params?: Record<string, string | number>
  ): string => {
    const defaultValue = typeof fallbackOrDefault === 'string' ? fallbackOrDefault : undefined;
    const actualParams = typeof fallbackOrDefault === 'object' ? fallbackOrDefault : params;

    // 1. Direct lookup in active language dictionary first for immediate and 100% accurate localization
    const directTranslation = (translations as any)[currentLang]?.[key];
    if (directTranslation !== undefined && directTranslation !== null && directTranslation !== '') {
      let res = String(directTranslation);
      if (actualParams) {
        Object.entries(actualParams).forEach(([k, v]) => {
          res = res.replace(new RegExp(`{{${k}}}`, 'g'), String(v));
        });
      }
      return res;
    }

    // 2. Query i18next instance explicitly with active language
    let text = i18nT(key as string, { ...(actualParams || {}), lng: currentLang });
    if (text && text !== key) {
      return text;
    }

    // 3. Fallback to Arabic dictionary
    const arTranslation = (translations as any)['ar']?.[key];
    if (arTranslation !== undefined && arTranslation !== null && arTranslation !== '') {
      let res = String(arTranslation);
      if (actualParams) {
        Object.entries(actualParams).forEach(([k, v]) => {
          res = res.replace(new RegExp(`{{${k}}}`, 'g'), String(v));
        });
      }
      return res;
    }

    // 4. Default value or key as final fallback
    let res = defaultValue || key;
    if (actualParams && typeof res === 'string') {
      Object.entries(actualParams).forEach(([k, v]) => {
        res = res.replace(new RegExp(`{{${k}}}`, 'g'), String(v));
      });
    }
    return res;
  }, [currentLang, i18nT]);

  return { t, lang: currentLang, currentLang, isRtl, i18n: i18nInstance };
}

export default i18n;
