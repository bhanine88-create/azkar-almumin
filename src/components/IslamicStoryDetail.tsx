import React, { useMemo, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Share2, 
  Heart, 
  Clock, 
  User, 
  Users, 
  Crown, 
  Book, 
  BookOpen, 
  History, 
  Sparkles, 
  Check,
  Type,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  BookOpenText,
  BookmarkCheck,
  ArrowRight,
  Award
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { cn } from '../lib/utils';
import { BackButton } from './ui/BackButton';
import { shareContent } from '../lib/utils';
import { ISLAMIC_STORIES } from '../data/islamicStories';
import { useAppContext } from '../AppContext';
import { safeLocalStorageGetItem, safeLocalStorageSetItem, safeLocalStorageRemoveItem } from "../utils/storage";

const CATEGORIES = [
  { id: 'all', label: 'الكل', icon: Sparkles, color: 'from-amber-500 to-orange-600' },
  { id: 'prophets', label: 'قصص الأنبياء', icon: Crown, color: 'from-emerald-500 to-teal-600' },
  { id: 'companions', label: 'قصص الصحابة', icon: Users, color: 'from-blue-500 to-indigo-600' },
  { id: 'biography', label: 'السيرة النبوية', icon: Book, color: 'from-rose-500 to-pink-600' },
  { id: 'quran', label: 'قصص القرآن', icon: BookOpen, color: 'from-purple-500 to-fuchsia-600' },
  { id: 'history', label: 'التاريخ الإسلامي', icon: History, color: 'from-cyan-500 to-blue-600' },
];

const getCategoryDetails = (categoryId: string) => {
  return CATEGORIES.find(c => c.id === categoryId) || CATEGORIES[0];
};

const getReadingTime = (text: string) => {
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 180));
  return `${minutes} دقيقة`;
};

export const IslamicStoryDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toggleFavoriteUnified, progress, addPoints } = useAppContext();

  // Font size state
  const [fontSize, setFontSize] = useState<number>(20); // default 20px for high readability

  // Scroll Progress
  const [scrollProgress, setScrollProgress] = useState<number>(0);

  // Mark as Read state
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [celebrate, setCelebrate] = useState<boolean>(false);

  // Audio / TTS States
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [ttsSpeed, setTtsSpeed] = useState<number>(1);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const story = useMemo(() => {
    return ISLAMIC_STORIES.find(s => s.id === id);
  }, [id]);

  const isFavorite = useMemo(() => {
    return (progress.favorites || []).some(fav => fav.id === id && fav.type === 'story');
  }, [progress.favorites, id]);

  // Load completion status and handle scroll listener
  useEffect(() => {
    if (!story) return;

    // Load completed state
    try {
      const saved = safeLocalStorageGetItem('believer_read_stories');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.includes(story.id)) {
          setIsCompleted(true);
        }
      }
    } catch (e) {
      console.warn(e);
    }

    // Scroll progress handler
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        const currentProgress = (window.scrollY / totalScroll) * 100;
        setScrollProgress(currentProgress);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      // Stop speech on page change
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, [story]);

  // Init browser SpeechSynthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  if (!story) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center" dir="rtl">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center text-slate-400 mb-4">
          <BookOpen size={32} />
        </div>
        <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">القصة غير موجودة</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6 font-bold">عذراً، لم نتمكن من العثور على القصة التي تبحث عنها.</p>
        <button
          onClick={() => navigate('/stories')}
          className="bg-amber-500 hover:bg-amber-400 text-white px-6 py-3.5 rounded-2xl font-black shadow-lg shadow-amber-500/20 cursor-pointer"
        >
          العودة لقائمة القصص
        </button>
      </div>
    );
  }

  const categoryDetails = getCategoryDetails(story.category);
  const Icon = categoryDetails.icon;
  const readingTime = getReadingTime(story.content);

  // Share story
  const handleShare = async () => {
    const text = `📖 *${story.title}*\n\nاقرأ هذه القصة الملهمة وغيرها من السير والقصص الإسلامية عبر تطبيق أذكار المؤمن.\n\nرابط القصة:`;
    await shareContent(story.title, text, window.location.href);
  };

  // Toggle Completed status and reward points
  const handleMarkAsCompleted = () => {
    if (isCompleted) return;

    try {
      const saved = safeLocalStorageGetItem('believer_read_stories');
      const readArray = saved ? JSON.parse(saved) : [];
      if (!readArray.includes(story.id)) {
        readArray.push(story.id);
        safeLocalStorageSetItem('believer_read_stories', JSON.stringify(readArray));
      }
      setIsCompleted(true);
      setCelebrate(true);
      addPoints(30); // Reward 30 points for reading!

      // Reset celebration banner after 4 seconds
      setTimeout(() => {
        setCelebrate(false);
      }, 4000);
    } catch (e) {
      console.warn(e);
    }
  };

  // Text-To-Speech Controls
  const handleSpeechPlayPause = () => {
    if (!synthRef.current) return;

    if (isSpeaking) {
      if (isPaused) {
        synthRef.current.resume();
        setIsPaused(false);
      } else {
        synthRef.current.pause();
        setIsPaused(true);
      }
    } else {
      synthRef.current.cancel(); // cancel any active speech

      const textToSpeak = `${story.title}. ${story.content}`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      
      // Try to find a premium Arabic voice
      const voices = synthRef.current.getVoices();
      const arabicVoice = voices.find(v => v.lang.startsWith('ar'));
      if (arabicVoice) {
        utterance.voice = arabicVoice;
      }
      utterance.lang = 'ar-SA';
      utterance.rate = ttsSpeed;

      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        setIsPaused(false);
      };

      utteranceRef.current = utterance;
      synthRef.current.speak(utterance);
      setIsSpeaking(true);
      setIsPaused(false);
    }
  };

  const handleSpeechStop = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  };

  // Handle speed toggling
  const handleTtsSpeedToggle = () => {
    const nextSpeed = ttsSpeed === 1 ? 1.25 : ttsSpeed === 1.25 ? 1.5 : ttsSpeed === 1.5 ? 0.85 : 1;
    setTtsSpeed(nextSpeed);
    
    // If speaking, restart with new speed
    if (isSpeaking && synthRef.current) {
      synthRef.current.cancel();
      const textToSpeak = `${story.title}. ${story.content}`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      const voices = synthRef.current.getVoices();
      const arabicVoice = voices.find(v => v.lang.startsWith('ar'));
      if (arabicVoice) utterance.voice = arabicVoice;
      utterance.lang = 'ar-SA';
      utterance.rate = nextSpeed;
      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
      };
      utteranceRef.current = utterance;
      synthRef.current.speak(utterance);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 text-right" dir="rtl">
      
      {/* Sticky Top Header */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-150 dark:border-slate-800">
        <div className="px-4 py-3.5 flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-1">
            <BackButton />
            <span className="text-xs font-black text-slate-400 dark:text-slate-500 hidden sm:inline">تفاصيل القصة</span>
          </div>

          {/* Scroll progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100 dark:bg-slate-800 pointer-events-none">
            <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-75" style={{ width: `${scrollProgress}%` }} />
          </div>

          <div className="flex gap-2">
            {/* Font Size Adjusters */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl px-1.5 py-0.5">
              <button 
                onClick={() => setFontSize(prev => Math.max(16, prev - 2))}
                disabled={fontSize <= 16}
                className="p-1.5 text-xs font-black text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white disabled:opacity-30 cursor-pointer"
                title="تصغير الخط"
              >
                أ-
              </button>
              <div className="w-[1px] h-3 bg-slate-300 dark:bg-slate-700 mx-1" />
              <button 
                onClick={() => setFontSize(prev => Math.min(28, prev + 2))}
                disabled={fontSize >= 28}
                className="p-1.5 text-xs font-black text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white disabled:opacity-30 cursor-pointer"
                title="تكبير الخط"
              >
                أ+
              </button>
            </div>

            {/* Favorite button */}
            <button 
              onClick={() => {
                toggleFavoriteUnified({
                  id: story.id,
                  type: 'story',
                  title: story.title,
                  subtitle: getCategoryDetails(story.category).label,
                  route: `/stories/${story.id}`
                });
              }}
              className={cn(
                "p-2.5 rounded-xl transition-all duration-300 active:scale-90 cursor-pointer",
                isFavorite 
                  ? "bg-rose-50 dark:bg-rose-950/30 text-rose-500 shadow-sm border border-rose-500/10" 
                  : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 dark:text-slate-400"
              )}
              title="أضف للمفضلة"
            >
              <Heart size={18} className={isFavorite ? "fill-current" : ""} />
            </button>

            {/* Share button */}
            <button 
              onClick={handleShare}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors text-slate-500 dark:text-slate-400 active:scale-90 cursor-pointer"
              title="مشاركة القصة"
            >
              <Share2 size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Hero Header with category specific color */}
      <div className={cn("pt-24 pb-16 px-6 bg-gradient-to-br text-white relative overflow-hidden shadow-inner", categoryDetails.color)}>
        <div className="absolute inset-0 bg-[url('/images/arabesque.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-4xl mx-auto relative z-10 space-y-4">
          <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-xl text-xs font-black shadow-sm border border-white/10 uppercase">
            <Icon size={12} />
            {categoryDetails.label}
          </span>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight drop-shadow-md text-right">
            {story.title}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-white/90 text-xs font-bold pt-2">
            <span className="flex items-center gap-1.5 bg-black/10 px-3 py-1.5 rounded-xl backdrop-blur-sm">
              <Clock size={13} />
              <span>وقت القراءة: {readingTime}</span>
            </span>
            <span className="flex items-center gap-1.5 bg-black/10 px-3 py-1.5 rounded-xl backdrop-blur-sm">
              <BookOpenText size={13} />
              <span>عدد الكلمات: {story.content.trim().split(/\s+/).length} كلمة</span>
            </span>
          </div>
        </div>
      </div>

      {/* Audio Narrator Panel (Floating / Sticky widget) */}
      <div className="max-w-4xl mx-auto px-4 -mt-6 relative z-30">
        <div className="bg-white dark:bg-slate-900 border border-slate-250/30 dark:border-slate-800/80 rounded-2xl p-4 shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white", isSpeaking ? "bg-emerald-500 animate-pulse" : "bg-slate-100 dark:bg-slate-800 text-slate-500")}>
              <Volume2 size={20} />
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-800 dark:text-white leading-tight">القارئ الصوتي الذكي</h4>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">استمع إلى تلاوة القصة بالصوت العربي الطبيعي</p>
            </div>
          </div>

          {/* Audio Controls */}
          <div className="flex items-center gap-2">
            {isSpeaking && (
              <button
                onClick={handleSpeechStop}
                className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 text-rose-500 transition-all text-xs font-black flex items-center gap-1 cursor-pointer"
                title="إيقاف التشغيل"
              >
                <RotateCcw size={14} />
                <span>إيقاف</span>
              </button>
            )}

            <button
              onClick={handleSpeechPlayPause}
              className={cn(
                "px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer",
                isSpeaking && !isPaused
                  ? "bg-amber-500 text-white shadow-md shadow-amber-500/10"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/10"
              )}
            >
              {isSpeaking && !isPaused ? (
                <>
                  <Pause size={14} />
                  <span>إيقاف مؤقت</span>
                </>
              ) : (
                <>
                  <Play size={14} />
                  <span>{isPaused ? "استئناف" : "استمع الآن"}</span>
                </>
              )}
            </button>

            {/* Speed toggle */}
            <button
              onClick={handleTtsSpeedToggle}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-extrabold hover:bg-slate-200 cursor-pointer"
              title="تغيير سرعة القراءة"
            >
              {ttsSpeed}x
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-4 sm:px-6 mt-6 max-w-4xl mx-auto space-y-6">
        
        {/* Story completed notification banner */}
        <AnimatePresence>
          {celebrate && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-4.5 rounded-2xl text-center shadow-lg flex flex-col items-center justify-center gap-2"
            >
              <Award size={32} className="text-amber-300 animate-bounce" />
              <h4 className="text-lg font-black">تهانينا! لقد أتممت قراءة القصة بنجاح</h4>
              <p className="text-xs text-emerald-50 font-bold">تمت إضافة +30 نقطة إيمانية إلى رصيدك وزيادة مستوى تقدمك!</p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-9 shadow-md border border-slate-200/40 dark:border-slate-800/85 relative"
        >
          {/* Main paragraphs */}
          <div 
            className="text-slate-800 dark:text-slate-100 leading-relaxed font-bold tracking-wide text-right whitespace-pre-line"
            style={{ 
              fontSize: `${fontSize}px`, 
              lineHeight: 1.8,
              fontFamily: "'Amiri', 'Georgia', serif"
            }}
          >
            {story.content.split('\n\n').map((para, i) => {
              // Beautify quotes or Quranic verses if we detect quotes
              const isQuote = para.trim().startsWith('"') || para.trim().startsWith('«') || para.trim().startsWith('قوله تعالى:');
              return (
                <p 
                  key={i} 
                  className={cn(
                    "mb-6", 
                    isQuote 
                      ? "p-5 rounded-2xl bg-slate-50 dark:bg-slate-850 border-r-4 border-amber-500 font-extrabold text-amber-900 dark:text-amber-300 italic" 
                      : ""
                  )}
                >
                  {para}
                </p>
              );
            })}
          </div>

          {/* Ending Advice Box */}
          <div className="mt-12 p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-850 dark:to-slate-900 border border-slate-200/50 dark:border-slate-800 text-center text-slate-600 dark:text-slate-300">
            <Sparkles size={24} className="mx-auto mb-3 text-amber-500 opacity-70 animate-pulse" />
            <p className="italic font-black text-base sm:text-lg text-slate-700 dark:text-slate-300">
              "لَقَدْ كَانَ فِي قَصَصِهِمْ عِبْرَةٌ لِأُولِي الْأَلْبَابِ"
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-bold mt-2">سورة يوسف - الآية ١١١</p>
          </div>

          {/* Interactive Mark as Completed Button */}
          <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-right">
              <h5 className="text-sm font-black text-slate-700 dark:text-slate-300">هل أكملت القراءة؟</h5>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-bold">اضغط لتسجيل قراءة القصة والحصول على نقاط المكافأة</p>
            </div>

            {isCompleted ? (
              <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-black px-5 py-3 rounded-2xl border border-emerald-500/10 text-xs shadow-inner">
                <Check size={16} className="stroke-[3]" />
                <span>تم إتمام القراءة وجني المكافأة</span>
              </div>
            ) : (
              <button
                onClick={handleMarkAsCompleted}
                className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-6 py-4 rounded-2xl font-black text-xs shadow-lg shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <BookmarkCheck size={16} />
                <span>إتمام القراءة (+30 نقطة)</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
