import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  MessageSquare, 
  Bug, 
  Lightbulb, 
  HelpCircle, 
  Heart, 
  Mail, 
  CheckCircle2, 
  Copy, 
  Smartphone, 
  Globe, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  MessageCircle, 
  LifeBuoy, 
  Share2, 
  AlertCircle
} from 'lucide-react';
import { BackButton } from './ui/BackButton';
import { useAppContext } from '../AppContext';
import { useTranslation } from '../i18n';
import { cn } from '../lib/utils';
import { useSmartNavigation } from '../lib/navigation';
import { safeLocalStorageGetItem, safeLocalStorageSetItem, safeLocalStorageRemoveItem } from "../utils/storage";

export type ContactCategory = 'bug' | 'suggestion' | 'inquiry' | 'appreciation';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

export const ContactUs: React.FC = () => {
  const { settings } = useAppContext();
  const { t, isRtl } = useTranslation(settings.appLanguage);
  const { goBack } = useSmartNavigation();

  // Form states
  const [category, setCategory] = useState<ContactCategory>('suggestion');
  const [name, setName] = useState(settings.userName || '');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<'normal' | 'high' | 'urgent'>('normal');
  const [includeSystemInfo, setIncludeSystemInfo] = useState(true);

  // Status & Feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [referenceCode, setReferenceCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Auto detect system info
  const systemInfo = {
    appVersion: `${__APP_VERSION__} (أذكار المؤمن)`,
    platform: typeof window !== 'undefined' ? window.navigator.platform : 'Unknown',
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Unknown',
    language: settings.appLanguage,
    screenSize: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'Unknown',
  };

  const handleCopyFormattedReport = () => {
    const formatted = `=== رسالة تواصل - أذكار المؤمن ===
التصنيف: ${category === 'bug' ? 'إبلاغ عن عطل' : category === 'suggestion' ? 'اقتراح تحسين' : category === 'inquiry' ? 'استفسار عام' : 'كلمة شكر'}
الاسم: ${name || 'غير محدد'}
البريد: ${email || 'غير محدد'}
الموضوع: ${subject || 'بدون عنوان'}
الأهمية: ${priority}

نص الرسالة:
${message}

${includeSystemInfo ? `--- معلومات النظام ---
التطبيق: ${systemInfo.appVersion}
النظام: ${systemInfo.platform}
الشاشة: ${systemInfo.screenSize}
اللغة: ${systemInfo.language}
النسبة: ${systemInfo.userAgent}` : ''}`;

    navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);

    // Generate a reference ticket code
    const code = 'ZAD-' + Math.floor(100000 + Math.random() * 900000);

    setTimeout(() => {
      // Save feedback locally
      const existingFeedbacks = JSON.parse(safeLocalStorageGetItem('zad_user_feedbacks') || '[]');
      const newFeedback = {
        id: code,
        category,
        name,
        email,
        subject,
        message,
        priority,
        systemInfo: includeSystemInfo ? systemInfo : null,
        date: new Date().toISOString(),
      };
      safeLocalStorageSetItem('zad_user_feedbacks', JSON.stringify([newFeedback, ...existingFeedbacks]));

      setIsSubmitting(false);
      setReferenceCode(code);
      setSubmitted(true);
    }, 900);
  };

  const handleOpenMailClient = () => {
    const catTitle = category === 'bug' ? 'إبلاغ عن عطل' : category === 'suggestion' ? 'اقتراح جديد' : category === 'inquiry' ? 'استفسار' : 'رسالة تقدير';
    const mailSubject = encodeURIComponent(`[تطبيق أذكار المؤمن] ${catTitle}: ${subject || 'ملاحظة جديدة'}`);
    const mailBody = encodeURIComponent(`الاسم: ${name}
البريد: ${email}
التصنيف: ${catTitle}
الأهمية: ${priority}

نص الرسالة:
${message}

${includeSystemInfo ? `\n--- معلومات الجهاز والبيئة ---\nالتطبيق: ${systemInfo.appVersion}\nالمتصفح/النظام: ${systemInfo.userAgent}\nالشاشة: ${systemInfo.screenSize}` : ''}`);

    window.open(`mailto:support@zad-believer.app?subject=${mailSubject}&body=${mailBody}`, '_blank', 'noopener,noreferrer');
  };

  const faqs: FAQItem[] = [
    {
      question: t('faq_q1', 'كيف يمكنني الاستفادة من قراءة القرآن والسور بدون إنترنت؟'),
      answer: t('faq_a1', 'يمكنك الانتقال إلى قسم القرآن الكريم والنقر على أيقونة التحميل بجانب السورة لتخزينها في IndexedDB محلياً على جهازك والوصول إليها بدون اتصال.'),
      category: 'quran'
    },
    {
      question: t('faq_q2', 'كيف أستعيد أذكاري وتفضيلاتي إذا غيرت هاتف؟'),
      answer: t('faq_a2', 'يمكنك تسجيل الدخول بأسلوب آمن أو الذهاب إلى قسم الإعدادات -> إدارة النسخ الاحتياطي وحفظ نسخة احتياطية من كافة أذكارك وإنجازاتك لاستعادتها في أي وقت.'),
      category: 'backup'
    },
    {
      question: t('faq_q3', 'ما العمل إذا لم تعمل تنبيهات أوقات الصلاة والأذكار؟'),
      answer: t('faq_a3', 'تأكد من إعطاء الإذن بالتنبيهات من إعدادات الهاتف، وكذلك إيقاف تحسين البطارية للتطبيق لضمان عمل الأذان في موعده الدقيق.'),
      category: 'notifications'
    },
    {
      question: t('faq_q4', 'هل التطبيق مجاني بالكامل وبدون إعلانات؟'),
      answer: t('faq_a4', 'نعم، تطبيق أذكار المؤمن تطبيق إسلامي غير ربحي خالي تماماً من الإعلانات ليكون زاداً خالصاً للعبد المؤمن.'),
      category: 'general'
    }
  ];

  return (
    <div className="min-h-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col pb-12" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Top Bar Header */}
      <div className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <BackButton onClick={goBack} />
          <div>
            <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>{t('contact_us_title', 'اتصل بنا')}</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                {t('tech_support', 'الدعم الفني')}
              </span>
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">{t('contact_subtitle', 'يسعدنا التواصل معك واستقبال ملحوظاتك واقتراحاتك')}</p>
          </div>
        </div>
        <div className="w-9 h-9 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
          <LifeBuoy size={18} />
        </div>
      </div>

      <div className="max-w-2xl w-full mx-auto px-4 pt-5 space-y-6">
        
        {/* Banner Card */}
        <motion.div 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-900 text-white p-5 shadow-lg border border-emerald-500/30"
        >
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 flex items-start gap-3">
            <div className="p-2.5 bg-white/15 rounded-xl backdrop-blur-md shrink-0">
              <Sparkles className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-black mb-1">{t('feedback_banner_title', 'صوتك يهمنا لتطوير التطبيق')}</h2>
              <p className="text-xs text-emerald-100/90 leading-relaxed">
                {t('feedback_banner_desc', 'نعمل باستمرار على تحسين وتطوير تطبيق "أذكار المؤمن". إذا واجهتك أي مشكلة برمجية أو كان لديك اقتراح لإضافة ميزة جديدة، نسعد بتواصلك معنا.')}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Quick Contact Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          <button 
            onClick={() => window.open('mailto:support@zad-believer.app', '_blank', 'noopener,noreferrer')}
            className={cn(
              "flex items-center gap-2.5 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 shadow-sm transition-all group",
              isRtl ? "text-right" : "text-left"
            )}
          >
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Mail size={16} />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200">{t('direct_email', 'البريد المباشر')}</div>
              <div className="text-[9px] text-slate-400 truncate">support@zad...</div>
            </div>
          </button>

          <button 
            onClick={() => window.open('https://t.me', '_blank', 'noopener,noreferrer')}
            className={cn(
              "flex items-center gap-2.5 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 shadow-sm transition-all group",
              isRtl ? "text-right" : "text-left"
            )}
          >
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <MessageCircle size={16} />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200">{t('support_telegram', 'الدعم عبر تلغرام')}</div>
              <div className="text-[9px] text-slate-400 truncate">@ZadSupportBot</div>
            </div>
          </button>

          <button 
            onClick={() => window.open('https://wa.me', '_blank', 'noopener,noreferrer')}
            className={cn(
              "col-span-2 sm:col-span-1 flex items-center gap-2.5 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 shadow-sm transition-all group",
              isRtl ? "text-right" : "text-left"
            )}
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Smartphone size={16} />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200">{t('support_whatsapp', 'محادثة واتساب')}</div>
              <div className="text-[9px] text-slate-400 truncate">{t('fast_direct_support', 'دعم سريع مباشر')}</div>
            </div>
          </button>
        </div>

        {/* Contact Form Container */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          {submitted ? (
            <AnimatePresence>
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6 space-y-4"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
                  <CheckCircle2 size={36} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">{t('feedback_received_success', 'تم استلام رسالتك بنجاح!')}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                    {t('feedback_success_desc', 'جزاك الله خيراً على تواصلك. تم حفظ تذكرتك وسيتم مراجعتها من قبل الفريق الفني في أقرب وقت.')}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60 max-w-xs mx-auto text-xs">
                  <span className="text-slate-400 block mb-0.5">{t('reference_number', 'رقم المرجعية:')}</span>
                  <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">{referenceCode}</span>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  <button
                    onClick={handleOpenMailClient}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                  >
                    <Mail size={14} />
                    <span>{t('send_via_email_app', 'إرسال عبر تطبيق البريد أيضاً')}</span>
                  </button>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setMessage('');
                      setSubject('');
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all"
                  >
                    {t('send_another_message', 'إرسال رسالة أخرى')}
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <MessageSquare size={16} className="text-emerald-600 dark:text-emerald-400" />
                  <span>{t('direct_contact_form', 'نموذج التواصل المباشر')}</span>
                </h3>
                <span className="text-[10px] text-slate-400 font-medium">{t('fast_reply_24h', 'رد سريع خلال 24 ساعة')}</span>
              </div>

              {/* Category Selector Tabs */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">{t('feedback_type_label', 'نوع الملاحظة:')}</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'suggestion', label: t('feature_suggestion', 'اقتراح ميزة'), icon: Lightbulb, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
                    { id: 'bug', label: t('report_issue', 'إبلاغ عن مشكلة'), icon: Bug, color: 'text-rose-500 bg-rose-500/10 border-rose-500/20' },
                    { id: 'inquiry', label: t('general_inquiry', 'استفسار عام'), icon: HelpCircle, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
                    { id: 'appreciation', label: t('thank_you_word', 'كلمة شكر'), icon: Heart, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isSelected = category === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setCategory(tab.id as ContactCategory)}
                        className={cn(
                          "flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-bold transition-all gap-1.5",
                          isSelected
                            ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 shadow-sm"
                            : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                        )}
                      >
                        <Icon size={18} className={isSelected ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'} />
                        <span className="text-[11px]">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Input Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t('your_name_label', 'الاسم الكريم:')}</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('name_placeholder', 'مثال: عبد الله بن أحمد')}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t('reply_email_label', 'البريد الإلكتروني للرد:')}</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('email_placeholder', 'example@mail.com')}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none transition-all dir-ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t('subject_title_label', 'عنوان الموضوع:')}</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={t('subject_placeholder', 'عنوان ملخص لرسالتك')}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none transition-all"
                />
              </div>

              {/* Priority Selector for Bugs */}
              {category === 'bug' && (
                <div className="p-3 bg-rose-500/5 border border-rose-500/20 rounded-xl space-y-1.5">
                  <label className="block text-xs font-bold text-rose-700 dark:text-rose-400">{t('priority_level_label', 'مستوى الأهمية والتأثير:')}</label>
                  <div className="flex items-center gap-2">
                    {[
                      { id: 'normal', label: t('priority_normal', 'عادي / بسيط') },
                      { id: 'high', label: t('priority_high', 'متوسط') },
                      { id: 'urgent', label: t('priority_urgent', 'عاجل / يمنع الاستخدام') },
                    ].map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPriority(p.id as any)}
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border",
                          priority === p.id
                            ? "bg-rose-500 text-white border-rose-600 shadow-sm"
                            : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                        )}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Message Textarea */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t('message_body_label', 'نص الملاحظة أو التقرير')} <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400">{message.length} {t('char_count', 'حرف')}</span>
                </div>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={category === 'bug' ? t('bug_placeholder', 'يرجى كتابة خطوات تكرار المشكلة وماذا ظهر على الشاشة...') : t('suggestion_placeholder', 'اكتب رسالتك أو اقتراحك بالتفصيل هنا...')}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none transition-all leading-relaxed"
                />
              </div>

              {/* System Info Toggle */}
              <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div className="text-[11px]">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">{t('attach_device_info', 'إرفاق معلومات البيئة والجهاز')}</span>
                    <span className="text-[9px] text-slate-400 block">{t('attach_device_info_desc', 'يساعد الفريق الفني على تشخيص المشكلة بدقة متناهية')}</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={includeSystemInfo}
                  onChange={(e) => setIncludeSystemInfo(e.target.checked)}
                  className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !message.trim()}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span>{t('sending_state', 'جاري الإرسال...')}</span>
                  ) : (
                    <>
                      <Send size={15} />
                      <span>{t('send_feedback_now', 'إرسال الملاحظة الآن')}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleCopyFormattedReport}
                  className="py-3 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all flex items-center gap-1.5 shrink-0"
                  title={t('copy_report_clipboard', 'نسخ التقرير إلى الحافظة')}
                >
                  <Copy size={15} />
                  <span>{copied ? t('copied_exclamation', 'تم النسخ!') : t('copy_text', 'نسخ النص')}</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Frequently Asked Questions (FAQ Section) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <HelpCircle size={18} className="text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-black text-slate-900 dark:text-white">{t('faq_title', 'الأسئلة الشائعة والإجابات السريعة')}</h3>
          </div>

          <div className="space-y-2">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div 
                  key={index}
                  className="border border-slate-200/60 dark:border-slate-800 rounded-xl overflow-hidden transition-all bg-slate-50/50 dark:bg-slate-800/30"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className={cn(
                      "w-full p-3 flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors",
                      isRtl ? "text-right" : "text-left"
                    )}
                  >
                    <span>{faq.question}</span>
                    {isOpen ? <ChevronUp size={16} className="text-emerald-600 shrink-0" /> : <ChevronDown size={16} className="text-slate-400 shrink-0" />}
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className={cn(
                          "px-3 pb-3 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-200/40 dark:border-slate-800/60 pt-2",
                          isRtl ? "text-right" : "text-left"
                        )}
                      >
                        {faq.answer}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {/* App Meta Details */}
        <div className="text-center text-[10px] text-slate-400 space-y-1 pt-2">
          <p>{t('app_rights_all_muslims', 'تطبيق أذكار المؤمن • جميع الحقوق محفوظة لجميع المسلمين')}</p>
          <p className="dir-ltr font-mono text-[9px] text-slate-400/80">Version {__APP_VERSION__} • Build {systemInfo.platform}</p>
        </div>

      </div>
    </div>
  );
};

export default ContactUs;
