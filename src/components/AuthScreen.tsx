
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AlertCircle,
  Loader2,
  ShieldCheck
} from 'lucide-react';
import { useAppContext } from '../AppContext';
import { useTranslation } from '../i18n';
import { auth } from '../firebase';
import { 
  GoogleAuthProvider,
  signInWithPopup,
  signOut
} from 'firebase/auth';
import { userService } from '../services/userService';

const DISPOSABLE_DOMAINS = ["tempmail.com","10minutemail.com","throwawaymail.com","mailinator.com","guerrillamail.com","yopmail.com","temp-mail.org","tempmail.net","dispostable.com","mailcatch.com","getnada.com","maildrop.cc"];

export const AuthScreen: React.FC = () => {
  const { settings } = useAppContext();
  const { t, isRtl } = useTranslation(settings.appLanguage);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const localT = {
    title: settings.appLanguage === 'ar' ? 'مرحباً بك في تطبيق أذكار المؤمن' : 'Welcome to Athkar Believer',
    subtitle: settings.appLanguage === 'ar' ? 'سجل دخولك للاستفادة من كافة ميزات التطبيق وحفظ تقدمك.' : 'Sign in to access all features and save your progress.',
    googleBtn: settings.appLanguage === 'ar' ? 'المتابعة بواسطة Google' : 'Continue with Google',
    fakeEmailError: settings.appLanguage === 'ar' ? 'عذراً، لا يمكن استخدام البريد الإلكتروني المؤقت أو المهمل. يرجى استخدام بريد حقيقي ومفعل.' : 'Sorry, disposable emails are not allowed. Please use a real and verified email.',
    generalError: settings.appLanguage === 'ar' ? 'حدث خطأ أثناء تسجيل الدخول. تأكد من اتصالك بالإنترنت.' : 'An error occurred during sign in. Check your internet connection.'
  };

  const handleGoogleAuth = async () => {
    try {
      setError(null);
      setIsLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      const email = result.user.email;
      if (email) {
        const domain = email.split('@')[1]?.toLowerCase();
        if (domain && DISPOSABLE_DOMAINS.includes(domain)) {
          await signOut(auth);
          setError(localT.fakeEmailError);
          setIsLoading(false);
          return;
        }
      }
      
      // Update user profile in Firestore
      // User profile is synced via AppContext upon authentication
      
    } catch (err: any) {
      console.error('Google Auth Error:', err);
      if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
        setError(localT.generalError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full min-h-0 bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="absolute inset-0 bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-950 pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/images/arabesque.png')] opacity-[0.03] dark:opacity-[0.05] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 1, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-8 relative z-10 text-center"
      >
        <div className="w-20 h-20 bg-teal-50 dark:bg-teal-900/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <ShieldCheck className="w-10 h-10 text-teal-600 dark:text-teal-400" />
        </div>

        <h1 className="text-2xl font-black text-slate-800 dark:text-white mb-3 tracking-tight">
          {localT.title}
        </h1>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
          {localT.subtitle}
        </p>

        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-xs font-bold flex items-start gap-3 text-start border border-red-100 dark:border-red-900/30"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={handleGoogleAuth}
          disabled={isLoading}
          className="w-full py-4 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-[0.98] disabled:opacity-50 text-slate-700 dark:text-slate-200 font-black text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-3"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
          ) : (
            <>
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" width="24" height="24">
                <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582l3.51-3.51C17.642 1.091 14.974 0 12 0 7.354 0 3.307 2.67 1.242 6.56l4.024 3.205z" />
                <path fill="#34A853" d="M16.04 15.345c-1.012.682-2.316 1.118-4.04 1.118a7.042 7.042 0 0 1-6.716-4.827L1.226 14.83A11.954 11.954 0 0 0 12 24c3.153 0 6.012-1.033 8.13-2.82l-4.09-3.835z" />
                <path fill="#4285F4" d="M23.49 12.275c0-.825-.075-1.62-.212-2.385H12v4.51h6.47c-.28 1.48-1.12 2.73-2.38 3.58l4.09 3.835c2.39-2.2 3.77-5.45 3.77-9.54z" />
                <path fill="#FBBC05" d="M5.284 14.29a7.006 7.006 0 0 1-.375-2.29c0-.8.13-1.58.375-2.29L1.26 6.505A11.95 11.95 0 0 0 0 12c0 2.01.5 3.9 1.26 5.514l4.024-3.224z" />
              </svg>
              <span>{localT.googleBtn}</span>
            </>
          )}
        </button>

        <p className="mt-6 text-[10px] font-bold text-slate-400 dark:text-slate-500">
          {settings.appLanguage === 'ar' 
            ? 'بمتابعتك، أنت توافق على شروط الخدمة وتؤكد أن بريدك الإلكتروني حقيقي ومفعل.' 
            : 'By continuing, you agree to the Terms of Service and confirm your email is real and active.'}
        </p>
      </motion.div>
    </div>
  );
};
export default AuthScreen;
