import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { RECITERS } from '../reciters';
import { SURAH_NAMES } from '../utils/quranUtils';
import { audioCacheService } from '../services/audioCacheService';
import { lectureCacheService } from '../services/lectureCacheService';
import { getSurahAudioUrl } from '../services/quranAudioUrlService';
import { safeLocalStorageGetItem, safeLocalStorageSetItem, safeLocalStorageRemoveItem } from "../utils/storage";

export interface GlobalTrack {
  id: string; // e.g. "l-yaqoub-1" or "quran-1"
  title: string;
  subtitle: string;
  audioUrl: string;
  originalUrl?: string; // Original URL before caching (so we can re-resolve or play directly if blob dies)
  type: 'quran' | 'lecture' | 'tafsir';
  reciterId?: string | number;
  surahNumber?: number;
  scholarId?: string;
  durationString?: string;
  initialStartTime?: number;
}

const getAlternativeUrls = (track: GlobalTrack, currentUrl: string): string[] => {
  const alts: string[] = [];

  // 1. Original URL if currently a blob URL is failing
  if (track.originalUrl && currentUrl.startsWith('blob:') && track.originalUrl !== currentUrl) {
    alts.push(track.originalUrl);
  }

  // Standard mirror domain replacements
  if (currentUrl.includes('mirrors.quranicaudio.com')) {
    alts.push(currentUrl.replace('mirrors.quranicaudio.com', 'download.quranicaudio.com'));
  } else if (currentUrl.includes('download.quranicaudio.com')) {
    alts.push(currentUrl.replace('download.quranicaudio.com', 'mirrors.quranicaudio.com'));
  }

  // 2. Quranic-specific reliable fallbacks
  if (track.type === 'quran' && track.surahNumber) {
    const surahNumPadded = String(track.surahNumber).padStart(3, '0');
    const reciterIdNum = track.reciterId ? Number(track.reciterId) : null;
    const reciter = RECITERS.find(r => r.id === reciterIdNum);
    if (reciter) {
      // High-precision Fallback: cdn.islamic.network
      if (reciter.alquranCloudId) {
        alts.push(`https://cdn.islamic.network/quran/audio-surah/128/${reciter.alquranCloudId}/${track.surahNumber}.mp3`);
      }
      
      // EveryAyah Backend
      if ((reciter as any).folder) {
        alts.push(`https://everyayah.com/data/${(reciter as any).folder}/${surahNumPadded}.mp3`);
      }
      
      // Additional Audio Mirrors - prioritize ultra-fast BunnyCDN
      if ((reciter as any).audioPath) {
        alts.push(`https://download.quranicaudio.com/quran/${(reciter as any).audioPath}/${surahNumPadded}.mp3`);
        alts.push(`https://mirrors.quranicaudio.com/quran/${(reciter as any).audioPath}/${surahNumPadded}.mp3`);
      }

      // Server URL fallback
      if ((reciter as any).serverUrl) {
         alts.push(`${(reciter as any).serverUrl}${surahNumPadded}.mp3`);
      }
    }
  }

  // 3. Archive.org specific fallbacks
  if (currentUrl.includes('archive.org')) {
    // Try www subdomain prefix variations (which acts as primary load balanced endpoint)
    if (currentUrl.includes('://archive.org/')) {
      alts.push(currentUrl.replace('://archive.org/', '://www.archive.org/'));
    } else if (currentUrl.includes('://www.archive.org/')) {
      alts.push(currentUrl.replace('://www.archive.org/', '://archive.org/'));
    }
    // Try details folder to download folder mapping in case web reference is present
    if (currentUrl.includes('/details/')) {
      alts.push(currentUrl.replace('/details/', '/download/'));
    }
  }

  // 4. URL character repairs for potential Arabic encoding/typing faults
  try {
    const decoded = decodeURIComponent(currentUrl);
    if (decoded !== currentUrl) {
      alts.push(decoded);
    }
    
    // Repair common typing / encoding errors in copy-pasted URLs
    const repaired = decoded
      .replace(/حس[I|I|Key]ن/g, 'حسين')
      .replace(/طري[\w]* الجنة/g, 'طريق الجنة')
      .replace(/أين-قلب[I|I|Key]-/g, 'أين-قلبي-')
      .replace(/أين-قلب[I|I|Key]/g, 'أين-قلبي')
      .replace(/حسIن/g, 'حسين')
      .replace(/حسKeyن/g, 'حسين')
      .replace(/تصلق/g, 'تصلي');
      
    if (repaired !== decoded) {
      alts.push(repaired);
      alts.push(encodeURI(repaired));
    }
    
    // Use lowercased hex encoding to avoid trigger filters (such as sensitive key detectors)
    const lowercaseEncoded = currentUrl.replace(/%[0-9A-F]{2}/g, match => match.toLowerCase());
    if (lowercaseEncoded !== currentUrl) {
      alts.push(lowercaseEncoded);
    }
  } catch (err) {
    // ignore
  }

  // Filter out invalid/empty/duplicates and the current url
  const rawAlts = Array.from(new Set(alts)).filter(url => url && url !== currentUrl);
  
  const finalAlts: string[] = [];

  // 1. Prioritize proxied version of the current active URL immediately as the first fallback
  if (currentUrl.startsWith('http://') || currentUrl.startsWith('https://')) {
    if (!currentUrl.includes('/api/proxy-stream')) {
      finalAlts.push(`/api/proxy-stream?url=${encodeURIComponent(currentUrl)}`);
    }
  }

  // 2. Then queue other alternative mirrors and their proxied variations
  rawAlts.forEach(url => {
    // Try original direct url first
    finalAlts.push(url);
    // Follow with its proxied version to guarantee CORS/mixed-content bypass
    if (url.startsWith('http://') || url.startsWith('https://')) {
      finalAlts.push(`/api/proxy-stream?url=${encodeURIComponent(url)}`);
    }
  });

  return Array.from(new Set(finalAlts));
};

const resolvePlayableUrl = async (track: GlobalTrack): Promise<string> => {
  if (!track.audioUrl.startsWith('blob:')) {
    return track.audioUrl;
  }

  const original = track.originalUrl;
  if (!original) {
    return track.audioUrl;
  }

  try {
    if (track.type === 'quran') {
      const cached = await audioCacheService.getCachedAudioUrl(original);
      if (cached) return cached;
    } else if (track.type === 'lecture') {
      const cached = await lectureCacheService.getCachedAudioUrl(original);
      if (cached) return cached;
    }
  } catch (err) {
    console.warn('Failed to re-resolve cached URL:', err);
  }

  return original;
};

const getAudioTimeout = (url: string): number => {
  if (url.includes('archive.org') || url.includes('alquran.cloud') || url.includes('islamic.network') || url.includes('proxy-stream')) {
    return 30000; // 30 seconds for slow/high-latency audio platforms or proxy server connections
  }
  return 20000; // 20 seconds default
};

const waitForAudioPlayable = (audio: HTMLAudioElement, timeoutMs: number = 4000): Promise<void> => {
  return new Promise((resolve, reject) => {
    let resolved = false;

    const cleanup = () => {
      audio.removeEventListener('canplay', onCanPlay);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('error', onError);
    };

    const onCanPlay = () => {
      if (!resolved) {
        resolved = true;
        cleanup();
        resolve();
      }
    };

    const onLoadedMetadata = () => {
      if (!resolved) {
        resolved = true;
        cleanup();
        resolve();
      }
    };

    const onError = (e: Event) => {
      if (!resolved) {
        resolved = true;
        cleanup();
        const err = audio.error;
        reject(new Error(err ? (err.message || `Media error code: ${err.code}`) : 'Audio load error'));
      }
    };

    // Add listeners
    audio.addEventListener('canplay', onCanPlay);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('error', onError);

    // Also check current state
    if (audio.readyState >= 2) { // HAVE_CURRENT_DATA
      resolved = true;
      cleanup();
      resolve();
      return;
    }
    if (audio.error) {
      resolved = true;
      cleanup();
      reject(new Error(audio.error.message || `Media error code: ${audio.error.code}`));
      return;
    }

    // Timeout fallback
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        cleanup();
        // If it got some progress or metadata, treat as resolved
        if (audio.readyState >= 1 || audio.duration > 0) {
          resolve();
        } else {
          reject(new Error('Audio connection timed out'));
        }
      }
    }, timeoutMs);
  });
};

export interface TrackPlaybackInfo {
  time: number;
  duration: number;
  percent: number; // 0 - 100
  completed: boolean;
  updatedAt?: number;
}

export function parseDurationToSeconds(durationStr?: string): number {
  if (!durationStr) return 0;
  const parts = durationStr.trim().split(':').map(p => parseInt(p, 10));
  if (parts.some(isNaN)) return 0;
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return 0;
}

export function formatSecondsToTime(totalSeconds: number): string {
  if (!totalSeconds || isNaN(totalSeconds) || totalSeconds <= 0) return '00:00';
  const sec = Math.floor(totalSeconds);
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export const saveTrackPlaybackPosition = (trackId: string, time: number, duration: number) => {
  try {
    const saved = safeLocalStorageGetItem('believer_audio_positions');
    const positions = saved ? JSON.parse(saved) : {};
    
    // If completed or near the end (less than 8 seconds or >98%), mark completed
    if (duration > 0 && (time > duration - 8 || (time / duration) > 0.98)) {
      positions[trackId] = { time: duration, duration, completed: true, updatedAt: Date.now() };
    } else if (time > 3) { // Only save position if played more than 3 seconds
      positions[trackId] = { time, duration, completed: false, updatedAt: Date.now() };
    } else {
      delete positions[trackId];
    }
    
    // Clean up older items if list grows too large
    const keys = Object.keys(positions);
    if (keys.length > 100) {
      const entries = Object.entries(positions).map(([k, v]: [string, any]) => ({ k, v }));
      entries.sort((a, b) => (a.v.updatedAt || 0) - (b.v.updatedAt || 0));
      for (let i = 0; i < entries.length - 80; i++) {
        delete positions[entries[i].k];
      }
    }
    
    safeLocalStorageSetItem('believer_audio_positions', JSON.stringify(positions));
    window.dispatchEvent(new CustomEvent('believer_audio_positions_updated'));
  } catch (e) {
    console.warn('Error saving playback position:', e);
  }
};

export const clearTrackPlaybackPosition = (trackId: string) => {
  try {
    const saved = safeLocalStorageGetItem('believer_audio_positions');
    if (!saved) return;
    const positions = JSON.parse(saved);
    delete positions[trackId];
    safeLocalStorageSetItem('believer_audio_positions', JSON.stringify(positions));
    window.dispatchEvent(new CustomEvent('believer_audio_positions_updated'));
  } catch (e) {
    console.warn('Error clearing playback position:', e);
  }
};

export const getTrackPlaybackInfo = (trackId: string, defaultDurationSec: number = 0): TrackPlaybackInfo => {
  try {
    const saved = safeLocalStorageGetItem('believer_audio_positions');
    if (!saved) return { time: 0, duration: defaultDurationSec, percent: 0, completed: false };
    const positions = JSON.parse(saved);
    const item = positions[trackId];
    if (item && typeof item.time === 'number') {
      const dur = item.duration || defaultDurationSec || 0;
      const completed = !!item.completed || (dur > 0 && item.time >= dur - 8);
      const percent = completed ? 100 : (dur > 0 ? Math.min(100, Math.max(0, (item.time / dur) * 100)) : 0);
      return {
        time: item.time,
        duration: dur,
        percent,
        completed,
        updatedAt: item.updatedAt
      };
    }
  } catch (e) {
    console.warn('Error fetching audio position info:', e);
  }
  return { time: 0, duration: defaultDurationSec, percent: 0, completed: false };
};

export const getTrackPlaybackPosition = (trackId: string): number => {
  const info = getTrackPlaybackInfo(trackId);
  if (info.completed) return 0;
  return info.time;
};


interface GlobalAudioContextType {
  currentTrack: GlobalTrack | null;
  isPlaying: boolean;
  progress: number; // percentage (0-100)
  duration: number; // in seconds
  currentTime: number; // in seconds
  playbackRate: number;
  sleepTimer: number | null; // minutes remaining, null if disabled
  playTrack: (track: GlobalTrack) => void;
  pauseTrack: () => void;
  resumeTrack: () => void;
  stopTrack: () => void;
  seek: (time: number) => void;
  setPlaybackRate: (rate: number) => void;
  setSleepTimer: (minutes: number | null) => void;
  playNextTrack: () => void;
  playPrevTrack: () => void;
  playSurahByNumber: (surahNumber: number) => void;
  autoPlayNext: boolean;
  setAutoPlayNext: (val: boolean) => void;
  nextTrackCountdown: number | null;
  cancelNextTrackCountdown: () => void;
  skipNextTrackCountdown: () => void;
}

const GlobalAudioContext = createContext<GlobalAudioContextType | undefined>(undefined);

export const GlobalAudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<GlobalTrack | null>(() => {
    const saved = safeLocalStorageGetItem('believer_global_track');
    return saved ? JSON.parse(saved) : null;
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [sleepTimer, _setSleepTimer] = useState<number | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sleepIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);

  // Track continuous playback progress using ref to avoid stale closures in event listeners
  const currentTrackRef = useRef<GlobalTrack | null>(currentTrack);

  const [autoPlayNext, _setAutoPlayNext] = useState<boolean>(() => {
    try {
      const saved = safeLocalStorageGetItem('believer_auto_play_next');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const setAutoPlayNext = (val: boolean) => {
    _setAutoPlayNext(val);
    try {
      safeLocalStorageSetItem('believer_auto_play_next', val ? 'true' : 'false');
    } catch (e) {}
  };

  const [nextTrackCountdown, setNextTrackCountdown] = useState<number | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const playNextTrackRef = useRef<() => void>(() => {});

  // Clear countdown when the track changes
  useEffect(() => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setNextTrackCountdown(null);
  }, [currentTrack?.id]);

  const playSurahByNumber = async (surahNumber: number, trackOverride?: GlobalTrack) => {
    const track = trackOverride || currentTrackRef.current;
    if (!track || track.type !== 'quran' || !track.reciterId) return;
    const reciterId = Number(track.reciterId);
    const activeReciter = RECITERS.find(r => r.id === reciterId);
    if (!activeReciter) return;
    
    const surahName = SURAH_NAMES[surahNumber - 1] || `${surahNumber}`;
    const url = getSurahAudioUrl(activeReciter, surahNumber);

    let finalUrl = url;
    try {
      const cachedUrl = (await audioCacheService.getCachedAudioUrlBySurah(activeReciter.id, surahNumber))
        || (await audioCacheService.getCachedAudioUrl(url));
      finalUrl = cachedUrl || url;
    } catch (err) {
      console.warn('Playlist offline cache resolve failed:', err);
    }

    playTrack({
      id: `quran-${activeReciter.id}-${surahNumber}`,
      title: `سورة ${surahName}`,
      subtitle: activeReciter.name,
      audioUrl: finalUrl,
      originalUrl: url,
      type: 'quran',
      reciterId: activeReciter.id,
      surahNumber: surahNumber
    });
  };

  const playLectureTrackContext = async (lecture: any, scholar: any) => {
    let srcUrl = lecture.audioUrl;
    
    try {
      const isCached = await lectureCacheService.isAudioCached(lecture.audioUrl);
      if (isCached) {
        const cachedUrl = await lectureCacheService.getCachedAudioUrl(lecture.audioUrl);
        if (cachedUrl) {
          srcUrl = cachedUrl;
        }
      }
    } catch (e) {
      console.warn('lecture cache resolution failed in context:', e);
    }

    playTrack({
      id: lecture.id,
      title: lecture.title,
      subtitle: scholar.name,
      audioUrl: srcUrl,
      originalUrl: lecture.audioUrl,
      type: 'lecture',
      scholarId: scholar.id
    });
  };

  const playTafsirTrackContext = async (trackInfo: any, scholar: any) => {
    let srcUrl = trackInfo.audioUrl;
    
    try {
      const isCached = await lectureCacheService.isAudioCached(trackInfo.audioUrl);
      if (isCached) {
        const cachedUrl = await lectureCacheService.getCachedAudioUrl(trackInfo.audioUrl);
        if (cachedUrl) {
          srcUrl = cachedUrl;
        }
      }
    } catch (e) {
      console.warn('tafsir cache resolution failed in context:', e);
    }

    playTrack({
      id: trackInfo.id,
      title: trackInfo.title,
      subtitle: scholar.name,
      audioUrl: srcUrl,
      originalUrl: trackInfo.audioUrl,
      type: 'tafsir',
      scholarId: scholar.id
    });
  };

  const playNextTrack = () => {
    const track = currentTrackRef.current;
    if (!track) return;

    if (track.type === 'quran' && track.surahNumber && track.reciterId) {
      const reciterId = Number(track.reciterId);
      const activeReciter = RECITERS.find(r => r.id === reciterId);
      if (!activeReciter) return;

      let available = [];
      if ((activeReciter as any).surahUrls) {
        available = Object.keys((activeReciter as any).surahUrls).map(Number).sort((a, b) => a - b);
      } else {
        available = Array.from({ length: 114 }, (_, i) => i + 1);
      }

      const currentIndex = available.indexOf(track.surahNumber);
      if (currentIndex === -1) return;
      const nextIndex = (currentIndex + 1) % available.length;
      playSurahByNumber(available[nextIndex], track);
    } else if (track.type === 'lecture') {
      import('../data/lectures').then(({ SCHOLARS }) => {
        const scholarId = track.scholarId || SCHOLARS.find(s => s.series.some(ser => ser.lectures.some(l => l.id === track.id)))?.id;
        if (!scholarId) return;
        const scholar = SCHOLARS.find(s => s.id === scholarId);
        if (!scholar) return;
        const allLectures = scholar.series.flatMap(s => s.lectures);
        const currentIndex = allLectures.findIndex(l => l.id === track.id);
        if (currentIndex === -1) return;
        const nextIndex = (currentIndex + 1) % allLectures.length;
        const nextLecture = allLectures[nextIndex];
        if (nextLecture) {
          playLectureTrackContext(nextLecture, scholar);
        }
      }).catch(err => console.error('Error loading lectures data for next track', err));
    } else if (track.type === 'tafsir') {
      import('../data/tafsir').then(({ TAFSIR_SCHOLARS }) => {
        const scholarId = track.scholarId || TAFSIR_SCHOLARS.find(s => s.surahs.some(sur => sur.tracks.some(t => t.id === track.id)))?.id;
        if (!scholarId) return;
        const scholar = TAFSIR_SCHOLARS.find(s => s.id === scholarId);
        if (!scholar) return;
        const allTracks = scholar.surahs.flatMap(s => s.tracks);
        const currentIndex = allTracks.findIndex(t => t.id === track.id);
        if (currentIndex === -1) return;
        const nextIndex = (currentIndex + 1) % allTracks.length;
        const nextTrack = allTracks[nextIndex];
        if (nextTrack) {
          playTafsirTrackContext(nextTrack, scholar);
        }
      }).catch(err => console.error('Error loading tafsir data for next track', err));
    }
  };

  const playPrevTrack = () => {
    const track = currentTrackRef.current;
    if (!track) return;

    if (track.type === 'quran' && track.surahNumber && track.reciterId) {
      const reciterId = Number(track.reciterId);
      const activeReciter = RECITERS.find(r => r.id === reciterId);
      if (!activeReciter) return;

      let available = [];
      if ((activeReciter as any).surahUrls) {
        available = Object.keys((activeReciter as any).surahUrls).map(Number).sort((a, b) => a - b);
      } else {
        available = Array.from({ length: 114 }, (_, i) => i + 1);
      }

      const currentIndex = available.indexOf(track.surahNumber);
      if (currentIndex === -1) return;
      const prevIndex = (currentIndex - 1 + available.length) % available.length;
      playSurahByNumber(available[prevIndex], track);
    } else if (track.type === 'lecture') {
      import('../data/lectures').then(({ SCHOLARS }) => {
        const scholarId = track.scholarId || SCHOLARS.find(s => s.series.some(ser => ser.lectures.some(l => l.id === track.id)))?.id;
        if (!scholarId) return;
        const scholar = SCHOLARS.find(s => s.id === scholarId);
        if (!scholar) return;
        const allLectures = scholar.series.flatMap(s => s.lectures);
        const currentIndex = allLectures.findIndex(l => l.id === track.id);
        if (currentIndex === -1) return;
        const prevIndex = (currentIndex - 1 + allLectures.length) % allLectures.length;
        const prevLecture = allLectures[prevIndex];
        if (prevLecture) {
          playLectureTrackContext(prevLecture, scholar);
        }
      }).catch(err => console.error('Error loading lectures data for prev track', err));
    } else if (track.type === 'tafsir') {
      import('../data/tafsir').then(({ TAFSIR_SCHOLARS }) => {
        const scholarId = track.scholarId || TAFSIR_SCHOLARS.find(s => s.surahs.some(sur => sur.tracks.some(t => t.id === track.id)))?.id;
        if (!scholarId) return;
        const scholar = TAFSIR_SCHOLARS.find(s => s.id === scholarId);
        if (!scholar) return;
        const allTracks = scholar.surahs.flatMap(s => s.tracks);
        const currentIndex = allTracks.findIndex(t => t.id === track.id);
        if (currentIndex === -1) return;
        const prevIndex = (currentIndex - 1 + allTracks.length) % allTracks.length;
        const prevTrack = allTracks[prevIndex];
        if (prevTrack) {
          playTafsirTrackContext(prevTrack, scholar);
        }
      }).catch(err => console.error('Error loading tafsir data for prev track', err));
    }
  };

  // Keep playNextTrackRef in sync to guard event handlers from stale closures
  useEffect(() => {
    playNextTrackRef.current = playNextTrack;
  }, [playNextTrack]);

  const cancelNextTrackCountdown = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setNextTrackCountdown(null);
  };

  const skipNextTrackCountdown = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setNextTrackCountdown(null);
    playNextTrack();
  };

  useEffect(() => {
    currentTrackRef.current = currentTrack;
    if ('mediaSession' in navigator) {
      if (currentTrack) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: currentTrack.title,
          artist: currentTrack.subtitle,
          album: 'اذكار المؤمن'
        });
      } else {
        // We shouldn't strictly set to null immediately but clearing might be safe
      }
    }
  }, [currentTrack]);

  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', () => {
        if (playPromiseRef.current) return;
        if (audioRef.current && audioRef.current.src) {
           audioRef.current.play().then(() => setIsPlaying(true)).catch(e => console.warn(e));
        }
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        if (audioRef.current) {
          audioRef.current.pause();
          setIsPlaying(false);
        }
      });
      navigator.mediaSession.setActionHandler('stop', () => {
         stopTrack();
      });
      navigator.mediaSession.setActionHandler('previoustrack', () => {
         playPrevTrack();
      });
      navigator.mediaSession.setActionHandler('nexttrack', () => {
         playNextTrack();
      });
      navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        if (audioRef.current) {
          const skipTime = details.seekOffset || 10;
          const newTime = Math.max(audioRef.current.currentTime - skipTime, 0);
          audioRef.current.currentTime = newTime;
          setCurrentTime(newTime);
        }
      });
      navigator.mediaSession.setActionHandler('seekforward', (details) => {
        if (audioRef.current) {
          const skipTime = details.seekOffset || 10;
          const newTime = Math.min(audioRef.current.currentTime + skipTime, audioRef.current.duration || 0);
          audioRef.current.currentTime = newTime;
          setCurrentTime(newTime);
        }
      });
    }
    
    return () => {
      if ('mediaSession' in navigator) {
        try {
          navigator.mediaSession.setActionHandler('play', null);
          navigator.mediaSession.setActionHandler('pause', null);
          navigator.mediaSession.setActionHandler('stop', null);
          navigator.mediaSession.setActionHandler('previoustrack', null);
          navigator.mediaSession.setActionHandler('nexttrack', null);
          navigator.mediaSession.setActionHandler('seekbackward', null);
          navigator.mediaSession.setActionHandler('seekforward', null);
        } catch (e) {}
      }
    };
  }, []);

  // Initialize Audio
  useEffect(() => {
    audioRef.current = new Audio();
    
    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      if (audio.duration) {
        const time = audio.currentTime;
        setCurrentTime(time);
        setProgress((time / audio.duration) * 100);
        
        // Smart Continuous Playback: Save current position in localStorage
        if (currentTrackRef.current) {
          saveTrackPlaybackPosition(currentTrackRef.current.id, time, audio.duration);
        }
        
        if ('mediaSession' in navigator && 'setPositionState' in navigator.mediaSession) {
          try {
            navigator.mediaSession.setPositionState({
              duration: audio.duration,
              playbackRate: audio.playbackRate,
              position: time
            });
          } catch (e) {}
        }
      }
    };

    const handleDurationChange = () => {
      setDuration(audio.duration || 0);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(100);
      setCurrentTime(audio.duration || 0);
      if (currentTrackRef.current) {
        saveTrackPlaybackPosition(currentTrackRef.current.id, 0, 0); // resets position on completion
      }

      // Check if automatic continuation is enabled and the track is of type quran or lecture
      const autoPlayNextEnabled = safeLocalStorageGetItem('believer_auto_play_next') !== 'false';
      const track = currentTrackRef.current;
      if (autoPlayNextEnabled && track && (
        (track.type === 'quran' && track.surahNumber && track.reciterId) ||
        (track.type === 'lecture')
      )) {
        let count = 4; // Smooth 4-second delay transition
        setNextTrackCountdown(count);

        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
        }

        countdownIntervalRef.current = setInterval(() => {
          count -= 1;
          if (count <= 0) {
            if (countdownIntervalRef.current) {
              clearInterval(countdownIntervalRef.current);
              countdownIntervalRef.current = null;
            }
            setNextTrackCountdown(null);
            playNextTrackRef.current();
          } else {
            setNextTrackCountdown(count);
          }
        }, 1000);
      }
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handleError = (e: any) => {
      console.warn('Global audio encountered an error:', e);
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('error', handleError);

    // Speed setting retrieval
    const savedSpeed = safeLocalStorageGetItem('believer_audio_speed');
    if (savedSpeed) {
      const parsed = parseFloat(savedSpeed);
      if (!isNaN(parsed)) {
        setPlaybackRate(parsed);
        audio.playbackRate = parsed;
      }
    }

    if (currentTrack) {
      resolvePlayableUrl(currentTrack).then(resolvedUrl => {
        if (audioRef.current === audio) {
          audio.src = resolvedUrl;
          audio.playbackRate = playbackRate;
          audio.load();

          // Continuous playback: resume from where they left off
          const savedTime = getTrackPlaybackPosition(currentTrack.id);
          if (savedTime > 0) {
            const handleInitialLoadedMetadata = () => {
              if (audioRef.current === audio) {
                audio.currentTime = savedTime;
                setCurrentTime(savedTime);
              }
              audio.removeEventListener('loadedmetadata', handleInitialLoadedMetadata);
            };
            audio.addEventListener('loadedmetadata', handleInitialLoadedMetadata);
          }
        }
      }).catch(err => {
        console.warn('Failed to resolve initial track url:', err);
      });
    }

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('error', handleError);
      audio.pause();
    };
  }, []);

  // Sync playback rate when changed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
      safeLocalStorageSetItem('believer_audio_speed', playbackRate.toString());
    }
  }, [playbackRate]);

  // Handle Sleep Timer Countdown
  useEffect(() => {
    if (sleepTimer !== null && sleepTimer > 0 && isPlaying) {
      sleepIntervalRef.current = setInterval(() => {
        _setSleepTimer(prev => {
          if (prev === null) return null;
          if (prev <= 1) {
            // Stop playing
            pauseTrack();
            if (sleepIntervalRef.current) clearInterval(sleepIntervalRef.current);
            return null;
          }
          return prev - 1;
        });
      }, 60000); // countdown every minute
    } else {
      if (sleepIntervalRef.current) {
        clearInterval(sleepIntervalRef.current);
      }
    }

    return () => {
      if (sleepIntervalRef.current) {
        clearInterval(sleepIntervalRef.current);
      }
    };
  }, [sleepTimer, isPlaying]);

  const playTrack = async (track: GlobalTrack) => {
    if (!audioRef.current) return;
    
    if (playPromiseRef.current) {
      try {
        await playPromiseRef.current;
      } catch {
        // previous play was aborted, ignore
      }
    }

    try {
      audioRef.current.pause();
    } catch (e) {}
    
    // Reset state values
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);

    // Dynamic Fast-Path: Resolve URL synchronously if it's already a direct remote URL
    // This preserves the synchronous user gesture token so modern browsers don't block playback.
    let initialUrl: string;
    if (track.audioUrl && !track.audioUrl.startsWith('blob:')) {
      initialUrl = track.audioUrl;
    } else {
      initialUrl = await resolvePlayableUrl(track);
    }

    const urlsToTry = [initialUrl, ...getAlternativeUrls(track, initialUrl)];
    
    let playSuccess = false;
    let lastError: any = null;

    for (let i = 0; i < urlsToTry.length; i++) {
      const url = urlsToTry[i];
      if (!audioRef.current) break;
      try {
        // Safe transition: reset any stale audio player connection/active buffer load
        if (i > 0) {
          try {
            audioRef.current.pause();
            audioRef.current.src = '';
            audioRef.current.load();
          } catch (e) {}
        }

        audioRef.current.src = url;
        audioRef.current.load();
        audioRef.current.playbackRate = playbackRate;

        // Do NOT use waitForAudioPlayable as it breaks the synchronous user gesture token
        // which prevents background audio playback on iOS/Safari.
        // Instead, rely on the Promise returned by .play() to catch format/network errors.
        const promise = audioRef.current.play();
        playPromiseRef.current = promise;

        // Catch warning on the promise to avoid uncaught rejections in client console
        promise.catch((e) => {
          console.warn("Audio element play() promise rejected or cancelled:", e?.message || e);
        });
        
        // Timeout safeguard
        const timeoutMs = getAudioTimeout(url);
        let timeoutId: NodeJS.Timeout;
        const timeoutPromise = new Promise((_, reject) => {
          timeoutId = setTimeout(() => reject(new Error('Audio play timeout')), timeoutMs);
        });

        await Promise.race([promise, timeoutPromise]);
        clearTimeout(timeoutId!);

        // Smart Continuous Playback or Specified Topic Timestamp Offset
        const targetStartTime = track.initialStartTime !== undefined 
          ? track.initialStartTime 
          : getTrackPlaybackPosition(track.id);

        if (targetStartTime > 0 && audioRef.current) {
          const duration = audioRef.current.duration;
          if (!duration || targetStartTime < duration) {
            audioRef.current.currentTime = targetStartTime;
            setCurrentTime(targetStartTime);
          }
        }

        if (audioRef.current.error) {
          throw new Error(audioRef.current.error.message || "Failed to load audio resource");
        }

        setIsPlaying(true);
        playSuccess = true;
        
        // Update the tracked audioUrl to the successful playing one
        const updatedTrack = { ...track, audioUrl: url };
        setCurrentTrack(updatedTrack);
        safeLocalStorageSetItem('believer_global_track', JSON.stringify(updatedTrack));
        break;
      } catch (error: any) {
        lastError = error;
        if (error && error.name === 'AbortError') {
          break; // user plays another surah / track
        }
        console.warn(`GlobalAudioContext: fallback retry [${i+1}/${urlsToTry.length}] failed for "${url}":`, error?.message || error);
      }
    }

    if (!playSuccess && lastError) {
      if (lastError.name !== 'AbortError') {
        let msg = lastError.message || String(lastError);
        if (msg.includes('Format error') || msg.includes('SRC_NOT_SUPPORTED') || msg.includes('supported source') || msg.includes('not suitable')) {
           msg = 'The audio server is temporarily unavailable or the format is unsupported. Please try another reciter or track.';
        }
        console.error('Failed to play global audio track after retrying fallbacks:', msg, 'Track:', track);
        // Fire event that components can listen to if needed
        window.dispatchEvent(new CustomEvent('global_audio_error', { detail: { message: msg } }));
      }
      setIsPlaying(false);
    } else {
      playPromiseRef.current = null;
    }
  };

  const pauseTrack = async () => {
    if (audioRef.current) {
      if (playPromiseRef.current) {
        try {
          await playPromiseRef.current;
        } catch {
          // ignore
        }
      }
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const resumeTrack = async () => {
    if (audioRef.current && currentTrack) {
      if (playPromiseRef.current) {
        try {
          await playPromiseRef.current;
        } catch {
          // ignore
        }
      }
      
      const currentSrc = audioRef.current.src;
      const urlsToTry = [];
      let primaryUrl = currentSrc;
      if (!primaryUrl || primaryUrl === '' || primaryUrl === window.location.href || audioRef.current.error) {
        if (currentTrack.audioUrl && !currentTrack.audioUrl.startsWith('blob:')) {
          primaryUrl = currentTrack.audioUrl;
        } else {
          primaryUrl = await resolvePlayableUrl(currentTrack);
        }
      }

      urlsToTry.push(primaryUrl);
      if (currentTrack.originalUrl && currentTrack.originalUrl !== primaryUrl) {
        urlsToTry.push(currentTrack.originalUrl);
      }
      urlsToTry.push(...getAlternativeUrls(currentTrack, primaryUrl));

      let playSuccess = false;
      let lastError: any = null;

      for (let i = 0; i < urlsToTry.length; i++) {
        const url = urlsToTry[i];
        if (!audioRef.current) break;
        try {
          // Safe transition: reset any stale audio player connection/active buffer load
          if (i > 0) {
            try {
              audioRef.current.pause();
              audioRef.current.src = '';
              audioRef.current.load();
            } catch (e) {}
          }

          if (audioRef.current.src !== url) {
            audioRef.current.src = url;
            audioRef.current.load();
            audioRef.current.playbackRate = playbackRate;
          }
          
          // Do NOT use waitForAudioPlayable as it breaks the synchronous user gesture token
          // Instead, rely on the Promise returned by .play() to catch format/network errors.
          const promise = audioRef.current.play();
          playPromiseRef.current = promise;

          // Catch warning on the promise to avoid uncaught rejections in client console
          promise.catch((e) => {
            console.warn("Audio element play() promise rejected or cancelled during resume:", e?.message || e);
          });
          
          // Timeout safeguard
          const timeoutMs = getAudioTimeout(url);
          let timeoutId: NodeJS.Timeout;
          const timeoutPromise = new Promise((_, reject) => {
            timeoutId = setTimeout(() => reject(new Error('Audio play timeout')), timeoutMs);
          });

          await Promise.race([promise, timeoutPromise]);
          clearTimeout(timeoutId!);

          if (audioRef.current.error) {
            throw new Error(audioRef.current.error.message || "Resource error");
          }

          setIsPlaying(true);
          playSuccess = true;

          if (currentTrack.audioUrl !== url) {
            const updatedTrack = { ...currentTrack, audioUrl: url };
            setCurrentTrack(updatedTrack);
            safeLocalStorageSetItem('believer_global_track', JSON.stringify(updatedTrack));
          }
          break;
        } catch (error: any) {
          lastError = error;
          if (error && error.name === 'AbortError') {
            break;
          }
          console.warn(`GlobalAudioContext: resume fallback retry [${i+1}/${urlsToTry.length}] failed for "${url}":`, error?.message || error);
        }
      }

      if (!playSuccess && lastError) {
        if (lastError.name !== 'AbortError') {
          let msg = lastError.message || String(lastError);
          if (msg.includes('Format error') || msg.includes('SRC_NOT_SUPPORTED') || msg.includes('supported source') || msg.includes('not suitable')) {
             msg = 'The audio server is temporarily unavailable or the format is unsupported. Please try another reciter or track.';
          }
          console.error('Failed to resume global audio track after fallbacks:', msg);
          window.dispatchEvent(new CustomEvent('global_audio_error', { detail: { message: msg } }));
        }
        setIsPlaying(false);
      } else {
        playPromiseRef.current = null;
      }
    }
  };

  const stopTrack = async () => {
    if (audioRef.current) {
      if (playPromiseRef.current) {
        try {
          await playPromiseRef.current;
        } catch {
          // ignore
        }
      }
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.removeAttribute('src');
      audioRef.current.load();
    }
    setIsPlaying(false);
    setCurrentTrack(null);
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
    _setSleepTimer(null);
    safeLocalStorageRemoveItem('believer_global_track');
  };

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
      if (audioRef.current.duration) {
        setProgress((time / audioRef.current.duration) * 100);
      }
    }
  };

  const setSleepTimer = (minutes: number | null) => {
    _setSleepTimer(minutes);
  };

  const contextValue = React.useMemo(() => ({
      currentTrack,
      isPlaying,
      progress,
      duration,
      currentTime,
      playbackRate,
      sleepTimer,
      playTrack,
      pauseTrack,
      resumeTrack,
      stopTrack,
      seek,
      setPlaybackRate,
      setSleepTimer,
      playNextTrack,
      playPrevTrack,
      playSurahByNumber,
      autoPlayNext,
      setAutoPlayNext,
      nextTrackCountdown,
      cancelNextTrackCountdown,
      skipNextTrackCountdown
  }), [
      currentTrack, isPlaying, progress, duration, currentTime, playbackRate, 
      sleepTimer, autoPlayNext, nextTrackCountdown
  ]);

  return (
    <GlobalAudioContext.Provider value={contextValue}>
      {children}
    </GlobalAudioContext.Provider>
  );
};

export const useGlobalAudio = () => {
  const context = useContext(GlobalAudioContext);
  if (context === undefined) {
    throw new Error('useGlobalAudio must be used within a GlobalAudioProvider');
  }
  return context;
};
