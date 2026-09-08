import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, HandHeart, Share2, Sparkles, BookOpen, Copy, Check, CheckCircle2, 
  Award, Send, Users, Gift, ScrollText, ChevronLeft, Star, Volume2, 
  ShieldCheck, Info, X, ExternalLink, QrCode, MessageCircle, HelpCircle
} from 'lucide-react';
import { cn, shareContent } from '../lib/utils';
import { useAppContext } from '../AppContext';
import { useTranslation } from '../i18n';
import { useSmartNavigation } from '../lib/navigation';

export const SadaqahJariyah: React.FC = () => {
  const { settings } = useAppContext();
  const { t, isRtl } = useTranslation(settings.appLanguage);
  const { navigate } = useSmartNavigation();

  // State for Dedication Card Generator
  const [dedicationName, setDedicationName] = useState('');
  const [dedicationType, setDedicationType] = useState<'parents' | 'deceased' | 'self' | 'general'>('deceased');
  const [isCopied, setIsCopied] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [showDedicationModal, setShowDedicationModal] = useState(false);

  // Welcome modal check
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);

  useEffect(() => {
    // Check if user came via a query param or first time
    const params = new URLSearchParams(window.location.hash.split('?')[1]);
    if (params.get('welcome') === 'true') {
      setIsWelcomeModalOpen(true);
    }
  }, []);

  const getAppShareUrl = () => {
    let currentOrigin = window.location.origin || '';
    if (!currentOrigin || currentOrigin === 'null') {
      currentOrigin = window.location.href.split('?')[0].split('#')[0];
    }
    return currentOrigin.replace(/ais-dev-/g, 'ais-pre-');
  };

  const handleShareApp = async (customMessage?: string) => {
    const shareUrl = getAppShareUrl();
    const defaultText = customMessage || 
      `🌱 *مشروع الصدقة الجارية - تطبيق زاد المؤمن*\n\nتطبيق إسلامي كامل بدون إعلانات احتساباً لوجه الله تعالى: قرآن كريم، أذكار، رقية شرعية، ومحاضرات صوتية.\n\nانشره بين أهلك وأحبابك ليكون لك صدقة جارية ونورٌ يدوم بإذن الله.\n\nرابط التطبيق المباشر:\n${shareUrl}`;

    await shareContent('زاد المؤمن - مشروع الصدقة الجارية', defaultText, shareUrl);
  };

  const copyToClipboard = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedSection(sectionId);
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
        setCopiedSection(null);
      }, 3000);
    });
  };

  const handleWhatsAppShare = (customMessage?: string) => {
    const shareUrl = getAppShareUrl();
    const text = customMessage || 
      `🌱 *مشروع الصدقة الجارية - تطبيق زاد المؤمن*\n\nتطبيق إسلامي جامع بدون إعلانات للقرآن والأذكار والرقية والمحاضرات.\n\nساهم في نشر الخير واحتسب ثوابه ليكون لك صدقة جارية:\n${shareUrl}`;
    
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  const getDedicationTitle = () => {
    switch (dedicationType) {
      case 'parents':
        return 'عن الوالدين الكرام (حفظهما الله أو رحمهما)';
      case 'deceased':
        return 'عن روح المتوفى (رحمه الله)';
      case 'self':
        return 'عن النفس والأهل';
      case 'general':
        return 'صدقة جارية عامة للمسلمين والمسلمات';
    }
  };

  return (
    <div className="min-h-full pb-20 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      {/* Top Banner Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-950 text-white pt-8 pb-10 px-5 rounded-b-[36px] shadow-2xl border-b border-emerald-500/20">
        {/* Arabesque Pattern */}
        <div 
          className="absolute inset-0 opacity-15 mix-blend-overlay pointer-events-none" 
          style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/arabesque.png')" }} 
        />
        
        {/* Soft Glowing Light Orbs */}
        <div className="absolute -top-12 -right-12 w-56 h-56 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-12 w-64 h-64 bg-teal-400/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto text-center space-y-4">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-emerald-400/30 shadow-inner">
            <Sparkles size={16} className="text-emerald-300 animate-pulse" />
            <span className="text-xs font-black text-emerald-200 tracking-wide">
              مشروع لوجه الله تعالى • بدون إعلانات
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight tracking-tight drop-shadow-md">
            مشروع الصدقة الجارية
          </h1>

          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-medium max-w-lg mx-auto drop-shadow-sm">
            نحسب هذا التطبيق ومحتواه من القرآن والأذكار والرقية والمحاضرات صدقةً جارية خالصة، ينمو أجرها مع كل تلاوة وذكر ونشر.
          </p>

          {/* Noble Hadith Box */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 text-right relative overflow-hidden shadow-lg mt-4">
            <div className="flex items-start gap-3">
              <ScrollText size={24} className="text-amber-300 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs sm:text-sm font-black text-amber-200 leading-relaxed">
                  قال رسول الله ﷺ:
                </p>
                <p className="text-xs sm:text-sm font-bold text-white/95 leading-relaxed italic">
                  «إِذَا مَاتَ الإِنْسَانُ انْقَطَعَ عَنْهُ عَمَلُهُ إِلاَّ مِنْ ثَلاَثٍ: إِلاَّ مِنْ صَدَقَةٍ جَارِيَةٍ، أَوْ عِلْمٍ يُنْتَفَعُ بِهِ، أَوْ وَلَدٍ صَالِحٍ يَدْعُو لَهُ»
                </p>
                <span className="block text-[10px] text-emerald-200/80 font-semibold pt-1">
                  [صحيح مسلم]
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container Content */}
      <div className="max-w-2xl mx-auto px-4 mt-6 space-y-6">

        {/* Action Bar: Quick Spread Buttons */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-xl border border-slate-200/80 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <Share2 size={20} />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-800 dark:text-slate-100">
                  انشر الخير وتشارك الأجر
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  بضغطة زر واحدة قد يهتدي بك شخص أو يذكر الله بسببك
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => handleShareApp()}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 active:scale-[0.98] transition-all"
            >
              <Share2 size={18} />
              <span>مشاركة التطبيق المباشر</span>
            </button>

            <button
              onClick={() => handleWhatsAppShare()}
              className="w-full py-3.5 px-4 rounded-2xl bg-emerald-700/10 dark:bg-emerald-500/20 hover:bg-emerald-700/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 font-black text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
            >
              <MessageCircle size={18} className="text-emerald-600 dark:text-emerald-400" />
              <span>إرسال عبر واتساب</span>
            </button>
          </div>

          {/* Copy Direct Link Section */}
          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200/60 dark:border-slate-800 gap-2">
            <div className="text-xs font-mono text-slate-600 dark:text-slate-300 truncate dir-ltr select-all">
              {getAppShareUrl()}
            </div>
            <button
              onClick={() => copyToClipboard(getAppShareUrl(), 'link')}
              className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-emerald-500 hover:text-white text-slate-700 dark:text-slate-200 text-xs font-bold shrink-0 transition-colors flex items-center gap-1.5"
            >
              {copiedSection === 'link' ? (
                <>
                  <Check size={14} className="text-emerald-500 dark:text-emerald-400" />
                  <span>تم النسخ</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>نسخ الرابط</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Section 2: Dedicated Reward Generator (بطاقة إهداء ثواب الصدقة الجارية) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-xl border border-slate-200/80 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
              <Gift size={20} />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-800 dark:text-slate-100">
                تخصيص وإهداء ثواب الصدقة الجارية
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                اكتب اسمك أو اسم والديك أو فقيدك لتوليد بطاقة إهداء ومشاركتها
              </p>
            </div>
          </div>

          {/* Dedicated Input Form */}
          <div className="space-y-3 pt-1">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                نوع الإهداء والنية:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'deceased', label: 'روح متوفى' },
                  { id: 'parents', label: 'الوالدين' },
                  { id: 'self', label: 'النفس والأهل' },
                  { id: 'general', label: 'صدقة عامة' },
                ].map(type => (
                  <button
                    key={type.id}
                    onClick={() => setDedicationType(type.id as any)}
                    className={cn(
                      "py-2 px-2.5 rounded-xl text-xs font-bold border transition-all text-center",
                      dedicationType === type.id
                        ? "bg-amber-500/15 border-amber-500 text-amber-700 dark:text-amber-300 shadow-sm"
                        : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                    )}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                الاسم أو الإهداء المقترن بالنية:
              </label>
              <input
                type="text"
                value={dedicationName}
                onChange={(e) => setDedicationName(e.target.value)}
                placeholder="مثال: المرحوم عبد الله بن أحمد / أبي وأمي الغاليين"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>

            {/* Render Digital Card Preview */}
            <div className="mt-4 p-5 rounded-3xl bg-gradient-to-br from-amber-950 via-stone-900 to-slate-950 text-amber-100 border border-amber-500/30 shadow-2xl relative overflow-hidden space-y-3 text-center">
              <div 
                className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none" 
                style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/arabesque.png')" }} 
              />
              <div className="relative z-10 space-y-2">
                <div className="inline-block px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-[10px] font-black text-amber-300">
                  {getDedicationTitle()}
                </div>

                <h3 className="text-lg font-black text-white drop-shadow">
                  {dedicationName.trim() ? dedicationName : 'إهداء صدقة جارية'}
                </h3>

                <p className="text-xs text-amber-200/90 leading-relaxed max-w-md mx-auto italic font-semibold">
                  «اللهم اجعل كل تلاوة وذكر ودعاء ينبع من هذا التطبيق صدقةً جارية ونوراً في ميزان حسنات صاحبه وكل من ساهم في نشره.»
                </p>

                <div className="pt-2 text-[10px] text-amber-300/70 font-bold border-t border-amber-500/20">
                  تطبيق زاد المؤمن • صدقة جارية لله تعالى
                </div>
              </div>
            </div>

            {/* Share Dedication Card Button */}
            <button
              onClick={() => {
                const nameText = dedicationName.trim() ? `عن: ${dedicationName}` : '';
                const message = `🌱 *بطاقة إهداء ثواب صدقة جارية*\n\nنسأل الله تعالى أن يجعل هذا العمل المبارك وحفظ القرآن والأذكار صدقةً جارية ${nameText}.\n\nشاركونا الأجر عبر تطبيق زاد المؤمن:\n${getAppShareUrl()}`;
                handleShareApp(message);
              }}
              className="w-full py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-600/20 active:scale-[0.98] transition-all mt-2"
            >
              <Send size={16} />
              <span>مشاركة بطاقة الإهداء مع الأهل والأصدقاء</span>
            </button>
          </div>
        </div>

        {/* Section 3: Pillars of Sadaqah Jariyah in the App (ركائز الصدقة الجارية في التطبيق) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-xl border border-slate-200/80 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/10 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-500/20">
              <Award size={20} />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-800 dark:text-slate-100">
                كيف يتحول تطبيقك لصدقة جارية مستمرة؟
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                أعمال بسيطة مضاعفة الأجر يمكنك القيام بها يومياً
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            {[
              {
                icon: BookOpen,
                color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
                title: 'تلاوة وسماع القرآن',
                desc: 'كل حرف يُقرأ أو يُسمع في التطبيق يكتب لك به عشر حسنات، وتتسع الدائرة مع كل مستمع جديد.'
              },
              {
                icon: Volume2,
                color: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
                title: 'نشر الأذكار والرقية الشرعية',
                desc: 'مشاركة أذكار الصباح والمساء والرقية الشرعية للتحصين يورثك أجر المعين على الخير.'
              },
              {
                icon: Users,
                color: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20',
                title: 'تعليم الناشئة والأهل',
                desc: 'تثبيت التطبيق في هواتف أطفالك وأهلك يعود عليك بحسنات استمرار ذكرهم لله.'
              },
              {
                icon: ShieldCheck,
                color: 'bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/20',
                title: 'تطوع بالدعاء والملاحظات',
                desc: 'دعاؤك لجميع القائمين والمستفيدين، وإرسال ملاحظاتك يساهم في تحسين الخدمة لوجه الله.'
              }
            ].map((pillar, idx) => (
              <div 
                key={idx}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 space-y-2 text-right"
              >
                <div className="flex items-center gap-2.5">
                  <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center border", pillar.color)}>
                    <pillar.icon size={18} />
                  </div>
                  <h3 className="text-sm font-black text-slate-800 dark:text-slate-200">
                    {pillar.title}
                  </h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {pillar.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Practical Ideas for Ongoing Charity (أفكار عملية لربط الصدقة الجارية) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-xl border border-slate-200/80 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-500/20">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-800 dark:text-slate-100">
                مقترحات عملية لنشر الصدقة الجارية
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                خطوات مجربة لرفع الأثر ونشر النفع في مجتمعك
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {[
              {
                num: '1',
                title: 'إنشاء مجموعة أذكار عائلية',
                text: 'أنشئ مجموعة واتساب أو تلغرام عائلية وشارك فيها رابط أذكار الصباح والمساء يومياً.'
              },
              {
                num: '2',
                title: 'تثبيت التطبيق لكبار السن في العائلة',
                text: 'ساعد الوالدين وكبار السن في تثبيت التطبيق وتفعيل خاصية الأذكار الصوتية السهلة.'
              },
              {
                num: '3',
                title: 'طباعة رمز QR أو كود التطبيق',
                text: 'وضع رابط التطبيق في المصليات أو المكتبات لتسهيل الوصول للأذكار والقرآن.'
              },
              {
                num: '4',
                title: 'احتساب النية في كل مشاركة',
                text: 'استحضر نية الصدقة الجارية والنور الدائم عند إرسال أي رابط قرآني أو محاضرة علمية.'
              }
            ].map((idea, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/40 dark:border-slate-800/80">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                  {idea.num}
                </span>
                <div>
                  <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 mb-0.5">
                    {idea.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {idea.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 5: Pledge of Zero Ads & Full Dedication */}
        <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 rounded-3xl p-6 text-white border border-emerald-500/30 shadow-2xl space-y-3 text-center relative overflow-hidden">
          <div 
            className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none" 
            style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/arabesque.png')" }} 
          />
          <div className="relative z-10 space-y-2">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-400/30">
              <HandHeart size={24} />
            </div>

            <h3 className="text-lg font-black text-white">
              عهد وإخلاص لوجه الله
            </h3>

            <p className="text-xs text-emerald-100/90 leading-relaxed max-w-md mx-auto font-medium">
              هذا التطبيق مجاني بالكامل، خالٍ تماماً من الإعلانات التجارية المزعجة، مصمم ليكون خادماً لكتاب الله وسنة نبيه ﷺ، يبتغى به وجه الله والدار الآخرة.
            </p>

            <div className="pt-3">
              <button
                onClick={() => navigate('/')}
                className="px-6 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs transition-colors shadow-lg"
              >
                العودة للشاشة الرئيسية
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Welcome Modal Popup if triggered */}
      <AnimatePresence>
        {isWelcomeModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-emerald-500/30 relative overflow-hidden space-y-4"
            >
              <button
                onClick={() => setIsWelcomeModalOpen(false)}
                className="absolute top-4 left-4 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
                  <HandHeart size={26} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    أهلاً بك في مشروع الصدقة الجارية
                  </h3>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                    عملٌ خالص لوجه الله تعالى
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                تطبيق زاد المؤمن مصمم ليكون صدقة جارية ونوراً في الميزان لكل من قرأ، وذكر، أو ساهم في نشره.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => {
                    setIsWelcomeModalOpen(false);
                    handleShareApp();
                  }}
                  className="flex-1 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg"
                >
                  <Share2 size={16} />
                  <span>مشاركة الخير الآن</span>
                </button>

                <button
                  onClick={() => setIsWelcomeModalOpen(false)}
                  className="py-3 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200"
                >
                  استكشاف المشروع
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
