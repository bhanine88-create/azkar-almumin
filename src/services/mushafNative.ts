import { Capacitor, PluginListenerHandle, registerPlugin } from '@capacitor/core';
import { JUZ_START_PAGES, SURAH_NAMES, SURAH_START_PAGES } from '../utils/quranUtils';

/**
 * The native mushaf reader on Android (android/.../MushafActivity.java):
 * King Fahd Complex pages with right-to-left swiping or vertical scrolling,
 * pinch and double-tap zoom, an index, bookmarks, night mode and a
 * whole-mushaf download. The web page reader stays in use everywhere else.
 */
export interface MushafState {
  /** Last page read in the native reader, 0 before the first use. */
  lastPage: number;
  bookmarks: number[];
  downloadedPages: number;
  totalPages: number;
}

interface MushafPlugin {
  open(options: {
    page?: number;
    surahNames: string[];
    surahStartPages: number[];
    juzStartPages: number[];
    labels: Record<string, string>;
    arabicDigits: boolean;
    rtl: boolean;
  }): Promise<void>;
  getState(): Promise<MushafState>;
  addListener(event: 'closed', listener: (data: { lastPage: number }) => void): Promise<PluginListenerHandle>;
}

export const Mushaf = registerPlugin<MushafPlugin>('Mushaf');

export const isNativeMushafAvailable = () => Capacitor.getPlatform() === 'android';

type Translate = (key: string, fallback: string) => string;

/** Reader texts: [translation key, Arabic fallback]. */
const LABELS: Record<string, [string, string]> = {
  back: ['mushaf_back', 'رجوع'],
  bookmark: ['mushaf_bookmark', 'علامة'],
  vertical: ['mushaf_vertical', 'عرض رأسي'],
  horizontal: ['mushaf_horizontal', 'عرض أفقي'],
  night: ['mushaf_night', 'الوضع الليلي'],
  index: ['mushaf_index', 'الفهرس'],
  juz: ['mushaf_juz', 'الجزء'],
  page: ['mushaf_page', 'صفحة'],
  of: ['mushaf_of', 'من'],
  surahs: ['mushaf_surahs', 'السور'],
  parts: ['mushaf_parts', 'الأجزاء'],
  bookmarks: ['mushaf_bookmarks', 'العلامات'],
  pageHint: ['mushaf_page_hint', 'رقم الصفحة'],
  goTo: ['mushaf_go_to', 'انتقال'],
  noBookmarks: ['mushaf_no_bookmarks', 'لا توجد علامات بعد'],
  bookmarkAdded: ['mushaf_bookmark_added', 'أُضيفت علامة على هذه الصفحة'],
  bookmarkRemoved: ['mushaf_bookmark_removed', 'أُزيلت العلامة'],
  downloadAll: ['mushaf_download_all', 'تحميل المصحف كاملاً للقراءة بدون إنترنت'],
  downloading: ['mushaf_downloading', 'جاري التحميل'],
  downloaded: ['mushaf_downloaded', 'المصحف محمّل كاملاً ويعمل بدون إنترنت'],
  downloadFailed: ['mushaf_download_failed', 'تعذّر تحميل بعض الصفحات. اضغط لإعادة المحاولة'],
  loadFailed: ['mushaf_load_failed', 'تعذّر تحميل الصفحة. تحقّق من الاتصال ثم اضغط لإعادة المحاولة'],
};

/** Opens the reader at `page`, or where the user last stopped when omitted. */
export async function openNativeMushaf(page: number | undefined, t: Translate, language: string, rtl: boolean): Promise<void> {
  const labels: Record<string, string> = {};
  for (const [name, [key, fallback]] of Object.entries(LABELS)) labels[name] = t(key, fallback);
  await Mushaf.open({
    page,
    surahNames: SURAH_NAMES,
    surahStartPages: SURAH_START_PAGES,
    juzStartPages: JUZ_START_PAGES,
    labels,
    arabicDigits: language === 'ar',
    rtl,
  });
}

export async function getNativeMushafState(): Promise<MushafState | null> {
  if (!isNativeMushafAvailable()) return null;
  try {
    return await Mushaf.getState();
  } catch {
    return null;
  }
}
