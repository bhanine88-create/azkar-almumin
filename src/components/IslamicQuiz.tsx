import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { 
  History, 
  BookOpen, 
  Compass, 
  Users, 
  Shield,
  Scroll,
  Globe,
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  Award, 
  RotateCcw,
  Lightbulb,
  ArrowRight,
  Timer,
  Flame
} from 'lucide-react';
import { cn } from '../lib/utils';
import { BackButton } from './ui/BackButton';
import { QUIZ_CATEGORIES, QUIZ_QUESTIONS, QuizCategory, QuizQuestion } from '../data/quizData';
import { playCorrectSound, playWrongSound, playCompletionSound } from '../lib/sounds';
import { useAppContext } from '../AppContext';

const iconMap: Record<string, any> = {
  History,
  BookOpen,
  Compass,
  Users,
  Shield,
  Scroll,
  Globe,
};

export const IslamicQuiz: React.FC = () => {
  const { settings } = useAppContext();
  const initialTimer = settings.quizTimerDuration || 20;
  const [selectedCategory, setSelectedCategory] = useState<QuizCategory | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard' | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(initialTimer);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState<number[]>([]);

  // Filter questions based on selected category
  const filteredQuestions = useMemo(() => {
    if (!selectedCategory) return [];
    // Shuffle the questions for variety (simple shuffle for client-side)
    const categoryQuestions = QUIZ_QUESTIONS.filter(q => q.category === selectedCategory && (!selectedDifficulty || q.difficulty === selectedDifficulty));
    return categoryQuestions.sort(() => Math.random() - 0.5);
  }, [selectedCategory, selectedDifficulty]);

  const currentQuestion = filteredQuestions[currentQuestionIndex];

  const handleStartCategory = (categoryId: QuizCategory) => {
    setSelectedCategory(categoryId);
  };

  const handleStartDifficulty = (difficulty: 'easy' | 'medium' | 'hard') => {
    setSelectedDifficulty(difficulty);
    setCurrentQuestionIndex(0);
    setScore(0);
    setCorrectAnswersCount(0);
    setStreak(0);
    setTimeLeft(initialTimer);
    setQuizCompleted(false);
    setSelectedAnswer(null);
    setAnsweredQuestions([]);
    setQuizStarted(true);
  };

  const handleAnswerSelect = (index: number) => {
    if (selectedAnswer !== null) return; // Already answered
    
    setSelectedAnswer(index);
    const isCorrect = index === currentQuestion.correctIndex;
    
    if (isCorrect) {
      playCorrectSound();
      setCorrectAnswersCount(prev => prev + 1);
      setStreak(prev => prev + 1);
      
      const timeBonus = Math.max(0, timeLeft);
      const streakMultiplier = Math.min(1 + streak * 0.1, 2);
      const pointsEarned = Math.round((10 + timeBonus) * streakMultiplier);
      setScore(prev => prev + pointsEarned);

      if ((window as any).navigator?.vibrate) {
        (window as any).navigator.vibrate([50, 50, 50]);
      }
      
      // Small confetti burst for correct answer
      confetti({
        particleCount: 30,
        spread: 40,
        origin: { y: 0.8 },
        colors: ['#10b981', '#34d399', '#f59e0b'],
        zIndex: 100
      });

    } else {
      playWrongSound();
      setStreak(0);
      if ((window as any).navigator?.vibrate) {
        (window as any).navigator.vibrate([200]); // longer vibration for wrong answer
      }
    }

    setAnsweredQuestions(prev => [...prev, index]);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (quizStarted && !quizCompleted && selectedAnswer === null && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && selectedAnswer === null) {
      handleAnswerSelect(-1);
    }
    return () => clearTimeout(timer);
  }, [quizStarted, quizCompleted, selectedAnswer, timeLeft]);

  const handleNextQuestion = () => {
    if (currentQuestionIndex < filteredQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setTimeLeft(initialTimer);
    } else {
      setQuizCompleted(true);
    }
  };

  useEffect(() => {
    if (quizCompleted) {
      playCompletionSound();
      // Fire confetti
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#10b981', '#059669', '#34d399']
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#3b82f6', '#2563eb', '#60a5fa']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [quizCompleted]);

  const resetQuiz = () => {
    setQuizStarted(false);
    setSelectedCategory(null);
    setSelectedDifficulty(null);
    setCurrentQuestionIndex(0);
    setScore(0);
    setCorrectAnswersCount(0);
    setStreak(0);
    setTimeLeft(initialTimer);
    setSelectedAnswer(null);
    setQuizCompleted(false);
    setAnsweredQuestions([]);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 text-right" dir="rtl">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-900/85 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/80 sticky top-0 z-30">
        <div className="px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {!selectedCategory ? (
              <BackButton />
            ) : !quizStarted ? (
              <button 
                onClick={() => setSelectedCategory(null)}
                className="w-10 h-10 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl flex items-center justify-center transition-colors cursor-pointer"
              >
                <ArrowRight size={20} />
              </button>
            ) : (
              <button 
                onClick={resetQuiz}
                className="w-10 h-10 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl flex items-center justify-center transition-colors cursor-pointer"
              >
                <ArrowRight size={20} />
              </button>
            )}
            <div>
              <h1 className="text-xl font-black bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 bg-clip-text text-transparent leading-tight">
                اختبر معلوماتك
              </h1>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wider">
                مسابقات واختبارات إسلامية
              </p>
            </div>
          </div>
          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
            <Lightbulb size={20} className="fill-white/20" />
          </div>
        </div>
      </div>

      <div className="px-4 py-6">
        <AnimatePresence mode="wait">
          {!selectedCategory ? (
            <motion.div
              key="categories"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="bg-gradient-to-br from-emerald-600 to-teal-800 rounded-3xl p-6 text-white shadow-xl shadow-emerald-900/20 relative overflow-hidden">
                <div className="absolute -left-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute right-0 bottom-0 w-full h-[50%] bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md mb-4 border border-white/20">
                    <Award size={26} className="text-white drop-shadow-sm" />
                  </div>
                  <h2 className="text-2xl font-black mb-2">تحدي المعرفة الإسلامية</h2>
                  <p className="text-emerald-100/90 text-sm font-medium leading-relaxed max-w-[90%]">
                    اختبر معلوماتك في مجالات إسلامية متنوعة، واكتسب معرفة جديدة مع كل سؤال. اختر القسم المفضل وابدأ التحدي.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {QUIZ_CATEGORIES.map((category, idx) => {
                  const Icon = iconMap[category.icon] || BookOpen;
                  const questionCount = QUIZ_QUESTIONS.filter(q => q.category === category.id).length;
                  
                  return (
                    <motion.button
                      key={category.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleStartCategory(category.id)}
                      className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200/50 dark:border-slate-800 shadow-sm hover:shadow-md transition-all text-right flex flex-col gap-3 group outline-none cursor-pointer"
                    >
                      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 bg-gradient-to-br shadow-md group-hover:scale-110 group-hover:rotate-3 transition-transform", category.color)}>
                        <Icon size={22} />
                      </div>
                      <div>
                        <h3 className="font-black text-slate-800 dark:text-white text-[15px] sm:text-base mb-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {category.title}
                        </h3>
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                          {questionCount} سؤال
                        </p>
                      </div>
                    </motion.button>
                  );
                })}

              </div>
            </motion.div>
          ) : !quizStarted && selectedCategory ? (
            <motion.div
              key="difficulty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 text-center border border-slate-200/50 dark:border-slate-800 shadow-sm relative overflow-hidden">
                <h2 className="text-xl font-black mb-2">اختر مستوى الصعوبة</h2>
                <p className="text-slate-500 text-sm font-medium">
                  حدد المستوى المناسب لمعلوماتك لبدء الاختبار
                </p>
              </div>
              <div className="flex flex-col gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleStartDifficulty('easy')}
                  className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 p-6 rounded-3xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-between group"
                >
                  <div className="text-right">
                    <h3 className="font-black text-lg mb-1">مبتدئ</h3>
                    <p className="text-sm font-medium opacity-80">أسئلة أساسية ومعلومات عامة مبسطة</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-800/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Scroll size={24} />
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleStartDifficulty('medium')}
                  className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 p-6 rounded-3xl border border-blue-200 dark:border-blue-800 flex items-center justify-between group"
                >
                  <div className="text-right">
                    <h3 className="font-black text-lg mb-1">متوسط</h3>
                    <p className="text-sm font-medium opacity-80">أسئلة تحتاج إلى تفكير ومعرفة جيدة</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-800/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Compass size={24} />
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleStartDifficulty('hard')}
                  className="bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 p-6 rounded-3xl border border-purple-200 dark:border-purple-800 flex items-center justify-between group"
                >
                  <div className="text-right">
                    <h3 className="font-black text-lg mb-1">متقدم</h3>
                    <p className="text-sm font-medium opacity-80">أسئلة دقيقة وتفصيلية للمتعمقين</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-800/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <History size={24} />
                  </div>
                </motion.button>
              </div>
            </motion.div>

          ) : quizCompleted ? (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 text-center border border-slate-100 dark:border-slate-800 shadow-xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-emerald-500/10 to-transparent" />
              
              <div className="relative z-10 flex flex-col items-center">
                <motion.div 
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                  className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-emerald-500/30 mb-6 border-4 border-white dark:border-slate-900 relative"
                >
                  <div className="absolute inset-0 bg-white/20 rounded-full animate-ping opacity-20" />
                  <Award size={48} />
                </motion.div>
                
                <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">
                  اكتمل التحدي!
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mb-6 font-medium">
                  لقد أجبت على جميع الأسئلة في قسم {QUIZ_CATEGORIES.find(c => c.id === selectedCategory)?.title}
                </p>
                
                <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl w-full mb-8">
                  <div className="flex-1">
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mb-1">النقاط</p>
                    <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                      {score}
                    </div>
                  </div>
                  <div className="w-px h-12 bg-slate-200 dark:bg-slate-700" />
                  <div className="flex-1">
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mb-1">النتيجة</p>
                    <div className="text-3xl font-black text-blue-600 dark:text-blue-400 flex items-center justify-center gap-1">
                      <span>{correctAnswersCount}</span>
                      <span className="text-lg text-slate-400">/ {filteredQuestions.length}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3 w-full">
                  <button
                    onClick={resetQuiz}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-2xl font-black text-sm transition-all shadow-md shadow-emerald-600/20 active:scale-95"
                  >
                    أقسام أخرى
                  </button>
                  <button
                    onClick={() => { if (selectedDifficulty) handleStartDifficulty(selectedDifficulty); }}
                    className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-3.5 rounded-2xl font-black text-sm transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <RotateCcw size={16} />
                    إعادة
                  </button>
                </div>
              </div>
            </motion.div>
          ) : currentQuestion ? (
            <motion.div
              key={`q-${currentQuestionIndex}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Progress */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: `${(currentQuestionIndex / filteredQuestions.length) * 100}%` }}
                    animate={{ width: `${((currentQuestionIndex + 1) / filteredQuestions.length) * 100}%` }}
                    className={cn(
                      "h-full rounded-full transition-all duration-500 bg-gradient-to-r",
                      QUIZ_CATEGORIES.find(c => c.id === selectedCategory)?.color
                    )}
                  />
                </div>
                <span className="text-xs font-black text-slate-500 dark:text-slate-400 min-w-[3rem] text-center">
                  {currentQuestionIndex + 1} / {filteredQuestions.length}
                </span>
              </div>

              {/* Status Bar */}
              <div className="flex items-center justify-between gap-3 bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200/60 dark:border-slate-800">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-xl">
                  <Award size={16} />
                  <span className="text-xs font-black">{score} نقطة</span>
                </div>
                
                {streak > 1 && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 rounded-xl"
                  >
                    <Flame size={16} className={streak > 2 ? 'animate-pulse' : ''} />
                    <span className="text-xs font-black">{streak} متتالية</span>
                  </motion.div>
                )}

                <div className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-xl transition-colors",
                  timeLeft <= 5 && selectedAnswer === null
                    ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 animate-pulse" 
                    : "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"
                )}>
                  <Timer size={16} />
                  <span className="text-xs font-black">{timeLeft} ث</span>
                </div>
              </div>

              {/* Question Card */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-md border border-slate-200/60 dark:border-slate-800">
                <span className="inline-block px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg text-[10px] font-black uppercase tracking-wider mb-4 border border-emerald-100 dark:border-emerald-800/50">
                  {QUIZ_CATEGORIES.find(c => c.id === selectedCategory)?.title}
                </span>
                
                <h3 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white leading-snug mb-8">
                  {currentQuestion.question}
                </h3>

                <div className="space-y-3">
                  {currentQuestion.options.map((option, idx) => {
                    const isSelected = selectedAnswer === idx;
                    const isCorrect = idx === currentQuestion.correctIndex;
                    const showStatus = selectedAnswer !== null;
                    
                    let btnClass = "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300";
                    let Icon = null;
                    
                    if (showStatus) {
                      if (isCorrect) {
                        btnClass = "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 text-emerald-700 dark:text-emerald-400";
                        Icon = <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />;
                      } else if (isSelected) {
                        btnClass = "bg-rose-50 dark:bg-rose-900/20 border-rose-500 text-rose-700 dark:text-rose-400";
                        Icon = <XCircle size={18} className="text-rose-500 shrink-0" />;
                      } else {
                        btnClass = "bg-slate-50 dark:bg-slate-800/60 border-transparent text-slate-400 dark:text-slate-500 opacity-60";
                      }
                    }

                    return (
                      <motion.button
                        key={idx}
                        layout
                        disabled={showStatus}
                        onClick={() => handleAnswerSelect(idx)}
                        animate={
                          showStatus
                            ? isCorrect
                              ? { 
                                  scale: [1, 1.03, 1],
                                  boxShadow: ["0px 0px 0px rgba(16,185,129,0)", "0px 4px 20px rgba(16,185,129,0.4)", "0px 0px 0px rgba(16,185,129,0)"],
                                  transition: { duration: 0.6, ease: "easeOut" }
                                }
                              : isSelected
                              ? { 
                                  x: [0, -8, 8, -8, 8, -4, 4, 0], 
                                  transition: { duration: 0.5 }
                                }
                              : { opacity: 0.5, scale: 0.98, transition: { duration: 0.3 } }
                            : {}
                        }
                        className={cn(
                          "w-full text-right p-4 rounded-2xl border-2 transition-all duration-300 flex items-center justify-between gap-3 font-bold text-sm sm:text-base outline-none",
                          btnClass,
                          !showStatus && "cursor-pointer hover:-translate-y-0.5 active:scale-[0.98]"
                        )}
                      >
                        <span className="flex-1">{option}</span>
                        {Icon && (
                          <motion.div initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                            {Icon}
                          </motion.div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Explanation & Next */}
                <AnimatePresence>
                  {selectedAnswer !== null && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      className="overflow-hidden"
                    >
                      {currentQuestion.explanation && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-2xl p-4 mb-6">
                          <h4 className="flex items-center gap-2 font-black text-blue-800 dark:text-blue-300 text-sm mb-2">
                            <Lightbulb size={16} />
                            معلومة
                          </h4>
                          <p className="text-blue-700 dark:text-blue-200 text-sm leading-relaxed font-medium">
                            {currentQuestion.explanation}
                          </p>
                        </div>
                      )}
                      
                      <button
                        onClick={handleNextQuestion}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-2xl font-black text-base flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20 active:scale-[0.98] cursor-pointer outline-none"
                      >
                        {currentQuestionIndex < filteredQuestions.length - 1 ? 'السؤال التالي' : 'عرض النتيجة'}
                        <ChevronRight size={20} />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default IslamicQuiz;
