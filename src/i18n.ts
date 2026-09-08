import i18n from 'i18next';
import { useEffect, useCallback } from 'react';
import { initReactI18next, useTranslation as useI18NextTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from './i18n/languages';

import ar from './i18n/locales/ar.json';
import en from './i18n/locales/en.json';
import fr from './i18n/locales/fr.json';
import ur from './i18n/locales/ur.json';
import id from './i18n/locales/id.json';
import tr from './i18n/locales/tr.json';
import bn from './i18n/locales/bn.json';
import ms from './i18n/locales/ms.json';
import de from './i18n/locales/de.json';
import es from './i18n/locales/es.json';

export const translations = {
  ar,
  en,
  fr,
  ur,
  id,
  tr,
  bn,
  ms,
  de,
  es,
};

export const resources = {
  ar: { translation: ar },
  en: { translation: en },
  fr: { translation: fr },
  ur: { translation: ur },
  id: { translation: id },
  tr: { translation: tr },
  bn: { translation: bn },
  ms: { translation: ms },
  de: { translation: de },
  es: { translation: es },
};

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

export type LanguageCode = keyof typeof translations;
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
