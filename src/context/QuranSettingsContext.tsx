import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { safeLocalStorageGetItem, safeLocalStorageSetItem,  } from "../utils/storage";

export type Theme = 'light' | 'dark' | 'sepia' | 'parchment' | 'sand' | 'slate' | 'creamyNight';
export type ReadingMode = 'vertical' | 'horizontal';
export type ViewMode = 'mushaf' | 'vertical';
export type TafsirType = 'ar.muyassar' | 'ar.jalalayn' | 'ar.waseet' | 'ar.qurtubi' | 'ar.baghawi' | 'ar.miqbas' | 'en.sahih' | 'fr.hamidullah' | 'tr.ates' | 'ur.ahmedali' | 'id.indonesian';
export type TafsirTheme = 'default' | 'sepia' | 'slate';
export type Recitation = 'uthmani' | 'warsh';

export interface QuranBookmark {
  id: string;
  surah: number;
  page: number;
  juz: number;
  hizb: number;
  surahName: string;
  type: 'general' | 'wird' | 'memorization' | 'reflection' | 'important';
  dateAdded: string;
  note?: string;
}

interface QuranSettingsContextType {
  fontSize: number;
  setFontSize: (size: number) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  readingMode: ReadingMode;
  setReadingMode: (mode: ReadingMode) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  showTafsir: boolean;
  setShowTafsir: (show: boolean) => void;
  tafsirType: TafsirType;
  setTafsirType: (type: TafsirType) => void;
  tafsirTheme: TafsirTheme;
  setTafsirTheme: (theme: TafsirTheme) => void;
  tafsirFontSize: number;
  setTafsirFontSize: (size: number) => void;
  tafsirFontFamily: string;
  setTafsirFontFamily: (font: string) => void;
  fontFamily: string;
  setFontFamily: (font: string) => void;
  recitation: Recitation;
  setRecitation: (recitation: Recitation) => void;
  reciter: number;
  setReciter: (reciter: number) => void;
  autoPlay: boolean;
  setAutoPlay: (auto: boolean) => void;
  secondaryTafsirType: TafsirType;
  setSecondaryTafsirType: (type: TafsirType) => void;
  mushafZoom: number;
  setMushafZoom: (zoom: number) => void;
  mushafEdition: 'hafs' | 'warsh' | 'tajweed';
  setMushafEdition: (edition: 'hafs' | 'warsh' | 'tajweed') => void;
  mushafDisplayMode: 'auto' | 'single' | 'double';
  setMushafDisplayMode: (mode: 'auto' | 'single' | 'double') => void;
  bookmark: { surah: number; page: number; juz: number; hizb: number; surahName: string } | null;
  setBookmark: (bookmark: { surah: number; page: number; juz: number; hizb: number; surahName: string } | null) => void;
  bookmarks: QuranBookmark[];
  setBookmarks: (bookmarks: QuranBookmark[]) => void;
  keepScreenAwake: boolean;
  setKeepScreenAwake: (awake: boolean) => void;
  ayahRepeatCount: number;
  setAyahRepeatCount: (count: number) => void;
  rangeRepeatCount: number;
  setRangeRepeatCount: (count: number) => void;
  playbackRate: number;
  setPlaybackRate: (rate: number) => void;
  autoNextSurah: boolean;
  setAutoNextSurah: (auto: boolean) => void;
  ayahInterval: number;
  setAyahInterval: (interval: number) => void;
  focusMode: boolean;
  setFocusMode: (focus: boolean) => void;
  isStoragePersistent: boolean;
  requestStoragePersistence: () => Promise<boolean>;
}

const QuranSettingsContext = createContext<QuranSettingsContextType | undefined>(undefined);

export const QuranSettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isStoragePersistent, setIsStoragePersistent] = useState(false);

  const requestStoragePersistence = async (): Promise<boolean> => {
    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) {
      try {
        const persisted = await navigator.storage.persist();
        setIsStoragePersistent(persisted);
        return persisted;
      } catch (e) {
        console.warn('Failed to request storage persistence:', e);
        return false;
      }
    }
    return false;
  };

  React.useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.storage) {
      if (navigator.storage.persisted) {
        navigator.storage.persisted().then((persisted) => {
          setIsStoragePersistent(persisted);
          if (!persisted && navigator.storage.persist) {
            navigator.storage.persist().then((p) => {
              setIsStoragePersistent(p);
            }).catch(() => {});
          }
        }).catch(() => {});
      } else if (navigator.storage.persist) {
        navigator.storage.persist().then((p) => {
          setIsStoragePersistent(p);
        }).catch(() => {});
      }
    }
  }, []);
  const [fontSize, setFontSize] = useState(() => {
    try {
      return Number(safeLocalStorageGetItem('quran-fontSize')) || 24;
    } catch (e) {
      return 24;
    }
  });
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      return (safeLocalStorageGetItem('quran-theme') as Theme) || 'light';
    } catch (e) {
      return 'light';
    }
  });
  const [readingMode, setReadingMode] = useState<ReadingMode>(() => {
    try {
      return (safeLocalStorageGetItem('quran-readingMode') as ReadingMode) || 'vertical';
    } catch (e) {
      return 'vertical';
    }
  });
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    try {
      return (safeLocalStorageGetItem('quran-viewMode') as ViewMode) || 'mushaf';
    } catch (e) {
      return 'mushaf';
    }
  });
  const [focusMode, setFocusMode] = useState<boolean>(() => {
    try {
      return safeLocalStorageGetItem('quran-focusMode') === 'true';
    } catch (e) {
      return false;
    }
  });
  const [showTafsir, setShowTafsir] = useState(false);
  const [tafsirType, setTafsirType] = useState<TafsirType>(() => {
    try {
      const saved = safeLocalStorageGetItem('quran-tafsirType') as TafsirType;
      const validTypes = ['ar.muyassar', 'ar.jalalayn', 'ar.waseet', 'ar.qurtubi', 'ar.baghawi', 'ar.miqbas', 'en.sahih', 'fr.hamidullah', 'tr.ates', 'ur.ahmedali', 'id.indonesian'];
      if (saved && validTypes.includes(saved)) return saved;
      return 'ar.muyassar';
    } catch (e) {
      return 'ar.muyassar';
    }
  });
  const [tafsirTheme, setTafsirTheme] = useState<TafsirTheme>(() => {
    try {
      const saved = safeLocalStorageGetItem('quran-tafsirTheme') as TafsirTheme;
      const validThemes = ['default', 'sepia', 'slate'];
      if (saved && validThemes.includes(saved)) return saved;
      return 'default';
    } catch (e) {
      return 'default';
    }
  });
  const [tafsirFontSize, setTafsirFontSize] = useState(() => {
    try {
      return Number(safeLocalStorageGetItem('quran-tafsirFontSize')) || 18;
    } catch (e) {
      return 18;
    }
  });
  const [tafsirFontFamily, setTafsirFontFamily] = useState(() => {
    try {
      return safeLocalStorageGetItem('quran-tafsirFontFamily') || 'Tajawal';
    } catch (e) {
      return 'Tajawal';
    }
  });
  const [fontFamily, setFontFamily] = useState(() => {
    try {
      return safeLocalStorageGetItem('quran-fontFamily') || 'Uthmanic Hafs';
    } catch (e) {
      return 'Uthmanic Hafs';
    }
  });

  useEffect(() => {
    if (fontFamily) {
      document.documentElement.style.setProperty('--quran-font', `"${fontFamily}"`);
    }
  }, [fontFamily]);
  const [recitation, setRecitation] = useState<Recitation>(() => {
    try {
      const saved = safeLocalStorageGetItem('quran-recitation');
      if (saved === 'uthmani') return 'uthmani';
    } catch (e) {}
    return 'uthmani';
  });
  const [reciter, setReciter] = useState(() => {
    try {
      return Number(safeLocalStorageGetItem('quran-reciter')) || 7;
    } catch (e) {
      return 7;
    }
  });
  const [autoPlay, setAutoPlay] = useState(() => {
    try {
      return safeLocalStorageGetItem('quran-autoPlay') === 'true';
    } catch (e) {
      return false;
    }
  });
  const [secondaryTafsirType, setSecondaryTafsirType] = useState<TafsirType>(() => {
    try {
      const saved = safeLocalStorageGetItem('quran-secondaryTafsirType') as TafsirType;
      const validTypes = ['ar.muyassar', 'ar.jalalayn', 'ar.waseet', 'ar.qurtubi', 'ar.baghawi', 'ar.miqbas', 'en.sahih', 'fr.hamidullah', 'tr.ates', 'ur.ahmedali', 'id.indonesian'];
      if (saved && validTypes.includes(saved)) return saved;
      return 'ar.jalalayn';
    } catch (e) {
      return 'ar.jalalayn';
    }
  });
  const [mushafZoom, setMushafZoom] = useState(() => {
    try {
      return Number(safeLocalStorageGetItem('quran-mushafZoom')) || 100;
    } catch (e) {
      return 100;
    }
  });
  const [mushafEdition, setMushafEdition] = useState<'hafs' | 'warsh' | 'tajweed'>(() => {
    try {
      const saved = safeLocalStorageGetItem('quran-mushafEdition');
      const validEditions = ['hafs', 'tajweed'];
      if (saved && validEditions.includes(saved)) return saved as any;
      return 'hafs';
    } catch (e) {
      return 'hafs';
    }
  });
  const [mushafDisplayMode, setMushafDisplayMode] = useState<'auto' | 'single' | 'double'>(() => {
    try {
      const saved = safeLocalStorageGetItem('quran-mushafDisplayMode');
      const valid = ['auto', 'single', 'double'];
      if (saved && valid.includes(saved)) return saved as any;
      return 'auto';
    } catch (e) {
      return 'auto';
    }
  });
  const [bookmark, setBookmark] = useState<{ surah: number; page: number; juz: number; hizb: number; surahName: string } | null>(() => {
    try {
      const saved = safeLocalStorageGetItem('quran-bookmark');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [bookmarks, setBookmarks] = useState<QuranBookmark[]>(() => {
    try {
      const saved = safeLocalStorageGetItem('quran-bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [keepScreenAwake, setKeepScreenAwake] = useState(() => {
    try {
      return safeLocalStorageGetItem('quran-keepScreenAwake') !== 'false'; // default true
    } catch (e) {
      return true;
    }
  });
  const [ayahRepeatCount, setAyahRepeatCount] = useState(() => {
    try {
      return Number(safeLocalStorageGetItem('quran-ayahRepeatCount')) || 1;
    } catch (e) {
      return 1;
    }
  });
  const [rangeRepeatCount, setRangeRepeatCount] = useState(() => {
    try {
      return Number(safeLocalStorageGetItem('quran-rangeRepeatCount')) || 1;
    } catch (e) {
      return 1;
    }
  });
  const [playbackRate, setPlaybackRate] = useState(() => {
    try {
      return Number(safeLocalStorageGetItem('quran-playbackRate')) || 1.0;
    } catch (e) {
      return 1.0;
    }
  });
  const [autoNextSurah, setAutoNextSurah] = useState(() => {
    try {
      return safeLocalStorageGetItem('quran-autoNextSurah') !== 'false'; // default true
    } catch (e) {
      return true;
    }
  });
  const [ayahInterval, setAyahInterval] = useState(() => {
    try {
      return Number(safeLocalStorageGetItem('quran-ayahInterval')) || 0;
    } catch (e) {
      return 0;
    }
  });

  const updateSetting = <T,>(key: string, value: T, setter: (val: T) => void) => {
    setter(value);
    try {
      if (typeof value === 'object') {
        safeLocalStorageSetItem(`quran-${key}`, JSON.stringify(value));
      } else {
        safeLocalStorageSetItem(`quran-${key}`, String(value));
      }
    } catch (e) {
      console.warn(`Failed to save setting ${key}:`, e);
    }
  };

  const contextValue = React.useMemo(() => ({
      fontSize, setFontSize: (v: number) => updateSetting('fontSize', v, setFontSize), 
      theme, setTheme: (v: Theme) => updateSetting('theme', v, setTheme), 
      readingMode, setReadingMode: (v: ReadingMode) => updateSetting('readingMode', v, setReadingMode), 
      viewMode, setViewMode: (v: ViewMode) => updateSetting('viewMode', v, setViewMode),
      focusMode, setFocusMode: (v: boolean) => updateSetting('focusMode', v, setFocusMode),
      showTafsir, setShowTafsir,
      tafsirType, setTafsirType: (v: TafsirType) => updateSetting('tafsirType', v, setTafsirType),
      tafsirTheme, setTafsirTheme: (v: TafsirTheme) => updateSetting('tafsirTheme', v, setTafsirTheme),
      tafsirFontSize, setTafsirFontSize: (v: number) => updateSetting('tafsirFontSize', v, setTafsirFontSize),
      tafsirFontFamily, setTafsirFontFamily: (v: string) => updateSetting('tafsirFontFamily', v, setTafsirFontFamily),
      fontFamily, setFontFamily: (v: string) => updateSetting('fontFamily', v, setFontFamily),
      recitation, setRecitation: (v: Recitation) => updateSetting('recitation', v, setRecitation),
      reciter, setReciter: (v: number) => updateSetting('reciter', v, setReciter),
      autoPlay, setAutoPlay: (v: boolean) => updateSetting('autoPlay', v, setAutoPlay),
      secondaryTafsirType, setSecondaryTafsirType: (v: TafsirType | null) => updateSetting('secondaryTafsirType', v as any, setSecondaryTafsirType),
      mushafZoom, setMushafZoom: (v: number) => updateSetting('mushafZoom', v, setMushafZoom),
      mushafEdition, setMushafEdition: (v: 'hafs' | 'warsh' | 'tajweed') => updateSetting('mushafEdition', v, setMushafEdition),
      mushafDisplayMode, setMushafDisplayMode: (v: 'auto' | 'single' | 'double') => updateSetting('mushafDisplayMode', v, setMushafDisplayMode),
      bookmark, setBookmark: (v: any) => updateSetting('bookmark', v, setBookmark),
      bookmarks, setBookmarks: (v: any[]) => updateSetting('bookmarks', v, setBookmarks),
      keepScreenAwake, setKeepScreenAwake: (v: boolean) => updateSetting('keepScreenAwake', v, setKeepScreenAwake),
      ayahRepeatCount, setAyahRepeatCount: (v: number) => updateSetting('ayahRepeatCount', v, setAyahRepeatCount),
      rangeRepeatCount, setRangeRepeatCount: (v: number) => updateSetting('rangeRepeatCount', v, setRangeRepeatCount),
      playbackRate, setPlaybackRate: (v: number) => updateSetting('playbackRate', v, setPlaybackRate),
      autoNextSurah, setAutoNextSurah: (v: boolean) => updateSetting('autoNextSurah', v, setAutoNextSurah),
      ayahInterval, setAyahInterval: (v: number) => updateSetting('ayahInterval', v, setAyahInterval),
      isStoragePersistent, requestStoragePersistence
  }), [
      fontSize, theme, readingMode, viewMode, focusMode, showTafsir, tafsirType, tafsirTheme,
      tafsirFontSize, tafsirFontFamily, fontFamily, recitation, reciter, autoPlay, secondaryTafsirType,
      mushafZoom, mushafEdition, mushafDisplayMode, bookmark, bookmarks, keepScreenAwake, ayahRepeatCount, rangeRepeatCount,
      playbackRate, autoNextSurah, ayahInterval, isStoragePersistent
  ]);

  return (
    <QuranSettingsContext.Provider value={contextValue}>
      {children}
    </QuranSettingsContext.Provider>
  );
};

export const useQuranSettings = () => {
  const context = useContext(QuranSettingsContext);
  if (!context) throw new Error('useQuranSettings must be used within a QuranSettingsProvider');
  return context;
};
