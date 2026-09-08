import { BackButton } from './ui/BackButton';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Navigation, 
  MapPin, 
  Info, 
  RefreshCw, 
  Compass as CompassIcon, 
  LocateFixed, 
  Zap, 
  Crosshair, 
  Settings2, 
  X, 
  Vibrate, 
  Eye, 
  Palette,
  Volume2,
  VolumeX,
  Sparkles,
  HelpCircle,
  TrendingUp,
  Sliders,
  ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useAppContext } from '../AppContext';
import { useTranslation } from '../i18n';

export const Compass: React.FC = () => {
  const { settings } = useAppContext();
  const { t } = useTranslation(settings.appLanguage);
  
  // Base compass headings
  const [heading, setHeading] = useState<number>(0);
  const [smoothedHeading, setSmoothedHeading] = useState<number>(0);
  const prevHeadingRef = useRef<number>(0);
  const runningRotationRef = useRef<number>(0);
  
  // Orientation angles (tilt detection)
  const [orientation, setOrientation] = useState({ beta: 0, gamma: 0 });
  const [qiblaDirection, setQiblaDirection] = useState<number | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [coords, setCoords] = useState<{lat: number, lng: number} | null>(null);
  const [altitude, setAltitude] = useState<number | null>(null);
  const [locationName, setLocationName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const [accuracy, setAccuracy] = useState<number>(0); // degrees of accuracy

  // Interactive settings & HUD preferences
  const [showSettings, setShowSettings] = useState(false);
  const [enableHaptics, setEnableHaptics] = useState(true);
  const [audioFeedback, setAudioFeedback] = useState(false);
  const [showTelemetry, setShowTelemetry] = useState(true);
  const [compassStyle, setCompassStyle] = useState<'modern' | 'astrolabe' | 'minimal'>('modern');
  const [sensorMode, setSensorMode] = useState<'auto' | 'high-precision'>('auto');
  const [sensorAvailable, setSensorAvailable] = useState(false);
  const [showCalibrationHelp, setShowCalibrationHelp] = useState(false);

  const KAABA_COORDS = { lat: 21.422487, lng: 39.826206 };

  // Audio synthesis nodes
  const audioContextRef = useRef<AudioContext | null>(null);
  const beepIntervalRef = useRef<any>(null);
  const wasAlignedRef = useRef(false);

  // Check generic sensor API support on mount
  useEffect(() => {
    if ('AbsoluteOrientationSensor' in (window as any)) {
      try {
        // Test construct to verify if permissions policy blocks it
        new (window as any).AbsoluteOrientationSensor({ frequency: 1 });
        setSensorAvailable(true);
      } catch (err) {
        // Gracefully handle browser/permissions policy restriction
        setSensorAvailable(false);
      }
    }
  }, []);

  // Play a simple synthesized guiding beep
  const playBeep = (freq: number, duration: number) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.type = 'sine';
      
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + duration);
      
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn("Audio Context beep execution failed:", e);
    }
  };

  // Play a beautiful oriental chord when perfect alignment is reached
  const playSuccessChime = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      
      const now = ctx.currentTime;
      const playNote = (freq: number, delay: number, dur: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(freq, now + delay);
        osc.type = 'triangle';
        gain.gain.setValueAtTime(0.05, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.00001, now + delay + dur);
        osc.start(now + delay);
        osc.stop(now + delay + dur);
      };
      
      // Traditional harmonic chord arpeggio
      playNote(523.25, 0.0, 0.4); // C5
      playNote(659.25, 0.1, 0.4); // E5
      playNote(783.99, 0.2, 0.4); // G5
      playNote(1046.50, 0.3, 0.6); // C6
    } catch (e) {}
  };

  // Distance calculation based on Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // earth radius km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Unified orientation sensor handler
  const handleOrientation = useCallback((e: DeviceOrientationEvent | any) => {
    let head = 0;
    let validCompass = false;

    // Use absolute compass heading if available (primarily iOS and some desktop browsers)
    if (e.webkitCompassHeading !== undefined && e.webkitCompassHeading !== null) {
      head = e.webkitCompassHeading || 0;
      setAccuracy(e.webkitCompassAccuracy || 0);
      validCompass = true;
    } 
    // Fallback to absolute/alpha on Android DeviceOrientationEvent
    else if (e.alpha !== undefined && e.alpha !== null) {
      head = (360 - e.alpha) % 360;
      setAccuracy(e.absolute ? 1 : 15);
      validCompass = true;
    }
    
    if (e.beta !== null && e.beta !== undefined && e.gamma !== null && e.gamma !== undefined) {
      setOrientation({ beta: e.beta, gamma: e.gamma });
    }

    if (!validCompass) return;

    // Screen orientation corrections
    let screenOrientation = 0;
    if (window.screen && window.screen.orientation && window.screen.orientation.angle !== undefined) {
      screenOrientation = window.screen.orientation.angle;
    } else if (typeof window.orientation !== "undefined") {
      screenOrientation = Number(window.orientation) || 0;
    }
    
    head += screenOrientation;
    head = (head + 360) % 360;

    if (isNaN(head)) return;

    setHeading(head);

    // Smooth rotational transition
    let diff = head - prevHeadingRef.current;
    if (diff > 180) diff -= 360;
    else if (diff < -180) diff += 360;
    
    runningRotationRef.current += diff;
    setSmoothedHeading(runningRotationRef.current);
    prevHeadingRef.current = head;
  }, []);

  // Request permissions for DeviceOrientation
  const requestOrientationPermission = async () => {
    const DeviceOrientationEventAny = DeviceOrientationEvent as any;
    if (typeof DeviceOrientationEventAny !== 'undefined' && typeof DeviceOrientationEventAny.requestPermission === 'function') {
      try {
        const permissionState = await DeviceOrientationEventAny.requestPermission();
        if (permissionState === 'granted') {
          setPermissionGranted(true);
          initSensors();
        } else {
          setError(t('compass_permission_denied', 'لم يتم منح صلاحية البوصلة. الرجاء تفعيلها من إعدادات المتصفح لضمان تحديد الاتجاه.'));
          setPermissionGranted(false);
        }
      } catch (err) {
        console.error(err);
        setError(t('compass_permission_error', 'خطأ أثناء طلب صلاحية البوصلة.'));
      }
    } else {
      setPermissionGranted(true);
      initSensors();
    }
  };

  // Initialize event listeners
  const initSensors = useCallback(() => {
    if (window.DeviceOrientationEvent) {
      // Prioritize deviceorientationabsolute to ensure absolute magnetometer readings on Android
      if ('ondeviceorientationabsolute' in (window as any)) {
        window.addEventListener('deviceorientationabsolute', handleOrientation as any, true);
      } else {
        window.addEventListener('deviceorientation', handleOrientation as any, true);
      }
    }
  }, [handleOrientation]);

  // Hook sensor listeners with fallback mechanics
  useEffect(() => {
    const DeviceOrientationEventAny = DeviceOrientationEvent as any;
    const isPermissionRequired = typeof DeviceOrientationEventAny !== 'undefined' && typeof DeviceOrientationEventAny.requestPermission === 'function';
    
    if (sensorMode === 'auto') {
      if (isPermissionRequired) {
        setPermissionGranted(false);
      } else {
        initSensors();
        setPermissionGranted(true);
      }
    }

    return () => {
      window.removeEventListener('deviceorientationabsolute', handleOrientation as any, true);
      window.removeEventListener('deviceorientation', handleOrientation as any, true);
    };
  }, [handleOrientation, initSensors, sensorMode]);

  // High precision AbsoluteOrientationSensor fusion handler
  useEffect(() => {
    let sensor: any = null;
    if (sensorMode === 'high-precision' && 'AbsoluteOrientationSensor' in (window as any)) {
      try {
        sensor = new (window as any).AbsoluteOrientationSensor({ frequency: 60 });
        sensor.addEventListener('reading', () => {
          const q = sensor.quaternion;
          if (q) {
            // Transform quaternion (x,y,z,w) into 2D yaw heading relative to Earth coordinate frame
            const x = q[0], y = q[1], z = q[2], w = q[3];
            const headingRad = Math.atan2(
              2 * (w * z + x * y),
              1 - 2 * (y * y + z * z)
            );
            let head = -(headingRad * 180 / Math.PI);
            head = (head + 360) % 360;
            
            if (!isNaN(head)) {
              setHeading(head);
              
              let diff = head - prevHeadingRef.current;
              if (diff > 180) diff -= 360;
              else if (diff < -180) diff += 360;
              
              runningRotationRef.current += diff;
              setSmoothedHeading(runningRotationRef.current);
              prevHeadingRef.current = head;
            }
          }
        });
        sensor.addEventListener('error', (event: any) => {
          console.warn("AbsoluteOrientationSensor reported error:", event.error);
          setSensorMode('auto');
        });
        sensor.start();
      } catch (err) {
        console.warn("AbsoluteOrientationSensor initialization failed gracefully:", err);
        setSensorMode('auto');
        setSensorAvailable(false);
      }
    }
    return () => {
      if (sensor) {
        try {
          sensor.stop();
        } catch (e) {}
      }
    };
  }, [sensorMode]);

  // Calculate standard Qibla angle based on latitude & longitude
  const calculateQibla = useCallback((lat: number, lng: number) => {
    const φ1 = lat * Math.PI / 180;
    const λ1 = lng * Math.PI / 180;
    const φ2 = KAABA_COORDS.lat * Math.PI / 180;
    const λ2 = KAABA_COORDS.lng * Math.PI / 180;

    const y = Math.sin(λ2 - λ1);
    const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);
    const qiblaAngle = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
    
    setQiblaDirection(qiblaAngle);
    setLoading(false);
    
    // Check API Qibla validation
    fetch(`https://api.aladhan.com/v1/qibla/${lat}/${lng}`, {
      mode: 'cors',
      credentials: 'omit',
      referrerPolicy: 'no-referrer'
    })
      .then(res => res.json())
      .then(json => {
        if (json.code === 200) {
          setQiblaDirection(json.data.direction);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch geographic coordinates
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude, altitude } = position.coords;
          setCoords({ lat: latitude, lng: longitude });
          setAltitude(altitude);
          
          calculateQibla(latitude, longitude);
          setDistance(calculateDistance(latitude, longitude, KAABA_COORDS.lat, KAABA_COORDS.lng));
          
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=${settings.appLanguage}`, {
              mode: 'cors',
              credentials: 'omit',
              referrerPolicy: 'no-referrer'
            });
            const data = await res.json();
            setLocationName(data?.address?.city || data?.address?.town || data?.address?.state || t('current_location', 'موقعي الحالي'));
          } catch (e) {
            setLocationName(t('current_location', 'موقعي الحالي'));
          }
        },
        () => {
          setError(t('error_location', 'لم نتمكن من الحصول على موقعك بدقة. تم استخدام إحداثيات مكة المكرمة كمرجع افتراضي.'));
          setCoords(KAABA_COORDS);
          setAltitude(0);
          calculateQibla(KAABA_COORDS.lat, KAABA_COORDS.lng);
          setDistance(0);
          setLocationName(t('mecca_reference', 'مكة المكرمة'));
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setError(t('error_location', 'تحديد الموقع الجغرافي غير مدعوم في هذا المتصفح.'));
      calculateQibla(KAABA_COORDS.lat, KAABA_COORDS.lng);
    }
  }, [calculateQibla, settings.appLanguage, t]);

  // Compute navigation difference angle
  const relativeQiblaAngle = qiblaDirection !== null ? (qiblaDirection - heading + 360) % 360 : 0;
  
  let angleDiff = qiblaDirection !== null ? (qiblaDirection - heading) : 0;
  while (angleDiff > 180) angleDiff -= 360;
  while (angleDiff < -180) angleDiff += 360;

  const isActuallyAligned = qiblaDirection !== null && Math.abs(angleDiff) < 3.5;

  // Alignment haptics triggered on target focus
  useEffect(() => {
    if (isActuallyAligned && enableHaptics) {
      if ('vibrate' in navigator) {
        navigator.vibrate([40, 60, 40]);
      }
    }
  }, [isActuallyAligned, enableHaptics]);

  // Alignment audio guiding tone engine
  useEffect(() => {
    if (!audioFeedback || qiblaDirection === null) {
      if (beepIntervalRef.current) {
        clearInterval(beepIntervalRef.current);
        beepIntervalRef.current = null;
      }
      return;
    }
    
    const diff = Math.abs(angleDiff);
    if (diff > 35) {
      if (beepIntervalRef.current) {
        clearInterval(beepIntervalRef.current);
        beepIntervalRef.current = null;
      }
      return;
    }
    
    // Closer proximity yields rapid beeping intervals
    let interval = 1000;
    if (diff <= 5) interval = 180;
    else if (diff <= 15) interval = 450;
    else if (diff <= 35) interval = 850;
    
    if (beepIntervalRef.current) {
      clearInterval(beepIntervalRef.current);
    }
    
    if (diff < 3.5) {
      // Success chime handles the perfect zone
      return;
    }
    
    beepIntervalRef.current = setInterval(() => {
      // Frequency pitch increases near target orientation
      const freq = 480 + (35 - diff) * 11;
      playBeep(freq, 0.08);
    }, interval);
    
    return () => {
      if (beepIntervalRef.current) clearInterval(beepIntervalRef.current);
    };
  }, [audioFeedback, angleDiff, qiblaDirection]);

  // Trigger success audio chime exactly on state entry
  useEffect(() => {
    if (isActuallyAligned) {
      if (!wasAlignedRef.current) {
        wasAlignedRef.current = true;
        if (audioFeedback) {
          playSuccessChime();
        }
      }
    } else {
      wasAlignedRef.current = false;
    }
  }, [isActuallyAligned, audioFeedback]);

  // Handle translation directional characters
  const getDirectionLabel = (dir: 'N' | 'S' | 'E' | 'W') => {
    if (compassStyle === 'astrolabe') {
      switch (dir) {
        case 'N': return t('direction_north_astrolabe', 'ش');
        case 'S': return t('direction_south_astrolabe', 'ج');
        case 'E': return t('direction_east_astrolabe', 'ق');
        case 'W': return t('direction_west_astrolabe', 'غ');
      }
    }
    return dir;
  };

  return (
    <div className="w-full min-h-full pb-24 overflow-y-auto bg-[#070b11] text-slate-100 select-none">
      
      {/* Header Bar */}
      <header className="sticky top-0 z-50 px-6 py-4 flex justify-between items-center bg-[#070b11]/90 backdrop-blur-xl border-b border-white/5 shadow-md">
        <div className="flex items-center gap-4">
          <BackButton className="z-50" />
          <div>
            <h1 className="text-lg font-black tracking-tight text-white">{t('qibla', 'القبلة')}</h1>
            <div className="flex items-center gap-2 text-[10px] font-bold text-teal-400 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
              <span>{t('smart_qibla_compass', 'البوصلة الاستشعارية')}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Audio toggle */}
          <button 
            onClick={() => setAudioFeedback(!audioFeedback)}
            className={cn(
              "w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-150 active:scale-95 border border-white/5",
              audioFeedback ? "bg-teal-500/10 text-teal-400" : "bg-white/5 text-slate-400"
            )}
            title={t('toggle_compass_sound', 'صوت التوجيه')}
          >
            {audioFeedback ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          {/* Refresh button */}
          <button 
            onClick={() => window.location.reload()} 
            className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-xl border border-white/5 text-slate-400 active:scale-95 transition-all"
            title={t('recalibrate', 'إعادة تهيئة')}
          >
            <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
          </button>
          {/* Settings button */}
          <button 
            onClick={() => setShowSettings(true)} 
            className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-xl border border-white/5 text-slate-400 active:scale-95 transition-all"
            title={t('settings', 'الإعدادات')}
          >
            <Settings2 size={18} />
          </button>
        </div>
      </header>

      <div className="p-6 max-w-md mx-auto flex flex-col items-center space-y-8 mt-2">
        
        {/* Permission triggers */}
        {permissionGranted === false && (
          <motion.button 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }}
            onClick={requestOrientationPermission}
            className="w-full bg-teal-500 text-white p-4 rounded-2xl flex items-center justify-center gap-3 font-extrabold shadow-lg shadow-teal-500/20 active:scale-[0.98] transition-all"
          >
             <Zap size={20} className="fill-white" />
             <span>{t('activate_smart_compass', 'تفعيل البوصلة الذكية')}</span>
          </motion.button>
        )}

        {error && permissionGranted !== false && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="w-full bg-amber-500/10 p-4 rounded-2xl border border-amber-500/20 flex items-start gap-3"
          >
             <Info size={18} className="text-amber-400 shrink-0 mt-0.5" />
             <p className="text-xs font-bold text-amber-200/90 leading-relaxed">
               {error}
             </p>
          </motion.div>
        )}

        {/* Real-time Guidance HUD Display */}
        {qiblaDirection !== null && (
          <div className="w-full text-center space-y-2">
            <AnimatePresence mode="wait">
              {isActuallyAligned ? (
                <motion.div
                  key="aligned"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="inline-flex items-center gap-2 bg-teal-500/15 border border-teal-500/30 text-teal-400 px-5 py-2 rounded-full font-black text-xs tracking-wide uppercase shadow-lg shadow-teal-500/5 animate-pulse"
                >
                  <Sparkles size={14} />
                  <span>{t('perfect_qibla_aligned', 'محاذاة كاملة للقبلة')}</span>
                </motion.div>
              ) : (
                <motion.div
                  key="guiding"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="flex flex-col items-center gap-1.5"
                >
                  <div className="text-xs text-slate-400 font-bold flex items-center gap-1.5">
                    <span>{t('turn_device_to_align', 'يرجى تدوير الهاتف لتحديد اتجاه الكعبة')}</span>
                  </div>
                  
                  {/* Intuitive visual steering arrow */}
                  <div className="flex items-center justify-center gap-2 font-black text-sm text-teal-300">
                    {angleDiff > 0 ? (
                      <motion.div 
                        animate={{ x: [0, 4, 0] }} 
                        transition={{ repeat: Infinity, duration: 1.2 }}
                        className="flex items-center gap-1.5 text-amber-400"
                      >
                        <span>{t('turn_right', 'أدر لليمين')}</span>
                        <span className="font-mono bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-lg text-xs font-black">
                          {Math.round(angleDiff)}°
                        </span>
                        <span>→</span>
                      </motion.div>
                    ) : (
                      <motion.div 
                        animate={{ x: [0, -4, 0] }} 
                        transition={{ repeat: Infinity, duration: 1.2 }}
                        className="flex items-center gap-1.5 text-indigo-400"
                      >
                        <span>←</span>
                        <span className="font-mono bg-indigo-400/10 border border-indigo-400/20 px-2 py-0.5 rounded-lg text-xs font-black">
                          {Math.round(Math.abs(angleDiff))}°
                        </span>
                        <span>{t('turn_left', 'أدر لليسار')}</span>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* 3D Interactive Compass Hub */}
        <div className="relative w-80 h-80 flex items-center justify-center select-none">
           
           {/* Glow halo aura */}
           {compassStyle !== 'minimal' && (
             <div className={cn(
               "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[80px] transition-all duration-500 ease-out",
               isActuallyAligned ? "w-80 h-80 bg-teal-500/35" : "w-64 h-64 bg-indigo-500/5"
             )} />
           )}

           {/* Goniometer / Circular Arc Track indicating the target angle to turn */}
           {qiblaDirection !== null && !isActuallyAligned && compassStyle === 'modern' && (
             <svg className="absolute w-[310px] h-[310px] rotate-[-90deg] pointer-events-none opacity-45">
               <circle
                 cx="155"
                 cy="155"
                 r="146"
                 fill="none"
                 stroke="rgba(255, 255, 255, 0.03)"
                 strokeWidth="3"
               />
               <motion.circle
                 cx="155"
                 cy="155"
                 r="146"
                 fill="none"
                 stroke={angleDiff > 0 ? "#fbbf24" : "#818cf8"}
                 strokeWidth="4"
                 strokeDasharray="917"
                 animate={{
                   strokeDashoffset: 917 - (917 * Math.min(Math.abs(angleDiff), 180)) / 360
                 }}
                 transition={{ type: "spring", stiffness: 60, damping: 20 }}
                 strokeLinecap="round"
                 style={{
                   transformOrigin: '155px 155px',
                   transform: `rotate(${-smoothedHeading}deg)`
                 }}
               />
             </svg>
           )}

           {/* Dial Base Bezel */}
           <div className={cn(
             "absolute inset-0 rounded-full transition-all duration-300 border",
             compassStyle === 'modern' && "border-white/10 shadow-[0_15px_40px_rgba(0,0,0,0.7)] bg-gradient-to-b from-[#0e141f] to-[#04080d]",
             compassStyle === 'astrolabe' && "border-[#dfb76c]/40 bg-[#120f09] shadow-[0_15px_40px_rgba(0,0,0,0.8),inset_0_0_20px_rgba(223,183,108,0.15)]",
             compassStyle === 'minimal' && "border-white/10 bg-[#070b11]/50 backdrop-blur-md"
           )} />

           {/* Astrolabe Engraved Grid overlay */}
           {compassStyle === 'astrolabe' && (
             <div className="absolute inset-4 rounded-full border border-[#dfb76c]/25 flex items-center justify-center opacity-40 pointer-events-none">
               <div className="absolute inset-10 rounded-full border border-[#dfb76c]/15" />
               <div className="absolute inset-20 rounded-full border border-[#dfb76c]/10" />
               <div className="absolute w-[2px] h-full bg-[#dfb76c]/20" />
               <div className="absolute h-[2px] w-full bg-[#dfb76c]/20" />
               {/* Astrolabe coordinates & Arabic lines */}
               {[0, 30, 60, 120, 150].map((deg) => (
                 <div key={deg} className="absolute w-full h-[1px] bg-[#dfb76c]/15" style={{ transform: `rotate(${deg}deg)` }} />
               ))}
             </div>
           )}

           {/* Inner ring */}
           {compassStyle === 'modern' && (
             <div className="absolute inset-4 rounded-full border border-white/5 bg-[#06090e] shadow-[inset_0_4px_12px_rgba(0,0,0,0.8)] flex items-center justify-center" />
           )}
           
           {/* Rotating Compass Dial */}
           <motion.div 
             className="absolute w-full h-full rounded-full flex items-center justify-center"
             style={{ rotate: -smoothedHeading }}
             transition={{ type: "spring", stiffness: 55, damping: 21 }}
           >
              {/* Dial Tick Marks */}
              {[...Array(compassStyle === 'minimal' ? 24 : 72)].map((_, i) => {
                const step = compassStyle === 'minimal' ? 15 : 5;
                const degree = i * step;
                const isMajor = degree % 90 === 0;
                const isMedium = degree % 30 === 0;
                return (
                  <div 
                    key={i} 
                    className="absolute top-3 left-0 right-0 flex flex-col items-center"
                    style={{ 
                      transformOrigin: '50% 160px',
                      transform: `rotate(${degree}deg)` 
                    }}
                  >
                    <div className={cn(
                      isMajor ? (compassStyle === 'astrolabe' ? "h-3.5 w-[2px] bg-[#dfb76c]" : "h-4 w-1 bg-white") : 
                      isMedium ? (compassStyle === 'astrolabe' ? "h-2.5 w-[1px] bg-[#dfb76c]/60" : "h-3 w-[2px] bg-white/60") :
                      (compassStyle === 'astrolabe' ? "h-1.5 w-[1px] bg-[#dfb76c]/30" : "h-1.5 w-[1px] bg-white/20")
                    )} />
                    {isMedium && !isMajor && compassStyle !== 'minimal' && (
                      <span 
                        className={cn(
                          "mt-1 text-[8px] font-bold opacity-40 font-mono tracking-tighter",
                          compassStyle === 'astrolabe' ? "text-[#dfb76c]" : "text-white"
                        )}
                        style={{ transform: 'rotate(180deg)' }}
                      >
                        {degree}
                      </span>
                    )}
                  </div>
                );
              })}

              {/* Cardinal directions */}
              <div className="absolute inset-0 pointer-events-none">
                <span 
                  className={cn(
                    "absolute top-7 left-1/2 -translate-x-1/2 font-black text-lg",
                    compassStyle === 'astrolabe' ? "text-[#dfb76c] font-serif" : "text-rose-500 font-sans"
                  )}
                >
                  {getDirectionLabel('N')}
                </span>
                <span 
                  className={cn(
                    "absolute bottom-7 left-1/2 -translate-x-1/2 font-black text-md",
                    compassStyle === 'astrolabe' ? "text-[#dfb76c]/80 font-serif" : "text-white/75 font-sans"
                  )} 
                  style={{ transform: 'translateX(-50%) rotate(180deg)' }}
                >
                  {getDirectionLabel('S')}
                </span>
                <span 
                  className={cn(
                    "absolute right-7 top-1/2 -translate-y-1/2 font-black text-md",
                    compassStyle === 'astrolabe' ? "text-[#dfb76c]/80 font-serif" : "text-white/75 font-sans"
                  )} 
                  style={{ transform: 'translateY(-50%) rotate(-90deg)' }}
                >
                  {getDirectionLabel('E')}
                </span>
                <span 
                  className={cn(
                    "absolute left-7 top-1/2 -translate-y-1/2 font-black text-md",
                    compassStyle === 'astrolabe' ? "text-[#dfb76c]/80 font-serif" : "text-white/75 font-sans"
                  )} 
                  style={{ transform: 'translateY(-50%) rotate(90deg)' }}
                >
                  {getDirectionLabel('W')}
                </span>
              </div>

              {/* Qibla Direction Marker on the Dial */}
              {qiblaDirection !== null && (
                <div 
                  className="absolute top-0 left-1/2 origin-[0_160px] flex flex-col items-center"
                  style={{ transform: `translateX(-50%) rotate(${qiblaDirection}deg)` }}
                >
                   <div 
                     className={cn(
                       "w-11 h-11 mt-6 rounded-2xl flex items-center justify-center border transition-all duration-300",
                       compassStyle === 'astrolabe' 
                         ? "bg-[#dfb76c]/15 border-[#dfb76c] shadow-[0_0_20px_rgba(223,183,108,0.4)]" 
                         : "bg-teal-500 border-teal-300 shadow-[0_0_25px_rgba(20,184,166,0.6)]"
                     )}
                     title={t('kaaba', 'الكعبة')}
                   >
                     <img 
                       src="https://cdn-icons-png.flaticon.com/512/11543/11543444.png" 
                       alt="Kaaba" 
                       className={cn(
                         "w-6 h-6",
                         compassStyle === 'astrolabe' ? "brightness-75 sepia-100 hue-rotate-[15deg] saturate-[3]" : "brightness-0 invert"
                       )}
                       referrerPolicy="no-referrer"
                       loading="lazy"
                     />
                   </div>
                   
                   {/* Direction Guide Line on the Dial */}
                   <div className={cn(
                     "w-[1px] h-32 mt-1",
                     compassStyle === 'astrolabe' 
                       ? "bg-gradient-to-b from-[#dfb76c]/50 to-transparent" 
                       : "bg-gradient-to-b from-teal-400/50 to-transparent"
                   )} />
                </div>
              )}
           </motion.div>

           {/* Static Pointer HUD Overlay (Pointing straight forward) */}
           <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {/* Fine center crosshairs */}
              <Crosshair size={36} strokeWidth={1} className="text-white/10" />
              
              {/* Golden Center Bezel for Astrolabe Theme */}
              {compassStyle === 'astrolabe' ? (
                <>
                  <div className="absolute w-8 h-8 rounded-full bg-gradient-to-b from-[#dfb76c] to-[#a8823d] border-2 border-[#ffeed1] shadow-lg shadow-black/80" />
                  <div className="absolute w-2 h-2 rounded-full bg-black/60" />
                </>
              ) : (
                <div className="absolute w-2.5 h-2.5 bg-white rounded-full shadow-[0_0_12px_rgba(255,255,255,1)] border border-teal-400" />
              )}
              
              {/* Absolute Forward Indicator needle */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-4.5 flex flex-col items-center">
                 <motion.div 
                   animate={isActuallyAligned ? { scale: [1, 1.15, 1], y: [0, -2, 0] } : {}}
                   transition={{ repeat: Infinity, duration: 1.5 }}
                   className={cn(
                     "w-0 h-0 border-l-[9px] border-r-[9px] border-b-[18px] border-l-transparent border-r-transparent transition-all duration-300",
                     isActuallyAligned 
                       ? (compassStyle === 'astrolabe' ? "border-b-[#dfb76c]" : "border-b-teal-400") 
                       : "border-b-rose-500"
                   )} 
                 />
                 <div 
                   className={cn(
                     "w-1 h-5 shadow-[0_0_8px_currentColor] transition-all duration-300 rounded-b-full opacity-40",
                     isActuallyAligned 
                       ? (compassStyle === 'astrolabe' ? "text-[#dfb76c]" : "text-teal-400") 
                       : "text-rose-500"
                   )} 
                 />
              </div>
           </div>

           {/* Aligned Celebration Overlay */}
           <AnimatePresence>
             {isActuallyAligned && qiblaDirection !== null && (
               <motion.div 
                 initial={{ opacity: 0, scale: 0.9, y: 15 }}
                 animate={{ opacity: 1, scale: 1, y: 0 }}
                 exit={{ opacity: 0, scale: 0.9, y: -15 }}
                 className={cn(
                   "absolute -bottom-12 px-5 py-2.5 rounded-full border backdrop-blur-md flex items-center gap-2 font-black text-xs tracking-tight shadow-xl",
                   compassStyle === 'astrolabe' 
                     ? "bg-[#1f1a10]/95 border-[#dfb76c]/40 text-[#dfb76c]"
                     : "bg-teal-500/10 border-teal-500/30 text-teal-300"
                 )}
               >
                 <Zap size={14} className={compassStyle === 'astrolabe' ? "text-[#dfb76c]" : "text-teal-400"} />
                 <span>{t('qibla_aligned', 'القبلة باتجاه مستقيم')}</span>
               </motion.div>
             )}
           </AnimatePresence>
        </div>

        {/* Bubble Leveler & Compass Calibration Assist */}
        <div className="w-full flex flex-col space-y-4 px-1">
          
          <div className="grid grid-cols-2 gap-4">
             {/* Dynamic Angle Proximity */}
             <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col justify-between h-24">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('relative_angle', 'زاوية الانحراف')}</span>
                <div className="flex items-baseline gap-1 mt-auto">
                   <span className="text-3xl font-black text-white tabular-nums tracking-tight">
                     {qiblaDirection !== null ? Math.round(relativeQiblaAngle) : "---"}°
                   </span>
                </div>
             </div>

             {/* Precision Heading */}
             <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col justify-between h-24">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('actual_direction', 'الاتجاه الحالي')}</span>
                <div className="flex items-baseline gap-1 mt-auto">
                   <span className="text-3xl font-black text-white tabular-nums tracking-tight">
                     {Math.round(heading)}°
                   </span>
                   <span className="text-xs font-black text-teal-400/80 uppercase">
                     {heading >= 337.5 || heading < 22.5 ? t('north_short', 'شمال') :
                      heading >= 22.5 && heading < 67.5 ? t('ne_short', 'ش.ش') :
                      heading >= 67.5 && heading < 112.5 ? t('east_short', 'شرق') :
                      heading >= 112.5 && heading < 157.5 ? t('se_short', 'ج.ش') :
                      heading >= 157.5 && heading < 202.5 ? t('south_short', 'جنوب') :
                      heading >= 202.5 && heading < 247.5 ? t('sw_short', 'ج.غ') :
                      heading >= 247.5 && heading < 292.5 ? t('west_short', 'غرب') : t('nw_short', 'ش.غ')}
                   </span>
                </div>
             </div>
          </div>

          {/* Alignment Horizontal Tilt Bubble leveler */}
          <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-2">
            <div className="flex justify-between items-center text-[10px] font-extrabold tracking-wider text-slate-400">
              <span className="uppercase">{t('bubble_leveler', 'مستوى توازن الجهاز')}</span>
              <span className={cn(
                "uppercase", 
                Math.abs(orientation.beta) < 5 && Math.abs(orientation.gamma) < 5 ? "text-teal-400" : "text-amber-500"
              )}>
                {Math.abs(orientation.beta) < 5 && Math.abs(orientation.gamma) < 5 ? t('level_perfect', 'مستوٍ تماماً') : t('level_tilt', 'مائل')}
              </span>
            </div>
            
            <div className="h-10 bg-black/35 rounded-xl relative overflow-hidden flex items-center justify-center border border-white/5">
               {/* Center marker */}
               <div className="absolute w-5 h-5 rounded-full border border-teal-500/20" />
               <div className="absolute w-[1px] h-full bg-white/5 left-1/2 -translate-x-1/2" />
               <div className="absolute h-[1px] w-full bg-white/5 top-1/2 -translate-y-1/2" />
               
               {/* Level Bubble ball */}
               <motion.div 
                 animate={{
                   x: Math.max(Math.min(orientation.gamma * 1.5, 65), -65),
                   y: Math.max(Math.min(orientation.beta * 1.5, 12), -12)
                 }}
                 className={cn(
                   "w-4 h-4 rounded-full shadow-md border-2 transition-colors",
                   Math.abs(orientation.beta) < 5 && Math.abs(orientation.gamma) < 5 
                     ? "bg-teal-500 border-teal-300 shadow-teal-500/50" 
                     : "bg-slate-500 border-slate-300 shadow-slate-500/50"
                 )}
               />
            </div>
          </div>
        </div>

        {/* Location & Geographic telemetry summary */}
        {showTelemetry && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="w-full bg-white/5 rounded-3xl p-5 border border-white/5 space-y-4"
          >
             {/* Mecca bearing line */}
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400 shrink-0">
                 <MapPin size={20} />
               </div>
               <div className="flex-1 min-w-0">
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('calculated_from', 'الموقع الجغرافي المكتشف')}</p>
                 <h4 className="text-sm font-black text-white truncate">{locationName || "..."}</h4>
               </div>
               {coords && (
                 <div className="text-right shrink-0">
                   <p className="text-[10px] font-mono text-slate-400">{coords.lat.toFixed(3)}°N</p>
                   <p className="text-[10px] font-mono text-slate-400">{coords.lng.toFixed(3)}°E</p>
                 </div>
               )}
             </div>

             <div className="h-[1px] bg-white/5" />

             {/* Distance metric */}
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 text-slate-300 text-xs font-bold">
                 <LocateFixed size={15} className="text-indigo-400" />
                 <span>{t('distance_to_kaaba', 'المسافة المباشرة للكعبة')}</span>
               </div>
               <span className="font-mono text-sm font-black text-white">
                 {distance !== null ? `${Math.round(distance).toLocaleString()} ${t('km', 'كم')}` : "---"}
               </span>
             </div>

             {/* Compass Sensor status */}
             <div className="flex items-center justify-between text-xs">
               <span className="text-slate-400 font-bold flex items-center gap-1.5">
                 <CompassIcon size={14} className="text-teal-400" />
                 <span>{t('sensor_precision', 'دقة بوصلة الجهاز')}</span>
               </span>
               <span className={cn(
                 "font-black px-2 py-0.5 rounded-md text-[10px]",
                 sensorMode === 'high-precision' ? "bg-teal-500/10 text-teal-400" : "bg-white/5 text-slate-400"
               )}>
                 {sensorMode === 'high-precision' ? t('magnetometer_fused', 'مدمجة فائق الدقة') : t('standard_device_api', 'عادي')}
               </span>
             </div>
          </motion.div>
        )}

        {/* Warning Guide Helper */}
        <div className="w-full bg-[#121822]/40 rounded-2xl p-4 border border-[#1e293b]/50 space-y-3">
           <div className="flex items-start gap-3">
             <Info size={16} className="text-blue-400 shrink-0 mt-0.5" />
             <div className="space-y-1">
               <p className="text-[11px] font-black text-slate-300 leading-snug">
                 {t('calibration_desc_new', 'لتحسين دقة بوصلة المغناطيس الذكية، يرجى حمل الهاتف مسطحاً تماماً وتحريكه في الهواء على شكل مسار رقم 8 لضمان معايرة الحساس.')}
               </p>
               <button 
                 onClick={() => setShowCalibrationHelp(!showCalibrationHelp)}
                 className="text-[10px] font-extrabold text-teal-400 flex items-center gap-1 mt-1 hover:underline"
               >
                 <span>{showCalibrationHelp ? t('hide_animation_guide', 'إخفاء الدليل المتحرك') : t('show_animation_guide', 'عرض الدليل التوضيحي')}</span>
               </button>
             </div>
           </div>

           {/* Guided Hand Rotation figure-8 canvas animation */}
           <AnimatePresence>
             {showCalibrationHelp && (
               <motion.div 
                 initial={{ opacity: 0, height: 0 }}
                 animate={{ opacity: 1, height: 'auto' }}
                 exit={{ opacity: 0, height: 0 }}
                 className="pt-2 flex flex-col items-center justify-center space-y-2 overflow-hidden bg-black/20 rounded-xl p-3"
               >
                 <svg className="w-24 h-12 text-teal-400/50" viewBox="0 0 100 50" fill="none">
                   {/* Figure 8 path */}
                   <path 
                     d="M 50 25 C 20 -15, 0 15, 50 25 C 100 35, 80 65, 50 25" 
                     stroke="currentColor" 
                     strokeWidth="2" 
                     strokeDasharray="4 4"
                   />
                   {/* Animated phone dot */}
                   <motion.circle
                     r="4"
                     fill="#2dd4bf"
                     animate={{
                       pathOffset: [0, 1]
                     }}
                     transition={{
                       repeat: Infinity,
                       duration: 3,
                       ease: "linear"
                     }}
                     style={{
                       offsetPath: "path('M 50 25 C 20 -15, 0 15, 50 25 C 100 35, 80 65, 50 25')",
                       offsetRotate: "auto"
                     }}
                   />
                 </svg>
                 <span className="text-[9px] font-extrabold text-slate-400 text-center uppercase tracking-wider">{t('move_in_infinity_pattern', 'حرك الجهاز على شكل رقم 8 في الهواء')}</span>
               </motion.div>
             )}
           </AnimatePresence>
        </div>
        
      </div>
      
      {/* Settings Dialog Overlay */}
      <AnimatePresence>
        {showSettings && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
              className="fixed inset-0 bg-black/75 backdrop-blur-md z-[100]"
            />
            <motion.div 
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: "spring", damping: 28, stiffness: 210 }}
              className="fixed bottom-0 left-0 right-0 bg-[#0d121c] border-t border-white/5 rounded-t-[2.5rem] z-[110] p-6 pb-12 shadow-2xl max-h-[85vh] overflow-y-auto"
            >
              <div className="w-12 h-1 bg-white/10 rounded-full mx-auto mb-6" />
              
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <Sliders size={20} className="text-teal-400" />
                  <h3 className="text-lg font-black text-white">{t('compass_customization', 'تهيئة نظام البوصلة')}</h3>
                </div>
                <button 
                  onClick={() => setShowSettings(false)}
                  className="w-8 h-8 bg-white/5 hover:bg-white/10 text-white rounded-full flex items-center justify-center transition-all"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4">
                
                {/* Advanced high-precision generic sensor API */}
                {sensorAvailable && (
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                    <div className="flex-1 pr-4 text-right">
                      <h4 className="text-white text-xs font-black mb-0.5">{t('high_precision_magnetometer', 'الحساس فائق الدقة (Magnetometer)')}</h4>
                      <p className="text-slate-400 text-[10px] font-bold leading-normal">{t('use_raw_magnetometer', 'دمج حساسات التسارع المغناطيسي 3D لزيادة سرعة التجاوب والدقة')}</p>
                    </div>
                    <button 
                      onClick={() => setSensorMode(sensorMode === 'auto' ? 'high-precision' : 'auto')}
                      className={cn(
                        "w-12 h-7 rounded-full p-0.5 transition-colors duration-200 relative",
                        sensorMode === 'high-precision' ? "bg-teal-500" : "bg-white/10"
                      )}
                    >
                      <motion.div 
                        layout
                        className={cn(
                          "w-6 h-6 rounded-full bg-white shadow-md",
                          sensorMode === 'high-precision' ? "mr-auto" : "ml-auto"
                        )}
                      />
                    </button>
                  </div>
                )}

                {/* Sound Guidance Beep */}
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                  <div className="flex-1 pr-4 text-right">
                    <h4 className="text-white text-xs font-black mb-0.5">{t('audio_proximity_clicks', 'صوت المساعد الذكي')}</h4>
                    <p className="text-slate-400 text-[10px] font-bold leading-normal">{t('beep_speeds_up_close', 'نغمة يتسارع إيقاعها كلما اقتربت من محاذاة القبلة')}</p>
                  </div>
                  <button 
                    onClick={() => setAudioFeedback(!audioFeedback)}
                    className={cn(
                      "w-12 h-7 rounded-full p-0.5 transition-colors duration-200 relative",
                      audioFeedback ? "bg-teal-500" : "bg-white/10"
                    )}
                  >
                    <motion.div 
                      layout
                      className={cn(
                        "w-6 h-6 rounded-full bg-white shadow-md",
                        audioFeedback ? "mr-auto" : "ml-auto"
                      )}
                    />
                  </button>
                </div>

                {/* Haptic / Vibration feedback */}
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                  <div className="flex-1 pr-4 text-right">
                    <h4 className="text-white text-xs font-black mb-0.5">{t('vibration_feedback', 'الاهتزاز الذكي')}</h4>
                    <p className="text-slate-400 text-[10px] font-bold leading-normal">{t('vibrate_upon_kaaba', 'اهتزاز لطيف ينبهك فوراً عند محاذاة الكعبة المشرفة')}</p>
                  </div>
                  <button 
                    onClick={() => setEnableHaptics(!enableHaptics)}
                    className={cn(
                      "w-12 h-7 rounded-full p-0.5 transition-colors duration-200 relative",
                      enableHaptics ? "bg-teal-500" : "bg-white/10"
                    )}
                  >
                    <motion.div 
                      layout
                      className={cn(
                        "w-6 h-6 rounded-full bg-white shadow-md",
                        enableHaptics ? "mr-auto" : "ml-auto"
                      )}
                    />
                  </button>
                </div>

                {/* Show details dashboard / telemetry toggle */}
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                  <div className="flex-1 pr-4 text-right">
                    <h4 className="text-white text-xs font-black mb-0.5">{t('location_details_bar', 'لوحة إحداثيات الموقع')}</h4>
                    <p className="text-slate-400 text-[10px] font-bold leading-normal">{t('toggle_geographic_metrics', 'عرض إحداثيات المدينة، الارتفاع، والمسافة الجغرافية للكعبة')}</p>
                  </div>
                  <button 
                    onClick={() => setShowTelemetry(!showTelemetry)}
                    className={cn(
                      "w-12 h-7 rounded-full p-0.5 transition-colors duration-200 relative",
                      showTelemetry ? "bg-teal-500" : "bg-white/10"
                    )}
                  >
                    <motion.div 
                      layout
                      className={cn(
                        "w-6 h-6 rounded-full bg-white shadow-md",
                        showTelemetry ? "mr-auto" : "ml-auto"
                      )}
                    />
                  </button>
                </div>

                {/* Bezel Style customization */}
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-3 text-right">
                  <div className="flex items-center gap-2 justify-end mb-1">
                    <span className="text-white text-xs font-black">{t('bezel_style_select', 'مظهر وموديل قرص البوصلة')}</span>
                    <Palette size={16} className="text-teal-400" />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button 
                      onClick={() => setCompassStyle('modern')}
                      className={cn(
                        "p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-[11px] font-black",
                        compassStyle === 'modern' ? "bg-teal-500/15 border-teal-500 text-teal-300" : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                      )}
                    >
                      <Zap size={15} />
                      <span>{t('theme_modern_hud', 'عصري 3D')}</span>
                    </button>
                    <button 
                      onClick={() => setCompassStyle('astrolabe')}
                      className={cn(
                        "p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-[11px] font-black",
                        compassStyle === 'astrolabe' ? "bg-[#dfb76c]/15 border-[#dfb76c] text-[#dfb76c]" : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                      )}
                    >
                      <CompassIcon size={15} />
                      <span>{t('theme_traditional_astrolabe', 'الأسطرلاب')}</span>
                    </button>
                    <button 
                      onClick={() => setCompassStyle('minimal')}
                      className={cn(
                        "p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-[11px] font-black",
                        compassStyle === 'minimal' ? "bg-white/10 border-white/20 text-white" : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                      )}
                    >
                      <Crosshair size={15} />
                      <span>{t('theme_minimal', 'بسيط جداً')}</span>
                    </button>
                  </div>
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
