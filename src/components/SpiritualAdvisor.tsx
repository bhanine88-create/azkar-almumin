import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Heart, BrainCircuit, Activity, CloudRain, Sun, Compass, RefreshCw, MessageSquare, Send, BookOpen, Quote, Target, ArrowRight } from 'lucide-react';
import { BackButton } from './ui/BackButton';
import { useAppContext } from '../AppContext';
import { cn } from '../lib/utils';
import Markdown from 'react-markdown';

export const SpiritualAdvisor: React.FC = () => {
  const { settings } = useAppContext();
  const [selectedState, setSelectedState] = useState<string>('');
  const [customInput, setCustomInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  const EMOTIONS = [
    { id: 'حزن وضيق', label: 'حزن وضيق', icon: <CloudRain size={18} />, color: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800' },
    { id: 'فتور إيماني', label: 'فتور إيماني', icon: <Activity size={18} />, color: 'bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700' },
    { id: 'تشتت وقلق', label: 'تشتت وقلق', icon: <BrainCircuit size={18} />, color: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800' },
    { id: 'شكر ورضا', label: 'شكر ورضا', icon: <Sun size={18} />, color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' },
    { id: 'ضعف وعجز', label: 'ضعف وعجز', icon: <Heart size={18} />, color: 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800' },
    { id: 'أبحث عن التوجيه', label: 'أبحث عن التوجيه', icon: <Compass size={18} />, color: 'bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400 border-teal-200 dark:border-teal-800' },
  ];

  const handleGenerate = async () => {
    if (!selectedState && !customInput) return;
    
    setIsLoading(true);
    setAiResponse(null);
    
    try {
      const response = await fetch('/api/zad-guidance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          state: selectedState || 'عام',
          customQuestion: customInput || 'احتاج لتوجيه إيماني'
        })
      });
      
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setAiResponse(data.text);
    } catch (err) {
      console.error(err);
      setAiResponse('عذراً، لم نتمكن من الوصول للمستشار في الوقت الحالي. حاول مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setAiResponse(null);
    setSelectedState('');
    setCustomInput('');
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <header className="sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md py-4 px-4 flex justify-between items-center border-b border-black/5 z-20">
        <div className="flex items-center gap-3">
          <BackButton forceFallback={true} />
          <div>
            <h1 className="text-xl font-black bg-gradient-to-r from-teal-600 to-emerald-700 bg-clip-text text-transparent flex items-center gap-2">
              <Sparkles size={20} className="text-teal-600" />
              المستشار الإيماني الذكي
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">موجّهك الروحي بالذكاء الاصطناعي</p>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
        <AnimatePresence mode="wait">
          {!aiResponse && !isLoading ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 dark:border-slate-800 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none" />
                
                <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-teal-500/30 transform rotate-3">
                  <Heart size={32} />
                </div>
                
                <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-2">كيف تجد قلبك اليوم؟</h2>
                <p className="text-sm text-slate-500 font-bold mb-8">دع الذكاء الاصطناعي يرشدك بآيات وأحاديث تناسب حالتك</p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6 relative z-10">
                  {EMOTIONS.map(emotion => (
                    <button
                      key={emotion.id}
                      onClick={() => setSelectedState(emotion.id)}
                      className={cn(
                        "p-4 rounded-2xl border transition-all flex flex-col items-center justify-center gap-3 active:scale-95",
                        selectedState === emotion.id 
                          ? "bg-teal-600 border-teal-600 text-white shadow-lg shadow-teal-500/20 scale-105"
                          : `${emotion.color} hover:scale-105 hover:shadow-md`
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center bg-white/50 backdrop-blur-sm",
                        selectedState === emotion.id ? "text-teal-600" : ""
                      )}>
                        {emotion.icon}
                      </div>
                      <span className="font-bold text-sm">{emotion.label}</span>
                    </button>
                  ))}
                </div>

                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare size={16} className="text-slate-400" />
                    <label className="text-xs font-bold text-slate-500 uppercase">أو صف شعورك بدقة</label>
                  </div>
                  <textarea
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="مثال: أشعر بضيق شديد بسبب ضغوط العمل وأريد ما يطمئن قلبي..."
                    className="w-full h-24 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl resize-none outline-none focus:border-teal-500 transition-colors text-sm font-bold placeholder:font-normal"
                    dir="rtl"
                  />
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={!selectedState && !customInput}
                  className={cn(
                    "w-full mt-6 py-4 rounded-2xl font-black text-white flex items-center justify-center gap-2 transition-all shadow-xl shadow-teal-500/20",
                    (!selectedState && !customInput) ? "bg-slate-300 dark:bg-slate-700 cursor-not-allowed shadow-none" : "bg-teal-600 hover:bg-teal-700 active:scale-95"
                  )}
                >
                  <Sparkles size={20} />
                  استشر الذكاء الاصطناعي
                </button>
              </div>
            </motion.div>
          ) : isLoading ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center gap-6"
            >
              <div className="relative">
                <div className="w-20 h-20 border-4 border-teal-500/20 rounded-full" />
                <div className="absolute top-0 left-0 w-20 h-20 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
                <BrainCircuit size={32} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-teal-600 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 mb-2">جاري استشارة النور...</h3>
                <p className="text-sm text-slate-500 font-bold">يتم الآن تحليل مشاعرك وجمع الآيات والأحاديث المناسبة</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-teal-500/10 text-teal-600 rounded-xl flex items-center justify-center">
                      <Sparkles size={24} />
                    </div>
                    <div>
                      <h3 className="font-black text-lg text-slate-800 dark:text-slate-100">توجيهك الروحي</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">مستشار أذكار المؤمن</p>
                    </div>
                  </div>
                  <button onClick={reset} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full hover:bg-slate-200 transition-colors">
                    <RefreshCw size={18} />
                  </button>
                </div>

                <div className="prose prose-sm sm:prose-base dark:prose-invert prose-teal max-w-none font-sans leading-loose text-justify markdown-body">
                  <Markdown>{aiResponse}</Markdown>
                </div>
              </div>

              <button
                onClick={reset}
                className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-2xl font-black hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
              >
                <ArrowRight size={18} />
                استشارة جديدة
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
