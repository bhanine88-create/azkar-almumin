import { BackButton } from './ui/BackButton';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Coordinates, CalculationMethod, PrayerTimes as AdhanTimes, Madhab } from 'adhan';
// `city-timezones` is imported dynamically inside fetchTimes — see the comment
// there. It is 1.4 MB and only one rarely-taken branch needs it.
import { Sun, 
  Moon, 
  Sunrise, 
  Sunset, 
  Settings2, 
  Sliders, 
  X, 
  Quote, 
  Sparkles, 
  BookOpen, 
  CheckCircle2, 
  Volume2, 
  Search, 
  MapPin, 
  Clock, 
  Navigation, 
  Plus, 
  Minus, 
  Calendar, 
  Info,
  ChevronRight,
  Compass,
  AlertCircle,
  Globe,
  Bell,
  BellOff,
  VolumeX,
  Heart } from 'lucide-react';
import { cn, getDayName, getHijriDate, getGregorianDate } from '../lib/utils';
import { useAppContext } from '../AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from '../i18n';
import { useSmartNavigation } from "../lib/navigation";
import { NOTIFICATION_SOUNDS } from '../constants';
import { safeLocalStorageGetItem, safeLocalStorageSetItem, safeLocalStorageRemoveItem } from "../utils/storage";

const PRAYER_NAMES: Record<string, { ar: string; icon: React.ReactNode }> = {
  Fajr: { ar: 'الفجر', icon: <Sunrise size={20} /> },
  Sunrise: { ar: 'الشروق', icon: <Sun size={20} /> },
  Dhuhr: { ar: 'الظهر', icon: <Sun size={20} /> },
  Asr: { ar: 'العصر', icon: <Sun size={20} /> },
  Maghrib: { ar: 'المغرب', icon: <Sunset size={20} /> },
  Isha: { ar: 'العشاء', icon: <Moon size={20} /> },
};

const PRAYER_KEYS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

const SPIRITUAL_INSIGHTS = [
  { type: 'verse', text: 'إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا', source: 'سورة النساء - 103' },
  { type: 'hadith', text: 'أقرب ما يكون العبد من ربه وهو ساجد، فأكثروا الدعاء', source: 'صحيح مسلم' },
  { type: 'verse', text: 'وَأَقِمِ الصَّلَاةَ لِذِكْرِي', source: 'سورة طه - 14' },
  { type: 'hadith', text: 'الصلاة نور، والصدقة برهان، والصبر ضياء', source: 'صحيح مسلم' },
  { type: 'verse', text: 'حَافِظُوا عَلَى الصَّلَوَاتِ وَالصَّلَاةِ الْوُسْطَىٰ', source: 'سورة البقرة - 238' },
  { type: 'hadith', text: 'جُعلت قرة عيني في الصلاة', source: 'رواه النسائي وأحمد' },
  { type: 'verse', text: 'وَاسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ ۚ وَإِنَّهَا لَكَبِيرَةٌ إِلَّا عَلَى الْخَاشِعِينَ', source: 'سورة البقرة - 45' },
  { type: 'verse', text: 'وَأَقِيمُوا الصَّلَاةَ وَآتُوا الزَّكَاةَ وَارْكَعُوا مَعَ الرَّاكِعِينَ', source: 'سورة البقرة - 43' },
  { type: 'verse', text: 'يَا أَيُّهَا الَّذِينَ آمَنُوا اسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ', source: 'سورة البقرة - 153' },
  { type: 'verse', text: 'قَدْ أَفْلَحَ الْمُؤْمِنُونَ * الَّذِينَ هُمْ فِي صَلَاتِهِمْ خَاشِعُونَ', source: 'سورة المؤمنون - 1-2' },
  { type: 'verse', text: 'أَتْلُ مَا أُوحِيَ إِلَيْكَ مِنَ الْكِتَابِ وَأَقِمِ الصَّلَاةَ ۖ إِنَّ الصَّلَاةَ تَنْهَىٰ عَنِ الْفَحْشَاءِ وَالْمُنكَرِ', source: 'سورة العنكبوت - 45' },
  { type: 'hadith', text: 'بين الرجل وبين الشرك والكفر ترك الصلاة', source: 'صحيح مسلم' },
  { type: 'hadith', text: 'أول ما يحاسب به العبد يوم القيامة من عمله صلاته', source: 'رواه الترمذي' },
  { type: 'hadith', text: 'من صلى البردين دخل الجنة', source: 'صحيح البخاري ومسلم' },
  { type: 'hadith', text: 'من صلى العشاء في جماعة فكأنما قام نصف الليل، ومن صلى الصبح في جماعة فكأنما صلى الليل كله', source: 'صحيح مسلم' },
];

const PRAYER_THEMES: Record<string, { id: string; name: string; bg: string; accent: string; text: string }> = {
  Fajr: { id: 'fajr', name: 'الفجر', bg: 'from-emerald-600 via-teal-700 to-teal-900', accent: 'text-emerald-300', text: 'text-white' },
  Sunrise: { id: 'sunrise', name: 'الشروق', bg: 'from-amber-400 via-orange-500 to-amber-600', accent: 'text-yellow-200', text: 'text-slate-900' },
  Dhuhr: { id: 'dhuhr', name: 'الظهر', bg: 'from-sky-500 via-blue-600 to-indigo-800', accent: 'text-sky-300', text: 'text-white' },
  Asr: { id: 'asr', name: 'العصر', bg: 'from-orange-500 via-amber-600 to-amber-800', accent: 'text-amber-200', text: 'text-white' },
  Maghrib: { id: 'maghrib', name: 'المغرب', bg: 'from-indigo-600 via-purple-700 to-slate-900', accent: 'text-indigo-300', text: 'text-white' },
  Isha: { id: 'isha', name: 'العشاء', bg: 'from-slate-800 via-slate-900 to-blue-950', accent: 'text-blue-300', text: 'text-white' },
};

export const PrayerTimes: React.FC = () => {
  const { navigate, goBack } = useSmartNavigation();
  const { settings, updateSettings, progress, addWorshipActivity, updateProgress } = useAppContext();
  const { t, currentLang } = useTranslation(settings.appLanguage);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [city, setCity] = useState(safeLocalStorageGetItem('prayer_city') || 'Makkah');
  const [country, setCountry] = useState(safeLocalStorageGetItem('prayer_country') || 'SA');
  
  const [lat, setLat] = useState<string | null>(safeLocalStorageGetItem('prayer_lat'));
  const [lng, setLng] = useState<string | null>(safeLocalStorageGetItem('prayer_lng'));
  const [useGPS, setUseGPS] = useState(safeLocalStorageGetItem('prayer_use_gps') === 'true');
  
  const method = settings.prayerCalcMethod || '4';
  const asrMethod = settings.prayerAsrMethod || '0';
  const [cityInput, setCityInput] = useState(city);
  const [countryInput, setCountryInput] = useState(country);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);

  const [locationMessage, setLocationMessage] = useState<{ text: string; type: 'success' | 'error' | 'loading' | null }>({ text: '', type: null });

  // Autocomplete search states and methods
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  const handleSearchInputChange = async (val: string) => {
    setSearchQuery(val);
    if (val.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(val.trim())}&count=6&language=ar`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.results || []);
      }
    } catch (err) {
      console.warn('Geocoding search failed:', err);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectCity = async (item: any) => {
    const finalCity = item.name;
    const finalCountry = item.country || '';
    const newLat = item.latitude.toString();
    const newLng = item.longitude.toString();
    const timezone = item.timezone || '';

    setCity(finalCity);
    setCountry(finalCountry);
    setCityInput(finalCity);
    setCountryInput(finalCountry);
    setLat(newLat);
    setLng(newLng);
    setUseGPS(false);
    safeLocalStorageSetItem('prayer_use_gps', 'false');
    safeLocalStorageSetItem('prayer_city', finalCity);
    safeLocalStorageSetItem('prayer_country', finalCountry);
    safeLocalStorageSetItem('prayer_lat', newLat);
    safeLocalStorageSetItem('prayer_lng', newLng);
    if (timezone) {
      safeLocalStorageSetItem('prayer_timezone', timezone);
    } else {
      safeLocalStorageRemoveItem('prayer_timezone');
    }

    setSearchQuery('');
    setSearchResults([]);

    await fetchTimes(finalCity, finalCountry, method, asrMethod, settings.hijriOffset || 0, false, newLat, newLng);

    setLocationMessage({ 
      text: `تم بنجاح تحديث الموقع والمواقيت إلى: ${finalCity}، ${finalCountry}`, 
      type: 'success' 
    });
    setTimeout(() => setLocationMessage({ text: '', type: null }), 5000);
  };

  // Auto-detect location on first load if not initialized
  useEffect(() => {
    const hasInitialized = safeLocalStorageGetItem('prayer_initialized');
    if (!hasInitialized && !lat && !lng) {
      safeLocalStorageSetItem('prayer_initialized', 'true');
      detectLocation('ip');
    }
  }, [lat, lng]);

  useEffect(() => {
    setCityInput(city);
    setCountryInput(country);
  }, [city, country]);

  // Live ticking clock state
  const [liveTime, setLiveTime] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Audio preview play state
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  const handleTogglePlayAudio = (soundUrl: string, soundId: string) => {
    if (playingAudioId === soundId) {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
        previewAudioRef.current = null;
      }
      setPlayingAudioId(null);
    } else {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
      const audio = new Audio(soundUrl);
      audio.play().catch(err => console.warn('Could not play audio preview:', err));
      previewAudioRef.current = audio;
      setPlayingAudioId(soundId);
      audio.onended = () => setPlayingAudioId(null);
    }
  };

  useEffect(() => {
    return () => {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
    };
  }, []);

  // Qibla direction live calculation helper
  const resolvedQiblaAngle = useMemo(() => {
    const latitudeNum = lat ? parseFloat(lat) : 21.422487;
    const longitudeNum = lng ? parseFloat(lng) : 39.826206;
    
    const φ1 = latitudeNum * Math.PI / 180;
    const λ1 = longitudeNum * Math.PI / 180;
    const φ2 = 21.422487 * Math.PI / 180;
    const λ2 = 39.826206 * Math.PI / 180;

    const y = Math.sin(λ2 - λ1);
    const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);
    const qiblaAngle = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
    return Math.round(qiblaAngle);
  }, [lat, lng]);

  const resolvedKaabaDistance = useMemo(() => {
    const latitudeNum = lat ? parseFloat(lat) : 21.422487;
    const longitudeNum = lng ? parseFloat(lng) : 39.826206;
    
    const R = 6371; // km
    const dLat = (21.422487 - latitudeNum) * Math.PI / 180;
    const dLon = (39.826206 - longitudeNum) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(latitudeNum * Math.PI / 180) * Math.cos(21.422487 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round(R * c);
  }, [lat, lng]);

  const [simulatedCompassHeading, setSimulatedCompassHeading] = useState<number>(0);

  // Religious times (Midnight, Last Third of night, Duha start, Imsak)
  const religiousMacroTimes = useMemo(() => {
    if (!data?.timings) return null;
    const timings = data.timings;
    
    const parseTimeToMinutes = (timeStr: string) => {
      const cleanStr = timeStr.split(' ')[0];
      let [h, m] = cleanStr.split(':').map(Number);
      const isPM = timeStr.toLowerCase().includes('pm');
      const isAM = timeStr.toLowerCase().includes('am');
      if (isPM && h < 12) h += 12;
      if (isAM && h === 12) h = 0;
      return h * 60 + m;
    };

    const formatMinutesToTime = (totalMinutes: number) => {
      let cleanMin = Math.round(totalMinutes) % 1440;
      if (cleanMin < 0) cleanMin += 1440;
      const h = Math.floor(cleanMin / 60);
      const m = cleanMin % 60;
      const isPm = h >= 12;
      const displayH = h % 12 === 0 ? 12 : h % 12;
      const amPm = isPm ? 'م' : 'ص';
      return `${displayH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${amPm}`;
    };

    try {
      const maghribMin = parseTimeToMinutes(timings.Maghrib || '19:00');
      let fajrMin = parseTimeToMinutes(timings.Fajr || '04:30');
      
      if (fajrMin < maghribMin) {
        fajrMin += 1440;
      }

      const nightDuration = fajrMin - maghribMin;
      const midnightMinutes = maghribMin + (nightDuration / 2);
      const lastThirdMinutes = maghribMin + (nightDuration * 2 / 3);
      
      const sunriseMin = parseTimeToMinutes(timings.Sunrise || '06:00');
      const duhaMin = sunriseMin + 15;

      const rawFajrMin = parseTimeToMinutes(timings.Fajr || '04:30');
      const imsakMin = rawFajrMin - 10;

      return {
        imsak: formatMinutesToTime(imsakMin),
        duha: formatMinutesToTime(duhaMin),
        midnight: formatMinutesToTime(midnightMinutes),
        lastThird: formatMinutesToTime(lastThirdMinutes)
      };
    } catch (err) {
      console.warn("Religious macro times calculation error:", err);
      return null;
    }
  }, [data]);

  // Ticker countdown state
  const [timeRemaining, setTimeRemaining] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    totalSeconds: number;
    maxSeconds: number;
    nextPrayerKey: string;
    currentPrayerKey: string;
    progress: number;
  } | null>(null);

  const [activeTab, setActiveTab] = useState<'today' | 'weekly' | 'calibration'>('today');

  const activities = progress.worshipTracker?.activities || [];
  const todayStr = new Date().toISOString().split('T')[0];
  const completedPrayersToday = activities
    .filter(a => a.category === 'prayer' && a.date.startsWith(todayStr))
    .map(a => a.name);

  const insight = useMemo(() => {
    const allInsights = [...SPIRITUAL_INSIGHTS, ...(settings.customSpiritualInsights || [])] as typeof SPIRITUAL_INSIGHTS;
    return allInsights[Math.floor(Math.random() * allInsights.length)];
  }, []);

  // Helper calculation definitions
  const applyOffsets = (timings: any) => {
    const prayerOffsets = settings.prayerOffsets || {};
    Object.keys(PRAYER_NAMES).forEach(prayerKey => {
      if (timings[prayerKey]) {
        const timePart = timings[prayerKey].split(' ')[0];
        let [h, min] = timePart.split(':').map(Number);
        const isPM = timings[prayerKey].toLowerCase().includes('pm');
        const isAM = timings[prayerKey].toLowerCase().includes('am');
        if (isPM && h < 12) h += 12;
        if (isAM && h === 12) h = 0;
        
        const tempDate = new Date();
        tempDate.setHours(h, min, 0, 0);
        
        const individualOffset = prayerOffsets[prayerKey] || 0;
        if (individualOffset !== 0) {
          tempDate.setMinutes(tempDate.getMinutes() + individualOffset);
        }
        
        if (settings.prayerDaylightSaving) {
          tempDate.setHours(tempDate.getHours() + 1);
        }
        
        timings[prayerKey] = `${tempDate.getHours().toString().padStart(2, '0')}:${tempDate.getMinutes().toString().padStart(2, '0')}`;
      }
    });
  };

  // helper to get calculation method
  const getCalculationMethod = (methodValue: string) => {
    switch (methodValue) {
      case '1': return CalculationMethod.Egyptian();
      case '2': return CalculationMethod.NorthAmerica();
      case '3': return CalculationMethod.MuslimWorldLeague();
      case '4': return CalculationMethod.UmmAlQura();
      case '5': return CalculationMethod.Egyptian();
      case '8': return CalculationMethod.Dubai();
      case '9': return CalculationMethod.Kuwait();
      case '10': return CalculationMethod.Qatar();
      case '11': return CalculationMethod.Singapore();
      case '12': return CalculationMethod.Turkey();
      default: return CalculationMethod.MuslimWorldLeague();
    }
  };

  const toArabicDigits = (str: string | number) => {
    if (str === null || str === undefined) return '';
    const numMap: Record<string, string> = {
      '0': '٠', '1': '١', '2': '٢', '3': '٣', '4': '٤',
      '5': '٥', '6': '٦', '7': '٧', '8': '٨', '9': '٩'
    };
    return str.toString().replace(/[0-9]/g, (w) => numMap[w] || w);
  };

  const fetchTimes = async (c: string, co: string, m: string, school: string, offset: number, currUseGPS: boolean, gpsLat?: string, gpsLng?: string) => {
    if (settings.prayerManualMode) {
      setData({ timings: settings.prayerManualTimes });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      let currentLat = gpsLat || lat;
      let currentLng = gpsLng || lng;
      let tz = safeLocalStorageGetItem('prayer_timezone') || Intl.DateTimeFormat().resolvedOptions().timeZone;

      const hasCoords = !!currentLat && !!currentLng;

      if (!hasCoords && !currUseGPS) {
        // Find city coords using city-timezones.
        //
        // Loaded on demand, not imported at the top of the file. The package is
        // a 1.4 MB table of every city on earth, and this is the only thing in
        // the app that reads it — reached only when someone has typed a city by
        // hand and has no stored coordinates yet. As a static import it rode
        // along with the PrayerTimes chunk, which App.tsx preloads a second and
        // a half into every launch, so the whole table was fetched and parsed on
        // the main thread exactly while the user was trying to scroll the home
        // screen. `fetchTimes` is already async, so awaiting it here is free.
        const { default: cityTimezones } = await import('city-timezones');
        const cityData = cityTimezones.lookupViaCity(c);
        const matched = cityData.find(d => 
          d.country.toLowerCase().includes(co.toLowerCase()) || 
          co.toLowerCase().includes(d.country.toLowerCase())
        ) || cityData[0];

        if (matched) {
          currentLat = matched.lat.toString();
          currentLng = matched.lng.toString();
          tz = matched.timezone || tz;
          safeLocalStorageSetItem('prayer_city', c);
          safeLocalStorageSetItem('prayer_country', co);
          safeLocalStorageSetItem('prayer_use_gps', 'false');
          safeLocalStorageSetItem('prayer_lat', currentLat);
          safeLocalStorageSetItem('prayer_lng', currentLng);
          safeLocalStorageSetItem('prayer_timezone', tz);
        } else {
          // Default to Mecca coordinates
          currentLat = "21.4225";
          currentLng = "39.8262";
          tz = "Asia/Riyadh";
          setLocationMessage({ text: 'لم يتم العثور على المدينة، تم استخدام توقيت مكة المكرمة افتراضياً للعمل بدون إنترنت', type: 'error' });
          setTimeout(() => setLocationMessage({ text: '', type: null }), 6000);
        }
      } else if (currUseGPS) {
        safeLocalStorageSetItem('prayer_use_gps', 'true');
      }

      if (!currentLat || !currentLng) {
        throw new Error("Missing coordinates");
      }

      // 1. Try to fetch 100% accurate online timings from AlAdhan API first
      let apiWorked = false;
      let todayTimings: any = null;
      let apiHijriObj: any = null;

      try {
        const d = new Date();
        const dateStr = `${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()}`;
        const url = `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${currentLat}&longitude=${currentLng}&method=${m}&school=${school}`;
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);
        
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        
        if (res.ok) {
          const json = await res.json();
          if (json.code === 200 && json.data?.timings) {
            todayTimings = {
              Fajr: json.data.timings.Fajr?.split(' ')[0] || "04:00",
              Sunrise: json.data.timings.Sunrise?.split(' ')[0] || "05:30",
              Dhuhr: json.data.timings.Dhuhr?.split(' ')[0] || "12:00",
              Asr: json.data.timings.Asr?.split(' ')[0] || "15:30",
              Maghrib: (json.data.timings.Maghrib || json.data.timings.Sunset)?.split(' ')[0] || "18:00",
              Isha: json.data.timings.Isha?.split(' ')[0] || "19:30",
            };
            applyOffsets(todayTimings);
            
            // Extract hijri date
            const hj = json.data.date.hijri;
            apiHijriObj = {
              day: toArabicDigits(hj.day),
              month: { ar: hj.month.ar },
              year: toArabicDigits(hj.year)
            };

            // Capture correct timezone from API
            const apiTz = json.data.date.timezone;
            if (apiTz) {
              tz = apiTz;
              safeLocalStorageSetItem('prayer_timezone', apiTz);
            }

            setData({
              timings: todayTimings,
              date: {
                date: `${d.getDate().toString().padStart(2, '0')}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getFullYear()}`,
                weekday: { ar: new Intl.DateTimeFormat('ar-SA', { weekday: 'long' }).format(d) }
              },
              hijri: apiHijriObj
            });
            apiWorked = true;
          }
        }
      } catch (err) {
        console.warn('AlAdhan API fetch failed, utilizing robust offline calculation:', err);
      }

      const coordinates = new Coordinates(parseFloat(currentLat), parseFloat(currentLng));
      const params = getCalculationMethod(m);
      params.madhab = school === '1' ? Madhab.Hanafi : Madhab.Shafi;
      
      const generateTimingsForDate = (date: Date) => {
        const pt = new AdhanTimes(coordinates, date, params);
        const fmt = new Intl.DateTimeFormat('en-US', {
          hour: '2-digit', minute: '2-digit', hour12: false, timeZone: tz
        });
        
        const hijriDay = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', { day: 'numeric' }).format(date);
        const hijriMonth = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', { month: 'long' }).format(date);
        const hijriYear = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', { year: 'numeric' }).format(date);
        
        const formatTime = (d: Date) => fmt.format(d);
        
        const timings = {
          Fajr: formatTime(pt.fajr),
          Sunrise: formatTime(pt.sunrise),
          Dhuhr: formatTime(pt.dhuhr),
          Asr: formatTime(pt.asr),
          Maghrib: formatTime(pt.maghrib),
          Isha: formatTime(pt.isha),
        };
        applyOffsets(timings);
        
        return {
          date: {
             date: `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`,
             weekday: { ar: new Intl.DateTimeFormat('ar-SA', { weekday: 'long' }).format(date) }
          },
          hijri: {
            day: hijriDay,
            month: { ar: hijriMonth },
            year: hijriYear
          },
          timings
        };
      };

      if (!apiWorked) {
        const todayData = generateTimingsForDate(new Date());
        setData({
          timings: todayData.timings,
          date: todayData.date,
          hijri: todayData.hijri
        });
      }

      // Generate 7 days forecast offline (seamlessly integrating today's verified API results if available)
      const nextDays = [];
      for (let i = 0; i < 7; i++) {
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + i);
        if (i === 0 && apiWorked && todayTimings && apiHijriObj) {
          const d = new Date();
          nextDays.push({
            date: {
              date: `${d.getDate().toString().padStart(2, '0')}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getFullYear()}`,
              weekday: { ar: new Intl.DateTimeFormat('ar-SA', { weekday: 'long' }).format(d) }
            },
            hijri: apiHijriObj,
            timings: todayTimings
          });
        } else {
          nextDays.push(generateTimingsForDate(targetDate));
        }
      }
      setWeeklyData(nextDays);

    } catch (e: any) {
      console.warn('Prayer times offline calculation failed:', e.message);
      setLocationMessage({ text: 'حدث خطأ في حساب المواقيت. تأكد من تحديد مدينتك أو الموقع بشكل صحيح.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimes(city, country, method, asrMethod, settings.hijriOffset || 0, useGPS, lat || undefined, lng || undefined);
  }, [city, country, method, asrMethod, settings.hijriOffset, settings.prayerOffsets, settings.prayerManualMode, settings.prayerManualTimes, useGPS, settings.prayerDaylightSaving, lat, lng]);

  // Handle auto Geolocation detection via GPS
  const detectLocation = async (type: 'ip' | 'gps') => {
    setLocationMessage({ 
      text: type === 'ip' ? 'جاري تحديد موقعك الجغرافي تلقائياً عبر الإنترنت...' : 'جاري الاتصال بالأقمار الصناعية لتحديد موقعك الجغرافي بدقة عبر GPS...', 
      type: 'loading' 
    });

    if (type === 'gps') {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const latitude = position.coords.latitude.toFixed(6);
            const longitude = position.coords.longitude.toFixed(6);
            setLat(latitude);
            setLng(longitude);
            safeLocalStorageSetItem('prayer_lat', latitude);
            safeLocalStorageSetItem('prayer_lng', longitude);
            safeLocalStorageSetItem('prayer_use_gps', 'true');
            setUseGPS(true);
            updateSettings({ prayerManualMode: false });

            let detectedCity = '';
            let detectedCountry = '';

            try {
              // Fetch reverse geocoding with zoom=10 to find city and country
              const geoRes = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=11&accept-language=ar,en`
              );
              if (geoRes.ok) {
                const geoData = await geoRes.json();
                const address = geoData.address || {};
                // Nominatim returns dynamic keys based on level of precision
                detectedCity = address.city || address.town || address.village || address.suburb || address.city_district || address.county || address.state || '';
                detectedCountry = address.country || '';
              }
            } catch (err) {
              console.warn('Reverse geocoding error:', err);
            }

            // Fallback to coordinates if empty or failed
            if (!detectedCity) {
              detectedCity = `${latitude}`;
              detectedCountry = `GPS (${longitude})`;
            }

            setCity(detectedCity);
            setCountry(detectedCountry);
            setCityInput(detectedCity);
            setCountryInput(detectedCountry);
            safeLocalStorageSetItem('prayer_city', detectedCity);
            safeLocalStorageSetItem('prayer_country', detectedCountry);

            await fetchTimes(detectedCity, detectedCountry, method, asrMethod, settings.hijriOffset || 0, true, latitude, longitude);

            setLocationMessage({ 
              text: `تم تحديد الموقع بنجاح! الموقع الحالي: ${detectedCity}، ${detectedCountry}`, 
              type: 'success' 
            });
            setTimeout(() => setLocationMessage({ text: '', type: null }), 5000);
          },
          (error) => {
            console.warn('Geolocation error:', error);
            let errMsg = 'تعذر كشف إحداثيات الـ GPS. يرجى تفعيل إذن الموقع الجغرافي بالمتصفح.';
            if (error.code === error.PERMISSION_DENIED) {
              errMsg = 'تم رفض إذن تحديد الموقع. يرجى تفعيله من إعدادات المتصفح.';
            }
            setLocationMessage({ text: errMsg, type: 'error' });
            setTimeout(() => setLocationMessage({ text: '', type: null }), 5000);
          },
          { enableHighAccuracy: true, timeout: 8000 }
        );
      } else {
        setLocationMessage({ text: 'المتصفح لا يدعم تحديد الموقع الذكي.', type: 'error' });
        setTimeout(() => setLocationMessage({ text: '', type: null }), 5000);
      }
    } else {
      // IP-based quick geolocation with redundant providers
      let success = false;
      const providers = [
        async () => {
          const res = await fetch('https://freeipapi.com/api/json');
          if (!res.ok) throw new Error('freeipapi failed');
          const data = await res.json();
          if (!data.cityName || !data.countryName) throw new Error('incomplete freeipapi data');
          return {
            city: data.cityName,
            country: data.countryName,
            lat: data.latitude?.toString(),
            lng: data.longitude?.toString()
          };
        },
        async () => {
          const res = await fetch('https://ipapi.co/json/');
          if (!res.ok) throw new Error('ipapi failed');
          const data = await res.json();
          if (!data.city || !data.country_name) throw new Error('incomplete ipapi.co data');
          return {
            city: data.city,
            country: data.country_name,
            lat: data.latitude?.toString(),
            lng: data.longitude?.toString()
          };
        },
        async () => {
          const res = await fetch('https://ipinfo.io/json');
          if (!res.ok) throw new Error('ipinfo failed');
          const data = await res.json();
          const [ipLat, ipLng] = (data.loc || '').split(',');
          if (!data.city) throw new Error('incomplete ipinfo data');
          return {
            city: data.city,
            country: data.country || 'SA',
            lat: ipLat,
            lng: ipLng
          };
        }
      ];

      for (const provider of providers) {
        try {
          const result = await provider();
          if (result && result.city) {
            let finalCity = result.city;
            let finalCountry = result.country;
            setLat(result.lat || null);
            setLng(result.lng || null);

            if (result.lat && result.lng) {
              safeLocalStorageSetItem('prayer_lat', result.lat);
              safeLocalStorageSetItem('prayer_lng', result.lng);
              // Background reverse geocode using OSM to resolve in Arabic if possible
              try {
                const geoRes = await fetch(
                  `https://nominatim.openstreetmap.org/reverse?format=json&lat=${result.lat}&lon=${result.lng}&zoom=11&accept-language=ar`
                );
                if (geoRes.ok) {
                  const geoData = await geoRes.json();
                  const address = geoData.address || {};
                  finalCity = address.city || address.town || address.village || address.suburb || address.city_district || finalCity;
                  finalCountry = address.country || finalCountry;
                }
              } catch (bgErr) {
                console.warn('Background reverse geocode failed:', bgErr);
              }
            }

            setCity(finalCity);
            setCountry(finalCountry);
            setCityInput(finalCity);
            setCountryInput(finalCountry);
            setUseGPS(false);
            safeLocalStorageSetItem('prayer_use_gps', 'false');
            safeLocalStorageSetItem('prayer_city', finalCity);
            safeLocalStorageSetItem('prayer_country', finalCountry);

            await fetchTimes(finalCity, finalCountry, method, asrMethod, settings.hijriOffset || 0, false, result.lat || undefined, result.lng || undefined);

            setLocationMessage({ 
              text: `تم التعرف تلقائياً على مدينتك: ${finalCity}، ${finalCountry}`, 
              type: 'success' 
            });
            setTimeout(() => setLocationMessage({ text: '', type: null }), 5000);
            success = true;
            break;
          }
        } catch (err) {
          console.warn('IP geolocor provider error, switching fallback:', err);
        }
      }

      if (!success) {
        setLocationMessage({ 
          text: 'تعذر تحديد الموقع الجغرافي تلقائياً عبر الإنترنت. يمكنك استخدام تحديد الموقع بدقة عبر GPS أو كتابتها يدوياً.', 
          type: 'error' 
        });
        setTimeout(() => setLocationMessage({ text: '', type: null }), 6000);
      }
    }
  };

  const handleGPSDetect = () => {
    detectLocation('gps');
  };

  // Real-time ticking effect
  const completedPrayersTodayRef = useRef(completedPrayersToday);
  useEffect(() => {
    completedPrayersTodayRef.current = completedPrayersToday;
  }, [completedPrayersToday]);

  useEffect(() => {
    if (!data?.timings) return;

    const tick = () => {
      const now = new Date();
      
      const currentMs = now.getTime();
      const pY = now.getFullYear();
      const pM = now.getMonth() + 1;
      const pD = now.getDate();
      
      const getPrayerDate = (timeStr: string, isTomorrow = false, isYesterday = false) => {
        const d = new Date();
        if (isTomorrow) d.setDate(d.getDate() + 1);
        if (isYesterday) d.setDate(d.getDate() - 1);
        
        const cleanTimeStr = timeStr.split(' ')[0];
        let [h, m] = cleanTimeStr.split(':').map(Number);
        
        // Handle unexpected AM/PM formats gracefully
        const isPM = timeStr.toLowerCase().includes('pm');
        const isAM = timeStr.toLowerCase().includes('am');
        if (isPM && h < 12) h += 12;
        if (isAM && h === 12) h = 0;

        d.setHours(h, m, 0, 0);
        return d;
      };

      const milestones: { key: string; date: Date }[] = [];

      // Add milestones of Yesterday, Today, and Tomorrow (only obligatory prayers)
      PRAYER_KEYS.forEach(k => {
        if (data.timings[k]) {
          milestones.push({ key: k, date: getPrayerDate(data.timings[k], false, true) });
          milestones.push({ key: k, date: getPrayerDate(data.timings[k], false, false) });
          milestones.push({ key: k, date: getPrayerDate(data.timings[k], true, false) });
        }
      });

      // Sort by date
      milestones.sort((a, b) => a.date.getTime() - b.date.getTime());

      // Next uncompleted prayer
      let nextIdx = milestones.findIndex(item => {
        if (item.date.getTime() <= currentMs) return false;
        
        // Check if this milestone is completed
        const itemDateStr = `${item.date.getFullYear()}-${(item.date.getMonth() + 1).toString().padStart(2, '0')}-${item.date.getDate().toString().padStart(2, '0')}`;
        const todayLocal = new Date(pY, pM - 1, pD);
        const todayLocalStr = `${todayLocal.getFullYear()}-${(todayLocal.getMonth() + 1).toString().padStart(2, '0')}-${todayLocal.getDate().toString().padStart(2, '0')}`;
        
        if (itemDateStr === todayLocalStr) {
          const arName = PRAYER_NAMES[item.key as keyof typeof PRAYER_NAMES]?.ar;
          return !completedPrayersTodayRef.current.includes(arName);
        }
        
        return true; // Future days are never completed
      });

      if (nextIdx === -1) nextIdx = milestones.length - 1;

      const nextItem = milestones[nextIdx];
      const prevItem = nextIdx > 0 ? milestones[nextIdx - 1] : null;

      if (nextItem && prevItem) {
        const total = nextItem.date.getTime() - prevItem.date.getTime();
        const elapsed = currentMs - prevItem.date.getTime();
        const progressPercent = Math.min(100, Math.max(0, (elapsed / total) * 100));
        const remainingMs = nextItem.date.getTime() - currentMs;

        const h = Math.floor(remainingMs / (1000 * 60 * 60));
        const m = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((remainingMs % (1000 * 60)) / 1000);

        setTimeRemaining({
          hours: h,
          minutes: m,
          seconds: s,
          totalSeconds: Math.floor(remainingMs / 1000),
          maxSeconds: Math.floor(total / 1000),
          nextPrayerKey: nextItem.key,
          currentPrayerKey: prevItem.key,
          progress: progressPercent
        });
      }
    };

    tick();
    const interval = setInterval(tick, 1000);

    return () => clearInterval(interval);
  }, [data]);

  const handleMarkAsDone = (prayerName: string) => {
    const isDone = completedPrayersToday.includes(prayerName);
    
    if (isDone) {
      // Remove today's logged activity for this prayer
      updateProgress(prev => {
        const worshipTracker = prev.worshipTracker || { activities: [] };
        const updatedActivities = worshipTracker.activities.filter(a => {
          const isTarget = a.category === 'prayer' && a.name === prayerName && a.date.startsWith(todayStr);
          return !isTarget;
        });
        return {
          ...prev,
          worshipTracker: {
            ...worshipTracker,
            activities: updatedActivities
          }
        };
      });
      
      // Dispatch beautiful info toast
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { 
          message: `تم إلغاء تحديد صلاة ${prayerName}`, 
          type: 'info' 
        } 
      }));
    } else {
      // Add the activity
      addWorshipActivity({
        name: prayerName,
        category: 'prayer',
        value: 1
      });
      
      // Dispatch beautiful success toast with standard encouraging text
      const prayersDuas = [
        "تقبل الله منكم صالح الأعمال وصلاة مقبولة إن شاء الله",
        "صلاة مقبولة وذنب مغفور وتجارة لن تبور بإذن الله",
        "بارك الله في صلاتكم وثبتكم على الحق والهدى",
        "جعله الله في ميزان حسناتكم ونوراً لكم في الدنيا والآخرة"
      ];
      const randomDua = prayersDuas[Math.floor(Math.random() * prayersDuas.length)];
      
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { 
          message: `تم تأكيد صلاة ${prayerName} بنجاح! ${randomDua}`, 
          type: 'success' 
        } 
      }));
    }
  };

  const updateOffset = (prayerKey: string, val: number) => {
    const currentOffsets = settings.prayerOffsets || {};
    const newOffsets = { ...currentOffsets, [prayerKey]: (currentOffsets[prayerKey] || 0) + val };
    updateSettings({ prayerOffsets: newOffsets });
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cityInput.trim()) return;

    setLocationMessage({ text: 'جاري البحث عن إحداثيات المدينة وتحديد التوقيت الدقيق...', type: 'loading' });
    try {
      const queryStr = `${cityInput.trim()} ${countryInput.trim()}`.trim();
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(queryStr)}&count=1&language=ar`);
      if (res.ok) {
        const data = await res.json();
        const results = data.results || [];
        if (results.length > 0) {
          const item = results[0];
          await handleSelectCity(item);
          return;
        }
      }
    } catch (err) {
      console.warn("Manual search coordinates retrieval failed", err);
    }

    // Fallback to original behavior if API queries fail
    const finalCity = cityInput.trim();
    const finalCountry = countryInput.trim();
    setCity(finalCity);
    setCountry(finalCountry);
    setUseGPS(false);
    safeLocalStorageSetItem('prayer_use_gps', 'false');
    safeLocalStorageSetItem('prayer_city', finalCity);
    safeLocalStorageSetItem('prayer_country', finalCountry);
    
    await fetchTimes(finalCity, finalCountry, method, asrMethod, settings.hijriOffset || 0, false);
    
    setLocationMessage({ text: `تم تحديث الموقع لمطابقة: ${finalCity}`, type: 'success' });
    setTimeout(() => setLocationMessage({ text: '', type: null }), 4000);
  };

  // Extract weekly forecast
  const getWeeklyForecast = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTime = today.getTime();

    const filtered = weeklyData.filter(day => {
      const parts = day.date.date.split('-');
      const d = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
      return d.getTime() >= todayTime;
    }).slice(0, 7);

    if (filtered.length > 0) return filtered;

    // Resilient fallback logic
    if (!data?.timings) return [];
    const fallbackList = [];
    const weekdays = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const datesFormatted = `${d.getDate().toString().padStart(2, '0')}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getFullYear()}`;
      
      fallbackList.push({
        date: {
          date: datesFormatted,
          day: d.getDate().toString(),
          weekday: { ar: weekdays[d.getDay()] }
        },
        hijri: {
          day: d.getDate().toString(),
          month: { ar: 'الشهور' },
          year: '1447'
        },
        timings: data.timings
      });
    }
    return fallbackList;
  };

  // Highlight themes
  const currentTheme = timeRemaining ? PRAYER_THEMES[timeRemaining.currentPrayerKey] || PRAYER_THEMES['Fajr'] : PRAYER_THEMES['Fajr'];

  const [newInsightType, setNewInsightType] = useState<'verse' | 'hadith'>('verse');
  const [newInsightText, setNewInsightText] = useState('');
  const [newInsightSource, setNewInsightSource] = useState('');

  const handleAddInsight = () => {
    if (!newInsightText.trim() || !newInsightSource.trim()) return;
    const newInsight = { type: newInsightType, text: newInsightText.trim(), source: newInsightSource.trim() };
    updateSettings({ customSpiritualInsights: [...(settings.customSpiritualInsights || []), newInsight] });
    setNewInsightText('');
    setNewInsightSource('');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-12 transition-colors duration-500">
      <header className="sticky top-0 z-40 p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BackButton />
            <h1 className="text-xl font-black">{t('prayer_times')}</h1>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleGPSDetect} 
              className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-teal-600 dark:text-teal-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="تحديد الموقع عبر GPS"
            >
              <Compass size={18} className={cn(locationMessage.type === 'loading' && "animate-spin")} />
            </button>
            <button 
              onClick={() => setShowSettings(true)} 
              className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <Sliders size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="p-4 max-w-2xl mx-auto pt-3 space-y-5">
        {/* GPS location notification banner toast */}
        <AnimatePresence>
          {locationMessage.text && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className={cn(
                "p-3.5 rounded-2xl flex items-center gap-2.5 text-xs font-bold leading-relaxed shadow-sm border",
                locationMessage.type === 'success' && "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-400 dark:bg-emerald-500/5",
                locationMessage.type === 'error' && "bg-rose-500/10 text-rose-700 border-rose-500/20 dark:text-rose-400 dark:bg-rose-500/5",
                locationMessage.type === 'loading' && "bg-teal-500/10 text-teal-700 border-teal-500/20 dark:text-teal-400 dark:bg-teal-500/5 animate-pulse"
              )}>
                {locationMessage.type === 'error' ? <AlertCircle size={16} /> : <Info size={16} />}
                <p className="flex-1 text-right">{locationMessage.text}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 space-y-3">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-400 font-black">جاري تحديث مواقيت الصلاة بدقة...</p>
          </div>
        ) : data ? (
          <>
            {/* Live Clock, Gregorian and Hijri header bar */}
            <div className="bg-gradient-to-l from-teal-900 via-teal-950 to-slate-900 text-white rounded-3xl p-5 shadow-lg border border-teal-800/20 relative overflow-hidden">
              <div 
                className="absolute inset-0 opacity-[0.05] mix-blend-overlay pointer-events-none" 
                style={{ backgroundImage: "url('/images/arabesque.png')" }} 
              />
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="text-right space-y-1">
                  <div className="flex items-center gap-1.5 justify-end text-[10px] uppercase font-black text-emerald-400 tracking-wider">
                    <span>{city}، {country}</span>
                    <MapPin size={11} />
                  </div>
                  <h2 className="text-xl font-black text-amber-200" style={{ fontFamily: "Amiri, serif" }}>
                    {getDayName(liveTime, currentLang)}، {getHijriDate(liveTime, settings.hijriOffset, currentLang)}
                  </h2>
                  <p className="text-xs text-slate-300 font-semibold">
                    {getGregorianDate(liveTime, currentLang)}
                  </p>
                </div>
                
                {/* Real-time Ticking Digital clock */}
                <div className="bg-black/25 backdrop-blur-md rounded-2xl px-5 py-2.5 border border-white/10 flex flex-col items-center justify-center self-center min-w-[150px]">
                  <span className="text-4xl font-mono text-amber-300 font-black tracking-widest drop-shadow-md">
                    {(() => {
                      return liveTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
                    })()}
                  </span>
                  <span className="text-[9px] text-teal-300/80 font-bold uppercase mt-1">توقيت الساعة الحالية</span>
                </div>
              </div>
            </div>


            {/* BEAUTIFUL NEXT EXPECTED PRAYER COUNTDOWN BANNER */}
            {(() => {
              if (!timeRemaining) return null;

              const nextKey = timeRemaining.nextPrayerKey;

              const getNextObligatory = (key: string): string => {
                if (key === 'Sunrise') return 'Dhuhr';
                return key;
              };

              const bannerPrayerKey = getNextObligatory(nextKey);
              const prayerTimeStr = data?.timings?.[bannerPrayerKey]?.split(' ')[0] || '--:--';

              return (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-3xl p-5 shadow-xl border relative overflow-hidden text-right transition-all duration-300 bg-gradient-to-br from-slate-900 via-teal-950 to-emerald-950 border-emerald-500/20 text-white"
                  dir="rtl"
                >
                  {/* Visual abstract overlay */}
                  <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />
                  <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute bottom-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
                  
                  <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-amber-300 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 animate-pulse">
                        <Sparkles size={10} />
                        <span>الصلاة القادمة المنتظرة</span>
                      </span>
                      
                      <h3 className="text-xl font-black text-slate-100 flex items-center gap-2 mt-1">
                        <span>صلاة {PRAYER_NAMES[bannerPrayerKey]?.ar || bannerPrayerKey}</span>
                        <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-lg text-teal-300 bg-teal-500/10">
                          أذان {prayerTimeStr}
                        </span>
                      </h3>
                    </div>

                    <div className="flex flex-col gap-1 items-start md:items-end text-right">
                      <p className="text-sm md:text-base text-slate-100 font-bold mb-1">
                        الوقت المتبقي لصلاة {PRAYER_NAMES[bannerPrayerKey]?.ar || bannerPrayerKey} هو
                      </p>
                      <div className="flex flex-wrap items-center gap-1.5 justify-end mt-1 text-lg md:text-xl font-black text-amber-300" dir="rtl">
                        {timeRemaining.hours > 0 && (
                          <>
                            <span>{timeRemaining.hours}</span>
                            <span className="text-sm font-bold text-amber-300/80">ساعة</span>
                            <span className="text-amber-300/50">و</span>
                          </>
                        )}
                        <span>{timeRemaining.minutes}</span>
                        <span className="text-sm font-bold text-amber-300/80">دقيقة</span>
                        <span className="text-amber-300/50">و</span>
                        <span className="text-rose-300">{timeRemaining.seconds}</span>
                        <span className="text-sm font-bold text-rose-300/80">ثانية</span>
                      </div>
                    </div>
                  </div>

                  {/* Micro Progress Bar */}
                  <div className="mt-4 w-full bg-white/5 h-1.5 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-300 rounded-full transition-all duration-1000"
                      style={{ width: `${timeRemaining.progress}%` }}
                    />
                  </div>
                </motion.div>
              );
            })()}


            {/* STUNNING PRAYER TIMES CAPSULES STRIP */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse-slow shadow-lg shadow-emerald-500/50" />
                  <span className="text-xs font-black uppercase text-slate-800 dark:text-slate-250 tracking-wider">مواقيت كبسولات ذكية لمدينة {city}</span>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    setLocationMessage({ text: 'جاري تحديث مواقيت الصلاة ومزامنتها الآن...', type: 'loading' });
                    try {
                      await fetchTimes(city, country, method, asrMethod, settings.hijriOffset || 0, useGPS, lat || undefined, lng || undefined);
                      setLocationMessage({ text: `تم بنجاح تحديث ومزامنة المواقيت لمدينة ${city}!`, type: 'success' });
                      setTimeout(() => setLocationMessage({ text: '', type: null }), 3000);
                    } catch (err) {
                      setLocationMessage({ text: 'حدث خطأ أثناء التحديث. الرجاء المحاولة مجدداً.', type: 'error' });
                      setTimeout(() => setLocationMessage({ text: '', type: null }), 4000);
                    }
                  }}
                  className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black bg-emerald-500/10 px-3 py-1.5 rounded-xl cursor-pointer hover:bg-emerald-500/20 active:scale-95 transition-all flex items-center gap-1.5 border border-emerald-500/20 shadow-sm"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>تحديث فوري</span>
                </button>
              </div>

              {/* Grid Layout of capsules - 5 columns on desktop, dynamic on mobile */}
              <div className="grid grid-cols-5 gap-1.5 sm:gap-2" dir="rtl">
                {PRAYER_KEYS.map((key) => {
                  const { ar, icon } = PRAYER_NAMES[key];
                  const isCurrent = timeRemaining?.currentPrayerKey === key;
                  const isNext = timeRemaining?.nextPrayerKey === key;
                  const isDone = completedPrayersToday.includes(ar);
                  const rawTime = data?.timings?.[key] || '--:--';
                  const prayerTime = rawTime.split(' ')[0];

                  return (
                    <motion.button
                      key={key}
                      onClick={() => handleMarkAsDone(ar)}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className={cn(
                        "flex flex-col items-center justify-center p-1.5 xs:p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border shadow-sm transition-all duration-300 relative overflow-hidden outline-none cursor-pointer text-center",
                        isDone
                          ? "bg-emerald-50 dark:bg-emerald-950/15 text-emerald-800 dark:text-emerald-300 border-emerald-100 dark:border-emerald-900/30"
                          : isCurrent
                            ? "bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-800 text-white border-emerald-400 ring-2 ring-emerald-500/15 shadow-md shadow-emerald-500/25"
                            : isNext
                              ? "bg-gradient-to-br from-amber-500/10 via-amber-600/5 to-transparent border-amber-400 ring-2 ring-amber-500/15 shadow-md dark:from-amber-950/30 dark:to-slate-900 text-slate-800 dark:text-slate-100"
                              : "bg-slate-50 dark:bg-slate-950/40 text-slate-700 dark:text-slate-300 border-slate-200/60 dark:border-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-900"
                      )}
                    >
                      {/* Active glowing indicator light inside the capsule */}
                      {!isDone && isCurrent && (
                        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-yellow-300 to-transparent" />
                      )}
                      {!isDone && isNext && (
                        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-amber-400 to-transparent animate-pulse" />
                      )}

                      {/* Icon with elegant style */}
                      <span className={cn(
                        "p-1 sm:p-1.5 rounded-full transition-all text-xs flex items-center justify-center mb-1 [&_svg]:w-3.5 [&_svg]:h-3.5 sm:[&_svg]:w-5 sm:[&_svg]:h-5",
                        isDone
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : isCurrent
                            ? "bg-white/20 text-white"
                            : isNext
                              ? "bg-amber-500/20 text-amber-650 dark:text-amber-400 animate-pulse"
                              : "bg-slate-200/50 dark:bg-slate-800 text-slate-400 dark:text-slate-500"
                      )}>
                        {icon}
                      </span>

                      {/* Content */}
                      <div className="flex flex-col items-center justify-center text-center">
                        <span className="text-[9px] sm:text-[10px] uppercase font-extrabold tracking-widest opacity-80">{ar}</span>
                        <span className="text-[10px] sm:text-[12px] font-mono font-black tracking-tight mt-0.5">{prayerTime}</span>
                      </div>

                      {/* State Badges inside the capsule pill */}
                      {isDone ? (
                        <span className="text-[7px] sm:text-[8px] font-black bg-emerald-50 text-emerald-700 p-0.5 rounded-full flex items-center justify-center mt-1">
                          <CheckCircle2 size={10} className="stroke-[3px]" />
                        </span>
                      ) : isCurrent ? (
                        <span className="text-[7px] sm:text-[7.5px] font-black bg-yellow-300 text-emerald-950 px-1 py-0.5 rounded-full uppercase tracking-tighter shadow-sm animate-pulse mt-1">
                          الآن
                        </span>
                      ) : isNext ? (
                        <span className="text-[7px] sm:text-[7.5px] font-black bg-amber-400 text-amber-950 px-1 py-0.5 rounded-full uppercase tracking-tighter shadow-sm animate-pulse mt-1">
                          المنتظرة
                        </span>
                      ) : null}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Smart Navigation Section Tabs */}
            <div className="flex bg-slate-200/50 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200/30 dark:border-slate-800/80">
              <button 
                onClick={() => setActiveTab('today')}
                className={cn(
                  "flex-1 py-3 rounded-xl text-xs font-black transition-all",
                  activeTab === 'today' ? "bg-white dark:bg-slate-800 text-teal-600 dark:text-emerald-400 shadow-sm" : "text-slate-500 dark:text-slate-400"
                )}
              >
                اليوم
              </button>
              <button 
                onClick={() => setActiveTab('weekly')}
                className={cn(
                  "flex-1 py-3 rounded-xl text-xs font-black transition-all",
                  activeTab === 'weekly' ? "bg-white dark:bg-slate-800 text-teal-600 dark:text-emerald-400 shadow-sm" : "text-slate-500 dark:text-slate-400"
                )}
              >
                المخطط الأسبوعي
              </button>
              <button 
                onClick={() => setActiveTab('calibration')}
                className={cn(
                  "flex-1 py-3 rounded-xl text-xs font-black transition-all",
                  activeTab === 'calibration' ? "bg-white dark:bg-slate-800 text-teal-600 dark:text-emerald-400 shadow-sm" : "text-slate-500 dark:text-slate-400"
                )}
              >
                المعايرة والدقة
              </button>
            </div>

            {/* TAB CONTENT: Today Prayers List */}
            <AnimatePresence mode="wait">
              {activeTab === 'today' && (
                <motion.div
                  key="today"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  {/* Daily Prayer list with Premium audio toggles and complete configurations */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {PRAYER_KEYS.map((key) => {
                      const { ar, icon } = PRAYER_NAMES[key];
                      const isCurrent = timeRemaining?.currentPrayerKey === key;
                      const isDone = completedPrayersToday.includes(ar);
                      const isAlertEnabled = settings.prayerNotificationSettings?.[key] ?? true;
                      
                      // Sound file reference for standard preview
                      const targetSoundUrl = (settings.prayerRingtone) || "https://assets.mixkit.co/active_storage/sfx/2869/2869-84.wav";

                      return (
                        <motion.div 
                          key={key} 
                          whileHover={{ scale: 1.01 }} 
                          className={cn(
                            "group p-3 min-[400px]:p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden flex items-center justify-between gap-2 min-[400px]:gap-3 shadow-sm",
                            isCurrent 
                              ? "bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border-emerald-500/40 ring-1 ring-emerald-500/20 shadow-lg shadow-emerald-500/10" 
                              : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800/60"
                          )}
                        >
                          <div className="absolute top-0 right-0 w-24 h-full bg-emerald-500/[0.01] pointer-events-none group-hover:bg-emerald-500/[0.03] transition-colors" />

                          {/* Left Column: Actions (Checkbox & Instant Play sound / Alarm status) */}
                          <div className="flex items-center gap-1.5 min-[400px]:gap-3 shrink-0">
                            {/* Done Worship Tracker Checkbox */}
                            <button
                              onClick={() => handleMarkAsDone(ar)}
                              className={cn(
                                "w-6 h-6 rounded-lg flex items-center justify-center border transition-all transform active:scale-90",
                                isDone 
                                  ? "bg-emerald-500 border-emerald-500 text-white" 
                                  : "border-slate-300 dark:border-slate-700 hover:border-emerald-500 text-transparent"
                              )}
                              title={isDone ? "تمت تأديتها بنجاح" : "تحديد كمكتملة"}
                            >
                              <CheckCircle2 size={13} className="stroke-[3.5px] text-white" />
                            </button>

                            {/* Alert Bell Toggle (silent/alert sound per prayer) */}
                            <button
                              onClick={() => {
                                const currentN = settings.prayerNotificationSettings || {};
                                const currentVal = currentN[key] ?? true;
                                updateSettings({
                                  prayerNotificationSettings: {
                                    ...currentN,
                                    [key]: !currentVal
                                  }
                                });
                              }}
                              className={cn(
                                "p-2 rounded-xl transition-all border transform active:scale-95",
                                isAlertEnabled
                                  ? "bg-amber-100/40 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/40 text-amber-600 dark:text-amber-400"
                                  : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:text-rose-500"
                              )}
                              title={isAlertEnabled ? "التنبيه مفعل (اضغط للكتم)" : "التنبيه مكتوم (اضغط للتفعيل)"}
                            >
                              {isAlertEnabled ? <Bell size={13} /> : <BellOff size={13} />}
                            </button>

                            {/* Sound playback preview with smart frequency wave graphics */}
                            <button
                              onClick={() => handleTogglePlayAudio(targetSoundUrl, key)}
                              className={cn(
                                "p-2 rounded-xl border transition-all transform active:scale-95 flex items-center gap-1 text-[10px] font-black",
                                playingAudioId === key
                                  ? "bg-emerald-600 border-emerald-500 text-white animate-pulse"
                                  : "bg-slate-100 dark:bg-slate-800 border-indigo-200 dark:border-slate-700 text-teal-600 dark:text-teal-400 hover:bg-slate-200"
                              )}
                              title="استماع لتنبيه الأذان المقترح"
                            >
                              <Volume2 size={13} />
                              {playingAudioId === key ? (
                                <span className="flex items-center gap-0.5">
                                  <span className="w-0.5 h-2 bg-white animate-bounce" style={{ animationDelay: '0.1s' }} />
                                  <span className="w-0.5 h-3.5 bg-white animate-bounce" style={{ animationDelay: '0.3s' }} />
                                  <span className="w-0.5 h-2.5 bg-white animate-bounce" style={{ animationDelay: '0.5s' }} />
                                </span>
                              ) : <span className="hidden min-[400px]:inline">اختبار</span>}
                            </button>
                          </div>

                          {/* Center & Right portion: Prayer times label */}
                          <div className="flex items-center gap-2 min-[400px]:gap-3 text-right min-w-0">
                            {/* Alarm/Timings state */}
                            <div>
                              <div className="flex items-center gap-1.5 justify-end">
                                <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-extrabold">
                                  {key === 'Sunrise' ? 'إشراقة' : 'فرض'}
                                </span>
                                <h4 className="text-sm font-black text-slate-800 dark:text-slate-100">
                                  {ar}
                                </h4>
                              </div>
                              <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
                                {(settings.prayerOffsets?.[key] || 0) !== 0 
                                  ? `تعديل (${settings.prayerOffsets?.[key] > 0 ? '+' : ''}${settings.prayerOffsets?.[key]} د)`
                                  : 'مواقيت فلكية معتمدة'
                                }
                              </span>
                            </div>

                            {/* Large Calligraphic Clock Number & Icon */}
                            <div className="flex items-center gap-3">
                              <span className={cn(
                                "text-xl min-[400px]:text-2xl sm:text-3xl font-black font-mono tracking-tighter shrink-0",
                                isCurrent ? "text-emerald-600 dark:text-emerald-400" : "text-slate-800 dark:text-slate-100"
                              )} dir="ltr">
                                {data?.timings?.[key]?.split(' ')[0] || '--:--'}
                              </span>
                              {/* Visual theme icon */}
                              <div className={cn(
                                "p-2 rounded-xl hidden sm:flex",
                                isCurrent 
                                  ? "bg-emerald-500 text-white" 
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500"
                              )}>
                                {icon}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* HIGH-CRAFT QIBLA COMPASS PANEL (Computed from Coordinates) */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Compass className="text-emerald-500" size={18} />
                        <h3 className="font-black text-xs text-slate-800 dark:text-slate-100">محدد اتجاه القبلة الذكي</h3>
                      </div>
                      <span className="text-[9px] bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full font-black">
                        {useGPS ? "دقة الـ GPS نشطة" : "موقع الحساب الافتراضي"}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed text-right">
                      تم حساب اتجاه الكعبة الشريفة من موقعك تلقائياً وبدقة عالية دون الاتصال بالإنترنت.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center pt-2">
                      <div className="space-y-2.5 text-right">
                        <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-950">
                          <span className="text-[9px] text-slate-400 block font-bold">زاوية القبلة من الشمال:</span>
                          <span className="text-lg font-black text-slate-800 dark:text-slate-100 font-mono tracking-tight">
                            {resolvedQiblaAngle}° درجة شمالاً
                          </span>
                        </div>
                        
                        <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-950">
                          <span className="text-[9px] text-slate-400 block font-bold">المسافة الدقيقة إلى مكة المكرمة:</span>
                          <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
                            {resolvedKaabaDistance.toLocaleString()} كيلومتر (كم)
                          </span>
                        </div>
                        
                        {/* Interactive Manual adjustment slider for Desktop/gyro-less users */}
                        <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-950 space-y-1">
                          <span className="text-[9px] text-slate-400 block font-bold">معايرة البوصلة يدوياً للمحاذاة:</span>
                          <div className="flex items-center gap-2">
                            <input 
                              type="range"
                              min="0"
                              max="360"
                              value={simulatedCompassHeading}
                              onChange={(e) => setSimulatedCompassHeading(parseInt(e.target.value))}
                              className="flex-1 accent-emerald-500 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none"
                            />
                            <span className="text-[10px] font-mono font-black text-slate-500 w-8 text-left">{simulatedCompassHeading}°</span>
                          </div>
                          <span className="text-[8px] text-slate-400 block text-right font-semibold">قم بالتمرير لمطابقة زاوية القبلة المقدرة</span>
                        </div>
                      </div>

                      {/* Visual Rotating Dial Widget */}
                      <div className="flex flex-col items-center justify-center p-2 relative bg-slate-50 dark:bg-slate-950/20 border border-slate-150 dark:border-slate-850 rounded-2xl">
                        <div className="relative w-32 h-32 rounded-full border-4 border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-hidden">
                          {/* Compass Rose */}
                          <div 
                            className="absolute inset-2 border border-slate-100 dark:border-slate-900 rounded-full transition-transform duration-200"
                            style={{ transform: `rotate(${-simulatedCompassHeading}deg)` }}
                          >
                            <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[9px] font-black text-slate-400">N</span>
                            <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[9px] font-black text-slate-400">S</span>
                            <span className="absolute left-1 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-400">W</span>
                            <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-400">E</span>
                          </div>

                          {/* Dynamic Qibla Arrow Dial */}
                          <div 
                            className="absolute w-full h-full flex items-center justify-center transition-transform duration-300"
                            style={{ transform: `rotate(${resolvedQiblaAngle - simulatedCompassHeading}deg)` }}
                          >
                            {/* Golden Needle with dome block */}
                            <div className="w-1.5 h-16 bg-gradient-to-t from-amber-500 to-yellow-300 rounded-full relative transform -translate-y-4">
                              <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs">🕌</span>
                            </div>
                            
                            {/* Inner circle logo represent Mecca */}
                            <div className="w-6 h-6 rounded-full bg-slate-900 dark:bg-slate-850 flex items-center justify-center text-[10px] border border-amber-300 shadow">🕋</div>
                          </div>
                        </div>

                        {/* Alignment confirmation prompt status */}
                        {Math.abs((resolvedQiblaAngle - simulatedCompassHeading) % 360) < 5 ? (
                          <span className="text-[10px] font-black text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded mt-2 animate-bounce">
                             أنت الآن بمحاذاة القبلة بالضبط!
                          </span>
                        ) : (
                          <span className="text-[9px] text-slate-400 mt-2 font-bold select-none text-center leading-tight">
                            قم بمحاذاة البوصلة الدائرية للقبلة
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* PRAYER MACRO INDICATORS: Islamic Sun & Night parts for Tahajjud, Midnight, Pre-Fajr and Duha */}
                  {religiousMacroTimes && (
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
                      <div className="flex items-center gap-2">
                        <Sparkles className="text-indigo-500" size={18} />
                        <h3 className="font-black text-xs text-slate-800 dark:text-slate-100">أوقات النوافل وقيام الليل والسنن</h3>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3.5 pt-1.5">
                        <div className="p-3 bg-gradient-to-tr from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-0.5 text-right">
                          <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 flex items-center justify-end gap-1">
                            <span>ثلث الليل الآخر</span>
                            <Moon size={11} />
                          </span>
                          <span className="text-lg font-black text-slate-800 dark:text-slate-200 block font-mono">
                            {religiousMacroTimes.lastThird}
                          </span>
                          <span className="text-[8px] text-slate-400 font-semibold block pt-1">
                            أفضل وقت للتضرع، الدعاء وقيام الليل
                          </span>
                        </div>

                        <div className="p-3 bg-gradient-to-tr from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-0.5 text-right">
                          <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 flex items-center justify-end gap-1">
                            <span>منتصف الليل الإسلامي</span>
                            <Clock size={11} />
                          </span>
                          <span className="text-lg font-black text-slate-800 dark:text-slate-200 block font-mono">
                            {religiousMacroTimes.midnight}
                          </span>
                          <span className="text-[8px] text-slate-400 font-semibold block pt-1">
                            نهاية الوقت الاختياري والمستحب لصلاة العشاء
                          </span>
                        </div>

                        <div className="p-3 bg-gradient-to-tr from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-0.5 text-right">
                          <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 flex items-center justify-end gap-1">
                            <span>شروق الضحى</span>
                            <Sun size={11} />
                          </span>
                          <span className="text-lg font-black text-slate-800 dark:text-slate-200 block font-mono">
                            {religiousMacroTimes.duha}
                          </span>
                          <span className="text-[8px] text-slate-400 font-semibold block pt-1">
                            بداية وقت صلاة الضحى (السنن النبوية المباركة)
                          </span>
                        </div>

                        <div className="p-3 bg-gradient-to-tr from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-0.5 text-right">
                          <span className="text-[10px] font-black text-rose-500 flex items-center justify-end gap-1">
                            <span>الإمساك الاحتياطي</span>
                            <Sunrise size={11} />
                          </span>
                          <span className="text-lg font-black text-slate-800 dark:text-slate-200 block font-mono">
                            {religiousMacroTimes.imsak}
                          </span>
                          <span className="text-[8px] text-slate-400 font-semibold block pt-1">
                            قبل الفجر بـ 10 دقائق للتوقف الاحتياطي في أيام الصيام
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* PROPRIETARY QUICK WORSHIP SHORTCUTS */}
                  <div className="bg-slate-200/40 dark:bg-slate-950 p-4 rounded-3xl border border-slate-200/50 dark:border-slate-800 space-y-2.5">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block text-right pb-1">روابط سريعة لأوراد العبادات المتصلة بالصلاة</span>
                    
                    <div className="grid grid-cols-2 gap-2 text-right">
                      <button 
                        onClick={() => navigate('/adhkar/prayer?step=after')}
                        className="p-3 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-800/80 text-right flex flex-col justify-center transition shadow-sm cursor-pointer"
                      >
                        <span className="text-xs font-black text-teal-650 dark:text-emerald-400">أذكار بعد الصلاة</span>
                        <span className="text-[8px] text-slate-400 block pt-0.5">الأوراد النبوية الصحيحة المأثورة</span>
                      </button>

                      <button 
                        onClick={() => navigate('/adhkar/prayer?step=adhan')}
                        className="p-3 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-800/80 text-right flex flex-col justify-center transition shadow-sm cursor-pointer"
                      >
                        <span className="text-xs font-black text-slate-800 dark:text-slate-100">أذكار الأذان والمذنب</span>
                        <span className="text-[8px] text-slate-400 block pt-0.5">متابعة الأذان والصلاة على النبي</span>
                      </button>

                      <button 
                        onClick={() => navigate('/tasbih')}
                        className="p-3 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-800/80 text-right flex flex-col justify-center transition shadow-sm cursor-pointer"
                      >
                        <span className="text-xs font-black text-slate-800 dark:text-slate-100">المسبحة الإلكترونية</span>
                        <span className="text-[8px] text-slate-400 block pt-0.5">تسبيح مخصص مدمج بالعداد والاهتزاز</span>
                      </button>

                      <button 
                        onClick={() => navigate('/quran')}
                        className="p-3 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-800/80 text-right flex flex-col justify-center transition shadow-sm cursor-pointer"
                      >
                        <span className="text-xs font-black text-slate-800 dark:text-slate-100">المصحف للتلاوة</span>
                        <span className="text-[8px] text-slate-400 block pt-0.5">سور القرآن الكريم برواية حفص</span>
                      </button>
                    </div>
                  </div>

                  {/* Spiritual insight display widget */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={cn(
                      "relative p-6 rounded-3xl border shadow-xl overflow-hidden text-right transition-all duration-300",
                      insight.type === 'verse'
                        ? "bg-gradient-to-br from-emerald-700 via-emerald-800 to-teal-900 border-emerald-600/20 dark:from-emerald-950 dark:via-emerald-900 dark:to-teal-950 dark:border-emerald-500/30 shadow-emerald-950/20 text-white"
                        : "bg-gradient-to-br from-amber-700 via-amber-800 to-amber-950 border-amber-600/20 dark:from-amber-950 dark:via-amber-900 dark:to-orange-950 dark:border-amber-500/30 shadow-amber-950/20 text-white"
                    )}
                  >
                    {/* Background Islamic Arabesque overlay and subtle radial spot */}
                    <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.15)_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.25] pointer-events-none" />
                    <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-white/[0.04] blur-2xl pointer-events-none" />
                    
                    <div className={cn(
                      "absolute top-0 left-0 font-black text-8xl leading-none pointer-events-none select-none font-serif transform translate-x-2 -translate-y-4 opacity-15 text-white"
                    )}>
                      ”
                    </div>
                    
                    <div className="relative z-10 text-right">
                      <div className="flex items-center gap-2 mb-3.5 justify-end">
                        <span className={cn(
                          "text-[10px] sm:text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full border bg-white/10 text-white border-white/20 backdrop-blur-sm shadow-sm"
                        )}>
                          {insight.type === 'verse' ? 'آية قرآنية معبرة' : 'حديث نبوي شريف'}
                        </span>
                        {insight.type === 'verse' ? (
                          <div className="p-1.5 rounded-xl bg-white/10 text-emerald-100 border border-white/15">
                            <BookOpen size={14} />
                          </div>
                        ) : (
                          <div className="p-1.5 rounded-xl bg-white/10 text-amber-100 border border-white/15">
                            <Quote size={14} />
                          </div>
                        )}
                      </div>
                      <p 
                        className="text-base sm:text-lg lg:text-xl font-bold leading-loose mb-4 text-white drop-shadow-sm font-black"
                        style={{ fontFamily: "'Amiri', serif" }}
                      >
                        {insight.text}
                      </p>
                      <div className="flex justify-start">
                        <span className="inline-block px-3 py-1.5 rounded-full text-[10px] font-extrabold shadow-inner border bg-black/10 text-white/90 border-white/10 backdrop-blur-xs">
                          {insight.source}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {/* TAB CONTENT: 7-Days Weekly forecast list */}
              {activeTab === 'weekly' && (
                <motion.div
                  key="weekly"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
                      <Calendar size={18} className="text-emerald-500" />
                      <h3 className="font-black text-sm">مخطط مواقيت الصلاة للـ 7 الأيام القادمة</h3>
                    </div>

                    <div className="space-y-2.5 overflow-x-auto">
                      {getWeeklyForecast().map((dayItem, idx) => {
                        const dateFormatted = dayItem.date.date;
                        return (
                          <div 
                            key={idx} 
                            className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-950 gap-2"
                          >
                            <div className="flex items-center gap-3 justify-between sm:justify-start">
                              <span className="text-xs font-black text-slate-800 dark:text-slate-100 min-w-[60px]">
                                {dayItem.date.weekday.ar}
                              </span>
                              <div className="flex flex-col text-right">
                                <span className="text-[10px] font-mono text-slate-400 font-bold">{dateFormatted}</span>
                                <span className="text-[9px] text-emerald-600 dark:text-emerald-500 font-black">
                                  {dayItem.hijri.day} {dayItem.hijri.month.ar} {dayItem.hijri.year}
                                </span>
                              </div>
                            </div>

                            {/* Individual Prayer Horizontal Strip */}
                            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar pt-1.5 sm:pt-0" dir="rtl">
                              {['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map((k) => (
                                <div key={k} className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 rounded-full px-3 py-1.5 text-center flex items-center justify-center gap-1.5 shrink-0 shadow-sm border-l-2 border-l-emerald-500">
                                  <span className="text-[9px] text-slate-400 dark:text-slate-500 font-extrabold">{PRAYER_NAMES[k].ar}</span>
                                  <span className="text-xs font-mono font-black text-slate-700 dark:text-slate-200">
                                    {dayItem.timings[k]?.split(' ')[0] || '--:--'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB CONTENT: Calibration offsets manual panel */}
              {activeTab === 'calibration' && (
                <motion.div
                  key="calibration"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sliders size={18} className="text-emerald-500" />
                      <h3 className="font-black text-sm text-slate-800 dark:text-slate-100">معايرة دقيقة وتعديل الدقائق يدوياً</h3>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">تعديل فوري</span>
                  </div>
                  
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed text-right">
                    إذا كانت مواقيت التطبيق تختلف بدقيقة أو أكثر عن مسجدك المحلي، يمكنك مطابقتها بالضبط هنا بزيادة أو نقص دقائق لكل صلاة:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {PRAYER_KEYS.map((key) => {
                      const { ar } = PRAYER_NAMES[key];
                      const currentOffset = (settings.prayerOffsets || {})[key] || 0;
                      return (
                        <div key={key} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-100/50 dark:border-slate-950">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-xs text-slate-700 dark:text-slate-200">{ar}</span>
                            <span className="text-[11px] font-mono font-bold text-slate-400 bg-slate-100 dark:bg-slate-950 px-1.5 py-0.5 rounded">
                              {data?.timings?.[key]?.split(' ')[0] || '--:--'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <button
                              onClick={() => updateOffset(key, -1)}
                              className="w-7 h-7 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-center font-bold text-xs shadow-sm transform transition active:scale-[0.8]"
                            >
                              <Minus size={11} />
                            </button>
                            <span className={cn(
                              "text-xs font-bold font-mono min-w-[28px] text-center", 
                              currentOffset > 0 ? "text-emerald-500" : currentOffset < 0 ? "text-rose-500" : "text-slate-400"
                            )}>
                              {currentOffset > 0 ? `+${currentOffset}` : currentOffset} د
                            </span>
                            <button
                              onClick={() => updateOffset(key, 1)}
                              className="w-7 h-7 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-center font-bold text-xs shadow-sm transform transition active:scale-[0.8]"
                            >
                              <Plus size={11} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : null}
      </main>

      {/* Advanced Settings Modal Dialog popup */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showSettings && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md p-4 overflow-y-auto"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }} 
              className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800 text-right font-sans" dir="rtl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl text-emerald-600 dark:text-emerald-400">
                    <Settings2 size={18} />
                  </div>
                  <h2 className="text-lg font-black text-slate-800 dark:text-slate-100">إعدادات مواقيت الصلاة</h2>
                </div>
                <button 
                  onClick={() => setShowSettings(false)} 
                  className="w-8 h-8 bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center cursor-pointer transition shadow-sm outline-none"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar text-right" dir="rtl">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-400">طريقة إدخال المواقيت</label>
                  <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
                    <button 
                      onClick={() => updateSettings({ prayerManualMode: false })} 
                      className={cn(
                        "flex-1 py-2 rounded-xl text-xs font-black transition-all", 
                        !settings.prayerManualMode ? "bg-white dark:bg-slate-700 text-teal-600 dark:text-emerald-400 shadow-sm" : "text-slate-400"
                      )}
                    >
                      موقع تلقائي / بحث
                    </button>
                    <button 
                      onClick={() => updateSettings({ prayerManualMode: true })} 
                      className={cn(
                        "flex-1 py-2 rounded-xl text-xs font-black transition-all", 
                        settings.prayerManualMode ? "bg-white dark:bg-slate-700 text-teal-600 dark:text-emerald-400 shadow-sm" : "text-slate-400"
                      )}
                    >
                      وضع يدوي بالكامل
                    </button>
                  </div>
                </div>

                {!settings.prayerManualMode ? (
                  <div className="space-y-4">
                    {/* Live Location Status Card */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-slate-500/5 dark:from-emerald-950/20 dark:via-slate-900/40 dark:to-slate-900/20 border border-emerald-500/25 dark:border-emerald-500/10 p-4.5 rounded-3xl shadow-[0_4px_20px_rgba(16,185,129,0.05)] text-right" dir="rtl">
                      <div className="absolute -top-6 -left-6 w-20 h-20 bg-emerald-500/15 rounded-full blur-xl pointer-events-none" />
                      <div className="flex items-start justify-between">
                        <div className="space-y-1.5 flex-1 pr-1">
                          <span className="inline-block text-[10px] font-black tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/5 px-2.5 py-0.5 rounded-full border border-emerald-500/20 mb-2">
                            {useGPS ? "موقع دقيق ونشط عبر الـ GPS" : "موقع حدد تلقائياً عبر الشبكة"}
                          </span>
                          
                          <div>
                            <span className="text-[10px] block font-extrabold text-slate-400">المدينة والدولة المكتشفة:</span>
                            <h4 className="text-base sm:text-lg font-black text-slate-800 dark:text-slate-100 mt-1 flex items-center gap-1.5 leading-none">
                              <MapPin size={16} className="text-emerald-500 shrink-0" />
                              <span>{city || "غير معروف"} ، {country || "غير معروف"}</span>
                            </h4>
                          </div>

                          <p className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold pt-2">
                            {useGPS 
                              ? `إحداثيات الـ GPS: العرض (${lat || '0'})، الطول (${lng || '0'})` 
                              : "تم كشف التوقيت وحفظ إحداثيات ومواقيت موقعك بدقة عالية."
                            }
                          </p>
                        </div>

                        {/* Beautiful rotating compass visual on active */}
                        <div className="p-3 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-2xl text-emerald-600 dark:text-emerald-400 self-center">
                          <Compass 
                            size={22} 
                            className={cn(locationMessage.type === 'loading' ? "animate-spin" : "animate-spin-slow")} 
                            style={{ animationDuration: locationMessage.type === 'loading' ? '2s' : '12s' }} 
                          />
                        </div>
                      </div>
                    </div>

                    {/* Auto-detect methods trigger row */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 block pb-0.5 text-right">خيارات البحث التلقائي الذكي</label>
                      <div className="grid grid-cols-2 gap-2.5">
                        <button 
                          type="button"
                          onClick={() => detectLocation('ip')}
                          disabled={locationMessage.type === 'loading'}
                          className="flex-1 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-100 border border-slate-200/60 dark:border-slate-700 py-3 rounded-2xl transition-all cursor-pointer font-black text-xs flex flex-col items-center justify-center gap-1.5 shadow-sm hover:shadow active:scale-95 disabled:opacity-50"
                        >
                          <span className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-600">
                            <Globe size={14} />
                          </span>
                          <span className="text-[10px]">البحث بالشبكة (سريع)</span>
                        </button>

                        <button 
                          type="button"
                          onClick={() => detectLocation('gps')}
                          disabled={locationMessage.type === 'loading'}
                          className="flex-1 bg-slate-900 hover:bg-slate-805 dark:bg-slate-700 dark:hover:bg-slate-600 text-white py-3 rounded-2xl transition-all cursor-pointer font-black text-xs flex flex-col items-center justify-center gap-1.5 shadow-sm hover:shadow active:scale-95 disabled:opacity-50"
                        >
                          <span className="p-1.5 bg-white/10 rounded-lg text-teal-400">
                            <Navigation size={14} className="animate-pulse" />
                          </span>
                          <span className="text-[10px]">الموقع الدقيق (GPS)</span>
                        </button>
                      </div>
                    </div>

                    {/* Manual Search Overrides & Autocomplete */}
                    <div className="border border-slate-100 dark:border-slate-800/80 p-3.5 rounded-2xl space-y-3 dark:bg-slate-900/20">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-extrabold">البحث الذكي عن أي مدينة أو قرية</span>
                        <div className="h-[1px] flex-1 bg-slate-100 dark:bg-slate-800 mx-3" />
                      </div>

                      {/* Unified Autocomplete Input */}
                      <div className="relative">
                        <input 
                          type="text" 
                          value={searchQuery} 
                          onChange={(e) => handleSearchInputChange(e.target.value)} 
                          className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200/40 dark:border-slate-800 px-3 py-2.5 pr-9 rounded-xl text-xs font-semibold outline-none text-right focus:border-emerald-500/50" 
                          placeholder="اكتب اسم المدينة هنا (مثال: الرباط، مكة)..." 
                        />
                        <Search size={14} className="absolute right-3 top-3.5 text-slate-400" />
                        
                        {searching && (
                          <div className="absolute left-3 top-3.5">
                            <span className="flex h-2 w-2 relative">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                          </div>
                        )}

                        {/* Autocomplete Results list */}
                        {searchResults.length > 0 && (
                          <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 z-50 max-h-56 overflow-y-auto">
                            {searchResults.map((item) => (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => handleSelectCity(item)}
                                className="w-full text-right px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between transition-colors cursor-pointer group"
                              >
                                <span className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold group-hover:text-emerald-500">
                                  {item.admin1 ? `${item.admin1}، ` : ''}{item.country || ''}
                                </span>
                                <div className="flex items-center gap-1.5">
                                  <MapPin size={12} className="text-slate-400 group-hover:text-emerald-500" />
                                  <span className="text-xs font-bold text-slate-750 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                                    {item.name}
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Small expandable form for specific custom overrides */}
                      <details className="group">
                        <summary className="text-[9px] text-slate-400 font-bold cursor-pointer hover:text-slate-650 dark:hover:text-slate-350 list-none flex items-center gap-1">
                          <span className="transition-transform group-open:rotate-90">◀</span>
                          تعديل يدوي للإحداثيات والنصوص
                        </summary>
                        <form onSubmit={handleSearch} className="space-y-3 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/40">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1 text-right" dir="rtl">
                              <label className="text-[8px] font-black uppercase text-slate-400 block pb-0.5">المدينة</label>
                              <input 
                                type="text" 
                                value={cityInput} 
                                onChange={(e) => setCityInput(e.target.value)} 
                                className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200/40 dark:border-slate-800 px-3 py-2 rounded-xl text-[11px] font-semibold outline-none text-right focus:border-emerald-500/30" 
                                placeholder="مثال: Rabat" 
                              />
                            </div>
                            <div className="space-y-1 text-right" dir="rtl">
                              <label className="text-[8px] font-black uppercase text-slate-400 block pb-0.5">الدولة</label>
                              <input 
                                type="text" 
                                value={countryInput} 
                                onChange={(e) => setCountryInput(e.target.value)} 
                                className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200/40 dark:border-slate-800 px-3 py-2 rounded-xl text-[11px] font-semibold outline-none text-right focus:border-emerald-500/30" 
                                placeholder="مثال: Morocco" 
                              />
                            </div>
                          </div>

                          <button 
                            type="submit" 
                            className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 py-2 rounded-xl transition cursor-pointer font-bold text-[10px] flex items-center justify-center gap-1"
                          >
                            <Search size={11} />
                            تأكيد المدخلات يدوياً
                          </button>
                        </form>
                      </details>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400">{t('calc_method_label', 'طريقة الحساب الفلكي للمواقيت')}</label>
                      <select 
                        value={method} 
                        onChange={(e) => updateSettings({ prayerCalcMethod: e.target.value })} 
                        className="w-full bg-slate-100 dark:bg-slate-850 border border-slate-200/50 dark:border-slate-800 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold text-right outline-none"
                      >
                        <option value="4">{t('calc_method_makkah', 'جامعة أم القرى، مكة المكرمة')}</option>
                        <option value="3">{t('calc_method_mwl', 'رابطة العالم الإسلامي')}</option>
                        <option value="2">{t('calc_method_isna', 'الجمعية الإسلامية لأمريكا الشمالية (ISNA)')}</option>
                        <option value="1">{t('calc_method_karachi', 'جامعة العلوم الإسلامية بكراتشي')}</option>
                        <option value="5">{t('calc_method_egypt', 'الهيئة المصرية العامة للمساحة')}</option>
                        <option value="8">{t('calc_method_gulf', 'معهد الجيوفيزياء بجامعة طهران')}</option>
                        <option value="10">{t('calc_method_singapore', 'مجلس العلماء السنغافوري لسنغافورة')}</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400">{t('asr_calc_school', 'مذهب صلاة العصر')}</label>
                      <select 
                        value={asrMethod} 
                        onChange={(e) => updateSettings({ prayerAsrMethod: e.target.value })} 
                        className="w-full bg-slate-105 dark:bg-slate-855 border border-slate-200/50 dark:border-slate-800 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold text-right outline-none"
                      >
                        <option value="0">{t('asr_majority_school', 'المذهب الشافعي والمالكي والحنبلي (الافتراضي)')}</option>
                        <option value="1">{t('asr_hanafi_school', 'المذهب الحنفي')}</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                    {PRAYER_KEYS.map(key => (
                      <div key={key} className="space-y-1 text-right">
                        <label className="text-[9px] text-slate-400 font-bold">{PRAYER_NAMES[key].ar}</label>
                        <input 
                          type="time" 
                          value={settings.prayerManualTimes?.[key] || '00:00'} 
                          onChange={(e) => updateSettings({ prayerManualTimes: { ...settings.prayerManualTimes, [key]: e.target.value } })} 
                          className="w-full text-right bg-white dark:bg-slate-800 px-3 py-2 rounded-xl text-xs font-bold outline-none" 
                        />
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-400">{t('reminder_sound')}</label>
                  <div className="grid grid-cols-2 gap-2">
                    {NOTIFICATION_SOUNDS.map((sound) => (
                      <button 
                        key={sound.id} 
                        onClick={() => { 
                          updateSettings({ prayerRingtone: sound.url }); 
                          new Audio(sound.url).play().catch(() => {}); 
                        }} 
                        className={cn(
                          "px-3 py-2.5 rounded-xl border text-[10px] font-bold transition-all text-center", 
                          settings.prayerRingtone === sound.url 
                            ? "bg-emerald-500 text-white border-emerald-500 shadow-sm" 
                            : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                        )}
                      >
                        {t(`sound_${sound.id.replace(/-/g, '_')}`, sound.label)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-2xl text-right">
                  <div>
                    <span className="text-xs sm:text-sm font-black block text-slate-800 dark:text-slate-100">{t('dst_label', 'التوقيت الصيفي')}</span>
                    <span className="text-[9px] text-emerald-600/70 font-bold dark:text-emerald-400/80">{t('dst_desc', '+1 ساعة للمواقيت')}</span>
                  </div>
                  <button 
                    onClick={() => { 
                      const val = !settings.prayerDaylightSaving; 
                      updateSettings({ prayerDaylightSaving: val }); 
                      safeLocalStorageSetItem('prayer_dst', String(val)); 
                    }} 
                    className={cn(
                      "w-10 h-6 rounded-full transition-all relative p-1 cursor-pointer outline-none", 
                      settings.prayerDaylightSaving ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                    )}
                  >
                    <motion.div 
                      layout
                      animate={{ x: settings.prayerDaylightSaving ? 14 : -14 }} 
                      className="w-4 h-4 bg-white rounded-full mx-auto" 
                    />
                  </button>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={14} className="text-amber-500" />
                    <h3 className="font-black text-xs text-slate-800 dark:text-slate-100">إضافة آيات أو أحاديث مخصصة لك</h3>
                  </div>
                  <div className="space-y-2">
                    <select 
                      value={newInsightType} 
                      onChange={(e) => setNewInsightType(e.target.value as any)} 
                      className="w-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-3 py-2 rounded-xl text-xs font-bold"
                    >
                      <option value="verse">آية قرآنية</option>
                      <option value="hadith">حديث نبوي</option>
                    </select>
                    <textarea 
                      value={newInsightText} 
                      onChange={(e) => setNewInsightText(e.target.value)} 
                      placeholder="اكتب الآية أو الحديث الشريف..." 
                      className="w-full bg-white dark:bg-slate-850 border border-slate-100 dark:border-slate-800 px-3 py-2 rounded-xl text-xs font-bold resize-none" 
                      rows={2} 
                    />
                    <input 
                      type="text" 
                      value={newInsightSource} 
                      onChange={(e) => setNewInsightSource(e.target.value)} 
                      placeholder="المصدر أو الجزء..." 
                      className="w-full bg-white dark:bg-slate-850 border border-slate-100 dark:border-slate-800 px-3 py-2 rounded-xl text-xs font-bold" 
                    />
                    <button 
                      onClick={handleAddInsight} 
                      disabled={!newInsightText.trim() || !newInsightSource.trim()} 
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl text-xs font-bold disabled:opacity-40 transition"
                    >
                      إضافة إلى قائمتي
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
                <button 
                  onClick={() => setShowSettings(false)} 
                  className="w-full bg-slate-800 hover:bg-slate-705 text-white py-3 rounded-2xl text-xs sm:text-sm font-black transition shadow-md cursor-pointer outline-none"
                >
                  إغلاق
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
      )}
    </div>
  );
};
