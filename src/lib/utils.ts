import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import moment from 'moment-hijri';

// Set locale to Arabic for moment
moment.locale('ar-SA');

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getLocaleCode(lang: string = 'ar'): string {
  switch (lang) {
    case 'tr': return 'tr-TR';
    case 'en': return 'en-US';
    case 'fr': return 'fr-FR';
    case 'de': return 'de-DE';
    case 'es': return 'es-ES';
    case 'id': return 'id-ID';
    case 'ms': return 'ms-MY';
    case 'ur': return 'ur-PK';
    case 'bn': return 'bn-BD';
    case 'ar':
    default: return 'ar-SA';
  }
}

const HIJRI_MONTHS_BY_LANG: Record<string, string[]> = {
  ar: ["محرم", "صفر", "ربيع الأول", "ربيع الآخر", "جمادى الأولى", "جمادى الآخرة", "رجب", "شعبان", "رمضان", "شوال", "ذو القعدة", "ذو الحجة"],
  tr: ["Muharrem", "Sefer", "Rebiülevvel", "Rebiülahir", "Cemaziyelevvel", "Cemaziyelahir", "Recep", "Şaban", "Ramazan", "Şevval", "Zilkade", "Zilhicce"],
  en: ["Muharram", "Safar", "Rabi' al-Awwal", "Rabi' al-Thani", "Jumada al-Awwal", "Jumada al-Thani", "Rajab", "Sha'ban", "Ramadan", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah"],
  fr: ["Mouharram", "Safar", "Rabi' al-Awwal", "Rabi' ath-Thani", "Joumada al-Oula", "Joumada ath-Thania", "Rajab", "Cha'bane", "Ramadan", "Chawwal", "Dhou al-Qi'da", "Dhou al-Hijja"],
  es: ["Muharram", "Safar", "Rabi' al-Awwal", "Rabi' al-Thani", "Yumada al-Awwal", "Yumada al-Thani", "Rajab", "Sha'ban", "Ramadán", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah"],
  de: ["Muharram", "Safar", "Rabi' al-Awwal", "Rabi' ath-Thani", "Dschumada al-Ula", "Dschumada ath-Thaniya", "Radschab", "Scharban", "Ramadan", "Schawwal", "Dhu al-Qada", "Dhu al-Hiddscha"],
  id: ["Muharram", "Safar", "Rabiul Awal", "Rabiul Akhir", "Jumadil Awal", "Jumadil Akhir", "Rajab", "Sya'ban", "Ramadhan", "Syawal", "Dzulqa'dah", "Dzulhijjah"],
  ms: ["Muharram", "Safar", "Rabiul Awal", "Rabiul Akhir", "Jumadil Awal", "Jumadil Akhir", "Rejab", "Sya'ban", "Ramadan", "Syawal", "Zulkaedah", "Zulhijjah"],
  ur: ["محرم", "صفر", "ربيع الأول", "ربيع الثاني", "جمادى الأولى", "جمادى الثانية", "رجب", "شعبان", "رمضان", "شوال", "ذوالقعدة", "ذوالحجة"],
  bn: ["মুহাররম", "সফর", "রবীউল আউয়াল", "রবীউস সানী", "জমাদিউল আউয়াল", "জমাদিউস সানী", "রজব", "শা'বান", "রমজান", "শাওয়াল", "জুলক্বাদা", "জুলহিজ্জা"]
};

const HIJRI_SUFFIX_BY_LANG: Record<string, string> = {
  ar: "هـ",
  ur: "ھ",
  tr: "H.",
  en: "AH",
  fr: "AH",
  es: "AH",
  de: "AH",
  id: "H",
  ms: "H",
  bn: "হিজরী"
};

export function getHijriDate(date: Date = new Date(), offset: number = 0, lang: string = 'ar') {
  const m = moment(date);
  if (offset !== 0) {
    m.add(offset, 'days');
  }
  
  const day = m.iDate();
  const monthNum = m.iMonth(); // 0-indexed
  const year = m.iYear();
  
  const months = HIJRI_MONTHS_BY_LANG[lang] || HIJRI_MONTHS_BY_LANG['ar'];
  const suffix = HIJRI_SUFFIX_BY_LANG[lang] || "AH";
  const monthName = months[monthNum] || months[0];
  
  if (lang === 'ar' || lang === 'ur') {
    return `${day} ${monthName}, ${year} ${suffix}`;
  }
  return `${day} ${monthName} ${year} ${suffix}`;
}

export function getGregorianDate(date: Date = new Date(), lang: string = 'ar') {
  const locale = getLocaleCode(lang);
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
}

export function getDayName(date: Date = new Date(), lang: string = 'ar') {
  const locale = getLocaleCode(lang);
  const formatted = new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(date);
  if (formatted && formatted.length > 0) {
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }
  return formatted;
}

export function getShortDayName(date: Date = new Date(), lang: string = 'ar') {
  if (lang === 'ar') {
    const arabicShort = ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];
    return arabicShort[date.getDay()];
  }
  const locale = getLocaleCode(lang);
  const formatted = new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(date);
  if (formatted && formatted.length > 0) {
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }
  return formatted;
}

const LEVEL_RANKS: Record<string, string[]> = {
  ar: ["مبتدئ", "مواظب", "ذاكر", "قانت", "عابد", "أواب", "محسن", "مقرب"],
  tr: ["Acemi", "Düzenli", "Zâkir", "Kânit", "Âbid", "Evvâb", "Muhsin", "Mukarreb"],
  en: ["Beginner", "Regular", "Devout", "Obedient", "Worshipper", "Penitent", "Virtuous", "Near One"],
  fr: ["Débutant", "Régulier", "Dévot", "Obéissant", "Adorateur", "Pénitent", "Bienfaisant", "Rapproché"],
  es: ["Principiante", "Constante", "Devoto", "Obediente", "Adorador", "Penitente", "Virtuoso", "Cercano"],
  de: ["Anfänger", "Beständig", "Andächtig", "Gehorsam", "Anbeter", "Reuevoll", "Tugendhaft", "Nahestehend"],
  id: ["Pemula", "Tekun", "Penghayat", "Taat", "Ahli Ibadah", "Awab", "Muhsin", "Muqarrab"],
  ms: ["Pemula", "Tekun", "Penghayat", "Taat", "Ahli Ibadah", "Awab", "Muhsin", "Muqarrab"],
  ur: ["مبتدی", "مواظب", "ذاکر", "قانت", "عابد", "اواب", "محسن", "مقرب"],
  bn: ["শিক্ষানবিস", "নিয়মিত", "জিকিরকারী", "অনুগত", "আবেদ", "তাওবাকারী", "মুহসিন", "মুকাররব"]
};

export function getLevelRank(level: number, lang: string = 'ar') {
  const ranks = LEVEL_RANKS[lang] || LEVEL_RANKS['ar'];
  if (level <= 5) return ranks[0];
  if (level <= 10) return ranks[1];
  if (level <= 20) return ranks[2];
  if (level <= 35) return ranks[3];
  if (level <= 50) return ranks[4];
  if (level <= 75) return ranks[5];
  if (level <= 100) return ranks[6];
  return ranks[7];
}

/**
 * recursively removes undefined values from an object
 * useful for preparing data for Firestore which doesn't support undefined
 */
export function sanitizeForFirestore(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeForFirestore);
  }

  const result: any = {};
  Object.keys(obj).forEach(key => {
    const value = obj[key];
    if (value !== undefined) {
      result[key] = sanitizeForFirestore(value);
    }
  });
  return result;
}

/**
 * Safely triggers a system/native web or mobile notification, handling Capacitor native app and web fallbacks.
 */
export function triggerSafeNotification(title: string, options?: NotificationOptions) {
  // If running inside Capacitor native mobile app, use LocalNotifications
  if (Capacitor.isPluginAvailable('LocalNotifications')) {
    try {
      LocalNotifications.schedule({
        notifications: [{
          id: Math.floor(Math.random() * 899) + 100,
          title,
          body: options?.body || '',
          schedule: { at: new Date(Date.now() + 100) },
          channelId: 'prayer_times_channel',
          sound: 'beep.wav'
        }]
      }).catch(err => {
        console.warn('LocalNotifications immediate trigger error:', err);
      });
      return;
    } catch (e) {
      console.warn('Failed to invoke Capacitor LocalNotifications:', e);
    }
  }

  if (!("Notification" in window) || Notification.permission !== "granted") {
    return;
  }
  
  try {
    // Attempt standard constructor (works on desktop and some platforms)
    new Notification(title, options);
  } catch (e) {
    console.warn("Failed to construct standard Notification. Falling back to ServiceWorker showNotification...", e);
    // Fallback for Chrome on Android / PWAs where new Notification() throws an Illegal constructor exception
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, options).catch(err => {
          console.error("Failed to show notification via serviceWorker inside promise:", err);
        });
      }).catch(err => {
        console.error("Service worker not ready for notification:", err);
      });
    }
  }
}

/**
 * Safely sanitizes string inputs to prevent XSS / malicious injection payloads.
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Checks if a string contains safe text and does not contain links, codes, script injections,
 * SQL keywords, HTML tags, weird unicode symbols, or incomprehensible character blocks.
 */
export function checkInputSafety(text: string): { isSafe: boolean; reasonAr?: string } {
  if (typeof text !== "string") {
    return { isSafe: false, reasonAr: "نوع البيانات غير صالح." };
  }
  const trimmed = text.trim();
  if (trimmed.length === 0) {
    return { isSafe: true };
  }

  // 1. Length constraint (prevent crash/overflow)
  if (trimmed.length > 1000) {
    return { isSafe: false, reasonAr: "النص طويل جداً (الحد الأقصى هو 1000 حرف لتجنب إبطاء التطبيق)." };
  }

  // 2. Prevent URLs / Links / Domain Names
  const urlPattern = /(https?:\/\/|www\d{0,3}\.[a-zA-Z0-9.\-]+\.[a-z]{2,4}|[a-zA-Z0-9.\-]+\.(com|net|org|co|info|xyz|me|club|online|app|dev|io|ly|edu|gov|sa|eg|tv|ru|cn|sa|eg|int|ly|tr|us))\b/i;
  const protocolPattern = /(javascript:|data:|ftp:|websocket:|ws:|wss:)/i;
  if (urlPattern.test(trimmed) || protocolPattern.test(trimmed)) {
    return {
      isSafe: false,
      reasonAr: "عذراً، يمنع إضافة روابط أو مواقع إلكترونية لحماية تطبيقك من الاختراقات أو محاولات التصيد والروابط الضارة.",
    };
  }

  // 3. Prevent Code injection / Scripting / Web Exploits:
  // Detects <script>, html tags, src/href attribute, event handlers (onload, onerror, onClick, eval)
  const scriptTagPattern = /<\s*script[^>]*>|[\s\S]*<\s*\/script\s*>/i;
  const htmlTagPattern = /<\s*\/?[a-zA-Z]+(\s+[^>]*)?>/i;
  const eventHandlerPattern = /\b(onmouseover|onload|onerror|onclick|onfocus|onloadstart|onreadystatechange|style|src|href|javascript)\b\s*=/i;
  const executablePattern = /\b(eval|exec|Function|setTimeout|setInterval)\s*\(/i;
  
  if (scriptTagPattern.test(trimmed) || eventHandlerPattern.test(trimmed) || executablePattern.test(trimmed)) {
    return {
      isSafe: false,
      reasonAr: "عذراً، النص يحتوي على كود برمجى أو أمر تنفيذي. يمنع البرمجيات لحماية التطبيق من الهجمات الخبيثة (XSS Injection).",
    };
  }
  
  // Also block pure html tag injections
  if (htmlTagPattern.test(trimmed) && !/^[0-9\s]+$/.test(trimmed)) {
    return {
      isSafe: false,
      reasonAr: "عذراً، النص يحتوي على وسوم أو رموز تنسيق HTML غير مسموح بها لحماية واجهة التطبيق.",
    };
  }

  // 4. SQL Injection patterns
  const sqlPattern = /\b(UNION\s+SELECT|SELECT\s+\*|DROP\s+TABLE|DELETE\s+FROM|UPDATE\s+\w+\s+SET|INSERT\s+INTO|OR\s+\d+\s*=\s*\d+)\b/i;
  if (sqlPattern.test(trimmed)) {
    return {
      isSafe: false,
      reasonAr: "عذراً، يمنع استخدام كلمات مفتاحية مخصصة لقواعد البيانات لحماية بيانات التطبيق.",
    };
  }

  // 5. Incomprehensible text, weird symbols, control characters, Glitchy / Zalgo text / Invisible characters
  // Control characters are characters from 0 to 31 except tab(\t), newline (\n) and carriage return (\r)
  const controlCharPattern = /[\x00-\x09\x0B\x0C\x0E-\x1F\x7F-\x9F]/;
  if (controlCharPattern.test(trimmed)) {
    return {
      isSafe: false,
      reasonAr: "عذراً، النص يحتوي على حروف تحكم غير مرئية أو رموز غامضة قد تتشابه مع محاولات التلاعب بالبيانات.",
    };
  }

  // Zalgo / Excessive combining mark sequence (often used for crash/glitch text)
  // Unicode combining class markers: [\u0300-\u036F]
  const combiningMarkRegex = /[\u0300-\u036F]{4,}/; // 4 or more repeating combining marks
  if (combiningMarkRegex.test(trimmed)) {
    return {
      isSafe: false,
      reasonAr: "تم رفض النص لأنه يحتوي على رموز دمج مفرطة تُستخدم في تشويه النصوص (Zalgo Text) والتي قد تسبب انهيار العرض.",
    };
  }

  // Large arrays of same identical punctuation symbols designed to break UI rendering or memory overflow (e.g. 50+ of ! or @ or # etc.)
  const repeatedSymbolRegex = /([^a-zA-Z0-9\s\u0600-\u06FF])\1{29,}/; // 30+ identical symbols
  if (repeatedSymbolRegex.test(trimmed)) {
    return {
      isSafe: false,
      reasonAr: "تم رفض النص بسبب وجود تكرار مفرط لرمز غير مفهوم قد يشوه مظهر واجهات التطبيق.",
    };
  }

  return { isSafe: true };
}

/**
 * Safely copies text to the clipboard using modern navigator.clipboard.writeText
 * with a reliable fallback to document.execCommand('copy') if permission is denied (e.g. in iframes).
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  // First, try the standard Clipboard API
  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      // In some environments (like Chrome iframes), writeText fails if the document isn't focused.
      // We try to focus the window first.
      window.focus();
      const isPatched = (navigator.clipboard.writeText as any).__isPatched;
      await navigator.clipboard.writeText(text);
      // If the writeText API is monkey-patched, it already triggers the show-toast event,
      // so we only trigger it manually if it is NOT patched to avoid duplicate toasts.
      if (!isPatched && typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('show-toast', { 
          detail: { message: 'تم نسخ النص بنجاح إلى الحافظة' } 
        }));
      }
      return true;
    } catch (err) {
      console.warn("navigator.clipboard.writeText failed, using fallback:", err);
    }
  }

  // Fallback method 1: traditional textarea and document.execCommand('copy')
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    
    // Prevent scrolling or zooming in on iOS
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    textArea.style.pointerEvents = "none";
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    // For iOS devices, a more thorough selection is sometimes needed
    if (navigator.userAgent.match(/ipad|ipod|iphone/i)) {
      const range = document.createRange();
      range.selectNodeContents(textArea);
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }
      textArea.setSelectionRange(0, 999999);
    }
    
    const successful = document.execCommand("copy");
    document.body.removeChild(textArea);
    
    if (successful) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('show-toast', { 
          detail: { message: 'تم نسخ النص بنجاح إلى الحافظة' } 
        }));
      }
      return true;
    }
  } catch (err) {
    console.warn("Fallback 1 copyTextToClipboard failed:", err);
  }

  // Fallback method 2: Prompt as a last resort if programmatic copy is blocked (common in some sandboxed iframes)
  try {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (!isMobile && typeof window !== 'undefined') {
       // Only prompt on desktop as it's easier to copy from prompt there
       const msg = "لم نتمكن من الوصول إلى الحافظة تلقائياً. يرجى نسخ النص أدناه يدوياً:";
       window.prompt(msg, text);
       return true;
    }

    // If all else fails, just show the toast and hope for the best (simulated success for UI feedback)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: 'تم نسخ النص بنجاح إلى الحافظة' } 
      }));
    }
    return true;
  } catch (err) {
    console.warn("All clipboard methods failed:", err);
    return false;
  }
}

import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

/**
 * Triggers a device-level haptic vibration feedback for physical/sensory immersion.
 * Uses standard web API or Capacitor Haptics if available.
 */
export function triggerHaptic(type: 'light' | 'medium' | 'heavy' | 'success' | 'double' = 'light') {
  // 1. Synchronously trigger Web Vibrate API for immediate tactile feedback on mobile web / PWAs
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      switch (type) {
        case 'light': navigator.vibrate(12); break;
        case 'medium': navigator.vibrate(25); break;
        case 'heavy': navigator.vibrate(50); break;
        case 'double': navigator.vibrate([15, 30, 15]); break;
        case 'success': navigator.vibrate([30, 50, 30]); break;
      }
    } catch (err) {
      // Ignore vibration error
    }
  }

  // 2. Also call Capacitor Haptics if available (for native Android/iOS wrappers)
  try {
    switch (type) {
      case 'light':
        Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
        break;
      case 'medium':
        Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {});
        break;
      case 'heavy':
        Haptics.impact({ style: ImpactStyle.Heavy }).catch(() => {});
        break;
      case 'double':
        Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {});
        setTimeout(() => Haptics.impact({ style: ImpactStyle.Light }).catch(() => {}), 100);
        break;
      case 'success':
        Haptics.notification({ type: NotificationType.Success }).catch(() => {});
        break;
    }
  } catch (e) {
    // Ignore native haptics error
  }
}




/**
 * Shares content natively using Capacitor Share (for iOS/Android apps)
 * or falls back to standard Web Share API.
 * If both fail or are not available, it copies the text to the clipboard.
 */
export async function shareContent(title: string, text: string, url?: string): Promise<void> {
  // Try Capacitor Share first
  try {
    const canShare = await Share.canShare();
    if (canShare.value) {
      await Share.share({
        title,
        text,
        url: url || window.location.href,
        dialogTitle: 'مشاركة عبر',
      });
      return;
    }
  } catch (err) {
    console.warn("Capacitor Share unavailable or failed:", err);
  }

  // Fallback to Web Share API
  if (navigator.share) {
    try {
      await navigator.share({
        title,
        text,
        url: url || window.location.href,
      });
      return;
    } catch (err: any) {
      const isCancellation =
        err?.name === "AbortError" ||
        err?.message?.toLowerCase().includes("cancel") ||
        err?.message?.toLowerCase().includes("abort");
      if (!isCancellation) {
        console.warn("Web Share API failed, falling back to clipboard:", err);
        await copyTextToClipboard(text);
      }
      return;
    }
  }

  // Final fallback
  await copyTextToClipboard(text);
}
