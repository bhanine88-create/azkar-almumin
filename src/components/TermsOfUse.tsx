import React, { useEffect, useState } from 'react';
import { ArrowRight, Shield, FileText, CheckCircle2, Lock, Smartphone, RefreshCw, AlertTriangle, UserCheck, HeartHandshake, Trash2, KeyRound, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { AccountDeletionModal } from './AccountDeletionModal';
import { PermissionsExplainerModal } from './PermissionsExplainerModal';

const termsItems = [
  {
    id: 1,
    title: 'قبول الشروط',
    desc: 'باستخدامك لتطبيق "أذكار المؤمن"، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق، يرجى التوقف عن استخدام التطبيق.',
    icon: <UserCheck size={24} className="text-emerald-500" />
  },
  {
    id: 2,
    title: 'استخدام التطبيق والترخيص',
    desc: 'يُمنح التطبيق كعمل إسلامي خيري مجاني بالكامل بدون إعلانات للاستخدام الشخصي غير التجاري ابتغاء الأجر والثواب.',
    icon: <Smartphone size={24} className="text-blue-500" />
  },
  {
    id: 3,
    title: 'المحتوى الديني والمصادر',
    desc: 'نحرص أشد الحرص على تدقيق الآيات الكريمة والأحاديث والأذكار من أمهات المصادر المعتمدة الموثوقة (كصحيحي البخاري ومسلم وسنن أبي داود والترمذي).',
    icon: <FileText size={24} className="text-amber-500" />
  },
  {
    id: 4,
    title: 'تحديث المحتوى والخدمات',
    desc: 'نحتفظ بالحق في تحسين وتطوير وتحديث خدمات التطبيق وإضافة ميزات دينية نافعة للمسلمين بصفة دورية ومستمرة.',
    icon: <RefreshCw size={24} className="text-purple-500" />
  },
  {
    id: 5,
    title: 'إخلاء المسؤولية التقنية',
    desc: 'يتم احتساب مواقيت الصلاة والقبلة بالحسابات الفلكية الدقيقة وفق المعايير المعمول بها دولياً، ويُنصح بالاستئناس بأذان المسجد المحلي.',
    icon: <AlertTriangle size={24} className="text-rose-500" />
  }
];

const privacyItems = [
  {
    id: 1,
    title: 'عدم تتبع أو بيع البيانات الشخصية',
    desc: 'نحترم خصوصيتك بشكل مطلق. التطبيق خالٍ من أي حزم تتبع إعلاني، ولا نقوم ببيع أو مشاركة أي بيانات شخصية مع أي جهات خارجية إطلاقاً.',
    icon: <Shield size={24} className="text-teal-500" />
  },
  {
    id: 2,
    title: 'التخزين المحلي والأمان',
    desc: 'كافة بياناتك (أعداد التسبيح، الإعدادات، تقدم الختمة) تُحفظ بأمان داخل الذاكرة المحلية لجهازك، وتعمل بسلاسة تامة دون الحاجة لشبكة الإنترنت.',
    icon: <Lock size={24} className="text-slate-500" />
  },
  {
    id: 3,
    title: 'الشفافية في طلب الأذونات',
    desc: 'الأذونات محددة بدقة: إذن الموقع لحساب مواقيت الصلاة وزاوية القبلة، وإذن الإشعارات لأوقات الأذان والأذكار، دون أي انتهاك للخصوصية.',
    icon: <HeartHandshake size={24} className="text-pink-500" />
  },
  {
    id: 4,
    title: 'الحق في حذف الحساب ومسح البيانات',
    desc: 'وفقاً لسياسات Google Play وApple App Store، يحق لك في أي وقت مسح كافة بياناتك أو حذف حسابك السحابي نهائياً وبشكل فوري عبر زر الحذف المخصص.',
    icon: <Trash2 size={24} className="text-rose-500" />
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
};

export const TermsOfUse: React.FC = () => {
  const navigate = useNavigate();
  const [showDeletionModal, setShowDeletionModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 w-full font-sans" dir="rtl">
      {/* Modern Sticky Header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="flex items-center justify-between p-4 max-w-3xl mx-auto">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <ArrowRight size={20} className="rotate-180" />
            </button>
            <h1 className="text-xl font-black text-slate-800 dark:text-white">شروط الاستخدام والخصوصية</h1>
          </div>
          <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
            <FileText size={20} className="text-teal-600 dark:text-teal-400" />
          </div>
        </div>
      </header>
      
      <main className="p-4 sm:p-6 max-w-3xl mx-auto space-y-10 mt-4">
        {/* Intro Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="w-20 h-20 mx-auto bg-gradient-to-tr from-teal-500 to-emerald-400 rounded-3xl flex items-center justify-center shadow-lg shadow-teal-500/30 mb-6 rotate-3">
            <Shield size={40} className="text-white -rotate-3" />
          </div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">الخصوصية وشروط الاستخدام</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto text-sm leading-relaxed">
            نحن نلتزم بتقديم تجربة إسلامية آمنة، شفافة، ومتوافقة تماماً مع معايير متاجر التطبيقات الرسمية (Google Play & Apple App Store).
          </p>

          {/* Quick Actions Bar */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setShowPermissionsModal(true)}
              className="px-4 py-2.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-500/30 font-black text-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <KeyRound size={16} />
              <span>استعراض شفافية الأذونات</span>
            </button>
            <button
              onClick={() => setShowDeletionModal(true)}
              className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-500/30 font-black text-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <Trash2 size={16} />
              <span>إدارة وحذف الحساب والبيانات</span>
            </button>
          </div>
        </motion.div>

        {/* Terms Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <FileText size={16} className="text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">شروط الخدمة</h3>
          </div>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid gap-4"
          >
            {termsItems.map((item) => (
              <motion.div 
                key={item.id} 
                variants={itemVariants}
                className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                    {item.icon}
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="font-bold text-slate-800 dark:text-white text-base">{item.title}</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Privacy Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
              <Shield size={16} className="text-teal-600 dark:text-teal-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">سياسة الخصوصية</h3>
          </div>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid gap-4"
          >
            {privacyItems.map((item) => (
              <motion.div 
                key={item.id} 
                variants={itemVariants}
                className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                    {item.icon}
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="font-bold text-slate-800 dark:text-white text-base">{item.title}</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Accept Button */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="pt-6"
        >
          <button 
            onClick={() => navigate(-1)}
            className="w-full flex items-center justify-center gap-3 p-4 bg-slate-800 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-700 dark:hover:bg-slate-100 rounded-2xl font-bold text-base transition-colors shadow-xl shadow-slate-200 dark:shadow-none"
          >
            <CheckCircle2 size={20} />
            <span>قرأت الشروط وموافق عليها</span>
          </button>
        </motion.div>
      </main>

      {/* Compliance Modals */}
      <PermissionsExplainerModal 
        isOpen={showPermissionsModal} 
        onClose={() => setShowPermissionsModal(false)} 
      />
      <AccountDeletionModal 
        isOpen={showDeletionModal} 
        onClose={() => setShowDeletionModal(false)} 
      />
    </div>
  );
};
