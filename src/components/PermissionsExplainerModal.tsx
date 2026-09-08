import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Bell, Volume2, HardDrive, ShieldCheck, X, CheckCircle } from 'lucide-react';
import { useAppContext } from '../AppContext';

interface PermissionsExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PermissionsExplainerModal: React.FC<PermissionsExplainerModalProps> = ({ isOpen, onClose }) => {
  const { settings } = useAppContext();
  const isRTL = settings.appLanguage !== 'en' && settings.appLanguage !== 'fr';

  if (!isOpen) return null;

  const permissionsList = [
    {
      id: 'location',
      icon: <MapPin size={22} className="text-emerald-400" />,
      title: isRTL ? 'إذن الموقع الجغرافي (Location)' : 'Location Permission',
      badge: isRTL ? 'مواقيت الصلاة والقبلة' : 'Prayer Times & Qibla',
      purpose: isRTL 
        ? 'يُستخدم حصرياً لحساب مواقيت الصلاة بدقة فلكية حسب إحداثيات مدينتك وتحديد زاوية اتجاه القبلة عبر البوصلة.'
        : 'Used exclusively to calculate accurate astronomical prayer times for your city and determine the Qibla compass angle.',
      privacyNote: isRTL
        ? 'لا نقوم بتتبع موقعك، ولا يتم تخزينه أو إرساله إلى أي خادم خارجي.'
        : 'We never track, record, or transmit your location to any external servers.'
    },
    {
      id: 'notifications',
      icon: <Bell size={22} className="text-amber-400" />,
      title: isRTL ? 'إذن الإشعارات والتنبيهات (Notifications)' : 'Notification Permission',
      badge: isRTL ? 'الأذان والأذكار' : 'Adhan & Reminders',
      purpose: isRTL 
        ? 'لإرسال تنبيهات الأذان عند دخول أوقات الصلاة، والتذكير بأذكار الصباح والمساء والورد اليومي.'
        : 'To send gentle adhan notifications when prayer times arrive, along with morning/evening adhkar reminders.',
      privacyNote: isRTL
        ? 'التنبيهات تعمل برمجياً على جهازك وخالية تماماً من الإعلانات الترويجية أو التتبع.'
        : 'All notifications are generated locally on your device without any ads or marketing tracking.'
    },
    {
      id: 'audio',
      icon: <Volume2 size={22} className="text-teal-400" />,
      title: isRTL ? 'الصوت والتغذية اللمسية (Audio & Haptics)' : 'Audio & Haptics',
      badge: isRTL ? 'التلاوة والتسبيح' : 'Recitation & Tasbih',
      purpose: isRTL
        ? 'لتشغيل تلاوة القرآن الكريم والأدعية وصوت نقرات المسبحة والاهتزاز اللمسي لتسبيح سهل دون النظر للشاشة.'
        : 'To play Quran recitations, supplications, and provide gentle haptic feedback during tasbih counting.',
      privacyNote: isRTL
        ? 'تعمل التغذية اللمسية مباشرة عبر حساسات جهازك.'
        : 'Operates directly through your device sensors with zero data retention.'
    },
    {
      id: 'storage',
      icon: <HardDrive size={22} className="text-blue-400" />,
      title: isRTL ? 'التخزين المحلي الآمن (Local Storage)' : 'Local Storage',
      badge: isRTL ? 'العمل دون إنترنت' : 'Offline Support',
      purpose: isRTL
        ? 'لحفظ إحصائيات التسبيح، وآخر آية وقفت عندها في المصحف، وصفحات التفسير لتعمل بكفاءة دون اتصال بالإنترنت.'
        : 'To store your tasbih statistics, last read Quran ayah, and cached interpretations for full offline access.',
      privacyNote: isRTL
        ? 'تظل بياناتك ملكك وحدك ومحفوظة بأمان في ذاكرة جهازك.'
        : 'All saved progress remains on your device under your complete control.'
    }
  ];

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          className="relative w-full max-w-lg bg-slate-900 border border-teal-500/30 rounded-3xl p-5 sm:p-6 shadow-2xl shadow-teal-950/40 text-white overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Decorative glow */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-500/20 text-teal-400 border border-teal-500/30 rounded-2xl flex items-center justify-center">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-white">
                  {isRTL ? 'الشفافية وسياسة الأذونات' : 'Permissions & Privacy Disclosure'}
                </h3>
                <p className="text-[11px] font-bold text-teal-300/80">
                  {isRTL ? 'معايير الخصوصية والأمان لمتجر التطبيقات' : 'App Store Privacy & Security Standards'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="overflow-y-auto py-4 space-y-3.5 flex-1 pr-1 pl-1">
            <p className="text-xs text-slate-300 leading-relaxed font-bold">
              {isRTL
                ? 'تطبيق "أذكار المؤمن" صُمم ليكون تطبيقاً آمناً ومجانياً بالكامل لوجه الله تعالى، ولا نطلب إلا الأذونات التقنية الضرورية لخدمتك بدقة:'
                : 'Believer Athkar is built to be a safe, privacy-first companion. We only request system permissions strictly necessary to deliver accurate services:'}
            </p>

            <div className="space-y-3">
              {permissionsList.map((item) => (
                <div 
                  key={item.id} 
                  className="p-3.5 bg-slate-800/80 rounded-2xl border border-white/5 space-y-2 hover:border-teal-500/30 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center">
                        {item.icon}
                      </div>
                      <span className="text-xs sm:text-sm font-black text-white">{item.title}</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20">
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed font-bold">
                    {item.purpose}
                  </p>
                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold bg-emerald-950/30 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                    <CheckCircle size={12} className="shrink-0" />
                    <span>{item.privacyNote}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-white/10 shrink-0">
            <button
              onClick={onClose}
              className="w-full py-3 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-teal-950/50 transition-all cursor-pointer"
            >
              {isRTL ? 'فهمت ذلك، واستمر' : 'Got it, Continue'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
